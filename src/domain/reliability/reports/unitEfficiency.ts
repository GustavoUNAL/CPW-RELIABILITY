import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";
import { gasMoquetaMonth } from "./gasMoquetaData";
import { KWH_TO_BTU, REPORT_HEATING_VALUE, efficiencyFromHeatRate } from "./energyEfficiency";

/**
 * Eficiencia estimada por máquina.
 *
 * Solo la línea de Moqueta (CPW04–CPW06) tiene totalizador, así que el heat rate
 * medido de ese ramal se usa como ancla: se lleva a condición de plena carga con
 * una curva de consumo específico y desde ahí se reparte al resto de la flota por
 * factor de carga. Es una estimación, pero cierra contra el gas realmente medido.
 */

export type GasSupply = "moqueta" | "mru" | "vonu";

/** Ramal de gas por unidad según el log de operación y las bitácoras de salida del MRU. */
export const GAS_SUPPLY_BY_UNIT: Record<string, GasSupply> = {
  CPW01: "mru",
  CPW02: "mru",
  CPW03: "mru",
  CPW04: "moqueta",
  CPW05: "moqueta",
  CPW06: "moqueta",
  CPW07: "mru",
  G101V: "mru",
  G102J: "mru",
  G102K: "mru",
  "JIN-10": "mru",
  "JIN-11": "mru",
  "JIN-12": "mru",
  "JIN-01": "vonu",
  "JIN-02": "vonu",
};

export const GAS_SUPPLY_LABEL: Record<GasSupply, string> = {
  moqueta: "Línea Moqueta",
  mru: "Gas tratado MRU",
  vonu: "Vonu",
};

/**
 * CPW07 (G57) no tiene columna de set point en el log de gas. Se le asigna el
 * nominal de sus hermanas G51–G53, coherente con su carga media observada.
 */
const ASSUMED_NOMINAL_KW: Record<string, number> = { CPW07: 780 };

/**
 * Todos los ramales se valoran con el mismo poder calorífico de referencia para
 * que las unidades sean comparables entre sí y contra los meses anteriores. El
 * efecto de la cromatografía real se publica como escenario en la lámina.
 */
export function heatingValuesForSupply(): { hhv: number; lhv: number } {
  return { hhv: REPORT_HEATING_VALUE.hhvBtuScf, lhv: REPORT_HEATING_VALUE.lhvBtuScf };
}

/**
 * Consumo específico relativo frente a plena carga en motores de gas de ciclo Otto.
 * A carga parcial el motor mantiene pérdidas fijas, así que gasta más gas por kWh.
 */
const PART_LOAD_CURVE: Array<[loadFactor: number, relativeConsumption: number]> = [
  [1.0, 1.0],
  [0.9, 1.01],
  [0.8, 1.03],
  [0.75, 1.045],
  [0.7, 1.065],
  [0.6, 1.115],
  [0.5, 1.185],
  [0.4, 1.295],
  [0.3, 1.47],
  [0.2, 1.78],
];

/** Interpola la curva de carga parcial; fuera de rango se satura en los extremos. */
export function partLoadPenalty(loadFactor: number | null): number | null {
  if (loadFactor == null || loadFactor <= 0) return null;
  if (loadFactor >= 1) return 1;
  if (loadFactor <= 0.2) return 1.78;
  for (let i = 0; i < PART_LOAD_CURVE.length - 1; i++) {
    const [hiLf, hiPen] = PART_LOAD_CURVE[i];
    const [loLf, loPen] = PART_LOAD_CURVE[i + 1];
    if (loadFactor <= hiLf && loadFactor >= loLf) {
      const t = (loadFactor - loLf) / (hiLf - loLf);
      return loPen + t * (hiPen - loPen);
    }
  }
  return 1;
}

export type UnitEfficiencyRow = {
  unit: string;
  field: string;
  supply: GasSupply;
  energyKwh: number;
  opHours: number;
  avgLoadKw: number | null;
  /** Set point de diseño del log de operación; null si la unidad no se registra ahí. */
  nominalKw: number | null;
  /** Promedio del set point: por debajo del diseño indica derateo por detonación. */
  operatedNominalKw: number | null;
  /** El nominal no viene del log de gas sino de la familia de motores. */
  nominalAssumed: boolean;
  loadFactorPct: number | null;
  partLoadPenalty: number | null;
  heatRateFt3Kwh: number | null;
  efficiencyHhvPct: number | null;
  efficiencyLhvPct: number | null;
  gasMcf: number | null;
  energyInputMmbtu: number | null;
  /** El gas del ramal Moqueta está medido; el resto se estima con la curva. */
  gasMeasured: boolean;
};

export type UnitEfficiencySnapshot = {
  monthKey: string;
  monthLabel: string;
  /** Eficiencia del ancla medida (ramal Moqueta) en la ventana con totalizador. */
  anchorEfficiencyHhvPct: number | null;
  anchorHeatRateFt3Kwh: number | null;
  anchorWindow: { from: string; to: string; coveragePct: number | null } | null;
  /** Eficiencia extrapolada a plena carga: base del reparto por unidad. */
  fullLoadEfficiencyHhvPct: number | null;
  rows: UnitEfficiencyRow[];
  totals: {
    /** Energía de las unidades con eficiencia estimada. */
    energyKwh: number;
    /** Energía de todas las unidades de Costayaco, con y sin nominal. */
    energyKwhAll: number;
    gasMcf: number | null;
    energyInputMmbtu: number | null;
    efficiencyHhvPct: number | null;
    /** Gas que se ahorraría llevando cada unidad al factor de carga de la mejor. */
    gasSavingMcf: number | null;
  };
};

const MEASURED_UNITS = new Set(["CPW04", "CPW05", "CPW06"]);

export function buildUnitEfficiency(monthKey: string): UnitEfficiencySnapshot | null {
  const gte = GRAN_TIERRA_MONTHLY_DATA[monthKey as GranTierraMonthKey];
  const gas = gasMoquetaMonth(monthKey);
  if (!gte || !gas) return null;

  const nominalByUnit = new Map(gas.nominalPower.map((n) => [n.unit, n]));
  // Ancla: eficiencia del ramal medido, llevada a plena carga con la curva.
  const anchorEfficiency = efficiencyFromHeatRate(
    gas.heatRateFt3Kwh,
    REPORT_HEATING_VALUE.hhvBtuScf,
  );
  let weightedPenalty: number | null = null;
  if (gas.unitsInWindow.length) {
    let num = 0;
    let den = 0;
    for (const u of gas.unitsInWindow) {
      const nominal = nominalByUnit.get(u.unit)?.designKw;
      if (!nominal || u.opHours <= 0 || u.energyKwh <= 0) continue;
      const penalty = partLoadPenalty(u.energyKwh / u.opHours / nominal);
      if (penalty == null) continue;
      num += u.energyKwh * penalty;
      den += u.energyKwh;
    }
    weightedPenalty = den > 0 ? num / den : null;
  }
  const fullLoadEfficiency =
    anchorEfficiency != null && weightedPenalty != null ? anchorEfficiency * weightedPenalty : null;

  const rows: UnitEfficiencyRow[] = [];
  for (const eq of gte.generationByEquipment) {
    const supply = GAS_SUPPLY_BY_UNIT[eq.equipo] ?? "mru";
    if (supply === "vonu") continue;

    const nominal = nominalByUnit.get(eq.equipo) ?? null;
    const assumedNominal = nominal ? null : (ASSUMED_NOMINAL_KW[eq.equipo] ?? null);
    const designKw = nominal?.designKw ?? assumedNominal;
    const energyKwh = eq.energiaKwh;
    const opHours = eq.horasOperacion;
    const avgLoadKw = opHours > 0 ? energyKwh / opHours : null;
    const loadFactor = avgLoadKw != null && designKw ? avgLoadKw / designKw : null;
    const penalty = partLoadPenalty(loadFactor);
    const efficiencyHhv =
      fullLoadEfficiency != null && penalty != null ? fullLoadEfficiency / penalty : null;
    const { hhv, lhv } = heatingValuesForSupply();
    const heatRate =
      efficiencyHhv != null && efficiencyHhv > 0
        ? KWH_TO_BTU / ((efficiencyHhv / 100) * hhv)
        : null;
    const gasMcf = heatRate != null ? (heatRate * energyKwh) / 1000 : null;

    rows.push({
      unit: eq.equipo,
      field: eq.campo,
      supply,
      energyKwh,
      opHours,
      avgLoadKw,
      nominalKw: designKw,
      operatedNominalKw: nominal?.operatedKw ?? null,
      nominalAssumed: nominal == null && assumedNominal != null,
      loadFactorPct: loadFactor != null ? loadFactor * 100 : null,
      partLoadPenalty: penalty,
      heatRateFt3Kwh: heatRate,
      efficiencyHhvPct: efficiencyHhv,
      efficiencyLhvPct: efficiencyHhv != null ? efficiencyHhv * (hhv / lhv) : null,
      gasMcf,
      energyInputMmbtu: gasMcf != null ? (gasMcf * 1000 * hhv) / 1_000_000 : null,
      gasMeasured: MEASURED_UNITS.has(eq.equipo),
    });
  }

  rows.sort((a, b) => b.energyKwh - a.energyKwh);

  // Los totales solo cubren las unidades con nominal conocido: sin él no hay gas estimado.
  const withGas = rows.filter((r) => r.gasMcf != null);
  const energyKwh = withGas.reduce((s, r) => s + r.energyKwh, 0);
  const energyKwhAll = rows.reduce((s, r) => s + r.energyKwh, 0);
  const gasMcf = withGas.length ? withGas.reduce((s, r) => s + (r.gasMcf ?? 0), 0) : null;
  const mmbtu = withGas.length ? withGas.reduce((s, r) => s + (r.energyInputMmbtu ?? 0), 0) : null;
  const totalEfficiency =
    mmbtu != null && mmbtu > 0 ? ((energyKwh * KWH_TO_BTU) / (mmbtu * 1_000_000)) * 100 : null;

  // Potencial: llevar cada unidad al mejor factor de carga observado del mes.
  const bestPenalty = rows.reduce<number | null>(
    (best, r) => (r.partLoadPenalty != null && (best == null || r.partLoadPenalty < best) ? r.partLoadPenalty : best),
    null,
  );
  const gasSavingMcf =
    bestPenalty != null
      ? rows.reduce((s, r) => {
          if (r.gasMcf == null || r.partLoadPenalty == null) return s;
          return s + r.gasMcf * (1 - bestPenalty / r.partLoadPenalty);
        }, 0)
      : null;

  const coveragePct = (() => {
    const moquetaMonthly = rows
      .filter((r) => r.supply === "moqueta")
      .reduce((s, r) => s + r.energyKwh, 0);
    return moquetaMonthly > 0 ? (gas.energyKwh / moquetaMonthly) * 100 : null;
  })();

  return {
    monthKey: gas.monthKey,
    monthLabel: gas.monthLabel,
    anchorEfficiencyHhvPct: anchorEfficiency,
    anchorHeatRateFt3Kwh: gas.heatRateFt3Kwh,
    anchorWindow: { from: gas.from, to: gas.to, coveragePct },
    fullLoadEfficiencyHhvPct: fullLoadEfficiency,
    rows,
    totals: {
      energyKwh,
      energyKwhAll,
      gasMcf,
      energyInputMmbtu: mmbtu,
      efficiencyHhvPct: totalEfficiency,
      gasSavingMcf,
    },
  };
}
