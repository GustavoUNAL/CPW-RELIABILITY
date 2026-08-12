import { AlertTriangle, Repeat, ShieldAlert } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import type { ReportKey } from "../types";
import {
  buildEventCategoryCatalog,
  classifyReportEventCategory,
  EVENT_CATEGORIES,
  type EventCategoryCode,
} from "../events/eventCategories";
import { enrichEventLog } from "../events/eventLogUtils";
import { EventCategoryCatalogTable } from "./EventCategoryCatalogTable";
import { JUNE_2026_IMPUTABLE_EVENTS } from "./juneImputableEvents";
import { EXEC_JUN } from "./executiveJune2026";

type Mode = "repetitivos" | "badactors";

type Props = {
  report: ReportKey;
  month: string;
  monthLabel: string;
  mode: Mode;
  /** Solo KPIs + tabla top (slide de informe). */
  compact?: boolean;
  /** Sin hero propio cuando va dentro del encabezado §N. */
  embedded?: boolean;
};

type CategoryMeta = {
  label: string;
  detail: string;
};

const pct = (v: number | null | undefined, d = 1) =>
  v == null || Number.isNaN(v) ? "N/D" : `${v.toFixed(d)}%`;

function getSnap(report: ReportKey, month: string) {
  if (report === "gran_tierra") return GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  return COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ?? null;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  ...Object.fromEntries(EVENT_CATEGORIES.map((c) => [c.code, { label: c.shortLabel, detail: c.description }])),
};

function prettyEquipmentName(raw: string) {
  const v = (raw || "").trim();
  if (!v) return "Sin unidad reportada";
  if (/^parque$/i.test(v)) return "Evento de parque (sin unidad específica)";
  return v;
}

function iioBandLabel(iio: number) {
  if (iio <= 0.3) return "Bajo impacto operacional";
  if (iio <= 0.6) return "Impacto medio (seguimiento)";
  if (iio <= 0.8) return "Alto impacto (priorizar)";
  return "Impacto crítico (RCA inmediato)";
}

export function EventInsightsDashboard({
  report,
  month,
  monthLabel,
  mode,
  compact = false,
  embedded = false,
}: Props) {
  const snap = getSnap(report, month);
  if (!snap) return <p className="empty-state">Sin datos para {monthLabel} en esta fuente.</p>;

  const events = useMemo(
    () => enrichEventLog(snap.eventLog, report === "gran_tierra" ? "gran_tierra" : "copower"),
    [snap.eventLog, report],
  );
  const classifiedEvents = useMemo(
    () =>
      events.map((e, idx) => {
        const originClass = classifyReportEventCategory({
          report: report === "gran_tierra" ? "gran_tierra" : "copower",
          month,
          cause: e.cause || "",
          notes: e.notes || "",
          date: e.date,
          equipment: e.equipment || "",
        });
        const category = EVENT_CATEGORIES.find((c) => c.code === originClass.primary) ?? EVENT_CATEGORIES[0];
        return {
          id: `${report === "gran_tierra" ? "GTE" : "CPW"}-${month}-${String(idx + 1).padStart(3, "0")}`,
          date: e.date,
          equipment: prettyEquipmentName(e.equipment || "N/D"),
          eventType: e.eventType,
          responsible: e.responsible,
          description: e.notes || e.cause || "Sin descripción",
          downtimeHours: e.downtimeHours ?? 0,
          categoryCode: category.code,
          categoryLabel: category.label,
          rootCategoryCode: originClass.root,
        };
      }),
    [events, month, report],
  );
  const machine = snap.machineIndicators.filter((m) => m.unidad !== "SISTEMA N");
  const totalEvents = classifiedEvents.length;

  const eqCounts = new Map<string, number>();
  const catCounts = new Map<string, number>();
  const eqCatCounts = new Map<string, number>();

  for (const e of classifiedEvents) {
    const eq = e.equipment || "N/D";
    const cat = e.categoryCode;
    eqCounts.set(eq, (eqCounts.get(eq) ?? 0) + 1);
    catCounts.set(cat, (catCounts.get(cat) ?? 0) + 1);
    const key = `${eq}||${cat}`;
    eqCatCounts.set(key, (eqCatCounts.get(key) ?? 0) + 1);
  }

  const repeatedByEquipment = [...eqCounts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const repeatedByCategory = [...catCounts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const repeatedEqCat = [...eqCatCounts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => {
      const [equipment, category] = key.split("||");
      return { equipment, category: category as EventCategoryCode, count };
    })
    .slice(0, 12);
  const topRepeatedEquip = repeatedByEquipment
    .slice(0, 3)
    .map(([equipment]) => equipment)
    .join(" · ");
  const topRepeatedCategories = repeatedByCategory
    .slice(0, 2)
    .map(([category]) => CATEGORY_META[category]?.label ?? category)
    .join(" · ");
  const repeatedEquipmentChart = repeatedByEquipment.slice(0, 10).map(([equipment, count]) => ({
    equipment,
    count,
  }));
  const repeatedCategoryChart = repeatedByCategory.map(([category, count]) => ({
    category: CATEGORY_META[category]?.label ?? category,
    count,
  }));
  const allEventsSorted = [...classifiedEvents].sort(
    (a, b) => a.date.localeCompare(b.date) || a.equipment.localeCompare(b.equipment),
  );
  const failureClassified = classifiedEvents
    .filter((e) => e.eventType === "Falla")
    .sort((a, b) => a.equipment.localeCompare(b.equipment) || a.date.localeCompare(b.date));
  const categoryCatalog = buildEventCategoryCatalog(
    classifiedEvents.map((ev) => ev.categoryCode),
  );

  const downtimeByEquipment = classifiedEvents.reduce((acc, ev) => {
    const key = ev.equipment || "N/D";
    acc.set(key, (acc.get(key) ?? 0) + (ev.downtimeHours ?? 0));
    return acc;
  }, new Map<string, number>());

  /** Horas PF_contr oficiales por equipo (más fiable que downtime de filas consolidadas multi-unidad). */
  const pfContrByEquipment = new Map(
    (snap.generationByEquipment ?? []).map((row) => [
      prettyEquipmentName(row.equipo),
      Number(row.horasPFContr) || 0,
    ]),
  );

  const badActorBase = machine
    .filter((m) => m.fallas > 0 && !/excluida|estabilizaci/i.test(m.campo || ""))
    .map((m) => {
      const equipment = prettyEquipmentName(m.unidad);
      const dispGapPct = m.disponibilidadPct == null ? 0 : Math.max(0, 98 - m.disponibilidadPct);
      const mttrHours = m.mttrHours == null ? 0 : m.mttrHours;
      const fromPf = pfContrByEquipment.get(equipment);
      const fromEvents = downtimeByEquipment.get(equipment);
      const outageHours =
        fromPf != null && fromPf > 0
          ? fromPf
          : fromEvents != null && fromEvents > 0
            ? fromEvents
            : mttrHours * Math.max(m.fallas, 1);
      return {
        ...m,
        equipment,
        dispGapPct,
        mttrHoursScore: mttrHours,
        outageHours,
        detalle: m.detalle || "",
      };
    })
    .slice(0, 20);

  const maxFailures = Math.max(...badActorBase.map((r) => r.fallas), 1);
  const maxOutage = Math.max(...badActorBase.map((r) => r.outageHours), 1);
  const maxMttr = Math.max(...badActorBase.map((r) => r.mttrHoursScore), 1);
  const minAvailability = Math.min(
    ...badActorBase
      .map((r) => (r.disponibilidadPct == null ? null : r.disponibilidadPct))
      .filter((v): v is number => v != null),
    100,
  );
  const availabilityPenaltyDen = Math.max(0.0001, 100 - minAvailability);
  const badActors = badActorBase
    .map((row) => {
      const fn = row.fallas / maxFailures;
      const inn = row.outageHours / maxOutage;
      const rn = row.mttrHoursScore / maxMttr;
      const availability = row.disponibilidadPct == null ? 100 : row.disponibilidadPct;
      const dnRaw = (100 - availability) / availabilityPenaltyDen;
      const dn = Math.max(0, Math.min(1, dnRaw));
      const iio =
        (fn * 0.4) +
        (inn * 0.3) +
        (rn * 0.2) +
        (dn * 0.1);
      return {
        ...row,
        fn,
        inn,
        rn,
        dn,
        iio: Number(iio.toFixed(3)),
      };
    })
    .sort((a, b) => b.iio - a.iio || b.fallas - a.fallas)
    .slice(0, 12);
  const badActorsChart = badActors.slice(0, 10).map((row) => ({
    unidad: row.unidad,
    iio: row.iio,
    fallas: row.fallas,
  }));
  const badgeClass = report === "gran_tierra" ? "gte" : "cpw";
  const badgeLabel = report === "gran_tierra" ? "GTE" : "CPW";
  const topBadActorUnits = badActors.slice(0, 3).map((r) => r.unidad).join(" · ");
  const maxFailuresRow = badActors.reduce(
    (best, row) => (best == null || row.fallas > best.fallas ? row : best),
    null as (typeof badActors)[number] | null,
  );
  const maxIioRow = badActors.reduce(
    (best, row) => (best == null || row.iio > best.iio ? row : best),
    null as (typeof badActors)[number] | null,
  );
  const totalFallasPeriodo = badActors.reduce((sum, row) => sum + row.fallas, 0);
  const totalPfContrPeriodo = badActors.reduce((sum, row) => sum + row.outageHours, 0);
  const gteJuneFailures =
    report === "gran_tierra" && month === "Jun" ? JUNE_2026_IMPUTABLE_EVENTS : [];
  if (mode === "repetitivos") {
    const kpiRow = (
      <div className="exec-kpi-row">
        <div className="exec-kpi">
          <Repeat size={16} />
          <span>Eventos totales</span>
          <strong>{totalEvents}</strong>
          <small>{`Recurrencia en ${repeatedByEquipment.length} equipos`}</small>
        </div>
        <div className="exec-kpi">
          <AlertTriangle size={16} />
          <span>Equipos con repetición (≥2)</span>
          <strong>{repeatedByEquipment.length}</strong>
          <small>
            {topRepeatedEquip
              ? `Más recurrentes: ${topRepeatedEquip}`
              : "Sin equipos con recurrencia"}
          </small>
        </div>
        <div className="exec-kpi">
          <ShieldAlert size={16} />
          <span>Categorías repetitivas</span>
          <strong>{repeatedByCategory.length}</strong>
          <small>
            {topRepeatedCategories
              ? `Causas: ${topRepeatedCategories}`
              : "Sin categoría repetitiva"}
          </small>
        </div>
      </div>
    );

    if (compact) {
      return (
        <div className={embedded ? "inf-conf-embed" : "panel"}>
          <div className={embedded ? undefined : "card"}>
            {embedded ? null : (
              <>
                <p className="eyebrow">Eventos repetitivos</p>
                <div className="screen-shell-head">
                  <h3>{monthLabel}</h3>
                  <span className={`source-badge ${badgeClass}`}>{badgeLabel}</span>
                </div>
              </>
            )}
            {kpiRow}
            <div className="table-wrap" style={{ marginTop: "0.55rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Equipo</th>
                    <th>Eventos</th>
                    <th>Categoría top</th>
                  </tr>
                </thead>
                <tbody>
                  {repeatedByEquipment.slice(0, 6).map(([equipment, count], idx) => {
                    const topCat =
                      repeatedEqCat.find((r) => r.equipment === equipment)?.category ?? "";
                    return (
                      <tr key={equipment}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{equipment}</strong>
                        </td>
                        <td>{count}</td>
                        <td>{(CATEGORY_META[topCat]?.label ?? topCat) || "—"}</td>
                      </tr>
                    );
                  })}
                  {repeatedByEquipment.length === 0 ? (
                    <tr>
                      <td colSpan={4}>Sin equipos con repetición ≥2 en el periodo.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="panel">
        <article className="card">
          <p className="eyebrow">Eventos repetitivos</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.6rem" }}>
            <h3>{monthLabel}</h3>
            <span className={`source-badge ${badgeClass}`}>{badgeLabel}</span>
          </div>

          {kpiRow}

          <div className="dash-chart-grid" style={{ marginTop: "0.7rem" }}>
            <article className="dash-chart-panel">
              <h4>Top equipos repetitivos</h4>
              <p className="muted dash-chart-sub">Frecuencia de aparición en bitácora</p>
              <div className="dash-chart">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={repeatedEquipmentChart} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                    <XAxis dataKey="equipment" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={48} />
                    <YAxis tick={{ fontSize: 10 }} width={30} allowDecimals={false} />
                    <Tooltip formatter={(v) => [String(v), "Eventos"]} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="count" name="Eventos repetidos" fill="#0e6e8c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="dash-chart-panel">
              <h4>Distribución por categorías</h4>
              <p className="muted dash-chart-sub">Causas agrupadas con recurrencia</p>
              <div className="dash-chart">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={repeatedCategoryChart} layout="vertical" margin={{ top: 8, right: 10, left: 10, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={140} />
                    <Tooltip formatter={(v) => [String(v), "Eventos"]} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="count" name="Frecuencia" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>

          <div className="event-insights-grid">
            <section className="event-insights-block">
              <h4>Equipos repetitivos</h4>
              <div className="table-wrap event-insights-scroll event-insights-scroll--tall">
                <table>
                  <thead>
                    <tr>
                      <th>Equipo</th>
                      <th>Eventos repetidos</th>
                      <th>% sobre bitácora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repeatedByEquipment.length === 0 ? (
                      <tr><td colSpan={3}>Sin repetición de equipos en el periodo.</td></tr>
                    ) : repeatedByEquipment.slice(0, 10).map(([equipment, count]) => (
                      <tr key={equipment}>
                        <td>{equipment}</td>
                        <td>{count}</td>
                        <td>{pct((count / Math.max(totalEvents, 1)) * 100, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="event-insights-block">
              <h4>Categorías recurrentes</h4>
              <div className="table-wrap event-insights-scroll event-insights-scroll--tall">
                <table>
                  <thead>
                    <tr>
                      <th>Categoría de causa</th>
                      <th>Frecuencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repeatedByCategory.length === 0 ? (
                      <tr><td colSpan={2}>Sin categorías repetitivas.</td></tr>
                    ) : repeatedByCategory.map(([category, count]) => (
                      <tr key={category}>
                        <td>{CATEGORY_META[category]?.label ?? category}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <EventCategoryCatalogTable
            rows={categoryCatalog}
            totalEvents={totalEvents}
            title="Clasificación por categoría"
            subtitle={`${totalEvents} evento(s) · distribución % sobre la bitácora del periodo`}
          />

          <div className="event-insights-grid">
            <section className="event-insights-block event-insights-block--wide">
              <h4>Pares equipo-categoría más repetidos</h4>
              <div className="table-wrap event-insights-scroll event-insights-scroll--tall">
                <table>
                  <thead>
                    <tr>
                      <th>Equipo</th>
                      <th>Categoría dominante</th>
                      <th>Repeticiones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repeatedEqCat.length === 0 ? (
                      <tr><td colSpan={3}>Sin pares equipo-causa repetidos.</td></tr>
                    ) : repeatedEqCat.map((row) => (
                      <tr key={`${row.equipment}-${row.category}`}>
                        <td>{row.equipment}</td>
                        <td>{CATEGORY_META[row.category]?.label ?? row.category}</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="event-insights-block event-insights-block--wide">
              <h4>Clasificación de todos los eventos</h4>
              <div className="table-wrap event-insights-scroll event-insights-scroll--large">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Equipo</th>
                      <th>Tipo</th>
                      <th>Responsable</th>
                      <th>Categoría asignada</th>
                      <th>Causa raíz probable</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEventsSorted.length === 0 ? (
                      <tr><td colSpan={8}>Sin eventos para clasificar en el periodo.</td></tr>
                    ) : (
                      allEventsSorted.map((ev) => (
                        <tr key={ev.id}>
                          <td><strong>{ev.id}</strong></td>
                          <td>{ev.date}</td>
                          <td>{ev.equipment}</td>
                          <td>{ev.eventType}</td>
                          <td>{ev.responsible}</td>
                          <td>{CATEGORY_META[ev.categoryCode]?.label ?? ev.categoryLabel}</td>
                          <td>{ev.rootCategoryCode ? (CATEGORY_META[ev.rootCategoryCode]?.label ?? ev.rootCategoryCode) : "-"}</td>
                          <td className="detalle-cell">{ev.description}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

          </div>

          <div className="table-wrap" style={{ marginTop: "0.7rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Falla ID</th>
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>Categoría asignada</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {failureClassified.length === 0 ? (
                  <tr><td colSpan={5}>Sin eventos de tipo falla en el periodo.</td></tr>
                ) : (
                  failureClassified.map((ev) => (
                    <tr key={ev.id}>
                      <td><strong>{ev.id}</strong></td>
                      <td>{ev.date}</td>
                      <td>{ev.equipment}</td>
                      <td>{CATEGORY_META[ev.categoryCode]?.label ?? ev.categoryLabel}</td>
                      <td className="detalle-cell">{ev.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    );
  }

  const badActorKpis = (
    <div className="exec-kpi-row">
      <div className="exec-kpi">
        <ShieldAlert size={16} />
        <span>Unidades con fallas</span>
        <strong>{badActors.length}</strong>
        <small>
          {topBadActorUnits
            ? `Más impactadas: ${topBadActorUnits}`
            : "Sin unidades con fallas registradas"}
        </small>
      </div>
      <div className="exec-kpi">
        <AlertTriangle size={16} />
        <span>IIO máximo</span>
        <strong>{maxIioRow ? maxIioRow.iio.toFixed(3) : "0.000"}</strong>
        <small>
          {maxIioRow
            ? `${maxIioRow.unidad} · ${iioBandLabel(maxIioRow.iio)}`
            : "Sin registros para priorizar"}
        </small>
      </div>
      <div className="exec-kpi">
        <Repeat size={16} />
        <span>Fallas COPOWER</span>
        <strong>{totalFallasPeriodo}</strong>
        <small>
          {report === "gran_tierra" && month === "Jun"
            ? `PF_contr ${EXEC_JUN.hoursPfContr.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} h · MTTR ${EXEC_JUN.mttrHours.toFixed(2)} h`
            : maxFailuresRow
              ? `Máx. ${maxFailuresRow.unidad} (${maxFailuresRow.fallas}) · PF ${totalPfContrPeriodo.toFixed(2)} h`
              : "0 imputables en el KPI de Conf."}
        </small>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className={embedded ? "inf-conf-embed" : "panel"}>
        <div className={embedded ? undefined : "card"}>
          {embedded ? null : (
            <>
              <p className="eyebrow">Malos actores</p>
              <div className="screen-shell-head">
                <h3>{monthLabel}</h3>
                <span className={`source-badge ${badgeClass}`}>{badgeLabel}</span>
              </div>
            </>
          )}
          {badActorKpis}
          <div className="table-wrap" style={{ marginTop: "0.55rem" }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Unidad</th>
                  <th>Fallas</th>
                  <th>Disp. %</th>
                  <th>IIO</th>
                  <th>Riesgo</th>
                </tr>
              </thead>
              <tbody>
                {badActors.slice(0, 6).map((row, idx) => (
                  <tr key={row.unidad}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{row.unidad}</strong>
                    </td>
                    <td>{row.fallas}</td>
                    <td>
                      {row.disponibilidadPct == null ? "N/D" : `${row.disponibilidadPct.toFixed(1)}%`}
                    </td>
                    <td>{row.iio.toFixed(3)}</td>
                    <td>{row.riesgoTecnico}</td>
                  </tr>
                ))}
                {badActors.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      Sin malos actores por fallas tipificadas · Conf. 100 % (0 FO imputables).
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <article className="card">
        <p className="eyebrow">Malos actores</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.6rem" }}>
          <h3>{monthLabel}</h3>
          <span className={`source-badge ${badgeClass}`}>{badgeLabel}</span>
        </div>
        {badActorKpis}

        <article className="dash-chart-panel" style={{ marginTop: "0.7rem" }}>
          <h4>Top malos actores por impacto</h4>
          <p className="muted dash-chart-sub">IIO normalizado (0-1) y número de fallas por unidad · horas fuera = PF_contr</p>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={badActorsChart} margin={{ top: 8, right: 10, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="unidad" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={48} />
                <YAxis yAxisId="impacto" tick={{ fontSize: 10 }} width={36} />
                <YAxis yAxisId="fallas" orientation="right" tick={{ fontSize: 10 }} width={36} allowDecimals={false} />
                <Tooltip formatter={(v, name) => [String(v), String(name)]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="impacto" dataKey="iio" name="Índice de Impacto Operacional" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="fallas" dataKey="fallas" name="Fallas" fill="#0e6e8c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <div className="table-wrap" style={{ marginTop: "0.7rem" }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Unidad</th>
                <th>Campo</th>
                <th>Fallas</th>
                <th>Disp. %</th>
                <th>Conf. %</th>
                <th>MTBF</th>
                <th>MTTR</th>
                <th>PF_contr</th>
                <th>Riesgo</th>
                <th>IIO</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {badActors.length === 0 ? (
                <tr><td colSpan={12}>Sin unidades con fallas en el periodo.</td></tr>
              ) : badActors.map((row, idx) => (
                <tr key={row.unidad} className={row.fallas >= 3 ? "row-repeat" : undefined}>
                  <td>{idx + 1}</td>
                  <td><strong>{row.unidad}</strong></td>
                  <td>{row.campo}</td>
                  <td>{row.fallas}</td>
                  <td>{row.disponibilidadPct == null ? "N/D" : `${row.disponibilidadPct.toFixed(2)}%`}</td>
                  <td>{row.confiabilidadPct == null ? "N/D" : `${row.confiabilidadPct.toFixed(2)}%`}</td>
                  <td>{row.mtbfLabel}</td>
                  <td>{row.mttrHours == null ? "N/D" : `${row.mttrHours.toFixed(2)} h`}</td>
                  <td>{row.outageHours.toFixed(2)} h</td>
                  <td>{row.riesgoTecnico}</td>
                  <td>{row.iio.toFixed(3)}</td>
                  <td className="detalle-cell">{row.detalle || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {gteJuneFailures.length > 0 ? (
          <div className="table-wrap" style={{ marginTop: "0.7rem" }}>
            <p className="eyebrow" style={{ marginBottom: "0.35rem" }}>
              Fallas COPOWER · junio 2026 · {gteJuneFailures.length} eventos · {EXEC_JUN.hoursPfContr} h PF_contr
            </p>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>PF_contr</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                {gteJuneFailures.map((ev) => (
                  <tr key={ev.id}>
                    <td>{ev.date}</td>
                    <td><strong>{ev.equipment}</strong></td>
                    <td>{ev.hoursPfContr.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} h</td>
                    <td className="detalle-cell">{ev.observation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <article className="dash-chart-panel iio-panel" style={{ marginTop: "0.7rem" }}>
          <p className="eyebrow">IIO · Definición</p>
          <h4 style={{ marginTop: 0 }}>Índice de Impacto Operacional</h4>
          <p className="iio-formula">
            IIO = 0.40 Fn + 0.30 In + 0.20 Rn + 0.10 Dn
          </p>
          <p className="muted iio-intro">
            El IIO prioriza equipos combinando frecuencia de fallas, indisponibilidad, recuperabilidad y desempeño de
            disponibilidad en un único valor normalizado entre 0 y 1.
          </p>

          <div className="iio-def-grid">
            <article className="iio-def-card">
              <strong>Fn · Frecuencia normalizada</strong>
              <p>Fallas del equipo / máximo de fallas del periodo.</p>
              <small>Peso 40% · Señal principal de recurrencia.</small>
            </article>
            <article className="iio-def-card">
              <strong>In · Indisponibilidad normalizada</strong>
              <p>Horas PF_contr del equipo / mayor PF_contr del periodo.</p>
              <small>Peso 30% · Refleja impacto operacional directo.</small>
            </article>
            <article className="iio-def-card">
              <strong>Rn · MTTR normalizado</strong>
              <p>MTTR del equipo / MTTR máximo del periodo.</p>
              <small>Peso 20% · Captura dificultad de recuperación.</small>
            </article>
            <article className="iio-def-card">
              <strong>Dn · Disponibilidad penalizada</strong>
              <p>(100 - Disponibilidad) / (100 - Disponibilidad mínima observada).</p>
              <small>Peso 10% · Penaliza bajo desempeño relativo.</small>
            </article>
          </div>

          <div className="iio-bands">
            <span className="iio-band low">0.00-0.30 · Bajo</span>
            <span className="iio-band medium">0.31-0.60 · Medio</span>
            <span className="iio-band high">0.61-0.80 · Alto</span>
            <span className="iio-band critical">0.81-1.00 · Crítico</span>
          </div>
        </article>
        <p className="metric-glossary" role="note" style={{ marginTop: "0.55rem" }}>
          Disp. % · Disponibilidad · Conf. % · Confiabilidad · MTBF · tiempo medio entre fallas · MTTR · tiempo medio
          de reparación · PF_contr · horas de falla imputables al contratista · Riesgo · criticidad técnica · IIO ·
          índice normalizado (0–1): 40% frecuencia + 30% PF_contr + 20% MTTR + 10% disponibilidad penalizada.
        </p>
      </article>
    </div>
  );
}
