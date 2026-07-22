import { EQUIPO_BY_ID } from "./constants";
import type {
  DisponibilidadEstado,
  EquipoId,
  HorasEstado,
  OperacionFilters,
  Planta,
  ResumenDiario,
} from "./types";

export function sumHoras(rows: HorasEstado[]): HorasEstado {
  return rows.reduce(
    (acc, r) => ({
      op: acc.op + (r.op || 0),
      sb: acc.sb + (r.sb || 0),
      pe: acc.pe + (r.pe || 0),
      mto: acc.mto + (r.mto || 0),
      fs: acc.fs + (r.fs || 0),
      tr: acc.tr + (r.tr || 0),
    }),
    { op: 0, sb: 0, pe: 0, mto: 0, fs: 0, tr: 0 },
  );
}

/**
 * Disponibilidad % = OP / (OP+SB+PE+MTO+FS).
 * TR no entra en el denominador (pendiente confirmación operativa de PE/TR).
 */
export function disponibilidadPct(h: HorasEstado): number | null {
  const den = h.op + h.sb + h.pe + h.mto + h.fs;
  if (den <= 0) return null;
  return (h.op / den) * 100;
}

export function factorCarga(kwPromedio: number | null | undefined, kwNominal: number): number | null {
  if (kwPromedio == null || !kwNominal) return null;
  return (kwPromedio / kwNominal) * 100;
}

export function energiaMwh(kwAcumuladoKwh: number | null | undefined): number | null {
  if (kwAcumuladoKwh == null) return null;
  return kwAcumuladoKwh / 1000;
}

export function heatRateFt3PerKwh(gasFt3: number | null | undefined, kwh: number | null | undefined): number | null {
  if (gasFt3 == null || kwh == null || kwh <= 0) return null;
  return gasFt3 / kwh;
}

export function dominantEstado(h: HorasEstado): DisponibilidadEstado {
  const entries: [DisponibilidadEstado, number][] = [
    ["OP", h.op],
    ["SB", h.sb],
    ["PE", h.pe],
    ["MTO", h.mto],
    ["FS", h.fs],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][1] > 0 ? entries[0][0] : "SB";
}

export function filterResumen(
  rows: ResumenDiario[],
  filters: OperacionFilters,
): ResumenDiario[] {
  return rows.filter((r) => {
    if (r.fecha < filters.from || r.fecha > filters.to) return false;
    if (filters.equipoId !== "Todos" && r.equipoId !== filters.equipoId) return false;
    if (filters.planta !== "Todas") {
      const eq = EQUIPO_BY_ID[r.equipoId];
      if (!eq || eq.planta !== filters.planta) return false;
    }
    return true;
  });
}

export function kpisFromResumen(rows: ResumenDiario[]) {
  const horas = sumHoras(rows);
  const disp = disponibilidadPct(horas);
  const energiaKwh = rows.reduce((s, r) => s + (r.kwAcumuladoDia ?? 0), 0);
  const kwAvg =
    rows.length > 0
      ? rows.reduce((s, r) => s + (r.kwPromedioDia ?? 0), 0) / rows.length
      : null;
  const effSamples = rows
    .map((r) => r.consumoGasFt3Kwh)
    .filter((v): v is number => v != null && v > 0);
  const heatRate =
    effSamples.length > 0 ? effSamples.reduce((a, b) => a + b, 0) / effSamples.length : null;

  const byEquipo = new Map<EquipoId, ResumenDiario[]>();
  for (const r of rows) {
    const list = byEquipo.get(r.equipoId) ?? [];
    list.push(r);
    byEquipo.set(r.equipoId, list);
  }

  const online = [...byEquipo.entries()].filter(([, list]) => {
    const last = list[list.length - 1];
    return last && last.op > 0;
  }).length;

  return {
    disponibilidadPct: disp,
    energiaMwh: energiaKwh / 1000,
    kwPromedio: kwAvg,
    heatRateFt3Kwh: heatRate,
    horasMto: horas.mto,
    horasFs: horas.fs,
    equiposOnline: online,
    equiposTotal: byEquipo.size,
    horas,
  };
}

export type EquipoPeriodoStats = {
  equipoId: EquipoId;
  label: string;
  planta: Planta;
  combustible: "gas" | "diesel";
  kwNominal: number;
  op: number;
  sb: number;
  pe: number;
  mto: number;
  fs: number;
  tr: number;
  disponibilidadPct: number | null;
  energiaKwh: number;
  energiaMwh: number;
  kwPromedio: number;
  factorCargaPct: number | null;
  gasMscfd: number | null;
  heatRateFt3Kwh: number | null;
  dias: number;
  estado: ReturnType<typeof dominantEstado>;
  fechaUltimo: string;
};

export function disponibilidadByEquipo(rows: ResumenDiario[]): EquipoPeriodoStats[] {
  const byEquipo = new Map<EquipoId, ResumenDiario[]>();
  for (const r of rows) {
    const list = byEquipo.get(r.equipoId) ?? [];
    list.push(r);
    byEquipo.set(r.equipoId, list);
  }
  return [...byEquipo.entries()]
    .map(([equipoId, list]) => {
      const sorted = [...list].sort((a, b) => a.fecha.localeCompare(b.fecha));
      const h = sumHoras(sorted);
      const eq = EQUIPO_BY_ID[equipoId];
      const kwNominal = eq?.kwNominal ?? 0;
      const energiaKwh = sorted.reduce((s, r) => s + (r.kwAcumuladoDia ?? 0), 0);
      const kwPromedio =
        sorted.reduce((s, r) => s + (r.kwPromedioDia ?? 0), 0) / Math.max(sorted.length, 1);
      const gasSamples = sorted
        .map((r) => r.consumoGasMscfd)
        .filter((v): v is number => v != null && v > 0);
      const heatSamples = sorted
        .map((r) => r.consumoGasFt3Kwh)
        .filter((v): v is number => v != null && v > 0);
      const last = sorted[sorted.length - 1];
      return {
        equipoId,
        label: eq?.label ?? equipoId,
        planta: (eq?.planta ?? "Costayaco") as Planta,
        combustible: eq?.combustible ?? "gas",
        kwNominal,
        ...h,
        disponibilidadPct: disponibilidadPct(h),
        energiaKwh,
        energiaMwh: energiaKwh / 1000,
        kwPromedio,
        factorCargaPct: factorCarga(kwPromedio, kwNominal),
        gasMscfd:
          gasSamples.length > 0 ? gasSamples.reduce((a, b) => a + b, 0) / gasSamples.length : null,
        heatRateFt3Kwh:
          heatSamples.length > 0 ? heatSamples.reduce((a, b) => a + b, 0) / heatSamples.length : null,
        dias: sorted.length,
        estado: dominantEstado(last ?? h),
        fechaUltimo: last?.fecha ?? "",
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function cargaDiariaTotal(rows: ResumenDiario[]) {
  const byDay = new Map<string, number>();
  for (const r of rows) {
    byDay.set(r.fecha, (byDay.get(r.fecha) ?? 0) + (r.kwPromedioDia ?? 0));
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([fecha, kw]) => ({ fecha, kw }));
}
