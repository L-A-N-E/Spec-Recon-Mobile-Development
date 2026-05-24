import {
    ArrowRight,
    Radar,
    LayoutDashboard,
    GitCompare,
    Bot,
    Eye,
    Database,
    Zap,
} from "lucide-react"

import { Link } from "react-router-dom"

import Button from "../../components/public/Button"


const modules = [
    {
        icon: Radar,
        code: "01",
        title: "Radar de Inteligência",
        desc: "Varredura automatizada em patentes, fóruns, imprensa e bases regulatórias.",
        to: "/radar",
    },

    {
        icon: LayoutDashboard,
        code: "02",
        title: "Dashboard de Descobertas",
        desc: "Tendências, métricas e alertas sobre inovações da concorrência.",
        to: "/dashboard",
    },

    {
        icon: GitCompare,
        code: "03",
        title: "Grid",
        desc: "Comparação técnica side-by-side com deltas competitivos automáticos.",
        to: "/grid",
    },

    {
        icon: Bot,
        code: "04",
        title: "Assistente Virtual",
        desc: "IA conversacional integrada com OSINT e inteligência estratégica.",
        to: "/assistant",
    },
]

function Home() {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">

            {/* Home */}
            <section className="relative overflow-hidden border-b border-white/10" id="home">

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.25),transparent_40%)]" />

                <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-size-[80px_80px]" />

                <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-36 pb-28 lg:pt-44 lg:pb-36">

                    <div className="max-w-4xl">

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur text-xs font-medium mb-8">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Motor OSINT Online
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
                            Inteligência
                            <br />

                            <span className="bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                Competitiva
                            </span>

                            <br />
                            Automotiva
                        </h1>

                        <p className="mt-8 max-w-2xl text-lg lg:text-xl text-white/60 leading-relaxed">
                            O Spec Recon transforma dados públicos dispersos em inteligência
                            estratégica para antecipar os próximos movimentos da concorrência
                            automotiva.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4">

                            <Link to="/sign-up">
                                <Button variant="primary">
                                    Cadastro Corporativo
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>

                            <Link to="/login">
                                <Button variant="outline">
                                    Entrar
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-2xl">

                            {[
                                { value: "247", label: "Descobertas / mês" },
                                { value: "8", label: "Concorrentes monitorados" },
                                { value: "94%", label: "Precisão da IA" },
                            ].map((item) => (
                                <div key={item.label}>

                                    <div className="text-4xl font-bold tracking-tight">
                                        {item.value}
                                    </div>

                                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Sobre */}
            <section
                id="sobre"
                className="border-t border-white/10 border-b bg-white/2"
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24">

                    <div className="max-w-4xl">

                        <div className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-4">
                            Sobre a plataforma
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                            Inteligência competitiva automotiva
                            em tempo real.
                        </h2>

                        <p className="mt-8 text-lg text-white/60 leading-relaxed max-w-3xl text-justify">
                            O Spec Recon foi desenvolvido para transformar dados públicos
                            dispersos em inteligência estratégica acionável. Utilizando
                            OSINT, automação de coleta e inteligência artificial,
                            a plataforma permite antecipar tendências, analisar movimentos
                            da concorrência e acelerar decisões estratégicas.
                        </p>
                    </div>
                </div>
            </section>

            {/* Modulos */}
            <section
                id="modulos"
                className="max-w-7xl mx-auto px-6 lg:px-10 py-24"
            >
                <div className="max-w-2xl mb-14">

                    <div className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-4">
                        Módulos Integrados
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                        Da coleta ao insight estratégico.
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                    {modules.map((module) => {
                        const Icon = module.icon

                        return (
                            <Link
                                key={module.code}
                                to={module.to}
                                className="
        group
        relative
        overflow-hidden
        p-8
        rounded-2xl
        border
        border-white/10
        bg-white/[0.03]

        transition-all
        duration-500
        ease-out

        hover:-translate-y-1
        hover:border-blue-500/30
        hover:bg-white/[0.05]
        hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]
    "
                            >

                                {/* Glow background */}
                                <div
                                    className="
            absolute
            inset-0
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-500
            bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_45%)]
        "
                                />

                                <div className="relative flex items-start justify-between mb-8">

                                    <div
                                        className="
                w-14
                h-14
                rounded-xl
                bg-blue-500/10
                border
                border-blue-500/10
                flex
                items-center
                justify-center
                text-blue-400

                transition-all
                duration-500
                ease-out

                group-hover:bg-blue-500
                group-hover:text-white
                group-hover:scale-110
                group-hover:rotate-3
            "
                                    >
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <span
                                        className="
                text-xs
                font-mono
                text-white/30

                transition-colors
                duration-300

                group-hover:text-blue-300
            "
                                    >
                                        {module.code}
                                    </span>
                                </div>

                                <div className="relative">

                                    <h3
                                        className="
                text-2xl
                font-semibold
                tracking-tight
                mb-3

                transition-colors
                duration-300

                group-hover:text-blue-100
            "
                                    >
                                        {module.title}
                                    </h3>

                                    <p
                                        className="
                text-white/50
                leading-relaxed
                text-sm

                transition-colors
                duration-300

                group-hover:text-white/70
            "
                                    >
                                        {module.desc}
                                    </p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </section>

            {/* Tecnologia */}
            <section
                id="tecnologia"
                className="border-y border-white/10 bg-white/2"
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 grid md:grid-cols-3 gap-10">

                    {[
                        {
                            icon: Eye,
                            title: "Visibilidade total",
                            desc: "Cobertura simultânea de patentes, bases regulatórias e comunidades automotivas.",
                        },

                        {
                            icon: Database,
                            title: "Inteligência estruturada",
                            desc: "Pipeline limpa, categoriza e indexa descobertas com score de confiança.",
                        },

                        {
                            icon: Zap,
                            title: "Insights acionáveis",
                            desc: "IA conversacional cruza inteligência externa com dados estratégicos internos.",
                        },
                    ].map((item) => {
                        const Icon = item.icon

                        return (
                            <div key={item.title}>

                                <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-5">
                                    <Icon className="w-5 h-5" />
                                </div>

                                <h3 className="text-xl font-semibold mb-3">
                                    {item.title}
                                </h3>

                                <p className="text-white/50 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}

export default Home