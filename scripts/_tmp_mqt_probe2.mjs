import XLSX from "xlsx";

const wb = XLSX.readFile("data/eficiencia/parametros operacion gas moquta.xlsx");
const excelDay = (n) =>
  new Date(Date.UTC(1899, 11, 30) + Math.floor(n) * 86400000).toISOString().slice(0, 10);

for (const name of wb.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true });
  const hdr = (rows[1] || []).map((c) => (c == null ? "" : String(c).replace(/\s+/g, " ").trim()));
  const find = (re) => hdr.findIndex((h) => re.test(h));
  const iTot = find(/gas\s*acumulado\s*total/i);
  const iHoy = find(/gas\s*acumulado\s*hoy/i);
  const iFlow = find(/flujo/i);
  const iMqt = hdr.findIndex((h) => /llegada gas (moqueta|mqt)/i.test(h)) >= 0
    ? hdr.findIndex((h) => /llegada gas (moqueta|mqt)/i.test(h))
    : find(/presion\s*llegada/i);
  console.log(`\n=== ${name} ===`);
  console.log("  cols → totalizer:", iTot, "| hoy:", iHoy, "| flujo:", iFlow, "| presion llegada:", iMqt);
  console.log("  headers:", hdr.map((h, i) => `${i}:${h.slice(0, 22)}`).filter((s) => !s.endsWith(":")).join("  "));

  const pts = [];
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i] || [];
    const f = r[0];
    if (typeof f !== "number" || f < 40000 || f > 60000) continue;
    const t = iTot >= 0 ? r[iTot] : null;
    if (typeof t !== "number" || t <= 1000) continue;
    pts.push({ day: excelDay(f), hour: typeof r[1] === "number" ? r[1] : 0.5, tot: t });
  }
  pts.sort((a, b) => a.day.localeCompare(b.day) || a.hour - b.hour);
  if (!pts.length) {
    console.log("  sin lecturas de totalizador");
    continue;
  }
  console.log(`  lecturas: ${pts.length} · ${pts[0].day} (${pts[0].tot}) → ${pts[pts.length - 1].day} (${pts[pts.length - 1].tot})`);
  console.log(`  delta bruto: ${(pts[pts.length - 1].tot - pts[0].tot).toFixed(1)} MCF`);
  // distribución de meses
  const byM = {};
  for (const p of pts) byM[p.day.slice(0, 7)] = (byM[p.day.slice(0, 7)] ?? 0) + 1;
  console.log("  por mes:", JSON.stringify(byM));
}
