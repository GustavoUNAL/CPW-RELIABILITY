import { EQUIPO_BY_ID } from "./constants";
import type { EquipoId, Planta, ResumenDiario } from "./types";

/** HHV típico gas natural (BTU/scf) para estimar eficiencia eléctrica. */
export const GAS_HHV_BTU_SCF = 1000;
/** Equivalente térmico de 1 kWh eléctrico. */
export const KWH_TO_BTU = 3412;

/**
 * Banda operativa de heat rate (ft³/kWh) para motores a gas del campo.
 * Fuera de rango se descarta (datos basura / columnas mal mapeadas).
 */
export const HEAT_RATE_MIN_FT3_KWH = 6;
export const HEAT_RATE_MAX_FT3_KWH = 20;

/** Texto de fórmula para UI. */
export const EFICIENCIA_FORMULA =
  "η% = 3412 / (HR × HHV) × 100, con HR = gas_ft³ / kWh (solo días con gas y energía válidos) y HHV = 1000 BTU/scf";

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

export function isPlausibleHeatRate(hr: number | null | undefined): hr is number {
  return hr != null && hr >= HEAT_RATE_MIN_FT3_KWH && hr <= HEAT_RATE_MAX_FT3_KWH;
}

/**
 * Volumen de gas del día (ft³) solo si el heat rate resultante es plausible.
 * En el pack, `consumoGasFt3Kwh` a menudo trae ft³ totales (= Mscfd×1000);
 * valores &lt; 50 se tratan como heat rate (ft³/kWh).
 */
export function gasFt3FromResumen(r: ResumenDiario): number | null {
  const kwh = r.kwAcumuladoDia;
  if (kwh == null || kwh <= 0) return null;

  if (r.consumoGasMscfd != null && r.consumoGasMscfd > 0) {
    const gas = r.consumoGasMscfd * 1000;
    return isPlausibleHeatRate(gas / kwh) ? gas : null;
  }

  const v = r.consumoGasFt3Kwh;
  if (v == null || v <= 0) return null;

  if (v < 50) {
    return isPlausibleHeatRate(v) ? v * kwh : null;
  }

  const hr = v / kwh;
  return isPlausibleHeatRate(hr) ? v : null;
}

export function heatRateFromResumen(r: ResumenDiario): number | null {
  const kwh = r.kwAcumuladoDia;
  const gas = gasFt3FromResumen(r);
  if (kwh == null || kwh <= 0 || gas == null || gas <= 0) return null;
  const hr = gas / kwh;
  return isPlausibleHeatRate(hr) ? hr : null;
}

/** η% = 3412 / (heatRate_ft³/kWh × HHV_BTU/scf) × 100 */
export function eficienciaFromHeatRate(heatRateFt3Kwh: number | null | undefined): number | null {
  if (!isPlausibleHeatRate(heatRateFt3Kwh)) return null;
  const pct = (KWH_TO_BTU / (heatRateFt3Kwh * GAS_HHV_BTU_SCF)) * 100;
  if (pct <= 0 || pct > 100) return null;
  return pct;
}

function finalizeAgg(
  key: string,
  label: string,
  energiaKwh: number,
  gasFt3: number,
  diasConDato: number,
): EficienciaAgg {
  const heatRateFt3Kwh =
    energiaKwh > 0 && gasFt3 > 0 && isPlausibleHeatRate(gasFt3 / energiaKwh)
      ? gasFt3 / energiaKwh
      : null;
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

/** Solo acumula días con gas y energía emparejados y heat rate plausible. */
function accumulate(
  map: Map<string, { label: string; energiaKwh: number; gasFt3: number; dias: number }>,
  key: string,
  label: string,
  r: ResumenDiario,
) {
  const gas = gasFt3FromResumen(r);
  const kwh = r.kwAcumuladoDia ?? 0;
  if (gas == null || gas <= 0 || kwh <= 0) return;
  const prev = map.get(key) ?? { label, energiaKwh: 0, gasFt3: 0, dias: 0 };
  prev.energiaKwh += kwh;
  prev.gasFt3 += gas;
  prev.dias += 1;
  map.set(key, prev);
}

export function eficienciaGeneral(rows: ResumenDiario[]): EficienciaAgg {
  let energiaKwh = 0;
  let gasFt3 = 0;
  let diasConDato = 0;
  for (const r of rows) {
    const gas = gasFt3FromResumen(r);
    const kwh = r.kwAcumuladoDia ?? 0;
    if (gas == null || gas <= 0 || kwh <= 0) continue;
    energiaKwh += kwh;
    gasFt3 += gas;
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
    .filter((a) => a.diasConDato > 0)
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
): {
  periodo: string;
  label: string;
  energiaKwh: number;
  gasFt3: number;
  heatRateFt3Kwh: number | null;
  eficienciaPct: number | null;
}[] {
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
    if (gas == null || gas <= 0 || kwh <= 0) continue;
    const prev = map.get(seriesKey) ?? { label, energiaKwh: 0, gasFt3: 0 };
    prev.energiaKwh += kwh;
    prev.gasFt3 += gas;
    map.set(seriesKey, prev);
  }
  return [...map.entries()]
    .map(([seriesKey, v]) => {
      const periodo = seriesKey.includes("|") ? seriesKey.split("|")[0]! : seriesKey;
      const heatRateFt3Kwh =
        v.energiaKwh > 0 && v.gasFt3 > 0 && isPlausibleHeatRate(v.gasFt3 / v.energiaKwh)
          ? v.gasFt3 / v.energiaKwh
          : null;
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

const MONTH_KEY_TO_NUM: Record<string, string> = {
  Ene: "01",
  Feb: "02",
  Mar: "03",
  Abr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Ago: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dic: "12",
};

/** Eficiencia de campo (Costayaco+Vonú+…) para un mes tipo "Jun" o "2026-06". */
export function eficienciaCampoSnapshot(
  rows: ResumenDiario[],
  monthKey: string,
  year = 2026,
): {
  general: EficienciaAgg;
  porCampo: EficienciaAgg[];
  yearMonth: string;
  formula: string;
} {
  const ym =
    monthKey.includes("-") && monthKey.length >= 7
      ? monthKey.slice(0, 7)
      : `${year}-${MONTH_KEY_TO_NUM[monthKey] ?? "01"}`;
  const filtered = rows.filter((r) => r.fecha.startsWith(ym));
  return {
    general: eficienciaGeneral(filtered),
    porCampo: eficienciaByCampo(filtered),
    yearMonth: ym,
    formula: EFICIENCIA_FORMULA,
  };
}
