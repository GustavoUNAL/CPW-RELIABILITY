import { Cpu, Flame, FlaskConical, Gauge, TrendingDown, Zap } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildEnergyEfficiency,
  EFICIENCIA_MEDIDA_FORMULA,
  KWH_TO_BTU,
  REPORT_HEATING_VALUE,
} from "./energyEfficiency";
import { checkChromatography, GAS_CHROMATOGRAPHIES, GAS_MRU_TRATADO } from "./gasChromatography";
import { buildUnitEfficiency, GAS_SUPPLY_LABEL } from "./unitEfficiency";

type Props = {
  month: string;
  monthLabel: string;
};

const SUPPLY_COLOR: Record<string, string> = {
  moqueta: "#0f766e",
  mru: "#6366f1",
  vonu: "#94a3b8",
};

const num = (v: number | null | undefined, digits = 2) =>
  v == null || Number.isNaN(v)
    ? "N/D"
    : v.toLocaleString("es-CO", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });

const int = (v: number | null | undefined) =>
  v == null || Number.isNaN(v) ? "N/D" : Math.round(v).toLocaleString("es-CO");

export function EficienciaInformeSlide({ month, monthLabel }: Props) {
  const snap = useMemo(() => buildEnergyEfficiency(month), [month]);
  const units = useMemo(() => buildUnitEfficiency(month), [month]);

  if (!snap) {
    return (
      <p className="empty-state">Sin lecturas del totalizador de gas Moqueta para {monthLabel}.</p>
    );
  }

  const { month: m, previous } = snap;
  const check = checkChromatography(GAS_MRU_TRATADO);
  const coveragePct = (m.spanDays / m.calendarDays) * 100;

  const unitRows = units?.rows.filter((r) => r.efficiencyHhvPct != null) ?? [];
  const unitChart = unitRows.map((r) => ({
    unit: r.unit,
    eficiencia: r.efficiencyHhvPct != null ? Number(r.efficiencyHhvPct.toFixed(1)) : null,
    carga: r.loadFactorPct != null ? Number(r.loadFactorPct.toFixed(0)) : null,
    supply: r.supply,
  }));

  const intervalChart = m.intervals.map((i) => ({
    label: i.to.slice(5),
    hr: i.heatRateFt3Kwh,
  }));

  return (
    <div className="rep-slide eff-slide">
      <div className="rep-slide-kpis eff-slide-kpis" aria-label="Indicadores de eficiencia">
        <article>
          <Gauge size={15} />
          <span>Heat rate medido</span>
          <strong>{int(snap.heatRateBtuKwh)}</strong>
          <small>
            BTU/kWh · {num(snap.heatRateFt3Kwh, 2)} ft³/kWh · {num(snap.kwhPerMcf, 1)} kWh por MCF
          </small>
        </article>
        <article>
          <Zap size={15} />
          <span>Eficiencia línea MQT</span>
          <strong>{num(snap.efficiencyHhvPct, 1)} %</strong>
          <small>
            HHV · {num(snap.efficiencyLhvPct, 1)} % sobre LHV
            <br />
            Base contractual {REPORT_HEATING_VALUE.hhvBtuScf} BTU/scf
          </small>
        </article>
        <article>
          <Cpu size={15} />
          <span>Eficiencia planta</span>
          <strong>{num(units?.totals.efficiencyHhvPct, 1)} %</strong>
          <small>
            HHV estimado · {unitRows.length} unidades · {int(units?.totals.energyKwh)} kWh
            <br />
            Base contractual {REPORT_HEATING_VALUE.hhvBtuScf} BTU/scf
          </small>
        </article>
        <article>
          <Flame size={15} />
          <span>Gas del mes</span>
          <strong>{int(units?.totals.gasMcf)}</strong>
          <small>
            MCF estimados planta · {int(m.gasMcf)} MCF medidos MQT ·{" "}
            {int(units?.totals.energyInputMmbtu)} MMBTU
          </small>
        </article>
        <article>
          <TrendingDown size={15} />
          <span>vs {previous?.month.monthLabel ?? "mes anterior"}</span>
          <strong>
            {previous?.deltaHeatRatePct == null
              ? "—"
              : `${previous.deltaHeatRatePct > 0 ? "+" : ""}${num(previous.deltaHeatRatePct, 1)} %`}
          </strong>
          <small>
            {previous?.deltaEfficiencyPp == null
              ? "Sin base comparable"
              : `${num(previous.deltaEfficiencyPp, 1)} pp · ${previous.month.monthLabel} ${num(previous.efficiencyHhvPct, 1)} %`}
          </small>
        </article>
        <article>
          <FlaskConical size={15} />
          <span>Poder calorífico MRU</span>
          <strong>{GAS_MRU_TRATADO.hhvRealBtuScf}</strong>
          <small>
            BTU/scf HHV real · {GAS_MRU_TRATADO.lhvRealBtuScf} LHV
            <br />
            Cromatografía {GAS_MRU_TRATADO.shortLabel} · base informe{" "}
            {REPORT_HEATING_VALUE.hhvBtuScf} BTU/scf
          </small>
        </article>
        <article className="eff-kpi-formula">
          <Zap size={15} />
          <span>Fórmula Orden 1</span>
          <div
            className="eff-formula-block"
            aria-label="Eta porcentaje igual a kW por 3412, dividido entre SCF por hora por PCI en BTU por SCF, por 100. Meta mayor o igual a 37 por ciento."
          >
            <em>
              η<span>(%)</span>
            </em>
            <span className="eff-formula-op">=</span>
            <span className="eff-formula-frac">
              <span>
                kW × {KWH_TO_BTU}
              </span>
              <span>
                SCF/h × PCI (BTU/SCF)
              </span>
            </span>
            <span className="eff-formula-op">×</span>
            <strong>100</strong>
            <span className="eff-formula-meta">≥ 37%</span>
          </div>
          <small>PCI · poder calorífico inferior · meta contractual ≥ 37 %</small>
        </article>
      </div>

      <div className="rep-slide-charts eff-slide-charts">
        <article className="rep-slide-chart">
          <header>
            <h4>Eficiencia y carga por máquina</h4>
            <p>η HHV estimada (barras) vs factor de carga (línea) · verde = línea Moqueta medida</p>
          </header>
          <div className="rep-slide-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={unitChart} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
                <XAxis dataKey="unit" tick={{ fontSize: 9 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 9 }}
                  width={32}
                  domain={[0, "auto"]}
                  unit=" %"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 9 }}
                  width={32}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(v, name) => [`${v} %`, name === "eficiencia" ? "η HHV" : "Carga"]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="left" dataKey="eficiencia" name="η HHV" radius={[3, 3, 0, 0]}>
                  {unitChart.map((r) => (
                    <Cell key={r.unit} fill={SUPPLY_COLOR[r.supply] ?? "#6366f1"} />
                  ))}
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="carga"
                  name="Factor de carga"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rep-slide-chart">
          <header>
            <h4>Heat rate por intervalo</h4>
            <p>ft³/kWh entre lecturas del totalizador · línea = promedio del mes</p>
          </header>
          <div className="rep-slide-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intervalChart} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={1} />
                <YAxis tick={{ fontSize: 9 }} width={28} domain={[0, "auto"]} />
                <Tooltip formatter={(v) => [`${v} ft³/kWh`, "Heat rate"]} />
                {snap.heatRateFt3Kwh != null ? (
                  <ReferenceLine
                    y={snap.heatRateFt3Kwh}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    label={{ value: num(snap.heatRateFt3Kwh, 2), fontSize: 9, position: "right" }}
                  />
                ) : null}
                <Bar dataKey="hr" name="Heat rate" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="rep-slide-tables eff-slide-tables">
        <section className="rep-slide-table-panel">
          <header>
            <h4>Eficiencia estimada por máquina</h4>
            <p>
              Ancla medida {num(units?.anchorEfficiencyHhvPct, 1)} % → plena carga{" "}
              {num(units?.fullLoadEfficiencyHhvPct, 1)} % · reparto por factor de carga
            </p>
          </header>
          <div className="table-wrap ev-category-table-wrap">
            <table className="ev-category-table rep-slide-table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Ramal</th>
                  <th className="ev-col-num">MWh</th>
                  <th className="ev-col-num">kW / nom</th>
                  <th className="ev-col-num">FC</th>
                  <th className="ev-col-num">ft³/kWh</th>
                  <th className="ev-col-num">η HHV</th>
                  <th className="ev-col-num">MCF</th>
                </tr>
              </thead>
              <tbody>
                {unitRows.map((r) => (
                  <tr key={r.unit} className={r.gasMeasured ? "row-repeat" : undefined}>
                    <td>
                      <strong>{r.unit}</strong>
                      {r.nominalAssumed ? " *" : ""}
                    </td>
                    <td>{GAS_SUPPLY_LABEL[r.supply]}</td>
                    <td className="ev-col-num">{int(r.energyKwh / 1000)}</td>
                    <td className="ev-col-num">
                      {int(r.avgLoadKw)} / {int(r.nominalKw)}
                    </td>
                    <td className="ev-col-num">{num(r.loadFactorPct, 0)} %</td>
                    <td className="ev-col-num">{num(r.heatRateFt3Kwh, 2)}</td>
                    <td className="ev-col-num">{num(r.efficiencyHhvPct, 1)} %</td>
                    <td className="ev-col-num">{int(r.gasMcf)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="rep-slide-note">
            Fila resaltada: gas medido con totalizador. * nominal asumido de la familia de motores.
            Sin nominal en el log: G101V, G102J y G102K, excluidas del total.
          </p>
        </section>

        <section className="rep-slide-table-panel">
          <header>
            <h4>Cromatografía y trazabilidad</h4>
            <p>{EFICIENCIA_MEDIDA_FORMULA}</p>
          </header>
          <div className="table-wrap ev-category-table-wrap">
            <table className="ev-category-table rep-slide-table">
              <thead>
                <tr>
                  <th>Muestra</th>
                  <th className="ev-col-num">C1+C2</th>
                  <th className="ev-col-num">Inertes</th>
                  <th className="ev-col-num">HHV real</th>
                  <th className="ev-col-num">LHV real</th>
                  <th className="ev-col-num">η con este gas</th>
                </tr>
              </thead>
              <tbody>
                {GAS_CHROMATOGRAPHIES.map((gas) => {
                  const c = checkChromatography(gas);
                  const scenario = snap.scenarios.find((s) => s.id === gas.id);
                  return (
                    <tr key={gas.id} className={scenario?.isReference ? "row-repeat" : undefined}>
                      <td>
                        <strong>{gas.shortLabel}</strong>
                        {scenario?.isReference ? " · referencia" : ""}
                      </td>
                      <td className="ev-col-num">{num(c.lightEndsPct, 1)} %</td>
                      <td className="ev-col-num">{num(c.inertsPct, 1)} %</td>
                      <td className="ev-col-num">{gas.hhvRealBtuScf}</td>
                      <td className="ev-col-num">{gas.lhvRealBtuScf}</td>
                      <td className="ev-col-num">{num(scenario?.efficiencyHhvPct, 1)} %</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="table-wrap ev-category-table-wrap">
            <table className="ev-category-table rep-slide-table">
              <tbody>
                <tr>
                  <td>Ventana medida</td>
                  <td>
                    <strong>
                      {m.from} → {m.to}
                    </strong>{" "}
                    · {num(m.spanDays, 1)} de {m.calendarDays} días ({coveragePct.toFixed(0)} %) ·{" "}
                    {m.readingsUsed}/{m.readingsRaw} lecturas
                  </td>
                </tr>
                <tr>
                  <td>Verificación cromatografía</td>
                  <td>
                    Composición suma {num(check.sumMolPct, 2)} % · HHV recalculado{" "}
                    {int(check.hhvFromCompositionBtuScf)} BTU/scf frente a{" "}
                    {GAS_MRU_TRATADO.hhvIdealBtuScf} de laboratorio ({num(check.hhvDeviationPct, 1)}{" "}
                    %)
                  </td>
                </tr>
                <tr>
                  <td>Presión MQT</td>
                  <td>
                    Media {num(m.pressureMqtAvgPsi, 0)} psi · mínima {num(m.pressureMqtMinPsi, 0)}{" "}
                    psi · {m.lowPressureReadings} lecturas bajo 130 psi
                  </td>
                </tr>
                <tr>
                  <td>Gas excedente</td>
                  <td>
                    {snap.gasExcessMcf == null
                      ? "Sin base comparable"
                      : `${int(snap.gasExcessMcf)} MCF frente al heat rate de ${previous?.month.monthLabel}`}
                    {units?.totals.gasSavingMcf != null
                      ? ` · ${int(units.totals.gasSavingMcf)} MCF recuperables igualando el mejor factor de carga`
                      : ""}
                  </td>
                </tr>
                {previous ? (
                  <tr>
                    <td>Conciliación {previous.month.monthLabel}</td>
                    <td>
                      Recalculado {num(previous.efficiencyHhvPct, 1)} % contra{" "}
                      {previous.reportedEfficiencyPct != null
                        ? `${previous.reportedEfficiencyPct} % publicado en el informe`
                        : "el informe anterior"}{" "}
                      · misma base de {REPORT_HEATING_VALUE.hhvBtuScf} BTU/scf
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td>Salvedad</td>
                  <td>
                    {REPORT_HEATING_VALUE.measuredOnLine
                      ? "Cromatografía propia de la línea Moqueta"
                      : `La línea Moqueta no tiene cromatografía propia. Se mantiene la base de ${REPORT_HEATING_VALUE.hhvBtuScf} BTU/scf de los informes anteriores para comparar mes a mes; con el gas tratado del MRU la eficiencia bajaría al ${num(snap.scenarios.find((s) => s.id === "mru-tratado")?.efficiencyHhvPct, 1)} %.`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
