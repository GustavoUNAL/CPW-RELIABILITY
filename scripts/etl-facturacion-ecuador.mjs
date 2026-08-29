/**
 * ETL: Ejemplo formato de facturación (Ecuador · julio 2026)
 * → src/domain/reliability/reports/facturacionEcuadorData.ts
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(
  ROOT,
  "data/Agosto/ejemplo formato/Copia de Ejemplo formato de facturacion.xlsx",
);
const OUT = path.join(ROOT, "src/domain/reliability/reports/facturacionEcuadorData.ts");

const STATES = ["OP", "SB", "PE", "M", "FS", "TR"];

const UNITS_A = [
  { tag: "KB-600-02", campo: "Chanangue J", owner: "GTE", col: 3 },
  { tag: "G301-B", campo: "Chanangue J", owner: "GTE", col: 9 },
  { tag: "KTA19-01", campo: "Chanangue K", owner: "GTE", col: 15 },
  { tag: "G102-C", campo: "Chanangue K", owner: "CPW", col: 21 },
  { tag: "KB-600-03", campo: "Charapa B", owner: "GTE", col: 27 },
  { tag: "KB-600-04", campo: "Charapa B", owner: "GTE", col: 33 },
  { tag: "KTA19-03", campo: "Charapa B", owner: "CPW", col: 39 },
];

const UNITS_B = [
  { tag: "KB-600-01", campo: "Iguana", owner: "GTE", col: 3 },
  { tag: "KTA19-02", campo: "Iguana", owner: "GTE", col: 9 },
  { tag: "KB-600-05", campo: "Conejo 1", owner: "CPW", col: 15 },
  { tag: "KB-600-06", campo: "Conejo 1", owner: "CPW", col: 21 },
  { tag: "KTA19-04", campo: "Conejo 1", owner: "CPW", col: 27 },
];

const PLACEHOLDERS = [
  { tag: "KB-600-16", campo: "Perico A", owner: "GTE" },
  { tag: "KTA19-05", campo: "Perico A", owner: "CPW" },
  { tag: "KB-600-17", campo: "Perico C", owner: "GTE" },
  { tag: "KTA19-06", campo: "Perico C", owner: "CPW" },
];

function num(v) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return 0;
}

function str(v) {
  if (v == null) return "";
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(v).replace(/\s+/g, " ").trim();
}

function pct(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") return v > 1.5 ? v / 100 : v;
  const s = String(v).replace("%", "").replace(",", ".").trim();
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n > 1.5 ? n / 100 : n;
}

function hoursGrid(rows, headerRow, firstDataRow, units) {
  return units.map((u) => {
    const days = [];
    for (let d = 0; d < 31; d++) {
      const r = rows[firstDataRow + d] || [];
      const slice = {
        OP: num(r[u.col]),
        SB: num(r[u.col + 1]),
        PE: num(r[u.col + 2]),
        M: num(r[u.col + 3]),
        FS: num(r[u.col + 4]),
        TR: num(r[u.col + 5]),
      };
      days.push(slice);
    }
    const tot = STATES.reduce((acc, k) => {
      acc[k] = days.reduce((s, x) => s + x[k], 0);
      return acc;
    }, {});
    return { tag: u.tag, campo: u.campo, owner: u.owner, days, totals: tot };
  });
}

const wb = XLSX.readFile(SRC, { cellDates: true, raw: true });
const jul = XLSX.utils.sheet_to_json(wb.Sheets["Julio 2026"], { header: 1, raw: true, defval: null });

const units = [...hoursGrid(jul, 8, 9, UNITS_A), ...hoursGrid(jul, 43, 44, UNITS_B)];

const kpiByTag = {};
for (let i = 78; i <= 89; i++) {
  const r = jul[i] || [];
  const tag = str(r[2]);
  if (!tag) continue;
  kpiByTag[tag] = {
    tag,
    campo: str(r[6]),
    sb: num(r[10]),
    disp: pct(r[13]),
    conf: pct(r[18]),
    fallas: num(r[23]),
    mtbf: r[26] == null || r[26] === "" ? null : num(r[26]),
    mttr: r[29] == null || r[29] === "" ? null : num(r[29]),
    riesgo: str(r[32]) || "RIESGO BAJO",
    cumplimiento: str(r[37]) || "CUMPLE",
  };
}

const systems = [];
for (let i = 93; i <= 102; i++) {
  const r = jul[i] || [];
  const sistema = str(r[2]);
  if (!sistema) continue;
  systems.push({
    sistema,
    campo: str(r[6]),
    sb: num(r[10]),
    disp: pct(r[13]),
    conf: pct(r[18]),
    fallas: r[23] == null || r[23] === "" ? null : num(r[23]),
    mtbf: r[26] == null || r[26] === "" ? null : num(r[26]),
    mttr: r[29] == null || r[29] === "" ? null : num(r[29]),
    riesgo: str(r[32]) || "RIESGO BAJO",
    cumplimiento: str(r[37]) || "CUMPLE",
  });
}

const ops = [];
for (let i = 129; i <= 140; i++) {
  const r = jul[i] || [];
  const tag = str(r[2]);
  if (!tag) continue;
  ops.push({
    tag,
    campo: str(r[6]),
    op: num(r[10]),
    sb: num(r[12]),
    pe: num(r[14]),
    mtto: num(r[16]),
    fs: num(r[18]),
    tr: num(r[20]),
    kwh: num(r[22]),
    ft3: r[26] == null || r[26] === "" ? null : num(r[26]),
    gal: r[30] == null || r[30] === "" ? null : num(r[30]),
    kwProm: num(r[34]),
    confH: num(r[38]) || 744,
  });
}

const events = [];
for (let i = 144; i <= 183; i++) {
  const r = jul[i] || [];
  const item = num(r[0]);
  if (!item) continue;
  events.push({
    item,
    fecha: str(r[2]),
    campo: str(r[5]),
    unidad: str(r[9]),
    tipo: str(r[13]),
    descripcion: str(r[18]),
    penalidad: str(r[34]) || "No Aplica",
    soporte: str(r[39]),
  });
}

const downtime = [];
for (let i = 186; i <= 188; i++) {
  const r = jul[i] || [];
  if (!str(r[3]) && !str(r[0])) continue;
  if (/fecha/i.test(str(r[0]))) continue;
  downtime.push({
    fecha: str(r[0]),
    equipo: str(r[3]),
    horaApagado: str(r[7]),
    mttoCorr: num(r[14]),
    pe: num(r[21]),
    movil: num(r[28]),
    totalFs: num(r[36]),
  });
}

const horometers = UNITS_A.concat(UNITS_B).map((u, idx) => {
  const col = 46 + idx; // AU = 46
  const start = num(jul[8]?.[col]);
  const end = num(jul[39]?.[col]);
  return { tag: u.tag, start, end, delta: Math.round((end - start) * 100) / 100 };
});

const pack = {
  sourceFile: "data/Agosto/ejemplo formato/Copia de Ejemplo formato de facturacion.xlsx",
  document: {
    nombre: "Facturación Copower Ecuador – GTE",
    tipo: "Soporte de facturación",
    origen: "Interno",
    periodo: "1 al 31 de julio 2026",
    secuencial: "Jul-26",
    contrato: "CW7581",
    empresa: "COPOWER LTDA",
    pais: "Ecuador",
    cliente: "Gran Tierra Energy",
    area: "Operaciones",
    region: "Lago Agrio",
    iva: 0.15,
    horasMes: 744,
    enviado: "2026-08-25",
  },
  states: STATES,
  units,
  placeholders: PLACEHOLDERS.map((u) => ({
    ...u,
    days: Array.from({ length: 31 }, () => ({ OP: 0, SB: 0, PE: 0, M: 0, FS: 0, TR: 0 })),
    totals: { OP: 0, SB: 0, PE: 0, M: 0, FS: 0, TR: 0 },
  })),
  kpiByTag,
  systems,
  ops,
  events,
  downtime,
  horometers,
  opexLines: [
    { detalle: "Operación 24 horas" },
    { detalle: "Operación 12 horas" },
    { detalle: "Operación por llamado" },
  ],
  capexLines: [
    { detalle: "Tablero distribución", equipo: "TD-01" },
    { detalle: "Filtro coalescente", equipo: "FC-01" },
  ],
  firmas: {
    elaborado: { nombre: "Wilson Oliveros", cargo: "CPW / Líder de Operaciones", fecha: "2026-07-31" },
    revisado: { nombre: "Wilson Oliveros", cargo: "CPW / Líder de Operaciones", fecha: "2026-07-31" },
    aprobado: { nombre: "", cargo: "", fecha: "2026-07-31" },
  },
  formulas: {
    mtbf: "MTBF = Tiempo total de operación / Cantidad de fallas",
    mttr: "MTTR = Tiempo total de reparación / Cantidad de fallas",
    riesgo:
      "RIESGO ALTO si Disp < 90% o Conf < 90% o (fallas > 1 y MTBF < 300) o (fallas > 1 y MTTR/MTBF > 0,3). RIESGO MEDIO si fallas > 1, MTBF ≥ 300 y MTTR/MTBF ≤ 0,3, o Conf < 90%. Si no: RIESGO BAJO.",
    cumple:
      "NO CUMPLE si Disp < 90%, Conf < 90%, o fallas > 1 y (MTBF < 300 o MTTR/MTBF > 0,3). Si no: CUMPLE.",
    ariba: "Conversión de horas a días (24 h) usada como referencia para el registro de facturación en Ariba.",
  },
};

const ts = `/** Generado por scripts/etl-facturacion-ecuador.mjs — no editar a mano. */
export const FACTURACION_SOURCE = ${JSON.stringify(pack.sourceFile)};

export type HourState = "OP" | "SB" | "PE" | "M" | "FS" | "TR";
export type OwnerKind = "GTE" | "CPW";

export type DayHours = Record<HourState, number>;

export type FacturacionUnit = {
  tag: string;
  campo: string;
  owner: OwnerKind;
  days: DayHours[];
  totals: DayHours;
};

export type FacturacionKpi = {
  tag: string;
  campo: string;
  sb: number;
  disp: number | null;
  conf: number | null;
  fallas: number;
  mtbf: number | null;
  mttr: number | null;
  riesgo: string;
  cumplimiento: string;
};

export type FacturacionSistema = {
  sistema: string;
  campo: string;
  sb: number;
  disp: number | null;
  conf: number | null;
  fallas: number | null;
  mtbf: number | null;
  mttr: number | null;
  riesgo: string;
  cumplimiento: string;
};

export type FacturacionOps = {
  tag: string;
  campo: string;
  op: number;
  sb: number;
  pe: number;
  mtto: number;
  fs: number;
  tr: number;
  kwh: number;
  ft3: number | null;
  gal: number | null;
  kwProm: number;
  confH: number;
};

export type FacturacionEvento = {
  item: number;
  fecha: string;
  campo: string;
  unidad: string;
  tipo: string;
  descripcion: string;
  penalidad: string;
  soporte: string;
};

export const FACTURACION_JULIO_2026 = ${JSON.stringify(pack, null, 2)} satisfies {
  sourceFile: string;
  document: Record<string, string | number>;
  states: string[];
  units: FacturacionUnit[];
  placeholders: FacturacionUnit[];
  kpiByTag: Record<string, FacturacionKpi>;
  systems: FacturacionSistema[];
  ops: FacturacionOps[];
  events: FacturacionEvento[];
  downtime: Array<{
    fecha: string;
    equipo: string;
    horaApagado: string;
    mttoCorr: number;
    pe: number;
    movil: number;
    totalFs: number;
  }>;
  horometers: Array<{ tag: string; start: number; end: number; delta: number }>;
  opexLines: Array<{ detalle: string }>;
  capexLines: Array<{ detalle: string; equipo: string }>;
  firmas: {
    elaborado: { nombre: string; cargo: string; fecha: string };
    revisado: { nombre: string; cargo: string; fecha: string };
    aprobado: { nombre: string; cargo: string; fecha: string };
  };
  formulas: Record<string, string>;
};

export type FacturacionPack = typeof FACTURACION_JULIO_2026;
`;

fs.writeFileSync(OUT, ts);
console.log("wrote", OUT, "units", units.length, "events", events.length, "ops", ops.length);
