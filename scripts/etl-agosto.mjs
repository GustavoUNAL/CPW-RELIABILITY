/**
 * ETL agosto 2026: concertación 01–23 → copowerMonthly + concertacionHoursData.
 *
 * Fuente: data/Agosto/Concertación de horas/Consolidado de Horas concertadas del 01 al 23 de Agosto.xlsx
 * Uso: node scripts/etl-agosto.mjs
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const ROOT = path.resolve(import.meta.dirname, "..");
const AGOSTO_DIR = path.join(ROOT, "data", "Agosto");
const concFolder = fs.readdirSync(AGOSTO_DIR).find((d) => /concert/i.test(d));
if (!concFolder) {
  console.error("No se encontró carpeta de concertación en data/Agosto");
  process.exit(1);
}
const xlsxName = fs
  .readdirSync(path.join(AGOSTO_DIR, concFolder))
  .find((f) => f.endsWith(".xlsx") && !f.startsWith("~$"));
if (!xlsxName) {
  console.error("No se encontró Excel de concertación de agosto");
  process.exit(1);
}
const XLSX_PATH = path.join(AGOSTO_DIR, concFolder, xlsxName);
const REL_SOURCE = path.relative(ROOT, XLSX_PATH).replace(/\\/g, "/");
const OUT_JSON = path.join(ROOT, "scripts/_extracted_agosto_copower.json");
const MONTHLY = path.join(ROOT, "src/domain/reliability/reports/copowerMonthly.ts");
const CONC = path.join(ROOT, "src/domain/reliability/reports/concertacionHoursData.ts");

const DIESEL = new Set(["G101V", "G102J", "G102K", "G102A", "G102E", "G102I"]);
const YM = "2026-08";

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

const wb = XLSX.readFile(XLSX_PATH, { cellDates: true });
const sheetName = wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: null, raw: true });

const byEq = new Map();
const events = [];
const daily = [];

for (const r of rows) {
  const date = isoDate(pick(r, "Fecha"));
  if (!date || !date.startsWith(YM)) continue;
  const rawTag = str(pick(r, "TAG de la unidad"));
  if (!rawTag) continue;
  const tag = normTag(rawTag);
  const campo = str(pick(r, "Campo")).toUpperCase() || "COSTAYACO";
  const fuelRaw = str(pick(r, "Tipo de combustible Primario")).toUpperCase();
  const fuel = fuelRaw.includes("DIESEL") ? "DIESEL" : fuelRaw.includes("GAS") ? "GAS" : fuelRaw || "N/D";
  const kwh = num(pick(r, "KWH generados"));
  const op = num(pick(r, "Horas Operacion ", "Horas Operacion"));
  const sb = num(pick(r, "Horas StandBy"));
  const pp = num(pick(r, "Horas MMT Preventivo"));
  const corr = num(pick(r, "Horas MMT Correctivo"));
  const ext = num(pick(r, "Horas Paradas Externas"));
  const fail = num(pick(r, "Numero de fallas"));
  const obs = str(pick(r, "Observaciones"));
  const cal = num(pick(r, "total horas")) || 24;
  const model = str(pick(r, "Unidad"));
  const kwAvg = num(pick(r, "Potencia promedio"));

  const prev = byEq.get(tag) ?? {
    equipo: tag,
    rawTag,
    campo,
    fuel,
    model,
    capInstKw: num(pick(r, "capacidad instalada")),
    capEntKw: num(pick(r, "Capacidad Entregada (kW)")),
    energiaKwh: 0,
    horasOperacion: 0,
    horasStandBy: 0,
    horasPP: 0,
    horasPFContr: 0,
    horasPFCli: 0,
    horasCalDia: 0,
    fallaEvento: 0,
    days: 0,
  };
  prev.energiaKwh += kwh;
  prev.horasOperacion += op;
  prev.horasStandBy += sb;
  prev.horasPP += pp;
  prev.horasPFContr += corr;
  prev.horasPFCli += ext;
  prev.horasCalDia += cal;
  prev.fallaEvento += fail;
  prev.days += 1;
  if (fuel === "GAS" || fuel === "DIESEL") prev.fuel = fuel;
  byEq.set(tag, prev);

  daily.push({
    date,
    campo,
    tag: rawTag || tag,
    model,
    fuel,
    kwh,
    kwAvg,
    op,
    sb,
    mmtPrev: pp,
    mmtCorr: corr,
    ext,
    failures: fail,
    obs,
  });

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
  const disp =
    u.horasCalDia > 0
      ? Number((((u.horasOperacion + u.horasStandBy) / u.horasCalDia) * 100).toFixed(2))
      : null;
  const fallas = u.fallaEvento;
  const mtbf = fallas > 0 ? (u.horasOperacion / fallas).toFixed(2) : "Sin Fallas";
  const mttr =
    fallas > 0 && u.horasPFContr > 0 ? Number((u.horasPFContr / fallas).toFixed(2)) : fallas > 0 ? 0 : null;
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
    detalle: `Horas concertadas GTE 01–22 ago · OP ${r1(u.horasOperacion)} h · ext ${r1(u.horasPFCli)} h · fallas ${fallas}`,
  };
});

const eventLog = events.sort((a, b) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : a.equipment.localeCompare(b.equipment),
);

const snap = {
  label: "Agosto 2026 (01–22)",
  sourceFile: REL_SOURCE,
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
  consumos: units.map((u) => ({
    unidad: u.equipo,
    campo: u.campo,
    adicionAceite: 0,
    cambioAceite: 0,
    adicionCoolant: 0,
  })),
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
src = src.replace(
  /export type CopowerMonthKey = "[^"]+"(?: \| "[^"]+")*;/,
  'export type CopowerMonthKey = "Ene" | "Feb" | "Mar" | "Abr" | "May" | "Jun" | "Jul" | "Ago";',
);
src = src.replace(
  /export const COPOWER_MONTH_ORDER: CopowerMonthKey\[\] = \[[^\]]+\];/,
  'export const COPOWER_MONTH_ORDER: CopowerMonthKey[] = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago"];',
);
if (!/Ago: "Agosto"/.test(src)) {
  src = src.replace(/Jul: "Julio",\n};/, 'Jul: "Julio",\n  Ago: "Agosto",\n};');
}

const agoBlock = `  "Ago": ${JSON.stringify(snap, null, 4).replace(/^/gm, "  ").trimStart()}\n`;
const existingAgo = src.indexOf('  "Ago": {');
const endMarker = src.indexOf("\n};\n\nexport const COPOWER_KPI_FROM_MONTHS");
if (endMarker < 0) {
  console.error("No se encontró el cierre de COPOWER_MONTHLY_DATA");
  process.exit(1);
}
if (existingAgo >= 0) {
  src = src.slice(0, existingAgo) + agoBlock + src.slice(endMarker);
} else {
  const julEnd = src.lastIndexOf("\n  }", endMarker);
  src = `${src.slice(0, julEnd + 4)},\n\n${agoBlock}${src.slice(endMarker)}`;
}
fs.writeFileSync(MONTHLY, src);

function buildUnitAggs(days) {
  const map = new Map();
  for (const d of days) {
    const cur = map.get(d.tag) ?? {
      tag: d.tag,
      campo: d.campo,
      model: d.model,
      fuel: d.fuel,
      capInstKw: 0,
      capEntKw: 0,
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
    const u = byEq.get(normTag(d.tag));
    if (u) {
      cur.capInstKw = u.capInstKw;
      cur.capEntKw = u.capEntKw;
    }
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
      const unavailable = u.sb + u.mmtPrev + u.mmtCorr + u.ext;
      const service = u.op + unavailable;
      return {
        ...u,
        kwh: Math.round(u.kwh),
        op: Number(u.op.toFixed(2)),
        sb: Number(u.sb.toFixed(2)),
        mmtPrev: Number(u.mmtPrev.toFixed(2)),
        mmtCorr: Number(u.mmtCorr.toFixed(2)),
        ext: Number(u.ext.toFixed(2)),
        unavailable: Number(unavailable.toFixed(2)),
        availabilityPct: service > 0 ? Number(((u.op / service) * 100).toFixed(2)) : null,
      };
    })
    .sort((a, b) => b.kwh - a.kwh);
}

function buildTotals(unitRows) {
  const t = {
    kwh: 0,
    op: 0,
    sb: 0,
    mmtPrev: 0,
    mmtCorr: 0,
    ext: 0,
    failures: 0,
    calendarHours: 0,
    units: unitRows.length,
    unavailable: 0,
    availabilityPct: null,
  };
  for (const u of unitRows) {
    t.kwh += u.kwh;
    t.op += u.op;
    t.sb += u.sb;
    t.mmtPrev += u.mmtPrev;
    t.mmtCorr += u.mmtCorr;
    t.ext += u.ext;
    t.failures += u.failures;
    t.calendarHours += u.calendarHours;
    t.unavailable += u.unavailable;
  }
  t.availabilityPct =
    t.op + t.unavailable > 0 ? Number(((t.op / (t.op + t.unavailable)) * 100).toFixed(2)) : null;
  return t;
}

const concUnits = buildUnitAggs(daily);
const agoPack = {
  monthKey: "Ago",
  year: 2026,
  dayCount: new Set(daily.map((d) => d.date)).size,
  totals: buildTotals(concUnits),
  units: concUnits,
  daily: daily.map((d) => ({
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
  })),
  events: daily
    .filter((d) => d.failures > 0 || d.ext > 0)
    .map((d) => ({
      date: d.date,
      tag: d.tag,
      campo: d.campo,
      fuel: d.fuel,
      ext: Number(d.ext.toFixed(2)),
      failures: d.failures,
      op: Number(d.op.toFixed(2)),
      sb: Number(d.sb.toFixed(2)),
      mmtPrev: Number(d.mmtPrev.toFixed(2)),
      mmtCorr: Number(d.mmtCorr.toFixed(2)),
      obs: d.obs || null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.tag.localeCompare(b.tag)),
};

let concSrc = fs.readFileSync(CONC, "utf8");
const jsonStart = concSrc.indexOf("export const CONCERTACION_HOURS: ConcertacionPack = ");
const jsonAssign = concSrc.indexOf("{", jsonStart);
const jsonEnd = concSrc.lastIndexOf("\n};");
if (jsonStart < 0 || jsonAssign < 0 || jsonEnd < 0) {
  console.error("No se pudo localizar CONCERTACION_HOURS");
  process.exit(1);
}
const pack = JSON.parse(concSrc.slice(jsonAssign, jsonEnd + 2));
pack.sourceFile = `${pack.sourceFile} · ${REL_SOURCE}`;
pack.extractedAt = new Date().toISOString().slice(0, 10);
pack.notes =
  "Horas concertadas GTE. May–Jul desde archivo de julio; agosto 01–23 desde data/Agosto. Ventana parcial (no cierra el mes).";
pack.months.Ago = agoPack;
const agoGen = {
  month: "Ago",
  gasKwh: Math.round(concUnits.filter((u) => u.fuel !== "DIESEL").reduce((s, u) => s + u.kwh, 0)),
  dieselKwh: Math.round(concUnits.filter((u) => u.fuel === "DIESEL").reduce((s, u) => s + u.kwh, 0)),
};
pack.generation3m = [...(pack.generation3m ?? []).filter((r) => r.month !== "Ago"), agoGen];
const header = concSrc.slice(0, jsonAssign);
const footer = concSrc.slice(jsonEnd + 2);
fs.writeFileSync(CONC, `${header}${JSON.stringify(pack, null, 2)}${footer}`);

console.log("sheet", sheetName);
console.log("días", agoPack.dayCount, "unidades", units.length);
console.log("kWh", snap.totalGenerationKwh, "OP", hoursOperated, "SB", hoursStandby, "PP", hoursPreventive, "ext", hoursFailureClient);
console.log("fallas", copowerFailures, "eventos", eventLog.length, "disp", snap.kpi.availability);
console.log("fail events:");
for (const e of eventLog.filter((x) => x.eventType === "Falla")) {
  console.log(" ", e.date, e.equipment, e.cause.slice(0, 120));
}
console.log("updated", MONTHLY);
console.log("updated", CONC);
