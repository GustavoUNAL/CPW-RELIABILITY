import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ListChecks,
  Percent,
  Timer,
  Workflow,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import {
  buildGteCapaActions,
  capaPortfolioKpis,
  complianceBy,
  groupCount,
} from "./buildCapaActions";
import {
  ACTION_ORIGINS,
  ACTION_PRIORITIES,
  ACTION_STATUSES,
  PRIORITY_COLOR,
  STATUS_COLOR,
  applyActionRules,
  computeEffectiveness,
  daysBetween,
  type ActionOrigin,
  type ActionPriority,
  type ActionStatus,
  type CorrectiveAction,
} from "./actionTrackingTypes";

type Props = {
  monthLabel: string;
  focusId?: string;
};

const TIMELINE = ["Creada", "Asignada", "En ejecución", "Pendiente de validación", "Cerrada"];

const TODAY = "2026-07-21";

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

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="capa-progress">
      <div className="capa-progress-track">
        <div className="capa-progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <span>{pct}%</span>
    </div>
  );
}

export function ActionTrackingDashboard({ monthLabel, focusId }: Props) {
  useEffect(() => {
    if (!focusId) return;
    const t = window.setTimeout(() => {
      document.getElementById(focusId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [focusId]);

  const [actions, setActions] = useState<CorrectiveAction[]>(() => buildGteCapaActions());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    q: "",
    equipment: "Todos",
    responsible: "Todos",
    company: "Todos",
    priority: "Todos" as "Todos" | ActionPriority,
    status: "Todos" as "Todos" | ActionStatus,
    origin: "Todos" as "Todos" | ActionOrigin,
    field: "Todos",
  });

  const selected = actions.find((a) => a.id === selectedId) ?? null;

  const options = useMemo(() => {
    const uniq = (xs: string[]) => [...new Set(xs)].sort();
    return {
      equipment: uniq(actions.map((a) => a.assetName)),
      responsible: uniq(actions.map((a) => a.responsible)),
      company: uniq(actions.map((a) => a.company)),
      field: uniq(actions.map((a) => a.field)),
    };
  }, [actions]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return actions.filter((a) => {
      if (filters.equipment !== "Todos" && a.assetName !== filters.equipment) return false;
      if (filters.responsible !== "Todos" && a.responsible !== filters.responsible) return false;
      if (filters.company !== "Todos" && a.company !== filters.company) return false;
      if (filters.priority !== "Todos" && a.priority !== filters.priority) return false;
      if (filters.status !== "Todos" && a.status !== filters.status) return false;
      if (filters.origin !== "Todos" && a.origin !== filters.origin) return false;
      if (filters.field !== "Todos" && a.field !== filters.field) return false;
      if (!q) return true;
      return (
        a.id.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.originId.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    });
  }, [actions, filters]);

  const kpis = useMemo(() => capaPortfolioKpis(filtered, TODAY), [filtered]);
  const byStatus = useMemo(() => groupCount(filtered, (a) => a.status), [filtered]);
  const byPriority = useMemo(() => groupCount(filtered, (a) => a.priority), [filtered]);
  const byOrigin = useMemo(() => groupCount(filtered, (a) => a.origin), [filtered]);
  const byCompany = useMemo(() => complianceBy(filtered, (a) => a.company), [filtered]);
  const byResponsible = useMemo(() => complianceBy(filtered, (a) => a.responsible).slice(0, 6), [filtered]);
  const topAssets = useMemo(() => groupCount(filtered, (a) => a.assetName).slice(0, 6), [filtered]);

  function updateAction(id: string, patch: Partial<CorrectiveAction>) {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const next = applyActionRules(
          {
            ...a,
            ...patch,
            updatedAt: TODAY,
            lastUpdate: TODAY,
          },
          TODAY,
        );
        return next;
      }),
    );
  }

  function addComment(id: string, text: string) {
    if (!text.trim()) return;
    setActions((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const n = a.comments.length + 1;
        return applyActionRules(
          {
            ...a,
            comments: [
              ...a.comments,
              {
                id: `${id}-C${n}`,
                actionId: id,
                comment: text.trim(),
                author: "Usuario",
                createdAt: TODAY,
              },
            ],
            lastUpdate: TODAY,
            updatedAt: TODAY,
          },
          TODAY,
        );
      }),
    );
  }

  function addEvidence(id: string) {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const n = a.evidences.length + 1;
        return applyActionRules(
          {
            ...a,
            evidences: [
              ...a.evidences,
              {
                id: `${id}-E${n}`,
                actionId: id,
                fileName: `evidencia_${n}.pdf`,
                fileUrl: `#evidence/${id}/evidencia_${n}.pdf`,
                description: "Evidencia cargada (simulado)",
                uploadedBy: "Usuario",
                uploadedAt: TODAY,
              },
            ],
            lastUpdate: TODAY,
            updatedAt: TODAY,
          },
          TODAY,
        );
      }),
    );
  }

  const remainingDays = selected
    ? daysBetween(TODAY, selected.dueDate)
    : 0;

  return (
    <div className="panel">
      <article className="card">
        <p className="eyebrow">CAPA · Action Tracking</p>
        <div className="screen-shell-head">
          <h3>Seguimiento de acciones correctivas y preventivas</h3>
          <span className="source-badge dual">Integrado</span>
        </div>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          Gestor central de acciones · {monthLabel} · RCA, intervención, MSO, riesgos, eventos, reuniones y contrato.
        </p>

        {(kpis.overdue > 0 || kpis.dueSoon > 0 || kpis.criticalOpen > 0) && (
          <p className="alert-inline" style={{ marginTop: "0.55rem" }}>
            Alertas: {kpis.overdue} vencida(s) · {kpis.dueSoon} vence(n) en ≤7 días ·{" "}
            {kpis.criticalOpen} crítica(s) abierta(s)
            {kpis.stale > 0 ? ` · ${kpis.stale} sin actualización >30 días` : ""}
          </p>
        )}

        <section id="capa-sec-resumen" className="capa-kpi-block">
          <div className="capa-kpi-group">
            <p className="capa-kpi-group-label">Volumen</p>
            <div className="capa-kpi-grid capa-kpi-grid--5">
              <article className="capa-kpi-card">
                <header>
                  <ListChecks size={15} />
                  <span>Totales</span>
                </header>
                <strong>{kpis.total}</strong>
                <small>Portafolio filtrado</small>
              </article>
              <article className="capa-kpi-card">
                <header>
                  <Clock3 size={15} />
                  <span>Pendientes</span>
                </header>
                <strong>{kpis.pending}</strong>
                <small>Pendiente / asignada</small>
              </article>
              <article className="capa-kpi-card">
                <header>
                  <Workflow size={15} />
                  <span>En ejecución</span>
                </header>
                <strong>{kpis.running}</strong>
                <small>Ejecución / validación</small>
              </article>
              <article className={`capa-kpi-card${kpis.overdue > 0 ? " capa-kpi-card--danger" : ""}`}>
                <header>
                  <AlertTriangle size={15} />
                  <span>Vencidas</span>
                </header>
                <strong>{kpis.overdue}</strong>
                <small>Fuera de fecha</small>
              </article>
              <article className="capa-kpi-card capa-kpi-card--ok">
                <header>
                  <CheckCircle2 size={15} />
                  <span>Cerradas</span>
                </header>
                <strong>{kpis.closed}</strong>
                <small>Ciclo completado</small>
              </article>
            </div>
          </div>

          <div id="capa-sec-efectividad" className="capa-kpi-group">
            <p className="capa-kpi-group-label">Desempeño</p>
            <div className="capa-kpi-grid capa-kpi-grid--3">
              <article className="capa-kpi-card capa-kpi-card--accent">
                <header>
                  <Percent size={15} />
                  <span>Cumplimiento</span>
                </header>
                <strong>{kpis.compliance}%</strong>
                <small>Cerradas / totales</small>
              </article>
              <article className="capa-kpi-card capa-kpi-card--accent">
                <header>
                  <Percent size={15} />
                  <span>Efectividad</span>
                </header>
                <strong>{kpis.effectivenessPct}%</strong>
                <small>Verificadas con efectividad alta</small>
              </article>
              <article className="capa-kpi-card capa-kpi-card--accent">
                <header>
                  <Timer size={15} />
                  <span>Tiempo medio de cierre</span>
                </header>
                <strong>
                  {kpis.avgCloseDays}
                  <span className="capa-kpi-unit"> días</span>
                </strong>
                <small>Promedio de acciones cerradas</small>
              </article>
            </div>
          </div>
        </section>

        <div id="capa-sec-acciones" className="capa-filters">
          <label className="capa-filter-search">
            <span>Buscar</span>
            <input
              placeholder="Acción, ID u origen…"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            />
          </label>
          <label>
            <span>Equipo</span>
            <select
              value={filters.equipment}
              onChange={(e) => setFilters((f) => ({ ...f, equipment: e.target.value }))}
            >
              <option>Todos</option>
              {options.equipment.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Responsable</span>
            <select
              value={filters.responsible}
              onChange={(e) => setFilters((f) => ({ ...f, responsible: e.target.value }))}
            >
              <option>Todos</option>
              {options.responsible.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Empresa</span>
            <select
              value={filters.company}
              onChange={(e) => setFilters((f) => ({ ...f, company: e.target.value }))}
            >
              <option>Todos</option>
              {options.company.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Prioridad</span>
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters((f) => ({ ...f, priority: e.target.value as typeof filters.priority }))
              }
            >
              <option>Todos</option>
              {ACTION_PRIORITIES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Estado</span>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value as typeof filters.status }))
              }
            >
              <option>Todos</option>
              {ACTION_STATUSES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Origen</span>
            <select
              value={filters.origin}
              onChange={(e) =>
                setFilters((f) => ({ ...f, origin: e.target.value as typeof filters.origin }))
              }
            >
              <option>Todos</option>
              {ACTION_ORIGINS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Campo</span>
            <select
              value={filters.field}
              onChange={(e) => setFilters((f) => ({ ...f, field: e.target.value }))}
            >
              <option>Todos</option>
              {options.field.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>

        <div id="capa-sec-indicadores" className="capa-chart-grid" style={{ marginTop: "0.9rem" }}>
          <article className="dash-chart-panel">
            <h4>Acciones por estado</h4>
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={24} />
                  <Tooltip />
                  <Bar dataKey="count" name="Acciones" radius={[3, 3, 0, 0]}>
                    {byStatus.map((r) => (
                      <Cell key={r.name} fill={STATUS_COLOR[r.name as ActionStatus] ?? "#64748b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
          <article className="dash-chart-panel">
            <h4>Acciones por prioridad</h4>
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byPriority}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={24} />
                  <Tooltip />
                  <Bar dataKey="count" name="Acciones" radius={[3, 3, 0, 0]}>
                    {byPriority.map((r) => (
                      <Cell key={r.name} fill={PRIORITY_COLOR[r.name as ActionPriority]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
          <article className="dash-chart-panel">
            <h4>Cumplimiento por empresa</h4>
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byCompany}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={28} />
                  <Tooltip formatter={(v) => [`${v}%`, "Cumplimiento"]} />
                  <Bar dataKey="pct" name="Cumplimiento %" fill="#0f766e" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
          <article className="dash-chart-panel">
            <h4>Acciones por origen</h4>
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byOrigin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={55} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={24} />
                  <Tooltip />
                  <Bar dataKey="count" name="Acciones" fill="#2563eb" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
          <article className="dash-chart-panel">
            <h4>Cumplimiento por responsable</h4>
            <ul className="mso-opp-list">
              {byResponsible.map((r) => (
                <li key={r.name}>
                  <strong>{r.name}</strong>
                  <span>{r.total} acciones</span>
                  <em style={{ color: "#0f766e", fontStyle: "normal" }}>{r.pct}%</em>
                </li>
              ))}
            </ul>
          </article>
          <article className="dash-chart-panel">
            <h4>Top equipos</h4>
            <ul className="mso-opp-list">
              {topAssets.map((r) => (
                <li key={r.name}>
                  <strong>{r.name}</strong>
                  <span>Acciones abiertas/cerradas</span>
                  <em style={{ fontStyle: "normal" }}>{r.count}</em>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div id="capa-sec-seguimiento" className="table-wrap" style={{ marginTop: "0.75rem" }}>
          <div id="capa-sec-evidencias" aria-hidden="true" style={{ height: 0, overflow: "hidden" }} />
          <table>
            <thead>
              <tr>
                <th>Acción</th>
                <th>Equipo</th>
                <th>Origen</th>
                <th>Responsable</th>
                <th>Empresa</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Fecha compromiso</th>
                <th>Avance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <button type="button" className="sort-button" onClick={() => setSelectedId(a.id)}>
                      {a.id}
                    </button>
                    <div className="detalle-cell" style={{ maxWidth: 220 }}>
                      {a.title}
                    </div>
                  </td>
                  <td>{a.assetName}</td>
                  <td>
                    {a.origin}
                    <div className="muted" style={{ fontSize: "0.7rem" }}>
                      {a.originId}
                    </div>
                  </td>
                  <td>{a.responsible}</td>
                  <td>{a.company}</td>
                  <td>
                    <Badge label={a.priority} color={PRIORITY_COLOR[a.priority]} />
                  </td>
                  <td>
                    <Badge label={a.status} color={STATUS_COLOR[a.status]} />
                  </td>
                  <td>{a.dueDate}</td>
                  <td>
                    <ProgressBar value={a.progress} />
                  </td>
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
                    {selected.id} · {selected.actionType}
                  </p>
                  <h3 style={{ margin: "0.15rem 0 0" }}>{selected.title}</h3>
                </div>
                <button type="button" className="open-popup-btn" onClick={() => setSelectedId(null)}>
                  Cerrar
                </button>
              </header>

              {selected.status === "Vencida" || remainingDays < 0 ? (
                <p className="alert-inline" style={{ marginTop: "0.55rem" }}>
                  Acción vencida · compromiso {selected.dueDate}
                </p>
              ) : remainingDays <= 7 && selected.status !== "Cerrada" ? (
                <p className="alert-inline" style={{ marginTop: "0.55rem" }}>
                  Vence en {remainingDays} día(s)
                </p>
              ) : null}

              <div className="exec-kpi-row" style={{ marginTop: "0.55rem" }}>
                <div className="exec-kpi">
                  <span>Origen</span>
                  <strong>
                    {selected.origin} / {selected.originId}
                  </strong>
                </div>
                <div className="exec-kpi">
                  <span>Equipo</span>
                  <strong>{selected.assetName}</strong>
                  <small>{selected.field}</small>
                </div>
                <div className="exec-kpi">
                  <span>Responsable</span>
                  <strong>{selected.responsible}</strong>
                  <small>
                    {selected.department} · {selected.company}
                  </small>
                </div>
                <div className="exec-kpi">
                  <span>Prioridad</span>
                  <strong>
                    <Badge label={selected.priority} color={PRIORITY_COLOR[selected.priority]} />
                  </strong>
                </div>
              </div>

              <div className="intervention-grid-2" style={{ marginTop: "0.55rem" }}>
                <div>
                  <label>Estado</label>
                  <select
                    value={selected.status}
                    onChange={(e) =>
                      updateAction(selected.id, {
                        status: e.target.value as ActionStatus,
                        closeDate:
                          e.target.value === "Cerrada"
                            ? selected.closeDate ?? TODAY
                            : selected.closeDate,
                        progress: e.target.value === "Cerrada" ? 100 : selected.progress,
                      })
                    }
                  >
                    {ACTION_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Avance %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={selected.progress}
                    onChange={(e) =>
                      updateAction(selected.id, {
                        progress: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                      })
                    }
                  />
                </div>
                <div>
                  <label>Fecha compromiso</label>
                  <input
                    type="date"
                    value={selected.dueDate}
                    onChange={(e) => updateAction(selected.id, { dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label>Fecha cierre</label>
                  <input
                    type="date"
                    value={selected.closeDate ?? ""}
                    onChange={(e) => updateAction(selected.id, { closeDate: e.target.value || null })}
                  />
                </div>
              </div>

              <div style={{ marginTop: "0.55rem" }}>
                <label>Descripción</label>
                <textarea
                  value={selected.description}
                  rows={3}
                  onChange={(e) => updateAction(selected.id, { description: e.target.value })}
                />
              </div>

              <h4 style={{ margin: "0.85rem 0 0.35rem" }}>Cronograma</h4>
              <div className="exec-kpi-row">
                <div className="exec-kpi">
                  <span>Creación</span>
                  <strong>{selected.createdAt}</strong>
                </div>
                <div className="exec-kpi">
                  <span>Compromiso</span>
                  <strong>{selected.dueDate}</strong>
                </div>
                <div className="exec-kpi">
                  <span>Cierre</span>
                  <strong>{selected.closeDate ?? "—"}</strong>
                </div>
                <div className="exec-kpi">
                  <span>Días restantes</span>
                  <strong style={{ color: remainingDays < 0 ? "#dc2626" : undefined }}>
                    {selected.status === "Cerrada" ? "—" : remainingDays}
                  </strong>
                </div>
              </div>

              <div className="intervention-timeline">
                {TIMELINE.map((step) => (
                  <span key={step}>{step}</span>
                ))}
              </div>

              <h4 style={{ margin: "0.85rem 0 0.35rem" }}>Verificación de efectividad</h4>
              <div className="intervention-grid-2">
                <div>
                  <label>¿La acción fue implementada?</label>
                  <select
                    value={
                      selected.verification.implemented == null
                        ? ""
                        : selected.verification.implemented
                          ? "Sí"
                          : "No"
                    }
                    onChange={(e) => {
                      const implemented =
                        e.target.value === "" ? null : e.target.value === "Sí";
                      const verification = { ...selected.verification, implemented };
                      updateAction(selected.id, {
                        verification,
                        effectiveness: computeEffectiveness(verification),
                      });
                    }}
                  >
                    <option value="">—</option>
                    <option>Sí</option>
                    <option>No</option>
                  </select>
                </div>
                <div>
                  <label>¿Se verificó en campo?</label>
                  <select
                    value={
                      selected.verification.fieldVerified == null
                        ? ""
                        : selected.verification.fieldVerified
                          ? "Sí"
                          : "No"
                    }
                    onChange={(e) => {
                      const fieldVerified =
                        e.target.value === "" ? null : e.target.value === "Sí";
                      const verification = { ...selected.verification, fieldVerified };
                      updateAction(selected.id, {
                        verification,
                        effectiveness: computeEffectiveness(verification),
                      });
                    }}
                  >
                    <option value="">—</option>
                    <option>Sí</option>
                    <option>No</option>
                  </select>
                </div>
                <div>
                  <label>¿Se eliminó la causa?</label>
                  <select
                    value={selected.verification.causeEliminated ?? ""}
                    onChange={(e) => {
                      const causeEliminated =
                        e.target.value === ""
                          ? null
                          : (e.target.value as "Sí" | "Parcialmente" | "No");
                      const verification = { ...selected.verification, causeEliminated };
                      updateAction(selected.id, {
                        verification,
                        effectiveness: computeEffectiveness(verification),
                      });
                    }}
                  >
                    <option value="">—</option>
                    <option>Sí</option>
                    <option>Parcialmente</option>
                    <option>No</option>
                  </select>
                </div>
                <div className="exec-kpi">
                  <span>Efectividad</span>
                  <strong>{selected.effectiveness}</strong>
                  <small>{selected.verificationStatus}</small>
                </div>
              </div>

              <h4 style={{ margin: "0.85rem 0 0.35rem" }}>Comentarios</h4>
              <ul className="capa-comment-list">
                {selected.comments.length === 0 ? (
                  <li className="muted">Sin comentarios.</li>
                ) : (
                  selected.comments.map((c) => (
                    <li key={c.id}>
                      <strong>
                        {c.author} · {c.createdAt}
                      </strong>
                      <span>{c.comment}</span>
                    </li>
                  ))
                )}
              </ul>
              <div className="capa-comment-add">
                <input
                  id={`capa-comment-${selected.id}`}
                  placeholder="Agregar comentario…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addComment(selected.id, (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  className="open-popup-btn"
                  onClick={() => {
                    const el = document.getElementById(
                      `capa-comment-${selected.id}`,
                    ) as HTMLInputElement | null;
                    if (!el) return;
                    addComment(selected.id, el.value);
                    el.value = "";
                  }}
                >
                  Comentar
                </button>
              </div>

              <h4 style={{ margin: "0.85rem 0 0.35rem" }}>Evidencias</h4>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Archivo</th>
                      <th>Descripción</th>
                      <th>Subido por</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.evidences.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="muted">
                          Sin evidencias cargadas.
                        </td>
                      </tr>
                    ) : (
                      selected.evidences.map((ev) => (
                        <tr key={ev.id}>
                          <td>{ev.fileName}</td>
                          <td>{ev.description}</td>
                          <td>{ev.uploadedBy}</td>
                          <td>{ev.uploadedAt}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="open-popup-btn"
                style={{ marginTop: "0.45rem" }}
                onClick={() => addEvidence(selected.id)}
              >
                Agregar evidencia (simulado)
              </button>

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
