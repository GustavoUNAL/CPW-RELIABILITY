/**
 * ETL: Horas concertadas agosto 2026 (01–22) → snapshot COPOWER.
 * Fuente: data/Agosto/Consolidado de Horas concertadas del 01 al 23 de Agosto.xlsx
 * El archivo se titula 01–23 pero las filas llegan al 22 (22 días × 15 unidades).
 *
 * Uso: node scripts/etl-copower-agosto-concertacion.mjs
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const ROOT = path.resolve(import.meta.dirname, "..");
const XLSX_PATH = path.join(
  ROOT,
  "data/Agosto/Consolidado de Horas concertadas del 01 al 23 de Agosto.xlsx",
);
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
  const map = {
    "CPW-10": "JIN-10",
    "CPW-11": "JIN-11",
    "CPW-12": "JIN-12",
    CPW10: "JIN-10",
    CPW11: "JIN-11",
    CPW12: "JIN-12",
  };
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
  if (fallas >= 1) return "RIESGO MEDIO";
  if (disp != null && disp < 95) return "RIESGO ALTO";
  if (disp != null && disp < 98) return "RIESGO MEDIO";
  return "RIESGO BAJO";
}

if (!fs.existsSync(XLSX_PATH)) {
  console.error("No se encontró:", XLSX_PATH);
  process.exit(1);
}

const wb = XLSX.readFile(XLSX_PATH, { cellDates: true });
const sheetName = wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: null, raw: true });

const byEq = new Map();
const events = [];

for (const r of rows) {
  const date = isoDate(pick(r, "Fecha"));
  if (!date || !date.startsWith("2026-08")) continue;
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
      cause:
        obs ||
        (isFalla
          ? "Falla registrada en horas concertadas"
          : ext > 0
            ? "Parada externa (horas concertadas)"
            : "Evento concertado"),
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

const energyGasKwh = r1(
  gasCyc.reduce((s, u) => s + u.energiaKwh, 0) + vonu.reduce((s, u) => s + u.energiaKwh, 0),
);
const energyDieselKwh = r1(dieselCyc.reduce((s, u) => s + u.energiaKwh, 0));
const hoursOperated = r1(units.reduce((s, u) => s + u.horasOperacion, 0));
const hoursStandby = r1(units.reduce((s, u) => s + u.horasStandBy, 0));
const hoursPreventive = r1(units.reduce((s, u) => s + u.horasPP, 0));
const hoursFailureCopower = r1(units.reduce((s, u) => s + u.horasPFContr, 0));
const hoursFailureClient = r1(units.reduce((s, u) => s + u.horasPFCli, 0));
const copowerFailures = units.reduce((s, u) => s + u.fallaEvento, 0);
const calAll = units.reduce((s, u) => s + u.horasCalDia, 0);
const availFleet = calAll > 0 ? (hoursOperated + hoursStandby) / calAll : null;
const reliabilityFleet = copowerFailures === 0 && hoursFailureCopower === 0 ? 1 : availFleet;

const machineIndicators = units.map((u) => {
  const disp =
    u.horasCalDia > 0
      ? Number((((u.horasOperacion + u.horasStandBy) / u.horasCalDia) * 100).toFixed(2))
      : null;
  const fallas = u.fallaEvento;
  const conf = fallas === 0 ? 100 : disp;
  const mtbf = fallas > 0 ? (u.horasOperacion / fallas).toFixed(2) : "Sin Fallas";
  const mttr =
    fallas > 0 && u.horasPFContr > 0 ? Number((u.horasPFContr / fallas).toFixed(2)) : fallas > 0 ? 0 : null;
  return {
    unidad: u.equipo,
    campo: u.campo,
    horasStandBy: r1(u.horasStandBy),
    disponibilidadPct: disp,
    confiabilidadPct: conf,
    fallas,
    mtbfLabel: String(mtbf),
    mttrHours: mttr,
    riesgoTecnico: risk(fallas, disp),
    cumplimiento: disp == null ? "N/A" : disp >= 98 ? "CUMPLE" : "NO CUMPLE",
    detalle: `Horas concertadas GTE 01–22 ago · OP ${r1(u.horasOperacion)} h · ext ${r1(u.horasPFCli)} h · fallas ${fallas}`,
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
  label: "Agosto 2026 · corte 01–22",
  sourceFile: "data/Agosto/Consolidado de Horas concertadas del 01 al 23 de Agosto.xlsx",
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
    reliability: reliabilityFleet != null ? Number(reliabilityFleet.toFixed(6)) : null,
    maintainability: null,
    generationMwh: Number((units.reduce((s, u) => s + u.energiaKwh, 0) / 1000).toFixed(3)),
    operationalLossesMwh: null,
    contractualCompliance: null,
  },
};

let src = fs.readFileSync(MONTHLY, "utf8");
src = src.replace(
  /export type CopowerMonthKey = "[^"]+"(?: \| "[^"]+")*;/,
  'export type CopowerMonthKey = "Ene" | "Feb" | "Mar" | "Abr" | "May" | "Jun" | "Jul" | "Ago";',
);
src = src.replace(
  /export const COPOWER_MONTH_ORDER: CopowerMonthKey\[\] = \[[^\]]+\];/,
  'export const COPOWER_MONTH_ORDER: CopowerMonthKey[] = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago"];',
);
if (!src.includes('Ago: "Agosto"')) {
  src = src.replace('  Jul: "Julio",\n};', '  Jul: "Julio",\n  Ago: "Agosto",\n};');
}

const agoPretty = JSON.stringify(snap, null, 4).replace(/^/gm, "  ").trimStart();
const agoBlock = `  "Ago": ${agoPretty}`;

if (src.includes('  "Ago": {')) {
  const start = src.indexOf('  "Ago": {');
  const end = src.indexOf("\n};\n\nexport const COPOWER_KPI_FROM_MONTHS");
  if (start < 0 || end < 0) {
    console.error("No se encontró bloque Ago en copowerMonthly.ts");
    process.exit(1);
  }
  src = `${src.slice(0, start)}${agoBlock}\n${src.slice(end)}`;
} else {
  src = src.replace(
    /\n\};\n\nexport const COPOWER_KPI_FROM_MONTHS/,
    `,\n${agoBlock}\n};\n\nexport const COPOWER_KPI_FROM_MONTHS`,
  );
}

fs.writeFileSync(MONTHLY, src);

const dates = [...new Set(rows.map((r) => isoDate(pick(r, "Fecha"))).filter(Boolean))].sort();
console.log("sheet", sheetName);
console.log("days", dates[0], "→", dates.at(-1), `(${dates.length})`);
console.log("units", units.map((u) => `${u.equipo}:${u.fallaEvento}f`).join(" "));
console.log(
  "kWh",
  snap.totalGenerationKwh,
  "OP",
  hoursOperated,
  "SB",
  hoursStandby,
  "PP",
  hoursPreventive,
  "ext",
  hoursFailureClient,
);
console.log("fallas", copowerFailures, "eventos", eventLog.length);
console.log("kpi avail", snap.kpi.availability, "conf", snap.kpi.reliability, "gen MWh", snap.kpi.generationMwh);
console.log("updated", MONTHLY);
