// Central de Alertas - deriva os alertas a partir dos MESMOS dados que
// alimentam o Dashboard (osint.ts / sales.ts), em vez de uma lista fixa
// mockada. Sem isso, "alerta" nao alertava nada - era so texto decorativo
// que nunca mudava, mesmo quando os numeros reais indicavam algo relevante
// (queda de coleta, marca em alta/queda forte, sinal de alta confianca).

import { useEffect, useMemo, useState } from "react"
import { getDiscoveryDelta, getTopDiscoveries } from "./osint"
import { getTopBrandGrowth, SALES_META } from "./sales"

export type AlertSeverity = "critical" | "warning" | "info"

export type Alert = {
    id: string
    severity: AlertSeverity
    title: string
    desc: string
    time: string
}

// abaixo desses limiares o numero e' normal/ruido, nao vira alerta
const DISCOVERY_DROP_THRESHOLD_PCT = 8
const BRAND_GROWTH_THRESHOLD_PCT = 25
const BRAND_DECLINE_THRESHOLD_PCT = -30
const HIGH_CONFIDENCE_THRESHOLD = 90

export function getAlerts(): Alert[] {
    const alerts: Alert[] = []

    // 1) queda no volume de coleta OSINT (mesmo dado do KPI "Descobertas OSINT")
    const discoveryDelta = getDiscoveryDelta(7)
    if (!discoveryDelta.positive && discoveryDelta.pct >= DISCOVERY_DROP_THRESHOLD_PCT) {
        alerts.push({
            id: "discovery-drop",
            severity: discoveryDelta.pct >= 20 ? "critical" : "warning",
            title: "Queda no volume de coleta OSINT",
            desc: `Descobertas caíram ${discoveryDelta.pct}% nos últimos 7 dias em relação ao ciclo anterior.`,
            time: "Últimos 7 dias",
        })
    }

    // 2) marcas com alta/queda forte de vendas (mesmo dado do card "Maior
    // variação de vendas — por marca" do Dashboard)
    const { up: brandUp, down: brandDown } = getTopBrandGrowth(5)

    for (const b of brandUp) {
        if ((b.delta_pct ?? 0) < BRAND_GROWTH_THRESHOLD_PCT) continue
        alerts.push({
            id: `brand-up-${b.brand}`,
            severity: "info",
            title: `${b.brand} em forte alta de vendas`,
            desc: `+${b.delta_pct}% em unidades (${SALES_META.period_current} vs ${SALES_META.period_previous}) — ${b.units_current.toLocaleString("pt-BR")} un.`,
            time: String(SALES_META.year_current),
        })
    }

    for (const b of brandDown) {
        if (b.units_current <= 0) continue // saiu da amostra top-N, nao e' queda real (ver lib/sales.ts)
        if ((b.delta_pct ?? 0) > BRAND_DECLINE_THRESHOLD_PCT) continue
        alerts.push({
            id: `brand-down-${b.brand}`,
            severity: "critical",
            title: `${b.brand} em queda acentuada de vendas`,
            desc: `${b.delta_pct}% em unidades — pode indicar perda de participação de mercado.`,
            time: String(SALES_META.year_current),
        })
    }

    // 3) sinais tecnicos de alta confianca (mesmo dado do "Feed Estrategico")
    const highConfidence = getTopDiscoveries(6, []).filter((d) => d.confidence >= HIGH_CONFIDENCE_THRESHOLD)
    for (const t of highConfidence.slice(0, 3)) {
        alerts.push({
            id: `trend-${t.id}`,
            severity: "info",
            title: `${t.target} · ${t.field}`,
            desc: t.value,
            time: t.discovered_at,
        })
    }

    const severityRank: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 }
    alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity])

    return alerts
}

// --------------------------------------------------------------------------
// Estado de leitura - os alertas em si sao recalculados a cada load (sao
// derivados dos dados, nao guardados em banco), mas "lido/dispensado" e'
// por ID e persiste em localStorage - sem isso, marcar como lido nao
// significava nada (a lista sempre voltava do zero no proximo render).
// --------------------------------------------------------------------------

const DISMISSED_KEY = "specrecon:dismissed-alerts"

function readDismissed(): Set<string> {
    try {
        const raw = localStorage.getItem(DISMISSED_KEY)
        return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
        return new Set()
    }
}

function writeDismissed(ids: Set<string>) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]))
}

export function useAlerts() {
    const allAlerts = useMemo(() => getAlerts(), [])
    const [dismissed, setDismissed] = useState<Set<string>>(() => readDismissed())

    useEffect(() => {
        writeDismissed(dismissed)
    }, [dismissed])

    function dismiss(id: string) {
        setDismissed((prev) => new Set(prev).add(id))
    }

    function dismissAll() {
        setDismissed((prev) => {
            const next = new Set(prev)
            for (const a of allAlerts) next.add(a.id)
            return next
        })
    }

    function restoreAll() {
        setDismissed(new Set())
    }

    const alerts = allAlerts.filter((a) => !dismissed.has(a.id))

    return { alerts, totalCount: allAlerts.length, dismiss, dismissAll, restoreAll }
}
