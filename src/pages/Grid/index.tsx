import { useMemo, useState } from "react"

import {
    GitCompare,
    Zap,
    TrendingUp,
    TrendingDown,
    Minus,
    Gauge,
    BatteryCharging,
    TimerReset,
    Cpu,
    ArrowRightLeft,
} from "lucide-react"

type VehicleSpec = {
    id: string
    brand: string
    name: string
    segment: string
    powertrain: string
    power_hp: number
    torque_nm: number
    range_km: number
    battery_kwh: number
    voltage: number
    acceleration_0_100: number
    top_speed_kmh: number
    drag_coefficient: number
    weight_kg: number
    charging_kw: number
    price_usd: number
}

const fordVehicles: VehicleSpec[] = [
    {
        id: "mustang-mach-e",
        brand: "Ford",
        name: "Mustang Mach-E GT",
        segment: "SUV",
        powertrain: "Elétrico",
        power_hp: 480,
        torque_nm: 860,
        range_km: 500,
        battery_kwh: 91,
        voltage: 400,
        acceleration_0_100: 3.8,
        top_speed_kmh: 200,
        drag_coefficient: 0.29,
        weight_kg: 2250,
        charging_kw: 150,
        price_usd: 69000,
    },

    {
        id: "f150-lightning",
        brand: "Ford",
        name: "F-150 Lightning",
        segment: "Pickup",
        powertrain: "Elétrico",
        power_hp: 580,
        torque_nm: 1050,
        range_km: 515,
        battery_kwh: 131,
        voltage: 400,
        acceleration_0_100: 4.4,
        top_speed_kmh: 180,
        drag_coefficient: 0.36,
        weight_kg: 2900,
        charging_kw: 155,
        price_usd: 72000,
    },
]

const competitorVehicles: VehicleSpec[] = [
    {
        id: "tesla-model-y",
        brand: "Tesla",
        name: "Model Y Performance",
        segment: "SUV",
        powertrain: "Elétrico",
        power_hp: 534,
        torque_nm: 660,
        range_km: 533,
        battery_kwh: 82,
        voltage: 400,
        acceleration_0_100: 3.7,
        top_speed_kmh: 250,
        drag_coefficient: 0.23,
        weight_kg: 1995,
        charging_kw: 250,
        price_usd: 58000,
    },

    {
        id: "byd-seal",
        brand: "BYD",
        name: "Seal Performance",
        segment: "Sedan",
        powertrain: "Elétrico",
        power_hp: 530,
        torque_nm: 670,
        range_km: 570,
        battery_kwh: 82,
        voltage: 800,
        acceleration_0_100: 3.8,
        top_speed_kmh: 240,
        drag_coefficient: 0.22,
        weight_kg: 2185,
        charging_kw: 230,
        price_usd: 52000,
    },
]

const specs: {
    key: keyof VehicleSpec
    label: string
    unit: string
    higherBetter: boolean
}[] = [
        {
            key: "power_hp",
            label: "Potência",
            unit: "hp",
            higherBetter: true,
        },

        {
            key: "torque_nm",
            label: "Torque",
            unit: "Nm",
            higherBetter: true,
        },

        {
            key: "range_km",
            label: "Autonomia",
            unit: "km",
            higherBetter: true,
        },

        {
            key: "battery_kwh",
            label: "Bateria",
            unit: "kWh",
            higherBetter: true,
        },

        {
            key: "voltage",
            label: "Arquitetura",
            unit: "V",
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
            label: "Velocidade máx.",
            unit: "km/h",
            higherBetter: true,
        },

        {
            key: "drag_coefficient",
            label: "Arrasto",
            unit: "Cd",
            higherBetter: false,
        },

        {
            key: "charging_kw",
            label: "Carga rápida",
            unit: "kW",
            higherBetter: true,
        },

        {
            key: "price_usd",
            label: "Preço",
            unit: "USD",
            higherBetter: false,
        },
    ]

function Grid() {

    const [fordId, setFordId] = useState(fordVehicles[0].id)
    const [competitorId, setCompetitorId] = useState(competitorVehicles[0].id)

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
                        Compare plataformas Ford com concorrentes globais e
                        identifique gaps estratégicos automaticamente.
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
                            Benchmark estratégico automatizado
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

            {/* Comparison Table */}
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
                                competitorValue) *
                            100

                        return (
                            <div
                                key={spec.key}
                                className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center px-6 py-5 hover:bg-white/[0.02] transition-colors"
                            >

                                <SpecValue
                                    value={fordValue}
                                    unit={spec.unit}
                                    winner={fordWin}
                                    align="right"
                                />

                                <div className="min-w-[130px] text-center">

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
                        )
                    })}
                </div>
            </div>

            {/* Insights */}
            <div className="grid lg:grid-cols-3 gap-5 mt-8">

                <InsightCard
                    icon={Gauge}
                    title="Performance"
                    text={`Ford entrega ${ford.power_hp}hp e supera parte dos concorrentes em torque bruto.`}
                />

                <InsightCard
                    icon={BatteryCharging}
                    title="Charging Gap"
                    text={`Concorrentes já operam acima de ${competitor.charging_kw}kW em carregamento rápido.`}
                />

                <InsightCard
                    icon={Cpu}
                    title="Arquitetura"
                    text={`Arquitetura ${competitor.voltage}V indica avanço em eficiência térmica e recarga.`}
                />
            </div>

            {/* Bottom */}
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
                    value={`${vehicle.power_hp}hp`}
                />

                <MiniInfo
                    label="Torque"
                    value={`${vehicle.torque_nm}Nm`}
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
        unit === "USD"
            ? `$${value.toLocaleString("en-US")}`
            : value.toLocaleString("pt-BR", {
                maximumFractionDigits: 2,
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

            <span className="text-sm text-white/35">
                {unit}
            </span>

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