/** CAPA / Action Tracking — gestor centralizado de acciones. */

export const ACTION_TYPES = [
  "Correctiva",
  "Preventiva",
  "Predictiva",
  "Mejora",
  "Auditoría",
  "Operacional",
  "Capacitación",
  "Documental",
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

export const ACTION_ORIGINS = [
  "Evento",
  "RCA",
  "Plan de intervención",
  "Riesgo",
  "Auditoría",
  "Reunión",
  "Contrato",
  "Optimización",
  "Otro",
] as const;

export type ActionOrigin = (typeof ACTION_ORIGINS)[number];

export const ACTION_STATUSES = [
  "Pendiente",
  "Asignada",
  "En ejecución",
  "En validación",
  "Cerrada",
  "Vencida",
  "Cancelada",
] as const;

export type ActionStatus = (typeof ACTION_STATUSES)[number];

export const ACTION_PRIORITIES = ["Crítica", "Alta", "Media", "Baja"] as const;
export type ActionPriority = (typeof ACTION_PRIORITIES)[number];

export type EffectivenessLevel = "Alta" | "Media" | "Baja" | "Pendiente";
export type VerificationStatus = "Pendiente" | "Verificada" | "No conforme";

export type ActionEvidence = {
  id: string;
  actionId: string;
  fileName: string;
  fileUrl: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
};

export type ActionComment = {
  id: string;
  actionId: string;
  comment: string;
  author: string;
  createdAt: string;
};

export type ActionVerification = {
  implemented: boolean | null;
  fieldVerified: boolean | null;
  causeEliminated: "Sí" | "Parcialmente" | "No" | null;
};

export type CorrectiveAction = {
  id: string;
  title: string;
  description: string;
  actionType: ActionType;
  origin: ActionOrigin;
  originId: string;
  assetId: string;
  assetName: string;
  field: string;
  priority: ActionPriority;
  responsible: string;
  department: string;
  company: string;
  startDate: string;
  dueDate: string;
  closeDate: string | null;
  lastUpdate: string;
  status: ActionStatus;
  progress: number;
  effectiveness: EffectivenessLevel;
  verificationStatus: VerificationStatus;
  verification: ActionVerification;
  comments: ActionComment[];
  evidences: ActionEvidence[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export const PRIORITY_COLOR: Record<ActionPriority, string> = {
  Crítica: "#dc2626",
  Alta: "#ea580c",
  Media: "#ca8a04",
  Baja: "#15803d",
};

export const STATUS_COLOR: Record<ActionStatus, string> = {
  Pendiente: "#64748b",
  Asignada: "#2563eb",
  "En ejecución": "#0f766e",
  "En validación": "#7c3aed",
  Cerrada: "#15803d",
  Vencida: "#dc2626",
  Cancelada: "#94a3b8",
};

export function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T12:00:00`);
  const b = new Date(`${to}T12:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function computeEffectiveness(v: ActionVerification): EffectivenessLevel {
  if (v.implemented == null || v.fieldVerified == null || v.causeEliminated == null) {
    return "Pendiente";
  }
  if (!v.implemented || !v.fieldVerified || v.causeEliminated === "No") return "Baja";
  if (v.causeEliminated === "Parcialmente") return "Media";
  return "Alta";
}

/** Aplica reglas de negocio: vencimiento, etc. */
export function applyActionRules(action: CorrectiveAction, today = "2026-07-21"): CorrectiveAction {
  let status = action.status;
  if (status !== "Cerrada" && status !== "Cancelada" && action.dueDate < today) {
    status = "Vencida";
  }
  const effectiveness = computeEffectiveness(action.verification);
  let verificationStatus = action.verificationStatus;
  if (effectiveness === "Alta") verificationStatus = "Verificada";
  else if (effectiveness === "Baja" && action.status === "Cerrada") verificationStatus = "No conforme";

  return { ...action, status, effectiveness, verificationStatus };
}
