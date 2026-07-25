import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  RcaCalidadDato,
  RcaCincoPorquesItem,
  RcaCriticidad,
  RcaCronologiaItem,
  RcaEstadoEvento,
  RcaEventoFalla,
} from "../types";
import { needsWarningBanner, UncertaintyText } from "../uncertainty";
import { CriticalityBadge } from "./CriticalityBadge";
import { FiveWhysTable } from "./FiveWhysTable";
import { QualityBadge } from "./QualityBadge";
import { RelatedLinks } from "./RelatedLinks";
import { Timeline } from "./Timeline";

type Props = {
  event: RcaEventoFalla;
  onSave: (next: RcaEventoFalla) => void;
  onClose?: () => void;
  onOpenRelated?: (id: string) => void;
  extraActions?: ReactNode;
  compact?: boolean;
  startEditing?: boolean;
};

const ESTADO_OPTS: RcaEstadoEvento[] = ["abierto", "en_seguimiento", "cerrado", "sin_marcar"];
const CALIDAD_OPTS: RcaCalidadDato[] = ["completo", "parcial", "inferido", "vacio"];
const CRIT_OPTS: RcaCriticidad[] = ["baja", "media", "media-alta", "alta", "critica", "PENDIENTE"];

const ESTADO_LABEL: Record<string, string> = {
  abierto: "Abierto",
  en_seguimiento: "En seguimiento",
  cerrado: "Cerrado",
  sin_marcar: "Sin marcar",
};

const CRIT_LABEL: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  "media-alta": "Media-alta",
  alta: "Alta",
  critica: "Crítica",
  PENDIENTE: "Pendiente",
};

type SlideId =
  | "portada"
  | "timeline"
  | "tecnica"
  | "causas"
  | "porques"
  | "acciones"
  | "cierre";

const SLIDES: Array<{ id: SlideId; label: string; short: string }> = [
  { id: "portada", label: "Portada, info y resumen", short: "Portada" },
  { id: "timeline", label: "Línea de tiempo", short: "Timeline" },
  { id: "tecnica", label: "Descripción y clasificación", short: "Técnica" },
  { id: "causas", label: "Análisis de causa", short: "Causas" },
  { id: "porques", label: "Método 5 porqués", short: "5 porqués" },
  { id: "acciones", label: "Factores y acciones", short: "Acciones" },
  { id: "cierre", label: "Indicadores y cierre", short: "Cierre" },
];

function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function listToLines(items: string[]): string {
  return items.join("\n");
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>{children}</td>
    </tr>
  );
}

function MetaCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rca-meta-card">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );
}

function formatLongDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

function boolLabel(v: boolean | null | undefined): string {
  if (v == null) return "No confirmada";
  return v ? "Sí" : "No";
}

function withSyncedHours(event: RcaEventoFalla, hours: number | null): RcaEventoFalla {
  return {
    ...event,
    duracion_horas: hours,
    impacto: { ...event.impacto, disponibilidad_horas: hours },
    indicadores: { ...event.indicadores, horas_indisponibles: hours },
  };
}

function BulletView({ items }: { items: string[] }) {
  if (!items.length) return <p className="muted">Sin registros.</p>;
  return (
    <ul className="rca-bullets">
      {items.map((item, i) => (
        <li key={`${i}-${item.slice(0, 24)}`}>
          <UncertaintyText text={item} />
        </li>
      ))}
    </ul>
  );
}

function SlideShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rca-slide">
      <header className="rca-slide-head">
        <h4>{title}</h4>
      </header>
      <div className="rca-slide-body">{children}</div>
    </div>
  );
}

export function EditableEventDetail({
  event,
  onSave,
  onClose,
  onOpenRelated,
  extraActions,
  compact,
  startEditing = false,
}: Props) {
  const [draft, setDraft] = useState<RcaEventoFalla>(() => structuredClone(event));
  const [editing, setEditing] = useState(startEditing);
  const [savedFlash, setSavedFlash] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setDraft(structuredClone(event));
    setEditing(startEditing);
    setSavedFlash(false);
    setPage(0);
  }, [event, startEditing]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(event), [draft, event]);
  const warn = needsWarningBanner(draft);
  const slide = SLIDES[page];
  const total = SLIDES.length;

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (ev.key === "ArrowRight" || ev.key === "PageDown") {
        ev.preventDefault();
        setPage((p) => Math.min(total - 1, p + 1));
      } else if (ev.key === "ArrowLeft" || ev.key === "PageUp") {
        ev.preventDefault();
        setPage((p) => Math.max(0, p - 1));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [total]);

  const patch = <K extends keyof RcaEventoFalla>(key: K, value: RcaEventoFalla[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const setHours = (hours: number | null) => {
    setDraft((prev) => withSyncedHours(prev, hours));
  };

  const setCriticidad = (value: RcaCriticidad) => {
    setDraft((prev) => ({
      ...prev,
      criticidad: value,
      clasificacion: { ...prev.clasificacion, criticidad: value },
    }));
  };

  const handleSave = () => {
    const hours = draft.duracion_horas;
    const next = withSyncedHours(
      {
        ...draft,
        es_supuesto: draft.es_supuesto || draft.calidad_dato === "inferido",
        clasificacion: {
          ...draft.clasificacion,
          criticidad: draft.criticidad,
        },
      },
      hours,
    );
    onSave(next);
    setDraft(next);
    setEditing(false);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  };

  const cancelEdit = () => {
    setDraft(structuredClone(event));
    setEditing(false);
  };

  const updateCronologia = (index: number, partial: Partial<RcaCronologiaItem>) => {
    setDraft((prev) => ({
      ...prev,
      cronologia: prev.cronologia.map((item, i) => (i === index ? { ...item, ...partial } : item)),
    }));
  };

  const addCronologia = () => {
    setDraft((prev) => ({
      ...prev,
      cronologia: [...prev.cronologia, { hora: "—", evento: "", origen: "" }],
    }));
  };

  const removeCronologia = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      cronologia: prev.cronologia.filter((_, i) => i !== index),
    }));
  };

  const updatePorque = (index: number, partial: Partial<RcaCincoPorquesItem>) => {
    setDraft((prev) => ({
      ...prev,
      cinco_porques: prev.cinco_porques.map((item, i) =>
        i === index ? { ...item, ...partial } : item,
      ),
    }));
  };

  const addPorque = () => {
    setDraft((prev) => ({
      ...prev,
      cinco_porques: [
        ...prev.cinco_porques,
        { n: prev.cinco_porques.length + 1, pregunta: "", respuesta: "" },
      ],
    }));
  };

  const removePorque = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      cinco_porques: prev.cinco_porques
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, n: i + 1 })),
    }));
  };

  const equipoValue = Array.isArray(draft.equipo) ? draft.equipo.join(", ") : draft.equipo;

  const metaEdit = (
    <div className="table-wrap rca-report-table-wrap">
      <table className="rca-report-table rca-report-table--edit rca-report-table--meta">
        <tbody>
          <FieldRow label="Fecha">
            <input
              type="date"
              value={draft.fecha || ""}
              onChange={(e) => patch("fecha", e.target.value || null)}
            />
          </FieldRow>
          <FieldRow label="Hora">
            <input
              value={draft.hora || ""}
              onChange={(e) => patch("hora", e.target.value || null)}
              placeholder="HH:MM o —"
            />
          </FieldRow>
          <FieldRow label="Equipo">
            <input
              value={equipoValue}
              onChange={(e) => {
                const raw = e.target.value;
                const parts = raw.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean);
                patch("equipo", parts.length > 1 ? parts : raw);
              }}
            />
          </FieldRow>
          <FieldRow label="Sistema">
            <input
              value={draft.sistema || ""}
              onChange={(e) => patch("sistema", e.target.value || null)}
            />
          </FieldRow>
          <FieldRow label="Duración">
            <div className="rca-inline-unit">
              <input
                type="number"
                step="0.1"
                min={0}
                value={draft.duracion_horas ?? ""}
                onChange={(e) => setHours(e.target.value === "" ? null : Number(e.target.value))}
              />
              <span>h</span>
            </div>
          </FieldRow>
          <FieldRow label="Criticidad">
            <select
              value={draft.criticidad}
              onChange={(e) => setCriticidad(e.target.value as RcaCriticidad)}
            >
              {CRIT_OPTS.map((o) => (
                <option key={o} value={o}>
                  {CRIT_LABEL[o] ?? o}
                </option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Estado">
            <select
              value={draft.estado}
              onChange={(e) => patch("estado", e.target.value as RcaEstadoEvento)}
            >
              {ESTADO_OPTS.map((o) => (
                <option key={o} value={o}>
                  {ESTADO_LABEL[o] ?? o}
                </option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Calidad">
            <select
              value={draft.calidad_dato}
              onChange={(e) => patch("calidad_dato", e.target.value as RcaCalidadDato)}
            >
              {CALIDAD_OPTS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Responsable">
            <input
              value={draft.responsable || ""}
              onChange={(e) => patch("responsable", e.target.value || null)}
            />
          </FieldRow>
          <FieldRow label="Supuesto">
            <label className="rca-edit-check">
              <input
                type="checkbox"
                checked={draft.es_supuesto}
                onChange={(e) => patch("es_supuesto", e.target.checked)}
              />
              Inferido / no confirmado
            </label>
          </FieldRow>
        </tbody>
      </table>
    </div>
  );

  const metaView = (
    <div className="rca-meta-grid">
      <MetaCard label="Fecha">{formatLongDate(draft.fecha)}</MetaCard>
      <MetaCard label="Hora">{draft.hora || "—"}</MetaCard>
      <MetaCard label="Equipo">
        <UncertaintyText text={equipoValue || "—"} />
      </MetaCard>
      <MetaCard label="Duración">
        {draft.duracion_horas != null ? `${draft.duracion_horas} h` : "—"}
      </MetaCard>
      <MetaCard label="Estado">{ESTADO_LABEL[draft.estado] ?? draft.estado}</MetaCard>
      <MetaCard label="Criticidad">{CRIT_LABEL[draft.criticidad] ?? draft.criticidad}</MetaCard>
      <MetaCard label="Calidad">{draft.calidad_dato}</MetaCard>
      <MetaCard label="Responsable">{draft.responsable || "—"}</MetaCard>
      <div className="rca-meta-card rca-meta-card--wide">
        <span>Sistema</span>
        <strong>
          <UncertaintyText text={draft.sistema || "—"} />
        </strong>
      </div>
    </div>
  );

  let slideContent: ReactNode = null;

  if (slide.id === "portada") {
    slideContent = (
      <SlideShell title="1. Portada, información y resumen">
        <div className="rca-slide-cover">
          <p className="eyebrow">Ficha RCA · Costayaco</p>
          {editing ? (
            <label className="rca-report-title-input">
              <span className="sr-only">Título</span>
              <input
                value={draft.titulo}
                onChange={(e) => patch("titulo", e.target.value)}
                placeholder="Título del evento"
              />
            </label>
          ) : (
            <h2 className="rca-slide-cover-title">{draft.titulo}</h2>
          )}
          <p className="rca-slide-cover-id">
            <code>{draft.id}</code>
          </p>
          <div className="rca-report-badges" style={{ justifyContent: "flex-start" }}>
            <QualityBadge value={draft.calidad_dato} />
            <CriticalityBadge value={draft.criticidad} />
          </div>
          {warn ? (
            <div className="rca-warn-banner" role="status">
              <AlertTriangle size={18} />
              <div>
                <strong>
                  {draft.calidad_dato === "vacio"
                    ? "Registro vacío — pendiente de completar"
                    : draft.es_supuesto || draft.calidad_dato === "inferido"
                      ? "Análisis inferido / no confirmado"
                      : "Calidad de dato limitada"}
                </strong>
                <p>
                  Textos con <mark className="rca-mark rca-mark--supuesto">(SUPUESTO)</mark> o{" "}
                  <mark className="rca-mark rca-mark--pendiente">PENDIENTE</mark> no son hechos
                  confirmados.
                </p>
              </div>
            </div>
          ) : null}
          {editing ? metaEdit : metaView}
          <section className="rca-panel rca-slide-resumen">
            <h5 className="rca-slide-sub">Resumen ejecutivo</h5>
            {editing ? (
              <textarea
                rows={5}
                value={draft.resumen_ejecutivo}
                onChange={(e) => patch("resumen_ejecutivo", e.target.value)}
              />
            ) : (
              <p className="rca-prose rca-prose--lg">
                <UncertaintyText text={draft.resumen_ejecutivo || "—"} />
              </p>
            )}
          </section>
        </div>
      </SlideShell>
    );
  } else if (slide.id === "timeline") {
    slideContent = (
      <SlideShell title="2. Línea de tiempo">
        {editing ? (
          <>
            <div className="table-wrap rca-report-table-wrap">
              <table className="rca-report-table rca-report-table--edit">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Evento</th>
                    <th>Origen</th>
                    <th aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {draft.cronologia.map((item, i) => (
                    <tr key={`c-${i}`}>
                      <td>
                        <input
                          value={item.hora || ""}
                          onChange={(e) => updateCronologia(i, { hora: e.target.value || null })}
                        />
                      </td>
                      <td>
                        <input
                          value={item.evento}
                          onChange={(e) => updateCronologia(i, { evento: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          value={item.origen || ""}
                          onChange={(e) => updateCronologia(i, { origen: e.target.value || null })}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn ghost rca-icon-btn"
                          onClick={() => removeCronologia(i)}
                          aria-label="Eliminar fila"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="btn ghost rca-add-row" onClick={addCronologia}>
              <Plus size={14} /> Agregar hito
            </button>
          </>
        ) : (
          <Timeline items={draft.cronologia} />
        )}
      </SlideShell>
    );
  } else if (slide.id === "tecnica") {
    slideContent = (
      <SlideShell title="3. Descripción técnica y clasificación">
        <div className="rca-report-row">
          <section className="rca-panel">
            <h5 className="rca-slide-sub">Descripción técnica</h5>
            {editing ? (
              <textarea
                rows={8}
                value={draft.descripcion_tecnica}
                onChange={(e) => patch("descripcion_tecnica", e.target.value)}
              />
            ) : (
              <p className="rca-prose">
                <UncertaintyText text={draft.descripcion_tecnica || "—"} />
              </p>
            )}
          </section>
          <section className="rca-panel">
            <h5 className="rca-slide-sub">Clasificación</h5>
            <div className="table-wrap rca-report-table-wrap">
              <table className={`rca-report-table${editing ? " rca-report-table--edit" : ""}`}>
                <tbody>
                  <FieldRow label="Tipo">
                    {editing ? (
                      <input
                        value={draft.clasificacion.tipo || ""}
                        onChange={(e) =>
                          patch("clasificacion", {
                            ...draft.clasificacion,
                            tipo: e.target.value || null,
                          })
                        }
                      />
                    ) : (
                      <UncertaintyText text={draft.clasificacion.tipo || "—"} />
                    )}
                  </FieldRow>
                  <FieldRow label="Modo">
                    {editing ? (
                      <input
                        value={draft.clasificacion.modo_falla || ""}
                        onChange={(e) =>
                          patch("clasificacion", {
                            ...draft.clasificacion,
                            modo_falla: e.target.value || null,
                          })
                        }
                      />
                    ) : (
                      <UncertaintyText text={draft.clasificacion.modo_falla || "—"} />
                    )}
                  </FieldRow>
                  <FieldRow label="Componente">
                    {editing ? (
                      <input
                        value={draft.clasificacion.componente_afectado || ""}
                        onChange={(e) =>
                          patch("clasificacion", {
                            ...draft.clasificacion,
                            componente_afectado: e.target.value || null,
                          })
                        }
                      />
                    ) : (
                      <UncertaintyText text={draft.clasificacion.componente_afectado || "—"} />
                    )}
                  </FieldRow>
                  <FieldRow label="Repetitiva">
                    {editing ? (
                      <select
                        value={
                          draft.clasificacion.falla_repetitiva == null
                            ? ""
                            : draft.clasificacion.falla_repetitiva
                              ? "si"
                              : "no"
                        }
                        onChange={(e) => {
                          const v = e.target.value === "" ? null : e.target.value === "si";
                          patch("clasificacion", {
                            ...draft.clasificacion,
                            falla_repetitiva: v,
                          });
                          patch("indicadores", {
                            ...draft.indicadores,
                            falla_repetitiva: v,
                          });
                        }}
                      >
                        <option value="">No confirmada</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    ) : (
                      boolLabel(draft.clasificacion.falla_repetitiva)
                    )}
                  </FieldRow>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </SlideShell>
    );
  } else if (slide.id === "causas") {
    slideContent = (
      <SlideShell title="4. Análisis de causa">
        {editing ? (
          <div className="rca-report-cause rca-report-cause--edit">
            <label>
              <strong>Inmediata</strong>
              <textarea
                rows={3}
                value={draft.causa.inmediata || ""}
                onChange={(e) =>
                  patch("causa", { ...draft.causa, inmediata: e.target.value || null })
                }
              />
            </label>
            <label>
              <strong>Básica</strong>
              <textarea
                rows={3}
                value={draft.causa.basica || ""}
                onChange={(e) =>
                  patch("causa", { ...draft.causa, basica: e.target.value || null })
                }
              />
            </label>
            <label>
              <strong>Raíz</strong>
              <textarea
                rows={4}
                value={draft.causa.raiz || ""}
                onChange={(e) => patch("causa", { ...draft.causa, raiz: e.target.value || null })}
              />
            </label>
          </div>
        ) : (
          <div className="rca-report-cause rca-cause-stack-slide">
            <article className="rca-cause-card">
              <h5>Inmediata</h5>
              <p>
                <UncertaintyText text={draft.causa.inmediata || "—"} />
              </p>
            </article>
            <article className="rca-cause-card">
              <h5>Básica</h5>
              <p>
                <UncertaintyText text={draft.causa.basica || "—"} />
              </p>
            </article>
            <article className="rca-cause-card rca-cause-card--root">
              <h5>Raíz</h5>
              <p>
                <UncertaintyText text={draft.causa.raiz || "—"} />
              </p>
            </article>
          </div>
        )}
      </SlideShell>
    );
  } else if (slide.id === "porques") {
    slideContent = (
      <SlideShell title="5. Método — 5 porqués">
        {editing ? (
          <>
            <div className="table-wrap rca-report-table-wrap">
              <table className="rca-report-table rca-report-table--edit">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Pregunta</th>
                    <th>Respuesta</th>
                    <th aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {draft.cinco_porques.map((row, i) => (
                    <tr key={`w-${row.n}-${i}`}>
                      <td>{row.n}</td>
                      <td>
                        <input
                          value={row.pregunta}
                          onChange={(e) => updatePorque(i, { pregunta: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          value={row.respuesta}
                          onChange={(e) => updatePorque(i, { respuesta: e.target.value })}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn ghost rca-icon-btn"
                          onClick={() => removePorque(i)}
                          aria-label="Eliminar porqué"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="btn ghost rca-add-row" onClick={addPorque}>
              <Plus size={14} /> Agregar porqué
            </button>
          </>
        ) : (
          <FiveWhysTable rows={draft.cinco_porques} />
        )}
      </SlideShell>
    );
  } else if (slide.id === "acciones") {
    slideContent = (
      <SlideShell title="6. Factores contribuyentes y acciones">
        <div className="rca-report-row">
          <section className="rca-panel">
            <h5 className="rca-slide-sub">Factores contribuyentes</h5>
            {editing ? (
              <textarea
                rows={8}
                placeholder="Uno por línea"
                value={listToLines(draft.factores_contribuyentes)}
                onChange={(e) => patch("factores_contribuyentes", linesToList(e.target.value))}
              />
            ) : (
              <BulletView items={draft.factores_contribuyentes} />
            )}
          </section>
          <section className="rca-panel">
            <h5 className="rca-slide-sub">Acciones</h5>
            {editing ? (
              <div className="rca-report-cause rca-report-cause--edit">
                <label>
                  <strong>Correctivas</strong>
                  <textarea
                    rows={4}
                    placeholder="Una por línea"
                    value={listToLines(draft.acciones_correctivas)}
                    onChange={(e) => patch("acciones_correctivas", linesToList(e.target.value))}
                  />
                </label>
                <label>
                  <strong>Preventivas</strong>
                  <textarea
                    rows={4}
                    placeholder="Una por línea"
                    value={listToLines(draft.acciones_preventivas)}
                    onChange={(e) => patch("acciones_preventivas", linesToList(e.target.value))}
                  />
                </label>
              </div>
            ) : (
              <div className="rca-actions-split rca-actions-split--stack">
                <div>
                  <h5>Correctivas</h5>
                  <BulletView items={draft.acciones_correctivas} />
                </div>
                <div>
                  <h5>Preventivas</h5>
                  <BulletView items={draft.acciones_preventivas} />
                </div>
              </div>
            )}
          </section>
        </div>
      </SlideShell>
    );
  } else {
    slideContent = (
      <SlideShell title="7. Indicadores, validación y lecciones">
        <div className="rca-report-row">
          <section className="rca-panel">
            <h5 className="rca-slide-sub">Indicadores</h5>
            <div className="rca-kpi-strip">
              <div>
                <span>Horas FS</span>
                <strong>{draft.duracion_horas != null ? `${draft.duracion_horas} h` : "—"}</strong>
              </div>
              <div>
                <span>Energía</span>
                <strong>
                  {editing ? (
                    <input
                      value={
                        draft.indicadores.energia_no_generada == null
                          ? ""
                          : String(draft.indicadores.energia_no_generada)
                      }
                      onChange={(e) => {
                        const raw = e.target.value;
                        const asNum = Number(raw.replace(/[^\d.-]/g, ""));
                        const energia =
                          raw.trim() === ""
                            ? null
                            : Number.isFinite(asNum) && String(asNum) === raw.trim()
                              ? asNum
                              : raw;
                        patch("indicadores", {
                          ...draft.indicadores,
                          energia_no_generada: energia,
                        });
                        if (typeof energia === "number") {
                          patch("impacto", {
                            ...draft.impacto,
                            energia_no_generada_kwh: energia,
                          });
                        }
                      }}
                      placeholder="kWh"
                    />
                  ) : (
                    <UncertaintyText
                      text={String(draft.indicadores.energia_no_generada ?? "—")}
                    />
                  )}
                </strong>
              </div>
              <div>
                <span>Repetitiva</span>
                <strong>{boolLabel(draft.clasificacion.falla_repetitiva)}</strong>
              </div>
            </div>
            {editing ? (
              <label className="rca-notes-label">
                <strong>Riesgo operación</strong>
                <input
                  value={draft.impacto.riesgo_operacion || ""}
                  onChange={(e) =>
                    patch("impacto", {
                      ...draft.impacto,
                      riesgo_operacion: e.target.value || null,
                    })
                  }
                />
              </label>
            ) : draft.impacto.riesgo_operacion ? (
              <p className="rca-prose" style={{ marginTop: "0.55rem" }}>
                <strong>Riesgo:</strong>{" "}
                <UncertaintyText text={draft.impacto.riesgo_operacion} />
              </p>
            ) : null}
          </section>
          <section className="rca-panel">
            <h5 className="rca-slide-sub">Validación</h5>
            {editing ? (
              <textarea
                rows={4}
                value={draft.validacion || ""}
                onChange={(e) => patch("validacion", e.target.value || null)}
              />
            ) : (
              <p className="rca-prose">
                <UncertaintyText text={draft.validacion || "—"} />
              </p>
            )}
          </section>
        </div>
        <div className="rca-report-row" style={{ marginTop: "0.85rem" }}>
          <section className="rca-panel">
            <h5 className="rca-slide-sub">Lecciones aprendidas</h5>
            {editing ? (
              <textarea
                rows={4}
                placeholder="Una por línea"
                value={listToLines(draft.lecciones_aprendidas)}
                onChange={(e) => patch("lecciones_aprendidas", linesToList(e.target.value))}
              />
            ) : (
              <BulletView items={draft.lecciones_aprendidas} />
            )}
            {editing ? (
              <label className="rca-notes-label">
                <strong>Notas pendientes</strong>
                <textarea
                  rows={2}
                  placeholder="Una por línea"
                  value={listToLines(draft.notas_pendientes)}
                  onChange={(e) => patch("notas_pendientes", linesToList(e.target.value))}
                />
              </label>
            ) : draft.notas_pendientes.length > 0 ? (
              <aside className="rca-report-note" role="note">
                <strong>Nota:</strong>{" "}
                {draft.notas_pendientes.map((n, i) => (
                  <span key={`${i}-${n.slice(0, 20)}`}>
                    {i > 0 ? " " : ""}
                    <UncertaintyText text={n} />
                  </span>
                ))}
              </aside>
            ) : null}
          </section>
          {onOpenRelated ? (
            <section className="rca-panel">
              <h5 className="rca-slide-sub">Eventos relacionados</h5>
              {editing ? (
                <label className="rca-notes-label">
                  <span className="muted">IDs (uno por línea)</span>
                  <textarea
                    rows={3}
                    value={listToLines(draft.relacionados)}
                    onChange={(e) => patch("relacionados", linesToList(e.target.value))}
                  />
                </label>
              ) : null}
              {draft.relacionados.length > 0 ? (
                <RelatedLinks ids={draft.relacionados} onOpen={onOpenRelated} />
              ) : !editing ? (
                <p className="muted">Sin eventos relacionados.</p>
              ) : null}
            </section>
          ) : null}
        </div>
      </SlideShell>
    );
  }

  return (
    <article
      className={`rca-report rca-report--slides${editing ? " rca-report--editable" : " rca-report--view"}${
        compact ? " rca-report--compact" : ""
      }`}
    >
      <header className="rca-report-head rca-report-head--slim">
        <div className="rca-report-head-main">
          <p className="eyebrow" style={{ margin: 0 }}>
            {draft.id}
          </p>
          <p className="rca-slide-current-label">{slide.label}</p>
        </div>
        <div className="rca-report-head-side">
          <div className="rca-edit-toolbar-right rca-toolbar">
            {savedFlash ? <span className="rca-saved-flash">Guardado</span> : null}
            {editing && dirty ? (
              <span className="badge warn" style={{ fontSize: "0.72rem" }}>
                Sin guardar
              </span>
            ) : null}
            {extraActions}
            {editing ? (
              <>
                <button type="button" className="btn ghost" onClick={cancelEdit}>
                  Cancelar
                </button>
                <button type="button" className="btn primary" disabled={!dirty} onClick={handleSave}>
                  <Save size={14} /> Guardar
                </button>
              </>
            ) : (
              <button type="button" className="btn primary" onClick={() => setEditing(true)}>
                <Pencil size={14} /> Editar
              </button>
            )}
            {onClose ? (
              <button type="button" className="btn ghost" onClick={onClose}>
                <X size={14} /> Cerrar
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="rca-slide-stage" key={slide.id}>
        {slideContent}
      </div>

      <nav className="rca-pager" aria-label="Paginación de la ficha RCA">
        <button
          type="button"
          className="rca-pager-nav"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          <ChevronLeft size={18} />
          <span>Anterior</span>
        </button>

        <div className="rca-pager-center">
          <div className="rca-pager-progress" aria-hidden>
            <div style={{ width: `${((page + 1) / total) * 100}%` }} />
          </div>
          <div className="rca-pager-dots" role="tablist">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === page}
                aria-label={`${s.short} (${i + 1}/${total})`}
                title={s.label}
                className={`rca-pager-dot${i === page ? " active" : ""}`}
                onClick={() => setPage(i)}
              >
                <span>{i + 1}</span>
                <small>{s.short}</small>
              </button>
            ))}
          </div>
          <p className="rca-pager-count">
            {page + 1} / {total}
          </p>
        </div>

        <button
          type="button"
          className="rca-pager-nav"
          disabled={page >= total - 1}
          onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
        >
          <span>Siguiente</span>
          <ChevronRight size={18} />
        </button>
      </nav>
    </article>
  );
}
