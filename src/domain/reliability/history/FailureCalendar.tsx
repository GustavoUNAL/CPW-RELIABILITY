import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CostayacoReliabilityMap } from "./CostayacoReliabilityMap";
import type { NovemberField } from "./novemberFailures";
import {
  ORIGIN_SHORT,
  clipListText,
  compactHours as compactHoursLabel,
  failureCalendarDays,
  fmtHours,
  quantifiedNovember,
  reliabilitySnapshot,
  type FailureOrigin,
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

function originTone(origin: FailureOrigin) {
  return origin;
}

function dayTone(hours: number, events: QuantifiedFailure[]) {
  if (!events.length) return "ok";
  if (events.some((e) => e.origin === "copower") || hours >= 8) return "risk";
  if (events.some((e) => e.origin === "mru" || e.blame === "mixta") || hours >= 1) return "warn";
  return "soft";
}

type OriginFilter = "all" | "copower" | "mru" | "external";

function matchesOriginFilter(event: QuantifiedFailure, filter: OriginFilter) {
  if (filter === "all") return true;
  if (filter === "copower") return event.origin === "copower";
  if (filter === "mru") return event.origin === "mru";
  return event.origin === "red" || event.origin === "sin" || event.origin === "gas" || event.origin === "otro";
}

function originFilterFromNode(origin: FailureOrigin | null): OriginFilter {
  if (!origin) return "all";
  if (origin === "copower") return "copower";
  if (origin === "mru") return "mru";
  return "external";
}

function focusOriginFromFilter(filter: OriginFilter): FailureOrigin | null {
  if (filter === "copower") return "copower";
  if (filter === "mru") return "mru";
  return null;
}

function eventMachinesLine(event: QuantifiedFailure) {
  if (event.units.length) return event.units.slice(0, 4).join(" · ");
  return "Parque";
}

function countForFilter(events: QuantifiedFailure[], filter: OriginFilter) {
  return events.filter((e) => matchesOriginFilter(e, filter)).length;
}

function hoursForFilter(events: QuantifiedFailure[], filter: OriginFilter) {
  return events
    .filter((e) => matchesOriginFilter(e, filter))
    .reduce((sum, e) => sum + e.downtimeHours, 0);
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

  const costayacoOnly = activeFields.length === 1 && activeFields[0] === "costayaco";
  const [originFilter, setOriginFilter] = useState<OriginFilter>("all");

  useEffect(() => {
    setOriginFilter("all");
  }, [fieldsKey]);

  const allEvents = useMemo(
    () => (hasFoData ? quantifiedNovember(activeFields) : []),
    [activeFields, hasFoData],
  );
  const events = useMemo(
    () =>
      costayacoOnly ? allEvents.filter((e) => matchesOriginFilter(e, originFilter)) : allEvents,
    [allEvents, costayacoOnly, originFilter],
  );
  const byDay = useMemo(() => failureCalendarDays(events), [events]);
  const byDayAll = useMemo(() => failureCalendarDays(allEvents), [allEvents]);
  const snap = useMemo(() => reliabilitySnapshot(events), [events]);
  const snapAll = useMemo(() => reliabilitySnapshot(allEvents), [allEvents]);
  const cells = useMemo(() => buildGrid(2026, monthIndex), [monthIndex]);

  const [detailDay, setDetailDay] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const dayEvents = detailDay ? (byDayAll.get(detailDay) ?? byDay.get(detailDay) ?? []) : [];
  const selected = dayEvents.find((e) => e.id === selectedId) ?? dayEvents[0] ?? null;

  const openDay = (iso: string, eventId?: string) => {
    const list = byDayAll.get(iso) ?? byDay.get(iso);
    if (!list?.length) return;
    setDetailDay(iso);
    setSelectedId(eventId && list.some((e) => e.id === eventId) ? eventId : list[0].id);
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

  const timeline = useMemo(
    () =>
      [...events].sort(
        (a, b) => a.day.localeCompare(b.day) || b.downtimeHours - a.downtimeHours,
      ),
    [events],
  );

  const filterHint =
    originFilter === "copower"
      ? "Solo fallas propias del activo COPOWER"
      : originFilter === "mru"
        ? "Solo cascadas por salida de la MRU"
        : originFilter === "external"
          ? "Red del campo, SIN o gas/combustión"
          : "Toque una FO para ver el análisis completo";

  return (
    <div className={`fail-cal${costayacoOnly ? " fail-cal--cyc" : ""}`}>
      <header className="fail-cal-lead">
        <div>
          <p className="hist-kicker">{monthLabel}</p>
          <h2>{costayacoOnly ? "Fallas del mes" : title.replace("Calendario de fallas · ", "FO · ")}</h2>
          {costayacoOnly && hasFoData ? (
            <p className="fail-cal-lead-sum">
              <strong>{snapAll.events} FO</strong>
              {" · "}
              {fmtHours(snapAll.downtimeHours)} fuera
              {" · "}
              <span className="fail-cal-lead-own">{compactHoursLabel(snapAll.ownHours)} propias</span>
              {" / "}
              <span className="fail-cal-lead-mru">{compactHoursLabel(snapAll.mruHours)} MRU</span>
            </p>
          ) : (
            <p className="muted fail-cal-lead-sum">
              {hasFoData
                ? `${snap.events} FO · ${fmtHours(snap.downtimeHours)} fuera de línea`
                : `Sin FO cuantificados en ${monthLabel}`}
            </p>
          )}
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
        ) : activeFields.length > 1 ? (
          <p className="fail-cal-field-pill">{activeFields.map(fieldLabel).join(" · ")}</p>
        ) : null}
      </header>

      {costayacoOnly && hasFoData ? (
        <div className="fail-cal-buckets" role="tablist" aria-label="Filtrar por origen">
          {(
            [
              {
                id: "all" as const,
                label: "Todas",
                hint: "Mes completo",
              },
              {
                id: "copower" as const,
                label: "Propias",
                hint: "Activo COPOWER",
              },
              {
                id: "mru" as const,
                label: "MRU",
                hint: "Gas tratado",
              },
              {
                id: "external" as const,
                label: "Externas",
                hint: "Red · SIN · gas",
              },
            ] as const
          ).map((opt) => {
            const count = countForFilter(allEvents, opt.id);
            const hours = hoursForFilter(allEvents, opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={originFilter === opt.id}
                className={[
                  "fail-cal-bucket",
                  `fail-cal-bucket--${opt.id}`,
                  originFilter === opt.id ? "active" : "",
                ].join(" ")}
                onClick={() => setOriginFilter(opt.id)}
              >
                <span className="fail-cal-bucket-label">{opt.label}</span>
                <strong>{opt.id === "all" ? snapAll.events : count}</strong>
                <em>{compactHoursLabel(opt.id === "all" ? snapAll.downtimeHours : hours)}</em>
                <span className="fail-cal-bucket-hint">{opt.hint}</span>
              </button>
            );
          })}
        </div>
      ) : !costayacoOnly && hasFoData ? (
        <dl className="hist-stats fail-cal-kpis">
          <div>
            <dt>FO</dt>
            <dd>{snap.events}</dd>
          </div>
          <div>
            <dt>Fuera</dt>
            <dd title={fmtHours(snap.downtimeHours)}>{compactHoursLabel(snap.downtimeHours)}</dd>
          </div>
          <div>
            <dt>Imput.</dt>
            <dd title={fmtHours(snap.copowerHours)}>{compactHoursLabel(snap.copowerHours)}</dd>
          </div>
          <div>
            <dt>Ext.</dt>
            <dd title={fmtHours(snap.externalHours)}>{compactHoursLabel(snap.externalHours)}</dd>
          </div>
        </dl>
      ) : null}

      {!hasFoData ? (
        <section className="card fail-cal-empty">
          <h3>Sin FO-GE-033 cargados para {monthLabel}</h3>
          <p className="muted">
            El calendario cuantificado está disponible para noviembre. Elija{" "}
            <strong>Noviembre</strong> en la línea de tiempo.
          </p>
        </section>
      ) : null}

      {hasFoData ? (
        <section className="fail-cal-timeline" aria-label="Lista de fallas">
          <header className="fail-cal-timeline-head">
            <h3>
              {timeline.length} {timeline.length === 1 ? "falla" : "fallas"}
            </h3>
            <p className="muted">{costayacoOnly ? filterHint : "Toque para ver causa e imputación"}</p>
          </header>
          <ul className="fail-cal-fo-list">
            {timeline.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  className={`fail-cal-fo fail-cal-fo--${originTone(event.origin)}`}
                  onClick={() => openDay(event.day, event.id)}
                >
                  <span className="fail-cal-fo-top">
                    <span className="fail-cal-fo-daynum">{dayNumber(event.day)}</span>
                    <span className={`fail-cal-origin fail-cal-origin--${event.origin}`}>
                      {ORIGIN_SHORT[event.origin]}
                    </span>
                    <span className="fail-cal-fo-rf">{event.rf}</span>
                    <span className="fail-cal-fo-hours">{compactHoursLabel(event.downtimeHours)}</span>
                  </span>
                  <strong className="fail-cal-fo-machines">{eventMachinesLine(event)}</strong>
                  <span className="fail-cal-fo-cause" title={event.immediateCause}>
                    {clipListText(event.immediateCause || event.rootCause || event.title, 58)}
                  </span>
                </button>
              </li>
            ))}
            {!timeline.length ? (
              <li className="fail-cal-fo-empty muted">No hay FO en este filtro.</li>
            ) : null}
          </ul>
        </section>
      ) : null}

      {hasFoData ? (
        <div className="fail-cal-tools">
          {costayacoOnly ? (
            <details className="park-more fail-cal-more">
              <summary>Mapa</summary>
              <div className="park-more-body card fail-cal-sysmap">
                <CostayacoReliabilityMap
                  events={allEvents}
                  onOpenDay={openDay}
                  compact
                  focusOrigin={focusOriginFromFilter(originFilter)}
                  onFocusOrigin={(origin) => setOriginFilter(originFilterFromNode(origin))}
                />
              </div>
            </details>
          ) : null}

          <details className="park-more fail-cal-more">
            <summary>Calendario</summary>
            <div className="park-more-body card fail-cal-board">
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
            </div>
          </details>

          <details className="park-more fail-cal-more">
            <summary>Ranking</summary>
            <div className="park-more-body card fail-cal-analysis">
              <header className="fail-cal-analysis-head">
                <h3>Quién más sale</h3>
                <p>
                  {costayacoOnly ? (
                    <>
                      Propias <strong>{compactHoursLabel(snapAll.ownHours)}</strong> · MRU{" "}
                      <strong>{compactHoursLabel(snapAll.mruHours)}</strong> · Red/SIN{" "}
                      <strong>{compactHoursLabel(snapAll.redHours + snapAll.sinHours)}</strong>
                    </>
                  ) : (
                    <>
                      Imp <strong>{compactHoursLabel(snap.copowerHours)}</strong> · Ext{" "}
                      <strong>{compactHoursLabel(snap.externalHours)}</strong>
                    </>
                  )}
                </p>
              </header>
              {costayacoOnly && snapAll.origins.length ? (
                <div className="fail-cal-tiles fail-cal-tiles--origins">
                  {snapAll.origins.map((row) => (
                    <article key={row.id} className={`fail-cal-tile fail-cal-tile--${row.id}`}>
                      <strong>{row.short}</strong>
                      <span>
                        {row.count} FO · {compactHoursLabel(row.hours)}
                      </span>
                    </article>
                  ))}
                </div>
              ) : null}
              <div className="fail-cal-tiles">
                {snap.machines.slice(0, 6).map((row) => (
                  <article key={row.unit} className="fail-cal-tile">
                    <strong>{row.unit}</strong>
                    <span>{compactHoursLabel(row.hours)}</span>
                  </article>
                ))}
                {!snap.machines.length ? <p className="muted">Sin horas por máquina.</p> : null}
              </div>
              <div className="fail-cal-cause-grid" style={{ marginTop: "0.65rem" }}>
                {snap.causes.slice(0, 4).map((row) => (
                  <article key={row.label} className="fail-cal-cause" title={row.label}>
                    <strong>
                      {row.count}× · {compactHoursLabel(row.hours)}
                    </strong>
                    <span>{clipListText(row.label, 36)}</span>
                  </article>
                ))}
                {!snap.causes.length ? <p className="muted">Sin causas.</p> : null}
              </div>
            </div>
          </details>
        </div>
      ) : null}
    </div>
  );
}

function AnalysisBlock({
  title,
  text,
  empty,
}: {
  title: string;
  text: string;
  empty: string;
}) {
  const parts = paragraphs(text);
  return (
    <section className="fail-analysis-block">
      <h4>{title}</h4>
      {parts.length ? parts.map((p, i) => <p key={`${title}-${i}`}>{p}</p>) : <p className="muted">{empty}</p>}
    </section>
  );
}

function involvedMachines(event: QuantifiedFailure) {
  if (event.unitHours.length) {
    return event.unitHours
      .filter((row) => row.unit !== "Acumulado" && row.unit !== "Parque")
      .sort((a, b) => b.hours - a.hours);
  }
  return event.units.map((unit) => ({ unit, hours: 0 }));
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
  const machines = involvedMachines(event);

  return (
    <div className="fail-cal fail-cal-screen" aria-live="polite">
      <header className="card section-head fail-cal-screen-head">
        <div className="fail-cal-screen-top">
          <button type="button" className="fail-cal-back" onClick={onBack}>
            <ArrowLeft size={16} />
            Volver
          </button>
          <p className="hist-kicker">
            FO-GE-033 {event.rf} · {fieldLabel(event.field)} · {monthLabel}
          </p>
        </div>
        <h2>{event.units.length ? event.units.join(" · ") : "Parque"}</h2>
        <p className="fail-cal-title" title={event.title}>
          {clipListText(event.title, 110)}
        </p>
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
          <dt>Origen</dt>
          <dd>
            <span className={`fail-cal-origin fail-cal-origin--lg fail-cal-origin--${event.origin}`}>
              {ORIGIN_SHORT[event.origin]}
            </span>
          </dd>
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
      </dl>

      {event.field === "costayaco" ? (
        <p className={`fail-cal-origin-banner fail-cal-origin-banner--${event.origin}`}>
          <strong>{event.originLabel}</strong>
          {event.origin === "mru"
            ? " · Cascada por pérdida de gas tratado (Soenergy / MRU), no falla del activo COPOWER."
            : event.origin === "copower"
              ? " · Disparador en máquina / control COPOWER."
              : event.origin === "red"
                ? " · Falla en red de distribución del campo."
                : event.origin === "sin"
                  ? " · Pérdida o oscilación de referencia del SIN."
                  : event.origin === "gas"
                    ? " · Condición de combustible / combustión."
                    : " · Origen por confirmar con el FO."}
        </p>
      ) : null}

      <article className="card fail-analysis" aria-label="Análisis estándar de la falla">
        <header className="fail-analysis-head">
          <p className="eyebrow">Estándar FO-GE-033</p>
          <h3>Análisis de la falla</h3>
          <p className="muted">Tomado del reporte {event.rf}</p>
        </header>

        <section className="fail-analysis-block">
          <h4>Qué pasó</h4>
          {paragraphs(event.descripcion).map((p, i) => (
            <p key={`d-${i}`}>{p}</p>
          ))}
          {!event.descripcion ? <p className="muted">Sin descripción en el FO.</p> : null}
        </section>

        <AnalysisBlock
          title="1. Antecedentes"
          text={event.antecedentes}
          empty="Sin antecedentes en el FO."
        />
        <AnalysisBlock
          title="2. Causa inmediata"
          text={event.immediateCause}
          empty="Sin causa inmediata escrita en el FO."
        />
        <AnalysisBlock
          title="3. Hipótesis de causa raíz"
          text={event.rootCause}
          empty="Sin hipótesis de causa raíz en el FO."
        />

        <section className="fail-analysis-block fail-analysis-machines">
          <h4>4. Máquinas involucradas y tiempo fuera de línea</h4>
          {machines.length ? (
            <ul className="fail-cal-units fail-cal-units--analysis">
              {machines.map((row) => (
                <li key={row.unit}>
                  <strong>{row.unit}</strong>
                  <span>{row.hours > 0 ? fmtHours(row.hours) : "Ver observaciones"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">El FO no lista máquinas individuales.</p>
          )}
          <p className="fail-analysis-total">
            Total fuera de línea: <strong>{fmtHours(event.downtimeHours)}</strong>
            {" · "}
            Imputación: <strong>{event.blameLabel}</strong>
          </p>
          {event.observaciones ? (
            <div className="fail-analysis-obs">
              <h5>Observaciones de tiempo (FO)</h5>
              {paragraphs(event.observaciones).map((p, i) => (
                <p key={`o-${i}`}>{p}</p>
              ))}
            </div>
          ) : null}
        </section>
      </article>

      <details className="park-more">
        <summary>Acciones, pruebas y mejora</summary>
        <div className="park-more-body fail-analysis-extra">
          <AnalysisBlock title="Acciones" text={event.acciones} empty="Sin acciones registradas." />
          <AnalysisBlock
            title="Partes / materiales"
            text={event.partes}
            empty="Sin partes registradas."
          />
          <AnalysisBlock
            title="Pruebas / verificación"
            text={event.pruebas}
            empty="Sin pruebas registradas."
          />
          <AnalysisBlock
            title="Acción de mejora"
            text={event.mejora}
            empty="Sin acción de mejora."
          />
          {event.field === "pad4" && event.day === "2026-11-12" ? (
            <p className="fo-report-link">
              <a href="/parques/pad4/parada">Ver la secuencia completa en Pad 4</a>
            </p>
          ) : null}
        </div>
      </details>

      <details className="park-more">
        <summary>Texto completo del análisis (FO)</summary>
        <div className="park-more-body fail-analysis-extra">
          {paragraphs(event.analisis).map((p, i) => (
            <p key={`an-${i}`}>{p}</p>
          ))}
          {!event.analisis ? <p className="muted">Sin análisis en el FO.</p> : null}
          <p className="muted fail-analysis-file" title={event.file}>
            Archivo: {event.file}
          </p>
        </div>
      </details>
    </div>
  );
}
