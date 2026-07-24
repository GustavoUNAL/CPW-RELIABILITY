import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Calendar, Clock, ExternalLink, FilePlus2, Filter, Search, X } from "lucide-react";
import {
  computeEventStats,
  enrichEventLog,
  filterEvents,
  isContractualFailure,
  parseEventNotes,
  type EnrichedEvent,
  type EventFilters,
} from "../events/eventLogUtils";
import {
  loadEventEdits,
  upsertEventEdit,
  type EventEditMap,
  type EventEditPatch,
} from "../events/eventEditStore";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";
import { buildGteJuneRcaCases, findRcaCasesForEvent, type RcaCaseDetail } from "./gteJuneRcaCases";
import { JUNE_2026_IMPUTABLE_EVENTS } from "./juneImputableEvents";
import type { RcaEventDraft } from "./rcaCaseStore";
import { GteEventCalendarModal } from "./GteEventCalendarModal";
import type { ReportKey } from "../types";

const hours = (v: number) =>
  `${v.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} h`;

type ViewMode = "dual" | "copower" | "gte";

type Props = {
  month: string;
  monthLabel: string;
  mode?: ViewMode;
  failuresOnlyDefault?: boolean;
  onNavigateToRca?: (rcaId?: string) => void;
  rcaCases?: RcaCaseDetail[];
  onCreateRcaFromEvent?: (draft: RcaEventDraft) => void;
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

function StatCard({
  label,
  value,
  legend,
  hint,
}: {
  label: string;
  value: string;
  legend: string;
  hint?: string;
}) {
  return (
    <article className="field-stat-card ev-stat-card">
      <span className="field-stat-label">{label}</span>
      <strong className="field-stat-value">{value}</strong>
      {hint ? <small className="ev-stat-hint">{hint}</small> : null}
      <small className="ev-stat-legend">{legend}</small>
    </article>
  );
}

function EventStatsRow({ events, label }: { events: EnrichedEvent[]; label?: string }) {
  const s = computeEventStats(events);
  const contractual = events.filter(isContractualFailure).length;
  return (
    <div className="ev-stats-block">
      {label ? <p className="ev-stats-source">{label}</p> : null}
      <div className="field-stat-grid field-stat-grid--compact">
        <StatCard
          label="Registros"
          value={String(s.total)}
          legend="Total de eventos de la bitácora con los filtros activos."
        />
        <StatCard
          label="Fallas"
          value={String(s.failures)}
          hint={`${contractual} asociadas a COPOWER`}
          legend="Eventos tipo Falla. El subtítulo cuenta las imputables a COPOWER."
        />
        <StatCard
          label="Operativos"
          value={String(s.operativo)}
          legend="Eventos operativos o de causa común (sin falla tipificada)."
        />
        <StatCard
          label="Horas FS"
          value={hours(s.downtimeHours)}
          legend="Horas fuera de servicio acumuladas en los eventos filtrados."
        />
        <StatCard
          label="PF contr"
          value={hours(s.pfContrHours)}
          hint="Notas GTE"
          legend="Horas de pérdida de generación imputables al contratista (PF_contr)."
        />
        <StatCard
          label="PF cli"
          value={hours(s.pfCliHours)}
          legend="Horas de pérdida de generación imputables al cliente (PF_cli)."
        />
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

function relatedRcas(event: EnrichedEvent, cases: RcaCaseDetail[]): RcaCaseDetail[] {
  if (!isRcaEligibleEvent(event)) return [];
  return findRcaCasesForEvent(event.date, event.equipment, cases);
}

function hasFormalRca(event: EnrichedEvent, cases: RcaCaseDetail[]): boolean {
  return relatedRcas(event, cases).length > 0;
}

function sortEventsChrono(events: EnrichedEvent[]): EnrichedEvent[] {
  return [...events].sort(
    (a, b) => a.date.localeCompare(b.date) || a.equipment.localeCompare(b.equipment),
  );
}

function isRcaEligibleEvent(event: EnrichedEvent): boolean {
  if (event.eventType === "Falla" || event.eventType === "Causa comun") return true;
  if ((event.parsed.fallaEvento ?? 0) > 0) return true;
  if ((event.parsed.pfContr ?? 0) > 0) return true;
  return false;
}

function eventRcaDraft(event: EnrichedEvent): RcaEventDraft {
  return {
    date: event.date,
    equipment: event.equipment,
    cause: event.cause,
    responsible: event.responsible,
  };
}

function applyEdits(events: EnrichedEvent[], edits: EventEditMap): EnrichedEvent[] {
  return events.map((e) => {
    const patch = edits[e.id];
    if (!patch) return e;
    const merged = { ...e, ...patch };
    return { ...merged, parsed: parseEventNotes(merged.notes ?? "") };
  });
}

function EventDetailModal({
  event,
  onClose,
  onSave,
  onNavigateToRca,
  rcaCases,
  onCreateRcaFromEvent,
}: {
  event: EnrichedEvent;
  onClose: () => void;
  onSave: (id: string, patch: EventEditPatch) => void;
  onNavigateToRca?: (rcaId?: string) => void;
  rcaCases: RcaCaseDetail[];
  onCreateRcaFromEvent?: (draft: RcaEventDraft) => void;
}) {
  const [draft, setDraft] = useState<EventEditPatch>({
    date: event.date,
    equipment: event.equipment,
    eventType: event.eventType,
    cause: event.cause,
    downtimeHours: event.downtimeHours,
    responsible: event.responsible,
    notes: event.notes,
  });
  const [savedFlash, setSavedFlash] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"save" | "close" | null>(null);

  useEffect(() => {
    setDraft({
      date: event.date,
      equipment: event.equipment,
      eventType: event.eventType,
      cause: event.cause,
      downtimeHours: event.downtimeHours,
      responsible: event.responsible,
      notes: event.notes,
    });
    setSavedFlash(false);
    setConfirmAction(null);
  }, [event]);

  const isDirty = useMemo(() => {
    const hoursVal = Number(draft.downtimeHours ?? event.downtimeHours) || 0;
    return (
      (draft.date ?? event.date) !== event.date ||
      (draft.equipment ?? event.equipment) !== event.equipment ||
      (draft.eventType ?? event.eventType) !== event.eventType ||
      (draft.cause ?? event.cause) !== event.cause ||
      hoursVal !== event.downtimeHours ||
      (draft.responsible ?? event.responsible) !== event.responsible ||
      (draft.notes ?? event.notes) !== event.notes
    );
  }, [draft, event]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape") return;
      if (confirmAction) {
        setConfirmAction(null);
        return;
      }
      if (isDirty) {
        setConfirmAction("close");
        return;
      }
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmAction, isDirty, onClose]);

  const imputable = findImputableMatch({ ...event, ...draft } as EnrichedEvent);
  const rcas = relatedRcas(event, rcaCases);
  const canCreate = Boolean(onCreateRcaFromEvent) && isRcaEligibleEvent(event);
  const parsed = parseEventNotes(draft.notes ?? event.notes ?? "");

  function patchDraft(partial: EventEditPatch) {
    setDraft((prev) => ({ ...prev, ...partial }));
    setSavedFlash(false);
    setConfirmAction(null);
  }

  function buildPatch(): EventEditPatch {
    return {
      date: draft.date ?? event.date,
      equipment: (draft.equipment ?? event.equipment).trim() || event.equipment,
      eventType: draft.eventType ?? event.eventType,
      cause: draft.cause ?? event.cause,
      downtimeHours: Number(draft.downtimeHours ?? event.downtimeHours) || 0,
      responsible: draft.responsible ?? event.responsible,
      notes: draft.notes ?? event.notes,
    };
  }

  function requestSave() {
    if (!isDirty) {
      setSavedFlash(true);
      return;
    }
    const equipment = (draft.equipment ?? "").trim();
    if (!equipment) {
      setConfirmAction(null);
      return;
    }
    setConfirmAction("save");
  }

  function requestClose() {
    if (isDirty) {
      setConfirmAction("close");
      return;
    }
    onClose();
  }

  function confirmProceed() {
    if (confirmAction === "save") {
      onSave(event.id, buildPatch());
      setSavedFlash(true);
      setConfirmAction(null);
      return;
    }
    if (confirmAction === "close") {
      setConfirmAction(null);
      onClose();
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={requestClose}>
      <article
        className="modal-card modal-card--xl intervention-modal ev-event-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>
              Detalle del evento · editable
            </p>
            <h3 style={{ margin: "0.15rem 0 0" }}>
              {draft.equipment || event.equipment}
              <code className="ev-event-id" style={{ marginLeft: "0.55rem" }} title="ID de relación">
                {event.id}
              </code>
            </h3>
          </div>
          <div className="ev-modal-actions">
            {savedFlash && !isDirty ? (
              <span className="muted" style={{ fontSize: "0.78rem" }}>
                Guardado
              </span>
            ) : null}
            {isDirty ? (
              <span className="badge warn" style={{ fontSize: "0.72rem" }}>
                Sin guardar
              </span>
            ) : null}
            <button type="button" className="open-popup-btn" onClick={requestSave} disabled={!(draft.equipment ?? "").trim()}>
              Guardar
            </button>
            <button type="button" className="open-popup-btn" onClick={requestClose}>
              Cerrar
            </button>
          </div>
        </header>

        {confirmAction ? (
          <div className="ev-save-warn" role="alertdialog" aria-labelledby="ev-save-warn-title">
            <div>
              <strong id="ev-save-warn-title">
                {confirmAction === "save" ? "¿Confirmar guardado?" : "¿Descartar cambios?"}
              </strong>
              <p>
                {confirmAction === "save"
                  ? `Se actualizará el evento ${event.id} (${draft.equipment || event.equipment}). Los cambios quedan en este navegador y no modifican el Excel fuente.`
                  : "Hay cambios sin guardar. Si cierra ahora se perderán las ediciones de esta sesión."}
              </p>
            </div>
            <div className="ev-modal-actions">
              <button type="button" className="open-popup-btn" onClick={() => setConfirmAction(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className={`open-popup-btn${confirmAction === "save" ? " ev-save-warn-confirm" : ""}`}
                onClick={confirmProceed}
              >
                {confirmAction === "save" ? "Sí, guardar" : "Descartar y cerrar"}
              </button>
            </div>
          </div>
        ) : null}

        <div className="ev-modal-badges">
          <span className={typeBadgeClass(draft.eventType ?? event.eventType)}>
            {draft.eventType ?? event.eventType}
          </span>
          <span className={`source-badge ${event.source === "gran_tierra" ? "gte" : "cpw"}`}>
            {event.source === "gran_tierra" ? "Gran Tierra" : "COPOWER"}
          </span>
          <span className={respBadgeClass(draft.responsible ?? event.responsible)}>
            {draft.responsible ?? event.responsible}
          </span>
        </div>

        <div className="intervention-grid-2" style={{ marginTop: "0.65rem" }}>
          <div>
            <label>Equipo</label>
            <input
              value={draft.equipment ?? ""}
              onChange={(e) => patchDraft({ equipment: e.target.value })}
            />
          </div>
          <div>
            <label>Fecha</label>
            <input
              type="date"
              value={draft.date ?? ""}
              onChange={(e) => patchDraft({ date: e.target.value })}
            />
          </div>
          <div>
            <label>Tipo</label>
            <select
              value={draft.eventType ?? event.eventType}
              onChange={(e) =>
                patchDraft({ eventType: e.target.value as EnrichedEvent["eventType"] })
              }
            >
              <option value="Falla">Falla</option>
              <option value="Operativo">Operativo</option>
              <option value="Causa comun">Causa común</option>
            </select>
          </div>
          <div>
            <label>Responsable</label>
            <select
              value={draft.responsible ?? event.responsible}
              onChange={(e) =>
                patchDraft({ responsible: e.target.value as EnrichedEvent["responsible"] })
              }
            >
              <option value="COPOWER">COPOWER</option>
              <option value="GTE">GTE</option>
              <option value="Externo">Externo</option>
            </select>
          </div>
          <div>
            <label>Horas afectadas</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={draft.downtimeHours ?? 0}
              onChange={(e) => patchDraft({ downtimeHours: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label>Horas (formato)</label>
            <input value={hours(Number(draft.downtimeHours ?? 0))} readOnly />
          </div>
        </div>

        <div className="ev-detail-grid" style={{ marginTop: "0.65rem" }}>
          {parsed.pfContr != null ? (
            <div>
              <span>PF contr</span>
              <strong>{hours(parsed.pfContr)}</strong>
            </div>
          ) : null}
          {parsed.pfCli != null ? (
            <div>
              <span>PF cli</span>
              <strong>{hours(parsed.pfCli)}</strong>
            </div>
          ) : null}
          {parsed.pp != null ? (
            <div>
              <span>PP</span>
              <strong>{hours(parsed.pp)}</strong>
            </div>
          ) : null}
          {parsed.sb != null ? (
            <div>
              <span>Stand-by</span>
              <strong>{hours(parsed.sb)}</strong>
            </div>
          ) : null}
          {parsed.fallaEvento != null ? (
            <div>
              <span>Falla evento</span>
              <strong>{String(parsed.fallaEvento)}</strong>
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: "0.65rem" }}>
          <label>Causa / descripción</label>
          <textarea
            rows={4}
            value={draft.cause ?? ""}
            onChange={(e) => patchDraft({ cause: e.target.value })}
          />
        </div>

        <div style={{ marginTop: "0.55rem" }}>
          <label>Notas de bitácora</label>
          <textarea
            rows={3}
            value={draft.notes ?? ""}
            onChange={(e) => patchDraft({ notes: e.target.value })}
          />
        </div>

        {rcas.length > 0 ? (
          <section className="ev-detail-section ev-detail-rca">
            <h4>RCA relacionados ({rcas.length})</h4>
            <ul className="ev-rca-list">
              {rcas.map((rca) => (
                <li key={rca.id}>
                  <div className="ev-rca-row">
                    <div>
                      <strong>{rca.id}</strong>
                      <span>
                        {rca.eventLabel} · {rca.priority} · {rca.status}
                      </span>
                    </div>
                    {onNavigateToRca ? (
                      <button
                        type="button"
                        className="ev-rca-link"
                        onClick={() => onNavigateToRca(rca.id)}
                      >
                        Ver en RCA <ExternalLink size={12} />
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            <div className="ev-rca-actions">
              {canCreate ? (
                <button
                  type="button"
                  className="ev-rca-link ev-rca-link--create"
                  onClick={() => onCreateRcaFromEvent?.(eventRcaDraft({ ...event, ...draft } as EnrichedEvent))}
                >
                  <FilePlus2 size={12} /> Crear otro RCA
                </button>
              ) : null}
              {onNavigateToRca ? (
                <button type="button" className="ev-rca-link ev-rca-link--all" onClick={() => onNavigateToRca()}>
                  Abrir sección RCA <ExternalLink size={12} />
                </button>
              ) : null}
            </div>
          </section>
        ) : isRcaEligibleEvent({ ...event, ...draft } as EnrichedEvent) ? (
          <section className="ev-detail-section ev-detail-rca ev-detail-rca--empty">
            <h4>RCA relacionados</h4>
            <p>Sin RCA formal vinculado. Puede crear uno si el evento lo requiere.</p>
            <div className="ev-rca-actions">
              {canCreate ? (
                <button
                  type="button"
                  className="ev-rca-link ev-rca-link--create"
                  onClick={() => onCreateRcaFromEvent?.(eventRcaDraft({ ...event, ...draft } as EnrichedEvent))}
                >
                  <FilePlus2 size={12} /> Crear RCA
                </button>
              ) : null}
              {onNavigateToRca ? (
                <button type="button" className="ev-rca-link ev-rca-link--all" onClick={() => onNavigateToRca()}>
                  Ir a sección RCA <ExternalLink size={12} />
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        {imputable ? (
          <section className="ev-detail-section ev-detail-imputable">
            <h4>Evento asociado a COPOWER verificado (junio)</h4>
            <p>{imputable.observation}</p>
            <small>{imputable.source}</small>
          </section>
        ) : null}

        {isContractualFailure({ ...event, ...draft, parsed } as EnrichedEvent) ? (
          <p className="alert-inline">Falla asociada a COPOWER / PF_contr &gt; 0</p>
        ) : null}
      </article>
    </div>
  );
}

function EventList({
  events,
  selectedId,
  onSelect,
  emptyMessage,
  rcaCases,
}: {
  events: EnrichedEvent[];
  selectedId: string | null;
  onSelect: (e: EnrichedEvent) => void;
  emptyMessage: string;
  rcaCases: RcaCaseDetail[];
}) {
  if (events.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <ul className="ev-list">
      {events.map((e) => {
        const rcas = relatedRcas(e, rcaCases);
        return (
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
                <code className="ev-event-id" title="ID de relación del evento">
                  {e.id}
                </code>
                <span>
                  <Calendar size={12} /> {e.date}
                </span>
                <span>
                  <Clock size={12} /> {hours(e.downtimeHours)}
                </span>
                <span className={respBadgeClass(e.responsible)}>{e.responsible}</span>
                {rcas.length > 0 ? (
                  <span className="badge info ev-rca-badge">{rcas.map((r) => r.id).join(" · ")}</span>
                ) : null}
              </div>
              <p className="ev-list-item-cause">{e.cause}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function FormalRcaEventsSection({
  events,
  selectedId,
  onSelect,
  rcaCases,
  onNavigateToRca,
}: {
  events: EnrichedEvent[];
  selectedId: string | null;
  onSelect: (e: EnrichedEvent) => void;
  rcaCases: RcaCaseDetail[];
  onNavigateToRca?: (rcaId?: string) => void;
}) {
  if (events.length === 0) return null;
  const rcaIds = [...new Set(events.flatMap((e) => relatedRcas(e, rcaCases).map((r) => r.id)))].sort();

  return (
    <section className="ev-formal-rca-section" aria-label="Eventos con RCA formal">
      <header className="ev-formal-rca-head">
        <div>
          <p className="eyebrow">RCA formal · PDF en data/RCA</p>
          <h3>Eventos con RCA entregado</h3>
          <p className="muted">
            {events.length} registro(s) · orden cronológico
            {rcaIds.length > 0 ? ` · ${rcaIds.join(", ")}` : ""}
          </p>
        </div>
        {onNavigateToRca ? (
          <button type="button" className="ev-rca-link" onClick={() => onNavigateToRca(rcaIds[0])}>
            Ver en Análisis RCA <ExternalLink size={12} />
          </button>
        ) : null}
      </header>
      <EventList
        events={events}
        selectedId={selectedId}
        onSelect={onSelect}
        rcaCases={rcaCases}
        emptyMessage="Sin eventos con RCA formal para los filtros actuales."
      />
    </section>
  );
}

function BitacoraEventsSection({
  events,
  selectedId,
  onSelect,
  rcaCases,
}: {
  events: EnrichedEvent[];
  selectedId: string | null;
  onSelect: (e: EnrichedEvent) => void;
  rcaCases: RcaCaseDetail[];
}) {
  const [typeFilter, setTypeFilter] = useState<"all" | EnrichedEvent["eventType"]>("all");
  const visible = useMemo(
    () => (typeFilter === "all" ? events : events.filter((e) => e.eventType === typeFilter)),
    [events, typeFilter],
  );

  return (
    <section className="ev-bitacora-section" aria-label="Bitácora de eventos">
      <header className="ev-bitacora-head">
        <div>
          <h3>Eventos del periodo</h3>
          <div className="ev-bitacora-meta-row">
            <p className="muted">
              {visible.length}
              {visible.length !== events.length ? ` de ${events.length}` : ""} registro(s) · orden
              cronológico
            </p>
            <label className="ev-bitacora-filter">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                aria-label="Filtrar bitácora por tipo"
              >
                <option value="all">Todos los tipos</option>
                <option value="Falla">Falla</option>
                <option value="Operativo">Operativo</option>
                <option value="Causa comun">Causa común</option>
              </select>
            </label>
          </div>
        </div>
      </header>
      <EventList
        events={visible}
        selectedId={selectedId}
        onSelect={onSelect}
        rcaCases={rcaCases}
        emptyMessage="Ningún evento coincide con el filtro de tipo."
      />
    </section>
  );
}

function SourceColumn({
  source,
  events,
  filters,
  onNavigateToRca,
  rcaCases,
  calendar,
}: {
  source: ReportKey;
  events: EnrichedEvent[];
  filters: EventFilters;
  onNavigateToRca?: (rcaId?: string) => void;
  rcaCases: RcaCaseDetail[];
  calendar?: {
    month: string;
    monthLabel: string;
    sourceLabel: string;
    onCreateRcaFromEvent?: (draft: RcaEventDraft) => void;
  };
}) {
  const filtered = useMemo(() => filterEvents(events, filters), [events, filters]);
  const label = source === "gran_tierra" ? "Gran Tierra Energy" : "COPOWER · Reporte diario";
  const badge = source === "gran_tierra" ? "gte" : "cpw";

  return (
    <section className={`ev-source-column ev-source-column--${badge}`}>
      <header className="ev-source-head">
        <div>
          <strong>{label}</strong>
          <small>
            {filtered.length} de {events.length} filtrados
          </small>
        </div>
        <span className={`source-badge ${badge}`}>{badge.toUpperCase()}</span>
      </header>
      <div className={calendar ? "ev-stats-cal-row" : undefined}>
        {calendar ? (
          <article className="ev-stats-panel">
            <header className="ev-cal-panel-head">
              <div>
                <p className="eyebrow">Indicadores del periodo</p>
                <h3>Resumen {calendar.monthLabel}</h3>
              </div>
            </header>
            <EventStatsRow events={filtered} />
          </article>
        ) : (
          <EventStatsRow events={filtered} label="Indicadores filtrados" />
        )}
        {calendar ? (
          <GteEventCalendarModal
            variant="inline"
            month={calendar.month}
            monthLabel={calendar.monthLabel}
            events={events}
            sourceLabel={calendar.sourceLabel}
            onNavigateToRca={onNavigateToRca}
            rcaCases={rcaCases}
            onCreateRcaFromEvent={calendar.onCreateRcaFromEvent}
          />
        ) : null}
      </div>
    </section>
  );
}

export function FailureEventsView({
  month,
  monthLabel,
  mode = "dual",
  failuresOnlyDefault = false,
  onNavigateToRca,
  rcaCases: rcaCasesProp,
  onCreateRcaFromEvent,
}: Props) {
  const rcaCases = rcaCasesProp ?? buildGteJuneRcaCases();
  const [filters, setFilters] = useState<EventFilters>({
    type: "all",
    responsible: "all",
    query: "",
    failuresOnly: failuresOnlyDefault,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [edits, setEdits] = useState<EventEditMap>(() => loadEventEdits());
  const showCalendar = mode === "gte" || mode === "copower";

  const cpwSnap = getSnap("copower", month);
  const gteSnap = getSnap("gran_tierra", month);

  const cpwEvents = useMemo(
    () => applyEdits(enrichEventLog(cpwSnap?.eventLog ?? [], "copower"), edits),
    [cpwSnap, edits],
  );
  const gteEvents = useMemo(
    () => applyEdits(enrichEventLog(gteSnap?.eventLog ?? [], "gran_tierra"), edits),
    [gteSnap, edits],
  );

  const showCpw = mode === "dual" || mode === "copower";
  const showGte = mode === "dual" || mode === "gte";
  const calendarProps = showCalendar
    ? {
        month,
        monthLabel,
        sourceLabel: mode === "copower" ? "COPOWER" : "Gran Tierra",
        onCreateRcaFromEvent,
      }
    : undefined;

  const bitacoraEvents = useMemo(() => {
    const pools: EnrichedEvent[] = [];
    if (showCpw) pools.push(...filterEvents(cpwEvents, filters));
    if (showGte) pools.push(...filterEvents(gteEvents, filters));
    return sortEventsChrono(pools.filter((e) => !hasFormalRca(e, rcaCases)));
  }, [showCpw, showGte, cpwEvents, gteEvents, filters, rcaCases]);

  const formalRcaEvents = useMemo(() => {
    const pools: EnrichedEvent[] = [];
    if (showCpw) pools.push(...filterEvents(cpwEvents, filters));
    if (showGte) pools.push(...filterEvents(gteEvents, filters));
    return sortEventsChrono(pools.filter((e) => hasFormalRca(e, rcaCases)));
  }, [showCpw, showGte, cpwEvents, gteEvents, filters, rcaCases]);

  const allEvents = useMemo(() => [...cpwEvents, ...gteEvents], [cpwEvents, gteEvents]);
  const selected = selectedId ? allEvents.find((e) => e.id === selectedId) ?? null : null;

  function handleSelect(event: EnrichedEvent) {
    setSelectedId(event.id);
  }

  function handleSaveEvent(id: string, patch: EventEditPatch) {
    const next = upsertEventEdit(id, patch);
    setEdits(next);
  }

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

      <div className="ev-layout">
        <div className={`ev-columns${mode === "dual" ? " ev-columns--dual" : ""}`}>
          {showCpw ? (
            <SourceColumn
              source="copower"
              events={cpwEvents}
              filters={filters}
              onNavigateToRca={onNavigateToRca}
              rcaCases={rcaCases}
              calendar={mode === "copower" ? calendarProps : undefined}
            />
          ) : null}
          {showGte ? (
            <SourceColumn
              source="gran_tierra"
              events={gteEvents}
              filters={filters}
              onNavigateToRca={onNavigateToRca}
              rcaCases={rcaCases}
              calendar={mode === "gte" ? calendarProps : undefined}
            />
          ) : null}
        </div>
      </div>

      <BitacoraEventsSection
        events={bitacoraEvents}
        selectedId={selectedId}
        onSelect={handleSelect}
        rcaCases={rcaCases}
      />

      <FormalRcaEventsSection
        events={formalRcaEvents}
        selectedId={selectedId}
        onSelect={handleSelect}
        rcaCases={rcaCases}
        onNavigateToRca={onNavigateToRca}
      />

      {selected ? (
        <EventDetailModal
          event={selected}
          onClose={() => setSelectedId(null)}
          onSave={handleSaveEvent}
          onNavigateToRca={onNavigateToRca}
          rcaCases={rcaCases}
          onCreateRcaFromEvent={onCreateRcaFromEvent}
        />
      ) : null}
    </div>
  );
}
