// Conferencia de fonte enviada pelo usuario no chat do Assistente (Henry) -
// pedido explicito do usuario: "sempre que ele enviar uma fonte conferir
// tambem naquele site". Diferente do fallback de busca web (lib/webSearch.ts,
// so acionado quando os dados locais nao cobrem a pergunta), isso roda
// SEMPRE que a mensagem do usuario tiver um link, independente de já haver
// dado local - o objetivo aqui não é preencher lacuna, é CONFERIR o que o
// usuário trouxe contra o que o app já sabe (e apontar divergência).
//
// Sites de carro/imprensa em geral nao liberam CORS pra fetch direto do
// navegador (por isso o webSearch.ts so usa DuckDuckGo/Wikipedia, que
// liberam) - um link arbitrario mandado pelo usuario pode ser qualquer
// dominio. Sem backend proprio pra fazer esse fetch server-side, usamos o
// r.jina.ai (leitor de pagina publico, sem API key, devolve o conteudo em
// texto/markdown limpo de qualquer URL e libera CORS) - mesma filosofia das
// outras integracoes deste arquivo/pasta (gratis, sem chave, feito pra uso
// direto do navegador).

import { isTrustedSource } from "./trustedSources"

export type UserSourceCheck = {
    url: string
    text: string
    trusted: boolean
}

const FETCH_TIMEOUT_MS = 10000
const MAX_TEXT_LENGTH = 3000

// captura a primeira URL http(s) da mensagem; string entre parenteses ou
// pontuacao de fim de frase (".", ",", ")") gruda no regex facil, por isso
// o strip de trailing chars logo abaixo.
const URL_PATTERN = /https?:\/\/[^\s<>"]+/i

export function extractUrl(text: string): string | null {
    const match = text.match(URL_PATTERN)
    if (!match) return null
    return match[0].replace(/[).,;!?\]]+$/, "")
}

/** Busca o conteudo de uma URL enviada pelo usuario via r.jina.ai e marca
 * se o dominio e confiavel (mesmo registro usado pro fallback de busca web,
 * ver lib/trustedSources.ts). Nao lanca excecao - falha de rede/timeout
 * vira null, e o Assistant.tsx avisa o usuario que nao deu pra acessar o
 * link. */
export async function fetchUserProvidedSource(url: string): Promise<UserSourceCheck | null> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
        const response = await fetch(`https://r.jina.ai/${url}`, { signal: controller.signal })
        if (!response.ok) return null

        const text = await response.text()
        if (!text.trim()) return null

        return {
            url,
            text: text.trim().slice(0, MAX_TEXT_LENGTH),
            trusted: isTrustedSource(url),
        }
    } catch {
        return null
    } finally {
        clearTimeout(timeout)
    }
}
