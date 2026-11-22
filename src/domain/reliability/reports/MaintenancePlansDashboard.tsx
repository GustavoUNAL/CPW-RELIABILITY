import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  ListTodo,
  Search,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MAINTENANCE_PLANS,
  type MaintenanceExecution,
  type MaintenancePlanStatus,
} from "./maintenancePlansData";

type Props = {
  month: string;
  monthLabel: string;
};

type WeekOption = {
  key: string;
  label: string;
  start: string;
  end: string;
  monthKey: string;
};

const STATUS_META: Record<
  MaintenancePlanStatus,
  { label: string; color: string }
> = {
  ejecutado: { label: "Ejecutado", color: "#16a34a" },
  pendiente: { label: "Pendiente", color: "#d97706" },
  no_aplica: { label: "No aplica", color: "#94a3b8" },
  otro: { label: "Otro", color: "#6366f1" },
  sin_dato: { label: "Sin dato", color: "#64748b" },
};

const MONTH_NUM: Record<string, number> = {
  Ene: 1,
  Feb: 2,
  Mar: 3,
  Abr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Ago: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dic: 12,
};

function ToneBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="badge"
      style={{
        background: `color-mix(in oklab, ${color} 20%, var(--panel-soft))`,
        color,
      }}
    >
      {label}
    </span>
  );
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatShortDate(iso: string): string {
  const d = parseIsoDate(iso);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

/** Semana ISO (lunes–domingo). */
function isoWeekInfo(iso: string): { key: string; year: number; week: number; start: string; end: string } {
  const date = parseIsoDate(iso);
  const day = (date.getDay() + 6) % 7; // lunes = 0
  const monday = new Date(date);
  monday.setDate(date.getDate() - day);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const week = Math.floor(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7) + 1;
  const year = thursday.getFullYear();
  const key = `${year}-W${String(week).padStart(2, "0")}`;
  return { key, year, week, start: toIsoDate(monday), end: toIsoDate(sunday) };
}

function monthKeyFromIso(iso: string): string {
  const month = Number(iso.slice(5, 7));
  return Object.entries(MONTH_NUM).find(([, n]) => n === month)?.[0] ?? "";
}

function filterByMonth<T extends { monthKey: string | null }>(rows: T[], month: string): T[] {
  if (!month || month === "YTD2026" || month === "Todos") return rows;
  return rows.filter((r) => r.monthKey === month);
}

function filterByWeek<T extends { date: string }>(rows: T[], weekKey: string): T[] {
  if (!weekKey || weekKey === "ALL") return rows;
  return rows.filter((r) => isoWeekInfo(r.date).key === weekKey);
}

export function MaintenancePlansDashboard({ month, monthLabel }: Props) {
  const pack = MAINTENANCE_PLANS;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"Todos" | MaintenancePlanStatus>("Todos");
  const [onlyProgrammed, setOnlyProgrammed] = useState(true);
  const [activeMonth, setActiveMonth] = useState(month);
  const [activeWeek, setActiveWeek] = useState("ALL");

  useEffect(() => {
    setActiveMonth(month);
    setActiveWeek("ALL");
  }, [month]);

  const monthOptions = useMemo(
    () => pack.monthlySummary.filter((m) => m.monthKey !== "TOTAL"),
    [pack.monthlySummary],
  );

  const isGeneral = activeMonth === "YTD2026" || activeMonth === "Todos";
  const hasWeek = activeWeek !== "ALL";

  const weekOptions = useMemo(() => {
    const source = filterByMonth(pack.days, activeMonth);
    const map = new Map<string, WeekOption>();
    for (const day of source) {
      if (!day.date) continue;
      const info = isoWeekInfo(day.date);
      const mk = day.monthKey ?? monthKeyFromIso(day.date);
      if (!map.has(info.key)) {
        map.set(info.key, {
          key: info.key,
          label: `Semana ${info.week} · ${formatShortDate(info.start)} – ${formatShortDate(info.end)}`,
          start: info.start,
          end: info.end,
          monthKey: mk,
        });
      }
    }
    return [...map.values()].sort((a, b) => a.start.localeCompare(b.start));
  }, [activeMonth, pack.days]);

  useEffect(() => {
    if (activeWeek !== "ALL" && !weekOptions.some((w) => w.key === activeWeek)) {
      setActiveWeek("ALL");
    }
  }, [activeWeek, weekOptions]);

  const periodLabel = useMemo(() => {
    if (hasWeek) {
      const week = weekOptions.find((w) => w.key === activeWeek);
      return week?.label ?? activeWeek;
    }
    if (isGeneral) return "Todo el año 2026";
    return monthOptions.find((m) => m.monthKey === activeMonth)?.monthLabel ?? monthLabel;
  }, [activeMonth, activeWeek, hasWeek, isGeneral, monthLabel, monthOptions, weekOptions]);

  const scopedExecutions = useMemo(() => {
    const byMonth = filterByMonth(pack.executions, activeMonth);
    return filterByWeek(byMonth, activeWeek);
  }, [activeMonth, activeWeek, pack.executions]);

  const scopedSlots = useMemo(() => {
    const byMonth = filterByMonth(pack.calendarSlots, activeMonth);
    return filterByWeek(byMonth, activeWeek);
  }, [activeMonth, activeWeek, pack.calendarSlots]);

  const monthSummary = !hasWeek
    ? pack.monthlySummary.find((m) => m.monthKey === activeMonth) ?? null
    : null;

  const kpis = useMemo(() => {
    const programmed = scopedExecutions.filter((e) => e.programmed);
    const executed = programmed.filter((e) => e.status === "ejecutado");
    const pending = programmed.filter((e) => e.status === "pendiente");
    const compliance = programmed.length > 0 ? (executed.length / programmed.length) * 100 : 0;
    const manHours = scopedSlots.reduce((s, x) => s + (x.manHours ?? 0), 0);
    const mtoHours = scopedSlots.reduce((s, x) => s + (x.hoursMto ?? 0), 0);
    return {
      programmed: programmed.length,
      executed: executed.length,
      pending: pending.length,
      compliance,
      manHours,
      mtoHours,
      slots: scopedSlots.filter((s) => !s.isRun).length,
    };
  }, [scopedExecutions, scopedSlots]);

  const filteredExecutions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scopedExecutions.filter((e) => {
      if (onlyProgrammed && !e.programmed) return false;
      if (status !== "Todos" && e.status !== status) return false;
      if (!q) return true;
      const hay = `${e.equipment} ${e.notes ?? ""} ${e.statusLabel}`.toLowerCase();
      return hay.includes(q);
    });
  }, [onlyProgrammed, query, scopedExecutions, status]);

  const equipmentBars = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of scopedExecutions.filter((x) => x.programmed)) {
      for (const part of e.equipment.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)) {
        map.set(part, (map.get(part) ?? 0) + 1);
      }
    }
    return [...map.entries()]
      .map(([equipment, count]) => ({ equipment, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [scopedExecutions]);

  const periodBars = useMemo(() => {
    type PeriodBar = {
      key: string;
      label: string;
      plannedHoursMto: number;
      executedHoursMto: number;
      kind: "month" | "week" | "day";
    };

    // Año: barras por mes. Mes: barras por semana. Semana: barras por día.
    if (isGeneral && !hasWeek) {
      return monthOptions.map(
        (m): PeriodBar => ({
          key: m.monthKey,
          label: m.monthKey,
          plannedHoursMto: m.plannedHoursMto,
          executedHoursMto: m.executedHoursMto,
          kind: "month",
        }),
      );
    }

    if (!hasWeek) {
      return weekOptions.map((w): PeriodBar => {
        const slots = pack.calendarSlots.filter(
          (s) => !s.isRun && isoWeekInfo(s.date).key === w.key,
        );
        const executions = pack.executions.filter(
          (e) => e.programmed && isoWeekInfo(e.date).key === w.key,
        );
        const planned = slots.reduce((s, x) => s + (x.hoursMto ?? 0), 0);
        const executedDays = new Set(
          executions.filter((e) => e.status === "ejecutado").map((e) => e.date),
        );
        const executedHours = slots
          .filter((s) => executedDays.has(s.date))
          .reduce((s, x) => s + (x.hoursMto ?? 0), 0);
        return {
          key: w.key,
          label: `S${w.key.split("-W")[1]}`,
          plannedHoursMto: planned,
          executedHoursMto: executedHours,
          kind: "week",
        };
      });
    }

    const days = [...new Set(scopedSlots.map((s) => s.date))].sort();
    const executedDays = new Set(
      scopedExecutions.filter((e) => e.status === "ejecutado").map((e) => e.date),
    );
    return days.map((date): PeriodBar => {
      const daySlots = scopedSlots.filter((s) => s.date === date && !s.isRun);
      const planned = daySlots.reduce((s, x) => s + (x.hoursMto ?? 0), 0);
      const executed = executedDays.has(date)
        ? daySlots.reduce((s, x) => s + (x.hoursMto ?? 0), 0)
        : 0;
      return {
        key: date,
        label: formatShortDate(date),
        plannedHoursMto: planned,
        executedHoursMto: executed,
        kind: "day",
      };
    });
  }, [
    hasWeek,
    isGeneral,
    monthOptions,
    pack.calendarSlots,
    pack.executions,
    scopedExecutions,
    scopedSlots,
    weekOptions,
  ]);

  const chartHint = isGeneral && !hasWeek
    ? "Clic en un mes para filtrar."
    : !hasWeek
      ? "Clic en una semana para filtrar."
      : "Detalle diario de la semana seleccionada.";

  const chartTitle =
    isGeneral && !hasWeek
      ? "Horas planificadas vs ejecutadas · por mes"
      : !hasWeek
        ? "Horas planificadas vs ejecutadas · por semana"
        : "Horas planificadas vs ejecutadas · por día";

  const scopedEquipmentStats = useMemo(() => {
    const stats = new Map<
      string,
      { equipment: string; model: string; interventions: number; hoursMto: number; manHours: number }
    >();
    for (const slot of scopedSlots.filter((row) => !row.isRun)) {
      const current = stats.get(slot.equipment) ?? {
        equipment: slot.equipment,
        model: slot.model,
        interventions: 0,
        hoursMto: 0,
        manHours: 0,
      };
      current.interventions += 1;
      current.hoursMto += slot.hoursMto ?? 0;
      current.manHours += slot.manHours ?? 0;
      stats.set(slot.equipment, current);
    }
    return [...stats.values()].sort((a, b) => b.interventions - a.interventions);
  }, [scopedSlots]);

  const onPeriodChartClick = (state: {
    activePayload?: Array<{ payload?: { key?: string; kind?: string } }>;
  }) => {
    const payload = state.activePayload?.[0]?.payload;
    if (!payload?.key) return;
    if (payload.kind === "month") {
      setActiveMonth(payload.key);
      setActiveWeek("ALL");
    } else if (payload.kind === "week") {
      setActiveWeek(payload.key);
      const week = weekOptions.find((w) => w.key === payload.key);
      if (week?.monthKey) setActiveMonth(week.monthKey);
    }
  };

  return (
    <div className="mto-plans exec-dashboard">
      <header className="exec-header dash-hero">
        <div>
          <p className="eyebrow">Planes de mantenimiento · Generación Putumayo</p>
          <h2>{periodLabel}</h2>
        </div>
        <div className="mto-plans-period">
          <div className="mto-plans-month">
            <label htmlFor="mto-plans-month-select">Mes</label>
            <select
              id="mto-plans-month-select"
              value={activeMonth}
              onChange={(e) => {
                setActiveMonth(e.target.value);
                setActiveWeek("ALL");
              }}
            >
              <option value="YTD2026">Todo el año 2026</option>
              {monthOptions.map((m) => (
                <option key={m.monthKey} value={m.monthKey}>
                  {m.monthLabel}
                </option>
              ))}
            </select>
          </div>
          <div className="mto-plans-month">
            <label htmlFor="mto-plans-week-select">Semana</label>
            <select
              id="mto-plans-week-select"
              value={activeWeek}
              onChange={(e) => setActiveWeek(e.target.value)}
            >
              <option value="ALL">{isGeneral ? "Todas las semanas" : "Todo el mes"}</option>
              {weekOptions.map((w) => (
                <option key={w.key} value={w.key}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
          <Wrench size={22} className="muted" />
        </div>
      </header>

      <section className="field-stat-grid field-stat-grid--compact">
        <article className="field-stat-card">
          <span className="field-stat-label">Programados</span>
          <strong className="field-stat-value">{kpis.programmed}</strong>
          <small>Control de ejecución del periodo</small>
        </article>
        <article className="field-stat-card">
          <span className="field-stat-label">Ejecutados</span>
          <strong className="field-stat-value">{kpis.executed}</strong>
          <small>{kpis.pending} pendientes</small>
        </article>
        <article className="field-stat-card">
          <span className="field-stat-label">Cumplimiento</span>
          <strong className="field-stat-value">{kpis.compliance.toFixed(0)}%</strong>
          <small>Ejecutado / programado</small>
        </article>
        <article className="field-stat-card">
          <span className="field-stat-label">Horas MTO / H-H</span>
          <strong className="field-stat-value">
            {kpis.mtoHours.toFixed(0)} / {kpis.manHours.toFixed(0)}
          </strong>
          <small>
            {monthSummary
              ? `Plan ${monthSummary.plannedHoursMto} h · Ejec. ${monthSummary.executedHoursMto} h`
              : `${kpis.slots} intervenciones en calendario`}
          </small>
        </article>
      </section>

      <section className="panel two-col">
        <article className="card">
          <p className="eyebrow">Resumen del periodo</p>
          <h3>{chartTitle}</h3>
          <p className="muted" style={{ margin: "0 0 0.4rem", fontSize: "0.72rem" }}>
            {chartHint}
          </p>
          <div className="dash-chart" style={{ height: 240 }}>
            {periodBars.length === 0 ? (
              <p className="empty-state">Sin datos en el periodo seleccionado.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={periodBars}
                  margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                  onClick={(state) =>
                    onPeriodChartClick(
                      state as {
                        activePayload?: Array<{ payload?: { key?: string; kind?: string } }>;
                      },
                    )
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={36} />
                  <Tooltip
                    formatter={(value, name) => [`${Number(value).toFixed(0)} h`, String(name)]}
                    cursor={{ fill: "color-mix(in oklab, var(--accent) 12%, transparent)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="plannedHoursMto" name="Planificadas" radius={[3, 3, 0, 0]}>
                    {periodBars.map((row) => (
                      <Cell
                        key={`plan-${row.key}`}
                        fill="#94a3b8"
                        fillOpacity={
                          (!hasWeek && isGeneral) ||
                          (!hasWeek && activeMonth === row.key) ||
                          activeWeek === row.key ||
                          hasWeek
                            ? 1
                            : 0.55
                        }
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="executedHoursMto" name="Ejecutadas" radius={[3, 3, 0, 0]}>
                    {periodBars.map((row) => (
                      <Cell
                        key={`exe-${row.key}`}
                        fill="#0f766e"
                        fillOpacity={
                          (!hasWeek && isGeneral) ||
                          (!hasWeek && activeMonth === row.key) ||
                          activeWeek === row.key ||
                          hasWeek
                            ? 1
                            : 0.6
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
        <article className="card">
          <p className="eyebrow">Carga por equipo · {periodLabel}</p>
          <h3>Programaciones</h3>
          {equipmentBars.length === 0 ? (
            <p className="empty-state">Sin programaciones en el periodo seleccionado.</p>
          ) : (
            <div className="dash-chart" style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={equipmentBars}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="equipment" width={88} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Programaciones" radius={[0, 4, 4, 0]}>
                    {equipmentBars.map((row) => (
                      <Cell key={row.equipment} fill="#0ea5e9" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>
      </section>

      <section className="panel two-col">
        <article className="card">
          <p className="eyebrow">Catálogo de periodicidad</p>
          <h3>Equipos y horas de operación</h3>
          {pack.periodicityNotes.length > 0 ? (
            <ul className="mto-plans-notes">
              {pack.periodicityNotes.map((n) => (
                <li key={n.fleet}>
                  <strong>{n.fleet}</strong>: {n.rule}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="table-wrap" style={{ maxHeight: 320, overflow: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Tipo</th>
                  <th>Periodicidad (h)</th>
                  <th>Horas MTO</th>
                  <th>H/H</th>
                </tr>
              </thead>
              <tbody>
                {pack.catalog.map((c) => (
                  <tr key={c.equipment}>
                    <td>{c.equipment}</td>
                    <td>{c.model}</td>
                    <td>{c.periodicityHrs.toLocaleString("es-CO")}</td>
                    <td>{c.hoursMto}</td>
                    <td>{c.manHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className="card">
          <p className="eyebrow">Flota en sábana</p>
          <h3>{pack.fleet.length} unidades</h3>
          <div className="mto-plans-fleet">
            {pack.fleet.map((u) => (
              <div key={u.equipment} className="mto-plans-fleet-item">
                <strong>{u.equipment}</strong>
                <span>{u.model}</span>
              </div>
            ))}
          </div>
          <p className="eyebrow" style={{ marginTop: "1rem" }}>
            Detalle por equipo · {periodLabel}
          </p>
          <div className="table-wrap" style={{ maxHeight: 220, overflow: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Interv.</th>
                  <th>H MTO</th>
                  <th>H/H</th>
                </tr>
              </thead>
              <tbody>
                {scopedEquipmentStats.slice(0, 15).map((e) => (
                  <tr key={e.equipment}>
                    <td>{e.equipment}</td>
                    <td>{e.interventions}</td>
                    <td>{e.hoursMto}</td>
                    <td>{e.manHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <div className="mto-plans-toolbar">
            <div>
              <p className="eyebrow">Control de ejecución</p>
              <h3>
                <ListTodo size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Plan del periodo · {filteredExecutions.length} registro(s)
              </h3>
            </div>
            <div className="mto-plans-filters">
              <label className="mto-plans-check">
                <input
                  type="checkbox"
                  checked={onlyProgrammed}
                  onChange={(e) => setOnlyProgrammed(e.target.checked)}
                />
                Solo programados
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Todos" | MaintenancePlanStatus)}
              >
                <option value="Todos">Todos los estados</option>
                <option value="ejecutado">Ejecutado</option>
                <option value="pendiente">Pendiente</option>
                <option value="no_aplica">No aplica</option>
              </select>
              <div className="mto-plans-search">
                <Search size={14} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar equipo u observación"
                />
              </div>
            </div>
          </div>

          <div className="mto-plans-legend">
            <span>
              <CalendarCheck2 size={14} /> {kpis.executed} ejecutados ({periodLabel})
            </span>
            <span>
              <Clock3 size={14} /> {kpis.pending} pendientes ({periodLabel})
            </span>
            <span>
              <CheckCircle2 size={14} /> Cumplimiento {kpis.compliance.toFixed(0)}%
            </span>
          </div>

          {filteredExecutions.length === 0 ? (
            <p className="empty-state">Sin registros con los filtros actuales.</p>
          ) : (
            <div className="table-wrap" style={{ maxHeight: "min(52vh, 520px)", overflow: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Equipo(s)</th>
                    <th>Estado</th>
                    <th>Ejecución</th>
                    <th>H/H plan</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExecutions.map((e: MaintenanceExecution) => {
                    const meta = STATUS_META[e.status];
                    return (
                      <tr key={`${e.date}-${e.equipment}-${e.statusLabel}`}>
                        <td>{e.date}</td>
                        <td>
                          <strong>{e.equipment}</strong>
                        </td>
                        <td>
                          <ToneBadge label={meta.label} color={meta.color} />
                        </td>
                        <td>{e.executionDate || "—"}</td>
                        <td>{e.plannedManHours || "—"}</td>
                        <td className="mto-plans-notes-cell">{e.notes || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
