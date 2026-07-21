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

/** Árbol — Reliability Analytics Platform */
export const PROJECT_NAV_TREE: NavModule[] = [
  {
    key: "configuracion",
    label: "Configuración",
    description: "Empresas, campos, equipos y parámetros",
    children: [
      {
        id: "cfg-empresas",
        label: "Empresas",
        children: [
          { id: "cfg-empresas-copower", label: "COPOWER" },
          { id: "cfg-empresas-gte", label: "Gran Tierra" },
        ],
      },
      {
        id: "cfg-campos",
        label: "Campos",
        children: [
          { id: "cfg-campos-costayaco", label: "Costayaco" },
          { id: "cfg-campos-suroriente", label: "Suroriente" },
          { id: "cfg-campos-otros", label: "Otros" },
        ],
      },
      {
        id: "cfg-equipos",
        label: "Equipos",
        children: [
          { id: "cfg-equipos-generadores", label: "Generadores" },
          { id: "cfg-equipos-motores", label: "Motores" },
          { id: "cfg-equipos-alternadores", label: "Alternadores" },
          { id: "cfg-equipos-transformadores", label: "Transformadores" },
          { id: "cfg-equipos-auxiliares", label: "Sistemas auxiliares" },
        ],
      },
      { id: "cfg-parametros", label: "Parámetros" },
    ],
  },
  {
    key: "base_datos",
    label: "Base de Datos",
    description: "Registros operativos e históricos por fuente",
    children: [
      { id: "bd-op-copower", label: "Registro Operacional COPOWER" },
      { id: "bd-ind-gte", label: "Indicadores Gran Tierra" },
      { id: "bd-mto", label: "Mantenimientos" },
      { id: "bd-fallas", label: "Fallas" },
      { id: "bd-alarmas", label: "Alarmas" },
      { id: "bd-produccion", label: "Producción" },
      { id: "bd-historicos", label: "Históricos" },
    ],
  },
  {
    key: "calidad_datos",
    label: "Calidad de Datos",
    description: "Integridad, validación y auditoría de fuentes",
    children: [
      { id: "cq-faltantes", label: "Datos faltantes" },
      { id: "cq-duplicados", label: "Datos duplicados" },
      { id: "cq-validacion", label: "Validación" },
      { id: "cq-normalizacion", label: "Normalización" },
      { id: "cq-auditoria", label: "Auditoría" },
    ],
  },
  {
    key: "procesamiento",
    label: "Procesamiento",
    description: "Horas, eventos y clasificación",
    children: [
      { id: "proc-op", label: "Horas Operación" },
      { id: "proc-disp", label: "Horas Disponibles" },
      { id: "proc-fs", label: "Horas Fuera de Servicio" },
      { id: "proc-mto", label: "Horas Mantenimiento" },
      { id: "proc-eventos", label: "Eventos" },
      { id: "proc-clasif", label: "Clasificación de Fallas" },
    ],
  },
  {
    key: "kpis_copower",
    label: "KPIs COPOWER",
    description: "Indicadores desde operación diaria",
    children: [
      { id: "kpi-cpw-disp", label: "Disponibilidad" },
      { id: "kpi-cpw-conf", label: "Confiabilidad" },
      { id: "kpi-cpw-mtbf", label: "MTBF" },
      { id: "kpi-cpw-mttr", label: "MTTR" },
      { id: "kpi-cpw-mdt", label: "MDT" },
      { id: "kpi-cpw-for", label: "Forced Outage Rate" },
      { id: "kpi-cpw-planned", label: "Planned Outage" },
      { id: "kpi-cpw-util", label: "Utilización" },
      { id: "kpi-cpw-prod", label: "Producción" },
    ],
  },
  {
    key: "kpis_gte",
    label: "KPIs Gran Tierra",
    description: "Indicadores oficiales GTE",
    children: [
      { id: "kpi-gte-todos", label: "Todos los indicadores entregados" },
      { id: "kpi-gte-formulas", label: "Fórmulas" },
      { id: "kpi-gte-metas", label: "Metas" },
      { id: "kpi-gte-historico", label: "Histórico" },
    ],
  },
  {
    key: "comparacion",
    label: "Comparación",
    description: "COPOWER vs Gran Tierra y vs metas",
    children: [
      { id: "cmp-kpi", label: "KPI vs KPI" },
      { id: "cmp-diff", label: "Diferencias" },
      { id: "cmp-tend", label: "Tendencias" },
      { id: "cmp-desv", label: "Desviaciones" },
      { id: "cmp-sla", label: "Cumplimiento SLA" },
      { id: "cmp-bench", label: "Benchmark" },
    ],
  },
  {
    key: "analisis",
    label: "Análisis",
    description: "Fallas, RCA, riesgo y predicción",
    children: [
      { id: "an-pareto", label: "Pareto de Fallas" },
      { id: "an-criticos", label: "Equipos Críticos" },
      { id: "an-rca", label: "RCA" },
      { id: "an-weibull", label: "Weibull" },
      { id: "an-curvas", label: "Curvas de Confiabilidad" },
      { id: "an-pred", label: "Predicción" },
      { id: "an-riesgo", label: "Riesgo" },
    ],
  },
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Vistas por audiencia",
    children: [
      { id: "dash-ejecutivo", label: "Ejecutivo" },
      { id: "dash-operacion", label: "Operación" },
      { id: "dash-mto", label: "Mantenimiento" },
      { id: "dash-ing", label: "Ingeniería" },
      { id: "dash-gerencia", label: "Gerencia" },
    ],
  },
  {
    key: "reportes",
    label: "Reportes",
    description: "Salidas diarias, mensuales y exportables",
    children: [
      { id: "rep-diario", label: "Diario" },
      { id: "rep-semanal", label: "Semanal" },
      { id: "rep-mensual", label: "Mensual" },
      { id: "rep-cliente", label: "Cliente" },
      { id: "rep-export", label: "PDF / Excel" },
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
