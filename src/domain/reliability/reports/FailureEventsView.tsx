import { useMemo, useState } from "react";
import { AlertTriangle, Calendar, Clock, Filter, Search, X } from "lucide-react";
import {
  computeEventStats,
  enrichEventLog,
  filterEvents,
  isContractualFailure,
  type EnrichedEvent,
  type EventFilters,
} from "../events/eventLogUtils";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";
import { JUNE_2026_IMPUTABLE_EVENTS } from "./juneImputableEvents";
import type { ReportKey } from "../types";

const hours = (v: number) =>
  `${v.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} h`;

type ViewMode = "dual" | "copower" | "gte";

type Props = {
  month: string;
  monthLabel: string;
  mode?: ViewMode;
  failuresOnlyDefault?: boolean;
};

function getSnap(report: ReportKey, month: string) {
  if (report === "gran_tierra") return GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  return COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ?? null;
}

function typeBadgeClass(type: EnrichedEvent["eventType"]) {
  if (type === "Falla") return "badge danger";
  if (type === "Causa comun") return "badge warn";
  return "badge info";
}

function respBadgeClass(resp: EnrichedEvent["responsible"]) {
  if (resp === "COPOWER") return "badge danger";
  if (resp === "GTE") return "badge warn";
  return "badge info";
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="field-stat-card ev-stat-card">
      <span className="field-stat-label">{label}</span>
      <strong className="field-stat-value">{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}

function EventStatsRow({ events, label }: { events: EnrichedEvent[]; label: string }) {
  const s = computeEventStats(events);
  const contractual = events.filter(isContractualFailure).length;
  return (
    <div className="ev-stats-block">
      <p className="ev-stats-source">{label}</p>
      <div className="field-stat-grid field-stat-grid--compact">
        <StatCard label="Registros" value={String(s.total)} />
        <StatCard label="Fallas" value={String(s.failures)} hint={`${contractual} asociadas a COPOWER`} />
        <StatCard label="Operativos" value={String(s.operativo)} />
        <StatCard label="Horas FS" value={hours(s.downtimeHours)} />
        <StatCard label="PF contr" value={hours(s.pfContrHours)} hint="Notas GTE" />
        <StatCard label="PF cli" value={hours(s.pfCliHours)} />
      </div>
    </div>
  );
}

function findImputableMatch(event: EnrichedEvent) {
  if (event.source !== "gran_tierra" || !event.date.startsWith("2026-06")) return null;
  const eq = event.equipment.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return (
    JUNE_2026_IMPUTABLE_EVENTS.find((j) => {
      const je = j.equipment.toUpperCase().replace(/[^A-Z0-9]/g, "");
      return j.date === event.date && (eq.includes(je) || je.includes(eq));
    }) ?? null
  );
}

function EventDetail({ event, onClose }: { event: EnrichedEvent; onClose: () => void }) {
  const imputable = findImputableMatch(event);

  return (
    <aside className="ev-detail-panel">
      <header className="ev-detail-head">
        <div>
          <span className={typeBadgeClass(event.eventType)}>{event.eventType}</span>
          <span className={`source-badge ${event.source === "gran_tierra" ? "gte" : "cpw"}`}>
            {event.source === "gran_tierra" ? "Gran Tierra" : "COPOWER"}
          </span>
        </div>
        <button type="button" className="ev-detail-close" onClick={onClose} aria-label="Cerrar detalle">
          <X size={18} />
        </button>
      </header>

      <h3>{event.equipment}</h3>
      <p className="ev-detail-date">
        <Calendar size={14} /> {event.date}
      </p>

      <div className="ev-detail-grid">
        <div>
          <span>Responsable</span>
          <strong className={respBadgeClass(event.responsible)}>{event.responsible}</strong>
        </div>
        <div>
          <span>Horas afectadas</span>
          <strong>{hours(event.downtimeHours)}</strong>
        </div>
        {event.parsed.pfContr != null ? (
          <div>
            <span>PF contr</span>
            <strong>{hours(event.parsed.pfContr)}</strong>
          </div>
        ) : null}
        {event.parsed.pfCli != null ? (
          <div>
            <span>PF cli</span>
            <strong>{hours(event.parsed.pfCli)}</strong>
          </div>
        ) : null}
        {event.parsed.pp != null ? (
          <div>
            <span>PP</span>
            <strong>{hours(event.parsed.pp)}</strong>
          </div>
        ) : null}
        {event.parsed.sb != null ? (
          <div>
            <span>Stand-by</span>
            <strong>{hours(event.parsed.sb)}</strong>
          </div>
        ) : null}
        {event.parsed.fallaEvento != null ? (
          <div>
            <span>Falla evento</span>
            <strong>{String(event.parsed.fallaEvento)}</strong>
          </div>
        ) : null}
      </div>

      <section className="ev-detail-section">
        <h4>Causa / descripción</h4>
        <p>{event.cause || "Sin descripción registrada."}</p>
      </section>

      {event.notes ? (
        <section className="ev-detail-section">
          <h4>Notas de bitácora</h4>
          <p className="ev-detail-notes">{event.notes}</p>
        </section>
      ) : null}

      {imputable ? (
        <section className="ev-detail-section ev-detail-imputable">
          <h4>Evento asociado a COPOWER verificado (junio)</h4>
          <p>{imputable.observation}</p>
          <small>{imputable.source}</small>
        </section>
      ) : null}

      {isContractualFailure(event) ? (
        <p className="alert-inline">Falla asociada a COPOWER / PF_contr &gt; 0</p>
      ) : null}
    </aside>
  );
}

function EventList({
  events,
  selectedId,
  onSelect,
  emptyMessage,
}: {
  events: EnrichedEvent[];
  selectedId: string | null;
  onSelect: (e: EnrichedEvent) => void;
  emptyMessage: string;
}) {
  if (events.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <ul className="ev-list">
      {events.map((e) => (
        <li key={e.id}>
          <button
            type="button"
            className={`ev-list-item${selectedId === e.id ? " active" : ""}`}
            onClick={() => onSelect(e)}
          >
            <div className="ev-list-item-head">
              <strong>{e.equipment}</strong>
              <span className={typeBadgeClass(e.eventType)}>{e.eventType}</span>
            </div>
            <div className="ev-list-item-meta">
              <span>
                <Calendar size={12} /> {e.date}
              </span>
              <span>
                <Clock size={12} /> {hours(e.downtimeHours)}
              </span>
              <span className={respBadgeClass(e.responsible)}>{e.responsible}</span>
            </div>
            <p className="ev-list-item-cause">{e.cause}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}

function SourceColumn({
  source,
  events,
  filters,
  selectedId,
  onSelect,
}: {
  source: ReportKey;
  events: EnrichedEvent[];
  filters: EventFilters;
  selectedId: string | null;
  onSelect: (e: EnrichedEvent) => void;
}) {
  const filtered = useMemo(() => filterEvents(events, filters), [events, filters]);
  const label = source === "gran_tierra" ? "Gran Tierra Energy" : "COPOWER · Reporte diario";
  const badge = source === "gran_tierra" ? "gte" : "cpw";

  return (
    <section className={`ev-source-column ev-source-column--${badge}`}>
      <header className="ev-source-head">
        <div>
          <strong>{label}</strong>
          <small>{filtered.length} de {events.length} registros</small>
        </div>
        <span className={`source-badge ${badge}`}>{badge.toUpperCase()}</span>
      </header>
      <EventStatsRow events={filtered} label="Indicadores filtrados" />
      <EventList
        events={filtered}
        selectedId={selectedId}
        onSelect={onSelect}
        emptyMessage={
          events.length === 0
            ? "Sin bitácora cargada para este mes en esta fuente."
            : "Ningún evento coincide con los filtros."
        }
      />
    </section>
  );
}

export function FailureEventsView({ month, monthLabel, mode = "dual", failuresOnlyDefault = false }: Props) {
  const [filters, setFilters] = useState<EventFilters>({
    type: "all",
    responsible: "all",
    query: "",
    failuresOnly: failuresOnlyDefault,
  });
  const [selected, setSelected] = useState<EnrichedEvent | null>(null);

  const cpwSnap = getSnap("copower", month);
  const gteSnap = getSnap("gran_tierra", month);

  const cpwEvents = useMemo(() => enrichEventLog(cpwSnap?.eventLog ?? [], "copower"), [cpwSnap]);
  const gteEvents = useMemo(() => enrichEventLog(gteSnap?.eventLog ?? [], "gran_tierra"), [gteSnap]);

  const showCpw = mode === "dual" || mode === "copower";
  const showGte = mode === "dual" || mode === "gte";

  return (
    <div className="ev-module exec-dashboard">
      <header className="exec-header">
        <div>
          <p className="eyebrow">Eventos de falla · {monthLabel}</p>
          <h2>
            <AlertTriangle size={22} style={{ verticalAlign: "middle", marginRight: 8 }} />
            Bitácora operativa
          </h2>
          <p className="muted">
            {mode === "dual"
              ? "COPOWER (hoja Eventos) vs Gran Tierra (Data Soporte / bitácora oficial)"
              : mode === "copower"
                ? "Reporte diario COPOWER · hoja Eventos de Generación"
                : "Gran Tierra Energy · Excel Data Soporte / informe mensual"}
          </p>
        </div>
      </header>

      {mode === "dual" ? (
        <div className="ev-dual-summary">
          <EventStatsRow events={cpwEvents} label="COPOWER · mes completo" />
          <EventStatsRow events={gteEvents} label="Gran Tierra · mes completo" />
        </div>
      ) : null}

      <div className="ev-filters">
        <div className="ev-filter-group">
          <Filter size={14} />
          <label className="ev-filter-check">
            <input
              type="checkbox"
              checked={filters.failuresOnly}
              onChange={(e) => setFilters((f) => ({ ...f, failuresOnly: e.target.checked }))}
            />
            Solo fallas
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as EventFilters["type"] }))}
          >
            <option value="all">Todos los tipos</option>
            <option value="Falla">Falla</option>
            <option value="Operativo">Operativo</option>
            <option value="Causa comun">Causa común</option>
          </select>
          <select
            value={filters.responsible}
            onChange={(e) =>
              setFilters((f) => ({ ...f, responsible: e.target.value as EventFilters["responsible"] }))
            }
          >
            <option value="all">Todos los responsables</option>
            <option value="COPOWER">COPOWER</option>
            <option value="GTE">GTE / Cliente</option>
            <option value="Externo">Externo</option>
          </select>
        </div>
        <div className="ev-search">
          <Search size={14} />
          <input
            type="search"
            placeholder="Buscar equipo, causa, notas…"
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
          />
        </div>
      </div>

      <div className={`ev-layout${selected ? " ev-layout--detail" : ""}`}>
        <div className={`ev-columns${mode === "dual" ? " ev-columns--dual" : ""}`}>
          {showCpw ? (
            <SourceColumn
              source="copower"
              events={cpwEvents}
              filters={filters}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
            />
          ) : null}
          {showGte ? (
            <SourceColumn
              source="gran_tierra"
              events={gteEvents}
              filters={filters}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
            />
          ) : null}
        </div>

        {selected ? <EventDetail event={selected} onClose={() => setSelected(null)} /> : null}
      </div>

      <aside className="exec-source-note">
        <p>
          <strong>Fuentes:</strong> {cpwSnap?.sourceFile ?? "COPOWER N/D"} · {gteSnap?.sourceFile ?? "GTE N/D"}.
          Seleccione un evento para ver detalle. Gran Tierra parsea PP/SB/PF_contr/PF_cli desde notas del Excel.
        </p>
      </aside>
    </div>
  );
}
