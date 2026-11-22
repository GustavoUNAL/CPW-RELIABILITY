import { NOVEMBER_FAILURES, type NovemberFailure, type NovemberField } from "./novemberFailures";

export type FailureBlame = "copower" | "externa" | "mixta" | "pendiente";

export type UnitDowntime = {
  unit: string;
  hours: number;
};

export type QuantifiedFailure = NovemberFailure & {
  id: string;
  rootCause: string;
  immediateCause: string;
  blame: FailureBlame;
  blameLabel: string;
  downtimeHours: number;
  unitHours: UnitDowntime[];
  startHint: string | null;
  endHint: string | null;
};

const BLAME_LABEL: Record<FailureBlame, string> = {
  copower: "Imputable COPOWER",
  externa: "Externa / cliente",
  mixta: "Mixta / por confirmar",
  pendiente: "Pendiente de causa",
};

function firstMatch(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]?.trim()) return match[1].replace(/\s+/g, " ").trim();
  }
  return "";
}

function extractCauses(analisis: string): { immediate: string; root: string } {
  const immediate = firstMatch(analisis, [
    /Causa\s+inmediata[:\s]*\n?([\s\S]*?)(?=\nHip[oó]tesis|\nCausa\s+ra[ií]z|\nFactores|\nHipotesis|$)/i,
    /Causa\s+inmediata[:\s]+([^\n]+)/i,
  ]);
  const root = firstMatch(analisis, [
    /Hip[oó]tesis\s+de\s+causa\s+ra[ií]z[:\s]*\n?([\s\S]*?)(?=\nFactores|\nCausa\s+inmediata|$)/i,
    /Hip[oó]tesis\s+Causa\s+Ra[ií]z[:\s]*\n?([\s\S]*?)(?=\nFactores|$)/i,
    /Causa\s+[Rr]a[ií]z[:\s]*\n?([\s\S]*?)(?=\nFactores|\nCausa\s+inmediata|$)/i,
    /Hipotesis\s+de\s+causa\s+railz\n?([\s\S]*?)(?=\nFactores|$)/i,
  ]);
  return {
    immediate: immediate || analisis.split("\n")[0]?.trim() || "Sin causa inmediata escrita",
    root: root || "Sin causa raíz escrita en el FO",
  };
}

function parseHourToken(raw: string): number | null {
  const t = raw.trim().toLowerCase().replace(",", ".");
  const hm = t.match(/^(\d+)\s*h(?:oras?)?\s*(\d+)\s*min/);
  if (hm) return Number(hm[1]) + Number(hm[2]) / 60;
  const hOnly = t.match(/^(\d+(?:\.\d+)?)\s*h(?:rs?|oras?)?$/);
  if (hOnly) return Number(hOnly[1]);
  const minOnly = t.match(/^(\d+)\s*min/);
  if (minOnly) return Number(minOnly[1]) / 60;
  const clock = t.match(/^(\d+):(\d+)$/);
  if (clock) return Number(clock[1]) + Number(clock[2]) / 60;
  const plain = Number(t);
  return Number.isFinite(plain) ? plain : null;
}

function extractUnitHours(observaciones: string, units: string[]): UnitDowntime[] {
  const out: UnitDowntime[] = [];
  const seen = new Set<string>();
  const push = (unitRaw: string, hoursRaw: string) => {
    const hours = parseHourToken(hoursRaw);
    if (hours == null || hours <= 0) return;
    const unit = normalizeUnit(unitRaw);
    const key = `${unit}|${hours.toFixed(2)}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ unit, hours: Number(hours.toFixed(2)) });
  };

  // Preferir duraciones explícitas: "G-801 … (11 min / 0,18 hrs)" o "CPW06: 0 h 33 min".
  const durationToken = "(\\d+\\s*h(?:oras?)?(?:\\s*\\d+\\s*min)?|\\d+\\s*min|[0-9]+(?:[.,][0-9]+)?\\s*(?:hrs?|h))";
  const unitToken = "((?:CPW|G|JINAN?|JIN|J320)[-\\s]?\\d+[A-Z]?)";
  for (const match of observaciones.matchAll(
    new RegExp(`\\b${unitToken}\\b[^\\n]{0,80}?${durationToken}`, "gi"),
  )) {
    push(match[1], match[2]);
  }
  for (const match of observaciones.matchAll(
    new RegExp(`${durationToken}\\s*(?:para|de)\\s*${unitToken}`, "gi"),
  )) {
    push(match[2], match[1]);
  }
  // Formato Pad 4: "G-801 14:13 / 14:24 (11 min / 0,18 hrs)"
  for (const match of observaciones.matchAll(
    new RegExp(`\\b${unitToken}\\b[^\\n]{0,40}?\\(([0-9]+\\s*min)\\s*/\\s*([0-9]+(?:[.,][0-9]+)?)\\s*hrs?\\)`, "gi"),
  )) {
    push(match[1], match[3] ? `${match[3]} hrs` : match[2]);
  }

  if (out.length) return mergeUnitHours(out);

  const total = firstMatch(observaciones, [
    /Tiempo\s+total(?:\s+del\s+evento)?[:\s]+[^\n]*?\(([0-9]+(?:[.,][0-9]+)?)\s*Hrs?\)/i,
    /Total\s+parada[:\s]+[^\n]*?\(([0-9]+(?:[.,][0-9]+)?)\s*hrs?\)/i,
    /Total\s+parada[:\s]+(\d+\s*min)/i,
    /Tiempo\s+fuera\s+de\s+l[ií]nea[:\s]+(\d+\s*h(?:oras?)?(?:\s*\d+\s*min)?)/i,
    /acumulado\s+fue\s+de\s+(\d+\s*h(?:oras?)?(?:\s*\d+\s*min)?)/i,
  ]);
  const hours = total ? parseHourToken(total) : null;
  if (hours != null && hours > 0) {
    if (units.length <= 1) {
      return [{ unit: units[0] ?? "Parque", hours: Number(hours.toFixed(2)) }];
    }
    return [{ unit: "Acumulado", hours: Number(hours.toFixed(2)) }];
  }
  return [];
}

function normalizeUnit(unit: string): string {
  const u = unit.toUpperCase().replace(/\s+/g, "");
  if (/^G-?\d/.test(u)) return u.replace(/^G-?/, "G-");
  if (/^CPW-?\d/.test(u)) return u.replace(/^CPW-?/, "CPW");
  if (/^JINAN?-?\d/.test(u)) return u.replace(/^JINAN?-?/, "JIN-");
  if (/^JIN-?\d/.test(u)) return u.replace(/^JIN-?/, "JIN-");
  if (/^J320/.test(u)) return "J320";
  return u;
}

function mergeUnitHours(rows: UnitDowntime[]): UnitDowntime[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.unit, Number(((map.get(row.unit) ?? 0) + row.hours).toFixed(2)));
  }
  return [...map.entries()].map(([unit, hours]) => ({ unit, hours }));
}

function classifyBlame(text: string): FailureBlame {
  const t = text.toLowerCase();
  const externa =
    /sin\b|mru|soenergy|descarga atmosf[eé]rica|red del campo|cliente|perturbaci[oó]n en la red|gas tisquirama|suministro de gas|calidad del gas|gnc|sobrecarga|d[eé]ficit s[uú]bito|p[oó]rtico|fusibles|sdt 30/.test(
      t,
    );
  const copower =
    /tornillo|actuador|servomotor|v[aá]lvula de 3 v[ií]as|circuito de control|24 vdc|refrigeraci[oó]n lt|mat\b|mantenimiento|fatiga/.test(
      t,
    );
  if (externa && copower) return "mixta";
  if (externa) return "externa";
  if (copower) return "copower";
  if (/pendiente|requiere correlacionar|sujetas a confirmaci[oó]n/.test(t)) return "pendiente";
  return "pendiente";
}

function extractClock(observaciones: string, kind: "salida" | "ingreso"): string | null {
  const patterns =
    kind === "salida"
      ? [/Hora\s+(?:de\s+)?salida[:\s]+(\d{1,2}:\d{2})/i, /Inicio del evento[:\s]+(\d{1,2}:\d{2})/i]
      : [/Hora\s+(?:de\s+)?ingreso[:\s]+(\d{1,2}:\d{2})/i, /Fin del evento[:\s]+(\d{1,2}:\d{2})/i];
  return firstMatch(observaciones, patterns) || null;
}

export function quantifyFailure(row: NovemberFailure, index: number): QuantifiedFailure {
  const causes = extractCauses(row.analisis);
  const unitHours = extractUnitHours(row.observaciones, row.units);
  const downtimeHours = Number(unitHours.reduce((sum, item) => sum + item.hours, 0).toFixed(2));
  const blame = classifyBlame(`${causes.root}\n${causes.immediate}\n${row.descripcion}\n${row.observaciones}`);
  return {
    ...row,
    id: `${row.field}-${row.day}-${row.rf}-${index}`,
    rootCause: causes.root,
    immediateCause: causes.immediate,
    blame,
    blameLabel: BLAME_LABEL[blame],
    downtimeHours,
    unitHours,
    startHint: extractClock(row.observaciones, "salida"),
    endHint: extractClock(row.observaciones, "ingreso"),
  };
}

export function quantifiedNovember(fields?: NovemberField[]): QuantifiedFailure[] {
  return NOVEMBER_FAILURES.filter((row) => !fields || fields.includes(row.field)).map(quantifyFailure);
}

export function failureCalendarDays(events: QuantifiedFailure[]) {
  const byDay = new Map<string, QuantifiedFailure[]>();
  for (const event of events) {
    const list = byDay.get(event.day) ?? [];
    list.push(event);
    byDay.set(event.day, list);
  }
  return byDay;
}

export function reliabilitySnapshot(events: QuantifiedFailure[]) {
  const downtimeHours = Number(events.reduce((sum, e) => sum + e.downtimeHours, 0).toFixed(2));
  const copowerHours = Number(
    events.filter((e) => e.blame === "copower").reduce((sum, e) => sum + e.downtimeHours, 0).toFixed(2),
  );
  const externalHours = Number(
    events.filter((e) => e.blame === "externa").reduce((sum, e) => sum + e.downtimeHours, 0).toFixed(2),
  );
  const machineMap = new Map<string, number>();
  for (const event of events) {
    for (const unit of event.unitHours) {
      if (unit.unit === "Acumulado" || unit.unit === "Parque") continue;
      machineMap.set(unit.unit, Number(((machineMap.get(unit.unit) ?? 0) + unit.hours).toFixed(2)));
    }
  }
  const machines = [...machineMap.entries()]
    .map(([unit, hours]) => ({ unit, hours }))
    .sort((a, b) => b.hours - a.hours);
  const causeMap = new Map<string, { count: number; hours: number }>();
  for (const event of events) {
    const key = event.rootCause.slice(0, 90);
    const cur = causeMap.get(key) ?? { count: 0, hours: 0 };
    cur.count += 1;
    cur.hours = Number((cur.hours + event.downtimeHours).toFixed(2));
    causeMap.set(key, cur);
  }
  const causes = [...causeMap.entries()]
    .map(([label, value]) => ({ label, ...value }))
    .sort((a, b) => b.hours - a.hours || b.count - a.count);

  // Noviembre 2026 · días calendario × 24 h · flota aproximada del FO (no es el cierre contractual).
  const calendarHoursHint = 30 * 24;
  const reliabilityHint =
    downtimeHours > 0 ? Number((100 * (1 - copowerHours / (calendarHoursHint * Math.max(machines.length, 1)))).toFixed(2)) : null;

  return {
    events: events.length,
    downtimeHours,
    copowerHours,
    externalHours,
    machines,
    causes,
    reliabilityHint,
    calendarHoursHint,
  };
}

export function fmtHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0 h";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

/** Horas compactas para KPIs en móvil (119h04, 44m). */
export function compactHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

/** Texto corto para listas móviles (causas, títulos FO). */
export function clipListText(text: string, max = 52): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const atWord = cut.lastIndexOf(" ");
  const base = atWord > 24 ? cut.slice(0, atWord) : cut;
  return `${base}…`;
}
