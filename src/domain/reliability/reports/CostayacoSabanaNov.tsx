import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { COSTAYACO_SABANA_NOV, type SabanaDay } from "./costayacoSabanaNov2026";

const PDF_HREF = "/costayaco/sabana-nov-2026/Planeacion_Semanal_Costayaco_16-22_Nov_2026.pdf";
const pack = COSTAYACO_SABANA_NOV;

function fmtDay(iso: string) {
  const [, , d] = iso.split("-");
  return Number(d);
}

function fmtHours(value: number | null | undefined) {
  if (value == null) return "—";
  return `${value}`.replace(".", ",");
}

export function CostayacoSabanaNov() {
  const [equipment, setEquipment] = useState<string>("Todas");
  const [selectedDay, setSelectedDay] = useState<string | null>(pack.weekPlan.start);
  const [jobId, setJobId] = useState(pack.weekPlan.jobs[0]?.equipment ?? "");

  const job = pack.weekPlan.jobs.find((item) => item.equipment === jobId) ?? pack.weekPlan.jobs[0];

  const filteredDays = useMemo(() => {
    if (equipment === "Todas") return pack.days;
    return pack.days
      .map((day) => ({
        ...day,
        slots: day.slots.filter((slot) => slot.equipment === equipment),
      }))
      .filter((day) => day.slots.length > 0);
  }, [equipment]);

  const selected: SabanaDay | null =
    selectedDay == null ? null : (pack.days.find((day) => day.date === selectedDay) ?? null);

  const chartData = pack.equipmentStats.map((item) => ({
    name: item.equipment.replace("JINAN", "J"),
    full: item.equipment,
    count: item.count,
    hours: item.hoursMto,
    hh: item.manHours,
  }));

  return (
    <div className="sab-app">
      <div className="sab-toolbar">
        <dl className="sab-kpi-row" aria-label="Resumen de noviembre">
          <div className="sab-kpi">
            <dt>MTO</dt>
            <dd>{pack.programmedCount}</dd>
          </div>
          <div className="sab-kpi">
            <dt>Horas</dt>
            <dd>{fmtHours(pack.plannedHoursMto)} h</dd>
          </div>
          <div className="sab-kpi">
            <dt>H-H</dt>
            <dd>{fmtHours(pack.plannedManHours)} h</dd>
          </div>
          <div className="sab-kpi">
            <dt>Semana</dt>
            <dd>16–22</dd>
          </div>
        </dl>
        <a className="sab-pdf" href={PDF_HREF} download>
          <Download size={14} />
          PDF
        </a>
      </div>

      <section className="card sab-panel">
        <div className="sab-filters" role="tablist" aria-label="Filtro por máquina">
          <button
            type="button"
            role="tab"
            aria-selected={equipment === "Todas"}
            className={equipment === "Todas" ? "active" : undefined}
            onClick={() => setEquipment("Todas")}
          >
            Todas
          </button>
          {pack.equipmentStats.map((item) => (
            <button
              key={item.equipment}
              type="button"
              role="tab"
              aria-selected={equipment === item.equipment}
              className={equipment === item.equipment ? "active" : undefined}
              onClick={() => setEquipment(item.equipment)}
            >
              {item.equipment}
            </button>
          ))}
        </div>

        <p className="sab-hint">Toque un día para ver la carga programada</p>

        <div className="sab-calendar" aria-label="Días de noviembre">
          {pack.days.map((day) => {
            const visible =
              equipment === "Todas"
                ? day.slots
                : day.slots.filter((slot) => slot.equipment === equipment);
            const busy = visible.length > 0;
            const inWeek = day.date >= pack.weekPlan.start && day.date <= pack.weekPlan.end;
            return (
              <button
                key={day.date}
                type="button"
                className={`sab-day${busy ? " is-busy" : ""}${inWeek ? " is-week" : ""}${
                  selectedDay === day.date ? " active" : ""
                }`}
                data-count={busy ? String(visible.length) : undefined}
                onClick={() => setSelectedDay(day.date)}
              >
                <span className="sab-day-num">{fmtDay(day.date)}</span>
                <span className="sab-day-week">{day.weekday.slice(0, 3)}</span>
                {busy ? (
                  <>
                    <span className="sab-day-count">{visible.length} MTO</span>
                    <span className="sab-day-slots">
                      {visible.map((slot) => (
                        <em key={`${day.date}-${slot.equipment}`}>
                          {slot.equipment} · {fmtHours(slot.hoursMto)} h
                        </em>
                      ))}
                    </span>
                  </>
                ) : (
                  <span className="sab-day-empty">—</span>
                )}
              </button>
            );
          })}
        </div>

        {selected ? (
          <aside className="sab-day-detail" aria-live="polite">
            <p className="eyebrow">
              {selected.weekday} {fmtDay(selected.date)} nov
            </p>
            {selected.slots.length ? (
              <ul>
                {selected.slots.map((slot) => (
                  <li key={`${selected.date}-${slot.equipment}`}>
                    <strong>{slot.equipment}</strong>
                    <span>
                      {fmtHours(slot.hoursMto)} h · {fmtHours(slot.manHours)} h-h
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Sin MTO ese día.</p>
            )}
          </aside>
        ) : null}

        {filteredDays.length === 0 ? (
          <p className="sab-empty">No hay días con esa máquina en noviembre.</p>
        ) : null}

        <details className="park-more">
          <summary>Carga por máquina</summary>
          <div className="park-more-body sab-chart" aria-label="Carga por máquina">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={28} allowDecimals={false} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "hours" ? `${value} h MTO` : name === "hh" ? `${value} h-h` : value,
                    name === "hours"
                      ? "Horas MTO"
                      : name === "hh"
                        ? "Horas-hombre"
                        : "Intervenciones",
                  ]}
                  labelFormatter={(_, payload) => {
                    const full = (payload?.[0]?.payload as { full?: string } | undefined)?.full;
                    return full ?? "";
                  }}
                />
                <Bar
                  dataKey="count"
                  name="count"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(data) => {
                    const full = (data as { full?: string } | undefined)?.full;
                    if (full) setEquipment(full);
                  }}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.full}
                      fill={
                        equipment === entry.full || equipment === "Todas" ? "#409eff" : "#94a3b8"
                      }
                      opacity={equipment === "Todas" || equipment === entry.full ? 1 : 0.35}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </details>
      </section>

      <details className="park-more sab-week-more">
        <summary>
          Semana 16–22 · {pack.weekPlan.jobs.map((j) => j.equipment).join(" · ")}
        </summary>
        <div className="park-more-body card sab-week">
          <div className="sab-filters" role="tablist" aria-label="Trabajo de la semana">
            {pack.weekPlan.jobs.map((item) => (
              <button
                key={item.equipment}
                type="button"
                role="tab"
                aria-selected={jobId === item.equipment}
                className={jobId === item.equipment ? "active" : undefined}
                onClick={() => setJobId(item.equipment)}
              >
                {item.equipment}-{item.code}
              </button>
            ))}
          </div>

          {job ? (
            <div className="sab-week-body">
              <div className="sab-week-main">
                <p className="sab-week-fuel">{job.fuel}</p>
                <h4>Actividades · {job.equipment}-{job.code}</h4>
                <ul className="sab-task-list">
                  {job.tasks.map((task) => (
                    <li
                      key={task.text}
                      className={`sab-task sab-task--${task.priority.toLowerCase()}`}
                    >
                      <span>{task.priority}</span>
                      <p>{task.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <aside className="sab-week-side">
                <div>
                  <h4>Herramientas</h4>
                  <ul>
                    {job.tools.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Generación disponible</h4>
                  <div className="sab-avail">
                    {job.available.map((unit) => (
                      <span key={unit}>{unit}</span>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          ) : null}

          <p className="sab-note">{pack.weekPlan.note}</p>
        </div>
      </details>
    </div>
  );
}
