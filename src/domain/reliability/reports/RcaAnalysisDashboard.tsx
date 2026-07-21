import { AlertTriangle, CheckCircle2, FileSearch, ShieldAlert } from "lucide-react";
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
import { buildGteJuneRcaCases, type RcaCaseDetail, type RcaPriority } from "./gteJuneRcaCases";

type Props = {
  monthLabel: string;
};

const PRIORITY_COLOR: Record<RcaPriority, string> = {
  Crítica: "#ef4444",
  Alta: "#f97316",
  Media: "#eab308",
  Baja: "#22c55e",
};

export function RcaAnalysisDashboard({ monthLabel }: Props) {
  const [cases, setCases] = useState<RcaCaseDetail[]>(() => buildGteJuneRcaCases());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = cases.find((c) => c.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const total = cases.length;
    const closed = cases.filter((c) => c.status === "Cerrado").length;
    const critical = cases.filter((c) => c.priority === "Crítica").length;
    const high = cases.filter((c) => c.priority === "Alta").length;
    return { total, closed, critical, high, open: total - closed };
  }, [cases]);

  const chartData = useMemo(
    () =>
      cases.map((c) => ({
        id: c.id,
        score: c.priority === "Crítica" ? 3 : c.priority === "Alta" ? 2 : c.priority === "Media" ? 1 : 0.5,
        priority: c.priority,
        title: c.eventLabel,
      })),
    [cases],
  );

  function updateCase(id: string, patch: Partial<RcaCaseDetail>) {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function updateAction(id: string, index: number, value: string) {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const actions = [...c.actions];
        actions[index] = value;
        return { ...c, actions };
      }),
    );
  }

  function addAction(id: string) {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, actions: [...c.actions, ""] } : c)),
    );
  }

  return (
    <div className="panel">
      <article className="card">
        <p className="eyebrow">Análisis de causa raíz</p>
        <div className="screen-shell-head">
          <h3>{monthLabel}</h3>
          <span className="source-badge gte">GTE</span>
        </div>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          Solo eventos de mayor impacto, recurrencia o criticidad operacional · Junio 2026 (cierre julio).
        </p>

        <div className="exec-kpi-row" style={{ marginTop: "0.6rem" }}>
          <div className="exec-kpi">
            <FileSearch size={16} />
            <span>RCA totales</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="exec-kpi">
            <CheckCircle2 size={16} />
            <span>Cerrados</span>
            <strong>{stats.closed}</strong>
          </div>
          <div className="exec-kpi">
            <ShieldAlert size={16} />
            <span>Prioridad crítica</span>
            <strong>{stats.critical}</strong>
          </div>
          <div className="exec-kpi">
            <AlertTriangle size={16} />
            <span>Prioridad alta</span>
            <strong>{stats.high}</strong>
          </div>
        </div>

        <article className="dash-chart-panel" style={{ marginTop: "0.7rem" }}>
          <h4>Criticidad de RCA seleccionados</h4>
          <p className="muted dash-chart-sub">Escala relativa: Crítica=3 · Alta=2 · Media=1</p>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="id" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} width={28} allowDecimals={false} />
                <Tooltip
                  formatter={(_, __, item) => {
                    const row = item?.payload as { priority?: string; title?: string } | undefined;
                    return [row?.priority ?? "", row?.title ?? "Prioridad"];
                  }}
                />
                <Bar dataKey="score" name="Criticidad" radius={[4, 4, 0, 0]}>
                  {chartData.map((row) => (
                    <Cell key={row.id} fill={PRIORITY_COLOR[row.priority]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <div className="table-wrap" style={{ marginTop: "0.7rem" }}>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Evento</th>
                <th>Equipo</th>
                <th>Fecha</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Categoría</th>
                <th>Plan vinculado</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id}>
                  <td>
                    <button
                      type="button"
                      className="sort-button"
                      title="Abrir RCA"
                      onClick={() => setSelectedId(c.id)}
                    >
                      {c.id}
                    </button>
                  </td>
                  <td>{c.eventLabel}</td>
                  <td>{c.equipment}</td>
                  <td>{c.eventDate}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: `color-mix(in oklab, ${PRIORITY_COLOR[c.priority]} 22%, var(--panel-soft))`,
                        color: PRIORITY_COLOR[c.priority],
                      }}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td>{c.status}</td>
                  <td>{c.category}</td>
                  <td>{c.linkedPlanId ?? "—"}</td>
                  <td className="detalle-cell">{c.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected ? (
          <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setSelectedId(null)}>
            <article className="modal-card modal-card--xl intervention-modal" onClick={(e) => e.stopPropagation()}>
              <header className="modal-header">
                <div>
                  <p className="eyebrow" style={{ margin: 0 }}>{selected.id}</p>
                  <h3 style={{ margin: "0.15rem 0 0" }}>{selected.title}</h3>
                </div>
                <button type="button" className="open-popup-btn" onClick={() => setSelectedId(null)}>
                  Cerrar
                </button>
              </header>

              <div className="exec-kpi-row" style={{ marginTop: "0.55rem" }}>
                <div className="exec-kpi"><span>Equipo</span><strong>{selected.equipment}</strong></div>
                <div className="exec-kpi"><span>Fecha evento</span><strong>{selected.eventDate}</strong></div>
                <div className="exec-kpi"><span>Prioridad</span><strong>{selected.priority}</strong></div>
                <div className="exec-kpi"><span>Estado</span><strong>{selected.status}</strong></div>
                <div className="exec-kpi"><span>Plan</span><strong>{selected.linkedPlanId ?? "—"}</strong></div>
              </div>

              <div className="intervention-grid-2" style={{ marginTop: "0.55rem" }}>
                <div>
                  <label>Estado</label>
                  <select
                    value={selected.status}
                    onChange={(e) =>
                      updateCase(selected.id, {
                        status: e.target.value as RcaCaseDetail["status"],
                        closeDate:
                          e.target.value === "Cerrado"
                            ? selected.closeDate ?? new Date().toISOString().slice(0, 10)
                            : null,
                      })}
                  >
                    {["Pendiente", "En curso", "Cerrado"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Prioridad</label>
                  <select
                    value={selected.priority}
                    onChange={(e) => updateCase(selected.id, { priority: e.target.value as RcaPriority })}
                  >
                    {["Crítica", "Alta", "Media", "Baja"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Fecha del evento</label>
                  <input
                    type="date"
                    value={selected.eventDate}
                    onChange={(e) => updateCase(selected.id, { eventDate: e.target.value })}
                  />
                </div>
                <div>
                  <label>Fecha de cierre</label>
                  <input
                    type="date"
                    value={selected.closeDate ?? ""}
                    onChange={(e) => updateCase(selected.id, { closeDate: e.target.value || null })}
                  />
                </div>
              </div>

              <div className="intervention-grid-2">
                <div>
                  <label>Problema</label>
                  <textarea
                    value={selected.problem}
                    onChange={(e) => updateCase(selected.id, { problem: e.target.value })}
                  />
                </div>
                <div>
                  <label>Causa inmediata</label>
                  <textarea
                    value={selected.immediateCause}
                    onChange={(e) => updateCase(selected.id, { immediateCause: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: "0.55rem" }}>
                <label>Causa raíz</label>
                <textarea
                  value={selected.rootCause}
                  onChange={(e) => updateCase(selected.id, { rootCause: e.target.value })}
                />
              </div>

              <div className="table-wrap" style={{ marginTop: "0.65rem" }}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Acción implementada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.actions.map((action, index) => (
                      <tr key={`${selected.id}-a-${index}`}>
                        <td>{index + 1}</td>
                        <td>
                          <input
                            value={action}
                            onChange={(e) => updateAction(selected.id, index, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="open-popup-btn"
                style={{ marginTop: "0.5rem" }}
                onClick={() => addAction(selected.id)}
              >
                Agregar acción
              </button>

              <div style={{ marginTop: "0.65rem" }}>
                <label>Resultado</label>
                <textarea
                  value={selected.result}
                  onChange={(e) => updateCase(selected.id, { result: e.target.value })}
                />
              </div>

              <div className="intervention-timeline">
                <span>Evento</span>
                <span>Causa inmediata</span>
                <span>Causa raíz</span>
                <span>Acciones</span>
                <span>Validación</span>
                <span>Cierre</span>
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
