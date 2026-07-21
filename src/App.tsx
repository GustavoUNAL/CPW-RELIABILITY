import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bug,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  Gauge,
  LayoutDashboard,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExecutiveResumen } from "./domain/reliability/reports/ExecutiveResumen";
import { CopowerResumen } from "./domain/reliability/reports/CopowerResumen";
import { REPORT_DATASETS } from "./domain/reliability/reports";
import {
  GRAN_TIERRA_KPI_FROM_MONTHS,
  GRAN_TIERRA_MONTHLY_DATA,
  GRAN_TIERRA_MONTH_ORDER,
  granTierraMonthLabel,
  type GranTierraMonthKey,
} from "./domain/reliability/reports/granTierraMonthly";
import {
  COPOWER_KPI_FROM_MONTHS,
  COPOWER_MONTHLY_DATA,
  COPOWER_MONTH_ORDER,
  copowerMonthLabel,
  type CopowerMonthKey,
} from "./domain/reliability/reports/copowerMonthly";
import {
  CONTRACTUAL_KPI_TARGETS,
  CONTRACT_CALC_BASE,
  CONTRACT_FRAMEWORK_CONCLUSION,
  CONTRACT_ORDERS_OVERVIEW,
  getReliabilityDeduction,
  RELIABILITY_DEDUCTION_BANDS,
  SHUTDOWN_PENALTY_BANDS,
} from "./domain/reliability/contracts/gteOrders";
import type {
  ActionRow,
  EventRecord,
  MachineIndicatorRow,
  MaintenanceRow,
  PageKey,
  ReportKey,
} from "./domain/reliability/types";
import {
  assessTechnicalRisk,
  RISK_COMBINATION_RULES,
  RISK_PROBABILITY_RULES,
  RISK_SEVERITY_RULES,
  TECHNICAL_RISK_METHODOLOGY_NOTE,
  type RiskAxisLevel,
  type TechnicalRiskLabel,
} from "./domain/reliability/risk/technicalRisk";
import { MetricGlossary, MetricLabel, METRIC_DEFS } from "./domain/reliability/ui/metricDefs";

type AssessedMachineRow = MachineIndicatorRow & {
  probabilidad: RiskAxisLevel | null;
  severidad: RiskAxisLevel | null;
};

type NavItem = {
  key: PageKey;
  label: string;
  icon: ReactNode;
  description: string;
};

type ReportTree = {
  key: ReportKey;
  label: string;
};

type SortDirection = "asc" | "desc";
type SortConfig = {
  key: string;
  direction: SortDirection;
};

const NAV_ITEMS: NavItem[] = [
  { key: "resumen", label: "Resumen", icon: <LayoutDashboard size={16} />, description: "Vista general del periodo" },
  { key: "compromiso", label: "Compromiso contractual", icon: <FileText size={16} />, description: "Órdenes y metas de contrato" },
  { key: "generacion", label: "Generación", icon: <Zap size={16} />, description: "Generación por equipo y total" },
  { key: "maquinas", label: "Indicadores por máquina", icon: <Gauge size={16} />, description: "Indicadores por unidad" },
  { key: "indicadores", label: "Histórico de eventos", icon: <BarChart3 size={16} />, description: "Eventos registrados y filtro de fallas" },
  { key: "riesgos", label: "Riesgos", icon: <ShieldAlert size={16} />, description: "Matriz Probabilidad × Consecuencia" },
  { key: "desviaciones", label: "Desviaciones", icon: <TrendingUp size={16} />, description: "Brechas frente a meta" },
  { key: "malos_actores", label: "Activos críticos", icon: <Bug size={16} />, description: "Unidades y causas de mayor impacto" },
  { key: "causas_raiz", label: "Causas raíz", icon: <Search size={16} />, description: "Estado de RCA" },
  { key: "mantenimiento", label: "Mantenimiento", icon: <Wrench size={16} />, description: "Plan técnico" },
  { key: "acciones", label: "Plan de acción", icon: <ClipboardList size={16} />, description: "Seguimiento de acciones" },
];

const REPORT_TREE: ReportTree[] = [
  { key: "gran_tierra", label: "Gran Tierra Energy" },
];
const OM_COLOMBIA_URL =
  "https://copowercomco-my.sharepoint.com/personal/tec_op_copower_com_co/Documents/Forms/All.aspx?RootFolder=%2Fpersonal%2Ftec%5Fop%5Fcopower%5Fcom%5Fco%2FDocuments%2FO%26M%20COLOMBIA&View=%7B181C171F%2DD036%2D4F1F%2DBE86%2D9D8BEC441F3D%7D";

const percent = (value: number | null | undefined) =>
  value == null || Number.isNaN(value) ? "N/A" : `${(value * 100).toFixed(1)}%`;
const percentPrecise = (value: number | null | undefined, digits = 2) =>
  value == null || Number.isNaN(value) ? "N/A" : `${(value * 100).toFixed(digits)}%`;
const mwh = (value: number) => `${Math.round(value).toLocaleString("es-CO")} MWh`;
const kwh = (value: number) => `${Math.round(value).toLocaleString("es-CO")} kWh`;
const hours = (value: number | null | undefined) =>
  value == null || Number.isNaN(value) ? "N/A" : `${value.toFixed(2)} h`;
const riesgoBadgeClass = (riesgo: string) =>
  riesgo === "RIESGO MEDIO" ? "warning" : riesgo === "RIESGO ALTO" ? "danger" : riesgo === "N/A" ? "info" : "success";
const riskAxisLabel = (level: RiskAxisLevel | null) => (level == null ? "—" : level);
const riskScore = (riesgo: TechnicalRiskLabel) =>
  riesgo === "RIESGO ALTO" ? 2 : riesgo === "RIESGO MEDIO" ? 1 : riesgo === "RIESGO BAJO" ? 0 : null;
const cumplimientoBadgeClass = (cumplimiento: string) =>
  cumplimiento === "CUMPLE" ? "success" : cumplimiento === "N/A" ? "info" : "danger";

function App() {
  const [activeReport, setActiveReport] = useState<ReportKey>("gran_tierra");
  const [maintenanceByReport, setMaintenanceByReport] = useState<Record<ReportKey, MaintenanceRow[]>>({
    gran_tierra: REPORT_DATASETS.gran_tierra.maintenancePlan,
    copower: REPORT_DATASETS.copower.maintenancePlan,
  });
  const [actionsByReport, setActionsByReport] = useState<Record<ReportKey, ActionRow[]>>({
    gran_tierra: REPORT_DATASETS.gran_tierra.actionPlan,
    copower: REPORT_DATASETS.copower.actionPlan,
  });
  const [activePage, setActivePage] = useState<PageKey>("resumen");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [onlyFailureEvents, setOnlyFailureEvents] = useState(false);
  const [selectedFailureEvent, setSelectedFailureEvent] = useState<EventRecord | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("Jun");
  const [selectedMachine, setSelectedMachine] = useState<AssessedMachineRow | null>(null);
  const [isReportTreeCollapsed, setIsReportTreeCollapsed] = useState(false);
  const [isCopowerTreeCollapsed, setIsCopowerTreeCollapsed] = useState(false);
  const [tableSorts, setTableSorts] = useState<Record<string, SortConfig>>({
    eventos: { key: "date", direction: "desc" },
    maquinas: { key: "unidad", direction: "asc" },
    desviaciones: { key: "indicator", direction: "asc" },
    malosActores: { key: "unavailabilityHours", direction: "desc" },
    rca: { key: "value", direction: "desc" },
    generacionCostayaco: { key: "energiaKwh", direction: "desc" },
    generacionVonu: { key: "energiaKwh", direction: "desc" },
  });

  useEffect(() => {
    setMaintenanceByReport({
      gran_tierra: REPORT_DATASETS.gran_tierra.maintenancePlan,
      copower: REPORT_DATASETS.copower.maintenancePlan,
    });
    setActionsByReport({
      gran_tierra: REPORT_DATASETS.gran_tierra.actionPlan,
      copower: REPORT_DATASETS.copower.actionPlan,
    });
  }, []);

  const reportData = REPORT_DATASETS[activeReport];
  const monthOptions =
    activeReport === "gran_tierra" ? GRAN_TIERRA_MONTH_ORDER : COPOWER_MONTH_ORDER;
  const activeMonthData =
    activeReport === "gran_tierra"
      ? GRAN_TIERRA_MONTHLY_DATA[selectedMonth as GranTierraMonthKey]
      : COPOWER_MONTHLY_DATA[selectedMonth as CopowerMonthKey];
  const kpiData = activeReport === "gran_tierra" ? GRAN_TIERRA_KPI_FROM_MONTHS : COPOWER_KPI_FROM_MONTHS;
  const targets = reportData.kpiTargets;
  /** Análisis narrativo (DOCX/PDF) solo existe para junio. */
  const hasJuneAnalysis = activeReport === "gran_tierra" && selectedMonth === "Jun";
  const badActors = hasJuneAnalysis ? reportData.badActors : [];
  const rcaData = reportData.rca;
  const maintenancePlan = maintenanceByReport[activeReport];
  const actionPlan = actionsByReport[activeReport];
  const summary = activeMonthData?.summary ?? reportData.summary;
  const eventLog = activeMonthData?.eventLog ?? reportData.eventLog;
  const machineIndicatorsRaw = activeMonthData?.machineIndicators ?? reportData.machineIndicators;
  const machineIndicators = useMemo<AssessedMachineRow[]>(
    () =>
      machineIndicatorsRaw.map((row) => {
        const skip =
          row.cumplimiento === "N/A" || /estabili|excluida/i.test(row.campo);
        const assessed = assessTechnicalRisk({
          fallas: row.fallas,
          mtbfLabel: row.mtbfLabel,
          mttrHours: row.mttrHours,
          disponibilidadPct: row.disponibilidadPct,
          skip,
        });
        return {
          ...row,
          riesgoTecnico: assessed.riesgo,
          probabilidad: assessed.probabilidad,
          severidad: assessed.severidad,
        };
      }),
    [machineIndicatorsRaw],
  );
  const generationByEquipment = activeMonthData?.generationByEquipment ?? reportData.generationByEquipment;
  const totalGenerationKwh = activeMonthData?.totalGenerationKwh ?? reportData.totalGenerationKwh;
  const generationCostayaco = generationByEquipment.filter((row) => row.campo === "COSTAYACO");
  const generationVonu = generationByEquipment.filter((row) => row.campo === "VONU");
  const totalCostayaco = generationCostayaco.reduce((acc, row) => acc + row.energiaKwh, 0);
  const totalVonu = generationVonu.reduce((acc, row) => acc + row.energiaKwh, 0);

  const monthIndex = kpiData.findIndex((row) => row.month === selectedMonth);
  const safeIndex = monthIndex >= 0 ? monthIndex : kpiData.length - 1;
  const current = kpiData[safeIndex];
  const monthLabel =
    activeReport === "gran_tierra"
      ? activeMonthData?.label ?? granTierraMonthLabel(selectedMonth as GranTierraMonthKey)
      : activeMonthData?.label ?? copowerMonthLabel(selectedMonth as CopowerMonthKey);
  const previousMonthCode =
    activeReport === "gran_tierra"
      ? GRAN_TIERRA_MONTH_ORDER[Math.max(0, safeIndex - 1)]
      : COPOWER_MONTH_ORDER[Math.max(0, safeIndex - 1)];
  const indicatorsSourceNote =
    activeReport === "copower"
      ? `Fuente: reporte diario COPOWER (Resumen OP / Eventos / Consumos). Periodo ${monthLabel}.`
      : selectedMonth === "Jun"
      ? "Fuente: anexo PDF/DOCX junio (data/GTE/Junio). Cumplimiento de sistema vs ≥98% Orden 1."
      : selectedMonth === "May"
        ? "Fuente: SISTEMA N oficial citado en informe junio; unidades desde Excel Mayo (data/GTE/Mayo). Meta sistema ≥98% Orden 1."
        : `Fuente: Excel Data Soporte (data/GTE). Calculado con PF_contr. Meta sistema ≥98% Orden 1.`;

  const deviations = useMemo(() => {
    type DeviationRow = {
      indicator: string;
      value: number | null;
      target: number | null;
      unit: "pct" | "mwh" | "hours" | "count";
      higherIsBetter: boolean;
      status: "cumple" | "no_cumple" | "seguimiento" | "nd";
      technicalExplanation: string;
      source: string;
    };

    const rows: DeviationRow[] = [];
    const meta98 = CONTRACTUAL_KPI_TARGETS.availability;
    const srcOfficial =
      selectedMonth === "Jun"
        ? "PDF/anexo junio (Gran Tierra)"
        : selectedMonth === "May"
          ? "Oficial citado en informe junio"
          : "Excel Data Soporte (SISTEMA N Costayaco)";
    const srcExcel = "Excel Data Soporte data/GTE";
    const srcContract = "Orden 1 Costayaco";
    const srcNd = "N/D — pendiente de fuente";

    const statusVsMeta = (value: number | null, target: number, higherIsBetter: boolean): DeviationRow["status"] => {
      if (value == null) return "nd";
      const ok = higherIsBetter ? value >= target : value <= target;
      return ok ? "cumple" : "no_cumple";
    };

    // Disponibilidad
    rows.push({
      indicator: "Disponibilidad del Sistema",
      value: current.availability,
      target: meta98,
      unit: "pct",
      higherIsBetter: true,
      status: statusVsMeta(current.availability, meta98, true),
      source: srcOfficial,
      technicalExplanation:
        current.availability == null
          ? "N/D — sin Disponibilidad sistémica para este mes."
          : current.availability >= meta98
            ? `SISTEMA N Costayaco ${percentPrecise(current.availability)}. Cumple meta Orden 1 ≥98%.`
            : `SISTEMA N Costayaco ${percentPrecise(current.availability)}. No cumple (≥98%). Brecha ${((meta98 - current.availability) * 100).toFixed(2)} pp.`,
    });

    // Confiabilidad
    const confStatus = statusVsMeta(current.reliability, meta98, true);
    rows.push({
      indicator: "Confiabilidad del Sistema",
      value: current.reliability,
      target: meta98,
      unit: "pct",
      higherIsBetter: true,
      status: confStatus,
      source: srcOfficial,
      technicalExplanation:
        current.reliability == null
          ? "N/D — sin Confiabilidad sistémica para este mes."
          : current.reliability >= meta98
            ? `SISTEMA N Costayaco ${percentPrecise(current.reliability)}. Cumple meta Orden 1 ≥98%.`
            : `SISTEMA N Costayaco ${percentPrecise(current.reliability)}. No cumple. Deducción estimada ${getReliabilityDeduction(current.reliability).deductionPct}% (banda ${getReliabilityDeduction(current.reliability).rangeLabel}).`,
    });

    // Cumplimiento contractual (min Disp/Conf)
    const complianceValue =
      current.availability == null || current.reliability == null
        ? null
        : Math.min(current.availability, current.reliability);
    rows.push({
      indicator: "Cumplimiento contractual (Orden 1)",
      value: complianceValue,
      target: meta98,
      unit: "pct",
      higherIsBetter: true,
      status: statusVsMeta(complianceValue, meta98, true),
      source: srcContract,
      technicalExplanation:
        complianceValue == null
          ? "N/D — sin Disp/Conf para evaluar Orden 1."
          : complianceValue >= meta98
            ? "Disp y Conf ≥98%."
            : selectedMonth === "Jun"
              ? "Costayaco 97.92% no cumple; Vonú 100% sí cumple (referencia)."
              : "SISTEMA N Costayaco bajo meta ≥98%.",
    });

    // Generación
    const hasEnergy = current.generationMwh > 0;
    rows.push({
      indicator: "Generación total",
      value: hasEnergy ? current.generationMwh : null,
      target: targets.generationMwh,
      unit: "mwh",
      higherIsBetter: true,
      status: hasEnergy ? statusVsMeta(current.generationMwh, targets.generationMwh, true) : "nd",
      source: hasEnergy ? srcExcel : srcNd,
      technicalExplanation: hasEnergy
        ? selectedMonth === "Jun"
          ? "4,110.144 MWh (gas CYC 3,499.84 + diésel 119.72 + Vonú 490.59). Meta 4,000 MWh."
          : `Generación ${current.generationMwh.toFixed(1)} MWh vs meta ${targets.generationMwh} MWh.`
        : "N/D energético — Excel sin columna Energia_kWh_dia este mes.",
    });

    // MTBF — seguimiento (sin umbral Orden 1)
    rows.push({
      indicator: "MTBF",
      value: summary.mtbfHours,
      target: null,
      unit: "hours",
      higherIsBetter: true,
      status: summary.mtbfHours == null ? "nd" : "seguimiento",
      source: summary.mtbfHours == null ? srcNd : srcOfficial,
      technicalExplanation:
        summary.mtbfHours == null
          ? `N/D — sin ${METRIC_DEFS.MTBF.es} publicado.`
          : selectedMonth === "Jun"
            ? `${METRIC_DEFS.MTBF.es}. 711.57 h (anexo). Mayo 500.39 h. Orden 1: solo seguimiento, sin umbral fijo.`
            : selectedMonth === "May"
              ? `${METRIC_DEFS.MTBF.es}. 500.39 h (citado en informe junio). Solo seguimiento.`
              : `${METRIC_DEFS.MTBF.es}. ${summary.mtbfHours.toFixed(2)} h (Excel). Solo seguimiento.`,
    });

    // MTTR — seguimiento
    rows.push({
      indicator: "MTTR",
      value: summary.mttrHours,
      target: null,
      unit: "hours",
      higherIsBetter: false,
      status: summary.mttrHours == null ? "nd" : "seguimiento",
      source: summary.mttrHours == null ? srcNd : srcOfficial,
      technicalExplanation:
        summary.mttrHours == null
          ? `N/D — sin ${METRIC_DEFS.MTTR.es} publicado.`
          : selectedMonth === "Jun"
            ? `${METRIC_DEFS.MTTR.es}. 2.86 h (anexo). Mayo 5.32 h. Orden 1: solo seguimiento, sin umbral fijo.`
            : selectedMonth === "May"
              ? `${METRIC_DEFS.MTTR.es}. 5.32 h (citado en informe junio). Solo seguimiento.`
              : `${METRIC_DEFS.MTTR.es}. ${summary.mttrHours.toFixed(2)} h (Excel). Solo seguimiento.`,
    });

    // Fallas imputables
    rows.push({
      indicator: "Fallas imputables COPOWER",
      value: summary.copowerFailures,
      target: 0,
      unit: "count",
      higherIsBetter: false,
      status: statusVsMeta(summary.copowerFailures, 0, false),
      source: selectedMonth === "Jun" || selectedMonth === "May" ? srcOfficial : srcExcel,
      technicalExplanation:
        selectedMonth === "Jun"
          ? "7 imputables (igual que mayo). Bitácora: 10 Falla_evento; 3 al cliente. Ideal contractual: 0."
          : selectedMonth === "May"
            ? "7 imputables (informe junio). Ideal: 0."
            : `${summary.copowerFailures} (Σ Falla_evento Excel). Ideal: 0.`,
    });

    // Riesgo técnico (metodología propuesta Prob × Consecuencia)
    const evaluableUnits = machineIndicators.filter(
      (m) => m.unidad !== "SISTEMA N" && m.riesgoTecnico !== "N/A",
    );
    const highRiskUnits = evaluableUnits.filter((m) => m.riesgoTecnico === "RIESGO ALTO");
    const mediumRiskUnits = evaluableUnits.filter((m) => m.riesgoTecnico === "RIESGO MEDIO");
    const elevatedCount = highRiskUnits.length + mediumRiskUnits.length;
    const sistemaRisk = machineIndicators.find((m) => m.unidad === "SISTEMA N" && m.campo === "COSTAYACO");
    const worstPark: TechnicalRiskLabel =
      highRiskUnits.length > 0
        ? "RIESGO ALTO"
        : mediumRiskUnits.length > 0
          ? "RIESGO MEDIO"
          : evaluableUnits.length > 0
            ? "RIESGO BAJO"
            : "N/A";
    const riskStatus: DeviationRow["status"] =
      worstPark === "N/A"
        ? "nd"
        : worstPark === "RIESGO ALTO"
          ? "no_cumple"
          : worstPark === "RIESGO MEDIO"
            ? "seguimiento"
            : "cumple";
    rows.push({
      indicator: "Riesgo técnico (parque)",
      value: elevatedCount,
      target: 0,
      unit: "count",
      higherIsBetter: false,
      status: riskStatus,
      source: "Metodología propuesta (no contractual)",
      technicalExplanation:
        worstPark === "N/A"
          ? "N/D — sin unidades evaluables este mes."
          : `${worstPark.replace("RIESGO ", "")} (máx. parque). ${mediumRiskUnits.length} medio · ${highRiskUnits.length} alto` +
            (mediumRiskUnits.length || highRiskUnits.length
              ? `: ${[...mediumRiskUnits, ...highRiskUnits].map((u) => u.unidad).join(", ")}.`
              : ".") +
            (sistemaRisk
              ? ` SISTEMA N Costayaco → ${sistemaRisk.riesgoTecnico.replace("RIESGO ", "")} (P:${riskAxisLabel(sistemaRisk.probabilidad)} × S:${riskAxisLabel(sistemaRisk.severidad)}).`
              : "") +
            " Separado del cumplimiento contractual. Pendiente de aprobación formal.",
    });

    // RCA / reportes
    rows.push({
      indicator: "Reportes de falla / RCA entregados",
      value: selectedMonth === "Jun" ? 0 : null,
      target: selectedMonth === "Jun" ? summary.copowerFailures : null,
      unit: "count",
      higherIsBetter: true,
      status: selectedMonth === "Jun" ? "no_cumple" : "nd",
      source: selectedMonth === "Jun" ? srcOfficial : srcNd,
      technicalExplanation:
        selectedMonth === "Jun"
          ? "0 de 7 entregados → expuesto a multa adicional 4% (Orden 1)."
          : "N/D — sin tracker formal de RCA en carpeta del mes.",
    });

    // Puntos ciegos Orden 1
    rows.push({
      indicator: "Eficiencia",
      value: null,
      target: CONTRACTUAL_KPI_TARGETS.efficiencyPct / 100,
      unit: "pct",
      higherIsBetter: true,
      status: "nd",
      source: srcNd,
      technicalExplanation: "N/D — pendiente de fuente. Meta Orden 1 ≥37%.",
    });
    rows.push({
      indicator: "Plan de Mantenimiento",
      value: null,
      target: 1,
      unit: "pct",
      higherIsBetter: true,
      status: "nd",
      source: srcNd,
      technicalExplanation: "N/D — pendiente de fuente. Meta Orden 1 = 100%.",
    });
    rows.push({
      indicator: "Stock de Repuestos",
      value: null,
      target: 1,
      unit: "pct",
      higherIsBetter: true,
      status: "nd",
      source: srcNd,
      technicalExplanation: "N/D — pendiente de fuente. Meta Orden 1 = 100% (trimestral).",
    });
    rows.push({
      indicator: "Capacidad de Potencia (PMC)",
      value: null,
      target: null,
      unit: "pct",
      higherIsBetter: true,
      status: "nd",
      source: srcNd,
      technicalExplanation: "N/D — pendiente de fuente. Meta ≥ PMC comprometida.",
    });

    return rows;
  }, [current, targets, summary, selectedMonth, machineIndicators]);

  const complianceChartData = deviations
    .filter((d) => d.unit === "pct" && d.value != null && d.target != null && d.status !== "nd")
    .map((d) => ({
      indicador: d.indicator.replace(" del Sistema", "").replace(" contractual (Orden 1)", ""),
      actual: Number(((d.value as number) * 100).toFixed(2)),
      meta: Number(((d.target as number) * 100).toFixed(1)),
    }));

  const updateMaintenance = <K extends keyof MaintenanceRow>(id: string, field: K, value: MaintenanceRow[K]) => {
    setMaintenanceByReport((prev) => ({
      ...prev,
      [activeReport]: prev[activeReport].map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
  };

  const updateAction = <K extends keyof ActionRow>(id: string, field: K, value: ActionRow[K]) => {
    setActionsByReport((prev) => ({
      ...prev,
      [activeReport]: prev[activeReport].map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
  };

  const performanceData = kpiData.map((row) => ({
    ...row,
    lossesRatio:
      row.operationalLossesMwh == null || !row.generationMwh
        ? null
        : row.operationalLossesMwh / row.generationMwh,
  }));

  const topBadActors = [...badActors].sort((a, b) => b.unavailabilityHours - a.unavailabilityHours);
  const rcaCases = reportData.rcaCases;
  const commonCauseEvents = hasJuneAnalysis ? reportData.commonCauseEvents : [];
  const analysisHighlights = hasJuneAnalysis
    ? reportData.analysisHighlights
    : [
        `Mes ${selectedMonth}: indicadores por unidad y SISTEMA N desde data/GTE (Excel${selectedMonth === "May" ? "; SISTEMA N oficial citado en informe junio" : ""}).`,
        "Metas de sistema ≥98% Orden 1. Riesgo técnico derivado de #fallas y MTBF.",
        "RCA, planes de acción y mantenibilidad: N/A si no hay tracker formal en la carpeta del mes.",
      ];
  const causeParetoByHours = hasJuneAnalysis
    ? [...reportData.causePareto].sort((a, b) => (b.hoursPfClient ?? 0) - (a.hoursPfClient ?? 0))
    : [];

  const rcaTotal = rcaData.reduce((acc, cur) => acc + cur.value, 0);
  const rcaSummary = rcaData.map((item) => ({
    ...item,
    percentage: rcaTotal > 0 ? ((item.value / rcaTotal) * 100).toFixed(1) : "0.0",
  }));
  const deviationStats = {
    total: deviations.length,
    meeting: deviations.filter((d) => d.status === "cumple").length,
    missing: deviations.filter((d) => d.status === "nd").length,
    failing: deviations.filter((d) => d.status === "no_cumple").length,
    tracking: deviations.filter((d) => d.status === "seguimiento").length,
  };
  const machineRiskStats = {
    high: machineIndicators.filter((m) => m.unidad !== "SISTEMA N" && m.riesgoTecnico === "RIESGO ALTO").length,
    medium: machineIndicators.filter((m) => m.unidad !== "SISTEMA N" && m.riesgoTecnico === "RIESGO MEDIO").length,
    low: machineIndicators.filter((m) => m.unidad !== "SISTEMA N" && m.riesgoTecnico === "RIESGO BAJO").length,
    na: machineIndicators.filter((m) => m.unidad !== "SISTEMA N" && m.riesgoTecnico === "N/A").length,
  };
  const machineRiskDetailRows = useMemo(
    () =>
      machineIndicators
        .filter((m) => m.unidad !== "SISTEMA N")
        .sort((a, b) => (riskScore(b.riesgoTecnico) ?? -1) - (riskScore(a.riesgoTecnico) ?? -1)),
    [machineIndicators],
  );
  const sistemaCostayacoRisk = machineIndicators.find((m) => m.unidad === "SISTEMA N" && m.campo === "COSTAYACO");
  const sistemaVonuRisk = machineIndicators.find((m) => m.unidad === "SISTEMA N" && m.campo === "VONU");
  const reliabilityDeduction =
    current.reliability == null ? null : getReliabilityDeduction(current.reliability);
  const availabilityMeetsContract =
    current.availability != null && current.availability >= CONTRACTUAL_KPI_TARGETS.availability;
  const reliabilityMeetsContract =
    current.reliability != null && current.reliability >= CONTRACTUAL_KPI_TARGETS.reliability;
  const contractualScorecard = [
    {
      name: "Disponibilidad",
      valueLabel:
        current.availability == null
          ? "N/A"
          : `${(current.availability * 100).toFixed(1)}% / meta 98.0%`,
      meets: current.availability == null ? null : availabilityMeetsContract,
      detail:
        current.availability == null
          ? "Sin Disp sistémica este mes"
          : availabilityMeetsContract
            ? "Cumple umbral ≥98%"
            : `No cumple (brecha ${((CONTRACTUAL_KPI_TARGETS.availability - current.availability) * 100).toFixed(2)} pp)`,
    },
    {
      name: "Confiabilidad",
      valueLabel:
        current.reliability == null
          ? "N/A"
          : `${(current.reliability * 100).toFixed(1)}% / meta 98.0%`,
      meets: current.reliability == null ? null : reliabilityMeetsContract,
      detail:
        current.reliability == null
          ? "Sin Conf sistémica este mes"
          : reliabilityMeetsContract
            ? "Cumple umbral ≥98%"
            : `No cumple → deducción estimada ${reliabilityDeduction?.deductionPct ?? "N/A"}%`,
    },
    {
      name: "MTBF",
      valueLabel: summary.mtbfHours == null ? "N/A" : `${summary.mtbfHours.toFixed(2)} h`,
      meets: null as boolean | null,
      detail: `${METRIC_DEFS.MTBF.es}. Solo seguimiento, sin umbral fijo`,
    },
    {
      name: "MTTR",
      valueLabel: summary.mttrHours == null ? "N/A" : `${summary.mttrHours.toFixed(2)} h`,
      meets: null as boolean | null,
      detail: `${METRIC_DEFS.MTTR.es}. Solo seguimiento, sin umbral fijo`,
    },
    {
      name: "Reportes de falla / RCA",
      valueLabel:
        selectedMonth === "Jun"
          ? "No entregados (7 eventos)"
          : "N/A — sin tracker formal en carpeta del mes",
      meets: selectedMonth === "Jun" ? false : null,
      detail:
        selectedMonth === "Jun"
          ? "Expuesto a multa del 4% adicional (Orden 1) si se confirma la ausencia"
          : "Pendiente evidencia de entregas documentadas",
    },
  ];
  const activeReliabilityBand =
    current.reliability == null ? null : getReliabilityDeduction(current.reliability);
  const focalRiskUnits = machineIndicators.filter(
    (m) => m.unidad !== "SISTEMA N" && (m.riesgoTecnico === "RIESGO MEDIO" || m.riesgoTecnico === "RIESGO ALTO"),
  );

  const riskCards = [
    {
      title: "Confiabilidad sistemica",
      value: percent(current.reliability),
      status: current.reliability == null ? "neutral" : reliabilityMeetsContract ? "ok" : "warning",
      note:
        current.reliability == null
          ? "Sin Confiabilidad sistémica para este mes."
          : selectedMonth === "Jun"
            ? "97.92% Costayaco. Orden 1 ≥98% → No cumple; deducción estimada 4%."
            : selectedMonth === "May"
              ? "94.05% Costayaco (citado en informe junio). Bajo ≥98% contractual."
              : `Excel Costayaco ${percentPrecise(current.reliability)} vs meta Orden 1 ≥98%.`,
    },
    {
      title: "Activo dominante / recurrencia",
      value:
        machineRiskStats.high + machineRiskStats.medium > 0
          ? `${machineRiskStats.high} alto · ${machineRiskStats.medium} medio`
          : "Parque en Bajo",
      status: machineRiskStats.high > 0 || machineRiskStats.medium > 0 ? "warning" : "ok",
      note:
        focalRiskUnits.length > 0
          ? `${focalRiskUnits.map((u) => u.unidad).join(", ")} — matriz Prob×Consecuencia (propuesta).`
          : "Sin unidades en Riesgo Medio/Alto según metodología propuesta.",
    },
    {
      title: "Causas externas (aguas arriba)",
      value: hasJuneAnalysis ? "MRU 95 h · SIN 37 h · CYC 14 h" : "N/A",
      status: hasJuneAnalysis ? "warning" : "neutral",
      note: hasJuneAnalysis
        ? "DOCX junio: causas externas > fallas propias (70 h)."
        : "Pareto de causas solo documentado para junio.",
    },
    {
      title: "Cumplimiento contractual",
      value:
        current.availability == null || current.reliability == null
          ? "N/A"
          : reliabilityMeetsContract && availabilityMeetsContract
            ? "Cumple Orden 1"
            : "No cumple Orden 1",
      status:
        current.availability == null || current.reliability == null
          ? "neutral"
          : reliabilityMeetsContract && availabilityMeetsContract
            ? "ok"
            : "warning",
      note:
        current.availability == null || current.reliability == null
          ? "Sin Disp/Conf sistémica no se evalúa Orden 1."
          : selectedMonth === "Jun"
            ? "Costayaco 97.92% vs ≥98%. Vonú 100%. PDF usaba meta operativa 97%."
            : "Evaluación SISTEMA N Costayaco vs Tabla 13 Orden 1 (≥98%).",
    },
  ] as const;

  const previousMonthEventLog =
    previousMonthCode != null
      ? activeReport === "gran_tierra"
        ? GRAN_TIERRA_MONTHLY_DATA[previousMonthCode as GranTierraMonthKey].eventLog
        : COPOWER_MONTHLY_DATA[previousMonthCode as CopowerMonthKey].eventLog
      : [];
  const eventStats = useMemo(() => {
    const byType = {
      Falla: 0,
      "Causa comun": 0,
      Operativo: 0,
    };
    const byResponsible = {
      COPOWER: 0,
      GTE: 0,
      Externo: 0,
    };
    const downtimeByEquipment = new Map<string, number>();
    let downtimeHours = 0;
    let copowerDowntimeHours = 0;

    for (const event of eventLog) {
      byType[event.eventType] += 1;
      byResponsible[event.responsible] += 1;
      downtimeHours += event.downtimeHours;
      if (event.responsible === "COPOWER") {
        copowerDowntimeHours += event.downtimeHours;
      }
      downtimeByEquipment.set(event.equipment, (downtimeByEquipment.get(event.equipment) ?? 0) + event.downtimeHours);
    }

    const topEquipment = [...downtimeByEquipment.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([equipment, hours]) => ({ equipment, hours: Number(hours.toFixed(1)) }));

    const typeChart = [
      { name: "Falla", value: byType.Falla, color: "#ef4444" },
      { name: "Causa comun", value: byType["Causa comun"], color: "#f59e0b" },
      { name: "Operativo", value: byType.Operativo, color: "#60a5fa" },
    ].filter((row) => row.value > 0);

    return {
      total: eventLog.length,
      failures: byType.Falla,
      commonCause: byType["Causa comun"],
      operative: byType.Operativo,
      downtimeHours,
      copowerDowntimeHours,
      copowerEvents: byResponsible.COPOWER,
      clientEvents: byResponsible.GTE + byResponsible.Externo,
      topEquipment,
      typeChart,
      avgDowntime: eventLog.length > 0 ? downtimeHours / eventLog.length : 0,
    };
  }, [eventLog]);
  const previousEventStats = useMemo(() => {
    const failures = previousMonthEventLog.filter((event) => event.eventType === "Falla").length;
    const downtimeHours = previousMonthEventLog.reduce((acc, event) => acc + event.downtimeHours, 0);
    return {
      total: previousMonthEventLog.length,
      failures,
      downtimeHours,
    };
  }, [previousMonthEventLog]);
  const filteredEvents = useMemo(
    () => (onlyFailureEvents ? eventLog.filter((event) => event.eventType === "Falla") : eventLog),
    [eventLog, onlyFailureEvents],
  );

  const toggleSort = (tableId: string, key: string) => {
    setTableSorts((prev) => {
      const currentSort = prev[tableId];
      if (currentSort?.key === key) {
        return {
          ...prev,
          [tableId]: { key, direction: currentSort.direction === "asc" ? "desc" : "asc" },
        };
      }
      return {
        ...prev,
        [tableId]: { key, direction: "desc" },
      };
    });
  };

  const sortRows = <T extends Record<string, unknown>>(rows: T[], tableId: string): T[] => {
    const sortConfig = tableSorts[tableId];
    if (!sortConfig) {
      return rows;
    }
    const { key, direction } = sortConfig;
    const sorted = [...rows].sort((a, b) => {
      const valueA = a[key as keyof T];
      const valueB = b[key as keyof T];

      if (typeof valueA === "number" && typeof valueB === "number") {
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      }

      return direction === "asc"
        ? String(valueA ?? "").localeCompare(String(valueB ?? ""), "es", { numeric: true, sensitivity: "base" })
        : String(valueB ?? "").localeCompare(String(valueA ?? ""), "es", { numeric: true, sensitivity: "base" });
    });
    return sorted;
  };

  const getSortIndicator = (tableId: string, key: string) => {
    const sortConfig = tableSorts[tableId];
    if (!sortConfig || sortConfig.key !== key) {
      return "";
    }
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const sortedEvents = sortRows(filteredEvents, "eventos");
  const sortedMachineIndicators = sortRows(machineIndicators, "maquinas");
  const sortedDeviations = sortRows(deviations, "desviaciones");
  const sortedBadActors = sortRows(topBadActors, "malosActores");
  const sortedRcaSummary = sortRows(rcaSummary, "rca");
  const sortedGenerationCostayaco = sortRows(generationCostayaco, "generacionCostayaco");
  const sortedGenerationVonu = sortRows(generationVonu, "generacionVonu");
  const selectedMachineGeneration = useMemo(() => {
    if (!selectedMachine) {
      return null;
    }

    const campoBase = selectedMachine.campo.startsWith("COSTAYACO")
      ? "COSTAYACO"
      : selectedMachine.campo.startsWith("VONU")
        ? "VONU"
        : selectedMachine.campo;
    const sameFieldRows = generationByEquipment.filter((row) => row.campo === campoBase);
    if (selectedMachine.unidad === "SISTEMA N") {
      return {
        equipo: `SISTEMA N ${campoBase}`,
        campo: campoBase,
        energiaKwh: sameFieldRows.reduce((acc, row) => acc + row.energiaKwh, 0),
        horasOperacion: sameFieldRows.reduce((acc, row) => acc + row.horasOperacion, 0),
        horasStandBy: sameFieldRows.reduce((acc, row) => acc + row.horasStandBy, 0),
        horasPP: sameFieldRows.reduce((acc, row) => acc + row.horasPP, 0),
        horasPFContr: sameFieldRows.reduce((acc, row) => acc + row.horasPFContr, 0),
        horasPFCli: sameFieldRows.reduce((acc, row) => acc + row.horasPFCli, 0),
        horasCalDia: sameFieldRows.reduce((acc, row) => acc + row.horasCalDia, 0),
        fallaEvento: sameFieldRows.reduce((acc, row) => acc + row.fallaEvento, 0),
      };
    }

    return (
      generationByEquipment.find((row) => row.equipo === selectedMachine.unidad && row.campo === campoBase) ??
      generationByEquipment.find((row) => row.equipo === selectedMachine.unidad) ??
      null
    );
  }, [selectedMachine, generationByEquipment]);

  const selectTreeNode = (report: ReportKey, page: PageKey) => {
    setActiveReport(report);
    setActivePage(page);
  };

  const getEventActionPlan = (event: EventRecord) => {
    if (event.responsible === "COPOWER") {
      return "Ejecutar inspeccion tecnica de la unidad, confirmar modo de falla, implementar correctivo y registrar cierre en RCA.";
    }
    if (event.responsible === "GTE") {
      return "Coordinar mesa tecnica con GTE para eliminar condicion de proceso, validar controles y programar verificacion conjunta.";
    }
    return "Escalar al responsable externo, definir ventana de mitigacion y activar plan de contingencia operativa.";
  };

  const getEventResolution = (event: EventRecord) => {
    if (event.notes && event.notes.trim().length > 0) {
      return event.notes;
    }
    if (event.eventType === "Falla") {
      return "Se normalizo la operacion de la unidad despues de la intervencion correctiva reportada en bitacora.";
    }
    return "Evento operativo cerrado sin evidencia de falla propia en la unidad.";
  };

  const formatDeviationValue = (value: number | null, unit: "pct" | "mwh" | "hours" | "count") => {
    if (value == null) return "N/D";
    if (unit === "pct") return `${(value * 100).toFixed(2)}%`;
    if (unit === "mwh") return `${value.toFixed(1)} MWh`;
    if (unit === "hours") return `${value.toFixed(2)} h`;
    return `${Math.round(value)}`;
  };

  const formatDeviationGap = (
    value: number | null,
    target: number | null,
    unit: "pct" | "mwh" | "hours" | "count",
    higherIsBetter: boolean,
    status: "cumple" | "no_cumple" | "seguimiento" | "nd",
  ) => {
    if (status === "nd" || value == null) {
      return { className: "badge info", text: "N/D" };
    }
    if (status === "seguimiento" || target == null) {
      return { className: "badge info", text: "Seguimiento" };
    }
    const rawGap = value - target;
    const normalizedGap = higherIsBetter ? rawGap : -rawGap;
    const gapClass = normalizedGap >= 0 ? "badge success" : "badge danger";

    if (unit === "pct") {
      return {
        className: gapClass,
        text: `${rawGap >= 0 ? "+" : ""}${(rawGap * 100).toFixed(2)} pp`,
      };
    }
    if (unit === "mwh") {
      return {
        className: gapClass,
        text: `${rawGap >= 0 ? "+" : ""}${rawGap.toFixed(1)} MWh`,
      };
    }
    if (unit === "hours") {
      return {
        className: gapClass,
        text: `${rawGap >= 0 ? "+" : ""}${rawGap.toFixed(2)} h`,
      };
    }
    return {
      className: gapClass,
      text: `${rawGap >= 0 ? "+" : ""}${Math.round(rawGap)}`,
    };
  };

  const deviationStatusBadge = (status: "cumple" | "no_cumple" | "seguimiento" | "nd") => {
    if (status === "cumple") return { className: "badge success", text: "Cumple" };
    if (status === "no_cumple") return { className: "badge danger", text: "No cumple" };
    if (status === "seguimiento") return { className: "badge info", text: "Seguimiento" };
    return { className: "badge warning", text: "N/D" };
  };

  return (
    <div className={`app-shell ${theme}`}>
      <aside className="sidebar">
        <div className="brand">
          <p className="eyebrow">COPOWER</p>
          <h1>Indicadores de confiabilidad</h1>
          <p className="brand-sub">Sistema Costayaco / Vonú</p>
        </div>
        <div className="sidebar-controls">
          <div className="month-picker">
            <label htmlFor="month-selector">Periodo</label>
            <select
              id="month-selector"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {activeReport === "gran_tierra"
                    ? granTierraMonthLabel(month as GranTierraMonthKey)
                    : copowerMonthLabel(month as CopowerMonthKey)}
                </option>
              ))}
            </select>
          </div>
          <div className="header-theme-switch">
            <label>Apariencia</label>
            <div className="theme-switch-row">
              <span>Oscuro</span>
              <label className="theme-switch" htmlFor="theme-toggle">
                <input
                  id="theme-toggle"
                  type="checkbox"
                  checked={theme === "light"}
                  onChange={(e) => setTheme(e.target.checked ? "light" : "dark")}
                />
                <span className="slider" />
              </label>
              <span>Claro</span>
            </div>
          </div>
        </div>
        <div className="tree-panel">
          <button className="tree-title-button" onClick={() => setIsReportTreeCollapsed((prev) => !prev)}>
            <span>{isReportTreeCollapsed ? "▶" : <ChevronDown size={14} />}</span>
            <span>Gran Tierra Energy</span>
          </button>
          {!isReportTreeCollapsed &&
            REPORT_TREE.map((report) => (
              <div key={report.key} className={activeReport === report.key ? "tree-group active" : "tree-group"}>
                <p className="tree-title">{report.label}</p>
                <nav className="menu">
                  {NAV_ITEMS.map((item) => {
                    const isActive = activeReport === report.key && activePage === item.key;
                    return (
                      <button
                        key={`${report.key}-${item.key}`}
                        className={isActive ? "menu-item active" : "menu-item"}
                        onClick={() => {
                          if (!GRAN_TIERRA_MONTH_ORDER.includes(selectedMonth as GranTierraMonthKey)) {
                            setSelectedMonth("Jun");
                          }
                          selectTreeNode(report.key, item.key);
                        }}
                        title={item.description}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
        </div>
        <div className="tree-panel">
          <button className="tree-title-button" onClick={() => setIsCopowerTreeCollapsed((prev) => !prev)}>
            <span>{isCopowerTreeCollapsed ? "▶" : <ChevronDown size={14} />}</span>
            <span>COPOWER</span>
          </button>
          {!isCopowerTreeCollapsed && (
            <div className={activeReport === "copower" ? "tree-group active" : "tree-group"}>
              <p className="tree-title">Operación diaria</p>
              <nav className="menu">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeReport === "copower" && activePage === item.key;
                  return (
                    <button
                      key={`copower-${item.key}`}
                      className={isActive ? "menu-item active" : "menu-item"}
                      onClick={() => {
                        if (!COPOWER_MONTH_ORDER.includes(selectedMonth as CopowerMonthKey)) {
                          setSelectedMonth("Jun");
                        }
                        selectTreeNode("copower", item.key);
                      }}
                      title={item.description}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
        <div className="tree-panel">
          <p className="eyebrow">Documentación</p>
          <nav className="menu">
            <a
              className="menu-item"
              href={OM_COLOMBIA_URL}
              target="_blank"
              rel="noreferrer"
              title="Abrir O&M COLOMBIA"
            >
              <span><FileText size={16} /></span>
              <span>O&amp;M COLOMBIA</span>
            </a>
          </nav>
        </div>
      </aside>

      <main className="main">
        {activePage === "resumen" && (
          <>
            {activeReport === "gran_tierra" ? (
              <>
                {selectedMonth !== "Jun" ? (
                  <section className="panel">
                    <article className="card">
                      <p className="muted">
                        El resumen oficial reconciliado corresponde a <strong>junio 2026</strong> (mayo y junio con
                        cifras oficiales). Seleccione <strong>Junio</strong> en el periodo, o consulte a continuación
                        el informe fijo de junio.
                      </p>
                    </article>
                  </section>
                ) : null}
                <ExecutiveResumen />
              </>
            ) : (
              <CopowerResumen month={selectedMonth as CopowerMonthKey} />
            )}
          </>
        )}

        {activePage === "compromiso" && (
          <>
            <section className="panel">
              <article className="card">
                <div className="contract-order-head">
                  <div>
                    <p className="eyebrow">Orden 1 · SISTEMA N Costayaco</p>
                    <h3>Scorecard — {monthLabel}</h3>
                  </div>
                </div>
                <div className="contract-score-grid">
                  {contractualScorecard.map((item) => (
                    <div key={item.name} className="contract-score-card">
                      <div className="contract-score-head">
                        {item.name === "MTBF" || item.name === "MTTR" ? (
                          <MetricLabel code={item.name} />
                        ) : (
                          <strong>{item.name}</strong>
                        )}
                        {item.meets == null ? (
                          <span className="badge info">Seguimiento</span>
                        ) : item.meets ? (
                          <span className="badge success">Cumple</span>
                        ) : (
                          <span className="badge danger">No cumple</span>
                        )}
                      </div>
                      <p className="contract-score-value">{item.valueLabel}</p>
                      <p className="muted">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="panel">
              <article className="card">
                <div className="contract-order-head">
                  <div>
                    <p className="eyebrow">Marco contractual</p>
                    <h3>Órdenes de servicio identificadas</h3>
                    <p className="muted">
                      Para que quede claro por qué solo la Orden 1 alimenta este dashboard, aquí el panorama completo:
                    </p>
                  </div>
                </div>
                <div className="table-scroll">
                  <table className="contract-matrix">
                    <thead>
                      <tr>
                        <th>Orden</th>
                        <th>Objeto</th>
                        <th>Plazo</th>
                        <th>Valor estimado</th>
                        <th>¿Aplica a confiabilidad Costayaco/Vonú?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CONTRACT_ORDERS_OVERVIEW.map((row) => (
                        <tr key={row.order} className={row.tone === "ok" ? "row-sistema" : undefined}>
                          <td>
                            <strong>
                              {row.order} ({row.sourceFile})
                            </strong>
                          </td>
                          <td>{row.object}</td>
                          <td>{row.term}</td>
                          <td>{row.estimatedValue}</td>
                          <td>
                            <span
                              className={`badge ${
                                row.tone === "ok" ? "success" : row.tone === "warn" ? "warning" : "info"
                              }`}
                            >
                              {row.tone === "ok" ? "Sí" : "No"}
                            </span>
                            <span className="contract-overview-detail">{row.appliesToReliability}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="contract-conclusion">{CONTRACT_FRAMEWORK_CONCLUSION}</p>
              </article>
            </section>

            <section className="panel">
              <article className="card">
                <div className="contract-order-head">
                  <div>
                    <p className="eyebrow">Orden 1 — la que aplica</p>
                    <h3>Indicadores de confiabilidad</h3>
                  </div>
                  <span className="badge success">{CONTRACT_CALC_BASE.length} indicadores</span>
                </div>
                <div className="table-scroll">
                  <table className="contract-matrix">
                    <thead>
                      <tr>
                        <th>Indicador</th>
                        <th>Fórmula</th>
                        <th>Frecuencia</th>
                        <th>Meta</th>
                        <th>Multa si incumple</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CONTRACT_CALC_BASE.map((row) => (
                        <tr key={row.indicator}>
                          <td>
                            <strong>{row.indicator}</strong>
                          </td>
                          <td>{row.formula}</td>
                          <td>{row.frequency}</td>
                          <td>{row.threshold}</td>
                          <td className="contract-watch">{row.consequence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>

            <section className="panel two-col">
              <article className="card">
                <h3>Bandas de deducción por Confiabilidad (Orden 1)</h3>
                <p className="muted">
                  Mes seleccionado: {percentPrecise(current.reliability)}
                  {activeReliabilityBand
                    ? ` → banda ${activeReliabilityBand.rangeLabel} (${
                        activeReliabilityBand.terminationRisk
                          ? "terminación anticipada"
                          : `${activeReliabilityBand.deductionPct}%`
                      })`
                    : " → N/A"}
                </p>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Confiabilidad mensual</th>
                        <th>Deducción</th>
                        <th>Mes actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RELIABILITY_DEDUCTION_BANDS.map((band) => {
                        const active =
                          current.reliability != null &&
                          current.reliability >= band.minInclusive &&
                          current.reliability < band.maxExclusive;
                        return (
                          <tr key={band.rangeLabel} className={active ? "row-highlight" : undefined}>
                            <td>{band.rangeLabel}</td>
                            <td>{band.terminationRisk ? "Terminación anticipada" : `${band.deductionPct}%`}</td>
                            <td>
                              {active ? (
                                <span className={`badge ${band.deductionPct === 0 ? "success" : "danger"}`}>
                                  ✓ Aplica
                                  {band.deductionPct > 0 && !band.terminationRisk
                                    ? ` (${percentPrecise(current.reliability)})`
                                    : ""}
                                </span>
                              ) : (
                                <span className="muted">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="card">
                <h3>Escala de shutdowns O&amp;M (Orden 1)</h3>
                <p className="muted">
                  Ideal: 0. Eventos imputables del mes: {summary.copowerFailures}. Pendiente confirmar si equivalen a
                  “shutdowns de campo” bajo esta definición
                  {summary.copowerFailures >= 5
                    ? " — de ser así, superarían el umbral de terminación."
                    : "."}
                </p>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Shutdowns / mes</th>
                        <th>Deducción</th>
                        <th>Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SHUTDOWN_PENALTY_BANDS.map((band) => (
                        <tr key={band.events}>
                          <td>{band.events >= 5 ? "≥ 5" : band.events}</td>
                          <td>{band.terminationRisk ? "Terminación anticipada" : `${band.deductionPct}%`}</td>
                          <td className="muted">
                            {band.events >= 5 && summary.copowerFailures >= 5
                              ? `${summary.copowerFailures} imputables este mes — validar equivalencia`
                              : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          </>
        )}

        {activePage === "indicadores" && (
          <>
            <section className="kpi-grid">
              <KpiCard
                title="Eventos totales"
                reference={`Excel Data Soporte · ${activeMonthData?.label ?? selectedMonth}`}
                icon={<BarChart3 size={18} />}
                value={String(eventStats.total)}
                delta={eventStats.total - previousEventStats.total}
                target="Filas con PF/falla"
                deltaUnit="count"
              />
              <KpiCard
                title="Eventos de falla"
                reference="Falla_evento > 0 en Excel (bitacora)"
                icon={<AlertTriangle size={18} />}
                value={String(eventStats.failures)}
                delta={eventStats.failures - previousEventStats.failures}
                target={
                  eventStats.failures <= 7
                    ? "Meta bitacora <= 7 · Cumple"
                    : `Meta bitacora <= 7 · No cumple (${eventStats.failures} > 7)`
                }
                deltaUnit="count"
              />
              <KpiCard
                title="Imputables COPOWER"
                reference="PF_contr > 0 · eventos Sistema CPW del PDF"
                icon={<Wrench size={18} />}
                value={String(eventStats.copowerEvents)}
                delta={0}
                target={
                  eventStats.copowerEvents <= 7
                    ? `Meta contractual <= 7 · Cumple · ${hours(eventStats.copowerDowntimeHours)}`
                    : `Meta contractual <= 7 · No cumple · ${hours(eventStats.copowerDowntimeHours)}`
                }
                deltaUnit="count"
                hideDelta
              />
              <KpiCard
                title="GTE / Externo"
                reference="Eventos no imputables a COPOWER (PF_cli · Gran Tierra Energy)"
                icon={<ClipboardList size={18} />}
                value={String(eventStats.clientEvents)}
                delta={0}
                target={`${eventStats.total > 0 ? ((eventStats.clientEvents / eventStats.total) * 100).toFixed(0) : 0}% del total`}
                deltaUnit="count"
                hideDelta
              />
              <KpiCard
                title="Horas afectadas"
                reference="PF_contr + PF_cli (20 h contractuales + resto cliente)"
                icon={<Gauge size={18} />}
                value={hours(eventStats.downtimeHours)}
                delta={eventStats.downtimeHours - previousEventStats.downtimeHours}
                target={`Promedio ${hours(eventStats.avgDowntime)}`}
                deltaUnit="hours"
              />
              <KpiCard
                title="Causa comun"
                reference="Clasificacion no definida en el Excel de soporte"
                icon={<ShieldAlert size={18} />}
                value="N/D"
                delta={0}
                target="Pendiente de metodologia"
                deltaUnit="count"
                hideDelta
              />
            </section>

            <section className="panel two-col">
              <article className="card">
                <h3>Distribución por tipo de evento</h3>
                <div className="chart-container compact">
                  {eventStats.typeChart.length === 0 ? (
                    <div className="no-data-state">
                      <p>Sin eventos registrados para {monthLabel}.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={eventStats.typeChart} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85}>
                          {eventStats.typeChart.map((row) => (
                            <Cell key={row.name} fill={row.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${Number(value)} eventos`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </article>

              <article className="card">
                <h3>Equipos con mayor downtime</h3>
                <div className="chart-container compact">
                  {eventStats.topEquipment.length === 0 ? (
                    <div className="no-data-state">
                      <p>Sin horas de afectacion registradas.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={eventStats.topEquipment} layout="vertical" margin={{ left: 24, right: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                        <XAxis type="number" stroke="var(--text-muted)" unit=" h" />
                        <YAxis type="category" dataKey="equipment" stroke="var(--text-muted)" width={78} />
                        <Tooltip formatter={(value) => `${Number(value).toFixed(1)} h`} />
                        <Bar dataKey="hours" name="Horas" fill="#f97316" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </article>
            </section>

            <section className="panel">
              <article className="card">
                <div className="section-header-row">
                  <div>
                    <h3>Eventos registrados en {monthLabel}</h3>
                    <p className="muted">Detalle de la bitácora mensual con filtro por tipo de evento.</p>
                  </div>
                  <div className="event-filters">
                    <label className="event-filter-check">
                      <input type="checkbox" checked={onlyFailureEvents} onChange={(e) => setOnlyFailureEvents(e.target.checked)} />
                      Mostrar solo eventos de falla
                    </label>
                    <span className="event-count">
                      {filteredEvents.length} de {eventStats.total} evento(s)
                    </span>
                  </div>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th><button className="sort-button" onClick={() => toggleSort("eventos", "date")}>Fecha {getSortIndicator("eventos", "date")}</button></th>
                        <th><button className="sort-button" onClick={() => toggleSort("eventos", "equipment")}>Equipo / Sistema {getSortIndicator("eventos", "equipment")}</button></th>
                        <th><button className="sort-button" onClick={() => toggleSort("eventos", "eventType")}>Tipo {getSortIndicator("eventos", "eventType")}</button></th>
                        <th><button className="sort-button" onClick={() => toggleSort("eventos", "cause")}>Causa {getSortIndicator("eventos", "cause")}</button></th>
                        <th><button className="sort-button" onClick={() => toggleSort("eventos", "downtimeHours")}>Horas {getSortIndicator("eventos", "downtimeHours")}</button></th>
                        <th><button className="sort-button" onClick={() => toggleSort("eventos", "responsible")}>Responsable {getSortIndicator("eventos", "responsible")}</button></th>
                        <th><button className="sort-button" onClick={() => toggleSort("eventos", "notes")}>Observaciones {getSortIndicator("eventos", "notes")}</button></th>
                        <th>Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.length === 0 ? (
                        <tr>
                          <td colSpan={8}>Sin eventos para el filtro seleccionado.</td>
                        </tr>
                      ) : (
                        sortedEvents.map((event) => (
                          <tr key={`${event.date}-${event.equipment}-${event.cause}-${event.downtimeHours}`}>
                            <td>{event.date}</td>
                            <td>{event.equipment}</td>
                            <td>
                              <span
                                className={`badge ${
                                  event.eventType === "Falla" ? "danger" : event.eventType === "Causa comun" ? "warning" : "info"
                                }`}
                              >
                                {event.eventType}
                              </span>
                            </td>
                            <td>{event.cause}</td>
                            <td>{event.downtimeHours.toFixed(1)} h</td>
                            <td>
                              <span
                                className={`badge ${
                                  event.responsible === "COPOWER" ? "danger" : event.responsible === "GTE" ? "warning" : "info"
                                }`}
                              >
                                {event.responsible}
                              </span>
                            </td>
                            <td>{event.notes}</td>
                            <td>
                              {event.eventType === "Falla" ? (
                                <button className="open-popup-btn" onClick={() => setSelectedFailureEvent(event)}>
                                  Ver detalle
                                </button>
                              ) : (
                                <span className="muted">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          </>
        )}

        {activePage === "maquinas" && (
          <section className="panel">
            <article className="card">
              <h3>Indicadores por máquina — {monthLabel}</h3>
              <p className="muted">{indicatorsSourceNote}</p>
              <MetricGlossary />
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th><button className="sort-button" onClick={() => toggleSort("maquinas", "unidad")}>Unidad {getSortIndicator("maquinas", "unidad")}</button></th>
                      <th><button className="sort-button" onClick={() => toggleSort("maquinas", "campo")}>Campo {getSortIndicator("maquinas", "campo")}</button></th>
                      <th><button className="sort-button" onClick={() => toggleSort("maquinas", "horasStandBy")}>Horas Stand By {getSortIndicator("maquinas", "horasStandBy")}</button></th>
                      <th><button className="sort-button" onClick={() => toggleSort("maquinas", "disponibilidadPct")}>Disponibilidad % {getSortIndicator("maquinas", "disponibilidadPct")}</button></th>
                      <th><button className="sort-button" onClick={() => toggleSort("maquinas", "confiabilidadPct")}>Confiabilidad % {getSortIndicator("maquinas", "confiabilidadPct")}</button></th>
                      <th><button className="sort-button" onClick={() => toggleSort("maquinas", "fallas")}>#Fallas {getSortIndicator("maquinas", "fallas")}</button></th>
                      <th>
                        <button className="sort-button" onClick={() => toggleSort("maquinas", "mtbfLabel")}>
                          <MetricLabel code="MTBF" showHours /> {getSortIndicator("maquinas", "mtbfLabel")}
                        </button>
                      </th>
                      <th>
                        <button className="sort-button" onClick={() => toggleSort("maquinas", "mttrHours")}>
                          <MetricLabel code="MTTR" showHours /> {getSortIndicator("maquinas", "mttrHours")}
                        </button>
                      </th>
                      <th><button className="sort-button" onClick={() => toggleSort("maquinas", "riesgoTecnico")}>Riesgo técnico {getSortIndicator("maquinas", "riesgoTecnico")}</button></th>
                      <th>Prob.</th>
                      <th>Sev.</th>
                      <th><button className="sort-button" onClick={() => toggleSort("maquinas", "cumplimiento")}>Cumplimiento {getSortIndicator("maquinas", "cumplimiento")}</button></th>
                      <th>Detalle</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {machineIndicators.length === 0 ? (
                      <tr>
                        <td colSpan={14}>Sin datos por unidad para este reporte.</td>
                      </tr>
                    ) : (
                      sortedMachineIndicators.map((row) => (
                        <tr key={`${row.unidad}-${row.campo}`}>
                          <td>{row.unidad}</td>
                          <td>{row.campo}</td>
                          <td>{row.horasStandBy == null ? "—" : row.horasStandBy}</td>
                          <td>{row.disponibilidadPct == null ? "N/A" : `${row.disponibilidadPct.toFixed(2)}%`}</td>
                          <td>{row.confiabilidadPct == null ? "N/A" : `${row.confiabilidadPct.toFixed(2)}%`}</td>
                          <td>{row.fallas}</td>
                          <td>{row.mtbfLabel}</td>
                          <td>{row.mttrHours == null ? "N/A" : row.mttrHours}</td>
                          <td>
                            <span className={`badge ${riesgoBadgeClass(row.riesgoTecnico)}`}>
                              {row.riesgoTecnico}
                            </span>
                          </td>
                          <td>{riskAxisLabel(row.probabilidad)}</td>
                          <td>{riskAxisLabel(row.severidad)}</td>
                          <td>
                            <span className={`badge ${cumplimientoBadgeClass(row.cumplimiento)}`}>
                              {row.cumplimiento}
                            </span>
                          </td>
                          <td className="detalle-cell">{row.detalle ?? "—"}</td>
                          <td>
                            <button className="open-popup-btn" onClick={() => setSelectedMachine(row)}>
                              Ver mas
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="muted">
                Premisa de estabilizacion: JIN-11 y JIN-12 se evaluan individualmente sobre una ventana de ~19 dias y no se incorporan al calculo sistemico de Costayaco. Sus % vienen del Excel (0 PF_contr / 0 PF_cli); el PDF no publica su % individual en el Anexo. Riesgo técnico = matriz propuesta Probabilidad × Consecuencia (pendiente de aprobación formal), no etiqueta contractual.
              </p>
            </article>
          </section>
        )}

        {activePage === "generacion" && (
          <section className="panel">
            <article className="card">
              <h3>Generación por equipo y total mensual — {monthLabel}</h3>
              <p className="muted">
                {activeReport === "copower"
                  ? "Fuente: reporte diario COPOWER (Resumen OP). Energía por equipo del periodo seleccionado."
                  : "Fuente: carpeta data/GTE (archivos de mayo y junio 2026)."}
              </p>
              <div className="kpi-grid">
                <KpiCard title="Total generado" reference="Suma de todos los equipos" icon={<Zap size={18} />} value={kwh(totalGenerationKwh)} delta={0} target="Total general Excel" deltaUnit="mwh" />
                <KpiCard
                  title="Total Costayaco"
                  reference="Energia total campo Costayaco"
                  icon={<Gauge size={18} />}
                  value={kwh(totalCostayaco)}
                  delta={0}
                  target="Campo COSTAYACO"
                  deltaUnit="mwh"
                />
                <KpiCard
                  title="Total Vonu"
                  reference="Energia total campo Vonu"
                  icon={<Gauge size={18} />}
                  value={kwh(totalVonu)}
                  delta={0}
                  target="Campo VONU"
                  deltaUnit="mwh"
                />
                <KpiCard
                  title="Equipos reportados"
                  reference="Unidades con registro en el mes"
                  icon={<Gauge size={18} />}
                  value={String(generationByEquipment.length)}
                  delta={0}
                  target="Unidades con energia"
                  deltaUnit="count"
                />
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={generationByEquipment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                    <XAxis dataKey="equipo" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip formatter={(value) => `${Math.round(Number(value)).toLocaleString("es-CO")} kWh`} />
                    <Legend />
                    <Bar dataKey="energiaKwh" name="Energia (kWh)" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <h3>Detalle por campo: COSTAYACO</h3>
              <table>
                <thead>
                  <tr>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionCostayaco", "equipo")}>Equipo {getSortIndicator("generacionCostayaco", "equipo")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionCostayaco", "energiaKwh")}>Energia kWh {getSortIndicator("generacionCostayaco", "energiaKwh")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionCostayaco", "horasOperacion")}>Horas operacion {getSortIndicator("generacionCostayaco", "horasOperacion")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionCostayaco", "horasStandBy")}>Stand-by {getSortIndicator("generacionCostayaco", "horasStandBy")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionCostayaco", "horasPP")}>Horas PP {getSortIndicator("generacionCostayaco", "horasPP")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionCostayaco", "horasPFContr")}>PF contratista {getSortIndicator("generacionCostayaco", "horasPFContr")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionCostayaco", "horasPFCli")}>PF cliente {getSortIndicator("generacionCostayaco", "horasPFCli")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionCostayaco", "horasCalDia")}>Horas calculadas {getSortIndicator("generacionCostayaco", "horasCalDia")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionCostayaco", "fallaEvento")}>#Falla evento {getSortIndicator("generacionCostayaco", "fallaEvento")}</button></th>
                  </tr>
                </thead>
                <tbody>
                  {generationCostayaco.length === 0 ? (
                    <tr>
                      <td colSpan={9}>Sin datos de COSTAYACO.</td>
                    </tr>
                  ) : (
                    sortedGenerationCostayaco.map((row) => (
                      <tr key={row.equipo}>
                        <td>{row.equipo}</td>
                        <td>{Math.round(row.energiaKwh).toLocaleString("es-CO")}</td>
                        <td>{row.horasOperacion}</td>
                        <td>{row.horasStandBy}</td>
                        <td>{row.horasPP}</td>
                        <td>{row.horasPFContr}</td>
                        <td>{row.horasPFCli}</td>
                        <td>{row.horasCalDia}</td>
                        <td>{row.fallaEvento}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <h3>Detalle por campo: VONU</h3>
              <table>
                <thead>
                  <tr>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionVonu", "equipo")}>Equipo {getSortIndicator("generacionVonu", "equipo")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionVonu", "energiaKwh")}>Energia kWh {getSortIndicator("generacionVonu", "energiaKwh")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionVonu", "horasOperacion")}>Horas operacion {getSortIndicator("generacionVonu", "horasOperacion")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionVonu", "horasStandBy")}>Stand-by {getSortIndicator("generacionVonu", "horasStandBy")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionVonu", "horasPP")}>Horas PP {getSortIndicator("generacionVonu", "horasPP")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionVonu", "horasPFContr")}>PF contratista {getSortIndicator("generacionVonu", "horasPFContr")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionVonu", "horasPFCli")}>PF cliente {getSortIndicator("generacionVonu", "horasPFCli")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionVonu", "horasCalDia")}>Horas calculadas {getSortIndicator("generacionVonu", "horasCalDia")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("generacionVonu", "fallaEvento")}>#Falla evento {getSortIndicator("generacionVonu", "fallaEvento")}</button></th>
                  </tr>
                </thead>
                <tbody>
                  {generationVonu.length === 0 ? (
                    <tr>
                      <td colSpan={9}>Sin datos de VONU.</td>
                    </tr>
                  ) : (
                    sortedGenerationVonu.map((row) => (
                      <tr key={row.equipo}>
                        <td>{row.equipo}</td>
                        <td>{Math.round(row.energiaKwh).toLocaleString("es-CO")}</td>
                        <td>{row.horasOperacion}</td>
                        <td>{row.horasStandBy}</td>
                        <td>{row.horasPP}</td>
                        <td>{row.horasPFContr}</td>
                        <td>{row.horasPFCli}</td>
                        <td>{row.horasCalDia}</td>
                        <td>{row.fallaEvento}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </article>
          </section>
        )}

        {activePage === "desviaciones" && (
          <>
            <section className="kpi-grid">
              <KpiCard
                title="Indicadores evaluados"
                reference={`Periodo ${monthLabel}`}
                icon={<TrendingUp size={18} />}
                value={String(deviationStats.total)}
                delta={0}
                target={`${deviationStats.missing} en N/D`}
                deltaUnit="count"
                hideDelta
              />
              <KpiCard
                title="Cumplen meta"
                reference="Semáforo vs Orden 1"
                icon={<CheckCircle2 size={18} />}
                value={String(deviationStats.meeting)}
                delta={0}
                target={`${deviationStats.failing} no cumplen`}
                deltaUnit="count"
                hideDelta
              />
              <KpiCard
                title="No cumplen"
                reference="Disp / Conf / fallas / RCA"
                icon={<AlertTriangle size={18} />}
                value={String(deviationStats.failing)}
                delta={0}
                target={`${deviationStats.tracking} seguimiento`}
                deltaUnit="count"
                hideDelta
              />
              <KpiCard
                title="Deducción Conf."
                reference="Banda Orden 1 (si aplica)"
                icon={<Gauge size={18} />}
                value={
                  activeReliabilityBand == null
                    ? "N/D"
                    : activeReliabilityBand.terminationRisk
                      ? "Terminación"
                      : `${activeReliabilityBand.deductionPct}%`
                }
                delta={0}
                target={activeReliabilityBand?.rangeLabel ?? "N/D"}
                deltaUnit="count"
                hideDelta
              />
            </section>

            <section className="panel">
              <article className="card">
                <h3>Brechas vs metas contractuales — {monthLabel}</h3>
                <p className="muted">
                  Semáforos calculados en código vs Orden 1. Fila de Riesgo técnico = matriz Prob×Consecuencia
                  (propuesta, no contractual). MTBF/MTTR sin umbral fijo (seguimiento). Puntos ciegos = N/D
                  pendiente de fuente.
                </p>
                <MetricGlossary />
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>
                          <button className="sort-button" onClick={() => toggleSort("desviaciones", "indicator")}>
                            Indicador {getSortIndicator("desviaciones", "indicator")}
                          </button>
                        </th>
                        <th>
                          <button className="sort-button" onClick={() => toggleSort("desviaciones", "value")}>
                            Actual {getSortIndicator("desviaciones", "value")}
                          </button>
                        </th>
                        <th>
                          <button className="sort-button" onClick={() => toggleSort("desviaciones", "target")}>
                            Meta {getSortIndicator("desviaciones", "target")}
                          </button>
                        </th>
                        <th>Brecha</th>
                        <th>
                          <button className="sort-button" onClick={() => toggleSort("desviaciones", "status")}>
                            Estado {getSortIndicator("desviaciones", "status")}
                          </button>
                        </th>
                        <th>Fuente</th>
                        <th>Explicación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDeviations.map((d) => {
                        const gap = formatDeviationGap(d.value, d.target, d.unit, d.higherIsBetter, d.status);
                        const st = deviationStatusBadge(d.status);
                        return (
                          <tr key={d.indicator} className={d.status === "no_cumple" ? "row-highlight" : undefined}>
                            <td>
                              {d.indicator === "MTBF" || d.indicator === "MTTR" ? (
                                <MetricLabel code={d.indicator} />
                              ) : (
                                <strong>{d.indicator}</strong>
                              )}
                            </td>
                            <td>{formatDeviationValue(d.value, d.unit)}</td>
                            <td>{d.target == null ? "—" : formatDeviationValue(d.target, d.unit)}</td>
                            <td>
                              <span className={gap.className}>{gap.text}</span>
                            </td>
                            <td>
                              <span className={st.className}>{st.text}</span>
                            </td>
                            <td className="muted" style={{ fontSize: "0.8rem" }}>
                              {d.source}
                            </td>
                            <td className="detalle-cell">{d.technicalExplanation}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>

            <section className="panel two-col">
              <article className="card">
                <h3>Actual vs meta (%)</h3>
                <p className="chart-hint">Solo indicadores % con valor y meta (Disp, Conf, cumplimiento).</p>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={complianceChartData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                      <XAxis
                        dataKey="indicador"
                        stroke="var(--text-muted)"
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="var(--text-muted)"
                        domain={[90, 102]}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip formatter={(value) => `${Number(value ?? 0).toFixed(2)}%`} />
                      <Legend />
                      <Bar dataKey="actual" name="Actual (%)" fill="#2563eb" />
                      <Bar dataKey="meta" name="Meta (%)" fill="#059669" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
              <article className="card">
                <h3>Resumen del periodo</h3>
                <ul className="insight-list">
                  {(analysisHighlights.length > 0
                    ? analysisHighlights
                    : [
                        `${monthLabel}: comparación vs metas Orden 1 (≥98% Disp/Conf).`,
                        "MTBF/MTTR en seguimiento — sin umbral contractual fijo.",
                        "Eficiencia, PMC, mantenimiento y stock: N/D hasta tener fuente.",
                      ]
                  ).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {selectedMonth === "Jun" && activeReliabilityBand ? (
                  <p className="contract-note" style={{ marginTop: "0.85rem" }}>
                    Junio: Confiabilidad {percentPrecise(current.reliability)} → banda {activeReliabilityBand.rangeLabel}{" "}
                    · deducción estimada {activeReliabilityBand.deductionPct}% del pago mensual.
                  </p>
                ) : null}
              </article>
            </section>
          </>
        )}

        {activePage === "malos_actores" && (
          <>
            <section className="kpi-grid">
              <KpiCard title="Focos de impacto" reference={hasJuneAnalysis ? "DOCX junio §4" : "Sin fuente este mes"} icon={<Bug size={18} />} value={hasJuneAnalysis ? String(topBadActors.length) : "N/A"} delta={0} target={hasJuneAnalysis ? "Analisis profundo junio" : "N/A"} deltaUnit="count" hideDelta />
              <KpiCard title="Horas indisponibilidad" reference="Horas PF documentadas" icon={<Gauge size={18} />} value={hasJuneAnalysis ? hours(topBadActors.reduce((a, b) => a + b.unavailabilityHours, 0)) : "N/A"} delta={0} target={hasJuneAnalysis ? "PF cliente + contractual" : "N/A"} deltaUnit="hours" hideDelta />
              <KpiCard title="Criticidad alta" reference="Causas externas dominantes" icon={<AlertTriangle size={18} />} value={hasJuneAnalysis ? String(topBadActors.filter((b) => b.criticality === "Alta").length) : "N/A"} delta={0} target={hasJuneAnalysis ? "MRU / SIN" : "N/A"} deltaUnit="count" hideDelta />
              <KpiCard title="Activo dominante" reference="Recurrencia contractual" icon={<ShieldAlert size={18} />} value={hasJuneAnalysis ? "CPW06" : "N/A"} delta={0} target={hasJuneAnalysis ? "3 fallas · MTBF 222 h" : "N/A"} deltaUnit="count" hideDelta />
            </section>
            {!hasJuneAnalysis ? (
              <section className="panel">
                <article className="card">
                  <p className="muted">N/D — el análisis de activos críticos y causas externas solo está documentado en el informe de junio. No se proyectan focos para otros meses.</p>
                </article>
              </section>
            ) : null}
            <section className="panel two-col">
              <article className="card">
                <h3>Equipos / causas de mayor impacto</h3>
                <p className="muted">Ordenado por horas de indisponibilidad. Incluye causas externas (MRU/SIN/CYC) y activos contractuales.</p>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th><button className="sort-button" onClick={() => toggleSort("malosActores", "equipment")}>Equipo {getSortIndicator("malosActores", "equipment")}</button></th>
                        <th>Sistema</th>
                        <th>Criticidad</th>
                        <th><button className="sort-button" onClick={() => toggleSort("malosActores", "frequency")}>Frecuencia {getSortIndicator("malosActores", "frequency")}</button></th>
                        <th>Causa</th>
                        <th><button className="sort-button" onClick={() => toggleSort("malosActores", "unavailabilityHours")}>Indisp. (h) {getSortIndicator("malosActores", "unavailabilityHours")}</button></th>
                        <th><button className="sort-button" onClick={() => toggleSort("malosActores", "generationImpactMwh")}>Afectacion {getSortIndicator("malosActores", "generationImpactMwh")}</button></th>
                      </tr>
                    </thead>
                    <tbody>
                      {topBadActors.length === 0 ? (
                        <tr><td colSpan={7}>Sin datos de fallas para este reporte.</td></tr>
                      ) : (
                        sortedBadActors.map((item) => (
                          <tr key={item.equipment}>
                            <td>{item.equipment}</td>
                            <td>{item.system}</td>
                            <td><span className={`badge ${item.criticality === "Alta" ? "danger" : item.criticality === "Media" ? "warning" : "info"}`}>{item.criticality}</span></td>
                            <td>{item.frequency}</td>
                            <td>{item.knownCause}</td>
                            <td>{item.unavailabilityHours}</td>
                            <td>{mwh(item.generationImpactMwh)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
              <article className="card">
                <h3>Horas de indisponibilidad por foco</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={topBadActors} layout="vertical" margin={{ left: 28, right: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                      <XAxis type="number" stroke="var(--text-muted)" />
                      <YAxis type="category" dataKey="equipment" width={110} stroke="var(--text-muted)" />
                      <Tooltip formatter={(value) => `${Number(value)} h`} />
                      <Bar dataKey="unavailabilityHours" name="Horas" fill="#f97316" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>
          </>
        )}

        {activePage === "causas_raiz" && (
          <>
            <section className="kpi-grid">
              <KpiCard
                title="Casos RCA abiertos"
                reference="Inventario formal de RCA en fuente GTE"
                icon={<Search size={18} />}
                value="N/D"
                delta={0}
                target="No reportado en PDF/DOCX"
                deltaUnit="count"
                hideDelta
              />
              <KpiCard
                title="RCA recomendado (DOCX)"
                reference="Analisis Profundo junio · CPW06"
                icon={<AlertTriangle size={18} />}
                value="1 foco"
                delta={0}
                target="3 eventos (03, 27, 28-jun)"
                deltaUnit="count"
                hideDelta
              />
              <KpiCard title="Pareto bitacora" reference="183 obs. clasificadas (429 registros)" icon={<BarChart3 size={18} />} value={String(causeParetoByHours.reduce((a, b) => a + b.count, 0))} delta={0} target="Registros con causa asignada" deltaUnit="count" hideDelta />
              <KpiCard title="Horas PF externas" reference="MRU + SIN + CYC" icon={<AlertTriangle size={18} />} value={hours((causeParetoByHours.find((c) => c.cause.includes("MRU"))?.hoursPfClient ?? 0) + (causeParetoByHours.find((c) => c.cause.includes("SIN"))?.hoursPfClient ?? 0) + (causeParetoByHours.find((c) => c.cause.includes("CYC"))?.hoursPfClient ?? 0))} delta={0} target="> fallas propias (70 h)" deltaUnit="hours" hideDelta />
            </section>
            <section className="panel two-col">
              <article className="card">
                <h3>Pareto de causas (bitácora)</h3>
                <p className="muted">Clasificacion del analisis profundo: registros y horas PF-cliente asociadas.</p>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={causeParetoByHours}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                      <XAxis dataKey="cause" stroke="var(--text-muted)" interval={0} angle={-20} textAnchor="end" height={90} />
                      <YAxis yAxisId="count" stroke="#a78bfa" />
                      <YAxis yAxisId="hours" orientation="right" stroke="#f59e0b" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="count" dataKey="count" name="Registros" fill="#a78bfa" />
                      <Bar yAxisId="hours" dataKey="hoursPfClient" name="Horas PF" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
              <article className="card">
                <h3>Estado de RCA priorizados</h3>
                <p className="muted">
                  El PDF/Excel de junio no reporta un conteo formal de casos RCA (abiertos / en curso / cerrados).
                  El DOCX de análisis profundo solo recomienda abrir un análisis de causa raíz para CPW06.
                </p>
                {rcaTotal === 0 ? (
                  <p className="muted" style={{ marginTop: "1rem" }}>
                    Sin inventario RCA cargado desde fuente oficial → N/D.
                  </p>
                ) : (
                  <>
                    <div className="chart-container compact">
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie data={rcaData} dataKey="value" nameKey="status" innerRadius={50} outerRadius={90}>
                            {rcaData.map((entry) => (
                              <Cell key={entry.status} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Estado</th>
                          <th>Casos</th>
                          <th>Participacion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRcaSummary.map((row) => (
                          <tr key={row.status}>
                            <td>{row.status}</td>
                            <td>{row.value}</td>
                            <td>{row.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </article>
            </section>
            <section className="panel">
              <article className="card">
                <h3>Casos RCA del periodo</h3>
                <p className="muted">
                  Lo documentado en el DOCX: se requiere análisis de causa raíz específico para CPW06
                  (3 eventos: intercooler/secuestrante, perturbación red G56/G57, sobrecarga) antes del cierre de julio.
                  No hay listado oficial de casos RCA con ID/estado en las fuentes de junio.
                </p>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Equipo</th>
                        <th>Modo de falla</th>
                        <th>Fechas</th>
                        <th>Prioridad</th>
                        <th>Estado</th>
                        <th>Responsable</th>
                        <th>Hallazgo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rcaCases.length === 0 ? (
                        <tr><td colSpan={8}>N/D — sin inventario formal de RCA en PDF/DOCX/Excel de junio.</td></tr>
                      ) : (
                        rcaCases.map((row) => (
                          <tr key={row.id}>
                            <td>{row.id}</td>
                            <td>{row.equipment}</td>
                            <td>{row.failureMode}</td>
                            <td>{row.eventDates}</td>
                            <td><span className={`badge ${row.priority === "Alta" ? "danger" : row.priority === "Media" ? "warning" : "info"}`}>{row.priority}</span></td>
                            <td><span className={`badge ${row.status === "Cerrado" ? "success" : row.status === "En curso" ? "warning" : "info"}`}>{row.status}</span></td>
                            <td>{row.owner}</td>
                            <td>{row.finding}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          </>
        )}

        {activePage === "mantenimiento" && (
          <>
            <section className="kpi-grid">
              <KpiCard title="Planes tecnicos" reference="Tracker formal en fuentes GTE" icon={<Wrench size={18} />} value="N/A" delta={0} target="Sin plan oficial en PDF/DOCX/Excel" deltaUnit="count" hideDelta />
              <KpiCard title="Correctivos" reference="Sin inventario formal" icon={<AlertTriangle size={18} />} value="N/A" delta={0} target="N/A" deltaUnit="count" hideDelta />
              <KpiCard title="Predictivos" reference="Sin inventario formal" icon={<TrendingUp size={18} />} value="N/A" delta={0} target="N/A" deltaUnit="count" hideDelta />
              <KpiCard title="Preventivos" reference="Sin inventario formal" icon={<ShieldCheck size={18} />} value="N/A" delta={0} target="N/A" deltaUnit="count" hideDelta />
            </section>
            <section className="panel">
              <article className="card">
                <h3>Plan de mantenimiento</h3>
                <p className="muted">
                  N/A — no hay un plan de mantenimiento formal con IDs/estados en las fuentes GTE.
                  El DOCX de junio solo recomienda (texto): RCA CPW06, seguimiento CPW04, indicador aguas arriba MRU/SIN/CYC, criterio JIN-11/12 y monitoreo diesel.
                </p>
                <div className="editable-grid">
                  {maintenancePlan.length === 0 ? (
                    <p className="muted">Sin filas cargadas (correcto: no inventar un plan).</p>
                  ) : (
                    maintenancePlan.map((row) => (
                      <div className="editable-item" key={row.id}>
                        <div className="row-top">
                          <strong>{row.id}</strong>
                          <span className={`badge ${row.type === "Correctivo" ? "danger" : row.type === "Predictivo" ? "warning" : "info"}`}>{row.type}</span>
                        </div>
                        <label>
                          Sistema
                          <input value={row.system} onChange={(e) => updateMaintenance(row.id, "system", e.target.value)} />
                        </label>
                        <label>
                          Ajuste propuesto
                          <textarea value={row.proposal} onChange={(e) => updateMaintenance(row.id, "proposal", e.target.value)} />
                        </label>
                        <label>
                          Sustento tecnico
                          <textarea value={row.basis} onChange={(e) => updateMaintenance(row.id, "basis", e.target.value)} />
                        </label>
                        <label>
                          Recomendacion / criterio
                          <textarea value={row.manufacturerRecommendation} onChange={(e) => updateMaintenance(row.id, "manufacturerRecommendation", e.target.value)} />
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </article>
            </section>
          </>
        )}

        {activePage === "riesgos" && (
          <>
            <section className="kpi-grid">
              <KpiCard
                title="Riesgo alto"
                reference="Unidades (matriz propuesta)"
                icon={<ShieldAlert size={18} />}
                value={String(machineRiskStats.high)}
                delta={0}
                target={`${machineRiskStats.medium} medio`}
                deltaUnit="count"
                hideDelta
              />
              <KpiCard
                title="Riesgo medio"
                reference="Unidades (matriz propuesta)"
                icon={<AlertTriangle size={18} />}
                value={String(machineRiskStats.medium)}
                delta={0}
                target={`${machineRiskStats.low} bajo`}
                deltaUnit="count"
                hideDelta
              />
              <KpiCard
                title="SISTEMA N Costayaco"
                reference="P × S calculado"
                icon={<Gauge size={18} />}
                value={sistemaCostayacoRisk?.riesgoTecnico.replace("RIESGO ", "") ?? "N/D"}
                delta={0}
                target={
                  sistemaCostayacoRisk
                    ? `P:${riskAxisLabel(sistemaCostayacoRisk.probabilidad)} · S:${riskAxisLabel(sistemaCostayacoRisk.severidad)}`
                    : "N/D"
                }
                deltaUnit="count"
                hideDelta
              />
              <KpiCard
                title="SISTEMA N Vonú"
                reference="P × S calculado"
                icon={<ShieldCheck size={18} />}
                value={sistemaVonuRisk?.riesgoTecnico.replace("RIESGO ", "") ?? "N/D"}
                delta={0}
                target={
                  sistemaVonuRisk
                    ? `P:${riskAxisLabel(sistemaVonuRisk.probabilidad)} · S:${riskAxisLabel(sistemaVonuRisk.severidad)}`
                    : "N/D"
                }
                deltaUnit="count"
                hideDelta
              />
            </section>

            <section className="panel">
              <article className="card">
                <h3>Metodología de Riesgo Técnico</h3>
                <p className="muted">{TECHNICAL_RISK_METHODOLOGY_NOTE}</p>
                <div className="table-scroll" style={{ marginTop: "0.75rem" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Eje</th>
                        <th>Nivel</th>
                        <th>Regla</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RISK_PROBABILITY_RULES.map((r) => (
                        <tr key={`p-${r.level}`}>
                          <td>Probabilidad / Recurrencia</td>
                          <td>{r.level}</td>
                          <td>{r.rule}</td>
                        </tr>
                      ))}
                      {RISK_SEVERITY_RULES.map((r) => (
                        <tr key={`s-${r.level}`}>
                          <td>Severidad / Consecuencia</td>
                          <td>{r.level}</td>
                          <td>{r.rule}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="muted" style={{ marginTop: "0.75rem" }}>
                  {RISK_COMBINATION_RULES.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
                <p className="muted" style={{ marginTop: "0.5rem" }}>
                  Referencia de consistencia: CPW06 (3 fallas, MTBF 222 h → P Alta; MTTR 2 h, Disp 99.03% → S Baja) → Riesgo Medio.
                </p>
              </article>
            </section>

            <section className="panel">
              <article className="card">
                <h3>Semáforo por unidad — {monthLabel}</h3>
                <p className="muted">Calculado automáticamente con la matriz; no usa la etiqueta cualitativa del anexo como fuente.</p>
                <MetricGlossary />
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Unidad</th>
                        <th>Campo</th>
                        <th># Fallas</th>
                        <th>
                          <MetricLabel code="MTBF" />
                        </th>
                        <th>
                          <MetricLabel code="MTTR" />
                        </th>
                        <th>Disp. %</th>
                        <th>Probabilidad</th>
                        <th>Severidad</th>
                        <th>Riesgo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {machineRiskDetailRows.length === 0 ? (
                        <tr>
                          <td colSpan={9}>Sin unidades para evaluar.</td>
                        </tr>
                      ) : (
                        machineRiskDetailRows.map((row) => (
                          <tr
                            key={`risk-${row.unidad}-${row.campo}`}
                            className={
                              row.riesgoTecnico === "RIESGO ALTO" || row.riesgoTecnico === "RIESGO MEDIO"
                                ? "row-highlight"
                                : undefined
                            }
                          >
                            <td>
                              <strong>{row.unidad}</strong>
                            </td>
                            <td>{row.campo}</td>
                            <td>{row.fallas}</td>
                            <td>{row.mtbfLabel}</td>
                            <td>{row.mttrHours == null ? "N/A" : `${row.mttrHours} h`}</td>
                            <td>{row.disponibilidadPct == null ? "N/A" : `${row.disponibilidadPct.toFixed(2)}%`}</td>
                            <td>{riskAxisLabel(row.probabilidad)}</td>
                            <td>{riskAxisLabel(row.severidad)}</td>
                            <td>
                              <span className={`badge ${riesgoBadgeClass(row.riesgoTecnico)}`}>
                                {row.riesgoTecnico}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>

            <section className="panel two-col">
              <article className="card">
                <h3>Riesgos y continuidad de servicio</h3>
                <div className="risk-list">
                  {riskCards.map((risk) => (
                    <div className={risk.status === "ok" ? "risk-ok" : risk.status === "warning" ? "risk-item" : "risk-neutral"} key={risk.title}>
                      {risk.status === "ok" ? <CheckCircle2 size={16} /> : risk.status === "warning" ? <AlertTriangle size={16} /> : null}
                      <div>
                        <strong>{risk.title}</strong>
                        <p>{risk.value}</p>
                        <small>{risk.note}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
              <article className="card">
                <h3>Tendencias de desempeño</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                      <XAxis dataKey="month" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                      <Tooltip formatter={(value) => percent(Number(value ?? 0))} />
                      <Legend />
                      <Area type="monotone" dataKey="reliability" name="Confiabilidad" stroke="#22c55e" fill="#22c55e33" />
                      <Area type="monotone" dataKey="contractualCompliance" name="Cumplimiento" stroke="#f59e0b" fill="#f59e0b33" />
                      <Area type="monotone" dataKey="lossesRatio" name="Ratio de perdidas" stroke="#ef4444" fill="#ef444433" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>
            <section className="panel">
              <article className="card">
                <h3>Eventos de causa común (junio)</h3>
                <p className="muted">Seis fechas con afectación multiunidad de origen externo (SIN, MRU, protecciones de red).</p>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Evento sistemico</th>
                        <th>Sistemas afectados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commonCauseEvents.length === 0 ? (
                        <tr><td colSpan={3}>Sin eventos de causa comun cargados.</td></tr>
                      ) : (
                        commonCauseEvents.map((row) => (
                          <tr key={`${row.date}-${row.description}`}>
                            <td>{row.date}</td>
                            <td>{row.description}</td>
                            <td>{row.systemsAffected}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          </>
        )}

        {activePage === "acciones" && (
          <>
            <section className="kpi-grid">
              <KpiCard title="Acciones del plan" reference="Tracker formal en fuentes GTE" icon={<ClipboardList size={18} />} value="N/A" delta={0} target="Sin fechas/estados oficiales" deltaUnit="count" hideDelta />
              <KpiCard title="En curso" reference="No reportado" icon={<Wrench size={18} />} value="N/A" delta={0} target="N/A" deltaUnit="count" hideDelta />
              <KpiCard title="Pendientes" reference="No reportado" icon={<AlertTriangle size={18} />} value="N/A" delta={0} target="N/A" deltaUnit="count" hideDelta />
              <KpiCard title="Completadas" reference="No reportado" icon={<CheckCircle2 size={18} />} value="N/A" delta={0} target="N/A" deltaUnit="count" hideDelta />
            </section>
            <section className="panel">
              <article className="card">
                <h3>Plan de acción</h3>
                <p className="muted">
                  N/A — las fuentes no traen un plan de acción con responsables, fechas ni estados.
                  No se inventan due dates. El DOCX de junio solo recomienda priorizar RCA de CPW06 antes del cierre de julio.
                </p>
                <div className="action-list">
                  {actionPlan.length === 0 ? (
                    <p className="muted">Sin filas cargadas (correcto: no inventar acciones).</p>
                  ) : (
                    actionPlan.map((action) => (
                      <div className="action-item" key={action.id}>
                        <div className="action-header">
                          <strong>{action.id}</strong>
                          <span className={`badge ${action.status === "Completada" ? "success" : action.status === "En curso" ? "warning" : "info"}`}>{action.status}</span>
                        </div>
                        <label>
                          Accion
                          <input value={action.action} onChange={(e) => updateAction(action.id, "action", e.target.value)} />
                        </label>
                        <div className="action-two">
                          <label>
                            Responsable
                            <input value={action.owner} onChange={(e) => updateAction(action.id, "owner", e.target.value)} />
                          </label>
                          <label>
                            Fecha compromiso
                            <input type="date" value={action.dueDate} onChange={(e) => updateAction(action.id, "dueDate", e.target.value)} />
                          </label>
                        </div>
                        <label>
                          Evidencia
                          <textarea value={action.evidence} onChange={(e) => updateAction(action.id, "evidence", e.target.value)} />
                        </label>
                        <label>
                          Resultado esperado
                          <textarea value={action.expectedResult} onChange={(e) => updateAction(action.id, "expectedResult", e.target.value)} />
                        </label>
                        <label>
                          Estado
                          <select value={action.status} onChange={(e) => updateAction(action.id, "status", e.target.value as ActionRow["status"])}>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En curso">En curso</option>
                            <option value="Completada">Completada</option>
                          </select>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </article>
            </section>
          </>
        )}

        {selectedMachine && (
          <div className="modal-overlay" onClick={() => setSelectedMachine(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Detalle de máquina: {selectedMachine.unidad}</h3>
                <button className="open-popup-btn" onClick={() => setSelectedMachine(null)}>
                  Cerrar
                </button>
              </div>
              <div className="modal-grid">
                <div>
                  <p><strong>Campo:</strong> {selectedMachine.campo}</p>
                  <p><strong>Horas Stand By:</strong> {selectedMachine.horasStandBy == null ? "—" : selectedMachine.horasStandBy}</p>
                  <p><strong>Disponibilidad:</strong> {selectedMachine.disponibilidadPct == null ? "N/A" : `${selectedMachine.disponibilidadPct.toFixed(2)}%`}</p>
                  <p><strong>Confiabilidad:</strong> {selectedMachine.confiabilidadPct == null ? "N/A" : `${selectedMachine.confiabilidadPct.toFixed(2)}%`}</p>
                  <p><strong># Fallas:</strong> {selectedMachine.fallas}</p>
                  <p>
                    <strong>MTBF:</strong> {selectedMachine.mtbfLabel}{" "}
                    <span className="metric-def">{METRIC_DEFS.MTBF.es}</span>
                  </p>
                  <p>
                    <strong>MTTR:</strong>{" "}
                    {selectedMachine.mttrHours == null ? "N/A" : `${selectedMachine.mttrHours} h`}{" "}
                    <span className="metric-def">{METRIC_DEFS.MTTR.es}</span>
                  </p>
                  <p><strong>Riesgo técnico:</strong> {selectedMachine.riesgoTecnico}</p>
                  <p><strong>Probabilidad:</strong> {riskAxisLabel(selectedMachine.probabilidad)}</p>
                  <p><strong>Severidad:</strong> {riskAxisLabel(selectedMachine.severidad)}</p>
                  <p><strong>Cumplimiento:</strong> {selectedMachine.cumplimiento}</p>
                  {selectedMachine.detalle ? (
                    <p><strong>Nota del anexo:</strong> {selectedMachine.detalle}</p>
                  ) : null}
                </div>
                <div>
                  <p><strong>Energia:</strong> {selectedMachineGeneration ? kwh(selectedMachineGeneration.energiaKwh) : "Sin dato"}</p>
                  <p><strong>Horas operacion:</strong> {selectedMachineGeneration?.horasOperacion ?? "Sin dato"}</p>
                  <p><strong>Horas stand-by (Excel):</strong> {selectedMachineGeneration?.horasStandBy ?? "Sin dato"}</p>
                  <p><strong>Horas PP:</strong> {selectedMachineGeneration?.horasPP ?? "Sin dato"}</p>
                  <p><strong>Horas PF contratista:</strong> {selectedMachineGeneration?.horasPFContr ?? "Sin dato"}</p>
                  <p><strong>Horas PF cliente:</strong> {selectedMachineGeneration?.horasPFCli ?? "Sin dato"}</p>
                  <p><strong>Horas calculadas:</strong> {selectedMachineGeneration?.horasCalDia ?? "Sin dato"}</p>
                  <p><strong># Falla evento (Excel):</strong> {selectedMachineGeneration?.fallaEvento ?? "Sin dato"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedFailureEvent && (
          <div className="modal-overlay" onClick={() => setSelectedFailureEvent(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Detalle de falla: {selectedFailureEvent.equipment}</h3>
                <button className="open-popup-btn" onClick={() => setSelectedFailureEvent(null)}>
                  Cerrar
                </button>
              </div>
              <div className="modal-grid">
                <div>
                  <p><strong>Fecha:</strong> {selectedFailureEvent.date}</p>
                  <p><strong>Tipo:</strong> {selectedFailureEvent.eventType}</p>
                  <p><strong>Responsable:</strong> {selectedFailureEvent.responsible}</p>
                  <p><strong>Horas afectadas:</strong> {selectedFailureEvent.downtimeHours.toFixed(1)} h</p>
                  <p><strong>Causa:</strong> {selectedFailureEvent.cause}</p>
                </div>
                <div>
                  <p><strong>Plan de accion:</strong> {getEventActionPlan(selectedFailureEvent)}</p>
                  <p><strong>Como se resolvio:</strong> {getEventResolution(selectedFailureEvent)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

type KpiCardProps = {
  title: string;
  reference?: string;
  icon: ReactNode;
  value: string;
  delta: number;
  target: string;
  deltaUnit?: "pp" | "mwh" | "hours" | "count";
  hideDelta?: boolean;
};

function KpiCard({ title, reference, icon, value, delta, target, deltaUnit = "pp", hideDelta = false }: KpiCardProps) {
  const positive = delta >= 0;
  let deltaText = `${positive ? "+" : ""}${delta.toFixed(1)} pp`;

  if (deltaUnit === "mwh") {
    deltaText = `${positive ? "+" : ""}${Math.round(delta).toLocaleString("es-CO")} MWh`;
  } else if (deltaUnit === "hours") {
    deltaText = `${positive ? "+" : ""}${delta.toFixed(2)} h`;
  } else if (deltaUnit === "count") {
    deltaText = `${positive ? "+" : ""}${Math.round(delta)} eventos`;
  }

  return (
    <article className="kpi-card">
      <div className="kpi-title">
        <span>{icon}</span>
        <div className="kpi-title-text">
          <p>{title}</p>
          {reference ? <small>{reference}</small> : null}
        </div>
      </div>
      <h3>{value}</h3>
      {hideDelta ? (
        <p className="delta">Sin dato vs mes anterior</p>
      ) : (
        <p className={positive ? "delta positive" : "delta negative"}>{deltaText} vs mes anterior</p>
      )}
      <small>Meta: {target}</small>
    </article>
  );
}

export default App;
