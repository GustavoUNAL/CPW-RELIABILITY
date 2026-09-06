/** Anatomía del formato «Nuevo Fac» (Excel de Wilson Oliveros, 25-ago-2026). */

export const FAC_HOUR_CODES = [
  {
    code: "OP",
    label: "Operación",
    meaning: "Horas generando. Entran a tarifa OPEX de operación y a kWh/mes.",
  },
  {
    code: "SB",
    label: "Stand-by",
    meaning: "Equipo listo, sin carga. Típico del N+1 cuando el principal está en OP o en MTO.",
  },
  {
    code: "PE",
    label: "Parada externa",
    meaning: "Parada por directriz GTE (no imputable al contratista). No aplica penalidad.",
  },
  {
    code: "M",
    label: "Mantenimiento",
    meaning: "Preventivo programado (M1, M2, M3…). Debe cuadrar con la sábana MTO y el reporte de MTO.",
  },
  {
    code: "FS",
    label: "Fuera de servicio",
    meaning: "Falla o indisponibilidad del equipo. Alimenta el consolidado de paradas y la bitácora FO.",
  },
  {
    code: "TR",
    label: "Tiempo de reparación",
    meaning: "Horas de intervención asociadas a FS. No entran al balance de 24 h del día.",
  },
] as const;

export type FacHourCode = (typeof FAC_HOUR_CODES)[number]["code"];

export const FAC_TEMPLATE_META = {
  sourceFile: "data/AGOSTO /template/Ejemplo formato de facturacion.xlsx",
  sheets: ["Julio 2026", "Nuevo Fac", "Pantallazo"],
  activeFormat: "Nuevo Fac",
  filledExample: "Julio 2026",
  documentName: "Facturación Copower Ecuador – GTE",
  documentType: "Soporte de facturación",
  origin: "Interno",
  contract: "CW7581",
  author: "Wilson Oliveros",
  authoredAt: "2026-08-25",
  ivaPct: 15,
  note:
    "El archivo es el formato modelo de Ecuador (Chanangue, Charapa, Iguana, Conejo, Perico). Putumayo Norte rellena los mismos bloques con Costayaco y Vonú.",
};

export const FAC_TEMPLATE_SECTIONS = [
  {
    n: 1,
    title: "Encabezado del documento",
    body: "DOCUMENTO, NOMBRE, TIPO = «Soporte de facturación», FECHA DE ENVÍO, ORIGEN Interno, PERÍODO y el recuadro VALOR DE FACTURACIÓN (OPEX / CAPEX / TOTAL).",
  },
  {
    n: 2,
    title: "Resumen de operaciones",
    body: "Un bloque por equipo: «CAMPO – TAG (GTE|CPW)». Días 1–31 en columnas y filas OP, SB, PE, M, FS, TR. Dos equipos por fila, como en la hoja «Nuevo Fac».",
  },
  {
    n: 3,
    title: "Dashboard de indicadores",
    body: "Desempeño por equipo y por sistema N+1, más el recuadro de equipos propios COPOWER. Columnas OP, SB, PE, MTTO, FS, TR, kWh/mes, ft³/mes, gal/mes, kW prom y Conf. hrs/mes (744 en un mes de 31 días).",
  },
  {
    n: 4,
    title: "Consolidado de novedades",
    body: "ITEM, FECHA, CAMPO, EQUIPO, TIPO, DESCRIPCIÓN, APLICA PENALIDAD, SOPORTE. Aquí caen PE, fallas, MTO y tarifas por llamado.",
  },
  {
    n: 5,
    title: "Facturación OPEX / CAPEX",
    body: "Una pareja de tablas por campo. OPEX: operación 24 h, 12 h y por llamado (eq. días arriba × días × tarifa). CAPEX: ítem, equipo, días y desglose OP / SB / PE / MP / FS. IVA 15 % y TOTAL.",
  },
  {
    n: 6,
    title: "Sustento GTE y firmas",
    body: "Cuadro de sustento de indicadores Gran Tierra y registro de firmas (elaboró / revisó / aprobó).",
  },
] as const;

export type FacDailyHours = Record<FacHourCode, number[]>;

export type FacUnitExample = {
  field: string;
  tag: string;
  owner: "GTE" | "CPW";
  role: string;
  hours: FacDailyHours;
  totals: Record<FacHourCode, number>;
  kwh: number;
  ft3: number | null;
  gal: number | null;
  kwAvg: number;
};

const KB600_02_OP = [
  24, 24, 14, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 21, 23, 13, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24,
];
const KB600_02_PE = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
const KB600_02_M = [
  0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
const ZEROS_31 = Array.from({ length: 31 }, () => 0);

const G301_B_OP = [
  0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
const G301_B_SB = [
  24, 24, 14, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 20, 22, 13, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24,
];

function sum(values: number[]) {
  return values.reduce((acc, v) => acc + v, 0);
}

export const FAC_EXAMPLE_UNITS: FacUnitExample[] = [
  {
    field: "Chanangue J",
    tag: "KB-600-02",
    owner: "GTE",
    role: "Principal a gas",
    hours: {
      OP: KB600_02_OP,
      SB: ZEROS_31,
      PE: KB600_02_PE,
      M: KB600_02_M,
      FS: ZEROS_31,
      TR: ZEROS_31,
    },
    totals: {
      OP: sum(KB600_02_OP),
      SB: 0,
      PE: sum(KB600_02_PE),
      M: sum(KB600_02_M),
      FS: 0,
      TR: 0,
    },
    kwh: 111395,
    ft3: 980276,
    gal: null,
    kwAvg: 155,
  },
  {
    field: "Chanangue J",
    tag: "G301-B",
    owner: "GTE",
    role: "Reserva N+1 (diésel)",
    hours: {
      OP: G301_B_OP,
      SB: G301_B_SB,
      PE: ZEROS_31,
      M: ZEROS_31,
      FS: ZEROS_31,
      TR: ZEROS_31,
    },
    totals: { OP: sum(G301_B_OP), SB: sum(G301_B_SB), PE: 0, M: 0, FS: 0, TR: 0 },
    kwh: 3583,
    ft3: null,
    gal: 197,
    kwAvg: 133,
  },
];

export const FAC_DASHBOARD_ROWS = [
  { tag: "KB-600-02", field: "Chanangue J", op: 719, sb: 0, pe: 4, m: 21, fs: 0, tr: 0, kwh: 111395, ft3: 980276, gal: null, kw: 155 },
  { tag: "G301-B", field: "Chanangue J", op: 27, sb: 717, pe: 0, m: 0, fs: 0, tr: 0, kwh: 3583, ft3: null, gal: 197, kw: 133 },
  { tag: "KTA19-01", field: "Chanangue K", op: 740, sb: 0, pe: 0, m: 4, fs: 0, tr: 0, kwh: 136704, ft3: null, gal: 7519, kw: 185 },
  { tag: "G102-C", field: "Chanangue K", op: 6, sb: 738, pe: 0, m: 0, fs: 0, tr: 0, kwh: 759, ft3: null, gal: 42, kw: 127 },
  { tag: "KB-600-03", field: "Charapa B", op: 723, sb: 0, pe: 5, m: 16, fs: 0, tr: 0, kwh: 146413, ft3: 1288434, gal: null, kw: 203 },
  { tag: "KB-600-04", field: "Charapa B", op: 714, sb: 0, pe: 13, m: 17, fs: 0, tr: 0, kwh: 143308, ft3: 1261110, gal: null, kw: 201 },
  { tag: "KTA19-03", field: "Charapa B", op: 40, sb: 704, pe: 0, m: 0, fs: 0, tr: 0, kwh: 7933, ft3: null, gal: 436, kw: 198 },
  { tag: "KB-600-01", field: "Iguana", op: 665, sb: 0, pe: 61, m: 18, fs: 0, tr: 0, kwh: 157642, ft3: 1387250, gal: null, kw: 237 },
  { tag: "KTA19-02", field: "Iguana", op: 84, sb: 660, pe: 0, m: 0, fs: 0, tr: 0, kwh: 16546, ft3: null, gal: 910, kw: 197 },
  { tag: "KB-600-05", field: "Conejo 1", op: 727, sb: 0, pe: 1, m: 16, fs: 0, tr: 0, kwh: 177150, ft3: 1558920, gal: null, kw: 244 },
  { tag: "KB-600-06", field: "Conejo 1", op: 702, sb: 0, pe: 18, m: 16, fs: 8, tr: 8, kwh: 171819, ft3: 1512007, gal: null, kw: 245 },
  { tag: "KTA19-04", field: "Conejo 1", op: 56, sb: 688, pe: 0, m: 0, fs: 0, tr: 0, kwh: 12808, ft3: null, gal: 704, kw: 229 },
] as const;

export const FAC_NOVEDADES_SAMPLE = [
  {
    item: 5,
    date: "1-Jul-26",
    field: "Iguana",
    unit: "KB-600-01",
    type: "Parada Externa",
    detail: "Parada controlada; el equipo queda en stand-by por directriz de Operaciones GTE.",
    penalty: "No aplica",
    support: "Directriz Operaciones GTE",
  },
  {
    item: 9,
    date: "9-Jul-26",
    field: "Conejo 1",
    unit: "KB-600-06",
    type: "Falla #1",
    detail: "Fuga en el sistema de lubricación. En el dashboard aparecen 8 h FS y 8 h TR ese día.",
    penalty: "No aplica",
    support: "Reporte de falla # 009",
  },
  {
    item: 26,
    date: "3-Jul-26",
    field: "Chanangue J",
    unit: "KB-600-02",
    type: "M3",
    detail: "Mantenimiento preventivo (10 h M). La reserva G301-B cubre esas horas en OP.",
    penalty: "No aplica",
    support: "Reporte MTO # 21",
  },
  {
    item: 1,
    date: "1-Jul-26",
    field: "Iguana",
    unit: "No aplica",
    type: "Tarifa de operación por llamado",
    detail: "Apoyo operativo en plataforma por requerimiento de GTE Power Utility. Línea OPEX «por llamado».",
    penalty: "No aplica",
    support: "Directriz Operaciones GTE",
  },
] as const;

export const FAC_OPEX_LINES = [
  { item: 1, detail: "Operación 24 horas", hint: "eq. días arriba × días del mes × tarifa USD" },
  { item: 2, detail: "Operación 12 horas", hint: "Turno parcial contractual" },
  { item: 3, detail: "Operación por llamado", hint: "Apoyos extraordinarios de la bitácora" },
] as const;

export const FAC_CAPEX_CODES = ["OP", "SB", "PE", "MP", "FS"] as const;

export const FAC_ECUADOR_UNITS = [
  { field: "Chanangue J", tag: "KB-600-02", owner: "GTE" },
  { field: "Chanangue J", tag: "G301-B", owner: "GTE" },
  { field: "Chanangue K", tag: "KTA19-01", owner: "GTE" },
  { field: "Chanangue K", tag: "G102-C", owner: "CPW" },
  { field: "Charapa B", tag: "KB-600-03", owner: "GTE" },
  { field: "Charapa B", tag: "KB-600-04", owner: "GTE" },
  { field: "Charapa B", tag: "KTA19-03", owner: "CPW" },
  { field: "Iguana", tag: "KB-600-01", owner: "GTE" },
  { field: "Charapa B", tag: "KTA19-02", owner: "GTE" },
  { field: "Conejo 1", tag: "KB-600-05", owner: "CPW" },
  { field: "Conejo 1", tag: "KB-600-06", owner: "CPW" },
  { field: "Conejo 1", tag: "KTA19-04", owner: "CPW" },
  { field: "Perico A", tag: "—", owner: "GTE" },
  { field: "Perico C", tag: "—", owner: "GTE" },
] as const;

export const FAC_PUTUMAYO_UNITS = [
  { field: "Costayaco", tag: "CPW-01", model: "Jenbacher J320", owner: "CPW" },
  { field: "Costayaco", tag: "CPW-02", model: "Jenbacher J320", owner: "CPW" },
  { field: "Costayaco", tag: "CPW-03", model: "Jenbacher J320", owner: "CPW" },
  { field: "Costayaco", tag: "CPW-07", model: "Jenbacher J320", owner: "CPW" },
  { field: "Costayaco", tag: "CPW-04", model: "Jenbacher J420", owner: "CPW" },
  { field: "Costayaco", tag: "CPW-05", model: "Jenbacher J420", owner: "CPW" },
  { field: "Costayaco", tag: "CPW-06", model: "Jenbacher J420", owner: "CPW" },
  { field: "Costayaco", tag: "JIN-10", model: "Jinan 600", owner: "CPW" },
  { field: "Costayaco", tag: "JIN-11", model: "Jinan 450", owner: "CPW" },
  { field: "Costayaco", tag: "JIN-12", model: "Jinan 450", owner: "CPW" },
  { field: "Costayaco", tag: "G101V", model: "Cummins 500 kW", owner: "GTE" },
  { field: "Costayaco", tag: "G102A", model: "Cummins 500 kW", owner: "GTE" },
  { field: "Costayaco", tag: "G102E", model: "Cummins 500 kW", owner: "GTE" },
  { field: "Costayaco", tag: "G102I", model: "Cummins 500 kW", owner: "GTE" },
  { field: "Costayaco", tag: "G102J", model: "Cummins KTA38-G4 1000 kW", owner: "GTE" },
  { field: "Costayaco", tag: "G102K", model: "Cummins KTA38-G4 1000 kW", owner: "GTE" },
  { field: "Vonú", tag: "JIN-01", model: "Jinan", owner: "CPW" },
  { field: "Vonú", tag: "JIN-02", model: "Jinan", owner: "CPW" },
] as const;

export const FAC_MONTH_HOURS = 744;
