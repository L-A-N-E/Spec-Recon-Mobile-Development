import { useState } from "react"

import {
    Radar,
    Play,
    Filter,
    ExternalLink,
    Sparkles,
    Calendar,
    Shield,
    AlertCircle,
    Search,
    Check,
} from "lucide-react"

function RadarPage() {

    const [target, setTarget] = useState("Tesla")
    const [category, setCategory] = useState("Bateria")
    const [keywords, setKeywords] = useState("estado sólido, 800V, fluxo axial")

    const [scanning, setScanning] = useState(false)

    const [sources, setSources] = useState([
        {
            id: 1,
            label: "Patentes públicas",
            enabled: true,
        },

        {
            id: 2,
            label: "Fóruns automotivos",
            enabled: true,
        },

        {
            id: 3,
            label: "Portais de imprensa",
            enabled: true,
        },

        {
            id: 4,
            label: "Órgãos regulatórios",
            enabled: false,
        },

        {
            id: 5,
            label: "Redes sociais técnicas",
            enabled: false,
        },
    ])

    const discoveries = [
        {
            id: 1,
            source: "Patente",
            competitor: "Tesla",
            category: "Bateria",
            confidence: 92,
            title: "Novo sistema de resfriamento para células 800V",
            summary:
                "Documentação encontrada relacionada a eficiência térmica em plataformas de alta voltagem.",
            date: "2026-05-19",
            tags: ["800V", "Cooling", "Battery"],
        },

        {
            id: 2,
            source: "Imprensa",
            competitor: "BYD",
            category: "Powertrain",
            confidence: 81,
            title: "BYD avança em motores de fluxo axial",
            summary:
                "Rumores e vazamentos apontam novos protótipos com maior densidade energética.",
            date: "2026-05-17",
            tags: ["Axial Flux", "EV", "Motor"],
        },
    ]

    function toggleSource(id: number) {

        setSources((prev) =>
            prev.map((source) =>
                source.id === id
                    ? {
                        ...source,
                        enabled: !source.enabled,
                    }
                    : source
            )
        )
    }

    async function handleScan() {

        setScanning(true)

        setTimeout(() => {
            setScanning(false)
        }, 3000)
    }

    return (
        <div className="px-6 lg:px-10 py-8 max-w-[1600px] mx-auto">

            {/* Header */}
            <div>

                <div className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-3">
                    Radar - OSINT
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-white">
                    Radar de Inteligência
                </h1>

                <p className="mt-3 text-white/45 max-w-3xl leading-relaxed">
                    Configure o alvo, selecione fontes públicas e execute
                    varreduras OSINT automatizadas para identificar sinais,
                    tendências e movimentações estratégicas da concorrência.
                </p>
            </div>

            {/* Layout */}
            <div className="grid lg:grid-cols-[380px_1fr] gap-6 mt-8">

                {/* LEFT */}
                <div className="space-y-6">

                    {/* Config */}
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">

                        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">

                            <Radar className="w-5 h-5 text-blue-400" />

                            <h2 className="font-semibold text-white">
                                Configuração do alvo
                            </h2>
                        </div>

                        <div className="p-6 space-y-5">

                            {/* Marca */}
                            <div>
                                <label className="block text-xs uppercase tracking-[0.2em] text-white/35 mb-2">
                                    Concorrente
                                </label>

                                <select
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    className="
                                        w-full
                                        h-12
                                        px-4
                                        rounded-xl
                                        bg-black/40
                                        border
                                        border-white/10
                                        text-white
                                        outline-none
                                        focus:border-blue-500
                                        transition-colors
                                    "
                                >
                                    <option>Tesla</option>
                                    <option>BYD</option>
                                    <option>Toyota</option>
                                    <option>GM</option>
                                    <option>Rivian</option>
                                </select>
                            </div>

                            {/* Categoria */}
                            <div>
                                <label className="block text-xs uppercase tracking-[0.2em] text-white/35 mb-2">
                                    Categoria técnica
                                </label>

                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="
                                        w-full
                                        h-12
                                        px-4
                                        rounded-xl
                                        bg-black/40
                                        border
                                        border-white/10
                                        text-white
                                        outline-none
                                        focus:border-blue-500
                                        transition-colors
                                    "
                                >
                                    <option>Bateria</option>
                                    <option>Powertrain</option>
                                    <option>Software</option>
                                    <option>Aerodinâmica</option>
                                    <option>Materiais</option>
                                </select>
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="block text-xs uppercase tracking-[0.2em] text-white/35 mb-2">
                                    Palavras-chave
                                </label>

                                <div className="relative">

                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />

                                    <input
                                        type="text"
                                        value={keywords}
                                        onChange={(e) => setKeywords(e.target.value)}
                                        placeholder="separadas por vírgula"
                                        className="
                                            w-full
                                            h-12
                                            pl-11
                                            pr-4
                                            rounded-xl
                                            bg-black/40
                                            border
                                            border-white/10
                                            text-white
                                            placeholder:text-white/20
                                            outline-none
                                            focus:border-blue-500
                                            transition-colors
                                        "
                                    />
                                </div>
                            </div>

                            {/* Time */}
                            <div>

                                <label className="block text-xs uppercase tracking-[0.2em] text-white/35 mb-3">
                                    Janela temporal
                                </label>

                                <div className="grid grid-cols-3 gap-2">

                                    {["7d", "30d", "90d"].map((item, index) => (
                                        <button
                                            key={item}
                                            className={`
                                                h-11
                                                rounded-xl
                                                border
                                                text-sm
                                                font-medium
                                                transition-all
                                                duration-300
                                                cursor-pointer

                                                ${index === 1
                                                    ? "bg-blue-500 border-blue-500 text-white"
                                                    : "border-white/10 text-white/60 hover:bg-white/5"
                                                }
                                            `}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fontes */}
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">

                        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">

                            <Filter className="w-5 h-5 text-blue-400" />

                            <h2 className="font-semibold text-white">
                                Fontes de coleta
                            </h2>
                        </div>

                        <div className="p-4 space-y-2">

                            {sources.map((source) => (

                                <button
                                    key={source.id}
                                    onClick={() => toggleSource(source.id)}
                                    className={`
                                        w-full
                                        flex
                                        items-center
                                        gap-3
                                        p-4
                                        rounded-2xl
                                        border
                                        transition-all
                                        duration-300
                                        cursor-pointer

                                        ${source.enabled
                                            ? "bg-blue-500/10 border-blue-500/20"
                                            : "border-white/5 hover:bg-white/4"
                                        }
                                    `}
                                >

                                    <div className={`
                                        w-5
                                        h-5
                                        rounded-md
                                        border
                                        flex
                                        items-center
                                        justify-center

                                        ${source.enabled
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-white/15"
                                        }
                                    `}>
                                        {source.enabled && (
                                            <Check className="w-3 h-3 text-white" />
                                        )}
                                    </div>

                                    <span className="text-sm text-white/75">
                                        {source.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleScan}
                        disabled={scanning}
                        className="
                            w-full
                            h-14
                            rounded-2xl
                            bg-blue-500
                            hover:bg-blue-400
                            disabled:opacity-60
                            transition-all
                            duration-300
                            flex
                            items-center
                            justify-center
                            gap-3
                            font-semibold
                            text-white
                            shadow-[0_0_30px_rgba(59,130,246,0.25)]
                            cursor-pointer
                        "
                    >
                        <Play className="w-5 h-5" />

                        {scanning
                            ? "Executando varredura..."
                            : "Iniciar varredura OSINT"}
                    </button>

                    {/* Security */}
                    <div className="flex items-start gap-3 px-2">

                        <Shield className="w-4 h-4 text-green-400 mt-0.5" />

                        <p className="text-xs text-white/35 leading-relaxed">
                            Todas as coletas utilizam apenas fontes públicas
                            e dados acessíveis legalmente.
                        </p>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">

                    {/* Header */}
                    <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">

                        <div>

                            <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-2">
                                Resultados
                            </div>

                            <h2 className="text-xl font-semibold text-white">
                                {discoveries.length} descobertas
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-white/40">

                            <Sparkles className="w-4 h-4 text-blue-400" />

                            Ordenado por IA
                        </div>
                    </div>

                    {/* Scanning */}
                    {scanning ? (

                        <div className="py-28 flex flex-col items-center justify-center">

                            <div className="relative w-20 h-20">

                                <div className="absolute inset-0 rounded-full border-2 border-blue-500/15" />

                                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />

                                <Radar className="absolute inset-0 m-auto w-8 h-8 text-blue-400" />
                            </div>

                            <div className="mt-6 text-white font-medium">
                                Conectando às fontes públicas...
                            </div>

                            <div className="mt-2 text-sm text-white/35">
                                USPTO · Reuters · Fóruns · Automotive News
                            </div>
                        </div>

                    ) : (

                        <div className="divide-y divide-white/5">

                            {discoveries.map((item) => (

                                <div
                                    key={item.id}
                                    className="
                                        p-6
                                        hover:bg-white/[0.03]
                                        transition-colors
                                        duration-300
                                    "
                                >

                                    <div className="flex items-start gap-5">

                                        {/* Confidence */}
                                        <div className="
                                            hidden
                                            sm:flex
                                            w-14
                                            h-14
                                            rounded-2xl
                                            border
                                            border-blue-500/20
                                            bg-blue-500/10
                                            items-center
                                            justify-center
                                            text-blue-400
                                            font-semibold
                                        ">
                                            {item.confidence}
                                        </div>

                                        <div className="flex-1">

                                            {/* Top */}
                                            <div className="flex flex-wrap items-center gap-2 mb-3">

                                                <span className="
                                                    px-3
                                                    py-1
                                                    rounded-full
                                                    bg-blue-500/10
                                                    text-blue-400
                                                    text-[11px]
                                                    uppercase
                                                    tracking-wider
                                                ">
                                                    {item.source}
                                                </span>

                                                <span className="text-sm text-white/45">
                                                    {item.competitor}
                                                </span>

                                                <span className="text-white/15">
                                                    •
                                                </span>

                                                <span className="text-sm text-white/45">
                                                    {item.category}
                                                </span>

                                                <div className="ml-auto flex items-center gap-1 text-xs text-white/30">

                                                    <Calendar className="w-3 h-3" />

                                                    {item.date}
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="
                                                text-lg
                                                font-semibold
                                                text-white
                                                hover:text-blue-400
                                                transition-colors
                                                cursor-pointer
                                            ">
                                                {item.title}
                                            </h3>

                                            {/* Summary */}
                                            <p className="mt-3 text-sm leading-relaxed text-white/45">
                                                {item.summary}
                                            </p>

                                            {/* Tags */}
                                            <div className="mt-4 flex flex-wrap items-center gap-2">

                                                {item.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="
                                                            px-3
                                                            py-1
                                                            rounded-full
                                                            bg-white/5
                                                            text-xs
                                                            text-white/45
                                                            font-mono
                                                        "
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}

                                                <button className="
                                                    ml-auto
                                                    flex
                                                    items-center
                                                    gap-2
                                                    text-sm
                                                    text-blue-400
                                                    hover:text-blue-300
                                                    transition-colors
                                                    cursor-pointer
                                                ">
                                                    Ver fonte

                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!scanning && discoveries.length === 0 && (

                        <div className="py-24 px-6 text-center">

                            <AlertCircle className="w-10 h-10 text-white/20 mx-auto mb-4" />

                            <h3 className="text-lg font-medium text-white">
                                Nenhuma descoberta encontrada
                            </h3>

                            <p className="mt-2 text-sm text-white/35">
                                Ajuste os filtros e tente novamente.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RadarPage