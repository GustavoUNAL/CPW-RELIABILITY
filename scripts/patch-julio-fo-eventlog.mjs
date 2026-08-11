/**
 * Anexa EVT-/FO-GE-033 a la bitácora de julio (COPOWER + GTE).
 * Ancla estricta: bloque `  "Jul": {` del snapshot mensual.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const FO_RULES = [
  {
    date: "2026-07-12",
    evt: "EVT-2026-07-12-MRU",
    fo: "FO-GE-033 No. 58",
    eventType: "Causa comun",
    responsible: "GTE",
    units: new Set(["CPW01", "CPW03", "CPW07", "JIN-10", "JIN-11", "JIN-12"]),
  },
  {
    date: "2026-07-21",
    evt: "EVT-2026-07-21-CPW04",
    fo: "FO-GE-033 No. 60",
    eventType: "Falla",
    responsible: "GTE + COPOWER",
    units: new Set(["CPW04"]),
  },
  {
    date: "2026-07-21",
    evt: "EVT-2026-07-21-MRU",
    fo: "FO-GE-033 No. 61",
    eventType: "Causa comun",
    responsible: "GTE",
    units: new Set(["CPW01", "CPW02", "CPW03", "CPW07", "JIN-10"]),
  },
  {
    date: "2026-07-24",
    evt: "EVT-2026-07-24-MRU",
    fo: "FO-GE-033 No. 62",
    eventType: "Causa comun",
    responsible: "Externo",
    units: new Set(["CPW01", "CPW02", "CPW03", "CPW07", "JIN-10"]),
  },
  {
    date: "2026-07-25",
    evt: "EVT-2026-07-25-MRU",
    fo: "FO-GE-033 No. 63",
    eventType: "Causa comun",
    responsible: "GTE",
    units: new Set(["CPW01", "CPW02", "CPW03", "CPW07", "JIN-10", "JIN-11"]),
  },
];

const GTE_HEADERS = [
  {
    date: "2026-07-25",
    equipment: "PARQUE",
    eventType: "Causa comun",
    cause:
      "12:58 Cascada MRU por sobrepresión manifold CYC (CPW-01/02/03/07, JIN-10/11). Reingreso 14:39–15:23.",
    downtimeHours: 2.42,
    responsible: "GTE",
    notes: "EVT-2026-07-25-MRU · FO-GE-033 No. 63 · data/Julio/RCA",
  },
  {
    date: "2026-07-24",
    equipment: "PARQUE",
    eventType: "Causa comun",
    cause:
      "07:08 Cascada MRU por disparo reconectador EEP 34.5 kV Junín–Mocoa (CPW-01/02/03/07, JIN-10). Reingreso CPW ~08:40–09:00; JIN-10 19:09.",
    downtimeHours: 1.87,
    responsible: "Externo",
    notes: "EVT-2026-07-24-MRU · FO-GE-033 No. 62 · data/Julio/RCA",
  },
  {
    date: "2026-07-21",
    equipment: "PARQUE",
    eventType: "Causa comun",
    cause:
      "17:55 Cascada MRU por alto nivel de GLP (CPW-01/02/03/07, JIN-10). Reingreso 21:11–22:32. FS máx. 4,62 h.",
    downtimeHours: 4.62,
    responsible: "GTE",
    notes: "EVT-2026-07-21-MRU · FO-GE-033 No. 61 · data/Julio/RCA",
  },
  {
    date: "2026-07-21",
    equipment: "CPW04",
    eventType: "Falla",
    cause:
      "15:16 Detonación alta en un cilindro (gas MQT). Stand-by hasta 20:21 (5,08 h). Deslastre 1040→850 kW.",
    downtimeHours: 5.08,
    responsible: "GTE + COPOWER",
    notes: "EVT-2026-07-21-CPW04 · FO-GE-033 No. 60 · data/Julio/RCA",
  },
  {
    date: "2026-07-12",
    equipment: "PARQUE",
    eventType: "Causa comun",
    cause:
      "05:28 Cascada MRU por baja presión de aceite Quincy (CPW-01/03/07, JIN-10/11/12). Reingreso 07:16–08:00. FS máx. 2,53 h.",
    downtimeHours: 2.53,
    responsible: "GTE",
    notes: "EVT-2026-07-12-MRU · FO-GE-033 No. 58 · data/Julio/RCA",
  },
];

function extractJulEventLog(src) {
  const julIdx = src.indexOf('  "Jul": {');
  if (julIdx < 0) throw new Error('No se encontró bloque   "Jul": {');
  const logIdx = src.indexOf('"eventLog"', julIdx);
  if (logIdx < 0) throw new Error("No se encontró eventLog de Jul");
  const start = src.indexOf("[", logIdx);
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (ch === "[") depth += 1;
    else if (ch === "]") {
      depth -= 1;
      if (depth === 0) return { start, end: i + 1, text: src.slice(start, i + 1) };
    }
  }
  throw new Error("eventLog Jul sin cierre");
}

function applyFo(ev) {
  const hit = FO_RULES.find((r) => r.date === ev.date && r.units.has(ev.equipment));
  if (!hit) return { ev, changed: false };
  const tag = `${hit.evt} · ${hit.fo}`;
  const notes = ev.notes?.includes(hit.evt) ? ev.notes : `${ev.notes} · ${tag}`;
  return {
    changed: true,
    ev: {
      ...ev,
      eventType: hit.eventType,
      responsible: hit.responsible,
      notes,
    },
  };
}

function stringifyLog(events, indent) {
  const pad = " ".repeat(indent);
  const inner = " ".repeat(indent + 4);
  const field = " ".repeat(indent + 8);
  const rows = events.map((ev) => {
    const entries = Object.entries(ev)
      .map(([k, v]) => `${field}${JSON.stringify(k)}: ${JSON.stringify(v)}`)
      .join(",\n");
    return `${inner}{\n${entries}\n${inner}}`;
  });
  return `[\n${rows.join(",\n")}\n${pad}]`;
}

function patchTotalEvents(src, total) {
  const julIdx = src.indexOf('  "Jul": {');
  const marker = '"totalEvents":';
  const idx = src.indexOf(marker, julIdx);
  if (idx < 0) return src;
  const after = idx + marker.length;
  const end = src.indexOf(",", after);
  return `${src.slice(0, after)} ${total}${src.slice(end)}`;
}

function patchFile(rel, { prependHeaders, bumpTotal }) {
  const file = path.join(root, rel);
  const src = fs.readFileSync(file, "utf8");
  const block = extractJulEventLog(src);
  const events = JSON.parse(block.text);
  let changed = 0;
  const next = events.map((ev) => {
    const out = applyFo(ev);
    if (out.changed) changed += 1;
    return out.ev;
  });

  let finalEvents = next;
  if (prependHeaders) {
    const already = next.some((e) => String(e.notes ?? "").includes("EVT-2026-07-12-MRU"));
    if (!already) finalEvents = [...GTE_HEADERS, ...next];
  }

  const newBlock = stringifyLog(finalEvents, 6);
  let out = src.slice(0, block.start) + newBlock + src.slice(block.end);
  if (bumpTotal) out = patchTotalEvents(out, finalEvents.length);
  fs.writeFileSync(file, out);
  return { file: rel, updated: changed, total: finalEvents.length };
}

const cpw = patchFile("src/domain/reliability/reports/copowerMonthly.ts", {
  prependHeaders: false,
  bumpTotal: false,
});
const gte = patchFile("src/domain/reliability/reports/granTierraMonthly.ts", {
  prependHeaders: true,
  bumpTotal: true,
});

console.log(JSON.stringify({ cpw, gte }, null, 2));
