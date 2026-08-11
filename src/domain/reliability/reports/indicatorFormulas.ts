/**
 * Fórmulas oficiales de indicadores — Orden 1 / TDR Tabla 13
 * (data/contratos/costayaco.pdf · GTE-PR-FO-028 §4.1).
 *
 * También documenta cómo las aplica cada fuente en la plataforma.
 */
import { CONTRACTUAL_KPI_TARGETS } from "../contracts/gteOrders";
import { RCA_COSTAYACO_EVENTOS } from "../rca/data";
import { loadOperacionPack } from "../operacion/api";
import { EFICIENCIA_FORMULA, eficienciaCampoSnapshot } from "../operacion/eficiencia";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";
import { MAINTENANCE_PLANS } from "./maintenancePlansData";

export type FormulaSource = "contrato" | "gte" | "copower";

export type IndicatorFormulaDef = {
  id: string;
  name: string;
  officialFormula: string;
  officialDescription: string;
  unit: string;
  threshold: string;
  frequency: string;
  source: string;
  gteHow: string;
  copowerHow: string;
};

export const INDICATOR_FORMULAS_SOURCE =
  "data/contratos/costayaco.pdf · Tabla 13 · Indicadores de desempeño por confiabilidad (págs. 183–184)";

export const INDICATOR_FORMULAS: IndicatorFormulaDef[] = [
  {
    id: "disp",
    name: "Disponibilidad operacional",
    officialFormula: "Disp% = (Horas disponibles / Horas programadas) × 100",
    officialDescription:
      "Tiempo efectivo de operación de las unidades respecto al tiempo total programado. Se mide individual y de grupo (configuración en paralelo).",
    unit: "%",
    threshold: "≥ 98%",
    frequency: "Mensual",
    source: INDICATOR_FORMULAS_SOURCE,
    gteHow:
      "PDF Análisis Indicadores. Julio: 80.65%. Misma fórmula; falta el desglose de horas no disponibles. AGC4 es la narrativa, no el puente de horas.",
    copowerHow:
      "Concertación: (OP + SB) / horas calendario. Stand-by cuenta como disponible. Julio: 97.73%.",
  },
  {
    id: "conf",
    name: "Confiabilidad del sistema",
    officialFormula: "Cálculo individual por generador + confiabilidad en paralelo",
    officialDescription:
      "El TDR no entrega una ecuación algebraica única: pide Conf individual y de grupo en paralelo, alineada a MTBF. Meta ≥ 98% (el PDF dice «≥ 98% disponibilidad de respaldo»).",
    unit: "%",
    threshold: "≥ 98%",
    frequency: "Mensual",
    source: INDICATOR_FORMULAS_SOURCE,
    gteHow:
      "Anexo oficial: 0 eventos correctivos imputables → Conf 100% (julio). Las FO-GE-033 externas no bajan el KPI.",
    copowerHow:
      "No aplica la fórmula contractual. El ETL clona Disp: reliability = (OP+SB)/calendario. Julio: 97.73%.",
  },
  {
    id: "mtbf",
    name: "MTBF",
    officialFormula: "MTBF = Horas operativas / N° de fallas registradas",
    officialDescription: "Tiempo medio entre fallas de una unidad de generación.",
    unit: "h",
    threshold: "Seguimiento (sin umbral fijo en Tabla 13)",
    frequency: "Mensual",
    source: INDICATOR_FORMULAS_SOURCE,
    gteHow: "OP del mes / fallas COPOWER concertadas (julio: 7.232 / 3 = 2.410,67 h).",
    copowerHow: "Misma fórmula sobre horas concertadas: OP / Numero de fallas.",
  },
  {
    id: "mttr",
    name: "MTTR",
    officialFormula: "MTTR = Σ tiempo de reparación / N° de fallas",
    officialDescription: "Tiempo medio para resolver una falla y restablecer la unidad.",
    unit: "h",
    threshold: "Seguimiento (sin umbral fijo en Tabla 13)",
    frequency: "Mensual",
    source: INDICATOR_FORMULAS_SOURCE,
    gteHow: "Σ PF_contr / fallas. Julio PF_contr = 0 → MTTR = 0 h.",
    copowerHow: "Σ PF_contr / fallas concertadas. Julio = 0 h.",
  },
  {
    id: "eff",
    name: "Eficiencia",
    officialFormula: "%Eff = 3412 / Heat Rate medido (BTU/kWh)   [× 100]",
    officialDescription:
      "Relación energía entregada / consumo de gas, ajustada por LHV. Meta ≥ 37%. El PDF omite el ×100; 3412 es el equivalente BTU de 1 kWh.",
    unit: "%",
    threshold: "≥ 37%",
    frequency: "Mensual",
    source: INDICATOR_FORMULAS_SOURCE,
    gteHow: "No publica η% en el PDF de julio. La plataforma estima desde el pack de operación diaria.",
    copowerHow: EFICIENCIA_FORMULA + ". HHV 1000 BTU/scf (el contrato pide LHV).",
  },
  {
    id: "pmc",
    name: "Capacidad de potencia (PMC)",
    officialFormula: "Pruebas de carga / registro de potencia medida",
    officialDescription: "Certificar mensualmente la potencia máxima continua vs la comprometida.",
    unit: "kW",
    threshold: "≥ PMC comprometida",
    frequency: "Mensual",
    source: INDICATOR_FORMULAS_SOURCE,
    gteHow: "Sin serie mensual cargada en la plataforma.",
    copowerHow: "Sin serie mensual cargada. Hay vista de pruebas de cargabilidad en Informes.",
  },
  {
    id: "mto",
    name: "Cumplimiento del plan de mantenimiento",
    officialFormula: "(Actividades ejecutadas / Actividades planificadas) × 100",
    officialDescription: "Gestión de la sábana anual: ejecución, desfase y control.",
    unit: "%",
    threshold: "≥ 100%",
    frequency: "Mensual",
    source: INDICATOR_FORMULAS_SOURCE,
    gteHow: "Sábana Putumayo (overlay julio oficial).",
    copowerHow: "Misma sábana. Julio: 19/19 = 100% (CPW-10 del 02 diferido a agosto: sin 350 h OP).",
  },
  {
    id: "hr",
    name: "Consumo específico de gas",
    officialFormula: "HR = SCM gas / kWh generado",
    officialDescription: "Gas consumido por unidad de energía. Meta: estabilidad, sin aumento.",
    unit: "scf/kWh",
    threshold: "Estable en el tiempo",
    frequency: "Mensual",
    source: INDICATOR_FORMULAS_SOURCE,
    gteHow: "No publicado en el anexo de julio.",
    copowerHow: "HR = gas_ft³ / kWh en días válidos del pack de operación (banda 6–20 ft³/kWh).",
  },
  {
    id: "shutdowns",
    name: "N° de shutdowns / mes (O&M)",
    officialFormula: "Conteo de apagones de campo imputables a O&M",
    officialDescription: "Eventos que dejan el campo sin generación por causa COPOWER.",
    unit: "eventos",
    threshold: "Ideal: 0 (5+ = riesgo de terminación)",
    frequency: "Mensual",
    source: INDICATOR_FORMULAS_SOURCE,
    gteHow: "Julio: 0 shutdowns de campo imputables. Las FO-GE-033 son MRU/externas + 1 detonación CPW-04.",
    copowerHow: "3 fallas concertadas (CPW06×2, CPW07×1) no equivalen a shutdown de campo.",
  },
  {
    id: "stock",
    name: "Cumplimiento de stock de repuestos",
    officialFormula: "(Repuestos en stock / requeridos) × 100",
    officialDescription: "Inventario de críticos vs mínimo contractual.",
    unit: "%",
    threshold: "≥ 100% (trimestral)",
    frequency: "Trimestral",
    source: INDICATOR_FORMULAS_SOURCE,
    gteHow: "Sin serie trimestral cargada.",
    copowerHow: "Vista de mínimos en Gestión de activos; no hay KPI mensual calculado.",
  },
  {
    id: "fo",
    name: "Reportes de falla (FO-GE-033 / RCA)",
    officialFormula: "Entrega documentada por evento",
    officialDescription: "Informe de falla obligatorio por cada evento reportable.",
    unit: "documentos",
    threshold: "Obligatorio (4% factura si falta)",
    frequency: "Por evento",
    source: INDICATOR_FORMULAS_SOURCE,
    gteHow: "Julio: 5 FO-GE-033 oficiales en data/Julio/RCA.",
    copowerHow: "Mismas 5 fichas en RCA Costayaco + PDFs en public/rca.",
  },
];

export type FormulaReviewTone = "ok" | "warn" | "gap" | "na";

export type FormulaReviewRow = {
  id: string;
  name: string;
  officialFormula: string;
  threshold: string;
  gteResult: string;
  cpwResult: string;
  recomputed: string;
  tone: FormulaReviewTone;
  verdict: string;
};

function pctLabel(v: number | null | undefined, digits = 2) {
  if (v == null || Number.isNaN(v)) return "N/D";
  return `${(v * 100).toFixed(digits)}%`;
}

function hoursLabel(v: number | null | undefined, digits = 2) {
  if (v == null || Number.isNaN(v)) return "N/D";
  return `${v.toFixed(digits)} h`;
}

/** Revisa resultados del mes contra la fórmula oficial (no contra el alias de cada fuente). */
export function reviewIndicatorFormulas(month: string): FormulaReviewRow[] {
  const gte = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey];
  const cpw = COPOWER_MONTHLY_DATA[month as CopowerMonthKey];
  const ym =
    month === "Jul" ? "2026-07" : month === "Jun" ? "2026-06" : month === "May" ? "2026-05" : null;

  const cal = cpw?.generationByEquipment.reduce((s, u) => s + (u.horasCalDia ?? 0), 0) ?? 0;
  const op = cpw?.summary.hoursOperated ?? 0;
  const sb = cpw?.summary.hoursStandby ?? 0;
  const pfContr = cpw?.summary.hoursFailureCopower ?? 0;
  const fails = cpw?.summary.copowerFailures ?? 0;
  const dispCpw = cal > 0 ? (op + sb) / cal : null;
  const confContract =
    cal > 0 ? (cal - pfContr) / cal : fails === 0 ? 1 : null;
  const mtbf = fails > 0 ? op / fails : null;
  const mttr = fails > 0 ? pfContr / fails : fails === 0 ? 0 : null;

  const sabana = MAINTENANCE_PLANS.monthlySummary.find((m) => m.monthKey === month);
  const mtoPct =
    sabana && sabana.programmedCount > 0
      ? sabana.executedCount / sabana.programmedCount
      : null;

  const foCount = ym
    ? RCA_COSTAYACO_EVENTOS.filter((e) => e.fecha?.startsWith(ym) && !/BLANK|-XX-/i.test(e.id))
        .length
    : 0;

  let effPct: number | null = null;
  let hr: number | null = null;
  try {
    const pack = loadOperacionPack();
    const snap = eficienciaCampoSnapshot(pack.resumenDiario, month);
    effPct = snap.general.eficienciaPct;
    hr = snap.general.heatRateFt3Kwh;
  } catch {
    /* pack no disponible en SSR/tests */
  }

  const metaDisp = CONTRACTUAL_KPI_TARGETS.availability;
  const metaConf = CONTRACTUAL_KPI_TARGETS.reliability;
  const metaEff = CONTRACTUAL_KPI_TARGETS.efficiencyPct;

  return [
    {
      id: "disp",
      name: "Disponibilidad",
      officialFormula: "Disp% = (Horas disponibles / Horas programadas) × 100",
      threshold: `≥ ${metaDisp * 100}%`,
      gteResult: pctLabel(gte?.kpi.availability),
      cpwResult: pctLabel(cpw?.kpi.availability),
      recomputed: dispCpw == null ? "N/D" : `${(dispCpw * 100).toFixed(2)}%  ← (OP+SB)/cal`,
      tone:
        gte?.kpi.availability != null && cpw?.kpi.availability != null
          ? Math.abs(gte.kpi.availability - cpw.kpi.availability) > 0.02
            ? "gap"
            : "ok"
          : "na",
      verdict:
        "Misma fórmula. COPOWER 97.73% (OP+SB). GTE publicado 80.65%. El hueco son horas que GTE da por no disponibles; AGC4 documentado no las explica solo.",
    },
    {
      id: "conf",
      name: "Confiabilidad",
      officialFormula: "Individual + en paralelo (Tabla 13; en práctica 1 − PF_contr/cal)",
      threshold: `≥ ${metaConf * 100}%`,
      gteResult: pctLabel(gte?.kpi.reliability),
      cpwResult: pctLabel(cpw?.kpi.reliability),
      recomputed:
        confContract == null ? "N/D" : `${(confContract * 100).toFixed(2)}%  ← (cal − PF_contr)/cal`,
      tone: "gap",
      verdict:
        "Causa raíz del desfase: COPOWER no calcula Conf; clona Disp. Con PF_contr = 0 h la fórmula contractual da ~100%, alineada a GTE (0 eventos correctivos).",
    },
    {
      id: "mtbf",
      name: "MTBF",
      officialFormula: "Horas operativas / N° de fallas",
      threshold: "Seguimiento",
      gteResult: hoursLabel(gte?.summary.mtbfHours),
      cpwResult: hoursLabel(cpw?.summary.mtbfHours),
      recomputed: mtbf == null ? "Sin fallas" : `${mtbf.toFixed(2)} h  ← ${op} / ${fails}`,
      tone:
        gte?.summary.mtbfHours != null &&
        cpw?.summary.mtbfHours != null &&
        Math.abs((gte.summary.mtbfHours ?? 0) - (cpw.summary.mtbfHours ?? 0)) < 1
          ? "ok"
          : "warn",
      verdict: "Misma fórmula en ambas fuentes (julio: 3 fallas concertadas).",
    },
    {
      id: "mttr",
      name: "MTTR",
      officialFormula: "Σ tiempo de reparación / N° de fallas",
      threshold: "Seguimiento",
      gteResult: hoursLabel(gte?.summary.mttrHours),
      cpwResult: hoursLabel(cpw?.summary.mttrHours),
      recomputed: mttr == null ? "N/D" : `${mttr.toFixed(2)} h  ← ${pfContr} / ${fails}`,
      tone: "ok",
      verdict: "Julio sin horas PF_contr → MTTR 0. Las FO externas no entran al numerador.",
    },
    {
      id: "eff",
      name: "Eficiencia",
      officialFormula: "%Eff = 3412 / HR(BTU/kWh) × 100",
      threshold: `≥ ${metaEff}%`,
      gteResult: "No publicado en PDF julio",
      cpwResult: effPct == null ? "N/D (sin gas/kWh emparejados)" : `${effPct.toFixed(1)}%`,
      recomputed:
        effPct == null
          ? "N/D"
          : `${effPct.toFixed(2)}%  ← 3412/(${hr?.toFixed(2) ?? "?"} ft³/kWh × 1000)`,
      tone: effPct == null ? "na" : effPct >= metaEff ? "ok" : "warn",
      verdict:
        effPct == null
          ? "El pack de operación no tiene días del mes con gas y kWh válidos (HR 6–20)."
          : `${effPct >= metaEff ? "Cumple meta ≥37%" : "Por debajo de la meta ≥37%"}. Estimado sobre días con gas emparejado del pack OP (no sobre los kWh concertados). La plataforma usa HHV 1000; el TDR pide ajuste por LHV.`,
    },
    {
      id: "mto",
      name: "Plan de mantenimiento",
      officialFormula: "Ejecutadas / planificadas × 100",
      threshold: "≥ 100%",
      gteResult: sabana
        ? `${sabana.executedCount}/${sabana.programmedCount}`
        : "N/D",
      cpwResult: sabana ? `${((mtoPct ?? 0) * 100).toFixed(0)}%` : "N/D",
      recomputed:
        mtoPct == null
          ? "N/D"
          : `${(mtoPct * 100).toFixed(1)}%  ← ${sabana?.executedCount}/${sabana?.programmedCount}`,
      tone: mtoPct == null ? "na" : mtoPct >= 1 ? "ok" : "warn",
      verdict:
        sabana?.pendingCount
          ? `Pendiente ${sabana.pendingCount} en el mes.`
          : month === "Jul"
            ? "Julio completo. CPW-10 del 02 se diferió a agosto: no cumplía 350 h OP (stand-by)."
            : "Sin pendientes en el mes.",
    },
    {
      id: "fo",
      name: "Reportes de falla (FO-GE-033)",
      officialFormula: "Entrega documentada por evento",
      threshold: "Obligatorio",
      gteResult: foCount ? `${foCount} FO oficiales` : "N/D",
      cpwResult: foCount ? `${foCount} fichas RCA` : "N/D",
      recomputed: String(foCount),
      tone: month === "Jul" && foCount === 5 ? "ok" : foCount > 0 ? "ok" : "na",
      verdict:
        month === "Jul"
          ? "5 FO-GE-033 en data/Julio/RCA (MRU 12/21/24/25 + detonación CPW-04)."
          : "Conteo desde el pack RCA Costayaco del mes.",
    },
  ];
}
