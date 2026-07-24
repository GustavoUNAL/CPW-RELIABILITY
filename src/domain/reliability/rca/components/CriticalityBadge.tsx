import type { RcaCriticidad } from "../types";

const META: Record<
  string,
  { label: string; color: string }
> = {
  baja: { label: "Baja", color: "#64748b" },
  media: { label: "Media", color: "#ca8a04" },
  "media-alta": { label: "Media-alta", color: "#ea580c" },
  alta: { label: "Alta", color: "#dc2626" },
  critica: { label: "Crítica", color: "#7f1d1d" },
  PENDIENTE: { label: "Pendiente", color: "#94a3b8" },
};

export function CriticalityBadge({ value }: { value: RcaCriticidad | string | null }) {
  const key = value ?? "PENDIENTE";
  const meta = META[key] ?? META.PENDIENTE;
  return (
    <span
      className="rca-crit-badge"
      style={{
        background: `color-mix(in oklab, ${meta.color} 18%, var(--panel-soft))`,
        color: meta.color,
        borderColor: `color-mix(in oklab, ${meta.color} 35%, transparent)`,
      }}
    >
      {meta.label}
    </span>
  );
}
