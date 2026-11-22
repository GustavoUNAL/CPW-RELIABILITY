import packJson from "./data/concertacionPack.json";
import type {
  ConcertacionAnalysis,
  ConcertacionPack,
  ConcertacionRegistro,
  DiaResumen,
  ParadaDestacada,
  UnidadResumen,
  ValidacionFila,
} from "./types";

export const CONCERTACION_PACK = packJson as ConcertacionPack;

const TAG_ORDER = [
  "CPW-01",
  "CPW-02",
  "CPW-03",
  "CPW-04",
  "CPW-05",
  "CPW-06",
  "CPW-07",
  "CPW-10",
  "CPW-11",
  "CPW-12",
  "G101V",
  "G102J",
  "G102K",
  "JIN-01",
  "JIN-02",
];

function sortTags(tags: string[]): string[] {
  const set = new Set(tags);
  const ordered = TAG_ORDER.filter((t) => set.has(t));
  for (const t of tags.sort()) {
    if (!ordered.includes(t)) ordered.push(t);
  }
  return ordered;
}

function formatDayLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }).replace(".", "");
}

function fechasEsperadas(desde: string, hasta: string): string[] {
  const out: string[] = [];
  const cur = new Date(`${desde}T12:00:00`);
  const end = new Date(`${hasta}T12:00:00`);
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return (part / total) * 100;
}

function aggregateUnidad(tag: string, rows: ConcertacionRegistro[]): UnidadResumen {
  const campo = rows.find((r) => r.campo)?.campo ?? "—";
  const dias = rows.length;
  const horasTeoricas = dias * 24;
  const sum = rows.reduce(
    (a, r) => ({
      op: a.op + r.horasOperacion,
      sb: a.sb + r.horasStandBy,
      prev: a.prev + r.horasMmtPreventivo,
      corr: a.corr + r.horasMmtCorrectivo,
      ext: a.ext + r.horasParadasExternas,
      kwh: a.kwh + (r.kwhGenerados ?? 0),
      obs: a.obs + (r.observaciones ? 1 : 0),
      extDays: a.extDays + (r.horasParadasExternas > 0 ? 1 : 0),
    }),
    { op: 0, sb: 0, prev: 0, corr: 0, ext: 0, kwh: 0, obs: 0, extDays: 0 },
  );
  return {
    tag,
    campo,
    dias,
    horasOperacion: sum.op,
    horasStandBy: sum.sb,
    horasMmtPreventivo: sum.prev,
    horasMmtCorrectivo: sum.corr,
    horasParadasExternas: sum.ext,
    horasTeoricas,
    kwhGenerados: sum.kwh,
    pctOperacion: pct(sum.op, horasTeoricas),
    pctStandBy: pct(sum.sb, horasTeoricas),
    pctPreventivo: pct(sum.prev, horasTeoricas),
    pctCorrectivo: pct(sum.corr, horasTeoricas),
    pctParadasExternas: pct(sum.ext, horasTeoricas),
    diasConObservacion: sum.obs,
    diasConParadaExterna: sum.extDays,
  };
}

export function buildConcertacionAnalysis(pack: ConcertacionPack = CONCERTACION_PACK): ConcertacionAnalysis {
  const { meta, registros } = pack;
  const byTag = new Map<string, ConcertacionRegistro[]>();
  for (const r of registros) {
    if (!byTag.has(r.tag)) byTag.set(r.tag, []);
    byTag.get(r.tag)!.push(r);
  }
  const unidadOrder = sortTags([...byTag.keys()]);
  const porUnidad = unidadOrder.map((tag) => aggregateUnidad(tag, byTag.get(tag)!));

  const byDate = new Map<string, ConcertacionRegistro[]>();
  for (const r of registros) {
    if (!byDate.has(r.fecha)) byDate.set(r.fecha, []);
    byDate.get(r.fecha)!.push(r);
  }
  const porDia: DiaResumen[] = meta.fechasConDatos.map((fecha) => {
    const rows = byDate.get(fecha) ?? [];
    const agg = rows.reduce(
      (a, r) => ({
        op: a.op + r.horasOperacion,
        sb: a.sb + r.horasStandBy,
        prev: a.prev + r.horasMmtPreventivo,
        corr: a.corr + r.horasMmtCorrectivo,
        ext: a.ext + r.horasParadasExternas,
        kwh: a.kwh + (r.kwhGenerados ?? 0),
        obs: a.obs + (r.observaciones ? 1 : 0),
      }),
      { op: 0, sb: 0, prev: 0, corr: 0, ext: 0, kwh: 0, obs: 0 },
    );
    return {
      fecha,
      label: formatDayLabel(fecha),
      unidades: rows.length,
      horasOperacion: agg.op,
      horasStandBy: agg.sb,
      horasMmtPreventivo: agg.prev,
      horasMmtCorrectivo: agg.corr,
      horasParadasExternas: agg.ext,
      kwhGenerados: agg.kwh,
      registrosConObs: agg.obs,
    };
  });

  const flota = porUnidad.reduce(
    (a, u) => ({
      op: a.op + u.horasOperacion,
      sb: a.sb + u.horasStandBy,
      prev: a.prev + u.horasMmtPreventivo,
      corr: a.corr + u.horasMmtCorrectivo,
      ext: a.ext + u.horasParadasExternas,
      kwh: a.kwh + u.kwhGenerados,
      obs: a.obs + u.diasConObservacion,
      extReg: a.extReg + u.diasConParadaExterna,
      teoricas: a.teoricas + u.horasTeoricas,
    }),
    { op: 0, sb: 0, prev: 0, corr: 0, ext: 0, kwh: 0, obs: 0, extReg: 0, teoricas: 0 },
  );

  const paradas: ParadaDestacada[] = registros
    .filter((r) => r.horasParadasExternas > 0)
    .map((r) => ({
      fecha: r.fecha,
      tag: r.tag,
      campo: r.campo,
      horasParadasExternas: r.horasParadasExternas,
      horasOperacion: r.horasOperacion,
      horasStandBy: r.horasStandBy,
      observaciones: r.observaciones ?? "—",
    }))
    .sort((a, b) => b.horasParadasExternas - a.horasParadasExternas || a.fecha.localeCompare(b.fecha));

  const observaciones: ParadaDestacada[] = registros
    .filter((r) => r.observaciones)
    .map((r) => ({
      fecha: r.fecha,
      tag: r.tag,
      campo: r.campo,
      horasParadasExternas: r.horasParadasExternas,
      horasOperacion: r.horasOperacion,
      horasStandBy: r.horasStandBy,
      observaciones: r.observaciones!,
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.tag.localeCompare(b.tag));

  const filasInvalidas: ValidacionFila[] = registros
    .filter((r) => !r.balanceOk || !r.sumaOk)
    .map((r) => ({
      fecha: r.fecha,
      tag: r.tag,
      totalHoras: r.totalHoras,
      sumaComponentes: r.sumaComponentes,
      balanceOk: r.balanceOk,
      sumaOk: r.sumaOk,
    }));

  const esperadas = fechasEsperadas(meta.periodo.desde, meta.periodo.hasta);
  const diasFaltantes = esperadas.filter((f) => !meta.fechasConDatos.includes(f));

  const byCampo = new Map<string, UnidadResumen[]>();
  for (const u of porUnidad) {
    const c = u.campo || "—";
    if (!byCampo.has(c)) byCampo.set(c, []);
    byCampo.get(c)!.push(u);
  }
  const porCampo = [...byCampo.entries()].map(([campo, units]) => {
    const teoricas = units.reduce((s, u) => s + u.horasTeoricas, 0);
    const op = units.reduce((s, u) => s + u.horasOperacion, 0);
    const ext = units.reduce((s, u) => s + u.horasParadasExternas, 0);
    return {
      campo,
      unidades: units.length,
      horasOperacion: op,
      horasParadasExternas: ext,
      pctOperacion: pct(op, teoricas),
    };
  });

  return {
    meta,
    unidadOrder,
    resumenFlota: {
      horasOperacion: flota.op,
      horasStandBy: flota.sb,
      horasMmtPreventivo: flota.prev,
      horasMmtCorrectivo: flota.corr,
      horasParadasExternas: flota.ext,
      horasTeoricas: flota.teoricas,
      kwhGenerados: flota.kwh,
      pctOperacion: pct(flota.op, flota.teoricas),
      pctStandBy: pct(flota.sb, flota.teoricas),
      pctPreventivo: pct(flota.prev, flota.teoricas),
      pctCorrectivo: pct(flota.corr, flota.teoricas),
      pctParadasExternas: pct(flota.ext, flota.teoricas),
      registrosConObs: flota.obs,
      registrosConParadaExt: flota.extReg,
      diasFaltantes,
    },
    porUnidad,
    porDia,
    paradas,
    observaciones,
    validacion: { filasInvalidas, todasOk: filasInvalidas.length === 0 },
    porCampo,
  };
}

export function concertacionSectionFromLeaf(leafId: string) {
  if (leafId === "conc-unidades") return "unidades" as const;
  if (leafId === "conc-diario") return "diario" as const;
  if (leafId === "conc-paradas") return "paradas" as const;
  if (leafId === "conc-validacion") return "validacion" as const;
  return "resumen" as const;
}

export function formatConcertacionPeriodo(meta: ConcertacionPack["meta"]): string {
  const d0 = new Date(`${meta.periodo.desde}T12:00:00`).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
  });
  const d1 = new Date(`${meta.periodo.hasta}T12:00:00`).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${d0} – ${d1}`;
}
