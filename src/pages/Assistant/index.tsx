import { useEffect, useRef, useState } from "react"

import {
    Bot,
    Send,
    Sparkles,
    User,
    ShieldCheck,
} from "lucide-react"

type MessageType = {
    role: "user" | "assistant"
    content: string
}

const suggestions = [
    "Diferenças entre Mustang Mach-E e Tesla Model Y",
    "Resumo sobre baterias de estado sólido",
    "Concorrentes usando arquitetura 800V",
    "Comparativo F-150 Lightning vs Cybertruck",
]

const initialMessages: MessageType[] = [
    {
        role: "assistant",
        content:
            "Olá. Sou o Sentinel, assistente estratégico da Ford. Posso cruzar descobertas OSINT, tendências técnicas, concorrentes e insights automotivos em tempo real.",
    },
]

function Assistant() {

    const [messages, setMessages] = useState<MessageType[]>(initialMessages)

    const [input, setInput] = useState("")
    const [thinking, setThinking] = useState(false)

    const chatRef = useRef<HTMLDivElement>(null)

    useEffect(() => {

        if (chatRef.current) {
            chatRef.current.scrollTo({
                top: chatRef.current.scrollHeight,
                behavior: "smooth",
            })
        }

    }, [messages, thinking])

    function generateResponse(text: string) {

        const query = text.toLowerCase()

        if (
            query.includes("800v")
            || query.includes("arquitetura")
        ) {
            return `
Arquitetura 800V identificada em múltiplos concorrentes.

• Hyundai / Kia → Plataforma E-GMP  
• Porsche → Taycan  
• Lucid → Lucid Air  
• Tesla → Cybertruck  

Benefícios principais:
- Recarga ultrarrápida
- Menor aquecimento
- Maior eficiência energética
- Melhor performance sustentada
            `
        }

        if (
            query.includes("bateria")
            || query.includes("estado sólido")
        ) {
            return `
Últimas descobertas sobre baterias de estado sólido:

• Toyota acelerando produção piloto  
• QuantumScape atingiu novos ciclos de carga  
• Samsung SDI avançando em densidade energética  

Impacto estimado:
+ autonomia
+ menor degradação
+ recarga mais rápida
            `
        }

        if (
            query.includes("mach")
            || query.includes("model y")
        ) {
            return `
Comparativo aerodinâmico:

Tesla Model Y:
• Cd ~0.23

Mustang Mach-E:
• Cd ~0.29

Possíveis melhorias para Ford:
- Active grille shutters
- Revisão de difusor
- Rodas aero
            `
        }

        return `
Analisando sua solicitação...

A integração com IA em tempo real ainda está em desenvolvimento nesta demonstração do Spec Recon.
        `
    }

    function sendMessage(text?: string) {

        const content = text || input

        if (!content.trim()) return

        const userMessage: MessageType = {
            role: "user",
            content,
        }

        setMessages((prev) => [
            ...prev,
            userMessage,
        ])

        setInput("")
        setThinking(true)

        setTimeout(() => {

            const assistantMessage: MessageType = {
                role: "assistant",
                content: generateResponse(content),
            }

            setMessages((prev) => [
                ...prev,
                assistantMessage,
            ])

            setThinking(false)

        }, 1200)
    }

    return (
        <div className="
            h-[calc(100vh-72px)]
            flex
            flex-col
            overflow-hidden
            px-4
            lg:px-8
            py-6
        ">

            {/* Header */}
            <div className="mb-6 shrink-0">

                <div className="
                    text-[11px]
                    uppercase
                    tracking-[0.25em]
                    text-blue-400
                    mb-3
                ">
                    Assistente - IA Conversacional
                </div>

                <div className="flex items-center gap-4">

                    <div className="
                        w-14
                        h-14
                        rounded-2xl
                        bg-blue-500
                        flex
                        items-center
                        justify-center
                        shadow-[0_0_30px_rgba(59,130,246,.35)]
                    ">
                        <Bot className="w-7 h-7 text-white" />
                    </div>

                    <div>

                        <h1 className="
                            text-3xl
                            font-bold
                            tracking-tight
                            text-white
                        ">
                            Sentinel Assistant
                        </h1>

                        <div className="
                            flex
                            items-center
                            gap-2
                            mt-1
                            text-sm
                            text-white/45
                        ">
                            <span className="
                                w-2
                                h-2
                                rounded-full
                                bg-green-400
                                animate-pulse
                            " />

                            Online · Inteligência OSINT ativa
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat */}
            <div className="
                flex-1
                min-h-0
                rounded-3xl
                border
                border-white/10
                bg-white/[0.03]
                backdrop-blur-xl
                overflow-hidden
                flex
                flex-col
            ">

                {/* Messages */}
                <div
                    ref={chatRef}
                    className="
                        flex-1
                        overflow-y-auto
                        px-5
                        py-6
                        space-y-6
                        custom-scrollbar
                    "
                >

                    {messages.map((message, index) => {

                        const isUser = message.role === "user"

                        return (
                            <div
                                key={index}
                                className={`
                                    flex
                                    gap-3

                                    ${isUser
                                        ? "justify-end"
                                        : "justify-start"
                                    }
                                `}
                            >

                                {!isUser && (
                                    <div className="
                                        w-10
                                        h-10
                                        rounded-2xl
                                        bg-blue-500
                                        flex
                                        items-center
                                        justify-center
                                        shrink-0
                                    ">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                )}

                                <div
                                    className={`
                                        max-w-[75%]
                                        px-5
                                        py-4
                                        rounded-2xl
                                        text-sm
                                        whitespace-pre-line
                                        leading-relaxed
                                        transition-all
                                        duration-300

                                        ${isUser
                                            ? `
                                                bg-blue-500
                                                text-white
                                                rounded-br-md
                                            `
                                            : `
                                                bg-white/[0.04]
                                                border
                                                border-white/8
                                                text-white/85
                                                rounded-bl-md
                                            `
                                        }
                                    `}
                                >
                                    {message.content}
                                </div>

                                {isUser && (
                                    <div className="
                                        w-10
                                        h-10
                                        rounded-2xl
                                        bg-white/10
                                        border
                                        border-white/10
                                        flex
                                        items-center
                                        justify-center
                                        shrink-0
                                    ">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* Thinking */}
                    {thinking && (

                        <div className="flex gap-3">

                            <div className="
                                w-10
                                h-10
                                rounded-2xl
                                bg-blue-500
                                flex
                                items-center
                                justify-center
                                shrink-0
                            ">
                                <Bot className="w-5 h-5 text-white" />
                            </div>

                            <div className="
                                px-5
                                py-4
                                rounded-2xl
                                bg-white/[0.04]
                                border
                                border-white/8
                                flex
                                items-center
                                gap-2
                            ">
                                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" />
                                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce delay-100" />
                                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggestions */}
                {messages.length <= 1 && (

                    <div className="
                        px-5
                        py-3
                        border-t
                        border-white/10
                        bg-white/[0.02]
                        shrink-0
                    ">

                        <div className="
                            flex
                            items-center
                            gap-2
                            text-[10px]
                            uppercase
                            tracking-[0.25em]
                            text-white/35
                            mb-3
                        ">
                            <Sparkles className="w-3 h-3" />
                            Sugestões rápidas
                        </div>

                        <div className="grid md:grid-cols-2 gap-2">

                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => sendMessage(s)}
                                    className="
                                        text-left
                                        text-sm
                                        px-3
                                        py-2.5
                                        rounded-xl
                                        border
                                        border-white/8
                                        bg-white/[0.03]
                                        text-white/75
                                        hover:bg-blue-500/10
                                        hover:border-blue-500/20
                                        hover:text-white
                                        transition-all
                                        duration-300
                                        cursor-pointer
                                    "
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        sendMessage()
                    }}
                    className="
                        p-4
                        border-t
                        border-white/10
                        bg-black/30
                        shrink-0
                    "
                >

                    <div className="flex items-center gap-3">

                        <div className="relative flex-1">

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Pergunte algo sobre concorrentes, tecnologias ou descobertas..."
                                className="
                                    w-full
                                    h-14
                                    rounded-2xl
                                    bg-white/[0.04]
                                    border
                                    border-white/10
                                    pl-5
                                    pr-14
                                    text-white
                                    placeholder:text-white/30
                                    outline-none
                                    focus:border-blue-500
                                    transition-colors
                                "
                            />

                            <ShieldCheck className="
                                absolute
                                right-5
                                top-1/2
                                -translate-y-1/2
                                w-5
                                h-5
                                text-white/25
                            " />
                        </div>

                        <button
                            type="submit"
                            disabled={!input.trim() || thinking}
                            className="
                                w-14
                                h-14
                                rounded-2xl
                                bg-blue-500
                                hover:bg-blue-400
                                disabled:opacity-40
                                disabled:cursor-not-allowed
                                flex
                                items-center
                                justify-center
                                transition-all
                                duration-300
                                shadow-[0_0_25px_rgba(59,130,246,.35)]
                                cursor-pointer
                            "
                        >
                            <Send className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="
                        mt-3
                        text-center
                        text-[11px]
                        text-white/30
                    ">
                        Dados públicos + inteligência competitiva Ford
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Assistant