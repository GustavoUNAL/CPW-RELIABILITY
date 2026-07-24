import { AlertTriangle, Wrench } from "lucide-react";
import { useMemo, Fragment, type ReactNode } from "react";
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
import { EFICIENCIA_FORMULA, eficienciaCampoSnapshot } from "../operacion/eficiencia";
import { EXEC_JUN } from "./executiveJune2026";
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
import type { MachineIndicatorRow } from "../types";

const META = CONTRACTUAL_KPI_TARGETS.reliability;
const META_PCT = META * 100;
const COLOR_GTE = "#818cf8";
const COLOR_CPW = "#0e6e8c";

const pct = (v: number | null | undefined, d = 2) =>
  v == null || Number.isNaN(v) ? "N/D" : `${(v * 100).toFixed(d)}%`;
const kwh = (v: number | null | undefined) =>
  v == null ? "N/D" : `${Math.round(v).toLocaleString("es-CO")} kWh`;
const hours = (v: number | null | undefined) =>
  v == null || Number.isNaN(v) ? "N/D" : `${v.toFixed(1)} h`;
const num = (v: number | null | undefined, d = 0) =>
  v == null || Number.isNaN(v) ? "N/D" : d > 0 ? v.toFixed(d) : String(v);

function normUnit(id: string) {
  return id.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function kpiTone(value: number | null | undefined, meta = META) {
  if (value == null) return "na";
  if (value >= meta) return "ok";
  if (value >= meta - 0.02) return "warn";
  return "bad";
}

function diffPct(a: number | null | undefined, b: number | null | undefined) {
  if (a == null || b == null) return null;
  return (b - a) * 100;
}

function diffNum(a: number | null | undefined, b: number | null | undefined) {
  if (a == null || b == null) return null;
  return b - a;
}

function fmtDiffPp(d: number | null) {
  if (d == null) return "—";
  return `${d >= 0 ? "+" : ""}${d.toFixed(2)} pp`;
}

function fmtDiffNum(d: number | null, unit = "") {
  if (d == null) return "—";
  return `${d >= 0 ? "+" : ""}${Math.abs(d) >= 1000 ? d.toLocaleString("es-CO", { maximumFractionDigits: 0 }) : d.toFixed(1)}${unit}`;
}

function diffClass(d: number | null, threshold = 0.5) {
  if (d == null) return "";
  if (Math.abs(d) <= threshold) return "dash-diff--ok";
  return "dash-diff--warn";
}

type IntegRow = {
  label: string;
  gte: string;
  cpw: string;
  delta: string;
  deltaRaw: number | null;
  group: "contractual" | "operacion" | "cruce";
};

function buildIntegratedRows(
  gte: (typeof GRAN_TIERRA_MONTHLY_DATA)[GranTierraMonthKey] | null,
  cpw: (typeof COPOWER_MONTHLY_DATA)[CopowerMonthKey] | null,
): IntegRow[] {
  const rows: IntegRow[] = [];

  const pushPct = (
    label: string,
    gv: number | null | undefined,
    cv: number | null | undefined,
    group: IntegRow["group"],
  ) => {
    const d = diffPct(gv, cv);
    rows.push({
      label,
      gte: pct(gv),
      cpw: pct(cv),
      delta: fmtDiffPp(d),
      deltaRaw: d,
      group,
    });
  };

  const pushNum = (
    label: string,
    gv: number | null | undefined,
    cv: number | null | undefined,
    unit: string,
    group: IntegRow["group"],
    fmt: (v: number | null | undefined) => string = (v) => num(v) + unit,
  ) => {
    const d = diffNum(gv, cv);
    rows.push({
      label,
      gte: gv == null ? "N/D" : fmt(gv),
      cpw: cv == null ? "N/D" : fmt(cv),
      delta: fmtDiffNum(d, unit),
      deltaRaw: d,
      group,
    });
  };

  pushPct("Disponibilidad sistémica", gte?.kpi.availability, cpw?.kpi.availability, "contractual");
  pushPct("Confiabilidad sistémica", gte?.kpi.reliability, cpw?.kpi.reliability, "contractual");
  pushNum("Generación total", gte?.totalGenerationKwh, cpw?.totalGenerationKwh, " kWh", "contractual", kwh);
  pushNum(
    "Fallas asociadas a COPOWER / registradas",
    gte?.summary.copowerFailures,
    cpw?.summary.copowerFailures,
    "",
    "contractual",
  );
  pushNum("MTBF", gte?.summary.mtbfHours, cpw?.summary.mtbfHours, " h", "contractual", hours);
  pushNum("MTTR", gte?.summary.mttrHours, cpw?.summary.mttrHours, " h", "contractual", hours);

  pushNum("Horas operación", gte?.summary.hoursOperated, cpw?.summary.hoursOperated, " h", "operacion", hours);
  pushNum("Horas stand-by", gte?.summary.hoursStandby, cpw?.summary.hoursStandby, " h", "operacion", hours);
  pushNum("Horas preventivo (PP)", gte?.summary.hoursPreventive, cpw?.summary.hoursPreventive, " h", "operacion", hours);
  pushNum("Horas FS asociadas a COPOWER", gte?.summary.hoursFailureCopower, cpw?.summary.hoursFailureCopower, " h", "operacion", hours);
  pushNum("Horas FS cliente", gte?.summary.hoursFailureClient, cpw?.summary.hoursFailureClient, " h", "operacion", hours);
  pushNum(
    "Eventos en bitácora",
    gte?.eventLog.length ?? null,
    cpw?.eventLog.length ?? null,
    "",
    "operacion",
    (v) => (v == null ? "N/D" : String(v)),
  );

  return rows;
}

const ROW_GROUP_LABEL: Record<IntegRow["group"], string> = {
  contractual: "Indicadores contractuales / sistémicos",
  operacion: "Horas y bitácora operativa",
  cruce: "Comparativo cruzado",
};

type FleetRow = {
  unidad: string;
  campo: string;
  dispGte: number | null;
  dispCpw: number | null;
  confGte: number | null;
  confCpw: number | null;
  fallasGte: number | null;
  fallasCpw: number | null;
};

function mergeFleet(
  gteUnits: MachineIndicatorRow[],
  cpwUnits: MachineIndicatorRow[],
): FleetRow[] {
  const map = new Map<string, FleetRow>();

  for (const m of gteUnits) {
    if (m.unidad === "SISTEMA N") continue;
    const key = normUnit(m.unidad);
    map.set(key, {
      unidad: m.unidad,
      campo: m.campo,
      dispGte: m.disponibilidadPct,
      dispCpw: null,
      confGte: m.confiabilidadPct,
      confCpw: null,
      fallasGte: m.fallas,
      fallasCpw: null,
    });
  }

  for (const m of cpwUnits) {
    if (m.unidad === "SISTEMA N") continue;
    const key = normUnit(m.unidad);
    const existing = map.get(key);
    if (existing) {
      existing.dispCpw = m.disponibilidadPct;
      existing.confCpw = m.confiabilidadPct;
      existing.fallasCpw = m.fallas;
    } else {
      map.set(key, {
        unidad: m.unidad,
        campo: m.campo,
        dispGte: null,
        dispCpw: m.disponibilidadPct,
        confGte: null,
        confCpw: m.confiabilidadPct,
        fallasGte: null,
        fallasCpw: m.fallas,
      });
    }
  }

  return [...map.values()].sort((a, b) => {
    const fa = Math.max(a.fallasGte ?? 0, a.fallasCpw ?? 0);
    const fb = Math.max(b.fallasGte ?? 0, b.fallasCpw ?? 0);
    if (fb !== fa) return fb - fa;
    return a.unidad.localeCompare(b.unidad);
  });
}

function CoreCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "warn" | "bad" | "na";
}) {
  return (
    <article className={`dash-core-card${tone ? ` ${tone}` : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}

function DualValueCard({
  label,
  gteValue,
  cpwValue,
  toneGte,
  toneCpw,
  gteCaption,
  cpwCaption,
}: {
  label: string;
  gteValue: string;
  cpwValue: string;
  toneGte?: "ok" | "warn" | "bad" | "na";
  toneCpw?: "ok" | "warn" | "bad" | "na";
  gteCaption?: string;
  cpwCaption?: string;
}) {
  return (
    <article className="dash-dual-card">
      <span className="dash-dual-card-label">{label}</span>
      <div className="dash-dual-values">
        <div className={`dash-dual-val dash-dual-val--gte${toneGte ? ` ${toneGte}` : ""}`}>
          <small>
            {gteCaption ? (
              gteCaption
            ) : (
              <>
                <span className="source-badge gte">GTE</span> Informe oficial
              </>
            )}
          </small>
          <strong>{gteValue}</strong>
        </div>
        <div className={`dash-dual-val dash-dual-val--cpw${toneCpw ? ` ${toneCpw}` : ""}`}>
          <small>
            {cpwCaption ? (
              cpwCaption
            ) : (
              <>
                <span className="source-badge cpw">CPW</span> Reporte diario
              </>
            )}
          </small>
          <strong>{cpwValue}</strong>
        </div>
      </div>
    </article>
  );
}

function DashChartPanel({
  title,
  subtitle,
  wide,
  children,
}: {
  title: string;
  subtitle?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <article className={`dash-chart-panel${wide ? " dash-chart-panel--wide" : ""}`}>
      <h4>{title}</h4>
      {subtitle ? <p className="muted dash-chart-sub">{subtitle}</p> : null}
      <div className="dash-chart">{children}</div>
    </article>
  );
}

function buildTrendSeries(month: string) {
  const gteIdx = GRAN_TIERRA_MONTH_ORDER.indexOf(month as GranTierraMonthKey);
  const cpwIdx = COPOWER_MONTH_ORDER.indexOf(month as CopowerMonthKey);
  const end = Math.max(gteIdx >= 0 ? gteIdx : 0, cpwIdx >= 0 ? cpwIdx : 0);
  const months = COPOWER_MONTH_ORDER.slice(0, end + 1);

  return months.map((m) => {
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
      gteOpHours: gteSnap?.summary.hoursOperated ?? null,
      cpwOpHours: cpwSnap?.summary.hoursOperated ?? null,
      gteStandbyHours: gteSnap?.summary.hoursStandby ?? null,
      cpwStandbyHours: cpwSnap?.summary.hoursStandby ?? null,
      gteMaintHours:
        gteSnap == null ? null : gteSnap.summary.hoursPreventive + gteSnap.summary.hoursCorrective,
      cpwMaintHours:
        cpwSnap == null ? null : cpwSnap.summary.hoursPreventive + cpwSnap.summary.hoursCorrective,
      gteFsHours: gteSnap?.summary.hoursFailureCopower ?? null,
      cpwFsHours: cpwSnap?.summary.hoursFailureCopower ?? null,
    };
  });
}

type MonthProps = { month: string; monthLabel: string };

export function DashboardOverview({ month, monthLabel }: MonthProps) {
  const gte = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  const cpw = COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ?? null;
  const effCampo = useMemo(() => {
    const pack = loadOperacionPack();
    return eficienciaCampoSnapshot(pack.resumenDiario, month);
  }, [month]);
  const effPctLabel =
    effCampo.general.eficienciaPct == null
      ? "N/D"
      : `${effCampo.general.eficienciaPct.toFixed(1)}%`;
  const effCyc = effCampo.porCampo.find((c) => c.label === "Costayaco");
  const effVonu = effCampo.porCampo.find((c) => c.label === "Vonu");
  const effCycLabel =
    effCyc?.eficienciaPct == null ? "N/D" : `${effCyc.eficienciaPct.toFixed(1)}%`;
  const effVonuLabel =
    effVonu?.eficienciaPct == null ? "N/D" : `${effVonu.eficienciaPct.toFixed(1)}%`;

  const band = gte?.kpi.reliability != null ? getReliabilityDeduction(gte.kpi.reliability) : null;
  const integRows = useMemo(() => buildIntegratedRows(gte, cpw), [gte, cpw]);
  const fleet = useMemo(
    () => mergeFleet(gte?.machineIndicators ?? [], cpw?.machineIndicators ?? []),
    [gte, cpw],
  );

  const topFailures = fleet.filter((r) => (r.fallasGte ?? 0) + (r.fallasCpw ?? 0) > 0).slice(0, 8);

  const trendData = useMemo(() => buildTrendSeries(month), [month]);

  const kpiPctBarData = useMemo(
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

  const kpiVolBarData = useMemo(
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

  const integByGroup = useMemo(() => {
    const groups: IntegRow["group"][] = ["contractual", "operacion"];
    return groups.map((g) => ({
      key: g,
      label: ROW_GROUP_LABEL[g],
      rows: integRows.filter((r) => r.group === g),
    }));
  }, [integRows]);

  const hoursGteData = useMemo(() => {
    if (!gte) return [];
    return [
      { estado: "Operación", horas: gte.summary.hoursOperated, fill: COLOR_GTE },
      { estado: "Stand-by", horas: gte.summary.hoursStandby, fill: "#a5b4fc" },
      { estado: "Preventivo", horas: gte.summary.hoursPreventive, fill: "#22c55e" },
      { estado: "FS asociado", horas: gte.summary.hoursFailureCopower, fill: "#ef4444" },
    ];
  }, [gte]);

  const hoursData = useMemo(() => {
    if (!cpw) return [];
    return [
      { estado: "Operación", horas: cpw.summary.hoursOperated, fill: COLOR_CPW },
      { estado: "Stand-by", horas: cpw.summary.hoursStandby, fill: "#38bdf8" },
      { estado: "Preventivo", horas: cpw.summary.hoursPreventive, fill: "#22c55e" },
      {
        estado: "FS asociado",
        horas: cpw.summary.hoursFailureCopower,
        fill: "#ef4444",
      },
    ];
  }, [cpw]);

  const fleetBarData = useMemo(
    () =>
      topFailures.map((r) => ({
        unidad: r.unidad,
        gte: r.fallasGte ?? 0,
        cpw: r.fallasCpw ?? 0,
      })),
    [topFailures],
  );

  const alerts: { active: boolean; title: string; detail: string }[] = [];

  if (gte?.kpi.reliability != null && gte.kpi.reliability < META) {
    alerts.push({
      active: true,
      title: "Confiabilidad contractual bajo 98%",
      detail: `GTE ${pct(gte.kpi.reliability)} · banda ${band?.rangeLabel} · deducción ${band?.deductionPct}%`,
    });
  }

  const dispDiff = diffPct(gte?.kpi.availability, cpw?.kpi.availability);
  if (dispDiff != null && Math.abs(dispDiff) >= 1) {
    alerts.push({
      active: true,
      title: "Brecha disponibilidad GTE vs COPOWER",
      detail: `${fmtDiffPp(dispDiff)} entre informe oficial y reporte diario`,
    });
  }

  const genDiff = diffNum(gte?.totalGenerationKwh, cpw?.totalGenerationKwh);
  if (genDiff != null && gte?.totalGenerationKwh && Math.abs(genDiff / gte.totalGenerationKwh) > 0.02) {
    alerts.push({
      active: true,
      title: "Brecha de generación entre fuentes",
      detail: `GTE ${kwh(gte.totalGenerationKwh)} vs CPW ${kwh(cpw?.totalGenerationKwh)} (${fmtDiffNum(genDiff, " kWh")})`,
    });
  }

  const failDiff = diffNum(gte?.summary.copowerFailures, cpw?.summary.copowerFailures);
  if (failDiff != null && failDiff !== 0) {
    alerts.push({
      active: true,
      title: "Conteo de fallas no coincide",
      detail: `GTE ${gte?.summary.copowerFailures ?? "N/D"} vs COPOWER ${cpw?.summary.copowerFailures ?? "N/D"}`,
    });
  }

  if (month === "Jun" && EXEC_JUN.rcaRequired > 0) {
    const pendingRca = Math.max(0, EXEC_JUN.rcaRequired - EXEC_JUN.rcaDelivered);
    alerts.push({
      active: pendingRca > 0,
      title: "RCA formales pendientes de entrega",
      detail: `${EXEC_JUN.rcaDelivered}/${EXEC_JUN.rcaRequired} casos con PDF en data/RCA · restan ${pendingRca} · riesgo multa 4% adicional`,
    });
  }

  const focal = fleet.find((r) => (r.fallasGte ?? 0) >= 3 || (r.fallasCpw ?? 0) >= 3);
  if (focal) {
    alerts.push({
      active: true,
      title: "Concentración de fallas",
      detail: `${focal.unidad}: GTE ${focal.fallasGte ?? 0} · CPW ${focal.fallasCpw ?? 0} falla(s)`,
    });
  }

  if (!gte && !cpw) {
    return (
      <div className="dash-module exec-dashboard">
        <header className="exec-header dash-hero">
          <div>
            <p className="eyebrow">Dashboard · Resumen general</p>
            <h2>{monthLabel}</h2>
          </div>
        </header>
        <p className="empty-state">Sin datos GTE ni COPOWER cargados para este periodo.</p>
      </div>
    );
  }

  return (
    <div className="dash-module exec-dashboard">
      <header className="exec-header dash-hero">
        <div>
          <p className="eyebrow">Dashboard · Resumen general</p>
          <h2>{monthLabel}</h2>
          <p className="muted">
            Vista integrada · GTE (contractual) y COPOWER (operación diaria) en una sola lectura
          </p>
        </div>
        <div className="dash-source-badges">
          <span className="source-badge gte">GTE</span>
          <span className="source-badge cpw">CPW</span>
        </div>
      </header>

      <section className="dash-source-strip">
        <div className="dash-source-strip-item dash-source-strip-item--gte">
          <span className="source-badge gte">Gran Tierra</span>
          <p>{gte?.sourceFile ?? "Sin informe cargado para este mes"}</p>
          <small>Indicadores contractuales · Data Soporte / informe mensual</small>
        </div>
        <div className="dash-source-strip-item dash-source-strip-item--cpw">
          <span className="source-badge cpw">COPOWER</span>
          <p>{cpw?.sourceFile ?? "Sin reporte diario para este mes"}</p>
          <small>Operación diaria · Resumen OP + Eventos + Consumos</small>
        </div>
      </section>

      <section className="dash-integrated-hero">
        <DualValueCard
          label="Disponibilidad"
          gteValue={gte ? pct(gte.kpi.availability) : "N/D"}
          cpwValue={cpw ? pct(cpw.kpi.availability) : "N/D"}
          toneGte={gte ? kpiTone(gte.kpi.availability) : "na"}
          toneCpw={cpw ? kpiTone(cpw.kpi.availability) : "na"}
        />
        <DualValueCard
          label="Confiabilidad"
          gteValue={gte ? pct(gte.kpi.reliability) : "N/D"}
          cpwValue={cpw ? pct(cpw.kpi.reliability) : "N/D"}
          toneGte={gte ? kpiTone(gte.kpi.reliability) : "na"}
          toneCpw={cpw ? kpiTone(cpw.kpi.reliability) : "na"}
        />
        <DualValueCard
          label="Generación"
          gteValue={gte ? kwh(gte.totalGenerationKwh) : "N/D"}
          cpwValue={cpw ? kwh(cpw.totalGenerationKwh) : "N/D"}
        />
        <DualValueCard
          label="Fallas / eventos"
          gteValue={gte ? `${gte.summary.copowerFailures} asociadas a COPOWER` : "N/D"}
          cpwValue={cpw ? `${cpw.summary.copowerFailures} registro · ${cpw.eventLog.length} bitácora` : "N/D"}
          toneGte={gte && gte.summary.copowerFailures >= 3 ? "warn" : undefined}
          toneCpw={cpw && cpw.summary.copowerFailures >= 10 ? "warn" : undefined}
        />
        <DualValueCard
          label="Eficiencia de campo"
          gteValue={effCycLabel}
          cpwValue={effVonuLabel}
          gteCaption={`Costayaco · total ${effPctLabel}`}
          cpwCaption={`Vonú · ${effCampo.yearMonth}`}
        />
      </section>
      <p className="muted" style={{ margin: "0.35rem 0 0.75rem", fontSize: "0.78rem" }}>
        Eficiencia ({effCampo.yearMonth}
        {effCampo.general.heatRateFt3Kwh != null
          ? ` · HR ${effCampo.general.heatRateFt3Kwh.toFixed(2)} ft³/kWh`
          : ""}
        ). {EFICIENCIA_FORMULA}
      </p>

      <section className="dash-chart-grid">
        <DashChartPanel
          title="Tendencia disponibilidad y confiabilidad"
          subtitle="Ene – mes seleccionado · línea punteada = meta 98%"
          wide
        >
          <ResponsiveContainer width="100%" height={300}>
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
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <ReferenceLine y={META_PCT} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "98%", fontSize: 10 }} />
              <Line type="monotone" dataKey="gteDisp" name="Disp GTE" stroke={COLOR_GTE} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line type="monotone" dataKey="cpwDisp" name="Disp CPW" stroke={COLOR_CPW} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line type="monotone" dataKey="gteConf" name="Conf GTE" stroke={COLOR_GTE} strokeWidth={1.5} strokeDasharray="5 3" dot={{ r: 2 }} connectNulls />
              <Line type="monotone" dataKey="cpwConf" name="Conf CPW" stroke={COLOR_CPW} strokeWidth={1.5} strokeDasharray="5 3" dot={{ r: 2 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </DashChartPanel>

        <DashChartPanel title="Disp / Conf del mes (%)" subtitle={monthLabel}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={kpiPctBarData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[90, 100]} tick={{ fontSize: 10 }} width={36} />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(2)}%`, ""]} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <ReferenceLine y={META_PCT} stroke="#ef4444" strokeDasharray="4 4" />
              <Bar dataKey="gte" name="Gran Tierra" fill={COLOR_GTE} radius={[4, 4, 0, 0]} />
              <Bar dataKey="cpw" name="COPOWER" fill={COLOR_CPW} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashChartPanel>

        <DashChartPanel title="Generación, fallas y eventos" subtitle="Escalas distintas · leer tabla para Δ exacto">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={kpiVolBarData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={44} />
              <Tooltip formatter={(v) => [Number(v).toLocaleString("es-CO"), ""]} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="gte" name="Gran Tierra" fill={COLOR_GTE} radius={[4, 4, 0, 0]} />
              <Bar dataKey="cpw" name="COPOWER" fill={COLOR_CPW} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashChartPanel>

        <DashChartPanel title="Generación acumulada (MWh)" subtitle="Tendencia mensual integrada">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={48} />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(1)} MWh`, ""]} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="gteGen" name="GTE" stroke={COLOR_GTE} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line type="monotone" dataKey="cpwGen" name="COPOWER" stroke={COLOR_CPW} strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </DashChartPanel>

        <DashChartPanel
          title="Tendencia MTBF y MTTR"
          subtitle="Ene – mes seleccionado · comparación GTE vs COPOWER"
          wide
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="mtbf" tick={{ fontSize: 10 }} width={42} />
              <YAxis yAxisId="mttr" orientation="right" tick={{ fontSize: 10 }} width={42} />
              <Tooltip
                formatter={(v, name) => [
                  v == null ? "N/D" : `${Number(v).toFixed(2)} h`,
                  String(name),
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line
                yAxisId="mtbf"
                type="monotone"
                dataKey="gteMtbf"
                name="MTBF GTE"
                stroke={COLOR_GTE}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                yAxisId="mtbf"
                type="monotone"
                dataKey="cpwMtbf"
                name="MTBF CPW"
                stroke={COLOR_CPW}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                yAxisId="mttr"
                type="monotone"
                dataKey="gteMttr"
                name="MTTR GTE"
                stroke={COLOR_GTE}
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={{ r: 2 }}
                connectNulls
              />
              <Line
                yAxisId="mttr"
                type="monotone"
                dataKey="cpwMttr"
                name="MTTR CPW"
                stroke={COLOR_CPW}
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={{ r: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </DashChartPanel>

        <DashChartPanel
          title="Curvas operativas (horas)"
          subtitle="Operación, stand-by, mantenimiento y FS asociados · GTE vs COPOWER"
          wide
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={48} />
              <Tooltip
                formatter={(v, name) => [
                  v == null ? "N/D" : `${Number(v).toFixed(1)} h`,
                  String(name),
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="gteOpHours" name="OP GTE" stroke={COLOR_GTE} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line type="monotone" dataKey="cpwOpHours" name="OP CPW" stroke={COLOR_CPW} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line
                type="monotone"
                dataKey="gteStandbyHours"
                name="SB GTE"
                stroke={COLOR_GTE}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={{ r: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="cpwStandbyHours"
                name="SB CPW"
                stroke={COLOR_CPW}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={{ r: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="gteMaintHours"
                name="MTO GTE"
                stroke="#16a34a"
                strokeWidth={1.5}
                dot={{ r: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="cpwMaintHours"
                name="MTO CPW"
                stroke="#22c55e"
                strokeWidth={1.5}
                dot={{ r: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="gteFsHours"
                name="FS COPOWER GTE"
                stroke="#dc2626"
                strokeWidth={1.5}
                dot={{ r: 2 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="cpwFsHours"
                name="FS COPOWER CPW"
                stroke="#ef4444"
                strokeWidth={1.5}
                dot={{ r: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </DashChartPanel>

        {cpw ? (
          <DashChartPanel title="Horas por estado · COPOWER" subtitle="Reporte diario · Resumen OP">
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
          </DashChartPanel>
        ) : null}

        {gte ? (
          <DashChartPanel title="Horas por estado · Gran Tierra" subtitle="Informe mensual · Data Soporte">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hoursGteData} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="estado" tick={{ fontSize: 10 }} width={88} />
                <Tooltip formatter={(v) => [`${Number(v).toFixed(1)} h`, "Horas"]} />
                <Bar dataKey="horas" radius={[0, 4, 4, 0]}>
                  {hoursGteData.map((row) => (
                    <Cell key={row.estado} fill={row.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </DashChartPanel>
        ) : null}

        {fleetBarData.length > 0 ? (
          <DashChartPanel title="Fallas por unidad" subtitle="Top unidades · GTE vs COPOWER" wide>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={fleetBarData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="unidad" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={52} />
                <YAxis tick={{ fontSize: 10 }} width={32} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="gte" name="GTE" fill={COLOR_GTE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="cpw" name="COPOWER" fill={COLOR_CPW} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </DashChartPanel>
        ) : null}
      </section>

      <section className="panel">
        <article className="card">
          <div className="dash-block-head">
            <div>
              <p className="eyebrow">1 · Indicadores integrados</p>
              <h3>GTE vs COPOWER · mismo periodo</h3>
            </div>
            <span className="muted dash-integ-legend">Δ = COPOWER − GTE</span>
          </div>
          <div className="table-wrap">
            <table className="dash-integ-table">
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th className="col-gte">
                    Gran Tierra
                    <small className="dash-col-sub">Informe oficial</small>
                  </th>
                  <th className="col-cpw">
                    COPOWER
                    <small className="dash-col-sub">Reporte diario</small>
                  </th>
                  <th className="col-delta">Δ CPW − GTE</th>
                </tr>
              </thead>
              <tbody>
                {integByGroup.map((group) => (
                  <Fragment key={group.key}>
                    <tr className="dash-integ-group-row">
                      <td colSpan={4}>{group.label}</td>
                    </tr>
                    {group.rows.map((r) => (
                      <tr key={r.label}>
                        <td>{r.label}</td>
                        <td className="col-gte">{r.gte}</td>
                        <td className="col-cpw">{r.cpw}</td>
                        <td className={`col-delta ${diffClass(r.deltaRaw, r.label.includes("Falla") ? 0 : 1)}`}>
                          {r.delta}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {alerts.length > 0 ? (
        <section className="panel">
          <article className="card">
            <div className="dash-block-head">
              <div>
                <p className="eyebrow">2 · Alertas cruzadas</p>
                <h3>Señales del cruce de fuentes</h3>
              </div>
              <span className="badge warn">{alerts.length} activa(s)</span>
            </div>
            <div className="dash-alert-grid">
              {alerts.map((a) => (
                <article key={a.title} className="dash-alert active">
                  <div className="dash-alert-head">
                    <strong>{a.title}</strong>
                    <AlertTriangle size={16} />
                  </div>
                  <p>{a.detail}</p>
                </article>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      <section className="panel">
        <article className="card">
          <div className="dash-block-head">
            <div>
              <p className="eyebrow">{alerts.length > 0 ? "3" : "2"} · Flota integrada</p>
              <h3>Indicadores por unidad · ambas fuentes</h3>
            </div>
          </div>
          {fleet.length === 0 ? (
            <p className="empty-state">Sin indicadores por unidad en este periodo.</p>
          ) : (
            <div className="table-wrap">
              <table className="dash-integ-table dash-integ-table--fleet">
                <thead>
                  <tr>
                    <th rowSpan={2}>Unidad</th>
                    <th rowSpan={2}>Campo</th>
                    <th colSpan={2}>Disp. %</th>
                    <th colSpan={2}>Conf. %</th>
                    <th colSpan={2}>Fallas</th>
                  </tr>
                  <tr>
                    <th className="col-gte sub">GTE</th>
                    <th className="col-cpw sub">CPW</th>
                    <th className="col-gte sub">GTE</th>
                    <th className="col-cpw sub">CPW</th>
                    <th className="col-gte sub">GTE</th>
                    <th className="col-cpw sub">CPW</th>
                  </tr>
                </thead>
                <tbody>
                  {topFailures.map((r) => (
                    <tr
                      key={r.unidad}
                      className={
                        (r.fallasGte ?? 0) >= 3 || (r.fallasCpw ?? 0) >= 3 ? "row-repeat" : undefined
                      }
                    >
                      <td>
                        <strong>{r.unidad}</strong>
                      </td>
                      <td>{r.campo}</td>
                      <td className="col-gte">{r.dispGte == null ? "—" : `${r.dispGte.toFixed(1)}%`}</td>
                      <td className="col-cpw">{r.dispCpw == null ? "—" : `${r.dispCpw.toFixed(1)}%`}</td>
                      <td className="col-gte">{r.confGte == null ? "—" : `${r.confGte.toFixed(1)}%`}</td>
                      <td className="col-cpw">{r.confCpw == null ? "—" : `${r.confCpw.toFixed(1)}%`}</td>
                      <td className="col-gte">{r.fallasGte ?? "—"}</td>
                      <td className="col-cpw">{r.fallasCpw ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {fleet.length > topFailures.length ? (
            <p className="dash-side-note muted">
              Mostrando {topFailures.length} unidades con fallas de {fleet.length} en flota.
            </p>
          ) : null}
        </article>
      </section>

      <aside className="exec-source-note">
        <p>
          <strong>Fuentes:</strong> {gte?.sourceFile ?? "GTE N/D"} · {cpw?.sourceFile ?? "COPOWER N/D"}. GTE =
          base contractual; COPOWER = operación diaria. Δ positivo en % indica valor CPW mayor que GTE.
        </p>
      </aside>
    </div>
  );
}

export function DashboardMantenimiento({ month, monthLabel }: MonthProps) {
  const gte = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  const cpwKey = (COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ? month : "Jun") as CopowerMonthKey;
  const cpw = COPOWER_MONTHLY_DATA[cpwKey];

  const oilTotal = cpw.consumos.reduce((acc, r) => acc + r.adicionAceite + r.cambioAceite, 0);
  const coolantTotal = cpw.consumos.reduce((acc, r) => acc + r.adicionCoolant, 0);

  const rankedFailures = [...cpw.machineIndicators]
    .filter((m) => m.unidad !== "SISTEMA N" && m.fallas > 0)
    .sort((a, b) => b.fallas - a.fallas || (b.mttrHours ?? 0) - (a.mttrHours ?? 0));

  const maintEvents = cpw.eventLog
    .filter((e) => e.eventType !== "Falla" || e.responsible === "COPOWER")
    .slice(0, 8);

  return (
    <div className="dash-module exec-dashboard">
      <header className="exec-header dash-hero">
        <div>
          <p className="eyebrow">Dashboard · Mantenimiento</p>
          <h2>{monthLabel}</h2>
          <p className="muted">Horas PP/FS, consumos y priorización por fallas · COPOWER + contexto GTE</p>
        </div>
        <Wrench size={22} className="muted" />
      </header>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">1 · Horas por estado (COPOWER)</p>
          <div className="dash-core-grid">
            <CoreCard label="Preventivo (PP)" value={hours(cpw.summary.hoursPreventive)} hint="Resumen OP" />
            <CoreCard label="Correctivo / FS" value={hours(cpw.summary.hoursCorrective)} hint="Incluye fallas" />
            <CoreCard
              label="FS asociado a COPOWER"
              value={hours(cpw.summary.hoursFailureCopower)}
              hint={`Cliente ${hours(cpw.summary.hoursFailureClient)}`}
              tone={cpw.summary.hoursFailureCopower > 100 ? "warn" : undefined}
            />
          </div>
          {cpwKey !== month ? (
            <p className="dash-side-note muted">Datos COPOWER de {cpw.label}.</p>
          ) : null}
        </article>
      </section>

      <section className="panel two-col">
        <article className="card">
          <p className="eyebrow">2 · Consumos lubricantes</p>
          <div className="exec-kpi-row">
            <div className="exec-kpi">
              <span>Aceite (L)</span>
              <strong>{oilTotal.toFixed(1)}</strong>
              <small>Adición + cambio</small>
            </div>
            <div className="exec-kpi">
              <span>Coolant (L)</span>
              <strong>{coolantTotal.toFixed(1)}</strong>
              <small>Hoja consumos</small>
            </div>
          </div>
        </article>
        <article className="card">
          <p className="eyebrow">GTE · referencia</p>
          {gte ? (
            <div className="exec-kpi-row">
              <div className="exec-kpi">
                <span>Fallas asociadas a COPOWER</span>
                <strong>{gte.summary.copowerFailures}</strong>
                <small>Informe oficial</small>
              </div>
              <div className="exec-kpi">
                <span>MTTR</span>
                <strong>{hours(gte.summary.mttrHours)}</strong>
                <small>Duración reparación</small>
              </div>
            </div>
          ) : (
            <p className="empty-state">Sin informe GTE para {monthLabel}.</p>
          )}
        </article>
      </section>

      <section className="panel two-col">
        <article className="card">
          <p className="eyebrow">3 · Prioridad por fallas</p>
          <h3>Ranking unidades</h3>
          {rankedFailures.length === 0 ? (
            <p className="empty-state">Sin unidades con fallas en el periodo COPOWER.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Unidad</th>
                    <th>Fallas</th>
                    <th>MTBF</th>
                    <th>MTTR</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedFailures.slice(0, 6).map((r) => (
                    <tr key={r.unidad} className={r.fallas >= 3 ? "row-repeat" : undefined}>
                      <td>{r.unidad}</td>
                      <td>{r.fallas}</td>
                      <td>{r.mtbfLabel}</td>
                      <td>{r.mttrHours ?? "N/D"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
        <article className="card">
          <p className="eyebrow">4 · Bitácora reciente</p>
          <h3>Eventos COPOWER</h3>
          {maintEvents.length === 0 ? (
            <p className="empty-state">Sin eventos en bitácora para este mes.</p>
          ) : (
            <ul className="meeting-list">
              {maintEvents.map((e) => (
                <li key={`${e.date}-${e.equipment}-${e.cause}`}>
                  <strong>{e.equipment}</strong> · {e.date} · {e.eventType}
                  <br />
                  <span className="muted">{e.cause.slice(0, 80)}{e.cause.length > 80 ? "…" : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <aside className="exec-source-note">
        <p>
          <strong>Fuentes:</strong> {cpw.sourceFile}
          {gte ? ` · ${gte.sourceFile}` : ""}. Plan MTO formal y stock de repuestos no vienen en fuentes actuales.
        </p>
      </aside>
    </div>
  );
}
