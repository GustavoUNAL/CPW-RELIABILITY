import { AlertTriangle, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { equipoLabel } from "../data";
import type { RcaEventoFalla } from "../types";
import { needsWarningBanner, UncertaintyText } from "../uncertainty";
import { CriticalityBadge } from "./CriticalityBadge";
import { FiveWhysTable } from "./FiveWhysTable";
import { QualityBadge } from "./QualityBadge";
import { RelatedLinks } from "./RelatedLinks";
import { Timeline } from "./Timeline";

const ESTADO_LABEL: Record<string, string> = {
  abierto: "Abierto",
  en_seguimiento: "En seguimiento",
  cerrado: "Cerrado",
  sin_marcar: "Sin marcar",
};

type Props = {
  event: RcaEventoFalla;
  onBack: () => void;
  onOpenRelated: (id: string) => void;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rca-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
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

export function EventDetail({ event, onBack, onOpenRelated }: Props) {
  const warn = needsWarningBanner(event);

  return (
    <article className="rca-detail">
      <header className="rca-detail-head">
        <button type="button" className="btn ghost" onClick={onBack}>
          <ArrowLeft size={16} /> Volver a la lista
        </button>
        <div className="rca-detail-title-row">
          <div>
            <p className="eyebrow">
              <code>{event.id}</code> · {event.fuente}
            </p>
            <h2>{event.titulo}</h2>
          </div>
          <div className="rca-detail-badges">
            <QualityBadge value={event.calidad_dato} />
            <CriticalityBadge value={event.criticidad} />
          </div>
        </div>
        <div className="rca-detail-kpis">
          <div>
            <span>Fecha</span>
            <strong>
              {event.fecha || "—"}
              {event.hora ? ` · ${event.hora}` : ""}
            </strong>
          </div>
          <div>
            <span>Equipo</span>
            <strong>
              <UncertaintyText text={equipoLabel(event.equipo)} />
            </strong>
          </div>
          <div>
            <span>Sistema</span>
            <strong>
              <UncertaintyText text={event.sistema} />
            </strong>
          </div>
          <div>
            <span>Estado</span>
            <strong>{ESTADO_LABEL[event.estado] ?? event.estado}</strong>
          </div>
          <div>
            <span>Duración</span>
            <strong>{event.duracion_horas != null ? `${event.duracion_horas} h` : "—"}</strong>
          </div>
          <div>
            <span>Responsable</span>
            <strong>{event.responsable || "—"}</strong>
          </div>
        </div>
      </header>

      {warn ? (
        <div className="rca-warn-banner" role="status">
          <AlertTriangle size={18} />
          <div>
            <strong>
              {event.calidad_dato === "vacio"
                ? "Registro vacío — estructura pendiente de completar"
                : event.es_supuesto || event.calidad_dato === "inferido"
                  ? "Análisis inferido / no confirmado"
                  : "Calidad de dato limitada"}
            </strong>
            <p>
              Los textos marcados como <mark className="rca-mark rca-mark--supuesto">(SUPUESTO)</mark> o{" "}
              <mark className="rca-mark rca-mark--pendiente">PENDIENTE</mark> no deben tratarse como hechos
              confirmados. Requieren validación en campo o fuente documental.
            </p>
          </div>
        </div>
      ) : null}

      <Section title="Resumen ejecutivo">
        <p className="rca-prose">
          <UncertaintyText text={event.resumen_ejecutivo} />
        </p>
      </Section>

      <Section title="Cronología">
        <Timeline items={event.cronologia} />
      </Section>

      <Section title="Descripción técnica">
        <p className="rca-prose">
          <UncertaintyText text={event.descripcion_tecnica} />
        </p>
      </Section>

      <Section title="Clasificación">
        <div className="rca-grid-2">
          <div>
            <span className="muted">Tipo</span>
            <p>
              <UncertaintyText text={event.clasificacion.tipo} />
            </p>
          </div>
          <div>
            <span className="muted">Modo de falla</span>
            <p>
              <UncertaintyText text={event.clasificacion.modo_falla} />
            </p>
          </div>
          <div>
            <span className="muted">Componente afectado</span>
            <p>
              <UncertaintyText text={event.clasificacion.componente_afectado} />
            </p>
          </div>
          <div>
            <span className="muted">Criticidad (clasif.)</span>
            <p>
              <UncertaintyText text={event.clasificacion.criticidad} />
            </p>
          </div>
          <div>
            <span className="muted">Falla repetitiva</span>
            <p>
              {event.clasificacion.falla_repetitiva == null
                ? "—"
                : event.clasificacion.falla_repetitiva
                  ? "Sí"
                  : "No"}
            </p>
          </div>
        </div>
      </Section>

      <Section title="Causas">
        <div className="rca-cause-stack">
          <article>
            <h4>Inmediata</h4>
            <p>
              <UncertaintyText text={event.causa.inmediata} />
            </p>
          </article>
          <article>
            <h4>Básica</h4>
            <p>
              <UncertaintyText text={event.causa.basica} />
            </p>
          </article>
          <article>
            <h4>Raíz</h4>
            <p>
              <UncertaintyText text={event.causa.raiz} />
            </p>
          </article>
        </div>
      </Section>

      <Section title="5 porqués">
        <FiveWhysTable rows={event.cinco_porques} />
      </Section>

      <div className="rca-two-col">
        <Section title="Factores contribuyentes">
          <BulletList items={event.factores_contribuyentes} />
        </Section>
        <Section title="Notas pendientes">
          <BulletList items={event.notas_pendientes} />
        </Section>
      </div>

      <div className="rca-two-col">
        <Section title="Acciones correctivas">
          <BulletList items={event.acciones_correctivas} />
        </Section>
        <Section title="Acciones preventivas">
          <BulletList items={event.acciones_preventivas} />
        </Section>
      </div>

      <Section title="Impacto">
        <div className="rca-grid-3">
          <div>
            <span className="muted">Disponibilidad (h)</span>
            <strong>
              {event.impacto.disponibilidad_horas != null ? event.impacto.disponibilidad_horas : "—"}
            </strong>
          </div>
          <div>
            <span className="muted">Energía no generada (kWh)</span>
            <strong>
              {event.impacto.energia_no_generada_kwh != null
                ? event.impacto.energia_no_generada_kwh.toLocaleString("es-CO")
                : "—"}
            </strong>
          </div>
          <div>
            <span className="muted">Riesgo operación</span>
            <strong>
              <UncertaintyText text={event.impacto.riesgo_operacion} />
            </strong>
          </div>
        </div>
      </Section>

      <Section title="Validación">
        <p className="rca-prose">
          <UncertaintyText text={event.validacion} />
        </p>
      </Section>

      <Section title="Lecciones aprendidas">
        <BulletList items={event.lecciones_aprendidas} />
      </Section>

      <Section title="Indicadores">
        <div className="rca-grid-3">
          <div>
            <span className="muted">Horas indisponibles</span>
            <strong>
              <UncertaintyText text={String(event.indicadores.horas_indisponibles ?? "—")} />
            </strong>
          </div>
          <div>
            <span className="muted">Energía no generada</span>
            <strong>
              <UncertaintyText text={String(event.indicadores.energia_no_generada ?? "—")} />
            </strong>
          </div>
          <div>
            <span className="muted">Falla repetitiva</span>
            <strong>
              {event.indicadores.falla_repetitiva == null
                ? "—"
                : event.indicadores.falla_repetitiva
                  ? "Sí"
                  : "No"}
            </strong>
          </div>
        </div>
      </Section>

      <Section title="Eventos relacionados">
        <RelatedLinks ids={event.relacionados} onOpen={onOpenRelated} />
      </Section>
    </article>
  );
}
