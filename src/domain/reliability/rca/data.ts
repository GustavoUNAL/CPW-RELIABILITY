import junioJson from "./eventos_falla_costayaco_junio_2026.json";
import julioJson from "./eventos_falla_costayaco_julio_2026.json";
import type { RcaAnalisisTransversal, RcaEventoFalla, RcaEventosPack } from "./types";

const junio = junioJson as RcaEventosPack;
const julio = julioJson as {
  meta: { periodo: string; fuente: string; generado: string; flota?: { unidades?: string[] } };
  eventos: RcaEventoFalla[];
  analisis_transversal?: RcaAnalisisTransversal;
};

const julioUnidades = julio.meta.flota?.unidades ?? [];

export const RCA_COSTAYACO_PACK: RcaEventosPack = {
  ...junio,
  meta: {
    ...junio.meta,
    periodo: "junio–julio 2026",
    fuente: `${junio.meta.fuente} + ${julio.meta.fuente}`,
    generado: julio.meta.generado,
    flota: {
      ...junio.meta.flota,
      unidades: [...new Set([...junio.meta.flota.unidades, ...julioUnidades])],
    },
  },
  eventos: [...junio.eventos, ...julio.eventos],
  analisis_transversal: {
    patrones_recurrentes: [
      ...(junio.analisis_transversal?.patrones_recurrentes ?? []),
      ...(julio.analisis_transversal?.patrones_recurrentes ?? []),
    ],
    problemas_calidad_registro: [
      ...(junio.analisis_transversal?.problemas_calidad_registro ?? []),
      ...(julio.analisis_transversal?.problemas_calidad_registro ?? []),
    ],
  },
};

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
