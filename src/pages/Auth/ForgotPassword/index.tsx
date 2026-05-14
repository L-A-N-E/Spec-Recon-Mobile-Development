import { useState } from "react"

import {
    KeyRound,
    ArrowRight,
    CheckCircle2
} from "lucide-react"

import { Link } from "react-router-dom"

import Button from "../../../components/public/Button"

function ForgotPassword() {

    const [credential, setCredential] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        setError("")

        if (!credential.trim()) {
            setError("Informe seu ID corporativo ou e-mail")
            return
        }

        // futura integração backend
        console.log(credential)

        setSuccess(true)
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center px-6 py-24">

            {/* Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_40%)]" />

            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-size-[80px_80px]" />

            <div className="relative w-full max-w-md">

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-10">

                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                        <KeyRound className="w-8 h-8 text-blue-400" />
                    </div>

                    <div className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-3">
                        Recuperação de acesso
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight">
                        Esqueceu sua senha?
                    </h1>

                    <p className="mt-4 text-white/50 leading-relaxed">
                        Informe seu ID corporativo ou e-mail corporativo
                        para redefinir sua senha de acesso.
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl p-8 shadow-2xl">

                    {!success ? (

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >

                            <div>
                                <label className="block text-sm text-white/70 mb-2">
                                    ID corporativo ou e-mail
                                </label>

                                <input
                                    type="text"
                                    value={credential}
                                    onChange={(e) => {
                                        setCredential(e.target.value)

                                        if (error) {
                                            setError("")
                                        }
                                    }}
                                    placeholder="FRD-000124 ou nome@ford.com"
                                    className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-blue-500 transition-colors"
                                />

                                {error && (
                                    <p className="mt-2 text-sm text-red-400">
                                        {error}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full h-12"
                            >
                                Enviar link de redefinição
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </form>

                    ) : (

                        <div className="flex flex-col items-center text-center">

                            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5">
                                <CheckCircle2 className="w-8 h-8 text-green-400" />
                            </div>

                            <h2 className="text-2xl font-semibold">
                                Solicitação enviada
                            </h2>

                            <p className="mt-4 text-white/50 leading-relaxed">
                                Se as credenciais existirem na base corporativa,
                                um link de redefinição será enviado.
                            </p>

                            <Link
                                to="/login"
                                className="mt-8 w-full"
                            >
                                <Button
                                    variant="secondary"
                                    className="w-full h-12"
                                >
                                    Voltar para login
                                </Button>
                            </Link>
                        </div>
                    )}

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

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-white/20 uppercase tracking-[0.25em]">
                    Challenge FIAP 2026 · Engenharia de Software
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword