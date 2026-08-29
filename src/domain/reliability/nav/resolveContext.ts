import type { PageKey, ReportKey } from "../types";
import {
  COPOWER_MONTH_ORDER,
  copowerMonthLabel,
  type CopowerMonthKey,
} from "../reports/copowerMonthly";
import {
  GRAN_TIERRA_MONTH_ORDER,
  granTierraMonthLabel,
  type GranTierraMonthKey,
} from "../reports/granTierraMonthly";
import type { PlanningSection } from "../reports/operationalPlanningTypes";

/** Meses del selector. Incluye agosto aunque GTE aún no tenga anexo oficial. */
export const PLATFORM_MONTH_ORDER = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
] as const;

const PLATFORM_MONTH_LABELS: Record<(typeof PLATFORM_MONTH_ORDER)[number], string> = {
  Ene: "Enero",
  Feb: "Febrero",
  Mar: "Marzo",
  Abr: "Abril",
  May: "Mayo",
  Jun: "Junio",
  Jul: "Julio",
  Ago: "Agosto",
};

export type ViewContext = {
  /** Fuente de datos inferida del nodo del árbol. */
  report: ReportKey | "dual";
  monthOrder: readonly string[];
  reportLabel: string;
  reportShort: string;
  /** Periodo fijo — oculta selector de mes en sidebar. */
  fixedPeriod?: boolean;
};

const CPW_LEAVES = new Set([
  "cfg-empresas-copower",
  "bd-op-copower",
  "op-dashboard",
  "op-equipos",
  "op-eficiencia",
  "op-resumen-diario",
  "op-eventos",
  "op-consumos",
  "op-detalle",
  "bd-ind-copower",
  "bd-ev-copower",
  "proc-op",
  "proc-disp",
  "proc-fs",
  "proc-mto",
  "bd-mto",
  "bd-alarmas",
  "bd-historicos-copower",
  "an-evolucion-copower",
  "cmp-periodo-copower",
  "rep-diario",
  "dash-operacion",
  "an-repetitivos-copower",
  "an-badactors-copower",
  "an-interv-copower",
  "an-riesgo",
  "inf-cpw-resumen",
  "inf-cpw-horas",
  "inf-cpw-maquinas",
  "inf-cpw-fallas",
  "inf-cpw-repetitivos",
  "inf-cpw-mantenimiento",
  "inf-cpw-inventario",
  "inf-cpw-eficiencia",
  "inf-cpw-conclusiones",
  "gen-dashboard",
  "gen-diaria",
  "gen-mensual",
  "gen-equipos",
  "gen-utilizacion",
  "gen-horas",
  "ind-comparacion",
  "ind-dpto",
  "ind-arteaga",
  "inf-indicadores",
]);

const GTE_LEAVES = new Set([
  "cfg-empresas-gte",
  "bd-ind-gte",
  "bd-ev-gte",
  "bd-historicos-gte",
  "an-evolucion-gte",
  "cmp-periodo-gte",
  "cfg-parametros",
  "rep-mensual",
  "rep-cliente",
  "an-rca",
  "an-rca-gte",
  "an-rca-casos",
  "dash-operacion-gte",
  "dash-contrato",
  "an-repetitivos-gte",
  "an-badactors-gte",
  "an-interv-gte",
  "mto-optimizacion",
  "mto-degradacion",
  "ga-salud",
  "ga-inventario",
  "rep-inf-rca",
  "rep-inf-interv",
  "rep-inf-mso",
  "rep-inf-riesgos",
]);

const DUAL_LEAVES = new Set([
  "cfg-campos-costayaco",
  "cfg-campos-vonu",
  "cfg-campos-resumen",
  "cfg-campos",
  "bd-ev-dual",
  "cq-auditoria",
  "cq-validacion",
  "cq-faltantes",
  "cq-duplicados",
  "cq-normalizacion",
  "an-pareto",
  "an-tendencias-fallas",
  "an-repetitivos",
  "an-badactors",
  "an-criticos",
  "an-evolucion",
  "proc-clasif",
  "cmp-kpi",
  "cmp-diff",
  "cmp-tend",
  "cmp-desv",
  "cmp-sla",
  "cmp-bench",
  "cmp-periodo",
  "cmp-fuentes",
  "conf-formulas",
  "conf-formulas-revision",
  "capa-tablero",
  "capa-resumen",
  "capa-acciones",
  "capa-seguimiento",
  "capa-evidencias",
  "capa-indicadores",
  "capa-efectividad",
  "op-tablero",
  "op-riesgos",
  "op-alertas",
  "op-prioridades",
  "op-accion",
  "op-cronograma",
  "op-compromisos",
  "op-recursos",
  "mto-dashboard",
  "rep-export",
  "rep-historico",
  "rep-inf-resumen",
  "rep-inf-desempeno",
  "rep-inf-kpis",
  "rep-inf-eventos",
  "rep-inf-pareto",
  "rep-inf-worst",
  "rep-inf-capa",
  "rep-inf-plan",
  "rep-inf-conclusiones",
  "rep-inf-export",
]);

/** Vista única con mes dual — no usar DualCompare lado a lado. */
export const INTEGRATED_DUAL_LEAVES = new Set([
  "conf-dashboard",
  "conf-formulas",
  "conf-formulas-revision",
  "inf-conf-resumen",
  "inf-conf-conciliacion",
  "inf-conf-confiabilidad",
  "inf-conf-maquinas",
  "inf-conf-fallas",
  "inf-conf-repetitivos",
  "inf-conf-mantenimiento",
  "inf-conf-malos",
  "inf-conf-inventario",
  "inf-conf-degradacion",
  "inf-conf-eficiencia",
  "inf-conf-conclusiones",
  "dash-resumen",
  "admin-usuarios",
  "admin-uso",
  "dash-mto",
  "mto-dashboard",
  "mto-optimizacion",
  "mto-degradacion",
  "ga-salud",
  "ga-inventario",
  "capa-tablero",
  "capa-resumen",
  "capa-acciones",
  "capa-seguimiento",
  "capa-evidencias",
  "capa-indicadores",
  "capa-efectividad",
  "op-tablero",
  "op-riesgos",
  "op-alertas",
  "op-prioridades",
  "op-accion",
  "op-cronograma",
  "op-compromisos",
  "op-recursos",
  "an-pareto",
  "an-tendencias-fallas",
  "proc-clasif",
  "cq-auditoria",
  "cfg-campos-costayaco",
  "cfg-campos-vonu",
  "cfg-campos-resumen",
  "cfg-campos",
  "rep-inf-resumen",
  "rep-inf-desempeno",
  "rep-inf-kpis",
  "rep-inf-eventos",
  "rep-inf-pareto",
  "rep-inf-worst",
  "rep-inf-rca",
  "rep-inf-interv",
  "rep-inf-mso",
  "rep-inf-riesgos",
  "rep-inf-capa",
  "rep-inf-plan",
  "rep-inf-conclusiones",
  "rep-inf-export",
]);

const GEN_LEAVES = new Set([
  "gen-dashboard",
  "gen-diaria",
  "gen-mensual",
  "gen-equipos",
  "gen-utilizacion",
  "gen-horas",
  "rep-inf-desempeno",
]);

function isCopowerLeaf(page: PageKey, leafId: string) {
  if (page === "indicadores" || leafId.startsWith("ind-") || leafId === "inf-indicadores") return true;
  if (leafId.startsWith("kpi-cpw-") || leafId === "bd-ind-copower") return true;
  if (GEN_LEAVES.has(leafId)) return true;
  if (CPW_LEAVES.has(leafId)) return true;
  if (page === "operacion" && (leafId.startsWith("proc-") || leafId.startsWith("bd-op"))) return true;
  return false;
}

function isGteLeaf(_page: PageKey, leafId: string) {
  if (leafId.startsWith("kpi-gte-") || leafId === "bd-ind-gte") return true;
  if (GTE_LEAVES.has(leafId)) return true;
  if (leafId === "dash-operacion-gte") return true;
  return false;
}

function isDualLeaf(page: PageKey, leafId: string) {
  if (page === "gestion_acciones" || page === "planeacion" || page === "informes") return true;
  if (page === "mantenimiento" && (leafId === "mto-dashboard" || leafId === "dash-mto")) return true;
  if (page === "gestion_activos" && leafId.startsWith("capa")) return true;
  if (leafId === "cmp-periodo-copower" || leafId === "cmp-periodo-gte") return false;
  if (leafId.startsWith("cmp-")) return true;
  if (leafId.startsWith("cq-")) return true;
  if (leafId.startsWith("inf-") || leafId.startsWith("rep-inf-")) return true;
  if (DUAL_LEAVES.has(leafId) || leafId.startsWith("cfg-campos-")) return true;
  return false;
}

const OPERACION_LEAVES = new Set([
  "op-dashboard",
  "op-equipos",
  "op-eficiencia",
  "op-resumen-diario",
  "op-eventos",
  "op-consumos",
  "op-detalle",
  "bd-op-copower",
]);

const CONCERTACION_LEAVES = new Set([
  "conc-resumen",
  "conc-unidades",
  "conc-diario",
  "conc-paradas",
  "conc-validacion",
]);

export function resolveViewContext(page: PageKey, leafId: string): ViewContext {
  if (leafId.startsWith("inf-cpw-")) {
    return {
      report: "copower",
      monthOrder: PLATFORM_MONTH_ORDER,
      reportLabel: "COPOWER · Informe interno de confiabilidad",
      reportShort: "COPOWER",
    };
  }
  if (page === "admin" || leafId.startsWith("admin-")) {
    return {
      report: "dual",
      monthOrder: PLATFORM_MONTH_ORDER,
      reportLabel: "Administración de la plataforma",
      reportShort: "Admin",
      fixedPeriod: true,
    };
  }
  if (page === "indicadores" || leafId.startsWith("ind-") || leafId === "inf-indicadores") {
    return {
      report: "copower",
      monthOrder: PLATFORM_MONTH_ORDER,
      reportLabel: "Indicadores · concertación y mantenimiento",
      reportShort: "IND",
    };
  }
  if (GEN_LEAVES.has(leafId) && leafId.startsWith("gen-")) {
    return {
      report: "copower",
      monthOrder: ["YTD2026"],
      reportLabel: "COPOWER · Generación YTD 2026",
      reportShort: "GEN",
      fixedPeriod: true,
    };
  }
  if (page === "concertacion" || CONCERTACION_LEAVES.has(leafId) || leafId.startsWith("conc-")) {
    return {
      report: "copower",
      monthOrder: ["2026-07"],
      reportLabel: "Concertación de horas · 12–29 jul 2026",
      reportShort: "CONC",
      fixedPeriod: true,
    };
  }
  if (page === "operacion" || OPERACION_LEAVES.has(leafId)) {
    return {
      report: "copower",
      monthOrder: ["YTD2026"],
      reportLabel: "Reporte diario · Costayaco / Vonú / Conejo",
      reportShort: "OP",
      fixedPeriod: true,
    };
  }
  if (INTEGRATED_DUAL_LEAVES.has(leafId) || leafId.startsWith("cfg-campos")) {
    return {
      report: "dual",
      monthOrder: PLATFORM_MONTH_ORDER,
      reportLabel: leafId.startsWith("cfg-campos")
        ? "Campo · Costayaco / Vonú"
        : "Gran Tierra + COPOWER · vista integrada",
      reportShort: leafId.startsWith("cfg-campos") ? "Campo" : "Dual",
    };
  }
  if (isDualLeaf(page, leafId)) {
    return {
      report: "dual",
      monthOrder: PLATFORM_MONTH_ORDER,
      reportLabel: "Gran Tierra + COPOWER",
      reportShort: "Dual",
    };
  }
  if (isCopowerLeaf(page, leafId)) {
    return {
      report: "copower",
      monthOrder: PLATFORM_MONTH_ORDER,
      reportLabel: "COPOWER · Operación diaria",
      reportShort: "COPOWER",
    };
  }
  if (isGteLeaf(page, leafId)) {
    return {
      report: "gran_tierra",
      monthOrder: PLATFORM_MONTH_ORDER,
      reportLabel: "Gran Tierra Energy · Informe oficial",
      reportShort: "GTE",
    };
  }
  return {
    report: "copower",
    monthOrder: PLATFORM_MONTH_ORDER,
    reportLabel: "COPOWER · Operación diaria",
    reportShort: "COPOWER",
  };
}

export function resolveReport(page: PageKey, leafId: string): ReportKey {
  const ctx = resolveViewContext(page, leafId);
  return ctx.report === "dual" ? "gran_tierra" : ctx.report;
}

export function monthLabelFor(month: string): string {
  if (month in PLATFORM_MONTH_LABELS) {
    return PLATFORM_MONTH_LABELS[month as keyof typeof PLATFORM_MONTH_LABELS];
  }
  if (GRAN_TIERRA_MONTH_ORDER.includes(month as GranTierraMonthKey)) {
    return granTierraMonthLabel(month as GranTierraMonthKey);
  }
  if (COPOWER_MONTH_ORDER.includes(month as CopowerMonthKey)) {
    return copowerMonthLabel(month as CopowerMonthKey);
  }
  return month;
}

export function monthOptionLabel(month: string, _ctx: ViewContext): string {
  if (month === "YTD2026") return "Ene – 18 Jul 2026 (199 días)";
  return monthLabelFor(month);
}

export function defaultMonth(ctx: ViewContext): string {
  if (ctx.monthOrder.includes("YTD2026")) return "YTD2026";
  const preferred = ctx.monthOrder.includes("Ago")
    ? "Ago"
    : ctx.monthOrder.includes("Jul")
      ? "Jul"
      : ctx.monthOrder.includes("Jun")
        ? "Jun"
        : ctx.monthOrder[ctx.monthOrder.length - 1];
  return preferred ?? "Ago";
}

export type GenerationSection = "dashboard" | "diaria" | "mensual" | "equipos" | "utilizacion" | "horas";

export function generationSectionFromLeaf(leafId: string): GenerationSection {
  switch (leafId) {
    case "gen-diaria":
      return "diaria";
    case "gen-mensual":
      return "mensual";
    case "gen-equipos":
      return "equipos";
    case "gen-utilizacion":
      return "utilizacion";
    case "gen-horas":
      return "horas";
    default:
      return "dashboard";
  }
}

/** Ancla de sección CAPA según hoja del menú. */
export function capaFocusFromLeaf(leafId: string): string | undefined {
  switch (leafId) {
    case "capa-resumen":
    case "capa-tablero":
      return "capa-sec-resumen";
    case "capa-acciones":
      return "capa-sec-acciones";
    case "capa-seguimiento":
      return "capa-sec-seguimiento";
    case "capa-evidencias":
      return "capa-sec-evidencias";
    case "capa-indicadores":
      return "capa-sec-indicadores";
    case "capa-efectividad":
      return "capa-sec-efectividad";
    default:
      return leafId.startsWith("capa-") ? "capa-sec-resumen" : undefined;
  }
}

/** Sección de Planeación operacional según hoja del menú. */
export function planningSectionFromLeaf(leafId: string): PlanningSection {
  switch (leafId) {
    case "op-tablero":
      return "resumen";
    case "op-riesgos":
    case "op-alertas":
      return "riesgos";
    case "op-prioridades":
      return "prioridades";
    case "op-accion":
      return "accion";
    case "op-cronograma":
      return "cronograma";
    case "op-compromisos":
      return "compromisos";
    case "op-recursos":
      return "recursos";
    default:
      return "resumen";
  }
}
