import { useEffect, useRef, useState } from "react"

import {
    Radar,
    Play,
    Filter,
    ChevronDown,
    ExternalLink,
    Sparkles,
    Calendar,
    Shield,
    AlertCircle,
    Search,
    Check,
    Star,
    KeyRound,
    Clock,
} from "lucide-react"

import {
    OSINT_SOURCES,
    CATEGORIES,
    TARGETS,
    getDiscoveries,
    getYearBounds,
    parseKeywords,
    type OsintDiscoveryScored,
} from "../../lib/osint"

const CATEGORY_OPTIONS = ["Todas", ...CATEGORIES]
const MARCA_TODAS = "Todas as marcas"
const YEAR_BOUNDS = getYearBounds()

type SearchState = {
    target: string
    model: string
    yearFrom: string
    yearTo: string
    category: string
    keywords: string
}

const DEFAULT_SEARCH: SearchState = {
    target: MARCA_TODAS,
    model: "",
    yearFrom: "",
    yearTo: "",
    category: "Todas",
    keywords: "",
}

function RadarPage() {

    const [target, setTarget] = useState(DEFAULT_SEARCH.target)
    const [model, setModel] = useState(DEFAULT_SEARCH.model)
    const [yearFrom, setYearFrom] = useState(DEFAULT_SEARCH.yearFrom)
    const [yearTo, setYearTo] = useState(DEFAULT_SEARCH.yearTo)
    const [category, setCategory] = useState(DEFAULT_SEARCH.category)
    const [keywords, setKeywords] = useState(DEFAULT_SEARCH.keywords)

    const [scanning, setScanning] = useState(false)

    const [sources, setSources] = useState(
        OSINT_SOURCES.map((source) => ({
            ...source,
            enabled: true, // todas as fontes disponiveis pra busca, todas marcadas por padrao
        }))
    )

    const [sourcesMenuOpen, setSourcesMenuOpen] = useState(false)
    const sourcesMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (sourcesMenuRef.current && !sourcesMenuRef.current.contains(e.target as Node)) {
                setSourcesMenuOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const [discoveries, setDiscoveries] = useState<OsintDiscoveryScored[]>(() =>
        runQuery(DEFAULT_SEARCH, OSINT_SOURCES.map((s) => s.label))
    )

    function runQueryFromState() {
        const enabledSourceLabels = sources.filter((s) => s.enabled).map((s) => s.label)
        return runQuery({ target, model, yearFrom, yearTo, category, keywords }, enabledSourceLabels)
    }

    function toggleSource(id: string) {

        setSources((prev) =>
            prev.map((source) =>
                source.id === id
                    ? { ...source, enabled: !source.enabled }
                    : source
            )
        )
    }

    const enabledSourceCount = sources.filter((s) => s.enabled).length
    const allSourcesSelected = enabledSourceCount === sources.length

    function toggleAllSources() {
        const nextEnabled = !allSourcesSelected
        setSources((prev) => prev.map((source) => ({ ...source, enabled: nextEnabled })))
    }

    const sourcesMenuLabel =
        enabledSourceCount === 0
            ? "Nenhuma fonte selecionada"
            : allSourcesSelected
                ? "Todas as fontes"
                : `${enabledSourceCount} de ${sources.length} fontes`

    async function handleScan() {

        setScanning(true)

        setTimeout(() => {
            setDiscoveries(runQueryFromState())
            setScanning(false)
        }, 900)
    }

    const targetModel = TARGETS.find((t) => t.target === target)?.model

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
                                    <option value={MARCA_TODAS}>{MARCA_TODAS}</option>

                                    {TARGETS.map((t) => (
                                        <option key={t.target} value={t.target}>
                                            {t.target}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Modelo */}
                            <div>
                                <label className="block text-xs uppercase tracking-[0.2em] text-white/35 mb-2">
                                    Modelo
                                </label>

                                <input
                                    type="text"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder={targetModel ? `ex.: ${targetModel}` : "nome do modelo (opcional)"}
                                    className="
                                        w-full
                                        h-12
                                        px-4
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

                            {/* Ano */}
                            <div>
                                <label className="block text-xs uppercase tracking-[0.2em] text-white/35 mb-2">
                                    Ano de produção ({YEAR_BOUNDS.min}–{YEAR_BOUNDS.max})
                                </label>

                                <div className="grid grid-cols-2 gap-3">

                                    <input
                                        type="number"
                                        value={yearFrom}
                                        onChange={(e) => setYearFrom(e.target.value)}
                                        placeholder={`de (${YEAR_BOUNDS.min})`}
                                        min={YEAR_BOUNDS.min}
                                        max={YEAR_BOUNDS.max}
                                        className="
                                            w-full
                                            h-12
                                            px-4
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

                                    <input
                                        type="number"
                                        value={yearTo}
                                        onChange={(e) => setYearTo(e.target.value)}
                                        placeholder={`até (${YEAR_BOUNDS.max})`}
                                        min={YEAR_BOUNDS.min}
                                        max={YEAR_BOUNDS.max}
                                        className="
                                            w-full
                                            h-12
                                            px-4
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

                                <div className="mt-2 text-xs text-white/30">
                                    Só entram concorrentes com produção sobrepondo esse intervalo (dado extraído da Wikipedia).
                                </div>
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
                                    {CATEGORY_OPTIONS.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
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
                        </div>
                    </div>

                    {/* Fontes */}
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-visible">

                        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">

                            <Filter className="w-5 h-5 text-blue-400" />

                            <h2 className="font-semibold text-white">
                                Fontes de coleta
                            </h2>
                        </div>

                        <div className="p-4">

                            <div ref={sourcesMenuRef} className="relative">

                                <button
                                    type="button"
                                    onClick={() => setSourcesMenuOpen((prev) => !prev)}
                                    className="
                                        w-full
                                        h-12
                                        px-4
                                        rounded-xl
                                        bg-black/40
                                        border
                                        border-white/10
                                        text-white
                                        text-sm
                                        outline-none
                                        focus:border-blue-500
                                        transition-colors
                                        cursor-pointer
                                        flex
                                        items-center
                                        justify-between
                                        gap-3
                                    "
                                >
                                    <span className={enabledSourceCount === 0 ? "text-white/35" : "text-white/85"}>
                                        {sourcesMenuLabel}
                                    </span>

                                    <ChevronDown
                                        className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-200 ${
                                            sourcesMenuOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {sourcesMenuOpen && (

                                    <div className="
                                        absolute
                                        z-20
                                        left-0
                                        right-0
                                        mt-2
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-black/95
                                        backdrop-blur-xl
                                        shadow-2xl
                                        overflow-hidden
                                    ">

                                        {/* Selecionar todas */}
                                        <button
                                            type="button"
                                            onClick={toggleAllSources}
                                            className="
                                                w-full
                                                flex
                                                items-center
                                                gap-3
                                                px-4
                                                py-3
                                                border-b
                                                border-white/10
                                                bg-white/[0.03]
                                                hover:bg-white/[0.06]
                                                transition-colors
                                                duration-200
                                                cursor-pointer
                                            "
                                        >
                                            <div className={`
                                                w-5
                                                h-5
                                                shrink-0
                                                rounded-md
                                                border
                                                flex
                                                items-center
                                                justify-center

                                                ${allSourcesSelected
                                                    ? "bg-blue-500 border-blue-500"
                                                    : "border-white/15"
                                                }
                                            `}>
                                                {allSourcesSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>

                                            <span className="text-sm font-medium text-white/85">
                                                Selecionar todas as fontes
                                            </span>

                                            <span className="ml-auto text-xs text-white/30">
                                                {enabledSourceCount}/{sources.length}
                                            </span>
                                        </button>

                                        <div className="max-h-80 overflow-y-auto p-2 space-y-1">

                                            {sources.map((source) => (

                                                <button
                                                    key={source.id}
                                                    type="button"
                                                    onClick={() => toggleSource(source.id)}
                                                    className={`
                                                        w-full
                                                        flex
                                                        items-start
                                                        gap-3
                                                        p-3
                                                        rounded-xl
                                                        border
                                                        cursor-pointer
                                                        transition-all
                                                        duration-300

                                                        ${source.enabled
                                                            ? "bg-blue-500/10 border-blue-500/20"
                                                            : "border-transparent hover:bg-white/4"
                                                        }
                                                    `}
                                                >

                                                    <div className={`
                                                        mt-0.5
                                                        w-5
                                                        h-5
                                                        shrink-0
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

                                                    <div className="flex-1 text-left">

                                                        <div className="flex items-center gap-2 flex-wrap">

                                                            <span className="text-sm text-white/75">
                                                                {source.label}
                                                            </span>

                                                            <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] uppercase tracking-wider text-white/40">
                                                                {source.classification}
                                                            </span>

                                                            {source.live ? (
                                                                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-[10px] uppercase tracking-wider text-green-400">
                                                                    Ativo
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[10px] uppercase tracking-wider text-amber-400">
                                                                    Beta
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="mt-1 flex items-center gap-2">

                                                            <div className="flex items-center gap-0.5">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-3 h-3 ${
                                                                            i < source.reliability
                                                                                ? "text-blue-400 fill-blue-400"
                                                                                : "text-white/15"
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>

                                                            <span className="text-xs text-white/30">
                                                                {source.note}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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
                            e dados acessíveis legalmente (hoje: Wikipedia,
                            EV Database e iCarros — 11 fontes adicionais em
                            validação, incluindo grandes veículos de
                            comunicação como G1, R7 e Band).
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

                            Ordenado por relevância
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
                                {sources.filter((s) => s.enabled && s.live).map((s) => s.label).join(" · ") || "Nenhuma fonte ativa"}
                            </div>
                        </div>

                    ) : discoveries.length === 0 ? (

                        <div className="py-24 px-6 text-center">

                            <AlertCircle className="w-10 h-10 text-white/20 mx-auto mb-4" />

                            <h3 className="text-lg font-medium text-white">
                                Nenhuma descoberta encontrada
                            </h3>

                            <p className="mt-2 text-sm text-white/35">
                                Ajuste os filtros (marca, modelo, ano, categoria, janela temporal ou fontes) e tente novamente.
                            </p>
                        </div>

                    ) : (

                        <div className="relative">

                            <div className="divide-y divide-white/5 max-h-[70vh] overflow-y-auto">

                            {discoveries.map((item) => (

                                <div
                                    key={item.id}
                                    className={`
                                        p-6
                                        hover:bg-white/[0.03]
                                        transition-colors
                                        duration-300

                                        ${item.keywordMatch ? "bg-blue-500/[0.03]" : ""}
                                    `}
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
                                                    {item.target}
                                                </span>

                                                <span className="text-white/15">
                                                    •
                                                </span>

                                                <span className="text-sm text-white/45">
                                                    {item.category}
                                                </span>

                                                {item.keywordMatch && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 text-[11px]">
                                                        <KeyRound className="w-3 h-3" />
                                                        palavra-chave
                                                    </span>
                                                )}

                                                <div className="ml-auto flex items-center gap-1 text-xs text-white/30">

                                                    <Calendar className="w-3 h-3" />

                                                    {item.discovered_at}
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="
                                                text-lg
                                                font-semibold
                                                text-white
                                            ">
                                                {item.field}
                                            </h3>

                                            {/* Summary */}
                                            <p className="mt-3 text-sm leading-relaxed text-white/45 break-words">
                                                {item.value}
                                            </p>

                                            {/* Tags */}
                                            <div className="mt-4 flex flex-wrap items-center gap-2">

                                                <span className="
                                                    px-3
                                                    py-1
                                                    rounded-full
                                                    bg-white/5
                                                    text-xs
                                                    text-white/45
                                                    font-mono
                                                ">
                                                    {item.model}
                                                </span>

                                                <a
                                                    href={item.source_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="
                                                        ml-auto
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
                                                    Ver fonte

                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            </div>

                            {/* Blur indicando que ha mais itens pra rolar - sem escurecer,
                                so desfoca (os itens continuam visiveis por baixo) */}
                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    inset-x-0
                                    bottom-0
                                    h-20
                                    rounded-b-3xl
                                    backdrop-blur-md
                                    [mask-image:linear-gradient(to_top,black,transparent)]
                                    [-webkit-mask-image:linear-gradient(to_top,black,transparent)]
                                "
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/25">
                <Clock className="w-3.5 h-3.5" />
                Dados coletados via osint-radar (Python) · Wikipedia + EV Database + iCarros + 11 fontes em validação
            </div>
        </div>
    )
}

function runQuery(search: SearchState, enabledSourceLabels: string[]) {
    const yearFrom = search.yearFrom.trim() ? Number(search.yearFrom) : undefined
    const yearTo = search.yearTo.trim() ? Number(search.yearTo) : undefined

    return getDiscoveries({
        target: search.target === MARCA_TODAS ? undefined : search.target,
        model: search.model.trim() || undefined,
        yearFrom: yearFrom != null && !Number.isNaN(yearFrom) ? yearFrom : undefined,
        yearTo: yearTo != null && !Number.isNaN(yearTo) ? yearTo : undefined,
        category: search.category === "Todas" ? undefined : search.category,
        keywords: parseKeywords(search.keywords),
        enabledSources: enabledSourceLabels,
    })
}

export default RadarPage
