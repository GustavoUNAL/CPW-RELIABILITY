/** Planeación semanal Costayaco · 31 ago – 6 sep 2026. Fuente: data/Agosto PDF. */

export type WeeklyPlanningJob = {
  date: string;
  weekday: string;
  equipment: string;
  code: string;
  hours: number;
  focus: string;
};

export const AGOSTO_WEEKLY_PLANNING = {
  sourceFile: "data/Agosto/PLANEACION MANTENIMIENTOS SEMANA DEL 31 AL 6 SEP 2026.pdf",
  title: "Planeación semanal de mantenimiento Costayaco",
  periodLabel: "31 de agosto – 6 de septiembre 2026",
  elaboratedBy: "Juan Carlos Pabón",
  reviewedBy: "Robinson Pulido",
  reviewedAt: "2026-08-27",
  approvedBy: "David Cornejo",
  note:
    "El mantenimiento de G101V, G102J, G102K y Jinan 10/11/12 (Costayaco) y Jinan 1/2 (Vonú) solo se ejecuta si el equipo cumple 350 h de operación.",
  jobs: [
    {
      date: "2026-08-31",
      weekday: "Lunes",
      equipment: "CPW02",
      code: "M8",
      hours: 12,
      focus:
        "Calibración de válvulas de admisión y escape, varillas de empuje, cambio de aceite y filtros, limpieza general, radiador, baterías y filtro de gas.",
    },
    {
      date: "2026-09-03",
      weekday: "Jueves",
      equipment: "JIN-10",
      code: "M5",
      hours: 12,
      focus:
        "Calibración de válvulas, varillas de empuje, limpieza general, filtro centrífugo, aire, radiador, baterías y filtro de gas.",
    },
    {
      date: "2026-09-04",
      weekday: "Viernes",
      equipment: "JIN-01",
      code: "M4",
      hours: 12,
      focus:
        "Calibración de válvulas, varillas de empuje, limpieza general, filtro centrífugo, aire, radiador, baterías y filtro de gas.",
    },
  ] satisfies WeeklyPlanningJob[],
};

export function informeMonthCoverage(month: string) {
  const hasGte = month !== "Ago";
  const hasConcertacion = month === "May" || month === "Jun" || month === "Jul" || month === "Ago";
  const hasGas = month === "Jun" || month === "Jul";
  const hasRca = month === "Jun" || month === "Jul";
  const hasMaintenance = true;
  return {
    month,
    hasGte,
    hasConcertacion,
    hasGas,
    hasRca,
    hasMaintenance,
    operationalReady: hasGte && hasConcertacion,
    pendingSources:
      month === "Ago"
        ? [
            "Data Soporte GTE (disponibilidad y generación oficiales del mes completo)",
            "FO-GE-033 / RCA del mes",
            "Cromatografía y totalizador Moqueta de agosto (la hoja «Agosto 2026» trae fechas de abril)",
          ]
        : [],
  };
}
