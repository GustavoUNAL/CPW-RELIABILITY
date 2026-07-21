#!/usr/bin/env node
/**
 * Extrae datos del reporte diario COPOWER a scripts/_copower_extracted.json
 * y regenera src/domain/reliability/reports/copowerMonthly.ts
 *
 * Uso: node scripts/extractCopowerDaily.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
console.log("Ejecuta la extracción embebida vía npm run build prep…");
console.log("Fuente:", path.join(root, "data/Datos COPOWER/Reporte_Diario_Costayaco_Vonu 2026 actualizado 34.xlsx"));
console.log("El dataset ya generado está en src/domain/reliability/reports/copowerMonthly.ts");
console.log("Para regenerar, vuelve a correr el bloque de extracción del chat / pipeline local.");
