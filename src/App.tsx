import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  Database,
  FileText,
  Gauge,
  GitCompare,
  LayoutDashboard,
  MapPin,
  SearchCheck,
  Settings2,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { PlatformContent } from "./domain/reliability/reports/PlatformContent";
import type { PageKey } from "./domain/reliability/types";
import {
  PROJECT_NAV_TREE,
  PROJECT_TITLE,
  firstLeafId,
  type NavNode,
} from "./domain/reliability/nav/projectTree";
import {
  defaultMonth,
  monthOptionLabel,
  resolveViewContext,
} from "./domain/reliability/nav/resolveContext";

const MODULE_ICONS: Record<PageKey, ReactNode> = {
  dashboard: <LayoutDashboard size={16} />,
  campos: <MapPin size={16} />,
  generacion: <Zap size={16} />,
  comparacion: <GitCompare size={16} />,
  eventos: <AlertTriangle size={16} />,
  mantenimiento: <Wrench size={16} />,
  acciones: <ClipboardCheck size={16} />,
  planeacion: <CalendarRange size={16} />,
  confiabilidad: <Gauge size={16} />,
  operacion: <Database size={16} />,
  analisis: <Sparkles size={16} />,
  calidad_datos: <SearchCheck size={16} />,
  reportes: <ClipboardList size={16} />,
  configuracion: <Settings2 size={16} />,
};

const OM_COLOMBIA_URL =
  "https://copowercomco-my.sharepoint.com/personal/tec_op_copower_com_co/Documents/Forms/All.aspx?RootFolder=%2Fpersonal%2Ftec%5Fop%5Fcopower%5Fcom%5Fco%2FDocuments%2FO%26M%20COLOMBIA&View=%7B181C171F%2DD036%2D4F1F%2DBE86%2D9D8BEC441F3D%7D";

const DEFAULT_MODULE = PROJECT_NAV_TREE[0];
const DEFAULT_LEAF = "dash-resumen";

function App() {
  const [activePage, setActivePage] = useState<PageKey>(DEFAULT_MODULE.key);
  const [activeLeafId, setActiveLeafId] = useState(DEFAULT_LEAF);
  const [openModules, setOpenModules] = useState<Partial<Record<PageKey, boolean>>>({
    [DEFAULT_MODULE.key]: true,
  });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "conf-copower": true,
    "conf-gte": true,
    "op-horas": true,
    "cfg-empresas": true,
  });
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedMonth, setSelectedMonth] = useState<string>("Jun");

  const viewContext = useMemo(
    () => resolveViewContext(activePage, activeLeafId),
    [activePage, activeLeafId],
  );

  useEffect(() => {
    if (!viewContext.monthOrder.includes(selectedMonth)) {
      setSelectedMonth(defaultMonth(viewContext));
    }
  }, [viewContext, selectedMonth]);

  const monthLabel = monthOptionLabel(selectedMonth, viewContext);

  const selectLeaf = (page: PageKey, leafId: string) => {
    setActivePage(page);
    setActiveLeafId(leafId);
    setOpenModules((prev) => ({ ...prev, [page]: true }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectModule = (page: PageKey) => {
    const mod = PROJECT_NAV_TREE.find((m) => m.key === page);
    const leaf = mod ? firstLeafId(mod.children) : null;
    if (leaf) selectLeaf(page, leaf);
    else {
      setActivePage(page);
      setOpenModules((prev) => ({ ...prev, [page]: true }));
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

  return (
    <div className={`app-shell ${theme}`}>
      <aside className="sidebar">
        <div className="brand">
          <p className="eyebrow">COPOWER</p>
          <h1>Gestión de confiabilidad</h1>
          <p className="brand-sub">{PROJECT_TITLE}</p>
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
            {PROJECT_NAV_TREE.map((mod) => {
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
                  {isOpen ? <ul className="project-leaves">{renderNavNodes(mod.key, mod.children)}</ul> : null}
                </div>
              );
            })}
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
        <PlatformContent
          page={activePage}
          leafId={activeLeafId}
          month={selectedMonth}
          monthLabel={monthLabel}
        />
      </main>
    </div>
  );
}

export default App;
