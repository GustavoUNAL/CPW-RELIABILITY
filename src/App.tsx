import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bug,
  CheckCircle2,
  ClipboardList,
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
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { REPORT_DATASETS } from "./domain/reliability/reports";
import type {
  ActionRow,
  Deviation,
  EventRecord,
  GenerationAssetRow,
  GenerationByEquipmentRow,
  MachineIndicatorRow,
  MaintenanceRow,
  PageKey,
  ReportKey,
  SummaryMetrics,
} from "./domain/reliability/types";

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
  { key: "resumen", label: "Resumen", icon: <LayoutDashboard size={16} />, description: "Vista ejecutiva" },
  { key: "generacion", label: "Generacion", icon: <Zap size={16} />, description: "Generacion por equipo y total" },
  { key: "maquinas", label: "Maquinas", icon: <Gauge size={16} />, description: "Indicadores por unidad" },
  { key: "indicadores", label: "Historico de eventos", icon: <BarChart3 size={16} />, description: "Eventos registrados y filtro de fallas" },
  { key: "desviaciones", label: "Desviaciones", icon: <TrendingUp size={16} />, description: "Brechas vs meta" },
  { key: "malos_actores", label: "Malos Actores", icon: <Bug size={16} />, description: "Fallas de impacto" },
  { key: "causas_raiz", label: "Causas Raiz", icon: <Search size={16} />, description: "Estado RCA" },
  { key: "mantenimiento", label: "Mantenimiento", icon: <Wrench size={16} />, description: "Plan tecnico" },
  { key: "riesgos", label: "Riesgos", icon: <ShieldAlert size={16} />, description: "Tendencias y alertas" },
  { key: "acciones", label: "Plan de Accion", icon: <ClipboardList size={16} />, description: "Seguimiento" },
];

const REPORT_TREE: ReportTree[] = [
  { key: "gran_tierra", label: "Gran Tierra Energy" },
];

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
const mwh = (value: number) => `${Math.round(value).toLocaleString("es-CO")} MWh`;
const kwh = (value: number) => `${Math.round(value).toLocaleString("es-CO")} kWh`;
const hours = (value: number) => `${value.toFixed(2)} h`;

const MAY_SUMMARY: SummaryMetrics = {
  copowerFailures: 10,
  totalEvents: 10,
  mtbfHours: 500.39,
  mttrHours: 5.32,
  actionsOverdue: 2,
  rcaPending: 4,
  hoursOperated: 6141.75,
  hoursStandby: 3262,
  hoursPreventive: 31,
  hoursCorrective: 66.25,
  hoursFailureCopower: 66.25,
  hoursFailureClient: 3,
  energyGasKwh: 3737235,
  energyDieselKwh: 217947,
};

const MAY_GENERATION_BY_ASSET: GenerationAssetRow[] = [
  { asset: "Costayaco", gasKwh: 3415843, dieselKwh: 217947 },
  { asset: "Vonu", gasKwh: 321392, dieselKwh: 0 },
];

const MAY_GENERATION_BY_EQUIPMENT: GenerationByEquipmentRow[] = [
  { equipo: "CPW01", campo: "COSTAYACO", energiaKwh: 471917, horasOperacion: 711, horasStandBy: 24, horasPP: 5, horasPFContr: 4, horasPFCli: 0, horasCalDia: 744, fallaEvento: 1 },
  { equipo: "CPW02", campo: "COSTAYACO", energiaKwh: 477675, horasOperacion: 726, horasStandBy: 18, horasPP: 0, horasPFContr: 0, horasPFCli: 0, horasCalDia: 744, fallaEvento: 0 },
  { equipo: "CPW03", campo: "COSTAYACO", energiaKwh: 478517, horasOperacion: 723, horasStandBy: 21, horasPP: 0, horasPFContr: 0, horasPFCli: 0, horasCalDia: 744, fallaEvento: 0 },
  { equipo: "CPW04", campo: "COSTAYACO", energiaKwh: 529307, horasOperacion: 652, horasStandBy: 62, horasPP: 0, horasPFContr: 30, horasPFCli: 0, horasCalDia: 744, fallaEvento: 4 },
  { equipo: "CPW05", campo: "COSTAYACO", energiaKwh: 582181, horasOperacion: 690.75, horasStandBy: 50, horasPP: 0, horasPFContr: 3.25, horasPFCli: 0, horasCalDia: 744, fallaEvento: 2 },
  { equipo: "CPW06", campo: "COSTAYACO", energiaKwh: 659082, horasOperacion: 708, horasStandBy: 27, horasPP: 9, horasPFContr: 0, horasPFCli: 0, horasCalDia: 744, fallaEvento: 0 },
  { equipo: "G101V", campo: "COSTAYACO", energiaKwh: 42884, horasOperacion: 127, horasStandBy: 617, horasPP: 0, horasPFContr: 0, horasPFCli: 0, horasCalDia: 744, fallaEvento: 0 },
  { equipo: "G102J", campo: "COSTAYACO", energiaKwh: 52230, horasOperacion: 69, horasStandBy: 675, horasPP: 0, horasPFContr: 0, horasPFCli: 0, horasCalDia: 744, fallaEvento: 0 },
  { equipo: "G102K", campo: "COSTAYACO", energiaKwh: 122833, horasOperacion: 163, horasStandBy: 581, horasPP: 0, horasPFContr: 0, horasPFCli: 0, horasCalDia: 744, fallaEvento: 0 },
  { equipo: "JIN-01", campo: "VONU", energiaKwh: 217961, horasOperacion: 629, horasStandBy: 84, horasPP: 8, horasPFContr: 20, horasPFCli: 3, horasCalDia: 744, fallaEvento: 1 },
  { equipo: "JIN-02", campo: "VONU", energiaKwh: 103356, horasOperacion: 318, horasStandBy: 424, horasPP: 0, horasPFContr: 2, horasPFCli: 0, horasCalDia: 744, fallaEvento: 1 },
  { equipo: "JIN-10", campo: "COSTAYACO", energiaKwh: 217164, horasOperacion: 625, horasStandBy: 103, horasPP: 9, horasPFContr: 7, horasPFCli: 0, horasCalDia: 744, fallaEvento: 1 },
];

const MAY_MACHINE_INDICATORS: MachineIndicatorRow[] = [
  { unidad: "CPW01", campo: "COSTAYACO", horasStandBy: 24, disponibilidadPct: 98.79, confiabilidadPct: 99.46, fallas: 1, mtbfLabel: "711.00", mttrHours: 4, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE" },
  { unidad: "CPW02", campo: "COSTAYACO", horasStandBy: 18, disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE" },
  { unidad: "CPW03", campo: "COSTAYACO", horasStandBy: 21, disponibilidadPct: 100, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE" },
  { unidad: "CPW04", campo: "COSTAYACO", horasStandBy: 62, disponibilidadPct: 95.97, confiabilidadPct: 95.97, fallas: 4, mtbfLabel: "163.00", mttrHours: 7.5, riesgoTecnico: "RIESGO MEDIO", cumplimiento: "CUMPLE" },
  { unidad: "CPW05", campo: "COSTAYACO", horasStandBy: 50, disponibilidadPct: 99.56, confiabilidadPct: 99.56, fallas: 2, mtbfLabel: "345.38", mttrHours: 1.63, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE" },
  { unidad: "CPW06", campo: "COSTAYACO", horasStandBy: 27, disponibilidadPct: 98.79, confiabilidadPct: 100, fallas: 0, mtbfLabel: "Sin Fallas", mttrHours: 0, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE" },
  { unidad: "JIN-01", campo: "VONU", horasStandBy: 84, disponibilidadPct: 95.83, confiabilidadPct: 97.31, fallas: 1, mtbfLabel: "629.00", mttrHours: 20, riesgoTecnico: "RIESGO MEDIO", cumplimiento: "CUMPLE" },
  { unidad: "JIN-02", campo: "VONU", horasStandBy: 424, disponibilidadPct: 99.73, confiabilidadPct: 99.73, fallas: 1, mtbfLabel: "318.00", mttrHours: 2, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE" },
  { unidad: "JIN-10", campo: "COSTAYACO", horasStandBy: 103, disponibilidadPct: 97.85, confiabilidadPct: 99.06, fallas: 1, mtbfLabel: "625.00", mttrHours: 7, riesgoTecnico: "RIESGO BAJO", cumplimiento: "CUMPLE" },
  { unidad: "SISTEMA N", campo: "COSTAYACO", horasStandBy: 3262, disponibilidadPct: 92.88, confiabilidadPct: 94.05, fallas: 7, mtbfLabel: "500.39", mttrHours: 5.32, riesgoTecnico: "RIESGO MEDIO", cumplimiento: "CUMPLE" },
  { unidad: "SISTEMA N", campo: "VONU", horasStandBy: 508, disponibilidadPct: 95.97, confiabilidadPct: 97.04, fallas: 2, mtbfLabel: "473.50", mttrHours: 11, riesgoTecnico: "RIESGO MEDIO", cumplimiento: "CUMPLE" },
];

const MAY_EVENT_LOG: EventRecord[] = [
  { date: "2026-05-03", equipment: "CPW04", eventType: "Falla", cause: "Salida repetitiva en sistema de control", downtimeHours: 8, responsible: "COPOWER", notes: "Primer evento relevante del mes." },
  { date: "2026-05-08", equipment: "CPW04", eventType: "Falla", cause: "Disparo por proteccion electrica", downtimeHours: 7.5, responsible: "COPOWER", notes: "Evento recurrente en CPW04." },
  { date: "2026-05-11", equipment: "CPW04", eventType: "Falla", cause: "Desbalance de carga", downtimeHours: 7, responsible: "COPOWER", notes: "Tercer evento en CPW04." },
  { date: "2026-05-15", equipment: "CPW04", eventType: "Falla", cause: "Parada no programada por proteccion", downtimeHours: 7.5, responsible: "COPOWER", notes: "Cuarta recurrencia del activo dominante." },
  { date: "2026-05-18", equipment: "CPW05", eventType: "Falla", cause: "Falla de gobernacion", downtimeHours: 1.5, responsible: "COPOWER", notes: "Evento aislado." },
  { date: "2026-05-20", equipment: "CPW05", eventType: "Falla", cause: "Potencia inversa", downtimeHours: 1.75, responsible: "COPOWER", notes: "Segundo evento de CPW05." },
  { date: "2026-05-22", equipment: "CPW01", eventType: "Falla", cause: "Interrupcion en sistema de escape", downtimeHours: 4, responsible: "COPOWER", notes: "Correctivo puntual." },
  { date: "2026-05-25", equipment: "JIN-01", eventType: "Falla", cause: "Parada correctiva en unidad Vonu", downtimeHours: 20, responsible: "COPOWER", notes: "Afecta confiabilidad de Vonu." },
  { date: "2026-05-26", equipment: "JIN-02", eventType: "Falla", cause: "Parada por ajuste de operacion", downtimeHours: 2, responsible: "COPOWER", notes: "Segundo evento Vonu." },
  { date: "2026-05-28", equipment: "JIN-10", eventType: "Falla", cause: "Evento correctivo aislado", downtimeHours: 7, responsible: "COPOWER", notes: "Sin recurrencia posterior en mayo." },
];

function App() {
  const [activeReport, setActiveReport] = useState<ReportKey>("gran_tierra");
  const [maintenanceByReport, setMaintenanceByReport] = useState<Record<ReportKey, MaintenanceRow[]>>({
    gran_tierra: REPORT_DATASETS.gran_tierra.maintenancePlan,
    copower_interno: REPORT_DATASETS.copower_interno.maintenancePlan,
  });
  const [actionsByReport, setActionsByReport] = useState<Record<ReportKey, ActionRow[]>>({
    gran_tierra: REPORT_DATASETS.gran_tierra.actionPlan,
    copower_interno: REPORT_DATASETS.copower_interno.actionPlan,
  });
  const [activePage, setActivePage] = useState<PageKey>("resumen");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [onlyFailureEvents, setOnlyFailureEvents] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Jun");
  const [selectedMachine, setSelectedMachine] = useState<MachineIndicatorRow | null>(null);
  const [tableSorts, setTableSorts] = useState<Record<string, SortConfig>>({
    eventos: { key: "date", direction: "desc" },
    maquinas: { key: "unidad", direction: "asc" },
    desviaciones: { key: "indicator", direction: "asc" },
    malosActores: { key: "generationImpactMwh", direction: "desc" },
    rca: { key: "value", direction: "desc" },
    generacionCostayaco: { key: "energiaKwh", direction: "desc" },
    generacionVonu: { key: "energiaKwh", direction: "desc" },
  });

  const reportData = REPORT_DATASETS[activeReport];
  const kpiData = reportData.kpiData;
  const targets = reportData.kpiTargets;
  const badActors = reportData.badActors;
  const rcaData = reportData.rca;
  const maintenancePlan = maintenanceByReport[activeReport];
  const actionPlan = actionsByReport[activeReport];
  const eventLog = selectedMonth === "May" ? MAY_EVENT_LOG : reportData.eventLog;
  const machineIndicators = selectedMonth === "May" ? MAY_MACHINE_INDICATORS : reportData.machineIndicators;
  const generationByEquipment = selectedMonth === "May" ? MAY_GENERATION_BY_EQUIPMENT : reportData.generationByEquipment;
  const totalGenerationKwh = selectedMonth === "May" ? 3955182 : reportData.totalGenerationKwh;
  const generationCostayaco = generationByEquipment.filter((row) => row.campo === "COSTAYACO");
  const generationVonu = generationByEquipment.filter((row) => row.campo === "VONU");
  const totalCostayaco = generationCostayaco.reduce((acc, row) => acc + row.energiaKwh, 0);
  const totalVonu = generationVonu.reduce((acc, row) => acc + row.energiaKwh, 0);

  const monthIndex = kpiData.findIndex((row) => row.month === selectedMonth);
  const safeIndex = monthIndex >= 0 ? monthIndex : kpiData.length - 1;
  const current = kpiData[safeIndex];
  const previous = kpiData[Math.max(0, safeIndex - 1)];
  const isNoDataReport =
    !reportData.source &&
    kpiData.every(
      (row) =>
        row.availability === 0 &&
        row.reliability === 0 &&
        row.maintainability === 0 &&
        row.generationMwh === 0 &&
        row.operationalLossesMwh === 0 &&
        row.contractualCompliance === 0,
    );

  const deviations: Deviation[] = useMemo(
    () => [
      {
        indicator: "Disponibilidad",
        value: current.availability,
        target: targets.availability,
        technicalExplanation:
          isNoDataReport
            ? "Sin datos reportados para este periodo."
            : current.availability >= targets.availability
            ? "Control de indisponibilidad forzada dentro del plan."
            : "Afectada por indisponibilidades recurrentes reportadas en el periodo.",
      },
      {
        indicator: "Confiabilidad",
        value: current.reliability,
        target: targets.reliability,
        technicalExplanation:
          isNoDataReport
            ? "Sin datos reportados para este periodo."
            : current.reliability >= targets.reliability
            ? "Mejor comportamiento de fallas repetitivas en subsistemas críticos."
            : "Frecuencia de fallas superior al patrón esperado.",
      },
      {
        indicator: "Mantenibilidad",
        value: current.maintainability,
        target: targets.maintainability,
        technicalExplanation:
          isNoDataReport
            ? "Sin datos reportados para este periodo."
            : current.maintainability >= targets.maintainability
            ? "Tiempos de reparación en rango objetivo."
            : "Se observan tiempos de reparación por encima del estándar.",
      },
      {
        indicator: "Cumplimiento contractual",
        value: current.contractualCompliance,
        target: targets.contractualCompliance,
        technicalExplanation:
          isNoDataReport
            ? "Sin datos reportados para este periodo."
            : current.contractualCompliance >= targets.contractualCompliance
            ? "Entrega energética alineada a la obligación contractual."
            : "La menor generación neta reduce el cumplimiento.",
      },
    ],
    [current, targets, isNoDataReport],
  );

  const complianceChartData = deviations.map((d) => ({
    indicador: d.indicator,
    actual: Number((d.value * 100).toFixed(1)),
    meta: Number((d.target * 100).toFixed(1)),
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
    lossesRatio: row.operationalLossesMwh / row.generationMwh,
  }));

  const topBadActors = [...badActors].sort((a, b) => b.generationImpactMwh - a.generationImpactMwh);

  const rcaTotal = rcaData.reduce((acc, cur) => acc + cur.value, 0);
  const rcaSummary = rcaData.map((item) => ({
    ...item,
    percentage: rcaTotal > 0 ? ((item.value / rcaTotal) * 100).toFixed(1) : "0.0",
  }));

  const riskCards = [
    {
      title: "Confiabilidad en tendencia",
      value: percent(current.reliability),
      status: isNoDataReport ? "neutral" : current.reliability >= targets.reliability ? "ok" : "warning",
      note: "Promedio movil de confiabilidad en periodo reciente.",
    },
    {
      title: "Perdidas operacionales",
      value: mwh(current.operationalLossesMwh),
      status: isNoDataReport ? "neutral" : current.operationalLossesMwh <= targets.operationalLossesMwh ? "ok" : "warning",
      note: "Comparado con meta operacional mensual.",
    },
    {
      title: "Cumplimiento contractual",
      value: percent(current.contractualCompliance),
      status: isNoDataReport ? "neutral" : current.contractualCompliance >= targets.contractualCompliance ? "ok" : "warning",
      note: "Entrega energetica contractual del periodo.",
    },
  ] as const;

  const pageTitle = NAV_ITEMS.find((item) => item.key === activePage)?.label ?? "Resumen";
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

  const summary = selectedMonth === "May" ? MAY_SUMMARY : reportData.summary;
  const reliabilityTrendData = reportData.reliabilityTrend;
  const causeParetoData = reportData.causePareto;
  const generationByAssetData = selectedMonth === "May" ? MAY_GENERATION_BY_ASSET : reportData.generationByAsset;
  const operationHoursData = [
    {
      name: "Junio",
      operacion: summary.hoursOperated,
      standby: summary.hoursStandby,
      preventivo: summary.hoursPreventive,
      fallaCopower: summary.hoursFailureCopower,
      fallaCliente: summary.hoursFailureClient,
    },
  ];
  const generationSourceData = [
    { source: "Gas", value: summary.energyGasKwh },
    { source: "Diesel", value: summary.energyDieselKwh },
  ];
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

    const sameFieldRows = generationByEquipment.filter((row) => row.campo === selectedMachine.campo);
    if (selectedMachine.unidad === "SISTEMA N") {
      return {
        equipo: `SISTEMA N ${selectedMachine.campo}`,
        campo: selectedMachine.campo,
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
      generationByEquipment.find(
        (row) => row.equipo === selectedMachine.unidad && row.campo === selectedMachine.campo,
      ) ?? null
    );
  }, [selectedMachine, generationByEquipment]);

  const selectTreeNode = (report: ReportKey, page: PageKey) => {
    setActiveReport(report);
    setActivePage(page);
  };

  return (
    <div className={`app-shell ${theme}`}>
      <aside className="sidebar">
        <div className="brand">
          <p className="eyebrow">Confiabilidad Operacional</p>
          <h1>Parque de Generacion Costayaco</h1>
        </div>
        <div className="sidebar-controls">
          <div className="month-picker">
            <label htmlFor="month-selector">Mes analizado</label>
            <select id="month-selector" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              <option value="May">May</option>
              <option value="Jun">Jun</option>
            </select>
          </div>
          <div className="header-theme-switch">
            <label>Modo de vista</label>
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
          <p className="eyebrow">Datos reportadados por Gran Tierra Energy.</p>
          {REPORT_TREE.map((report) => (
            <div key={report.key} className={activeReport === report.key ? "tree-group active" : "tree-group"}>
              <p className="tree-title">{report.label}</p>
              <nav className="menu">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeReport === report.key && activePage === item.key;
                  return (
                    <button
                      key={`${report.key}-${item.key}`}
                      className={isActive ? "menu-item active" : "menu-item"}
                      onClick={() => selectTreeNode(report.key, item.key)}
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
      </aside>

      <main className="main">
        {isNoDataReport ? (
          <section className="panel">
            <article className="card">
              <h3>{pageTitle}</h3>
              <div className="no-data-state">
                <p>No se tiene informacion disponible para CoPower.</p>
                <p>Este modulo mostrara datos en cuanto se cargue la fuente interna.</p>
              </div>
            </article>
          </section>
        ) : (
          <>
        {activePage === "resumen" && (
          <>
            <section className="kpi-grid">
              <KpiCard
                title="Disponib. Sist. Costayaco"
                icon={<Gauge size={18} />}
                value={percent(current.availability)}
                delta={(current.availability - previous.availability) * 100}
                target={percent(targets.availability)}
              />
              <KpiCard
                title="Confiab. Sist. Costayaco"
                icon={<ShieldCheck size={18} />}
                value={percent(current.reliability)}
                delta={(current.reliability - previous.reliability) * 100}
                target={percent(targets.reliability)}
              />
              <KpiCard
                title="Eventos de falla"
                icon={<Wrench size={18} />}
                value={String(summary.copowerFailures)}
                delta={0}
                target="Meta <= 7"
              />
              <KpiCard
                title="Eventos Totales"
                icon={<Zap size={18} />}
                value={String(summary.totalEvents)}
                delta={0}
                target="Bitacora junio"
              />
              <KpiCard
                title="MTBF"
                icon={<Gauge size={18} />}
                value={hours(summary.mtbfHours)}
                delta={summary.mtbfHours - reportData.reliabilityTrend[Math.max(0, reportData.reliabilityTrend.length - 2)].mtbfHours}
                target="Meta >= 650 h"
              />
              <KpiCard
                title="MTTR"
                icon={<Wrench size={18} />}
                value={hours(summary.mttrHours)}
                delta={summary.mttrHours - reportData.reliabilityTrend[Math.max(0, reportData.reliabilityTrend.length - 2)].mttrHours}
                target="Meta <= 4 h"
              />
              <KpiCard
                title="Energia Total"
                icon={<Zap size={18} />}
                value={kwh((current.generationMwh || 0) * 1000)}
                delta={(current.generationMwh - previous.generationMwh) * 1000}
                target={kwh(targets.generationMwh * 1000)}
                isEnergy
              />
              <KpiCard
                title="Acciones / RCA Pend."
                icon={<ClipboardList size={18} />}
                value={`${summary.actionsOverdue} / ${summary.rcaPending}`}
                delta={0}
                target="Vencidas / pendientes"
              />
            </section>

            <section className="panel two-col">
              <article className="card">
                <h3>Tendencia mensual: Disponibilidad, Confiabilidad, MTBF y MTTR</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reliabilityTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                      <XAxis dataKey="month" stroke="var(--text-muted)" />
                      <YAxis yAxisId="pct" stroke="var(--text-muted)" tickFormatter={(v) => `${v * 100}%`} />
                      <YAxis yAxisId="hrs" orientation="right" stroke="var(--text-muted)" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="pct" type="monotone" dataKey="availability" name="Disponibilidad" stroke="#60a5fa" strokeWidth={2} />
                      <Line yAxisId="pct" type="monotone" dataKey="reliability" name="Confiabilidad" stroke="#34d399" strokeWidth={2} />
                      <Line yAxisId="hrs" type="monotone" dataKey="mtbfHours" name="MTBF (h)" stroke="#f59e0b" strokeWidth={2} />
                      <Line yAxisId="hrs" type="monotone" dataKey="mttrHours" name="MTTR (h)" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="card">
                <h3>Pareto de fallas por equipo (malos actores)</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topBadActors}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                      <XAxis dataKey="equipment" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip />
                      <Bar dataKey="frequency" name="Numero de eventos" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>

            <section className="panel two-col">
              <article className="card">
                <h3>Pareto de causas (bitacora)</h3>
                <div className="chart-container compact">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={causeParetoData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                      <XAxis dataKey="cause" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip />
                      <Bar dataKey="count" name="Registros" fill="#a78bfa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="card">
                <h3>Horas apiladas: operacion, stand-by y fallas</h3>
                <div className="chart-container compact">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={operationHoursData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip />
                      <Legend />
                      <Bar stackId="a" dataKey="operacion" name="Operacion" fill="#22c55e" />
                      <Bar stackId="a" dataKey="standby" name="Stand-by" fill="#60a5fa" />
                      <Bar stackId="a" dataKey="preventivo" name="Preventivo" fill="#f59e0b" />
                      <Bar stackId="a" dataKey="fallaCopower" name="Falla COPOWER" fill="#ef4444" />
                      <Bar stackId="a" dataKey="fallaCliente" name="Falla cliente/externa" fill="#a855f7" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>

            <section className="panel two-col">
              <article className="card">
                <h3>Generacion por combustible (gas vs diesel)</h3>
                <div className="chart-container compact">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={generationSourceData} dataKey="value" nameKey="source" innerRadius={45} outerRadius={85}>
                        <Cell fill="#22c55e" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip formatter={(value) => `${Math.round(Number(value)).toLocaleString("es-CO")} kWh`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="card">
                <h3>Generacion por campo / equipo</h3>
                <div className="chart-container compact">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={generationByAssetData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                      <XAxis dataKey="asset" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" />
                      <Tooltip formatter={(value) => `${Math.round(Number(value)).toLocaleString("es-CO")} kWh`} />
                      <Legend />
                      <Bar dataKey="gasKwh" name="Gas (kWh)" fill="#22c55e" />
                      <Bar dataKey="dieselKwh" name="Diesel (kWh)" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>
          </>
        )}

        {activePage === "indicadores" && (
          <section className="panel">
            <article className="card">
              <h3>Eventos registrados en {selectedMonth}</h3>
              <div className="event-filters">
                <label className="event-filter-check">
                  <input type="checkbox" checked={onlyFailureEvents} onChange={(e) => setOnlyFailureEvents(e.target.checked)} />
                  Mostrar solo eventos de falla
                </label>
                <span className="event-count">
                  {filteredEvents.length} evento(s) {onlyFailureEvents ? "de falla" : "totales"}
                </span>
              </div>
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
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7}>Sin eventos para el filtro seleccionado.</td>
                    </tr>
                  ) : (
                    sortedEvents.map((event) => (
                      <tr key={`${event.date}-${event.equipment}-${event.cause}`}>
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
                        <td>{event.responsible}</td>
                        <td>{event.notes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </article>
          </section>
        )}

        {activePage === "maquinas" && (
          <section className="panel">
            <article className="card">
              <h3>Indicadores por maquina - {selectedMonth}</h3>
              <table>
                <thead>
                  <tr>
                    <th><button className="sort-button" onClick={() => toggleSort("maquinas", "unidad")}>Unidad {getSortIndicator("maquinas", "unidad")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("maquinas", "campo")}>Campo {getSortIndicator("maquinas", "campo")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("maquinas", "horasStandBy")}>Horas Stand By {getSortIndicator("maquinas", "horasStandBy")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("maquinas", "disponibilidadPct")}>Disponibilidad % {getSortIndicator("maquinas", "disponibilidadPct")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("maquinas", "confiabilidadPct")}>Confiabilidad % {getSortIndicator("maquinas", "confiabilidadPct")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("maquinas", "fallas")}>#Fallas {getSortIndicator("maquinas", "fallas")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("maquinas", "mtbfLabel")}>MTBF_h {getSortIndicator("maquinas", "mtbfLabel")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("maquinas", "mttrHours")}>MTTR_h {getSortIndicator("maquinas", "mttrHours")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("maquinas", "riesgoTecnico")}>Riesgo tecnico {getSortIndicator("maquinas", "riesgoTecnico")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("maquinas", "cumplimiento")}>Cumplimiento {getSortIndicator("maquinas", "cumplimiento")}</button></th>
                    <th>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {machineIndicators.length === 0 ? (
                    <tr>
                      <td colSpan={11}>Sin datos por unidad para este reporte.</td>
                    </tr>
                  ) : (
                    sortedMachineIndicators.map((row) => (
                      <tr key={`${row.unidad}-${row.campo}`}>
                        <td>{row.unidad}</td>
                        <td>{row.campo}</td>
                        <td>{row.horasStandBy}</td>
                        <td>{row.disponibilidadPct.toFixed(2)}%</td>
                        <td>{row.confiabilidadPct.toFixed(2)}%</td>
                        <td>{row.fallas}</td>
                        <td>{row.mtbfLabel}</td>
                        <td>{row.mttrHours}</td>
                        <td>
                          <span className={`badge ${row.riesgoTecnico === "RIESGO MEDIO" ? "warning" : row.riesgoTecnico === "RIESGO ALTO" ? "danger" : "success"}`}>
                            {row.riesgoTecnico}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${row.cumplimiento === "CUMPLE" ? "success" : "danger"}`}>{row.cumplimiento}</span>
                        </td>
                        <td>
                          <button className="open-popup-btn" onClick={() => setSelectedMachine(row)}>
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <p className="muted">
                Premisa de estabilizacion: JIN11 y JIN12 se evaluan individualmente sobre una ventana de 19 dias y no se incorporan al calculo sistemico de Costayaco para junio.
              </p>
            </article>
          </section>
        )}

        {activePage === "generacion" && (
          <section className="panel">
            <article className="card">
              <h3>Generacion por equipo y total mensual - {selectedMonth}</h3>
              <p className="muted">Fuente: carpeta data/GTE (archivos de mayo y junio 2026).</p>
              <div className="kpi-grid">
                <KpiCard title="Total generado" icon={<Zap size={18} />} value={kwh(totalGenerationKwh)} delta={0} target="Total general Excel" isEnergy />
                <KpiCard
                  title="Total Costayaco"
                  icon={<Gauge size={18} />}
                  value={kwh(totalCostayaco)}
                  delta={0}
                  target="Campo COSTAYACO"
                  isEnergy
                />
                <KpiCard
                  title="Total Vonu"
                  icon={<Gauge size={18} />}
                  value={kwh(totalVonu)}
                  delta={0}
                  target="Campo VONU"
                  isEnergy
                />
                <KpiCard
                  title="Equipos reportados"
                  icon={<Gauge size={18} />}
                  value={String(generationByEquipment.length)}
                  delta={0}
                  target="Unidades con energia"
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
          <section className="panel two-col">
            <article className="card">
              <h3>Brechas contra metas</h3>
              <table>
                <thead>
                  <tr>
                    <th><button className="sort-button" onClick={() => toggleSort("desviaciones", "indicator")}>Indicador {getSortIndicator("desviaciones", "indicator")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("desviaciones", "value")}>Actual {getSortIndicator("desviaciones", "value")}</button></th>
                    <th><button className="sort-button" onClick={() => toggleSort("desviaciones", "target")}>Meta {getSortIndicator("desviaciones", "target")}</button></th>
                    <th>Brecha</th>
                    <th>Explicacion tecnica</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDeviations.map((d) => {
                    const diff = (d.value - d.target) * 100;
                    const diffClass = isNoDataReport ? "badge info" : diff >= 0 ? "badge success" : "badge danger";
                    return (
                      <tr key={d.indicator}>
                        <td>{d.indicator}</td>
                        <td>{percent(d.value)}</td>
                        <td>{percent(d.target)}</td>
                        <td>
                          <span className={diffClass}>
                            {diff >= 0 ? "+" : ""}
                            {diff.toFixed(1)} pp
                          </span>
                        </td>
                        <td>{d.technicalExplanation}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </article>
            <article className="card">
              <h3>Actual vs meta</h3>
              <div className="chart-container compact">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={complianceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                    <XAxis dataKey="indicador" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip formatter={(value) => `${Number(value ?? 0)}%`} />
                    <Legend />
                    <Bar dataKey="actual" name="Actual (%)" fill="#60a5fa" />
                    <Bar dataKey="meta" name="Meta (%)" fill="#34d399" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>
        )}

        {activePage === "malos_actores" && (
          <section className="panel two-col">
            <article className="card">
              <h3>Equipos de mayor impacto</h3>
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
                    <tr>
                      <td colSpan={7}>Sin datos de fallas para este reporte.</td>
                    </tr>
                  ) : (
                    sortedBadActors.map((item) => (
                    <tr key={item.equipment}>
                      <td>{item.equipment}</td>
                      <td>{item.system}</td>
                      <td>
                        <span
                          className={`badge ${item.criticality === "Alta" ? "danger" : item.criticality === "Media" ? "warning" : "info"}`}
                        >
                          {item.criticality}
                        </span>
                      </td>
                      <td>{item.frequency}</td>
                      <td>{item.knownCause}</td>
                      <td>{item.unavailabilityHours}</td>
                      <td>{mwh(item.generationImpactMwh)}</td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </article>
            <article className="card">
              <h3>Afectacion en generacion por equipo</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topBadActors}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                    <XAxis dataKey="equipment" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip formatter={(value) => `${Math.round(Number(value ?? 0))} MWh`} />
                    <Bar dataKey="generationImpactMwh" fill="#f97316" name="Perdida MWh" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>
        )}

        {activePage === "causas_raiz" && (
          <section className="panel two-col">
            <article className="card">
              <h3>Avance de causas raiz</h3>
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
            </article>
            <article className="card">
              <h3>Estado detallado RCA</h3>
              <table>
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th><button className="sort-button" onClick={() => toggleSort("rca", "value")}>Eventos {getSortIndicator("rca", "value")}</button></th>
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
            </article>
          </section>
        )}

        {activePage === "mantenimiento" && (
          <section className="panel">
            <article className="card">
              <h3>Plan de mantenimiento</h3>
              <p className="muted">
                Ajustes propuestos a mantenimientos preventivos, predictivos y correctivos con sustento tecnico, historial y criticidad.
              </p>
              <div className="editable-grid">
                {maintenancePlan.length === 0 ? (
                  <p className="muted">Sin datos de mantenimiento para este reporte.</p>
                ) : (
                  maintenancePlan.map((row) => (
                  <div className="editable-item" key={row.id}>
                    <div className="row-top">
                      <strong>{row.id}</strong>
                      <span className="badge info">{row.type}</span>
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
                      Recomendacion fabricante
                      <textarea
                        value={row.manufacturerRecommendation}
                        onChange={(e) => updateMaintenance(row.id, "manufacturerRecommendation", e.target.value)}
                      />
                    </label>
                  </div>
                  ))
                )}
              </div>
            </article>
          </section>
        )}

        {activePage === "riesgos" && (
          <section className="panel two-col">
            <article className="card">
              <h3>Riesgos y continuidad de servicio</h3>
              <div className="risk-list">
                {riskCards.map((risk) => (
                  <div
                    className={risk.status === "ok" ? "risk-ok" : risk.status === "warning" ? "risk-item" : "risk-neutral"}
                    key={risk.title}
                  >
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
              <h3>Tendencias de degradacion</h3>
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
        )}

        {activePage === "acciones" && (
          <section className="panel">
            <article className="card">
              <h3>Plan de accion</h3>
              <div className="action-list">
                {actionPlan.length === 0 ? (
                  <p className="muted">Sin plan de accion por falta de datos internos.</p>
                ) : (
                  actionPlan.map((action) => (
                  <div className="action-item" key={action.id}>
                    <div className="action-header">
                      <strong>{action.id}</strong>
                      <span
                        className={`badge ${action.status === "Completada" ? "success" : action.status === "En curso" ? "warning" : "info"}`}
                      >
                        {action.status}
                      </span>
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
                        <input
                          type="date"
                          value={action.dueDate}
                          onChange={(e) => updateAction(action.id, "dueDate", e.target.value)}
                        />
                      </label>
                    </div>
                    <label>
                      Estado
                      <select
                        value={action.status}
                        onChange={(e) => updateAction(action.id, "status", e.target.value as ActionRow["status"])}
                      >
                        <option>Pendiente</option>
                        <option>En curso</option>
                        <option>Completada</option>
                      </select>
                    </label>
                    <label>
                      Evidencia
                      <input value={action.evidence} onChange={(e) => updateAction(action.id, "evidence", e.target.value)} />
                    </label>
                    <label>
                      Resultado esperado
                      <textarea
                        value={action.expectedResult}
                        onChange={(e) => updateAction(action.id, "expectedResult", e.target.value)}
                      />
                    </label>
                  </div>
                  ))
                )}
              </div>
            </article>
          </section>
        )}
          </>
        )}

        {selectedMachine && (
          <div className="modal-overlay" onClick={() => setSelectedMachine(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Detalle de maquina: {selectedMachine.unidad}</h3>
                <button className="open-popup-btn" onClick={() => setSelectedMachine(null)}>
                  Cerrar
                </button>
              </div>
              <div className="modal-grid">
                <div>
                  <p><strong>Campo:</strong> {selectedMachine.campo}</p>
                  <p><strong>Disponibilidad:</strong> {selectedMachine.disponibilidadPct.toFixed(2)}%</p>
                  <p><strong>Confiabilidad:</strong> {selectedMachine.confiabilidadPct.toFixed(2)}%</p>
                  <p><strong># Fallas:</strong> {selectedMachine.fallas}</p>
                  <p><strong>MTBF:</strong> {selectedMachine.mtbfLabel}</p>
                  <p><strong>MTTR:</strong> {selectedMachine.mttrHours} h</p>
                  <p><strong>Riesgo tecnico:</strong> {selectedMachine.riesgoTecnico}</p>
                  <p><strong>Cumplimiento:</strong> {selectedMachine.cumplimiento}</p>
                </div>
                <div>
                  <p><strong>Energia:</strong> {selectedMachineGeneration ? kwh(selectedMachineGeneration.energiaKwh) : "Sin dato"}</p>
                  <p><strong>Horas operacion:</strong> {selectedMachineGeneration?.horasOperacion ?? "Sin dato"}</p>
                  <p><strong>Horas stand-by:</strong> {selectedMachineGeneration?.horasStandBy ?? "Sin dato"}</p>
                  <p><strong>Horas PP:</strong> {selectedMachineGeneration?.horasPP ?? "Sin dato"}</p>
                  <p><strong>Horas PF contratista:</strong> {selectedMachineGeneration?.horasPFContr ?? "Sin dato"}</p>
                  <p><strong>Horas PF cliente:</strong> {selectedMachineGeneration?.horasPFCli ?? "Sin dato"}</p>
                  <p><strong>Horas calculadas:</strong> {selectedMachineGeneration?.horasCalDia ?? "Sin dato"}</p>
                  <p><strong># Falla evento:</strong> {selectedMachineGeneration?.fallaEvento ?? "Sin dato"}</p>
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
  icon: ReactNode;
  value: string;
  delta: number;
  target: string;
  isEnergy?: boolean;
};

function KpiCard({ title, icon, value, delta, target, isEnergy = false }: KpiCardProps) {
  const positive = delta >= 0;
  const deltaText = isEnergy
    ? `${positive ? "+" : ""}${Math.round(delta).toLocaleString("es-CO")} MWh`
    : `${positive ? "+" : ""}${delta.toFixed(1)} pp`;

  return (
    <article className="kpi-card">
      <div className="kpi-title">
        <span>{icon}</span>
        <p>{title}</p>
      </div>
      <h3>{value}</h3>
      <p className={positive ? "delta positive" : "delta negative"}>{deltaText} vs mes anterior</p>
      <small>Meta: {target}</small>
    </article>
  );
}

export default App;
