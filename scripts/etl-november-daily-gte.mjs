/**
 * ETL: Reporte Diario de Operaciones GTE (formato fila/día · máquina)
 * → src/domain/reliability/history/data/novemberDailyGte.json
 *
 * Extrae todas las columnas del libro (horómetros, consumos, observaciones).
 *
 * Uso:
 *   node scripts/etl-november-daily-gte.mjs
 *   node scripts/etl-november-daily-gte.mjs [ruta.xlsx]
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const ROOT = path.resolve(import.meta.dirname, "..");
const DEFAULT_XLSX = path.join(
  ROOT,
  "data/Costayaco/operacion/reporte-diario/2026-11/Reporte Diario de Operaciones GTE.xlsx",
);
const OUT = path.join(ROOT, "src/domain/reliability/history/data/novemberDailyGte.json");

const SRC = path.resolve(process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_XLSX);

function iso(v) {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  return null;
}

function num(v) {
  if (v == null || v === "" || v === "NO APLICA") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function num0(v) {
  return num(v) ?? 0;
}

function text(v) {
  if (v == null || v === "") return null;
  const s = String(v).trim();
  if (!s || /^NO APLICA$/i.test(s)) return null;
  return s;
}

function fieldSnap(records, campo, corte, dates) {
  const rows = records.filter((r) => r.campo === campo && r.fecha <= corte);
  const hOp = rows.reduce((s, r) => s + r.hOp, 0);
  const hSb = rows.reduce((s, r) => s + r.hSb, 0);
  const hMtoP = rows.reduce((s, r) => s + r.hMtoP, 0);
  const hMtoC = rows.reduce((s, r) => s + r.hMtoC, 0);
  const hExt = rows.reduce((s, r) => s + r.hExt, 0);
  const hTot = rows.reduce((s, r) => s + r.hTot, 0);
  const kwh = rows.reduce((s, r) => s + r.kwh, 0);
  const fallas = rows.reduce((s, r) => s + r.fallas, 0);
  const consumoPrimario = rows.reduce((s, r) => s + (r.consumoPrimario ?? 0), 0);
  const obsCount = rows.filter((r) => r.observaciones).length;

  const byTag = new Map();
  for (const r of rows) {
    const cur = byTag.get(r.tag) || {
      tag: r.tag,
      unidad: r.unidad,
      kwh: 0,
      hOp: 0,
      hSb: 0,
      hMtoP: 0,
      hMtoC: 0,
      hTot: 0,
      hExt: 0,
      fallas: 0,
      consumoPrimario: 0,
      capInstKw: r.capInstKw,
      capEntKw: r.capEntKw,
      fuel: r.fuel,
      horometroFinal: null,
      lastFecha: null,
    };
    cur.kwh += r.kwh;
    cur.hOp += r.hOp;
    cur.hSb += r.hSb;
    cur.hMtoP += r.hMtoP;
    cur.hMtoC += r.hMtoC;
    cur.hTot += r.hTot;
    cur.hExt += r.hExt;
    cur.fallas += r.fallas;
    cur.consumoPrimario += r.consumoPrimario ?? 0;
    if (!cur.lastFecha || r.fecha >= cur.lastFecha) {
      cur.lastFecha = r.fecha;
      cur.horometroFinal = r.horometroFinal;
    }
    byTag.set(r.tag, cur);
  }

  const unitsDetail = [...byTag.values()]
    .map((u) => ({
      tag: u.tag,
      unidad: u.unidad,
      kwh: Number(u.kwh.toFixed(1)),
      hOp: u.hOp,
      hSb: u.hSb,
      hMtoP: u.hMtoP,
      hMtoC: u.hMtoC,
      hTot: u.hTot,
      hExt: u.hExt,
      fallas: u.fallas,
      consumoPrimario: Number(u.consumoPrimario.toFixed(1)),
      capInstKw: u.capInstKw,
      capEntKw: u.capEntKw,
      fuel: u.fuel,
      horometroFinal: u.horometroFinal,
      disp: u.hTot > 0 ? Number(((u.hOp + u.hSb) / u.hTot).toFixed(6)) : null,
      conf: u.hTot > 0 ? Number(((u.hTot - u.hMtoC) / u.hTot).toFixed(6)) : null,
    }))
    .sort((a, b) => b.kwh - a.kwh);

  const daily = dates
    .filter((d) => d <= corte)
    .map((fecha) => {
      const dayRows = rows.filter((r) => r.fecha === fecha);
      const dkwh = dayRows.reduce((s, r) => s + r.kwh, 0);
      const dFallas = dayRows.reduce((s, r) => s + r.fallas, 0);
      const dOp = dayRows.reduce((s, r) => s + r.hOp, 0);
      const dSb = dayRows.reduce((s, r) => s + r.hSb, 0);
      const dTot = dayRows.reduce((s, r) => s + r.hTot, 0);
      const dExt = dayRows.reduce((s, r) => s + r.hExt, 0);
      const dObs = dayRows.filter((r) => r.observaciones).length;
      return {
        fecha,
        kwh: Number(dkwh.toFixed(1)),
        fallas: dFallas,
        hOp: dOp,
        hSb: dSb,
        hExt: dExt,
        obs: dObs,
        disp: dTot > 0 ? Number(((dOp + dSb) / dTot).toFixed(6)) : null,
      };
    });

  const observaciones = rows
    .filter((r) => r.observaciones)
    .map((r) => ({
      fecha: r.fecha,
      tag: r.tag,
      unidad: r.unidad,
      fallas: r.fallas,
      hExt: r.hExt,
      hMtoC: r.hMtoC,
      texto: r.observaciones,
    }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || a.tag.localeCompare(b.tag));

  return {
    campo,
    days: dates.filter((d) => d <= corte).length,
    units: unitsDetail.length,
    hOp,
    hSb,
    hMtoP,
    hMtoC,
    hExt,
    hTot,
    kwh: Number(kwh.toFixed(1)),
    mwh: Number((kwh / 1000).toFixed(3)),
    fallas,
    consumoPrimario: Number(consumoPrimario.toFixed(1)),
    obsCount,
    disp: hTot > 0 ? Number(((hOp + hSb) / hTot).toFixed(6)) : null,
    conf: hTot > 0 ? Number(((hTot - hMtoC) / hTot).toFixed(6)) : null,
    unitsDetail,
    daily,
    observaciones,
  };
}

if (!fs.existsSync(SRC)) {
  console.error(`No existe: ${SRC}`);
  process.exit(1);
}

const wb = XLSX.readFile(SRC, { cellDates: true });
const sheetName =
  wb.SheetNames.find((n) => /reporte\s*diario/i.test(n)) ?? wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null });

const records = [];
for (const r of rows.slice(1)) {
  const fecha = iso(r[0]);
  if (!fecha) continue;
  const campoRaw = String(r[2] || "").toUpperCase();
  const campo = campoRaw.includes("VONU")
    ? "vonu"
    : campoRaw.includes("COSTAYACO")
      ? "costayaco"
      : null;
  if (!campo) continue;
  records.push({
    fecha,
    cuenca: text(r[1]),
    campo,
    campoLabel: String(r[2] || "").trim(),
    contratista: text(r[3]),
    unidad: String(r[4] || ""),
    tag: String(r[5] || "").replace(/\s+/g, ""),
    capInstKw: num0(r[6]),
    capEntKw: num0(r[7]),
    horometroInicial: num(r[8]),
    horometroFinal: num(r[9]),
    kwh: num0(r[10]),
    kwProm: num0(r[11]),
    hOp: num0(r[12]),
    hSb: num0(r[13]),
    hMtoP: num0(r[14]),
    hMtoC: num0(r[15]),
    hTot: num0(r[16]),
    hExt: num0(r[17]),
    fallas: num0(r[18]),
    fuel: String(r[19] || "").toUpperCase(),
    fuelSec: text(r[20]),
    consumoPrimario: num(r[21]),
    consumoSecundario: num(r[22]),
    eff: num(r[23]),
    observaciones: text(r[24]),
  });
}

const dates = [...new Set(records.map((r) => r.fecha))].sort();
const corte = dates.at(-1);
const pack = {
  generatedAt: new Date().toISOString(),
  sourceFile: path.relative(ROOT, SRC).replaceAll("\\", "/"),
  month: "Nov",
  corte,
  corteLabel: `Corte ${Number(corte.slice(8, 10))} nov ${corte.slice(0, 4)}`,
  dateRange: { min: dates[0], max: corte },
  columns: [
    "Fecha",
    "Cuenca",
    "Campo",
    "Contratista",
    "Unidad",
    "TAG",
    "Cap. instalada",
    "Cap. entregada",
    "Horómetro ini/fin",
    "kWh",
    "kW promedio",
    "Horas OP/SB/MMT/Ext",
    "Fallas",
    "Combustible",
    "Consumo",
    "Eficiencia",
    "Observaciones",
  ],
  fields: {
    costayaco: fieldSnap(records, "costayaco", corte, dates),
    vonu: fieldSnap(records, "vonu", corte, dates),
  },
  records,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(pack));
const cyc = pack.fields.costayaco;
const vonu = pack.fields.vonu;
console.log(`OK → ${path.relative(ROOT, OUT)}`);
console.log(`fuente ${pack.sourceFile}`);
console.log(`corte ${corte} · registros ${records.length} · obs ${records.filter((r) => r.observaciones).length}`);
console.log(
  `CYC Disp ${(cyc.disp * 100).toFixed(2)}% · Conf ${(cyc.conf * 100).toFixed(2)}% · ${cyc.mwh} MWh · FO ${cyc.fallas} · gas ${cyc.consumoPrimario}`,
);
console.log(
  `VONU Disp ${(vonu.disp * 100).toFixed(2)}% · Conf ${(vonu.conf * 100).toFixed(2)}% · ${vonu.mwh} MWh · FO ${vonu.fallas}`,
);
