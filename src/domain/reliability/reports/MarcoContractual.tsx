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
import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";

export type MarcoLeaf = "sec-1-1" | "sec-1-2" | "sec-1-3" | "sec-1-4";

export const MARCO_LEAF_META: Record<MarcoLeaf, { title: string; description: string }> = {
  "sec-1-1": {
    title: "Órdenes vigentes",
    description: "Orden 1, Orden 2 y Orden 3 — alcance y aplicabilidad a confiabilidad",
  },
  "sec-1-2": {
    title: "Metas contractuales",
    description: "Scorecard del periodo vs umbrales Orden 1 (Disp/Conf ≥98%, etc.)",
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

type Props = {
  leaf: MarcoLeaf;
  report: "gran_tierra" | "copower";
  month: string;
  monthLabel: string;
};

const pct = (v: number | null | undefined, d = 1) =>
  v == null || Number.isNaN(v) ? "N/A" : `${(v * 100).toFixed(d)}%`;

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

export function MarcoContractual({ leaf, report, month, monthLabel }: Props) {
  const isGte = report === "gran_tierra";
  const snap = getSnap(report, month);
  const availability = snap?.kpi.availability ?? null;
  const reliability = snap?.kpi.reliability ?? null;
  const mtbf = snap?.summary.mtbfHours ?? null;
  const mttr = snap?.summary.mttrHours ?? null;
  const failures = snap?.summary.copowerFailures ?? 0;
  const hasJuneRca = isGte && month === "Jun";
  const band = reliability == null ? null : getReliabilityDeduction(reliability);
  const sourceFile = snap?.sourceFile ?? (isGte ? "data/GTE" : "Reporte diario COPOWER");

  const scorecard = [
    {
      name: "Disponibilidad",
      valueLabel: availability == null ? "N/A" : `${(availability * 100).toFixed(1)}% / meta 98.0%`,
      meets: availability == null ? null : availability >= CONTRACTUAL_KPI_TARGETS.availability,
      detail:
        availability == null
          ? "Sin Disp sistémica este mes"
          : availability >= CONTRACTUAL_KPI_TARGETS.availability
            ? "Cumple umbral ≥98%"
            : `No cumple (brecha ${((CONTRACTUAL_KPI_TARGETS.availability - availability) * 100).toFixed(2)} pp)`,
    },
    {
      name: "Confiabilidad",
      valueLabel: reliability == null ? "N/A" : `${(reliability * 100).toFixed(1)}% / meta 98.0%`,
      meets: reliability == null ? null : reliability >= CONTRACTUAL_KPI_TARGETS.reliability,
      detail:
        reliability == null
          ? "Sin Conf sistémica este mes"
          : reliability >= CONTRACTUAL_KPI_TARGETS.reliability
            ? "Cumple umbral ≥98%"
            : `No cumple → deducción estimada ${band?.deductionPct ?? "N/A"}%`,
    },
    {
      name: "MTBF",
      valueLabel: mtbf == null ? "N/A" : `${mtbf.toFixed(2)} h`,
      meets: null as boolean | null,
      detail: `${METRIC_DEFS.MTBF.es}. Solo seguimiento, sin umbral fijo`,
    },
    {
      name: "MTTR",
      valueLabel: mttr == null ? "N/A" : `${mttr.toFixed(2)} h`,
      meets: null as boolean | null,
      detail: `${METRIC_DEFS.MTTR.es}. Solo seguimiento, sin umbral fijo`,
    },
    {
      name: "Reportes de falla / RCA",
      valueLabel: hasJuneRca
        ? "No entregados (7 eventos)"
        : "N/A — sin tracker formal en carpeta del mes",
      meets: hasJuneRca ? false : null,
      detail: hasJuneRca
        ? "Expuesto a multa del 4% adicional (Orden 1) si se confirma la ausencia"
        : isGte
          ? "Pendiente evidencia de entregas documentadas"
          : "RCA contractual se gestiona en fuente Gran Tierra (informe oficial)",
    },
  ];

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
            <article className="card">
              <div className="contract-order-head">
                <div>
                  <p className="eyebrow">
                    {isGte ? "Orden 1 · SISTEMA N Costayaco" : "Referencia operativa vs metas Orden 1"}
                  </p>
                  <h3>Scorecard — {monthLabel}</h3>
                  {!isGte ? <CopowerContractNote /> : null}
                </div>
              </div>
              <div className="contract-score-grid">
                {scorecard.map((item) => (
                  <div key={item.name} className="contract-score-card">
                    <div className="contract-score-head">
                      {item.name === "MTBF" || item.name === "MTTR" ? (
                        <MetricLabel code={item.name} />
                      ) : (
                        <strong>{item.name}</strong>
                      )}
                      {item.meets == null ? (
                        <span className="badge info">Seguimiento</span>
                      ) : item.meets ? (
                        <span className="badge success">Cumple</span>
                      ) : (
                        <span className="badge danger">No cumple</span>
                      )}
                    </div>
                    <p className="contract-score-value">{item.valueLabel}</p>
                    <p className="muted">{item.detail}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {isGte ? (
            <section className="panel">
              <article className="card">
                <div className="contract-order-head">
                  <div>
                    <p className="eyebrow">Orden 1 — la que aplica</p>
                    <h3>Indicadores y metas contractuales</h3>
                  </div>
                  <span className="badge success">{CONTRACT_CALC_BASE.length} indicadores</span>
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
          ) : (
            <section className="panel">
              <article className="card">
                <h3>Tabla de metas Orden 1</h3>
                <p className="empty-state">
                  La tabla formal de indicadores/fórmulas/multas está en Gran Tierra. El scorecard de arriba usa
                  KPIs COPOWER del periodo vs umbrales de referencia (≥98%).
                </p>
              </article>
            </section>
          )}
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
              Ideal: 0. Fallas imputables del mes ({isGte ? "GTE" : "COPOWER"}): {failures}. Pendiente confirmar
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
                          ? `${failures} imputables este mes — validar equivalencia`
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
