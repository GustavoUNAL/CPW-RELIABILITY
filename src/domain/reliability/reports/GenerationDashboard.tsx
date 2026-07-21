import { useMemo, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Zap } from "lucide-react";
import type { GenerationSection } from "../nav/resolveContext";
import {
  COPOWER_GENERATION_DASHBOARD,
  GENERATION_DASHBOARD_META,
  GENERATION_EQUIPMENT_ORDER,
  GENERATION_PALETTE,
  dailyFleetSeries,
  generationDashboardKpis,
  monthlyStackedSeries,
  sortedEquipmentByMwh,
} from "./copowerGenerationDashboard2026";

const SECTION_TITLES: Record<GenerationSection, string> = {
  dashboard: "Dashboard de flota",
  diaria: "Tendencia diaria",
  mensual: "Acumulado mensual",
  equipos: "Indicadores por equipo",
  utilizacion: "Disponibilidad y utilización",
  horas: "Horas por estado",
};

const fmt = (n: number, d = 0) =>
  n.toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });

const fmtTooltip = (v: unknown, suffix = "") => {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return "N/D";
  return suffix ? `${n.toFixed(suffix.includes("%") ? 1 : 2)}${suffix}` : fmt(n, 1);
};

function KpiStrip({ compact }: { compact?: boolean }) {
  const k = generationDashboardKpis();
  const cards = [
    { value: fmt(k.totalMwh), label: "MWh generados" },
    { value: k.mwhPerDay.toFixed(1), label: "MWh/día promedio" },
    { value: k.avgMw.toFixed(2), label: "MW carga media" },
    { value: fmt(k.hoursOp), label: "Horas de operación" },
    { value: `${k.avgDisp.toFixed(1)}%`, label: "Disponibilidad media" },
    { value: `${k.gasMmscf.toFixed(1)}`, label: "MMscf gas (teórico)" },
  ];
  const visible = compact ? cards.slice(0, 3) : cards;

  return (
    <div className="gen-kpi-strip">
      {visible.map((c) => (
        <article key={c.label} className="field-stat-card gen-kpi-card">
          <strong className="field-stat-value">{c.value}</strong>
          <span className="field-stat-label">{c.label}</span>
        </article>
      ))}
    </div>
  );
}

function ChartPanel({ title, children, wide }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <article className={`gen-chart-panel${wide ? " gen-chart-panel--wide" : ""}`}>
      <h4>{title}</h4>
      <div className="chart-container gen-chart">{children}</div>
    </article>
  );
}

type Props = {
  section?: GenerationSection;
};

export function GenerationDashboard({ section = "dashboard" }: Props) {
  const data = COPOWER_GENERATION_DASHBOARD;
  const kpis = useMemo(() => generationDashboardKpis(data), [data]);
  const sorted = useMemo(() => sortedEquipmentByMwh(data), [data]);
  const daily = useMemo(() => dailyFleetSeries(data), [data]);
  const monthly = useMemo(() => monthlyStackedSeries(data), [data]);

  const energyRows = sorted.map((eq) => ({ equipo: eq, mwh: data.equipos[eq].mwh }));
  const dispRows = sorted.map((eq) => ({
    equipo: eq,
    disp: data.equipos[eq].disp,
    util: data.equipos[eq].util,
  }));
  const stateRows = sorted.map((eq) => {
    const q = data.equipos[eq];
    return { equipo: eq, op: q.op, sb: q.sb, mto: q.mto, fs: q.fs, pe: q.pe, tr: q.tr };
  });
  const kwRows = sorted.map((eq) => ({ equipo: eq, kw: data.equipos[eq].kw_op }));

  const showAll = section === "dashboard";
  const showKpi = showAll || section === "diaria" || section === "utilizacion";
  const showNotes = showAll;

  return (
    <div className="gen-dashboard exec-dashboard">
      <header className="exec-header">
        <div>
          <p className="eyebrow">Módulo Generación · COPOWER</p>
          <h2>
            <Zap size={22} style={{ verticalAlign: "middle", marginRight: 8 }} />
            {SECTION_TITLES[section]}
          </h2>
          <p className="muted">
            {GENERATION_DASHBOARD_META.title} · Período:{" "}
            <strong>{GENERATION_DASHBOARD_META.periodLabel}</strong> ·{" "}
            {GENERATION_DASHBOARD_META.equipmentCount} equipos ({GENERATION_DASHBOARD_META.equipmentNote}) · Fuente:{" "}
            {GENERATION_DASHBOARD_META.sourceFile}
          </p>
        </div>
        <span className="badge info">Fuente COPOWER</span>
      </header>

      {showKpi ? <KpiStrip compact={section !== "dashboard"} /> : null}

      <div className="gen-chart-grid">
        {(showAll || section === "diaria") && (
          <ChartPanel title="Generación diaria de la flota (MWh/día)" wide>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={daily} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={28} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  width={44}
                  label={{ value: "MWh/día", angle: -90, position: "insideLeft", fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v) => [`${fmtTooltip(v)} MWh/día`, "Flota"]}
                  labelFormatter={(l) => `2026-${l}`}
                />
                <Line type="monotone" dataKey="mwh" stroke="#0e6e8c" strokeWidth={1.6} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
        )}

        {(showAll || section === "mensual") && (
          <ChartPanel title="Generación mensual por equipo (MWh)" wide>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={44} />
                <Tooltip formatter={(v) => [`${fmtTooltip(v, "")} MWh`, ""]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {GENERATION_EQUIPMENT_ORDER.map((eq, i) => (
                  <Bar key={eq} dataKey={eq} stackId="m" fill={GENERATION_PALETTE[i % GENERATION_PALETTE.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        )}

        {(showAll || section === "equipos") && (
          <>
            <ChartPanel title="Energía total por equipo (MWh)">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={energyRows} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="equipo" tick={{ fontSize: 9 }} width={72} />
                  <Tooltip formatter={(v) => [`${fmtTooltip(v)} MWh`, "Energía"]} />
                  <Bar dataKey="mwh" radius={[0, 4, 4, 0]}>
                    {energyRows.map((row) => (
                      <Cell
                        key={row.equipo}
                        fill={
                          GENERATION_PALETTE[GENERATION_EQUIPMENT_ORDER.indexOf(row.equipo) % GENERATION_PALETTE.length]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Carga promedio en operación (kW)">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={kwRows} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="equipo" tick={{ fontSize: 9 }} width={72} />
                  <Tooltip formatter={(v) => [`${fmtTooltip(v)} kW`, "Carga prom. OP"]} />
                  <Bar dataKey="kw" fill="#16a085" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          </>
        )}

        {(showAll || section === "utilizacion") && (
          <ChartPanel title="Disponibilidad y utilización (%)" wide={section === "utilizacion"}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dispRows} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="equipo" tick={{ fontSize: 9 }} width={72} />
                <Tooltip formatter={(v) => [`${fmtTooltip(v, "%")}`, ""]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="disp" name="Disponibilidad" fill="#0e6e8c" radius={[0, 2, 2, 0]} />
                <Bar dataKey="util" name="Utilización" fill="#f39c12" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        )}

        {(showAll || section === "horas") && (
          <ChartPanel title="Horas por estado" wide={section === "horas"}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stateRows} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="equipo" tick={{ fontSize: 9 }} width={72} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="op" name="Operación" stackId="h" fill="#27ae60" />
                <Bar dataKey="sb" name="Standby" stackId="h" fill="#2980b9" />
                <Bar dataKey="mto" name="Mantenimiento" stackId="h" fill="#f39c12" />
                <Bar dataKey="fs" name="Fuera de servicio" stackId="h" fill="#c0392b" />
                <Bar dataKey="pe" name="PE" stackId="h" fill="#8e44ad" />
                <Bar dataKey="tr" name="Traslado" stackId="h" fill="#7f8c8d" />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        )}

        {(showAll || section === "equipos") && (
          <ChartPanel title="Tabla de indicadores por equipo" wide>
            <div className="table-wrap gen-table-wrap">
              <table className="indicators-table exec-unit-table">
                <thead>
                  <tr>
                    <th>Equipo</th>
                    <th>MWh</th>
                    <th>% flota</th>
                    <th>h OP</th>
                    <th>h SB</th>
                    <th>h MTO</th>
                    <th>h FS</th>
                    <th>Disp %</th>
                    <th>Util %</th>
                    <th>kW prom OP</th>
                    <th>Gas Mscf*</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((eq) => {
                    const q = data.equipos[eq];
                    return (
                      <tr key={eq}>
                        <td>
                          <strong>{eq}</strong>
                        </td>
                        <td>{fmt(q.mwh, 1)}</td>
                        <td>{((100 * q.mwh) / kpis.totalMwh).toFixed(1)}</td>
                        <td>{fmt(q.op)}</td>
                        <td>{fmt(q.sb)}</td>
                        <td>{q.mto}</td>
                        <td>{fmt(q.fs)}</td>
                        <td>{q.disp.toFixed(1)}</td>
                        <td>{q.util.toFixed(1)}</td>
                        <td>{fmt(q.kw_op)}</td>
                        <td>{fmt(q.gas_mscf)}</td>
                      </tr>
                    );
                  })}
                  <tr className="gen-table-total">
                    <td>
                      <strong>TOTAL FLOTA</strong>
                    </td>
                    <td>{fmt(kpis.totalMwh)}</td>
                    <td>100</td>
                    <td>{fmt(kpis.hoursOp)}</td>
                    <td colSpan={3} />
                    <td>{kpis.avgDisp.toFixed(1)}</td>
                    <td>{kpis.avgUtil.toFixed(1)}</td>
                    <td />
                    <td>{fmt(kpis.gasMscf)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ChartPanel>
        )}
      </div>

      {showNotes ? (
        <aside className="exec-source-note gen-notes">
          <p>
            <strong>Notas:</strong> Disponibilidad = (horas OP + SB) / horas calendario. Utilización = horas OP / horas
            calendario. Estados: OP operación, SB standby, PE pendiente, MTO mantenimiento, FS fuera de servicio, TR
            traslado. El consumo de gas del reporte es teórico (8,8 ft³/kWh); se muestra normalizado en Mscf. Diesel 2
            sin operación en el período (excluido). En ~24% de los registros diarios la suma de horas por estado no
            cierra en 24 h (huecos de registro), por lo que la disponibilidad mostrada es conservadora.
          </p>
        </aside>
      ) : null}
    </div>
  );
}
