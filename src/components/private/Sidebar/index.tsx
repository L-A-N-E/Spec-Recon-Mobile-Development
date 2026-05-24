import {
    Radar,
    LayoutDashboard,
    GitCompare,
    Bot,
    ShieldCheck,
} from "lucide-react"

import { Link, useLocation } from "react-router-dom"

const navItems = [
    {
        to: "/radar",
        label: "Radar de Inteligência",
        icon: Radar,
        code: "01",
    },

    {
        to: "/dashboard",
        label: "Dashboard de Descobertas",
        icon: LayoutDashboard,
        code: "02",
    },

    {
        to: "/grid",
        label: "Grid Competitivo",
        icon: GitCompare,
        code: "03",
    },

    {
        to: "/assistant",
        label: "Assistente Virtual",
        icon: Bot,
        code: "04",
    },
]

function Sidebar() {

    const location = useLocation()

    return (
        <aside
            className="
                hidden
                lg:flex
                w-72
                shrink-0
                flex-col
                border-r
                border-white/10
                bg-black
            "
        >

            {/* Logo */}
            <Link
                to="/"
                className="
                    px-6
                    py-6
                    border-b
                    border-white/10
                    flex
                    items-center
                    gap-3
                "
            >

                <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <ShieldCheck className="w-5 h-5 text-white" />
                </div>

                <div>

                    <div className="text-[10px] uppercase tracking-[0.25em] text-white/30">
                        Ford
                    </div>

                    <div className="text-lg font-semibold tracking-tight text-white">
                        Spec Recon
                    </div>
                </div>
            </Link>

            {/* Nav */}
            <nav className="flex-1 px-3 py-6 space-y-1">

                <div className="px-3 pb-3 text-[10px] uppercase tracking-[0.25em] text-white/25">
                    Módulos
                </div>

                {navItems.map((item) => {

                    const active = location.pathname === item.to
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`
                                group
                                relative
                                flex
                                items-center
                                gap-3
                                px-3
                                py-3
                                rounded-xl

                                border
                                border-transparent

                                transition-colors
                                duration-200
                                ease-out

                                ${active
                                                            ? `
                                        bg-blue-500/15
                                        border-blue-500/20
                                        text-white
                                    `
                                                            : `
                                        text-white/60
                                        hover:bg-white/4
                                        hover:text-white
                                    `
                                                        }
                            `}
                        >

                            {active && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r bg-blue-500" />
                            )}

                            <Icon className="w-4 h-4 shrink-0" />

                            <span className="text-sm font-medium">
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom */}
            <div className="px-6 py-5 border-t border-white/10">

                <div className="flex items-center gap-2 text-xs text-white/50">

                    <span className="relative flex w-2 h-2">

                        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60" />

                        <span className="relative inline-flex w-2 h-2 rounded-full bg-green-400" />
                    </span>

                    Sistema operacional
                </div>

                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/20">
                    v2.4.1 · OSINT Engine
                </div>
            </div>
        </aside>
    )
}

export default Sidebar