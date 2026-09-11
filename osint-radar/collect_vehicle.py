"""
collect_vehicle.py
===================

Coleta UM veiculo especifico (marca + modelo) em todas as fontes
cadastradas em SOURCES (osint_radar.py) e faz MERGE no
osintDiscoveries.json / osintVehicleSpecs.json do frontend - sem precisar
rodar o CATALOG inteiro do build_dataset.py, que demora muito e arrisca
tomar CAPTCHA do DuckDuckGo antes de terminar (ver aviso em
duckduckgo_search() no osint_radar.py).

Por que isso existe: o CATALOG do build_dataset.py cresceu (veiculos +
fontes .br) mais rapido do que a capacidade de rodar tudo de uma vez sem
bloqueio. Este script deixa coletar so o veiculo que voce precisa agora,
usando a MESMA logica (scan_target) do build_dataset.py - entao o
resultado e identico ao que sairia de um run completo, so que incremental.

Idempotente: remove entradas antigas da mesma marca+modelo antes de
inserir as novas - pode rodar de novo (ex.: depois que o DDG
desbloquear, pra pegar as fontes .br que faltaram) sem duplicar nada.

Uso:
    python collect_vehicle.py "Chevrolet" "Onix"
    python collect_vehicle.py "Volkswagen" "T-Cross"
    python collect_vehicle.py "GM" "Chevrolet Equinox EV" --query "Chevrolet Equinox EV"

Se o DuckDuckGo estiver em CAPTCHA no momento, as fontes .br que dependem
dele (iCarros, Webmotors, Quatro Rodas, UOL Carros, Autoesporte) vem
vazias - isso aparece no output linha por linha (nao falha silenciosamente),
entao da pra saber exatamente o que faltou coletar.
"""
from __future__ import annotations

import argparse
import json
import random
import uuid
from datetime import datetime, timedelta, timezone

from build_dataset import scan_target, FRONTEND_DATA_DIR

RNG = random.Random()


def attach_discovery_metadata(rows: list[dict]) -> list[dict]:
    now = datetime.now(timezone.utc)
    out = []
    for row in rows:
        days_ago = RNG.randint(0, 90)
        discovered_at = (now - timedelta(days=days_ago)).date().isoformat()
        out.append(
            {
                "id": uuid.uuid4().hex[:10],
                "target": row["target"],
                "model": row["model"],
                "source": row["source"],
                "source_url": row["source_url"],
                "category": row["category"],
                "field": row["field"],
                "value": row["value"],
                "discovered_at": discovered_at,
            }
        )
    return out


def merge_into_frontend(brand: str, model: str, rows: list[dict], spec_row: dict) -> int:
    discoveries_path = FRONTEND_DATA_DIR / "osintDiscoveries.json"
    specs_path = FRONTEND_DATA_DIR / "osintVehicleSpecs.json"

    discoveries = json.loads(discoveries_path.read_text(encoding="utf-8"))
    specs = json.loads(specs_path.read_text(encoding="utf-8"))

    discoveries = [d for d in discoveries if not (d["target"] == brand and d["model"] == model)]
    discoveries.extend(attach_discovery_metadata(rows))

    specs = [s for s in specs if not (s["target"] == brand and s["model"] == model)]
    specs.append(spec_row)

    discoveries_path.write_text(json.dumps(discoveries, ensure_ascii=False, indent=2), encoding="utf-8")
    specs_path.write_text(json.dumps(specs, ensure_ascii=False, indent=2), encoding="utf-8")

    return len(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description="Coleta 1 veiculo e faz merge no dataset do frontend (Radar/Grid)")
    parser.add_argument("brand", help="Marca, igual aparece no CATALOG (ex.: Volkswagen)")
    parser.add_argument("model", help="Modelo, igual aparece no CATALOG (ex.: T-Cross)")
    parser.add_argument("--query", default=None, help="Query de busca alternativa, se marca+modelo nao bater bem (equivale ao search_query do CATALOG)")
    args = parser.parse_args()

    result = scan_target(args.brand, args.model, args.query)
    n = merge_into_frontend(args.brand, args.model, result["rows"], result["spec_row"])

    missing_sources = [
        name for name, val in [
            ("Wikipedia", result["spec_row"]["wikipedia_url"]),
            ("EV Database", result["spec_row"]["evdatabase_url"]),
        ]
        if not val
    ]
    print(f"\n[*] Merge ok: {n} descobertas para {args.brand} {args.model}")
    if missing_sources:
        print(f"[!] Sem dados de: {', '.join(missing_sources)} (normal p/ EV Database em carro a combustao)")


if __name__ == "__main__":
    main()
