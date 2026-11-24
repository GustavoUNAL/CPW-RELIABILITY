import pack from "./data/novemberDailyPad4.json";

export type Pad4DailyUnit = {
  tag: string;
  kwNom: number;
  kwh: number;
  hOp: number;
  hSb: number;
  hProg: number;
  hFs: number;
  hCli: number;
  hTot: number;
  fallas: number;
  days: number;
  horometroFinal: number | null;
  disp: number | null;
  conf: number | null;
};

export type Pad4DailyDay = {
  fecha: string;
  kwh: number;
  hOp: number;
  hSb: number;
  hFs: number;
  hCli: number;
  hProg: number;
  fallas: number;
  gasM3: number | null;
  disp: number | null;
};

export type Pad4DailySnap = {
  campo: "pad4";
  days: number;
  units: number;
  hOp: number;
  hSb: number;
  hProg: number;
  hFs: number;
  hCli: number;
  hExt: number;
  hTot: number;
  kwh: number;
  mwh: number;
  fallas: number;
  gasM3: number;
  disp: number | null;
  conf: number | null;
  unitsDetail: Pad4DailyUnit[];
  daily: Pad4DailyDay[];
};

type Pack = {
  generatedAt: string;
  sourceFile: string;
  month: string;
  corte: string;
  corteLabel: string;
  dateRange: { min: string; max: string };
  field: Pad4DailySnap;
};

const DATA = pack as Pack;

export function novemberDailyPad4Meta() {
  return {
    corte: DATA.corte,
    corteLabel: DATA.corteLabel,
    corteDay: Number(DATA.corte.slice(8, 10)),
    sourceFile: DATA.sourceFile,
    generatedAt: DATA.generatedAt,
    dateRange: DATA.dateRange,
    recordCount: DATA.field?.unitsDetail?.length
      ? DATA.field.days * DATA.field.units
      : 0,
  };
}

export function novemberDailyPad4Field(): Pad4DailySnap {
  return DATA.field;
}

export function novemberDailyPad4HasData(month: string): boolean {
  return month === "Nov" || month === DATA.month;
}
