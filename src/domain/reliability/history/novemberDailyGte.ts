import pack from "./data/novemberDailyGte.json";

export type NovemberDailyField = "costayaco" | "vonu";

export type NovemberDailyUnit = {
  tag: string;
  unidad: string;
  kwh: number;
  hOp: number;
  hSb: number;
  hMtoP: number;
  hMtoC: number;
  hTot: number;
  hExt: number;
  fallas: number;
  capEntKw: number;
  fuel: string;
  disp: number | null;
  conf: number | null;
};

export type NovemberDailyFieldSnap = {
  campo: NovemberDailyField;
  days: number;
  units: number;
  hOp: number;
  hSb: number;
  hMtoP: number;
  hMtoC: number;
  hExt: number;
  hTot: number;
  kwh: number;
  mwh: number;
  fallas: number;
  disp: number | null;
  conf: number | null;
  unitsDetail: NovemberDailyUnit[];
  daily: { fecha: string; kwh: number; fallas: number; hOp: number; disp: number | null }[];
};

type Pack = {
  generatedAt: string;
  sourceFile: string;
  month: string;
  corte: string;
  corteLabel: string;
  dateRange: { min: string; max: string };
  fields: Record<NovemberDailyField, NovemberDailyFieldSnap>;
};

const DATA = pack as Pack;

export function novemberDailyMeta() {
  return {
    corte: DATA.corte,
    corteLabel: DATA.corteLabel,
    corteDay: Number(DATA.corte.slice(8, 10)),
    sourceFile: DATA.sourceFile,
    generatedAt: DATA.generatedAt,
    dateRange: DATA.dateRange,
  };
}

export function novemberDailyField(field: NovemberDailyField): NovemberDailyFieldSnap {
  return DATA.fields[field];
}

export function novemberDailyHasData(month: string): boolean {
  return month === "Nov" || month === DATA.month;
}
