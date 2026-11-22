import type { ReactNode } from "react";

export const COPOWER_PDF = {
  navy: "#172D49",
  red: "#C0392B",
  teal: "#0a6b73",
  phone: "(607) 674 82 48",
  mobile: "(+57) 310 7911 562  –  316 436 8932",
  email: "info@copower.com.co",
  address: "Carrera 21 N° 8 – 10, Bucaramanga, Colombia",
  web: "www.copower.com.co",
  author: "Gustavo Arteaga",
  authorEmail: "innovacion.confiabilidad@copower.com.co",
};

const SLIDE_BG = "/informe-chrome/slide-bg.png";

export function CopowerLogoMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 48" aria-hidden>
      <path
        d="M44 24c0 10.5-8.3 19-18.5 19S7 34.5 7 24 15.3 5 25.5 5c6.2 0 11.6 3.1 15 7.8"
        fill="none"
        stroke={COPOWER_PDF.navy}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M4 26h14l3-8 5 16 4-10 4 6h26"
        fill="none"
        stroke={COPOWER_PDF.red}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CopowerLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`icpdf-logo${compact ? " is-compact" : ""}`}>
      <CopowerLogoMark className="icpdf-logo-mark" />
      <div>
        <strong>COPOWER</strong>
        <em>Energy Solutions</em>
      </div>
    </div>
  );
}

export function PdfSlide({
  page,
  title,
  kicker,
  children,
  cover = false,
}: {
  page: number;
  title?: string;
  kicker?: string;
  children: ReactNode;
  cover?: boolean;
}) {
  return (
    <article className={`icpdf-slide${cover ? " is-cover" : ""}`} id={`lamina-${page}`} data-page={page}>
      <img className="icpdf-slide-bg" src={SLIDE_BG} alt="" />
      {cover ? (
        children
      ) : (
        <>
          {title ? <h2 className="icpdf-title">{title}</h2> : null}
          <div className="icpdf-card">
            {kicker ? <p className="icpdf-kicker">{kicker}</p> : null}
            {children}
          </div>
        </>
      )}
      <span className="icpdf-page-n">{page}</span>
    </article>
  );
}
