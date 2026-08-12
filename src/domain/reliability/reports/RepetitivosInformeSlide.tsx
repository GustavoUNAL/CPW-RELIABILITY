import { AlertTriangle, Layers, Repeat, ShieldAlert, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildEventCategoryCatalog,
  classifyReportEventCategory,
  EVENT_CATEGORIES,
  type EventCategoryCode,
} from "../events/eventCategories";
import { enrichEventLog } from "../events/eventLogUtils";
import type { ReportKey } from "../types";
import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";

type Props = {
  report?: ReportKey;
  month: string;
  monthLabel: string;
};

const CATEGORY_META = Object.fromEntries(
  EVENT_CATEGORIES.map((c) => [c.code, { label: c.label, short: c.shortLabel }]),
);

function pct(count: number, total: number, digits = 1) {
  if (total <= 0) return "0.0%";
  return `${((count / total) * 100).toFixed(digits)}%`;
}

function prettyEquipmentName(raw: string) {
  const v = (raw || "").trim();
  if (!v) return "Sin unidad";
  if (/^parque$/i.test(v)) return "Parque";
  return v;
}

export function RepetitivosInformeSlide({ report = "gran_tierra", month, monthLabel }: Props) {
  const snap =
    report === "gran_tierra"
      ? GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey]
      : COPOWER_MONTHLY_DATA[month as CopowerMonthKey];

  const insights = useMemo(() => {
    if (!snap) return null;

    const events = enrichEventLog(snap.eventLog, report === "gran_tierra" ? "gran_tierra" : "copower");
    const classified = events.map((e, idx) => {
      const origin = classifyReportEventCategory({
        report: report === "gran_tierra" ? "gran_tierra" : "copower",
        month,
        cause: e.cause || "",
        notes: e.notes || "",
        date: e.date,
        equipment: e.equipment || "",
      });
      const cat = EVENT_CATEGORIES.find((c) => c.code === origin.primary) ?? EVENT_CATEGORIES[0];
      return {
        id: `${report === "gran_tierra" ? "GTE" : "CPW"}-${month}-${String(idx + 1).padStart(3, "0")}`,
        equipment: prettyEquipmentName(e.equipment || "N/D"),
        categoryCode: cat.code as EventCategoryCode,
        categoryLabel: cat.label,
      };
    });

    const total = classified.length;
    /** Filas de bitácora antes de fusionar las que comparten fecha, tipo y causa. */
    const rawTotal = snap.eventLog.length;
    const eqCounts = new Map<string, number>();
    const catCounts = new Map<string, number>();
    const eqCatCounts = new Map<string, number>();

    for (const e of classified) {
      eqCounts.set(e.equipment, (eqCounts.get(e.equipment) ?? 0) + 1);
      catCounts.set(e.categoryCode, (catCounts.get(e.categoryCode) ?? 0) + 1);
      const key = `${e.equipment}||${e.categoryCode}`;
      eqCatCounts.set(key, (eqCatCounts.get(key) ?? 0) + 1);
    }

    const repeatedByEquipment = [...eqCounts.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    const repeatedByCategory = [...catCounts.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    const repeatedEqCat = [...eqCatCounts.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => {
        const [equipment, category] = key.split("||");
        return { equipment, category: category as EventCategoryCode, count };
      });

    const repeatedEventCount = classified.filter(
      (e) => (eqCounts.get(e.equipment) ?? 0) >= 2,
    ).length;

    const catalog = buildEventCategoryCatalog(classified.map((e) => e.categoryCode)).filter(
      (c) => c.count > 0,
    );

    const equipChart = repeatedByEquipment.slice(0, 8).map(([equipment, count]) => ({
      equipment,
      count,
      share: Number(((count / Math.max(total, 1)) * 100).toFixed(1)),
    }));

    const catChart = catalog.slice(0, 8).map((c) => ({
      code: c.code,
      label: c.shortLabel,
      count: c.count,
      share: Number(c.share.toFixed(1)),
    }));

    const pairChart = repeatedEqCat.slice(0, 8).map((row) => ({
      equipment: row.equipment,
      code: row.category,
      count: row.count,
      share: Number(((row.count / Math.max(total, 1)) * 100).toFixed(1)),
    }));

    const repeatRate = total > 0 ? (repeatedEventCount / total) * 100 : 0;
    const topPair = repeatedEqCat[0];

    return {
      total,
      rawTotal,
      repeatedByEquipment,
      repeatedByCategory,
      repeatedEqCat,
      repeatedEventCount,
      catalog,
      equipChart,
      catChart,
      pairChart,
      repeatRate,
      topPair,
    };
  }, [month, report, snap]);

  if (!snap || !insights) {
    return <p className="empty-state">Sin datos de eventos repetitivos para {monthLabel}.</p>;
  }

  const {
    total,
    rawTotal,
    repeatedByEquipment,
    repeatedByCategory,
    repeatedEqCat,
    repeatedEventCount,
    equipChart,
    catChart,
    pairChart,
    repeatRate,
    topPair,
  } = insights;

  return (
    <div className="rep-slide">
      <div className="rep-slide-kpis" aria-label="Indicadores de eventos repetitivos">
        <article>
          <Repeat size={15} />
          <span>Eventos consolidados</span>
          <strong>{total}</strong>
          <small>
            {rawTotal} registros de bitácora · {monthLabel}
          </small>
        </article>
        <article>
          <AlertTriangle size={15} />
          <span>Equipos repetitivos</span>
          <strong>{repeatedByEquipment.length}</strong>
          <small>Recurrencia ≥ 2</small>
        </article>
        <article>
          <ShieldAlert size={15} />
          <span>Categorías repetitivas</span>
          <strong>{repeatedByCategory.length}</strong>
          <small>Causas recurrentes</small>
        </article>
        <article>
          <TrendingUp size={15} />
          <span>Eventos repetidos</span>
          <strong>{repeatedEventCount}</strong>
          <small>{pct(repeatedEventCount, total)} del total</small>
        </article>
        <article>
          <Layers size={15} />
          <span>Tasa de repetición</span>
          <strong>{repeatRate.toFixed(1)}%</strong>
          <small>
            {topPair
              ? `Pico: ${topPair.equipment} · ${topPair.category}`
              : "Sin cluster dominante"}
          </small>
        </article>
      </div>

      <div className="rep-slide-charts">
        <article className="rep-slide-chart">
          <header>
            <h4>Top equipos</h4>
            <p>Frecuencia y % sobre bitácora</p>
          </header>
          <div className="rep-slide-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={equipChart} margin={{ top: 14, right: 6, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" vertical={false} />
                <XAxis dataKey="equipment" tick={{ fontSize: 9 }} interval={0} angle={-16} textAnchor="end" height={36} />
                <YAxis tick={{ fontSize: 9 }} width={24} allowDecimals={false} />
                <Tooltip formatter={(v, n) => [n === "share" ? `${v} %` : String(v), n === "share" ? "%" : "Eventos"]} />
                <Bar dataKey="count" fill="#0e6e8c" radius={[3, 3, 0, 0]}>
                  <LabelList dataKey="share" position="top" fontSize={9} formatter={(v) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rep-slide-chart">
          <header>
            <h4>Categorías · código</h4>
            <p>Distribución por causa técnica</p>
          </header>
          <div className="rep-slide-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catChart} layout="vertical" margin={{ top: 4, right: 28, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9 }} allowDecimals={false} />
                <YAxis type="category" dataKey="code" tick={{ fontSize: 8 }} width={88} />
                <Tooltip formatter={(v, _n, item) => {
                  const row = item?.payload as (typeof catChart)[number] | undefined;
                  return [`${v} · ${row?.share ?? 0}%`, row?.label ?? ""];
                }} />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 3, 3, 0]}>
                  <LabelList dataKey="share" position="right" fontSize={9} formatter={(v) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rep-slide-chart rep-slide-chart--pairs">
          <header>
            <h4>Pares equipo–categoría</h4>
            <p>Clusters de repetición · código y %</p>
          </header>
          <div className="rep-slide-chart-body">
            {pairChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pairChart} layout="vertical" margin={{ top: 4, right: 32, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="equipment" tick={{ fontSize: 8 }} width={72} />
                  <Tooltip
                    formatter={(v, _n, item) => {
                      const row = item?.payload as (typeof pairChart)[number] | undefined;
                      return [`${v} · ${row?.share ?? 0}%`, `${row?.equipment ?? ""} · ${row?.code ?? ""}`];
                    }}
                  />
                  <Bar dataKey="count" fill="#0f766e" radius={[0, 3, 3, 0]}>
                    <LabelList dataKey="share" position="right" fontSize={9} formatter={(v) => `${v}%`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="rep-slide-empty">Sin pares equipo–categoría repetidos en el periodo.</p>
            )}
          </div>
          {topPair ? (
            <footer className="rep-slide-pair-foot">
              <span>Pico del mes</span>
              <strong>{topPair.equipment}</strong>
              <em>{topPair.category}</em>
              <b>{topPair.count} rep. · {pct(topPair.count, total)}</b>
            </footer>
          ) : null}
        </article>
      </div>

      <div className="rep-slide-tables">
        <section className="rep-slide-table-panel">
          <header>
            <h4>Equipos con repetición</h4>
            <p>{repeatedByEquipment.length} unidades · código dominante</p>
          </header>
          <div className="table-wrap ev-category-table-wrap">
            <table className="ev-category-table rep-slide-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Equipo</th>
                  <th>Código</th>
                  <th>Categoría</th>
                  <th className="ev-col-num">Evt.</th>
                  <th className="ev-col-num">%</th>
                </tr>
              </thead>
              <tbody>
                {repeatedByEquipment.slice(0, 7).map(([equipment, count], idx) => {
                  const topCat = repeatedEqCat.find((r) => r.equipment === equipment)?.category ?? "";
                  return (
                    <tr key={equipment}>
                      <td>{idx + 1}</td>
                      <td><strong>{equipment}</strong></td>
                      <td><strong>{topCat || "—"}</strong></td>
                      <td>{(CATEGORY_META[topCat]?.label ?? topCat) || "—"}</td>
                      <td className="ev-col-num">{count}</td>
                      <td className="ev-col-num">{pct(count, total)}</td>
                    </tr>
                  );
                })}
                {repeatedByEquipment.length === 0 ? (
                  <tr><td colSpan={6}>Sin equipos con repetición ≥2.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rep-slide-table-panel">
          <header>
            <h4>Categorías repetitivas</h4>
            <p>Código · eventos · % bitácora</p>
          </header>
          <div className="table-wrap ev-category-table-wrap">
            <table className="ev-category-table rep-slide-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Categoría</th>
                  <th className="ev-col-num">Evt.</th>
                  <th className="ev-col-num">%</th>
                </tr>
              </thead>
              <tbody>
                {repeatedByCategory.slice(0, 7).map(([code, count]) => (
                  <tr key={code}>
                    <td><strong>{code}</strong></td>
                    <td>{CATEGORY_META[code]?.label ?? code}</td>
                    <td className="ev-col-num">{count}</td>
                    <td className="ev-col-num">{pct(count, total)}</td>
                  </tr>
                ))}
                {repeatedByCategory.length === 0 ? (
                  <tr><td colSpan={4}>Sin categorías con recurrencia ≥2.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <p className="rep-slide-note">
        Universo de la lámina: {total} eventos consolidados a partir de {rawTotal} registros de bitácora.
        Las filas con misma fecha, tipo y causa se fusionan en un solo evento multi-unidad, así que el conteo
        por equipo es menor que el número de renglones en los que aparece esa unidad.
      </p>
    </div>
  );
}
