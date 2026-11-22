import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { NovemberField } from "./novemberFailures";
import {
  failureCalendarDays,
  fmtHours,
  quantifiedNovember,
  reliabilitySnapshot,
  type QuantifiedFailure,
} from "./failureMetrics";

type Props = {
  fields: NovemberField[];
  month: string;
  monthLabel: string;
  title?: string;
  allowFieldSwitch?: boolean;
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const MONTH_INDEX: Record<string, number> = {
  Ene: 0,
  Feb: 1,
  Mar: 2,
  Abr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Ago: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dic: 11,
};

const FIELD_OPTIONS: { id: "all" | NovemberField; label: string }[] = [
  { id: "all", label: "Todos los campos" },
  { id: "costayaco", label: "Costayaco" },
  { id: "pad4", label: "Pad 4" },
];

function dayNumber(iso: string) {
  return Number(iso.slice(8, 10));
}

function fieldLabel(field: NovemberField) {
  return field === "costayaco" ? "Costayaco" : "Pad 4";
}

function blameTone(blame: QuantifiedFailure["blame"]) {
  if (blame === "copower") return "copower";
  if (blame === "externa") return "externa";
  if (blame === "mixta") return "mixta";
  return "pendiente";
}

function dayTone(hours: number, events: QuantifiedFailure[]) {
  if (!events.length) return "ok";
  if (events.some((e) => e.blame === "copower") || hours >= 8) return "risk";
  if (events.some((e) => e.blame === "mixta") || hours >= 1) return "warn";
  return "soft";
}

function buildGrid(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const mondayOffset = (first.getDay() + 6) % 7;
  const cells: ({ day: number; iso: string } | null)[] = [];
  for (let i = 0; i < mondayOffset; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, iso });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function paragraphs(text: string) {
  return text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function FailureCalendar({
  fields,
  month,
  monthLabel,
  title = "Calendario de fallas",
  allowFieldSwitch = false,
}: Props) {
  const monthIndex = MONTH_INDEX[month] ?? 10;
  const hasFoData = month === "Nov";
  const fieldsKey = fields.join(",");
  const [fieldFilter, setFieldFilter] = useState<"all" | NovemberField>(
    fields.length === 1 ? fields[0] : "all",
  );

  useEffect(() => {
    setFieldFilter(fields.length === 1 ? fields[0] : "all");
  }, [fieldsKey, fields]);

  const activeFields = useMemo<NovemberField[]>(() => {
    if (!allowFieldSwitch || fieldFilter === "all") return fields;
    return fields.includes(fieldFilter) ? [fieldFilter] : fields;
  }, [allowFieldSwitch, fieldFilter, fields]);

  const events = useMemo(
    () => (hasFoData ? quantifiedNovember(activeFields) : []),
    [activeFields, hasFoData],
  );
  const byDay = useMemo(() => failureCalendarDays(events), [events]);
  const snap = useMemo(() => reliabilitySnapshot(events), [events]);
  const cells = useMemo(() => buildGrid(2026, monthIndex), [monthIndex]);

  const [detailDay, setDetailDay] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const dayEvents = detailDay ? byDay.get(detailDay) ?? [] : [];
  const selected = dayEvents.find((e) => e.id === selectedId) ?? dayEvents[0] ?? null;

  const openDay = (iso: string) => {
    const list = byDay.get(iso);
    if (!list?.length) return;
    setDetailDay(iso);
    setSelectedId(list[0].id);
  };

  const closeDetail = () => {
    setDetailDay(null);
    setSelectedId(null);
  };

  useEffect(() => {
    if (!detailDay) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") closeDetail();
    };
    document.addEventListener("keydown", onKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => document.removeEventListener("keydown", onKey);
  }, [detailDay]);

  const fieldSwitchOptions = FIELD_OPTIONS.filter(
    (opt) => opt.id === "all" || fields.includes(opt.id),
  );

  if (detailDay && selected) {
    return (
      <FailureFullScreen
        event={selected}
        dayEvents={dayEvents}
        monthLabel={monthLabel}
        onSelect={setSelectedId}
        onBack={closeDetail}
      />
    );
  }

  return (
    <div className="fail-cal">
      <header className="card section-head fail-cal-head">
        <div>
          <p className="hist-kicker">{monthLabel} · FO-GE-033</p>
          <h2>{title}</h2>
          <p className="muted">
            Pulse un día con falla para abrir el análisis completo a pantalla completa: causa raíz,
            imputación y horas fuera de línea.
          </p>
        </div>
        {allowFieldSwitch && fieldSwitchOptions.length > 1 ? (
          <div className="fail-cal-field-switch" role="tablist" aria-label="Campo">
            {fieldSwitchOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={fieldFilter === opt.id}
                className={fieldFilter === opt.id ? "active" : undefined}
                onClick={() => setFieldFilter(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="fail-cal-field-pill">{activeFields.map(fieldLabel).join(" · ")}</p>
        )}
      </header>

      <dl className="hist-stats fail-cal-kpis">
        <div>
          <dt>Eventos FO</dt>
          <dd>{snap.events}</dd>
        </div>
        <div>
          <dt>Horas fuera</dt>
          <dd>{fmtHours(snap.downtimeHours)}</dd>
        </div>
        <div>
          <dt>Imputables COPOWER</dt>
          <dd>{fmtHours(snap.copowerHours)}</dd>
        </div>
        <div>
          <dt>Externas</dt>
          <dd>{fmtHours(snap.externalHours)}</dd>
        </div>
      </dl>

      {!hasFoData ? (
        <section className="card fail-cal-empty">
          <h3>Sin FO-GE-033 cargados para {monthLabel}</h3>
          <p className="muted">
            El calendario cuantificado de causa raíz y horas fuera de línea está disponible para noviembre
            (mes abierto). Elija <strong>Noviembre</strong> en la línea de tiempo, o revise la bitácora del
            mes cerrado en Análisis.
          </p>
        </section>
      ) : null}

      <section className="card fail-cal-board">
        <div className="fail-cal-legend" aria-hidden>
          <span className="fail-cal-chip fail-cal-chip--ok">Sin falla</span>
          <span className="fail-cal-chip fail-cal-chip--soft">FO leve</span>
          <span className="fail-cal-chip fail-cal-chip--warn">FO medio</span>
          <span className="fail-cal-chip fail-cal-chip--risk">FO alto / COPOWER</span>
          <span className="fail-cal-legend-sum">
            {snap.events} FO · {fmtHours(snap.downtimeHours)} fuera
          </span>
        </div>

        <div className="fail-cal-weekdays" aria-hidden>
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="fail-cal-grid" role="grid" aria-label={`Calendario ${monthLabel}`}>
          {cells.map((cell, index) => {
            if (!cell) return <div key={`b-${index}`} className="fail-cal-day blank" />;
            const list = byDay.get(cell.iso) ?? [];
            const hours = list.reduce((sum, e) => sum + e.downtimeHours, 0);
            const tone = dayTone(hours, list);
            return (
              <button
                key={cell.iso}
                type="button"
                className={["fail-cal-day", `fail-cal-day--${tone}`].join(" ")}
                disabled={!list.length}
                onClick={() => openDay(cell.iso)}
              >
                <strong>{cell.day}</strong>
                {list.length ? (
                  <>
                    <span>{list.length} FO</span>
                    <em>{fmtHours(hours)}</em>
                  </>
                ) : (
                  <span>OK</span>
                )}
              </button>
            );
          })}
        </div>

        <ul className="fail-cal-daylist">
          {[...byDay.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([iso, list]) => (
              <li key={iso}>
                <button type="button" onClick={() => openDay(iso)}>
                  <strong>Día {dayNumber(iso)}</strong>
                  <span>
                    {`${list.length} ${list.length === 1 ? "evento" : "eventos"} · ${fmtHours(
                      list.reduce((s, e) => s + e.downtimeHours, 0),
                    )}`}
                  </span>
                </button>
              </li>
            ))}
          {!byDay.size && hasFoData ? (
            <li className="muted">No hay fallas en el filtro de campo actual.</li>
          ) : null}
        </ul>
      </section>

      <section className="card fail-cal-analysis">
        <h3>Indicadores del campo · {monthLabel}</h3>
        <p>
          Horas imputables a COPOWER: <strong>{fmtHours(snap.copowerHours)}</strong>. Externas:{" "}
          <strong>{fmtHours(snap.externalHours)}</strong>. La confiabilidad contractual usa FO imputables: R% ≈
          (Tcal − FO) / Tcal. Este tablero cuantifica el FO del mes; no inventa el cierre de disponibilidad.
        </p>
        <div className="fail-cal-split">
          <div>
            <h4>Máquinas con más horas fuera</h4>
            <ol>
              {snap.machines.slice(0, 6).map((row) => (
                <li key={row.unit}>
                  <strong>{row.unit}</strong>
                  <span>{fmtHours(row.hours)}</span>
                </li>
              ))}
              {!snap.machines.length ? <li>Sin horas por máquina cuantificadas.</li> : null}
            </ol>
          </div>
          <div>
            <h4>Causas raíz por horas</h4>
            <ol>
              {snap.causes.slice(0, 5).map((row) => (
                <li key={row.label}>
                  <strong>
                    {row.count}× · {fmtHours(row.hours)}
                  </strong>
                  <span>{row.label}</span>
                </li>
              ))}
              {!snap.causes.length ? <li>Sin causas raíz en este filtro.</li> : null}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

function FailureFullScreen({
  event,
  dayEvents,
  monthLabel,
  onSelect,
  onBack,
}: {
  event: QuantifiedFailure;
  dayEvents: QuantifiedFailure[];
  monthLabel: string;
  onSelect: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="fail-cal fail-cal-screen" aria-live="polite">
      <header className="card section-head fail-cal-screen-head">
        <div className="fail-cal-screen-top">
          <button type="button" className="fail-cal-back" onClick={onBack}>
            <ArrowLeft size={16} />
            Volver al calendario
          </button>
          <p className="hist-kicker">
            {monthLabel} · FO-GE-033 {event.rf} · {fieldLabel(event.field)}
          </p>
        </div>
        <h2>{event.units.length ? event.units.join(" · ") : "Parque"}</h2>
        <p className="fail-cal-title">{event.title}</p>
        <p className="muted fail-cal-file">{event.file}</p>
      </header>

      {dayEvents.length > 1 ? (
        <div className="fail-cal-siblings fail-cal-siblings--screen">
          {dayEvents.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === event.id ? "active" : undefined}
              onClick={() => onSelect(item.id)}
            >
              {item.rf} · {item.units.join(", ") || "Parque"} · {fmtHours(item.downtimeHours)}
            </button>
          ))}
        </div>
      ) : null}

      <dl className="hist-stats fail-cal-kpis">
        <div>
          <dt>Fuera de línea</dt>
          <dd>{fmtHours(event.downtimeHours)}</dd>
        </div>
        <div>
          <dt>Imputación</dt>
          <dd>
            <span className={`fail-cal-blame fail-cal-blame--${blameTone(event.blame)}`}>
              {event.blameLabel}
            </span>
          </dd>
        </div>
        <div>
          <dt>Salida</dt>
          <dd>{event.startHint ?? "—"}</dd>
        </div>
        <div>
          <dt>Ingreso</dt>
          <dd>{event.endHint ?? "—"}</dd>
        </div>
      </dl>

      <div className="fail-cal-screen-grid">
        <section className="card fail-cal-screen-block">
          <h3>Resumen para indicadores</h3>
          <h4>Causa inmediata</h4>
          <p>{event.immediateCause}</p>
          <h4>Causa raíz</h4>
          <p>{event.rootCause}</p>
          {event.unitHours.length ? (
            <>
              <h4>Tiempo fuera por máquina</h4>
              <ul className="fail-cal-units">
                {event.unitHours.map((row) => (
                  <li key={row.unit}>
                    <strong>{row.unit}</strong>
                    <span>{fmtHours(row.hours)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <p className="muted">
            Para confiabilidad contractual solo cuentan horas imputables a COPOWER. Este FO aporta{" "}
            <strong>{fmtHours(event.downtimeHours)}</strong> al FO del día {event.day}.
          </p>
        </section>

        <section className="card fail-cal-screen-block">
          <h3>Proceso y contexto</h3>
          <h4>Proceso</h4>
          <p>{event.proceso || "—"}</p>
          <h4>Antecedentes</h4>
          {paragraphs(event.antecedentes).map((p, i) => (
            <p key={`a-${i}`}>{p}</p>
          ))}
          {!event.antecedentes ? <p className="muted">Sin antecedentes en el FO.</p> : null}
        </section>

        <section className="card fail-cal-screen-block fail-cal-screen-block--wide">
          <h3>Qué pasó</h3>
          {paragraphs(event.descripcion).map((p, i) => (
            <p key={`d-${i}`}>{p}</p>
          ))}
        </section>

        <section className="card fail-cal-screen-block fail-cal-screen-block--wide">
          <h3>Análisis completo del FO</h3>
          {paragraphs(event.analisis).map((p, i) => (
            <p key={`an-${i}`}>{p}</p>
          ))}
        </section>

        <section className="card fail-cal-screen-block">
          <h3>Qué se hizo</h3>
          {paragraphs(event.acciones).map((p, i) => (
            <p key={`ac-${i}`}>{p}</p>
          ))}
          {!event.acciones ? <p className="muted">Sin acciones registradas.</p> : null}
          <h4>Partes / materiales</h4>
          {paragraphs(event.partes).map((p, i) => (
            <p key={`pa-${i}`}>{p}</p>
          ))}
          {!event.partes ? <p className="muted">Sin partes registradas.</p> : null}
        </section>

        <section className="card fail-cal-screen-block">
          <h3>Pruebas y mejora</h3>
          <h4>Pruebas / verificación</h4>
          {paragraphs(event.pruebas).map((p, i) => (
            <p key={`pr-${i}`}>{p}</p>
          ))}
          {!event.pruebas ? <p className="muted">Sin pruebas registradas.</p> : null}
          <h4>Acción de mejora</h4>
          {paragraphs(event.mejora).map((p, i) => (
            <p key={`m-${i}`}>{p}</p>
          ))}
          {!event.mejora ? <p className="muted">Sin acción de mejora.</p> : null}
        </section>

        <section className="card fail-cal-screen-block fail-cal-screen-block--wide">
          <h3>Observaciones de tiempo fuera de línea</h3>
          {paragraphs(event.observaciones).map((p, i) => (
            <p key={`o-${i}`}>{p}</p>
          ))}
          {!event.observaciones ? <p className="muted">Sin observaciones de tiempo.</p> : null}
          {event.field === "pad4" && event.day === "2026-11-12" ? (
            <p className="fo-report-link">
              <a href="/parques/pad4">Ver la secuencia completa en Pad 4</a>
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
