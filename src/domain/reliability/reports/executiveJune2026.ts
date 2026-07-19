/**
 * Datos ejecutivos validados — Junio 2026 (Sistema Costayaco / Vonú).
 * Fuente: PDF oficial Gran Tierra + Excel Data Soporte + Orden 1 Costayaco.
 * No inventar ni extrapolar: si falta, N/D.
 */

export const EXEC_META = {
  availability: 0.98,
  reliability: 0.98,
  generationKwh: 4_000_000,
  efficiencyPct: 37,
  maintenancePct: 100,
  sparesPct: 100,
} as const;

export const EXEC_SOURCES = {
  pdf: "PDF oficial — Análisis Indicadores Copower PUTN Jun 2026 (Gran Tierra)",
  excel: "Excel — Data Soporte Cálculo Copower PUTN Junio 2026.xlsx",
  contract: "Orden de Servicio Costayaco (Orden 1)",
  none: "N/D — pendiente de fuente",
} as const;

/** Mayo 2026 — solo cifras citadas en el informe de junio / reconciliación. */
export const EXEC_MAY = {
  availability: 0.9288,
  reliability: 0.9405,
  failures: 7,
  mtbfHours: 500.39,
  mttrHours: 5.32,
} as const;

/** Junio 2026 — cifras exactas del reporte gerencial. */
export const EXEC_JUN = {
  label: "Junio 2026",
  field: "Sistema Costayaco / Vonú — Cuenca Putumayo Norte",
  availability: 0.9792,
  reliability: 0.9792,
  failures: 7,
  mtbfHours: 711.57,
  mttrHours: 2.86,
  vonuAvailability: 1,
  vonuReliability: 1,
  generationTotalKwh: 4_110_144,
  energyGasCostayacoKwh: 3_499_840,
  energyDieselCostayacoKwh: 119_716,
  energyVonuKwh: 490_588,
  hoursOperated: 6907,
  hoursStandby: 3128,
  hoursPp: 28,
  hoursPfContr: 20,
  hoursPfCli: 189,
  rcaDelivered: 0,
  rcaRequired: 7,
  excelFailureRows: 10,
  focalUnit: "CPW06",
  focalUnitFailures: 3,
} as const;

export type ExecUnitRow = {
  unidad: string;
  campo: string;
  disponibilidadPct: number;
  confiabilidadPct: number;
  fallas: number;
  mtbfLabel: string;
  mttrHours: number | null;
  riesgoTecnico: "RIESGO BAJO" | "RIESGO MEDIO" | "RIESGO ALTO";
  highlight?: boolean;
};

/** Unidades del consolidado (sin JIN-11/12). */
export const EXEC_JUN_UNITS: ExecUnitRow[] = [
  { unidad: "CPW01", campo: "COSTAYACO", disponibilidadPct: 99.72, confiabilidadPct: 99.72, fallas: 1, mtbfLabel: "572", mttrHours: 2, riesgoTecnico: "RIESGO BAJO" },
  { unidad: "CPW02", campo: "COSTAYACO", disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO" },
  { unidad: "CPW03", campo: "COSTAYACO", disponibilidadPct: 98.75, confiabilidadPct: 99.31, fallas: 1, mtbfLabel: "607", mttrHours: 5, riesgoTecnico: "RIESGO BAJO" },
  { unidad: "CPW04", campo: "COSTAYACO", disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO" },
  { unidad: "CPW05", campo: "COSTAYACO", disponibilidadPct: 98.89, confiabilidadPct: 99.86, fallas: 1, mtbfLabel: "699", mttrHours: 1, riesgoTecnico: "RIESGO BAJO" },
  { unidad: "CPW06", campo: "COSTAYACO", disponibilidadPct: 99.03, confiabilidadPct: 99.03, fallas: 3, mtbfLabel: "222.33", mttrHours: 2, riesgoTecnico: "RIESGO MEDIO", highlight: true },
  { unidad: "CPW07", campo: "COSTAYACO", disponibilidadPct: 99.31, confiabilidadPct: 99.31, fallas: 1, mtbfLabel: "605", mttrHours: 5, riesgoTecnico: "RIESGO BAJO" },
  { unidad: "JIN-10", campo: "COSTAYACO", disponibilidadPct: 99.44, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO" },
  { unidad: "G101V", campo: "COSTAYACO", disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO" },
  { unidad: "G102J", campo: "COSTAYACO", disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO" },
  { unidad: "G102K", campo: "COSTAYACO", disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO" },
  { unidad: "JIN-01", campo: "VONU", disponibilidadPct: 99.17, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO" },
  { unidad: "JIN-02", campo: "VONU", disponibilidadPct: 99.03, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO" },
];

/** En estabilización — no mezclar con consolidado. */
export const EXEC_JUN_STABILIZATION: ExecUnitRow[] = [
  { unidad: "JIN-11", campo: "COSTAYACO (estabilización ~19 días)", disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO" },
  { unidad: "JIN-12", campo: "COSTAYACO (estabilización ~19 días)", disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO" },
];

/** Tendencia solo con puntos reales May–Jun. */
export const EXEC_TREND_MAY_JUN = [
  {
    month: "May",
    availability: EXEC_MAY.availability,
    reliability: EXEC_MAY.reliability,
    mtbfHours: EXEC_MAY.mtbfHours,
    mttrHours: EXEC_MAY.mttrHours,
  },
  {
    month: "Jun",
    availability: EXEC_JUN.availability,
    reliability: EXEC_JUN.reliability,
    mtbfHours: EXEC_JUN.mtbfHours,
    mttrHours: EXEC_JUN.mttrHours,
  },
] as const;

export const EXEC_BLIND_SPOTS = [
  { name: "Capacidad de Potencia (PMC)", meta: "≥ PMC comprometida", status: "N/D — pendiente de fuente" },
  { name: "Eficiencia", meta: "≥ 37%", status: "N/D — pendiente de fuente" },
  { name: "Cumplimiento del Plan de Mantenimiento", meta: "100%", status: "N/D — pendiente de fuente" },
  { name: "Cumplimiento de Stock de Repuestos", meta: "100% (trimestral)", status: "N/D — pendiente de fuente" },
] as const;

export const EXEC_FOOTER =
  "Fuente: Análisis de Indicadores Copower PUTN Jun 2026 (Gran Tierra) + Data Soporte Cálculo Copower PUTN Junio 2026.xlsx + Orden de Servicio Costayaco (contrato). Cifras validadas — tablero ejecutivo junio 2026.";
