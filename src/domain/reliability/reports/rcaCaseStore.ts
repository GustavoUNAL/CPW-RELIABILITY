import { buildGteJuneRcaCases, type RcaCaseDetail } from "./gteJuneRcaCases";

const STORAGE_KEY = "cpw-rca-cases-v1";

export type RcaEventDraft = {
  date: string;
  equipment: string;
  cause?: string;
  responsible?: string;
};

export function loadRcaCases(): RcaCaseDetail[] {
  const seed = buildGteJuneRcaCases();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const stored = JSON.parse(raw) as RcaCaseDetail[];
    if (!Array.isArray(stored)) return seed;
    const byId = new Map(seed.map((c) => [c.id, c]));
    for (const c of stored) {
      if (c?.id) byId.set(c.id, c);
    }
    return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  } catch {
    return seed;
  }
}

export function persistRcaCases(cases: RcaCaseDetail[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch {
    /* ignore quota / private mode */
  }
}

export function nextRcaId(cases: RcaCaseDetail[]): string {
  let max = 0;
  for (const c of cases) {
    const m = /^RCA-(\d+)$/i.exec(c.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `RCA-${String(max + 1).padStart(3, "0")}`;
}

export function createRcaDraftFromEvent(input: RcaEventDraft & { existing: RcaCaseDetail[] }): RcaCaseDetail {
  const id = nextRcaId(input.existing);
  const label = (input.cause || "Falla operativa").trim().slice(0, 90) || "Falla operativa";
  const assets = input.equipment
    .split(/[,;/|]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const company = input.responsible === "GTE" || input.responsible === "Externo" ? "GTE" : "COPOWER";

  return {
    id,
    title: `${input.equipment || "Equipo"} · ${label}`,
    eventLabel: label,
    status: "Pendiente",
    priority: "Alta",
    equipment: input.equipment || "Por definir",
    linkedAssets: assets.length > 0 ? assets : input.equipment ? [input.equipment] : ["Por definir"],
    eventDate: input.date || new Date().toISOString().slice(0, 10),
    problem: input.cause?.trim() || "",
    immediateCause: "",
    rootCause: "",
    actions: [""],
    result: "",
    linkedPlanId: null,
    category: "Por clasificar",
    responsible: company === "GTE" ? "Gran Tierra" : "Confiabilidad",
    company,
    closeDate: null,
  };
}

export function createBlankRca(existing: RcaCaseDetail[]): RcaCaseDetail {
  return createRcaDraftFromEvent({
    date: new Date().toISOString().slice(0, 10),
    equipment: "",
    cause: "Nuevo análisis de causa raíz",
    existing,
  });
}
