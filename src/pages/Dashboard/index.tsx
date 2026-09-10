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
} from "../../lib/osint"

function Dashboard() {

    const totalDiscoveries = getTotalDiscoveries()
    const classifiedCount = getClassifiedCount()
    const delta = getDiscoveryDelta(7)
    const liveSources = OSINT_SOURCES.filter((s) => s.live).length

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

            {/* Main Grid */}
            <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6 mt-8">

                {/* Left */}
                <div className="space-y-6">

                    {/* Intelligence Feed */}
                    <div className="
                        rounded-3xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        backdrop-blur-xl
                        overflow-hidden
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

                                        <div className="flex-1">

                                            <div className="flex items-center justify-between gap-4">

                                                <div className="
                                                    text-lg
                                                    font-semibold
                                                    text-white
                                                    group-hover:text-blue-400
                                                    transition-colors
                                                ">
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
                </div>

                {/* Right */}
                <div className="space-y-6">

                    {/* AI */}
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

                                <Sparkles className="w-3 h-3" />

                                IA Estratégica
                            </div>

                            <h3 className="text-2xl font-bold text-white leading-tight">
                                Tendência emergente detectada em plataformas EV
                            </h3>

                            <p className="mt-4 text-white/60 leading-relaxed">
                                Aumento significativo de pesquisas envolvendo
                                plataformas 800V e sistemas térmicos avançados
                                em concorrentes asiáticos.
                            </p>

                            <button className="
                                mt-6
                                h-12
                                px-5
                                rounded-2xl
                                bg-blue-500
                                hover:bg-blue-400
                                transition-colors
                                text-white
                                font-medium
                                cursor-pointer
                            ">
                                Abrir análise completa
                            </button>
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
            </div>
        </div>
    )
}

export default Dashboard