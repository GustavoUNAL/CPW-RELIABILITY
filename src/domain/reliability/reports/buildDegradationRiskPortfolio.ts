import { GRAN_TIERRA_MONTH_ORDER, GRAN_TIERRA_MONTHLY_DATA } from "./granTierraMonthly";
import {
  evaluateAssetHealth,
  type AssetSeedMeta,
} from "./degradationRiskEngine";
import type {
  AssetHealth,
  AutoRecommendation,
  CriticalityLevel,
  MonthlyPoint,
} from "./degradationRiskTypes";

/** Bump al realinear el portafolio APM con bitácora GTE. */
export const GTE_JUNE_DEG_SEED = "2026-07-26-deg-r2";

type AssetConfig = {
  assetId: string;
  criticality: CriticalityLevel;
  linkedRcaIds?: string[];
  linkedPlanIds?: string[];
  linkedMsoIds?: string[];
  /** Notas canónicas junio (bitácora / indicadores GTE). */
  juneNotes?: string;
  /** Recomendaciones APM específicas del mes (además de las automáticas). */
  juneRecommendations?: Array<Omit<AutoRecommendation, "id">>;
  /** Override series when asset no está en machineIndicators (p.ej. MRU). */
  seriesOverride?: MonthlyPoint[];
};

/**
 * Portafolio APM Costayaco — enlaces alineados a RCA / IP / MSO junio 2026.
 * Indicadores de serie: GRAN_TIERRA_MONTHLY_DATA (misma fuente que Eventos GTE).
 */
const ASSETS: AssetConfig[] = [
  {
    assetId: "CPW06",
    criticality: "Muy Alta",
    linkedRcaIds: ["RCA-003", "RCA-004"],
    linkedPlanIds: ["IP-GTE-003", "IP-GTE-004"],
    linkedMsoIds: ["MSO-001"],
    juneNotes:
      "2 fallas COPOWER · PF_contr 6,3 h: intercooler/secuestrante 03-jun (4 h) + Q> 27-jun (2,30 h). 28-jun externo no imputable.",
    juneRecommendations: [
      {
        trigger: "Reincidencia CPW06 (2 fallas jun)",
        recommendation: "Acortar PM 500→400 h e inspección de intercooler por condición (MSO-001 / IP-GTE-003).",
        priority: "Crítica",
      },
      {
        trigger: "Q> post-MRU sin causa raíz",
        recommendation: "Cerrar investigación AVR / Q> / DEIF / CPW-07 (RCA-004 / IP-GTE-004).",
        priority: "Alta",
      },
    ],
  },
  {
    assetId: "CPW03",
    criticality: "Alta",
    linkedRcaIds: ["RCA-008"],
    linkedPlanIds: ["IP-GTE-009"],
    linkedMsoIds: ["MSO-002"],
    juneNotes:
      "1 falla · FS≈3,92 h (11-jun): perturbación transitoria; ≈2.620 kWh; causa raíz no determinada (RCA-008).",
    juneRecommendations: [
      {
        trigger: "Causa raíz no determinada",
        recommendation: "Fortalecer captura automática de diagnóstico ante transitorios (IP-GTE-009).",
        priority: "Alta",
      },
    ],
  },
  {
    assetId: "CPW01",
    criticality: "Alta",
    linkedRcaIds: ["RCA-001", "RCA-002"],
    linkedPlanIds: ["IP-GTE-001", "IP-GTE-002"],
    linkedMsoIds: ["MSO-003"],
    juneNotes:
      "2 fallas · PF_contr 5 h: flexible escape 05-jun (2 h) + relé K4 07-jun (3 h). RCA/IP cerrados — vigilar reincidencia.",
    juneRecommendations: [
      {
        trigger: "Familia escape + K4 en el mismo mes",
        recommendation: "Sostener checklist de torque escape y bases de relé en correctivos eléctricos.",
        priority: "Alta",
      },
    ],
  },
  {
    assetId: "CPW05",
    criticality: "Alta",
    linkedRcaIds: ["RCA-007"],
    linkedPlanIds: ["IP-GTE-007"],
    linkedMsoIds: ["MSO-005"],
    juneNotes:
      "1 falla COPOWER · PF_contr 2 h (FO-44 23–24/jun). Evento 28-jun externo no imputable.",
    juneRecommendations: [
      {
        trigger: "FO-44 — selectividad RL/480 V",
        recommendation: "Validar efectividad del ajuste 8×/15× y estudio de coordinación (RCA-007 / IP-GTE-007).",
        priority: "Crítica",
      },
    ],
  },
  {
    assetId: "CPW04",
    criticality: "Alta",
    linkedRcaIds: ["RCA-007"],
    linkedPlanIds: ["IP-GTE-007"],
    linkedMsoIds: ["MSO-008"],
    juneNotes: "1 falla · PF_contr 1 h (FO-44 familia 23–24/jun). Misma cascada RL/480 V que CPW05.",
    juneRecommendations: [
      {
        trigger: "FO-44 — CPW04 en cascada",
        recommendation: "Completar estudio 34,5 kV → RL → 480 V y data TRIP post-ajuste (IP-GTE-007).",
        priority: "Alta",
      },
    ],
  },
  {
    assetId: "CPW07",
    criticality: "Alta",
    linkedRcaIds: ["RCA-004"],
    linkedPlanIds: ["IP-GTE-004"],
    linkedMsoIds: ["MSO-006"],
    juneNotes:
      "0 fallas propias (salida 27-jun consolidada en CPW06). Seguimiento AVR/DEIF como activo vinculado a RCA-004.",
    juneRecommendations: [
      {
        trigger: "Activo vinculado a Q> 27-jun",
        recommendation: "Analizar comportamiento conjunto CPW-06 / CPW-07 en el evento Q> (IP-GTE-004).",
        priority: "Media",
      },
    ],
  },
  {
    assetId: "CPW02",
    criticality: "Media",
    linkedRcaIds: [],
    linkedPlanIds: [],
    linkedMsoIds: ["MSO-007"],
    juneNotes: "Sin fallas contractuales · disp. 100%. Candidato a extender intervalo PM (sobre-mantenimiento).",
    juneRecommendations: [
      {
        trigger: "Sin fallas + alta disponibilidad",
        recommendation: "Evaluar extensión controlada del intervalo preventivo 250→500 h (MSO-007).",
        priority: "Baja",
      },
    ],
  },
  {
    assetId: "JIN-01",
    criticality: "Media",
    linkedRcaIds: [],
    linkedPlanIds: [],
    juneNotes: "Vonu · sin fallas en junio; disponibilidad 99.17%.",
  },
  {
    assetId: "MRU",
    criticality: "Muy Alta",
    linkedRcaIds: ["RCA-006"],
    linkedPlanIds: ["IP-GTE-006"],
    linkedMsoIds: ["MSO-004"],
    juneNotes:
      "Sistema de tratamiento GTE: paradas NGL/mto habilitan fallas en generadores y elevan PF_cli. Prioridad predictivo NGL (IP-GTE-006).",
    juneRecommendations: [
      {
        trigger: "Disponibilidad MRU <98%",
        recommendation: "Pasar de correctivo reactivo a predictivo con alarmas NGL y PM semanal (MSO-004 / IP-GTE-006).",
        priority: "Crítica",
      },
    ],
    seriesOverride: [
      { month: "Ene", availabilityPct: 97.2, mtbfHours: 180, mttrHours: 6, failures: 2, operatingHours: 700, impactIndex: 7.5, pfContrHours: 0 },
      { month: "Feb", availabilityPct: 96.5, mtbfHours: 160, mttrHours: 7, failures: 2, operatingHours: 650, impactIndex: 7.8, pfContrHours: 0 },
      { month: "Mar", availabilityPct: 95.8, mtbfHours: 140, mttrHours: 8, failures: 3, operatingHours: 680, impactIndex: 8.2, pfContrHours: 0 },
      { month: "Abr", availabilityPct: 94.5, mtbfHours: 120, mttrHours: 9, failures: 3, operatingHours: 660, impactIndex: 8.6, pfContrHours: 0 },
      { month: "May", availabilityPct: 93.8, mtbfHours: 110, mttrHours: 8, failures: 3, operatingHours: 670, impactIndex: 8.9, pfContrHours: 0 },
      { month: "Jun", availabilityPct: 92.5, mtbfHours: 96, mttrHours: 8, failures: 4, operatingHours: 640, impactIndex: 9.1, pfContrHours: 0 },
    ],
  },
];

function parseMtbf(label: string): number | null {
  if (!label || label.toLowerCase().includes("sin")) return null;
  const n = Number.parseFloat(label);
  return Number.isFinite(n) ? n : null;
}

function impactFromMonth(failures: number, availabilityPct: number, mttrHours: number): number {
  const failN = Math.min(1, failures / 5);
  const availN = Math.min(1, Math.max(0, (100 - availabilityPct) / 10));
  const mttrN = Math.min(1, mttrHours / 10);
  return Number((1 + 9 * (0.45 * failN + 0.35 * availN + 0.2 * mttrN)).toFixed(1));
}

function seriesForAsset(assetId: string): { field: string; series: MonthlyPoint[]; juneDetalle: string | null } {
  let field = "COSTAYACO";
  const series: MonthlyPoint[] = [];
  let juneDetalle: string | null = null;

  for (const month of GRAN_TIERRA_MONTH_ORDER) {
    const snap = GRAN_TIERRA_MONTHLY_DATA[month];
    const row = snap.machineIndicators.find((m) => m.unidad === assetId);
    const gen = snap.generationByEquipment?.find((g) => g.equipo === assetId);
    if (!row) continue;
    field = row.campo || field;
    const failures = row.fallas;
    const availabilityPct = row.disponibilidadPct ?? 100;
    const mttrHours = row.mttrHours ?? 0;
    if (month === "Jun" && row.detalle) juneDetalle = row.detalle;
    series.push({
      month,
      availabilityPct,
      mtbfHours: parseMtbf(row.mtbfLabel),
      mttrHours,
      failures,
      operatingHours: gen?.horasOperacion ?? 0,
      impactIndex: impactFromMonth(failures, availabilityPct, mttrHours),
      pfContrHours: gen?.horasPFContr ?? 0,
    });
  }

  return { field, series, juneDetalle };
}

function mergeJuneRecommendations(
  asset: AssetHealth,
  extras: Array<Omit<AutoRecommendation, "id">> | undefined,
): AssetHealth {
  if (!extras?.length) return asset;
  const added: AutoRecommendation[] = extras.map((r, i) => ({
    id: `${asset.assetId}-JUN${i + 1}`,
    ...r,
  }));
  // Preferir recomendaciones del mes al frente; evitar duplicar por texto.
  const seen = new Set(added.map((r) => r.recommendation));
  const rest = asset.recommendations.filter((r) => !seen.has(r.recommendation));
  return { ...asset, recommendations: [...added, ...rest], updatedAt: "2026-07-26" };
}

export function buildGteDegradationRiskPortfolio(): AssetHealth[] {
  const metas: Array<AssetSeedMeta & { juneNotes?: string; juneRecommendations?: AssetConfig["juneRecommendations"] }> =
    ASSETS.map((cfg) => {
      if (cfg.seriesOverride) {
        return {
          assetId: cfg.assetId,
          assetName: cfg.assetId,
          field: "COSTAYACO",
          criticality: cfg.criticality,
          linkedRcaIds: cfg.linkedRcaIds,
          linkedPlanIds: cfg.linkedPlanIds,
          linkedMsoIds: cfg.linkedMsoIds,
          series: cfg.seriesOverride,
          juneNotes: cfg.juneNotes,
          juneRecommendations: cfg.juneRecommendations,
        };
      }
      const { field, series, juneDetalle } = seriesForAsset(cfg.assetId);
      return {
        assetId: cfg.assetId,
        assetName: cfg.assetId,
        field,
        criticality: cfg.criticality,
        linkedRcaIds: cfg.linkedRcaIds,
        linkedPlanIds: cfg.linkedPlanIds,
        linkedMsoIds: cfg.linkedMsoIds,
        series,
        juneNotes: cfg.juneNotes ?? juneDetalle ?? undefined,
        juneRecommendations: cfg.juneRecommendations,
      };
    }).filter((m) => m.series.length > 0);

  return metas
    .map((m) => {
      const base = evaluateAssetHealth(m);
      return mergeJuneRecommendations(
        {
          ...base,
          juneNotes: m.juneNotes ?? null,
          lastEvaluation: "2026-07-26",
          updatedAt: "2026-07-26",
        },
        m.juneRecommendations,
      );
    })
    .sort((a, b) => a.healthIndex - b.healthIndex || b.riskScore - a.riskScore);
}

/** KPIs de contexto GTE junio (excluye MRU del conteo de fallas COPOWER). */
export function gteJuneDegradationContext(assets: AssetHealth[]) {
  const units = assets.filter((a) => a.assetId !== "MRU");
  const junPoints = units.map((a) => a.series.find((p) => p.month === "Jun") ?? a.series.at(-1));
  const failures = junPoints.reduce((n, p) => n + (p?.failures ?? 0), 0);
  const pfContr = junPoints.reduce((n, p) => n + (p?.pfContrHours ?? 0), 0);
  const withLinks = assets.filter((a) => a.linkedRcaIds.length > 0 || a.linkedPlanIds.length > 0).length;
  return {
    failures,
    pfContrHours: Number(pfContr.toFixed(2)),
    withLinks,
    seed: GTE_JUNE_DEG_SEED,
  };
}

export function riskDistribution(assets: AssetHealth[]) {
  const levels = ["Bajo", "Medio", "Alto", "Crítico"] as const;
  return levels.map((name) => ({
    name,
    count: assets.filter((a) => a.riskLevel === name).length,
  }));
}

export function topDegrading(assets: AssetHealth[], limit = 5) {
  const order: Record<string, number> = {
    Crítica: 5,
    Severa: 4,
    Moderada: 3,
    Leve: 2,
    "Sin degradación": 1,
  };
  return [...assets]
    .sort(
      (a, b) =>
        (order[b.degradationLevel] ?? 0) - (order[a.degradationLevel] ?? 0) ||
        a.healthIndex - b.healthIndex,
    )
    .slice(0, limit);
}

export function allRiskRows(assets: AssetHealth[]) {
  return assets
    .flatMap((a) =>
      a.assessments.map((r) => ({
        ...r,
        equipment: a.assetName,
        field: a.field,
      })),
    )
    .sort((a, b) => b.risk - a.risk);
}
