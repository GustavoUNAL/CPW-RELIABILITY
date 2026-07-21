/**
 * Motor rule-based de degradación y riesgo.
 * Diseñado para sustituir/extender con ML sin cambiar el contrato AssetHealth.
 */

import {
  degradationFromHealth,
  healthBandFromIndex,
  riskLevelFromScore,
  type AssetHealth,
  type AssetHealthStatus,
  type AutoRecommendation,
  type CriticalityLevel,
  type MonthlyPoint,
  type RiskAssessment,
  type TrendDirection,
} from "./degradationRiskTypes";

export type AssetSeedMeta = {
  assetId: string;
  assetName: string;
  field: string;
  criticality: CriticalityLevel;
  linkedRcaIds?: string[];
  linkedPlanIds?: string[];
  linkedMsoIds?: string[];
  /** Serie mensual precalculada (si no se pasa, el builder la arma). */
  series: MonthlyPoint[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Tendencia simple: compara promedio de la 1ª mitad vs 2ª mitad. */
export function detectTrend(
  values: Array<number | null | undefined>,
  higherIsBetter: boolean,
): TrendDirection {
  const nums = values.filter((v): v is number => v != null && Number.isFinite(v));
  if (nums.length < 2) return "estable";
  const mid = Math.floor(nums.length / 2);
  const first = nums.slice(0, mid);
  const second = nums.slice(mid);
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const a = avg(first);
  const b = avg(second);
  const delta = a === 0 ? b : (b - a) / Math.abs(a);
  if (Math.abs(delta) < 0.05) return "estable";
  const rising = delta > 0;
  if (higherIsBetter) return rising ? "creciente" : "decreciente";
  return rising ? "decreciente" : "creciente";
}

/** Tendencia raw (sin invertir): creciente = valores suben. */
export function detectRawTrend(values: Array<number | null | undefined>): TrendDirection {
  const nums = values.filter((v): v is number => v != null && Number.isFinite(v));
  if (nums.length < 2) return "estable";
  const mid = Math.floor(nums.length / 2);
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const a = avg(nums.slice(0, mid));
  const b = avg(nums.slice(mid));
  const delta = a === 0 ? b : (b - a) / Math.abs(a);
  if (Math.abs(delta) < 0.05) return "estable";
  return delta > 0 ? "creciente" : "decreciente";
}

export function mtbfChangePct(series: MonthlyPoint[]): number | null {
  const vals = series.map((s) => s.mtbfHours).filter((v): v is number => v != null && v > 0);
  if (vals.length < 2) return null;
  const first = vals[0];
  const last = vals[vals.length - 1];
  return ((last - first) / first) * 100;
}

/**
 * Asset Health Index 0–100.
 * Pesos: disponibilidad, MTBF, MTTR, fallas, impacto, criticidad.
 */
export function computeHealthIndex(input: {
  availabilityPct: number;
  mtbfHours: number | null;
  mttrHours: number;
  failures: number;
  impactIndex: number;
  criticality: CriticalityLevel;
}): number {
  const avail = clamp(((input.availabilityPct - 90) / 10) * 100, 0, 100);
  const mtbf =
    input.mtbfHours == null || input.mtbfHours <= 0
      ? 95
      : clamp((input.mtbfHours / 720) * 100, 0, 100);
  const mttr = clamp(100 - input.mttrHours * 10, 0, 100);
  const fail = clamp(100 - input.failures * 20, 0, 100);
  const impact = clamp(100 - input.impactIndex * 10, 0, 100);
  const crit =
    input.criticality === "Muy Alta"
      ? 60
      : input.criticality === "Alta"
        ? 75
        : input.criticality === "Media"
          ? 88
          : 95;

  return Math.round(
    0.25 * avail + 0.2 * mtbf + 0.15 * mttr + 0.2 * fail + 0.1 * impact + 0.1 * crit,
  );
}

function probabilityFromSignals(input: {
  failures: number;
  availabilityPct: number;
  mtbfTrend: TrendDirection;
  failuresTrend: TrendDirection;
  impactIndex: number;
}): number {
  let p = 2;
  if (input.failures >= 3) p += 2;
  else if (input.failures >= 1) p += 1;
  if (input.availabilityPct < 98) p += 1;
  if (input.mtbfTrend === "decreciente") p += 1;
  if (input.failuresTrend === "creciente") p += 1;
  if (input.impactIndex > 6) p += 1;
  return clamp(p, 1, 5);
}

function impactFromCriticality(criticality: CriticalityLevel, impactIndex: number): number {
  const base =
    criticality === "Muy Alta" ? 5 : criticality === "Alta" ? 4 : criticality === "Media" ? 3 : 2;
  if (impactIndex > 8) return clamp(base + 1, 1, 5);
  if (impactIndex < 3) return clamp(base - 1, 1, 5);
  return base;
}

function statusFromSignals(
  healthIndex: number,
  riskScore: number,
  degradation: AssetHealth["degradationLevel"],
): AssetHealthStatus {
  if (riskScore >= 20 || degradation === "Crítica") return "Riesgo alto";
  if (healthIndex < 60) return "Intervención";
  if (degradation === "Severa" || degradation === "Moderada") return "Degradación";
  if (healthIndex < 80 || riskScore >= 10) return "En observación";
  if (healthIndex >= 90) return "Saludable";
  return "Recuperación";
}

export function buildAutoRecommendations(input: {
  assetId: string;
  availabilityPct: number;
  mtbfChangePct: number | null;
  mttrTrend: TrendDirection;
  failures: number;
  impactIndex: number;
  healthIndex: number;
  riskScore: number;
}): AutoRecommendation[] {
  const out: AutoRecommendation[] = [];
  let n = 1;
  const push = (
    trigger: string,
    recommendation: string,
    priority: AutoRecommendation["priority"],
  ) => {
    out.push({ id: `${input.assetId}-AR${n++}`, trigger, recommendation, priority });
  };

  if (input.availabilityPct < 98) {
    push("Disponibilidad <98%", "Revisar estrategia de mantenimiento", "Alta");
  }
  if (input.mtbfChangePct != null && input.mtbfChangePct <= -15) {
    push("MTBF ↓ >15%", "Programar inspección detallada", "Alta");
  }
  if (input.mttrTrend === "creciente") {
    push("MTTR creciente", "Analizar mantenibilidad del activo", "Media");
  }
  if (input.failures >= 3) {
    push("≥3 fallas repetitivas", "Ejecutar RCA", "Crítica");
  }
  if (input.impactIndex > 6) {
    push("Índice de impacto >6", "Crear Plan de Intervención", "Alta");
  }
  if (input.healthIndex < 70) {
    push("Health Index <70", "Activar alerta de degradación y priorizar evaluación", "Crítica");
  }
  if (input.riskScore > 15) {
    push("Risk Score >15", "Generar recomendación de mitigación inmediata", "Crítica");
  }
  if (input.riskScore > 20) {
    push("Risk Score >20", "Alerta crítica: intervención prioritaria del activo", "Crítica");
  }
  return out;
}

function buildAssessments(
  assetHealthId: string,
  assetId: string,
  probability: number,
  impact: number,
  riskScore: number,
  recommendations: AutoRecommendation[],
): RiskAssessment[] {
  if (recommendations.length === 0) {
    return [
      {
        id: `${assetHealthId}-RA1`,
        assetHealthId,
        hazard: `Condición residual ${assetId}`,
        cause: "Variabilidad operativa normal",
        consequence: "Sin impacto material esperado a corto plazo",
        probability: Math.max(1, probability - 1),
        impact: Math.max(1, impact - 1),
        risk: Math.max(1, (probability - 1) * (impact - 1)),
        riskLevel: riskLevelFromScore(Math.max(1, (probability - 1) * (impact - 1))),
        recommendation: "Mantener monitoreo de tendencias",
        priority: "Baja",
        status: "Abierta",
        createdAt: "2026-06-30",
        autoGenerated: true,
      },
    ];
  }

  return recommendations.slice(0, 3).map((r, i) => {
    const p = clamp(probability - (i === 0 ? 0 : 1), 1, 5);
    const imp = clamp(impact - (i > 1 ? 1 : 0), 1, 5);
    const score = p * imp;
    return {
      id: `${assetHealthId}-RA${i + 1}`,
      assetHealthId,
      hazard: r.trigger,
      cause: `Señal detectada en ${assetId}`,
      consequence: r.recommendation,
      probability: p,
      impact: imp,
      risk: score || riskScore,
      riskLevel: riskLevelFromScore(score || riskScore),
      recommendation: r.recommendation,
      priority: r.priority,
      status: "Abierta" as const,
      createdAt: "2026-06-30",
      autoGenerated: true,
    };
  });
}

/** Evalúa un activo a partir de su serie histórica (interfaz estable para futuro ML). */
export function evaluateAssetHealth(meta: AssetSeedMeta): AssetHealth {
  const series = meta.series;
  const latest = series[series.length - 1] ?? {
    month: "Jun",
    availabilityPct: 100,
    mtbfHours: null,
    mttrHours: 0,
    failures: 0,
    operatingHours: 0,
    impactIndex: 1,
  };

  const availabilityTrend = detectRawTrend(series.map((s) => s.availabilityPct));
  const mtbfTrend = detectTrend(
    series.map((s) => s.mtbfHours ?? 720),
    true,
  );
  const mttrTrend = detectRawTrend(series.map((s) => s.mttrHours));
  const failuresTrend = detectRawTrend(series.map((s) => s.failures));

  // Tendencia global: si MTBF baja o fallas/disponibilidad empeoran → decreciente
  let trend: TrendDirection = "estable";
  const badSignals =
    (mtbfTrend === "decreciente" ? 1 : 0) +
    (failuresTrend === "creciente" ? 1 : 0) +
    (availabilityTrend === "decreciente" ? 1 : 0) +
    (mttrTrend === "creciente" ? 1 : 0);
  const goodSignals =
    (mtbfTrend === "creciente" ? 1 : 0) +
    (failuresTrend === "decreciente" ? 1 : 0) +
    (availabilityTrend === "creciente" ? 1 : 0);
  if (badSignals >= 2) trend = "decreciente";
  else if (goodSignals >= 2 && badSignals === 0) trend = "creciente";

  const healthIndex = computeHealthIndex({
    availabilityPct: latest.availabilityPct,
    mtbfHours: latest.mtbfHours,
    mttrHours: latest.mttrHours,
    failures: latest.failures,
    impactIndex: latest.impactIndex,
    criticality: meta.criticality,
  });

  const probability = probabilityFromSignals({
    failures: latest.failures,
    availabilityPct: latest.availabilityPct,
    mtbfTrend,
    failuresTrend,
    impactIndex: latest.impactIndex,
  });
  const impact = impactFromCriticality(meta.criticality, latest.impactIndex);
  const riskScore = probability * impact;
  const riskLevel = riskLevelFromScore(riskScore);
  const degradationLevel = degradationFromHealth(healthIndex, trend);
  const healthBand = healthBandFromIndex(healthIndex);
  const status = statusFromSignals(healthIndex, riskScore, degradationLevel);

  const mtbfDelta = mtbfChangePct(series);
  const recommendations = buildAutoRecommendations({
    assetId: meta.assetId,
    availabilityPct: latest.availabilityPct,
    mtbfChangePct: mtbfDelta,
    mttrTrend,
    failures: latest.failures,
    impactIndex: latest.impactIndex,
    healthIndex,
    riskScore,
  });

  const id = `AH-${meta.assetId}`;
  const alerts: string[] = [];
  if (healthIndex < 70) alerts.push("Alerta: Health Index <70");
  if (riskScore > 15) alerts.push("Alerta: Risk Score >15");
  if (riskScore > 20) alerts.push("Alerta crítica: Risk Score >20");

  return {
    id,
    assetId: meta.assetId,
    assetName: meta.assetName,
    field: meta.field,
    criticality: meta.criticality,
    healthIndex,
    healthBand,
    degradationLevel,
    riskLevel,
    probability,
    impact,
    riskScore,
    status,
    trend,
    availabilityTrend,
    mtbfTrend,
    mttrTrend,
    failuresTrend,
    lastEvaluation: "2026-06-30",
    series,
    recommendations,
    assessments: buildAssessments(id, meta.assetId, probability, impact, riskScore, recommendations),
    linkedRcaIds: meta.linkedRcaIds ?? [],
    linkedPlanIds: meta.linkedPlanIds ?? [],
    linkedMsoIds: meta.linkedMsoIds ?? [],
    alerts,
    createdAt: "2026-01-31",
    updatedAt: "2026-06-30",
  };
}

export function portfolioSummary(assets: AssetHealth[]) {
  const degrading = assets.filter(
    (a) =>
      a.degradationLevel !== "Sin degradación" && a.degradationLevel !== "Leve",
  ).length;
  const criticalRisk = assets.filter((a) => a.riskLevel === "Crítico").length;
  const highRisk = assets.filter((a) => a.riskLevel === "Alto").length;
  const avgHealth =
    assets.reduce((s, a) => s + a.healthIndex, 0) / (assets.length || 1);
  const activeAlerts = assets.reduce((s, a) => s + a.alerts.length, 0);
  return {
    monitored: assets.length,
    degrading,
    criticalRisk,
    highRisk,
    avgHealth: Number(avgHealth.toFixed(1)),
    activeAlerts,
  };
}
