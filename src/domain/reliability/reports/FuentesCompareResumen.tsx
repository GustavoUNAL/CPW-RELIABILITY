import { useMemo } from "react";
import {
  Bar,
  BarChart,
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
import {
  COPOWER_KPI_FROM_MONTHS,
  COPOWER_MONTHLY_DATA,
  COPOWER_MONTH_ORDER,
  type CopowerMonthKey,
} from "./copowerMonthly";
import {
  GRAN_TIERRA_KPI_FROM_MONTHS,
  GRAN_TIERRA_MONTHLY_DATA,
  GRAN_TIERRA_MONTH_ORDER,
  type GranTierraMonthKey,
} from "./granTierraMonthly";
import { MetricGlossary } from "../ui/metricDefs";

const COLOR_GTE = "#3d7ea6";
const COLOR_CPW = "#2bb3a3";
const META_PCT = 98;

const pct = (v: number | null | undefined, d = 2) =>
  v == null || Number.isNaN(v) ? "N/D" : `${(v * 100).toFixed(d)}%`;
const kwh = (v: number | null | undefined) =>
  v == null || Number.isNaN(v) ? "N/D" : `${Math.round(v).toLocaleString("es-CO")} kWh`;
const hours = (v: number | null | undefined) =>
  v == null || Number.isNaN(v) ? "N/D" : `${v.toLocaleString("es-CO", { maximumFractionDigits: 1 })} h`;

function kpiTone(v: number | null | undefined): "ok" | "warn" | "bad" | "na" {
  if (v == null) return "na";
  const p = v * 100;
  if (p >= META_PCT) return "ok";
  if (p >= META_PCT - 2) return "warn";
  return "bad";
}

type Props = { month: string; monthLabel: string };

function DualCard({
  label,
  gteValue,
  cpwValue,
  toneGte,
  toneCpw,
}: {
  label: string;
  gteValue: string;
  cpwValue: string;
  toneGte?: "ok" | "warn" | "bad" | "na";
  toneCpw?: "ok" | "warn" | "bad" | "na";
}) {
  return (
    <article className="dash-dual-card">
      <span className="dash-dual-card-label">{label}</span>
      <div className="dash-dual-values">
        <div className={`dash-dual-val dash-dual-val--gte${toneGte ? ` ${toneGte}` : ""}`}>
          <small>
            <span className="source-badge gte">GTE</span>
          </small>
          <strong>{gteValue}</strong>
        </div>
        <div className={`dash-dual-val dash-dual-val--cpw${toneCpw ? ` ${toneCpw}` : ""}`}>
          <small>
            <span className="source-badge cpw">CPW</span>
          </small>
          <strong>{cpwValue}</strong>
        </div>
      </div>
    </article>
  );
}

function buildTrend(month: string) {
  const gteIdx = GRAN_TIERRA_MONTH_ORDER.indexOf(month as GranTierraMonthKey);
  const cpwIdx = COPOWER_MONTH_ORDER.indexOf(month as CopowerMonthKey);
  const end = Math.max(gteIdx >= 0 ? gteIdx : 0, cpwIdx >= 0 ? cpwIdx : 0);
  return COPOWER_MONTH_ORDER.slice(0, end + 1).map((m) => {
    const gteRow = GRAN_TIERRA_KPI_FROM_MONTHS.find((r) => r.month === m);
    const cpwRow = COPOWER_KPI_FROM_MONTHS.find((r) => r.month === m);
    const gteSnap = GRAN_TIERRA_MONTHLY_DATA[m as GranTierraMonthKey];
    const cpwSnap = COPOWER_MONTHLY_DATA[m as CopowerMonthKey];
    return {
      month: m,
      gteDisp: gteRow?.availability != null ? gteRow.availability * 100 : null,
      cpwDisp: cpwRow?.availability != null ? cpwRow.availability * 100 : null,
      gteConf: gteRow?.reliability != null ? gteRow.reliability * 100 : null,
      cpwConf: cpwRow?.reliability != null ? cpwRow.reliability * 100 : null,
      gteGen: gteSnap ? gteSnap.totalGenerationKwh / 1000 : null,
      cpwGen: cpwSnap ? cpwSnap.totalGenerationKwh / 1000 : null,
      gteMtbf: gteSnap?.summary.mtbfHours ?? null,
      cpwMtbf: cpwSnap?.summary.mtbfHours ?? null,
      gteMttr: gteSnap?.summary.mttrHours ?? null,
      cpwMttr: cpwSnap?.summary.mttrHours ?? null,
      gteOp: gteSnap?.summary.hoursOperated ?? null,
      cpwOp: cpwSnap?.summary.hoursOperated ?? null,
      gteFs: gteSnap?.summary.hoursFailureCopower ?? null,
      cpwFs: cpwSnap?.summary.hoursFailureCopower ?? null,
      gteFallas: gteSnap?.summary.copowerFailures ?? null,
      cpwFallas: cpwSnap?.summary.copowerFailures ?? null,
    };
  });
}

/** Confiabilidad · Resumen: indicadores + gráficas GTE vs COPOWER. */
export function FuentesCompareResumen({ month, monthLabel }: Props) {
  const gte = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  const cpw = COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ?? null;
  const trend = useMemo(() => buildTrend(month), [month]);

  const pctBars = useMemo(
    () => [
      {
        name: "Disp %",
        gte: gte?.kpi.availability != null ? gte.kpi.availability * 100 : null,
        cpw: cpw?.kpi.availability != null ? cpw.kpi.availability * 100 : null,
      },
      {
        name: "Conf %",
        gte: gte?.kpi.reliability != null ? gte.kpi.reliability * 100 : null,
        cpw: cpw?.kpi.reliability != null ? cpw.kpi.reliability * 100 : null,
      },
    ],
    [gte, cpw],
  );

  const volBars = useMemo(
    () => [
      {
        name: "Gen MWh",
        gte: gte ? gte.totalGenerationKwh / 1000 : null,
        cpw: cpw ? cpw.totalGenerationKwh / 1000 : null,
      },
      {
        name: "Fallas",
        gte: gte?.summary.copowerFailures ?? null,
        cpw: cpw?.summary.copowerFailures ?? null,
      },
      {
        name: "Eventos",
        gte: gte?.eventLog.length ?? null,
        cpw: cpw?.eventLog.length ?? null,
      },
    ],
    [gte, cpw],
  );

  const hoursBars = useMemo(
    () => [
      {
        name: "OP",
        gte: gte?.summary.hoursOperated ?? null,
        cpw: cpw?.summary.hoursOperated ?? null,
      },
      {
        name: "Stand-by",
        gte: gte?.summary.hoursStandby ?? null,
        cpw: cpw?.summary.hoursStandby ?? null,
      },
      {
        name: "MTO",
        gte:
          gte == null
            ? null
            : gte.summary.hoursPreventive + gte.summary.hoursCorrective,
        cpw:
          cpw == null
            ? null
            : cpw.summary.hoursPreventive + cpw.summary.hoursCorrective,
      },
      {
        name: "FS COPOWER",
        gte: gte?.summary.hoursFailureCopower ?? null,
        cpw: cpw?.summary.hoursFailureCopower ?? null,
      },
    ],
    [gte, cpw],
  );

  const mtBars = useMemo(
    () => [
      {
        name: "MTBF",
        gte: gte?.summary.mtbfHours ?? null,
        cpw: cpw?.summary.mtbfHours ?? null,
      },
      {
        name: "MTTR",
        gte: gte?.summary.mttrHours ?? null,
        cpw: cpw?.summary.mttrHours ?? null,
      },
    ],
    [gte, cpw],
  );

  if (!gte && !cpw) {
    return (
      <div className="dash-module exec-dashboard">
        <p className="empty-state">Sin datos GTE ni COPOWER para {monthLabel}.</p>
      </div>
    );
  }

  return (
    <div className="dash-module exec-dashboard fuentes-compare">
      <header className="exec-header dash-hero">
        <div>
          <p className="eyebrow">Confiabilidad · Resumen</p>
          <h2>Comparativo Gran Tierra vs COPOWER</h2>
          <p className="muted">
            Indicadores del periodo · {monthLabel} · GTE (contractual) y COPOWER (operación diaria)
          </p>
        </div>
        <div className="dash-source-badges">
          <span className="source-badge gte">GTE</span>
          <span className="source-badge cpw">CPW</span>
        </div>
      </header>

      <section className="dash-integrated-hero">
        <DualCard
          label="Disponibilidad"
          gteValue={gte ? pct(gte.kpi.availability) : "N/D"}
          cpwValue={cpw ? pct(cpw.kpi.availability) : "N/D"}
          toneGte={gte ? kpiTone(gte.kpi.availability) : "na"}
          toneCpw={cpw ? kpiTone(cpw.kpi.availability) : "na"}
        />
        <DualCard
          label="Confiabilidad"
          gteValue={gte ? pct(gte.kpi.reliability) : "N/D"}
          cpwValue={cpw ? pct(cpw.kpi.reliability) : "N/D"}
          toneGte={gte ? kpiTone(gte.kpi.reliability) : "na"}
          toneCpw={cpw ? kpiTone(cpw.kpi.reliability) : "na"}
        />
        <DualCard
          label="Generación"
          gteValue={gte ? kwh(gte.totalGenerationKwh) : "N/D"}
          cpwValue={cpw ? kwh(cpw.totalGenerationKwh) : "N/D"}
        />
        <DualCard
          label="Fallas"
          gteValue={gte ? String(gte.summary.copowerFailures) : "N/D"}
          cpwValue={cpw ? String(cpw.summary.copowerFailures) : "N/D"}
          toneGte={gte && gte.summary.copowerFailures >= 3 ? "warn" : undefined}
          toneCpw={cpw && cpw.summary.copowerFailures >= 10 ? "warn" : undefined}
        />
        <DualCard
          label="MTBF"
          gteValue={hours(gte?.summary.mtbfHours)}
          cpwValue={hours(cpw?.summary.mtbfHours)}
        />
        <DualCard
          label="MTTR"
          gteValue={hours(gte?.summary.mttrHours)}
          cpwValue={hours(cpw?.summary.mttrHours)}
        />
        <DualCard
          label="Horas operación"
          gteValue={hours(gte?.summary.hoursOperated)}
          cpwValue={hours(cpw?.summary.hoursOperated)}
        />
        <DualCard
          label="FS COPOWER"
          gteValue={hours(gte?.summary.hoursFailureCopower)}
          cpwValue={hours(cpw?.summary.hoursFailureCopower)}
        />
      </section>

      <MetricGlossary />
      <p className="metric-glossary fuentes-compare-legend" role="note">
        <span>
          <strong>Disp</strong> · Disponibilidad del sistema (meta ≥ 98%)
        </span>
        <span className="metric-glossary-sep" aria-hidden>
          ·
        </span>
        <span>
          <strong>Conf</strong> · Confiabilidad del sistema (meta ≥ 98%)
        </span>
        <span className="metric-glossary-sep" aria-hidden>
          ·
        </span>
        <span>
          <strong>Gen</strong> · Energía entregada en el periodo (kWh / MWh)
        </span>
        <span className="metric-glossary-sep" aria-hidden>
          ·
        </span>
        <span>
          <strong>Fallas</strong> · Eventos de falla asociados a COPOWER
        </span>
        <span className="metric-glossary-sep" aria-hidden>
          ·
        </span>
        <span>
          <strong>OP</strong> · Horas en operación
        </span>
        <span className="metric-glossary-sep" aria-hidden>
          ·
        </span>
        <span>
          <strong>MTO</strong> · Horas de mantenimiento (preventivo + correctivo)
        </span>
        <span className="metric-glossary-sep" aria-hidden>
          ·
        </span>
        <span>
          <strong>GTE</strong> · Informe contractual Gran Tierra
        </span>
        <span className="metric-glossary-sep" aria-hidden>
          ·
        </span>
        <span>
          <strong>CPW</strong> · Reporte diario COPOWER
        </span>
      </p>

      <section className="dash-chart-grid">
        <article className="dash-chart-panel">
          <h4>Disponibilidad y confiabilidad</h4>
          <p className="muted dash-chart-sub">{monthLabel} · % · línea = meta 98%</p>
          <div className="dash-chart" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pctBars} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 10 }} width={36} />
                <Tooltip formatter={(v) => [`${Number(v).toFixed(2)}%`, ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={META_PCT} stroke="#ef4444" strokeDasharray="4 4" />
                <Bar dataKey="gte" name="Gran Tierra" fill={COLOR_GTE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="cpw" name="COPOWER" fill={COLOR_CPW} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-chart-panel">
          <h4>Generación, fallas y eventos</h4>
          <p className="muted dash-chart-sub">Escalas distintas · comparar por categoría</p>
          <div className="dash-chart" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volBars} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} width={44} />
                <Tooltip formatter={(v) => [Number(v).toLocaleString("es-CO"), ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="gte" name="Gran Tierra" fill={COLOR_GTE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="cpw" name="COPOWER" fill={COLOR_CPW} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-chart-panel">
          <h4>Horas por estado</h4>
          <p className="muted dash-chart-sub">OP · Stand-by · MTO · FS COPOWER</p>
          <div className="dash-chart" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursBars} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} width={44} />
                <Tooltip formatter={(v) => [`${Number(v).toLocaleString("es-CO")} h`, ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="gte" name="Gran Tierra" fill={COLOR_GTE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="cpw" name="COPOWER" fill={COLOR_CPW} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-chart-panel">
          <h4>MTBF y MTTR</h4>
          <p className="muted dash-chart-sub">Horas · mayor MTBF / menor MTTR es mejor</p>
          <div className="dash-chart" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mtBars} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} width={44} />
                <Tooltip formatter={(v) => [`${Number(v).toFixed(2)} h`, ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="gte" name="Gran Tierra" fill={COLOR_GTE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="cpw" name="COPOWER" fill={COLOR_CPW} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-chart-panel dash-chart-panel--wide">
          <h4>Tendencia Disp / Conf</h4>
          <p className="muted dash-chart-sub">Ene → {month} · GTE vs COPOWER · meta 98%</p>
          <div className="dash-chart" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 10 }} width={36} unit="%" />
                <Tooltip
                  formatter={(v, name) => [
                    v == null ? "N/D" : `${Number(v).toFixed(2)}%`,
                    String(name),
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={META_PCT} stroke="#ef4444" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="gteDisp"
                  name="Disp GTE"
                  stroke={COLOR_GTE}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="cpwDisp"
                  name="Disp CPW"
                  stroke={COLOR_CPW}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="gteConf"
                  name="Conf GTE"
                  stroke={COLOR_GTE}
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  dot={{ r: 2 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="cpwConf"
                  name="Conf CPW"
                  stroke={COLOR_CPW}
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  dot={{ r: 2 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <p className="muted field-resumen-source">
        Fuentes: {gte?.sourceFile?.split("/").pop() ?? "GTE N/D"} ·{" "}
        {cpw?.sourceFile?.split("/").pop() ?? "CPW N/D"}
      </p>
    </div>
  );
}
