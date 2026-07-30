import type { SessionUser } from "./users";
import { APP_USERS } from "./users";

const SESSION_KEY = "cpw-auth-session-v1";

export function loadSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionUser;
    if (!parsed?.id || !parsed?.email || !parsed?.name || !parsed?.role) return null;
    // Valida que el usuario siga existiendo y refresca nombre/rol desde el catálogo.
    const catalog = APP_USERS.find((u) => u.id === parsed.id && u.email === parsed.email);
    if (!catalog) return null;
    return {
      id: catalog.id,
      name: catalog.name,
      email: catalog.email,
      role: catalog.role,
    };
  } catch {
    return null;
  }
}

export function persistSession(user: SessionUser) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
