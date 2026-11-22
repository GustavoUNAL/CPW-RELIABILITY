import { CalendarCheck2, CheckCircle2, Clock3, ListTodo, Wrench } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MAINTENANCE_PLANS } from "./maintenancePlansData";

type Props = {
  month: string;
  monthLabel: string;
};

function pct(count: number, total: number, digits = 1) {
  if (total <= 0) return "0.0%";
  return `${((count / total) * 100).toFixed(digits)}%`;
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isoWeekLabel(iso: string) {
  const date = parseIsoDate(iso);
  const day = (date.getDay() + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - day);
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const week = Math.floor(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7) + 1;
  return `S${week}`;
}

export function MantenimientoInformeSlide({ month, monthLabel }: Props) {
  const pack = MAINTENANCE_PLANS;

  const insights = useMemo(() => {
    const summary = pack.monthlySummary.find((m) => m.monthKey === month) ?? null;
    const executions = pack.executions.filter((e) => e.monthKey === month);
    const slots = pack.calendarSlots.filter((s) => s.monthKey === month && !s.isRun);
    const programmed = executions.filter((e) => e.programmed);
    const executed = programmed.filter((e) => e.status === "ejecutado");
    const pending = programmed.filter((e) => e.status === "pendiente");
    const compliance = programmed.length > 0 ? (executed.length / programmed.length) * 100 : 0;

    const equipMap = new Map<string, number>();
    for (const e of programmed) {
      for (const part of e.equipment.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)) {
        equipMap.set(part, (equipMap.get(part) ?? 0) + 1);
      }
    }
    const equipChart = [...equipMap.entries()]
      .map(([equipment, count]) => ({
        equipment,
        count,
        share: Number(((count / Math.max(programmed.length, 1)) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const weekMap = new Map<string, { planned: number; executed: number }>();
    for (const s of slots) {
      const w = isoWeekLabel(s.date);
      const row = weekMap.get(w) ?? { planned: 0, executed: 0 };
      row.planned += s.hoursMto ?? 0;
      weekMap.set(w, row);
    }
    for (const e of executed) {
      const w = isoWeekLabel(e.date);
      const row = weekMap.get(w) ?? { planned: 0, executed: 0 };
      const daySlots = slots.filter((s) => s.date === e.date);
      row.executed += daySlots.reduce((sum, x) => sum + (x.hoursMto ?? 0), 0);
      weekMap.set(w, row);
    }
    const weekChart = [...weekMap.entries()]
      .map(([week, v]) => ({
        week,
        planned: Number(v.planned.toFixed(1)),
        executed: Number(v.executed.toFixed(1)),
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    const equipStats = [...equipMap.entries()]
      .map(([equipment, interventions]) => {
        const slotHours = slots
          .filter((s) => s.equipment.includes(equipment))
          .reduce((sum, s) => sum + (s.hoursMto ?? 0), 0);
        const manHours = slots
          .filter((s) => s.equipment.includes(equipment))
          .reduce((sum, s) => sum + (s.manHours ?? 0), 0);
        return { equipment, interventions, hoursMto: slotHours, manHours };
      })
      .sort((a, b) => b.interventions - a.interventions)
      .slice(0, 7);

    const recentRows = programmed
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || a.equipment.localeCompare(b.equipment))
      .slice(0, 7);

    return {
      summary,
      programmed,
      executed,
      pending,
      compliance,
      equipChart,
      weekChart,
      equipStats,
      recentRows,
    };
  }, [month]);

  const {
    summary,
    programmed,
    executed,
    pending,
    compliance,
    equipChart,
    weekChart,
    equipStats,
    recentRows,
  } = insights;

  return (
    <div className="rep-slide mto-slide">
      <div className="rep-slide-kpis mto-slide-kpis" aria-label="Indicadores de mantenimiento">
        <article>
          <ListTodo size={15} />
          <span>Programados</span>
          <strong>{programmed.length}</strong>
          <small>{summary?.programmedCount ?? programmed.length} en sábana</small>
        </article>
        <article>
          <CheckCircle2 size={15} />
          <span>Ejecutados</span>
          <strong>{executed.length}</strong>
          <small>{pct(executed.length, programmed.length)} cumplimiento</small>
        </article>
        <article>
          <Clock3 size={15} />
          <span>Pendientes</span>
          <strong>{pending.length}</strong>
          <small>{summary?.pendingCount ?? pending.length} por cerrar</small>
        </article>
        <article>
          <CalendarCheck2 size={15} />
          <span>Cumplimiento</span>
          <strong>{compliance.toFixed(1)}%</strong>
          <small>Plan {monthLabel}</small>
        </article>
        <article>
          <Wrench size={15} />
          <span>Horas MTO</span>
          <strong>{summary?.executedHoursMto ?? 0}</strong>
          <small>
            de {summary?.plannedHoursMto ?? 0} h plan · {summary?.executedManHours ?? 0} h-hombre
          </small>
        </article>
      </div>

      <div className="rep-slide-charts mto-slide-charts">
        <article className="rep-slide-chart">
          <header>
            <h4>Intervenciones por equipo</h4>
            <p>Actividades programadas · % del mes</p>
          </header>
          <div className="rep-slide-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={equipChart} margin={{ top: 14, right: 6, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
                <XAxis dataKey="equipment" tick={{ fontSize: 9 }} interval={0} angle={-16} textAnchor="end" height={36} />
                <YAxis tick={{ fontSize: 9 }} width={24} allowDecimals={false} />
                <Tooltip formatter={(v, n) => [n === "share" ? `${v} %` : String(v), n === "share" ? "%" : "MTO"]} />
                <Bar dataKey="count" name="Intervenciones" fill="#0f766e" radius={[3, 3, 0, 0]}>
                  <LabelList dataKey="share" position="top" fontSize={9} formatter={(v) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rep-slide-chart">
          <header>
            <h4>Horas MTO por semana</h4>
            <p>Planificado vs ejecutado</p>
          </header>
          <div className="rep-slide-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekChart} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} width={28} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="planned" name="Plan h MTO" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="executed" name="Ejec h MTO" fill="#16a34a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="rep-slide-tables mto-slide-tables">
        <section className="rep-slide-table-panel">
          <header>
            <h4>Carga por equipo</h4>
            <p>Intervenciones · horas MTO · h-hombre</p>
          </header>
          <div className="table-wrap ev-category-table-wrap">
            <table className="ev-category-table rep-slide-table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th className="ev-col-num">MTO</th>
                  <th className="ev-col-num">h MTO</th>
                  <th className="ev-col-num">h-hombre</th>
                  <th className="ev-col-num">%</th>
                </tr>
              </thead>
              <tbody>
                {equipStats.map((row) => (
                  <tr key={row.equipment}>
                    <td><strong>{row.equipment}</strong></td>
                    <td className="ev-col-num">{row.interventions}</td>
                    <td className="ev-col-num">{row.hoursMto.toFixed(0)}</td>
                    <td className="ev-col-num">{row.manHours.toFixed(0)}</td>
                    <td className="ev-col-num">{pct(row.interventions, programmed.length)}</td>
                  </tr>
                ))}
                {equipStats.length === 0 ? (
                  <tr><td colSpan={5}>Sin intervenciones programadas.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rep-slide-table-panel">
          <header>
            <h4>Últimas intervenciones</h4>
            <p>Fecha · equipo · estado</p>
          </header>
          <div className="table-wrap ev-category-table-wrap">
            <table className="ev-category-table rep-slide-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>Estado</th>
                  <th className="ev-col-num">h-h</th>
                </tr>
              </thead>
              <tbody>
                {recentRows.map((row) => (
                  <tr key={`${row.date}-${row.equipment}`}>
                    <td>{row.date.slice(5)}</td>
                    <td><strong>{row.equipment}</strong></td>
                    <td>{row.statusLabel}</td>
                    <td className="ev-col-num">{row.plannedManHours || "—"}</td>
                  </tr>
                ))}
                {recentRows.length === 0 ? (
                  <tr><td colSpan={4}>Sin registros en el mes.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
