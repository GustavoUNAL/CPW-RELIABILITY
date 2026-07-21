/**
 * 7 eventos asociados a COPOWER — junio 2026.
 * Fuente: Excel Data Soporte (bitácora) — PF_contr > 0 y Falla_evento ≥ 1.
 * Total PF_contr = 20 h (coincide con anexo oficial).
 */

export type ImputableEvent = {
  id: string;
  date: string;
  equipment: string;
  hoursPfContr: number;
  hoursPfCli: number;
  observation: string;
  source: string;
};

export const JUNE_2026_IMPUTABLE_EVENTS: ImputableEvent[] = [
  {
    id: "jun-cpw06-0603",
    date: "2026-06-03",
    equipment: "CPW06",
    hoursPfContr: 4,
    hoursPfCli: 0,
    observation:
      "Cambio de intercooler por exceso de reciduo de secuestrante. Pendiente reporte de fallo.",
    source: "Excel Data Soporte junio 2026 (bitácora)",
  },
  {
    id: "jun-cpw01-0605",
    date: "2026-06-05",
    equipment: "CPW01",
    hoursPfContr: 2,
    hoursPfCli: 0,
    observation:
      "Sale para mantenimiento correctivo por exostacion del dia 2-06-2026, afectando el flexible de escape.",
    source: "Excel Data Soporte junio 2026 (bitácora)",
  },
  {
    id: "jun-cpw03-0611",
    date: "2026-06-11",
    equipment: "CPW03",
    hoursPfContr: 5,
    hoursPfCli: 0,
    observation: "Sale por detonación equipo 15/06 sin reporte de falla.",
    source: "Excel Data Soporte junio 2026 (bitácora)",
  },
  {
    id: "jun-cpw06-0627",
    date: "2026-06-27",
    equipment: "CPW06",
    hoursPfContr: 2,
    hoursPfCli: 0,
    observation:
      "FDL equipos G56 & 57 por perturbacion / elevacion de voltaje; CPW06 sale de linea.",
    source: "Excel Data Soporte junio 2026 (bitácora)",
  },
  {
    id: "jun-cpw07-0627",
    date: "2026-06-27",
    equipment: "CPW07",
    hoursPfContr: 5,
    hoursPfCli: 0,
    observation:
      "FDL equipos G56 & 57 por perturbacion / elevacion de voltaje; CPW07 sale de linea.",
    source: "Excel Data Soporte junio 2026 (bitácora)",
  },
  {
    id: "jun-cpw05-0628",
    date: "2026-06-28",
    equipment: "CPW05",
    hoursPfContr: 1,
    hoursPfCli: 0,
    observation:
      "7:33 hr sale por parada manual ante potencia inversa y falla en la gobernación. 8:09 hr ingresa.",
    source: "Excel Data Soporte junio 2026 (bitácora)",
  },
  {
    id: "jun-cpw06-0628",
    date: "2026-06-28",
    equipment: "CPW06",
    hoursPfContr: 1,
    hoursPfCli: 0,
    observation: "7:31 hr sale por sobrecarga. 7:46 hr ingresa.",
    source: "Excel Data Soporte junio 2026 (bitácora)",
  },
];

/** Filas de auditoría PDF oficial vs Excel (junio) — solo discrepancias conocidas o matches. */
export type AuditRow = {
  indicator: string;
  pdfValue: string;
  excelValue: string;
  match: boolean;
  note: string;
};

export const JUNE_2026_AUDIT_ROWS: AuditRow[] = [
  {
    indicator: "Disponibilidad SISTEMA N Costayaco",
    pdfValue: "97.92%",
    excelValue: "97.92% (anexo / oficial)",
    match: true,
    note: "Cifra oficial del PDF; Excel por unidad no redefine el sistémico.",
  },
  {
    indicator: "Confiabilidad SISTEMA N Costayaco",
    pdfValue: "97.92%",
    excelValue: "97.92% (anexo / oficial)",
    match: true,
    note: "Cifra oficial del PDF.",
  },
  {
    indicator: "Fallas asociadas a COPOWER",
    pdfValue: "7",
    excelValue: "7 (Σ Falla_evento con PF_contr > 0)",
    match: true,
    note: "Bitácora Excel: 10 Falla_evento; 3 solo PF_cli.",
  },
  {
    indicator: "Horas PF_contr",
    pdfValue: "20 h",
    excelValue: "20 h",
    match: true,
    note: "Suma de las 7 filas asociadas.",
  },
  {
    indicator: "Horas PF_cli",
    pdfValue: "189 h",
    excelValue: "189 h",
    match: true,
    note: "Anexo / Excel reconciliados.",
  },
  {
    indicator: "MTBF sistémico",
    pdfValue: "711.57 h",
    excelValue: "711.57 h (anexo)",
    match: true,
    note: "Publicado en anexo PDF.",
  },
  {
    indicator: "MTTR sistémico",
    pdfValue: "2.86 h",
    excelValue: "2.86 h (anexo)",
    match: true,
    note: "Publicado en anexo PDF.",
  },
  {
    indicator: "CPW06 #fallas asociadas",
    pdfValue: "3 (RIESGO MEDIO)",
    excelValue: "3 (06-03, 06-27, 06-28)",
    match: true,
    note: "Anexo y bitácora alineados.",
  },
  {
    indicator: "Generación total kWh",
    pdfValue: "4,110,144 kWh (informe / Excel)",
    excelValue: "4,110,144.25 kWh",
    match: true,
    note: "Gas 3,499,840 + diésel 119,716 + Vonú 490,588.",
  },
  {
    indicator: "RCA / reportes de falla entregados",
    pdfValue: "0 de 7",
    excelValue: "Sin tracker de entregas en carpeta",
    match: true,
    note: "Ambas fuentes confirman ausencia de RCA formales.",
  },
];
