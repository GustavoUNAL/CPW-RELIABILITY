import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Gauge,
  ShieldAlert,
  Wrench,
} from "lucide-react";
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
import { CONTRACTUAL_KPI_TARGETS, getReliabilityDeduction } from "../contracts/gteOrders";
import { loadOperacionPack } from "../operacion/api";
import { eficienciaCampoSnapshot } from "../operacion/eficiencia";
import { MetricLabel } from "../ui/metricDefs";
import { EXEC_JUN } from "./executiveJune2026";
import {
  GRAN_TIERRA_KPI_FROM_MONTHS,
  GRAN_TIERRA_MONTHLY_DATA,
  type GranTierraMonthKey,
} from "./granTierraMonthly";

type Props = {
  month: string;
  monthLabel: string;
};

const META = CONTRACTUAL_KPI_TARGETS.reliability;
const META_PCT = META * 100;
const META_EFF = CONTRACTUAL_KPI_TARGETS.efficiencyPct;
const MTBF_REF = 700;
const MTTR_REF = 3;
const COLOR_OK = "#16a34a";
const COLOR_GAP = "#ca8a04";
const COLOR_PENDING = "#ea580c";
const COLOR_LINE = "#0e6e8c";

type Tone = "ok" | "gap" | "pending" | "na";

type ExecRow = {
  indicator: string;
  tone: Tone;
  statusLabel: string;
  result: string;
  resultNum: number | null;
  meta: string;
  metaNum: number | null;
  observation: string;
  chartKey: string;
};

const pct = (v: number | null | undefined, d = 2) =>
  v == null || Number.isNaN(v) ? "N/D" : `${(v * 100).toFixed(d)}%`;
const hours = (v: number | null | undefined, d = 2) =>
  v == null || Number.isNaN(v) ? "N/D" : `${v.toFixed(d)} h`;

function toneClass(tone: Tone) {
  if (tone === "ok") return "ok";
  if (tone === "gap") return "warn";
  if (tone === "pending") return "bad";
  return "na";
}

function badgeFor(tone: Tone) {
  if (tone === "ok") return "success";
  if (tone === "gap" || tone === "pending") return "warning";
  return "info";
}

export function ContractComplianceDashboard({ month, monthLabel }: Props) {
  const snap = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  const availability = snap?.kpi.availability ?? null;
  const reliability = snap?.kpi.reliability ?? null;
  const mtbf = snap?.summary.mtbfHours ?? null;
  const mttr = snap?.summary.mttrHours ?? null;
  const band = reliability == null ? null : getReliabilityDeduction(reliability);

  const rcaRequired = month === "Jun" ? EXEC_JUN.rcaRequired : null;
  const rcaDelivered = month === "Jun" ? EXEC_JUN.rcaDelivered : null;
  const events = month === "Jun" ? EXEC_JUN.failures : (snap?.summary.copowerFailures ?? 0);
  const efficiencyPct = useMemo(() => {
    try {
      return eficienciaCampoSnapshot(loadOperacionPack().resumenDiario, month).general.eficienciaPct;
    } catch {
      return null;
    }
  }, [month]);

  const rows: ExecRow[] = useMemo(() => {
    const out: ExecRow[] = [];

    if (availability == null) {
      out.push({
        indicator: "Disponibilidad",
        tone: "na",
        statusLabel: "Sin dato",
        result: "N/D",
        resultNum: null,
        meta: "98.00 %",
        metaNum: META_PCT,
        observation: "Sin disponibilidad sistémica cargada.",
        chartKey: "Disp",
      });
    } else {
      const ok = availability >= META;
      const gap = Math.abs((availability - META) * 100);
      out.push({
        indicator: "Disponibilidad",
        tone: ok ? "ok" : "gap",
        statusLabel: ok ? "En objetivo" : "Por debajo de la meta",
        result: pct(availability),
        resultNum: availability * 100,
        meta: "98.00 %",
        metaNum: META_PCT,
        observation: ok ? "Cumple umbral Orden 1 (≥98%)." : `Brecha de ${gap.toFixed(2)} pp.`,
        chartKey: "Disp",
      });
    }

    if (reliability == null) {
      out.push({
        indicator: "Confiabilidad",
        tone: "na",
        statusLabel: "Sin dato",
        result: "N/D",
        resultNum: null,
        meta: "98.00 %",
        metaNum: META_PCT,
        observation: "Sin confiabilidad sistémica cargada.",
        chartKey: "Conf",
      });
    } else {
      const ok = reliability >= META;
      out.push({
        indicator: "Confiabilidad",
        tone: ok ? "ok" : "gap",
        statusLabel: ok ? "En objetivo" : "Por debajo de la meta",
        result: pct(reliability),
        resultNum: reliability * 100,
        meta: "98.00 %",
        metaNum: META_PCT,
        observation: ok
          ? "Cumple umbral Orden 1 (≥98%)."
          : `Riesgo de deducción contractual${
              band && band.deductionPct > 0 ? ` estimada ${band.deductionPct}%` : ""
            } (sujeta a validación).`,
        chartKey: "Conf",
      });
    }

    if (mtbf == null) {
      out.push({
        indicator: "MTBF",
        tone: "na",
        statusLabel: "Sin dato",
        result: "N/D",
        resultNum: null,
        meta: `≥ ${MTBF_REF} h`,
        metaNum: MTBF_REF,
        observation: "Referencia interna de mantenibilidad.",
        chartKey: "MTBF",
      });
    } else {
      const ok = mtbf >= MTBF_REF;
      out.push({
        indicator: "MTBF",
        tone: ok ? "ok" : "gap",
        statusLabel: ok ? "En objetivo" : "Por debajo de la referencia",
        result: hours(mtbf),
        resultNum: mtbf,
        meta: `≥ ${MTBF_REF} h`,
        metaNum: MTBF_REF,
        observation: ok ? "Dentro de la referencia interna." : `Por debajo de ≥ ${MTBF_REF} h.`,
        chartKey: "MTBF",
      });
    }

    if (mttr == null) {
      out.push({
        indicator: "MTTR",
        tone: "na",
        statusLabel: "Sin dato",
        result: "N/D",
        resultNum: null,
        meta: `≤ ${MTTR_REF.toFixed(1)} h`,
        metaNum: MTTR_REF,
        observation: "Referencia interna de mantenibilidad.",
        chartKey: "MTTR",
      });
    } else {
      const ok = mttr <= MTTR_REF;
      out.push({
        indicator: "MTTR",
        tone: ok ? "ok" : "gap",
        statusLabel: ok ? "En objetivo" : "Por encima de la referencia",
        result: hours(mttr),
        resultNum: mttr,
        meta: `≤ ${MTTR_REF.toFixed(1)} h`,
        metaNum: MTTR_REF,
        observation: ok ? "Recuperación eficiente de equipos." : `Por encima de ≤ ${MTTR_REF.toFixed(1)} h.`,
        chartKey: "MTTR",
      });
    }

    if (efficiencyPct == null) {
      out.push({
        indicator: "Eficiencia",
        tone: "na",
        statusLabel: "Sin dato",
        result: "N/D",
        resultNum: null,
        meta: `≥ ${META_EFF}%`,
        metaNum: META_EFF,
        observation: "Sin dato de gas/energía OP en el periodo.",
        chartKey: "Eff",
      });
    } else {
      const ok = efficiencyPct >= META_EFF;
      const gap = Math.abs(efficiencyPct - META_EFF);
      out.push({
        indicator: "Eficiencia",
        tone: ok ? "ok" : "gap",
        statusLabel: ok ? "En objetivo" : "Por debajo de la meta",
        result: `${efficiencyPct.toFixed(2)}%`,
        resultNum: efficiencyPct,
        meta: `≥ ${META_EFF}%`,
        metaNum: META_EFF,
        observation: ok
          ? `Cumple umbral ≥${META_EFF}% · eficiencia estimada en todo el parque.`
          : `Brecha de ${gap.toFixed(2)} pp vs meta ≥${META_EFF}% · parque de generación.`,
        chartKey: "Eff",
      });
    }

    return out;
  }, [availability, reliability, mtbf, mttr, band, efficiencyPct]);

  const countOk = rows.filter((r) => r.tone === "ok").length;
  const countGap = rows.filter((r) => r.tone === "gap").length;
  const countPending = rows.filter((r) => r.tone === "pending").length;
  const tracked = rows.filter((r) => r.tone !== "na").length || rows.length;

  const trendData = useMemo(() => {
    const idx = GRAN_TIERRA_KPI_FROM_MONTHS.findIndex((r) => r.month === month);
    const slice = idx >= 0 ? GRAN_TIERRA_KPI_FROM_MONTHS.slice(0, idx + 1) : GRAN_TIERRA_KPI_FROM_MONTHS;
    return slice.map((r) => ({
      month: r.month,
      disp: r.availability != null ? r.availability * 100 : null,
      conf: r.reliability != null ? r.reliability * 100 : null,
    }));
  }, [month]);

  const compareBarData = useMemo(
    () =>
      rows
        .filter((r) => r.chartKey === "Disp" || r.chartKey === "Conf" || r.chartKey === "Eff")
        .map((r) => ({
          name: r.chartKey,
          resultado: r.resultNum,
          meta: r.metaNum,
          fill:
            r.tone === "ok" ? COLOR_OK : r.tone === "pending" ? COLOR_PENDING : COLOR_GAP,
        })),
    [rows],
  );

  const rcaPending =
    rcaRequired != null && rcaDelivered != null ? Math.max(0, rcaRequired - rcaDelivered) : null;

  const maintBarData = useMemo(
    () =>
      rows
        .filter((r) => r.chartKey === "MTBF" || r.chartKey === "MTTR")
        .map((r) => ({
          name: r.chartKey,
          valor: r.resultNum,
          referencia: r.metaNum,
          fill: r.tone === "ok" ? COLOR_OK : COLOR_GAP,
        })),
    [rows],
  );

  const statusPieData = useMemo(
    () =>
      [
        { name: "En objetivo", value: countOk, fill: COLOR_OK },
        { name: "Con oportunidad", value: countGap, fill: COLOR_GAP },
        { name: "Pendiente", value: countPending, fill: COLOR_PENDING },
      ].filter((d) => d.value > 0),
    [countOk, countGap, countPending],
  );

  const potentialDeduction =
    band && band.deductionPct > 0
      ? `${band.deductionPct}%`
      : reliability != null && reliability >= META
        ? "0%"
        : "N/D";

  const actions = [
    {
      action: "Análisis de causas repetitivas",
      status: "En ejecución",
      impact: "Incrementar MTBF",
    },
    {
      action: "Seguimiento a disponibilidad por unidad",
      status: "Implementado",
      impact: "Reducir indisponibilidad",
    },
    {
      action: "Cierre de RCA pendientes",
      status: rcaPending != null && rcaPending > 0 ? "En proceso" : "Implementado",
      impact: "Cumplimiento documental",
    },
    {
      action: "Seguimiento semanal de indicadores",
      status: "Implementado",
      impact: "Detección temprana de desviaciones",
    },
  ];

  const conclusionParts: string[] = [];
  if (rows.some((r) => (r.indicator === "MTBF" || r.indicator === "MTTR") && r.tone === "ok")) {
    conclusionParts.push(
      "El desempeño operativo del periodo muestra estabilidad en los indicadores de mantenibilidad (MTBF y MTTR).",
    );
  }
  if (countGap > 0) {
    const names = rows.filter((r) => r.tone === "gap").map((r) => r.indicator.toLowerCase());
    const text =
      names.length === 1
        ? names[0]
        : names.length === 2
          ? `${names[0]} y ${names[1]}`
          : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
    conclusionParts.push(
      `La principal oportunidad de mejora se concentra en el cumplimiento de las metas contractuales de ${text}.`,
    );
  }
  if (rcaPending != null && rcaPending > 0) {
    conclusionParts.push(
      "Asimismo, requiere atención el cierre oportuno de los análisis de causa raíz (RCA).",
    );
  }
  if (conclusionParts.length === 0) {
    conclusionParts.push(
      "El periodo no presenta desviaciones materiales frente a las metas y referencias evaluadas; se mantiene el seguimiento rutinario.",
    );
  }

  if (!snap) {
    return (
      <div className="dash-module exec-dashboard">
        <header className="exec-header dash-hero">
          <div>
            <p className="eyebrow">Dashboard · Cumplimiento de metas contractuales</p>
            <h2>{monthLabel}</h2>
          </div>
        </header>
        <p className="empty-state">Sin informe Gran Tierra cargado para este periodo.</p>
      </div>
    );
  }

  return (
    <div className="dash-module exec-dashboard">
      <header className="exec-header dash-hero">
        <div>
          <p className="eyebrow">Dashboard · Cumplimiento de metas contractuales</p>
          <h2>{monthLabel}</h2>
          <p className="muted">
            Orden 1 · Sistema Costayaco / Vonú · lectura ejecutiva para Gran Tierra
          </p>
        </div>
        <div className="dash-source-badges">
          <span className="source-badge gte">GTE</span>
          <span className="badge info">Orden 1</span>
        </div>
      </header>

      <section className="dash-source-strip">
        <div className="dash-source-strip-item dash-source-strip-item--gte">
          <span className="source-badge gte">Gran Tierra</span>
          <p>{snap.sourceFile}</p>
          <small>Indicadores contractuales · meta Disp/Conf ≥98% · Eff ≥{META_EFF}%</small>
        </div>
        <div className="dash-source-strip-item">
          <span className="badge info">Semáforo</span>
          <p>
            {countOk} en objetivo · {countGap} con oportunidad
            {rcaPending != null && rcaPending > 0 ? ` · ${rcaPending} RCA pendiente(s)` : ""}
          </p>
          <small>Deducción potencial: {potentialDeduction} · Eventos: {events}</small>
        </div>
      </section>

      <section className="exec-core-grid exec-core-grid--5">
        {rows.map((row) => (
          <div key={row.indicator} className={`exec-core ${toneClass(row.tone)}`}>
            <span>
              {row.indicator === "MTBF" || row.indicator === "MTTR" ? (
                <MetricLabel code={row.indicator} />
              ) : (
                row.indicator
              )}
            </span>
            <strong>{row.result}</strong>
            <p>
              Meta {row.meta} ·{" "}
              <span className={`badge ${badgeFor(row.tone)}`}>{row.statusLabel}</span>
            </p>
            <small>{row.observation}</small>
          </div>
        ))}
      </section>

      <section className="dash-chart-grid" style={{ marginTop: "0.85rem" }}>
        <article className="dash-chart-panel dash-chart-panel--wide">
          <h4>Tendencia disponibilidad y confiabilidad vs meta</h4>
          <p className="muted dash-chart-sub">Ene – {month} · línea punteada = meta contractual 98%</p>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 10 }} width={36} unit="%" />
                <Tooltip
                  formatter={(v, name) => [
                    v == null ? "N/D" : `${Number(v).toFixed(2)}%`,
                    String(name),
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="plainline"
                  iconSize={14}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8, width: "100%" }}
                />
                <ReferenceLine
                  y={META_PCT}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: "98%", fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="disp"
                  name="Disponibilidad"
                  stroke={COLOR_LINE}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="conf"
                  name="Confiabilidad"
                  stroke="#818cf8"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 2 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-chart-panel">
          <h4>Resultado vs meta (Disp / Conf / Eff)</h4>
          <p className="muted dash-chart-sub">% · barra meta de referencia</p>
          <div className="dash-chart-legend" aria-hidden>
            <span className="dash-chart-legend-item">
              <i style={{ background: COLOR_LINE }} /> Resultado
            </span>
            <span className="dash-chart-legend-item">
              <i style={{ background: "#94a3b8" }} /> Meta
            </span>
          </div>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={compareBarData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={36} unit="%" />
                <Tooltip
                  formatter={(v, name) => [
                    v == null ? "N/D" : `${Number(v).toFixed(2)}%`,
                    String(name),
                  ]}
                />
                <Bar dataKey="resultado" name="Resultado" radius={[4, 4, 0, 0]}>
                  {compareBarData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
                <Bar dataKey="meta" name="Meta" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-chart-panel">
          <h4>Mantenibilidad (MTBF / MTTR)</h4>
          <p className="muted dash-chart-sub">Horas · referencia interna ≥700 / ≤3.0</p>
          <div className="dash-chart-legend" aria-hidden>
            <span className="dash-chart-legend-item">
              <i style={{ background: COLOR_OK }} /> Resultado
            </span>
            <span className="dash-chart-legend-item">
              <i style={{ background: "#94a3b8" }} /> Referencia
            </span>
          </div>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={maintBarData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} width={40} />
                <Tooltip
                  formatter={(v, name) => [
                    v == null ? "N/D" : `${Number(v).toFixed(2)} h`,
                    String(name),
                  ]}
                />
                <Bar dataKey="valor" name="Resultado" radius={[4, 4, 0, 0]}>
                  {maintBarData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
                <Bar dataKey="referencia" name="Referencia" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-chart-panel">
          <h4>Distribución del semáforo</h4>
          <p className="muted dash-chart-sub">Conteo de indicadores del periodo</p>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusPieData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" name="Indicadores" radius={[0, 4, 4, 0]}>
                  {statusPieData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="panel" style={{ marginTop: "0.85rem" }}>
        <article className="card">
          <p className="eyebrow">1 · Cumplimiento</p>
          <h3>Indicadores del periodo vs meta / referencia</h3>
          <div className="table-wrap" style={{ marginTop: "0.55rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th>Estado</th>
                  <th>Resultado</th>
                  <th>Meta / Referencia</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.indicator}>
                    <td>
                      <strong>
                        {row.indicator === "MTBF" || row.indicator === "MTTR" ? (
                          <MetricLabel code={row.indicator} />
                        ) : (
                          row.indicator
                        )}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${badgeFor(row.tone)}`}>{row.statusLabel}</span>
                    </td>
                    <td>{row.result}</td>
                    <td>{row.meta}</td>
                    <td className="detalle-cell">{row.observation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">2 · Resumen del periodo</p>
          <h3>Estado general del contrato</h3>
          <div className="exec-kpi-row" style={{ marginTop: "0.55rem" }}>
            <div className="exec-kpi">
              <CheckCircle2 size={16} />
              <span>En objetivo</span>
              <strong>
                {countOk}/{tracked}
              </strong>
            </div>
            <div className="exec-kpi">
              <AlertTriangle size={16} />
              <span>Con brecha</span>
              <strong>
                {countGap}/{tracked}
              </strong>
            </div>
            <div className="exec-kpi">
              <FileSearch size={16} />
              <span>RCA entregados</span>
              <strong>
                {rcaRequired != null && rcaDelivered != null
                  ? `${rcaDelivered}/${rcaRequired}`
                  : "N/D"}
              </strong>
            </div>
            <div className="exec-kpi">
              <Wrench size={16} />
              <span>Eventos registrados</span>
              <strong>{events}</strong>
            </div>
            <div className="exec-kpi">
              <ShieldAlert size={16} />
              <span>RCA pendientes</span>
              <strong>
                {rcaRequired != null && rcaDelivered != null
                  ? Math.max(0, rcaRequired - rcaDelivered)
                  : "N/D"}
              </strong>
            </div>
            <div className="exec-kpi">
              <Gauge size={16} />
              <span>Deducción potencial</span>
              <strong>{potentialDeduction}</strong>
              <small>Sujeta a validación contractual</small>
            </div>
          </div>
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">3 · Gestión activa</p>
          <h3>Acciones de mejora en ejecución</h3>
          <p className="muted" style={{ marginTop: "0.25rem" }}>
            Se reportan indicadores y se gestiona el cierre de brechas y obligaciones documentales.
          </p>
          <div className="table-wrap" style={{ marginTop: "0.55rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Acción</th>
                  <th>Estado</th>
                  <th>Impacto esperado</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((a) => (
                  <tr key={a.action}>
                    <td>
                      <strong>{a.action}</strong>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          a.status === "Implementado"
                            ? "success"
                            : a.status === "En ejecución"
                              ? "info"
                              : "warning"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td>{a.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">Conclusión</p>
          <h3>Mensaje ejecutivo del periodo</h3>
          <p style={{ marginTop: "0.45rem", lineHeight: 1.55 }}>{conclusionParts.join(" ")}</p>
          <p className="muted" style={{ marginTop: "0.65rem", fontSize: "0.78rem" }}>
            Fuente: {snap.sourceFile}. Metas Orden 1 Disp/Conf ≥98%. MTBF/MTTR = referencia interna de
            seguimiento.
          </p>
        </article>
      </section>
    </div>
  );
}
