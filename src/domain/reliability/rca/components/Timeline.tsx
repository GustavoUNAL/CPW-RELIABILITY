import type { RcaCronologiaItem } from "../types";
import { UncertaintyText } from "../uncertainty";

export function Timeline({ items }: { items: RcaCronologiaItem[] }) {
  if (!items.length) {
    return <p className="muted">Sin cronología documentada.</p>;
  }

  return (
    <ol className="rca-timeline">
      {items.map((item, idx) => (
        <li key={`${item.hora ?? "x"}-${idx}`} className="rca-timeline-item">
          <div className="rca-timeline-rail" aria-hidden />
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
