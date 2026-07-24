import { LayoutGrid, ListFilter, Network, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EventCard } from "./components/EventCard";
import { EditableEventDetail } from "./components/EditableEventDetail";
import { CriticalityBadge } from "./components/CriticalityBadge";
import { QualityBadge } from "./components/QualityBadge";
import { TransversalAnalysis } from "./components/TransversalAnalysis";
import { equipoLabel, equiposList, RCA_COSTAYACO_PACK } from "./data";
import { loadCostayacoRcaEvents } from "./rcaEventStore";
import type {
  RcaAppView,
  RcaCalidadDato,
  RcaCriticidad,
  RcaEstadoEvento,
  RcaEventoFalla,
} from "./types";

const ESTADO_LABEL: Record<RcaEstadoEvento, string> = {
  abierto: "Abierto",
  en_seguimiento: "En seguimiento",
  cerrado: "Cerrado",
  sin_marcar: "Sin marcar",
};

type SortDir = "asc" | "desc";

type Props = {
  events?: RcaEventoFalla[];
  onEventChange?: (next: RcaEventoFalla) => void;
  focusId?: string | null;
  onFocusConsumed?: () => void;
};

function sortByFecha(a: RcaEventoFalla, b: RcaEventoFalla, dir: SortDir) {
  const av = a.fecha || (dir === "asc" ? "9999" : "");
  const bv = b.fecha || (dir === "asc" ? "9999" : "");
  const cmp = av.localeCompare(bv);
  return dir === "asc" ? cmp : -cmp;
}

export function CostayacoRcaEventsApp({
  events: eventsProp,
  onEventChange,
  focusId,
  onFocusConsumed,
}: Props) {
  const pack = RCA_COSTAYACO_PACK;
  const [localEvents, setLocalEvents] = useState<RcaEventoFalla[]>(() => loadCostayacoRcaEvents());
  const events = eventsProp ?? localEvents;

  const [view, setView] = useState<RcaAppView>("lista");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layout, setLayout] = useState<"table" | "grid">("table");
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState<"Todos" | RcaEstadoEvento>("Todos");
  const [criticidad, setCriticidad] = useState<"Todos" | RcaCriticidad>("Todos");
  const [equipo, setEquipo] = useState("Todos");
  const [calidad, setCalidad] = useState<"Todos" | RcaCalidadDato>("Todos");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    if (!focusId) return;
    if (events.some((e) => e.id === focusId)) {
      setSelectedId(focusId);
      setView("detalle");
    }
    onFocusConsumed?.();
  }, [focusId, events, onFocusConsumed]);

  const handleSave = (next: RcaEventoFalla) => {
    if (onEventChange) {
      onEventChange(next);
      return;
    }
    setLocalEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === next.id);
      return idx < 0 ? [...prev, next] : prev.map((e, i) => (i === idx ? next : e));
    });
  };

  const equipoOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) {
      for (const eq of equiposList(e.equipo)) set.add(eq);
      if (typeof e.equipo === "string" && e.equipo === "PENDIENTE") set.add("PENDIENTE");
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...events]
      .filter((e) => {
        if (estado !== "Todos" && e.estado !== estado) return false;
        if (criticidad !== "Todos" && e.criticidad !== criticidad) return false;
        if (calidad !== "Todos" && e.calidad_dato !== calidad) return false;
        if (equipo !== "Todos") {
          const list = equiposList(e.equipo);
          const match =
            list.includes(equipo) ||
            (equipo === "PENDIENTE" && (e.equipo === "PENDIENTE" || list.length === 0));
          if (!match) return false;
        }
        if (!q) return true;
        const hay = `${e.id} ${e.titulo} ${equipoLabel(e.equipo)} ${e.sistema ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => sortByFecha(a, b, sortDir));
  }, [calidad, criticidad, equipo, estado, events, query, sortDir]);

  const selected = selectedId ? events.find((e) => e.id === selectedId) ?? null : null;

  const openEvent = (id: string) => {
    setSelectedId(id);
    setView("detalle");
  };

  const qualityCounts = useMemo(() => {
    const counts: Record<RcaCalidadDato, number> = {
      completo: 0,
      parcial: 0,
      inferido: 0,
      vacio: 0,
    };
    for (const e of events) counts[e.calidad_dato] += 1;
    return counts;
  }, [events]);

  return (
    <div className="rca-app exec-dashboard">
      <header className="exec-header dash-hero rca-app-hero">
        <div>
          <p className="eyebrow">
            {pack.meta.cliente} · {pack.meta.operador} · {pack.meta.periodo}
          </p>
          <h2>{pack.meta.proyecto}</h2>
          <p className="muted">
            {pack.meta.flota.ubicacion} · {pack.meta.flota.marca_modelo} · Fuente: {pack.meta.fuente}
          </p>
        </div>
        <nav className="rca-app-tabs" aria-label="Vistas RCA">
          <button
            type="button"
            className={view === "lista" || view === "detalle" ? "active" : ""}
            onClick={() => {
              setView("lista");
              setSelectedId(null);
            }}
          >
            <ListFilter size={14} /> Eventos
          </button>
          <button
            type="button"
            className={view === "transversal" ? "active" : ""}
            onClick={() => setView("transversal")}
          >
            <Network size={14} /> Análisis transversal
          </button>
        </nav>
      </header>

      {view !== "detalle" ? (
        <section className="field-stat-grid field-stat-grid--compact">
          <article className="field-stat-card">
            <span className="field-stat-label">Eventos</span>
            <strong className="field-stat-value">{events.length}</strong>
            <small>Fichas RCA del periodo</small>
          </article>
          <article className="field-stat-card">
            <span className="field-stat-label">Completos</span>
            <strong className="field-stat-value">{qualityCounts.completo}</strong>
            <small>Datos confirmados</small>
          </article>
          <article className="field-stat-card">
            <span className="field-stat-label">Inferidos</span>
            <strong className="field-stat-value">{qualityCounts.inferido}</strong>
            <small>Requieren validación</small>
          </article>
          <article className="field-stat-card">
            <span className="field-stat-label">Vacíos</span>
            <strong className="field-stat-value">{qualityCounts.vacio}</strong>
            <small>Estructura pendiente</small>
          </article>
        </section>
      ) : null}

      {view === "detalle" && selected ? (
        <EditableEventDetail
          event={selected}
          onSave={handleSave}
          onClose={() => {
            setView("lista");
            setSelectedId(null);
          }}
          onOpenRelated={openEvent}
        />
      ) : null}

      {view === "transversal" ? (
        <TransversalAnalysis analysis={pack.analisis_transversal} onOpenEvent={openEvent} />
      ) : null}

      {view === "lista" ? (
        <section className="panel">
          <article className="card rca-list-panel">
            <div className="mto-plans-toolbar">
              <div>
                <p className="eyebrow">Registro consolidado · editable</p>
                <h3>
                  {filtered.length} de {events.length} evento(s)
                </h3>
              </div>
              <div className="mto-plans-filters rca-filters">
                <select value={estado} onChange={(e) => setEstado(e.target.value as typeof estado)}>
                  <option value="Todos">Todos los estados</option>
                  {(Object.keys(ESTADO_LABEL) as RcaEstadoEvento[]).map((k) => (
                    <option key={k} value={k}>
                      {ESTADO_LABEL[k]}
                    </option>
                  ))}
                </select>
                <select
                  value={criticidad}
                  onChange={(e) => setCriticidad(e.target.value as typeof criticidad)}
                >
                  <option value="Todos">Toda criticidad</option>
                  <option value="critica">Crítica</option>
                  <option value="alta">Alta</option>
                  <option value="media-alta">Media-alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                  <option value="PENDIENTE">Pendiente</option>
                </select>
                <select value={equipo} onChange={(e) => setEquipo(e.target.value)}>
                  <option value="Todos">Todos los equipos</option>
                  {equipoOptions.map((eq) => (
                    <option key={eq} value={eq}>
                      {eq}
                    </option>
                  ))}
                </select>
                <select value={calidad} onChange={(e) => setCalidad(e.target.value as typeof calidad)}>
                  <option value="Todos">Toda calidad</option>
                  <option value="completo">Completo</option>
                  <option value="parcial">Parcial</option>
                  <option value="inferido">Inferido</option>
                  <option value="vacio">Vacío</option>
                </select>
                <select value={sortDir} onChange={(e) => setSortDir(e.target.value as SortDir)}>
                  <option value="asc">Fecha ↑</option>
                  <option value="desc">Fecha ↓</option>
                </select>
                <div className="mto-plans-search">
                  <Search size={14} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar id, título, equipo…"
                  />
                </div>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setLayout((v) => (v === "table" ? "grid" : "table"))}
                  title="Cambiar vista"
                >
                  <LayoutGrid size={14} /> {layout === "table" ? "Grid" : "Tabla"}
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="empty-state">Sin eventos con los filtros actuales.</p>
            ) : layout === "grid" ? (
              <div className="rca-event-grid">
                {filtered.map((e) => (
                  <EventCard key={e.id} event={e} onOpen={openEvent} />
                ))}
              </div>
            ) : (
              <div className="table-wrap" style={{ maxHeight: "min(62vh, 640px)", overflow: "auto" }}>
                <table className="rca-events-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th>Fecha</th>
                      <th>Equipo</th>
                      <th>Sistema</th>
                      <th>Estado</th>
                      <th>Criticidad</th>
                      <th>Calidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => (
                      <tr key={e.id} className="rca-row-click" onClick={() => openEvent(e.id)}>
                        <td>
                          <code>{e.id}</code>
                        </td>
                        <td>
                          <strong>{e.titulo}</strong>
                        </td>
                        <td>{e.fecha || "—"}</td>
                        <td>{equipoLabel(e.equipo)}</td>
                        <td>{e.sistema || "—"}</td>
                        <td>{ESTADO_LABEL[e.estado]}</td>
                        <td>
                          <CriticalityBadge value={e.criticidad} />
                        </td>
                        <td>
                          <QualityBadge value={e.calidad_dato} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </section>
      ) : null}
    </div>
  );
}
