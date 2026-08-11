/**
 * Inyecta el snapshot GTE julio (Data Soporte + PDF) en granTierraMonthly.ts
 * y antepone las 3 fallas COPOWER concertadas.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const monthly = path.join(root, "src/domain/reliability/reports/granTierraMonthly.ts");
const snapPath = path.join(root, "scripts/_extracted_julio_gte.json");

const snap = JSON.parse(fs.readFileSync(snapPath, "utf8"));

const concertacionFailures = [
  {
    date: "2026-07-09",
    equipment: "CPW06",
    eventType: "Falla",
    cause:
      "CPW-06-FDL al momento de salida de la MRU alto nivel de GLP en el recipiente. Presenta alta potencia de Reactiva.",
    downtimeHours: 0,
    responsible: "COPOWER",
    notes: "Horas concertadas · Numero de fallas 1 · PF_contr 0 h",
  },
  {
    date: "2026-07-04",
    equipment: "CPW06",
    eventType: "Falla",
    cause: "13:37 Sale de linea equipo CPW-06 por sobre carga en generador",
    downtimeHours: 0,
    responsible: "COPOWER",
    notes: "Horas concertadas · Numero de fallas 1 · PF_contr 0 h",
  },
  {
    date: "2026-07-04",
    equipment: "CPW07",
    eventType: "Falla",
    cause: "13:35 Sale de linea equipo CPW-07 por sobre carga en generador",
    downtimeHours: 0,
    responsible: "COPOWER",
    notes: "Horas concertadas · Numero de fallas 1 · PF_contr 0 h",
  },
];

snap.eventLog = [...concertacionFailures, ...snap.eventLog];
snap.summary.copowerFailures = 3;
snap.summary.totalEvents = snap.eventLog.length;
snap.summary.mtbfHours = 2410.67;
snap.summary.mttrHours = 0;

for (const row of snap.machineIndicators ?? []) {
  if (row.unidad === "SISTEMA N" && row.campo === "COSTAYACO") {
    row.fallas = 3;
    row.detalle = `${row.detalle} Concertación imputa 3 fallas COPOWER (CPW06×2, CPW07×1).`;
  }
}

let src = fs.readFileSync(monthly, "utf8");
src = src.replace(
  'export type GranTierraMonthKey = "Ene" | "Feb" | "Mar" | "Abr" | "May" | "Jun";',
  'export type GranTierraMonthKey = "Ene" | "Feb" | "Mar" | "Abr" | "May" | "Jun" | "Jul";',
);
src = src.replace(
  'export const GRAN_TIERRA_MONTH_ORDER: GranTierraMonthKey[] = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];',
  'export const GRAN_TIERRA_MONTH_ORDER: GranTierraMonthKey[] = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"];',
);
if (!src.includes("Jul: \"Julio\"")) {
  src = src.replace(
    '  Jun: "Junio",\n};',
    '  Jun: "Junio",\n  Jul: "Julio",\n};',
  );
}
src = src.replace(
  "/** Datos por mes desde data/GTE. May/Jun: KPIs oficiales de informe; Ene–Abr: estimados Excel. */",
  "/** Datos por mes desde data/GTE y data/Julio/GTE. May–Jul: KPIs oficiales de informe; Ene–Abr: estimados Excel. */",
);

const endMarker = "\n};\n\nexport const GRAN_TIERRA_KPI_FROM_MONTHS";
const end = src.indexOf(endMarker);
if (end < 0) {
  console.error("No se encontró cierre de GRAN_TIERRA_MONTHLY_DATA");
  process.exit(1);
}

if (src.includes('  "Jul": {')) {
  const start = src.indexOf('  "Jul": {');
  const julBlock = `  "Jul": ${JSON.stringify(snap, null, 4).replace(/^/gm, "  ").trimStart()}\n`;
  src = src.slice(0, start) + julBlock + src.slice(end);
} else {
  const julBlock = `,\n  "Jul": ${JSON.stringify(snap, null, 4).replace(/^/gm, "  ").trimStart()}\n`;
  src = src.slice(0, end) + julBlock + src.slice(end);
}

fs.writeFileSync(monthly, src);
console.log("GTE Jul inyectado · eventos", snap.eventLog.length, "fallas", snap.summary.copowerFailures);
