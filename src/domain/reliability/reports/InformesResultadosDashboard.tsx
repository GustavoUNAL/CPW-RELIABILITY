import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CONCERTACION_HOURS,
  getConcertacionMonth,
  type ConcertacionMonthPack,
} from "./concertacionHoursData";
import { INVENTORY_MINIMUMS } from "./inventoryMinimumsData";
import { InventoryMinimumsDashboard } from "./InventoryMinimumsDashboard";
import { GteResumen } from "./GteResumen";
import { DisponibilidadAnalisisBoard } from "./DisponibilidadAnalisisBoard";
import { DisponibilidadConciliacionSlide } from "./DisponibilidadConciliacionSlide";
import { DisponibilidadHorasBoard } from "./DisponibilidadHorasBoard";
import { ConfiabilidadAnalisisBoard } from "./ConfiabilidadAnalisisBoard";
import { ConfiabilidadConciliacionSlide } from "./ConfiabilidadConciliacionSlide";
import { DesempenoMaquinaBoard } from "./DesempenoMaquinaBoard";
import {
  ConclusionesConfiabilidadBoard,
  InformeConfContinuacion,
  InformeConfDegradacionSection,
  InformeConfFallasSection,
  InformeConfInventarioSection,
  InformeConfRepetitivosSection,
} from "./InformeConfContinuacion";
import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";

type Props = {
  leafId: string;
  month: string;
  monthLabel: string;
};

const MONTH_ORDER = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const COLORS = ["#0f766e", "#3d7ea6", "#d97706", "#b91c1c", "#64748b", "#7c3aed", "#0891b2"];

function prevMonthKey(month: string) {
  const i = MONTH_ORDER.indexOf(month);
  if (i <= 0) return null;
  return MONTH_ORDER[i - 1];
}

function fmtKwh(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)} GWh`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)} MWh`;
  return `${Math.round(v).toLocaleString("es-CO")} kWh`;
}

function fmtH(v: number) {
  return `${v.toLocaleString("es-CO", { maximumFractionDigits: 1 })} h`;
}

function fmtPct(v: number | null | undefined) {
  return v == null ? "N/D" : `${v.toFixed(2)}%`;
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="inf-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small className="muted">{hint}</small> : null}
    </article>
  );
}

function SectionShell({
  title,
  monthLabel,
  children,
}: {
  title: string;
  monthLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="dash-module exec-dashboard inf-resultados">
      <header className="exec-header dash-hero">
        <div>
          <p className="eyebrow">Informes · Resultados de Gestión</p>
          <h2>{title}</h2>
          <p className="muted">
            Periodo {monthLabel} · Horas concertadas GTE
          </p>
        </div>
        <span className="source-badge dual">Concertación</span>
      </header>
      {children}
      <p className="muted inf-source-note">
        Fuente: {CONCERTACION_HOURS.sourceFile.split("/").pop()} · extracción {CONCERTACION_HOURS.extractedAt}
      </p>
    </div>
  );
}

function EmptyMonth({ monthLabel }: { monthLabel: string }) {
  return (
    <div className="dash-module">
      <p className="empty-state">
        Sin horas concertadas cargadas para {monthLabel}. Disponible:{" "}
        {Object.keys(CONCERTACION_HOURS.months).join(", ")}.
      </p>
    </div>
  );
}

function ChartCard({
  title,
  sub,
  children,
  wide,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <article className={`dash-chart-panel${wide ? " dash-chart-panel--wide" : ""}`}>
      <h4>{title}</h4>
      {sub ? <p className="muted dash-chart-sub">{sub}</p> : null}
      <div className="dash-chart">{children}</div>
    </article>
  );
}

function UnitTable({ pack }: { pack: ConcertacionMonthPack }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Unidad</th>
            <th>Campo</th>
            <th>Comb.</th>
            <th>kWh</th>
            <th>OP</th>
            <th>SB</th>
            <th>MMT</th>
            <th>Ext.</th>
            <th>Fallas</th>
            <th>Disp.*</th>
          </tr>
        </thead>
        <tbody>
          {pack.units.map((u) => (
            <tr key={u.tag}>
              <td>
                <strong>{u.tag}</strong>
                <div className="muted" style={{ fontSize: "0.72rem" }}>
                  {u.model}
                </div>
              </td>
              <td>{u.campo}</td>
              <td>{u.fuel}</td>
              <td>{u.kwh.toLocaleString("es-CO")}</td>
              <td>{fmtH(u.op)}</td>
              <td>{fmtH(u.sb)}</td>
              <td>{fmtH(u.mmtPrev + u.mmtCorr)}</td>
              <td>{fmtH(u.ext)}</td>
              <td>{u.failures}</td>
              <td>{fmtPct(u.availabilityPct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted" style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
        * Disp. operativa = OP / (OP + SB + MMT + externas)
      </p>
    </div>
  );
}

function EventsTable({
  pack,
  filter,
}: {
  pack: ConcertacionMonthPack;
  filter?: (e: ConcertacionMonthPack["events"][number]) => boolean;
}) {
  const rows = pack.events.filter(filter ?? (() => true));
  if (!rows.length) return <p className="empty-state">Sin eventos en este filtro.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Unidad</th>
            <th>Ext. h</th>
            <th>Fallas</th>
            <th>Observación</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e, i) => (
            <tr key={`${e.date}-${e.tag}-${i}`}>
              <td>{e.date}</td>
              <td>{e.tag}</td>
              <td>{e.ext || "—"}</td>
              <td>{e.failures || "—"}</td>
              <td className="detalle-cell">{e.obs || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InformesResultadosDashboard({ leafId, month, monthLabel }: Props) {
  if (leafId === "inf-conf-resumen" || leafId.startsWith("inf-conf-")) {
    const gteMonth = (month in GRAN_TIERRA_MONTHLY_DATA ? month : "Jul") as GranTierraMonthKey;
    if (leafId === "inf-conf-conciliacion") {
      return (
        <div className="dash-module exec-dashboard inf-resultados">
          <DisponibilidadConciliacionSlide month={gteMonth} monthLabel={monthLabel} />
        </div>
      );
    }
    if (leafId === "inf-conf-confiabilidad") {
      return (
        <div className="dash-module exec-dashboard inf-resultados">
          <ConfiabilidadConciliacionSlide month={gteMonth} monthLabel={monthLabel} />
        </div>
      );
    }
    if (leafId === "inf-conf-maquinas") {
      return (
        <div className="dash-module exec-dashboard inf-resultados">
          <DesempenoMaquinaBoard month={gteMonth} monthLabel={monthLabel} />
        </div>
      );
    }
    if (leafId === "inf-conf-fallas") {
      return (
        <div className="dash-module exec-dashboard inf-resultados">
          <InformeConfFallasSection month={gteMonth} monthLabel={monthLabel} />
        </div>
      );
    }
    if (leafId === "inf-conf-repetitivos") {
      return (
        <div className="dash-module exec-dashboard inf-resultados">
          <InformeConfRepetitivosSection month={gteMonth} monthLabel={monthLabel} />
        </div>
      );
    }
    if (leafId === "inf-conf-inventario") {
      return (
        <div className="dash-module exec-dashboard inf-resultados">
          <InformeConfInventarioSection monthLabel={monthLabel} />
        </div>
      );
    }
    if (leafId === "inf-conf-degradacion") {
      return (
        <div className="dash-module exec-dashboard inf-resultados">
          <InformeConfDegradacionSection monthLabel={monthLabel} />
        </div>
      );
    }
    if (leafId === "inf-conf-conclusiones") {
      return (
        <div className="dash-module exec-dashboard inf-resultados">
          <ConclusionesConfiabilidadBoard month={gteMonth} monthLabel={monthLabel} />
        </div>
      );
    }
    return (
      <div className="dash-module exec-dashboard inf-resultados">
        <header className="exec-header dash-hero">
          <div>
            <p className="eyebrow">Informes · Confiabilidad</p>
            <h2>Indicadores sistémicos y eventos</h2>
            <p className="muted">Periodo {monthLabel} · Informe oficial Gran Tierra</p>
          </div>
          <span className="source-badge gte">GTE</span>
        </header>
        <GteResumen month={gteMonth} only={["sistemicos", "horas"]} />
        <DisponibilidadAnalisisBoard month={gteMonth} monthLabel={monthLabel} />
        <DisponibilidadHorasBoard month={gteMonth} monthLabel={monthLabel} />
        <ConfiabilidadAnalisisBoard month={gteMonth} monthLabel={monthLabel} />
        <DesempenoMaquinaBoard month={gteMonth} monthLabel={monthLabel} />
        <InformeConfContinuacion month={gteMonth} monthLabel={monthLabel} />
      </div>
    );
  }

  const pack = getConcertacionMonth(month);
  const prevKey = prevMonthKey(month);
  const prevPack = prevKey ? getConcertacionMonth(prevKey) : null;
  const title =
    leafId.replace(/^inf-rg-/, "").replace(/-/g, " ") || "Resultados";

  // Inventarios: vistas dedicadas existentes
  if (leafId === "inf-rg-inv" || leafId === "inf-rg-inv-prev") {
    return (
      <div className="dash-module exec-dashboard inf-resultados">
        <header className="exec-header dash-hero">
          <div>
            <p className="eyebrow">Informes · Resultados de Gestión</p>
            <h2>{leafId === "inf-rg-inv" ? "Inventarios" : "Inventarios · periodo anterior"}</h2>
            <p className="muted">
              {leafId === "inf-rg-inv"
                ? `Referencia del periodo ${monthLabel}`
                : `Referencia del periodo anterior (${prevKey ?? "N/D"}) · inventario vigente en plataforma`}
            </p>
          </div>
        </header>
        <InventoryMinimumsDashboard />
        <p className="muted inf-source-note">
          Catálogo: {INVENTORY_MINIMUMS.items.length} ítems · {INVENTORY_MINIMUMS.sourceFile}
        </p>
      </div>
    );
  }

  if (!pack) {
    if (
      leafId === "inf-rg-pruebas-dinamicas" ||
      leafId === "inf-rg-implementaciones" ||
      leafId === "inf-rg-cargabilidad" ||
      leafId === "inf-rg-anexo-imagenes"
    ) {
      return (
        <SectionShell title={sectionTitle(leafId)} monthLabel={monthLabel}>
          <p className="empty-state">
            Esta sección no viene en el archivo de horas concertadas. Queda reservada para anexos /
            evidencias documentales del periodo {monthLabel}.
          </p>
        </SectionShell>
      );
    }
    return <EmptyMonth monthLabel={monthLabel} />;
  }

  const t = pack.totals;
  const top5 = pack.units.slice(0, 5).map((u) => ({ tag: u.tag, kwh: u.kwh }));
  const opSb = pack.units.map((u) => ({ tag: u.tag, op: u.op, sb: u.sb }));
  const indispon = pack.units.map((u) => ({
    tag: u.tag,
    sb: u.sb,
    mmt: u.mmtPrev + u.mmtCorr,
    ext: u.ext,
  }));
  const rendimiento = pack.units.map((u) => ({
    tag: u.tag,
    kwh: u.kwh,
    kw: u.capEntKw,
    disp: u.availabilityPct ?? 0,
  }));
  const fallas = pack.units
    .filter((u) => u.failures > 0 || u.ext > 0)
    .map((u) => ({ tag: u.tag, fallas: u.failures, ext: u.ext }));
  const causas = [
    { name: "Stand-by", h: t.sb },
    { name: "MMT preventivo", h: t.mmtPrev },
    { name: "MMT correctivo", h: t.mmtCorr },
    { name: "Paradas externas", h: t.ext },
  ];
  const criticidad = pack.units
    .map((u) => ({
      tag: u.tag,
      score: Number((u.failures * 3 + u.ext * 0.15 + (u.mmtPrev + u.mmtCorr) * 0.05).toFixed(2)),
      fallas: u.failures,
      ext: u.ext,
      mmt: u.mmtPrev + u.mmtCorr,
    }))
    .sort((a, b) => b.score - a.score);
  const gas3 = CONCERTACION_HOURS.generation3m.map((r) => ({ month: r.month, kwh: r.gasKwh }));
  const diesel3 = CONCERTACION_HOURS.generation3m.map((r) => ({ month: r.month, kwh: r.dieselKwh }));
  const gasMqtUnits = pack.units.filter(
    (u) => u.fuel === "GAS" && /CPW-0[456]|COSTAYACO/i.test(`${u.tag} ${u.campo}`),
  );

  const section = leafId;

  if (section === "inf-rg-desempeno") {
    return (
      <SectionShell title="Desempeño del periodo" monthLabel={monthLabel}>
        <div className="inf-kpi-grid">
          <Kpi label="Energía" value={fmtKwh(t.kwh)} hint={`${pack.dayCount} días · ${t.units} unidades`} />
          <Kpi label="Horas operación" value={fmtH(t.op)} />
          <Kpi label="Stand-by" value={fmtH(t.sb)} />
          <Kpi label="MMT" value={fmtH(t.mmtPrev + t.mmtCorr)} />
          <Kpi label="Paradas externas" value={fmtH(t.ext)} />
          <Kpi label="Fallas" value={String(t.failures)} />
          <Kpi label="Disp. operativa" value={fmtPct(t.availabilityPct)} hint="OP / horas reportadas" />
        </div>
        <UnitTable pack={pack} />
      </SectionShell>
    );
  }

  if (section === "inf-rg-indisponibilidad") {
    return (
      <SectionShell title="Indisponibilidad" monthLabel={monthLabel}>
        <div className="inf-kpi-grid">
          <Kpi label="Horas no operación" value={fmtH(t.unavailable)} />
          <Kpi label="Stand-by" value={fmtH(t.sb)} />
          <Kpi label="Externas" value={fmtH(t.ext)} />
          <Kpi label="MMT" value={fmtH(t.mmtPrev + t.mmtCorr)} />
        </div>
        <div className="dash-chart-grid">
          <ChartCard title="Indisponibilidad por unidad" sub="SB · MMT · Externas" wide>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={indispon} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="tag" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} width={40} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sb" name="Stand-by" stackId="a" fill="#64748b" />
                <Bar dataKey="mmt" name="MMT" stackId="a" fill="#d97706" />
                <Bar dataKey="ext" name="Externas" stackId="a" fill="#b91c1c" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </SectionShell>
    );
  }

  if (section === "inf-rg-ops-rendimiento") {
    return (
      <SectionShell title="Rendimiento por unidad" monthLabel={monthLabel}>
        <div className="dash-chart-grid">
          <ChartCard title="Energía por unidad" wide>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rendimiento} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="tag" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} width={48} />
                <Tooltip formatter={(v) => [Number(v).toLocaleString("es-CO") + " kWh", "Energía"]} />
                <Bar dataKey="kwh" name="kWh" fill="#0f766e" radius={[4, 4, 0, 0]}>
                  {rendimiento.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <UnitTable pack={pack} />
      </SectionShell>
    );
  }

  if (section === "inf-rg-ops-gen-gas") {
    return (
      <SectionShell title="Generación 3 meses · Gas" monthLabel={monthLabel}>
        <div className="dash-chart-grid">
          <ChartCard title="kWh gas · May / Jun / Jul" wide>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gas3}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="month" />
                <YAxis tick={{ fontSize: 10 }} width={52} />
                <Tooltip formatter={(v) => [fmtKwh(Number(v)), "Gas"]} />
                <Bar dataKey="kwh" name="Gas" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </SectionShell>
    );
  }

  if (section === "inf-rg-ops-gen-diesel") {
    return (
      <SectionShell title="Generación 3 meses · Diésel" monthLabel={monthLabel}>
        <div className="dash-chart-grid">
          <ChartCard title="kWh diésel · May / Jun / Jul" wide>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diesel3}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="month" />
                <YAxis tick={{ fontSize: 10 }} width={52} />
                <Tooltip formatter={(v) => [fmtKwh(Number(v)), "Diésel"]} />
                <Bar dataKey="kwh" name="Diésel" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </SectionShell>
    );
  }

  if (section === "inf-rg-ops-kwh-top5") {
    return (
      <SectionShell title="kWh generados y Top 5" monthLabel={monthLabel}>
        <div className="inf-kpi-grid">
          <Kpi label="Total periodo" value={fmtKwh(t.kwh)} />
          <Kpi label="Top 1" value={top5[0] ? `${top5[0].tag} · ${fmtKwh(top5[0].kwh)}` : "N/D"} />
        </div>
        <div className="dash-chart-grid">
          <ChartCard title="Top 5 unidades" wide>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top5} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="tag" width={64} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [fmtKwh(Number(v)), "Energía"]} />
                <Bar dataKey="kwh" fill="#3d7ea6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </SectionShell>
    );
  }

  if (section === "inf-rg-ops-horas") {
    return (
      <SectionShell title="Operación vs stand-by" monthLabel={monthLabel}>
        <div className="dash-chart-grid">
          <ChartCard title="Horas OP vs SB por unidad" wide>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={opSb}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="tag" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} width={40} />
                <Tooltip />
                <Legend />
                <Bar dataKey="op" name="Operación" fill="#0f766e" />
                <Bar dataKey="sb" name="Stand-by" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </SectionShell>
    );
  }

  if (section === "inf-rg-ops-fallas") {
    return (
      <SectionShell title="Análisis de fallas" monthLabel={monthLabel}>
        <div className="inf-kpi-grid">
          <Kpi label="Fallas reportadas" value={String(t.failures)} />
          <Kpi label="Unidades con evento" value={String(fallas.length)} />
        </div>
        <div className="dash-chart-grid">
          <ChartCard title="Fallas y horas externas" wide>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fallas.length ? fallas : [{ tag: "—", fallas: 0, ext: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="tag" />
                <YAxis tick={{ fontSize: 10 }} width={40} />
                <Tooltip />
                <Legend />
                <Bar dataKey="fallas" name="Fallas" fill="#b91c1c" />
                <Bar dataKey="ext" name="Horas externas" fill="#d97706" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <EventsTable pack={pack} filter={(e) => e.failures > 0} />
      </SectionShell>
    );
  }

  if (section === "inf-rg-ops-externos") {
    return (
      <SectionShell title="Factores externos" monthLabel={monthLabel}>
        <div className="inf-kpi-grid">
          <Kpi label="Horas externas" value={fmtH(t.ext)} />
          <Kpi label="Eventos con externa" value={String(pack.events.filter((e) => e.ext > 0).length)} />
        </div>
        <EventsTable pack={pack} filter={(e) => e.ext > 0} />
      </SectionShell>
    );
  }

  if (section === "inf-rg-ops-externos-eventos") {
    return (
      <SectionShell title="Eventos externos principales" monthLabel={monthLabel}>
        <EventsTable pack={pack} filter={(e) => e.ext >= 2 || (e.obs != null && e.obs.length > 20)} />
      </SectionShell>
    );
  }

  if (section === "inf-rg-ops-maniobras") {
    return (
      <SectionShell title="Maniobras operativas" monthLabel={monthLabel}>
        <EventsTable
          pack={pack}
          filter={(e) =>
            /deslastr|maniobra|CCM|solicitud|FDL|ingresa|sale de linea|modo/i.test(e.obs ?? "")
          }
        />
      </SectionShell>
    );
  }

  if (section === "inf-rg-ops-causas") {
    return (
      <SectionShell title="Causas de indisponibilidad" monthLabel={monthLabel}>
        <div className="dash-chart-grid">
          <ChartCard title="Distribución de horas no operación" wide>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={causas}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} width={40} />
                <Tooltip formatter={(v) => [fmtH(Number(v)), "Horas"]} />
                <Bar dataKey="h" name="Horas" fill="#b91c1c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </SectionShell>
    );
  }

  if (section === "inf-rg-ops-criticidad") {
    return (
      <SectionShell title="Criticidad por equipo" monthLabel={monthLabel}>
        <p className="muted" style={{ marginBottom: "0.75rem" }}>
          Score relativo = 3×fallas + 0.15×h externas + 0.05×h MMT (prioridad operativa del periodo).
        </p>
        <div className="dash-chart-grid">
          <ChartCard title="Score de criticidad" wide>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={criticidad.slice(0, 12)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="tag" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} width={36} />
                <Tooltip />
                <Bar dataKey="score" name="Score" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Score</th>
                <th>Fallas</th>
                <th>Ext. h</th>
                <th>MMT h</th>
              </tr>
            </thead>
            <tbody>
              {criticidad.map((r) => (
                <tr key={r.tag}>
                  <td>{r.tag}</td>
                  <td>{r.score}</td>
                  <td>{r.fallas}</td>
                  <td>{r.ext}</td>
                  <td>{r.mmt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>
    );
  }

  if (section === "inf-rg-ops-acciones") {
    const actions = pack.events.filter((e) => e.failures > 0 || /correctiv|mantenimiento|solicitud/i.test(e.obs ?? ""));
    return (
      <SectionShell title="Acciones correctivas" monthLabel={monthLabel}>
        <p className="muted" style={{ marginBottom: "0.75rem" }}>
          Derivado de observaciones de fallas y mantenimientos en la concertación (no es un plan CAPA
          formal).
        </p>
        <EventsTable pack={{ ...pack, events: actions }} />
      </SectionShell>
    );
  }

  if (section === "inf-rg-anexo-gte" || section === "inf-rg-anexo-ops") {
    const anexo = prevPack;
    return (
      <SectionShell
        title={section === "inf-rg-anexo-gte" ? "Anexo resultados GTE" : "Anexo operaciones"}
        monthLabel={monthLabel}
      >
        {!anexo ? (
          <p className="empty-state">Sin datos del periodo anterior ({prevKey ?? "N/D"}).</p>
        ) : (
          <>
            <p className="muted">Resumen del periodo anterior · {prevKey}</p>
            <div className="inf-kpi-grid">
              <Kpi label="Energía" value={fmtKwh(anexo.totals.kwh)} />
              <Kpi label="OP" value={fmtH(anexo.totals.op)} />
              <Kpi label="SB" value={fmtH(anexo.totals.sb)} />
              <Kpi label="Fallas" value={String(anexo.totals.failures)} />
              <Kpi label="Disp. operativa" value={fmtPct(anexo.totals.availabilityPct)} />
            </div>
            <UnitTable pack={anexo} />
          </>
        )}
      </SectionShell>
    );
  }

  if (section === "inf-rg-gas-mqt") {
    return (
      <SectionShell title="Operación gas MQT" monthLabel={monthLabel}>
        <p className="muted" style={{ marginBottom: "0.75rem" }}>
          Unidades a gas en Costayaco (aprox. Moqueta / parque gas) según combustible primario.
        </p>
        <div className="inf-kpi-grid">
          <Kpi
            label="Energía gas Costayaco"
            value={fmtKwh(gasMqtUnits.reduce((s, u) => s + u.kwh, 0))}
          />
          <Kpi label="Unidades" value={String(gasMqtUnits.length)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Modelo</th>
                <th>kWh</th>
                <th>OP</th>
                <th>SB</th>
                <th>Ext.</th>
              </tr>
            </thead>
            <tbody>
              {gasMqtUnits.map((u) => (
                <tr key={u.tag}>
                  <td>{u.tag}</td>
                  <td>{u.model}</td>
                  <td>{u.kwh.toLocaleString("es-CO")}</td>
                  <td>{fmtH(u.op)}</td>
                  <td>{fmtH(u.sb)}</td>
                  <td>{fmtH(u.ext)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>
    );
  }

  if (
    section === "inf-rg-pruebas-dinamicas" ||
    section === "inf-rg-implementaciones" ||
    section === "inf-rg-cargabilidad" ||
    section === "inf-rg-anexo-imagenes"
  ) {
    return (
      <SectionShell title={sectionTitle(section)} monthLabel={monthLabel}>
        <p className="empty-state">
          Sin registros estructurados en horas concertadas para esta sección. Use anexos / evidencias
          del periodo {monthLabel}.
        </p>
      </SectionShell>
    );
  }

  // Default: overview for unknown / resultados root
  return (
    <SectionShell title={sectionTitle(leafId) || title} monthLabel={monthLabel}>
      <div className="inf-kpi-grid">
        <Kpi label="Energía" value={fmtKwh(t.kwh)} />
        <Kpi label="Operación" value={fmtH(t.op)} />
        <Kpi label="Stand-by" value={fmtH(t.sb)} />
        <Kpi label="Externas" value={fmtH(t.ext)} />
        <Kpi label="Fallas" value={String(t.failures)} />
        <Kpi label="Disp. operativa" value={fmtPct(t.availabilityPct)} />
      </div>
      <UnitTable pack={pack} />
    </SectionShell>
  );
}

function sectionTitle(leafId: string) {
  const map: Record<string, string> = {
    "inf-rg-indisponibilidad": "Indisponibilidad",
    "inf-rg-desempeno": "Desempeño del periodo",
    "inf-rg-ops-rendimiento": "Rendimiento por unidad",
    "inf-rg-ops-gen-gas": "Generación 3 meses · Gas",
    "inf-rg-ops-gen-diesel": "Generación 3 meses · Diésel",
    "inf-rg-ops-kwh-top5": "kWh generados y Top 5",
    "inf-rg-ops-horas": "Operación vs stand-by",
    "inf-rg-ops-fallas": "Análisis de fallas",
    "inf-rg-ops-externos": "Factores externos",
    "inf-rg-ops-externos-eventos": "Eventos externos principales",
    "inf-rg-ops-maniobras": "Maniobras operativas",
    "inf-rg-ops-causas": "Causas de indisponibilidad",
    "inf-rg-ops-criticidad": "Criticidad por equipo",
    "inf-rg-ops-acciones": "Acciones correctivas",
    "inf-rg-anexo-gte": "Anexo resultados GTE",
    "inf-rg-anexo-ops": "Anexo operaciones",
    "inf-rg-anexo-imagenes": "Anexo imágenes",
    "inf-rg-gas-mqt": "Operación gas MQT",
    "inf-rg-pruebas-dinamicas": "Pruebas dinámicas",
    "inf-rg-implementaciones": "Implementaciones",
    "inf-rg-cargabilidad": "Prueba de cargabilidad",
  };
  return map[leafId] ?? "Resultados de Gestión";
}
