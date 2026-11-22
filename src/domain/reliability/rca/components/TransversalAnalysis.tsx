import { Network, ShieldAlert } from "lucide-react";
import { findRcaEventoById } from "../data";
import type { RcaAnalisisTransversal } from "../types";
import { QualityBadge } from "./QualityBadge";

type Props = {
  analysis: RcaAnalisisTransversal;
  onOpenEvent: (id: string) => void;
};

export function TransversalAnalysis({ analysis, onOpenEvent }: Props) {
  return (
    <div className="rca-transversal">
      <section className="rca-section">
        <div className="rca-section-head">
          <Network size={18} />
          <h3>Patrones recurrentes</h3>
        </div>
        <div className="rca-pattern-grid">
          {analysis.patrones_recurrentes.map((p) => (
            <article key={p.patron} className="rca-pattern-card">
              <h4>{p.patron}</h4>
              {p.unidades_afectadas?.length ? (
                <p className="muted">
                  Unidades: {p.unidades_afectadas.join(" · ")}
                </p>
              ) : null}
              {p.nota ? <p className="rca-prose">{p.nota}</p> : null}
              <ul className="rca-pattern-events">
                {p.eventos.map((id) => {
                  const ev = findRcaEventoById(id);
                  return (
                    <li key={id}>
                      <button type="button" className="rca-related-link" onClick={() => onOpenEvent(id)}>
                        <strong>{id}</strong>
                        {ev ? (
                          <>
                            <em>{ev.titulo}</em>
                            <QualityBadge value={ev.calidad_dato} />
                          </>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rca-section">
        <div className="rca-section-head">
          <ShieldAlert size={18} />
          <h3>Problemas de calidad de registro</h3>
        </div>
        <ul className="rca-bullets rca-quality-issues">
          {analysis.problemas_calidad_registro.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
