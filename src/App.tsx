import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutDashboard, LogOut, Menu, UserRound, X } from "lucide-react";
import { InformeLogo } from "./domain/reliability/reports/InformeBrandChrome";
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
import { PROJECT_NAV_TREE, findLeafLabel } from "./domain/reliability/nav/projectTree";
import {
  defaultMonth,
  monthOptionLabel,
  PLATFORM_MONTH_ORDER,
  resolveViewContext,
} from "./domain/reliability/nav/resolveContext";
import { cleanPathname, parseParkRoute, parsePath, parkPath, pushAppUrl, replaceAppUrl, type FieldParkId } from "./domain/reliability/nav/urlRouting";
import { HomeBoard, ModuleStrip } from "./domain/reliability/nav/HomeBoard";
import { PARK_SECTIONS, parkSectionId } from "./domain/reliability/nav/ParkDossier";
import { ParkDossier } from "./domain/reliability/nav/ParkDossier";
import { PARK_OPTIONS, WORK_MODULES, moduleForLeaf } from "./domain/reliability/nav/workModules";
import {
  AUTH_ENABLED,
  LOCAL_PREVIEW_USER,
  LoginScreen,
  ROLE_LABELS,
  canAccessInformes,
  clearSession,
  defaultHomeForRole,
  filterNavForRole,
  getOrCreateAnalyticsSessionId,
  isInformesOnlyRole,
  loadSession,
  persistSession,
  trackHeartbeat,
  trackLogin,
  trackLogout,
  trackPageView,
  type SessionUser,
} from "./domain/reliability/auth";

const DEFAULT_MODULE = PROJECT_NAV_TREE[0];
const DEFAULT_LEAF = "dash-historial";
const MOBILE_MQ = "(max-width: 900px)";

function initialRoute(): { page: PageKey; leaf: string; focusId: string | null } {
  const parsed = parsePath();
  if (parsed) {
    return { page: parsed.page, leaf: parsed.leaf, focusId: parsed.focusId ?? null };
  }
  return { page: DEFAULT_MODULE.key, leaf: DEFAULT_LEAF, focusId: null };
}

function App() {
  const boot = useMemo(() => initialRoute(), []);
  const [session, setSession] = useState<SessionUser | null>(() =>
    AUTH_ENABLED ? loadSession() : LOCAL_PREVIEW_USER,
  );
  const [activePage, setActivePage] = useState<PageKey>(boot.page);
  const [activeLeafId, setActiveLeafId] = useState(boot.leaf);
  const [, setOpenModules] = useState<Partial<Record<PageKey, boolean>>>({
    [boot.page]: true,
  });
  const [, setOpenGroups] = useState<Record<string, boolean>>({
    "conf-eventos": true,
    "conf-bitacoras": true,
    "conf-repetitivos": true,
    "conf-activos": true,
    "conf-worst": true,
    "conf-analisis": true,
    "conf-comparacion": true,
    "inf-resultados": true,
    "inf-confiabilidad": true,
    "inf-conf-copower": true,
    "capa-root": true,
  });
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedMonth, setSelectedMonth] = useState<string>("Nov");
  const [activeWorkModuleId, setActiveWorkModuleId] = useState<string | null>(
    () => moduleForLeaf(boot.page, boot.leaf)?.id ?? null,
  );
  const [parkRoute, setParkRoute] = useState<FieldParkId | null>(() => parseParkRoute()?.id ?? null);
  const [parkSection, setParkSection] = useState<string>(() => {
    const park = parseParkRoute();
    return park ? parkSectionId(park.id, park.section) : "resumen";
  });
  const [atHome, setAtHome] = useState(() => parseParkRoute() == null && parsePath() == null);
  const [navOpen, setNavOpen] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(false);
  const [analyticsSessionId, setAnalyticsSessionId] = useState(() => getOrCreateAnalyticsSessionId());
  const sessionStartedAtRef = useRef(Date.now());
  const pageStartedAtRef = useRef(Date.now());
  const lastHeartbeatPageAtRef = useRef(Date.now());
  const viewRef = useRef({ page: boot.page, leaf: boot.leaf, label: "Historial de confiabilidad" });
  const skipUrlPushRef = useRef(false);

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
      setIsMobileNav(mq.matches);
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
  const visibleNavTree = useMemo(
    () => (session ? filterNavForRole(PROJECT_NAV_TREE, session.role) : []),
    [session],
  );
  const activeModule =
    visibleNavTree.find((m) => m.key === activePage) ??
    PROJECT_NAV_TREE.find((m) => m.key === activePage);
  const activeLeafLabel =
    (activeModule ? findLeafLabel(activeModule.children, activeLeafId) : null) ?? activeLeafId;

  // Normaliza la URL inicial (`/` se queda en Inicio) una sola vez al entrar en sesión.
  useEffect(() => {
    if (!session || atHome || parseParkRoute()) return;
    const focus = parsePath()?.focusId;
    replaceAppUrl(activePage, activeLeafId, focus);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al autenticar
  }, [session?.id]);

  useEffect(() => {
    const onPop = () => {
      const park = parseParkRoute();
      setParkRoute(park?.id ?? null);
      if (park) {
        setParkSection(parkSectionId(park.id, park.section));
        setAtHome(false);
        setActiveWorkModuleId(park.id);
        return;
      }
      const parsed = parsePath();
      if (!parsed) {
        setAtHome(true);
        return;
      }
      setAtHome(false);
      skipUrlPushRef.current = true;
      setActivePage(parsed.page);
      setActiveLeafId(parsed.leaf);
      setOpenModules((prev) => ({ ...prev, [parsed.page]: true }));
      if (parsed.focusId?.startsWith("EVT-")) {
        setFocusCostayacoRcaId(parsed.focusId);
        setFocusRcaId(null);
      } else if (parsed.focusId) {
        setFocusRcaId(parsed.focusId);
        setFocusCostayacoRcaId(null);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Land informes-only users on Resultados de Gestión; keep others out of informes unless allowed.
  useEffect(() => {
    if (!session) return;
    if (isInformesOnlyRole(session.role)) {
      if (activePage !== "informes") {
        const home = defaultHomeForRole(session.role);
        setActivePage(home.page);
        setActiveLeafId(home.leaf);
        setOpenModules((prev) => ({ ...prev, informes: true }));
        replaceAppUrl(home.page, home.leaf);
      }
      return;
    }
    const reunionLeaf =
      activeLeafId.startsWith("inf-conf-") || activeLeafId.startsWith("inf-cpw-");
    if (activePage === "informes" && !canAccessInformes(session.role) && !reunionLeaf) {
      const home = defaultHomeForRole(session.role);
      setActivePage(home.page);
      setActiveLeafId(home.leaf);
      replaceAppUrl(home.page, home.leaf);
    }
  }, [activePage, activeLeafId, session]);

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

  const [focusRcaId, setFocusRcaId] = useState<string | null>(() =>
    boot.focusId && !boot.focusId.startsWith("EVT-") ? boot.focusId : null,
  );
  const [focusCostayacoRcaId, setFocusCostayacoRcaId] = useState<string | null>(() =>
    boot.focusId?.startsWith("EVT-") ? boot.focusId : null,
  );
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
    const fromUrl = parsePath();
    const home = defaultHomeForRole(user.role);
    const canKeepUrl =
      Boolean(fromUrl) &&
      (isInformesOnlyRole(user.role)
        ? fromUrl!.page === "informes"
        : fromUrl!.page !== "informes" || canAccessInformes(user.role));
    const nextPage = canKeepUrl && fromUrl ? fromUrl.page : home.page;
    const nextLeaf = canKeepUrl && fromUrl ? fromUrl.leaf : home.leaf;
    const nextFocus = canKeepUrl && fromUrl ? fromUrl.focusId : null;
    setActivePage(nextPage);
    setActiveLeafId(nextLeaf);
    setOpenModules({ [nextPage]: true });
    replaceAppUrl(nextPage, nextLeaf, nextFocus);
    void trackLogin(user, sid);
  };

  const handleLogout = () => {
    if (!AUTH_ENABLED) return;
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

  const goHome = () => {
    setParkRoute(null);
    setParkSection("resumen");
    setAtHome(true);
    setNavOpen(false);
    if (window.location.pathname !== "/") {
      window.history.pushState({ home: true }, "", "/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!parkRoute) return;
    const sectionId = parkSectionId(parkRoute, parkSection);
    const next = parkPath(parkRoute, sectionId);
    if (cleanPathname() !== next) {
      window.history.replaceState({ park: parkRoute, section: sectionId }, "", next);
    }
  }, [parkRoute, parkSection]);

  const openPark = (id: FieldParkId, section?: string) => {
    const sectionId = parkSectionId(id, section);
    setParkRoute(id);
    setParkSection(sectionId);
    setActiveWorkModuleId(id);
    setAtHome(false);
    setNavOpen(false);
    const next = parkPath(id, sectionId);
    if (cleanPathname() !== next) {
      window.history.pushState({ park: id, section: sectionId }, "", next);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openModuleItem = (moduleId: string, page: PageKey, leaf: string) => {
    setParkRoute(null);
    setParkSection("resumen");
    setActiveWorkModuleId(moduleId);
    openFromQuick(page, leaf);
  };

  const selectLeaf = (page: PageKey, leafId: string) => {
    setParkRoute(null);
    setParkSection("resumen");
    setAtHome(false);
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
    if (!skipUrlPushRef.current) {
      pushAppUrl(page, leafId);
    }
    skipUrlPushRef.current = false;
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openFromQuick = (page: PageKey, leaf: string) => {
    selectLeaf(page, leaf);
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
      setActivePage("confiabilidad");
      setActiveLeafId("an-rca-gte");
      setOpenModules((prev) => ({ ...prev, confiabilidad: true }));
      pushAppUrl("confiabilidad", "an-rca-gte", rcaId);
      setNavOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setFocusRcaId(rcaId ?? null);
    setOpenGroups((prev) => ({ ...prev, "conf-analisis": true }));
    setActivePage("confiabilidad");
    setActiveLeafId("an-rca-casos");
    setOpenModules((prev) => ({ ...prev, confiabilidad: true }));
    pushAppUrl("confiabilidad", "an-rca-casos", rcaId);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToCostayacoRca = (evtId?: string) => {
    setFocusCostayacoRcaId(evtId ?? null);
    setOpenGroups((prev) => ({
      ...prev,
      "conf-eventos": true,
      "conf-bitacoras": true,
      "conf-analisis": true,
    }));
    setActivePage("confiabilidad");
    setActiveLeafId("an-rca-gte");
    setOpenModules((prev) => ({ ...prev, confiabilidad: true }));
    pushAppUrl("confiabilidad", "an-rca-gte", evtId);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (AUTH_ENABLED && !session) {
    return (
      <div className={`app-shell ${theme} login-shell`}>
        <LoginScreen onSuccess={handleLogin} />
      </div>
    );
  }

  if (!session) return null;

  const deskModule =
    WORK_MODULES.find((mod) => mod.id === activeWorkModuleId) ?? moduleForLeaf(activePage, activeLeafId);
  const showHome = atHome && !isInformesOnlyRole(session.role);
  const homeMonthLabel = monthOptionLabel(selectedMonth, {
    report: "dual",
    monthOrder: PLATFORM_MONTH_ORDER,
    reportLabel: "Inicio",
    reportShort: "Inicio",
  });
  const onParkRoute = Boolean(parkRoute);
  const timelineMonths = (showHome || onParkRoute ? PLATFORM_MONTH_ORDER : viewContext.monthOrder).slice().reverse();
  const timelineFixed = !showHome && !onParkRoute && Boolean(viewContext.fixedPeriod);
  const monthContext = showHome || onParkRoute
    ? { report: "dual" as const, monthOrder: PLATFORM_MONTH_ORDER, reportLabel: "Inicio", reportShort: "Inicio" }
    : viewContext;

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
          {navOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <button type="button" className="brand-home" onClick={goHome} title="Inicio">
          <InformeLogo className="app-logo app-logo--bar" />
        </button>
        {viewContext.fixedPeriod ? (
          <p className="mobile-month-fixed">{viewContext.periodLabel ?? monthLabel}</p>
        ) : (
          <select
            className="mobile-month-select"
            aria-label="Mes"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {viewContext.monthOrder.map((month) => (
              <option key={month} value={month}>
                {monthOptionLabel(month, viewContext)}
              </option>
            ))}
          </select>
        )}
        {AUTH_ENABLED ? (
        <button
          type="button"
          className="mobile-logout-btn"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
        ) : null}
      </header>

      <button
        type="button"
        className={`nav-backdrop${navOpen ? " open" : ""}`}
        aria-label="Cerrar menú"
        tabIndex={navOpen ? 0 : -1}
        aria-hidden={!navOpen}
        onClick={() => setNavOpen(false)}
      />

      <aside
        id="app-sidebar"
        className={`sidebar${navOpen ? " open" : ""}`}
        aria-hidden={isMobileNav && !navOpen ? true : undefined}
      >
        <div className="sidebar-mobile-head">
          <div className="brand">
            <InformeLogo className="app-logo" />
            <p className="brand-sub">Confiabilidad del parque</p>
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
        <button type="button" className="brand brand-desktop brand-home" onClick={goHome} title="Inicio">
          <InformeLogo className="app-logo" />
          <p className="brand-sub">Confiabilidad del parque</p>
        </button>

        {!isInformesOnlyRole(session.role) ? (
        <div className="context-rail">
          <nav className="side-modules" aria-label="Parques">
            <p className="eyebrow">Parques</p>
            {WORK_MODULES.filter((mod) => mod.id === "costayaco" || mod.id === "vonu" || mod.id === "pad4").map((mod) => {
              const Icon = mod.icon;
              const id = mod.id as FieldParkId;
              const active = parkRoute === id;
              return (
                <div key={mod.id} className={active ? "side-module active" : "side-module"}>
                  <button
                    type="button"
                    className={active ? "side-module-btn active" : "side-module-btn"}
                    aria-current={active ? "true" : undefined}
                    onClick={() => openPark(id)}
                  >
                    <Icon size={16} aria-hidden />
                    <span>
                      <strong>{mod.label}</strong>
                      <small>{mod.hint}</small>
                    </span>
                  </button>
                  {active ? (
                    <ul className="side-module-items">
                      {PARK_SECTIONS[id].map((section) => (
                        <li key={section.id}>
                          <button
                            type="button"
                            className={parkSectionId(id, parkSection) === section.id ? "active" : undefined}
                            aria-current={parkSectionId(id, parkSection) === section.id ? "page" : undefined}
                            onClick={() => openPark(id, section.id)}
                          >
                            {section.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
            <p className="eyebrow">También</p>
            {WORK_MODULES.filter((mod) => mod.id === "analisis" || mod.id === "reunion").map((mod) => {
              const Icon = mod.icon;
              const active = !parkRoute && !showHome && deskModule?.id === mod.id;
              const first = mod.items[0];
              if (!first) return null;
              return (
                <div key={mod.id} className={active ? "side-module active" : "side-module"}>
                  <button
                    type="button"
                    className={active ? "side-module-btn active" : "side-module-btn"}
                    aria-current={active ? "true" : undefined}
                    onClick={() => openModuleItem(mod.id, first.page, first.leaf)}
                  >
                    <Icon size={16} aria-hidden />
                    <span>
                      <strong>{mod.label}</strong>
                      <small>{mod.hint}</small>
                    </span>
                  </button>
                  {active ? (
                    <ul className="side-module-items">
                      {mod.items.map((item) => (
                        <li key={item.leaf}>
                          <button
                            type="button"
                            className={activeLeafId === item.leaf ? "active" : undefined}
                            onClick={() => openModuleItem(mod.id, item.page, item.leaf)}
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </nav>
          <div className="timeline">
            <p className="eyebrow">Mes</p>
            {timelineFixed ? (
              <p className="timeline-fixed">{viewContext.periodLabel ?? monthLabel}</p>
            ) : (
              <ol className="timeline-list">
                {timelineMonths.map((month) => {
                  const active = month === selectedMonth;
                  return (
                    <li key={month}>
                      <button
                        type="button"
                        className={active ? "timeline-btn active" : "timeline-btn"}
                        aria-current={active ? "true" : undefined}
                        onClick={() => setSelectedMonth(month)}
                      >
                        <span className="timeline-mark" aria-hidden />
                        <span>{monthOptionLabel(month, monthContext)}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
        ) : null}
        <div className="shell-foot">
          <div className="session-user" title={`${session.email} · ${ROLE_LABELS[session.role]}`}>
            <span className="session-user-avatar" aria-hidden>
              <UserRound size={16} />
            </span>
            <span className="session-user-meta">
              <strong className="session-user-name">{session.name}</strong>
              <span className="session-user-role">{ROLE_LABELS[session.role]}</span>
            </span>
            {AUTH_ENABLED ? (
            <button type="button" className="session-logout" onClick={handleLogout} title="Cerrar sesión">
              <LogOut size={15} />
              <span>Salir</span>
            </button>
            ) : null}
          </div>
          <div className="theme-switch-row shell-theme">
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
      </aside>

      <main className={viewContext.report === "dual" && !showHome ? "main main-dual" : "main"}>
        {parkRoute ? (
          <ParkDossier
            park={parkRoute}
            month={selectedMonth}
            monthLabel={homeMonthLabel}
            activeSection={parkSection}
            onSection={(sectionId) => openPark(parkRoute, sectionId)}
            rcaEvents={costayacoRcaEvents}
            onRcaChange={updateCostayacoRca}
          />
        ) : showHome ? (
          <HomeBoard monthLabel={homeMonthLabel} activePark={parkRoute} onOpenPark={openPark} />
        ) : (
        <>
        {!isInformesOnlyRole(session.role) && deskModule ? (
          <ModuleStrip
            mod={deskModule}
            activeLeaf={activeLeafId}
            onOpen={openModuleItem}
            onHome={goHome}
          />
        ) : null}
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
          onOpen={selectLeaf}
        />
        </>
        )}
      </main>
      {!isInformesOnlyRole(session.role) ? (
      <nav className="quick-bar" aria-label="Parques">
        <button
          type="button"
          className={showHome ? "quick-bar-btn active" : "quick-bar-btn"}
          onClick={goHome}
        >
          <LayoutDashboard size={18} />
          <span>Inicio</span>
        </button>
        {PARK_OPTIONS.filter((park) => park.id !== "parque").map((park) => (
          <button
            key={park.id}
            type="button"
            className={parkRoute === park.id ? "quick-bar-btn active" : "quick-bar-btn"}
            onClick={() => openPark(park.id as FieldParkId)}
          >
            <span>{park.label}</span>
          </button>
        ))}
        <button type="button" className={navOpen ? "quick-bar-btn active" : "quick-bar-btn"} onClick={() => setNavOpen(true)}>
          <Menu size={18} />
          <span>Mes</span>
        </button>
      </nav>
      ) : null}
    </div>
  );
}

export default App;
