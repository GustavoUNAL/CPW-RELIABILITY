import {
  Factory,
  LayoutDashboard,
  MapPin,
  MapPinned,
  Presentation,
  Search,
  type LucideIcon,
} from "lucide-react";
import type { PageKey } from "../types";

export type WorkNavItem = {
  label: string;
  page: PageKey;
  leaf: string;
};

export type WorkModule = {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  items: WorkNavItem[];
};

/**
 * Navegación de trabajo: un módulo por parque y el orden de la reunión
 * de indicadores con Gran Tierra. Las hojas apuntan a pantallas que ya existen.
 */
export const WORK_MODULES: WorkModule[] = [
  {
    id: "parque",
    label: "Parque",
    hint: "Cómo va el mes",
    icon: LayoutDashboard,
    items: [
      { label: "Cómo va el mes", page: "dashboard", leaf: "dash-historial" },
      { label: "Metas del contrato", page: "dashboard", leaf: "dash-contrato" },
      { label: "Indicadores", page: "dashboard", leaf: "dash-indicadores" },
      { label: "Operación", page: "operacion", leaf: "op-dashboard" },
    ],
  },
  {
    id: "costayaco",
    label: "Costayaco",
    hint: "Meta 98 %",
    icon: MapPin,
    items: [
      { label: "Resumen", page: "campos", leaf: "cfg-campos-costayaco-resumen" },
      { label: "Desempeño", page: "campos", leaf: "cfg-campos-costayaco-desempeno" },
      { label: "Contrato", page: "campos", leaf: "cfg-campos-costayaco-contrato" },
      { label: "Máquinas", page: "campos", leaf: "cfg-campos-costayaco-parque" },
      { label: "Activos", page: "campos", leaf: "cfg-campos-costayaco-activos" },
      { label: "Causas (RCA)", page: "confiabilidad", leaf: "an-rca-gte" },
    ],
  },
  {
    id: "vonu",
    label: "Vonú",
    hint: "Meta 90 %",
    icon: MapPinned,
    items: [
      { label: "Resumen", page: "campos", leaf: "cfg-campos-vonu-resumen" },
      { label: "Desempeño", page: "campos", leaf: "cfg-campos-vonu-desempeno" },
      { label: "Contrato", page: "campos", leaf: "cfg-campos-vonu-contrato" },
      { label: "Máquinas", page: "campos", leaf: "cfg-campos-vonu-parque" },
      { label: "Activos", page: "campos", leaf: "cfg-campos-vonu-activos" },
    ],
  },
  {
    id: "pad4",
    label: "Pad 4",
    hint: "Acordionero",
    icon: Factory,
    items: [
      { label: "Resumen", page: "campos", leaf: "cfg-campos-pad4-resumen" },
      { label: "Falla 12 nov", page: "confiabilidad", leaf: "bd-ev-pad4-1211" },
    ],
  },
  {
    id: "analisis",
    label: "Análisis",
    hint: "Fallas y causas",
    icon: Search,
    items: [
      { label: "Fallas COPOWER", page: "confiabilidad", leaf: "bd-ev-copower" },
      { label: "Fallas Gran Tierra", page: "confiabilidad", leaf: "bd-ev-gte" },
      { label: "Comparativo de fallas", page: "confiabilidad", leaf: "bd-ev-dual" },
      { label: "Repetitivos", page: "confiabilidad", leaf: "an-repetitivos" },
      { label: "Malos actores", page: "confiabilidad", leaf: "an-badactors" },
      { label: "Concertación de horas", page: "concertacion", leaf: "conc-resumen" },
      { label: "Bitácora FO", page: "confiabilidad", leaf: "bd-fo-bitacora" },
    ],
  },
  {
    id: "reunion",
    label: "Reunión",
    hint: "Indicadores con GTE",
    icon: Presentation,
    items: [
      { label: "Presentación", page: "dashboard", leaf: "dash-resumen" },
      { label: "Indicadores", page: "dashboard", leaf: "dash-indicadores" },
      { label: "Tabla de indicadores", page: "indicadores", leaf: "ind-comparacion" },
      { label: "Metas", page: "dashboard", leaf: "dash-contrato" },
      { label: "Disponibilidad", page: "informes", leaf: "inf-conf-conciliacion" },
      { label: "Operación Gran Tierra", page: "dashboard", leaf: "dash-operacion-gte" },
      { label: "Operación COPOWER", page: "dashboard", leaf: "dash-operacion" },
      { label: "Confiabilidad", page: "informes", leaf: "inf-conf-confiabilidad" },
      { label: "Por máquina", page: "informes", leaf: "inf-conf-maquinas" },
      { label: "Fallas", page: "informes", leaf: "inf-conf-fallas" },
      { label: "Repetitivos", page: "informes", leaf: "inf-conf-repetitivos" },
      { label: "Mantenimiento", page: "informes", leaf: "inf-conf-mantenimiento" },
      { label: "Bodega", page: "informes", leaf: "inf-conf-inventario" },
      { label: "Riesgos", page: "informes", leaf: "inf-conf-degradacion" },
      { label: "Eficiencia", page: "informes", leaf: "inf-conf-eficiencia" },
      { label: "Conclusiones", page: "informes", leaf: "inf-conf-conclusiones" },
      { label: "Facturación", page: "informes", leaf: "inf-conf-facturacion" },
    ],
  },
];

/** Módulos del inicio. El home los muestra todos, sin depender del parque elegido. */
export const HOME_MODULE_IDS = ["parque", "costayaco", "vonu", "pad4", "analisis", "reunion"] as const;

export const PARK_OPTIONS = [
  { id: "parque", label: "Parque", detail: "Costayaco, Vonú y Pad 4" },
  { id: "costayaco", label: "Costayaco", detail: "Meta de disponibilidad 98 %" },
  { id: "vonu", label: "Vonú", detail: "Meta de disponibilidad 90 %" },
  { id: "pad4", label: "Pad 4", detail: "Acordionero, otro contrato" },
] as const;

export type ParkId = (typeof PARK_OPTIONS)[number]["id"];

export function moduleForLeaf(page: PageKey, leaf: string): WorkModule | undefined {
  return WORK_MODULES.find((mod) => mod.items.some((item) => item.page === page && item.leaf === leaf));
}
