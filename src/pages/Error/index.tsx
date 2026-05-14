import { Link } from "react-router-dom"
import {
    ArrowLeft,
    ShieldAlert,
} from "lucide-react"
import Button from "../../components/public/Button"

function Error() {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center relative">

            {/* Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_45%)]" />

            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-size-[80px_80px]" />

            <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">

                {/* Icon */}
                <div className="mx-auto mt-10 w-24 h-24 rounded-3xl border border-red-500/20 bg-red-500/10 flex items-center justify-center mb-8 shadow-2xl">
                    <ShieldAlert className="w-12 h-12 text-red-400" />
                </div>

                {/* Error Code */}
                <div className="text-sm uppercase tracking-[0.35em] text-red-400 mb-4">
                    Error 404
                </div>

                {/* Title */}
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[0.95]">
                    Página não
                    <br />

                    <span className="bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                        encontrada
                    </span>
                </h1>

                {/* Description */}
                <p className="mt-8 text-lg text-white/50 leading-relaxed max-w-xl mx-auto">
                    A rota acessada não existe ou foi movida.
                    Verifique o endereço informado ou retorne para a página inicial da plataforma.
                </p>

                {/* Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">

                    <Link to="/">
                        <Button variant="primary">
                            Voltar para Home
                        </Button>
                    </Link>

                    <Link to="/dashboard">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4" />
                            Ir para Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Bottom */}
                <div className="mt-16 pt-6 border-t border-white/10">

                    <div className="text-xs uppercase tracking-[0.25em] text-white/20">
                        Spec Recon · Plataforma de Inteligência Competitiva
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Error