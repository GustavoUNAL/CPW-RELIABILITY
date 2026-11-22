/**
 * ETL: Reporte Diario de Operaciones GTE (formato fila/día · máquina)
 * → src/domain/reliability/history/data/novemberDailyGte.json
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
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
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
      capEntKw: r.capEntKw,
      fuel: r.fuel,
    };
    cur.kwh += r.kwh;
    cur.hOp += r.hOp;
    cur.hSb += r.hSb;
    cur.hMtoP += r.hMtoP;
    cur.hMtoC += r.hMtoC;
    cur.hTot += r.hTot;
    cur.hExt += r.hExt;
    cur.fallas += r.fallas;
    byTag.set(r.tag, cur);
  }

  const unitsDetail = [...byTag.values()]
    .map((u) => ({
      ...u,
      kwh: Number(u.kwh.toFixed(1)),
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
      return {
        fecha,
        kwh: Number(dkwh.toFixed(1)),
        fallas: dFallas,
        hOp: dOp,
        disp: dTot > 0 ? Number(((dOp + dSb) / dTot).toFixed(6)) : null,
      };
    });

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
    disp: hTot > 0 ? Number(((hOp + hSb) / hTot).toFixed(6)) : null,
    conf: hTot > 0 ? Number(((hTot - hMtoC) / hTot).toFixed(6)) : null,
    unitsDetail,
    daily,
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
    campo,
    unidad: String(r[4] || ""),
    tag: String(r[5] || "").replace(/\s+/g, ""),
    capInstKw: num(r[6]),
    capEntKw: num(r[7]),
    kwh: num(r[10]),
    kwProm: num(r[11]),
    hOp: num(r[12]),
    hSb: num(r[13]),
    hMtoP: num(r[14]),
    hMtoC: num(r[15]),
    hTot: num(r[16]),
    hExt: num(r[17]),
    fallas: num(r[18]),
    fuel: String(r[19] || "").toUpperCase(),
    eff: r[23] == null || r[23] === "" ? null : num(r[23]),
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
console.log(`corte ${corte} · registros ${records.length}`);
console.log(
  `CYC Disp ${(cyc.disp * 100).toFixed(2)}% · Conf ${(cyc.conf * 100).toFixed(2)}% · ${cyc.mwh} MWh · FO ${cyc.fallas}`,
);
console.log(
  `VONU Disp ${(vonu.disp * 100).toFixed(2)}% · Conf ${(vonu.conf * 100).toFixed(2)}% · ${vonu.mwh} MWh · FO ${vonu.fallas}`,
);
