/**
 * Inyecta el snapshot GTE agosto (Data Soporte + PDF Presentación GTE)
 * en granTierraMonthly.ts.
 *
 * Uso: node scripts/etl-gte-agosto.mjs && node scripts/inject-gte-agosto.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const monthly = path.join(root, "src/domain/reliability/reports/granTierraMonthly.ts");
const snapPath = path.join(root, "scripts", "_extracted_agosto_gte.json");

if (!fs.existsSync(snapPath)) {
  console.error("Falta", snapPath, "— corre primero: node scripts/etl-gte-agosto.mjs");
  process.exit(1);
}

const snap = JSON.parse(fs.readFileSync(snapPath, "utf8"));
let src = fs.readFileSync(monthly, "utf8");

src = src.replace(
  'export type GranTierraMonthKey = "Ene" | "Feb" | "Mar" | "Abr" | "May" | "Jun" | "Jul";',
  'export type GranTierraMonthKey = "Ene" | "Feb" | "Mar" | "Abr" | "May" | "Jun" | "Jul" | "Ago";',
);
src = src.replace(
  'export const GRAN_TIERRA_MONTH_ORDER: GranTierraMonthKey[] = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"];',
  'export const GRAN_TIERRA_MONTH_ORDER: GranTierraMonthKey[] = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago"];',
);
if (!src.includes('Ago: "Agosto"')) {
  src = src.replace(
    '  Jul: "Julio",\n};',
    '  Jul: "Julio",\n  Ago: "Agosto",\n};',
  );
}
src = src.replace(
  "/** Datos por mes desde data/Costayaco/GTE y data/Costayaco/Julio/GTE. May–Jul: KPIs oficiales de informe; Ene–Abr: estimados Excel. */",
  "/** Datos por mes desde data/Costayaco/GTE/2026-01 a 2026-08. May–Ago: KPIs oficiales; Ene–Abr: estimados Excel. */",
);

// Quitar Ago previo si se reinyecta
src = src.replace(/\n  Ago: \{[\s\S]*?\n  \},\n\};/, "\n};");

const endMarker = "\n};\n\nexport const GRAN_TIERRA_KPI_FROM_MONTHS";
const end = src.indexOf(endMarker);
if (end < 0) {
  console.error("No se encontró el marcador de cierre de GRAN_TIERRA_MONTHLY_DATA");
  process.exit(1);
}

const bodyEnd = src.lastIndexOf("\n};", end);
if (bodyEnd < 0) {
  console.error("No se encontró el cierre del Record");
  process.exit(1);
}

const insert = `,\n  Ago: ${JSON.stringify(snap, null, 2).replace(/^/gm, "  ").trimStart()}`;
// JSON.stringify already has 2-space indent; we need it nested under the Record
const pretty = JSON.stringify(snap, null, 2)
  .split("\n")
  .map((line, i) => (i === 0 ? line : `  ${line}`))
  .join("\n");

const before = src.slice(0, bodyEnd);
const after = src.slice(bodyEnd); // starts with \n};
const patched = `${before},\n  Ago: ${pretty}${after}`;

fs.writeFileSync(monthly, patched);
console.log("Inyectado Ago en", monthly);
console.log(
  "kWh",
  snap.totalGenerationKwh,
  "Disp Sistema N CYC",
  snap.kpi.availability,
  "fallas",
  snap.summary.copowerFailures,
);
