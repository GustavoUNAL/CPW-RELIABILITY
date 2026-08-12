/**
 * ETL de eficiencia energética · gas Moqueta (MQT).
 *
 * Cruza el totalizador de gas de `data/eficiencia/parametros operacion gas moquta.xlsx`
 * con la energía diaria del Data Soporte de GTE para las unidades alimentadas por MQT.
 * El heat rate resultante es medido; el poder calorífico (cromatografía) es el único
 * parámetro externo y vive en `energyEfficiency.ts`.
 *
 *   node scripts/etl-gas-moqueta.mjs
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const GAS_FILE = "data/eficiencia/parametros operacion gas moquta.xlsx";
const OUT = "src/domain/reliability/reports/gasMoquetaData.ts";

/** Unidades reguladas por Medenus aguas abajo del filtro de Moqueta. */
const MQT_UNITS = ["CPW04", "CPW05", "CPW06"];

/** Lecturas por debajo de este acumulado son ruido de digitación. */
const MIN_TOTALIZER_MCF = 1000;
/** Caudal máximo creíble del ramal (MCF/día). */
const MAX_FLOW_MCFD = 1500;
/** Banda de heat rate creíble para motores a gas (ft³/kWh). */
const HR_MIN = 4;
const HR_MAX = 25;

/**
 * Columnas "P NOMINAL" del log de operación: son el set point de potencia real
 * de cada motor, incluido el derateo por detonación. G51↔CPW02 y G52↔CPW01
 * según el catálogo de `operacion/constants.ts`.
 */
const NOMINAL_COLS = {
  20: "CPW02",
  21: "CPW01",
  22: "CPW03",
  23: "CPW04",
  24: "CPW05",
  25: "CPW06",
  26: "JIN-10",
  27: "JIN-11",
  28: "JIN-12",
};

const MONTHS = [
  {
    monthKey: "Jun",
    monthLabel: "Junio",
    yearMonth: "2026-06",
    sheet: "Junio 2026",
    cols: { date: 0, hour: 1, pressureMqt: 4, totalizer: 9, today: 10, flow: 12 },
    dataSoporte: {
      file: "data/GTE/Junio/Data Soporte Cálculo Copower PUTN Junio 2026 (1).xlsx",
      sheet: "Hoja1",
    },
  },
  {
    monthKey: "Jul",
    monthLabel: "Julio",
    yearMonth: "2026-07",
    sheet: "Julio 2026",
    cols: { date: 0, hour: 1, pressureMqt: 4, totalizer: 9, today: 10, flow: 12 },
    dataSoporte: {
      file: "data/Julio/GTE/Data Soporte Cálculo Copower PUTN Julio 2026.xlsx",
      sheet: "Hoja1",
    },
  },
];

const excelDay = (n) =>
  new Date(Date.UTC(1899, 11, 30) + Math.floor(n) * 86400000).toISOString().slice(0, 10);

const addDays = (iso, n) =>
  new Date(new Date(iso).getTime() + n * 86400000).toISOString().slice(0, 10);

const diffDays = (a, b) => (new Date(b) - new Date(a)) / 86400000;

const round = (v, d = 2) => Number(v.toFixed(d));

function readGasSheet(wb, cfg) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[cfg.sheet], { header: 1, raw: true });
  const raw = [];
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i] || [];
    const f = r[cfg.cols.date];
    if (typeof f !== "number") continue;
    const day = excelDay(f);
    if (!day.startsWith(cfg.yearMonth)) continue;
    const totalizer = r[cfg.cols.totalizer];
    if (typeof totalizer !== "number" || totalizer <= MIN_TOTALIZER_MCF) continue;
    const hourRaw = r[cfg.cols.hour];
    const hour = typeof hourRaw === "number" && hourRaw >= 0 && hourRaw < 1 ? hourRaw : 0.5;
    const pressure = r[cfg.cols.pressureMqt];
    raw.push({
      day,
      hour,
      totalizerMcf: totalizer,
      pressurePsi: typeof pressure === "number" && pressure > 0 ? pressure : null,
    });
  }
  raw.sort((a, b) => a.day.localeCompare(b.day) || a.hour - b.hour);

  /** El totalizador solo avanza: se descartan retrocesos y saltos imposibles. */
  const clean = [];
  let discarded = 0;
  for (const r of raw) {
    const prev = clean[clean.length - 1];
    if (!prev) {
      clean.push(r);
      continue;
    }
    const span = diffDays(prev.day, r.day) + (r.hour - prev.hour);
    const delta = r.totalizerMcf - prev.totalizerMcf;
    if (delta < 0 || (span > 0 && delta / span > MAX_FLOW_MCFD)) {
      discarded++;
      continue;
    }
    clean.push(r);
  }
  return { raw, clean, discarded };
}

function readEnergyByDay(cfg) {
  const wb = XLSX.readFile(cfg.dataSoporte.file);
  const ws = wb.Sheets[cfg.dataSoporte.sheet];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
  const header = (rows[0] || []).map((h) => String(h).toLowerCase());
  const iTag = header.findIndex((h) => h.includes("tag"));
  const iKwh = header.findIndex((h) => h.includes("energia"));
  const iHours = header.findIndex((h) => h.includes("horas_oper"));
  if (iTag < 0 || iKwh < 0) {
    throw new Error(`Data Soporte sin columnas esperadas: ${cfg.dataSoporte.file}`);
  }
  const byDay = new Map();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || typeof r[0] !== "number") continue;
    const tag = String(r[iTag] ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!MQT_UNITS.includes(tag)) continue;
    const day = excelDay(r[0]);
    const cur = byDay.get(day) ?? { kwh: 0, opHours: 0, units: new Map() };
    const kwh = Number(r[iKwh]) || 0;
    const opHours = iHours >= 0 ? Number(r[iHours]) || 0 : 0;
    cur.kwh += kwh;
    cur.opHours += opHours;
    const u = cur.units.get(tag) ?? { kwh: 0, opHours: 0 };
    u.kwh += kwh;
    u.opHours += opHours;
    cur.units.set(tag, u);
    byDay.set(day, cur);
  }
  return byDay;
}

/** Set point de potencia por unidad: nominal de diseño (máximo) y operado (promedio). */
function readNominalPower(wb, cfg) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[cfg.sheet], { header: 1, raw: true });
  const out = [];
  for (const [col, unit] of Object.entries(NOMINAL_COLS)) {
    const values = [];
    for (let i = 2; i < rows.length; i++) {
      const r = rows[i] || [];
      if (typeof r[cfg.cols.date] !== "number") continue;
      if (!excelDay(r[cfg.cols.date]).startsWith(cfg.yearMonth)) continue;
      const v = r[Number(col)];
      if (typeof v === "number" && v > 0) values.push(v);
    }
    if (!values.length) continue;
    const designKw = Math.max(...values);
    const avgKw = values.reduce((s, v) => s + v, 0) / values.length;
    out.push({
      unit,
      designKw,
      operatedKw: round(avgKw, 1),
      deratedReadings: values.filter((v) => v < designKw).length,
      readings: values.length,
    });
  }
  return out.sort((a, b) => a.unit.localeCompare(b.unit));
}

function buildMonth(wb, cfg) {
  const { raw, clean, discarded } = readGasSheet(wb, cfg);
  if (clean.length < 2) return null;
  const energyByDay = readEnergyByDay(cfg);

  const first = clean[0];
  const last = clean[clean.length - 1];
  const spanDays = diffDays(first.day, last.day) + (last.hour - first.hour);
  const gasMcf = last.totalizerMcf - first.totalizerMcf;

  /** Energía de la ventana, prorrateando el primer y último día por hora de lectura. */
  let energyKwh = 0;
  let opHours = 0;
  let daysWithoutEnergy = 0;
  const unitsInWindow = new Map();
  for (let d = first.day; d <= last.day; d = addDays(d, 1)) {
    const e = energyByDay.get(d);
    if (!e) {
      daysWithoutEnergy++;
      continue;
    }
    let fraction = 1;
    if (d === first.day) fraction = 1 - first.hour;
    if (d === last.day) fraction = last.hour;
    energyKwh += e.kwh * fraction;
    opHours += e.opHours * fraction;
    for (const [unit, u] of e.units) {
      const cur = unitsInWindow.get(unit) ?? { kwh: 0, opHours: 0 };
      cur.kwh += u.kwh * fraction;
      cur.opHours += u.opHours * fraction;
      unitsInWindow.set(unit, cur);
    }
  }

  /** Gas diario: cada delta del totalizador se reparte según la energía de cada día. */
  const dailyGas = new Map();
  const intervals = [];
  for (let i = 1; i < clean.length; i++) {
    const a = clean[i - 1];
    const b = clean[i];
    const delta = b.totalizerMcf - a.totalizerMcf;
    if (delta <= 0) continue;
    const days = [];
    for (let d = a.day; d <= b.day; d = addDays(d, 1)) days.push(d);
    const weights = days.map((d) => {
      const e = energyByDay.get(d);
      let w = e ? e.kwh : 0;
      if (d === a.day) w *= 1 - a.hour;
      if (d === b.day) w *= b.hour;
      return Math.max(w, 0);
    });
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    if (totalWeight <= 0) continue;
    days.forEach((d, idx) => {
      dailyGas.set(d, (dailyGas.get(d) ?? 0) + (delta * weights[idx]) / totalWeight);
    });
    const hr = (delta * 1000) / totalWeight;
    if (hr >= HR_MIN && hr <= HR_MAX) {
      intervals.push({
        from: `${a.day}`,
        to: `${b.day}`,
        spanDays: round(diffDays(a.day, b.day) + (b.hour - a.hour), 3),
        gasMcf: round(delta, 2),
        energyKwh: round(totalWeight, 1),
        heatRateFt3Kwh: round(hr, 3),
      });
    }
  }

  const daily = [];
  for (let d = first.day; d <= last.day; d = addDays(d, 1)) {
    const e = energyByDay.get(d);
    const gas = dailyGas.get(d);
    if (e == null && gas == null) continue;
    const kwh = e?.kwh ?? 0;
    daily.push({
      date: d,
      gasMcf: gas == null ? null : round(gas, 1),
      energyKwh: round(kwh, 0),
      heatRateFt3Kwh: gas != null && kwh > 0 ? round((gas * 1000) / kwh, 3) : null,
      pressureMqtPsi: (() => {
        const sameDay = clean.filter((r) => r.day === d && r.pressurePsi != null);
        if (!sameDay.length) return null;
        return round(sameDay.reduce((s, r) => s + r.pressurePsi, 0) / sameDay.length, 1);
      })(),
    });
  }

  const pressures = clean.map((r) => r.pressurePsi).filter((p) => p != null);
  const heatRate = energyKwh > 0 ? (gasMcf * 1000) / energyKwh : null;

  return {
    monthKey: cfg.monthKey,
    monthLabel: cfg.monthLabel,
    yearMonth: cfg.yearMonth,
    units: MQT_UNITS,
    from: first.day,
    to: last.day,
    fromHour: round(first.hour * 24, 2),
    toHour: round(last.hour * 24, 2),
    spanDays: round(spanDays, 2),
    calendarDays: new Date(
      Number(cfg.yearMonth.slice(0, 4)),
      Number(cfg.yearMonth.slice(5, 7)),
      0,
    ).getDate(),
    readingsRaw: raw.length,
    readingsUsed: clean.length,
    readingsDiscarded: discarded,
    daysWithoutEnergy,
    gasMcf: round(gasMcf, 1),
    gasMcfPerDay: round(gasMcf / spanDays, 1),
    energyKwh: round(energyKwh, 0),
    opHours: round(opHours, 1),
    heatRateFt3Kwh: heatRate == null ? null : round(heatRate, 3),
    pressureMqtAvgPsi: pressures.length
      ? round(pressures.reduce((s, p) => s + p, 0) / pressures.length, 1)
      : null,
    pressureMqtMinPsi: pressures.length ? round(Math.min(...pressures), 1) : null,
    /** Lecturas por debajo del set point típico de 130 psi del regulador Fisher. */
    lowPressureReadings: pressures.filter((p) => p < 130).length,
    nominalPower: readNominalPower(wb, cfg),
    unitsInWindow: [...unitsInWindow.entries()]
      .map(([unit, u]) => ({
        unit,
        energyKwh: round(u.kwh, 0),
        opHours: round(u.opHours, 1),
      }))
      .sort((a, b) => a.unit.localeCompare(b.unit)),
    intervals,
    daily,
  };
}

function main() {
  if (!fs.existsSync(GAS_FILE)) {
    console.error(`No se encontró ${GAS_FILE}`);
    process.exit(1);
  }
  const wb = XLSX.readFile(GAS_FILE);
  const months = [];
  for (const cfg of MONTHS) {
    if (!wb.SheetNames.includes(cfg.sheet)) {
      console.warn(`Hoja ausente: ${cfg.sheet}`);
      continue;
    }
    if (!fs.existsSync(cfg.dataSoporte.file)) {
      console.warn(`Data Soporte ausente: ${cfg.dataSoporte.file}`);
      continue;
    }
    const built = buildMonth(wb, cfg);
    if (!built) {
      console.warn(`Sin lecturas suficientes en ${cfg.sheet}`);
      continue;
    }
    months.push(built);
    console.log(
      `${cfg.monthLabel}: ${built.gasMcf} MCF / ${built.energyKwh} kWh → HR ${built.heatRateFt3Kwh} ft³/kWh ` +
        `(${built.spanDays} d, ${built.readingsUsed}/${built.readingsRaw} lecturas)`,
    );
  }

  const pack = {
    sourceFile: GAS_FILE,
    dataSoporteFiles: MONTHS.map((m) => m.dataSoporte.file),
    extractedAt: new Date().toISOString().slice(0, 10),
    units: MQT_UNITS,
    notes:
      "Heat rate medido: delta del totalizador de gas Moqueta contra energía diaria del Data Soporte " +
      "de las unidades reguladas por Medenus (CPW04–CPW06). El poder calorífico se parametriza aparte.",
    months,
  };

  const body = `/** Generado por scripts/etl-gas-moqueta.mjs — no editar a mano. */
export type GasMoquetaInterval = {
  from: string;
  to: string;
  spanDays: number;
  gasMcf: number;
  energyKwh: number;
  heatRateFt3Kwh: number;
};

export type GasMoquetaDay = {
  date: string;
  /** Gas asignado al día repartiendo cada delta del totalizador por energía. */
  gasMcf: number | null;
  energyKwh: number;
  heatRateFt3Kwh: number | null;
  pressureMqtPsi: number | null;
};

export type GasNominalPower = {
  unit: string;
  /** Set point máximo registrado en el mes: nominal de diseño en operación. */
  designKw: number;
  /** Promedio del set point: refleja el derateo aplicado por detonación. */
  operatedKw: number;
  deratedReadings: number;
  readings: number;
};

export type GasUnitWindow = {
  unit: string;
  energyKwh: number;
  opHours: number;
};

export type GasMoquetaMonth = {
  monthKey: string;
  monthLabel: string;
  yearMonth: string;
  units: string[];
  from: string;
  to: string;
  fromHour: number;
  toHour: number;
  spanDays: number;
  calendarDays: number;
  readingsRaw: number;
  readingsUsed: number;
  readingsDiscarded: number;
  daysWithoutEnergy: number;
  gasMcf: number;
  gasMcfPerDay: number;
  energyKwh: number;
  opHours: number;
  heatRateFt3Kwh: number | null;
  pressureMqtAvgPsi: number | null;
  pressureMqtMinPsi: number | null;
  lowPressureReadings: number;
  nominalPower: GasNominalPower[];
  unitsInWindow: GasUnitWindow[];
  intervals: GasMoquetaInterval[];
  daily: GasMoquetaDay[];
};

export type GasMoquetaPack = {
  sourceFile: string;
  dataSoporteFiles: string[];
  extractedAt: string;
  units: string[];
  notes: string;
  months: GasMoquetaMonth[];
};

export const GAS_MOQUETA: GasMoquetaPack = ${JSON.stringify(pack, null, 2)};

export function gasMoquetaMonth(monthKey: string): GasMoquetaMonth | null {
  return GAS_MOQUETA.months.find((m) => m.monthKey === monthKey) ?? null;
}
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, body, "utf8");
  console.log(`\nEscrito ${OUT} (${months.length} meses)`);
}

main();
