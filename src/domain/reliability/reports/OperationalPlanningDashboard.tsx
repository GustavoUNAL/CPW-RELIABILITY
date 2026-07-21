import {
  Activity,
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Factory,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildOperationalPlanForPeriod, planKpis } from "./buildOperationalPlan";
import {
  PLANNING_PERIODS,
  PRIORITY_COLOR,
  RISK_LEVEL_COLOR,
  STATUS_COLOR,
} from "./operationalAlertsTypes";
import type { AlertPriority, RiskLevel } from "./operationalAlertsTypes";

type Props = {
  monthLabel: string;
};

const MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, "0")} ${MONTHS_ES[m - 1]}`;
}

function scaleLabel(n: number) {
  if (n >= 5) return "Muy alta";
  if (n === 4) return "Alta";
  if (n === 3) return "Media";
  if (n === 2) return "Baja";
  return "Muy baja";
}

function Badge({ label, color }: { label: string; color: string }) {
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

function RiskMeter({ level }: { level: RiskLevel }) {
  const fill = level === "Crítico" ? 92 : level === "Alto" ? 74 : level === "Medio" ? 48 : 26;
  return (
    <div className="op-risk-meter">
      <strong style={{ color: RISK_LEVEL_COLOR[level] }}>{level}</strong>
      <div className="op-risk-meter-track">
        <div
          className="op-risk-meter-fill"
          style={{ width: `${fill}%`, background: RISK_LEVEL_COLOR[level] }}
        />
      </div>
    </div>
  );
}

function AssetBar({ score }: { score: number }) {
  const pct = Math.min(100, score);
  return (
    <div className="op-asset-bar">
      <div className="op-asset-bar-track">
        <div className="op-asset-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span>{pct}</span>
    </div>
  );
}

const COMMITMENT_COLOR: Record<string, string> = {
  Pendiente: "#ca8a04",
  "En ejecución": "#2563eb",
  Cumplido: "#15803d",
};

const ACTION_STATUS_COLOR: Record<string, string> = {
  Pendiente: "#64748b",
  "En ejecución": "#0f766e",
  "En seguimiento": "#2563eb",
};

export function OperationalPlanningDashboard({ monthLabel }: Props) {
  const [periodKey, setPeriodKey] = useState(PLANNING_PERIODS[0].key);
  const pack = useMemo(() => buildOperationalPlanForPeriod(periodKey), [periodKey]);
  const kpis = useMemo(() => planKpis(pack), [pack]);

  const riskDist = useMemo(() => {
    const levels: RiskLevel[] = ["Bajo", "Medio", "Alto", "Crítico"];
    return levels.map((name) => ({
      name,
      count: pack.alerts.filter((a) => a.riskLevel === name).length,
    }));
  }, [pack.alerts]);

  const topPriorities = pack.priorities.slice(0, 6);
  const topRisks = pack.risks.slice(0, 6);
  const openRisks = pack.openRisks.slice(0, 6);
  const actionPlan = pack.actionPlan.slice(0, 10);

  return (
    <div className="panel op-page">
      <article className="card op-card">
        <header className="op-page-header">
          <div>
            <p className="eyebrow">Outlook ejecutivo · próximo período</p>
            <div className="screen-shell-head">
              <h3>Planeación operacional</h3>
              <span className="source-badge dual">Integrado</span>
            </div>
            <p className="muted op-page-lead">
              Qué hacer el próximo mes para proteger la disponibilidad del parque · Base {monthLabel}
            </p>
          </div>
          <div className="op-period-select">
            <label>
              <CalendarRange size={15} />
              Período
            </label>
            <select value={periodKey} onChange={(e) => setPeriodKey(e.target.value)}>
              {PLANNING_PERIODS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
            <span className="op-plan-status">Plan {pack.plan.status}</span>
          </div>
        </header>

        <section className="op-kpi-strip">
          <article className="op-kpi op-kpi--risk">
            <span className="op-kpi-label">
              <ShieldAlert size={14} /> Nivel de riesgo
            </span>
            <RiskMeter level={kpis.overallRisk} />
          </article>
          <article className="op-kpi">
            <span className="op-kpi-label">
              <Factory size={14} /> Activos críticos
            </span>
            <strong>{kpis.criticalAssets}</strong>
            <small>Ranking priorizado</small>
          </article>
          <article className="op-kpi">
            <span className="op-kpi-label">
              <AlertTriangle size={14} /> Alertas activas
            </span>
            <strong>{kpis.alertsActive}</strong>
            <small>Abiertas del período</small>
          </article>
          <article className="op-kpi">
            <span className="op-kpi-label">
              <Target size={14} /> Prioridades
            </span>
            <strong>{kpis.priorities}</strong>
            <small>Top del plan</small>
          </article>
          <article className="op-kpi">
            <span className="op-kpi-label">
              <ClipboardList size={14} /> Acciones pendientes
            </span>
            <strong>{kpis.pendingActions}</strong>
            <small>Sin iniciar</small>
          </article>
          <article className="op-kpi">
            <span className="op-kpi-label">
              <Wrench size={14} /> MTO / RCA
            </span>
            <strong>
              {kpis.criticalMto}
              <span className="op-kpi-split">/</span>
              {kpis.rcaPending}
            </strong>
            <small>Mantenimientos · señales RCA</small>
          </article>
        </section>

        <section className="op-panel op-panel--summary">
          <div className="op-panel-head">
            <h4>Resumen ejecutivo</h4>
            <span className="muted">{pack.reportTitle}</span>
          </div>
          <p className="op-summary">{pack.plan.summary}</p>
          <div className="op-summary-metrics">
            <div>
              <span>Meta disponibilidad</span>
              <strong>≥{pack.plan.availabilityTarget}%</strong>
            </div>
            <div>
              <span>Cumplimiento esperado</span>
              <strong>{kpis.expectedCompliance}%</strong>
            </div>
            <div>
              <span>Riesgos abiertos</span>
              <strong>{pack.openRisks.length}</strong>
            </div>
            <div>
              <span>Disponibilidad proyectada</span>
              <strong className="positive-text">{pack.plan.projectedAvailability}%</strong>
            </div>
          </div>
        </section>

        <div className="op-grid-2">
          <section className="op-panel">
            <div className="op-panel-head">
              <h4>Prioridades del mes</h4>
              <span className="muted">{topPriorities.length} ítems</span>
            </div>
            <div className="table-wrap op-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "5.5rem" }}>Prioridad</th>
                    <th>Acción</th>
                    <th style={{ width: "6.5rem" }}>Equipo</th>
                    <th style={{ width: "7.5rem" }}>Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {topPriorities.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Badge label={p.priority} color={PRIORITY_COLOR[p.priority]} />
                      </td>
                      <td>
                        <div className="op-cell-title">{p.title}</div>
                      </td>
                      <td>
                        <strong className="op-asset-tag">{p.assetName}</strong>
                      </td>
                      <td className="op-cell-muted">{p.responsible}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="op-panel">
            <div className="op-panel-head">
              <h4>Principales riesgos</h4>
              <span className="muted">Top {topRisks.length}</span>
            </div>
            <div className="table-wrap op-table">
              <table>
                <thead>
                  <tr>
                    <th>Riesgo</th>
                    <th style={{ width: "5.2rem" }}>Prob.</th>
                    <th style={{ width: "5.2rem" }}>Impacto</th>
                    <th style={{ width: "5.5rem" }}>Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  {topRisks.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="op-cell-title">{r.title}</div>
                        <div className="op-cell-sub">{r.assetName}</div>
                      </td>
                      <td>
                        <span className="op-scale">{scaleLabel(r.probability)}</span>
                      </td>
                      <td>
                        <span className="op-scale">{scaleLabel(r.impact)}</span>
                      </td>
                      <td>
                        <Badge label={r.riskLevel} color={RISK_LEVEL_COLOR[r.riskLevel]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="op-grid-2">
          <section className="op-panel">
            <div className="op-panel-head">
              <h4>Activos críticos</h4>
              <span className="muted">Índice de priorización</span>
            </div>
            <ul className="op-asset-rank">
              {pack.criticalAssets.map((a, idx) => (
                <li key={a.assetId}>
                  <span className="op-rank-n">{idx + 1}</span>
                  <div className="op-asset-rank-body">
                    <div className="op-asset-rank-head">
                      <strong>{a.assetId}</strong>
                      <AssetBar score={a.score} />
                    </div>
                    <span className="op-cell-sub">{a.reason}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="op-panel">
            <div className="op-panel-head">
              <h4>Riesgos abiertos</h4>
              <span className="muted">Sin mitigación plena</span>
            </div>
            {openRisks.length === 0 ? (
              <p className="op-empty">
                <CheckCircle2 size={16} /> No hay riesgos altos/críticos abiertos.
              </p>
            ) : (
              <div className="table-wrap op-table">
                <table>
                  <thead>
                    <tr>
                      <th>Riesgo</th>
                      <th style={{ width: "7rem" }}>Estado</th>
                      <th>Mitigación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openRisks.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className="op-cell-title">{r.title}</div>
                          <div className="op-cell-sub">{r.assetName}</div>
                        </td>
                        <td>
                          <Badge label={r.status} color={STATUS_COLOR[r.status]} />
                        </td>
                        <td>
                          <div className="op-cell-muted">{r.recommendedAction}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <section className="op-panel">
          <div className="op-panel-head">
            <h4>Plan de acción</h4>
            <span className="muted">{actionPlan.length} actividades priorizadas</span>
          </div>
          <div className="table-wrap op-table">
            <table>
              <thead>
                <tr>
                  <th>Acción</th>
                  <th style={{ width: "8rem" }}>Responsable</th>
                  <th style={{ width: "5.5rem" }}>Fecha</th>
                  <th style={{ width: "7rem" }}>Estado</th>
                  <th style={{ width: "5.5rem" }}>Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {actionPlan.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="op-cell-title">
                        <span className="op-asset-tag">{a.assetName}</span> {a.title}
                      </div>
                      <div className="op-cell-sub">{a.category}</div>
                    </td>
                    <td className="op-cell-muted">{a.responsible}</td>
                    <td>
                      <strong className="op-date">{formatDate(a.targetDate)}</strong>
                    </td>
                    <td>
                      <Badge
                        label={a.status}
                        color={ACTION_STATUS_COLOR[a.status] ?? "#64748b"}
                      />
                    </td>
                    <td>
                      <Badge label={a.priority} color={PRIORITY_COLOR[a.priority as AlertPriority]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="op-panel">
          <div className="op-panel-head">
            <h4>Cronograma semanal</h4>
            <span className="muted">{pack.plan.month} {pack.plan.year}</span>
          </div>
          <div className="op-timeline">
            {pack.timeline.map((w) => (
              <article key={w.week} className="op-timeline-week">
                <header>
                  <span className="op-week-n">S{w.week}</span>
                  {w.label}
                </header>
                <ul>
                  {w.items.slice(0, 4).map((item) => (
                    <li key={`${w.week}-${item}`}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <div className="op-grid-2">
          <section className="op-panel">
            <div className="op-panel-head">
              <h4>Recursos críticos</h4>
            </div>
            <div className="table-wrap op-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "7rem" }}>Tipo</th>
                    <th>Recurso</th>
                    <th style={{ width: "4.2rem" }}>Crítico</th>
                  </tr>
                </thead>
                <tbody>
                  {pack.resources.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span className="op-kind">{r.kind}</span>
                      </td>
                      <td>
                        <div className="op-cell-title">{r.name}</div>
                        <div className="op-cell-sub">{r.detail}</div>
                      </td>
                      <td>
                        {r.critical ? (
                          <Badge label="Sí" color="#dc2626" />
                        ) : (
                          <span className="op-cell-muted">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="op-panel">
            <div className="op-panel-head">
              <h4>Compromisos con Gran Tierra</h4>
            </div>
            <div className="table-wrap op-table">
              <table>
                <thead>
                  <tr>
                    <th>Compromiso</th>
                    <th style={{ width: "5.5rem" }}>Fecha</th>
                    <th style={{ width: "7rem" }}>Estado</th>
                    <th style={{ width: "7.5rem" }}>Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {pack.commitments.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="op-cell-title">{c.title}</div>
                      </td>
                      <td>
                        <strong className="op-date">{formatDate(c.targetDate)}</strong>
                      </td>
                      <td>
                        <Badge label={c.status} color={COMMITMENT_COLOR[c.status]} />
                      </td>
                      <td>
                        <div className="op-cell-muted">{c.owner}</div>
                        <div className="op-cell-sub">{c.company}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="op-panel">
          <div className="op-panel-head">
            <h4>Indicadores esperados</h4>
            <span className="muted">Tras ejecutar el plan</span>
          </div>
          <div className="op-proj-grid">
            <article className="op-proj-card">
              <span>Disponibilidad</span>
              <strong>
                {pack.plan.projectedAvailability}%
                <TrendingUp size={16} className="op-trend-up" />
              </strong>
              <small>Meta ≥{pack.plan.availabilityTarget}%</small>
            </article>
            <article className="op-proj-card">
              <span>MTBF</span>
              <strong>
                +{pack.plan.projectedMtbfPct}%
                <TrendingUp size={16} className="op-trend-up" />
              </strong>
              <small>Mejora esperada</small>
            </article>
            <article className="op-proj-card">
              <span>MTTR</span>
              <strong>
                {pack.plan.projectedMttrPct}%
                <TrendingDown size={16} className="op-trend-down" />
              </strong>
              <small>Reducción esperada</small>
            </article>
            <article className="op-proj-card">
              <span>Índice de impacto</span>
              <strong>
                {pack.plan.projectedImpactPct}%
                <Activity size={16} className="op-trend-down" />
              </strong>
              <small>Reducción del IIO</small>
            </article>
          </div>
        </section>

        <div className="op-grid-alerts">
          <section className="op-panel">
            <div className="op-panel-head">
              <h4>Distribución de riesgo</h4>
            </div>
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={riskDist} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
                  <Tooltip />
                  <Bar dataKey="count" name="Alertas" radius={[4, 4, 0, 0]}>
                    {riskDist.map((r) => (
                      <Cell key={r.name} fill={RISK_LEVEL_COLOR[r.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="op-panel">
            <div className="op-panel-head">
              <h4>Alertas del período</h4>
              <span className="muted">{pack.alerts.length} totales</span>
            </div>
            <div className="table-wrap op-table">
              <table>
                <thead>
                  <tr>
                    <th>Alerta</th>
                    <th style={{ width: "7.5rem" }}>Categoría</th>
                    <th style={{ width: "5.5rem" }}>Equipo</th>
                    <th style={{ width: "5.5rem" }}>Prioridad</th>
                    <th style={{ width: "7rem" }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pack.alerts.slice(0, 8).map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="op-cell-title">{a.title}</div>
                      </td>
                      <td className="op-cell-muted">{a.category}</td>
                      <td>
                        <strong className="op-asset-tag">{a.assetName}</strong>
                      </td>
                      <td>
                        <Badge label={a.priority} color={PRIORITY_COLOR[a.priority]} />
                      </td>
                      <td>
                        <Badge label={a.status} color={STATUS_COLOR[a.status]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
