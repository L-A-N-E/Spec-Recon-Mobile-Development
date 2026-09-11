"""
build_sales.py
=================

Junta o ranking de vendas do ano atual e do ano anterior (sales_radar.py,
fonte: carrolens.com.br / Fenabrave), casa os dois por veiculo e exporta
pro frontend (../src/data/salesRankings.json) com a variacao ano-a-ano
calculada, agregacao por MARCA (unidades e faturamento estimado) e um
preco medio estimado (fipe_prices.py) pros modelos mais vendidos.

Tambem marca `tracked_in_osint: true` para os veiculos que ja estao no
CATALOG do build_dataset.py (osint-radar) - o Dashboard usa isso pra
destacar "esse concorrente ja tem ficha tecnica coletada no Radar".

Faturamento e SEMPRE uma ESTIMATIVA (preco medio da Tabela FIPE x
unidades vendidas - ver aviso detalhado em fipe_prices.py sobre a
diferenca entre isso e faturamento contabil real). So calculamos pra um
top N de modelos mais vendidos (PRICE_TOP_N) porque cada lookup de preco
faz varias chamadas de API - cobrir o catalogo inteiro (~100 modelos,
muitos de cauda longa com poucas unidades) custaria muito tempo pra
pouco ganho de precisao no agregado por marca.

Rodar manualmente quando quiser atualizar (`python build_sales.py`).
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from sales_radar import fetch_yearly_ranking
from build_dataset import CATALOG
from fipe_prices import estimate_model_price

FRONTEND_DATA_DIR = Path(__file__).parent.parent / "src" / "data"

PRICE_TOP_N = 40  # quantos modelos (por rank do ano atual) recebem lookup de preco FIPE

_MONTH_NAMES_PT = [
    "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]


def _current_year_period_label(year: int) -> str:
    """O ranking do ano corrente no carrolens.com.br e acumulado ATE O
    MES MAIS RECENTE FECHADO, nao o ano inteiro (obvio pro ano em curso,
    mas importante deixar explicito no dado - senao "unidades no ano
    atual" parece comparavel a "unidades no ano anterior" quando na
    verdade um e parcial e o outro e o total do ano). Aproximacao: mes
    atual - 1 (nao valida se aquele mes especifico esta mesmo publicado -
    e so um rotulo pro usuario, nao afeta a coleta em si)."""
    now = datetime.now()
    last_month = now.month - 1 if now.month > 1 else 12
    return f"Jan–{_MONTH_NAMES_PT[last_month]}/{year} (parcial, acumulado)"


def _full_year_period_label(year: int) -> str:
    return f"Jan–Dez/{year} (ano completo)"


def _norm(text: str) -> str:
    return text.strip().lower()


def _tracked_keys() -> set[tuple[str, str]]:
    return {(_norm(c["brand"]), _norm(c["model"])) for c in CATALOG}


def build_sales_rankings() -> list[dict]:
    current_year = datetime.now().year
    previous_year = current_year - 1

    print(f"[*] Coletando ranking {current_year}...")
    current = fetch_yearly_ranking(current_year)
    print(f"    -> {len(current)} veiculos")

    print(f"[*] Coletando ranking {previous_year}...")
    previous = fetch_yearly_ranking(previous_year)
    print(f"    -> {len(previous)} veiculos")

    by_slug_current = {r["slug"]: r for r in current}
    by_slug_previous = {r["slug"]: r for r in previous}

    tracked = _tracked_keys()
    all_slugs = set(by_slug_current) | set(by_slug_previous)

    merged: list[dict] = []
    for slug in all_slugs:
        cur = by_slug_current.get(slug)
        prev = by_slug_previous.get(slug)
        base = cur or prev

        units_current = cur["units"] if cur else None
        units_previous = prev["units"] if prev else None

        delta_units = None
        delta_pct = None
        if units_current is not None and units_previous is not None and units_previous > 0:
            delta_units = units_current - units_previous
            delta_pct = round((delta_units / units_previous) * 100, 1)

        merged.append(
            {
                "brand": base["brand"],
                "model": base["model"],
                "raw_name": base["raw_name"],
                "slug": slug,
                "source_url": base["source_url"],
                "rank_current": cur["rank"] if cur else None,
                "units_current": units_current,
                "year_current": current_year,
                "rank_previous": prev["rank"] if prev else None,
                "units_previous": units_previous,
                "year_previous": previous_year,
                "delta_units": delta_units,
                "delta_pct": delta_pct,
                "tracked_in_osint": (_norm(base["brand"]), _norm(base["model"])) in tracked,
            }
        )

    # ordena por posicao no ranking do ano atual (quem nao tem rank atual
    # - so aparecia no ano anterior - vai pro fim, ordenado pelo rank antigo)
    merged.sort(key=lambda r: (r["rank_current"] is None, r["rank_current"] or 0, r["rank_previous"] or 0))
    return merged


def attach_price_estimates(rankings: list[dict], top_n: int = PRICE_TOP_N) -> None:
    """Preenche price_avg_estimate/revenue_*_estimate IN PLACE pros top_n
    veiculos (por rank do ano atual). Os demais ficam com esses campos
    None - `coverage` no meta do output deixa claro quantos foram
    cobertos, pra nao passar a impressao de que e o dataset inteiro."""
    targets = [r for r in rankings if r["rank_current"] is not None][:top_n]

    for i, r in enumerate(targets, 1):
        print(f"  [{i}/{len(targets)}] preço FIPE: {r['brand']} {r['model']}...")
        price = estimate_model_price(r["brand"], r["model"])

        r["price_avg_estimate"] = price["price_avg"] if price else None
        r["revenue_current_estimate"] = (
            round(price["price_avg"] * r["units_current"], 2)
            if price and r["units_current"] is not None
            else None
        )
        r["revenue_previous_estimate"] = (
            round(price["price_avg"] * r["units_previous"], 2)
            if price and r["units_previous"] is not None
            else None
        )

    for r in rankings:
        r.setdefault("price_avg_estimate", None)
        r.setdefault("revenue_current_estimate", None)
        r.setdefault("revenue_previous_estimate", None)


def build_brand_aggregates(rankings: list[dict]) -> list[dict]:
    """Agrega os itens (por modelo) em totais por MARCA: unidades nos 2
    anos, variacao %, e faturamento estimado (soma so dos modelos que
    tem price_avg_estimate - ve-se em `models_with_price` quantos
    contribuiram, pra deixar claro que faturamento de marca com poucos
    modelos cobertos e menos confiavel)."""
    by_brand: dict[str, dict] = {}

    for r in rankings:
        b = by_brand.setdefault(
            r["brand"],
            {
                "brand": r["brand"],
                "units_current": 0,
                "units_previous": 0,
                "revenue_current_estimate": 0.0,
                "revenue_previous_estimate": 0.0,
                "n_models": 0,
                "n_models_tracked_in_osint": 0,
                "n_models_with_price": 0,
            },
        )
        b["n_models"] += 1
        if r["tracked_in_osint"]:
            b["n_models_tracked_in_osint"] += 1
        if r["units_current"] is not None:
            b["units_current"] += r["units_current"]
        if r["units_previous"] is not None:
            b["units_previous"] += r["units_previous"]
        if r.get("revenue_current_estimate") is not None:
            b["revenue_current_estimate"] += r["revenue_current_estimate"]
            b["n_models_with_price"] += 1
        if r.get("revenue_previous_estimate") is not None:
            b["revenue_previous_estimate"] += r["revenue_previous_estimate"]

    brands = list(by_brand.values())
    for b in brands:
        b["revenue_current_estimate"] = round(b["revenue_current_estimate"], 2) or None
        b["revenue_previous_estimate"] = round(b["revenue_previous_estimate"], 2) or None
        if b["units_previous"] > 0:
            b["delta_units"] = b["units_current"] - b["units_previous"]
            b["delta_pct"] = round((b["delta_units"] / b["units_previous"]) * 100, 1)
        else:
            b["delta_units"] = None
            b["delta_pct"] = None

    brands.sort(key=lambda b: -b["units_current"])
    return brands


def main() -> None:
    current_year = datetime.now().year
    previous_year = current_year - 1

    rankings = build_sales_rankings()

    print(f"\n[*] Estimando preço FIPE pros top {PRICE_TOP_N} modelos (faturamento estimado)...")
    attach_price_estimates(rankings)
    priced_count = sum(1 for r in rankings if r["price_avg_estimate"] is not None)

    brands = build_brand_aggregates(rankings)

    output = {
        "meta": {
            "year_current": current_year,
            "year_previous": previous_year,
            "period_current": _current_year_period_label(current_year),
            "period_previous": _full_year_period_label(previous_year),
            "source": "Fenabrave (via carrolens.com.br)",
            "source_url": "https://carrolens.com.br/rankings/" + str(current_year),
            "generated_at": datetime.now().isoformat(),
            "note": (
                "units_current e acumulado PARCIAL do ano em curso (ate o ultimo "
                "mes fechado); units_previous e o ano anterior INTEIRO. delta_pct "
                "compara periodos de tamanho diferente - use como direcao/ritmo, "
                "nao como taxa de crescimento anual precisa."
            ),
            "revenue_note": (
                "Faturamento e ESTIMADO: preço médio (mediana) da Tabela FIPE das "
                "versões mais recentes de cada modelo x unidades vendidas. FIPE é "
                "valor de referência de mercado, não o preço de tabela do "
                "fabricante nem o faturamento contábil real (que envolve desconto, "
                "imposto e mix de opcionais). Só calculado pros "
                f"{PRICE_TOP_N} modelos mais vendidos do ano atual "
                f"({priced_count} obtiveram cotação) - marcas com muitos modelos de "
                "cauda longa têm faturamento subestimado."
            ),
            "revenue_price_source": "Tabela FIPE (via parallelum.com.br/fipe)",
            "price_coverage_top_n": PRICE_TOP_N,
            "price_coverage_count": priced_count,
        },
        "items": rankings,
        "brands": brands,
    }

    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_path = FRONTEND_DATA_DIR / "salesRankings.json"
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n[*] {len(rankings)} veiculos, {len(brands)} marcas -> {out_path}")

    both_years = [r for r in rankings if r["delta_pct"] is not None]
    print(f"[*] {len(both_years)} veiculos com dado nos 2 anos (dá pra calcular variação)")
    print(f"[*] {priced_count}/{len(rankings)} veiculos com preço FIPE estimado")


if __name__ == "__main__":
    main()
