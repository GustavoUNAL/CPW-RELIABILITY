/**
 * Catálogo central de datasets de la plataforma.
 * No es un motor SQL en runtime: organiza fuentes, consumidores y periodo
 * para auditoría e integridad. El esquema SQL vive en operacion/schema.sql.
 */

export type DatasetKind =
  | "monthly_snapshot"
  | "operacion_pack"
  | "etl_generated"
  | "rca_seed"
  | "derived"
  | "contract"
  | "document";

export type DatasetEntry = {
  id: string;
  label: string;
  kind: DatasetKind;
  /** Ruta relativa al repo (fuente o artefacto compilado). */
  path: string;
  /** Hojas del árbol que consumen este dataset (aprox.). */
  consumers: string[];
  period: string;
  notes?: string;
};

export const DATASET_CATALOG: readonly DatasetEntry[] = [
  {
    id: "copower-monthly",
    label: "Snapshots mensuales COPOWER",
    kind: "monthly_snapshot",
    path: "src/domain/reliability/reports/copowerMonthly.ts",
    consumers: ["dash-operacion", "bd-ev-copower", "an-repetitivos-copower", "cmp-periodo-copower"],
    period: "Ene–Jul 2026",
  },
  {
    id: "gte-monthly",
    label: "Snapshots mensuales Gran Tierra",
    kind: "monthly_snapshot",
    path: "src/domain/reliability/reports/granTierraMonthly.ts",
    consumers: ["dash-operacion-gte", "bd-ev-gte", "dash-contrato", "an-repetitivos-gte"],
    period: "Ene–Jun 2026",
    notes: "Julio aún no cargado en fuente GTE.",
  },
  {
    id: "operacion-pack",
    label: "Pack operación diaria",
    kind: "operacion_pack",
    path: "src/domain/reliability/operacion/data/operacionPack.json",
    consumers: ["op-dashboard", "op-equipos", "op-eficiencia", "op-eventos", "op-consumos"],
    period: "YTD 2026",
  },
  {
    id: "generation-ytd",
    label: "Dashboard generación YTD",
    kind: "etl_generated",
    path: "src/domain/reliability/reports/copowerGenerationDashboard2026.ts",
    consumers: ["gen-dashboard", "gen-diaria", "gen-mensual", "gen-equipos"],
    period: "YTD 2026",
  },
  {
    id: "maintenance-sabana",
    label: "Sábana planes Putumayo",
    kind: "etl_generated",
    path: "src/domain/reliability/reports/maintenancePlansData.ts",
    consumers: ["mto-dashboard", "mto-optimizacion"],
    period: "2026",
  },
  {
    id: "inventory-minimums",
    label: "Mínimos de inventario",
    kind: "etl_generated",
    path: "src/domain/reliability/reports/inventoryMinimumsData.ts",
    consumers: ["ga-inventario"],
    period: "2026",
  },
  {
    id: "rca-costayaco-junio",
    label: "Fichas RCA Costayaco junio",
    kind: "rca_seed",
    path: "src/domain/reliability/rca/eventos_falla_costayaco_junio_2026.json",
    consumers: ["an-rca-gte"],
    period: "Jun 2026",
    notes: "Plantilla BLANK excluida de listados; ediciones en localStorage.",
  },
  {
    id: "rca-cases-junio",
    label: "Casos RCA + PDF junio",
    kind: "derived",
    path: "src/domain/reliability/reports/gteJuneRcaCases.ts",
    consumers: ["an-rca-casos"],
    period: "Jun 2026",
  },
  {
    id: "intervention-junio",
    label: "Planes de intervención junio",
    kind: "derived",
    path: "src/domain/reliability/reports/gteJuneInterventionPlans.ts",
    consumers: ["an-interv-gte"],
    period: "Jun 2026",
  },
  {
    id: "executive-junio",
    label: "KPIs ejecutivos junio",
    kind: "derived",
    path: "src/domain/reliability/reports/executiveJune2026.ts",
    consumers: ["dash-contrato", "dash-resumen"],
    period: "Jun 2026",
  },
  {
    id: "contracts-gte",
    label: "Metas contractuales Orden 1",
    kind: "contract",
    path: "src/domain/reliability/contracts/gteOrders.ts",
    consumers: ["dash-contrato", "cmp-fuentes"],
    period: "vigente",
  },
  {
    id: "field-assets",
    label: "Activos por campo",
    kind: "contract",
    path: "src/domain/reliability/contracts/fieldAssets.ts",
    consumers: ["cfg-campos-costayaco-activos", "cfg-campos-vonu-activos"],
    period: "vigente",
  },
] as const;

export function datasetById(id: string): DatasetEntry | undefined {
  return DATASET_CATALOG.find((d) => d.id === id);
}
