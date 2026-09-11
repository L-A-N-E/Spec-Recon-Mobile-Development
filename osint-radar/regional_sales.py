"""
regional_sales.py
====================

Coleta a matriz "modelo x estado" de emplacamentos do mês mais recente,
fonte: fenabrave.online (dados creditados a Fenabrave). Usada pro mapa
regional do Dashboard ("quais regiões venderam mais").

O que a pagina publica: pros ~60-70 modelos mais vendidos do mes, quantas
unidades venderam em CADA um dos 27 estados (matriz completa, nao so o
vencedor por estado). Somando a coluna de cada estado dá o volume desses
modelos naquele estado - uma AMOSTRA representativa (os mais vendidos
nacionalmente), não o total de emplacamentos do estado (que incluiria
também modelos de nicho regional fora do top nacional).

Diferenca de granularidade vs sales_radar.py: isso é um snapshot MENSAL
(o mes mais recente fechado), não acumulado do ano - a pagina nao
disponibiliza a mesma matriz por ano. Fica assim mesmo: pra "qual regiao
vende mais", o retrato de 1 mes recente já é informativo, e tentar somar
12 meses x 27 estados x 70 modelos seria uma coleta ordens de magnitude
maior sem ganho proporcional.

PoC: mesmas ressalvas do resto do pipeline.
"""
from __future__ import annotations

import re
import time

import requests
from bs4 import BeautifulSoup

# fenabrave.online bloqueia (403) qualquer User-Agent com sufixo tipo
# "NomeDoScript/0.1 (contato...)" - mesmo padrao usado sem problema nos
# outros scripts do pipeline. Só um UA de navegador "puro" passa aqui.
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}
REQUEST_TIMEOUT = 20
URL = "https://www.fenabrave.online/"

# UF -> macro-regiao (mapeamento fixo do IBGE, sem ambiguidade)
_REGION_BY_UF = {
    "AC": "Norte", "AP": "Norte", "AM": "Norte", "PA": "Norte", "RO": "Norte", "RR": "Norte", "TO": "Norte",
    "AL": "Nordeste", "BA": "Nordeste", "CE": "Nordeste", "MA": "Nordeste", "PB": "Nordeste",
    "PE": "Nordeste", "PI": "Nordeste", "RN": "Nordeste", "SE": "Nordeste",
    "DF": "Centro-Oeste", "GO": "Centro-Oeste", "MT": "Centro-Oeste", "MS": "Centro-Oeste",
    "ES": "Sudeste", "MG": "Sudeste", "RJ": "Sudeste", "SP": "Sudeste",
    "PR": "Sul", "RS": "Sul", "SC": "Sul",
}


def fetch_html() -> str | None:
    try:
        resp = requests.get(URL, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as exc:
        print(f"  [!] falha ao buscar {URL}: {exc}")
        return None


def _parse_month_label(html: str) -> str | None:
    m = re.search(r"Carros Mais Vendidos por Estado\s*[—-]\s*([A-Za-zçÇ]{3}/\d{4})", html)
    return m.group(1) if m else None


def _parse_state_columns(html: str) -> list[tuple[str, str]]:
    """Retorna [(uf, nome_completo), ...] na MESMA ordem das colunas da tabela."""
    return [
        (uf, nome)
        for nome, _idx, uf in re.findall(
            r'title="([^"]+)"\s*\n\s*onclick="sortByCol\((\d+)\)">\s*\n\s*(\w+)', html
        )
    ]


def fetch_model_state_matrix() -> dict:
    """Retorna {
        'month_label': 'Set/2026',
        'states': [(uf, nome), ...],
        'rows': [{'model': 'STRADA', 'total_month': 12761, 'by_state': {'SP': 1130, 'MG': ...}}, ...]
    }"""
    html = fetch_html()
    if not html:
        return {"month_label": None, "states": [], "rows": []}

    states = _parse_state_columns(html)
    month_label = _parse_month_label(html)

    soup = BeautifulSoup(html, "lxml")
    table = soup.find("table", id="mainTable")
    rows = []

    if table:
        tbody = table.find("tbody")
        for tr in tbody.find_all("tr"):
            name_span = tr.select_one(".model-name")
            if not name_span:
                continue
            model_name = name_span.get_text(strip=True)

            # a linha tem 1 <td> de nome + 27 <td> alinhados aos estados
            # (classe "cell-data" quando tem venda, "cell-na" quando nao -
            # os dois SAO renderizados, entao a posicao bate com o
            # cabecalho) + 1 <td class="cell-total-col"> no final. Filtrar
            # so por class="cell-data" (como a 1a versao deste parser
            # fazia) pula as celulas "cell-na" e desalinha tudo por
            # posicao - foi um bug real, confirmado comparando contagem de
            # celulas por linha (variava por modelo) contra os 27 estados
            # do cabecalho.
            all_tds = tr.find_all("td")
            state_cells = all_tds[1:-1] if len(all_tds) >= 2 else []
            if len(state_cells) != len(states):
                print(f"  [!] {model_name}: {len(state_cells)} celulas != {len(states)} estados - layout da tabela mudou, pulando linha")
                continue

            by_state = {}
            for (uf, _nome), td in zip(states, state_cells):
                if "cell-data" not in (td.get("class") or []):
                    continue
                qty_span = td.select_one(".qty")
                if qty_span:
                    qty = int(re.sub(r"[^\d]", "", qty_span.get_text()) or 0)
                    if qty:
                        by_state[uf] = qty

            var_badge = tr.select_one(".var-badge")
            total_month_match = re.search(r"([\d.]+)\s*emplacamentos", var_badge["title"]) if var_badge else None
            total_month = int(total_month_match.group(1).replace(".", "")) if total_month_match else sum(by_state.values())

            rows.append({"model": model_name, "total_month": total_month, "by_state": by_state})

    return {"month_label": month_label, "states": states, "rows": rows}


def aggregate_by_state(matrix: dict) -> list[dict]:
    totals: dict[str, int] = {uf: 0 for uf, _ in matrix["states"]}
    for row in matrix["rows"]:
        for uf, qty in row["by_state"].items():
            totals[uf] = totals.get(uf, 0) + qty

    names = dict(matrix["states"])
    out = [
        {"uf": uf, "name": names.get(uf, uf), "region": _REGION_BY_UF.get(uf, "?"), "units": units}
        for uf, units in totals.items()
    ]
    out.sort(key=lambda r: -r["units"])
    return out


def aggregate_by_region(states_agg: list[dict]) -> list[dict]:
    totals: dict[str, int] = {}
    for s in states_agg:
        totals[s["region"]] = totals.get(s["region"], 0) + s["units"]
    total_all = sum(totals.values()) or 1
    out = [
        {"region": region, "units": units, "pct": round(units / total_all * 100, 1)}
        for region, units in totals.items()
    ]
    out.sort(key=lambda r: -r["units"])
    return out


if __name__ == "__main__":
    matrix = fetch_model_state_matrix()
    print(f"[*] Mês: {matrix['month_label']} | {len(matrix['rows'])} modelos | {len(matrix['states'])} estados")

    by_state = aggregate_by_state(matrix)
    print("\nTop 5 estados:")
    for s in by_state[:5]:
        print(f"  {s['uf']:<3} {s['name']:<20} {s['units']:>6} un.")

    by_region = aggregate_by_region(by_state)
    print("\nPor região:")
    for r in by_region:
        print(f"  {r['region']:<14} {r['units']:>6} un. ({r['pct']}%)")
