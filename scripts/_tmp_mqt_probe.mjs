import fs from "node:fs";
import XLSX from "xlsx";

const wb = XLSX.readFile("data/eficiencia/parametros operacion gas moquta.xlsx");
console.log("Hojas:", wb.SheetNames);

for (const name of wb.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true });
  const dates = [];
  for (let i = 2; i < rows.length; i++) {
    const v = (rows[i] || [])[0];
    if (typeof v === "number" && v > 40000 && v < 60000) {
      dates.push(new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 86400000).toISOString().slice(0, 10));
    }
  }
  dates.sort();
  console.log(`\n--- ${name} · filas ${rows.length} · fechas ${dates.length} · ${dates[0]} → ${dates[dates.length - 1]}`);
  console.log("  header r0:", (rows[0] || []).slice(0, 16).map((c) => (c == null ? "" : String(c).slice(0, 18))).join(" | "));
  console.log("  header r1:", (rows[1] || []).slice(0, 16).map((c) => (c == null ? "" : String(c).slice(0, 18))).join(" | "));
  console.log("  fila ej. :", (rows[3] || []).slice(0, 16).map((c) => (c == null ? "" : String(c).slice(0, 18))).join(" | "));
}

// Energía COPOWER de CPW04-06 desde el pack
const pack = JSON.parse(fs.readFileSync("src/domain/reliability/operacion/data/operacionPack.json", "utf8"));
const MQT = new Set(["G54-CPW04", "G55-CPW05", "G56-CPW06"]);
const byMonth = new Map();
for (const r of pack.resumenDiario) {
  if (!MQT.has(r.equipoId)) continue;
  const k = r.fecha.slice(0, 7);
  const cur = byMonth.get(k) ?? { kwh: 0, op: 0, days: new Set() };
  cur.kwh += r.kwAcumuladoDia ?? 0;
  cur.op += r.op ?? 0;
  if ((r.kwAcumuladoDia ?? 0) > 0) cur.days.add(r.fecha);
  byMonth.set(k, cur);
}
console.log("\n=== Energía COPOWER CPW04-06 (reporte diario v40) ===");
console.table(
  [...byMonth.entries()]
    .filter(([, v]) => v.kwh > 0)
    .map(([ym, v]) => ({ ym, kwh: Math.round(v.kwh), opHours: Math.round(v.op), dias: v.days.size })),
);
