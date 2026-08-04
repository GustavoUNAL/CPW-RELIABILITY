/**
 * ETL: Horas concertadas GTE → concertacionHoursData.ts
 * Fuente: data/concertacion horas/Horas concertadas con GTE del 01 al 31 julio 2026.xlsx
 *
 * Uso: node scripts/etl-concertacion.mjs
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "data", "concertacion horas");
const XLSX_NAME = fs
  .readdirSync(DIR)
  .find((f) => /Horas concertadas/i.test(f) && f.endsWith(".xlsx") && !f.startsWith("~$"));
if (!XLSX_NAME) {
  console.error("No se encontró Excel de horas concertadas");
  process.exit(1);
}
const XLSX_PATH = path.join(DIR, XLSX_NAME);
const OUT = path.join(ROOT, "src/domain/reliability/reports/concertacionHoursData.ts");

const MONTH_MAP = {
  "01": "Ene",
  "02": "Feb",
  "03": "Mar",
  "04": "Abr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
};

function num(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function str(v) {
  if (v == null) return "";
  return String(v).replace(/\s+/g, " ").trim();
}

function toDateIso(v) {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, "0");
    const d = String(v.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = str(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return null;
}

function monthKeyFromIso(iso) {
  if (!iso) return null;
  const mm = iso.slice(5, 7);
  return MONTH_MAP[mm] ?? null;
}

function parseSheet(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
  if (!rows.length) return [];
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    const date = toDateIso(r[0]);
    if (!date || date.startsWith("1900")) continue;
    const tag = str(r[5]);
    if (!tag) continue;
    const fuelRaw = str(r[19]).toUpperCase();
    const fuel = fuelRaw.includes("DIESEL") ? "DIESEL" : fuelRaw.includes("GAS") ? "GAS" : fuelRaw || "N/D";
    out.push({
      date,
      campo: str(r[2]).toUpperCase() || "N/D",
      model: str(r[4]),
      tag,
      capInstKw: num(r[6]),
      capEntKw: num(r[7]),
      kwh: num(r[10]),
      kwAvg: num(r[11]),
      op: num(r[12]),
      sb: num(r[13]),
      mmtPrev: num(r[14]),
      mmtCorr: num(r[15]),
      totalH: num(r[16]),
      ext: num(r[17]),
      failures: num(r[18]),
      fuel,
      obs: str(r[24]),
    });
  }
  return out;
}

const wb = XLSX.readFile(XLSX_PATH, { cellDates: true });

/** Preferir hoja Julio completa; completar historia May–Jun desde hojas parciales. */
const julSheet =
  wb.SheetNames.find((n) => /01\s*AL\s*31/i.test(n) && /JULIO/i.test(n)) ??
  wb.SheetNames.find((n) => /CONCERTACION 01/i.test(n));
const histSheet =
  wb.SheetNames.find((n) => /12\s*AL\s*28/i.test(n)) ??
  wb.SheetNames.find((n) => /1\s*AL\s*11/i.test(n));

const julRows = julSheet ? parseSheet(wb.Sheets[julSheet]) : [];
const histRows = histSheet ? parseSheet(wb.Sheets[histSheet]) : [];

const byKey = new Map();
for (const row of histRows) {
  // Julio lo toma la hoja 01–31 (más limpia).
  if (row.date.startsWith("2026-07")) continue;
  byKey.set(`${row.date}|${row.tag}`, row);
}
for (const row of julRows) {
  byKey.set(`${row.date}|${row.tag}`, row);
}

const allRows = [...byKey.values()].sort((a, b) => a.date.localeCompare(b.date) || a.tag.localeCompare(b.tag));

/** Solo meses con datos útiles para la plataforma. */
const KEEP = new Set(["May", "Jun", "Jul"]);
const months = {};

for (const row of allRows) {
  const mk = monthKeyFromIso(row.date);
  if (!mk || !KEEP.has(mk)) continue;
  if (!months[mk]) {
    months[mk] = {
      monthKey: mk,
      year: Number(row.date.slice(0, 4)),
      days: [],
      events: [],
    };
  }
  months[mk].days.push(row);
  if (row.failures > 0 || row.ext > 0) {
    months[mk].events.push({
      date: row.date,
      tag: row.tag,
      campo: row.campo,
      fuel: row.fuel,
      ext: row.ext,
      failures: row.failures,
      op: row.op,
      sb: row.sb,
      mmtPrev: row.mmtPrev,
      mmtCorr: row.mmtCorr,
      obs: row.obs || null,
    });
  }
}

function buildUnitAggs(days) {
  const map = new Map();
  for (const d of days) {
    const cur = map.get(d.tag) ?? {
      tag: d.tag,
      campo: d.campo,
      model: d.model,
      fuel: d.fuel,
      capInstKw: d.capInstKw,
      capEntKw: d.capEntKw,
      kwh: 0,
      op: 0,
      sb: 0,
      mmtPrev: 0,
      mmtCorr: 0,
      ext: 0,
      failures: 0,
      days: 0,
      calendarHours: 0,
    };
    cur.kwh += d.kwh;
    cur.op += d.op;
    cur.sb += d.sb;
    cur.mmtPrev += d.mmtPrev;
    cur.mmtCorr += d.mmtCorr;
    cur.ext += d.ext;
    cur.failures += d.failures;
    cur.days += 1;
    cur.calendarHours += 24;
    if (d.fuel === "GAS" || d.fuel === "DIESEL") cur.fuel = d.fuel;
    map.set(d.tag, cur);
  }
  return [...map.values()]
    .map((u) => {
      const service = u.op + u.sb + u.mmtPrev + u.mmtCorr + u.ext;
      const unavailable = u.sb + u.mmtPrev + u.mmtCorr + u.ext;
      const availabilityPct =
        service > 0 ? Number(((u.op / service) * 100).toFixed(2)) : null;
      return {
        ...u,
        kwh: Math.round(u.kwh),
        op: Number(u.op.toFixed(2)),
        sb: Number(u.sb.toFixed(2)),
        mmtPrev: Number(u.mmtPrev.toFixed(2)),
        mmtCorr: Number(u.mmtCorr.toFixed(2)),
        ext: Number(u.ext.toFixed(2)),
        unavailable: Number(unavailable.toFixed(2)),
        availabilityPct,
      };
    })
    .sort((a, b) => b.kwh - a.kwh);
}

function buildTotals(units) {
  const t = {
    kwh: 0,
    op: 0,
    sb: 0,
    mmtPrev: 0,
    mmtCorr: 0,
    ext: 0,
    failures: 0,
    calendarHours: 0,
    units: units.length,
  };
  for (const u of units) {
    t.kwh += u.kwh;
    t.op += u.op;
    t.sb += u.sb;
    t.mmtPrev += u.mmtPrev;
    t.mmtCorr += u.mmtCorr;
    t.ext += u.ext;
    t.failures += u.failures;
    t.calendarHours += u.calendarHours;
  }
  const service = t.op + t.sb + t.mmtPrev + t.mmtCorr + t.ext;
  const unavailable = t.sb + t.mmtPrev + t.mmtCorr + t.ext;
  return {
    ...t,
    kwh: Math.round(t.kwh),
    op: Number(t.op.toFixed(2)),
    sb: Number(t.sb.toFixed(2)),
    mmtPrev: Number(t.mmtPrev.toFixed(2)),
    mmtCorr: Number(t.mmtCorr.toFixed(2)),
    ext: Number(t.ext.toFixed(2)),
    unavailable: Number(unavailable.toFixed(2)),
    availabilityPct: service > 0 ? Number(((t.op / service) * 100).toFixed(2)) : null,
  };
}

const packs = {};
for (const [mk, raw] of Object.entries(months)) {
  const units = buildUnitAggs(raw.days);
  const daily = raw.days.map((d) => ({
    date: d.date,
    campo: d.campo,
    tag: d.tag,
    model: d.model,
    fuel: d.fuel,
    kwh: Math.round(d.kwh),
    kwAvg: Number(d.kwAvg.toFixed(1)),
    op: Number(d.op.toFixed(2)),
    sb: Number(d.sb.toFixed(2)),
    mmtPrev: Number(d.mmtPrev.toFixed(2)),
    mmtCorr: Number(d.mmtCorr.toFixed(2)),
    ext: Number(d.ext.toFixed(2)),
    failures: d.failures,
  }));
  // Deduplicate events (date+tag)
  const evMap = new Map();
  for (const e of raw.events) {
    const k = `${e.date}|${e.tag}|${e.obs ?? ""}`;
    if (!evMap.has(k)) evMap.set(k, e);
  }
  packs[mk] = {
    monthKey: mk,
    year: raw.year,
    dayCount: new Set(raw.days.map((d) => d.date)).size,
    totals: buildTotals(units),
    units,
    daily,
    events: [...evMap.values()].sort((a, b) => a.date.localeCompare(b.date) || a.tag.localeCompare(b.tag)),
  };
}

const gen3m = ["May", "Jun", "Jul"].map((mk) => {
  const p = packs[mk];
  if (!p) return { month: mk, gasKwh: 0, dieselKwh: 0 };
  let gas = 0;
  let diesel = 0;
  for (const u of p.units) {
    if (u.fuel === "DIESEL") diesel += u.kwh;
    else gas += u.kwh;
  }
  return { month: mk, gasKwh: Math.round(gas), dieselKwh: Math.round(diesel) };
});

const payload = {
  sourceFile: path.relative(ROOT, XLSX_PATH).replace(/\\/g, "/"),
  extractedAt: new Date().toISOString().slice(0, 10),
  notes:
    "Horas concertadas GTE. Julio desde hoja 01–31; May–Jun desde hoja parcial 12–28. Disponibilidad = (calendario − SB − MMT − externas) / calendario.",
  months: packs,
  generation3m: gen3m,
};

const body = `/** Generado por scripts/etl-concertacion.mjs — no editar a mano. */
export type ConcertacionFuel = "GAS" | "DIESEL" | string;

export type ConcertacionDailyRow = {
  date: string;
  campo: string;
  tag: string;
  model: string;
  fuel: ConcertacionFuel;
  kwh: number;
  kwAvg: number;
  op: number;
  sb: number;
  mmtPrev: number;
  mmtCorr: number;
  ext: number;
  failures: number;
};

export type ConcertacionUnitAgg = {
  tag: string;
  campo: string;
  model: string;
  fuel: ConcertacionFuel;
  capInstKw: number;
  capEntKw: number;
  kwh: number;
  op: number;
  sb: number;
  mmtPrev: number;
  mmtCorr: number;
  ext: number;
  failures: number;
  days: number;
  calendarHours: number;
  unavailable: number;
  availabilityPct: number | null;
};

export type ConcertacionEvent = {
  date: string;
  tag: string;
  campo: string;
  fuel: ConcertacionFuel;
  ext: number;
  failures: number;
  op: number;
  sb: number;
  mmtPrev: number;
  mmtCorr: number;
  obs: string | null;
};

export type ConcertacionMonthPack = {
  monthKey: string;
  year: number;
  dayCount: number;
  totals: {
    kwh: number;
    op: number;
    sb: number;
    mmtPrev: number;
    mmtCorr: number;
    ext: number;
    failures: number;
    calendarHours: number;
    units: number;
    unavailable: number;
    availabilityPct: number | null;
  };
  units: ConcertacionUnitAgg[];
  daily: ConcertacionDailyRow[];
  events: ConcertacionEvent[];
};

export type ConcertacionPack = {
  sourceFile: string;
  extractedAt: string;
  notes: string;
  months: Record<string, ConcertacionMonthPack>;
  generation3m: { month: string; gasKwh: number; dieselKwh: number }[];
};

export const CONCERTACION_HOURS: ConcertacionPack = ${JSON.stringify(payload, null, 2)};

export function getConcertacionMonth(monthKey: string): ConcertacionMonthPack | null {
  return CONCERTACION_HOURS.months[monthKey] ?? null;
}
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, body);
const jul = packs.Jul;
console.log(
  `OK → ${path.relative(ROOT, OUT)} · meses ${Object.keys(packs).join(",")} · Jul días ${jul?.dayCount} · kWh ${jul?.totals.kwh} · fallas ${jul?.totals.failures}`,
);
