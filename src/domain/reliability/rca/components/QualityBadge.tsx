import type { RcaCalidadDato } from "../types";
import { RCA_COSTAYACO_PACK } from "../data";

const TONE: Record<RcaCalidadDato, { label: string; className: string }> = {
  completo: { label: "Completo", className: "rca-qbadge rca-qbadge--completo" },
  parcial: { label: "Parcial", className: "rca-qbadge rca-qbadge--parcial" },
  inferido: { label: "Inferido", className: "rca-qbadge rca-qbadge--inferido" },
  vacio: { label: "Vacío", className: "rca-qbadge rca-qbadge--vacio" },
};

export function QualityBadge({ value }: { value: RcaCalidadDato }) {
  const meta = TONE[value] ?? TONE.vacio;
  const tip = RCA_COSTAYACO_PACK.meta.leyenda_calidad_dato[value];
  return (
    <span className={meta.className} title={tip}>
      {meta.label}
    </span>
  );
}
