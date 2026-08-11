/**
 * ETL: Horas concertadas julio 2026 → snapshot COPOWER (eventos + indicadores).
 * Fuente: data/Julio/Horas concertadas con GTE (del 01 al 31 julio 2026).xlsx
 *
 * Uso: node scripts/etl-copower-julio-concertacion.mjs
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const ROOT = path.resolve(import.meta.dirname, "..");
const XLSX_PATH = path.join(
  ROOT,
  "data/Julio/Horas concertadas con GTE (del 01 al 31 julio 2026).xlsx",
);
const OUT_JSON = path.join(ROOT, "scripts/_extracted_julio_copower.json");
const MONTHLY = path.join(ROOT, "src/domain/reliability/reports/copowerMonthly.ts");

const DIESEL = new Set(["G101V", "G102J", "G102K", "G102A", "G102E", "G102I"]);

function num(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}
function str(v) {
  return v == null ? "" : String(v).replace(/\s+/g, " ").trim();
}
function isoDate(v) {
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
function normTag(tag) {
  const t = str(tag).toUpperCase().replace(/\s+/g, "");
  const map = { "CPW-10": "JIN-10", "CPW-11": "JIN-11", "CPW-12": "JIN-12", CPW10: "JIN-10", CPW11: "JIN-11", CPW12: "JIN-12" };
  if (map[t]) return map[t];
  const cpw = t.match(/^CPW-?0*(\d+)$/);
  if (cpw) return `CPW${cpw[1].padStart(2, "0")}`;
  const jin = t.match(/^JIN-?0*(\d+)$/);
  if (jin) return `JIN-${jin[1].padStart(2, "0")}`;
  return t;
}
function pick(r, ...names) {
  for (const n of names) {
    if (r[n] != null && r[n] !== "") return r[n];
  }
  const keys = Object.keys(r);
  for (const n of names) {
    const hit = keys.find((k) => k.trim().toLowerCase() === n.trim().toLowerCase());
    if (hit && r[hit] != null && r[hit] !== "") return r[hit];
  }
  return null;
}
function risk(fallas, disp) {
  if (fallas >= 2) return "RIESGO MEDIO";
  if (fallas === 1) return "RIESGO MEDIO";
  if (disp != null && disp < 95) return "RIESGO ALTO";
  if (disp != null && disp < 98) return "RIESGO MEDIO";
  return "RIESGO BAJO";
}

const wb = XLSX.readFile(XLSX_PATH, { cellDates: true });
const sheetName =
  wb.SheetNames.find((n) => /01\s*AL\s*31/i.test(n) && /JULIO/i.test(n)) ??
  wb.SheetNames.find((n) => /CONCERTACION 01/i.test(n));
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: null, raw: true });

const byEq = new Map();
const events = [];

for (const r of rows) {
  const date = isoDate(pick(r, "Fecha"));
  if (!date || !date.startsWith("2026-07")) continue;
  const tag = normTag(pick(r, "TAG de la unidad"));
  if (!tag) continue;
  const campo = str(pick(r, "Campo")).toUpperCase() || "COSTAYACO";
  const fuel = str(pick(r, "Tipo de combustible Primario")).toUpperCase();
  const kwh = num(pick(r, "KWH generados"));
  const op = num(pick(r, "Horas Operacion ", "Horas Operacion"));
  const sb = num(pick(r, "Horas StandBy"));
  const pp = num(pick(r, "Horas MMT Preventivo"));
  const corr = num(pick(r, "Horas MMT Correctivo"));
  const ext = num(pick(r, "Horas Paradas Externas"));
  const fail = num(pick(r, "Numero de fallas"));
  const obs = str(pick(r, "Observaciones"));
  const cal = num(pick(r, "total horas")) || 24;

  const prev = byEq.get(tag) ?? {
    equipo: tag,
    campo,
    fuel,
    energiaKwh: 0,
    horasOperacion: 0,
    horasStandBy: 0,
    horasPP: 0,
    horasPFContr: 0,
    horasPFCli: 0,
    horasCalDia: 0,
    fallaEvento: 0,
  };
  prev.energiaKwh += kwh;
  prev.horasOperacion += op;
  prev.horasStandBy += sb;
  prev.horasPP += pp;
  prev.horasPFContr += corr;
  prev.horasPFCli += ext;
  prev.horasCalDia += cal;
  prev.fallaEvento += fail;
  byEq.set(tag, prev);

  if (fail > 0 || ext > 0 || corr > 0 || (obs && obs.length > 12)) {
    const isFalla = fail > 0;
    events.push({
      date,
      equipment: tag,
      eventType: isFalla ? "Falla" : "Operativo",
      cause: obs || (isFalla ? "Falla registrada en horas concertadas" : ext > 0 ? "Parada externa (horas concertadas)" : "Evento concertado"),
      downtimeHours: Number((ext + corr).toFixed(2)),
      responsible: isFalla ? "COPOWER" : ext > 0 ? "GTE" : "COPOWER",
      notes: `PP ${pp} h | SB ${sb} h | PF_contr ${corr} h | PF_cli ${ext} h | Falla_evento ${fail}`,
    });
  }
}

const units = [...byEq.values()].sort((a, b) => a.equipo.localeCompare(b.equipo));
const r1 = (n) => Number(n.toFixed(3));

const generationByEquipment = units.map((u) => ({
  equipo: u.equipo,
  campo: u.campo,
  energiaKwh: r1(u.energiaKwh),
  horasOperacion: r1(u.horasOperacion),
  horasStandBy: r1(u.horasStandBy),
  horasPP: r1(u.horasPP),
  horasPFContr: r1(u.horasPFContr),
  horasPFCli: r1(u.horasPFCli),
  horasCalDia: r1(u.horasCalDia),
  fallaEvento: u.fallaEvento,
}));

const cyc = units.filter((u) => u.campo === "COSTAYACO");
const vonu = units.filter((u) => u.campo === "VONU");
const gasCyc = cyc.filter((u) => !DIESEL.has(u.equipo) && !/DIESEL/.test(u.fuel));
const dieselCyc = cyc.filter((u) => DIESEL.has(u.equipo) || /DIESEL/.test(u.fuel));

const energyGasKwh = r1(gasCyc.reduce((s, u) => s + u.energiaKwh, 0) + vonu.reduce((s, u) => s + u.energiaKwh, 0));
const energyDieselKwh = r1(dieselCyc.reduce((s, u) => s + u.energiaKwh, 0));
const hoursOperated = r1(units.reduce((s, u) => s + u.horasOperacion, 0));
const hoursStandby = r1(units.reduce((s, u) => s + u.horasStandBy, 0));
const hoursPreventive = r1(units.reduce((s, u) => s + u.horasPP, 0));
const hoursFailureCopower = r1(units.reduce((s, u) => s + u.horasPFContr, 0));
const hoursFailureClient = r1(units.reduce((s, u) => s + u.horasPFCli, 0));
const copowerFailures = units.reduce((s, u) => s + u.fallaEvento, 0);
const calAll = units.reduce((s, u) => s + u.horasCalDia, 0);
const availFleet = calAll > 0 ? (hoursOperated + hoursStandby) / calAll : null;

const machineIndicators = units.map((u) => {
  const disp = u.horasCalDia > 0 ? Number((((u.horasOperacion + u.horasStandBy) / u.horasCalDia) * 100).toFixed(2)) : null;
  const fallas = u.fallaEvento;
  const mtbf = fallas > 0 ? (u.horasOperacion / fallas).toFixed(2) : "Sin Fallas";
  const mttr = fallas > 0 && u.horasPFContr > 0 ? Number((u.horasPFContr / fallas).toFixed(2)) : fallas > 0 ? 0 : null;
  return {
    unidad: u.equipo,
    campo: u.campo,
    horasStandBy: r1(u.horasStandBy),
    disponibilidadPct: disp,
    confiabilidadPct: disp,
    fallas,
    mtbfLabel: String(mtbf),
    mttrHours: mttr,
    riesgoTecnico: risk(fallas, disp),
    cumplimiento: "N/A",
    detalle: `Horas concertadas GTE 01–31 jul · OP ${r1(u.horasOperacion)} h · ext ${r1(u.horasPFCli)} h · fallas ${fallas}`,
  };
});

const eventLog = events.sort((a, b) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : a.equipment.localeCompare(b.equipment),
);

const consumos = units.map((u) => ({
  unidad: u.equipo,
  campo: u.campo,
  adicionAceite: 0,
  cambioAceite: 0,
  adicionCoolant: 0,
}));

const snap = {
  label: "Julio 2026",
  sourceFile: "data/Julio/Horas concertadas con GTE (del 01 al 31 julio 2026).xlsx",
  summary: {
    copowerFailures,
    totalEvents: eventLog.length,
    mtbfHours: copowerFailures > 0 ? Number((hoursOperated / copowerFailures).toFixed(2)) : null,
    mttrHours: copowerFailures > 0 ? Number((hoursFailureCopower / copowerFailures).toFixed(2)) : 0,
    actionsOverdue: null,
    rcaPending: null,
    hoursOperated,
    hoursStandby,
    hoursPreventive,
    hoursCorrective: hoursFailureCopower,
    hoursFailureCopower,
    hoursFailureClient,
    energyGasKwh,
    energyDieselKwh,
  },
  generationByAsset: [
    {
      asset: "Costayaco",
      gasKwh: r1(gasCyc.reduce((s, u) => s + u.energiaKwh, 0)),
      dieselKwh: energyDieselKwh,
    },
    { asset: "Vonu", gasKwh: r1(vonu.reduce((s, u) => s + u.energiaKwh, 0)), dieselKwh: 0 },
  ],
  generationByEquipment,
  totalGenerationKwh: r1(units.reduce((s, u) => s + u.energiaKwh, 0)),
  machineIndicators,
  eventLog,
  consumos,
  kpi: {
    availability: availFleet != null ? Number(availFleet.toFixed(6)) : null,
    reliability: availFleet != null ? Number(availFleet.toFixed(6)) : null,
    maintainability: null,
    generationMwh: Number((units.reduce((s, u) => s + u.energiaKwh, 0) / 1000).toFixed(3)),
    operationalLossesMwh: null,
    contractualCompliance: null,
  },
};

fs.writeFileSync(OUT_JSON, JSON.stringify(snap, null, 2));

let src = fs.readFileSync(MONTHLY, "utf8");
const start = src.indexOf('  "Jul": {');
const end = src.indexOf("\n};\n\nexport const COPOWER_KPI_FROM_MONTHS");
if (start < 0 || end < 0) {
  console.error("No se encontró bloque Jul en copowerMonthly.ts");
  process.exit(1);
}
const julBlock = `  "Jul": ${JSON.stringify(snap, null, 4).replace(/^/gm, "  ").trimStart()}\n`;
src = src.slice(0, start) + julBlock + src.slice(end);
fs.writeFileSync(MONTHLY, src);

console.log("sheet", sheetName);
console.log("units", units.map((u) => `${u.equipo}:${u.fallaEvento}f`).join(" "));
console.log("kWh", snap.totalGenerationKwh, "OP", hoursOperated, "SB", hoursStandby, "PP", hoursPreventive, "ext", hoursFailureClient);
console.log("fallas", copowerFailures, "eventos", eventLog.length, "MTBF", snap.summary.mtbfHours);
console.log("kpi avail", snap.kpi.availability, "gen MWh", snap.kpi.generationMwh);
console.log("fail events:");
for (const e of eventLog.filter((x) => x.eventType === "Falla")) {
  console.log(" ", e.date, e.equipment, e.cause.slice(0, 100));
}
console.log("updated", MONTHLY);
