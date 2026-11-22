import type { ReactNode } from "react";
import { AlertCircle, Database } from "lucide-react";
import type { ReportKey } from "../types";

type Props = {
  title?: string;
  subtitle?: string;
  report: ReportKey | "dual";
  sourceFile?: string;
  children: ReactNode;
  className?: string;
  /** Sin cabecera interna — el hijo aporta su propio título. */
  headless?: boolean;
};

const REPORT_BADGE: Record<ReportKey | "dual", { label: string; className: string }> = {
  copower: { label: "COPOWER", className: "source-badge cpw" },
  gran_tierra: { label: "Gran Tierra", className: "source-badge gte" },
  dual: { label: "Comparativo", className: "source-badge dual" },
};

export function ScreenShell({ title, subtitle, report, sourceFile, children, className, headless }: Props) {
  const badge = REPORT_BADGE[report];
  return (
    <section className={`screen-shell panel ${className ?? ""}`.trim()}>
      <article className="card">
        {!headless && (title || subtitle || sourceFile) ? (
          <header className="screen-shell-head">
            <div>
              {title ? <h3>{title}</h3> : null}
              {subtitle ? <p className="muted">{subtitle}</p> : null}
            </div>
            <div className="screen-shell-meta">
              <span className={badge.className}>{badge.label}</span>
              {sourceFile ? (
                <span className="screen-source-file">
                  <Database size={13} />
                  {sourceFile}
                </span>
              ) : null}
            </div>
          </header>
        ) : null}
        {children}
      </article>
    </section>
  );
}

export function EmptyScreen({
  title = "Sin registros",
  detail,
  report,
}: {
  title?: string;
  detail: string;
  report?: ReportKey | "dual";
}) {
  return (
    <section className="panel">
      <article className="card empty-card">
        <div className="empty-card-icon">
          <AlertCircle size={28} />
        </div>
        <h3>{title}</h3>
        <p className="empty-state">{detail}</p>
        {report ? <span className={`source-badge ${report === "copower" ? "cpw" : report === "gran_tierra" ? "gte" : "dual"}`}>{REPORT_BADGE[report].label}</span> : null}
      </article>
    </section>
  );
}
