#!/usr/bin/env python3
"""Presentación de indicadores Acordionero Pad 4 · octubre 2026 (cierre 01–31).

La fuente es el reporte de generación diario. El calendario de cada unidad
son los días que cierran en 24 h. Los días en cero por comisionamiento o
desmantelamiento quedan fuera del denominador y se informan aparte.

Cada máquina: R% = (calendario − correctivo) / calendario.
Disponibilidad y contrato A% = (calendario − preventivo − correctivo) / calendario.
La parada externa no se resta.

El sistema es N+1. J320-1 es el respaldo. El sistema pierde una hora solo si
las J420 en servicio no caben en un respaldo: dos indisponibles a la vez, o
una indisponible mientras J320-1 también lo está. El reporte trae horas del
día, no el minuto. Con esas horas, octubre no fuerza ninguna hora de sistema caído.
"""
from __future__ import annotations

import html
import re
import shutil
import sys
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path
from urllib.parse import quote
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".pydeps"))
import openpyxl

INFORME = ROOT / "data/Acordionero/informes/2026-10"
REPORTE = ROOT / "data/Acordionero/operacion/2026-10/Reporte de generación diario octubre ACR pad 4.xlsx"
FALLAS = ROOT / "data/Acordionero/fallas/2026-10/analisis/Analisis fallas PAD4 Octubre 2026.xlsx"
INDICADORES = ROOT / "data/Acordionero/GTE/2026-10/Indicadores Octubre pad 4.xlsx"
CARGA = ROOT / "data/Acordionero/operacion/pruebas/2026-10/FORMATO VARIABLES PRUEBAS DE CARGA  KW ACR PAD 4.xlsx"
INSTALADA = {
    "G801": 1400, "G802": 1400, "G803": 1400, "G804": 1400,
    "G805": 1400, "G806": 1400, "G807": 1400,
    "J320-1": 1000, "G805T": 1000, "G806T": 500,
}
HSE = INFORME / "HSE"
HSE_FOTOS = (
    ("WhatsApp Image 2026-11-06 at 14.14.50.jpeg", "Capacitación SSTA"),
    ("WhatsApp Image 2026-11-06 at 14.14.40.jpeg", "Charla preturno"),
    ("WhatsApp Image 2026-11-06 at 14.14.52.jpeg", "Inspección eléctrica"),
    ("WhatsApp Image 2026-11-06 at 14.14.43.jpeg", "Separación de residuos"),
)
OUT = INFORME / "indicadores-octubre-PAD4-2026.html"
META = 0.98
# Anexo GTE de septiembre, página 6. La energía se vuelve a leer del Excel.
GTE_SEP_DISP_P = 0.9993
GTE_SEP_REL_P = 0.9998
GTE_SEP_FAILS = 15
GTE_SEP_KWH = 3_860_054
ORDER = [
    "G801", "G802", "G803", "G804", "G-805", "G-806", "G-807",
    "G-J320-1", "G-805T", "G-806T",
]
PRIMARY = {"G801", "G802", "G803", "G804", "G-805", "G-806", "G-807"}
SPARE_TAG = "G-J320-1"
# El reporte cuenta la falla y deja el correctivo en cero. La hora sale de operación.
NOTAS_FALLA = {
    (date(2026, 10, 11), "G-807"): "Sale a las 05:14 y entra a las 05:20 por knocking. Fuera de servicio 6 min.",
    (date(2026, 10, 12), "G-807"): "Sale a las 10:14 y entra a las 10:20 por knocking. Fuera de servicio 6 min.",
}
# El 21 el reporte carga 7 h, de 13:23 a 22:13. La parada real cierra a las 15:54.
FO_G804_21 = 2 + 32 / 60
NOTA_G804_21 = (
    "Parada a las 13:22 y arranque a las 15:54. "
    "Fuera de línea 2 h 32 min. Shutdown por Misfiring Failure."
)
LABEL = {
    "G-805": "G805", "G-806": "G806", "G-807": "G807",
    "G-805T": "G805T", "G-806T": "G806T", "G-J320-1": "J320-1",
}
# Ene–Ago, cierre ya publicado. Septiembre sale del anexo GTE, no de la hoja
# interna: GTE publica 3.860.054 kWh y la hoja del reporte carga 3.880.923 kWh.
HIST = [
    ("Ene", 3_430_300, 31),
    ("Feb", 2_908_620, 28),
    ("Mar", 3_459_400, 31),
    ("Abr", 3_349_816, 30),
    ("May", 3_448_400, 31),
    ("Jun", 3_219_300, 30),
    ("Jul", 3_450_513, 31),
    ("Ago", 3_746_118, 31),
]


def n(v, d=0):
    s = f"{v:,.{d}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def pct(v, d=2):
    if abs(v - 1) < 1e-12 and d == 2:
        return "100,00 %"
    return f"{n(v * 100, d)} %"


def esc(s):
    return html.escape(str(s), quote=True)


def horas(v):
    if abs(v - round(v)) < 0.001:
        return f"{n(round(v), 0)} h"
    if v >= 10 and abs(v * 10 - round(v * 10)) < 0.05:
        return f"{n(v, 1)} h"
    return f"{n(v, 2)} h"


def fnum(v):
    if isinstance(v, (int, float)):
        return float(v)
    return 0.0


def fleet_of(model):
    if str(model).startswith("J420"):
        return "J420"
    if str(model).startswith("J320"):
        return "J320"
    return "Jinan"


def label(tag):
    return LABEL.get(tag, tag)


def load_sheet(wb, sheet, obs_idx):
    rows = []
    for r in wb[sheet].iter_rows(min_row=4, values_only=True):
        if not r or not hasattr(r[0], "year"):
            continue
        op, sb, pp, fo, ext = (fnum(r[i]) for i in (11, 12, 13, 14, 15))
        rows.append({
            "date": r[0].date(),
            "model": str(r[4] or "").strip(),
            "tag": str(r[5] or "").strip(),
            "inst": fnum(r[6]),
            "kwh": fnum(r[9]),
            "op": op, "sb": sb, "pp": pp, "fo": fo, "ext": ext,
            "fails": fnum(r[17]),
            "fuel": str(r[18] or "").strip(),
            "obs": re.sub(r"\s+", " ", str(r[obs_idx] or "")).strip(),
            "live": (op + sb + pp + fo + ext) > 0.5,
        })
    return rows


def aplicar_parada_g804(rows):
    """Sustituye las 7 h del 21 por 2 h 32 min y devuelve el resto a operación."""
    for r in rows:
        if r["date"] != date(2026, 10, 21) or r["tag"] != "G804":
            continue
        delta = r["fo"] - FO_G804_21
        r["op"] += delta
        r["fo"] = FO_G804_21
        r["obs"] = NOTA_G804_21
        return
    raise SystemExit("no está la fila de G804 del 21 de octubre")


def pack(rows):
    live = [r for r in rows if r["live"]]
    cal = len(live) * 24
    op = sum(r["op"] for r in live)
    sb = sum(r["sb"] for r in live)
    pp = sum(r["pp"] for r in live)
    fo = sum(r["fo"] for r in live)
    ext = sum(r["ext"] for r in live)
    kwh = sum(r["kwh"] for r in live)
    fails = sum(r["fails"] for r in live)
    return {
        "n_days": len(live), "cal": cal, "op": op, "sb": sb, "pp": pp, "fo": fo,
        "ext": ext, "kwh": kwh, "mwh": kwh / 1000, "fails": fails,
        "disp": (cal - pp - fo) / cal, "a": (cal - pp - fo) / cal,
        "r": (cal - fo) / cal, "uso": op / cal, "kw": kwh / op if op else 0,
    }


def build_units(rows):
    grouped = defaultdict(list)
    for r in rows:
        grouped[r["tag"]].append(r)
    units = []
    for tag in ORDER:
        rs = grouped[tag]
        block = pack(rs)
        live = [r for r in rs if r["live"]]
        zeros = [r for r in rs if not r["live"]]
        block.update({
            "tag": tag, "name": label(tag), "model": fleet_of(rs[0]["model"]),
            "inst": rs[0]["inst"], "rows": rs, "live_rows": live, "zeros": zeros,
            "first": live[0]["date"] if live else None,
            "last": live[-1]["date"] if live else None,
        })
        units.append(block)
    return units


def n1_system(rows):
    """Horas de sistema caído que las columnas del día obligan.

    Con un respaldo, el sistema cae si la suma de horas indisponibles de las
    J420 y del respaldo no cabe en 24 h. Indisponible = preventivo + correctivo.
    """
    byday = defaultdict(list)
    for r in rows:
        if r["live"]:
            byday[r["date"]].append(r)
    down_d = down_r = 0.0
    peak = 0.0
    for items in byday.values():
        prim = [x for x in items if x["tag"] in PRIMARY]
        spare = next(x for x in items if x["tag"] == SPARE_TAG)
        sum_d = sum(x["pp"] + x["fo"] for x in prim)
        sum_r = sum(x["fo"] for x in prim)
        spare_d = spare["pp"] + spare["fo"]
        spare_r = spare["fo"]
        down_d += max(0.0, sum_d - 24, spare_d + sum_d - 24)
        down_r += max(0.0, sum_r - 24, spare_r + sum_r - 24)
        peak = max(peak, sum_d)
    cal = 31 * 24
    return {
        "cal": cal, "down_d": down_d, "down_r": down_r, "peak": peak,
        "disp": (cal - down_d) / cal, "r": (cal - down_r) / cal,
    }


def at_most_one(vals):
    """Probabilidad de que fallen cero unidades o exactamente una.

    Independencia. Una unidad en 100 % no mueve el resultado. Con las
    disponibilidades publicadas de septiembre esta cuenta da 99,93 % y,
    con las confiabilidades, 99,98 %.
    """
    p0 = 1.0
    for v in vals:
        p0 *= v
    p1 = 0.0
    for i, vi in enumerate(vals):
        if vi >= 1:
            continue
        term = 1 - vi
        for j, vj in enumerate(vals):
            if j != i:
                term *= vj
        p1 += term
    return p0 + p1


def n1_prob(units):
    block = [u for u in units if u["cal"]]
    return {
        "disp": at_most_one([u["disp"] for u in block]),
        "r": at_most_one([u["r"] for u in block]),
    }


def kpi(label_txt, value, note, tone=""):
    return (
        f'<article class="{tone}"><span>{esc(label_txt)}</span>'
        f"<strong>{value}</strong><small>{esc(note)}</small></article>"
    )


def card(title, note, rows, edge):
    items = "".join(f"<dt>{esc(lab)}</dt><dd class='{cls}'>{val}</dd>" for lab, val, cls in rows)
    return f'<article class="{edge}"><h3>{esc(title)}</h3><p class="sub">{esc(note)}</p><dl>{items}</dl></article>'


def tone(value):
    return "ok" if value >= META else "warn"


def load_fallas():
    """Eventos del análisis de fallas. G807 no está: es máquina nueva, en seguimiento."""
    wb = openpyxl.load_workbook(FALLAS, data_only=True)
    events = []
    for r in wb["PARETO DE FALLAS"].iter_rows(min_row=2, values_only=True):
        if not r or not isinstance(r[0], (int, float)) or not hasattr(r[1], "year"):
            continue
        events.append({
            "date": r[1].date(),
            "tag": str(r[2] or "").strip(),
            "sistema": {
                "COMBUSTION": "Combustión",
                "INSTRUMENTACION": "Instrumentación",
                "ELECTRICO": "Eléctrico",
                "ENCENDIDO": "Encendido",
            }.get(str(r[3] or "").strip(), str(r[3] or "").strip()),
            "reportada": re.sub(r"\s+", " ", str(r[4] or "")).strip().replace("Msifiring", "Misfiring"),
            "modo": {
                "Detonacion (Knoking)": "Detonación (knocking)",
                "Señal erronea": "Señal errónea",
            }.get(
                re.sub(r"\s+", " ", str(r[5] or "")).strip(),
                re.sub(r"\s+", " ", str(r[5] or "")).strip(),
            ),
            "horas": fnum(r[6]),
        })
    wb.close()
    if len(events) != 14 or any(e["tag"] == "G807" for e in events):
        raise SystemExit(f"el análisis debe traer 14 fallas y ninguna de G807: {len(events)}")
    return events


MTTO_NOMBRE = {
    "GEN 801": "G801", "GEN 802": "G802", "GEN 803": "G803", "GEN 804": "G804",
    "GE 805": "G805", "GE 806": "G806", "GE 807": "G807",
    "GE 805T": "G805T", "GE 806T": "G806T", "GEN J320": "J320-1",
}


def load_mtto():
    """Planeados, ejecutados y horas de la hoja ACR pad 4 Oct."""
    wb = openpyxl.load_workbook(INDICADORES, data_only=True)
    ws = wb["ACR pad 4 Oct"]
    rows = []
    for r in range(14, 24):
        nombre = str(ws.cell(r, 2).value or "").strip()
        if nombre not in MTTO_NOMBRE:
            raise SystemExit(f"equipo de mantenimiento no esperado: {nombre}")
        rows.append({
            "name": MTTO_NOMBRE[nombre],
            "horas": fnum(ws.cell(r, 22).value),
            "plan": fnum(ws.cell(r, 26).value),
            "ejec": fnum(ws.cell(r, 27).value),
        })
    total = {
        "horas": fnum(ws.cell(24, 22).value),
        "plan": fnum(ws.cell(24, 26).value),
        "ejec": fnum(ws.cell(24, 27).value),
    }
    wb.close()
    if abs(sum(x["plan"] for x in rows) - total["plan"]) > 0.01:
        raise SystemExit("los planeados no cierran con el sistema")
    if abs(sum(x["ejec"] for x in rows) - total["ejec"]) > 0.01:
        raise SystemExit("los ejecutados no cierran con el sistema")
    total["horas_unidades"] = sum(x["horas"] for x in rows)
    return rows, total


def carga_nombre(raw):
    s = str(raw or "").strip().upper().replace(" ", "")
    if "J320" in s:
        return "J320-1"
    return s.replace("-", "")


def map_bar(v):
    if v is None or v == "":
        return None
    if isinstance(v, (int, float)):
        x = float(v)
        mbar = False
    else:
        txt = str(v).strip().lower().replace(",", ".")
        m = re.search(r"-?\d+(?:\.\d+)?", txt)
        if not m:
            return None
        x = float(m.group())
        mbar = "mbar" in txt.replace(" ", "")
    if mbar or x >= 100:
        if x >= 10000:
            x /= 10000
        elif x >= 100:
            x /= 1000
    return x


def tipo_gas(v):
    if v is None or str(v).strip() == "":
        return None
    t = re.sub(r"\s+", " ", str(v).strip().upper())
    t = t.replace("RODUCCION", "PRODUCCION").replace("PRODUCION", "PRODUCCION")
    if "GNC" in t and "SAN ROQUE" in t:
        return "GNC San Roque"
    if "SAN ROQUE" in t and "TGI" in t:
        return "San Roque / TGI"
    if "SAN ROQUE" in t:
        return "San Roque"
    if "TGI" in t:
        return "TGI"
    return str(v).strip()


def gases_validos(vals):
    ok = []
    for v in vals:
        if isinstance(v, (int, float)) and 400 <= float(v) <= 750:
            ok.append(float(v))
    return ok


def load_carga():
    """Pruebas de octubre: una fila por equipo y fecha, en la lectura de mayor kW."""
    wb = openpyxl.load_workbook(CARGA, data_only=True)
    ws = wb[wb.sheetnames[0]]
    pruebas = []
    actual = None
    for r in range(6, ws.max_row + 1):
        nombre = ws.cell(r, 2).value
        kw = ws.cell(r, 6).value
        kw = float(kw) if isinstance(kw, (int, float)) else None
        if nombre:
            fecha = ws.cell(r, 3).value
            if isinstance(fecha, datetime):
                fecha = fecha.date()
            actual = {"name": carga_nombre(nombre), "date": fecha, "samples": []}
            pruebas.append(actual)
        if actual is None or kw is None:
            continue
        tension = fnum(ws.cell(r, 17).value)
        if not nombre and actual["samples"]:
            base = actual["samples"][0]["v"]
            if base and tension and (tension >= 1000) != (base >= 1000):
                continue
        gases = gases_validos([ws.cell(r, c).value for c in (8, 9, 10)])
        actual["samples"].append({
            "kw": kw,
            "map": map_bar(ws.cell(r, 7).value),
            "gases": max(gases) if gases else None,
            "v": fnum(ws.cell(r, 17).value),
            "a": fnum(ws.cell(r, 18).value),
            "hz": fnum(ws.cell(r, 19).value),
            "fp": fnum(ws.cell(r, 20).value),
            "gas": tipo_gas(ws.cell(r, 22).value),
        })
    wb.close()
    out = []
    for p in pruebas:
        if not p["date"] or p["date"].year != 2026 or p["date"].month != 10 or not p["samples"]:
            continue
        tope = max(s["kw"] for s in p["samples"])
        en_tope = [s for s in p["samples"] if s["kw"] == tope]
        ultima = en_tope[-1]
        hz_ok = [s["hz"] for s in en_tope if 59 <= s["hz"] <= 61]
        gases = [s["gases"] for s in en_tope if s["gases"] is not None]
        gases_tipo = []
        for s in en_tope:
            if s["gas"] and s["gas"] not in gases_tipo:
                gases_tipo.append(s["gas"])
        inst = INSTALADA.get(p["name"])
        if inst is None:
            raise SystemExit(f"sin potencia instalada para {p['name']}")
        out.append({
            "name": p["name"],
            "date": p["date"],
            "kw": tope,
            "inst": inst,
            "map": ultima["map"],
            "gases": max(gases) if gases else None,
            "v": ultima["v"],
            "a": ultima["a"],
            "hz": hz_ok[-1] if hz_ok else ultima["hz"],
            "fp": ultima["fp"],
            "gas": " · ".join(gases_tipo),
            "n": len(p["samples"]),
        })
    out.sort(key=lambda x: (x["date"], x["name"]))
    if len(out) != 8:
        raise SystemExit(f"pruebas de octubre: {len(out)}")
    return out


def horas_evento(e):
    """El análisis carga 7 h el 21 de G804. La parada real es 2 h 32 min."""
    if e["date"] == date(2026, 10, 21) and e["tag"] == "G804":
        return FO_G804_21
    return e["horas"]


def freq_sistema(fails):
    """0–2 cumple. 3–4 advertencia. 5–6 plan. 7 incumplimiento. 8 o más, crítica."""
    if fails <= 2:
        return "Cumple"
    if fails <= 4:
        return "Advertencia"
    if fails <= 6:
        return "Plan"
    if fails == 7:
        return "Incumplimiento"
    return "Crítica"


def gte_septiembre():
    """Energía y fallas del data soporte que acompaña el análisis de GTE."""
    src = next(
        p
        for p in (ROOT / "data/Acordionero/GTE/2026-09").glob("Data Soporte*.xlsx")
        if "(2)" in p.name
    )
    wb = openpyxl.load_workbook(src, data_only=True)
    kwh = fails = 0.0
    for r in wb.active.iter_rows(min_row=2, values_only=True):
        if not r or not hasattr(r[0], "year"):
            continue
        kwh += fnum(r[7])
        fails += fnum(r[12])
    wb.close()
    if abs(kwh - GTE_SEP_KWH) > 1 or abs(fails - GTE_SEP_FAILS) > 0.01:
        raise SystemExit(f"el anexo GTE no cierra en {GTE_SEP_KWH} kWh y 15 fallas: {kwh} {fails}")
    return {
        "kwh": kwh, "mwh": kwh / 1000, "fails": fails, "days": 30,
        "disp_p": GTE_SEP_DISP_P, "rel_p": GTE_SEP_REL_P,
    }


def site_rows(block):
    return [
        ("Generación", f"{n(block['mwh'], 1)} MWh", ""),
        ("Disponibilidad", pct(block["disp"]), tone(block["disp"])),
        ("Confiabilidad R%", pct(block["r"]), tone(block["r"])),
        ("Contrato A%", pct(block["a"]), tone(block["a"])),
        ("Uso", pct(block["uso"], 1), ""),
        ("Paradas externas", horas(block["ext"]), "warn" if block["ext"] else "ok"),
    ]


def page(npage, inner, cover=False):
    body = inner if cover else f'<div class="pad">{inner}</div>'
    return f'<article class="slide">{body}<span class="pn">{npage}</span></article>'


def cubic(xs, ys):
    d = f"M {xs[0]:.1f} {ys[0]:.1f}"
    for i in range(len(xs) - 1):
        mx = (xs[i] + xs[i + 1]) / 2
        d += f" C {mx:.1f} {ys[i]:.1f}, {mx:.1f} {ys[i + 1]:.1f}, {xs[i + 1]:.1f} {ys[i + 1]:.1f}"
    return d


def barras_meses(grupos, ymin, ymax, dec, ticks):
    """Barras Sep/Oct. grupos: (etiqueta, septiembre, octubre)."""
    w, h = 430, 250
    pl, pr, pt, pb = 52, 14, 22, 30
    iw, ih = w - pl - pr, h - pt - pb
    slot = iw / len(grupos)
    bw = min(54, slot * 0.22)

    def y_at(v):
        v = min(max(v, ymin), ymax)
        return pt + ih - (v - ymin) / (ymax - ymin) * ih

    base = y_at(ymin)
    parts = []
    for val in ticks:
        yy = y_at(val)
        parts.append(f'<line x1="{pl}" y1="{yy:.1f}" x2="{w - pr}" y2="{yy:.1f}" stroke="#e8eef4"/>')
        parts.append(
            f'<text x="{pl - 6}" y="{yy + 3:.1f}" text-anchor="end" font-size="10" fill="#94a3b8" font-family="Arial">{n(val, 0 if abs(val - round(val)) < 0.001 else dec)}</text>'
        )
    for i, (lab, sep, octv) in enumerate(grupos):
        cx = pl + slot * (i + 0.5)
        for dx, val, col in ((-(bw + 4), sep, "#1E3A5F"), (4, octv, "#0f766e")):
            y = y_at(val)
            parts.append(
                f'<rect x="{cx + dx:.1f}" y="{y:.1f}" width="{bw}" height="{max(base - y, 1):.1f}" rx="3" fill="{col}"/>'
            )
            parts.append(
                f'<text x="{cx + dx + bw / 2:.1f}" y="{y - 6:.1f}" text-anchor="middle" font-size="11" font-weight="700" fill="{col}" font-family="Arial">{n(val, dec)}</text>'
            )
        parts.append(
            f'<text x="{cx:.1f}" y="{h - 8}" text-anchor="middle" font-size="12" fill="#334155" font-family="Arial">{esc(lab)}</text>'
        )
    return f'<svg viewBox="0 0 {w} {h}" width="100%" height="100%" role="img">{"".join(parts)}</svg>'


def gen_svg(points):
    w, h = 860, 230
    pad = {"l": 36, "r": 12, "t": 16, "b": 22}
    iw, ih = w - pad["l"] - pad["r"], h - pad["t"] - pad["b"]
    gens = [p["gen"] for p in points]
    lo, hi = min(gens) * 0.92, max(gens) * 1.08
    xs = [pad["l"] + i / (len(points) - 1) * iw for i in range(len(points))]

    def y_at(v):
        return pad["t"] + ih - (v - lo) / (hi - lo) * ih

    ys = [y_at(p["gen"]) for p in points]
    area = f"{cubic(xs, ys)} L {xs[-1]:.1f} {pad['t'] + ih:.1f} L {xs[0]:.1f} {pad['t'] + ih:.1f} Z"
    ticks = sorted({round(min(gens) / 10) * 10, round(max(gens) / 10) * 10})
    grid = []
    for tick in ticks:
        yy = y_at(tick)
        grid.append(f'<line x1="{pad["l"]}" y1="{yy:.1f}" x2="{w - pad["r"]}" y2="{yy:.1f}" stroke="#e8eef4"/>')
        grid.append(
            f'<text x="{pad["l"] - 6}" y="{yy + 3:.1f}" text-anchor="end" font-size="9" fill="#94a3b8" font-family="Arial">{n(tick, 0)}</text>'
        )
    dots, labels, tags = [], [], []
    for i, p in enumerate(points):
        col = "#C0392B" if p["now"] else "#1E3A5F"
        dots.append(f'<circle cx="{xs[i]:.1f}" cy="{ys[i]:.1f}" r="{4.2 if p["now"] else 3.1}" fill="{col}"/>')
        labels.append(
            f'<text x="{xs[i]:.1f}" y="{h - 6}" text-anchor="middle" font-size="11" fill="#64748b" font-family="Arial">{esc(p["month"])}</text>'
        )
        if p["month"] not in {"Ago", "Sep", "Oct"}:
            continue
        anchor = "end" if i == len(points) - 1 else "middle"
        tags.append(
            f'<text x="{xs[i]:.1f}" y="{ys[i] - 8:.1f}" text-anchor="{anchor}" font-size="10" font-weight="700" fill="{col}" font-family="Arial">{n(p["gen"], 0)}</text>'
        )
    return f'''<svg viewBox="0 0 {w} {h}" width="100%" height="100%" role="img">
      {''.join(grid)}<path d="{area}" fill="rgb(30 58 95 / 10%)"/>
      <path d="{cubic(xs, ys)}" fill="none" stroke="#1E3A5F" stroke-width="2.4"/>
      {''.join(dots)}{''.join(tags)}{''.join(labels)}
    </svg>'''


def short(text, limit=108):
    s = re.sub(r"\s+", " ", text or "").strip(" -")
    if not s:
        return "El reporte cuenta la falla y no deja nota."
    if len(s) <= limit:
        return s
    return s[: limit - 1].rstrip() + "…"


def render(oct_rows, gte, units, park, fleets, fallas, mtto, mtto_total, carga):
    by = {u["tag"]: u for u in units}
    j420, j320, jinan = fleets["J420"], fleets["J320"], fleets["Jinan"]
    spare = by[SPARE_TAG]
    conteo = defaultdict(int)
    for e in fallas:
        conteo[e["tag"]] += 1
    for u in units:
        u["fails"] = conteo.get(u["name"], 0)
    n_fallas = len(fallas)
    fo_fallas = sum(horas_evento(e) for e in fallas)
    n1 = n1_system(oct_rows)
    n1p = n1_prob(units)
    below = [u for u in units if u["tag"] in PRIMARY and u["disp"] < META]
    below_txt = " · ".join(f"{u['name']} {pct(u['disp'])}" for u in below) or "ninguna"
    mttr = fo_fallas / n_fallas
    # Anexo GTE: el MTBF del bloque es horas disponibles / fallas, no horas de operación.
    # G807 queda fuera del numerador y del denominador: máquina nueva, en seguimiento.
    mtbf_sys = (park["cal"] - park["pp"] - fo_fallas) / n_fallas
    banda = freq_sistema(n_fallas)
    peor = min((u for u in units if u["fails"]), key=lambda u: u["op"] / u["fails"])
    daily = defaultdict(float)
    for r in oct_rows:
        daily[r["date"]] += r["kwh"] / 1000
    days = sorted(daily)
    gen_days = [(d, daily[d]) for d in days]
    peak = max(gen_days, key=lambda x: x[1])
    valle = min(gen_days, key=lambda x: x[1])
    mwh_d = park["mwh"] / 31
    sep_d = gte["mwh"] / gte["days"]
    delta = (mwh_d - sep_d) / sep_d

    energia = barras_meses(
        [("MWh", gte["mwh"], park["mwh"])], 0, 5000, 1, [0, 1000, 2000, 3000, 4000, 5000]
    )
    n1_graf = barras_meses(
        [
            ("Disponibilidad", gte["disp_p"] * 100, n1p["disp"] * 100),
            ("Confiabilidad", gte["rel_p"] * 100, n1p["r"] * 100),
        ],
        98,
        100.45,
        2,
        [98, 99, 100],
    )

    s1 = page(1, """
        <div class="cover"><div class="hero">
          <p class="kicker">GRAN TIERRA ENERGY · CIERRE 01–31 DE OCTUBRE</p>
          <h1>INDICADORES DE CONFIABILIDAD</h1>
          <p class="month">OCTUBRE 2026</p><hr>
          <h2>CAMPO DE GENERACIÓN PAD 4</h2>
        </div></div>""", cover=True)

    s2 = page(2, f"""
        <h2 class="title">Resumen ejecutivo</h2>
        <div class="sites">
          {card("N+1 operacional", "J320-1 de respaldo · meta ≥ 98 %", [
            ("Generación", f"{n(park['mwh'], 1)} MWh", ""),
            ("Disponibilidad", pct(n1["disp"]), tone(n1["disp"])),
            ("Confiabilidad R%", pct(n1["r"]), tone(n1["r"])),
            ("Horas de sistema caído", horas(n1["down_d"]), "ok" if n1["down_d"] == 0 else "warn"),
            ("Fallas de máquina", f"{n(n_fallas, 0)} · {banda.lower()}", "warn"),
            ("Respaldo en stand-by", horas(spare["sb"]), ""),
          ], "p")}
          {card("N+1 probabilístico", "independencia · admite una sola unidad fuera", [
            ("Disponibilidad", pct(n1p["disp"]), tone(n1p["disp"])),
            ("Confiabilidad R%", pct(n1p["r"]), tone(n1p["r"])),
            ("Fallas", f"{n(n_fallas, 0)} · sin G807", "warn"),
            ("G804 sola", pct(by["G804"]["disp"]), "warn"),
            ("Vs septiembre", pct(gte["disp_p"]) + " → " + pct(n1p["disp"]), ""),
            ("Frecuencia", f"{banda} · umbral 8", "warn"),
          ], "c")}
          {card("Respaldo J320-1", "todo el mes · G805T es temporal y sale el 17", site_rows(spare), "v")}
        </div>
        <div class="duo">
          <div class="trend">
            <div class="trend-head">
              <h4>Energía generada · septiembre y octubre</h4>
              <p class="leg"><span><i class="d"></i>Sep</span><span><i class="s"></i>Oct</span><span>+{n(park['mwh'] - gte['mwh'], 0)} MWh · +{n((park['mwh'] / gte['mwh'] - 1) * 100, 1)} %</span></p>
            </div>
            {energia}
          </div>
          <div class="trend">
            <div class="trend-head">
              <h4>N+1 probabilístico</h4>
              <p class="leg"><span><i class="d"></i>Sep</span><span><i class="s"></i>Oct</span><span>meta 98 %</span></p>
            </div>
            {n1_graf}
          </div>
        </div>
        """)

    def machine_row(u, bloque=False):
        if u["tag"] == "G-807":
            fail_cell, mtbf, mttr = "Seguimiento", "—", "—"
        else:
            fail_cell = n(u["fails"], 0)
            mtbf = "Sin fallas" if not u["fails"] else n(u["op"] / u["fails"], 2)
            mttr = "0" if not u["fails"] else n(u["fo"] / u["fails"], 2)
        cls = ' class="bloque"' if bloque else ""
        return (
            f"<tr{cls}><td>{esc(u['name'])}</td><td>{esc(u['model'])}</td>"
            f"<td class='num'>{n(u['kwh'], 0)}</td><td class='num'>{n(u['sb'], 1 if u['sb'] >= 10 else 2)}</td>"
            f"<td class='num'>{pct(u['disp'])}</td><td class='num'>{pct(u['r'])}</td>"
            f"<td class='num'>{fail_cell}</td><td class='num'>{mtbf}</td><td class='num'>{mttr}</td></tr>"
        )

    s4 = page(3, f"""
        <h2 class="title">Desempeño por máquina</h2>
        <p class="regla">Meta de disponibilidad y confiabilidad: 98 %. El MTBF de cada máquina es operación / fallas, como en el anexo GTE. La frecuencia individual: 0 a 1 cumple, 2 desviación, 3 deterioro, 4 a 5 grave, 6 o más reemplazo. En el bloque, 8 o más es condición crítica. El preventivo no cuenta como falla.</p>
        <table class="dash"><thead><tr><th>Unidad</th><th>Flota</th><th class="num">Energía kWh</th><th class="num">Stand-by h</th><th class="num">Disp.</th><th class="num">Conf.</th><th class="num">Fallas</th><th class="num">MTBF h</th><th class="num">MTTR h</th></tr></thead>
        <tbody>
          {''.join(machine_row(u) for u in units)}
          <tr class="bloque"><td>N+1 operacional</td><td>J320-1 respaldo</td>
            <td class="num">{n(park['kwh'], 0)}</td><td class="num">{n(spare['sb'], 0)}</td>
            <td class="num">{pct(n1['disp'])}</td><td class="num">{pct(n1['r'])}</td>
            <td class="num">{n(n_fallas, 0)}</td><td class="num">{n(mtbf_sys, 2)}</td><td class="num">{n(mttr, 2)}</td></tr>
          <tr class="bloque"><td>N+1 probabilístico</td><td>independencia</td>
            <td class="num">{n(park['kwh'], 0)}</td><td class="num">—</td>
            <td class="num">{pct(n1p['disp'])}</td><td class="num">{pct(n1p['r'])}</td>
            <td class="num">{n(n_fallas, 0)}</td><td class="num">{n(mtbf_sys, 2)}</td><td class="num">{n(mttr, 2)}</td></tr>
        </tbody></table>
        <div class="method">
          <article class="d"><h4>Quién queda bajo 98 %</h4><p class="regla">Como máquina, solo {esc(below_txt)}. Esas horas caben en el respaldo: el 19, el 21 y el 28 J320-1 está disponible. El sistema no las cuenta como pérdida de disponibilidad.</p></article>
          <article class="a"><h4>Frecuencia del criterio GTE</h4><p class="regla">G807 es máquina nueva y está en seguimiento: sus eventos no entran. El análisis cierra en {n(n_fallas, 0)}. G803 queda en {n(by['G803']['fails'], 0)}, grave. G802 en {n(by['G802']['fails'], 0)}, grave. G804 en {n(by['G804']['fails'], 0)}, deterioro. G801 en {n(by['G801']['fails'], 0)}, desviación. Septiembre cerró en {n(gte['fails'], 0)}, también crítica.</p></article>
        </div>
        """)

    conf_rows = [
        f"<tr class='bloque'><td>N+1 operacional</td><td class='num'>{n(n_fallas, 0)}</td><td class='num'>{horas(j420['op'])}</td>"
        f"<td class='num'>{horas(n1['down_r'])}</td><td class='num'>{n(mtbf_sys, 2)} h</td><td class='num'>{n(mttr, 2)} h</td><td>{pct(n1['r'])}</td></tr>"
        f"<tr class='bloque'><td>N+1 probabilístico</td><td class='num'>{n(n_fallas, 0)}</td><td class='num'>—</td>"
        f"<td class='num'>—</td><td class='num'>{n(mtbf_sys, 2)} h</td><td class='num'>{n(mttr, 2)} h</td><td>{pct(n1p['r'])}</td></tr>"
    ]
    for u in units:
        if u["tag"] == "G-807" or not u["fails"]:
            continue
        conf_rows.append(
            f"<tr><td>{esc(u['name'])}</td><td class='num'>{n(u['fails'], 0)}</td>"
            f"<td class='num'>{horas(u['op'])}</td><td class='num'>{horas(u['fo'])}</td>"
            f"<td class='num'>{n(u['op'] / u['fails'], 2)} h</td><td class='num'>{n(u['fo'] / u['fails'], 2)} h</td>"
            f"<td>{pct(u['r'])}</td></tr>"
        )
    g807 = by["G-807"]
    conf_rows.append(
        f"<tr><td>G807</td><td class='num'>Seguimiento</td>"
        f"<td class='num'>{horas(g807['op'])}</td><td class='num'>{horas(g807['fo'])}</td>"
        f"<td class='num'>—</td><td class='num'>—</td><td>No entra al conteo</td></tr>"
    )
    sin = " · ".join(u["name"] for u in units if u["tag"] != "G-807" and not u["fails"])
    conf_rows.append(
        f"<tr><td>{esc(sin)}</td><td class='num'>0</td><td class='num'>{horas(sum(u['op'] for u in units if u['tag'] != 'G-807' and not u['fails']))}</td>"
        f"<td class='num'>0</td><td class='num'>—</td><td class='num'>—</td><td>Sin fallas</td></tr>"
    )
    ranked_f = sorted((u for u in units if u["tag"] != "G-807" and u["fails"]), key=lambda u: -u["fails"])
    fmax = ranked_f[0]["fails"]
    fbars = "".join(
        f'<li><span>{esc(u["name"])}</span><b class="{"out" if u["fails"] == fmax else ""}" style="width:{u["fails"] / fmax * 100:.0f}%"></b><em>{n(u["fails"], 0)} · MTBF {n(u["op"] / u["fails"], 0)} h</em></li>'
        for u in ranked_f
    )
    s5 = page(4, f"""
        <h2 class="title">Confiabilidad</h2>
        <p class="regla">R% de cada máquina = (calendario − correctivo) / calendario. El operacional no baja si J320-1 cubre esa hora: {pct(n1['r'])}. El probabilístico cierra en {pct(n1p['r'])}. El conteo sale del análisis de fallas. G807 no entra: es máquina nueva y está en seguimiento. Octubre suma {n(n_fallas, 0)} y, desde 8, la frecuencia es crítica. Septiembre cerró en {n(gte['fails'], 0)}.</p>
        <div class="kpis k4">
          {kpi("N+1 operacional", pct(n1['r']), f"{n(n_fallas, 0)} fallas · frecuencia {banda.lower()}", "ok")}
          {kpi("MTBF del bloque", f"{n(mtbf_sys, 2)} h", f"horas disponibles / {n(n_fallas, 0)} fallas", "warn")}
          {kpi("MTTR del bloque", f"{n(mttr, 2)} h", f"{horas(fo_fallas)} de correctivo / {n(n_fallas, 0)} fallas")}
          {kpi("Menor MTBF", f"{n(peor['op'] / peor['fails'], 0)} h", f"{peor['name']} · {n(peor['fails'], 0)} fallas", "warn")}
        </div>
        <table class="mto"><thead><tr><th>Unidad</th><th class="num">Fallas</th><th class="num">Operación</th><th class="num">Correctivo</th><th class="num">MTBF</th><th class="num">MTTR</th><th>Cierre</th></tr></thead><tbody>
          {''.join(conf_rows)}
        </tbody></table>
        <div class="card">
          <h4>Fallas que carga el reporte</h4>
          <ul class="hlist flat">{fbars}</ul>
        </div>
        """)

    disp_rank = sorted(units, key=lambda u: u["disp"])
    dmin = disp_rank[0]["disp"]
    dbars = "".join(
        f'<li><span>{esc(u["name"])}</span><b class="{"out" if u["disp"] < META else "ok"}" style="width:{u["disp"] * 100:.0f}%"></b><em>{pct(u["disp"])}</em></li>'
        for u in disp_rank
    )
    s6 = page(5, f"""
        <h2 class="title">Disponibilidad</h2>
        <div class="kpis k3">
          {kpi("N+1 operacional", pct(n1['disp']), f"J320-1 cubre el mes · {horas(n1['down_d'])} de sistema caído", "ok")}
          {kpi("N+1 probabilístico", pct(n1p['disp']), f"confiabilidad {pct(n1p['r'])} · septiembre {pct(gte['disp_p'])} y {pct(gte['rel_p'])}", tone(n1p['disp']))}
          {kpi("Bajo la meta", below_txt, f"como máquina · preventivo {horas(by['G804']['pp'])} · correctivo {horas(by['G804']['fo'])}", "warn")}
        </div>
        <div class="method">
          <article class="d"><h4>Cómo cierra el N+1</h4>
            <p class="regla">El sistema pierde una hora solo si dos J420 están indisponibles a la vez, o si una lo está y J320-1 también. En octubre la mayor suma de horas indisponibles de las J420, en un mismo día, es {horas(n1['peak'])}. Cabe en las 24 h y el respaldo está libre. Sin ese alivio, las J420 cierran en {pct(j420['disp'])}.</p>
            <div class="frac-row"><div class="frac"><b>{n(n1['cal'] - n1['down_d'], 0)} h</b><i></i><b>{n(n1['cal'], 0)} h</b></div><em>{pct(n1['disp'])}</em></div>
            <p class="regla">El 26 el respaldo tiene {horas(spare['pp'])} de preventivo y ninguna J420 está fuera. Las {horas(park['ext'])} externas no entran.</p>
          </article>
          <article class="a"><h4>Lo que no entra al calendario</h4>
            <p class="regla">G807 tiene 9 días en cero por comisionamiento, del 1 al 9. G806, diez días, del 12 al 21. G805, once días, del 18 al 28. G805T queda en cero el 17 por desmantelamiento.</p>
            <p class="regla">Esos días no se cuentan como indisponibilidad. El 29, G802 sale por baja presión de aceite y el reporte carga esas horas a stand-by, no a falla.</p>
          </article>
        </div>
        <div class="card">
          <h4>Disponibilidad por máquina · la barra roja queda bajo 98 %</h4>
          <ul class="hlist flat">{dbars}</ul>
        </div>
        """)

    ymax = max(v for _, v in gen_days) * 1.08
    bars = []
    for d, val in gen_days:
        mark = str(d.day) if d.day in (1, 8, 15, 22, 31) else ""
        bars.append(f'<div><span style="height:{val / ymax * 100:.1f}%"><i class="gas"></i></span><em>{mark}</em></div>')
    fleet_max = max(j420["kwh"], j320["kwh"], jinan["kwh"])
    s7 = page(6, f"""
        <h2 class="title">Detalle de la generación</h2>
        <div class="kpis k4">
          {kpi("Total", f"{n(park['mwh'], 1)} MWh", "gas · días en servicio del 01 al 31")}
          {kpi("Ritmo diario", f"{n(mwh_d, 1)} MWh/d", f"+{n(delta * 100, 1)} % vs sep GTE {n(sep_d, 1)}", "ok")}
          {kpi("Pico diario", f"{n(peak[1], 0)} MWh", f"día {peak[0].day} · mínimo {n(valle[1], 0)} MWh el {valle[0].day}", "violet")}
          {kpi("Potencia media", f"{n(park['kw'], 0)} kW", f"{n(park['op'], 0)} h de operación", "blue")}
        </div>
        <div class="kpis k4">
          {kpi("J420", f"{n(j420['mwh'], 0)} MWh", pct(j420['kwh'] / park['kwh'], 1), "blue")}
          {kpi("J320", f"{n(j320['mwh'], 0)} MWh", pct(j320['kwh'] / park['kwh'], 1))}
          {kpi("Jinan", f"{n(jinan['mwh'], 0)} MWh", pct(jinan['kwh'] / park['kwh'], 1))}
          {kpi("Gas", "100 %", "el reporte no trae diésel", "ok")}
        </div>
        <div class="days">
          <div class="trend-head">
            <h4>Generación diaria · MWh</h4>
            <p class="leg"><span><i class="d"></i>Gas</span><span>Pico día {peak[0].day} · {n(peak[1], 0)} MWh</span><span>G807 entra el 10 · G806 el 22 · G805 el 29</span></p>
          </div>
          <div class="bars">{''.join(bars)}</div>
          <ul class="hlist">
            <li><span>J420</span><b style="width:{j420['kwh'] / fleet_max * 100:.0f}%"></b><em>{n(j420['mwh'], 0)} MWh · {pct(j420['kwh'] / park['kwh'], 0)}</em></li>
            <li><span>J320</span><b class="ok" style="width:{j320['kwh'] / fleet_max * 100:.0f}%"></b><em>{n(j320['mwh'], 0)} MWh · {pct(j320['kwh'] / park['kwh'], 0)}</em></li>
            <li><span>Jinan</span><b style="width:{max(jinan['kwh'] / fleet_max * 100, 2):.0f}%"></b><em>{n(jinan['mwh'], 0)} MWh · {pct(jinan['kwh'] / park['kwh'], 1)}</em></li>
          </ul>
        </div>
        """)

    fail_rows = []
    for e in fallas:
        if e["date"] == date(2026, 10, 21) and e["tag"] == "G804":
            horas_celda = "2 h 32 min"
        elif e["horas"] == 0:
            horas_celda = "0 h"
        else:
            horas_celda = horas(e["horas"])
        fail_rows.append(
            f"<tr class='cop'><td>{e['date'].day:02d}-oct</td><td><b>{esc(e['tag'])}</b></td>"
            f"<td>{esc(e['sistema'])}</td><td>{esc(e['modo'])}</td>"
            f"<td class='rel'>{horas_celda}</td><td>{esc(e['reportada'])}</td></tr>"
        )
    s8 = page(7, f"""
        <h2 class="title">Fallas de octubre</h2>
        <div class="kpis k3">
          {kpi("Número de fallas", n(n_fallas, 0), "análisis de fallas · G807 en seguimiento, no entra", "warn")}
          {kpi("Horas de correctivo", horas(fo_fallas), " · ".join(f"{tag} {horas(sum(horas_evento(e) for e in fallas if e['tag']==tag))}" for tag in ("G801","G802","G803","G804")))}
          {kpi("MTTR", f"{n(mttr, 2)} h", f"{horas(fo_fallas)} de correctivo / {n(n_fallas, 0)} fallas")}
        </div>
        <table class="evt fo wrap"><thead><tr><th>Fecha</th><th>Equipo</th><th>Sistema</th><th>Modo de falla</th><th>Horas</th><th>Falla reportada</th></tr></thead><tbody>
          {''.join(fail_rows)}
        </tbody></table>
        """)

    ejecutados = [r for r in oct_rows if r["pp"] > 0]
    ejecutados.sort(key=lambda r: (r["date"], r["tag"]))
    horas_ejec = sum(r["pp"] for r in ejecutados)
    if len(ejecutados) != mtto_total["ejec"] or abs(horas_ejec - mtto_total["horas_unidades"]) > 0.05:
        raise SystemExit(f"el preventivo del diario no cierra con el plan: {len(ejecutados)} / {horas_ejec}")
    detalle = []
    for r in ejecutados:
        detalle.append(
            f"<tr><td>{r['date'].day:02d}-oct</td><td><b>{esc(label(r['tag']))}</b></td>"
            f"<td>Mantenimiento preventivo</td>"
            f"<td class='rel'>{horas(r['pp'])}</td></tr>"
        )
    cumple_mtto = mtto_total["ejec"] / mtto_total["plan"] if mtto_total["plan"] else 0
    s9 = page(8, f"""
        <h2 class="title">Mantenimiento de octubre</h2>
        <p class="regla">El plan cierra {n(mtto_total['ejec'], 0)} de {n(mtto_total['plan'], 0)}. Cada fila es un preventivo del reporte diario y la suma cierra con las horas de la hoja de indicadores.</p>
        <div class="kpis k4">
          {kpi("Planeados", n(mtto_total["plan"], 0), "G801, G802, G803, G804 y J320-1", "")}
          {kpi("Ejecutados", n(mtto_total["ejec"], 0), "el plan del mes queda cerrado", "ok")}
          {kpi("Cumplimiento", pct(cumple_mtto), "ejecutados / planeados", "ok")}
          {kpi("Horas", horas(horas_ejec), "columna de preventivo del reporte", "blue")}
        </div>
        <table class="evt carga"><thead><tr><th>Fecha</th><th>Equipo</th><th>Actividad ejecutada</th><th>Horas</th></tr></thead><tbody>
          {''.join(detalle)}
          <tr class="bloque"><td colspan="3">Suma</td><td class="rel">{horas(horas_ejec)}</td></tr>
        </tbody></table>
        """)

    ranked = sorted(units, key=lambda u: -u["kwh"])
    emax = ranked[0]["mwh"]
    elis = "".join(
        f'<li><span>{esc(u["name"])}</span><b class="{"ok" if u["mwh"] >= park["mwh"] / len(units) else ""}" style="width:{u["mwh"] / emax * 100:.0f}%"></b><em>{n(u["mwh"], 0)}</em></li>'
        for u in ranked
    )
    ext_units = sorted((u for u in units if u["ext"]), key=lambda u: -u["ext"])
    ext_max = ext_units[0]["ext"]
    ext_bars = "".join(
        f'<li><span>{esc(u["name"])}</span><b class="out" style="width:{u["ext"] / ext_max * 100:.0f}%"></b><em>{horas(u["ext"])}</em></li>'
        for u in ext_units
    )
    ext_notes = []
    for r in oct_rows:
        if r["ext"] <= 0:
            continue
        ext_notes.append(f"{label(r['tag'])} el {r['date'].day}: {short(r['obs'], 72)}")
    mayor = max(carga, key=lambda p: p["kw"])
    carga_por = {p["name"]: p for p in carga}
    filas_carga = []
    for u in units:
        p = carga_por.get(u["name"])
        cls = {"J420": "j420", "J320": "j320", "Jinan": "jin"}[u["model"]]
        if p and p["name"] == mayor["name"] and p["date"] == mayor["date"]:
            cls += " ok"
        if p:
            prueba = (
                f"<td>{p['date'].day:02d}-oct</td>"
                f"<td>{esc(p['gas'])}</td>"
                f"<td class='num'>{n(p['kw'], 0)}</td>"
                f"<td class='num'>{pct(p['kw'] / u['inst'], 0)}</td>"
                f"<td class='num'>{n(p['map'], 2)} bar</td>"
                f"<td class='num'>{n(p['gases'], 0)} °C</td>"
                f"<td class='num'>{n(p['v'], 0)} V</td>"
                f"<td class='num'>{n(p['a'], 0)} A</td>"
                f"<td class='num'>{n(p['hz'], 1) if abs(p['hz'] - round(p['hz'])) >= 0.05 else n(round(p['hz']), 0)} Hz</td>"
                f"<td class='num'>{n(p['fp'], 2)}</td>"
            )
        else:
            prueba = "<td>—</td><td>—</td>" + "<td class='num'>—</td>" * 8
        filas_carga.append(
            f"<tr class='{cls}'><td><b>{esc(u['name'])}</b></td><td>{esc(u['model'])}</td>"
            f"<td class='num'>{n(u['inst'], 0)}</td>"
            f"{prueba}</tr>"
        )
    fotos_modelo = {
        "J420": ("equipo-j420.png", "Jenbacher J420"),
        "J320": ("equipo-j320.png", "Jenbacher J320"),
        "Jinan": ("equipo-jinan.png", "Jinan"),
    }
    origen = ROOT / "data/Acordionero/informes/2026-09"
    tarjetas = []
    for modelo in ("J420", "J320", "Jinan"):
        grupo = [u for u in units if u["model"] == modelo]
        src, titulo = fotos_modelo[modelo]
        foto = origen / src
        if not foto.is_file():
            raise SystemExit(f"falta la foto del modelo: {foto.name}")
        shutil.copyfile(foto, INFORME / src)
        nombres = "".join(f"<li>{esc(u['name'])}</li>" for u in grupo)
        clase = {"J420": "j420", "J320": "j320", "Jinan": "jin"}[modelo]
        tarjetas.append(
            f'<article class="{clase}"><header><h3>{esc(titulo)}</h3>'
            f"<p>Instalada {n(grupo[0]['inst'], 0)} kW</p></header>"
            f'<div class="cuerpo"><img src="{src}" alt="{esc(titulo)}">'
            f'<ul><li class="lab">Equipos</li>{nombres}</ul></div></article>'
        )
    s10 = page(9, f"""
        <h2 class="title">Configuración y pruebas de máxima carga</h2>
        <table class="dash unif"><thead><tr><th>Equipo</th><th>Modelo</th><th class="num">Inst. kW</th><th>Prueba</th><th>Gas</th><th class="num">kW prueba</th><th class="num">%</th><th class="num">MAP</th><th class="num">Gases</th><th class="num">Tensión</th><th class="num">Corriente</th><th class="num">Hz</th><th class="num">FP</th></tr></thead><tbody>
          {''.join(filas_carga)}
        </tbody></table>
        <div class="flota pie">{''.join(tarjetas)}</div>
        """)

    s11 = page(10, f"""
        <h2 class="title">Desempeño energético</h2>
        <div class="kpis k4">
          {kpi("Entrega / día-máquina", f"{n(park['mwh'] / park['n_days'] * 1, 2)} MWh", f"{n(park['n_days'], 0)} días-máquina en servicio", "ok")}
          {kpi("Vs septiembre", f"+{n(mwh_d - sep_d, 1)}", f"MWh/día · cierre GTE {n(sep_d, 1)} → oct {n(mwh_d, 1)}", "ok")}
          {kpi("Campo", f"{n(park['mwh'], 1)} MWh", "100 % gas · 31 días")}
          {kpi("Paradas externas", horas(park['ext']), "no entran en el R% ni en la disponibilidad", "warn")}
        </div>
        <div class="stack">
          <div class="card">
            <h4>Cuánto entregó cada máquina · MWh</h4>
            <ul class="hlist flat">{elis}</ul>
            <p class="regla">J420 {n(j420['kw'], 0)} kW de media en operación · J320 {n(j320['kw'], 0)} kW · Jinan {n(jinan['kw'], 0)} kW. Potencia media del campo {n(park['kw'], 0)} kW.</p>
          </div>
          <div class="card">
            <h4>Paradas externas · no entran en el R%</h4>
            <ul class="hlist flat">{ext_bars}</ul>
            <p class="regla">{esc(' · '.join(ext_notes))}</p>
          </div>
        </div>
        """)

    # Actas escaneadas de Soluciones Ambientales, vehículo CRK-385, Pad 4.
    # Cantidades en kg, leídas de cada formato. El posconsumo queda en blanco.
    residuos = [
        ("02-oct", "0538", 33, 2, 1, 0),
        ("09-oct", "0540", 21, 3, 2, 9),
        ("13-oct", "0541", 46, 1, 0, 0),
        ("19-oct", "0542", 47, 5, 2, 0),
        ("23-oct", "0544", 44, 5, 2, 18),
        ("26-oct", "0545", 36, 3, 1, 7),
        ("30-oct", "0546", 15, 4, 1, 41),
    ]
    def kg(v):
        return "—" if not v else n(v, 0)
    filas_res = []
    for fecha, acta, ordinario, carton, plastico, peligro in residuos:
        filas_res.append(
            f"<tr><td>{fecha}</td><td>{acta}</td><td class='num'>{kg(ordinario)}</td>"
            f"<td class='num'>{kg(carton)}</td><td class='num'>{kg(plastico)}</td>"
            f"<td class='num'>{kg(peligro)}</td></tr>"
        )
    tot = [sum(r[i] for r in residuos) for i in range(2, 6)]
    fotos = []
    for nombre, pie in HSE_FOTOS:
        ruta = HSE / nombre
        if not ruta.is_file():
            raise SystemExit(f"falta la foto HSE: {ruta.name}")
        fotos.append(
            f'<figure><img src="HSE/{quote(nombre)}" alt="{esc(pie)}"><figcaption>{esc(pie)}</figcaption></figure>'
        )
    s12 = page(11, f"""
        <h2 class="title">SHE de octubre</h2>
        <p class="regla">Seguridad, salud en el trabajo y medio ambiente en Pad 4.</p>
        <div class="she">
          <ol>
            <li><strong>Capacitación en requisitos legales</strong> de seguridad y salud en el trabajo y medio ambiente (SSTA).</li>
            <li><strong>Inspecciones mensuales</strong> de botiquín, extintores, instalaciones eléctricas, áreas operativas y SST.</li>
            <li><strong>Charlas diarias preturno.</strong></li>
            <li><strong>Inspecciones preoperacionales</strong> de equipos y herramientas.</li>
            <li><strong>Jornadas de orden y aseo</strong> (housekeeping) en bodega y áreas operativas.</li>
            <li><strong>Separación en la fuente</strong> y clasificación de residuos.</li>
          </ol>
          <div class="fotos">{''.join(fotos)}</div>
        </div>
        """)
    s12b = page(12, f"""
        <h2 class="title">Residuos de octubre</h2>
        <p class="regla">Siete recolecciones de Soluciones Ambientales en Pad 4, vehículo CRK-385.</p>
        <div class="kpis k4">
          {kpi("Recolecciones", "7", "siete actas del mes", "")}
          {kpi("No peligrosos", f"{n(tot[0] + tot[1] + tot[2], 0)} kg", "ordinario, cartón y plástico", "ok")}
          {kpi("Peligrosos", f"{n(tot[3], 0)} kg", "lanillas, eslingas, EPP y filtro", "warn")}
          {kpi("Total", f"{n(sum(tot), 0)} kg", "no peligrosos y peligrosos", "blue")}
        </div>
        <table class="evt residuos"><thead><tr><th>Fecha</th><th>Acta</th><th class="num">Ordinario</th><th class="num">Cartón</th><th class="num">Plástico</th><th class="num">Peligrosos</th></tr></thead><tbody>
          {''.join(filas_res)}
          <tr class="bloque"><td colspan="2">Total kg</td><td class="num">{n(tot[0], 0)}</td><td class="num">{n(tot[1], 0)}</td><td class="num">{n(tot[2], 0)}</td><td class="num">{n(tot[3], 0)}</td></tr>
        </tbody></table>
        <p class="regla">Los peligrosos suman lanillas 31 kg, eslingas 25 kg, EPP 11 kg y filtro de aire 8 kg.</p>
        """)

    s13 = page(13, f"""
        <h2 class="title">Conclusiones</h2>
        <ol class="conc tight">
          <li><strong>Disponibilidad y confiabilidad pasan 98 %. La frecuencia no.</strong> Operacional: {pct(n1['disp'])} y {pct(n1['r'])}. Probabilístico: {pct(n1p['disp'])} y {pct(n1p['r'])}, frente a {pct(gte['disp_p'])} y {pct(gte['rel_p'])} de septiembre. El análisis cuenta {n(n_fallas, 0)} fallas, sin G807. Desde 8 el bloque queda en condición crítica. Septiembre cerró en {n(gte['fails'], 0)}.</li>
          <li><strong>G804 queda bajo 98 % solo como máquina.</strong> Cierra en {pct(by['G804']['disp'])}, con confiabilidad {pct(by['G804']['r'])}. Suma {horas(by['G804']['pp'])} de preventivo y {horas(by['G804']['fo'])} de correctivo. Por frecuencia queda en deterioro. Esas horas encuentran el respaldo disponible.</li>
          <li><strong>G807 no entra al conteo.</strong> Es máquina nueva y está en seguimiento. El análisis la deja fuera. Las 14 fallas quedan en G803 ({n(by['G803']['fails'], 0)}), G802 ({n(by['G802']['fails'], 0)}), G804 ({n(by['G804']['fails'], 0)}) y G801 ({n(by['G801']['fails'], 0)}).</li>
          <li><strong>El respaldo aguanta el mes.</strong> J320-1 no tiene fallas y suma {horas(spare['sb'])} en stand-by. Su preventivo, {horas(spare['pp'])} el 26, cae en un día sin J420 indisponible. G801 queda en desviación, con {pct(by['G801']['disp'])}. G802 y G803 quedan en grave, con {pct(by['G802']['disp'])} y {pct(by['G803']['disp'])}.</li>
          <li><strong>La energía sube frente al cierre GTE de septiembre.</strong> El ritmo pasa de {n(sep_d, 1)} a {n(mwh_d, 1)} MWh/día, {n(delta * 100, 1)} % más. Septiembre publicó {n(gte['mwh'], 1)} MWh. El pico es el día {peak[0].day}, con {n(peak[1], 0)} MWh.</li>
          <li><strong>El plan de mantenimiento cierra completo.</strong> {n(mtto_total['ejec'], 0)} de {n(mtto_total['plan'], 0)}. Las unidades suman {horas(mtto_total['horas_unidades'])}: G804 {horas(next(m['horas'] for m in mtto if m['name']=='G804'))} y J320-1 {horas(next(m['horas'] for m in mtto if m['name']=='J320-1'))}. Las paradas externas, {horas(park['ext'])}, no entran al R%.</li>
        </ol>
        """)
    return s1 + s2 + s4 + s5 + s6 + s7 + s8 + s9 + s10 + s11 + s12 + s12b + s13


def main():
    wb = openpyxl.load_workbook(REPORTE, data_only=True)
    oct_rows = load_sheet(wb, "Octubre", 20)
    aplicar_parada_g804(oct_rows)
    wb.close()
    gte = gte_septiembre()
    days = sorted({r["date"] for r in oct_rows})
    if days[0] != date(2026, 10, 1) or days[-1] != date(2026, 10, 31) or len(days) != 31:
        raise SystemExit(f"octubre no cierra 01–31: {days[0]} → {days[-1]}")
    for r in oct_rows:
        if not r["live"]:
            continue
        total = r["op"] + r["sb"] + r["pp"] + r["fo"] + r["ext"]
        if abs(total - 24) > 0.2:
            raise SystemExit(f"día que no cierra en 24 h: {r['date']} {r['tag']} {total}")
    fuels = {r["fuel"] for r in oct_rows if r["fuel"]}
    if fuels != {"Gas"}:
        raise SystemExit(f"combustibles no esperados: {fuels}")
    units = build_units(oct_rows)
    park = pack(oct_rows)
    fleets = {
        name: pack([r for r in oct_rows if fleet_of(r["model"]) == name])
        for name in ("J420", "J320", "Jinan")
    }
    if abs(park["kwh"] - 4_467_154) > 1:
        raise SystemExit(f"energía octubre {park['kwh']}")
    fallas = load_fallas()
    mtto, mtto_total = load_mtto()
    carga = load_carga()
    fo_esperado = 16 - 7 + FO_G804_21
    if abs(park["fails"] - 22) > 0.01 or abs(park["fo"] - fo_esperado) > 0.02:
        raise SystemExit(f"fallas {park['fails']} fo {park['fo']}")

    text = OUT.read_text(encoding="utf-8")
    head, sep, rest = text.partition("<body>")
    if not sep:
        raise SystemExit("no se encontró <body>")
    head = re.sub(
        r"<title>.*?</title>",
        "<title>Indicadores COPOWER ACRD · Octubre 2026 GTE</title>",
        head,
        count=1,
    )
    extra = """
    td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
    td.num { font-weight: 700; color: #1E3A5F; }
    ol.conc.tight { gap: 0.09in; justify-content: flex-start; }
    ol.conc.tight li { font-size: 13pt; line-height: 1.22; }
    ol.conc.tight strong { font-size: 14.5pt; }
    table.dash th, table.dash td { font-size: 7.2pt; padding: 1px 3px; }
    """
    if "ol.conc.tight" not in head:
        head = head.replace("</style>", extra + "</style>", 1)
    elif "table.dash" not in head:
        head = head.replace(
            "</style>",
            "    table.dash th, table.dash td { font-size: 7.2pt; padding: 1px 3px; }\n</style>",
            1,
        )
    if "</style>" not in head:
        head = head.replace("</head>", "</style></head>", 1)
    head = head.replace(
        "table.unif th, table.unif td { font-size: 6.6pt; padding: 1px 2px; }",
        "table.unif { flex: 1 1 auto; }\n    table.unif th, table.unif td { font-size: 9pt; padding: 4px 5px; vertical-align: middle; }",
    )
    head = head.replace(
        "table.unif th, table.unif td { font-size: 6.2pt; padding: 1px 2px; }",
        "table.unif { flex: 1 1 auto; }\n    table.unif th, table.unif td { font-size: 9pt; padding: 4px 5px; vertical-align: middle; }",
    )
    if "table.unif" not in head:
        head = head.replace(
            "</style>",
            "    table.unif th, table.unif td { font-size: 6.6pt; padding: 1px 2px; }\n    table.unif th { line-height: 1.1; }\n</style>",
            1,
        )
    llena = """
    .pad { box-sizing: border-box; padding-bottom: 0.42in; }
    .pad > table.dash:not(.unif),
    .pad > table.mto,
    .pad > table.evt { flex: 1 1 auto; }
    .pad > table.dash:not(.unif) td,
    .pad > table.mto td,
    .pad > table.evt td { vertical-align: middle; }
    .pad > .stack,
    .pad > .card { flex: 1 1 auto; min-height: 0; }
    .stack > .card { flex: 1 1 auto; min-height: 0; }
    .card > .hlist { flex: 1; justify-content: space-around; }
    .flota.pie { flex: 0 0 auto; margin-top: 0.06in; }
    .flota.pie article { display: block; }
    .flota.pie header { padding: 3px 6px 2px; }
    .flota.pie h3 { font-size: 10pt; }
    .flota.pie .cuerpo { grid-template-columns: 1.4fr 1.05in; align-items: center; }
    .flota.pie img { height: 0.98in; width: 100%; object-fit: contain; }
    .flota.pie ul { display: grid; grid-template-columns: 1fr 1fr; }
    .flota.pie li.lab { grid-column: 1 / -1; }
    .flota.pie li { font-size: 8pt; line-height: 1.25; }
"""
    head = head.replace(
        """    .flota.pie { margin-top: auto; }
    .flota.pie img { height: 0.92in; }
    .flota.pie header { padding: 3px 6px 2px; }
    .flota.pie h3 { font-size: 10pt; }
    .flota.pie .cuerpo { grid-template-columns: 1fr 1.15in; align-items: center; }
    .flota.pie ul { display: grid; grid-template-columns: 1fr 1fr; }
    .flota.pie li.lab { grid-column: 1 / -1; }
    .flota.pie li { font-size: 7.5pt; line-height: 1.25; }""",
        llena.strip("\n"),
    )
    head = head.replace(
        ".pad { box-sizing: border-box; padding-bottom: 0.26in; }",
        ".pad { box-sizing: border-box; padding-bottom: 0.42in; }",
    )
    head = head.replace(
        """    .flota.pie { flex: 1 1 auto; min-height: 0; margin-top: 0.08in; }
    .flota.pie article { display: flex; flex-direction: column; min-height: 0; }
    .flota.pie header { padding: 3px 6px 2px; }
    .flota.pie h3 { font-size: 11pt; }
    .flota.pie .cuerpo { flex: 1; min-height: 0; grid-template-columns: 1fr 1.15in; align-items: center; }""",
        """    .flota.pie { flex: 0 0 auto; margin-top: 0.06in; }
    .flota.pie article { display: block; }
    .flota.pie header { padding: 3px 6px 2px; }
    .flota.pie h3 { font-size: 10pt; }
    .flota.pie .cuerpo { grid-template-columns: 1.4fr 1.05in; align-items: center; }""",
    )
    head = head.replace(
        ".flota.pie .cuerpo { grid-template-rows: 1fr; }\n    .flota.pie img { height: 100%; width: 100%; max-height: 100%; object-fit: contain; object-position: center; }",
        ".flota.pie img { height: 0.98in; width: 100%; object-fit: contain; }",
    )
    if ".duo" not in head:
        head = head.replace(
            "</style>",
            """
    .duo { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .duo .trend { min-height: 0; }
    .leg i.s { background: #0f766e; height: 8px; }
</style>
""",
            1,
        )
    if ".pad > table.evt" not in head:
        head = head.replace("</style>", llena + "</style>", 1)
    if "table.carga" not in head:
        head = head.replace(
            "</style>",
            "    table.carga th, table.carga td { font-size: 8pt; padding: 2px 4px; }\n</style>",
            1,
        )
    head = head.replace(
        """    .she { grid-template-columns: 1.05fr 0.95fr; }
    .she li { font-size: 12.5pt; line-height: 1.28; }""",
        """    .she { grid-template-columns: 1.05fr 0.95fr; }
    .she ol { justify-content: flex-start; gap: 0.16in; }
    .she li { font-size: 12.5pt; line-height: 1.28; }""",
    )
    head = head.replace(
        """    .she { grid-template-columns: 0.92fr 1.08fr; }
    .she li { font-size: 10.5pt; }
    table.residuos th, table.residuos td { font-size: 8pt; padding: 2px 4px; }
    table.residuos { width: 100%; border-collapse: collapse; }""",
        """    .she { grid-template-columns: 1.05fr 0.95fr; }
    .she ol { justify-content: flex-start; gap: 0.16in; }
    .she li { font-size: 12.5pt; line-height: 1.28; }
    table.evt.residuos th { font-size: 9pt; padding: 8px 12px; }
    table.evt.residuos td { font-size: 13pt; padding: 8px 12px; }""",
    )
    if "table.evt.residuos" not in head:
        head = head.replace(
            "</style>",
            """
    .she { grid-template-columns: 1.05fr 0.95fr; }
    .she ol { justify-content: flex-start; gap: 0.16in; }
    .she li { font-size: 12.5pt; line-height: 1.28; }
    table.evt.residuos th { font-size: 9pt; padding: 8px 12px; }
    table.evt.residuos td { font-size: 13pt; padding: 8px 12px; }
</style>
""",
            1,
        )
    if ".she {" not in head:
        head = head.replace(
            "</style>",
            """
    .she { flex: 1; min-height: 0; display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 0.14in; }
    .she ol { margin: 0; padding: 0 0 0 1.15em; display: flex; flex-direction: column; justify-content: space-between; }
    .she li { font-size: 12pt; line-height: 1.22; color: #243044; }
    .she strong { color: #1E3A5F; }
    .she .fotos { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 5px; min-height: 0; }
    .she figure { margin: 0; position: relative; overflow: hidden; border-radius: 4px; background: #0f172a; min-height: 0; }
    .she img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .she figcaption { position: absolute; left: 0; right: 0; bottom: 0; padding: 3px 6px; background: rgb(15 23 42 / 72%); color: #fff; font-size: 8pt; line-height: 1.15; }
</style>
""",
            1,
        )
    script = """
      <script>
      function fitSlides() {
        var s = Math.min(1, (window.innerWidth - 16) / (10 * 96));
        document.querySelectorAll(".slide").forEach(function (el) { el.style.zoom = String(s); });
      }
      addEventListener("resize", fitSlides);
      fitSlides();
      </script>"""
    OUT.write_text(
        head + "<body>" + render(oct_rows, gte, units, park, fleets, fallas, mtto, mtto_total, carga) + script + "</body></html>",
        encoding="utf-8",
    )
    n1 = n1_system(oct_rows)
    n1p = n1_prob(units)
    print(
        f"mwh {park['mwh']:.1f} n1 disp {n1['disp']*100:.2f} R {n1['r']*100:.2f} "
        f"prob {n1p['disp']*100:.2f}/{n1p['r']*100:.2f} "
        f"down {n1['down_d']:.2f}/{n1['down_r']:.2f} peak {n1['peak']:.2f} "
        f"j420 {fleets['J420']['disp']*100:.2f} fails {park['fails']:.0f}"
    )
    print(OUT)


if __name__ == "__main__":
    main()
