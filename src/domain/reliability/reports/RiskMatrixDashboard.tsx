import { useMemo, useState } from "react";
import { buildGteDegradationRiskPortfolio } from "./buildDegradationRiskPortfolio";
import { RiskMatrix5x5 } from "./DegradationRiskDashboard";
import {
  CRITICALITY_COLOR,
  RISK_LEVEL_COLOR,
  type AssetHealth,
  type CriticalityLevel,
  type RiskLevel,
} from "./degradationRiskTypes";

type Props = {
  monthLabel: string;
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="badge"
      style={{
        background: `color-mix(in oklab, ${color} 18%, var(--panel-soft))`,
        color,
      }}
    >
      {label}
    </span>
  );
}

export function RiskMatrixDashboard({ monthLabel }: Props) {
  const [assets] = useState<AssetHealth[]>(() => buildGteDegradationRiskPortfolio());
  const ranked = useMemo(
    () => [...assets].sort((a, b) => b.riskScore - a.riskScore || a.assetId.localeCompare(b.assetId)),
    [assets],
  );

  return (
    <div className="panel">
      <article className="card">
        <p className="eyebrow">Análisis de confiabilidad</p>
        <div className="screen-shell-head">
          <h3>Matriz de riesgo · {monthLabel}</h3>
          <span className="source-badge gte">GTE</span>
        </div>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          Probabilidad × Impacto (5×5) — misma evaluación APM de tendencias y riesgos.
        </p>

        <article className="dash-chart-panel" style={{ marginTop: "0.75rem" }}>
          <h4>Matriz de riesgo 5×5</h4>
          <p className="muted dash-chart-sub">Impacto → · Probabilidad ↑</p>
          <RiskMatrix5x5 assets={assets} maxLabels={3} className="dr-matrix-lg" />
        </article>

        <div className="table-wrap" style={{ marginTop: "0.75rem" }}>
          <table>
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Campo</th>
                <th>Probabilidad</th>
                <th>Impacto</th>
                <th>Score</th>
                <th>Riesgo</th>
                <th>Criticidad</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((a) => (
                <tr key={a.id}>
                  <td>{a.assetName}</td>
                  <td>{a.field}</td>
                  <td>{a.probability}</td>
                  <td>{a.impact}</td>
                  <td>{a.riskScore}</td>
                  <td>
                    <Badge
                      label={a.riskLevel}
                      color={RISK_LEVEL_COLOR[a.riskLevel as RiskLevel]}
                    />
                  </td>
                  <td>
                    <Badge
                      label={a.criticality}
                      color={CRITICALITY_COLOR[a.criticality as CriticalityLevel]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
