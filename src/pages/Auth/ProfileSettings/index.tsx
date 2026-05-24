import {
    Mail,
    Phone,
    Briefcase,
    Lock,
    Save,
} from "lucide-react"

import PictureProfile from "../../../components/private/PictureProfile/index"

function ProfileSettings() {

    // mock user
    const user = {
        fullName: "Nicolas Haubricht",
        email: "nicolas.haubricht@ford.com",
        phone: "+55 (11) 99999-9999",
        role: "Estagiário · Ford BR",
        employeeId: "FDBR-28491",
    }

    return (
        <div className="
            max-w-5xl
            mx-auto
            px-4
            lg:px-8
            py-8
        ">

            {/* Header */}
            <div className="mb-8">

                <div className="
                    text-[11px]
                    uppercase
                    tracking-[0.25em]
                    text-blue-400
                    mb-3
                ">
                    Conta · Perfil
                </div>

                <h1 className="
                    text-4xl
                    font-bold
                    tracking-tight
                    text-white
                ">
                    Configurações da Conta
                </h1>

                <p className="
                    mt-2
                    text-white/45
                ">
                    Gerencie suas informações corporativas e senha de acesso.
                </p>
            </div>

            <div className="
                rounded-3xl
                border
                border-white/10
                bg-white/[0.03]
                backdrop-blur-xl
                overflow-hidden
            ">

                {/* Top */}
                <div className="
                    px-6
                    py-8
                    border-b
                    border-white/10
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    gap-6
                ">

                    <PictureProfile />

                    <div>

                        <h2 className="
                            text-2xl
                            font-semibold
                            text-white
                        ">
                            {user.fullName}
                        </h2>

                        <p className="
                            text-white/45
                            mt-1
                        ">
                            {user.role}
                        </p>

                        <div className="
                            flex
                            flex-wrap
                            gap-3
                            mt-4
                        ">

                            <InfoBadge
                                icon={Mail}
                                text={user.email}
                            />

                            <InfoBadge
                                icon={Phone}
                                text={user.phone}
                            />

                            <InfoBadge
                                icon={Briefcase}
                                text={user.employeeId}
                            />
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="
                    p-6
                    grid
                    md:grid-cols-2
                    gap-5
                ">

                    <InputField
                        label="Nome completo"
                        defaultValue={user.fullName}
                    />

                    <InputField
                        label="E-mail corporativo"
                        defaultValue={user.email}
                    />

                    <InputField
                        label="Telefone"
                        defaultValue={user.phone}
                    />

                    <InputField
                        label="ID Corporativo"
                        defaultValue={user.employeeId}
                        disabled
                    />

                    <PasswordField
                        label="Nova senha"
                    />

                    <PasswordField
                        label="Confirmar senha"
                    />
                </div>

                {/* Footer */}
                <div className="
                    px-6
                    py-5
                    border-t
                    border-white/10
                    flex
                    justify-end
                ">

                    <button
                        className="
                            h-12
                            px-6
                            rounded-2xl
                            bg-blue-500
                            hover:bg-blue-400
                            text-white
                            font-medium
                            flex
                            items-center
                            gap-2
                            transition-all
                            duration-300
                            shadow-[0_0_25px_rgba(59,130,246,.35)]
                            cursor-pointer
                        "
                    >
                        <Save className="w-4 h-4" />
                        Salvar alterações
                    </button>
                </div>
            </div>
        </div>
    )
}

function InputField({
    label,
    defaultValue,
    disabled = false,
}: {
    label: string
    defaultValue: string
    disabled?: boolean
}) {

    return (
        <div>

            <label className="
                block
                text-sm
                text-white/50
                mb-2
            ">
                {label}
            </label>

            <input
                defaultValue={defaultValue}
                disabled={disabled}
                className="
                    w-full
                    h-12
                    rounded-2xl
                    bg-white/[0.03]
                    border
                    border-white/10
                    px-4
                    text-white
                    outline-none
                    focus:border-blue-500
                    transition-colors
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                "
            />
        </div>
    )
}

function PasswordField({
    label,
}: {
    label: string
}) {

    return (
        <div>

            <label className="
                block
                text-sm
                text-white/50
                mb-2
            ">
                {label}
            </label>

            <div className="relative">

                <input
                    type="password"
                    className="
                        w-full
                        h-12
                        rounded-2xl
                        bg-white/[0.03]
                        border
                        border-white/10
                        px-4
                        pr-12
                        text-white
                        outline-none
                        focus:border-blue-500
                        transition-colors
                    "
                />

                <Lock className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    w-4
                    h-4
                    text-white/30
                " />
            </div>
        </div>
    )
}

function InfoBadge({
    icon: Icon,
    text,
}: {
    icon: React.ElementType
    text: string
}) {

    return (
        <div className="
            h-10
            px-4
            rounded-xl
            border
            border-white/10
            bg-white/[0.03]
            flex
            items-center
            gap-2
        ">

            <Icon className="
                w-4
                h-4
                text-blue-400
            " />

            <span className="
                text-sm
                text-white/75
            ">
                {text}
            </span>
        </div>
    )
}

export default ProfileSettings