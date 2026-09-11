// Camada de acesso ao ranking de vendas/emplacamentos coletado por
// osint-radar/build_sales.py e build_regional.py (fonte: Fenabrave, via
// carrolens.com.br e fenabrave.online). Mesmo padrao de snapshot estatico
// do lib/osint.ts - os JSON sao gerados offline e importados aqui, sem
// backend.

import rawSales from "../data/salesRankings.json"
import rawRegional from "../data/salesByRegion.json"

export type SalesMeta = {
    year_current: number
    year_previous: number
    period_current: string
    period_previous: string
    source: string
    source_url: string
    generated_at: string
    note: string
    revenue_note: string
    revenue_price_source: string
    price_coverage_top_n: number
    price_coverage_count: number
}

export type SalesRankingItem = {
    brand: string
    model: string
    raw_name: string
    slug: string
    source_url: string
    rank_current: number | null
    units_current: number | null
    year_current: number
    rank_previous: number | null
    units_previous: number | null
    year_previous: number
    delta_units: number | null
    delta_pct: number | null
    tracked_in_osint: boolean
    price_avg_estimate: number | null
    revenue_current_estimate: number | null
    revenue_previous_estimate: number | null
}

export type BrandAggregate = {
    brand: string
    units_current: number
    units_previous: number
    revenue_current_estimate: number | null
    revenue_previous_estimate: number | null
    n_models: number
    n_models_tracked_in_osint: number
    n_models_with_price: number
    delta_units: number | null
    delta_pct: number | null
}

type SalesData = {
    meta: SalesMeta
    items: SalesRankingItem[]
    brands: BrandAggregate[]
}

export type StateAggregate = {
    uf: string
    name: string
    region: string
    units: number
}

export type RegionAggregate = {
    region: string
    units: number
    pct: number
}

export type RegionalMeta = {
    month_label: string
    n_models_sample: number
    source: string
    source_url: string
    generated_at: string
    note: string
}

type RegionalData = {
    meta: RegionalMeta
    by_state: StateAggregate[]
    by_region: RegionAggregate[]
}

const data = rawSales as SalesData
const regional = rawRegional as RegionalData

export const SALES_META = data.meta
export const REGIONAL_META = regional.meta

export function getSalesRankings(): SalesRankingItem[] {
    return data.items
}

/** Top N por posicao no ranking do ano atual (ja vem ordenado assim no JSON). */
export function getTopSales(n: number): SalesRankingItem[] {
    return data.items.filter((i) => i.rank_current != null).slice(0, n)
}

/** Maiores altas/quedas de unidades entre os 2 periodos (ver SALES_META.note
 * sobre a comparacao ser parcial-vs-ano-completo, nao YoY estrito). */
export function getTopMovers(n: number): { up: SalesRankingItem[]; down: SalesRankingItem[] } {
    const withDelta = data.items.filter((i) => i.delta_pct != null)
    const sorted = [...withDelta].sort((a, b) => (b.delta_pct ?? 0) - (a.delta_pct ?? 0))
    return {
        up: sorted.slice(0, n),
        down: sorted.slice(-n).reverse(),
    }
}

export function findSalesForVehicle(brand: string, model: string): SalesRankingItem | undefined {
    const b = brand.trim().toLowerCase()
    const m = model.trim().toLowerCase()
    return data.items.find(
        (i) => i.brand.trim().toLowerCase() === b && i.model.trim().toLowerCase() === m
    )
}

export function getBrandAggregates(): BrandAggregate[] {
    return data.brands
}

/** Top N marcas por volume (unidades) no ano atual - ja vem ordenado assim no JSON. */
export function getTopBrandsByVolume(n: number): BrandAggregate[] {
    return data.brands.slice(0, n)
}

/** Marcas com maior alta/queda percentual de unidades entre os 2 periodos.
 * Marca com units_current = 0 fica de fora da lista de QUEDA: isso quase
 * sempre significa que ela simplesmente saiu da amostra top-N de modelos
 * mais vendidos coletada (sales_radar.py só cobre os ~90 mais vendidos
 * nacionalmente), não que vendeu literalmente zero unidades - misturar
 * esse artefato de amostragem com quedas reais (ex.: -60%, ainda vendendo)
 * deixaria a lista dominada por "-100%" sem sinal útil. */
export function getTopBrandGrowth(n: number): { up: BrandAggregate[]; down: BrandAggregate[] } {
    const withDelta = data.brands.filter((b) => b.delta_pct != null)
    const sorted = [...withDelta].sort((a, b) => (b.delta_pct ?? 0) - (a.delta_pct ?? 0))
    const downCandidates = sorted.filter((b) => b.units_current > 0)
    return {
        up: sorted.slice(0, n),
        down: downCandidates.slice(-n).reverse(),
    }
}

/** Top N marcas por faturamento ESTIMADO no ano atual (ver SALES_META.revenue_note). */
export function getTopBrandsByRevenue(n: number): BrandAggregate[] {
    return [...data.brands]
        .filter((b) => b.revenue_current_estimate != null)
        .sort((a, b) => (b.revenue_current_estimate ?? 0) - (a.revenue_current_estimate ?? 0))
        .slice(0, n)
}

export function getStateAggregates(): StateAggregate[] {
    return regional.by_state
}

export function getRegionAggregates(): RegionAggregate[] {
    return regional.by_region
}

export function getTopStates(n: number): StateAggregate[] {
    return regional.by_state.slice(0, n)
}
