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
// Fontes de coleta - mesma classificacao usada na tela Radar. Wikipedia e
// EV Database sao as 2 unicas "live" (de fato usadas no scan); o resto
// fica listado/classificado para o usuario ver o que vem a seguir.
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

// concorrentes cobertos hoje pelo osint-radar, na ordem coletada
export const TARGETS = vehicleSpecs.map((v) => ({ target: v.target, model: v.model }))

export const TIME_WINDOWS = [
    { id: "7d", label: "7d", days: 7 },
    { id: "30d", label: "30d", days: 30 },
    { id: "90d", label: "90d", days: 90 },
] as const

export type TimeWindowId = (typeof TIME_WINDOWS)[number]["id"]

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
    category?: string
    keywords?: string[]
    windowDays?: number
    enabledSources?: string[]
}

export function getDiscoveries(filter: DiscoveryFilter = {}): OsintDiscoveryScored[] {
    const keywords = filter.keywords ?? []

    return discoveries
        .filter((row) => !filter.target || row.target === filter.target)
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

export function getVehicleSpec(target: string): OsintVehicleSpec | undefined {
    return vehicleSpecs.find((v) => v.target === target)
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
