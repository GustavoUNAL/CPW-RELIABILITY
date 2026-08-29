/** Generado por scripts/etl-mantenimiento-sabana.mjs — no editar a mano. */
export type MaintenancePlanStatus = "ejecutado" | "pendiente" | "no_aplica" | "otro" | "sin_dato";

export type MaintenanceFleetUnit = {
  equipment: string;
  model: string;
};

export type MaintenanceCatalogItem = {
  equipment: string;
  model: string;
  periodicityHrs: number;
  hoursMto: number;
  manHours: number;
};

export type MaintenanceMonthlySummary = {
  monthKey: string;
  monthLabel: string;
  /** Horas MTO marcadas en el calendario del mes (plan). */
  plannedHoursMto: number;
  plannedManHours: number;
  /** Horas de días con estado Ejecutado. */
  executedHoursMto: number;
  executedManHours: number;
  programmedCount: number;
  executedCount: number;
  pendingCount: number;
  kind: "ejecutado" | "mixto" | "planificado";
  /** Alias de plannedHoursMto (compat). */
  totalHoursMto: number;
  totalManHours: number;
};

export type MaintenanceExcelPanelRow = {
  monthKey: string;
  monthLabel: string;
  totalHoursMto: number;
  totalManHours: number;
};

export type MaintenanceCalendarSlot = {
  date: string;
  monthKey: string | null;
  equipment: string;
  model: string;
  mark: string;
  hoursMto: number | null;
  manHours: number | null;
  isRun: boolean;
  /** Mes al que se diferió (p. ej. sin 350 h OP). */
  deferredTo?: string;
};

export type MaintenanceExecution = {
  date: string;
  monthKey: string | null;
  programmed: boolean;
  programmedLabel: string;
  equipment: string;
  executed: boolean;
  status: MaintenancePlanStatus;
  statusLabel: string;
  executionDate: string | null;
  notes: string | null;
  plannedManHours: number;
};

export type MaintenanceEquipmentStat = {
  equipment: string;
  model: string;
  interventions: number;
  hoursMto: number;
  manHours: number;
};

export type MaintenanceDay = {
  date: string;
  weekday: string;
  monthKey: string | null;
  totalManHours: number;
  slotCount: number;
};

export type MaintenancePlansPack = {
  sourceFile: string;
  sheet: string;
  extractedAt: string;
  title: string;
  notes: string;
  fleet: MaintenanceFleetUnit[];
  catalog: MaintenanceCatalogItem[];
  periodicityNotes: { fleet: string; rule: string }[];
  monthlySummary: MaintenanceMonthlySummary[];
  /** Panel lateral del Excel — no usar como fuente primaria. */
  excelPanelSummary: MaintenanceExcelPanelRow[];
  statusCounts: Record<MaintenancePlanStatus, number>;
  equipmentStats: MaintenanceEquipmentStat[];
  days: MaintenanceDay[];
  calendarSlots: MaintenanceCalendarSlot[];
  executions: MaintenanceExecution[];
};

export const MAINTENANCE_PLANS: MaintenancePlansPack = {
  "sourceFile": "data/Julio/SABANA MMTOS GEN PUTUMAYO Julio 2026 Mes de Julio.xlsx",
  "sheet": "GENERACIÓN PUTUMAYO",
  "extractedAt": "2026-08-28",
  "title": "Sábana de mantenimientos · Generación Putumayo",
  "notes": "Agosto 2026 desde data/Agosto/mantenimiento. Julio desde sábana oficial del mes. Ene–Jun y Sep–Dic desde sábana anual.",
  "fleet": [
    {
      "equipment": "CPW02",
      "model": "J320"
    },
    {
      "equipment": "CPW01",
      "model": "J320"
    },
    {
      "equipment": "CPW03",
      "model": "J320"
    },
    {
      "equipment": "CPW04",
      "model": "J420"
    },
    {
      "equipment": "CPW05",
      "model": "J420"
    },
    {
      "equipment": "CPW06",
      "model": "J420"
    },
    {
      "equipment": "CPW07",
      "model": "J320"
    },
    {
      "equipment": "CPW 10",
      "model": "600GFT"
    },
    {
      "equipment": "CPW11",
      "model": "600GFT"
    },
    {
      "equipment": "CPW12",
      "model": "600GFT"
    },
    {
      "equipment": "JINAN 01",
      "model": "600GFT"
    },
    {
      "equipment": "JINAN 02",
      "model": "600GFT"
    },
    {
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT"
    },
    {
      "equipment": "G 102 I",
      "model": "KTA 19"
    },
    {
      "equipment": "G 102 E",
      "model": "KTA 19"
    },
    {
      "equipment": "G 102 A",
      "model": "KTA 19"
    },
    {
      "equipment": "G 101 V",
      "model": "KTA 19"
    },
    {
      "equipment": "G102 J",
      "model": "KTA 38"
    },
    {
      "equipment": "G102K",
      "model": "KTA 38"
    },
    {
      "equipment": "SWG",
      "model": "SWG"
    },
    {
      "equipment": "MQT",
      "model": "FILTRO COALESCENTE MQT"
    },
    {
      "equipment": "MRU",
      "model": "FILTRO COALESCENTE MRU"
    },
    {
      "equipment": "CYC",
      "model": "FILTRO COALESCENTE COSTAYACO SIN TRATAR"
    }
  ],
  "catalog": [
    {
      "equipment": "CPW02",
      "model": "J320",
      "periodicityHrs": 1000,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "CPW01",
      "model": "J320",
      "periodicityHrs": 1000,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "CPW03",
      "model": "J320",
      "periodicityHrs": 1000,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "CPW04",
      "model": "J420",
      "periodicityHrs": 1000,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "CPW05",
      "model": "J420",
      "periodicityHrs": 1000,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "CPW06",
      "model": "J420",
      "periodicityHrs": 1000,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "CPW07",
      "model": "J320",
      "periodicityHrs": 1000,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "CPW 10",
      "model": "600GFT",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "CPW11",
      "model": "600GFT",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "CPW12",
      "model": "600GFT",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "JINAN 01",
      "model": "600GFT",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "JINAN 02",
      "model": "600GFT",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "JINAN 03",
      "model": "600GFT",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "G 102 I",
      "model": "KTA 19",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "G 102 E",
      "model": "KTA 19",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "G 102 A",
      "model": "KTA 19",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "G 101 V",
      "model": "KTA 19",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "G102 J",
      "model": "KTA 38",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "G102K",
      "model": "KTA 38",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "SWG",
      "model": "SWG",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    },
    {
      "equipment": "FILTRO COALESCENTE",
      "model": "FILTRO COALESCENTE",
      "periodicityHrs": 350,
      "hoursMto": 8,
      "manHours": 16
    }
  ],
  "periodicityNotes": [
    {
      "fleet": "JINAN",
      "rule": "350 HORAS DE OPERACIÓN"
    },
    {
      "fleet": "DIESEL",
      "rule": "350 HORAS DE OPERACIÓN"
    }
  ],
  "monthlySummary": [
    {
      "monthKey": "Ene",
      "monthLabel": "Enero",
      "plannedHoursMto": 220,
      "plannedManHours": 440,
      "executedHoursMto": 220,
      "executedManHours": 440,
      "programmedCount": 21,
      "executedCount": 21,
      "pendingCount": 0,
      "kind": "ejecutado",
      "totalHoursMto": 220,
      "totalManHours": 440
    },
    {
      "monthKey": "Feb",
      "monthLabel": "Febrero",
      "plannedHoursMto": 192,
      "plannedManHours": 384,
      "executedHoursMto": 70,
      "executedManHours": 140,
      "programmedCount": 18,
      "executedCount": 7,
      "pendingCount": 11,
      "kind": "mixto",
      "totalHoursMto": 192,
      "totalManHours": 384
    },
    {
      "monthKey": "Mar",
      "monthLabel": "Marzo",
      "plannedHoursMto": 240,
      "plannedManHours": 480,
      "executedHoursMto": 150,
      "executedManHours": 300,
      "programmedCount": 20,
      "executedCount": 11,
      "pendingCount": 9,
      "kind": "mixto",
      "totalHoursMto": 240,
      "totalManHours": 480
    },
    {
      "monthKey": "Abr",
      "monthLabel": "Abril",
      "plannedHoursMto": 252,
      "plannedManHours": 504,
      "executedHoursMto": 150,
      "executedManHours": 300,
      "programmedCount": 20,
      "executedCount": 10,
      "pendingCount": 10,
      "kind": "mixto",
      "totalHoursMto": 252,
      "totalManHours": 504
    },
    {
      "monthKey": "May",
      "monthLabel": "Mayo",
      "plannedHoursMto": 206,
      "plannedManHours": 412,
      "executedHoursMto": 136,
      "executedManHours": 272,
      "programmedCount": 17,
      "executedCount": 10,
      "pendingCount": 7,
      "kind": "mixto",
      "totalHoursMto": 206,
      "totalManHours": 412
    },
    {
      "monthKey": "Jun",
      "monthLabel": "Junio",
      "plannedHoursMto": 226,
      "plannedManHours": 448,
      "executedHoursMto": 160,
      "executedManHours": 316,
      "programmedCount": 15,
      "executedCount": 9,
      "pendingCount": 6,
      "kind": "mixto",
      "totalHoursMto": 226,
      "totalManHours": 448
    },
    {
      "monthKey": "Jul",
      "monthLabel": "Julio",
      "plannedHoursMto": 382,
      "plannedManHours": 688,
      "executedHoursMto": 372,
      "executedManHours": 668,
      "programmedCount": 19,
      "executedCount": 19,
      "pendingCount": 0,
      "kind": "ejecutado",
      "totalHoursMto": 382,
      "totalManHours": 688
    },
    {
      "monthKey": "Ago",
      "monthLabel": "Agosto",
      "plannedHoursMto": 198,
      "plannedManHours": 396,
      "executedHoursMto": 0,
      "executedManHours": 0,
      "programmedCount": 1,
      "executedCount": 0,
      "pendingCount": 1,
      "kind": "planificado",
      "totalHoursMto": 198,
      "totalManHours": 396
    },
    {
      "monthKey": "Sep",
      "monthLabel": "Septiembre",
      "plannedHoursMto": 218,
      "plannedManHours": 420,
      "executedHoursMto": 0,
      "executedManHours": 0,
      "programmedCount": 16,
      "executedCount": 0,
      "pendingCount": 16,
      "kind": "planificado",
      "totalHoursMto": 218,
      "totalManHours": 420
    },
    {
      "monthKey": "Oct",
      "monthLabel": "Octubre",
      "plannedHoursMto": 258,
      "plannedManHours": 500,
      "executedHoursMto": 0,
      "executedManHours": 0,
      "programmedCount": 16,
      "executedCount": 0,
      "pendingCount": 16,
      "kind": "planificado",
      "totalHoursMto": 258,
      "totalManHours": 500
    },
    {
      "monthKey": "Nov",
      "monthLabel": "Noviembre",
      "plannedHoursMto": 222,
      "plannedManHours": 432,
      "executedHoursMto": 0,
      "executedManHours": 0,
      "programmedCount": 16,
      "executedCount": 0,
      "pendingCount": 16,
      "kind": "planificado",
      "totalHoursMto": 222,
      "totalManHours": 432
    },
    {
      "monthKey": "Dic",
      "monthLabel": "Diciembre",
      "plannedHoursMto": 232,
      "plannedManHours": 456,
      "executedHoursMto": 0,
      "executedManHours": 0,
      "programmedCount": 14,
      "executedCount": 0,
      "pendingCount": 14,
      "kind": "planificado",
      "totalHoursMto": 232,
      "totalManHours": 456
    }
  ],
  "excelPanelSummary": [
    {
      "monthKey": "Ene",
      "monthLabel": "Enero",
      "totalHoursMto": 0,
      "totalManHours": 0
    },
    {
      "monthKey": "Feb",
      "monthLabel": "Febrero",
      "totalHoursMto": 24,
      "totalManHours": 0
    },
    {
      "monthKey": "Mar",
      "monthLabel": "Marzo",
      "totalHoursMto": 0,
      "totalManHours": 0
    },
    {
      "monthKey": "Abr",
      "monthLabel": "Abril",
      "totalHoursMto": 24,
      "totalManHours": 0
    },
    {
      "monthKey": "May",
      "monthLabel": "Mayo",
      "totalHoursMto": 24,
      "totalManHours": 48
    },
    {
      "monthKey": "Jun",
      "monthLabel": "Junio",
      "totalHoursMto": 40,
      "totalManHours": 32
    },
    {
      "monthKey": "Jul",
      "monthLabel": "Julio",
      "totalHoursMto": 16,
      "totalManHours": 32
    },
    {
      "monthKey": "Ago",
      "monthLabel": "Agosto",
      "totalHoursMto": 48,
      "totalManHours": 48
    },
    {
      "monthKey": "Sep",
      "monthLabel": "Septiembre",
      "totalHoursMto": 16,
      "totalManHours": 32
    },
    {
      "monthKey": "Oct",
      "monthLabel": "Octubre",
      "totalHoursMto": 40,
      "totalManHours": 32
    },
    {
      "monthKey": "Nov",
      "monthLabel": "Noviembre",
      "totalHoursMto": 24,
      "totalManHours": 48
    },
    {
      "monthKey": "Dic",
      "monthLabel": "Diciembre",
      "totalHoursMto": 72,
      "totalManHours": 96
    },
    {
      "monthKey": "TOTAL",
      "monthLabel": "Total año",
      "totalHoursMto": 328,
      "totalManHours": 368
    }
  ],
  "statusCounts": {
    "ejecutado": 87,
    "pendiente": 106,
    "no_aplica": 141,
    "otro": 8,
    "sin_dato": 12
  },
  "equipmentStats": [
    {
      "equipment": "JINAN 01",
      "model": "600GFT",
      "interventions": 27,
      "hoursMto": 262,
      "manHours": 476
    },
    {
      "equipment": "G 101 V",
      "model": "KTA 19",
      "interventions": 24,
      "hoursMto": 240,
      "manHours": 480
    },
    {
      "equipment": "G102 J",
      "model": "KTA 38",
      "interventions": 24,
      "hoursMto": 240,
      "manHours": 480
    },
    {
      "equipment": "G102K",
      "model": "KTA 38",
      "interventions": 24,
      "hoursMto": 240,
      "manHours": 480
    },
    {
      "equipment": "JINAN 02",
      "model": "600GFT",
      "interventions": 24,
      "hoursMto": 238,
      "manHours": 476
    },
    {
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "interventions": 21,
      "hoursMto": 210,
      "manHours": 420
    },
    {
      "equipment": "CPW 10",
      "model": "600GFT",
      "interventions": 18,
      "hoursMto": 154,
      "manHours": 308
    },
    {
      "equipment": "CPW02",
      "model": "J320",
      "interventions": 12,
      "hoursMto": 146,
      "manHours": 276
    },
    {
      "equipment": "CPW01",
      "model": "J320",
      "interventions": 11,
      "hoursMto": 138,
      "manHours": 276
    },
    {
      "equipment": "CPW12",
      "model": "600GFT",
      "interventions": 11,
      "hoursMto": 130,
      "manHours": 228
    },
    {
      "equipment": "CPW03",
      "model": "J320",
      "interventions": 10,
      "hoursMto": 128,
      "manHours": 256
    },
    {
      "equipment": "CPW11",
      "model": "600GFT",
      "interventions": 10,
      "hoursMto": 120,
      "manHours": 208
    },
    {
      "equipment": "G 102 A",
      "model": "KTA 19",
      "interventions": 9,
      "hoursMto": 90,
      "manHours": 180
    },
    {
      "equipment": "G 102 E",
      "model": "KTA 19",
      "interventions": 9,
      "hoursMto": 90,
      "manHours": 180
    },
    {
      "equipment": "G 102 I",
      "model": "KTA 19",
      "interventions": 9,
      "hoursMto": 90,
      "manHours": 180
    },
    {
      "equipment": "CPW05",
      "model": "J420",
      "interventions": 7,
      "hoursMto": 68,
      "manHours": 136
    },
    {
      "equipment": "CPW04",
      "model": "J420",
      "interventions": 6,
      "hoursMto": 60,
      "manHours": 120
    },
    {
      "equipment": "CPW06",
      "model": "J420",
      "interventions": 6,
      "hoursMto": 68,
      "manHours": 136
    },
    {
      "equipment": "CYC",
      "model": "FILTRO COALESCENTE COSTAYACO SIN TRATAR",
      "interventions": 6,
      "hoursMto": 24,
      "manHours": 48
    },
    {
      "equipment": "MQT",
      "model": "FILTRO COALESCENTE MQT",
      "interventions": 6,
      "hoursMto": 24,
      "manHours": 48
    },
    {
      "equipment": "MRU",
      "model": "FILTRO COALESCENTE MRU",
      "interventions": 6,
      "hoursMto": 24,
      "manHours": 48
    },
    {
      "equipment": "CPW07",
      "model": "J320",
      "interventions": 5,
      "hoursMto": 60,
      "manHours": 116
    },
    {
      "equipment": "SWG",
      "model": "SWG",
      "interventions": 1,
      "hoursMto": 10,
      "manHours": 20
    }
  ],
  "days": [
    {
      "date": "2026-01-01",
      "weekday": "JUEVES",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-02",
      "weekday": "VIERNES",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-03",
      "weekday": "SÁBADO",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-04",
      "weekday": "DOMINGO",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-05",
      "weekday": "LUNES",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-06",
      "weekday": "MARTES",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-07",
      "weekday": "MIÉRCOLES",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-08",
      "weekday": "JUEVES",
      "monthKey": "Ene",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-01-09",
      "weekday": "VIERNES",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-10",
      "weekday": "SÁBADO",
      "monthKey": "Ene",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-01-11",
      "weekday": "DOMINGO",
      "monthKey": "Ene",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-01-12",
      "weekday": "LUNES",
      "monthKey": "Ene",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-01-13",
      "weekday": "MARTES",
      "monthKey": "Ene",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-01-14",
      "weekday": "MIÉRCOLES",
      "monthKey": "Ene",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-01-15",
      "weekday": "JUEVES",
      "monthKey": "Ene",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-01-16",
      "weekday": "VIERNES",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-17",
      "weekday": "SÁBADO",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-18",
      "weekday": "DOMINGO",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-19",
      "weekday": "LUNES",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-20",
      "weekday": "MARTES",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-21",
      "weekday": "MIÉRCOLES",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-22",
      "weekday": "JUEVES",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-23",
      "weekday": "VIERNES",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-24",
      "weekday": "SÁBADO",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-25",
      "weekday": "DOMINGO",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-26",
      "weekday": "LUNES",
      "monthKey": "Ene",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-01-27",
      "weekday": "MARTES",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-01-28",
      "weekday": "MIÉRCOLES",
      "monthKey": "Ene",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-01-29",
      "weekday": "JUEVES",
      "monthKey": "Ene",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-01-30",
      "weekday": "VIERNES",
      "monthKey": "Ene",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-01-31",
      "weekday": "SABADO",
      "monthKey": "Ene",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-01",
      "weekday": "DOMINGO",
      "monthKey": "Feb",
      "totalManHours": 0,
      "slotCount": 3
    },
    {
      "date": "2026-02-02",
      "weekday": "LUNES",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-03",
      "weekday": "MARTES",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-04",
      "weekday": "MIÉRCOLES",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-05",
      "weekday": "JUEVES",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-06",
      "weekday": "VIERNES",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-07",
      "weekday": "SÁBADO",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-08",
      "weekday": "DOMINGO",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-09",
      "weekday": "LUNES",
      "monthKey": "Feb",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-02-10",
      "weekday": "MARTES",
      "monthKey": "Feb",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-02-11",
      "weekday": "MIÉRCOLES",
      "monthKey": "Feb",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-02-12",
      "weekday": "JUEVES",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-13",
      "weekday": "VIERNES",
      "monthKey": "Feb",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-02-14",
      "weekday": "SÁBADO",
      "monthKey": "Feb",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-02-15",
      "weekday": "DOMINGO",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-16",
      "weekday": "LUNES",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-17",
      "weekday": "MARTES",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-18",
      "weekday": "MIÉRCOLES",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-02-19",
      "weekday": "JUEVES",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 3
    },
    {
      "date": "2026-02-20",
      "weekday": "VIERNES",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-21",
      "weekday": "SÁBADO",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-22",
      "weekday": "DOMINGO",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-23",
      "weekday": "LUNES",
      "monthKey": "Feb",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-02-24",
      "weekday": "MARTES",
      "monthKey": "Feb",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-02-25",
      "weekday": "MIÉRCOLES",
      "monthKey": "Feb",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-02-26",
      "weekday": "JUEVES",
      "monthKey": "Feb",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-02-27",
      "weekday": "VIERNES",
      "monthKey": "Feb",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-02-28",
      "weekday": "SÁBADO",
      "monthKey": "Feb",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-03-01",
      "weekday": "DOMINGO",
      "monthKey": "Mar",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-03-02",
      "weekday": "LUNES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-03",
      "weekday": "MARTES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-04",
      "weekday": "MIÉRCOLES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-05",
      "weekday": "JUEVES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-06",
      "weekday": "VIERNES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-07",
      "weekday": "SÁBADO",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-08",
      "weekday": "DOMINGO",
      "monthKey": "Mar",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-03-09",
      "weekday": "LUNES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-10",
      "weekday": "MARTES",
      "monthKey": "Mar",
      "totalManHours": 40,
      "slotCount": 3
    },
    {
      "date": "2026-03-11",
      "weekday": "MIÉRCOLES",
      "monthKey": "Mar",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-03-12",
      "weekday": "JUEVES",
      "monthKey": "Mar",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-03-13",
      "weekday": "VIERNES",
      "monthKey": "Mar",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-03-14",
      "weekday": "SÁBADO",
      "monthKey": "Mar",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-03-15",
      "weekday": "DOMINGO",
      "monthKey": "Mar",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-03-16",
      "weekday": "LUNES",
      "monthKey": "Mar",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-03-17",
      "weekday": "MARTES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-18",
      "weekday": "MIÉRCOLES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-19",
      "weekday": "JUEVES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-20",
      "weekday": "VIERNES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-03-21",
      "weekday": "SÁBADO",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-22",
      "weekday": "DOMINGO",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-23",
      "weekday": "LUNES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-24",
      "weekday": "MARTES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-25",
      "weekday": "MIÉRCOLES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-26",
      "weekday": "JUEVES",
      "monthKey": "Mar",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-03-27",
      "weekday": "VIERNES",
      "monthKey": "Mar",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-03-28",
      "weekday": "SÁBADO",
      "monthKey": "Mar",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-03-29",
      "weekday": "DOMINGO",
      "monthKey": "Mar",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-03-30",
      "weekday": "LUNES",
      "monthKey": "Mar",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-03-31",
      "weekday": "MARTES",
      "monthKey": "Mar",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-04-01",
      "weekday": "Miercoles",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-02",
      "weekday": "Jueves",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-03",
      "weekday": "Viernes",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-04-04",
      "weekday": "Sábado",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-05",
      "weekday": "Domingo",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-06",
      "weekday": "Lunes",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-07",
      "weekday": "Martes",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-08",
      "weekday": "Miércoles",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-09",
      "weekday": "Jueves",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-10",
      "weekday": "Viernes",
      "monthKey": "Abr",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-04-11",
      "weekday": "Sábado",
      "monthKey": "Abr",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-04-12",
      "weekday": "Domingo",
      "monthKey": "Abr",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-04-13",
      "weekday": "Lunes",
      "monthKey": "Abr",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-04-14",
      "weekday": "Martes",
      "monthKey": "Abr",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-04-15",
      "weekday": "Miércoles",
      "monthKey": "Abr",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-04-16",
      "weekday": "Jueves",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-17",
      "weekday": "Viernes",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-18",
      "weekday": "Sábado",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-04-19",
      "weekday": "Domingo",
      "monthKey": "Abr",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-04-20",
      "weekday": "Lunes",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-21",
      "weekday": "Martes",
      "monthKey": "Abr",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-04-22",
      "weekday": "Miércoles",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-23",
      "weekday": "Jueves",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-24",
      "weekday": "Viernes",
      "monthKey": "Abr",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-04-25",
      "weekday": "Sábado",
      "monthKey": "Abr",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-04-26",
      "weekday": "Domingo",
      "monthKey": "Abr",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-04-27",
      "weekday": "Lunes",
      "monthKey": "Abr",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-04-28",
      "weekday": "Martes",
      "monthKey": "Abr",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-04-29",
      "weekday": "Miércoles",
      "monthKey": "Abr",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-04-30",
      "weekday": "Jueves",
      "monthKey": "Abr",
      "totalManHours": 0,
      "slotCount": 2
    },
    {
      "date": "2026-05-01",
      "weekday": "Viernes",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-05-02",
      "weekday": "Sábado",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-05-03",
      "weekday": "Domingo",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-05-04",
      "weekday": "Lunes",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-05-05",
      "weekday": "Martes",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-05-06",
      "weekday": "Miércoles",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-05-07",
      "weekday": "Jueves",
      "monthKey": "May",
      "totalManHours": 36,
      "slotCount": 2
    },
    {
      "date": "2026-05-08",
      "weekday": "Viernes",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-05-09",
      "weekday": "Sábado",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-05-10",
      "weekday": "Domingo",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-05-11",
      "weekday": "Lunes",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-05-12",
      "weekday": "Martes",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-05-13",
      "weekday": "Miércoles",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-05-14",
      "weekday": "Jueves",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-05-15",
      "weekday": "Viernes",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-05-16",
      "weekday": "Sábado",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-05-17",
      "weekday": "Domingo",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-05-18",
      "weekday": "Lunes",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-05-19",
      "weekday": "Martes",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-05-20",
      "weekday": "Miércoles",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-05-21",
      "weekday": "Jueves",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-05-22",
      "weekday": "Viernes",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-05-23",
      "weekday": "Sábado",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-05-24",
      "weekday": "Domingo",
      "monthKey": "May",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-05-25",
      "weekday": "Lunes",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-05-26",
      "weekday": "Martes",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-05-27",
      "weekday": "Miércoles",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-05-28",
      "weekday": "Jueves",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-05-29",
      "weekday": "Viernes",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-05-30",
      "weekday": "Sábado",
      "monthKey": "May",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-05-31",
      "weekday": "Domingo",
      "monthKey": "May",
      "totalManHours": 44,
      "slotCount": 2
    },
    {
      "date": "2026-06-01",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-06-02",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 44,
      "slotCount": 3
    },
    {
      "date": "2026-06-03",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-06-04",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-06-05",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-06-06",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 60,
      "slotCount": 3
    },
    {
      "date": "2026-06-07",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-06-08",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-06-09",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-06-10",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-06-11",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-06-12",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-06-13",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-06-14",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-06-15",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-06-16",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-06-17",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-06-18",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 24,
      "slotCount": 1
    },
    {
      "date": "2026-06-19",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-06-20",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-06-21",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-06-22",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-06-23",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 44,
      "slotCount": 2
    },
    {
      "date": "2026-06-24",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 20,
      "slotCount": 3
    },
    {
      "date": "2026-06-25",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-06-26",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-06-27",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-06-28",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-06-29",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-06-30",
      "weekday": "",
      "monthKey": "Jun",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-09-01",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-02",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-03",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-04",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-09-05",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-09-06",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-09-07",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-08",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-09",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-09-10",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-09-11",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-12",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-13",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-09-14",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-09-15",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 44,
      "slotCount": 3
    },
    {
      "date": "2026-09-16",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-17",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-18",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-19",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-09-20",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-09-21",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-09-22",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-23",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-24",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-25",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-09-26",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-09-27",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 24,
      "slotCount": 1
    },
    {
      "date": "2026-09-28",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-09-29",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-09-30",
      "weekday": "",
      "monthKey": "Sep",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-10-01",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-10-02",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-10-03",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-10-04",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-10-05",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-10-06",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-10-07",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-10-08",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-10-09",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-10-10",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-10-11",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-10-12",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-10-13",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-10-14",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-10-15",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-10-16",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-10-17",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-10-18",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-10-19",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-10-20",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-10-21",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-10-22",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-10-23",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-10-24",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-10-25",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 2
    },
    {
      "date": "2026-10-26",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-10-27",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 24,
      "slotCount": 1
    },
    {
      "date": "2026-10-28",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-10-29",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-10-30",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 20,
      "slotCount": 3
    },
    {
      "date": "2026-10-31",
      "weekday": "",
      "monthKey": "Oct",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-11-01",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-11-02",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-11-03",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-11-04",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-11-05",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-11-06",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-11-07",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 24,
      "slotCount": 1
    },
    {
      "date": "2026-11-08",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-11-09",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-11-10",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-11-11",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-11-12",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-11-13",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-11-14",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 3
    },
    {
      "date": "2026-11-15",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-11-16",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-11-17",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-11-18",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-11-19",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-11-20",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-11-21",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 36,
      "slotCount": 2
    },
    {
      "date": "2026-11-22",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-11-23",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-11-24",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-11-25",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-11-26",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-11-27",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-11-28",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-11-29",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 20,
      "slotCount": 3
    },
    {
      "date": "2026-11-30",
      "weekday": "",
      "monthKey": "Nov",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-01",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-02",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-03",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 40,
      "slotCount": 3
    },
    {
      "date": "2026-12-04",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-12-05",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-12-06",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-07",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 24,
      "slotCount": 1
    },
    {
      "date": "2026-12-08",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-09",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-10",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-11",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-12",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-12-13",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-12-14",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 20,
      "slotCount": 3
    },
    {
      "date": "2026-12-15",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-16",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-17",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-18",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 44,
      "slotCount": 2
    },
    {
      "date": "2026-12-19",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-12-20",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-12-21",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-22",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 2
    },
    {
      "date": "2026-12-23",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-12-24",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-25",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-26",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-27",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 32,
      "slotCount": 2
    },
    {
      "date": "2026-12-28",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 16,
      "slotCount": 1
    },
    {
      "date": "2026-12-29",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 16,
      "slotCount": 3
    },
    {
      "date": "2026-12-30",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-12-31",
      "weekday": "",
      "monthKey": "Dic",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-07-01",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 20,
      "slotCount": 4
    },
    {
      "date": "2026-07-02",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-07-03",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-07-04",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-07-05",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-07-06",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-07-07",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 68,
      "slotCount": 2
    },
    {
      "date": "2026-07-08",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 68,
      "slotCount": 2
    },
    {
      "date": "2026-07-09",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-07-10",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 48,
      "slotCount": 1
    },
    {
      "date": "2026-07-11",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 48,
      "slotCount": 1
    },
    {
      "date": "2026-07-12",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-07-13",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 48,
      "slotCount": 1
    },
    {
      "date": "2026-07-14",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 68,
      "slotCount": 2
    },
    {
      "date": "2026-07-15",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-07-16",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-07-17",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-07-18",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-07-19",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-07-20",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-07-21",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-07-22",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-07-23",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-07-24",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-07-25",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-07-26",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-07-27",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-07-28",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-07-29",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-07-30",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-07-31",
      "weekday": "",
      "monthKey": "Jul",
      "totalManHours": 0,
      "slotCount": 2
    },
    {
      "date": "2026-08-01",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-02",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-03",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-04",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-05",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-08-06",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-08-07",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-08-08",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-09",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-10",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-08-11",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-12",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-13",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-14",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-15",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-16",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-08-17",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 24,
      "slotCount": 1
    },
    {
      "date": "2026-08-18",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-19",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-08-20",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 20,
      "slotCount": 2
    },
    {
      "date": "2026-08-21",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-08-22",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 20,
      "slotCount": 1
    },
    {
      "date": "2026-08-23",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-24",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-25",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-26",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 40,
      "slotCount": 2
    },
    {
      "date": "2026-08-27",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 2
    },
    {
      "date": "2026-08-28",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-08-29",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 0
    },
    {
      "date": "2026-08-30",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 0,
      "slotCount": 1
    },
    {
      "date": "2026-08-31",
      "weekday": "",
      "monthKey": "Ago",
      "totalManHours": 20,
      "slotCount": 1
    }
  ],
  "calendarSlots": [
    {
      "date": "2026-01-01",
      "monthKey": "Ene",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-02",
      "monthKey": "Ene",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-03",
      "monthKey": "Ene",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-04",
      "monthKey": "Ene",
      "equipment": "G 102 I",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-05",
      "monthKey": "Ene",
      "equipment": "G 102 E",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-06",
      "monthKey": "Ene",
      "equipment": "G 102 A",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-07",
      "monthKey": "Ene",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-08",
      "monthKey": "Ene",
      "equipment": "CPW02",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-08",
      "monthKey": "Ene",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-09",
      "monthKey": "Ene",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-16",
      "monthKey": "Ene",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-17",
      "monthKey": "Ene",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-18",
      "monthKey": "Ene",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-19",
      "monthKey": "Ene",
      "equipment": "G 102 I",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-20",
      "monthKey": "Ene",
      "equipment": "G 102 E",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-21",
      "monthKey": "Ene",
      "equipment": "G 102 A",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-22",
      "monthKey": "Ene",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-23",
      "monthKey": "Ene",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-24",
      "monthKey": "Ene",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-25",
      "monthKey": "Ene",
      "equipment": "CPW03",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-27",
      "monthKey": "Ene",
      "equipment": "CPW01",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-01-31",
      "monthKey": "Ene",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-01",
      "monthKey": "Feb",
      "equipment": "CPW04",
      "model": "J420",
      "mark": "RUN",
      "hoursMto": null,
      "manHours": null,
      "isRun": true
    },
    {
      "date": "2026-02-01",
      "monthKey": "Feb",
      "equipment": "CPW05",
      "model": "J420",
      "mark": "RUN",
      "hoursMto": null,
      "manHours": null,
      "isRun": true
    },
    {
      "date": "2026-02-01",
      "monthKey": "Feb",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-02",
      "monthKey": "Feb",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-03",
      "monthKey": "Feb",
      "equipment": "G 102 I",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-04",
      "monthKey": "Feb",
      "equipment": "G 102 E",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-05",
      "monthKey": "Feb",
      "equipment": "G 102 A",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-06",
      "monthKey": "Feb",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-07",
      "monthKey": "Feb",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-08",
      "monthKey": "Feb",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-12",
      "monthKey": "Feb",
      "equipment": "CPW02",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-15",
      "monthKey": "Feb",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-16",
      "monthKey": "Feb",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-17",
      "monthKey": "Feb",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-18",
      "monthKey": "Feb",
      "equipment": "G 102 I",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-18",
      "monthKey": "Feb",
      "equipment": "CYC",
      "model": "FILTRO COALESCENTE COSTAYACO SIN TRATAR",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-02-19",
      "monthKey": "Feb",
      "equipment": "G 102 E",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-19",
      "monthKey": "Feb",
      "equipment": "MQT",
      "model": "FILTRO COALESCENTE MQT",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-02-19",
      "monthKey": "Feb",
      "equipment": "MRU",
      "model": "FILTRO COALESCENTE MRU",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-02-20",
      "monthKey": "Feb",
      "equipment": "G 102 A",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-21",
      "monthKey": "Feb",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-22",
      "monthKey": "Feb",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-02-23",
      "monthKey": "Feb",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-02",
      "monthKey": "Mar",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-03",
      "monthKey": "Mar",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-04",
      "monthKey": "Mar",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-05",
      "monthKey": "Mar",
      "equipment": "G 102 I",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-06",
      "monthKey": "Mar",
      "equipment": "G 102 E",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-07",
      "monthKey": "Mar",
      "equipment": "G 102 A",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-08",
      "monthKey": "Mar",
      "equipment": "CPW03",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-08",
      "monthKey": "Mar",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-09",
      "monthKey": "Mar",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-10",
      "monthKey": "Mar",
      "equipment": "CPW01",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-10",
      "monthKey": "Mar",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-10",
      "monthKey": "Mar",
      "equipment": "SWG",
      "model": "SWG",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-14",
      "monthKey": "Mar",
      "equipment": "CPW04",
      "model": "J420",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-14",
      "monthKey": "Mar",
      "equipment": "CPW05",
      "model": "J420",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-17",
      "monthKey": "Mar",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-18",
      "monthKey": "Mar",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-19",
      "monthKey": "Mar",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-20",
      "monthKey": "Mar",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "RUN",
      "hoursMto": null,
      "manHours": null,
      "isRun": true
    },
    {
      "date": "2026-03-20",
      "monthKey": "Mar",
      "equipment": "G 102 I",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-21",
      "monthKey": "Mar",
      "equipment": "G 102 E",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-22",
      "monthKey": "Mar",
      "equipment": "G 102 A",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-23",
      "monthKey": "Mar",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-24",
      "monthKey": "Mar",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-25",
      "monthKey": "Mar",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-03-26",
      "monthKey": "Mar",
      "equipment": "CPW02",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-01",
      "monthKey": "Abr",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-02",
      "monthKey": "Abr",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-03",
      "monthKey": "Abr",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-03",
      "monthKey": "Abr",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-04",
      "monthKey": "Abr",
      "equipment": "G 102 I",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-05",
      "monthKey": "Abr",
      "equipment": "G 102 E",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-06",
      "monthKey": "Abr",
      "equipment": "G 102 A",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-07",
      "monthKey": "Abr",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-08",
      "monthKey": "Abr",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-09",
      "monthKey": "Abr",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-16",
      "monthKey": "Abr",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-17",
      "monthKey": "Abr",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-18",
      "monthKey": "Abr",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-18",
      "monthKey": "Abr",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-19",
      "monthKey": "Abr",
      "equipment": "CPW03",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-19",
      "monthKey": "Abr",
      "equipment": "G 102 I",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-20",
      "monthKey": "Abr",
      "equipment": "G 102 E",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-21",
      "monthKey": "Abr",
      "equipment": "CPW01",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-21",
      "monthKey": "Abr",
      "equipment": "G 102 A",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-22",
      "monthKey": "Abr",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-23",
      "monthKey": "Abr",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-24",
      "monthKey": "Abr",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-25",
      "monthKey": "Abr",
      "equipment": "CPW04",
      "model": "J420",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-25",
      "monthKey": "Abr",
      "equipment": "CPW05",
      "model": "J420",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-04-29",
      "monthKey": "Abr",
      "equipment": "CYC",
      "model": "FILTRO COALESCENTE COSTAYACO SIN TRATAR",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-04-30",
      "monthKey": "Abr",
      "equipment": "MQT",
      "model": "FILTRO COALESCENTE MQT",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-04-30",
      "monthKey": "Abr",
      "equipment": "MRU",
      "model": "FILTRO COALESCENTE MRU",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-05-01",
      "monthKey": "May",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-02",
      "monthKey": "May",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-03",
      "monthKey": "May",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-05-03",
      "monthKey": "May",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-04",
      "monthKey": "May",
      "equipment": "G 102 I",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-05",
      "monthKey": "May",
      "equipment": "G 102 E",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-06",
      "monthKey": "May",
      "equipment": "G 102 A",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-07",
      "monthKey": "May",
      "equipment": "CPW02",
      "model": "J320",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-05-07",
      "monthKey": "May",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-08",
      "monthKey": "May",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-09",
      "monthKey": "May",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-13",
      "monthKey": "May",
      "equipment": "CPW06",
      "model": "J420",
      "mark": "RUN",
      "hoursMto": null,
      "manHours": null,
      "isRun": true
    },
    {
      "date": "2026-05-16",
      "monthKey": "May",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-17",
      "monthKey": "May",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-18",
      "monthKey": "May",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-05-18",
      "monthKey": "May",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-20",
      "monthKey": "May",
      "equipment": "CPW06",
      "model": "J420",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-22",
      "monthKey": "May",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-23",
      "monthKey": "May",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-24",
      "monthKey": "May",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-05-25",
      "monthKey": "May",
      "equipment": "CPW07",
      "model": "J320",
      "mark": "RUN",
      "hoursMto": null,
      "manHours": null,
      "isRun": true
    },
    {
      "date": "2026-05-31",
      "monthKey": "May",
      "equipment": "CPW03",
      "model": "J320",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-05-31",
      "monthKey": "May",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-01",
      "monthKey": "Jun",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-02",
      "monthKey": "Jun",
      "equipment": "CPW01",
      "model": "J320",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-06-02",
      "monthKey": "Jun",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-06-02",
      "monthKey": "Jun",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-06",
      "monthKey": "Jun",
      "equipment": "CPW04",
      "model": "J420",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-06",
      "monthKey": "Jun",
      "equipment": "CPW05",
      "model": "J420",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-06",
      "monthKey": "Jun",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-07",
      "monthKey": "Jun",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-08",
      "monthKey": "Jun",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-11",
      "monthKey": "Jun",
      "equipment": "CPW11",
      "model": "600GFT",
      "mark": "RUN",
      "hoursMto": null,
      "manHours": null,
      "isRun": true
    },
    {
      "date": "2026-06-12",
      "monthKey": "Jun",
      "equipment": "CPW12",
      "model": "600GFT",
      "mark": "RUN",
      "hoursMto": null,
      "manHours": null,
      "isRun": true
    },
    {
      "date": "2026-06-15",
      "monthKey": "Jun",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-16",
      "monthKey": "Jun",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-17",
      "monthKey": "Jun",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-06-17",
      "monthKey": "Jun",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-18",
      "monthKey": "Jun",
      "equipment": "CPW02",
      "model": "J320",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-06-21",
      "monthKey": "Jun",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-22",
      "monthKey": "Jun",
      "equipment": "CPW05",
      "model": "J420",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-22",
      "monthKey": "Jun",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-23",
      "monthKey": "Jun",
      "equipment": "CPW06",
      "model": "J420",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-06-23",
      "monthKey": "Jun",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-24",
      "monthKey": "Jun",
      "equipment": "CPW07",
      "model": "J320",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-06-24",
      "monthKey": "Jun",
      "equipment": "MQT",
      "model": "FILTRO COALESCENTE MQT",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-06-24",
      "monthKey": "Jun",
      "equipment": "MRU",
      "model": "FILTRO COALESCENTE MRU",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-06-25",
      "monthKey": "Jun",
      "equipment": "CYC",
      "model": "FILTRO COALESCENTE COSTAYACO SIN TRATAR",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-06-30",
      "monthKey": "Jun",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-04",
      "monthKey": "Sep",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-05",
      "monthKey": "Sep",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-06",
      "monthKey": "Sep",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-09",
      "monthKey": "Sep",
      "equipment": "CPW11",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-10",
      "monthKey": "Sep",
      "equipment": "CPW02",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-13",
      "monthKey": "Sep",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-14",
      "monthKey": "Sep",
      "equipment": "CPW12",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-14",
      "monthKey": "Sep",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-15",
      "monthKey": "Sep",
      "equipment": "CPW06",
      "model": "J420",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-09-15",
      "monthKey": "Sep",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-09-15",
      "monthKey": "Sep",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-19",
      "monthKey": "Sep",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-20",
      "monthKey": "Sep",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-21",
      "monthKey": "Sep",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-26",
      "monthKey": "Sep",
      "equipment": "CPW11",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-27",
      "monthKey": "Sep",
      "equipment": "CPW07",
      "model": "J320",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-09-28",
      "monthKey": "Sep",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-29",
      "monthKey": "Sep",
      "equipment": "CPW12",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-29",
      "monthKey": "Sep",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-09-30",
      "monthKey": "Sep",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-09-30",
      "monthKey": "Sep",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-04",
      "monthKey": "Oct",
      "equipment": "CPW03",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-04",
      "monthKey": "Oct",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-05",
      "monthKey": "Oct",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-06",
      "monthKey": "Oct",
      "equipment": "CPW01",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-06",
      "monthKey": "Oct",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-10",
      "monthKey": "Oct",
      "equipment": "CPW04",
      "model": "J420",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-10",
      "monthKey": "Oct",
      "equipment": "CPW05",
      "model": "J420",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-13",
      "monthKey": "Oct",
      "equipment": "CPW11",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-13",
      "monthKey": "Oct",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-14",
      "monthKey": "Oct",
      "equipment": "CPW12",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-14",
      "monthKey": "Oct",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-15",
      "monthKey": "Oct",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-10-15",
      "monthKey": "Oct",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-19",
      "monthKey": "Oct",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-20",
      "monthKey": "Oct",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-21",
      "monthKey": "Oct",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-22",
      "monthKey": "Oct",
      "equipment": "CPW02",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-25",
      "monthKey": "Oct",
      "equipment": "MQT",
      "model": "FILTRO COALESCENTE MQT",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-10-25",
      "monthKey": "Oct",
      "equipment": "MRU",
      "model": "FILTRO COALESCENTE MRU",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-10-26",
      "monthKey": "Oct",
      "equipment": "CYC",
      "model": "FILTRO COALESCENTE COSTAYACO SIN TRATAR",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-10-27",
      "monthKey": "Oct",
      "equipment": "CPW06",
      "model": "J420",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-10-28",
      "monthKey": "Oct",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-29",
      "monthKey": "Oct",
      "equipment": "CPW12",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-29",
      "monthKey": "Oct",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-30",
      "monthKey": "Oct",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-10-30",
      "monthKey": "Oct",
      "equipment": "CPW11",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-10-30",
      "monthKey": "Oct",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-03",
      "monthKey": "Nov",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-04",
      "monthKey": "Nov",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-05",
      "monthKey": "Nov",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-07",
      "monthKey": "Nov",
      "equipment": "CPW07",
      "model": "J320",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-11-12",
      "monthKey": "Nov",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-13",
      "monthKey": "Nov",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-14",
      "monthKey": "Nov",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-11-14",
      "monthKey": "Nov",
      "equipment": "CPW12",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-14",
      "monthKey": "Nov",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-15",
      "monthKey": "Nov",
      "equipment": "CPW03",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-16",
      "monthKey": "Nov",
      "equipment": "CPW11",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-17",
      "monthKey": "Nov",
      "equipment": "CPW01",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-18",
      "monthKey": "Nov",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-19",
      "monthKey": "Nov",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-20",
      "monthKey": "Nov",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-21",
      "monthKey": "Nov",
      "equipment": "CPW04",
      "model": "J420",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-21",
      "monthKey": "Nov",
      "equipment": "CPW05",
      "model": "J420",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-11-27",
      "monthKey": "Nov",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-28",
      "monthKey": "Nov",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-29",
      "monthKey": "Nov",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-11-29",
      "monthKey": "Nov",
      "equipment": "CPW12",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-11-29",
      "monthKey": "Nov",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-12-03",
      "monthKey": "Dic",
      "equipment": "CPW02",
      "model": "J320",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-12-03",
      "monthKey": "Dic",
      "equipment": "CPW11",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-12-03",
      "monthKey": "Dic",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-12-04",
      "monthKey": "Dic",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-12-05",
      "monthKey": "Dic",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-12-07",
      "monthKey": "Dic",
      "equipment": "CPW06",
      "model": "J420",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-12-12",
      "monthKey": "Dic",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-12-13",
      "monthKey": "Dic",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-12-14",
      "monthKey": "Dic",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-12-14",
      "monthKey": "Dic",
      "equipment": "CPW12",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-12-14",
      "monthKey": "Dic",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-12-18",
      "monthKey": "Dic",
      "equipment": "CPW07",
      "model": "J320",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-12-18",
      "monthKey": "Dic",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-12-19",
      "monthKey": "Dic",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-12-20",
      "monthKey": "Dic",
      "equipment": "CPW11",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-12-20",
      "monthKey": "Dic",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-12-22",
      "monthKey": "Dic",
      "equipment": "MQT",
      "model": "FILTRO COALESCENTE MQT",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-12-22",
      "monthKey": "Dic",
      "equipment": "MRU",
      "model": "FILTRO COALESCENTE MRU",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-12-23",
      "monthKey": "Dic",
      "equipment": "CYC",
      "model": "FILTRO COALESCENTE COSTAYACO SIN TRATAR",
      "mark": "4",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-12-27",
      "monthKey": "Dic",
      "equipment": "CPW03",
      "model": "J320",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-12-27",
      "monthKey": "Dic",
      "equipment": "JINAN 01",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-12-28",
      "monthKey": "Dic",
      "equipment": "JINAN 02",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-12-29",
      "monthKey": "Dic",
      "equipment": "CPW01",
      "model": "J320",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-12-29",
      "monthKey": "Dic",
      "equipment": "CPW 10",
      "model": "600GFT",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false
    },
    {
      "date": "2026-12-29",
      "monthKey": "Dic",
      "equipment": "CPW12",
      "model": "600GFT",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-07-01",
      "monthKey": "Jul",
      "equipment": "CPW02",
      "model": "J320 - CPW02",
      "mark": "8",
      "hoursMto": 8,
      "manHours": null,
      "isRun": false
    },
    {
      "date": "2026-07-01",
      "monthKey": "Jul",
      "equipment": "CPW12",
      "model": "600GFT - CPW 12",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-01",
      "monthKey": "Jul",
      "equipment": "JINAN 01",
      "model": "600GFT - JINAN 01",
      "mark": "8",
      "hoursMto": 8,
      "manHours": null,
      "isRun": false
    },
    {
      "date": "2026-07-01",
      "monthKey": "Jul",
      "equipment": "JINAN 02",
      "model": "600GFT - JINAN 02",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-02",
      "monthKey": "Jul",
      "equipment": "CPW 10",
      "model": "600GFT - CPW 10",
      "mark": "8",
      "hoursMto": 8,
      "manHours": 16,
      "isRun": false,
      "deferredTo": "Ago"
    },
    {
      "date": "2026-07-02",
      "monthKey": "Jul",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT - CPW 10",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-03",
      "monthKey": "Jul",
      "equipment": "CPW11",
      "model": "600GFT - CPW 11",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-06",
      "monthKey": "Jul",
      "equipment": "CPW04",
      "model": "J420 - CPW04",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-06",
      "monthKey": "Jul",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-07",
      "monthKey": "Jul",
      "equipment": "CPW01",
      "model": "J320 - CPW01",
      "mark": "24",
      "hoursMto": 24,
      "manHours": 48,
      "isRun": false
    },
    {
      "date": "2026-07-07",
      "monthKey": "Jul",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-08",
      "monthKey": "Jul",
      "equipment": "CPW01",
      "model": "J320 - CPW01",
      "mark": "24",
      "hoursMto": 24,
      "manHours": 48,
      "isRun": false
    },
    {
      "date": "2026-07-08",
      "monthKey": "Jul",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-10",
      "monthKey": "Jul",
      "equipment": "CPW02",
      "model": "J320 - CPW02",
      "mark": "24",
      "hoursMto": 24,
      "manHours": 48,
      "isRun": false
    },
    {
      "date": "2026-07-11",
      "monthKey": "Jul",
      "equipment": "CPW02",
      "model": "J320 - CPW02",
      "mark": "24",
      "hoursMto": 24,
      "manHours": 48,
      "isRun": false
    },
    {
      "date": "2026-07-13",
      "monthKey": "Jul",
      "equipment": "CPW03",
      "model": "J320 - CPW03",
      "mark": "24",
      "hoursMto": 24,
      "manHours": 48,
      "isRun": false
    },
    {
      "date": "2026-07-14",
      "monthKey": "Jul",
      "equipment": "CPW01",
      "model": "J320 - CPW01",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-14",
      "monthKey": "Jul",
      "equipment": "CPW03",
      "model": "J320 - CPW03",
      "mark": "24",
      "hoursMto": 24,
      "manHours": 48,
      "isRun": false
    },
    {
      "date": "2026-07-15",
      "monthKey": "Jul",
      "equipment": "JINAN 01",
      "model": "600GFT - JINAN 01",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-16",
      "monthKey": "Jul",
      "equipment": "JINAN 01",
      "model": "600GFT - JINAN 01",
      "mark": "8",
      "hoursMto": 8,
      "manHours": null,
      "isRun": false
    },
    {
      "date": "2026-07-16",
      "monthKey": "Jul",
      "equipment": "JINAN 02",
      "model": "600GFT - JINAN 02",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-17",
      "monthKey": "Jul",
      "equipment": "JINAN 03/JN 10",
      "model": "600GFT - CPW 10",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-20",
      "monthKey": "Jul",
      "equipment": "CPW11",
      "model": "600GFT - CPW 11",
      "mark": "12",
      "hoursMto": 12,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-21",
      "monthKey": "Jul",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-22",
      "monthKey": "Jul",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-23",
      "monthKey": "Jul",
      "equipment": "CPW 10",
      "model": "600GFT - CPW 10",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-23",
      "monthKey": "Jul",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-27",
      "monthKey": "Jul",
      "equipment": "CPW12",
      "model": "600GFT - CPW 12",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-30",
      "monthKey": "Jul",
      "equipment": "CPW05",
      "model": "J420 - CPW05",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-31",
      "monthKey": "Jul",
      "equipment": "CPW 10",
      "model": "600GFT - CPW 10",
      "mark": "10",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-07-31",
      "monthKey": "Jul",
      "equipment": "JINAN 01",
      "model": "600GFT - JINAN 01",
      "mark": "8",
      "hoursMto": 8,
      "manHours": null,
      "isRun": false
    },
    {
      "date": "2026-08-05",
      "monthKey": "Ago",
      "equipment": "JINAN 02",
      "model": "600GFT - JINAN 02",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-05",
      "monthKey": "Ago",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-06",
      "monthKey": "Ago",
      "equipment": "CPW06",
      "model": "J420 - CPW06",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-06",
      "monthKey": "Ago",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-07",
      "monthKey": "Ago",
      "equipment": "CPW03",
      "model": "J320 - CPW03",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-07",
      "monthKey": "Ago",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-10",
      "monthKey": "Ago",
      "equipment": "JINAN 01",
      "model": "600GFT - JINAN 01",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-16",
      "monthKey": "Ago",
      "equipment": "CPW 10",
      "model": "600GFT - CPW 10",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-17",
      "monthKey": "Ago",
      "equipment": "CPW07",
      "model": "J320 - CPW07",
      "mark": "12.00",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-08-19",
      "monthKey": "Ago",
      "equipment": "CPW01",
      "model": "J320 - CPW01",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-20",
      "monthKey": "Ago",
      "equipment": "CPW12",
      "model": "600GFT - CPW 12",
      "mark": "12.00",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-08-20",
      "monthKey": "Ago",
      "equipment": "G 101 V",
      "model": "KTA 19",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-21",
      "monthKey": "Ago",
      "equipment": "G102 J",
      "model": "KTA 38",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-22",
      "monthKey": "Ago",
      "equipment": "G102K",
      "model": "KTA 38",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-26",
      "monthKey": "Ago",
      "equipment": "JINAN 01",
      "model": "600GFT - JINAN 01",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-26",
      "monthKey": "Ago",
      "equipment": "JINAN 02",
      "model": "600GFT - JINAN 02",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    },
    {
      "date": "2026-08-27",
      "monthKey": "Ago",
      "equipment": "MQT",
      "model": "FILTRO COALESCENTE MQT",
      "mark": "4.00",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-08-27",
      "monthKey": "Ago",
      "equipment": "MRU",
      "model": "FILTRO COALESCENTE MRU",
      "mark": "4.00",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-08-28",
      "monthKey": "Ago",
      "equipment": "CYC",
      "model": "FILTRO COALESCENTE COSTAYACO SIN TRATAR",
      "mark": "4.00",
      "hoursMto": 4,
      "manHours": 8,
      "isRun": false
    },
    {
      "date": "2026-08-30",
      "monthKey": "Ago",
      "equipment": "CPW11",
      "model": "600GFT - CPW 11",
      "mark": "12.00",
      "hoursMto": 12,
      "manHours": 24,
      "isRun": false
    },
    {
      "date": "2026-08-31",
      "monthKey": "Ago",
      "equipment": "CPW02",
      "model": "J320 - CPW02",
      "mark": "10.00",
      "hoursMto": 10,
      "manHours": 20,
      "isRun": false
    }
  ],
  "executions": [
    {
      "date": "2026-01-01",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-11",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-02",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-02",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-03",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 03/JN 10",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-03",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-04",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 I",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-04",
      "notes": "MANTENIMIENTO PREVENTIVO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-05",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 E",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "5-",
      "notes": "MANTENIMIENTO PREVENTIVO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-06",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 A",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-06",
      "notes": "MANTENIMIENTO PREVENTIVO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-07",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": null,
      "notes": "MANTENIMIENTO PREVENTIVO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-08",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW02, G102 J",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-15",
      "notes": "M6; SE CORRE MANTENIMIENTO POR PLANEACIÓN",
      "plannedManHours": 40
    },
    {
      "date": "2026-01-09",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-01-10",
      "monthKey": "Ene",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-01-11",
      "monthKey": "Ene",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-01-12",
      "monthKey": "Ene",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-01-13",
      "monthKey": "Ene",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-01-14",
      "monthKey": "Ene",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-01-15",
      "monthKey": "Ene",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-01-16",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "29-012026",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-17",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-12",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-18",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 03/JN 10",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-18",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-19",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 I",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-19",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-20",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 E",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-20",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-21",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 A",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-21",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-22",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-22",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-23",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-23",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-24",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-24",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-25",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW03",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-02-10",
      "notes": "M1 SE EJECUTA MANTENIMIENTO SE POSTERGA POR NO CUMPLIMIENTO DE HORAS OPERATIVAS",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-26",
      "monthKey": "Ene",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-01-27",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-01-27",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-01-28",
      "monthKey": "Ene",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-01-29",
      "monthKey": "Ene",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-01-30",
      "monthKey": "Ene",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-01-31",
      "monthKey": "Ene",
      "programmed": true,
      "programmedLabel": "SI",
      "equipment": "JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "EJECUTADO",
      "executionDate": "2026-01-29",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-02-01",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-02-01",
      "notes": "M2: SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 0
    },
    {
      "date": "2026-02-02",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 03/JN 10",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-02-02",
      "notes": "M2: SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-02-03",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 I",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-02-04",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 E",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-02-05",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 A",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-02-05",
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-02-06",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-02-07",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-02-08",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-02-09",
      "monthKey": "Feb",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-02-10",
      "monthKey": "Feb",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-02-11",
      "monthKey": "Feb",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-02-12",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-02-12",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-02-13",
      "monthKey": "Feb",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-02-14",
      "monthKey": "Feb",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-02-15",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-02-15",
      "notes": "M1 SE EJECUTA MANTENIMIENTO, SE POSTERGA POR QUE NO CUMPLE MANTENIMIENTO POR STAND BY",
      "plannedManHours": 20
    },
    {
      "date": "2026-02-16",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": "NO SE EJECUTA MANTENIMIENTO PREVENTIVO EN STAND BY",
      "plannedManHours": 20
    },
    {
      "date": "2026-02-17",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 03/JN 10",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-02-17",
      "notes": "M2: SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-02-18",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 I, CYC",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-02-19",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 E",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-02-20",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 A",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-02-20",
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-02-21",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-02-22",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-02-23",
      "monthKey": "Feb",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-02-24",
      "monthKey": "Feb",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-02-25",
      "monthKey": "Feb",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-02-26",
      "monthKey": "Feb",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-02-27",
      "monthKey": "Feb",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-02-28",
      "monthKey": "Feb",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-03-01",
      "monthKey": "Mar",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-03-02",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-03-01",
      "notes": "M1 SE EJECUTA MANTENIMIENTO, SE POSTERGA POR QUE NO CUMPLE MANTENIMIENTO POR STAND BY",
      "plannedManHours": 20
    },
    {
      "date": "2026-03-03",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-03-03",
      "notes": "SE EJECUTA MANTENIMIENTO M1",
      "plannedManHours": 20
    },
    {
      "date": "2026-03-04",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 03/JN 10",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-03-13",
      "notes": "SE EJECUTA MANTENIMIENTO M1",
      "plannedManHours": 20
    },
    {
      "date": "2026-03-05",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 I",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-03-06",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 E",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-03-07",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 A",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-03-07",
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-03-08",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW03, G 101 V",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-03-24",
      "notes": "SE CORRE CRONOGRAMA POR NUMERO DE HORAS OPERATIVO",
      "plannedManHours": 40
    },
    {
      "date": "2026-03-09",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-03-10",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW01, G102K, SWG",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-03-25",
      "notes": "M7 SE EJECUTA EN ESTA FECHA POR HORAS DE PARADA",
      "plannedManHours": 40
    },
    {
      "date": "2026-03-11",
      "monthKey": "Mar",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-03-12",
      "monthKey": "Mar",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-03-13",
      "monthKey": "Mar",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-03-14",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW04 , CPW05",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "7/03/2026 3-03-2026",
      "notes": "MO, SE ADELANTA MANTENIMIENTO POR CAMBIO DE ACEITE M0 SE ADELANTA MANTENIMIENTO POR CAMBIO DE ACEITE",
      "plannedManHours": 40
    },
    {
      "date": "2026-03-15",
      "monthKey": "Mar",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-03-16",
      "monthKey": "Mar",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-03-17",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-03-11",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-03-18",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-03-18",
      "notes": "SE EJECUTA MANTENIMIENTO M2",
      "plannedManHours": 20
    },
    {
      "date": "2026-03-19",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 03/JN 10",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": "NO CUMPLE HORAS DE MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-03-20",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 I",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-03-21",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 E",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-03-22",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 A",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-03-22",
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-03-23",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-03-24",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-03-25",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-03-26",
      "monthKey": "Mar",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-03-26",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-03-27",
      "monthKey": "Mar",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-03-28",
      "monthKey": "Mar",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-03-29",
      "monthKey": "Mar",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-03-30",
      "monthKey": "Mar",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-03-31",
      "monthKey": "Mar",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-04-01",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-03-30",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-04-02",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-04-01",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-04-03",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW 10, JINAN 03/JN 10",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-04-06",
      "notes": "M1 SE EJECUTA MANTENIMIENTO//SE POSTERGA POR QUE NO CUMPLE HORAS DE MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-04-04",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 I",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-04-05",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 E",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-04-06",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 A",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-04-06",
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-04-07",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-04-08",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-04-09",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-04-10",
      "monthKey": "Abr",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-04-11",
      "monthKey": "Abr",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-04-12",
      "monthKey": "Abr",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-04-13",
      "monthKey": "Abr",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-04-14",
      "monthKey": "Abr",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-04-15",
      "monthKey": "Abr",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-04-16",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-04-20",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-04-17",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-04-22",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-04-18",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW 10, JINAN 03/JN 10",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-04-18",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-04-19",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW03, G 102 I",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-04-19",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 40
    },
    {
      "date": "2026-04-20",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 E",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-04-21",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW01, G 102 A",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-04-26",
      "notes": "M1 SE CORRE FECHA POR QUE NO CUMPLE HORAS DE MTO",
      "plannedManHours": 40
    },
    {
      "date": "2026-04-22",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-04-23",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-04-24",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-04-25",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW04 , CPW05",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "16/04/2026 15/04/2026",
      "notes": "M2 SE POSTERGA DEBIDO QUE NO CUMPLE HORAS DE MANTENIMIETO M1 SE POSTERGA MANTENIMIENTO NO CUMPLE HORAS OPERATIVAS",
      "plannedManHours": 40
    },
    {
      "date": "2026-04-26",
      "monthKey": "Abr",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-04-27",
      "monthKey": "Abr",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-04-28",
      "monthKey": "Abr",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-04-29",
      "monthKey": "Abr",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CYC",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-04-30",
      "monthKey": "Abr",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "MQT, MRU",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-01",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-05-06",
      "notes": "M1 SE EJECUTA MANTENIMIENTO PREVENTIVO",
      "plannedManHours": 20
    },
    {
      "date": "2026-05-02",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-05-06",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-05-03",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW 10, JINAN 03/JN 10",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-04-30",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-05-04",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 I",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-05-05",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 E",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-05-06",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 102 A",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-05-06",
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-05-07",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW02, G 101 V",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-05-05",
      "notes": "M7 SE EJECUTA EN ESTA FECHA POR HORAS DE PARADA",
      "plannedManHours": 36
    },
    {
      "date": "2026-05-08",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-05-09",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-05-10",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-11",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-12",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-13",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "CPW06",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-14",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-15",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-16",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-05-16",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-05-17",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-05-27",
      "notes": "M6 SE POSTERGA POR QUE NO CUMPLE CON LAS HORAS OPERATIVAS",
      "plannedManHours": 20
    },
    {
      "date": "2026-05-18",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW 10, JINAN 03/JN 10",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-05-25",
      "notes": "M1 SE ADELANTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-05-19",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-20",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW06",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-05-20",
      "notes": "SE EJECUTA M0",
      "plannedManHours": 20
    },
    {
      "date": "2026-05-21",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-22",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-05-23",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-05-24",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-05-25",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "CPW07",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-26",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-27",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-28",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-29",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-30",
      "monthKey": "May",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-05-31",
      "monthKey": "May",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW03, JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-06-08",
      "notes": "SE POSTERGA MANTENIMIENTO, NO CUMPLE HORAS DE OPERACIÓN",
      "plannedManHours": 44
    },
    {
      "date": "2026-06-01",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": "no cumple horas de mantenimiento",
      "plannedManHours": 20
    },
    {
      "date": "2026-06-02",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW01, CPW 10, JINAN 03/JN 10",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "3/06/2026 7-06-2026",
      "notes": "SE CORRE UN DIA POR PLANEACIÓN M1 SE ADELANTA MANTENIMIENTO POR OPORTUNIDAD",
      "plannedManHours": 44
    },
    {
      "date": "2026-06-03",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-04",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-05",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-06",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW04 , CPW05, G 101 V",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "30/05/2026 22/05/2026",
      "notes": "M1 : SE ADELANTA MANTENIMIENTO",
      "plannedManHours": 60
    },
    {
      "date": "2026-06-07",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-06-08",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-06-09",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-10",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-11",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "CPW11",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-12",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "CPW12",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-13",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-14",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-15",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-06-03",
      "notes": "M6: SE CORRE MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-06-16",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-06-10",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-06-17",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW 10, JINAN 03/JN 10",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-06-24",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-06-18",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-06-16",
      "notes": "M2 Se corre por aprovechamiento por parada",
      "plannedManHours": 24
    },
    {
      "date": "2026-06-19",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-20",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-21",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-06-22",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW05, G102 J",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-06-22",
      "notes": "M2 Se ejecuta mantenimiento",
      "plannedManHours": 40
    },
    {
      "date": "2026-06-23",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW06, G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 44
    },
    {
      "date": "2026-06-24",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW07",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-06-23",
      "notes": "MO SE EJECUTA CAMBIO DE ACEITE",
      "plannedManHours": 20
    },
    {
      "date": "2026-06-25",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CYC",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-26",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-27",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-28",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-29",
      "monthKey": "Jun",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-06-30",
      "monthKey": "Jun",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-06-17",
      "notes": "M1 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-09-01",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-02",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-03",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-04",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-09-05",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-09-06",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-09-07",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-08",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-09",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW11",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-10",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW02",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-09-11",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-12",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-13",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-09-14",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW12, JINAN 02",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-09-15",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW06, CPW 10, JINAN 03/JN 10",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 44
    },
    {
      "date": "2026-09-16",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-17",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-18",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-19",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-09-20",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-09-21",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-09-22",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-23",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-24",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-25",
      "monthKey": "Sep",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-26",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW11",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-09-27",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW07",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 24
    },
    {
      "date": "2026-09-28",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-09-29",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW12, JINAN 02",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-09-30",
      "monthKey": "Sep",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW 10, JINAN 03/JN 10",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-10-01",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-02",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-03",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-04",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW03, G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 40
    },
    {
      "date": "2026-10-05",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-10-06",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW01, G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 40
    },
    {
      "date": "2026-10-07",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-08",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-09",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-10",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW04 , CPW05",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 40
    },
    {
      "date": "2026-10-11",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-12",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-13",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW11, JINAN 01",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-10-14",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW12, JINAN 02",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-10-15",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW 10, JINAN 03/JN 10",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-10-16",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-17",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-18",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-19",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-10-20",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-10-21",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-10-22",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW02",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-10-23",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-24",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-25",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "MQT, MRU",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-26",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CYC",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-10-27",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW06",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 24
    },
    {
      "date": "2026-10-28",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-10-29",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW12, JINAN 02",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-10-30",
      "monthKey": "Oct",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW 10, CPW11, JINAN 03/JN 10",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-10-31",
      "monthKey": "Oct",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-01",
      "monthKey": "Nov",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-02",
      "monthKey": "Nov",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-03",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-11-04",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-11-05",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-11-06",
      "monthKey": "Nov",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-07",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW07",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 24
    },
    {
      "date": "2026-11-08",
      "monthKey": "Nov",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-09",
      "monthKey": "Nov",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-10",
      "monthKey": "Nov",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-11",
      "monthKey": "Nov",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-12",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-11-13",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW12, JINAN 02",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-11-14",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW 10, JINAN 03/JN 10",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-11-15",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW03",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-11-16",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW11",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-17",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW01",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-11-18",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-11-19",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-11-20",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-11-21",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW04 , CPW05",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 36
    },
    {
      "date": "2026-11-22",
      "monthKey": "Nov",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-23",
      "monthKey": "Nov",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-24",
      "monthKey": "Nov",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-25",
      "monthKey": "Nov",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-26",
      "monthKey": "Nov",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-11-27",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-11-28",
      "monthKey": "Nov",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW12, JINAN 02",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-11-30",
      "monthKey": "Nov",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-01",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-02",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-03",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW02, CPW11, G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 40
    },
    {
      "date": "2026-12-04",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-12-05",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-12-06",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-07",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW06",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 24
    },
    {
      "date": "2026-12-08",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-09",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-10",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-11",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-12",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-12-13",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-12-14",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW 10, CPW12, JINAN 03/JN 10",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-12-15",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-16",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-17",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-18",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW07, G 101 V",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 44
    },
    {
      "date": "2026-12-19",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-12-20",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW11, G102K",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-12-21",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-22",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "MQT, MRU",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-23",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CYC",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-24",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-25",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-26",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-27",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW03, JINAN 01",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 32
    },
    {
      "date": "2026-12-28",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 02",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 16
    },
    {
      "date": "2026-12-29",
      "monthKey": "Dic",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW01, CPW 10, CPW12",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 16
    },
    {
      "date": "2026-12-30",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-12-31",
      "monthKey": "Dic",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-07-01",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW02 , CPW12, JINAN 01, JINAN 02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "1-07-2026 5/07/2026",
      "notes": "SE EJECUTA MANTENIMIENTO M0 SE EJECUTA MANTENIMIENTO M2(JINAN 02 SE APLAZA POR CIERRE DE VIA VUELTA CICLÍSTICA Y SE EJECUTA EL DOMINGO)",
      "plannedManHours": 20
    },
    {
      "date": "2026-07-02",
      "monthKey": "Jul",
      "programmed": false,
      "programmedLabel": "Diferido",
      "equipment": "CPW 10",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "Diferido a agosto · sin 350 h OP",
      "executionDate": null,
      "notes": "NO CUMPLE HORAS DE MANTENIMIENTO, ESQUIPO ESTUVO EN STAND BY · Reprogramado a agosto: periodicidad 350 h de operación; equipo en stand-by.",
      "plannedManHours": 20
    },
    {
      "date": "2026-07-03",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW11",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-02",
      "notes": "SE REALIZA UN M0 CAMBIO DE ACEITE , SE CORRE FECHA POR CRONOGRAMA",
      "plannedManHours": 0
    },
    {
      "date": "2026-07-04",
      "monthKey": "Jul",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-07-05",
      "monthKey": "Jul",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-07-06",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW04 , G 101 V",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-06",
      "notes": "SE EJECUTA MANTENIMIENTO M2",
      "plannedManHours": 40
    },
    {
      "date": "2026-07-07",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW01, G102 J",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-07",
      "notes": "DESCARBONIZACIÓN DEL EQUIPO",
      "plannedManHours": 68
    },
    {
      "date": "2026-07-08",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW01, G102K",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-08",
      "notes": "DESCARBONIZACIÓN DEL EQUIPO",
      "plannedManHours": 68
    },
    {
      "date": "2026-07-09",
      "monthKey": "Jul",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-07-10",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-10",
      "notes": "DESCARBONIZACIÓN DEL EQUIPO",
      "plannedManHours": 48
    },
    {
      "date": "2026-07-11",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-11",
      "notes": "DESCARBONIZACIÓN DEL EQUIPO",
      "plannedManHours": 48
    },
    {
      "date": "2026-07-12",
      "monthKey": "Jul",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": true,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": "2026-07-13",
      "notes": "SE CORRE DIA DE MANTENIMIENTO",
      "plannedManHours": 0
    },
    {
      "date": "2026-07-13",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW03",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-13",
      "notes": "SE REALIZA MANTENIMIENTO POR CAMBIO DE CONTROL AGC 4 M10",
      "plannedManHours": 48
    },
    {
      "date": "2026-07-14",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW01, CPW03",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-14",
      "notes": "SE REALIZA MANTENIMIENTO POR CAMBIO DE CONTROL AGC 4 M10",
      "plannedManHours": 68
    },
    {
      "date": "2026-07-15",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-03",
      "notes": "M2 Se ejecuta mantenimiento",
      "plannedManHours": 20
    },
    {
      "date": "2026-07-16",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 01, JINAN 02",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-21",
      "notes": "SE PROGRAM MANTENIMIENTO M1//SE POSTERGA MANTENIMIENTO, NO CUMPLE CON HORAS DE MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-07-17",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "JINAN 03/JN 10",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-15",
      "notes": "M2 SE EJECUTA MANTENIMIENTO.",
      "plannedManHours": 20
    },
    {
      "date": "2026-07-18",
      "monthKey": "Jul",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-07-19",
      "monthKey": "Jul",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-07-20",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW11",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-07-21",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G 101 V",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-10-21",
      "notes": "EQUIPO PERMANECE EN STAND BY",
      "plannedManHours": 20
    },
    {
      "date": "2026-07-22",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "G102 J",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-22",
      "notes": "SE EJECUTA MANTENIMIENTO M1",
      "plannedManHours": 20
    },
    {
      "date": "2026-07-23",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW 10, G102K",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-07-24",
      "monthKey": "Jul",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-07-25",
      "monthKey": "Jul",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-07-26",
      "monthKey": "Jul",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-07-27",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW12",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-27",
      "notes": "SE REALIZA MANTENIMIENTO PREVEVENTIVO M1",
      "plannedManHours": 0
    },
    {
      "date": "2026-07-28",
      "monthKey": "Jul",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-07-29",
      "monthKey": "Jul",
      "programmed": false,
      "programmedLabel": "No",
      "equipment": "—",
      "executed": false,
      "status": "no_aplica",
      "statusLabel": "No aplica",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-07-30",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW05",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-30",
      "notes": "M10 SE ADELANTA MANTENIMIENTO PREVENTIVO POR CUMPLIMIENTO DE HORAS M3 SE EJECUTA MANTENIMIENTO",
      "plannedManHours": 20
    },
    {
      "date": "2026-07-31",
      "monthKey": "Jul",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW 10, JINAN 01",
      "executed": true,
      "status": "ejecutado",
      "statusLabel": "Ejecutado",
      "executionDate": "2026-07-31",
      "notes": "SE EJECUTA MANTENIMIENTO M3",
      "plannedManHours": 0
    },
    {
      "date": "2026-08-03",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "—",
      "equipment": "Sí",
      "executed": false,
      "status": "otro",
      "statusLabel": "03/08/2026",
      "executionDate": "SE EJECUTA M5",
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-08-04",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "—",
      "equipment": "Sí",
      "executed": false,
      "status": "otro",
      "statusLabel": "07/08/2026",
      "executionDate": "FALTA DE PERMISOS DE TRABAJO, SE REPROGRAMA MANTENIMIENTO M2",
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-08-05",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "JINAN 02, G 101 V",
      "equipment": "No",
      "executed": false,
      "status": "sin_dato",
      "statusLabel": "—",
      "executionDate": "FALTA DE PERMISOS DE TRABAJO, SE REPROGRAMA MANTENIMIENTO M2",
      "notes": null,
      "plannedManHours": 40
    },
    {
      "date": "2026-08-06",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "CPW06, G102 J",
      "equipment": "Sí",
      "executed": false,
      "status": "otro",
      "statusLabel": "06/08/2026",
      "executionDate": "M1 CAMBIO DE ACEITE Y FILTROS",
      "notes": null,
      "plannedManHours": 40
    },
    {
      "date": "2026-08-07",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "CPW03, G102K",
      "equipment": "Sí",
      "executed": false,
      "status": "otro",
      "statusLabel": "07/08/2026",
      "executionDate": "M2 SE REALIZA MANTENIMIENTO PREVENTIVO",
      "notes": null,
      "plannedManHours": 40
    },
    {
      "date": "2026-08-08",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "—",
      "equipment": "No",
      "executed": false,
      "status": "sin_dato",
      "statusLabel": "—",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-08-10",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "JINAN 01",
      "equipment": "JINAN 01",
      "executed": false,
      "status": "sin_dato",
      "statusLabel": "—",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-08-15",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "—",
      "equipment": "No",
      "executed": false,
      "status": "otro",
      "statusLabel": "-",
      "executionDate": "EQUIPO EN STAND BY",
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-08-16",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "CPW 10",
      "equipment": "Sí",
      "executed": false,
      "status": "otro",
      "statusLabel": "18/08/2026",
      "executionDate": "SE EJECUTA MANTENIMIENTO PREVENTIVO",
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-08-17",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "CPW07",
      "equipment": "Sí",
      "executed": false,
      "status": "otro",
      "statusLabel": "17/08/2026",
      "executionDate": "SE POSTERGA MANTENIMIENTO DEBIDO A MANTENIMIENTO EN LA TURBINA",
      "notes": null,
      "plannedManHours": 24
    },
    {
      "date": "2026-08-19",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "CPW01",
      "equipment": "No",
      "executed": false,
      "status": "sin_dato",
      "statusLabel": "—",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-08-20",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "CPW12, G 101 V",
      "equipment": "Sí",
      "executed": false,
      "status": "otro",
      "statusLabel": "20/08/2026",
      "executionDate": "SE REALIZA MANTENIMIENTO PREVENTIVO PROGRAMADO EQUIPO DIESEL EN STAND BY",
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-08-21",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "G102 J",
      "equipment": "No",
      "executed": false,
      "status": "sin_dato",
      "statusLabel": "—",
      "executionDate": "NO CUMPLE HORAS DE MANTENIMIENTO, ESQUIPO ESTUVO EN STAND BY",
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-08-22",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "G102K",
      "equipment": "No",
      "executed": false,
      "status": "sin_dato",
      "statusLabel": "—",
      "executionDate": "NO CUMPLE HORAS DE MANTENIMIENTO, ESQUIPO ESTUVO EN STAND BY",
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-08-23",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "—",
      "equipment": "Sí",
      "executed": false,
      "status": "sin_dato",
      "statusLabel": "—",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-08-25",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "—",
      "equipment": "Sí",
      "executed": false,
      "status": "sin_dato",
      "statusLabel": "—",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-08-26",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "JINAN 01, JINAN 02",
      "equipment": "Sí",
      "executed": false,
      "status": "sin_dato",
      "statusLabel": "—",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 40
    },
    {
      "date": "2026-08-28",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "CYC",
      "equipment": "No",
      "executed": false,
      "status": "sin_dato",
      "statusLabel": "—",
      "executionDate": "SE APLAZA MANTENIMIENTO",
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-08-30",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "CPW11",
      "equipment": "CPW11",
      "executed": false,
      "status": "sin_dato",
      "statusLabel": "—",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 0
    },
    {
      "date": "2026-08-31",
      "monthKey": "Ago",
      "programmed": false,
      "programmedLabel": "CPW02",
      "equipment": "CPW02",
      "executed": false,
      "status": "sin_dato",
      "statusLabel": "—",
      "executionDate": null,
      "notes": null,
      "plannedManHours": 20
    },
    {
      "date": "2026-08-01",
      "monthKey": "Ago",
      "programmed": true,
      "programmedLabel": "Sí",
      "equipment": "CPW 10",
      "executed": false,
      "status": "pendiente",
      "statusLabel": "Programado pendiente",
      "executionDate": null,
      "notes": "Incluye MTO diferido de 2026-07-02 (CPW 10): no cumplía 350 h OP (stand-by).",
      "plannedManHours": 20
    }
  ]
};
