import { EQUIPO_BY_ID } from "./constants";
import type { EquipoId, Planta, ResumenDiario } from "./types";

/** HHV típico gas natural (BTU/scf) para estimar eficiencia eléctrica. */
export const GAS_HHV_BTU_SCF = 1000;
/** Equivalente térmico de 1 kWh eléctrico. */
export const KWH_TO_BTU = 3412;

export type EficienciaGrain = "dia" | "mes";

export type EficienciaAgg = {
  key: string;
  label: string;
  energiaKwh: number;
  gasFt3: number;
  heatRateFt3Kwh: number | null;
  eficienciaPct: number | null;
  diasConDato: number;
};

/**
 * Volumen de gas del día (ft³).
 * En el pack, `consumoGasFt3Kwh` a menudo trae ft³ totales (= Mscfd×1000);
 * solo valores &lt; 50 se tratan como heat rate real (ft³/kWh).
 */
export function gasFt3FromResumen(r: ResumenDiario): number | null {
  if (r.consumoGasMscfd != null && r.consumoGasMscfd > 0) {
    return r.consumoGasMscfd * 1000;
  }
  const v = r.consumoGasFt3Kwh;
  if (v == null || v <= 0) return null;
  if (v < 50) {
    const kwh = r.kwAcumuladoDia;
    if (kwh != null && kwh > 0) return v * kwh;
    return null;
  }
  return v;
}

export function heatRateFromResumen(r: ResumenDiario): number | null {
  const kwh = r.kwAcumuladoDia;
  if (kwh != null && kwh > 0) {
    const gas = gasFt3FromResumen(r);
    if (gas != null && gas > 0) return gas / kwh;
  }
  const v = r.consumoGasFt3Kwh;
  if (v != null && v > 0 && v < 50) return v;
  return null;
}

/** η% ≈ 3412 / (heatRate_ft³/kWh × HHV_BTU/scf) × 100 */
export function eficienciaFromHeatRate(heatRateFt3Kwh: number | null | undefined): number | null {
  if (heatRateFt3Kwh == null || heatRateFt3Kwh <= 0) return null;
  return (KWH_TO_BTU / (heatRateFt3Kwh * GAS_HHV_BTU_SCF)) * 100;
}

function finalizeAgg(key: string, label: string, energiaKwh: number, gasFt3: number, diasConDato: number): EficienciaAgg {
  const heatRateFt3Kwh = energiaKwh > 0 && gasFt3 > 0 ? gasFt3 / energiaKwh : null;
  return {
    key,
    label,
    energiaKwh,
    gasFt3,
    heatRateFt3Kwh,
    eficienciaPct: eficienciaFromHeatRate(heatRateFt3Kwh),
    diasConDato,
  };
}

function accumulate(
  map: Map<string, { label: string; energiaKwh: number; gasFt3: number; dias: number }>,
  key: string,
  label: string,
  r: ResumenDiario,
) {
  const gas = gasFt3FromResumen(r);
  const kwh = r.kwAcumuladoDia ?? 0;
  if ((gas == null || gas <= 0) && kwh <= 0) return;
  const prev = map.get(key) ?? { label, energiaKwh: 0, gasFt3: 0, dias: 0 };
  prev.energiaKwh += kwh > 0 ? kwh : 0;
  prev.gasFt3 += gas != null && gas > 0 ? gas : 0;
  if ((gas != null && gas > 0) || kwh > 0) prev.dias += 1;
  map.set(key, prev);
}

export function eficienciaGeneral(rows: ResumenDiario[]): EficienciaAgg {
  let energiaKwh = 0;
  let gasFt3 = 0;
  let diasConDato = 0;
  for (const r of rows) {
    const gas = gasFt3FromResumen(r);
    const kwh = r.kwAcumuladoDia ?? 0;
    if ((gas == null || gas <= 0) && kwh <= 0) continue;
    energiaKwh += kwh > 0 ? kwh : 0;
    gasFt3 += gas != null && gas > 0 ? gas : 0;
    diasConDato += 1;
  }
  return finalizeAgg("all", "General", energiaKwh, gasFt3, diasConDato);
}

export function eficienciaByEquipo(rows: ResumenDiario[]): EficienciaAgg[] {
  const map = new Map<string, { label: string; energiaKwh: number; gasFt3: number; dias: number }>();
  for (const r of rows) {
    const eq = EQUIPO_BY_ID[r.equipoId];
    accumulate(map, r.equipoId, eq?.label ?? r.equipoId, r);
  }
  return [...map.entries()]
    .map(([key, v]) => finalizeAgg(key, v.label, v.energiaKwh, v.gasFt3, v.dias))
    .filter((a) => a.gasFt3 > 0 || a.energiaKwh > 0)
    .sort((a, b) => (b.eficienciaPct ?? -1) - (a.eficienciaPct ?? -1));
}

export function eficienciaByCampo(rows: ResumenDiario[]): EficienciaAgg[] {
  const map = new Map<string, { label: string; energiaKwh: number; gasFt3: number; dias: number }>();
  for (const r of rows) {
    const planta = (EQUIPO_BY_ID[r.equipoId]?.planta ?? "Costayaco") as Planta;
    accumulate(map, planta, planta, r);
  }
  return [...map.entries()]
    .map(([key, v]) => finalizeAgg(key, v.label, v.energiaKwh, v.gasFt3, v.dias))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function eficienciaSerie(
  rows: ResumenDiario[],
  grain: EficienciaGrain,
  groupBy: "general" | "campo" | EquipoId,
): { periodo: string; label: string; energiaKwh: number; gasFt3: number; heatRateFt3Kwh: number | null; eficienciaPct: number | null }[] {
  const map = new Map<string, { label: string; energiaKwh: number; gasFt3: number }>();
  for (const r of rows) {
    const periodo = grain === "mes" ? r.fecha.slice(0, 7) : r.fecha;
    const planta = EQUIPO_BY_ID[r.equipoId]?.planta ?? "Costayaco";
    let seriesKey: string;
    let label: string;
    if (groupBy === "general") {
      seriesKey = periodo;
      label = "General";
    } else if (groupBy === "campo") {
      seriesKey = `${periodo}|${planta}`;
      label = planta;
    } else {
      if (r.equipoId !== groupBy) continue;
      seriesKey = periodo;
      label = EQUIPO_BY_ID[r.equipoId]?.label ?? r.equipoId;
    }
    const gas = gasFt3FromResumen(r);
    const kwh = r.kwAcumuladoDia ?? 0;
    if ((gas == null || gas <= 0) && kwh <= 0) continue;
    const prev = map.get(seriesKey) ?? { label, energiaKwh: 0, gasFt3: 0 };
    prev.energiaKwh += kwh > 0 ? kwh : 0;
    prev.gasFt3 += gas != null && gas > 0 ? gas : 0;
    map.set(seriesKey, prev);
  }
  return [...map.entries()]
    .map(([seriesKey, v]) => {
      const periodo = seriesKey.includes("|") ? seriesKey.split("|")[0]! : seriesKey;
      const heatRateFt3Kwh = v.energiaKwh > 0 && v.gasFt3 > 0 ? v.gasFt3 / v.energiaKwh : null;
      return {
        periodo,
        label: v.label,
        energiaKwh: v.energiaKwh,
        gasFt3: v.gasFt3,
        heatRateFt3Kwh,
        eficienciaPct: eficienciaFromHeatRate(heatRateFt3Kwh),
      };
    })
    .sort((a, b) => a.periodo.localeCompare(b.periodo) || a.label.localeCompare(b.label));
}

/** Pivot para gráfico: una fila por período con columnas por campo. */
export function eficienciaSerieCampoChart(
  rows: ResumenDiario[],
  grain: EficienciaGrain,
): Record<string, string | number | null>[] {
  const serie = eficienciaSerie(rows, grain, "campo");
  const byPeriod = new Map<string, Record<string, string | number | null>>();
  for (const s of serie) {
    const row = byPeriod.get(s.periodo) ?? { periodo: s.periodo };
    row[s.label] = s.eficienciaPct != null ? Number(s.eficienciaPct.toFixed(2)) : null;
    byPeriod.set(s.periodo, row);
  }
  return [...byPeriod.values()].sort((a, b) => String(a.periodo).localeCompare(String(b.periodo)));
}
