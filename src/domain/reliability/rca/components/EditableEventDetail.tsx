import { AlertTriangle, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { equipoLabel } from "../data";
import type {
  RcaCalidadDato,
  RcaCriticidad,
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
  compact?: boolean;
};

const ESTADO_OPTS: RcaEstadoEvento[] = ["abierto", "en_seguimiento", "cerrado", "sin_marcar"];
const CALIDAD_OPTS: RcaCalidadDato[] = ["completo", "parcial", "inferido", "vacio"];
const CRIT_OPTS: RcaCriticidad[] = ["baja", "media", "media-alta", "alta", "critica", "PENDIENTE"];

function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function listToLines(items: string[]): string {
  return items.join("\n");
}

export function EditableEventDetail({ event, onSave, onClose, onOpenRelated, compact }: Props) {
  const [draft, setDraft] = useState<RcaEventoFalla>(() => structuredClone(event));
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setDraft(structuredClone(event));
    setSavedFlash(false);
  }, [event]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(event), [draft, event]);
  const warn = needsWarningBanner(draft);

  const patch = <K extends keyof RcaEventoFalla>(key: K, value: RcaEventoFalla[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const next: RcaEventoFalla = {
      ...draft,
      es_supuesto: draft.es_supuesto || draft.calidad_dato === "inferido",
    };
    onSave(next);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  };

  return (
    <article className={`rca-detail rca-detail--editable${compact ? " rca-detail--compact" : ""}`}>
      <header className="rca-detail-head">
        <div className="rca-edit-toolbar">
          {onClose ? (
            <button type="button" className="btn ghost" onClick={onClose}>
              <X size={14} /> Cerrar
            </button>
          ) : null}
          <div className="rca-edit-toolbar-right">
            {savedFlash ? <span className="rca-saved-flash">Guardado</span> : null}
            {dirty ? <span className="muted">Cambios sin guardar</span> : null}
            <button type="button" className="btn primary" disabled={!dirty} onClick={handleSave}>
              <Save size={14} /> Guardar ficha RCA
            </button>
          </div>
        </div>

        <div className="rca-detail-title-row">
          <div className="rca-edit-title-fields">
            <label>
              ID
              <input value={draft.id} disabled />
            </label>
            <label className="rca-edit-grow">
              Título
              <input value={draft.titulo} onChange={(e) => patch("titulo", e.target.value)} />
            </label>
          </div>
          <div className="rca-detail-badges">
            <QualityBadge value={draft.calidad_dato} />
            <CriticalityBadge value={draft.criticidad} />
          </div>
        </div>

        <div className="rca-edit-meta-grid">
          <label>
            Fecha
            <input
              type="date"
              value={draft.fecha || ""}
              onChange={(e) => patch("fecha", e.target.value || null)}
            />
          </label>
          <label>
            Hora
            <input value={draft.hora || ""} onChange={(e) => patch("hora", e.target.value || null)} />
          </label>
          <label>
            Equipo(s)
            <input
              value={Array.isArray(draft.equipo) ? draft.equipo.join(", ") : draft.equipo}
              onChange={(e) => {
                const raw = e.target.value;
                const parts = raw.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean);
                patch("equipo", parts.length > 1 ? parts : raw);
              }}
            />
          </label>
          <label>
            Sistema
            <input
              value={draft.sistema || ""}
              onChange={(e) => patch("sistema", e.target.value || null)}
            />
          </label>
          <label>
            Estado
            <select
              value={draft.estado}
              onChange={(e) => patch("estado", e.target.value as RcaEstadoEvento)}
            >
              {ESTADO_OPTS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label>
            Criticidad
            <select
              value={draft.criticidad}
              onChange={(e) => patch("criticidad", e.target.value as RcaCriticidad)}
            >
              {CRIT_OPTS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label>
            Calidad dato
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
          </label>
          <label className="rca-edit-check">
            <input
              type="checkbox"
              checked={draft.es_supuesto}
              onChange={(e) => patch("es_supuesto", e.target.checked)}
            />
            Análisis supuesto / inferido
          </label>
          <label>
            Duración (h)
            <input
              type="number"
              step="0.1"
              value={draft.duracion_horas ?? ""}
              onChange={(e) =>
                patch("duracion_horas", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </label>
          <label className="rca-edit-grow">
            Responsable
            <input
              value={draft.responsable || ""}
              onChange={(e) => patch("responsable", e.target.value || null)}
            />
          </label>
        </div>
      </header>

      {warn ? (
        <div className="rca-warn-banner" role="status">
          <AlertTriangle size={18} />
          <div>
            <strong>Ficha con incertidumbre</strong>
            <p>
              Textos <mark className="rca-mark rca-mark--supuesto">(SUPUESTO)</mark> /{" "}
              <mark className="rca-mark rca-mark--pendiente">PENDIENTE</mark> no son hechos confirmados.
              Equipo actual: {equipoLabel(draft.equipo)}.
            </p>
          </div>
        </div>
      ) : null}

      <section className="rca-section">
        <h3>Resumen ejecutivo</h3>
        <textarea
          rows={4}
          value={draft.resumen_ejecutivo}
          onChange={(e) => patch("resumen_ejecutivo", e.target.value)}
        />
      </section>

      <section className="rca-section">
        <h3>Descripción técnica</h3>
        <textarea
          rows={5}
          value={draft.descripcion_tecnica}
          onChange={(e) => patch("descripcion_tecnica", e.target.value)}
        />
      </section>

      <section className="rca-section">
        <h3>Causas</h3>
        <div className="rca-cause-stack">
          <label>
            Inmediata
            <textarea
              rows={2}
              value={draft.causa.inmediata || ""}
              onChange={(e) =>
                patch("causa", { ...draft.causa, inmediata: e.target.value || null })
              }
            />
          </label>
          <label>
            Básica
            <textarea
              rows={2}
              value={draft.causa.basica || ""}
              onChange={(e) => patch("causa", { ...draft.causa, basica: e.target.value || null })}
            />
          </label>
          <label>
            Raíz
            <textarea
              rows={2}
              value={draft.causa.raiz || ""}
              onChange={(e) => patch("causa", { ...draft.causa, raiz: e.target.value || null })}
            />
          </label>
        </div>
      </section>

      <div className="rca-two-col">
        <section className="rca-section">
          <h3>Acciones correctivas (una por línea)</h3>
          <textarea
            rows={4}
            value={listToLines(draft.acciones_correctivas)}
            onChange={(e) => patch("acciones_correctivas", linesToList(e.target.value))}
          />
        </section>
        <section className="rca-section">
          <h3>Acciones preventivas (una por línea)</h3>
          <textarea
            rows={4}
            value={listToLines(draft.acciones_preventivas)}
            onChange={(e) => patch("acciones_preventivas", linesToList(e.target.value))}
          />
        </section>
      </div>

      <div className="rca-two-col">
        <section className="rca-section">
          <h3>Factores contribuyentes</h3>
          <textarea
            rows={3}
            value={listToLines(draft.factores_contribuyentes)}
            onChange={(e) => patch("factores_contribuyentes", linesToList(e.target.value))}
          />
        </section>
        <section className="rca-section">
          <h3>Notas pendientes</h3>
          <textarea
            rows={3}
            value={listToLines(draft.notas_pendientes)}
            onChange={(e) => patch("notas_pendientes", linesToList(e.target.value))}
          />
        </section>
      </div>

      <section className="rca-section">
        <h3>Validación</h3>
        <textarea
          rows={2}
          value={draft.validacion || ""}
          onChange={(e) => patch("validacion", e.target.value || null)}
        />
      </section>

      <section className="rca-section">
        <h3>Lecciones aprendidas</h3>
        <textarea
          rows={3}
          value={listToLines(draft.lecciones_aprendidas)}
          onChange={(e) => patch("lecciones_aprendidas", linesToList(e.target.value))}
        />
      </section>

      <section className="rca-section">
        <h3>Cronología (solo lectura en esta vista)</h3>
        <Timeline items={draft.cronologia} />
        <p className="muted" style={{ marginTop: "0.45rem", fontSize: "0.75rem" }}>
          Vista: <UncertaintyText text={draft.resumen_ejecutivo.slice(0, 80)} />…
        </p>
      </section>

      <section className="rca-section">
        <h3>5 porqués (solo lectura)</h3>
        <FiveWhysTable rows={draft.cinco_porques} />
      </section>

      {onOpenRelated ? (
        <section className="rca-section">
          <h3>Relacionados</h3>
          <RelatedLinks ids={draft.relacionados} onOpen={onOpenRelated} />
        </section>
      ) : null}
    </article>
  );
}
