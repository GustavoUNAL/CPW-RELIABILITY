import packJson from "./eventos_falla_costayaco_junio_2026.json";
import type { RcaEventoFalla, RcaEventosPack } from "./types";

export const RCA_COSTAYACO_PACK = packJson as RcaEventosPack;

export const RCA_COSTAYACO_EVENTOS: RcaEventoFalla[] = RCA_COSTAYACO_PACK.eventos;

export function findRcaEventoById(id: string): RcaEventoFalla | undefined {
  return RCA_COSTAYACO_EVENTOS.find((e) => e.id === id);
}

export function equipoLabel(equipo: string | string[]): string {
  if (Array.isArray(equipo)) return equipo.join(", ");
  return equipo || "—";
}

/** ID corto para UI / slides: EVT-2026-06-03-CPW06 → 03-CPW06 */
export function shortRcaEventId(id: string): string {
  const raw = id.trim();
  const m = /^EVT-(\d{4})-(\d{2})-(\d{2}|XX)-(.+)$/i.exec(raw);
  if (!m) return raw.replace(/^EVT-/i, "");
  let tag = m[4].replace(/-/g, "");
  const aliases: Record<string, string> = {
    GENERAL: "GEN",
    SOBRE: "SOB",
    BLANK: "BLK",
  };
  tag = aliases[tag.toUpperCase()] ?? tag;
  return `${m[3]}-${tag}`;
}

export function equiposList(equipo: string | string[]): string[] {
  if (Array.isArray(equipo)) return equipo;
  if (!equipo || equipo === "PENDIENTE") return [];
  return equipo.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean);
}
