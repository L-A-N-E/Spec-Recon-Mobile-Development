import React from "react"

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    variant?: "primary" | "secondary" | "outline"
}

function Button({
    children,
    variant = "primary",
    className = "",
    ...props
}: ButtonProps) {
    const variants = {
        primary:
            "bg-white text-black hover:bg-white/90",

        secondary:
            "bg-blue-500 text-white hover:bg-blue-400",

        outline:
            "border border-white/15 text-white hover:bg-white/10",
    }

    return (
        <button
            className={`
        h-11 px-5 rounded-xl
        font-medium text-sm
        transition-all duration-300
        cursor-pointer
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${className}
        `}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button