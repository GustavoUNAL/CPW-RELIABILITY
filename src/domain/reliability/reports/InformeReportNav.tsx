import { useEffect, useId, useState } from "react";
import { FileDown, List, Menu, X } from "lucide-react";
import { InformeLogo } from "./InformeBrandChrome";

export type InformeNavItem = {
  id: string;
  label: string;
  short?: string;
  children?: InformeNavItem[];
};

/** Índice fijo del informe completo (anclas en el DOM). */
export const INFORME_REPORT_TOC: InformeNavItem[] = [
  { id: "inf-sec-resumen", label: "1 · Resumen ejecutivo", short: "Resumen" },
  { id: "inf-sec-disponibilidad", label: "3 · Disponibilidad", short: "Disponibilidad" },
  { id: "inf-sec-generacion", label: "4 · Generación y horas", short: "Generación" },
  { id: "inf-sec-confiabilidad", label: "5 · Confiabilidad", short: "Confiabilidad" },
  { id: "inf-sec-maquinas", label: "6 · Indicadores por máquina", short: "Máquinas" },
  {
    id: "inf-sec-fallas",
    label: "7 · Fallas e indisponibilidades",
    short: "Fallas",
    children: [
      { id: "inf-conf-rca-EVT-2026-07-12-MRU", label: "FO-58 · Cascada MRU", short: "FO-58" },
      { id: "inf-conf-rca-EVT-2026-07-21-CPW04", label: "FO-60 · Gas MQT", short: "FO-60" },
      { id: "inf-conf-rca-EVT-2026-07-21-MRU", label: "FO-61 · Cascada MRU", short: "FO-61" },
      { id: "inf-conf-rca-EVT-2026-07-24-MRU", label: "FO-62 · Red 34,5 kV", short: "FO-62" },
      { id: "inf-conf-rca-EVT-2026-07-25-MRU", label: "FO-63 · Cascada MRU", short: "FO-63" },
    ],
  },
  { id: "inf-conf-repetitivos", label: "8 · Eventos repetitivos", short: "Repetitivos" },
  { id: "inf-conf-mantenimiento", label: "9 · Plan de mantenimiento", short: "Mantenimiento" },
  { id: "inf-sec-inventario", label: "10 · Inventario", short: "Inventario" },
  { id: "inf-sec-degradacion", label: "11 · Tendencias y riesgos", short: "Riesgos" },
  { id: "inf-conf-eficiencia", label: "12 · Eficiencia energética", short: "Eficiencia" },
  { id: "inf-sec-conclusiones", label: "13 · Conclusiones y acciones", short: "Conclusiones" },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  const details = el.matches("details")
    ? (el as HTMLDetailsElement)
    : el.querySelector(":scope > details.inf-conf-collapse");
  if (details instanceof HTMLDetailsElement && !details.open) details.open = true;
}

function TocList({
  items,
  onNavigate,
  nested = false,
}: {
  items: InformeNavItem[];
  onNavigate: (id: string) => void;
  nested?: boolean;
}) {
  return (
    <ul className={nested ? "inf-report-toc-list nested" : "inf-report-toc-list"}>
      {items.map((item) => (
        <li key={item.id}>
          <button type="button" className="inf-report-toc-link" onClick={() => onNavigate(item.id)}>
            <span>{item.short ?? item.label}</span>
            <em>{item.label}</em>
          </button>
          {item.children?.length ? (
            <TocList items={item.children} onNavigate={onNavigate} nested />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

type Props = {
  monthLabel: string;
  reportId: string;
};

/** Índice + menú hamburguesa del informe completo. */
export function InformeReportNav({ monthLabel, reportId }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.body.classList.toggle("inf-report-nav-open", open);
    return () => document.body.classList.remove("inf-report-nav-open");
  }, [open]);

  const navigate = (id: string) => {
    scrollToSection(id);
    setOpen(false);
  };

  return (
    <aside className="inf-report-nav-shell" aria-label="Navegación del informe" data-report-nav={reportId}>
      <div className="inf-report-chrome">
        <div className="inf-report-chrome-brand">
          <InformeLogo className="inf-brand-logo inf-brand-logo--nav" />
          <div className="inf-report-chrome-brand-copy">
            <p className="eyebrow">COPOWER · GTE</p>
            <strong>Informe de confiabilidad</strong>
            <small>{monthLabel}</small>
          </div>
        </div>
        <div className="inf-report-chrome-actions">
          <button
            type="button"
            className="inf-report-menu-btn inf-report-print-btn"
            title="Exportar PDF"
            onClick={() => window.print()}
          >
            <FileDown size={16} />
            <span>PDF</span>
          </button>
          <button
            type="button"
            className="inf-report-menu-btn"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
            <span>{open ? "Cerrar" : "Índice"}</span>
          </button>
        </div>
        <nav className="inf-report-toc-desktop" aria-label="Índice del informe">
          <p className="inf-report-toc-title">
            <List size={14} aria-hidden />
            Índice
          </p>
          <TocList items={INFORME_REPORT_TOC} onNavigate={navigate} />
        </nav>
      </div>

      {open ? (
        <button
          type="button"
          className="inf-report-nav-backdrop"
          aria-label="Cerrar índice"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        id={panelId}
        className={`inf-report-toc-drawer${open ? " open" : ""}`}
        aria-hidden={!open}
        role="dialog"
        aria-modal={open}
        aria-label="Índice del informe"
      >
        <div className="inf-report-toc-drawer-head">
          <div>
            <p className="eyebrow">Navegar</p>
            <strong>Secciones del informe</strong>
            <small>{monthLabel}</small>
          </div>
          <button type="button" className="inf-report-menu-btn ghost" onClick={() => setOpen(false)}>
            <X size={18} />
            <span>Cerrar</span>
          </button>
        </div>
        <TocList items={INFORME_REPORT_TOC} onNavigate={navigate} />
      </div>
    </aside>
  );
}
