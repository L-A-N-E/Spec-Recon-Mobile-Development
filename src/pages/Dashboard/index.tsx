import { useEffect, useMemo, useState } from "react"

import {
    TrendingUp,
    Activity,
    ShieldAlert,
    Globe,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Radar,
    Newspaper,
    Cpu,
    Database,
    CircleAlert,
    Download,
    Search,
    Table2,
    ExternalLink,
    Trophy,
    Wallet,
    MapPin,
} from "lucide-react"

import {
    TARGETS,
    OSINT_SOURCES,
    getTotalDiscoveries,
    getClassifiedCount,
    getDiscoveryDelta,
    getTopDiscoveries,
    getDailyVolume,
    getCategoryDistribution,
    getDiscoveries,
    type OsintDiscoveryScored,
} from "../../lib/osint"

import {
    SALES_META,
    REGIONAL_META,
    getTopMovers,
    getTopSales,
    getSalesRankings,
    getTopBrandGrowth,
    getTopBrandsByRevenue,
    getBrandAggregates,
    getRegionAggregates,
    getTopStates,
    getStateAggregates,
    type SalesRankingItem,
    type BrandAggregate,
    type StateAggregate,
} from "../../lib/sales"

import { getWeeklyNewsCached, type NewsItem } from "../../lib/news"

function formatBRLCompact(value: number): string {
    if (Math.abs(value) >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)} bi`
    if (Math.abs(value) >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)} mi`
    if (Math.abs(value) >= 1_000) return `R$ ${(value / 1_000).toFixed(0)} mil`
    return `R$ ${value.toLocaleString("pt-BR")}`
}

function formatNewsDate(iso: string | null): string {
    if (!iso) return ""
    const diffMs = Date.now() - new Date(iso).getTime()
    const diffHours = Math.round(diffMs / 3_600_000)
    if (diffHours < 1) return "agora há pouco"
    if (diffHours < 24) return `há ${diffHours}h`
    const diffDays = Math.round(diffHours / 24)
    return diffDays === 1 ? "há 1 dia" : `há ${diffDays} dias`
}

const TABLE_ROW_LIMIT = 200

function escapeCsvField(value: string): string {
    const needsQuoting = /[",\n\r;]/.test(value)
    const escaped = value.replace(/"/g, '""')
    return needsQuoting ? `"${escaped}"` : escaped
}

/** Baixa qualquer lista de linhas como CSV - usado pelas tabelas do
 * Dashboard (descobertas OSINT, ranking de vendas, faturamento por marca,
 * vendas por estado). `rows` ja vem no formato final de c\u00E9lula (string),
 * cada fun\u00E7\u00E3o de export monta suas pr\u00F3prias colunas antes de chamar isso. */
function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
    const csv = [header, ...rows]
        .map((row) => row.map((cell) => escapeCsvField(String(cell))).join(","))
        .join("\r\n")

    // BOM no inicio evita acentuacao quebrada quando abre no Excel pt-BR
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

function exportDiscoveriesToCsv(rows: OsintDiscoveryScored[]) {
    downloadCsv(
        "spec-recon-osint",
        ["Concorrente", "Modelo", "Categoria", "Campo", "Valor", "Fonte", "Coletado em"],
        rows.map((r) => [r.target, r.model, r.category, r.field, r.value, r.source, r.discovered_at])
    )
}

function exportSalesRankingToCsv(rows: SalesRankingItem[]) {
    downloadCsv(
        "spec-recon-vendas-ranking",
        ["Marca", "Modelo", "Ranking atual", "Unidades (atual)", "Ranking anterior", "Unidades (anterior)", "Varia\u00E7\u00E3o unidades", "Varia\u00E7\u00E3o %", "Pre\u00E7o m\u00E9dio estimado (FIPE)"],
        rows.map((r) => [
            r.brand,
            r.model,
            r.rank_current ?? "",
            r.units_current ?? "",
            r.rank_previous ?? "",
            r.units_previous ?? "",
            r.delta_units ?? "",
            r.delta_pct ?? "",
            r.price_avg_estimate ?? "",
        ])
    )
}

function exportBrandRevenueToCsv(rows: BrandAggregate[]) {
    downloadCsv(
        "spec-recon-faturamento-por-marca",
        ["Marca", "Unidades (atual)", "Unidades (anterior)", "Faturamento estimado (atual)", "Faturamento estimado (anterior)", "Varia\u00E7\u00E3o %", "N\u00BA modelos", "N\u00BA modelos com pre\u00E7o"],
        rows.map((b) => [
            b.brand,
            b.units_current,
            b.units_previous,
            b.revenue_current_estimate ?? "",
            b.revenue_previous_estimate ?? "",
            b.delta_pct ?? "",
            b.n_models,
            b.n_models_with_price,
        ])
    )
}

function exportStatesToCsv(rows: StateAggregate[]) {
    downloadCsv(
        "spec-recon-vendas-por-estado",
        ["UF", "Estado", "Regi\u00E3o", "Unidades"],
        rows.map((s) => [s.uf, s.name, s.region, s.units])
    )
}

function Dashboard() {

    const totalDiscoveries = getTotalDiscoveries()
    const classifiedCount = getClassifiedCount()
    const delta = getDiscoveryDelta(7)
    const liveSources = OSINT_SOURCES.filter((s) => s.live).length

    const { up: salesTopUp, down: salesTopDown } = useMemo(() => getTopMovers(2), [])
    const topSellers = useMemo(() => getTopSales(10), [])
    const { up: brandGrowthUp, down: brandGrowthDown } = useMemo(() => getTopBrandGrowth(4), [])
    const topBrandsByRevenue = useMemo(() => getTopBrandsByRevenue(6), [])
    const regionAggregates = useMemo(() => getRegionAggregates(), [])
    const topStates = useMemo(() => getTopStates(6), [])
    const maxRegionUnits = Math.max(...regionAggregates.map((r) => r.units), 1)

    // Noticias da semana - busca AO VIVO (nao snapshot estatico, ver
    // lib/news.ts) em AutoData/AutoForum/Automotive Business, pedido
    // explicito do usuario. Roda no mount do Dashboard; "cancelled" evita
    // setState depois do componente desmontar (usuario navega pra outra
    // pagina antes da busca terminar).
    const [weeklyNews, setWeeklyNews] = useState<NewsItem[] | null>(null)
    const [weeklyNewsError, setWeeklyNewsError] = useState(false)

    useEffect(() => {
        let cancelled = false

        getWeeklyNewsCached()
            .then((items) => {
                if (cancelled) return
                if (items.length === 0) setWeeklyNewsError(true)
                setWeeklyNews(items.slice(0, 5))
            })
            .catch(() => {
                if (!cancelled) setWeeklyNewsError(true)
            })

        return () => {
            cancelled = true
        }
    }, [])

    const [tableSearch, setTableSearch] = useState("")
    const [tableTarget, setTableTarget] = useState("Todos")

    const filteredTableRows = useMemo(() => {
        const rows = getDiscoveries({ target: tableTarget === "Todos" ? undefined : tableTarget })
        const q = tableSearch.trim().toLowerCase()
        if (!q) return rows

        return rows.filter(
            (r) =>
                r.field.toLowerCase().includes(q) ||
                r.value.toLowerCase().includes(q) ||
                r.category.toLowerCase().includes(q)
        )
    }, [tableSearch, tableTarget])

    const kpis = [
        {
            title: "Descobertas OSINT",
            value: totalDiscoveries.toLocaleString("pt-BR"),
            change: `${delta.positive ? "+" : "-"}${delta.pct}%`,
            positive: delta.positive,
            icon: Radar,
        },

        {
            title: "Concorrentes monitorados",
            value: String(TARGETS.length),
            change: "+3",
            positive: true,
            icon: Database,
        },

        {
            title: "Specs classificadas",
            value: classifiedCount.toLocaleString("pt-BR"),
            change: `${Math.round((classifiedCount / totalDiscoveries) * 100)}%`,
            positive: true,
            icon: ShieldAlert,
        },

        {
            title: "Fontes ativas",
            value: String(liveSources),
            change: `+${OSINT_SOURCES.length - liveSources} em breve`,
            positive: true,
            icon: CircleAlert,
        },
    ]

    const trends = getTopDiscoveries(20, ["800 V", "solid-state", "axial flux", "fast charge", "kWh", "top speed"])
        .filter((d) => d.value.length <= 60)
        .slice(0, 3)
        .map((d) => ({
            title: `${d.target} · ${d.field}: ${d.value}`,
            source: d.source,
            score: `${d.confidence}%`,
            url: d.source_url,
        }))

    const dailyVolume = getDailyVolume(7)
    const maxDaily = Math.max(...dailyVolume.map((d) => d.count), 1)

    const categoryDistribution = getCategoryDistribution()
        .filter((c) => c.category !== "Outros")
        .slice(0, 4)
        .map((c) => ({
            label: c.category,
            value: `${Math.round((c.count / classifiedCount) * 100)}%`,
        }))

    const modules = [
        {
            title: "Radar",
            desc: "Monitoramento OSINT em tempo real",
            icon: Radar,
        },

        {
            title: "Dashboard",
            desc: "Insights estratégicos e KPIs",
            icon: Activity,
        },

        {
            title: "Grid",
            desc: "Comparação técnica automatizada",
            icon: Cpu,
        },

        {
            title: "Assistente",
            desc: "Análise contextual por IA",
            icon: Sparkles,
        },
    ]

    return (
        <div className="px-6 lg:px-10 py-8 max-w-[1700px] mx-auto">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

                <div>

                    <div className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-3">
                        Dashboard - Inteligência Estratégica
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight text-white">
                        Dashboard de Descobertas
                    </h1>

                    <p className="mt-3 text-white/45 max-w-3xl leading-relaxed">
                        Visão consolidada de sinais estratégicos, tendências,
                        riscos e movimentações competitivas detectadas pela
                        plataforma Spec Recon.
                    </p>
                </div>

                {/* Live */}
                <div className="
                    flex
                    items-center
                    gap-3
                    px-5
                    py-3
                    rounded-2xl
                    border
                    border-green-500/20
                    bg-green-500/10
                    w-fit
                ">

                    <div className="relative flex w-3 h-3">

                        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60" />

                        <span className="relative rounded-full w-3 h-3 bg-green-400" />
                    </div>

                    <span className="text-sm text-green-300 font-medium">
                        Sistema operacional
                    </span>
                </div>
            </div>

            {/* KPI */}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">

                {kpis.map((item) => {

                    const Icon = item.icon

                    return (
                        <div
                            key={item.title}
                            className="
                                group
                                relative
                                overflow-hidden
                                rounded-3xl
                                border
                                border-white/10
                                bg-white/[0.03]
                                backdrop-blur-xl
                                p-6
                                transition-all
                                duration-500
                                hover:border-blue-500/20
                                hover:bg-white/[0.05]
                            "
                        >

                            {/* Glow */}
                            <div className="
                                absolute
                                inset-0
                                opacity-0
                                group-hover:opacity-100
                                transition-opacity
                                duration-500
                                bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_40%)]
                            " />

                            <div className="relative">

                                <div className="flex items-start justify-between">

                                    <div>

                                        <div className="text-sm text-white/45">
                                            {item.title}
                                        </div>

                                        <div className="mt-4 text-4xl font-bold text-white tracking-tight">
                                            {item.value}
                                        </div>
                                    </div>

                                    <div className="
                                        w-14
                                        h-14
                                        rounded-2xl
                                        bg-blue-500/10
                                        border
                                        border-blue-500/10
                                        flex
                                        items-center
                                        justify-center
                                        text-blue-400
                                    ">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-2">

                                    <div className={`
                                        flex
                                        items-center
                                        gap-1
                                        text-sm
                                        font-medium

                                        ${item.positive
                                            ? "text-green-400"
                                            : "text-red-400"
                                        }
                                    `}>

                                        {item.positive ? (
                                            <ArrowUpRight className="w-4 h-4" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4" />
                                        )}

                                        {item.change}
                                    </div>

                                    <span className="text-sm text-white/30">
                                        vs último ciclo
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Noticias da semana - busca ao vivo em 3 fontes de imprensa
                automotiva (AutoData, AutoForum, Automotive Business), ver
                lib/news.ts. Diferente do Feed Estrategico abaixo (que e'
                derivado dos DADOS coletados pelo Radar) - aqui e' noticia
                de verdade, direto dos sites. */}
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">

                <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-blue-400" />
                    </div>

                    <div>
                        <h3 className="font-semibold text-white">
                            Notícias da semana
                        </h3>
                        <p className="text-xs text-white/40">
                            AutoData · AutoForum · Automotive Business
                        </p>
                    </div>
                </div>

                <div className="divide-y divide-white/5">

                    {weeklyNews === null && !weeklyNewsError && (
                        <div className="px-6 py-8 text-sm text-white/35">
                            Buscando as últimas notícias...
                        </div>
                    )}

                    {weeklyNewsError && (weeklyNews === null || weeklyNews.length === 0) && (
                        <div className="px-6 py-8 text-sm text-white/35">
                            Não foi possível buscar notícias agora — tente recarregar a página em instantes.
                        </div>
                    )}

                    {weeklyNews?.map((item, i) => (
                        <a
                            key={`${item.source}-${i}`}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-start justify-between gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-[10px] text-blue-300 uppercase tracking-wide">
                                        {item.source}
                                    </span>
                                    {item.publishedAt && (
                                        <span className="text-[11px] text-white/30">{formatNewsDate(item.publishedAt)}</span>
                                    )}
                                </div>
                                <p className="text-sm text-white/80 truncate">{item.title}</p>
                            </div>

                            <ExternalLink className="w-4 h-4 text-white/25 shrink-0 mt-1" />
                        </a>
                    ))}
                </div>
            </div>

            {/* Main Grid - grid de verdade (nao 2 colunas empilhadas
                independentes) pra linha 1 (Feed Estrategico | Vendas por
                modelo) e linha 2 (Volume+Distribuicao | Ecossistema)
                esticarem pra mesma altura automaticamente (align-items:
                stretch e o default do CSS Grid) - sem isso, a coluna mais
                curta terminava mais cedo e a linha de baixo comecava em
                alturas diferentes entre as 2 colunas. */}
            <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6 mt-8 items-stretch">

                {/* Intelligence Feed */}
                <div className="
                    rounded-3xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    backdrop-blur-xl
                    overflow-hidden
                    flex
                    flex-col
                ">

                        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">

                            <div>

                                <div className="text-xs uppercase tracking-[0.2em] text-blue-400 mb-2">
                                    Feed Estratégico
                                </div>

                                <h2 className="text-xl font-semibold text-white">
                                    Principais movimentações
                                </h2>
                            </div>

                            <Newspaper className="w-5 h-5 text-blue-400" />
                        </div>

                        <div className="divide-y divide-white/5">

                            {trends.map((trend) => (

                                <a
                                    key={trend.title}
                                    href={trend.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="
                                        group
                                        block
                                        p-6
                                        hover:bg-white/[0.03]
                                        transition-all
                                        duration-300
                                        cursor-pointer
                                    "
                                >

                                    <div className="flex items-start gap-4">

                                        <div className="
                                            w-12
                                            h-12
                                            rounded-2xl
                                            bg-blue-500/10
                                            border
                                            border-blue-500/10
                                            flex
                                            items-center
                                            justify-center
                                            text-blue-400
                                        ">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>

                                        <div className="flex-1 min-w-0">

                                            <div className="flex items-start justify-between gap-4">

                                                <div className="
                                                    text-lg
                                                    font-semibold
                                                    text-white
                                                    group-hover:text-blue-400
                                                    transition-colors
                                                    line-clamp-2
                                                " title={trend.title}>
                                                    {trend.title}
                                                </div>

                                                <div className="
                                                    px-3
                                                    py-1
                                                    rounded-full
                                                    bg-green-500/10
                                                    text-green-400
                                                    text-sm
                                                    font-medium
                                                    shrink-0
                                                ">
                                                    {trend.score}
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center gap-2 text-sm text-white/35">

                                                <Globe className="w-4 h-4" />

                                                {trend.source}
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}

                            {trends.length === 0 && (
                                <div className="p-6 text-sm text-white/35">
                                    Nenhum sinal de alta relevância no momento.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Vendas por modelo */}
                    <div className="
                        relative
                        overflow-hidden
                        rounded-3xl
                        border
                        border-blue-500/20
                        bg-blue-500/10
                        p-6
                    ">

                        <div className="
                            absolute
                            inset-0
                            bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_50%)]
                        " />

                        <div className="relative">

                            <div className="
                                inline-flex
                                items-center
                                gap-2
                                px-3
                                py-1
                                rounded-full
                                bg-blue-500/15
                                text-blue-300
                                text-xs
                                uppercase
                                tracking-wider
                                mb-5
                            ">

                                <TrendingUp className="w-3 h-3" />

                                Vendas por modelo
                            </div>

                            <h3 className="text-lg font-semibold text-white leading-tight">
                                {SALES_META.period_current} vs {SALES_META.period_previous}
                            </h3>

                            <p className="mt-2 text-xs text-white/40 leading-relaxed">
                                Fonte: {SALES_META.source}. Comparação entre um
                                ano parcial e um ano fechado — leia como
                                ritmo/tendência, não como variação anual exata.
                            </p>

                            <div className="mt-5 space-y-2.5">

                                {[...salesTopUp, ...salesTopDown].map((item) => (

                                    <div
                                        key={item.slug}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-3
                                            p-3
                                            rounded-xl
                                            bg-white/[0.03]
                                            border
                                            border-white/5
                                        "
                                    >
                                        <div className="min-w-0">

                                            <div className="flex items-center gap-2">

                                                <span className="text-sm text-white/80 truncate">
                                                    {item.brand} {item.model}
                                                </span>

                                                {item.tracked_in_osint && (
                                                    <span className="
                                                        px-1.5
                                                        py-0.5
                                                        rounded-full
                                                        bg-blue-500/15
                                                        text-[10px]
                                                        text-blue-300
                                                        uppercase
                                                        tracking-wide
                                                        shrink-0
                                                    ">
                                                        Radar
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-0.5 text-xs text-white/35">
                                                {(item.units_current ?? 0).toLocaleString("pt-BR")} un. ({SALES_META.year_current}) · {(item.units_previous ?? 0).toLocaleString("pt-BR")} un. ({SALES_META.year_previous})
                                            </div>
                                        </div>

                                        <div className={`
                                            flex
                                            items-center
                                            gap-1
                                            text-sm
                                            font-medium
                                            shrink-0

                                            ${(item.delta_pct ?? 0) >= 0
                                                ? "text-green-400"
                                                : "text-red-400"
                                            }
                                        `}>

                                            {(item.delta_pct ?? 0) >= 0 ? (
                                                <ArrowUpRight className="w-4 h-4" />
                                            ) : (
                                                <ArrowDownRight className="w-4 h-4" />
                                            )}

                                            {Math.abs(item.delta_pct ?? 0)}%
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <a
                                href={SALES_META.source_url}
                                target="_blank"
                                rel="noreferrer"
                                className="
                                    mt-5
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    text-blue-400
                                    hover:text-blue-300
                                    transition-colors
                                    cursor-pointer
                                "
                            >
                                Ver ranking completo

                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Analytics */}
                    <div className="grid lg:grid-cols-2 gap-6">

                        {/* Heatmap fake */}
                        <div className="
                            rounded-3xl
                            border
                            border-white/10
                            bg-white/[0.03]
                            backdrop-blur-xl
                            p-6
                        ">

                            <div className="flex items-center justify-between">

                                <div>

                                    <div className="text-xs uppercase tracking-[0.2em] text-blue-400 mb-2">
                                        Volume
                                    </div>

                                    <h3 className="text-lg font-semibold text-white">
                                        Intensidade de coleta
                                    </h3>
                                </div>

                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>

                            <div className="mt-8 flex items-end gap-3 h-52">

                                {dailyVolume.map((day, index) => (

                                    <div
                                        key={index}
                                        className="flex-1 flex flex-col items-center gap-3"
                                    >

                                        <div
                                            style={{ height: `${Math.max((day.count / maxDaily) * 170, 6)}px` }}
                                            title={`${day.count} descobertas`}
                                            className="
                                                w-full
                                                rounded-t-2xl
                                                bg-gradient-to-t
                                                from-blue-600
                                                to-blue-400
                                                opacity-80
                                                hover:opacity-100
                                                transition-opacity
                                            "
                                        />

                                        <span className="text-xs text-white/30">
                                            {day.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sources */}
                        <div className="
                            rounded-3xl
                            border
                            border-white/10
                            bg-white/[0.03]
                            backdrop-blur-xl
                            p-6
                        ">

                            <div className="flex items-center justify-between">

                                <div>

                                    <div className="text-xs uppercase tracking-[0.2em] text-blue-400 mb-2">
                                        Distribuição
                                    </div>

                                    <h3 className="text-lg font-semibold text-white">
                                        Specs por categoria
                                    </h3>
                                </div>

                                <Database className="w-5 h-5 text-blue-400" />
                            </div>

                            <div className="mt-8 space-y-5">

                                {categoryDistribution.map((item) => (

                                    <div key={item.label}>

                                        <div className="flex items-center justify-between mb-2">

                                            <span className="text-sm text-white/65">
                                                {item.label}
                                            </span>

                                            <span className="text-sm text-white">
                                                {item.value}
                                            </span>
                                        </div>

                                        <div className="
                                            h-3
                                            rounded-full
                                            bg-white/5
                                            overflow-hidden
                                        ">

                                            <div
                                                style={{
                                                    width: item.value,
                                                }}
                                                className="
                                                    h-full
                                                    rounded-full
                                                    bg-gradient-to-r
                                                    from-blue-500
                                                    to-blue-400
                                                "
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Modules */}
                    <div className="
                        rounded-3xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        backdrop-blur-xl
                        p-6
                    ">

                        <div className="text-xs uppercase tracking-[0.2em] text-blue-400 mb-2">
                            Ecossistema
                        </div>

                        <h3 className="text-xl font-semibold text-white">
                            Módulos integrados
                        </h3>

                        <div className="mt-6 space-y-4">

                            {modules.map((module) => {

                                const Icon = module.icon

                                return (
                                    <div
                                        key={module.title}
                                        className="
                                            flex
                                            items-center
                                            gap-4
                                            p-4
                                            rounded-2xl
                                            border
                                            border-white/5
                                            bg-white/[0.02]
                                            hover:bg-white/[0.04]
                                            transition-colors
                                        "
                                    >

                                        <div className="
                                            w-12
                                            h-12
                                            rounded-2xl
                                            bg-blue-500/10
                                            border
                                            border-blue-500/10
                                            flex
                                            items-center
                                            justify-center
                                            text-blue-400
                                        ">
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        <div>

                                            <div className="font-medium text-white">
                                                {module.title}
                                            </div>

                                            <div className="text-sm text-white/40">
                                                {module.desc}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
            </div>

            {/* Vendas - analise completa */}
            <div className="mt-8">

                <div className="flex items-center gap-3 mb-1">

                    <TrendingUp className="w-5 h-5 text-blue-400" />

                    <h2 className="text-xl font-semibold text-white">
                        Vendas — Visão Completa
                    </h2>
                </div>

                <p className="text-sm text-white/40 mb-6">
                    {SALES_META.period_current} vs {SALES_META.period_previous} · fonte: {SALES_META.source}
                </p>

                <div className="grid lg:grid-cols-2 gap-6">

                    {/* Mais vendidos */}
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">

                        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-blue-400" />
                            </div>

                            <div className="min-w-0">
                                <h3 className="font-semibold text-white">
                                    Mais vendidos ({SALES_META.year_current})
                                </h3>
                                <p className="text-xs text-white/40">
                                    Top 10 por unidades acumuladas no ano
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => exportSalesRankingToCsv(getSalesRankings())}
                                title="Exportar ranking completo em CSV"
                                className="ml-auto shrink-0 w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 space-y-1">
                            {topSellers.map((item) => (
                                <div
                                    key={item.slug}
                                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-2 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="w-6 text-sm text-white/30 font-mono shrink-0">
                                            {item.rank_current}
                                        </span>

                                        <span className="min-w-0 flex-1 sm:flex-initial text-sm text-white/80 truncate">
                                            {item.brand} {item.model}
                                        </span>

                                        {item.tracked_in_osint && (
                                            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/15 text-[10px] text-blue-300 uppercase tracking-wide shrink-0">
                                                Radar
                                            </span>
                                        )}
                                    </div>

                                    <span className="pl-9 sm:pl-0 sm:ml-auto text-sm font-medium text-white/70 shrink-0">
                                        {(item.units_current ?? 0).toLocaleString("pt-BR")} un.
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Maiores altas em vendas por marca */}
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">

                        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <ArrowUpRight className="w-5 h-5 text-blue-400" />
                            </div>

                            <div>
                                <h3 className="font-semibold text-white">
                                    Maior variação de vendas — por marca
                                </h3>
                                <p className="text-xs text-white/40">
                                    Soma de unidades de todos os modelos da marca
                                </p>
                            </div>
                        </div>

                        <div className="p-4 space-y-1">
                            {[...brandGrowthUp, ...brandGrowthDown].map((b) => (
                                <div
                                    key={b.brand}
                                    className="flex items-center justify-between gap-3 px-2 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"
                                >
                                    <div className="min-w-0">
                                        <div className="text-sm text-white/80 truncate">{b.brand}</div>
                                        <div className="text-xs text-white/35">
                                            {b.units_current.toLocaleString("pt-BR")} un. ({SALES_META.year_current}) · {b.units_previous.toLocaleString("pt-BR")} un. ({SALES_META.year_previous})
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-1 text-sm font-medium shrink-0 ${(b.delta_pct ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {(b.delta_pct ?? 0) >= 0 ? (
                                            <ArrowUpRight className="w-4 h-4" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4" />
                                        )}
                                        {Math.abs(b.delta_pct ?? 0)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Faturamento estimado por marca */}
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">

                        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-blue-400" />
                            </div>

                            <div className="min-w-0">
                                <h3 className="font-semibold text-white">
                                    Faturamento estimado por marca
                                </h3>
                                <p className="text-xs text-white/40">
                                    Preço médio (Tabela FIPE) × unidades — estimativa, não faturamento contábil
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => exportBrandRevenueToCsv(getBrandAggregates())}
                                title="Exportar faturamento por marca completo em CSV"
                                className="ml-auto shrink-0 w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 space-y-1">
                            {topBrandsByRevenue.map((b) => (
                                <div
                                    key={b.brand}
                                    className="flex items-center justify-between gap-3 px-2 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"
                                >
                                    <div className="min-w-0">
                                        <div className="text-sm text-white/80 truncate">{b.brand}</div>
                                        <div className="text-xs text-white/35">
                                            {b.n_models_with_price}/{b.n_models} modelos com preço estimado
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="text-sm font-medium text-white/80">
                                            {formatBRLCompact(b.revenue_current_estimate ?? 0)}
                                        </div>
                                        <div className="text-xs text-white/35">
                                            {SALES_META.year_current} · {b.revenue_previous_estimate != null ? formatBRLCompact(b.revenue_previous_estimate) : "—"} ({SALES_META.year_previous})
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-4 border-t border-white/10 text-xs text-white/30 leading-relaxed">
                            {SALES_META.revenue_note}
                        </div>
                    </div>

                    {/* Vendas por regiao */}
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">

                        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-blue-400" />
                            </div>

                            <div className="min-w-0">
                                <h3 className="font-semibold text-white">
                                    Vendas por região
                                </h3>
                                <p className="text-xs text-white/40">
                                    {REGIONAL_META.month_label} · amostra dos {REGIONAL_META.n_models_sample} modelos mais vendidos do Brasil
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => exportStatesToCsv(getStateAggregates())}
                                title="Exportar vendas por estado (UF) completo em CSV"
                                className="ml-auto shrink-0 w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-3">
                            {regionAggregates.map((r) => (
                                <div key={r.region}>
                                    <div className="flex items-center justify-between text-sm mb-1.5">
                                        <span className="text-white/70">{r.region}</span>
                                        <span className="text-white/40">
                                            {r.units.toLocaleString("pt-BR")} un. · {r.pct}%
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-blue-500"
                                            style={{ width: `${Math.max((r.units / maxRegionUnits) * 100, 3)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="pt-3 mt-1 border-t border-white/10">
                                <div className="text-xs uppercase tracking-[0.2em] text-white/30 mb-2">
                                    Top estados
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {topStates.map((s) => (
                                        <span
                                            key={s.uf}
                                            className="px-2.5 py-1 rounded-full bg-white/5 text-xs text-white/60"
                                        >
                                            {s.uf} · {s.units.toLocaleString("pt-BR")} un.
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-white/10 text-xs text-white/30 leading-relaxed">
                            {REGIONAL_META.note}
                        </div>
                    </div>

                </div>

                {/* Tabela de dados OSINT */}
                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">

                    <div className="px-6 py-5 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Table2 className="w-5 h-5 text-blue-400" />
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white">
                                    Dados extraídos (OSINT)
                                </h3>

                                <p className="text-sm text-white/40">
                                    {filteredTableRows.length.toLocaleString("pt-BR")} registros · Wikipedia + EV Database + iCarros
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />

                                <input
                                    type="text"
                                    value={tableSearch}
                                    onChange={(e) => setTableSearch(e.target.value)}
                                    placeholder="Buscar campo ou valor..."
                                    className="
                                        h-10
                                        w-56
                                        pl-9
                                        pr-3
                                        rounded-xl
                                        bg-black/40
                                        border
                                        border-white/10
                                        text-sm
                                        text-white
                                        placeholder:text-white/20
                                        outline-none
                                        focus:border-blue-500
                                        transition-colors
                                    "
                                />
                            </div>

                            <select
                                value={tableTarget}
                                onChange={(e) => setTableTarget(e.target.value)}
                                className="
                                    h-10
                                    px-3
                                    rounded-xl
                                    bg-black/40
                                    border
                                    border-white/10
                                    text-sm
                                    text-white
                                    outline-none
                                    focus:border-blue-500
                                    transition-colors
                                "
                            >
                                <option value="Todos">Todos os concorrentes</option>

                                {TARGETS.map((t) => (
                                    <option key={t.target} value={t.target}>
                                        {t.target}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={() => exportDiscoveriesToCsv(filteredTableRows)}
                                disabled={filteredTableRows.length === 0}
                                className="
                                    h-10
                                    px-4
                                    rounded-xl
                                    bg-blue-500
                                    hover:bg-blue-400
                                    disabled:opacity-40
                                    disabled:cursor-not-allowed
                                    transition-colors
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    font-medium
                                    text-white
                                    cursor-pointer
                                "
                            >
                                <Download className="w-4 h-4" />
                                Exportar CSV
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="max-h-[520px] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-[#0b1220] z-10">
                                    <tr className="text-left text-xs uppercase tracking-wider text-white/35 border-b border-white/10">
                                        <th className="px-6 py-3 font-medium">Concorrente</th>
                                        <th className="px-4 py-3 font-medium">Categoria</th>
                                        <th className="px-4 py-3 font-medium">Campo</th>
                                        <th className="px-4 py-3 font-medium">Valor</th>
                                        <th className="px-4 py-3 font-medium">Fonte</th>
                                        <th className="px-6 py-3 font-medium text-right">Coletado em</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-white/5">
                                    {filteredTableRows.slice(0, TABLE_ROW_LIMIT).map((row) => (
                                        <tr key={row.id} className="hover:bg-white/[0.03] transition-colors">
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <div className="font-medium text-white">{row.target}</div>
                                                <div className="text-xs text-white/35">{row.model}</div>
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-white/60">
                                                {row.category}
                                            </td>

                                            <td className="px-4 py-3 text-white/80 max-w-[220px] truncate" title={row.field}>
                                                {row.field}
                                            </td>

                                            <td className="px-4 py-3 text-white/45 max-w-[360px] truncate" title={row.value}>
                                                {row.value}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[11px] uppercase tracking-wider">
                                                    {row.source}
                                                </span>
                                            </td>

                                            <td className="px-6 py-3 whitespace-nowrap text-right text-white/35">
                                                {row.discovered_at}
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredTableRows.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-white/35">
                                                Nenhum registro encontrado para esse filtro.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {filteredTableRows.length > TABLE_ROW_LIMIT && (
                        <div className="px-6 py-3 border-t border-white/10 text-xs text-white/30">
                            Mostrando os {TABLE_ROW_LIMIT} registros mais recentes de {filteredTableRows.length.toLocaleString("pt-BR")} — exporte o CSV para ver todos.
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default Dashboard