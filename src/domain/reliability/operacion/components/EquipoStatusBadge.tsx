import { ESTADO_COLOR, ESTADO_LABEL } from "../constants";
import type { DisponibilidadEstado } from "../types";

export function EquipoStatusBadge({ estado }: { estado: DisponibilidadEstado }) {
  const color = ESTADO_COLOR[estado];
  return (
    <span
      className="badge op-status-badge"
      style={{
        background: `color-mix(in oklab, ${color} 18%, var(--panel-soft))`,
        color,
      }}
    >
      {ESTADO_LABEL[estado]}
    </span>
  );
}
