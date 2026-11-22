import type { PageKey } from "../types";

/** Cómo entra el mes a la plataforma. */
export type HistoryCoverage = "modelo" | "presentacion" | "fuente" | "abierto";

export type HistoryKpi = {
  availability: number | null;
  reliability: number | null;
  generationMwh: number | null;
  failures: number | null;
};

export type PutnMonth = {
  key: string;
  label: string;
  coverage: HistoryCoverage;
  /** Serie operativa COPOWER. Ene–ago sale del modelo; sep–oct, de la presentación de cierre. */
  copower: HistoryKpi;
  /** Anexo Gran Tierra cargado en el modelo. Sep–oct aún no están en ese snapshot. */
  gte: HistoryKpi | null;
  /** Tendencia Excel de GTE cuando el anexo oficial del modelo no coincide. */
  gteExcelAvailability: number | null;
  /** Disponibilidad Vonú cuando el cierre la publica aparte de Costayaco. */
  vonuAvailability: number | null;
  vonuReliability: number | null;
  note: string;
  source: string;
};

export type AcrdMonth = {
  key: string;
  label: string;
  coverage: HistoryCoverage;
  kpi: HistoryKpi | null;
  note: string;
  source: string;
};

export type PlatformDestination = {
  page: PageKey;
  leaf: string;
  label: string;
  adminOnly?: boolean;
};

export type PlatformGroup = {
  title: string;
  detail: string;
  items: PlatformDestination[];
};

const kpi = (
  availability: number | null,
  reliability: number | null,
  generationMwh: number | null,
  failures: number | null,
): HistoryKpi => ({
  availability,
  reliability,
  generationMwh,
  failures,
});

/**
 * Historial revisado de confiabilidad 2026.
 * Las cifras de ene–ago salen de los snapshots mensuales de la app.
 * Sep y oct salen de las presentaciones de cierre ya generadas; no están en el selector de mes.
 */
export const PUTN_HISTORY: PutnMonth[] = [
  {
    key: "Ene",
    label: "Enero",
    coverage: "modelo",
    copower: kpi(0.93134, 0.93134, 3589.4, 0),
    gte: kpi(0.9996, 0.9996, null, 4),
    gteExcelAvailability: 0.999618,
    vonuAvailability: null,
    vonuReliability: null,
    note: "GTE no trae MWh en el snapshot. El conteo de fallas COPOWER sale del reporte diario.",
    source: "Modelo mensual · data soporte GTE enero",
  },
  {
    key: "Feb",
    label: "Febrero",
    coverage: "modelo",
    copower: kpi(0.970358, 0.970358, 3401.23, 0),
    gte: kpi(0.9964, 0.9964, null, 4),
    gteExcelAvailability: 0.996433,
    vonuAvailability: null,
    vonuReliability: null,
    note: "GTE no trae MWh en el snapshot.",
    source: "Modelo mensual · data soporte GTE febrero",
  },
  {
    key: "Mar",
    label: "Marzo",
    coverage: "modelo",
    copower: kpi(0.961564, 0.961564, 3484.83, 0),
    gte: kpi(0.963, 0.963, null, 9),
    gteExcelAvailability: 0.963033,
    vonuAvailability: null,
    vonuReliability: null,
    note: "GTE no trae MWh en el snapshot. Es el mes más bajo del anexo hasta agosto.",
    source: "Modelo mensual · data soporte GTE marzo",
  },
  {
    key: "Abr",
    label: "Abril",
    coverage: "modelo",
    copower: kpi(0.982099, 0.982099, 3392.09, 0),
    gte: kpi(0.9949, 0.9949, 3649.33, 4),
    gteExcelAvailability: 0.994943,
    vonuAvailability: null,
    vonuReliability: null,
    note: "Primer mes GTE con generación en el snapshot.",
    source: "Modelo mensual · data soporte GTE abril",
  },
  {
    key: "May",
    label: "Mayo",
    coverage: "modelo",
    copower: kpi(0.986225, 0.986225, 3781.66, 36),
    gte: kpi(0.9288, 0.9405, 3955.182, 7),
    gteExcelAvailability: 0.991591,
    vonuAvailability: null,
    vonuReliability: null,
    note: "El anexo GTE del modelo (92,88 %) no coincide con la tendencia Excel (99,16 %).",
    source: "Modelo mensual · data soporte GTE mayo",
  },
  {
    key: "Jun",
    label: "Junio",
    coverage: "modelo",
    copower: kpi(0.987238, 0.987238, 4236.56, 60),
    gte: kpi(0.9792, 0.9792, 4110.144, 7),
    gteExcelAvailability: 0.995939,
    vonuAvailability: null,
    vonuReliability: null,
    note: "Último mes cuyo conteo COPOWER sale del reporte diario, antes de la concertación.",
    source: "Modelo mensual · data soporte GTE junio",
  },
  {
    key: "Jul",
    label: "Julio",
    coverage: "modelo",
    copower: kpi(0.977332, 0.977332, 4131.917, 3),
    gte: kpi(0.8065, 1, 4131.917, 3),
    gteExcelAvailability: 1,
    vonuAvailability: null,
    vonuReliability: null,
    note: "Desde aquí las fallas COPOWER salen de horas concertadas. El anexo GTE (80,65 %) no coincide con la tendencia Excel (100 %).",
    source: "Modelo mensual · horas concertadas y data soporte julio",
  },
  {
    key: "Ago",
    label: "Agosto",
    coverage: "modelo",
    copower: kpi(0.991379, 1, 4424.562, 0),
    gte: kpi(1, 1, 4424.562, 0),
    gteExcelAvailability: 1,
    vonuAvailability: null,
    vonuReliability: null,
    note: "Último mes con tablero completo de máquinas. Vonú publicó 95,83 % de disponibilidad en el comparativo de septiembre.",
    source: "Modelo mensual · presentación GTE agosto",
  },
  {
    key: "Sep",
    label: "Septiembre",
    coverage: "presentacion",
    copower: kpi(0.9944, 0.9944, 2619.9, 4),
    gte: null,
    gteExcelAvailability: null,
    vonuAvailability: 0.9514,
    vonuReliability: 1,
    note: "Cierre 01–30. Costayaco 99,44 % (4 fallas, meta 98 %). Vonú 95,14 % y confiabilidad 100 % (meta 90 %).",
    source: "Presentación PUTN septiembre · data soporte GTE y horas concertadas",
  },
  {
    key: "Oct",
    label: "Octubre",
    coverage: "presentacion",
    copower: kpi(0.9887, 0.9887, 3845.0, 5),
    gte: null,
    gteExcelAvailability: null,
    vonuAvailability: 0.9704,
    vonuReliability: 1,
    note: "Cierre 01–31. Costayaco 98,87 % (5 fallas). Vonú 97,04 % y confiabilidad 100 %.",
    source: "Presentación PUTN octubre · data soporte GTE octubre",
  },
  {
    key: "Nov",
    label: "Noviembre",
    coverage: "abierto",
    copower: kpi(null, null, null, null),
    gte: null,
    gteExcelAvailability: null,
    vonuAvailability: null,
    vonuReliability: null,
    note: "No hay cierre de disponibilidad. En carpeta hay 7 registros de Costayaco, entre el 1 y el 19. Vonú no tiene carpeta propia. Pad 4 tiene 6, incluida la parada común del 12.",
    source: "data/Costayaco/fallas/2026-11 y data/Acordionero/fallas/2026-11",
  },
];

export const ACRD_HISTORY: AcrdMonth[] = [
  {
    key: "Ago",
    label: "Agosto",
    coverage: "fuente",
    kpi: null,
    note: "Informe de confiabilidad y data soporte de agosto están en disco. Las cifras no están cargadas en la app.",
    source: "data/Acordionero/informes e Informe de gestión agosto",
  },
  {
    key: "Sep",
    label: "Septiembre",
    coverage: "presentacion",
    kpi: kpi(1, 1, 3860.1, 15),
    note: "N+1 operacional en 100 %. El bloque probabilístico cierra en 99,93 % de disponibilidad y 99,98 % de confiabilidad. G802 queda en 97,06 %.",
    source: "Presentación Acordionero Pad 4 · septiembre",
  },
  {
    key: "Oct",
    label: "Octubre",
    coverage: "presentacion",
    kpi: kpi(1, 1, 4467.2, 14),
    note: "N+1 operacional en 100 % y 4.467,2 MWh. Probabilístico 99,80 % de disponibilidad y 99,99 % de confiabilidad. G804 queda en 97,29 % como máquina.",
    source: "Presentación Acordionero Pad 4 · octubre",
  },
  {
    key: "Nov",
    label: "Noviembre",
    coverage: "abierto",
    kpi: null,
    note: "No hay cierre de disponibilidad. Hay 6 registros: el 1, el 5, el 10, la parada común del 12 (6 de 6, 9,2 MW), el 19 y el 20.",
    source: "data/Acordionero/fallas/2026-11",
  },
];

/** Registros de falla con carpeta en noviembre 2026. No es el cierre de disponibilidad. */
export const NOVEMBER_2026 = {
  costayaco: 7,
  vonu: 0,
  pad4: 6,
  trip: "9,2 MW",
  byField: [
    { nombre: "Costayaco", valor: 7 },
    { nombre: "Vonú", valor: 0 },
    { nombre: "Pad 4", valor: 6 },
  ],
  costayacoDays: ["1", "2", "6", "9", "15", "16", "19"].map((nombre) => ({ nombre, valor: 1 })),
  pad4Days: ["1", "5", "10", "12", "19", "20"].map((nombre) => ({ nombre, valor: 1 })),
};

export const PLATFORM_GROUPS: PlatformGroup[] = [
  {
    title: "Cierre del mes",
    detail: "Lo que se publica y se compara contra el contrato.",
    items: [
      { page: "dashboard", leaf: "dash-historial", label: "Historial" },
      { page: "indicadores", leaf: "ind-comparacion", label: "Tabla de indicadores" },
      { page: "dashboard", leaf: "dash-indicadores", label: "Indicadores del mes" },
      { page: "dashboard", leaf: "dash-contrato", label: "Metas contractuales" },
      { page: "dashboard", leaf: "dash-resumen", label: "15 láminas" },
      { page: "informes", leaf: "inf-conf-presentacion", label: "Informe mensual", adminOnly: true },
    ],
  },
  {
    title: "Operación",
    detail: "De dónde salen las horas, la energía y la concertación.",
    items: [
      { page: "operacion", leaf: "op-dashboard", label: "Operación" },
      { page: "concertacion", leaf: "conc-resumen", label: "Concertación de horas" },
      { page: "generacion", leaf: "gen-dashboard", label: "Generación" },
      { page: "dashboard", leaf: "dash-operacion", label: "Operación COPOWER" },
      { page: "dashboard", leaf: "dash-operacion-gte", label: "Operación Gran Tierra" },
    ],
  },
  {
    title: "Análisis",
    detail: "Fallas, activos y mantenimiento del parque PUTN.",
    items: [
      { page: "confiabilidad", leaf: "cmp-fuentes", label: "Resumen de confiabilidad" },
      { page: "confiabilidad", leaf: "bd-ev-copower", label: "Fallas COPOWER" },
      { page: "confiabilidad", leaf: "an-rca-gte", label: "Fichas RCA" },
      { page: "mantenimiento", leaf: "dash-mto", label: "Mantenimiento" },
      { page: "gestion_activos", leaf: "ga-salud", label: "Salud de activos" },
      { page: "campos", leaf: "cfg-campos-costayaco-resumen", label: "Costayaco" },
      { page: "campos", leaf: "cfg-campos-vonu-resumen", label: "Vonú" },
      { page: "campos", leaf: "cfg-campos-pad4-resumen", label: "Pad 4" },
    ],
  },
  {
    title: "Seguimiento",
    detail: "Lo que queda pendiente después del cierre.",
    items: [
      { page: "gestion_acciones", leaf: "capa-resumen", label: "Acciones CAPA" },
      { page: "planeacion", leaf: "op-tablero", label: "Planeación" },
      { page: "facturacion", leaf: "fac-documento", label: "Facturación" },
    ],
  },
];

export const COVERAGE_LABEL: Record<HistoryCoverage, string> = {
  modelo: "En el modelo",
  presentacion: "Presentación",
  fuente: "Solo fuente",
  abierto: "Sin cierre",
};
