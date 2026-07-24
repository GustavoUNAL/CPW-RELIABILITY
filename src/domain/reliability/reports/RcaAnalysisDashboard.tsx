import { AlertTriangle, ExternalLink, FilePlus2, FileText, Link2, Wrench, X } from "lucide-react";
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
import { enrichEventLog } from "../events/eventLogUtils";
import {
  buildGteJuneRcaCases,
  findRcaCasesForEvent,
  rcaHasFormalDocument,
  type RcaCaseDetail,
  type RcaPriority,
} from "./gteJuneRcaCases";
import { GRAN_TIERRA_MONTHLY_DATA } from "./granTierraMonthly";
import {
  docsForRca,
  RCA_DELIVERED_COUNT,
  RCA_DELIVERED_DOCUMENTS,
  RCA_FOLDER_LABEL,
} from "./rcaDocuments";

type Props = {
  monthLabel: string;
  focusRcaId?: string | null;
  onFocusRcaConsumed?: () => void;
  cases?: RcaCaseDetail[];
  onCasesChange?: (next: RcaCaseDetail[] | ((prev: RcaCaseDetail[]) => RcaCaseDetail[])) => void;
  onCreateBlankRca?: () => void;
};

const PRIORITY_COLOR: Record<RcaPriority, string> = {
  Crítica: "#ef4444",
  Alta: "#f97316",
  Media: "#eab308",
  Baja: "#22c55e",
};

export function RcaAnalysisDashboard({
  monthLabel,
  focusRcaId,
  onFocusRcaConsumed,
  cases: casesProp,
  onCasesChange,
  onCreateBlankRca,
}: Props) {
  const [localCases, setLocalCases] = useState<RcaCaseDetail[]>(() => buildGteJuneRcaCases());
  const cases = casesProp ?? localCases;
  const setCases = onCasesChange ?? setLocalCases;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [scope, setScope] = useState<"folder" | "all">("folder");

  useEffect(() => {
    if (!focusRcaId) return;
    if (cases.some((c) => c.id === focusRcaId)) {
      setSelectedId(focusRcaId);
      setScope("all");
    }
    onFocusRcaConsumed?.();
  }, [focusRcaId, cases, onFocusRcaConsumed]);

  const visibleCases = useMemo(() => {
    const list =
      scope === "folder" ? cases.filter((c) => rcaHasFormalDocument(c) || docsForRca(c.id).length > 0) : cases;
    return [...list].sort((a, b) => {
      const af = rcaHasFormalDocument(a) || docsForRca(a.id).length > 0 ? 0 : 1;
      const bf = rcaHasFormalDocument(b) || docsForRca(b.id).length > 0 ? 0 : 1;
      return af - bf || b.eventDate.localeCompare(a.eventDate) || a.id.localeCompare(b.id);
    });
  }, [cases, scope]);

  const selected = cases.find((c) => c.id === selectedId) ?? null;
  const selectedDocs = selected
    ? docsForRca(selected.id).length
      ? docsForRca(selected.id)
      : (selected.pdfUrls ?? []).map((url, i) => ({
          id: `${selected.id}-pdf-${i}`,
          title: selected.title,
          eventLabel: selected.eventLabel,
          eventDate: selected.eventDate,
          eventTime: "",
          equipment: selected.equipment,
          linkedRcaId: selected.id,
          sequential: selected.id,
          url,
          fileName: url.split("/").pop() ?? `documento-${i + 1}.pdf`,
          pages: 0,
          revision: `Adjunto ${i + 1}`,
          status: "Entregado" as const,
          docStatus: selected.status,
          elaboratedBy: selected.responsible,
          reviewedBy: "—",
          approvedBy: "—",
          notes: "",
        }))
    : [];

  const stats = useMemo(() => {
    const folderCases = cases.filter((c) => rcaHasFormalDocument(c) || docsForRca(c.id).length > 0);
    const gteEvents = enrichEventLog(GRAN_TIERRA_MONTHLY_DATA.Jun?.eventLog ?? [], "gran_tierra");
    const linkedEvents = gteEvents.filter(
      (e) => findRcaCasesForEvent(e.date, e.equipment, folderCases).length > 0,
    );
    const assets = new Set(folderCases.flatMap((c) => c.linkedAssets));
    return {
      formalRca: RCA_DELIVERED_COUNT,
      linkedFailureEvents: linkedEvents.length,
      affectedAssets: assets.size,
      withPlan: folderCases.filter((c) => Boolean(c.linkedPlanId)).length,
    };
  }, [cases]);

  const summaryChartData = useMemo(
    () => [
      { key: "RCA formales", value: stats.formalRca, fill: "#0ea5e9" },
      { key: "Eventos de falla", value: stats.linkedFailureEvents, fill: "#f97316" },
      { key: "Equipos afectados", value: stats.affectedAssets, fill: "#6366f1" },
      { key: "Con plan", value: stats.withPlan, fill: "#22c55e" },
    ],
    [stats],
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
          <div className="rca-head-actions">
            <span className="source-badge gte">GTE</span>
            <label className="ev-bitacora-filter">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as "folder" | "all")}
                aria-label="Alcance de casos RCA"
              >
                <option value="folder">Solo {RCA_FOLDER_LABEL}</option>
                <option value="all">Todos los casos</option>
              </select>
            </label>
            {onCreateBlankRca ? (
              <button type="button" className="open-popup-btn" onClick={onCreateBlankRca}>
                <FilePlus2 size={14} /> Nuevo RCA
              </button>
            ) : null}
          </div>
        </div>
        <div className="exec-kpi-row" style={{ marginTop: "0.6rem" }}>
          <div className="exec-kpi">
            <FileText size={16} />
            <span>RCA formales</span>
            <strong>{stats.formalRca}</strong>
            <small>Entregados a GTE</small>
          </div>
          <div className="exec-kpi">
            <AlertTriangle size={16} />
            <span>Eventos de falla registrados</span>
            <strong>{stats.linkedFailureEvents}</strong>
            <small>Bitácora GTE vinculados</small>
          </div>
          <div className="exec-kpi">
            <Wrench size={16} />
            <span>Equipos afectados</span>
            <strong>{stats.affectedAssets}</strong>
            <small>Activos en RCA formales</small>
          </div>
          <div className="exec-kpi">
            <Link2 size={16} />
            <span>Con plan de intervención</span>
            <strong>{stats.withPlan}</strong>
            <small>RCA con plan vinculado</small>
          </div>
        </div>

        <article className="dash-chart-panel" style={{ marginTop: "0.7rem" }}>
          <h4>Resumen RCA formales</h4>
          <p className="muted dash-chart-sub">
            {stats.formalRca} RCA · {stats.linkedFailureEvents} eventos · {stats.affectedAssets} equipos
          </p>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summaryChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="key" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} width={28} allowDecimals={false} />
                <Tooltip formatter={(value) => [value, "Cantidad"]} />
                <Bar dataKey="value" name="Cantidad" radius={[4, 4, 0, 0]}>
                  {summaryChartData.map((row) => (
                    <Cell key={row.key} fill={row.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <section className="panel" style={{ marginTop: "0.75rem" }}>
          <article className="card">
            <p className="eyebrow">Documentos en {RCA_FOLDER_LABEL}</p>
            <h3>RCA PDF · Secuencial 30 · Vector Shift</h3>
            <p className="muted" style={{ marginTop: "0.25rem" }}>
              {RCA_DELIVERED_COUNT} RCA formales · elaboró Daniel Durán · aprobó Wilson Oliveros · vinculados a bitácora.
            </p>
            <div className="table-wrap" style={{ marginTop: "0.55rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Evento</th>
                    <th>Sec.</th>
                    <th>RCA</th>
                    <th>Revisión</th>
                    <th>Pág.</th>
                    <th>Estado doc.</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {RCA_DELIVERED_DOCUMENTS.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <strong>{doc.title}</strong>
                        <div className="muted" style={{ fontSize: "0.72rem", marginTop: "0.15rem" }}>
                          {doc.fileName}
                        </div>
                      </td>
                      <td>
                        {doc.eventDate} {doc.eventTime}
                        <div className="muted" style={{ fontSize: "0.7rem" }}>
                          {doc.equipment}
                        </div>
                      </td>
                      <td>{doc.sequential}</td>
                      <td>
                        <button
                          type="button"
                          className="sort-button"
                          onClick={() => setSelectedId(doc.linkedRcaId)}
                        >
                          {doc.linkedRcaId}
                        </button>
                      </td>
                      <td>{doc.revision}</td>
                      <td>{doc.pages}</td>
                      <td>
                        <span className="badge">{doc.docStatus}</span>
                      </td>
                      <td>
                        <div className="rca-doc-actions">
                          <button type="button" className="ev-rca-link" onClick={() => setPdfUrl(doc.url)}>
                            Ver PDF
                          </button>
                          <a className="ev-rca-link" href={doc.url} target="_blank" rel="noreferrer">
                            Abrir <ExternalLink size={11} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>

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
                <th>PDF</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {visibleCases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="muted">
                    Sin casos en el alcance seleccionado.
                  </td>
                </tr>
              ) : (
                visibleCases.map((c) => {
                  const docs = docsForRca(c.id);
                  const pdfCount = docs.length || (c.pdfUrls?.length ?? 0);
                  const formal = pdfCount > 0;
                  return (
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
                        {formal ? (
                          <div className="muted" style={{ fontSize: "0.65rem" }}>
                            {RCA_FOLDER_LABEL}
                          </div>
                        ) : null}
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
                      <td>
                        {pdfCount > 0 ? (
                          <button
                            type="button"
                            className="ev-rca-link"
                            onClick={() => {
                              setSelectedId(c.id);
                              const first = docs[0]?.url ?? c.pdfUrls?.[0];
                              if (first) setPdfUrl(first);
                            }}
                          >
                            <FileText size={12} /> {pdfCount}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="detalle-cell">{c.result || "—"}</td>
                    </tr>
                  );
                })
              )}
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

              {selectedDocs.length > 0 ? (
                <div className="rca-pdf-block" style={{ marginTop: "0.65rem" }}>
                  <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.9rem" }}>PDF del RCA</h4>
                  <div className="rca-doc-actions">
                    {selectedDocs.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        className="ev-rca-link"
                        onClick={() => setPdfUrl(doc.url)}
                      >
                        <FileText size={12} /> {doc.revision || doc.fileName}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="intervention-grid-2" style={{ marginTop: "0.55rem" }}>
                <div>
                  <label>Título</label>
                  <input
                    value={selected.title}
                    onChange={(e) => updateCase(selected.id, { title: e.target.value })}
                  />
                </div>
                <div>
                  <label>Etiqueta evento</label>
                  <input
                    value={selected.eventLabel}
                    onChange={(e) => updateCase(selected.id, { eventLabel: e.target.value })}
                  />
                </div>
                <div>
                  <label>Equipo</label>
                  <input
                    value={selected.equipment}
                    onChange={(e) => {
                      const equipment = e.target.value;
                      const linkedAssets = equipment
                        .split(/[,;/|]+/)
                        .map((s) => s.trim())
                        .filter(Boolean);
                      updateCase(selected.id, {
                        equipment,
                        linkedAssets: linkedAssets.length ? linkedAssets : [equipment || "Por definir"],
                      });
                    }}
                  />
                </div>
                <div>
                  <label>Categoría</label>
                  <input
                    value={selected.category}
                    onChange={(e) => updateCase(selected.id, { category: e.target.value })}
                  />
                </div>
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

        {pdfUrl ? (
          <div
            className="modal-overlay rca-pdf-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setPdfUrl(null)}
          >
            <article className="modal-card modal-card--xl rca-pdf-modal" onClick={(e) => e.stopPropagation()}>
              <header className="modal-header">
                <div>
                  <p className="eyebrow" style={{ margin: 0 }}>Visor PDF</p>
                  <h3 style={{ margin: "0.15rem 0 0" }}>{pdfUrl.split("/").pop()}</h3>
                </div>
                <div className="rca-doc-actions">
                  <a className="ev-rca-link" href={pdfUrl} target="_blank" rel="noreferrer">
                    Abrir en pestaña <ExternalLink size={12} />
                  </a>
                  <button type="button" className="open-popup-btn" onClick={() => setPdfUrl(null)}>
                    <X size={16} /> Cerrar
                  </button>
                </div>
              </header>
              <iframe title="RCA PDF" src={pdfUrl} className="rca-pdf-frame" />
            </article>
          </div>
        ) : null}
      </article>
    </div>
  );
}
