import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, Minus } from "lucide-react";
import { CONTRACTUAL_KPI_TARGETS } from "../contracts/gteOrders";
import {
  GRAN_TIERRA_KPI_FROM_MONTHS,
  GRAN_TIERRA_MONTHLY_DATA,
  type GranTierraMonthKey,
} from "./granTierraMonthly";
import { JUNE_2026_AUDIT_ROWS, JUNE_2026_IMPUTABLE_EVENTS } from "./juneImputableEvents";
import { MetricGlossary } from "../ui/metricDefs";

type Props = {
  month: GranTierraMonthKey;
  monthLabel: string;
};

const pct = (v: number | null | undefined, d = 2) =>
  v == null || Number.isNaN(v) ? "N/D" : `${(v * 100).toFixed(d)}%`;
const num = (v: number | null | undefined, d = 2) =>
  v == null || Number.isNaN(v) ? "N/D" : v.toFixed(d);
const kwh = (v: number) => `${Math.round(v).toLocaleString("es-CO")} kWh`;

function TrendArrow({ delta, higherIsBetter }: { delta: number | null; higherIsBetter: boolean }) {
  if (delta == null || delta === 0) return <Minus size={14} className="trend-flat" />;
  const improves = higherIsBetter ? delta > 0 : delta < 0;
  return improves ? (
    <ArrowUpRight size={14} className="trend-up" />
  ) : (
    <ArrowDownRight size={14} className="trend-down" />
  );
}

export function ComparativeAnalysis({ month, monthLabel }: Props) {
  const [auditOpen, setAuditOpen] = useState(false);
  const idx = GRAN_TIERRA_KPI_FROM_MONTHS.findIndex((r) => r.month === month);
  const current = GRAN_TIERRA_KPI_FROM_MONTHS[idx] ?? null;
  const previous = idx > 0 ? GRAN_TIERRA_KPI_FROM_MONTHS[idx - 1] : null;
  const snap = GRAN_TIERRA_MONTHLY_DATA[month];
  const prevKey = idx > 0 ? (GRAN_TIERRA_KPI_FROM_MONTHS[idx - 1].month as GranTierraMonthKey) : null;
  const prevSnap = prevKey ? GRAN_TIERRA_MONTHLY_DATA[prevKey] : null;

  const monthCompare = useMemo(() => {
    if (!current) return [];
    const rows: {
      label: string;
      curr: string;
      prev: string;
      abs: string;
      pctChange: string;
      delta: number | null;
      higherIsBetter: boolean;
    }[] = [];
    const pushPct = (label: string, c: number | null | undefined, p: number | null | undefined, hib: boolean) => {
      const abs = c != null && p != null ? (c - p) * 100 : null;
      const pctCh = c != null && p != null && p !== 0 ? ((c - p) / Math.abs(p)) * 100 : null;
      rows.push({
        label,
        curr: pct(c),
        prev: pct(p),
        abs: abs == null ? "N/D" : `${abs >= 0 ? "+" : ""}${abs.toFixed(2)} pp`,
        pctChange: pctCh == null ? "N/D" : `${pctCh >= 0 ? "+" : ""}${pctCh.toFixed(1)}%`,
        delta: abs,
        higherIsBetter: hib,
      });
    };
    const pushNum = (
      label: string,
      c: number | null | undefined,
      p: number | null | undefined,
      hib: boolean,
      unit: string,
    ) => {
      const abs = c != null && p != null ? c - p : null;
      const pctCh = c != null && p != null && p !== 0 ? ((c - p) / Math.abs(p)) * 100 : null;
      rows.push({
        label,
        curr: c == null ? "N/D" : `${num(c)}${unit}`,
        prev: p == null ? "N/D" : `${num(p)}${unit}`,
        abs: abs == null ? "N/D" : `${abs >= 0 ? "+" : ""}${abs.toFixed(2)}${unit}`,
        pctChange: pctCh == null ? "N/D" : `${pctCh >= 0 ? "+" : ""}${pctCh.toFixed(1)}%`,
        delta: abs,
        higherIsBetter: hib,
      });
    };
    pushPct("Disponibilidad", current.availability, previous?.availability, true);
    pushPct("Confiabilidad", current.reliability, previous?.reliability, true);
    pushNum("MTBF", snap.summary.mtbfHours, prevSnap?.summary.mtbfHours ?? null, true, " h");
    pushNum("MTTR", snap.summary.mttrHours, prevSnap?.summary.mttrHours ?? null, false, " h");
    pushNum("Fallas imputables", snap.summary.copowerFailures, prevSnap?.summary.copowerFailures ?? null, false, "");
    pushNum(
      "Generación",
      current.generationMwh * 1000,
      previous ? previous.generationMwh * 1000 : null,
      true,
      " kWh",
    );
    return rows;
  }, [current, previous, snap, prevSnap]);

  const unitRows = useMemo(() => {
    const meta = CONTRACTUAL_KPI_TARGETS.availability * 100;
    return snap.machineIndicators
      .filter((m) => m.unidad !== "SISTEMA N" && !/excluida|estabili/i.test(m.campo))
      .map((m) => {
        const disp = m.disponibilidadPct;
        const conf = m.confiabilidadPct;
        const worst = Math.min(disp ?? 100, conf ?? 100);
        const status = disp == null || conf == null ? "nd" : worst >= meta ? "ok" : "fail";
        return { ...m, status, gapDisp: disp == null ? null : disp - meta, gapConf: conf == null ? null : conf - meta };
      })
      .sort((a, b) => (a.disponibilidadPct ?? 999) - (b.disponibilidadPct ?? 999));
  }, [snap]);

  const sistemaCyc = snap.machineIndicators.find((m) => m.unidad === "SISTEMA N" && m.campo === "COSTAYACO");
  const sistemaVonu = snap.machineIndicators.find((m) => m.unidad === "SISTEMA N" && m.campo === "VONU");

  const losses = useMemo(() => {
    if (month !== "Jun") {
      return {
        available: false as const,
        note: "Estimación de kWh perdidos solo documentada con horas PF oficiales de junio (PF_contr 20 h · PF_cli 189 h).",
      };
    }
    const units = snap.generationByEquipment.filter((u) => u.campo === "COSTAYACO" && u.horasOperacion > 0);
    const avgKw =
      units.length > 0
        ? units.reduce((a, u) => a + u.energiaKwh / u.horasOperacion, 0) / units.length
        : null;
    const pfContr = snap.summary.hoursFailureCopower;
    const pfCli = snap.summary.hoursFailureClient;
    return {
      available: true as const,
      avgKw,
      pfContr,
      pfCli,
      kwhContr: avgKw == null ? null : pfContr * avgKw,
      kwhCli: avgKw == null ? null : pfCli * avgKw,
      note: "kWh estimados = horas PF × potencia promedio de unidades Costayaco con horas de operación > 0 (Excel generación).",
    };
  }, [month, snap]);

  const mismatches = JUNE_2026_AUDIT_ROWS.filter((r) => !r.match);

  return (
    <div className="exec-dashboard">
      <header className="exec-header">
        <div>
          <p className="eyebrow">Análisis comparativo</p>
          <h2>{monthLabel}</h2>
          <p className="muted">
            Consolidación y validación de indicadores. Fuente: PDF oficial / Excel Data Soporte (GTE). Sin cifras
            inventadas.
          </p>
        </div>
      </header>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">1 · Mes vs mes anterior</p>
          <h3>Variación de indicadores</h3>
          <MetricGlossary />
          {!previous ? (
            <p className="empty-state">Sin mes anterior con serie cargada para comparar.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th>Actual</th>
                    <th>Anterior ({previous.month})</th>
                    <th>Δ absoluto</th>
                    <th>Δ %</th>
                    <th>Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  {monthCompare.map((r) => (
                    <tr key={r.label}>
                      <td>
                        <strong>{r.label}</strong>
                      </td>
                      <td>{r.curr}</td>
                      <td>{r.prev}</td>
                      <td>{r.abs}</td>
                      <td>{r.pctChange}</td>
                      <td>
                        <TrendArrow delta={r.delta} higherIsBetter={r.higherIsBetter} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="source-tag">Fuente: serie mensual GTE (Ene–Abr Excel; May–Jun PDF oficial)</p>
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <p className="eyebrow">2 · Unidades vs meta Orden 1 (≥98%)</p>
          <h3>Semáforo por unidad</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Campo</th>
                  <th>Disp. %</th>
                  <th>Conf. %</th>
                  <th>Δ Disp. vs 98%</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {unitRows.map((r) => (
                  <tr key={`${r.unidad}-${r.campo}`} className={r.status === "fail" ? "row-highlight" : undefined}>
                    <td>
                      <strong>{r.unidad}</strong>
                    </td>
                    <td>{r.campo}</td>
                    <td>{r.disponibilidadPct == null ? "N/D" : `${r.disponibilidadPct.toFixed(2)}%`}</td>
                    <td>{r.confiabilidadPct == null ? "N/D" : `${r.confiabilidadPct.toFixed(2)}%`}</td>
                    <td>
                      {r.gapDisp == null ? "N/D" : `${r.gapDisp >= 0 ? "+" : ""}${r.gapDisp.toFixed(2)} pp`}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === "ok" ? "success" : r.status === "fail" ? "danger" : "warning"
                        }`}
                      >
                        {r.status === "ok" ? "Cumple" : r.status === "fail" ? "No cumple" : "N/D"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="source-tag">Fuente: indicadores por unidad del mes (anexo / Excel)</p>
        </article>
      </section>

      <section className="panel two-col">
        <article className="card">
          <p className="eyebrow">3 · Costayaco vs Vonú</p>
          <h3>Sistemas lado a lado</h3>
          <div className="exec-kpi-row">
            <div className={`exec-kpi ${sistemaCyc && (sistemaCyc.disponibilidadPct ?? 0) >= 98 ? "" : "pending"}`}>
              <span>SISTEMA N Costayaco</span>
              <strong>
                Disp {sistemaCyc?.disponibilidadPct?.toFixed(2) ?? "N/D"}% · Conf{" "}
                {sistemaCyc?.confiabilidadPct?.toFixed(2) ?? "N/D"}%
              </strong>
              <small>{sistemaCyc?.cumplimiento ?? "N/D"} · meta ≥98%</small>
            </div>
            <div className="exec-kpi">
              <span>SISTEMA N Vonú</span>
              <strong>
                Disp {sistemaVonu?.disponibilidadPct?.toFixed(2) ?? "N/D"}% · Conf{" "}
                {sistemaVonu?.confiabilidadPct?.toFixed(2) ?? "N/D"}%
              </strong>
              <small>{sistemaVonu?.cumplimiento ?? "N/D"} · meta ≥98%</small>
            </div>
          </div>
          <p className="source-tag">Fuente: anexo PDF / SISTEMA N del mes</p>
        </article>
        <article className="card">
          <p className="eyebrow">4 · Pérdidas operacionales</p>
          <h3>PF_contr vs PF_cli</h3>
          {!losses.available ? (
            <p className="empty-state">{losses.note}</p>
          ) : (
            <>
              <div className="exec-kpi-row">
                <div className="exec-kpi pending">
                  <span>Imputable COPOWER (PF_contr)</span>
                  <strong>{losses.pfContr} h</strong>
                  <small>
                    ≈ {losses.kwhContr == null ? "N/D" : kwh(losses.kwhContr)} estimados
                    {losses.avgKw != null ? ` · ${losses.avgKw.toFixed(0)} kW prom.` : ""}
                  </small>
                </div>
                <div className="exec-kpi">
                  <span>No imputable (PF_cli)</span>
                  <strong>{losses.pfCli} h</strong>
                  <small>≈ {losses.kwhCli == null ? "N/D" : kwh(losses.kwhCli)} estimados</small>
                </div>
              </div>
              <p className="muted">{losses.note}</p>
              <p className="source-tag">Fuente: PDF/anexo junio (20 h / 189 h) + Excel generación</p>
            </>
          )}
        </article>
      </section>

      <section className="panel">
        <article className="card">
          <div className="section-header-row">
            <div>
              <p className="eyebrow">5 · Auditoría de consolidado</p>
              <h3>Validar PDF oficial vs Excel</h3>
            </div>
            <button type="button" className="open-popup-btn" onClick={() => setAuditOpen((v) => !v)}>
              {auditOpen ? "Ocultar validación" : "Validar consolidado"}
            </button>
          </div>
          {month !== "Jun" ? (
            <p className="empty-state">
              Matriz de cruce PDF vs Excel disponible para junio 2026 (único mes con ambas fuentes reconciliadas en
              detalle).
            </p>
          ) : auditOpen ? (
            <>
              <p className="muted">
                {mismatches.length === 0
                  ? "Sin discrepancias en las filas auditadas."
                  : `${mismatches.length} fila(s) sin coincidencia.`}
              </p>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Indicador</th>
                      <th>PDF oficial</th>
                      <th>Excel soporte</th>
                      <th>Estado</th>
                      <th>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {JUNE_2026_AUDIT_ROWS.map((r) => (
                      <tr key={r.indicator} className={r.match ? undefined : "row-highlight"}>
                        <td>
                          <strong>{r.indicator}</strong>
                        </td>
                        <td>{r.pdfValue}</td>
                        <td>{r.excelValue}</td>
                        <td>
                          {r.match ? (
                            <span className="badge success">
                              <CheckCircle2 size={12} /> Coincide
                            </span>
                          ) : (
                            <span className="badge danger">
                              <AlertTriangle size={12} /> Difere
                            </span>
                          )}
                        </td>
                        <td className="detalle-cell">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="source-tag">Referencia de imputables: {JUNE_2026_IMPUTABLE_EVENTS.length} eventos · Σ PF_contr = 20 h</p>
            </>
          ) : (
            <p className="muted">Pulse «Validar consolidado» para cruzar las cifras oficiales de junio.</p>
          )}
        </article>
      </section>
    </div>
  );
}
