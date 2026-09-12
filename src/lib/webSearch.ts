// Fallback de busca web pro Assistente (Henry) - so acionado quando os
// dados locais (OSINT + vendas) nao cobrem a pergunta (ver AGENTS.md,
// regra 3). Sem backend proprio, entao so da pra usar APIs que respondem
// CORS liberado direto pro navegador (sem chave, gratis):
//
//   1. DuckDuckGo Instant Answer API - resposta curta tipo "ficha" sobre
//      o topico (empresas, conceitos, pessoas). Nao e busca completa, mas
//      cobre bem pergunta geral ("o que e motor de fluxo axial").
//   2. Wikipedia (pt, depois en) - search API + extrato do primeiro
//      resultado. Mesma fonte que o osint-radar ja usa no lado Python,
//      aqui chamada direto do navegador.
//
// Corta na primeira que trouxer algo util. Se nenhuma trouxer, devolve
// null - o Assistant.tsx entao avisa o usuario que nao achou a info em
// nenhum lugar (nunca inventa).
//
// Toda fonte devolvida passa pelo registro de fontes confiaveis
// (lib/trustedSources.ts) ANTES de virar contexto pro modelo - "sempre
// conferir se é um site confiável antes" (pedido explicito do usuario).
// Um resultado de dominio nao confiavel ainda e mostrado (nunca escondido
// - o usuario decide), mas marcado como nao verificado na UI, e o
// Assistant.tsx pede pro modelo tratar com mais cautela.

import { isTrustedSource } from "./trustedSources"

export type WebSearchResult = {
    text: string
    sourceUrl: string
    sourceLabel: string
    trusted: boolean
}

const FETCH_TIMEOUT_MS = 6000

async function fetchWithTimeout(url: string): Promise<Response | null> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
        const response = await fetch(url, { signal: controller.signal })
        return response.ok ? response : null
    } catch {
        return null
    } finally {
        clearTimeout(timeout)
    }
}

async function fetchDuckDuckGoInstantAnswer(query: string): Promise<WebSearchResult | null> {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`

    const response = await fetchWithTimeout(url)
    if (!response) return null

    const data = await response.json().catch(() => null)
    if (!data) return null

    const text: string | undefined = data.AbstractText || data.Answer
    const sourceUrl: string | undefined = data.AbstractURL || data.AbstractSource

    if (!text || !text.trim()) return null

    const resolvedUrl = sourceUrl || url

    return {
        text: text.trim(),
        sourceUrl: resolvedUrl,
        sourceLabel: "DuckDuckGo",
        trusted: isTrustedSource(resolvedUrl),
    }
}

async function fetchWikipediaSummary(query: string, lang: "pt" | "en"): Promise<WebSearchResult | null> {
    const searchUrl =
        `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}` +
        "&format=json&srlimit=1&origin=*"

    const searchResponse = await fetchWithTimeout(searchUrl)
    if (!searchResponse) return null

    const searchData = await searchResponse.json().catch(() => null)
    const title: string | undefined = searchData?.query?.search?.[0]?.title
    if (!title) return null

    const extractUrl =
        `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1` +
        `&titles=${encodeURIComponent(title)}&format=json&origin=*`

    const extractResponse = await fetchWithTimeout(extractUrl)
    if (!extractResponse) return null

    const extractData = await extractResponse.json().catch(() => null)
    const pages = extractData?.query?.pages as Record<string, { extract?: string }> | undefined
    const firstPage = pages ? Object.values(pages)[0] : undefined
    const extract: string | undefined = firstPage?.extract

    if (!extract || !extract.trim()) return null

    const resolvedUrl = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`

    return {
        text: extract.trim().slice(0, 1200),
        sourceUrl: resolvedUrl,
        sourceLabel: `Wikipédia (${lang})`,
        trusted: isTrustedSource(resolvedUrl),
    }
}

/** Tenta as fontes web em ordem (DDG -> Wikipedia PT -> Wikipedia EN) e
 * fica com a primeira que trouxer resultado. Nao lanca excecao - falha de
 * rede vira simplesmente "nao achou nada" (null), pro Assistant tratar
 * como "sem info em lugar nenhum". */
export async function webSearchFallback(query: string): Promise<WebSearchResult | null> {
    const attempts = [
        () => fetchDuckDuckGoInstantAnswer(query),
        () => fetchWikipediaSummary(query, "pt"),
        () => fetchWikipediaSummary(query, "en"),
    ]

    for (const attempt of attempts) {
        const result = await attempt()
        if (result) return result
    }

    return null
}
