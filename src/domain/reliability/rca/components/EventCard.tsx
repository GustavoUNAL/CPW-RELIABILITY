import { ChevronRight } from "lucide-react";
import { equipoLabel, shortRcaEventId } from "../data";
import type { RcaEventoFalla } from "../types";
import { CriticalityBadge } from "./CriticalityBadge";
import { QualityBadge } from "./QualityBadge";

const ESTADO_LABEL: Record<string, string> = {
  abierto: "Abierto",
  en_seguimiento: "En seguimiento",
  cerrado: "Cerrado",
  sin_marcar: "Sin marcar",
};

type Props = {
  event: RcaEventoFalla;
  onOpen: (id: string) => void;
};

export function EventCard({ event, onOpen }: Props) {
  return (
    <button type="button" className="rca-event-card" onClick={() => onOpen(event.id)}>
      <div className="rca-event-card-top">
        <code title={event.id}>{shortRcaEventId(event.id)}</code>
        <QualityBadge value={event.calidad_dato} />
      </div>
      <h3>{event.titulo}</h3>
      <div className="rca-event-card-meta">
        <span>{event.fecha || "Sin fecha"}</span>
        <span>{equipoLabel(event.equipo)}</span>
        <span>{ESTADO_LABEL[event.estado] ?? event.estado}</span>
        <CriticalityBadge value={event.criticidad} />
      </div>
      <p className="rca-event-card-sys">{event.sistema || "—"}</p>
      <span className="rca-event-card-go">
        Abrir ficha <ChevronRight size={14} />
      </span>
    </button>
  );
}
