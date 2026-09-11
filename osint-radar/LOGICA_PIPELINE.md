# Lógica do pipeline Python — osint-radar

Contexto: este pipeline alimenta as páginas Radar, Grid e Dashboard do
Spec Recon (frontend React/TS em `../src`) com dados coletados de fontes
públicas — ficha técnica de veículos e ranking de vendas no Brasil. Os
scripts rodam offline/manualmente e exportam JSON estático pro frontend
consumir (não há backend/API — é um snapshot).

Existem duas "trilhas" de dados independentes:

```
Trilha 1: FICHA TÉCNICA (specs de cada veículo)
  osint_radar.py  →  funções de coleta/parse por fonte
        ↓ importado por
  build_dataset.py  →  roda o CATALOG inteiro (~140 veículos)
        ↓ ou, pra 1 veículo só
  collect_vehicle.py  →  roda 1 veículo e faz merge incremental
        ↓
  src/data/osintDiscoveries.json + osintVehicleSpecs.json

Trilha 2: VENDAS (ranking de emplacamentos por modelo)
  sales_radar.py  →  coleta ranking de 1 ano na Fenabrave (via carrolens.com.br)
        ↓ importado por
  build_sales.py  →  junta ano atual + anterior, calcula variação
        ↓
  src/data/salesRankings.json
```

---

## 1. `osint_radar.py` — motor de coleta de ficha técnica (biblioteca, não roda sozinho pro catálogo)

**Papel:** define COMO achar e ler a ficha técnica de UM veículo em cada
fonte. Não decide QUAIS veículos coletar — isso é `build_dataset.py`
(ou `collect_vehicle.py`).

**Conceito central — "fonte" (`SOURCES`):** cada fonte é um dict com 2
funções:
- `locate_*(query) -> url | None`: acha a URL da página daquele veículo
  nessa fonte.
- `parse_*(html) -> dict[campo, valor]`: extrai a ficha técnica bruta
  daquele HTML.

Isso deixa adicionar fonte nova trivial: escreve as duas funções, registra
em `SOURCES`, pronto — todo o resto do pipeline (categorização,
export, merge) já funciona pra ela.

**As 7 fontes registradas hoje:**

| Fonte | Como localiza a página | Como faz parse |
|---|---|---|
| Wikipedia | API de busca própria da Wikipedia (pt **e** en, fica com a que trouxer mais campos — `fetch_best_wikipedia`) | tabela `infobox` (padrão `<th>`+`<td>`) |
| EV Database | sitemap.xml público do site, casado por slug (`locate_evdatabase`) | tabelas de 2 colunas sem `<th>` |
| iCarros | DuckDuckGo restrito ao domínio | parser **dedicado**, validado contra HTML real: `<div class="technical-sheet-item">` com 2 `<span>` (label/valor) |
| Webmotors, Quatro Rodas, UOL Carros, Autoesporte | DuckDuckGo restrito ao domínio | `parse_br_generic_specs` — genérico, 4 estratégias em cascata (tabela th/td → tabela 2 colunas → `dl/dt/dd` → texto solto "Label: Valor") |

**Por que Wikipedia/EV Database não usam busca e as .br usam DuckDuckGo:**
Wikipedia e EV Database têm API/sitemap próprios — estável, sem
CAPTCHA. Os sites .br não, então a única opção era busca externa
(DuckDuckGo HTML, sem API key). **Isso é o ponto frágil do pipeline:**
depois de poucas dezenas de chamadas seguidas, o DuckDuckGo passa a
devolver uma página de CAPTCHA em vez de resultado. Isso é detectado
explicitamente (`_DDG_BLOCK_MARKERS` em `duckduckgo_search`) e avisado no
console — não falha silenciosamente como "página não encontrada".

**Por que o parser das 4 fontes .br genéricas é "melhor esforço":** foram
cadastradas sem conseguir inspecionar o HTML ao vivo de cada uma no
momento em que o código foi escrito. Em vez de um seletor CSS específico
(que podia estar simplesmente errado e falhar 100% silencioso), o parser
tenta 4 estruturas comuns e usa a primeira que render alguma coisa — mais
robusto a estar "aproximadamente certo", mas precisa ser conferido (olhar
quantos campos cada fonte extrai na prática).

**Depois de achar+parsear, o resto do arquivo:**
- `categorize(campo)`: bate o nome do campo contra `CATEGORY_KEYWORDS`
  (Bateria, Powertrain, Carregamento, Dimensões, Software, Aerodinâmica,
  Materiais) — mesma taxonomia que aparece no dropdown da tela Radar.
- `keyword_match` / `confidence_score`: usados só no modo CLI standalone
  (`--keywords`), pra ranquear resultado por relevância a uma busca.
- `build_rows`: transforma `{campo: valor}` em linhas de DataFrame — 1
  linha por campo, com id, fonte, categoria etc.
- `run_scan` + `main()`: modo CLI standalone (`python osint_radar.py
  --target X --model Y`), salva CSV/pickle local em `./data/` — usado pra
  testar rápido, não é o caminho que alimenta o frontend.

---

## 2. `build_dataset.py` — roda o catálogo inteiro e exporta pro frontend

**Papel:** decide QUAIS veículos coletar (`CATALOG`, ~140 entradas
`{brand, model}`) e ORQUESTRA as fontes do `osint_radar.py` pra cada um,
depois normaliza specs numéricas e exporta os 2 JSON que o frontend lê.

**`CATALOG`:** lista fixa de marca+modelo. Tem duas seções: os EVs
globais (Tesla, BYD, Hyundai...) que o EV Database cobre bem, e um bloco
"populares Brasil" (Onix, HB20, Strada, Polo...) — carros a
combustão/híbridos que o EV Database ignora (só cobre elétricos) e que a
Wikipedia em inglês documenta mal; a fonte principal pra esses é
Wikipedia PT + os sites .br.

**`scan_target(brand, model)`:** pra 1 veículo, chama Wikipedia primeiro
(tratamento especial — tenta pt+en), depois itera o resto de `SOURCES`.
Junta tudo em `per_source` (specs cru por fonte) e `rows` (formato linha,
vai pro `osintDiscoveries.json`).

**Normalização numérica (a parte mais delicada do arquivo):** cada fonte
usa um nome de campo e formato de valor diferente pra "a mesma coisa"
(ex.: potência aparece como "Total Power: 150 kW" na EV Database ou
"Potência (cv): 116" na iCarros). As funções `parse_power_cv`,
`parse_torque_kgfm`, `parse_range_km`, `parse_acceleration_sec`,
`parse_topspeed_kmh`, `parse_weight_kg`, `parse_towing_kg`,
`parse_battery_kwh`, `parse_production_years` resolvem isso: cada uma
tenta uma lista de nomes de campo conhecidos (inglês da EV
Database/Wikipedia + português dos sites .br) e converte a unidade pro
padrão do app (cv, kgfm, km, kg, kWh...). Isso é o que alimenta a Grid
comparativa — sem essa normalização, cada fonte teria um formato
diferente e a comparação lado-a-lado não funcionaria.

**Limitação conhecida:** carros flex (maioria no Brasil) têm valor duplo
por combustível na iCarros ("Álcool: 82 Gasolina: 80") sem unidade no
texto — os `parse_*` atuais não extraem esse formato (só pegam número
seguido de unidade), então fica como texto bruto no Radar mas não vira
número normalizado na Grid pra esses casos.

**`main()`:** roda `scan_target` pra todo o `CATALOG` (com delay de 1.5s
entre fontes pra não estourar o DuckDuckGo tão rápido), monta
`osintDiscoveries.json` (lista achatada campo/valor, uma linha por
campo por fonte por veículo — consumida pelo Radar e pelo Dashboard) e
`osintVehicleSpecs.json` (1 linha por veículo, specs já numéricas —
consumida pela Grid). **Roda o catálogo inteiro, então sobrescreve os 2
JSON do zero** — é lento (~140 veículos × até 7 fontes) e arriscado (todo
esse volume de chamada ao DuckDuckGo tende a tomar CAPTCHA antes de
terminar).

---

## 3. `collect_vehicle.py` — versão incremental do build_dataset.py (1 veículo)

**Por que existe:** rodar `build_dataset.py` inteiro é lento e
sobrescreve tudo; se só falta 1 veículo (ou o DuckDuckGo bloqueou no meio
do caminho), não faz sentido re-coletar os ~140. Este script reusa o
MESMO `scan_target` do `build_dataset.py` (é literalmente importado de
lá — zero duplicação de lógica de coleta), mas pra 1 `{brand, model}` só,
e faz **merge** no JSON existente em vez de sobrescrever:

```python
python collect_vehicle.py "Volkswagen" "T-Cross"
```

**Lógica do merge:** remove qualquer entrada antiga daquela mesma
marca+modelo dos 2 JSON, insere a nova coleta — **idempotente**: pode
rodar de novo pro mesmo veículo (ex.: depois que o DuckDuckGo
desbloquear, pra completar as fontes .br que faltaram) sem duplicar
linha.

**Diagnóstico:** ao final, avisa explicitamente quais fontes vieram
vazias (ex.: "Sem dados de: EV Database (normal p/ EV Database em carro
a combustão)") — pra distinguir "faltou dado porque é normal" de "faltou
dado porque algo quebrou".

---

## 4. `sales_radar.py` — coleta de ranking de vendas (trilha independente)

**Papel:** o mesmo padrão `locate`+`parse` do `osint_radar.py`, mas pra
um tipo de dado completamente diferente — não é ficha técnica, é
ranking de emplacamentos (quantas unidades venderam por modelo).

**Fonte:** `carrolens.com.br/rankings/<ano>?page=<N>`, que republica (e
credita) dados da **Fenabrave** — a entidade oficial do setor
automotivo no Brasil. O portal oficial da Fenabrave não devolve tabela
HTML estática fácil de raspar (relatório dinâmico); o carrolens
republica os mesmos números em tabela HTML simples, paginada, **sem
precisar de busca (DuckDuckGo)** pra localizar a página — mais estável
que a Trilha 1.

**`fetch_yearly_ranking(year)`:** pagina `/rankings/<year>?page=1,2,3...`
até uma página não trazer nenhum veículo novo (fim do ranking) ou bater
um limite de segurança. Cada linha da tabela vira um dict com rank,
nome bruto do veículo, marca/modelo já separados (`split_brand_model`) e
unidades vendidas.

**`split_brand_model`:** heurística pra separar "Fiat Strada" → (Fiat,
Strada), "VW - VolksWagen Polo" → (Volkswagen, Polo), "GWM Haval H6" →
(GWM, Haval H6). Também normaliza grafias (ex. "VolksWagen" →
"Volkswagen") pra bater com o nome de marca usado no resto do app
(`CATALOG` do `build_dataset.py`).

---

## 5. `build_sales.py` — junta 2 anos e calcula variação

**Papel:** chama `fetch_yearly_ranking` pro ano atual e pro anterior,
casa os veículos dos dois rankings pelo `slug` (identificador estável da
URL), calcula `delta_units`/`delta_pct`, marca `tracked_in_osint` (se
aquele brand+model já está no `CATALOG` da Trilha 1 — usado pelo
Dashboard pra badge "Radar"), e exporta `salesRankings.json`.

**A pegadinha que o código trata explicitamente:** o ranking do ano
corrente (`/rankings/2026`) é **acumulado parcial** (só até o último mês
fechado — hoje, agosto), enquanto o ranking do ano anterior
(`/rankings/2025`) é o **ano inteiro**. Comparar os dois direto faria
quase todo modelo parecer "em queda" só porque um total parcial é
menor que um total completo — não é sinal real de mercado. O script não
esconde isso: grava um bloco `meta` no JSON (`period_current`,
`period_previous`, e uma `note` explicando a limitação) que o frontend
usa pra rotular a comparação como "ritmo/tendência", não como taxa de
crescimento anual exata.

---

## Padrões que se repetem nos 5 arquivos (pra quem for estender)

1. **Separação locate/parse por fonte** — sempre dá pra adicionar fonte
   nova sem tocar no resto do pipeline.
2. **PoC deliberada** — sem robots.txt, sem rate limit sofisticado, sem
   rotação de proxy/anti-bot. Comentado explicitamente em todo arquivo
   pra não vazar despercebido pra produção.
3. **Nunca falha silencioso quando dá pra evitar** — bloqueio de
   DuckDuckGo, fonte vazia, parser genérico: tudo isso vira print
   explícito em vez de simplesmente "0 resultados".
4. **Scripts incrementais fazem merge, nunca overwrite bruto** — só
   `build_dataset.py`/`build_sales.py` (que processam a base inteira)
   sobrescrevem os JSON do zero; `collect_vehicle.py` sempre remove-e-
   reinsere só a entrada que mudou.
