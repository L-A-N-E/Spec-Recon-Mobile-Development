import { Bell, X, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Alert, AlertSeverity } from "../../../lib/alerts"

type NotificationModalProps = {
    open: boolean
    onClose: () => void
    alerts: Alert[]
    onDismiss: (id: string) => void
    onDismissAll: () => void
}

const SEVERITY_STYLE: Record<AlertSeverity, { icon: typeof AlertTriangle; iconClass: string; badge: string }> = {
    critical: {
        icon: AlertTriangle,
        iconClass: "text-red-400 bg-red-500/10 border-red-500/20",
        badge: "bg-red-500/15 text-red-300",
    },
    warning: {
        icon: AlertTriangle,
        iconClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        badge: "bg-amber-500/15 text-amber-300",
    },
    info: {
        icon: TrendingUp,
        iconClass: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        badge: "bg-blue-500/15 text-blue-300",
    },
}

function NotificationModal({
    open,
    onClose,
    alerts,
    onDismiss,
    onDismissAll,
}: NotificationModalProps) {

    const navigate = useNavigate()

    if (!open) return null

    function goToDashboard() {
        onClose()
        navigate("/dashboard")
    }

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
                    max-w-full
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
                        gap-3
                        px-5
                        py-4
                        border-b
                        border-white/10
                    "
                >
                    <div className="flex items-center gap-3 min-w-0">

                        <div
                            className="
                                w-10
                                h-10
                                shrink-0
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

                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-white truncate">
                                Central de Alertas
                            </h2>

                            <p className="text-xs text-white/40 truncate">
                                {alerts.length > 0
                                    ? `${alerts.length} alerta${alerts.length > 1 ? "s" : ""} ativo${alerts.length > 1 ? "s" : ""}`
                                    : "Nenhum alerta no momento"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">

                        {alerts.length > 0 && (
                            <button
                                onClick={onDismissAll}
                                className="
                                    px-2.5
                                    h-9
                                    rounded-xl
                                    text-xs
                                    font-medium
                                    text-blue-400
                                    hover:bg-white/5
                                    hover:text-blue-300
                                    transition-all
                                    cursor-pointer
                                    whitespace-nowrap
                                "
                            >
                                Marcar lidos
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="
                                w-9
                                h-9
                                shrink-0
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
                </div>

                {/* Content */}
                <div className="max-h-105 overflow-y-auto">

                    {alerts.length === 0 ? (

                        <div className="px-5 py-10 flex flex-col items-center text-center gap-3">
                            <CheckCircle2 className="w-8 h-8 text-white/20" />
                            <p className="text-sm text-white/35">
                                Nenhum sinal fora do padrão detectado agora.
                            </p>
                        </div>

                    ) : (

                        alerts.map((alert) => {
                            const style = SEVERITY_STYLE[alert.severity]
                            const Icon = style.icon

                            return (
                <div
                                    key={alert.id}
                                    className="
                                        group
                                        px-5
                                        py-4
                                        border-b
                                        border-white/5
                                        hover:bg-white/3
                                        transition-colors
                                    "
                                >
                                    <div className="flex items-start gap-3">

                                        <div className={`
                                            w-9
                                            h-9
                                            shrink-0
                                            rounded-lg
                                            border
                                            flex
                                            items-center
                                            justify-center
                                            ${style.iconClass}
                                        `}>
                                            <Icon className="w-4 h-4" />
                                        </div>

                                        <div className="flex-1 min-w-0">

                                            <div className="flex items-start justify-between gap-2">

                                                <h3 className="text-sm font-medium text-white min-w-0 break-words">
                                                    {alert.title}
                                                </h3>

                                                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">

                                                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/25 whitespace-nowrap">
                                                        {alert.time}
                                                    </span>

                                                    <button
                                                        onClick={() => onDismiss(alert.id)}
                                                        title="Marcar como lido"
                                                        className="
                                                            w-5
                                                            h-5
                                                            shrink-0
                                                            rounded-md
                                                            flex
                                                            items-center
                                                            justify-center
                                                            text-white/30
                                                            hover:bg-white/10
                                                            hover:text-white
                                                            transition-all
                                                            cursor-pointer
                                                        "
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="mt-1 text-sm text-white/45 leading-relaxed break-words">
                                                {alert.desc}
                                            </p>

                                            {alert.url && (
                                                <a
                                                    href={alert.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-2 inline-block text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                                                >
                                                    Ler notícia completa
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })

                    )}
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
                        onClick={goToDashboard}
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
                        Ver no Dashboard
                    </button>
                </div>
            </div>
        </>
    )
}

export default NotificationModal
