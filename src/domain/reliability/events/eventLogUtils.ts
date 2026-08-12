import type { EventRecord, ReportKey } from "../types";

export type ParsedEventNotes = {
  pp: number | null;
  sb: number | null;
  pfContr: number | null;
  pfCli: number | null;
  fallaEvento: number | null;
};

export type EnrichedEvent = EventRecord & {
  id: string;
  source: ReportKey;
  parsed: ParsedEventNotes;
};

export function parseEventNotes(notes: string): ParsedEventNotes {
  const out: ParsedEventNotes = {
    pp: null,
    sb: null,
    pfContr: null,
    pfCli: null,
    fallaEvento: null,
  };
  if (!notes) return out;

  const pick = (key: keyof ParsedEventNotes, label: string) => {
    const m = notes.match(new RegExp(`${label}\\s*([0-9]+(?:\\.[0-9]+)?)`, "i"));
    if (m) out[key] = Number(m[1]);
  };

  pick("pp", "PP");
  pick("sb", "SB");
  pick("pfContr", "PF_contr");
  pick("pfCli", "PF_cli");
  pick("fallaEvento", "Falla_evento");

  return out;
}

/** Normaliza causa para detectar el mismo incidente repetido por unidad. */
export function normalizeCauseKey(cause: string): string {
  return cause
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;:]+$/g, "")
    .trim()
    .slice(0, 72);
}

/**
 * Consolida filas del mismo incidente (misma fecha + tipo + causa) que
 * aparecen una vez por equipo — p. ej. salida de la máquina 22-jun en 10 unidades.
 */
export function collapseRepeatedEvents(events: EventRecord[]): EventRecord[] {
  const order: string[] = [];
  const groups = new Map<string, EventRecord[]>();

  for (const event of events) {
    const key = `${event.date}|${event.eventType}|${normalizeCauseKey(event.cause || "")}`;
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(event);
  }

  return order.map((key) => {
    const group = groups.get(key)!;
    if (group.length === 1) return group[0];

    const equipment = [
      ...new Set(group.map((e) => e.equipment.trim()).filter(Boolean)),
    ].join(", ");
    const downtimeHours = group.reduce((sum, e) => sum + (Number(e.downtimeHours) || 0), 0);
    const base = group[0];
    const unitNote = `${group.length} unidades consolidadas`;
    const notes = base.notes?.includes("unidades consolidadas")
      ? base.notes
      : [base.notes, unitNote].filter(Boolean).join(" | ");

    return {
      ...base,
      equipment,
      downtimeHours,
      notes,
      cause: base.cause,
    };
  });
}

/** ID corto estable para relacionar bitácora ↔ RCA / CAPA / planes (visible en UI).
 *  Formato: G0603-1 → fuente + MMDD + secuencia del día (el equipo ya se muestra aparte).
 */
export function buildEventRelId(source: ReportKey, date: string, daySeq: number): string {
  const src = source === "gran_tierra" ? "G" : "C";
  const d = (date || "0000-00-00").slice(5).replace("-", ""); // MMDD
  return `${src}${d}-${daySeq}`;
}

export function enrichEvent(
  event: EventRecord,
  source: ReportKey,
  daySeq: number,
): EnrichedEvent {
  return {
    ...event,
    id: buildEventRelId(source, event.date, daySeq),
    source,
    parsed: parseEventNotes(event.notes),
  };
}

export function enrichEventLog(
  events: EventRecord[],
  source: ReportKey,
  options?: { collapseRepeated?: boolean },
): EnrichedEvent[] {
  const sourceEvents =
    options?.collapseRepeated === false ? events : collapseRepeatedEvents(events);
  const dayCount = new Map<string, number>();
  return sourceEvents.map((e) => {
    const key = e.date || "0000-00-00";
    const next = (dayCount.get(key) ?? 0) + 1;
    dayCount.set(key, next);
    return enrichEvent(e, source, next);
  });
}

export type EventLogStats = {
  total: number;
  failures: number;
  operativo: number;
  causaComun: number;
  imputableCopower: number;
  clienteExterno: number;
  downtimeHours: number;
  pfContrHours: number;
  pfCliHours: number;
};

export function computeEventStats(events: EnrichedEvent[]): EventLogStats {
  let failures = 0;
  let operativo = 0;
  let causaComun = 0;
  let imputableCopower = 0;
  let clienteExterno = 0;
  let downtimeHours = 0;
  let pfContrHours = 0;
  let pfCliHours = 0;

  for (const e of events) {
    if (e.eventType === "Falla") failures += 1;
    else if (e.eventType === "Causa comun") causaComun += 1;
    else operativo += 1;

    downtimeHours += e.downtimeHours ?? 0;
    if (e.parsed.pfContr != null) pfContrHours += e.parsed.pfContr;
    if (e.parsed.pfCli != null) pfCliHours += e.parsed.pfCli;

    if (e.responsible === "COPOWER" || e.responsible === "GTE + COPOWER") imputableCopower += 1;
    else if (e.responsible === "GTE" || e.responsible === "Externo") clienteExterno += 1;
  }

  return {
    total: events.length,
    failures,
    operativo,
    causaComun,
    imputableCopower,
    clienteExterno,
    downtimeHours,
    pfContrHours,
    pfCliHours,
  };
}

export type EventFilters = {
  type: "all" | EventRecord["eventType"];
  responsible: "all" | EventRecord["responsible"];
  query: string;
  failuresOnly: boolean;
};

/** Evento de listado de fallas del informe: tipificadas, causa común o con FO-GE-033. */
export function isReportFailureEvent(e: EnrichedEvent): boolean {
  if (e.eventType === "Falla" || e.eventType === "Causa comun") return true;
  if (/FO-GE-033/i.test(e.notes ?? "")) return true;
  if ((e.parsed.fallaEvento ?? 0) > 0) return true;
  return false;
}

export function filterEvents(events: EnrichedEvent[], filters: EventFilters): EnrichedEvent[] {
  return events.filter((e) => {
    if (filters.failuresOnly && !isReportFailureEvent(e)) return false;
    if (filters.type !== "all" && e.eventType !== filters.type) return false;
    if (filters.responsible !== "all" && e.responsible !== filters.responsible) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const hay = `${e.equipment} ${e.cause} ${e.notes}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Marca de Excel tipo Falla sin FO ni PF_contr — no baja confiabilidad contractual. */
export function isConcertacionMarkWithoutFo(e: EnrichedEvent): boolean {
  if (e.eventType !== "Falla") return false;
  if (/FO-GE-033/i.test(e.notes ?? "")) return false;
  return (e.parsed.pfContr ?? 0) <= 0;
}

/**
 * Imputable al KPI de confiabilidad (FO + COPOWER o PF_contr > 0).
 * No cuenta marcas de concertación sin FO ni FO compartidas GTE+COPOWER sin PF_contr.
 */
export function isContractualFailure(e: EnrichedEvent): boolean {
  if ((e.parsed.pfContr ?? 0) > 0) return true;
  if (e.eventType !== "Falla") return false;
  if (!/FO-GE-033/i.test(e.notes ?? "")) return false;
  return e.responsible === "COPOWER";
}
