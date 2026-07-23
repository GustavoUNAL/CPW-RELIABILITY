import { useMemo } from "react";
import { AlertTriangle, Layers, PieChart as PieIcon, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  COPOWER_MONTHLY_DATA,
  type CopowerMonthKey,
} from "./copowerMonthly";
import {
  GRAN_TIERRA_MONTHLY_DATA,
  type GranTierraMonthKey,
} from "./granTierraMonthly";
import {
  classifyEventCategory,
  EVENT_CATEGORIES,
  type EventCategoryCode,
} from "../events/eventCategories";
import type { ReportKey } from "../types";

type Props = {
  month: string;
  monthLabel: string;
};

const CHART_COLORS = [
  "#0f766e",
  "#0ea5e9",
  "#6366f1",
  "#d97706",
  "#dc2626",
  "#059669",
  "#7c3aed",
  "#0284c7",
];

function getSnap(report: ReportKey, month: string) {
  if (report === "gran_tierra") return GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  return COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ?? null;
}

/** Misma lógica de origen GTE-junio que EventInsightsDashboard. */
function classifyGranTierraJuneByOrigin(input: {
  cause: string;
  notes: string;
  date: string;
  equipment: string;
}): EventCategoryCode {
  const text = `${input.cause || ""} ${input.notes || ""}`.toLowerCase();

  if (/tablero de auxiliares|totalizador principal|protecci/.test(text)) return "ELEC_PROTECCIONES";
  if (/reconectador|34\.?5\s*kv|disparo de c9|perturbacion en la red|elevacion del voltaje|potencia reactiva|sobrecorriente/.test(text)) {
    return "ELEC_RED";
  }
  if (/tuberia de cyc|cyc 19/.test(text)) return "INFRA_AUXILIARES";
  if (/magnetiz|pruebas de magnetiz/.test(text)) return "OPER_MANIOBRA";
  if (/mantenimiento semanal de mru|mantenimiento cyc|cambio de v[áa]lvula/.test(text)) return "MTO_PROGRAMADO";
  if (/mru|ngl|quincy|chiller|secuestrante/.test(text)) return "GAS_TRATAMIENTO";
  if (/deton/.test(text)) return "MEC_COMBUSTION";
  if (/intercooler|aceite|enfriamiento/.test(text)) return "MEC_ENFRIAMIENTO_LUBRICACION";
  if (/admisi[oó]n|escape|flexible|tren de admision/.test(text)) return "MEC_ADMISION_ESCAPE";
  if (/potencia inversa|sobrecarga|gobernaci[oó]n|reparto de carga/.test(text)) return "CTRL_GOBERNACION";
  if (/altas vivraciones|altas vibraciones/.test(text)) return "DATOS_INSUFICIENTES";

  return classifyEventCategory(text).code;
}

function classifyEvent(
  report: ReportKey,
  month: string,
  cause: string,
  notes: string,
  date: string,
  equipment: string,
): EventCategoryCode {
  if (report === "gran_tierra" && month === "Jun") {
    return classifyGranTierraJuneByOrigin({ cause, notes, date, equipment });
  }
  return classifyEventCategory(notes || cause || "").code;
}

export function FailureClassificationView({ month, monthLabel }: Props) {
  const { rows, chartData, totalEvents, activeCats, topCat, top3Share, emptyCats } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const cat of EVENT_CATEGORIES) counts.set(cat.code, 0);

    let total = 0;
    for (const report of ["copower", "gran_tierra"] as const) {
      const snap = getSnap(report, month);
      if (!snap) continue;
      for (const e of snap.eventLog) {
        const code = classifyEvent(report, month, e.cause || "", e.notes || "", e.date, e.equipment || "");
        counts.set(code, (counts.get(code) ?? 0) + 1);
        total += 1;
      }
    }

    const mapped = EVENT_CATEGORIES.map((cat) => {
      const count = counts.get(cat.code) ?? 0;
      return {
        code: cat.code,
        label: cat.label,
        shortLabel: cat.shortLabel,
        count,
        share: total > 0 ? (count / total) * 100 : 0,
      };
    }).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    const withEvents = mapped.filter((r) => r.count > 0);
    const top3 = withEvents.slice(0, 3);
    const top3Sum = top3.reduce((s, r) => s + r.count, 0);

    return {
      rows: mapped,
      chartData: withEvents.slice(0, 8).map((r, i) => ({
        name: r.shortLabel,
        code: r.code,
        eventos: r.count,
        share: r.share,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      })),
      totalEvents: total,
      activeCats: withEvents.length,
      topCat: withEvents[0] ?? null,
      top3Share: total > 0 ? (top3Sum / total) * 100 : 0,
      emptyCats: mapped.length - withEvents.length,
    };
  }, [month]);

  const chartHeight = Math.max(180, Math.min(320, 36 + chartData.length * 34));

  return (
    <div className="fc-module">
      <header className="fc-header">
        <div className="fc-header-copy">
          <div className="fc-title-row">
            <h2>Clasificación de fallas</h2>
            <span className="source-badge dual">Integrado</span>
          </div>
          <p className="muted">
            Taxonomía de causa · {monthLabel} · {totalEvents} evento(s)
          </p>
        </div>
      </header>

      <section className="fc-kpi-strip" aria-label="Indicadores de clasificación">
        <article className="fc-kpi">
          <Layers size={14} />
          <div>
            <span>Eventos</span>
            <strong>{totalEvents}</strong>
          </div>
        </article>
        <article className="fc-kpi">
          <PieIcon size={14} />
          <div>
            <span>Activas</span>
            <strong>
              {activeCats}
              <small>/{rows.length}</small>
            </strong>
          </div>
        </article>
        <article className="fc-kpi fc-kpi--accent">
          <TrendingUp size={14} />
          <div>
            <span>Líder</span>
            <strong>{topCat ? topCat.shortLabel : "N/D"}</strong>
            <small>{topCat ? `${topCat.count} · ${topCat.share.toFixed(0)}%` : "—"}</small>
          </div>
        </article>
        <article className="fc-kpi">
          <AlertTriangle size={14} />
          <div>
            <span>Top 3</span>
            <strong>{top3Share.toFixed(0)}%</strong>
            <small>{emptyCats} vacías</small>
          </div>
        </article>
      </section>

      <div className="fc-body">
        <section className="fc-table-panel">
          <div className="fc-panel-head">
            <h3>Catálogo</h3>
            <p className="muted">{rows.length} categorías</p>
          </div>
          <div className="fc-table-scroll">
            <table className="fc-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Categoría</th>
                  <th className="fc-col-num">N</th>
                  <th className="fc-col-pct">%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((cat) => (
                  <tr key={cat.code} className={cat.count === 0 ? "fc-row--empty" : undefined}>
                    <td>
                      <code className="fc-code">{cat.code}</code>
                    </td>
                    <td>
                      <span className="fc-cat-label" title={cat.label}>
                        {cat.shortLabel}
                      </span>
                    </td>
                    <td className="fc-col-num">{cat.count}</td>
                    <td className="fc-col-pct">{cat.share.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="fc-chart-panel">
          <div className="fc-panel-head">
            <h3>Distribución por categoría</h3>
            <p className="muted">Top {chartData.length || 0} con eventos</p>
          </div>
          <div className="fc-chart" style={{ height: chartHeight }}>
            {chartData.length === 0 ? (
              <p className="muted fc-empty">Sin eventos clasificados en el periodo.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 4, right: 18, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={108}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <Tooltip
                    formatter={(value, _name, item) => {
                      const share = Number(item?.payload?.share ?? 0);
                      return [`${Number(value)} · ${share.toFixed(1)}%`, "Eventos"];
                    }}
                    labelFormatter={(label, payload) => {
                      const code = payload?.[0]?.payload?.code;
                      return code ? `${label} (${code})` : String(label);
                    }}
                  />
                  <Bar dataKey="eventos" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {chartData.map((row) => (
                      <Cell key={row.code} fill={row.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
