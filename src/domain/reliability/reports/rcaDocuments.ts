/** Catálogo de PDF RCA entregados (servidos desde /public/rca). */

export type RcaDeliveredDocument = {
  id: string;
  title: string;
  eventLabel: string;
  eventDate: string;
  equipment: string;
  linkedRcaId: string;
  /** Ruta pública Vite (public/rca/…). */
  url: string;
  fileName: string;
  pages: number;
  revision: string;
  status: "Entregado" | "Borrador";
  notes: string;
};

/**
 * Documentos formales enviados a Gran Tierra.
 * Nota: ambos PDF corresponden al mismo evento (22-jun-2026 · Vector Shift / Shutdown Costayaco);
 * se conservan las dos revisiones entregadas.
 */
export const RCA_DELIVERED_DOCUMENTS: RcaDeliveredDocument[] = [
  {
    id: "DOC-RCA-030",
    title: "RCA Shutdown General Costayaco — Vector Shift EEP 34.5 kV",
    eventLabel: "Vector Shift · falla reconectador EEP",
    eventDate: "2026-06-22",
    equipment: "Parque Costayaco (CPW01–07, CPW12, JIN-01/02)",
    linkedRcaId: "RCA-030",
    url: "/rca/RCA-Costayaco-2026-06-22-Vector-Shift.pdf",
    fileName: "RCA-Costayaco-2026-06-22-Vector-Shift.pdf",
    pages: 7,
    revision: "Revisión 1",
    status: "Entregado",
    notes: "Secuencial 30 · elaborado COPOWER · aprobado Wilson Oliveros. Estado en PDF: ABIERTO — SOE turbina.",
  },
  {
    id: "DOC-RCA-030-REV1",
    title: "RCA Shutdown General Costayaco — Vector Shift (revisión entregada)",
    eventLabel: "Vector Shift · falla reconectador EEP",
    eventDate: "2026-06-22",
    equipment: "Parque Costayaco (CPW01–07, CPW12, JIN-01/02)",
    linkedRcaId: "RCA-030",
    url: "/rca/RCA-Costayaco-2026-06-22-Vector-Shift-rev1.pdf",
    fileName: "RCA-Costayaco-2026-06-22-Vector-Shift-rev1.pdf",
    pages: 7,
    revision: "Revisión 1 (archivo alterno entregado)",
    status: "Entregado",
    notes: "Segunda copia/revisión del mismo RCA Sec. 30 enviada al cliente.",
  },
];

export function docsForRca(rcaId: string): RcaDeliveredDocument[] {
  return RCA_DELIVERED_DOCUMENTS.filter((d) => d.linkedRcaId === rcaId);
}

export const RCA_DELIVERED_COUNT = RCA_DELIVERED_DOCUMENTS.filter((d) => d.status === "Entregado").length;
