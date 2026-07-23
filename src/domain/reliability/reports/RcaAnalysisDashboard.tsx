import { AlertTriangle, CheckCircle2, ExternalLink, FilePlus2, FileSearch, FileText, ShieldAlert, X } from "lucide-react";
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
import { buildGteJuneRcaCases, type RcaCaseDetail, type RcaPriority } from "./gteJuneRcaCases";
import { docsForRca, RCA_DELIVERED_COUNT, RCA_DELIVERED_DOCUMENTS } from "./rcaDocuments";

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

  useEffect(() => {
    if (!focusRcaId) return;
    if (cases.some((c) => c.id === focusRcaId)) {
      setSelectedId(focusRcaId);
    }
    onFocusRcaConsumed?.();
  }, [focusRcaId, cases, onFocusRcaConsumed]);

  const selected = cases.find((c) => c.id === selectedId) ?? null;
  const selectedDocs = selected
    ? docsForRca(selected.id).length
      ? docsForRca(selected.id)
      : (selected.pdfUrls ?? []).map((url, i) => ({
          id: `${selected.id}-pdf-${i}`,
          title: selected.title,
          eventLabel: selected.eventLabel,
          eventDate: selected.eventDate,
          equipment: selected.equipment,
          linkedRcaId: selected.id,
          url,
          fileName: url.split("/").pop() ?? `documento-${i + 1}.pdf`,
          pages: 0,
          revision: `Adjunto ${i + 1}`,
          status: "Entregado" as const,
          notes: "",
        }))
    : [];

  const stats = useMemo(() => {
    const total = cases.length;
    const closed = cases.filter((c) => c.status === "Cerrado").length;
    const critical = cases.filter((c) => c.priority === "Crítica").length;
    const high = cases.filter((c) => c.priority === "Alta").length;
    const pending = cases.filter((c) => c.status !== "Cerrado").length;
    const withPdf = cases.filter((c) => (c.pdfUrls?.length ?? 0) > 0 || docsForRca(c.id).length > 0).length;
    return { total, closed, critical, high, open: pending, withPdf, deliveredDocs: RCA_DELIVERED_COUNT };
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
          <div className="rca-head-actions">
            <span className="source-badge gte">GTE</span>
            {onCreateBlankRca ? (
              <button type="button" className="open-popup-btn" onClick={onCreateBlankRca}>
                <FilePlus2 size={14} /> Nuevo RCA
              </button>
            ) : null}
          </div>
        </div>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          Eventos de mayor impacto / recurrencia · PDF entregados en <code>data/RCA</code> (también en{" "}
          <code>/rca</code>). Nuevos casos se guardan en este navegador.
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
            <FileText size={16} />
            <span>PDF entregados</span>
            <strong>{stats.deliveredDocs}</strong>
            <small>{stats.withPdf} caso(s) con adjunto</small>
          </div>
          <div className="exec-kpi">
            <ShieldAlert size={16} />
            <span>Prioridad crítica</span>
            <strong>{stats.critical}</strong>
          </div>
          <div className="exec-kpi">
            <AlertTriangle size={16} />
            <span>Abiertos</span>
            <strong>{stats.open}</strong>
          </div>
        </div>

        <section className="panel" style={{ marginTop: "0.75rem" }}>
          <article className="card">
            <p className="eyebrow">Documentos formales</p>
            <h3>RCA PDF entregados a Gran Tierra</h3>
            <p className="muted" style={{ marginTop: "0.25rem" }}>
              {RCA_DELIVERED_COUNT} archivo(s) · abra el visor o descargue el PDF.
            </p>
            <div className="table-wrap" style={{ marginTop: "0.55rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Fecha evento</th>
                    <th>RCA</th>
                    <th>Revisión</th>
                    <th>Páginas</th>
                    <th>Estado</th>
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
                      <td>{doc.eventDate}</td>
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
                        <span className="badge success">{doc.status}</span>
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
                <th>PDF</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => {
                const docs = docsForRca(c.id);
                const pdfCount = docs.length || (c.pdfUrls?.length ?? 0);
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
              })}
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
