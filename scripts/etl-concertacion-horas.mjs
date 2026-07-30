/**
 * ETL: Reporte diario de operaciones → pack de concertación de horas.
 * Uso: node scripts/etl-concertacion-horas.mjs [ruta.xlsx] [--desde YYYY-MM-DD] [--hasta YYYY-MM-DD]
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const ROOT = path.resolve(import.meta.dirname, "..");
const DEFAULT_XLSX = path.join(
  ROOT,
  "data/concertacion horas/REPORTE DIARIO DE OPERACIONES HASTA 28-07-2026.xlsx",
);
const OUT = path.join(ROOT, "src/domain/reliability/concertacion/data/concertacionPack.json");

const DEFAULT_DESDE = "2026-07-12";
const DEFAULT_HASTA = "2026-07-29";

function parseArgs() {
  const args = process.argv.slice(2);
  let xlsx = DEFAULT_XLSX;
  let desde = DEFAULT_DESDE;
  let hasta = DEFAULT_HASTA;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--desde") desde = args[++i];
    else if (args[i] === "--hasta") hasta = args[++i];
    else if (!args[i].startsWith("--")) xlsx = path.resolve(args[i]);
  }
  return { xlsx, desde, hasta };
}

function isoDate(v) {
  if (v == null || v === "") return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return null;
}

function num(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(String(v).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function normHeader(h) {
  return String(h ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function inRange(iso, desde, hasta) {
  return iso >= desde && iso <= hasta;
}

function normalizeTag(tag) {
  const t = String(tag ?? "").trim().toUpperCase();
  const m = t.match(/^CPW\s*0?(\d+)$/);
  if (m) return `CPW-${m[1].padStart(2, "0")}`;
  return t.replace(/\s+/g, "-");
}

const { xlsx, desde, hasta } = parseArgs();
if (!fs.existsSync(xlsx)) {
  console.error("No se encontró:", xlsx);
  process.exit(1);
}

const wb = XLSX.readFile(xlsx, { cellDates: true });
const sheetName = wb.SheetNames.find((n) => /REPORTE DIARIO/i.test(n)) ?? wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null, raw: true });
const header = (rows[0] ?? []).map(normHeader);

const col = {};
for (let i = 0; i < header.length; i++) {
  const h = header[i];
  if (!h) continue;
  col[h] = i;
  if (/^Horas Operacion/i.test(h)) col.horasOp = i;
  if (h === "total horas") col.totalHoras = i;
}

const records = [];
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  if (!row?.length) continue;
  const fecha = isoDate(row[col.Fecha ?? 0]);
  if (!fecha || !inRange(fecha, desde, hasta)) continue;

  const tag = normalizeTag(row[col["TAG de la unidad"] ?? 5]);
  const horasOp = num(row[col.horasOp ?? col["Horas Operacion"] ?? 12]);
  const horasSb = num(row[col["Horas StandBy"] ?? 13]);
  const horasPrev = num(row[col["Horas MMT Preventivo"] ?? 14]);
  const horasCorr = num(row[col["Horas MMT Correctivo"] ?? 15]);
  const totalHoras = num(row[col.totalHoras ?? 16]) || horasOp + horasSb + horasPrev + horasCorr;
  const horasExt = num(row[col["Horas Paradas Externas"] ?? 17]);
  const obs = row[col.Observaciones ?? 24];
  const observaciones = obs == null || String(obs).trim() === "" ? null : String(obs).trim();

  records.push({
    fecha,
    cuenca: row[col.Cuenca ?? 1] ?? null,
    campo: row[col.Campo ?? 2] ?? null,
    contratista: row[col.Contratista ?? 3] ?? null,
    unidad: row[col.Unidad ?? 4] ?? null,
    tag,
    capacidadInstaladaKw: num(row[col["capacidad instalada"] ?? 6]) || null,
    capacidadEntregadaKw: num(row[col["Capacidad Entregada (kW)"] ?? 7]) || null,
    horometroInicial: num(row[col["Horometro inicial"] ?? 8]) || null,
    horometroFinal: num(row[col["Horometro final"] ?? 9]) || null,
    kwhGenerados: num(row[col["KWH generados"] ?? 10]) || null,
    potenciaPromedioKw: num(row[col["Potencia promedio"] ?? 11]) || null,
    horasOperacion: horasOp,
    horasStandBy: horasSb,
    horasMmtPreventivo: horasPrev,
    horasMmtCorrectivo: horasCorr,
    totalHoras,
    horasParadasExternas: horasExt,
    numeroFallas: num(row[col["Numero de fallas"] ?? 18]),
    combustiblePrimario: row[col["Tipo de combustible Primario"] ?? 19] ?? null,
    observaciones,
    balanceOk: Math.abs(totalHoras - 24) < 0.01,
    sumaComponentes: horasOp + horasSb + horasPrev + horasCorr,
    sumaOk: Math.abs(horasOp + horasSb + horasPrev + horasCorr - totalHoras) < 0.01,
  });
}

records.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.tag.localeCompare(b.tag));

const fechas = [...new Set(records.map((r) => r.fecha))].sort();
const tags = [...new Set(records.map((r) => r.tag))].sort();

const pack = {
  meta: {
    fuente: path.basename(xlsx),
    hoja: sheetName,
    generado: new Date().toISOString().slice(0, 10),
    periodo: { desde, hasta },
    fechasConDatos: fechas,
    diasConDatos: fechas.length,
    diasEsperados:
      Math.round((new Date(`${hasta}T12:00:00`) - new Date(`${desde}T12:00:00`)) / 86400000) + 1,
    unidades: tags.length,
    registros: records.length,
    notas: [
      "Concertación: OP + SB + MMT prev + MMT corr = 24 h por unidad/día.",
      "Horas paradas externas se reportan aparte (atribución contractual).",
    ],
  },
  registros: records,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(pack, null, 2));
console.log(`OK ${records.length} registros → ${OUT}`);
console.log(`Período ${desde}–${hasta} · ${fechas.length} días · ${tags.length} unidades`);
