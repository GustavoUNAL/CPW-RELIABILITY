/**
 * Riesgo Técnico — metodología propuesta (Probabilidad × Consecuencia).
 * No hay fórmula oficial en Orden 1 ni en el informe GTE junio; el PDF (sección 5)
 * solo indica que considera recurrencia, severidad, exposición y concentración,
 * separado del cumplimiento contractual.
 *
 * Matriz alineada al patrón del anexo junio (p. ej. CPW06 → Medio).
 * Estado: pendiente de aprobación formal con Gran Tierra / COPOWER.
 */

export type RiskAxisLevel = "BAJA" | "MEDIA" | "ALTA";
export type TechnicalRiskLabel = "RIESGO BAJO" | "RIESGO MEDIO" | "RIESGO ALTO" | "N/A";

export const TECHNICAL_RISK_METHODOLOGY_NOTE =
  "Metodología propuesta (Probabilidad × Consecuencia) — pendiente de aprobación formal. No es regla contractual documentada; el PDF junio solo menciona recurrencia, severidad, exposición y concentración.";

export function parseMtbfHours(mtbfLabel: string): number | null {
  if (!mtbfLabel || /sin\s*fallas|n\/d|n\/a/i.test(mtbfLabel)) return null;
  const match = mtbfLabel.match(/[\d.]+/);
  return match ? Number(match[0]) : null;
}

/** Eje Probabilidad / Recurrencia (#fallas y MTBF). */
export function probabilityAxis(fallas: number, mtbfHours: number | null): RiskAxisLevel {
  if (fallas <= 0) return "BAJA";
  const mtbf = mtbfHours ?? Number.POSITIVE_INFINITY;
  if (fallas >= 3 || mtbf < 200) return "ALTA";
  if (fallas >= 2 || (mtbf >= 200 && mtbf < 500)) return "MEDIA";
  // 1 falla y MTBF ≥ 500
  if (fallas === 1 && mtbf >= 500) return "BAJA";
  // 1 falla con MTBF 200–499
  if (fallas === 1 && mtbf < 500) return "MEDIA";
  return "BAJA";
}

/** Eje Severidad / Consecuencia (MTTR y disponibilidad individual %). */
export function severityAxis(mttrHours: number | null, disponibilidadPct: number | null): RiskAxisLevel {
  const mttr = mttrHours ?? 0;
  const disp = disponibilidadPct == null ? 100 : disponibilidadPct;
  if (mttr > 5 || disp < 97) return "ALTA";
  if ((mttr > 2 && mttr <= 5) || (disp >= 97 && disp < 99)) return "MEDIA";
  if (mttr <= 2 && disp >= 99) return "BAJA";
  return "MEDIA";
}

/**
 * Matriz 3×3 (práctica estándar de confiabilidad):
 * Baja×Baja → Bajo; un eje en Media → Medio; Alta×Baja → Medio;
 * Media×Media o cualquier Alta×Media/Alta → Alto.
 */
export function combineTechnicalRisk(prob: RiskAxisLevel, sev: RiskAxisLevel): Exclude<TechnicalRiskLabel, "N/A"> {
  const matrix: Record<RiskAxisLevel, Record<RiskAxisLevel, Exclude<TechnicalRiskLabel, "N/A">>> = {
    BAJA: { BAJA: "RIESGO BAJO", MEDIA: "RIESGO MEDIO", ALTA: "RIESGO MEDIO" },
    MEDIA: { BAJA: "RIESGO MEDIO", MEDIA: "RIESGO ALTO", ALTA: "RIESGO ALTO" },
    ALTA: { BAJA: "RIESGO MEDIO", MEDIA: "RIESGO ALTO", ALTA: "RIESGO ALTO" },
  };
  return matrix[prob][sev];
}

export function assessTechnicalRisk(input: {
  fallas: number;
  mtbfLabel: string;
  mttrHours: number | null;
  disponibilidadPct: number | null;
  /** Unidades en estabilización u otras sin evaluación */
  skip?: boolean;
}): {
  riesgo: TechnicalRiskLabel;
  probabilidad: RiskAxisLevel | null;
  severidad: RiskAxisLevel | null;
} {
  if (input.skip) {
    return { riesgo: "N/A", probabilidad: null, severidad: null };
  }
  const mtbf = parseMtbfHours(input.mtbfLabel);
  const probabilidad = probabilityAxis(input.fallas, mtbf);
  const severidad = severityAxis(input.mttrHours, input.disponibilidadPct);
  return {
    riesgo: combineTechnicalRisk(probabilidad, severidad),
    probabilidad,
    severidad,
  };
}

export const RISK_PROBABILITY_RULES = [
  { level: "Baja", rule: "0–1 falla y MTBF ≥ 500 h" },
  { level: "Media", rule: "2 fallas, o MTBF entre 200–499 h" },
  { level: "Alta", rule: "3+ fallas, o MTBF < 200 h" },
] as const;

export const RISK_SEVERITY_RULES = [
  { level: "Baja", rule: "MTTR ≤ 2 h y disponibilidad ≥ 99%" },
  { level: "Media", rule: "MTTR 2–5 h o disponibilidad 97–99%" },
  { level: "Alta", rule: "MTTR > 5 h o disponibilidad < 97%" },
] as const;

export const RISK_COMBINATION_RULES = [
  "Baja × Baja → Riesgo Bajo",
  "Un eje en Media (y el otro Baja) → Riesgo Medio",
  "Alta × Baja → Riesgo Medio",
  "Media × Media, o cualquier eje en Alta con Media/Alta → Riesgo Alto",
] as const;
