import type { ReportKey } from "../types";

export type PlanStatus = "Pendiente" | "En ejecución" | "En validación" | "Cerrado" | "Cancelado";
export type ActionStatus = "Pendiente" | "En ejecución" | "Completada" | "Cancelada";
export type ActionType =
  | "Correctiva"
  | "Preventiva"
  | "Predictiva"
  | "Inspección"
  | "Ingeniería"
  | "Operacional"
  | "Capacitación"
  | "Cambio de Procedimiento";
export type Effectiveness = "Sí" | "No" | "Parcialmente" | "";

export type PlanAction = {
  id: string;
  description: string;
  type: ActionType;
  status: ActionStatus;
  responsible: string;
  dueDate: string;
  completedDate: string | null;
  evidence: string;
  comments: string;
};

export type PlanRow = {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  linkedAssets: string[];
  linkedEvents: string[];
  field: string;
  priority: string;
  impactIndex: number;
  risk: string;
  problem: string;
  rootCause: string;
  category: string;
  responsible: string;
  company: string;
  status: PlanStatus;
  startDate: string;
  targetDate: string;
  closeDate: string | null;
  /** Evaluación cualitativa de validación. */
  effectiveness: Effectiveness;
  /** Efectividad verificada del plan (0-100). Independiente del avance de acciones. */
  effectivenessPct: number | null;
  verification: string;
  successIndicator: string;
  lessonsLearned: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  availabilityBefore: number | null;
  mtbfBefore: number | null;
  mttrBefore: number | null;
  failuresBefore: number;
  actions: PlanAction[];
  evidences: string[];
};

function daysFrom(base: string, days: number) {
  const d = new Date(`${base}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function action(
  planId: string,
  n: number,
  description: string,
  type: ActionType,
  responsible: string,
  dueDate: string,
  completedDate: string,
): PlanAction {
  return {
    id: `${planId}-A${n}`,
    description,
    type,
    status: "Completada",
    responsible,
    dueDate,
    completedDate,
    evidence: "",
    comments: "Acción ejecutada y cerrada.",
  };
}

function effectivenessLabel(pct: number): Effectiveness {
  if (pct >= 98) return "Sí";
  if (pct >= 85) return "Parcialmente";
  return "No";
}

/** Planes RCM / RCA de junio 2026 · estado al cierre de julio 2026. */
export function buildGteJuneInterventionPlans(): PlanRow[] {
  const start = "2026-06-30";
  const created = "2026-06-30";

  const p1 = "IP-GTE-001";
  const p2 = "IP-GTE-002";
  const p3 = "IP-GTE-003";
  const p4 = "IP-GTE-004";
  const p5 = "IP-GTE-005";
  const p6 = "IP-GTE-006";
  const p7 = "IP-GTE-007";
  const p8 = "IP-GTE-008";

  return [
    {
      id: p1,
      title: "Reducción de detonaciones en motores CPW",
      assetId: "CPW01",
      assetName: "CPW01, CPW03",
      linkedAssets: ["CPW01", "CPW03"],
      linkedEvents: ["Detonación CPW01 (02-jun / 07-jun)", "Detonación CPW03 (11-jun)"],
      field: "COSTAYACO",
      priority: "Crítica",
      impactIndex: 0.82,
      risk: "RIESGO ALTO",
      problem:
        "Se presentaron eventos de detonación durante junio que ocasionaron indisponibilidad y mantenimientos correctivos en CPW01 y CPW03.",
      rootCause:
        "Variaciones en la presión del gas; posible desajuste de la relación aire-combustible; condiciones de combustión fuera de especificación.",
      category: "Combustión",
      responsible: "Confiabilidad",
      company: "COPOWER",
      status: "Cerrado",
      startDate: start,
      targetDate: daysFrom(start, 20),
      closeDate: "2026-07-18",
      effectiveness: effectivenessLabel(95),
      effectivenessPct: 95,
      verification: "No se presentaron nuevas detonaciones después de la intervención.",
      successIndicator: "Cero detonaciones durante los siguientes tres meses.",
      lessonsLearned:
        "La detonación puede ser efecto inmediato; la causa raíz suele estar en suministro/calidad de gas. Monitorear presión de gas de forma anticipada.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: "2026-07-18",
      availabilityBefore: 98.75,
      mtbfBefore: null,
      mttrBefore: 5,
      failuresBefore: 2,
      evidences: [],
      actions: [
        action(p1, 1, "Revisar historial de tendencias de presión de gas", "Ingeniería", "Confiabilidad", daysFrom(start, 5), "2026-07-05"),
        action(p1, 2, "Calibrar sistema aire-combustible", "Correctiva", "Instrumentación", daysFrom(start, 10), "2026-07-10"),
        action(p1, 3, "Verificar avance de ignición", "Inspección", "Mantenimiento Mecánico", daysFrom(start, 10), "2026-07-10"),
        action(p1, 4, "Revisar sensores MAP y temperatura", "Predictiva", "Instrumentación", daysFrom(start, 15), "2026-07-15"),
        action(p1, 5, "Implementar alarma temprana por baja presión de gas", "Ingeniería", "Automatización", daysFrom(start, 20), "2026-07-18"),
      ],
    },
    {
      id: p2,
      title: "Optimización del sistema de admisión",
      assetId: "CPW01",
      assetName: "CPW01",
      linkedAssets: ["CPW01"],
      linkedEvents: ["Falla sistema de admisión (03-jun)", "Daño tren de admisión (04-jun)", "Flexible de escape (05-jun)"],
      field: "COSTAYACO",
      priority: "Alta",
      impactIndex: 0.74,
      risk: "RIESGO ALTO",
      problem: "Fallas repetitivas asociadas al sistema de admisión y flexible en CPW01.",
      rootCause: "Deterioro del sistema de admisión posterior a mantenimiento.",
      category: "Admisión/Escape",
      responsible: "Mecánico",
      company: "COPOWER",
      status: "Cerrado",
      startDate: start,
      targetDate: daysFrom(start, 25),
      closeDate: "2026-07-12",
      effectiveness: effectivenessLabel(100),
      effectivenessPct: 100,
      verification: "Sin reincidencias posteriores del sistema de admisión.",
      successIndicator: "Eliminar reincidencias del sistema de admisión.",
      lessonsLearned: "Incluir lista de chequeo de montaje y torque antes de cada arranque post-mantenimiento.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: "2026-07-12",
      availabilityBefore: 99.72,
      mtbfBefore: null,
      mttrBefore: 2,
      failuresBefore: 3,
      evidences: [],
      actions: [
        action(p2, 1, "Inspección completa del tren de admisión", "Inspección", "Mantenimiento Mecánico", daysFrom(start, 7), "2026-07-07"),
        action(p2, 2, "Cambio preventivo de flexibles", "Preventiva", "Mantenimiento Mecánico", daysFrom(start, 12), "2026-07-10"),
        action(p2, 3, "Verificación de torque", "Inspección", "Mantenimiento Mecánico", daysFrom(start, 12), "2026-07-10"),
        action(p2, 4, "Actualización del procedimiento de montaje", "Cambio de Procedimiento", "Confiabilidad", daysFrom(start, 20), "2026-07-11"),
        action(p2, 5, "Lista de chequeo antes del arranque", "Operacional", "Operaciones", daysFrom(start, 25), "2026-07-12"),
      ],
    },
    {
      id: p3,
      title: "Limpieza y control del sistema de enfriamiento",
      assetId: "CPW06",
      assetName: "CPW06",
      linkedAssets: ["CPW06"],
      linkedEvents: ["Cambio intercooler por residuos de secuestrante (03-jun)"],
      field: "COSTAYACO",
      priority: "Media",
      impactIndex: 0.58,
      risk: "RIESGO MEDIO",
      problem: "Contaminación del intercooler por residuos de secuestrante.",
      rootCause: "Acumulación de contaminantes en el sistema de enfriamiento/aire.",
      category: "Enfriamiento/Lub",
      responsible: "Mecánico",
      company: "COPOWER",
      status: "Cerrado",
      startDate: start,
      targetDate: daysFrom(start, 30),
      closeDate: "2026-07-09",
      effectiveness: effectivenessLabel(100),
      effectivenessPct: 100,
      verification: "Temperaturas de operación estables tras limpieza y control.",
      successIndicator: "No presentar nuevas obstrucciones durante seis meses.",
      lessonsLearned: "Establecer inspección mensual del intercooler cuando hay uso de secuestrante.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: "2026-07-09",
      availabilityBefore: 99.03,
      mtbfBefore: null,
      mttrBefore: 2,
      failuresBefore: 3,
      evidences: [],
      actions: [
        action(p3, 1, "Inspección interna del intercooler", "Inspección", "Mantenimiento Mecánico", daysFrom(start, 7), "2026-07-04"),
        action(p3, 2, "Análisis del secuestrante", "Ingeniería", "Confiabilidad", daysFrom(start, 10), "2026-07-06"),
        action(p3, 3, "Limpieza del sistema", "Correctiva", "Mantenimiento Mecánico", daysFrom(start, 15), "2026-07-07"),
        action(p3, 4, "Definir frecuencia de inspección mensual", "Preventiva", "Confiabilidad", daysFrom(start, 20), "2026-07-08"),
        action(p3, 5, "Monitoreo de temperatura de admisión", "Predictiva", "Instrumentación", daysFrom(start, 30), "2026-07-09"),
      ],
    },
    {
      id: p4,
      title: "Estabilidad del sistema eléctrico",
      assetId: "CPW06",
      assetName: "CPW06, CPW07",
      linkedAssets: ["CPW06", "CPW07"],
      linkedEvents: ["Perturbación de red / elevación de voltaje (27-jun)", "Salida CPW06 y CPW07 por perturbación"],
      field: "COSTAYACO",
      priority: "Alta",
      impactIndex: 0.76,
      risk: "RIESGO ALTO",
      problem: "Salidas por perturbaciones eléctricas con elevación de voltaje y potencia reactiva.",
      rootCause: "Elevación del voltaje y potencia reactiva originada en la red / sistema eléctrico.",
      category: "Red eléctrica",
      responsible: "Eléctrico",
      company: "GTE",
      status: "Cerrado",
      startDate: start,
      targetDate: daysFrom(start, 25),
      closeDate: "2026-07-25",
      effectiveness: effectivenessLabel(90),
      effectivenessPct: 90,
      verification: "Se redujeron perturbaciones, pero el resultado depende también de la red externa.",
      successIndicator: "Reducir eventos eléctricos a cero.",
      lessonsLearned: "Parte del riesgo es externo (red). Mantener oscilografías y coordinación con EEP/GTE.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: "2026-07-25",
      availabilityBefore: 99.31,
      mtbfBefore: null,
      mttrBefore: 5,
      failuresBefore: 2,
      evidences: [],
      actions: [
        action(p4, 1, "Revisar registros del AVR", "Ingeniería", "Eléctrico", daysFrom(start, 7), "2026-07-10"),
        action(p4, 2, "Analizar oscilografías", "Ingeniería", "Eléctrico", daysFrom(start, 10), "2026-07-14"),
        action(p4, 3, "Revisar coordinación de protecciones", "Ingeniería", "Eléctrico", daysFrom(start, 15), "2026-07-18"),
        action(p4, 4, "Revisar configuración del regulador", "Correctiva", "Instrumentación", daysFrom(start, 20), "2026-07-22"),
        action(p4, 5, "Ejecutar pruebas de sincronismo", "Inspección", "Eléctrico", daysFrom(start, 25), "2026-07-25"),
      ],
    },
    {
      id: p5,
      title: "Gobernación y reparto de carga",
      assetId: "CPW05",
      assetName: "CPW05, CPW06",
      linkedAssets: ["CPW05", "CPW06"],
      linkedEvents: ["Potencia inversa CPW05 (28-jun)", "Sobrecarga CPW06 (28-jun)"],
      field: "COSTAYACO",
      priority: "Alta",
      impactIndex: 0.71,
      risk: "RIESGO ALTO",
      problem: "Potencia inversa y sobrecarga después de la salida de la MRU.",
      rootCause: "Redistribución rápida de carga ante salida de la MRU.",
      category: "Gobernación",
      responsible: "Instrumentación",
      company: "COPOWER",
      status: "Cerrado",
      startDate: start,
      targetDate: daysFrom(start, 25),
      closeDate: "2026-07-28",
      effectiveness: effectivenessLabel(95),
      effectivenessPct: 95,
      verification: "No se registraron nuevos eventos de potencia inversa tras la intervención.",
      successIndicator: "No presentar nuevos disparos por potencia inversa.",
      lessonsLearned: "Simular escenarios de salida MRU en procedimientos operativos antes de maniobras críticas.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: "2026-07-28",
      availabilityBefore: 99.86,
      mtbfBefore: null,
      mttrBefore: 1,
      failuresBefore: 2,
      evidences: [],
      actions: [
        action(p5, 1, "Calibrar gobernadores", "Correctiva", "Instrumentación", daysFrom(start, 10), "2026-07-12"),
        action(p5, 2, "Revisar Load Sharing", "Ingeniería", "Instrumentación", daysFrom(start, 12), "2026-07-15"),
        action(p5, 3, "Simular salida de la MRU", "Operacional", "Operaciones", daysFrom(start, 18), "2026-07-20"),
        action(p5, 4, "Revisar protecciones de potencia inversa", "Ingeniería", "Eléctrico", daysFrom(start, 20), "2026-07-24"),
        action(p5, 5, "Actualizar procedimiento operativo", "Cambio de Procedimiento", "Operaciones", daysFrom(start, 25), "2026-07-28"),
      ],
    },
    {
      id: p6,
      title: "Mejora de la disponibilidad de la MRU",
      assetId: "MRU",
      assetName: "Sistema MRU",
      linkedAssets: ["MRU", "CPW01", "CPW02", "CPW03", "CPW07"],
      linkedEvents: ["Parada MRU por alto nivel NGL (25-jun)", "Salida MRU (28-jun)", "Mantenimiento semanal MRU (02-jun)"],
      field: "COSTAYACO",
      priority: "Crítica",
      impactIndex: 0.88,
      risk: "RIESGO ALTO",
      problem: "Paradas de la MRU afectan simultáneamente varios generadores.",
      rootCause: "Disponibilidad y eventos operativos del sistema de tratamiento de gas (MRU/NGL/Quincy).",
      category: "MRU/NGL",
      responsible: "Gran Tierra",
      company: "GTE",
      status: "Cerrado",
      startDate: start,
      targetDate: daysFrom(start, 30),
      closeDate: "2026-07-30",
      effectiveness: effectivenessLabel(90),
      effectivenessPct: 90,
      verification: "Mejoró la disponibilidad, aunque sigue dependiendo de la operación del campo.",
      successIndicator: "Disponibilidad de la MRU >99%.",
      lessonsLearned: "La MRU es causa raíz sistémica: requiere seguimiento conjunto GTE-COPOWER y alarmas anticipadas de NGL.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: "2026-07-30",
      availabilityBefore: null,
      mtbfBefore: null,
      mttrBefore: null,
      failuresBefore: 0,
      evidences: [],
      actions: [
        action(p6, 1, "RCA de la MRU", "Ingeniería", "Gran Tierra", daysFrom(start, 10), "2026-07-12"),
        action(p6, 2, "Programa predictivo de la MRU", "Predictiva", "Gran Tierra", daysFrom(start, 20), "2026-07-22"),
        action(p6, 3, "Monitoreo de nivel NGL", "Predictiva", "Gran Tierra", daysFrom(start, 15), "2026-07-18"),
        action(p6, 4, "Alarmas anticipadas de NGL/MRU", "Ingeniería", "Automatización", daysFrom(start, 25), "2026-07-26"),
        action(p6, 5, "Revisión del sistema Quincy", "Inspección", "Gran Tierra", daysFrom(start, 30), "2026-07-30"),
      ],
    },
    {
      id: p7,
      title: "Optimización de protecciones eléctricas",
      assetId: "PARQUE",
      assetName: "Parque",
      linkedAssets: ["CPW04", "CPW05", "Parque"],
      linkedEvents: ["Apertura tablero auxiliares 480 V (23-jun)", "Disparo reconectador 34.5 kV (24-jun)", "Disparo C9 y RX (26-jun)"],
      field: "COSTAYACO",
      priority: "Media",
      impactIndex: 0.55,
      risk: "RIESGO MEDIO",
      problem: "Disparos por tablero auxiliar y reconectador que afectan generación.",
      rootCause: "Coordinación / ajustes de protecciones eléctricas del campo y red externa.",
      category: "Protecciones",
      responsible: "Eléctrico",
      company: "GTE",
      status: "Cerrado",
      startDate: start,
      targetDate: daysFrom(start, 30),
      closeDate: "2026-07-22",
      effectiveness: effectivenessLabel(100),
      effectivenessPct: 100,
      verification: "Sin nuevos disparos por mala coordinación tras actualización de ajustes.",
      successIndicator: "Eliminar disparos espurios.",
      lessonsLearned: "Mantener pruebas secundarias periódicas y curva de protecciones documentada.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: "2026-07-22",
      availabilityBefore: null,
      mtbfBefore: null,
      mttrBefore: null,
      failuresBefore: 0,
      evidences: [],
      actions: [
        action(p7, 1, "Estudio de coordinación de protecciones", "Ingeniería", "Eléctrico", daysFrom(start, 15), "2026-07-12"),
        action(p7, 2, "Revisión de ajustes de protecciones", "Correctiva", "Eléctrico", daysFrom(start, 20), "2026-07-16"),
        action(p7, 3, "Pruebas secundarias", "Inspección", "Eléctrico", daysFrom(start, 25), "2026-07-20"),
        action(p7, 4, "Actualización de curvas de protección", "Ingeniería", "Eléctrico", daysFrom(start, 30), "2026-07-22"),
      ],
    },
    {
      id: p8,
      title: "Programa de RCA y lecciones aprendidas",
      assetId: "PARQUE",
      assetName: "Todo el parque",
      linkedAssets: ["Parque"],
      linkedEvents: ["Fallas repetitivas junio", "Eventos con MTTR > 4 h"],
      field: "COSTAYACO / VONU",
      priority: "Crítica",
      impactIndex: 0.9,
      risk: "RIESGO ALTO",
      problem: "Garantizar que todas las fallas repetitivas y de alto impacto sean investigadas con RCA formal.",
      rootCause: "Gestión de conocimiento y cierre de ciclo de mejora continua (ISO 55000 / RCM).",
      category: "RCA / Gestión",
      responsible: "Confiabilidad",
      company: "COPOWER",
      status: "Cerrado",
      startDate: start,
      targetDate: daysFrom(start, 90),
      closeDate: "2026-07-31",
      effectiveness: effectivenessLabel(100),
      effectivenessPct: 100,
      verification: "Todos los eventos críticos fueron analizados y documentados.",
      successIndicator: "100% de fallas críticas con RCA cerrado.",
      lessonsLearned: "El RCA debe ser obligatorio ante MTTR > 4 h y eventos repetitivos; alimentar base de conocimiento mensualmente.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: "2026-07-31",
      availabilityBefore: null,
      mtbfBefore: null,
      mttrBefore: null,
      failuresBefore: 0,
      evidences: [],
      actions: [
        action(p8, 1, "RCA obligatorio para MTTR > 4 h", "Cambio de Procedimiento", "Confiabilidad", daysFrom(start, 15), "2026-07-10"),
        action(p8, 2, "RCA obligatorio para eventos repetitivos", "Cambio de Procedimiento", "Confiabilidad", daysFrom(start, 15), "2026-07-10"),
        action(p8, 3, "Crear base de conocimiento de fallas", "Ingeniería", "Confiabilidad", daysFrom(start, 30), "2026-07-20"),
        action(p8, 4, "Registrar lecciones aprendidas por evento crítico", "Capacitación", "Confiabilidad", daysFrom(start, 45), "2026-07-28"),
        action(p8, 5, "Seguimiento mensual de RCA abiertos", "Operacional", "Confiabilidad", daysFrom(start, 30), "2026-07-31"),
      ],
    },
  ];
}

export function initialPlansFor(report: ReportKey, month: string): PlanRow[] {
  if (report === "gran_tierra" && month === "Jun") return buildGteJuneInterventionPlans();
  return [];
}
