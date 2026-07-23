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
      { id: "dash-contrato", label: "Cumplimiento de metas contractuales" },
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
      {
        id: "cfg-campos-costayaco",
        label: "Costayaco",
        children: [
          { id: "cfg-campos-costayaco-resumen", label: "Resumen" },
          { id: "cfg-campos-costayaco-parque", label: "Parque" },
          { id: "cfg-campos-costayaco-desempeno", label: "Desempeño" },
          { id: "cfg-campos-costayaco-contrato", label: "Contrato" },
          { id: "cfg-campos-costayaco-activos", label: "Activos" },
        ],
      },
      {
        id: "cfg-campos-vonu",
        label: "Vonú",
        children: [
          { id: "cfg-campos-vonu-resumen", label: "Resumen" },
          { id: "cfg-campos-vonu-parque", label: "Parque" },
          { id: "cfg-campos-vonu-desempeno", label: "Desempeño" },
          { id: "cfg-campos-vonu-contrato", label: "Contrato" },
          { id: "cfg-campos-vonu-activos", label: "Activos" },
        ],
      },
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
    description: "Dashboard, equipos, eficiencia, resumen OP, eventos y consumos",
    children: [
      { id: "op-dashboard", label: "Dashboard" },
      { id: "op-equipos", label: "Equipos" },
      { id: "op-eficiencia", label: "Eficiencia" },
      { id: "op-resumen-diario", label: "Resumen diario" },
      { id: "op-eventos", label: "Eventos" },
      { id: "op-consumos", label: "Consumos" },
    ],
  },
  {
    key: "confiabilidad",
    label: "Confiabilidad",
    description: "Eventos, activos críticos, RCA y comparativos",
    children: [
      { id: "cmp-fuentes", label: "Resumen" },
      { id: "proc-clasif", label: "Clasificación de fallas" },
      {
        id: "conf-eventos",
        label: "Eventos de falla",
        children: [
          {
            id: "conf-bitacoras",
            label: "Fallas",
            children: [
              { id: "bd-ev-copower", label: "COPOWER" },
              { id: "bd-ev-gte", label: "Gran Tierra" },
              { id: "bd-ev-dual", label: "Comparativo dual" },
            ],
          },
          {
            id: "conf-repetitivos",
            label: "Eventos repetitivos",
            children: [
              { id: "an-repetitivos-copower", label: "COPOWER" },
              { id: "an-repetitivos-gte", label: "Gran Tierra" },
              { id: "an-repetitivos", label: "Comparativo dual" },
            ],
          },
        ],
      },
      {
        id: "conf-activos",
        label: "Activos críticos",
        children: [
          {
            id: "conf-worst",
            label: "Malos actores",
            children: [
              { id: "an-badactors-copower", label: "COPOWER" },
              { id: "an-badactors-gte", label: "Gran Tierra" },
              { id: "an-badactors", label: "Comparativo dual" },
            ],
          },
        ],
      },
      {
        id: "conf-analisis",
        label: "Análisis de confiabilidad",
        children: [
          { id: "an-rca-gte", label: "RCA" },
          { id: "mto-degradacion", label: "Tendencias y riesgos" },
          { id: "an-riesgo", label: "Matriz de riesgo" },
        ],
      },
      {
        id: "conf-comparacion",
        label: "Evaluación del desempeño",
        children: [
          { id: "cmp-periodo-copower", label: "COPOWER" },
          { id: "cmp-periodo-gte", label: "Gran Tierra" },
          { id: "cmp-periodo", label: "Comparativo dual" },
        ],
      },
    ],
  },
  {
    key: "gestion_activos",
    label: "Gestión de activos",
    description: "Salud, mantenimiento, optimización e intervención",
    children: [
      { id: "ga-salud", label: "Salud de activos" },
      { id: "mto-dashboard", label: "Planes de mantenimiento" },
      { id: "mto-optimizacion", label: "Optimización del mantenimiento" },
      { id: "an-interv-gte", label: "Planes de intervención" },
    ],
  },
  {
    key: "gestion_acciones",
    label: "Gestión de acciones",
    description: "CAPA · seguimiento, evidencias y efectividad",
    children: [
      {
        id: "capa-root",
        label: "Acciones CAPA",
        children: [
          { id: "capa-resumen", label: "Resumen" },
          { id: "capa-acciones", label: "Acciones" },
          { id: "capa-seguimiento", label: "Seguimiento" },
          { id: "capa-evidencias", label: "Evidencias" },
          { id: "capa-indicadores", label: "Indicadores" },
          { id: "capa-efectividad", label: "Efectividad" },
        ],
      },
    ],
  },
  {
    key: "planeacion",
    label: "Planeación operacional",
    description: "Riesgos, prioridades y plan del próximo período",
    children: [
      { id: "op-tablero", label: "Resumen ejecutivo" },
      { id: "op-riesgos", label: "Riesgos y alertas" },
      { id: "op-prioridades", label: "Prioridades" },
      { id: "op-accion", label: "Plan de acción" },
      { id: "op-cronograma", label: "Cronograma" },
      { id: "op-compromisos", label: "Compromisos" },
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
