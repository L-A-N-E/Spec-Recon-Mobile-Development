// Registro de fontes confiaveis - "sistema de aprendizado" do Assistente
// (Henry). Toda vez que o fallback de busca web (lib/webSearch.ts) traz um
// resultado, o dominio da fonte e conferido AQUI antes de ser apresentado
// como confiavel na conversa (pedido explicito do usuario: "sempre
// conferir se é um site confiável antes").
//
// Nao ha confianca automatica de dominio desconhecido - um resultado de
// busca poderia alegar ser de uma fonte confiavel (ou vir de um site
// comprometido) e isso NAO pode bastar sozinho pra virar "confiavel" pro
// modelo. Em vez disso, duas camadas:
//   1. SEED_TRUSTED_DOMAINS: lista curada a mao com grandes veiculos de
//      comunicacao (G1, UOL, R7/Record, Band...) e as fontes tecnicas ja
//      usadas no osint-radar (Wikipedia, EV Database, iCarros...).
//   2. Lista "aprendida", guardada no localStorage do navegador, que so
//      cresce quando o PROPRIO usuario aprova explicitamente uma fonte
//      ainda nao confiavel (botao "Confiar nesta fonte" na citacao do
//      Assistant, ver src/pages/Assistant/index.tsx). Isso e o
//      "aprendizado": o app melhora com o uso, mas nunca confiando cego em
//      qualquer coisa que apareca numa busca.
//
// Mesma lista de dominios .br que osint_radar.py registra como fonte -
// como Python e TS nao compartilham import aqui, mantenha as duas listas
// em sincronia manualmente ao adicionar uma fonte nova.

const SEED_TRUSTED_DOMAINS = [
    // grandes veiculos de comunicacao (pedido explicito do usuario)
    "g1.globo.com",
    "globo.com",
    "oglobo.globo.com",
    "autoesporte.globo.com",
    "uol.com.br",
    "band.uol.com.br",
    "r7.com",
    "recordtv.r7.com",
    // enciclopedia / bases tecnicas
    "wikipedia.org",
    "ev-database.org",
    // fichas tecnicas .br ja registradas no osint-radar
    "icarros.com.br",
    "webmotors.com.br",
    "motor1.uol.com.br",
    "carrosnaweb.com.br",
    "flatout.com.br",
    "autopapo.com.br",
]

const LEARNED_STORAGE_KEY = "spec-recon:trusted-sources-learned"

function getLearnedDomains(): string[] {
    try {
        const raw = localStorage.getItem(LEARNED_STORAGE_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        return Array.isArray(parsed) ? parsed.filter((d): d is string => typeof d === "string") : []
    } catch {
        return []
    }
}

function hostnameOf(url: string): string | null {
    try {
        return new URL(url).hostname.replace(/^www\./, "").toLowerCase()
    } catch {
        return null
    }
}

function matchesDomain(hostname: string, domain: string): boolean {
    return hostname === domain || hostname.endsWith(`.${domain}`)
}

export function getTrustedDomains(): string[] {
    return [...SEED_TRUSTED_DOMAINS, ...getLearnedDomains()]
}

export function isTrustedSource(url: string): boolean {
    const hostname = hostnameOf(url)
    if (!hostname) return false
    return getTrustedDomains().some((domain) => matchesDomain(hostname, domain))
}

/** "Aprende" uma fonte nova - so deve ser chamado por uma acao EXPLICITA do
 * usuario (nunca automaticamente a partir do conteudo de uma busca), pra
 * nao virar um vetor de manipulacao (um resultado que alega ser confiavel
 * nao pode virar confiavel sozinho). Persiste no localStorage - fica
 * "aprendido" nesse navegador dali em diante. */
export function learnTrustedDomain(url: string): void {
    const hostname = hostnameOf(url)
    if (!hostname) return

    const learned = getLearnedDomains()
    if (learned.includes(hostname)) return

    try {
        localStorage.setItem(LEARNED_STORAGE_KEY, JSON.stringify([...learned, hostname]))
    } catch {
        // localStorage indisponivel - a fonte so fica confiavel nesta sessao (nao persiste)
    }
}
