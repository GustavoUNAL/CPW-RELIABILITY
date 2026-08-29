import { useMemo, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ScreenShell } from "../ui/ScreenShell";
import {
  CONCERTACION_AGO_SOURCE,
  buildIndicadoresCompare,
  fmtH,
  fmtKwh,
  fmtPct,
  type IndicadorEstado,
  type IndicadorOficialRow,
  type IndicadoresGroupRow,
  type IndicadoresKpis,
  type IndicadoresUnitRow,
  type MtoCruceKind,
  type MtoCruzadoPack,
} from "./indicadoresCompare";

/** Paleta Office del Dashboard Excel (Juan Pabón). */
const XL = {
  blue: "#4472C4",
  orange: "#ED7D31",
  gray: "#A6A6A6",
  green: "#70AD47",
  tick: "var(--text-muted)",
  grid: "var(--border)",
};

const PIE_COLORS: Record<string, string> = {
  "CPW (J320/J420)": XL.blue,
  "CUMMINS (G10x)": XL.orange,
  "JINAN (JIN)": XL.gray,
  "JINAN Costayaco": "#5B9BD5",
  "JINAN Vonú": XL.gray,
};

type Props = {
  leafId: string;
  month: string;
  monthLabel: string;
};

function Kpi({
  label,
  value,
  hint,
  warn,
}: {
  label: string;
  value: string;
  hint?: string;
  warn?: boolean;
}) {
  return (
    <article className={`exec-kpi${warn ? " pending" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}

function GroupTable({
  title,
  rows,
  showFallas,
}: {
  title: string;
  rows: IndicadoresGroupRow[];
  showFallas?: boolean;
}) {
  return (
    <article className="card ind-subcard">
      <h4>{title}</h4>
      <div className="table-wrap">
        <table className="indicators-table">
          <thead>
            <tr>
              <th>Grupo</th>
              <th>Cant.</th>
              <th>kWh</th>
              <th>Hrs OP</th>
              <th>Disp.</th>
              {showFallas ? <th>Fallas</th> : <th>% gen.</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className={r.label === "TOTAL" ? "row-sistema" : undefined}>
                <td>
                  <strong>{r.label}</strong>
                </td>
                <td>{r.count}</td>
                <td>{fmtKwh(r.kwh)}</td>
                <td>{fmtH(r.op)}</td>
                <td>{fmtPct(r.disp, 1)}</td>
                <td>{showFallas ? (r.fallas ?? 0) : r.share == null ? "—" : fmtPct(r.share, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function UnitTable({ units, shareOf }: { units: IndicadoresUnitRow[]; shareOf: number }) {
  const totalOp = units.reduce((s, u) => s + u.op, 0);
  const totalSb = units.reduce((s, u) => s + u.sb, 0);
  const totalKwh = units.reduce((s, u) => s + u.kwh, 0);
  const totalPp = units.reduce((s, u) => s + u.pp, 0);
  const totalCorr = units.reduce((s, u) => s + u.corr, 0);
  const totalFallas = units.reduce((s, u) => s + u.fallas, 0);
  const totalCal = units.reduce((s, u) => s + u.cal, 0);
  const fleetDisp = totalCal ? (totalOp + totalSb) / totalCal : null;

  return (
    <div className="table-wrap">
      <table className="indicators-table">
        <thead>
          <tr>
            <th>Unidad</th>
            <th>kWh</th>
            <th>Hrs OP</th>
            <th>Hrs SB</th>
            <th>Disp.</th>
            <th>Fallas</th>
            <th>Hrs MMT Prev</th>
            <th>Hrs MMT Corr</th>
            <th>% del total kWh</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.tag}>
              <td>
                <strong>{u.tag}</strong>
              </td>
              <td>{fmtKwh(u.kwh)}</td>
              <td>{fmtH(u.op)}</td>
              <td>{fmtH(u.sb)}</td>
              <td>{fmtPct(u.disp, 2)}</td>
              <td>{u.fallas}</td>
              <td>{fmtH(u.pp)}</td>
              <td>{fmtH(u.corr)}</td>
              <td>{shareOf ? fmtPct(u.kwh / shareOf, 1) : "—"}</td>
            </tr>
          ))}
          <tr className="row-sistema">
            <td>
              <strong>TOTAL</strong>
            </td>
            <td>{fmtKwh(totalKwh)}</td>
            <td>{fmtH(totalOp)}</td>
            <td>{fmtH(totalSb)}</td>
            <td>{fmtPct(fleetDisp, 2)}</td>
            <td>{totalFallas}</td>
            <td>{fmtH(totalPp)}</td>
            <td>{fmtH(totalCorr)}</td>
            <td>100,0 %</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function storyFacts(units: IndicadoresUnitRow[]) {
  const kwh = units.reduce((s, u) => s + u.kwh, 0);
  const op = units.reduce((s, u) => s + u.op, 0);
  const sb = units.reduce((s, u) => s + u.sb, 0);
  const pp = units.reduce((s, u) => s + u.pp, 0);
  const fallas = units.reduce((s, u) => s + u.fallas, 0);
  const top = [...units].sort((a, b) => b.kwh - a.kwh)[0];
  const lowDisp = [...units].sort((a, b) => a.disp - b.disp)[0];
  const highSb = [...units].sort((a, b) => b.sb - a.sb)[0];
  const highPp = [...units].sort((a, b) => b.pp - a.pp)[0];
  return { kwh, op, sb, pp, fallas, top, lowDisp, highSb, highPp, n: units.length };
}

function StorySection({
  step,
  title,
  lead,
  children,
}: {
  step: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <section className="ind-story">
      <header className="ind-story-head">
        <span className="ind-story-step">{step}</span>
        <div>
          <h3>{title}</h3>
          <p>{lead}</p>
        </div>
      </header>
      <div className="ind-story-body">{children}</div>
    </section>
  );
}

function ChartCard({
  title,
  lead,
  height,
  children,
}: {
  title: string;
  lead?: string;
  height: number;
  children: ReactNode;
}) {
  return (
    <article className="dash-chart-panel ind-chart-card">
      <h4>{title}</h4>
      {lead ? <p className="ind-chart-lead">{lead}</p> : null}
      <div className="ind-chart-frame" style={{ height }}>
        {children}
      </div>
    </article>
  );
}

function ExcelCharts({
  units,
  byType,
  fromStep = 2,
}: {
  units: IndicadoresUnitRow[];
  byType: IndicadoresGroupRow[];
  fromStep?: number;
}) {
  const kwhBars = useMemo(() => units.map((u) => ({ tag: u.tag, kwh: u.kwh })), [units]);
  const dispBars = useMemo(() => units.map((u) => ({ tag: u.tag, disp: u.disp })), [units]);
  const pieData = useMemo(
    () => byType.filter((g) => g.label !== "TOTAL").map((g) => ({ name: g.label, value: g.kwh })),
    [byType],
  );
  const stackedUnits = useMemo(() => units.map((u) => ({ tag: u.tag, op: u.op, sb: u.sb })), [units]);
  const mmt = useMemo(() => units.map((u) => ({ tag: u.tag, prev: u.pp, corr: u.corr })), [units]);
  const f = storyFacts(units);
  const opShare = f.op + f.sb ? f.op / (f.op + f.sb) : 0;
  if (!f.top || !f.lowDisp || !f.highSb || !f.highPp) return null;

  return (
    <>
      <StorySection
        step={String(fromStep)}
        title="Quién está generando"
        lead={`${f.top.tag} lidera con ${fmtKwh(f.top.kwh)}. El parque suma ${fmtKwh(f.kwh)} en ${f.n} unidades.`}
      >
        <ChartCard
          title="kWh generados por unidad"
          lead="Barras horizontales · la máquina que más aporta queda a la derecha."
          height={420}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kwhBars} layout="vertical" margin={{ top: 8, right: 28, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={XL.grid} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: XL.tick }}
                tickFormatter={(v) => Number(v).toLocaleString("es-CO")}
              />
              <YAxis type="category" dataKey="tag" width={72} tick={{ fontSize: 11, fill: XL.tick }} interval={0} />
              <Tooltip formatter={(v) => [fmtKwh(Number(v)), "kWh"]} />
              <Bar dataKey="kwh" name="KWH generados" fill={XL.blue} radius={[0, 3, 3, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StorySection>

      <StorySection
        step={String(fromStep + 1)}
        title="De qué familia sale la energía"
        lead="Los Jenbacher CPW concentran la generación. Cummins aporta poco kWh: casi todo el mes estuvieron en stand-by."
      >
        <div className="ind-story-pair ind-story-pair--pie">
          <ChartCard title="Distribución de kWh por tipo" height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  outerRadius={100}
                  label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={PIE_COLORS[d.name] ?? XL.blue} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [fmtKwh(Number(v)), String(name)]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <GroupTable title="Resumen por tipo" rows={byType} />
        </div>
      </StorySection>

      <StorySection
        step={String(fromStep + 2)}
        title="¿Estuvieron disponibles?"
        lead={
          f.lowDisp
            ? `Casi toda la flota ronda el 99 %. La más baja es ${f.lowDisp.tag} (${fmtPct(f.lowDisp.disp, 1)}). Stand-by cuenta como disponible.`
            : "Disponibilidad por unidad."
        }
      >
        <ChartCard
          title="Disponibilidad por unidad"
          lead="(horas operación + stand-by) / calendario. La línea de 100 % es el techo."
          height={420}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dispBars} layout="vertical" margin={{ top: 8, right: 28, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={XL.grid} horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 1.05]}
                tick={{ fontSize: 11, fill: XL.tick }}
                tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
              />
              <YAxis type="category" dataKey="tag" width={72} tick={{ fontSize: 11, fill: XL.tick }} interval={0} />
              <Tooltip formatter={(v) => [fmtPct(Number(v), 1), "Disponibilidad"]} />
              <Bar dataKey="disp" name="Disponibilidad" fill={XL.orange} radius={[0, 3, 3, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StorySection>

      <StorySection
        step={String(fromStep + 3)}
        title="Cómo se usaron las horas"
        lead={`${fmtH(f.op)} en línea y ${fmtH(f.sb)} en stand-by. ${f.highSb.tag} es quien más espera (${fmtH(f.highSb.sb)}). El total de flota va aparte, para que las barras por máquina no se aplasten.`}
      >
        <ChartCard
          title="Operación vs stand-by · por unidad"
          lead="Cada columna suma el calendario de esa máquina (~528 h en agosto 01–22)."
          height={360}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedUnits} margin={{ top: 12, right: 16, left: 8, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={XL.grid} />
              <XAxis dataKey="tag" tick={{ fontSize: 10, fill: XL.tick }} interval={0} angle={-38} textAnchor="end" height={64} />
              <YAxis domain={[0, 600]} tick={{ fontSize: 11, fill: XL.tick }} />
              <Tooltip formatter={(v, name) => [`${Number(v).toLocaleString("es-CO")} h`, String(name)]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="op" name="Hrs operación" stackId="h" fill={XL.orange} />
              <Bar dataKey="sb" name="Hrs stand-by" stackId="h" fill={XL.gray} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="ind-fleet-hours" aria-label="Total de horas de flota">
          <div className="ind-fleet-hours-meta">
            <strong>Flota completa</strong>
            <span>
              {fmtH(f.op)} operación · {fmtH(f.sb)} stand-by
            </span>
          </div>
          <div className="ind-fleet-hours-track">
            <div className="ind-fleet-hours-op" style={{ width: `${opShare * 100}%` }} />
            <div className="ind-fleet-hours-sb" style={{ width: `${(1 - opShare) * 100}%` }} />
          </div>
        </div>
      </StorySection>

      <StorySection
        step={String(fromStep + 4)}
        title="El mantenimiento que sí se hizo"
        lead={
          f.pp
            ? `${fmtH(f.pp)} de preventivo en el periodo. ${f.highPp.tag} concentra el pico (${fmtH(f.highPp.pp)}). Correctivo imputable: ${fmtH(units.reduce((s, u) => s + u.corr, 0))}.`
            : "Sin horas de mantenimiento en este recorte."
        }
      >
        <ChartCard title="Horas de mantenimiento · preventivo vs correctivo" height={340}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mmt} margin={{ top: 12, right: 16, left: 8, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={XL.grid} />
              <XAxis dataKey="tag" tick={{ fontSize: 10, fill: XL.tick }} interval={0} angle={-38} textAnchor="end" height={64} />
              <YAxis tick={{ fontSize: 11, fill: XL.tick }} />
              <Tooltip formatter={(v, name) => [`${Number(v).toLocaleString("es-CO")} h`, String(name)]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="prev" name="MMT preventivo" fill={XL.blue} barSize={18} />
              <Bar dataKey="corr" name="MMT correctivo" fill={XL.orange} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StorySection>
    </>
  );
}

function FallasAnalisis({ kpis, nUnitsText }: { kpis: IndicadoresKpis; nUnitsText: string }) {
  const tasa = kpis.nUnits ? kpis.fallas / kpis.nUnits : 0;
  const rows = [
    { metric: "Total Fallas", value: String(kpis.fallas), unit: "Fallas", desc: "Suma total período", estado: "Bueno", ok: true },
    { metric: "Unidades c/Fallas", value: String(Math.round((kpis.pctUnidFallas ?? 0) * kpis.nUnits)), unit: "Unidades", desc: "Conteo >0 fallas", estado: "Bueno", ok: true },
    { metric: "Tasa de Fallas", value: tasa.toFixed(2), unit: "Fallas/Unid", desc: `Total/${nUnitsText} unidades`, estado: "Bueno", ok: true },
    { metric: "MTBF", value: kpis.mtbf == null ? "N/A" : fmtH(kpis.mtbf), unit: "Horas", desc: "Hrs Op / Fallas", estado: kpis.mtbf == null ? "N/A" : "Excelente", ok: true },
    { metric: "MTTR", value: kpis.mttr == null ? "N/A" : fmtH(kpis.mttr), unit: "Horas", desc: "Hrs MMT Corr / Fallas", estado: kpis.mttr == null ? "N/A" : "Seguimiento", ok: true },
    { metric: "Indisponibilidad", value: fmtPct(kpis.indisp, 1), unit: "%", desc: "100% − Disponibilidad", estado: "Bueno", ok: true },
  ];
  return (
    <article className="card ind-subcard ind-fallas-card">
      <h4>Análisis de fallas</h4>
      <div className="table-wrap">
        <table className="indicators-table">
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Valor</th>
              <th>Unidad</th>
              <th>Descripción</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.metric}>
                <td>
                  <strong>{r.metric}</strong>
                </td>
                <td>{r.value}</td>
                <td>{r.unit}</td>
                <td>{r.desc}</td>
                <td>
                  <span className={`badge ${r.ok ? "success" : "danger"}`}>{r.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

const ESTADO_LABEL: Record<IndicadorEstado, string> = {
  cumple: "Cumple",
  alerta: "Alerta",
  no_aplica: "N/A",
  info: "Info",
};

const ESTADO_BADGE: Record<IndicadorEstado, string> = {
  cumple: "success",
  alerta: "danger",
  no_aplica: "neutral",
  info: "info",
};

const CRUCE_LABEL: Record<MtoCruceKind, string> = {
  calza: "Calza",
  desfase: "Desfase",
  solo_bitacora: "Solo bitácora",
  diesel_sb: "Diésel / SB",
};

const CRUCE_BADGE: Record<MtoCruceKind, string> = {
  calza: "success",
  desfase: "warning",
  solo_bitacora: "warning",
  diesel_sb: "neutral",
};

function TablaOficial({ rows, aPct }: { rows: IndicadorOficialRow[]; aPct: number | null }) {
  const aOk = aPct != null && aPct >= 0.98;
  return (
    <StorySection
      step="1"
      title="Tabla de indicadores"
      lead="Tabla 13 del contrato, con horas de la concertación. Stand-by cuenta como disponible. El preventivo resta A% y no resta R%."
    >
      <article className={`ind-verdict ${aOk ? "ind-verdict-ok" : "ind-verdict-gap"}`}>
        {aOk ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
        <div>
          <p className="eyebrow">Fuente · concertación 01–22</p>
          <h3>A% contractual {fmtPct(aPct, 2)}. Meta ≥ 98%.</h3>
          <p>
            No se lee el recuadro del Dpto. La utilización (solo OP) no es este indicador. El
            archivo de horas llega al 22 aunque el nombre diga 01–23.
          </p>
        </div>
      </article>
      <div className="table-wrap">
        <table className="indicators-table ind-tabla-oficial">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Fórmula</th>
              <th>Valor</th>
              <th>Meta</th>
              <th>Estado</th>
              <th>Lectura</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.id === "a" ? "row-sistema" : undefined}>
                <td>
                  <strong>{r.nombre}</strong>
                </td>
                <td>{r.formula}</td>
                <td>
                  <strong>{r.valor}</strong>
                </td>
                <td>{r.meta}</td>
                <td>
                  <span className={`badge ${ESTADO_BADGE[r.estado]}`}>{ESTADO_LABEL[r.estado]}</span>
                </td>
                <td>{r.lectura}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StorySection>
  );
}

function MtoCruzadoBoard({ pack }: { pack: MtoCruzadoPack }) {
  const gas = pack.rows.filter((r) => r.familia === "gas");
  return (
    <StorySection
      step="2"
      title="Sábana vs horas concertadas"
      lead={`Plan a gas 01–22: ${pack.gasEjecutadosBitacora}/${pack.gasPlan} con PP en bitácora. Diésel ${pack.dieselConPp}/${pack.dieselPlan} PP (350 h OP / equipo en stand-by). Las ${fmtH(pack.ppHoras)} de preventivo sí entran a A%.`}
    >
      <div className="table-wrap">
        <table className="indicators-table">
          <thead>
            <tr>
              <th>Unidad</th>
              <th>Sábana</th>
              <th>H MTO / H-H</th>
              <th>Estado sábana</th>
              <th>Bitácora PP</th>
              <th>Horas PP</th>
              <th>Cruce</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {pack.rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.tag}</strong>
                  <div className="muted" style={{ fontSize: "0.75rem", marginTop: 4 }}>
                    {r.familia === "gas" ? "Gas" : "Diésel"}
                  </div>
                </td>
                <td>{r.sabanaFecha ?? "—"}</td>
                <td>
                  {r.sabanaHorasMto == null ? "—" : `${r.sabanaHorasMto} / ${r.sabanaHh ?? "—"}`}
                </td>
                <td>{r.sabanaEstado}</td>
                <td>{r.concFecha ?? "—"}</td>
                <td>{r.concPp ? fmtH(r.concPp) : "0 h"}</td>
                <td>
                  <span className={`badge ${CRUCE_BADGE[r.cruce]}`}>{CRUCE_LABEL[r.cruce]}</span>
                </td>
                <td>{r.nota}</td>
              </tr>
            ))}
            <tr className="row-sistema">
              <td>
                <strong>Gas 01–22</strong>
              </td>
              <td colSpan={4}>{gas.length} marcas / extras</td>
              <td>{fmtH(gas.reduce((s, r) => s + r.concPp, 0))}</td>
              <td>
                <span className="badge success">
                  {pack.gasEjecutadosBitacora}/{pack.gasPlan}
                </span>
              </td>
              <td>Actividades a gas con PP en concertación.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ margin: "0.65rem 0 0", fontSize: "0.85rem" }}>
        {pack.pdfNota}
      </p>
    </StorySection>
  );
}

export function IndicadoresDashboard({ leafId: _leafId, month, monthLabel }: Props) {
  const pack = useMemo(() => buildIndicadoresCompare(month, monthLabel), [month, monthLabel]);
  const snap = pack.arteaga;
  const sourceFile = snap?.sourceFile || CONCERTACION_AGO_SOURCE;
  const aPct = pack.contrato?.aContrato ?? null;

  return (
    <ScreenShell
      report="copower"
      title="Indicadores"
      subtitle={`${monthLabel} · concertación de horas y sábana de mantenimiento`}
      sourceFile={sourceFile}
    >
      <div className="exec-dashboard ind-dashboard ind-informe">
        {pack.tablaOficial.length ? (
          <TablaOficial rows={pack.tablaOficial} aPct={aPct} />
        ) : (
          <p className="empty-state">Sin concertación COPOWER para {monthLabel}.</p>
        )}

        {snap ? (
          <StorySection
            step="3"
            title="Horas concertadas por unidad"
            lead={`${snap.header.nUnits} máquinas · ${fmtKwh(snap.header.kwh)} · ${fmtH(snap.header.op)} OP · ${fmtH(snap.header.sb)} SB · ${fmtH(snap.header.pp)} PP · ${fmtH(snap.header.pfCli)} externas. Calendario ${fmtH(snap.header.cal)}.`}
          >
            <div className="exec-kpi-row">
              <Kpi label="kWh" value={fmtKwh(snap.header.kwh)} />
              <Kpi label="OP" value={fmtH(snap.header.op)} />
              <Kpi label="Stand-by" value={fmtH(snap.header.sb)} />
              <Kpi label="A% (OP+SB)" value={fmtPct(snap.header.dispFleet, 2)} hint="Contractual" />
              <Kpi label="PP" value={fmtH(snap.header.pp)} />
              <Kpi label="Fallas" value={String(snap.header.fallas)} />
            </div>
            <UnitTable units={snap.units} shareOf={snap.header.kwh} />
            <div className="ind-story-pair">
              <GroupTable title="Por campo" rows={snap.byField} showFallas />
              <GroupTable title="Por tipo" rows={snap.byType} />
            </div>
            <FallasAnalisis kpis={snap.header} nUnitsText={String(snap.header.nUnits)} />
          </StorySection>
        ) : null}

        {pack.mtoCruzado ? <MtoCruzadoBoard pack={pack.mtoCruzado} /> : null}

        {snap ? <ExcelCharts units={snap.units} byType={snap.byType} fromStep={4} /> : null}
      </div>
    </ScreenShell>
  );
}

