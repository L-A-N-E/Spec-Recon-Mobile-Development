// Camada de acesso aos dados coletados pelo osint-radar (script Python em
// /osint-radar). Os JSONs em src/data sao gerados por
// `osint-radar/build_dataset.py` e importados aqui como snapshot estatico -
// nao ha backend, o "scan" da pagina Radar filtra esse snapshot na hora.

import rawDiscoveries from "../data/osintDiscoveries.json"
import rawVehicleSpecs from "../data/osintVehicleSpecs.json"

export type OsintDiscovery = {
    id: string
    target: string
    model: string
    source: string
    source_url: string
    category: string
    field: string
    value: string
    discovered_at: string
}

export type OsintVehicleSpec = {
    target: string
    model: string
    start_year: number | null
    end_year: number | null
    battery_kwh: number | null
    power_cv: number | null
    torque_kgfm: number | null
    autonomy_km: number | null
    acceleration_0_100: number | null
    top_speed_kmh: number | null
    weight_kg: number | null
    towing_kg: number | null
    wikipedia_url: string | null
    evdatabase_url: string | null
}

export type OsintDiscoveryScored = OsintDiscovery & {
    keywordMatch: boolean
    confidence: number
}

const discoveries = rawDiscoveries as OsintDiscovery[]
const vehicleSpecs = rawVehicleSpecs as OsintVehicleSpec[]

// ---------------------------------------------------------------------
// Fontes de coleta - mesma classificacao usada na tela Radar. TODAS ficam
// selecionaveis na busca (o filtro `enabledSources` so restringe QUAIS
// linhas ja coletadas aparecem - nao controla se o Python vai tentar
// coletar, isso e' o SOURCES do osint_radar.py). O campo `live` aqui e'
// so informativo (badge "Ativo" vs "Beta" na UI): Wikipedia, EV Database
// e iCarros tem parser validado contra HTML real e retornam dado hoje;
// Webmotors, UOL Carros, Autoesporte, Motor1 Brasil, CarrosNaWeb, FlatOut
// e AutoPapo estao cadastradas no osint_radar.py (localizacao via
// DuckDuckGo, parser generico best-effort) mas sem confirmacao campo a
// campo - o DDG bloqueia com CAPTCHA (ou some de vez, dependendo da rede)
// depois de poucas chamadas em sequencia. Webmotors especificamente ja
// teve bloqueio anti-bot CONFIRMADO (pagina "Access denied"). Quatro Rodas
// foi removida de vez do osint_radar.py (virou revista digital fechada,
// sem ficha tecnica raspavel); Best Cars tambem foi removida (dominio
// vendido, hoje redireciona pra uma livraria sem relacao com carros).
// Patentes/foruns/imprensa/
// reguladores/social no fim da lista sao roadmap puro - sem locate/parse
// no Python ainda, entao selecionar so fica sem efeito (nenhuma linha
// tem esse `source`).
// ---------------------------------------------------------------------

export type SourceMeta = {
    id: string
    label: string
    classification: string
    reliability: 1 | 2 | 3 | 4 | 5
    live: boolean
    note: string
}

export const OSINT_SOURCES: SourceMeta[] = [
    {
        id: "wikipedia",
        label: "Wikipedia",
        classification: "Enciclopédico",
        reliability: 4,
        live: true,
        note: "Infobox técnico consolidado por colaboração pública.",
    },
    {
        id: "ev_database",
        label: "EV Database",
        classification: "Especializado / Técnico",
        reliability: 5,
        live: true,
        note: "Base técnica independente focada em veículos elétricos.",
    },
    {
        id: "icarros",
        label: "iCarros",
        classification: "Ficha técnica (BR)",
        reliability: 3,
        live: true,
        note: "Cobre modelos vendidos só no Brasil (combustão/híbrido) fora do EV Database.",
    },
    {
        id: "webmotors",
        label: "Webmotors",
        classification: "Ficha técnica (BR)",
        reliability: 1,
        live: false,
        note: "Bloqueio anti-bot confirmado — indisponível sem navegador headless.",
    },
    {
        id: "uol_carros",
        label: "UOL Carros",
        classification: "Imprensa / Ficha técnica (BR)",
        reliability: 3,
        live: false,
        note: "Cobertura ainda não validada — pode não retornar resultados agora.",
    },
    {
        id: "autoesporte",
        label: "Autoesporte",
        classification: "Imprensa / Ficha técnica (BR)",
        reliability: 3,
        live: false,
        note: "Cobertura ainda não validada — pode não retornar resultados agora.",
    },
    {
        id: "motor1_br",
        label: "Motor1 Brasil",
        classification: "Imprensa / Ficha técnica (BR)",
        reliability: 3,
        live: false,
        note: "Cobertura ainda não validada — pode não retornar resultados agora.",
    },
    {
        id: "carrosnaweb",
        label: "CarrosNaWeb",
        classification: "Ficha técnica (BR)",
        reliability: 2,
        live: false,
        note: "Cobertura ainda não validada — pode não retornar resultados agora.",
    },
    {
        id: "flatout",
        label: "FlatOut",
        classification: "Imprensa / Ficha técnica (BR)",
        reliability: 2,
        live: false,
        note: "Cobertura ainda não validada — pode não retornar resultados agora.",
    },
    {
        id: "autopapo",
        label: "AutoPapo",
        classification: "Imprensa / Ficha técnica (BR)",
        reliability: 2,
        live: false,
        note: "Cobertura ainda não validada — pode não retornar resultados agora.",
    },
    {
        id: "g1",
        label: "G1",
        classification: "Grande imprensa (BR)",
        reliability: 4,
        live: false,
        note: "Fonte confiável (registrada em trustedSources.ts) — cobertura de dados ainda não validada.",
    },
    {
        id: "r7",
        label: "R7 (Record)",
        classification: "Grande imprensa (BR)",
        reliability: 4,
        live: false,
        note: "Fonte confiável (registrada em trustedSources.ts) — cobertura de dados ainda não validada.",
    },
    {
        id: "band",
        label: "Band",
        classification: "Grande imprensa (BR)",
        reliability: 4,
        live: false,
        note: "Fonte confiável (registrada em trustedSources.ts) — cobertura de dados ainda não validada.",
    },
    {
        id: "patents",
        label: "Patentes públicas",
        classification: "Regulatório",
        reliability: 5,
        live: false,
        note: "Em breve — INPI / USPTO / EPO.",
    },
    {
        id: "forums",
        label: "Fóruns automotivos",
        classification: "Comunidade",
        reliability: 2,
        live: false,
        note: "Em breve — sinais não verificados, alta velocidade.",
    },
    {
        id: "press",
        label: "Portais de imprensa",
        classification: "Imprensa",
        reliability: 3,
        live: false,
        note: "Em breve — cobertura jornalística especializada.",
    },
    {
        id: "regulators",
        label: "Órgãos regulatórios",
        classification: "Regulatório",
        reliability: 5,
        live: false,
        note: "Em breve — NHTSA / Euro NCAP / ANATEL.",
    },
    {
        id: "social",
        label: "Redes sociais técnicas",
        classification: "Social",
        reliability: 2,
        live: false,
        note: "Em breve — engenheiros e leakers em X/LinkedIn.",
    },
]

export const LIVE_SOURCE_LABELS = OSINT_SOURCES.filter((s) => s.live).map((s) => s.label)

// mesma ordem/categorias do CATEGORY_KEYWORDS em osint_radar.py
export const CATEGORIES = [
    "Bateria",
    "Powertrain",
    "Carregamento",
    "Dimensões",
    "Software",
    "Aerodinâmica",
    "Materiais",
] as const

export type Category = (typeof CATEGORIES)[number]

// marcas cobertas hoje pelo osint-radar (unicas - cada marca pode ter varios
// modelos coletados, ver getAllVehicleSpecs/getModelsForTarget). "model" aqui
// e so o 1o modelo coletado dessa marca, usado como dica/placeholder na UI.
export const TARGETS = (() => {
    const seen = new Map<string, string>()
    for (const v of vehicleSpecs) {
        if (!seen.has(v.target)) seen.set(v.target, v.model)
    }
    return [...seen.entries()].map(([target, model]) => ({ target, model }))
})()

export function getModelsForTarget(target: string): OsintVehicleSpec[] {
    return vehicleSpecs.filter((v) => v.target === target)
}

// ---------------------------------------------------------------------
// Normalizacao / keyword matching (espelha osint_radar.py em Python)
// ---------------------------------------------------------------------

function stripAccents(text: string): string {
    return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
}

function norm(text: string): string {
    return stripAccents(text).toLowerCase().trim()
}

function containsKeyword(haystack: string, keyword: string): boolean {
    const k = norm(keyword)
    if (!k) return false
    const pattern = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`)
    return pattern.test(haystack)
}

export function parseKeywords(input: string): string[] {
    return input
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
}

function confidenceScore(category: string, matched: boolean): number {
    let score = 60
    if (category !== "Outros") score += 15
    if (matched) score += 20
    return Math.min(score, 95)
}

function withinWindow(discoveredAt: string, days: number): boolean {
    const diffMs = Date.now() - new Date(`${discoveredAt}T00:00:00Z`).getTime()
    const diffDays = diffMs / 86_400_000
    return diffDays <= days
}

function score(row: OsintDiscovery, keywords: string[]): OsintDiscoveryScored {
    const haystack = norm(`${row.field} ${row.value}`)
    const matched = keywords.some((k) => containsKeyword(haystack, k))
    return {
        ...row,
        keywordMatch: matched,
        confidence: confidenceScore(row.category, matched),
    }
}

// ---------------------------------------------------------------------
// Consultas usadas pelas paginas
// ---------------------------------------------------------------------

export type DiscoveryFilter = {
    target?: string
    /** busca textual no nome do modelo (ex.: "model 3") - substring, sem acento/caixa */
    model?: string
    /** intervalo de ano de producao - so entra no resultado o veiculo cujo
     * periodo de producao tem sobreposicao com [yearFrom, yearTo] */
    yearFrom?: number
    yearTo?: number
    category?: string
    keywords?: string[]
    windowDays?: number
    enabledSources?: string[]
}

function hasPreciseFilter(filter: DiscoveryFilter): boolean {
    return Boolean(filter.target || filter.model || filter.yearFrom != null || filter.yearTo != null)
}

/** Marca+modelo (e opcionalmente ano) que batem com os criterios "precisos"
 * da busca (marca/modelo/ano) - usado pra restringir quais VEICULOS (nao so
 * marcas - uma marca pode ter varios modelos coletados) entram no resultado
 * antes de aplicar categoria/palavras-chave/etc. */
export function getEligibleVehicles(filter: DiscoveryFilter): OsintVehicleSpec[] {
    const modelQuery = filter.model ? norm(filter.model) : ""

    return vehicleSpecs
        .filter((v) => !filter.target || v.target === filter.target)
        .filter((v) => !modelQuery || norm(v.model).includes(modelQuery))
        .filter((v) => {
            if (filter.yearFrom == null && filter.yearTo == null) return true
            if (v.start_year == null) return false // sem dado de ano -> fora de uma busca precisa por ano

            const vEnd = v.end_year ?? new Date().getFullYear()
            const from = filter.yearFrom ?? -Infinity
            const to = filter.yearTo ?? Infinity
            return v.start_year <= to && vEnd >= from
        })
}

function vehicleKey(target: string, model: string): string {
    return `${target}::${model}`
}

export function getYearBounds(): { min: number; max: number } {
    const now = new Date().getFullYear()
    const starts = vehicleSpecs.map((v) => v.start_year).filter((y): y is number => y != null)
    const ends = vehicleSpecs.map((v) => v.end_year ?? now).filter((y): y is number => y != null)
    return {
        min: starts.length ? Math.min(...starts) : now,
        max: ends.length ? Math.max(...ends) : now,
    }
}

export function getDiscoveries(filter: DiscoveryFilter = {}): OsintDiscoveryScored[] {
    const keywords = filter.keywords ?? []
    const eligibleKeys = hasPreciseFilter(filter)
        ? new Set(getEligibleVehicles(filter).map((v) => vehicleKey(v.target, v.model)))
        : null

    return discoveries
        .filter((row) => !eligibleKeys || eligibleKeys.has(vehicleKey(row.target, row.model)))
        .filter((row) => !filter.category || row.category === filter.category)
        .filter((row) => !filter.windowDays || withinWindow(row.discovered_at, filter.windowDays))
        .filter((row) => !filter.enabledSources || filter.enabledSources.includes(row.source))
        .map((row) => score(row, keywords))
        .sort((a, b) => {
            if (a.keywordMatch !== b.keywordMatch) return a.keywordMatch ? -1 : 1
            if (a.confidence !== b.confidence) return b.confidence - a.confidence
            return b.discovered_at.localeCompare(a.discovered_at)
        })
}

export function getTopDiscoveries(n: number, keywords: string[] = []): OsintDiscoveryScored[] {
    return discoveries
        .map((row) => score(row, keywords))
        .sort((a, b) => {
            if (a.keywordMatch !== b.keywordMatch) return a.keywordMatch ? -1 : 1
            return b.confidence - a.confidence
        })
        .slice(0, n)
}

export function getCategoryDistribution(): { category: string; count: number }[] {
    const counts = new Map<string, number>()
    for (const row of discoveries) {
        counts.set(row.category, (counts.get(row.category) ?? 0) + 1)
    }
    return [...counts.entries()]
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
}


export function getSourceDistribution(): { source: string; count: number; pct: number }[] {
    const counts = new Map<string, number>()
    for (const row of discoveries) {
        counts.set(row.source, (counts.get(row.source) ?? 0) + 1)
    }
    const total = discoveries.length
    return [...counts.entries()].map(([source, count]) => ({
        source,
        count,
        pct: total ? Math.round((count / total) * 100) : 0,
    }))
}

export function getDailyVolume(days: number): { label: string; count: number }[] {
    const buckets: { label: string; count: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86_400_000)
        const iso = d.toISOString().slice(0, 10)
        const count = discoveries.filter((row) => row.discovered_at === iso).length
        buckets.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, count })
    }
    return buckets
}

export function getAllVehicleSpecs(): OsintVehicleSpec[] {
    return vehicleSpecs
}

export function getTotalDiscoveries(): number {
    return discoveries.length
}

export function getClassifiedCount(): number {
    return discoveries.filter((r) => r.category !== "Outros").length
}

export function getDiscoveryDelta(days = 7): { pct: number; positive: boolean } {
    const now = Date.now()
    const bucket = (fromDays: number, toDays: number) =>
        discoveries.filter((r) => {
            const t = new Date(`${r.discovered_at}T00:00:00Z`).getTime()
            return t >= now - toDays * 86_400_000 && t < now - fromDays * 86_400_000
        }).length

    const recent = bucket(0, days)
    const prior = bucket(days, days * 2)

    if (prior === 0) return { pct: recent > 0 ? 100 : 0, positive: true }
    const pct = Math.round(((recent - prior) / prior) * 100)
    return { pct: Math.abs(pct), positive: pct >= 0 }
}

// ---------------------------------------------------------------------
// Contexto para o Assistente (RAG simples) - dado a pergunta do usuario,
// busca no dataset OSINT o que for relevante (marca citada + palavras-chave)
// e devolve como texto pra injetar no prompt do modelo local (Ollama).
// ---------------------------------------------------------------------

const STOPWORDS = new Set([
    "qual", "quais", "quando", "quanto", "quanta", "quantos", "quantas",
    "como", "para", "sobre", "esse", "essa", "este", "esta", "aquele",
    "aquela", "mais", "menos", "entre", "onde", "porque", "quero", "saber",
    "pode", "poderia", "fazer", "muito", "pouco", "assim", "dessa", "desse",
    "tudo", "nada", "alguma", "algum", "comparar", "comparativo", "diferença",
    "diferenças", "concorrente", "concorrentes", "resumo", "gostaria",
    "existe", "existem", "tem", "são", "está", "estão", "hoje", "atual",
    "atualmente", "with", "that", "this", "what", "which", "about", "have",
])

function extractKeywords(query: string): string[] {
    return query
        .split(/[^a-zA-ZÀ-ÿ0-9]+/)
        .map((w) => norm(w))
        .filter((w) => w.length >= 4 && !STOPWORDS.has(w))
}

/** Fonte (nome + link quando existir) que alimentou o contexto local
 * devolvido por buildOsintContext - usado pelo Assistant (Henry) pra
 * SEMPRE mostrar na conversa qual fonte esta por tras da resposta, mesmo
 * quando o dado vem do dataset local (nao so no fallback de busca web).
 * Pedido explicito do usuario: "mostrar sempre qual fonte esta sendo
 * consultada". */
export type OsintContextSource = { label: string; url?: string }

function relevantVehiclesFor(query: string): OsintVehicleSpec[] {
    const q = norm(query)
    // tenta achar um MODELO especifico citado na pergunta (ex.: "BYD Dolphin"
    // ou so "Dolphin") - da mais precisao do que so bater a marca, que hoje
    // pode ter varios modelos coletados
    const mentionedVehicles = vehicleSpecs.filter((v) => q.includes(norm(v.model)))
    const mentionedTargets = TARGETS.filter((t) => q.includes(norm(t.target)))

    return mentionedVehicles.length > 0
        ? mentionedVehicles
        : mentionedTargets.flatMap((t) => getModelsForTarget(t.target))
}

function relevantDiscoveriesFor(
    query: string,
    relevantVehicles: OsintVehicleSpec[],
    maxRows: number
): OsintDiscoveryScored[] {
    const keywords = extractKeywords(query)

    // Sem marca/modelo citado, so faz sentido puxar descobertas se alguma
    // REALMENTE bate por palavra-chave (`keywordMatch`) - sem essa trava,
    // getDiscoveries({keywords}) devolve as top-N descobertas por confianca
    // do dataset INTEIRO (keywords so afeta ordenacao, nao filtra), o que
    // injetava ruido nao relacionado a pergunta (ex.: pergunta sobre um
    // assunto fora do catalogo puxava specs aleatorias de outro carro).
    return relevantVehicles.length > 0
        ? relevantVehicles.flatMap((v) => getDiscoveries({ target: v.target, model: v.model, keywords }).slice(0, maxRows))
        : keywords.length > 0
            ? getDiscoveries({ keywords }).filter((r) => r.keywordMatch).slice(0, maxRows)
            : []
}

export function buildOsintContext(query: string, maxRows = 12): string {
    const relevantVehicles = relevantVehiclesFor(query)
    const rows = relevantDiscoveriesFor(query, relevantVehicles, maxRows)

    const specLines = relevantVehicles.map(
        (v) =>
            `${v.target} ${v.model} (specs): bateria ${v.battery_kwh ?? "?"}kWh, potência ${v.power_cv ?? "?"}cv, ` +
            `torque ${v.torque_kgfm ?? "?"}kgfm, autonomia ${v.autonomy_km ?? "?"}km, 0-100 ${v.acceleration_0_100 ?? "?"}s, ` +
            `vel. máx ${v.top_speed_kmh ?? "?"}km/h, peso ${v.weight_kg ?? "?"}kg`
    )

    const discoveryLines = rows.map((r) => `[${r.target} ${r.model} · ${r.source}] ${r.field}: ${r.value}`)

    const context = [...specLines, ...discoveryLines].join("\n")
    return context || NO_OSINT_CONTEXT
}

/** Fontes (Wikipedia/EV Database/sites .br) que alimentaram o contexto
 * local pra essa pergunta - mesma logica de selecao de buildOsintContext,
 * so que devolvendo METADADO de fonte em vez do texto pronto pro prompt. */
export function getOsintContextSources(query: string, maxRows = 12): OsintContextSource[] {
    const relevantVehicles = relevantVehiclesFor(query)
    const rows = relevantDiscoveriesFor(query, relevantVehicles, maxRows)

    const sources = new Map<string, OsintContextSource>()
    for (const v of relevantVehicles) {
        if (v.wikipedia_url) sources.set(v.wikipedia_url, { label: "Wikipedia", url: v.wikipedia_url })
        if (v.evdatabase_url) sources.set(v.evdatabase_url, { label: "EV Database", url: v.evdatabase_url })
    }
    for (const r of rows) {
        const key = r.source_url || r.source
        if (!sources.has(key)) sources.set(key, { label: r.source, url: r.source_url })
    }
    return [...sources.values()]
}

/** Sentinela devolvida por buildOsintContext quando nada bate com a
 * pergunta - o Assistant (Henry) usa isso pra saber quando cair pro
 * fallback de busca web (ver AGENTS.md, regra 3). */
export const NO_OSINT_CONTEXT = "(nenhum dado relevante encontrado no dataset OSINT para essa pergunta)"
