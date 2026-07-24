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

export function equiposList(equipo: string | string[]): string[] {
  if (Array.isArray(equipo)) return equipo;
  if (!equipo || equipo === "PENDIENTE") return [];
  return equipo.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean);
}
