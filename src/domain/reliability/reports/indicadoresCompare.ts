import { COPOWER_MONTHLY_DATA, COPOWER_MONTH_LABELS, type CopowerMonthKey } from "./copowerMonthly";
import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";

/** Libro original (recuadro roto). */
export const DPTO_GENERACION_SOURCE_ORIGINAL =
  "data/Agosto/data_juanpabon/Reporte Diario de Operaciones GTE Archivo base AGOSTO PARCIAL actualizado.xlsx";

/** Libro con tarjetas KPI reenganchadas al Total general (Hoja1 fila 20). */
export const DPTO_GENERACION_SOURCE =
  "data/Agosto/data_juanpabon/Reporte Diario de Operaciones GTE AGOSTO PARCIAL - KPIs flota corregidos.xlsx";

export const DPTO_DASHBOARD_MONTH: CopowerMonthKey = "Ago";

export type IndicadoresUnitRow = {
  tag: string;
  /** Tag COPOWER / concertación (JIN-10 vs CPW-10). */
  matchId: string;
  campo: "COSTAYACO" | "VONU";
  family: "CPW" | "CUMMINS" | "JINAN";
  kwh: number;
  op: number;
  sb: number;
  disp: number;
  fallas: number;
  pp: number;
  corr: number;
  pfCli: number;
  cal: number;
};

export type IndicadoresKpis = {
  kwh: number;
  op: number;
  sb: number;
  dispHeader: number | null;
  dispFleet: number | null;
  fallas: number;
  pp: number;
  corr: number;
  pfCli: number;
  cal: number;
  mtbf: number | null;
  mttr: number | null;
  conf: number | null;
  indisp: number | null;
  pctUnidFallas: number | null;
  nUnits: number;
};

export type IndicadoresGroupRow = {
  label: string;
  count: number;
  kwh: number;
  op: number;
  disp: number | null;
  share: number | null;
  fallas?: number;
};

export type DptoDashboardSnapshot = {
  month: CopowerMonthKey;
  titlePeriod: string;
  execPeriod: string;
  header: IndicadoresKpis;
  units: IndicadoresUnitRow[];
  fleet: IndicadoresKpis;
  byType: IndicadoresGroupRow[];
  byField: IndicadoresGroupRow[];
  byBasin: IndicadoresGroupRow[];
  top5: { tag: string; kwh: number }[];
  execNotes: string[];
  cargabilidad: {
    equipo: string;
    cargaKw: number;
    kwGenerados: number;
    kwInicial: number;
    kwFinal: number;
    tiempo: string;
    comportamiento: string;
  }[];
  pendientes: { ranking: number; unidad: string }[];
};

/**
 * Valores del Dashboard en el archivo corregido (tarjetas = Total general).
 * El libro original apuntaba A6:F6 a Hoja1 fila 19 (JIN-02).
 */
export const DPTO_GENERACION_DASHBOARD: DptoDashboardSnapshot = {
  month: "Ago",
  titlePeriod: "AGOSTO 2026 (01–22)",
  execPeriod: "MAYO 2026",
  header: {
    kwh: 3135033,
    op: 5638,
    sb: 2209,
    dispHeader: 0.9907828282828283,
    dispFleet: 0.9907828282828283,
    fallas: 0,
    pp: 73,
    corr: 0,
    pfCli: 374,
    cal: 7920,
    mtbf: null,
    mttr: null,
    conf: 1,
    indisp: 0.0092171717171717,
    pctUnidFallas: 0,
    nUnits: 15,
  },
  units: [
    { tag: "CPW-01", matchId: "CPW01", campo: "COSTAYACO", family: "CPW", kwh: 292328, op: 465, sb: 57, disp: 0.9886, fallas: 0, pp: 6, corr: 0, pfCli: 43, cal: 528 },
    { tag: "CPW-02", matchId: "CPW02", campo: "COSTAYACO", family: "CPW", kwh: 243012, op: 386, sb: 142, disp: 1, fallas: 0, pp: 0, corr: 0, pfCli: 38, cal: 528 },
    { tag: "CPW-03", matchId: "CPW03", campo: "COSTAYACO", family: "CPW", kwh: 287674, op: 459, sb: 62, disp: 0.9867, fallas: 0, pp: 7, corr: 0, pfCli: 24, cal: 528 },
    { tag: "CPW-04", matchId: "CPW04", campo: "COSTAYACO", family: "CPW", kwh: 342171, op: 453, sb: 75, disp: 1, fallas: 0, pp: 0, corr: 0, pfCli: 5, cal: 528 },
    { tag: "CPW-05", matchId: "CPW05", campo: "COSTAYACO", family: "CPW", kwh: 366816, op: 474, sb: 54, disp: 1, fallas: 0, pp: 0, corr: 0, pfCli: 14, cal: 528 },
    { tag: "CPW-06", matchId: "CPW06", campo: "COSTAYACO", family: "CPW", kwh: 338404, op: 441, sb: 79, disp: 0.9848, fallas: 0, pp: 8, corr: 0, pfCli: 41, cal: 528 },
    { tag: "CPW-07", matchId: "CPW07", campo: "COSTAYACO", family: "CPW", kwh: 284496, op: 480, sb: 42, disp: 0.9886, fallas: 0, pp: 6, corr: 0, pfCli: 21, cal: 528 },
    { tag: "CPW-10", matchId: "JIN-10", campo: "COSTAYACO", family: "JINAN", kwh: 143331, op: 392, sb: 128, disp: 0.9848, fallas: 0, pp: 8, corr: 0, pfCli: 54, cal: 528 },
    { tag: "CPW-11", matchId: "JIN-11", campo: "COSTAYACO", family: "JINAN", kwh: 166590, op: 456, sb: 65, disp: 0.9867, fallas: 0, pp: 7, corr: 0, pfCli: 39, cal: 528 },
    { tag: "CPW-12", matchId: "JIN-12", campo: "COSTAYACO", family: "JINAN", kwh: 104796, op: 295, sb: 225, disp: 0.9848, fallas: 0, pp: 8, corr: 0, pfCli: 78, cal: 528 },
    { tag: "G101V", matchId: "G101V", campo: "COSTAYACO", family: "CUMMINS", kwh: 38427, op: 110, sb: 418, disp: 1, fallas: 0, pp: 0, corr: 0, pfCli: 0, cal: 528 },
    { tag: "G102J", matchId: "G102J", campo: "COSTAYACO", family: "CUMMINS", kwh: 85209, op: 110, sb: 418, disp: 1, fallas: 0, pp: 0, corr: 0, pfCli: 0, cal: 528 },
    { tag: "G102K", matchId: "G102K", campo: "COSTAYACO", family: "CUMMINS", kwh: 91530, op: 120, sb: 408, disp: 1, fallas: 0, pp: 0, corr: 0, pfCli: 0, cal: 528 },
    { tag: "JIN-01", matchId: "JIN-01", campo: "VONU", family: "JINAN", kwh: 174954, op: 489, sb: 23, disp: 0.9697, fallas: 0, pp: 16, corr: 0, pfCli: 17, cal: 528 },
    { tag: "JIN-02", matchId: "JIN-02", campo: "VONU", family: "JINAN", kwh: 175295, op: 508, sb: 13, disp: 0.9867, fallas: 0, pp: 7, corr: 0, pfCli: 0, cal: 528 },
  ],
  fleet: {
    kwh: 3135033,
    op: 5638,
    sb: 2209,
    dispHeader: 0.9907828282828283,
    dispFleet: 0.9907828282828283,
    fallas: 0,
    pp: 73,
    corr: 0,
    pfCli: 374,
    cal: 7920,
    mtbf: null,
    mttr: null,
    conf: 1,
    indisp: 0.0092171717171717,
    pctUnidFallas: 0,
    nUnits: 15,
  },
  byType: [
    { label: "CPW (J320/J420)", count: 10, kwh: 2569618, op: 4301, disp: 0.815, share: 0.82 },
    { label: "CUMMINS (G10x)", count: 3, kwh: 215166, op: 340, disp: 0.215, share: 0.069 },
    { label: "JINAN (JIN)", count: 2, kwh: 350249, op: 997, disp: 0.944, share: 0.112 },
    { label: "TOTAL", count: 15, kwh: 3135033, op: 5638, disp: 0.658, share: 1 },
  ],
  byField: [
    { label: "COSTAYACO", count: 13, kwh: 2784784, op: 4641, disp: 0.676, share: null, fallas: 0 },
    { label: "VONU", count: 2, kwh: 350249, op: 997, disp: 0.944, share: null, fallas: 0 },
    { label: "TOTAL", count: 15, kwh: 3135033, op: 5638, disp: 0.81, share: null, fallas: 0 },
  ],
  byBasin: [{ label: "PUTN", count: 15, kwh: 3135033, op: 5638, disp: 0.712, share: 1, fallas: 0 }],
  top5: [
    { tag: "CPW-05", kwh: 366816 },
    { tag: "CPW-04", kwh: 342171 },
    { tag: "CPW-06", kwh: 338404 },
    { tag: "CPW-01", kwh: 292328 },
    { tag: "CPW-03", kwh: 287674 },
  ],
  execNotes: [
    "Período: Mayo 2026 (31 días)",
    "Flota: 16 unidades de generación",
    "Generación total: 4,056,740 KWH",
    "Disponibilidad global: 57.3%",
    "CPW aporta ~79% de la generación",
    "81% unidades sin fallas (13/16)",
    "MTBF excelente: 2,141 hrs",
    "CUMMINS solo 13.5% disponibilidad",
    "CPW-04: 23 hrs MMT correctivo",
    "42.7% de indisponibilidad",
  ],
  cargabilidad: [
    { equipo: "JINAN 10", cargaKw: 455, kwGenerados: 464, kwInicial: 1162570, kwFinal: 1163034, tiempo: "9:30 - 10:30", comportamiento: "ESTABLE" },
    { equipo: "JINAN 01", cargaKw: 455, kwGenerados: 562, kwInicial: 1622906, kwFinal: 1623468, tiempo: "11:14 - 12:28", comportamiento: "ESTABLE" },
    { equipo: "JINAN 02", cargaKw: 455, kwGenerados: 603, kwInicial: 1585525, kwFinal: 1586128, tiempo: "12:28 - 13:38", comportamiento: "ESTABLE" },
    { equipo: "CPW 04", cargaKw: 1050, kwGenerados: 1077, kwInicial: 2240831, kwFinal: 2241908, tiempo: "11:14 - 12:20", comportamiento: "ESTABLE" },
    { equipo: "CPW 05", cargaKw: 1050, kwGenerados: 550, kwInicial: 2240450, kwFinal: 2241000, tiempo: "SE SUSPENDE", comportamiento: "ESTABLE" },
  ],
  pendientes: [
    { ranking: 1, unidad: "CPW 01" },
    { ranking: 2, unidad: "CPW 02" },
    { ranking: 3, unidad: "CPW 03" },
    { ranking: 4, unidad: "CPW 05" },
    { ranking: 5, unidad: "CPW 06" },
  ],
};

export type ArteagaDashboard = {
  month: CopowerMonthKey;
  periodLabel: string;
  sourceFile: string;
  header: IndicadoresKpis;
  units: IndicadoresUnitRow[];
  byType: IndicadoresGroupRow[];
  byField: IndicadoresGroupRow[];
  byBasin: IndicadoresGroupRow[];
  top5: { tag: string; kwh: number }[];
  formulas: {
    disp: string;
    conf: string;
    util: string;
    mtbf: string;
    mttr: string;
  };
};

export type KpiDiffRow = {
  id: string;
  label: string;
  dptoFormula: string;
  arteagaFormula: string;
  dpto: string;
  arteaga: string;
  differ: boolean;
  detail: string;
};

export type UnitDiffRow = {
  dptoTag: string;
  arteagaTag: string;
  kwhDpto: number;
  kwhArteaga: number;
  opDpto: number;
  opArteaga: number;
  sbDpto: number;
  sbArteaga: number;
  dispDpto: number;
  dispArteaga: number;
  hoursMatch: boolean;
  energyMatch: boolean;
  dispMatch: boolean;
};

export type HistoricoMonthRow = {
  key: string;
  label: string;
  days: number;
  kwh: number;
  kwhDay: number;
  dieselKwh: number;
  dieselDay: number;
  op: number;
  opDay: number;
  sb: number;
  pp: number;
  pfCli: number;
  pfContr: number;
  fallasBitacora: number;
  fallasSummary: number;
  dispOpSb: number | null;
  util: number | null;
  nUnits: number;
  gteDisp: number | null;
  gteConf: number | null;
  gteFallas: number | null;
  gteKwh: number | null;
  gteDiesel: number | null;
};

export type CambioAgosto = {
  id: string;
  titulo: string;
  cambia: boolean;
  detalle: string;
};

/** COPOWER vs anexo GTE vs recuadro del Dpto. (este último solo existe en agosto). */
export type LecturaOficial = {
  key: string;
  label: string;
  copowerDisp: number | null;
  gteDisp: number | null;
  dptoDisp: number | null;
  copowerKwh: number;
  gteKwh: number | null;
  copowerDiesel: number;
  gteDiesel: number | null;
  copowerFallas: number;
  gteFallas: number | null;
  differ: boolean;
  verdict: string;
};

const HISTORICO_KEYS: CopowerMonthKey[] = ["Jun", "Jul", "Ago"];

function rowFromMonth(key: CopowerMonthKey): HistoricoMonthRow | null {
  const a = buildArteagaDashboard(key);
  if (!a) return null;
  const snap = COPOWER_MONTHLY_DATA[key];
  const days = a.units[0] ? Math.round(a.units[0].cal / 24) : 0;
  const gte = GRAN_TIERRA_MONTHLY_DATA[key as GranTierraMonthKey];
  return {
    key,
    label: `${COPOWER_MONTH_LABELS[key]}${key === "Ago" ? " (01–22)" : ""}`,
    days,
    kwh: a.header.kwh,
    kwhDay: days ? a.header.kwh / days : 0,
    dieselKwh: snap.summary.energyDieselKwh,
    dieselDay: days ? snap.summary.energyDieselKwh / days : 0,
    op: a.header.op,
    opDay: days ? a.header.op / days : 0,
    sb: a.header.sb,
    pp: a.header.pp,
    pfCli: a.header.pfCli,
    pfContr: a.header.corr,
    fallasBitacora: a.header.fallas,
    fallasSummary: snap.summary.copowerFailures,
    dispOpSb: a.header.dispFleet,
    util: ratio(a.header.op, a.header.cal),
    nUnits: a.header.nUnits,
    gteDisp: gte?.kpi.availability ?? null,
    gteConf: gte?.kpi.reliability ?? null,
    gteFallas: gte?.summary.copowerFailures ?? null,
    gteKwh: gte ? gte.totalGenerationKwh : null,
    gteDiesel: gte?.summary.energyDieselKwh ?? null,
  };
}

export function buildHistoricoIndicadores(): {
  rows: HistoricoMonthRow[];
  cambiosAgosto: CambioAgosto[];
  lecturas: LecturaOficial[];
} {
  const rows = HISTORICO_KEYS.map(rowFromMonth).filter((r): r is HistoricoMonthRow => r != null);
  const jun = rows.find((r) => r.key === "Jun");
  const jul = rows.find((r) => r.key === "Jul");
  const ago = rows.find((r) => r.key === "Ago");
  const cambiosAgosto: CambioAgosto[] = [];
  const lecturas: LecturaOficial[] = [];

  if (jun) {
    const kwhGap = jun.gteKwh != null && Math.abs(jun.kwh - jun.gteKwh) > 50_000;
    const dieselGap = jun.gteDiesel != null && Math.abs(jun.dieselKwh - jun.gteDiesel) > 10_000;
    lecturas.push({
      key: jun.key,
      label: jun.label,
      copowerDisp: jun.dispOpSb,
      gteDisp: jun.gteDisp,
      dptoDisp: null,
      copowerKwh: jun.kwh,
      gteKwh: jun.gteKwh,
      copowerDiesel: jun.dieselKwh,
      gteDiesel: jun.gteDiesel,
      copowerFallas: jun.fallasSummary,
      gteFallas: jun.gteFallas,
      differ: kwhGap || dieselGap || (jun.gteFallas != null && jun.gteFallas !== jun.fallasSummary),
      verdict:
        "Disponibilidad casi calza (COPOWER 98,65 % vs GTE 97,92 %). Difieren el alcance: GTE reporta menos kWh, más diésel (120 MWh vs 64 MWh) y 7 fallas imputables frente a 60 eventos de la bitácora COPOWER. No es el mismo conteo.",
    });
  }

  if (jul) {
    const dispGap = jul.gteDisp != null && jul.dispOpSb != null && Math.abs(jul.gteDisp - jul.dispOpSb) > 0.02;
    lecturas.push({
      key: jul.key,
      label: jul.label,
      copowerDisp: jul.dispOpSb,
      gteDisp: jul.gteDisp,
      dptoDisp: null,
      copowerKwh: jul.kwh,
      gteKwh: jul.gteKwh,
      copowerDiesel: jul.dieselKwh,
      gteDiesel: jul.gteDiesel,
      copowerFallas: jul.fallasSummary,
      gteFallas: jul.gteFallas,
      differ: dispGap,
      verdict:
        "kWh, diésel y fallas imputables coinciden (4,13 GWh · 133 MWh · 3). Lo que parte es la Disp. GTE 80,65 %: es SISTEMA N, no (OP+SB)/calendario de las 15 máquinas (97,73 %).",
    });
  }

  if (ago) {
    lecturas.push({
      key: ago.key,
      label: ago.label,
      copowerDisp: ago.dispOpSb,
      gteDisp: null,
      dptoDisp: ago.util,
      copowerKwh: ago.kwh,
      gteKwh: null,
      copowerDiesel: ago.dieselKwh,
      gteDiesel: null,
      copowerFallas: ago.fallasSummary,
      gteFallas: null,
      differ: true,
      verdict:
        "Sin Data Soporte GTE. El Dpto. publica 71,2 % (solo OP/calendario, y las tarjetas apuntan a JIN-02). La flota concertada está en 99,1 % (OP+SB). Horas y kWh por máquina sí son los mismos.",
    });
  }

  if (jun && jul && ago) {
    const kwhDayDeltaJul = ((ago.kwhDay - jul.kwhDay) / jul.kwhDay) * 100;
    const dieselDayDeltaJul = jul.dieselDay ? ((ago.dieselDay - jul.dieselDay) / jul.dieselDay) * 100 : 0;
    const pfCliDayJul = jul.days ? jul.pfCli / jul.days : 0;
    const pfCliDayAgo = ago.days ? ago.pfCli / ago.days : 0;
    cambiosAgosto.push(
      {
        id: "ventana",
        titulo: "El mes no está cerrado",
        cambia: true,
        detalle: `Agosto lleva ${ago.days} días de 31. Junio (30) y julio (31) sí están completos. Los 3,14 GWh no se comparan crudos contra 4,13 GWh de julio ni 4,24 GWh de junio.`,
      },
      {
        id: "flota",
        titulo: "Alcance de la flota",
        cambia: false,
        detalle: `Los tres meses son las mismas 15 unidades (CPW-01…07, G101V/G102J/G102K, JIN-01/02/10/11/12). No hay un parque distinto en agosto.`,
      },
      {
        id: "ritmo",
        titulo: "Ritmo de generación (kWh/día)",
        cambia: Math.abs(kwhDayDeltaJul) > 8,
        detalle: `${Math.round(ago.kwhDay).toLocaleString("es-CO")} kWh/día vs ${Math.round(jul.kwhDay).toLocaleString("es-CO")} en julio y ${Math.round(jun.kwhDay).toLocaleString("es-CO")} en junio (${kwhDayDeltaJul >= 0 ? "+" : ""}${kwhDayDeltaJul.toFixed(0)} % vs julio). El recorte de totales es de calendario, no de caída de carga.`,
      },
      {
        id: "diesel",
        titulo: "Diésel (Cummins / respaldo)",
        cambia: true,
        detalle: `${Math.round(ago.dieselDay).toLocaleString("es-CO")} kWh/día vs ${Math.round(jul.dieselDay).toLocaleString("es-CO")} en julio y ${Math.round(jun.dieselDay).toLocaleString("es-CO")} en junio (${dieselDayDeltaJul >= 0 ? "+" : ""}${dieselDayDeltaJul.toFixed(0)} % vs julio). Este sí es un cambio de campo: más respaldo diésel por día que en toda la serie.`,
      },
      {
        id: "fallas",
        titulo: "Fallas imputables COPOWER",
        cambia: true,
        detalle: `Agosto concertado: 0. Julio: ${jul.fallasSummary} (GTE también ${jul.gteFallas}). Junio GTE: ${jun.gteFallas} imputables; el resumen COPOWER marca ${jun.fallasSummary} y la suma de fallaEvento llega a ${jun.fallasBitacora} — tres conteos distintos. En campo, agosto está más limpio.`,
      },
      {
        id: "disp",
        titulo: "Disponibilidad (OP + SB) / calendario",
        cambia: false,
        detalle: `Junio ${fmtPct(jun.dispOpSb, 2)} · julio ${fmtPct(jul.dispOpSb, 2)} · agosto ${fmtPct(ago.dispOpSb, 2)}. No hay caída. El 71,2 % del Dpto. es utilización (solo OP), no este indicador.`,
      },
      {
        id: "util",
        titulo: "Utilización (solo OP / calendario)",
        cambia: true,
        detalle: `Agosto ${fmtPct(ago.util, 1)} vs julio ${fmtPct(jul.util, 1)} y junio ${fmtPct(jun.util, 1)}. Más horas en línea por día (${ago.opDay.toFixed(0)} h de flota vs ${jul.opDay.toFixed(0)} h en julio y ${jun.opDay.toFixed(0)} h en junio).`,
      },
      {
        id: "pfcli",
        titulo: "Parada por cliente (PF_cli)",
        cambia: Math.abs(pfCliDayAgo - pfCliDayJul) > 4,
        detalle: `Agosto ${fmtH(ago.pfCli)} en ${ago.days} días (~${pfCliDayAgo.toFixed(0)} h/día de flota). Julio ${fmtH(jul.pfCli)} (~${pfCliDayJul.toFixed(0)} h/día). Junio 0 h. Agosto sigue el patrón de julio, no el de junio.`,
      },
      {
        id: "gte",
        titulo: "Anexo oficial Gran Tierra",
        cambia: true,
        detalle: `Junio Disp. GTE ${fmtPct(jun.gteDisp, 2)} (kWh y diésel no calzan con COPOWER). Julio Disp. GTE ${fmtPct(jul.gteDisp, 2)} — SISTEMA N — pero kWh y diésel sí calzan. Agosto: no hay Data Soporte ni PDF. El libro de Juan Pabón no sustituye ese anexo.`,
      },
      {
        id: "bitacora",
        titulo: "Horas y kWh por máquina (Dpto. vs Arteaga)",
        cambia: false,
        detalle: "En agosto el pivot del Dpto. y la concertación 01–22 son la misma bitácora (CPW-10 = JIN-10). No hay un segundo parque. Lo que difiere es el recuadro de arriba (apunta a JIN-02 y usa OP/cal).",
      },
    );
  }
  return { rows, cambiosAgosto, lecturas };
}

export type IndicadorEstado = "cumple" | "alerta" | "no_aplica" | "info";

export type IndicadorOficialRow = {
  id: string;
  nombre: string;
  formula: string;
  valor: string;
  meta: string;
  estado: IndicadorEstado;
  lectura: string;
};

export type MtoCruceKind = "calza" | "desfase" | "solo_bitacora" | "diesel_sb";

export type MtoCruzadoRow = {
  id: string;
  tag: string;
  familia: "gas" | "diesel";
  sabanaFecha: string | null;
  sabanaHorasMto: number | null;
  sabanaHh: number | null;
  sabanaEstado: string;
  concFecha: string | null;
  concPp: number;
  cruce: MtoCruceKind;
  nota: string;
};

export type MtoCruzadoPack = {
  periodLabel: string;
  sabanaFile: string;
  concertacionFile: string;
  pdfFile: string;
  pdfNota: string;
  gasPlan: number;
  gasEjecutadosBitacora: number;
  dieselPlan: number;
  dieselConPp: number;
  ppHoras: number;
  rows: MtoCruzadoRow[];
};

export type IndicadoresCompare = {
  month: string;
  monthLabel: string;
  dpto: DptoDashboardSnapshot | null;
  arteaga: ArteagaDashboard | null;
  kpiDiffs: KpiDiffRow[];
  unitDiffs: UnitDiffRow[];
  differCount: number;
  sameCount: number;
  historico: ReturnType<typeof buildHistoricoIndicadores>;
  contrato: ContratoIndicadores | null;
  tablaOficial: IndicadorOficialRow[];
  mtoCruzado: MtoCruzadoPack | null;
};

/** Bitácora oficial de agosto: el archivo dice 01–23; las filas cierran el 22. */
export const CONCERTACION_AGO_SOURCE =
  "data/Agosto/Concertación de horas/Consolidado de Horas concertadas del 01 al 23 de Agosto.xlsx";

export const SABANA_AGO_SOURCE = "data/Agosto/mantenimiento /SABANA MMTOS GEN PUTUMAYO 1 (1).xlsx";

export const MTO_PDF_SEMANA_SOURCE =
  "data/Agosto/mantenimiento /PLANEACION MANTENIMIENTOS SEMANA DEL 31 AL 6 SEP 2026.pdf";

/**
 * Cruce 01–22: columna de equipo en GENERACIÓN PUTUMAYO (horas MTO / H-H)
 * vs Horas MMT Preventivo de la concertación. Las columnas “MTO PROGRAMADO /
 * EJECUTADO” del Excel son un resumen diario, no el equipo.
 */
export const AGOSTO_MTO_CRUZADO: MtoCruzadoPack = {
  periodLabel: "Agosto 2026 · 01–22",
  sabanaFile: SABANA_AGO_SOURCE,
  concertacionFile: CONCERTACION_AGO_SOURCE,
  pdfFile: MTO_PDF_SEMANA_SOURCE,
  pdfNota:
    "El PDF de la semana 31 ago–6 sep es plan siguiente, no el cierre 01–22. Lunes 31: CPW-02 (12 h). Jueves 3: CPW-10. Sábado 6: CPW-12. Diésel y JINAN 10/11/12 / Vonú solo si cumplen 350 h OP.",
  gasPlan: 8,
  gasEjecutadosBitacora: 8,
  dieselPlan: 6,
  dieselConPp: 0,
  ppHoras: 73,
  rows: [
    {
      id: "jin01-a",
      tag: "JIN-01",
      familia: "gas",
      sabanaFecha: "2026-08-10",
      sabanaHorasMto: 10,
      sabanaHh: 20,
      sabanaEstado: "Sin marca de ejecución",
      concFecha: "2026-08-03",
      concPp: 8,
      cruce: "desfase",
      nota: "Bitácora adelantó el preventivo al 03 (8 h). Vonú.",
    },
    {
      id: "jin01-b",
      tag: "JIN-01",
      familia: "gas",
      sabanaFecha: null,
      sabanaHorasMto: null,
      sabanaHh: null,
      sabanaEstado: "—",
      concFecha: "2026-08-21",
      concPp: 8,
      cruce: "solo_bitacora",
      nota: "Segunda parada PP (8 h). La sábana vuelve a marcar JINAN 01 el 26, fuera de este recorte.",
    },
    {
      id: "jin02",
      tag: "JIN-02",
      familia: "gas",
      sabanaFecha: "2026-08-05",
      sabanaHorasMto: 10,
      sabanaHh: 20,
      sabanaEstado: "Programado pendiente",
      concFecha: "2026-08-10",
      concPp: 7,
      cruce: "desfase",
      nota: "Se ejecutó 5 días después. La sábana 05 no se actualizó.",
    },
    {
      id: "cpw06",
      tag: "CPW-06",
      familia: "gas",
      sabanaFecha: "2026-08-06",
      sabanaHorasMto: 10,
      sabanaHh: 20,
      sabanaEstado: "Ejecutado (M1 aceite y filtros)",
      concFecha: "2026-08-06",
      concPp: 8,
      cruce: "calza",
      nota: "Misma fecha. Ventana sábana 10 h; bitácora 8 h reales.",
    },
    {
      id: "cpw03",
      tag: "CPW-03",
      familia: "gas",
      sabanaFecha: "2026-08-07",
      sabanaHorasMto: 10,
      sabanaHh: 20,
      sabanaEstado: "Ejecutado (M2 preventivo)",
      concFecha: "2026-08-07",
      concPp: 7,
      cruce: "calza",
      nota: "Misma fecha. Bitácora: sale por apagado de MRU + preventivo.",
    },
    {
      id: "cpw10",
      tag: "CPW-10",
      familia: "gas",
      sabanaFecha: "2026-08-16",
      sabanaHorasMto: 10,
      sabanaHh: 20,
      sabanaEstado: "Ejecutado el 18",
      concFecha: "2026-08-18",
      concPp: 8,
      cruce: "desfase",
      nota: "Plan 16, ejecución 18. Calza con la fecha de bitácora.",
    },
    {
      id: "cpw07",
      tag: "CPW-07",
      familia: "gas",
      sabanaFecha: "2026-08-17",
      sabanaHorasMto: 12,
      sabanaHh: 24,
      sabanaEstado: "Ejecutado (nota: se posterga por MTO de turbina)",
      concFecha: "2026-08-17",
      concPp: 6,
      cruce: "calza",
      nota: "Misma fecha. 6 h PP vs 12 h de ventana en sábana.",
    },
    {
      id: "cpw01",
      tag: "CPW-01",
      familia: "gas",
      sabanaFecha: "2026-08-19",
      sabanaHorasMto: 10,
      sabanaHh: 20,
      sabanaEstado: "Programado pendiente",
      concFecha: "2026-08-19",
      concPp: 6,
      cruce: "calza",
      nota: "La bitácora sí lo hizo. La sábana no actualizó el estado.",
    },
    {
      id: "cpw12",
      tag: "CPW-12",
      familia: "gas",
      sabanaFecha: "2026-08-20",
      sabanaHorasMto: 12,
      sabanaHh: 24,
      sabanaEstado: "Ejecutado",
      concFecha: "2026-08-20",
      concPp: 8,
      cruce: "calza",
      nota: "Equipo en stand-by el resto del día (16 h SB). Preventivo 8 h.",
    },
    {
      id: "cpw11",
      tag: "CPW-11",
      familia: "gas",
      sabanaFecha: "2026-08-30",
      sabanaHorasMto: 12,
      sabanaHh: 24,
      sabanaEstado: "Planificado el 30 (fuera de 01–22)",
      concFecha: "2026-08-11",
      concPp: 7,
      cruce: "solo_bitacora",
      nota: "PP el 11. La sábana 01–22 no lo tenía; aparece el 30.",
    },
    {
      id: "g101v-a",
      tag: "G101V",
      familia: "diesel",
      sabanaFecha: "2026-08-05",
      sabanaHorasMto: 10,
      sabanaHh: 20,
      sabanaEstado: "Programado pendiente",
      concFecha: null,
      concPp: 0,
      cruce: "diesel_sb",
      nota: "418 h en stand-by en el recorte. Condición 350 h OP. No resta A%.",
    },
    {
      id: "g101v-b",
      tag: "G101V",
      familia: "diesel",
      sabanaFecha: "2026-08-20",
      sabanaHorasMto: 10,
      sabanaHh: 20,
      sabanaEstado: "Ejecutado (nota: diésel en SB)",
      concFecha: null,
      concPp: 0,
      cruce: "diesel_sb",
      nota: "Marca de sábana; la concertación no registra PP (0 h MMT).",
    },
    {
      id: "g102j-a",
      tag: "G102J",
      familia: "diesel",
      sabanaFecha: "2026-08-06",
      sabanaHorasMto: 10,
      sabanaHh: 20,
      sabanaEstado: "Ejecutado",
      concFecha: null,
      concPp: 0,
      cruce: "diesel_sb",
      nota: "418 h SB. Sin PP en bitácora.",
    },
    {
      id: "g102j-b",
      tag: "G102J",
      familia: "diesel",
      sabanaFecha: "2026-08-21",
      sabanaHorasMto: 10,
      sabanaHh: 20,
      sabanaEstado: "Programado pendiente",
      concFecha: null,
      concPp: 0,
      cruce: "diesel_sb",
      nota: "Pendiente en sábana. Sin PP concertado.",
    },
    {
      id: "g102k-a",
      tag: "G102K",
      familia: "diesel",
      sabanaFecha: "2026-08-07",
      sabanaHorasMto: 10,
      sabanaHh: 20,
      sabanaEstado: "Ejecutado",
      concFecha: null,
      concPp: 0,
      cruce: "diesel_sb",
      nota: "408 h SB. Sin PP en bitácora.",
    },
    {
      id: "g102k-b",
      tag: "G102K",
      familia: "diesel",
      sabanaFecha: "2026-08-22",
      sabanaHorasMto: 10,
      sabanaHh: 20,
      sabanaEstado: "Programado pendiente",
      concFecha: null,
      concPp: 0,
      cruce: "diesel_sb",
      nota: "Pendiente en sábana. Sin PP concertado.",
    },
  ],
};

const META_DISP = 0.98;

export function displayTag(id: string): string {
  const u = id.replace(/\s+/g, "").toUpperCase();
  if (/^CPW0?\d+$/.test(u)) return u.replace(/^CPW0?/, "CPW-").replace(/^CPW-(\d)$/, "CPW-0$1");
  if (/^JIN0?\d+$/.test(u.replace(/-/g, ""))) {
    const n = u.replace(/-/g, "").replace(/^JIN/, "");
    return `JIN-${n.padStart(2, "0")}`;
  }
  return id;
}

function normId(id: string): string {
  const u = id.replace(/[\s-]/g, "").toUpperCase();
  if (/^CPW(10|11|12)$/.test(u)) return `JIN-${u.slice(3)}`;
  if (/^JIN(10|11|12|01|02)$/.test(u)) return `JIN-${u.slice(3)}`;
  if (/^CPW0?\d$/.test(u) || /^CPW\d{2}$/.test(u)) return u.replace(/^CPW0/, "CPW").replace(/^CPW(\d)$/, "CPW0$1");
  return u;
}

function familyOf(id: string, campo: string): IndicadoresUnitRow["family"] {
  const n = normId(id);
  if (n.startsWith("G10")) return "CUMMINS";
  if (n.startsWith("JIN")) return "JINAN";
  if (campo === "VONU") return "JINAN";
  return "CPW";
}

function ratio(num: number, den: number): number | null {
  if (!den) return null;
  return num / den;
}

function fmtKwh(v: number): string {
  return `${Math.round(v).toLocaleString("es-CO")} kWh`;
}

function fmtH(v: number | null): string {
  if (v == null) return "N/A";
  return `${v.toLocaleString("es-CO", { maximumFractionDigits: 1 })} h`;
}

function fmtPct(v: number | null, d = 1): string {
  if (v == null || Number.isNaN(v)) return "N/A";
  return `${(v * 100).toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d })} %`;
}

function near(a: number, b: number, abs = 0.6, rel = 0.002): boolean {
  const d = Math.abs(a - b);
  return d <= abs || d <= Math.abs(b) * rel;
}

function nearPct(a: number | null, b: number | null, pp = 0.15): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return Math.abs(a - b) * 100 <= pp;
}

export type ContratoKpiRow = {
  id: string;
  nombre: string;
  formula: string;
  meta: string;
  contratoLabel: string;
  dptoHeader: string;
  dptoTabla: string;
  arteaga: string;
  dptoHeaderMatch: boolean | null;
  dptoTablaMatch: boolean | null;
  arteagaMatch: boolean;
  detalle: string;
};

export type ContratoIndicadores = {
  month: string;
  tpp: number;
  pp: number;
  pfContr: number;
  pfCli: number;
  disponibles: number;
  op: number;
  sb: number;
  fallas: number;
  aContrato: number | null;
  rContrato: number | null;
  rSistema: number | null;
  mtbf: number | null;
  mttr: number | null;
  aUtil: number | null;
  aSiContaraPfCli: number | null;
  partitionOk: boolean;
  partitionSum: number;
  rows: ContratoKpiRow[];
};

/**
 * Tabla 13 / Hoja1 del contrato:
 * A = [TPP − (PP + PF no programadas del contratista)] / TPP
 * R = [TPP − PF no programadas] / TPP
 * Eventos externos (PF_cli) se pactan y no entran como parada del contratista.
 * Horas disponibles ≡ TPP − PP − PF_contr ≡ OP + SB cuando la concertación cierra el calendario.
 */
export function buildContratoIndicadores(
  month: string,
  arteaga: ArteagaDashboard | null,
  dpto: DptoDashboardSnapshot | null,
): ContratoIndicadores | null {
  if (!arteaga) return null;
  const tpp = arteaga.header.cal;
  const op = arteaga.header.op;
  const sb = arteaga.header.sb;
  const pp = arteaga.header.pp;
  const pfContr = arteaga.header.corr;
  const pfCli = arteaga.header.pfCli;
  const fallas = arteaga.header.fallas;
  const partitionSum = op + sb + pp + pfContr;
  const partitionOk = Math.abs(partitionSum - tpp) <= 2;
  const disponibles = tpp - pp - pfContr;
  const aContrato = ratio(disponibles, tpp);
  const aUtil = ratio(op, tpp);
  const aSiContaraPfCli = ratio(tpp - pp - pfContr - pfCli, tpp);
  const rContrato = ratio(tpp - pfContr, tpp);
  const rSistema = arteaga.units.reduce((prod, u) => {
    const ri = u.cal ? (u.cal - u.corr) / u.cal : 1;
    return prod * (1 - ri);
  }, 1);
  const rSistemaVal = 1 - rSistema;
  const mtbf = fallas > 0 ? op / fallas : null;
  const mttr = fallas > 0 ? pfContr / fallas : null;
  const dptoAHeader = dpto?.header.dispHeader ?? null;
  const dptoATabla = dpto?.fleet.dispFleet ?? null;
  const dptoConf = dpto?.header.conf ?? null;
  const dptoMtbf = dpto?.header.mtbf ?? null;
  const dptoMttr = dpto?.header.mttr ?? null;

  const rows: ContratoKpiRow[] = [
    {
      id: "a",
      nombre: "Disponibilidad operacional A%",
      formula: "A = [TPP − (PP + PF no programadas)] / TPP   ≡   horas disponibles / horas programadas",
      meta: "≥ 98%",
      contratoLabel: fmtPct(aContrato, 2),
      dptoHeader: fmtPct(dptoAHeader, 1),
      dptoTabla: fmtPct(dptoATabla, 2),
      arteaga: fmtPct(arteaga.header.dispFleet, 2),
      dptoHeaderMatch: dptoAHeader == null ? null : nearPct(aContrato, dptoAHeader, 0.2),
      dptoTablaMatch: dptoATabla == null ? null : nearPct(aContrato, dptoATabla, 0.2),
      arteagaMatch: nearPct(aContrato, arteaga.header.dispFleet, 0.2),
      detalle:
        "Stand-by no es parada: es tiempo disponible sin despacho. OP/TPP es utilización (~71 %), no A%.",
    },
    {
      id: "r",
      nombre: "Confiabilidad R% (individual / flota)",
      formula: "R = [TPP − PF no programadas (fallas)] / TPP   — no resta PP",
      meta: "≥ 98%",
      contratoLabel: fmtPct(rContrato, 2),
      dptoHeader: fmtPct(dptoConf, 1),
      dptoTabla: fmtPct(dptoConf, 1),
      arteaga: fmtPct(arteaga.header.conf, 2),
      dptoHeaderMatch: dptoConf == null ? null : nearPct(rContrato, dptoConf, 0.2),
      dptoTablaMatch: dptoConf == null ? null : nearPct(rContrato, dptoConf, 0.2),
      arteagaMatch: nearPct(rContrato, arteaga.header.conf, 0.2),
      detalle:
        "Este mes da 100 % porque PF_contr = 0. No es el conteo de unidades sin falla.",
    },
    {
      id: "rsis",
      nombre: "Confiabilidad en paralelo Rsistema",
      formula: "Rsistema = 1 − Π (1 − Ri)",
      meta: "≥ 98% disponibilidad de respaldo",
      contratoLabel: fmtPct(rSistemaVal, 2),
      dptoHeader: "No calcula",
      dptoTabla: "No calcula",
      arteaga: fmtPct(rSistemaVal, 2),
      dptoHeaderMatch: null,
      dptoTablaMatch: null,
      arteagaMatch: true,
      detalle:
        "Con 15 unidades, si alguna tiene Ri = 100 % el producto se hace cero y Rsistema = 100 %. Es respaldo en paralelo.",
    },
    {
      id: "mtbf",
      nombre: "MTBF",
      formula: "Horas operativas / N° de fallas registradas",
      meta: "Alineado a A% y R%",
      contratoLabel: mtbf == null ? "N/A (0 fallas)" : fmtH(mtbf),
      dptoHeader: dpto ? "N/A (#DIV/0!)" : "—",
      dptoTabla: dpto ? "N/A (#DIV/0!)" : "—",
      arteaga: arteaga.header.mtbf == null ? "N/A (0 fallas)" : fmtH(arteaga.header.mtbf),
      dptoHeaderMatch: dpto ? mtbf == null && dptoMtbf == null : null,
      dptoTablaMatch: dpto ? mtbf == null && dptoMtbf == null : null,
      arteagaMatch: (mtbf == null && arteaga.header.mtbf == null) || near(mtbf ?? -1, arteaga.header.mtbf ?? -2),
      detalle:
        "Sin fallas el contrato no define MTBF. Lo correcto es N/A, no 0.",
    },
    {
      id: "mttr",
      nombre: "MTTR",
      formula: "Σ tiempo de reparación / N° de fallas",
      meta: "Alineado a A% y R%  (MTTR bajo = bueno)",
      contratoLabel: mttr == null ? "N/A (0 fallas)" : fmtH(mttr),
      dptoHeader: dptoMttr == null ? (dpto ? "N/A" : "—") : fmtH(dptoMttr),
      dptoTabla: dptoMttr == null ? (dpto ? "N/A" : "—") : fmtH(dptoMttr),
      arteaga: arteaga.header.mttr == null ? "N/A (0 fallas)" : fmtH(arteaga.header.mttr),
      dptoHeaderMatch: dpto ? mttr == null && dptoMttr == null : null,
      dptoTablaMatch: dpto ? mttr == null && dptoMttr == null : null,
      arteagaMatch: mttr == null && arteaga.header.mttr == null,
      detalle: "Tiempo de reparación = PF contratista. Agosto: 0 h de PF_contr y 0 fallas.",
    },
    {
      id: "icp",
      nombre: "ICP% capacidad de potencia",
      formula: "PMC demostrada en prueba / PMC comprometida en contrato",
      meta: "≥ PMC comprometida",
      contratoLabel: "Sin PMC de contrato en este libro",
      dptoHeader: dpto ? `${dpto.cargabilidad.length} pruebas (1 suspendida)` : "—",
      dptoTabla: "No es ICP",
      arteaga: "Sin serie mensual",
      dptoHeaderMatch: null,
      dptoTablaMatch: null,
      arteagaMatch: true,
      detalle:
        "La concertación no trae PMC comprometida vs demostrada. Sin ICP de Tabla 13 este mes.",
    },
  ];

  return {
    month,
    tpp,
    pp,
    pfContr,
    pfCli,
    disponibles,
    op,
    sb,
    fallas,
    aContrato,
    rContrato,
    rSistema: rSistemaVal,
    mtbf,
    mttr,
    aUtil,
    aSiContaraPfCli,
    partitionOk,
    partitionSum,
    rows,
  };
}

function estadoMetaPct(valor: number | null, meta: number): IndicadorEstado {
  if (valor == null) return "no_aplica";
  return valor + 1e-9 >= meta ? "cumple" : "alerta";
}

export function buildTablaIndicadoresOficial(
  contrato: ContratoIndicadores | null,
  mto: MtoCruzadoPack | null,
): IndicadorOficialRow[] {
  if (!contrato) return [];
  const aOk = estadoMetaPct(contrato.aContrato, META_DISP);
  const rOk = estadoMetaPct(contrato.rContrato, META_DISP);
  const rsisOk = estadoMetaPct(contrato.rSistema, META_DISP);
  const gasPct = mto && mto.gasPlan ? mto.gasEjecutadosBitacora / mto.gasPlan : null;

  return [
    {
      id: "a",
      nombre: "Disponibilidad operacional A%",
      formula: "A = [TPP − (PP + PF contratista)] / TPP  ≡  (OP + SB) / calendario",
      valor: fmtPct(contrato.aContrato, 2),
      meta: "≥ 98%",
      estado: aOk,
      lectura: `Horas disponibles ${fmtH(contrato.disponibles)} = TPP ${fmtH(contrato.tpp)} − PP ${fmtH(contrato.pp)} − PF_contr ${fmtH(contrato.pfContr)}. Stand-by cuenta. PF cliente (${fmtH(contrato.pfCli)}) no resta.`,
    },
    {
      id: "r",
      nombre: "Confiabilidad R%",
      formula: "R = [TPP − PF no programadas] / TPP  — no resta PP",
      valor: fmtPct(contrato.rContrato, 2),
      meta: "≥ 98%",
      estado: rOk,
      lectura: `0 h de PF contratista y ${contrato.fallas} fallas. El preventivo no baja R%.`,
    },
    {
      id: "rsis",
      nombre: "Confiabilidad en paralelo Rsistema",
      formula: "Rsistema = 1 − Π (1 − Ri)",
      valor: fmtPct(contrato.rSistema, 2),
      meta: "≥ 98% respaldo",
      estado: rsisOk,
      lectura: "Respaldo en paralelo: con alguna Ri = 100 % el sistema queda cubierto.",
    },
    {
      id: "mtbf",
      nombre: "MTBF",
      formula: "Horas operativas / N° de fallas",
      valor: contrato.mtbf == null ? "N/A" : fmtH(contrato.mtbf),
      meta: "Seguimiento",
      estado: "no_aplica",
      lectura: contrato.fallas === 0 ? "Sin fallas: el contrato no define MTBF. No se publica 0." : "",
    },
    {
      id: "mttr",
      nombre: "MTTR",
      formula: "Σ tiempo de reparación / N° de fallas",
      valor: contrato.mttr == null ? "N/A" : fmtH(contrato.mttr),
      meta: "Seguimiento (bajo = bueno)",
      estado: "no_aplica",
      lectura: "Reparación = PF contratista. Este recorte: 0 h y 0 fallas.",
    },
    {
      id: "icp",
      nombre: "ICP% capacidad de potencia",
      formula: "PMC demostrada / PMC comprometida",
      valor: "Sin PMC",
      meta: "≥ PMC comprometida",
      estado: "info",
      lectura: "La concertación no trae la prueba contractual de potencia máxima continua.",
    },
    {
      id: "mto",
      nombre: "Cumplimiento del plan de mantenimiento",
      formula: "Actividades ejecutadas (bitácora) / planificadas (sábana, gas)",
      valor: mto && gasPct != null ? `${mto.gasEjecutadosBitacora}/${mto.gasPlan} = ${fmtPct(gasPct, 0)}` : "Sin sábana del mes",
      meta: "≥ 100%",
      estado: mto && gasPct != null && gasPct >= 1 ? "cumple" : mto ? "alerta" : "info",
      lectura: mto
        ? `Gas: ${mto.gasEjecutadosBitacora} de ${mto.gasPlan} con PP en concertación. Diésel: ${mto.dieselConPp}/${mto.dieselPlan} PP (condición 350 h OP / equipo en SB). Horas que sí restan A%: ${fmtH(mto.ppHoras)}.`
        : "No hay cruce sábana para este mes.",
    },
    {
      id: "util",
      nombre: "Utilización (no es A%)",
      formula: "OP / TPP",
      valor: fmtPct(contrato.aUtil, 1),
      meta: "No contractual",
      estado: "info",
      lectura: "Es el % de tiempo despachado. No se usa para cerrar disponibilidad.",
    },
    {
      id: "sd",
      nombre: "Shutdowns de campo imputables",
      formula: "Conteo de apagones de campo por causa O&M",
      valor: String(contrato.fallas),
      meta: "Ideal: 0",
      estado: contrato.fallas === 0 ? "cumple" : "alerta",
      lectura: "Numero de fallas en la concertación. Este recorte: 0.",
    },
  ];
}

export function buildArteagaDashboard(month: string): ArteagaDashboard | null {
  if (!(month in COPOWER_MONTHLY_DATA)) return null;
  const key = month as CopowerMonthKey;
  const snap = COPOWER_MONTHLY_DATA[key];
  const units: IndicadoresUnitRow[] = snap.generationByEquipment.map((u) => {
    const cal = u.horasCalDia || 0;
    const disp = ratio(u.horasOperacion + u.horasStandBy, cal) ?? 0;
    return {
      tag: displayTag(u.equipo),
      matchId: normId(u.equipo),
      campo: /vonu/i.test(u.campo) ? "VONU" : "COSTAYACO",
      family: familyOf(u.equipo, u.campo),
      kwh: u.energiaKwh,
      op: u.horasOperacion,
      sb: u.horasStandBy,
      disp,
      fallas: u.fallaEvento,
      pp: u.horasPP,
      corr: u.horasPFContr,
      pfCli: u.horasPFCli,
      cal,
    };
  });
  const kwh = units.reduce((s, u) => s + u.kwh, 0);
  const op = units.reduce((s, u) => s + u.op, 0);
  const sb = units.reduce((s, u) => s + u.sb, 0);
  const pp = units.reduce((s, u) => s + u.pp, 0);
  const corr = units.reduce((s, u) => s + u.corr, 0);
  const pfCli = units.reduce((s, u) => s + u.pfCli, 0);
  const cal = units.reduce((s, u) => s + u.cal, 0);
  const fallas = units.reduce((s, u) => s + u.fallas, 0);
  const dispFleet = ratio(op + sb, cal);
  const conf = ratio(cal - corr, cal);
  const nFailUnits = units.filter((u) => u.fallas > 0).length;

  const group = (label: string, list: IndicadoresUnitRow[]): IndicadoresGroupRow => {
    const gCal = list.reduce((s, u) => s + u.cal, 0);
    const gOp = list.reduce((s, u) => s + u.op, 0);
    const gSb = list.reduce((s, u) => s + u.sb, 0);
    const gKwh = list.reduce((s, u) => s + u.kwh, 0);
    return {
      label,
      count: list.length,
      kwh: gKwh,
      op: gOp,
      disp: ratio(gOp + gSb, gCal),
      share: kwh ? gKwh / kwh : null,
      fallas: list.reduce((s, u) => s + u.fallas, 0),
    };
  };

  const cpw = units.filter((u) => u.family === "CPW");
  const cummins = units.filter((u) => u.family === "CUMMINS");
  const jinanCyc = units.filter((u) => u.family === "JINAN" && u.campo === "COSTAYACO");
  const jinanVonu = units.filter((u) => u.family === "JINAN" && u.campo === "VONU");
  const cyc = units.filter((u) => u.campo === "COSTAYACO");
  const vonu = units.filter((u) => u.campo === "VONU");

  return {
    month: key,
    periodLabel: snap.label,
    sourceFile: snap.sourceFile,
    header: {
      kwh,
      op,
      sb,
      dispHeader: dispFleet,
      dispFleet,
      fallas,
      pp,
      corr,
      pfCli,
      cal,
      mtbf: fallas > 0 ? op / fallas : null,
      mttr: fallas > 0 ? corr / fallas : null,
      conf,
      indisp: dispFleet == null ? null : 1 - dispFleet,
      pctUnidFallas: units.length ? nFailUnits / units.length : null,
      nUnits: units.length,
    },
    units,
    byType: [
      group("CPW (J320/J420)", cpw),
      group("CUMMINS (G10x)", cummins),
      group("JINAN Costayaco", jinanCyc),
      group("JINAN Vonú", jinanVonu),
      group("TOTAL", units),
    ].filter((g) => g.count > 0),
    byField: [group("COSTAYACO", cyc), group("VONU", vonu), group("TOTAL", units)].filter((g) => g.count > 0),
    byBasin: [group("PUTN", units)],
    top5: [...units]
      .sort((a, b) => b.kwh - a.kwh)
      .slice(0, 5)
      .map((u) => ({ tag: u.tag, kwh: u.kwh })),
    formulas: {
      disp: "Disp = (OP + SB) / horas calendario",
      conf: "Conf = (calendario − PF contratista) / calendario",
      util: "Utilización = OP / calendario  (no es disponibilidad)",
      mtbf: "MTBF = OP / N° fallas  (N/A si 0 fallas)",
      mttr: "MTTR = PF contratista / N° fallas  (N/A si 0 fallas)",
    },
  };
}

function kpiRow(
  id: string,
  label: string,
  dptoFormula: string,
  arteagaFormula: string,
  dpto: string,
  arteaga: string,
  differ: boolean,
  detail: string,
): KpiDiffRow {
  return { id, label, dptoFormula, arteagaFormula, dpto, arteaga, differ, detail };
}

export function buildIndicadoresCompare(month: string, monthLabel: string): IndicadoresCompare {
  const arteaga = buildArteagaDashboard(month);
  const dpto = month === DPTO_DASHBOARD_MONTH ? DPTO_GENERACION_DASHBOARD : null;
  const kpiDiffs: KpiDiffRow[] = [];
  const unitDiffs: UnitDiffRow[] = [];

  if (dpto && arteaga) {
    const h = dpto.header;
    const a = arteaga.header;
    const f = dpto.fleet;
    kpiDiffs.push(
      kpiRow(
        "period",
        "Periodo del tablero",
        `Título «${dpto.titlePeriod}» · resumen «${dpto.execPeriod}»`,
        arteaga.periodLabel,
        `${dpto.titlePeriod} / ${dpto.execPeriod}`,
        arteaga.periodLabel,
        true,
        "El título ya dice agosto 01–22. El recuadro de texto a la derecha sigue hablando de mayo (16 unidades, MTBF 2.141 h).",
      ),
      kpiRow(
        "kwh-header",
        "Total kWh (tarjeta KPI)",
        "Hoja1!H20 — Total general del pivot",
        "Σ kWh de todas las unidades",
        fmtKwh(h.kwh),
        fmtKwh(a.kwh),
        !near(h.kwh, a.kwh, 1),
        "Archivo corregido: la tarjeta lee el total de flota (3.135.033 kWh), igual que la tabla.",
      ),
      kpiRow(
        "op-header",
        "Horas operación (tarjeta)",
        "Hoja1!B20 — Total general",
        "Σ OP",
        fmtH(h.op),
        fmtH(a.op),
        !near(h.op, a.op),
        "Archivo corregido: 5.638 h de flota, igual que la concertación.",
      ),
      kpiRow(
        "sb-header",
        "Horas stand-by (tarjeta)",
        "Hoja1!C20 — Total general",
        "Σ SB",
        fmtH(h.sb),
        fmtH(a.sb),
        !near(h.sb, a.sb),
        "Archivo corregido: 2.209 h de stand-by de flota.",
      ),
      kpiRow(
        "disp-header",
        "Disponibilidad (tarjeta)",
        "(OP + SB) / calendario  (Hoja1!B20+C20)/G20",
        "(OP + SB) / calendario",
        fmtPct(h.dispHeader),
        fmtPct(a.dispHeader, 2),
        !nearPct(h.dispHeader, a.dispHeader),
        "Archivo corregido: A% contractual 99,1 %. El 71,2 % queda solo en recuadros laterales (PUTN / por tipo) que aún dividen solo OP.",
      ),
      kpiRow(
        "disp-fleet",
        "Disponibilidad (total tabla)",
        "PROMEDIO (OP+SB)/cal por unidad",
        "(Σ OP + Σ SB) / Σ cal",
        fmtPct(f.dispFleet, 2),
        fmtPct(a.dispFleet, 2),
        !nearPct(f.dispFleet, a.dispFleet, 0.05),
        "Con el mismo calendario por máquina, promedio y total ponderado coinciden.",
      ),
      kpiRow(
        "conf",
        "Confiabilidad",
        "% de unidades con 0 fallas (COUNTIF)",
        "(cal − PF contratista) / cal",
        fmtPct(h.conf, 1),
        fmtPct(a.conf, 2),
        false,
        "El número da 100 % en ambas porque no hay fallas imputables. La fórmula no es la misma.",
      ),
      kpiRow(
        "fallas",
        "Total fallas",
        "Suma de fallas del pivot",
        "Suma fallaEvento concertación",
        String(h.fallas),
        String(a.fallas),
        h.fallas !== a.fallas,
        "Cero en las dos fuentes.",
      ),
      kpiRow(
        "pp-header",
        "Hrs MMT (tarjeta)",
        "Hoja1!E20+F20 (PP + correctivo de flota)",
        "Σ PP preventivo concertado",
        fmtH(h.pp),
        fmtH(a.pp),
        !near(h.pp, a.pp),
        "Archivo corregido: 73 h PP, igual que la tabla y la concertación.",
      ),
      kpiRow(
        "pp-fleet",
        "Hrs MMT preventivo (tabla)",
        "SUM PP de unidades",
        "Σ PP",
        fmtH(f.pp),
        fmtH(a.pp),
        !near(f.pp, a.pp),
        "Las horas de mantenimiento programado coinciden.",
      ),
      kpiRow(
        "pf-cli",
        "Paradas externas / PF cliente",
        "Columna I del pivot; no entra a Disp. de la tarjeta",
        "Σ PF cliente (resta disponibilidad contractual GTE, no la COPOWER)",
        fmtH(f.pfCli),
        fmtH(a.pfCli),
        !near(f.pfCli, a.pfCli),
        "374 h están en el pivot del Dpto. pero la tarjeta de disponibilidad las ignora (usa solo OP/cal).",
      ),
      kpiRow(
        "mtbf",
        "MTBF",
        "GETPIVOTDATA OP−SB−MMT / fallas → #DIV/0!",
        "OP / fallas; N/A si 0 fallas",
        "N/A (#DIV/0!)",
        a.mtbf == null ? "N/A" : fmtH(a.mtbf),
        false,
        "Sin fallas no hay MTBF. El resumen ejecutivo del Dpto. aún cita 2.141 h de mayo.",
      ),
      kpiRow(
        "units-n",
        "Unidades en flota",
        "Resumen ejecutivo: 16 · tabla: 15",
        "Filas de concertación",
        "15 (texto 16)",
        String(a.nUnits),
        dpto.execNotes.some((n) => /16 unidad/i.test(n)),
        "La tabla tiene 15 equipos; el recuadro ejecutivo arrastra 16 de mayo.",
      ),
      kpiRow(
        "type-mix",
        "Agrupación por tipo",
        "JIN-10/11/12 se llaman CPW-10/11/12 y entran al grupo CPW",
        "JIN-10/11/12 son JINAN Costayaco; CPW son 7 J320/J420",
        "CPW = 10 unid.",
        `CPW = ${arteaga.byType.find((g) => g.label.startsWith("CPW"))?.count ?? "—"} unid.`,
        true,
        "El Dpto. mezcla tres JINAN de Costayaco con los Jenbacher CPW. La energía de esos 10 sí suma el Costayaco a gas (2,57 GWh).",
      ),
    );

    const arteagaById = new Map(arteaga.units.map((u) => [normId(u.matchId), u]));
    for (const u of dpto.units) {
      const aU = arteagaById.get(normId(u.matchId));
      if (!aU) {
        unitDiffs.push({
          dptoTag: u.tag,
          arteagaTag: "—",
          kwhDpto: u.kwh,
          kwhArteaga: 0,
          opDpto: u.op,
          opArteaga: 0,
          sbDpto: u.sb,
          sbArteaga: 0,
          dispDpto: u.disp,
          dispArteaga: 0,
          hoursMatch: false,
          energyMatch: false,
          dispMatch: false,
        });
        continue;
      }
      unitDiffs.push({
        dptoTag: u.tag,
        arteagaTag: aU.tag,
        kwhDpto: u.kwh,
        kwhArteaga: aU.kwh,
        opDpto: u.op,
        opArteaga: aU.op,
        sbDpto: u.sb,
        sbArteaga: aU.sb,
        dispDpto: u.disp,
        dispArteaga: aU.disp,
        hoursMatch: near(u.op, aU.op) && near(u.sb, aU.sb),
        energyMatch: near(u.kwh, aU.kwh, 1),
        dispMatch: nearPct(u.disp, aU.disp, 0.2),
      });
    }
  }

  const contrato = buildContratoIndicadores(month, arteaga, dpto);
  const mtoCruzado = month === "Ago" ? AGOSTO_MTO_CRUZADO : null;
  const tablaOficial = buildTablaIndicadoresOficial(contrato, mtoCruzado);
  const differCount = kpiDiffs.filter((r) => r.differ).length;
  const sameCount = kpiDiffs.filter((r) => !r.differ).length;
  return {
    month,
    monthLabel,
    dpto,
    arteaga,
    kpiDiffs,
    unitDiffs,
    differCount,
    sameCount,
    historico: buildHistoricoIndicadores(),
    contrato,
    tablaOficial,
    mtoCruzado,
  };
}

export const INDICADORES_META_DISP = META_DISP;

export { fmtKwh, fmtH, fmtPct };
