import { Link2 } from "lucide-react";
import { findRcaEventoById, shortRcaEventId } from "../data";

type Props = {
  ids: string[];
  onOpen: (id: string) => void;
};

export function RelatedLinks({ ids, onOpen }: Props) {
  if (!ids.length) {
    return <p className="muted rca-empty-inline">Sin eventos relacionados.</p>;
  }

  return (
    <ul className="rca-related">
      {ids.map((id) => {
        const ev = findRcaEventoById(id);
        return (
          <li key={id}>
            <button type="button" className="rca-related-link" onClick={() => onOpen(id)}>
              <Link2 size={14} />
              <span>
                <strong title={id}>{shortRcaEventId(id)}</strong>
                {ev ? <em>{ev.titulo}</em> : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
