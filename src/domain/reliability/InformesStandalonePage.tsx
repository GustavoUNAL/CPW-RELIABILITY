import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Maximize2 } from "lucide-react";
import {
  ROLE_LABELS,
  clearSession,
  isInformesOnlyRole,
  loadSession,
  type SessionUser,
} from "./auth";
import {
  PROJECT_NAV_TREE,
  PROJECT_TITLE,
  findLeafLabel,
  firstLeafId,
  type NavNode,
} from "./nav/projectTree";
import { defaultMonth, monthOptionLabel, resolveViewContext } from "./nav/resolveContext";
import { PlatformContent } from "./reports/PlatformContent";

const INFORMES_MODULE = PROJECT_NAV_TREE.find((m) => m.key === "informes");
const DEFAULT_LEAF = firstLeafId(INFORMES_MODULE?.children ?? []) ?? "inf-rg-indisponibilidad";

export function isInformesPath(pathname = window.location.pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return clean === "/informes";
}

/**
 * Vista dedicada `/informes`: acceso público (sin login).
 * Se sirve en el mismo dominio (p. ej. https://reliability.opsai.space/informes).
 * El resto de la plataforma sigue protegido en `/`.
 */
export function InformesStandalonePage() {
  const [session, setSession] = useState<SessionUser | null>(() => loadSession());
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedMonth, setSelectedMonth] = useState("Jun");
  const [activeLeafId, setActiveLeafId] = useState(DEFAULT_LEAF);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "inf-resultados": true,
  });

  useEffect(() => {
    document.body.classList.toggle("theme-light", theme === "light");
    document.body.classList.toggle("theme-dark", theme === "dark");
    document.title = `Informes · ${PROJECT_TITLE}`;
  }, [theme]);

  const viewContext = useMemo(
    () => resolveViewContext("informes", activeLeafId),
    [activeLeafId],
  );

  useEffect(() => {
    if (!viewContext.monthOrder.includes(selectedMonth)) {
      setSelectedMonth(defaultMonth(viewContext));
    }
  }, [viewContext, selectedMonth]);

  const monthLabel = monthOptionLabel(selectedMonth, viewContext);
  const leafLabel =
    (INFORMES_MODULE ? findLeafLabel(INFORMES_MODULE.children, activeLeafId) : null) ?? activeLeafId;

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const selectLeaf = (leafId: string) => {
    setActiveLeafId(leafId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderNodes = (nodes: NavNode[], depth = 0): ReactNode =>
    nodes.map((node) => {
      const hasChildren = Boolean(node.children?.length);
      if (hasChildren) {
        const open = openGroups[node.id] ?? true;
        return (
          <li key={node.id} className={`project-group depth-${depth}`}>
            <button
              type="button"
              className="project-group-btn"
              aria-expanded={open}
              onClick={() => toggleGroup(node.id)}
            >
              <span className="project-group-chevron">{open ? "▾" : "▸"}</span>
              <span>{node.label}</span>
            </button>
            {open ? (
              <ul className="project-leaves nested">{renderNodes(node.children!, depth + 1)}</ul>
            ) : null}
          </li>
        );
      }
      const active = activeLeafId === node.id;
      return (
        <li key={node.id}>
          <button
            type="button"
            className={active ? "project-leaf active" : "project-leaf"}
            onClick={() => selectLeaf(node.id)}
          >
            <span>{node.label}</span>
          </button>
        </li>
      );
    });

  return (
    <div className={`app-shell ${theme} informes-standalone`}>
      <aside className="sidebar informes-standalone-sidebar">
        <div className="brand brand-desktop">
          <p className="eyebrow">COPOWER</p>
          <h1>Informes</h1>
          <p className="brand-sub">{PROJECT_TITLE}</p>
        </div>

        <div className="sidebar-controls">
          <div className="month-picker">
            <label htmlFor="informes-month-selector">Periodo</label>
            <select
              id="informes-month-selector"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {viewContext.monthOrder.map((month) => (
                <option key={month} value={month}>
                  {monthOptionLabel(month, viewContext)}
                </option>
              ))}
            </select>
          </div>
          <div className="header-theme-switch">
            <label>Apariencia</label>
            <div className="theme-switch-row">
              <span>Oscuro</span>
              <label className="theme-switch" htmlFor="informes-theme-toggle">
                <input
                  id="informes-theme-toggle"
                  type="checkbox"
                  checked={theme === "light"}
                  onChange={(e) => setTheme(e.target.checked ? "light" : "dark")}
                />
                <span className="slider" />
              </label>
              <span>Claro</span>
            </div>
          </div>
        </div>

        <div className="tree-panel project-tree">
          <p className="eyebrow">Resultados de Gestión</p>
          <nav className="project-nav" aria-label="Secciones de informes">
            <ul className="project-leaves">
              {renderNodes(
                INFORMES_MODULE?.children?.find((n) => n.id === "inf-resultados")?.children ??
                  INFORMES_MODULE?.children ??
                  [],
              )}
            </ul>
          </nav>
        </div>

        <div className="tree-panel informes-standalone-actions">
          {session && !isInformesOnlyRole(session.role) ? (
            <a className="menu-item" href="/" title="Volver a la plataforma">
              <ArrowLeft size={16} />
              <span>Plataforma</span>
            </a>
          ) : null}
          {session ? (
            <button type="button" className="menu-item session-logout-full" onClick={handleLogout}>
              <span>
                {session.name} · {ROLE_LABELS[session.role]}
              </span>
              <span>Salir</span>
            </button>
          ) : null}
        </div>
      </aside>

      <main className="main main-dual">
        <header className="informes-standalone-head">
          <div>
            <p className="eyebrow">Vista completa · /informes</p>
            <h2>{leafLabel}</h2>
            <p className="muted">{monthLabel}</p>
          </div>
          <span className="informes-standalone-badge" title="Vista dedicada">
            <Maximize2 size={14} />
            Completa
          </span>
        </header>
        <PlatformContent
          page="informes"
          leafId={activeLeafId}
          month={selectedMonth}
          monthLabel={monthLabel}
        />
      </main>
    </div>
  );
}
