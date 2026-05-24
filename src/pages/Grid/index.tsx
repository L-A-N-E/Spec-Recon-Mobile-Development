import { useMemo, useState } from "react"

import {
    GitCompare,
    TrendingUp,
    TrendingDown,
    Minus,
    Gauge,
    BatteryCharging,
    Cpu,
    ArrowRightLeft,
    Fuel,
    Weight,
} from "lucide-react"

type VehicleSpec = {
    id: string
    brand: string
    name: string
    segment: string
    powertrain: string
    power_cv: number
    torque_kgfm: number
    autonomy_km: number
    tank_l: number
    acceleration_0_100: number
    top_speed_kmh: number
    weight_kg: number
    towing_kg: number
    price_brl: number
}

const fordVehicles: VehicleSpec[] = [
    {
        id: "ranger-raptor",
        brand: "Ford",
        name: "Ranger Raptor",
        segment: "Pickup",
        powertrain: "3.0 V6 Biturbo Gasolina",
        power_cv: 397,
        torque_kgfm: 59.5,
        autonomy_km: 650,
        tank_l: 80,
        acceleration_0_100: 5.8,
        top_speed_kmh: 180,
        weight_kg: 2454,
        towing_kg: 2500,
        price_brl: 490000,
    },

    {
        id: "f150-raptor",
        brand: "Ford",
        name: "F-150 Raptor",
        segment: "Pickup",
        powertrain: "3.5 V6 EcoBoost",
        power_cv: 456,
        torque_kgfm: 70,
        autonomy_km: 700,
        tank_l: 136,
        acceleration_0_100: 5.3,
        top_speed_kmh: 180,
        weight_kg: 2670,
        towing_kg: 3700,
        price_brl: 750000,
    },

    {
        id: "mustang-mach-e",
        brand: "Ford",
        name: "Mustang Mach-E GT",
        segment: "SUV",
        powertrain: "Elétrico",
        power_cv: 487,
        torque_kgfm: 87.7,
        autonomy_km: 500,
        tank_l: 0,
        acceleration_0_100: 3.8,
        top_speed_kmh: 200,
        weight_kg: 2250,
        towing_kg: 750,
        price_brl: 650000,
    },
]

const competitorVehicles: VehicleSpec[] = [
    {
        id: "hilux-grs",
        brand: "Toyota",
        name: "Hilux GR-Sport",
        segment: "Pickup",
        powertrain: "2.8 Turbo Diesel",
        power_cv: 224,
        torque_kgfm: 55,
        autonomy_km: 1000,
        tank_l: 80,
        acceleration_0_100: 9.8,
        top_speed_kmh: 180,
        weight_kg: 2240,
        towing_kg: 3500,
        price_brl: 390000,
    },

    {
        id: "ram-rampage",
        brand: "RAM",
        name: "Rampage R/T",
        segment: "Pickup",
        powertrain: "2.0 Hurricane Turbo",
        power_cv: 272,
        torque_kgfm: 40.8,
        autonomy_km: 700,
        tank_l: 60,
        acceleration_0_100: 6.9,
        top_speed_kmh: 220,
        weight_kg: 1940,
        towing_kg: 750,
        price_brl: 300000,
    },

    {
        id: "silverado",
        brand: "Chevrolet",
        name: "Silverado High Country",
        segment: "Pickup",
        powertrain: "5.3 V8",
        power_cv: 360,
        torque_kgfm: 53,
        autonomy_km: 650,
        tank_l: 91,
        acceleration_0_100: 6.5,
        top_speed_kmh: 190,
        weight_kg: 2530,
        towing_kg: 4100,
        price_brl: 540000,
    },
]

const specs: {
    key: keyof VehicleSpec
    label: string
    unit: string
    higherBetter: boolean
}[] = [
        {
            key: "power_cv",
            label: "Potência",
            unit: "cv",
            higherBetter: true,
        },

        {
            key: "torque_kgfm",
            label: "Torque",
            unit: "kgfm",
            higherBetter: true,
        },

        {
            key: "autonomy_km",
            label: "Autonomia",
            unit: "km",
            higherBetter: true,
        },

        {
            key: "tank_l",
            label: "Tanque",
            unit: "L",
            higherBetter: true,
        },

        {
            key: "acceleration_0_100",
            label: "0-100 km/h",
            unit: "s",
            higherBetter: false,
        },

        {
            key: "top_speed_kmh",
            label: "Velocidade Máx.",
            unit: "km/h",
            higherBetter: true,
        },

        {
            key: "weight_kg",
            label: "Peso",
            unit: "kg",
            higherBetter: false,
        },

        {
            key: "towing_kg",
            label: "Capacidade Reboque",
            unit: "kg",
            higherBetter: true,
        },

        {
            key: "price_brl",
            label: "Preço",
            unit: "R$",
            higherBetter: false,
        },
    ]

function Grid() {

    // DEFAULT = Ranger Raptor x Hilux
    const [fordId, setFordId] = useState("ranger-raptor")
    const [competitorId, setCompetitorId] = useState("hilux-grs")

    const ford = useMemo(
        () => fordVehicles.find((v) => v.id === fordId)!,
        [fordId]
    )

    const competitor = useMemo(
        () => competitorVehicles.find((v) => v.id === competitorId)!,
        [competitorId]
    )

    const fordWins = specs.filter((spec) =>
        isWinner(
            ford[spec.key] as number,
            competitor[spec.key] as number,
            spec.higherBetter
        )
    ).length

    const competitorWins = specs.length - fordWins

    return (
        <div className="px-6 lg:px-10 py-8 text-white">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

                <div>

                    <div className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-3">
                        Grid - Comparação Técnica
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight">
                        Grid Competitivo
                    </h1>

                    <p className="mt-4 text-white/50 max-w-2xl leading-relaxed">
                        Compare veículos Ford com concorrentes globais
                        utilizando benchmark estratégico automatizado.
                    </p>
                </div>

                <div className="flex items-center gap-3">

                    <div className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03]">
                        <div className="text-xs text-white/40 uppercase">
                            Specs analisadas
                        </div>

                        <div className="text-2xl font-bold mt-1">
                            {specs.length}
                        </div>
                    </div>

                    <div className="px-4 py-2 rounded-xl border border-blue-500/20 bg-blue-500/10">
                        <div className="text-xs text-blue-300 uppercase">
                            Score Ford
                        </div>

                        <div className="text-2xl font-bold mt-1">
                            {fordWins}
                        </div>
                    </div>
                </div>
            </div>

            {/* Score */}
            <div className="mt-8 grid lg:grid-cols-3 gap-5">

                <ScoreCard
                    title="Ford"
                    value={fordWins}
                    subtitle="Parâmetros vencidos"
                    icon={TrendingUp}
                />

                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-6 flex items-center justify-center">

                    <div className="text-center">

                        <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mx-auto mb-4">
                            <ArrowRightLeft className="w-7 h-7" />
                        </div>

                        <div className="text-lg font-semibold">
                            Side-by-side Analysis
                        </div>

                        <div className="text-sm text-white/40 mt-1">
                            Benchmark competitivo automatizado
                        </div>
                    </div>
                </div>

                <ScoreCard
                    title={competitor.brand}
                    value={competitorWins}
                    subtitle="Parâmetros vencidos"
                    icon={TrendingDown}
                />
            </div>

            {/* Selectors */}
            <div className="grid lg:grid-cols-2 gap-6 mt-8">

                <VehicleCard
                    title="Plataforma Ford"
                    vehicle={ford}
                    vehicles={fordVehicles}
                    selected={fordId}
                    onChange={setFordId}
                    highlight
                />

                <VehicleCard
                    title="Concorrente"
                    vehicle={competitor}
                    vehicles={competitorVehicles}
                    selected={competitorId}
                    onChange={setCompetitorId}
                />
            </div>

            {/* Comparison */}
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">

                <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <GitCompare className="w-5 h-5 text-blue-400" />
                    </div>

                    <div>

                        <h3 className="font-semibold text-lg">
                            Comparação Técnica
                        </h3>

                        <p className="text-sm text-white/40">
                            Deltas competitivos calculados em tempo real
                        </p>
                    </div>
                </div>

                <div className="divide-y divide-white/5">

                    {specs.map((spec) => {

                        const fordValue = ford[spec.key] as number
                        const competitorValue = competitor[spec.key] as number

                        const fordWin = isWinner(
                            fordValue,
                            competitorValue,
                            spec.higherBetter
                        )

                        const competitorWin = isWinner(
                            competitorValue,
                            fordValue,
                            spec.higherBetter
                        )

                        const delta =
                            ((fordValue - competitorValue) /
                                competitorValue) * 100

                        return (
                            <div
                                key={spec.key}
                                className="
                    px-4
                    lg:px-6
                    py-5

                    hover:bg-white/[0.02]
                    transition-colors
                "
                            >

                                {/* MOBILE */}
                                <div className="lg:hidden space-y-4">

                                    <div className="flex items-center justify-between">

                                        <div className="text-sm font-medium">
                                            {spec.label}
                                        </div>

                                        <div className="flex items-center gap-1 text-xs text-white/40">

                                            {delta > 0 ? (
                                                <TrendingUp className="w-3 h-3 text-green-400" />
                                            ) : delta < 0 ? (
                                                <TrendingDown className="w-3 h-3 text-red-400" />
                                            ) : (
                                                <Minus className="w-3 h-3" />
                                            )}

                                            {Math.abs(delta).toFixed(1)}%
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">

                                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                                            <div className="text-xs text-white/30 mb-2">
                                                {ford.brand}
                                            </div>

                                            <SpecValue
                                                value={fordValue}
                                                unit={spec.unit}
                                                winner={fordWin}
                                                align="left"
                                            />
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                                            <div className="text-xs text-white/30 mb-2">
                                                {competitor.brand}
                                            </div>

                                            <SpecValue
                                                value={competitorValue}
                                                unit={spec.unit}
                                                winner={competitorWin}
                                                align="left"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* DESKTOP */}
                                <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] gap-4 items-center">

                                    <SpecValue
                                        value={fordValue}
                                        unit={spec.unit}
                                        winner={fordWin}
                                        align="right"
                                    />

                                    <div className="min-w-[150px] text-center">

                                        <div className="text-sm font-medium">
                                            {spec.label}
                                        </div>

                                        <div className="mt-1 flex items-center justify-center gap-1 text-xs text-white/40">

                                            {delta > 0 ? (
                                                <TrendingUp className="w-3 h-3 text-green-400" />
                                            ) : delta < 0 ? (
                                                <TrendingDown className="w-3 h-3 text-red-400" />
                                            ) : (
                                                <Minus className="w-3 h-3" />
                                            )}

                                            {Math.abs(delta).toFixed(1)}%
                                        </div>
                                    </div>

                                    <SpecValue
                                        value={competitorValue}
                                        unit={spec.unit}
                                        winner={competitorWin}
                                        align="left"
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Insights */}
            <div className="grid lg:grid-cols-3 gap-5 mt-8">

                <InsightCard
                    icon={Gauge}
                    title="Performance"
                    text={`${ford.name} entrega ${ford.power_cv}cv e ${ford.torque_kgfm}kgfm de torque.`}
                />

                <InsightCard
                    icon={Fuel}
                    title="Autonomia"
                    text={`${competitor.name} possui autonomia estimada de ${competitor.autonomy_km}km.`}
                />

                <InsightCard
                    icon={Weight}
                    title="Capacidade"
                    text={`${competitor.name} suporta até ${competitor.towing_kg}kg de reboque.`}
                />
            </div>

            {/* Footer */}
            <div className="mt-10 text-center text-xs uppercase tracking-[0.25em] text-white/20">
                Ford Motor Company · Spec Recon Grid Engine
            </div>
        </div>
    )
}

function VehicleCard({
    title,
    vehicle,
    vehicles,
    selected,
    onChange,
    highlight = false,
}: {
    title: string
    vehicle: VehicleSpec
    vehicles: VehicleSpec[]
    selected: string
    onChange: (value: string) => void
    highlight?: boolean
}) {
    return (
        <div
            className={`
                rounded-3xl
                border
                p-6
                bg-white/[0.03]

                ${highlight
                    ? "border-blue-500/20"
                    : "border-white/10"
                }
            `}
        >

            <div className="flex items-center justify-between mb-5">

                <div>

                    <div className="text-xs uppercase tracking-[0.25em] text-white/30">
                        {title}
                    </div>

                    <div className="text-xl font-semibold mt-2">
                        {vehicle.name}
                    </div>
                </div>

                <div className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                    {vehicle.brand}
                </div>
            </div>

            <select
                value={selected}
                onChange={(e) => onChange(e.target.value)}
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
                {vehicles.map((vehicle) => (
                    <option
                        key={vehicle.id}
                        value={vehicle.id}
                    >
                        {vehicle.name}
                    </option>
                ))}
            </select>

            <div className="grid grid-cols-2 gap-4 mt-5">

                <MiniInfo
                    label="Segmento"
                    value={vehicle.segment}
                />

                <MiniInfo
                    label="Motorização"
                    value={vehicle.powertrain}
                />

                <MiniInfo
                    label="Potência"
                    value={`${vehicle.power_cv}cv`}
                />

                <MiniInfo
                    label="Torque"
                    value={`${vehicle.torque_kgfm}kgfm`}
                />
            </div>
        </div>
    )
}

function MiniInfo({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-xl border border-white/5 bg-black/20 p-3">

            <div className="text-xs uppercase tracking-[0.2em] text-white/30">
                {label}
            </div>

            <div className="mt-2 font-medium">
                {value}
            </div>
        </div>
    )
}

function SpecValue({
    value,
    unit,
    winner,
    align,
}: {
    value: number
    unit: string
    winner: boolean
    align: "left" | "right"
}) {

    const formatted =
        unit === "R$"
            ? value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
            })
            : value.toLocaleString("pt-BR", {
                maximumFractionDigits: 1,
            })

    return (
        <div
            className={`
                flex
                items-center
                gap-2

                ${align === "right"
                    ? "justify-end"
                    : "justify-start"
                }
            `}
        >

            <span
                className={`
                    text-2xl
                    font-bold
                    tabular-nums

                    ${winner
                        ? "text-blue-400"
                        : "text-white"
                    }
                `}
            >
                {formatted}
            </span>

            {unit !== "R$" && (
                <span className="text-sm text-white/35">
                    {unit}
                </span>
            )}

            {winner && (
                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
            )}
        </div>
    )
}

function ScoreCard({
    title,
    value,
    subtitle,
    icon: Icon,
}: {
    title: string
    value: number
    subtitle: string
    icon: any
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between">

                <div>

                    <div className="text-sm text-white/40">
                        {title}
                    </div>

                    <div className="text-5xl font-bold mt-3">
                        {value}
                    </div>

                    <div className="text-sm text-white/35 mt-2">
                        {subtitle}
                    </div>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-400" />
                </div>
            </div>
        </div>
    )
}

function InsightCard({
    icon: Icon,
    title,
    text,
}: {
    icon: any
    title: string
    text: string
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                <Icon className="w-5 h-5 text-blue-400" />
            </div>

            <h3 className="text-lg font-semibold">
                {title}
            </h3>

            <p className="mt-3 text-sm text-white/45 leading-relaxed">
                {text}
            </p>
        </div>
    )
}

function isWinner(
    a: number,
    b: number,
    higherBetter: boolean
) {
    if (a === b) return false

    return higherBetter
        ? a > b
        : a < b
}

export default Grid