/** Activos por campo — data/contratos (costayaco.pdf + vonus.pdf). */

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

export type FleetUnit = {
  id: string;
  family: string;
  power: string;
  variant: "jinan" | "jenbacher";
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
    fleet: [
      { id: "CPW01", family: "Jinan CPW500", power: "500 kW", variant: "jinan" },
      { id: "CPW02", family: "Jinan CPW500", power: "500 kW", variant: "jinan" },
      { id: "CPW03", family: "Jinan CPW500", power: "500 kW", variant: "jinan" },
      { id: "G101V", family: "Jenbacher J420", power: "Tipo 1–5", variant: "jenbacher" },
      { id: "G102A", family: "Jenbacher J420", power: "Tipo 1–5", variant: "jenbacher" },
      { id: "G102E", family: "Jenbacher J420", power: "Tipo 1–5", variant: "jenbacher" },
      { id: "G102I", family: "Jenbacher J420", power: "Tipo 1–5", variant: "jenbacher" },
      { id: "G102J", family: "Jenbacher J420", power: "Tipo 1–5", variant: "jenbacher" },
      { id: "G102K", family: "Jenbacher J420", power: "Tipo 1–5", variant: "jenbacher" },
    ],
    stats: [
      { label: "Potencia bloque", value: "8 MW", hint: "Orden 1 · FP 0,9 · reparto de carga" },
      { label: "Máquinas en operación", value: "9", hint: "CPW01–03 + G101V + G102A/E/I/J/K" },
      { label: "Tensión de entrega", value: "13,8 kV", hint: "Centro de generación MT" },
      { label: "Respaldo diésel", value: "2,3 MW", hint: "500 + 1.000 + 800 kW (Orden 2)" },
      { label: "Transformadores", value: "7", hint: "6× Siemens 2,5–3 MVA + 1× 2,5 MVA" },
      { label: "Confiabilidad", value: "≥ 98%", hint: "Meta sistémica Orden 1" },
    ],
    groups: [
      {
        title: "Generación a gas",
        subtitle: "Flota principal Jenbacher + Jinan · entrega 13,8 kV",
        kind: "gas",
        cards: [
          {
            id: "cyc-j420",
            title: "Jenbacher J420",
            detail: "Generadores operativos y stand-by · 480 V",
            power: "Tipo 1–5",
            count: 6,
            kind: "gas",
            units: ["G101V", "G102A", "G102E", "G102I", "G102J", "G102K"],
          },
          {
            id: "cyc-j320",
            title: "Jenbacher J320",
            detail: "Stand-by / media tensión · 4.160 V / 480 V",
            power: "Respaldo gas",
            kind: "gas",
          },
          {
            id: "cyc-jinan",
            title: "Jinan 500 kW",
            detail: "Generadores compactos a gas",
            power: "500 kW c/u",
            count: 3,
            kind: "gas",
            units: ["CPW01", "CPW02", "CPW03"],
          },
        ],
      },
      {
        title: "Respaldo diésel",
        subtitle: "Orden 9000007071 · capacidad de respaldo 2,3 MW",
        kind: "diesel",
        cards: [
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
      { id: "JIN-01", family: "Jinan CPW500", power: "500 kW", variant: "jinan" },
      { id: "JIN-02", family: "Jinan CPW500", power: "500 kW", variant: "jinan" },
      { id: "JIN-03", family: "Jinan CPW500", power: "500 kW", variant: "jinan" },
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
            detail: "Generadores a gas natural / biogás en campo Vonú",
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

export function fieldKeyFromLeaf(leafId: string): FieldKey | null {
  if (leafId === "cfg-campos-costayaco") return "costayaco";
  if (leafId === "cfg-campos-vonu") return "vonu";
  return null;
}
