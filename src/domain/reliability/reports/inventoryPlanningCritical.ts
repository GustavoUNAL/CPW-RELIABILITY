import { INVENTORY_MINIMUMS, type InventoryMinItem } from "./inventoryMinimumsData";

/**
 * Ajustes de existencia para repuestos críticos ligados a fallas junio 2026
 * (bitácora GTE · RCA / IP). Se aplican sobre el catálogo ETL sin reescribirlo.
 */
export type InventoryStockOverride = {
  id: string;
  onHand: number;
  status?: string;
  note: string;
};

export type PlanningCriticalSpare = {
  id: string;
  family: string;
  description: string;
  partNumber: string;
  stockMin: number;
  onHand: number;
  linkedEvent: string;
  asset: string;
  urgency: "Crítica" | "Alta" | "Media";
};

/** Existencias reales post-consumo junio (escape CPW01, intercooler CPW06, etc.). */
export const INVENTORY_STOCK_OVERRIDES: InventoryStockOverride[] = [
  {
    id: "INV-0182",
    onHand: 0,
    status: "AGOTADO",
    note: "Consumido 05-jun CPW01 · flexible escape · RCA-002 / IP-GTE-002",
  },
  {
    id: "INV-0036",
    onHand: 0,
    status: "AGOTADO",
    note: "Sin cobertura de juntas flexibles · riesgo reincidencia CPW01",
  },
  {
    id: "INV-0085",
    onHand: 1,
    status: "BAJO",
    note: "Manguera metálica flexible bajo mínimo tras correctivos junio",
  },
  {
    id: "INV-0180",
    onHand: 0,
    status: "AGOTADO",
    note: "Flexible turbo sin existencia · cobertura flota J420",
  },
  {
    id: "INV-0105",
    onHand: 2,
    status: "BAJO",
    note: "Empaque intercooler parcial tras cambio CPW06 03-jun · RCA-003",
  },
  {
    id: "INV-0120",
    onHand: 1,
    status: "BAJO",
    note: "Empaque intercooler J420 bajo mínimo · CPW06",
  },
  {
    id: "INV-0121",
    onHand: 0,
    status: "AGOTADO",
    note: "Empaque intercooler 326970 agotado",
  },
];

/** Ítems adicionales no listados en el ETL o críticos eléctricos del plan julio. */
export const PLANNING_EXTRA_SPARES: PlanningCriticalSpare[] = [
  {
    id: "INV-PLAN-K4",
    family: "MATERIALES",
    description: "RELÉ K4 / BASE DETONACIÓN",
    partNumber: "K4-BASE",
    stockMin: 2,
    onHand: 0,
    linkedEvent: "07-jun CPW01 · detonación relé K4 · RCA-001 / IP-GTE-001",
    asset: "CPW01",
    urgency: "Crítica",
  },
  {
    id: "INV-PLAN-RL480",
    family: "MATERIALES",
    description: "KIT AJUSTE / REPUESTO RL 480 V (FO-44)",
    partNumber: "RL-480-KIT",
    stockMin: 1,
    onHand: 0,
    linkedEvent: "23–24/jun FO-44 · selectividad 8×/15× · RCA-007 / IP-GTE-007",
    asset: "CPW04 / CPW05",
    urgency: "Alta",
  },
  {
    id: "INV-PLAN-AVR",
    family: "MATERIALES",
    description: "REPUESTO / RESPALDO AVR–DEIF (Q>)",
    partNumber: "AVR-DEIF",
    stockMin: 1,
    onHand: 0,
    linkedEvent: "27-jun CPW06 · Q>/AVR en investigación · RCA-004 / IP-GTE-004",
    asset: "CPW06",
    urgency: "Alta",
  },
];

const OVERRIDE_BY_ID = new Map(INVENTORY_STOCK_OVERRIDES.map((o) => [o.id, o]));

export function applyInventoryOverrides(items: InventoryMinItem[]): InventoryMinItem[] {
  return items.map((item) => {
    const o = OVERRIDE_BY_ID.get(item.id);
    if (!o) return item;
    return {
      ...item,
      onHand: o.onHand,
      status: o.status ?? item.status,
    };
  });
}

export function getInventoryItemsWithOverrides(): InventoryMinItem[] {
  return applyInventoryOverrides(INVENTORY_MINIMUMS.items);
}

function urgencyFromGap(onHand: number, stockMin: number): PlanningCriticalSpare["urgency"] {
  if (onHand <= 0) return "Crítica";
  if (onHand < stockMin) return "Alta";
  return "Media";
}

const CRITICAL_IDS = new Set(INVENTORY_STOCK_OVERRIDES.map((o) => o.id));

/** Repuestos mínimos críticos para el plan operacional julio (base junio GTE). */
export function getPlanningCriticalSpares(): PlanningCriticalSpare[] {
  const fromCatalog = getInventoryItemsWithOverrides()
    .filter((i) => CRITICAL_IDS.has(i.id) || i.onHand < i.stockMin || i.onHand <= 0)
    .filter((i) => CRITICAL_IDS.has(i.id))
    .map((i) => {
      const note = OVERRIDE_BY_ID.get(i.id)?.note ?? "Stock bajo mínimo";
      const assetMatch = note.match(/CPW\d{2}/);
      return {
        id: i.id,
        family: i.family,
        description: i.description,
        partNumber: i.partNumber,
        stockMin: i.stockMin,
        onHand: i.onHand,
        linkedEvent: note,
        asset: assetMatch?.[0] ?? "Flota",
        urgency: urgencyFromGap(i.onHand, i.stockMin),
      } satisfies PlanningCriticalSpare;
    });

  return [...PLANNING_EXTRA_SPARES, ...fromCatalog].sort((a, b) => {
    const u = { Crítica: 0, Alta: 1, Media: 2 };
    return u[a.urgency] - u[b.urgency] || a.description.localeCompare(b.description, "es");
  });
}
