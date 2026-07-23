import { MetricLabel, METRIC_DEFS } from "../ui/metricDefs";
import {
  CONTRACT_CALC_BASE,
  CONTRACT_FRAMEWORK_CONCLUSION,
  CONTRACT_ORDERS_OVERVIEW,
  CONTRACTUAL_KPI_TARGETS,
  getReliabilityDeduction,
  RELIABILITY_DEDUCTION_BANDS,
  SHUTDOWN_PENALTY_BANDS,
} from "../contracts/gteOrders";
import { EXEC_JUN } from "./executiveJune2026";
import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";

export type MarcoLeaf = "sec-1-1" | "sec-1-2" | "sec-1-3" | "sec-1-4";

export const MARCO_LEAF_META: Record<MarcoLeaf, { title: string; description: string }> = {
  "sec-1-1": {
    title: "Órdenes vigentes",
    description: "Orden 1, Orden 2 y Orden 3 — alcance y aplicabilidad a confiabilidad",
  },
  "sec-1-2": {
    title: "Cumplimiento de metas contractuales",
    description: "Estado del contrato vs Orden 1 · semáforo ejecutivo, acciones y conclusión",
  },
  "sec-1-3": {
    title: "Esquema de multas y bandas",
    description: "Deducciones por confiabilidad y escala de shutdowns O&M",
  },
  "sec-1-4": {
    title: "Validación de vigencia",
    description: "Plazos y estado de vigencia de cada orden (ej. Orden 3 vence abr-2026)",
  },
};

/** Referencias internas de mantenibilidad (seguimiento; no umbral Orden 1 formal). */
const INTERNAL_MAINT_TARGETS = {
  mtbfHoursMin: 700,
  mttrHoursMax: 3,
} as const;

type ExecTone = "ok" | "gap" | "pending" | "na";

type ExecIndicatorRow = {
  indicator: string;
  tone: ExecTone;
  statusLabel: string;
  result: string;
  meta: string;
  observation: string;
};

type Props = {
  leaf: MarcoLeaf;
  report: "gran_tierra" | "copower";
  month: string;
  monthLabel: string;
};

const pct = (v: number | null | undefined, d = 1) =>
  v == null || Number.isNaN(v) ? "N/A" : `${(v * 100).toFixed(d)}%`;
const pctFixed = (v: number | null | undefined, d = 2) =>
  v == null || Number.isNaN(v) ? "N/A" : `${(v * 100).toFixed(d)} %`;
const hoursLabel = (v: number | null | undefined, d = 2) =>
  v == null || Number.isNaN(v) ? "N/A" : `${v.toFixed(d)} h`;

function getSnap(report: "gran_tierra" | "copower", month: string) {
  if (report === "gran_tierra") return GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  return COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ?? null;
}

function SourceBar({ report, sourceFile }: { report: "gran_tierra" | "copower"; sourceFile: string }) {
  return (
    <p className="source-context">
      Fuente activa:{" "}
      <strong>{report === "gran_tierra" ? "Gran Tierra Energy" : "COPOWER · operación diaria"}</strong>
      {" · "}
      {sourceFile}
    </p>
  );
}

function CopowerContractNote() {
  return (
    <p className="muted">
      El marco contractual formal (órdenes, multas y vigencia documental) vive en Gran Tierra. Con fuente
      COPOWER se muestran KPIs operativos del periodo como referencia frente a las metas Orden 1.
    </p>
  );
}

function toneClass(tone: ExecTone) {
  if (tone === "ok") return "contract-tone--ok";
  if (tone === "gap") return "contract-tone--gap";
  if (tone === "pending") return "contract-tone--pending";
  return "contract-tone--na";
}

function statusBadge(tone: ExecTone, label: string) {
  const badge =
    tone === "ok" ? "success" : tone === "gap" ? "warning" : tone === "pending" ? "warning" : "info";
  return <span className={`badge ${badge} contract-status-badge`}>{label}</span>;
}

export function MarcoContractual({ leaf, report, month, monthLabel }: Props) {
  const isGte = report === "gran_tierra";
  const snap = getSnap(report, month);
  const availability = snap?.kpi.availability ?? null;
  const reliability = snap?.kpi.reliability ?? null;
  const mtbf = snap?.summary.mtbfHours ?? null;
  const mttr = snap?.summary.mttrHours ?? null;
  const failures = snap?.summary.copowerFailures ?? 0;
  const band = reliability == null ? null : getReliabilityDeduction(reliability);
  const sourceFile = snap?.sourceFile ?? (isGte ? "data/GTE" : "Reporte diario COPOWER");

  const rcaRequired = month === "Jun" && isGte ? EXEC_JUN.rcaRequired : null;
  const rcaDelivered = month === "Jun" && isGte ? EXEC_JUN.rcaDelivered : null;
  const contractualEvents = month === "Jun" && isGte ? EXEC_JUN.failures : failures;

  const metaAvail = CONTRACTUAL_KPI_TARGETS.availability;
  const metaConf = CONTRACTUAL_KPI_TARGETS.reliability;

  const execRows: ExecIndicatorRow[] = [
    (() => {
      if (availability == null) {
        return {
          indicator: "Disponibilidad",
          tone: "na" as const,
          statusLabel: "Sin dato",
          result: "N/A",
          meta: "98.00 %",
          observation: "Sin disponibilidad sistémica cargada para el periodo.",
        };
      }
      const gapPp = (availability - metaAvail) * 100;
      const ok = availability >= metaAvail;
      return {
        indicator: "Disponibilidad",
        tone: ok ? ("ok" as const) : ("gap" as const),
        statusLabel: ok ? "En objetivo" : "Por debajo de la meta",
        result: pctFixed(availability, 2),
        meta: "98.00 %",
        observation: ok
          ? "Cumple umbral contractual Orden 1 (≥98%)."
          : `Brecha de ${Math.abs(gapPp).toFixed(2)} pp.`,
      };
    })(),
    (() => {
      if (reliability == null) {
        return {
          indicator: "Confiabilidad",
          tone: "na" as const,
          statusLabel: "Sin dato",
          result: "N/A",
          meta: "98.00 %",
          observation: "Sin confiabilidad sistémica cargada para el periodo.",
        };
      }
      const ok = reliability >= metaConf;
      return {
        indicator: "Confiabilidad",
        tone: ok ? ("ok" as const) : ("gap" as const),
        statusLabel: ok ? "En objetivo" : "Por debajo de la meta",
        result: pctFixed(reliability, 2),
        meta: "98.00 %",
        observation: ok
          ? "Cumple umbral contractual Orden 1 (≥98%)."
          : `Riesgo de deducción contractual${
              band && band.deductionPct > 0 ? ` estimada ${band.deductionPct}%` : ""
            } (sujeta a validación).`,
      };
    })(),
    (() => {
      if (mtbf == null) {
        return {
          indicator: "MTBF",
          tone: "na" as const,
          statusLabel: "Sin dato",
          result: "N/A",
          meta: `≥ ${INTERNAL_MAINT_TARGETS.mtbfHoursMin} h`,
          observation: `${METRIC_DEFS.MTBF.es}. Referencia interna de seguimiento.`,
        };
      }
      const ok = mtbf >= INTERNAL_MAINT_TARGETS.mtbfHoursMin;
      return {
        indicator: "MTBF",
        tone: ok ? ("ok" as const) : ("gap" as const),
        statusLabel: ok ? "En objetivo" : "Por debajo de la referencia",
        result: hoursLabel(mtbf),
        meta: `≥ ${INTERNAL_MAINT_TARGETS.mtbfHoursMin} h`,
        observation: ok
          ? "Dentro de la referencia interna."
          : `Por debajo de la referencia interna (≥ ${INTERNAL_MAINT_TARGETS.mtbfHoursMin} h).`,
      };
    })(),
    (() => {
      if (mttr == null) {
        return {
          indicator: "MTTR",
          tone: "na" as const,
          statusLabel: "Sin dato",
          result: "N/A",
          meta: `≤ ${INTERNAL_MAINT_TARGETS.mttrHoursMax.toFixed(1)} h`,
          observation: `${METRIC_DEFS.MTTR.es}. Referencia interna de seguimiento.`,
        };
      }
      const ok = mttr <= INTERNAL_MAINT_TARGETS.mttrHoursMax;
      return {
        indicator: "MTTR",
        tone: ok ? ("ok" as const) : ("gap" as const),
        statusLabel: ok ? "En objetivo" : "Por encima de la referencia",
        result: hoursLabel(mttr),
        meta: `≤ ${INTERNAL_MAINT_TARGETS.mttrHoursMax.toFixed(1)} h`,
        observation: ok
          ? "Recuperación eficiente de equipos."
          : `Por encima de la referencia interna (≤ ${INTERNAL_MAINT_TARGETS.mttrHoursMax.toFixed(1)} h).`,
      };
    })(),
    (() => {
      if (rcaRequired == null || rcaDelivered == null) {
        return {
          indicator: "RCA entregados",
          tone: "na" as const,
          statusLabel: "Sin dato",
          result: "N/A",
          meta: "100 %",
          observation: "Sin tracker formal de entrega RCA para este periodo.",
        };
      }
      const pending = rcaDelivered < rcaRequired;
      return {
        indicator: "RCA entregados",
        tone: pending ? ("pending" as const) : ("ok" as const),
        statusLabel: pending ? "Pendiente" : "En objetivo",
        result: `${rcaDelivered} de ${rcaRequired}`,
        meta: "100 %",
        observation: pending
          ? `${rcaDelivered} de ${rcaRequired} entregados · en proceso de elaboración y entrega.`
          : "Paquete RCA del periodo entregado.",
      };
    })(),
  ];

  const countOk = execRows.filter((r) => r.tone === "ok").length;
  const countGap = execRows.filter((r) => r.tone === "gap").length;
  const countPending = execRows.filter((r) => r.tone === "pending").length;
  const countNa = execRows.filter((r) => r.tone === "na").length;
  const totalTracked = execRows.length - countNa;
  const denom = totalTracked > 0 ? totalTracked : execRows.length;

  const potentialDeduction =
    band && band.deductionPct > 0
      ? `${band.deductionPct} % (sujeta a validación contractual)`
      : reliability != null && reliability >= metaConf
        ? "0 %"
        : "N/A";

  const improvementActions = [
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
      status:
        countPending > 0 || (rcaDelivered != null && rcaRequired != null && rcaDelivered < rcaRequired)
          ? "En proceso"
          : "Implementado",
      impact: "Cumplimiento documental",
    },
    {
      action: "Seguimiento semanal de indicadores",
      status: "Implementado",
      impact: "Detección temprana de desviaciones",
    },
  ];

  const conclusionParts: string[] = [];
  if (execRows.some((r) => (r.indicator === "MTBF" || r.indicator === "MTTR") && r.tone === "ok")) {
    conclusionParts.push(
      "El desempeño operativo del periodo muestra estabilidad en los indicadores de mantenibilidad (MTBF y MTTR).",
    );
  }
  if (countGap > 0) {
    const gapNames = execRows.filter((r) => r.tone === "gap").map((r) => r.indicator.toLowerCase());
    const gapText =
      gapNames.length === 1
        ? gapNames[0]
        : gapNames.length === 2
          ? `${gapNames[0]} y ${gapNames[1]}`
          : `${gapNames.slice(0, -1).join(", ")} y ${gapNames[gapNames.length - 1]}`;
    conclusionParts.push(
      `La principal oportunidad de mejora se concentra en el cumplimiento de las metas contractuales de ${gapText}.`,
    );
  }
  if (countPending > 0) {
    conclusionParts.push(
      "Asimismo, requiere atención el cierre oportuno de los análisis de causa raíz (RCA).",
    );
  }
  if (conclusionParts.length === 0) {
    conclusionParts.push(
      "El periodo no presenta desviaciones materiales frente a las metas y referencias evaluadas; se mantiene el seguimiento rutinario.",
    );
  }
  const executiveConclusion = conclusionParts.join(" ");

  return (
    <div className="marco-screen">
      <SourceBar report={report} sourceFile={sourceFile} />
      {!snap ? <p className="empty-state">Sin registros para {monthLabel} en esta fuente.</p> : null}

      {leaf === "sec-1-1" && (
        <section className="panel">
          <article className="card">
            {!isGte ? <CopowerContractNote /> : null}
            {isGte ? (
              <>
                <div className="contract-order-head">
                  <div>
                    <p className="eyebrow">Marco documental GTE</p>
                    <h3>Órdenes de servicio identificadas</h3>
                  </div>
                </div>
                <div className="table-scroll">
                  <table className="contract-matrix">
                    <thead>
                      <tr>
                        <th>Orden</th>
                        <th>Objeto</th>
                        <th>Plazo</th>
                        <th>Valor estimado</th>
                        <th>¿Aplica a confiabilidad Costayaco/Vonú?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CONTRACT_ORDERS_OVERVIEW.map((row) => (
                        <tr key={row.order} className={row.tone === "ok" ? "row-sistema" : undefined}>
                          <td>
                            <strong>
                              {row.order} ({row.sourceFile})
                            </strong>
                          </td>
                          <td>{row.object}</td>
                          <td>{row.term}</td>
                          <td>{row.estimatedValue}</td>
                          <td>
                            <span
                              className={`badge ${
                                row.tone === "ok" ? "success" : row.tone === "warn" ? "warning" : "info"
                              }`}
                            >
                              {row.tone === "ok" ? "Sí" : "No"}
                            </span>
                            <span className="contract-overview-detail">{row.appliesToReliability}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="contract-conclusion">{CONTRACT_FRAMEWORK_CONCLUSION}</p>
              </>
            ) : (
              <p className="empty-state">
                Sin órdenes contractuales en el reporte diario COPOWER. Seleccione fuente{" "}
                <strong>Gran Tierra</strong> o <strong>Ambas</strong> para ver Orden 1 / 2 / 3.
              </p>
            )}
          </article>
        </section>
      )}

      {leaf === "sec-1-2" && snap && (
        <>
          <section className="panel">
            <article className="card contract-exec-card">
              <div className="contract-order-head">
                <div>
                  <p className="eyebrow">
                    {isGte ? "Orden 1 · Sistema Costayaco / Vonú" : "Referencia operativa vs metas Orden 1"}
                  </p>
                  <h3>Cumplimiento de metas contractuales</h3>
                  <p className="muted">Periodo: {monthLabel} · Lectura ejecutiva para Gran Tierra</p>
                  {!isGte ? <CopowerContractNote /> : null}
                </div>
              </div>

              <div className="contract-semaforo" aria-label="Semáforo general del contrato">
                <div className={`contract-semaforo-item ${toneClass("ok")}`}>
                  <span className="contract-semaforo-dot" aria-hidden />
                  <div>
                    <strong>En objetivo</strong>
                    <small>
                      {countOk} indicador{countOk === 1 ? "" : "es"}
                    </small>
                  </div>
                </div>
                <div className={`contract-semaforo-item ${toneClass("gap")}`}>
                  <span className="contract-semaforo-dot" aria-hidden />
                  <div>
                    <strong>Con oportunidad de mejora</strong>
                    <small>
                      {countGap} indicador{countGap === 1 ? "" : "es"}
                    </small>
                  </div>
                </div>
                <div className={`contract-semaforo-item ${toneClass("pending")}`}>
                  <span className="contract-semaforo-dot" aria-hidden />
                  <div>
                    <strong>Pendiente documental</strong>
                    <small>
                      {countPending} indicador{countPending === 1 ? "" : "es"}
                    </small>
                  </div>
                </div>
              </div>

              <div className="table-scroll" style={{ marginTop: "0.85rem" }}>
                <table className="contract-matrix contract-exec-table">
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
                    {execRows.map((row) => (
                      <tr key={row.indicator} className={toneClass(row.tone)}>
                        <td>
                          {row.indicator === "MTBF" || row.indicator === "MTTR" ? (
                            <MetricLabel code={row.indicator} />
                          ) : (
                            <strong>{row.indicator}</strong>
                          )}
                        </td>
                        <td>{statusBadge(row.tone, row.statusLabel)}</td>
                        <td className="contract-result-cell">{row.result}</td>
                        <td>{row.meta}</td>
                        <td className="contract-watch">{row.observation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <section className="panel">
            <article className="card">
              <div className="contract-order-head">
                <div>
                  <p className="eyebrow">Resumen del periodo</p>
                  <h3>Estado general del contrato</h3>
                </div>
              </div>
              <ul className="contract-exec-summary">
                <li>
                  <strong>Indicadores en objetivo:</strong> {countOk}/{denom}
                </li>
                <li>
                  <strong>Indicadores con brecha respecto a la meta:</strong> {countGap}/{denom}
                </li>
                <li>
                  <strong>Indicadores pendientes de cierre documental:</strong> {countPending}/{denom}
                </li>
                <li>
                  <strong>Eventos registrados:</strong> {contractualEvents}
                </li>
                <li>
                  <strong>RCA pendientes:</strong>{" "}
                  {rcaRequired != null && rcaDelivered != null
                    ? Math.max(0, rcaRequired - rcaDelivered)
                    : "N/A"}
                </li>
                <li>
                  <strong>Deducción potencial identificada:</strong> {potentialDeduction}
                </li>
              </ul>
            </article>
          </section>

          <section className="panel">
            <article className="card">
              <div className="contract-order-head">
                <div>
                  <p className="eyebrow">Gestión activa</p>
                  <h3>Acciones de mejora en ejecución</h3>
                  <p className="muted">
                    No solo se reportan indicadores: hay seguimiento para cerrar brechas y obligaciones
                    documentales.
                  </p>
                </div>
              </div>
              <div className="table-scroll">
                <table className="contract-matrix">
                  <thead>
                    <tr>
                      <th>Acción</th>
                      <th>Estado</th>
                      <th>Impacto esperado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {improvementActions.map((a) => (
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
            <article className="card contract-exec-close">
              <p className="eyebrow">Conclusión</p>
              <p className="contract-exec-conclusion">{executiveConclusion}</p>
            </article>
          </section>

          {isGte ? (
            <section className="panel">
              <article className="card">
                <div className="contract-order-head">
                  <div>
                    <p className="eyebrow">Anexo · Orden 1</p>
                    <h3>Indicadores y metas contractuales (base normativa)</h3>
                  </div>
                  <span className="badge info">{CONTRACT_CALC_BASE.length} indicadores</span>
                </div>
                <div className="table-scroll">
                  <table className="contract-matrix">
                    <thead>
                      <tr>
                        <th>Indicador</th>
                        <th>Fórmula</th>
                        <th>Frecuencia</th>
                        <th>Meta</th>
                        <th>Multa si incumple</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CONTRACT_CALC_BASE.map((row) => (
                        <tr key={row.indicator}>
                          <td>
                            <strong>{row.indicator}</strong>
                          </td>
                          <td>{row.formula}</td>
                          <td>{row.frequency}</td>
                          <td>{row.threshold}</td>
                          <td className="contract-watch">{row.consequence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          ) : null}
        </>
      )}

      {leaf === "sec-1-3" && (
        <section className="panel two-col">
          <article className="card">
            <h3>Bandas de deducción por Confiabilidad (Orden 1)</h3>
            {!isGte ? <CopowerContractNote /> : null}
            <p className="muted">
              Mes seleccionado ({monthLabel}): {pct(reliability, 2)}
              {band
                ? ` → banda ${band.rangeLabel} (${
                    band.terminationRisk ? "terminación anticipada" : `${band.deductionPct}%`
                  })`
                : " → N/A"}
              {!isGte ? " · referencia con KPI operativo COPOWER" : ""}
            </p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Confiabilidad mensual</th>
                    <th>Deducción</th>
                    <th>Mes actual</th>
                  </tr>
                </thead>
                <tbody>
                  {RELIABILITY_DEDUCTION_BANDS.map((b) => {
                    const active =
                      reliability != null && reliability >= b.minInclusive && reliability < b.maxExclusive;
                    return (
                      <tr key={b.rangeLabel} className={active ? "row-highlight" : undefined}>
                        <td>{b.rangeLabel}</td>
                        <td>{b.terminationRisk ? "Terminación anticipada" : `${b.deductionPct}%`}</td>
                        <td>
                          {active ? (
                            <span className={`badge ${b.deductionPct === 0 ? "success" : "danger"}`}>
                              ✓ Aplica
                              {b.deductionPct > 0 && !b.terminationRisk ? ` (${pct(reliability, 2)})` : ""}
                            </span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <article className="card">
            <h3>Escala de shutdowns O&amp;M (Orden 1)</h3>
            <p className="muted">
              Ideal: 0. Fallas asociadas a COPOWER del mes ({isGte ? "GTE" : "COPOWER"}): {failures}. Pendiente confirmar
              equivalencia con “shutdowns de campo”
              {failures >= 5 ? " — de ser así, superarían el umbral de terminación." : "."}
            </p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Shutdowns / mes</th>
                    <th>Deducción</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {SHUTDOWN_PENALTY_BANDS.map((b) => (
                    <tr key={b.events}>
                      <td>{b.events >= 5 ? "≥ 5" : b.events}</td>
                      <td>{b.terminationRisk ? "Terminación anticipada" : `${b.deductionPct}%`}</td>
                      <td className="muted">
                        {b.events >= 5 && failures >= 5
                          ? `${failures} asociadas a COPOWER este mes — validar equivalencia`
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}

      {leaf === "sec-1-4" && (
        <section className="panel">
          <article className="card">
            <h3>Vigencia por orden</h3>
            {!isGte ? (
              <>
                <CopowerContractNote />
                <p className="empty-state">
                  La validación de vigencia documental (actas, plazos, Orden 3 vence abr-2026) está en fuente
                  Gran Tierra. Cambie el selector a <strong>Gran Tierra</strong> o <strong>Ambas</strong>.
                </p>
              </>
            ) : (
              <>
                <p className="muted">Fuente: contratos / órdenes en data/contratos · validación vs fecha del informe.</p>
                <div className="table-scroll">
                  <table className="contract-matrix">
                    <thead>
                      <tr>
                        <th>Orden</th>
                        <th>Plazo / vigencia</th>
                        <th>Estado</th>
                        <th>Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CONTRACT_ORDERS_OVERVIEW.map((row) => {
                        const expired = /vence|venció|vencido/i.test(row.term);
                        const warn = row.tone === "warn" || expired;
                        return (
                          <tr key={`vig-${row.order}`} className={row.tone === "ok" ? "row-sistema" : undefined}>
                            <td>
                              <strong>
                                {row.order} ({row.sourceFile})
                              </strong>
                            </td>
                            <td>{row.term}</td>
                            <td>
                              <span className={`badge ${warn ? "warning" : row.tone === "ok" ? "success" : "info"}`}>
                                {expired
                                  ? "Revisar vigencia"
                                  : row.tone === "ok"
                                    ? "Vigente (aplica)"
                                    : "No aplica al tablero"}
                              </span>
                            </td>
                            <td className="muted">{row.appliesToReliability}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="contract-conclusion">
                  Orden 3: plazo “6 meses desde oct-2025 (vence abr-2026)” — confirmar prórroga con Gran Tierra antes
                  de usarla fuera de su alcance.
                </p>
              </>
            )}
          </article>
        </section>
      )}
    </div>
  );
}
