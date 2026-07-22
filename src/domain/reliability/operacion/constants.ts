import type { DisponibilidadEstado, Equipo, Planta } from "./types";

export const ESTADO_COLOR: Record<DisponibilidadEstado, string> = {
  OP: "#16a34a",
  SB: "#2563eb",
  PE: "#ca8a04",
  MTO: "#ea580c",
  FS: "#dc2626",
  TR: "#64748b",
};

export const ESTADO_LABEL: Record<DisponibilidadEstado, string> = {
  OP: "Operación",
  SB: "Stand by",
  PE: "Parada emergencia",
  MTO: "Mantenimiento",
  FS: "Fuera de servicio",
  TR: "Trabajadas / rated",
};

export const PLANTAS: Planta[] = ["Costayaco", "Vonu", "Conejo"];

/** Catálogo contractual de equipos del reporte diario. */
export const EQUIPOS: Equipo[] = [
  { id: "G52-CPW01", sheetName: "G52-CPW01", label: "CPW01", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "G51-CPW02", sheetName: "G51-CPW02", label: "CPW02", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "G53-CPW03", sheetName: "G53-CPW03", label: "CPW03", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "G54-CPW04", sheetName: "G54-CPW04", label: "CPW04", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "G55-CPW05", sheetName: "G55-CPW05", label: "CPW05", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "G56-CPW06", sheetName: "G56-CPW06", label: "CPW06", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "G57-CPW07", sheetName: "G57-CPW07", label: "CPW07", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "JINAN-01", sheetName: "JINAN-01", label: "JINAN-01", planta: "Vonu", combustible: "gas", kwNominal: 450 },
  { id: "JINAN-02", sheetName: "JINAN-02", label: "JINAN-02", planta: "Vonu", combustible: "gas", kwNominal: 450 },
  { id: "JINAN-10", sheetName: "JINAN-10", label: "JINAN-10", planta: "Costayaco", combustible: "gas", kwNominal: 450 },
  { id: "JINAN-11", sheetName: "JINAN-11", label: "JINAN-11", planta: "Costayaco", combustible: "gas", kwNominal: 450 },
  { id: "JINAN-12", sheetName: "JINAN-12", label: "JINAN-12", planta: "Costayaco", combustible: "gas", kwNominal: 450 },
  { id: "G102-J", sheetName: "G102-J", label: "G102-J", planta: "Costayaco", combustible: "diesel", kwNominal: 500 },
  { id: "G102-K", sheetName: "G102-K", label: "G102-K", planta: "Costayaco", combustible: "diesel", kwNominal: 500 },
  { id: "G101-V", sheetName: "G101-V", label: "G101-V", planta: "Costayaco", combustible: "diesel", kwNominal: 500 },
  { id: "DIESEL-2", sheetName: "Diesel 2", label: "DIESEL-2", planta: "Costayaco", combustible: "diesel", kwNominal: 500 },
  { id: "KB600-06", sheetName: "GTE", label: "KB600-06", planta: "Conejo", combustible: "gas", kwNominal: 700 },
  { id: "GAS-2", sheetName: "GTE", label: "GAS-2", planta: "Conejo", combustible: "gas", kwNominal: 700 },
  { id: "KTA19-04", sheetName: "GTE", label: "KTA19-04", planta: "Conejo", combustible: "gas", kwNominal: 400 },
];

export const EQUIPO_BY_ID = Object.fromEntries(EQUIPOS.map((e) => [e.id, e])) as Record<string, Equipo>;

export const DEFAULT_SOURCE_XLSX =
  "data/Datos COPOWER/Reporte_Diario_Costayaco_Vonu 2026 actualizado 34.xlsx";

/** Columnas fijas en hojas horarias (índices 0-based del Excel). */
export const HOURLY_COLS = {
  fecha: 0,
  hora: 3,
  op: 5,
  sb: 7,
  pe: 9,
  mto: 11,
  fs: 13,
  tr: 15,
  vl1: 17,
  vl2: 19,
  vl3: 21,
  il1: 23,
  il2: 25,
  il3: 27,
  hz: 29,
  fp: 31,
  kw: 33,
  kvar: 35,
  kwAcumulado: 37,
  consumoGasM3Kwh: 41,
  consumoGasFt3Kwh: 45,
  consumoGasMscfH: 49,
  psiGas: 53,
  effPct: 55,
  horometro: 57,
  adicionAceite: 60,
  cambioAceite: 63,
  adicionCoolant: 66,
} as const;
