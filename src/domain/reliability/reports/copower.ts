import type { ReportDataset } from "../types";
import { COPOWER_KPI_FROM_MONTHS, COPOWER_MONTHLY_DATA, COPOWER_SOURCE_FILE } from "./copowerMonthly";

const jun = COPOWER_MONTHLY_DATA.Jun;

export const copowerReport: ReportDataset = {
  title: "COPOWER",
  subtitle:
    "Reporte diario de operaciones Costayaco / Vonú. Fuente: Resumen OP, Eventos de Generación y Consumos.",
  source: COPOWER_SOURCE_FILE,
  kpiData: COPOWER_KPI_FROM_MONTHS,
  kpiTargets: {
    availability: 0.98,
    reliability: 0.98,
    maintainability: 0,
    generationMwh: 4000,
    operationalLossesMwh: 0,
    contractualCompliance: 0.98,
  },
  badActors: [],
  rca: [
    { status: "Pendiente", value: 0, color: "#fb7185" },
    { status: "En curso", value: 0, color: "#f59e0b" },
    { status: "Cerrado", value: 0, color: "#22c55e" },
  ],
  rcaCases: [],
  commonCauseEvents: [],
  maintenancePlan: [],
  actionPlan: [],
  summary: jun.summary,
  reliabilityTrend: COPOWER_KPI_FROM_MONTHS.map((row) => ({
    month: row.month,
    availability: row.availability ?? 0,
    reliability: row.reliability ?? 0,
    mtbfHours: COPOWER_MONTHLY_DATA[row.month as keyof typeof COPOWER_MONTHLY_DATA]?.summary.mtbfHours ?? 0,
    mttrHours: COPOWER_MONTHLY_DATA[row.month as keyof typeof COPOWER_MONTHLY_DATA]?.summary.mttrHours ?? 0,
  })),
  causePareto: [],
  analysisHighlights: [
    "Datos operativos COPOWER desde el reporte diario Costayaco/Vonú 2026.",
    "Disponibilidad calculada con horas OP+SB sobre OP+SB+MTO+FS (Resumen OP).",
    "Eventos tomados de la hoja Eventos de Generación (disponibles con mayor detalle desde mayo).",
  ],
  generationByAsset: jun.generationByAsset,
  generationByEquipment: jun.generationByEquipment,
  totalGenerationKwh: jun.totalGenerationKwh,
  eventLog: jun.eventLog,
  machineIndicators: jun.machineIndicators,
};
