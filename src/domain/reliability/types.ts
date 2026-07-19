export type KpiRow = {
  month: string;
  /** null si no hay anexo/informe oficial de Disp. para el mes. */
  availability: number | null;
  /** null si no hay anexo/informe oficial de Conf. para el mes. */
  reliability: number | null;
  /** null: la mantenibilidad no se publica en fuentes GTE. */
  maintainability: number | null;
  generationMwh: number;
  /** null si no hay dato oficial de pérdidas. */
  operationalLossesMwh: number | null;
  /** null si no hay evaluación contractual documentada. */
  contractualCompliance: number | null;
};

export type Deviation = {
  indicator: string;
  value: number;
  target: number;
  technicalExplanation: string;
};

export type BadActor = {
  equipment: string;
  system: string;
  criticality: "Alta" | "Media" | "Baja";
  frequency: number;
  knownCause: string;
  generationImpactMwh: number;
  unavailabilityHours: number;
};

export type MaintenanceRow = {
  id: string;
  system: string;
  type: "Preventivo" | "Predictivo" | "Correctivo";
  proposal: string;
  basis: string;
  manufacturerRecommendation: string;
};

export type ActionRow = {
  id: string;
  action: string;
  owner: string;
  dueDate: string;
  status: "Pendiente" | "En curso" | "Completada";
  evidence: string;
  expectedResult: string;
};

export type RcaRow = {
  status: string;
  value: number;
  color: string;
};

export type SummaryMetrics = {
  copowerFailures: number;
  /** Bitácora total; null si el informe no la reporta como KPI oficial. */
  totalEvents: number | null;
  /** null si no hay MTBF oficial publicado para el mes. */
  mtbfHours: number | null;
  /** null si no hay MTTR oficial publicado para el mes. */
  mttrHours: number | null;
  /** null si el informe no reporta acciones vencidas. */
  actionsOverdue: number | null;
  /** null si el informe no reporta RCA pendientes. */
  rcaPending: number | null;
  hoursOperated: number;
  hoursStandby: number;
  hoursPreventive: number;
  hoursCorrective: number;
  hoursFailureCopower: number;
  hoursFailureClient: number;
  /** Gas Costayaco (kWh), alineado al desglose del informe. */
  energyGasKwh: number;
  energyDieselKwh: number;
};

export type ReliabilityTrendRow = {
  month: string;
  availability: number | null;
  reliability: number | null;
  mtbfHours: number | null;
  mttrHours: number | null;
};

export type CauseParetoRow = {
  cause: string;
  count: number;
  hoursPfClient?: number;
  unitsAffected?: string;
};

export type RcaCase = {
  id: string;
  equipment: string;
  failureMode: string;
  eventDates: string;
  status: "Pendiente" | "En curso" | "Cerrado";
  priority: "Alta" | "Media" | "Baja";
  owner: string;
  finding: string;
};

export type CommonCauseEvent = {
  date: string;
  description: string;
  systemsAffected: string;
};

export type GenerationAssetRow = {
  asset: string;
  gasKwh: number;
  dieselKwh: number;
};

export type GenerationByEquipmentRow = {
  equipo: string;
  campo: string;
  energiaKwh: number;
  horasOperacion: number;
  horasStandBy: number;
  horasPP: number;
  horasPFContr: number;
  horasPFCli: number;
  horasCalDia: number;
  fallaEvento: number;
};

export type MachineIndicatorRow = {
  unidad: string;
  campo: string;
  /** null cuando el informe no publica stand-by (p. ej. unidades en estabilizacion). */
  horasStandBy: number | null;
  /** null si no hay % oficial (sin anexo de indicadores). */
  disponibilidadPct: number | null;
  confiabilidadPct: number | null;
  fallas: number;
  mtbfLabel: string;
  mttrHours: number | null;
  riesgoTecnico: "RIESGO BAJO" | "RIESGO MEDIO" | "RIESGO ALTO" | "N/A";
  cumplimiento: "CUMPLE" | "NO CUMPLE" | "N/A";
  /** Nota del anexo / criterio de imputabilidad. */
  detalle?: string;
};

export type EventRecord = {
  date: string;
  equipment: string;
  eventType: "Falla" | "Causa comun" | "Operativo";
  cause: string;
  downtimeHours: number;
  responsible: "COPOWER" | "Cliente" | "Externo";
  notes: string;
};

export type PageKey =
  | "resumen"
  | "compromiso"
  | "indicadores"
  | "maquinas"
  | "generacion"
  | "desviaciones"
  | "malos_actores"
  | "causas_raiz"
  | "mantenimiento"
  | "riesgos"
  | "acciones";

export type ReportKey = "gran_tierra" | "copower_interno";

export type ReportDataset = {
  title: string;
  subtitle: string;
  source?: string;
  kpiData: KpiRow[];
  kpiTargets: {
    availability: number;
    reliability: number;
    maintainability: number;
    generationMwh: number;
    operationalLossesMwh: number;
    contractualCompliance: number;
  };
  badActors: BadActor[];
  rca: RcaRow[];
  rcaCases: RcaCase[];
  commonCauseEvents: CommonCauseEvent[];
  maintenancePlan: MaintenanceRow[];
  actionPlan: ActionRow[];
  summary: SummaryMetrics;
  reliabilityTrend: ReliabilityTrendRow[];
  causePareto: CauseParetoRow[];
  analysisHighlights: string[];
  generationByAsset: GenerationAssetRow[];
  generationByEquipment: GenerationByEquipmentRow[];
  totalGenerationKwh: number;
  eventLog: EventRecord[];
  machineIndicators: MachineIndicatorRow[];
};
