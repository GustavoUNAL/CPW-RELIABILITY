import type { PageKey } from "../types";
import type { NavModule } from "../nav/projectTree";
import type { UserRole } from "./users";

/** Roles con acceso al módulo Informes (Resultados de Gestión). */
export function canAccessInformes(role: UserRole): boolean {
  return role === "admin" || role === "generacion";
}

/** Solo ve Resultados de Gestión (sin el resto de la plataforma). */
export function isInformesOnlyRole(role: UserRole): boolean {
  return role === "generacion";
}

export function filterNavForRole(tree: readonly NavModule[], role: UserRole): NavModule[] {
  if (isInformesOnlyRole(role)) {
    return tree.filter((m) => m.key === "informes");
  }
  return tree.filter(
    (m) => (m.key !== "admin" && !m.adminOnly) || role === "admin",
  );
}

export function defaultHomeForRole(role: UserRole): { page: PageKey; leaf: string } {
  if (isInformesOnlyRole(role)) {
    return { page: "informes", leaf: "inf-rg-indisponibilidad" };
  }
  return { page: "dashboard", leaf: "dash-resumen" };
}
