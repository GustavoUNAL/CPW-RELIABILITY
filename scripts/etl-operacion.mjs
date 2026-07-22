/**
 * ETL: Reporte_Diario_Costayaco_Vonu → JSON normalizado (idempotente).
 * Uso: node scripts/etl-operacion.mjs [ruta.xlsx]
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const ROOT = path.resolve(import.meta.dirname, "..");
const DEFAULT_XLSX = path.join(
  ROOT,
  "data/Datos COPOWER/Reporte_Diario_Costayaco_Vonu 2026 actualizado 34.xlsx",
);
const OUT = path.join(ROOT, "src/domain/reliability/operacion/data/operacionPack.json");

const EQUIPOS = [
  { id: "G52-CPW01", sheetName: "G52-CPW01", label: "CPW01", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "G51-CPW02", sheetName: "G51-CPW02", label: "CPW02", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "G53-CPW03", sheetName: "G53-CPW03", label: "CPW03", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "G54-CPW04", sheetName: "G54-CPW04", label: "CPW04", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "G55-CPW05", sheetName: "G55-CPW05", label: "CPW05", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "G56-CPW06", sheetName: "G56-CPW06", label: "CPW06", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "G57-CPW07", sheetName: "G57-CPW07", label: "CPW07", planta: "Costayaco", combustible: "gas", kwNominal: 800 },
  { id: "JINAN-01", sheetName: "JINAN-01", label: "JINAN-01", planta: "Vonu", combustible: "gas", kwNominal: 450 },
  { id: "JINAN-02", sheetName: "JINAN-02", label: "JINAN-02", planta: "Vonu", combustible: "gas", kwNominal: 450 },
  { id: "JINAN-10", sheetName: "JINAN-10", label: "JINAN-10", planta: "Costayaco", combustible: "gas", kwNominal: 450 },
  { id: "JINAN-11", sheetName: "JINAN-11", label: "JINAN-11", planta: "Costayaco", combustible: "gas", kwNominal: 450 },
  { id: "JINAN-12", sheetName: "JINAN-12", label: "JINAN-12", planta: "Costayaco", combustible: "gas", kwNominal: 450 },
  { id: "G102-J", sheetName: "G102-J", label: "G102-J", planta: "Costayaco", combustible: "diesel", kwNominal: 500 },
  { id: "G102-K", sheetName: "G102-K", label: "G102-K", planta: "Costayaco", combustible: "diesel", kwNominal: 500 },
  { id: "G101-V", sheetName: "G101-V", label: "G101-V", planta: "Costayaco", combustible: "diesel", kwNominal: 500 },
  { id: "DIESEL-2", sheetName: "Diesel 2", label: "DIESEL-2", planta: "Costayaco", combustible: "diesel", kwNominal: 500 },
  { id: "KB600-06", sheetName: "GTE", label: "KB600-06", planta: "Conejo", combustible: "gas", kwNominal: 700 },
  { id: "GAS-2", sheetName: "GTE", label: "GAS-2", planta: "Conejo", combustible: "gas", kwNominal: 700 },
  { id: "KTA19-04", sheetName: "GTE", label: "KTA19-04", planta: "Conejo", combustible: "gas", kwNominal: 400 },
];

const C = {
  fecha: 0, hora: 3, op: 5, sb: 7, pe: 9, mto: 11, fs: 13, tr: 15,
  vl1: 17, vl2: 19, vl3: 21, il1: 23, il2: 25, il3: 27, hz: 29, fp: 31,
  kw: 33, kvar: 35, kwAcumulado: 37, consumoGasM3Kwh: 41, consumoGasFt3Kwh: 45,
  consumoGasMscfH: 49, psiGas: 53, effPct: 55, horometro: 57,
  adicionAceite: 60, cambioAceite: 63, adicionCoolant: 66,
};

function num(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).trim();
  if (!s || /^#DIV\/0!$/i.test(s) || /^#N\/A$/i.test(s) || s === "-") return null;
  const cleaned = s.replace(/\s/g, "").replace(/,/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseDate(v) {
  if (v == null || v === "") return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  // Excel serial
  const asNum = Number(s);
  if (Number.isFinite(asNum) && asNum > 40000 && asNum < 60000) {
    const d = XLSX.SSF.parse_date_code(asNum);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  // 1-Jan-26 / 1-May-26
  const m = s.match(/^(\d{1,2})[-/]([A-Za-z]{3})[-/](\d{2,4})$/);
  if (m) {
    const months = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
    const mon = months[m[2].toLowerCase()];
    if (!mon) return null;
    let y = Number(m[3]);
    if (y < 100) y += 2000;
    return `${y}-${String(mon).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`;
  }
  // Jan-26
  const m2 = s.match(/^([A-Za-z]{3})[-/](\d{2,4})$/);
  if (m2) {
    const months = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
    const mon = months[m2[1].toLowerCase()];
    if (!mon) return null;
    let y = Number(m2[2]);
    if (y < 100) y += 2000;
    return `${y}-${String(mon).padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return null;
}

function parseHour(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") {
    if (v >= 0 && v < 1) return Math.round(v * 24) % 24; // excel time fraction
    if (v >= 0 && v <= 23) return Math.round(v);
  }
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?/);
  if (!m) return null;
  return Math.min(23, Math.max(0, Number(m[1])));
}

function findHeaderRow(rows, pred) {
  for (let i = 0; i < Math.min(30, rows.length); i++) {
    if (pred(rows[i] || [], i)) return i;
  }
  return -1;
}

function sheetRows(wb, name) {
  const sh = wb.Sheets[name];
  if (!sh) return [];
  return XLSX.utils.sheet_to_json(sh, { header: 1, defval: null, raw: true });
}

function guessEquipoId(text) {
  if (!text) return null;
  const t = String(text).toUpperCase().replace(/\s+/g, "");
  const patterns = [
    [/G52|CPW[-]?0?1\b|CPW01/, "G52-CPW01"],
    [/G51|CPW[-]?0?2\b|CPW02/, "G51-CPW02"],
    [/G53|CPW[-]?0?3\b|CPW03/, "G53-CPW03"],
    [/G54|CPW[-]?0?4\b|CPW04/, "G54-CPW04"],
    [/G55|CPW[-]?0?5\b|CPW05/, "G55-CPW05"],
    [/G56|CPW[-]?0?6\b|CPW06/, "G56-CPW06"],
    [/G57|CPW[-]?0?7\b|CPW07/, "G57-CPW07"],
    [/JINAN[-]?01|JIN-01/, "JINAN-01"],
    [/JINAN[-]?02|JIN-02/, "JINAN-02"],
    [/JINAN[-]?10|JIN-10/, "JINAN-10"],
    [/JINAN[-]?11|JIN-11/, "JINAN-11"],
    [/JINAN[-]?12|JIN-12/, "JINAN-12"],
    [/G102[-]?J/, "G102-J"],
    [/G102[-]?K/, "G102-K"],
    [/G101[-]?V/, "G101-V"],
    [/DIESEL[-]?2/, "DIESEL-2"],
    [/KB600/, "KB600-06"],
    [/GAS[-]?2/, "GAS-2"],
    [/KTA19/, "KTA19-04"],
  ];
  for (const [re, id] of patterns) {
    if (re.test(t) || re.test(String(text).toUpperCase())) return id;
  }
  return null;
}

function parseTiempoFueraMin(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") return v < 24 ? v * 60 : v; // hours vs minutes heuristic
  const s = String(v).toLowerCase().replace(/\s+/g, " ").trim();
  const hm = s.match(/(\d+)\s*h(?:rs?|oras?)?\s*(\d+)?/);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2] || 0);
  const min = s.match(/(\d+)\s*min/);
  if (min) return Number(min[1]);
  const plain = num(s);
  if (plain == null) return null;
  return plain < 24 ? plain * 60 : plain;
}

function parseResumenOP(wb) {
  const rows = sheetRows(wb, "Resumen OP");
  if (!rows.length) return [];
  const nameRow = rows[3] || [];
  const hdrRow = rows[4] || [];
  const starts = [];
  nameRow.forEach((c, i) => {
    if (c != null && String(c).trim()) starts.push({ id: String(c).trim(), col: i });
  });

  const out = [];
  for (let s = 0; s < starts.length; s++) {
    const { id, col } = starts[s];
    const end = s + 1 < starts.length ? starts[s + 1].col : hdrRow.length;
    const headers = [];
    for (let c = col; c < end; c++) {
      const h = hdrRow[c];
      headers.push(h != null ? String(h).trim().toLowerCase() : "");
    }
    const idx = (names) => headers.findIndex((h) => names.some((n) => h.includes(n)));
    const iDia = idx(["dia"]);
    const iOp = idx(["op"]);
    const iSb = idx(["sb"]);
    const iPe = idx(["pe"]);
    const iMto = idx(["mto"]);
    const iFs = idx(["fs"]);
    const iTr = idx(["tr"]);
    const iKw = idx(["kw acumulado", "kw acumulado dia"]);
    const iMscf = idx(["mscfd"]);
    const iFt3 = idx(["ft³/kwh", "ft3/kwh", "ft"]);
    const iKwP = idx(["kw promedio"]);

    for (let r = 5; r < rows.length; r++) {
      const row = rows[r] || [];
      const fecha = parseDate(row[col + Math.max(iDia, 0)]);
      if (!fecha) continue;
      const op = num(row[col + iOp]) ?? 0;
      const sb = num(row[col + iSb]) ?? 0;
      const pe = num(row[col + iPe]) ?? 0;
      const mto = num(row[col + iMto]) ?? 0;
      const fs = num(row[col + iFs]) ?? 0;
      if (op + sb + pe + mto + fs === 0 && num(row[col + iKw]) == null) continue;
      out.push({
        fecha,
        equipoId: id,
        op, sb, pe, mto, fs,
        tr: num(row[col + iTr]) ?? 0,
        kwAcumuladoDia: iKw >= 0 ? num(row[col + iKw]) : null,
        consumoGasMscfd: iMscf >= 0 ? num(row[col + iMscf]) : null,
        consumoGasFt3Kwh: iFt3 >= 0 ? num(row[col + iFt3]) : null,
        kwPromedioDia: iKwP >= 0 ? num(row[col + iKwP]) : null,
      });
    }
  }
  return out;
}

function parseEventos(wb) {
  const rows = sheetRows(wb, "Eventos de Generacion");
  const out = [];
  let n = 0;
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i] || [];
    // DIA cols 0,1,2,6
    const fechaD = parseDate(row[0]);
    const descD = row[2] != null ? String(row[2]).trim() : "";
    if (fechaD && descD) {
      out.push({
        id: `EV-D-${++n}`,
        fecha: fechaD,
        hora: row[1] != null ? String(row[1]) : null,
        turno: "DIA",
        descripcion: descD,
        tiempoFueraMin: parseTiempoFueraMin(row[6]),
        equipoId: guessEquipoId(descD),
      });
    }
    // NOCHE cols 7,8,9,13
    const fechaN = parseDate(row[7]);
    const descN = row[9] != null ? String(row[9]).trim() : "";
    if (fechaN && descN) {
      out.push({
        id: `EV-N-${++n}`,
        fecha: fechaN,
        hora: row[8] != null ? String(row[8]) : null,
        turno: "NOCHE",
        descripcion: descN,
        tiempoFueraMin: parseTiempoFueraMin(row[13]),
        equipoId: guessEquipoId(descN),
      });
    }
  }
  return out;
}

function parseActividades(wb) {
  const rows = sheetRows(wb, "Actividades diarias");
  const out = [];
  let n = 0;
  let fecha = null;
  let turno = "DIA";
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    const joined = row.map((c) => (c == null ? "" : String(c))).join(" ").toLowerCase();
    if (/turno\s*de\s*dia|turno dia/.test(joined)) { turno = "DIA"; continue; }
    if (/turno\s*de\s*noche|turno noche/.test(joined)) { turno = "NOCHE"; continue; }
    const d = parseDate(row[0]) || parseDate(row[1]);
    if (d) fecha = d;
    // look for hour + description patterns in various columns
    for (let c = 0; c < row.length - 1; c++) {
      const hora = row[c] != null && /^\d{1,2}:\d{2}/.test(String(row[c])) ? String(row[c]) : null;
      const desc = row[c + 1] != null ? String(row[c + 1]).trim() : "";
      if (hora && desc.length > 12 && fecha) {
        out.push({
          id: `ACT-${++n}`,
          fecha,
          turno,
          hora,
          tecnico: null,
          descripcion: desc,
          personalCampo: null,
          cargo: null,
        });
      }
    }
  }
  return out;
}

function parseConsumos(wb) {
  const rows = sheetRows(wb, "Consumos");
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const mes = parseDate(row[0]);
    const equipoRaw = row[2] != null ? String(row[2]).trim() : "";
    if (!mes || !equipoRaw) continue;
    const equipoId = guessEquipoId(equipoRaw) || equipoRaw.replace(/\s+/g, "");
    out.push({
      mes: mes.length === 7 ? mes : mes.slice(0, 7),
      locacion: row[1] != null ? String(row[1]).trim() : "",
      equipoId,
      adicionAceite: num(row[4]) ?? 0,
      cambioAceite: num(row[5]) ?? 0,
      adicionCoolant: num(row[6]) ?? 0,
    });
  }
  return out;
}

function parseConejo(wb) {
  const rows = sheetRows(wb, "GTE");
  const out = [];
  let fecha = null;
  let hora = null;
  for (let i = 8; i < rows.length; i++) {
    const row = rows[i] || [];
    const f = parseDate(row[0]);
    if (f) fecha = f;
    if (row[3] != null && String(row[3]).trim()) hora = String(row[3]);
    const eqRaw = row[5] != null ? String(row[5]).trim() : "";
    if (!eqRaw || !fecha) continue;
    const equipoId = guessEquipoId(eqRaw) || eqRaw.replace(/\s+/g, "-").toUpperCase();
    out.push({
      fecha,
      hora,
      equipoId,
      horometro: num(row[8]),
      cargaKw: num(row[11]),
      kwh24: num(row[14]),
      estado: row[17] != null ? String(row[17]).trim() : null,
      consumoTeorico: num(row[22]),
      horasOp: num(row[25]) ?? 0,
      horasSb: num(row[28]) ?? 0,
      horasPe: num(row[31]) ?? 0,
      horasMto: num(row[34]) ?? 0,
      horasFs: num(row[37]) ?? 0,
      horasTr: num(row[40]) ?? 0,
      presion: num(row[43]),
      gasMscfd: null,
    });
  }
  return out;
}

function parseHourlyRecent(wb, equipo, keepFromDate) {
  const rows = sheetRows(wb, equipo.sheetName);
  const hdr = findHeaderRow(rows, (r) => String(r[5] || "").toUpperCase() === "OP" && String(r[0] || "").toUpperCase().includes("DIA"));
  if (hdr < 0) return [];
  const out = [];
  let lastFecha = null;
  for (let i = hdr + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const f = parseDate(row[C.fecha]) || lastFecha;
    if (parseDate(row[C.fecha])) lastFecha = parseDate(row[C.fecha]);
    if (!f || f < keepFromDate) continue;
    const hora = parseHour(row[C.hora]);
    if (hora == null) continue;
    const op = num(row[C.op]) ?? 0;
    const sb = num(row[C.sb]) ?? 0;
    const pe = num(row[C.pe]) ?? 0;
    const mto = num(row[C.mto]) ?? 0;
    const fs = num(row[C.fs]) ?? 0;
    const kw = num(row[C.kw]);
    if (op + sb + pe + mto + fs === 0 && kw == null) continue;
    out.push({
      fecha: f,
      hora,
      equipoId: equipo.id,
      op, sb, pe, mto, fs,
      tr: num(row[C.tr]) ?? 0,
      vl1: num(row[C.vl1]),
      vl2: num(row[C.vl2]),
      vl3: num(row[C.vl3]),
      il1: num(row[C.il1]),
      il2: num(row[C.il2]),
      il3: num(row[C.il3]),
      hz: num(row[C.hz]),
      fp: num(row[C.fp]),
      kw,
      kvar: num(row[C.kvar]),
      kwAcumulado: num(row[C.kwAcumulado]),
      consumoGasM3Kwh: num(row[C.consumoGasM3Kwh]),
      consumoGasFt3Kwh: num(row[C.consumoGasFt3Kwh]),
      consumoGasMscfH: num(row[C.consumoGasMscfH]),
      psiGas: num(row[C.psiGas]),
      effPct: num(row[C.effPct]),
      horometro: num(row[C.horometro]),
      adicionAceite: num(row[C.adicionAceite]),
      cambioAceite: num(row[C.cambioAceite]),
      adicionCoolant: num(row[C.adicionCoolant]),
    });
  }
  return out;
}

function dominantEstado(h) {
  const entries = [["OP", h.op], ["SB", h.sb], ["PE", h.pe], ["MTO", h.mto], ["FS", h.fs]];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][1] > 0 ? entries[0][0] : "SB";
}

function main() {
  const xlsxPath = path.resolve(process.argv[2] || DEFAULT_XLSX);
  console.log("Leyendo", xlsxPath);
  const wb = XLSX.read(fs.readFileSync(xlsxPath), { type: "buffer", cellDates: true });

  const resumenDiario = parseResumenOP(wb);
  const eventos = parseEventos(wb);
  const actividades = parseActividades(wb);
  const consumos = parseConsumos(wb);
  const conejo = parseConejo(wb);

  const dates = resumenDiario.map((r) => r.fecha).sort();
  const maxDate = dates[dates.length - 1] || "2026-07-01";
  const keepFrom = new Date(maxDate);
  keepFrom.setDate(keepFrom.getDate() - 13);
  const keepFromDate = keepFrom.toISOString().slice(0, 10);

  const hourlyRecent = {};
  for (const eq of EQUIPOS.filter((e) => e.planta !== "Conejo")) {
    if (!wb.Sheets[eq.sheetName]) continue;
    console.log("Horario reciente", eq.id);
    hourlyRecent[eq.id] = parseHourlyRecent(wb, eq, keepFromDate);
  }

  // status from last resumen day per equipo
  const byEq = new Map();
  for (const r of resumenDiario) {
    const prev = byEq.get(r.equipoId);
    if (!prev || r.fecha >= prev.fecha) byEq.set(r.equipoId, r);
  }
  const status = [...byEq.values()].map((r) => {
    const den = r.op + r.sb + r.pe + r.mto + r.fs;
    return {
      equipoId: r.equipoId,
      fecha: r.fecha,
      estado: dominantEstado(r),
      kw: r.kwPromedioDia,
      horometro: null,
      disponibilidadPct: den > 0 ? (r.op / den) * 100 : null,
    };
  });

  const pack = {
    generatedAt: new Date().toISOString(),
    sourceFile: path.relative(ROOT, xlsxPath),
    dateRange: { min: dates[0] || "", max: maxDate },
    equipos: EQUIPOS,
    resumenDiario,
    eventos,
    actividades,
    consumos,
    conejo,
    hourlyRecent,
    status,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(pack));
  const mb = (fs.statSync(OUT).size / (1024 * 1024)).toFixed(2);
  console.log(
    `OK → ${path.relative(ROOT, OUT)} (${mb} MB) · resumen ${resumenDiario.length} · eventos ${eventos.length} · actividades ${actividades.length} · consumos ${consumos.length} · conejo ${conejo.length}`,
  );
}

main();
