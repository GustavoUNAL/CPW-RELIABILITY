import type { ReactNode } from "react";
import { createElement, Fragment } from "react";

const MARK_RE = /(\(SUPUESTO\)|SUPUESTO|PENDIENTE)/gi;

export function hasUncertaintyMark(text: string | null | undefined): boolean {
  if (!text) return false;
  return /(\(SUPUESTO\)|SUPUESTO|PENDIENTE)/i.test(text);
}

/** Resalta (SUPUESTO) y PENDIENTE sin presentarlos como hechos confirmados. */
export function UncertaintyText({
  text,
  className,
}: {
  text: string | null | undefined;
  className?: string;
}): ReactNode {
  if (text == null || text === "") return "—";
  const parts = String(text).split(MARK_RE);
  return createElement(
    "span",
    { className },
    parts.map((part, i) => {
      if (!part) return null;
      if (/^\(SUPUESTO\)$/i.test(part) || /^SUPUESTO$/i.test(part)) {
        return createElement(
          "mark",
          { key: i, className: "rca-mark rca-mark--supuesto", title: "Análisis inferido — no confirmado" },
          part,
        );
      }
      if (/^PENDIENTE$/i.test(part)) {
        return createElement(
          "mark",
          { key: i, className: "rca-mark rca-mark--pendiente", title: "Dato pendiente de completar" },
          part,
        );
      }
      return createElement(Fragment, { key: i }, part);
    }),
  );
}

export function needsWarningBanner(event: {
  es_supuesto: boolean;
  calidad_dato: string;
}): boolean {
  return event.es_supuesto || event.calidad_dato === "inferido" || event.calidad_dato === "vacio";
}
