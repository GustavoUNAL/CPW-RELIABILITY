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
 * Ambos PDF = mismo evento Sec. 30 (22-jun-2026 · salida de la máquina / Shutdown Costayaco).
 */
export const RCA_DELIVERED_DOCUMENTS: RcaDeliveredDocument[] = [
  {
    id: "DOC-RCA-030",
    title: "RCA Shutdown General Costayaco — salida de la máquina · EEP 34.5 kV",
    eventLabel: "Salida de la máquina — falla en reconectador EEP 34.5 kV",
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
    title: "RCA Shutdown General Costayaco — salida de la máquina (copia entregada)",
    eventLabel: "Salida de la máquina — falla en reconectador EEP 34.5 kV",
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
  {
    id: "DOC-FO-058",
    title: "FO-GE-033 No. 58 — Cascada MRU Quincy",
    eventLabel: "Salida MRU por baja presión de aceite Quincy",
    eventDate: "2026-07-12",
    eventTime: "05:28:00",
    equipment: "CPW-01, CPW-03, CPW-07, JIN-10/11/12",
    linkedRcaId: "RCA-070",
    sequential: "FO-58",
    url: "/rca/FO-GE-033-2026-07-12-MRU-58.pdf",
    fileName: "FO-GE-033-2026-07-12-MRU-58.pdf",
    pages: 0,
    revision: "Entregado GTE",
    status: "Entregado",
    docStatus: "Entregado",
    elaboratedBy: "Jose Luis Alvarez",
    reviewedBy: "David Cornejo",
    approvedBy: "GTE",
    notes: "Fuente data/Julio/RCA. Falla externa a los grupos.",
  },
  {
    id: "DOC-FO-060",
    title: "FO-GE-033 No. 60 — Detonación CPW-04",
    eventLabel: "Detonación alta en un cilindro · gas MQT",
    eventDate: "2026-07-21",
    eventTime: "15:16:00",
    equipment: "CPW-04",
    linkedRcaId: "RCA-071",
    sequential: "FO-60",
    url: "/rca/FO-GE-033-2026-07-21-CPW04-60.pdf",
    fileName: "FO-GE-033-2026-07-21-CPW04-60.pdf",
    pages: 0,
    revision: "Entregado GTE (archivo #54)",
    status: "Entregado",
    docStatus: "Entregado",
    elaboratedBy: "Javier Montes",
    reviewedBy: "David Cornejo",
    approvedBy: "GTE",
    notes: "Fuente data/Julio/RCA. Reingreso 20:21 según horas concertadas.",
  },
  {
    id: "DOC-FO-061",
    title: "FO-GE-033 No. 61 — Cascada MRU GLP",
    eventLabel: "Salida MRU por alto nivel de GLP",
    eventDate: "2026-07-21",
    eventTime: "17:55:00",
    equipment: "CPW-01/02/03/07, JIN-10",
    linkedRcaId: "RCA-072",
    sequential: "FO-61",
    url: "/rca/FO-GE-033-2026-07-21-MRU-61.pdf",
    fileName: "FO-GE-033-2026-07-21-MRU-61.pdf",
    pages: 0,
    revision: "Entregado GTE",
    status: "Entregado",
    docStatus: "Entregado",
    elaboratedBy: "Jose Luis Alvarez",
    reviewedBy: "David Cornejo",
    approvedBy: "GTE",
    notes: "Fuente data/Julio/RCA. Causa formal MRU aún por definir.",
  },
  {
    id: "DOC-FO-062",
    title: "FO-GE-033 No. 62 — Reconectador EEP 34.5 kV",
    eventLabel: "Disparo reconectador Junín–Mocoa → sale MRU",
    eventDate: "2026-07-24",
    eventTime: "07:08:00",
    equipment: "CPW-01/02/03/07, JIN-10",
    linkedRcaId: "RCA-073",
    sequential: "FO-62",
    url: "/rca/FO-GE-033-2026-07-24-MRU-62.pdf",
    fileName: "FO-GE-033-2026-07-24-MRU-62.pdf",
    pages: 0,
    revision: "Entregado GTE (app.pdf)",
    status: "Entregado",
    docStatus: "Entregado",
    elaboratedBy: "Javier Alberto Montes Losada",
    reviewedBy: "David Cornejo",
    approvedBy: "GTE",
    notes: "Fuente data/Julio/RCA/app.pdf. Mismo modo EEP que junio.",
  },
  {
    id: "DOC-FO-063",
    title: "FO-GE-033 No. 63 — Sobrepresión manifold CYC",
    eventLabel: "Salida MRU por sobrepresión manifold Costayaco",
    eventDate: "2026-07-25",
    eventTime: "12:58:00",
    equipment: "CPW-01/02/03/07, JIN-10/11",
    linkedRcaId: "RCA-074",
    sequential: "FO-63",
    url: "/rca/FO-GE-033-2026-07-25-MRU-63.pdf",
    fileName: "FO-GE-033-2026-07-25-MRU-63.pdf",
    pages: 0,
    revision: "Entregado GTE (archivo #55)",
    status: "Entregado",
    docStatus: "Entregado",
    elaboratedBy: "Javier Alberto Montes Losada",
    reviewedBy: "David Cornejo",
    approvedBy: "GTE",
    notes: "Fuente data/Julio/RCA. Cuarta cascada MRU de julio.",
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

export const RCA_FOLDER_LABEL = "data/RCA + data/Julio/RCA";
