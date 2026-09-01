import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import { buildDisponibilidadAnalisis } from "./DisponibilidadAnalisisBoard";
import { SlideNarrative } from "./SlideNarrative";

type Props = {
  month: string;
  monthLabel?: string;
};

const C = {
  op: "#0f766e",
  sb: "#38bdf8",
  pp: "#d97706",
  energy: "#7c3aed",
  gas: "#0f766e",
  diesel: "#d97706",
};

function fmtN(v: number, digits = 0) {
  return v.toLocaleString("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtH(v: number) {
  return `${fmtN(v)} h`;
}

function fmtMwh(kwh: number) {
  return `${fmtN(kwh / 1000, 1)} MWh`;
}

function fmtKwh(kwh: number) {
  return `${fmtN(kwh)} kWh`;
}

function fmtPct(v: number) {
  return `${(v * 100).toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`;
}

const tipStyle = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
};

function ChartTip({
  active,
  payload,
  label,
  unit = "h",
}: {
  active?: boolean;
  payload?: { name: string; value: number; color?: string }[];
  label?: string;
  unit?: "h" | "kWh";
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...tipStyle, padding: "0.45rem 0.65rem" }}>
      {label ? <p style={{ margin: "0 0 0.25rem", fontWeight: 650 }}>{label}</p> : null}
      {payload.map((p) => (
        <p key={p.name} style={{ margin: 0, color: p.color }}>
          {p.name}: {unit === "kWh" ? fmtKwh(Number(p.value ?? 0)) : fmtH(Number(p.value ?? 0))}
        </p>
      ))}
    </div>
  );
}

export function DisponibilidadHorasBoard({ month, monthLabel }: Props) {
  const a = buildDisponibilidadAnalisis(month);
  const cpw = COPOWER_MONTHLY_DATA[month as CopowerMonthKey];
  if (!a.programmed || a.dispCpw == null || !cpw) return null;

  const energyTotal = cpw.summary.energyGasKwh + cpw.summary.energyDieselKwh;
  const units = cpw.generationByEquipment.map((u) => ({
    tag: u.equipo,
    campo: u.campo,
    kwh: u.energiaKwh,
    op: u.horasOperacion,
    sb: u.horasStandBy,
    pp: u.horasPP,
    disp: u.horasOperacion + u.horasStandBy,
    cal: u.horasCalDia,
  }));
  const mix = [
    { name: "Operación", value: a.fleetCpw.op, fill: C.op },
    { name: "Stand-by", value: a.fleetCpw.sb, fill: C.sb },
    { name: "Preventivo", value: a.fleetCpw.pp, fill: C.pp },
  ];
  const energyCampo = cpw.generationByAsset.map((r) => ({
    campo: r.asset,
    Gas: r.gasKwh,
    Diésel: r.dieselKwh,
    total: r.gasKwh + r.dieselKwh,
  }));
  const energyUnits = [...units].sort((x, y) => y.kwh - x.kwh);
  const preventivo = units.filter((u) => u.pp > 0).sort((x, y) => y.pp - x.pp);

  return (
    <section className="panel">
      <SlideNarrative month={month} monthLabel={monthLabel ?? month} slide="desgloseHoras" />
      <details className="card disp-analisis hours-viz inf-conf-collapse" open>
        <summary className="inf-conf-collapse-sum">
          <div className="inf-conf-collapse-sum-main">
            <p className="eyebrow">4 · Desglose de horas{monthLabel ? ` · ${monthLabel}` : ""}</p>
            <h3>De las unidades al resultado concertado</h3>
          </div>
          <div className="hours-viz-formula" aria-label="Disponibles igual operación más stand-by">
            <span>{fmtN(a.fleetCpw.op)}</span>
            <em>+</em>
            <span>{fmtN(a.fleetCpw.sb)}</span>
            <em>=</em>
            <span>{fmtN(a.cpwAvailable)}</span>
            <em>/</em>
            <span>{fmtN(a.programmed)}</span>
            <em>=</em>
            <strong>{fmtPct(a.dispCpw)}</strong>
          </div>
        </summary>
        <div className="inf-conf-collapse-body">
        <div className="hours-viz-kpis">
          <article>
            <span>Energía entregada</span>
            <strong>{fmtMwh(energyTotal)}</strong>
            <small>
              {fmtKwh(cpw.summary.energyGasKwh)} gas · {fmtKwh(cpw.summary.energyDieselKwh)} diésel
            </small>
          </article>
          <article>
            <span>Operación</span>
            <strong>{fmtH(a.fleetCpw.op)}</strong>
            <small>Suma de horas en línea</small>
          </article>
          <article>
            <span>Stand-by</span>
            <strong>{fmtH(a.fleetCpw.sb)}</strong>
            <small>Disponible sin generar</small>
          </article>
          <article>
            <span>Preventivo</span>
            <strong>{fmtH(a.fleetCpw.pp)}</strong>
            <small>Calendario − disponibles</small>
          </article>
          <article>
            <span>Calendario</span>
            <strong>{fmtH(a.programmed)}</strong>
            <small>Horas programadas</small>
          </article>
          <article>
            <span>Disponibles</span>
            <strong>{fmtH(a.cpwAvailable)}</strong>
            <small>Operación + stand-by</small>
          </article>
        </div>

        <div className="hours-viz-grid hours-viz-row3">
          <div className="hours-viz-panel">
            <p className="eyebrow">Cómo se arma el calendario</p>
            <p className="hours-viz-sub">
              {fmtN(a.fleetCpw.op)} + {fmtN(a.fleetCpw.sb)} + {fmtN(a.fleetCpw.pp)} = {fmtN(a.programmed)} h
            </p>
            <div className="hours-viz-chart hours-viz-chart-pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={64}
                    paddingAngle={2}
                    stroke="var(--panel)"
                    strokeWidth={2}
                  >
                    {mix.map((r) => (
                      <Cell key={r.name} fill={r.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="hours-viz-donut-label">
                <strong>{fmtPct(a.dispCpw)}</strong>
                <span>disponibilidad</span>
              </div>
            </div>
            <ul className="hours-viz-mix hours-viz-mix-col">
              {mix.map((r) => (
                <li key={r.name}>
                  <i style={{ background: r.fill }} />
                  <span>{r.name}</span>
                  <b>{fmtH(r.value)}</b>
                </li>
              ))}
            </ul>
          </div>

          <div className="hours-viz-panel">
            <p className="eyebrow">Energía entregada por campo</p>
            <p className="hours-viz-sub">Total {fmtMwh(energyTotal)} · gas y diésel</p>
            <div className="hours-viz-chart hours-viz-chart-mid">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={energyCampo} margin={{ top: 22, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
                  <XAxis dataKey="campo" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 10 }} width={40} tickFormatter={(v) => fmtN(v / 1000)} />
                  <Tooltip content={<ChartTip unit="kWh" />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Gas" stackId="e" fill={C.gas} maxBarSize={64}>
                    <LabelList
                      dataKey="Gas"
                      position="center"
                      formatter={(v) => (Number(v) > 0 ? fmtMwh(Number(v)) : "")}
                      style={{ fill: "#fff", fontSize: 10, fontWeight: 700 }}
                    />
                  </Bar>
                  <Bar dataKey="Diésel" stackId="e" fill={C.diesel} radius={[6, 6, 0, 0]} maxBarSize={64}>
                    <LabelList
                      dataKey="total"
                      position="top"
                      formatter={(v) => fmtMwh(Number(v))}
                      style={{ fill: "var(--text)", fontSize: 11, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="hours-viz-panel">
            <p className="eyebrow">Energía entregada por unidad</p>
            <p className="hours-viz-sub">Suma {fmtMwh(energyTotal)}</p>
            <div className="hours-viz-chart hours-viz-chart-mid">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={energyUnits} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
                  <XAxis dataKey="tag" tick={{ fontSize: 9 }} interval={0} angle={-36} textAnchor="end" height={48} />
                  <YAxis tick={{ fontSize: 10 }} width={36} tickFormatter={(v) => fmtN(v / 1000)} />
                  <Tooltip content={<ChartTip unit="kWh" />} />
                  <Bar dataKey="kwh" name="Energía" fill={C.energy} radius={[3, 3, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="hours-viz-grid">
          <div className="hours-viz-panel">
            <p className="eyebrow">Operación y stand-by por unidad</p>
            <p className="hours-viz-sub">
              Suma {fmtN(a.fleetCpw.op)} + {fmtN(a.fleetCpw.sb)} = {fmtN(a.cpwAvailable)} h disponibles
            </p>
            <div className="hours-viz-chart hours-viz-chart-mid">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={units} margin={{ top: 6, right: 4, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
                  <XAxis dataKey="tag" tick={{ fontSize: 9 }} interval={0} angle={-36} textAnchor="end" height={48} />
                  <YAxis tick={{ fontSize: 10 }} width={32} tickFormatter={fmtN} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="op" name="Operación" stackId="u" fill={C.op} />
                  <Bar dataKey="sb" name="Stand-by" stackId="u" fill={C.sb} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="hours-viz-panel">
            <p className="eyebrow">Preventivo por unidad</p>
            <p className="hours-viz-sub">
              Suma {fmtN(a.fleetCpw.pp)} h · {fmtN(a.programmed)} − {fmtN(a.cpwAvailable)} = {fmtN(a.fleetCpw.pp)}
            </p>
            <div className="hours-viz-chart hours-viz-chart-mid">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={preventivo} margin={{ top: 6, right: 4, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
                  <XAxis dataKey="tag" tick={{ fontSize: 9 }} interval={0} angle={-36} textAnchor="end" height={48} />
                  <YAxis tick={{ fontSize: 10 }} width={32} tickFormatter={fmtN} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="pp" name="Preventivo" fill={C.pp} radius={[3, 3, 0, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        </div>
      </details>
    </section>
  );
}
