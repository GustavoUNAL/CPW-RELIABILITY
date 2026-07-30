import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  CalendarRange,
  ClipboardCheck,
  Clock,
  Database,
  FileText,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Shield,
  UserRound,
  X,
  Wrench,
  Zap,
} from "lucide-react";
import { PlatformContent } from "./domain/reliability/reports/PlatformContent";
import type { RcaCaseDetail } from "./domain/reliability/reports/gteJuneRcaCases";
import { GTE_JUNE_RCA_SEED } from "./domain/reliability/reports/gteJuneRcaCases";
import {
  createBlankRca,
  createRcaDraftFromEvent,
  loadRcaCases,
  persistRcaCases,
  type RcaEventDraft,
} from "./domain/reliability/reports/rcaCaseStore";
import {
  getCostayacoSeedStamp,
  loadCostayacoRcaEvents,
  persistCostayacoRcaEvents,
  upsertCostayacoRcaEvent,
} from "./domain/reliability/rca/rcaEventStore";
import type { RcaEventoFalla } from "./domain/reliability/rca/types";
import type { PageKey } from "./domain/reliability/types";
import {
  PROJECT_NAV_TREE,
  PROJECT_TITLE,
  findLeafLabel,
  firstLeafId,
  type NavNode,
} from "./domain/reliability/nav/projectTree";
import {
  defaultMonth,
  monthOptionLabel,
  resolveViewContext,
} from "./domain/reliability/nav/resolveContext";
import {
  LoginScreen,
  ROLE_LABELS,
  clearSession,
  getOrCreateAnalyticsSessionId,
  loadSession,
  persistSession,
  trackHeartbeat,
  trackLogin,
  trackLogout,
  trackPageView,
  type SessionUser,
} from "./domain/reliability/auth";

const MODULE_ICONS: Record<PageKey, ReactNode> = {
  dashboard: <LayoutDashboard size={16} />,
  campos: <MapPin size={16} />,
  generacion: <Zap size={16} />,
  operacion: <Database size={16} />,
  concertacion: <Clock size={16} />,
  confiabilidad: <Gauge size={16} />,
  mantenimiento: <Wrench size={16} />,
  gestion_activos: <HeartPulse size={16} />,
  gestion_acciones: <ClipboardCheck size={16} />,
  planeacion: <CalendarRange size={16} />,
  admin: <Shield size={16} />,
};

const OM_COLOMBIA_URL =
  "https://copowercomco-my.sharepoint.com/personal/tec_op_copower_com_co/Documents/Forms/All.aspx?RootFolder=%2Fpersonal%2Ftec%5Fop%5Fcopower%5Fcom%5Fco%2FDocuments%2FO%26M%20COLOMBIA&View=%7B181C171F%2DD036%2D4F1F%2DBE86%2D9D8BEC441F3D%7D";

const DEFAULT_MODULE = PROJECT_NAV_TREE[0];
const DEFAULT_LEAF = "dash-resumen";
const MOBILE_MQ = "(max-width: 900px)";

function App() {
  const [session, setSession] = useState<SessionUser | null>(() => loadSession());
  const [activePage, setActivePage] = useState<PageKey>(DEFAULT_MODULE.key);
  const [activeLeafId, setActiveLeafId] = useState(DEFAULT_LEAF);
  const [openModules, setOpenModules] = useState<Partial<Record<PageKey, boolean>>>({
    [DEFAULT_MODULE.key]: true,
  });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "conf-eventos": true,
    "conf-bitacoras": true,
    "conf-repetitivos": true,
    "conf-activos": true,
    "conf-worst": true,
    "conf-analisis": true,
    "conf-comparacion": true,
    "capa-root": true,
  });
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedMonth, setSelectedMonth] = useState<string>("Jun");
  const [navOpen, setNavOpen] = useState(false);
  const [analyticsSessionId, setAnalyticsSessionId] = useState(() => getOrCreateAnalyticsSessionId());
  const sessionStartedAtRef = useRef(Date.now());
  const pageStartedAtRef = useRef(Date.now());
  const lastHeartbeatPageAtRef = useRef(Date.now());
  const viewRef = useRef({ page: DEFAULT_MODULE.key as PageKey, leaf: DEFAULT_LEAF, label: "Resumen general" });

  useEffect(() => {
    document.body.classList.toggle("theme-light", theme === "light");
    document.body.classList.toggle("theme-dark", theme === "dark");
  }, [theme]);

  const viewContext = useMemo(
    () => resolveViewContext(activePage, activeLeafId),
    [activePage, activeLeafId],
  );

  useEffect(() => {
    if (!viewContext.monthOrder.includes(selectedMonth)) {
      setSelectedMonth(defaultMonth(viewContext));
    }
  }, [viewContext, selectedMonth]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => {
      if (!mq.matches) setNavOpen(false);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  const monthLabel = monthOptionLabel(selectedMonth, viewContext);
  const activeModule = PROJECT_NAV_TREE.find((m) => m.key === activePage);
  const activeLeafLabel =
    (activeModule ? findLeafLabel(activeModule.children, activeLeafId) : null) ?? activeLeafId;

  useEffect(() => {
    if (!session) return;
    viewRef.current = {
      page: activePage,
      leaf: activeLeafId,
      label: activeLeafLabel,
    };
  }, [session, activePage, activeLeafId, activeLeafLabel]);

  // Sesión restaurada desde localStorage: registra vista inicial.
  useEffect(() => {
    if (!session) return;
    const sid = analyticsSessionId;
    void trackPageView(
      session,
      sid,
      { page: activePage, leaf: activeLeafId, leafLabel: activeLeafLabel },
      null,
    );
    // solo al montar / cambiar usuario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  useEffect(() => {
    if (!session) return;
    const tick = () => {
      if (document.visibilityState === "hidden") return;
      const now = Date.now();
      const pageDelta = now - lastHeartbeatPageAtRef.current;
      lastHeartbeatPageAtRef.current = now;
      void trackHeartbeat(session, analyticsSessionId, {
        durationMs: now - sessionStartedAtRef.current,
        page: viewRef.current.page,
        leaf: viewRef.current.leaf,
        leafLabel: viewRef.current.label,
        pageDeltaMs: pageDelta,
      });
    };
    const id = window.setInterval(tick, 30_000);
    const onVis = () => {
      if (document.visibilityState === "visible") lastHeartbeatPageAtRef.current = Date.now();
    };
    const onUnload = () => {
      const now = Date.now();
      void trackHeartbeat(session, analyticsSessionId, {
        durationMs: now - sessionStartedAtRef.current,
        page: viewRef.current.page,
        leaf: viewRef.current.leaf,
        leafLabel: viewRef.current.label,
        pageDeltaMs: now - lastHeartbeatPageAtRef.current,
      });
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onUnload);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onUnload);
    };
  }, [session, analyticsSessionId]);

  const [focusRcaId, setFocusRcaId] = useState<string | null>(null);
  const [focusCostayacoRcaId, setFocusCostayacoRcaId] = useState<string | null>(null);
  const [rcaCases, setRcaCases] = useState<RcaCaseDetail[]>(() => loadRcaCases());
  const [costayacoRcaEvents, setCostayacoRcaEvents] = useState<RcaEventoFalla[]>(() =>
    loadCostayacoRcaEvents(),
  );
  const costayacoSeedStamp = getCostayacoSeedStamp();

  // El JSON seed es la fuente de verdad: rehidrata al montar / al cambiar el stamp del pack.
  useEffect(() => {
    setCostayacoRcaEvents(loadCostayacoRcaEvents());
  }, [costayacoSeedStamp]);

  useEffect(() => {
    setRcaCases(loadRcaCases());
  }, [GTE_JUNE_RCA_SEED]);

  const handleLogin = (user: SessionUser) => {
    const sid = getOrCreateAnalyticsSessionId(true);
    setAnalyticsSessionId(sid);
    sessionStartedAtRef.current = Date.now();
    pageStartedAtRef.current = Date.now();
    lastHeartbeatPageAtRef.current = Date.now();
    persistSession(user);
    setSession(user);
    void trackLogin(user, sid);
  };

  const handleLogout = () => {
    if (session) {
      const now = Date.now();
      void trackLogout(session, analyticsSessionId, {
        durationMs: now - sessionStartedAtRef.current,
        page: viewRef.current.page,
        leaf: viewRef.current.leaf,
        leafLabel: viewRef.current.label,
        pageDeltaMs: now - lastHeartbeatPageAtRef.current,
      });
    }
    clearSession();
    setSession(null);
    setNavOpen(false);
  };

  const selectLeaf = (page: PageKey, leafId: string) => {
    const mod = PROJECT_NAV_TREE.find((m) => m.key === page);
    const label = (mod ? findLeafLabel(mod.children, leafId) : null) ?? leafId;
    if (session) {
      const now = Date.now();
      const prev = viewRef.current;
      void trackPageView(
        session,
        analyticsSessionId,
        { page, leaf: leafId, leafLabel: label },
        {
          page: prev.page,
          leaf: prev.leaf,
          leafLabel: prev.label,
          durationMs: now - pageStartedAtRef.current,
        },
      );
      pageStartedAtRef.current = now;
      lastHeartbeatPageAtRef.current = now;
      viewRef.current = { page, leaf: leafId, label };
    }
    setActivePage(page);
    setActiveLeafId(leafId);
    setOpenModules((prev) => ({ ...prev, [page]: true }));
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateRcaCases = (next: RcaCaseDetail[] | ((prev: RcaCaseDetail[]) => RcaCaseDetail[])) => {
    setRcaCases((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      persistRcaCases(resolved);
      return resolved;
    });
  };

  const updateCostayacoRca = (next: RcaEventoFalla) => {
    setCostayacoRcaEvents((prev) => {
      const updated = upsertCostayacoRcaEvent(prev, next);
      persistCostayacoRcaEvents(updated);
      return updated;
    });
  };

  const navigateToRca = (rcaId?: string) => {
    if (rcaId?.startsWith("EVT-")) {
      setFocusCostayacoRcaId(rcaId);
      setOpenGroups((prev) => ({ ...prev, "conf-analisis": true }));
      selectLeaf("confiabilidad", "an-rca-gte");
      return;
    }
    setFocusRcaId(rcaId ?? null);
    setOpenGroups((prev) => ({ ...prev, "conf-analisis": true }));
    selectLeaf("confiabilidad", "an-rca-casos");
  };

  const navigateToCostayacoRca = (evtId?: string) => {
    setFocusCostayacoRcaId(evtId ?? null);
    setOpenGroups((prev) => ({
      ...prev,
      "conf-eventos": true,
      "conf-bitacoras": true,
      "conf-analisis": true,
    }));
    selectLeaf("confiabilidad", "an-rca-gte");
  };

  const createRcaFromEvent = (draft: RcaEventDraft) => {
    let createdId = "";
    updateRcaCases((prev) => {
      const created = createRcaDraftFromEvent({ ...draft, existing: prev });
      createdId = created.id;
      return [...prev, created];
    });
    navigateToRca(createdId);
  };

  const createBlankRcaCase = () => {
    let createdId = "";
    updateRcaCases((prev) => {
      const created = createBlankRca(prev);
      createdId = created.id;
      return [...prev, created];
    });
    navigateToRca(createdId);
  };

  const selectModule = (page: PageKey) => {
    const mod = PROJECT_NAV_TREE.find((m) => m.key === page);
    const leaf = mod ? firstLeafId(mod.children) : null;
    if (leaf) selectLeaf(page, leaf);
    else {
      setActivePage(page);
      setOpenModules((prev) => ({ ...prev, [page]: true }));
      setNavOpen(false);
    }
  };

  const toggleModule = (page: PageKey) => {
    setOpenModules((prev) => ({ ...prev, [page]: !prev[page] }));
  };

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const renderNavNodes = (page: PageKey, nodes: NavNode[], depth = 0): ReactNode =>
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
            {open ? <ul className="project-leaves nested">{renderNavNodes(page, node.children!, depth + 1)}</ul> : null}
          </li>
        );
      }
      const leafActive = activePage === page && activeLeafId === node.id;
      return (
        <li key={node.id}>
          <button
            type="button"
            className={leafActive ? "project-leaf active" : "project-leaf"}
            onClick={() => selectLeaf(page, node.id)}
          >
            <span>{node.label}</span>
          </button>
        </li>
      );
    });

  if (!session) {
    return (
      <div className={`app-shell ${theme} login-shell`}>
        <LoginScreen onSuccess={handleLogin} />
      </div>
    );
  }

  return (
    <div className={`app-shell ${theme}${navOpen ? " nav-open" : ""}`}>
      <header className="mobile-topbar">
        <button
          type="button"
          className="mobile-menu-btn"
          aria-label={navOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={navOpen}
          aria-controls="app-sidebar"
          onClick={() => setNavOpen((v) => !v)}
        >
          {navOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="mobile-topbar-copy">
          <p className="eyebrow">COPOWER</p>
          <strong>{session.name}</strong>
          <span>
            {activeModule?.label ?? "Dashboard"} · {activeLeafLabel}
          </span>
        </div>
        {!viewContext.fixedPeriod ? (
          <select
            className="mobile-month-select"
            aria-label="Periodo"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {viewContext.monthOrder.map((month) => (
              <option key={month} value={month}>
                {monthOptionLabel(month, viewContext)}
              </option>
            ))}
          </select>
        ) : (
          <span className="mobile-month-fixed">{monthOptionLabel(selectedMonth, viewContext)}</span>
        )}
        <button
          type="button"
          className="mobile-logout-btn"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </header>

      <button
        type="button"
        className={`nav-backdrop${navOpen ? " open" : ""}`}
        aria-label="Cerrar menú"
        tabIndex={navOpen ? 0 : -1}
        onClick={() => setNavOpen(false)}
      />

      <aside id="app-sidebar" className={`sidebar${navOpen ? " open" : ""}`}>
        <div className="sidebar-mobile-head">
          <div className="brand">
            <p className="eyebrow">COPOWER</p>
            <h1>Gestión de confiabilidad</h1>
            <p className="brand-sub">{PROJECT_TITLE}</p>
          </div>
          <button
            type="button"
            className="mobile-menu-btn sidebar-close-btn"
            aria-label="Cerrar menú"
            onClick={() => setNavOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="brand brand-desktop">
          <p className="eyebrow">COPOWER</p>
          <h1>Gestión de confiabilidad</h1>
          <p className="brand-sub">{PROJECT_TITLE}</p>
        </div>

        <div className="session-panel">
          <div className="session-user" title={`${session.email} · ${ROLE_LABELS[session.role]}`}>
            <span className="session-user-avatar" aria-hidden>
              <UserRound size={16} />
            </span>
            <span className="session-user-meta">
              <strong className="session-user-name">{session.name}</strong>
              <span className="session-user-role">{ROLE_LABELS[session.role]}</span>
            </span>
            <button
              type="button"
              className="session-logout"
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              <LogOut size={15} />
              <span>Salir</span>
            </button>
          </div>
        </div>

        <div className="sidebar-controls">
          {viewContext.fixedPeriod ? (
            <div className="month-picker month-picker-fixed">
              <label>Periodo</label>
              <p className="month-fixed-label">{monthOptionLabel(selectedMonth, viewContext)}</p>
            </div>
          ) : (
            <div className="month-picker">
              <label htmlFor="month-selector">Periodo</label>
              <select
                id="month-selector"
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
          )}
          <div className="header-theme-switch">
            <label>Apariencia</label>
            <div className="theme-switch-row">
              <span>Oscuro</span>
              <label className="theme-switch" htmlFor="theme-toggle">
                <input
                  id="theme-toggle"
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
          <p className="eyebrow">Árbol del proyecto</p>
          <nav className="project-nav" aria-label="Módulos del sistema">
            {PROJECT_NAV_TREE.filter((mod) => mod.key !== "admin" || session.role === "admin").map(
              (mod) => {
                const isActive = activePage === mod.key;
                const isOpen = openModules[mod.key] ?? isActive;
                return (
                  <div key={mod.key} className={isActive ? "project-mod active" : "project-mod"}>
                    <div className="project-mod-row">
                      <button
                        type="button"
                        className="project-mod-toggle"
                        aria-expanded={isOpen}
                        onClick={() => toggleModule(mod.key)}
                        title={isOpen ? "Contraer" : "Expandir"}
                      >
                        {isOpen ? "▾" : "▸"}
                      </button>
                      <button
                        type="button"
                        className={isActive ? "project-mod-btn active" : "project-mod-btn"}
                        onClick={() => selectModule(mod.key)}
                        title={mod.description}
                      >
                        <span className="project-mod-icon">{MODULE_ICONS[mod.key]}</span>
                        <span className="project-mod-label">
                          <strong>{mod.label}</strong>
                        </span>
                      </button>
                    </div>
                    {isOpen ? (
                      <ul className="project-leaves">{renderNavNodes(mod.key, mod.children)}</ul>
                    ) : null}
                  </div>
                );
              },
            )}
          </nav>
        </div>
        <div className="tree-panel">
          <p className="eyebrow">Documentación</p>
          <nav className="menu">
            <a
              className="menu-item"
              href={OM_COLOMBIA_URL}
              target="_blank"
              rel="noreferrer"
              title="Abrir O&M COLOMBIA"
            >
              <span>
                <FileText size={16} />
              </span>
              <span>O&amp;M COLOMBIA</span>
            </a>
          </nav>
        </div>
      </aside>

      <main className={viewContext.report === "dual" ? "main main-dual" : "main"}>
        <div className="main-session-bar" aria-label="Sesión activa">
          <p className="main-session-greeting">
            Sesión de <strong>{session.name}</strong>
            <span className="muted"> · {ROLE_LABELS[session.role]}</span>
          </p>
        </div>
        <PlatformContent
          page={activePage}
          leafId={activeLeafId}
          month={selectedMonth}
          monthLabel={monthLabel}
          onNavigateToRca={navigateToRca}
          focusRcaId={focusRcaId}
          onFocusRcaConsumed={() => setFocusRcaId(null)}
          rcaCases={rcaCases}
          onRcaCasesChange={updateRcaCases}
          onCreateRcaFromEvent={createRcaFromEvent}
          onCreateBlankRca={createBlankRcaCase}
          costayacoRcaEvents={costayacoRcaEvents}
          onCostayacoRcaChange={updateCostayacoRca}
          onNavigateToCostayacoRca={navigateToCostayacoRca}
          focusCostayacoRcaId={focusCostayacoRcaId}
          onFocusCostayacoRcaConsumed={() => setFocusCostayacoRcaId(null)}
          isAdmin={session.role === "admin"}
        />
      </main>
    </div>
  );
}

export default App;
