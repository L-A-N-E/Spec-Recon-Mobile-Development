// "Noticias da semana" do Dashboard - busca AO VIVO (sem snapshot estatico
// gerado por script Python, diferente do resto do app) em 3 fontes de
// imprensa/industria automotiva pedidas explicitamente pelo usuario:
// AutoData, AutoForum e Automotive Business. Ao vivo pra sempre trazer a
// noticia mais recente sem precisar lembrar de rodar um script.
//
// Nenhum dos 3 libera CORS pra fetch direto do navegador (mesmo problema
// que motivou lib/sourceCheck.ts pro link que o usuario manda no Henry) -
// usa o mesmo r.jina.ai (leitor de pagina publico, sem chave, libera CORS,
// devolve markdown limpo) e faz parse do markdown resultante.
//
// AutoData tem RSS de verdade, bem estruturado, com data de publicacao por
// item. AutoForum tambem tem RSS, mas e' um FORUM de som automotivo (nao
// um portal de noticia dedicado) - o link por item vem vazio na extracao
// do r.jina.ai pra esse feed especifico (confirmado testando os 3 formatos
// de resposta dele - text/html/markdown - nenhum resolve o href do item,
// aparenta ser limitacao do parser deles nesse XML) - sem link por item,
// cai no link da home do site (avisado no campo `title` do NewsItem, que
// deixa claro que e' so titulo+data, sem link direto). Automotive Business
// e' uma SPA em React sem RSS funcional - busca a home e le a secao
// "Ultimas Noticias" (tem link real, mas sem data por manchete).
//
// Cache em memoria (nao localStorage - noticia nao precisa sobreviver a
// fechar a aba) com TTL curto: sem isso, cada navegacao pro Dashboard ou
// abertura do sino de alertas (lib/alerts.ts, que tambem usa isso) bateria
// de novo nos 3 sites.

export type NewsItem = {
    title: string
    url: string
    source: string
    /** ISO 8601 quando a fonte publica data por item (AutoData/AutoForum);
     * null quando nao da pra saber (Automotive Business, home sem data). */
    publishedAt: string | null
}

const FETCH_TIMEOUT_MS = 12000
const CACHE_TTL_MS = 30 * 60 * 1000 // 30min - notícia nao muda a cada segundo

const SOURCES = [
    { name: "AutoData", url: "https://www.autodata.com.br/feed/", kind: "rss" as const, fallbackUrl: "https://www.autodata.com.br/" },
    { name: "AutoForum", url: "https://autoforum.com.br/rss/1-rss.xml/", kind: "rss" as const, fallbackUrl: "https://autoforum.com.br/" },
    { name: "Automotive Business", url: "https://www.automotivebusiness.com.br/", kind: "home" as const, fallbackUrl: "https://www.automotivebusiness.com.br/" },
]

async function fetchViaJina(url: string): Promise<string | null> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
        const response = await fetch(`https://r.jina.ai/${url}`, { signal: controller.signal })
        if (!response.ok) return null
        const text = await response.text()
        return text.trim() || null
    } catch {
        return null
    } finally {
        clearTimeout(timeout)
    }
}

function parseDate(raw: string): string | null {
    const parsed = new Date(raw)
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

/** Extrai itens de um markdown no formato que o r.jina.ai devolve pra RSS:
 *   ### [Titulo](link)
 *   [link](link)          <- as vezes vazio (AutoForum)
 *   Data RFC822 (ex.: "Fri, 11 Sep 2026 20:01:55 +0000")
 */
function parseRssMarkdown(markdown: string, source: string, maxItems: number, fallbackUrl: string): NewsItem[] {
    const items: NewsItem[] = []
    const headingPattern = /^### \[(.+?)\]\((.*?)\)$/gm
    let match: RegExpExecArray | null

    while (items.length < maxItems && (match = headingPattern.exec(markdown))) {
        const title = match[1].trim()
        const link = match[2].trim()

        // a data de cada item fica logo depois do titulo no markdown do
        // r.jina.ai - procura um RFC822 nos ~300 chars seguintes
        const afterHeading = markdown.slice(headingPattern.lastIndex, headingPattern.lastIndex + 300)
        const dateMatch = afterHeading.match(/[A-Z][a-z]{2}, \d{1,2} [A-Z][a-z]{2} \d{4} [\d:]{8} [+-]\d{4}/)

        items.push({
            title,
            url: link && link.startsWith("http") ? link : fallbackUrl,
            source,
            publishedAt: dateMatch ? parseDate(dateMatch[0]) : null,
        })
    }

    return items
}

function extractSection(markdown: string, heading: string): string {
    const start = markdown.indexOf(`## ${heading}`)
    if (start === -1) return ""
    const rest = markdown.slice(start + heading.length + 3)
    const nextHeadingIdx = rest.search(/\n## /)
    return nextHeadingIdx === -1 ? rest : rest.slice(0, nextHeadingIdx)
}

/** Extrai manchetes da secao "Ultimas Noticias" da home da Automotive
 * Business (sem RSS funcional). Sem data por manchete - a home nao
 * publica isso. Pula conteudo patrocinado/opiniao (nao e' noticia de
 * fato). */
function parseHomeHeadlines(markdown: string, source: string, maxItems: number): NewsItem[] {
    const section = extractSection(markdown, "Últimas Notícias")
    if (!section) return []

    const items: NewsItem[] = []
    const pattern = /^\*\s+### \[(.+?)\]\((https?:\/\/[^)]+)\)$/gm
    let match: RegExpExecArray | null

    while (items.length < maxItems && (match = pattern.exec(section))) {
        const url = match[2].trim()
        if (url.includes("/conteudo-de-marca/") || url.includes("/opiniao/")) continue
        items.push({ title: match[1].trim(), url, source, publishedAt: null })
    }

    return items
}

/** Busca as 3 fontes em paralelo e INTERCALA os resultados (1 de cada fonte
 * por vez) em vez de so ordenar por data - a Automotive Business nao
 * publica data por manchete, entao um sort puro por data deixaria ela
 * sempre por ultimo (ou de fora), mesmo o pedido sendo conferir AS TRES
 * fontes sempre. Falha de uma fonte (rede/timeout) nao derruba as outras -
 * vira lista vazia pra ela. */
export async function fetchWeeklyNews(perSourceLimit = 4): Promise<NewsItem[]> {
    const markdowns = await Promise.all(SOURCES.map((s) => fetchViaJina(s.url)))

    const bySource = SOURCES.map((s, i) => {
        const markdown = markdowns[i]
        if (!markdown) return []
        return s.kind === "rss"
            ? parseRssMarkdown(markdown, s.name, perSourceLimit, s.fallbackUrl)
            : parseHomeHeadlines(markdown, s.name, perSourceLimit)
    })

    const merged: NewsItem[] = []
    for (let i = 0; i < perSourceLimit; i++) {
        for (const list of bySource) {
            if (list[i]) merged.push(list[i])
        }
    }

    return merged
}

let cache: { items: NewsItem[]; fetchedAt: number } | null = null
let pending: Promise<NewsItem[]> | null = null

/** Mesmo pool de noticias compartilhado entre a secao "Noticias da semana"
 * do Dashboard e os alertas (lib/alerts.ts) - cacheado em memoria (TTL
 * `CACHE_TTL_MS`) pra nao bater nos 3 sites de novo a cada navegacao. */
export async function getWeeklyNewsCached(perSourceLimit = 4): Promise<NewsItem[]> {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.items
    if (pending) return pending

    pending = fetchWeeklyNews(perSourceLimit).then((items) => {
        cache = { items, fetchedAt: Date.now() }
        pending = null
        return items
    })

    return pending
}
