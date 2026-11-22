import type { RcaCronologiaItem } from "../types";
import { UncertaintyText } from "../uncertainty";

type Props = {
  items: RcaCronologiaItem[];
  /** Vertical (default) or compact horizontal for cover/resumen slides */
  variant?: "vertical" | "horizontal";
};

export function Timeline({ items, variant = "vertical" }: Props) {
  if (!items.length) {
    return <p className="muted">Sin cronología documentada.</p>;
  }

  const horizontal = variant === "horizontal";

  return (
    <ol className={`rca-timeline${horizontal ? " rca-timeline--horizontal" : ""}`}>
      {items.map((item, idx) => (
        <li key={`${item.hora ?? "x"}-${idx}`} className="rca-timeline-item">
          <div className="rca-timeline-marker" aria-hidden>
            <span className="rca-timeline-step">{String(idx + 1).padStart(2, "0")}</span>
            <span className="rca-timeline-rail" />
          </div>
          <div className="rca-timeline-body">
            <div className="rca-timeline-meta">
              <time>{item.hora || "—"}</time>
              {item.origen ? <span className="rca-timeline-origen">{item.origen}</span> : null}
            </div>
            <p>
              <UncertaintyText text={item.evento} />
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
