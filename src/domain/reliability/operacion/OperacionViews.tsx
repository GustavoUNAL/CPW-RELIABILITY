import { useMemo } from "react";
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
import { loadOperacionPack } from "./api";
import { DisponibilidadBar } from "./components/DisponibilidadBar";
import { EquipoStatusBadge } from "./components/EquipoStatusBadge";
import { FiltrosFecha } from "./components/FiltrosFecha";
import { EQUIPO_BY_ID, ESTADO_COLOR } from "./constants";
import { EficienciaView } from "./EficienciaView";
import { fmtHeatRate, fmtHours, fmtKw, fmtMwh, fmtNum, fmtPct } from "./format";
import {
  cargaDiariaTotal,
  disponibilidadByEquipo,
  filterResumen,
  kpisFromResumen,
} from "./kpis";
import type { Equipo, OperacionFilters } from "./types";

export type OperacionSection =
  | "dashboard"
  | "equipos"
  | "eficiencia"
  | "detalle"
  | "resumen"
  | "eventos"
  | "actividades"
  | "consumos";

type Props = {
  section: OperacionSection;
  equipoId?: string;
  filters: OperacionFilters;
  onFiltersChange: (next: OperacionFilters) => void;
  onSelectEquipo?: (id: string) => void;
  equiposCatalog?: Equipo[];
};

export function OperacionViews({
  section,
  equipoId,
  filters,
  onFiltersChange,
  onSelectEquipo,
  equiposCatalog,
}: Props) {
  const pack = useMemo(() => loadOperacionPack(), []);
  const resumen = useMemo(() => filterResumen(pack.resumenDiario, filters), [pack, filters]);
  const kpis = useMemo(() => kpisFromResumen(resumen), [resumen]);
  const byEq = useMemo(() => disponibilidadByEquipo(resumen), [resumen]);
  const carga = useMemo(() => cargaDiariaTotal(resumen), [resumen]);

  const eventos = useMemo(
    () =>
      pack.eventos
        .filter((e) => e.fecha >= filters.from && e.fecha <= filters.to)
        .filter((e) => {
          if (filters.equipoId !== "Todos") return e.equipoId === filters.equipoId;
          if (filters.planta === "Todas") return true;
          if (!e.equipoId) return true;
          return EQUIPO_BY_ID[e.equipoId]?.planta === filters.planta;
        })
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
        .slice(0, section === "dashboard" ? 8 : 200),
    [pack.eventos, filters, section],
  );

  const consumosByEq = useMemo(() => {
    const map = new Map<string, { aceite: number; cambio: number; coolant: number }>();
    for (const c of pack.consumos) {
      const mesOk = c.mes >= filters.from.slice(0, 7) && c.mes <= filters.to.slice(0, 7);
      if (!mesOk) continue;
      if (filters.equipoId !== "Todos" && c.equipoId !== filters.equipoId) continue;
      if (filters.planta !== "Todas") {
        const eq = EQUIPO_BY_ID[c.equipoId];
        if (!eq || eq.planta !== filters.planta) continue;
      }
      const prev = map.get(c.equipoId) ?? { aceite: 0, cambio: 0, coolant: 0 };
      prev.aceite += c.adicionAceite;
      prev.cambio += c.cambioAceite;
      prev.coolant += c.adicionCoolant;
      map.set(c.equipoId, prev);
    }
    return map;
  }, [pack.consumos, filters]);

  const eventosByEq = useMemo(() => {
    const map = new Map<string, { n: number; minFuera: number }>();
    for (const e of pack.eventos) {
      if (e.fecha < filters.from || e.fecha > filters.to || !e.equipoId) continue;
      if (filters.equipoId !== "Todos" && e.equipoId !== filters.equipoId) continue;
      if (filters.planta !== "Todas" && EQUIPO_BY_ID[e.equipoId]?.planta !== filters.planta) continue;
      const prev = map.get(e.equipoId) ?? { n: 0, minFuera: 0 };
      prev.n += 1;
      prev.minFuera += e.tiempoFueraMin ?? 0;
      map.set(e.equipoId, prev);
    }
    return map;
  }, [pack.eventos, filters]);

  const maquinaLabel =
    filters.equipoId !== "Todos"
      ? EQUIPO_BY_ID[filters.equipoId]?.label ?? filters.equipoId
      : null;

  const header = (
    <header className="op-ops-header">
      <div>
        <p className="eyebrow">Operación · Costayaco / Vonú / Conejo</p>
        <h3>
          {section === "dashboard" && "Dashboard de operación"}
          {section === "equipos" && "Equipos"}
          {section === "eficiencia" && "Eficiencia"}
          {section === "detalle" && `Detalle · ${equipoId ?? maquinaLabel ?? ""}`}
          {section === "resumen" && "Resumen diario (Resumen OP)"}
          {section === "eventos" && "Eventos de generación"}
          {section === "actividades" && "Actividades diarias"}
          {section === "consumos" && "Consumos aceite / coolant"}
        </h3>
        <p className="muted">
          Fuente {pack.sourceFile} · {pack.dateRange.min} → {pack.dateRange.max}
          {maquinaLabel ? ` · Máquina ${maquinaLabel}` : ""}
        </p>
      </div>
      <FiltrosFecha
        filters={filters}
        onChange={onFiltersChange}
        dateMin={pack.dateRange.min}
        dateMax={pack.dateRange.max}
        equiposConDatos={equiposCatalog}
      />
    </header>
  );

  const maquinaChips =
    section === "equipos" || section === "dashboard" ? (
      <div className="op-maquina-chips" role="listbox" aria-label="Filtrar por máquina">
        <button
          type="button"
          className={filters.equipoId === "Todos" ? "active" : undefined}
          onClick={() => onFiltersChange({ ...filters, equipoId: "Todos" })}
        >
          Todas
        </button>
        {(equiposCatalog ?? Object.values(EQUIPO_BY_ID))
          .filter((eq) => filters.planta === "Todas" || eq.planta === filters.planta)
          .filter((eq) => eq.planta !== "Conejo" || section === "equipos")
          .map((eq) => (
            <button
              type="button"
              key={eq.id}
              className={filters.equipoId === eq.id ? "active" : undefined}
              onClick={() => onFiltersChange({ ...filters, equipoId: eq.id })}
            >
              {eq.label}
            </button>
          ))}
      </div>
    ) : null;

  if (section === "dashboard") {
    return (
      <div className="panel op-ops">
        <article className="card">
          {header}
          {maquinaChips}
          <div className="op-ops-kpi-grid">
            <article className="op-ops-kpi">
              <span>Disponibilidad</span>
              <strong>{fmtPct(kpis.disponibilidadPct)}</strong>
              <small>OP / (OP+SB+PE+MTO+FS)</small>
            </article>
            <article className="op-ops-kpi">
              <span>Energía</span>
              <strong>{fmtMwh(kpis.energiaMwh)}</strong>
              <small>Suma kWh del rango</small>
            </article>
            <article className="op-ops-kpi">
              <span>En línea</span>
              <strong>
                {kpis.equiposOnline}/{kpis.equiposTotal}
              </strong>
              <small>Equipos con OP &gt; 0 (último día)</small>
            </article>
            <article className="op-ops-kpi">
              <span>Eventos</span>
              <strong>{eventos.length}</strong>
              <small>En el rango filtrado</small>
            </article>
            <article className="op-ops-kpi">
              <span>Heat rate</span>
              <strong>{fmtHeatRate(kpis.heatRateFt3Kwh)}</strong>
              <small>Promedio ft³/kWh</small>
            </article>
            <article className="op-ops-kpi">
              <span>MTO / FS</span>
              <strong>
                {fmtHours(kpis.horasMto)} / {fmtHours(kpis.horasFs)}
              </strong>
              <small>Horas del período</small>
            </article>
          </div>

          <div className="op-ops-grid-2">
            <section>
              <h4>Disponibilidad por equipo</h4>
              <div className="op-eq-bars">
                {byEq.slice(0, 16).map((e) => (
                  <button
                    type="button"
                    key={e.equipoId}
                    className="op-eq-bar-row"
                    onClick={() => onSelectEquipo?.(e.equipoId)}
                  >
                    <span className="op-eq-bar-label">{e.label}</span>
                    <DisponibilidadBar horas={e} />
                    <strong>{fmtPct(e.disponibilidadPct, 1)}</strong>
                  </button>
                ))}
              </div>
              <div className="op-legend">
                {(["OP", "SB", "PE", "MTO", "FS"] as const).map((k) => (
                  <span key={k}>
                    <i style={{ background: ESTADO_COLOR[k] }} /> {k}
                  </span>
                ))}
              </div>
            </section>
            <section>
              <h4>Carga total diaria (kW promedio)</h4>
              <div className="dash-chart">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={carga}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10 }} hide={carga.length > 40} />
                    <YAxis tick={{ fontSize: 10 }} width={48} />
                    <Tooltip />
                    <Line type="monotone" dataKey="kw" name="kW" stroke="#0e6e8c" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <section style={{ marginTop: "1rem" }}>
            <h4>Eventos recientes</h4>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th>Equipo</th>
                    <th>Descripción</th>
                    <th>Fuera (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((e) => (
                    <tr key={e.id}>
                      <td>{e.fecha}</td>
                      <td>{e.turno}</td>
                      <td>{e.equipoId ?? "—"}</td>
                      <td className="detalle-cell">{e.descripcion}</td>
                      <td>{e.tiempoFueraMin ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </article>
      </div>
    );
  }

  if (section === "eficiencia") {
    return <EficienciaView resumen={resumen} header={header} />;
  }

  if (section === "equipos") {
    return (
      <div className="panel op-ops">
        <article className="card">
          {header}
          {maquinaChips}
          {byEq.length === 0 ? (
            <p className="empty-state">
              No hay equipos para el filtro actual
              {maquinaLabel ? ` (${maquinaLabel})` : ""}. Amplíe fechas o elija otra máquina.
            </p>
          ) : (
            <>
              <p className="muted" style={{ marginBottom: "0.65rem" }}>
                Portafolio del período · click en una fila para ver series horarias del equipo
              </p>
              <div className="table-wrap op-equipo-table-wrap">
                <table className="op-equipo-table">
                  <thead>
                    <tr>
                      <th>Máquina</th>
                      <th>Planta</th>
                      <th>Estado</th>
                      <th>Disp. %</th>
                      <th>Perfil horas</th>
                      <th>OP</th>
                      <th>SB</th>
                      <th>PE</th>
                      <th>MTO</th>
                      <th>FS</th>
                      <th>TR</th>
                      <th>Energía</th>
                      <th>kW prom</th>
                      <th>Factor carga</th>
                      <th>Gas Mscfd</th>
                      <th>ft³/kWh</th>
                      <th>Aceite</th>
                      <th>Cambio</th>
                      <th>Coolant</th>
                      <th>Eventos</th>
                      <th>Fuera (min)</th>
                      <th>Días</th>
                      <th>Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byEq.map((e) => {
                      const cons = consumosByEq.get(e.equipoId);
                      const ev = eventosByEq.get(e.equipoId);
                      return (
                        <tr
                          key={e.equipoId}
                          className="op-equipo-row"
                          onClick={() => onSelectEquipo?.(e.equipoId)}
                        >
                          <td>
                            <strong>{e.label}</strong>
                            <div className="muted" style={{ fontSize: "0.7rem" }}>
                              {e.equipoId}
                            </div>
                          </td>
                          <td>{e.planta}</td>
                          <td>
                            <EquipoStatusBadge estado={e.estado} />
                          </td>
                          <td>
                            <strong>{fmtPct(e.disponibilidadPct, 1)}</strong>
                          </td>
                          <td style={{ minWidth: "7rem" }}>
                            <DisponibilidadBar horas={e} height={12} />
                          </td>
                          <td>{fmtNum(e.op, 1)}</td>
                          <td>{fmtNum(e.sb, 1)}</td>
                          <td>{fmtNum(e.pe, 1)}</td>
                          <td>{fmtNum(e.mto, 1)}</td>
                          <td>{fmtNum(e.fs, 1)}</td>
                          <td>{fmtNum(e.tr, 1)}</td>
                          <td>
                            <strong>{fmtMwh(e.energiaMwh)}</strong>
                            <div className="muted" style={{ fontSize: "0.68rem" }}>
                              {fmtNum(e.energiaKwh, 0)} kWh
                            </div>
                          </td>
                          <td>{fmtKw(e.kwPromedio)}</td>
                          <td>{fmtPct(e.factorCargaPct, 1)}</td>
                          <td>{e.gasMscfd == null ? "—" : fmtNum(e.gasMscfd, 1)}</td>
                          <td>{fmtHeatRate(e.heatRateFt3Kwh)}</td>
                          <td>{cons ? fmtNum(cons.aceite, 1) : "—"}</td>
                          <td>{cons ? fmtNum(cons.cambio, 1) : "—"}</td>
                          <td>{cons ? fmtNum(cons.coolant, 1) : "—"}</td>
                          <td>{ev?.n ?? 0}</td>
                          <td>{ev ? fmtNum(ev.minFuera, 0) : "—"}</td>
                          <td>{e.dias}</td>
                          <td>
                            {fmtKw(e.kwNominal)}
                            <div className="muted" style={{ fontSize: "0.68rem" }}>
                              {e.combustible}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="op-legend" style={{ marginTop: "0.75rem" }}>
                {(["OP", "SB", "PE", "MTO", "FS"] as const).map((k) => (
                  <span key={k}>
                    <i style={{ background: ESTADO_COLOR[k] }} /> {k}
                  </span>
                ))}
              </div>
            </>
          )}
        </article>
      </div>
    );
  }

  if (section === "detalle") {
    const id = equipoId && equipoId !== "Todos" ? equipoId : filters.equipoId !== "Todos" ? filters.equipoId : undefined;
    const hourly = id ? pack.hourlyRecent[id] ?? [] : [];
    const series = hourly.map((h) => ({
      t: `${h.fecha.slice(5)} ${String(h.hora).padStart(2, "0")}:00`,
      kw: h.kw,
      hz: h.hz,
      fp: h.fp,
      eff: h.effPct,
      gas: h.consumoGasFt3Kwh,
    }));
    return (
      <div className="panel op-ops">
        <article className="card">
          {header}
          {!id || id === "Todos" ? (
            <p className="empty-state">Seleccione un equipo en Equipos o en el filtro.</p>
          ) : series.length === 0 ? (
            <p className="empty-state">Sin series horarias recientes para {id}.</p>
          ) : (
            <>
              <div className="op-ops-grid-2">
                <section>
                  <h4>kW · últimas ~2 semanas</h4>
                  <div className="dash-chart">
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={series}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                        <XAxis dataKey="t" hide />
                        <YAxis tick={{ fontSize: 10 }} width={40} />
                        <Tooltip />
                        <Line type="monotone" dataKey="kw" stroke="#0e6e8c" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
                <section>
                  <h4>Hz / FP / Eff</h4>
                  <div className="dash-chart">
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={series}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                        <XAxis dataKey="t" hide />
                        <YAxis tick={{ fontSize: 10 }} width={40} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="hz" stroke="#2563eb" strokeWidth={1.2} dot={false} />
                        <Line type="monotone" dataKey="fp" stroke="#16a34a" strokeWidth={1.2} dot={false} />
                        <Line type="monotone" dataKey="eff" stroke="#ea580c" strokeWidth={1.2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>
              <section style={{ marginTop: "0.85rem" }}>
                <h4>Eventos del equipo</h4>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Turno</th>
                        <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pack.eventos
                        .filter((e) => e.equipoId === id)
                        .slice(0, 40)
                        .map((e) => (
                          <tr key={e.id}>
                            <td>{e.fecha}</td>
                            <td>{e.turno}</td>
                            <td className="detalle-cell">{e.descripcion}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </article>
      </div>
    );
  }

  if (section === "resumen") {
    return (
      <div className="panel op-ops">
        <article className="card">
          {header}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>OP</th>
                  <th>SB</th>
                  <th>PE</th>
                  <th>MTO</th>
                  <th>FS</th>
                  <th>kWh día</th>
                  <th>kW prom</th>
                  <th>ft³/kWh</th>
                </tr>
              </thead>
              <tbody>
                {resumen.slice(0, 500).map((r) => (
                  <tr key={`${r.fecha}-${r.equipoId}`}>
                    <td>{r.fecha}</td>
                    <td>{r.equipoId}</td>
                    <td>{fmtNum(r.op, 0)}</td>
                    <td>{fmtNum(r.sb, 0)}</td>
                    <td>{fmtNum(r.pe, 0)}</td>
                    <td>{fmtNum(r.mto, 0)}</td>
                    <td>{fmtNum(r.fs, 0)}</td>
                    <td>{fmtNum(r.kwAcumuladoDia, 0)}</td>
                    <td>{fmtNum(r.kwPromedioDia, 0)}</td>
                    <td>{fmtNum(r.consumoGasFt3Kwh, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {resumen.length > 500 ? (
            <p className="muted" style={{ marginTop: "0.5rem" }}>
              Mostrando 500 de {resumen.length} filas · estreche el rango de fechas.
            </p>
          ) : null}
        </article>
      </div>
    );
  }

  if (section === "eventos") {
    return (
      <div className="panel op-ops">
        <article className="card">
          {header}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Turno</th>
                  <th>Equipo</th>
                  <th>Descripción</th>
                  <th>Fuera (min)</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((e) => (
                  <tr key={e.id}>
                    <td>{e.fecha}</td>
                    <td>{e.hora ?? "—"}</td>
                    <td>{e.turno}</td>
                    <td>{e.equipoId ?? "—"}</td>
                    <td className="detalle-cell">{e.descripcion}</td>
                    <td>{e.tiempoFueraMin ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    );
  }

  if (section === "actividades") {
    const acts = pack.actividades.filter((a) => a.fecha >= filters.from && a.fecha <= filters.to);
    return (
      <div className="panel op-ops">
        <article className="card">
          {header}
          {acts.length === 0 ? (
            <p className="empty-state">
              Bitácora de actividades: el parser aún no extrajo filas estables de la hoja (estructura irregular).
              Reejecute <code>npm run etl:operacion</code> tras ajustar el ETL.
            </p>
          ) : (
            <ul className="op-timeline-list">
              {acts.map((a) => (
                <li key={a.id}>
                  <strong>
                    {a.fecha} · {a.turno} · {a.hora}
                  </strong>
                  <p>{a.descripcion}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    );
  }

  // consumos
  const consumos = pack.consumos.filter((c) => {
    if (filters.equipoId !== "Todos" && c.equipoId !== filters.equipoId) return false;
    return true;
  });
  const chart = consumos.reduce<Record<string, { mes: string; aceite: number; coolant: number }>>((acc, c) => {
    const row = acc[c.mes] ?? { mes: c.mes, aceite: 0, coolant: 0 };
    row.aceite += c.adicionAceite + c.cambioAceite;
    row.coolant += c.adicionCoolant;
    acc[c.mes] = row;
    return acc;
  }, {});

  return (
    <div className="panel op-ops">
      <article className="card">
        {header}
        <div className="dash-chart" style={{ marginBottom: "1rem" }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={Object.values(chart).sort((a, b) => a.mes.localeCompare(b.mes))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} width={36} />
              <Tooltip />
              <Legend />
              <Bar dataKey="aceite" name="Aceite" fill="#0e6e8c" radius={[3, 3, 0, 0]} />
              <Bar dataKey="coolant" name="Coolant" fill="#ea580c" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Locación</th>
                <th>Equipo</th>
                <th>Adición aceite</th>
                <th>Cambio aceite</th>
                <th>Coolant</th>
              </tr>
            </thead>
            <tbody>
              {consumos.map((c, i) => (
                <tr key={`${c.mes}-${c.equipoId}-${i}`}>
                  <td>{c.mes}</td>
                  <td>{c.locacion}</td>
                  <td>{c.equipoId}</td>
                  <td>{fmtNum(c.adicionAceite, 1)}</td>
                  <td>{fmtNum(c.cambioAceite, 1)}</td>
                  <td>{fmtNum(c.adicionCoolant, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
