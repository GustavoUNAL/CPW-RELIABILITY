import { RCA_COSTAYACO_EVENTOS } from "./data";
import type { RcaEventoFalla } from "./types";

const STORAGE_KEY = "cpw-costayaco-rca-events-v1";

export function loadCostayacoRcaEvents(): RcaEventoFalla[] {
  const seed = structuredClone(RCA_COSTAYACO_EVENTOS);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const stored = JSON.parse(raw) as RcaEventoFalla[];
    if (!Array.isArray(stored)) return seed;
    const byId = new Map(seed.map((e) => [e.id, e]));
    for (const e of stored) {
      if (!e?.id) continue;
      const base = byId.get(e.id);
      byId.set(e.id, base ? { ...base, ...e } : e);
    }
    // Conserva eventos del seed y admite nuevos creados en sesión.
    for (const e of seed) {
      if (!byId.has(e.id)) byId.set(e.id, e);
    }
    return [...byId.values()].sort((a, b) =>
      (a.fecha || "9999").localeCompare(b.fecha || "9999") || a.id.localeCompare(b.id),
    );
  } catch {
    return seed;
  }
}

export function persistCostayacoRcaEvents(events: RcaEventoFalla[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    /* ignore quota / private mode */
  }
}

export function upsertCostayacoRcaEvent(
  events: RcaEventoFalla[],
  next: RcaEventoFalla,
): RcaEventoFalla[] {
  const idx = events.findIndex((e) => e.id === next.id);
  if (idx < 0) return [...events, next];
  const copy = [...events];
  copy[idx] = next;
  return copy;
}
