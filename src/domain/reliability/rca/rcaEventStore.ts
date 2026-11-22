import { RCA_COSTAYACO_EVENTOS, RCA_COSTAYACO_PACK } from "./data";
import type { RcaEventoFalla } from "./types";

/** Solo fichas creadas en sesión (no seed). El análisis seed vive en el JSON. */
const STORAGE_KEY = "cpw-costayaco-rca-events-v3-local";
const LEGACY_KEYS = [
  "cpw-costayaco-rca-events-v1",
  "cpw-costayaco-rca-events-v2",
  "cpw-costayaco-rca-seed-stamp",
];

function seedIds(): Set<string> {
  return new Set(RCA_COSTAYACO_EVENTOS.map((e) => e.id));
}

/** Sustituye terminología legacy en textos del pack seed. */
function normalizeLegacyTerms(text: string): string {
  return text
    .replace(/\bvector\s*shiift\b/gi, "salida de la máquina")
    .replace(/\bvector\s*shift\b/gi, "salida de la máquina");
}

function normalizeEventStrings<T>(value: T): T {
  if (typeof value === "string") return normalizeLegacyTerms(value) as T;
  if (Array.isArray(value)) return value.map((item) => normalizeEventStrings(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        normalizeEventStrings(nested),
      ]),
    ) as T;
  }
  return value;
}

function clearLegacyStorage() {
  for (const key of LEGACY_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Fuente de verdad: JSON seed. localStorage solo conserva fichas nuevas
 * (IDs que no existen en el pack). Así un análisis actualizado en repo
 * no queda oculto por ediciones viejas del navegador.
 */
export function loadCostayacoRcaEvents(): RcaEventoFalla[] {
  const seed = normalizeEventStrings(structuredClone(RCA_COSTAYACO_EVENTOS));
  const ids = seedIds();
  try {
    clearLegacyStorage();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const stored = JSON.parse(raw) as RcaEventoFalla[];
    if (!Array.isArray(stored)) return seed;

    const byId = new Map(seed.map((e) => [e.id, e]));
    for (const e of stored) {
      if (!e?.id || ids.has(e.id)) continue;
      byId.set(e.id, e);
    }
    return [...byId.values()].sort(
      (a, b) =>
        (a.fecha || "9999").localeCompare(b.fecha || "9999") || a.id.localeCompare(b.id),
    );
  } catch {
    return seed;
  }
}

export function persistCostayacoRcaEvents(events: RcaEventoFalla[]) {
  try {
    const ids = seedIds();
    const localOnly = events.filter((e) => e?.id && !ids.has(e.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localOnly));
    clearLegacyStorage();
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

export function getCostayacoSeedStamp(): string {
  return String(RCA_COSTAYACO_PACK.meta?.generado ?? "seed");
}
