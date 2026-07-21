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
  "bd-ind-copower",
  "bd-ev-copower",
  "proc-clasif",
  "proc-op",
  "proc-disp",
  "proc-fs",
  "proc-mto",
  "bd-mto",
  "bd-alarmas",
  "rep-diario",
  "dash-operacion",
  "an-repetitivos-copower",
  "an-badactors-copower",
  "an-interv-copower",
  "an-criticos",
  "an-riesgo",
  "gen-dashboard",
  "gen-diaria",
  "gen-mensual",
  "gen-equipos",
  "gen-utilizacion",
  "gen-horas",
]);

const GTE_LEAVES = new Set([
  "cfg-empresas-gte",
  "bd-ind-gte",
  "bd-ev-gte",
  "cfg-parametros",
  "rep-mensual",
  "rep-cliente",
  "an-rca",
  "an-rca-gte",
  "dash-operacion-gte",
  "an-repetitivos-gte",
  "an-badactors-gte",
  "an-interv-gte",
  "mto-optimizacion",
  "mto-degradacion",
  "ga-salud",
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
  "bd-historicos",
  "cq-auditoria",
  "cq-validacion",
  "cq-faltantes",
  "cq-duplicados",
  "cq-normalizacion",
  "an-pareto",
  "cmp-kpi",
  "cmp-diff",
  "cmp-tend",
  "cmp-desv",
  "cmp-sla",
  "cmp-bench",
  "capa-tablero",
  "capa-seguimiento",
  "capa-evidencias",
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
  "dash-resumen",
  "dash-mto",
  "mto-dashboard",
  "mto-optimizacion",
  "mto-degradacion",
  "ga-salud",
  "capa-tablero",
  "capa-seguimiento",
  "capa-evidencias",
  "capa-efectividad",
  "op-tablero",
  "op-riesgos",
  "op-alertas",
  "op-prioridades",
  "op-accion",
  "op-cronograma",
  "op-compromisos",
  "op-recursos",
  "bd-ev-dual",
  "an-pareto",
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
  if (page === "gestion_acciones" || page === "planeacion") return true;
  if (page === "gestion_activos" && (leafId === "mto-dashboard" || leafId.startsWith("capa"))) return true;
  if (leafId.startsWith("cmp-")) return true;
  if (leafId.startsWith("cq-")) return true;
  if (leafId.startsWith("rep-inf-")) return true;
  if (DUAL_LEAVES.has(leafId)) return true;
  return false;
}

export function resolveViewContext(page: PageKey, leafId: string): ViewContext {
  if (GEN_LEAVES.has(leafId) && leafId.startsWith("gen-")) {
    return {
      report: "copower",
      monthOrder: ["YTD2026"],
      reportLabel: "COPOWER · Generación YTD 2026",
      reportShort: "GEN",
      fixedPeriod: true,
    };
  }
  if (INTEGRATED_DUAL_LEAVES.has(leafId) || leafId.startsWith("cfg-campos")) {
    const union = Array.from(new Set([...GRAN_TIERRA_MONTH_ORDER, ...COPOWER_MONTH_ORDER]));
    return {
      report: "dual",
      monthOrder: union,
      reportLabel: leafId.startsWith("cfg-campos")
        ? "Campo · Costayaco / Vonú"
        : "Gran Tierra + COPOWER · vista integrada",
      reportShort: leafId.startsWith("cfg-campos") ? "Campo" : "Dual",
    };
  }
  if (isDualLeaf(page, leafId)) {
    const union = Array.from(new Set([...GRAN_TIERRA_MONTH_ORDER, ...COPOWER_MONTH_ORDER]));
    return {
      report: "dual",
      monthOrder: union,
      reportLabel: "Gran Tierra + COPOWER",
      reportShort: "Dual",
    };
  }
  if (isCopowerLeaf(page, leafId)) {
    return {
      report: "copower",
      monthOrder: COPOWER_MONTH_ORDER,
      reportLabel: "COPOWER · Operación diaria",
      reportShort: "COPOWER",
    };
  }
  if (isGteLeaf(page, leafId)) {
    return {
      report: "gran_tierra",
      monthOrder: GRAN_TIERRA_MONTH_ORDER,
      reportLabel: "Gran Tierra Energy · Informe oficial",
      reportShort: "GTE",
    };
  }
  return {
    report: "copower",
    monthOrder: COPOWER_MONTH_ORDER,
    reportLabel: "COPOWER · Operación diaria",
    reportShort: "COPOWER",
  };
}

export function resolveReport(page: PageKey, leafId: string): ReportKey {
  const ctx = resolveViewContext(page, leafId);
  return ctx.report === "dual" ? "gran_tierra" : ctx.report;
}

export function monthLabelFor(month: string): string {
  if (GRAN_TIERRA_MONTH_ORDER.includes(month as GranTierraMonthKey)) {
    return granTierraMonthLabel(month as GranTierraMonthKey);
  }
  if (COPOWER_MONTH_ORDER.includes(month as CopowerMonthKey)) {
    return copowerMonthLabel(month as CopowerMonthKey);
  }
  return month;
}

export function monthOptionLabel(month: string, ctx: ViewContext): string {
  if (month === "YTD2026") return "Ene – 18 Jul 2026 (199 días)";
  if (ctx.report === "dual") {
    const gte = GRAN_TIERRA_MONTH_ORDER.includes(month as GranTierraMonthKey)
      ? granTierraMonthLabel(month as GranTierraMonthKey)
      : null;
    const cpw = COPOWER_MONTH_ORDER.includes(month as CopowerMonthKey)
      ? copowerMonthLabel(month as CopowerMonthKey)
      : null;
    return gte ?? cpw ?? month;
  }
  return monthLabelFor(month);
}

export function defaultMonth(ctx: ViewContext): string {
  if (ctx.monthOrder.includes("YTD2026")) return "YTD2026";
  const preferred = ctx.monthOrder.includes("Jun") ? "Jun" : ctx.monthOrder[ctx.monthOrder.length - 1];
  return preferred ?? "Jun";
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
