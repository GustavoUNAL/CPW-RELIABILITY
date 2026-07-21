import type { EventRecord, GenerationAssetRow, GenerationByEquipmentRow, KpiRow, MachineIndicatorRow, SummaryMetrics } from "../types";

export type CopowerMonthKey = "Ene" | "Feb" | "Mar" | "Abr" | "May" | "Jun" | "Jul";

export type CopowerConsumoRow = {
  unidad: string;
  campo: string;
  adicionAceite: number;
  cambioAceite: number;
  adicionCoolant: number;
};

export type CopowerMonthlySnapshot = {
  label: string;
  sourceFile: string;
  summary: SummaryMetrics;
  generationByAsset: GenerationAssetRow[];
  generationByEquipment: GenerationByEquipmentRow[];
  totalGenerationKwh: number;
  machineIndicators: MachineIndicatorRow[];
  eventLog: EventRecord[];
  consumos: CopowerConsumoRow[];
  kpi: Omit<KpiRow, "month">;
};

export const COPOWER_MONTH_ORDER: CopowerMonthKey[] = ["Ene","Feb","Mar","Abr","May","Jun","Jul"];

export const COPOWER_MONTH_LABELS: Record<CopowerMonthKey, string> = {
  Ene: "Enero",
  Feb: "Febrero",
  Mar: "Marzo",
  Abr: "Abril",
  May: "Mayo",
  Jun: "Junio",
  Jul: "Julio",
};

export function copowerMonthLabel(month: CopowerMonthKey): string {
  return COPOWER_MONTH_LABELS[month];
}

export const COPOWER_SOURCE_FILE =
  "data/Datos COPOWER/Reporte_Diario_Costayaco_Vonu 2026 actualizado 34.xlsx";

/** Datos operativos COPOWER desde Resumen OP + Eventos + Consumos del reporte diario. */
export const COPOWER_MONTHLY_DATA: Record<CopowerMonthKey, CopowerMonthlySnapshot> = {
  "Ene": {
    "label": "Enero 2026",
    "sourceFile": "data/Datos COPOWER/Reporte_Diario_Costayaco_Vonu 2026 actualizado 34.xlsx",
    "summary": {
      "copowerFailures": 0,
      "totalEvents": 0,
      "mtbfHours": null,
      "mttrHours": null,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 6651,
      "hoursStandby": 1664,
      "hoursPreventive": 60,
      "hoursCorrective": 553,
      "hoursFailureCopower": 553,
      "hoursFailureClient": 0,
      "energyGasKwh": 2244619.64,
      "energyDieselKwh": 1344783.92
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 1893546.64,
        "dieselKwh": 1344783.92
      },
      {
        "asset": "Vonu",
        "gasKwh": 351073,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 467975,
        "horasOperacion": 726,
        "horasStandBy": 14,
        "horasPP": 4,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 471844,
        "horasOperacion": 725,
        "horasStandBy": 17,
        "horasPP": 2,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 463380,
        "horasOperacion": 727,
        "horasStandBy": 12,
        "horasPP": 4,
        "horasPFContr": 1,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 146426,
        "horasOperacion": 425,
        "horasStandBy": 319,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-11",
        "campo": "COSTAYACO",
        "energiaKwh": 132267.25,
        "horasOperacion": 381,
        "horasStandBy": 144,
        "horasPP": 0,
        "horasPFContr": 219,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW07",
        "campo": "COSTAYACO",
        "energiaKwh": 40773.6,
        "horasOperacion": 119,
        "horasStandBy": 379,
        "horasPP": 0,
        "horasPFContr": 246,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-12",
        "campo": "COSTAYACO",
        "energiaKwh": 170880.79,
        "horasOperacion": 485,
        "horasStandBy": 241,
        "horasPP": 5,
        "horasPFContr": 13,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 574592.67,
        "horasOperacion": 723,
        "horasStandBy": 8,
        "horasPP": 6,
        "horasPFContr": 7,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 552370,
        "horasOperacion": 694,
        "horasStandBy": 40,
        "horasPP": 7,
        "horasPFContr": 3,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 217821.25,
        "horasOperacion": 613,
        "horasStandBy": 57,
        "horasPP": 10,
        "horasPFContr": 64,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 167452,
        "horasOperacion": 491,
        "horasStandBy": 246,
        "horasPP": 7,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 183621,
        "horasOperacion": 542,
        "horasStandBy": 187,
        "horasPP": 15,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 3589403.56,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 14,
        "disponibilidadPct": 99.46,
        "confiabilidadPct": 99.46,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 726 h · FS 0 h"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 17,
        "disponibilidadPct": 99.73,
        "confiabilidadPct": 99.73,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 725 h · FS 0 h"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 12,
        "disponibilidadPct": 99.33,
        "confiabilidadPct": 99.33,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 727 h · FS 1 h"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 319,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 425 h · FS 0 h"
      },
      {
        "unidad": "JIN-11",
        "campo": "COSTAYACO",
        "horasStandBy": 144,
        "disponibilidadPct": 70.56,
        "confiabilidadPct": 70.56,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 381 h · FS 219 h"
      },
      {
        "unidad": "CPW07",
        "campo": "COSTAYACO",
        "horasStandBy": 379,
        "disponibilidadPct": 66.94,
        "confiabilidadPct": 66.94,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 119 h · FS 246 h"
      },
      {
        "unidad": "JIN-12",
        "campo": "COSTAYACO",
        "horasStandBy": 241,
        "disponibilidadPct": 97.58,
        "confiabilidadPct": 97.58,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 485 h · FS 13 h"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 8,
        "disponibilidadPct": 98.25,
        "confiabilidadPct": 98.25,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 723 h · FS 7 h"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 40,
        "disponibilidadPct": 98.66,
        "confiabilidadPct": 98.66,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 694 h · FS 3 h"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 57,
        "disponibilidadPct": 90.05,
        "confiabilidadPct": 90.05,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 613 h · FS 64 h"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 246,
        "disponibilidadPct": 99.06,
        "confiabilidadPct": 99.06,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 491 h · FS 0 h"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 187,
        "disponibilidadPct": 97.98,
        "confiabilidadPct": 97.98,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 542 h · FS 0 h"
      }
    ],
    "eventLog": [],
    "consumos": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "adicionAceite": 24,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "adicionAceite": 35.5,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "adicionAceite": 29.5,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "adicionAceite": 3.5,
        "cambioAceite": 50,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "adicionAceite": 6.5,
        "cambioAceite": 50,
        "adicionCoolant": 0
      }
    ],
    "kpi": {
      "availability": 0.93134,
      "reliability": 0.93134,
      "maintainability": null,
      "generationMwh": 3589.4,
      "operationalLossesMwh": null,
      "contractualCompliance": null
    }
  },
  "Feb": {
    "label": "Febrero 2026",
    "sourceFile": "data/Datos COPOWER/Reporte_Diario_Costayaco_Vonu 2026 actualizado 34.xlsx",
    "summary": {
      "copowerFailures": 0,
      "totalEvents": 0,
      "mtbfHours": null,
      "mttrHours": null,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 5839,
      "hoursStandby": 1985,
      "hoursPreventive": 45,
      "hoursCorrective": 194,
      "hoursFailureCopower": 194,
      "hoursFailureClient": 0,
      "energyGasKwh": 2966187.19,
      "energyDieselKwh": 435044.57
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 2569539.19,
        "dieselKwh": 435044.57
      },
      {
        "asset": "Vonu",
        "gasKwh": 396648,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 387602,
        "horasOperacion": 624,
        "horasStandBy": 48,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 406600,
        "horasOperacion": 639,
        "horasStandBy": 33,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 393933,
        "horasOperacion": 642,
        "horasStandBy": 30,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 503923,
        "horasOperacion": 566,
        "horasStandBy": 89,
        "horasPP": 10,
        "horasPFContr": 6,
        "horasPFCli": 0,
        "horasCalDia": 671,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 610376,
        "horasOperacion": 638,
        "horasStandBy": 34,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 3395,
        "horasOperacion": 84,
        "horasStandBy": 540,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 624,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-11",
        "campo": "COSTAYACO",
        "energiaKwh": 77979.39,
        "horasOperacion": 215,
        "horasStandBy": 197,
        "horasPP": 0,
        "horasPFContr": 44,
        "horasPFCli": 0,
        "horasCalDia": 456,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW07",
        "campo": "COSTAYACO",
        "energiaKwh": 52905.83,
        "horasOperacion": 153,
        "horasStandBy": 261,
        "horasPP": 0,
        "horasPFContr": 42,
        "horasPFCli": 0,
        "horasCalDia": 456,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-12",
        "campo": "COSTAYACO",
        "energiaKwh": 132824.97,
        "horasOperacion": 371,
        "horasStandBy": 73,
        "horasPP": 0,
        "horasPFContr": 12,
        "horasPFCli": 0,
        "horasCalDia": 456,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 193673.31,
        "horasOperacion": 252,
        "horasStandBy": 169,
        "horasPP": 0,
        "horasPFContr": 35,
        "horasPFCli": 0,
        "horasCalDia": 456,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 153470.88,
        "horasOperacion": 195,
        "horasStandBy": 233,
        "horasPP": 0,
        "horasPFContr": 28,
        "horasPFCli": 0,
        "horasCalDia": 456,
        "fallaEvento": 0
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 87900.38,
        "horasOperacion": 253,
        "horasStandBy": 176,
        "horasPP": 0,
        "horasPFContr": 27,
        "horasPFCli": 0,
        "horasCalDia": 456,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 203618,
        "horasOperacion": 617,
        "horasStandBy": 46,
        "horasPP": 9,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 193030,
        "horasOperacion": 590,
        "horasStandBy": 56,
        "horasPP": 26,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 3401231.76,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 48,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 624 h · FS 0 h"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 33,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 639 h · FS 0 h"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 30,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 642 h · FS 0 h"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 89,
        "disponibilidadPct": 97.62,
        "confiabilidadPct": 97.62,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 566 h · FS 6 h"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 34,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 638 h · FS 0 h"
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 540,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 84 h · FS 0 h"
      },
      {
        "unidad": "JIN-11",
        "campo": "COSTAYACO",
        "horasStandBy": 197,
        "disponibilidadPct": 90.35,
        "confiabilidadPct": 90.35,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 215 h · FS 44 h"
      },
      {
        "unidad": "CPW07",
        "campo": "COSTAYACO",
        "horasStandBy": 261,
        "disponibilidadPct": 90.79,
        "confiabilidadPct": 90.79,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 153 h · FS 42 h"
      },
      {
        "unidad": "JIN-12",
        "campo": "COSTAYACO",
        "horasStandBy": 73,
        "disponibilidadPct": 97.37,
        "confiabilidadPct": 97.37,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 371 h · FS 12 h"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 169,
        "disponibilidadPct": 92.32,
        "confiabilidadPct": 92.32,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 252 h · FS 35 h"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 233,
        "disponibilidadPct": 93.86,
        "confiabilidadPct": 93.86,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 195 h · FS 28 h"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 176,
        "disponibilidadPct": 94.08,
        "confiabilidadPct": 94.08,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 253 h · FS 27 h"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 46,
        "disponibilidadPct": 98.66,
        "confiabilidadPct": 98.66,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 617 h · FS 0 h"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 56,
        "disponibilidadPct": 96.13,
        "confiabilidadPct": 96.13,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 590 h · FS 0 h"
      }
    ],
    "eventLog": [],
    "consumos": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "adicionAceite": 32,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "adicionAceite": 35.5,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "adicionAceite": 29.5,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "adicionAceite": 3.5,
        "cambioAceite": 50,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "adicionAceite": 6.5,
        "cambioAceite": 50,
        "adicionCoolant": 0
      }
    ],
    "kpi": {
      "availability": 0.9703579999999999,
      "reliability": 0.9703579999999999,
      "maintainability": null,
      "generationMwh": 3401.23,
      "operationalLossesMwh": null,
      "contractualCompliance": null
    }
  },
  "Mar": {
    "label": "Marzo 2026",
    "sourceFile": "data/Datos COPOWER/Reporte_Diario_Costayaco_Vonu 2026 actualizado 34.xlsx",
    "summary": {
      "copowerFailures": 0,
      "totalEvents": 0,
      "mtbfHours": null,
      "mttrHours": null,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 5892.24,
      "hoursStandby": 2738.76,
      "hoursPreventive": 58,
      "hoursCorrective": 287,
      "hoursFailureCopower": 287,
      "hoursFailureClient": 0,
      "energyGasKwh": 3184476.75,
      "energyDieselKwh": 300355.29
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 2775087.75,
        "dieselKwh": 300355.29
      },
      {
        "asset": "Vonu",
        "gasKwh": 409389,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 438677,
        "horasOperacion": 687.35,
        "horasStandBy": 47.65,
        "horasPP": 9,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 458409,
        "horasOperacion": 710.59,
        "horasStandBy": 24.41,
        "horasPP": 9,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 452934,
        "horasOperacion": 718.58,
        "horasStandBy": 18.42,
        "horasPP": 7,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 622638,
        "horasOperacion": 734.8,
        "horasStandBy": 9.2,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 623869,
        "horasOperacion": 727,
        "horasStandBy": 7,
        "horasPP": 10,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 103109,
        "horasOperacion": 269.92,
        "horasStandBy": 474.08,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-11",
        "campo": "COSTAYACO",
        "energiaKwh": 13402.75,
        "horasOperacion": 48,
        "horasStandBy": 384,
        "horasPP": 0,
        "horasPFContr": 24,
        "horasPFCli": 0,
        "horasCalDia": 456,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW07",
        "campo": "COSTAYACO",
        "energiaKwh": 22679,
        "horasOperacion": 66,
        "horasStandBy": 360,
        "horasPP": 8,
        "horasPFContr": 22,
        "horasPFCli": 0,
        "horasCalDia": 456,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-12",
        "campo": "COSTAYACO",
        "energiaKwh": 39370,
        "horasOperacion": 112,
        "horasStandBy": 321,
        "horasPP": 0,
        "horasPFContr": 23,
        "horasPFCli": 0,
        "horasCalDia": 456,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 188841,
        "horasOperacion": 244,
        "horasStandBy": 496,
        "horasPP": 4,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 71857.29,
        "horasOperacion": 109,
        "horasStandBy": 152,
        "horasPP": 0,
        "horasPFContr": 195,
        "horasPFCli": 0,
        "horasCalDia": 456,
        "fallaEvento": 0
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 39657,
        "horasOperacion": 107,
        "horasStandBy": 326,
        "horasPP": 0,
        "horasPFContr": 23,
        "horasPFCli": 0,
        "horasCalDia": 456,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 200702,
        "horasOperacion": 674,
        "horasStandBy": 59,
        "horasPP": 11,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 208687,
        "horasOperacion": 684,
        "horasStandBy": 60,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 3484832.04,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 47.65,
        "disponibilidadPct": 98.79,
        "confiabilidadPct": 98.79,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 687.35 h · FS 0 h"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 24.41,
        "disponibilidadPct": 98.79,
        "confiabilidadPct": 98.79,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 710.59 h · FS 0 h"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 18.42,
        "disponibilidadPct": 99.06,
        "confiabilidadPct": 99.06,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 718.58 h · FS 0 h"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 9.2,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 734.8 h · FS 0 h"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 7,
        "disponibilidadPct": 98.66,
        "confiabilidadPct": 98.66,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 727 h · FS 0 h"
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 474.08,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 269.92 h · FS 0 h"
      },
      {
        "unidad": "JIN-11",
        "campo": "COSTAYACO",
        "horasStandBy": 384,
        "disponibilidadPct": 94.74,
        "confiabilidadPct": 94.74,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 48 h · FS 24 h"
      },
      {
        "unidad": "CPW07",
        "campo": "COSTAYACO",
        "horasStandBy": 360,
        "disponibilidadPct": 93.42,
        "confiabilidadPct": 93.42,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 66 h · FS 22 h"
      },
      {
        "unidad": "JIN-12",
        "campo": "COSTAYACO",
        "horasStandBy": 321,
        "disponibilidadPct": 94.96,
        "confiabilidadPct": 94.96,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 112 h · FS 23 h"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 496,
        "disponibilidadPct": 99.46,
        "confiabilidadPct": 99.46,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 244 h · FS 0 h"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 152,
        "disponibilidadPct": 57.24,
        "confiabilidadPct": 57.24,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 109 h · FS 195 h"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 326,
        "disponibilidadPct": 94.96,
        "confiabilidadPct": 94.96,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 107 h · FS 23 h"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 59,
        "disponibilidadPct": 98.52,
        "confiabilidadPct": 98.52,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 674 h · FS 0 h"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 60,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 684 h · FS 0 h"
      }
    ],
    "eventLog": [],
    "consumos": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      }
    ],
    "kpi": {
      "availability": 0.961564,
      "reliability": 0.961564,
      "maintainability": null,
      "generationMwh": 3484.83,
      "operationalLossesMwh": null,
      "contractualCompliance": null
    }
  },
  "Abr": {
    "label": "Abril 2026",
    "sourceFile": "data/Datos COPOWER/Reporte_Diario_Costayaco_Vonu 2026 actualizado 34.xlsx",
    "summary": {
      "copowerFailures": 0,
      "totalEvents": 0,
      "mtbfHours": null,
      "mttrHours": null,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 5702.71,
      "hoursStandby": 661.29,
      "hoursPreventive": 109,
      "hoursCorrective": 7,
      "hoursFailureCopower": 7,
      "hoursFailureClient": 0,
      "energyGasKwh": 3364763,
      "energyDieselKwh": 27325
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 2942751,
        "dieselKwh": 27325
      },
      {
        "asset": "Vonu",
        "gasKwh": 422012,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 443422,
        "horasOperacion": 677.67,
        "horasStandBy": 27.33,
        "horasPP": 15,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 461381,
        "horasOperacion": 699.4,
        "horasStandBy": 20.6,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 451979,
        "horasOperacion": 700.3,
        "horasStandBy": 19.7,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 493687,
        "horasOperacion": 570.16,
        "horasStandBy": 140.84,
        "horasPP": 9,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 493828,
        "horasOperacion": 574,
        "horasStandBy": 139,
        "horasPP": 0,
        "horasPFContr": 7,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW06",
        "campo": "COSTAYACO",
        "energiaKwh": 347712,
        "horasOperacion": 404,
        "horasStandBy": 9,
        "horasPP": 19,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 432,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 250742,
        "horasOperacion": 655.69,
        "horasStandBy": 35.31,
        "horasPP": 29,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 27325,
        "horasOperacion": 36,
        "horasStandBy": 252,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 288,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 208756,
        "horasOperacion": 684.21,
        "horasStandBy": 8.79,
        "horasPP": 27,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 213256,
        "horasOperacion": 701.28,
        "horasStandBy": 8.72,
        "horasPP": 10,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 3392088,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 27.33,
        "disponibilidadPct": 97.92,
        "confiabilidadPct": 97.92,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 677.67 h · FS 0 h"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 20.6,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 699.4 h · FS 0 h"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 19.7,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 700.3 h · FS 0 h"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 140.84,
        "disponibilidadPct": 98.75,
        "confiabilidadPct": 98.75,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 570.16 h · FS 0 h"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 139,
        "disponibilidadPct": 99.03,
        "confiabilidadPct": 99.03,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 574 h · FS 7 h"
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 9,
        "disponibilidadPct": 95.6,
        "confiabilidadPct": 95.6,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 404 h · FS 0 h"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 35.31,
        "disponibilidadPct": 95.97,
        "confiabilidadPct": 95.97,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 655.69 h · FS 0 h"
      },
      {
        "unidad": "JIN-11",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "CPW07",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "JIN-12",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 252,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 36 h · FS 0 h"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 8.79,
        "disponibilidadPct": 96.25,
        "confiabilidadPct": 96.25,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 684.21 h · FS 0 h"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 8.72,
        "disponibilidadPct": 98.61,
        "confiabilidadPct": 98.61,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 701.28 h · FS 0 h"
      }
    ],
    "eventLog": [],
    "consumos": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      }
    ],
    "kpi": {
      "availability": 0.9820989999999999,
      "reliability": 0.9820989999999999,
      "maintainability": null,
      "generationMwh": 3392.09,
      "operationalLossesMwh": null,
      "contractualCompliance": null
    }
  },
  "May": {
    "label": "Mayo 2026",
    "sourceFile": "data/Datos COPOWER/Reporte_Diario_Costayaco_Vonu 2026 actualizado 34.xlsx",
    "summary": {
      "copowerFailures": 36,
      "totalEvents": 98,
      "mtbfHours": 93.92,
      "mttrHours": 0.06,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 5823,
      "hoursStandby": 692,
      "hoursPreventive": 87,
      "hoursCorrective": 4,
      "hoursFailureCopower": 4,
      "hoursFailureClient": 0,
      "energyGasKwh": 3781659,
      "energyDieselKwh": 0
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 3461368,
        "dieselKwh": 0
      },
      {
        "asset": "Vonu",
        "gasKwh": 320291,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 471226,
        "horasOperacion": 709,
        "horasStandBy": 21,
        "horasPP": 10,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 743,
        "fallaEvento": 8
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 477675,
        "horasOperacion": 725,
        "horasStandBy": 18,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 6
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 478517,
        "horasOperacion": 722,
        "horasStandBy": 20,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 3
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 555210,
        "horasOperacion": 651,
        "horasStandBy": 6,
        "horasPP": 25,
        "horasPFContr": 4,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 10
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 582181,
        "horasOperacion": 691,
        "horasStandBy": 3,
        "horasPP": 3,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 4
      },
      {
        "equipo": "CPW06",
        "campo": "COSTAYACO",
        "energiaKwh": 659082,
        "horasOperacion": 710,
        "horasStandBy": 18,
        "horasPP": 9,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 6
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 217367,
        "horasOperacion": 625,
        "horasStandBy": 100,
        "horasPP": 16,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 14
      },
      {
        "equipo": "CPW07",
        "campo": "COSTAYACO",
        "energiaKwh": 20110,
        "horasOperacion": 28,
        "horasStandBy": 4,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 32,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 217293,
        "horasOperacion": 643,
        "horasStandBy": 91,
        "horasPP": 10,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 3
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 102998,
        "horasOperacion": 319,
        "horasStandBy": 411,
        "horasPP": 14,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 4
      }
    ],
    "totalGenerationKwh": 3781659,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 21,
        "disponibilidadPct": 98.25,
        "confiabilidadPct": 98.25,
        "fallas": 8,
        "mtbfLabel": "88.63",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 709 h · FS 0 h"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 18,
        "disponibilidadPct": 99.87,
        "confiabilidadPct": 99.87,
        "fallas": 6,
        "mtbfLabel": "120.83",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 725 h · FS 0 h"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 20,
        "disponibilidadPct": 99.73,
        "confiabilidadPct": 99.73,
        "fallas": 3,
        "mtbfLabel": "240.67",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 722 h · FS 0 h"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 6,
        "disponibilidadPct": 88.31,
        "confiabilidadPct": 88.31,
        "fallas": 10,
        "mtbfLabel": "65.1",
        "mttrHours": 0.4,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 651 h · FS 4 h"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 3,
        "disponibilidadPct": 93.28,
        "confiabilidadPct": 93.28,
        "fallas": 4,
        "mtbfLabel": "172.75",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 691 h · FS 0 h"
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 18,
        "disponibilidadPct": 97.85,
        "confiabilidadPct": 97.85,
        "fallas": 6,
        "mtbfLabel": "118.33",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 710 h · FS 0 h"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 100,
        "disponibilidadPct": 97.45,
        "confiabilidadPct": 97.45,
        "fallas": 14,
        "mtbfLabel": "44.64",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 625 h · FS 0 h"
      },
      {
        "unidad": "JIN-11",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "CPW07",
        "campo": "COSTAYACO",
        "horasStandBy": 4,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 28 h · FS 0 h"
      },
      {
        "unidad": "JIN-12",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 0,
        "disponibilidadPct": null,
        "confiabilidadPct": null,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 0 h · FS 0 h"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 91,
        "disponibilidadPct": 98.66,
        "confiabilidadPct": 98.66,
        "fallas": 3,
        "mtbfLabel": "214.33",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 643 h · FS 0 h"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 411,
        "disponibilidadPct": 98.12,
        "confiabilidadPct": 98.12,
        "fallas": 4,
        "mtbfLabel": "79.75",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 319 h · FS 0 h"
      }
    ],
    "eventLog": [
      {
        "date": "2026-05-01",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "FDL equipo G52, por sobre carga en la salida del G55, ingresa a las 09:53 horas",
        "downtimeHours": 0.5,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:18:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-01",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "FDL equipo G52, por baja temperatura del gas, ingresa a las 11:38 horas",
        "downtimeHours": 0.33,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 11:18:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-01",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "FDL equipo G52, por sobre carga ante la oscilacion del G55, ingresa a las 17:03 horas",
        "downtimeHours": 0.17,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:56:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-01",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "07:05:00 hrs A petición de CCM, se deslastra carga equipo JINAN-10, por baja presión gas CYC, mientras se estabiliza presiones de gas CYC.Se baja nominal del equipo 450 kw a 300kw.",
        "downtimeHours": 3,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:05:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-01",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "FDL Jinan 10 a solicitud del CCM, por caida de presion de gas Costayaco, ingresa en linea a las 03:28 horas",
        "downtimeHours": 3,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 00:36:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-01",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "Equipo presenta detonacion en cilindro 12 se realiza revision de calibracion de valvulas y revision mecanica de motor",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · 7:40 a10:40"
      },
      {
        "date": "2026-05-01",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "20:53:00 hrs equipo Jinan-01, por detonación a causa caída de presión de gas. 00:10:00 hrs : equipo Jinan-01, ingresa en sincronismo se recupera presiones de gas.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 20:53:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-01",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "Equipo presenta detonacion en cilindro 12 se realiza revision de calibracion de valvulas y revision mecanica de motor",
        "downtimeHours": 4,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 04:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-01",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "18:00:00 hrs equipo jinan-01 ingresa en sinconiso con 300 kw.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 18:18:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-01",
        "equipment": "JIN-02",
        "eventType": "Falla",
        "cause": "Salida de jinan 02 en campo vonu por daño en culata 05 con contaminacion de aceite con refrigerante",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · 12:20m"
      },
      {
        "date": "2026-05-02",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "05:35:00 hrs en coordinación con CCM sale de línea equipo JINAN-10 parada manual, por caída de presión de gas CYC, equipo en stand by disponible mientras se recuperan presiones de ",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 05:35:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-04",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "Se solicita fuera de linea Cpw06 para actualizacion de datos",
        "downtimeHours": 0.33,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 10:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-03",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "05:37:00 hrs se coordina con CCM, sacar FDL equipo JINAN-10, A causa caída de presión de gas CYC, Equipo en stand by, mientras se recuperan presiones de gas.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 05:37:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-05",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "Ingresa en linea Jinan-01, operador de gas en Vonu reestablece presion de gas.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 10:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-03",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "01:30:00 hrs Se finaliza mantenimiento correctivo del equipo JINAN-02.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 01:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-05",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "FDL Jinan 10 por caida de presion de gas Costayaco, ingresa a las 13:22 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 12:28:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-04",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "19:23 equipo jinan-01 sale de linea por baja presión se asume carga con equipo jinan-02",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 19:23:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-07",
        "equipment": "JIN-02",
        "eventType": "Falla",
        "cause": "FDL Jinan 02, por caida de presion de gas en Vonu",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 17:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-04",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "21:24 equipo jinan-10 sale a petición de CCM baja presión de gas linea CYC ingresa 22:54",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 21:24:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-09",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "FDL Jinan10, por Detonacion, ingresa a las 13:32 horas.",
        "downtimeHours": 9,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 04:21:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-07",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "05:25:00 equipo equipo CPW-06 sale de linea parada manual por caída de presión gas Moqueta.",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 05:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-09",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "06:25:00 a.m A solicitud del CCM, equipo equipo CPW-06 ingresa en sincronismo 800 kw alineado con gas MRU.",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-08",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "05:25:00 hrs FDL equipo CPW-05, por solicitud del CCM, por caida de presion gas Moqueta",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 05:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-09",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "06:57:00 hrsA solicitud del CCM, ingresa en sincronismo equipo CPW-05, alineado con gas MQT, modo reparto de carga.",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:57:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-08",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "18:51:00 hrs equipo CPW-04 sale de linea por sobre carga del generador, 19:04 equipo ingresa en servicio.",
        "downtimeHours": 0.15,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 18:55:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-11",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "07:44:00 hrs CPW-06 petición de CCM se realiza maniobra cambio de gas MRU a gas MQT, se restablece condiciones presión gas MQT. 07:51:00 hrs equipo ingresa en sincronismo alineado ",
        "downtimeHours": 0.12,
        "responsible": "GTE",
        "notes": "Día · 07:44:00-\r\n07:51:00"
      },
      {
        "date": "2026-05-08",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "05:24:00 hrs se deslastra 250 kw, equipo cpw-06, a causa caída de presión de gas MQT, 105 PSI. Equipo operando con 800 kw.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 05:24:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-11",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "09:55:00 hrs A petición de CCM, se deslastra carga equipo CPW-06, 240 KW, por baja presión gas MQT, mientras se estabiliza presiones de gas MQT. Equipo queda operando con 800 kw.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:55:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-13",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Parada manual del equipo G54, para revision de perdida de presion sistemaHT, se cambia tanque de expansion, ingresa a las 22:29 horas",
        "downtimeHours": 2.19,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 20:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-11",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "11:37:00 hrs A petición de CCM se cambia de linea MQT a MRU por caída de presion en linea MQT, 11:43:00 hrs equipo ingresa en linea con gas MRU.",
        "downtimeHours": 0.1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:37:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-15",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "FDL Jinan 10 a solicitud del CCM, por caida de presion de gas Costayaco, 06:13:00 revisión y arranque manual de la unidad.",
        "downtimeHours": 5,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 01:16:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-11",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "13:41:00 hrs A petición de CCM se realiza cambio de gas MRU a MQT, se normalizan presiones de gas MQT. 13:49:00 hrs equipo ingresa en linea con gas MQT.",
        "downtimeHours": 0.13,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 13:41:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-15",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "FDL Jinan 10 a solicitud del CCM, por caida de presion de gas Costayaco, 06:13:00 revisión y arranque manual de la unidad.",
        "downtimeHours": 5,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 01:16:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-11",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "FDL equipo G55, por oscilacion de carga, ingresa a las 11:43 horas",
        "downtimeHours": 0.23,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 11:29:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-13",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "Parada manual equipo G55 no programada para revision , ingresa a las 19:48 horas",
        "downtimeHours": 4,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 15:55:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-14",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "13:51:00 Equipo jinan 01 suelta carga, Por maniobra no identificada en la linea de gas. 14:07:00 hrs equipo asume nuevamnete carga.",
        "downtimeHours": 0.27,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 13:51:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-20",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "19:13:00 hrs se coordina con CCM la extracción de línea equipo JINAN-10 por caída de presión de gas CYC 10 PSI, equipo en stand by disponible. 20:29:00 hrs se coordina con CCM el i",
        "downtimeHours": 1.16,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 19:13:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-14",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "14:52:00 A petición de CCM, se coordina la extracción de línea equipo JINAN-10, por caída de presión de gas CYC. Ingresa a las 20:56",
        "downtimeHours": 6,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:52:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-21",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "02:33:00 hrs sale de línea equipo JINAN-10, por baja presión de gas CYC, 02:35:00 ingresa equipo Diesel G101V, como respaldo mientras se estabiliza presión gas CYC. : 05:49:00 hrs ",
        "downtimeHours": 3.14,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 02:33:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-14",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "15:21:00 parada manual equipo CPW-03, por baja presión de gas MRU Y CYC. 16:27:00 equipo ingresa en linea alineado con gas MQT.",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 15:21:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-21",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "19:33:00 hrs sale de línea equipo JINAN-10 parada manual por baja presión de gas CYC, equipo en stand by disponible, 19:35:00 hrs equipo Diesel Copower G101V ingresa en línea como ",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 19:33:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-14",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "15:23:00 parada manual equipo CPW-01, por baja presión de gas MRU Y CYC. INGRESA A LAS 20:35 HORAS",
        "downtimeHours": 5,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 15:23:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-21",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "en coordinación con CCM se realiza rotación de equipos, 19:48:00 hrs sale de línea cpw-04 parada manual, 20:16:00 hrs ingresa en línea cpw-06.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 19:48:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-14",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "15:24:00 parada manual equipo CPW-02, por baja presión de gas MRU Y CYC. 15:53:00 Equipo ingresa en linea con gas MRU.",
        "downtimeHours": 0.55,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 15:24:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-21",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "22:54:00 hrs equipo cpw-02 sale de linea por detonación en cilindro. 23:15:00 hrs equipo cpw-02 ingresa en linea se sube carga progresivamente con el apoyo del personal de control.",
        "downtimeHours": 0.35,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 22:54:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-14",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "17:28:00 A petición de CCM, se coordina el cambio de gas MQT a gas MRU Equipo cpw-03, por caída de presión de gas MQT. 17:36:00 hrs equipo ingresa alineado con gas MRU.",
        "downtimeHours": 0.13,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:28:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-23",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "18:53:00 a peticion de ccm se coordina la puesta en marcha de los equipos cpw-01, cpw-02, cpw-03 y cpw-06 alineados con gas MRU, se finaliza presurización de tanques glp, sale de l",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 18:53:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-15",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "Equipo CPW02 equipo asume carga por salida de turbina y deslastra por generador en sobre frecuencia generando apertura.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:56:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-24",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "05:28 hrs a petición de ccm se coordina la puesta en marcha de los equipos G102E y G102J. Operación modo isla.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 05:28:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-16",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "10:20:00 hrs se coordina apagado manual del equipo JINAN-10, por maniobras cambio de filtración en la VRU por alta presión de lubricación. 11:58:00 hrs equipo ingresa en sincronism",
        "downtimeHours": 1.38,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 10:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-25",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "20:00:00 hrs se procede al arranque del equipo CPW-04.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 20:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-16",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "16:18:00 hrs Salen equipos de línea cpw01, cpw-02, cpw-03, por apertura de RL por vector shiift y salida MRU. 16:39:00 hrs cpw-03 equipo ingresa en linea. 16:54:00 hrs equipo cpw-0",
        "downtimeHours": 1.5,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:18:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-26",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "18:18.00 hrs Solicitud CCM se procede al arranque manual del equipo G102J ingresa en línea como respaldo se realiza maniobras cambio de gas MRU a gas MQT equipo cpw-06. 19:04:00 hr",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 18:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-17",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "07:36:00 hrs equipo cpw-04 sale de linea por baja presion sistema HT, 07:52:00 hrs equipo ingresa en linea, se adiciona agua sistema HT.",
        "downtimeHours": 0.27,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:36:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-26",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "19:04:00 hrs sale de linea equipo cpw-04 por baja nivel del sistema de refrigeración HT.19:23.00 hrs equipo ingresa en linea se adiciona agua al sistema de enfriamiento.",
        "downtimeHours": 0.32,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 19:04:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-17",
        "equipment": "JIN-02",
        "eventType": "Falla",
        "cause": "en coordinación con CCM se realiza rotación de equipos campo Vonu, 09:48:00 hrs ingresa en línea equipo JINAN-02, 09:54:00 hrs Sale de línea parada manual equipo JINAN-01 sin noved",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:48:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-26",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "23:26:00 hrs equipo cpw-06 sale de lina por falla comunicación en AVR,se evidencia en la inspección que por vibraciones del equipo puerto de conexión alimentación del AVR de descon",
        "downtimeHours": 0.1,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 23:26:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-18",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "06:50:00 hrs se deslastra 250 kw equipo cpw-04 por caida de presión de gas linea MQT, Equipo operando con gas MQT.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-27",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "00:10:00 hrs equipo cpw-04 sale de linea por sd baja presión HT, 0.71 bares, 00:20:00 hrs equipo ingresa en linea.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 00:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-18",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "07:03:00 hrs en coordinación con CCM se realiza parada manual del equipo JINAN-10, a causa caída de presión de gas CYC. 12:14:00 hrs equipo ingresa en línea se estabiliza presión g",
        "downtimeHours": 5.11,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:03:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-28",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "03:39 Apertura RL por vector shift - FDL SI - EEP reporta alarma por sobrecorriente cto 34.5 villagarzon - pto guzman - 03:47 Se sincroniza campo cyc al SIN - Inicia SI Sale de lin",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 03:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-18",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "10:18:00 hrs en coordinación con CCM se procede con el arranque manual del equipo CPW-07, Equipo pruebas en vacío.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:18:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-19",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "08:30:00 hrs en coordinación con CCM se realiza parada manual del equipo cpw01, a causa de mantenimiento semanal MRU",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-19",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "08:30:00 hrs en coordinación con CCM se realiza parada manual del equipo cpw02, a causa de mantenimiento semanal MRU",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-19",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "08:36:00 hrs en coordinación con CCM se realiza parada manual del equipo cpw03, a causa de mantenimiento semanal MRU",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:36:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-19",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Ingresa en linea CPW03 en respaldo revision acometida CPW04 equipo",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 11:52:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-19",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "12:01 CPW04 se realiza parada manual para revision de acometida",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 12:01:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-19",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "CPW01 al ingreso despues del mantenimiento de la MRU se presenta falla mecánica en el interruptor en el SGW tornillo que activa el estado",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 13:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-19",
        "equipment": "JIN-02",
        "eventType": "Falla",
        "cause": "16:23 sale porfalla en PLC SELF-CHECK: ERROR 51 equipo jinan-02",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:23:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-20",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "FDL Jinan 10 a solicitud del CCM, Se inicia equipo terminan trabajos con empresa SEIP",
        "downtimeHours": 4,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-20",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "19:58 hrs Equipo cpw-06 ingresa en servicio.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 18:18:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-21",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "G102K ingresa en linea por paso de la turbina a diesel por solicitud CCM",
        "downtimeHours": 0.77,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-21",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "SDL CPW06 parada externa solicitud CCM baja presion MQT y se ingresa G102K solicitud CCM",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-22",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "CPW 06 ingresa en linea con gas MRU",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:05:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-22",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "CPW 04 sale de linea solicitud CCM para recuperar presion MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-22",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "G102J ingresa en linea solicitud CCM recuperar presion MQT",
        "downtimeHours": 0.3,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-22",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "CPW 05 sale de linea equipo por apagado total en MQT, se ealiza mantenimiento cambio aceite y filtros",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 11:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-23",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "G101V ingresa en linea",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 10:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-23",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "G102k sale de linea",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 10:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-23",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "equipo Jinan 11 ingresa en vacio para pruebas con gas CYC",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 13:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-23",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "sale toda la generacion a gas MRU e ingresa toda la generacion a diesel por maniobra de presurizar tanques de glp",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-24",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "10:40:00 hrs cpw05 ingresa en linea con gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-24",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "12:45:00 hrs cpw04 ingresa en linea con gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 12:45:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-24",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "16:49:00 hrs se deslastra carga a equipos con gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 16:49:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-24",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "17:20:00 hrs se deslastra carga a equipos cos gas CYC y MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-24",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "17:40:00 hrs cpw04 sale de linea por solicitud ccm baja presion MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-25",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "SDL CPW02 por detonacion",
        "downtimeHours": 0.17,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 06:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-27",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "FDL equipo G56. Por maniobras de conexión del cableado del CPW-07",
        "downtimeHours": 9,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 10:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-27",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "FDL equipos G51 y G53, por mantenimiento semanal MRU, ingresan en linea a las 13:46 horas",
        "downtimeHours": 4,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 10:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-28",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "FDL equipo Jinan-10, para mantenimiento preventivo programado",
        "downtimeHours": 10,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:48:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-28",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "FDL CPW-04, a solicitud del CCM, por baja presion de gas Moqueta.",
        "downtimeHours": 3,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-28",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "SD general del campo costayaco y Vonu",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 13:19:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-28",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "ingresa equipo jinan2 con gas CYC19",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 19:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-28",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "ingresa equipo jinan1 con gas Vonu",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 23:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-29",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "Parada manual del equipo Jinan-10, se revisa falla en cilindros 9 y 10, se calibran valvulas y se ajusta guia de balancin, ingresa a las 14:08 horas.",
        "downtimeHours": 0.5,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 13:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-29",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "FDL manual equipo G53, para cambio de valvula BYPASS, entra en linea a las 17:47 horas.",
        "downtimeHours": 0.17,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 17:37:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-30",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "FDL manual de los equipos Jinan 01 y 02, por solicitud del CCM, para realizar maniobras en lineas de gas, entran en linea a las 11:30 horas.",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-05-31",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "Apertura de RL por MB disparo externo se presenta SD general campo cyc. FDL toda la generacion costayaco y Vonu.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 13:45:00 GMT-0456 (Colombia Standard Time)"
      }
    ],
    "consumos": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "adicionAceite": 61,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      }
    ],
    "kpi": {
      "availability": 0.986225,
      "reliability": 0.986225,
      "maintainability": null,
      "generationMwh": 3781.66,
      "operationalLossesMwh": null,
      "contractualCompliance": null
    }
  },
  "Jun": {
    "label": "Junio 2026",
    "sourceFile": "data/Datos COPOWER/Reporte_Diario_Costayaco_Vonu 2026 actualizado 34.xlsx",
    "summary": {
      "copowerFailures": 60,
      "totalEvents": 196,
      "mtbfHours": 57.76,
      "mttrHours": 0.09,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 6874,
      "hoursStandby": 2254,
      "hoursPreventive": 107,
      "hoursCorrective": 11,
      "hoursFailureCopower": 11,
      "hoursFailureClient": 0,
      "energyGasKwh": 4172497,
      "energyDieselKwh": 64065
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 3647958,
        "dieselKwh": 64065
      },
      {
        "asset": "Vonu",
        "gasKwh": 524539,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 371766,
        "horasOperacion": 571,
        "horasStandBy": 91,
        "horasPP": 56,
        "horasPFContr": 1,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 42
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 409453,
        "horasOperacion": 655,
        "horasStandBy": 64,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 10
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 394942,
        "horasOperacion": 608,
        "horasStandBy": 102,
        "horasPP": 9,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 7
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 594029,
        "horasOperacion": 710,
        "horasStandBy": 9,
        "horasPP": 0,
        "horasPFContr": 1,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 4
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 591399,
        "horasOperacion": 701,
        "horasStandBy": 11,
        "horasPP": 7,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 6
      },
      {
        "equipo": "CPW06",
        "campo": "COSTAYACO",
        "energiaKwh": 560828,
        "horasOperacion": 667,
        "horasStandBy": 45,
        "horasPP": 4,
        "horasPFContr": 2,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 4
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 175328,
        "horasOperacion": 473,
        "horasStandBy": 243,
        "horasPP": 4,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 1
      },
      {
        "equipo": "JIN-11",
        "campo": "COSTAYACO",
        "energiaKwh": 55709,
        "horasOperacion": 155,
        "horasStandBy": 326,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 481,
        "fallaEvento": 3
      },
      {
        "equipo": "CPW07",
        "campo": "COSTAYACO",
        "energiaKwh": 402585,
        "horasOperacion": 604,
        "horasStandBy": 101,
        "horasPP": 7,
        "horasPFContr": 7,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 10
      },
      {
        "equipo": "JIN-12",
        "campo": "COSTAYACO",
        "energiaKwh": 91919,
        "horasOperacion": 245,
        "horasStandBy": 240,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 485,
        "fallaEvento": 1
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 19596,
        "horasOperacion": 25,
        "horasStandBy": 338,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 363,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 42872,
        "horasOperacion": 57,
        "horasStandBy": 306,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 363,
        "fallaEvento": 0
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 1597,
        "horasOperacion": 5,
        "horasStandBy": 356,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 361,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 270247,
        "horasOperacion": 701,
        "horasStandBy": 6,
        "horasPP": 13,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 4
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 254292,
        "horasOperacion": 697,
        "horasStandBy": 16,
        "horasPP": 7,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 2
      }
    ],
    "totalGenerationKwh": 4236562,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 91,
        "disponibilidadPct": 91.94,
        "confiabilidadPct": 91.94,
        "fallas": 42,
        "mtbfLabel": "13.6",
        "mttrHours": 0.02,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 571 h · FS 1 h"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 64,
        "disponibilidadPct": 99.86,
        "confiabilidadPct": 99.86,
        "fallas": 10,
        "mtbfLabel": "65.5",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 655 h · FS 0 h"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 102,
        "disponibilidadPct": 98.61,
        "confiabilidadPct": 98.61,
        "fallas": 7,
        "mtbfLabel": "86.86",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 608 h · FS 0 h"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 9,
        "disponibilidadPct": 99.86,
        "confiabilidadPct": 99.86,
        "fallas": 4,
        "mtbfLabel": "177.5",
        "mttrHours": 0.25,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 710 h · FS 1 h"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 11,
        "disponibilidadPct": 98.89,
        "confiabilidadPct": 98.89,
        "fallas": 6,
        "mtbfLabel": "116.83",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 701 h · FS 0 h"
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 45,
        "disponibilidadPct": 98.89,
        "confiabilidadPct": 98.89,
        "fallas": 4,
        "mtbfLabel": "166.75",
        "mttrHours": 0.5,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 667 h · FS 2 h"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 243,
        "disponibilidadPct": 99.44,
        "confiabilidadPct": 99.44,
        "fallas": 1,
        "mtbfLabel": "473",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 473 h · FS 0 h"
      },
      {
        "unidad": "JIN-11",
        "campo": "COSTAYACO",
        "horasStandBy": 326,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 3,
        "mtbfLabel": "51.67",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 155 h · FS 0 h"
      },
      {
        "unidad": "CPW07",
        "campo": "COSTAYACO",
        "horasStandBy": 101,
        "disponibilidadPct": 97.92,
        "confiabilidadPct": 97.92,
        "fallas": 10,
        "mtbfLabel": "60.4",
        "mttrHours": 0.7,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 604 h · FS 7 h"
      },
      {
        "unidad": "JIN-12",
        "campo": "COSTAYACO",
        "horasStandBy": 240,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 1,
        "mtbfLabel": "245",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 245 h · FS 0 h"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 338,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 25 h · FS 0 h"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 306,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 57 h · FS 0 h"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 356,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 5 h · FS 0 h"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 6,
        "disponibilidadPct": 98.19,
        "confiabilidadPct": 98.19,
        "fallas": 4,
        "mtbfLabel": "175.25",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 701 h · FS 0 h"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 16,
        "disponibilidadPct": 99.03,
        "confiabilidadPct": 99.03,
        "fallas": 2,
        "mtbfLabel": "348.5",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 697 h · FS 0 h"
      }
    ],
    "eventLog": [
      {
        "date": "2026-06-02",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "SDL equipo CPW-06 por parada manual para inspeccion de intercooler y se presenta obstruccion en aletas con quimico sin identificar",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 22:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-03",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Equipo cpw 03 - 07 ingresan en linea gas mru",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 01:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-03",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "Equipo cpw 06 ingresa en linea gas mru",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 04:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "2:15:00 a. m. CPW011 sale de línea parada manual por baja presión de gas CYC.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 02:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "3:53:00 a. m. salen de linea toda la generasion a gas equipos cpwo1-2-3-4-5-6-7-12-jinan1 y jinan 2 por motivo de Apertura del SIN por vector shift – Desestabiliza toda la generaci",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 03:53:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "4:21:00 a. m. hrs equipos diesel Star, en vacío por solicitud de CCM, respaldo de carga por sd general.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 04:21:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "4:26:00 a. m.hrs se realiza sincronismo equipo G102J, ingresa en línea como respaldo de carga.",
        "downtimeHours": 4,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 04:26:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "4:49:00 a. m hrs se realiza sincronismo equipo G102k, ingresa en línea como respaldo de carga.",
        "downtimeHours": 2,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 04:49:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "5:51:00 a. m. hrs Ingresa en sincronismo equipo CPW05 En reparto de carga",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 05:51:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "19:07:00 en coordinación con CCM ingresa en línea equipo cpw-10",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 19:07:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-14",
        "equipment": "CPW00",
        "eventType": "Operativo",
        "cause": "20:07:00 hrs ingresa en línea equipo CPW007 a petición de CCM, se estabiliza condiciones de presión de gas.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 20:07:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "18:49 en coordinación con CCM ingresa en línea equipo cpw-04 alineado con gas mqt.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 18:49:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "18:59 en coordinación con CCM ingresa en línea equipos JINAN-02.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 18:59:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "19:03 en coordinación con CCM ingresa en línea equipo cpw-05 alineado con gas mqt.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 19:03:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "19:25 en coordinación con CCM ingresa en línea equipos JINAN-01.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 19:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "22:38 en coordinación con CCM ingresa en línea equipo CPW-06, alineado con gas MQT.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 22:38:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "22:57 en coordinación con CCM ingresa en línea equipo CPW-03, , alineado con gas MRU.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 22:57:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "22:58 en coordinación con CCM ingresa en línea equipo CPW-03, , alineado con gas MRU.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 22:58:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "23:11 : en coordinación con CCM ingresa en línea equipo CPW-10, alineado con gas CYC.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 23:11:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "23:11 : en coordinación con CCM ingresa en línea equipo CPW-11, alineado con gas CYC.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 23:13:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "en coordinación con CCM sale de línea equipo diesel G102K.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 23:21:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-16",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "00:13 en coordinación con CCM sale de línea equipo CPW-11 por baja presión de gas cyc",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 00:13:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-16",
        "equipment": "CPW00",
        "eventType": "Operativo",
        "cause": "01:05 en coordinación con CCM ingresa en línea equipo CPW-007, con gas MRU.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 01:05:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-16",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "01:21 en coordinación con CCM sale de línea equipo G102J, equipo en stand by disponible.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 01:21:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-16",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "01:26 en coordinación con CCM sale de línea equipo G101V, equipo en stand by disponible.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 01:26:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-16",
        "equipment": "CPW00",
        "eventType": "Falla",
        "cause": "02:47:00 hrs sale de linea equipo CPW004 por sd falla en MICT5, 03:02:00 hrs equipo ingresa en linea con gas MQT.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 02:47:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-17",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "02:2:00 hrs sale de linea equipos CPW01, cpw02, cpw07, por fallo apagado MRU. 04:32:00 ingresa en linea equipo cpw01. 04:50:00 ingresa en linea equipo CPW02. 04:53:00 ingresa en li",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 02:22:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-21",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Se realiza toma de muestras de gas en equipos Jinan-10,CPW-4 y CPW-2 dando como dato relevante una muesta mayor a los 400ppm en el equipo CPW-2",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 22:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-21",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "SLD equipo CPW-02 por detonacion",
        "downtimeHours": 0.08,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 21:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-23",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "se registró la salida de los equipos CPW01, CPW02, CPW03 y CPW07 como consecuencia de la parada de la MRU y el chiller. La secuencia de eventos fue verificada mediante las tendenci",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 00:12:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-23",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "02:20 h: Nuevamente sale de línea el chiller MRU+ en el momento en que se estaba reanudando la operación. En ese instante se encontraban en línea los equipos CPW01 y CPW02, mientra",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 02:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "FDL equipos G52, 53, 57, JINAN-10, 11 &12, por salida de operacion de la MRU, ingresan a las 01:41 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 20:19:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Jinan-10 pasa a operar con gas costayaco",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 21:12:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "Jinan-11 pasa a operar con gas costayaco",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 21:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "Jinan-12 pasa a operar con gas costayaco",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 21:43:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "JIN-12",
        "eventType": "Falla",
        "cause": "Jinan-12 FDL por caida de presion de gas Costayaco, condiciones climaticas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 00:54:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "JIN-11",
        "eventType": "Falla",
        "cause": "Jinan-11 FDL por caida de presion de gas Costayaco, condiciones climaticas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 01:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-01",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "CPW06 Sale por alarma de potencia inversa. Ingresa a las 15:25 horas",
        "downtimeHours": 2,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 13:22:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "Jinan-10 FDL por caida de presion de gas Costayaco, condiciones climaticas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 01:29:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-02",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "FDL equipos G52,G53,G56 Y G57 por mantenimiento semanal MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:08:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Ingresa en linea equipo G53 con gas tratado MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 01:14:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-02",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "ingresa equipo G102J SOLICITUD CCM POR MANTENIMIENTO MRU",
        "downtimeHours": 6,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:22:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "Ingresa en linea equipo G51 con gas tratado MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 01:19:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-02",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "FDL EQUIPO G51 por desconexión generadores diesel CPW G102I - G102E - G102A. Equipo ingresa a linea a las 16:50 con gas MQT",
        "downtimeHours": 2.5,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Ingresa en linea equipo G52 con gas tratado MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 01:36:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-02",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "Equipo cpw 01 presenta detonacion al momento de asumir carga, equipo queda fuera de linea por daños en el multiple",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 17:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "Ingresa en linea equipo G57 con gas tratado MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 01:41:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-03",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "07:23:00 hrs Solicitud CCM se procede al apagado manual del equipo cpw-10 a causa caída de presión de gas CYC 9 psi. 10:50:00 hrs equipo ingresa en linea con 350 kw.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:23:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Ingresa en linea equipo JINAN-10 con gas tratado MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 03:14:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-03",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "10:51:00 hrs en coordinación con CCM se procede con el apagado manual del equipo JINAN-01 para su respectivo mantenimiento programado. Equipo ingresa 16:50",
        "downtimeHours": 6,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:51:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "Ingresa en linea equipo JINAN-11 con gas tratado MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 04:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-03",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "equipo G102J ingresa a lainea por solicitud de ccm por maniobra cambio de cargas. Salida 14:37",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 13:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-26",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "01:00 FDL generación a gas CPW 01-02-03-04-05-06-07- Jinan 10 por disparo de C9 y reconectador RX por sobrecorriente. FDL",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 01:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-03",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "salen de linea equipos cpw04- hora 14:33, cpw05- hora 15:18 , cpw06- hora 14:33, cpw07- hora 15:17, cpw010 hora 14:34 por maniobra en portico reconectador 34.5",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 14:33:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-27",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "FDL equipos G52, 56, 57, se presenta perturbacion en la red generando elevacion del voltaje y potencia reactiva de los generadores CPW06 & 07, los cuales salen de linea, el voltaje",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 03:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-03",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "equipo G102J ingresa a lainea por solicitud de ccm",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 15:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-27",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "Ingresa en linea equipo CPW-07, Se encontró el breaker de alimentación del transformador de 480v a 220V disparado, al revisar todos los equipos asociados a ese transformador se enc",
        "downtimeHours": 5,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 10:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-03",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "cpw04 hora 15:34, cpw05 hora 15:40 ingresan por solicitud de ccm",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 15:34:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-27",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Ingresa en linea equipo CPW-01, a las 03:23",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 03:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-04",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "09:20:00 hrs sale de línea parada manual equipo CPW-10 causa caída de presión de gas CYC. 09:17:00 hrs equipo G101V ingresa como respaldo de carga. 10:48:00 hrs ingresa en línea CP",
        "downtimeHours": 0.26,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-27",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "Ingresa en linea equipo CPW-06, a las 05:20, presento varios afectaciones en los fusibles y perdida de comunicacion en el modo reparto de carga, se logra ingresar en modo carga bas",
        "downtimeHours": 2,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 03:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-04",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "12:07:00 hrs sale de línea parada manual equipo CPW-10 causa caída de presión de gas CYC. 12:04:00 hrs equipo G101V ingresa como respaldo de carga. 14:37:00 hrs ingresa en línea eq",
        "downtimeHours": 2.3,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 12:07:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-29",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "FDL equipo G57, por sobre carga y sobre voltaje, equipo pierde estabilidad de carga, se reinicia modulo MIC5 y se ingresa en linea a las 19:53 horas.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 19:49:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-05",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "09:20:00 hrs equipo cpw-10 ingresa en linea por solicitud del CCM, se estabiliza prsión de gas CYC.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-05",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "11:40 hrs sale de línea parada manual equipo CPW-10 causa caída de presión de gas CYC. 11:35:00 hrs equipo G101V ingresa como respaldo de carga.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-05",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "12:57:00 hrs sale de liea cpw-04 por falla en MICT5, e reset alarmas, y se inspecciona equipo. 13:11:00 hrs equipo ingresa en linea en raprto de carga.",
        "downtimeHours": 0.23,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 12:57:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-05",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "13:40:00 hrs ingresa en linea equipo cpw-10, se estabiliza presión de gas CYC. 13:50:00 hrs sale de linea parda manual equipo G101V.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 13:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-06",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "08:15 hrs sale de linea equipo CPW010, Por solicitud de CCM por actividades programadas de maniobras de conexion salida de potencia generadores cpw-10,cpw-11 y cpw-12 al tablero 48",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-06",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "10:47:00 hrs sale de línea equipo JINAN-01 parada manual, se realizará cambio de válvula 3/4\" . Tiempo estimado 1 hora. 10:47:00 hrs Ingresa como respaldo de carga equipo G101V. 11",
        "downtimeHours": 0.5,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 10:47:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-06",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "16:57:00 hrs sale de linea equipo cpw-02 por falla sd MAT alto, se procede a realizar inspeccion del equipo, reset de alarmas y proceso de arranque en vacio. 17:03:00 hrs ingresa e",
        "downtimeHours": 0.1,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:57:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-07",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "09:26:00 equipo cpw-03 hrs sale de línea por sd detonación. 09:27:00 hrs, seguido sale de línea equipo CPW-01 por sobre frecuencia del generador. 09:38:00 hrs equipo cpw-03 ingresa",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:26:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-07",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "11:36 hrs equipo cpw-01 sale de linea por sd sobre velocidad se evidencia perdida de refencia de velocidad, potencia y reactiva ingresa a linea 12:41",
        "downtimeHours": 5,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 11:36:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-07",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "14:39:00 hrs equipo cpw-01 sale de linea por sd detonación. Se evidencia en las tendencias de operación del equip caída de presión de gas. 16:52:00 hrs equipo ingresa en línea, se ",
        "downtimeHours": 2,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 14:39:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-08",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "09:09:00 hrs ingresa en línea equipo G102J como respaldo de carga con 800 kw. por maniobra conexión del tablero de transferencia. 11:34 hrs sale de linea equipo G102J",
        "downtimeHours": 3,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:09:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-08",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "09:15:00 hrs sale de línea equipo cpw-07 parada manual. 11:19 hrs ingresa en linea equipo cpw-07",
        "downtimeHours": 2,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-08",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "09:17:00 hrs ingresa en línea equipo Diesel G102k, como respaldo de carga con 800 kw. por maniobra conexión del tablero de transferencia. 11:56 hrs sale de linea equipo G102K",
        "downtimeHours": 3,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:17:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-08",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "09:24:00 hrs sale de línea equipo cpw-06 parada manual. 11:50 hrs ingresa en linea equipo cpw-06",
        "downtimeHours": 2.2,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:24:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-08",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "13:03:00 hrs equipo cpw-03 sale de linea parada manual para su respectivo plan de mantenimiento preventivo programado. 17:24:00 hrs equipo cpw-03 ingresa en linea, se culminó mante",
        "downtimeHours": 4,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 13:03:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-09",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "05:30:00 hrs A solicitud de CCM ingresa en linea equipo Diesel G102J por tormenta eléctrica, operación en modo isla. 06:37:00 hrs equipo sale de linea parada manual se sincroniza c",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 05:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-09",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "05:30:00 hrs A solicitud de CCM ingresa en linea equipo Diesel G102K por tormenta eléctrica, operación en modo isla. 06:39:00 hrs equipo sale de linea parada manual se sincroniza c",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 05:45:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-09",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "11:15:00 hrs Se coordina con CCM apagado manual del equipo cpw-06, se realiza cambio de gas MRU a gas MQT. 11:28:00 hrs equipo ingresa en linea alineado con ga MQT.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-09",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "11:35:00 hrs ingresa en linea equipo G102J como respaldo de carga por mantenimiento de MRU. 15:56:00 hrs equipo sale de linea parada manual por peticion de ccm",
        "downtimeHours": 3.2,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:35:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-09",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "11:50:00 hrs sale de linea equipo CPW-01 parada manual por mantenimiento preventivo MRU. 15:53:00 hrs ingresa en linea equipo alineado con gas MRU",
        "downtimeHours": 4,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-09",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "11:52:00 hrs sale de liea equipo CPW-03 parada manual por mantenimiento preventivo MRU. 16:02:00 hrs ingresa en linea equipo alineado con gas MRU",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:52:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-09",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "11:55:00 hrs sale de linea equipo cpw-07 parada manual por mantenimiento preventivo MRU. 15:45:00 hrs ingresa en linea equipo alineado con gas MRU",
        "downtimeHours": 4,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:55:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-09",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "11:59:00 ingresa en linea equipo G101V como respaldo de carga por mantenimiento de MRU. 12:41:00 hrs equipo sale de linea parada manual por petición de ccm.",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:59:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-09",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "16:13:00 hrs Se coordina con CCM apagado manual del equipo cpw-06, se realiza cambio de gas MQT a gas MRU. 16:20:00 hrs equipo ingresa en linea alineado con ga MRU.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 16:13:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-10",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "09:36 hrs sale de linea equipo J02 por mantenimiento programado. 16:20 ingresa en linea con gas cyc 19",
        "downtimeHours": 7,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:36:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-10",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "09:36 hrs sale de linea equipo J01 por cambio de gas vonu a cyc 19 09:50 hrs ingresa en linea equipo con gas cyc19",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:36:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-10",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "09:40 hrs equipo G102V ingresa como respaldo por salida de equipo CPW010 por pruebas del equipo CPW011. sale de linea a las 12:03 a solicitud de ccm",
        "downtimeHours": 2,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-10",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "09:44 hrs equipo CPW010 Sale de linea por pruebas del equipo CPW011.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:44:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-10",
        "equipment": "JIN-11",
        "eventType": "Falla",
        "cause": "10:11 hrs equipo Jinan 011 ingresa en linea, equipo se encuentra en pruebas. 17:45 Sale de linea por finalización de pruebas del equipo CPW011",
        "downtimeHours": 7.5,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 10:11:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-10",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "14:20 hrs Parada manual equipo CPW07 por protección presenta altas vivraciones y se nota alta oscilación de carga al pasar la turbina a diesel se informa a CCM 14:50 hrs Ingresa en",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-10",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "16:00 hrs sale de linea equipo J01 por cambio de gas cyc 19 a vonu 16:10 hrs ingresa en linea equipo con gas vonu",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 16:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-11",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "09:56 hrs ingresa en linea equipo cpw011",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 10:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-11",
        "equipment": "CPW00",
        "eventType": "Falla",
        "cause": "15:30 hrs equipo cpw003 sale por detonación se encuentra en revisión. 21:09:00 hrs se coordina el ingreso equipo cpw003.",
        "downtimeHours": 5,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 15:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "6:06:00 a. m.hrs Ingresa en sincronismo equipo CPW11, 6:20:00 a. m. hrs sale por baja presion gas cyc.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:06:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "06:12:00 a. m. hrs Ingresa en sincronismo equipo CPW04",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 06:12:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "06:26:00 a. m. hrs Ingresa en linea equipo cpw02 en coordinación con CCM en reparto de carga",
        "downtimeHours": 5,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:26:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "07:10:00 a. m. hrs Ingresa en linea equipo Jinan 01 en coordinación con CCM en carga base",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "07:15:00 a. m. hrs Ingresa en linea equipo Jinan 02 en coordinación con CCM en carga base",
        "downtimeHours": 3.1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "08:25:00 a. m. hrs Ingresa en linea equipo cpw07 en coordinación con CCM en carga base",
        "downtimeHours": 2,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "08:33:00 a. m. hrs Ingresa en linea equipo cpw03 en coordinación con CCM en reparto de carga",
        "downtimeHours": 3,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:33:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "09:10:00 a. m. hrs Ingresa en linea equipo cpw06 en coordinación con CCM en carga base",
        "downtimeHours": 5.2,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "09:30 hrs Ingresa en linea equipo cpw01 en coordinación con CCM en reparto de carga",
        "downtimeHours": 3,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "11:30 :00 a. m.hrs Ingresa en linea equipo Jinan 10 en coordinación con CCM en carga base, 17:27:00 p. m. sale por baja presion de gas cyc",
        "downtimeHours": 6,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "12:47:00 p. m. hrs equipo cpw01 sale de linea por sobre velocida, 13:57 ingresa en linea",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 12:47:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "15:20:00 p. m. hrs equipo cpw011 ingresa en linea a solicitud de ccm, 17:05 sale por baja presion gas cyc",
        "downtimeHours": 3,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 15:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "17:37:00 p. m. hrs equipo G110V Equipo ingresa como respaldo campo modo isla. 19:16:00 en coordinación con CCM se procede con el apagado manual de equipos Diesel Copower, se sincro",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:37:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "17:39:00 p. m. hrs equipo G102J Equipo ingresa como respaldo campo modo isla. 19:17:00 p. m. en coordinación con CCM se procede con el apagado manual de equipos Diesel Copower, se ",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:39:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "17:42:00 p. m. hrs equipo G112K Equipo ingresa como respaldo campo modo isla. 19:18::00 p. m. en coordinación con CCM se procede con el apagado manual de equipos Diesel Copower, se",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:42:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-12",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "17:39:00 p. m. hrs equipo cpw04 sale por Falla MICT 5 operario revisa y se restablece equipo. 18:00 equipo ingresa en linea.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 17:39:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-13",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "9:20:00 a. m. en coordinación con CCM ingresa en línea equipo cpw-11",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-13",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "9:45:00 a. m. en coordinación con CCM sale de línea equipo cpw-10 para mantener estable presión de gas cyc. 18:05:00 p. m en coordinación con CCM ingresa en línea equipo cpw-010.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:45:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-13",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "16:00:00 p. m. en coordinación con CCM ingresa en linea equipo G102J por contingencia apertura RL 18:17::00 p. m. en coordinación con CCM sale de línea equipo Diesel G102J, se sinc",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 16:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-14",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "6:30:00 a. m. Sale de linea equipo cpw011 para revision calibracion valvulas cilindro 12",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 06:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-14",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "6:40:00 a. m. ingresa a linea equipo cpw012 en coordinación con ccm. 15:50:00 p.m. sale de linea para mantener estable presion de gas cyc",
        "downtimeHours": 9,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-14",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "4:25:00 p. m. Equipo cpw010 fuera de linea por petición operador de ccm para recuperar presión de gas,17:00:00 p.m. Equipo ingresa en linea por petición operador de ccm.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 16:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-14",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "4:25:00 p. m. ingresa equipo g101v como respaldo, sale de linea equipo por peticion de ccm 17:05",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 16:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "equipo cpw-01, 16:44 Salida del SIN. SD campo CYC.EEP reporta disparo línea 34.5 Kv subestación Junin Mocoa, 22:58 hrs equipo ingresa en linea con gas MRU.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 16:44:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "equipo cpw-02, 16:44 Salida del SIN. SD campo CYC.EEP reporta disparo línea 34.5 Kv subestación Junin Mocoa,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:44:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "equipo cpw-03, 16:44 Salida del SIN. SD campo CYC.EEP reporta disparo línea 34.5 Kv subestación Junin Mocoa",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:44:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "equipo cpw-04, 16:44 Salida del SIN. SD campo CYC.EEP reporta disparo línea 34.5 Kv subestación Junin Mocoa,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:44:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "equipo cpw-05, 16:44 Salida del SIN. SD campo CYC.EEP reporta disparo línea 34.5 Kv subestación Junin Mocoa,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:44:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "equipo cpw-06, 16:44 Salida del SIN. SD campo CYC.EEP reporta disparo línea 34.5 Kv subestación Junin Mocoa,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:44:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "equipo cpw-07, 16:44 Salida del SIN. SD campo CYC.EEP reporta disparo línea 34.5 Kv subestación Junin Mocoa,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:44:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "equipo cpw-10, 16:44 Salida del SIN. SD campo CYC.EEP reporta disparo línea 34.5 Kv subestación Junin Mocoa,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:44:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "equipo cpw-12, 16:44 Salida del SIN. SD campo CYC.EEP reporta disparo línea 34.5 Kv subestación Junin Mocoa,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:44:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "equipo Jinan-01, 16:44 Salida del SIN. SD campo CYC.EEP reporta disparo línea 34.5 Kv subestación Junin Mocoa,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:44:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-15",
        "equipment": "JIN-02",
        "eventType": "Falla",
        "cause": "equipo Jinan-02, 16:44 Salida del SIN. SD campo CYC.EEP reporta disparo línea 34.5 Kv subestación Junin Mocoa,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:44:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-16",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "10:10:00 a. m. Se comienza actividad de traslado de sevicios auxiliares de equipos j320 quedando fuera de linea, a su vez inicia mantenimiento semanal de la MRU quedando fuera de l",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 10:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-17",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "se presenta salida de la MRU y CHILLER, FDL G51/52/53 &57, empiezan a inresar en linea a las 17:00",
        "downtimeHours": 5,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:47:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-18",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "FDL equipo Jinan-01, por mantenimiento preventivo programado",
        "downtimeHours": 10,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 10:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-18",
        "equipment": "JIN-11",
        "eventType": "Falla",
        "cause": "FDL equipos Jinan-11 & 12, por baja presion de gas Costayaco.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 12:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-20",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "Se realiza derrateo de carga a loa equipos a sociados a gas Moqueta, por salida de pozo de produccion en ese campo, y baja presion de gas.",
        "downtimeHours": 5,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:38:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-20",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "FDL equipo G55, para conexiones de comunicación CAN DEIF para reparto de carga delos equipos G56 & G57. ingresa a las 14:12 horas.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 13:58:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-20",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "FDL equipo G57, para acondicionar a modo repatro de carga. Ingresa a las 14:48 horas.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 14:31:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-20",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "FDL manual por petición de operador de CCM, caída de presión de gas Costayaco a 14 PSI, condiciones climáticas. Ingresa a las 10:43 horas.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:08:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-20",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "FDL manual por petición de operador de CCM, caída de presión de gas Costayaco a 15 PSI, condiciones climáticas, ingresa a las 10:55 horas",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-22",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "Se realiza mantenimiento preventivo M2 programado al equipo G55, ingresa a las 15:13 horas.",
        "downtimeHours": 7,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:45:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-22",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "Equipos diesel G 101V, G102j y G102K entran en linea para realizar maniobras de apertura del RL y sincronismo con la red, por parte del personal de PAC y autorizado por GTE, salen ",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 14:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-23",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "Equipo cpw07 sale de linea en coordinación con el CCM, por mantenimiento preventivo programado. Mantenimiento finaliza a las 16:00 equipo queda disponible",
        "downtimeHours": 7,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:54:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-23",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "Equipo cpw01 sale de linea en coordinación con el CCM, por mantenimiento programado MRU",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:58:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-23",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "Equipo cpw03 sale de linea en coordinación con el CCM, por mantenimiento programado MRU",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:09:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-23",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "Equipo cpw02 sale de linea en coordinación con el CCM, por cambio de gas de MRU a gas MQT, ingresa a linea a las 9:24",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:14:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-23",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Equipo cpw012 ingresa a linea en coordinación con el CCM, por estabilidad de gas cyc",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-23",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "Equipo cpw02 sale de linea en coordinación con el CCM, por baja presion de gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:54:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-23",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "equipo cpw04 y cpw05 salen de linea por apertura del interruptor principal se pierde refencia de red. 15:40 equipos ingresan a linea",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 15:24:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-23",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "equipo cpw04 y cpw05 salen de linea por apertura del interruptor principal se pierde refencia de red, 16:59 EEP reporta disparo de reconectador linea 34.5 Kv Jauno - Piamonte17:40 ",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:59:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-23",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "EQUIPO: G102k & G102J Ingresan en línea por solicitud del CCM por salida de los equipos CPW04 & 05, 18:10 equipo G102J sale de linea.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "6:41 hrs equipo cpw 011 en coordinación con CCM equipos ingresan en línea en reparto de carga",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:41:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "6:46 hrs equipo cpw 012 en coordinación con CCM equipos ingresan en línea en reparto de carga",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:46:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "6:44 hrs equipo cpw 06 en coordinación con CCM equipos ingresan en línea en reparto de carga",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:44:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "8:07 hrs equipo cpw03 en coordinación con CCM , sale de línea equipos cpw alineados con gas MRU+CHILLER, causa corrección fuga de aceite en sistema QUINCY. 10:16 hrs ingresa a line",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:07:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "8:11 hrs equipo cpw02 en coordinación con CCM , sale de línea equipos cpw alineados con gas MRU+CHILLER, causa corrección fuga de aceite en sistema QUINCY. 10:15 hrs ingresa a line",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:11:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "8:16 hrs equipo cpw01 en coordinación con CCM , sale de línea equipos cpw alineados con gas MRU+CHILLER, causa corrección fuga de aceite en sistema QUINCY. 10:14 hrs ingresa a line",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:16:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "8:19 hrs equipo cpw07 en coordinación con CCM , sale de línea equipos cpw alineados con gas MRU+CHILLER, causa corrección fuga de aceite en sistema QUINCY. 10:13 hrs ingresa a line",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:19:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "7:58 hrs equipo G101V en coordinación con CCM , ingresa en línea por maniobra MRU. 10:17 hrs sale de linea.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:58:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "7:58 hrs equipo G102J en coordinación con CCM , ingresa en línea por maniobra MRU. 10:18 hrs sale de linea.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:58:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "8:01 hrs equipo G102k en coordinación con CCM , ingresa en línea por maniobra MRU. 08:30 hrs sale de linea.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:01:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "JIN-02",
        "eventType": "Falla",
        "cause": "10:43 hrs equipo jinan 2 en coordinación con CCM sale de línea equipo Jinan 02 por mantenimiento cyc 19. 16:20 hr equipo ingresa a linea",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:43:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "11:30 hrs equipo cpw010 sale de linea por mantenimiento programado. 15:51 hrs equipo ingresa en linea con gas mru",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "11:25 hrs equipo cpw011 sale de linea por cambio de gas cyc a MRU. Ingresa a linea 12:08",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "11:30 hrs equipo cpw012 sale de linea por cambio de gas cyc a MRU. Ingresa a linea 12:21",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-24",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "16:05 hr sale de linea equipo cpw02 por baja presion gas mru",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 16:05:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "11:25:00 a. m. por solicitud de ccm ingresa en linea equipo CPW012 alineado con gas MRU. 11:32:00 a. m. Sale de linea parada manual Por baja presión gas MRU.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "CPW00",
        "eventType": "Falla",
        "cause": "11:30:00 a. m. salen de lienas equipos CPW001,CPW002,CPW003,CPW007,CPW010 y CPW011, por protección parada MRU. Sale MRU de operación por activación de nivel alto en tanque de NGL L",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 11:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "12:35:00 p. m. hrs ingresa en linea equipo G102J como respaldo por salida de equipos alineados con gas MRU. 14:47:00 hrs Por solicitud de CCM sale de línea equipo Diesel G102J, ing",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 12:35:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "12:36:00 p. m. hrs ingresa en linea equipo G102K como respaldo por salida de equipos alineados con gas MRU.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 12:36:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "14:25:00 p. m se coordina con ccm el ingreso en línea equipo CPW010 alineados con gas CYC.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "14:29:00 p. m. se coordina con ccm el ingreso en línea equipo CPW011 alineados con gas CYC.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:29:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-25",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "14:43:00 p. m. se coordina con ccm el ingreso en línea equipo CPW012 alineados con gas CYC.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:43:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-26",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "13:26:00 p. m. se coordina con CCM se realiza el apagado manual equipos , CPW-05 alineados con gas MQT, por maniobra de ingresa Valvula controladora fhisher. 14:57:00 hrs equipo in",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 13:26:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-26",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "13:27:00 p. m. se coordina con CCM se realiza el apagado manual equipos , CPW-04 alineados con gas MQT, por maniobra de ingresa Valvula controladora fhisher.14:20:00 hrs equipo ing",
        "downtimeHours": 0.88,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 13:27:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-26",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "13:29:00 p. m. se coordina con CCM se realiza el apagado manual equipos , CPW-06 alineados con gas MQT, por maniobra de ingresa Valvula controladora fhisher.14:54:00 hrs equipo ing",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 13:29:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2028-06-27",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "8:01:00 a. m. sale de linea equipo cpw-01 por falla (-P> 3), registrándose una potencia mínima de -318 kW. 8:13:00 a. m equipo ingresa en linea en reparto de carga.",
        "downtimeHours": 0.2,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:01:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-27",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "8:03:00 a. m sale de linea equipo cpw-05 por falla Shut Down debido a detonación, evento ocurrido después de la salida del equipo CPW-01. 8:08:00 a. m equipo ingresa en linea en re",
        "downtimeHours": 0.08,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:03:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-27",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "9:37:00 a. m. equipo cpw-12 ingresa en linea, alineado con gas CYC.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:37:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-27",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "equipo cpw-07 ingresa en linea Se encontró el breaker de alimentación del transformador de 480v a 220V disparado, al revisar todos los equipos asociados a ese transformador se enco",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 10:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-27",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "17:50 Hr sale de linea equipo cpw012 por baja presion de gas cyc",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "7:14hr sale de linea equipo cpw01 por salida MRU. 8:28 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:14:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "7:14hr sale de linea equipo cpw02 por salida MRU. 8:26 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:14:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "7:14hr sale de linea equipo cpw03 por salida MRU. 8:23 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:14:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "7:14hr sale de linea equipo cpw07 por salida MRU. 8:20 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:14:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "7:33hr sale de linea equipo cpw05 por parada manual entra en portencia inversa y falla en la gobernación. 8:09 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:33:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "7:31hr sale de linea equipo cpw06 sale de linea por sobrecarga. 7:46 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:31:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "11:30hr sale de linea equipo cpw010 a solicitud de ccm por baja presion de gas cyc",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "12:48hr equipo cpw-12 ingresa en linea, alineado con gas CYC. En modo reparto de carga",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 12:48:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-29",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "12:19:00 p. m. Sale de linea equipo CPW05 por sd alta temperatura HT, Se evidencia actuador Sauter sin su capuchon de proteccion. 12:25:00 p. m. equipo ingresa en linea.",
        "downtimeHours": 0.1,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 12:19:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-29",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "12:50:00 p. m. A solicitud del CCM, ingresa en linea equipo Jinan-10 con gas CYC.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 12:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-29",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "14:27:00 p. m. sale de linea equipo CPW01, personal de la empresa Confipetrol realiza maniobras de alineación gas CYC, por el lavado del scrubber CYC y MQT, en el programa AXION se",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:27:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-29",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "14:34:00 p.m. hrs A solicitud del CCM, sale de línea Equipo CPW-12 parada manual por caída de presión de gas CYC.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:34:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-30",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "7:11:00 a. m salen de linea equipos Cpw01-02-03-07 por salida de MRU, equipos en stan by disponibles por por mtto programado de la MRU.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:11:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-30",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "7:28:00 a. m. ingresa en linea CPW011, por solicitud de ccm por mantnimiento programado de la MRU. 10:10:00 hrs A solicitud del CCM, salen de línea equipo CPW11, ingresa en línea M",
        "downtimeHours": 2,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:28:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-30",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "7:41:00 a. m. ingresa en linea CPW012, por solicitud de ccm por mantnimiento programado de la MRU.10:10 hrs A solicitud del CCM, salen de línea equipo CPW12, ingresa en línea MRU e",
        "downtimeHours": 2,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:41:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-06-30",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "09:21:00 hrs en coordinación con CCM sale de línea equipo CPW05, Maniobra para presurizar Tanques GLP. 10:14:00 hrs en coordinación con CCM ingresa en línea equipo CPW05, finaliza ",
        "downtimeHours": 0.88,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:21:00 GMT-0456 (Colombia Standard Time)"
      }
    ],
    "consumos": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      }
    ],
    "kpi": {
      "availability": 0.987238,
      "reliability": 0.987238,
      "maintainability": null,
      "generationMwh": 4236.56,
      "operationalLossesMwh": null,
      "contractualCompliance": null
    }
  },
  "Jul": {
    "label": "Julio 2026",
    "sourceFile": "data/Datos COPOWER/Reporte_Diario_Costayaco_Vonu 2026 actualizado 34.xlsx",
    "summary": {
      "copowerFailures": 53,
      "totalEvents": 174,
      "mtbfHours": 39.32,
      "mttrHours": null,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 4365,
      "hoursStandby": 1796,
      "hoursPreventive": 219,
      "hoursCorrective": 0,
      "hoursFailureCopower": 0,
      "hoursFailureClient": 0,
      "energyGasKwh": 2403700,
      "energyDieselKwh": 99083
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 2141999,
        "dieselKwh": 99083
      },
      {
        "asset": "Vonu",
        "gasKwh": 261701,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 239664,
        "horasOperacion": 364,
        "horasStandBy": 19,
        "horasPP": 41,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 27
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 230452,
        "horasOperacion": 349,
        "horasStandBy": 31,
        "horasPP": 44,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 8
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 219897,
        "horasOperacion": 343,
        "horasStandBy": 20,
        "horasPP": 60,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 9
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 246612,
        "horasOperacion": 341,
        "horasStandBy": 67,
        "horasPP": 18,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 16
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 317085,
        "horasOperacion": 389,
        "horasStandBy": 37,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 5
      },
      {
        "equipo": "CPW06",
        "campo": "COSTAYACO",
        "energiaKwh": 322370,
        "horasOperacion": 392,
        "horasStandBy": 33,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 3
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 136837,
        "horasOperacion": 339,
        "horasStandBy": 81,
        "horasPP": 6,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 2
      },
      {
        "equipo": "JIN-11",
        "campo": "COSTAYACO",
        "energiaKwh": 103392,
        "horasOperacion": 277,
        "horasStandBy": 140,
        "horasPP": 9,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 2
      },
      {
        "equipo": "CPW07",
        "campo": "COSTAYACO",
        "energiaKwh": 253746,
        "horasOperacion": 391,
        "horasStandBy": 33,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 7
      },
      {
        "equipo": "JIN-12",
        "campo": "COSTAYACO",
        "energiaKwh": 71944,
        "horasOperacion": 196,
        "horasStandBy": 220,
        "horasPP": 10,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 3
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 59633,
        "horasOperacion": 80,
        "horasStandBy": 346,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 28105,
        "horasOperacion": 40,
        "horasStandBy": 380,
        "horasPP": 6,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 0
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 11345,
        "horasOperacion": 37,
        "horasStandBy": 389,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 144159,
        "horasOperacion": 413,
        "horasStandBy": 0,
        "horasPP": 13,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 1
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 117542,
        "horasOperacion": 414,
        "horasStandBy": 0,
        "horasPP": 12,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 426,
        "fallaEvento": 2
      }
    ],
    "totalGenerationKwh": 2502783,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 19,
        "disponibilidadPct": 89.91,
        "confiabilidadPct": 89.91,
        "fallas": 27,
        "mtbfLabel": "13.48",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 364 h · FS 0 h"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 31,
        "disponibilidadPct": 89.2,
        "confiabilidadPct": 89.2,
        "fallas": 8,
        "mtbfLabel": "43.63",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 349 h · FS 0 h"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 20,
        "disponibilidadPct": 85.21,
        "confiabilidadPct": 85.21,
        "fallas": 9,
        "mtbfLabel": "38.11",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 343 h · FS 0 h"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 67,
        "disponibilidadPct": 95.77,
        "confiabilidadPct": 95.77,
        "fallas": 16,
        "mtbfLabel": "21.31",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 341 h · FS 0 h"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 37,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 5,
        "mtbfLabel": "77.8",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 389 h · FS 0 h"
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 33,
        "disponibilidadPct": 99.77,
        "confiabilidadPct": 99.77,
        "fallas": 3,
        "mtbfLabel": "130.67",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 392 h · FS 0 h"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 81,
        "disponibilidadPct": 98.59,
        "confiabilidadPct": 98.59,
        "fallas": 2,
        "mtbfLabel": "169.5",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 339 h · FS 0 h"
      },
      {
        "unidad": "JIN-11",
        "campo": "COSTAYACO",
        "horasStandBy": 140,
        "disponibilidadPct": 97.89,
        "confiabilidadPct": 97.89,
        "fallas": 2,
        "mtbfLabel": "138.5",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 277 h · FS 0 h"
      },
      {
        "unidad": "CPW07",
        "campo": "COSTAYACO",
        "horasStandBy": 33,
        "disponibilidadPct": 99.53,
        "confiabilidadPct": 99.53,
        "fallas": 7,
        "mtbfLabel": "55.86",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 391 h · FS 0 h"
      },
      {
        "unidad": "JIN-12",
        "campo": "COSTAYACO",
        "horasStandBy": 220,
        "disponibilidadPct": 97.65,
        "confiabilidadPct": 97.65,
        "fallas": 3,
        "mtbfLabel": "65.33",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 196 h · FS 0 h"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 346,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 80 h · FS 0 h"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 380,
        "disponibilidadPct": 98.59,
        "confiabilidadPct": 98.59,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 40 h · FS 0 h"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 389,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 37 h · FS 0 h"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 0,
        "disponibilidadPct": 96.95,
        "confiabilidadPct": 96.95,
        "fallas": 1,
        "mtbfLabel": "413",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 413 h · FS 0 h"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 0,
        "disponibilidadPct": 97.18,
        "confiabilidadPct": 97.18,
        "fallas": 2,
        "mtbfLabel": "207",
        "mttrHours": null,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Fuente COPOWER Resumen OP · OP 414 h · FS 0 h"
      }
    ],
    "eventLog": [
      {
        "date": "2026-07-03",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "19:00 CPW-10 sale de linea a peticion de CCM para priorizar gas CYC a la MRU",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 19:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-03",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "20:00:00 hrs sale de linea equipo CPW04, A solicitud de CCM por baja presión de gas MQT. 22:02:00 hrs ingresa en linea equipo CPW04, A solicitud de CCM se estabiliza presión de gas",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 20:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-04",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "Se baja nominal a 900 kw, equipos cpw-04 ,06 y 06, para estabilizar presión gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 03:46:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-04",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "Se realiza cambio de aplicativo cpw05 reparto de carga a carga base La señal de gov del DEIF está mandando a bajar la potencia del equipo y está sobrecargando los demás equipos.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 18:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-05",
        "equipment": "JIN-02",
        "eventType": "Falla",
        "cause": "04:49:00 hrs sale de línea parada manual equipo JINAN-02, por mantenimiento preventivo programado.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 04:49:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-06",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "22:23:00 hrs ingresa en línea CPW-04, alineado con gas MQT.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 22:23:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-06",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "22:47:00 hrs sale de linea por petición de ccm Equipo cpw11, ingrea en linea equipo cpw04.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 22:47:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-06",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "22:49::00 hrs sale de linea por petición de ccm Equipo cpw12 por solocitud de ccm.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · 22.49"
      },
      {
        "date": "2026-07-06",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "23:21:00 hrs solicitud de CCM salen equipos CPW-11 CPW-12 de linea y ingresa CPW-02 alineada con gas tratado MRU",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 23:21:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-07",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "00:34:00 A petición de CCM se deslastran 300KW deslastrando 100KW a cada equipo CPW04, CPW05 y CPW06para recuperar presion de MQT al momento en 144ps",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 00:34:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-07",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "05:00 hrs A petición de CCM, se normaliza carga en los equipos alineados con gas MQT, CPW04, CPW05 ,Y CPW06.149 PSI gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 05:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-07",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "20.15 hrs A petición de CCM se deslastran 300KW deslastrando 100KW a cada equipo para recuperar presion de MQT al momento en 115psi",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 20:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-08",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "01:40:00 hrs en coordinación con CCM se deslastran 50KW a equipo JINAN-01 para recuperar presion de gas CYC19 al momento en 7 psi.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 01:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-08",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "18:20 Se deslatras carga nominal a equipos con gas moqueta por baja presion hasta recuperar presion 900 KW -19:20 se normaliza nominal en equipos a 950KW",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 18:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "Ingresa en linea con 750 KW modo carga base",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 00:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "Se realiza deslastre de carga Nominal a equipos asociados con gas Moqueta para recuperar presión de gas moqueta 125psi a petición de operador de CCM",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 02:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "ingresan en linea equipos con gas MRU CPW01,02,03 y 07",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 18:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "SLD equipo CPW-04 por baja presion de gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 21:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "ingresa equipo CPW-04 en linea con 800KW",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 23:45:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "apertura de RL",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 22:06:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "SLD JINAN-12 por apertura de RL",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 22:06:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "Parada manual a equipo CPW-05 por baja carga y baja presion en gas MQT 85PSI",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 22:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "SDL equipo CPW-07 por apertura de RL",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 22:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-01",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "08:00 hrs equipo COW012 inicia mantenimiento programdo M0, 16:38 ingresa equipo a linea modo reparto de carga",
        "downtimeHours": 8,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-01",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "11:57hrs equipo cpw01 sale de linea por salida MRU, ingresa a linea 13:25 modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 11:57:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-01",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "11:57hrs equipo cpw02 sale de linea por salida MRU, ingresa a linea 13:25 modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 11:57:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-01",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "11:57hrs equipo cpw03 sale de linea por salida MRU, ingresa a linea 13:28 modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 11:57:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-01",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "11:57hrs equipo cpw07 sale de linea por salida MRU, ingresa a linea 13:30 modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 11:57:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-01",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "12:25hrs equipo G102J ingresa a linea por solicitud de ccm, 14:00hr sale equipo de linea a solicitud de ccm",
        "downtimeHours": 2,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 12:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-01",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "14:05hrs equipo cpw011 ingresa a linea por solicitud de CCM, 16:30 sale de linea para ingresar el equipo cpw012 por finalizacion de mantenimiento",
        "downtimeHours": 2,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:05:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-02",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "6:35hrs equipo cpw012 sale de linea a solicitud de CCM por baja presion de gas CYC",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:35:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-02",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "8:51 hrs equipo G102K inicia mantenimiento programado, 14:00 hr finaliza mantenimiento",
        "downtimeHours": 5,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:51:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-02",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "8:51hrs equipo cpw011 inicia mantenimiento programado 17:00 hr finaliza mantenimiento",
        "downtimeHours": 8,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:51:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-02",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "10:00 hrs equipo cpw010 sale de linea por solicitud de CCM por baja presion de gas CYC, 12:15 hrs equipo ingresa a linea en modo reparto de carga",
        "downtimeHours": 2,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-02",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "11:30 hrs equipo cpw05 se deslastra carga y queda en vacio por solicitud de CCM por maniobra en sistema de inyeccion, 11:45 hr asume carga de nuevo equipo,",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-02",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "13:55 hrs equipo cpw06 sale de linea a solicitud de CCM por baja presion de gas MQT, 15:08 hrs equipo ingresa a linea a solicitud de CCM",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 13:55:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-02",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "14:08hrs equipo cpw05 sale de linea a solicitud de CCM por baja presion de gas MQT, 14:25 hrs equipo ingresa a linea a solicitud de CCM",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:08:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-02",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "14:08hrs equipo G102K ingresa en linea a solicitud de CCM como respaldo por baja presion de gas MQT,15:15 hrs sale de linea a solicitud de CCM",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:08:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-02",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "17:20 equipo cpw011 ingresa a linea en modo reparto de carga, 23:18 hrs sale de línea equipo CPW011 parada manual por baja presión de gas CYC, equipo en stand by disponible.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-03",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "9:20 hrs sale equipo Jinan 01 por mantenimiento programado, 16:00 hrs ingresa equipo a linea.",
        "downtimeHours": 6,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-03",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "11:30 hrs sale de linea equipo cpw05 a solicitud de ccm por baja presion de gas MQT, 13:25 hrs ingresa a linea en modo reparto de carga",
        "downtimeHours": 2,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-03",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "11:30 hrs ingresa de linea equipo G102J a solicitud de ccm por baja presion de gas MQT, 13:38 hrs sale de linea",
        "downtimeHours": 2,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-03",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "12:36 hrs sale de linea equipo cpw010 a solicitud de ccm por baja presion de gas cyc 10 psi, 13:45 hrs ingresa a linea en modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 12:36:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-04",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "6:00 hrs equipo G101V ingresa a linea a solicitud de ccm como respaldo por apertura del RL, 6:40 hrs sale de linea.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-04",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "6:18 hrs equipo G102J ingresa a linea a solicitud de ccm como respaldo por apertura del RL, 6:40 hrs sale de linea.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:18:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-04",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "6:18 hrs equipo G102K ingresa a linea a solicitud de ccm como respaldo por apertura del RL, 7:05 hrs sale de linea.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:18:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-04",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "9:56 hrs equipo CPW011 ingresa a linea a solicitud de ccm en modo reparto de carga con gas MRU",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:56:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-04",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "ingresa en linea equipos a DIESEL G102J y G102K",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 13:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-04",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "SDL equipo CPW-07 por sobre carga en generador",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 13:35:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-04",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "SDL equipo CPW-06 por sobre carga en generador",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 13:37:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-04",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "ingresa en campo en modo operación con el sin",
        "downtimeHours": 4,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-05",
        "equipment": "JIN-02",
        "eventType": "Falla",
        "cause": "04:49:00 hrs sale de línea parada manual equipo JINAN-02, por mantenimiento preventivo programado. 17:40:00 hrs ingresa en línea equipo cpw-02, se finalizó intervención mantenimien",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 04:49:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-05",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "07:00 hrs a solicitud de CCM se baja nominal de los generadores asociados a gas MQT por baja presion 115 psi.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-05",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "ingresan equipos G102J y G102k por salida de el RL",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 13:18:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-05",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "Sale de linea equipos CPW01 CPW02 CPW03 CPW07 e ingresa en linea equipo G101V como respaldo",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 13:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-05",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "ingresan de linea equipos CPW01 CPW02 CPW03 CPW07 e ingresa en linea equipo G101V como respaldo",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-05",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "Salen equipos G102J y G102k por salida de el RL",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-06",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "Ingresa G102J en en respaldo de equipo CPW-04 que sale a mantenimiento. 22:23:00 hrs ingresa en línea CPW-04, alineado con gas MQT.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-06",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "se cambia a gas MQT a equipo CPW02 e ingresa equipo jinan-10 con gas MRU. 23:21:00 hrs ingresa en linea alinado con gas MRU.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-06",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "SDL equipo G102J e ingresa equio Jinan-12",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-06",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "SDL equipo Jinan-12 por lluvias en la zona",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 14:17:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-06",
        "equipment": "JIN-12",
        "eventType": "Falla",
        "cause": "ingresa en linea equipo jinan-12 y sale de linea CPW-02 por baja presion en linea de MQT presion en 93PSI",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 16:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-07",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "6:20 salen de linea equipos asociados a gas MRU+chiler CPW01,CPW02,CPW03,CPW07.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-07",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "6:40 hrs EQUIPO G102J y EQUIPO G102K Ingresan en linea como respaldo por salida de equipos asociados a gas suministro MRU+chiler",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día ·  6:40"
      },
      {
        "date": "2026-07-07",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "07:20 hrs EQUIPO G101V Ingresa en linea como respaldo por salida de equipos asociados a gas suministro MRU+chiler",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día ·  7:20"
      },
      {
        "date": "2026-07-07",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "8:40 ingresa en linea equipo CPW02 alineado MRU+chiler.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-07",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "8:42 ingresa en linea equipo CPW07 alineado MRU+chiler.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:42:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-07",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "8:45 ingresa en linea equipo CPW03 alineado MRU+chiler.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:45:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-07",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "08:50 hrs EQUIPO G102K sale de linea pareada manual por Ingreso equipos con gas tratado MRU+chiller.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-07",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "9:12 ingresa en linea equipo CPW011 alineado MRU+chiler.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:12:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-07",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "9:16 ingresa en linea equipo CPW012 alineado MRU+chiler.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:16:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-07",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "9:15 hrs EQUIPO G102J sale de linea pareada manual por Ingreso equipos con gas tratado MRU+chiller.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-07",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "9:20 hrs EQUIPO G101V sale de linea pareada manual por Ingreso equipos con gas tratado MRU+chiller.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-08",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "EQUIPO: G102J, A solicitud del CCM, ingresa en linea por mantenimiento semanal de la MRU. FDL a las15:35 horas.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-08",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "CPW 03, A solicitud del CCM, FDL por mantenimiento semanal de la MRU. Ingresa a las 14:58 horas",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:29:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-08",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "G102K, A solicitud del CCM, ingresa en linea por mantenimiento semanal de la MRU. FDL a las15:40 horas.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:35:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-08",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "EQUIPO: G101V, A solicitud del CCM, ingresa en linea por mantenimiento semanal de la MRU. FDL a las 15:08 horas.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:43:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-08",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW 02, A solicitud del CCM, FDL por mantenimiento semanal de la MRU. Ingresa a las 14:50 horas.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:46:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-08",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW 07, A solicitud del CCM, FDL por mantenimiento semanal de la MRU. Ingresa a las 15:35 horas",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-08",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW 10 & 11, A solicitud del CCM, FDL por mantenimiento semanal de la MRU.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:55:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-08",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "EQUIPO: CPW 10 & 11, A solicitud del CCM, ingresan en línea con suministro de gas CYC",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-01-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 16:01 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:13:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-02-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 10:49 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:13:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-03-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 10:44 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:13:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-07-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 11:14 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:13:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-06-FDL al momento de salida de la MRU alto nivel de GLP en el recipiente. Presenta alta potencia de Reactiva, Ingresa a las 10:25 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 09:13:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-01-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 16:01 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 17:08:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-02-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 18:49 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 17:08:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-03-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 18:44 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 17:08:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-09",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-07-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 18:49 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 17:08:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-10",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-01-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 08:59 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:37:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-10",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-02-FDL por salida de la MRU alto nivel de GLP en el recipiente. Entra a mantenimiento",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:37:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-10",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-03-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 09:03 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:37:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-10",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-07-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 09:26 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 07:37:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-10",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "EQUIPO: Jinan-10, 11 & 12. a solicitud del CCM, pasan a operar con gas tratato Ingresa a las 10:10 horas",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:33:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-11",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Se presenta FDL del equipo G54, se revisa con el lider de MANTTO y personal de CONTROL, se encontro alta restriccion en la presion del MAP, se evalua carga minima para mantener en ",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 12:09:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-12",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-01-FDL por salida de la MRU. Motivo de salida: baja presión de lubricación de aceite compresor Quincy.. Ingresa a las 07:33 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 05:28:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-12",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-03-FDL por salida de la MRU. Motivo de salida: baja presión de lubricación de aceite compresor Quincy.. Ingresa a las 07:16 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 05:28:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-12",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-07-FDL por salida de la MRU. Motivo de salida: baja presión de lubricación de aceite compresor Quincy.. Ingresa a las 08:00 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 05:28:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-12",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "EQUIPO: JINAN-10-FDL por salida de la MRU. Motivo de salida: baja presión de lubricación de aceite compresor Quincy.. Ingresa a las 07:36 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 05:28:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-12",
        "equipment": "JIN-11",
        "eventType": "Falla",
        "cause": "EQUIPO: JINAN-11-FDL por salida de la MRU. Motivo de salida: baja presión de lubricación de aceite compresor Quincy.. Ingresa a las 07:56 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 05:28:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-12",
        "equipment": "JIN-12",
        "eventType": "Falla",
        "cause": "EQUIPO: JINAN-12-FDL por salida de la MRU. Motivo de salida: baja presión de lubricación de aceite compresor Quincy.. Ingresa a las 07:58 horas",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 05:28:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-12",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-04, parada manual a solicitud del CCM, para recuperar presion de gas Moqueta, ingresa en linea a las 11:01 horas",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:55:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-12",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "EQUIPO: G102K, entra en linea como respaldo por FDL de la MRU, sale de operación a las 07:48",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 05:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-12",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "EQUIPO: G101V, entra en linea como respaldo por FDL de la MRU, sale de operación a las 08:05",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 05:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-12",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "EQUIPO: G102J, entra en linea como respaldo por FDL de la MRU, sale de operación a las 08:10",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 05:35:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-12",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "EQUIPO: Jinan-10, Motivo de salida: A solicitud del CCM, por caída de presión en gas Costayaco. Ingresa a las 15:06",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:53:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-12",
        "equipment": "JIN-11",
        "eventType": "Falla",
        "cause": "EQUIPO: Jinan-11, Motivo de salida: A solicitud del CCM, por caída de presión en gas Costayaco. Ingresa a las 15:13",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:48:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-12",
        "equipment": "JIN-12",
        "eventType": "Falla",
        "cause": "EQUIPO: Jinan-12, Motivo de salida: A solicitud del CCM, por caída de presión en gas Costayaco. Ingresa a las 15:14",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:46:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "08:00 hrs equipo cpw03 sale de linea por mantenimiento programado.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "22:06 FDL SIN, FDL sistema inyección.EEP reporta disparo línea 34.5 Kv subestación Junin Mocoa.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 22:04:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "08:00 hrs equipo cpw01 se realiza cambio de gas MRU a gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "Parada manual de equipo cpw05 por baja presaion de gas moqueta 80 psi",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 22:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "09:10 hrs equipo G102J ingresa a linea a solicitud de CCM por parada de equipos por baja presion de gas CYC",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "sale delinea equipo cpw07 por sobrecarga",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 22:06:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "09:15 hrs equipos cpw011 y cpw012 salen de linea por solicitud de CCM por baja presion de gas CYC",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "sale de linea equipo cpw12 por potencia inversa",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 22:06:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "09:40 hrs equipo cpw010 sale de linea por solicitud de CCM por baja presion de gas CYC",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "14:00 hrs equipo cpw010 ingresa a linea a solicitud de CCM en modo reparto de carga con gas MRU",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "14:00 hrs equipo cpw011 ingresa a linea a solicitud de CCM en modo reparto de carga con gas MRU",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "14:23 hrs equipo G102J sale de linea a solicitud de CCM",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:23:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-13",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "14:30 hrs se baja nominal a 900Kw a generadores cpw05 y 06 a solicitud de CCM por baja presion de gas MQT 120 psi",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-14",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "06:30 hrs parada manual equipo cpw04 a solicitud de ccm por baja presion gas MQT 116 psi",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-14",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "21:40 hrs ingresa equipo cpw04 a solicitud de CCM por baja presion gas MQT 120 psi",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 21:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-14",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "08:30 hrs generador diesel G102K ingresa a linea a solicitud de ccm como respaldo por parada MRU por mantenimiento semanal",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-14",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "08:38 hrs generadores cpw010 y 011 parada manual para realizar cambio de gas MRU a gas CYC a solicitud de CCM por mantenimineto semanal MRU, ingresan a linea a las 08:58 hrs",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:38:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-14",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "09:05 hrs parada manual equipo cpw02 a solicitud de CCM por parada MRU por mantenimiento semanal,",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:05:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-14",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "9:09 hrs parada manual equipo cpw07 a solicitud de CCM por parada MRU por mantenimiento semanal",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 09:09:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-14",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "12:17hrs ingresa a linea generador CPW04 a solicitud de CCM por incremento en presion de gas MQT 160 psi",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 12:17:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-14",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "12:25hrs parada manual generador diesel G102K a solicitud de CCM por ingreso de generador CPW04",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 12:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-14",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "14:39 hrs ingresa equipo CPW02 en linea a solicitud de CCM con gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 14:39:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-14",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "15:39 hrs parada manual equipo cpw04 a solicitud de CCM por baja presion gas MQT 120 psi",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 15:39:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-14",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "17:03 hrs parada manual equipo cpw02 a solicitud de CCM por baja presion de gas MQT 113 PSI",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:03:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "08:05 hrs parada manual equipo cpw010 por mantenimiento programado, Finaliza mantenimiento a las 15:00 esquipo queda en stanbay",
        "downtimeHours": 7,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:05:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "sale de linea equipos CPW11 ingresacon gas tratado MRU 2:51",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 00:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "8:29 hrs parada manual por cambio de gas MQT a gas MRU, por baja presion de gas MQT 120 psi, equipo ingresa a linea a las 08:45 hrs con gas MRU modo carga base",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:29:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "sale de linea equipos CPW12 ingresacon gas tratado MRU 2:57",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 00:10:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "8:30 hrs equuipo cpw04 parada manual a solicitud de ccm por baja presion de gas MQT 120 psi, ingresa a linea a las 10:14 hrs",
        "downtimeHours": 2,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "sale de linea equipos CPW10 ingresacon gas tratado MRU 2:49",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 02:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "14:15 hrs generador diesel G102J ingresa a linea como respaldo maniobra de la turbina, sale de linea a las 14:50 hrs",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 14:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "sale de linea equipo cpw04 por baja presion de gas moqueta 120 psi--ingresa en linea cpw04 160 psi 4:50",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 02:54:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "14:15 hrs generador diesel G102k ingresa a linea como respaldo maniobra de la turbina, sale de linea a las 14:50 hrs",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 14:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "EQUIPO: Jinan-10, A solicitud del CCM entra en linea con suministro de gas tratado.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 20:21:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "Parque",
        "eventType": "Falla",
        "cause": "14:25 hrs generador diesel G102k ingresa a linea como respaldo maniobra de la turbina, sale de linea a las 14:48 hrs",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 14:25:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Se ingresa en linea el equipo G53, queda en modo carga base con 600 Kw, pendiente realizar ajuste fino en mezcla y control.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 22:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "17:20 hrs ingresa en linea en pruebas generador CPW03 modo carga base con gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-15",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "sale de linea equipo cpw04 por baja presion de gas moqueta 125 psi",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Noche · Sat Dec 30 1899 23:01:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-16",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "06:54 hrs a solicitud del CCM FDL equipo CPW-04 por estabilidad de presión de gas Moqueta, 120 PSI, ingresa a linea a las 08:32 hrs a solicitud de CCM por salida de generador CPW01",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 06:54:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-16",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "EQUIPO: CPW-04. A solicitud del CCM FDL por estabilidad de presión del gas Moqueta, 165PSI",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 02:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-16",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "08:50 hrs generador CPW01 inicia intervencion con personal de PAC para configuracion control DEIF aplicativo utility Software, ingresa en linea a las 10:34 hrs en modo reparto de c",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 08:50:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-16",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "08:58 hrs sale de línea, parada manual equipo JINAN-01, por mantenimiento preventivo programado.",
        "downtimeHours": 7,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:58:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-16",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "10:07 hrs generador CPW02 inicia intervencion con personal de PAC para configuracion control DEIF aplicativo utility Software, ingresa en linea a las 10:34 hrs en modo reparto de c",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 10:07:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-16",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "11:13 G102J-G102K, Ingresa en operación generacion diesel a peticion de CCM como respaldo por salida de generadores gas MQT CPW 01- 04-05-06, parada manual al compresor # 2, por au",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:13:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-16",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "11:16 G101V, Ingresa en operación generacion diesel a peticion de CCM como respaldo por salida de generadores gas MQT CPW 01- 04-05-06, parada manual al compresor # 2, por autoriza",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:16:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-16",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "11:20 CPW 01-05-06, parada manual por peticion de CCM compresor # 2, parada manual por autorización del supervisor de producción, suspender envió de gas MQT – CYC. Debido a trabajo",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:20:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-16",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "11:40 CPW 04, parada manual por peticion de CCM compresor # 2, parada manual por autorización del supervisor de producción, suspender envió de gas MQT – CYC. Debido a trabajos real",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 11:40:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "07:00 hrs generador cpw011 parada manual a solicitud de CCM por baja presion gas CYC",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "00:16 horas EQUIPO: CPW04, FDL A solicitud del CCM, por baja presión del gas Moqueta 120 PSI. Ingresa a las 03:38 horas.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Noche · Sat Dec 30 1899 00:16:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "07:00 hrs generador cpw012 parada manual a solicitud de CCM por baja presion gas CYC, ingresa a linea a las 08:34 hrs",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:00:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "07:15 hrs generador CPW04 parada manual a solicitud de CCM por baja presion de gas MQT 116 PSI. 10:01 hrs A petición de CCM equipo ingresa en línea, alineado con gas MQT.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "07:15 hrs generador G101V ingresa a linea a solicitud de CCM como respaldo por salida generador CPW04, sale de linea a las 8:50",
        "downtimeHours": 1,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "08:30 hrs Generador CPW03 inicia intervención de personal de PAC con personal de control COPOWER",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 08:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "12:21 hrs se realiza deslastre de carga 200 kw equipos asociados a gas MQT, CPW05 y CPW06, por caida de presión de gas Moqueta 125 PSI.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 12:21:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "13:08 hrs Equipo CPW03 FDL parada manual a solicitud de CCM por baja presion de gas MQT 115 PSI.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 13:08:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "16:30 CPW-04 a solicitud del CCM parada manual por baja presión gas MQT 63 psi.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 16:30:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "16:39 CPW-05 a solicitud del CCM parada manual por baja presión gas MQT 63 psi.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 16:39:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "16:42 CPW-06 a solicitud del CCM parada manual por baja presión gas MQT 63 psi.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 16:42:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "16:54 G102K ingresa equipo diesel a peticion de CCM reapaldo caida presion linea gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 16:54:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "16:57 CPW-03 a solicitud del CCM parada manual por baja presión gas MQT 50 psi.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 16:57:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW02",
        "eventType": "Falla",
        "cause": "17:03 CPW-02 salde de linea por detonacion no sincroniza.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "Día · Sat Dec 30 1899 17:03:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "17:22 CPW-03 ingresa en linea rotacion por la CPW-02 alineada con gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:22:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "17:15 G101V a solicitud del CCM equipo Diesel ingresa como respaldo caida presion linea gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-17",
        "equipment": "Parque",
        "eventType": "Operativo",
        "cause": "17:15 G102J a solicitud del CCM equipo Diesel ingresa como respaldo caida presion linea gas MQT",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 17:15:00 GMT-0456 (Colombia Standard Time)"
      },
      {
        "date": "2026-07-18",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "07:00 CPW-04 se adelanta intervencion programada de cambio intercooler por novedad linea gas MQT, 15:00 hrs se finaliza intervención equipo CPW-04.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "Día · Sat Dec 30 1899 07:00:00 GMT-0456 (Colombia Standard Time)"
      }
    ],
    "consumos": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "adicionAceite": 0,
        "cambioAceite": 0,
        "adicionCoolant": 0
      }
    ],
    "kpi": {
      "availability": 0.965674,
      "reliability": 0.965674,
      "maintainability": null,
      "generationMwh": 2502.78,
      "operationalLossesMwh": null,
      "contractualCompliance": null
    }
  },
};

export const COPOWER_KPI_FROM_MONTHS: KpiRow[] = COPOWER_MONTH_ORDER.map((month) => ({
  month,
  ...COPOWER_MONTHLY_DATA[month].kpi,
}));
