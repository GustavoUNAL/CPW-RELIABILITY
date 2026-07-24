import {
  FileDown,
  FileText,
  ArrowRight,
} from "lucide-react";
import { buildGteCapaActions, capaPortfolioKpis } from "./buildCapaActions";
import { buildGteJuneRcaCases } from "./gteJuneRcaCases";
import { buildGteJuneInterventionPlans } from "./gteJuneInterventionPlans";
import { buildGteJuneMaintenanceOptimization, portfolioKpis } from "./gteJuneMaintenanceOptimization";
import { buildGteDegradationRiskPortfolio } from "./buildDegradationRiskPortfolio";
import { portfolioSummary } from "./degradationRiskEngine";
import { buildOperationalPlanForPeriod, planKpis } from "./buildOperationalPlan";
import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import { EXEC_JUN } from "./executiveJune2026";

type Props = {
  month: string;
  monthLabel: string;
  section?: string;
};

const SECTIONS = [
  { id: "rep-inf-resumen", n: 1, title: "Resumen ejecutivo" },
  { id: "rep-inf-desempeno", n: 2, title: "Desempeño operacional" },
  { id: "rep-inf-kpis", n: 3, title: "KPIs de confiabilidad" },
  { id: "rep-inf-eventos", n: 4, title: "Eventos de falla" },
  { id: "rep-inf-pareto", n: 5, title: "Pareto" },
  { id: "rep-inf-worst", n: 6, title: "Worst Actors" },
  { id: "rep-inf-rca", n: 7, title: "RCA" },
  { id: "rep-inf-interv", n: 8, title: "Planes de intervención" },
  { id: "rep-inf-mso", n: 9, title: "Optimización del mantenimiento" },
  { id: "rep-inf-riesgos", n: 10, title: "Tendencias y riesgos" },
  { id: "rep-inf-capa", n: 11, title: "Acciones CAPA" },
  { id: "rep-inf-plan", n: 12, title: "Planeación operacional" },
  { id: "rep-inf-conclusiones", n: 13, title: "Conclusiones" },
  { id: "rep-inf-export", n: 14, title: "Exportar PDF / PowerPoint" },
] as const;

function pct(v: number | null | undefined) {
  if (v == null) return "N/D";
  return `${(v * 100).toFixed(2)}%`;
}

export function MonthlyReportDashboard({ month, monthLabel, section }: Props) {
  const gte = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  const cpw = COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ?? null;
  const rca = month === "Jun" ? buildGteJuneRcaCases() : [];
  const plans = month === "Jun" ? buildGteJuneInterventionPlans() : [];
  const mso = month === "Jun" ? buildGteJuneMaintenanceOptimization() : [];
  const msoKpi = portfolioKpis(mso);
  const deg = month === "Jun" ? buildGteDegradationRiskPortfolio() : [];
  const degKpi = portfolioSummary(deg);
  const capa = month === "Jun" || month === "Jul" ? buildGteCapaActions() : [];
  const capaKpi = capaPortfolioKpis(capa);
  const planPack = buildOperationalPlanForPeriod(
    month === "Jul" ? "2026-07" : month === "Ago" ? "2026-08" : "2026-07",
  );
  const planK = planKpis(planPack);

  const active = section && SECTIONS.some((s) => s.id === section) ? section : "rep-inf-resumen";

  const failures = gte?.summary.copowerFailures ?? cpw?.summary.copowerFailures ?? 0;
  const events = gte?.eventLog.length ?? 0;

  return (
    <div className="panel">
      <article className="card op-card">
        <p className="eyebrow">Reportes · Informe mensual automático</p>
        <div className="screen-shell-head">
          <h3>Informe mensual · {monthLabel}</h3>
          <span className="source-badge dual">GTE + CPW</span>
        </div>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          Estructura lista para reunión con Gran Tierra. Cada sección se alimenta de los módulos de la plataforma.
        </p>

        <nav className="rep-toc">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={active === s.id ? "active" : undefined}
            >
              <span>{s.n}</span>
              {s.title}
            </a>
          ))}
        </nav>

        <section id="rep-inf-resumen" className="op-panel">
          <div className="op-panel-head">
            <h4>1. Resumen ejecutivo</h4>
          </div>
          <p className="op-summary">
            En {monthLabel} el parque operó con disponibilidad GTE{" "}
            <strong>{pct(gte?.kpi.availability)}</strong> y confiabilidad{" "}
            <strong>{pct(gte?.kpi.reliability)}</strong>. Se registraron{" "}
            <strong>{failures}</strong> fallas contractuales COPOWER y{" "}
            <strong>{events}</strong> eventos en bitácora GTE. El plan operacional del próximo
            período proyecta disponibilidad {planPack.plan.projectedAvailability}% con nivel de
            riesgo <strong>{planK.overallRisk}</strong>.
          </p>
        </section>

        <section id="rep-inf-desempeno" className="op-panel">
          <div className="op-panel-head">
            <h4>2. Desempeño operacional</h4>
            <span className="muted">Fuente: Generación / Operación</span>
          </div>
          <div className="op-summary-metrics">
            <div>
              <span>Energía gas (GTE)</span>
              <strong>
                {gte ? `${(gte.summary.energyGasKwh / 1000).toFixed(0)} MWh` : "N/D"}
              </strong>
            </div>
            <div>
              <span>Horas operación</span>
              <strong>{gte?.summary.hoursOperated ?? "N/D"}</strong>
            </div>
            <div>
              <span>Horas PP</span>
              <strong>{gte?.summary.hoursPreventive ?? "N/D"}</strong>
            </div>
            <div>
              <span>PF_contr</span>
              <strong>{gte?.summary.hoursFailureCopower ?? "N/D"} h</strong>
            </div>
          </div>
        </section>

        <section id="rep-inf-kpis" className="op-panel">
          <div className="op-panel-head">
            <h4>3. KPIs de confiabilidad</h4>
            <span className="muted">Meta contractual ≥98%</span>
          </div>
          <div className="op-summary-metrics">
            <div>
              <span>Disponibilidad GTE</span>
              <strong>{pct(gte?.kpi.availability)}</strong>
            </div>
            <div>
              <span>Confiabilidad GTE</span>
              <strong>{pct(gte?.kpi.reliability)}</strong>
            </div>
            <div>
              <span>MTBF</span>
              <strong>{gte?.summary.mtbfHours ?? "N/D"} h</strong>
            </div>
            <div>
              <span>MTTR</span>
              <strong>{gte?.summary.mttrHours ?? "N/D"} h</strong>
            </div>
          </div>
        </section>

        <section id="rep-inf-eventos" className="op-panel">
          <div className="op-panel-head">
            <h4>4. Eventos de falla</h4>
          </div>
          <p className="muted">
            {failures} fallas contractuales · {events} eventos en bitácora del mes. Detalle en
            Eventos de falla / Bitácoras.
          </p>
        </section>

        <section id="rep-inf-pareto" className="op-panel">
          <div className="op-panel-head">
            <h4>5. Pareto</h4>
          </div>
          <p className="muted">
            Clasificación y concentración de fallas disponibles en Confiabilidad → Pareto (vista dual).
          </p>
        </section>

        <section id="rep-inf-worst" className="op-panel">
          <div className="op-panel-head">
            <h4>6. Worst Actors</h4>
          </div>
          <p className="muted">
            Ranking IIO por fuente en Confiabilidad → Worst Actors (COPOWER / Gran Tierra).
          </p>
        </section>

        <section id="rep-inf-rca" className="op-panel">
          <div className="op-panel-head">
            <h4>7. RCA</h4>
            <span className="muted">{rca.length} análisis</span>
          </div>
          {rca.length === 0 ? (
            <p className="muted">RCA disponibles para junio 2026.</p>
          ) : (
            <div className="table-wrap op-table">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Evento</th>
                    <th>Equipo</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rca.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.eventLabel}</td>
                      <td>{r.equipment}</td>
                      <td>{r.priority}</td>
                      <td>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="rep-inf-interv" className="op-panel">
          <div className="op-panel-head">
            <h4>8. Planes de intervención</h4>
            <span className="muted">{plans.length} planes</span>
          </div>
          {plans.length === 0 ? (
            <p className="muted">Planes GTE disponibles para junio 2026.</p>
          ) : (
            <div className="table-wrap op-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Plan</th>
                    <th>Activos</th>
                    <th>Estado</th>
                    <th>Efectividad</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td className="detalle-cell">{p.title}</td>
                      <td>{p.assetName}</td>
                      <td>{p.status}</td>
                      <td>{p.effectivenessPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="rep-inf-mso" className="op-panel">
          <div className="op-panel-head">
            <h4>9. Optimización del mantenimiento</h4>
          </div>
          <div className="op-summary-metrics">
            <div>
              <span>Planes evaluados</span>
              <strong>{msoKpi.plansEvaluated}</strong>
            </div>
            <div>
              <span>Optimizados</span>
              <strong>{msoKpi.plansOptimized}</strong>
            </div>
            <div>
              <span>Ahorro estimado</span>
              <strong>−{msoKpi.estimatedSavingsPct}%</strong>
            </div>
            <div>
              <span>↓ Fallas esperada</span>
              <strong>−{msoKpi.expectedFailureReduction}%</strong>
            </div>
          </div>
        </section>

        <section id="rep-inf-riesgos" className="op-panel">
          <div className="op-panel-head">
            <h4>10. Tendencias y riesgos</h4>
          </div>
          <div className="op-summary-metrics">
            <div>
              <span>Activos monitoreados</span>
              <strong>{degKpi.monitored}</strong>
            </div>
            <div>
              <span>En degradación</span>
              <strong>{degKpi.degrading}</strong>
            </div>
            <div>
              <span>Riesgo crítico</span>
              <strong>{degKpi.criticalRisk}</strong>
            </div>
            <div>
              <span>Salud promedio</span>
              <strong>{degKpi.avgHealth}</strong>
            </div>
          </div>
        </section>

        <section id="rep-inf-capa" className="op-panel">
          <div className="op-panel-head">
            <h4>11. Acciones CAPA</h4>
          </div>
          <div className="op-summary-metrics">
            <div>
              <span>Totales</span>
              <strong>{capaKpi.total}</strong>
            </div>
            <div>
              <span>Cerradas</span>
              <strong>{capaKpi.closed}</strong>
            </div>
            <div>
              <span>Cumplimiento</span>
              <strong>{capaKpi.compliance}%</strong>
            </div>
            <div>
              <span>Efectividad</span>
              <strong>{capaKpi.effectivenessPct}%</strong>
            </div>
          </div>
        </section>

        <section id="rep-inf-plan" className="op-panel">
          <div className="op-panel-head">
            <h4>12. Planeación operacional</h4>
            <span className="muted">{planPack.reportTitle}</span>
          </div>
          <p className="op-summary">{planPack.plan.summary}</p>
          <div className="op-summary-metrics">
            <div>
              <span>Nivel de riesgo</span>
              <strong>{planK.overallRisk}</strong>
            </div>
            <div>
              <span>Prioridades</span>
              <strong>{planK.priorities}</strong>
            </div>
            <div>
              <span>Alertas activas</span>
              <strong>{planK.alertsActive}</strong>
            </div>
            <div>
              <span>Disp. proyectada</span>
              <strong>{planPack.plan.projectedAvailability}%</strong>
            </div>
          </div>
        </section>

        <section id="rep-inf-conclusiones" className="op-panel">
          <div className="op-panel-head">
            <h4>13. Conclusiones</h4>
          </div>
          <div className="rep-conclusions">
            {month === "Jun" ? (
              <>
                <p>
                  El desempeño de junio permitió identificar oportunidades concretas de mejora en
                  confiabilidad y mantenimiento. La disponibilidad y confiabilidad del sistema
                  Costayaco/Vonú cerraron en {(EXEC_JUN.availability * 100).toFixed(2)}%, con
                  recuperación frente a mayo (MTBF {EXEC_JUN.mtbfHours.toFixed(2)} h · MTTR{" "}
                  {EXEC_JUN.mttrHours.toFixed(2)} h), aunque aún por debajo de la meta contractual del
                  98%. Se requiere mantener el seguimiento de los eventos críticos, asegurar el
                  cierre efectivo de las acciones y gestionar oportunamente los recursos o
                  decisiones necesarios para reducir riesgos operacionales.
                </p>
                <p>
                  El foco operativo debe concentrarse en {EXEC_JUN.focalUnit} ({EXEC_JUN.focalUnitFailures}{" "}
                  fallas en el periodo) y en el evento de Vector Shift / Shutdown Costayaco del
                  22-jun, con RCA Sec. 30 ya entregado. Es prioritario validar la efectividad de las
                  acciones derivadas, completar el cierre documental de las fallas imputables y
                  sostener el plan de intervención vinculado para evitar reincidencias.
                </p>
                <p>
                  Para el próximo periodo se recomienda ejecutar las oportunidades de optimización
                  de mantenimiento en activos de mayor impacto (
                  {planPack.criticalAssets
                    .slice(0, 3)
                    .map((a) => a.assetId)
                    .join(", ") || "N/D"}
                  ), cerrar CAPA vencidas o críticas, y mantener vigilancia sobre estabilidad
                  eléctrica, MRU/gas y disponibilidad proyectada ≥98%, con seguimiento oportuno de
                  alertas y riesgos del parque.
                </p>
              </>
            ) : (
              <>
                <p>
                  El desempeño de {monthLabel} permitió identificar oportunidades concretas de
                  mejora en confiabilidad y mantenimiento. Se requiere mantener el seguimiento de
                  los eventos críticos, asegurar el cierre efectivo de las acciones y gestionar
                  oportunamente los recursos o decisiones necesarios para reducir riesgos
                  operacionales.
                </p>
                <p>
                  Priorizar activos de mayor impacto (
                  {planPack.criticalAssets
                    .slice(0, 3)
                    .map((a) => a.assetId)
                    .join(", ") || "N/D"}
                  ), cerrar CAPA vencidas o críticas y ejecutar el plan del próximo periodo con
                  enfoque en disponibilidad ≥98%, manteniendo seguimiento de MRU/gas y estabilidad
                  eléctrica del parque.
                </p>
              </>
            )}
          </div>
        </section>

        <section id="rep-inf-export" className="op-panel">
          <div className="op-panel-head">
            <h4>14. Exportar</h4>
          </div>
          <p className="muted">
            Exportación PDF / PowerPoint pendiente de pipeline de generación documental. Use esta
            vista como master del informe y exporte desde el navegador (imprimir → PDF) mientras se
            habilita la descarga nativa.
          </p>
          <div className="rep-export-actions">
            <button type="button" className="open-popup-btn" onClick={() => window.print()}>
              <FileDown size={15} /> Exportar PDF (impresión)
            </button>
            <span className="muted">
              <FileText size={14} /> PowerPoint: próximo sprint
            </span>
          </div>
          <p className="muted" style={{ marginTop: "0.6rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <ArrowRight size={14} /> Flujo completo: Operación → Eventos → KPIs → RCA → CAPA → Planeación → Informe
          </p>
        </section>
      </article>
    </div>
  );
}
