/** Tipos derivados de meta.esquema_evento en eventos_falla_costayaco_junio_2026.json */

export type RcaCalidadDato = "completo" | "parcial" | "inferido" | "vacio";

export type RcaEstadoEvento = "abierto" | "en_seguimiento" | "cerrado" | "sin_marcar";

export type RcaCriticidad =
  | "baja"
  | "media"
  | "media-alta"
  | "alta"
  | "critica"
  | "PENDIENTE";

export type RcaCronologiaItem = {
  hora: string | null;
  evento: string;
  origen?: string | null;
};

export type RcaClasificacion = {
  tipo: string | null;
  modo_falla: string | null;
  componente_afectado: string | null;
  criticidad: string | null;
  falla_repetitiva: boolean | null;
};

export type RcaCausa = {
  inmediata: string | null;
  basica: string | null;
  raiz: string | null;
};

export type RcaCincoPorquesItem = {
  n: number;
  pregunta: string;
  respuesta: string;
};

export type RcaImpacto = {
  disponibilidad_horas: number | null;
  energia_no_generada_kwh: number | null;
  riesgo_operacion: string | null;
};

export type RcaIndicadores = {
  horas_indisponibles: number | string | null;
  energia_no_generada: number | string | null;
  falla_repetitiva: boolean | null;
};

export type RcaEventoFalla = {
  id: string;
  titulo: string;
  fecha: string | null;
  hora: string | null;
  equipo: string | string[];
  sistema: string | null;
  duracion_horas: number | null;
  responsable: string | null;
  estado: RcaEstadoEvento;
  criticidad: RcaCriticidad;
  calidad_dato: RcaCalidadDato;
  es_supuesto: boolean;
  resumen_ejecutivo: string;
  cronologia: RcaCronologiaItem[];
  descripcion_tecnica: string;
  clasificacion: RcaClasificacion;
  causa: RcaCausa;
  cinco_porques: RcaCincoPorquesItem[];
  factores_contribuyentes: string[];
  acciones_correctivas: string[];
  acciones_preventivas: string[];
  impacto: RcaImpacto;
  validacion: string | null;
  lecciones_aprendidas: string[];
  indicadores: RcaIndicadores;
  notas_pendientes: string[];
  relacionados: string[];
  fuente: string;
};

export type RcaPatronRecurrente = {
  patron: string;
  eventos: string[];
  unidades_afectadas?: string[];
  nota?: string;
};

export type RcaAnalisisTransversal = {
  patrones_recurrentes: RcaPatronRecurrente[];
  problemas_calidad_registro: string[];
};

export type RcaEventosPack = {
  meta: {
    proyecto: string;
    cliente: string;
    operador: string;
    periodo: string;
    fuente: string;
    generado: string;
    flota: {
      unidades: string[];
      marca_modelo: string;
      ubicacion: string;
      tipos_gas: string[];
    };
    leyenda_calidad_dato: Record<RcaCalidadDato, string>;
    leyenda_estado: RcaEstadoEvento[];
    esquema_evento: Record<string, string>;
  };
  eventos: RcaEventoFalla[];
  analisis_transversal: RcaAnalisisTransversal;
};

export type RcaAppView = "lista" | "detalle" | "transversal";
