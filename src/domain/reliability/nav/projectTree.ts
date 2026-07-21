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

/**
 * Árbol ordenado por el flujo del ingeniero de confiabilidad /
 * construcción del informe mensual.
 * Solo incluye hojas con contenido cargado (sin placeholders vacíos).
 */
export const PROJECT_NAV_TREE: NavModule[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Vistas ejecutivas y operativas por audiencia",
    children: [
      { id: "dash-resumen", label: "Resumen general" },
      { id: "dash-operacion", label: "Operación COPOWER" },
      { id: "dash-operacion-gte", label: "Operación Gran Tierra" },
      { id: "dash-mto", label: "Mantenimiento" },
      { id: "bd-historicos-copower", label: "Período actual vs. anterior COPOWER" },
      { id: "bd-historicos-gte", label: "Período actual vs. anterior Gran Tierra" },
    ],
  },
  {
    key: "campos",
    label: "Campos",
    description: "Activos y operación por campo",
    children: [
      { id: "cfg-campos-resumen", label: "Resumen" },
      { id: "cfg-campos-costayaco", label: "Costayaco" },
      { id: "cfg-campos-vonu", label: "Vonú" },
    ],
  },
  {
    key: "generacion",
    label: "Generación",
    description: "Producción, tendencia y horas por estado",
    children: [
      { id: "gen-dashboard", label: "Dashboard" },
      { id: "gen-diaria", label: "Tendencia diaria" },
      { id: "gen-mensual", label: "Acumulado mensual" },
      { id: "gen-equipos", label: "Por equipo" },
      { id: "gen-utilizacion", label: "Disponibilidad y utilización" },
      { id: "gen-horas", label: "Horas por estado" },
    ],
  },
  {
    key: "operacion",
    label: "Operación",
    description: "Registro diario y datos operativos COPOWER",
    children: [
      { id: "bd-op-copower", label: "Registro diario COPOWER" },
    ],
  },
  {
    key: "confiabilidad",
    label: "Confiabilidad",
    description: "KPIs, eventos, causa raíz y comparación · corazón del análisis",
    children: [
      {
        id: "conf-kpis",
        label: "KPIs",
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
        id: "conf-eventos",
        label: "Eventos de falla",
        children: [
          { id: "bd-ev-dual", label: "Comparativo dual" },
          { id: "bd-ev-copower", label: "Bitácora COPOWER" },
          { id: "bd-ev-gte", label: "Bitácora Gran Tierra" },
          { id: "an-repetitivos-copower", label: "Eventos repetitivos COPOWER" },
          { id: "an-repetitivos-gte", label: "Eventos repetitivos Gran Tierra" },
          { id: "proc-clasif", label: "Clasificación fallas asociadas COPOWER" },
          { id: "an-criticos", label: "Equipos críticos" },
        ],
      },
      { id: "an-pareto", label: "Pareto" },
      {
        id: "conf-worst",
        label: "Worst Actors",
        children: [
          { id: "an-badactors-copower", label: "Malos actores COPOWER" },
          { id: "an-badactors-gte", label: "Malos actores Gran Tierra" },
        ],
      },
      { id: "an-rca-gte", label: "RCA" },
      { id: "mto-degradacion", label: "Tendencias y riesgos" },
      { id: "an-riesgo", label: "Matriz de riesgo" },
      {
        id: "conf-comparacion",
        label: "Comparación dual",
        children: [
          { id: "cmp-kpi", label: "KPI vs KPI" },
          { id: "cmp-diff", label: "Diferencias por indicador" },
          { id: "cmp-tend", label: "Tendencias mensuales" },
          { id: "cmp-desv", label: "Desviaciones vs meta 98%" },
          { id: "cmp-sla", label: "Cumplimiento SLA" },
        ],
      },
    ],
  },
  {
    key: "gestion_activos",
    label: "Gestión de activos",
    description: "Mantenimiento, intervención y salud de activos",
    children: [
      { id: "mto-dashboard", label: "Planes de mantenimiento" },
      { id: "mto-optimizacion", label: "Optimización del mantenimiento" },
      { id: "an-interv-gte", label: "Planes de intervención" },
      { id: "ga-salud", label: "Salud de activos" },
    ],
  },
  {
    key: "gestion_acciones",
    label: "Gestión de acciones",
    description: "CAPA · seguimiento, evidencias y efectividad",
    children: [{ id: "capa-tablero", label: "Acciones CAPA" }],
  },
  {
    key: "planeacion",
    label: "Planeación operacional",
    description: "Qué hacer el próximo mes para proteger la disponibilidad",
    children: [{ id: "op-tablero", label: "Plan del próximo período" }],
  },
  {
    key: "reportes",
    label: "Reportes",
    description: "Informe mensual y salidas para cliente",
    children: [
      { id: "rep-inf-resumen", label: "Informe mensual" },
      { id: "rep-cliente", label: "Ejecutivo / reunión cliente" },
      { id: "rep-mensual", label: "Gran Tierra" },
      { id: "rep-diario", label: "COPOWER" },
      { id: "rep-historico", label: "Histórico" },
    ],
  },
  {
    key: "configuracion",
    label: "Configuración",
    description: "Empresas y parámetros contractuales",
    children: [
      {
        id: "cfg-empresas",
        label: "Empresas",
        children: [
          { id: "cfg-empresas-copower", label: "COPOWER" },
          { id: "cfg-empresas-gte", label: "Gran Tierra" },
        ],
      },
      { id: "cfg-parametros", label: "Parámetros" },
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
