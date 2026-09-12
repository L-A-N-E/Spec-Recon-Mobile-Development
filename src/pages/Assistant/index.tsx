import { useEffect, useRef, useState } from "react"

import {
    Bot,
    Send,
    Sparkles,
    User,
    ShieldCheck,
    Globe,
    RotateCcw,
    BadgeCheck,
    ShieldQuestion,
} from "lucide-react"

import { buildOsintContext, NO_OSINT_CONTEXT } from "../../lib/osint"
import { buildSalesContext } from "../../lib/sales"
import { webSearchFallback } from "../../lib/webSearch"
import { learnTrustedDomain } from "../../lib/trustedSources"

import agentsDoc from "../../AGENTS.md?raw"

type MessageType = {
    role: "user" | "assistant"
    content: string
    /** presente quando a resposta usou o fallback de busca web (nao so dados
     * locais) - a UI mostra a fonte direto (nao depende do modelo lembrar
     * de citar no texto, ver AGENTS.md regra 3). `trusted` vem do registro
     * de fontes confiaveis (lib/trustedSources.ts) - "sistema de
     * aprendizado": fonte nao confiavel ganha um botao pro usuario aprovar
     * manualmente, nunca confia sozinha so por aparecer numa busca. */
    webSource?: { label: string; url: string; trusted: boolean }
}

// Modelo rodando localmente via Ollama (gratuito, sem API key - so funciona
// com `ollama serve` ativo na maquina de quem esta usando a pagina). Trocado
// de llama3.2 (3B) pra llama3.1 (8B): melhor raciocinio e portugues sem
// pesar demais numa maquina com 16GB de RAM - se tiver mais RAM sobrando,
// qwen2.5:14b tende a ser ainda melhor em pt-BR.
const OLLAMA_URL = "http://localhost:11434/api/chat"
const OLLAMA_MODEL = "llama3.1:8b"

const suggestions = [
    "Quantos carros a Fiat vendeu em 2025 e quanto faturou?",
    "Qual a autonomia da BYD Seal?",
    "Compare a potência do Tesla Model 3 e do Kia EV6",
    "Quem foi Henry Ford?",
]

const initialMessages: MessageType[] = [
    {
        role: "assistant",
        content:
            "Olá, sou o Henry — assistente estratégico da Ford, batizado em homenagem ao fundador da empresa. Respondo com base nos dados reais coletados pelo Radar (ficha técnica + vendas Fenabrave) e, quando não encontro algo localmente, busco na internet e aviso a fonte. Rodando localmente via Ollama.",
    },
]

// Conversa persiste no localStorage do navegador (por dispositivo, nao
// sincroniza entre maquinas/contas) - sobrevive a refresh/fechar aba, mas
// se perde se o usuario limpar dados do site ou trocar de navegador.
const STORAGE_KEY = "spec-recon:henry-chat"

function loadStoredMessages(): MessageType[] | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null

        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
    } catch {
        return null // localStorage indisponivel (modo privado) ou JSON corrompido - comeca do zero
    }
}

function Assistant() {

    const [messages, setMessages] = useState<MessageType[]>(() => loadStoredMessages() ?? initialMessages)

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

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
        } catch {
            // localStorage indisponivel/cheio - conversa so nao persiste, app continua funcionando normal
        }
    }, [messages])

    function trustSource(messageIndex: number) {
        setMessages((prev) =>
            prev.map((m, i) => {
                if (i !== messageIndex || !m.webSource) return m
                learnTrustedDomain(m.webSource.url)
                return { ...m, webSource: { ...m.webSource, trusted: true } }
            })
        )
    }

    function clearConversation() {
        setMessages(initialMessages)
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch {
            // nada a fazer se localStorage nao estiver disponivel
        }
    }

    async function generateResponse(
        text: string,
        history: MessageType[]
    ): Promise<{ content: string; webSource?: { label: string; url: string; trusted: boolean } }> {

        const osintContext = buildOsintContext(text)
        const salesContext = buildSalesContext(text)

        const localDataFound = osintContext !== NO_OSINT_CONTEXT || salesContext !== ""

        let webBlock = ""
        let webSource: { label: string; url: string; trusted: boolean } | undefined

        if (!localDataFound) {
            const webResult = await webSearchFallback(text)

            if (webResult) {
                webSource = { label: webResult.sourceLabel, url: webResult.sourceUrl, trusted: webResult.trusted }

                const trustNote = webResult.trusted
                    ? "fonte confiável (registrada como grande veículo de comunicação ou base técnica)"
                    : "ATENÇÃO: fonte NÃO verificada - trate com mais cautela, deixe claro pro usuário que não é uma fonte confiável conhecida"

                webBlock = `\n\n[BUSCA WEB - os dados locais nao cobriam essa pergunta, use o resultado abaixo]\nFonte: ${webResult.sourceLabel} (${webResult.sourceUrl}) - ${trustNote}\n${webResult.text}`
            }
        }

        const systemPrompt = `${agentsDoc}

---

Contexto coletado (dados locais - ficha técnica OSINT e vendas/faturamento Fenabrave):
${osintContext}
${salesContext || "(nenhum dado de vendas/faturamento bate com essa pergunta)"}${webBlock}`

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

        const content = (data.message?.content as string | undefined)?.trim()
            || "Não consegui gerar uma resposta a partir do modelo local."

        return { content, webSource }
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

            const { content: reply, webSource } = await generateResponse(content, history)

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: reply, webSource },
            ])

        } catch {

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        `Não consegui falar com o modelo local (Ollama). Confirme que ele está rodando (\`ollama serve\` ou \`brew services start ollama\`) e que o modelo foi baixado (\`ollama pull ${OLLAMA_MODEL}\`).`,
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
                            Henry
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

                            Online · OSINT + vendas + busca web
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={clearConversation}
                        className="
                            ml-auto
                            flex
                            items-center
                            gap-2
                            h-10
                            px-4
                            rounded-xl
                            border
                            border-white/10
                            text-sm
                            text-white/60
                            hover:bg-white/5
                            hover:text-white
                            transition-colors
                            cursor-pointer
                        "
                    >
                        <RotateCcw className="w-4 h-4" />
                        Nova conversa
                    </button>
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
                                    {message.webSource && (
                                        <div className="flex items-center gap-1.5 mb-2 text-[11px] uppercase tracking-wider text-blue-300/80">
                                            <Globe className="w-3 h-3" />
                                            Busca web
                                            {message.webSource.trusted ? (
                                                <span className="flex items-center gap-1 text-green-400 normal-case tracking-normal">
                                                    <BadgeCheck className="w-3 h-3" />
                                                    fonte confiável
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-amber-400 normal-case tracking-normal">
                                                    <ShieldQuestion className="w-3 h-3" />
                                                    não verificada
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {message.content}
                                    {message.webSource && (
                                        <div className="mt-3 flex flex-wrap items-center gap-3">
                                            <a
                                                href={message.webSource.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 text-xs text-blue-300/70 hover:text-blue-300 transition-colors w-fit"
                                            >
                                                Fonte: {message.webSource.label}
                                            </a>

                                            {!message.webSource.trusted && (
                                                <button
                                                    type="button"
                                                    onClick={() => trustSource(index)}
                                                    className="text-xs text-amber-300/80 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
                                                >
                                                    Confiar nesta fonte
                                                </button>
                                            )}
                                        </div>
                                    )}
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