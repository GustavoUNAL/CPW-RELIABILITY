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
import type { EventRecord } from "../types";
import { loadOperacionPack } from "../operacion/api";
import {
  EFICIENCIA_FORMULA,
  eficienciaCampoSnapshot,
  gasFt3FromResumen,
} from "../operacion/eficiencia";
import { MetricGlossary, MetricLabel } from "../ui/metricDefs";
import {
  buildEnergyEfficiency,
  EFICIENCIA_MEDIDA_FORMULA,
  REPORT_HEATING_VALUE,
} from "./energyEfficiency";
import { RCA_COSTAYACO_EVENTOS } from "../rca/data";
import {
  GRAN_TIERRA_MONTH_ORDER,
  GRAN_TIERRA_MONTHLY_DATA,
  type GranTierraMonthKey,
} from "./granTierraMonthly";
import { buildDisponibilidadAnalisis } from "./DisponibilidadAnalisisBoard";
import { ExecInsight, INFORME_EXEC_INSIGHTS } from "./informeExecInsights";

const META = CONTRACTUAL_KPI_TARGETS.reliability;
const META_EFF = CONTRACTUAL_KPI_TARGETS.efficiencyPct;

const pct = (ratio: number | null | undefined, digits = 2) =>
  ratio == null || Number.isNaN(ratio) ? "N/D" : `${(ratio * 100).toFixed(digits)}%`;
const kwh = (value: number) => `${Math.round(value).toLocaleString("es-CO")} kWh`;
const hours = (value: number | null | undefined) =>
  value == null || Number.isNaN(value) ? "N/D" : `${value.toFixed(1)} h`;

export type GteResumenSection = "sistemicos" | "horas";

type Props = {
  month: GranTierraMonthKey;
  /** Si se pasa, solo pinta esas tarjetas (p. ej. Informes · Confiabilidad). */
  only?: GteResumenSection[];
};

type GteJuneClass = "COPOWER" | "Infraestructura del campo" | "Infraestructura externa";

type GteJuneEventRow = {
  id: string;
  date: string;
  equipment: string;
  eventType: "Falla" | "Causa comun" | "Operativo";
  responsible: "COPOWER" | "GTE" | "GTE + COPOWER" | "Externo";
  notes: string;
  classification: GteJuneClass;
};

/**
 * Las filas de bitácora importadas de "Horas concertadas" llegan con responsable
 * COPOWER por defecto y 0 h de parada: solo son imputables las fallas con horas.
 */
function classifyLogRow(e: EventRecord): GteJuneClass {
  const shared = e.responsible === "COPOWER" || e.responsible === "GTE + COPOWER";
  if (e.eventType === "Falla" && shared && e.downtimeHours > 0) return "COPOWER";
  if (e.responsible === "Externo") return "Infraestructura externa";
  return "Infraestructura del campo";
}

const GTE_JUNE_EVENT_LOG: GteJuneEventRow[] = [
  { id: "GTE-JUN-001", date: "03-jun", equipment: "CPW06", eventType: "Falla", responsible: "GTE + COPOWER", notes: "Intercooler / secuestrante; PF_contr 4 h.", classification: "COPOWER" },
  { id: "GTE-JUN-002", date: "05-jun", equipment: "CPW01", eventType: "Falla", responsible: "COPOWER", notes: "Flexible de escape; PF_contr 2 h.", classification: "COPOWER" },
  { id: "GTE-JUN-012", date: "07-jun", equipment: "CPW01", eventType: "Falla", responsible: "COPOWER", notes: "Detonación relé K4; PF_contr 3 h.", classification: "COPOWER" },
  { id: "GTE-JUN-003", date: "11-jun", equipment: "CPW03", eventType: "Falla", responsible: "COPOWER", notes: "Perturbación transitoria; FS≈3,92 h; ≈2.620 kWh; causa raíz no determinada.", classification: "COPOWER" },
  { id: "GTE-JUN-023", date: "23-jun", equipment: "CPW04", eventType: "Falla", responsible: "COPOWER", notes: "FO-44 cascada EEP / RL / 480 V; PF_contr 1 h.", classification: "COPOWER" },
  { id: "GTE-JUN-024", date: "23-jun", equipment: "CPW05", eventType: "Falla", responsible: "COPOWER", notes: "FO-44 cascada EEP / RL / 480 V; PF_contr 2 h.", classification: "COPOWER" },
  { id: "GTE-JUN-004", date: "27-jun", equipment: "CPW06", eventType: "Falla", responsible: "COPOWER", notes: "EVT-2026-06-27-CPW06: FO sin horas; FS≈2,30 h y ≈2.420 kWh por tendencia; en investigación.", classification: "COPOWER" },
  { id: "GTE-JUN-006", date: "28-jun", equipment: "CPW01–03 / CPW05–07", eventType: "Falla", responsible: "Externo", notes: "Externo 34,5 kV (gallinazo / salida de la máquina); FS=0,38 h; ≈1.730 kWh; no imputable COPOWER.", classification: "Infraestructura externa" },
  { id: "GTE-JUN-008", date: "02-jun", equipment: "MRU / CPW01", eventType: "Operativo", responsible: "GTE", notes: "Mantenimiento MRU y detonación posterior al arranque.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-009", date: "03-jun", equipment: "CPW01", eventType: "Operativo", responsible: "GTE", notes: "Falla en sistema de admisión.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-010", date: "04-jun", equipment: "CPW01", eventType: "Operativo", responsible: "GTE", notes: "Equipo fuera por daño en tren de admisión.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-011", date: "06-jun", equipment: "JIN-01", eventType: "Operativo", responsible: "GTE", notes: "Cambio de válvula en JIN-01.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-013", date: "08-jun", equipment: "JIN-10", eventType: "Operativo", responsible: "GTE", notes: "Magnetización de transformador JIN-10.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-014", date: "09-jun", equipment: "JIN-10", eventType: "Operativo", responsible: "GTE", notes: "Pruebas de magnetización JIN-10.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-015", date: "10-jun", equipment: "CPW07", eventType: "Operativo", responsible: "GTE", notes: "Parada por altas vibraciones en CPW07.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-016", date: "23–24-jun", equipment: "CPW01–07 / MRU", eventType: "Causa comun", responsible: "GTE + COPOWER", notes: "FO-44: cuatro disparos EEP; descoordinación RL/480 V; ajuste 8×/15× pendiente de validar.", classification: "COPOWER" },
  { id: "GTE-JUN-017", date: "23-jun", equipment: "JIN-02", eventType: "Operativo", responsible: "GTE", notes: "Daño en tubería CYC-19.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-019", date: "24-jun", equipment: "MRU + QUINCY", eventType: "Operativo", responsible: "GTE", notes: "Salida por fuga de aceite del sistema Quincy.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-020", date: "24-jun", equipment: "JIN-02", eventType: "Operativo", responsible: "GTE", notes: "Mantenimiento CYC-19 (JIN-02).", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-021", date: "25-jun", equipment: "MRU", eventType: "Operativo", responsible: "GTE", notes: "Parada de MRU por alto nivel de NGL.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-022", date: "26-jun", equipment: "C9 + RX", eventType: "Causa comun", responsible: "GTE", notes: "Disparo de C9 y reconectador RX.", classification: "Infraestructura del campo" },
];

export function GteResumen({ month, only }: Props) {
  const showAll = !only?.length;
  const showSistemicos = showAll || only.includes("sistemicos");
  const showHoras = showAll || only.includes("horas");
  const data = GRAN_TIERRA_MONTHLY_DATA[month];
  if (!data) {
    return (
      <div className="exec-dashboard">
        <p className="empty-state">Sin informe Gran Tierra cargado para este periodo.</p>
      </div>
    );
  }

  const topUnits = [...data.generationByEquipment]
    .sort((a, b) => b.energiaKwh - a.energiaKwh)
    .slice(0, 10);
  const equipmentTotals = useMemo(
    () =>
      data.generationByEquipment.reduce(
        (acc, row) => {
          acc.energyKwh += row.energiaKwh;
          acc.opHours += row.horasOperacion;
          acc.sbHours += row.horasStandBy;
          acc.ppHours += row.horasPP;
          acc.pfContrHours += row.horasPFContr;
          acc.pfCliHours += row.horasPFCli;
          return acc;
        },
        {
          energyKwh: 0,
          opHours: 0,
          sbHours: 0,
          ppHours: 0,
          pfContrHours: 0,
          pfCliHours: 0,
        },
      ),
    [data.generationByEquipment],
  );
  const usingJuneClassifiedLog = month === "Jun";
  const gteEventLog = usingJuneClassifiedLog
    ? GTE_JUNE_EVENT_LOG
    : data.eventLog.map((e, index) => ({
        id: `GTE-${String(month).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
        date: e.date,
        equipment: e.equipment,
        eventType: e.eventType,
        responsible: e.responsible,
        notes: e.notes || e.cause,
        classification: classifyLogRow(e) as GteJuneClass,
      }));
  const recentEvents = gteEventLog.slice(0, 16);
  const eventSummary = useMemo(() => {
    const summary = { copower: 0, infrastructure: 0 };
    for (const ev of gteEventLog) {
      if (ev.classification === "COPOWER") summary.copower += 1;
      else summary.infrastructure += 1;
    }
    return summary;
  }, [gteEventLog]);
  const reportedFoCount = useMemo(() => {
    const ym =
      month === "Jul" ? "2026-07" : month === "Jun" ? "2026-06" : null;
    if (!ym) return 0;
    return RCA_COSTAYACO_EVENTOS.filter(
      (e) => e.fecha?.startsWith(ym) && !/BLANK|-XX-/i.test(e.id),
    ).length;
  }, [month]);
  const failureEvents = gteEventLog.filter((e) => e.eventType === "Falla");
  const units = data.machineIndicators.filter((m) => m.unidad !== "SISTEMA N");
  const monthIdx = GRAN_TIERRA_MONTH_ORDER.indexOf(month);

  const availOk = data.kpi.availability != null && data.kpi.availability >= META;
  const confOk = data.kpi.reliability != null && data.kpi.reliability >= META;
  const trendData = useMemo(
    () =>
      GRAN_TIERRA_MONTH_ORDER.slice(0, monthIdx + 1).map((m) => {
        const snap = GRAN_TIERRA_MONTHLY_DATA[m];
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
  const trendPctDomain = useMemo(() => {
    const vals = trendData.flatMap((r) =>
      [r.disponibilidad, r.confiabilidad].filter((v): v is number => v != null),
    );
    if (!vals.length) return [90, 100] as [number, number];
    const min = Math.min(...vals, 98);
    const floor = Math.max(0, Math.floor((min - 2) / 5) * 5);
    return [floor, 100] as [number, number];
  }, [trendData]);
  const hoursData = useMemo(
    () => [
      { estado: "Operación", horas: data.summary.hoursOperated, fill: "#818cf8" },
      { estado: "Stand-by", horas: data.summary.hoursStandby, fill: "#a5b4fc" },
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
  /**
   * Fallas y tiempos medios recalculados desde las columnas oficiales del Data
   * Soporte (Falla_evento / Horas_PF_contr), no desde el resumen precalculado.
   */
  const official = useMemo(() => {
    const failures = data.generationByEquipment.reduce((s, r) => s + (r.fallaEvento ?? 0), 0);
    return {
      failures,
      mtbfHours: failures > 0 ? equipmentTotals.opHours / failures : null,
      mttrHours: failures > 0 ? equipmentTotals.pfContrHours / failures : null,
    };
  }, [data.generationByEquipment, equipmentTotals]);

  /** Medición real del totalizador de gas Moqueta; sustituye al heat rate nominal del pack. */
  const effMedida = useMemo(() => buildEnergyEfficiency(month), [month]);

  const effCampo = useMemo(() => {
    const pack = loadOperacionPack();
    return eficienciaCampoSnapshot(pack.resumenDiario, month);
  }, [month]);

  /** Cobertura del cálculo de eficiencia frente a la generación oficial del mes. */
  const effBase = useMemo(() => {
    const pack = loadOperacionPack();
    const ym = effCampo.yearMonth;
    const monthRows = pack.resumenDiario.filter((r) => r.fecha.startsWith(ym));
    const withGas = monthRows.filter(
      (r) => (gasFt3FromResumen(r) ?? 0) > 0 && (r.kwAcumuladoDia ?? 0) > 0,
    );
    const hr = effCampo.general.heatRateFt3Kwh;
    const gasKwhOficial = data.generationByAsset.reduce((s, a) => s + a.gasKwh, 0);
    return {
      days: new Set(withGas.map((r) => r.fecha)).size,
      totalDays: new Set(monthRows.map((r) => r.fecha)).size,
      units: new Set(withGas.map((r) => r.equipoId)).size,
      totalUnits: new Set(monthRows.map((r) => r.equipoId)).size,
      coveragePct:
        data.totalGenerationKwh > 0
          ? (effCampo.general.energiaKwh / data.totalGenerationKwh) * 100
          : null,
      gasKwhOficial,
      /** Gas del mes implícito al aplicar el heat rate a la generación oficial. */
      gasMscfEstimado: hr != null ? (hr * gasKwhOficial) / 1000 : null,
    };
  }, [effCampo, data]);
  const prevMonth = monthIdx > 0 ? GRAN_TIERRA_MONTH_ORDER[monthIdx - 1] : null;
  const prevData = prevMonth ? GRAN_TIERRA_MONTHLY_DATA[prevMonth] : null;
  const effPct = effMedida?.efficiencyHhvPct ?? effCampo.general.eficienciaPct;
  const effHeatRate = effMedida?.heatRateFt3Kwh ?? effCampo.general.heatRateFt3Kwh;
  const effPctLabel = effPct == null ? "N/D" : `${effPct.toFixed(1)}%`;
  const effOk = effPct != null && effPct >= META_EFF;

  const fmtPpDelta = (curr: number | null | undefined, prev: number | null | undefined) => {
    if (curr == null || prev == null || Number.isNaN(curr) || Number.isNaN(prev)) return null;
    const pp = (curr - prev) * 100;
    return {
      text: `${pp >= 0 ? "+" : ""}${pp.toFixed(2)} pp vs ${prevData?.label ?? "mes ant."}`,
      improved: pp > 0,
      flat: Math.abs(pp) < 0.005,
    };
  };
  const fmtGenDelta = (currKwh: number, prevKwh: number | null | undefined) => {
    if (prevKwh == null || Number.isNaN(prevKwh) || prevKwh === 0) return null;
    const ppEquiv = ((currKwh - prevKwh) / prevKwh) * 100;
    const mwh = (currKwh - prevKwh) / 1000;
    return {
      text: `${mwh >= 0 ? "+" : ""}${mwh.toFixed(1)} MWh (${ppEquiv >= 0 ? "+" : ""}${ppEquiv.toFixed(1)}%) vs ${prevData?.label ?? "mes ant."}`,
      improved: mwh > 0,
      flat: Math.abs(mwh) < 0.05,
    };
  };
  const cpwDisp = useMemo(() => buildDisponibilidadAnalisis(month), [month]);
  const prevCpwDisp = useMemo(
    () => (prevMonth ? buildDisponibilidadAnalisis(prevMonth) : null),
    [prevMonth],
  );
  const deltaDisp = fmtPpDelta(data.kpi.availability, prevData?.kpi.availability);
  const deltaDispCpw = fmtPpDelta(cpwDisp.dispCpw, prevCpwDisp?.dispCpw);
  const deltaConf = fmtPpDelta(data.kpi.reliability, prevData?.kpi.reliability);
  const deltaGen = fmtGenDelta(data.totalGenerationKwh, prevData?.totalGenerationKwh);

  /** Desglose alineado al informe: Costayaco gas + diésel + Vonu. */
  const genBreakdown = useMemo(() => {
    const cyc = data.generationByAsset.find((a) => /costayaco/i.test(a.asset));
    const vonu = data.generationByAsset.find((a) => /von/i.test(a.asset));
    const cycGas = cyc?.gasKwh ?? data.summary.energyGasKwh;
    const cycDiesel = cyc?.dieselKwh ?? data.summary.energyDieselKwh;
    const vonuKwh = (vonu?.gasKwh ?? 0) + (vonu?.dieselKwh ?? 0);
    return { cycGas, cycDiesel, vonuKwh };
  }, [data]);

  return (
    <div className="exec-dashboard">
      {showAll ? (
      <header className="exec-header">
        <div>
          <p className="eyebrow">Gran Tierra Energy · Informe mensual</p>
          <h2>{data.label} 2026 — Costayaco / Vonú</h2>
          <p className="muted">Data Soporte / indicadores oficiales entregados a GTE</p>
        </div>
        <span className="source-badge gte">GTE</span>
      </header>
      ) : null}

      {showAll ? (
      <section className="panel">
        <article className="card">
          <p className="eyebrow">0 · KPI del periodo {data.label}</p>
          <div className="exec-kpi-row">
            <div className="exec-kpi">
              <span>Disponibilidad</span>
              <strong>{pct(data.kpi.availability)}</strong>
              <small>Informe oficial</small>
            </div>
            <div className="exec-kpi">
              <span>Confiabilidad</span>
              <strong>{pct(data.kpi.reliability)}</strong>
              <small>Informe oficial</small>
            </div>
            <div className="exec-kpi">
              <span>Generación</span>
              <strong>{kwh(data.totalGenerationKwh)}</strong>
              <small>Informe oficial</small>
            </div>
            <div className="exec-kpi">
              {month === "Jul" ? (
                <>
                  <span>Eventos reportados</span>
                  <strong>{reportedFoCount || 5}</strong>
                  <small>FO-GE-033 oficiales del mes</small>
                </>
              ) : (
                <>
                  <span>Fallas / eventos</span>
                  <strong>{`${eventSummary.copower} asociadas a COPOWER · ${eventSummary.infrastructure} a la infraestructura del campo`}</strong>
                  <small>{`Total ${gteEventLog.length}`}</small>
                </>
              )}
            </div>
            <div className="exec-kpi">
              <span>{effMedida ? "Eficiencia medida" : "Eficiencia estimada"}</span>
              <strong>{effPctLabel}</strong>
              <small>
                HR {effHeatRate == null ? "N/D" : `${effHeatRate.toFixed(2)} ft³/kWh`}
                {effMedida
                  ? ` · gas MQT medido · ${effMedida.month.units.join("/")}`
                  : ` · ${effBase.days}/${effBase.totalDays} días con dato de gas`}
              </small>
            </div>
          </div>
          <p className="muted" style={{ marginTop: "0.65rem", fontSize: "0.78rem" }}>
            Fórmula: {effMedida ? EFICIENCIA_MEDIDA_FORMULA : EFICIENCIA_FORMULA}
          </p>
        </article>
      </section>
      ) : null}

      {showAll || showSistemicos ? (
      <section className="dash-chart-grid">
        <article className="dash-chart-panel dash-chart-panel--wide">
          <h4>Tendencia disponibilidad y confiabilidad</h4>
          <p className="muted dash-chart-sub">Ene – mes seleccionado · línea punteada = meta 98%</p>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis domain={trendPctDomain} tick={{ fontSize: 10 }} width={36} unit="%" />
                <Tooltip
                  formatter={(v, name) => [v == null ? "N/D" : `${Number(v).toFixed(2)}%`, String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine y={98} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "98%", fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="disponibilidad"
                  name="Disponibilidad"
                  stroke="#6366f1"
                  strokeWidth={2.4}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="confiabilidad"
                  name="Confiabilidad"
                  stroke="#16a34a"
                  strokeWidth={2.4}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        {showAll ? (
          <>
        <article className="dash-chart-panel">
          <h4>Generación acumulada (MWh)</h4>
          <p className="muted dash-chart-sub">Tendencia mensual Gran Tierra</p>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={48} />
                <Tooltip formatter={(v) => [`${Number(v).toFixed(1)} MWh`, ""]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="generacionMwh"
                  name="GTE"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dash-chart-panel">
          <h4>Horas por estado</h4>
          <p className="muted dash-chart-sub">Informe mensual · Data Soporte</p>
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
          <p className="muted dash-chart-sub">Top unidades del periodo · Gran Tierra</p>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={fleetBarData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="unidad" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={52} />
                <YAxis tick={{ fontSize: 10 }} width={32} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="fallas" name="Fallas" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
          </>
        ) : null}
      </section>
      ) : null}

      {showSistemicos ? (
      <section className="panel inf-report-section" id="inf-sec-resumen">
        <ExecInsight text={INFORME_EXEC_INSIGHTS.resumen} />
        <details className="card inf-conf-collapse" open>
          <summary className="inf-conf-collapse-sum">
            <div className="inf-conf-collapse-sum-main">
              <p className="eyebrow">1 · Indicadores sistémicos</p>
              <h3>Cumplimiento contractual</h3>
            </div>
          </summary>
          <div className="inf-conf-collapse-body">
          <div className="exec-core-grid exec-core-grid--5">
            <div className="exec-core">
              <span>Generación total</span>
              <strong>{kwh(data.totalGenerationKwh)}</strong>
              <p>{data.kpi.generationMwh.toFixed(1)} MWh</p>
              <small>
                CYC gas {kwh(genBreakdown.cycGas)} · Diésel {kwh(genBreakdown.cycDiesel)}
                {genBreakdown.vonuKwh > 0 ? ` · Vonú ${kwh(genBreakdown.vonuKwh)}` : ""}
                {deltaGen ? (
                  <>
                    <br />
                    <span
                      className={
                        deltaGen.flat
                          ? undefined
                          : deltaGen.improved
                            ? "delta positive"
                            : "delta negative"
                      }
                    >
                      {deltaGen.text}
                    </span>
                  </>
                ) : null}
              </small>
            </div>
            <div className={`exec-core gte${availOk ? " ok" : " warn"}`}>
              <span>Disponibilidad GTE</span>
              <strong>{pct(data.kpi.availability)}</strong>
              <p>Meta ≥ {pct(META, 0)}</p>
              <small>
                Informe mensual
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
            <div className={`exec-core cpw${cpwDisp.dispCpw != null && cpwDisp.dispCpw >= META ? " ok" : ""}`}>
              <span>Disponibilidad COPOWER</span>
              <strong>{pct(cpwDisp.dispCpw)}</strong>
              <p>Meta ≥ {pct(META, 0)}</p>
              <small>
                Concertación · OP + stand-by
                {cpwDisp.programmed > 0 ? (
                  <>
                    <br />
                    {Math.round(cpwDisp.cpwAvailable).toLocaleString("es-CO")} /{" "}
                    {Math.round(cpwDisp.programmed).toLocaleString("es-CO")} h
                  </>
                ) : null}
                {deltaDispCpw ? (
                  <>
                    <br />
                    <span
                      className={
                        deltaDispCpw.flat
                          ? undefined
                          : deltaDispCpw.improved
                            ? "delta positive"
                            : "delta negative"
                      }
                    >
                      {deltaDispCpw.text}
                    </span>
                  </>
                ) : null}
              </small>
            </div>
            <div className={`exec-core${confOk ? " ok" : " warn"}`}>
              <span>Confiabilidad</span>
              <strong>{pct(data.kpi.reliability)}</strong>
              <p>Meta ≥ {pct(META, 0)}</p>
              <small>
                Orden 1
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
            <div className={`exec-core${effPct == null ? "" : effOk ? " ok" : " warn"}`}>
              <span>{effMedida ? "Eficiencia medida" : "Eficiencia estimada"}</span>
              <strong>{effPctLabel}</strong>
              <p>Meta ≥ {META_EFF}%</p>
              <small>
                HR {effHeatRate == null ? "N/D" : `${effHeatRate.toFixed(2)} ft³/kWh`}
                {effMedida ? (
                  <>
                    <br />
                    {Math.round(effMedida.month.gasMcf).toLocaleString("es-CO")} MCF medidos ·{" "}
                    {effMedida.month.spanDays.toFixed(0)}/{effMedida.month.calendarDays} días
                    <br />
                    {effMedida.efficiencyLhvPct == null
                      ? null
                      : `${effMedida.efficiencyLhvPct.toFixed(1)} % sobre LHV`}
                    <br />
                    Base contractual {REPORT_HEATING_VALUE.hhvBtuScf} BTU/scf HHV
                  </>
                ) : (
                  <>
                    <br />
                    {effBase.days}/{effBase.totalDays} días · {effBase.units}/{effBase.totalUnits}{" "}
                    unidades con medición
                    {effBase.coveragePct != null ? (
                      <>
                        <br />
                        Base {effBase.coveragePct.toFixed(0)} % de la generación del mes
                      </>
                    ) : null}
                  </>
                )}
              </small>
            </div>
          </div>
          {effMedida ? (
            <p className="muted" style={{ marginTop: "0.6rem", fontSize: "0.74rem" }}>
              Heat rate medido con el totalizador del gas Moqueta sobre{" "}
              {effMedida.month.units.join(", ")}: {Math.round(effMedida.month.gasMcf).toLocaleString("es-CO")}{" "}
              MCF contra {Math.round(effMedida.month.energyKwh).toLocaleString("es-CO")} kWh entre el{" "}
              {effMedida.month.from} y el {effMedida.month.to}:{" "}
              {effMedida.heatRateBtuKwh == null
                ? "N/D"
                : Math.round(effMedida.heatRateBtuKwh).toLocaleString("es-CO")}{" "}
              BTU/kWh. Eficiencia calculada con el poder calorífico contractual de{" "}
              {REPORT_HEATING_VALUE.hhvBtuScf} BTU/scf HHV, la misma base de los informes anteriores;
              la línea Moqueta no tiene cromatografía propia. Detalle por máquina y escenarios con la
              cromatografía medida en el slide 12.
            </p>
          ) : (
            <p className="muted" style={{ marginTop: "0.6rem", fontSize: "0.74rem" }}>
              Sin totalizador de gas para el periodo: se usa el heat rate nominal del pack diario,
              que es una constante de referencia y no una medición.
            </p>
          )}
          </div>
        </details>
      </section>
      ) : null}

      {showHoras ? (
      <section className="panel">
        <details className="card inf-conf-collapse" open>
          <summary className="inf-conf-collapse-sum">
            <div className="inf-conf-collapse-sum-main">
              <p className="eyebrow">2 · Horas y eventos</p>
              <h3>Resumen operativo del informe</h3>
            </div>
          </summary>
          <div className="inf-conf-collapse-body">
          <MetricGlossary />
          <div className="exec-kpi-row">
            <div className="exec-kpi">
              <Zap size={16} />
              <span>Horas operación</span>
              <strong>{hours(data.summary.hoursOperated)}</strong>
              <small>
                Stand-by {hours(data.summary.hoursStandby)}
                <br />
                Incluye JIN-11/12 (ventana parcial); anexo de unidades puede dar menor SB
              </small>
            </div>
            <div className="exec-kpi">
              <Wrench size={16} />
              <span>Registros de bitácora</span>
              <strong>{gteEventLog.length}</strong>
              <small>
                {failureEvents.length} tipo falla
                {reportedFoCount > 0 ? ` · ${reportedFoCount} FO-GE-033` : ""}
                <br />
                Sin consolidar: la lámina de repetitivos fusiona los multi-unidad
              </small>
            </div>
            <div className="exec-kpi">
              <Wrench size={16} />
              <span>Fallas imputables a COPOWER</span>
              <strong>{official.failures}</strong>
              <small>
                Falla_evento · Data Soporte
                <br />
                {`Infraestructura del campo ${eventSummary.infrastructure}`}
              </small>
            </div>
            <div className="exec-kpi">
              <Gauge size={16} />
              <MetricLabel code="MTBF" />
              <strong>
                {official.mtbfHours == null ? "Sin fallas" : hours(official.mtbfHours)}
              </strong>
              <small>
                MTTR {official.mttrHours == null ? "—" : hours(official.mttrHours)}
                <br />
                {official.failures > 0
                  ? `${equipmentTotals.opHours.toFixed(0)} h OP / ${official.failures} fallas`
                  : "Sin fallas imputables en el periodo"}
              </small>
            </div>
          </div>
          <div className="exec-kpi-row" style={{ marginTop: "0.5rem" }}>
            <div className="exec-kpi">
              <span>Preventivo (PP)</span>
              <strong>{hours(equipmentTotals.ppHours)}</strong>
              <small>Paradas programadas del mes</small>
            </div>
            <div className="exec-kpi">
              <span>Correctivo</span>
              <strong>{hours(data.summary.hoursCorrective)}</strong>
              <small>Fuera de plan</small>
            </div>
            <div className="exec-kpi">
              <span>FS asociado a COPOWER</span>
              <strong>{hours(equipmentTotals.pfContrHours)}</strong>
              <small>PF_contr · descuenta confiabilidad</small>
            </div>
            <div className="exec-kpi">
              <span>FS cliente</span>
              <strong>{hours(equipmentTotals.pfCliHours)}</strong>
              <small>PF_cli · no imputable</small>
            </div>
          </div>
          <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.74rem" }}>
            Cierre de horas: OP {equipmentTotals.opHours.toFixed(0)} + SB{" "}
            {equipmentTotals.sbHours.toFixed(0)} + PP {equipmentTotals.ppHours.toFixed(0)} + PF_contr{" "}
            {equipmentTotals.pfContrHours.toFixed(0)} + PF_cli {equipmentTotals.pfCliHours.toFixed(0)} ={" "}
            {(
              equipmentTotals.opHours +
              equipmentTotals.sbHours +
              equipmentTotals.ppHours +
              equipmentTotals.pfContrHours +
              equipmentTotals.pfCliHours
            ).toFixed(0)}{" "}
            h sobre {data.generationByEquipment.length} unidades.
          </p>
          </div>
        </details>
      </section>
      ) : null}

      {showAll ? (
      <>
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
                    <td>
                      <span
                        className={`badge ${
                          u.cumplimiento === "CUMPLE"
                            ? "success"
                            : u.cumplimiento === "NO CUMPLE"
                              ? "danger"
                              : "info"
                        }`}
                      >
                        {u.cumplimiento}
                      </span>
                    </td>
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
          <h3>Data Soporte · detalle mensual</h3>
          <div className="exec-kpi-row" style={{ marginBottom: "0.55rem" }}>
            <div className="exec-kpi">
              <span>Total energía (periodo)</span>
              <strong>{kwh(equipmentTotals.energyKwh)}</strong>
              <small>Suma de todos los equipos del mes</small>
            </div>
            <div className="exec-kpi">
              <span>Total OP / SB</span>
              <strong>{`${equipmentTotals.opHours.toFixed(1)} h / ${equipmentTotals.sbHours.toFixed(1)} h`}</strong>
              <small>Operación / Stand-by</small>
            </div>
            <div className="exec-kpi">
              <span>Total PP / PF contr</span>
              <strong>{`${equipmentTotals.ppHours.toFixed(1)} h / ${equipmentTotals.pfContrHours.toFixed(1)} h`}</strong>
              <small>Preventivo / FS asociada COPOWER</small>
            </div>
            <div className="exec-kpi">
              <span>Total PF cli</span>
              <strong>{`${equipmentTotals.pfCliHours.toFixed(1)} h`}</strong>
              <small>FS asociada a cliente / infraestructura</small>
            </div>
          </div>
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
          <p className="muted" style={{ marginTop: "0.55rem" }}>
            Definiciones: <strong>OP</strong> = horas de operación, <strong>SB</strong> = stand-by,
            <strong> PP</strong> = mantenimiento preventivo, <strong>PF contr</strong> = fuera de servicio asociada a
            COPOWER, <strong>PF cli</strong> = fuera de servicio asociada a cliente/infraestructura.
          </p>
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">6 · Bitácora oficial</p>
          <h3>Eventos consolidados por incidente único</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>Tipo</th>
                  <th>Clasificación</th>
                  <th>Descripción / notas</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Sin eventos en bitácora para este mes.</td>
                  </tr>
                ) : (
                  recentEvents.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <strong>{e.id}</strong>
                      </td>
                      <td>{e.date}</td>
                      <td>{e.equipment}</td>
                      <td>
                        <span className={`badge ${e.eventType === "Falla" ? "danger" : "info"}`}>{e.eventType}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            e.classification === "COPOWER"
                              ? "danger"
                              : e.classification === "Infraestructura del campo"
                                ? "info"
                                : "warn"
                          }`}
                        >
                          {e.classification}
                        </span>
                      </td>
                      <td className="detalle-cell">{e.notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {usingJuneClassifiedLog ? (
            <p className="muted" style={{ marginTop: "0.55rem" }}>
              Junio consolidado por criterio contractual PF: COPOWER {eventSummary.copower} · Infraestructura del campo{" "}
              {eventSummary.infrastructure}.
            </p>
          ) : null}
        </article>
      </section>

      <aside className="exec-source-note" aria-label="Fuente">
        <p>
          <strong>Fuente:</strong> {data.sourceFile}. Indicadores contractuales entregados a Gran Tierra Energy.
          No incluye consumos de lubricantes (solo disponibles en reporte diario COPOWER).
        </p>
      </aside>
      </>
      ) : null}
    </div>
  );
}
