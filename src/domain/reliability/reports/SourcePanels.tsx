import {
  COPOWER_KPI_FROM_MONTHS,
  COPOWER_MONTHLY_DATA,
  COPOWER_MONTH_ORDER,
  type CopowerMonthKey,
} from "./copowerMonthly";
import {
  GRAN_TIERRA_KPI_FROM_MONTHS,
  GRAN_TIERRA_MONTHLY_DATA,
  GRAN_TIERRA_MONTH_ORDER,
  type GranTierraMonthKey,
} from "./granTierraMonthly";
import { CONTRACTUAL_KPI_TARGETS } from "../contracts/gteOrders";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

type Report = "gran_tierra" | "copower";

const pct = (v: number | null | undefined, d = 2) =>
  v == null || Number.isNaN(v) ? "N/D" : `${(v * 100).toFixed(d)}%`;
const num = (v: number | null | undefined, d = 2) =>
  v == null || Number.isNaN(v) ? "N/D" : v.toFixed(d);
const kwh = (v: number) => `${Math.round(v).toLocaleString("es-CO")} kWh`;
const hours = (v: number | null | undefined) =>
  v == null || Number.isNaN(v) ? "N/D" : `${v.toFixed(2)} h`;

function getSnap(report: Report, month: string) {
  if (report === "gran_tierra") return GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  return COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ?? null;
}

function Trend({ delta, higherIsBetter }: { delta: number | null; higherIsBetter: boolean }) {
  if (delta == null || delta === 0) return <Minus size={14} className="trend-flat" />;
  const improves = higherIsBetter ? delta > 0 : delta < 0;
  return improves ? <ArrowUpRight size={14} className="trend-up" /> : <ArrowDownRight size={14} className="trend-down" />;
}

type Props = {
  report: Report;
  month: string;
  monthLabel: string;
};

/** Comparativo mes vs mes anterior desde la fuente activa (GTE o COPOWER). */
export function SourceMonthCompare({ report, month, monthLabel }: Props) {
  const order = report === "gran_tierra" ? GRAN_TIERRA_MONTH_ORDER : COPOWER_MONTH_ORDER;
  const kpiRows = report === "gran_tierra" ? GRAN_TIERRA_KPI_FROM_MONTHS : COPOWER_KPI_FROM_MONTHS;
  const idx = order.indexOf(month as never);
  const prevMonth = idx > 0 ? order[idx - 1] : null;
  const snap = getSnap(report, month);
  const prev = prevMonth ? getSnap(report, prevMonth) : null;
  const meta = CONTRACTUAL_KPI_TARGETS.reliability;

  if (!snap) {
    return (
      <section className="panel">
        <article className="card">
          <p className="empty-state">Sin registros para {monthLabel} en esta fuente.</p>
        </article>
      </section>
    );
  }

  const rows: {
    label: string;
    curr: string;
    prev: string;
    abs: string;
    delta: number | null;
    hib: boolean;
  }[] = [];

  const pushPct = (label: string, c: number | null | undefined, p: number | null | undefined, hib: boolean) => {
    const abs = c != null && p != null ? (c - p) * 100 : null;
    rows.push({
      label,
      curr: pct(c),
      prev: pct(p),
      abs: abs == null ? "N/D" : `${abs >= 0 ? "+" : ""}${abs.toFixed(2)} pp`,
      delta: abs,
      hib,
    });
  };
  const pushNum = (label: string, c: number | null | undefined, p: number | null | undefined, hib: boolean, unit: string) => {
    const abs = c != null && p != null ? c - p : null;
    rows.push({
      label,
      curr: c == null ? "N/D" : `${num(c)}${unit}`,
      prev: p == null ? "N/D" : `${num(p)}${unit}`,
      abs: abs == null ? "N/D" : `${abs >= 0 ? "+" : ""}${abs.toFixed(2)}${unit}`,
      delta: abs,
      hib,
    });
  };

  pushPct("Disponibilidad", snap.kpi.availability, prev?.kpi.availability, true);
  pushPct("Confiabilidad", snap.kpi.reliability, prev?.kpi.reliability, true);
  pushNum("MTBF", snap.summary.mtbfHours, prev?.summary.mtbfHours, true, " h");
  pushNum("MTTR", snap.summary.mttrHours, prev?.summary.mttrHours, false, " h");
  pushNum("# Fallas", snap.summary.copowerFailures, prev?.summary.copowerFailures, false, "");
  pushNum("Generación", snap.totalGenerationKwh, prev?.totalGenerationKwh, true, " kWh");

  const units = snap.machineIndicators
    .filter((m) => m.unidad !== "SISTEMA N" && m.confiabilidadPct != null)
    .map((m) => ({
      ...m,
      gap: (m.confiabilidadPct as number) - meta * 100,
    }))
    .sort((a, b) => a.gap - b.gap);

  const cyc = snap.generationByAsset.find((a) => /costayaco/i.test(a.asset));
  const vonu = snap.generationByAsset.find((a) => /von/i.test(a.asset));
  const sourceLabel = report === "gran_tierra" ? "Gran Tierra" : "COPOWER";

  return (
    <div className="source-compare">
      <header className="source-compare-hero">
        <div>
          <p className="eyebrow">{sourceLabel} · Período actual vs. anterior</p>
          <h2>
            {monthLabel}
            {prevMonth ? ` vs ${prevMonth}` : " · sin mes anterior"}
          </h2>
          <p className="muted">
            Indicadores del mes seleccionado y variación frente al período previo de la misma fuente.
          </p>
        </div>
        <span className={`source-badge ${report === "gran_tierra" ? "gte" : "cpw"}`}>
          {report === "gran_tierra" ? "GTE" : "CPW"}
        </span>
      </header>

      <section className="source-compare-kpis" aria-label="Indicadores principales">
        {rows.map((r) => {
          const improves =
            r.delta == null || r.delta === 0 ? null : r.hib ? r.delta > 0 : r.delta < 0;
          return (
            <article
              key={r.label}
              className={`source-compare-kpi${
                improves === true ? " source-compare-kpi--up" : improves === false ? " source-compare-kpi--down" : ""
              }`}
            >
              <div className="source-compare-kpi-head">
                <span>{r.label}</span>
                <Trend delta={r.delta} higherIsBetter={r.hib} />
              </div>
              <strong>{r.curr}</strong>
              <div className="source-compare-kpi-meta">
                <small>Anterior {r.prev}</small>
                <small className={improves === true ? "pos" : improves === false ? "neg" : undefined}>
                  {r.abs}
                </small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="panel source-compare-block">
        <article className="card">
          <div className="source-compare-block-head">
            <h3>Costayaco vs Vonú</h3>
            <span className="muted">Energía del período</span>
          </div>
          <div className="source-compare-fields">
            <div className="exec-kpi">
              <span>Costayaco gas</span>
              <strong>{kwh(cyc?.gasKwh ?? 0)}</strong>
              <small>Diésel {kwh(cyc?.dieselKwh ?? 0)}</small>
            </div>
            <div className="exec-kpi">
              <span>Vonú</span>
              <strong>{kwh((vonu?.gasKwh ?? 0) + (vonu?.dieselKwh ?? 0))}</strong>
              <small>Campo VONU</small>
            </div>
            <div className="exec-kpi">
              <span>Total</span>
              <strong>{kwh(snap.totalGenerationKwh)}</strong>
              <small>
                KPI fila {kpiRows.find((r) => r.month === month)?.generationMwh?.toFixed(1) ?? "—"} MWh
              </small>
            </div>
          </div>
        </article>
      </section>

      <section className="panel source-compare-block">
        <article className="card">
          <div className="source-compare-block-head">
            <h3>Detalle comparativo</h3>
            <span className="muted">Actual · anterior · variación</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th>Actual</th>
                  <th>Anterior</th>
                  <th>Δ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label}>
                    <td>{r.label}</td>
                    <td>{r.curr}</td>
                    <td>{r.prev}</td>
                    <td>{r.abs}</td>
                    <td>
                      <Trend delta={r.delta} higherIsBetter={r.hib} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="panel source-compare-block">
        <article className="card">
          <div className="source-compare-block-head">
            <h3>Unidades vs meta {pct(meta)} Conf.</h3>
            <span className="muted">Ordenadas por brecha vs meta</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Disp. %</th>
                  <th>Conf. %</th>
                  <th>Δ vs meta (pp)</th>
                  <th>Fallas</th>
                </tr>
              </thead>
              <tbody>
                {units.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <span className="empty-state">Sin % oficiales de unidad en este periodo.</span>
                    </td>
                  </tr>
                ) : (
                  units.map((u) => (
                    <tr key={`${u.unidad}-${u.campo}`}>
                      <td>
                        {u.unidad}
                        <span className="muted"> · {u.campo}</span>
                      </td>
                      <td>{u.disponibilidadPct == null ? "N/D" : u.disponibilidadPct.toFixed(2)}</td>
                      <td>{u.confiabilidadPct == null ? "N/D" : u.confiabilidadPct.toFixed(2)}</td>
                      <td className={u.gap < 0 ? "delta negative" : "delta positive"}>
                        {u.gap >= 0 ? "+" : ""}
                        {u.gap.toFixed(2)}
                      </td>
                      <td>{u.fallas}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

type BriefProps = {
  report: Report;
  month: string;
  monthLabel: string;
};

/** Una página de reunión operativa jalada solo de la fuente (sin inventar texto). */
export function SourceMeetingBrief({ report, month, monthLabel }: BriefProps) {
  const snap = getSnap(report, month);
  if (!snap) {
    return (
      <section className="panel">
        <article className="card">
          <p className="empty-state">Sin registros para {monthLabel}.</p>
        </article>
      </section>
    );
  }

  const topFail = [...snap.machineIndicators]
    .filter((m) => m.unidad !== "SISTEMA N" && m.fallas > 0)
    .sort((a, b) => b.fallas - a.fallas)[0];
  const failures = snap.eventLog.filter((e) => e.eventType === "Falla").slice(0, 8);

  return (
    <section className="panel meeting-brief">
      <article className="card">
        <p className="eyebrow">
          Reunión · {report === "gran_tierra" ? "Gran Tierra" : "COPOWER"} · {monthLabel}
        </p>
        <h3>Consolidados del periodo</h3>
        <div className="exec-kpi-row">
          <div className="exec-kpi">
            <span>Disponibilidad</span>
            <strong>{pct(snap.kpi.availability)}</strong>
          </div>
          <div className="exec-kpi">
            <span>Confiabilidad</span>
            <strong>{pct(snap.kpi.reliability)}</strong>
          </div>
          <div className="exec-kpi">
            <span>Generación</span>
            <strong>{kwh(snap.totalGenerationKwh)}</strong>
          </div>
          <div className="exec-kpi">
            <span>Fallas</span>
            <strong>{snap.summary.copowerFailures}</strong>
          </div>
          <div className="exec-kpi">
            <span>MTBF / MTTR</span>
            <strong>
              {hours(snap.summary.mtbfHours)} / {hours(snap.summary.mttrHours)}
            </strong>
          </div>
        </div>

        <h4 className="exec-subhead">Activo crítico</h4>
        {topFail ? (
          <p>
            <strong>{topFail.unidad}</strong> · {topFail.fallas} falla(s) · MTBF {topFail.mtbfLabel} · MTTR{" "}
            {topFail.mttrHours ?? "N/D"} h
          </p>
        ) : (
          <p className="empty-state">Sin unidades con fallas en el mes.</p>
        )}

        <h4 className="exec-subhead">Eventos de falla (muestra)</h4>
        {failures.length === 0 ? (
          <p className="empty-state">Sin fallas en bitácora del periodo.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>Horas</th>
                  <th>Resp.</th>
                  <th>Causa / notas</th>
                </tr>
              </thead>
              <tbody>
                {failures.map((e) => (
                  <tr key={`${e.date}-${e.equipment}-${e.cause}`}>
                    <td>{e.date}</td>
                    <td>{e.equipment}</td>
                    <td>{hours(e.downtimeHours)}</td>
                    <td>{e.responsible}</td>
                    <td className="detalle-cell">{e.notes || e.cause}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="muted" style={{ marginTop: "0.75rem" }}>
          RCA / planes de acción: sin registros formales en esta fuente — pendiente de carga.
        </p>
      </article>
    </section>
  );
}

export function SourceKpiStrip({ report, month }: { report: Report; month: string }) {
  const snap = getSnap(report, month);
  if (!snap) return <p className="empty-state">Sin registros para este periodo.</p>;
  return (
    <div className="exec-kpi-row">
      <div className="exec-kpi">
        <span>Disponibilidad</span>
        <strong>{pct(snap.kpi.availability)}</strong>
      </div>
      <div className="exec-kpi">
        <span>Confiabilidad</span>
        <strong>{pct(snap.kpi.reliability)}</strong>
      </div>
      <div className="exec-kpi">
        <span>Generación</span>
        <strong>{kwh(snap.totalGenerationKwh)}</strong>
      </div>
      <div className="exec-kpi">
        <span>Fallas</span>
        <strong>{snap.summary.copowerFailures}</strong>
      </div>
      <div className="exec-kpi">
        <span>Eventos</span>
        <strong>{snap.summary.totalEvents ?? snap.eventLog.length}</strong>
      </div>
      <div className="exec-kpi">
        <span>MTBF / MTTR</span>
        <strong>
          {hours(snap.summary.mtbfHours)} / {hours(snap.summary.mttrHours)}
        </strong>
      </div>
    </div>
  );
}

export { getSnap, kwh, hours, pct };
