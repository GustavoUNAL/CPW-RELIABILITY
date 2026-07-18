import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bug,
  CheckCircle2,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  Moon,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sun,
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

type KpiRow = {
  month: string;
  availability: number;
  reliability: number;
  maintainability: number;
  generationMwh: number;
  operationalLossesMwh: number;
  contractualCompliance: number;
};

type Deviation = {
  indicator: string;
  value: number;
  target: number;
  technicalExplanation: string;
};

type BadActor = {
  equipment: string;
  system: string;
  criticality: "Alta" | "Media" | "Baja";
  frequency: number;
  knownCause: string;
  generationImpactMwh: number;
  unavailabilityHours: number;
};

type MaintenanceRow = {
  id: string;
  system: string;
  type: "Preventivo" | "Predictivo" | "Correctivo";
  proposal: string;
  basis: string;
  manufacturerRecommendation: string;
};

type ActionRow = {
  id: string;
  action: string;
  owner: string;
  dueDate: string;
  status: "Pendiente" | "En curso" | "Completada";
  evidence: string;
  expectedResult: string;
};

type PageKey =
  | "resumen"
  | "indicadores"
  | "desviaciones"
  | "malos_actores"
  | "causas_raiz"
  | "mantenimiento"
  | "riesgos"
  | "acciones";

type NavItem = {
  key: PageKey;
  label: string;
  icon: ReactNode;
  description: string;
};

const KPI_DATA: KpiRow[] = [
  { month: "Ene", availability: 0.93, reliability: 0.91, maintainability: 0.78, generationMwh: 124000, operationalLossesMwh: 7800, contractualCompliance: 0.97 },
  { month: "Feb", availability: 0.91, reliability: 0.9, maintainability: 0.76, generationMwh: 121400, operationalLossesMwh: 8500, contractualCompliance: 0.95 },
  { month: "Mar", availability: 0.89, reliability: 0.88, maintainability: 0.74, generationMwh: 117900, operationalLossesMwh: 10200, contractualCompliance: 0.93 },
  { month: "Abr", availability: 0.92, reliability: 0.9, maintainability: 0.77, generationMwh: 122600, operationalLossesMwh: 8200, contractualCompliance: 0.96 },
  { month: "May", availability: 0.9, reliability: 0.87, maintainability: 0.73, generationMwh: 116800, operationalLossesMwh: 10800, contractualCompliance: 0.92 },
  { month: "Jun", availability: 0.94, reliability: 0.92, maintainability: 0.79, generationMwh: 126500, operationalLossesMwh: 7200, contractualCompliance: 0.98 },
];

const KPI_TARGETS = {
  availability: 0.92,
  reliability: 0.9,
  maintainability: 0.78,
  generationMwh: 123000,
  operationalLossesMwh: 8000,
  contractualCompliance: 0.96,
};

const INITIAL_BAD_ACTORS: BadActor[] = [
  {
    equipment: "GT-02 Combustor",
    system: "Combustion",
    criticality: "Alta",
    frequency: 5,
    knownCause: "Ensañamiento térmico por desbalance de mezcla",
    generationImpactMwh: 4100,
    unavailabilityHours: 27,
  },
  {
    equipment: "Bomba Lubricación B",
    system: "Lubricación",
    criticality: "Media",
    frequency: 4,
    knownCause: "Desgaste prematuro de sello mecánico",
    generationImpactMwh: 2100,
    unavailabilityHours: 16,
  },
  {
    equipment: "DCS Segmento Norte",
    system: "Control",
    criticality: "Alta",
    frequency: 3,
    knownCause: "Pérdida intermitente de sincronía de red",
    generationImpactMwh: 3250,
    unavailabilityHours: 18,
  },
  {
    equipment: "Torre Enfriamiento Fan-4",
    system: "BOP",
    criticality: "Baja",
    frequency: 6,
    knownCause: "Vibración por desalineación",
    generationImpactMwh: 900,
    unavailabilityHours: 9,
  },
];

const INITIAL_RCA = [
  { status: "Pendiente", value: 4, color: "#fb7185" },
  { status: "En curso", value: 7, color: "#f59e0b" },
  { status: "Cerrado", value: 9, color: "#22c55e" },
];

const INITIAL_MAINTENANCE: MaintenanceRow[] = [
  {
    id: "M-01",
    system: "Combustión GT-02",
    type: "Preventivo",
    proposal: "Reducir intervalo de borescope de 8 a 6 semanas",
    basis: "Recurrencia de falla y tendencia de temperatura de escape",
    manufacturerRecommendation: "Inspección visual cada 1.500 h",
  },
  {
    id: "M-02",
    system: "Excitación ST-01",
    type: "Predictivo",
    proposal: "Incorporar análisis de armónicos online",
    basis: "Alarmas repetitivas de inestabilidad de tensión",
    manufacturerRecommendation: "Monitoreo continuo de THD",
  },
  {
    id: "M-03",
    system: "Bombas Lubricación",
    type: "Correctivo",
    proposal: "Overhaul de bomba B y cambio de sello",
    basis: "Historial de 4 fallas en 3 meses",
    manufacturerRecommendation: "Reemplazo preventivo cada 8.000 h",
  },
];

const INITIAL_ACTIONS: ActionRow[] = [
  {
    id: "A-01",
    action: "Reconfigurar lazo de control de combustión GT-02",
    owner: "Ing. Control",
    dueDate: "2026-08-05",
    status: "En curso",
    evidence: "OT-22941",
    expectedResult: "Reducir 25% indisponibilidad forzada de GT-02",
  },
  {
    id: "A-02",
    action: "Instalar sensores redundantes en red DCS norte",
    owner: "Automatización",
    dueDate: "2026-08-20",
    status: "Pendiente",
    evidence: "PRJ-118",
    expectedResult: "Eliminar microcortes de comunicación",
  },
  {
    id: "A-03",
    action: "Ajustar ruta termográfica de equipos críticos",
    owner: "Confiabilidad",
    dueDate: "2026-07-30",
    status: "Completada",
    evidence: "Reporte TG-77",
    expectedResult: "Detección temprana de degradación térmica",
  },
];

const NAV_ITEMS: NavItem[] = [
  { key: "resumen", label: "Resumen", icon: <LayoutDashboard size={16} />, description: "Vista ejecutiva" },
  { key: "indicadores", label: "Indicadores", icon: <BarChart3 size={16} />, description: "KPIs del periodo" },
  { key: "desviaciones", label: "Desviaciones", icon: <TrendingUp size={16} />, description: "Brechas vs meta" },
  { key: "malos_actores", label: "Malos Actores", icon: <Bug size={16} />, description: "Fallas de impacto" },
  { key: "causas_raiz", label: "Causas Raiz", icon: <Search size={16} />, description: "Estado RCA" },
  { key: "mantenimiento", label: "Mantenimiento", icon: <Wrench size={16} />, description: "Plan tecnico" },
  { key: "riesgos", label: "Riesgos", icon: <ShieldAlert size={16} />, description: "Tendencias y alertas" },
  { key: "acciones", label: "Plan de Accion", icon: <ClipboardList size={16} />, description: "Seguimiento" },
];

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
const mwh = (value: number) => `${Math.round(value).toLocaleString("es-CO")} MWh`;

function App() {
  const [maintenancePlan, setMaintenancePlan] = useState(INITIAL_MAINTENANCE);
  const [actionPlan, setActionPlan] = useState(INITIAL_ACTIONS);
  const [selectedMonth, setSelectedMonth] = useState(KPI_DATA[KPI_DATA.length - 1].month);
  const [activePage, setActivePage] = useState<PageKey>("resumen");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.body.classList.toggle("theme-light", theme === "light");
  }, [theme]);

  const monthIndex = KPI_DATA.findIndex((k) => k.month === selectedMonth);
  const current = KPI_DATA[monthIndex];
  const previous = KPI_DATA[Math.max(0, monthIndex - 1)];

  const deviations: Deviation[] = useMemo(
    () => [
      {
        indicator: "Disponibilidad",
        value: current.availability,
        target: KPI_TARGETS.availability,
        technicalExplanation:
          current.availability >= KPI_TARGETS.availability
            ? "Control de indisponibilidad forzada dentro del plan."
            : "Afectada por salidas forzadas de GT-02 y eventos de control.",
      },
      {
        indicator: "Confiabilidad",
        value: current.reliability,
        target: KPI_TARGETS.reliability,
        technicalExplanation:
          current.reliability >= KPI_TARGETS.reliability
            ? "Mejor comportamiento de fallas repetitivas en subsistemas críticos."
            : "Frecuencia de fallas superior al patrón esperado.",
      },
      {
        indicator: "Mantenibilidad",
        value: current.maintainability,
        target: KPI_TARGETS.maintainability,
        technicalExplanation:
          current.maintainability >= KPI_TARGETS.maintainability
            ? "Tiempos de reparación en rango objetivo."
            : "Se observan tiempos de reparación por encima del estándar.",
      },
      {
        indicator: "Cumplimiento contractual",
        value: current.contractualCompliance,
        target: KPI_TARGETS.contractualCompliance,
        technicalExplanation:
          current.contractualCompliance >= KPI_TARGETS.contractualCompliance
            ? "Entrega energética alineada a la obligación contractual."
            : "La menor generación neta reduce el cumplimiento.",
      },
    ],
    [current],
  );

  const criticalRiskMessages = useMemo(() => {
    const risks: string[] = [];
    if (current.reliability < KPI_TARGETS.reliability) {
      risks.push("Riesgo de continuidad por degradación de confiabilidad en equipos de control.");
    }
    if (current.operationalLossesMwh > KPI_TARGETS.operationalLossesMwh) {
      risks.push("Tendencia al alza de pérdidas operacionales sobre la meta del periodo.");
    }
    if (current.contractualCompliance < KPI_TARGETS.contractualCompliance) {
      risks.push("Posible incumplimiento contractual si no se recupera la generación en el próximo ciclo.");
    }
    return risks;
  }, [current]);

  const complianceChartData = deviations.map((d) => ({
    indicador: d.indicator,
    actual: Number((d.value * 100).toFixed(1)),
    meta: Number((d.target * 100).toFixed(1)),
  }));

  const updateMaintenance = <K extends keyof MaintenanceRow>(id: string, field: K, value: MaintenanceRow[K]) => {
    setMaintenancePlan((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const updateAction = <K extends keyof ActionRow>(id: string, field: K, value: ActionRow[K]) => {
    setActionPlan((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const performanceData = KPI_DATA.map((row) => ({
    ...row,
    lossesRatio: row.operationalLossesMwh / row.generationMwh,
  }));

  const topBadActors = [...INITIAL_BAD_ACTORS].sort((a, b) => b.generationImpactMwh - a.generationImpactMwh);

  const rcaSummary = INITIAL_RCA.map((item) => ({
    ...item,
    percentage: ((item.value / INITIAL_RCA.reduce((acc, cur) => acc + cur.value, 0)) * 100).toFixed(1),
  }));

  const riskCards = [
    {
      title: "Confiabilidad en tendencia",
      value: percent(current.reliability),
      status: current.reliability >= KPI_TARGETS.reliability ? "ok" : "warning",
      note: "Promedio movil de confiabilidad en periodo reciente.",
    },
    {
      title: "Perdidas operacionales",
      value: mwh(current.operationalLossesMwh),
      status: current.operationalLossesMwh <= KPI_TARGETS.operationalLossesMwh ? "ok" : "warning",
      note: "Comparado con meta operacional mensual.",
    },
    {
      title: "Cumplimiento contractual",
      value: percent(current.contractualCompliance),
      status: current.contractualCompliance >= KPI_TARGETS.contractualCompliance ? "ok" : "warning",
      note: "Entrega energetica contractual del periodo.",
    },
  ] as const;

  const pageTitle = NAV_ITEMS.find((item) => item.key === activePage)?.label ?? "Resumen";
  const pageDescription = NAV_ITEMS.find((item) => item.key === activePage)?.description ?? "";

  return (
    <div className={`app-shell ${theme}`}>
      <aside className="sidebar">
        <div className="brand">
          <p className="eyebrow">Confiabilidad Operacional</p>
          <h1>Parque de Generacion</h1>
        </div>
        <nav className="menu">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={activePage === item.key ? "menu-item active" : "menu-item"}
              onClick={() => setActivePage(item.key)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="theme-switch">
          <button className={theme === "dark" ? "toggle active" : "toggle"} onClick={() => setTheme("dark")}>
            <Moon size={15} /> Oscuro
          </button>
          <button className={theme === "light" ? "toggle active" : "toggle"} onClick={() => setTheme("light")}>
            <Sun size={15} /> Claro
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar card">
          <div>
            <p className="eyebrow">Pagina</p>
            <h2>{pageTitle}</h2>
            <p className="subtitle">{pageDescription}</p>
          </div>
          <div className="month-picker">
            <label htmlFor="month">Periodo de analisis</label>
            <select id="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {KPI_DATA.map((k) => (
                <option key={k.month} value={k.month}>
                  {k.month}
                </option>
              ))}
            </select>
          </div>
        </header>

        {activePage === "resumen" && (
          <>
            <section className="kpi-grid">
              <KpiCard
                title="Disponibilidad"
                icon={<Gauge size={18} />}
                value={percent(current.availability)}
                delta={(current.availability - previous.availability) * 100}
                target={percent(KPI_TARGETS.availability)}
              />
              <KpiCard
                title="Confiabilidad"
                icon={<ShieldCheck size={18} />}
                value={percent(current.reliability)}
                delta={(current.reliability - previous.reliability) * 100}
                target={percent(KPI_TARGETS.reliability)}
              />
              <KpiCard
                title="Mantenibilidad"
                icon={<Wrench size={18} />}
                value={percent(current.maintainability)}
                delta={(current.maintainability - previous.maintainability) * 100}
                target={percent(KPI_TARGETS.maintainability)}
              />
              <KpiCard
                title="Generacion"
                icon={<Zap size={18} />}
                value={mwh(current.generationMwh)}
                delta={current.generationMwh - previous.generationMwh}
                target={mwh(KPI_TARGETS.generationMwh)}
                isEnergy
              />
            </section>

            <section className="panel two-col">
              <article className="card">
                <h3>Tendencia principal de confiabilidad</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="summary1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="summary2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                      <XAxis dataKey="month" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" tickFormatter={(v) => `${v * 100}%`} />
                      <Tooltip formatter={(value) => percent(Number(value ?? 0))} />
                      <Legend />
                      <Area type="monotone" dataKey="availability" name="Disponibilidad" stroke="#60a5fa" fill="url(#summary1)" />
                      <Area type="monotone" dataKey="reliability" name="Confiabilidad" stroke="#34d399" fill="url(#summary2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="card">
                <h3>Alertas del periodo</h3>
                {criticalRiskMessages.length === 0 ? (
                  <div className="risk-ok">
                    <CheckCircle2 size={18} />
                    <span>Sin riesgos criticos abiertos para este periodo.</span>
                  </div>
                ) : (
                  <div className="risk-list">
                    {criticalRiskMessages.map((risk) => (
                      <div className="risk-item" key={risk}>
                        <AlertTriangle size={16} />
                        <span>{risk}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>
          </>
        )}

        {activePage === "indicadores" && (
          <section className="panel">
            <article className="card">
              <h3>Indicadores del periodo</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" tickFormatter={(v) => `${v * 100}%`} />
                    <Tooltip formatter={(value) => percent(Number(value ?? 0))} />
                    <Legend />
                    <Area type="monotone" dataKey="availability" name="Disponibilidad" stroke="#60a5fa" fill="#60a5fa33" />
                    <Area type="monotone" dataKey="reliability" name="Confiabilidad" stroke="#34d399" fill="#34d39933" />
                    <Area type="monotone" dataKey="maintainability" name="Mantenibilidad" stroke="#a78bfa" fill="#a78bfa33" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip formatter={(value) => `${Math.round(Number(value ?? 0)).toLocaleString("es-CO")} MWh`} />
                    <Legend />
                    <Bar dataKey="generationMwh" name="Generacion (MWh)" fill="#22c55e" />
                    <Bar dataKey="operationalLossesMwh" name="Perdidas operacionales (MWh)" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
                    <th>Indicador</th>
                    <th>Actual</th>
                    <th>Meta</th>
                    <th>Brecha</th>
                    <th>Explicacion tecnica</th>
                  </tr>
                </thead>
                <tbody>
                  {deviations.map((d) => {
                    const diff = (d.value - d.target) * 100;
                    return (
                      <tr key={d.indicator}>
                        <td>{d.indicator}</td>
                        <td>{percent(d.value)}</td>
                        <td>{percent(d.target)}</td>
                        <td>
                          <span className={diff >= 0 ? "badge success" : "badge danger"}>
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
                    <th>Equipo</th>
                    <th>Sistema</th>
                    <th>Criticidad</th>
                    <th>Frecuencia</th>
                    <th>Causa</th>
                    <th>Indisp. (h)</th>
                    <th>Afectacion</th>
                  </tr>
                </thead>
                <tbody>
                  {topBadActors.map((item) => (
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
                  ))}
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
                    <Pie data={INITIAL_RCA} dataKey="value" nameKey="status" innerRadius={50} outerRadius={90}>
                      {INITIAL_RCA.map((entry) => (
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
                    <th>Eventos</th>
                    <th>Participacion</th>
                  </tr>
                </thead>
                <tbody>
                  {rcaSummary.map((row) => (
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
                {maintenancePlan.map((row) => (
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
                ))}
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
                  <div className={risk.status === "ok" ? "risk-ok" : "risk-item"} key={risk.title}>
                    {risk.status === "ok" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
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
                {actionPlan.map((action) => (
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
                ))}
              </div>
            </article>
          </section>
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
