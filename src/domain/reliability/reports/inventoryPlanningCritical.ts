import { INVENTORY_MINIMUMS, type InventoryMinItem } from "./inventoryMinimumsData";

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

/**
 * El cierre de bodega Costayaco (agosto) ya incorpora consumos. No se pisan
 * existencias con ajustes de junio.
 */
export const INVENTORY_STOCK_OVERRIDES: InventoryStockOverride[] = [];

/** Ítems de plan operacional que no aparecen en el kardex de bodega. */
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

export function applyInventoryOverrides(items: InventoryMinItem[]): InventoryMinItem[] {
  return items;
}

export function getInventoryItemsWithOverrides(): InventoryMinItem[] {
  return applyInventoryOverrides(INVENTORY_MINIMUMS.items);
}

function urgencyFromGap(onHand: number, stockMin: number): PlanningCriticalSpare["urgency"] {
  if (onHand <= 0) return "Crítica";
  if (onHand < stockMin) return "Alta";
  return "Media";
}

function assetFromText(text: string): string {
  const m = text.match(/CPW-?\s?\d{2}|JIN-?\s?\d+|G10\d[A-Z]?/i);
  return m?.[0]?.replace(/\s+/g, "") ?? "Flota";
}

/** Repuestos en riesgo: agotados o bajo el mínimo heredado, más extras de plan. */
export function getPlanningCriticalSpares(): PlanningCriticalSpare[] {
  const fromCatalog = getInventoryItemsWithOverrides()
    .filter((i) => i.onHand <= 0 || i.onHand < i.stockMin)
    .map((i) => {
      const why =
        i.onHand <= 0
          ? i.issued > 0
            ? `Agotado en kardex (${i.issued} salidas)`
            : "Sin existencia en el cierre de bodega"
          : `Bajo mínimo (${i.onHand} vs ${i.stockMin})`;
      return {
        id: i.id,
        family: i.family,
        description: i.description,
        partNumber: i.partNumber,
        stockMin: i.stockMin,
        onHand: i.onHand,
        linkedEvent: why,
        asset: assetFromText(i.description),
        urgency: urgencyFromGap(i.onHand, i.stockMin),
      } satisfies PlanningCriticalSpare;
    });

  const catalogText = new Set(
    fromCatalog.map((i) => `${i.partNumber}|${i.description}`.toLowerCase()),
  );
  const extras = PLANNING_EXTRA_SPARES.filter((s) => {
    const key = `${s.partNumber}|${s.description}`.toLowerCase();
    return !catalogText.has(key);
  });

  return [...extras, ...fromCatalog].sort((a, b) => {
    const u = { Crítica: 0, Alta: 1, Media: 2 };
    return u[a.urgency] - u[b.urgency] || a.description.localeCompare(b.description, "es");
  });
}
