import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { EnrichedEvent } from "../events/eventLogUtils";

export type DayTrafficLevel = "ok" | "warn" | "risk" | "empty";

export type DayBucket = {
  date: string;
  day: number;
  level: DayTrafficLevel;
  events: EnrichedEvent[];
  failures: number;
  operativo: number;
  causaComun: number;
  downtimeHours: number;
};

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

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function isoDate(year: number, monthIndex: number, day: number) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function dayLevel(events: EnrichedEvent[]): DayTrafficLevel {
  if (events.length === 0) return "empty";
  if (events.some((e) => e.eventType === "Falla")) return "risk";
  if (events.some((e) => e.eventType === "Causa comun" || (e.downtimeHours ?? 0) > 0)) return "warn";
  return "ok";
}

function levelLabel(level: DayTrafficLevel) {
  if (level === "risk") return "Falla";
  if (level === "warn") return "Atención";
  if (level === "ok") return "Operativo";
  return "Sin eventos";
}

type Props = {
  open: boolean;
  onClose: () => void;
  month: string;
  monthLabel: string;
  year?: number;
  events: EnrichedEvent[];
  sourceLabel?: string;
};

export function GteEventCalendarModal({
  open,
  onClose,
  month,
  monthLabel,
  year = 2026,
  events,
  sourceLabel = "Gran Tierra",
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { days, leadingBlanks, summary } = useMemo(() => {
    const monthIndex = MONTH_INDEX[month] ?? 5;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    // JS: 0=Sun … convert to Mon-first grid
    const firstDow = new Date(year, monthIndex, 1).getDay();
    const leading = firstDow === 0 ? 6 : firstDow - 1;

    const byDate = new Map<string, EnrichedEvent[]>();
    for (const e of events) {
      const list = byDate.get(e.date) ?? [];
      list.push(e);
      byDate.set(e.date, list);
    }

    const built: DayBucket[] = [];
    let risk = 0;
    let warn = 0;
    let ok = 0;
    let empty = 0;

    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = isoDate(year, monthIndex, d);
      const dayEvents = byDate.get(date) ?? [];
      const level = dayLevel(dayEvents);
      if (level === "risk") risk += 1;
      else if (level === "warn") warn += 1;
      else if (level === "ok") ok += 1;
      else empty += 1;

      built.push({
        date,
        day: d,
        level,
        events: dayEvents,
        failures: dayEvents.filter((e) => e.eventType === "Falla").length,
        operativo: dayEvents.filter((e) => e.eventType === "Operativo").length,
        causaComun: dayEvents.filter((e) => e.eventType === "Causa comun").length,
        downtimeHours: dayEvents.reduce((s, e) => s + (e.downtimeHours ?? 0), 0),
      });
    }

    return {
      days: built,
      leadingBlanks: leading,
      summary: { risk, warn, ok, empty, totalEvents: events.length },
    };
  }, [events, month, year]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setSelectedDate(null);
  }, [open, month]);

  if (!open) return null;

  const selected = days.find((d) => d.date === selectedDate) ?? null;

  return (
    <div className="modal-overlay ev-cal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <article className="modal-card modal-card--xl ev-cal-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <p className="eyebrow">Semáforo de eventos · {sourceLabel}</p>
            <h3>📅 Calendario · {monthLabel} {year}</h3>
          </div>
          <button type="button" className="open-popup-btn" onClick={onClose}>
            <X size={16} /> Cerrar
          </button>
        </header>

        <div className="ev-cal-legend" aria-label="Leyenda del semáforo">
          <span className="ev-cal-chip ev-cal-chip--empty">Sin eventos</span>
          <span className="ev-cal-chip ev-cal-chip--ok">Operativo</span>
          <span className="ev-cal-chip ev-cal-chip--warn">Atención</span>
          <span className="ev-cal-chip ev-cal-chip--risk">Falla</span>
          <span className="ev-cal-legend-sum">
            {summary.risk} rojo · {summary.warn} ámbar · {summary.ok} verde · {summary.totalEvents} evento(s)
          </span>
        </div>

        <div className="ev-cal-layout">
          <div className="ev-cal-grid" role="grid" aria-label="Calendario de eventos">
            {WEEKDAYS.map((w) => (
              <div key={w} className="ev-cal-weekday" role="columnheader">
                {w}
              </div>
            ))}
            {Array.from({ length: leadingBlanks }, (_, i) => (
              <div key={`blank-${i}`} className="ev-cal-day ev-cal-day--blank" aria-hidden />
            ))}
            {days.map((d) => {
              const active = selectedDate === d.date;
              return (
                <button
                  key={d.date}
                  type="button"
                  role="gridcell"
                  className={`ev-cal-day ev-cal-day--${d.level}${active ? " is-active" : ""}`}
                  onClick={() => setSelectedDate(d.date)}
                  title={`${d.date}: ${levelLabel(d.level)} · ${d.events.length} evento(s)`}
                >
                  <span className="ev-cal-day-num">{d.day}</span>
                  {d.events.length > 0 ? (
                    <span className="ev-cal-day-count">{d.events.length}</span>
                  ) : (
                    <span className="ev-cal-day-dot" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>

          <aside className="ev-cal-detail">
            {selected ? (
              <>
                <h4>
                  {selected.date}
                  <span className={`ev-cal-chip ev-cal-chip--${selected.level}`}>
                    {levelLabel(selected.level)}
                  </span>
                </h4>
                <p className="muted">
                  {selected.events.length} evento(s) · {selected.failures} falla(s) ·{" "}
                  {selected.downtimeHours.toFixed(1)} h
                </p>
                {selected.events.length === 0 ? (
                  <p className="muted">Día sin registros en la bitácora.</p>
                ) : (
                  <ul className="ev-cal-event-list">
                    {selected.events.map((e) => (
                      <li key={e.id}>
                        <div className="ev-cal-event-top">
                          <strong>{e.equipment}</strong>
                          <span
                            className={
                              e.eventType === "Falla"
                                ? "badge danger"
                                : e.eventType === "Causa comun"
                                  ? "badge warning"
                                  : "badge info"
                            }
                          >
                            {e.eventType}
                          </span>
                        </div>
                        <p>{e.cause || "Sin descripción"}</p>
                        <small>
                          {e.responsible} · {(e.downtimeHours ?? 0).toFixed(1)} h
                        </small>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="muted ev-cal-hint">Seleccione un día para ver el detalle del semáforo.</p>
            )}
          </aside>
        </div>
      </article>
    </div>
  );
}
