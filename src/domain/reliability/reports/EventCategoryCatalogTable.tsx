import type { EventCategoryCatalogRow } from "../events/eventCategories";

type Props = {
  rows: EventCategoryCatalogRow[];
  totalEvents: number;
  title?: string;
  subtitle?: string;
};

export function EventCategoryCatalogTable({
  rows,
  totalEvents,
  title = "Clasificación por categoría",
  subtitle,
}: Props) {
  return (
    <section className="ev-category-section" aria-label="Catálogo de categorías de eventos">
      <header className="ev-category-head">
        <div>
          <h3>{title}</h3>
          <p className="muted">
            {subtitle ??
              `${totalEvents} evento(s) clasificado(s) · ${rows.length} categorías del catálogo`}
          </p>
        </div>
      </header>
      <div className="table-wrap ev-category-table-wrap">
        <table className="ev-category-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Categoría</th>
              <th className="ev-col-num">Eventos</th>
              <th className="ev-col-num">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((cat) => (
              <tr key={cat.code} className={cat.count === 0 ? "ev-cat-row--empty" : undefined}>
                <td>
                  <strong>{cat.code}</strong>
                </td>
                <td>{cat.label}</td>
                <td className="ev-col-num">{cat.count}</td>
                <td className="ev-col-num">{cat.share.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
