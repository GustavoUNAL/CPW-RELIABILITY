import { GRAN_TIERRA_MONTH_ORDER, GRAN_TIERRA_MONTHLY_DATA } from "./granTierraMonthly";
import {
  evaluateAssetHealth,
  type AssetSeedMeta,
} from "./degradationRiskEngine";
import type { AssetHealth, CriticalityLevel, MonthlyPoint } from "./degradationRiskTypes";

type AssetConfig = {
  assetId: string;
  criticality: CriticalityLevel;
  linkedRcaIds?: string[];
  linkedPlanIds?: string[];
  linkedMsoIds?: string[];
  /** Override series when asset no está en machineIndicators (p.ej. MRU). */
  seriesOverride?: MonthlyPoint[];
};

const ASSETS: AssetConfig[] = [
  {
    assetId: "CPW06",
    criticality: "Muy Alta",
    linkedRcaIds: ["RCA-003", "RCA-004", "RCA-005"],
    linkedPlanIds: ["IP-GTE-003", "IP-GTE-004", "IP-GTE-005"],
    linkedMsoIds: ["MSO-001"],
  },
  {
    assetId: "CPW03",
    criticality: "Alta",
    linkedRcaIds: ["RCA-001"],
    linkedPlanIds: ["IP-GTE-001"],
    linkedMsoIds: ["MSO-002"],
  },
  {
    assetId: "CPW01",
    criticality: "Alta",
    linkedRcaIds: ["RCA-002"],
    linkedPlanIds: ["IP-GTE-002"],
    linkedMsoIds: ["MSO-003"],
  },
  {
    assetId: "CPW05",
    criticality: "Alta",
    linkedRcaIds: ["RCA-005"],
    linkedPlanIds: ["IP-GTE-005"],
    linkedMsoIds: ["MSO-005"],
  },
  {
    assetId: "CPW04",
    criticality: "Alta",
    linkedRcaIds: [],
    linkedPlanIds: [],
    linkedMsoIds: ["MSO-008"],
  },
  {
    assetId: "CPW07",
    criticality: "Alta",
    linkedRcaIds: ["RCA-004"],
    linkedPlanIds: ["IP-GTE-004"],
    linkedMsoIds: ["MSO-006"],
  },
  {
    assetId: "CPW02",
    criticality: "Media",
    linkedRcaIds: [],
    linkedPlanIds: [],
    linkedMsoIds: ["MSO-007"],
  },
  {
    assetId: "JIN-01",
    criticality: "Media",
    linkedRcaIds: [],
    linkedPlanIds: [],
  },
  {
    assetId: "MRU",
    criticality: "Muy Alta",
    linkedRcaIds: ["RCA-006", "RCA-005"],
    linkedPlanIds: ["IP-GTE-006", "IP-GTE-005"],
    linkedMsoIds: ["MSO-004"],
    seriesOverride: [
      { month: "Ene", availabilityPct: 97.2, mtbfHours: 180, mttrHours: 6, failures: 2, operatingHours: 700, impactIndex: 7.5 },
      { month: "Feb", availabilityPct: 96.5, mtbfHours: 160, mttrHours: 7, failures: 2, operatingHours: 650, impactIndex: 7.8 },
      { month: "Mar", availabilityPct: 95.8, mtbfHours: 140, mttrHours: 8, failures: 3, operatingHours: 680, impactIndex: 8.2 },
      { month: "Abr", availabilityPct: 94.5, mtbfHours: 120, mttrHours: 9, failures: 3, operatingHours: 660, impactIndex: 8.6 },
      { month: "May", availabilityPct: 93.8, mtbfHours: 110, mttrHours: 8, failures: 3, operatingHours: 670, impactIndex: 8.9 },
      { month: "Jun", availabilityPct: 92.5, mtbfHours: 96, mttrHours: 8, failures: 4, operatingHours: 640, impactIndex: 9.1 },
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

function seriesForAsset(assetId: string): { field: string; series: MonthlyPoint[] } {
  let field = "COSTAYACO";
  const series: MonthlyPoint[] = [];

  for (const month of GRAN_TIERRA_MONTH_ORDER) {
    const snap = GRAN_TIERRA_MONTHLY_DATA[month];
    const row = snap.machineIndicators.find((m) => m.unidad === assetId);
    const gen = snap.generationByEquipment?.find((g) => g.equipo === assetId);
    if (!row) continue;
    field = row.campo || field;
    const failures = row.fallas;
    const availabilityPct = row.disponibilidadPct ?? 100;
    const mttrHours = row.mttrHours ?? 0;
    series.push({
      month,
      availabilityPct,
      mtbfHours: parseMtbf(row.mtbfLabel),
      mttrHours,
      failures,
      operatingHours: gen?.horasOperacion ?? 0,
      impactIndex: impactFromMonth(failures, availabilityPct, mttrHours),
    });
  }

  return { field, series };
}

export function buildGteDegradationRiskPortfolio(): AssetHealth[] {
  const metas: AssetSeedMeta[] = ASSETS.map((cfg) => {
    if (cfg.seriesOverride) {
      return {
        assetId: cfg.assetId,
        assetName: cfg.assetId,
        field: cfg.assetId === "MRU" ? "COSTAYACO" : "COSTAYACO",
        criticality: cfg.criticality,
        linkedRcaIds: cfg.linkedRcaIds,
        linkedPlanIds: cfg.linkedPlanIds,
        linkedMsoIds: cfg.linkedMsoIds,
        series: cfg.seriesOverride,
      };
    }
    const { field, series } = seriesForAsset(cfg.assetId);
    return {
      assetId: cfg.assetId,
      assetName: cfg.assetId,
      field,
      criticality: cfg.criticality,
      linkedRcaIds: cfg.linkedRcaIds,
      linkedPlanIds: cfg.linkedPlanIds,
      linkedMsoIds: cfg.linkedMsoIds,
      series,
    };
  }).filter((m) => m.series.length > 0);

  return metas
    .map(evaluateAssetHealth)
    .sort((a, b) => a.healthIndex - b.healthIndex || b.riskScore - a.riskScore);
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
