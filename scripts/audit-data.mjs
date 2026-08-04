/**
 * Auditoría offline de integridad de datos (sin bundler).
 * Uso: npm run audit:data
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const findings = [];

function ok(area, msg) {
  findings.push({ severity: "ok", area, message: msg });
}
function warn(area, msg) {
  findings.push({ severity: "warn", area, message: msg });
}
function error(area, msg) {
  findings.push({ severity: "error", area, message: msg });
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function extractJsonExport(src, exportName) {
  const re = new RegExp(`export const ${exportName}[^=]*=\\s*(\\{[\\s\\S]*\\});\\s*$`);
  const m = src.match(re);
  if (!m) {
    // fallback: first big object after export
    const idx = src.indexOf(`export const ${exportName}`);
    if (idx < 0) return null;
    const eq = src.indexOf("=", idx);
    const start = src.indexOf("{", eq);
    let depth = 0;
    for (let i = start; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(src.slice(start, i + 1));
          } catch {
            return null;
          }
        }
      }
    }
  }
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

// --- Files present ---
const required = [
  "src/domain/reliability/reports/copowerMonthly.ts",
  "src/domain/reliability/reports/granTierraMonthly.ts",
  "src/domain/reliability/operacion/data/operacionPack.json",
  "src/domain/reliability/reports/inventoryMinimumsData.ts",
  "src/domain/reliability/reports/maintenancePlansData.ts",
  "src/domain/reliability/rca/eventos_falla_costayaco_junio_2026.json",
  "src/domain/reliability/nav/projectTree.ts",
  "src/domain/reliability/reports/PlatformContent.tsx",
  "src/domain/reliability/db/catalog.ts",
  "src/domain/reliability/reports/concertacionHoursData.ts",
  "src/domain/reliability/reports/InformesResultadosDashboard.tsx",
];
for (const f of required) {
  if (exists(f)) ok("files", `OK ${f}`);
  else error("files", `Falta ${f}`);
}

// --- Operación pack ---
try {
  const op = JSON.parse(read("src/domain/reliability/operacion/data/operacionPack.json"));
  if (!op.equipos?.length) error("operacion", "Pack sin equipos");
  else ok("operacion", `${op.equipos.length} equipos · ${op.resumenDiario?.length ?? 0} filas diarias · ${op.eventos?.length ?? 0} eventos`);
  if (!op.dateRange) warn("operacion", "Pack sin dateRange");
} catch (e) {
  error("operacion", String(e.message || e));
}

// --- Inventario ---
try {
  const inv = extractJsonExport(read("src/domain/reliability/reports/inventoryMinimumsData.ts"), "INVENTORY_MINIMUMS");
  if (!inv) error("inventory", "No se pudo parsear INVENTORY_MINIMUMS");
  else {
    const emptyFam = inv.items.filter((i) => !String(i.family || "").trim());
    const zz = inv.items.filter((i) => i.stockMin === 0 && i.onHand === 0);
    const neg = inv.items.filter((i) => i.stockMin < 0 || i.onHand < 0);
    ok("inventory", `${inv.items.length} ítems inventarios`);
    if (emptyFam.length) warn("inventory", `${emptyFam.length} sin familia: ${emptyFam.map((i) => i.id).join(", ")}`);
    if (zz.length) error("inventory", `${zz.length} ítems 0/0`);
    if (neg.length) error("inventory", `${neg.length} cantidades negativas`);
  }
} catch (e) {
  error("inventory", String(e.message || e));
}

// --- Mantenimiento ---
try {
  const mto = extractJsonExport(read("src/domain/reliability/reports/maintenancePlansData.ts"), "MAINTENANCE_PLANS");
  if (!mto) error("maintenance", "No se pudo parsear MAINTENANCE_PLANS");
  else {
    ok(
      "maintenance",
      `flota ${mto.fleet?.length ?? 0} · ejecuciones ${mto.executions?.length ?? 0} · catálogo ${mto.catalog?.length ?? 0}`,
    );
    if (!(mto.executions?.length > 0)) error("maintenance", "Sin ejecuciones");
  }
} catch (e) {
  error("maintenance", String(e.message || e));
}

// --- RCA ---
try {
  const rca = JSON.parse(read("src/domain/reliability/rca/eventos_falla_costayaco_junio_2026.json"));
  const eventos = rca.eventos ?? rca;
  const ids = eventos.map((e) => e.id);
  const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
  const real = eventos.filter((e) => !/BLANK|-XX-/i.test(e.id));
  if (dups.length) error("rca", `IDs duplicados: ${[...new Set(dups)].join(", ")}`);
  else ok("rca", `${real.length} fichas reales · ${eventos.length - real.length} plantilla(s)`);
  if (real.length < 9) warn("rca", `Pocas fichas reales (${real.length})`);

  const dataCopy = "data/RCA/eventos_falla_costayaco_junio_2026.json";
  if (exists(dataCopy)) {
    const a = read("src/domain/reliability/rca/eventos_falla_costayaco_junio_2026.json");
    const b = read(dataCopy);
    if (a === b) ok("rca", "Copia data/RCA sincronizada con seed src/");
    else warn("rca", "data/RCA/eventos… diverge del seed en src/ — usar solo src como verdad");
  }
} catch (e) {
  error("rca", String(e.message || e));
}

// --- Nav leaves vs PlatformContent ---
try {
  const tree = read("src/domain/reliability/nav/projectTree.ts");
  const platform = read("src/domain/reliability/reports/PlatformContent.tsx");
  const leaves = [...tree.matchAll(/\{ id: "([^"]+)", label: "[^"]+" \}/g)].map((m) => m[1]);
  const uncovered = [];
  for (const id of leaves) {
    let hit = platform.includes(`"${id}"`);
    if (!hit && id.startsWith("gen-")) hit = platform.includes('leafId.startsWith("gen-")');
    if (!hit && id.startsWith("inf-")) {
      hit =
        platform.includes('leafId.startsWith("inf-")') ||
        platform.includes("InformesResultadosDashboard");
    }
    if (!hit && id.startsWith("conc-")) {
      hit =
        platform.includes('leafId.startsWith("conc-")') ||
        platform.includes("ConcertacionHorasDashboard") ||
        platform.includes("page === \"concertacion\"");
    }
    if (!hit && id.startsWith("cfg-campos-")) hit = platform.includes("cfg-campos-");
    if (!hit && id.startsWith("capa-")) hit = platform.includes("capa-");
    if (
      !hit &&
      ["op-dashboard", "op-equipos", "op-eficiencia", "op-resumen-diario", "op-eventos", "op-consumos"].includes(id)
    ) {
      hit = platform.includes("OperacionModule") || platform.includes("op-dashboard");
    }
    if (!hit) uncovered.push(id);
  }
  ok("nav", `${leaves.length} hojas en árbol`);
  if (uncovered.length) error("nav", `Hojas sin handler evidente: ${uncovered.join(", ")}`);
  else ok("nav", "Todas las hojas del árbol tienen handler en PlatformContent");
} catch (e) {
  error("nav", String(e.message || e));
}

// --- Meses ---
try {
  const cpw = read("src/domain/reliability/reports/copowerMonthly.ts");
  const gte = read("src/domain/reliability/reports/granTierraMonthly.ts");
  const cpwMonths = [...cpw.matchAll(/COPOWER_MONTH_ORDER[^=]*=\s*\[([^\]]+)\]/g)][0]?.[1]
    ?.match(/"(\w+)"/g)
    ?.map((s) => s.replace(/"/g, ""));
  const gteMonths = [...gte.matchAll(/GRAN_TIERRA_MONTH_ORDER[^=]*=\s*\[([^\]]+)\]/g)][0]?.[1]
    ?.match(/"(\w+)"/g)
    ?.map((s) => s.replace(/"/g, ""));
  ok("months", `COPOWER [${(cpwMonths || []).join(", ")}]`);
  ok("months", `GTE [${(gteMonths || []).join(", ")}]`);
  if (cpwMonths?.includes("Jul") && !gteMonths?.includes("Jul")) {
    warn("months", "Asimetría: COPOWER tiene Jul; GTE no");
  }
} catch (e) {
  error("months", String(e.message || e));
}

// --- Concertación (Informes) ---
try {
  const src = read("src/domain/reliability/reports/concertacionHoursData.ts");
  const pack = extractJsonExport(src, "CONCERTACION_HOURS");
  if (!pack?.months) {
    error("concertacion", "No se pudo parsear CONCERTACION_HOURS");
  } else {
    const months = Object.keys(pack.months);
    ok("concertacion", `Meses ${months.join(", ")} · fuente Informes`);
    for (const mk of months) {
      const p = pack.months[mk];
      const t = p.totals;
      const sumKwh = (p.units || []).reduce((s, u) => s + (u.kwh || 0), 0);
      const dailyKwh = (p.daily || []).reduce((s, r) => s + (r.kwh || 0), 0);
      const sumOp = (p.units || []).reduce((s, u) => s + (u.op || 0), 0);
      const sumFail = (p.units || []).reduce((s, u) => s + (u.failures || 0), 0);
      if (Math.abs(sumKwh - t.kwh) > 1 || Math.abs(dailyKwh - t.kwh) > 1) {
        error("concertacion", `${mk}: kWh units/daily ≠ totals`);
      } else if (Math.abs(sumOp - t.op) > 0.1 || sumFail !== t.failures) {
        error("concertacion", `${mk}: OP/fallas units ≠ totals`);
      } else {
        ok(
          "concertacion",
          `${mk}: ${Math.round(t.kwh).toLocaleString("es-CO")} kWh · ${t.units} u · ${t.failures} fallas · disp ${t.availabilityPct?.toFixed?.(1) ?? "N/D"}%`,
        );
      }
    }
    for (const g of pack.generation3m || []) {
      const p = pack.months[g.month];
      if (!p) {
        warn("concertacion", `generation3m ${g.month} sin pack mensual`);
        continue;
      }
      const gas = p.units.filter((u) => u.fuel === "GAS").reduce((s, u) => s + u.kwh, 0);
      const diesel = p.units.filter((u) => u.fuel === "DIESEL").reduce((s, u) => s + u.kwh, 0);
      if (Math.abs(gas - g.gasKwh) > 1 || Math.abs(diesel - g.dieselKwh) > 1) {
        error("concertacion", `generation3m ${g.month} ≠ suma por combustible`);
      }
    }
    if (
      exists("data/concertacion horas/Horas concertadas con GTE del 01 al 31 julio 2026.xlsx")
    ) {
      ok("concertacion", "Excel fuente horas concertadas presente");
    } else {
      warn("concertacion", "Falta Excel fuente en data/concertacion horas/");
    }
  }
} catch (e) {
  error("concertacion", String(e.message || e));
}

// Report
const summary = { ok: 0, warn: 0, error: 0 };
for (const f of findings) summary[f.severity] += 1;

console.log("\n=== AUDITORÍA DE DATOS · Reliability Analytics ===\n");
for (const f of findings) {
  const tag = f.severity === "ok" ? "OK " : f.severity === "warn" ? "WARN" : "ERR ";
  console.log(`[${tag}] ${f.area.padEnd(12)} ${f.message}`);
}
console.log(`\nResumen: ${summary.ok} ok · ${summary.warn} warn · ${summary.error} error\n`);

if (summary.error > 0) process.exit(1);
