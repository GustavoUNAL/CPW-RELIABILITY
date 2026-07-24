import {
  AlertTriangle,
  CheckCircle2,
  Package,
  PackageMinus,
  PackageSearch,
  Search,
} from "lucide-react";
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
  INVENTORY_MINIMUMS,
  type InventoryMinItem,
} from "./inventoryMinimumsData";

type Coverage = "bajo" | "en_minimo" | "ok" | "sin_existencia";

function coverageOf(item: InventoryMinItem): Coverage {
  if (item.onHand <= 0) return "sin_existencia";
  if (item.onHand < item.stockMin) return "bajo";
  if (item.onHand === item.stockMin) return "en_minimo";
  return "ok";
}

const COVERAGE_META: Record<Coverage, { label: string; color: string }> = {
  sin_existencia: { label: "Sin existencia", color: "#b91c1c" },
  bajo: { label: "Bajo mínimo", color: "#dc2626" },
  en_minimo: { label: "En mínimo", color: "#d97706" },
  ok: { label: "Sobre mínimo", color: "#16a34a" },
};

const FAMILY_COLOR: Record<string, string> = {
  J320: "#0ea5e9",
  J420: "#6366f1",
  JINAN: "#0f766e",
  MATERIALES: "#64748b",
};

function ToneBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="badge"
      style={{
        background: `color-mix(in oklab, ${color} 20%, var(--panel-soft))`,
        color,
      }}
    >
      {label}
    </span>
  );
}

type FamilyStats = {
  family: string;
  items: number;
  stockMin: number;
  onHand: number;
  sin: number;
  bajo: number;
  enMin: number;
  ok: number;
  coveragePct: number;
};

export function InventoryMinimumsDashboard() {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("Todos");
  const [coverage, setCoverage] = useState<"Todos" | Coverage>("Todos");

  const enriched = useMemo(
    () =>
      INVENTORY_MINIMUMS.items.map((item) => ({
        ...item,
        family: item.family.trim() || "Sin familia",
        coverage: coverageOf(item),
        gap: item.onHand - item.stockMin,
      })),
    [],
  );

  const byFamily = useMemo(() => {
    const map = new Map<string, FamilyStats>();
    for (const item of enriched) {
      const cur = map.get(item.family) ?? {
        family: item.family,
        items: 0,
        stockMin: 0,
        onHand: 0,
        sin: 0,
        bajo: 0,
        enMin: 0,
        ok: 0,
        coveragePct: 0,
      };
      cur.items += 1;
      cur.stockMin += item.stockMin;
      cur.onHand += item.onHand;
      if (item.coverage === "sin_existencia") cur.sin += 1;
      else if (item.coverage === "bajo") cur.bajo += 1;
      else if (item.coverage === "en_minimo") cur.enMin += 1;
      else cur.ok += 1;
      map.set(item.family, cur);
    }
    return [...map.values()]
      .map((f) => ({
        ...f,
        coveragePct: f.items ? Math.round(((f.enMin + f.ok) / f.items) * 100) : 0,
      }))
      .sort((a, b) => b.items - a.items || a.family.localeCompare(b.family, "es"));
  }, [enriched]);

  const families = useMemo(
    () => ["Todos", ...byFamily.map((f) => f.family)],
    [byFamily],
  );

  const kpis = useMemo(() => {
    const total = enriched.length;
    const sin = enriched.filter((i) => i.coverage === "sin_existencia").length;
    const bajo = enriched.filter((i) => i.coverage === "bajo").length;
    const enMin = enriched.filter((i) => i.coverage === "en_minimo").length;
    const ok = enriched.filter((i) => i.coverage === "ok").length;
    return { total, sin, bajo, enMin, ok, families: byFamily.length };
  }, [enriched, byFamily]);

  const chartData = useMemo(
    () =>
      byFamily.map((f) => ({
        family: f.family,
        "Sin existencia": f.sin,
        "Bajo mínimo": f.bajo,
        "En mínimo": f.enMin,
        "Sobre mínimo": f.ok,
      })),
    [byFamily],
  );

  const qtyChart = useMemo(
    () =>
      byFamily.map((f) => ({
        family: f.family,
        "Stock mínimo": f.stockMin,
        Existencia: f.onHand,
      })),
    [byFamily],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched
      .filter((i) => (family === "Todos" ? true : i.family === family))
      .filter((i) => (coverage === "Todos" ? true : i.coverage === coverage))
      .filter((i) => {
        if (!q) return true;
        return (
          i.description.toLowerCase().includes(q) ||
          i.partNumber.toLowerCase().includes(q) ||
          i.family.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const order: Record<Coverage, number> = {
          sin_existencia: 0,
          bajo: 1,
          en_minimo: 2,
          ok: 3,
        };
        return (
          order[a.coverage] - order[b.coverage] ||
          a.family.localeCompare(b.family) ||
          a.description.localeCompare(b.description)
        );
      });
  }, [enriched, family, coverage, query]);

  return (
    <div className="panel">
      <article className="card">
        <p className="eyebrow">Gestión de activos · Inventario</p>
        <div className="screen-shell-head">
          <h3>Mínimos de inventario</h3>
          <span className="source-badge gte">CYC</span>
        </div>

        <div className="exec-kpi-row" style={{ marginTop: "0.65rem" }}>
          <div className="exec-kpi">
            <Package size={16} />
            <span>Ítems catalogados</span>
            <strong>{kpis.total}</strong>
            <small>{kpis.families} tipos de máquina</small>
          </div>
          <div className="exec-kpi">
            <AlertTriangle size={16} />
            <span>Sin existencia</span>
            <strong style={{ color: COVERAGE_META.sin_existencia.color }}>{kpis.sin}</strong>
          </div>
          <div className="exec-kpi">
            <PackageMinus size={16} />
            <span>Bajo mínimo</span>
            <strong style={{ color: COVERAGE_META.bajo.color }}>{kpis.bajo}</strong>
          </div>
          <div className="exec-kpi">
            <PackageSearch size={16} />
            <span>En mínimo</span>
            <strong style={{ color: COVERAGE_META.en_minimo.color }}>{kpis.enMin}</strong>
          </div>
          <div className="exec-kpi">
            <CheckCircle2 size={16} />
            <span>Sobre mínimo</span>
            <strong style={{ color: COVERAGE_META.ok.color }}>{kpis.ok}</strong>
          </div>
        </div>

        <section style={{ marginTop: "0.85rem" }}>
          <h4 style={{ margin: "0 0 0.55rem" }}>Indicadores por tipo de máquina</h4>
          <div className="inv-family-grid">
            {byFamily.map((f) => {
              const active = family === f.family;
              const accent = FAMILY_COLOR[f.family] ?? "#334155";
              return (
                <button
                  key={f.family}
                  type="button"
                  className={`inv-family-card${active ? " is-active" : ""}`}
                  style={{ ["--inv-accent" as string]: accent }}
                  onClick={() => setFamily(active ? "Todos" : f.family)}
                >
                  <header>
                    <strong>{f.family}</strong>
                    <ToneBadge label={`${f.coveragePct}% cubierto`} color={accent} />
                  </header>
                  <div className="inv-family-metrics">
                    <div>
                      <span>Ítems</span>
                      <em>{f.items}</em>
                    </div>
                    <div>
                      <span>Stock mín.</span>
                      <em>{f.stockMin}</em>
                    </div>
                    <div>
                      <span>Existencia</span>
                      <em>{f.onHand}</em>
                    </div>
                    <div>
                      <span>En / sobre mín.</span>
                      <em>
                        {f.enMin + f.ok}
                        <small>/{f.items}</small>
                      </em>
                    </div>
                  </div>
                  <div className="inv-family-bar" aria-hidden>
                    <span style={{ width: `${(f.sin / f.items) * 100}%`, background: COVERAGE_META.sin_existencia.color }} />
                    <span style={{ width: `${(f.bajo / f.items) * 100}%`, background: COVERAGE_META.bajo.color }} />
                    <span style={{ width: `${(f.enMin / f.items) * 100}%`, background: COVERAGE_META.en_minimo.color }} />
                    <span style={{ width: `${(f.ok / f.items) * 100}%`, background: COVERAGE_META.ok.color }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="dash-chart-grid mso-chart-grid" style={{ marginTop: "0.85rem" }}>
          <article className="dash-chart-panel">
            <h4>Cobertura por familia</h4>
            <p className="muted dash-chart-sub">Ítems por estado de stock mínimo</p>
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                  <XAxis dataKey="family" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Sin existencia" stackId="c" fill={COVERAGE_META.sin_existencia.color} />
                  <Bar dataKey="Bajo mínimo" stackId="c" fill={COVERAGE_META.bajo.color} />
                  <Bar dataKey="En mínimo" stackId="c" fill={COVERAGE_META.en_minimo.color} />
                  <Bar dataKey="Sobre mínimo" stackId="c" fill={COVERAGE_META.ok.color} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="dash-chart-panel">
            <h4>Cantidades por familia</h4>
            <p className="muted dash-chart-sub">Suma de stock mínimo vs existencia</p>
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={qtyChart} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                  <XAxis dataKey="family" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={36} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Stock mínimo" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Existencia" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>

        <div className="inv-filters" style={{ marginTop: "0.85rem" }}>
          <label className="ev-bitacora-filter inv-search">
            <Search size={14} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar descripción, parte o familia…"
              aria-label="Buscar inventario"
            />
          </label>
          <label className="ev-bitacora-filter">
            <select
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              aria-label="Filtrar por familia"
            >
              {families.map((f) => (
                <option key={f} value={f}>
                  {f === "Todos" ? "Todas las familias" : f}
                </option>
              ))}
            </select>
          </label>
          <label className="ev-bitacora-filter">
            <select
              value={coverage}
              onChange={(e) => setCoverage(e.target.value as "Todos" | Coverage)}
              aria-label="Filtrar por cobertura"
            >
              <option value="Todos">Todas las coberturas</option>
              {(Object.keys(COVERAGE_META) as Coverage[]).map((k) => (
                <option key={k} value={k}>
                  {COVERAGE_META[k].label}
                </option>
              ))}
            </select>
          </label>
          <span className="muted" style={{ alignSelf: "center", fontSize: "0.8rem" }}>
            {rows.length} de {kpis.total}
            {family !== "Todos" ? ` · ${family}` : ""}
          </span>
        </div>

        <div className="table-wrap" style={{ marginTop: "0.65rem" }}>
          <table>
            <thead>
              <tr>
                <th>Familia</th>
                <th>Descripción</th>
                <th>N° parte</th>
                <th>Stock mínimo</th>
                <th>Existencia</th>
                <th>Gap</th>
                <th>Cobertura</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const meta = COVERAGE_META[r.coverage];
                return (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.family || "—"}</strong>
                    </td>
                    <td>{r.description}</td>
                    <td>
                      <code style={{ fontSize: "0.78rem" }}>{r.partNumber}</code>
                    </td>
                    <td>{r.stockMin}</td>
                    <td>
                      <strong style={{ color: meta.color }}>{r.onHand}</strong>
                    </td>
                    <td
                      style={{
                        color: r.gap < 0 ? "#dc2626" : r.gap === 0 ? "#d97706" : "var(--text-muted)",
                      }}
                    >
                      {r.gap > 0 ? `+${r.gap}` : r.gap}
                    </td>
                    <td>
                      <ToneBadge label={meta.label} color={meta.color} />
                    </td>
                    <td>{r.status}</td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="muted">
                    Sin ítems para el filtro actual.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
