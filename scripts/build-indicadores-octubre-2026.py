#!/usr/bin/env python3
"""Presentación de indicadores PUTN · octubre 2026 (cierre 01–31).

Horas: reportes diarios 01–15 (Javier Guevara) y 16–31 (Jose Salazar).
Energía y número de fallas: Data Soporte Cálculo de Gran Tierra (octubre 2026).
Por máquina, disponibilidad = (calendario − preventivo − correctivo) / calendario
y R% = (calendario − correctivo) / calendario. Son la trazabilidad del anexo.
El sistema en configuración N usa el calendario del mes (744 h), no la suma de máquinas:
Gran Tierra excluye la sábana autorizada y descuenta 7 h de demora de entrega
más el correctivo. Vonú sistema queda en el 97,04 % que publica el anexo.
"""
from __future__ import annotations

import html
import re
import zipfile
from collections import defaultdict
from datetime import date
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data/Costayaco/concertacion/2026-10"
GEN = SRC / "REPORTE_GENERACION_DIARIO_PUTN_2026.xlsx"
TAG_MAP = {
    "CPW01": "CPW-01", "CPW02": "CPW-02", "CPW03": "CPW-03", "CPW04": "CPW-04",
    "CPW05": "CPW-05", "CPW06": "CPW-06", "CPW07": "CPW-07",
    "JIN-10": "CPW-10", "JIN-11": "CPW-11", "JIN-12": "CPW-12",
    "JIN-01": "JIN-01", "JIN-02": "JIN-02",
}
SABANA = ROOT / "data/Costayaco/Mantenimiento/sabana/2026-10/SABANA MMTOS GEN PUTUMAYO 1 (1).xlsx"
GTE_DIR = ROOT / "data/Costayaco/GTE/2026-10"
CARGA = ROOT / "data/Costayaco/operacion/pruebas/2026-10/Formato pruebas de máxima carga Octubre 2026.xlsx"
# Cierre que escribe el formato, en una línea. La carga entregada sale del medidor.
CIERRE_CARGA = {
    "CPW-01": "Estable. FP 0,94.",
    "CPW-02": "Estable. FP 0,94.",
    "CPW-03": "Estable. FP 0,94.",
    "CPW-04": "Estable. FP 0,94.",
    "JIN-02": "Estable. FP 0,95.",
    "JIN-01": "Estable. FP 0,95.",
}
# Demoras de entrega fuera de la ventana comprometida. Análisis GTE, octubre 2026:
# CPW-01 2 h, CPW-04 3 h, CPW-05 1 h, CPW-06 1 h.
EXCESS_H = 7.0
# El anexo publica 97,04 % para el sistema Vonú. La suma de las dos máquinas da 97,58 %.
VONU_DISP_N = 0.9704
OUT = ROOT / "data/Costayaco/informes/2026-10/indicadores-octubre-2026.html"
OUT_INTERNO = ROOT / "data/Costayaco/informes/2026-10/indicadores-octubre-2026-interno.html"
OUT_GTE = ROOT / "data/Costayaco/informes/2026-10/indicadores-octubre-2026-GTE.html"
HSE_DIR = ROOT / "data/Costayaco/informes/2026-10/hse"
HSE_PPTX = ROOT / "data/Costayaco/hse/2026-10/informe octubre hse.pptx"
# Fotos y piezas del informe COPASST. El encabezado y el pie del pptx no se copian.
HSE_MEDIA = {
    "image4.png": "foco-alturas.png",
    "image5.png": "foco-loto.png",
    "image6.png": "taller-pie.png",
    "image7.png": "taller-mesa.png",
    "image8.png": "focus-remoto-a.png",
    "image9.png": "focus-remoto-b.png",
    "image10.png": "poster-actos.png",
    "image11.png": "puerta-antes.png",
    "image12.png": "puerta-despues-a.png",
    "image13.png": "puerta-despues-b.png",
    "image14.png": "poster-capacitacion.png",
    "image15.png": "sonometria.png",
    "image16.png": "luxometria.png",
    "image17.png": "gestion-cambio.png",
    "image18.png": "inspeccion-camilla.png",
    "image19.png": "inspeccion-extintor.png",
    "image20.png": "inspeccion-botiquin.png",
    "image21.png": "poster-auditorias.png",
    "image22.png": "gracias.png",
}
SABANA_UNITS = {
    4: "CPW-02", 6: "CPW-01", 8: "CPW-03", 10: "CPW-04", 12: "CPW-05", 14: "CPW-06",
    16: "CPW-07", 18: "CPW-10", 20: "CPW-11", 22: "CPW-12", 24: "JIN-01", 26: "JIN-02",
}
META = 0.98
META_VONU = 0.90
NDAYS = 31
SEP_MWH_D = 2619.9 / 30
TREND = [
    ("Feb", 0.970358, 3401.23 / 28),
    ("Mar", 0.961564, 3484.83 / 31),
    ("Abr", 0.982099, 3392.09 / 30),
    ("May", 0.986225, 3781.66 / 31),
    ("Jun", 0.987238, 4236.56 / 30),
    ("Jul", 0.977332, 4131.917 / 31),
    ("Ago", 0.991379, 4424.562 / 31),
    ("Sep", 0.9944, SEP_MWH_D),
]
REL = [
    ("Feb", (6695 - 104) / 6695),
    ("Mar", (7320 - 69) / 7320),
    ("Abr", (6192 - 7) / 6192),
    ("May", (6727 - 4) / 6727),
    ("Jun", (8166 - 11) / 8166),
    ("Jul", 1.0),
    ("Ago", 1.0),
    ("Sep", 0.9944),
]
# Horas de correctivo de Copower que restan en el R%. Feb–Ago salen de la
# curva publicada. Septiembre es el cierre de 4 h.
# Las fallas son la suma de Falla_evento en Costayaco (CPW y JIN-10/11/12).
# En marzo G102K suma una falla de diésel y no entra en este conteo.
FO_COPOWER = [
    ("Feb", 104, 4), ("Mar", 69, 8), ("Abr", 7, 4), ("May", 4, 8),
    ("Jun", 11, 10), ("Jul", 0, 0), ("Ago", 0, 0), ("Sep", 4, 4),
]
ORDER = ["CPW-01", "CPW-02", "CPW-03", "CPW-04", "CPW-05", "CPW-06", "CPW-07", "CPW-10", "CPW-11", "CPW-12", "JIN-01", "JIN-02"]
# Salidas de máquina que la bitácora describe y las columnas de hora no pasan a correctivo.
NOTA_CPW04 = (
    "Salida de operación por detonación, asociada al incremento de potencia, "
    "considerando que la máquina acumulaba 959 horas de operación desde el último mantenimiento. "
    "Total fuera de línea: 16 min 40 s"
)
NOTA_CPW05 = (
    "El actuador de la válvula TecJet presentó un desajuste y entregó un flujo irregular de gas en la combustión. "
    "Tiempo total fuera de servicio: 00 h 41 min"
)
NOTA_CPW04_29 = (
    "Oscilación de potencia activa y reactiva. Parada de la lógica a las 16:03. "
    "Ingresa a las 16:11."
)
# FO-GE-033 de Costayaco en data/Costayaco/fallas/2026-10.
# Se omiten duplicados (RF06 copia, RF12 de solo CPW-05) y los FO de Pad 4 (G-801…G-807).
# El R% solo cambia cuando el parte diario carga horas a correctivo.
FALLAS = [
    ("02-oct", "RF02", "MRU", "Cae el gas tratado. CPW-03 y CPW-01 salen por potencia inversa.", "No"),
    ("02-oct", "RF01", "MRU", "Alto nivel de NGL a las 08:51. Salen CPW-01, CPW-02 y CPW-07.", "No"),
    ("03-oct", "RF03", "CPW-04 · CPW-06", "A las 03:46 abre CPW-04. A las 04:07 sale por potencia inversa y entra a las 04:24. CPW-06 abre a las 03:48 con 834 kW.", "No"),
    ("03-oct", "RF04", "CPW-06 · CPW-07", "A las 11:08 CPW-06 abre por sobrepotencia activa y CPW-07 por reactiva.", "No"),
    ("06-oct", "RF05", "MRU", "Sale la MRU a las 15:17. Seis máquinas quedan fuera.", "No"),
    ("08-oct", "RF06", "MRU", "Perturbación eléctrica a las 12:11. Salen cinco máquinas.", "No"),
    ("16-oct", "RF07", "CPW-04", "Tres detonaciones. Fuera de línea 16 min 40 s.", "Sí · 0,28 h"),
    ("17-oct", "RF13", "CPW-04", "Potencia inversa a las 01:30. Sincroniza a las 01:36.", "No"),
    ("17-oct", "RF09", "CPW-02", "Sobrecorriente a las 04:08. Sincroniza a las 04:36.", "No"),
    ("17-oct", "RF08", "CPW-04", "Detonación.", "No"),
    ("18-oct", "RF12", "CPW-05 · CPW-04", "TecJet de CPW-05 a las 03:09. CPW-04 detona al tomar la carga.", "CPW-05 · 1,00 h"),
    ("18-oct", "RF10", "SIN · MRU", "Se pierde el SIN a las 13:07. Salen CPW-03, 06, 07, 10 y 12.", "No"),
    ("19-oct", "RF11", "SIN", "Sobrefrecuencia. La frecuencia sube a 62,7 Hz. Salen CPW-03, 06, 07 y 10.", "No"),
    ("21-oct", "RF15", "CPW-04", "Parada de la lógica a las 21:23, con gas Moqueta.", "No"),
    ("22-oct", "RF14", "CPW-04", "Potencia inversa a las 00:36. El interruptor abre al instante.", "No"),
    ("24-oct", "RF17", "MRU", "Sale la MRU a las 14:43 por disparo del reconectador de EEP.", "No"),
    ("26-oct", "RF13", "CPW-07", "Potencia inversa a las 11:54. Sincroniza a las 11:56.", "No"),
    ("28-oct", "RF16", "SIN", "Descarga atmosférica a la 01:38. Sale todo el parque.", "No"),
    ("29-oct", "RF18", "CPW-04", "Oscilación de potencia a las 16:03. Parada de la lógica.", "Sí · 0,13 h"),
]


def n(v, d=0):
    s = f"{v:,.{d}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def pct(v, d=2):
    if v is None:
        return "—"
    if abs(v - 1) < 1e-12 and d == 2:
        return "100,00 %"
    return f"{n(v * 100, d)} %"


def esc(s):
    return html.escape(str(s), quote=True)


def fnum(v):
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, str):
        s = v.strip().replace(" ", "")
        if "," in s and "." in s:
            s = s.replace(".", "").replace(",", ".")
        elif "," in s:
            s = s.replace(",", ".")
        try:
            return float(s)
        except ValueError:
            return 0.0
    return 0.0


def short(text, limit=118):
    s = re.sub(r"\s+", " ", text or "").strip(" -")
    if len(s) <= limit:
        return s or "—"
    return s[: limit - 1].rstrip() + "…"


def load_sabana():
    wb = openpyxl.load_workbook(SABANA, data_only=True, read_only=True)
    ws = wb["GENERACIÓN PUTUMAYO"]
    jobs = []
    for r in ws.iter_rows(min_row=4, max_col=28, values_only=True):
        when = r[2]
        if not hasattr(when, "year") or (when.year, when.month) != (2026, 10):
            continue
        for idx, name in SABANA_UNITS.items():
            code, hours = r[idx], r[idx + 1]
            if isinstance(code, (int, float)) and isinstance(hours, (int, float)) and hours:
                jobs.append({
                    "date": when.date(), "unit": name, "code": int(code), "hours": float(hours),
                })
    wb.close()
    return jobs


def load_capacity():
    acc = {}
    for path in sorted(SRC.glob("*.xlsx")):
        if "OPERACIONES" not in path.name:
            continue
        wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
        for r in list(wb.active.iter_rows(values_only=True))[1:]:
            if not r or not hasattr(r[0], "year"):
                continue
            tag = str(r[5]).strip()
            slot = acc.setdefault(tag, {"inst": [], "ent": []})
            if isinstance(r[6], (int, float)) and r[6]:
                slot["inst"].append(float(r[6]))
            if isinstance(r[7], (int, float)) and r[7]:
                slot["ent"].append(float(r[7]))
        wb.close()
    return {
        tag: (sum(v["inst"]) / len(v["inst"]), sum(v["ent"]) / len(v["ent"]))
        for tag, v in acc.items() if v["inst"] and v["ent"]
    }


def load_carga():
    """Pruebas de máxima carga. La entregada es la diferencia del medidor en la hora."""
    if not CARGA.is_file():
        raise SystemExit(f"falta el formato de máxima carga: {CARGA}")
    wb = openpyxl.load_workbook(CARGA, data_only=True)
    rows = []
    for ws in wb.worksheets:
        if ws.title.strip().upper().startswith("FORMATO"):
            continue
        tag = str(ws["P8"].value).strip().replace("JINAN-", "JIN-")
        if tag not in CIERRE_CARGA:
            raise SystemExit(f"prueba de máxima carga sin cierre: {tag}")
        entregada = float(ws["AE10"].value)
        medidor = float(ws["X12"].value) - float(ws["X11"].value)
        if abs(medidor - entregada) > 0.5:
            raise SystemExit(f"{tag}: el medidor da {medidor} y el formato {entregada}")
        gas = str(ws["P10"].value).strip()
        rows.append({
            "tag": tag,
            "campo": str(ws["A10"].value).strip(),
            "gas": {"MQT": "Moqueta", "VONU": "Vonú"}.get(gas, gas),
            "date": ws["A8"].value.date(),
            "t0": ws["I11"].value.strftime("%H:%M"),
            "t1": ws["I12"].value.strftime("%H:%M"),
            "esperada": float(ws["AE8"].value),
            "entregada": entregada,
            "p0": float(ws["AM11"].value),
            "p1": float(ws["AM12"].value),
            "cierre": CIERRE_CARGA[tag],
        })
    wb.close()
    order = ["CPW-01", "CPW-02", "CPW-03", "CPW-04", "JIN-02", "JIN-01"]
    got = {r["tag"] for r in rows}
    if got != set(order):
        raise SystemExit(f"el formato no trae las seis pruebas: {sorted(got)}")
    return [next(r for r in rows if r["tag"] == tag) for tag in order]


def load_gte():
    """Energía y fallas del soporte de cálculo. La energía ya viene en kWh, sin reescalar."""
    path = next(p for p in GTE_DIR.glob("*.xlsx") if p.stat().st_size > 1000)
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    out = {}
    for r in wb.active.iter_rows(min_row=2, values_only=True):
        if not r or not hasattr(r[0], "year") or (r[0].year, r[0].month) != (2026, 10):
            continue
        tag = TAG_MAP.get(str(r[3]).strip())
        if not tag:
            raise SystemExit(f"TAG sin mapa en el soporte GTE: {r[3]}")
        out[(r[0].date(), tag)] = {"kwh": fnum(r[7]), "fails": fnum(r[12])}
    wb.close()
    return out


def load():
    capacity = load_capacity()
    gte = load_gte()
    wb = openpyxl.load_workbook(GEN, data_only=True, read_only=True)
    rows = []
    for r in wb["CUENCA PUT NORTE"].iter_rows(values_only=True):
        if not r or not hasattr(r[0], "year") or (r[0].year, r[0].month) != (2026, 10):
            continue
        raw = str(r[5]).strip()
        tag = TAG_MAP.get(raw)
        if not tag:
            raise SystemExit(f"TAG sin mapa en el reporte de generación: {raw}")
        sb, pp, ext = fnum(r[13]), fnum(r[14]), fnum(r[20])
        fo = sum(fnum(r[c]) for c in range(15, 20))
        if isinstance(r[12], (int, float)):
            op = float(r[12])
        else:
            # 6-oct CPW-01 trae "ñ" en horas de operación. El resto del día suma 6 h de stand-by.
            op = max(0.0, 24 - sb - pp - fo - ext)
        key = (r[0].date(), tag)
        if key not in gte:
            raise SystemExit(f"sin fila GTE para {key[0]} {tag}")
        inst, ent = capacity.get(tag, (0.0, 0.0))
        rows.append({
            "date": r[0].date(),
            "campo": str(r[2]).strip(),
            "model": str(r[4]).strip(),
            "tag": tag,
            "inst": inst,
            "ent": ent,
            "op": op,
            "sb": sb,
            "pp": pp,
            "fo": fo,
            "fails": gte[key]["fails"],
            "ext": ext,
            "kwh": gte[key]["kwh"],
            "obs": re.sub(r"\s+", " ", str(r[28]).replace("\t", " ")).strip() if r[28] else "",
        })
    wb.close()
    return rows


def build(rows):
    days = sorted({r["date"] for r in rows})
    if days[0] != date(2026, 10, 1) or days[-1] != date(2026, 10, 31) or len(days) != NDAYS:
        raise SystemExit(f"el mes no cierra 01–31: {days[0]} → {days[-1]} ({len(days)} días)")
    units = {}
    for r in rows:
        u = units.setdefault(r["tag"], {
            "tag": r["tag"], "campo": r["campo"], "model": r["model"],
            "inst": r["inst"], "ent": r["ent"], "ent_sum": 0.0, "ent_n": 0,
            "op": 0.0, "sb": 0.0, "pp": 0.0, "fo": 0.0, "ext": 0.0, "kwh": 0.0, "fo_n": 0,
        })
        u["ent_sum"] += r["ent"]
        u["ent_n"] += 1
        for k in ("op", "sb", "pp", "fo", "ext", "kwh"):
            u[k] += r[k]
        if r["fails"] > 0:
            u["fo_n"] += r["fails"]
        elif r["fo"] > 0:
            u["fo_n"] += 1
    cal_u = NDAYS * 24
    for u in units.values():
        u["cal"] = cal_u
        # El contrato no resta la parada externa. En este reporte esas horas ya están dentro de las 24.
        u["a"] = (cal_u - u["pp"] - u["fo"]) / cal_u
        u["disp"] = u["a"]
        u["r"] = (cal_u - u["fo"]) / cal_u
        u["ent_avg"] = u["ent_sum"] / u["ent_n"] if u["ent_n"] else 0
        u["kw"] = u["kwh"] / u["op"] if u["op"] else 0
        u["meta"] = META if u["campo"] == "COSTAYACO" else META_VONU
        u["campo_lbl"] = "Costayaco" if u["campo"] == "COSTAYACO" else "Vonú"
    ordered = [units[t] for t in ORDER]

    def pack(pred):
        sel = [u for u in ordered if pred(u)]
        cal = sum(u["cal"] for u in sel)
        op = sum(u["op"] for u in sel)
        sb = sum(u["sb"] for u in sel)
        pp = sum(u["pp"] for u in sel)
        fo = sum(u["fo"] for u in sel)
        ext = sum(u["ext"] for u in sel)
        kwh = sum(u["kwh"] for u in sel)
        return {
            "n": len(sel), "cal": cal, "op": op, "sb": sb, "pp": pp, "fo": fo, "ext": ext, "kwh": kwh,
            "disp": (cal - pp - fo) / cal, "a": (cal - pp - fo) / cal, "r": (cal - fo) / cal,
            "uso": op / cal, "kw": kwh / op if op else 0,
            "mwh": kwh / 1000, "fails": sum(u["fo_n"] for u in sel),
        }

    daily = defaultdict(float)
    for r in rows:
        daily[r["date"]] += r["kwh"] / 1000
    gen_days = [(d, daily[d]) for d in days]
    peak = max(gen_days, key=lambda x: x[1])
    valle = min(gen_days, key=lambda x: x[1])
    pp_rows = [r for r in rows if r["pp"] > 0]
    fo_rows = [r for r in rows if r["fo"] > 0]
    park = pack(lambda u: True)
    cyc = pack(lambda u: u["campo"] == "COSTAYACO")
    von = pack(lambda u: u["campo"] == "VONU")
    # Configuración N: el calendario es el del mes. La sábana autorizada no penaliza.
    # Sí penalizan las 7 h de demora y el correctivo, y entran en disponibilidad y en confiabilidad.
    month_h = NDAYS * 24
    cyc["disp_n"] = cyc["r_n"] = cyc["a_n"] = (month_h - EXCESS_H - cyc["fo"]) / month_h
    cyc["sb_n"] = sum(u["sb"] + u["ext"] for u in ordered if u["campo"] == "COSTAYACO" and u["tag"] not in {"CPW-11", "CPW-12"})
    von["disp_n"] = von["a_n"] = VONU_DISP_N
    von["r_n"] = 1.0
    von["sb_n"] = von["sb"]
    if abs(cyc["kwh"] - 3_371_443) > 1 or abs(von["kwh"] - 473_597) > 1:
        raise SystemExit(f"la energía no cuadra con GTE: {cyc['kwh']:.0f} / {von['kwh']:.0f}")
    if cyc["fails"] != 5 or abs(cyc["disp_n"] - 0.9887) > 0.00005:
        raise SystemExit(f"el sistema N no cuadra: fallas {cyc['fails']} disp {cyc['disp_n']:.5f}")
    return {
        "units": ordered, "park": park,
        "cyc": cyc,
        "von": von,
        "jen": pack(lambda u: u["model"] in {"J320", "J420"}),
        "jin": pack(lambda u: u["model"] == "JINAN"),
        "gen_days": gen_days, "peak": peak, "valle": valle,
        "pp_rows": pp_rows, "fo_rows": fo_rows,
        "mwh_d": sum(v for _, v in gen_days) / NDAYS,
    }


def cubic(xs, ys):
    d = f"M {xs[0]:.1f} {ys[0]:.1f}"
    for i in range(len(xs) - 1):
        mx = (xs[i] + xs[i + 1]) / 2
        d += f" C {mx:.1f} {ys[i]:.1f}, {mx:.1f} {ys[i + 1]:.1f}, {xs[i + 1]:.1f} {ys[i + 1]:.1f}"
    return d


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
    area = f"{cubic(xs, dys)} L {xs[-1]:.1f} {pad['t'] + ih:.1f} L {xs[0]:.1f} {pad['t'] + ih:.1f} Z"
    dots, labels = [], []
    for i, p in enumerate(points):
        last = i == len(points) - 1
        dots.append(f'<circle cx="{xs[i]:.1f}" cy="{dys[i]:.1f}" r="{4.2 if last else 3.2}" fill="#1E3A5F"/>')
        dots.append(f'<circle cx="{xs[i]:.1f}" cy="{gys[i]:.1f}" r="{3.6 if last else 2.8}" fill="#C0392B"/>')
        labels.append(f'<text x="{xs[i]:.1f}" y="{h - 6}" text-anchor="middle" font-size="11" fill="#64748b" font-family="Arial">{esc(p["month"])}</text>')
    corte = f'<text x="{xs[-1] - 8:.1f}" y="12" text-anchor="end" font-size="10" font-weight="700" fill="#1E3A5F" font-family="Arial">cierre 01–31</text>'
    meta_y = y_d(META)
    return f'''<svg viewBox="0 0 {w} {h}" width="100%" height="100%" role="img">
      <line x1="{pad["l"]}" y1="{meta_y:.1f}" x2="{w - pad["r"]}" y2="{meta_y:.1f}" stroke="#94a3b8" stroke-dasharray="4 4" stroke-width="1.2"/>
      <path d="{area}" fill="rgb(30 58 95 / 12%)"/>
      <path d="{cubic(xs, gys)}" fill="none" stroke="#C0392B" stroke-width="2.2"/>
      <path d="{cubic(xs, dys)}" fill="none" stroke="#1E3A5F" stroke-width="2.4"/>
      {''.join(dots)}{corte}{''.join(labels)}
    </svg>'''


def series_svg(points, color, fill, lo, hi, ticks):
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
    dots, labels, tags = [], [], []
    for i, p in enumerate(points):
        below = (hi - p["r"]) / (hi - lo) < 0.28
        anchor = "start" if i == 0 else ("end" if i == len(points) - 1 else "middle")
        ty = ys[i] + 13 if below else ys[i] - 7
        dots.append(f'<circle cx="{xs[i]:.1f}" cy="{ys[i]:.1f}" r="{4.2 if p["now"] else 3.2}" fill="{color}"/>')
        labels.append(f'<text x="{xs[i]:.1f}" y="{h - 5}" text-anchor="middle" font-size="11" fill="#64748b" font-family="Arial">{esc(p["month"])}</text>')
        tags.append(f'<text x="{xs[i]:.1f}" y="{ty:.1f}" text-anchor="{anchor}" font-size="10" font-weight="700" fill="{color}" font-family="Arial">{n(p["r"] * 100, 2)} %</text>')
    return f'''<svg viewBox="0 0 {w} {h}" width="100%" height="100%" role="img">
      {''.join(grid)}
      <line x1="{pad["l"]}" y1="{meta_y:.1f}" x2="{w - pad["r"]}" y2="{meta_y:.1f}" stroke="#94a3b8" stroke-dasharray="4 4" stroke-width="1.2"/>
      <path d="{area}" fill="{fill}"/>
      <path d="{cubic(xs, ys)}" fill="none" stroke="{color}" stroke-width="2.4"/>
      {''.join(dots)}{''.join(tags)}{''.join(labels)}
    </svg>'''


def hours_svg(points):
    """points: (mes, horas de correctivo, número de fallas). Dos ejes."""
    w, h = 860, 220
    pad = {"l": 32, "r": 28, "t": 16, "b": 22}
    iw, ih = w - pad["l"] - pad["r"], h - pad["t"] - pad["b"]
    h_hi, f_hi = 130, 12
    xs = [pad["l"] + i / (len(points) - 1) * iw for i in range(len(points))]

    def y_of(v, hi):
        return pad["t"] + ih - v / hi * ih

    ys = [y_of(hours, h_hi) for _, hours, _fails in points]
    fys = [y_of(fails, f_hi) for _, _hours, fails in points]
    base = pad["t"] + ih
    area = f"{cubic(xs, ys)} L {xs[-1]:.1f} {base:.1f} L {xs[0]:.1f} {base:.1f} Z"
    grid = []
    for tick in (0, 50, 100):
        yy = y_of(tick, h_hi)
        grid.append(
            f'<line x1="{pad["l"]}" y1="{yy:.1f}" x2="{w - pad["r"]}" y2="{yy:.1f}" stroke="#e8eef4"/>'
        )
        grid.append(
            f'<text x="{pad["l"] - 6}" y="{yy + 3:.1f}" text-anchor="end" font-size="9" fill="#94a3b8" font-family="Arial">{tick}</text>'
        )
    for tick in (10,):
        yy = y_of(tick, f_hi)
        grid.append(
            f'<text x="{w - pad["r"] + 6}" y="{yy + 3:.1f}" text-anchor="start" font-size="9" fill="#C0392B" font-family="Arial">{tick}</text>'
        )
    dots, labels, tags = [], [], []
    for i, (month, hours, fails) in enumerate(points):
        last = i == len(points) - 1
        anchor = "start" if i == 0 else ("end" if last else "middle")
        dx = 8 if i == 0 else (-8 if last else 0)
        dec = 2 if abs(hours - round(hours)) > 0.01 else 0
        hour_txt = n(hours, dec)
        fail_txt = n(fails, 0)
        hy, fy = ys[i], fys[i]
        hour_y = hy - 8
        fail_y = fy - 9
        fail_anchor = "middle"
        fail_x = xs[i]
        if i == 0:
            fail_anchor = "start"
            fail_x = xs[i] + 2
            fail_y = fy - 12
        elif last:
            fail_anchor = "end"
            fail_x = xs[i] - 22
        elif abs(fail_y - hour_y) < 16:
            fail_x = xs[i] + 9
            fail_y = fy + 3
            fail_anchor = "start"
        dots.append(
            f'<circle cx="{xs[i]:.1f}" cy="{hy:.1f}" r="3.5" fill="#fff" stroke="#1E3A5F" stroke-width="2.2"/>'
        )
        dots.append(
            f'<circle cx="{xs[i]:.1f}" cy="{fy:.1f}" r="3.3" fill="#C0392B"/>'
        )
        labels.append(
            f'<text x="{xs[i]:.1f}" y="{h - 6}" text-anchor="middle" font-size="11" fill="#64748b" font-family="Arial">{esc(month)}</text>'
        )
        tags.append(
            f'<text x="{xs[i] + dx:.1f}" y="{hour_y:.1f}" text-anchor="{anchor}" font-size="10" font-weight="700" fill="#1E3A5F" font-family="Arial">{hour_txt}</text>'
        )
        tags.append(
            f'<text x="{fail_x:.1f}" y="{fail_y:.1f}" text-anchor="{fail_anchor}" font-size="10" font-weight="700" fill="#C0392B" font-family="Arial">{fail_txt}</text>'
        )
    return f'''<svg viewBox="0 0 {w} {h}" width="100%" height="100%" role="img">
      <defs>
        <linearGradient id="foFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1E3A5F" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#1E3A5F" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      {''.join(grid)}
      <path d="{area}" fill="url(#foFill)"/>
      <path d="{cubic(xs, ys)}" fill="none" stroke="#1E3A5F" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="{cubic(xs, fys)}" fill="none" stroke="#C0392B" stroke-width="2" stroke-linejoin="round"/>
      {''.join(dots)}{''.join(tags)}{''.join(labels)}
    </svg>'''


def page(npage, inner, cover=False):
    body = inner if cover else f'<div class="pad">{inner}</div>'
    return f'<article class="slide">{body}<span class="pn">{npage}</span></article>'


def export_hse_media():
    if not HSE_PPTX.is_file():
        raise SystemExit(f"falta el informe HSE: {HSE_PPTX}")
    with zipfile.ZipFile(HSE_PPTX) as zf:
        for src, dest in HSE_MEDIA.items():
            target = HSE_DIR / dest
            data = zf.read(f"ppt/media/{src}")
            if not target.is_file() or target.read_bytes() != data:
                target.write_bytes(data)


def hse_fig(name, alt, cap, fit="cover", folder="hse/"):
    return (
        f'<figure class="shot"><img src="{folder}{name}" alt="{esc(alt)}" '
        f'style="object-fit:{fit};object-position:center;background:#fff">'
        f"<figcaption>{esc(cap)}</figcaption></figure>"
    )


def kpi(label, value, note, tone=""):
    return f'<article class="{tone}"><span>{esc(label)}</span><strong>{value}</strong><small>{esc(note)}</small></article>'


def card(title, note, rows, edge):
    items = "".join(f"<dt>{esc(lab)}</dt><dd class='{cls}'>{val}</dd>" for lab, val, cls in rows)
    return f'<article class="{edge}"><h3>{esc(title)}</h3><p class="sub">{esc(note)}</p><dl>{items}</dl></article>'


def tone_meta(value, meta):
    return "ok" if value >= meta else "warn"


def site_rows(block, meta):
    disp = block.get("disp_n", block["disp"])
    rel = block.get("r_n", block["r"])
    contrato = block.get("a_n", block["a"])
    return [
        ("Generación", f"{n(block['mwh'], 1)} MWh", ""),
        ("Disponibilidad", pct(disp), tone_meta(disp, meta)),
        ("Confiabilidad R%", pct(rel), tone_meta(rel, meta)),
        ("Contrato A%", pct(contrato), tone_meta(contrato, meta)),
        ("Uso", pct(block["uso"], 1), ""),
        ("Paradas externas", f"{n(block['ext'], 1)} h", "warn" if block["ext"] else "ok"),
    ]


def fleet_kw(units, model):
    sel = [u for u in units if u["model"] == model or (model == "J320J420" and u["model"] in {"J320", "J420"})]
    return sel


def render(m, audience="interno"):
    p, c, v = m["park"], m["cyc"], m["von"]
    units = {u["tag"]: u for u in m["units"]}
    pair = lambda a, b: f"{pct(a).replace(' %', '')} · {pct(b)}"
    below = [u for u in m["units"] if u["campo"] == "COSTAYACO" and u["disp"] < META]
    below_txt = " · ".join(f"{u['tag']} {pct(u['disp'])}" for u in below)

    def avg_kw(tags):
        op = sum(units[t]["op"] for t in tags)
        kwh = sum(units[t]["kwh"] for t in tags)
        return kwh / op

    def avg_ent(tags):
        return sum(units[t]["ent_avg"] for t in tags) / len(tags)

    j320 = ["CPW-01", "CPW-02", "CPW-03", "CPW-07"]
    j420 = ["CPW-04", "CPW-05", "CPW-06"]
    jinan = ["CPW-10", "CPW-11", "CPW-12", "JIN-01", "JIN-02"]

    trend = [{"month": mo, "disp": dv, "gen": gw} for mo, dv, gw in TREND]
    trend.append({"month": "Oct", "disp": c["disp_n"], "gen": m["mwh_d"]})
    rel_pts = [{"month": mo, "r": rv, "now": False} for mo, rv in REL]
    rel_pts.append({"month": "Oct", "r": c["r_n"], "now": True})
    disp_pts = [{"month": mo, "r": dv, "now": False} for mo, dv, _ in TREND]
    disp_pts.append({"month": "Oct", "r": c["disp_n"], "now": True})

    if audience == "gte":
        kicker = "GRAN TIERRA ENERGY · CIERRE 01–31 DE OCTUBRE"
        author = "Presentación para Gran Tierra"
    else:
        kicker = "CIERRE 01–31 DE OCTUBRE"
        author = ""
    author_html = f'<p class="author">{author}</p>' if author else ""
    s1 = page(1, f"""
        <div class="cover"><div class="hero">
          <p class="kicker">{kicker}</p>
          <h1>INDICADORES DE CONFIABILIDAD</h1>
          <p class="month">OCTUBRE 2026</p><hr>
          <h2>PARQUE DE GENERACIÓN COSTAYACO – VONÚ</h2>
          {author_html}
        </div></div>""", cover=True)

    s2 = page(2, f"""
        <h2 class="title">Resumen ejecutivo</h2>
        <div class="sites">
          {card("Todo el parque", "Costayaco · Vonú · 01–31 oct", [
            ("Generación", f"{n(p['mwh'], 1)} MWh", ""),
            ("Disponibilidad", pair(c['disp_n'], v['disp_n']), "ok"),
            ("Confiabilidad R%", pair(c['r_n'], v['r_n']), "ok"),
            ("Contrato A%", pair(c['a_n'], v['a_n']), "ok"),
            ("Uso", pct(p['uso'], 1), ""),
            ("Paradas externas", f"{n(p['ext'], 1)} h", "warn"),
          ], "p")}
          {card("Costayaco", f"10 máquinas · {n(c['fails'], 0)} fallas · meta ≥ 98 %", site_rows(c, META), "c")}
          {card("Vonú", f"2 máquinas · {n(v['fails'], 0)} fallas · meta ≥ 90 %", site_rows(v, META_VONU), "v")}
        </div>
        <div class="trend">
          <div class="trend-head">
            <h4>Tendencia COPOWER · Feb–Oct</h4>
            <p class="leg"><span><i class="d"></i>Sistema N Costayaco</span><span><i class="g"></i>Generación MWh/día</span><span><i class="m"></i>Meta 98 %</span><span>Oct · cierre 01–31</span></p>
          </div>
          {trend_svg(trend)}
        </div>
        """)

    def cfg_row(tag, model, maker, cls):
        u = units[tag]
        return (
            f'<tr class="{cls}"><td>{esc(tag)}</td><td>{esc(model)}</td><td>{esc(maker)}</td>'
            f'<td class="num">{n(u["inst"], 0)}</td><td class="num">{n(u["ent_avg"], 0)}</td>'
            f'<td class="num">{n(u["kwh"] / 1000, 0)}</td></tr>'
        )

    s3 = page(3, f"""
        <h2 class="title">Configuración de equipos</h2>
        <table class="mto cfg"><thead><tr><th>Equipo</th><th>Modelo</th><th>Fabricante</th><th class="num">Instalada kW</th><th class="num">Capacidad media<br>del mes kW</th><th class="num">Energía<br>MWh</th></tr></thead><tbody>
          {''.join(cfg_row(t, "J320", "Jenbacher", "j320") for t in j320)}
          {''.join(cfg_row(t, "J420", "Jenbacher", "j420") for t in j420)}
          {''.join(cfg_row(t, "JINAN", "Jinan", "von" if t.startswith("JIN") else "jin") for t in jinan)}
        </tbody></table>
        <div class="flota">
          <article class="j320">
            <header><h3>Jenbacher J320</h3><p>Capacidad media {n(avg_ent(j320), 0)} kW</p><p>Potencia media {n(avg_kw(j320), 0)} kW</p></header>
            <div class="cuerpo"><img src="../2026-09/equipo-j320.png" alt="Grupo electrógeno Jenbacher J320"><ul><li class="lab">Equipos</li><li>CPW-01</li><li>CPW-02</li><li>CPW-03</li><li>CPW-07</li></ul></div>
          </article>
          <article class="j420">
            <header><h3>Jenbacher J420</h3><p>Capacidad media {n(avg_ent(j420), 0)} kW</p><p>Potencia media {n(avg_kw(j420), 0)} kW</p></header>
            <div class="cuerpo"><img src="../2026-09/equipo-j420.png" alt="Grupo electrógeno Jenbacher J420"><ul><li class="lab">Equipos</li><li>CPW-04</li><li>CPW-05</li><li>CPW-06</li></ul></div>
          </article>
          <article class="jin">
            <header><h3>Jinan</h3><p>Capacidad media {n(avg_ent(jinan), 0)} kW</p><p>Potencia media {n(avg_kw(jinan), 0)} kW</p></header>
            <div class="cuerpo"><img src="../2026-09/equipo-jinan.png" alt="Grupo electrógeno Jinan"><ul><li class="lab">Equipos</li><li>CPW-10</li><li>CPW-11</li><li>CPW-12</li><li>JIN-01</li><li>JIN-02</li></ul></div>
          </article>
        </div>
        """)

    def machine_row(u, bloque=False):
        mtbf = "Sin fallas" if not u["fo_n"] else n(u["op"] / u["fo_n"], 2)
        mttr = "0" if not u["fo_n"] else n(u["fo"] / u["fo_n"], 2)
        cls = ' class="bloque"' if bloque else ""
        sb_d = 1 if bloque else 0
        return (
            f"<tr{cls}><td>{esc(u['tag'])}</td><td>{esc(u['campo_lbl'])}</td>"
            f"<td class='num'>{n(u['kwh'], 0)}</td><td class='num'>{n(u['sb'], sb_d)}</td>"
            f"<td class='num'>{pct(u['disp'])}</td><td class='num'>{pct(u['r'])}</td>"
            f"<td class='num'>{n(u['fo_n'], 0)}</td><td class='num'>{mtbf}</td><td class='num'>{mttr}</td></tr>"
        )

    sys_c = dict(c, tag="Sistema", campo_lbl="Costayaco", kwh=c["kwh"], sb=c["sb_n"], disp=c["disp_n"], r=c["r_n"], fo_n=c["fails"], op=c["op"], fo=c["fo"], meta=META)
    sys_v = dict(v, tag="Sistema", campo_lbl="Vonú", sb=v["sb_n"], disp=v["disp_n"], r=v["r_n"], fo_n=v["fails"], meta=META_VONU)
    s4 = page(4, f"""
        <h2 class="title">Desempeño por máquina</h2>
        <table><thead><tr><th>Unidad</th><th>Campo</th><th class="num">Energía kWh</th><th class="num">Stand-by h</th><th class="num">Disp.</th><th class="num">Conf.</th><th class="num">Fallas</th><th class="num">MTBF h</th><th class="num">MTTR h</th></tr></thead>
        <tbody>
          {''.join(machine_row(u) for u in m['units'])}
          {machine_row(sys_c, True)}
          {machine_row(sys_v, True)}
        </tbody></table>
        <h4 style="margin:2px 0 0;color:#1E3A5F;font-size:9pt">Compromiso contractual</h4>
        <div class="method">
          <article class="d"><h4>Costayaco · gas ≥ 98 %</h4><p class="regla">El sistema N cierra en {pct(c['disp_n'])} de disponibilidad y de confiabilidad. Por máquina quedan bajo 98 %: {esc(below_txt)}. Esas horas son de sábana autorizada y no afectan el sistema N.</p></article>
          <article class="a"><h4>Vonú · disponibilidad ≥ 90 %</h4><p class="regla">Sistema N {pct(v['disp_n'])} y confiabilidad {pct(v['r_n'])}. Sin fallas. Por máquina: JIN-01 {pct(units['JIN-01']['disp'])} · JIN-02 {pct(units['JIN-02']['disp'])}.</p></article>
        </div>
        """)

    mttf = c["op"] / c["fails"]
    mttr = c["fo"] / c["fails"]
    menor = min((u for u in m["units"] if u["fo_n"]), key=lambda u: u["op"] / u["fo_n"])
    conf_rows = []
    conf_rows.append(
        f"<tr class='bloque'><td>Costayaco</td><td class='num'>{n(c['fails'], 0)}</td><td class='num'>{n(c['op'], 1)} h</td>"
        f"<td class='num'>{n(c['fo'], 2)} h</td><td class='num'>{n(mttf, 2)} h</td><td class='num'>{n(mttr, 2)} h</td><td>{pct(c['r_n'])}</td></tr>"
    )
    for u in m["units"]:
        if not u["fo_n"]:
            continue
        conf_rows.append(
            f"<tr><td>{u['tag']}</td><td class='num'>{n(u['fo_n'], 0)}</td><td class='num'>{n(u['op'], 2)} h</td><td class='num'>{n(u['fo'], 2)} h</td>"
            f"<td class='num'>{n(u['op'] / u['fo_n'], 2)} h</td><td class='num'>{n(u['fo'] / u['fo_n'], 2)} h</td><td>{pct(u['r'])}</td></tr>"
        )
    conf_rows.append(
        f"<tr><td>Vonú</td><td class='num'>0</td><td class='num'>{n(v['op'], 0)} h</td><td class='num'>0</td>"
        f"<td class='num'>—</td><td class='num'>—</td><td>Sin fallas</td></tr>"
    )
    fo_detail = []
    for r in m["fo_rows"]:
        notas = {
            ("CPW-04", date(2026, 10, 16)): NOTA_CPW04,
            ("CPW-04", date(2026, 10, 29)): NOTA_CPW04_29,
            ("CPW-05", date(2026, 10, 18)): NOTA_CPW05,
        }
        nota = notas.get((r["tag"], r["date"]), short(r["obs"], 150))
        fo_detail.append(
            f"<tr><td><b>{esc(r['tag'])} · {r['date'].day}-oct</b></td><td class='num'>{n(r['fo'], 2)} h</td><td class='nota'>{esc(nota)}</td></tr>"
        )
    s5 = page(5, f"""
        <h2 class="title">Confiabilidad</h2>
        <p class="regla">R% = (Tplan − correctivo) / Tplan. MTTF: horas de operación entre fallas cargadas a correctivo. MTTR: horas de correctivo entre esas fallas.</p>
        <div class="kpis k4">
          {kpi("Costayaco", pct(c['r_n']), f"{n(c['fails'], 0)} fallas · sistema N · meta 98 %", "ok")}
          {kpi("MTTF", f"{n(mttf, 2)} h", f"{n(c['op'], 1)} h de operación / {n(c['fails'], 0)} fallas", "ok")}
          {kpi("MTTR", f"{n(mttr, 2)} h", f"{n(c['fo'], 2)} h de correctivo / {n(c['fails'], 0)}")}
          {kpi("Menor MTTF", f"{n(menor['op'] / menor['fo_n'], 0)} h", f"{menor['tag']} · {n(menor['fo_n'], 0)} fallas", "warn")}
        </div>
        <table class="mto"><thead><tr><th>Unidad</th><th class="num">Fallas</th><th class="num">Operación</th><th class="num">Correctivo</th><th class="num">MTTF</th><th class="num">MTTR</th><th>Cierre</th></tr></thead><tbody>
          {''.join(conf_rows)}
        </tbody></table>
        <table class="evt"><thead><tr><th>Falla cargada a correctivo</th><th>Horas</th><th>Nota del reporte</th></tr></thead><tbody>
          {''.join(fo_detail)}
        </tbody></table>
        <div class="trend" style="flex:0 0 auto;height:1.75in;min-height:0">
          <div class="trend-head">
            <h4>Confiabilidad del parque · Feb–Oct</h4>
            <p class="leg"><span><i class="d" style="background:#0f766e"></i>Sistema N</span><span><i class="m"></i>Meta 98 %</span><span>Oct · {pct(c['r_n'])}</span></p>
          </div>
          {series_svg(rel_pts, "#0f766e", "rgb(15 118 110 / 12%)", 0.975, 1.004, (0.98, 1.0))}
        </div>
        """)

    s6 = page(6, f"""
        <h2 class="title">Disponibilidad</h2>
        <div class="kpis k3">
          {kpi("Costayaco", pct(c['disp_n']), f"sep 99,44 % · {n(c['fails'], 0)} fallas · sistema N", "ok")}
          {kpi("Vonú", pct(v['disp_n']), f"sep 95,14 % · {n(v['fails'], 0)} fallas · sistema N", "ok")}
          {kpi("Por horas", pair(c['disp'], v['disp']), "suma de máquinas · preventivo y correctivo", "")}
        </div>
        <div class="method">
          <article class="d"><h4>Costayaco</h4>
            <p class="regla">El sistema N descuenta 7 h de demora de entrega y {n(c['fo'], 2)} h de correctivo sobre las 744 h del mes. La sábana autorizada y las {n(c['ext'], 1)} h externas del 19 de octubre no entran en el cálculo.</p>
            <div class="frac-row"><div class="frac"><b>{n(NDAYS * 24 - EXCESS_H - c['fo'], 2)} h</b><i></i><b>{n(NDAYS * 24, 0)} h</b></div><em>{pct(c['disp_n'])}</em></div>
            <p class="regla">Por horas de máquina, {pct(c['disp'])}. Preventivo {n(c['pp'], 0)} h · correctivo {n(c['fo'], 2)} h · stand-by agregado {n(c['sb_n'], 1)} h · energía {n(c['mwh'], 1)} MWh.</p>
          </article>
          <article class="a"><h4>Vonú</h4>
            <p class="regla">El sistema N cierra en {pct(v['disp_n'])} y la confiabilidad en {pct(v['r_n'])}. Cumple el mínimo de 90 %.</p>
            <div class="frac-row"><div class="frac"><b>{n(v['pp'], 0)} h preventivo</b><i></i><b>0 h correctivo</b></div><em>{pct(v['disp_n'])}</em></div>
            <p class="regla">Por horas de máquina, {pct(v['disp'])}. Septiembre cerró en 95,14 %. La energía de octubre es {n(v['mwh'], 1)} MWh, frente a 253,3 MWh de septiembre.</p>
          </article>
        </div>
        <div class="trend" style="min-height:1.05in">
          <div class="trend-head">
            <h4>Disponibilidad del parque · Feb–Oct</h4>
            <p class="leg"><span><i class="d"></i>Sistema N Costayaco</span><span><i class="m"></i>Meta 98 %</span><span>Oct · {pct(c['disp_n'])}</span></p>
          </div>
          {series_svg(disp_pts, "#1E3A5F", "rgb(30 58 95 / 12%)", 0.952, 1.002, (0.96, 0.98))}
        </div>
        """)

    ymax = max(val for _, val in m["gen_days"]) * 1.08
    bars = []
    for d, val in m["gen_days"]:
        label = str(d.day) if d.day in (1, 8, 15, 22, 31) else ""
        bars.append(f'<div><span style="height:{val / ymax * 100:.1f}%"><i class="gas"></i></span><em>{label}</em></div>')
    jen_share = m["jen"]["kwh"] / p["kwh"]
    jin_share = m["jin"]["kwh"] / p["kwh"]
    fleet_max = max(m["jen"]["kwh"], m["jin"]["kwh"])
    delta = (m["mwh_d"] - SEP_MWH_D) / SEP_MWH_D
    s7 = page(7, f"""
        <h2 class="title">Detalle de la generación</h2>
        <div class="kpis k4">
          {kpi("Total", f"{n(p['mwh'], 1)} MWh", "gas 01–31 · 12 unidades en servicio")}
          {kpi("Ritmo diario", f"{n(m['mwh_d'], 1)} MWh/d", f"{'+' if delta >= 0 else ''}{n(delta * 100, 1)} % vs sep {n(SEP_MWH_D, 1)}", "ok")}
          {kpi("Pico diario", f"{n(m['peak'][1], 0)} MWh", f"día {m['peak'][0].day} · mínimo {n(m['valle'][1], 0)} MWh", "violet")}
          {kpi("Potencia media", f"{n(p['kw'], 0)} kW", f"{n(p['op'], 0)} h de operación", "blue")}
        </div>
        <div class="kpis k4">
          {kpi("Mix gas", "100 %", f"{n(p['mwh'], 1)} MWh · Jenbacher + Jinan", "blue")}
          {kpi("Diésel", "0 MWh", "el mes operó en su totalidad con gas", "blue")}
          {kpi("Costayaco", f"{n(c['mwh'], 1)} MWh", f"{pct(c['kwh'] / p['kwh'], 1)} · {n(c['op'], 0)} h OP")}
          {kpi("Vonú", f"{n(v['mwh'], 1)} MWh", f"{pct(v['kwh'] / p['kwh'], 1)} · {n(v['op'], 0)} h OP", "violet")}
        </div>
        <div class="days">
          <div class="trend-head">
            <h4>Generación diaria · MWh</h4>
            <p class="leg"><span><i class="d"></i>Gas</span><span>Pico día {m['peak'][0].day} · {n(m['peak'][1], 0)} MWh</span></p>
          </div>
          <div class="bars">{''.join(bars)}</div>
          <ul class="hlist">
            <li><span>Jenbacher</span><b style="width:{m['jen']['kwh'] / fleet_max * 100:.0f}%"></b><em>{n(m['jen']['kwh'] / 1000, 0)} MWh · {pct(jen_share, 0)}</em></li>
            <li><span>Jinan</span><b class="ok" style="width:{m['jin']['kwh'] / fleet_max * 100:.0f}%"></b><em>{n(m['jin']['kwh'] / 1000, 0)} MWh · {pct(jin_share, 0)}</em></li>
          </ul>
        </div>
        """)

    fo_hist = FO_COPOWER + [("Oct", c["fo"], c["fails"])]
    s8 = page(8, f"""
        <h2 class="title">Fallas de octubre</h2>
        <p class="regla">Cinco fallas de Copower y una parada externa. Solo las fallas de Copower reducen el R%.</p>
        <div class="kpis k3">
          {kpi("Copower", f"{n(c['fails'], 0)} fallas", f"{n(c['fo'], 2)} h · CPW-04 cuatro · CPW-05 una", "warn")}
          {kpi("Externa", "3,32 h", "salida de la MRU el 19-oct · no entra en el R%", "blue")}
          {kpi("R% del sistema", pct(c['r_n']), f"septiembre {pct(REL[-1][1])} · cuatro fallas y 4 h", "ok")}
        </div>
        <table class="evt fo"><thead><tr><th>Quién</th><th>Fecha</th><th>Equipo</th><th>Fallas</th><th>Horas</th><th>Qué pasó</th></tr></thead><tbody>
          <tr class="sec"><td colspan="6">Copower</td></tr>
          <tr class="cop"><td><b>Copower</b></td><td>16-oct</td><td><b>CPW-04</b></td><td class="rel">3</td><td class="rel">0,28 h</td><td>Tres paradas por detonación al subir la potencia. Fuera de línea 16 min.</td></tr>
          <tr class="cop"><td><b>Copower</b></td><td>18-oct</td><td><b>CPW-05</b></td><td class="rel">1</td><td class="rel">1,00 h</td><td>Actuador TecJet desajustado, con flujo irregular de gas.</td></tr>
          <tr class="cop"><td><b>Copower</b></td><td>29-oct</td><td><b>CPW-04</b></td><td class="rel">1</td><td class="rel">0,13 h</td><td>Oscilación de potencia de 16:03 a 16:11. Parada de la lógica.</td></tr>
          <tr class="sec"><td colspan="6">Parada externa</td></tr>
          <tr class="ext"><td><b>Externa</b></td><td>19-oct</td><td><b>CPW-03 · 06 · 07 · 10</b></td><td class="rel">—</td><td class="rel">3,32 h</td><td>Salida de la MRU a las 00:06. CPW-03 0,65 h · CPW-06 1,65 h · CPW-07 0,52 h · CPW-10 0,50 h.</td></tr>
        </tbody></table>
        <div class="trend" style="flex:1;min-height:0">
          <div class="trend-head">
            <h4>Horas y fallas de Copower · Feb–Oct</h4>
            <p class="leg"><span><i class="d"></i>Horas · eje izquierdo</span><span><i class="g"></i>Fallas · eje derecho</span></p>
          </div>
          {hours_svg(fo_hist)}
        </div>
        """)

    ext_units = sorted(m["units"], key=lambda u: -u["ext"])
    ext_max = ext_units[0]["ext"] or 1
    ext_bars = "".join(
        f'<li><span>{esc(u["tag"])}</span><b class="{"out" if u["ext"] == ext_max else ""}" style="width:{u["ext"] / ext_max * 100:.0f}%"></b><em>{n(u["ext"], 2)} h</em></li>'
        for u in ext_units if u["ext"]
    )

    # Control de ejecución de la sábana. Lo que no está aquí se hizo el día planeado.
    # otro: la celda se cubrió en otra fecha del programa. El mes cierra las 26.
    DESVIOS = {
        (date(2026, 10, 5), "CPW-10"): ("otro", "Ejecutado el 15. El 5 el equipo no cumplía las horas."),
        (date(2026, 10, 7), "CPW-05"): ("otro", "Ejecutado el 10. M5 y cambio de aceite. El 7 la MRU estaba en mantenimiento."),
        (date(2026, 10, 11), "CPW-05"): ("otro", "Ejecutado el 10, con el M5. El 7 no fue posible por la MRU."),
        (date(2026, 10, 13), "CPW-02"): ("otro", "Ejecutado el 28, dentro de la fecha. El 13 no cumplía horas."),
        (date(2026, 10, 13), "JIN-02"): ("otro", "Ejecutado el 14, M4."),
        (date(2026, 10, 14), "CPW-12"): ("otro", "Ejecutado el 27, por horas. El 14 se ejecutó JIN-02."),
        (date(2026, 10, 19), "CPW-11"): ("otro", "Ejecutado el 26, M4. El 19 se usó para el intercooler de CPW-05."),
        (date(2026, 10, 21), "CPW-12"): ("otro", "Ejecutado el 27. El 21 el equipo estuvo en stand-by."),
        (date(2026, 10, 23), "CPW-05"): ("otro", "Ejecutado el 19, cambio de intercooler, con la salida de la MRU."),
        (date(2026, 10, 24), "JIN-02"): ("otro", "Ejecutado el 31, M5, dentro de la fecha."),
        (date(2026, 10, 27), "CPW-06"): ("otro", "Ejecutado el 2. El 27, por horas de operación, se intervino CPW-12."),
        (date(2026, 10, 30), "JIN-01"): ("otro", "Ejecutado el 31, M4. A solicitud de GTE, por la condición de la MRU."),
        (date(2026, 10, 31), "CPW-10"): ("otro", "Ejecutado el 1 de noviembre, M4. A solicitud de GTE, por la MRU."),
    }
    HECHO_NOTA = {
        (date(2026, 10, 10), "CPW-05"): "Hecho · 08:15–17:48",
        (date(2026, 10, 17), "CPW-04"): "Hecho · M4",
        (date(2026, 10, 26), "CPW-11"): "Hecho · M4",
        (date(2026, 10, 28), "CPW-02"): "Hecho · M8",
        (date(2026, 10, 29), "JIN-02"): "Hecho · M4",
    }
    jobs = load_sabana()
    by_key = {(j["date"], j["unit"]): j for j in jobs}
    if set(DESVIOS) - set(by_key) or set(HECHO_NOTA) - set(by_key):
        raise SystemExit("hay una celda de mantenimiento que no está en la sábana")
    hechas = sorted(k for k in by_key if k not in DESVIOS)
    pendientes = sorted(k for k, (kind, _) in DESVIOS.items() if kind == "pend")
    otros = sorted(k for k, (kind, _) in DESVIOS.items() if kind == "otro")

    def fila(key, estado, cls):
        job = by_key[key]
        return (
            f"<tr class='{cls}'><td>{job['date'].day:02d}-oct</td><td><b>{esc(job['unit'])}</b></td>"
            f"<td>{n(job['hours'], 0)} h-h</td><td class='rel'>{esc(estado)}</td></tr>"
        )

    hecho_rows = "".join(fila(k, HECHO_NOTA.get(k, "Hecho"), "ok") for k in hechas)
    otro_rows = "".join(fila(k, DESVIOS[k][1], "ok") for k in otros)
    s11 = page(9, f"""
        <h2 class="title">Mantenimiento de octubre</h2>
        <div class="kpis k4">
          {kpi("Sábana", str(len(jobs)), "celdas programadas")}
          {kpi("Hechas el día", str(len(hechas)), "en la fecha planeada", "ok")}
          {kpi("Corridas otro día", str(len(otros)), "ajuste por la MRU, las horas o solicitud de GTE", "blue")}
          {kpi("Programa", str(len(jobs)), "las 26 celdas se ejecutaron", "ok")}
        </div>
        <table class="evt fo"><thead><tr><th>Planeada</th><th>Equipo</th><th>Sábana</th><th>Estado</th></tr></thead><tbody>
          <tr class="sec"><td colspan="4">Hechas el día planeado</td></tr>
          {hecho_rows}
          <tr class="sec"><td colspan="4">Ejecutadas en otra fecha</td></tr>
          {otro_rows}
        </tbody></table>
        """)

    jen_avg = (m["jen"]["kwh"] / 1000) / m["jen"]["n"]
    jin_avg = (m["jin"]["kwh"] / 1000) / m["jin"]["n"]
    ranked = sorted(m["units"], key=lambda u: -u["kwh"])
    emax = ranked[0]["kwh"] / 1000
    elis = "".join(
        f'<li><span>{esc(u["tag"])}</span><b class="{"ok" if u["kwh"] / 1000 >= p["mwh"] / 12 else ""}" style="width:{u["kwh"] / 1000 / emax * 100:.0f}%"></b><em>{n(u["kwh"] / 1000, 0)}</em></li>'
        for u in ranked
    )
    s_carga_rows = []
    s_carga_bars = []
    pruebas = load_carga()
    cumple = [r["entregada"] / r["esperada"] for r in pruebas]
    campo_actual = None
    for prueba in pruebas:
        if prueba["campo"] != campo_actual:
            campo_actual = prueba["campo"]
            nombre = "Costayaco" if campo_actual == "COSTAYACO" else "Vonú"
            gas = "gas Moqueta" if campo_actual == "COSTAYACO" else "gas del campo"
            s_carga_rows.append(f'<tr class="sec"><td colspan="7">{nombre} · {gas}</td></tr>')
        ratio = prueba["entregada"] / prueba["esperada"]
        presion = f"{n(prueba['p0'], 0)} psi" if prueba["p0"] == prueba["p1"] else f"{n(prueba['p0'], 0)} → {n(prueba['p1'], 0)} psi"
        s_carga_rows.append(
            f"<tr><td><b>{esc(prueba['tag'])}</b></td>"
            f"<td>{prueba['date'].day:02d}-oct · {prueba['t0']}–{prueba['t1']}</td>"
            f"<td>{esc(prueba['gas'])}</td>"
            f"<td class='rel'>{n(prueba['esperada'], 0)}</td>"
            f"<td class='rel'>{n(prueba['entregada'], 0)}</td>"
            f"<td class='rel'>{pct(ratio, 1)}</td>"
            f"<td>{presion}<small>{esc(prueba['cierre'])}</small></td></tr>"
        )
        s_carga_bars.append(
            f"<li><span>{esc(prueba['tag'])}</span>"
            f"<b class='ok' style='width:{min(ratio, 1) * 100:.1f}%'></b>"
            f"<em>{pct(ratio, 1)}</em></li>"
        )
    s_carga = page(10, f"""
        <h2 class="title">Pruebas de máxima carga</h2>
        <p class="regla">Seis pruebas cerradas, del 29 al 31 de octubre, con el equipo estable. Costayaco en gas Moqueta y Vonú en el gas del campo. Las operaron José Luis Álvarez y Javier Montes Losada.</p>
        <div class="kpis k3">
          {kpi("Pruebas", "6 estables", "29, 30 y 31 de octubre", "ok")}
          {kpi("De la esperada", f"{pct(min(cumple), 1)} o más", "las seis pruebas, sobre la carga esperada", "ok")}
          {kpi("Gas", "Moqueta y campo", "Costayaco 144–176 psi · Vonú 10–27 psi", "blue")}
        </div>
        <table class="evt fo"><thead><tr><th>Equipo</th><th>Cuándo</th><th>Gas</th><th>Esperada</th><th>Entregada</th><th>Cumple</th><th>Presión y cierre</th></tr></thead><tbody>
          {''.join(s_carga_rows)}
        </tbody></table>
        <div class="card carga-cumple">
          <h4>Cumplimiento de la carga esperada</h4>
          <ul class="hlist">{''.join(s_carga_bars)}</ul>
        </div>
        """)

    s12 = page(11, f"""
        <h2 class="title">Desempeño energético</h2>
        <div class="kpis k4">
          {kpi("Entrega / máquina", f"{n(p['mwh'] / 12, 0)} MWh", "promedio de 12 unidades en 31 días", "ok")}
          {kpi("Vs septiembre", f"+{n(m['mwh_d'] - SEP_MWH_D, 1)}", f"MWh/día · sep {n(SEP_MWH_D, 1)} → oct {n(m['mwh_d'], 1)}", "ok")}
          {kpi("Parque", f"{n(p['mwh'], 1)} MWh", "100 % gas · 31 días")}
          {kpi("Paradas externas", f"{n(p['ext'], 1)} h", f"Costayaco {n(c['ext'], 1)} h · Vonú {n(v['ext'], 1)} h", "warn")}
        </div>
        <div class="stack">
          <div class="card">
            <h4>Energía por máquina · MWh</h4>
            <ul class="hlist flat">{elis}</ul>
            <p class="regla">Jenbacher {n(jen_avg, 0)} · Jinan {n(jin_avg, 0)} MWh por máquina. Potencia media del parque {n(p['kw'], 0)} kW.</p>
          </div>
          <div class="card">
            <h4>Paradas externas · no entran en el R%</h4>
            <ul class="hlist flat">{ext_bars}</ul>
            <p class="regla">El 19 de octubre se registran {n(p['ext'], 1)} h por salida de la MRU: CPW-03, CPW-06, CPW-07 y CPW-10. El resto de las salidas queda en stand-by.</p>
          </div>
        </div>
        """)

    s_hse = page(12, f"""
        <h2 class="title">HSE de octubre</h2>
        <p class="regla">Inspección de Gran Tierra, con cierre el 22 de octubre, y actividades COPASST en Costayaco. Los focos del mes son trabajo en alturas y bloqueo y etiquetado.</p>
        <div class="kpis k4">
          <article class="ok"><span>Hallazgos</span><strong>2</strong><small>cerrados, con evidencia</small></article>
          <article class="ok"><span>Plan</span><strong>90 %</strong><small>avance del plan de acción</small></article>
          <article class="ok"><span>Accidentes</span><strong>0</strong><small>sin enfermedad laboral</small></article>
          <article class="ok"><span>Capacitación</span><strong>100 %</strong><small>cobertura y cumplimiento</small></article>
        </div>
        <div class="hse-duo">
          <div class="hse-col">
            <table class="evt fo"><thead><tr><th>Sitio</th><th>Qué se cerró</th><th>Fecha</th></tr></thead><tbody>
              <tr class="ok"><td><b>Costayaco</b></td><td>Químicos y rótulos del almacenamiento</td><td>14-oct</td></tr>
              <tr class="ok"><td><b>Costayaco</b></td><td>Derrame de aceite</td><td>15-oct</td></tr>
              <tr class="ok"><td><b>Costayaco</b></td><td>Agua en los diques. La carpa queda como mejora</td><td>25-oct</td></tr>
              <tr class="ok"><td><b>Cumplidor</b></td><td>Separación de residuos y señalización del acopio</td><td>15-oct</td></tr>
            </tbody></table>
            <table class="evt fo"><thead><tr><th>Acción del plan</th><th>Fecha</th><th>Avance</th></tr></thead><tbody>
              <tr class="ok"><td>Plan FO-HSE-130 para las desviaciones de Gran Tierra</td><td>02-oct</td><td class="rel">90 %</td></tr>
              <tr class="ok"><td>Taller de equipo seguro, con lista de asistencia</td><td>16-oct</td><td class="rel">90 %</td></tr>
              <tr class="ok"><td>Seguimiento HSE en campo y control documental</td><td>30-oct</td><td class="rel">90 %</td></tr>
              <tr class="ok"><td>Retorno del líder a campo, con el protocolo de riesgo público</td><td>30-oct</td><td class="rel">90 %</td></tr>
            </tbody></table>
          </div>
          <div class="hse-col">
            <p class="hse-note"><b>Horas hombre.</b> Costayaco 3.180 h y 11 trabajadores. Cohembí 984 h y 4. Total 4.164 h y 15 personas.</p>
            <p class="hse-note"><b>Una condición insegura.</b> La puerta de emergencia del SW 03 quedó sin escalera, con riesgo de caída a más de 1 m. Se cerró con socialización, señalización y verificación.</p>
            <p class="hse-note"><b>Auditoría interna RUC</b> el 8 y el 9 de octubre. En el mes no hubo gestión del cambio.</p>
            <p class="hse-note"><b>Actividades.</b> Focus semanal del 1 al 30, socialización de la condición insegura, formato MSA, charlas diarias, requisitos legales SSTA el 15, reinducción HSEQ el 29, permisos de trabajo y ATS el 8, retorno seguro, y taller de equipo y comunicación el 14.</p>
          </div>
        </div>
        <div class="hse-fotos pair">
          {hse_fig("hse-costayaco-antes.jpg", "Costayaco, tambores de aceite a la intemperie antes del cierre", "Antes · químicos en Costayaco", "cover", "")}
          {hse_fig("hse-costayaco-despues.jpg", "Costayaco, tambores bajo carpa con rótulos y dique después del cierre", "Después · carpa, rótulos y dique", "cover", "")}
        </div>
        """)
    s_campo = page(13, f"""
        <h2 class="title">Campo, mediciones e inspecciones</h2>
        <p class="regla">Puerta del SW 03 cerrada con señalización. Taller del 14 de octubre y focus semanal. Sonometría y luxometría el 29. Inspección de camilla, extintor y botiquín.</p>
        <div class="hse-fotos campo">
          {hse_fig("puerta-antes.png", "Puerta de emergencia del SW 03 antes de la señalización", "Antes · puerta del SW 03", "contain")}
          {hse_fig("puerta-despues-b.png", "Puerta del SW 03 con avisos de peligro y piso demarcado", "Después · señalización", "contain")}
          {hse_fig("taller-mesa.png", "Personal en el taller del 14 de octubre", "Taller · 14 de octubre")}
          {hse_fig("focus-remoto-b.png", "Focus semanal con el personal conectado", "Focus semanal")}
          {hse_fig("sonometria.png", "Sonometría junto a los generadores, 29 de octubre", "Sonometría · 29 de octubre")}
          {hse_fig("luxometria.png", "Luxometría en la sala de control, 29 de octubre", "Luxometría · 29 de octubre")}
          {hse_fig("inspeccion-camilla.png", "Camilla de emergencia y extintor señalizados", "Camilla")}
          {hse_fig("inspeccion-extintor.png", "Extintor señalizado en la sala de control", "Extintor")}
          {hse_fig("inspeccion-botiquin.png", "Contenido del botiquín de primeros auxilios", "Botiquín")}
        </div>
        """)

    s13 = page(14, f"""
        <h2 class="title">Conclusiones</h2>
        <ol class="conc" style="justify-content:flex-start;gap:0.07in">
          <li><strong>Octubre cumple el contrato.</strong> El sistema N de Costayaco cierra en {pct(c['disp_n'])} de disponibilidad y de confiabilidad. La generación de gas cierra en {n(m['mwh_d'], 1)} MWh por día.</li>
          <li><strong>Costayaco queda sobre 98 %.</strong> Cinco fallas y un MTTF de {n(mttf, 0)} h. Por máquina quedan bajo 98 %: {esc(below_txt)}. Esas horas son de sábana autorizada y no afectan el sistema N.</li>
          <li><strong>Las cinco fallas son de Copower.</strong> CPW-04: cuatro, {n(units['CPW-04']['fo'], 2)} h, {pct(units['CPW-04']['r'])}. CPW-05: una, {n(units['CPW-05']['fo'], 2)} h, {pct(units['CPW-05']['r'])}.<br>Tres detonaciones el 16, válvula TecJet el 18 y oscilación de potencia el 29.</li>
          <li><strong>Vonú cumple el mínimo de 90 %.</strong> Sistema N {pct(v['disp_n'])} y confiabilidad {pct(v['r_n'])}, sin fallas. La energía pasa de 253,3 a {n(v['mwh'], 1)} MWh.</li>
          <li><strong>El seguimiento del mes es CPW-04.</strong> Cuatro fallas y el menor MTTF, {n(menor['op'] / menor['fo_n'], 0)} h. CPW-12 acumula {n(units['CPW-12']['sb'], 0)} h en stand-by. Las seis pruebas de máxima carga cierran estables, en {pct(min(cumple), 1)} o más.</li>
          <li><strong>Mantenimiento y HSE cierran el mes.</strong> La sábana ejecuta las {len(jobs)} celdas: {len(hechas)} en la fecha planeada y {len(otros)} en otra fecha. Sin accidentes. Dos hallazgos cerrados y el plan de acción al 90 %.</li>
        </ol>
        """)

    return s1 + s2 + s3 + s4 + s5 + s6 + s7 + s8 + s11 + s_carga + s12 + s_hse + s_campo + s13


def write_deck(m, path, audience, title):
    text = OUT.read_text(encoding="utf-8")
    head, _, _rest = text.partition("<body>")
    if "<body>" not in text:
        raise SystemExit("no se encontró <body>")
    head = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", head, count=1)
    extra = """<style id="hse-extra">
.hse-duo { flex: 0 0 auto; display: grid; grid-template-columns: 1.22fr 0.78fr; gap: 8px; }
.hse-col { min-height: 0; display: flex; flex-direction: column; gap: 6px; }
.hse-note { margin: 0; font-size: 8pt; line-height: 1.32; color: #1e293b; }
.hse-fotos { flex: 1; min-height: 0; display: grid; gap: 6px; }
.hse-fotos.pair { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr; }
.hse-fotos.campo { grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; }
.carga-cumple { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 8px; }
.carga-cumple .hlist { flex: 1; justify-content: space-evenly; gap: 0; }
.carga-cumple .hlist li { font-size: 8.5pt; }
</style>"""
    head = re.sub(r'<style id="hse-extra">.*?</style>', "", head, count=1, flags=re.S)
    head = head.replace("</head>", extra + "</head>", 1)
    script = """
      <script>
      function fitSlides() {
        var s = Math.min(1, (window.innerWidth - 16) / (10 * 96));
        document.querySelectorAll(".slide").forEach(function (el) { el.style.zoom = String(s); });
      }
      addEventListener("resize", fitSlides);
      fitSlides();
      </script>"""
    path.write_text(head + "<body>" + render(m, audience) + script + "</body></html>", encoding="utf-8")
    print(path)


def main():
    export_hse_media()
    m = build(load())
    write_deck(m, OUT_INTERNO, "interno", "Indicadores COPOWER PUTN · Octubre 2026 · Interno")
    write_deck(m, OUT_GTE, "gte", "Indicadores COPOWER PUTN · Octubre 2026 GTE")
    OUT.write_text(OUT_INTERNO.read_text(encoding="utf-8"), encoding="utf-8")
    print(
        f"mwh {m['park']['mwh']:.1f} cyc {m['cyc']['mwh']:.1f} "
        f"sistema {m['cyc']['disp_n']:.4f} fallas {m['cyc']['fails']} sb {m['cyc']['sb_n']:.1f}"
    )


if __name__ == "__main__":
    main()
