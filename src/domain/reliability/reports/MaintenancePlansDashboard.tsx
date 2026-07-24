import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  ListTodo,
  Search,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  MAINTENANCE_PLANS,
  type MaintenanceExecution,
  type MaintenancePlanStatus,
} from "./maintenancePlansData";

type Props = {
  month: string;
  monthLabel: string;
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

function filterByMonth<T extends { monthKey: string | null }>(rows: T[], month: string): T[] {
  if (!month || month === "YTD2026") return rows;
  return rows.filter((r) => r.monthKey === month);
}

export function MaintenancePlansDashboard({ month, monthLabel }: Props) {
  const pack = MAINTENANCE_PLANS;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"Todos" | MaintenancePlanStatus>("Todos");
  const [onlyProgrammed, setOnlyProgrammed] = useState(true);

  const monthExecutions = useMemo(() => filterByMonth(pack.executions, month), [month, pack.executions]);
  const monthSlots = useMemo(() => filterByMonth(pack.calendarSlots, month), [month, pack.calendarSlots]);
  const monthSummary = pack.monthlySummary.find((m) => m.monthKey === month) ?? null;

  const kpis = useMemo(() => {
    const programmed = monthExecutions.filter((e) => e.programmed);
    const executed = programmed.filter((e) => e.status === "ejecutado");
    const pending = programmed.filter((e) => e.status === "pendiente");
    const compliance = programmed.length > 0 ? (executed.length / programmed.length) * 100 : 0;
    const manHours = monthSlots.reduce((s, x) => s + (x.manHours ?? 0), 0);
    const mtoHours = monthSlots.reduce((s, x) => s + (x.hoursMto ?? 0), 0);
    return {
      programmed: programmed.length,
      executed: executed.length,
      pending: pending.length,
      compliance,
      manHours,
      mtoHours,
      slots: monthSlots.filter((s) => !s.isRun).length,
    };
  }, [monthExecutions, monthSlots]);

  const filteredExecutions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return monthExecutions.filter((e) => {
      if (onlyProgrammed && !e.programmed) return false;
      if (status !== "Todos" && e.status !== status) return false;
      if (!q) return true;
      const hay = `${e.equipment} ${e.notes ?? ""} ${e.statusLabel}`.toLowerCase();
      return hay.includes(q);
    });
  }, [monthExecutions, onlyProgrammed, query, status]);

  const equipmentBars = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of monthExecutions.filter((x) => x.programmed)) {
      for (const part of e.equipment.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)) {
        map.set(part, (map.get(part) ?? 0) + 1);
      }
    }
    return [...map.entries()]
      .map(([equipment, count]) => ({ equipment, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [monthExecutions]);

  const monthlyBars = pack.monthlySummary.filter((m) => m.monthKey !== "TOTAL");

  return (
    <div className="mto-plans exec-dashboard">
      <header className="exec-header dash-hero">
        <div>
          <p className="eyebrow">Planes de mantenimiento · Generación Putumayo</p>
          <h2>{monthLabel}</h2>
          <p className="muted">
            {pack.title} · {pack.notes}
          </p>
          <p className="muted" style={{ marginTop: "0.25rem", fontSize: "0.75rem" }}>
            Fuente: {pack.sourceFile} · hoja {pack.sheet} · extraído {pack.extractedAt}
          </p>
        </div>
        <Wrench size={22} className="muted" />
      </header>

      <section className="field-stat-grid field-stat-grid--compact">
        <article className="field-stat-card">
          <span className="field-stat-label">Programados</span>
          <strong className="field-stat-value">{kpis.programmed}</strong>
          <small>Control de ejecución del mes</small>
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
              ? `Resumen Excel: ${monthSummary.totalHoursMto} / ${monthSummary.totalManHours}`
              : `${kpis.slots} intervenciones en calendario`}
          </small>
        </article>
      </section>

      <section className="panel two-col">
        <article className="card">
          <p className="eyebrow">Resumen mensual (sábana)</p>
          <h3>Horas MTO y hombre · 2026</h3>
          <div className="dash-chart" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBars} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="monthKey" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={36} />
                <Tooltip />
                <Bar dataKey="totalHoursMto" name="Horas MTO" fill="#0f766e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="totalManHours" name="Horas hombre" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="card">
          <p className="eyebrow">Carga por equipo · {monthLabel}</p>
          <h3>Programaciones</h3>
          {equipmentBars.length === 0 ? (
            <p className="empty-state">Sin programaciones en el mes seleccionado.</p>
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
            Acumulado anual por equipo (calendario)
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
                {pack.equipmentStats.slice(0, 15).map((e) => (
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
                Plan del mes · {filteredExecutions.length} registro(s)
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
              <CalendarCheck2 size={14} /> {pack.statusCounts.ejecutado} ejecutados (año)
            </span>
            <span>
              <Clock3 size={14} /> {pack.statusCounts.pendiente} pendientes (año)
            </span>
            <span>
              <CheckCircle2 size={14} /> Cumplimiento mes {kpis.compliance.toFixed(0)}%
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
