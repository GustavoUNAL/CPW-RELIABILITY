/**
 * ETL: Sábana de mantenimientos Generación Putumayo → maintenancePlansData.ts
 * Uso: node scripts/etl-mantenimiento-sabana.mjs
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const ROOT = path.resolve(import.meta.dirname, "..");
const dataRoot = path.join(ROOT, "data");
const maintDir = fs.readdirSync(dataRoot).find((d) => /^mantenimiento$/i.test(d.trim()));
if (!maintDir) {
  console.error("No se encontró carpeta data/Mantenimiento");
  process.exit(1);
}
const xlsxName = fs
  .readdirSync(path.join(dataRoot, maintDir))
  .find((f) => /SABANA|MMTOS|PUTUMAYO/i.test(f) && f.endsWith(".xlsx") && !f.startsWith("~$"));
if (!xlsxName) {
  console.error("No se encontró el Excel de sábana de mantenimientos");
  process.exit(1);
}
const XLSX_PATH = path.join(dataRoot, maintDir, xlsxName);
const OUT = path.join(ROOT, "src/domain/reliability/reports/maintenancePlansData.ts");

const MONTH_MAP = {
  ENERO: "Ene",
  FEBRERO: "Feb",
  FEBREO: "Feb",
  MARZO: "Mar",
  ABRIL: "Abr",
  MAYO: "May",
  JUNIO: "Jun",
  JULIO: "Jul",
  AGOSTO: "Ago",
  SEPTIEMBRE: "Sep",
  OCTUBRE: "Oct",
  NOVIEMBRE: "Nov",
  DICIEMBRE: "Dic",
};

function str(v) {
  if (v == null) return "";
  return String(v).replace(/\s+/g, " ").trim();
}

function num(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).trim().replace(/\s/g, "").replace(/,/g, "");
  if (!s || s === "-") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toIsoDate(v) {
  if (v == null || v === "") return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = str(v);
  const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m1) {
    return `${m1[3]}-${m1[2].padStart(2, "0")}-${m1[1].padStart(2, "0")}`;
  }
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}`;
  return null;
}

function normStatus(raw) {
  const s = str(raw).toLowerCase();
  if (!s) return "sin_dato";
  if (/ejecut/.test(s)) return "ejecutado";
  if (/pendiente/.test(s)) return "pendiente";
  if (/no aplica/.test(s)) return "no_aplica";
  return "otro";
}

function isYes(v) {
  const s = str(v).toLowerCase();
  return s === "sí" || s === "si" || s === "yes";
}

const wb = XLSX.readFile(XLSX_PATH, { cellDates: true });
const sheetName = wb.SheetNames.find((n) => /PUTUMAYO|GENERACI/i.test(n)) ?? wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null, raw: false });

const header = rows[2] ?? [];
const modelRow = rows[1] ?? [];

/** Pares equipo / H-H en el calendario (cols 4..48). */
const units = [];
for (let c = 4; c <= 48; c += 2) {
  const name = str(header[c]);
  if (!name) continue;
  units.push({
    col: c,
    hhCol: c + 1,
    equipment: name,
    model: str(modelRow[c]) || "—",
  });
}

const catalog = [];
for (let i = 4; i < 50; i++) {
  const r = rows[i] ?? [];
  const equipment = str(r[63]);
  const type = str(r[64]);
  const periodicityHrs = num(r[65]);
  if (!equipment) continue;
  if (/INSTRUCCIONES|Automático|BOTONES|REGISTRAR|LIMPIAR|CREAR|Programar/i.test(equipment)) continue;
  if (!type && periodicityHrs == null) continue;
  catalog.push({
    equipment,
    model: type || "—",
    periodicityHrs: periodicityHrs ?? 0,
    hoursMto: num(r[71]) ?? 0,
    manHours: num(r[72]) ?? 0,
  });
}

const excelPanelSummary = [];
for (let i = 3; i < 40; i++) {
  const r = rows[i] ?? [];
  const mes = str(r[51]).toUpperCase();
  if (!MONTH_MAP[mes] && mes !== "TOTAL") continue;
  excelPanelSummary.push({
    monthKey: MONTH_MAP[mes] ?? "TOTAL",
    monthLabel: mes === "TOTAL" ? "Total año" : mes.charAt(0) + mes.slice(1).toLowerCase(),
    totalHoursMto: num(r[53]) ?? 0,
    totalManHours: num(r[55]) ?? 0,
  });
}

const periodicityNotes = [];
for (let i = 30; i < 45; i++) {
  const r = rows[i] ?? [];
  const label = str(r[51]);
  const note = str(r[55]);
  if (/JINAN|DIESEL|Periocidad|Periodicidad/i.test(label) && note) {
    periodicityNotes.push({ fleet: label, rule: note });
  }
}

const MONTH_KEYS = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MONTH_LABELS = {
  Ene: "Enero",
  Feb: "Febrero",
  Mar: "Marzo",
  Abr: "Abril",
  May: "Mayo",
  Jun: "Junio",
  Jul: "Julio",
  Ago: "Agosto",
  Sep: "Septiembre",
  Oct: "Octubre",
  Nov: "Noviembre",
  Dic: "Diciembre",
};

function monthKeyFromIso(dateIso) {
  const mm = Number(dateIso.slice(5, 7));
  return MONTH_KEYS[mm] ?? null;
}

const days = [];
const calendarSlots = [];
const executions = [];

for (let i = 3; i < rows.length; i++) {
  const r = rows[i] ?? [];
  const dateIso = toIsoDate(r[2]);
  if (!dateIso) continue;

  const monthKey = monthKeyFromIso(dateIso);
  const weekday = str(r[1]);
  const totalManHoursDay = num(r[3]) ?? 0;

  const daySlots = [];
  for (const u of units) {
    const mark = str(r[u.col]);
    if (!mark) continue;
    const hoursMto = num(mark);
    const manHours = num(r[u.hhCol]);
    const slot = {
      equipment: u.equipment,
      model: u.model,
      mark,
      hoursMto: hoursMto ?? null,
      manHours: manHours ?? null,
      isRun: /^run$/i.test(mark),
    };
    daySlots.push(slot);
    calendarSlots.push({
      date: dateIso,
      monthKey,
      ...slot,
    });
  }

  const programmedRaw = str(r[57]);
  const equipmentPlanned = str(r[58]);
  const executedRaw = str(r[59]);
  const statusRaw = str(r[60]);
  const execParsed = toIsoDate(r[61]);
  const execDate = execParsed || str(r[61]) || null;
  const notes = str(r[62]);

  days.push({
    date: dateIso,
    weekday,
    monthKey,
    totalManHours: totalManHoursDay,
    slotCount: daySlots.length,
  });

  if (programmedRaw || statusRaw || equipmentPlanned) {
    executions.push({
      date: dateIso,
      monthKey,
      programmed: isYes(programmedRaw),
      programmedLabel: programmedRaw || "—",
      equipment: equipmentPlanned || (daySlots.map((s) => s.equipment).join(", ") || "—"),
      executed: isYes(executedRaw),
      status: normStatus(statusRaw),
      statusLabel: statusRaw || "—",
      executionDate: execDate && String(execDate).includes("-") ? execDate : execDate,
      notes: notes || null,
      plannedManHours: totalManHoursDay,
    });
  }
}

/** Resumen mensual recalculado desde calendario + control de ejecución (no el panel Excel). */
const monthlyMap = new Map();
for (const key of MONTH_KEYS.filter(Boolean)) {
  monthlyMap.set(key, {
    monthKey: key,
    monthLabel: MONTH_LABELS[key],
    plannedHoursMto: 0,
    plannedManHours: 0,
    executedHoursMto: 0,
    executedManHours: 0,
    programmedCount: 0,
    executedCount: 0,
    pendingCount: 0,
    kind: "planificado",
  });
}

const executedDates = new Set(
  executions.filter((e) => e.status === "ejecutado").map((e) => e.date),
);

for (const slot of calendarSlots) {
  if (!slot.monthKey || slot.isRun) continue;
  const row = monthlyMap.get(slot.monthKey);
  if (!row) continue;
  row.plannedHoursMto += slot.hoursMto ?? 0;
  row.plannedManHours += slot.manHours ?? 0;
  if (executedDates.has(slot.date)) {
    row.executedHoursMto += slot.hoursMto ?? 0;
    row.executedManHours += slot.manHours ?? 0;
  }
}

for (const e of executions) {
  if (!e.monthKey || !e.programmed) continue;
  const row = monthlyMap.get(e.monthKey);
  if (!row) continue;
  row.programmedCount += 1;
  if (e.status === "ejecutado") row.executedCount += 1;
  if (e.status === "pendiente") row.pendingCount += 1;
}

const monthlySummary = [...monthlyMap.values()].map((row) => ({
  ...row,
  /** Compat: horas planificadas en calendario. */
  totalHoursMto: row.plannedHoursMto,
  totalManHours: row.plannedManHours,
  kind: row.executedCount > 0 ? (row.pendingCount > 0 && row.executedCount === 0 ? "planificado" : "mixto") : "planificado",
}));

for (const row of monthlySummary) {
  if (row.executedCount > 0 && row.pendingCount === 0) row.kind = "ejecutado";
  else if (row.executedCount > 0) row.kind = "mixto";
  else row.kind = "planificado";
}

const byEquipment = new Map();
for (const slot of calendarSlots) {
  if (slot.isRun) continue;
  const prev = byEquipment.get(slot.equipment) ?? {
    equipment: slot.equipment,
    model: slot.model,
    interventions: 0,
    hoursMto: 0,
    manHours: 0,
  };
  prev.interventions += 1;
  prev.hoursMto += slot.hoursMto ?? 0;
  prev.manHours += slot.manHours ?? 0;
  byEquipment.set(slot.equipment, prev);
}

const equipmentStats = [...byEquipment.values()].sort(
  (a, b) => b.interventions - a.interventions || a.equipment.localeCompare(b.equipment),
);

const statusCounts = { ejecutado: 0, pendiente: 0, no_aplica: 0, otro: 0, sin_dato: 0 };
for (const e of executions) statusCounts[e.status] = (statusCounts[e.status] ?? 0) + 1;

const payload = {
  sourceFile: path.relative(ROOT, XLSX_PATH).replace(/\\/g, "/"),
  sheet: sheetName.trim(),
  extractedAt: new Date().toISOString().slice(0, 10),
  title: "Sábana de mantenimientos · Generación Putumayo",
  notes:
    "Calendario diario 2026, control de ejecución y catálogo de periodicidad.",
  fleet: units.map((u) => ({ equipment: u.equipment, model: u.model })),
  catalog,
  periodicityNotes,
  monthlySummary,
  excelPanelSummary,
  statusCounts,
  equipmentStats,
  days,
  calendarSlots,
  executions,
};

const body = `/** Generado por scripts/etl-mantenimiento-sabana.mjs — no editar a mano. */
export type MaintenancePlanStatus = "ejecutado" | "pendiente" | "no_aplica" | "otro" | "sin_dato";

export type MaintenanceFleetUnit = {
  equipment: string;
  model: string;
};

export type MaintenanceCatalogItem = {
  equipment: string;
  model: string;
  periodicityHrs: number;
  hoursMto: number;
  manHours: number;
};

export type MaintenanceMonthlySummary = {
  monthKey: string;
  monthLabel: string;
  /** Horas MTO marcadas en el calendario del mes (plan). */
  plannedHoursMto: number;
  plannedManHours: number;
  /** Horas de días con estado Ejecutado. */
  executedHoursMto: number;
  executedManHours: number;
  programmedCount: number;
  executedCount: number;
  pendingCount: number;
  kind: "ejecutado" | "mixto" | "planificado";
  /** Alias de plannedHoursMto (compat). */
  totalHoursMto: number;
  totalManHours: number;
};

export type MaintenanceExcelPanelRow = {
  monthKey: string;
  monthLabel: string;
  totalHoursMto: number;
  totalManHours: number;
};

export type MaintenanceCalendarSlot = {
  date: string;
  monthKey: string | null;
  equipment: string;
  model: string;
  mark: string;
  hoursMto: number | null;
  manHours: number | null;
  isRun: boolean;
};

export type MaintenanceExecution = {
  date: string;
  monthKey: string | null;
  programmed: boolean;
  programmedLabel: string;
  equipment: string;
  executed: boolean;
  status: MaintenancePlanStatus;
  statusLabel: string;
  executionDate: string | null;
  notes: string | null;
  plannedManHours: number;
};

export type MaintenanceEquipmentStat = {
  equipment: string;
  model: string;
  interventions: number;
  hoursMto: number;
  manHours: number;
};

export type MaintenanceDay = {
  date: string;
  weekday: string;
  monthKey: string | null;
  totalManHours: number;
  slotCount: number;
};

export type MaintenancePlansPack = {
  sourceFile: string;
  sheet: string;
  extractedAt: string;
  title: string;
  notes: string;
  fleet: MaintenanceFleetUnit[];
  catalog: MaintenanceCatalogItem[];
  periodicityNotes: { fleet: string; rule: string }[];
  monthlySummary: MaintenanceMonthlySummary[];
  /** Panel lateral del Excel — no usar como fuente primaria. */
  excelPanelSummary: MaintenanceExcelPanelRow[];
  statusCounts: Record<MaintenancePlanStatus, number>;
  equipmentStats: MaintenanceEquipmentStat[];
  days: MaintenanceDay[];
  calendarSlots: MaintenanceCalendarSlot[];
  executions: MaintenanceExecution[];
};

export const MAINTENANCE_PLANS: MaintenancePlansPack = ${JSON.stringify(payload, null, 2)};
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, body);
console.log(
  `OK ${executions.length} ejecuciones · ${calendarSlots.length} slots · ${catalog.length} catálogo → ${path.relative(ROOT, OUT)}`,
);
