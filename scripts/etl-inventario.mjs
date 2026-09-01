/**
 * ETL de inventario bodega Costayaco → inventoryMinimumsData.ts
 *
 * Preferencia: data/Agosto (o AGOSTO) «INVENTARIO FINAL BODEGA…».
 * El xlsx original pesa cientos de MB por fotos; se lee una copia sin media.
 *
 * STOCK = existencia actual (onHand).
 * El mínimo se hereda del catálogo previo por P/N; si no hay match, queda igual a la existencia
 * (o 1 si está en cero, para no generar ítems 0/0).
 *
 * Uso: node scripts/etl-inventario.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import XLSX from "xlsx";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA = path.join(ROOT, "data");
const OUT = path.join(ROOT, "src/domain/reliability/reports/inventoryMinimumsData.ts");
const PREV_OUT = OUT;

const GENERIC_PN = /^(materiales|material\s*electric[oa]s?|herramienta)s?$/i;

function listDirs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory());
}

function findInventoryXlsx() {
  const candidates = [];
  for (const d of listDirs(DATA)) {
    const full = path.join(DATA, d.name);
    const files = fs.readdirSync(full).filter((f) => /INVENTARIO/i.test(f) && f.endsWith(".xlsx"));
    for (const f of files) {
      const p = path.join(full, f);
      const key = d.name.trim().toLowerCase();
      const rank = key === "agosto" ? 0 : /agosto/i.test(key) ? 1 : /mantenimiento/i.test(key) ? 2 : 9;
      candidates.push({ rank, p, size: fs.statSync(p).size });
    }
  }
  candidates.sort((a, b) => a.rank - b.rank || a.size - b.size);
  if (!candidates.length) {
    console.error("No se encontró un xlsx de INVENTARIO bajo data/");
    process.exit(1);
  }
  return candidates[0].p;
}

function slimIfNeeded(xlsxPath) {
  const sizeMb = fs.statSync(xlsxPath).size / 1024 / 1024;
  if (sizeMb < 8) return xlsxPath;
  const tmp = path.join(os.tmpdir(), "inventario-costayaco-slim.xlsx");
  const work = path.join(os.tmpdir(), `inv-slim-${Date.now()}`);
  fs.mkdirSync(work, { recursive: true });
  execFileSync("unzip", ["-q", xlsxPath, "-d", work, "-x", "xl/media/*"]);
  fs.rmSync(path.join(work, "xl/drawings"), { recursive: true, force: true });
  fs.rmSync(path.join(work, "xl/ink"), { recursive: true, force: true });
  fs.rmSync(path.join(work, "xl/worksheets/_rels"), { recursive: true, force: true });
  try {
    fs.unlinkSync(tmp);
  } catch {
    /* ok */
  }
  execFileSync("zip", ["-qr", tmp, "."], { cwd: work });
  fs.rmSync(work, { recursive: true, force: true });
  console.log(`Slim ${sizeMb.toFixed(0)} MB → ${path.basename(tmp)}`);
  return tmp;
}

function num(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v).trim().replace(/\s/g, "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function str(v) {
  if (v == null) return "";
  return String(v).replace(/\s+/g, " ").trim();
}

function norm(v) {
  return str(v).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isGenericPn(code) {
  return !code || GENERIC_PN.test(code) || /materialesel[eé]ctricos/.test(norm(code));
}

function excelDate(v) {
  if (v == null || v === "") return "";
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  const s = str(v);
  const m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    let y = Number(m[3]);
    if (y < 100) y += 2000;
    if (y < 2000) y = 2000 + (y % 100);
    return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s;
}

function loadPreviousMins() {
  if (!fs.existsSync(PREV_OUT)) return new Map();
  const src = fs.readFileSync(PREV_OUT, "utf8");
  const idx = src.indexOf("export const INVENTORY_MINIMUMS");
  if (idx < 0) return new Map();
  const start = src.indexOf("{", src.indexOf("=", idx));
  let depth = 0;
  let end = -1;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) return new Map();
  try {
    const pack = JSON.parse(src.slice(start, end + 1));
    const map = new Map();
    for (const item of pack.items ?? []) {
      const k = norm(item.partNumber);
      if (!k) continue;
      if (!map.has(k)) map.set(k, item.stockMin);
    }
    return map;
  } catch {
    return new Map();
  }
}

function familyFromDesc(code, desc) {
  const blob = `${code} ${desc}`.toLowerCase();
  if (/\bj320\b/.test(blob)) return "J320";
  if (/\bj420\b/.test(blob)) return "J420";
  if (/\bjinan\b/.test(blob)) return "JINAN";
  if (/el[eé]ctric/.test(blob)) return "MATERIALES ELÉCTRICOS";
  if (/herramienta/.test(blob)) return "HERRAMIENTA";
  if (/material/.test(blob)) return "MATERIALES";
  return "";
}

const XLSX_PATH = findInventoryXlsx();
const READ_PATH = slimIfNeeded(XLSX_PATH);
const wb = XLSX.readFile(READ_PATH, { cellDates: true });

const hojaName = wb.SheetNames.find((n) => /hoja\s*1/i.test(n)) ?? wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[hojaName], { header: 1, defval: null, raw: true });

const familyByPn = new Map();
for (const name of wb.SheetNames) {
  const fam = name.trim().toUpperCase();
  if (!["J320", "J420", "JINAN"].includes(fam)) continue;
  const sheet = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: null, raw: true });
  for (let i = 1; i < sheet.length; i++) {
    const code = str(sheet[i]?.[0]);
    if (code && !isGenericPn(code)) familyByPn.set(norm(code), fam);
  }
}

const reviewKeys = new Set();
const reviewSheet = wb.SheetNames.find((n) => /revisar/i.test(n));
if (reviewSheet) {
  const sheet = XLSX.utils.sheet_to_json(wb.Sheets[reviewSheet], { header: 1, defval: null, raw: true });
  for (let i = 1; i < sheet.length; i++) {
    const r = sheet[i] || [];
    const key = `${norm(r[1])}|${norm(r[2])}`;
    if (key !== "|") reviewKeys.add(key);
    if (str(r[7])) reviewKeys.add(key);
  }
}

const prevMin = loadPreviousMins();
let headerIdx = 0;
for (let i = 0; i < Math.min(rows.length, 8); i++) {
  const upper = (rows[i] ?? []).map((c) => str(c).toUpperCase());
  if (upper.some((c) => c.includes("CÓDIGO") || c.includes("CODIGO")) && upper.some((c) => c.includes("STOCK"))) {
    headerIdx = i;
    break;
  }
}

const items = [];
const movements = [];

for (let i = headerIdx + 1; i < rows.length; i++) {
  const r = rows[i] ?? [];
  const code = str(r[1]);
  const description = str(r[2]);
  const received = num(r[4]);
  const issued = num(r[5]);
  const onHand = num(r[6]);
  if (!code && !description) continue;

  const pn = isGenericPn(code) ? "—" : code.toUpperCase();
  const family =
    (pn !== "—" ? familyByPn.get(norm(pn)) : "") || familyFromDesc(code, description) || "SIN CLASIFICAR";
  const review = reviewKeys.has(`${norm(code)}|${norm(description)}`);
  const inherited = pn !== "—" ? prevMin.get(norm(pn)) : undefined;
  let stockMin = inherited ?? (onHand > 0 ? onHand : 1);
  if (stockMin === 0 && onHand === 0) stockMin = 1;

  items.push({
    id: `INV-${String(items.length + 1).padStart(4, "0")}`,
    family,
    description: description || code,
    status: onHand <= 0 ? "AGOTADO" : review ? "REVISIÓN" : onHand < stockMin ? "BAJO" : "BUENO",
    stockMin,
    onHand,
    partNumber: pn,
    received,
    issued,
    review,
  });

  const sDate = excelDate(r[9]);
  const sDesc = str(r[11]);
  const sCode = str(r[10]);
  const sQty = num(r[12]);
  if (sDate || sDesc || sCode) {
    movements.push({
      kind: "salida",
      date: sDate,
      partNumber: isGenericPn(sCode) ? "—" : sCode.toUpperCase() || "—",
      description: sDesc || sCode,
      qty: sQty,
    });
  }
  const eDate = excelDate(r[15]);
  const eDesc = str(r[17]);
  const eCode = str(r[16]);
  const eQty = num(r[18]);
  if (eDate || eDesc || eCode) {
    movements.push({
      kind: "entrada",
      date: eDate,
      partNumber: isGenericPn(eCode) ? "—" : eCode.toUpperCase() || "—",
      description: eDesc || eCode,
      qty: eQty,
    });
  }
}

movements.sort((a, b) => String(a.date).localeCompare(String(b.date)) || a.kind.localeCompare(b.kind));

const payload = {
  sourceFile: path.relative(ROOT, XLSX_PATH).replace(/\\/g, "/"),
  sheet: hojaName.trim(),
  extractedAt: new Date().toISOString().slice(0, 10),
  notes:
    "Cierre bodega Costayaco. STOCK = existencia actual. ENTRADAS/SALIDAS del kardex. Mínimo heredado del catálogo previo por P/N.",
  items,
  movements,
};

const body = `/** Generado por scripts/etl-inventario.mjs — no editar a mano. */
export type InventoryMinItem = {
  id: string;
  family: string;
  description: string;
  status: string;
  /** Mínimo requerido (heredado del catálogo previo por P/N). */
  stockMin: number;
  /** STOCK del kardex — cantidad actual en bodega. */
  onHand: number;
  partNumber: string;
  received: number;
  issued: number;
  review: boolean;
};

export type InventoryMovement = {
  kind: "entrada" | "salida";
  date: string;
  partNumber: string;
  description: string;
  qty: number;
};

export type InventoryMinPack = {
  sourceFile: string;
  sheet: string;
  extractedAt: string;
  notes: string;
  items: InventoryMinItem[];
  movements: InventoryMovement[];
};

export const INVENTORY_MINIMUMS: InventoryMinPack = ${JSON.stringify(payload, null, 2)};
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, body);
const sin = items.filter((i) => i.onHand <= 0).length;
const bajo = items.filter((i) => i.onHand > 0 && i.onHand < i.stockMin).length;
const rev = items.filter((i) => i.review).length;
console.log(
  `OK ${items.length} ítems · ${sin} sin existencia · ${bajo} bajo mínimo · ${rev} a revisar · ${movements.length} movimientos → ${path.relative(ROOT, OUT)}`,
);
console.log(`Fuente: ${path.relative(ROOT, XLSX_PATH)}`);
