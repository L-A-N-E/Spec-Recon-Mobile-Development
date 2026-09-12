"""
press_sales.py
================

Coleta o ranking MENSAL de vendas (marca e modelo) publicado por grandes
portais de imprensa - trilha COMPLEMENTAR a sales_radar.py.

Por que existe, dado que sales_radar.py ja coleta vendas via
carrolens.com.br: carrolens da o ACUMULADO do ano (Jan-Ago, por ex.),
NUNCA o mes isolado. Isso significa que hoje nao da pra responder "quantos
carros a Fiat vendeu EM AGOSTO" com precisao - so "quantos venderam de
Jan a Ago". Esses portais de imprensa publicam uma materia mensal com o
ranking SO daquele mes, o que fecha essa lacuna.

Adicionado a pedido explicito do usuario (2026-09-12), que apontou 2
materias reais de agosto/2026 (guardadas em KNOWN_ARTICLES como
fallback confiavel - ver mais abaixo):
  - autoesporte.globo.com: "Veja os 50 carros mais vendidos do Brasil em
    agosto de 2026" - tabela <table class="show-table__content"> com
    ranking de MODELO (1) e de MARCA (2).
  - quatrorodas.abril.com.br: "Vendas de carros 0km crescem quase 20% em
    2026; veja os 15 carros mais vendidos em agosto" - tabela <table> com
    ranking de MARCA (1) e de MODELO (2), incluindo o detalhe "vendas
    diretas" (VD) por modelo.

NOTA sobre Quatro Rodas: uma checagem anterior (ver historico do
osint_radar.py) tinha concluido que o dominio quatrorodas.abril.com.br
"virou revista fechada" porque a HOME so mostra navegacao/assinatura
Abril Signature. Essa conclusao era baseada SO na home - materias
especificas (como a de vendas linkada acima) continuam publicas e com
tabela raspavel. Corrigido aqui: o dominio nao esta banido, so a home e'
fechada.

Os 2 portais concordam de perto no ranking de agosto/2026 (ex.: Fiat
Strada 13.794 un. no Autoesporte vs 13.796 no Quatro Rodas - a diferenca
de 2 unidades e normal, cada portal fecha os dados num horario/corte
ligeiramente diferente) - por isso coletar dos 2 da uma checagem cruzada
de confianca, em vez de confiar numa fonte unica.

PoC: mesmas ressalvas do resto do osint-radar (sem robots.txt, sem rate
limit sofisticado, tratamento de erro minimo).
"""
from __future__ import annotations

import re
import time
from datetime import datetime
from urllib.parse import quote, parse_qs, urlparse

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "SpecReconRadarPoC/0.1 (uso educacional/teste; "
        "contato: haubrichtnicolas@gmail.com)"
    )
}
REQUEST_TIMEOUT = 15

MESES_PT = {
    1: "janeiro", 2: "fevereiro", 3: "março", 4: "abril", 5: "maio", 6: "junho",
    7: "julho", 8: "agosto", 9: "setembro", 10: "outubro", 11: "novembro", 12: "dezembro",
}

# Materias que o usuario ja apontou manualmente - usadas como fallback
# ANTES de tentar localizar via busca (DuckDuckGo bloqueia com frequencia
# nesta rede - ver aviso grande em osint_radar.py). Cada entrada aqui
# GARANTE que aquele mes especifico colete certo mesmo com o DDG fora do
# ar. Pra atualizar um mes novo: rode este script (tenta localizar via
# busca primeiro); se o DDG estiver bloqueado, ache a materia do mes na
# mao e adicione uma entrada aqui.
KNOWN_ARTICLES: dict[tuple[str, str, int], str] = {
    ("autoesporte", "agosto", 2026):
        "https://autoesporte.globo.com/setor-automotivo/mercado-automotivo/noticia/2026/09/50-carros-mais-vendidos-brasil-agosto-2026.ghtml",
    ("quatrorodas", "agosto", 2026):
        "https://quatrorodas.abril.com.br/noticias/vendas-de-carros-0km-crescem-quase-20-em-2026-veja-os-15-carros-mais-vendidos-em-agosto/",
}

# Mesmo canonicalizador de marca usado em sales_radar.py (mantido
# separado, nao importado de la, pra este arquivo continuar funcionando
# sozinho se sales_radar.py mudar) - trata tanto sigla ("VW", "GM") quanto
# prefixo de 2 palavras ("Caoa Chery").
_MULTI_WORD_BRAND_PREFIXES = {
    "caoa chery": "Chery",
    "land rover": "Land Rover",
    "great wall": "GWM",
}

_BRAND_CANONICAL = {
    "vw": "Volkswagen",
    "volkswagen": "Volkswagen",
    "gm": "Chevrolet",
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
    "geely": "Geely",
    "chery": "Chery",
    "omoda": "Omoda",
    "jaecoo": "Jaecoo",
    "ram": "RAM",
    "kia": "Kia",
    "mitsubishi": "Mitsubishi",
    "mazda": "Mazda",
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


def duckduckgo_first_result(query: str, site: str) -> str | None:
    """Versao minima (sem circuit-breaker global) do mesmo mecanismo de
    osint_radar.py - este arquivo roda como script curto e isolado, entao
    nao vale a pena importar o modulo inteiro so por essa funcao. Se o DDG
    bloquear, cai pro fallback de KNOWN_ARTICLES no chamador."""
    url = f"https://html.duckduckgo.com/html/?q={quote(f'site:{site} {query}')}"
    html = fetch_html(url)
    if not html:
        return None

    soup = BeautifulSoup(html, "lxml")
    for link in soup.select("a.result__a"):
        href = link.get("href", "")
        qs = parse_qs(urlparse(href).query)
        target = qs.get("uddg", [None])[0]
        if target and site in target:
            return target
    return None


def _clean_int(text: str) -> int | None:
    """'13.794' -> 13794; '1,414' -> 1414 (o Autoesporte usa virgula por
    engano na ultima linha da tabela de agosto/2026 - tratado igual a
    ponto, ambos so separador de milhar aqui, nunca decimal)."""
    m = re.search(r"[\d.,]+", text)
    if not m:
        return None
    raw = m.group(0).replace(".", "").replace(",", "")
    return int(raw) if raw.isdigit() else None


def split_brand_model(raw_name: str) -> tuple[str, str]:
    """'Fiat Strada' -> ('Fiat', 'Strada'); 'Caoa Chery Tiggo 5X' ->
    ('Chery', 'Tiggo 5X'); 'VW' (sigla, tabela de marca) -> ('Volkswagen', '')."""
    name = re.sub(r"^\d+°?\)\s*", "", raw_name.strip())  # tira o "12°) " na frente

    lower = name.lower()
    for prefix, canonical in _MULTI_WORD_BRAND_PREFIXES.items():
        if lower.startswith(prefix + " ") or lower == prefix:
            model = name[len(prefix):].strip()
            return canonical, model

    parts = name.split(" ", 1)
    brand_raw = parts[0]
    model = parts[1].strip() if len(parts) > 1 else ""
    brand = _BRAND_CANONICAL.get(brand_raw.strip().lower(), brand_raw)
    return brand, model


# --------------------------------------------------------------------------
# Autoesporte (Globo)
# --------------------------------------------------------------------------

def locate_autoesporte_monthly(month_pt: str, year: int) -> str | None:
    known = KNOWN_ARTICLES.get(("autoesporte", month_pt, year))
    if known:
        return known
    return duckduckgo_first_result(f"carros mais vendidos brasil {month_pt} {year}", site="autoesporte.globo.com")


def parse_autoesporte_monthly(html: str) -> dict:
    """2 tabelas <table class="show-table__content ..."> - a 1a com linhas
    'N°) Marca Modelo' + unidades (ranking de MODELO), a 2a com 'N°) Marca'
    + unidades + participacao % (ranking de MARCA)."""
    soup = BeautifulSoup(html, "lxml")
    tables = soup.select("table.show-table__content")

    models: list[dict] = []
    brands: list[dict] = []

    if len(tables) >= 1:
        for i, tr in enumerate(tables[0].select("tr")[1:], start=1):  # pula cabecalho
            cells = tr.find_all("td")
            if len(cells) < 2:
                continue
            brand, model = split_brand_model(cells[0].get_text(" ", strip=True))
            units = _clean_int(cells[1].get_text(strip=True))
            if units is None:
                continue
            models.append({"rank": i, "brand": brand, "model": model, "units": units})

    if len(tables) >= 2:
        for i, tr in enumerate(tables[1].select("tr")[1:], start=1):
            cells = tr.find_all("td")
            if len(cells) < 2:
                continue
            brand, _ = split_brand_model(cells[0].get_text(" ", strip=True))
            units = _clean_int(cells[1].get_text(strip=True))
            if units is None:
                continue
            brands.append({"rank": i, "brand": brand, "units": units})

    return {"models": models, "brands": brands}


# --------------------------------------------------------------------------
# Quatro Rodas (Abril)
# --------------------------------------------------------------------------

def locate_quatrorodas_monthly(month_pt: str, year: int) -> str | None:
    known = KNOWN_ARTICLES.get(("quatrorodas", month_pt, year))
    if known:
        return known
    return duckduckgo_first_result(f"carros mais vendidos {month_pt} {year}", site="quatrorodas.abril.com.br")


def parse_quatrorodas_monthly(html: str) -> dict:
    """2 tabelas genericas <table width=...> sem classe - a 1a e' ranking
    de MARCA (Rank/Marca/Emplacamentos/Variacao), a 2a e' ranking de
    MODELO (Rank/Marca/Modelo/Emplacamentos/Emplacamentos VD/% VD)."""
    soup = BeautifulSoup(html, "lxml")
    tables = soup.find_all("table")

    brands: list[dict] = []
    models: list[dict] = []

    for table in tables:
        rows = table.select("tr")
        if not rows:
            continue
        header_cells = [c.get_text(strip=True).lower() for c in rows[0].find_all("td")]

        if header_cells[:2] == ["rank", "marca"] and "modelo" not in header_cells:
            for tr in rows[1:]:
                cells = tr.find_all("td")
                if len(cells) < 3:
                    continue
                rank = _clean_int(cells[0].get_text(strip=True))
                brand, _ = split_brand_model(cells[1].get_text(strip=True))
                units = _clean_int(cells[2].get_text(strip=True))
                if rank is None or units is None:
                    continue
                brands.append({"rank": rank, "brand": brand, "units": units})

        elif "modelo" in header_cells:
            for tr in rows[1:]:
                cells = tr.find_all("td")
                if len(cells) < 4:
                    continue
                rank = _clean_int(cells[0].get_text(strip=True))
                brand, _ = split_brand_model(cells[1].get_text(strip=True))
                model = cells[2].get_text(strip=True)
                units = _clean_int(cells[3].get_text(strip=True))
                if rank is None or units is None:
                    continue
                models.append({"rank": rank, "brand": brand, "model": model, "units": units})

    return {"models": models, "brands": brands}


# --------------------------------------------------------------------------
# Orquestracao
# --------------------------------------------------------------------------

def collect_month(month_pt: str, year: int) -> dict:
    """Coleta o mes pedido nas 2 fontes de imprensa e devolve os 2
    resultados separados (o chamador - build_monthly_sales.py - que decide
    como cruzar/exibir). Uma fonte falhando nao derruba a outra."""
    result: dict[str, dict] = {}

    ae_url = locate_autoesporte_monthly(month_pt, year)
    if ae_url:
        html = fetch_html(ae_url)
        if html:
            parsed = parse_autoesporte_monthly(html)
            parsed["source_url"] = ae_url
            result["Autoesporte"] = parsed
            print(f"    -> Autoesporte: {len(parsed['models'])} modelos, {len(parsed['brands'])} marcas ({ae_url})")
        else:
            print("    [!] Autoesporte: pagina encontrada mas falhou ao buscar")
    else:
        print("    [!] Autoesporte: materia do mes nao localizada (DDG bloqueado ou nao publicada)")

    time.sleep(1.5)

    qr_url = locate_quatrorodas_monthly(month_pt, year)
    if qr_url:
        html = fetch_html(qr_url)
        if html:
            parsed = parse_quatrorodas_monthly(html)
            parsed["source_url"] = qr_url
            result["Quatro Rodas"] = parsed
            print(f"    -> Quatro Rodas: {len(parsed['models'])} modelos, {len(parsed['brands'])} marcas ({qr_url})")
        else:
            print("    [!] Quatro Rodas: pagina encontrada mas falhou ao buscar")
    else:
        print("    [!] Quatro Rodas: materia do mes nao localizada (DDG bloqueado ou nao publicada)")

    return result


if __name__ == "__main__":
    import sys

    year = int(sys.argv[2]) if len(sys.argv) > 2 else datetime.now().year
    month_pt = sys.argv[1] if len(sys.argv) > 1 else MESES_PT[datetime.now().month - 1 or 12]

    print(f"[*] Coletando ranking de {month_pt}/{year}...")
    data = collect_month(month_pt, year)
    for source, parsed in data.items():
        print(f"\n=== {source} (top 5 modelos) ===")
        for row in parsed["models"][:5]:
            print(f"  {row['rank']:>2}. {row['brand']:<12} {row['model']:<20} {row['units']:>7,} un.")
