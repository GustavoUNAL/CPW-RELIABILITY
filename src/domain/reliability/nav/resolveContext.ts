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
};

const CPW_LEAVES = new Set([
  "cfg-empresas-copower",
  "bd-op-copower",
  "bd-fallas",
  "bd-produccion",
  "rep-diario",
  "dash-operacion",
  "dash-ing",
]);

const GTE_LEAVES = new Set([
  "cfg-empresas-gte",
  "bd-ind-gte",
  "cfg-parametros",
  "rep-mensual",
  "rep-cliente",
  "an-rca",
]);

const DUAL_LEAVES = new Set([
  "cfg-campos-costayaco",
  "bd-historicos",
  "cq-auditoria",
  "cq-validacion",
  "cq-faltantes",
  "cmp-kpi",
  "cmp-diff",
  "cmp-tend",
  "cmp-desv",
  "cmp-sla",
]);

const OWN_HEADER_LEAVES = new Set([
  "bd-op-copower",
  "bd-ind-gte",
  "kpi-gte-todos",
  "dash-ejecutivo",
  "dash-operacion",
  "dash-gerencia",
  "rep-diario",
  "rep-mensual",
  "rep-cliente",
  "cq-auditoria",
]);

function isCopowerLeaf(page: PageKey, leafId: string) {
  if (page === "kpis_copower" || leafId.startsWith("kpi-cpw-")) return true;
  if (page === "procesamiento") return true;
  if (CPW_LEAVES.has(leafId)) return true;
  if (leafId === "an-pareto" || leafId === "an-criticos" || leafId === "an-riesgo") return true;
  return false;
}

function isGteLeaf(page: PageKey, leafId: string) {
  if (page === "kpis_gte" || leafId.startsWith("kpi-gte-")) return true;
  if (GTE_LEAVES.has(leafId)) return true;
  if (leafId === "dash-ejecutivo" || leafId === "dash-gerencia") return true;
  return false;
}

function isDualLeaf(page: PageKey, leafId: string) {
  if (page === "comparacion") return true;
  if (DUAL_LEAVES.has(leafId)) return true;
  return false;
}

export function resolveViewContext(page: PageKey, leafId: string): ViewContext {
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

export function hasOwnHeader(leafId: string): boolean {
  return OWN_HEADER_LEAVES.has(leafId);
}

export function defaultMonth(ctx: ViewContext): string {
  const preferred = ctx.monthOrder.includes("Jun") ? "Jun" : ctx.monthOrder[ctx.monthOrder.length - 1];
  return preferred ?? "Jun";
}
