/**
 * Cromatografías del gas combustible de Costayaco (ASTM D-1945-14).
 *
 * Se transcriben las dos muestras de laboratorio disponibles. El poder calorífico
 * real bruto/neto es el dato operativo: fija la eficiencia absoluta de los motores
 * una vez conocido el heat rate volumétrico.
 */

export type ChromatographyComponent = {
  name: string;
  formula: string;
  molPct: number;
};

export type GasChromatography = {
  id: "mru-tratado" | "cyc-crudo";
  label: string;
  shortLabel: string;
  sampleCondition: string;
  sampledAt: string;
  method: string;
  composition: ChromatographyComponent[];
  /** @ 14,65 psia, 60 °F */
  hhvIdealBtuScf: number;
  lhvIdealBtuScf: number;
  /** @ 14,69 psia, 60 °F — valores operativos del informe. */
  hhvRealBtuScf: number;
  lhvRealBtuScf: number;
  specificGravity: number;
  gpmC2Plus: number;
  gpmC3Plus: number;
  zFactor: number;
  wobbeUpperBtuScf: number;
  wobbeLowerBtuScf: number;
  h2sPpm: number;
  humidityMgL: number;
  dewPointF: number;
};

/** Peso molecular (lb/lbmol) y poder calorífico bruto ideal (BTU/scf, GPA 2145). */
const COMPONENT_PROPERTIES: Record<string, { mw: number; hhv: number }> = {
  CH4: { mw: 16.043, hhv: 1010.0 },
  C2H6: { mw: 30.07, hhv: 1769.7 },
  C3H8: { mw: 44.097, hhv: 2516.1 },
  "i-C4H10": { mw: 58.123, hhv: 3251.9 },
  "n-C4H10": { mw: 58.123, hhv: 3262.3 },
  "neo-C5H12": { mw: 72.15, hhv: 4000.9 },
  "i-C5H12": { mw: 72.15, hhv: 4000.9 },
  "n-C5H12": { mw: 72.15, hhv: 4008.9 },
  "n-C6H14": { mw: 86.177, hhv: 4755.9 },
  "n-C7H16": { mw: 100.204, hhv: 5502.5 },
  "n-C8H18": { mw: 114.231, hhv: 6248.9 },
  "n-C9H20": { mw: 128.258, hhv: 6996.5 },
  "n-C10H22": { mw: 142.285, hhv: 7742.9 },
  "n-C11H24": { mw: 156.312, hhv: 8489.4 },
  "n-C12H26": { mw: 170.338, hhv: 9235.6 },
  CO2: { mw: 44.01, hhv: 0 },
  N2: { mw: 28.014, hhv: 0 },
};

const AIR_MW = 28.9625;

function composition(rows: Array<[string, string, number]>): ChromatographyComponent[] {
  return rows.map(([name, formula, molPct]) => ({ name, formula, molPct }));
}

/** Tipo 1 · gas tratado a la salida del MRU — es el que queman las unidades sin línea Moqueta. */
export const GAS_MRU_TRATADO: GasChromatography = {
  id: "mru-tratado",
  label: "Gas tratado salida MRU Costayaco",
  shortLabel: "Gas tratado MRU",
  sampleCondition: "Salida gas tratado MRU · chiller activado (CYC)",
  sampledAt: "2025-07-31",
  method: "ASTM D-1945-14 (2019) · cromatografía FID/TCD",
  composition: composition([
    ["Metano", "CH4", 41.5],
    ["Etano", "C2H6", 16.68],
    ["Propano", "C3H8", 15.49],
    ["i-Butano", "i-C4H10", 1.46],
    ["n-Butano", "n-C4H10", 2.91],
    ["Neopentano", "neo-C5H12", 0.006],
    ["i-Pentano", "i-C5H12", 0.38],
    ["n-Pentano", "n-C5H12", 0.306],
    ["n-Hexano (+)", "n-C6H14", 0.064],
    ["n-Heptano (+)", "n-C7H16", 0.033],
    ["n-Octano (+)", "n-C8H18", 0.016],
    ["n-Nonano (+)", "n-C9H20", 0.006],
    ["n-Decano (+)", "n-C10H22", 0.002],
    ["n-Undecano", "n-C11H24", 0],
    ["n-Dodecano (+)", "n-C12H26", 0],
    ["Dióxido de carbono", "CO2", 9.9],
    ["Nitrógeno", "N2", 11.25],
  ]),
  hhvIdealBtuScf: 1297,
  lhvIdealBtuScf: 1169,
  hhvRealBtuScf: 1290,
  lhvRealBtuScf: 1178,
  specificGravity: 1.23,
  gpmC2Plus: 10.4,
  gpmC3Plus: 5.95,
  zFactor: 0.771,
  wobbeUpperBtuScf: 1282,
  wobbeLowerBtuScf: 1061,
  h2sPpm: 1,
  humidityMgL: 2,
  dewPointF: -80.4,
};

/** Tipo 2 · gas de producción CYC sin tratar — referencia del gas de entrada al MRU. */
export const GAS_CYC_CRUDO: GasChromatography = {
  id: "cyc-crudo",
  label: "Gas de producción CYC sin tratamiento",
  shortLabel: "Gas CYC crudo",
  sampleCondition: "Gas de producción Costayaco sin tratamiento",
  sampledAt: "2025-07-31",
  method: "ASTM D-1945-14 (2019) · cromatografía FID/TCD",
  composition: composition([
    ["Metano", "CH4", 28.6],
    ["Etano", "C2H6", 13.87],
    ["Propano", "C3H8", 21.95],
    ["i-Butano", "i-C4H10", 3.98],
    ["n-Butano", "n-C4H10", 12.86],
    ["Neopentano", "neo-C5H12", 0.009],
    ["i-Pentano", "i-C5H12", 3.2],
    ["n-Pentano", "n-C5H12", 3.1],
    ["n-Hexano (+)", "n-C6H14", 0.659],
    ["n-Heptano (+)", "n-C7H16", 0.175],
    ["n-Octano (+)", "n-C8H18", 0.043],
    ["n-Nonano (+)", "n-C9H20", 0.01],
    ["n-Decano (+)", "n-C10H22", 0.002],
    ["n-Undecano", "n-C11H24", 0],
    ["n-Dodecano (+)", "n-C12H26", 0],
    ["Dióxido de carbono", "CO2", 7.36],
    ["Nitrógeno", "N2", 4.19],
  ]),
  hhvIdealBtuScf: 1966,
  lhvIdealBtuScf: 1771,
  hhvRealBtuScf: 1960,
  lhvRealBtuScf: 1799,
  specificGravity: 1.6,
  gpmC2Plus: 17.72,
  gpmC3Plus: 14.03,
  zFactor: 0.535,
  wobbeUpperBtuScf: 1701,
  wobbeLowerBtuScf: 1421,
  h2sPpm: 0.13,
  humidityMgL: 1.01,
  dewPointF: -92.4,
};

export const GAS_CHROMATOGRAPHIES = [GAS_MRU_TRATADO, GAS_CYC_CRUDO];

export type ChromatographyCheck = {
  sumMolPct: number;
  molarWeight: number;
  specificGravity: number;
  hhvFromCompositionBtuScf: number;
  /** Desviación del HHV calculado frente al reportado por el laboratorio (%). */
  hhvDeviationPct: number;
  /** Metano + etano: proxy del número de metano y de la tendencia a detonar. */
  lightEndsPct: number;
  inertsPct: number;
  c3PlusPct: number;
};

/** Recalcula la muestra desde su composición para validar el informe de laboratorio. */
export function checkChromatography(gas: GasChromatography): ChromatographyCheck {
  let sum = 0;
  let mw = 0;
  let hhv = 0;
  let lightEnds = 0;
  let inerts = 0;
  let c3Plus = 0;
  for (const c of gas.composition) {
    const props = COMPONENT_PROPERTIES[c.formula];
    const x = c.molPct / 100;
    sum += c.molPct;
    if (!props) continue;
    mw += props.mw * x;
    hhv += props.hhv * x;
    if (c.formula === "CH4" || c.formula === "C2H6") lightEnds += c.molPct;
    else if (c.formula === "CO2" || c.formula === "N2") inerts += c.molPct;
    else c3Plus += c.molPct;
  }
  return {
    sumMolPct: sum,
    molarWeight: mw,
    specificGravity: mw / AIR_MW,
    hhvFromCompositionBtuScf: hhv,
    hhvDeviationPct: ((hhv - gas.hhvIdealBtuScf) / gas.hhvIdealBtuScf) * 100,
    lightEndsPct: lightEnds,
    inertsPct: inerts,
    c3PlusPct: c3Plus,
  };
}
