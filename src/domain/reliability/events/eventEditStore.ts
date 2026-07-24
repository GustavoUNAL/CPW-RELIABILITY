import type { EventRecord } from "../types";

const STORAGE_KEY = "cpw-event-edits-v1";

export type EventEditPatch = Partial<
  Pick<EventRecord, "date" | "equipment" | "eventType" | "cause" | "downtimeHours" | "responsible" | "notes">
>;

export type EventEditMap = Record<string, EventEditPatch>;

export function loadEventEdits(): EventEditMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as EventEditMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function persistEventEdits(map: EventEditMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / private mode */
  }
}

export function upsertEventEdit(id: string, patch: EventEditPatch): EventEditMap {
  const current = loadEventEdits();
  const next = { ...current, [id]: { ...current[id], ...patch } };
  persistEventEdits(next);
  return next;
}
