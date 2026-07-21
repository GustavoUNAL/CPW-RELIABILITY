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

export function enrichEvent(event: EventRecord, source: ReportKey, index: number): EnrichedEvent {
  return {
    ...event,
    id: `${source}-${event.date}-${event.equipment}-${index}`,
    source,
    parsed: parseEventNotes(event.notes),
  };
}

export function enrichEventLog(events: EventRecord[], source: ReportKey): EnrichedEvent[] {
  return events.map((e, i) => enrichEvent(e, source, i));
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

    if (e.responsible === "COPOWER") imputableCopower += 1;
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

export function filterEvents(events: EnrichedEvent[], filters: EventFilters): EnrichedEvent[] {
  return events.filter((e) => {
    if (filters.failuresOnly && e.eventType !== "Falla") return false;
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

/** Imputables contractuales: tipo Falla + responsable COPOWER o PF_contr > 0. */
export function isContractualFailure(e: EnrichedEvent): boolean {
  if (e.eventType !== "Falla") return false;
  if (e.responsible === "COPOWER") return true;
  if ((e.parsed.pfContr ?? 0) > 0) return true;
  return false;
}
