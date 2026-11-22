#!/usr/bin/env python3
"""Presentación de indicadores PUTN · septiembre 2026 (cierre 01–30).

Horas: consolidado 01–30. Mantenimiento: sábana de septiembre.
Inventario: bodega Costayaco al 16-sep. HSE: semanas 07–12, 14–19 y 21–26.
"""
from __future__ import annotations

import base64
import html
import re
from collections import defaultdict
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
XLSX = ROOT / "data/Costayaco/concertacion/2026-09/Consolidado de horas concertadas del 01 al 30 de Septiembre 2026.xlsx"
SABANA = ROOT / "data/Costayaco/Mantenimiento/sabana/2026-09/SABANA MMTOS GEN PUTUMAYO 1 (1).xlsx"
INVENTARIO = ROOT / "data/Costayaco/inventarios/2026-09/INVENTARIO FINAL BODEGA COSTAYACO Cuaspud 16-09-2026.xlsx"
BG = ROOT / "public/informe-chrome/slide-bg.png"
BG_SRC = "data:image/png;base64," + base64.b64encode(BG.read_bytes()).decode("ascii")
OUT_HTML = ROOT / "data/Costayaco/informes/2026-09/indicadores-septiembre-2026.html"
SABANA_UNITS = {
    4: "CPW-02", 6: "CPW-01", 8: "CPW-03", 10: "CPW-04", 12: "CPW-05", 14: "CPW-06",
    16: "CPW-07", 18: "CPW-10", 20: "CPW-11", 22: "CPW-12", 24: "JIN-01", 26: "JIN-02",
}

# kpi.availability y kpi.generationMwh de COPOWER_MONTHLY_DATA (la serie que dibuja el informe de agosto).
TREND_HIST = [
    ("Feb", 0.970358, 3401.23, 28),
    ("Mar", 0.961564, 3484.83, 31),
    ("Abr", 0.982099, 3392.09, 30),
    ("May", 0.986225, 3781.66, 31),
    ("Jun", 0.987238, 4236.56, 30),
    ("Jul", 0.977332, 4131.917, 31),
    ("Ago", 0.991379, 4424.562, 31),
]
# R% = (Σ horas calendario − Σ PF CoPower) / Σ horas calendario.
# Parque de gas del reporte diario, sin diésel (G101V, G102J, G102K).
REL_HIST = [
    ("Feb", (6695 - 104) / 6695),
    ("Mar", (7320 - 69) / 7320),
    ("Abr", (6192 - 7) / 6192),
    ("May", (6727 - 4) / 6727),
    ("Jun", (8166 - 11) / 8166),
    ("Jul", 1.0),
    ("Ago", 1.0),
]
AGO = {
    "mwh": 4424.6,
    "mwh_d": 142.7,
    "gas_mwh": 4209.4,
    "diesel_mwh": 215.2,
    "disp": 0.9914,
    "days": 31,
    "kw": 554,
}
META = 0.98
META_VONU = 0.90
ALIAS = {
    "CPW-01": "CPW01", "CPW-02": "CPW02", "CPW-03": "CPW03", "CPW-04": "CPW04",
    "CPW-05": "CPW05", "CPW-06": "CPW06", "CPW-07": "CPW07",
    "CPW-10": "JIN-10", "CPW-11": "JIN-11", "CPW-12": "JIN-12",
    "JIN-01": "JIN-01", "JIN-02": "JIN-02",
}


def n(v, d=0):
    if v is None:
        return "—"
    s = f"{v:,.{d}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def pct(v, d=2):
    return "—" if v is None else f"{n(v * 100, d)} %"


def esc(s):
    return html.escape(str(s), quote=True)


def fleet_of(model):
    m = str(model or "").upper()
    if m in {"J320", "J420"}:
        return "Jenbacher"
    if m == "JINAN":
        return "Jinan"
    return "Otro"


def cause(obs, pp, fo, tag="", date=None):
    t = (obs or "").lower()
    if (
        tag == "CPW-07"
        and date is not None
        and "2026-09-07" <= date.isoformat() <= "2026-09-22"
        and fo == 0
        and pp == 0
    ):
        return "Pruebas"
    if re.search(r"banco de (carga|pruebas)|comisionamiento|gas glp|propan|equipo en pruebas", t):
        return "Pruebas"
    if re.search(r"deton", t):
        return "Detonación"
    if re.search(r"mru", t):
        return "MRU"
    if re.search(r"moqueta|\bmqt\b", t):
        return "Moqueta"
    if re.search(r"presi", t):
        return "Presión"
    if re.search(r"mantenim|prevent", t):
        return "MTO"
    if re.search(r"\bccm\b", t):
        return "CCM"
    if pp > 0:
        return "MTO"
    if fo > 0:
        return "FO sin nota"
    if t:
        return "Otro"
        return "Sin nota"


def cubic(xs, ys):
    d = f"M {xs[0]:.1f} {ys[0]:.1f}"
    for i in range(len(xs) - 1):
        mx = (xs[i] + xs[i + 1]) / 2
        d += f" C {mx:.1f} {ys[i]:.1f}, {mx:.1f} {ys[i + 1]:.1f}, {xs[i + 1]:.1f} {ys[i + 1]:.1f}"
    return d


def load():
    wb = openpyxl.load_workbook(XLSX, data_only=True, read_only=True)
    rows = []
    for r in list(wb.active.iter_rows(values_only=True))[1:]:
        if not r or r[0] is None:
            continue
        op, sb, pp, fo = (r[12] or 0), (r[13] or 0), (r[14] or 0), (r[15] or 0)
        rows.append({
            "date": r[0].date(), "campo": str(r[2]).strip(), "model": str(r[4]).strip(),
            "tag": str(r[5]).strip(), "op": op, "sb": sb, "pp": pp, "fo": fo,
            "ext": r[17] or 0, "fails": r[18] or 0, "kwh": r[10] or 0,
            "obs": (str(r[24]).strip() if r[24] else ""),
            "gap": 24 - (op + sb + pp + fo),
        })
    return rows


def aggregate(rows):
    units = {}
    for r in rows:
        u = units.setdefault(r["tag"], {
            "tag": r["tag"], "name": ALIAS.get(r["tag"], r["tag"]), "campo": r["campo"],
            "model": r["model"], "fleet": fleet_of(r["model"]),
            "op": 0, "sb": 0, "pp": 0, "fo": 0, "ext": 0, "kwh": 0, "fails": 0, "gap": 0, "days": 0,
        })
        for k in ("op", "sb", "pp", "fo", "ext", "kwh", "fails", "gap"):
            u[k] += r[k]
        u["days"] += 1
    days = sorted({r["date"] for r in rows})
    t_unit = len(days) * 24
    for u in units.values():
        u["cal"] = t_unit
        u["disp"] = (u["op"] + u["sb"]) / t_unit
        u["a"] = (t_unit - u["pp"] - u["fo"]) / t_unit
        u["r"] = (t_unit - u["fo"]) / t_unit
        u["meta"] = META if u["campo"] == "COSTAYACO" else META_VONU
        u["kw"] = u["kwh"] / u["op"] if u["op"] else 0
    order = {"Jenbacher": 0, "Jinan": 1}
    return days, sorted(units.values(), key=lambda u: (u["campo"] != "COSTAYACO", order.get(u["fleet"], 9), u["tag"]))


def pack(units, pred):
    sel = [u for u in units if pred(u)]
    cal = sum(u["cal"] for u in sel)
    op = sum(u["op"] for u in sel)
    sb = sum(u["sb"] for u in sel)
    pp = sum(u["pp"] for u in sel)
    fo = sum(u["fo"] for u in sel)
    ext = sum(u["ext"] for u in sel)
    kwh = sum(u["kwh"] for u in sel)
    return {
        "n": len(sel), "cal": cal, "op": op, "sb": sb, "pp": pp, "fo": fo, "ext": ext, "kwh": kwh,
        "disp": (op + sb) / cal, "a": (cal - pp - fo) / cal, "r": (cal - fo) / cal,
        "uso": op / (op + sb) if op + sb else None, "kw": kwh / op if op else None,
    }


def build():
    rows = load()
    days, units = aggregate(rows)
    park, cyc, von = pack(units, lambda u: True), pack(units, lambda u: u["campo"] == "COSTAYACO"), pack(units, lambda u: u["campo"] == "VONU")
    jen, jin = pack(units, lambda u: u["fleet"] == "Jenbacher"), pack(units, lambda u: u["fleet"] == "Jinan")
    kw = {u["tag"]: u["kw"] for u in units}
    ndays = len(days)
    mwh = park["kwh"] / 1000
    daily = defaultdict(lambda: {"kwh": 0.0, "bit": 0, "mru": 0, "resto": 0})
    ext_by, bit_by, resto_by = defaultdict(float), defaultdict(int), defaultdict(int)
    fo_events = []
    mru_ext = mru_lost_h = mru_lost_kwh = 0.0
    for r in rows:
        k = cause(r["obs"], r["pp"], r["fo"], r["tag"], r["date"])
        d = daily[r["date"]]
        d["kwh"] += r["kwh"]
        if r["obs"]:
            d["bit"] += 1
            bit_by[k if k != "Sin nota" else "Otro"] += 1
            if k == "MRU":
                d["mru"] += 1
            if k not in ("MRU", "Moqueta"):
                d["resto"] += 1
                resto_by[ALIAS.get(r["tag"], r["tag"])] += 1
        if r["ext"]:
            ext_by[k] += r["ext"]
        if k == "MRU":
            mru_ext += r["ext"]
            down = max(r["gap"], 0) + r["fo"]
            mru_lost_h += down
            mru_lost_kwh += down * kw.get(r["tag"], 0)
        if r["fo"] > 0:
            fo_events.append(r)
    fo_doc = [r for r in fo_events if r["obs"] and abs(r["gap"]) < 0.01]
    fo_bad = [r for r in fo_events if r not in fo_doc]
    gen_days = [(d, daily[d]["kwh"] / 1000) for d in days]
    trend = [{"month": m, "disp": dv, "gen": gw / dd, "partial": False} for m, dv, gw, dd in TREND_HIST]
    trend.append({"month": "Sep", "disp": park["disp"], "gen": mwh / ndays, "partial": False})
    cpw03 = next(u for u in units if u["tag"] == "CPW-03")
    return {
        "days": days, "ndays": ndays, "units": units, "park": park, "cyc": cyc, "von": von,
        "jen": jen, "jin": jin, "mwh": mwh, "mwh_d": mwh / ndays,
        "gas_ago_d": AGO["gas_mwh"] / AGO["days"],
        "ready": park["op"] + park["sb"],
        "ledger": park["op"] + park["sb"] + park["pp"] + park["fo"],
        "gap": park["cal"] - (park["op"] + park["sb"] + park["pp"] + park["fo"]),
        "cyc_a_sin_03": (cyc["cal"] - (cyc["pp"] - cpw03["pp"]) - cyc["fo"]) / cyc["cal"],
        "off_a": [u for u in units if u["a"] < u["meta"]],
        "off_d": [u for u in units if u["disp"] < u["meta"]],
        "fails_n": sum(u["fails"] for u in units),
        "gen_days": gen_days,
        "peak": max(gen_days, key=lambda x: x[1]),
        "valle": min(gen_days, key=lambda x: x[1]),
        "top3_share": sum(u["kwh"] for u in sorted(units, key=lambda u: -u["kwh"])[:3]) / park["kwh"],
        "fo_doc": fo_doc, "fo_bad": fo_bad,
        "fo_doc_h": sum(r["fo"] for r in fo_doc),
        "mtbf": park["op"] / len(fo_doc), "mttr": sum(r["fo"] for r in fo_doc) / len(fo_doc),
        "ext_by": ext_by, "bit_by": bit_by, "resto_by": resto_by,
        "ext_pruebas": ext_by.get("Pruebas", 0),
        "ext_cpw07": sum(r["ext"] for r in rows if r["tag"] == "CPW-07" and cause(r["obs"], r["pp"], r["fo"], r["tag"], r["date"]) == "Pruebas"),
        "bit_n": sum(1 for r in rows if r["obs"]),
        "bit_mru": sum(1 for r in rows if r["obs"] and cause(r["obs"], r["pp"], r["fo"], r["tag"], r["date"]) == "MRU"),
        "cpw03": cpw03, "daily": daily, "trend": trend,
        "mru_ext": mru_ext, "mru_lost_h": mru_lost_h, "mru_lost_kwh": mru_lost_kwh,
        "pf_if": max(0, park["ext"] - mru_ext),
        "sabana": load_sabana(),
        "inventario": load_inventario(),
    }


def load_sabana():
    wb = openpyxl.load_workbook(SABANA, data_only=True, read_only=True)
    ws = wb["GENERACIÓN PUTUMAYO"]
    jobs = []
    for r in ws.iter_rows(min_row=247, max_row=276, max_col=28, values_only=True):
        date = r[2]
        if not hasattr(date, "date"):
            continue
        for idx, name in SABANA_UNITS.items():
            code, hours = r[idx], r[idx + 1]
            if isinstance(code, (int, float)) and isinstance(hours, (int, float)) and hours:
                jobs.append({"date": date.date(), "unit": name, "code": int(code), "hours": float(hours)})
    wb.close()
    return jobs


def load_inventario():
    wb = openpyxl.load_workbook(INVENTARIO, data_only=True, read_only=True)
    ws = wb["Hoja1"]
    items = []
    for r in ws.iter_rows(min_row=4, values_only=True):
        code, desc, stock = r[1], r[2], r[6]
        if desc is None or str(desc).strip() == "":
            continue
        try:
            qty = float(stock) if stock not in (None, "") else None
        except (TypeError, ValueError):
            qty = None
        items.append({"code": str(code or "").strip(), "desc": str(desc).strip(), "stock": qty})
    wb.close()
    counted = [i for i in items if i["stock"] is not None]
    zeros = [i for i in counted if i["stock"] == 0 and not i["desc"].lower().startswith("material")]
    return {"n": len(counted), "zeros": zeros, "low": sum(1 for i in counted if i["stock"] is not None and 0 < i["stock"] <= 2)}


def kpi(label, value, note, tone=""):
    return f'<article class="{tone}"><span>{esc(label)}</span><strong>{value}</strong><small>{note}</small></article>'


def frac(num, den, after):
    return f'<div class="frac-row"><div class="frac"><b>{num}</b><i></i><b>{den}</b></div><em>{after}</em></div>'


def trend_svg(points):
    w, h = 860, 280
    pad = {"l": 8, "r": 10, "t": 16, "b": 22}
    iw, ih = w - pad["l"] - pad["r"], h - pad["t"] - pad["b"]
    disps = [p["disp"] for p in points]
    gens = [p["gen"] for p in points]
    d_min, d_max = min(META - 0.04, min(disps)), 1.0
    g_min, g_max = min(gens) * 0.92, max(gens) * 1.06
    xs = [pad["l"] + i / (len(points) - 1) * iw for i in range(len(points))]

    def y_d(v):
        return pad["t"] + ih - (v - d_min) / (d_max - d_min) * ih

    def y_g(v):
        return pad["t"] + ih - (v - g_min) / (g_max - g_min) * ih

    dys = [y_d(p["disp"]) for p in points]
    gys = [y_g(p["gen"]) for p in points]
    meta_y = y_d(META)
    area = f"{cubic(xs, dys)} L {xs[-1]:.1f} {pad['t'] + ih:.1f} L {xs[0]:.1f} {pad['t'] + ih:.1f} Z"
    dots = []
    labels = []
    for i, p in enumerate(points):
        r = 4.2 if p["partial"] else 3.2
        dots.append(f'<circle cx="{xs[i]:.1f}" cy="{dys[i]:.1f}" r="{r}" fill="#1E3A5F"/>')
        dots.append(f'<circle cx="{xs[i]:.1f}" cy="{gys[i]:.1f}" r="{3.6 if p["partial"] else 2.8}" fill="#C0392B"/>')
        labels.append(f'<text x="{xs[i]:.1f}" y="{h - 6}" text-anchor="middle" font-size="11" fill="#64748b" font-family="Arial">{esc(p["month"])}</text>')
    corte = f'<text x="{xs[-1] - 8:.1f}" y="12" text-anchor="end" font-size="10" font-weight="700" fill="#1E3A5F" font-family="Arial">cierre 01–30</text>'
    return f'''<svg viewBox="0 0 {w} {h}" width="100%" height="100%" role="img">
      <line x1="{pad["l"]}" y1="{meta_y:.1f}" x2="{w - pad["r"]}" y2="{meta_y:.1f}" stroke="#94a3b8" stroke-dasharray="4 4" stroke-width="1.2"/>
      <path d="{area}" fill="rgb(30 58 95 / 12%)"/>
      <path d="{cubic(xs, gys)}" fill="none" stroke="#C0392B" stroke-width="2.2"/>
      <path d="{cubic(xs, dys)}" fill="none" stroke="#1E3A5F" stroke-width="2.4"/>
      {''.join(dots)}{corte}{''.join(labels)}
    </svg>'''


def rel_svg(hist, sep_r, color="#0f766e", fill="rgb(15 118 110 / 12%)", lo=0.975, hi=1.004, ticks=(0.98, 1.0)):
    """Curva Feb–Sep. hist: (mes, fracción). sep_r es el cierre del mes."""
    points = [{"month": m, "r": r, "now": False} for m, r in hist]
    points.append({"month": "Sep", "r": sep_r, "now": True})
    w, h = 860, 156
    pad = {"l": 42, "r": 14, "t": 14, "b": 20}
    iw, ih = w - pad["l"] - pad["r"], h - pad["t"] - pad["b"]
    xs = [pad["l"] + i / (len(points) - 1) * iw for i in range(len(points))]

    def y_at(v):
        return pad["t"] + ih - (v - lo) / (hi - lo) * ih

    ys = [y_at(p["r"]) for p in points]
    meta_y = y_at(META)
    area = f"{cubic(xs, ys)} L {xs[-1]:.1f} {pad['t'] + ih:.1f} L {xs[0]:.1f} {pad['t'] + ih:.1f} Z"
    grid = []
    for tick in ticks:
        yy = y_at(tick)
        grid.append(f'<line x1="{pad["l"]}" y1="{yy:.1f}" x2="{w - pad["r"]}" y2="{yy:.1f}" stroke="#e8eef4"/>')
        grid.append(f'<text x="{pad["l"] - 6}" y="{yy + 3:.1f}" text-anchor="end" font-size="9" fill="#94a3b8" font-family="Arial">{n(tick * 100, 0)} %</text>')
    dots = []
    labels = []
    tags = []
    for i, p in enumerate(points):
        below = (hi - p["r"]) / (hi - lo) < 0.28
        anchor = "start" if i == 0 else ("end" if i == len(points) - 1 else "middle")
        ty = ys[i] + 13 if below else ys[i] - 7
        dots.append(f'<circle cx="{xs[i]:.1f}" cy="{ys[i]:.1f}" r="{4.2 if p["now"] else 3.2}" fill="{color}"/>')
        labels.append(f'<text x="{xs[i]:.1f}" y="{h - 5}" text-anchor="middle" font-size="11" fill="#64748b" font-family="Arial">{esc(p["month"])}</text>')
        tags.append(
            f'<text x="{xs[i]:.1f}" y="{ty:.1f}" text-anchor="{anchor}" font-size="10" font-weight="700" fill="{color}" font-family="Arial">{n(p["r"] * 100, 2)} %</text>'
        )
    return f'''<svg viewBox="0 0 {w} {h}" width="100%" height="100%" role="img">
      {''.join(grid)}
      <line x1="{pad["l"]}" y1="{meta_y:.1f}" x2="{w - pad["r"]}" y2="{meta_y:.1f}" stroke="#94a3b8" stroke-dasharray="4 4" stroke-width="1.2"/>
      <path d="{area}" fill="{fill}"/>
      <path d="{cubic(xs, ys)}" fill="none" stroke="{color}" stroke-width="2.4"/>
      {''.join(dots)}{''.join(tags)}{''.join(labels)}
    </svg>'''


def event_svg(days_rows):
    """days_rows: list of (day:int, bit:int, mru:int) covering every calendar day."""
    w, h = 860, 132
    pad = {"l": 22, "r": 8, "t": 18, "b": 18}
    iw, ih = w - pad["l"] - pad["r"], h - pad["t"] - pad["b"]
    last = len(days_rows) - 1
    mx = max(max(b, m) for _, b, m in days_rows)
    mx = max(mx, 1)
    avg = sum(b for _, b, _ in days_rows) / len(days_rows)
    xs = [pad["l"] + i / last * iw for i in range(len(days_rows))]

    def y_at(v):
        return pad["t"] + ih - v / mx * ih

    ys = [y_at(b) for _, b, _ in days_rows]
    mys = [y_at(m) for _, _, m in days_rows]
    has_mru = any(m for _, _, m in days_rows)
    peak_i = max(range(len(days_rows)), key=lambda i: days_rows[i][2] if has_mru else days_rows[i][1])
    area = f"{cubic(xs, ys)} L {xs[-1]:.1f} {pad['t'] + ih:.1f} L {xs[0]:.1f} {pad['t'] + ih:.1f} Z"
    ticks = sorted({0, round(mx / 2), mx})
    grid = []
    for t in ticks:
        grid.append(f'<line x1="{pad["l"]}" y1="{y_at(t):.1f}" x2="{w - pad["r"]}" y2="{y_at(t):.1f}" stroke="#e8eef4"/>')
        grid.append(f'<text x="{pad["l"] - 4}" y="{y_at(t) + 3:.1f}" text-anchor="end" font-size="9" fill="#94a3b8" font-family="Arial">{t}</text>')
    dots = []
    xlabels = []
    for i, (day, bit, mru) in enumerate(days_rows):
        dots.append(f'<circle cx="{xs[i]:.1f}" cy="{ys[i]:.1f}" r="1.7" fill="#1E3A5F"/>')
        if has_mru and mru:
            dots.append(f'<circle cx="{xs[i]:.1f}" cy="{mys[i]:.1f}" r="{3.4 if i == peak_i else 2}" fill="#C0392B"/>')
        if day in (1, 8, 15, 22, 30) or day == days_rows[-1][0]:
            xlabels.append(f'<text x="{xs[i]:.1f}" y="{h - 4}" text-anchor="middle" font-size="10" fill="#64748b" font-family="Arial">{day}</text>')
    anchor = "start" if peak_i < 3 else ("end" if peak_i > last - 3 else "middle")
    peak = days_rows[peak_i]
    peak_y = mys[peak_i] if has_mru else ys[peak_i]
    peak_n = peak[2] if has_mru else peak[1]
    peak_txt = f"Día {peak[0]} · {peak_n}× MRU" if has_mru else f"Día {peak[0]} · {peak_n}"
    tag = f'<text x="{xs[peak_i]:.1f}" y="{max(12, peak_y - 8):.1f}" text-anchor="{anchor}" font-size="11" font-weight="700" fill="#1E3A5F" font-family="Arial">{peak_txt}</text>'
    red = f'<path d="{cubic(xs, mys)}" fill="none" stroke="#C0392B" stroke-width="2.1"/>' if has_mru else ""
    return f'''<svg viewBox="0 0 {w} {h}" width="100%" height="100%" role="img">
      {''.join(grid)}
      <line x1="{pad["l"]}" y1="{y_at(avg):.1f}" x2="{w - pad["r"]}" y2="{y_at(avg):.1f}" stroke="#94a3b8" stroke-dasharray="4 4"/>
      <line x1="{xs[peak_i]:.1f}" y1="{pad["t"]}" x2="{xs[peak_i]:.1f}" y2="{pad["t"] + ih:.1f}" stroke="#94a3b8" stroke-dasharray="3 3"/>
      <path d="{area}" fill="rgb(30 58 95 / 10%)"/>
      <path d="{cubic(xs, ys)}" fill="none" stroke="#1E3A5F" stroke-width="2.1"/>
      {red}
      {''.join(dots)}{tag}{''.join(xlabels)}
    </svg>'''


CSS = r"""
@page { size: 10in 7.5in; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; }
body { font-family: Arial, Helvetica, sans-serif; color: #1e293b; }
.slide { position: relative; width: 10in; height: 7.5in; overflow: hidden; page-break-after: always; break-after: page; background: #fff var(--slide-bg) 0 0 / 100% 100% no-repeat; }
.slide:last-child { page-break-after: auto; break-after: auto; }
.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; z-index: 0; }
.pad { position: absolute; z-index: 1; left: 0.42in; right: 0.42in; top: 1.05in; bottom: 0.68in; display: flex; flex-direction: column; gap: 0.07in; }
h2.title { margin: 0; color: #1E3A5F; font-size: 16pt; font-weight: 700; line-height: 1.05; }
.row-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.row-head h3 { margin: 0; color: #1E3A5F; font-size: 9.5pt; }
.row-head code { font-size: 7.5pt; color: #64748b; }
.kpis { display: grid; gap: 5px; }
.k4 { grid-template-columns: repeat(4, 1fr); }
.k3 { grid-template-columns: repeat(3, 1fr); }
.k3 { grid-template-columns: repeat(3, 1fr); }
.kpis article { background: #fff; border: 1px solid #e6ebf1; border-radius: 8px; padding: 4px 7px 3px; }
.kpis article.ok { background: #ecfdf5; }
.kpis article.warn { background: #fff7ed; }
.kpis article.blue { background: #eff6ff; }
.kpis article.violet { background: #f5f3ff; }
.kpis span { display: block; font-size: 6.7pt; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #64748b; }
.kpis strong { display: block; margin-top: 1px; font-size: 13.5pt; letter-spacing: -0.03em; color: #0f172a; line-height: 1.05; }
.kpis small { display: block; margin-top: 1px; font-size: 7pt; color: #64748b; line-height: 1.25; }
.method { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.method article { background: #fff; border: 1px solid #e6ebf1; border-radius: 8px; padding: 4px 8px 5px; display: flex; flex-direction: column; gap: 2px; }
.method article.d { border-top: 3px solid #1E3A5F; }
.method article.a { border-top: 3px solid #6d28d9; }
.method article.r { border-top: 3px solid #0f766e; }
.method h4 { margin: 0; font-size: 8.5pt; color: #1E3A5F; }
.regla { margin: 0; font-size: 7.3pt; line-height: 1.3; color: #475569; }
.frac-row { display: flex; align-items: center; gap: 8px; }
.frac { display: flex; flex-direction: column; align-items: center; min-width: 118px; color: #1E3A5F; font-size: 8pt; font-weight: 700; text-align: center; line-height: 1.15; }
.frac i { display: block; width: 100%; height: 1.5px; margin: 1px 0; background: #1E3A5F; }
.frac-row em { font-style: normal; font-size: 9pt; font-weight: 700; color: #0f172a; }
.foot { margin: 0; font-size: 7.4pt; line-height: 1.3; color: #475569; }
.chips { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.chips li { background: #fff; border: 1px solid #e6ebf1; border-radius: 8px; padding: 4px 7px; font-size: 7.3pt; line-height: 1.25; color: #475569; }
.chips strong { display: block; font-size: 8.5pt; color: #0f172a; }
table { width: 100%; border-collapse: collapse; background: #fff; }
th { text-align: left; font-size: 7pt; letter-spacing: 0.03em; text-transform: uppercase; color: #64748b; padding: 2px 4px; border-bottom: 1px solid #e2e8f0; }
td { padding: 1.5px 4px; border-bottom: 1px solid #f1f5f9; font-size: 8pt; }
table.densa td, table.densa th { font-size: 6.7pt; padding: 1px 3px; line-height: 1.25; }
table.densa tr.bloque td, table:not(.mto) tr.bloque td { background: #eff6ff; font-weight: 700; }
table.fuera td, table.fuera th { font-size: 6.4pt; padding: 0 3px; line-height: 1.2; white-space: nowrap; }
table.fuera td.ven { white-space: normal; }
td.si { color: #9a3412; font-weight: 800; }
td.no { color: #047857; font-weight: 800; }
table.evt { border: 1px solid #e6ebf1; border-radius: 8px; overflow: hidden; }
table.evt th { background: #1E3A5F; color: #fff; font-size: 7pt; padding: 4px 6px; border: 0; }
table.evt td { font-size: 7.4pt; padding: 2px 8px; vertical-align: top; border-bottom: 1px solid #eef2f6; line-height: 1.22; }
table.evt td small { display: block; font-size: 6.5pt; font-weight: 600; color: #64748b; line-height: 1.2; }
table.evt tr.sec td { background: #eef3f8; color: #1E3A5F; font-size: 7.2pt; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; padding: 3px 8px; }
table.evt td.relato span { display: block; }
table.evt td.relato .paso::before { content: "Evento. "; font-weight: 700; color: #1E3A5F; }
table.evt td.relato .hizo { color: #334155; }
table.evt td.relato .hizo::before { content: "Acción. "; font-weight: 700; color: #0f766e; }
table.evt td.hora { font-weight: 800; color: #1E3A5F; white-space: nowrap; width: 92px; }
table.evt td.hora.na { color: #94a3b8; font-weight: 700; }
table.evt tr.cop td:first-child { box-shadow: inset 3px 0 0 #C0392B; }
table.evt tr.ext td:first-child { box-shadow: inset 3px 0 0 #0f766e; }
table.evt td b { color: #0f172a; }
tbody tr:nth-child(even) { background: #f8fafc; }
.num { text-align: right; font-variant-numeric: tabular-nums; }
td.bad { color: #b91c1c; font-weight: 700; }
table.mto { border: 1px solid #e6ebf1; border-radius: 8px; overflow: hidden; }
table.mto th { background: #1E3A5F; color: #fff; font-size: 7.2pt; padding: 6px 8px; border: 0; }
table.mto td { font-size: 8pt; padding: 5px 10px; border-bottom: 1px solid #eef2f6; line-height: 1.3; vertical-align: middle; }
table.mto tbody tr:nth-child(even):not(.pend):not(.bloque) td { background: #f8fafc; }
table.mto td:nth-child(2) { font-weight: 700; color: #0f172a; white-space: nowrap; }
table.mto td.num { font-weight: 800; color: #1E3A5F; font-variant-numeric: tabular-nums; }
table.mto tr.bloque td { background: #eff6ff; }
table.mto tr.bloque td:first-child { box-shadow: inset 3px 0 0 #1E3A5F; }
tr.pend td { background: #fff7ed; }
tr.pend td:nth-child(3) { color: #9a3412; }
table.mto tr.pend td:first-child { box-shadow: inset 3px 0 0 #c2410c; }
table.mto.cfg th { padding: 3px 4px; font-size: 6.3pt; }
table.mto.cfg td { padding: 1px 4px; font-size: 6.7pt; line-height: 1.15; }
table.mto.cfg tr.j320 td { background: #f8fbff; }
table.mto.cfg tr.j420 td { background: #fff7ed; }
table.mto.cfg tr.jin td { background: #f0fdf4; }
table.mto.cfg tr.von td { background: #f5f3ff; }
.flota { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 4px; }
.flota article { border: 1px solid #e6ebf1; border-radius: 8px; overflow: hidden; background: #fff; }
.flota header { text-align: center; padding: 5px 8px 4px; }
.flota article.j320 header { background: #e7f2fb; }
.flota article.j420 header { background: #fff1e4; }
.flota article.jin header { background: #e8f6ec; }
.flota h3 { margin: 0; font-size: 12pt; line-height: 1.05; color: #1E3A5F; font-weight: 800; }
.flota header p { margin: 0; font-size: 7.2pt; line-height: 1.25; color: #334155; }
.flota .cuerpo { display: grid; grid-template-columns: 1fr 72px; align-items: center; gap: 4px; padding: 3px 6px 6px; }
.flota img { width: 100%; height: 1.22in; object-fit: contain; object-position: center; background: #fff; border: 0; border-radius: 0; display: block; }
.flota ul { margin: 0; padding: 0; list-style: none; border: 1px solid #d5e0ea; border-radius: 6px; overflow: hidden; }
.flota li { font-size: 6.5pt; line-height: 1.35; padding: 0 4px; text-align: center; color: #1E3A5F; border-top: 1px solid #e6eef5; font-weight: 700; }
.flota li.lab { border-top: 0; background: #1E3A5F; color: #fff; font-size: 6.2pt; letter-spacing: 0.02em; padding: 1px 4px; }
.card { background: #fff; border: 1px solid #e6ebf1; border-radius: 8px; padding: 4px 8px 5px; display: flex; flex-direction: column; min-height: 0; }
.card h4 { margin: 0 0 2px; font-size: 8pt; color: #1E3A5F; }
.trend { flex: 1; min-height: 1.85in; background: #fff; border: 1px solid #e6ebf1; border-radius: 8px; padding: 3px 8px 2px; display: flex; flex-direction: column; }
.trend-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.trend-head h4 { margin: 0; font-size: 8pt; color: #1E3A5F; }
.leg { margin: 0; display: flex; gap: 10px; font-size: 7pt; color: #64748b; }
.leg i { display: inline-block; width: 12px; height: 2px; margin-right: 3px; vertical-align: middle; }
.leg i.d { background: #1E3A5F; }
.leg i.g { background: #C0392B; }
.leg i.m { border-top: 1.5px dashed #94a3b8; height: 0; background: transparent; }
.trend svg { flex: 1; min-height: 0; }
.days { flex: 1; min-height: 0; background: #fff; border: 1px solid #e6ebf1; border-radius: 8px; padding: 3px 8px 2px; display: flex; flex-direction: column; }
.bars { display: flex; align-items: flex-end; gap: 3px; flex: 1; min-height: 1.05in; }
.bars > div { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; }
.bars span { display: flex; flex-direction: column; width: 100%; min-height: 2px; border-radius: 2px 2px 0 0; overflow: hidden; }
.bars i { display: block; width: 100%; }
.bars i.gas { background: #1E3A5F; flex: 1; }
.bars i.dsl { background: #C0392B; }
.bars em { font-style: normal; font-size: 6.5pt; color: #64748b; height: 11px; }
.hlist { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 3px; }
.hlist li { display: grid; grid-template-columns: 78px 1fr auto; gap: 6px; align-items: center; font-size: 7.5pt; }
.hlist b { height: 8px; background: #1E3A5F; border-radius: 2px; display: block; min-width: 2px; }
.hlist b.out { background: #C0392B; }
.hlist b.ok { background: #0f766e; }
.hlist em { font-style: normal; color: #334155; white-space: nowrap; }
.split { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 6px; min-height: 0; }
.bodega { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 6px; }
.bodega figure.shot { flex: 1; }
.bodega .chips { grid-template-columns: repeat(3, 1fr); }
.stack { display: flex; flex-direction: column; gap: 6px; min-height: 0; }
figure.shot { margin: 0; border-radius: 8px; overflow: hidden; border: 1px solid #e6ebf1; display: flex; flex-direction: column; min-height: 0; background: #0f172a; }
figure.shot img { width: 100%; flex: 1; min-height: 0; object-fit: cover; object-position: center 42%; display: block; }
figure.shot figcaption { margin: 0; padding: 4px 8px; font-size: 7pt; font-weight: 700; letter-spacing: 0.03em; color: #1E3A5F; background: #fff; }
.vcols { display: flex; align-items: flex-end; justify-content: center; gap: 22px; height: 1.35in; }
.vcols > div { width: 54px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
.vcols i { display: block; width: 100%; border-radius: 3px 3px 0 0; min-height: 4px; }
.vcols i.prev { background: #94a3b8; }
.vcols i.now { background: #0f766e; }
.vcols strong { font-size: 8pt; color: #0f172a; margin-top: 2px; }
.vcols span { font-size: 7pt; color: #64748b; }
.fcards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
.fcards li { list-style: none; background: #fff; border: 1px solid #e6ebf1; border-radius: 8px; padding: 4px 6px; text-align: center; }
.fcards span { display: block; font-size: 6.5pt; font-weight: 700; letter-spacing: 0.04em; color: #64748b; }
.fcards strong { display: block; font-size: 13pt; color: #0f172a; }
.fcards em { font-style: normal; font-size: 7pt; color: #64748b; }
ol.conc { margin: 0.08in 0 0; padding: 0 0 0 1.35em; display: flex; flex-direction: column; justify-content: space-between; gap: 0.2in; }
ol.conc li { font-size: 15pt; line-height: 1.28; color: #1e293b; }
ol.conc li::marker { color: #1E3A5F; font-weight: 700; }
ol.conc strong { display: block; color: #1E3A5F; font-size: 16.5pt; line-height: 1.15; margin-bottom: 2px; }
.cover { position: absolute; z-index: 1; inset: 0; display: flex; flex-direction: column; }
.hero { padding: 1.95in 1.05in 0; }
.kicker { margin: 0; color: #C0392B; font-weight: 800; letter-spacing: 0.08em; font-size: 13pt; }
.hero h1 { margin: 6px 0 0; color: #172D49; font-size: 28pt; line-height: 1.02; }
.month { margin: 8px 0 0; color: #C0392B; font-weight: 800; letter-spacing: 0.04em; font-size: 16pt; }
.hero hr { width: 2.1in; margin: 10px 0 12px; border: 0; border-top: 3px solid #0a6b73; }
.hero h2 { margin: 0; color: #1E3A5F; font-size: 12pt; }
.author { margin: 12px 0 0; color: #172D49; font-size: 10pt; line-height: 1.4; }
.blurb { margin: auto 1.35in 0.95in; text-align: center; font-size: 9pt; line-height: 1.4; color: #111; }
.pn { position: absolute; z-index: 2; right: 0.38in; bottom: 0.28in; font-size: 8pt; color: #fff; font-weight: 700; }
.src { margin-top: 1px; font-size: 6.6pt; color: #94a3b8; flex-shrink: 0; }
.sites { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.sites.s4 { grid-template-columns: repeat(4, 1fr); }
.sites.s4 h3 { font-size: 8.5pt; }
.sites.s4 dd { font-size: 8.5pt; }
.sites article { background: #fff; border: 1px solid #e6ebf1; border-radius: 8px; padding: 5px 8px 6px; }
.sites article.c { border-top: 3px solid #C0392B; }
.sites article.v { border-top: 3px solid #0f766e; }
.sites article.p { border-top: 3px solid #1E3A5F; }
.sites h3 { margin: 0; font-size: 9.5pt; color: #1E3A5F; }
.sites .sub { margin: 1px 0 4px; font-size: 7pt; color: #64748b; line-height: 1.25; }
.sites dl { margin: 0; display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; align-items: baseline; }
.sites dt { font-size: 7.2pt; color: #64748b; }
.sites dd { margin: 0; font-size: 9pt; font-weight: 700; text-align: right; color: #0f172a; font-variant-numeric: tabular-nums; }
.sites dd.warn { color: #b91c1c; }
.sites dd.ok { color: #047857; }
@media screen {
  html, body { background: #e8eef4; }
  body { padding: 12px 0 24px; }
}
@media print { .slide { zoom: 1 !important; } }
"""


def page(npage, inner, cover=False, src=False):
    source = '<p class="src">Fuente: consolidado 01–30 sep 2026 · reportes FO-GE-033 de septiembre · sábana de mantenimientos · inventario 16-sep · HSE semanal · curva Feb–Ago del informe de agosto</p>' if src and not cover else ""
    body = inner if cover else f'<div class="pad">{inner}{source}</div>'
    return f'<article class="slide">{body}<span class="pn">{npage}</span></article>'


def site_card(title, note, rows, edge):
    items = "".join(f"<dt>{esc(lab)}</dt><dd class='{cls}'>{val}</dd>" for lab, val, cls in rows)
    return f'<article class="{edge}"><h3>{esc(title)}</h3><p class="sub">{note}</p><dl>{items}</dl></article>'


def apply_gte(m):
    """Cifras publicadas en Analisis Indicadores Copower PUTN SEP 2026.

    No recalcula la curva Feb–Ago ni la barra diaria. Sí reemplaza el cierre
    de septiembre que GTE reporta por unidad y por sistema.
    """
    units = {
        "CPW-01": (398607, 0, 1, 2, 0.9986, 0.9986),
        "CPW-02": (259319, 10, 0, 2, 1.0, 0.9861),
        "CPW-03": (205943, 71, 0, 2, 1.0, 0.9014),
        "CPW-04": (305699, 8, 0, 0, 1.0, 0.9889),
        "CPW-05": (332469, 0, 0, 0, 1.0, 1.0),
        "CPW-06": (331740, 0, 1.1, 0, 0.9985, 0.9985),
        "CPW-07": (163745, 0, 2, 0, 0.9972, 0.9972),
        "CPW-10": (122287, 18, 0, 2, 1.0, 0.9750),
        "CPW-11": (126169, 12, 0, 1, 1.0, 0.9833),
        "CPW-12": (120598, 12, 0, 3, 1.0, 0.9833),
        "JIN-01": (144154, 29, 0, 0, 1.0, 0.9597),
        "JIN-02": (109195, 25, 0, 0, 1.0, 0.9653),
    }
    for u in m["units"]:
        kwh, pp, fo, ext, rel, disp = units[u["tag"]]
        u["kwh"] = kwh
        u["pp"] = pp
        u["fo"] = fo
        u["ext"] = ext
        u["r"] = rel
        u["a"] = disp
        u["disp"] = disp
    c, v, p = m["cyc"], m["von"], m["park"]
    c["kwh"] = 2366576.44
    c["r"] = c["a"] = c["disp"] = 0.9944
    c["ext"] = 12.28
    c["pp"] = 131
    c["fo"] = 4
    c["op"] = 6072.63
    c["sb"] = 714.32
    c["uso"] = c["op"] / c["cal"]
    v["kwh"] = 253348.82
    v["r"] = 1.0
    v["a"] = v["disp"] = 0.9514
    v["ext"] = 0
    v["pp"] = 54
    v["fo"] = 0
    v["op"] = 1386
    v["sb"] = 0
    v["uso"] = 0.963
    p["kwh"] = c["kwh"] + v["kwh"]
    p["r"] = 0.9944
    p["a"] = p["disp"] = 0.9944
    p["ext"] = 12.28
    p["pp"] = c["pp"] + v["pp"]
    p["fo"] = 4
    p["op"] = c["op"] + v["op"]
    p["sb"] = c["sb"]
    p["uso"] = p["op"] / p["cal"]
    p["kw"] = p["kwh"] / p["op"]
    m["mwh"] = p["kwh"] / 1000
    m["mwh_d"] = m["mwh"] / m["ndays"]
    m["cpw03"]["pp"] = 71
    m["jen"]["kwh"] = 1997522.44
    m["jin"]["kwh"] = 622402.82
    m["gas_ago_d"] = (3717498 + 491898) / 1000 / 31


def render(m):
    apply_gte(m)
    p, c, v = m["park"], m["cyc"], m["von"]
    off_a = " · ".join(f"{u['name']} {pct(u['a'])}" for u in m["off_a"])
    off_d = " · ".join(f"{u['name']} {pct(u['disp'])}" for u in m["off_d"])
    delta_d = (m["mwh_d"] - AGO["mwh_d"]) / AGO["mwh_d"]
    delta_gas = (m["mwh_d"] - m["gas_ago_d"]) / m["gas_ago_d"]
    tone_disp = "warn" if p["disp"] < META else "ok"
    tone_cyc = "warn" if c["disp"] < META else "ok"

    s1 = page(1, f"""
        <div class="cover"><div class="hero">
          <p class="kicker">PRESENTACIÓN DE INDICADORES · CIERRE 01–30</p>
          <h1>INDICADORES DE CONFIABILIDAD</h1>
          <p class="month">SEPTIEMBRE 2026</p><hr>
          <h2>PARQUE DE GENERACIÓN COSTAYACO – VONÚ</h2>
          <p class="author">Gustavo Arteaga<br>innovacion.confiabilidad@copower.com.co</p>
        </div>
        </div>""", cover=True)

    def site_rows(block, meta, mwh):
        return [
            ("Generación", f"{n(mwh, 1)} MWh", ""),
            ("Disponibilidad", pct(block["disp"]), "warn" if block["disp"] < meta else "ok"),
            ("Confiabilidad R%", pct(block["r"]), "ok"),
            ("Contrato A%", pct(block["a"]), "warn" if block["a"] < meta else "ok"),
            ("Uso", pct(block["uso"], 1), ""),
            ("Paradas externas", f"{n(block['ext'], 0)} h", "warn" if block["ext"] else "ok"),
        ]

    s2 = page(2, f"""
        <h2 class="title">Resumen ejecutivo</h2>
        <div class="sites">
          {site_card("Todo el parque", f"{n(p['n'], 0)} unidades · 01–30 sep", [
            ("Generación", f"{n(m['mwh'], 1)} MWh", ""),
            ("Disponibilidad", "99,44 · 95,14 %", "ok"),
            ("Confiabilidad R%", "99,44 · 100 %", "ok"),
            ("Contrato A%", "99,44 · 95,14 %", "ok"),
            ("Uso", pct(p["uso"], 1), ""),
            ("Paradas externas", f"{n(p['ext'], 0)} h", "warn" if p["ext"] else "ok"),
          ], "p")}
          {site_card("Costayaco", f"{n(c['n'], 0)} máquinas · 4 fallas · meta ≥ 98 %", site_rows(c, META, c['kwh']/1000), "c")}
          {site_card("Vonú", f"{n(v['n'], 0)} máquinas · 0 fallas · meta ≥ 90 %", site_rows(v, META_VONU, v['kwh']/1000), "v")}
        </div>
        <div class="trend">
          <div class="trend-head">
            <h4>Tendencia COPOWER · Feb–Sep</h4>
            <p class="leg"><span><i class="d"></i>Disp.</span><span><i class="g"></i>Generación MWh/día</span><span><i class="m"></i>Meta 98 %</span><span>Sep · cierre 01–30</span></p>
          </div>
          {trend_svg(m["trend"])}
        </div>
        """, src=False)

    s_cfg = page(3, """
        <h2 class="title">Configuración de equipos</h2>
        <table class="mto cfg"><thead><tr><th>Equipo</th><th>Modelo</th><th>Fabricante</th><th class="num">Instalada kW</th><th class="num">Potencia promedio<br>entregada kW</th></tr></thead><tbody>
          <tr class="j320"><td>CPW-01</td><td>J320</td><td>Jenbacher</td><td class="num">1.050</td><td class="num">780</td></tr>
          <tr class="j320"><td>CPW-02</td><td>J320</td><td>Jenbacher</td><td class="num">1.050</td><td class="num">780</td></tr>
          <tr class="j320"><td>CPW-03</td><td>J320</td><td>Jenbacher</td><td class="num">1.050</td><td class="num">780</td></tr>
          <tr class="j320"><td>CPW-07</td><td>JB 320 GS-N/B.L</td><td>Jenbacher</td><td class="num">1.050</td><td class="num">780</td></tr>
          <tr class="j420"><td>CPW-04</td><td>J420</td><td>Jenbacher</td><td class="num">1.300</td><td class="num">1.050</td></tr>
          <tr class="j420"><td>CPW-05</td><td>J420</td><td>Jenbacher</td><td class="num">1.300</td><td class="num">1.050</td></tr>
          <tr class="j420"><td>CPW-06</td><td>JB 420 GS-N/B.L</td><td>Jenbacher</td><td class="num">1.300</td><td class="num">1.050</td></tr>
          <tr class="jin"><td>CPW-10</td><td>JINAN</td><td>Jinan</td><td class="num">600</td><td class="num">454</td></tr>
          <tr class="jin"><td>CPW-11</td><td>JINAN</td><td>Jinan</td><td class="num">600</td><td class="num">454</td></tr>
          <tr class="jin"><td>CPW-12</td><td>JINAN</td><td>Jinan</td><td class="num">600</td><td class="num">454</td></tr>
          <tr class="von"><td>JIN-01</td><td>JINAN</td><td>Jinan</td><td class="num">600</td><td class="num">454</td></tr>
          <tr class="von"><td>JIN-02</td><td>JINAN</td><td>Jinan</td><td class="num">600</td><td class="num">454</td></tr>
        </tbody></table>
        <div class="flota">
          <article class="j320">
            <header><h3>Jenbacher J320</h3><p>Instalada 1.050 kW</p><p>Potencia promedio 780 kW</p></header>
            <div class="cuerpo"><img src="equipo-j320.png" alt="Grupo electrógeno Jenbacher J320"><ul><li class="lab">Equipos</li><li>CPW-01</li><li>CPW-02</li><li>CPW-03</li><li>CPW-07</li></ul></div>
          </article>
          <article class="j420">
            <header><h3>Jenbacher J420</h3><p>Instalada 1.300 kW</p><p>Potencia promedio 1.050 kW</p></header>
            <div class="cuerpo"><img src="equipo-j420.png" alt="Grupo electrógeno Jenbacher J420"><ul><li class="lab">Equipos</li><li>CPW-04</li><li>CPW-05</li><li>CPW-06</li></ul></div>
          </article>
          <article class="jin">
            <header><h3>Jinan</h3><p>Instalada 600 kW</p><p>Potencia promedio 454 kW</p></header>
            <div class="cuerpo"><img src="equipo-jinan.png" alt="Grupo electrógeno Jinan"><ul><li class="lab">Equipos</li><li>CPW-10</li><li>CPW-11</li><li>CPW-12</li><li>JIN-01</li><li>JIN-02</li></ul></div>
          </article>
        </div>
        """)

    s3 = page(5, f"""
        <h2 class="title">Confiabilidad</h2>
        <p class="regla">R% = (Tplan − FO) / Tplan. MTTF: horas de operación entre fallas. MTTR: horas de falla entre el número de fallas.</p>
        <div class="kpis k4">
          {kpi("Costayaco", "99,44 %", "4 fallas · sobre la meta de 98 %", "ok")}
          {kpi("MTTF", "1.518,16 h", "6.072,6 h de operación / 4 fallas", "ok")}
          {kpi("MTTR", "1,01 h", "4,05 h de falla / 4")}
          {kpi("Menor MTTF", "344 h", "CPW-06 · dos fallas", "warn")}
        </div>
        <table class="mto"><thead><tr><th>Unidad</th><th class="num">Fallas</th><th class="num">Operación</th><th class="num">Falla</th><th class="num">MTTF</th><th class="num">MTTR</th><th>Cierre</th></tr></thead><tbody>
          <tr class="bloque"><td>Costayaco</td><td class="num">4</td><td class="num">6.072,6 h</td><td class="num">4,05 h</td><td class="num">1.518,16 h</td><td class="num">1,01 h</td><td>99,44 %</td></tr>
          <tr><td>CPW-01</td><td class="num">1</td><td class="num">669,85 h</td><td class="num">1,00 h</td><td class="num">669,85 h</td><td class="num">1,00 h</td><td>99,86 %</td></tr>
          <tr><td>CPW-06</td><td class="num">2</td><td class="num">688 h</td><td class="num">1,05 h</td><td class="num">344 h</td><td class="num">0,53 h</td><td>MTTR del mes: 1,00 h</td></tr>
          <tr><td>CPW-07</td><td class="num">1</td><td class="num">377 h</td><td class="num">2,00 h</td><td class="num">377 h</td><td class="num">2,00 h</td><td>99,72 %</td></tr>
          <tr><td>Vonú</td><td class="num">0</td><td class="num">1.386 h</td><td class="num">0</td><td class="num">—</td><td class="num">—</td><td>Sin fallas</td></tr>
        </tbody></table>
        <table class="evt"><thead><tr><th>Falla</th><th>Hora</th><th>Duración</th><th>Nota</th></tr></thead><tbody>
          <tr><td><b>CPW-01 · 15-sep</b></td><td>16:28</td><td class="num">1,00 h</td><td>Bujía del cilindro 19.</td></tr>
          <tr><td><b>CPW-06 · 15-sep</b></td><td>16:28</td><td class="num">1,00 h</td><td>Reactiva inversa. AVR.</td></tr>
          <tr><td><b>CPW-06 · 20-sep</b></td><td>16:58 – 17:01</td><td class="num">0,05 h</td><td>Sobrecarga. 3 min.</td></tr>
          <tr><td><b>CPW-07 · 25-sep</b></td><td>16:15 – 17:58</td><td class="num">2,00 h</td><td>Actuador. Duración: 2 h.</td></tr>
        </tbody></table>
        <div class="trend" style="flex:0 0 auto;height:1.15in;min-height:0">
          <div class="trend-head">
            <h4>Confiabilidad del parque · Feb–Sep</h4>
            <p class="leg"><span><i class="d" style="background:#0f766e"></i>R%</span><span><i class="m"></i>Meta 98 %</span><span>Sep · 99,44 %</span></p>
          </div>
          {rel_svg(REL_HIST, p["r"])}
        </div>
        """, src=False)

    s4 = page(6, f"""
        <h2 class="title">Disponibilidad</h2>
        <div class="kpis k3">
          {kpi("Costayaco", "99,44 %", "ago 100,00 % · 4 fallas · cumple", "ok")}
          {kpi("Vonú", "95,14 %", "ago 95,83 % · 0 fallas · cumple", "ok")}
          {kpi("Cumple", "Sí", "riesgo bajo · los dos sistemas", "ok")}
        </div>
        <div class="method">
          <article class="d"><h4>Costayaco</h4>
            <p class="regla">Disponibilidad y confiabilidad cierran en el mismo valor. Agosto venía en 100,00 %.</p>
            {frac("4 fallas", "MTBF 1.518,16 h", "99,44 %")}
            <p class="regla">Stand-by del sistema: 714,32 h. Energía: 2.366,6 MWh.</p>
          </article>
          <article class="a"><h4>Vonú</h4>
            <p class="regla">Disponibilidad 95,14 % y confiabilidad 100 %. Cumple el mínimo de 90 %.</p>
            {frac("0 fallas", "stand-by 0 h", "95,14 %")}
            <p class="regla">Agosto 95,83 %. Energía: 253,3 MWh, venía de 491,9 MWh.</p>
          </article>
        </div>
        <div class="trend" style="min-height:1.05in">
          <div class="trend-head">
            <h4>Disponibilidad del parque · Feb–Sep</h4>
            <p class="leg"><span><i class="d"></i>Disponibilidad</span><span><i class="m"></i>Meta 98 %</span><span>Sep · 99,44 %</span></p>
          </div>
          {rel_svg([(m, d) for m, d, _, _ in TREND_HIST], p["disp"], color="#1E3A5F", fill="rgb(30 58 95 / 12%)", lo=0.952, hi=1.002, ticks=(0.96, 0.98))}
        </div>
        """, src=False)

    ymax = max(x[1] for x in m["gen_days"]) * 1.08
    bars = []
    for d, val in m["gen_days"]:
        label = str(d.day) if d.day in (1, 8, 15, 22, 30) else ""
        bars.append(f'<div><span style="height:{val / ymax * 100:.1f}%"><i class="gas"></i></span><em>{label}</em></div>')
    jen_share = m["jen"]["kwh"] / p["kwh"]
    jin_share = m["jin"]["kwh"] / p["kwh"]
    fleet_max = max(m["jen"]["kwh"], m["jin"]["kwh"], 1)
    s5 = page(7, f"""
        <h2 class="title">Detalle de la generación</h2>
        <div class="kpis k4">
          {kpi("Total", f"{n(m['mwh'], 1)} MWh", f"gas 01–{m['ndays']} · 12 unidades en servicio")}
          {kpi("Ritmo diario", f"{n(m['mwh_d'], 1)} MWh/d", "−35,7 % vs ago 135,8", "warn")}
          {kpi("Pico diario", f"{n(m['peak'][1], 0)} MWh", f"día {m['peak'][0].day} · mínimo {n(m['valle'][1], 0)} MWh", "violet")}
          {kpi("Potencia media", f"{n(p['kw'], 0)} kW", f"{n(p['op'], 0)} h de operación", "blue")}
        </div>
        <div class="kpis k4">
          {kpi("Mix gas", "100 %", f"{n(m['mwh'], 1)} MWh · Jenbacher + Jinan", "blue")}
          {kpi("Diésel", "0 MWh", "G101V · G102J · G102K sin operación", "warn")}
          {kpi("Costayaco", f"{n(c['kwh']/1000, 1)} MWh", f"{pct(c['kwh']/p['kwh'], 1)} · {n(c['op'], 0)} h OP")}
          {kpi("Vonú", f"{n(v['kwh']/1000, 1)} MWh", f"{pct(v['kwh']/p['kwh'], 1)} · {n(v['op'], 0)} h OP", "violet")}
        </div>
        <div class="days">
          <div class="trend-head">
            <h4>Generación diaria · MWh</h4>
            <p class="leg"><span><i class="d"></i>Gas</span><span><i class="g"></i>Diésel</span><span>Pico día {m['peak'][0].day} · {n(m['peak'][1], 0)} MWh</span></p>
          </div>
          <div class="bars">{''.join(bars)}</div>
          <ul class="hlist">
            <li><span>Jenbacher</span><b style="width:{m['jen']['kwh']/fleet_max*100:.0f}%"></b><em>{n(m['jen']['kwh']/1000, 0)} MWh · {pct(jen_share, 0)}</em></li>
            <li><span>Jinan</span><b class="ok" style="width:{m['jin']['kwh']/fleet_max*100:.0f}%"></b><em>{n(m['jin']['kwh']/1000, 0)} MWh · {pct(jin_share, 0)}</em></li>
            <li><span>Cummins</span><b class="out" style="width:2%"></b><em>0 · sin operación</em></li>
          </ul>
        </div>
        """)

    s6 = page(4, """
        <h2 class="title">Desempeño por máquina</h2>
        <table><thead><tr><th>Unidad</th><th>Campo</th><th class="num">Energía kWh</th><th class="num">Stand-by h</th><th class="num">Disp.</th><th class="num">Conf.</th><th class="num">Fallas</th><th class="num">MTBF h</th><th class="num">MTTR h</th><th>Riesgo</th><th>Cumple</th></tr></thead>
        <tbody>
          <tr><td>CPW-01</td><td>Costayaco</td><td class="num">398.607</td><td class="num">49,15</td><td class="num">99,86 %</td><td class="num">99,86 %</td><td class="num">1</td><td class="num">669,85</td><td class="num">1</td><td>Riesgo bajo</td><td>Cumple</td></tr>
          <tr><td>CPW-02</td><td>Costayaco</td><td class="num">259.319</td><td class="num">46,02</td><td class="num">98,61 %</td><td class="num">100,00 %</td><td class="num">0</td><td class="num">Sin fallas</td><td class="num">0</td><td>Riesgo bajo</td><td>Cumple</td></tr>
          <tr><td>CPW-03</td><td>Costayaco</td><td class="num">205.943</td><td class="num">68,77</td><td class="num">90,14 %</td><td class="num">100,00 %</td><td class="num">0</td><td class="num">Sin fallas</td><td class="num">0</td><td>Riesgo bajo</td><td>Cumple</td></tr>
          <tr><td>CPW-04</td><td>Costayaco</td><td class="num">305.699</td><td class="num">43</td><td class="num">98,89 %</td><td class="num">100,00 %</td><td class="num">0</td><td class="num">Sin fallas</td><td class="num">0</td><td>Riesgo bajo</td><td>Cumple</td></tr>
          <tr><td>CPW-05</td><td>Costayaco</td><td class="num">332.469</td><td class="num">14</td><td class="num">100,00 %</td><td class="num">100,00 %</td><td class="num">0</td><td class="num">Sin fallas</td><td class="num">0</td><td>Riesgo bajo</td><td>Cumple</td></tr>
          <tr><td>CPW-06</td><td>Costayaco</td><td class="num">331.740</td><td class="num">30,95</td><td class="num">99,85 %</td><td class="num">99,85 %</td><td class="num">2</td><td class="num">344</td><td class="num">1</td><td>Riesgo bajo</td><td>Cumple</td></tr>
          <tr><td>CPW-07</td><td>Costayaco</td><td class="num">163.745</td><td class="num">341</td><td class="num">99,72 %</td><td class="num">99,72 %</td><td class="num">1</td><td class="num">377</td><td class="num">2</td><td>Riesgo bajo</td><td>Cumple</td></tr>
          <tr><td>JIN-10</td><td>Costayaco</td><td class="num">122.287</td><td class="num">121,43</td><td class="num">97,50 %</td><td class="num">100,00 %</td><td class="num">0</td><td class="num">Sin fallas</td><td class="num">0</td><td>Riesgo bajo</td><td>Cumple</td></tr>
          <tr><td>JIN-11</td><td>Costayaco</td><td class="num">126.169</td><td class="num">114</td><td class="num">98,33 %</td><td class="num">100,00 %</td><td class="num">0</td><td class="num">Sin fallas</td><td class="num">0</td><td>Riesgo bajo</td><td>Cumple</td></tr>
          <tr><td>JIN-12</td><td>Costayaco</td><td class="num">120.598</td><td class="num">164</td><td class="num">98,33 %</td><td class="num">100,00 %</td><td class="num">0</td><td class="num">Sin fallas</td><td class="num">0</td><td>Riesgo bajo</td><td>Cumple</td></tr>
          <tr><td>JIN-01</td><td>Vonú</td><td class="num">144.154</td><td class="num">0</td><td class="num">95,97 %</td><td class="num">100,00 %</td><td class="num">0</td><td class="num">Sin fallas</td><td class="num">0</td><td>Riesgo bajo</td><td>Cumple</td></tr>
          <tr><td>JIN-02</td><td>Vonú</td><td class="num">109.195</td><td class="num">0</td><td class="num">96,53 %</td><td class="num">100,00 %</td><td class="num">0</td><td class="num">Sin fallas</td><td class="num">0</td><td>Riesgo bajo</td><td>Cumple</td></tr>
          <tr class="bloque"><td>Sistema N</td><td>Costayaco</td><td class="num">2.366.576</td><td class="num">714,32</td><td class="num">99,44 %</td><td class="num">99,44 %</td><td class="num">4</td><td class="num">1.518,16</td><td class="num">1,01</td><td>Riesgo bajo</td><td>Cumple</td></tr>
          <tr class="bloque"><td>Sistema N</td><td>Vonú</td><td class="num">253.349</td><td class="num">0</td><td class="num">95,14 %</td><td class="num">100,00 %</td><td class="num">0</td><td class="num">Sin fallas</td><td class="num">0</td><td>Riesgo bajo</td><td>Cumple</td></tr>
        </tbody></table>
        <h4 style="margin:2px 0 0;color:#1E3A5F;font-size:9pt">Compromiso contractual</h4>
        <div class="method">
          <article class="d"><h4>Costayaco · gas ≥ 98 %</h4><p class="regla">Disponibilidad y confiabilidad del sistema: mínimo 98 %. Septiembre cierra en 99,44 %. El mantenimiento programado no se cuenta como falla.</p></article>
          <article class="a"><h4>Vonú · disponibilidad ≥ 90 %</h4><p class="regla">Disponibilidad mínima: 90 %. Septiembre cierra en 95,14 %, con confiabilidad de 100 % y sin fallas. El MTBF se sigue como alerta; el contrato se mide por disponibilidad y confiabilidad.</p></article>
        </div>
        """, src=False)

    def falla(kind, when, clock, unit, horas, ventana, paso, hizo):
        hora = f"<td class='hora na'>{esc(horas)}</td>" if not ventana and horas == "Sin hora" else (
            f"<td class='hora'>{esc(horas)}{f'<small>{esc(ventana)}</small>' if ventana else ''}</td>"
        )
        clock_html = f"<small>{esc(clock)}</small>" if clock else ""
        return (
            f"<tr class='{kind}'><td>{esc(when)}{clock_html}</td>"
            f"<td><b>{esc(unit)}</b></td>{hora}"
            f"<td class='relato'><span class='paso'>{esc(paso)}</span><span class='hizo'>{esc(hizo)}</span></td></tr>"
        )

    copower = [
        falla("cop", "15-sep", "16:28", "CPW-01", "1 h", "", "Bujía del cilindro 19 averiada, con temperatura alta.", "Reemplazo de la bujía y limpieza de termocuplas."),
        falla("cop", "15-sep", "16:28", "CPW-06", "1 h", "", "Disparo por potencia reactiva inversa: 741 kW y −804 kvar.", "Revisión del AVR y ajuste de la protección. Confiabilidad 99,85 %."),
        falla("cop", "20-sep", "16:58", "CPW-06", "3 min", "16:58 – 17:01", "En modo isla, CPW-05 descendió a 87 kW y CPW-06 disparó por sobrecarga, con pico de 1.217 kW.", "Reingreso a las 17:01."),
        falla("cop", "25-sep", "16:15", "CPW-07", "2 h", "16:15 – 17:58", "Faltó ajustar el actuador y la unidad vibró.", "Correctivo y reingreso a las 17:58. Confiabilidad 99,72 %."),
    ]
    externas = [
        falla("ext", "02-sep", "03:47", "CPW-04", "11 min", "03:47 – 03:58", "El gas Moqueta descendió a 130 psi y la unidad detonó.", "Reingreso a las 03:58. No se registra como falla."),
        falla("ext", "06-sep", "07:25", "CPW-02", "5 min", "07:25 – 07:30", "El CCM solicitó cambio de combustible. La clapeta quedó fuera de posición.", "Calibración del actuador Sauter. Reingreso a las 07:30."),
        falla("ext", "06-sep", "08:45", "CPW-07", "10 min", "08:45 – 08:55", "La carga subió a 900 kW al perderse las dos fuentes de gas.", "Sin reemplazo de componentes. Reingreso a las 08:55."),
        falla("ext", "14-sep", "", "CPW-01 / 02 / 03", "2 h c/u", "", "Salida de la MRU por perturbación eléctrica.", "Cada unidad registra 2 h como parada del cliente."),
        falla("ext", "15-sep", "07:08", "CPW-01 y CPW-06", "5 h 07 min", "07:08 – 12:15", "En CPW-01 se mantuvo la MRU. En CPW-06 el CCM solicitó cambio de gas.", "CPW-01 permaneció fuera de línea de 07:08 a 12:15."),
        falla("ext", "19-sep", "00:39", "CPW-01, 02, 03, 12", "2 h 42 min", "00:39 – 03:21", "La MRU salió por alto NGL y activó el shutdown.", "Sin falla interna. Reingreso a generación a las 03:21."),
        falla("ext", "20-sep", "mañana", "CPW-06", "4 h", "", "Gas Moqueta entre 120 y 130 psi.", "Paradas solicitadas por el CCM. 4 h a cargo del cliente."),
        falla("ext", "23-sep", "16:15", "CPW-01, 02, 07, 10–12", "3 h 26 min", "16:15 – 19:41", "Perturbación en el SIN y salida de la MRU.", "Sin intervención en la máquina. Reingreso a las 19:41."),
        falla("ext", "24-sep", "01:47", "CPW-02", "10 h 43 min", "01:47 – 12:30", "Potencia reactiva inestable. También salió la CAT 4.", "Reingreso a las 12:30. No afecta la confiabilidad."),
    ]
    ev = (
        "<tr class='sec'><td colspan='4'>Fallas de máquina</td></tr>"
        + "".join(copower)
        + "<tr class='sec'><td colspan='4'>Paradas de cliente o de planta</td></tr>"
        + "".join(externas)
    )
    s7 = page(8, f"""
        <h2 class="title">Fallas de septiembre</h2>
        <div class="kpis k3">
          {kpi("Eventos", "13", "4 fallas de máquina · 9 paradas de cliente o planta")}
          {kpi("Fallas de máquina", "4", "CPW-01 ×1 · CPW-06 ×2 · CPW-07 ×1", "warn")}
          {kpi("Sin hora", "0", "salida y reingreso con hora")}
        </div>
        <table class="evt"><thead><tr><th>Fecha</th><th>Equipo</th><th>Fuera de línea</th><th>Evento y acción</th></tr></thead><tbody>{ev}</tbody></table>
        """)

    skip = {"MRU", "Moqueta"}
    causa_name = {"MTO": "Mantenimiento"}
    bit_items = sorted(
        ((causa_name.get(k, k), v) for k, v in m["bit_by"].items() if k not in skip),
        key=lambda kv: -kv[1],
    )
    bit_max = max(c_ for _, c_ in bit_items)
    left = "".join(
        f'<li><span>{esc(name)}</span><b class="{"out" if name=="Pruebas" else ""}" style="width:{count/bit_max*100:.0f}%"></b><em>{count}</em></li>'
        for name, count in bit_items
    )
    pretty = {"CPW07": "CPW-07", "CPW03": "CPW-03", "CPW04": "CPW-04", "CPW01": "CPW-01", "CPW02": "CPW-02", "CPW05": "CPW-05", "CPW06": "CPW-06"}
    actores = sorted(((pretty.get(k, k), v) for k, v in m["resto_by"].items()), key=lambda kv: -kv[1])
    act_max = max(c_ for _, c_ in actores)
    right = "".join(
        f'<li><span>{esc(name)}</span><b class="{"out" if i==0 else ""}" style="width:{count/act_max*100:.0f}%"></b><em>{count}</em></li>'
        for i, (name, count) in enumerate(actores)
    )
    resto_n = sum(v for _, v in bit_items)
    ev_rows = [(d.day, m["daily"][d]["resto"], 0) for d in m["days"]]
    s8 = page(9, f"""
        <h2 class="title">Eventos repetitivos y malos actores</h2>
        <p class="regla">Se excluyen {m['bit_mru']} salidas de MRU y {m['bit_by'].get('Moqueta', 0)} cambios de gas.</p>
        <div class="kpis k4">
          {kpi("Eventos", str(resto_n), f"de {m['bit_n']} registros de bitácora")}
          {kpi("Pruebas", str(m['bit_by'].get('Pruebas', 0)), "Causa más frecuente", "warn")}
          {kpi("Mantenimiento", str(m['bit_by'].get('MTO', 0)), "Paradas programadas")}
          {kpi("CPW-07", str(m['resto_by'].get('CPW07', 0)), "Unidad con más eventos", "violet")}
        </div>
        <div class="split">
          <div class="card"><h4>Qué se repite</h4><ul class="hlist">{left}</ul></div>
          <div class="card"><h4>En qué máquina</h4><ul class="hlist">{right}</ul></div>
        </div>
        <div class="trend" style="min-height:1.45in">
          <div class="trend-head">
            <h4>Eventos por día · sin MRU ni cambio de gas · 1–{m['ndays']} sep</h4>
            <p class="leg"><span><i class="d"></i>Eventos</span><span><i class="m"></i>Promedio</span></p>
          </div>
          {event_svg(ev_rows)}
        </div>
        """)

    ranked = sorted(m["units"], key=lambda u: -u["kwh"])
    emax = ranked[0]["kwh"] / 1000
    elis = "".join(
        f'<li><span>{esc(u["name"])}</span><b class="{"ok" if u["kwh"]/1000 >= m["mwh"]/12 else ""}" style="width:{u["kwh"]/1000/emax*100:.0f}%"></b><em>{n(u["kwh"]/1000, 0)}</em></li>'
        for u in ranked
    )
    ago_h = AGO["mwh_d"] / max(AGO["mwh_d"], m["mwh_d"]) * 100
    sep_h = m["mwh_d"] / max(AGO["mwh_d"], m["mwh_d"]) * 100
    jen_avg = (m["jen"]["kwh"] / 1000) / m["jen"]["n"]
    jin_avg = (m["jin"]["kwh"] / 1000) / m["jin"]["n"]
    jin02u = next(u for u in m["units"] if u["tag"] == "JIN-02")
    s9 = page(11, f"""
        <h2 class="title">Desempeño energético</h2>
        <div class="kpis k4">
          {kpi("Entrega / máquina", f"{n(m['mwh']/12, 0)} MWh", f"promedio de 12 unidades en {m['ndays']} días", "ok")}
          {kpi("Potencia media", f"{n(p['kw'], 0)} kW", "kWh / hora de operación", "blue")}
          {kpi("Impacto vs ago", "−48,5", "MWh/día · gas ago 135,8 → sep 87,3", "violet")}
          {kpi("Parque", f"{n(m['mwh'], 1)} MWh", f"100 % gas · {m['ndays']} días")}
        </div>
        <div class="split">
          <div class="card"><h4>Cuánto entregó cada máquina · MWh</h4><ul class="hlist">{elis}</ul></div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <div class="card">
              <h4>Impacto en el ritmo · MWh/día</h4>
              <div class="vcols">
                <div><i class="prev" style="height:100%"></i><strong>136</strong><span>AGO</span></div>
                <div><i class="now" style="height:64%"></i><strong>87</strong><span>SEP</span></div>
              </div>
              <p class="regla" style="text-align:center">−48,5 MWh/d · gas ago 135,8 → sep 87,3 · −35,7 %</p>
            </div>
            <div class="card">
              <h4>Promedio por flota · MWh / máquina</h4>
              <ul class="fcards">
                <li><span>JENBACHER</span><strong>{n(jen_avg, 0)}</strong><em>7 und</em></li>
                <li><span>JINAN</span><strong>{n(jin_avg, 0)}</strong><em>5 und</em></li>
                <li><span>CUMMINS</span><strong>0</strong><em>sin op.</em></li>
              </ul>
            </div>
          </div>
        </div>
        """)

    by_unit = {}
    for job in m["sabana"]:
        by_unit.setdefault(job["unit"], {"hours": 0, "days": 0, "codes": set()})
        by_unit[job["unit"]]["hours"] += job["hours"]
        by_unit[job["unit"]]["days"] += 1
        by_unit[job["unit"]]["codes"].add(job["code"])
    sabana_rows = []
    for unit in ("CPW-03", "CPW-02", "CPW-04", "CPW-05", "CPW-06", "CPW-10", "CPW-11", "CPW-12", "JIN-01", "JIN-02"):
        info = by_unit.get(unit)
        if not info:
            continue
        pp = next((u["pp"] for u in m["units"] if u["name"] == unit or u["tag"] == unit), 0)
        codes = " · ".join(f"M{c}" for c in sorted(info["codes"]))
        sabana_rows.append(
            f"<tr><td>{esc(unit)}</td><td>{esc(codes)}</td><td class='num'>{n(info['days'], 0)}</td>"
            f"<td class='num'>{n(info['hours'], 0)}</td><td class='num'>{n(pp, 0)}</td></tr>"
        )
    sabana_days = len({j["date"] for j in m["sabana"]})
    sabana_hours = sum(j["hours"] for j in m["sabana"])
    cpw03_jobs = [j for j in m["sabana"] if j["unit"] == "CPW-03"]
    cpw03_from = min(j["date"] for j in cpw03_jobs).strftime("%d-%m") if cpw03_jobs else "—"
    cpw03_to = max(j["date"] for j in cpw03_jobs).strftime("%d-%m") if cpw03_jobs else "—"
    hecho = [
        ("01-sep", "CPW-02", "Preventivo programado. Sale a las 07:15 y entra a las 17:34 con gas Moqueta.", "10 h"),
        ("03-sep", "CPW-10", "M5 de 08:00 a 15:20. Antes había salido por estabilidad de gas a 15 psi. Entra a las 17:47.", "7 h"),
        ("04-sep", "JIN-01", "Preventivo programado de 05:08 a 16:48. Entra sin novedad.", "11 h"),
        ("05-sep", "CPW-04", "Preventivo adelantado por oportunidad, concertado con el jefe. De 07:55 a 16:20.", "8 h"),
        ("07-sep", "CPW-12", "Preventivo programado de 06:00 a 17:00.", "12 h"),
        ("10-sep", "JIN-02", "Preventivo programado en Vonú desde las 05:10.", "14 h"),
        ("10-sep", "CPW-05", "Programado para este día y no ejecutado: no cumplía las horas de mantenimiento. Queda para la segunda semana de octubre.", "—", "pend"),
        ("14-sep", "CPW-11", "M5 ejecutado desde las 06:28. Antes salió por la MRU (03:05–04:22).", "12 h"),
        ("16-sep", "CPW-10", "Preventivo desde las 06:00, después de una salida por baja presión de la MRU (12 psi).", "11 h"),
        ("17-sep", "JIN-01", "M5 ejecutado de 05:23 a 15:33.", "10 h"),
        ("23 al 26-sep", "CPW-03", "Cambio programado de rodamientos del generador. Sale el 23 a las 04:58 y entra el 26 a las 23:05.", "71 h", "bloque"),
        ("28-sep", "JIN-02", "Preventivo programado de 05:00 a 16:10.", "11 h"),
        ("30-sep", "JIN-01", "Cierra el mantenimiento e ingresa a las 19:00 con 400 kW.", "8 h"),
    ]
    hecho_rows = "".join(
        f"<tr class='{row[4] if len(row) > 4 else ''}'><td>{esc(row[0])}</td><td>{esc(row[1])}</td><td>{esc(row[2])}</td><td class='num'>{esc(row[3])}</td></tr>"
        for row in hecho
    )
    s10 = page(12, f"""
        <h2 class="title">Mantenimiento ejecutado en septiembre</h2>
        <div class="kpis k4">
          {kpi("Plan del mes", "12 de 13", "CPW-05 queda para octubre", "ok")}
          {kpi("Peso de CPW-03", "38 %", "71 h de las 185 h de parada", "blue")}
          {kpi("Preventivo medio", "10,4 h", "11 trabajos, entre 7 y 14 h", "ok")}
          {kpi("M5 ejecutados", "3", "CPW-10 · CPW-11 · JIN-01", "blue")}
        </div>
        <table class="mto"><thead><tr><th>Fecha</th><th>Equipo</th><th>Qué se hizo</th><th class="num">Horas</th></tr></thead>
        <tbody>{hecho_rows}</tbody></table>
        """)

    s11 = page(13, f"""
        <h2 class="title">Inventario y HSE</h2>
        <div class="kpis k3">
          {kpi("Ítems con stock", str(m["inventario"]["n"]), "bodega Costayaco · corte 16-sep", "blue")}
          {kpi("Todo en stock", "100 %", f"los {m['inventario']['n']} ítems están en bodega", "ok")}
          {kpi("Incidentes HSE", "0", "tres semanas · laboral, ambiental, FAC y vial", "ok")}
        </div>
        <div class="bodega">
          <figure class="shot"><img src="bodega-costayaco.jpg" alt="Pasillo de la bodega Costayaco, con estanterías y cajas a ambos lados"><figcaption>Bodega Costayaco · corte del inventario</figcaption></figure>
          <div class="card"><h4>Reportes semanales</h4>
            <ul class="chips">
              <li><strong>07–12 sep</strong><span>Químicos, espacios confinados, LOTO y seguridad vial. Flash 1 · 6 asistentes.</span></li>
              <li><strong>14–19 sep</strong><span>Alturas, confinados con H2S y bloqueo. Incidentes 0 · safety cards 0.</span></li>
              <li><strong>21–26 sep</strong><span>Izaje, gestión ambiental, LOTO y productos químicos. SIMOPS con 6 empresas.</span></li>
            </ul>
          </div>
        </div>
        """)

    lost_mwh = m["mru_lost_kwh"] / 1000
    pf_if = m["pf_if"]
    s_pmc = page(10, """
        <h2 class="title">Pruebas de máxima carga</h2>
        <div class="kpis k4">
          <article class=""><span>Pruebas</span><strong>9</strong><small>1 h cada una · 21 al 25 sep</small></article>
          <article class="ok"><span>Estables</span><strong>9</strong><small>sin disparo ni oscilación sostenida</small></article>
          <article class="blue"><span>Sobre la esperada</span><strong>3</strong><small>CPW-04 · CPW-06 · CPW-07</small></article>
          <article class=""><span>Sin prueba</span><strong>3</strong><small>CPW-05 · JIN-01 · JIN-02</small></article>
        </div>
        <table class="mto"><thead><tr><th>Unidad</th><th>Fecha</th><th>Ventana</th><th>Gas</th><th class="num">Esperada</th><th class="num">Entregada</th><th class="num">%</th><th class="num">Psi</th></tr></thead>
        <tbody>
          <tr><td>CPW-01</td><td>21-sep</td><td>07:44 – 08:44</td><td>MRU</td><td class="num">780</td><td class="num">739</td><td class="num">94,7 %</td><td class="num">35 → 46</td></tr>
          <tr><td>CPW-02</td><td>21-sep</td><td>09:13 – 10:13</td><td>MRU</td><td class="num">780</td><td class="num">780</td><td class="num">100 %</td><td class="num">46 → 46</td></tr>
          <tr><td>CPW-03</td><td>21-sep</td><td>10:37 – 11:37</td><td>MRU</td><td class="num">780</td><td class="num">749</td><td class="num">96,0 %</td><td class="num">47 → 46</td></tr>
          <tr><td>CPW-06</td><td>22-sep</td><td>14:08 – 15:08</td><td>Moqueta</td><td class="num">1.040</td><td class="num">1.049</td><td class="num">100,9 %</td><td class="num">149 → 138</td></tr>
          <tr><td>JIN-10</td><td>22-sep</td><td>06:53 – 07:53</td><td>MRU</td><td class="num">450</td><td class="num">446</td><td class="num">99,1 %</td><td class="num">25 → 26</td></tr>
          <tr><td>JIN-11</td><td>22-sep</td><td>09:57 – 10:57</td><td>Costayaco</td><td class="num">450</td><td class="num">450</td><td class="num">100 %</td><td class="num">29 → 29</td></tr>
          <tr><td>JIN-12</td><td>22-sep</td><td>11:12 – 12:12</td><td>Costayaco</td><td class="num">450</td><td class="num">440</td><td class="num">97,8 %</td><td class="num">29 → 29</td></tr>
          <tr><td>CPW-07</td><td>23-sep</td><td>09:24 – 10:24</td><td>MRU</td><td class="num">740</td><td class="num">821</td><td class="num">110,9 %</td><td class="num">150 → 152</td></tr>
          <tr><td>CPW-04</td><td>25-sep</td><td>09:36 – 10:36</td><td>Moqueta</td><td class="num">1.040</td><td class="num">1.115</td><td class="num">107,2 %</td><td class="num">151 → 130</td></tr>
        </tbody></table>
        <div class="card">
          <h4>Conclusión</h4>
          <p class="regla">Las nueve unidades sostuvieron la carga una hora y cerraron estables, sin disparo. Tres la superaron: CPW-07 (110,9 %), CPW-04 (107,2 %) y CPW-06 (100,9 %). La más baja fue CPW-01, con 739 kW frente a 780 (94,7 %), y también cerró estable.</p>
        </div>
        """)

    s12 = page(14, f"""
        <h2 class="title">Conclusiones</h2>
        <ol class="conc">
          <li><strong>Septiembre cumple el contrato.</strong> Costayaco cierra en 99,44 %. La generación de gas cierra en 87,3 MWh por día.</li>
          <li><strong>Costayaco queda sobre 98 %.</strong> Disponibilidad y confiabilidad: 99,44 %. Cuatro fallas. MTBF 1.518,16 h.<br>CPW-03 (90,14 %) es el cambio de rodamientos. JIN-10: 97,50 %, confiabilidad 100 %.</li>
          <li><strong>Las cuatro fallas son de copower.</strong> CPW-01: 1 h. CPW-06: dos fallas, 99,85 %. CPW-07: 2 h, 99,72 %.</li>
          <li><strong>Vonú queda sobre 90 %.</strong> Disponibilidad 95,14 % y confiabilidad 100 %. Sin fallas y sin stand-by.<br>La energía pasa de 491,9 a 253,3 MWh.</li>
          <li><strong>El seguimiento del mes es CPW-06.</strong> Dos fallas y salidas por gas Moqueta. G101V, G102J y G102K no operaron.</li>
          <li><strong>Las pruebas de máxima carga cerraron estables.</strong> Nueve unidades, una hora, sin disparo.<br>CPW-07, CPW-04 y CPW-06 superaron la esperada. CPW-01: 739 de 780 kW.</li>
        </ol>
        """)

    doc = f"""<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
      <title>Indicadores COPOWER PUTN · Septiembre 2026</title><style>:root{{--slide-bg:url("{BG_SRC}")}}{CSS}</style></head>
      <body>{s1}{s2}{s_cfg}{s6}{s3}{s4}{s5}{s7}{s8}{s_pmc}{s9}{s10}{s11}{s12}
      <script>
      function fitSlides() {{
        var s = Math.min(1, (window.innerWidth - 16) / (10 * 96));
        document.querySelectorAll(".slide").forEach(function (el) {{ el.style.zoom = String(s); }});
      }}
      addEventListener("resize", fitSlides);
      fitSlides();
      </script></body></html>"""
    OUT_HTML.write_text(doc, encoding="utf-8")
    print(OUT_HTML)
    print(
        f"disp {p['disp']:.4f} mwh/d {m['mwh_d']:.2f} mru_ext {m['mru_ext']:.0f} "
        f"lost_h {m['mru_lost_h']:.0f} lost_mwh {lost_mwh:.2f} pf_if {pf_if:.0f} bit_mru {m['bit_mru']}"
    )


if __name__ == "__main__":
    render(build())
