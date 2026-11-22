import { FailureCalendar } from "./FailureCalendar";
import { NOVEMBER_FAILURES, type NovemberField } from "./novemberFailures";

type View = "copower" | "gte" | "dual" | "fallas" | "repetitivos" | "badactors";

type Props = {
  view: View;
  month: string;
  monthLabel: string;
};

function fieldsFor(view: View): NovemberField[] {
  if (view === "copower") return ["costayaco"];
  if (view === "gte") return ["pad4"];
  return ["costayaco", "pad4"];
}

export function NovemberRecords({ view, month, monthLabel }: Props) {
  const fields = fieldsFor(view);
  const allowFieldSwitch = fields.length > 1;

  if (view === "repetitivos" || view === "badactors") {
    const rows = NOVEMBER_FAILURES.filter((row) => fields.includes(row.field));
    const machineHits = new Map<string, number>();
    for (const row of rows) {
      for (const unit of row.units) {
        machineHits.set(unit, (machineHits.get(unit) ?? 0) + 1);
      }
    }
    const ranked = [...machineHits.entries()].sort((a, b) => b[1] - a[1]);
    return (
      <div className="hist-page">
        <header className="card section-head">
          <div>
            <p className="hist-kicker">{monthLabel}</p>
            <h2>{view === "repetitivos" ? "Repetidos en noviembre" : "Quién más aparece"}</h2>
          </div>
        </header>
        <p className="card">
          {view === "repetitivos"
            ? "G-801 entra en los 6 reportes de Pad 4. En Costayaco, CPW06 aparece el 1, el 9 y el 19."
            : "G-801 es la máquina que más se repite en noviembre. En Costayaco, CPW06 es la que más vuelve a salir."}
        </p>
        <section className="card">
          <ol className="fail-cal-units">
            {ranked.slice(0, 8).map(([unit, count]) => (
              <li key={unit}>
                <strong>{unit}</strong>
                <span>
                  {count} evento{count === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ol>
        </section>
        <FailureCalendar
          fields={fields}
          month={month}
          monthLabel={monthLabel}
          allowFieldSwitch={allowFieldSwitch}
          title={view === "repetitivos" ? "Calendario · repetidos" : "Calendario · malos actores"}
        />
      </div>
    );
  }

  return (
    <FailureCalendar
      fields={fields}
      month={month}
      monthLabel={monthLabel}
      allowFieldSwitch={allowFieldSwitch}
      title={
        view === "copower"
          ? "Calendario de fallas · Costayaco"
          : view === "gte"
            ? "Calendario de fallas · Pad 4"
            : "Calendario de fallas"
      }
    />
  );
}
