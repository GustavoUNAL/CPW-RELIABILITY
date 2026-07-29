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

/** Bump para forzar rehidratación desde seed (localStorage). */
export const GTE_JUNE_RCA_SEED = "2026-07-26-rca-r6";

function normAsset(id: string) {
  return id.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Solo RCA con PDF formal (carpeta data/RCA → public/rca). */
export function rcaHasFormalDocument(rca: RcaCaseDetail): boolean {
  return (rca.pdfUrls?.length ?? 0) > 0;
}

function assetMatchesEvent(equipmentNorm: string, asset: string): boolean {
  const a = normAsset(asset);
  if (!a) return false;
  if (equipmentNorm === "PARQUE" || equipmentNorm.includes("PARQUE")) return true;
  return equipmentNorm.includes(a) || a.includes(equipmentNorm);
}

/**
 * Cruza un evento de bitácora solo con RCA formales entregados (PDF en carpeta RCA).
 * Fecha + equipo / activos vinculados. Los casos sin PDF (analíticos) no se relacionan aquí.
 */
export function findRcaCasesForEvent(
  date: string,
  equipment: string,
  cases: RcaCaseDetail[] = buildGteJuneRcaCases(),
): RcaCaseDetail[] {
  const eq = normAsset(equipment);
  if (!date || !eq) return [];
  return cases.filter((rca) => {
    if (!rcaHasFormalDocument(rca)) return false;
    if (rca.eventDate !== date) return false;
    return rca.linkedAssets.some((asset) => assetMatchesEvent(eq, asset));
  });
}

/**
 * Catálogo de casos RCA junio 2026 — alineado a bitácora consolidada:
 * 7 fallas COPOWER · 18,22 h PF_contr · + externo 28-jun (no imputable) · + FO salida de la máquina 22-jun (PDF).
 *
 * IDs ↔ planes de intervención:
 * RCA-001 ↔ IP-GTE-001 (K4) · RCA-002 ↔ IP-GTE-002 (escape) · RCA-003 ↔ IP-GTE-003 (intercooler)
 * RCA-004 ↔ IP-GTE-004 (Q>) · RCA-005 ↔ IP-GTE-005 (externo) · RCA-006 ↔ IP-GTE-006 (MRU)
 * RCA-007 ↔ IP-GTE-007 (FO-44) · RCA-008 ↔ IP-GTE-009 (CPW03) · RCA-030 = PDF formal 22-jun
 */
export function buildGteJuneRcaCases(): RcaCaseDetail[] {
  return [
    {
      id: "RCA-001",
      title: "Detonación por señal errónea relé K4 — CPW01",
      eventLabel: "Detonación relé K4",
      status: "Cerrado",
      priority: "Alta",
      equipment: "CPW01",
      linkedAssets: ["CPW01"],
      eventDate: "2026-06-07",
      problem:
        "07-jun-2026: shutdown por detonación asociada a señal errónea del relé K4. PF_contr 3,00 h. Se cambia base y relé K4.",
      immediateCause: "Señal espuria en base/relé K4 que provocó corte de gas y detonación.",
      rootCause:
        "Envejecimiento/contacto deficiente de componentes de tablero sin rutina de inspección que lo detecte; ausencia de señal redundante ante lectura errónea única.",
      actions: [
        "Reemplazo de base y relé K4.",
        "Verificación de cableado y contacto de shutoff de gas.",
        "Prueba de arranque y estabilidad de combustión.",
        "Incluir bases de relé en checklist eléctrico post-evento.",
      ],
      result: "Equipo restablecido; sin reincidencias K4 en el periodo de seguimiento.",
      linkedPlanId: "IP-GTE-001",
      category: "Sensores / Relés",
      responsible: "Eléctrico / Confiabilidad",
      company: "COPOWER",
      closeDate: "2026-07-10",
    },
    {
      id: "RCA-002",
      title: "Fuga flexible de escape — CPW01",
      eventLabel: "Falla flexible múltiple de escape",
      status: "Cerrado",
      priority: "Alta",
      equipment: "CPW01",
      linkedAssets: ["CPW01"],
      eventDate: "2026-06-05",
      problem:
        "05-jun-2026: salida a correctivo por falla del flexible de escape (afectación post-exostación 02-jun). PF_contr 2,00 h.",
      immediateCause: "Fuga en junta/flexible de escape revelada en operación.",
      rootCause: "Deterioro post-mantenimiento en tren de admisión/escape; montaje sin checklist de torque obligatorio.",
      actions: [
        "Inspección completa del tren de admisión/escape.",
        "Cambio de flexibles / junta turbo.",
        "Verificación de torque.",
        "Actualización del procedimiento de montaje.",
        "Lista de chequeo antes del arranque.",
      ],
      result: "No se presentaron nuevas fugas de escape en seguimiento.",
      linkedPlanId: "IP-GTE-002",
      category: "Admisión / Escape",
      responsible: "Mecánico",
      company: "COPOWER",
      closeDate: "2026-07-12",
    },
    {
      id: "RCA-003",
      title: "Obstrucción del intercooler por secuestrante — CPW06",
      eventLabel: "Obstrucción del intercooler",
      status: "Cerrado",
      priority: "Media",
      equipment: "CPW06",
      linkedAssets: ["CPW06"],
      eventDate: "2026-06-03",
      problem:
        "03-jun-2026: cambio de intercooler por exceso de residuo de secuestrante. PF_contr 4,00 h. Responsabilidad compartida GTE + COPOWER.",
      immediateCause: "Reducción del flujo de aire de admisión por obstrucción del núcleo.",
      rootCause:
        "Contaminantes del programa de tratamiento (secuestrante H2S) sin barrera de filtración suficiente antes del intercambiador.",
      actions: [
        "Inspección interna del intercooler.",
        "Análisis de secuestrante / calidad de gas.",
        "Cambio de núcleo / limpieza.",
        "Definir inspección mensual con dosificación activa.",
        "Monitoreo de ΔP y temperatura de admisión.",
      ],
      result: "Núcleo cambiado; ΔP normal; temperaturas estabilizadas.",
      linkedPlanId: "IP-GTE-003",
      category: "Tratamiento gas / Enfriamiento",
      responsible: "Mecánico",
      company: "GTE + COPOWER",
      closeDate: "2026-07-09",
    },
    {
      id: "RCA-004",
      title: "Salida CPW-06 por protección Q> (evento transitorio MRU)",
      eventLabel: "Disparo por sobrepotencia reactiva Q>",
      status: "En curso",
      priority: "Alta",
      equipment: "CPW06",
      linkedAssets: ["CPW06", "CPW07", "MRU"],
      eventDate: "2026-06-27",
      problem:
        "Tras salida de la MRU, CPW-06 disparó protección Q>. FO sin horas oficiales; FS≈2,30 h y ≈2.420 kWh estimados solo por tendencia. Causa raíz y responsabilidad en investigación (AVR / Q> / DEIF / CPW-07).",
      immediateCause:
        "Actuación de la protección Q> por incremento súbito de potencia reactiva durante la salida de la MRU.",
      rootCause:
        "No determinada. Sin evidencia suficiente para atribuir a un componente específico; investigación abierta.",
      actions: [
        "Revisión de tendencias, unifilares y modos de operación (realizada).",
        "Revisión preliminar AVR y registros DEIF (realizada).",
        "Mesa técnica Operaciones e Ingeniería (realizada).",
        "Validar configuración Q> y AVR DVC-550 (pendiente).",
        "Analizar interacción CPW-06/CPW-07 y coordinación de protecciones (pendiente).",
      ],
      result:
        "Evento en investigación. No confirmar causa raíz ni asignar responsabilidad hasta validar configuraciones.",
      linkedPlanId: "IP-GTE-004",
      category: "Protecciones / AVR",
      responsible: "Eléctrico / Confiabilidad",
      company: "COPOWER",
      closeDate: null,
    },
    {
      id: "RCA-005",
      title: "Perturbación externa en la red de 34,5 kV",
      eventLabel: "Falla por salida de la máquina / red externa 34,5 kV",
      status: "Cerrado",
      priority: "Alta",
      equipment: "CPW01 / CPW02 / CPW03 / CPW05 / CPW06 / CPW07",
      linkedAssets: ["CPW01", "CPW02", "CPW03", "CPW05", "CPW06", "CPW07"],
      eventDate: "2026-06-28",
      problem:
        "Perturbación externa en la red de 34,5 kV (gallinazo / salida de la máquina), pérdida MRU + Chiller y salida de múltiples unidades; sobrecarga CPW-06 y parada manual CPW-05. FS=0,38 h (07:10–07:33); ≈1.730 kWh. No imputable a COPOWER.",
      immediateCause:
        "Actuación de la protección por salida de la máquina por perturbación externa de la red de 34,5 kV, con pérdida de MRU + Chiller y redistribución de carga (sobrecarga CPW-06).",
      rootCause:
        "Apertura del circuito 34,5 kV Mocoa–Villagarzón por sobrecorriente (gallinazo). Sin fallas propias de los grupos electrógenos.",
      actions: [
        "Inspección de equipos y verificación de ausencia de fallas internas.",
        "Ingreso secuencial de unidades y validación de parámetros.",
        "Comprobación del funcionamiento de protecciones.",
        "Inspección de gobernación de CPW-05 y CPW-06.",
        "Mantener coordinación con CCM ante contingencias externas.",
      ],
      result:
        "Operación estabilizada; protecciones actuaron correctamente; sin anomalías atribuibles a los grupos. FS/kWh de la ficha son estimaciones técnicas.",
      linkedPlanId: "IP-GTE-005",
      category: "Red eléctrica externa",
      responsible: "Externo / coordinación CCM",
      company: "Externo",
      closeDate: "2026-06-28",
    },
    {
      id: "RCA-006",
      title: "Baja disponibilidad de la MRU",
      eventLabel: "Baja disponibilidad MRU",
      status: "En curso",
      priority: "Crítica",
      equipment: "MRU",
      linkedAssets: ["MRU"],
      eventDate: "2026-06-25",
      problem: "Paradas repetitivas de la MRU (mto / NGL) con alto impacto en PF_cli y habilitantes de fallas (p. ej. Q> 27-jun).",
      immediateCause: "Indisponibilidad del sistema de tratamiento de gas.",
      rootCause:
        "Condiciones operacionales asociadas al manejo de NGL y mantenimiento del sistema de tratamiento (responsabilidad GTE).",
      actions: [
        "RCA de la MRU (en curso GTE).",
        "Programa predictivo de la MRU.",
        "Monitoreo continuo de nivel NGL.",
        "Alarmas anticipadas NGL/MRU.",
        "Revisión del sistema Quincy.",
      ],
      result: "Acciones GTE en curso; seguimiento conjunto GTE–COPOWER.",
      linkedPlanId: "IP-GTE-006",
      category: "MRU / NGL",
      responsible: "Gran Tierra",
      company: "GTE",
      closeDate: null,
    },
    {
      id: "RCA-007",
      title: "Cascada FO-44 — selectividad RL / 480 V",
      eventLabel: "FO-44 EEP Jauno–Piamonte + RL/480 V",
      status: "En curso",
      priority: "Crítica",
      equipment: "CPW04 / CPW05",
      linkedAssets: ["CPW04", "CPW05", "CPW06", "CPW07", "MRU", "Parque"],
      eventDate: "2026-06-23",
      problem:
        "23–24 jun: cascada EEP Jauno–Piamonte + RL sin selectividad + disparo 480 V. PF_contr CPW04 1,00 h + CPW05 2,00 h = 3,00 h. Ajuste final 8×/15× aplicado; efectividad pendiente de validación.",
      immediateCause: "Propagación del disturbio EEP a auxiliares 480 V por falta de selectividad RL.",
      rootCause:
        "Iniciador externo (reconectador EEP inestable) + habilitante interno accionable: descoordinación de protecciones RL→480 V.",
      actions: [
        "Estudio formal de coordinación 34,5 kV → RL → 480 V (pendiente).",
        "Aplicar ajuste Isd=8×Ir / Ii=15×In en ambos pares (hecho 24-jun).",
        "Descargar data TRIP y validar corrientes/fases (pendiente).",
        "Gestionar EEP y monitoreo de calidad de energía en frontera (pendiente).",
        "Evaluar desacople/respaldo de auxiliares 480 V (pendiente).",
      ],
      result: "Ajuste aplicado; validación de no-reincidencia y estudio de coordinación pendientes.",
      linkedPlanId: "IP-GTE-007",
      category: "Protecciones / Red externa",
      responsible: "Eléctrico + gestión EEP",
      company: "COPOWER / EEP",
      closeDate: null,
    },
    {
      id: "RCA-008",
      title: "Salida de servicio por perturbación transitoria — CPW03",
      eventLabel: "Perturbación transitoria durante la operación",
      status: "En curso",
      priority: "Alta",
      equipment: "CPW03",
      linkedAssets: ["CPW03"],
      eventDate: "2026-06-11",
      problem:
        "CPW-03 (J320, ~669 kW / 64 %): perturbación transitoria durante la operación con reducción abrupta de potencia y corriente. Salida de servicio por lógica de protección; retorno 19:25 (FS≈3,92 h). Sin daño físico ni reemplazo de componentes. Energía no generada ≈2.620 kWh (estimado).",
      immediateCause:
        "Salida automática del grupo electrógeno como respuesta a una condición transitoria detectada durante la operación.",
      rootCause:
        "No determinada. La evidencia disponible no permite identificar de manera concluyente el mecanismo físico que originó la perturbación.",
      actions: [
        "Inspección general del grupo electrógeno — sin anomalías.",
        "Verificación de condiciones operativas y restablecimiento.",
        "Arranque, sincronización y retorno a línea 19:25.",
        "PENDIENTE: fortalecer captura de información de diagnóstico en eventos transitorios.",
        "PENDIENTE: confirmar energía no generada con totalizadores de generación.",
      ],
      result:
        "Equipo operando normalmente tras el restablecimiento. Causa raíz no determinada; diagnóstico abierto (IP-GTE-009).",
      linkedPlanId: "IP-GTE-009",
      category: "Red / Transitorio",
      responsible: "Confiabilidad / Eléctrico",
      company: "COPOWER",
      closeDate: null,
    },
    {
      id: "RCA-030",
      title: "Shutdown General Costayaco — salida de la máquina · EEP 34.5 kV",
      eventLabel: "Salida de la máquina — falla en reconectador EEP 34.5 kV",
      status: "Cerrado",
      priority: "Alta",
      equipment: "Parque Costayaco (CPW01–07, CPW12, JINAN-01/02)",
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
        "22-jun-2026 03:49 hrs: Shutdown General en Campo Costayaco que afectó CPW-01 a CPW-07, CPW-12, JINAN-01 y JINAN-02. Perturbación en red 34.5 kV EEP (circuito Puerto Limón) generó salida de la máquina en la barra; a las 03:52 salen Turbina Soenergy y MRU; 03:53 CPW-01/02/03 disparan I>> etapa 2 en < 2 s.",
      immediateCause:
        "Apertura del reconectador EEP → salida de la máquina → colapso de tensión de barra → AVR inyecta Q → sobrecorriente I>> etapa 2 (CPW-03 304 A, CPW-01 317 A, CPW-02 306 A) con GB OFF coordinado.",
      rootCause:
        "Hipótesis principal: falla en reconectador EEP 34.5 kV Puerto Limón como iniciador (perturbación común externa). Hipótesis alterna: salida de Turbina Soenergy como iniciador. Causa raíz definitiva pendiente de SOE turbina, registros MRU, informe EEP y SCADA sincronizado. Descarte: falla interna de generadores (actuación simultánea < 2 s).",
      actions: [
        "GB OFF automático por protecciones; activación Diesel CAT #2-3-4 + CPW diesel para auxiliares.",
        "Verificación de integridad: generadores, excitación, gobernadores, protecciones y auxiliares.",
        "Restablecimiento: sincronización al SIN ~04:08; turbina Diesel 04:58 / GLP 05:13.",
        "Pendiente cierre: SOE Turbina Soenergy (crítica), alarmas MRU, informe EEP reconectador, secuencia frontera y SCADA con tiempo común.",
        "Preventivas: validar ajustes 50/51, 59, 81O/81U; protocolo de coordinación con EEP; respaldo de eventos eléctricos.",
      ],
      result:
        "PDF formal Sec. 30 entregado a GTE (2 archivos en data/RCA). Elaboró Daniel Durán · Revisó David Cornejo · Aprobó Wilson Oliveros (22-jun-26). Sin plan IP dedicado (evento distinto al 28-jun).",
      linkedPlanId: null,
      category: "Red eléctrica / salida de máquina",
      responsible: "Daniel Durán · Ing. Confiabilidad",
      company: "COPOWER",
      closeDate: "2026-06-22",
      pdfUrls: [
        "/rca/RCA-Costayaco-2026-06-22-Vector-Shift.pdf",
        "/rca/RCA-Costayaco-2026-06-22-Vector-Shift-rev1.pdf",
      ],
    },
  ];
}
