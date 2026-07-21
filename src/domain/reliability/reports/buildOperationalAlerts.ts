import {
  PLANNING_PERIODS,
  priorityFromScore,
  riskLevelFromScore,
  type MonthlyOperationalRisk,
  type OperationalAlert,
  type PlanningPeriod,
  type AlertCategory,
  type AlertStatus,
} from "./operationalAlertsTypes";

function alert(input: {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  assetId: string;
  assetName?: string;
  field?: string;
  probability: number;
  impact: number;
  status: AlertStatus;
  recommendedAction: string;
  responsible: string;
  department?: string;
  company?: string;
  targetDate: string;
  origin: string;
  relatedIds?: string[];
  indicators?: string[];
  history?: OperationalAlert["history"];
  createdAt: string;
}): OperationalAlert {
  const riskScore = input.probability * input.impact;
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    category: input.category,
    assetId: input.assetId,
    assetName: input.assetName ?? input.assetId,
    field: input.field ?? "COSTAYACO",
    probability: input.probability,
    impact: input.impact,
    riskScore,
    riskLevel: riskLevelFromScore(riskScore),
    priority: priorityFromScore(riskScore, input.category),
    status: input.status,
    recommendedAction: input.recommendedAction,
    responsible: input.responsible,
    department: input.department ?? "Confiabilidad",
    company: input.company ?? "COPOWER",
    targetDate: input.targetDate,
    origin: input.origin,
    relatedIds: input.relatedIds ?? [],
    indicators: input.indicators ?? [],
    history: input.history ?? [{ date: input.createdAt, note: "Alerta generada automáticamente" }],
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  };
}

function periodSuffix(period: PlanningPeriod) {
  return period.key.replace("-", "");
}

function targetDay(period: PlanningPeriod, day: number) {
  const month = period.key.split("-")[1];
  return `${period.year}-${month}-${String(day).padStart(2, "0")}`;
}

/** Genera alertas operacionales para el período de planificación seleccionado. */
export function buildOperationalAlertsForPeriod(periodKey: string): {
  period: PlanningPeriod;
  alerts: OperationalAlert[];
  monthlyRisks: MonthlyOperationalRisk[];
  reportTitle: string;
} {
  const period = PLANNING_PERIODS.find((p) => p.key === periodKey) ?? PLANNING_PERIODS[0];
  const suffix = periodSuffix(period);
  const created = targetDay(period, 1);

  const base: OperationalAlert[] = [
    alert({
      id: `OA-${suffix}-01`,
      title: "Seguimiento a estabilidad del CPW06 tras perturbaciones eléctricas",
      description:
        "CPW06 concentró fallas contractuales en junio (perturbación de red, sobrecarga e intercooler). Requiere vigilancia reforzada para evitar reincidencias en el período.",
      category: "Activo Crítico",
      assetId: "CPW06",
      probability: 4,
      impact: 5,
      status: "Activa",
      recommendedAction: "Incrementar monitoreo predictivo y verificar sistema de protección.",
      responsible: "Confiabilidad",
      targetDate: targetDay(period, 15),
      origin: "Eventos + APM (Risk Score / fallas ≥3)",
      relatedIds: ["RCA-003", "RCA-004", "RCA-005", "AH-CPW06", "CAPA-006"],
      indicators: ["Fallas jun: 3", "MTBF 222 h", "Disp. 99.03%", "IIO alto"],
      history: [
        { date: created, note: "Alerta priorizada por alta frecuencia de fallas en activo crítico" },
        { date: targetDay(period, 3), note: "Incluida en informe ejecutivo mensual" },
      ],
      createdAt: created,
    }),
    alert({
      id: `OA-${suffix}-02`,
      title: "Verificar desempeño del CPW03 después de la detonación corregida",
      description:
        "Tras RCA-001 e intervención de combustión, validar estabilidad operativa y ausencia de detonaciones en el mes de planificación.",
      category: "Condición del Equipo",
      assetId: "CPW03",
      probability: 3,
      impact: 4,
      status: "En seguimiento",
      recommendedAction: "Ejecutar inspección mecánica y monitoreo de combustión/presión de gas.",
      responsible: "Mantenimiento Mecánico",
      department: "Mantenimiento",
      targetDate: targetDay(period, 12),
      origin: "RCA-001 + MSO-002",
      relatedIds: ["RCA-001", "IP-GTE-001", "CAPA-001", "MSO-002"],
      indicators: ["Disp. 98.75%", "MTTR 5 h", "Evento detonación 11-jun"],
      createdAt: created,
    }),
    alert({
      id: `OA-${suffix}-03`,
      title: "Confirmar disponibilidad de repuestos del sistema de admisión CPW01",
      description:
        "RCA-002 evidenció daño en admisión/flexible. Inventario crítico de flexibles en cero o sin cobertura confirmada.",
      category: "Repuesto Crítico",
      assetId: "CPW01",
      probability: 4,
      impact: 4,
      status: "Activa",
      recommendedAction: "Solicitar repuesto crítico y confirmar stock mínimo en almacén.",
      responsible: "Almacén",
      department: "Logística",
      company: "COPOWER",
      targetDate: targetDay(period, 8),
      origin: "Inventario + RCA-002",
      relatedIds: ["RCA-002", "IP-GTE-002", "CAPA-002"],
      indicators: ["Stock flexible: 0", "Lead time estimado: 10–15 d"],
      createdAt: created,
    }),
    alert({
      id: `OA-${suffix}-04`,
      title: "Monitorear estabilidad operativa de la MRU",
      description:
        "Paradas por NGL impactaron múltiples generadores. Health Index crítico y disponibilidad <98% del sistema de tratamiento.",
      category: "Sistema de Gas",
      assetId: "MRU",
      probability: 5,
      impact: 5,
      status: "Activa",
      recommendedAction: "Crear plan de intervención y escalar al cliente (Gran Tierra).",
      responsible: "Operaciones",
      department: "Operaciones",
      company: "GTE",
      targetDate: targetDay(period, 10),
      origin: "APM AH-MRU + RCA-006 · Disp. <98%",
      relatedIds: ["RCA-006", "IP-GTE-006", "AH-MRU", "CAPA-008"],
      indicators: ["Disp. ~92.5%", "Risk Score >20", "Impacto sistémico alto"],
      createdAt: created,
    }),
    alert({
      id: `OA-${suffix}-05`,
      title: "Validar efectividad de las acciones implementadas sobre potencia inversa",
      description:
        "Acciones de load sharing / gobernación (IP-GTE-005 / CAPA-004) deben verificarse en operación real del período.",
      category: "Seguimiento de Acciones",
      assetId: "CPW05",
      assetName: "CPW05 / CPW06",
      probability: 3,
      impact: 3,
      status: "En seguimiento",
      recommendedAction: "Verificar efectividad en campo y cerrar CAPA asociada.",
      responsible: "Instrumentación",
      department: "Instrumentación",
      targetDate: targetDay(period, 18),
      origin: "CAPA + RCA-005",
      relatedIds: ["RCA-005", "IP-GTE-005", "CAPA-004"],
      indicators: ["Acciones cerradas pendientes de efectividad", "Transitorios post-MRU"],
      createdAt: created,
    }),
    alert({
      id: `OA-${suffix}-06`,
      title: `Revisar tendencia de disponibilidad del parque durante ${period.monthName.toLowerCase()}`,
      description:
        "El cumplimiento de la meta contractual ≥98% puede verse afectado por reincidencias de junio y estado de MRU.",
      category: "Indicadores",
      assetId: "PARQUE",
      assetName: "Parque Costayaco",
      probability: 3,
      impact: 4,
      status: "Activa",
      recommendedAction: "Actualizar procedimiento operativo y priorizar activos de mayor impacto.",
      responsible: "Ingeniería de Confiabilidad",
      targetDate: targetDay(period, 20),
      origin: "Contrato / KPIs · meta disponibilidad 98%",
      relatedIds: ["CAPA-015", "SLA-DISP-98"],
      indicators: ["Meta disp. ≥98%", "PF_contr junio: 20 h"],
      createdAt: created,
    }),
  ];

  const extras: OperationalAlert[] = [
    alert({
      id: `OA-${suffix}-07`,
      title: "Cerrar acciones CAPA vencidas o críticas abiertas",
      description:
        "Existen acciones correctivas/preventivas abiertas o vencidas que pueden comprometer el cierre del período.",
      category: "Acción Vencida",
      assetId: "PARQUE",
      assetName: "Portafolio CAPA",
      probability: 4,
      impact: 3,
      status: "Activa",
      recommendedAction: "Priorizar cierre de CAPA críticas y actualizar evidencias.",
      responsible: "Confiabilidad",
      targetDate: targetDay(period, 7),
      origin: "Módulo CAPA · acciones abiertas/vencidas",
      relatedIds: ["CAPA-017", "CAPA-018", "CAPA-020"],
      indicators: ["Acciones vencidas >0", "Críticas abiertas >0"],
      createdAt: created,
    }),
    alert({
      id: `OA-${suffix}-08`,
      title: "MTBF decreciente / alta frecuencia en activos Costayaco",
      description:
        "CPW06 y MRU muestran señales de degradación (MTBF bajo / fallas repetitivas). Riesgo de afectación a generación del mes.",
      category: "MTBF Decreciente",
      assetId: "CPW06",
      probability: 4,
      impact: 4,
      status: "Activa",
      recommendedAction: "Programar mantenimiento preventivo e inspección detallada.",
      responsible: "Confiabilidad",
      targetDate: targetDay(period, 14),
      origin: "Regla APM · MTBF ↓ / fallas ≥3",
      relatedIds: ["AH-CPW06", "MSO-001"],
      indicators: ["MTBF CPW06 222 h", "Tendencia fallas creciente"],
      createdAt: created,
    }),
    alert({
      id: `OA-${suffix}-09`,
      title: "Vigilancia del sistema eléctrico post-perturbación de red",
      description:
        "Evento del 27-jun afectó CPW06/CPW07. Validar AVR, sincronismo y respuesta a transitorios externos.",
      category: "Sistema Eléctrico",
      assetId: "CPW07",
      assetName: "CPW06 / CPW07",
      probability: 3,
      impact: 4,
      status: period.key === "2026-07" ? "En seguimiento" : "Activa",
      recommendedAction: "Verificar sistema de protección y validar sincronismo.",
      responsible: "Eléctrico",
      department: "Eléctrico",
      targetDate: targetDay(period, 16),
      origin: "RCA-004 + Evento jun-27",
      relatedIds: ["RCA-004", "IP-GTE-004", "CAPA-019"],
      indicators: ["Origen externo confirmado", "MTTR CPW07 5 h"],
      createdAt: created,
    }),
    alert({
      id: `OA-${suffix}-10`,
      title: "Mantenimiento pendiente: termografía flota CPW",
      description:
        "Ruta predictiva de termografía (MSO/CAPA) aún no consolidada; riesgo residual en motores de Costayaco.",
      category: "Mantenimiento Pendiente",
      assetId: "CPW03",
      assetName: "Flota CPW",
      probability: 3,
      impact: 3,
      status: period.key === "2026-09" ? "Mitigada" : "Activa",
      recommendedAction: "Programar mantenimiento preventivo / ruta termográfica mensual.",
      responsible: "Eléctrico",
      department: "Eléctrico",
      targetDate: targetDay(period, 22),
      origin: "MSO-001 + CAPA-018",
      relatedIds: ["MSO-001", "CAPA-018"],
      indicators: ["Avance CAPA termografía parcial"],
      createdAt: created,
    }),
  ];

  // Variación ligera por período (planificación dinámica)
  if (period.key === "2026-08") {
    extras.push(
      alert({
        id: `OA-${suffix}-11`,
        title: "Preparar contingencia operativa ante baja disponibilidad MRU",
        description:
          "Si la MRU no sostiene estabilidad en julio, agosto requiere plan de contingencia de gas y priorización de carga.",
        category: "Operación",
        assetId: "MRU",
        probability: 4,
        impact: 5,
        status: "Activa",
        recommendedAction: "Actualizar procedimiento operativo y escalar al cliente.",
        responsible: "Operaciones",
        department: "Operaciones",
        company: "GTE",
        targetDate: targetDay(period, 5),
        origin: "Planificación operacional · proyección post-julio",
        relatedIds: ["AH-MRU", "CAPA-013"],
        indicators: ["Dependencia gas MRU", "Impacto multi-unidad"],
        createdAt: created,
      }),
    );
  }

  if (period.key === "2026-09") {
    extras.push(
      alert({
        id: `OA-${suffix}-11`,
        title: "Cierre trimestral: validar lecciones aprendidas de detonación y admisión",
        description:
          "Consolidar efectividad de RCA-001/002 y ajustar frecuencias MSO antes del cierre de trimestre.",
        category: "Contrato",
        assetId: "PARQUE",
        assetName: "Parque Costayaco",
        probability: 2,
        impact: 4,
        status: "En seguimiento",
        recommendedAction: "Crear RCA solo si reincide; de lo contrario cerrar verificación de efectividad.",
        responsible: "Ingeniería de Confiabilidad",
        targetDate: targetDay(period, 25),
        origin: "Cierre trimestral · contrato / reunión GTE",
        relatedIds: ["RCA-001", "RCA-002", "REU-GTE-JUL-2026"],
        indicators: ["Efectividad CAPA combustión/admisión"],
        createdAt: created,
      }),
    );
  }

  const alerts = [...base, ...extras].sort(
    (a, b) =>
      (b.priority === "Crítica" ? 4 : b.priority === "Alta" ? 3 : b.priority === "Media" ? 2 : 1) -
        (a.priority === "Crítica" ? 4 : a.priority === "Alta" ? 3 : a.priority === "Media" ? 2 : 1) ||
      b.riskScore - a.riskScore,
  );

  const monthlyRisks: MonthlyOperationalRisk[] = alerts.slice(0, 10).map((a, i) => ({
    id: `MOR-${suffix}-${i + 1}`,
    month: period.monthName,
    year: period.year,
    riskType: a.category,
    description: a.title,
    affectedAssets: [a.assetName],
    probability: a.probability,
    impact: a.impact,
    riskLevel: a.riskLevel,
    mitigationPlan: a.recommendedAction,
    status: a.status,
    createdAt: created,
  }));

  return {
    period,
    alerts,
    monthlyRisks,
    reportTitle: `Principales Riesgos y Alertas Operacionales - ${period.monthName}`,
  };
}

export function operationalAlertKpis(alerts: OperationalAlert[]) {
  const active = alerts.filter((a) => a.status === "Activa" || a.status === "En seguimiento");
  const critical = alerts.filter((a) => a.priority === "Crítica" && a.status !== "Cerrada").length;
  const assetsAtRisk = new Set(
    alerts
      .filter((a) => a.status !== "Cerrada" && (a.riskLevel === "Alto" || a.riskLevel === "Crítico"))
      .map((a) => a.assetId),
  ).size;
  const pendingMto = alerts.filter(
    (a) => a.category === "Mantenimiento Pendiente" && a.status !== "Cerrada" && a.status !== "Mitigada",
  ).length;
  const overdueActions = alerts.filter(
    (a) => a.category === "Acción Vencida" && a.status !== "Cerrada",
  ).length;
  const parkRisk =
    critical > 0
      ? "Crítico"
      : alerts.some((a) => a.riskLevel === "Alto" && a.status !== "Cerrada")
        ? "Alto"
        : alerts.some((a) => a.riskLevel === "Medio")
          ? "Medio"
          : "Bajo";

  return {
    active: active.length,
    critical,
    assetsAtRisk,
    pendingMto,
    overdueActions,
    parkRisk,
    closed: alerts.filter((a) => a.status === "Cerrada" || a.status === "Mitigada").length,
    open: alerts.filter((a) => a.status === "Activa" || a.status === "En seguimiento").length,
  };
}

export function groupAlerts<T extends string>(alerts: OperationalAlert[], key: (a: OperationalAlert) => T) {
  const map = new Map<T, number>();
  for (const a of alerts) {
    const k = key(a);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}
