import { CONCERTACION_PACK } from "./buildConcertacionAnalysis";
import type { ConcertacionRegistro } from "./types";

export type MaquinaEstadoDia =
  | "operacion_plena"
  | "parada_externa"
  | "mantenimiento_preventivo"
  | "mantenimiento_correctivo"
  | "standby"
  | "respaldo_diesel"
  | "sin_generacion";

export type DiaDetalleUnidad = {
  registro: ConcertacionRegistro;
  estados: MaquinaEstadoDia[];
  tuvoParo: boolean;
  tuvoEvento: boolean;
  motivoResumen: string | null;
  eventosObs: string[];
  pctOperacion: number;
  horasNoOperacion: number;
};

export type DiaDetalleResumen = {
  fecha: string;
  label: string;
  weekday: string;
  totalUnidades: number;
  conParadaExterna: number;
  conMantenimiento: number;
  conObservacion: number;
  operacionPlena: number;
  horasOperacion: number;
  horasStandBy: number;
  horasMmtPreventivo: number;
  horasMmtCorrectivo: number;
  horasParadasExternas: number;
  kwhGenerados: number;
  maquinas: DiaDetalleUnidad[];
  conParo: DiaDetalleUnidad[];
  sinParo: DiaDetalleUnidad[];
};

const TAG_ORDER = [
  "CPW-01", "CPW-02", "CPW-03", "CPW-04", "CPW-05", "CPW-06", "CPW-07",
  "CPW-10", "CPW-11", "CPW-12", "G101V", "G102J", "G102K", "JIN-01", "JIN-02",
];

const ESTADO_LABEL: Record<MaquinaEstadoDia, string> = {
  operacion_plena: "Operación plena",
  parada_externa: "Parada externa",
  mantenimiento_preventivo: "MMT preventivo",
  mantenimiento_correctivo: "MMT correctivo",
  standby: "Stand-by",
  respaldo_diesel: "Respaldo diésel",
  sin_generacion: "Sin generación",
};

export function estadoLabel(e: MaquinaEstadoDia): string {
  return ESTADO_LABEL[e];
}

function sortTags(tags: string[]): string[] {
  const set = new Set(tags);
  const ordered = TAG_ORDER.filter((t) => set.has(t));
  for (const t of [...tags].sort()) {
    if (!ordered.includes(t)) ordered.push(t);
  }
  return ordered;
}

/** Parte observaciones en eventos legibles (horas, //, puntos con nueva hora). */
export function parseObservacionEventos(text: string | null): string[] {
  if (!text?.trim()) return [];
  const normalized = text.replace(/\s+/g, " ").trim();
  const chunks = normalized
    .split(/\s*\/\/\s*|\.\s+(?=\d{1,2}:\d{2})|;\s+(?=\d{1,2}:\d{2})/)
    .map((s) => s.replace(/^\.\s*/, "").trim())
    .filter(Boolean);
  if (chunks.length <= 1 && normalized.length > 140) {
    return normalized.match(/.{1,140}(\s|$)/g)?.map((s) => s.trim()) ?? [normalized];
  }
  return chunks.length ? chunks : [normalized];
}

function inferMotivo(r: ConcertacionRegistro, eventos: string[]): string | null {
  if (eventos.length) return eventos[0];
  if (r.horasParadasExternas > 0) return `Parada externa reportada (${r.horasParadasExternas} h)`;
  if (r.horasMmtPreventivo > 0) return `Mantenimiento preventivo (${r.horasMmtPreventivo} h)`;
  if (r.horasMmtCorrectivo > 0) return `Mantenimiento correctivo (${r.horasMmtCorrectivo} h)`;
  if (r.horasStandBy >= 24 && r.horasOperacion === 0) return "Disponible en stand-by (sin operación)";
  if (r.horasOperacion === 0 && r.kwhGenerados === 0) return "Sin generación en el día";
  if (r.horasStandBy > 0 && r.horasOperacion < 24) return `Stand-by (${r.horasStandBy} h)`;
  return null;
}

function classifyRegistro(r: ConcertacionRegistro): MaquinaEstadoDia[] {
  const estados: MaquinaEstadoDia[] = [];
  const isDiesel = /^G\d|^DIESEL/i.test(r.tag);

  if (r.horasParadasExternas > 0) estados.push("parada_externa");
  if (r.horasMmtPreventivo > 0) estados.push("mantenimiento_preventivo");
  if (r.horasMmtCorrectivo > 0) estados.push("mantenimiento_correctivo");
  if (r.horasOperacion === 0 && r.kwhGenerados === 0 && r.horasStandBy >= 20) {
    estados.push("sin_generacion");
  } else if (r.horasStandBy > 0 && r.horasOperacion < 24) {
    estados.push("standby");
  }
  if (isDiesel && r.horasOperacion > 0 && r.horasOperacion < 12) {
    estados.push("respaldo_diesel");
  }
  if (
    estados.length === 0 ||
    (r.horasOperacion === 24 && r.horasParadasExternas === 0 && !r.observaciones)
  ) {
    estados.push("operacion_plena");
  }
  return [...new Set(estados)];
}

function buildUnidadDetalle(r: ConcertacionRegistro): DiaDetalleUnidad {
  const eventosObs = parseObservacionEventos(r.observaciones);
  const estados = classifyRegistro(r);
  const tuvoParo =
    r.horasParadasExternas > 0 ||
    r.horasMmtPreventivo > 0 ||
    r.horasMmtCorrectivo > 0 ||
    (r.horasOperacion < 24 && r.horasStandBy > 0) ||
    r.horasOperacion === 0;
  const tuvoEvento = tuvoParo || Boolean(r.observaciones?.trim()) || r.numeroFallas > 0;

  return {
    registro: r,
    estados,
    tuvoParo,
    tuvoEvento,
    motivoResumen: inferMotivo(r, eventosObs),
    eventosObs,
    pctOperacion: (r.horasOperacion / 24) * 100,
    horasNoOperacion: 24 - r.horasOperacion,
  };
}

function sortUnidades(a: DiaDetalleUnidad, b: DiaDetalleUnidad): number {
  if (a.tuvoParo !== b.tuvoParo) return a.tuvoParo ? -1 : 1;
  const ext = b.registro.horasParadasExternas - a.registro.horasParadasExternas;
  if (ext !== 0) return ext;
  const mmt =
    b.registro.horasMmtPreventivo +
    b.registro.horasMmtCorrectivo -
    (a.registro.horasMmtPreventivo + a.registro.horasMmtCorrectivo);
  if (mmt !== 0) return mmt;
  return a.registro.tag.localeCompare(b.registro.tag);
}

export function buildDayDetail(fecha: string): DiaDetalleResumen | null {
  const rows = CONCERTACION_PACK.registros.filter((r) => r.fecha === fecha);
  if (!rows.length) return null;

  const order = sortTags(rows.map((r) => r.tag));
  const byTag = new Map(rows.map((r) => [r.tag, r]));
  const unidades = order.map((tag) => buildUnidadDetalle(byTag.get(tag)!)).sort(sortUnidades);

  const d = new Date(`${fecha}T12:00:00`);
  const agg = rows.reduce(
    (a, r) => ({
      op: a.op + r.horasOperacion,
      sb: a.sb + r.horasStandBy,
      prev: a.prev + r.horasMmtPreventivo,
      corr: a.corr + r.horasMmtCorrectivo,
      ext: a.ext + r.horasParadasExternas,
      kwh: a.kwh + (r.kwhGenerados ?? 0),
    }),
    { op: 0, sb: 0, prev: 0, corr: 0, ext: 0, kwh: 0 },
  );

  const conParo = unidades.filter((u) => u.tuvoParo);
  const sinParo = unidades.filter((u) => !u.tuvoParo);

  return {
    fecha,
    label: d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }),
    weekday: d.toLocaleDateString("es-CO", { weekday: "long" }),
    totalUnidades: unidades.length,
    conParadaExterna: unidades.filter((u) => u.registro.horasParadasExternas > 0).length,
    conMantenimiento: unidades.filter(
      (u) => u.registro.horasMmtPreventivo > 0 || u.registro.horasMmtCorrectivo > 0,
    ).length,
    conObservacion: unidades.filter((u) => u.registro.observaciones).length,
    operacionPlena: unidades.filter((u) => u.estados.includes("operacion_plena") && !u.tuvoParo).length,
    horasOperacion: agg.op,
    horasStandBy: agg.sb,
    horasMmtPreventivo: agg.prev,
    horasMmtCorrectivo: agg.corr,
    horasParadasExternas: agg.ext,
    kwhGenerados: agg.kwh,
    maquinas: unidades,
    conParo,
    sinParo,
  };
}

/** @deprecated typo guard — use buildDayDetail */
export const buildDiaDetalle = buildDayDetail;
