import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Layers,
  PiggyBank,
  Target,
  TrendingDown,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildGteJuneMaintenanceOptimization,
  portfolioKpis,
  strategyMix,
  topOpportunities,
} from "./gteJuneMaintenanceOptimization";
import {
  CRITICALITY_COLOR,
  EVAL_COLOR,
  HEALTH_COLOR,
  type CriticalityLevel,
  type MaintenanceOptimizationPlan,
  type OptimizationStatus,
  type PlanHealthBand,
} from "./maintenanceOptimizationTypes";

type Props = {
  monthLabel: string;
};

const STRATEGY_COLORS = ["#0f766e", "#2563eb", "#d97706", "#7c3aed", "#dc2626", "#64748b"];

const TIMELINE = [
  "Plan actual",
  "Análisis",
  "Recomendación",
  "Aprobación",
  "Implementación",
  "Seguimiento",
  "Validación",
];

function stars(n: number) {
  return "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
}

function CritBadge({ level }: { level: CriticalityLevel }) {
  const color = CRITICALITY_COLOR[level];
  return (
    <span
      className="badge"
      style={{
        background: `color-mix(in oklab, ${color} 22%, var(--panel-soft))`,
        color,
      }}
    >
      {level}
    </span>
  );
}

function HealthBadge({ band }: { band: PlanHealthBand }) {
  const color = HEALTH_COLOR[band];
  return (
    <span
      className="badge"
      style={{
        background: `color-mix(in oklab, ${color} 20%, var(--panel-soft))`,
        color,
      }}
    >
      {band}
    </span>
  );
}

export function MaintenanceOptimizationDashboard({ monthLabel }: Props) {
  const [plans, setPlans] = useState<MaintenanceOptimizationPlan[]>(() =>
    buildGteJuneMaintenanceOptimization(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = plans.find((p) => p.id === selectedId) ?? null;
  const kpis = useMemo(() => portfolioKpis(plans), [plans]);
  const mix = useMemo(() => strategyMix(plans), [plans]);
  const opportunities = useMemo(() => topOpportunities(plans), [plans]);
  const mphiChart = useMemo(
    () =>
      [...plans]
        .sort((a, b) => a.mphi - b.mphi)
        .map((p) => ({
          id: p.assetId,
          mphi: p.mphi,
          band: p.healthBand,
        })),
    [plans],
  );

  function updatePlan(id: string, patch: Partial<MaintenanceOptimizationPlan>) {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : p)));
  }

  return (
    <div className="panel">
      <article className="card">
        <p className="eyebrow">Optimización de Planes de Mantenimiento · MSO</p>
        <div className="screen-shell-head">
          <h3>{monthLabel}</h3>
          <span className="source-badge gte">GTE</span>
        </div>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          Ingeniería de confiabilidad — evalúa efectividad del plan, no programa órdenes de trabajo (no es CMMS).
        </p>

        <div className="exec-kpi-row" style={{ marginTop: "0.6rem" }}>
          <div className="exec-kpi">
            <Layers size={16} />
            <span>Equipos analizados</span>
            <strong>{kpis.assetsAnalyzed}</strong>
          </div>
          <div className="exec-kpi">
            <Gauge size={16} />
            <span>Planes evaluados</span>
            <strong>{kpis.plansEvaluated}</strong>
          </div>
          <div className="exec-kpi">
            <CheckCircle2 size={16} />
            <span>Planes optimizados</span>
            <strong>{kpis.plansOptimized}</strong>
          </div>
          <div className="exec-kpi">
            <PiggyBank size={16} />
            <span>Ahorro estimado</span>
            <strong>−{kpis.estimatedSavingsPct}%</strong>
          </div>
          <div className="exec-kpi">
            <Target size={16} />
            <span>Disponibilidad esperada</span>
            <strong>+{kpis.expectedAvailabilityGain}%</strong>
          </div>
          <div className="exec-kpi">
            <TrendingDown size={16} />
            <span>Reducción esperada de fallas</span>
            <strong>−{kpis.expectedFailureReduction}%</strong>
          </div>
        </div>

        <div className="dash-chart-grid mso-chart-grid" style={{ marginTop: "0.75rem" }}>
          <article className="dash-chart-panel">
            <h4>Índice de Salud del Plan (MPHI)</h4>
            <p className="muted dash-chart-sub">0–100 · Excelente ≥80 · Aceptable 60–79 · Requiere optimización &lt;60</p>
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={mphiChart} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                  <XAxis dataKey="id" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={28} />
                  <Tooltip />
                  <Bar dataKey="mphi" name="MPHI" radius={[4, 4, 0, 0]}>
                    {mphiChart.map((row) => (
                      <Cell key={row.id} fill={HEALTH_COLOR[row.band]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="dash-chart-panel">
            <h4>Mix de estrategia recomendada</h4>
            <p className="muted dash-chart-sub">Distribución del portafolio tras optimización</p>
            <div className="dash-chart mso-pie-wrap">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={mix} dataKey="count" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2}>
                    {mix.map((row, i) => (
                      <Cell key={row.name} fill={STRATEGY_COLORS[i % STRATEGY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}`, String(name)]} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mso-mix-legend">
                {mix.map((row, i) => (
                  <li key={row.name}>
                    <span style={{ background: STRATEGY_COLORS[i % STRATEGY_COLORS.length] }} />
                    {row.name} · {row.pct}%
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="dash-chart-panel">
            <h4>Top oportunidades</h4>
            <p className="muted dash-chart-sub">Priorizadas por MPHI e índice de impacto</p>
            <ul className="mso-opp-list">
              {opportunities.map((o) => (
                <li key={o.assetId}>
                  <strong>{o.assetId}</strong>
                  <span>{o.action}</span>
                  <em title={`MPHI ${o.mphi}`}>{stars(o.stars)}</em>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="table-wrap" style={{ marginTop: "0.75rem" }}>
          <table>
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Criticidad</th>
                <th>Estrategia actual</th>
                <th>Frecuencia actual</th>
                <th>Estrategia recomendada</th>
                <th>Nueva frecuencia</th>
                <th>MPHI</th>
                <th>Estado</th>
                <th>Beneficio esperado</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td>
                    <button type="button" className="sort-button" onClick={() => setSelectedId(p.id)}>
                      {p.assetName}
                    </button>
                    <div className="muted" style={{ fontSize: "0.72rem" }}>
                      {p.id}
                    </div>
                  </td>
                  <td>
                    <CritBadge level={p.criticality} />
                  </td>
                  <td>{p.currentStrategy}</td>
                  <td>{p.currentFrequency}</td>
                  <td>{p.recommendedStrategy}</td>
                  <td>{p.recommendedFrequency}</td>
                  <td>
                    <HealthBadge band={p.healthBand} />
                    <div className="muted" style={{ fontSize: "0.72rem" }}>
                      {p.mphi}/100
                    </div>
                  </td>
                  <td>{p.optimizationStatus}</td>
                  <td className="detalle-cell">{p.expectedBenefit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected ? (
          <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setSelectedId(null)}>
            <article
              className="modal-card modal-card--xl intervention-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="modal-header">
                <div>
                  <p className="eyebrow" style={{ margin: 0 }}>
                    {selected.id} · {selected.equipmentType}
                  </p>
                  <h3 style={{ margin: "0.15rem 0 0" }}>
                    {selected.assetName} · Optimización de plan
                  </h3>
                </div>
                <button type="button" className="open-popup-btn" onClick={() => setSelectedId(null)}>
                  Cerrar
                </button>
              </header>

              <div className="exec-kpi-row" style={{ marginTop: "0.55rem" }}>
                <div className="exec-kpi">
                  <span>MPHI</span>
                  <strong style={{ color: HEALTH_COLOR[selected.healthBand] }}>{selected.mphi}</strong>
                  <small>{selected.healthBand}</small>
                </div>
                <div className="exec-kpi">
                  <span>Evaluación</span>
                  <strong style={{ color: EVAL_COLOR[selected.evaluation] }}>
                    {selected.evaluation}
                  </strong>
                </div>
                <div className="exec-kpi">
                  <span>Criticidad</span>
                  <strong>
                    <CritBadge level={selected.criticality} />
                  </strong>
                </div>
                <div className="exec-kpi">
                  <span>Impacto</span>
                  <strong>{selected.impactIndex.toFixed(1)}</strong>
                </div>
              </div>

              <h4 style={{ margin: "0.85rem 0 0.35rem" }}>Información actual</h4>
              <div className="exec-kpi-row">
                <div className="exec-kpi">
                  <Activity size={14} />
                  <span>Horas operación</span>
                  <strong>{selected.operatingHours}</strong>
                </div>
                <div className="exec-kpi">
                  <span>Disponibilidad</span>
                  <strong style={{ color: selected.availabilityPct < 98 ? "#dc2626" : undefined }}>
                    {selected.availabilityPct}%
                  </strong>
                  {selected.availabilityPct < 98 ? (
                    <small>
                      <AlertTriangle size={12} /> Alerta &lt;98%
                    </small>
                  ) : null}
                </div>
                <div className="exec-kpi">
                  <span>MTBF</span>
                  <strong>{selected.mtbfHours == null ? "Sin fallas" : `${selected.mtbfHours} h`}</strong>
                </div>
                <div className="exec-kpi">
                  <span>MTTR</span>
                  <strong>{selected.mttrHours ?? 0} h</strong>
                </div>
                <div className="exec-kpi">
                  <span>Fallas</span>
                  <strong>{selected.failures}</strong>
                </div>
                <div className="exec-kpi">
                  <span>Costo MTO</span>
                  <strong>USD {selected.maintenanceCostUsd.toLocaleString()}</strong>
                </div>
                <div className="exec-kpi">
                  <span>Horas FS</span>
                  <strong>{selected.outageHours}</strong>
                </div>
              </div>

              <div className="intervention-grid-2" style={{ marginTop: "0.65rem" }}>
                <div>
                  <label>Plan actual</label>
                  <p className="mso-plan-box">
                    <strong>{selected.currentStrategy}</strong>
                    <span>{selected.currentFrequency}</span>
                  </p>
                </div>
                <div>
                  <label>Plan recomendado</label>
                  <p className="mso-plan-box mso-plan-box--rec">
                    <strong>{selected.recommendedStrategy}</strong>
                    <span>{selected.recommendedFrequency}</span>
                  </p>
                </div>
              </div>

              <div className="intervention-grid-2" style={{ marginTop: "0.55rem" }}>
                <div>
                  <label>Estado de optimización</label>
                  <select
                    value={selected.optimizationStatus}
                    onChange={(e) =>
                      updatePlan(selected.id, {
                        optimizationStatus: e.target.value as OptimizationStatus,
                      })
                    }
                  >
                    {(
                      [
                        "Pendiente análisis",
                        "Requiere optimización",
                        "En aprobación",
                        "Implementado",
                        "Validado",
                      ] as OptimizationStatus[]
                    ).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Fabricante / tipo</label>
                  <input
                    value={`${selected.manufacturer} · ${selected.equipmentType}`}
                    readOnly
                  />
                </div>
              </div>

              <h4 style={{ margin: "0.85rem 0 0.35rem" }}>Recomendaciones</h4>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Recomendación</th>
                      <th>Prioridad</th>
                      <th>Beneficio</th>
                      <th>Ahorro</th>
                      <th>Costo</th>
                      <th>Origen</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.recommendations.map((r, i) => (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td className="detalle-cell">{r.recommendation}</td>
                        <td>{r.priority}</td>
                        <td>{r.expectedBenefit}</td>
                        <td>−{r.estimatedSavingsPct}%</td>
                        <td>{r.implementationCost > 0 ? `USD ${r.implementationCost.toLocaleString()}` : "—"}</td>
                        <td>
                          {r.autoGenerated ? (
                            <span className="badge warning" title={r.trigger}>
                              Auto
                            </span>
                          ) : (
                            <span className="badge info">Ingeniería</span>
                          )}
                        </td>
                        <td>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h4 style={{ margin: "0.85rem 0 0.35rem" }}>Beneficios esperados</h4>
              <div className="exec-kpi-row">
                <div className="exec-kpi">
                  <span>MTBF</span>
                  <strong className="positive-text">+{selected.benefits.mtbfPct}%</strong>
                </div>
                <div className="exec-kpi">
                  <span>Disponibilidad</span>
                  <strong className="positive-text">+{selected.benefits.availabilityPct}%</strong>
                </div>
                <div className="exec-kpi">
                  <span>MTTR</span>
                  <strong>{selected.benefits.mttrPct}%</strong>
                </div>
                <div className="exec-kpi">
                  <span>Costo</span>
                  <strong>{selected.benefits.costPct}%</strong>
                </div>
                <div className="exec-kpi">
                  <span>Fallas</span>
                  <strong>{selected.benefits.failuresPct}%</strong>
                </div>
              </div>

              <div style={{ marginTop: "0.65rem" }}>
                <label>Justificación técnica</label>
                <textarea
                  value={selected.justification}
                  onChange={(e) => updatePlan(selected.id, { justification: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="mso-links" style={{ marginTop: "0.55rem" }}>
                <span>
                  RCA: {selected.linkedRcaIds.length ? selected.linkedRcaIds.join(", ") : "—"}
                </span>
                <span>
                  Planes: {selected.linkedPlanIds.length ? selected.linkedPlanIds.join(", ") : "—"}
                </span>
                <span>
                  Eventos:{" "}
                  {selected.linkedEventHints.length ? selected.linkedEventHints.join(" · ") : "—"}
                </span>
              </div>

              <div className="intervention-timeline" style={{ marginTop: "0.75rem" }}>
                {TIMELINE.map((step) => (
                  <span key={step}>{step}</span>
                ))}
              </div>

              <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
                <button type="button" className="open-popup-btn" onClick={() => setSelectedId(null)}>
                  Guardar y cerrar
                </button>
              </div>
            </article>
          </div>
        ) : null}
      </article>
    </div>
  );
}
