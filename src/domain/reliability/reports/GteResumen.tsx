import { Gauge, Wrench, Zap } from "lucide-react";
import { CONTRACTUAL_KPI_TARGETS } from "../contracts/gteOrders";
import { MetricGlossary, MetricLabel } from "../ui/metricDefs";
import {
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
  const recentEvents = data.eventLog.slice(0, 12);
  const failureEvents = data.eventLog.filter((e) => e.eventType === "Falla");
  const units = data.machineIndicators.filter((m) => m.unidad !== "SISTEMA N");

  const availOk = data.kpi.availability != null && data.kpi.availability >= META;
  const confOk = data.kpi.reliability != null && data.kpi.reliability >= META;

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
              <strong>{data.summary.totalEvents ?? data.eventLog.length}</strong>
              <small>{failureEvents.length} tipo falla</small>
            </div>
            <div className="exec-kpi">
              <Wrench size={16} />
              <span>Fallas imputables</span>
              <strong>{data.summary.copowerFailures}</strong>
              <small>PF_contr / criterio GTE</small>
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
              <span>FS imputable COPOWER</span>
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

      <section className="panel">
        <article className="card">
          <p className="eyebrow">6 · Bitácora oficial</p>
          <h3>Eventos del informe GTE</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>Tipo</th>
                  <th>Resp.</th>
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
                    <tr key={`${e.date}-${e.equipment}-${e.cause.slice(0, 20)}`}>
                      <td>{e.date}</td>
                      <td>{e.equipment}</td>
                      <td>
                        <span className={`badge ${e.eventType === "Falla" ? "danger" : "info"}`}>{e.eventType}</span>
                      </td>
                      <td>{e.responsible}</td>
                      <td className="detalle-cell">{e.notes || e.cause}</td>
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
          <strong>Fuente:</strong> {data.sourceFile}. Indicadores contractuales entregados a Gran Tierra Energy.
          No incluye consumos de lubricantes (solo disponibles en reporte diario COPOWER).
        </p>
      </aside>
    </div>
  );
}
