import { Bell, X } from "lucide-react"

type NotificationModalProps = {
    open: boolean
    onClose: () => void
}

function NotificationModal({
    open,
    onClose,
}: NotificationModalProps) {

    if (!open) return null

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                className="
                    fixed
                    inset-0
                    bg-black/60
                    backdrop-blur-sm
                    z-90
                    animate-in
                    fade-in
                    duration-200
                "
            />

            {/* Modal */}
            <div
                className="
                    fixed
                    top-20
                    right-4
                    sm:right-6
                    w-[95%]
                    sm:w-105
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#050505]/95
                    backdrop-blur-2xl
                    shadow-2xl
                    z-100
                    overflow-hidden
                    animate-in
                    slide-in-from-top-2
                    fade-in
                    duration-300
                "
            >

                {/* Header */}
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        px-5
                        py-4
                        border-b
                        border-white/10
                    "
                >
                    <div className="flex items-center gap-3">

                        <div
                            className="
                                w-10
                                h-10
                                rounded-xl
                                bg-blue-500/10
                                border
                                border-blue-500/20
                                flex
                                items-center
                                justify-center
                            "
                        >
                            <Bell className="w-5 h-5 text-blue-400" />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                Central de Alertas
                            </h2>

                            <p className="text-xs text-white/40">
                                Inteligência competitiva em tempo real
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="
                            w-9
                            h-9
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            text-white/50
                            hover:bg-white/5
                            hover:text-white
                            transition-all
                            cursor-pointer
                        "
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-105 overflow-y-auto">

                    {[
                        {
                            title: "Nova patente identificada",
                            desc: "Toyota registrou um novo sistema híbrido no Japão.",
                            time: "Agora",
                        },

                        {
                            title: "Alerta estratégico",
                            desc: "Tesla iniciou testes com nova bateria sólida.",
                            time: "12 min atrás",
                        },

                        {
                            title: "Movimento de mercado",
                            desc: "BYD expandiu operação industrial na América Latina.",
                            time: "1h atrás",
                        },
                    ].map((alert, index) => (
                        <div
                            key={index}
                            className="
                                px-5
                                py-4
                                border-b
                                border-white/5
                                hover:bg-white/3
                                transition-colors
                            "
                        >
                            <div className="flex items-start justify-between gap-4">

                                <div>
                                    <h3 className="text-sm font-medium text-white">
                                        {alert.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-white/45 leading-relaxed">
                                        {alert.desc}
                                    </p>
                                </div>

                                <span className="text-[10px] uppercase tracking-[0.2em] text-white/25 whitespace-nowrap">
                                    {alert.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div
                    className="
                        px-5
                        py-4
                        border-t
                        border-white/10
                        bg-white/2
                    "
                >
                    <button
                        className="
                            w-full
                            h-11
                            rounded-xl
                            bg-blue-500
                            hover:bg-blue-400
                            text-white
                            text-sm
                            font-medium
                            transition-colors
                            cursor-pointer
                        "
                    >
                        Ver todos os alertas
                    </button>
                </div>
            </div>
        </>
    )
}

export default NotificationModal