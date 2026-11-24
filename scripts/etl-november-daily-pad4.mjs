/**
 * ETL: FORMATO GENERACION / reporte diario ACR Pad 4 (hojas por día)
 * → src/domain/reliability/history/data/novemberDailyPad4.json
 *
 * Uso:
 *   node scripts/etl-november-daily-pad4.mjs
 *   node scripts/etl-november-daily-pad4.mjs [ruta.xlsx]
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const ROOT = path.resolve(import.meta.dirname, "..");
const DEFAULT_XLSX = path.join(
  ROOT,
  "data/Acordionero/operacion/2026-11/FORMATO GENERACION NOVIEMBRE 2026.xlsx",
);
const OUT = path.join(ROOT, "src/domain/reliability/history/data/novemberDailyPad4.json");

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
  if (v == null || v === "") return 0;
  if (v instanceof Date) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function text(v) {
  if (v == null || v === "") return null;
  const s = String(v).trim();
  return s || null;
}

if (!fs.existsSync(SRC)) {
  console.error(`No existe: ${SRC}`);
  process.exit(1);
}

const wb = XLSX.readFile(SRC, { cellDates: true });
const daySheets = wb.SheetNames.filter((n) => /^\d{1,2}$/.test(String(n).trim()));

const records = [];
const dailyGas = [];

for (const name of daySheets) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: null });
  const fecha = iso(rows[0]?.[6]) || iso(rows[0]?.[0]);
  if (!fecha || !fecha.startsWith("2026-11")) continue;

  const seen = new Set();
  const dayRows = [];
  for (const r of rows.slice(2)) {
    let tag = String(r?.[2] || "").trim().toUpperCase().replace(/\s+/g, "");
    if (!/^G-|^J/.test(tag)) continue;
    if (/J320/i.test(tag)) tag = "G-J320-1";
    if (seen.has(tag)) continue;
    seen.add(tag);
    const estado = text(r[4]);
    const hOp = num(r[8]);
    const kwh = num(r[11]);
    const hProg = num(r[12]);
    const hFs = num(r[13]);
    const hCli = num(r[14]);
    const hSb = num(r[15]);
    if (!estado && hOp === 0 && kwh === 0 && hSb === 0 && hProg === 0 && hFs === 0) continue;
    dayRows.push({
      fecha,
      sheet: name,
      n: text(r[0]),
      tag,
      kwNom: num(r[3]),
      estado: estado || "—",
      kwProm: num(r[5]),
      horometroInicial: num(r[6]) || null,
      horometroFinal: num(r[7]) || null,
      hOp,
      kwh,
      hProg,
      hFs,
      hCli,
      hSb,
      hParadas: num(r[16]),
    });
  }

  // Descartar hojas con fórmulas rotas o lecturas acumuladas mal pegadas.
  const bad = dayRows.some(
    (r) =>
      r.hOp < 0 ||
      r.kwh < 0 ||
      r.hSb < 0 ||
      r.hOp > 24.5 ||
      r.hSb > 24.5 ||
      r.kwh > 50_000,
  );
  const dayKwh = dayRows.reduce((s, r) => s + r.kwh, 0);
  const dayOp = dayRows.reduce((s, r) => s + r.hOp, 0);
  if (bad || dayRows.length === 0 || dayKwh > 300_000 || dayOp > 220) continue;

  for (const row of dayRows) records.push(row);

  let gasIni = null;
  let gasFin = null;
  let gasTotal = null;
  let totalKwhDia = null;
  for (const r of rows) {
    if (!Array.isArray(r)) continue;
    for (let i = 0; i < r.length; i++) {
      const cell = String(r[i] ?? "");
      if (/Consumo de gas Inicial/i.test(cell)) gasIni = num(r[i + 1]) || null;
      if (/Consumo de gas Final/i.test(cell)) gasFin = num(r[i + 1]) || null;
      if (/Total cosumo de gas|Total consumo de gas/i.test(cell)) gasTotal = num(r[i + 1]) || null;
      if (/TOTAL KW\/h DIA/i.test(cell)) totalKwhDia = num(r[i + 2]) || num(r[i + 1]) || null;
    }
  }
  if (gasTotal == null && gasIni != null && gasFin != null) gasTotal = gasFin - gasIni;
  dailyGas.push({ fecha, gasIni, gasFin, gasM3: gasTotal, totalKwhDia });
}

const dates = [...new Set(records.map((r) => r.fecha))].sort();
const corte = dates.at(-1);
const live = records.filter((r) => r.fecha <= corte);

const byTag = new Map();
for (const r of live) {
  const cur = byTag.get(r.tag) || {
    tag: r.tag,
    kwNom: r.kwNom,
    kwh: 0,
    hOp: 0,
    hSb: 0,
    hProg: 0,
    hFs: 0,
    hCli: 0,
    fallas: 0,
    days: 0,
    horometroFinal: null,
  };
  cur.kwh += r.kwh;
  cur.hOp += r.hOp;
  cur.hSb += r.hSb;
  cur.hProg += r.hProg;
  cur.hFs += r.hFs;
  cur.hCli += r.hCli;
  if (r.hFs > 0) cur.fallas += 1;
  cur.days += 1;
  cur.kwNom = r.kwNom || cur.kwNom;
  cur.horometroFinal = r.horometroFinal ?? cur.horometroFinal;
  byTag.set(r.tag, cur);
}

const unitsDetail = [...byTag.values()]
  .map((u) => {
    const hTot = u.days * 24;
    return {
      tag: u.tag,
      kwNom: u.kwNom,
      kwh: Number(u.kwh.toFixed(1)),
      hOp: Number(u.hOp.toFixed(2)),
      hSb: Number(u.hSb.toFixed(2)),
      hProg: Number(u.hProg.toFixed(2)),
      hFs: Number(u.hFs.toFixed(2)),
      hCli: Number(u.hCli.toFixed(2)),
      hTot,
      fallas: u.fallas,
      days: u.days,
      horometroFinal: u.horometroFinal,
      disp: hTot > 0 ? Number(((u.hOp + u.hSb) / hTot).toFixed(6)) : null,
      conf: hTot > 0 ? Number(((hTot - u.hFs) / hTot).toFixed(6)) : null,
    };
  })
  .sort((a, b) => b.kwh - a.kwh);

const daily = dates.map((fecha) => {
  const dayRows = live.filter((r) => r.fecha === fecha);
  const kwh = dayRows.reduce((s, r) => s + r.kwh, 0);
  const hOp = dayRows.reduce((s, r) => s + r.hOp, 0);
  const hSb = dayRows.reduce((s, r) => s + r.hSb, 0);
  const hFs = dayRows.reduce((s, r) => s + r.hFs, 0);
  const hCli = dayRows.reduce((s, r) => s + r.hCli, 0);
  const hProg = dayRows.reduce((s, r) => s + r.hProg, 0);
  const fallas = dayRows.filter((r) => r.hFs > 0).length;
  const hTot = dayRows.length * 24;
  const gas = dailyGas.find((g) => g.fecha === fecha);
  return {
    fecha,
    kwh: Number(kwh.toFixed(1)),
    hOp: Number(hOp.toFixed(2)),
    hSb: Number(hSb.toFixed(2)),
    hFs: Number(hFs.toFixed(2)),
    hCli: Number(hCli.toFixed(2)),
    hProg: Number(hProg.toFixed(2)),
    fallas,
    gasM3: gas?.gasM3 ?? null,
    disp: hTot > 0 ? Number(((hOp + hSb) / hTot).toFixed(6)) : null,
  };
});

const hOp = live.reduce((s, r) => s + r.hOp, 0);
const hSb = live.reduce((s, r) => s + r.hSb, 0);
const hProg = live.reduce((s, r) => s + r.hProg, 0);
const hFs = live.reduce((s, r) => s + r.hFs, 0);
const hCli = live.reduce((s, r) => s + r.hCli, 0);
const kwh = live.reduce((s, r) => s + r.kwh, 0);
const fallas = live.filter((r) => r.hFs > 0).length;
const hTot = live.length * 24;
const gasM3 = dailyGas
  .filter((g) => g.fecha <= corte && g.gasM3 != null)
  .reduce((s, g) => s + g.gasM3, 0);

const pack = {
  generatedAt: new Date().toISOString(),
  sourceFile: path.relative(ROOT, SRC).replaceAll("\\", "/"),
  month: "Nov",
  corte,
  corteLabel: `Corte ${Number(corte.slice(8, 10))} nov ${corte.slice(0, 4)}`,
  dateRange: { min: dates[0], max: corte },
  field: {
    campo: "pad4",
    days: dates.length,
    units: unitsDetail.length,
    hOp: Number(hOp.toFixed(2)),
    hSb: Number(hSb.toFixed(2)),
    hProg: Number(hProg.toFixed(2)),
    hFs: Number(hFs.toFixed(2)),
    hCli: Number(hCli.toFixed(2)),
    hExt: Number(hCli.toFixed(2)),
    hTot,
    kwh: Number(kwh.toFixed(1)),
    mwh: Number((kwh / 1000).toFixed(3)),
    fallas,
    gasM3: Number(gasM3.toFixed(1)),
    disp: hTot > 0 ? Number(((hOp + hSb) / hTot).toFixed(6)) : null,
    conf: hTot > 0 ? Number(((hTot - hFs) / hTot).toFixed(6)) : null,
    unitsDetail,
    daily,
  },
  records: live,
  dailyGas: dailyGas.filter((g) => g.fecha <= corte),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(pack));
const f = pack.field;
console.log(`OK → ${path.relative(ROOT, OUT)}`);
console.log(`fuente ${pack.sourceFile}`);
console.log(`corte ${corte} · registros ${live.length} · días ${dates.length}`);
console.log(
  `PAD4 Disp ${(f.disp * 100).toFixed(2)}% · Conf ${(f.conf * 100).toFixed(2)}% · ${f.mwh} MWh · FO ${f.fallas} · gas ${f.gasM3} m³`,
);
