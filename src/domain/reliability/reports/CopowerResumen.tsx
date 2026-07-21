import { Gauge, Wrench, Zap } from "lucide-react";
import { MetricGlossary, MetricLabel } from "../ui/metricDefs";
import {
  COPOWER_MONTHLY_DATA,
  COPOWER_SOURCE_FILE,
  type CopowerMonthKey,
} from "./copowerMonthly";

const pct = (ratio: number | null | undefined, digits = 2) =>
  ratio == null || Number.isNaN(ratio) ? "N/D" : `${(ratio * 100).toFixed(digits)}%`;
const kwh = (value: number) => `${Math.round(value).toLocaleString("es-CO")} kWh`;
const hours = (value: number | null | undefined) =>
  value == null || Number.isNaN(value) ? "N/D" : `${value.toFixed(1)} h`;

type Props = {
  month: CopowerMonthKey;
};

export function CopowerResumen({ month }: Props) {
  const data = COPOWER_MONTHLY_DATA[month];
  const topUnits = [...data.generationByEquipment]
    .sort((a, b) => b.energiaKwh - a.energiaKwh)
    .slice(0, 8);
  const failureEvents = data.eventLog.filter((e) => e.eventType === "Falla").slice(0, 12);
  const oilTotal = data.consumos.reduce((acc, row) => acc + row.adicionAceite + row.cambioAceite, 0);

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
          <p className="eyebrow">1 · Desempeño operativo</p>
          <h3>Resumen del periodo</h3>
          <div className="exec-core-grid">
            <div className="exec-core ok">
              <span>Disponibilidad operativa</span>
              <strong>{pct(data.kpi.availability)}</strong>
              <p>OP + SB / (OP + SB + MTO + FS)</p>
              <small>Resumen OP</small>
            </div>
            <div className="exec-core">
              <span>Generación total</span>
              <strong>{kwh(data.totalGenerationKwh)}</strong>
              <p>{data.kpi.generationMwh.toFixed(1)} MWh</p>
              <small>Σ kWh acumulado día</small>
            </div>
            <div className="exec-core">
              <span>Horas de operación</span>
              <strong>{hours(data.summary.hoursOperated)}</strong>
              <p>Stand-by {hours(data.summary.hoursStandby)}</p>
              <small>Resumen OP</small>
            </div>
          </div>
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">2 · Frecuencia y severidad</p>
          <h3>Eventos e indicadores</h3>
          <MetricGlossary />
          <div className="exec-kpi-row">
            <div className="exec-kpi">
              <Wrench size={16} />
              <span>Eventos registrados</span>
              <strong>{data.summary.totalEvents ?? 0}</strong>
              <small>Hoja Eventos de Generación</small>
            </div>
            <div className="exec-kpi">
              <Wrench size={16} />
              <span>Fallas imputables COPOWER</span>
              <strong>{data.summary.copowerFailures}</strong>
              <small>Clasificación por texto del evento</small>
            </div>
            <div className="exec-kpi">
              <Gauge size={16} />
              <MetricLabel code="MTBF" />
              <strong>{hours(data.summary.mtbfHours)}</strong>
              <small>OP / #fallas del mes</small>
            </div>
            <div className="exec-kpi">
              <Gauge size={16} />
              <MetricLabel code="MTTR" />
              <strong>{hours(data.summary.mttrHours)}</strong>
              <small>FS / #fallas (si aplica)</small>
            </div>
          </div>
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">3 · Generación por equipo</p>
          <h3>Principales unidades</h3>
          <div className="table-scroll">
            <table className="indicators-table exec-unit-table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Campo</th>
                  <th>Energía</th>
                  <th>OP (h)</th>
                  <th>SB (h)</th>
                  <th>MTO (h)</th>
                  <th>FS (h)</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="panel two-col">
        <article className="card">
          <p className="eyebrow">4 · Consumos</p>
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
          <p className="eyebrow">5 · Bitácora</p>
          <h3>Eventos recientes del mes</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {failureEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4}>Sin eventos de falla cargados para este mes en la hoja de eventos.</td>
                  </tr>
                ) : (
                  failureEvents.map((e) => (
                    <tr key={`${e.date}-${e.equipment}-${e.cause.slice(0, 24)}`}>
                      <td>{e.date}</td>
                      <td>{e.equipment}</td>
                      <td>
                        <span className="badge danger">{e.eventType}</span>
                      </td>
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
