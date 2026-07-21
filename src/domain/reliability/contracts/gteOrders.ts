export type PenaltyBand = {
  rangeLabel: string;
  minInclusive: number;
  maxExclusive: number;
  deductionPct: number;
  terminationRisk: boolean;
};

export type ContractCalcRow = {
  indicator: string;
  formula: string;
  frequency: string;
  threshold: string;
  consequence: string;
  tone?: "ok" | "warn" | "risk" | "info";
};

export type ContractFrameworkRow = {
  order: string;
  scope: string;
  reliabilityRole: string;
  vigency: string;
  note: string;
  tone: "ok" | "info" | "warn";
};

export type ContractOverviewRow = {
  order: string;
  sourceFile: string;
  object: string;
  term: string;
  estimatedValue: string;
  appliesToReliability: string;
  tone: "ok" | "info" | "warn";
};

export type ContractOrderSummary = {
  id: "orden_1" | "orden_2" | "orden_3";
  shortName: string;
  sourceFile: string;
  title: string;
  fields: string;
  term: string;
  estimatedValueLabel: string;
  penaltyClauseAmount: string;
  hasPerformanceTable: boolean;
  note?: string;
};

/** Escala contractual de deducción por confiabilidad (Orden 1). */
export const RELIABILITY_DEDUCTION_BANDS: PenaltyBand[] = [
  { rangeLabel: "≥ 98%", minInclusive: 0.98, maxExclusive: 1.01, deductionPct: 0, terminationRisk: false },
  { rangeLabel: "96 – 97.99%", minInclusive: 0.96, maxExclusive: 0.98, deductionPct: 4, terminationRisk: false },
  { rangeLabel: "94 – 95.99%", minInclusive: 0.94, maxExclusive: 0.96, deductionPct: 8, terminationRisk: false },
  { rangeLabel: "92 – 93.99%", minInclusive: 0.92, maxExclusive: 0.94, deductionPct: 12, terminationRisk: false },
  { rangeLabel: "90 – 91.99%", minInclusive: 0.9, maxExclusive: 0.92, deductionPct: 16, terminationRisk: false },
  { rangeLabel: "88 – 89.99%", minInclusive: 0.88, maxExclusive: 0.9, deductionPct: 20, terminationRisk: false },
  { rangeLabel: "85 – 87.99%", minInclusive: 0.85, maxExclusive: 0.88, deductionPct: 24, terminationRisk: false },
  { rangeLabel: "82 – 84.99%", minInclusive: 0.82, maxExclusive: 0.85, deductionPct: 28, terminationRisk: false },
  { rangeLabel: "80 – 81.99%", minInclusive: 0.8, maxExclusive: 0.82, deductionPct: 32, terminationRisk: false },
  { rangeLabel: "< 80%", minInclusive: 0, maxExclusive: 0.8, deductionPct: 100, terminationRisk: true },
];

export const SHUTDOWN_PENALTY_BANDS = [
  { events: 0, deductionPct: 0, terminationRisk: false },
  { events: 1, deductionPct: 10, terminationRisk: false },
  { events: 2, deductionPct: 20, terminationRisk: false },
  { events: 3, deductionPct: 30, terminationRisk: false },
  { events: 4, deductionPct: 40, terminationRisk: false },
  { events: 5, deductionPct: 100, terminationRisk: true },
];

/** Metas contractuales Orden 1 que sí tienen umbral numérico. */
export const CONTRACTUAL_KPI_TARGETS = {
  availability: 0.98,
  reliability: 0.98,
  efficiencyPct: 37,
  maintenanceCompliancePct: 100,
  criticalSparesPct: 100,
} as const;

export function getReliabilityDeduction(reliability: number) {
  const band =
    RELIABILITY_DEDUCTION_BANDS.find(
      (item) => reliability >= item.minInclusive && reliability < item.maxExclusive,
    ) ?? RELIABILITY_DEDUCTION_BANDS[RELIABILITY_DEDUCTION_BANDS.length - 1];
  return band;
}

export function getShutdownDeduction(events: number) {
  if (events >= 5) return SHUTDOWN_PENALTY_BANDS[SHUTDOWN_PENALTY_BANDS.length - 1];
  return SHUTDOWN_PENALTY_BANDS.find((item) => item.events === events) ?? SHUTDOWN_PENALTY_BANDS[0];
}

/** Marco vigente que alimenta el tablero (solo Orden 1). */
export const CONTRACT_FRAMEWORK: ContractFrameworkRow[] = [
  {
    order: "Orden 1",
    scope: "Generación 8MW — Costayaco + Vonú",
    reliabilityRole:
      "Sí — Disponibilidad/Confiabilidad de sistema ≥98%, MTBF/MTTR, bandas de deducción, shutdowns O&M",
    vigency: "Activa (3 años desde acta de inicio)",
    note: "Fuente única de metas y multas para este tablero",
    tone: "ok",
  },
];

/** Panorama de las 3 órdenes — contexto; no mezclar Órdenes 2/3 en el cálculo. */
export const CONTRACT_ORDERS_OVERVIEW: ContractOverviewRow[] = [
  {
    order: "Orden 1",
    sourceFile: "costayaco.pdf",
    object: "Generación 8MW a gas, Costayaco + Vonú",
    term: "3 años desde acta de inicio",
    estimatedValue: "COP $5.000 MM (cláusula penal 15% = $750 MM)",
    appliesToReliability: "Sí — es la fuente de este análisis",
    tone: "ok",
  },
  {
    order: "Orden 2",
    sourceFile: "vonus.pdf",
    object: "Renta de generadores diésel/gas y equipos periféricos, Costayaco + Vonú",
    term: "13 meses desde acta de inicio",
    estimatedValue: "COP $3.000 MM (cláusula penal 15% = $450 MM)",
    appliesToReliability:
      "No — sin tabla de indicadores ni multas de confiabilidad, solo tarifas y pólizas",
    tone: "info",
  },
  {
    order: "Orden 3",
    sourceFile: "CW6187",
    object: "Disponibilidad por máquina, Putumayo Norte/Sur y VMM",
    term: "6 meses desde oct-2025 (vence abr-2026)",
    estimatedValue: "COP $500 MM (cláusula penal 15%)",
    appliesToReliability:
      "No aplica a este tablero — otro nivel (por unidad, no sistema); vigencia actual no confirmada",
    tone: "warn",
  },
];

export const CONTRACT_FRAMEWORK_INTRO =
  "Base normativa: la Orden 1 es el instrumento que rige este análisis — define las metas de Disponibilidad y Confiabilidad de sistema, MTBF/MTTR, las bandas de deducción por confiabilidad y el esquema de multas por shutdowns, reportes y reincidencia.";

export const CONTRACT_FRAMEWORK_CONCLUSION =
  "Conclusión para el dashboard: el marco contractual vigente que gobierna Disponibilidad, Confiabilidad, MTBF, MTTR y las penalidades del Sistema Costayaco/Vonú es exclusivamente la Orden 1. Las Órdenes 2 y 3 coexisten en la relación comercial con COPOWER pero no aportan (ni deben mezclarse con) los indicadores de confiabilidad de este informe — la Orden 2 porque no tiene esa sección, y la Orden 3 porque mide a otro nivel (máquina, no sistema) y su vigencia está pendiente de confirmar con Gran Tierra.";

/**
 * 2. Tabla única de indicadores de confiabilidad — solo Orden 1 (la que aplica).
 */
export const CONTRACT_CALC_BASE: ContractCalcRow[] = [
  {
    indicator: "Disponibilidad Operacional",
    formula: "(Horas disponibles / Horas programadas) × 100",
    frequency: "Mensual",
    threshold: "≥ 98%",
    consequence: "No facturación de equipos no disponibles + cobro de energía suplida por otra fuente",
    tone: "risk",
  },
  {
    indicator: "Confiabilidad del Sistema",
    formula: "Cálculo individual + en paralelo",
    frequency: "Mensual",
    threshold: "≥ 98%",
    consequence: "Deducción escalonada (tabla de bandas)",
    tone: "risk",
  },
  {
    indicator: "MTBF",
    formula: "Horas operativas / N° de fallas",
    frequency: "Mensual",
    threshold: "Sin cifra fija, solo seguimiento",
    consequence: "Se refleja indirectamente en Confiabilidad",
    tone: "info",
  },
  {
    indicator: "MTTR",
    formula: "Σ tiempo de reparación / N° de fallas",
    frequency: "Mensual",
    threshold: "Sin cifra fija, solo seguimiento",
    consequence: "Se refleja indirectamente en Confiabilidad",
    tone: "info",
  },
  {
    indicator: "N° de Shutdowns/mes (asociados a O&M)",
    formula: "Conteo de apagones de campo",
    frequency: "Mensual",
    threshold: "Ideal: 0",
    consequence: "0=0%, 1=10%, 2=20%, 3=30%, 4=40%, 5+=terminación anticipada",
    tone: "risk",
  },
  {
    indicator: "Capacidad de Potencia (PMC)",
    formula: "Prueba de carga / potencia medida",
    frequency: "Mensual",
    threshold: "≥ PMC comprometida",
    consequence: "Reducción proporcional en facturación",
    tone: "info",
  },
  {
    indicator: "Eficiencia",
    formula: "%Eff = 3412 / Heat Rate medido",
    frequency: "Mensual",
    threshold: "≥ 37%",
    consequence: "Cobro del diferencial de energía no entregada",
    tone: "info",
  },
  {
    indicator: "Cumplimiento del Plan de Mantenimiento",
    formula: "Ejecutadas / planificadas × 100",
    frequency: "Mensual",
    threshold: "100%",
    consequence: "Base para exigir plan de acción formal",
    tone: "warn",
  },
  {
    indicator: "Cumplimiento de Stock de Repuestos",
    formula: "Repuestos en stock / requeridos × 100",
    frequency: "Trimestral",
    threshold: "100%",
    consequence: "5% de la facturación mensual",
    tone: "warn",
  },
  {
    indicator: "Reportes de falla (RCA/informe)",
    formula: "Entrega documentada por evento",
    frequency: "Por evento",
    threshold: "Obligatorio",
    consequence: "4% de la facturación mensual si falta",
    tone: "risk",
  },
  {
    indicator: "Informes diarios",
    formula: "Entrega documentada",
    frequency: "Diario",
    threshold: "Obligatorio",
    consequence: "2% de la facturación mensual si falta",
    tone: "warn",
  },
  {
    indicator: "Reincidencia de incumplimientos",
    formula: "Repetición del mismo indicador",
    frequency: "3 meses consecutivos",
    threshold: "No repetir",
    consequence: "Ejecución de pólizas + terminación anticipada",
    tone: "risk",
  },
];

export const GTE_CONTRACT_ORDERS: ContractOrderSummary[] = [
  {
    id: "orden_1",
    shortName: "Orden 1",
    sourceFile: "data/contratos/costayaco.pdf",
    title: "Generación 8MW — Costayaco + Vonú",
    fields: "Costayaco y Vonú",
    term: "3 años desde acta de inicio",
    estimatedValueLabel: "COP $5.000.000.000",
    penaltyClauseAmount: "15% = COP $750 MM",
    hasPerformanceTable: true,
    note: "Única orden que rige Disp/Conf de sistema ≥98%, bandas, shutdowns O&M, eficiencia, PMC, reportes y reincidencia.",
  },
  {
    id: "orden_2",
    shortName: "Orden 2",
    sourceFile: "data/contratos/vonus.pdf",
    title: "Renta de equipos diésel/gas — Costayaco + Vonú",
    fields: "Costayaco y Vonú",
    term: "13 meses desde acta de inicio",
    estimatedValueLabel: "COP $3.000.000.000",
    penaltyClauseAmount: "15% = COP $450 MM",
    hasPerformanceTable: false,
    note: "Sin tabla de Disp/Conf ni multas por confiabilidad. Solo tarifas y pólizas.",
  },
  {
    id: "orden_3",
    shortName: "Orden 3",
    sourceFile: "CW6187 (verificar documento)",
    title: "Disponibilidad por máquina / tipología de fallas",
    fields: "Putumayo Norte/Sur/VMM",
    term: "Venció abr-2026 — verificar prórroga",
    estimatedValueLabel: "N/D en carpeta actual",
    penaltyClauseAmount: "Tarifa standby / día (según cláusula)",
    hasPerformanceTable: true,
    note: "Fuera del análisis de sistema. Pendiente validar vigencia; no usar para Costayaco/Vonú sistémico.",
  },
];

/** Alias legacy. */
export type ContractOrder = ContractOrderSummary;
export type ContractTableRow = ContractCalcRow;
