import { equipoLabel, equiposList } from "./data";
import type { RcaEventoFalla } from "./types";

function normEq(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Cruza un evento de bitácora GTE/COPOWER con fichas RCA Costayaco (EVT-…).
 * Criterio: misma fecha + solapamiento de equipo (o evento multi-unidad / parque).
 */
export function findCostayacoRcasForEvent(
  date: string,
  equipment: string,
  events: RcaEventoFalla[],
): RcaEventoFalla[] {
  if (!date) return [];
  const eq = normEq(equipment);
  if (!eq) return [];

  return events.filter((rca) => {
    if (!rca.fecha || rca.fecha !== date) return false;
    const units = equiposList(rca.equipo).map(normEq).filter(Boolean);
    if (units.length === 0) return false;
    // Shutdown general / multi-unidad: relaciona cualquier equipo del día.
    if (units.length >= 4) return true;
    return units.some((u) => eq.includes(u) || u.includes(eq));
  });
}

export function costayacoRcaSummary(rca: RcaEventoFalla): string {
  return `${rca.id} · ${equipoLabel(rca.equipo)} · ${rca.calidad_dato}`;
}
