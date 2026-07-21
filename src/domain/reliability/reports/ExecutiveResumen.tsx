import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileText,
  Gauge,
  ShieldAlert,
  Wrench,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getReliabilityDeduction } from "../contracts/gteOrders";
import { MetricGlossary, MetricLabel } from "../ui/metricDefs";
import {
  EXEC_BLIND_SPOTS,
  EXEC_JUN,
  EXEC_JUN_STABILIZATION,
  EXEC_JUN_UNITS,
  EXEC_MAY,
  EXEC_META,
  EXEC_ORDEN1_VALUE_NOTE,
  EXEC_SOURCES,
  EXEC_TREND_CHART,
  EXEC_TREND_FOOTER,
  type ExecUnitRow,
} from "./executiveJune2026";

const pct = (ratio: number, digits = 2) => `${(ratio * 100).toFixed(digits)}%`;
const pctPts = (value: number, digits = 2) => `${value.toFixed(digits)}%`;
const kwh = (value: number) => `${Math.round(value).toLocaleString("es-CO")} kWh`;
const hours = (value: number) => `${value.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} h`;

function meetsMeta(value: number, meta: number) {
  return value >= meta;
}

function gapPp(value: number, meta: number) {
  return (meta - value) * 100;
}

function SourceTag({ children }: { children: ReactNode }) {
  return <span className="exec-source">{children}</span>;
}

type SortKey = keyof ExecUnitRow | "unidad";

type Props = {
  /** Panel «1 · Cumplimiento / Alertas del periodo» — oculto en Base de Datos → Indicadores GTE. */
  showAlerts?: boolean;
};

export function ExecutiveResumen({ showAlerts = true }: Props) {
  const [unitsOpen, setUnitsOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("unidad");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const availMeets = meetsMeta(EXEC_JUN.availability, EXEC_META.availability);
  const confMeets = meetsMeta(EXEC_JUN.reliability, EXEC_META.reliability);
  const deduction = getReliabilityDeduction(EXEC_JUN.reliability);
  const failuresDelta = EXEC_JUN.failures - EXEC_MAY.failures;
  const mtbfDelta = EXEC_JUN.mtbfHours - EXEC_MAY.mtbfHours;
  const mttrDelta = EXEC_JUN.mttrHours - EXEC_MAY.mttrHours;
  const genDelta = EXEC_JUN.generationTotalKwh - EXEC_META.generationKwh;
  const focalShare = (EXEC_JUN.focalUnitFailures / EXEC_JUN.failures) * 100;
  const availGap = gapPp(EXEC_JUN.availability, EXEC_META.availability);
  const confGap = gapPp(EXEC_JUN.reliability, EXEC_META.reliability);
  const mayAvailGapToJun = (EXEC_JUN.availability - EXEC_MAY.availability) * 100;
  const mayConfGapToJun = (EXEC_JUN.reliability - EXEC_MAY.reliability) * 100;

  const trendChartData = useMemo(() => [...EXEC_TREND_CHART], []);

  const alerts = [
    {
      active: !confMeets,
      title: "Confiabilidad < 98%",
      detail: `Deducción aplicable: ${deduction.deductionPct}% (banda ${deduction.rangeLabel})`,
    },
    {
      active: true,
      title: "Incumplimiento reiterado (tendencia con datos disponibles)",
      detail: `Disponibilidad mayo = ${pct(EXEC_MAY.availability)} (${pct(EXEC_JUN.availability)} − ${mayAvailGapToJun.toFixed(2)} pp) y Confiabilidad mayo = ${pct(EXEC_MAY.reliability)} (${pct(EXEC_JUN.reliability)} − ${mayConfGapToJun.toFixed(2)} pp), ambas bajo 98%. 2 de 2 meses con datos disponibles están bajo meta contractual (98%) — se requiere historial completo para evaluar el umbral de reincidencia de 3 meses consecutivos que activa terminación anticipada.`,
    },
    {
      active: EXEC_JUN.rcaDelivered < EXEC_JUN.rcaRequired,
      title: "Eventos sin RCA / reporte de falla",
      detail: `${EXEC_JUN.rcaDelivered} de ${EXEC_JUN.rcaRequired} → expuesto a multa adicional del 4% de facturación mensual`,
    },
    {
      active: EXEC_JUN.focalUnitFailures >= 3,
      title: "Riesgo técnico focalizado",
      detail: `${EXEC_JUN.focalUnit} concentra ${EXEC_JUN.focalUnitFailures} de las ${EXEC_JUN.failures} fallas del mes (${focalShare.toFixed(0)}%)`,
    },
  ];

  const sortedUnits = useMemo(() => {
    const rows = [...EXEC_JUN_UNITS];
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "fallas" || key === "mttrHours" ? "desc" : "asc");
    }
  };

  const sortMark = (key: SortKey) => (sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "");

  return (
    <div className="exec-dashboard">
      <header className="exec-header">
        <div>
          <p className="eyebrow">Indicadores de confiabilidad · Orden 1</p>
          <h2>
            {EXEC_JUN.label} — {EXEC_JUN.field}
          </h2>
          <p className="muted">COPOWER · Sistema N Costayaco / Vonú · Meta contractual ≥98%</p>
        </div>
        <span className="badge info">Periodo oficial</span>
      </header>

      {/* 1. Alertas */}
      {showAlerts ? (
        <section className="panel exec-alerts-panel">
          <article className="card">
            <p className="eyebrow">1 · Cumplimiento</p>
            <h3>Alertas del periodo</h3>
            <div className="exec-alert-grid">
              {alerts.map((alert) => (
                <div key={alert.title} className={`exec-alert ${alert.active ? "active" : "idle"}`}>
                  <div className="exec-alert-head">
                    <ShieldAlert size={18} />
                    <strong>{alert.title}</strong>
                    <span className={`badge ${alert.active ? "danger" : "success"}`}>
                      {alert.active ? "Atención" : "Conforme"}
                    </span>
                  </div>
                  <p>{alert.detail}</p>
                </div>
              ))}
            </div>
            <SourceTag>{EXEC_SOURCES.pdf} · evaluación vs meta Orden 1 ≥98%</SourceTag>
          </article>
        </section>
      ) : null}

      {/* 2. Cumplimiento */}
      <section className="panel">
        <article className="card">
          <p className="eyebrow">2 · Desempeño sistémico</p>
          <h3>Sistema N Costayaco</h3>
          <div className="exec-core-grid">
            <div className={`exec-core ${availMeets ? "ok" : "bad"}`}>
              <span>Disponibilidad del Sistema</span>
              <strong>{pct(EXEC_JUN.availability)}</strong>
              <p>
                Meta ≥{pct(EXEC_META.availability, 0)} ·{" "}
                <span className={`badge ${availMeets ? "success" : "danger"}`}>
                  {availMeets ? "Cumple" : "No cumple"}
                </span>
              </p>
              <small>Brecha {availGap.toFixed(2)} pp</small>
            </div>
            <div className={`exec-core ${confMeets ? "ok" : "bad"}`}>
              <span>Confiabilidad del Sistema</span>
              <strong>{pct(EXEC_JUN.reliability)}</strong>
              <p>
                Meta ≥{pct(EXEC_META.reliability, 0)} ·{" "}
                <span className={`badge ${confMeets ? "success" : "danger"}`}>
                  {confMeets ? "Cumple" : "No cumple"}
                </span>
              </p>
              <small>Brecha {confGap.toFixed(2)} pp</small>
            </div>
            <div className={`exec-core ${deduction.deductionPct > 0 ? "warn" : "ok"}`}>
              <span>Deducción estimada del mes</span>
              <strong>{deduction.deductionPct}%</strong>
              <p>del pago mensual</p>
              <small>Banda {deduction.rangeLabel} · Orden 1</small>
            </div>
          </div>
          <p className="exec-vonu">
            Referencia Vonú (cumple): Disponibilidad {pct(EXEC_JUN.vonuAvailability, 0)}, Confiabilidad{" "}
            {pct(EXEC_JUN.vonuReliability, 0)}
          </p>
          <SourceTag>{EXEC_SOURCES.pdf}</SourceTag>
        </article>
      </section>

      {/* 3. Frecuencia / severidad */}
      <section className="panel">
        <article className="card">
          <p className="eyebrow">3 · Frecuencia y severidad</p>
          <h3>Indicadores de falla del periodo</h3>
          <MetricGlossary />
          <div className="exec-kpi-row">
            <div className="exec-kpi">
              <Wrench size={16} />
              <span>Fallas imputables COPOWER</span>
              <strong>{EXEC_JUN.failures}</strong>
              <small>
                vs mayo {EXEC_MAY.failures} ({failuresDelta >= 0 ? "+" : ""}
                {failuresDelta})
              </small>
              <SourceTag>{EXEC_SOURCES.pdf}</SourceTag>
            </div>
            <div className="exec-kpi">
              <Gauge size={16} />
              <MetricLabel code="MTBF" />
              <strong>{EXEC_JUN.mtbfHours.toFixed(2)} h</strong>
              <small className="positive">
                mayo {EXEC_MAY.mtbfHours.toFixed(2)} h · variación +{mtbfDelta.toFixed(2)} h
              </small>
              <SourceTag>{EXEC_SOURCES.pdf}</SourceTag>
            </div>
            <div className="exec-kpi">
              <Gauge size={16} />
              <MetricLabel code="MTTR" />
              <strong>{EXEC_JUN.mttrHours.toFixed(2)} h</strong>
              <small className="positive">
                mayo {EXEC_MAY.mttrHours.toFixed(2)} h · variación {mttrDelta.toFixed(2)} h
              </small>
              <SourceTag>{EXEC_SOURCES.pdf}</SourceTag>
            </div>
            <div className="exec-kpi pending">
              <AlertTriangle size={16} />
              <span>Shutdowns de campo</span>
              <strong>{EXEC_JUN.failures} eventos imputables</strong>
              <small>
                Pendiente confirmar equivalencia con la definición contractual de shutdown O&amp;M. No se aplica
                automáticamente la escala de deducciones hasta dicha validación.
              </small>
              <SourceTag>Reportado: eventos imputables · Pendiente: clasificación shutdown O&amp;M</SourceTag>
            </div>
          </div>
        </article>
      </section>

      {/* 4. Energía */}
      <section className="panel">
        <article className="card">
          <p className="eyebrow">4 · Generación</p>
          <h3>Energía del periodo</h3>
          <div className="exec-kpi-row">
            <div className="exec-kpi">
              <Zap size={16} />
              <span>Generación total</span>
              <strong>{kwh(EXEC_JUN.generationTotalKwh)}</strong>
              <small>
                Meta {kwh(EXEC_META.generationKwh)} · {genDelta >= 0 ? "+" : ""}
                {kwh(genDelta)}
              </small>
              <SourceTag>{EXEC_SOURCES.excel}</SourceTag>
            </div>
            <div className="exec-kpi">
              <span>Gas Costayaco</span>
              <strong>{kwh(EXEC_JUN.energyGasCostayacoKwh)}</strong>
              <SourceTag>{EXEC_SOURCES.excel}</SourceTag>
            </div>
            <div className="exec-kpi">
              <span>Diésel Costayaco</span>
              <strong>{kwh(EXEC_JUN.energyDieselCostayacoKwh)}</strong>
              <small>Respaldo operativo</small>
              <SourceTag>{EXEC_SOURCES.excel}</SourceTag>
            </div>
            <div className="exec-kpi">
              <span>Vonú</span>
              <strong>{kwh(EXEC_JUN.energyVonuKwh)}</strong>
              <SourceTag>{EXEC_SOURCES.excel}</SourceTag>
            </div>
          </div>
        </article>
      </section>

      {/* 5. Puntos ciegos */}
      <section className="panel">
        <article className="card">
          <p className="eyebrow">5 · Información pendiente</p>
          <h3>Indicadores contractuales sin reporte en fuentes del mes</h3>
          <div className="exec-blind-grid">
            {EXEC_BLIND_SPOTS.map((item) => (
              <div key={item.name} className="exec-blind">
                <div className="exec-alert-head">
                  <strong>{item.name}</strong>
                  <span className="badge warning">N/D</span>
                </div>
                <p>Meta: {item.meta}</p>
                <p className="muted">{item.status}</p>
              </div>
            ))}
          </div>
          <SourceTag>{EXEC_ORDEN1_VALUE_NOTE}</SourceTag>
        </article>
      </section>

      {/* 6. Documental */}
      <section className="panel">
        <article className="card">
          <p className="eyebrow">6 · Gestión documental</p>
          <h3>Estado de reportes y RCA</h3>
          <div className="exec-blind-grid">
            <div className="exec-blind risk">
              <div className="exec-alert-head">
                <FileText size={16} />
                <strong>Reportes de falla / RCA</strong>
                <span className="badge danger">
                  {EXEC_JUN.rcaDelivered} de {EXEC_JUN.rcaRequired}
                </span>
              </div>
              <p>No entregados → expuesto a multa adicional 4%</p>
              <SourceTag>{EXEC_SOURCES.pdf}</SourceTag>
            </div>
            <div className="exec-blind">
              <div className="exec-alert-head">
                <strong>Informes diarios</strong>
                <span className="badge info">N/D</span>
              </div>
              <p>No verificable con la información disponible</p>
              <SourceTag>{EXEC_SOURCES.none}</SourceTag>
            </div>
            <div className="exec-blind">
              <div className="exec-alert-head">
                <strong>Plan de acción por evento</strong>
                <span className="badge info">Inexistente</span>
              </div>
              <p>
                Columna &quot;Plan de Acción&quot; vacía en las {EXEC_JUN.excelFailureRows} filas de falla del Excel
                fuente
              </p>
              <SourceTag>{EXEC_SOURCES.excel}</SourceTag>
            </div>
          </div>
        </article>
      </section>

      {/* 7. Tendencias — Ene a Jun con fuente por mes */}
      <section className="panel">
        <article className="card">
          <p className="eyebrow">7 · Tendencia</p>
          <h3>Disponibilidad / Confiabilidad — Ene a Jun</h3>
          <p className="chart-hint">
            Serie mensual completa. Ene–Abr desde Excel Data Soporte de cada mes; Mayo–Junio oficiales (PDF). Línea
            punteada = meta contractual 98%.
          </p>
          <div className="chart-container exec-chart">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendChartData} margin={{ top: 12, right: 20, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[0.9, 1.005]}
                  stroke="var(--text-muted)"
                  width={52}
                  tickFormatter={(v) => `${(Number(v) * 100).toFixed(0)}%`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value, name) =>
                    value == null ? ["N/D", String(name)] : [`${(Number(value) * 100).toFixed(2)}%`, String(name)]
                  }
                  labelFormatter={(label, payload) => {
                    const fuente = payload?.[0]?.payload?.fuente ?? "";
                    return `Mes: ${label}${fuente ? ` · ${fuente}` : ""}`;
                  }}
                />
                <Legend />
                <ReferenceLine
                  y={EXEC_META.availability}
                  stroke="#94a3b8"
                  strokeDasharray="6 4"
                  label={{ value: "Meta 98%", position: "insideTopRight", fill: "#64748b", fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="availability"
                  name="Disponibilidad"
                  stroke="#2563eb"
                  strokeWidth={2.75}
                  dot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 7 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="reliability"
                  name="Confiabilidad"
                  stroke="#059669"
                  strokeWidth={2.75}
                  dot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 7 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <SourceTag>{EXEC_TREND_FOOTER}</SourceTag>
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">7 · Tendencia</p>
          <h3>MTBF / MTTR — Ene a Jun</h3>
          <MetricGlossary />
          <p className="chart-hint">
            Misma serie mensual. Ene–Abr Excel por mes; Mayo–Junio PDF oficial. MTBF eje izquierdo · MTTR eje derecho.
          </p>
          <div className="chart-container exec-chart">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendChartData} margin={{ top: 12, right: 20, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="mtbf"
                  stroke="#b45309"
                  width={56}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${Number(v).toFixed(0)}`}
                  label={{ value: "MTBF (h)", angle: -90, position: "insideLeft", fill: "#b45309", fontSize: 11 }}
                />
                <YAxis
                  yAxisId="mttr"
                  orientation="right"
                  stroke="#b91c1c"
                  width={48}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${Number(v).toFixed(1)}`}
                  label={{ value: "MTTR (h)", angle: 90, position: "insideRight", fill: "#b91c1c", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value, name) =>
                    value == null ? ["N/D", String(name)] : [`${Number(value).toFixed(2)} h`, String(name)]
                  }
                  labelFormatter={(label, payload) => {
                    const fuente = payload?.[0]?.payload?.fuente ?? "";
                    return `Mes: ${label}${fuente ? ` · ${fuente}` : ""}`;
                  }}
                />
                <Legend />
                <Line
                  yAxisId="mtbf"
                  type="monotone"
                  dataKey="mtbfHours"
                  name="MTBF"
                  stroke="#b45309"
                  strokeWidth={2.75}
                  dot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 7 }}
                  connectNulls
                />
                <Line
                  yAxisId="mttr"
                  type="monotone"
                  dataKey="mttrHours"
                  name="MTTR"
                  stroke="#b91c1c"
                  strokeWidth={2.75}
                  dot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 7 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <SourceTag>{EXEC_TREND_FOOTER}</SourceTag>
        </article>
      </section>

      {/* 8. Unidades — colapsable */}
      <section className="panel">
        <article className="card exec-collapse">
          <button type="button" className="exec-collapse-toggle" onClick={() => setUnitsOpen((v) => !v)}>
            {unitsOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <div>
              <p className="eyebrow">8 · Detalle por unidad</p>
              <h3>Indicadores por máquina</h3>
            </div>
          </button>
          {unitsOpen ? (
            <>
              <p className="muted">
                Consolidado sistémico del periodo. Unidades ordenables por columna. CPW06 marcada como unidad de seguimiento.
              </p>
              <div className="table-scroll">
                <table className="indicators-table exec-unit-table">
                  <thead>
                    <tr>
                      <th>
                        <button type="button" className="sort-button" onClick={() => toggleSort("unidad")}>
                          Unidad{sortMark("unidad")}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="sort-button" onClick={() => toggleSort("campo")}>
                          Campo{sortMark("campo")}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="sort-button" onClick={() => toggleSort("disponibilidadPct")}>
                          Disp. %{sortMark("disponibilidadPct")}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="sort-button" onClick={() => toggleSort("confiabilidadPct")}>
                          Conf. %{sortMark("confiabilidadPct")}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="sort-button" onClick={() => toggleSort("fallas")}>
                          #Fallas{sortMark("fallas")}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="sort-button" onClick={() => toggleSort("mtbfLabel")}>
                          <MetricLabel code="MTBF" showHours />
                          {sortMark("mtbfLabel")}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="sort-button" onClick={() => toggleSort("mttrHours")}>
                          <MetricLabel code="MTTR" showHours />
                          {sortMark("mttrHours")}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="sort-button" onClick={() => toggleSort("riesgoTecnico")}>
                          Riesgo{sortMark("riesgoTecnico")}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUnits.map((row) => (
                      <tr key={row.unidad} className={row.highlight ? "row-focal" : undefined}>
                        <td>
                          <strong>{row.unidad}</strong>
                          {row.highlight ? <span className="badge warning">Seguimiento</span> : null}
                        </td>
                        <td>{row.campo}</td>
                        <td>{pctPts(row.disponibilidadPct)}</td>
                        <td>{pctPts(row.confiabilidadPct)}</td>
                        <td>{row.fallas}</td>
                        <td>{row.mtbfLabel === "Sin Fallas" ? "Sin Fallas" : `${row.mtbfLabel} h`}</td>
                        <td>{row.mttrHours == null ? "—" : `${row.mttrHours} h`}</td>
                        <td>
                          <span
                            className={`badge ${
                              row.riesgoTecnico === "RIESGO MEDIO"
                                ? "warning"
                                : row.riesgoTecnico === "RIESGO ALTO"
                                  ? "danger"
                                  : "success"
                            }`}
                          >
                            {row.riesgoTecnico.replace("RIESGO ", "")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h4 className="exec-subhead">Unidades en estabilización (excluidas del Sistema N)</h4>
              <p className="muted">JIN-11 y JIN-12 · ventana de evaluación ~19 días · no consolidan en el cálculo sistémico.</p>
              <div className="table-scroll">
                <table className="indicators-table exec-unit-table">
                  <thead>
                    <tr>
                      <th>Unidad</th>
                      <th>Campo</th>
                      <th>Disp. %</th>
                      <th>Conf. %</th>
                      <th>#Fallas</th>
                      <th>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXEC_JUN_STABILIZATION.map((row) => (
                      <tr key={row.unidad}>
                        <td>{row.unidad}</td>
                        <td>{row.campo}</td>
                        <td>{pctPts(row.disponibilidadPct)}</td>
                        <td>{pctPts(row.confiabilidadPct)}</td>
                        <td>{row.fallas}</td>
                        <td className="muted">Excluida del sistémico</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <SourceTag>{EXEC_SOURCES.pdf} · anexo por unidad</SourceTag>
            </>
          ) : null}
        </article>
      </section>

      {/* 9. Horas — colapsable */}
      <section className="panel">
        <article className="card exec-collapse">
          <button type="button" className="exec-collapse-toggle" onClick={() => setHoursOpen((v) => !v)}>
            {hoursOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <div>
              <p className="eyebrow">9 · Auditoría del cálculo</p>
              <h3>Trazabilidad de horas</h3>
            </div>
          </button>
          {hoursOpen ? (
            <>
              <div className="exec-hours-grid">
                <div>
                  <span>Horas operativas</span>
                  <strong>{hours(EXEC_JUN.hoursOperated)}</strong>
                </div>
                <div>
                  <span>Horas Stand By</span>
                  <strong>{hours(EXEC_JUN.hoursStandby)}</strong>
                </div>
                <div>
                  <span>Horas PP</span>
                  <strong>{hours(EXEC_JUN.hoursPp)}</strong>
                </div>
                <div>
                  <span>Horas PF_contr (imputable)</span>
                  <strong>{hours(EXEC_JUN.hoursPfContr)}</strong>
                </div>
                <div>
                  <span>Horas PF_cli (no imputable)</span>
                  <strong>{hours(EXEC_JUN.hoursPfCli)}</strong>
                </div>
              </div>
              <SourceTag>{EXEC_SOURCES.excel}</SourceTag>
            </>
          ) : null}
        </article>
      </section>

      <aside className="exec-source-note" aria-label="Fuentes y notas">
        <p>
          <strong>Fuente:</strong> Análisis de Indicadores Copower PUTN Jun 2026 (Gran Tierra) + Data Soporte
          Cálculo Copower PUTN Junio 2026.xlsx + Orden de Servicio Costayaco (contrato). Cifras validadas para el
          periodo junio 2026.
        </p>
        <p>
          <strong>Nota:</strong> Orden 3 (CW6187) no se incorpora en este cálculo (alcance y vigencia pendientes de
          confirmación).
        </p>
      </aside>
    </div>
  );
}
