import { CONTRACTUAL_KPI_TARGETS, getReliabilityDeduction } from "../contracts/gteOrders";
import { JUNE_2026_IMPUTABLE_EVENTS } from "./juneImputableEvents";
import {
  GRAN_TIERRA_MONTHLY_DATA,
  type GranTierraMonthKey,
} from "./granTierraMonthly";
import { assessTechnicalRisk } from "../risk/technicalRisk";

type Props = {
  month: GranTierraMonthKey;
  monthLabel: string;
};

const pct = (v: number | null | undefined) =>
  v == null ? "N/D" : `${(v * 100).toFixed(2)}%`;

export function MeetingBrief({ month, monthLabel }: Props) {
  const snap = GRAN_TIERRA_MONTHLY_DATA[month];
  if (!snap) {
    return (
      <section className="panel">
        <article className="card">
          <p className="empty-state">Sin registros GTE para {monthLabel}.</p>
        </article>
      </section>
    );
  }
  const kpi = snap.kpi;
  const band = kpi.reliability == null ? null : getReliabilityDeduction(kpi.reliability);
  const meta = CONTRACTUAL_KPI_TARGETS.reliability;

  const deviations = [
    {
      name: "Disponibilidad",
      value: kpi.availability,
      gap: kpi.availability == null ? null : (kpi.availability - meta) * 100,
    },
    {
      name: "Confiabilidad",
      value: kpi.reliability,
      gap: kpi.reliability == null ? null : (kpi.reliability - meta) * 100,
    },
    {
      name: "Fallas asociadas a COPOWER",
      value: snap.summary.copowerFailures,
      gap: null as number | null,
    },
  ]
    .filter((d) => d.gap != null && d.gap < 0)
    .sort((a, b) => (a.gap ?? 0) - (b.gap ?? 0))
    .slice(0, 3);

  const badActor = [...snap.machineIndicators]
    .filter((m) => m.unidad !== "SISTEMA N" && m.fallas > 0)
    .sort((a, b) => b.fallas - a.fallas || (a.mttrHours ?? 0) - (b.mttrHours ?? 0))[0];

  const riskOpen = snap.machineIndicators
    .filter((m) => m.unidad !== "SISTEMA N")
    .map((m) => ({
      ...m,
      assessed: assessTechnicalRisk({
        fallas: m.fallas,
        mtbfLabel: m.mtbfLabel,
        mttrHours: m.mttrHours,
        disponibilidadPct: m.disponibilidadPct,
        skip: m.cumplimiento === "N/A",
      }),
    }))
    .filter((m) => m.assessed.riesgo === "RIESGO MEDIO" || m.assessed.riesgo === "RIESGO ALTO");

  const rcaPending = month === "Jun" ? JUNE_2026_IMPUTABLE_EVENTS.length : null;
  const actionsOverdue = snap.summary.actionsOverdue;

  return (
    <div className="meeting-brief">
      <header className="meeting-brief-header">
        <div>
          <p className="eyebrow">Reunión mensual de gestión</p>
          <h2>Desempeño — {monthLabel}</h2>
          <p className="muted">
            Vista consolidada para reunión. Solo datos jalados de módulos existentes. Sin comentarios generados.
          </p>
        </div>
        <button type="button" className="open-popup-btn" onClick={() => window.print()}>
          Imprimir / PDF
        </button>
      </header>

      <section className="panel">
        <article className="card">
          <h3>1 · KPIs del mes</h3>
          <div className="exec-kpi-row">
            <div className="exec-kpi">
              <span>Disponibilidad</span>
              <strong>{pct(kpi.availability)}</strong>
              <small>Meta ≥98%</small>
            </div>
            <div className="exec-kpi">
              <span>Confiabilidad</span>
              <strong>{pct(kpi.reliability)}</strong>
              <small>
                {band
                  ? `Banda ${band.rangeLabel} · deducción ${band.deductionPct}%`
                  : "N/D"}
              </small>
            </div>
            <div className="exec-kpi">
              <span>Generación</span>
              <strong>{snap.totalGenerationKwh.toLocaleString("es-CO")} kWh</strong>
              <small>Meta 4,000,000 kWh</small>
            </div>
            <div className="exec-kpi">
              <span>Fallas asociadas a COPOWER</span>
              <strong>{snap.summary.copowerFailures}</strong>
              <small>
                MTBF {snap.summary.mtbfHours ?? "N/D"} h · MTTR {snap.summary.mttrHours ?? "N/D"} h
              </small>
            </div>
          </div>
        </article>
      </section>

      <section className="panel two-col">
        <article className="card">
          <h3>2 · Top desviaciones</h3>
          {deviations.length === 0 ? (
            <p className="empty-state">Sin desviaciones bajo meta en Disp/Conf para este mes.</p>
          ) : (
            <ul className="meeting-list">
              {deviations.map((d) => (
                <li key={d.name}>
                  <strong>{d.name}</strong>: {typeof d.value === "number" && d.value < 2 ? pct(d.value) : d.value}{" "}
                  {d.gap != null ? `(${d.gap.toFixed(2)} pp vs 98%)` : ""}
                </li>
              ))}
            </ul>
          )}
        </article>
        <article className="card">
          <h3>3 · Principal activo crítico</h3>
          {!badActor ? (
            <p className="empty-state">Sin unidades con fallas asociadas a COPOWER en el mes.</p>
          ) : (
            <p>
              <strong>{badActor.unidad}</strong> · {badActor.fallas} falla(s) · MTBF {badActor.mtbfLabel}
              {badActor.mttrHours != null ? ` · MTTR ${badActor.mttrHours} h` : ""}
            </p>
          )}
        </article>
      </section>

      <section className="panel two-col">
        <article className="card">
          <h3>4 · RCA pendientes</h3>
          {rcaPending == null ? (
            <p className="empty-state">Sin registros — pendiente de carga (tracker RCA no disponible este mes).</p>
          ) : (
            <p className="alert-inline">
              0/{rcaPending} RCA entregados — expuesto a multa adicional 4% (Orden 1) si se confirma la ausencia.
            </p>
          )}
        </article>
        <article className="card">
          <h3>5 · Riesgos abiertos (matriz propuesta)</h3>
          {riskOpen.length === 0 ? (
            <p className="empty-state">Ninguna unidad en Riesgo Medio/Alto según matriz propuesta.</p>
          ) : (
            <ul className="meeting-list">
              {riskOpen.map((r) => (
                <li key={r.unidad}>
                  {r.unidad}: {r.assessed.riesgo.replace("RIESGO ", "")}
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <h3>6 · Acciones vencidas / plan de acción</h3>
          {actionsOverdue == null ? (
            <p className="empty-state">
              Sin registros — pendiente de carga. El plan de acción inicia vacío (0 acciones registradas en fuentes).
            </p>
          ) : (
            <p>{actionsOverdue} acción(es) vencida(s).</p>
          )}
        </article>
      </section>

      <aside className="exec-source-note">
        <p>
          <strong>Fuente:</strong> módulos del tablero (GTE PDF/Excel del mes). No se redactan comentarios
          adicionales.
        </p>
      </aside>
    </div>
  );
}
