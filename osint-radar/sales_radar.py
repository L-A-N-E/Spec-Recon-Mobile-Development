"""
sales_radar.py
================

Coleta ranking de vendas/emplacamentos de veiculos no Brasil, fonte:
carrolens.com.br (que republica e credita os numeros a Fenabrave -
Federacao Nacional da Distribuicao de Veiculos Automotores, a entidade
oficial do setor no Brasil).

Por que carrolens.com.br e nao fenabrave.org.br direto: o portal oficial
(fenabrave.org.br/portalv2/Conteudo/emplacamentos e
relatorios/rel_MaisVendidos.asp) nao devolve uma tabela em HTML estatico
facil de raspar (relatorio montado dinamicamente). O carrolens.com.br
republica os MESMOS numeros (credito a Fenabrave visivel na propria
pagina) em `/rankings/<ano>?page=<N>` - tabela HTML simples, paginada,
sem JS rendering e sem precisar de busca (DuckDuckGo) pra localizar a
pagina, o que evita o bloqueio de CAPTCHA que afeta as fontes .br do
osint_radar.py.

PoC: mesmas ressalvas do osint_radar.py (sem checagem de robots.txt, sem
rate limiting sofisticado, tratamento de erro minimo, nao usar em
producao como esta).
"""
from __future__ import annotations

import re
import time

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) SpecReconSalesPoC/0.1 (uso educacional/teste; "
        "contato: haubrichtnicolas@gmail.com)"
    )
}
REQUEST_TIMEOUT = 15
BASE_URL = "https://carrolens.com.br"

# marcas cujo texto na coluna "Veiculo" vem como "SIGLA - Nome Completo"
# (ex.: "VW - VolksWagen Polo", "GM - Chevrolet Tracker") - depois do split
# em " - ", ainda precisa normalizar a grafia pra bater com o resto do app
# (CATALOG do build_dataset.py usa "Volkswagen"/"Chevrolet", nao
# "VolksWagen"/"GM").
_BRAND_CANONICAL = {
    "volkswagen": "Volkswagen",
    "chevrolet": "Chevrolet",
    "fiat": "Fiat",
    "hyundai": "Hyundai",
    "toyota": "Toyota",
    "honda": "Honda",
    "jeep": "Jeep",
    "renault": "Renault",
    "nissan": "Nissan",
    "citroen": "Citroën",
    "citroën": "Citroën",
    "peugeot": "Peugeot",
    "ford": "Ford",
    "byd": "BYD",
    "gwm": "GWM",
    "caoa chery": "Chery",
    "chery": "Chery",
}


def fetch_html(url: str, retries: int = 1) -> str | None:
    for attempt in range(retries + 1):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            return resp.text
        except requests.RequestException as exc:
            if attempt < retries:
                time.sleep(2)
                continue
            print(f"  [!] falha ao buscar {url}: {exc}")
            return None


def split_brand_model(raw_name: str) -> tuple[str, str]:
    """'Fiat Strada' -> ('Fiat', 'Strada'); 'VW - VolksWagen Polo' ->
    ('Volkswagen', 'Polo'); 'GWM Haval H6' -> ('GWM', 'Haval H6')."""
    name = raw_name.strip()
    if " - " in name:
        name = name.split(" - ", 1)[1].strip()

    parts = name.split(" ", 1)
    brand_raw = parts[0]
    model = parts[1].strip() if len(parts) > 1 else ""

    brand = _BRAND_CANONICAL.get(brand_raw.strip().lower(), brand_raw)
    return brand, model


def _parse_ranking_page(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    rows = []
    for tr in soup.select("table tbody tr"):
        rank_span = tr.select_one("td span")
        link = tr.select_one('a[href^="/veiculos/"]')
        cells = tr.find_all("td")
        if not rank_span or not link or len(cells) < 3:
            continue

        rank_text = rank_span.get_text(strip=True)
        if not rank_text.isdigit():
            continue

        raw_name = link.get_text(" ", strip=True)
        slug = link["href"].strip("/").split("/")[-1]

        units_text = cells[2].get_text(strip=True)
        units_match = re.search(r"[\d.,]+", units_text)
        if not units_match:
            continue
        units = int(units_match.group(0).replace(".", "").replace(",", ""))

        brand, model = split_brand_model(raw_name)

        rows.append(
            {
                "rank": int(rank_text),
                "raw_name": raw_name,
                "brand": brand,
                "model": model,
                "slug": slug,
                "units": units,
                "source_url": f"{BASE_URL}/veiculos/{slug}",
            }
        )
    return rows


def fetch_yearly_ranking(year: int, max_pages: int = 10) -> list[dict]:
    """Percorre a paginacao de /rankings/<year>?page=N ate uma pagina nao
    trazer nenhuma linha nova (fim do ranking) ou bater o limite de
    seguranca max_pages (evita loop infinito se o site mudar de layout)."""
    all_rows: list[dict] = []
    seen_slugs: set[str] = set()

    for page in range(1, max_pages + 1):
        url = f"{BASE_URL}/rankings/{year}" if page == 1 else f"{BASE_URL}/rankings/{year}?page={page}"
        html = fetch_html(url)
        if not html:
            break

        rows = _parse_ranking_page(html)
        new_rows = [r for r in rows if r["slug"] not in seen_slugs]
        if not new_rows:
            break

        for r in new_rows:
            r["year"] = year
            seen_slugs.add(r["slug"])
        all_rows.extend(new_rows)

        if page > 1:
            time.sleep(1)  # politeness delay entre paginas

    return all_rows


if __name__ == "__main__":
    import sys

    year = int(sys.argv[1]) if len(sys.argv) > 1 else 2026
    ranking = fetch_yearly_ranking(year)
    print(f"[*] {len(ranking)} veiculos no ranking {year}")
    for r in ranking[:10]:
        print(f"  {r['rank']:>3}. {r['brand']:<12} {r['model']:<20} {r['units']:>8,} un.")
