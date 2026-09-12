"""
build_dataset.py
=================

Roda o osint_radar para varios concorrentes de uma vez e exporta o
resultado direto para o frontend (../src/data, um nivel acima desta pasta),
em dois formatos:

  osintDiscoveries.json   -> lista "achatada" de campo/valor por fonte,
                              consumida pela pagina Radar e pelo Dashboard.
  osintVehicleSpecs.json  -> specs numericas ja normalizadas (cv, km, kg...),
                              consumida pela pagina Grid (comparacao).

PoC: mesmas ressalvas do osint_radar.py (sem robots.txt, sem retry
sofisticado, sem rate limit). Rodar manualmente quando quiser atualizar
os dados do front (`python build_dataset.py`).
"""

from __future__ import annotations

import json
import random
import re
import time
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from osint_radar import SOURCES, build_rows, categorize, keyword_match, confidence_score

FRONTEND_DATA_DIR = Path(__file__).parent.parent / "src" / "data"

# concorrentes cobertos hoje (mesma lista que aparece no dropdown do Radar)
CATALOG = [
    # ja coletados
    {"brand": "Tesla", "model": "Model 3"},
    {"brand": "BYD", "model": "Seal"},
    {"brand": "Toyota", "model": "bZ4X"},
    {"brand": "Chevrolet", "model": "Equinox EV", "search_query": "Chevrolet Equinox EV"},
    {"brand": "Rivian", "model": "R1T"},
    {"brand": "Hyundai", "model": "Ioniq 5"},
    {"brand": "Kia", "model": "EV6"},
    {"brand": "Volkswagen", "model": "ID.4"},

    # japonesas
    {"brand": "Honda", "model": "e:Ny1"},
    {"brand": "Nissan", "model": "Ariya"},
    {"brand": "Mazda", "model": "MX-30"},
    {"brand": "Subaru", "model": "Solterra"},
    {"brand": "Mitsubishi", "model": "i-MiEV"},

    # alemas / premium europeias
    {"brand": "Mercedes-Benz", "model": "EQS"},
    {"brand": "BMW", "model": "iX"},
    {"brand": "Audi", "model": "Q6 e-tron", "search_query": "Audi Q6"},
    {"brand": "Porsche", "model": "Taycan"},
    {"brand": "Mini", "model": "Cooper SE"},
    {"brand": "Volvo", "model": "EX30"},
    {"brand": "Polestar", "model": "Polestar 2", "search_query": "Polestar 2"},

    # britanicas
    {"brand": "Jaguar", "model": "I-Pace"},
    {"brand": "Land Rover", "model": "Range Rover Electric", "search_query": "Range Rover Electric"},

    # francesas / stellantis europa
    {"brand": "Peugeot", "model": "e-208"},
    {"brand": "Renault", "model": "Megane E-Tech"},
    {"brand": "Citroën", "model": "ë-C4"},
    {"brand": "Fiat", "model": "500e"},
    {"brand": "Opel", "model": "Corsa Electric"},
    {"brand": "Skoda", "model": "Enyaq"},

    # stellantis / gm eua
    {"brand": "Jeep", "model": "Avenger"},
    {"brand": "Cadillac", "model": "Lyriq"},
    {"brand": "Chevrolet", "model": "Bolt EV"},
    {"brand": "Lincoln", "model": "Star Concept"},

    # luxo asiatica + EVs puros
    {"brand": "Genesis", "model": "GV60"},
    {"brand": "Lucid", "model": "Air"},
    {"brand": "NIO", "model": "ET5"},
    {"brand": "Xpeng", "model": "P7"},
    {"brand": "MG", "model": "MG4"},
    {"brand": "Smart", "model": "#1"},

    # --- mais modelos por marca (2-3 cada) ---
    {"brand": "Tesla", "model": "Model Y"},
    {"brand": "Tesla", "model": "Model S"},
    {"brand": "Tesla", "model": "Cybertruck"},

    {"brand": "BYD", "model": "Dolphin"},
    {"brand": "BYD", "model": "Shark"},
    {"brand": "BYD", "model": "Atto 3"},

    {"brand": "Toyota", "model": "Prius"},
    {"brand": "Toyota", "model": "Mirai"},
    {"brand": "Toyota", "model": "C-HR"},

    {"brand": "Cadillac", "model": "Optiq", "search_query": "Cadillac Optiq"},
    {"brand": "Buick", "model": "Envista", "search_query": "Buick Envista"},

    {"brand": "Rivian", "model": "R1S"},
    {"brand": "Rivian", "model": "R2"},

    {"brand": "Hyundai", "model": "Kona Electric"},
    {"brand": "Hyundai", "model": "Ioniq 6"},

    {"brand": "Kia", "model": "Niro EV"},
    {"brand": "Kia", "model": "Soul EV"},

    {"brand": "Volkswagen", "model": "ID.3"},
    {"brand": "Volkswagen", "model": "ID.7"},

    {"brand": "Honda", "model": "Honda e"},
    {"brand": "Honda", "model": "CR-V e:FCEV"},
    {"brand": "Honda", "model": "City"},
    {"brand": "Honda", "model": "Civic"},
    {"brand": "Honda", "model": "HR-V"},
    {"brand": "Honda", "model": "Fit"},

    {"brand": "Nissan", "model": "Leaf"},
    {"brand": "Nissan", "model": "Townstar EV"},

    {"brand": "Mazda", "model": "CX-60"},
    {"brand": "Mazda", "model": "CX-90"},

    {"brand": "Subaru", "model": "Crosstrek"},
    {"brand": "Subaru", "model": "Outback"},

    {"brand": "Mitsubishi", "model": "Outlander PHEV"},
    {"brand": "Mitsubishi", "model": "ASX"},

    {"brand": "Mercedes-Benz", "model": "EQE"},
    {"brand": "Mercedes-Benz", "model": "EQA"},

    {"brand": "BMW", "model": "i4"},
    {"brand": "BMW", "model": "iX3"},

    {"brand": "Audi", "model": "e-tron GT"},
    {"brand": "Audi", "model": "Q4 e-tron"},

    {"brand": "Porsche", "model": "Macan"},
    {"brand": "Porsche", "model": "Panamera"},

    {"brand": "Mini", "model": "Countryman"},
    {"brand": "Mini", "model": "Aceman"},

    {"brand": "Volvo", "model": "EX90"},
    {"brand": "Volvo", "model": "XC40"},

    {"brand": "Polestar", "model": "Polestar 3", "search_query": "Polestar 3"},
    {"brand": "Polestar", "model": "Polestar 4", "search_query": "Polestar 4"},

    {"brand": "Jaguar", "model": "E-Pace"},
    {"brand": "Jaguar", "model": "F-Pace"},

    {"brand": "Land Rover", "model": "Defender"},
    {"brand": "Land Rover", "model": "Discovery"},

    {"brand": "Peugeot", "model": "e-2008"},
    {"brand": "Peugeot", "model": "e-3008"},

    {"brand": "Renault", "model": "5 E-Tech"},
    {"brand": "Renault", "model": "Scenic E-Tech"},

    {"brand": "Citroën", "model": "e-C3"},
    {"brand": "Citroën", "model": "ë-Berlingo"},

    {"brand": "Fiat", "model": "Panda"},
    {"brand": "Fiat", "model": "600e"},

    {"brand": "Opel", "model": "Astra Electric"},
    {"brand": "Opel", "model": "Mokka Electric"},

    {"brand": "Skoda", "model": "Elroq"},
    {"brand": "Skoda", "model": "Kodiaq"},

    {"brand": "Jeep", "model": "Wrangler 4xe"},
    {"brand": "Jeep", "model": "Compass"},

    {"brand": "Cadillac", "model": "Escalade IQ"},
    {"brand": "Cadillac", "model": "Vistiq"},

    {"brand": "Chevrolet", "model": "Silverado EV"},
    {"brand": "Chevrolet", "model": "Blazer EV"},

    {"brand": "Lincoln", "model": "Nautilus"},
    {"brand": "Lincoln", "model": "Aviator"},

    {"brand": "Genesis", "model": "GV70"},
    {"brand": "Genesis", "model": "Electrified G80"},

    {"brand": "Lucid", "model": "Gravity"},
    {"brand": "Lucid", "model": "Air Grand Touring"},

    {"brand": "NIO", "model": "ES6"},
    {"brand": "NIO", "model": "ET7"},

    {"brand": "Xpeng", "model": "G6"},
    {"brand": "Xpeng", "model": "G9"},

    {"brand": "MG", "model": "ZS EV"},
    {"brand": "MG", "model": "MG5"},

    {"brand": "Smart", "model": "#3", "search_query": "smart #3"},
    {"brand": "Smart", "model": "#5", "search_query": "smart #5"},

    # --- populares Brasil (combustao/hibrido) ---
    # EV Database nao cobre (e' so eletricos) e a Wikipedia em ingles
    # documenta mal ou nao documenta modelo so-Brasil - fonte principal
    # pra esses vira Wikipedia PT + os sites .br novos (iCarros, Webmotors,
    # Quatro Rodas, UOL Carros, Autoesporte).
    {"brand": "Chevrolet", "model": "Onix"},
    {"brand": "Chevrolet", "model": "Onix Plus", "search_query": "Chevrolet Onix Plus"},
    {"brand": "Chevrolet", "model": "Tracker"},
    {"brand": "Fiat", "model": "Mobi"},
    {"brand": "Fiat", "model": "Argo"},
    {"brand": "Fiat", "model": "Pulse"},
    {"brand": "Fiat", "model": "Strada"},
    {"brand": "Volkswagen", "model": "Polo"},
    {"brand": "Volkswagen", "model": "T-Cross"},
    {"brand": "Volkswagen", "model": "Nivus"},
    {"brand": "Renault", "model": "Kwid"},
    {"brand": "Renault", "model": "Duster"},
    {"brand": "Hyundai", "model": "HB20"},
    {"brand": "Hyundai", "model": "Creta"},
    {"brand": "Toyota", "model": "Corolla"},
    {"brand": "Toyota", "model": "Corolla Cross"},
    {"brand": "Toyota", "model": "Yaris"},
    {"brand": "Jeep", "model": "Renegade"},
    {"brand": "Nissan", "model": "Kicks"},
    {"brand": "Nissan", "model": "Versa"},
    {"brand": "Citroën", "model": "C3"},
    {"brand": "Peugeot", "model": "208"},

    # --- mercado brasileiro completo (fase 2 - mais marcas/modelos) ---
    # Objetivo: cobrir o grosso do que e vendido novo no Brasil hoje, nao
    # so os top-sellers ja listados acima. Mesma logica de fonte (Wikipedia
    # PT + sites .br) - EV Database ignora tudo que nao for eletrico.
    {"brand": "Chevrolet", "model": "Spin"},
    {"brand": "Chevrolet", "model": "Montana"},
    {"brand": "Chevrolet", "model": "S10"},
    {"brand": "Chevrolet", "model": "Trailblazer"},

    {"brand": "Fiat", "model": "Toro"},
    {"brand": "Fiat", "model": "Fastback"},
    {"brand": "Fiat", "model": "Cronos"},
    {"brand": "Fiat", "model": "Fiorino"},
    {"brand": "Fiat", "model": "Titano"},

    {"brand": "Volkswagen", "model": "Polo Track", "search_query": "Volkswagen Polo Track"},
    {"brand": "Volkswagen", "model": "Virtus"},
    {"brand": "Volkswagen", "model": "Taos"},
    {"brand": "Volkswagen", "model": "Tera", "search_query": "Volkswagen Tera"},
    {"brand": "Volkswagen", "model": "Saveiro"},
    {"brand": "Volkswagen", "model": "Amarok"},

    {"brand": "Hyundai", "model": "HB20S"},
    {"brand": "Hyundai", "model": "Tucson"},
    {"brand": "Hyundai", "model": "Santa Fe"},
    {"brand": "Hyundai", "model": "Kona"},

    {"brand": "Renault", "model": "Oroch"},
    {"brand": "Renault", "model": "Captur"},
    {"brand": "Renault", "model": "Kardian"},
    {"brand": "Renault", "model": "Master"},

    {"brand": "Toyota", "model": "Yaris Cross"},
    {"brand": "Toyota", "model": "Hilux"},
    {"brand": "Toyota", "model": "SW4"},
    {"brand": "Toyota", "model": "RAV4"},

    {"brand": "Honda", "model": "City Hatchback", "search_query": "Honda City Hatchback"},
    {"brand": "Honda", "model": "ZR-V"},
    {"brand": "Honda", "model": "CR-V"},

    {"brand": "Nissan", "model": "Frontier"},

    {"brand": "Jeep", "model": "Commander"},
    {"brand": "Jeep", "model": "Wrangler"},
    {"brand": "Jeep", "model": "Gladiator"},

    {"brand": "Peugeot", "model": "2008"},
    {"brand": "Peugeot", "model": "3008"},
    {"brand": "Peugeot", "model": "408"},
    {"brand": "Peugeot", "model": "Partner"},

    {"brand": "Citroën", "model": "C4 Cactus", "search_query": "Citroën C4 Cactus"},
    {"brand": "Citroën", "model": "Basalt", "search_query": "Citroën Basalt"},

    {"brand": "Mitsubishi", "model": "L200 Triton", "search_query": "Mitsubishi L200 Triton"},
    {"brand": "Mitsubishi", "model": "Pajero Sport"},
    {"brand": "Mitsubishi", "model": "Eclipse Cross"},

    {"brand": "Mazda", "model": "Mazda2", "search_query": "Mazda 2 Brasil"},
    {"brand": "Mazda", "model": "Mazda3", "search_query": "Mazda 3 Brasil"},
    {"brand": "Mazda", "model": "CX-30"},
    {"brand": "Mazda", "model": "CX-5"},

    {"brand": "Subaru", "model": "Forester"},

    # GWM (Great Wall Motors / Haval / ORA) - chegada recente ao Brasil
    {"brand": "GWM", "model": "Haval H6"},
    {"brand": "GWM", "model": "Haval H6 GT", "search_query": "GWM Haval H6 GT"},
    {"brand": "GWM", "model": "Poer"},
    {"brand": "GWM", "model": "ORA 03", "search_query": "GWM ORA 03"},
    {"brand": "GWM", "model": "Tank 300"},

    {"brand": "Kia", "model": "Sportage"},
    {"brand": "Kia", "model": "Niro"},
    {"brand": "Kia", "model": "Stonic"},
    {"brand": "Kia", "model": "EV5", "search_query": "Kia EV5"},

    # Chery / CAOA Chery
    {"brand": "Chery", "model": "Tiggo 5x", "search_query": "CAOA Chery Tiggo 5x"},
    {"brand": "Chery", "model": "Tiggo 7", "search_query": "CAOA Chery Tiggo 7"},
    {"brand": "Chery", "model": "Tiggo 8", "search_query": "CAOA Chery Tiggo 8"},
    {"brand": "Chery", "model": "Arrizo 6", "search_query": "CAOA Chery Arrizo 6"},

    {"brand": "JAC", "model": "T40"},
    {"brand": "JAC", "model": "T50"},
    {"brand": "JAC", "model": "e-JS1", "search_query": "JAC e-JS1"},

    {"brand": "Land Rover", "model": "Range Rover Evoque", "search_query": "Land Rover Range Rover Evoque"},
    {"brand": "Land Rover", "model": "Discovery Sport"},
    {"brand": "Land Rover", "model": "Range Rover Velar", "search_query": "Land Rover Range Rover Velar"},

    {"brand": "Volvo", "model": "XC60"},
    {"brand": "Volvo", "model": "XC90"},
    {"brand": "Volvo", "model": "S60"},

    {"brand": "BMW", "model": "X1"},
    {"brand": "BMW", "model": "X3"},
    {"brand": "BMW", "model": "X5"},
    {"brand": "BMW", "model": "Série 3", "search_query": "BMW Serie 3"},
    {"brand": "BMW", "model": "Série 5", "search_query": "BMW Serie 5"},

    {"brand": "Mercedes-Benz", "model": "GLA"},
    {"brand": "Mercedes-Benz", "model": "GLC"},
    {"brand": "Mercedes-Benz", "model": "GLE"},
    {"brand": "Mercedes-Benz", "model": "Classe C", "search_query": "Mercedes-Benz Classe C"},
    {"brand": "Mercedes-Benz", "model": "Classe A", "search_query": "Mercedes-Benz Classe A"},
    {"brand": "Mercedes-Benz", "model": "EQB"},

    {"brand": "Audi", "model": "Q3"},
    {"brand": "Audi", "model": "Q5"},
    {"brand": "Audi", "model": "Q7"},
    {"brand": "Audi", "model": "A3"},
    {"brand": "Audi", "model": "A4"},

    {"brand": "Porsche", "model": "Cayenne"},
    {"brand": "Porsche", "model": "911"},

    {"brand": "Mini", "model": "Cooper"},

    {"brand": "RAM", "model": "1500", "search_query": "RAM 1500 Brasil"},
    {"brand": "RAM", "model": "2500", "search_query": "RAM 2500 Brasil"},
    {"brand": "RAM", "model": "Rampage"},

    {"brand": "BYD", "model": "Dolphin Mini", "search_query": "BYD Dolphin Mini"},
    {"brand": "BYD", "model": "Song Plus", "search_query": "BYD Song Plus"},
    {"brand": "BYD", "model": "Han"},
    {"brand": "BYD", "model": "King"},
]

# seed fixa so pra distribuir as datas de "descoberta" de forma deterministica
RNG = random.Random(42)


# --------------------------------------------------------------------------
# Normalizacao de unidades (pt-BR / metrico) para a Grid
# --------------------------------------------------------------------------

NUM = r"(\d[\d.,]*)"


def _to_float(raw: str) -> float:
    return float(raw.replace(",", ""))


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text.replace("|", " ")).strip()


def _extract(text: str, unit_patterns: list[tuple[str, str]]) -> tuple[float, str] | None:
    """Cada `pattern` fica entre parenteses NAO-capturadores (?:...) antes de
    virar regex: sem isso, um pattern com alternancia interna (ex.: torque
    "kgfm|kgf\\.?\\s*m") quebra o grupo do NUMERO por causa da baixa
    precedencia do `|` - a regex final virava efetivamente 2 alternativas
    soltas, e a 2a (sem numero) matchava sozinha e retornava m.group(1) =
    None, derrubando o processo inteiro (visto na pratica: run de 239
    veiculos crashou no meio ao bater um "X kgf.m" de torque)."""
    text = _clean(text)
    for pattern, unit in unit_patterns:
        m = re.search(NUM + r"\s*(?:" + pattern + ")", text, re.IGNORECASE)
        if m:
            return _to_float(m.group(1)), unit
    return None


def _first_value(specs: dict[str, str], *labels: str) -> str | None:
    for label in labels:
        if label in specs:
            return specs[label]
    return None


def parse_power_cv(specs: dict[str, str]) -> float | None:
    # "Potencia (maxima)"/"Potencia" = rotulos comuns nos sites .br (iCarros,
    # Webmotors, Quatro Rodas, UOL Carros, Autoesporte); "cv" (cavalos) e o
    # mesmo cavalo-vapor metrico que "PS", so muda o rotulo de unidade
    text = _first_value(
        specs,
        "Total Power", "Max. Output Power", "Power output",
        "Potência máxima", "Potência", "Potência (cv)",
    )
    if not text:
        return None
    hit = _extract(text, [(r"PS", "ps"), (r"cv\b", "ps"), (r"kW", "kw"), (r"hp", "hp")])
    if not hit:
        return None
    value, unit = hit
    if unit == "ps":
        return round(value, 1)
    if unit == "kw":
        return round(value * 1.35962, 1)
    return round(value * 1.01387, 1)  # hp mecanico -> cv


def parse_torque_kgfm(specs: dict[str, str]) -> float | None:
    text = _first_value(specs, "Total Torque", "Torque máximo", "Torque")
    if not text:
        return None
    hit = _extract(text, [(r"Nm", "nm"), (r"lb-ft", "lbft"), (r"kgfm|kgf\.?\s*m", "kgfm")])
    if not hit:
        return None
    value, unit = hit
    if unit == "nm":
        return round(value / 9.80665, 1)
    if unit == "lbft":
        return round(value * 0.138255, 1)
    return round(value, 1)


def parse_range_km(specs: dict[str, str]) -> float | None:
    text = _first_value(
        specs, "Electric Range", "Range", "Electric range",
        "Autonomia", "Autonomia elétrica", "Autonomia (elétrica)",
    )
    if not text:
        return None
    hit = _extract(text, [(r"km", "km"), (r"mi\b", "mi")])
    if not hit:
        return None
    value, unit = hit
    return round(value * 1.60934, 0) if unit == "mi" else round(value, 0)


def parse_acceleration_sec(specs: dict[str, str]) -> float | None:
    text = _first_value(
        specs,
        "Acceleration 0 - 100 km/h",
        "Acceleration 0 - 62 mph",
        "Aceleração 0-100 km/h",
        "0 a 100 km/h",
    )
    if not text:
        return None
    hit = _extract(text, [(r"sec", "sec"), (r"seg", "sec"), (r"s\b", "sec")])
    return hit[0] if hit else None


def parse_topspeed_kmh(specs: dict[str, str]) -> float | None:
    text = _first_value(specs, "Top Speed", "Velocidade máxima")
    if not text:
        return None
    hit = _extract(text, [(r"km/h", "kmh"), (r"mph", "mph")])
    if not hit:
        return None
    value, unit = hit
    return round(value * 1.60934, 0) if unit == "mph" else round(value, 0)


def parse_weight_kg(specs: dict[str, str]) -> float | None:
    text = _first_value(
        specs, "Weight Unladen (EU)", "Curb weight",
        "Peso em ordem de marcha", "Peso",
    )
    if not text:
        return None
    hit = _extract(text, [(r"kg", "kg"), (r"lbs?", "lbs")])
    if not hit:
        return None
    value, unit = hit
    return round(value * 0.453592, 0) if unit == "lbs" else round(value, 0)


def parse_towing_kg(specs: dict[str, str]) -> float | None:
    text = _first_value(specs, "Towing Weight Braked", "Towing Weight Unbraked")
    if not text:
        return None
    hit = _extract(text, [(r"kg", "kg"), (r"lbs?", "lbs")])
    if not hit:
        return None
    value, unit = hit
    return round(value * 0.453592, 0) if unit == "lbs" else round(value, 0)


def parse_battery_kwh(specs: dict[str, str]) -> float | None:
    text = _first_value(
        specs, "Useable Capacity", "Nominal Capacity", "Battery",
        "Capacidade da bateria", "Bateria",
    )
    if not text:
        return None
    hit = _extract(text, [(r"kWh", "kwh")])
    return hit[0] if hit else None


def parse_production_years(specs: dict[str, str]) -> tuple[int | None, int | None]:
    """Extrai o ano (ou intervalo de anos) de producao a partir do campo
    'Production'/'Model years' da Wikipedia. Ex.: '2017-present' -> (2017,
    None); '2009-2021 | 2009-2014 (Europe)' -> (2009, 2021). None em
    end_year significa 'ainda em producao' (sem data de fim conhecida)."""
    text = _first_value(specs, "Production", "Model years")
    if not text:
        return None, None

    years = [int(y) for y in re.findall(r"\b(?:19|20)\d{2}\b", text)]
    if not years:
        return None, None

    start_year = min(years)
    ongoing = bool(re.search(r"present|atual", text, re.IGNORECASE))
    end_year = None if ongoing else max(years)
    return start_year, end_year


# --------------------------------------------------------------------------
# Coleta
# --------------------------------------------------------------------------

def scan_target(brand: str, model: str, search_query: str | None = None) -> dict:
    query = search_query or f"{brand} {model}"
    print(f"[*] Coletando {brand} {model} ({query!r})...")

    per_source: dict[str, dict[str, str]] = {}
    rows: list[dict] = []

    from osint_radar import fetch_html, fetch_best_wikipedia  # local import to avoid cycle noise

    # Wikipedia e tratada a parte: tenta pt + en e fica com a que trouxer
    # mais campos (pt cobre melhor modelo so-Brasil, en costuma ser mais
    # rica pra EVs globais).
    wiki_url, wiki_specs = fetch_best_wikipedia(query)
    if wiki_url:
        per_source["Wikipedia"] = {"url": wiki_url, "specs": wiki_specs}
        print(f"    -> Wikipedia: {len(wiki_specs)} campos ({wiki_url})")
        rows.extend(build_rows(brand, model, "Wikipedia", wiki_url, wiki_specs, keywords=[]))
    else:
        print("    [!] Wikipedia: pagina nao encontrada (pt nem en)")

    for source in SOURCES:
        if source["name"] == "Wikipedia":
            continue  # ja tratada acima

        time.sleep(source.get("delay", 2.5))  # maioria das fontes .br usa DuckDuckGo p/ localizar; evita rate limit em rajada
        url = source["locate"](query)
        if not url:
            print(f"    [!] {source['name']}: pagina nao encontrada")
            continue

        html = fetch_html(url, retries=source.get("retries", 1))
        if not html:
            continue

        specs = source["parse"](html)
        per_source[source["name"]] = {"url": url, "specs": specs}
        print(f"    -> {source['name']}: {len(specs)} campos ({url})")

        rows.extend(
            build_rows(brand, model, source["name"], url, specs, keywords=[])
        )

    # ordem = prioridade quando o MESMO nome de campo aparece em mais de uma
    # fonte (o de tras sobrescreve) - Wikipedia/EV Database primeiro por
    # serem mais estruturadas; os sites .br entram depois, principalmente
    # pra preencher veiculos so-Brasil (combustao/hibrido) que o EV
    # Database nao cobre (e' so eletricos) e que a Wikipedia em ingles
    # documenta mal ou nao documenta.
    merged_specs: dict[str, str] = {}
    for name in (
        "Wikipedia", "EV Database", "iCarros", "Webmotors", "Quatro Rodas",
        "UOL Carros", "Autoesporte", "Motor1 Brasil", "CarrosNaWeb",
        "FlatOut", "AutoPapo", "G1", "R7", "Band",
    ):
        merged_specs.update(per_source.get(name, {}).get("specs", {}))

    start_year, end_year = parse_production_years(merged_specs)

    spec_row = {
        "target": brand,
        "model": model,
        "start_year": start_year,
        "end_year": end_year,
        "battery_kwh": parse_battery_kwh(merged_specs),
        "power_cv": parse_power_cv(merged_specs),
        "torque_kgfm": parse_torque_kgfm(merged_specs),
        "autonomy_km": parse_range_km(merged_specs),
        "acceleration_0_100": parse_acceleration_sec(merged_specs),
        "top_speed_kmh": parse_topspeed_kmh(merged_specs),
        "weight_kg": parse_weight_kg(merged_specs),
        "towing_kg": parse_towing_kg(merged_specs),
        "wikipedia_url": per_source.get("Wikipedia", {}).get("url"),
        "evdatabase_url": per_source.get("EV Database", {}).get("url"),
    }

    return {"rows": rows, "spec_row": spec_row}


def attach_discovery_metadata(rows: list[dict]) -> list[dict]:
    """Recalcula id/categoria/data de forma estavel e remove keyword_match
    /confidence (isso agora e calculado no front, em cima das palavras-chave
    que o usuario digitar na hora da busca)."""
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


FRONTEND_DISCOVERIES_PATH = FRONTEND_DATA_DIR / "osintDiscoveries.json"
FRONTEND_SPECS_PATH = FRONTEND_DATA_DIR / "osintVehicleSpecs.json"

CHECKPOINT_EVERY = 10  # grava os 2 JSON a cada N veiculos, nao so no final


def _save_outputs(all_rows: list[dict], spec_rows: list[dict]) -> list[dict]:
    """Grava os 2 JSON do frontend com o progresso ATUAL (nao espera o
    catalogo inteiro terminar). Com 239 veiculos x ate 11 fontes, uma
    rodada completa pode levar horas - sem checkpoint, matar o processo
    (ou a maquina reiniciar) no meio do caminho perderia 100% do trabalho
    feito ate ali. Chamado a cada CHECKPOINT_EVERY veiculos e no final."""
    discoveries = attach_discovery_metadata(all_rows)

    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)
    FRONTEND_DISCOVERIES_PATH.write_text(
        json.dumps(discoveries, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    FRONTEND_SPECS_PATH.write_text(
        json.dumps(spec_rows, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return discoveries


def main() -> None:
    all_rows: list[dict] = []
    spec_rows: list[dict] = []

    for i, entry in enumerate(CATALOG):
        if i > 0:
            time.sleep(1)  # politeness delay entre alvos

        try:
            result = scan_target(entry["brand"], entry["model"], entry.get("search_query"))
        except Exception as exc:  # noqa: BLE001 - PoC: 1 veiculo com parser
            # quebrando (ex.: unidade num formato novo) nao pode derrubar os
            # outros ~238 - loga bem alto e segue pro proximo. Confirmado na
            # pratica: um bug de regex no parser de torque derrubou uma rodada
            # inteira no meio do catalogo antes deste try/except existir.
            print(f"  [!!!] ERRO ao coletar {entry['brand']} {entry['model']}: {exc!r} - pulando este veiculo")
            continue

        all_rows.extend(result["rows"])
        spec_rows.append(result["spec_row"])

        done = i + 1
        if done % CHECKPOINT_EVERY == 0 or done == len(CATALOG):
            _save_outputs(all_rows, spec_rows)
            print(f"[*] checkpoint {done}/{len(CATALOG)} -> {FRONTEND_DISCOVERIES_PATH.name} / {FRONTEND_SPECS_PATH.name}")

    discoveries = _save_outputs(all_rows, spec_rows)

    print(f"\n[*] {len(discoveries)} descobertas -> {FRONTEND_DISCOVERIES_PATH}")
    print(f"[*] {len(spec_rows)} veiculos (specs) -> {FRONTEND_SPECS_PATH}")

    missing = [
        r["target"]
        for r in spec_rows
        if sum(v is None for k, v in r.items() if k not in ("target", "model", "wikipedia_url", "evdatabase_url")) >= 4
    ]
    if missing:
        print(f"[!] specs bem incompletas para: {missing} (confira os nomes de campo na fonte)")


if __name__ == "__main__":
    main()
