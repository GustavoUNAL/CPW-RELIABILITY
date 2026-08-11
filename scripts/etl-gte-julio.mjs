/**
 * ETL: Data Soporte + PDF Análisis Indicadores GTE julio 2026
 * → snapshot listo para granTierraMonthly.ts
 *
 * Uso: node scripts/etl-gte-julio.mjs
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "data", "Julio", "GTE");
const OUT = path.join(ROOT, "scripts", "_extracted_julio_gte.json");

const XLSX_NAME = fs
  .readdirSync(DIR)
  .find((f) => /Data Soporte/i.test(f) && f.endsWith(".xlsx") && !f.startsWith("~$"));
if (!XLSX_NAME) {
  console.error("No se encontró Data Soporte julio");
  process.exit(1);
}

const DIESEL = new Set(["G101V", "G102J", "G102K", "G102A", "G102E", "G102I", "G102L"]);
const GAS_N = new Set([
  "CPW01",
  "CPW02",
  "CPW03",
  "CPW04",
  "CPW05",
  "CPW06",
  "CPW07",
  "JIN-10",
  "JIN-11",
  "JIN-12",
]);

/** Dashboard oficial PDF Análisis Indicadores Copower PUTN JUL 2026, anexo p.5 */
const PDF_DASHBOARD = {
  CPW01: { campo: "COSTAYACO", energiaKwhPdf: 435240, horasStandBy: 39, disponibilidadPct: 94.49, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO ALTO", cumplimiento: "NO CUMPLE", detalle: "Cambio controles AGC4 registrado en sábana julio como M10 (13–14 jul, con CPW03). Sin eventos correctivos. Meta Costayaco gas ≥98%." },
  CPW02: { campo: "COSTAYACO", energiaKwhPdf: 397129, horasStandBy: 96, disponibilidadPct: 94.22, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO ALTO", cumplimiento: "NO CUMPLE", detalle: "Sábana julio: descarbonización 10–11 jul (48 h). PDF GTE atribuye AGC4; no figura como M10 en la sábana del mes. Meta Costayaco gas ≥98%." },
  CPW03: { campo: "COSTAYACO", energiaKwhPdf: 409861, horasStandBy: 46, disponibilidadPct: 91.94, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO ALTO", cumplimiento: "NO CUMPLE", detalle: "Cambio controles AGC4 registrado en sábana julio como M10 (13–14 jul). Menor disponibilidad individual del mes (91.94%). Meta ≥98%." },
  CPW04: { campo: "COSTAYACO", energiaKwhPdf: 438156, horasStandBy: 152, disponibilidadPct: 97.58, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE", detalle: "Sin eventos correctivos. Disponibilidad 97.58% (bajo meta 98% individual Costayaco gas; anexo marca CUMPLE)." },
  CPW05: { campo: "COSTAYACO", energiaKwhPdf: 431557, horasStandBy: 200, disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE", detalle: "Sin eventos correctivos. Disponibilidad y confiabilidad plenas." },
  CPW06: { campo: "COSTAYACO", energiaKwhPdf: 457101, horasStandBy: 190, disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE", detalle: "Recupera vs. junio (entonces RIESGO MEDIO, 2 fallas). Sin eventos correctivos." },
  CPW07: { campo: "COSTAYACO", energiaKwhPdf: 439734, horasStandBy: 58, disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE", detalle: "Sin eventos correctivos. Disponibilidad y confiabilidad plenas." },
  "JIN-10": { campo: "COSTAYACO", energiaKwhPdf: 224679, horasStandBy: 167, disponibilidadPct: 99.19, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE", detalle: "Incorporada al consolidado Sistema CPW. Sin eventos correctivos." },
  "JIN-11": { campo: "COSTAYACO", energiaKwhPdf: 132155, horasStandBy: 382, disponibilidadPct: 97.85, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE", detalle: "Entra al consolidado energético Sistema CPW (antes en estabilización). Sin eventos correctivos." },
  "JIN-12": { campo: "COSTAYACO", energiaKwhPdf: 150342, horasStandBy: 338, disponibilidadPct: 98.66, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE", detalle: "Entra al consolidado energético Sistema CPW (antes en estabilización). Sin eventos correctivos." },
  G101V: { campo: "COSTAYACO", energiaKwhPdf: null, horasStandBy: 703, disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE", detalle: "Diésel de respaldo. Energía del PDF anexo duplica JIN-11; se usa Data Soporte." },
  G102J: { campo: "COSTAYACO", energiaKwhPdf: null, horasStandBy: 640, disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE", detalle: "Diésel de respaldo. Energía del PDF anexo duplica JIN-12; se usa Data Soporte." },
  G102K: { campo: "COSTAYACO", energiaKwhPdf: 14043, horasStandBy: 683, disponibilidadPct: 99.19, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE", detalle: "Diésel de respaldo. Sin eventos correctivos." },
  "JIN-01": { campo: "VONU", energiaKwhPdf: 78853, horasStandBy: 0, disponibilidadPct: 98.25, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE", detalle: "Sin eventos correctivos (2.º mes). Meta Vonú ≥90%." },
  "JIN-02": { campo: "VONU", energiaKwhPdf: 40185, horasStandBy: 0, disponibilidadPct: 97.18, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE", detalle: "Sin eventos correctivos (2.º mes). Meta Vonú ≥90%." },
};

const SISTEMA = [
  {
    unidad: "SISTEMA N",
    campo: "COSTAYACO",
    horasStandBy: 948,
    disponibilidadPct: 80.65,
    confiabilidadPct: 100,
    fallas: 0,
    mtbfLabel: "Sin Fallas",
    mttrHours: 0,
    riesgoTecnico: "RIESGO ALTO",
    cumplimiento: "NO CUMPLE",
    detalle:
      "Oficial PDF jul-2026: Disp. 80.65% (−17.27 pp vs jun 97.92%). Conf. 100% (0 eventos). Caída por AGC4: sábana julio registra M10 en CPW01/03 (13–14) y descarbonización CPW02 (10–11). Energía Sistema CPW 3.515.954 kWh. Meta ≥98%.",
  },
  {
    unidad: "SISTEMA N",
    campo: "VONU",
    horasStandBy: 0,
    disponibilidadPct: 98.79,
    confiabilidadPct: 100,
    fallas: 0,
    mtbfLabel: "Sin Fallas",
    mttrHours: 0,
    riesgoTecnico: "RIESGO BAJO",
    cumplimiento: "CUMPLE",
    detalle:
      "Oficial anexo PDF: Disp. 98.79% / Conf. 100% (0 eventos). Narrativa §2.2 cita 95.43%; se usa el dashboard anexo. Meta Vonú ≥90%. Energía 119.038 kWh.",
  },
];

function num(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function isoDate(v) {
  if (v == null || v === "") return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  return null;
}

function normTag(tag) {
  const t = String(tag || "").trim().toUpperCase().replace(/\s+/g, "");
  const cpw = t.match(/^CPW-?0*(\d+)$/);
  if (cpw) return `CPW${cpw[1].padStart(2, "0")}`;
  const jin = t.match(/^JIN-?0*(\d+)$/);
  if (jin) return `JIN-${jin[1].padStart(2, "0")}`;
  return t;
}

const wb = XLSX.readFile(path.join(DIR, XLSX_NAME), { cellDates: true });
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: true });

const byEq = new Map();
const events = [];

for (const r of rows) {
  const date = isoDate(r.Fecha ?? r.fecha);
  const tag = normTag(r.Equipo_Tag ?? r.TAG ?? r.Equipo);
  if (!date || !tag) continue;
  const campo = String(r.Locacion ?? r.Campo ?? "COSTAYACO").trim().toUpperCase();
  const op = num(r.Horas_oper_dia ?? r["Horas Operacion"]);
  const sb = num(r["Horas en Stand By"] ?? r.Horas_SB);
  const kwh = num(r.Energia_kWh_dia ?? r["KWH generados"]);
  const pp = num(r.Horas_PP);
  const pfContr = num(r.Horas_PF_contr);
  const pfCli = num(r.Horas_PF_cli);
  const cal = num(r.Horas_cal_dia);
  const falla = num(r.Falla_evento);
  const obs = r.Observaciones != null ? String(r.Observaciones).trim() : "";

  const prev = byEq.get(tag) ?? {
    equipo: tag,
    campo,
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
  prev.horasPFContr += pfContr;
  prev.horasPFCli += pfCli;
  prev.horasCalDia += cal;
  prev.fallaEvento += falla;
  byEq.set(tag, prev);

  if (falla > 0 || pfContr > 0 || pfCli > 0 || pp > 0 || obs) {
    const isFalla = falla > 0 || pfContr > 0;
    events.push({
      date,
      equipment: tag,
      eventType: isFalla ? "Falla" : "Operativo",
      cause: obs || (isFalla ? "Evento con PF/falla en Data Soporte" : pp > 0 ? "Mantenimiento preventivo (Data Soporte)" : "Evento con PF/falla en Data Soporte"),
      downtimeHours: Number((pfContr + pfCli + pp).toFixed(2)),
      responsible: isFalla ? "COPOWER" : pfCli > 0 ? "GTE" : "COPOWER",
      notes: `PP ${pp} h | SB ${sb} h | PF_contr ${pfContr} h | PF_cli ${pfCli} h | Falla_evento ${falla}`,
    });
  }
}

const units = [...byEq.values()].sort((a, b) => a.equipo.localeCompare(b.equipo));
const round1 = (n) => Number(n.toFixed(3));

const generationByEquipment = units.map((u) => ({
  equipo: u.equipo,
  campo: u.campo,
  energiaKwh: round1(u.energiaKwh),
  horasOperacion: round1(u.horasOperacion),
  horasStandBy: round1(u.horasStandBy),
  horasPP: round1(u.horasPP),
  horasPFContr: round1(u.horasPFContr),
  horasPFCli: round1(u.horasPFCli),
  horasCalDia: round1(u.horasCalDia),
  fallaEvento: u.fallaEvento,
}));

const costayaco = units.filter((u) => u.campo === "COSTAYACO");
const vonu = units.filter((u) => u.campo === "VONU");
const gasCyc = costayaco.filter((u) => !DIESEL.has(u.equipo));
const dieselCyc = costayaco.filter((u) => DIESEL.has(u.equipo));

const energyGasKwh = round1(gasCyc.reduce((s, u) => s + u.energiaKwh, 0));
const energyDieselKwh = round1(dieselCyc.reduce((s, u) => s + u.energiaKwh, 0) + vonu.filter((u) => DIESEL.has(u.equipo)).reduce((s, u) => s + u.energiaKwh, 0));
const vonuGas = round1(vonu.filter((u) => !DIESEL.has(u.equipo)).reduce((s, u) => s + u.energiaKwh, 0));

const hoursOperated = round1(units.reduce((s, u) => s + u.horasOperacion, 0));
const hoursStandby = round1(units.reduce((s, u) => s + u.horasStandBy, 0));
const hoursPreventive = round1(units.reduce((s, u) => s + u.horasPP, 0));
const hoursFailureCopower = round1(units.reduce((s, u) => s + u.horasPFContr, 0));
const hoursFailureClient = round1(units.reduce((s, u) => s + u.horasPFCli, 0));
const copowerFailures = units.reduce((s, u) => s + u.fallaEvento, 0);

const nUnits = units.filter((u) => GAS_N.has(u.equipo));
const calN = nUnits.reduce((s, u) => s + u.horasCalDia, 0);
const pfN = nUnits.reduce((s, u) => s + u.horasPFContr, 0);
const opN = nUnits.reduce((s, u) => s + u.horasOperacion, 0);
const kpiExcelAvail = calN > 0 ? (calN - pfN) / calN : null;
const kpiExcelRel = calN > 0 ? (calN - pfN) / calN : null;

const machineIndicators = [
  ...Object.entries(PDF_DASHBOARD).map(([unidad, d]) => {
    const excel = byEq.get(unidad);
    return {
      unidad,
      campo: d.campo,
      horasStandBy: d.horasStandBy,
      disponibilidadPct: d.disponibilidadPct,
      confiabilidadPct: d.confiabilidadPct,
      fallas: d.fallas,
      mtbfLabel: d.mtbfLabel,
      mttrHours: d.mttrHours,
      riesgoTecnico: d.riesgoTecnico,
      cumplimiento: d.cumplimiento,
      detalle: d.detalle,
    };
  }),
  ...SISTEMA,
];

const eventLog = events.sort((a, b) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : a.equipment.localeCompare(b.equipment),
);

const totalGenerationKwh = round1(units.reduce((s, u) => s + u.energiaKwh, 0));

const snap = {
  label: "Julio",
  sourceFile: `data/Julio/GTE/${XLSX_NAME}`,
  summary: {
    copowerFailures,
    totalEvents: events.length,
    mtbfHours: copowerFailures === 0 ? null : Number((opN / copowerFailures).toFixed(2)),
    mttrHours: copowerFailures === 0 ? 0 : Number((hoursFailureCopower / copowerFailures).toFixed(2)),
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
    { asset: "Costayaco", gasKwh: energyGasKwh, dieselKwh: energyDieselKwh },
    { asset: "Vonu", gasKwh: vonuGas, dieselKwh: 0 },
  ],
  generationByEquipment,
  totalGenerationKwh,
  machineIndicators,
  eventLog,
  kpi: {
    availability: 0.8065,
    reliability: 1,
    maintainability: null,
    generationMwh: Number((totalGenerationKwh / 1000).toFixed(3)),
    operationalLossesMwh: null,
    contractualCompliance: 0.8065,
  },
  kpiExcel: {
    availability: kpiExcelAvail != null ? Number(kpiExcelAvail.toFixed(6)) : null,
    reliability: kpiExcelRel != null ? Number(kpiExcelRel.toFixed(6)) : null,
    mtbfHours: copowerFailures === 0 ? null : Number((opN / copowerFailures).toFixed(2)),
    mttrHours: copowerFailures === 0 ? 0 : Number((hoursFailureCopower / Math.max(copowerFailures, 1)).toFixed(2)),
  },
};

fs.writeFileSync(OUT, JSON.stringify(snap, null, 2));

console.log("Excel:", XLSX_NAME);
console.log("units:", units.length, units.map((u) => u.equipo).join(", "));
console.log("kWh total", totalGenerationKwh, "gas CYC", energyGasKwh, "diesel", energyDieselKwh, "vonu", vonuGas);
console.log("PDF Sistema CPW 3515954 | total PDF 3931532");
console.log("horas OP/SB/PP/PFc/PFcli", hoursOperated, hoursStandby, hoursPreventive, hoursFailureCopower, hoursFailureClient);
console.log("fallas Excel", copowerFailures, "eventos", events.length);
console.log("kpiExcel avail", snap.kpiExcel.availability, "calN", calN, "pfN", pfN);
console.log("wrote", OUT);
