# Spec Recon — Design System (para brainstorm de logo)

> Extraído do código atual (`src/`) em 2026-09-11. Serve como referência de identidade visual antes de desenhar a logo.

## 1. Produto e posicionamento

- **Nome:** Spec Recon
- **Subtítulo / tagline (hero):** "Inteligência Competitiva Automotiva"
- **Descrição curta:** "O Spec Recon transforma dados públicos dispersos em inteligência estratégica para antecipar os próximos movimentos da concorrência automotiva."
- **Domínio:** OSINT (Open Source Intelligence) aplicado ao setor automotivo — patentes, fóruns, imprensa, bases regulatórias.
- **Módulos do produto:** Radar de Inteligência, Dashboard de Descobertas, Grid (comparação técnica), Assistente Virtual (IA).
- **Tom de voz:** técnico, corporativo, "mission control" — remete a vigilância/monitoramento (radar, sonar, sinal), não a algo lúdico.

**Palavras-chave para a logo:** radar, sinal, varredura, inteligência, sonar, mira/alvo, dado captado no escuro, sigilo, precisão, automotivo.

## 2. Paleta de cores

O app roda em **tema escuro** (fundo preto puro), com azul como cor de destaque principal.

| Papel | Cor | Hex aproximado | Uso |
|---|---|---|---|
| Fundo base | `black` | `#000000` | Fundo de toda a aplicação |
| Superfície | `white/5` a `white/10` | rgba(255,255,255,.05–.10) | Cards, painéis (glassmorphism) |
| Texto principal | `white` | `#ffffff` | Títulos |
| Texto secundário | `white/60`, `white/40` | — | Parágrafos, labels |
| **Primária/acento** | `blue-500` | `#3b82f6` | Botões secundários, links, glow, scrollbar |
| Acento gradiente | `blue-400 → cyan-300` | `#60a5fa → #67e8f9` | Texto em destaque ("Competitiva"), gradientes |
| Sucesso | `green-400/500` | `#4ade80 / #22c55e` | Status "online", indicadores positivos |
| Alerta/erro | `red-400/500` | `#f87171 / #ef4444` | Erros, alertas críticos |
| Atenção | `amber-500` | `#f59e0b` | Avisos intermediários |

Observação: existe um **favicon/logo antigo em roxo** (`public/favicon.svg`, tons `#863bff` / `#7e14ff` / `#47bfff`) que **não bate com a paleta azul/preta usada no app**. Vale decidir se a nova logo vai realinhar para azul-ciano (consistente com o produto atual) ou se o roxo era uma direção de marca que ainda quer explorar.

## 3. Tipografia

- Sem fonte customizada carregada — usa a stack padrão do Tailwind (`font-sans` do sistema). Bom espaço para a logo trazer uma fonte de destaque própria.
- Pesos usados: `font-medium`, `font-semibold`, `font-bold` — nunca light/thin. Marca é "sólida", não fina.
- Escala de título grande: `text-5xl` → `text-8xl`, sempre com `tracking-tight` e `leading-[0.95]` (bem compacto/denso).
- Labels e badges: caixa alta com tracking espaçado — `uppercase tracking-[0.2em] text-xs` (ex.: "DESCOBERTAS / MÊS"). Esse contraste **denso no título / esparso no label** é uma assinatura tipográfica forte.
- Numeração estilo "código de sistema" nos módulos: `01`, `02`, `03`, `04` — reforça o tom técnico/catálogo.

## 4. Linguagem visual / UI

- **Glassmorphism escuro:** painéis com `bg-white/5`, `border border-white/10`, `backdrop-blur-xl`.
- **Glow radial azul:** `radial-gradient(circle_at_top, rgba(59,130,246,.25), transparent 40%)` no hero — luz de destaque emanando de um ponto, como um "sinal" ou "scanner".
- **Grid de fundo sutil:** linhas finas brancas a 4% de opacidade (`bg-size-[80px_80px]`) — textura de "blueprint"/radar/mapa técnico.
- **Pill de status ao vivo:** badge arredondado com ponto verde pulsante (`animate-pulse`) + texto "Motor OSINT Online" — motivo recorrente de "sistema ativo/monitorando em tempo real".
- **Cantos:** fortemente arredondados — `rounded-xl` (botões/cards), `rounded-2xl`/`rounded-3xl` (painéis grandes), `rounded-full` (badges, avatares, indicadores). Nada com cantos vivos.
- **Ícones:** biblioteca `lucide-react`, estilo line/outline fino. Ícones usados no produto: `Radar`, `LayoutDashboard`, `GitCompare`, `Bot`, `Eye`, `Database`, `Zap`, `ArrowRight`. `Radar` e `Eye` são os mais alinhados semanticamente à marca.
- **Scrollbar customizada:** trilho quase invisível + thumb azul translúcido — reforça consistência da cor de marca até em detalhes de sistema.

## 5. Direções possíveis para a logo

1. **Radar/sonar:** círculos concêntricos, varredura (linha rotativa), ponto de "contato" piscando — conecta direto com o módulo "Radar" e o motivo do status-dot pulsante já usado na UI.
2. **Mira/alvo em movimento:** aponta para "antecipar o próximo movimento da concorrência" — algo entre crosshair e seta.
3. **Sinal captado no escuro:** um ponto de luz azul-ciano isolado sobre fundo preto (literalmente o glow radial do hero) — minimalista, funciona bem como ícone de app.
4. **Monograma "SR" técnico:** letras geométricas, cantos cortados/chanfrados (não arredondados, para contrastar como elemento "âncora" versus os cantos suaves do resto da UI), em azul sobre preto.

Recomendação inicial: manter **preto + azul (`#3b82f6`) + ciano (`#67e8f9`)** como paleta da logo para ficar consistente com o produto já construído, a menos que haja intenção deliberada de reposicionar a marca para o roxo do favicon antigo.
