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
import { MetricGlossary, MetricLabel } from "../ui/metricDefs";
import {
  GRAN_TIERRA_MONTH_ORDER,
  GRAN_TIERRA_MONTHLY_DATA,
  type GranTierraMonthKey,
} from "./granTierraMonthly";

const META = CONTRACTUAL_KPI_TARGETS.reliability;

const pct = (ratio: number | null | undefined, digits = 2) =>
  ratio == null || Number.isNaN(ratio) ? "N/D" : `${(ratio * 100).toFixed(digits)}%`;
const kwh = (value: number) => `${Math.round(value).toLocaleString("es-CO")} kWh`;
const hours = (value: number | null | undefined) =>
  value == null || Number.isNaN(value) ? "N/D" : `${value.toFixed(1)} h`;

type Props = {
  month: GranTierraMonthKey;
};

type GteJuneClass = "COPOWER" | "Infraestructura del campo";

type GteJuneEventRow = {
  id: string;
  date: string;
  equipment: string;
  eventType: "Falla" | "Causa comun" | "Operativo";
  responsible: "COPOWER" | "GTE" | "Externo";
  notes: string;
  classification: GteJuneClass;
};

const GTE_JUNE_EVENT_LOG: GteJuneEventRow[] = [
  { id: "GTE-JUN-001", date: "03-jun", equipment: "CPW06", eventType: "Falla", responsible: "COPOWER", notes: "Cambio de intercooler por exceso de residuo de secuestrante.", classification: "COPOWER" },
  { id: "GTE-JUN-002", date: "05-jun", equipment: "CPW01", eventType: "Falla", responsible: "COPOWER", notes: "Daño en flexible del múltiple de gases de escape después de mantenimiento.", classification: "COPOWER" },
  { id: "GTE-JUN-003", date: "11-jun", equipment: "CPW03", eventType: "Falla", responsible: "COPOWER", notes: "Detonación del equipo.", classification: "COPOWER" },
  { id: "GTE-JUN-004", date: "27-jun", equipment: "CPW06", eventType: "Falla", responsible: "COPOWER", notes: "Perturbación eléctrica; salida de línea de CPW06 (revisar RCA técnico).", classification: "COPOWER" },
  { id: "GTE-JUN-005", date: "27-jun", equipment: "CPW07", eventType: "Falla", responsible: "COPOWER", notes: "Perturbación eléctrica; salida de línea de CPW07 (revisar RCA técnico).", classification: "COPOWER" },
  { id: "GTE-JUN-006", date: "28-jun", equipment: "CPW05", eventType: "Falla", responsible: "COPOWER", notes: "Potencia inversa y falla en gobernación (revisar relación con MRU en RCA).", classification: "COPOWER" },
  { id: "GTE-JUN-007", date: "28-jun", equipment: "CPW06", eventType: "Falla", responsible: "COPOWER", notes: "Salida por sobrecarga (revisar relación con MRU en RCA).", classification: "COPOWER" },
  { id: "GTE-JUN-008", date: "02-jun", equipment: "MRU / CPW01", eventType: "Operativo", responsible: "GTE", notes: "Mantenimiento MRU y detonación posterior al arranque.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-009", date: "03-jun", equipment: "CPW01", eventType: "Operativo", responsible: "GTE", notes: "Falla en sistema de admisión.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-010", date: "04-jun", equipment: "CPW01", eventType: "Operativo", responsible: "GTE", notes: "Equipo fuera por daño en tren de admisión.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-011", date: "06-jun", equipment: "JIN-01", eventType: "Operativo", responsible: "GTE", notes: "Cambio de válvula en JIN-01.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-012", date: "07-jun", equipment: "CPW01", eventType: "Falla", responsible: "GTE", notes: "Detonación con evidencia de caída de presión de gas.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-013", date: "08-jun", equipment: "JIN-10", eventType: "Operativo", responsible: "GTE", notes: "Magnetización de transformador JIN-10.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-014", date: "09-jun", equipment: "JIN-10", eventType: "Operativo", responsible: "GTE", notes: "Pruebas de magnetización JIN-10.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-015", date: "10-jun", equipment: "CPW07", eventType: "Operativo", responsible: "GTE", notes: "Parada por altas vibraciones en CPW07.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-016", date: "23-jun", equipment: "CPW04 / CPW05", eventType: "Causa comun", responsible: "GTE", notes: "Apertura del tablero de auxiliares 480 V.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-017", date: "23-jun", equipment: "JIN-02", eventType: "Operativo", responsible: "GTE", notes: "Daño en tubería CYC-19.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-018", date: "24-jun", equipment: "RED 34.5 kV", eventType: "Causa comun", responsible: "GTE", notes: "Disparo del reconectador de 34,5 kV.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-019", date: "24-jun", equipment: "MRU + QUINCY", eventType: "Operativo", responsible: "GTE", notes: "Salida por fuga de aceite del sistema Quincy.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-020", date: "24-jun", equipment: "JIN-02", eventType: "Operativo", responsible: "GTE", notes: "Mantenimiento CYC-19 (JIN-02).", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-021", date: "25-jun", equipment: "MRU", eventType: "Operativo", responsible: "GTE", notes: "Parada de MRU por alto nivel de NGL.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-022", date: "26-jun", equipment: "C9 + RX", eventType: "Causa comun", responsible: "GTE", notes: "Disparo de C9 y reconectador RX.", classification: "Infraestructura del campo" },
  { id: "GTE-JUN-023", date: "28-jun", equipment: "CPW01 / CPW02 / CPW03 / CPW07", eventType: "Operativo", responsible: "GTE", notes: "Salida de equipos por parada de MRU.", classification: "Infraestructura del campo" },
];

export function GteResumen({ month }: Props) {
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
        classification: (e.responsible === "COPOWER"
          ? "COPOWER"
          : "Infraestructura del campo") as GteJuneClass,
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

  return (
    <div className="exec-dashboard">
      <header className="exec-header">
        <div>
          <p className="eyebrow">Gran Tierra Energy · Informe mensual</p>
          <h2>{data.label} 2026 — Costayaco / Vonú</h2>
          <p className="muted">Data Soporte / indicadores oficiales entregados a GTE</p>
        </div>
        <span className="source-badge gte">GTE</span>
      </header>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">0 · KPI del periodo Junio</p>
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
              <span>Fallas / eventos</span>
              <strong>{`${eventSummary.copower} asociadas a COPOWER · ${eventSummary.infrastructure} a la infraestructura del campo`}</strong>
              <small>{`Total ${gteEventLog.length}`}</small>
            </div>
          </div>
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
      </section>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">1 · Indicadores sistémicos</p>
          <h3>Cumplimiento contractual</h3>
          <div className="exec-core-grid">
            <div className={`exec-core${availOk ? " ok" : " warn"}`}>
              <span>Disponibilidad</span>
              <strong>{pct(data.kpi.availability)}</strong>
              <p>Meta ≥ {pct(META, 0)}</p>
              <small>Informe mensual GTE</small>
            </div>
            <div className={`exec-core${confOk ? " ok" : " warn"}`}>
              <span>Confiabilidad</span>
              <strong>{pct(data.kpi.reliability)}</strong>
              <p>Meta ≥ {pct(META, 0)}</p>
              <small>Orden 1</small>
            </div>
            <div className="exec-core">
              <span>Generación total</span>
              <strong>{kwh(data.totalGenerationKwh)}</strong>
              <p>{data.kpi.generationMwh.toFixed(1)} MWh</p>
              <small>Gas {kwh(data.summary.energyGasKwh)} · Diésel {kwh(data.summary.energyDieselKwh)}</small>
            </div>
          </div>
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">2 · Horas y eventos</p>
          <h3>Resumen operativo del informe</h3>
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
              <strong>{gteEventLog.length}</strong>
              <small>{failureEvents.length} tipo falla</small>
            </div>
            <div className="exec-kpi">
              <Wrench size={16} />
              <span>Fallas asociadas a COPOWER</span>
              <strong>{eventSummary.copower}</strong>
              <small>{`Eventos infraestructura del campo ${eventSummary.infrastructure}`}</small>
            </div>
            <div className="exec-kpi">
              <Gauge size={16} />
              <MetricLabel code="MTBF" />
              <strong>{hours(data.summary.mtbfHours)}</strong>
              <small>MTTR {hours(data.summary.mttrHours)}</small>
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
    </div>
  );
}
