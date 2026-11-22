import { GAS_CYC_CRUDO, GAS_MRU_TRATADO } from "./gasChromatography";
import { GAS_MOQUETA, gasMoquetaMonth, type GasMoquetaMonth } from "./gasMoquetaData";

/** Equivalente térmico de 1 kWh eléctrico. */
export const KWH_TO_BTU = 3412;

/**
 * Poder calorífico de referencia del informe.
 *
 * El heat rate volumétrico está medido con totalizador, así que el poder
 * calorífico es el único parámetro que fija la eficiencia absoluta. La línea de
 * Moqueta llega por ducto propio a 150 psi y no tiene cromatografía: las dos
 * muestras disponibles son de la salida del MRU y de la producción CYC cruda.
 * Se conserva la base de 1000 BTU/scf de los informes anteriores para que la
 * comparación mes a mes sea homogénea, y las cromatografías se publican como
 * escenarios medidos.
 */
export const REPORT_HEATING_VALUE = {
  hhvBtuScf: 1000,
  lhvBtuScf: 900,
  label: "Gas natural de referencia",
  source: "Base 1000 BTU/scf de los informes anteriores · cromatografía de la línea pendiente",
  measuredOnLine: false,
} as const;

/** Eficiencia publicada en informes previos, para conciliar la comparación. */
export const REPORTED_EFFICIENCY_HHV_PCT: Record<string, number> = { Jun: 38 };

export const EFICIENCIA_MEDIDA_FORMULA =
  "%Eff = 3412 / HR (BTU/kWh) × 100, con HR = gas medido (ft³/kWh) × poder calorífico (BTU/ft³)";

/** Heat rate térmico (BTU/kWh) a partir del volumétrico y el poder calorífico. */
export function heatRateBtuKwh(
  heatRateFt3Kwh: number | null | undefined,
  btuScf: number,
): number | null {
  if (heatRateFt3Kwh == null || heatRateFt3Kwh <= 0 || btuScf <= 0) return null;
  return heatRateFt3Kwh * btuScf;
}

/** %Eff = 3412 / HR(BTU/kWh) × 100, con HR térmico derivado del volumétrico. */
export function efficiencyFromHeatRate(
  heatRateFt3Kwh: number | null | undefined,
  btuScf: number,
): number | null {
  const thermal = heatRateBtuKwh(heatRateFt3Kwh, btuScf);
  if (thermal == null) return null;
  const pct = (KWH_TO_BTU / thermal) * 100;
  return pct > 0 && pct <= 100 ? pct : null;
}

export type EfficiencyScenarioRow = {
  id: string;
  label: string;
  detail: string;
  hhvBtuScf: number;
  lhvBtuScf: number;
  efficiencyHhvPct: number | null;
  efficiencyLhvPct: number | null;
  isReference: boolean;
};

/** Escenarios de poder calorífico: las dos cromatografías reales y su mezcla. */
function scenarioRows(heatRate: number | null): EfficiencyScenarioRow[] {
  const blendHhv = Math.round((GAS_MRU_TRATADO.hhvRealBtuScf + GAS_CYC_CRUDO.hhvRealBtuScf) / 2);
  const blendLhv = Math.round((GAS_MRU_TRATADO.lhvRealBtuScf + GAS_CYC_CRUDO.lhvRealBtuScf) / 2);
  const defs: Array<Omit<EfficiencyScenarioRow, "efficiencyHhvPct" | "efficiencyLhvPct">> = [
    {
      id: "referencia",
      label: REPORT_HEATING_VALUE.label,
      detail: "Base de los informes anteriores · comparación homogénea",
      hhvBtuScf: REPORT_HEATING_VALUE.hhvBtuScf,
      lhvBtuScf: REPORT_HEATING_VALUE.lhvBtuScf,
      isReference: true,
    },
    {
      id: GAS_MRU_TRATADO.id,
      label: GAS_MRU_TRATADO.shortLabel,
      detail: `Cromatografía ${GAS_MRU_TRATADO.sampledAt} · ${GAS_MRU_TRATADO.sampleCondition}`,
      hhvBtuScf: GAS_MRU_TRATADO.hhvRealBtuScf,
      lhvBtuScf: GAS_MRU_TRATADO.lhvRealBtuScf,
      isReference: false,
    },
    {
      id: "mezcla",
      label: "Mezcla 50/50",
      detail: "Escenario intermedio tratado + crudo",
      hhvBtuScf: blendHhv,
      lhvBtuScf: blendLhv,
      isReference: false,
    },
    {
      id: GAS_CYC_CRUDO.id,
      label: GAS_CYC_CRUDO.shortLabel,
      detail: `Cromatografía ${GAS_CYC_CRUDO.sampledAt} · sin tratamiento`,
      hhvBtuScf: GAS_CYC_CRUDO.hhvRealBtuScf,
      lhvBtuScf: GAS_CYC_CRUDO.lhvRealBtuScf,
      isReference: false,
    },
  ];
  return defs.map((d) => ({
    ...d,
    efficiencyHhvPct: efficiencyFromHeatRate(heatRate, d.hhvBtuScf),
    efficiencyLhvPct: efficiencyFromHeatRate(heatRate, d.lhvBtuScf),
  }));
}

export type EnergyEfficiencySnapshot = {
  month: GasMoquetaMonth;
  heatRateFt3Kwh: number | null;
  /** Heat rate térmico: es el HR de la fórmula %Eff = 3412 / HR × 100. */
  heatRateBtuKwh: number | null;
  /** kWh por cada mil pies cúbicos: lectura directa para operación. */
  kwhPerMcf: number | null;
  efficiencyHhvPct: number | null;
  efficiencyLhvPct: number | null;
  /** Coste térmico del mes en MMBTU al poder calorífico de referencia. */
  energyInputMmbtu: number | null;
  scenarios: EfficiencyScenarioRow[];
  previous: {
    month: GasMoquetaMonth;
    heatRateFt3Kwh: number | null;
    efficiencyHhvPct: number | null;
    /** Eficiencia publicada en el informe de ese mes, si existe. */
    reportedEfficiencyPct: number | null;
    deltaHeatRatePct: number | null;
    deltaEfficiencyPp: number | null;
  } | null;
  /** Gas extra consumido frente al heat rate del mes anterior, en MCF. */
  gasExcessMcf: number | null;
};

export function buildEnergyEfficiency(monthKey: string): EnergyEfficiencySnapshot | null {
  const month = gasMoquetaMonth(monthKey);
  if (!month) return null;

  const heatRate = month.heatRateFt3Kwh;
  const { hhvBtuScf, lhvBtuScf } = REPORT_HEATING_VALUE;
  const idx = GAS_MOQUETA.months.findIndex((m) => m.monthKey === monthKey);
  const prev = idx > 0 ? GAS_MOQUETA.months[idx - 1] : null;

  const previous = prev
    ? {
        month: prev,
        heatRateFt3Kwh: prev.heatRateFt3Kwh,
        efficiencyHhvPct: efficiencyFromHeatRate(prev.heatRateFt3Kwh, hhvBtuScf),
        reportedEfficiencyPct: REPORTED_EFFICIENCY_HHV_PCT[prev.monthKey] ?? null,
        deltaHeatRatePct:
          heatRate != null && prev.heatRateFt3Kwh
            ? ((heatRate - prev.heatRateFt3Kwh) / prev.heatRateFt3Kwh) * 100
            : null,
        deltaEfficiencyPp: (() => {
          const cur = efficiencyFromHeatRate(heatRate, hhvBtuScf);
          const old = efficiencyFromHeatRate(prev.heatRateFt3Kwh, hhvBtuScf);
          return cur != null && old != null ? cur - old : null;
        })(),
      }
    : null;

  return {
    month,
    heatRateFt3Kwh: heatRate,
    heatRateBtuKwh: heatRateBtuKwh(heatRate, hhvBtuScf),
    kwhPerMcf: heatRate != null && heatRate > 0 ? 1000 / heatRate : null,
    efficiencyHhvPct: efficiencyFromHeatRate(heatRate, hhvBtuScf),
    efficiencyLhvPct: efficiencyFromHeatRate(heatRate, lhvBtuScf),
    energyInputMmbtu: (month.gasMcf * 1000 * hhvBtuScf) / 1_000_000,
    scenarios: scenarioRows(heatRate),
    previous,
    gasExcessMcf:
      previous?.heatRateFt3Kwh != null && heatRate != null
        ? ((heatRate - previous.heatRateFt3Kwh) * month.energyKwh) / 1000
        : null,
  };
}
