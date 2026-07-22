/** Activos por campo — data/contratos (costayaco.pdf + vonus.pdf) + flota operativa. */

export type FieldKey = "costayaco" | "vonu";

export type FieldStat = {
  label: string;
  value: string;
  hint?: string;
};

export type AssetCardKind = "gas" | "diesel" | "power" | "infra";

export type AssetCard = {
  id: string;
  title: string;
  detail: string;
  power?: string;
  count?: number;
  units?: string[];
  kind?: AssetCardKind;
};

export type AssetGroup = {
  title: string;
  /** Subtítulo corto para el encabezado de sección. */
  subtitle?: string;
  /** Acento visual de la sección (si no se define, se infiere del primer card). */
  kind?: AssetCardKind;
  cards: AssetCard[];
  /** hub = columna principal; side = lateral; bottom = ancho completo */
  placement?: "hub" | "side" | "bottom";
};

export type FleetVariant = "jenbacher" | "jinan" | "cpw" | "diesel";

export type FleetUnit = {
  id: string;
  family: string;
  /** Etiqueta corta de potencia nominal (p. ej. "800 kW"). */
  power: string;
  kwNominal: number;
  /** Tensión de generación / bornes. */
  voltage: string;
  /** Tensión de entrega al sistema (si difiere). */
  deliveryVoltage?: string;
  combustible: "gas" | "diesel";
  frecuenciaHz: number;
  factorPotencia: number;
  variant: FleetVariant;
};

export type FieldHero = {
  role: string;
  location: string;
  orders: string[];
};

export type FieldProfile = {
  key: FieldKey;
  label: string;
  description: string;
  layout?: "standard" | "hub";
  hero?: FieldHero;
  fleet?: FleetUnit[];
  stats: FieldStat[];
  groups: AssetGroup[];
};

const JEN_BASE = {
  family: "Respaldo diésel",
  power: "500 kW",
  kwNominal: 500,
  voltage: "480 V",
  deliveryVoltage: "13,8 kV",
  combustible: "diesel" as const,
  frecuenciaHz: 60,
  factorPotencia: 0.9,
  variant: "jenbacher" as const,
};

const CPW_BASE = {
  family: "CPW gas · MT",
  power: "800 kW",
  kwNominal: 800,
  voltage: "480 V",
  deliveryVoltage: "13,8 kV",
  combustible: "gas" as const,
  frecuenciaHz: 60,
  factorPotencia: 0.9,
  variant: "cpw" as const,
};

const JINAN_CYC = {
  family: "Jinan gas",
  power: "450 kW",
  kwNominal: 450,
  voltage: "480 V",
  deliveryVoltage: "13,8 kV",
  combustible: "gas" as const,
  frecuenciaHz: 60,
  factorPotencia: 0.9,
  variant: "jinan" as const,
};

const JINAN_VONU = {
  family: "Jinan CPW500",
  power: "500 kW",
  kwNominal: 500,
  voltage: "480 V",
  deliveryVoltage: "0,48 kV",
  combustible: "gas" as const,
  frecuenciaHz: 60,
  factorPotencia: 0.9,
  variant: "jinan" as const,
};

export const FIELD_PROFILES: Record<FieldKey, FieldProfile> = {
  costayaco: {
    key: "costayaco",
    label: "Costayaco",
    layout: "hub",
    description:
      "Centro de generación a gas en bloque Chaza (Putumayo Norte). Entrega a 13,8 kV · Orden 1200005030 + respaldo diésel Orden 9000007071.",
    hero: {
      role: "Centro de generación MT",
      location: "Bloque Chaza · Putumayo Norte",
      orders: ["1200005030", "9000007071"],
    },
    /** Orden visual: gas primero (CPW → Jinan) · luego respaldo diésel G10x. */
    fleet: [
      { id: "CPW01", ...CPW_BASE },
      { id: "CPW02", ...CPW_BASE },
      { id: "CPW03", ...CPW_BASE },
      { id: "CPW04", ...CPW_BASE },
      { id: "CPW05", ...CPW_BASE },
      { id: "CPW06", ...CPW_BASE },
      { id: "CPW07", ...CPW_BASE },
      { id: "JIN-10", ...JINAN_CYC },
      { id: "JIN-11", ...JINAN_CYC },
      { id: "JIN-12", ...JINAN_CYC },
      { id: "G101V", ...JEN_BASE },
      { id: "G102A", ...JEN_BASE },
      { id: "G102E", ...JEN_BASE },
      { id: "G102I", ...JEN_BASE },
      { id: "G102J", ...JEN_BASE },
      { id: "G102K", ...JEN_BASE },
    ],
    stats: [
      { label: "Potencia bloque", value: "8 MW", hint: "Orden 1 · FP 0,9 · reparto de carga" },
      { label: "Máquinas en operación", value: "16", hint: "7 CPW gas · 3 Jinan gas · 6 respaldo diésel" },
      { label: "Tensión de entrega", value: "13,8 kV", hint: "Centro de generación MT" },
      { label: "Respaldo diésel", value: "3 MW", hint: "G101V + G102A/E/I/J/K · 6 × 500 kW (bitácora = diésel)" },
      { label: "Transformadores", value: "7", hint: "6× Siemens 2,5–3 MVA + 1× 2,5 MVA" },
      { label: "Confiabilidad", value: "≥ 98%", hint: "Meta sistémica Orden 1" },
    ],
    groups: [
      {
        title: "Generación a gas",
        subtitle: "Flota principal Jinan + CPW · entrega 13,8 kV",
        kind: "gas",
        cards: [
          {
            id: "cyc-jinan",
            title: "Jinan gas",
            detail: "Generadores a gas · 450 kW · 480 V",
            power: "450 kW c/u",
            count: 3,
            kind: "gas",
            units: ["JIN-10", "JIN-11", "JIN-12"],
          },
          {
            id: "cyc-cpw",
            title: "CPW gas MT",
            detail: "Flota principal a gas · 800 kW · elevación 13,8 kV",
            power: "800 kW c/u",
            count: 7,
            kind: "gas",
            units: ["CPW01", "CPW02", "CPW03", "CPW04", "CPW05", "CPW06", "CPW07"],
          },
        ],
      },
      {
        title: "Respaldo diésel",
        subtitle: "G101V + G102A/E/I/J/K · bitácora = diésel · + Cummins Orden 2",
        kind: "diesel",
        cards: [
          {
            id: "cyc-j420",
            title: "G101 / G102 diésel",
            detail: "Respaldo de carga · bitácora operativa las registra como diésel (no gas)",
            power: "500 kW c/u",
            count: 6,
            kind: "diesel",
            units: ["G101V", "G102A", "G102E", "G102I", "G102J", "G102K"],
          },
          {
            id: "cyc-c500",
            title: "Cummins C500D6",
            detail: "KTA19 · día operando / stand-by",
            power: "500 kW",
            count: 1,
            kind: "diesel",
          },
          {
            id: "cyc-kta4",
            title: "Cummins KTA38-G4",
            detail: "Renta diésel Orden 2",
            power: "1.000 kW",
            count: 1,
            kind: "diesel",
          },
          {
            id: "cyc-kta2",
            title: "Cummins KTA38-G2",
            detail: "Renta diésel Orden 2",
            power: "800 kW",
            count: 1,
            kind: "diesel",
          },
        ],
      },
      {
        title: "Potencia y balance",
        subtitle: "Elevación, tableros y sincronismo del centro MT",
        kind: "power",
        cards: [
          {
            id: "cyc-trf-siemens",
            title: "Transformadores Siemens",
            detail: "Elevadores a 13,8 kV · aceite · Fase 1 y 2",
            power: "2,5–3 MVA",
            count: 6,
            kind: "power",
          },
          {
            id: "cyc-trf-25",
            title: "Transformador 480/13,2 kV",
            detail: "Orden 2 · elevación MT Costayaco",
            power: "2,5 MVA",
            count: 1,
            kind: "power",
          },
          {
            id: "cyc-tableros",
            title: "Tableros BT / MT",
            detail: "Switchgear y sincronismo del centro",
            kind: "power",
          },
        ],
      },
      {
        title: "Infraestructura",
        subtitle: "Sitio, contención y servicio O&M en campo",
        kind: "infra",
        cards: [
          {
            id: "cyc-geom",
            title: "Geomembrana",
            detail: "Control de derrames en área de generación",
            kind: "infra",
          },
          {
            id: "cyc-inst",
            title: "Instalación",
            detail: "Puesta en sitio de generadores",
            kind: "infra",
          },
          {
            id: "cyc-om",
            title: "Operación y mantenimiento",
            detail: "Servicio diario COPOWER en campo",
            kind: "infra",
          },
        ],
      },
    ],
  },
  vonu: {
    key: "vonu",
    label: "Vonú",
    description:
      "Generación a baja tensión en campo Vonú (bloque Chaza). Entrega a 0,48 kV · Orden 9000007071 + participación en bloque 8 MW Orden 1200005030.",
    hero: {
      role: "Centro de generación BT",
      location: "Campo Vonú · Bloque Chaza",
      orders: ["9000007071", "1200005030"],
    },
    fleet: [
      { id: "JIN-01", ...JINAN_VONU },
      { id: "JIN-02", ...JINAN_VONU },
      { id: "JIN-03", ...JINAN_VONU },
    ],
    stats: [
      { label: "Potencia instalada", value: "1,5 MW", hint: "3 × Jinan CPW500 · 500 kW c/u" },
      { label: "Máquinas en operación", value: "3", hint: "JIN-01, JIN-02, JIN-03" },
      { label: "Tensión de entrega", value: "0,48 kV", hint: "Campo Vonú" },
      { label: "Bloque sistémico", value: "8 MW", hint: "Compartido con Costayaco · Orden 1" },
      { label: "Periféricos", value: "3", hint: "Scrubber, geomembrana, mampara" },
      { label: "Confiabilidad", value: "≥ 98%", hint: "Evaluación sistémica con Costayaco" },
    ],
    groups: [
      {
        title: "Generación a gas",
        subtitle: "Tres Jinan CPW500 · entrega en baja tensión 0,48 kV",
        kind: "gas",
        cards: [
          {
            id: "von-jinan",
            title: "Jinan CPW500",
            detail: "Generadores a gas natural / biogás en campo Vonú · 480 V",
            power: "500 kW c/u",
            count: 3,
            kind: "gas",
            units: ["JIN-01", "JIN-02", "JIN-03"],
          },
        ],
      },
      {
        title: "Potencia y balance",
        subtitle: "Participación sistémica en el bloque 8 MW con Costayaco",
        kind: "power",
        cards: [
          {
            id: "von-sistema",
            title: "Bloque 8 MW",
            detail: "Configuración en paralelo Orden 1 · evaluación sistémica con Costayaco",
            power: "Sistema N",
            kind: "power",
          },
          {
            id: "von-entrega",
            title: "Entrega BT",
            detail: "Punto de entrega a 0,48 kV en campo Vonú",
            power: "0,48 kV",
            kind: "power",
          },
        ],
      },
      {
        title: "Infraestructura",
        subtitle: "Tratamiento de gas, contención y seguridad del sitio",
        kind: "infra",
        cards: [
          {
            id: "von-scrubber",
            title: "Scrubber",
            detail: "Tratamiento de gas con instrumentación",
            kind: "infra",
          },
          {
            id: "von-geom",
            title: "Geomembrana",
            detail: "Área de generación Vonú",
            kind: "infra",
          },
          {
            id: "von-mampara",
            title: "Mampara",
            detail: "Seguridad perimetral del sitio",
            kind: "infra",
          },
          {
            id: "von-inst",
            title: "Instalación",
            detail: "Puesta en marcha del generador",
            kind: "infra",
          },
        ],
      },
    ],
  },
};

export type FieldSection = "resumen" | "parque" | "desempeno" | "contrato" | "activos";

export function fieldKeyFromLeaf(leafId: string): FieldKey | null {
  if (leafId.startsWith("cfg-campos-costayaco")) return "costayaco";
  if (leafId.startsWith("cfg-campos-vonu")) return "vonu";
  return null;
}

export function fieldSectionFromLeaf(leafId: string): FieldSection {
  if (leafId.endsWith("-parque")) return "parque";
  if (leafId.endsWith("-desempeno")) return "desempeno";
  if (leafId.endsWith("-contrato")) return "contrato";
  if (leafId.endsWith("-activos")) return "activos";
  return "resumen";
}

export function fleetVariantRank(variant: FleetVariant): number {
  switch (variant) {
    case "cpw":
      return 0;
    case "jinan":
      return 1;
    case "jenbacher":
      return 2;
    case "diesel":
      return 3;
    default:
      return 9;
  }
}
