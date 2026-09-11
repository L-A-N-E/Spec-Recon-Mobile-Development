"""
fipe_prices.py
================

Estima o preço médio de mercado (Tabela FIPE) de um modelo, pra cruzar
com unidades vendidas (`sales_radar.py`) e calcular "faturamento
estimado" por marca em `build_sales.py`.

IMPORTANTE - o que a Tabela FIPE realmente é: valor de referência de
mercado pra veículo USADO (o que bancos/seguradoras usam pra financiamento
e sinistro), não o preço de tabela (MSRP) do fabricante pra carro 0km.
Pra aproximar "quanto a montadora faturou vendendo X unidades este ano"
usamos o preço da versão/ano-modelo mais RECENTE de cada modelo (o mais
perto que dá de "carro novo" nesse universo de dados) - ainda assim é
uma ESTIMATIVA, não o faturamento contábil real (que envolve desconto,
imposto, mix de opcionais etc. que a FIPE não capta). Isso é comunicado
explicitamente no `meta` do JSON exportado por build_sales.py.

Fonte: parallelum.com.br/fipe - espelho público e gratuito da Tabela
FIPE oficial (mesmo dado usado por bancos/seguradoras/outras APIs pagas).

PoC: mesmas ressalvas dos outros scripts do pipeline (sem rate limiting
sofisticado, tratamento de erro minimo).
"""
from __future__ import annotations

import re
import statistics
import time
from datetime import datetime

import requests

BASE_URL = "https://parallelum.com.br/fipe/api/v1/carros"
REQUEST_TIMEOUT = 15
HEADERS = {
    "User-Agent": (
        "SpecReconSalesPoC/0.1 (uso educacional/teste; "
        "contato: haubrichtnicolas@gmail.com)"
    )
}

# nome da marca na FIPE as vezes difere do que usamos no resto do app
# (ver sales_radar.py / build_dataset.py) - mapeado manualmente onde bate
# diferente.
_BRAND_ALIASES = {
    "chevrolet": "GM - Chevrolet",
    "volkswagen": "VW - VolksWagen",
}

_brands_cache: list[dict] | None = None
_models_cache: dict[str, list[dict]] = {}


def _get(url: str):
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException:
        return None


def _brands() -> list[dict]:
    global _brands_cache
    if _brands_cache is None:
        _brands_cache = _get(f"{BASE_URL}/marcas") or []
    return _brands_cache


def find_brand_code(brand: str) -> str | None:
    target = _BRAND_ALIASES.get(brand.strip().lower(), brand.strip()).lower()
    for b in _brands():
        if b["nome"].strip().lower() == target:
            return b["codigo"]
    for b in _brands():
        if target in b["nome"].strip().lower():
            return b["codigo"]
    return None


def _models_for_brand(brand_code: str) -> list[dict]:
    if brand_code not in _models_cache:
        data = _get(f"{BASE_URL}/marcas/{brand_code}/modelos")
        _models_cache[brand_code] = (data or {}).get("modelos", [])
    return _models_cache[brand_code]


def _parse_brl(value: str) -> float | None:
    m = re.search(r"([\d.]+),(\d{2})", value or "")
    if not m:
        return None
    integer_part = m.group(1).replace(".", "")
    return float(f"{integer_part}.{m.group(2)}")


def estimate_model_price(
    brand: str,
    model: str,
    max_trims_tried: int = 12,
    min_quotes: int = 3,
) -> dict | None:
    """Acha o preço médio (mediana) de um modelo hoje, sem precisar
    checar as dezenas de versões historicas que a FIPE lista pra
    qualquer modelo de vida longa (ex.: Fiat Strada tem 66 trims
    cadastrados, voltando a 2001).

    Estrategia: filtra os modelos da marca cujo nome contem o modelo
    buscado, ordena por `codigo` DESCENDENTE (heuristica: codigos mais
    altos tendem a ser trims cadastrados mais recentemente na FIPE -
    validado manualmente: pro Fiat Strada, os codigos mais altos batem
    exatamente com os trims atuais conhecidos - Endurance/Freedom/
    Volcano/Ranch/Ultra - meses ates de qualquer trim antigo aparecer),
    e para assim que juntar `min_quotes` cotacoes cujo ano-modelo mais
    recente disponivel seja do ano atual ou do anterior (ainda "vendido
    como novo" hoje, nao so um usado antigo que ainda tem preco na
    tabela). Preco final = mediana das cotacoes achadas (mais robusto a
    1 trim topo-de-linha puxando a media pra cima do que a media pura)."""
    brand_code = find_brand_code(brand)
    if not brand_code:
        return None

    model_norm = re.sub(r"[^a-z0-9]", "", model.lower())
    if not model_norm:
        return None

    candidates = [
        m for m in _models_for_brand(brand_code)
        if model_norm in re.sub(r"[^a-z0-9]", "", m["nome"].lower())
    ]
    candidates.sort(key=lambda m: -m["codigo"])

    current_year = datetime.now().year
    quotes: list[float] = []

    for trim in candidates[:max_trims_tried]:
        anos = _get(f"{BASE_URL}/marcas/{brand_code}/modelos/{trim['codigo']}/anos")
        if not anos:
            continue

        latest = anos[0]  # a API ja devolve do ano mais recente pro mais antigo
        year_match = re.match(r"(\d{4})", latest["codigo"])
        if not year_match or int(year_match.group(1)) < current_year - 1:
            continue  # trim descontinuado ha mais de 1 ano - nao representa preco "atual"

        price_data = _get(f"{BASE_URL}/marcas/{brand_code}/modelos/{trim['codigo']}/anos/{latest['codigo']}")
        valor = _parse_brl((price_data or {}).get("Valor", ""))
        if valor:
            quotes.append(valor)

        if len(quotes) >= min_quotes:
            break

    if not quotes:
        return None

    return {"price_avg": round(statistics.median(quotes), 2), "n_quotes": len(quotes)}


if __name__ == "__main__":
    import sys

    brand = sys.argv[1] if len(sys.argv) > 1 else "Fiat"
    model = sys.argv[2] if len(sys.argv) > 2 else "Strada"
    t0 = time.time()
    result = estimate_model_price(brand, model)
    print(f"{brand} {model}: {result} ({time.time() - t0:.1f}s)")
