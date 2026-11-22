/** Glosas cortas de indicadores de confiabilidad (letra pequeña en el tablero). */

export const METRIC_DEFS = {
  MTBF: {
    code: "MTBF",
    en: "Mean Time Between Failures",
    es: "Tiempo medio entre fallas",
  },
  MTTR: {
    code: "MTTR",
    en: "Mean Time To Repair",
    es: "Tiempo medio de reparación",
  },
  FS_CPW: {
    code: "FS COPOWER",
    en: "Forced outage associated to COPOWER",
    es: "Horas fuera de servicio asociadas a COPOWER",
  },
  FS_CLIENTE: {
    code: "FS Cliente",
    en: "Forced outage associated to client/external infrastructure",
    es: "Horas fuera de servicio asociadas a cliente/infraestructura",
  },
} as const;

export type MetricCode = keyof typeof METRIC_DEFS;

export function MetricLabel({ code, showHours = false }: { code: MetricCode; showHours?: boolean }) {
  const def = METRIC_DEFS[code];
  return (
    <span className="metric-label">
      <span className="metric-code">
        {def.code}
        {showHours ? " (h)" : ""}
      </span>
      <span className="metric-def" title={`${def.en} — ${def.es}`}>
        {def.es}
      </span>
    </span>
  );
}

export function MetricGlossary() {
  return (
    <p className="metric-glossary" role="note">
      <span>
        <strong>MTBF</strong> · {METRIC_DEFS.MTBF.es} ({METRIC_DEFS.MTBF.en})
      </span>
      <span className="metric-glossary-sep" aria-hidden>
        ·
      </span>
      <span>
        <strong>MTTR</strong> · {METRIC_DEFS.MTTR.es} ({METRIC_DEFS.MTTR.en})
      </span>
      <span className="metric-glossary-sep" aria-hidden>
        ·
      </span>
      <span>
        <strong>FS COPOWER</strong> · {METRIC_DEFS.FS_CPW.es}
      </span>
      <span className="metric-glossary-sep" aria-hidden>
        ·
      </span>
      <span>
        <strong>FS Cliente</strong> · {METRIC_DEFS.FS_CLIENTE.es}
      </span>
    </p>
  );
}
