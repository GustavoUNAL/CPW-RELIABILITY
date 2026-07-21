import {
  applyActionRules,
  type ActionComment,
  type ActionEvidence,
  type ActionOrigin,
  type ActionPriority,
  type ActionStatus,
  type ActionType,
  type ActionVerification,
  type CorrectiveAction,
} from "./actionTrackingTypes";

function comment(actionId: string, n: number, text: string, author: string, createdAt: string): ActionComment {
  return { id: `${actionId}-C${n}`, actionId, comment: text, author, createdAt };
}

function evidence(
  actionId: string,
  n: number,
  fileName: string,
  description: string,
  uploadedBy: string,
  uploadedAt: string,
): ActionEvidence {
  return {
    id: `${actionId}-E${n}`,
    actionId,
    fileName,
    fileUrl: `#evidence/${actionId}/${fileName}`,
    description,
    uploadedBy,
    uploadedAt,
  };
}

function action(input: {
  id: string;
  title: string;
  description: string;
  actionType: ActionType;
  origin: ActionOrigin;
  originId: string;
  assetId: string;
  assetName?: string;
  field?: string;
  priority: ActionPriority;
  responsible: string;
  department: string;
  company: string;
  startDate: string;
  dueDate: string;
  closeDate?: string | null;
  lastUpdate: string;
  status: ActionStatus;
  progress: number;
  verification?: ActionVerification;
  verificationStatus?: CorrectiveAction["verificationStatus"];
  comments?: ActionComment[];
  evidences?: ActionEvidence[];
  createdBy?: string;
}): CorrectiveAction {
  const verification = input.verification ?? {
    implemented: null,
    fieldVerified: null,
    causeEliminated: null,
  };
  return applyActionRules({
    id: input.id,
    title: input.title,
    description: input.description,
    actionType: input.actionType,
    origin: input.origin,
    originId: input.originId,
    assetId: input.assetId,
    assetName: input.assetName ?? input.assetId,
    field: input.field ?? "COSTAYACO",
    priority: input.priority,
    responsible: input.responsible,
    department: input.department,
    company: input.company,
    startDate: input.startDate,
    dueDate: input.dueDate,
    closeDate: input.closeDate ?? null,
    lastUpdate: input.lastUpdate,
    status: input.status,
    progress: input.progress,
    effectiveness: "Pendiente",
    verificationStatus: input.verificationStatus ?? "Pendiente",
    verification,
    comments: input.comments ?? [],
    evidences: input.evidences ?? [],
    createdBy: input.createdBy ?? "Ing. Confiabilidad",
    createdAt: input.startDate,
    updatedAt: input.lastUpdate,
  });
}

/**
 * Portafolio CAPA junio–julio 2026.
 * Centraliza acciones de RCA, intervención, MSO, riesgos, eventos, reuniones y contrato.
 */
export function buildGteCapaActions(): CorrectiveAction[] {
  const rows: CorrectiveAction[] = [
    // —— RCA ——
    action({
      id: "CAPA-001",
      title: "Calibrar sistema de combustión CPW03",
      description:
        "Ejecutar calibración post-detonación según RCA-001. Verificar relación aire-combustible y parámetros OEM.",
      actionType: "Correctiva",
      origin: "RCA",
      originId: "RCA-001",
      assetId: "CPW03",
      priority: "Crítica",
      responsible: "Confiabilidad",
      department: "Confiabilidad",
      company: "COPOWER",
      startDate: "2026-06-12",
      dueDate: "2026-06-20",
      closeDate: "2026-06-18",
      lastUpdate: "2026-06-18",
      status: "Cerrada",
      progress: 100,
      verification: { implemented: true, fieldVerified: true, causeEliminated: "Sí" },
      verificationStatus: "Verificada",
      comments: [
        comment("CAPA-001", 1, "Calibración completada en sitio.", "Mecánico", "2026-06-18"),
      ],
      evidences: [evidence("CAPA-001", 1, "informe_combustion_cpw03.pdf", "Informe de calibración", "Confiabilidad", "2026-06-18")],
    }),
    action({
      id: "CAPA-002",
      title: "Actualizar procedimiento de montaje de admisión",
      description: "Documentar checklist pre-arranque y torque de flexibles (RCA-002).",
      actionType: "Documental",
      origin: "RCA",
      originId: "RCA-002",
      assetId: "CPW01",
      priority: "Alta",
      responsible: "Mecánico",
      department: "Mantenimiento",
      company: "COPOWER",
      startDate: "2026-06-05",
      dueDate: "2026-06-25",
      closeDate: "2026-06-22",
      lastUpdate: "2026-06-22",
      status: "Cerrada",
      progress: 100,
      verification: { implemented: true, fieldVerified: true, causeEliminated: "Sí" },
      comments: [comment("CAPA-002", 1, "Procedimiento publicado en OM Colombia.", "Mecánico", "2026-06-22")],
      evidences: [evidence("CAPA-002", 1, "proc_admision_v2.docx", "Procedimiento actualizado", "Mecánico", "2026-06-22")],
    }),
    action({
      id: "CAPA-003",
      title: "Definir frecuencia de inspección de intercooler",
      description: "Establecer intervalo de inspección/limpieza por condición para intercoolers (RCA-003).",
      actionType: "Preventiva",
      origin: "RCA",
      originId: "RCA-003",
      assetId: "CPW06",
      priority: "Media",
      responsible: "Mecánico",
      department: "Mantenimiento",
      company: "COPOWER",
      startDate: "2026-06-04",
      dueDate: "2026-07-05",
      closeDate: "2026-07-04",
      lastUpdate: "2026-07-04",
      status: "Cerrada",
      progress: 100,
      verification: { implemented: true, fieldVerified: true, causeEliminated: "Parcialmente" },
    }),

    // —— Plan de intervención ——
    action({
      id: "CAPA-004",
      title: "Revisión load sharing post-salida MRU",
      description: "Calibrar gobernadores y validar protecciones de potencia inversa (IP-GTE-005).",
      actionType: "Correctiva",
      origin: "Plan de intervención",
      originId: "IP-GTE-005",
      assetId: "CPW05",
      assetName: "CPW05 / CPW06",
      priority: "Alta",
      responsible: "Instrumentación",
      department: "Instrumentación",
      company: "COPOWER",
      startDate: "2026-06-29",
      dueDate: "2026-07-15",
      closeDate: "2026-07-12",
      lastUpdate: "2026-07-12",
      status: "Cerrada",
      progress: 100,
      verification: { implemented: true, fieldVerified: true, causeEliminated: "Sí" },
      evidences: [evidence("CAPA-004", 1, "load_sharing_check.xlsx", "Registro de pruebas", "Instrumentación", "2026-07-12")],
    }),
    action({
      id: "CAPA-005",
      title: "Programa PM semanal MRU / NGL",
      description: "Formalizar mantenimiento preventivo y alarmas tempranas de NGL (IP-GTE-006).",
      actionType: "Preventiva",
      origin: "Plan de intervención",
      originId: "IP-GTE-006",
      assetId: "MRU",
      priority: "Crítica",
      responsible: "Gran Tierra",
      department: "Operaciones",
      company: "GTE",
      startDate: "2026-06-26",
      dueDate: "2026-07-20",
      closeDate: "2026-07-18",
      lastUpdate: "2026-07-18",
      status: "Cerrada",
      progress: 100,
      verification: { implemented: true, fieldVerified: true, causeEliminated: "Parcialmente" },
    }),

    // —— Optimización MSO ——
    action({
      id: "CAPA-006",
      title: "Reducir frecuencia preventiva CPW06 a 400 h",
      description: "Implementar cambio de intervalo 500→400 h e inspección termográfica mensual (MSO-001).",
      actionType: "Mejora",
      origin: "Optimización",
      originId: "MSO-001",
      assetId: "CPW06",
      priority: "Alta",
      responsible: "Confiabilidad",
      department: "Confiabilidad",
      company: "COPOWER",
      startDate: "2026-07-01",
      dueDate: "2026-07-25",
      lastUpdate: "2026-07-15",
      status: "En ejecución",
      progress: 65,
      comments: [comment("CAPA-006", 1, "Termografía programada para semana 30.", "Eléctrico", "2026-07-15")],
    }),
    action({
      id: "CAPA-007",
      title: "Extender intervalo PM CPW02 a 500 h",
      description: "Eliminar sobre-mantenimiento detectado en MSO-007 (250→500 h).",
      actionType: "Mejora",
      origin: "Optimización",
      originId: "MSO-007",
      assetId: "CPW02",
      priority: "Media",
      responsible: "Confiabilidad",
      department: "Confiabilidad",
      company: "COPOWER",
      startDate: "2026-07-02",
      dueDate: "2026-07-18",
      closeDate: "2026-07-16",
      lastUpdate: "2026-07-16",
      status: "Cerrada",
      progress: 100,
      verification: { implemented: true, fieldVerified: true, causeEliminated: "Sí" },
    }),

    // —— Riesgo / degradación ——
    action({
      id: "CAPA-008",
      title: "Mitigar degradación severa MRU",
      description: "Acción de mitigación por Health Index crítico y Risk Score alto en módulo APM.",
      actionType: "Correctiva",
      origin: "Riesgo",
      originId: "AH-MRU",
      assetId: "MRU",
      priority: "Crítica",
      responsible: "Gran Tierra",
      department: "Operaciones",
      company: "GTE",
      startDate: "2026-07-01",
      dueDate: "2026-07-10",
      lastUpdate: "2026-07-08",
      status: "En validación",
      progress: 85,
      comments: [comment("CAPA-008", 1, "Alarmas NGL instaladas; pendiente validación 72 h.", "Operación GTE", "2026-07-08")],
      evidences: [evidence("CAPA-008", 1, "alarma_ngl_config.pdf", "Configuración alarmas", "Instrumentación GTE", "2026-07-07")],
    }),
    action({
      id: "CAPA-009",
      title: "Inspección detallada por caída de MTBF CPW06",
      description: "Programar inspección detallada: MTBF en tendencia decreciente >15% (APM).",
      actionType: "Predictiva",
      origin: "Riesgo",
      originId: "AH-CPW06",
      assetId: "CPW06",
      priority: "Alta",
      responsible: "Confiabilidad",
      department: "Confiabilidad",
      company: "COPOWER",
      startDate: "2026-07-05",
      dueDate: "2026-07-22",
      lastUpdate: "2026-07-12",
      status: "Asignada",
      progress: 30,
    }),

    // —— Evento ——
    action({
      id: "CAPA-010",
      title: "Análisis inmediato post-perturbación eléctrica",
      description: "Acción automática por evento crítico 27-jun (CPW06/CPW07). Validar AVR y protecciones.",
      actionType: "Operacional",
      origin: "Evento",
      originId: "jun-cpw06-0627",
      assetId: "CPW06",
      assetName: "CPW06 / CPW07",
      priority: "Alta",
      responsible: "Eléctrico",
      department: "Eléctrico",
      company: "COPOWER",
      startDate: "2026-06-27",
      dueDate: "2026-07-05",
      closeDate: "2026-07-03",
      lastUpdate: "2026-07-03",
      status: "Cerrada",
      progress: 100,
      verification: { implemented: true, fieldVerified: true, causeEliminated: "Sí" },
    }),
    action({
      id: "CAPA-011",
      title: "Contención post-detonación CPW03",
      description: "Acción inmediata de contención y liberación a mantenimiento correctivo.",
      actionType: "Correctiva",
      origin: "Evento",
      originId: "jun-cpw03-0611",
      assetId: "CPW03",
      priority: "Crítica",
      responsible: "Operación",
      department: "Operaciones",
      company: "COPOWER",
      startDate: "2026-06-11",
      dueDate: "2026-06-12",
      closeDate: "2026-06-11",
      lastUpdate: "2026-06-11",
      status: "Cerrada",
      progress: 100,
      verification: { implemented: true, fieldVerified: true, causeEliminated: "Parcialmente" },
    }),

    // —— Reunión GTE ——
    action({
      id: "CAPA-012",
      title: "Compromiso reunión: reporte RCA junio",
      description: "Entregar paquete de RCA seleccionados y estado de acciones en reunión mensual con Gran Tierra.",
      actionType: "Documental",
      origin: "Reunión",
      originId: "REU-GTE-JUN-2026",
      assetId: "PARQUE",
      assetName: "Parque Costayaco",
      priority: "Alta",
      responsible: "Confiabilidad",
      department: "Confiabilidad",
      company: "COPOWER",
      startDate: "2026-06-30",
      dueDate: "2026-07-08",
      closeDate: "2026-07-07",
      lastUpdate: "2026-07-07",
      status: "Cerrada",
      progress: 100,
      verification: { implemented: true, fieldVerified: false, causeEliminated: "Sí" },
      evidences: [evidence("CAPA-012", 1, "acta_reunion_junio.pdf", "Acta y anexos RCA", "Confiabilidad", "2026-07-07")],
    }),
    action({
      id: "CAPA-013",
      title: "Seguimiento disponibilidad MRU en comité",
      description: "Presentar plan de recuperación MRU y KPIs de afectación a generación en próxima reunión.",
      actionType: "Operacional",
      origin: "Reunión",
      originId: "REU-GTE-JUL-2026",
      assetId: "MRU",
      priority: "Alta",
      responsible: "Gran Tierra",
      department: "Operaciones",
      company: "GTE",
      startDate: "2026-07-10",
      dueDate: "2026-07-28",
      lastUpdate: "2026-07-18",
      status: "En ejecución",
      progress: 40,
    }),

    // —— Contrato ——
    action({
      id: "CAPA-014",
      title: "Cierre documental fallas imputables junio",
      description: "Completar trazabilidad contractual de fallas asociadas (Orden 1) para liquidación del mes.",
      actionType: "Documental",
      origin: "Contrato",
      originId: "ORD1-JUN-2026",
      assetId: "PARQUE",
      assetName: "Parque Costayaco",
      priority: "Alta",
      responsible: "Confiabilidad",
      department: "Confiabilidad",
      company: "COPOWER",
      startDate: "2026-07-01",
      dueDate: "2026-07-12",
      closeDate: "2026-07-11",
      lastUpdate: "2026-07-11",
      status: "Cerrada",
      progress: 100,
      verification: { implemented: true, fieldVerified: false, causeEliminated: "Sí" },
    }),
    action({
      id: "CAPA-015",
      title: "Plan de recuperación meta disponibilidad 98%",
      description: "Compromiso contractual: acciones para sostener disponibilidad sistema ≥98% tras eventos de junio.",
      actionType: "Mejora",
      origin: "Contrato",
      originId: "SLA-DISP-98",
      assetId: "PARQUE",
      assetName: "Parque Costayaco",
      priority: "Crítica",
      responsible: "Confiabilidad",
      department: "Confiabilidad",
      company: "COPOWER",
      startDate: "2026-07-05",
      dueDate: "2026-07-30",
      lastUpdate: "2026-07-19",
      status: "En ejecución",
      progress: 55,
    }),

    // —— Auditoría ——
    action({
      id: "CAPA-016",
      title: "Cerrar hallazgo auditoría dual PDF vs Excel",
      description: "Resolver inconsistencias detectadas en calidad de datos junio (auditoría dual).",
      actionType: "Auditoría",
      origin: "Auditoría",
      originId: "CQ-AUD-JUN",
      assetId: "PARQUE",
      assetName: "Parque Costayaco",
      field: "COSTAYACO",
      priority: "Media",
      responsible: "Calidad de datos",
      department: "Confiabilidad",
      company: "COPOWER",
      startDate: "2026-07-08",
      dueDate: "2026-07-25",
      lastUpdate: "2026-07-14",
      status: "En ejecución",
      progress: 50,
    }),

    // —— Capacitación / abierta / vencida ejemplo ——
    action({
      id: "CAPA-017",
      title: "Capacitación operadores: checklist pre-arranque",
      description: "Entrenar turno A/B en nuevo checklist de admisión y arranque (lección aprendida RCA-002).",
      actionType: "Capacitación",
      origin: "RCA",
      originId: "RCA-002",
      assetId: "CPW01",
      priority: "Media",
      responsible: "Operación",
      department: "Operaciones",
      company: "COPOWER",
      startDate: "2026-07-01",
      dueDate: "2026-07-15",
      lastUpdate: "2026-07-10",
      status: "Pendiente",
      progress: 10,
    }),
    action({
      id: "CAPA-018",
      title: "Termografía mensual motores Costayaco",
      description: "Implementar ruta predictiva de termografía en CPW01–CPW07 (MSO / APM).",
      actionType: "Predictiva",
      origin: "Optimización",
      originId: "MSO-001",
      assetId: "CPW03",
      assetName: "Flota CPW",
      priority: "Alta",
      responsible: "Eléctrico",
      department: "Eléctrico",
      company: "COPOWER",
      startDate: "2026-07-03",
      dueDate: "2026-07-12",
      lastUpdate: "2026-07-06",
      status: "Asignada",
      progress: 20,
    }),
    action({
      id: "CAPA-019",
      title: "Validar protecciones tras evento de red",
      description: "Verificación AVR/protecciones post-perturbación (RCA-004 / IP-GTE-004).",
      actionType: "Preventiva",
      origin: "Plan de intervención",
      originId: "IP-GTE-004",
      assetId: "CPW07",
      priority: "Alta",
      responsible: "Eléctrico",
      department: "Eléctrico",
      company: "COPOWER",
      startDate: "2026-06-28",
      dueDate: "2026-07-08",
      closeDate: "2026-07-06",
      lastUpdate: "2026-07-06",
      status: "Cerrada",
      progress: 100,
      verification: { implemented: true, fieldVerified: true, causeEliminated: "Sí" },
    }),
    action({
      id: "CAPA-020",
      title: "Re-evaluación efectividad baja: monitoreo gas CPW03",
      description:
        "Acción automática creada por efectividad Baja en monitoreo de presión/calidad de gas. Reforzar instrumentación y umbrales.",
      actionType: "Correctiva",
      origin: "Otro",
      originId: "CAPA-AUTO-EFF",
      assetId: "CPW03",
      priority: "Alta",
      responsible: "Instrumentación",
      department: "Instrumentación",
      company: "COPOWER",
      startDate: "2026-07-16",
      dueDate: "2026-07-31",
      lastUpdate: "2026-07-16",
      status: "Pendiente",
      progress: 0,
      comments: [
        comment(
          "CAPA-020",
          1,
          "Generada automáticamente por regla: efectividad Baja → nueva acción.",
          "Sistema CAPA",
          "2026-07-16",
        ),
      ],
    }),
  ];

  return rows.map((r) => applyActionRules(r));
}

export function capaPortfolioKpis(actions: CorrectiveAction[], today = "2026-07-21") {
  const total = actions.length;
  const pending = actions.filter((a) => a.status === "Pendiente" || a.status === "Asignada").length;
  const running = actions.filter((a) => a.status === "En ejecución" || a.status === "En validación").length;
  const overdue = actions.filter((a) => a.status === "Vencida").length;
  const closed = actions.filter((a) => a.status === "Cerrada").length;
  const compliance = total ? Math.round((closed / total) * 100) : 0;
  const verified = actions.filter((a) => a.effectiveness === "Alta" || a.effectiveness === "Media");
  const highEff = actions.filter((a) => a.effectiveness === "Alta").length;
  const effectivenessPct = verified.length ? Math.round((highEff / verified.length) * 100) : 0;

  const closedWithDates = actions.filter((a) => a.status === "Cerrada" && a.closeDate);
  const avgCloseDays =
    closedWithDates.length === 0
      ? 0
      : Math.round(
          closedWithDates.reduce((s, a) => {
            const days =
              (new Date(`${a.closeDate}T12:00:00`).getTime() -
                new Date(`${a.startDate}T12:00:00`).getTime()) /
              86400000;
            return s + days;
          }, 0) / closedWithDates.length,
        );

  const dueSoon = actions.filter((a) => {
    if (a.status === "Cerrada" || a.status === "Cancelada" || a.status === "Vencida") return false;
    const left =
      (new Date(`${a.dueDate}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) /
      86400000;
    return left >= 0 && left <= 7;
  }).length;

  const criticalOpen = actions.filter(
    (a) => a.priority === "Crítica" && a.status !== "Cerrada" && a.status !== "Cancelada",
  ).length;

  const stale = actions.filter((a) => {
    if (a.status === "Cerrada" || a.status === "Cancelada") return false;
    const days =
      (new Date(`${today}T12:00:00`).getTime() - new Date(`${a.lastUpdate}T12:00:00`).getTime()) /
      86400000;
    return days > 30;
  }).length;

  return {
    total,
    pending,
    running,
    overdue,
    closed,
    compliance,
    effectivenessPct,
    avgCloseDays,
    dueSoon,
    criticalOpen,
    stale,
  };
}

export function groupCount<T extends string>(actions: CorrectiveAction[], key: (a: CorrectiveAction) => T) {
  const map = new Map<T, number>();
  for (const a of actions) {
    const k = key(a);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export function complianceBy(actions: CorrectiveAction[], key: (a: CorrectiveAction) => string) {
  const map = new Map<string, { total: number; closed: number }>();
  for (const a of actions) {
    const k = key(a);
    const row = map.get(k) ?? { total: 0, closed: 0 };
    row.total += 1;
    if (a.status === "Cerrada") row.closed += 1;
    map.set(k, row);
  }
  return [...map.entries()]
    .map(([name, v]) => ({
      name,
      pct: v.total ? Math.round((v.closed / v.total) * 100) : 0,
      total: v.total,
    }))
    .sort((a, b) => b.pct - a.pct || b.total - a.total);
}
