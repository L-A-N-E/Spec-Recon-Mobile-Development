"""
osint_radar.py
================

Prova de conceito (PoC) para a pagina "Radar" (OSINT) do Spec Recon.

O que faz:
  1. Recebe um alvo (concorrente + modelo) e palavras-chave, igual aos
     campos da tela Radar (Concorrente / Categoria tecnica / Palavras-chave).
  2. Localiza uma pagina relevante em cada fonte publica configurada
     (Wikipedia, EV Database e um grupo de sites .br - iCarros, Webmotors,
     Quatro Rodas, UOL Carros, Autoesporte, Motor1 Brasil, CarrosNaWeb,
     FlatOut, Best Cars, AutoPapo, G1, R7, Band) usando busca por texto.
  3. Faz o parse das especificacoes tecnicas publicadas (tabelas/infobox).
  4. Categoriza cada especificacao (Bateria, Powertrain, Software,
     Aerodinamica, Materiais...) e marca se bate com as palavras-chave.
  5. Junta tudo em um DataFrame do pandas e salva localmente (CSV + pickle).

IMPORTANTE - escopo desta PoC:
  - Objetivo e validar o "shape" dos dados que a tela Radar vai consumir
    depois. NAO houve preocupacao com seguranca/robustez de scraping
    (sem checagem de robots.txt, sem rate limiting, sem rotacao de
    proxy/anti-bot, tratamento de erro minimo). Nao usar em producao
    como esta.
  - Os sites .br (UOL Carros, Autoesporte, Motor1 Brasil, CarrosNaWeb,
    FlatOut, Best Cars, AutoPapo) foram cadastrados SEM validacao de rede
    ao vivo completa (checagem feita em 2026-09-11 confirmou que o dominio
    responde e que o DuckDuckGo tem paginas indexadas desses sites, mas
    NAO foi possivel confirmar o parser campo a campo nessa mesma sessao
    porque o DuckDuckGo bloqueou com CAPTCHA depois de poucas chamadas -
    ver aviso em `duckduckgo_search`). O parse usa
    `parse_br_generic_specs()`, que tenta varias estruturas genericas
    (tabela th/td, tabela 2-colunas, dl/dt/dd, "Label: Valor" solto) em
    vez de seletor CSS fixo por site - mais resiliente a redesign, mas
    precisa ser CONFERIDO na primeira rodada: olhe a contagem de campos
    por fonte no output do build_dataset.py. Fonte com 0 (ou quase 0)
    campos consistentemente = ou o locate_* nao esta achando a pagina
    certa, ou o layout precisa de um parser dedicado.
  - Webmotors: CONFIRMADO bloqueio anti-bot ao vivo (a pagina responde
    200 mas com o corpo "Access to this page has been denied", sem
    conteudo) - fica registrado por completude, mas nao espere campos
    dele sem headless browser + rotacao de IP (fora do escopo desta PoC).
  - Quatro Rodas (quatrorodas.abril.com.br): tinha sido removido de SOURCES
    em 2026-09-11 apos concluir (so pela HOME do site) que virou revista
    fechada (Abril Signature). CORRIGIDO em 2026-09-12: a home e' fechada
    mesmo, mas materias especificas (ex.: recapitulacoes mensais de vendas
    Fenabrave) continuam publicas e com tabela raspavel - a home nao e'
    representativa do site inteiro. RE-REGISTRADO abaixo.
  - Para adicionar mais sites, basta incluir uma nova entrada na lista
    SOURCES no final do arquivo (uma funcao `locate_*` que acha a URL e
    uma funcao `parse_*` que extrai um dict {campo: valor}).

Uso:
    pip install -r requirements.txt
    python osint_radar.py --target "Tesla" --model "Model 3" \
        --keywords "estado solido, 800V, fluxo axial"

Saida:
    ./data/osint_results.csv   (snapshot legivel, sobrescrito a cada run)
    ./data/osint_results.pkl   (DataFrame serializado, preserva tipos)
"""

from __future__ import annotations

import argparse
import re
import time
import unicodedata
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, parse_qs, urlparse

import pandas as pd
import requests
from bs4 import BeautifulSoup

# --------------------------------------------------------------------------
# Config
# --------------------------------------------------------------------------

MAX_SOURCES = 15  # Wikipedia + EV Database + 13 sites .br (ver SOURCES no final)

HEADERS = {
    "User-Agent": (
        "SpecReconRadarPoC/0.1 (uso educacional/teste; "
        "contato: haubrichtnicolas@gmail.com)"
    )
}

REQUEST_TIMEOUT = 15  # segundos

DATA_DIR = Path(__file__).parent / "data"

# Mesmas categorias que aparecem no dropdown da pagina Radar (frontend).
CATEGORY_KEYWORDS = {
    "Carregamento": ["charge", "charging", "carregamento", "plug-in", "fast charge", "v2l", "v2h", "v2g"],
    "Bateria": ["battery", "bateria", "kwh", "celula", "cell", "range", "autonomia"],
    "Powertrain": ["motor", "power", "potencia", "torque", "powertrain", "transmiss", "0-100", "0-62", "acceleration", "top speed", "drive"],
    "Dimensões": ["length", "width", "height", "wheelbase", "dimension", "dimensao", "cargo", "volume", "seats", "turning circle", "comprimento", "largura", "altura"],
    "Software": ["software", "sistema operacional", "over-the-air", "ota", "autopilot", "fsd", "adas"],
    "Aerodinâmica": ["aerodynamic", "aerodinam", "drag", "cx ", "coefficient"],
    "Materiais": ["material", "chassis", "chassi", "body", "carroceria", "weight", "peso", "aluminum", "aluminio", "steel", "aco"],
}


# --------------------------------------------------------------------------
# Helpers genericos
# --------------------------------------------------------------------------

def _strip_accents(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    return "".join(ch for ch in normalized if not unicodedata.combining(ch))


def _norm(text: str) -> str:
    return _strip_accents(text).lower().strip()


def fetch_html(url: str, retries: int = 1) -> str | None:
    for attempt in range(retries + 1):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            return resp.text
        except requests.RequestException as exc:
            if attempt < retries:
                time.sleep(2)
                continue
            print(f"  [!] falha ao buscar {url}: {exc}")
            return None


_DDG_BLOCK_MARKERS = ("bots use duckduckgo too", "select all squares")

# Circuit breaker: depois de algumas falhas SEGUIDAS (timeout de rede ou
# CAPTCHA), assume que o DuckDuckGo esta inacessivel dessa rede pro resto
# do processo e para de tentar - sem isso, um catalogo de 239 veiculos x 9
# fontes .br vira ~9 tentativas x ate 30s (timeout+retry) POR VEICULO
# mesmo sabendo que vai falhar, o que transforma um run de minutos em um
# run de horas sem nenhum dado novo. Confirmado na pratica em 2026-09-11:
# rede de sandbox/datacenter levou o DDG de "CAPTCHA ocasional" pra
# "timeout de conexao" (nem chega a responder) depois de algumas dezenas
# de chamadas na mesma sessao. Isso e por-processo (reseta a cada run) -
# se rodar de novo depois, ou de outra rede, tenta normalmente nas
# primeiras chamadas.
_DDG_FAILURE_THRESHOLD = 3
_ddg_consecutive_failures = 0
_ddg_disabled = False


def duckduckgo_search(query: str, site: str | None = None, max_results: int = 8) -> list[str]:
    """Busca simples via DuckDuckGo HTML (sem API key) e retorna as URLs
    encontradas, na ordem. PoC: sem paginacao. Faz 1 retry com pausa maior,
    porque o DuckDuckGo costuma devolver pagina vazia se voce bater rapido
    demais (rate limit informal, sem aviso).

    ATENCAO - confirmado na pratica (nao so teorico): depois de poucas
    dezenas de chamadas em sequencia (ex.: rodar o catalogo completo do
    build_dataset.py, que bate no DDG pra cada fonte .br de cada veiculo),
    o DDG passa a devolver uma pagina de CAPTCHA ("Select all squares
    containing a duck") em vez de resultados - HTTP 202, pagina de
    ~14KB, entao NAO cai no retry de rate-limit acima (que so dispara
    com pagina < 5KB). Sem deteccao, isso aparecia como "nenhuma pagina
    encontrada" (indistinguivel de "esse veiculo nao tem pagina nesse
    site"), o que e enganoso. Agora detectamos o texto do desafio e
    avisamos explicitamente. Nao ha bypass automatico aqui (seria burlar
    anti-bot de terceiro) - se isso disparar toda hora num run grande,
    a saida e espacar mais as chamadas, rodar em lotes menores, ou trocar
    a estrategia de localizacao (busca propria do site / outro buscador)
    para as fontes mais afetadas. Ver `_DDG_FAILURE_THRESHOLD` acima: depois
    de poucas falhas seguidas (timeout OU captcha) o circuito abre e para
    de tentar pro resto do processo, pra nao desperdicar horas repetindo
    uma chamada que ja sabemos que vai falhar."""
    global _ddg_consecutive_failures, _ddg_disabled

    if _ddg_disabled:
        return []

    q = f"site:{site} {query}" if site else query
    url = f"https://html.duckduckgo.com/html/?q={quote(q)}"

    html = fetch_html(url)
    if html and "No results" not in html and len(html) < 5000:
        time.sleep(3)
        html = fetch_html(url)  # resposta suspeita de rate limit, tenta de novo

    def _register_failure(reason: str) -> None:
        global _ddg_consecutive_failures, _ddg_disabled
        _ddg_consecutive_failures += 1
        if _ddg_consecutive_failures >= _DDG_FAILURE_THRESHOLD and not _ddg_disabled:
            _ddg_disabled = True
            print(
                f"  [!] DuckDuckGo: {_ddg_consecutive_failures} falhas seguidas "
                f"({reason}) - assumindo que esta inacessivel nesta rede e "
                "PARANDO de tentar fontes via DDG pro resto desta rodada "
                "(as fontes Wikipedia/EV Database continuam normalmente). "
                "Rode de novo depois, ou de outra rede, pra completar essas fontes."
            )

    if not html:
        _register_failure("timeout/erro de rede")
        return []

    if any(marker in html.lower() for marker in _DDG_BLOCK_MARKERS):
        print("  [!] DuckDuckGo pediu CAPTCHA (bloqueio anti-bot) - resultado vazio "
              "NAO significa 'sem pagina', significa 'nao deu pra buscar agora'. "
              "Espere alguns minutos ou espace mais as chamadas.")
        _register_failure("CAPTCHA")
        return []

    _ddg_consecutive_failures = 0

    soup = BeautifulSoup(html, "lxml")
    results = []
    for link in soup.select("a.result__a"):
        href = link.get("href", "")
        # resultados vem como redirect: //duckduckgo.com/l/?uddg=<url-encoded>
        parsed = urlparse(href)
        qs = parse_qs(parsed.query)
        target_url = qs.get("uddg", [None])[0]
        if target_url and (site is None or site in target_url):
            results.append(target_url)
        if len(results) >= max_results:
            break

    return results


def duckduckgo_first_result(query: str, site: str | None = None) -> str | None:
    results = duckduckgo_search(query, site=site, max_results=1)
    return results[0] if results else None


def _contains_keyword(haystack: str, keyword: str) -> bool:
    """Substring match com word-boundary, pra 'os'/'ota' nao baterem
    dentro de 'total distance', por exemplo."""
    pattern = r"\b" + re.escape(_norm(keyword)) + r"\b"
    return re.search(pattern, haystack) is not None


def categorize(field: str) -> str:
    field_n = _norm(field)
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(_contains_keyword(field_n, k) for k in keywords):
            return category
    return "Outros"


def keyword_match(field: str, value: str, keywords: list[str]) -> bool:
    haystack = _norm(f"{field} {value}")
    return any(_contains_keyword(haystack, k) for k in keywords if k.strip())


def confidence_score(category: str, matched: bool) -> int:
    score = 60
    if category != "Outros":
        score += 15
    if matched:
        score += 20
    return min(score, 95)


# --------------------------------------------------------------------------
# Fonte 1: Wikipedia (infobox)
# --------------------------------------------------------------------------

def locate_wikipedia(query: str, lang: str = "en") -> str | None:
    api_url = (
        f"https://{lang}.wikipedia.org/w/api.php"
        f"?action=query&list=search&srsearch={quote(query)}"
        "&format=json&srlimit=1"
    )
    try:
        resp = requests.get(api_url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        results = resp.json().get("query", {}).get("search", [])
        if not results:
            return None
        title = results[0]["title"].replace(" ", "_")
        return f"https://{lang}.wikipedia.org/wiki/{quote(title)}"
    except (requests.RequestException, ValueError, KeyError) as exc:
        print(f"  [!] falha na busca Wikipedia ({lang}): {exc}")
        return None


_COMPANY_FIELD_MARKERS = {
    "founded", "founder", "headquarters", "industry", "revenue", "key people",
    "traded as", "number of employees", "parent", "subsidiaries", "isin",
    "fundacao", "fundador", "sede", "proprietario", "empregados", "subsidiaria",
    "faturamento", "razao social", "valor de mercado", "cotacao", "lajir",
    "pessoas-chave", "significado da sigla",
}
_VEHICLE_FIELD_MARKERS = {
    # "producao"/"production" fica de fora de proposito - empresa tambem
    # usa esse campo (pra faturamento/output), nao e exclusivo de carro
    "manufacturer", "class", "body style", "layout", "engine",
    "powertrain", "assembly", "wheelbase", "transmission", "predecessor",
    "successor", "fabricante", "motor", "carroceria", "plataforma",
    "montagem", "distancia entre eixos",
}


def _looks_like_company_page(specs: dict[str, str]) -> bool:
    """Descarta paginas de empresa/marca (ex.: 'Tesla, Inc.') que acabam
    tendo MAIS campos no infobox do que a pagina do carro especifico -
    sem isso, o criterio de 'fica com quem tem mais campos' as vezes
    escolhe a pagina errada so por ter um infobox de empresa mais longo."""
    keys = {_norm(k) for k in specs}
    company_hits = sum(1 for m in _COMPANY_FIELD_MARKERS if any(m in k for k in keys))
    vehicle_hits = sum(1 for m in _VEHICLE_FIELD_MARKERS if any(m in k for k in keys))
    return company_hits >= 2 and vehicle_hits == 0


def fetch_best_wikipedia(query: str) -> tuple[str | None, dict[str, str]]:
    """Tenta a Wikipedia em portugues e em ingles e fica com a pagina que
    render mais campos de infobox (descartando paginas de empresa/marca).

    pt.wikipedia tende a cobrir melhor modelos vendidos so no Brasil (ex.:
    Honda City, Civic) e ja devolve o texto em portugues; en.wikipedia
    costuma ter infobox mais detalhado pra carros globais bem documentados
    (EVs, por ex.). Em vez de escolher uma so, tenta as duas e fica com a
    que trouxer mais dados - simples e evita regressao pros dados que ja
    estavamos coletando bem em ingles."""
    candidates: list[tuple[int, str, dict[str, str]]] = []

    for lang in ("pt", "en"):
        url = locate_wikipedia(query, lang=lang)
        if not url:
            continue
        html = fetch_html(url)
        if not html:
            continue
        specs = parse_wikipedia_infobox(html)
        if specs and not _looks_like_company_page(specs):
            candidates.append((len(specs), url, specs))

    if not candidates:
        return None, {}

    candidates.sort(key=lambda c: c[0], reverse=True)
    _, best_url, best_specs = candidates[0]
    return best_url, best_specs


def parse_wikipedia_infobox(html: str) -> dict[str, str]:
    soup = BeautifulSoup(html, "lxml")
    infobox = soup.find("table", class_=re.compile(r"\binfobox\b"))
    if not infobox:
        return {}

    specs: dict[str, str] = {}
    for row in infobox.find_all("tr"):
        th = row.find("th")
        td = row.find("td")
        if not th or not td:
            continue
        label = th.get_text(" ", strip=True)
        value = td.get_text(" | ", strip=True)
        value = re.sub(r"\s+", " ", value).strip(" |")
        if label and value:
            specs[label] = value
    return specs


# --------------------------------------------------------------------------
# Fonte 2: EV Database (dl/dt/dd)
# --------------------------------------------------------------------------

_EVDATABASE_SITEMAP_URL = "https://ev-database.org/sitemap.xml"
_EVDATABASE_CAR_URL = re.compile(r"https://ev-database\.org/car/(\d+)/([A-Za-z0-9.\-]+)")

_evdatabase_index_cache: list[tuple[str, str]] | None = None  # (id, url)


def _evdatabase_index() -> list[tuple[str, str]]:
    """Baixa o sitemap.xml do EV Database (1x por processo, cacheado em
    memoria) e extrai todas as paginas de carro (.../car/<id>/<slug>).

    Usar o sitemap publico do proprio site em vez de um motor de busca
    externo evita rate limit de terceiros (ex.: DuckDuckGo bloqueando
    rajadas de requisicao) e e mais estavel para um pipeline de coleta.
    """
    global _evdatabase_index_cache
    if _evdatabase_index_cache:
        return _evdatabase_index_cache

    xml = fetch_html(_EVDATABASE_SITEMAP_URL, retries=2)
    if not xml:
        return []  # falha transitoria: nao cacheia, tenta de novo na proxima chamada

    _evdatabase_index_cache = [
        (m.group(1), m.group(0)) for m in _EVDATABASE_CAR_URL.finditer(xml)
    ]
    return _evdatabase_index_cache


def locate_evdatabase(query: str) -> str | None:
    """Localiza a pagina de um carro no EV Database pelo sitemap publico
    do site (sem depender de busca externa). Casa por tokens (marca +
    modelo) contra o slug da URL.

    Compara ignorando QUALQUER separador (espaco, hifen, ponto, dois
    pontos) dos dois lados - assim "Mercedes-Benz EQS" bate com o slug
    ".../Mercedes-Benz-EQS-450plus" mesmo o slug separando "Mercedes" e
    "Benz" em palavras diferentes, e "ID.4" ainda bate com o slug fundido
    ".../Volkswagen-ID4-1st".

    Entre os slugs que batem, prioriza os que NAO tem uma letra logo
    depois do trecho buscado - ex.: para "BYD Seal", prefere
    ".../BYD-SEAL-825-kWh-RWD-Design" (numero = trim/bateria) a
    ".../BYD-SEAL-U-87-kWh-Design" (a letra 'U' e outro modelo, o SUV
    Seal U). Em caso de empate, fica com o slug mais curto (tende a ser
    o trim mais generico/base)."""
    compact_query = re.sub(r"[^a-z0-9]", "", _norm(query))
    if not compact_query:
        return None

    scored = []
    for _id, url in _evdatabase_index():
        slug = url.rsplit("/", 1)[-1]
        compact_slug = re.sub(r"[^a-z0-9]", "", _norm(slug))

        idx = compact_slug.find(compact_query)
        if idx == -1:
            continue  # marca+modelo nao aparece nesse slug

        next_char = compact_slug[idx + len(compact_query): idx + len(compact_query) + 1]
        # penaliza quando logo depois do nome buscado vem uma letra -
        # normalmente sinaliza um MODELO diferente ou uma variante nomeada
        # (ex.: "U", "N", "GT") em vez do trim "base" (numero em seguida)
        extra_alpha = next_char.isalpha()

        scored.append((extra_alpha, len(slug), url))

    if not scored:
        return None

    scored.sort()
    return scored[0][2]


def parse_evdatabase_specs(html: str) -> dict[str, str]:
    """EV Database publica as specs em varias <table> pequenas, cada linha
    com 2 celulas (label, valor) - sem cabecalho th. Ex.:
        <tr><td>Nominal Capacity</td><td>64.0 kWh</td></tr>
    """
    soup = BeautifulSoup(html, "lxml")
    specs: dict[str, str] = {}

    for table in soup.find_all("table"):
        for row in table.find_all("tr"):
            cells = row.find_all(["th", "td"])
            if len(cells) != 2:
                continue
            label = re.sub(r"\s+", " ", cells[0].get_text(" ", strip=True)).strip(" *\t")
            value = re.sub(r"\s+", " ", cells[1].get_text(" ", strip=True)).strip()
            if not label or not value or value == "No Data":
                continue
            specs[label] = value

    return specs


# --------------------------------------------------------------------------
# Fontes .br (iCarros, Webmotors, UOL Carros, Autoesporte, Motor1 Brasil,
# CarrosNaWeb, FlatOut, Best Cars, AutoPapo)
# --------------------------------------------------------------------------
#
# Sem sitemap publico nem API de busca proprios (ao contrario do EV
# Database) - localizacao via DuckDuckGo restrito ao dominio
# (`site:dominio.com.br ...`), reaproveitando duckduckgo_first_result() ja
# definido acima. "ficha tecnica" no texto da busca ajuda o DDG a priorizar
# a pagina de especificacoes em vez de noticia/review/anuncio de venda.
#
# parse_br_generic_specs() e compartilhado entre a maioria delas: como nao
# deu pra inspecionar o HTML ao vivo de cada site ao escrever este codigo
# (ver aviso no topo do arquivo), um parser generico multi-estrategia e
# mais seguro do que "adivinhar" um seletor CSS especifico que pode nem
# existir mais. CONFIRA a contagem de campos por fonte na primeira rodada.
#
# Duas fontes que ESTAVAM nessa lista foram removidas/ajustadas depois de
# uma checagem ao vivo (nao so teorica) feita em 2026-09-11:
#   - Webmotors: confirmado bloqueio anti-bot ("Access to this page has
#     been denied" - HTTP 200 mas pagina vazia de conteudo). Fica registrada
#     abaixo, mas nao espere campos dela sem headless browser + rotacao de
#     IP (fora do escopo desta PoC).
#   - Quatro Rodas (quatrorodas.abril.com.br): confirmado que virou revista
#     digital fechada (Abril Signature) - a home so tem links de navegacao
#     pro resto do grupo Abril e chamada de assinatura, sem ficha tecnica
#     acessivel sem login. REMOVIDA de SOURCES (nao ha o que raspar).

def locate_icarros(query: str) -> str | None:
    return duckduckgo_first_result(f"{query} ficha tecnica", site="icarros.com.br")


def parse_icarros_specs(html: str) -> dict[str, str]:
    """Parser dedicado pra iCarros (validado contra HTML real, nao generico):
    cada linha da ficha tecnica e um <div class="technical-sheet-item"> com
    2 <span> filhos (label em negrito, valor normal) - sem tabela/dl. Ex.:
        <div class="technical-sheet-item">
          <span class="...bold...">Potência (cv)</span>
          <span class="...regular...">Álcool: 82 Gasolina: 80</span>
        </div>

    Nota: carros flex (a maioria no Brasil) tem valor duplo por
    combustivel ("Álcool: X Gasolina: Y") sem unidade no texto (a unidade
    fica so no label, ex. "(cv)") - os parsers numericos genericos do
    build_dataset.py (que buscam um numero seguido de unidade) nao
    conseguem extrair esse formato ainda; fica como valor textual bruto
    no Radar, mas nao vira numero normalizado na Grid."""
    soup = BeautifulSoup(html, "lxml")
    specs: dict[str, str] = {}
    for item in soup.find_all("div", class_="technical-sheet-item"):
        spans = item.find_all("span")
        if len(spans) < 2:
            continue
        label = spans[0].get_text(" ", strip=True)
        value = re.sub(r"\s+", " ", spans[1].get_text(" ", strip=True)).strip()
        if label and value:
            specs[label] = value
    return specs


def locate_webmotors(query: str) -> str | None:
    return duckduckgo_first_result(f"{query} ficha tecnica", site="webmotors.com.br")


def locate_quatrorodas(query: str) -> str | None:
    return duckduckgo_first_result(f"{query} ficha tecnica", site="quatrorodas.abril.com.br")


def locate_uolcarros(query: str) -> str | None:
    return duckduckgo_first_result(f"{query} ficha tecnica carro", site="uol.com.br")


def locate_autoesporte(query: str) -> str | None:
    return duckduckgo_first_result(f"{query} ficha tecnica", site="autoesporte.globo.com")


def locate_motor1(query: str) -> str | None:
    return duckduckgo_first_result(f"{query} ficha tecnica", site="motor1.uol.com.br")


def locate_carrosnaweb(query: str) -> str | None:
    return duckduckgo_first_result(f"{query} ficha tecnica", site="carrosnaweb.com.br")


def locate_flatout(query: str) -> str | None:
    return duckduckgo_first_result(f"{query} ficha tecnica", site="flatout.com.br")


def locate_bestcars(query: str) -> str | None:
    return duckduckgo_first_result(f"{query} ficha tecnica", site="bestcars.com.br")


def locate_autopapo(query: str) -> str | None:
    return duckduckgo_first_result(f"{query} ficha tecnica", site="autopapo.com.br")


# Grandes portais de noticia (nao especializados em carro) - adicionados a
# pedido explicito do usuario em 2026-09-11 como "fontes confiaveis" pra
# alimentar um sistema de aprendizado do Assistente (Henry). Diferente das
# fontes de "ficha tecnica" acima, aqui a busca NAO usa "ficha tecnica" no
# texto (esses portais raramente tem pagina de especificacoes tabulada -
# e mais noticia/lancamento/preco em prosa), entao o parser generico
# (parse_br_generic_specs) tende a render menos campos estruturados e mais
# via o fallback fraco de "Label: Valor" solto no texto. Ainda assim vale
# registrar: da pro Radar mostrar como "descoberta" (texto bruto) mesmo sem
# virar numero normalizado na Grid, e mantém o app.tsx (`src/lib/
# trustedSources.ts`) e o pipeline com o MESMO conjunto de dominios
# "confiaveis" dos dois lados.
def locate_g1(query: str) -> str | None:
    return duckduckgo_first_result(f"{query} carro", site="g1.globo.com")


def locate_r7(query: str) -> str | None:
    return duckduckgo_first_result(f"{query} carro", site="r7.com")


def locate_band(query: str) -> str | None:
    return duckduckgo_first_result(f"{query} carro", site="band.uol.com.br")


_BR_WEAK_VALUES = {"no data", "-", "n/d", "nao informado", "n/a", ""}


def parse_br_generic_specs(html: str) -> dict[str, str]:
    """Parser generico para paginas de 'ficha tecnica' de sites .br.

    Tenta, em ordem de confianca decrescente, 4 estruturas comuns de
    label->valor e para na primeira que render algo:
      1. tabela com <th>+<td> por linha (estilo infobox Wikipedia)
      2. tabela com exatamente 2 celulas por linha, sem <th> (estilo EV
         Database - comum em "ficha tecnica" tabular simples)
      3. <dl><dt>label</dt><dd>valor</dd></dl>
      4. texto solto em <li>/<div>/<p>/<span> no formato "Label: Valor"
         (fallback mais fraco e mais ruidoso - pode capturar menu/rodape;
         usado so se as estrategias 1-3 nao acharem nada)

    Nao ha selecao por site: mesma funcao serve para iCarros, Webmotors,
    Quatro Rodas, UOL Carros e Autoesporte. Se uma fonte especifica vier
    consistentemente vazia, ela provavelmente precisa de um parser
    dedicado (estrutura fora dessas 4 formas)."""
    soup = BeautifulSoup(html, "lxml")

    specs: dict[str, str] = {}
    for table in soup.find_all("table"):
        for row in table.find_all("tr"):
            th = row.find("th")
            td = row.find("td")
            if not th or not td:
                continue
            label = th.get_text(" ", strip=True)
            value = re.sub(r"\s+", " ", td.get_text(" | ", strip=True)).strip(" |")
            if label and value:
                specs[label] = value
    if specs:
        return specs

    for table in soup.find_all("table"):
        for row in table.find_all("tr"):
            cells = row.find_all(["th", "td"])
            if len(cells) != 2:
                continue
            label = re.sub(r"\s+", " ", cells[0].get_text(" ", strip=True)).strip(" *\t:")
            value = re.sub(r"\s+", " ", cells[1].get_text(" ", strip=True)).strip()
            if label and value and _norm(value) not in _BR_WEAK_VALUES:
                specs[label] = value
    if specs:
        return specs

    for dl in soup.find_all("dl"):
        for dt, dd in zip(dl.find_all("dt"), dl.find_all("dd")):
            label = dt.get_text(" ", strip=True)
            value = dd.get_text(" ", strip=True)
            if label and value:
                specs[label] = value
    if specs:
        return specs

    for tag in soup.find_all(["li", "div", "p", "span"]):
        text = tag.get_text(" ", strip=True)
        if not text or len(text) > 120:
            continue
        m = re.match(r"^([A-Za-zÀ-ÿ0-9 /().\-]{3,40}):\s*(.+)$", text)
        if not m:
            continue
        label, value = m.group(1).strip(), m.group(2).strip()
        if label and value and label not in specs:
            specs[label] = value
    return specs


# --------------------------------------------------------------------------
# Registro de fontes -> para adicionar um novo site no futuro, so incluir
# uma entrada aqui com locate() + parse().
# --------------------------------------------------------------------------

SOURCES = [
    {"name": "Wikipedia", "locate": locate_wikipedia, "parse": parse_wikipedia_infobox},
    {"name": "EV Database", "locate": locate_evdatabase, "parse": parse_evdatabase_specs},
    {"name": "iCarros", "locate": locate_icarros, "parse": parse_icarros_specs},
    {"name": "Webmotors", "locate": locate_webmotors, "parse": parse_br_generic_specs},
    {"name": "Quatro Rodas", "locate": locate_quatrorodas, "parse": parse_br_generic_specs},
    {"name": "UOL Carros", "locate": locate_uolcarros, "parse": parse_br_generic_specs},
    {"name": "Autoesporte", "locate": locate_autoesporte, "parse": parse_br_generic_specs},
    {"name": "Motor1 Brasil", "locate": locate_motor1, "parse": parse_br_generic_specs},
    {"name": "CarrosNaWeb", "locate": locate_carrosnaweb, "parse": parse_br_generic_specs},
    {"name": "FlatOut", "locate": locate_flatout, "parse": parse_br_generic_specs},
    {"name": "Best Cars", "locate": locate_bestcars, "parse": parse_br_generic_specs},
    {"name": "AutoPapo", "locate": locate_autopapo, "parse": parse_br_generic_specs},
    {"name": "G1", "locate": locate_g1, "parse": parse_br_generic_specs},
    {"name": "R7", "locate": locate_r7, "parse": parse_br_generic_specs},
    {"name": "Band", "locate": locate_band, "parse": parse_br_generic_specs},
]


# --------------------------------------------------------------------------
# Orquestracao
# --------------------------------------------------------------------------

def build_rows(
    target: str,
    model: str,
    source_name: str,
    source_url: str,
    specs: dict[str, str],
    keywords: list[str],
) -> list[dict]:
    now = datetime.now(timezone.utc).isoformat()
    rows = []
    for field, value in specs.items():
        category = categorize(field)
        matched = keyword_match(field, value, keywords)
        rows.append(
            {
                "id": uuid.uuid4().hex[:10],
                "collected_at": now,
                "target": target,
                "model": model,
                "source": source_name,
                "source_url": source_url,
                "category": category,
                "field": field,
                "value": value,
                "keyword_match": matched,
                "confidence": confidence_score(category, matched),
            }
        )
    return rows


def run_scan(target: str, model: str, keywords_csv: str) -> pd.DataFrame:
    keywords = [k.strip() for k in keywords_csv.split(",") if k.strip()]
    query = f"{target} {model}".strip()

    print(f"[*] Alvo: {query!r} | palavras-chave: {keywords}")

    all_rows: list[dict] = []
    for i, source in enumerate(SOURCES[:MAX_SOURCES]):
        if i > 0:
            time.sleep(1.5)  # a maioria das fontes .br usa DuckDuckGo p/ localizar a pagina; evita rate limit em rajada
        name = source["name"]
        print(f"[*] Fonte: {name} -> localizando pagina...")
        url = source["locate"](query)
        if not url:
            print(f"  [!] nenhuma pagina encontrada em {name}, pulando.")
            continue

        print(f"    -> {url}")
        html = fetch_html(url)
        if not html:
            continue

        specs = source["parse"](html)
        print(f"    -> {len(specs)} campos extraidos")
        all_rows.extend(build_rows(target, model, name, url, specs, keywords))

    columns = [
        "id", "collected_at", "target", "model", "source", "source_url",
        "category", "field", "value", "keyword_match", "confidence",
    ]
    df = pd.DataFrame(all_rows, columns=columns)
    if not df.empty:
        df = df.sort_values(["keyword_match", "confidence"], ascending=[False, False]).reset_index(drop=True)
    return df


def save_dataframe(df: pd.DataFrame) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = DATA_DIR / "osint_results.csv"
    pkl_path = DATA_DIR / "osint_results.pkl"
    df.to_csv(csv_path, index=False)
    df.to_pickle(pkl_path)
    print(f"[*] Salvo: {csv_path}")
    print(f"[*] Salvo: {pkl_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Radar OSINT PoC - Spec Recon")
    parser.add_argument("--target", default="Tesla", help="Concorrente (ex: Tesla, BYD)")
    parser.add_argument("--model", default="Model 3", help="Modelo/produto especifico")
    parser.add_argument(
        "--keywords",
        default="estado sólido, 800V, fluxo axial",
        help="Palavras-chave separadas por virgula",
    )
    args = parser.parse_args()

    df = run_scan(args.target, args.model, args.keywords)

    if df.empty:
        print("[!] Nenhuma especificacao encontrada.")
        return

    print("\n=== Resumo por categoria ===")
    print(df.groupby("category").size().sort_values(ascending=False).to_string())

    print("\n=== Top 10 achados (por confianca) ===")
    with pd.option_context("display.max_colwidth", 60):
        print(df[["source", "category", "field", "value", "keyword_match", "confidence"]].head(10).to_string(index=False))

    save_dataframe(df)

if __name__ == "__main__":
    main()
