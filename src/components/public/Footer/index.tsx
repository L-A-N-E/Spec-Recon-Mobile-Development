import { Link } from "react-router-dom"

function Footer() {
    return (
        <footer className="relative border-t border-white/10 bg-black overflow-hidden">

            {/* Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_45%)]" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-14">

                {/* Top */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">

                    {/* Brand */}
                    <div className="max-w-md">

                        <div className="flex items-center gap-4">

                            <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/3 backdrop-blur flex items-center justify-center shadow-lg">
                                <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-cyan-400" />
                            </div>

                            <div>
                                <div className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                                    Ford Motor Company
                                </div>

                                <div className="text-xl font-semibold tracking-tight text-white">
                                    Spec Recon
                                </div>
                            </div>
                        </div>

                        <p className="mt-5 text-sm leading-relaxed text-white/45 text-justify">
                            Plataforma de inteligência competitiva automotiva desenvolvida
                            para transformar dados públicos em insights estratégicos
                            acionáveis através de OSINT, automação e inteligência artificial.
                        </p>

                        <div className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-white/25">
                            Confidencial · Uso interno
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-col sm:flex-row gap-10 sm:gap-16">

                        {/* Navegação */}
                        <div>
                            <div className="text-sm font-semibold text-white/70 mb-4">
                                Navegação
                            </div>

                            <div className="flex flex-col gap-3 text-sm text-white/45">
                                <Link
                                    to="/"
                                    className="hover:text-white transition-colors"
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/"
                                    className="hover:text-white transition-colors"
                                >
                                    Sobre
                                </Link>

                                <Link
                                    to="/"
                                    className="hover:text-white transition-colors"
                                >
                                    Módulos
                                </Link>

                                <Link
                                    to="/"
                                    className="hover:text-white transition-colors"
                                >
                                    Tecnologia
                                </Link>
                            </div>
                        </div>

                        {/* Legal */}
                        <div>
                            <div className="text-sm font-semibold text-white/70 mb-4">
                                Legal
                            </div>

                            <div className="flex flex-col gap-3 text-sm text-white/45">
                                <Link
                                    to="/privacy-policy"
                                    className="hover:text-white transition-colors"
                                >
                                    Política de Privacidade
                                </Link>

                                <Link
                                    to="/terms-of-use"
                                    className="hover:text-white transition-colors"
                                >
                                    Termos de Uso
                                </Link>
                            </div>
                        </div>

                        {/* Powered */}
                        <div>
                            <div className="text-sm font-semibold text-white/70 mb-4">
                                Plataforma
                            </div>

                            <div className="space-y-3">
                                <div className="text-sm text-white/45">
                                    Desenvolvido por
                                </div>

                                <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/3">

                                    <div className="w-3 h-3 rounded-full bg-linear-to-br from-blue-500 to-cyan-400" />

                                    <div className="font-semibold tracking-wide text-white/80">
                                        LANE
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="mt-12 border-t border-white/5 pt-6">

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                        <div className="text-xs text-white/20">
                            © 2026 Ford Motor Company · Plataforma Spec Recon
                        </div>

                        <div className="flex items-center gap-6">

                            <div className="text-[10px] uppercase tracking-[0.25em] text-white/15 font-mono">
                                Plataforma de Inteligência Competitiva Automotiva
                            </div>

                            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue-400/70">
                                v0.0.1
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer