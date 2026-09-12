"""
build_monthly_sales.py
========================

Junta o ranking MENSAL coletado por press_sales.py (Autoesporte + Quatro
Rodas) num unico snapshot pro frontend (../src/data/salesMonthly.json).

Por que um arquivo separado de salesRankings.json: aquele e' o acumulado
do ano (sales_radar.py/build_sales.py, fonte carrolens/Fenabrave) - este
aqui e' o mes isolado, vindo de 2 portais de imprensa que publicam o
recorte mensal. Sao trilhas complementares, nao substitutas uma da outra:
salesRankings.json responde "quanto vendeu no ano"; salesMonthly.json
responde "quanto vendeu NUM MES especifico".

Cruzamento de fontes: quando os 2 portais tem o mesmo brand+model, o
`units` final e a MEDIA dos 2 (arredondada) e o campo `sources_agree`
marca `true` se a diferenca entre eles for <=2% (a diferenca observada em
agosto/2026, ex. Fiat Strada 13.794 vs 13.796, e de corte de horario, nao
erro de coleta). Diferenca maior vira `false` - motivo pra desconfiar do
numero em vez de confiar cegamente por ter 2 fontes.

Rodar manualmente pra atualizar (`python build_monthly_sales.py <mes> <ano>`,
ex.: `python build_monthly_sales.py agosto 2026`). Sem argumento, tenta o
mes anterior ao atual (mes corrente normalmente ainda nao fechou).
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from datetime import datetime
from pathlib import Path

from press_sales import MESES_PT, collect_month

FRONTEND_DATA_DIR = Path(__file__).parent.parent / "src" / "data"

AGREEMENT_THRESHOLD_PCT = 2.0  # diferenca %% acima disso = sources_agree: false


def _norm_key(text: str) -> str:
    """Normaliza nome de modelo pra casar entre fontes com grafia
    diferente (QR usa caixa alta e sem hifen: 'T CROSS' vs Autoesporte
    'T-Cross') - remove acento, caixa, e qualquer separador."""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", text.lower())


def _merge_rows(rows_by_source: dict[str, list[dict]], key_fields: tuple[str, ...]) -> list[dict]:
    """rows_by_source: {"Autoesporte": [...], "Quatro Rodas": [...]}.
    key_fields: ("brand",) pra marca, ("brand", "model") pra modelo."""
    merged: dict[tuple, dict] = {}

    for source, rows in rows_by_source.items():
        for row in rows:
            key = tuple(_norm_key(row[f]) for f in key_fields)
            entry = merged.setdefault(key, {f: row[f] for f in key_fields})
            entry[f"units_{_slug(source)}"] = row["units"]
            entry[f"rank_{_slug(source)}"] = row["rank"]

    out = []
    for entry in merged.values():
        unit_values = [v for k, v in entry.items() if k.startswith("units_")]
        units = round(sum(unit_values) / len(unit_values)) if unit_values else None
        sources_agree = True
        if len(unit_values) > 1:
            spread_pct = (max(unit_values) - min(unit_values)) / max(unit_values) * 100
            sources_agree = spread_pct <= AGREEMENT_THRESHOLD_PCT
        entry["units"] = units
        entry["n_sources"] = len(unit_values)
        entry["sources_agree"] = sources_agree if len(unit_values) > 1 else None
        out.append(entry)

    out.sort(key=lambda e: -(e["units"] or 0))
    return out


def _slug(source_name: str) -> str:
    return source_name.lower().replace(" ", "_")


def build_month(month_pt: str, year: int) -> dict:
    print(f"[*] Coletando ranking mensal de {month_pt}/{year}...")
    raw = collect_month(month_pt, year)

    by_brand = _merge_rows({s: d["brands"] for s, d in raw.items()}, ("brand",))
    by_model = _merge_rows({s: d["models"] for s, d in raw.items()}, ("brand", "model"))

    return {
        "meta": {
            "month": month_pt,
            "year": year,
            "label": f"{month_pt.capitalize()}/{year}",
            "sources": [
                {"name": source, "url": data["source_url"]}
                for source, data in raw.items()
            ],
            "generated_at": datetime.now().isoformat(),
            "note": (
                "Ranking do MES ISOLADO (nao acumulado do ano - ver "
                "salesRankings.json pra isso). Quando 2 fontes de imprensa "
                "publicam o mesmo mes, 'units' e a media das duas e "
                "'sources_agree' indica se elas bateram (diferença <= "
                f"{AGREEMENT_THRESHOLD_PCT}%) ou nao."
            ),
        },
        "by_brand": by_brand,
        "by_model": by_model,
    }


def main() -> None:
    if len(sys.argv) > 2:
        month_pt, year = sys.argv[1], int(sys.argv[2])
    else:
        now = datetime.now()
        prev_month_num = now.month - 1 if now.month > 1 else 12
        prev_year = now.year if now.month > 1 else now.year - 1
        month_pt, year = MESES_PT[prev_month_num], prev_year

    output = build_month(month_pt, year)

    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_path = FRONTEND_DATA_DIR / "salesMonthly.json"
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n[*] {len(output['by_brand'])} marcas, {len(output['by_model'])} modelos -> {out_path}")
    disagreements = [m for m in output["by_model"] if m["sources_agree"] is False]
    if disagreements:
        print(f"[!] {len(disagreements)} modelos com fontes divergindo >{AGREEMENT_THRESHOLD_PCT}%: "
              + ", ".join(f"{m['brand']} {m['model']}" for m in disagreements))


if __name__ == "__main__":
    main()
