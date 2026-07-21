import raw from "./copowerGenerationDashboard2026.json";

export type GenerationEquipmentRow = {
  mwh: number;
  op: number;
  sb: number;
  pe: number;
  mto: number;
  fs: number;
  tr: number;
  horas_reg: number;
  disp: number;
  util: number;
  kw_op: number;
  gas_mscf: number;
};

export type CopowerGenerationDashboard = {
  equipos: Record<string, GenerationEquipmentRow>;
  meses: Record<string, unknown>;
  diario_flota: Record<string, number>;
  mensual_equipo: Record<string, Record<string, number>>;
};

export const COPOWER_GENERATION_DASHBOARD = raw as CopowerGenerationDashboard;

export const GENERATION_DASHBOARD_META = {
  title: "Dashboard de Generación — Costayaco / Vonú",
  periodLabel: "1 ene – 18 jul 2026 (199 días)",
  days: 199,
  equipmentCount: 15,
  equipmentNote: "7 CPW gas, 5 JINAN, G102-J/K, G101-V",
  sourceFile: "Reporte Diario Costayaco/Vonú 2026 · hoja Resumen OP",
  sourceOrg: "COPOWER · Gran Tierra Energy",
} as const;

export const GENERATION_EQUIPMENT_ORDER = Object.keys(COPOWER_GENERATION_DASHBOARD.equipos);

export const GENERATION_MONTH_KEYS = [
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
] as const;

export const GENERATION_MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul (1-18)",
] as const;

export const GENERATION_PALETTE = [
  "#0e6e8c",
  "#16a085",
  "#e67e22",
  "#8e44ad",
  "#c0392b",
  "#2980b9",
  "#f39c12",
  "#27ae60",
  "#d35400",
  "#7f8c8d",
  "#2c3e50",
  "#e84393",
  "#00897b",
  "#6d4c41",
  "#5c6bc0",
] as const;

export function generationDashboardKpis(data = COPOWER_GENERATION_DASHBOARD) {
  const order = GENERATION_EQUIPMENT_ORDER;
  const tot = order.reduce((s, e) => s + data.equipos[e].mwh, 0);
  const hop = order.reduce((s, e) => s + data.equipos[e].op, 0);
  const gas = order.reduce((s, e) => s + data.equipos[e].gas_mscf, 0);
  const dispProm = order.reduce((s, e) => s + data.equipos[e].disp, 0) / order.length;
  const utilProm = order.reduce((s, e) => s + data.equipos[e].util, 0) / order.length;
  const days = GENERATION_DASHBOARD_META.days;

  return {
    totalMwh: tot,
    mwhPerDay: tot / days,
    avgMw: tot / days / 24,
    hoursOp: hop,
    avgDisp: dispProm,
    avgUtil: utilProm,
    gasMmscf: gas / 1000,
    gasMscf: gas,
  };
}

export function sortedEquipmentByMwh(data = COPOWER_GENERATION_DASHBOARD) {
  return [...GENERATION_EQUIPMENT_ORDER].sort((a, b) => data.equipos[b].mwh - data.equipos[a].mwh);
}

export function dailyFleetSeries(data = COPOWER_GENERATION_DASHBOARD) {
  return Object.entries(data.diario_flota)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, mwh]) => ({
      date,
      label: date.slice(5),
      mwh,
    }));
}

export function monthlyStackedSeries(data = COPOWER_GENERATION_DASHBOARD) {
  return GENERATION_MONTH_KEYS.map((month, i) => {
    const row: Record<string, string | number> = {
      month: GENERATION_MONTH_LABELS[i],
    };
    for (const eq of GENERATION_EQUIPMENT_ORDER) {
      row[eq] = data.mensual_equipo[eq]?.[month] ?? 0;
    }
    return row;
  });
}
