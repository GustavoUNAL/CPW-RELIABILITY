import { buildOperationalAlertsForPeriod } from "./buildOperationalAlerts";
import { GRAN_TIERRA_MONTHLY_DATA } from "./granTierraMonthly";
import { getPlanningCriticalSpares } from "./inventoryPlanningCritical";
import { JUNE_2026_IMPUTABLE_EVENTS } from "./juneImputableEvents";
import { PLANNING_PERIODS, type RiskLevel } from "./operationalAlertsTypes";
import type {
  CriticalAssetRank,
  OperationalPlanPack,
  OperationalPriority,
  PlanBaselineSnapshot,
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

function baselineFromSourceMonth(sourceMonth: string): PlanBaselineSnapshot {
  const snap = GRAN_TIERRA_MONTHLY_DATA[sourceMonth as keyof typeof GRAN_TIERRA_MONTHLY_DATA];
  const sistemaN = snap?.machineIndicators.find(
    (m) => m.unidad === "SISTEMA N" && m.campo === "COSTAYACO",
  );
  const availabilityPct =
    sistemaN?.disponibilidadPct ?? (snap?.kpi.availability != null ? snap.kpi.availability * 100 : 0);
  const reliabilityPct =
    sistemaN?.confiabilidadPct ?? (snap?.kpi.reliability != null ? snap.kpi.reliability * 100 : 0);
  const pfContr =
    sourceMonth === "Jun"
      ? JUNE_2026_IMPUTABLE_EVENTS.reduce((s, e) => s + e.hoursPfContr, 0)
      : (snap?.summary.hoursFailureCopower ?? 0);

  return {
    sourceMonth,
    sourceLabel: snap?.label ?? sourceMonth,
    availabilityPct: Number(availabilityPct.toFixed(2)),
    reliabilityPct: Number(reliabilityPct.toFixed(2)),
    copowerFailures: snap?.summary.copowerFailures ?? 0,
    mtbfHours: snap?.summary.mtbfHours ?? 0,
    mttrHours: snap?.summary.mttrHours ?? 0,
    pfContrHours: Number(pfContr.toFixed(2)),
    pfCliHours: snap?.summary.hoursFailureClient ?? 0,
    totalEvents: snap?.summary.totalEvents ?? snap?.eventLog.length ?? 0,
    meetsAvailability: availabilityPct >= 98,
  };
}

/** Consolida alertas + prioridades + compromisos en el plan ejecutivo del período. */
export function buildOperationalPlanForPeriod(periodKey: string): OperationalPlanPack {
  const { period, alerts, monthlyRisks } = buildOperationalAlertsForPeriod(periodKey);
  const planId = `MOP-${period.key}`;
  const baseline = baselineFromSourceMonth(period.sourceMonth);
  const monthNum = period.key.split("-")[1];

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
      title: "Cerrar seguimiento Q> / AVR CPW06 (RCA-004 · IP-GTE-004)",
      targetDate: `${period.year}-${monthNum}-05`,
      status: "Pendiente",
      owner: "Confiabilidad",
      company: "COPOWER",
    },
    {
      id: `${planId}-C2`,
      title: "PM / inspección MRU y plan NGL (RCA-006 · IP-GTE-006)",
      targetDate: `${period.year}-${monthNum}-10`,
      status: "En ejecución",
      owner: "Operaciones",
      company: "GTE",
    },
    {
      id: `${planId}-C3`,
      title: "Validar ajuste selectividad RL 8×/15× FO-44 (RCA-007 · IP-GTE-007)",
      targetDate: `${period.year}-${monthNum}-12`,
      status: "Pendiente",
      owner: "Eléctrico",
      company: "COPOWER",
    },
    {
      id: `${planId}-C4`,
      title: "Confirmar inventario flexibles escape CPW01 (RCA-002)",
      targetDate: `${period.year}-${monthNum}-08`,
      status: period.key === "2026-09" ? "Cumplido" : "En ejecución",
      owner: "Almacén",
      company: "COPOWER",
    },
    {
      id: `${planId}-C5`,
      title: `Revisión disponibilidad SISTEMA N — reunión ${period.monthName}`,
      targetDate: `${period.year}-${monthNum}-20`,
      status: "Pendiente",
      owner: "Ingeniería de Confiabilidad",
      company: "COPOWER",
    },
  ];

  const resources: PlanResource[] = [
    ...getPlanningCriticalSpares()
      .filter((s) => s.urgency === "Crítica" || s.urgency === "Alta")
      .slice(0, 6)
      .map((s, i) => ({
        id: `${planId}-RS${i + 1}`,
        kind: "Repuesto" as const,
        name: `${s.description} (${s.asset})`,
        detail: `${s.onHand}/${s.stockMin} exist./mín. · ${s.linkedEvent}`,
        critical: s.urgency === "Crítica" || s.onHand <= 0,
      })),
    {
      id: `${planId}-R3`,
      kind: "Personal",
      name: "Mecánico + Instrumentación + Eléctrico",
      detail: "Turnos coordinados semanas 1–3 · FO-44 / Q> / MRU",
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
      detail: "Coordinación operativa campo Costayaco · IP-GTE-006",
      critical: true,
    },
  ];

  const weekLabels = [
    { week: 1 as const, label: "Semana 1", focus: "Contención CPW06 Q> + stock escape CPW01" },
    { week: 2 as const, label: "Semana 2", focus: "MRU/NGL + validación selectividad FO-44" },
    { week: 3 as const, label: "Semana 3", focus: "Cierre RCA abiertos y CAPA críticas" },
    { week: 4 as const, label: "Semana 4", focus: "KPIs SISTEMA N y reunión GTE" },
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
  const gapToTarget = Math.max(0, 98 - baseline.availabilityPct);
  const projectedAvailability = Number(
    Math.min(99.2, baseline.availabilityPct + gapToTarget * 0.55 + (4 - riskWeight) * 0.15).toFixed(1),
  );
  const projectedMtbfPct = overallRisk === "Crítico" ? 6 : overallRisk === "Alto" ? 10 : 12;
  const projectedMttrPct = overallRisk === "Crítico" ? -5 : -8;
  const projectedImpactPct = overallRisk === "Crítico" ? -6 : -12;

  const topRiskTitles = monthlyRisks
    .slice(0, 3)
    .map((r) => r.description)
    .join("; ");

  const summaryBullets = [
    `Base ${baseline.sourceLabel}: SISTEMA N Costayaco en ${baseline.availabilityPct}% disp. / ${baseline.reliabilityPct}% conf. (meta ≥98%${baseline.meetsAvailability ? " · cumple" : " · no cumple"}).`,
    `${baseline.copowerFailures} fallas COPOWER · Σ PF_contr ${baseline.pfContrHours.toLocaleString("es-CO", { maximumFractionDigits: 2 })} h · MTBF ${baseline.mtbfHours.toLocaleString("es-CO")} h · MTTR ${baseline.mttrHours} h.`,
    `PF_cli ${baseline.pfCliHours.toLocaleString("es-CO")} h · ${baseline.totalEvents} eventos en bitácora · 28-jun externo (0,38 h) no imputable.`,
    `Outlook ${period.monthName}: riesgo ${overallRisk.toLowerCase()} · ${openRisks.length} riesgos altos/críticos abiertos · foco CPW06, MRU, FO-44 y stock CPW01.`,
  ];

  const summary = `Planeación operacional ${period.monthName} ${period.year} (base ${baseline.sourceLabel}): el parque presenta nivel de riesgo ${overallRisk.toLowerCase()}. Prioridades: ${topRiskTitles || "monitoreo rutinario"}. El plan integra alertas de activos críticos, CAPA, RCA/intervenciones y compromisos con Gran Tierra para recuperar disponibilidad ≥98% (junio cerró en ${baseline.availabilityPct}%).`;

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
      summaryBullets,
      status: period.key === PLANNING_PERIODS[0].key ? "Activo" : "Borrador",
      createdAt: `${period.year}-${monthNum}-01`,
      updatedAt: "2026-07-26",
    },
    baseline,
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
