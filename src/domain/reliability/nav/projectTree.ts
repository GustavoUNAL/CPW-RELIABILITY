import type { PageKey } from "../types";

/** Nodo del árbol: hoja (sin children) o grupo anidado. */
export type NavNode = {
  id: string;
  label: string;
  children?: NavNode[];
};

export type NavModule = {
  key: PageKey;
  label: string;
  description: string;
  children: NavNode[];
};

/** Árbol — Reliability Analytics Platform (ordenado por flujo de análisis) */
export const PROJECT_NAV_TREE: NavModule[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Vistas ejecutivas y operativas por audiencia",
    children: [
      { id: "dash-resumen", label: "Resumen general" },
      { id: "dash-ejecutivo", label: "Ejecutivo" },
      { id: "dash-gerencia", label: "Gerencia" },
      { id: "dash-operacion", label: "Operación COPOWER" },
      { id: "dash-mto", label: "Mantenimiento" },
    ],
  },
  {
    key: "campos",
    label: "Campos",
    description: "Activos, parque y desempeño por campo · dual GTE + COPOWER",
    children: [
      { id: "cfg-campos-costayaco", label: "Costayaco" },
      { id: "cfg-campos-vonu", label: "Vonú" },
    ],
  },
  {
    key: "generacion",
    label: "Generación",
    description: "Producción, utilización y desempeño de la flota · COPOWER YTD",
    children: [
      { id: "gen-dashboard", label: "Dashboard flota" },
      { id: "gen-diaria", label: "Tendencia diaria" },
      { id: "gen-mensual", label: "Acumulado mensual" },
      { id: "gen-equipos", label: "Por equipo" },
      { id: "gen-utilizacion", label: "Disponibilidad y utilización" },
      { id: "gen-horas", label: "Horas por estado" },
    ],
  },
  {
    key: "comparacion",
    label: "Comparación dual",
    description: "COPOWER vs Gran Tierra · metas contractuales",
    children: [
      { id: "cmp-kpi", label: "KPI vs KPI" },
      { id: "cmp-diff", label: "Diferencias por indicador" },
      { id: "cmp-tend", label: "Tendencias mensuales" },
      { id: "cmp-desv", label: "Desviaciones vs meta 98%" },
      { id: "cmp-sla", label: "Cumplimiento SLA" },
      { id: "cmp-bench", label: "Benchmark" },
    ],
  },
  {
    key: "eventos",
    label: "Eventos de falla",
    description: "Bitácoras, clasificación e imputables · dual y por fuente",
    children: [
      { id: "bd-ev-dual", label: "Comparativo dual" },
      { id: "bd-ev-copower", label: "Bitácora COPOWER" },
      { id: "bd-ev-gte", label: "Bitácora Gran Tierra" },
      { id: "an-pareto", label: "Pareto de fallas" },
      { id: "proc-clasif", label: "Clasificación imputables" },
      { id: "an-criticos", label: "Equipos críticos" },
      { id: "an-rca", label: "RCA imputables" },
    ],
  },
  {
    key: "confiabilidad",
    label: "Confiabilidad & KPIs",
    description: "Indicadores contractuales por fuente",
    children: [
      {
        id: "conf-copower",
        label: "COPOWER",
        children: [
          { id: "bd-ind-copower", label: "Panel completo" },
          { id: "kpi-cpw-disp", label: "Disponibilidad" },
          { id: "kpi-cpw-conf", label: "Confiabilidad" },
          { id: "kpi-cpw-mtbf", label: "MTBF" },
          { id: "kpi-cpw-mttr", label: "MTTR" },
          { id: "kpi-cpw-util", label: "Utilización" },
          { id: "kpi-cpw-for", label: "Forced outage" },
          { id: "kpi-cpw-planned", label: "Planned outage" },
          { id: "kpi-cpw-prod", label: "Producción" },
          { id: "kpi-cpw-mdt", label: "MDT" },
        ],
      },
      {
        id: "conf-gte",
        label: "Gran Tierra",
        children: [
          { id: "kpi-gte-todos", label: "Resumen ejecutivo" },
          { id: "bd-ind-gte", label: "Indicadores del mes" },
          { id: "kpi-gte-formulas", label: "Fórmulas Orden 1" },
          { id: "kpi-gte-metas", label: "Metas contractuales" },
          { id: "kpi-gte-historico", label: "Histórico mensual" },
        ],
      },
    ],
  },
  {
    key: "operacion",
    label: "Operación & datos",
    description: "Registros, horas y fuentes primarias",
    children: [
      { id: "bd-op-copower", label: "Registro diario COPOWER" },
      {
        id: "op-horas",
        label: "Desglose de horas",
        children: [
          { id: "proc-op", label: "Operación" },
          { id: "proc-disp", label: "Disponibles (OP+SB)" },
          { id: "proc-fs", label: "Fuera de servicio" },
          { id: "proc-mto", label: "Mantenimiento (PP)" },
        ],
      },
      { id: "bd-historicos", label: "Históricos mensuales" },
      { id: "bd-mto", label: "Mantenimientos" },
      { id: "bd-alarmas", label: "Alarmas" },
    ],
  },
  {
    key: "analisis",
    label: "Análisis avanzado",
    description: "Modelos estadísticos y predicción · pendiente de histórico",
    children: [
      { id: "an-riesgo", label: "Matriz de riesgo" },
      { id: "an-weibull", label: "Weibull" },
      { id: "an-curvas", label: "Curvas de confiabilidad" },
      { id: "an-pred", label: "Predicción" },
    ],
  },
  {
    key: "calidad_datos",
    label: "Calidad de datos",
    description: "Integridad, validación y auditoría de fuentes",
    children: [
      { id: "cq-auditoria", label: "Auditoría dual (PDF vs Excel)" },
      { id: "cq-validacion", label: "Validación cruzada" },
      { id: "cq-faltantes", label: "Datos faltantes" },
      { id: "cq-duplicados", label: "Duplicados" },
      { id: "cq-normalizacion", label: "Normalización" },
    ],
  },
  {
    key: "reportes",
    label: "Reportes",
    description: "Salidas diarias, mensuales y exportables",
    children: [
      { id: "rep-diario", label: "Diario COPOWER" },
      { id: "rep-mensual", label: "Mensual GTE" },
      { id: "rep-cliente", label: "Reunión cliente" },
      { id: "rep-semanal", label: "Semanal" },
      { id: "rep-export", label: "PDF / Excel" },
    ],
  },
  {
    key: "configuracion",
    label: "Configuración",
    description: "Empresas y marco contractual",
    children: [
      {
        id: "cfg-empresas",
        label: "Empresas",
        children: [
          { id: "cfg-empresas-copower", label: "COPOWER" },
          { id: "cfg-empresas-gte", label: "Gran Tierra" },
        ],
      },
      { id: "cfg-parametros", label: "Parámetros contractuales" },
    ],
  },
];

export const PROJECT_TITLE = "Reliability Analytics Platform";

/** Primera hoja navegable de un módulo (profundidad recursiva). */
export function firstLeafId(nodes: NavNode[]): string | null {
  for (const n of nodes) {
    if (!n.children?.length) return n.id;
    const nested = firstLeafId(n.children);
    if (nested) return nested;
  }
  return null;
}

export function findLeafLabel(nodes: NavNode[], id: string): string | null {
  for (const n of nodes) {
    if (n.id === id) return n.label;
    if (n.children) {
      const found = findLeafLabel(n.children, id);
      if (found) return found;
    }
  }
  return null;
}
