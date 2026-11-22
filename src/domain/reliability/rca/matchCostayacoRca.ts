import { equipoLabel, equiposList } from "./data";
import type { RcaEventoFalla } from "./types";

function normEq(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

const EVT_REF = /EVT-\d{4}-\d{2}-\d{2}-[A-Z0-9-]+/g;

/**
 * Cruza un evento de bitácora GTE/COPOWER con fichas RCA Costayaco (EVT-…).
 * Prioriza la referencia explícita `EVT-…` escrita en las notas de la bitácora;
 * si no existe, usa misma fecha + solapamiento de equipo (o evento multi-unidad).
 */
export function findCostayacoRcasForEvent(
  date: string,
  equipment: string,
  events: RcaEventoFalla[],
  notes?: string,
): RcaEventoFalla[] {
  const refs = new Set((notes ?? "").toUpperCase().match(EVT_REF) ?? []);
  if (refs.size > 0) {
    const linked = events.filter((rca) => refs.has(rca.id.toUpperCase()));
    if (linked.length > 0) return linked;
  }

  if (!date) return [];
  const eq = normEq(equipment);
  if (!eq) return [];

  return events.filter((rca) => {
    if (!rca.fecha || rca.fecha !== date) return false;
    const units = equiposList(rca.equipo)
      .map(normEq)
      .filter((u) => u && u !== "PENDIENTE");
    // Ficha sin equipo confirmado: solo se vincula por referencia explícita.
    if (units.length === 0) return false;
    // Shutdown general / multi-unidad: relaciona cualquier equipo del día.
    if (units.length >= 4) return true;
    return units.some((u) => eq.includes(u) || u.includes(eq));
  });
}

export function costayacoRcaSummary(rca: RcaEventoFalla): string {
  return `${rca.id} · ${equipoLabel(rca.equipo)} · ${rca.calidad_dato}`;
}
