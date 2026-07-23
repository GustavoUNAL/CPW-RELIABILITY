export type RcaStatus = "Pendiente" | "En curso" | "Cerrado";
export type RcaPriority = "Crítica" | "Alta" | "Media" | "Baja";

export type RcaCaseDetail = {
  id: string;
  title: string;
  eventLabel: string;
  status: RcaStatus;
  priority: RcaPriority;
  equipment: string;
  linkedAssets: string[];
  eventDate: string;
  problem: string;
  immediateCause: string;
  rootCause: string;
  actions: string[];
  result: string;
  linkedPlanId: string | null;
  category: string;
  responsible: string;
  company: string;
  closeDate: string | null;
  /** Rutas públicas a PDF entregados (opcional). */
  pdfUrls?: string[];
};

function normAsset(id: string) {
  return id.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Cruza un evento de bitácora con RCA formales (fecha + equipo / activos vinculados). */
export function findRcaCasesForEvent(
  date: string,
  equipment: string,
  cases: RcaCaseDetail[] = buildGteJuneRcaCases(),
): RcaCaseDetail[] {
  const eq = normAsset(equipment);
  if (!date || !eq) return [];
  return cases.filter((rca) => {
    if (rca.eventDate !== date) return false;
    return rca.linkedAssets.some((asset) => {
      const a = normAsset(asset);
      return eq.includes(a) || a.includes(eq);
    });
  });
}

/** RCA de junio 2026 · Gran Tierra — solo eventos de mayor impacto / recurrencia / criticidad. */
export function buildGteJuneRcaCases(): RcaCaseDetail[] {
  return [
    {
      id: "RCA-001",
      title: "Detonación del Generador CPW03",
      eventLabel: "Detonación del motor",
      status: "Cerrado",
      priority: "Crítica",
      equipment: "CPW03",
      linkedAssets: ["CPW03"],
      eventDate: "2026-06-11",
      problem:
        "Detonación del motor durante la operación, ocasionando la salida del equipo y la ejecución de mantenimiento correctivo.",
      immediateCause: "Combustión anormal dentro del cilindro.",
      rootCause:
        "Variaciones en la calidad y presión del gas combustible, sumadas a un desajuste de los parámetros de combustión.",
      actions: [
        "Calibración del sistema de combustión.",
        "Verificación del sistema de encendido.",
        "Revisión del suministro de gas.",
        "Actualización de parámetros del motor.",
      ],
      result: "No se registraron nuevas detonaciones posteriores a la intervención.",
      linkedPlanId: "IP-GTE-001",
      category: "Combustión",
      responsible: "Confiabilidad",
      company: "COPOWER",
      closeDate: "2026-07-18",
    },
    {
      id: "RCA-002",
      title: "Daño del Sistema de Admisión (CPW01)",
      eventLabel: "Daño sistema de admisión",
      status: "Cerrado",
      priority: "Alta",
      equipment: "CPW01",
      linkedAssets: ["CPW01"],
      eventDate: "2026-06-03",
      problem: "Daño en el sistema de admisión y flexible del motor.",
      immediateCause: "Falla mecánica del conjunto de admisión.",
      rootCause: "Desgaste progresivo y esfuerzos mecánicos asociados al sistema de admisión.",
      actions: [
        "Sustitución del flexible.",
        "Inspección completa del sistema.",
        "Actualización del procedimiento de montaje.",
        "Lista de verificación antes del arranque.",
      ],
      result: "No se presentaron nuevas fallas en el sistema de admisión.",
      linkedPlanId: "IP-GTE-002",
      category: "Admisión/Escape",
      responsible: "Mecánico",
      company: "COPOWER",
      closeDate: "2026-07-12",
    },
    {
      id: "RCA-003",
      title: "Obstrucción del Intercooler (CPW06)",
      eventLabel: "Obstrucción del intercooler",
      status: "Cerrado",
      priority: "Media",
      equipment: "CPW06",
      linkedAssets: ["CPW06"],
      eventDate: "2026-06-03",
      problem: "Obstrucción del intercooler por acumulación de residuos.",
      immediateCause: "Reducción del flujo de aire de admisión.",
      rootCause:
        "Acumulación de residuos del sistema de tratamiento y mantenimiento preventivo insuficiente.",
      actions: [
        "Limpieza del intercooler.",
        "Revisión del sistema de tratamiento.",
        "Definición de frecuencia de inspección.",
      ],
      result: "Temperaturas de operación estabilizadas.",
      linkedPlanId: "IP-GTE-003",
      category: "Enfriamiento/Lub",
      responsible: "Mecánico",
      company: "COPOWER",
      closeDate: "2026-07-09",
    },
    {
      id: "RCA-004",
      title: "Perturbación Eléctrica del Parque",
      eventLabel: "Perturbación eléctrica",
      status: "Cerrado",
      priority: "Alta",
      equipment: "CPW06, CPW07",
      linkedAssets: ["CPW06", "CPW07"],
      eventDate: "2026-06-27",
      problem: "Salida de generadores por perturbación eléctrica del sistema.",
      immediateCause: "Variación de tensión y potencia reactiva.",
      rootCause: "Condición transitoria de la red eléctrica externa al generador.",
      actions: [
        "Revisión de ajustes de protecciones.",
        "Verificación del AVR.",
        "Validación del sincronismo.",
        "Análisis de registros eléctricos.",
      ],
      result:
        "No se identificaron fallas propias en los generadores; se confirmó el origen externo del evento.",
      linkedPlanId: "IP-GTE-004",
      category: "Red eléctrica",
      responsible: "Eléctrico",
      company: "GTE",
      closeDate: "2026-07-25",
    },
    {
      id: "RCA-005",
      title: "Potencia Inversa y Sobrecarga",
      eventLabel: "Potencia inversa y sobrecarga",
      status: "Cerrado",
      priority: "Alta",
      equipment: "CPW05, CPW06",
      linkedAssets: ["CPW05", "CPW06"],
      eventDate: "2026-06-28",
      problem: "Disparos por potencia inversa y sobrecarga posteriores a la salida de la MRU.",
      immediateCause: "Redistribución súbita de carga entre los generadores.",
      rootCause:
        "Pérdida de capacidad del sistema de tratamiento de gas (MRU), provocando cambios operativos en la generación.",
      actions: [
        "Revisión del Load Sharing.",
        "Calibración de gobernadores.",
        "Ajuste de protecciones.",
        "Actualización del procedimiento operativo.",
      ],
      result: "No se registraron nuevos eventos similares durante el período de seguimiento.",
      linkedPlanId: "IP-GTE-005",
      category: "Gobernación",
      responsible: "Instrumentación",
      company: "COPOWER",
      closeDate: "2026-07-28",
    },
    {
      id: "RCA-006",
      title: "Baja Disponibilidad de la MRU",
      eventLabel: "Baja disponibilidad MRU",
      status: "Cerrado",
      priority: "Crítica",
      equipment: "MRU",
      linkedAssets: ["MRU"],
      eventDate: "2026-06-25",
      problem: "Paradas repetitivas de la MRU con impacto sobre varios generadores.",
      immediateCause: "Indisponibilidad del sistema de tratamiento de gas.",
      rootCause:
        "Condiciones operacionales asociadas al manejo de NGL y mantenimiento del sistema de tratamiento.",
      actions: [
        "Programa de mantenimiento preventivo.",
        "Monitoreo continuo de NGL.",
        "Implementación de alarmas tempranas.",
        "Optimización del procedimiento operativo.",
      ],
      result: "Incremento de la disponibilidad del sistema y reducción de las afectaciones a la generación.",
      linkedPlanId: "IP-GTE-006",
      category: "MRU/NGL",
      responsible: "Gran Tierra",
      company: "GTE",
      closeDate: "2026-07-30",
    },
    {
      id: "RCA-030",
      title: "Shutdown General Costayaco — Vector Shift EEP 34.5 kV",
      eventLabel: "Vector Shift · falla reconectador EEP",
      status: "En curso",
      priority: "Crítica",
      equipment: "Parque Costayaco",
      linkedAssets: [
        "CPW01",
        "CPW02",
        "CPW03",
        "CPW04",
        "CPW05",
        "CPW06",
        "CPW07",
        "CPW12",
        "JIN01",
        "JIN02",
        "JINAN01",
        "JINAN02",
      ],
      eventDate: "2026-06-22",
      problem:
        "Shutdown general del parque de generación a gas en Costayaco por perturbación eléctrica externa (Vector Shift) asociada a falla en reconectador EEP 34.5 kV (circuito Puerto Limón).",
      immediateCause:
        "Actuación simultánea de protecciones de sobrecorriente (I>> etapa 2) ante condición severa de la barra.",
      rootCause:
        "Perturbación común de red externa (EEP); no se identifica falla interna de los generadores CPW-01/02/03 como causa raíz.",
      actions: [
        "Análisis eléctrico de secuencia de disparo (< 2 s).",
        "Validación de actuación correcta de protecciones.",
        "Seguimiento SOE turbina pendiente de cierre.",
        "Entrega de reporte RCA formal a Gran Tierra (Sec. 30).",
      ],
      result:
        "RCA formal entregado (2 PDF). Estado operativo del análisis: ABIERTO — pendiente SOE turbina.",
      linkedPlanId: "IP-GTE-004",
      category: "Red eléctrica",
      responsible: "COPOWER / Eléctrico",
      company: "COPOWER",
      closeDate: null,
      pdfUrls: [
        "/rca/RCA-Costayaco-2026-06-22-Vector-Shift.pdf",
        "/rca/RCA-Costayaco-2026-06-22-Vector-Shift-rev1.pdf",
      ],
    },
  ];
}
