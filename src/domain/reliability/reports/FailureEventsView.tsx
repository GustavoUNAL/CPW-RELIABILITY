import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Calendar, Clock, ExternalLink, FilePlus2 } from "lucide-react";
import {
  computeEventStats,
  enrichEventLog,
  filterEvents,
  isConcertacionMarkWithoutFo,
  isContractualFailure,
  parseEventNotes,
  type EnrichedEvent,
  type EventFilters,
} from "../events/eventLogUtils";
import {
  buildEventCategoryCatalog,
  classifyReportEventCategory,
} from "../events/eventCategories";
import { EventCategoryCatalogTable } from "./EventCategoryCatalogTable";
import {
  loadEventEdits,
  upsertEventEdit,
  type EventEditMap,
  type EventEditPatch,
} from "../events/eventEditStore";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";
import { buildGteJuneRcaCases, findRcaCasesForEvent, type RcaCaseDetail } from "./gteJuneRcaCases";
import type { RcaEventDraft } from "./rcaCaseStore";
import { GteEventCalendarModal } from "./GteEventCalendarModal";
import type { ReportKey } from "../types";
import { EditableEventDetail } from "../rca/components/EditableEventDetail";
import { shortRcaEventId } from "../rca/data";
import { findCostayacoRcasForEvent } from "../rca/matchCostayacoRca";
import { loadCostayacoRcaEvents, persistCostayacoRcaEvents, upsertCostayacoRcaEvent } from "../rca/rcaEventStore";
import type { RcaEventoFalla } from "../rca/types";
import { buildConfiabilidadAnalisis } from "./ConfiabilidadAnalisisBoard";

const hours = (v: number) =>
  `${v.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} h`;

type ViewMode = "dual" | "copower" | "gte";

type Props = {
  month: string;
  monthLabel: string;
  mode?: ViewMode;
  failuresOnlyDefault?: boolean;
  /** KPIs del panel alineados a FO / Conf del informe (Informes · Confiabilidad). */
  informeStats?: boolean;
  /** Sin hero propio: va embebido bajo el encabezado §7 del informe. */
  embedded?: boolean;
  /** Oculta el panel de indicadores (ya van en el card unificado del informe). */
  hideStatsPanel?: boolean;
  /** Solo calendario: oculta tablas largas de bitácora / RCA (slide del informe). */
  hideEventLists?: boolean;
  onNavigateToRca?: (rcaId?: string) => void;
  rcaCases?: RcaCaseDetail[];
  onCreateRcaFromEvent?: (draft: RcaEventDraft) => void;
  costayacoRcaEvents?: RcaEventoFalla[];
  onCostayacoRcaChange?: (next: RcaEventoFalla) => void;
  onNavigateToCostayacoRca?: (evtId?: string) => void;
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
  if (resp === "COPOWER" || resp === "GTE + COPOWER") return "badge danger";
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

function EventStatsRow({
  events,
  label,
  month,
  informe,
}: {
  events: EnrichedEvent[];
  label?: string;
  month?: string;
  /** KPIs alineados al análisis de confiabilidad del informe. */
  informe?: boolean;
}) {
  const s = computeEventStats(events);
  const confImp = events.filter(isContractualFailure).length;
  const marksSinFo = events.filter(isConcertacionMarkWithoutFo).length;
  const conf = month && informe ? buildConfiabilidadAnalisis(month) : null;

  if (informe && conf) {
    const confPct =
      conf.gteConf != null
        ? `${(conf.gteConf * 100).toLocaleString("es-CO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} %`
        : "—";
    return (
      <div className="ev-stats-block ev-stats-block--informe">
        {label ? <p className="ev-stats-source">{label}</p> : null}
        <div className="field-stat-grid field-stat-grid--compact ev-stats-informe-grid">
          <StatCard
            label="FO-GE-033"
            value={String(conf.rows.length)}
            hint={`${conf.imputables.length} imputables`}
            legend="Formatos de ocurrencia del periodo (§5)."
          />
          <StatCard
            label="Confiabilidad"
            value={confPct}
            hint={`${conf.imputables.length} FO imputables`}
            legend="Externos y marcas sin FO no entran al KPI."
          />
          <StatCard
            label="Marcas sin formato de ocurrencia"
            value={String(conf.orphanMarks.length)}
            hint="Concertación"
            legend="Marcas de falla sin FO-GE-033; no bajan confiabilidad."
          />
          <StatCard
            label="Parada por falla del contratista"
            value={hours(conf.pfContr)}
            hint="PF_contr"
            legend="Horas de parada por falla del contratista del periodo."
          />
        </div>
      </div>
    );
  }

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
          hint={`${confImp} imputables Conf · ${marksSinFo} marcas sin FO`}
          legend="Tipo Falla. Imputables = FO COPOWER o PF_contr > 0; marcas sin FO no bajan Conf."
        />
        <StatCard
          label="Operativos"
          value={String(s.operativo)}
          hint={s.causaComun ? `${s.causaComun} causa común` : undefined}
          legend="Eventos operativos. La causa común se cuenta aparte en el subtítulo."
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

function relatedRcas(event: EnrichedEvent, cases: RcaCaseDetail[]): RcaCaseDetail[] {
  if (!isRcaEligibleEvent(event)) return [];
  return findRcaCasesForEvent(event.date, event.equipment, cases);
}

function relatedCostayacoRcas(event: EnrichedEvent, costayaco: RcaEventoFalla[]): RcaEventoFalla[] {
  return findCostayacoRcasForEvent(event.date, event.equipment, costayaco, event.notes ?? "");
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
  costayacoRcaEvents,
  onCostayacoRcaChange,
  onNavigateToCostayacoRca,
}: {
  event: EnrichedEvent;
  onClose: () => void;
  onSave: (id: string, patch: EventEditPatch) => void;
  onNavigateToRca?: (rcaId?: string) => void;
  rcaCases: RcaCaseDetail[];
  onCreateRcaFromEvent?: (draft: RcaEventDraft) => void;
  costayacoRcaEvents: RcaEventoFalla[];
  onCostayacoRcaChange?: (next: RcaEventoFalla) => void;
  onNavigateToCostayacoRca?: (evtId?: string) => void;
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
  const [activeRcaId, setActiveRcaId] = useState<string | null>(null);

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
    setActiveRcaId(null);
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

  const rcas = relatedRcas(event, rcaCases);
  const costayacoRcas = findCostayacoRcasForEvent(
    draft.date ?? event.date,
    draft.equipment ?? event.equipment,
    costayacoRcaEvents,
    draft.notes ?? event.notes ?? "",
  );
  const activeRca =
    costayacoRcas.find((r) => r.id === activeRcaId) ?? costayacoRcas[0] ?? null;
  const canCreate = Boolean(onCreateRcaFromEvent) && isRcaEligibleEvent(event);
  const parsed = parseEventNotes(draft.notes ?? event.notes ?? "");
  const hasRcaReport = Boolean(activeRca);

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
        <header className={`modal-header${hasRcaReport ? " modal-header--rca" : ""}`}>
          {hasRcaReport ? (
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>
                Evento de falla
              </p>
            </div>
          ) : (
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>
                Detalle del evento · editable
              </p>
              <h3 style={{ margin: "0.15rem 0 0" }}>
                {draft.equipment || event.equipment}
                <code className="ev-event-id" style={{ marginLeft: "0.55rem" }} title="ID de bitácora">
                  {event.id}
                </code>
              </h3>
            </div>
          )}
          <div className="ev-modal-actions">
            {!hasRcaReport ? (
              <>
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
              </>
            ) : null}
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

        {!hasRcaReport ? (
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
        ) : null}

        {hasRcaReport && activeRca ? (
          <div className="ev-rca-report-wrap">
            {costayacoRcas.length > 1 ? (
              <div className="ev-rca-tabs" role="tablist" aria-label="Fichas RCA vinculadas">
                {costayacoRcas.map((rca) => (
                  <button
                    key={rca.id}
                    type="button"
                    role="tab"
                    aria-selected={rca.id === activeRca.id}
                    className={rca.id === activeRca.id ? "active" : undefined}
                    onClick={() => setActiveRcaId(rca.id)}
                  >
                    {shortRcaEventId(rca.id)}
                  </button>
                ))}
              </div>
            ) : null}

            <EditableEventDetail
              key={`${activeRca.id}-${activeRca.cronologia?.[0]?.evento?.slice(0, 48) ?? activeRca.resumen_ejecutivo?.slice(0, 40) ?? ""}`}
              event={costayacoRcaEvents.find((e) => e.id === activeRca.id) ?? activeRca}
              compact
              onSave={(next) => onCostayacoRcaChange?.(next)}
              onOpenRelated={(id) => {
                if (costayacoRcaEvents.some((e) => e.id === id)) {
                  setActiveRcaId(id);
                  return;
                }
                onNavigateToCostayacoRca?.(id);
              }}
              extraActions={
                onNavigateToCostayacoRca ? (
                  <button
                    type="button"
                    className="ev-rca-link"
                    onClick={() => onNavigateToCostayacoRca(activeRca.id)}
                  >
                    Abrir en RCA <ExternalLink size={12} />
                  </button>
                ) : null
              }
            />
          </div>
        ) : (
          <>
            <BitacoraEditFields
              draft={draft}
              event={event}
              parsed={parsed}
              patchDraft={patchDraft}
            />

            <section className="ev-detail-section ev-detail-rca ev-detail-rca--empty">
              <h4>Fichas RCA Costayaco</h4>
              <p>
                Sin ficha EVT vinculada: la bitácora no referencia un ID EVT y no hay coincidencia
                por fecha/equipo en el consolidado de junio 2026.
              </p>
              {onNavigateToCostayacoRca ? (
                <div className="ev-rca-actions">
                  <button
                    type="button"
                    className="ev-rca-link ev-rca-link--all"
                    onClick={() => onNavigateToCostayacoRca()}
                  >
                    Ir a Fichas RCA · Costayaco <ExternalLink size={12} />
                  </button>
                </div>
              ) : null}
            </section>
          </>
        )}

        {rcas.length > 0 ? (
          <section className="ev-detail-section ev-detail-rca">
            <h4>RCA formales relacionados ({rcas.length})</h4>
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
        ) : isRcaEligibleEvent({ ...event, ...draft } as EnrichedEvent) && !hasRcaReport ? (
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
      </article>
    </div>
  );
}

function BitacoraEditFields({
  draft,
  event,
  parsed,
  patchDraft,
}: {
  draft: EventEditPatch;
  event: EnrichedEvent;
  parsed: ReturnType<typeof parseEventNotes>;
  patchDraft: (partial: EventEditPatch) => void;
}) {
  return (
    <>
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
            <option value="GTE + COPOWER">GTE + COPOWER</option>
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
    </>
  );
}

function EventList({
  events,
  selectedId,
  onSelect,
  emptyMessage,
  rcaCases,
  costayacoRcaEvents = [],
}: {
  events: EnrichedEvent[];
  selectedId: string | null;
  onSelect: (e: EnrichedEvent) => void;
  emptyMessage: string;
  rcaCases: RcaCaseDetail[];
  costayacoRcaEvents?: RcaEventoFalla[];
}) {
  if (events.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <ul className="ev-list">
      {events.map((e) => {
        const rcas = relatedRcas(e, rcaCases);
        const costayaco = relatedCostayacoRcas(e, costayacoRcaEvents);
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
                {costayaco.length > 0 ? (
                  <span className="badge info ev-rca-badge" title={costayaco.map((r) => r.id).join(" · ")}>
                    EVT {costayaco.map((r) => shortRcaEventId(r.id)).join(" · ")}
                  </span>
                ) : null}
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
  costayacoRcaEvents,
  onNavigateToRca,
}: {
  events: EnrichedEvent[];
  selectedId: string | null;
  onSelect: (e: EnrichedEvent) => void;
  rcaCases: RcaCaseDetail[];
  costayacoRcaEvents: RcaEventoFalla[];
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
        costayacoRcaEvents={costayacoRcaEvents}
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
  costayacoRcaEvents,
}: {
  events: EnrichedEvent[];
  selectedId: string | null;
  onSelect: (e: EnrichedEvent) => void;
  rcaCases: RcaCaseDetail[];
  costayacoRcaEvents: RcaEventoFalla[];
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
        costayacoRcaEvents={costayacoRcaEvents}
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
  costayacoRcaEvents,
  onSelectEvent,
  calendar,
  month,
  informeStats,
  compact,
  hideStatsPanel,
}: {
  source: ReportKey;
  events: EnrichedEvent[];
  filters: EventFilters;
  onNavigateToRca?: (rcaId?: string) => void;
  rcaCases: RcaCaseDetail[];
  costayacoRcaEvents: RcaEventoFalla[];
  onSelectEvent?: (event: EnrichedEvent) => void;
  calendar?: {
    month: string;
    monthLabel: string;
    sourceLabel: string;
    onCreateRcaFromEvent?: (draft: RcaEventDraft) => void;
  };
  month?: string;
  informeStats?: boolean;
  compact?: boolean;
  hideStatsPanel?: boolean;
}) {
  const filtered = useMemo(() => filterEvents(events, filters), [events, filters]);
  const calendarEvents = filters.failuresOnly ? filtered : events;
  const label = source === "gran_tierra" ? "Gran Tierra Energy" : "COPOWER · Reporte diario";
  const badge = source === "gran_tierra" ? "gte" : "cpw";
  const showStats = !hideStatsPanel;

  return (
    <section className={`ev-source-column ev-source-column--${badge}`}>
      {compact ? null : (
        <header className="ev-source-head">
          <div>
            <strong>{label}</strong>
            <small>
              {filtered.length} de {events.length} en listado de fallas
            </small>
          </div>
          <span className={`source-badge ${badge}`}>{badge.toUpperCase()}</span>
        </header>
      )}
      <div
        className={
          calendar
            ? showStats
              ? "ev-stats-cal-row"
              : "ev-stats-cal-row ev-stats-cal-row--cal-only"
            : undefined
        }
      >
        {calendar && showStats ? (
          <article className={`ev-stats-panel${informeStats ? " ev-stats-panel--informe" : ""}`}>
            <header className="ev-cal-panel-head">
              <div>
                <p className="eyebrow">Indicadores del periodo</p>
                <h3>Resumen {calendar.monthLabel}</h3>
              </div>
            </header>
            <EventStatsRow
              events={filtered}
              month={month ?? calendar.month}
              informe={Boolean(informeStats)}
            />
          </article>
        ) : null}
        {!calendar && showStats ? (
          <EventStatsRow events={filtered} label="Indicadores filtrados" month={month} />
        ) : null}
        {calendar ? (
          <GteEventCalendarModal
            variant="inline"
            month={calendar.month}
            monthLabel={calendar.monthLabel}
            events={calendarEvents}
            sourceLabel={calendar.sourceLabel}
            onNavigateToRca={onNavigateToRca}
            rcaCases={rcaCases}
            onCreateRcaFromEvent={calendar.onCreateRcaFromEvent}
            costayacoRcaEvents={costayacoRcaEvents}
            onSelectEvent={onSelectEvent}
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
  informeStats = false,
  embedded = false,
  hideStatsPanel = false,
  hideEventLists = false,
  onNavigateToRca,
  rcaCases: rcaCasesProp,
  onCreateRcaFromEvent,
  costayacoRcaEvents: costayacoProp,
  onCostayacoRcaChange,
  onNavigateToCostayacoRca,
}: Props) {
  const rcaCases = rcaCasesProp ?? buildGteJuneRcaCases();
  const [localCostayaco, setLocalCostayaco] = useState<RcaEventoFalla[]>(() => loadCostayacoRcaEvents());
  const costayacoRcaEvents = costayacoProp ?? localCostayaco;
  const handleCostayacoChange = (next: RcaEventoFalla) => {
    if (onCostayacoRcaChange) {
      onCostayacoRcaChange(next);
      return;
    }
    setLocalCostayaco((prev) => {
      const updated = upsertCostayacoRcaEvent(prev, next);
      persistCostayacoRcaEvents(updated);
      return updated;
    });
  };
  const filters = useMemo<EventFilters>(
    () => ({
      type: "all",
      responsible: "all",
      query: "",
      failuresOnly: failuresOnlyDefault,
    }),
    [failuresOnlyDefault],
  );
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

  const categoryCatalog = useMemo(() => {
    if (mode === "dual") return null;
    const poolRaw = mode === "gte" ? gteEvents : cpwEvents;
    const pool = failuresOnlyDefault ? filterEvents(poolRaw, filters) : poolRaw;
    const report: ReportKey = mode === "gte" ? "gran_tierra" : "copower";
    const codes = pool.map(
      (e) =>
        classifyReportEventCategory({
          report,
          month,
          cause: e.cause || "",
          notes: e.notes || "",
          date: e.date,
          equipment: e.equipment || "",
        }).primary,
    );
    return {
      rows: buildEventCategoryCatalog(codes),
      total: pool.length,
      label: mode === "gte" ? "Gran Tierra" : "COPOWER",
    };
  }, [mode, gteEvents, cpwEvents, month, failuresOnlyDefault, filters]);

  function handleSelect(event: EnrichedEvent) {
    setSelectedId(event.id);
  }

  function handleSaveEvent(id: string, patch: EventEditPatch) {
    const next = upsertEventEdit(id, patch);
    setEdits(next);
  }

  return (
    <div className={`ev-module exec-dashboard${embedded ? " ev-module--embedded" : ""}`}>
      {embedded ? null : (
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
      )}

      {mode === "dual" ? (
        <div className="ev-dual-summary">
          <EventStatsRow events={cpwEvents} label="COPOWER · mes completo" />
          <EventStatsRow events={gteEvents} label="Gran Tierra · mes completo" />
        </div>
      ) : null}

      {!embedded && categoryCatalog ? (
        <EventCategoryCatalogTable
          rows={categoryCatalog.rows}
          totalEvents={categoryCatalog.total}
          title={`Clasificación por categoría · ${categoryCatalog.label}`}
          subtitle={`${categoryCatalog.total} evento(s) consolidados del periodo · catálogo técnico`}
        />
      ) : null}

      <div className="ev-layout">
        <div className={`ev-columns${mode === "dual" ? " ev-columns--dual" : ""}`}>
          {showCpw ? (
            <SourceColumn
              source="copower"
              events={cpwEvents}
              filters={filters}
              onNavigateToRca={onNavigateToRca}
              rcaCases={rcaCases}
              costayacoRcaEvents={costayacoRcaEvents}
              onSelectEvent={handleSelect}
              calendar={mode === "copower" ? calendarProps : undefined}
              month={month}
              informeStats={informeStats}
              compact={embedded}
              hideStatsPanel={hideStatsPanel}
            />
          ) : null}
          {showGte ? (
            <SourceColumn
              source="gran_tierra"
              events={gteEvents}
              filters={filters}
              onNavigateToRca={onNavigateToRca}
              rcaCases={rcaCases}
              costayacoRcaEvents={costayacoRcaEvents}
              onSelectEvent={handleSelect}
              calendar={mode === "gte" ? calendarProps : undefined}
              month={month}
              informeStats={informeStats || (mode === "gte" && failuresOnlyDefault)}
              compact={embedded}
              hideStatsPanel={hideStatsPanel}
            />
          ) : null}
        </div>
      </div>

      {hideEventLists ? null : (
        <>
          <BitacoraEventsSection
            events={bitacoraEvents}
            selectedId={selectedId}
            onSelect={handleSelect}
            rcaCases={rcaCases}
            costayacoRcaEvents={costayacoRcaEvents}
          />

          <FormalRcaEventsSection
            events={formalRcaEvents}
            selectedId={selectedId}
            onSelect={handleSelect}
            rcaCases={rcaCases}
            costayacoRcaEvents={costayacoRcaEvents}
            onNavigateToRca={onNavigateToRca}
          />
        </>
      )}

      {selected ? (
        <EventDetailModal
          event={selected}
          onClose={() => setSelectedId(null)}
          onSave={handleSaveEvent}
          onNavigateToRca={onNavigateToRca}
          rcaCases={rcaCases}
          onCreateRcaFromEvent={onCreateRcaFromEvent}
          costayacoRcaEvents={costayacoRcaEvents}
          onCostayacoRcaChange={handleCostayacoChange}
          onNavigateToCostayacoRca={onNavigateToCostayacoRca}
        />
      ) : null}
    </div>
  );
}
