import type { EventRecord, GenerationAssetRow, GenerationByEquipmentRow, KpiRow, MachineIndicatorRow, SummaryMetrics } from "../types";

export type GranTierraMonthKey = "Ene" | "Feb" | "Mar" | "Abr" | "May" | "Jun";

export type GranTierraMonthlySnapshot = {
  label: string;
  sourceFile: string;
  summary: SummaryMetrics;
  generationByAsset: GenerationAssetRow[];
  generationByEquipment: GenerationByEquipmentRow[];
  totalGenerationKwh: number;
  machineIndicators: MachineIndicatorRow[];
  eventLog: EventRecord[];
  kpi: Omit<KpiRow, "month">;
};

export const GRAN_TIERRA_MONTH_ORDER: GranTierraMonthKey[] = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];

export const GRAN_TIERRA_MONTHLY_DATA: Record<GranTierraMonthKey, GranTierraMonthlySnapshot> = {
  "Ene": {
    "label": "Enero",
    "sourceFile": "data/GTE/Enero/Data Soporte Cálculo Copower PUTN Enero 2026 (8).xlsx",
    "summary": {
      "copowerFailures": 6,
      "totalEvents": 9,
      "mtbfHours": 1121.67,
      "mttrHours": 0.33,
      "actionsOverdue": 0,
      "rcaPending": 0,
      "hoursOperated": 6730,
      "hoursStandby": 2166,
      "hoursPreventive": 25,
      "hoursCorrective": 2,
      "hoursFailureCopower": 2,
      "hoursFailureClient": 5,
      "energyGasKwh": 0,
      "energyDieselKwh": 0
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 0,
        "dieselKwh": 0
      },
      {
        "asset": "Vonu",
        "gasKwh": 0,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 713,
        "horasStandBy": 25,
        "horasPP": 4,
        "horasPFContr": 1,
        "horasPFCli": 1,
        "horasCalDia": 744,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 722,
        "horasStandBy": 18,
        "horasPP": 2,
        "horasPFContr": 0,
        "horasPFCli": 2,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 717,
        "horasStandBy": 23,
        "horasPP": 1,
        "horasPFContr": 1,
        "horasPFCli": 2,
        "horasCalDia": 744,
        "fallaEvento": 3
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 631,
        "horasStandBy": 113,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102A",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 424,
        "horasStandBy": 320,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102E",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 146,
        "horasStandBy": 598,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102I",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 463,
        "horasStandBy": 276,
        "horasPP": 5,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 725,
        "horasStandBy": 19,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 687,
        "horasStandBy": 53,
        "horasPP": 4,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 0,
        "horasOperacion": 555,
        "horasStandBy": 188,
        "horasPP": 1,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 0,
        "horasOperacion": 557,
        "horasStandBy": 179,
        "horasPP": 8,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 2
      },
      {
        "equipo": "JIN-03",
        "campo": "VONU",
        "energiaKwh": 0,
        "horasOperacion": 390,
        "horasStandBy": 354,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 0,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 25,
        "disponibilidadPct": 99.19,
        "confiabilidadPct": 99.87,
        "fallas": 1,
        "mtbfLabel": "713.00",
        "mttrHours": 1,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 18,
        "disponibilidadPct": 99.46,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 23,
        "disponibilidadPct": 99.46,
        "confiabilidadPct": 99.87,
        "fallas": 3,
        "mtbfLabel": "239.00",
        "mttrHours": 0.33,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 113,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102A",
        "campo": "COSTAYACO",
        "horasStandBy": 320,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102E",
        "campo": "COSTAYACO",
        "horasStandBy": 598,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102I",
        "campo": "COSTAYACO",
        "horasStandBy": 276,
        "disponibilidadPct": 99.33,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 19,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 53,
        "disponibilidadPct": 99.46,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 188,
        "disponibilidadPct": 99.87,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 179,
        "disponibilidadPct": 98.92,
        "confiabilidadPct": 100,
        "fallas": 2,
        "mtbfLabel": "278.50",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "JIN-03",
        "campo": "VONU",
        "horasStandBy": 354,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "COSTAYACO",
        "horasStandBy": 1445,
        "disponibilidadPct": 99.66,
        "confiabilidadPct": 99.97,
        "fallas": 4,
        "mtbfLabel": "1307.00",
        "mttrHours": 0.5,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "VONU",
        "horasStandBy": 721,
        "disponibilidadPct": 99.6,
        "confiabilidadPct": 100,
        "fallas": 2,
        "mtbfLabel": "751.00",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE"
      }
    ],
    "eventLog": [
      {
        "date": "2026-01-30",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-01-29",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-01-29",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-01-29",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 2,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-01-25",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-01-24",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 5 h"
      },
      {
        "date": "2026-01-17",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-01-16",
        "equipment": "JIN-02",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 24 h"
      },
      {
        "date": "2026-01-08",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      }
    ],
    "kpi": {
      "availability": 0.9964,
      "reliability": 0.9998,
      "maintainability": 0.9997,
      "generationMwh": 0,
      "operationalLossesMwh": 0,
      "contractualCompliance": 0
    }
  },
  "Feb": {
    "label": "Febrero",
    "sourceFile": "data/GTE/Febrero/Data Soporte Cálculo Copower PUTN Febrero 2026 (3).xlsx",
    "summary": {
      "copowerFailures": 4,
      "totalEvents": 6,
      "mtbfHours": 1490,
      "mttrHours": 4.25,
      "actionsOverdue": 0,
      "rcaPending": 0,
      "hoursOperated": 5960,
      "hoursStandby": 3396,
      "hoursPreventive": 30,
      "hoursCorrective": 17,
      "hoursFailureCopower": 17,
      "hoursFailureClient": 5,
      "energyGasKwh": 0,
      "energyDieselKwh": 0
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 0,
        "dieselKwh": 0
      },
      {
        "asset": "Vonu",
        "gasKwh": 0,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 611,
        "horasStandBy": 58,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 3,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 634,
        "horasStandBy": 38,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 617,
        "horasStandBy": 53,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 2,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 552,
        "horasStandBy": 103,
        "horasPP": 0,
        "horasPFContr": 17,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 4
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 629,
        "horasStandBy": 43,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 293,
        "horasStandBy": 379,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "G102A",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 226,
        "horasStandBy": 446,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "G102E",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 187,
        "horasStandBy": 485,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "G102I",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 425,
        "horasStandBy": 247,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 319,
        "horasStandBy": 349,
        "horasPP": 4,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 256,
        "horasStandBy": 416,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 0,
        "horasOperacion": 613,
        "horasStandBy": 59,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 0,
        "horasOperacion": 587,
        "horasStandBy": 59,
        "horasPP": 26,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-03",
        "campo": "VONU",
        "energiaKwh": 0,
        "horasOperacion": 11,
        "horasStandBy": 661,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 672,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 0,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 58,
        "disponibilidadPct": 99.55,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 38,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 53,
        "disponibilidadPct": 99.7,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 103,
        "disponibilidadPct": 97.47,
        "confiabilidadPct": 97.47,
        "fallas": 4,
        "mtbfLabel": "138.00",
        "mttrHours": 4.25,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 43,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 379,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102A",
        "campo": "COSTAYACO",
        "horasStandBy": 446,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102E",
        "campo": "COSTAYACO",
        "horasStandBy": 485,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102I",
        "campo": "COSTAYACO",
        "horasStandBy": 247,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 349,
        "disponibilidadPct": 99.4,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 416,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 59,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 59,
        "disponibilidadPct": 96.13,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "NO CUMPLE"
      },
      {
        "unidad": "JIN-03",
        "campo": "VONU",
        "horasStandBy": 661,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "COSTAYACO",
        "horasStandBy": 2617,
        "disponibilidadPct": 99.65,
        "confiabilidadPct": 99.77,
        "fallas": 4,
        "mtbfLabel": "1187.25",
        "mttrHours": 4.25,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "VONU",
        "horasStandBy": 779,
        "disponibilidadPct": 98.71,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      }
    ],
    "eventLog": [
      {
        "date": "2026-02-20",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 3,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-02-20",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 2,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-02-09",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 8,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-02-08",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 5,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-02-07",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 2,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-02-03",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 2,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      }
    ],
    "kpi": {
      "availability": 0.9945,
      "reliability": 0.9982,
      "maintainability": 0.9972,
      "generationMwh": 0,
      "operationalLossesMwh": 0,
      "contractualCompliance": 0
    }
  },
  "Mar": {
    "label": "Marzo",
    "sourceFile": "data/GTE/Marzo/Data Soporte Cálculo Copower PUTN Marzo 2026 (8).xlsx",
    "summary": {
      "copowerFailures": 9,
      "totalEvents": 32,
      "mtbfHours": 682.49,
      "mttrHours": 20.4,
      "actionsOverdue": 0,
      "rcaPending": 0,
      "hoursOperated": 6142.42,
      "hoursStandby": 3507,
      "hoursPreventive": 53,
      "hoursCorrective": 183.58,
      "hoursFailureCopower": 183.58,
      "hoursFailureClient": 50,
      "energyGasKwh": 0,
      "energyDieselKwh": 0
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 0,
        "dieselKwh": 0
      },
      {
        "asset": "Vonu",
        "gasKwh": 0,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 686,
        "horasStandBy": 24,
        "horasPP": 9,
        "horasPFContr": 6,
        "horasPFCli": 19,
        "horasCalDia": 744,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 713,
        "horasStandBy": 8,
        "horasPP": 10,
        "horasPFContr": 0,
        "horasPFCli": 13,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 719,
        "horasStandBy": 10,
        "horasPP": 7,
        "horasPFContr": 0,
        "horasPFCli": 8,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 733.4166666666667,
        "horasStandBy": 5,
        "horasPP": 0,
        "horasPFContr": 5.583333333333333,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 5
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 726,
        "horasStandBy": 2,
        "horasPP": 12,
        "horasPFContr": 4,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 2
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 172,
        "horasStandBy": 572,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102A",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 77,
        "horasStandBy": 663,
        "horasPP": 4,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102E",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 109,
        "horasStandBy": 635,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102I",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 196,
        "horasStandBy": 548,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 233,
        "horasStandBy": 511,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 161,
        "horasStandBy": 415,
        "horasPP": 0,
        "horasPFContr": 168,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 1
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 0,
        "horasOperacion": 675,
        "horasStandBy": 56,
        "horasPP": 11,
        "horasPFContr": 0,
        "horasPFCli": 2,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 0,
        "horasOperacion": 685,
        "horasStandBy": 57,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 2,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 257,
        "horasStandBy": 1,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 6,
        "horasCalDia": 264,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 0,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 24,
        "disponibilidadPct": 95.43,
        "confiabilidadPct": 99.19,
        "fallas": 1,
        "mtbfLabel": "686.00",
        "mttrHours": 6,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "NO CUMPLE"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 8,
        "disponibilidadPct": 96.91,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "NO CUMPLE"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 10,
        "disponibilidadPct": 97.98,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 5,
        "disponibilidadPct": 99.25,
        "confiabilidadPct": 99.25,
        "fallas": 5,
        "mtbfLabel": "146.68",
        "mttrHours": 1.12,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 2,
        "disponibilidadPct": 97.85,
        "confiabilidadPct": 99.46,
        "fallas": 2,
        "mtbfLabel": "363.00",
        "mttrHours": 2,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 572,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102A",
        "campo": "COSTAYACO",
        "horasStandBy": 663,
        "disponibilidadPct": 99.46,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102E",
        "campo": "COSTAYACO",
        "horasStandBy": 635,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102I",
        "campo": "COSTAYACO",
        "horasStandBy": 548,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 511,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 415,
        "disponibilidadPct": 77.42,
        "confiabilidadPct": 77.42,
        "fallas": 1,
        "mtbfLabel": "161.00",
        "mttrHours": 168,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "NO CUMPLE"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 56,
        "disponibilidadPct": 98.25,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 57,
        "disponibilidadPct": 99.73,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 1,
        "disponibilidadPct": 97.73,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "COSTAYACO",
        "horasStandBy": 3394,
        "disponibilidadPct": 96.79,
        "confiabilidadPct": 97.83,
        "fallas": 9,
        "mtbfLabel": "531.38",
        "mttrHours": 20.4,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "NO CUMPLE"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "VONU",
        "horasStandBy": 113,
        "disponibilidadPct": 98.99,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      }
    ],
    "eventLog": [
      {
        "date": "2026-03-31",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 3,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-31",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 3,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-31",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 3,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-31",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 3,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-31",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 2,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-31",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 2,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-29",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-29",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-29",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-29",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-28",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 7,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-28",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 8,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-27",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 6,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-27",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 2,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-27",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 3,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-27",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 3,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-25",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-25",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-24",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 3,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-22",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 6,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-18",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-17",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-16",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 2,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-15",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-15",
        "equipment": "G102K",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 24,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-14",
        "equipment": "G102K",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 24,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-13",
        "equipment": "G102K",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 24,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-12",
        "equipment": "G102K",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 24,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-11",
        "equipment": "G102K",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 24,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-10",
        "equipment": "G102K",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 24,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-09",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 0.58,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-03-09",
        "equipment": "G102K",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 24,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      }
    ],
    "kpi": {
      "availability": 0.9712,
      "reliability": 0.9815,
      "maintainability": 0.971,
      "generationMwh": 0,
      "operationalLossesMwh": 0,
      "contractualCompliance": 0
    }
  },
  "Abr": {
    "label": "Abril",
    "sourceFile": "data/GTE/Abril /Data Soporte Cálculo Copower PUTN Abril 2026.xlsx",
    "summary": {
      "copowerFailures": 6,
      "totalEvents": 13,
      "mtbfHours": 1037.83,
      "mttrHours": 6.5,
      "actionsOverdue": 0,
      "rcaPending": 0,
      "hoursOperated": 6227,
      "hoursStandby": 4139,
      "hoursPreventive": 79,
      "hoursCorrective": 39,
      "hoursFailureCopower": 39,
      "hoursFailureClient": 28,
      "energyGasKwh": 3363296,
      "energyDieselKwh": 286034
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 2941284,
        "dieselKwh": 286034
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
        "energiaKwh": 442752,
        "horasOperacion": 676,
        "horasStandBy": 23,
        "horasPP": 13,
        "horasPFContr": 2,
        "horasPFCli": 6,
        "horasCalDia": 720,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 461380,
        "horasOperacion": 700,
        "horasStandBy": 15,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 5,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 451979,
        "horasOperacion": 700,
        "horasStandBy": 14,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 6,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 492891,
        "horasOperacion": 570,
        "horasStandBy": 141,
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
        "fallaEvento": 1
      },
      {
        "equipo": "CPW06",
        "campo": "COSTAYACO",
        "energiaKwh": 347712,
        "horasOperacion": 404,
        "horasStandBy": 9,
        "horasPP": 3,
        "horasPFContr": 16,
        "horasPFCli": 0,
        "horasCalDia": 432,
        "fallaEvento": 2
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 23685,
        "horasOperacion": 69,
        "horasStandBy": 651,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "G102A",
        "campo": "COSTAYACO",
        "energiaKwh": 27511,
        "horasOperacion": 79,
        "horasStandBy": 641,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "G102E",
        "campo": "COSTAYACO",
        "energiaKwh": 28738,
        "horasOperacion": 82,
        "horasStandBy": 638,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "G102I",
        "campo": "COSTAYACO",
        "energiaKwh": 39681,
        "horasOperacion": 115,
        "horasStandBy": 605,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 60947,
        "horasOperacion": 82,
        "horasStandBy": 638,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 105472,
        "horasOperacion": 141,
        "horasStandBy": 579,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 208756,
        "horasOperacion": 684,
        "horasStandBy": 3,
        "horasPP": 13,
        "horasPFContr": 14,
        "horasPFCli": 6,
        "horasCalDia": 720,
        "fallaEvento": 2
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 213256,
        "horasOperacion": 702,
        "horasStandBy": 8,
        "horasPP": 6,
        "horasPFContr": 0,
        "horasPFCli": 4,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 250742,
        "horasOperacion": 649,
        "horasStandBy": 35,
        "horasPP": 35,
        "horasPFContr": 0,
        "horasPFCli": 1,
        "horasCalDia": 720,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 3649330,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 23,
        "disponibilidadPct": 97.08,
        "confiabilidadPct": 99.72,
        "fallas": 1,
        "mtbfLabel": "676.00",
        "mttrHours": 2,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 15,
        "disponibilidadPct": 99.31,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 14,
        "disponibilidadPct": 99.17,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 141,
        "disponibilidadPct": 98.75,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 139,
        "disponibilidadPct": 99.03,
        "confiabilidadPct": 99.03,
        "fallas": 1,
        "mtbfLabel": "574.00",
        "mttrHours": 7,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 9,
        "disponibilidadPct": 95.6,
        "confiabilidadPct": 96.3,
        "fallas": 2,
        "mtbfLabel": "202.00",
        "mttrHours": 8,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "NO CUMPLE"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 651,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102A",
        "campo": "COSTAYACO",
        "horasStandBy": 641,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102E",
        "campo": "COSTAYACO",
        "horasStandBy": 638,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102I",
        "campo": "COSTAYACO",
        "horasStandBy": 605,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 638,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 579,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 3,
        "disponibilidadPct": 95.42,
        "confiabilidadPct": 98.06,
        "fallas": 2,
        "mtbfLabel": "342.00",
        "mttrHours": 7,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "NO CUMPLE"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 8,
        "disponibilidadPct": 98.61,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 35,
        "disponibilidadPct": 95,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "NO CUMPLE"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "COSTAYACO",
        "horasStandBy": 4128,
        "disponibilidadPct": 98.86,
        "confiabilidadPct": 99.72,
        "fallas": 4,
        "mtbfLabel": "1210.25",
        "mttrHours": 6.25,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "VONU",
        "horasStandBy": 11,
        "disponibilidadPct": 97.01,
        "confiabilidadPct": 99.03,
        "fallas": 2,
        "mtbfLabel": "693.00",
        "mttrHours": 7,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE"
      }
    ],
    "eventLog": [
      {
        "date": "2026-04-28",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 12,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-04-24",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 13,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-04-22",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-04-21",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 2,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 5 h"
      },
      {
        "date": "2026-04-18",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 7,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-04-18",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 4,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-04-14",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-04-14",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 6,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-04-14",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 4,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-04-12",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-04-06",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 6,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-04-06",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 5,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-04-06",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 5,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      }
    ],
    "kpi": {
      "availability": 0.9861,
      "reliability": 0.9963,
      "maintainability": 0.9938,
      "generationMwh": 3649.33,
      "operationalLossesMwh": 85.563,
      "contractualCompliance": 0.9123
    }
  },
  "May": {
    "label": "Mayo",
    "sourceFile": "data/GTE/Mayo/Data Soporte Cálculo Copower PUTN Mayo 2026.xlsx",
    "summary": {
      "copowerFailures": 7,
      "totalEvents": 12,
      "mtbfHours": 500.39,
      "mttrHours": 5.32,
      "actionsOverdue": 0,
      "rcaPending": 0,
      "hoursOperated": 6141.75,
      "hoursStandby": 3262,
      "hoursPreventive": 31,
      "hoursCorrective": 66.25,
      "hoursFailureCopower": 66.25,
      "hoursFailureClient": 3,
      "energyGasKwh": 3737160,
      "energyDieselKwh": 217947
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 3415843,
        "dieselKwh": 217947
      },
      {
        "asset": "Vonu",
        "gasKwh": 321317,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 471917,
        "horasOperacion": 711,
        "horasStandBy": 24,
        "horasPP": 5,
        "horasPFContr": 4,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 477675,
        "horasOperacion": 726,
        "horasStandBy": 18,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 478517,
        "horasOperacion": 723,
        "horasStandBy": 21,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 529307,
        "horasOperacion": 652,
        "horasStandBy": 62,
        "horasPP": 0,
        "horasPFContr": 30,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 4
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 582181,
        "horasOperacion": 690.75,
        "horasStandBy": 50,
        "horasPP": 0,
        "horasPFContr": 3.25,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 2
      },
      {
        "equipo": "CPW06",
        "campo": "COSTAYACO",
        "energiaKwh": 659082,
        "horasOperacion": 708,
        "horasStandBy": 27,
        "horasPP": 9,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 42884,
        "horasOperacion": 127,
        "horasStandBy": 617,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102A",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 0,
        "horasStandBy": 192,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 192,
        "fallaEvento": 0
      },
      {
        "equipo": "G102E",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 0,
        "horasStandBy": 192,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 192,
        "fallaEvento": 0
      },
      {
        "equipo": "G102I",
        "campo": "COSTAYACO",
        "energiaKwh": 0,
        "horasOperacion": 0,
        "horasStandBy": 192,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 192,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 52230,
        "horasOperacion": 69,
        "horasStandBy": 675,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 122833,
        "horasOperacion": 163,
        "horasStandBy": 581,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 217961,
        "horasOperacion": 629,
        "horasStandBy": 84,
        "horasPP": 8,
        "horasPFContr": 20,
        "horasPFCli": 3,
        "horasCalDia": 744,
        "fallaEvento": 1
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 103356,
        "horasOperacion": 318,
        "horasStandBy": 424,
        "horasPP": 0,
        "horasPFContr": 2,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 1
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 217164,
        "horasOperacion": 625,
        "horasStandBy": 103,
        "horasPP": 9,
        "horasPFContr": 7,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 1
      }
    ],
    "totalGenerationKwh": 3955107,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 24,
        "disponibilidadPct": 98.79,
        "confiabilidadPct": 99.46,
        "fallas": 1,
        "mtbfLabel": "711.00",
        "mttrHours": 4,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 18,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 21,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 62,
        "disponibilidadPct": 95.97,
        "confiabilidadPct": 95.97,
        "fallas": 4,
        "mtbfLabel": "163.00",
        "mttrHours": 7.5,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "NO CUMPLE"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 50,
        "disponibilidadPct": 99.56,
        "confiabilidadPct": 99.56,
        "fallas": 2,
        "mtbfLabel": "345.38",
        "mttrHours": 1.63,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 27,
        "disponibilidadPct": 98.79,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 617,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102A",
        "campo": "COSTAYACO",
        "horasStandBy": 192,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102E",
        "campo": "COSTAYACO",
        "horasStandBy": 192,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102I",
        "campo": "COSTAYACO",
        "horasStandBy": 192,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 675,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 581,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 84,
        "disponibilidadPct": 95.83,
        "confiabilidadPct": 97.31,
        "fallas": 1,
        "mtbfLabel": "629.00",
        "mttrHours": 20,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "NO CUMPLE"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 424,
        "disponibilidadPct": 99.73,
        "confiabilidadPct": 99.73,
        "fallas": 1,
        "mtbfLabel": "318.00",
        "mttrHours": 2,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 103,
        "disponibilidadPct": 97.85,
        "confiabilidadPct": 99.06,
        "fallas": 1,
        "mtbfLabel": "625.00",
        "mttrHours": 7,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "COSTAYACO",
        "horasStandBy": 2754,
        "disponibilidadPct": 99.16,
        "confiabilidadPct": 99.45,
        "fallas": 8,
        "mtbfLabel": "649.34",
        "mttrHours": 5.53,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "CUMPLE"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "VONU",
        "horasStandBy": 508,
        "disponibilidadPct": 97.78,
        "confiabilidadPct": 98.52,
        "fallas": 2,
        "mtbfLabel": "473.50",
        "mttrHours": 11,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE"
      }
    ],
    "eventLog": [
      {
        "date": "2026-05-24",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 5,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 8 h"
      },
      {
        "date": "2026-05-24",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 0.25,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 10 h"
      },
      {
        "date": "2026-05-19",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 4,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 6 h"
      },
      {
        "date": "2026-05-13",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 6,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-05-13",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 3,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-05-12",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 17,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-05-08",
        "equipment": "JIN-02",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 2,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-05-05",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 2,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-05-05",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 7,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-05-04",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 10,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-05-03",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 10,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h"
      },
      {
        "date": "2026-05-02",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "Evento reportado en soporte mensual",
        "downtimeHours": 3,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h"
      }
    ],
    "kpi": {
      "availability": 0.9288,
      "reliability": 0.9405,
      "maintainability": 0.9893,
      "generationMwh": 3955.107,
      "operationalLossesMwh": 64.558,
      "contractualCompliance": 0.9888
    }
  },
  "Jun": {
    "label": "Junio",
    "sourceFile": "data/GTE/Junio/Data Soporte Cálculo Copower PUTN Junio 2026 (1).xlsx",
    "summary": {
      "copowerFailures": 7,
      "totalEvents": 38,
      "mtbfHours": 711.57,
      "mttrHours": 2.86,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 6907,
      "hoursStandby": 3128,
      "hoursPreventive": 28,
      "hoursCorrective": 20,
      "hoursFailureCopower": 20,
      "hoursFailureClient": 189,
      "energyGasKwh": 3499840.246,
      "energyDieselKwh": 119716
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 3499840.246,
        "dieselKwh": 119716
      },
      {
        "asset": "Vonu",
        "gasKwh": 490588,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 356623.378,
        "horasOperacion": 572,
        "horasStandBy": 60,
        "horasPP": 0,
        "horasPFContr": 2,
        "horasPFCli": 86,
        "horasCalDia": 720,
        "fallaEvento": 2
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 394125.269,
        "horasOperacion": 652,
        "horasStandBy": 43,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 25,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 379616.662,
        "horasOperacion": 607,
        "horasStandBy": 83,
        "horasPP": 4,
        "horasPFContr": 5,
        "horasPFCli": 21,
        "horasCalDia": 720,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 565298.149,
        "horasOperacion": 708,
        "horasStandBy": 7,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 5,
        "horasCalDia": 720,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 567694.181,
        "horasOperacion": 699,
        "horasStandBy": 8,
        "horasPP": 7,
        "horasPFContr": 1,
        "horasPFCli": 5,
        "horasCalDia": 720,
        "fallaEvento": 2
      },
      {
        "equipo": "CPW06",
        "campo": "COSTAYACO",
        "energiaKwh": 540992.6070000001,
        "horasOperacion": 667,
        "horasStandBy": 45,
        "horasPP": 0,
        "horasPFContr": 7,
        "horasPFCli": 1,
        "horasCalDia": 720,
        "fallaEvento": 3
      },
      {
        "equipo": "CPW07",
        "campo": "COSTAYACO",
        "energiaKwh": 386221,
        "horasOperacion": 605,
        "horasStandBy": 90,
        "horasPP": 0,
        "horasPFContr": 5,
        "horasPFCli": 20,
        "horasCalDia": 720,
        "fallaEvento": 1
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 15967,
        "horasOperacion": 24,
        "horasStandBy": 696,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 49726,
        "horasOperacion": 63,
        "horasStandBy": 657,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 54023,
        "horasOperacion": 76,
        "horasStandBy": 644,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 257713,
        "horasOperacion": 701,
        "horasStandBy": 12,
        "horasPP": 6,
        "horasPFContr": 0,
        "horasPFCli": 1,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 232875,
        "horasOperacion": 697,
        "horasStandBy": 6,
        "horasPP": 7,
        "horasPFContr": 0,
        "horasPFCli": 10,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 172764,
        "horasOperacion": 471,
        "horasStandBy": 230,
        "horasPP": 4,
        "horasPFContr": 0,
        "horasPFCli": 15,
        "horasCalDia": 720,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-11",
        "campo": "COSTAYACO",
        "energiaKwh": 54249,
        "horasOperacion": 140,
        "horasStandBy": 316,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 456,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-12",
        "campo": "COSTAYACO",
        "energiaKwh": 82256,
        "horasOperacion": 225,
        "horasStandBy": 231,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 456,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 4110144.246,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 146,
        "disponibilidadPct": 99.72,
        "confiabilidadPct": 99.72,
        "fallas": 1,
        "mtbfLabel": "572.00",
        "mttrHours": 2,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Tuvo 2 salidas en el Excel; 1 fue imputada al cliente (6/07) y no cuenta"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 68,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin eventos en el mes"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 104,
        "disponibilidadPct": 98.75,
        "confiabilidadPct": 99.31,
        "fallas": 1,
        "mtbfLabel": "607.00",
        "mttrHours": 5,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Evento único, mayor MTTR del grupo de un evento"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 12,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Tuvo 1 salida en el Excel (6/23) pero fue imputada al cliente, no cuenta"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 13,
        "disponibilidadPct": 98.89,
        "confiabilidadPct": 99.86,
        "fallas": 1,
        "mtbfLabel": "699.00",
        "mttrHours": 1,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Tuvo 2 salidas en el Excel; 1 fue imputada al cliente (6/23) y no cuenta"
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 46,
        "disponibilidadPct": 99.03,
        "confiabilidadPct": 99.03,
        "fallas": 3,
        "mtbfLabel": "222.33",
        "mttrHours": 2,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE",
        "detalle": "Activo dominante del mes: 3 fallas imputables (6/03, 6/27, 6/28), todas contractuales"
      },
      {
        "unidad": "CPW07",
        "campo": "COSTAYACO",
        "horasStandBy": 110,
        "disponibilidadPct": 99.31,
        "confiabilidadPct": 99.31,
        "fallas": 1,
        "mtbfLabel": "605.00",
        "mttrHours": 5,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Evento del 6/27, mismo incidente de red que afectó a CPW06"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 245,
        "disponibilidadPct": 99.44,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin eventos correctivos"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 696,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Unidad diésel, sin eventos"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 657,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Unidad diésel, sin eventos"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 644,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Unidad diésel, sin eventos"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 13,
        "disponibilidadPct": 99.17,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin fallas; Vonu recupera 100%"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 16,
        "disponibilidadPct": 99.03,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin fallas; Vonu recupera 100%"
      },
      {
        "unidad": "JIN-11",
        "campo": "COSTAYACO (excluida del sistémico)",
        "horasStandBy": null,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Evaluada individual, en estabilización (ventana ~19 días); no se suma al Sistema N"
      },
      {
        "unidad": "JIN-12",
        "campo": "COSTAYACO (excluida del sistémico)",
        "horasStandBy": null,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "N/A",
        "detalle": "Evaluada individual, en estabilización (ventana ~19 días); no se suma al Sistema N"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "COSTAYACO",
        "horasStandBy": 744,
        "disponibilidadPct": 97.92,
        "confiabilidadPct": 97.92,
        "fallas": 7,
        "mtbfLabel": "711.57",
        "mttrHours": 2.86,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE",
        "detalle": "Mejora vs. mayo (+5.04pp Disp., +3.87pp Conf.), mismos 7 eventos que mayo pero menor severidad"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "VONU",
        "horasStandBy": 29,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Recuperación plena vs. mayo (95.97%/97.04%)"
      }
    ],
        "eventLog": [
      {
        "date": "2026-06-28",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "7:14hr sale de linea equipo cpw07 por salida MRU. 8:20 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 0"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "7:31hr sale de linea equipo cpw06 sale de linea por sobrecarga. 7:46 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 1 h | PF_cli 0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "7:33hr sale de linea equipo cpw05 por parada manual entra en portencia inversa y falla en la gobernación. 8:09 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 1 h | PF_cli 0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "7:14hr sale de linea equipo cpw03 por salida MRU. 8:23 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 0"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "7:14hr sale de linea equipo cpw02 por salida MRU. 8:26 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 0"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "7:14hr sale de linea equipo cpw01 por salida MRU. 8:28 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 0"
      },
      {
        "date": "2026-06-27",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "FDL equipos G56 & 57, se presenta perturbacion en la red generando elevacion del voltaje y potencia reactiva de los generadores CPW06 & 07, los cuales salen de linea, el voltaje...",
        "downtimeHours": 5,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 5 h | PF_cli 0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-27",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "FDL equipos G56 & 57, se presenta perturbacion en la red generando elevacion del voltaje y potencia reactiva de los generadores CPW06 & 07, los cuales salen de linea, el voltaje...",
        "downtimeHours": 2,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 2 h | PF_cli 0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-26",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "01:00 FDL generación a gas CPW 01-02-03-04-05-06-07- Jinan 10 por disparo de C9 y reconectador RX por sobrecorriente. FDL. 13:26:00 p. m. se coordina con CCM se realiza el apaga...",
        "downtimeHours": 3,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 3 h | Falla_evento 0"
      },
      {
        "date": "2026-06-26",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "01:00 FDL generación a gas CPW 01-02-03-04-05-06-07- Jinan 10 por disparo de C9 y reconectador RX por sobrecorriente. FDL. 13:26:00 p. m. se coordina con CCM se realiza el apaga...",
        "downtimeHours": 3,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 3 h | Falla_evento 0"
      },
      {
        "date": "2026-06-26",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "01:00 FDL generación a gas CPW 01-02-03-04-05-06-07- Jinan 10 por disparo de C9 y reconectador RX por sobrecorriente. FDL - Parada Externa - Coordinación por parte de GTE",
        "downtimeHours": 2,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 2 h | Falla_evento 0"
      },
      {
        "date": "2026-06-26",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "01:00 FDL generación a gas CPW 01-02-03-04-05-06-07- Jinan 10 por disparo de C9 y reconectador RX por sobrecorriente. FDL - Parada Externa - Coordinación por parte de GTE",
        "downtimeHours": 2,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 2 h | Falla_evento 0"
      },
      {
        "date": "2026-06-26",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "01:00 FDL generación a gas CPW 01-02-03-04-05-06-07- Jinan 10 por disparo de C9 y reconectador RX por sobrecorriente. FDL - Parada Externa - Coordinación por parte de GTE",
        "downtimeHours": 2,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 2 h | Falla_evento 0"
      },
      {
        "date": "2026-06-25",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "11:30:00 a. m. salen de lienas equipos CPW001,CPW002,CPW003,CPW007,CPW010 y CPW011, por protección parada MRU. Sale MRU de operación por activación de nivel alto en tanque de NG...",
        "downtimeHours": 12,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 12 h | Falla_evento 0"
      },
      {
        "date": "2026-06-25",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "11:30:00 a. m. salen de lienas equipos CPW001,CPW002,CPW003,CPW007,CPW010 y CPW011, por protección parada MRU. Sale MRU de operación por activación de nivel alto en tanque de NG...",
        "downtimeHours": 12,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 12 h | Falla_evento 0"
      },
      {
        "date": "2026-06-25",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "11:30:00 a. m. salen de lienas equipos CPW001,CPW002,CPW003,CPW007,CPW010 y CPW011, por protección parada MRU. Sale MRU de operación por activación de nivel alto en tanque de NG...",
        "downtimeHours": 11,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 11 h | Falla_evento 0"
      },
      {
        "date": "2026-06-25",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "11:30:00 a. m. salen de lienas equipos CPW001,CPW002,CPW003,CPW007,CPW010 y CPW011, por protección parada MRU. Sale MRU de operación por activación de nivel alto en tanque de NG...",
        "downtimeHours": 12,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 12 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "10:43 hrs equipo jinan 2 en coordinación con CCM sale de línea equipo Jinan 02 por mantenimiento cyc 19. 16:20 hr equipo ingresa a linea",
        "downtimeHours": 6,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 6 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "8:19 hrs equipo cpw07 en coordinación con CCM , sale de línea equipos cpw alineados con gas MRU+CHILLER, causa corrección fuga de aceite en sistema QUINCY. 10:13 hrs ingresa a l...",
        "downtimeHours": 6,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 6 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas, 8:16 hrs equipo cpw01 en coord...",
        "downtimeHours": 6,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 6 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas, 8:11 hrs equipo cpw02 en coord...",
        "downtimeHours": 11,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 11 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas, 8:16 hrs equipo cpw01 en coord...",
        "downtimeHours": 6,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 6 h | Falla_evento 0"
      },
      {
        "date": "2026-06-23",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "8:10 pm 4 horas en stanby por daño en tuberia de cyc 19 inicia nuevamente a las 11:52 pm",
        "downtimeHours": 4,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 4 h | Falla_evento 0"
      },
      {
        "date": "2026-06-23",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "se presentan dos salidas en las cuales se abre el totalizador principal de tablero de auxiliares 480V-Pendiente verificar reprote de configuración de protecciónes",
        "downtimeHours": 2,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 2 h | Falla_evento 1"
      },
      {
        "date": "2026-06-23",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "se presentan dos salidas en las cuales se abre el totalizador principal de tablero de auxiliares 480V-Pendiente verificar reprote de configuración de protecciónes",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 1"
      },
      {
        "date": "2026-06-11",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "Sale por detonación equipo 15/06 sin reporte de falla.",
        "downtimeHours": 5,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 5 h | PF_cli 0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-10",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "14:20 hrs Parada manual equipo CPW07 por protección presenta altas vivraciones y se nota alta oscilación de carga al pasar la turbina a diesel se informa a CCM. 14:50 hrs Ingres...",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 0"
      },
      {
        "date": "2026-06-09",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Equipos entregado a GTE para inicio de arranque sobre las 15:00 se realiza verifiación y pruebas de magnetización de equipo.",
        "downtimeHours": 10,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 9 h | PF_contr 0 h | PF_cli 10 h | Falla_evento 0"
      },
      {
        "date": "2026-06-08",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Sale de linea equipo CPW010, 18:30 Se informa equipo disponible para magnetizar transformador 5MVA. Se solicita por Copower realizar el arranque al dia siguiente debido a falta ...",
        "downtimeHours": 5,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 19 h | PF_contr 0 h | PF_cli 5 h | Falla_evento 0"
      },
      {
        "date": "2026-06-07",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "FDL por SD detonación. Se evidencia en las tendencias de operación del equipo caída de presión de gas.se realiza cambio de base y rele k4, alimentación válvula shutoff suministr...",
        "downtimeHours": 3,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 3 h | Falla_evento 1"
      },
      {
        "date": "2026-06-06",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "Sale de línea equipo JINAN-01 parada manual, se realizará cambio de válvula 3/4\" por parte de Confipetrol Tiempo estimado 1 hora.",
        "downtimeHours": 1,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 0"
      },
      {
        "date": "2026-06-05",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "Sale para mantenimiento correctivo por exostacion del dia 2-06-2026, al momento de iniciar en linea el cual nos produjo daño en la integridad de el equipo, afectando el flexible...",
        "downtimeHours": 2,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 2 h | PF_cli 0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-04",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Hora de operación posterior a el mantenimiento debido a daño en el tren de admision.",
        "downtimeHours": 23,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 23 h | Falla_evento 0"
      },
      {
        "date": "2026-06-03",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "Cambio de intercooler por exceso de reciduo de secuestrante. Pendiente reporte de fallo.",
        "downtimeHours": 4,
        "responsible": "COPOWER",
        "notes": "PP 0 h | StandBy 6 h | PF_contr 4 h | PF_cli 0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-03",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Falla en el sistema de admision.",
        "downtimeHours": 24,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 24 h | Falla_evento 0"
      },
      {
        "date": "2026-06-02",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Sale para mantenimiento semanal de MRU posteriormente presenta detonación al momento de iniciar en línea, el cual nos produjo daño en la integridad de el equipo. Pendiente proce...",
        "downtimeHours": 15,
        "responsible": "Cliente",
        "notes": "PP 0 h | StandBy 0 h | PF_contr 0 h | PF_cli 15 h | Falla_evento 0"
      }
    ],
    "kpi": {
      "availability": 0.9792,
      "reliability": 0.9792,
      "maintainability": 0.86,
      "generationMwh": 4110.144,
      "operationalLossesMwh": 141.031,
      "contractualCompliance": 1.0
    }
  }
};

export const GRAN_TIERRA_KPI_FROM_MONTHS: KpiRow[] = GRAN_TIERRA_MONTH_ORDER.map((month) => ({
  month,
  ...GRAN_TIERRA_MONTHLY_DATA[month].kpi,
}));
