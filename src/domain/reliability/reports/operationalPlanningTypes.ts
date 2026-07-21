import type { AlertPriority, AlertStatus, OperationalAlert, RiskLevel } from "./operationalAlertsTypes";

export type PlanStatus = "Borrador" | "Activo" | "En ejecución" | "Cerrado";

export type MonthlyOperationalPlan = {
  id: string;
  month: string;
  year: number;
  periodKey: string;
  overallRisk: RiskLevel;
  availabilityTarget: number;
  projectedAvailability: number;
  projectedMtbfPct: number;
  projectedMttrPct: number;
  projectedImpactPct: number;
  summary: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
};

export type OperationalPriority = {
  id: string;
  planId: string;
  title: string;
  category: string;
  assetId: string;
  assetName: string;
  priority: AlertPriority;
  probability: number;
  impact: number;
  riskLevel: RiskLevel;
  recommendedAction: string;
  responsible: string;
  targetDate: string;
  status: AlertStatus | "Pendiente" | "En ejecución";
  week: 1 | 2 | 3 | 4;
};

export type PlanCommitment = {
  id: string;
  title: string;
  targetDate: string;
  status: "Pendiente" | "En ejecución" | "Cumplido";
  owner: string;
  company: string;
};

export type PlanResource = {
  id: string;
  kind: "Repuesto" | "Personal" | "Herramienta" | "Servicio externo";
  name: string;
  detail: string;
  critical: boolean;
};

export type CriticalAssetRank = {
  assetId: string;
  score: number;
  reason: string;
};

export type OperationalPlanPack = {
  plan: MonthlyOperationalPlan;
  priorities: OperationalPriority[];
  risks: OperationalAlert[];
  openRisks: OperationalAlert[];
  alerts: OperationalAlert[];
  actionPlan: OperationalPriority[];
  commitments: PlanCommitment[];
  resources: PlanResource[];
  criticalAssets: CriticalAssetRank[];
  timeline: Array<{ week: 1 | 2 | 3 | 4; label: string; items: string[] }>;
  reportTitle: string;
};
