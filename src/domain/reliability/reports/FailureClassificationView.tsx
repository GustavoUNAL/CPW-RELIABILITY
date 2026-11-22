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
  buildEventCategoryCatalog,
  classifyReportEventCategory,
  type EventCategoryCode,
} from "../events/eventCategories";
import { enrichEventLog } from "../events/eventLogUtils";
import { EventCategoryCatalogTable } from "./EventCategoryCatalogTable";
import type { ReportKey } from "../types";

type Props = {
  month: string;
  monthLabel: string;
  /** Por defecto dual (COPOWER + GTE). En eventos GTE se puede pasar gran_tierra. */
  report?: ReportKey | "dual";
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

export function FailureClassificationView({ month, monthLabel, report = "dual" }: Props) {
  const { rows, chartData, totalEvents, activeCats, topCat, top3Share, emptyCats, sourceLabel } = useMemo(() => {
    const sources: ReportKey[] =
      report === "dual" ? ["copower", "gran_tierra"] : report === "gran_tierra" ? ["gran_tierra"] : ["copower"];

    const codes: EventCategoryCode[] = [];
    for (const src of sources) {
      const snap = getSnap(src, month);
      if (!snap) continue;
      const events = enrichEventLog(snap.eventLog, src);
      for (const e of events) {
        codes.push(
          classifyReportEventCategory({
            report: src,
            month,
            cause: e.cause || "",
            notes: e.notes || "",
            date: e.date,
            equipment: e.equipment || "",
          }).primary,
        );
      }
    }

    const mapped = buildEventCategoryCatalog(codes);
    const withEvents = [...mapped].filter((r) => r.count > 0).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    const top3 = withEvents.slice(0, 3);
    const top3Sum = top3.reduce((s, r) => s + r.count, 0);
    const total = codes.length;

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
      sourceLabel:
        report === "gran_tierra" ? "Gran Tierra" : report === "copower" ? "COPOWER" : "Integrado",
    };
  }, [month, report]);

  const chartHeight = Math.max(180, Math.min(320, 36 + chartData.length * 34));

  return (
    <div className="fc-module">
      <header className="fc-header">
        <div className="fc-header-copy">
          <div className="fc-title-row">
            <h2>Clasificación de fallas</h2>
            <span className={`source-badge ${report === "dual" ? "dual" : report === "gran_tierra" ? "gte" : "cpw"}`}>
              {sourceLabel}
            </span>
          </div>
          <p className="muted">
            Taxonomía de causa · {monthLabel} · {totalEvents} evento(s) consolidados
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
        <EventCategoryCatalogTable
          rows={rows}
          totalEvents={totalEvents}
          title="Catálogo"
          subtitle={`${rows.length} categorías`}
        />

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

