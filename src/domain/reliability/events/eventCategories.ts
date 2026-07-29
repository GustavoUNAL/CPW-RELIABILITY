export type EventCategoryCode =
  | "ELEC_RED"
  | "ELEC_PROTECCIONES"
  | "GAS_SUMINISTRO"
  | "GAS_TRATAMIENTO"
  | "MEC_COMBUSTION"
  | "MEC_ADMISION_ESCAPE"
  | "MEC_ENFRIAMIENTO_LUBRICACION"
  | "CTRL_GOBERNACION"
  | "CTRL_SENSORES_ACTUADORES"
  | "MTO_PROGRAMADO"
  | "MTO_CORRECTIVO"
  | "OPER_MANIOBRA"
  | "OPER_TRANSVERSAL_PARQUE"
  | "INFRA_AUXILIARES"
  | "EXTERNO_TERCEROS"
  | "DATOS_INSUFICIENTES";

export type EventCategory = {
  code: EventCategoryCode;
  label: string;
  shortLabel: string;
  description: string;
  keywords: RegExp[];
};

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    code: "ELEC_RED",
    label: "Infraestructura eléctrica y red externa",
    shortLabel: "Red eléctrica",
    description: "Perturbaciones de red, reconectadores, sobrecorriente, variaciones de tensión/frecuencia.",
    keywords: [
      /red/i,
      /reconectador/i,
      /34\.?5\s*kv/i,
      /sobrecorriente/i,
      /voltaje|volt/i,
      /frecuencia/i,
      /c9|rx/i,
    ],
  },
  {
    code: "ELEC_PROTECCIONES",
    label: "Protecciones y tableros eléctricos",
    shortLabel: "Protecciones",
    description: "Apertura de tableros, disparos de protecciones o totalizadores de auxiliares.",
    keywords: [/tablero/i, /auxiliares/i, /protecci[oó]n/i, /totalizador/i, /disparo/i],
  },
  {
    code: "GAS_SUMINISTRO",
    label: "Suministro y calidad de gas",
    shortLabel: "Suministro gas",
    description: "Caídas de presión, calidad del gas o disponibilidad de combustible.",
    keywords: [/presi[oó]n de gas/i, /baja presi[oó]n/i, /\bgas\b/i, /combustible/i],
  },
  {
    code: "GAS_TRATAMIENTO",
    label: "Tratamiento de gas (MRU/NGL/Quincy)",
    shortLabel: "MRU/NGL",
    description: "Eventos originados en MRU, NGL, Quincy, chiller o secuestrante.",
    keywords: [/mru/i, /ngl/i, /quincy/i, /chiller/i, /secuestrante/i],
  },
  {
    code: "MEC_COMBUSTION",
    label: "Combustión y detonación",
    shortLabel: "Combustión",
    description: "Detonación y fenómenos de combustión fuera de condición normal.",
    keywords: [/deton/i, /combusti[oó]n/i],
  },
  {
    code: "MEC_ADMISION_ESCAPE",
    label: "Sistema de admisión y escape",
    shortLabel: "Admisión/Escape",
    description: "Fallas en tren de admisión, múltiple o flexible de escape.",
    keywords: [/admisi[oó]n/i, /m[uú]ltiple/i, /escape/i, /flexible/i],
  },
  {
    code: "MEC_ENFRIAMIENTO_LUBRICACION",
    label: "Enfriamiento y lubricación",
    shortLabel: "Enfriamiento/Lub",
    description: "Intercooler, fugas de aceite y sistemas asociados de enfriamiento/lubricación.",
    keywords: [/intercooler/i, /fuga de aceite/i, /aceite/i, /enfriamiento/i],
  },
  {
    code: "CTRL_GOBERNACION",
    label: "Control de carga y gobernación",
    shortLabel: "Gobernación",
    description: "Potencia inversa, sobrecarga o fallas de gobernación y reparto de carga.",
    keywords: [/gobernaci[oó]n/i, /potencia inversa/i, /sobrecarga/i, /reparto de carga/i],
  },
  {
    code: "CTRL_SENSORES_ACTUADORES",
    label: "Sensores, relés y actuadores",
    shortLabel: "Sensores/Relés",
    description: "Actuadores, relés, válvulas shutoff y elementos de instrumentación/control.",
    keywords: [/rel[eé]/i, /v[aá]lvula/i, /shutoff/i, /actuador/i, /sensor/i],
  },
  {
    code: "MTO_PROGRAMADO",
    label: "Mantenimiento programado",
    shortLabel: "Mto programado",
    description: "Paradas planificadas para mantenimiento preventivo o actividades programadas.",
    keywords: [/mantenimiento programado/i, /planificado/i, /cambio de v[áa]lvula/i],
  },
  {
    code: "MTO_CORRECTIVO",
    label: "Mantenimiento correctivo",
    shortLabel: "Mto correctivo",
    description: "Intervenciones correctivas por falla identificada en el equipo.",
    keywords: [/mantenimiento correctivo/i, /correctivo/i, /daño/i],
  },
  {
    code: "OPER_MANIOBRA",
    label: "Operación y maniobra de campo",
    shortLabel: "Operación campo",
    description: "Paradas manuales, coordinación con CCM y maniobras operativas locales.",
    keywords: [/parada manual/i, /coordinaci[oó]n/i, /ccm/i, /maniobra/i],
  },
  {
    code: "OPER_TRANSVERSAL_PARQUE",
    label: "Evento sistémico de parque",
    shortLabel: "Evento parque",
    description: "Afectación simultánea de múltiples unidades o salida general del parque.",
    keywords: [/parque/i, /m[uú]ltiples/i, /varias unidades/i, /fdl generaci[oó]n/i, /salen de linea equipos/i],
  },
  {
    code: "INFRA_AUXILIARES",
    label: "Infraestructura auxiliar del campo",
    shortLabel: "Infra auxiliar",
    description: "Equipos auxiliares no generadores (CYC, transformadores, piping auxiliar, etc.).",
    keywords: [/cyc/i, /transformador/i, /tuber[ií]a/i, /auxiliar/i],
  },
  {
    code: "EXTERNO_TERCEROS",
    label: "Causa externa / terceros",
    shortLabel: "Externo",
    description: "Eventos originados por terceros o fuera del control operativo directo de planta.",
    keywords: [/tercer/i, /extern/i, /eep/i],
  },
  {
    code: "DATOS_INSUFICIENTES",
    label: "Validación técnica requerida",
    shortLabel: "Validación técnica",
    description: "Registro sin suficiente detalle para concluir una categoría técnica.",
    keywords: [],
  },
];

export function classifyEventCategory(text: string): EventCategory {
  const normalized = (text || "").trim();
  if (!normalized) {
    return EVENT_CATEGORIES.find((c) => c.code === "OPER_MANIOBRA")!;
  }

  for (const category of EVENT_CATEGORIES) {
    if (category.code === "DATOS_INSUFICIENTES") continue;
    if (category.keywords.some((pattern) => pattern.test(normalized))) {
      return category;
    }
  }

  return EVENT_CATEGORIES.find((c) => c.code === "OPER_MANIOBRA")!;
}

export type EventCategoryOrigin = {
  primary: EventCategoryCode;
  root?: EventCategoryCode;
};

/**
 * Clasificación de origen para bitácora GTE junio (orden: red → control → protecciones → resto).
 */
export function classifyGranTierraJuneByOrigin(input: {
  cause: string;
  notes: string;
  date: string;
  equipment: string;
}): EventCategoryOrigin {
  const text = `${input.cause || ""} ${input.notes || ""}`.toLowerCase();

  if (
    /reconectador|34\.?5\s*kv|disparo de c9|perturbaci[oó]n en la red|elevaci[oó]n del voltaje|vector\s*shift|gallinazo|perturbaci[oó]n transitoria|sobrecorriente/.test(
      text,
    )
  ) {
    return { primary: "ELEC_RED" };
  }
  if (/\bq\s*>|potencia inversa|sobrecarga|gobernaci[oó]n|reparto de carga/.test(text)) {
    const isJune28Control = input.date === "2026-06-28" && /cpw0[56]/i.test(input.equipment);
    return isJune28Control
      ? { primary: "CTRL_GOBERNACION", root: "GAS_TRATAMIENTO" }
      : { primary: "CTRL_GOBERNACION" };
  }
  if (/tablero de auxiliares|totalizador principal|protecci/.test(text)) {
    return { primary: "ELEC_PROTECCIONES" };
  }
  if (/tuber[ií]a de cyc|cyc[- ]?19/.test(text)) {
    return { primary: "INFRA_AUXILIARES" };
  }
  if (/magnetiz|pruebas de magnetiz/.test(text)) {
    return { primary: "OPER_MANIOBRA" };
  }
  if (/mantenimiento semanal de mru|mantenimiento cyc|cambio de v[áa]lvula/.test(text)) {
    return { primary: "MTO_PROGRAMADO" };
  }
  if (/mru|ngl|quincy|chiller|secuestrante/.test(text)) {
    return { primary: "GAS_TRATAMIENTO" };
  }
  if (/deton/.test(text)) {
    if (/presi[oó]n de gas|baja presi[oó]n/.test(text)) {
      return { primary: "MEC_COMBUSTION", root: "GAS_SUMINISTRO" };
    }
    return { primary: "MEC_COMBUSTION" };
  }
  if (/intercooler|fuga de aceite|enfriamiento/.test(text)) {
    return { primary: "MEC_ENFRIAMIENTO_LUBRICACION" };
  }
  if (/admisi[oó]n|escape|flexible|tren de admision/.test(text)) {
    return { primary: "MEC_ADMISION_ESCAPE" };
  }
  if (/altas vivraciones|altas vibraciones/.test(text)) {
    return { primary: "DATOS_INSUFICIENTES" };
  }
  if (/parada manual/.test(text)) {
    return { primary: "OPER_MANIOBRA" };
  }

  return { primary: classifyEventCategory(text).code };
}

export function classifyReportEventCategory(input: {
  report: "copower" | "gran_tierra";
  month: string;
  cause: string;
  notes: string;
  date: string;
  equipment: string;
}): EventCategoryOrigin {
  if (input.report === "gran_tierra" && input.month === "Jun") {
    return classifyGranTierraJuneByOrigin(input);
  }
  return { primary: classifyEventCategory(input.notes || input.cause || "").code };
}

export type EventCategoryCatalogRow = {
  code: EventCategoryCode;
  label: string;
  shortLabel: string;
  count: number;
  share: number;
};

/** Catálogo completo (incluye categorías en 0) a partir de códigos ya clasificados. */
export function buildEventCategoryCatalog(codes: EventCategoryCode[]): EventCategoryCatalogRow[] {
  const counts = new Map<EventCategoryCode, number>();
  for (const cat of EVENT_CATEGORIES) counts.set(cat.code, 0);
  for (const code of codes) counts.set(code, (counts.get(code) ?? 0) + 1);
  const total = Math.max(codes.length, 1);
  return EVENT_CATEGORIES.map((cat) => {
    const count = counts.get(cat.code) ?? 0;
    return {
      code: cat.code,
      label: cat.label,
      shortLabel: cat.shortLabel,
      count,
      share: (count / total) * 100,
    };
  });
}
