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
  consumoPrimario: number;
  capInstKw: number;
  capEntKw: number;
  fuel: string;
  horometroFinal: number | null;
  disp: number | null;
  conf: number | null;
};

export type NovemberDailyObs = {
  fecha: string;
  tag: string;
  unidad: string;
  fallas: number;
  hExt: number;
  hMtoC: number;
  texto: string;
};

export type NovemberDailyDay = {
  fecha: string;
  kwh: number;
  fallas: number;
  hOp: number;
  hSb?: number;
  hExt?: number;
  obs?: number;
  disp: number | null;
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
  consumoPrimario: number;
  obsCount: number;
  disp: number | null;
  conf: number | null;
  unitsDetail: NovemberDailyUnit[];
  daily: NovemberDailyDay[];
  observaciones: NovemberDailyObs[];
};

export type NovemberDailyRecord = {
  fecha: string;
  cuenca: string | null;
  campo: NovemberDailyField;
  campoLabel: string;
  contratista: string | null;
  unidad: string;
  tag: string;
  capInstKw: number;
  capEntKw: number;
  horometroInicial: number | null;
  horometroFinal: number | null;
  kwh: number;
  kwProm: number;
  hOp: number;
  hSb: number;
  hMtoP: number;
  hMtoC: number;
  hTot: number;
  hExt: number;
  fallas: number;
  fuel: string;
  fuelSec: string | null;
  consumoPrimario: number | null;
  consumoSecundario: number | null;
  eff: number | null;
  observaciones: string | null;
};

type Pack = {
  generatedAt: string;
  sourceFile: string;
  month: string;
  corte: string;
  corteLabel: string;
  dateRange: { min: string; max: string };
  columns?: string[];
  fields: Record<NovemberDailyField, NovemberDailyFieldSnap>;
  records: NovemberDailyRecord[];
};

const DATA = pack as Pack;

function emptySnap(campo: NovemberDailyField): NovemberDailyFieldSnap {
  return {
    campo,
    days: 0,
    units: 0,
    hOp: 0,
    hSb: 0,
    hMtoP: 0,
    hMtoC: 0,
    hExt: 0,
    hTot: 0,
    kwh: 0,
    mwh: 0,
    fallas: 0,
    consumoPrimario: 0,
    obsCount: 0,
    disp: null,
    conf: null,
    unitsDetail: [],
    daily: [],
    observaciones: [],
  };
}

export function novemberDailyMeta() {
  return {
    corte: DATA.corte,
    corteLabel: DATA.corteLabel,
    corteDay: Number(DATA.corte.slice(8, 10)),
    sourceFile: DATA.sourceFile,
    generatedAt: DATA.generatedAt,
    dateRange: DATA.dateRange,
    columns: DATA.columns ?? [],
    recordCount: DATA.records?.length ?? 0,
  };
}

export function novemberDailyField(field: NovemberDailyField): NovemberDailyFieldSnap {
  const snap = DATA.fields[field];
  if (!snap) return emptySnap(field);
  return {
    ...snap,
    consumoPrimario: snap.consumoPrimario ?? 0,
    obsCount: snap.obsCount ?? snap.observaciones?.length ?? 0,
    observaciones: snap.observaciones ?? [],
    unitsDetail: (snap.unitsDetail ?? []).map((u) => ({
      ...u,
      consumoPrimario: u.consumoPrimario ?? 0,
      capInstKw: u.capInstKw ?? 0,
      horometroFinal: u.horometroFinal ?? null,
    })),
  };
}

export function novemberDailyHasData(month: string): boolean {
  return month === "Nov" || month === DATA.month;
}

export function novemberDailyRecords(field?: NovemberDailyField): NovemberDailyRecord[] {
  const rows = DATA.records ?? [];
  return field ? rows.filter((r) => r.campo === field) : rows;
}

export function novemberDailyObsRecent(field: NovemberDailyField, limit = 12): NovemberDailyObs[] {
  return novemberDailyField(field).observaciones.slice(0, limit);
}

export function fmtPctDaily(value: number | null | undefined) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(2).replace(".", ",")} %`;
}
