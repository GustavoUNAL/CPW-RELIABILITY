export const COPOWER_LOGO_SRC = "/brand/copower-logo.png";

type LogoProps = {
  className?: string;
  alt?: string;
};

export function InformeLogo({ className, alt = "COPOWER Energy Solutions" }: LogoProps) {
  return <img src={COPOWER_LOGO_SRC} alt={alt} className={className ?? "inf-brand-logo"} />;
}

type ChromeProps = {
  monthLabel: string;
};

/** Encabezado que se repite en cada hoja al imprimir / exportar PDF. */
export function InformePrintHeader({ monthLabel }: ChromeProps) {
  return (
    <div className="inf-print-header" aria-hidden>
      <InformeLogo className="inf-brand-logo inf-brand-logo--print-head" />
      <div className="inf-print-header-copy">
        <strong>Informe de confiabilidad</strong>
        <span>Parque de generación Putumayo Norte · {monthLabel} 2026</span>
      </div>
      <span className="inf-print-header-client">Gran Tierra Energy</span>
    </div>
  );
}

/** Pie que se repite en cada hoja al imprimir / exportar PDF. */
export function InformePrintFooter({ monthLabel }: ChromeProps) {
  return (
    <div className="inf-print-footer" aria-hidden>
      <InformeLogo className="inf-brand-logo inf-brand-logo--print-foot" />
      <p>
        COPOWER Energy Solutions · Informe de confiabilidad · Costayaco / Vonú · {monthLabel} 2026 ·
        Uso interno · Confidencial
      </p>
    </div>
  );
}

/** Cierre institucional al final del informe (pantalla e impresión). */
export function InformeDocumentFooter({ monthLabel }: ChromeProps) {
  return (
    <footer className="inf-doc-footer">
      <InformeLogo className="inf-brand-logo inf-brand-logo--doc-foot" />
      <div className="inf-doc-footer-copy">
        <strong>COPOWER Energy Solutions</strong>
        <p>
          Informe de confiabilidad · Parque de generación Putumayo Norte · {monthLabel} 2026
        </p>
        <p>Costayaco / Vonú · Gran Tierra Energy · Uso interno · Confidencial</p>
      </div>
    </footer>
  );
}
