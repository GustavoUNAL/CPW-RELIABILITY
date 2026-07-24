/**
 * ETL: INVENTARIO ACTUALIZADO 2026.xlsx → inventoryMinimumsData.ts
 * STOCK (col D) = stock mínimo · EXISTENCIA = cantidad actual.
 * Uso: node scripts/etl-inventario.mjs
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const ROOT = path.resolve(import.meta.dirname, "..");
const dataRoot = path.join(ROOT, "data");
const maintDir = fs.readdirSync(dataRoot).find((d) => d.trim() === "mantenimiento");
if (!maintDir) {
  console.error("No se encontró carpeta data/mantenimiento");
  process.exit(1);
}
const xlsxName = fs
  .readdirSync(path.join(dataRoot, maintDir))
  .find((f) => /INVENTARIO/i.test(f) && f.endsWith(".xlsx"));
if (!xlsxName) {
  console.error("No se encontró INVENTARIO ACTUALIZADO 2026.xlsx");
  process.exit(1);
}
const XLSX_PATH = path.join(dataRoot, maintDir, xlsxName);
const OUT = path.join(ROOT, "src/domain/reliability/reports/inventoryMinimumsData.ts");

function num(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).trim().replace(/\s/g, "").replace(/,/g, "");
  if (!s || s === "-") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function str(v) {
  if (v == null) return "";
  return String(v).replace(/\s+/g, " ").trim();
}

const wb = XLSX.readFile(XLSX_PATH, { cellDates: true });
const sheetName = wb.SheetNames.find((n) => /REPUESTOS/i.test(n));
if (!sheetName) {
  console.error("Hoja REPUESTOS no encontrada. Hojas:", wb.SheetNames);
  process.exit(1);
}

const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null, raw: true });
let headerIdx = -1;
for (let i = 0; i < Math.min(rows.length, 10); i++) {
  const upper = (rows[i] ?? []).map((c) => str(c).toUpperCase());
  if (upper.includes("STOCK") || upper.includes("STOK")) {
    headerIdx = i;
    break;
  }
}
if (headerIdx < 0) {
  console.error("No se encontró fila de encabezados STOCK/EXISTENCIA");
  process.exit(1);
}

const items = [];
for (let i = headerIdx + 1; i < rows.length; i++) {
  const r = rows[i] ?? [];
  const family = str(r[0]);
  const description = str(r[1]);
  if (!family && !description) continue;
  const stockMin = num(r[3]);
  const onHand = num(r[6]);
  if (stockMin == null && onHand == null && !description) continue;
  items.push({
    id: `INV-${String(items.length + 1).padStart(4, "0")}`,
    family,
    description,
    status: str(r[2]) || "—",
    stockMin: stockMin ?? 0,
    onHand: onHand ?? 0,
    partNumber: str(r[7]) || "—",
  });
}

/** Catálogo operativo: ítems en 0/0 se normalizan a mínimo 1 y existencia 1. */
for (const item of items) {
  if (item.stockMin === 0 && item.onHand === 0) {
    item.stockMin = 1;
    item.onHand = 1;
  }
}

const payload = {
  sourceFile: path.relative(ROOT, XLSX_PATH).replace(/\\/g, "/"),
  sheet: sheetName.trim(),
  extractedAt: new Date().toISOString().slice(0, 10),
  notes:
    "STOCK (columna D) = stock mínimo · EXISTENCIA = cantidad actual. Fuente: hoja REPUESTOS Y CONSUMIBLES.",
  items,
};

const body = `/** Generado por scripts/etl-inventario.mjs — no editar a mano. */
export type InventoryMinItem = {
  id: string;
  family: string;
  description: string;
  status: string;
  /** STOCK / STOK — mínimo requerido. */
  stockMin: number;
  /** EXISTENCIA — cantidad actual en inventario. */
  onHand: number;
  partNumber: string;
};

export type InventoryMinPack = {
  sourceFile: string;
  sheet: string;
  extractedAt: string;
  notes: string;
  items: InventoryMinItem[];
};

export const INVENTORY_MINIMUMS: InventoryMinPack = ${JSON.stringify(payload, null, 2)};
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, body);
console.log(`OK ${items.length} ítems → ${path.relative(ROOT, OUT)}`);
