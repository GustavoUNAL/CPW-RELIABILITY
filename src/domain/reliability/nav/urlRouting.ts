import type { PageKey } from "../types";
import { PROJECT_NAV_TREE, firstLeafId, type NavModule, type NavNode } from "./projectTree";

/** Segmento de URL por módulo (corto y con sentido de dominio). */
export const MODULE_PATH: Record<PageKey, string> = {
  dashboard: "dashboard",
  campos: "campos",
  generacion: "generacion",
  indicadores: "indicadores",
  operacion: "operacion",
  concertacion: "concertacion",
  confiabilidad: "confiabilidad",
  mantenimiento: "mantenimiento",
  gestion_activos: "activos",
  gestion_acciones: "acciones",
  planeacion: "planeacion",
  facturacion: "facturacion",
  informes: "informes",
  admin: "admin",
};

const PATH_TO_MODULE = Object.fromEntries(
  (Object.entries(MODULE_PATH) as [PageKey, string][]).map(([k, v]) => [v, k]),
) as Record<string, PageKey>;

/**
 * Slug de hoja por leafId interno.
 * Paths legibles (sin prefijos tipo plantilla: inf-rg-, cfg-campos-, etc.).
 */
export const LEAF_PATH: Record<string, string> = {
  // dashboard
  "dash-resumen": "resumen",
  "dash-laminas": "laminas",
  "dash-indicadores": "indicadores",
  "dash-contrato": "contrato",
  "dash-operacion": "operacion-copower",
  "dash-operacion-gte": "operacion-gte",
  "bd-historicos-copower": "historicos-copower",
  "bd-historicos-gte": "historicos-gte",

  // campos
  "cfg-campos-resumen": "resumen",
  "cfg-campos-costayaco-resumen": "costayaco/resumen",
  "cfg-campos-costayaco-parque": "costayaco/parque",
  "cfg-campos-costayaco-desempeno": "costayaco/desempeno",
  "cfg-campos-costayaco-contrato": "costayaco/contrato",
  "cfg-campos-costayaco-activos": "costayaco/activos",
  "cfg-campos-vonu-resumen": "vonu/resumen",
  "cfg-campos-vonu-parque": "vonu/parque",
  "cfg-campos-vonu-desempeno": "vonu/desempeno",
  "cfg-campos-vonu-contrato": "vonu/contrato",
  "cfg-campos-vonu-activos": "vonu/activos",

  // generacion
  "gen-dashboard": "resumen",
  "gen-diaria": "tendencia-diaria",
  "gen-mensual": "acumulado-mensual",
  "gen-equipos": "por-equipo",
  "gen-utilizacion": "disponibilidad",
  "gen-horas": "horas-estado",

  // indicadores
  "ind-comparacion": "comparacion",
  "ind-dpto": "dpto-generacion",
  "ind-arteaga": "gustavo-arteaga",

  // operacion
  "op-dashboard": "resumen",
  "op-equipos": "equipos",
  "op-eficiencia": "eficiencia",
  "op-resumen-diario": "resumen-diario",
  "op-eventos": "eventos",
  "op-consumos": "consumos",

  // concertacion
  "conc-resumen": "resumen",
  "conc-unidades": "por-unidad",
  "conc-diario": "detalle-diario",
  "conc-paradas": "paradas",
  "conc-validacion": "validacion",

  // confiabilidad
  "cmp-fuentes": "resumen",
  "proc-clasif": "clasificacion-fallas",
  "bd-ev-copower": "fallas/copower",
  "bd-ev-gte": "fallas/gte",
  "bd-ev-dual": "fallas/comparativo",
  "an-repetitivos-copower": "repetitivos/copower",
  "an-repetitivos-gte": "repetitivos/gte",
  "an-repetitivos": "repetitivos/comparativo",
  "an-badactors-copower": "malos-actores/copower",
  "an-badactors-gte": "malos-actores/gte",
  "an-badactors": "malos-actores/comparativo",
  "an-rca-gte": "rca/costayaco",
  "an-rca-casos": "rca/casos",
  "mto-degradacion": "tendencias",
  "an-riesgo": "matriz-riesgo",
  "cmp-periodo-copower": "desempeno/copower",
  "cmp-periodo-gte": "desempeno/gte",
  "cmp-periodo": "desempeno/comparativo",

  // mantenimiento
  "dash-mto": "resumen",
  "mto-dashboard": "planes",
  "mto-optimizacion": "optimizacion",
  "an-interv-gte": "intervencion",

  // activos
  "ga-salud": "salud",
  "ga-inventario": "inventario",

  // acciones
  "capa-resumen": "capa/resumen",
  "capa-acciones": "capa/acciones",
  "capa-seguimiento": "capa/seguimiento",
  "capa-evidencias": "capa/evidencias",
  "capa-indicadores": "capa/indicadores",
  "capa-efectividad": "capa/efectividad",

  // planeacion
  "op-tablero": "resumen",
  "op-riesgos": "riesgos",
  "op-prioridades": "prioridades",
  "op-accion": "plan-accion",
  "op-cronograma": "cronograma",
  "op-compromisos": "compromisos",
  "op-recursos": "recursos",

  // facturacion
  "fac-documento": "documento",
  "fac-operaciones": "operaciones",
  "fac-indicadores": "indicadores",
  "fac-novedades": "novedades",
  "fac-tickets": "tickets",

  // informes (público y autenticado)
  "inf-indicadores": "indicadores",
  "inf-rg-indisponibilidad": "indisponibilidad",
  "inf-rg-desempeno": "desempeno",
  "inf-rg-ops-rendimiento": "rendimiento-unidad",
  "inf-rg-ops-gen-gas": "generacion-gas",
  "inf-rg-ops-gen-diesel": "generacion-diesel",
  "inf-rg-ops-kwh-top5": "kwh-top5",
  "inf-rg-ops-horas": "operacion-standby",
  "inf-rg-ops-fallas": "analisis-fallas",
  "inf-rg-ops-externos": "factores-externos",
  "inf-rg-ops-externos-eventos": "eventos-externos",
  "inf-rg-ops-maniobras": "maniobras",
  "inf-rg-ops-causas": "causas-indisponibilidad",
  "inf-rg-ops-criticidad": "criticidad",
  "inf-rg-ops-acciones": "acciones-correctivas",
  "inf-rg-anexo-gte": "anexo-gte",
  "inf-rg-anexo-ops": "anexo-operaciones",
  "inf-rg-anexo-imagenes": "anexo-imagenes",
  "inf-rg-gas-mqt": "gas-mqt",
  "inf-rg-inv": "inventarios",
  "inf-rg-inv-prev": "inventarios-anterior",
  "inf-rg-pruebas-dinamicas": "pruebas-dinamicas",
  "inf-rg-implementaciones": "implementaciones",
  "inf-rg-cargabilidad": "cargabilidad",
  "inf-cpw-resumen": "copower/indicadores",
  "inf-cpw-horas": "copower/horas",
  "inf-cpw-maquinas": "copower/maquinas",
  "inf-cpw-fallas": "copower/fallas",
  "inf-cpw-repetitivos": "copower/repetitivos",
  "inf-cpw-mantenimiento": "copower/mantenimiento",
  "inf-cpw-inventario": "copower/inventario",
  "inf-cpw-eficiencia": "copower/eficiencia",
  "inf-cpw-conclusiones": "copower/conclusiones",
  "inf-conf-facturacion": "facturacion",
  "inf-conf-presentacion": "informe-mensual",

  // admin
  "admin-usuarios": "usuarios",
  "admin-uso": "uso",
};

export type RouteLocation = {
  page: PageKey;
  leaf: string;
  /** Deep-link RCA (`?id=`). */
  focusId?: string | null;
};

export function cleanPathname(pathname = window.location.pathname): string {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return clean.startsWith("/") ? clean : `/${clean}`;
}

/** Vista pública de informes: `/informes` o `/informes/...`. */
export function isInformesStandalonePath(pathname = window.location.pathname): boolean {
  const clean = cleanPathname(pathname);
  return clean === "/informes" || clean.startsWith("/informes/");
}

/** Informe completo en una sola página, sin navegación ni cabeceras. */
export const FULL_REPORT_PATH = "/informes/reporte-completo";
/** Hoja que agrupa todas las secciones del informe de confiabilidad. */
export const FULL_REPORT_LEAF = "inf-conf-resumen";
/**
 * Ancla única y estable de la página del informe completo
 * (deep links, impresión y referencia externa).
 */
export const FULL_REPORT_DOM_ID = "informe-confiabilidad-putumayo-norte";
/** Alias legacy por si hay bookmarks antiguos. */
export const FULL_REPORT_DOM_ID_LEGACY = "reporte-confiabilidad";

export function isFullReportPath(pathname = window.location.pathname): boolean {
  return cleanPathname(pathname) === FULL_REPORT_PATH;
}

function collectLeaves(nodes: NavNode[], out: Set<string> = new Set()): Set<string> {
  for (const n of nodes) {
    if (!n.children?.length) out.add(n.id);
    else collectLeaves(n.children, out);
  }
  return out;
}

export function moduleHasLeaf(mod: NavModule, leafId: string): boolean {
  return collectLeaves(mod.children).has(leafId);
}

export function findModuleForLeaf(leafId: string): NavModule | undefined {
  return PROJECT_NAV_TREE.find((m) => moduleHasLeaf(m, leafId));
}

/** Resuelve slug → leafId dentro del módulo (evita colisiones tipo `resumen`). */
function leafIdFromSlug(mod: NavModule, slug: string): string | null {
  for (const [leafId, leafSlug] of Object.entries(LEAF_PATH)) {
    if (leafSlug === slug && moduleHasLeaf(mod, leafId)) return leafId;
  }
  if (moduleHasLeaf(mod, slug)) return slug;
  return null;
}

export function buildPath(page: PageKey, leafId: string, focusId?: string | null): string {
  const modSeg = MODULE_PATH[page];
  const leafSeg = LEAF_PATH[leafId] ?? leafId;
  const base = `/${modSeg}/${leafSeg}`;
  if (focusId) {
    const q = new URLSearchParams({ id: focusId });
    return `${base}?${q.toString()}`;
  }
  return base;
}

export function buildInformesPath(leafId: string): string {
  return buildPath("informes", leafId);
}

export function parsePath(
  pathname = window.location.pathname,
  search = window.location.search,
): RouteLocation | null {
  const clean = cleanPathname(pathname);
  if (clean === "/" || clean === "") return null;

  const parts = clean.slice(1).split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const [modSeg, ...rest] = parts;
  const page = PATH_TO_MODULE[modSeg];
  if (!page) return null;

  const mod = PROJECT_NAV_TREE.find((m) => m.key === page);
  if (!mod) return null;

  const focusId = new URLSearchParams(search).get("id");

  if (rest.length === 0) {
    const leaf = firstLeafId(mod.children);
    if (!leaf) return null;
    return { page, leaf, focusId };
  }

  const slug = rest.join("/");
  const leafFromSlug = leafIdFromSlug(mod, slug);
  if (leafFromSlug) {
    return { page, leaf: leafFromSlug, focusId };
  }

  // Fallback: leafId crudo (bookmarks legacy).
  const rawLeaf = rest.join("-");
  if (moduleHasLeaf(mod, rawLeaf)) {
    return { page, leaf: rawLeaf, focusId };
  }

  const leaf = firstLeafId(mod.children);
  if (!leaf) return null;
  return { page, leaf, focusId };
}

export function replaceAppUrl(page: PageKey, leafId: string, focusId?: string | null) {
  const next = buildPath(page, leafId, focusId);
  const current = `${cleanPathname()}${window.location.search}`;
  if (current === next) return;
  window.history.replaceState({ page, leaf: leafId, focusId: focusId ?? null }, "", next);
}

export function pushAppUrl(page: PageKey, leafId: string, focusId?: string | null) {
  const next = buildPath(page, leafId, focusId);
  const current = `${cleanPathname()}${window.location.search}`;
  if (current === next) return;
  window.history.pushState({ page, leaf: leafId, focusId: focusId ?? null }, "", next);
}
