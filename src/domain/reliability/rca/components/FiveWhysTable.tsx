import type { RcaCincoPorquesItem } from "../types";
import { UncertaintyText } from "../uncertainty";

export function FiveWhysTable({ rows }: { rows: RcaCincoPorquesItem[] }) {
  if (!rows.length) {
    return <p className="muted">Sin análisis de 5 porqués.</p>;
  }

  return (
    <div className="table-wrap rca-five-wrap">
      <table className="rca-five-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Pregunta</th>
            <th>Respuesta</th>
          </tr>
        </thead>
        <tbody>
          {[...rows]
            .sort((a, b) => a.n - b.n)
            .map((row) => (
              <tr key={row.n}>
                <td>{row.n}</td>
                <td>
                  <UncertaintyText text={row.pregunta} />
                </td>
                <td>
                  <UncertaintyText text={row.respuesta} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
