import type { ReportDataset } from "../types";
import { COPOWER_KPI_FROM_MONTHS, COPOWER_MONTHLY_DATA } from "./copowerMonthly";

const jul = COPOWER_MONTHLY_DATA.Jul;

export const copowerReport: ReportDataset = {
  title: "COPOWER",
  subtitle:
    "Horas concertadas GTE 01–31 julio 2026 (eventos e indicadores). Meses previos: reporte diario Costayaco/Vonú.",
  source: COPOWER_MONTHLY_DATA.Jul.sourceFile,
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
  summary: jul.summary,
  reliabilityTrend: COPOWER_KPI_FROM_MONTHS.map((row) => ({
    month: row.month,
    availability: row.availability ?? 0,
    reliability: row.reliability ?? 0,
    mtbfHours: COPOWER_MONTHLY_DATA[row.month as keyof typeof COPOWER_MONTHLY_DATA]?.summary.mtbfHours ?? 0,
    mttrHours: COPOWER_MONTHLY_DATA[row.month as keyof typeof COPOWER_MONTHLY_DATA]?.summary.mttrHours ?? 0,
  })),
  causePareto: [],
  analysisHighlights: [
    "Julio: 5 FO-GE-033 oficiales (MRU 12/21/24/25 + detonación CPW-04 21-jul). Concertación imputa 3 fallas COPOWER (CPW06×2 el 04 y 09; CPW07 el 04). MTBF 2.410,67 h.",
    "Energía julio 4.131.917 kWh · OP 7.232 h · SB 3.676 h · PP 253 h · paradas externas 547 h.",
    "Disp. COPOWER (OP+SB)/calendario = 97,73%. GTE publica 80,65% con la misma fórmula; falta el desglose de horas no disponibles (AGC4 no cierra solo la brecha).",
  ],
  generationByAsset: jul.generationByAsset,
  generationByEquipment: jul.generationByEquipment,
  totalGenerationKwh: jul.totalGenerationKwh,
  eventLog: jul.eventLog,
  machineIndicators: jul.machineIndicators,
};
