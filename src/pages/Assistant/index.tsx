import { useEffect, useRef, useState } from "react"

import {
    Bot,
    Send,
    Sparkles,
    User,
    ShieldCheck,
} from "lucide-react"

import { buildOsintContext } from "../../lib/osint"

type MessageType = {
    role: "user" | "assistant"
    content: string
}

// Modelo rodando localmente via Ollama (gratuito, sem API key - so funciona
// com `ollama serve` ativo na maquina de quem esta usando a pagina).
const OLLAMA_URL = "http://localhost:11434/api/chat"
const OLLAMA_MODEL = "llama3.2"

const suggestions = [
    "Qual a autonomia da BYD Seal?",
    "Quais concorrentes usam arquitetura 800V?",
    "Compare a potência do Tesla Model 3 e do Kia EV6",
    "O que sabemos sobre carregamento da Hyundai Ioniq 5?",
]

const initialMessages: MessageType[] = [
    {
        role: "assistant",
        content:
            "Olá. Sou o Sentinel, assistente estratégico da Ford. Respondo com base nos dados reais coletados pelo Radar (Wikipedia + EV Database) sobre Tesla, BYD, Toyota, GM, Rivian, Hyundai, Kia e Volkswagen. Rodando localmente via Ollama.",
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

    async function generateResponse(text: string, history: MessageType[]) {

        const context = buildOsintContext(text)

        const systemPrompt = `Você é o Sentinel, assistente de inteligência competitiva da plataforma Spec Recon (Ford). Responda sempre em português, de forma direta e objetiva.

Use SOMENTE os dados de contexto abaixo (coletados via OSINT: Wikipedia + EV Database) para responder sobre especificações técnicas e concorrentes. Se o contexto não tiver a informação pedida, diga claramente que não encontrou esse dado na coleta atual - não invente números.

Contexto coletado:
${context}`

        const ollamaMessages = [
            { role: "system", content: systemPrompt },
            ...history.slice(1).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
        ]

        const response = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: ollamaMessages,
                stream: false,
            }),
        })

        if (!response.ok) {
            throw new Error(`Ollama respondeu ${response.status}`)
        }

        const data = await response.json()

        return (data.message?.content as string | undefined)?.trim()
            || "Não consegui gerar uma resposta a partir do modelo local."
    }

    async function sendMessage(text?: string) {

        const content = text || input

        if (!content.trim()) return

        const userMessage: MessageType = {
            role: "user",
            content,
        }

        const history = messages

        setMessages((prev) => [
            ...prev,
            userMessage,
        ])

        setInput("")
        setThinking(true)

        try {

            const reply = await generateResponse(content, history)

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: reply },
            ])

        } catch {

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Não consegui falar com o modelo local (Ollama). Confirme que ele está rodando (`ollama serve` ou `brew services start ollama`) e que o modelo foi baixado (`ollama pull llama3.2`).",
                },
            ])

        } finally {
            setThinking(false)
        }
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