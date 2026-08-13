/** Auditoría temporal: eficiencia COPOWER desde operacionPack (v34 vs v40). */
import fs from "node:fs";

const HHV = 1000;
const KWH_TO_BTU = 3412;
const HR_MIN = 6;
const HR_MAX = 20;

const plausible = (hr) => hr != null && hr >= HR_MIN && hr <= HR_MAX;

function gasFt3(r) {
  const kwh = r.kwAcumuladoDia;
  if (kwh == null || kwh <= 0) return null;
  if (r.consumoGasMscfd != null && r.consumoGasMscfd > 0) {
    const gas = r.consumoGasMscfd * 1000;
    return plausible(gas / kwh) ? gas : null;
  }
  const v = r.consumoGasFt3Kwh;
  if (v == null || v <= 0) return null;
  if (v < 50) return plausible(v) ? v * kwh : null;
  const hr = v / kwh;
  return plausible(hr) ? v : null;
}

function monthAgg(rows, ym) {
  const f = rows.filter((r) => r.fecha.startsWith(ym));
  let kwhAll = 0;
  let kwhEff = 0;
  let gas = 0;
  let days = new Set();
  let daysAll = new Set();
  let units = new Set();
  let unitsAll = new Set();
  for (const r of f) {
    const k = r.kwAcumuladoDia ?? 0;
    if (k > 0) {
      kwhAll += k;
      daysAll.add(r.fecha);
      unitsAll.add(r.equipoId);
    }
    const g = gasFt3(r);
    if (g == null || g <= 0 || k <= 0) continue;
    kwhEff += k;
    gas += g;
    days.add(r.fecha);
    units.add(r.equipoId);
  }
  const hr = kwhEff > 0 && gas > 0 ? gas / kwhEff : null;
  const eff = plausible(hr) ? (KWH_TO_BTU / (hr * HHV)) * 100 : null;
  return {
    ym,
    rows: f.length,
    kwhAll: Math.round(kwhAll),
    kwhEff: Math.round(kwhEff),
    gasMcf: Math.round(gas / 1000),
    hr: hr ? Number(hr.toFixed(3)) : null,
    eff: eff ? Number(eff.toFixed(2)) : null,
    days: days.size,
    daysAll: daysAll.size,
    units: units.size,
    unitsAll: unitsAll.size,
    coverage: kwhAll > 0 ? Number(((kwhEff / kwhAll) * 100).toFixed(1)) : null,
  };
}

function report(name, file) {
  const pack = JSON.parse(fs.readFileSync(file, "utf8"));
  const rows = pack.resumenDiario ?? [];
  console.log(`\n=== ${name} ===`);
  console.log("sourceFile:", pack.sourceFile ?? pack.status?.sourceFile);
  console.log("generatedAt:", pack.generatedAt ?? pack.status?.generatedAt);
  console.log("resumenDiario rows:", rows.length);
  const dates = rows.map((r) => r.fecha).sort();
  console.log("rango:", dates[0], "→", dates[dates.length - 1]);
  console.table(
    ["01", "02", "03", "04", "05", "06", "07", "08"].map((m) => monthAgg(rows, `2026-${m}`)),
  );
}

report("v34 (pack anterior)", "/tmp/operacionPack.v34.json");
report("v40 (pack nuevo)", "src/domain/reliability/operacion/data/operacionPack.json");
