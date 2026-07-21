import {
  Activity,
  AlertTriangle,
  Gauge,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  allRiskRows,
  buildGteDegradationRiskPortfolio,
  riskDistribution,
  topDegrading,
} from "./buildDegradationRiskPortfolio";
import { portfolioSummary } from "./degradationRiskEngine";
import {
  CRITICALITY_COLOR,
  DEGRADATION_COLOR,
  HEALTH_BAND_COLOR,
  RISK_LEVEL_COLOR,
  TREND_LABEL,
  type AssetHealth,
  type CriticalityLevel,
  type DegradationLevel,
  type HealthBand,
  type RiskLevel,
  type TrendDirection,
} from "./degradationRiskTypes";

type Props = {
  monthLabel: string;
};

const TIMELINE = [
  "Estado saludable",
  "Primeras desviaciones",
  "Degradación detectada",
  "Riesgo alto",
  "Intervención",
  "Recuperación",
  "Monitoreo",
];

const RISK_MATRIX_COLORS = [
  ["#bbf7d0", "#bbf7d0", "#fde68a", "#fdba74", "#fca5a5"],
  ["#bbf7d0", "#fde68a", "#fde68a", "#fdba74", "#fca5a5"],
  ["#fde68a", "#fde68a", "#fdba74", "#fca5a5", "#f87171"],
  ["#fdba74", "#fdba74", "#fca5a5", "#f87171", "#ef4444"],
  ["#fca5a5", "#fca5a5", "#f87171", "#ef4444", "#b91c1c"],
];

function Badge({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span
      className="badge"
      style={{
        background: `color-mix(in oklab, ${color} 18%, var(--panel-soft))`,
        color,
      }}
    >
      {label}
    </span>
  );
}

function HealthRing({ value, band }: { value: number; band: HealthBand }) {
  const color = HEALTH_BAND_COLOR[band];
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div className="dr-health-ring" title={`${band}`}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
        />
      </svg>
      <div className="dr-health-ring-label">
        <strong>{value}</strong>
        <span>{band}</span>
      </div>
    </div>
  );
}

function TrendText({
  direction,
  invertGood,
}: {
  direction: TrendDirection;
  invertGood?: boolean;
}) {
  const good = invertGood ? direction === "decreciente" : direction === "creciente";
  const bad = invertGood ? direction === "creciente" : direction === "decreciente";
  const arrow =
    direction === "creciente" ? "↗" : direction === "decreciente" ? "↘" : "→";
  return (
    <span
      className="dr-trend"
      style={{ color: bad ? "#dc2626" : good ? "#15803d" : "var(--text-muted)" }}
    >
      {arrow} {TREND_LABEL[direction]}
    </span>
  );
}

export function DegradationRiskDashboard({ monthLabel }: Props) {
  const [assets] = useState<AssetHealth[]>(() => buildGteDegradationRiskPortfolio());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = assets.find((a) => a.id === selectedId) ?? null;
  const summary = useMemo(() => portfolioSummary(assets), [assets]);
  const dist = useMemo(() => riskDistribution(assets), [assets]);
  const topDeg = useMemo(() => topDegrading(assets, 5), [assets]);
  const riskRows = useMemo(() => allRiskRows(assets).slice(0, 12), [assets]);
  const matrixCells = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const a of assets) {
      const key = `${a.probability}-${a.impact}`;
      const list = map.get(key) ?? [];
      list.push(a.assetId);
      map.set(key, list);
    }
    return map;
  }, [assets]);

  return (
    <div className="panel">
      <article className="card">
        <p className="eyebrow">Tendencias de Degradación y Riesgos · APM</p>
        <div className="screen-shell-head">
          <h3>{monthLabel}</h3>
          <span className="source-badge gte">GTE</span>
        </div>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          Análisis predictivo rule-based — anticipa deterioro antes de la falla crítica (no es CMMS ni RCA).
        </p>

        <div className="exec-kpi-row" style={{ marginTop: "0.6rem" }}>
          <div className="exec-kpi">
            <Activity size={16} />
            <span>Activos monitoreados</span>
            <strong>{summary.monitored}</strong>
          </div>
          <div className="exec-kpi">
            <TrendingDown size={16} />
            <span>Activos en degradación</span>
            <strong>{summary.degrading}</strong>
          </div>
          <div className="exec-kpi">
            <ShieldAlert size={16} />
            <span>Riesgo crítico</span>
            <strong>{summary.criticalRisk}</strong>
          </div>
          <div className="exec-kpi">
            <AlertTriangle size={16} />
            <span>Riesgo alto</span>
            <strong>{summary.highRisk}</strong>
          </div>
          <div className="exec-kpi">
            <HeartPulse size={16} />
            <span>Salud promedio del parque</span>
            <strong>{summary.avgHealth}</strong>
          </div>
          <div className="exec-kpi">
            <Gauge size={16} />
            <span>Alertas activas</span>
            <strong>{summary.activeAlerts}</strong>
          </div>
        </div>

        <div className="dash-chart-grid mso-chart-grid" style={{ marginTop: "0.75rem" }}>
          <article className="dash-chart-panel">
            <h4>Top degradación</h4>
            <p className="muted dash-chart-sub">Menor salud / mayor deterioro</p>
            <ul className="mso-opp-list">
              {topDeg.map((a) => (
                <li key={a.id}>
                  <strong>{a.assetId}</strong>
                  <span>
                    {a.degradationLevel} · HI {a.healthIndex}
                  </span>
                  <em style={{ color: RISK_LEVEL_COLOR[a.riskLevel], fontStyle: "normal" }}>
                    {a.riskLevel}
                  </em>
                </li>
              ))}
            </ul>
          </article>

          <article className="dash-chart-panel">
            <h4>Distribución de riesgos</h4>
            <p className="muted dash-chart-sub">Clasificación Probabilidad × Impacto</p>
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={dist} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={24} />
                  <Tooltip />
                  <Bar dataKey="count" name="Activos" radius={[4, 4, 0, 0]}>
                    {dist.map((row) => (
                      <Cell key={row.name} fill={RISK_LEVEL_COLOR[row.name as RiskLevel]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="dash-chart-panel">
            <h4>Matriz de riesgo 5×5</h4>
            <p className="muted dash-chart-sub">Impacto → · Probabilidad ↑</p>
            <div className="dr-matrix">
              {[5, 4, 3, 2, 1].map((p) => (
                <div key={p} className="dr-matrix-row">
                  <span className="dr-matrix-axis">{p}</span>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const key = `${p}-${i}`;
                    const labels = matrixCells.get(key) ?? [];
                    return (
                      <div
                        key={key}
                        className="dr-matrix-cell"
                        style={{ background: RISK_MATRIX_COLORS[p - 1][i - 1] }}
                        title={`P${p}×I${i}=${p * i}`}
                      >
                        {labels.slice(0, 2).join(" ")}
                        {labels.length > 2 ? ` +${labels.length - 2}` : ""}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="dr-matrix-row dr-matrix-footer">
                <span className="dr-matrix-axis" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="dr-matrix-axis">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>

        <div className="table-wrap" style={{ marginTop: "0.75rem" }}>
          <table>
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Campo</th>
                <th>Salud</th>
                <th>Tendencia</th>
                <th>Riesgo</th>
                <th>Degradación</th>
                <th>Criticidad</th>
                <th>Última evaluación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id}>
                  <td>
                    <button type="button" className="sort-button" onClick={() => setSelectedId(a.id)}>
                      {a.assetName}
                    </button>
                  </td>
                  <td>{a.field}</td>
                  <td>
                    <Badge label={`${a.healthIndex} · ${a.healthBand}`} color={HEALTH_BAND_COLOR[a.healthBand]} />
                  </td>
                  <td>
                    <TrendText direction={a.trend} invertGood />
                  </td>
                  <td>
                    <Badge
                      label={`${a.riskLevel} (${a.riskScore})`}
                      color={RISK_LEVEL_COLOR[a.riskLevel]}
                    />
                  </td>
                  <td>
                    <Badge
                      label={a.degradationLevel}
                      color={DEGRADATION_COLOR[a.degradationLevel as DegradationLevel]}
                    />
                  </td>
                  <td>
                    <Badge
                      label={a.criticality}
                      color={CRITICALITY_COLOR[a.criticality as CriticalityLevel]}
                    />
                  </td>
                  <td>{a.lastEvaluation}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 style={{ margin: "1rem 0 0.4rem" }}>Riesgos identificados</h4>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Riesgo</th>
                <th>Equipo</th>
                <th>Probabilidad</th>
                <th>Impacto</th>
                <th>Nivel</th>
                <th>Acción recomendada</th>
              </tr>
            </thead>
            <tbody>
              {riskRows.map((r) => (
                <tr key={r.id}>
                  <td className="detalle-cell">{r.hazard}</td>
                  <td>{r.equipment}</td>
                  <td>{r.probability}</td>
                  <td>{r.impact}</td>
                  <td>
                    <Badge label={r.riskLevel} color={RISK_LEVEL_COLOR[r.riskLevel]} />
                  </td>
                  <td className="detalle-cell">{r.recommendation}</td>
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
                    {selected.id}
                  </p>
                  <h3 style={{ margin: "0.15rem 0 0" }}>
                    {selected.assetName} · Salud y riesgo
                  </h3>
                </div>
                <button type="button" className="open-popup-btn" onClick={() => setSelectedId(null)}>
                  Cerrar
                </button>
              </header>

              <div className="dr-detail-head">
                <HealthRing value={selected.healthIndex} band={selected.healthBand} />
                <div className="exec-kpi-row" style={{ flex: 1 }}>
                  <div className="exec-kpi">
                    <span>Degradación</span>
                    <strong style={{ color: DEGRADATION_COLOR[selected.degradationLevel] }}>
                      {selected.degradationLevel}
                    </strong>
                  </div>
                  <div className="exec-kpi">
                    <span>Riesgo</span>
                    <strong style={{ color: RISK_LEVEL_COLOR[selected.riskLevel] }}>
                      {selected.riskLevel} ({selected.riskScore})
                    </strong>
                    <small>
                      P{selected.probability} × I{selected.impact}
                    </small>
                  </div>
                  <div className="exec-kpi">
                    <span>Tendencia</span>
                    <strong>
                      <TrendText direction={selected.trend} invertGood />
                    </strong>
                  </div>
                  <div className="exec-kpi">
                    <span>Estado</span>
                    <strong>{selected.status}</strong>
                  </div>
                </div>
              </div>

              {selected.alerts.length > 0 ? (
                <p className="alert-inline" style={{ marginTop: "0.65rem" }}>
                  {selected.alerts.join(" · ")}
                </p>
              ) : null}

              <h4 style={{ margin: "0.85rem 0 0.35rem" }}>Indicadores actuales</h4>
              <div className="exec-kpi-row">
                {(() => {
                  const last = selected.series[selected.series.length - 1];
                  return (
                    <>
                      <div className="exec-kpi">
                        <span>Disponibilidad</span>
                        <strong>{last?.availabilityPct ?? "—"}%</strong>
                        <small>
                          <TrendText direction={selected.availabilityTrend} />
                        </small>
                      </div>
                      <div className="exec-kpi">
                        <span>MTBF</span>
                        <strong>
                          {last?.mtbfHours == null ? "Sin fallas" : `${last.mtbfHours} h`}
                        </strong>
                        <small>
                          <TrendText direction={selected.mtbfTrend} />
                        </small>
                      </div>
                      <div className="exec-kpi">
                        <span>MTTR</span>
                        <strong>{last?.mttrHours ?? 0} h</strong>
                        <small>
                          <TrendText direction={selected.mttrTrend} invertGood />
                        </small>
                      </div>
                      <div className="exec-kpi">
                        <span>Fallas</span>
                        <strong>{last?.failures ?? 0}</strong>
                        <small>
                          <TrendText direction={selected.failuresTrend} invertGood />
                        </small>
                      </div>
                      <div className="exec-kpi">
                        <span>Horas operación</span>
                        <strong>{last?.operatingHours ?? 0}</strong>
                      </div>
                      <div className="exec-kpi">
                        <span>Índice de impacto</span>
                        <strong>{last?.impactIndex ?? "—"}</strong>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="dash-chart-grid mso-chart-grid" style={{ marginTop: "0.7rem" }}>
                <article className="dash-chart-panel">
                  <h4>Disponibilidad histórica</h4>
                  <div className="dash-chart">
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={selected.series}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis domain={[90, 100]} tick={{ fontSize: 10 }} width={28} />
                        <Tooltip />
                        <Line type="monotone" dataKey="availabilityPct" name="Disp. %" stroke="#0f766e" strokeWidth={2} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </article>
                <article className="dash-chart-panel">
                  <h4>Fallas mensuales</h4>
                  <div className="dash-chart">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={selected.series}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={24} />
                        <Tooltip />
                        <Bar dataKey="failures" name="Fallas" fill="#ea580c" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </article>
                <article className="dash-chart-panel">
                  <h4>Índice de impacto</h4>
                  <div className="dash-chart">
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={selected.series}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} width={24} />
                        <Tooltip />
                        <Line type="monotone" dataKey="impactIndex" name="Impacto" stroke="#7c3aed" strokeWidth={2} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </article>
              </div>

              <h4 style={{ margin: "0.85rem 0 0.35rem" }}>Recomendaciones automáticas</h4>
              {selected.recommendations.length === 0 ? (
                <p className="muted">Sin recomendaciones automáticas en este periodo.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Disparador</th>
                        <th>Recomendación</th>
                        <th>Prioridad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.recommendations.map((r) => (
                        <tr key={r.id}>
                          <td>{r.trigger}</td>
                          <td className="detalle-cell">{r.recommendation}</td>
                          <td>{r.priority}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mso-links" style={{ marginTop: "0.65rem" }}>
                <span>RCA: {selected.linkedRcaIds.length ? selected.linkedRcaIds.join(", ") : "—"}</span>
                <span>
                  Intervención:{" "}
                  {selected.linkedPlanIds.length ? selected.linkedPlanIds.join(", ") : "—"}
                </span>
                <span>MSO: {selected.linkedMsoIds.length ? selected.linkedMsoIds.join(", ") : "—"}</span>
              </div>

              <div className="intervention-timeline">
                {TIMELINE.map((step) => (
                  <span key={step}>{step}</span>
                ))}
              </div>

              <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
                <button type="button" className="open-popup-btn" onClick={() => setSelectedId(null)}>
                  Cerrar
                </button>
              </div>
            </article>
          </div>
        ) : null}
      </article>
    </div>
  );
}
