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

export type DailyFleetPoint = {
  date: string;
  label: string;
  mwh: number;
};

export function dailyFleetSeries(data = COPOWER_GENERATION_DASHBOARD): DailyFleetPoint[] {
  return Object.entries(data.diario_flota)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, mwh]) => ({
      date,
      label: date.slice(5),
      mwh,
    }));
}

/** Ventana de contexto (±días) alrededor de una fecha para la tendencia diaria. */
export function dailyFleetWindow(
  series: DailyFleetPoint[],
  selectedDate: string,
  radius = 7,
): DailyFleetPoint[] {
  const idx = series.findIndex((d) => d.date === selectedDate);
  if (idx < 0) return series;
  return series.slice(Math.max(0, idx - radius), Math.min(series.length, idx + radius + 1));
}

export function dailyFleetStats(series: DailyFleetPoint[], selectedDate?: string | null) {
  const avg = series.length ? series.reduce((s, d) => s + d.mwh, 0) / series.length : 0;
  const selected = selectedDate ? series.find((d) => d.date === selectedDate) : null;
  const peak = series.reduce(
    (best, d) => (d.mwh > best.mwh ? d : best),
    series[0] ?? { date: "", label: "", mwh: 0 },
  );
  return {
    avg,
    selected,
    peak,
    deltaVsAvg: selected ? selected.mwh - avg : null,
  };
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

export type SectionIndicator = {
  label: string;
  value: string;
  hint?: string;
};

export function monthlySectionIndicators(data = COPOWER_GENERATION_DASHBOARD): SectionIndicator[] {
  const monthTotals = GENERATION_MONTH_KEYS.map((month, i) => {
    const total = GENERATION_EQUIPMENT_ORDER.reduce(
      (s, eq) => s + (data.mensual_equipo[eq]?.[month] ?? 0),
      0,
    );
    return { key: month, label: GENERATION_MONTH_LABELS[i], total };
  });
  const ytd = monthTotals.reduce((s, m) => s + m.total, 0);
  const peak = monthTotals.reduce((best, m) => (m.total > best.total ? m : best), monthTotals[0]);
  const low = monthTotals.reduce((worst, m) => (m.total < worst.total ? m : worst), monthTotals[0]);
  const topEq = sortedEquipmentByMwh(data)[0];
  const topMwh = topEq ? data.equipos[topEq].mwh : 0;
  const avgMonth = ytd / Math.max(1, monthTotals.length);

  return [
    { label: "MWh acumulados YTD", value: ytd.toLocaleString("es-CO", { maximumFractionDigits: 0 }), hint: "Suma Ene–Jul" },
    { label: "Mejor mes", value: `${peak.label}`, hint: `${peak.total.toLocaleString("es-CO", { maximumFractionDigits: 0 })} MWh` },
    { label: "Mes más bajo", value: `${low.label}`, hint: `${low.total.toLocaleString("es-CO", { maximumFractionDigits: 0 })} MWh` },
    { label: "Promedio mensual", value: `${avgMonth.toFixed(0)} MWh`, hint: `${monthTotals.length} cortes` },
    {
      label: "Equipo líder",
      value: topEq ?? "N/D",
      hint: topEq ? `${topMwh.toLocaleString("es-CO", { maximumFractionDigits: 0 })} MWh · ${((100 * topMwh) / ytd).toFixed(1)}% flota` : undefined,
    },
    {
      label: "Equipos activos",
      value: String(GENERATION_EQUIPMENT_ORDER.length),
      hint: GENERATION_DASHBOARD_META.equipmentNote,
    },
  ];
}

export function utilizationSectionIndicators(data = COPOWER_GENERATION_DASHBOARD): SectionIndicator[] {
  const order = GENERATION_EQUIPMENT_ORDER;
  const rows = order.map((eq) => ({ eq, disp: data.equipos[eq].disp, util: data.equipos[eq].util }));
  const avgDisp = rows.reduce((s, r) => s + r.disp, 0) / rows.length;
  const avgUtil = rows.reduce((s, r) => s + r.util, 0) / rows.length;
  const bestDisp = rows.reduce((b, r) => (r.disp > b.disp ? r : b), rows[0]);
  const worstDisp = rows.reduce((w, r) => (r.disp < w.disp ? r : w), rows[0]);
  const below98 = rows.filter((r) => r.disp < 98).length;
  const bestUtil = rows.reduce((b, r) => (r.util > b.util ? r : b), rows[0]);

  return [
    { label: "Disp. media flota", value: `${avgDisp.toFixed(1)}%`, hint: "Meta ≥ 98%" },
    { label: "Util. media flota", value: `${avgUtil.toFixed(1)}%`, hint: "Horas OP / calendario" },
    { label: "Brecha Disp−Util", value: `${(avgDisp - avgUtil).toFixed(1)} pp`, hint: "Standby / no despacho" },
    { label: "Mejor disponibilidad", value: bestDisp.eq, hint: `${bestDisp.disp.toFixed(1)}%` },
    { label: "Menor disponibilidad", value: worstDisp.eq, hint: `${worstDisp.disp.toFixed(1)}%` },
    {
      label: "Equipos < 98% Disp",
      value: String(below98),
      hint: bestUtil ? `Mayor util: ${bestUtil.eq} (${bestUtil.util.toFixed(1)}%)` : undefined,
    },
  ];
}

export function hoursSectionIndicators(data = COPOWER_GENERATION_DASHBOARD): SectionIndicator[] {
  const order = GENERATION_EQUIPMENT_ORDER;
  const sum = (key: keyof GenerationEquipmentRow) =>
    order.reduce((s, eq) => s + Number(data.equipos[eq][key] ?? 0), 0);
  const op = sum("op");
  const sb = sum("sb");
  const mto = sum("mto");
  const fs = sum("fs");
  const pe = sum("pe");
  const tr = sum("tr");
  const total = op + sb + mto + fs + pe + tr;
  const available = op + sb;
  const mostFs = order
    .map((eq) => ({ eq, fs: data.equipos[eq].fs }))
    .sort((a, b) => b.fs - a.fs)[0];

  return [
    { label: "Horas operación", value: op.toLocaleString("es-CO", { maximumFractionDigits: 0 }), hint: total ? `${((100 * op) / total).toFixed(1)}% del mix` : undefined },
    { label: "Horas standby", value: sb.toLocaleString("es-CO", { maximumFractionDigits: 0 }), hint: total ? `${((100 * sb) / total).toFixed(1)}% del mix` : undefined },
    { label: "Disponibles (OP+SB)", value: available.toLocaleString("es-CO", { maximumFractionDigits: 0 }), hint: "Capacidad lista" },
    { label: "Horas MTO", value: mto.toLocaleString("es-CO", { maximumFractionDigits: 0 }), hint: "Preventivo / programado" },
    { label: "Horas FS", value: fs.toLocaleString("es-CO", { maximumFractionDigits: 0 }), hint: mostFs ? `Máx: ${mostFs.eq} (${mostFs.fs.toLocaleString("es-CO")} h)` : undefined },
    { label: "PE + Traslado", value: (pe + tr).toLocaleString("es-CO", { maximumFractionDigits: 0 }), hint: `PE ${pe.toLocaleString("es-CO")} · TR ${tr.toLocaleString("es-CO")}` },
  ];
}
