import { useState } from "react"
import { Link } from "react-router-dom"
import {
    Menu,
    X,
    ShieldCheck,
} from "lucide-react"
import PictureProfile from "../../private/PictureProfile/index"

function Navbar() {
    // futuramente vem do auth context/supabase
    const isAuthenticated = false

    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <header className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
            <div className="max-w-7xl mx-auto h-16 px-6 lg:px-10 flex items-center justify-between">

                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center gap-3 cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-md bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>

                    <div className="text-white">
                        <div className="text-[10px] uppercase tracking-[0.25em] opacity-70">
                            Ford
                        </div>

                        <div className="font-semibold tracking-tight leading-none">
                            Spec Recon
                        </div>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8 text-sm text-white/70">
                    <Link
                        to="/"
                        className="hover:text-white transition-colors cursor-pointer"
                    >
                        Home
                    </Link>
                    <Link
                        to="/"
                        className="hover:text-white transition-colors cursor-pointer"
                    >
                        Sobre
                    </Link>

                    <Link
                        to="/"
                        className="hover:text-white transition-colors cursor-pointer"
                    >
                        Módulos
                    </Link>

                    <Link
                        to="/"
                        className="hover:text-white transition-colors cursor-pointer"
                    >
                        Tecnologia
                    </Link>
                </nav>

                {/* Desktop Right */}
                <div className="hidden lg:flex items-center gap-3">
                    {!isAuthenticated ? (
                        <>
                            <Link to="/login">
                                <button className="h-10 px-5 rounded-md border border-white/15 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer">
                                    Login
                                </button>
                            </Link>

                            <Link to="/sign-up">
                                <button className="h-10 px-5 rounded-md bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors cursor-pointer">
                                    Criar conta
                                </button>
                            </Link>
                        </>
                    ) : (
                        <PictureProfile />
                    )}
                </div>

                {/* Mobile Button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden text-white cursor-pointer"
                >
                    {mobileOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-black border-t border-white/10">
                    <div className="px-6 py-6 flex flex-col gap-6">

                        <nav className="flex flex-col gap-5 text-white/70 text-sm">
                            <Link
                                to="/"
                                className="hover:text-white transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                to="/"
                                className="hover:text-white transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                Sobre
                            </Link>

                            <Link
                                to="/"
                                className="hover:text-white transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                Módulos
                            </Link>

                            <Link
                                to="/"
                                className="hover:text-white transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                Tecnologia
                            </Link>
                        </nav>

                        {!isAuthenticated ? (
                            <div className="flex flex-col gap-3">
                                <Link to="/login">
                                    <button className="w-full h-11 rounded-md border border-white/15 text-white cursor-pointer">
                                        Login
                                    </button>
                                </Link>

                                <Link to="/sign-up">
                                    <button className="w-full h-11 rounded-md bg-white text-black font-medium cursor-pointer">
                                        Criar conta
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <PictureProfile />
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar