import { AlertTriangle, CheckCircle2, ClipboardCheck, Plus, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReportKey } from "../types";
import { type CopowerMonthKey, COPOWER_MONTHLY_DATA } from "./copowerMonthly";
import { type GranTierraMonthKey, GRAN_TIERRA_MONTHLY_DATA } from "./granTierraMonthly";
import { classifyEventCategory } from "../events/eventCategories";
import {
  initialPlansFor,
  type ActionStatus,
  type ActionType,
  type Effectiveness,
  type PlanAction,
  type PlanRow,
  type PlanStatus,
} from "./gteJuneInterventionPlans";

function planPriority(impact10: number) {
  if (impact10 > 8) return "Crítica";
  if (impact10 >= 6) return "Alta";
  if (impact10 >= 4) return "Media";
  return "Baja";
}

type Props = {
  report: ReportKey;
  month: string;
  monthLabel: string;
};

function getSnap(report: ReportKey, month: string) {
  if (report === "gran_tierra") return GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  return COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ?? null;
}

function progressOf(actions: PlanAction[]) {
  if (actions.length === 0) return 0;
  const completed = actions.filter((a) => a.status === "Completada").length;
  return completed / actions.length;
}

function makeId(prefix: string, idx: number) {
  return `${prefix}-${String(idx).padStart(3, "0")}`;
}

export function InterventionPlansDashboard({ report, month, monthLabel }: Props) {
  const snap = getSnap(report, month);
  const [plans, setPlans] = useState<PlanRow[]>(() => initialPlansFor(report, month));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>("");

  useEffect(() => {
    const seed = initialPlansFor(report, month);
    setPlans(seed);
    setSelectedId(null);
    setValidationMessage("");
  }, [report, month]);

  const candidates = useMemo(() => {
    if (!snap) return [];
    const downtimeByEq = snap.eventLog.reduce((acc, ev) => {
      acc.set(ev.equipment, (acc.get(ev.equipment) ?? 0) + (ev.downtimeHours ?? 0));
      return acc;
    }, new Map<string, number>());
    const rows = snap.machineIndicators.filter((m) => m.unidad !== "SISTEMA N" && m.fallas > 0);
    const maxF = Math.max(...rows.map((r) => r.fallas), 1);
    const maxH = Math.max(...rows.map((r) => downtimeByEq.get(r.unidad) ?? 0), 1);
    const maxR = Math.max(...rows.map((r) => r.mttrHours ?? 0), 1);
    const minDisp = Math.min(
      ...rows.map((r) => (r.disponibilidadPct == null ? 100 : r.disponibilidadPct)),
      100,
    );
    const dispDen = Math.max(0.0001, 100 - minDisp);

    return rows
      .map((r) => {
        const fn = r.fallas / maxF;
        const inn = (downtimeByEq.get(r.unidad) ?? 0) / maxH;
        const rn = (r.mttrHours ?? 0) / maxR;
        const dn = Math.max(
          0,
          Math.min(1, (100 - (r.disponibilidadPct == null ? 100 : r.disponibilidadPct)) / dispDen),
        );
        const iio = 0.4 * fn + 0.3 * inn + 0.2 * rn + 0.1 * dn;
        const topCause = snap.eventLog.find((ev) => ev.equipment === r.unidad)?.cause ?? "Sin causa reportada";
        const cat = classifyEventCategory(topCause).shortLabel;
        return {
          unidad: r.unidad,
          campo: r.campo,
          risk: r.riesgoTecnico,
          iio,
          category: cat,
          problem: topCause,
          availability: r.disponibilidadPct,
          mtbf: Number.parseFloat(r.mtbfLabel),
          mttr: r.mttrHours,
          fallas: r.fallas,
          outageHours: downtimeByEq.get(r.unidad) ?? 0,
        };
      })
      .sort((a, b) => b.iio - a.iio || b.fallas - a.fallas);
  }, [snap]);

  const coveredAssets = useMemo(() => {
    const set = new Set<string>();
    for (const p of plans) {
      for (const a of p.linkedAssets) set.add(a);
      set.add(p.assetId);
    }
    return set;
  }, [plans]);

  const suggested = candidates.filter(
    (c) =>
      (c.risk === "RIESGO ALTO" || c.iio > 0.6) &&
      !coveredAssets.has(c.unidad) &&
      !plans.some((p) => p.linkedAssets.includes(c.unidad) && p.status !== "Cerrado"),
  );

  const selected = plans.find((p) => p.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const total = plans.length;
    const closed = plans.filter((p) => p.status === "Cerrado").length;
    const pending = plans.filter((p) => p.status === "Pendiente").length;
    const running = plans.filter((p) => p.status === "En ejecución").length;
    const progressValues = plans.map((p) => progressOf(p.actions));
    const avgProgress =
      progressValues.length === 0 ? 0 : progressValues.reduce((a, b) => a + b, 0) / progressValues.length;
    const withEff = plans.filter((p) => p.effectivenessPct != null);
    const avgEffectiveness =
      withEff.length === 0
        ? 0
        : withEff.reduce((sum, p) => sum + (p.effectivenessPct ?? 0), 0) / withEff.length;
    const closeDays = plans
      .filter((p) => p.closeDate)
      .map((p) => {
        const a = new Date(p.startDate).getTime();
        const b = new Date(p.closeDate as string).getTime();
        return Math.max(0, (b - a) / (1000 * 60 * 60 * 24));
      });
    const avgClose = closeDays.length === 0 ? 0 : closeDays.reduce((a, b) => a + b, 0) / closeDays.length;
    return { total, closed, pending, running, avgProgress, avgEffectiveness, avgClose };
  }, [plans]);

  const chartData = useMemo(
    () =>
      plans.map((p) => ({
        id: p.id.replace(/^IP-(GTE|CPW)-/, ""),
        plan: p.title.length > 28 ? `${p.title.slice(0, 26)}…` : p.title,
        avance: Math.round(progressOf(p.actions) * 100),
        efectividad: p.effectivenessPct ?? 0,
      })),
    [plans],
  );

  function createPlanFromCandidate(unit: (typeof candidates)[number]) {
    setPlans((prev) => {
      if (prev.some((p) => p.linkedAssets.includes(unit.unidad) && p.status !== "Cerrado")) return prev;
      const idx = prev.length + 1;
      const now = new Date().toISOString().slice(0, 10);
      const target = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);
      const id = makeId(report === "gran_tierra" ? "IP-GTE" : "IP-CPW", idx);
      const next: PlanRow = {
        id,
        title: `Plan de intervención · ${unit.unidad}`,
        assetId: unit.unidad,
        assetName: unit.unidad,
        linkedAssets: [unit.unidad],
        linkedEvents: [unit.problem.slice(0, 80)],
        field: unit.campo,
        priority: planPriority(unit.iio * 10),
        impactIndex: Number(unit.iio.toFixed(3)),
        risk: unit.risk,
        problem: unit.problem,
        rootCause: "",
        category: unit.category,
        responsible: "Confiabilidad",
        company: report === "gran_tierra" ? "GTE" : "COPOWER",
        status: "Pendiente",
        startDate: now,
        targetDate: target,
        closeDate: null,
        effectiveness: "",
        effectivenessPct: null,
        verification: "",
        successIndicator: "Mejora sostenida de disponibilidad y reducción de fallas en 90 días.",
        lessonsLearned: "",
        createdBy: "Reliability Team",
        createdAt: now,
        updatedAt: now,
        availabilityBefore: unit.availability,
        mtbfBefore: Number.isNaN(unit.mtbf) ? null : unit.mtbf,
        mttrBefore: unit.mttr,
        failuresBefore: unit.fallas,
        actions: [
          {
            id: `${id}-A1`,
            description: "Ejecutar RCA detallado y confirmar modo de falla.",
            type: "Ingeniería",
            status: "Pendiente",
            responsible: "Ing. Confiabilidad",
            dueDate: target,
            completedDate: null,
            evidence: "",
            comments: "",
          },
        ],
        evidences: [],
      };
      setSelectedId(id);
      return [...prev, next];
    });
  }

  function updatePlan(id: string, patch: Partial<PlanRow>) {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : p)));
  }

  function updateAction(planId: string, actionId: string, patch: Partial<PlanAction>) {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        return {
          ...p,
          actions: p.actions.map((a) => (a.id === actionId ? { ...a, ...patch } : a)),
          updatedAt: new Date().toISOString().slice(0, 10),
        };
      }),
    );
  }

  function addAction(planId: string) {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        const id = `${planId}-A${p.actions.length + 1}`;
        return {
          ...p,
          status: p.status === "Cerrado" ? "En ejecución" : p.status,
          actions: [
            ...p.actions,
            {
              id,
              description: "",
              type: "Correctiva",
              status: "Pendiente",
              responsible: "",
              dueDate: p.targetDate,
              completedDate: null,
              evidence: "",
              comments: "",
            },
          ],
        };
      }),
    );
  }

  function trySetStatus(plan: PlanRow, status: PlanStatus) {
    if (
      status === "Cerrado" &&
      (plan.effectivenessPct == null || plan.effectivenessPct < 85) &&
      plan.effectiveness === "No" &&
      plan.actions.every((a) => a.status === "Completada")
    ) {
      setValidationMessage("Para cerrar un plan con efectividad baja, crea al menos una nueva acción de refuerzo.");
      return;
    }
    setValidationMessage("");
    updatePlan(plan.id, { status, closeDate: status === "Cerrado" ? (plan.closeDate ?? new Date().toISOString().slice(0, 10)) : null });
  }

  if (!snap) return <p className="empty-state">Sin datos para {monthLabel} en esta fuente.</p>;

  return (
    <div className="panel">
      <article className="card">
        <p className="eyebrow">Planes de intervención</p>
        <div className="screen-shell-head">
          <h3>{monthLabel}</h3>
          <span className={`source-badge ${report === "gran_tierra" ? "gte" : "cpw"}`}>{report === "gran_tierra" ? "GTE" : "CPW"}</span>
        </div>
        {report === "gran_tierra" && month === "Jun" ? (
          <p className="muted" style={{ marginTop: "0.35rem" }}>
            Estado al cierre de julio 2026 · Avance = acciones ejecutadas · Efectividad = verificación de que las fallas no reinciden.
          </p>
        ) : null}

        <div className="exec-kpi-row" style={{ marginTop: "0.6rem" }}>
          <div className="exec-kpi"><ClipboardCheck size={16} /><span>Planes creados</span><strong>{stats.total}</strong></div>
          <div className="exec-kpi"><CheckCircle2 size={16} /><span>Planes cerrados</span><strong>{stats.closed}</strong></div>
          <div className="exec-kpi"><Wrench size={16} /><span>En ejecución</span><strong>{stats.running}</strong></div>
          <div className="exec-kpi"><AlertTriangle size={16} /><span>Pendientes</span><strong>{stats.pending}</strong></div>
          <div className="exec-kpi"><span>Avance global</span><strong>{Math.round(stats.avgProgress * 100)}%</strong></div>
          <div className="exec-kpi"><span>Efectividad promedio</span><strong>{stats.avgEffectiveness.toFixed(0)}%</strong></div>
        </div>

        {plans.length > 0 ? (
          <article className="dash-chart-panel" style={{ marginTop: "0.7rem" }}>
            <h4>Avance vs efectividad por plan</h4>
            <p className="muted dash-chart-sub">
              Avance = % de acciones completadas · Efectividad = resultado verificado post-intervención
            </p>
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                  <XAxis dataKey="id" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} width={36} domain={[0, 100]} unit="%" />
                  <Tooltip
                    formatter={(value, name) => [`${Number(value ?? 0)}%`, String(name)]}
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload as { id?: string; plan?: string } | undefined;
                      return row ? `${row.id} · ${row.plan}` : "";
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="avance" name="Avance %" fill="#0e6e8c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="efectividad" name="Efectividad %" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        ) : null}

        {suggested.length > 0 ? (
          <article className="dash-chart-panel" style={{ marginTop: "0.7rem" }}>
            <h4>Activos sugeridos adicionales</h4>
            <p className="muted dash-chart-sub">Riesgo Alto o IIO &gt; 0.60 sin plan abierto vinculado.</p>
            <div className="intervention-suggest-grid">
              {suggested.slice(0, 8).map((c) => (
                <article key={c.unidad} className="intervention-suggest-card">
                  <strong>{c.unidad}</strong>
                  <small>{c.campo} · IIO {c.iio.toFixed(3)} · {c.risk}</small>
                  <button type="button" className="open-popup-btn" onClick={() => createPlanFromCandidate(c)}>
                    Crear Plan de Intervención
                  </button>
                </article>
              ))}
            </div>
          </article>
        ) : null}

        <div className="table-wrap" style={{ marginTop: "0.7rem" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Plan</th>
                <th>Activos</th>
                <th>Problema</th>
                <th>Categoría</th>
                <th>Responsable</th>
                <th>Empresa</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Fecha cierre</th>
                <th>Avance %</th>
                <th>Efectividad</th>
                <th>Resultado esperado</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr><td colSpan={13}>Sin planes creados. Usa "Crear Plan de Intervención" en activos sugeridos.</td></tr>
              ) : plans.map((p) => {
                const prg = progressOf(p.actions);
                return (
                  <tr key={p.id}>
                    <td>
                      <button
                        type="button"
                        className="sort-button"
                        onClick={() => {
                          setValidationMessage("");
                          setSelectedId(p.id);
                        }}
                        title="Abrir plan"
                      >
                        {p.id}
                      </button>
                    </td>
                    <td>{p.title}</td>
                    <td>{p.assetName}</td>
                    <td className="detalle-cell">{p.problem}</td>
                    <td>{p.category}</td>
                    <td>{p.responsible}</td>
                    <td>{p.company}</td>
                    <td>{p.priority}</td>
                    <td>{p.status}</td>
                    <td>{p.closeDate ?? p.targetDate}</td>
                    <td>
                      <div className="intervention-progress">
                        <div className="intervention-progress-bar" style={{ width: `${Math.round(prg * 100)}%` }} />
                      </div>
                      <small>{Math.round(prg * 100)}%</small>
                    </td>
                    <td>{p.effectivenessPct == null ? "N/D" : `${p.effectivenessPct}%`}</td>
                    <td className="detalle-cell">{p.successIndicator}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selected ? (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setSelectedId(null)}
          >
            <article
              className="modal-card modal-card--xl intervention-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="modal-header">
                <div>
                  <p className="eyebrow" style={{ margin: 0 }}>{selected.id}</p>
                  <h3 style={{ margin: "0.15rem 0 0" }}>{selected.title}</h3>
                </div>
                <button type="button" className="open-popup-btn" onClick={() => setSelectedId(null)}>
                  Cerrar
                </button>
              </header>
              {validationMessage ? <p className="alert-inline">{validationMessage}</p> : null}

              <div className="exec-kpi-row" style={{ marginTop: "0.55rem" }}>
                <div className="exec-kpi"><span>Activos</span><strong>{selected.assetName}</strong></div>
                <div className="exec-kpi"><span>Campo</span><strong>{selected.field}</strong></div>
                <div className="exec-kpi"><span>IIO</span><strong>{selected.impactIndex.toFixed(3)}</strong></div>
                <div className="exec-kpi"><span>Disponibilidad</span><strong>{selected.availabilityBefore == null ? "N/D" : `${selected.availabilityBefore.toFixed(2)}%`}</strong></div>
                <div className="exec-kpi"><span>MTBF</span><strong>{selected.mtbfBefore == null ? "N/D" : `${selected.mtbfBefore.toFixed(1)} h`}</strong></div>
                <div className="exec-kpi"><span>MTTR</span><strong>{selected.mttrBefore == null ? "N/D" : `${selected.mttrBefore.toFixed(2)} h`}</strong></div>
                <div className="exec-kpi"><span>Riesgo</span><strong>{selected.risk}</strong></div>
              </div>

              <p className="muted" style={{ marginTop: "0.45rem" }}>
                <strong>Eventos vinculados:</strong> {selected.linkedEvents.join(" · ")}
              </p>
              <div style={{ marginTop: "0.35rem" }}>
                <label>Resultado esperado</label>
                <input
                  value={selected.successIndicator}
                  onChange={(e) => updatePlan(selected.id, { successIndicator: e.target.value })}
                />
              </div>

              <div className="intervention-grid-2">
                <div>
                  <label>Fecha inicio</label>
                  <input
                    type="date"
                    value={selected.startDate}
                    onChange={(e) => updatePlan(selected.id, { startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label>Fecha objetivo</label>
                  <input
                    type="date"
                    value={selected.targetDate}
                    onChange={(e) => updatePlan(selected.id, { targetDate: e.target.value })}
                  />
                </div>
                <div>
                  <label>Fecha de cierre</label>
                  <input
                    type="date"
                    value={selected.closeDate ?? ""}
                    onChange={(e) => updatePlan(selected.id, { closeDate: e.target.value || null })}
                  />
                </div>
                <div>
                  <label>Estado del plan</label>
                  <select value={selected.status} onChange={(e) => trySetStatus(selected, e.target.value as PlanStatus)}>
                    {["Pendiente", "En ejecución", "En validación", "Cerrado", "Cancelado"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="intervention-grid-2">
                <div>
                  <label>Problema identificado</label>
                  <textarea value={selected.problem} onChange={(e) => updatePlan(selected.id, { problem: e.target.value })} />
                </div>
                <div>
                  <label>Causa raíz (RCA)</label>
                  <textarea value={selected.rootCause} onChange={(e) => updatePlan(selected.id, { rootCause: e.target.value })} />
                </div>
              </div>

              <div className="table-wrap" style={{ marginTop: "0.65rem" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th>Tipo</th>
                      <th>Responsable</th>
                      <th>Estado</th>
                      <th>Fecha límite</th>
                      <th>Fecha completada</th>
                      <th>Comentarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.actions.map((a) => (
                      <tr key={a.id}>
                        <td><input value={a.description} onChange={(e) => updateAction(selected.id, a.id, { description: e.target.value })} /></td>
                        <td>
                          <select value={a.type} onChange={(e) => updateAction(selected.id, a.id, { type: e.target.value as ActionType })}>
                            {["Correctiva", "Preventiva", "Predictiva", "Inspección", "Ingeniería", "Operacional", "Capacitación", "Cambio de Procedimiento"].map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </td>
                        <td><input value={a.responsible} onChange={(e) => updateAction(selected.id, a.id, { responsible: e.target.value })} /></td>
                        <td>
                          <select
                            value={a.status}
                            onChange={(e) =>
                              updateAction(selected.id, a.id, {
                                status: e.target.value as ActionStatus,
                                completedDate:
                                  e.target.value === "Completada"
                                    ? (a.completedDate ?? new Date().toISOString().slice(0, 10))
                                    : null,
                              })}
                          >
                            {["Pendiente", "En ejecución", "Completada", "Cancelada"].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td><input type="date" value={a.dueDate} onChange={(e) => updateAction(selected.id, a.id, { dueDate: e.target.value })} /></td>
                        <td>
                          <input
                            type="date"
                            value={a.completedDate ?? ""}
                            onChange={(e) => updateAction(selected.id, a.id, { completedDate: e.target.value || null })}
                          />
                        </td>
                        <td><input value={a.comments} onChange={(e) => updateAction(selected.id, a.id, { comments: e.target.value })} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" className="open-popup-btn" onClick={() => addAction(selected.id)} style={{ marginTop: "0.55rem" }}>
                <Plus size={14} /> Agregar acción
              </button>

              <div className="intervention-grid-2" style={{ marginTop: "0.6rem" }}>
                <div>
                  <label>Validación / efectividad verificada (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={selected.effectivenessPct ?? ""}
                    onChange={(e) => {
                      const pct = e.target.value === "" ? null : Number(e.target.value);
                      const label: Effectiveness =
                        pct == null ? "" : pct >= 98 ? "Sí" : pct >= 85 ? "Parcialmente" : "No";
                      updatePlan(selected.id, { effectivenessPct: pct, effectiveness: label });
                    }}
                  />
                  <input
                    placeholder="Criterio de verificación técnica"
                    value={selected.verification}
                    onChange={(e) => updatePlan(selected.id, { verification: e.target.value })}
                    style={{ marginTop: "0.4rem" }}
                  />
                  <small className="muted">Avance = acciones completadas · Efectividad = resultado verificado post-intervención.</small>
                </div>
                <div>
                  <label>Lecciones aprendidas (Markdown)</label>
                  <textarea
                    value={selected.lessonsLearned}
                    onChange={(e) => updatePlan(selected.id, { lessonsLearned: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: "0.55rem" }}>
                <label>Evidencias (PDF, Excel, Imagen, Word)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) =>
                    updatePlan(selected.id, {
                      evidences: Array.from(e.target.files ?? []).map((f) => f.name),
                    })}
                />
                {selected.evidences.length > 0 ? (
                  <p className="muted" style={{ marginTop: "0.3rem" }}>
                    {selected.evidences.join(" · ")}
                  </p>
                ) : null}
              </div>

              <div className="table-wrap" style={{ marginTop: "0.65rem" }}>
                <table>
                  <thead>
                    <tr><th></th><th>Disponibilidad</th><th>MTBF</th><th>MTTR</th><th>Fallas</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Antes</strong></td>
                      <td>{selected.availabilityBefore == null ? "N/D" : `${selected.availabilityBefore.toFixed(2)}%`}</td>
                      <td>{selected.mtbfBefore == null ? "N/D" : `${selected.mtbfBefore.toFixed(1)} h`}</td>
                      <td>{selected.mttrBefore == null ? "N/D" : `${selected.mttrBefore.toFixed(2)} h`}</td>
                      <td>{selected.failuresBefore}</td>
                    </tr>
                    <tr>
                      <td><strong>Después (estimado)</strong></td>
                      <td>{selected.availabilityBefore == null ? "N/D" : `${Math.min(100, selected.availabilityBefore + progressOf(selected.actions) * 1.2).toFixed(2)}%`}</td>
                      <td>{selected.mtbfBefore == null ? "N/D" : `${(selected.mtbfBefore * (1 + progressOf(selected.actions) * 0.2)).toFixed(1)} h`}</td>
                      <td>{selected.mttrBefore == null ? "N/D" : `${Math.max(0, selected.mttrBefore * (1 - progressOf(selected.actions) * 0.3)).toFixed(2)} h`}</td>
                      <td>{Math.max(0, selected.failuresBefore - Math.round(progressOf(selected.actions) * selected.failuresBefore))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="intervention-timeline">
                <span>Evento</span><span>RCA</span><span>Plan creado</span>
                {selected.actions.map((a) => <span key={a.id}>{a.description || a.type}</span>)}
                <span>Validación</span><span>Cierre</span>
              </div>

              <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button type="button" className="open-popup-btn" onClick={() => trySetStatus(selected, "Cerrado")}>
                  Marcar cerrado
                </button>
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
