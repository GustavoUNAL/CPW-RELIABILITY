import { buildOperationalAlertsForPeriod } from "./buildOperationalAlerts";
import { PLANNING_PERIODS, type RiskLevel } from "./operationalAlertsTypes";
import type {
  CriticalAssetRank,
  OperationalPlanPack,
  OperationalPriority,
  PlanCommitment,
  PlanResource,
} from "./operationalPlanningTypes";

function riskRank(level: RiskLevel): number {
  return level === "Crítico" ? 4 : level === "Alto" ? 3 : level === "Medio" ? 2 : 1;
}

function weekFromDay(day: number): 1 | 2 | 3 | 4 {
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
}

/** Consolida alertas + prioridades + compromisos en el plan ejecutivo del período. */
export function buildOperationalPlanForPeriod(periodKey: string): OperationalPlanPack {
  const { period, alerts, monthlyRisks } = buildOperationalAlertsForPeriod(periodKey);
  const planId = `MOP-${period.key}`;

  const openRisks = alerts.filter(
    (a) =>
      (a.status === "Activa" || a.status === "En seguimiento") &&
      (a.riskLevel === "Alto" || a.riskLevel === "Crítico"),
  );

  const overallRisk: RiskLevel = openRisks.some((a) => a.riskLevel === "Crítico")
    ? "Crítico"
    : openRisks.some((a) => a.riskLevel === "Alto")
      ? "Alto"
      : alerts.some((a) => a.riskLevel === "Medio")
        ? "Medio"
        : "Bajo";

  const priorities: OperationalPriority[] = alerts
    .filter((a) => a.status !== "Cerrada")
    .slice(0, 12)
    .map((a, i) => {
      const day = Number(a.targetDate.slice(-2)) || 10 + i;
      return {
        id: `${planId}-P${i + 1}`,
        planId,
        title: a.recommendedAction,
        category: a.category,
        assetId: a.assetId,
        assetName: a.assetName,
        priority: a.priority,
        probability: a.probability,
        impact: a.impact,
        riskLevel: a.riskLevel,
        recommendedAction: a.recommendedAction,
        responsible: a.responsible,
        targetDate: a.targetDate,
        status:
          a.status === "Mitigada"
            ? "En seguimiento"
            : a.status === "En seguimiento"
              ? "En ejecución"
              : "Pendiente",
        week: weekFromDay(day),
      };
    });

  const actionPlan = [...priorities].sort(
    (a, b) =>
      (b.priority === "Crítica" ? 4 : b.priority === "Alta" ? 3 : b.priority === "Media" ? 2 : 1) -
        (a.priority === "Crítica" ? 4 : a.priority === "Alta" ? 3 : a.priority === "Media" ? 2 : 1) ||
      a.targetDate.localeCompare(b.targetDate),
  );

  const assetScores = new Map<string, CriticalAssetRank>();
  for (const a of alerts) {
    if (a.assetId === "PARQUE") continue;
    const prev = assetScores.get(a.assetId);
    const score = a.riskScore + (a.priority === "Crítica" ? 8 : a.priority === "Alta" ? 5 : 2);
    if (!prev || score > prev.score) {
      assetScores.set(a.assetId, {
        assetId: a.assetId,
        score: Math.min(100, score * 4),
        reason: a.title,
      });
    } else {
      assetScores.set(a.assetId, {
        ...prev,
        score: Math.min(100, prev.score + 6),
      });
    }
  }
  const criticalAssets = [...assetScores.values()].sort((a, b) => b.score - a.score).slice(0, 8);

  const commitments: PlanCommitment[] = [
    {
      id: `${planId}-C1`,
      title: "RCA / seguimiento estabilidad CPW06",
      targetDate: `${period.year}-${period.key.split("-")[1]}-05`,
      status: "Pendiente",
      owner: "Confiabilidad",
      company: "COPOWER",
    },
    {
      id: `${planId}-C2`,
      title: "PM / inspección MRU y plan NGL",
      targetDate: `${period.year}-${period.key.split("-")[1]}-10`,
      status: "En ejecución",
      owner: "Operaciones",
      company: "GTE",
    },
    {
      id: `${planId}-C3`,
      title: "Validar efectividad acciones potencia inversa (RCA-005)",
      targetDate: `${period.year}-${period.key.split("-")[1]}-08`,
      status: "Pendiente",
      owner: "Instrumentación",
      company: "COPOWER",
    },
    {
      id: `${planId}-C4`,
      title: "Confirmar inventario flexibles admisión CPW01",
      targetDate: `${period.year}-${period.key.split("-")[1]}-08`,
      status: period.key === "2026-09" ? "Cumplido" : "En ejecución",
      owner: "Almacén",
      company: "COPOWER",
    },
    {
      id: `${planId}-C5`,
      title: `Revisión disponibilidad parque — reunión ${period.monthName}`,
      targetDate: `${period.year}-${period.key.split("-")[1]}-20`,
      status: "Pendiente",
      owner: "Ingeniería de Confiabilidad",
      company: "COPOWER",
    },
  ];

  const resources: PlanResource[] = [
    {
      id: `${planId}-R1`,
      kind: "Repuesto",
      name: "Flexible / kit admisión CPW01",
      detail: "Stock crítico en cero — lead time 10–15 días",
      critical: true,
    },
    {
      id: `${planId}-R2`,
      kind: "Repuesto",
      name: "Componentes combustión / sensores gas CPW03",
      detail: "Reserva para validación post-detonación",
      critical: true,
    },
    {
      id: `${planId}-R3`,
      kind: "Personal",
      name: "Mecánico + Instrumentación + Eléctrico",
      detail: "Turnos coordinados semanas 1–3",
      critical: true,
    },
    {
      id: `${planId}-R4`,
      kind: "Herramienta",
      name: "Cámara termográfica / analizador vibraciones",
      detail: "Ruta predictiva flota CPW",
      critical: false,
    },
    {
      id: `${planId}-R5`,
      kind: "Servicio externo",
      name: "Soporte GTE — MRU / NGL",
      detail: "Coordinación operativa campo Costayaco",
      critical: true,
    },
  ];

  const weekLabels = [
    { week: 1 as const, label: "Semana 1", focus: "PM / contención activos críticos" },
    { week: 2 as const, label: "Semana 2", focus: "Inspección MRU y sistema de gas" },
    { week: 3 as const, label: "Semana 3", focus: "Validación RCA y CAPA" },
    { week: 4 as const, label: "Semana 4", focus: "Seguimiento KPIs y cierre compromisos" },
  ];

  const timeline = weekLabels.map((w) => ({
    week: w.week,
    label: w.label,
    items: [
      w.focus,
      ...actionPlan
        .filter((p) => p.week === w.week)
        .slice(0, 3)
        .map((p) => `${p.assetName}: ${p.title}`),
    ],
  }));

  const riskWeight = riskRank(overallRisk);
  const projectedAvailability = Number((98.4 + (4 - riskWeight) * 0.25).toFixed(1));
  const projectedMtbfPct = overallRisk === "Crítico" ? 8 : overallRisk === "Alto" ? 12 : 15;
  const projectedMttrPct = overallRisk === "Crítico" ? -6 : -10;
  const projectedImpactPct = overallRisk === "Crítico" ? -8 : -15;

  const topRiskTitles = monthlyRisks
    .slice(0, 3)
    .map((r) => r.description)
    .join("; ");

  const summary = `Planeación operacional ${period.monthName} ${period.year}: el parque presenta nivel de riesgo ${overallRisk.toLowerCase()}. Prioridades: ${topRiskTitles || "monitoreo rutinario"}. El plan integra alertas de activos críticos, CAPA abiertas, RCA/intervenciones y compromisos con Gran Tierra para proteger la meta de disponibilidad ≥98%.`;

  return {
    plan: {
      id: planId,
      month: period.monthName,
      year: period.year,
      periodKey: period.key,
      overallRisk,
      availabilityTarget: 98,
      projectedAvailability,
      projectedMtbfPct,
      projectedMttrPct,
      projectedImpactPct,
      summary,
      status: period.key === PLANNING_PERIODS[0].key ? "Activo" : "Borrador",
      createdAt: `${period.year}-${period.key.split("-")[1]}-01`,
      updatedAt: `${period.year}-${period.key.split("-")[1]}-01`,
    },
    priorities: actionPlan.slice(0, 8),
    risks: [...alerts].sort((a, b) => b.riskScore - a.riskScore).slice(0, 10),
    openRisks,
    alerts,
    actionPlan,
    commitments,
    resources,
    criticalAssets,
    timeline,
    reportTitle: `Planeación Operacional — ${period.monthName} ${period.year}`,
  };
}

export function planKpis(pack: OperationalPlanPack) {
  const alertsActive = pack.alerts.filter(
    (a) => a.status === "Activa" || a.status === "En seguimiento",
  ).length;
  const pendingActions = pack.actionPlan.filter((a) => a.status === "Pendiente").length;
  const criticalMto = pack.alerts.filter(
    (a) => a.category === "Mantenimiento Pendiente" && a.status !== "Cerrada",
  ).length;
  const rcaPending = pack.alerts.filter(
    (a) =>
      (a.origin.toLowerCase().includes("rca") || a.relatedIds.some((id) => id.startsWith("RCA"))) &&
      a.status !== "Cerrada" &&
      a.status !== "Mitigada",
  ).length;

  return {
    overallRisk: pack.plan.overallRisk,
    criticalAssets: pack.criticalAssets.length,
    alertsActive,
    priorities: pack.priorities.length,
    pendingActions,
    criticalMto,
    rcaPending,
    expectedCompliance: Math.round(
      (pack.plan.projectedAvailability / Math.max(pack.plan.availabilityTarget, 1)) * 100,
    ),
  };
}
