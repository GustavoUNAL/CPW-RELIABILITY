#!/usr/bin/env python3
"""Presentación de indicadores Acordionero Pad 4 · septiembre 2026 (cierre 01–30).

El tablero contractual sale del anexo GTE (N+1). La curva diaria, las horas y
las pruebas salen del reporte y del formato de la carpeta de septiembre.
La hoja de indicadores COPOWER se cita cuando su lectura no coincide con GTE.
"""
from __future__ import annotations

import html
import importlib.util
import shutil
from collections import defaultdict
from datetime import date
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
SEP = ROOT / "data/Acordionero/informes/2026-09"
REPORTE = ROOT / "data/Acordionero/operacion/2026-09/Reporte de generación diario ACR pad 4.xlsx"
OUT_HTML = SEP / "indicadores-septiembre-2026.html"
IMG_SRC = ROOT / "data/Costayaco/informes/2026-09"
META = 0.98
AGO_KWH = 3_746_118
AGO_DAYS = 31
# Energía que el reporte diario carga el 9-sep en G803 y GTE deja en cero.
G803_DIA_MTO = 20_869

# Anexo GTE, página 6. MTBF None = sin fallas.
GTE = [
    ("G801", "J420", 346558, 413.1, 0.9983, 0.9994, 3, 101.90, 0.15, "Riesgo medio", False),
    ("G802", "J420", 726800, 27.15, 0.9706, 0.9817, 3, 223.90, 4.38, "Riesgo alto", False),
    ("G803", "J420", 751304, 1.05, 0.9873, 0.9942, 5, 141.96, 0.84, "Riesgo alto", False),
    ("G804", "J420", 819800, 25.5, 0.9993, 0.9993, 1, 694.00, 0.50, "Riesgo bajo", True),
    ("G805T", "J320", 523440, 103.8, 0.9997, 1.0, 0, None, 0.0, "Riesgo bajo", True),
    ("G806T", "Jinan", 82657, 512.9, 0.9999, 0.9999, 1, 207.00, 0.10, "Riesgo bajo", True),
    ("G807T", "Jinan", 60571, 564.0, 1.0, 1.0, 0, None, 0.0, "Riesgo bajo", True),
    ("J320-1", "J320", 548924, 69.0, 0.9943, 0.9985, 2, 323.45, 0.55, "Riesgo bajo", False),
]
GTE_KWH = 3_860_054
GTE_SB = 1716.5
GTE_FAILS = 15
GTE_MTBF = 381.57
GTE_MTTR = 1.30
GTE_DISP_P = 0.9993
GTE_REL_P = 0.9998
# Hoja ACR pad 4 Sep, fila SISTEMA N.
COP_DISP = 0.9655913978494624
COP_REL = 0.9784722222222222
COP_KWH = 3_880_923
HIST = [
    ("Ene", 3_430_300, 31),
    ("Feb", 2_908_620, 28),
    ("Mar", 3_459_400, 31),
    ("Abr", 3_349_816, 30),
    ("May", 3_448_400, 31),
    ("Jun", 3_219_300, 30),
    ("Jul", 3_450_513, 31),
    ("Ago", AGO_KWH, AGO_DAYS),
]


def load_style():
    path = ROOT / "scripts/build-indicadores-septiembre-2026.py"
    spec = importlib.util.spec_from_file_location("ind_putn", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def n(v, d=0):
    s = f"{v:,.{d}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def pct(v, d=2):
    return f"{n(v * 100, d)} %"


def esc(s):
    return html.escape(str(s), quote=True)


def kpi(label, value, note, tone=""):
    return f'<article class="{tone}"><span>{esc(label)}</span><strong>{value}</strong><small>{note}</small></article>'


def site_card(title, note, rows, edge):
    items = "".join(f"<dt>{esc(lab)}</dt><dd class='{cls}'>{val}</dd>" for lab, val, cls in rows)
    return f'<article class="{edge}"><h3>{esc(title)}</h3><p class="sub">{note}</p><dl>{items}</dl></article>'


def page(npage, inner, cover=False):
    source = "" if cover else (
        '<p class="src">Fuente: evaluación GTE ACRD septiembre 2026 · indicadores ACR Pad 4 · '
        "reporte diario 01–30 · formato de pruebas de carga. El tablero contractual y la energía de cierre son los de GTE.</p>"
    )
    body = inner if cover else f'<div class="pad">{inner}{source}</div>'
    return f'<article class="slide">{body}<span class="pn">{npage}</span></article>'


def cubic(xs, ys):
    d = f"M {xs[0]:.1f} {ys[0]:.1f}"
    for i in range(len(xs) - 1):
        mx = (xs[i] + xs[i + 1]) / 2
        d += f" C {mx:.1f} {ys[i]:.1f}, {mx:.1f} {ys[i + 1]:.1f}, {xs[i + 1]:.1f} {ys[i + 1]:.1f}"
    return d


def gen_svg(points):
    w, h = 860, 250
    pad = {"l": 36, "r": 12, "t": 16, "b": 22}
    iw, ih = w - pad["l"] - pad["r"], h - pad["t"] - pad["b"]
    gens = [p["gen"] for p in points]
    lo, hi = min(gens) * 0.92, max(gens) * 1.08
    xs = [pad["l"] + i / (len(points) - 1) * iw for i in range(len(points))]

    def y_at(v):
        return pad["t"] + ih - (v - lo) / (hi - lo) * ih

    ys = [y_at(p["gen"]) for p in points]
    area = f"{cubic(xs, ys)} L {xs[-1]:.1f} {pad['t'] + ih:.1f} L {xs[0]:.1f} {pad['t'] + ih:.1f} Z"
    ticks = [round(min(gens) / 10) * 10, round(max(gens) / 10) * 10]
    grid = []
    for t in sorted(set(ticks)):
        yy = y_at(t)
        grid.append(f'<line x1="{pad["l"]}" y1="{yy:.1f}" x2="{w - pad["r"]}" y2="{yy:.1f}" stroke="#e8eef4"/>')
        grid.append(f'<text x="{pad["l"] - 6}" y="{yy + 3:.1f}" text-anchor="end" font-size="9" fill="#94a3b8" font-family="Arial">{n(t, 0)}</text>')
    dots, labels, tags = [], [], []
    for i, p in enumerate(points):
        col = "#C0392B" if p["now"] else "#1E3A5F"
        dots.append(f'<circle cx="{xs[i]:.1f}" cy="{ys[i]:.1f}" r="{4.2 if p["now"] else 3.1}" fill="{col}"/>')
        labels.append(f'<text x="{xs[i]:.1f}" y="{h - 6}" text-anchor="middle" font-size="11" fill="#64748b" font-family="Arial">{esc(p["month"])}</text>')
        if p["month"] not in {"Feb", "Ago", "Sep"}:
            continue
        anchor = "start" if i == 0 else ("end" if i == len(points) - 1 else "middle")
        tags.append(
            f'<text x="{xs[i]:.1f}" y="{ys[i] - 8:.1f}" text-anchor="{anchor}" font-size="10" font-weight="700" fill="{col}" font-family="Arial">{n(p["gen"], 0)}</text>'
        )
    return f'''<svg viewBox="0 0 {w} {h}" width="100%" height="100%" role="img">
      {''.join(grid)}
      <path d="{area}" fill="rgb(30 58 95 / 10%)"/>
      <path d="{cubic(xs, ys)}" fill="none" stroke="#1E3A5F" stroke-width="2.4"/>
      {''.join(dots)}{''.join(tags)}{''.join(labels)}
    </svg>'''


def load_rows():
    wb = openpyxl.load_workbook(REPORTE, data_only=True, read_only=True)
    rows = []
    for r in wb.active.iter_rows(min_row=4, values_only=True):
        if not r or r[0] is None:
            continue
        rows.append({
            "date": r[0].date(),
            "model": str(r[4]).strip(),
            "tag": str(r[5]).strip(),
            "kwh": float(r[9] or 0),
            "op": float(r[11] or 0),
            "sb": float(r[12] or 0),
            "pp": float(r[13] or 0),
            "corr": float(r[14] or 0),
            "ext": float(r[15] or 0),
            "fails": float(r[17] or 0),
            "fuel": str(r[18] or "").strip(),
        })
    wb.close()
    return rows


def copy_images():
    for name in ("equipo-j320.png", "equipo-j420.png", "equipo-jinan.png"):
        shutil.copyfile(IMG_SRC / name, SEP / name)


def render():
    mod = load_style()
    rows = load_rows()
    by_day = defaultdict(float)
    by_tag = defaultdict(lambda: {"kwh": 0.0, "op": 0.0, "sb": 0.0, "pp": 0.0, "fails": 0.0})
    fails_day = defaultdict(float)
    fuels = set()
    for r in rows:
        by_day[r["date"]] += r["kwh"]
        u = by_tag[r["tag"]]
        for k in ("kwh", "op", "sb", "pp", "fails"):
            u[k] += r[k]
        fails_day[r["date"]] += r["fails"]
        if r["fuel"]:
            fuels.add(r["fuel"])
    days = sorted(by_day)
    gen_days = [(d, by_day[d] / 1000) for d in days]
    peak = max(gen_days, key=lambda x: x[1])
    valle = min(gen_days, key=lambda x: x[1])
    op = sum(r["op"] for r in rows)
    sb = sum(r["sb"] for r in rows)
    pp = sum(r["pp"] for r in rows)
    ext = sum(r["ext"] for r in rows)
    fails_n = sum(r["fails"] for r in rows)
    reporte_kwh = sum(r["kwh"] for r in rows)
    if abs(reporte_kwh - COP_KWH) > 2:
        raise SystemExit(f"reporte {reporte_kwh} != hoja {COP_KWH}")
    g803_9 = sum(r["kwh"] for r in rows if r["tag"] == "G803" and r["date"] == date(2026, 9, 9))
    if abs(g803_9 - G803_DIA_MTO) > 2:
        raise SystemExit(f"G803 9-sep {g803_9}")

    mwh = GTE_KWH / 1000
    mwh_d = mwh / 30
    ago_d = AGO_KWH / 1000 / AGO_DAYS
    delta = (mwh_d - ago_d) / ago_d
    uso = op / (op + sb)
    kw = GTE_KWH / op

    def avg_kw(tags):
        kk = sum(by_tag[t]["kwh"] for t in tags)
        oo = sum(by_tag[t]["op"] for t in tags)
        return kk / oo

    j420_kw = avg_kw(["G801", "G802", "G803", "G804"])
    j320_kw = avg_kw(["G-805T", "G-J320-1"])
    jin_kw = avg_kw(["G-806T", "G-807T"])

    trend = [{"month": m, "gen": kwh / 1000 / dd, "now": False} for m, kwh, dd in HIST]
    trend.append({"month": "Sep", "gen": mwh_d, "now": True})

    ymax = max(v for _, v in gen_days) * 1.08
    bars = []
    for d, val in gen_days:
        label = str(d.day) if d.day in (1, 8, 15, 22, 30) else ""
        bars.append(f'<div><span style="height:{val / ymax * 100:.1f}%"><i class="gas"></i></span><em>{label}</em></div>')

    fleets = {
        "J420": sum(kwh for _, fl, kwh, *_ in GTE if fl == "J420"),
        "J320": sum(kwh for _, fl, kwh, *_ in GTE if fl == "J320"),
        "Jinan": sum(kwh for _, fl, kwh, *_ in GTE if fl == "Jinan"),
    }
    fleet_max = max(fleets.values())

    def mtbf_cell(v):
        return "Sin fallas" if v is None else n(v, 2 if v < 100 else 2)

    body_rows = []
    for tag, fl, kwh, sb_h, disp, rel, fails, mtbf, mttr, risk, ok in GTE:
        riesgo = "no" if "bajo" in risk else "si"
        cumple = "no" if ok else "si"
        body_rows.append(
            "<tr>"
            f"<td>{esc(tag)}</td><td>{esc(fl)}</td>"
            f"<td class='num'>{n(kwh, 0)}</td><td class='num'>{n(sb_h, 2 if sb_h < 100 else 1)}</td>"
            f"<td class='num'>{pct(disp)}</td><td class='num'>{pct(rel)}</td>"
            f"<td class='num'>{fails}</td><td class='num'>{mtbf_cell(mtbf)}</td>"
            f"<td class='num'>{n(mttr, 2)}</td>"
            f"<td class='{riesgo}'>{esc(risk)}</td>"
            f"<td class='{cumple}'>{'Cumple' if ok else 'No cumple'}</td></tr>"
        )
    body_rows.append(
        "<tr class='bloque'><td>N+1 operacional</td><td>Pad 4</td>"
        f"<td class='num'>{n(GTE_KWH, 0)}</td><td class='num'>{n(GTE_SB, 1)}</td>"
        f"<td class='num'>100,00 %</td><td class='num'>100,00 %</td>"
        f"<td class='num'>{GTE_FAILS}</td><td class='num'>{n(GTE_MTBF, 2)}</td><td class='num'>{n(GTE_MTTR, 2)}</td>"
        "<td class='si'>Riesgo alto</td><td class='si'>No cumple</td></tr>"
    )
    body_rows.append(
        "<tr class='bloque'><td>N+1 probabilístico</td><td>Pad 4</td>"
        f"<td class='num'>{n(GTE_KWH, 0)}</td><td class='num'>{n(GTE_SB, 1)}</td>"
        f"<td class='num'>{pct(GTE_DISP_P)}</td><td class='num'>{pct(GTE_REL_P)}</td>"
        f"<td class='num'>{GTE_FAILS}</td><td class='num'>{n(GTE_MTBF, 2)}</td><td class='num'>{n(GTE_MTTR, 2)}</td>"
        "<td class='si'>Riesgo alto</td><td class='si'>No cumple</td></tr>"
    )

    ev_rows = [(d.day, int(fails_day[d]), 0) for d in days]
    ranked = sorted(GTE, key=lambda u: -u[2])
    emax = ranked[0][2] / 1000
    elis = "".join(
        f'<li><span>{esc(tag)}</span><b class="{"ok" if kwh >= GTE_KWH / 8 else ""}" style="width:{kwh / 1000 / emax * 100:.0f}%"></b><em>{n(kwh / 1000, 0)}</em></li>'
        for tag, _, kwh, *_ in ranked
    )
    causas = [
        ("Knocking por gas", 15),
        ("Ignición y bujías", 2),
        ("CPU y temperatura MAT", 2),
        ("Sincronismo", 1),
        ("Comunicación", 1),
        ("Presión MAP", 1),
        ("Potencia inversa", 1),
    ]
    cmax = causas[0][1]
    left = "".join(
        f'<li><span>{esc(name)}</span><b class="{"out" if i == 0 else ""}" style="width:{count / cmax * 100:.0f}%"></b><em>{count}</em></li>'
        for i, (name, count) in enumerate(causas)
    )
    actores = [("G803", 5), ("G801", 3), ("G802", 3), ("J320-1", 2), ("G804", 1), ("G806T", 1)]
    amax = actores[0][1]
    right = "".join(
        f'<li><span>{esc(name)}</span><b class="{"out" if i < 3 else ""}" style="width:{count / amax * 100:.0f}%"></b><em>{count}</em></li>'
        for i, (name, count) in enumerate(actores)
    )

    s1 = page(1, """
        <div class="cover"><div class="hero">
          <p class="kicker">PRESENTACIÓN DE INDICADORES · CIERRE 01–30</p>
          <h1>INDICADORES DE CONFIABILIDAD</h1>
          <p class="month">SEPTIEMBRE 2026</p><hr>
          <h2>PARQUE DE GENERACIÓN ACORDIONERO PAD 4</h2>
          <p class="author">Gustavo Arteaga<br>innovacion.confiabilidad@copower.com.co</p>
        </div></div>""", cover=True)

    s2 = page(2, f"""
        <h2 class="title">Resumen ejecutivo</h2>
        <div class="sites">
          {site_card("N+1 operacional", "8 unidades · cierre GTE · meta ≥ 98 %", [
            ("Generación", f"{n(mwh, 1)} MWh", ""),
            ("Disponibilidad", "100,00 %", "ok"),
            ("Confiabilidad", "100,00 %", "ok"),
            ("Fallas", "15 · condición crítica", "warn"),
            ("MTBF / MTTR", f"{n(GTE_MTBF, 0)} h · {n(GTE_MTTR, 2)} h", ""),
            ("Uso", pct(uso, 1), ""),
          ], "p")}
          {site_card("N+1 probabilístico", "misma energía · la redundancia no borra la frecuencia", [
            ("Disponibilidad", pct(GTE_DISP_P), "ok"),
            ("Confiabilidad", pct(GTE_REL_P), "ok"),
            ("Fallas", "15 · umbral crítico: 8", "warn"),
            ("Ritmo", f"{n(mwh_d, 1)} MWh/día", ""),
            ("Vs agosto", f"{n(delta * 100, 1)} %", "ok"),
            ("Stand-by", f"{n(GTE_SB, 1)} h", ""),
          ], "v")}
          {site_card("Hoja COPOWER", "sistema sin el alivio N+1 · G801 con 413 h de mantenimiento", [
            ("Generación", f"{n(COP_KWH / 1000, 1)} MWh", ""),
            ("Disponibilidad", pct(COP_DISP), "warn"),
            ("Confiabilidad", pct(COP_REL), "warn"),
            ("Fallas propias", "7", "warn"),
            ("Fallas externas", "16 · knocking", "warn"),
            ("Mantenimiento", "9 de 9", "ok"),
          ], "c")}
        </div>
        <div class="trend">
          <div class="trend-head">
            <h4>Energía entregada · MWh/día · Ene–Sep</h4>
            <p class="leg"><span><i class="d"></i>MWh/día</span><span>Sep · cierre GTE {n(mwh_d, 1)}</span><span>Ene–Jun: 4 J420 · Jul: entra J320 · Ago–Sep: 8 unidades</span></p>
          </div>
          {gen_svg(trend)}
        </div>
        """)

    s_cfg = page(3, f"""
        <h2 class="title">Configuración de equipos</h2>
        <table class="mto cfg"><thead><tr><th>Equipo</th><th>Modelo</th><th>Fabricante</th><th class="num">Instalada kW</th><th class="num">Promedio del mes<br>kW</th><th>Confianza</th></tr></thead><tbody>
          <tr class="j420"><td>G801</td><td>J420</td><td>Jenbacher</td><td class="num">1.400</td><td class="num">{n(by_tag['G801']['kwh'] / by_tag['G801']['op'], 0)}</td><td class="conf-ok">Confirmado · prueba 23-sep</td></tr>
          <tr class="j420"><td>G802</td><td>J420</td><td>Jenbacher</td><td class="num">1.400</td><td class="num">{n(by_tag['G802']['kwh'] / by_tag['G802']['op'], 0)}</td><td class="conf-mid">Sin prueba en septiembre</td></tr>
          <tr class="j420"><td>G803</td><td>J420</td><td>Jenbacher</td><td class="num">1.400</td><td class="num">{n(by_tag['G803']['kwh'] / by_tag['G803']['op'], 0)}</td><td class="conf-ok">Confirmado · prueba 25-sep</td></tr>
          <tr class="j420"><td>G804</td><td>J420</td><td>Jenbacher</td><td class="num">1.400</td><td class="num">{n(by_tag['G804']['kwh'] / by_tag['G804']['op'], 0)}</td><td class="conf-mid">Prueba fechada el 5-oct</td></tr>
          <tr class="j320"><td>G805T</td><td>J320</td><td>Jenbacher</td><td class="num">1.000</td><td class="num">{n(by_tag['G-805T']['kwh'] / by_tag['G-805T']['op'], 0)}</td><td class="conf-mid">Prueba fechada el 4-oct</td></tr>
          <tr class="j320"><td>J320-1</td><td>J320</td><td>Jenbacher</td><td class="num">1.000</td><td class="num">{n(by_tag['G-J320-1']['kwh'] / by_tag['G-J320-1']['op'], 0)}</td><td class="conf-rep">Reporte operativo</td></tr>
          <tr class="jin"><td>G806T</td><td>Jinan</td><td>Jinan</td><td class="num">500</td><td class="num">{n(by_tag['G-806T']['kwh'] / by_tag['G-806T']['op'], 0)}</td><td class="conf-rep">Reporte operativo</td></tr>
          <tr class="jin"><td>G807T</td><td>Jinan</td><td>Jinan</td><td class="num">500</td><td class="num">{n(by_tag['G-807T']['kwh'] / by_tag['G-807T']['op'], 0)}</td><td class="conf-rep">Reporte operativo</td></tr>
        </tbody></table>
        <p class="regla">El promedio es kWh / hora de operación del reporte diario. Confirmado: hay prueba de una hora dentro de septiembre. GTE reporta además 1.175, 1.132, 1.136 y 1.190 kW en los cuatro J420, y 862 kW en J320 frente a 950 kW solicitados.</p>
        <div class="flota">
          <article class="j420">
            <header><h3>Jenbacher J420</h3><p>Instalada 1.400 kW</p><p>Promedio del mes {n(j420_kw, 0)} kW</p></header>
            <div class="cuerpo"><img src="equipo-j420.png" alt="Grupo electrógeno Jenbacher J420"><ul><li class="lab">Equipos</li><li>G801</li><li>G802</li><li>G803</li><li>G804</li></ul></div>
          </article>
          <article class="j320">
            <header><h3>Jenbacher J320</h3><p>Instalada 1.000 kW</p><p>Promedio del mes {n(j320_kw, 0)} kW</p></header>
            <div class="cuerpo"><img src="equipo-j320.png" alt="Grupo electrógeno Jenbacher J320"><ul><li class="lab">Equipos</li><li>G805T</li><li>J320-1</li></ul></div>
          </article>
          <article class="jin">
            <header><h3>Jinan</h3><p>Instalada 500 kW</p><p>Promedio del mes {n(jin_kw, 0)} kW</p></header>
            <div class="cuerpo"><img src="equipo-jinan.png" alt="Grupo electrógeno Jinan"><ul><li class="lab">Equipos</li><li>G806T</li><li>G807T</li></ul></div>
          </article>
        </div>
        """)

    s_maq = page(4, f"""
        <h2 class="title">Desempeño por máquina</h2>
        <p class="regla">Cifras del anexo GTE. Disponibilidad y confiabilidad mínimas: 98 %. A partir del 1 de septiembre el bloque se mide en N+1. Cumplir disponibilidad no alcanza si la frecuencia entra en deterioro.</p>
        <table><thead><tr><th>Unidad</th><th>Flota</th><th class="num">Energía kWh</th><th class="num">Stand-by h</th><th class="num">Disp.</th><th class="num">Conf.</th><th class="num">Fallas</th><th class="num">MTBF h</th><th class="num">MTTR h</th><th>Riesgo</th><th>Cumple</th></tr></thead>
        <tbody>{''.join(body_rows)}</tbody></table>
        <div class="method">
          <article class="d"><h4>Frecuencia del sistema</h4><p class="regla">0 a 2 eventos: cumple. 3 a 4: advertencia. 5 a 6: plan correctivo. 7: incumplimiento significativo. 8 o más: condición crítica. Septiembre cierra en 15.</p></article>
          <article class="a"><h4>Frecuencia individual</h4><p class="regla">0 a 1: cumple. 2: desviación. 3: deterioro. 4 a 5: incumplimiento grave. 6 o más: reemplazo. G803 queda en 5, G801 y G802 en 3, J320-1 en 2.</p></article>
        </div>
        """)

    s_conf = page(5, f"""
        <h2 class="title">Confiabilidad</h2>
        <p class="regla">R% = (Tplan − FO) / Tplan. MTBF del anexo: horas de operación entre las fallas que GTE cuenta. MTTR: horas de falla entre el número de fallas.</p>
        <div class="kpis k4">
          {kpi("N+1 operacional", "100 %", "el respaldo contiene la salida de una unidad", "ok")}
          {kpi("Fallas", "15", "condición crítica · el umbral es 8", "warn")}
          {kpi("MTBF", f"{n(GTE_MTBF, 2)} h", "anexo GTE · 15 fallas del bloque", "warn")}
          {kpi("MTTR", f"{n(GTE_MTTR, 2)} h", "G802 concentra el tiempo: 4,38 h", "warn")}
        </div>
        <table class="mto compact"><thead><tr><th>Unidad</th><th class="num">Fallas</th><th class="num">MTBF</th><th class="num">MTTR</th><th>Lectura</th></tr></thead><tbody>
          <tr class="bloque"><td>N+1</td><td class="num">15</td><td class="num">{n(GTE_MTBF, 2)} h</td><td class="num">{n(GTE_MTTR, 2)} h</td><td>Crítica por frecuencia. Confiabilidad operacional 100 %.</td></tr>
          <tr><td>G803</td><td class="num">5</td><td class="num">141,96 h</td><td class="num">0,84 h</td><td>Incumplimiento grave. En agosto tenía una falla y MTTR 0,4 h.</td></tr>
          <tr><td>G801</td><td class="num">3</td><td class="num">101,90 h</td><td class="num">0,15 h</td><td>Deterioro. El MTTR baja de 14,7 h a 0,15 h; la frecuencia no.</td></tr>
          <tr><td>G802</td><td class="num">3</td><td class="num">223,90 h</td><td class="num">4,38 h</td><td>Deterioro y el mayor tiempo de reparación del parque.</td></tr>
          <tr><td>J320-1</td><td class="num">2</td><td class="num">323,45 h</td><td class="num">0,55 h</td><td>Desviación. MAP y potencia inversa.</td></tr>
          <tr><td>G804</td><td class="num">1</td><td class="num">694,00 h</td><td class="num">0,50 h</td><td>Cumple. Pérdida de sincronismo el 6-sep.</td></tr>
          <tr><td>G806T</td><td class="num">1</td><td class="num">207,00 h</td><td class="num">0,10 h</td><td>Cumple. Comunicación el 5-sep. Stand-by 512,9 h.</td></tr>
          <tr><td>G805T · G807T</td><td class="num">0</td><td class="num">—</td><td class="num">0</td><td>Sin fallas contractuales. G807T sale el 29 por el cambio a J420 definitiva.</td></tr>
        </tbody></table>
        """)

    s_disp = page(6, f"""
        <h2 class="title">Disponibilidad</h2>
        <div class="kpis k3">
          {kpi("N+1 operacional", "100 %", "agosto, sistema N: 98,17 %", "ok")}
          {kpi("N+1 probabilístico", pct(GTE_DISP_P), f"confiabilidad probabilística {pct(GTE_REL_P)}", "ok")}
          {kpi("Bajo la meta", "G802", "97,06 % · la única unidad bajo 98 %", "warn")}
        </div>
        <div class="method">
          <article class="d"><h4>Cómo cierra GTE el bloque</h4>
            <p class="regla">Con redundancia, la salida de una máquina no baja la disponibilidad operacional. Por eso el N+1 queda en 100 % aunque haya 15 fallas. La lectura probabilística reconoce el riesgo residual: {pct(GTE_DISP_P)} y {pct(GTE_REL_P)}. Las dos pasan 98 %.</p>
            <p class="regla">El descuento contractual por disponibilidad es no facturar el equipo no disponible y cobrar la energía dejada de suministrar. La confiabilidad se descuenta por rangos bajo 98 %.</p>
          </article>
          <article class="a"><h4>G801 y la hoja COPOWER</h4>
            <p class="regla">GTE separa el cambio de control de G801, del 1 al 18 de septiembre, y le asigna 99,83 % de disponibilidad y 99,94 % de confiabilidad. En agosto estaba en 90,09 % y 90,11 %.</p>
            <p class="regla">La hoja COPOWER carga esas 413 h como mantenimiento y deja a G801 en 42,64 %. El sistema de esa hoja cierra en {pct(COP_DISP)} de disponibilidad y {pct(COP_REL)} de confiabilidad.</p>
          </article>
        </div>
        <div class="method">
          <article class="r"><h4>G802 · 97,06 %</h4><p class="regla">Confiabilidad 98,17 %, todavía sobre la meta. El faltante de disponibilidad son las horas de reparación (MTTR 4,38 h) más el preventivo. Stand-by del anexo: 27,15 h.</p></article>
          <article class="d"><h4>Unidades con poca exposición</h4><p class="regla">G806T suma 512,9 h de stand-by y G807T 564 h. Cerrar sin fallas, o con una sola, se lee junto con esas horas fuera de carga. G801 conserva 3 fallas con solo 306,6 h de operación.</p></article>
        </div>
        """)

    s_gen = page(7, f"""
        <h2 class="title">Detalle de la generación</h2>
        <div class="kpis k4">
          {kpi("Cierre GTE", f"{n(mwh, 1)} MWh", f"reporte diario {n(COP_KWH / 1000, 1)} MWh")}
          {kpi("Ritmo diario", f"{n(mwh_d, 1)} MWh/d", f"{n(delta * 100, 1)} % vs ago {n(ago_d, 1)}", "ok")}
          {kpi("Pico diario", f"{n(peak[1], 0)} MWh", f"día {peak[0].day} · mínimo {n(valle[1], 0)} MWh el día {valle[0].day}", "violet")}
          {kpi("Potencia media", f"{n(kw, 0)} kW", f"{n(op, 0)} h de operación", "blue")}
        </div>
        <div class="kpis k4">
          {kpi("J420", f"{n(fleets['J420'] / 1000, 0)} MWh", pct(fleets["J420"] / GTE_KWH, 1), "blue")}
          {kpi("J320", f"{n(fleets['J320'] / 1000, 0)} MWh", "G805T y J320-1", "")}
          {kpi("Jinan", f"{n(fleets['Jinan'] / 1000, 0)} MWh", pct(fleets["Jinan"] / GTE_KWH, 1), "")}
          {kpi("Gas", "100 %", "sin diésel en el reporte del mes", "ok")}
        </div>
        <div class="days">
          <div class="trend-head">
            <h4>Generación diaria del reporte · MWh</h4>
            <p class="leg"><span><i class="d"></i>Gas</span><span>Pico día {peak[0].day} · {n(peak[1], 0)} MWh</span><span>G801 reingresa el 17</span></p>
          </div>
          <div class="bars">{''.join(bars)}</div>
          <ul class="hlist">
            <li><span>J420</span><b style="width:{fleets['J420'] / fleet_max * 100:.0f}%"></b><em>{n(fleets['J420'] / 1000, 0)} MWh · {pct(fleets['J420'] / GTE_KWH, 0)}</em></li>
            <li><span>J320</span><b class="ok" style="width:{fleets['J320'] / fleet_max * 100:.0f}%"></b><em>{n(fleets['J320'] / 1000, 0)} MWh · {pct(fleets['J320'] / GTE_KWH, 0)}</em></li>
            <li><span>Jinan</span><b style="width:{max(fleets['Jinan'] / fleet_max * 100, 2):.0f}%"></b><em>{n(fleets['Jinan'] / 1000, 0)} MWh · {pct(fleets['Jinan'] / GTE_KWH, 0)}</em></li>
          </ul>
        </div>
        """)

    s_fallas = page(8, f"""
        <h2 class="title">Fallas de septiembre</h2>
        <div class="kpis k3">
          {kpi("Contractuales GTE", "15", "condición crítica del criterio poblacional", "warn")}
          {kpi("Propias COPOWER", "7", "ignición, control, sincronismo, comunicación", "warn")}
          {kpi("Externas COPOWER", "16", "15 por knocking de gas y 1 por MAP", "")}
        </div>
        <table class="evt"><thead><tr><th>Fecha</th><th>Equipo</th><th>Fuera de línea</th><th>Evento y acción</th></tr></thead><tbody>
          <tr class="sec"><td colspan="4">Fallas de máquina en el reporte diario</td></tr>
          <tr class="cop"><td>05-sep<small>14:05</small></td><td><b>G806T</b></td><td class="hora">0,10 h</td><td class="relato"><span class="paso">Sale por falla de comunicación del módulo.</span><span class="hizo">Queda en stand-by.</span></td></tr>
          <tr class="cop"><td>06-sep<small>02:32</small></td><td><b>G804</b></td><td class="hora">0,50 h<small>02:32 – 03:00</small></td><td class="relato"><span class="paso">Pérdida de sincronismo.</span><span class="hizo">Reingreso a las 03:00.</span></td></tr>
          <tr class="cop"><td>11-sep</td><td><b>G803</b></td><td class="hora">4,10 h</td><td class="relato"><span class="paso">Detonación, válvula Medenus bloqueada y falla de CPU del PLC. El día trae 3 fallas.</span><span class="hizo">Correctivo 3,77 h y 0,33 h externas.</span></td></tr>
          <tr class="cop"><td>12-sep</td><td><b>G802</b></td><td class="hora">4,00 h</td><td class="relato"><span class="paso">Falla del sistema de ignición, con knocking.</span><span class="hizo">Sigue en la noche: el 13-sep el código 3345 suma otras 9 h.</span></td></tr>
          <tr class="cop"><td>12-sep</td><td><b>J320-1</b></td><td class="hora">1,00 h</td><td class="relato"><span class="paso">Alta presión de MAP por cambio de mezcla aire/gas.</span><span class="hizo">Ajuste de mezcla.</span></td></tr>
          <tr class="cop"><td>13-sep</td><td><b>G802</b></td><td class="hora">9,00 h</td><td class="relato"><span class="paso">Código 3345, lazo de seguridad de ignición. Viene de la noche anterior.</span><span class="hizo">El reporte no le suma otro número de falla.</span></td></tr>
          <tr class="cop"><td>14-sep<small>18:26</small></td><td><b>G803</b></td><td class="hora">0,77 h<small>18:26 – 19:14</small></td><td class="relato"><span class="paso">Temperatura MAT.</span><span class="hizo">Reingreso a las 19:14.</span></td></tr>
          <tr class="cop"><td>19-sep</td><td><b>G801</b></td><td class="hora">0,25 h</td><td class="relato"><span class="paso">Alta temperatura del sistema HT, ya en servicio después del cambio de control.</span><span class="hizo">Queda registrada en el data soporte.</span></td></tr>
          <tr class="cop"><td>23-sep<small>21:10</small></td><td><b>J320-1</b></td><td class="hora">0,10 h<small>21:10 – 21:12</small></td><td class="relato"><span class="paso">Potencia inversa.</span><span class="hizo">Reingreso a las 21:12.</span></td></tr>
          <tr class="cop"><td>26-sep<small>22:15</small></td><td><b>G802</b></td><td class="hora">0,15 h</td><td class="relato"><span class="paso">Falla de bujías 1, 12 y 13.</span><span class="hizo">El mismo día el reporte carga 2 h de preventivo.</span></td></tr>
          <tr class="sec"><td colspan="4">Protecciones por knocking · hoja COPOWER, 15 eventos y tiempos cortos</td></tr>
          <tr class="ext"><td>Todo el mes</td><td><b>G803 ×6</b></td><td class="hora">1,50 h</td><td class="relato"><span class="paso">Cambios de flujo entre producción, descompresora y TGI.</span><span class="hizo">Protección de combustión. Sin falla propia en esos disparos.</span></td></tr>
          <tr class="ext"><td>Todo el mes</td><td><b>G802 ×4</b></td><td class="hora">0,40 h</td><td class="relato"><span class="paso">Knocking por cambio de suministro. Ejemplos: 02-sep 01:23, 06-sep 19:22, 17-sep 02:02, 25-sep 01:46.</span><span class="hizo">Reingresos de 2 a 8 minutos.</span></td></tr>
          <tr class="ext"><td>26 al 30</td><td><b>G801 ×3</b></td><td class="hora">0,40 h</td><td class="relato"><span class="paso">26-sep 16:47, 28-sep 07:43 y 30-sep 04:29. Las tres quedan por revisar.</span><span class="hizo">GTE sí las cuenta dentro de las 3 fallas de la unidad.</span></td></tr>
          <tr class="ext"><td>04, 22-sep</td><td><b>G804 · G807T</b></td><td class="hora">0,20 h</td><td class="relato"><span class="paso">G807T el 4-sep y G804 el 22-sep 19:24–19:30.</span><span class="hizo">Una externa cada una, además del sincronismo de G804.</span></td></tr>
        </tbody></table>
        """)

    s_evt = page(9, f"""
        <h2 class="title">Eventos repetitivos y malos actores</h2>
        <p class="regla">La hoja COPOWER abre 23 eventos: 7 propios y 16 externos. GTE publica 15 fallas contractuales. No son el mismo conteo. El gráfico de la derecha usa el número con el que se evalúa el contrato.</p>
        <div class="kpis k4">
          {kpi("Bitácora", "23", "7 propias · 16 externas", "")}
          {kpi("Knocking", "15", "causa que más se repite", "warn")}
          {kpi("GTE", "15", "umbral crítico del sistema: 8", "warn")}
          {kpi("G803", "5", "mayor frecuencia contractual", "violet")}
        </div>
        <div class="split">
          <div class="card"><h4>Qué separa la hoja COPOWER</h4><ul class="hlist">{left}</ul></div>
          <div class="card"><h4>Fallas contractuales GTE</h4><ul class="hlist">{right}</ul></div>
        </div>
        <div class="trend" style="min-height:1.35in">
          <div class="trend-head">
            <h4>Número de fallas del reporte diario · 1–30 sep · {n(fails_n, 0)} eventos</h4>
            <p class="leg"><span><i class="d"></i>Eventos</span><span><i class="m"></i>Promedio</span></p>
          </div>
          {mod.event_svg(ev_rows)}
        </div>
        """)

    s_pmc = page(10, """
        <h2 class="title">Pruebas de máxima carga</h2>
        <div class="kpis k4">
          <article><span>En septiembre</span><strong>2</strong><small>G801 el 23 · G803 el 25</small></article>
          <article class="ok"><span>Estables</span><strong>2</strong><small>1.250 kW durante una hora, sin disparo</small></article>
          <article class="warn"><span>Sin prueba en el mes</span><strong>G802</strong><small>el formato tiene la fila vacía</small></article>
          <article class="blue"><span>Fechadas en octubre</span><strong>2</strong><small>G805T el 4-oct · G804 el 5-oct</small></article>
        </div>
        <table class="mto"><thead><tr><th>Unidad</th><th>Fecha</th><th>Ventana</th><th class="num">Consigna</th><th class="num">Sostenida</th><th class="num">MAP</th><th class="num">Gases °C</th><th class="num">FP</th></tr></thead>
        <tbody>
          <tr><td>G801</td><td>23-sep</td><td>14:10 – 15:10</td><td class="num">1.250</td><td class="num">1.250</td><td class="num">2,65</td><td class="num">545</td><td class="num">0,95</td></tr>
          <tr><td>G803</td><td>25-sep</td><td>12:10 – 13:10</td><td class="num">1.250</td><td class="num">1.250</td><td class="num">2,86 – 2,88</td><td class="num">548 – 549</td><td class="num">0,95</td></tr>
        </tbody></table>
        <div class="card">
          <h4>Conclusión</h4>
          <p class="regla">Las dos pruebas de septiembre sostuvieron 1.250 kW en los tres cortes de la hora, con frecuencia de 60 Hz. G801 trabajó con MAP 2,65 y voltaje 4.225–4.229 V. G803, con MAP 2,86–2,88 y voltaje 4.206–4.207 V. El informe dice que también se probaron G804 a 1.250 kW y un J320 a 950 kW; el formato las deja el 5-oct y el 4-oct, así que no entran en este cierre. G802 no tiene prueba cargada.</p>
        </div>
        <p class="regla">El promedio del mes sigue por debajo de la consigna de prueba: los J420 entregaron cerca de 1.120 kW por la mezcla con Tisquirama. GTE pide cerrar la ventana de G801 con parámetros de combustión, cromatografía y la corriente de gas de cada prueba antes de extender el ajuste.</p>
        """)

    ago_h = 100
    sep_h = mwh_d / ago_d * 100
    s_en = page(11, f"""
        <h2 class="title">Desempeño energético</h2>
        <div class="kpis k4">
          {kpi("Entrega / máquina", f"{n(mwh / 8, 0)} MWh", "promedio de 8 unidades en 30 días", "ok")}
          {kpi("Potencia media", f"{n(kw, 0)} kW", "energía GTE / hora de operación", "blue")}
          {kpi("Gas", "8,71 ft³/kWh", "33.581.789 ft³ · eficiencia 38,1 %", "")}
          {kpi("Vs agosto", f"+{n((mwh - AGO_KWH / 1000), 0)} MWh", f"{n(ago_d, 1)} → {n(mwh_d, 1)} MWh/día", "ok")}
        </div>
        <div class="split">
          <div class="card"><h4>Cuánto entregó cada máquina · MWh · cierre GTE</h4><ul class="hlist">{elis}</ul></div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <div class="card">
              <h4>Ritmo del parque · MWh/día</h4>
              <div class="vcols">
                <div><i class="prev" style="height:{ago_h:.0f}%"></i><strong>{n(ago_d, 0)}</strong><span>AGO</span></div>
                <div><i class="now" style="height:{sep_h:.0f}%"></i><strong>{n(mwh_d, 0)}</strong><span>SEP</span></div>
              </div>
              <p class="regla" style="text-align:center">+{n(mwh_d - ago_d, 1)} MWh/día · +{n(delta * 100, 1)} %</p>
            </div>
            <div class="card">
              <h4>Quién mueve el mes frente a agosto</h4>
              <p class="regla">G801 baja de 682 a 347 MWh por el cambio de control. Esa energía la cubren G805T (193 → 523 MWh) y J320-1 (341 → 549 MWh). G803 baja de 806 a 751 MWh en el cierre GTE y G804 de 883 a 820 MWh.</p>
            </div>
          </div>
        </div>
        """)

    s_mto = page(12, f"""
        <h2 class="title">Mantenimiento ejecutado en septiembre</h2>
        <div class="kpis k4">
          {kpi("Plan del mes", "9 de 9", "hoja de indicadores · planeados y ejecutados", "ok")}
          {kpi("Peso de G801", "413 h", "en la hoja van a mantenimiento; en el reporte, a stand-by", "blue")}
          {kpi("Preventivo del diario", f"{n(pp, 1)} h", "columna de preventivo, sin las 413 h de G801", "")}
          {kpi("Paradas externas", f"{n(ext, 1)} h", "knocking y otras, en el reporte", "warn")}
        </div>
        <table class="mto compact"><thead><tr><th>Fecha</th><th>Equipo</th><th>Qué se hizo</th><th class="num">Horas</th></tr></thead><tbody>
          <tr class="bloque"><td>01–18 sep</td><td>G801</td><td>Cambio de control DEEF y mantenimiento general. En el reporte esas horas quedan en stand-by. Entra en pruebas el 17 (8 h) y sigue el 18 (11 h).</td><td class="num">413 h</td></tr>
          <tr><td>01-sep</td><td>G805T</td><td>Sale a mantenimiento a las 17:08 y entra a las 17:35.</td><td class="num">0,2 h</td></tr>
          <tr><td>02-sep</td><td>J320-1</td><td>Análisis de vibraciones desde las 13:23.</td><td class="num">1 h</td></tr>
          <tr><td>07-sep</td><td>J320-1</td><td>Mantenimiento de 1.000 h, de 06:55 a 09:28.</td><td class="num">2 h</td></tr>
          <tr><td>08-sep</td><td>G802</td><td>Preventivo programado de 06:50 a 10:02.</td><td class="num">3 h</td></tr>
          <tr><td>09-sep</td><td>G803</td><td>Preventivo programado. El reporte trae 20.869 kWh ese día; GTE los deja en cero.</td><td class="num">4 h</td></tr>
          <tr><td>20-sep</td><td>G801 · G803</td><td>Ajuste de mezcla y rotación de equipos.</td><td class="num">0,8 · 1,3 h</td></tr>
          <tr><td>24-sep</td><td>G804</td><td>Cambio de tablero de control. Una hora en stand-by, sin número de falla.</td><td class="num">1 h</td></tr>
          <tr><td>26-sep</td><td>G802</td><td>Dos horas en la columna de preventivo, el mismo día de la falla de bujías.</td><td class="num">2 h</td></tr>
          <tr><td>28-sep</td><td>G802</td><td>Preventivo programado de 08:46 a 11:07.</td><td class="num">3 h</td></tr>
          <tr class="pend"><td>29–30 sep</td><td>G807T</td><td>Fuera de servicio por el ingreso de la J420 definitiva. No es un preventivo ejecutado.</td><td class="num">—</td></tr>
        </tbody></table>
        """)

    s_hse = page(13, """
        <h2 class="title">Repuestos y HSEQ</h2>
        <div class="kpis k3">
          <article class="ok"><span>Stock crítico</span><strong>Disponible</strong><small>campo, San Martín y Bucaramanga</small></article>
          <article class="blue"><span>Pedido de junio</span><strong>Recibido</strong><small>para completar el stock del plan</small></article>
          <article><span>Residuos</span><strong>SAPS · EMARACK</strong><small>sólidos y aceites usados, San Martín</small></article>
        </div>
        <div class="method">
          <article class="d"><h4>Repuestos</h4>
            <p class="regla">La hoja de septiembre dice que hay repuestos para los próximos mantenimientos: en campo, en la bodega de San Martín y en la bodega de Bucaramanga. El pedido recibido en junio completó ese stock. No hay en esta carpeta un inventario contado ítem por ítem, como el corte de bodega de Costayaco.</p>
          </article>
          <article class="r"><h4>Residuos</h4>
            <p class="regla">Los residuos los recoge SAPS. Los aceites usados los recoge EMARACK. Las dos son empresas de San Martín. El texto no trae un conteo de incidentes, quejas ni safety cards; por eso esta lámina no publica un cero.</p>
          </article>
        </div>
        <div class="card">
          <h4>Plan que deja el mes</h4>
          <ul class="chips">
            <li><strong>G802 y G804</strong><span>En noviembre siguen el cambio de control, la descarbonización de cámaras y el preventivo de alternadores.</span></li>
            <li><strong>Predictivo</strong><span>Continuar Windrock y el muestreo de aceite.</span></li>
            <li><strong>Frecuencia</strong><span>GTE pide bajar las fallas de G803, G801 y G802, y el MTTR de G802.</span></li>
            <li><strong>Gas y carga</strong><span>Cerrar combustión, cromatografía y el derrateo antes de copiar el ajuste de G801 al resto.</span></li>
          </ul>
        </div>
        """)

    s_fin = page(14, f"""
        <h2 class="title">Conclusiones</h2>
        <ol class="conc">
          <li><strong>El bloque N+1 abre sobre la meta de 98 %.</strong> Disponibilidad y confiabilidad operacionales: 100 %. La lectura probabilística queda en {pct(GTE_DISP_P)} y {pct(GTE_REL_P)}.</li>
          <li><strong>El contrato no se cumple por frecuencia.</strong> 15 fallas. El umbral crítico es 8. MTBF {n(GTE_MTBF, 2)} h y MTTR {n(GTE_MTTR, 2)} h.</li>
          <li><strong>Tres unidades explican el mes.</strong> G803 pasa a 5 fallas. G802 queda en 97,06 % de disponibilidad, con MTTR 4,38 h. G801 recupera disponibilidad de 90,09 % a 99,83 % y conserva 3 fallas.</li>
          <li><strong>La energía crece y G801 no es quien la aporta.</strong> Cierre GTE: {n(mwh, 1)} MWh, {n(mwh_d, 1)} MWh/día, frente a {n(AGO_KWH / 1000, 1)} MWh en agosto. G805T y J320-1 cubren las 413 h del cambio de control.</li>
          <li><strong>Lo que se repite es el knocking por el gas.</strong> La hoja COPOWER separa 7 fallas propias y 16 externas. Los J420 promedian {n(j420_kw, 0)} kW, por debajo de los 1.170 kW de agosto.</li>
          <li><strong>En septiembre quedaron dos pruebas de máxima carga.</strong> G801 y G803 sostuvieron 1.250 kW una hora. G802 no tiene prueba. G804 y G805T quedaron fechadas en octubre.</li>
        </ol>
        """)

    extra = """
    table.mto.compact td { padding: 2px 6px; font-size: 7.2pt; line-height: 1.25; }
    table.mto.compact th { padding: 3px 6px; font-size: 6.5pt; }
    table.evt td { font-size: 6.7pt; padding: 1px 6px; }
    table.evt th { padding: 3px 6px; }
    ol.conc { gap: 0.1in; }
    ol.conc li { font-size: 12pt; line-height: 1.22; }
    ol.conc strong { font-size: 13.5pt; }
    """
    doc = f"""<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
      <title>Indicadores COPOWER ACRD · Septiembre 2026</title>
      <style>:root{{--slide-bg:url("{mod.BG_SRC}")}}{mod.CSS}{extra}</style></head>
      <body>{s1}{s2}{s_cfg}{s_maq}{s_conf}{s_disp}{s_gen}{s_fallas}{s_evt}{s_pmc}{s_en}{s_mto}{s_hse}{s_fin}
      <script>
      function fitSlides() {{
        var s = Math.min(1, (window.innerWidth - 16) / (10 * 96));
        document.querySelectorAll(".slide").forEach(function (el) {{ el.style.zoom = String(s); }});
      }}
      addEventListener("resize", fitSlides);
      fitSlides();
      </script></body></html>"""
    copy_images()
    OUT_HTML.write_text(doc, encoding="utf-8")
    print(OUT_HTML)
    print(
        f"mwh {mwh:.1f} mwh/d {mwh_d:.2f} delta {delta:.3f} op {op:.1f} sb {sb:.1f} "
        f"uso {uso:.3f} kw {kw:.1f} pp {pp:.1f} ext {ext:.2f} fails {fails_n:.0f} "
        f"peak d{peak[0].day} {peak[1]:.1f} valle d{valle[0].day} {valle[1]:.1f} "
        f"j420 {j420_kw:.1f} j320 {j320_kw:.1f} jin {jin_kw:.1f} fuels {fuels}"
    )


if __name__ == "__main__":
    raise SystemExit(
        "El HTML de Acordionero se edita a mano en "
        "data/Acordionero/informes/Septiembre/indicadores-septiembre-2026.html. "
        "Este script ya no lo regenera."
    )
