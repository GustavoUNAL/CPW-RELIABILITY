/**
 * 7 eventos asociados a COPOWER — junio 2026.
 * Fuente: bitácora GTE consolidada (PF_contr > 0 y Falla_evento ≥ 1).
 * Total PF_contr = 18,22 h (incluye FS 11-jun 3,92 h y 27-jun 2,30 h).
 * El evento externo 28-jun (FS 0,38 h) no se imputa a COPOWER.
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
    id: "jun-cpw01-0607",
    date: "2026-06-07",
    equipment: "CPW01",
    hoursPfContr: 3,
    hoursPfCli: 0,
    observation:
      "Shutdown por detonación asociada a señal errónea del relé K4; se cambia base y relé K4.",
    source: "Bitácora GTE junio 2026 (reclasificado COPOWER)",
  },
  {
    id: "jun-cpw03-0611",
    date: "2026-06-11",
    equipment: "CPW03",
    hoursPfContr: 3.92,
    hoursPfCli: 0,
    observation:
      "Perturbación transitoria; FS≈3,92 h (15:12→19:25); ≈2.620 kWh estimados. Causa raíz no determinada.",
    source: "FO-GE-033 v.01 + Historiador SCADA + registros O&M Copower",
  },
  {
    id: "jun-cpw04-0623",
    date: "2026-06-23",
    equipment: "CPW04",
    hoursPfContr: 1,
    hoursPfCli: 0,
    observation:
      "FO-44: cascada EEP Jauno–Piamonte + RL sin selectividad + disparo 480 V; ajuste final 8×/15× pendiente de validación.",
    source: "FO-GE-033 No. 44 + bitácora GTE 23–24/jun",
  },
  {
    id: "jun-cpw05-0623",
    date: "2026-06-23",
    equipment: "CPW05",
    hoursPfContr: 2,
    hoursPfCli: 0,
    observation:
      "FO-44: cascada EEP Jauno–Piamonte + RL sin selectividad + disparo 480 V; ajuste final 8×/15× pendiente de validación.",
    source: "FO-GE-033 No. 44 + bitácora GTE 23–24/jun",
  },
  {
    id: "jun-cpw06-0627",
    date: "2026-06-27",
    equipment: "CPW06",
    hoursPfContr: 2.3,
    hoursPfCli: 0,
    observation:
      "FO-GE-033 + tendencia: FO sin horas oficiales; FS≈2,30 h (03:17–05:35 aprox.) y ≈2.420 kWh nom.; con kW promedio pre-disparo ≈2,1–2,2 MWh; AVR/Q>/DEIF/CPW-07 en investigación.",
    source: "FO-GE-033 (27-jun-2026; sin horas) + tendencia operacional",
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
    excelValue: "18,22 h (bitácora consolidada)",
    match: false,
    note: "PDF anexo 20 h; bitácora: 4+2+3+3,92+1+2+2,30 = 18,22 h. El externo del 28-jun (0,38 h) no se imputa a COPOWER.",
  },
  {
    indicator: "Horas PF_cli",
    pdfValue: "189 h",
    excelValue: "179,38 h (bitácora consolidada)",
    match: false,
    note: "Se reclasificaron horas por consolidación de eventos 27/28-jun (sin duplicar unidades).",
  },
  {
    indicator: "MTBF sistémico",
    pdfValue: "711.57 h",
    excelValue: "986.71 h (7 fallas / 6907 h op)",
    match: false,
    note: "PDF con 7 fallas; bitácora consolidada con 7 fallas COPOWER (27-jun sin duplicar CPW06/07; 28-jun externo).",
  },
  {
    indicator: "MTTR sistémico",
    pdfValue: "2.86 h",
    excelValue: "2.60 h (18,22 h / 7 fallas)",
    match: false,
    note: "Recalculado con PF_contr consolidado (11-jun 3,92 h; 27-jun 2,30 h; 28-jun externo excluido).",
  },
  {
    indicator: "CPW06 #fallas asociadas",
    pdfValue: "3 (RIESGO MEDIO)",
    excelValue: "2 (06-03, 06-27; 06-28 sobrecarga eliminada)",
    match: false,
    note: "Anexo PDF aún cita 3; bitácora consolidada deja 2 fallas COPOWER (salida 28-jun por sobrecarga descartada como cascada MRU).",
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
    pdfValue: "1 de 7 (caso formal · 2 PDF revisiones)",
    excelValue: "data/RCA · salida de la máquina 22-jun (Sec. 30)",
    match: true,
    note: "Único RCA formal en carpeta: Shutdown Costayaco / salida de la máquina · EEP. El resto de fallas no tiene PDF entregado.",
  },
];
