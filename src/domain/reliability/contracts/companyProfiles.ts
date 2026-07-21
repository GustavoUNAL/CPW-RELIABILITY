import { GTE_CONTRACT_ORDERS } from "./gteOrders";

export type CompanyFact = {
  label: string;
  value: string;
};

export type CompanyContractRow = {
  orderNo: string;
  sourceFile: string;
  object: string;
  term: string;
  estimatedValue: string;
  reliabilityScope: string;
  admin?: string;
  offerRef?: string;
};

export const COPOWER_PROFILE = {
  legalName: "COPOWER LIMITADA",
  role: "Contratista O&M · operador de generación",
  nit: "804.011.804-9",
  sapCode: "100000966",
  address: "Carrera 21 No. 8-10, Barrio Comuneros",
  city: "Bucaramanga — Santander",
  phone: "+57 (607) 6748248 · +57 (300) 7911562",
  emails: "proyectos@copower.com.co · gerencia@copower.com.co",
  facts: [
    { label: "Rol en la plataforma", value: "Fuente operativa diaria (Resumen OP, eventos, consumos)" },
    { label: "Campos bajo contrato", value: "Costayaco y Vonú — bloque Chaza, Putumayo" },
    { label: "Periodos cargados", value: "Ene–Jul 2026 en tablero COPOWER" },
    { label: "Reportes contractuales", value: "Informe diario y mensual de operación hacia Gran Tierra" },
  ] satisfies CompanyFact[],
  activeOrders: [
    {
      orderNo: "1200005030",
      sourceFile: "data/contratos/costayaco.pdf",
      object: "Generación a gas 8 MW en renta — Costayaco + Vonú (13,8 kV / 0,48 kV)",
      term: "01.12.2025 → 30.11.2028",
      estimatedValue: "COP $5.000 MM (referencia multas / cláusula penal)",
      reliabilityScope: "Sí — Disp/Conf sistema ≥98%, MTBF, MTTR, PMC, eficiencia, reportes",
      admin: "David Julian Quintero (Gran Tierra)",
      offerRef: "PT-COT-25-157-0 · SO-21625",
    },
    {
      orderNo: "9000007071",
      sourceFile: "data/contratos/vonus.pdf",
      object: "Renta generadores gas/diésel y equipos periféricos — Costayaco + Vonú",
      term: "01.09.2025 → 30.09.2026",
      estimatedValue: "COP $3.000 MM (referencia multas / cláusula penal)",
      reliabilityScope: "No — tarifas por día (operando / stand-by); sin tabla Disp/Conf",
      admin: "Gustavo Rueda (Gran Tierra)",
      offerRef: "PT-COT-25-177-2 · Pedido Urgente SRV",
    },
  ] satisfies CompanyContractRow[],
};

export const GTE_PROFILE = {
  legalName: "Gran Tierra Operations Colombia GmbH Sucursal",
  role: "Cliente · Aceptante contractual",
  nit: "900.335.237-1",
  address: "Calle 113 No. 7-80, Piso 17",
  city: "Bogotá D.C.",
  phone: "PBX (571) 6585757",
  area: "Power Utility",
  facts: [
    { label: "Rol en la plataforma", value: "Fuente oficial de indicadores mensuales (PDF/Excel GTE)" },
    { label: "Meta sistémica Orden 1", value: "Disponibilidad y Confiabilidad ≥ 98%" },
    { label: "Cláusula penal referencia", value: "15% del valor estimado de cada orden" },
    { label: "Pago", value: "30 días calendario desde radicación de factura" },
  ] satisfies CompanyFact[],
  contractOrders: GTE_CONTRACT_ORDERS.map((o) => ({
    orderNo: o.id === "orden_1" ? "1200005030" : o.id === "orden_2" ? "9000007071" : "CW6187",
    sourceFile: o.sourceFile,
    object: o.title,
    term: o.term,
    estimatedValue: o.estimatedValueLabel,
    reliabilityScope: o.hasPerformanceTable
      ? o.id === "orden_1"
        ? "Sí — única orden que rige este tablero de confiabilidad"
        : "Parcial — por máquina (Orden 3); fuera de alcance Costayaco/Vonú sistémico"
      : "No — solo tarifas y pólizas",
    admin: o.id === "orden_1" ? "David Julian Quintero" : o.id === "orden_2" ? "Gustavo Rueda" : undefined,
    offerRef: o.id === "orden_1" ? "PT-COT-25-157-0" : o.id === "orden_2" ? "PT-COT-25-177-2" : undefined,
  })) satisfies CompanyContractRow[],
  reliabilityNote:
    "Los indicadores de desempeño (Disp, Conf, MTBF, MTTR, PMC ≥ comprometida, eficiencia, plan MTO) provienen del TDR anexo a la Orden 1200005030 (costayaco.pdf). La Orden 9000007071 (vonus.pdf) regula renta de equipos por tarifa diaria sin tabla de confiabilidad sistémica.",
};
