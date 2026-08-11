import { COPOWER_MONTH_ORDER, COPOWER_MONTHLY_DATA } from "../reports/copowerMonthly";
import { GRAN_TIERRA_MONTH_ORDER, GRAN_TIERRA_MONTHLY_DATA } from "../reports/granTierraMonthly";
import { INVENTORY_MINIMUMS } from "../reports/inventoryMinimumsData";
import { MAINTENANCE_PLANS } from "../reports/maintenancePlansData";
import { RCA_COSTAYACO_EVENTOS } from "../rca/data";
import { PROJECT_NAV_TREE, type NavNode } from "../nav/projectTree";
import { DATASET_CATALOG } from "./catalog";

export type AuditSeverity = "ok" | "warn" | "error";

export type AuditFinding = {
  id: string;
  severity: AuditSeverity;
  area: string;
  message: string;
};

export type AuditReport = {
  generatedAt: string;
  findings: AuditFinding[];
  summary: { ok: number; warn: number; error: number };
};

function collectLeaves(nodes: NavNode[], out: string[] = []): string[] {
  for (const n of nodes) {
    if (!n.children?.length) out.push(n.id);
    else collectLeaves(n.children, out);
  }
  return out;
}

function isBlankRca(id: string) {
  return /BLANK|-XX-/i.test(id);
}

/** Auditoría en runtime de integridad de datos embebidos. */
export function runDataAudit(): AuditReport {
  const findings: AuditFinding[] = [];
  const push = (severity: AuditSeverity, area: string, id: string, message: string) => {
    findings.push({ id, severity, area, message });
  };

  // Catálogo
  push("ok", "catalog", "catalog-size", `${DATASET_CATALOG.length} datasets registrados en catálogo.`);

  // Meses
  for (const m of COPOWER_MONTH_ORDER) {
    if (!COPOWER_MONTHLY_DATA[m]) {
      push("error", "copower-monthly", `cpw-missing-${m}`, `Falta snapshot COPOWER para ${m}.`);
    }
  }
  for (const m of GRAN_TIERRA_MONTH_ORDER) {
    if (!GRAN_TIERRA_MONTHLY_DATA[m]) {
      push("error", "gte-monthly", `gte-missing-${m}`, `Falta snapshot GTE para ${m}.`);
    }
  }
  if (
    (COPOWER_MONTH_ORDER as readonly string[]).includes("Jul") &&
    !(GRAN_TIERRA_MONTH_ORDER as readonly string[]).includes("Jul")
  ) {
    push(
      "warn",
      "period-asymmetry",
      "jul-gte-missing",
      "COPOWER tiene Julio 2026; Gran Tierra aún no. Vistas GTE en Jul muestran N/D o caen al mes por defecto.",
    );
  } else {
    push("ok", "period-asymmetry", "months-aligned", "Cobertura mensual documentada en catálogo.");
  }

  // Inventario
  const items = INVENTORY_MINIMUMS.items;
  const emptyFam = items.filter((i) => !i.family?.trim());
  const zeroZero = items.filter((i) => i.stockMin === 0 && i.onHand === 0);
  const neg = items.filter((i) => i.stockMin < 0 || i.onHand < 0);
  if (emptyFam.length) {
    push(
      "warn",
      "inventory",
      "inv-empty-family",
      `${emptyFam.length} ítem(s) sin familia (p. ej. ${emptyFam[0].id}).`,
    );
  } else {
    push("ok", "inventory", "inv-families", `${items.length} ítems con familia asignada.`);
  }
  if (zeroZero.length) {
    push("error", "inventory", "inv-zero-zero", `${zeroZero.length} ítems en 0/0 (deben normalizarse a 1/1).`);
  } else {
    push("ok", "inventory", "inv-no-zero", "Sin ítems 0/0.");
  }
  if (neg.length) {
    push("error", "inventory", "inv-negative", `${neg.length} ítems con cantidades negativas.`);
  }

  // Mantenimiento
  const exec = MAINTENANCE_PLANS.executions?.length ?? 0;
  const fleet = MAINTENANCE_PLANS.fleet?.length ?? 0;
  if (exec === 0 || fleet === 0) {
    push("error", "maintenance", "mto-empty", "Sábana de mantenimiento sin ejecuciones o flota.");
  } else {
    push("ok", "maintenance", "mto-loaded", `Sábana OK · ${fleet} equipos · ${exec} ejecuciones.`);
  }

  // RCA
  const rca = RCA_COSTAYACO_EVENTOS;
  const ids = rca.map((e) => e.id);
  const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dups.length) {
    push("error", "rca", "rca-dup-ids", `IDs RCA duplicados: ${[...new Set(dups)].join(", ")}`);
  }
  const real = rca.filter((e) => !isBlankRca(e.id));
  const blanks = rca.filter((e) => isBlankRca(e.id));
  if (real.length < 14) {
    push(
      "warn",
      "rca",
      "rca-count-low",
      `Solo ${real.length} fichas RCA reales (esperado ≥ 14: junio + 5 FO julio).`,
    );
  } else {
    push("ok", "rca", "rca-count", `${real.length} fichas RCA reales · ${blanks.length} plantilla(s).`);
  }
  if (blanks.length) {
    push(
      "ok",
      "rca",
      "rca-blank-noted",
      "Plantilla BLANK presente en seed (oculta en UI de listado).",
    );
  }

  // Navegación
  const leaves = collectLeaves(PROJECT_NAV_TREE.flatMap((m) => m.children));
  push("ok", "nav", "nav-leaves", `${leaves.length} hojas activas en el árbol de navegación.`);

  const summary = { ok: 0, warn: 0, error: 0 };
  for (const f of findings) summary[f.severity] += 1;

  return {
    generatedAt: new Date().toISOString(),
    findings,
    summary,
  };
}
