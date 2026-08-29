/** Generado por scripts/etl-facturacion-ecuador.mjs — no editar a mano. */
export const FACTURACION_SOURCE = "data/Agosto/ejemplo formato/Copia de Ejemplo formato de facturacion.xlsx";

export type HourState = "OP" | "SB" | "PE" | "M" | "FS" | "TR";
export type OwnerKind = "GTE" | "CPW";

export type DayHours = Record<HourState, number>;

export type FacturacionUnit = {
  tag: string;
  campo: string;
  owner: OwnerKind;
  days: DayHours[];
  totals: DayHours;
};

export type FacturacionKpi = {
  tag: string;
  campo: string;
  sb: number;
  disp: number | null;
  conf: number | null;
  fallas: number;
  mtbf: number | null;
  mttr: number | null;
  riesgo: string;
  cumplimiento: string;
};

export type FacturacionSistema = {
  sistema: string;
  campo: string;
  sb: number;
  disp: number | null;
  conf: number | null;
  fallas: number | null;
  mtbf: number | null;
  mttr: number | null;
  riesgo: string;
  cumplimiento: string;
};

export type FacturacionOps = {
  tag: string;
  campo: string;
  op: number;
  sb: number;
  pe: number;
  mtto: number;
  fs: number;
  tr: number;
  kwh: number;
  ft3: number | null;
  gal: number | null;
  kwProm: number;
  confH: number;
};

export type FacturacionEvento = {
  item: number;
  fecha: string;
  campo: string;
  unidad: string;
  tipo: string;
  descripcion: string;
  penalidad: string;
  soporte: string;
};

export const FACTURACION_JULIO_2026 = {
  "sourceFile": "data/Agosto/ejemplo formato/Copia de Ejemplo formato de facturacion.xlsx",
  "document": {
    "nombre": "Facturación Copower Ecuador – GTE",
    "tipo": "Soporte de facturación",
    "origen": "Interno",
    "periodo": "1 al 31 de julio 2026",
    "secuencial": "Jul-26",
    "contrato": "CW7581",
    "empresa": "COPOWER LTDA",
    "pais": "Ecuador",
    "cliente": "Gran Tierra Energy",
    "area": "Operaciones",
    "region": "Lago Agrio",
    "iva": 0.15,
    "horasMes": 744,
    "enviado": "2026-08-25"
  },
  "states": [
    "OP",
    "SB",
    "PE",
    "M",
    "FS",
    "TR"
  ],
  "units": [
    {
      "tag": "KB-600-02",
      "campo": "Chanangue J",
      "owner": "GTE",
      "days": [
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 14,
          "SB": 0,
          "PE": 0,
          "M": 10,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 21,
          "SB": 0,
          "PE": 3,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 23,
          "SB": 0,
          "PE": 1,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 13,
          "SB": 0,
          "PE": 0,
          "M": 11,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 719,
        "SB": 0,
        "PE": 4,
        "M": 21,
        "FS": 0,
        "TR": 0
      }
    },
    {
      "tag": "G301-B",
      "campo": "Chanangue J",
      "owner": "GTE",
      "days": [
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 10,
          "SB": 14,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 4,
          "SB": 20,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 2,
          "SB": 22,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 11,
          "SB": 13,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 27,
        "SB": 717,
        "PE": 0,
        "M": 0,
        "FS": 0,
        "TR": 0
      }
    },
    {
      "tag": "KTA19-01",
      "campo": "Chanangue K",
      "owner": "GTE",
      "days": [
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 22,
          "SB": 0,
          "PE": 0,
          "M": 2,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 22,
          "SB": 0,
          "PE": 0,
          "M": 2,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 740,
        "SB": 0,
        "PE": 0,
        "M": 4,
        "FS": 0,
        "TR": 0
      }
    },
    {
      "tag": "G102-C",
      "campo": "Chanangue K",
      "owner": "CPW",
      "days": [
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 3,
          "SB": 21,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 3,
          "SB": 21,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 6,
        "SB": 738,
        "PE": 0,
        "M": 0,
        "FS": 0,
        "TR": 0
      }
    },
    {
      "tag": "KB-600-03",
      "campo": "Charapa B",
      "owner": "GTE",
      "days": [
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 14,
          "SB": 0,
          "PE": 0,
          "M": 10,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 16,
          "SB": 0,
          "PE": 2,
          "M": 6,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 21,
          "SB": 0,
          "PE": 3,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 723,
        "SB": 0,
        "PE": 5,
        "M": 16,
        "FS": 0,
        "TR": 0
      }
    },
    {
      "tag": "KB-600-04",
      "campo": "Charapa B",
      "owner": "GTE",
      "days": [
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 14,
          "SB": 0,
          "PE": 0,
          "M": 10,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 17,
          "SB": 0,
          "PE": 0,
          "M": 7,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 14,
          "SB": 0,
          "PE": 10,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 21,
          "SB": 0,
          "PE": 3,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 714,
        "SB": 0,
        "PE": 13,
        "M": 17,
        "FS": 0,
        "TR": 0
      }
    },
    {
      "tag": "KTA19-03",
      "campo": "Charapa B",
      "owner": "CPW",
      "days": [
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 10,
          "SB": 14,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 10,
          "SB": 14,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 7,
          "SB": 17,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 10,
          "SB": 14,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 3,
          "SB": 21,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 40,
        "SB": 704,
        "PE": 0,
        "M": 0,
        "FS": 0,
        "TR": 0
      }
    },
    {
      "tag": "KB-600-01",
      "campo": "Iguana",
      "owner": "GTE",
      "days": [
        {
          "OP": 20,
          "SB": 0,
          "PE": 4,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 20,
          "SB": 0,
          "PE": 4,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 15,
          "SB": 0,
          "PE": 0,
          "M": 9,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 5,
          "SB": 0,
          "PE": 17,
          "M": 2,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 19,
          "SB": 0,
          "PE": 5,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 23,
          "SB": 0,
          "PE": 1,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 17,
          "SB": 0,
          "PE": 0,
          "M": 7,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 17,
          "SB": 0,
          "PE": 7,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 15,
          "SB": 0,
          "PE": 9,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 18,
          "SB": 0,
          "PE": 6,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 17,
          "SB": 0,
          "PE": 7,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 23,
          "SB": 0,
          "PE": 1,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 665,
        "SB": 0,
        "PE": 61,
        "M": 18,
        "FS": 0,
        "TR": 0
      }
    },
    {
      "tag": "KTA19-02",
      "campo": "Iguana",
      "owner": "GTE",
      "days": [
        {
          "OP": 5,
          "SB": 19,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 4,
          "SB": 20,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 9,
          "SB": 15,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 20,
          "SB": 4,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 5,
          "SB": 19,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 2,
          "SB": 22,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 8,
          "SB": 16,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 7,
          "SB": 17,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 10,
          "SB": 14,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 6,
          "SB": 18,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 7,
          "SB": 17,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 1,
          "SB": 23,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 84,
        "SB": 660,
        "PE": 0,
        "M": 0,
        "FS": 0,
        "TR": 0
      }
    },
    {
      "tag": "KB-600-05",
      "campo": "Conejo 1",
      "owner": "CPW",
      "days": [
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 15,
          "SB": 0,
          "PE": 0,
          "M": 9,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 23,
          "SB": 0,
          "PE": 1,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 17,
          "SB": 0,
          "PE": 0,
          "M": 7,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 727,
        "SB": 0,
        "PE": 1,
        "M": 16,
        "FS": 0,
        "TR": 0
      }
    },
    {
      "tag": "KB-600-06",
      "campo": "Conejo 1",
      "owner": "CPW",
      "days": [
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 14,
          "SB": 0,
          "PE": 0,
          "M": 10,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 2,
          "SB": 0,
          "PE": 13,
          "M": 1,
          "FS": 8,
          "TR": 8
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 23,
          "SB": 0,
          "PE": 1,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 20,
          "SB": 0,
          "PE": 4,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 19,
          "SB": 0,
          "PE": 0,
          "M": 5,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 24,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 702,
        "SB": 0,
        "PE": 18,
        "M": 16,
        "FS": 8,
        "TR": 8
      }
    },
    {
      "tag": "KTA19-04",
      "campo": "Conejo 1",
      "owner": "CPW",
      "days": [
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 9,
          "SB": 15,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 10,
          "SB": 14,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 22,
          "SB": 2,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 1,
          "SB": 23,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 8,
          "SB": 16,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 6,
          "SB": 18,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 24,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 56,
        "SB": 688,
        "PE": 0,
        "M": 0,
        "FS": 0,
        "TR": 0
      }
    }
  ],
  "placeholders": [
    {
      "tag": "KB-600-16",
      "campo": "Perico A",
      "owner": "GTE",
      "days": [
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 0,
        "SB": 0,
        "PE": 0,
        "M": 0,
        "FS": 0,
        "TR": 0
      }
    },
    {
      "tag": "KTA19-05",
      "campo": "Perico A",
      "owner": "CPW",
      "days": [
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 0,
        "SB": 0,
        "PE": 0,
        "M": 0,
        "FS": 0,
        "TR": 0
      }
    },
    {
      "tag": "KB-600-17",
      "campo": "Perico C",
      "owner": "GTE",
      "days": [
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 0,
        "SB": 0,
        "PE": 0,
        "M": 0,
        "FS": 0,
        "TR": 0
      }
    },
    {
      "tag": "KTA19-06",
      "campo": "Perico C",
      "owner": "CPW",
      "days": [
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        },
        {
          "OP": 0,
          "SB": 0,
          "PE": 0,
          "M": 0,
          "FS": 0,
          "TR": 0
        }
      ],
      "totals": {
        "OP": 0,
        "SB": 0,
        "PE": 0,
        "M": 0,
        "FS": 0,
        "TR": 0
      }
    }
  ],
  "kpiByTag": {
    "KB-600-02": {
      "tag": "KB-600-02",
      "campo": "Chanangue J",
      "sb": 4,
      "disp": 0.9717741935483871,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    "G301-B": {
      "tag": "G301-B",
      "campo": "Chanangue J",
      "sb": 717,
      "disp": 1,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    "KTA19-01": {
      "tag": "KTA19-01",
      "campo": "Chanangue K",
      "sb": 0,
      "disp": 0.9946236559139785,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    "G102-C": {
      "tag": "G102-C",
      "campo": "Chanangue K",
      "sb": 738,
      "disp": 1,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    "KB-600-03": {
      "tag": "KB-600-03",
      "campo": "Charapa B",
      "sb": 5,
      "disp": 0.978494623655914,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    "KB-600-04": {
      "tag": "KB-600-04",
      "campo": "Charapa B",
      "sb": 13,
      "disp": 0.9771505376344086,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    "KTA19-03": {
      "tag": "KTA19-03",
      "campo": "Charapa B",
      "sb": 704,
      "disp": 1,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    "KB-600-01": {
      "tag": "KB-600-01",
      "campo": "Iguana",
      "sb": 61,
      "disp": 0.9758064516129032,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    "KTA19-02": {
      "tag": "KTA19-02",
      "campo": "Iguana",
      "sb": 660,
      "disp": 1,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    "KB-600-05": {
      "tag": "KB-600-05",
      "campo": "Conejo 1",
      "sb": 1,
      "disp": 0.978494623655914,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    "KB-600-06": {
      "tag": "KB-600-06",
      "campo": "Conejo 1",
      "sb": 18,
      "disp": 0.967741935483871,
      "conf": 0.989247311827957,
      "fallas": 1,
      "mtbf": 720,
      "mttr": 8,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    "KTA19-04": {
      "tag": "KTA19-04",
      "campo": "Conejo 1",
      "sb": 688,
      "disp": 1,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    }
  },
  "systems": [
    {
      "sistema": "N+1 Op.",
      "campo": "Chanangue J",
      "sb": 721,
      "disp": 1,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    {
      "sistema": "N+1 Prob.",
      "campo": "Chanangue J",
      "sb": 721,
      "disp": 1,
      "conf": 1,
      "fallas": null,
      "mtbf": null,
      "mttr": null,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    {
      "sistema": "N+1 Op.",
      "campo": "Chanangue K",
      "sb": 738,
      "disp": 1,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    {
      "sistema": "N+1 Prob.",
      "campo": "Chanangue K",
      "sb": 738,
      "disp": 1,
      "conf": 1,
      "fallas": null,
      "mtbf": null,
      "mttr": null,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    {
      "sistema": "N+1 Op.",
      "campo": "Charapa B",
      "sb": 722,
      "disp": 1,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    {
      "sistema": "N+1 Prob.",
      "campo": "Charapa B",
      "sb": 722,
      "disp": 1,
      "conf": 1,
      "fallas": null,
      "mtbf": null,
      "mttr": null,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    {
      "sistema": "N+1 Op.",
      "campo": "Iguana",
      "sb": 721,
      "disp": 1,
      "conf": 1,
      "fallas": 0,
      "mtbf": 0,
      "mttr": 0,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    {
      "sistema": "N+1 Prob.",
      "campo": "Iguana",
      "sb": 721,
      "disp": 1,
      "conf": 1,
      "fallas": null,
      "mtbf": null,
      "mttr": null,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    {
      "sistema": "N+1 Op.",
      "campo": "Conejo 1",
      "sb": 707,
      "disp": 1,
      "conf": 1,
      "fallas": 1,
      "mtbf": 2192,
      "mttr": 2.6666666666666665,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    },
    {
      "sistema": "N+1 Prob.",
      "campo": "Conejo 1",
      "sb": 707,
      "disp": 1,
      "conf": 1,
      "fallas": null,
      "mtbf": null,
      "mttr": null,
      "riesgo": "RIESGO BAJO",
      "cumplimiento": "CUMPLE"
    }
  ],
  "ops": [
    {
      "tag": "KB-600-02",
      "campo": "Chanangue J",
      "op": 719,
      "sb": 0,
      "pe": 4,
      "mtto": 21,
      "fs": 0,
      "tr": 0,
      "kwh": 111395,
      "ft3": 980276,
      "gal": null,
      "kwProm": 154.93045897079276,
      "confH": 744
    },
    {
      "tag": "G301-B",
      "campo": "Chanangue J",
      "op": 27,
      "sb": 717,
      "pe": 0,
      "mtto": 0,
      "fs": 0,
      "tr": 0,
      "kwh": 3583,
      "ft3": null,
      "gal": 197.1,
      "kwProm": 132.7037037037037,
      "confH": 744
    },
    {
      "tag": "KTA19-01",
      "campo": "Chanangue K",
      "op": 740,
      "sb": 0,
      "pe": 0,
      "mtto": 4,
      "fs": 0,
      "tr": 0,
      "kwh": 136704,
      "ft3": null,
      "gal": 7518.7,
      "kwProm": 184.73513513513512,
      "confH": 744
    },
    {
      "tag": "G102-C",
      "campo": "Chanangue K",
      "op": 6,
      "sb": 738,
      "pe": 0,
      "mtto": 0,
      "fs": 0,
      "tr": 0,
      "kwh": 759,
      "ft3": null,
      "gal": 41.7,
      "kwProm": 126.5,
      "confH": 744
    },
    {
      "tag": "KB-600-03",
      "campo": "Charapa B",
      "op": 723,
      "sb": 0,
      "pe": 5,
      "mtto": 16,
      "fs": 0,
      "tr": 0,
      "kwh": 146413,
      "ft3": 1288434.4,
      "gal": null,
      "kwProm": 202.50760719225448,
      "confH": 744
    },
    {
      "tag": "KB-600-04",
      "campo": "Charapa B",
      "op": 714,
      "sb": 0,
      "pe": 13,
      "mtto": 17,
      "fs": 0,
      "tr": 0,
      "kwh": 143308,
      "ft3": 1261110.4,
      "gal": null,
      "kwProm": 200.71148459383753,
      "confH": 744
    },
    {
      "tag": "KTA19-03",
      "campo": "Charapa B",
      "op": 40,
      "sb": 704,
      "pe": 0,
      "mtto": 0,
      "fs": 0,
      "tr": 0,
      "kwh": 7933,
      "ft3": null,
      "gal": 436.3,
      "kwProm": 198.325,
      "confH": 744
    },
    {
      "tag": "KB-600-01",
      "campo": "Iguana",
      "op": 665,
      "sb": 0,
      "pe": 61,
      "mtto": 18,
      "fs": 0,
      "tr": 0,
      "kwh": 157642,
      "ft3": 1387249.6,
      "gal": null,
      "kwProm": 237.05563909774435,
      "confH": 744
    },
    {
      "tag": "KTA19-02",
      "campo": "Iguana",
      "op": 84,
      "sb": 660,
      "pe": 0,
      "mtto": 0,
      "fs": 0,
      "tr": 0,
      "kwh": 16546,
      "ft3": null,
      "gal": 910,
      "kwProm": 196.97619047619048,
      "confH": 744
    },
    {
      "tag": "KB-600-05",
      "campo": "Conejo 1",
      "op": 727,
      "sb": 0,
      "pe": 1,
      "mtto": 16,
      "fs": 0,
      "tr": 0,
      "kwh": 177150,
      "ft3": 1558920,
      "gal": null,
      "kwProm": 243.6726272352132,
      "confH": 744
    },
    {
      "tag": "KB-600-06",
      "campo": "Conejo 1",
      "op": 702,
      "sb": 0,
      "pe": 18,
      "mtto": 16,
      "fs": 8,
      "tr": 8,
      "kwh": 171819,
      "ft3": 1512007.2,
      "gal": null,
      "kwProm": 244.75641025641025,
      "confH": 744
    },
    {
      "tag": "KTA19-04",
      "campo": "Conejo 1",
      "op": 56,
      "sb": 688,
      "pe": 0,
      "mtto": 0,
      "fs": 0,
      "tr": 0,
      "kwh": 12808,
      "ft3": null,
      "gal": 704.4,
      "kwProm": 228.71428571428572,
      "confH": 744
    }
  ],
  "events": [
    {
      "item": 1,
      "fecha": "2026-07-01",
      "campo": "Iguana",
      "unidad": "No aplica",
      "tipo": "Tarifa de operación por llamado",
      "descripcion": "Se brindó apoyo operativo en la plataforma Iguana, por requerimiento del área de Operaciones GTE, en el horario comprendido entre las 18:00 y las 20:30. Para efectos de facturación, se contabilizan tres (3) horas de servicio.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE y con la aprobación de Power Utility."
    },
    {
      "item": 2,
      "fecha": "2026-07-23",
      "campo": "Iguana",
      "unidad": "No aplica",
      "tipo": "Tarifa de operación por llamado",
      "descripcion": "Se brindó apoyo operativo en la plataforma Iguana durante el turno nocturno, por requerimiento del área de Operaciones GTE. En consecuencia, corresponde el cobro de la tarifa por operación de llamado, conforme a las condiciones del servicio.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE y con la aprobación de Power Utility."
    },
    {
      "item": 3,
      "fecha": "2026-06-22",
      "campo": "Iguana",
      "unidad": "No aplica",
      "tipo": "Tarifa de operación por llamado",
      "descripcion": "Se brindó apoyo en la operación de la plataforma Iguana, por requerimiento del área de Operaciones GTE, en el horario comprendido entre las 18:00 y las 20:00. Para efectos de facturación, se contabilizan tres (3) horas de servicio.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE y con la aprobación de Power Utility."
    },
    {
      "item": 4,
      "fecha": "2026-06-27",
      "campo": "Iguana",
      "unidad": "No aplica",
      "tipo": "Tarifa de operación por llamado",
      "descripcion": "Del 25 al 27 de junio, por solicitud de GTE Power Utility, se brindó apoyo operativo en la plataforma Iguana durante el turno nocturno. En consecuencia, corresponde el cobro de la tarifa por operación de llamado, conforme a las condiciones del servicio.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE y con la aprobación de Power Utility."
    },
    {
      "item": 5,
      "fecha": "2026-07-01",
      "campo": "Iguana",
      "unidad": "KB-600-01",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By por trabajos de limpieza en las líneas de alimentación de gas. Las actividades se desarrollan entre las 13:00 y las 16:00.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 6,
      "fecha": "2026-07-02",
      "campo": "Iguana",
      "unidad": "KB-600-01",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By por trabajos de limpieza en las líneas de alimentación de gas. Las actividades se desarrollan entre las 17:00 y las 20:00 del 01/07/2026.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 7,
      "fecha": "2026-07-06",
      "campo": "Iguana",
      "unidad": "KB-600-01",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By debido a un inconveniente presentado en el tablero de control del separador, con el fin de prevenir afectaciones en el suministro de gas hacia la unidad. La condición se presenta desde las 19:00 del 05/07/2026 hasta las 11:00 del 06/07/2026.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 8,
      "fecha": "2026-07-09",
      "campo": "Conejo 1",
      "unidad": "KB-600-06",
      "tipo": "Parada Externa",
      "descripcion": "Finalizadas las actividades de mantenimiento, el equipo permanece en condición Stand By para continuar con los trabajos en el sistema de enfriamiento. La condición se mantiene desde las 18:00 del 08/07/2026 hasta las 06:00 del 09/07/2026.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 9,
      "fecha": "2026-07-09",
      "campo": "Conejo 1",
      "unidad": "KB-600-06",
      "tipo": "Falla #1",
      "descripcion": "Se detecta una fuga en el sistema de lubricación, condición que afecta el funcionamiento normal del equipo. Se ejecuta la corrección de la fuga entre las 06:00 y las 14:00, restableciendo las condiciones normales de operación.",
      "penalidad": "No Aplica",
      "soporte": "Reporte de falla # 009"
    },
    {
      "item": 10,
      "fecha": "2026-07-12",
      "campo": "Conejo 1",
      "unidad": "KB-600-05",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By debido al cambio del filtro coalescente. Las actividades se desarrollan entre las 10:00 y las 11:00.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 11,
      "fecha": "2026-07-12",
      "campo": "Conejo 1",
      "unidad": "KB-600-06",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By debido al cambio del filtro coalescente. Las actividades se desarrollan entre las 10:00 y las 11:00.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 12,
      "fecha": "2026-07-13",
      "campo": "Iguana",
      "unidad": "KB-600-01",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By por trabajos de flushing en la línea de suministro de gas. Las actividades se desarrollan entre las 12:00 y las 16:00.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 13,
      "fecha": "2026-07-13",
      "campo": "Conejo 1",
      "unidad": "KB-600-06",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condicion de Stand By debido a la disminución de carga por el apagado manual de la MTU #01 perteneciente a la SURRI desde las 02:00 h hasta las 05:00 h",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 14,
      "fecha": "2026-07-14",
      "campo": "Iguana",
      "unidad": "KB-600-01",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By por trabajos de flushing en la línea de suministro de gas. Las actividades se desarrollan entre las 16:00 y las 17:00 del 13/07/2026.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 15,
      "fecha": "2026-07-17",
      "campo": "Chanangue J",
      "unidad": "KB-600-02",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By debido al apagado del pozo productor. Se apaga el generador a gas y entra en servicio el generador G301B. La condición se presenta entre las 14:00 y las 16:00.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 16,
      "fecha": "2026-07-18",
      "campo": "Chanangue J",
      "unidad": "KB-600-02",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By debido al apagado del pozo productor. Se apaga el generador a gas y entra en servicio el generador G301B. La condición se presenta entre las 16:00 y las 17:00.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 17,
      "fecha": "2026-07-23",
      "campo": "Iguana",
      "unidad": "KB-600-01",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By debido a trabajos de intervención en el pozo Iguana B1. Las actividades se desarrollan entre las 10:00 y las 16:00.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 18,
      "fecha": "2026-07-24",
      "campo": "Iguana",
      "unidad": "KB-600-01",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By debido a trabajos de intervención en el pozo Iguana B1. Las actividades se desarrollan entre las 16:00 y las 21:00 del 23/07/2026.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 19,
      "fecha": "2026-07-26",
      "campo": "Iguana",
      "unidad": "KB-600-01",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By por trabajos de mantenimiento en el mechero. Las actividades se desarrollan entre las 10:00 y las 15:00.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 20,
      "fecha": "2026-07-26",
      "campo": "Charapa B",
      "unidad": "KB-600-03",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By debido a una falla en la UBH de GTE. Durante este período la generación opera al 100 % con combustible diésel mientras se ejecutan actividades de mantenimiento entre las 04:00 y las 06:00.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 21,
      "fecha": "2026-07-26",
      "campo": "Charapa B",
      "unidad": "KB-600-04",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By debido a una falla en la UBH de GTE. Durante este período la generación opera al 100 % con combustible diésel mientras se ejecutan actividades de mantenimiento entre las 05:00 y las 15:00.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 22,
      "fecha": "2026-07-27",
      "campo": "Charapa B",
      "unidad": "KB-600-03",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By debido a una falla en la válvula del separador de la UBH. La condición se presenta entre las 17:00 y las 19:00 del 26/07/2026.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 23,
      "fecha": "2026-07-27",
      "campo": "Charapa B",
      "unidad": "KB-600-04",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By debido a una falla en la válvula del separador de la UBH. La condición se presenta entre las 17:00 y las 19:00 del 26/07/2026.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 24,
      "fecha": "2026-07-27",
      "campo": "Iguana",
      "unidad": "KB-600-01",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By por trabajos de flushing en la línea de alimentación de gas. Las actividades se desarrollan entre las 10:00 y las 16:00.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 25,
      "fecha": "2026-07-28",
      "campo": "Iguana",
      "unidad": "KB-600-01",
      "tipo": "Parada Externa",
      "descripcion": "Se ejecuta parada controlada del equipo, quedando en condición Stand By por trabajos de flushing en la línea de alimentación de gas. Las actividades se desarrollan entre las 16:00 y las 17:00 del 27/07/2026.",
      "penalidad": "No Aplica",
      "soporte": "Por directriz de Operaciones GTE"
    },
    {
      "item": 26,
      "fecha": "2026-07-03",
      "campo": "Chanangue J",
      "unidad": "KB-600-02",
      "tipo": "M3",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 21"
    },
    {
      "item": 27,
      "fecha": "2026-07-04",
      "campo": "Iguana",
      "unidad": "KB-600-01",
      "tipo": "M4",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 31"
    },
    {
      "item": 28,
      "fecha": "2026-07-07",
      "campo": "Conejo 1",
      "unidad": "KB-600-05",
      "tipo": "M1",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 27"
    },
    {
      "item": 29,
      "fecha": "2026-07-08",
      "campo": "Conejo 1",
      "unidad": "KB-600-06",
      "tipo": "M2",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 14"
    },
    {
      "item": 30,
      "fecha": "2026-07-10",
      "campo": "Charapa B",
      "unidad": "KB-600-04",
      "tipo": "M1",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 29"
    },
    {
      "item": 31,
      "fecha": "2026-07-11",
      "campo": "Charapa B",
      "unidad": "KB600-03",
      "tipo": "M1",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 31"
    },
    {
      "item": 32,
      "fecha": "2026-07-12",
      "campo": "Chanangue K",
      "unidad": "KTA19-01",
      "tipo": "M1",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 37"
    },
    {
      "item": 33,
      "fecha": "2026-07-19",
      "campo": "Chanangue J",
      "unidad": "KB-600-02",
      "tipo": "M1",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 22"
    },
    {
      "item": 34,
      "fecha": "2026-07-21",
      "campo": "Iguana",
      "unidad": "KB-600-01",
      "tipo": "M1",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 32"
    },
    {
      "item": 35,
      "fecha": "2026-07-22",
      "campo": "Conejo 1",
      "unidad": "KB-600-05",
      "tipo": "M2",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 28"
    },
    {
      "item": 36,
      "fecha": "2026-07-23",
      "campo": "Conejo 1",
      "unidad": "KB-600-06",
      "tipo": "M1",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 15"
    },
    {
      "item": 37,
      "fecha": "2026-07-24",
      "campo": "Chanangue K",
      "unidad": "KTA19-01",
      "tipo": "M2",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 38"
    },
    {
      "item": 38,
      "fecha": "2026-07-25",
      "campo": "Charapa B",
      "unidad": "KB-600-04",
      "tipo": "M4",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 30"
    },
    {
      "item": 39,
      "fecha": "2026-07-26",
      "campo": "Charapa B",
      "unidad": "KB-600-03",
      "tipo": "M4",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 32"
    },
    {
      "item": 40,
      "fecha": "2026-07-28",
      "campo": "Charapa B",
      "unidad": "KTA19-03",
      "tipo": "M1",
      "descripcion": "Mantenimiento Preventivo",
      "penalidad": "No Aplica",
      "soporte": "Reporte MTO # 06"
    }
  ],
  "downtime": [
    {
      "fecha": "2026-07-09",
      "equipo": "KB-600-06",
      "horaApagado": "18:00 (08-07-2026)",
      "mttoCorr": 8,
      "pe": 11,
      "movil": 2,
      "totalFs": 21
    }
  ],
  "horometers": [
    {
      "tag": "KB-600-02",
      "start": 6996,
      "end": 7715,
      "delta": 719
    },
    {
      "tag": "G301-B",
      "start": 6181,
      "end": 6208,
      "delta": 27
    },
    {
      "tag": "KTA19-01",
      "start": 12146,
      "end": 12886,
      "delta": 740
    },
    {
      "tag": "G102-C",
      "start": 11131,
      "end": 11137,
      "delta": 6
    },
    {
      "tag": "KB-600-03",
      "start": 10768,
      "end": 11491,
      "delta": 723
    },
    {
      "tag": "KB-600-04",
      "start": 10973,
      "end": 11687,
      "delta": 714
    },
    {
      "tag": "KTA19-03",
      "start": 1930,
      "end": 1970,
      "delta": 40
    },
    {
      "tag": "KB-600-01",
      "start": 11211,
      "end": 11876,
      "delta": 665
    },
    {
      "tag": "KTA19-02",
      "start": 1709,
      "end": 1793,
      "delta": 84
    },
    {
      "tag": "KB-600-05",
      "start": 9288,
      "end": 10015,
      "delta": 727
    },
    {
      "tag": "KB-600-06",
      "start": 4138,
      "end": 4840,
      "delta": 702
    },
    {
      "tag": "KTA19-04",
      "start": 1479,
      "end": 1535,
      "delta": 56
    }
  ],
  "opexLines": [
    {
      "detalle": "Operación 24 horas"
    },
    {
      "detalle": "Operación 12 horas"
    },
    {
      "detalle": "Operación por llamado"
    }
  ],
  "capexLines": [
    {
      "detalle": "Tablero distribución",
      "equipo": "TD-01"
    },
    {
      "detalle": "Filtro coalescente",
      "equipo": "FC-01"
    }
  ],
  "firmas": {
    "elaborado": {
      "nombre": "Wilson Oliveros",
      "cargo": "CPW / Líder de Operaciones",
      "fecha": "2026-07-31"
    },
    "revisado": {
      "nombre": "Wilson Oliveros",
      "cargo": "CPW / Líder de Operaciones",
      "fecha": "2026-07-31"
    },
    "aprobado": {
      "nombre": "",
      "cargo": "",
      "fecha": "2026-07-31"
    }
  },
  "formulas": {
    "mtbf": "MTBF = Tiempo total de operación / Cantidad de fallas",
    "mttr": "MTTR = Tiempo total de reparación / Cantidad de fallas",
    "riesgo": "RIESGO ALTO si Disp < 90% o Conf < 90% o (fallas > 1 y MTBF < 300) o (fallas > 1 y MTTR/MTBF > 0,3). RIESGO MEDIO si fallas > 1, MTBF ≥ 300 y MTTR/MTBF ≤ 0,3, o Conf < 90%. Si no: RIESGO BAJO.",
    "cumple": "NO CUMPLE si Disp < 90%, Conf < 90%, o fallas > 1 y (MTBF < 300 o MTTR/MTBF > 0,3). Si no: CUMPLE.",
    "ariba": "Conversión de horas a días (24 h) usada como referencia para el registro de facturación en Ariba."
  }
} satisfies {
  sourceFile: string;
  document: Record<string, string | number>;
  states: string[];
  units: FacturacionUnit[];
  placeholders: FacturacionUnit[];
  kpiByTag: Record<string, FacturacionKpi>;
  systems: FacturacionSistema[];
  ops: FacturacionOps[];
  events: FacturacionEvento[];
  downtime: Array<{
    fecha: string;
    equipo: string;
    horaApagado: string;
    mttoCorr: number;
    pe: number;
    movil: number;
    totalFs: number;
  }>;
  horometers: Array<{ tag: string; start: number; end: number; delta: number }>;
  opexLines: Array<{ detalle: string }>;
  capexLines: Array<{ detalle: string; equipo: string }>;
  firmas: {
    elaborado: { nombre: string; cargo: string; fecha: string };
    revisado: { nombre: string; cargo: string; fecha: string };
    aprobado: { nombre: string; cargo: string; fecha: string };
  };
  formulas: Record<string, string>;
};

export type FacturacionPack = typeof FACTURACION_JULIO_2026;
