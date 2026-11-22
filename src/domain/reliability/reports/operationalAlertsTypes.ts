/** Alertas operacionales — tablero ejecutivo de planificación del próximo período. */

export const ALERT_CATEGORIES = [
  "Activo Crítico",
  "Mantenimiento Pendiente",
  "Repuesto Crítico",
  "Acción Vencida",
  "Disponibilidad Baja",
  "MTBF Decreciente",
  "MTTR Elevado",
  "Alta Frecuencia de Fallas",
  "RCA Pendiente",
  "Riesgo Operacional",
  "Condición del Equipo",
  "Sistema Eléctrico",
  "Sistema de Gas",
  "Operación",
  "Contrato",
  "Seguimiento de Acciones",
  "Indicadores",
] as const;

export type AlertCategory = (typeof ALERT_CATEGORIES)[number];

export const ALERT_PRIORITIES = ["Crítica", "Alta", "Media", "Baja"] as const;
export type AlertPriority = (typeof ALERT_PRIORITIES)[number];

export const ALERT_STATUSES = ["Activa", "En seguimiento", "Mitigada", "Cerrada"] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export type RiskLevel = "Bajo" | "Medio" | "Alto" | "Crítico";

export type OperationalAlert = {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  assetId: string;
  assetName: string;
  field: string;
  probability: number;
  impact: number;
  riskScore: number;
  riskLevel: RiskLevel;
  priority: AlertPriority;
  status: AlertStatus;
  recommendedAction: string;
  responsible: string;
  department: string;
  company: string;
  targetDate: string;
  origin: string;
  relatedIds: string[];
  indicators: string[];
  history: Array<{ date: string; note: string }>;
  createdAt: string;
  updatedAt: string;
};

export type MonthlyOperationalRisk = {
  id: string;
  month: string;
  year: number;
  riskType: string;
  description: string;
  affectedAssets: string[];
  probability: number;
  impact: number;
  riskLevel: RiskLevel;
  mitigationPlan: string;
  status: AlertStatus;
  createdAt: string;
};

export type PlanningPeriod = {
  key: string;
  label: string;
  year: number;
  monthName: string;
  /** Mes fuente de datos (histórico más reciente usado para proyectar). */
  sourceMonth: string;
};

export const PRIORITY_COLOR: Record<AlertPriority, string> = {
  Crítica: "#dc2626",
  Alta: "#ea580c",
  Media: "#ca8a04",
  Baja: "#15803d",
};

export const RISK_LEVEL_COLOR: Record<RiskLevel, string> = {
  Bajo: "#15803d",
  Medio: "#ca8a04",
  Alto: "#ea580c",
  Crítico: "#dc2626",
};

export const STATUS_COLOR: Record<AlertStatus, string> = {
  Activa: "#dc2626",
  "En seguimiento": "#2563eb",
  Mitigada: "#0f766e",
  Cerrada: "#64748b",
};

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 16) return "Crítico";
  if (score >= 10) return "Alto";
  if (score >= 5) return "Medio";
  return "Bajo";
}

export function priorityFromScore(score: number, category: AlertCategory): AlertPriority {
  if (score >= 16 || category === "Repuesto Crítico") return "Crítica";
  if (score >= 12) return "Alta";
  if (score >= 8) return "Media";
  return "Baja";
}

export const PLANNING_PERIODS: PlanningPeriod[] = [
  { key: "2026-07", label: "Julio 2026", year: 2026, monthName: "Julio", sourceMonth: "Jun" },
  { key: "2026-08", label: "Agosto 2026", year: 2026, monthName: "Agosto", sourceMonth: "Jun" },
  { key: "2026-09", label: "Septiembre 2026", year: 2026, monthName: "Septiembre", sourceMonth: "Jun" },
];
