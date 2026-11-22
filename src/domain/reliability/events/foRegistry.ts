/**
 * Registro maestro de FO-GE-033 y eventos de falla enviados (o imputados) a GTE.
 * Es la bitácora de trabajo: qué se entregó y qué baja — o no — la Conf COPOWER.
 *
 * Regla contractual (eventLogUtils):
 *   no penaliza → PF_cli, SB, responsable GTE / Externo
 *   sí penaliza  → PF_contr > 0, o FO + responsable COPOWER
 */

export type FoMonth = "Jun" | "Jul" | "Ago" | "Sep";

export type FoSendStatus = "enviado" | "listo" | "sin_fo" | "rca";

export type FoPenalty = "no_penaliza" | "penaliza" | "reclamar" | "por_clasificar";

export type FoRegistryEntry = {
  id: string;
  date: string;
  month: FoMonth;
  equipment: string;
  foNumber: string | null;
  foLabel: string;
  title: string;
  cause: string;
  classification: "PF_cli" | "PF_contr" | "SB" | "externa" | "sin_fo";
  responsible: "GTE" | "COPOWER" | "Externo" | "GTE + COPOWER";
  sendStatus: FoSendStatus;
  penalty: FoPenalty;
  sbHours: number | null;
  pfCliHours: number | null;
  pfContrHours: number | null;
  fallaEvento: number;
  folder: string;
  note: string;
};

export const FO_REGISTRY: FoRegistryEntry[] = [
  {
    id: "jun-cpw06-0603",
    date: "2026-06-03",
    month: "Jun",
    equipment: "CPW-06",
    foNumber: null,
    foLabel: "Sin FO-GE-033",
    title: "Cambio de intercooler · residuo de secuestrante",
    cause: "Correctivo por residuo de secuestrante en intercooler. Pendiente reporte de fallo.",
    classification: "PF_contr",
    responsible: "COPOWER",
    sendStatus: "sin_fo",
    penalty: "penaliza",
    sbHours: 0,
    pfCliHours: 0,
    pfContrHours: 4,
    fallaEvento: 1,
    folder: "Excel Data Soporte junio 2026 (bitácora GTE)",
    note: "GTE ya imputó 4 h PF_contr. No hay pack FO en data/.",
  },
  {
    id: "jun-cpw01-0605",
    date: "2026-06-05",
    month: "Jun",
    equipment: "CPW-01",
    foNumber: null,
    foLabel: "Sin FO-GE-033",
    title: "Correctivo escape · flexible",
    cause: "Sale a correctivo por agotamiento del 02-jun; afecta el flexible de escape.",
    classification: "PF_contr",
    responsible: "COPOWER",
    sendStatus: "sin_fo",
    penalty: "penaliza",
    sbHours: 0,
    pfCliHours: 0,
    pfContrHours: 2,
    fallaEvento: 1,
    folder: "Excel Data Soporte junio 2026 (bitácora GTE)",
    note: "Imputado en Data Soporte. 2 h PF_contr.",
  },
  {
    id: "jun-cpw01-0607",
    date: "2026-06-07",
    month: "Jun",
    equipment: "CPW-01",
    foNumber: null,
    foLabel: "Sin FO-GE-033",
    title: "Shutdown detonación · relé K4",
    cause: "Señal errónea del relé K4; se cambia base y relé.",
    classification: "PF_contr",
    responsible: "COPOWER",
    sendStatus: "sin_fo",
    penalty: "penaliza",
    sbHours: 0,
    pfCliHours: 0,
    pfContrHours: 3,
    fallaEvento: 1,
    folder: "Bitácora GTE junio 2026",
    note: "Reclasificado COPOWER. 3 h PF_contr.",
  },
  {
    id: "jun-cpw03-0611",
    date: "2026-06-11",
    month: "Jun",
    equipment: "CPW-03",
    foNumber: "51",
    foLabel: "FO-GE-033 No. 51",
    title: "Perturbación transitoria CPW-03",
    cause: "FS ≈ 3,92 h (15:12→19:25). Causa raíz no determinada.",
    classification: "PF_contr",
    responsible: "COPOWER",
    sendStatus: "enviado",
    penalty: "penaliza",
    sbHours: 0,
    pfCliHours: 0,
    pfContrHours: 3.92,
    fallaEvento: 1,
    folder: "data/Costayaco/RCA/Reporte de falla/",
    note: "Enviado. GTE imputó PF_contr. ≈ 2.620 kWh.",
  },
  {
    id: "jun-costayaco-0622",
    date: "2026-06-22",
    month: "Jun",
    equipment: "Flota Costayaco",
    foNumber: null,
    foLabel: "RCA-030 (no FO)",
    title: "Salida de la máquina · reconectador EEP 34,5 kV",
    cause: "Falla del reconectador Puerto Limón EEP. RCA entregado (Vector Shift).",
    classification: "externa",
    responsible: "Externo",
    sendStatus: "rca",
    penalty: "no_penaliza",
    sbHours: null,
    pfCliHours: null,
    pfContrHours: 0,
    fallaEvento: 0,
    folder: "data/Costayaco/RCA/",
    note: "RCA Sec. 30 entregado. No es FO-GE-033. No baja Conf COPOWER.",
  },
  {
    id: "jun-fo-44",
    date: "2026-06-23",
    month: "Jun",
    equipment: "CPW-04/05 (+ cascada)",
    foNumber: "44",
    foLabel: "FO-GE-033 No. 44",
    title: "Reconectador EEP Jauno–Piamonte",
    cause: "Cuatro operaciones EEP 23–24 jun se propagaron (RL sin selectividad; 480 V en 1,5×).",
    classification: "externa",
    responsible: "Externo",
    sendStatus: "enviado",
    penalty: "reclamar",
    sbHours: 0,
    pfCliHours: 0,
    pfContrHours: 3,
    fallaEvento: 1,
    folder: "data/Costayaco/RCA/Reporte de falla/",
    note: "FO enviado como externo. GTE imputó 1 h CPW-04 + 2 h CPW-05 PF_contr. Reclamar: no es órgano COPOWER.",
  },
  {
    id: "jun-cpw06-0627",
    date: "2026-06-27",
    month: "Jun",
    equipment: "CPW-06",
    foNumber: null,
    foLabel: "FO-GE-033 (27-jun, sin No.)",
    title: "Salida CPW-06 · AVR / Q> en investigación",
    cause: "FO sin horas oficiales. FS ≈ 2,30 h (03:17–05:35). AVR/Q>/DEIF/CPW-07.",
    classification: "PF_contr",
    responsible: "COPOWER",
    sendStatus: "enviado",
    penalty: "penaliza",
    sbHours: 0,
    pfCliHours: 0,
    pfContrHours: 2.3,
    fallaEvento: 1,
    folder: "data/Costayaco/RCA/Reporte de falla/",
    note: "GTE imputó 2,30 h PF_contr. Riesgo de penalización; RCA pendiente.",
  },
  {
    id: "jun-red-0628",
    date: "2026-06-28",
    month: "Jun",
    equipment: "Red 34 kV · CPW-01/02/03/07",
    foNumber: null,
    foLabel: "FO red 28-jun",
    title: "Falla de red 34 kV",
    cause: "Evento de red / cliente. Bitácora GTE en PF_cli.",
    classification: "PF_cli",
    responsible: "GTE",
    sendStatus: "enviado",
    penalty: "no_penaliza",
    sbHours: 0,
    pfCliHours: 0.38,
    pfContrHours: 0,
    fallaEvento: 0,
    folder: "data/Costayaco/RCA/Reporte de falla/",
    note: "Enviado. PF_cli · no baja Conf COPOWER.",
  },
  {
    id: "jul-fo-58",
    date: "2026-07-12",
    month: "Jul",
    equipment: "MRU · CPW-01/03/07, JIN-10/11/12",
    foNumber: "58",
    foLabel: "FO-GE-033 No. 58",
    title: "Cascada MRU Quincy",
    cause: "Salida MRU por baja presión de aceite Quincy. Externa a los grupos.",
    classification: "SB",
    responsible: "GTE",
    sendStatus: "enviado",
    penalty: "no_penaliza",
    sbHours: 16,
    pfCliHours: 0,
    pfContrHours: 0,
    fallaEvento: 0,
    folder: "data/Costayaco/Julio/fallas/12/",
    note: "Entregado GTE. SB · Falla_evento 0. ≈ 6.936 kWh.",
  },
  {
    id: "jul-fo-60",
    date: "2026-07-21",
    month: "Jul",
    equipment: "CPW-04",
    foNumber: "60",
    foLabel: "FO-GE-033 No. 60",
    title: "Detonación CPW-04 · gas Moqueta",
    cause: "Detonación alta en un cilindro asociada a gas MQT. Reingreso 20:21.",
    classification: "PF_cli",
    responsible: "GTE",
    sendStatus: "enviado",
    penalty: "no_penaliza",
    sbHours: 5,
    pfCliHours: 5,
    pfContrHours: 0,
    fallaEvento: 0,
    folder: "data/Costayaco/Julio/fallas/21/",
    note: "Padre del evento 02-sep. Concertación imputó PF_cli, no falla COPOWER. Archivo #54.",
  },
  {
    id: "jul-fo-61",
    date: "2026-07-21",
    month: "Jul",
    equipment: "MRU · CPW-01/02/03/07, JIN-10",
    foNumber: "61",
    foLabel: "FO-GE-033 No. 61",
    title: "Cascada MRU GLP",
    cause: "Salida MRU por alto nivel de GLP. Causa formal MRU aún por definir.",
    classification: "PF_cli",
    responsible: "GTE",
    sendStatus: "enviado",
    penalty: "no_penaliza",
    sbHours: 32,
    pfCliHours: 32,
    pfContrHours: 0,
    fallaEvento: 0,
    folder: "data/Costayaco/Julio/fallas/21/",
    note: "Entregado. PF_cli · no baja Conf COPOWER. ≈ 11.872 kWh.",
  },
  {
    id: "jul-fo-62",
    date: "2026-07-24",
    month: "Jul",
    equipment: "MRU · CPW-01/02/03/07, JIN-10",
    foNumber: "62",
    foLabel: "FO-GE-033 No. 62",
    title: "Reconectador EEP Junín–Mocoa",
    cause: "Disparo reconectador 34,5 kV → sale MRU. Mismo modo EEP que junio.",
    classification: "SB",
    responsible: "Externo",
    sendStatus: "enviado",
    penalty: "no_penaliza",
    sbHours: 17,
    pfCliHours: 0,
    pfContrHours: 0,
    fallaEvento: 0,
    folder: "data/Costayaco/Julio/fallas/24/",
    note: "Entregado (app.pdf). SB · no baja Conf COPOWER.",
  },
  {
    id: "jul-fo-63",
    date: "2026-07-25",
    month: "Jul",
    equipment: "MRU · CPW-01/02/03/07, JIN-10/11",
    foNumber: "63",
    foLabel: "FO-GE-033 No. 63",
    title: "Sobrepresión manifold CYC",
    cause: "Salida MRU por sobrepresión del manifold Costayaco.",
    classification: "SB",
    responsible: "GTE",
    sendStatus: "enviado",
    penalty: "no_penaliza",
    sbHours: 22,
    pfCliHours: 0,
    pfContrHours: 0,
    fallaEvento: 0,
    folder: "data/Costayaco/Julio/fallas/25/",
    note: "Entregado (archivo #55). SB · Falla_evento 0.",
  },
  {
    id: "sep-fo-8",
    date: "2026-09-02",
    month: "Sep",
    equipment: "CPW-04",
    foNumber: "8",
    foLabel: "FO-GE-033 No. 8",
    title: "Detonación CPW-04 · caída gas Moqueta",
    cause: "MQT ~146 → ~133 psi; IE650 Shutdown Detonación. STBY 15:35–18:55. Gas de campo, no órgano.",
    classification: "PF_cli",
    responsible: "GTE",
    sendStatus: "listo",
    penalty: "no_penaliza",
    sbHours: 3.33,
    pfCliHours: 3.33,
    pfContrHours: 0,
    fallaEvento: 0,
    folder: "data/Costayaco/Septiembre/fallas/02/",
    note: "Pack listo. Imputar 3,33 h SB · PF_cli · Falla 0 · Correctivo 0. Mismo modo que FO No. 60.",
  },
  {
    id: "sep-fo-64",
    date: "2026-09-06",
    month: "Sep",
    equipment: "CPW-07",
    foNumber: "64",
    foLabel: "FO-GE-033 No. 64",
    title: "Shutdown P> / knock · intercooler",
    cause: "Dos shutdowns en isla (08:33 y 08:45). Causa raíz: intercooler obstruido / turbo bypass / carcasa admisión.",
    classification: "PF_contr",
    responsible: "COPOWER",
    sendStatus: "listo",
    penalty: "penaliza",
    sbHours: 0,
    pfCliHours: 0,
    pfContrHours: 0.06,
    fallaEvento: 1,
    folder: "data/Costayaco/Septiembre/entrega/FO-GE-033-2026-09-06-CPW07/",
    note: "Pack en entrega. El FO declara falla imputable al grupo (no PF_cli). Fuera de línea ≈ 4 min.",
  },
];

export type FoRegistryStats = {
  total: number;
  enviados: number;
  listos: number;
  noPenalizan: number;
  penalizan: number;
  reclamar: number;
  sinFo: number;
  pfContrHours: number;
  pfCliHours: number;
};

export function computeFoRegistryStats(rows: FoRegistryEntry[]): FoRegistryStats {
  return {
    total: rows.length,
    enviados: rows.filter((r) => r.sendStatus === "enviado" || r.sendStatus === "rca").length,
    listos: rows.filter((r) => r.sendStatus === "listo").length,
    noPenalizan: rows.filter((r) => r.penalty === "no_penaliza").length,
    penalizan: rows.filter((r) => r.penalty === "penaliza").length,
    reclamar: rows.filter((r) => r.penalty === "reclamar").length,
    sinFo: rows.filter((r) => r.sendStatus === "sin_fo").length,
    pfContrHours: rows.reduce((s, r) => s + (r.pfContrHours ?? 0), 0),
    pfCliHours: rows.reduce((s, r) => s + (r.pfCliHours ?? 0), 0),
  };
}

export function foMonthLabel(month: FoMonth): string {
  const labels: Record<FoMonth, string> = {
    Jun: "Junio",
    Jul: "Julio",
    Ago: "Agosto",
    Sep: "Septiembre",
  };
  return labels[month];
}
