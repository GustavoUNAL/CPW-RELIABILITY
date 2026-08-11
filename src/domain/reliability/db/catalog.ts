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
    notes:
      "Julio: horas concertadas 01–31 (3 fallas COPOWER imputadas) + 5 FO-GE-033 oficiales en data/Julio/RCA.",
  },
  {
    id: "gte-monthly",
    label: "Snapshots mensuales Gran Tierra",
    kind: "monthly_snapshot",
    path: "src/domain/reliability/reports/granTierraMonthly.ts",
    consumers: ["dash-operacion-gte", "bd-ev-gte", "dash-contrato", "an-repetitivos-gte"],
    period: "Ene–Jul 2026",
    notes: "Julio: PDF Análisis Indicadores PUTN JUL 2026 + Data Soporte. Disp. Costayaco 80.65% oficial.",
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
    period: "2026 · julio ejecutado",
    notes:
      "Sábana anual + overlay data/Julio/SABANA MMTOS GEN PUTUMAYO Julio 2026. Planes y optimización leen MAINTENANCE_PLANS.",
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
    id: "concertacion-horas",
    label: "Horas concertadas GTE (Informes)",
    kind: "etl_generated",
    path: "src/domain/reliability/reports/concertacionHoursData.ts",
    consumers: [
      "inf-rg-desempeno",
      "inf-rg-indisponibilidad",
      "inf-rg-ops-rendimiento",
      "inf-rg-ops-gen-gas",
      "inf-rg-ops-gen-diesel",
    ],
    period: "May–Jul 2026",
    notes:
      "Fuente propia de Informes. No alinear 1:1 con COPOWER/GTE monthly (criterios y cortes distintos).",
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
    id: "rca-costayaco-julio",
    label: "Fichas RCA Costayaco julio (FO-GE-033)",
    kind: "rca_seed",
    path: "src/domain/reliability/rca/eventos_falla_costayaco_julio_2026.json",
    consumers: ["an-rca-gte", "an-rca-casos"],
    period: "Jul 2026",
    notes: "5 FO oficiales: MRU 12/21/24/25 + detonación CPW-04 21-jul. Se fusionan con el pack de junio.",
  },
  {
    id: "rca-cases-junio",
    label: "Casos RCA + PDF junio–julio",
    kind: "derived",
    path: "src/domain/reliability/reports/gteJuneRcaCases.ts",
    consumers: ["an-rca-casos"],
    period: "Jun–Jul 2026",
    notes: "RCA-030 junio + RCA-070…074 julio (FO-GE-033 en public/rca).",
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
    consumers: ["dash-contrato", "cmp-fuentes", "conf-formulas", "conf-formulas-revision"],
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
