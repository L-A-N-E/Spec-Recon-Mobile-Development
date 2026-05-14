import {
    ShieldCheck,
    ArrowRight,
    Eye,
    EyeOff
} from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import Button from "../../../components/public/Button"

function Login() {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center px-6 py-24">

            {/* Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_40%)]" />

            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-size-[80px_80px]" />

            <div className="relative w-full max-w-md">

                {/* Logo */}
                <div className="flex flex-col items-center text-center mb-10">

                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                        <ShieldCheck className="w-8 h-8 text-blue-400" />
                    </div>

                    <div className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-3">
                        Ford Motor Company
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight">
                        Acesso à plataforma
                    </h1>

                    <p className="mt-4 text-white/50 leading-relaxed">
                        Entre com suas credenciais corporativas para acessar o Spec Recon.
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl p-8 shadow-2xl">

                    <form className="space-y-5">

                        {/* Registro */}
                        <div>
                            <label className="block text-sm text-white/70 mb-2">
                                ID Corporativo
                            </label>

                            <input
                                type="text"
                                placeholder="FRD-000124"
                                className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm text-white/70 mb-2">
                                Senha
                            </label>

                            <div className="relative">

                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••"
                                    autoComplete="current-password"
                                    onCopy={(e) => e.preventDefault()}
                                    onPaste={(e) => e.preventDefault()}
                                    onCut={(e) => e.preventDefault()}
                                    className="w-full h-12 px-4 pr-12 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-blue-500 transition-colors"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Forgot */}
                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                            >
                                Esqueci minha senha
                            </Link>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full h-12"
                        >
                            Entrar na plataforma
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </form>

                    {/* Bottom */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">

                        <p className="text-sm text-white/40">
                            Ainda não possui acesso?
                        </p>

                        <Link
                            to="/sign-up"
                            className="mt-3 inline-flex text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                        >
                            Solicitar credenciais
                        </Link>
                    </div>
                </div>

                {/* Bottom text */}
                <div className="mt-8 text-center text-xs text-white/20 uppercase tracking-[0.25em]">
                    Spec Recon · Plataforma de Inteligência Competitiva
                </div>
            </div>
        </div>
    )
}

export default Login