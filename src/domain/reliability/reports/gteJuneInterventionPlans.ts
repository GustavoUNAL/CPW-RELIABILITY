import type { ReportKey } from "../types";
import { EXEC_JUN } from "./executiveJune2026";

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
  completedDate: string | null,
): PlanAction {
  const done = Boolean(completedDate);
  return {
    id: `${planId}-A${n}`,
    description,
    type,
    status: done ? "Completada" : "Pendiente",
    responsible,
    dueDate,
    completedDate,
    evidence: "",
    comments: done ? "Acción ejecutada y cerrada." : "Pendiente de ejecución.",
  };
}

function effectivenessLabel(pct: number): Effectiveness {
  if (pct >= 98) return "Sí";
  if (pct >= 85) return "Parcialmente";
  return "No";
}

/**
 * Planes RCM / RCA de junio 2026 — alineados a bitácora consolidada:
 * 7 fallas COPOWER · 18,22 h PF_contr · MTTR 2,60 h · MTBF 986,71 h.
 * 28-jun externo (0,38 h) no imputable.
 */
export const GTE_JUNE_INTERVENTION_SEED = "2026-07-26-ip-r5";

export function buildGteJuneInterventionPlans(): PlanRow[] {
  const start = "2026-06-30";
  const created = "2026-06-30";
  const updated = "2026-07-26";

  const p1 = "IP-GTE-001"; // 07-jun CPW01 K4
  const p2 = "IP-GTE-002"; // 05-jun CPW01 escape
  const p3 = "IP-GTE-003"; // 03-jun CPW06 intercooler
  const p4 = "IP-GTE-004"; // 27-jun CPW06 Q>
  const p5 = "IP-GTE-005"; // 28-jun externo
  const p6 = "IP-GTE-006"; // MRU sistémico
  const p7 = "IP-GTE-007"; // 23–24 jun FO-44
  const p8 = "IP-GTE-008"; // RCA programa
  const p9 = "IP-GTE-009"; // 11-jun CPW03

  const planK4 = {
      id: p1,
      title: "Detonación relé K4 — CPW01",
      assetId: "CPW01",
      assetName: "CPW01",
      linkedAssets: ["CPW01"],
      linkedEvents: ["07-jun · CPW01 · K4 · PF_contr 3 h"],
      field: "COSTAYACO",
      priority: "Alta",
      impactIndex: 0.72,
      risk: "RIESGO MEDIO" as const,
      problem: "Detonación relé K4 (3 h).",
      rootCause: "Señal espuria en base/relé K4.",
      category: "Sensores / Relés",
      responsible: "Eléctrico / Confiabilidad",
      company: "COPOWER",
      status: "Cerrado" as const,
      startDate: start,
      targetDate: daysFrom(start, 15),
      closeDate: "2026-07-10",
      effectiveness: effectivenessLabel(95),
      effectivenessPct: 95,
      verification: "Base y relé K4 reemplazados.",
      successIndicator: "Sin reincidencias K4.",
      lessonsLearned:
        "Componentes de bajo costo (base de relé) pueden causar disparos de alto impacto; incluir inspección de bases en correctivos eléctricos.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: updated,
      availabilityBefore: 99.72,
      mtbfBefore: 286,
      mttrBefore: 3,
      failuresBefore: 1,
      evidences: [] as string[],
      actions: [
        action(p1, 1, "Reemplazar base y relé K4", "Correctiva", "Eléctrico", daysFrom(start, 5), "2026-07-05"),
        action(p1, 2, "Verificar cableado y contacto de shutoff de gas", "Inspección", "Eléctrico", daysFrom(start, 7), "2026-07-06"),
        action(p1, 3, "Probar arranque y estabilidad de combustión", "Operacional", "Operaciones", daysFrom(start, 10), "2026-07-08"),
        action(p1, 4, "Incluir bases de relé en checklist eléctrico post-evento", "Cambio de Procedimiento", "Confiabilidad", daysFrom(start, 15), "2026-07-10"),
      ],
    };

  const planEscape = {
      id: p2,
      title: "Admisión/escape — CPW01",
      assetId: "CPW01",
      assetName: "CPW01",
      linkedAssets: ["CPW01"],
      linkedEvents: ["05-jun · CPW01 · flexible escape · PF_contr 2 h"],
      field: "COSTAYACO",
      priority: "Alta",
      impactIndex: 0.68,
      risk: "RIESGO MEDIO" as const,
      problem: "Fuga flexible de escape (2 h).",
      rootCause: "Deterioro post-mantenimiento en admisión/escape.",
      category: "Admisión / Escape",
      responsible: "Mecánico",
      company: "COPOWER",
      status: "Cerrado" as const,
      startDate: start,
      targetDate: daysFrom(start, 25),
      closeDate: "2026-07-12",
      effectiveness: effectivenessLabel(100),
      effectivenessPct: 100,
      verification: "Junta/flexible reemplazados.",
      successIndicator: "Sin fugas de escape.",
      lessonsLearned: "Incluir lista de chequeo de montaje y torque antes de cada arranque post-mantenimiento.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: "2026-07-12",
      availabilityBefore: 99.72,
      mtbfBefore: 286,
      mttrBefore: 2,
      failuresBefore: 1,
      evidences: [] as string[],
      actions: [
        action(p2, 1, "Inspección completa del tren de admisión", "Inspección", "Mantenimiento Mecánico", daysFrom(start, 7), "2026-07-07"),
        action(p2, 2, "Cambio preventivo de flexibles / junta turbo", "Preventiva", "Mantenimiento Mecánico", daysFrom(start, 12), "2026-07-10"),
        action(p2, 3, "Verificación de torque", "Inspección", "Mantenimiento Mecánico", daysFrom(start, 12), "2026-07-10"),
        action(p2, 4, "Actualización del procedimiento de montaje", "Cambio de Procedimiento", "Confiabilidad", daysFrom(start, 20), "2026-07-11"),
        action(p2, 5, "Lista de chequeo antes del arranque", "Operacional", "Operaciones", daysFrom(start, 25), "2026-07-12"),
      ],
    };

  const planIntercooler = {
      id: p3,
      title: "Intercooler / secuestrante — CPW06",
      assetId: "CPW06",
      assetName: "CPW06",
      linkedAssets: ["CPW06"],
      linkedEvents: ["03-jun · CPW06 · intercooler · PF_contr 4 h"],
      field: "COSTAYACO",
      priority: "Media",
      impactIndex: 0.64,
      risk: "RIESGO MEDIO" as const,
      problem: "Intercooler obstruido por secuestrante (4 h).",
      rootCause: "Contaminantes del secuestrante en el intercooler.",
      category: "Tratamiento gas / Enfriamiento",
      responsible: "Mecánico",
      company: "GTE + COPOWER",
      status: "Cerrado" as const,
      startDate: start,
      targetDate: daysFrom(start, 30),
      closeDate: "2026-07-09",
      effectiveness: effectivenessLabel(100),
      effectivenessPct: 100,
      verification: "Núcleo cambiado; ΔP normal.",
      successIndicator: "Sin nuevas obstrucciones.",
      lessonsLearned: "Inspección mensual del intercooler cuando hay dosificación de secuestrante.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: "2026-07-09",
      availabilityBefore: 99.03,
      mtbfBefore: 333.5,
      mttrBefore: 4,
      failuresBefore: 1,
      evidences: [] as string[],
      actions: [
        action(p3, 1, "Inspección interna del intercooler", "Inspección", "Mantenimiento Mecánico", daysFrom(start, 7), "2026-07-04"),
        action(p3, 2, "Análisis del secuestrante / calidad de gas", "Ingeniería", "Confiabilidad", daysFrom(start, 10), "2026-07-06"),
        action(p3, 3, "Cambio de núcleo / limpieza del sistema", "Correctiva", "Mantenimiento Mecánico", daysFrom(start, 15), "2026-07-07"),
        action(p3, 4, "Definir frecuencia de inspección mensual", "Preventiva", "Confiabilidad", daysFrom(start, 20), "2026-07-08"),
        action(p3, 5, "Monitoreo de ΔP y temperatura de admisión", "Predictiva", "Instrumentación", daysFrom(start, 30), "2026-07-09"),
      ],
    };

  const planQ = {
      id: p4,
      title: "AVR / Q> — CPW06",
      assetId: "CPW06",
      assetName: "CPW06",
      linkedAssets: ["CPW06", "CPW07", "MRU"],
      linkedEvents: ["27-jun · CPW06 · Q> · FS≈2,30 h · EVT-2026-06-27-CPW06"],
      field: "COSTAYACO",
      priority: "Alta",
      impactIndex: 0.78,
      risk: "RIESGO ALTO" as const,
      problem: "Disparo Q> tras salida MRU (2,30 h).",
      rootCause: "En investigación (AVR / Q> / DEIF / CPW-07).",
      category: "Protecciones / AVR",
      responsible: "Eléctrico / Confiabilidad",
      company: "COPOWER",
      status: "En ejecución" as const,
      startDate: start,
      targetDate: daysFrom(start, 25),
      closeDate: null,
      effectiveness: effectivenessLabel(35),
      effectivenessPct: 35,
      verification: "Investigación abierta.",
      successIndicator: "Cerrar causa raíz con evidencia.",
      lessonsLearned:
        "No asignar causa raíz sin evidencia. Validar coordinación AVR–protecciones en escenarios dinámicos post-MRU.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: updated,
      availabilityBefore: 99.03,
      mtbfBefore: 333.5,
      mttrBefore: 2.3,
      failuresBefore: 1,
      evidences: [] as string[],
      actions: [
        action(p4, 1, "Validar configuración de protección Q>", "Ingeniería", "Eléctrico", daysFrom(start, 7), null),
        action(p4, 2, "Validar configuración AVR DVC-550", "Ingeniería", "Instrumentación", daysFrom(start, 10), null),
        action(p4, 3, "Revisar históricos DEIF y tendencias de tensión/Q", "Ingeniería", "Eléctrico", daysFrom(start, 15), null),
        action(p4, 4, "Analizar comportamiento conjunto CPW-06 / CPW-07", "Ingeniería", "Confiabilidad", daysFrom(start, 20), null),
        action(p4, 5, "Mesa técnica DEIF / Operaciones / Ingeniería", "Operacional", "Confiabilidad", daysFrom(start, 25), null),
      ],
    };

  const planExterno = {
      id: p5,
      title: "Contingencia red 34,5 kV",
      assetId: "RED34KV",
      assetName: "Parque / 34,5 kV",
      linkedAssets: ["CPW01", "CPW02", "CPW03", "CPW05", "CPW06", "CPW07"],
      linkedEvents: ["28-jun · externo · FS=0,38 h · no imputable"],
      field: "COSTAYACO",
      priority: "Media",
      impactIndex: 0.55,
      risk: "RIESGO MEDIO" as const,
      problem: "Perturbación externa 34,5 kV (0,38 h).",
      rootCause: "salida de la máquina por falla externa de red (ave).",
      category: "Red eléctrica externa",
      responsible: "Operaciones / coordinación CCM",
      company: "Externo",
      status: "Cerrado" as const,
      startDate: start,
      targetDate: daysFrom(start, 25),
      closeDate: "2026-07-28",
      effectiveness: effectivenessLabel(95),
      effectivenessPct: 95,
      verification: "Parque restablecido; no imputable.",
      successIndicator: "Recuperación segura post-contingencia.",
      lessonsLearned: "No imputar a COPOWER eventos externos confirmados; documentar FS solo con horas oficiales del FO.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: "2026-07-28",
      availabilityBefore: null,
      mtbfBefore: null,
      mttrBefore: 0.38,
      failuresBefore: 0,
      evidences: [] as string[],
      actions: [
        action(p5, 1, "Inspeccionar grupos electrógenos y sistemas auxiliares", "Inspección", "O&M", daysFrom(start, 10), "2026-07-12"),
        action(p5, 2, "Confirmar funcionamiento correcto de protecciones", "Ingeniería", "Eléctrico", daysFrom(start, 12), "2026-07-15"),
        action(p5, 3, "Verificar respuesta de gobernación de CPW05 y CPW06", "Inspección", "Instrumentación", daysFrom(start, 18), "2026-07-20"),
        action(p5, 4, "Revisar coordinación operativa durante contingencias externas", "Operacional", "Operaciones / CCM", daysFrom(start, 20), "2026-07-24"),
        action(p5, 5, "Actualizar histórico de perturbaciones externas (no imputables)", "Cambio de Procedimiento", "Confiabilidad", daysFrom(start, 25), "2026-07-28"),
      ],
    };

  const planMru = {
      id: p6,
      title: "Disponibilidad MRU",
      assetId: "MRU",
      assetName: "MRU",
      linkedAssets: ["MRU", "CPW01", "CPW02", "CPW03", "CPW07"],
      linkedEvents: ["02-jun mto MRU", "25-jun NGL", "27/28-jun habilitante"],
      field: "COSTAYACO",
      priority: "Crítica",
      impactIndex: 0.88,
      risk: "RIESGO ALTO" as const,
      problem: "Paradas MRU con alto impacto en PF_cli.",
      rootCause: "Disponibilidad del sistema MRU/NGL/Quincy.",
      category: "MRU / NGL",
      responsible: "Gran Tierra",
      company: "GTE",
      status: "En ejecución" as const,
      startDate: start,
      targetDate: daysFrom(start, 30),
      closeDate: null,
      effectiveness: effectivenessLabel(75),
      effectivenessPct: 75,
      verification: "Acciones GTE en curso.",
      successIndicator: "Disponibilidad MRU >99%.",
      lessonsLearned: "La MRU es causa sistémica: requiere seguimiento conjunto GTE–COPOWER y alarmas anticipadas de NGL.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: updated,
      availabilityBefore: null,
      mtbfBefore: null,
      mttrBefore: null,
      failuresBefore: 0,
      evidences: [] as string[],
      actions: [
        action(p6, 1, "RCA de la MRU", "Ingeniería", "Gran Tierra", daysFrom(start, 10), "2026-07-12"),
        action(p6, 2, "Programa predictivo de la MRU", "Predictiva", "Gran Tierra", daysFrom(start, 20), null),
        action(p6, 3, "Monitoreo de nivel NGL", "Predictiva", "Gran Tierra", daysFrom(start, 15), "2026-07-18"),
        action(p6, 4, "Alarmas anticipadas de NGL/MRU", "Ingeniería", "Automatización", daysFrom(start, 25), null),
        action(p6, 5, "Revisión del sistema Quincy", "Inspección", "Gran Tierra", daysFrom(start, 30), null),
      ],
    };

  const planFo44 = {
      id: p7,
      title: "Selectividad FO-44 RL/480 V",
      assetId: "PARQUE",
      assetName: "CPW04/05 · 480 V",
      linkedAssets: ["CPW04", "CPW05", "CPW06", "CPW07", "MRU", "Parque"],
      linkedEvents: ["23–24 jun · FO-44 · CPW04 1 h + CPW05 2 h = 3 h"],
      field: "COSTAYACO",
      priority: "Crítica",
      impactIndex: 0.9,
      risk: "RIESGO ALTO" as const,
      problem: "Cascada EEP→480 V FO-44 (3 h PF_contr).",
      rootCause: "EEP externo + RL/480 V no selectivos.",
      category: "Protecciones / Red externa",
      responsible: "Eléctrico + gestión EEP",
      company: "COPOWER / EEP",
      status: "En validación" as const,
      startDate: start,
      targetDate: daysFrom(start, 30),
      closeDate: null,
      effectiveness: effectivenessLabel(55),
      effectivenessPct: 55,
      verification: "Ajuste 8×/15× hecho; efectividad pendiente.",
      successIndicator: "Transitorio EEP sin SD 480 V.",
      lessonsLearned:
        "Origen externo no elimina la barrera interna: selectividad y desacople de auxiliares determinan si el evento escala a planta.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: updated,
      availabilityBefore: 98.89,
      mtbfBefore: null,
      mttrBefore: 1.5,
      failuresBefore: 2,
      evidences: [] as string[],
      actions: [
        action(p7, 1, "Estudio formal coordinación 34,5 kV → RL → 480 V y arco eléctrico", "Ingeniería", "Eléctrico", daysFrom(start, 15), null),
        action(p7, 2, "Aplicar ajuste final Isd=8×Ir / Ii=15×In en ambos pares", "Correctiva", "Eléctrico", daysFrom(start, 20), "2026-06-24"),
        action(p7, 3, "Descargar data TRIP y validar corrientes/fases exactas", "Ingeniería", "Eléctrico", daysFrom(start, 25), null),
        action(p7, 4, "Gestionar EEP y monitoreo calidad de energía en frontera", "Ingeniería", "Gran Tierra", daysFrom(start, 30), null),
        action(p7, 5, "Evaluar desacople/respaldo de auxiliares 480 V", "Ingeniería", "Eléctrico", daysFrom(start, 30), null),
      ],
    };

  const planRca = {
      id: p8,
      title: "Programa RCA junio",
      assetId: "PARQUE",
      assetName: "7 fallas COPOWER",
      linkedAssets: ["CPW01", "CPW03", "CPW04", "CPW05", "CPW06", "Parque"],
      linkedEvents: [
        "03 CPW06 4 h",
        "05 CPW01 2 h",
        "07 CPW01 3 h",
        "11 CPW03 3,92 h",
        "23 CPW04/05 3 h",
        "27 CPW06 2,30 h",
      ],
      field: "COSTAYACO / VONU",
      priority: "Crítica",
      impactIndex: 0.92,
      risk: "RIESGO ALTO" as const,
      problem: `RCA de ${EXEC_JUN.failures} fallas COPOWER (${EXEC_JUN.hoursPfContr} h).`,
      rootCause: "Cierre de ciclo RCA / mejora continua.",
      category: "RCA / Gestión",
      responsible: "Confiabilidad",
      company: "COPOWER",
      status: "En ejecución" as const,
      startDate: start,
      targetDate: daysFrom(start, 90),
      closeDate: null,
      effectiveness: effectivenessLabel(45),
      effectivenessPct: 45,
      verification: "Abiertos: CPW03, Q> 27-jun, validación FO-44.",
      successIndicator: `Meta ${EXEC_JUN.failures}/${EXEC_JUN.failures} RCA cerrados.`,
      lessonsLearned:
        "RCA obligatorio ante MTTR > 4 h, fallas repetitivas y eventos multi-unidad; no imputar externos.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: updated,
      availabilityBefore: EXEC_JUN.availability * 100,
      mtbfBefore: EXEC_JUN.mtbfHours,
      mttrBefore: EXEC_JUN.mttrHours,
      failuresBefore: EXEC_JUN.failures,
      evidences: [] as string[],
      actions: [
        action(p8, 1, "RCA obligatorio para MTTR > 4 h", "Cambio de Procedimiento", "Confiabilidad", daysFrom(start, 15), "2026-07-10"),
        action(p8, 2, "RCA obligatorio para eventos repetitivos (CPW01, CPW06, FO-44)", "Cambio de Procedimiento", "Confiabilidad", daysFrom(start, 15), "2026-07-10"),
        action(p8, 3, "Cerrar o avanzar RCA CPW03 / CPW06-Q> / FO-44", "Ingeniería", "Confiabilidad", daysFrom(start, 30), null),
        action(p8, 4, "Registrar lecciones aprendidas de las 7 fallas COPOWER", "Capacitación", "Confiabilidad", daysFrom(start, 45), null),
        action(p8, 5, "Seguimiento mensual de RCA abiertos vs meta 7/7", "Operacional", "Confiabilidad", daysFrom(start, 30), null),
      ],
    };

  const planCpw03 = {
      id: p9,
      title: "Diagnóstico CPW03",
      assetId: "CPW03",
      assetName: "CPW03",
      linkedAssets: ["CPW03"],
      linkedEvents: ["11-jun · CPW03 · FS≈3,92 h · EVT-2026-06-11-CPW03-A"],
      field: "COSTAYACO",
      priority: "Alta",
      impactIndex: 0.7,
      risk: "RIESGO MEDIO" as const,
      problem: "Perturbación transitoria CPW03 (3,92 h).",
      rootCause: "Causa raíz no determinada.",
      category: "Red / Transitorio",
      responsible: "Confiabilidad / Eléctrico",
      company: "COPOWER",
      status: "En ejecución" as const,
      startDate: start,
      targetDate: daysFrom(start, 30),
      closeDate: null,
      effectiveness: effectivenessLabel(40),
      effectivenessPct: 40,
      verification: "Unidad estable; diagnóstico pendiente.",
      successIndicator: "Cerrar diagnóstico con evidencia.",
      lessonsLearned:
        "Eventos transitorios sin data de alta resolución quedan sin causa raíz; priorizar captura automática.",
      createdBy: "Ing. Confiabilidad",
      createdAt: created,
      updatedAt: updated,
      availabilityBefore: 98.75,
      mtbfBefore: 607,
      mttrBefore: 3.92,
      failuresBefore: 1,
      evidences: [] as string[],
      actions: [
        action(p9, 1, "Recuperar información histórica de variables en la ventana del evento", "Ingeniería", "Confiabilidad", daysFrom(start, 10), null),
        action(p9, 2, "Revisar tendencias de operación CPW03 (recomendación FO)", "Ingeniería", "Confiabilidad", daysFrom(start, 12), null),
        action(p9, 3, "Fortalecer captura automática de diagnóstico ante eventos transitorios", "Ingeniería", "Confiabilidad", daysFrom(start, 20), null),
        action(p9, 4, "Documentar cierre o seguimiento en ficha EVT-2026-06-11-CPW03-A", "Operacional", "Confiabilidad", daysFrom(start, 30), null),
      ],
    };

  // Orden cronológico de fallas COPOWER + soporte (externo / MRU / RCA).
  return [
    planIntercooler,
    planEscape,
    planK4,
    planCpw03,
    planFo44,
    planQ,
    planExterno,
    planMru,
    planRca,
  ];
}

export function initialPlansFor(report: ReportKey, month: string): PlanRow[] {
  if (report === "gran_tierra" && month === "Jun") return buildGteJuneInterventionPlans();
  return [];
}
