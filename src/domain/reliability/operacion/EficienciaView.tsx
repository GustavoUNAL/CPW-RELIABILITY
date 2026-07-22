import { useMemo, useState, type ReactNode } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  eficienciaByCampo,
  eficienciaByEquipo,
  eficienciaGeneral,
  eficienciaSerie,
  eficienciaSerieCampoChart,
  GAS_HHV_BTU_SCF,
  type EficienciaGrain,
} from "./eficiencia";
import { fmtHeatRate, fmtMwh, fmtNum, fmtPct } from "./format";
import type { ResumenDiario } from "./types";

type Props = {
  resumen: ResumenDiario[];
  header: ReactNode;
};

const CAMPO_COLORS: Record<string, string> = {
  Costayaco: "#0e6e8c",
  Vonu: "#ea580c",
  Conejo: "#7c3aed",
};

export function EficienciaView({ resumen, header }: Props) {
  const [grain, setGrain] = useState<EficienciaGrain>("mes");

  const general = useMemo(() => eficienciaGeneral(resumen), [resumen]);
  const byEq = useMemo(() => eficienciaByEquipo(resumen), [resumen]);
  const byCampo = useMemo(() => eficienciaByCampo(resumen), [resumen]);
  const serieGeneral = useMemo(() => eficienciaSerie(resumen, grain, "general"), [resumen, grain]);
  const chartCampo = useMemo(() => eficienciaSerieCampoChart(resumen, grain), [resumen, grain]);
  const detalle = useMemo(() => {
    const rows = eficienciaSerie(resumen, grain, "campo");
    return rows;
  }, [resumen, grain]);

  const camposEnChart = useMemo(() => {
    const keys = new Set<string>();
    for (const row of chartCampo) {
      for (const k of Object.keys(row)) {
        if (k !== "periodo") keys.add(k);
      }
    }
    return [...keys];
  }, [chartCampo]);

  return (
    <div className="panel op-ops">
      <article className="card">
        {header}
        <p className="muted" style={{ marginBottom: "0.75rem" }}>
          Eficiencia eléctrica estimada: η% = 3412 / (ft³/kWh × {GAS_HHV_BTU_SCF} BTU/scf) × 100.
          Heat rate ponderado por energía (gas ÷ kWh), no promedio simple.
        </p>

        <div className="op-ops-kpi-grid">
          <article className="op-ops-kpi">
            <span>Eficiencia general</span>
            <strong>{fmtPct(general.eficienciaPct, 1)}</strong>
            <small>Campo / portafolio filtrado</small>
          </article>
          <article className="op-ops-kpi">
            <span>Heat rate</span>
            <strong>{fmtHeatRate(general.heatRateFt3Kwh)}</strong>
            <small>Gas ÷ energía del período</small>
          </article>
          <article className="op-ops-kpi">
            <span>Energía</span>
            <strong>{fmtMwh(general.energiaKwh / 1000)}</strong>
            <small>kWh acumulados</small>
          </article>
          <article className="op-ops-kpi">
            <span>Gas</span>
            <strong>{fmtNum(general.gasFt3 / 1000, 1)} Mscf</strong>
            <small>{fmtNum(general.gasFt3, 0)} ft³</small>
          </article>
        </div>

        <div className="op-eff-grain" role="tablist" aria-label="Granularidad">
          <button
            type="button"
            role="tab"
            aria-selected={grain === "dia"}
            className={grain === "dia" ? "active" : undefined}
            onClick={() => setGrain("dia")}
          >
            Día
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={grain === "mes"}
            className={grain === "mes" ? "active" : undefined}
            onClick={() => setGrain("mes")}
          >
            Mes
          </button>
        </div>

        <div className="op-ops-grid-2">
          <section>
            <h4>Eficiencia general · {grain === "dia" ? "diaria" : "mensual"}</h4>
            <div className="dash-chart">
              {serieGeneral.length === 0 ? (
                <p className="empty-state">Sin gas/energía en el rango para calcular eficiencia.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={serieGeneral.map((s) => ({
                    periodo: s.periodo,
                    eff: s.eficienciaPct != null ? Number(s.eficienciaPct.toFixed(2)) : null,
                    hr: s.heatRateFt3Kwh != null ? Number(s.heatRateFt3Kwh.toFixed(2)) : null,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                    <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="eff" tick={{ fontSize: 10 }} width={36} unit="%" />
                    <YAxis yAxisId="hr" orientation="right" tick={{ fontSize: 10 }} width={40} />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="eff"
                      type="monotone"
                      dataKey="eff"
                      name="Eficiencia %"
                      stroke="#0e6e8c"
                      strokeWidth={2}
                      dot={grain === "mes"}
                      connectNulls
                    />
                    <Line
                      yAxisId="hr"
                      type="monotone"
                      dataKey="hr"
                      name="ft³/kWh"
                      stroke="#ea580c"
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
          <section>
            <h4>Eficiencia por campo · {grain === "dia" ? "día" : "mes"}</h4>
            <div className="dash-chart">
              {chartCampo.length === 0 ? (
                <p className="empty-state">Sin series por campo.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartCampo}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                    <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} width={36} unit="%" />
                    <Tooltip />
                    <Legend />
                    {camposEnChart.map((campo) => (
                      <Line
                        key={campo}
                        type="monotone"
                        dataKey={campo}
                        name={campo}
                        stroke={CAMPO_COLORS[campo] ?? "#64748b"}
                        strokeWidth={2}
                        dot={grain === "mes"}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>

        <section style={{ marginTop: "1rem" }}>
          <h4>Por máquina (período filtrado)</h4>
          {byEq.length === 0 ? (
            <p className="empty-state">No hay datos de gas/energía por máquina en el filtro.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Máquina</th>
                    <th>Eficiencia %</th>
                    <th>Heat rate</th>
                    <th>Energía</th>
                    <th>Gas (Mscf)</th>
                    <th>Días c/dato</th>
                  </tr>
                </thead>
                <tbody>
                  {byEq.map((e) => (
                    <tr key={e.key}>
                      <td>
                        <strong>{e.label}</strong>
                        <div className="muted" style={{ fontSize: "0.7rem" }}>
                          {e.key}
                        </div>
                      </td>
                      <td>
                        <strong>{fmtPct(e.eficienciaPct, 1)}</strong>
                      </td>
                      <td>{fmtHeatRate(e.heatRateFt3Kwh)}</td>
                      <td>{fmtMwh(e.energiaKwh / 1000)}</td>
                      <td>{e.gasFt3 > 0 ? fmtNum(e.gasFt3 / 1000, 1) : "—"}</td>
                      <td>{e.diasConDato}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={{ marginTop: "1rem" }}>
          <h4>Por campo (período filtrado)</h4>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Campo</th>
                  <th>Eficiencia %</th>
                  <th>Heat rate</th>
                  <th>Energía</th>
                  <th>Gas (Mscf)</th>
                  <th>Días c/dato</th>
                </tr>
              </thead>
              <tbody>
                {byCampo.map((c) => (
                  <tr key={c.key}>
                    <td>
                      <strong>{c.label}</strong>
                    </td>
                    <td>
                      <strong>{fmtPct(c.eficienciaPct, 1)}</strong>
                    </td>
                    <td>{fmtHeatRate(c.heatRateFt3Kwh)}</td>
                    <td>{fmtMwh(c.energiaKwh / 1000)}</td>
                    <td>{c.gasFt3 > 0 ? fmtNum(c.gasFt3 / 1000, 1) : "—"}</td>
                    <td>{c.diasConDato}</td>
                  </tr>
                ))}
                <tr className="op-eff-total-row">
                  <td>
                    <strong>General</strong>
                  </td>
                  <td>
                    <strong>{fmtPct(general.eficienciaPct, 1)}</strong>
                  </td>
                  <td>{fmtHeatRate(general.heatRateFt3Kwh)}</td>
                  <td>{fmtMwh(general.energiaKwh / 1000)}</td>
                  <td>{general.gasFt3 > 0 ? fmtNum(general.gasFt3 / 1000, 1) : "—"}</td>
                  <td>{general.diasConDato}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginTop: "1rem" }}>
          <h4>Detalle por campo · {grain === "dia" ? "día" : "mes"}</h4>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{grain === "dia" ? "Fecha" : "Mes"}</th>
                  <th>Campo</th>
                  <th>Eficiencia %</th>
                  <th>Heat rate</th>
                  <th>Energía</th>
                  <th>Gas (Mscf)</th>
                </tr>
              </thead>
              <tbody>
                {detalle.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      Sin filas
                    </td>
                  </tr>
                ) : (
                  detalle.map((d) => (
                    <tr key={`${d.periodo}-${d.label}`}>
                      <td>{d.periodo}</td>
                      <td>{d.label}</td>
                      <td>{fmtPct(d.eficienciaPct, 1)}</td>
                      <td>{fmtHeatRate(d.heatRateFt3Kwh)}</td>
                      <td>{fmtMwh(d.energiaKwh / 1000)}</td>
                      <td>{d.gasFt3 > 0 ? fmtNum(d.gasFt3 / 1000, 1) : "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </article>
    </div>
  );
}
