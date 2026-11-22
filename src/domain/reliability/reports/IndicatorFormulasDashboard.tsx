import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, FlaskConical, Sigma } from "lucide-react";
import { ScreenShell } from "../ui/ScreenShell";
import {
  INDICATOR_FORMULAS,
  INDICATOR_FORMULAS_SOURCE,
  reviewIndicatorFormulas,
  type FormulaReviewTone,
} from "./indicatorFormulas";

type Props = {
  month: string;
  monthLabel: string;
  section?: "catalogo" | "revision";
};

function toneBadge(tone: FormulaReviewTone) {
  if (tone === "ok") return "success";
  if (tone === "warn") return "warning";
  if (tone === "gap") return "danger";
  return "info";
}

function toneLabel(tone: FormulaReviewTone) {
  if (tone === "ok") return "Alineado";
  if (tone === "warn") return "Atención";
  if (tone === "gap") return "Desfase";
  return "Sin dato";
}

export function IndicatorFormulasDashboard({ month, monthLabel, section = "catalogo" }: Props) {
  const review = useMemo(() => reviewIndicatorFormulas(month), [month]);
  const gaps = review.filter((r) => r.tone === "gap" || r.tone === "warn");

  return (
    <ScreenShell
      report="dual"
      title={section === "revision" ? `Revisión de resultados · ${monthLabel}` : "Fórmulas de indicadores"}
      subtitle={
        section === "revision"
          ? "Resultados GTE y COPOWER recalculados con la Tabla 13 de la Orden 1."
          : "Catálogo contractual (Orden 1 / TDR) y cómo lo aplica cada fuente."
      }
      sourceFile={INDICATOR_FORMULAS_SOURCE}
    >
      <div className="exec-dashboard formulas-dashboard">
        {section !== "revision" ? (
          <>
            <div className="op-eff-formula">
              <strong>Fuente oficial</strong>
              <p>
                Tabla 13 · Indicadores de desempeño por confiabilidad. El PDF fija ecuación para Disp,
                MTBF, MTTR, eficiencia (%Eff = 3412 / HR) y plan de MTO. Confiabilidad se pide
                «individual + en paralelo» sin algebra cerrada; la plataforma usa (cal − PF_contr) / cal
                como proxy contractual.
              </p>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th>Fórmula oficial</th>
                    <th>Meta</th>
                    <th>Frecuencia</th>
                    <th>Aplicación GTE</th>
                    <th>Aplicación COPOWER</th>
                  </tr>
                </thead>
                <tbody>
                  {INDICATOR_FORMULAS.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <strong>{f.name}</strong>
                        <div className="muted" style={{ fontSize: "0.78rem", marginTop: 4 }}>
                          {f.officialDescription}
                        </div>
                      </td>
                      <td>
                        <code className="formulas-eq">{f.officialFormula}</code>
                      </td>
                      <td>{f.threshold}</td>
                      <td>{f.frequency}</td>
                      <td>{f.gteHow}</td>
                      <td>{f.copowerHow}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        {section === "catalogo" || section === "revision" ? (
          <>
            {section === "revision" ? null : (
              <header className="exec-header" style={{ marginTop: "0.5rem" }}>
                <div>
                  <p className="field-section-eyebrow">Revisión del periodo</p>
                  <h2>Resultados vs fórmula oficial · {monthLabel}</h2>
                </div>
              </header>
            )}

            <div className="kpi-grid">
              <article className="kpi-card">
                <small>Indicadores revisados</small>
                <h3>{review.length}</h3>
              </article>
              <article className="kpi-card">
                <small>Alineados</small>
                <h3>{review.filter((r) => r.tone === "ok").length}</h3>
              </article>
              <article className="kpi-card">
                <small>Desfases / atención</small>
                <h3>{gaps.length}</h3>
              </article>
            </div>

            {gaps.length > 0 ? (
              <div className="exec-alerts-panel">
                {gaps.map((g) => (
                  <div key={g.id} className="exec-alert active">
                    <div className="exec-alert-head">
                      {g.tone === "gap" ? <AlertTriangle size={16} /> : <FlaskConical size={16} />}
                      <strong>{g.name}</strong>
                      <span className={`badge ${toneBadge(g.tone)}`}>{toneLabel(g.tone)}</span>
                    </div>
                    <p>{g.verdict}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="exec-alert">
                <div className="exec-alert-head">
                  <CheckCircle2 size={16} />
                  <strong>Sin desfases materiales</strong>
                </div>
                <p>Los resultados publicados coinciden con la recálculo de la Tabla 13.</p>
              </div>
            )}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th>Fórmula aplicada</th>
                    <th>Meta</th>
                    <th>GTE publicado</th>
                    <th>COPOWER publicado</th>
                    <th>Recálculo Tabla 13</th>
                    <th>Dictamen</th>
                  </tr>
                </thead>
                <tbody>
                  {review.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>
                        <code className="formulas-eq">{r.officialFormula}</code>
                      </td>
                      <td>{r.threshold}</td>
                      <td>{r.gteResult}</td>
                      <td>{r.cpwResult}</td>
                      <td>{r.recomputed}</td>
                      <td>
                        <span className={`badge ${toneBadge(r.tone)}`}>{toneLabel(r.tone)}</span>
                        <div className="muted" style={{ fontSize: "0.78rem", marginTop: 6 }}>
                          {r.verdict}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="op-eff-formula">
              <strong>
                <Sigma size={14} style={{ marginRight: 6, verticalAlign: "text-bottom" }} />
                Eficiencia
              </strong>
              <p>
                Oficial: %Eff = 3412 / Heat Rate (BTU/kWh) × 100 · meta ≥ 37%. En la plataforma: η% =
                3412 / (HR_ft³/kWh × HHV 1000) × 100. El TDR pide ajuste por LHV; usar HHV subestima
                ligeramente η si el LHV del gas es menor que 1000 BTU/scf.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </ScreenShell>
  );
}
