import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildConcertacionAnalysis,
  formatConcertacionPeriodo,
} from "./buildConcertacionAnalysis";
import type { ConcertacionSection } from "./types";
import { buildDayDetail } from "./dayDetail";
import { MaquinaDiaCard } from "./MaquinaDiaCard";
import { ScreenShell } from "../ui/ScreenShell";

const COLOR_OP = "#2bb3a3";
const COLOR_SB = "#6b9fd4";
const COLOR_PREV = "#e8b44a";
const COLOR_CORR = "#e07070";

const hours = (v: number) =>
  `${v.toLocaleString("es-CO", { maximumFractionDigits: 1 })} h`;
const hoursFmt = (v: unknown) => hours(Number(v ?? 0));
const pct = (v: number) => `${v.toFixed(1)}%`;
const kwh = (v: number) => `${Math.round(v).toLocaleString("es-CO")} kWh`;

type Props = {
  section?: ConcertacionSection;
};

function KpiCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "warn" | "bad" | "neutral";
}) {
  return (
    <article className={`conc-kpi${tone ? ` conc-kpi--${tone}` : ""}`}>
      <span className="conc-kpi-label">{label}</span>
      <strong className="conc-kpi-value">{value}</strong>
      {hint ? <small className="conc-kpi-hint">{hint}</small> : null}
    </article>
  );
}

function ResumenView() {
  const a = useMemo(() => buildConcertacionAnalysis(), []);
  const { resumenFlota: f, porDia, porCampo, meta } = a;

  const stackData = porDia.map((d) => ({
    label: d.label,
    Operación: d.horasOperacion,
    StandBy: d.horasStandBy,
    "MMT prev.": d.horasMmtPreventivo,
    "MMT corr.": d.horasMmtCorrectivo,
  }));

  const opTrend = porDia.map((d) => ({
    label: d.label,
    opPct: d.unidades > 0 ? (d.horasOperacion / (d.unidades * 24)) * 100 : 0,
    ext: d.horasParadasExternas,
  }));

  return (
    <>
      <div className="conc-kpi-grid">
        <KpiCard label="Horas operación" value={hours(f.horasOperacion)} hint={`${pct(f.pctOperacion)} del período`} tone="ok" />
        <KpiCard label="Horas stand-by" value={hours(f.horasStandBy)} hint={pct(f.pctStandBy)} />
        <KpiCard label="MMT preventivo" value={hours(f.horasMmtPreventivo)} hint={pct(f.pctPreventivo)} />
        <KpiCard label="MMT correctivo" value={hours(f.horasMmtCorrectivo)} hint={pct(f.pctCorrectivo)} />
        <KpiCard
          label="Paradas externas"
          value={hours(f.horasParadasExternas)}
          hint={`${f.registrosConParadaExt} registros · ${pct(f.pctParadasExternas)}`}
          tone={f.horasParadasExternas > 400 ? "warn" : "neutral"}
        />
        <KpiCard label="Energía generada" value={kwh(f.kwhGenerados)} hint={`${meta.diasConDatos} días · ${meta.unidades} unidades`} />
      </div>

      {f.diasFaltantes.length > 0 ? (
        <p className="conc-alert">
          Faltan {f.diasFaltantes.length} día(s) en el archivo respecto al rango solicitado:{" "}
          {f.diasFaltantes.map((d) => d.slice(8, 10) + "/" + d.slice(5, 7)).join(", ")}.
        </p>
      ) : null}

      <div className="conc-panels">
        <section className="conc-panel">
          <h3>Distribución diaria de horas (flota)</h3>
          <div className="conc-chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stackData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={hoursFmt} />
                <Legend />
                <Bar dataKey="Operación" stackId="h" fill={COLOR_OP} />
                <Bar dataKey="StandBy" stackId="h" fill={COLOR_SB} />
                <Bar dataKey="MMT prev." stackId="h" fill={COLOR_PREV} />
                <Bar dataKey="MMT corr." stackId="h" fill={COLOR_CORR} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="conc-panel">
          <h3>% operación diaria (promedio flota)</h3>
          <div className="conc-chart">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={opTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip
                  formatter={(v, name) =>
                    name === "opPct" ? pct(Number(v ?? 0)) : hoursFmt(v)
                  }
                />
                <Legend />
                <Line type="monotone" dataKey="opPct" name="% operación" stroke={COLOR_OP} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="conc-panel">
        <h3>Por campo</h3>
        <div className="table-wrap">
          <table className="conc-table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Unidades</th>
                <th>Horas operación</th>
                <th>Paradas externas</th>
                <th>% operación</th>
              </tr>
            </thead>
            <tbody>
              {porCampo.map((c) => (
                <tr key={c.campo}>
                  <td>{c.campo}</td>
                  <td>{c.unidades}</td>
                  <td>{hours(c.horasOperacion)}</td>
                  <td>{hours(c.horasParadasExternas)}</td>
                  <td>{pct(c.pctOperacion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function UnidadesView() {
  const a = useMemo(() => buildConcertacionAnalysis(), []);
  const chartData = a.porUnidad.map((u) => ({
    tag: u.tag,
    Operación: u.horasOperacion,
    StandBy: u.horasStandBy,
    "MMT prev.": u.horasMmtPreventivo,
    "MMT corr.": u.horasMmtCorrectivo,
  }));

  return (
    <>
      <div className="conc-chart conc-chart--tall">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="tag" width={56} tick={{ fontSize: 11 }} />
            <Tooltip formatter={hoursFmt} />
            <Legend />
            <Bar dataKey="Operación" stackId="u" fill={COLOR_OP} />
            <Bar dataKey="StandBy" stackId="u" fill={COLOR_SB} />
            <Bar dataKey="MMT prev." stackId="u" fill={COLOR_PREV} />
            <Bar dataKey="MMT corr." stackId="u" fill={COLOR_CORR} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-wrap">
        <table className="conc-table">
          <thead>
            <tr>
              <th>TAG</th>
              <th>Campo</th>
              <th>Días</th>
              <th>OP</th>
              <th>SB</th>
              <th>MMT P</th>
              <th>MMT C</th>
              <th>Par. ext.</th>
              <th>% OP</th>
              <th>kWh</th>
              <th>Obs.</th>
            </tr>
          </thead>
          <tbody>
            {a.porUnidad.map((u) => (
              <tr key={u.tag}>
                <td><strong>{u.tag}</strong></td>
                <td>{u.campo}</td>
                <td>{u.dias}</td>
                <td>{hours(u.horasOperacion)}</td>
                <td>{hours(u.horasStandBy)}</td>
                <td>{hours(u.horasMmtPreventivo)}</td>
                <td>{hours(u.horasMmtCorrectivo)}</td>
                <td className={u.horasParadasExternas > 50 ? "conc-warn" : undefined}>
                  {hours(u.horasParadasExternas)}
                </td>
                <td>{pct(u.pctOperacion)}</td>
                <td>{kwh(u.kwhGenerados)}</td>
                <td>{u.diasConObservacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function DiarioView() {
  const a = useMemo(() => buildConcertacionAnalysis(), []);
  const [fecha, setFecha] = useState(a.meta.fechasConDatos[a.meta.fechasConDatos.length - 1] ?? "");
  const [filtro, setFiltro] = useState<"todas" | "paro" | "plenas">("todas");

  const dia = useMemo(() => buildDayDetail(fecha), [fecha]);
  const fechas = a.meta.fechasConDatos;
  const idx = fechas.indexOf(fecha);

  const lista = useMemo(() => {
    if (!dia) return [];
    if (filtro === "paro") return dia.conParo;
    if (filtro === "plenas") return dia.sinParo;
    return dia.maquinas;
  }, [dia, filtro]);

  const prevDay = () => {
    if (idx > 0) setFecha(fechas[idx - 1]!);
  };
  const nextDay = () => {
    if (idx >= 0 && idx < fechas.length - 1) setFecha(fechas[idx + 1]!);
  };

  if (!dia) {
    return <p className="conc-alert">Sin datos para la fecha seleccionada.</p>;
  }

  return (
    <>
      <div className="conc-toolbar conc-toolbar--day">
        <div className="conc-day-nav">
          <button type="button" disabled={idx <= 0} onClick={prevDay} aria-label="Día anterior">
            ←
          </button>
          <label>
            Fecha
            <select value={fecha} onChange={(e) => setFecha(e.target.value)}>
              {fechas.map((f) => (
                <option key={f} value={f}>
                  {new Date(`${f}T12:00:00`).toLocaleDateString("es-CO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={idx < 0 || idx >= fechas.length - 1}
            onClick={nextDay}
            aria-label="Día siguiente"
          >
            →
          </button>
        </div>

        <div className="conc-seg" role="tablist" aria-label="Filtrar máquinas">
          <button type="button" className={filtro === "todas" ? "active" : undefined} onClick={() => setFiltro("todas")}>
            Todas ({dia.totalUnidades})
          </button>
          <button type="button" className={filtro === "paro" ? "active" : undefined} onClick={() => setFiltro("paro")}>
            Con paro / evento ({dia.conParo.length})
          </button>
          <button type="button" className={filtro === "plenas" ? "active" : undefined} onClick={() => setFiltro("plenas")}>
            Sin novedad ({dia.sinParo.length})
          </button>
        </div>
      </div>

      <header className="conc-day-header">
        <div>
          <h3 className="conc-day-title">{dia.label}</h3>
          <p className="conc-day-sub">{dia.weekday} · {dia.totalUnidades} máquinas reportadas</p>
        </div>
      </header>

      <div className="conc-kpi-grid conc-kpi-grid--day">
        <KpiCard
          label="Con parada externa"
          value={String(dia.conParadaExterna)}
          hint={hours(dia.horasParadasExternas) + " acumuladas"}
          tone={dia.conParadaExterna > 0 ? "warn" : "ok"}
        />
        <KpiCard
          label="En mantenimiento"
          value={String(dia.conMantenimiento)}
          hint={`${hours(dia.horasMmtPreventivo)} prev · ${hours(dia.horasMmtCorrectivo)} corr`}
        />
        <KpiCard label="Con comentario" value={String(dia.conObservacion)} hint="Observaciones en bitácora" />
        <KpiCard
          label="Operación flota"
          value={pct(dia.totalUnidades > 0 ? (dia.horasOperacion / (dia.totalUnidades * 24)) * 100 : 0)}
          hint={`${hours(dia.horasOperacion)} OP · ${kwh(dia.kwhGenerados)}`}
          tone="ok"
        />
      </div>

      {filtro === "todas" && dia.conParo.length > 0 ? (
        <section className="conc-day-section">
          <h3 className="conc-day-section-title">
            Máquinas con paro, mantenimiento u observación ({dia.conParo.length})
          </h3>
          <div className="conc-machine-list">
            {dia.conParo.map((m) => (
              <MaquinaDiaCard key={m.registro.tag} item={m} defaultOpen />
            ))}
          </div>
        </section>
      ) : null}

      {filtro === "todas" && dia.sinParo.length > 0 ? (
        <section className="conc-day-section">
          <h3 className="conc-day-section-title">Sin novedad reportada ({dia.sinParo.length})</h3>
          <div className="conc-machine-list">
            {dia.sinParo.map((m) => (
              <MaquinaDiaCard key={m.registro.tag} item={m} defaultOpen={false} />
            ))}
          </div>
        </section>
      ) : null}

      {filtro !== "todas" ? (
        <section className="conc-day-section">
          <div className="conc-machine-list">
            {lista.map((m) => (
              <MaquinaDiaCard key={m.registro.tag} item={m} defaultOpen={m.tuvoParo} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function ParadasView() {
  const a = useMemo(() => buildConcertacionAnalysis(), []);
  const [filtro, setFiltro] = useState<"paradas" | "obs">("paradas");
  const items = filtro === "paradas" ? a.paradas : a.observaciones;

  return (
    <>
      <div className="conc-toolbar">
        <div className="conc-seg" role="tablist">
          <button type="button" className={filtro === "paradas" ? "active" : undefined} onClick={() => setFiltro("paradas")}>
            Paradas externas ({a.paradas.length})
          </button>
          <button type="button" className={filtro === "obs" ? "active" : undefined} onClick={() => setFiltro("obs")}>
            Observaciones ({a.observaciones.length})
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="conc-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>TAG</th>
              <th>Campo</th>
              <th>Par. ext.</th>
              <th>OP</th>
              <th>SB</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p, i) => (
              <tr key={`${p.fecha}-${p.tag}-${i}`}>
                <td>{formatDay(p.fecha)}</td>
                <td><strong>{p.tag}</strong></td>
                <td>{p.campo ?? "—"}</td>
                <td>{p.horasParadasExternas > 0 ? `${p.horasParadasExternas} h` : "—"}</td>
                <td>{p.horasOperacion} h</td>
                <td>{p.horasStandBy} h</td>
                <td className="conc-obs">{p.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function formatDay(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ValidacionView() {
  const a = useMemo(() => buildConcertacionAnalysis(), []);
  const { validacion, resumenFlota, meta } = a;

  return (
    <>
      <div className={`conc-status ${validacion.todasOk ? "conc-status--ok" : "conc-status--warn"}`}>
        {validacion.todasOk
          ? "Todos los registros cumplen OP + SB + MMT = 24 h."
          : `${validacion.filasInvalidas.length} registro(s) con inconsistencia de balance.`}
      </div>

      <div className="conc-kpi-grid conc-kpi-grid--3">
        <KpiCard label="Registros analizados" value={String(meta.registros)} />
        <KpiCard label="Días con datos" value={`${meta.diasConDatos} / ${meta.diasEsperados}`} tone={resumenFlota.diasFaltantes.length ? "warn" : "ok"} />
        <KpiCard label="Registros con observación" value={String(resumenFlota.registrosConObs)} />
      </div>

      {resumenFlota.diasFaltantes.length > 0 ? (
        <section className="conc-panel">
          <h3>Días faltantes en el archivo</h3>
          <ul className="conc-list">
            {resumenFlota.diasFaltantes.map((d) => (
              <li key={d}>{formatDay(d)}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {validacion.filasInvalidas.length > 0 ? (
        <div className="table-wrap">
          <table className="conc-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>TAG</th>
                <th>Total</th>
                <th>Suma componentes</th>
                <th>24 h</th>
                <th>Suma OK</th>
              </tr>
            </thead>
            <tbody>
              {validacion.filasInvalidas.map((v) => (
                <tr key={`${v.fecha}-${v.tag}`}>
                  <td>{formatDay(v.fecha)}</td>
                  <td>{v.tag}</td>
                  <td>{v.totalHoras}</td>
                  <td>{v.sumaComponentes}</td>
                  <td>{v.balanceOk ? "Sí" : "No"}</td>
                  <td>{v.sumaOk ? "Sí" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <section className="conc-panel">
        <h3>Notas de concertación</h3>
        <ul className="conc-list">
          {meta.notas.map((n) => (
            <li key={n}>{n}</li>
          ))}
          <li>Fuente: {meta.fuente} · hoja «{meta.hoja}» · generado {meta.generado}</li>
        </ul>
      </section>
    </>
  );
}

const SECTION_TITLE: Record<ConcertacionSection, string> = {
  resumen: "Resumen del período",
  unidades: "Concertación por unidad",
  diario: "Detalle por día · máquina a máquina",
  paradas: "Paradas externas y observaciones",
  validacion: "Validación de balance",
};

export function ConcertacionHorasDashboard({ section = "resumen" }: Props) {
  const analysis = useMemo(() => buildConcertacionAnalysis(), []);
  const periodo = formatConcertacionPeriodo(analysis.meta);

  return (
    <ScreenShell
      report="copower"
      title="Concertación de horas"
      subtitle={`${periodo} · ${analysis.meta.diasConDatos} días · ${analysis.meta.unidades} unidades`}
    >
      <div className="exec-dashboard conc-module">
        <header className="conc-head">
          <div>
            <p className="conc-lead">
              Análisis del reporte diario de operaciones COPOWER: reconciliación de horas por estado
              (operación, stand-by, MMT preventivo/correctivo y paradas externas) para el período
              del 12 al 29 de julio de 2026.
            </p>
          </div>
          <span className="source-badge cpw">Reporte diario</span>
        </header>

        <h2 className="conc-section-title">{SECTION_TITLE[section]}</h2>

        {section === "resumen" ? <ResumenView /> : null}
        {section === "unidades" ? <UnidadesView /> : null}
        {section === "diario" ? <DiarioView /> : null}
        {section === "paradas" ? <ParadasView /> : null}
        {section === "validacion" ? <ValidacionView /> : null}
      </div>
    </ScreenShell>
  );
}
