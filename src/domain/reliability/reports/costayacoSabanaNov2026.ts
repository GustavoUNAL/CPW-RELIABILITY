/** Sábana Costayaco noviembre 2026 · calendario anual + planificación semanal 16–22. */
export type SabanaPriority = "Alta" | "Media";

export type SabanaTask = { text: string; priority: SabanaPriority };

export type SabanaSlot = {
  equipment: string;
  hoursMto: number | null;
  manHours: number | null;
};

export type SabanaDay = {
  date: string;
  weekday: string;
  totalManHours: number;
  slots: SabanaSlot[];
};

export type SabanaWeekJob = {
  equipment: string;
  code: string;
  fuel: string;
  tasks: SabanaTask[];
  tools: string[];
  available: string[];
};

export type SabanaWeekPlan = {
  label: string;
  start: string;
  end: string;
  elaboratedBy: string;
  reviewedBy: string;
  approvedBy: string;
  reviewedAt: string;
  shiftHours: string;
  durationHours: number;
  jobs: SabanaWeekJob[];
  note: string;
};

export type CostayacoSabanaNov = {
  sourceSabana: string;
  sourceWeek: string;
  title: string;
  monthKey: string;
  monthLabel: string;
  programmedCount: number;
  plannedHoursMto: number;
  plannedManHours: number;
  busyDays: number;
  equipmentStats: { equipment: string; count: number; hoursMto: number; manHours: number }[];
  days: SabanaDay[];
  weekPlan: SabanaWeekPlan;
};

export const COSTAYACO_SABANA_NOV: CostayacoSabanaNov = {"sourceSabana": "data/Costayaco/Mantenimiento/sabana/SABANA MMTOS GEN PUTUMAYO 1 (1) - copia (1).xlsx", "sourceWeek": "data/Costayaco/Mantenimiento/sabana/2026-11/vite.config.pdf", "title": "Sábana de mantenimientos · Costayaco · noviembre 2026", "monthKey": "Nov", "monthLabel": "Noviembre 2026", "programmedCount": 16, "plannedHoursMto": 162.0, "plannedManHours": 312.0, "busyDays": 11, "equipmentStats": [{"equipment": "CPW10", "count": 2, "hoursMto": 16.0, "manHours": 32.0}, {"equipment": "CPW12", "count": 2, "hoursMto": 24.0, "manHours": 40.0}, {"equipment": "JINAN01", "count": 2, "hoursMto": 20.0, "manHours": 40.0}, {"equipment": "JINAN02", "count": 2, "hoursMto": 20.0, "manHours": 40.0}, {"equipment": "JINAN10", "count": 2, "hoursMto": 20.0, "manHours": 40.0}, {"equipment": "CPW01", "count": 1, "hoursMto": 10.0, "manHours": 20.0}, {"equipment": "CPW03", "count": 1, "hoursMto": 10.0, "manHours": 20.0}, {"equipment": "CPW04", "count": 1, "hoursMto": 10.0, "manHours": 20.0}, {"equipment": "CPW05", "count": 1, "hoursMto": 8.0, "manHours": 16.0}, {"equipment": "CPW07", "count": 1, "hoursMto": 12.0, "manHours": 24.0}, {"equipment": "CPW11", "count": 1, "hoursMto": 12.0, "manHours": 20.0}], "days": [{"date": "2026-11-01", "weekday": "Domingo", "totalManHours": 0.0, "slots": []}, {"date": "2026-11-02", "weekday": "Lunes", "totalManHours": 0.0, "slots": []}, {"date": "2026-11-03", "weekday": "Martes", "totalManHours": 20.0, "slots": []}, {"date": "2026-11-04", "weekday": "Miércoles", "totalManHours": 20.0, "slots": []}, {"date": "2026-11-05", "weekday": "Jueves", "totalManHours": 20.0, "slots": []}, {"date": "2026-11-06", "weekday": "Viernes", "totalManHours": 0.0, "slots": []}, {"date": "2026-11-07", "weekday": "Sábado", "totalManHours": 24.0, "slots": [{"equipment": "CPW07", "hoursMto": 12.0, "manHours": 24.0}]}, {"date": "2026-11-08", "weekday": "Domingo", "totalManHours": 0.0, "slots": []}, {"date": "2026-11-09", "weekday": "Lunes", "totalManHours": 0.0, "slots": []}, {"date": "2026-11-10", "weekday": "Martes", "totalManHours": 0.0, "slots": []}, {"date": "2026-11-11", "weekday": "Miércoles", "totalManHours": 0.0, "slots": []}, {"date": "2026-11-12", "weekday": "Jueves", "totalManHours": 20.0, "slots": [{"equipment": "JINAN01", "hoursMto": 10.0, "manHours": 20.0}]}, {"date": "2026-11-13", "weekday": "Viernes", "totalManHours": 20.0, "slots": [{"equipment": "JINAN02", "hoursMto": 10.0, "manHours": 20.0}]}, {"date": "2026-11-14", "weekday": "Sábado", "totalManHours": 20.0, "slots": [{"equipment": "CPW10", "hoursMto": 8.0, "manHours": 16.0}, {"equipment": "CPW12", "hoursMto": 12.0, "manHours": 20.0}, {"equipment": "JINAN10", "hoursMto": 10.0, "manHours": 20.0}]}, {"date": "2026-11-15", "weekday": "Domingo", "totalManHours": 20.0, "slots": [{"equipment": "CPW03", "hoursMto": 10.0, "manHours": 20.0}]}, {"date": "2026-11-16", "weekday": "Lunes", "totalManHours": 0.0, "slots": [{"equipment": "CPW11", "hoursMto": 12.0, "manHours": 20.0}]}, {"date": "2026-11-17", "weekday": "Martes", "totalManHours": 20.0, "slots": [{"equipment": "CPW01", "hoursMto": 10.0, "manHours": 20.0}]}, {"date": "2026-11-18", "weekday": "Miércoles", "totalManHours": 20.0, "slots": []}, {"date": "2026-11-19", "weekday": "Jueves", "totalManHours": 20.0, "slots": []}, {"date": "2026-11-20", "weekday": "Viernes", "totalManHours": 20.0, "slots": []}, {"date": "2026-11-21", "weekday": "Sábado", "totalManHours": 36.0, "slots": [{"equipment": "CPW04", "hoursMto": 10.0, "manHours": 20.0}, {"equipment": "CPW05", "hoursMto": 8.0, "manHours": 16.0}]}, {"date": "2026-11-22", "weekday": "Domingo", "totalManHours": 0.0, "slots": []}, {"date": "2026-11-23", "weekday": "Lunes", "totalManHours": 0.0, "slots": []}, {"date": "2026-11-24", "weekday": "Martes", "totalManHours": 0.0, "slots": []}, {"date": "2026-11-25", "weekday": "Miércoles", "totalManHours": 0.0, "slots": []}, {"date": "2026-11-26", "weekday": "Jueves", "totalManHours": 0.0, "slots": []}, {"date": "2026-11-27", "weekday": "Viernes", "totalManHours": 20.0, "slots": [{"equipment": "JINAN01", "hoursMto": 10.0, "manHours": 20.0}]}, {"date": "2026-11-28", "weekday": "Sábado", "totalManHours": 20.0, "slots": [{"equipment": "JINAN02", "hoursMto": 10.0, "manHours": 20.0}]}, {"date": "2026-11-29", "weekday": "Domingo", "totalManHours": 20.0, "slots": [{"equipment": "CPW10", "hoursMto": 8.0, "manHours": 16.0}, {"equipment": "CPW12", "hoursMto": 12.0, "manHours": 20.0}, {"equipment": "JINAN10", "hoursMto": 10.0, "manHours": 20.0}]}, {"date": "2026-11-30", "weekday": "Lunes", "totalManHours": 0.0, "slots": []}], "weekPlan": {"label": "Semana del 16 al 22 de noviembre de 2026", "start": "2026-11-16", "end": "2026-11-22", "elaboratedBy": "Robinson Salón Pulido", "reviewedBy": "Robinson Salón Pulido", "approvedBy": "David Cornejo", "reviewedAt": "2026-08-10", "shiftHours": "8:00 – 18:00", "durationHours": 12, "jobs": [{"equipment": "CPW06", "code": "M1", "fuel": "Generación a gas", "tasks": [{"text": "Calibración y metrología de válvulas de admisión y escape", "priority": "Alta"}, {"text": "Revisión de varillas de empuje y calibración de puentes basculantes", "priority": "Alta"}, {"text": "Limpieza de filtro centrífugo y filtro de aire", "priority": "Alta"}, {"text": "Completar y verificar niveles de aceite y refrigerante", "priority": "Alta"}, {"text": "Limpieza general, cabina y taller (registro fotográfico)", "priority": "Media"}, {"text": "Limpieza de rejillas de alternador", "priority": "Media"}, {"text": "Lavado de radiador", "priority": "Media"}, {"text": "Lavado y limpieza de extractores y cabina", "priority": "Media"}], "tools": ["Juego de galgas", "Llaves mixtas mm", "Estuche de copas mm", "Juego de destornilladores", "Torquímetro", "Base de medir recesión valvular", "Pinza amperimétrica / multímetro digital", "Profundímetro", "Ecom · diferencial de presión", "Densímetro para baterías"], "available": ["CPW01", "CPW02", "CPW03", "CPW04", "CPW05", "CPW07", "CPW10", "CPW11", "CPW12", "JINAN01", "JINAN02"]}, {"equipment": "JINAN01", "code": "M1", "fuel": "Generación a gas", "tasks": [{"text": "Calibración y metrología de válvulas de admisión y escape", "priority": "Alta"}, {"text": "Revisión de varillas de empuje y calibración de puentes basculantes", "priority": "Alta"}, {"text": "Limpieza de filtro centrífugo y filtro de aire", "priority": "Alta"}, {"text": "Completar y verificar niveles de aceite y refrigerante", "priority": "Alta"}, {"text": "Limpieza general, cabina y taller (registro fotográfico)", "priority": "Media"}, {"text": "Limpieza de rejillas de alternador", "priority": "Media"}, {"text": "Lavado de radiador", "priority": "Media"}, {"text": "Lavado y limpieza de extractores y cabina", "priority": "Media"}], "tools": ["Juego de galgas", "Llaves mixtas mm", "Estuche de copas mm", "Juego de destornilladores", "Torquímetro", "Base de medir recesión valvular", "Pinza amperimétrica / multímetro digital", "Profundímetro", "Ecom · diferencial de presión", "Densímetro para baterías"], "available": ["CPW01", "CPW02", "CPW03", "CPW04", "CPW05", "CPW06", "CPW07", "CPW10", "CPW11", "CPW12", "JINAN02"]}], "note": "El mantenimiento de JINAN10, JINAN11, JINAN12, JINAN01 de Vonú y JINAN02 de Vonú solo se lleva a cabo si cumplen 350 horas de operación."}};
