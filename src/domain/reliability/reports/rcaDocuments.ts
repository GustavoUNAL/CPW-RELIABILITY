/** Catálogo de PDF RCA entregados (fuente: data/RCA → servidos desde /public/rca). */

export type RcaDeliveredDocument = {
  id: string;
  title: string;
  eventLabel: string;
  eventDate: string;
  eventTime: string;
  equipment: string;
  linkedRcaId: string;
  sequential: string;
  /** Ruta pública Vite (public/rca/…). */
  url: string;
  fileName: string;
  pages: number;
  revision: string;
  status: "Entregado" | "Borrador";
  docStatus: string;
  elaboratedBy: string;
  reviewedBy: string;
  approvedBy: string;
  notes: string;
};

/**
 * Documentos formales en data/RCA.
 * Ambos PDF = mismo evento Sec. 30 (22-jun-2026 · Vector Shift / Shutdown Costayaco).
 */
export const RCA_DELIVERED_DOCUMENTS: RcaDeliveredDocument[] = [
  {
    id: "DOC-RCA-030",
    title: "RCA Shutdown General Costayaco — Vector Shift EEP 34.5 kV",
    eventLabel: "Vector Shift — Falla en reconectador EEP 34.5 kV",
    eventDate: "2026-06-22",
    eventTime: "03:49:00",
    equipment: "CPW-01…07, CPW-12, JINAN-01, JINAN-02",
    linkedRcaId: "RCA-030",
    sequential: "Sec. 30",
    url: "/rca/RCA-Costayaco-2026-06-22-Vector-Shift.pdf",
    fileName: "RCA-Costayaco-2026-06-22-Vector-Shift.pdf",
    pages: 7,
    revision: "Revisión 1 (análisis eléctrico)",
    status: "Entregado",
    docStatus: "Entregado",
    elaboratedBy: "Daniel Durán · Ing. Confiabilidad",
    reviewedBy: "David Cornejo · Coordinador O&M",
    approvedBy: "Wilson Oliveros · Líder Operaciones Gen",
    notes:
      "Campo Costayaco · Cliente GTE · Jenbacher J320–J420. Hipótesis principal: falla reconectador Puerto Limón EEP.",
  },
  {
    id: "DOC-RCA-030-REV1",
    title: "RCA Shutdown General Costayaco — Vector Shift (copia entregada)",
    eventLabel: "Vector Shift — Falla en reconectador EEP 34.5 kV",
    eventDate: "2026-06-22",
    eventTime: "03:49:00",
    equipment: "CPW-01…07, CPW-12, JINAN-01, JINAN-02",
    linkedRcaId: "RCA-030",
    sequential: "Sec. 30",
    url: "/rca/RCA-Costayaco-2026-06-22-Vector-Shift-rev1.pdf",
    fileName: "RCA-Costayaco-2026-06-22-Vector-Shift-rev1.pdf",
    pages: 7,
    revision: "Revisión 1 (archivo alterno)",
    status: "Entregado",
    docStatus: "Entregado",
    elaboratedBy: "Daniel Durán · Ing. Confiabilidad",
    reviewedBy: "David Cornejo · Coordinador O&M",
    approvedBy: "Wilson Oliveros · Líder Operaciones Gen",
    notes: "Segunda copia del mismo RCA Sec. 30 en carpeta data/RCA.",
  },
];

export function docsForRca(rcaId: string): RcaDeliveredDocument[] {
  return RCA_DELIVERED_DOCUMENTS.filter((d) => d.linkedRcaId === rcaId);
}

/** Archivos PDF en data/RCA (revisiones cuentan por separado). */
export const RCA_DELIVERED_COUNT = RCA_DELIVERED_DOCUMENTS.filter((d) => d.status === "Entregado").length;

/** Casos RCA distintos con PDF en data/RCA. */
export const RCA_DELIVERED_CASE_COUNT = new Set(
  RCA_DELIVERED_DOCUMENTS.filter((d) => d.status === "Entregado").map((d) => d.linkedRcaId),
).size;

export const RCA_FOLDER_LABEL = "data/RCA";
