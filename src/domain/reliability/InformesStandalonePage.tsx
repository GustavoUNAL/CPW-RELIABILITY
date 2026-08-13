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
  firstLeafId,
  type NavNode,
} from "./nav/projectTree";
import { defaultMonth, monthOptionLabel, resolveViewContext } from "./nav/resolveContext";
import {
  FULL_REPORT_DOM_ID,
  FULL_REPORT_DOM_ID_LEGACY,
  FULL_REPORT_LEAF,
  FULL_REPORT_PATH,
  isFullReportPath,
  parsePath,
  pushAppUrl,
  replaceAppUrl,
} from "./nav/urlRouting";
import {
  InformeDocumentFooter,
  InformePrintFooter,
  InformePrintHeader,
} from "./reports/InformeBrandChrome";
import { InformeReportNav } from "./reports/InformeReportNav";
import { PlatformContent } from "./reports/PlatformContent";

const INFORMES_MODULE = PROJECT_NAV_TREE.find((m) => m.key === "informes");
const DEFAULT_LEAF = firstLeafId(INFORMES_MODULE?.children ?? []) ?? "inf-rg-indisponibilidad";

function leafFromLocation(): string {
  const parsed = parsePath();
  if (parsed?.page === "informes") return parsed.leaf;
  return DEFAULT_LEAF;
}

/**
 * Vista dedicada `/informes/...`: acceso público (sin login).
 * Se sirve en el mismo dominio (p. ej. https://reliability.opsai.space/informes/indisponibilidad).
 * El resto de la plataforma sigue protegido en `/`.
 */
export function InformesStandalonePage() {
  const [session, setSession] = useState<SessionUser | null>(() => loadSession());
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedMonth, setSelectedMonth] = useState("Jul");
  const [fullReport, setFullReport] = useState(isFullReportPath);
  const [activeLeafId, setActiveLeafId] = useState(() =>
    isFullReportPath() ? FULL_REPORT_LEAF : leafFromLocation(),
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "inf-resultados": true,
    "inf-confiabilidad": true,
    "inf-conf-copower": true,
  });

  useEffect(() => {
    const reportTheme = fullReport ? "light" : theme;
    document.body.classList.toggle("theme-light", reportTheme === "light");
    document.body.classList.toggle("theme-dark", reportTheme === "dark");
    document.title = fullReport
      ? `Informe de confiabilidad · ${PROJECT_TITLE}`
      : `Informes · ${PROJECT_TITLE}`;
  }, [theme, fullReport]);

  // Normaliza `/informes` → `/informes/indisponibilidad` y sincroniza URL.
  useEffect(() => {
    if (fullReport) return;
    replaceAppUrl("informes", activeLeafId);
  }, [activeLeafId, fullReport]);

  useEffect(() => {
    const onPop = () => {
      const full = isFullReportPath();
      setFullReport(full);
      setActiveLeafId(full ? FULL_REPORT_LEAF : leafFromLocation());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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

  const openFullReport = () => {
    setFullReport(true);
    setActiveLeafId(FULL_REPORT_LEAF);
    window.history.pushState({ page: "informes", leaf: FULL_REPORT_LEAF }, "", FULL_REPORT_PATH);
    window.scrollTo({ top: 0 });
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const selectLeaf = (leafId: string) => {
    setActiveLeafId(leafId);
    pushAppUrl("informes", leafId);
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

  useEffect(() => {
    if (!fullReport) return;
    const openAll = () => {
      document.querySelectorAll<HTMLDetailsElement>(".informes-report-page details").forEach((el) => {
        el.open = true;
      });
    };
    window.addEventListener("beforeprint", openAll);
    return () => window.removeEventListener("beforeprint", openAll);
  }, [fullReport]);

  if (fullReport) {
    return (
      <div className="app-shell light informes-report-only">
        <InformePrintHeader monthLabel={monthLabel} />
        <InformeReportNav monthLabel={monthLabel} reportId={FULL_REPORT_DOM_ID} />
        <main
          className="main informes-report-page"
          id={FULL_REPORT_DOM_ID}
          data-report-id={FULL_REPORT_DOM_ID}
          data-report-legacy-id={FULL_REPORT_DOM_ID_LEGACY}
          data-report-period={monthLabel}
        >
          {/* Ancla legacy para bookmarks antiguos */}
          <style>{`@page { size: A3 landscape; margin: 18mm 12mm 16mm 12mm; }`}</style>
          <span id={FULL_REPORT_DOM_ID_LEGACY} hidden aria-hidden />
          <PlatformContent
            page="informes"
            leafId={FULL_REPORT_LEAF}
            month={selectedMonth}
            monthLabel={monthLabel}
          />
          <InformeDocumentFooter monthLabel={monthLabel} />
        </main>
        <InformePrintFooter monthLabel={monthLabel} />
      </div>
    );
  }

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
          <p className="eyebrow">Informes</p>
          <nav className="project-nav" aria-label="Secciones de informes">
            <ul className="project-leaves">
              {renderNodes(INFORMES_MODULE?.children ?? [])}
            </ul>
          </nav>
        </div>

        <div className="tree-panel informes-standalone-actions">
          {session && !isInformesOnlyRole(session.role) ? (
            <a className="menu-item" href="/dashboard/resumen" title="Volver a la plataforma">
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
          <button
            type="button"
            className="informes-standalone-badge"
            title="Abrir el informe completo en una sola página"
            onClick={openFullReport}
          >
            <Maximize2 size={14} />
            Completa
          </button>
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
