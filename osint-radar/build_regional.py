"""
build_regional.py
====================

Exporta a distribuição de vendas por estado/região (regional_sales.py,
fonte: fenabrave.online) pro frontend (../src/data/salesByRegion.json).

Granularidade DIFERENTE do salesRankings.json (build_sales.py): isso é
um snapshot do MÊS mais recente fechado, cobrindo só os modelos mais
vendidos nacionalmente (~60-70) - não é o total de emplacamentos do
estado nem é acumulado do ano. Ver aviso completo em regional_sales.py.

Rodar manualmente quando quiser atualizar (`python build_regional.py`).
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from regional_sales import fetch_model_state_matrix, aggregate_by_state, aggregate_by_region

FRONTEND_DATA_DIR = Path(__file__).parent.parent / "src" / "data"


def main() -> None:
    print("[*] Coletando matriz modelo x estado (fenabrave.online)...")
    matrix = fetch_model_state_matrix()

    if not matrix["rows"]:
        print("[!] Nenhum dado coletado - abortando sem sobrescrever o JSON existente.")
        return

    by_state = aggregate_by_state(matrix)
    by_region = aggregate_by_region(by_state)

    output = {
        "meta": {
            "month_label": matrix["month_label"],
            "n_models_sample": len(matrix["rows"]),
            "source": "Fenabrave (via fenabrave.online)",
            "source_url": "https://www.fenabrave.online/",
            "generated_at": datetime.now().isoformat(),
            "note": (
                f"Amostra dos {len(matrix['rows'])} modelos mais vendidos do Brasil "
                f"em {matrix['month_label']} (não o total de emplacamentos do "
                "estado - modelos de nicho regional fora do top nacional não "
                "entram). Snapshot de 1 mês, não acumulado do ano."
            ),
        },
        "by_state": by_state,
        "by_region": by_region,
    }

    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_path = FRONTEND_DATA_DIR / "salesByRegion.json"
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[*] {len(by_state)} estados, {len(by_region)} regiões -> {out_path}")
    for r in by_region:
        print(f"    {r['region']:<14} {r['units']:>6} un. ({r['pct']}%)")


if __name__ == "__main__":
    main()
