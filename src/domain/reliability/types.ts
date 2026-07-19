export type KpiRow = {
  month: string;
  availability: number;
  reliability: number;
  maintainability: number;
  generationMwh: number;
  operationalLossesMwh: number;
  contractualCompliance: number;
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
  /** Bitácora total; null si el informe no la reporta. */
  totalEvents: number | null;
  mtbfHours: number;
  mttrHours: number;
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
  availability: number;
  reliability: number;
  mtbfHours: number;
  mttrHours: number;
};

export type CauseParetoRow = {
  cause: string;
  count: number;
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
  disponibilidadPct: number;
  confiabilidadPct: number;
  fallas: number;
  mtbfLabel: string;
  mttrHours: number;
  riesgoTecnico: "RIESGO BAJO" | "RIESGO MEDIO" | "RIESGO ALTO";
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
  maintenancePlan: MaintenanceRow[];
  actionPlan: ActionRow[];
  summary: SummaryMetrics;
  reliabilityTrend: ReliabilityTrendRow[];
  causePareto: CauseParetoRow[];
  generationByAsset: GenerationAssetRow[];
  generationByEquipment: GenerationByEquipmentRow[];
  totalGenerationKwh: number;
  eventLog: EventRecord[];
  machineIndicators: MachineIndicatorRow[];
};
