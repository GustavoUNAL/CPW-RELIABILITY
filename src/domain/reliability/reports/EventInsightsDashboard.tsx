import { AlertTriangle, Repeat, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
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

type Mode = "repetitivos" | "badactors";

type Props = {
  report: ReportKey;
  month: string;
  monthLabel: string;
  mode: Mode;
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

function normalizeCauseCategory(text: string) {
  const t = text.toLowerCase();
  if (!t.trim()) return "Registro operativo general";
  if (/(parque|varias unidades|m[uú]ltiples|fdl generaci[oó]n)/.test(t)) return "Evento transversal de parque";
  if (/(mru|ngl|gas|presi[oó]n de gas|quincy|chiller|secuestrante)/.test(t)) return "Gas/MRU/Tratamiento";
  if (/(red|reconectador|volt|frecuencia|tablero|c9|rx|el[eé]ctr|magneti)/.test(t)) return "Red/Eléctrico";
  if (/(deton|admisi[oó]n|vibraci[oó]n|turbina|sobrecarga|potencia inversa|gobernaci[oó]n|intercooler)/.test(t))
    return "Equipo mecánico/control";
  if (/(mantenimiento|parada manual|planificado|cyc)/.test(t)) return "Operación/Mantenimiento";
  return "Evento operativo sin clasificar";
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  "Evento transversal de parque": {
    label: "Transversal de parque",
    detail: "Eventos que afectan múltiples unidades o el parque completo.",
  },
  "Gas/MRU/Tratamiento": {
    label: "Gas/MRU",
    detail: "Eventos por suministro o tratamiento de gas (MRU, NGL, presión).",
  },
  "Red/Eléctrico": {
    label: "Red/Eléctrico",
    detail: "Eventos por red, reconectadores, protecciones y auxiliares eléctricos.",
  },
  "Equipo mecánico/control": {
    label: "Equipo/Control",
    detail: "Fallas intrínsecas de equipos: detonación, admisión, gobernación, turbo.",
  },
  "Operación/Mantenimiento": {
    label: "Operación/Mto",
    detail: "Paradas operativas o de mantenimiento planificado/correctivo.",
  },
  "Registro operativo general": {
    label: "Registro general",
    detail: "Registro sin detalle técnico suficiente para clasificar causa raíz.",
  },
  "Evento operativo sin clasificar": {
    label: "Sin clasificar",
    detail: "Evento con observación insuficiente o ambigua para categoría técnica.",
  },
};

function prettyEquipmentName(raw: string) {
  const v = (raw || "").trim();
  if (!v) return "Sin unidad reportada";
  if (/^parque$/i.test(v)) return "Evento de parque (sin unidad específica)";
  return v;
}

export function EventInsightsDashboard({ report, month, monthLabel, mode }: Props) {
  const snap = getSnap(report, month);
  if (!snap) return <p className="empty-state">Sin datos para {monthLabel} en esta fuente.</p>;
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);

  const events = snap.eventLog;
  const classifiedEvents = useMemo(
    () =>
      events.map((e, idx) => {
        const category = normalizeCauseCategory(e.notes || e.cause || "");
        return {
          id: `${report === "gran_tierra" ? "GTE" : "CPW"}-${month}-${String(idx + 1).padStart(3, "0")}`,
          date: e.date,
          equipment: prettyEquipmentName(e.equipment || "N/D"),
          eventType: e.eventType,
          responsible: e.responsible,
          description: e.notes || e.cause || "Sin descripción",
          category,
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
    const cat = e.category;
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
      return { equipment, category, count };
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
  const categoriesRanked = [...catCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([category, count], index) => ({
      rank: index + 1,
      category,
      count,
      share: (count / Math.max(totalEvents, 1)) * 100,
      label: CATEGORY_META[category]?.label ?? category,
      detail: CATEGORY_META[category]?.detail ?? "Categoría operativa.",
    }));
  const groupedByCategory = categoriesRanked.map((item) => ({
    ...item,
    events: classifiedEvents
      .filter((ev) => ev.category === item.category)
      .sort((a, b) => a.equipment.localeCompare(b.equipment) || a.date.localeCompare(b.date)),
  }));

  const badActors = machine
    .filter((m) => m.fallas > 0)
    .map((m) => {
      const dispPenalty = m.disponibilidadPct == null ? 0 : Math.max(0, 98 - m.disponibilidadPct);
      const mttrPenalty = m.mttrHours == null ? 0 : m.mttrHours;
      const score = m.fallas * 10 + dispPenalty * 2 + mttrPenalty;
      return { ...m, score };
    })
    .sort((a, b) => b.score - a.score || b.fallas - a.fallas)
    .slice(0, 12);
  const badActorsChart = badActors.slice(0, 10).map((row) => ({
    unidad: row.unidad,
    score: Number(row.score.toFixed(2)),
    fallas: row.fallas,
  }));

  if (mode === "repetitivos") {
    return (
      <div className="panel">
        <article className="card">
          <p className="eyebrow">Eventos repetitivos</p>
          <h3>{monthLabel} · {report === "gran_tierra" ? "Gran Tierra" : "COPOWER"}</h3>
          <button type="button" className="open-popup-btn" onClick={() => setShowCategoryPopup(true)}>
            Ver categorías dominantes
          </button>
          <div className="exec-kpi-row">
            <div className="exec-kpi">
              <Repeat size={16} />
              <span>Eventos totales</span>
              <strong>{totalEvents}</strong>
              <small>{`Se detecta recurrencia en ${repeatedByEquipment.length} equipos del periodo`}</small>
            </div>
            <div className="exec-kpi">
              <AlertTriangle size={16} />
              <span>Equipos con repetición (&gt;=2)</span>
              <strong>{repeatedByEquipment.length}</strong>
              <small>
                {topRepeatedEquip
                  ? `Más recurrentes: ${topRepeatedEquip}`
                  : "Sin equipos con recurrencia en este mes"}
              </small>
            </div>
            <div className="exec-kpi">
              <ShieldAlert size={16} />
              <span>Categorías repetitivas</span>
              <strong>{repeatedByCategory.length}</strong>
              <small>
                {topRepeatedCategories
                  ? `Causas dominantes: ${topRepeatedCategories}`
                  : "Sin categoría repetitiva en este mes"}
              </small>
            </div>
          </div>

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

          <div className="table-wrap" style={{ marginTop: "0.7rem" }}>
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

          <div className="table-wrap" style={{ marginTop: "0.7rem" }}>
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

          <div className="table-wrap" style={{ marginTop: "0.7rem" }}>
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

          <div className="table-wrap" style={{ marginTop: "0.7rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Prioridad</th>
                  <th>Categoría</th>
                  <th>Evento ID</th>
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>Tipo</th>
                  <th>Responsable</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {groupedByCategory.length === 0 ? (
                  <tr><td colSpan={8}>Sin eventos para clasificar en el periodo.</td></tr>
                ) : (
                  groupedByCategory.flatMap((group) =>
                    group.events.map((ev, index) => (
                      <tr key={ev.id}>
                        <td>{index === 0 ? `#${group.rank}` : ""}</td>
                        <td>{index === 0 ? `${group.label} (${group.count})` : "↳"}</td>
                        <td><strong>{ev.id}</strong></td>
                        <td>{ev.date}</td>
                        <td>{ev.equipment}</td>
                        <td>{ev.eventType}</td>
                        <td>{ev.responsible}</td>
                        <td className="detalle-cell">{ev.description}</td>
                      </tr>
                    )),
                  )
                )}
              </tbody>
            </table>
          </div>

          {showCategoryPopup ? (
            <div className="modal-overlay" role="dialog" aria-modal="true">
              <article className="modal-card">
                <header className="modal-header">
                  <h3>Categorías dominantes del periodo</h3>
                  <button type="button" className="open-popup-btn" onClick={() => setShowCategoryPopup(false)}>
                    Cerrar
                  </button>
                </header>
                <div className="table-wrap" style={{ marginTop: "0.75rem" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Ranking</th>
                        <th>Categoría</th>
                        <th>Eventos</th>
                        <th>% del total</th>
                        <th>Interpretación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoriesRanked.map((cat) => (
                        <tr key={cat.category}>
                          <td>#{cat.rank}</td>
                          <td><strong>{cat.label}</strong></td>
                          <td>{cat.count}</td>
                          <td>{pct(cat.share, 2)}</td>
                          <td>{cat.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          ) : null}
        </article>
      </div>
    );
  }

  return (
    <div className="panel">
      <article className="card">
        <p className="eyebrow">Malos actores</p>
        <h3>{monthLabel} · {report === "gran_tierra" ? "Gran Tierra" : "COPOWER"}</h3>
        <div className="exec-kpi-row">
          <div className="exec-kpi">
            <ShieldAlert size={16} />
            <span>Unidades con fallas</span>
            <strong>{badActors.length}</strong>
          </div>
          <div className="exec-kpi">
            <AlertTriangle size={16} />
            <span>Fallas acumuladas (top)</span>
            <strong>{badActors.reduce((sum, row) => sum + row.fallas, 0)}</strong>
          </div>
        </div>

        <article className="dash-chart-panel" style={{ marginTop: "0.7rem" }}>
          <h4>Top malos actores por impacto</h4>
          <p className="muted dash-chart-sub">Score de impacto y número de fallas por unidad</p>
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={badActorsChart} margin={{ top: 8, right: 10, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="unidad" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={48} />
                <YAxis yAxisId="impacto" tick={{ fontSize: 10 }} width={36} />
                <YAxis yAxisId="fallas" orientation="right" tick={{ fontSize: 10 }} width={36} allowDecimals={false} />
                <Tooltip formatter={(v, name) => [String(v), String(name)]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="impacto" dataKey="score" name="Score impacto" fill="#ef4444" radius={[4, 4, 0, 0]} />
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
                <th>Riesgo</th>
                <th>Score impacto</th>
              </tr>
            </thead>
            <tbody>
              {badActors.length === 0 ? (
                <tr><td colSpan={10}>Sin unidades con fallas en el periodo.</td></tr>
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
                  <td>{row.riesgoTecnico}</td>
                  <td>{row.score.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
