import { useState } from "react"

import {
    Radar,
    LayoutDashboard,
    GitCompare,
    Bot,
    ShieldCheck,
    Bell,
    Search,
    Menu,
    X,
} from "lucide-react"

import { Link, useLocation } from "react-router-dom"

import PictureProfile from "../PictureProfile"

import NotificationModal from "../NotificationModal"



const navItems = [
    {
        to: "/radar",
        label: "Radar",
        icon: Radar,
    },

    {
        to: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
    },

    {
        to: "/grid",
        label: "Grid",
        icon: GitCompare,
    },

    {
        to: "/assistant",
        label: "Assistente",
        icon: Bot,
    },
]

function TopBar() {
    const [notificationOpen, setNotificationOpen] = useState(false)
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)

    // MOCK USER
    // futuramente virá da API/Auth Context
    const user = {
        fullName: "Nicolas Haubricht",
        role: "Estagiário",
        company: "Ford BR",
    }

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">

                <div className="h-16 px-4 lg:px-8 flex items-center justify-between">

                    {/* Left */}
                    <div className="flex items-center gap-3 lg:hidden">

                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
                        >
                            {mobileOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>

                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-white" />
                            </div>

                            <span className="font-semibold tracking-tight">
                                Spec Recon
                            </span>
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="hidden lg:flex flex-1 max-w-md">

                        <div className="relative w-full">

                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />

                            <input
                                type="text"
                                placeholder="Buscar descobertas, patentes, concorrentes..."
                                className="
                                    w-full
                                    h-10
                                    pl-10
                                    pr-4
                                    rounded-xl
                                    bg-white/3
                                    border
                                    border-white/10
                                    text-sm
                                    text-white
                                    placeholder:text-white/25
                                    outline-none
                                    focus:border-blue-500
                                    transition-colors
                                "
                            />
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">

                        {/* Notification */}
                        <button
                            onClick={() => setNotificationOpen(true)}
                            className="
                                relative
                                w-10
                                h-10
                                rounded-xl
                                border
                                border-white/10
                                bg-white/3
                                flex
                                items-center
                                justify-center
                                hover:bg-white/6
                                transition-colors
                                cursor-pointer
                            "
                        >
                            <Bell className="w-4 h-4 text-white/70" />

                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
                        </button>
                        

                        {/* Desktop Profile */}
                        <Link
                            to="/profile-settings"
                            className="
                                flex
                                items-center
                                gap-3
                                pl-4
                                border-l
                                border-white/10
                            "
                        >
                            {/* Nome escondido somente no mobile */}
                            <div className="hidden sm:block text-right">

                                <div className="text-sm font-medium text-white">
                                    {user.fullName}
                                </div>

                                <div className="text-[11px] text-white/40">
                                    {user.role} · {user.company}
                                </div>
                            </div>

                            {/* Avatar SEMPRE visível */}
                            <PictureProfile />
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (

                    <nav className="lg:hidden border-t border-white/10 bg-black">

                        <div className="px-4 py-4 space-y-2">

                            {navItems.map((item) => {

                                const Icon = item.icon
                                const active = location.pathname === item.to

                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setMobileOpen(false)}
                                        className={`
                                            flex
                                            items-center
                                            gap-3
                                            px-4
                                            py-3
                                            rounded-xl
                                            transition-all
                                            duration-300

                                            ${active
                                                ? "bg-blue-500 text-white"
                                                : "text-white/70 hover:bg-white/5"
                                            }
                                        `}
                                    >
                                        <Icon className="w-4 h-4" />

                                        <span className="text-sm font-medium">
                                            {item.label}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </nav>
                )}

            </header>
            <NotificationModal
                open={notificationOpen}
                onClose={() => setNotificationOpen(false)}
            />
        </>
    )
}

export default TopBar   