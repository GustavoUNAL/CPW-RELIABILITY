import { Gauge, Wrench, Zap } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CONTRACTUAL_KPI_TARGETS } from "../contracts/gteOrders";
import { loadOperacionPack } from "../operacion/api";
import { EFICIENCIA_FORMULA, eficienciaCampoSnapshot } from "../operacion/eficiencia";
import { MetricGlossary, MetricLabel } from "../ui/metricDefs";
import {
  COPOWER_MONTHLY_DATA,
  COPOWER_MONTH_ORDER,
  COPOWER_SOURCE_FILE,
  type CopowerMonthKey,
} from "./copowerMonthly";

const pct = (ratio: number | null | undefined, digits = 2) =>
  ratio == null || Number.isNaN(ratio) ? "N/D" : `${(ratio * 100).toFixed(digits)}%`;
const kwh = (value: number) => `${Math.round(value).toLocaleString("es-CO")} kWh`;
const hours = (value: number | null | undefined) =>
  value == null || Number.isNaN(value) ? "N/D" : `${value.toFixed(1)} h`;
const META_EFF = CONTRACTUAL_KPI_TARGETS.efficiencyPct;

type Props = {
  month: CopowerMonthKey;
};

export function CopowerResumen({ month }: Props) {
  const data = COPOWER_MONTHLY_DATA[month];
  const monthIdx = COPOWER_MONTH_ORDER.indexOf(month);
  const trendData = useMemo(
    () =>
      COPOWER_MONTH_ORDER.slice(0, monthIdx + 1).map((m) => {
        const snap = COPOWER_MONTHLY_DATA[m];
        return {
          month: m,
          disponibilidad: snap.kpi.availability == null ? null : snap.kpi.availability * 100,
          confiabilidad: snap.kpi.reliability == null ? null : snap.kpi.reliability * 100,
          generacionMwh: snap.totalGenerationKwh / 1000,
          mtbf: snap.summary.mtbfHours,
          mttr: snap.summary.mttrHours,
        };
      }),
    [monthIdx],
  );
  const topUnits = [...data.generationByEquipment]
    .sort((a, b) => b.energiaKwh - a.energiaKwh)
    .slice(0, 10);
  const recentEvents = data.eventLog.slice(0, 12);
  const failureEvents = data.eventLog.filter((e) => e.eventType === "Falla");
  const oilTotal = data.consumos.reduce((acc, row) => acc + row.adicionAceite + row.cambioAceite, 0);
  const units = data.machineIndicators.filter((m) => m.unidad !== "SISTEMA N");
  const hoursData = useMemo(
    () => [
      { estado: "Operación", horas: data.summary.hoursOperated, fill: "#0e6e8c" },
      { estado: "Stand-by", horas: data.summary.hoursStandby, fill: "#38bdf8" },
      { estado: "Preventivo", horas: data.summary.hoursPreventive, fill: "#22c55e" },
      { estado: "FS asociado COPOWER", horas: data.summary.hoursFailureCopower, fill: "#ef4444" },
    ],
    [data],
  );
  const fleetBarData = useMemo(
    () =>
      units
        .filter((u) => u.fallas > 0)
        .sort((a, b) => b.fallas - a.fallas || a.unidad.localeCompare(b.unidad))
        .slice(0, 10)
        .map((u) => ({ unidad: u.unidad, fallas: u.fallas })),
    [units],
  );
  const effCampo = useMemo(() => {
    const pack = loadOperacionPack();
    return eficienciaCampoSnapshot(pack.resumenDiario, month);
  }, [month]);
  const effPctLabel =
    effCampo.general.eficienciaPct == null
      ? "N/D"
      : `${effCampo.general.eficienciaPct.toFixed(1)}%`;
  const effCampoDetail = effCampo.porCampo
    .filter((c) => c.eficienciaPct != null)
    .map((c) => `${c.label} ${c.eficienciaPct!.toFixed(1)}%`)
    .join(" · ");
  const effOk =
    effCampo.general.eficienciaPct != null && effCampo.general.eficienciaPct >= META_EFF;

  const prevMonth = monthIdx > 0 ? COPOWER_MONTH_ORDER[monthIdx - 1] : null;
  const prevData = prevMonth ? COPOWER_MONTHLY_DATA[prevMonth] : null;
  const prevEff = useMemo(() => {
    if (!prevMonth) return null;
    const pack = loadOperacionPack();
    return eficienciaCampoSnapshot(pack.resumenDiario, prevMonth);
  }, [prevMonth]);

  const fmtPpDelta = (curr: number | null | undefined, prev: number | null | undefined) => {
    if (curr == null || prev == null || Number.isNaN(curr) || Number.isNaN(prev)) return null;
    const pp = (curr - prev) * 100;
    return {
      text: `${pp >= 0 ? "+" : ""}${pp.toFixed(2)} pp vs ${prevData?.label ?? "mes ant."}`,
      improved: pp > 0,
      flat: Math.abs(pp) < 0.005,
    };
  };
  const fmtEffPpDelta = (curr: number | null | undefined, prev: number | null | undefined) => {
    if (curr == null || prev == null || Number.isNaN(curr) || Number.isNaN(prev)) return null;
    const pp = curr - prev;
    return {
      text: `${pp >= 0 ? "+" : ""}${pp.toFixed(2)} pp vs ${prevData?.label ?? "mes ant."}`,
      improved: pp > 0,
      flat: Math.abs(pp) < 0.005,
    };
  };
  const fmtGenDelta = (currKwh: number, prevKwh: number | null | undefined) => {
    if (prevKwh == null || Number.isNaN(prevKwh) || prevKwh === 0) return null;
    const pctCh = ((currKwh - prevKwh) / prevKwh) * 100;
    const mwh = (currKwh - prevKwh) / 1000;
    return {
      text: `${mwh >= 0 ? "+" : ""}${mwh.toFixed(1)} MWh (${pctCh >= 0 ? "+" : ""}${pctCh.toFixed(1)}%) vs ${prevData?.label ?? "mes ant."}`,
      improved: mwh > 0,
      flat: Math.abs(mwh) < 0.05,
    };
  };
  const deltaDisp = fmtPpDelta(data.kpi.availability, prevData?.kpi.availability);
  const deltaConf = fmtPpDelta(data.kpi.reliability, prevData?.kpi.reliability);
  const deltaEff = fmtEffPpDelta(
    effCampo.general.eficienciaPct,
    prevEff?.general.eficienciaPct,
  );
  const deltaGen = fmtGenDelta(data.totalGenerationKwh, prevData?.totalGenerationKwh);

  return (
    <div className="exec-dashboard">
      <header className="exec-header">
        <div>
          <p className="eyebrow">COPOWER · Operación diaria</p>
          <h2>
            {data.label} — Costayaco / Vonú
          </h2>
          <p className="muted">Indicadores internos del reporte diario de operaciones</p>
        </div>
        <span className="badge info">Fuente COPOWER</span>
      </header>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">0 · KPI del periodo Junio</p>
          <div className="exec-kpi-row">
            <div className="exec-kpi">
              <span>Disponibilidad</span>
              <strong>{pct(data.kpi.availability)}</strong>
              <small>COPOWER · Reporte diario</small>
            </div>
            <div className="exec-kpi">
              <span>Confiabilidad</span>
              <strong>{pct(data.kpi.reliability)}</strong>
              <small>COPOWER · Reporte diario</small>
            </div>
            <div className="exec-kpi">
              <span>Generación</span>
              <strong>{kwh(data.totalGenerationKwh)}</strong>
              <small>COPOWER · Reporte diario</small>
            </div>
            <div className="exec-kpi">
              <span>Fallas / eventos</span>
              <strong>{`${data.summary.copowerFailures} registro · ${data.eventLog.length} bitácora`}</strong>
              <small>COPOWER · Reporte diario</small>
            </div>
            <div className="exec-kpi">
              <span>Eficiencia de campo</span>
              <strong>{effPctLabel}</strong>
              <small>
                {effCampoDetail || "Sin gas/energía emparejados"} · {effCampo.yearMonth}
              </small>
            </div>
          </div>
          <p className="muted" style={{ marginTop: "0.65rem", fontSize: "0.78rem" }}>
            Fórmula: {EFICIENCIA_FORMULA}
          </p>
        </article>
      </section>

      <section className="dash-chart-grid">
        <article className="dash-chart-panel dash-chart-panel--wide">
          <h4>Tendencia disponibilidad y confiabilidad</h4>
          <p className="muted dash-chart-sub">Ene – mes seleccionado · línea punteada = meta 98%</p>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 10 }} width={36} unit="%" />
                <Tooltip formatter={(v, name) => [v == null ? "N/D" : `${Number(v).toFixed(2)}%`, String(name)]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine y={98} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "98%", fontSize: 10 }} />
                <Line type="monotone" dataKey="disponibilidad" name="Disponibilidad" stroke="#0e6e8c" strokeWidth={2.4} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="confiabilidad" name="Confiabilidad" stroke="#16a34a" strokeWidth={2.4} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-chart-panel">
          <h4>Generación acumulada (MWh)</h4>
          <p className="muted dash-chart-sub">Tendencia mensual COPOWER</p>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={48} />
                <Tooltip formatter={(v) => [`${Number(v).toFixed(1)} MWh`, ""]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="generacionMwh" name="COPOWER" stroke="#0e6e8c" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-chart-panel">
          <h4>Horas por estado</h4>
          <p className="muted dash-chart-sub">Reporte diario · Resumen OP</p>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hoursData} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="estado" tick={{ fontSize: 10 }} width={88} />
                <Tooltip formatter={(v) => [`${Number(v).toFixed(1)} h`, "Horas"]} />
                <Bar dataKey="horas" radius={[0, 4, 4, 0]}>
                  {hoursData.map((row) => (
                    <Cell key={row.estado} fill={row.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-chart-panel dash-chart-panel--wide">
          <h4>Fallas por unidad</h4>
          <p className="muted dash-chart-sub">Top unidades del periodo · COPOWER</p>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={fleetBarData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="unidad" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={52} />
                <YAxis tick={{ fontSize: 10 }} width={32} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="fallas" name="Fallas" fill="#0e6e8c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">1 · Indicadores sistémicos</p>
          <h3>Cumplimiento operacional</h3>
          <div className="exec-core-grid exec-core-grid--4">
            <div className="exec-core">
              <span>Generación total</span>
              <strong>{kwh(data.totalGenerationKwh)}</strong>
              <p>{data.kpi.generationMwh.toFixed(1)} MWh</p>
              <small>
                Gas {kwh(data.summary.energyGasKwh)} · Diésel {kwh(data.summary.energyDieselKwh)}
                {deltaGen ? (
                  <>
                    <br />
                    <span
                      className={
                        deltaGen.flat ? undefined : deltaGen.improved ? "delta positive" : "delta negative"
                      }
                    >
                      {deltaGen.text}
                    </span>
                  </>
                ) : null}
              </small>
            </div>
            <div className="exec-core ok">
              <span>Disponibilidad</span>
              <strong>{pct(data.kpi.availability)}</strong>
              <p>Meta de referencia ≥ 98%</p>
              <small>
                COPOWER · Reporte diario
                {deltaDisp ? (
                  <>
                    <br />
                    <span
                      className={
                        deltaDisp.flat
                          ? undefined
                          : deltaDisp.improved
                            ? "delta positive"
                            : "delta negative"
                      }
                    >
                      {deltaDisp.text}
                    </span>
                  </>
                ) : null}
              </small>
            </div>
            <div className="exec-core ok">
              <span>Confiabilidad</span>
              <strong>{pct(data.kpi.reliability)}</strong>
              <p>Meta de referencia ≥ 98%</p>
              <small>
                COPOWER · Reporte diario
                {deltaConf ? (
                  <>
                    <br />
                    <span
                      className={
                        deltaConf.flat
                          ? undefined
                          : deltaConf.improved
                            ? "delta positive"
                            : "delta negative"
                      }
                    >
                      {deltaConf.text}
                    </span>
                  </>
                ) : null}
              </small>
            </div>
            <div className={`exec-core${effCampo.general.eficienciaPct == null ? "" : effOk ? " ok" : " warn"}`}>
              <span>Eficiencia estimada</span>
              <strong>{effPctLabel}</strong>
              <p>Meta ≥ {META_EFF}%</p>
              <small>
                {effCampoDetail || "Sin gas/energía emparejados"} · OP {effCampo.yearMonth}
                {deltaEff ? (
                  <>
                    <br />
                    <span
                      className={
                        deltaEff.flat
                          ? undefined
                          : deltaEff.improved
                            ? "delta positive"
                            : "delta negative"
                      }
                    >
                      {deltaEff.text}
                    </span>
                  </>
                ) : null}
              </small>
            </div>
          </div>
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">2 · Horas y eventos</p>
          <h3>Resumen operativo del reporte</h3>
          <MetricGlossary />
          <div className="exec-kpi-row">
            <div className="exec-kpi">
              <Zap size={16} />
              <span>Horas operación</span>
              <strong>{hours(data.summary.hoursOperated)}</strong>
              <small>Stand-by {hours(data.summary.hoursStandby)}</small>
            </div>
            <div className="exec-kpi">
              <Wrench size={16} />
              <span>Eventos en bitácora</span>
              <strong>{data.summary.totalEvents ?? data.eventLog.length}</strong>
              <small>{failureEvents.length} tipo falla</small>
            </div>
            <div className="exec-kpi">
              <Wrench size={16} />
              <span>Fallas asociadas a COPOWER</span>
              <strong>{data.summary.copowerFailures}</strong>
              <small>Clasificación por texto del evento</small>
            </div>
            <div className="exec-kpi">
              <Gauge size={16} />
              <MetricLabel code="MTTR" />
              <strong>{hours(data.summary.mttrHours)}</strong>
              <small>MTBF {hours(data.summary.mtbfHours)}</small>
            </div>
          </div>
          <div className="exec-kpi-row" style={{ marginTop: "0.5rem" }}>
            <div className="exec-kpi">
              <span>Preventivo (PP)</span>
              <strong>{hours(data.summary.hoursPreventive)}</strong>
            </div>
            <div className="exec-kpi">
              <span>Correctivo</span>
              <strong>{hours(data.summary.hoursCorrective)}</strong>
            </div>
            <div className="exec-kpi">
              <span>FS asociado a COPOWER</span>
              <strong>{hours(data.summary.hoursFailureCopower)}</strong>
            </div>
            <div className="exec-kpi">
              <span>FS cliente</span>
              <strong>{hours(data.summary.hoursFailureClient)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="panel two-col">
        <article className="card">
          <p className="eyebrow">3 · Generación por activo</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Activo</th>
                  <th>Gas (kWh)</th>
                  <th>Diésel (kWh)</th>
                </tr>
              </thead>
              <tbody>
                {data.generationByAsset.map((a) => (
                  <tr key={a.asset}>
                    <td>
                      <strong>{a.asset}</strong>
                    </td>
                    <td>{kwh(a.gasKwh)}</td>
                    <td>{kwh(a.dieselKwh)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className="card">
          <p className="eyebrow">4 · Indicadores por unidad</p>
          <div className="table-scroll">
            <table className="indicators-table exec-unit-table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Disp %</th>
                  <th>Conf %</th>
                  <th>Fallas</th>
                  <th>Cumple</th>
                </tr>
              </thead>
              <tbody>
                {units.slice(0, 10).map((u) => (
                  <tr key={u.unidad} className={u.cumplimiento === "NO CUMPLE" ? "row-repeat" : undefined}>
                    <td>
                      <strong>{u.unidad}</strong>
                      <small className="muted"> {u.campo}</small>
                    </td>
                    <td>{u.disponibilidadPct ?? "N/D"}</td>
                    <td>{u.confiabilidadPct ?? "N/D"}</td>
                    <td>{u.fallas}</td>
                    <td>{u.cumplimiento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">5 · Generación y horas por equipo</p>
          <h3>Reporte diario · detalle mensual</h3>
          <div className="table-scroll">
            <table className="indicators-table exec-unit-table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Campo</th>
                  <th>Energía</th>
                  <th>OP</th>
                  <th>SB</th>
                  <th>PP</th>
                  <th>PF contr</th>
                  <th>PF cli</th>
                </tr>
              </thead>
              <tbody>
                {topUnits.map((row) => (
                  <tr key={`${row.equipo}-${row.campo}`}>
                    <td>
                      <strong>{row.equipo}</strong>
                    </td>
                    <td>{row.campo}</td>
                    <td>{kwh(row.energiaKwh)}</td>
                    <td>{row.horasOperacion.toFixed(1)}</td>
                    <td>{row.horasStandBy.toFixed(1)}</td>
                    <td>{row.horasPP.toFixed(1)}</td>
                    <td>{row.horasPFContr.toFixed(1)}</td>
                    <td>{row.horasPFCli.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="panel two-col">
        <article className="card">
          <p className="eyebrow">6 · Consumos</p>
          <h3>Aceite y coolant</h3>
          <div className="exec-kpi-row">
            <div className="exec-kpi">
              <Zap size={16} />
              <span>Aceite (adición + cambio)</span>
              <strong>{oilTotal.toFixed(1)} gal</strong>
              <small>Hoja Consumos</small>
            </div>
          </div>
          <div className="table-scroll" style={{ marginTop: "0.75rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Adición aceite</th>
                  <th>Cambio aceite</th>
                  <th>Coolant</th>
                </tr>
              </thead>
              <tbody>
                {data.consumos.length === 0 ? (
                  <tr>
                    <td colSpan={4}>Sin consumos registrados para este mes.</td>
                  </tr>
                ) : (
                  data.consumos
                    .filter((c) => c.adicionAceite + c.cambioAceite + c.adicionCoolant > 0)
                    .map((c) => (
                      <tr key={c.unidad}>
                        <td>{c.unidad}</td>
                        <td>{c.adicionAceite}</td>
                        <td>{c.cambioAceite}</td>
                        <td>{c.adicionCoolant}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </article>
        <article className="card">
          <p className="eyebrow">7 · Bitácora COPOWER</p>
          <h3>Eventos del reporte diario</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>Tipo</th>
                  <th>Resp.</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Sin eventos en bitácora para este mes.</td>
                  </tr>
                ) : (
                  recentEvents.map((e) => (
                    <tr key={`${e.date}-${e.equipment}-${e.cause.slice(0, 24)}`}>
                      <td>{e.date}</td>
                      <td>{e.equipment}</td>
                      <td>
                        <span className={`badge ${e.eventType === "Falla" ? "danger" : "info"}`}>{e.eventType}</span>
                      </td>
                      <td>{e.responsible}</td>
                      <td className="detalle-cell">{e.cause}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <aside className="exec-source-note" aria-label="Fuente">
        <p>
          <strong>Fuente:</strong> {COPOWER_SOURCE_FILE}. Hojas usadas: Resumen OP, Eventos de Generación,
          Consumos. Los indicadores de este módulo son operativos internos COPOWER y no sustituyen el
          cumplimiento contractual reportado a Gran Tierra.
        </p>
      </aside>
    </div>
  );
}
