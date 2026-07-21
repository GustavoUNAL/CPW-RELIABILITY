import type { EventRecord, GenerationAssetRow, GenerationByEquipmentRow, KpiRow, MachineIndicatorRow, SummaryMetrics } from "../types";

export type GranTierraMonthKey = "Ene" | "Feb" | "Mar" | "Abr" | "May" | "Jun";

export type ExcelTrendKpi = {
  availability: number | null;
  reliability: number | null;
  mtbfHours: number | null;
  mttrHours: number | null;
};

export type GranTierraMonthlySnapshot = {
  label: string;
  sourceFile: string;
  summary: SummaryMetrics;
  generationByAsset: GenerationAssetRow[];
  generationByEquipment: GenerationByEquipmentRow[];
  totalGenerationKwh: number;
  machineIndicators: MachineIndicatorRow[];
  eventLog: EventRecord[];
  /** Oficial cuando existe (May/Jun); si no, estimado Excel Costayaco. */
  kpi: Omit<KpiRow, "month">;
  /** Serie continua estimada desde Excel (Costayaco, PF_contr) para tendencias. */
  kpiExcel: ExcelTrendKpi;
};

export const GRAN_TIERRA_MONTH_ORDER: GranTierraMonthKey[] = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];

export const GRAN_TIERRA_MONTH_LABELS: Record<GranTierraMonthKey, string> = {
  Ene: "Enero",
  Feb: "Febrero",
  Mar: "Marzo",
  Abr: "Abril",
  May: "Mayo",
  Jun: "Junio",
};

export function granTierraMonthLabel(month: GranTierraMonthKey): string {
  return GRAN_TIERRA_MONTH_LABELS[month];
}

/** Datos por mes desde data/GTE. May/Jun: KPIs oficiales de informe; Ene–Abr: estimados Excel. */
export const GRAN_TIERRA_MONTHLY_DATA: Record<GranTierraMonthKey, GranTierraMonthlySnapshot> = {
  "Ene": {
    "label": "Enero",
    "sourceFile": "data/GTE/Enero/Data Soporte Cálculo Copower PUTN Enero 2026 (8).xlsx",
    "summary": {
      "copowerFailures": 4,
      "totalEvents": null,
      "mtbfHours": 1307.0,
      "mttrHours": 0.5,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 6730.0,
      "hoursStandby": 2166.0,
      "hoursPreventive": 25.0,
      "hoursCorrective": 2.0,
      "hoursFailureCopower": 2.0,
      "hoursFailureClient": 5.0,
      "energyGasKwh": 0.0,
      "energyDieselKwh": 0.0
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 0.0,
        "dieselKwh": 0.0
      },
      {
        "asset": "Vonu",
        "gasKwh": 0.0,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 713.0,
        "horasStandBy": 25.0,
        "horasPP": 4.0,
        "horasPFContr": 1.0,
        "horasPFCli": 1.0,
        "horasCalDia": 0.0,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 722.0,
        "horasStandBy": 18.0,
        "horasPP": 2.0,
        "horasPFContr": 0.0,
        "horasPFCli": 2.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 717.0,
        "horasStandBy": 23.0,
        "horasPP": 1.0,
        "horasPFContr": 1.0,
        "horasPFCli": 2.0,
        "horasCalDia": 0.0,
        "fallaEvento": 3
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 631.0,
        "horasStandBy": 113.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102A",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 424.0,
        "horasStandBy": 320.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102E",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 146.0,
        "horasStandBy": 598.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102I",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 463.0,
        "horasStandBy": 276.0,
        "horasPP": 5.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 725.0,
        "horasStandBy": 19.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 687.0,
        "horasStandBy": 53.0,
        "horasPP": 4.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 0.0,
        "horasOperacion": 555.0,
        "horasStandBy": 188.0,
        "horasPP": 1.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 0.0,
        "horasOperacion": 557.0,
        "horasStandBy": 179.0,
        "horasPP": 8.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 2
      },
      {
        "equipo": "JIN-03",
        "campo": "VONU",
        "energiaKwh": 0.0,
        "horasOperacion": 390.0,
        "horasStandBy": 354.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 0.0,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 25.0,
        "disponibilidadPct": 99.86,
        "confiabilidadPct": 99.86,
        "fallas": 1,
        "mtbfLabel": "713.0",
        "mttrHours": 1.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 18.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 23.0,
        "disponibilidadPct": 99.86,
        "confiabilidadPct": 99.86,
        "fallas": 3,
        "mtbfLabel": "239.0",
        "mttrHours": 0.33,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 113.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102A",
        "campo": "COSTAYACO",
        "horasStandBy": 320.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102E",
        "campo": "COSTAYACO",
        "horasStandBy": 598.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102I",
        "campo": "COSTAYACO",
        "horasStandBy": 276.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 19.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 53.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 188.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 179.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 2,
        "mtbfLabel": "278.5",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-03",
        "campo": "VONU",
        "horasStandBy": 354.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "COSTAYACO",
        "horasStandBy": 1445.0,
        "disponibilidadPct": 99.96,
        "confiabilidadPct": 99.96,
        "fallas": 4,
        "mtbfLabel": "1307.0",
        "mttrHours": 0.5,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel Costayaco/Vonú (PF_contr). Meta sistema ≥98% (Orden 1)"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "VONU",
        "horasStandBy": 721.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 2,
        "mtbfLabel": "751.0",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel Costayaco/Vonú (PF_contr). Meta sistema ≥98% (Orden 1)"
      }
    ],
    "eventLog": [
      {
        "date": "2026-01-30",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-01-29",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-01-29",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-01-29",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 2.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 2.0 h | Falla_evento 0"
      },
      {
        "date": "2026-01-25",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 1.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 1.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-01-24",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 0.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 5.0 h | PF_contr 0.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-01-17",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 0.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-01-16",
        "equipment": "JIN-02",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 0.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 24.0 h | PF_contr 0.0 h | PF_cli 0.0 h | Falla_evento 2"
      },
      {
        "date": "2026-01-08",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 1.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 1.0 h | PF_cli 0.0 h | Falla_evento 1"
      }
    ],
    "kpi": {
      "availability": 0.9996,
      "reliability": 0.9996,
      "maintainability": null,
      "generationMwh": 0,
      "operationalLossesMwh": null,
      "contractualCompliance": 0.9996
    },
    "kpiExcel": {
      "availability": 0.999618,
      "reliability": 0.999618,
      "mtbfHours": 1307.0,
      "mttrHours": 0.5
    }
  },
  "Feb": {
    "label": "Febrero",
    "sourceFile": "data/GTE/Febrero/Data Soporte Cálculo Copower PUTN Febrero 2026 (3).xlsx",
    "summary": {
      "copowerFailures": 4,
      "totalEvents": null,
      "mtbfHours": 1187.25,
      "mttrHours": 4.25,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 5960.0,
      "hoursStandby": 3396.0,
      "hoursPreventive": 30.0,
      "hoursCorrective": 17.0,
      "hoursFailureCopower": 17.0,
      "hoursFailureClient": 5.0,
      "energyGasKwh": 0.0,
      "energyDieselKwh": 0.0
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 0.0,
        "dieselKwh": 0.0
      },
      {
        "asset": "Vonu",
        "gasKwh": 0.0,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 611.0,
        "horasStandBy": 58.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 3.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 634.0,
        "horasStandBy": 38.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 617.0,
        "horasStandBy": 53.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 2.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 552.0,
        "horasStandBy": 103.0,
        "horasPP": 0.0,
        "horasPFContr": 17.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 4
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 629.0,
        "horasStandBy": 43.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 293.0,
        "horasStandBy": 379.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102A",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 226.0,
        "horasStandBy": 446.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102E",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 187.0,
        "horasStandBy": 485.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102I",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 425.0,
        "horasStandBy": 247.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 319.0,
        "horasStandBy": 349.0,
        "horasPP": 4.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 256.0,
        "horasStandBy": 416.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 0.0,
        "horasOperacion": 613.0,
        "horasStandBy": 59.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 0.0,
        "horasOperacion": 587.0,
        "horasStandBy": 59.0,
        "horasPP": 26.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-03",
        "campo": "VONU",
        "energiaKwh": 0.0,
        "horasOperacion": 11.0,
        "horasStandBy": 661.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 0.0,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 58.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 38.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 53.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 103.0,
        "disponibilidadPct": 97.01,
        "confiabilidadPct": 97.01,
        "fallas": 4,
        "mtbfLabel": "138.0",
        "mttrHours": 4.25,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 43.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 379.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102A",
        "campo": "COSTAYACO",
        "horasStandBy": 446.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102E",
        "campo": "COSTAYACO",
        "horasStandBy": 485.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102I",
        "campo": "COSTAYACO",
        "horasStandBy": 247.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 349.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 416.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 59.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 59.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-03",
        "campo": "VONU",
        "horasStandBy": 661.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "COSTAYACO",
        "horasStandBy": 2617.0,
        "disponibilidadPct": 99.64,
        "confiabilidadPct": 99.64,
        "fallas": 4,
        "mtbfLabel": "1187.25",
        "mttrHours": 4.25,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel Costayaco/Vonú (PF_contr). Meta sistema ≥98% (Orden 1)"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "VONU",
        "horasStandBy": 779.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel Costayaco/Vonú (PF_contr). Meta sistema ≥98% (Orden 1)"
      }
    ],
    "eventLog": [
      {
        "date": "2026-02-20",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 3.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 3.0 h | Falla_evento 0"
      },
      {
        "date": "2026-02-20",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 2.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 2.0 h | Falla_evento 0"
      },
      {
        "date": "2026-02-09",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 8.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 8.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-02-08",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 5.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 5.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-02-07",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 2.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 2.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-02-03",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 2.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 2.0 h | PF_cli 0.0 h | Falla_evento 1"
      }
    ],
    "kpi": {
      "availability": 0.9964,
      "reliability": 0.9964,
      "maintainability": null,
      "generationMwh": 0,
      "operationalLossesMwh": null,
      "contractualCompliance": 0.9964
    },
    "kpiExcel": {
      "availability": 0.996433,
      "reliability": 0.996433,
      "mtbfHours": 1187.25,
      "mttrHours": 4.25
    }
  },
  "Mar": {
    "label": "Marzo",
    "sourceFile": "data/GTE/Marzo/Data Soporte Cálculo Copower PUTN Marzo 2026 (8).xlsx",
    "summary": {
      "copowerFailures": 9,
      "totalEvents": null,
      "mtbfHours": 531.38,
      "mttrHours": 20.4,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 6142.42,
      "hoursStandby": 3507.0,
      "hoursPreventive": 53.0,
      "hoursCorrective": 183.58,
      "hoursFailureCopower": 183.58,
      "hoursFailureClient": 50.0,
      "energyGasKwh": 0.0,
      "energyDieselKwh": 0.0
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 0.0,
        "dieselKwh": 0.0
      },
      {
        "asset": "Vonu",
        "gasKwh": 0.0,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 686.0,
        "horasStandBy": 24.0,
        "horasPP": 9.0,
        "horasPFContr": 6.0,
        "horasPFCli": 19.0,
        "horasCalDia": 0.0,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 713.0,
        "horasStandBy": 8.0,
        "horasPP": 10.0,
        "horasPFContr": 0.0,
        "horasPFCli": 13.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 719.0,
        "horasStandBy": 10.0,
        "horasPP": 7.0,
        "horasPFContr": 0.0,
        "horasPFCli": 8.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 733.42,
        "horasStandBy": 5.0,
        "horasPP": 0.0,
        "horasPFContr": 5.58,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 5
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 726.0,
        "horasStandBy": 2.0,
        "horasPP": 12.0,
        "horasPFContr": 4.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 2
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 172.0,
        "horasStandBy": 572.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102A",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 77.0,
        "horasStandBy": 663.0,
        "horasPP": 4.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102E",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 109.0,
        "horasStandBy": 635.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102I",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 196.0,
        "horasStandBy": 548.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 233.0,
        "horasStandBy": 511.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 161.0,
        "horasStandBy": 415.0,
        "horasPP": 0.0,
        "horasPFContr": 168.0,
        "horasPFCli": 0.0,
        "horasCalDia": 0.0,
        "fallaEvento": 1
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 0.0,
        "horasOperacion": 675.0,
        "horasStandBy": 56.0,
        "horasPP": 11.0,
        "horasPFContr": 0.0,
        "horasPFCli": 2.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 0.0,
        "horasOperacion": 685.0,
        "horasStandBy": 57.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 2.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 257.0,
        "horasStandBy": 1.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 6.0,
        "horasCalDia": 0.0,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 0.0,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 24.0,
        "disponibilidadPct": 99.13,
        "confiabilidadPct": 99.13,
        "fallas": 1,
        "mtbfLabel": "686.0",
        "mttrHours": 6.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 8.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 10.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 5.0,
        "disponibilidadPct": 99.24,
        "confiabilidadPct": 99.24,
        "fallas": 5,
        "mtbfLabel": "146.68",
        "mttrHours": 1.12,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 2.0,
        "disponibilidadPct": 99.45,
        "confiabilidadPct": 99.45,
        "fallas": 2,
        "mtbfLabel": "363.0",
        "mttrHours": 2.0,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 572.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102A",
        "campo": "COSTAYACO",
        "horasStandBy": 663.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102E",
        "campo": "COSTAYACO",
        "horasStandBy": 635.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102I",
        "campo": "COSTAYACO",
        "horasStandBy": 548.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 511.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 415.0,
        "disponibilidadPct": 48.94,
        "confiabilidadPct": 48.94,
        "fallas": 1,
        "mtbfLabel": "161.0",
        "mttrHours": 168.0,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "NO CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 56.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 57.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 1.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "COSTAYACO",
        "horasStandBy": 3394.0,
        "disponibilidadPct": 96.3,
        "confiabilidadPct": 96.3,
        "fallas": 9,
        "mtbfLabel": "531.38",
        "mttrHours": 20.4,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "NO CUMPLE",
        "detalle": "Calculado Excel Costayaco/Vonú (PF_contr). Meta sistema ≥98% (Orden 1)"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "VONU",
        "horasStandBy": 113.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel Costayaco/Vonú (PF_contr). Meta sistema ≥98% (Orden 1)"
      }
    ],
    "eventLog": [
      {
        "date": "2026-03-31",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Parada programada por mantenimiento de la MRU",
        "downtimeHours": 3.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 3.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-31",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "sale de linea por mantenimiento de la MRU",
        "downtimeHours": 3.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 3.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-31",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "sale de linea por mantenimiento de la MRU",
        "downtimeHours": 3.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 3.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-31",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Salida de equipos durante parada de la red de distribución interna por falla en R2A & R5B.",
        "downtimeHours": 3.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 3.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-31",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "Salida de equipos durante parada de la red de distribución interna por falla en R2A & R5B.",
        "downtimeHours": 2.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 2.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-31",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "Salida de equipos durante parada de la red de distribución interna por falla en R2A & R5B.",
        "downtimeHours": 2.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 2.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-29",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Salida de MRU al momento de apertura RL",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-29",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "Salida de MRU al momento de apertura RL",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-29",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Salida de MRU al momento de apertura RL",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-29",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "Salida por documentar la causa de parada, no aparece una alarma de falla en el reporte de falla.",
        "downtimeHours": 1.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 1.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-03-28",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Salida mantenimiento de chiller, falla bomba Dinalyne.",
        "downtimeHours": 7.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 7.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-28",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "Salida mantenimiento de chiller, falla bomba Dinalyne.",
        "downtimeHours": 8.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 8.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-27",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "sd parcial de campo por apertura de RL",
        "downtimeHours": 6.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 6.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-27",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "sd parcial de campo por apertura de RL, salida por vector shift. Determinar si este tipo de falla es atribuible a GTE o CPW, no debería protegerse!",
        "downtimeHours": 2.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 2.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-03-27",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "sd parcial de campo por apertura de RL, salida por vector shift. Determinar si este tipo de falla es atribuible a GTE o CPW, no debería protegerse!",
        "downtimeHours": 3.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 3.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-03-27",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "SD parcial de campo por apertura de RL, salida sin documentar en el RF por Copower.",
        "downtimeHours": 3.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 3.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-25",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "07:47 Salen equipos CPW 01, 02, 03, apagando MRU, por bloqueó en válvula de drenaje tanque B.Ingresa CAT # 2 y diésel CPW G102j.",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-25",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "07:47 Salen equipos CPW 01, 02, 03, apagando MRU, por bloqueó en válvula de drenaje tanque B.Ingresa CAT # 2 y diésel CPW G102j.",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-24",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Parada de equipo por mantenimiento de la MRU",
        "downtimeHours": 3.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 3.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-22",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "Falla mixer",
        "downtimeHours": 6.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 6.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-03-18",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "EQIPO SALE POR DETONACION",
        "downtimeHours": 1.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 1.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-03-17",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "FDL por Detonacion subita.",
        "downtimeHours": 1.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 1.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-03-16",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "17:05 @ 19:00 EQUIPOS SALEN POR  FALLA RED ELECTRICA INTERNA , FDL MRU.",
        "downtimeHours": 2.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 2.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-15",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Equipo sale por detonacio a las 14:14 horas y ingresa  siendo las 14:39 horas",
        "downtimeHours": 1.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 1.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-03-15",
        "equipment": "G102K",
        "eventType": "Falla",
        "cause": "Falla en bomba de combustible (Diesel)",
        "downtimeHours": 24.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 24.0 h | PF_cli 0.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-14",
        "equipment": "G102K",
        "eventType": "Falla",
        "cause": "Falla en bomba de combustible (Diesel)",
        "downtimeHours": 24.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 24.0 h | PF_cli 0.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-13",
        "equipment": "G102K",
        "eventType": "Falla",
        "cause": "Falla en bomba de combustible (Diesel)",
        "downtimeHours": 24.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 24.0 h | PF_cli 0.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-12",
        "equipment": "G102K",
        "eventType": "Falla",
        "cause": "Falla en bomba de combustible (Diesel)",
        "downtimeHours": 24.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 24.0 h | PF_cli 0.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-11",
        "equipment": "G102K",
        "eventType": "Falla",
        "cause": "Falla en bomba de combustible (Diesel)",
        "downtimeHours": 24.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 24.0 h | PF_cli 0.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-10",
        "equipment": "G102K",
        "eventType": "Falla",
        "cause": "Falla en bomba de combustible (Diesel)",
        "downtimeHours": 24.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 24.0 h | PF_cli 0.0 h | Falla_evento 0"
      },
      {
        "date": "2026-03-09",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Salida por potencia inversa oscilacion en valvula fisher",
        "downtimeHours": 0.58,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.583333333333333 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-03-09",
        "equipment": "G102K",
        "eventType": "Falla",
        "cause": "Falla en bomba de combustible (Diesel)",
        "downtimeHours": 24.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 24.0 h | PF_cli 0.0 h | Falla_evento 1"
      }
    ],
    "kpi": {
      "availability": 0.963,
      "reliability": 0.963,
      "maintainability": null,
      "generationMwh": 0,
      "operationalLossesMwh": null,
      "contractualCompliance": 0.963
    },
    "kpiExcel": {
      "availability": 0.963033,
      "reliability": 0.963033,
      "mtbfHours": 531.38,
      "mttrHours": 20.4
    }
  },
  "Abr": {
    "label": "Abril",
    "sourceFile": "data/GTE/Abril /Data Soporte Cálculo Copower PUTN Abril 2026.xlsx",
    "summary": {
      "copowerFailures": 4,
      "totalEvents": null,
      "mtbfHours": 1210.25,
      "mttrHours": 6.25,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 6227.0,
      "hoursStandby": 4139.0,
      "hoursPreventive": 79.0,
      "hoursCorrective": 39.0,
      "hoursFailureCopower": 39.0,
      "hoursFailureClient": 28.0,
      "energyGasKwh": 3363296.0,
      "energyDieselKwh": 286034.0
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 2941284.0,
        "dieselKwh": 286034.0
      },
      {
        "asset": "Vonu",
        "gasKwh": 422012.0,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 442752.0,
        "horasOperacion": 676.0,
        "horasStandBy": 23.0,
        "horasPP": 13.0,
        "horasPFContr": 2.0,
        "horasPFCli": 6.0,
        "horasCalDia": 720.0,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 461380.0,
        "horasOperacion": 700.0,
        "horasStandBy": 15.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 5.0,
        "horasCalDia": 720.0,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 451979.0,
        "horasOperacion": 700.0,
        "horasStandBy": 14.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 6.0,
        "horasCalDia": 720.0,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 492891.0,
        "horasOperacion": 570.0,
        "horasStandBy": 141.0,
        "horasPP": 9.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 720.0,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 493828.0,
        "horasOperacion": 574.0,
        "horasStandBy": 139.0,
        "horasPP": 0.0,
        "horasPFContr": 7.0,
        "horasPFCli": 0.0,
        "horasCalDia": 720.0,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW06",
        "campo": "COSTAYACO",
        "energiaKwh": 347712.0,
        "horasOperacion": 404.0,
        "horasStandBy": 9.0,
        "horasPP": 3.0,
        "horasPFContr": 16.0,
        "horasPFCli": 0.0,
        "horasCalDia": 432.0,
        "fallaEvento": 2
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 23685.0,
        "horasOperacion": 69.0,
        "horasStandBy": 651.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 720.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102A",
        "campo": "COSTAYACO",
        "energiaKwh": 27511.0,
        "horasOperacion": 79.0,
        "horasStandBy": 641.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 720.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102E",
        "campo": "COSTAYACO",
        "energiaKwh": 28738.0,
        "horasOperacion": 82.0,
        "horasStandBy": 638.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 720.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102I",
        "campo": "COSTAYACO",
        "energiaKwh": 39681.0,
        "horasOperacion": 115.0,
        "horasStandBy": 605.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 720.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 60947.0,
        "horasOperacion": 82.0,
        "horasStandBy": 638.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 720.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 105472.0,
        "horasOperacion": 141.0,
        "horasStandBy": 579.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 720.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 208756.0,
        "horasOperacion": 684.0,
        "horasStandBy": 3.0,
        "horasPP": 13.0,
        "horasPFContr": 14.0,
        "horasPFCli": 6.0,
        "horasCalDia": 720.0,
        "fallaEvento": 2
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 213256.0,
        "horasOperacion": 702.0,
        "horasStandBy": 8.0,
        "horasPP": 6.0,
        "horasPFContr": 0.0,
        "horasPFCli": 4.0,
        "horasCalDia": 720.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 250742.0,
        "horasOperacion": 649.0,
        "horasStandBy": 35.0,
        "horasPP": 35.0,
        "horasPFContr": 0.0,
        "horasPFCli": 1.0,
        "horasCalDia": 720.0,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 3649330.0,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 23.0,
        "disponibilidadPct": 99.71,
        "confiabilidadPct": 99.71,
        "fallas": 1,
        "mtbfLabel": "676.0",
        "mttrHours": 2.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 15.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 14.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 141.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 139.0,
        "disponibilidadPct": 98.8,
        "confiabilidadPct": 98.8,
        "fallas": 1,
        "mtbfLabel": "574.0",
        "mttrHours": 7.0,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 9.0,
        "disponibilidadPct": 96.22,
        "confiabilidadPct": 96.19,
        "fallas": 2,
        "mtbfLabel": "202.0",
        "mttrHours": 8.0,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 651.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102A",
        "campo": "COSTAYACO",
        "horasStandBy": 641.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102E",
        "campo": "COSTAYACO",
        "horasStandBy": 638.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102I",
        "campo": "COSTAYACO",
        "horasStandBy": 605.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 638.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 579.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 3.0,
        "disponibilidadPct": 98.05,
        "confiabilidadPct": 97.99,
        "fallas": 2,
        "mtbfLabel": "342.0",
        "mttrHours": 7.0,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 8.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 35.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "COSTAYACO",
        "horasStandBy": 4128.0,
        "disponibilidadPct": 99.49,
        "confiabilidadPct": 99.49,
        "fallas": 4,
        "mtbfLabel": "1210.25",
        "mttrHours": 6.25,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel Costayaco/Vonú (PF_contr). Meta sistema ≥98% (Orden 1)"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "VONU",
        "horasStandBy": 11.0,
        "disponibilidadPct": 99.02,
        "confiabilidadPct": 99.0,
        "fallas": 2,
        "mtbfLabel": "693.0",
        "mttrHours": 7.0,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel Costayaco/Vonú (PF_contr). Meta sistema ≥98% (Orden 1)"
      }
    ],
    "eventLog": [
      {
        "date": "2026-04-28",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 12.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 12.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-04-24",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 13.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 13.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-04-22",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 1.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 1.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-04-21",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 2.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 5.0 h | PF_contr 2.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-04-18",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 7.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 7.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-04-18",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 4.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 4.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-04-14",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-04-14",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 6.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 6.0 h | Falla_evento 0"
      },
      {
        "date": "2026-04-14",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 4.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 4.0 h | Falla_evento 0"
      },
      {
        "date": "2026-04-12",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-04-06",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 6.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 6.0 h | Falla_evento 0"
      },
      {
        "date": "2026-04-06",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 5.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 5.0 h | Falla_evento 0"
      },
      {
        "date": "2026-04-06",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 5.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 5.0 h | Falla_evento 0"
      }
    ],
    "kpi": {
      "availability": 0.9949,
      "reliability": 0.9949,
      "maintainability": null,
      "generationMwh": 3649.33,
      "operationalLossesMwh": null,
      "contractualCompliance": 0.9949
    },
    "kpiExcel": {
      "availability": 0.994943,
      "reliability": 0.994862,
      "mtbfHours": 1210.25,
      "mttrHours": 6.25
    }
  },
  "May": {
    "label": "Mayo",
    "sourceFile": "data/GTE/Mayo/Data Soporte Cálculo Copower PUTN Mayo 2026.xlsx",
    "summary": {
      "copowerFailures": 7,
      "totalEvents": null,
      "mtbfHours": 500.39,
      "mttrHours": 5.32,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 6141.75,
      "hoursStandby": 3262.0,
      "hoursPreventive": 31.0,
      "hoursCorrective": 66.25,
      "hoursFailureCopower": 66.25,
      "hoursFailureClient": 3.0,
      "energyGasKwh": 3737235.0,
      "energyDieselKwh": 217947.0
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 3415843.0,
        "dieselKwh": 217947.0
      },
      {
        "asset": "Vonu",
        "gasKwh": 321392.0,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 471917.0,
        "horasOperacion": 711.0,
        "horasStandBy": 24.0,
        "horasPP": 5.0,
        "horasPFContr": 4.0,
        "horasPFCli": 0.0,
        "horasCalDia": 744.0,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 477675.0,
        "horasOperacion": 726.0,
        "horasStandBy": 18.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 744.0,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 478517.0,
        "horasOperacion": 723.0,
        "horasStandBy": 21.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 744.0,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 529307.0,
        "horasOperacion": 652.0,
        "horasStandBy": 62.0,
        "horasPP": 0.0,
        "horasPFContr": 30.0,
        "horasPFCli": 0.0,
        "horasCalDia": 744.0,
        "fallaEvento": 4
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 582181.0,
        "horasOperacion": 690.75,
        "horasStandBy": 50.0,
        "horasPP": 0.0,
        "horasPFContr": 3.25,
        "horasPFCli": 0.0,
        "horasCalDia": 744.0,
        "fallaEvento": 2
      },
      {
        "equipo": "CPW06",
        "campo": "COSTAYACO",
        "energiaKwh": 659082.0,
        "horasOperacion": 708.0,
        "horasStandBy": 27.0,
        "horasPP": 9.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 744.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 42884.0,
        "horasOperacion": 127.0,
        "horasStandBy": 617.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 744.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102A",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 0.0,
        "horasStandBy": 192.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 192.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102E",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 0.0,
        "horasStandBy": 192.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 192.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102I",
        "campo": "COSTAYACO",
        "energiaKwh": 0.0,
        "horasOperacion": 0.0,
        "horasStandBy": 192.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 192.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 52230.0,
        "horasOperacion": 69.0,
        "horasStandBy": 675.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 744.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 122833.0,
        "horasOperacion": 163.0,
        "horasStandBy": 581.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 744.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 217961.0,
        "horasOperacion": 629.0,
        "horasStandBy": 84.0,
        "horasPP": 8.0,
        "horasPFContr": 20.0,
        "horasPFCli": 3.0,
        "horasCalDia": 744.0,
        "fallaEvento": 1
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 103356.0,
        "horasOperacion": 318.0,
        "horasStandBy": 424.0,
        "horasPP": 0.0,
        "horasPFContr": 2.0,
        "horasPFCli": 0.0,
        "horasCalDia": 744.0,
        "fallaEvento": 1
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 217164.0,
        "horasOperacion": 625.0,
        "horasStandBy": 103.0,
        "horasPP": 9.0,
        "horasPFContr": 7.0,
        "horasPFCli": 0.0,
        "horasCalDia": 744.0,
        "fallaEvento": 1
      }
    ],
    "totalGenerationKwh": 3955182.0,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 24.0,
        "disponibilidadPct": 99.44,
        "confiabilidadPct": 99.44,
        "fallas": 1,
        "mtbfLabel": "711.0",
        "mttrHours": 4.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 18.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 21.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 62.0,
        "disponibilidadPct": 95.6,
        "confiabilidadPct": 95.6,
        "fallas": 4,
        "mtbfLabel": "163.0",
        "mttrHours": 7.5,
        "riesgoTecnico": "RIESGO ALTO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 50.0,
        "disponibilidadPct": 99.53,
        "confiabilidadPct": 99.53,
        "fallas": 2,
        "mtbfLabel": "345.38",
        "mttrHours": 1.62,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 27.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 617.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102A",
        "campo": "COSTAYACO",
        "horasStandBy": 192.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102E",
        "campo": "COSTAYACO",
        "horasStandBy": 192.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102I",
        "campo": "COSTAYACO",
        "horasStandBy": 192.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 675.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 581.0,
        "disponibilidadPct": 100.0,
        "confiabilidadPct": 100.0,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0.0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 84.0,
        "disponibilidadPct": 96.97,
        "confiabilidadPct": 96.92,
        "fallas": 1,
        "mtbfLabel": "629.0",
        "mttrHours": 20.0,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 424.0,
        "disponibilidadPct": 99.38,
        "confiabilidadPct": 99.38,
        "fallas": 1,
        "mtbfLabel": "318.0",
        "mttrHours": 2.0,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 103.0,
        "disponibilidadPct": 98.91,
        "confiabilidadPct": 98.89,
        "fallas": 1,
        "mtbfLabel": "625.0",
        "mttrHours": 7.0,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE",
        "detalle": "Calculado Excel (PF_contr). Meta unidad ≥90% (Orden 3)"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "COSTAYACO",
        "horasStandBy": 2754.0,
        "disponibilidadPct": 92.88,
        "confiabilidadPct": 94.05,
        "fallas": 7,
        "mtbfLabel": "500.39 h",
        "mttrHours": 5.32,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "NO CUMPLE",
        "detalle": "Oficial citado en informe junio"
      },
      {
        "unidad": "SISTEMA N",
        "campo": "VONU",
        "horasStandBy": 508.0,
        "disponibilidadPct": 95.97,
        "confiabilidadPct": 97.04,
        "fallas": 2,
        "mtbfLabel": "N/D",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "NO CUMPLE",
        "detalle": "Oficial citado en informe junio"
      }
    ],
    "eventLog": [
      {
        "date": "2026-05-24",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 5.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 8.0 h | PF_contr 5.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-05-24",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 0.25,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 10.0 h | PF_contr 0.25 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-05-19",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 4.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 6.0 h | PF_contr 4.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-05-13",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 6.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 6.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-05-13",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 3.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 3.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-05-12",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 17.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 17.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-05-08",
        "equipment": "JIN-02",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 2.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 2.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-05-08",
        "equipment": "COPOWER",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 2.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 5946.0 h | PF_contr 0.0 h | PF_cli 2.0 h | Falla_evento 0"
      },
      {
        "date": "2026-05-05",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 2.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 2.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-05-05",
        "equipment": "JIN-10",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 7.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 7.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-05-05",
        "equipment": "COPOWER",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 2.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 20095.0 h | PF_contr 0.0 h | PF_cli 2.0 h | Falla_evento 0"
      },
      {
        "date": "2026-05-05",
        "equipment": "COPOWER",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 7.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 5611.0 h | PF_contr 0.0 h | PF_cli 7.0 h | Falla_evento 0"
      },
      {
        "date": "2026-05-04",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 10.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 10.0 h | PF_cli 0.0 h | Falla_evento 0"
      },
      {
        "date": "2026-05-03",
        "equipment": "JIN-01",
        "eventType": "Falla",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 10.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 10.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-05-03",
        "equipment": "COPOWER",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 10.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 3983.0 h | PF_contr 0.0 h | PF_cli 10.0 h | Falla_evento 0"
      },
      {
        "date": "2026-05-02",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "Evento con PF/falla en Data Soporte",
        "downtimeHours": 3.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 3.0 h | Falla_evento 0"
      }
    ],
    "kpi": {
      "availability": 0.9288,
      "reliability": 0.9405,
      "maintainability": null,
      "generationMwh": 3955.182,
      "operationalLossesMwh": null,
      "contractualCompliance": null
    },
    "kpiExcel": {
      "availability": 0.991591,
      "reliability": 0.991554,
      "mtbfHours": 649.34,
      "mttrHours": 5.53
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
      "hoursOperated": 6907.0,
      "hoursStandby": 3128.0,
      "hoursPreventive": 28.0,
      "hoursCorrective": 20.0,
      "hoursFailureCopower": 20.0,
      "hoursFailureClient": 189.0,
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
        "horasOperacion": 572.0,
        "horasStandBy": 60.0,
        "horasPP": 0.0,
        "horasPFContr": 2.0,
        "horasPFCli": 86.0,
        "horasCalDia": 720.0,
        "fallaEvento": 2
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 394125.269,
        "horasOperacion": 652.0,
        "horasStandBy": 43.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 25.0,
        "horasCalDia": 672.0,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 379616.662,
        "horasOperacion": 607.0,
        "horasStandBy": 83.0,
        "horasPP": 4.0,
        "horasPFContr": 5.0,
        "horasPFCli": 21.0,
        "horasCalDia": 672.0,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 565298.149,
        "horasOperacion": 708.0,
        "horasStandBy": 7.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 5.0,
        "horasCalDia": 672.0,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 567694.181,
        "horasOperacion": 699.0,
        "horasStandBy": 8.0,
        "horasPP": 7.0,
        "horasPFContr": 1.0,
        "horasPFCli": 5.0,
        "horasCalDia": 672.0,
        "fallaEvento": 2
      },
      {
        "equipo": "CPW06",
        "campo": "COSTAYACO",
        "energiaKwh": 540992.607,
        "horasOperacion": 667.0,
        "horasStandBy": 45.0,
        "horasPP": 0.0,
        "horasPFContr": 7.0,
        "horasPFCli": 1.0,
        "horasCalDia": 720.0,
        "fallaEvento": 3
      },
      {
        "equipo": "CPW07",
        "campo": "COSTAYACO",
        "energiaKwh": 386221.0,
        "horasOperacion": 605.0,
        "horasStandBy": 90.0,
        "horasPP": 0.0,
        "horasPFContr": 5.0,
        "horasPFCli": 20.0,
        "horasCalDia": 672.0,
        "fallaEvento": 1
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 15967.0,
        "horasOperacion": 24.0,
        "horasStandBy": 696.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 672.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 49726.0,
        "horasOperacion": 63.0,
        "horasStandBy": 657.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 672.0,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 54023.0,
        "horasOperacion": 76.0,
        "horasStandBy": 644.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 672.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 257713.0,
        "horasOperacion": 701.0,
        "horasStandBy": 12.0,
        "horasPP": 6.0,
        "horasPFContr": 0.0,
        "horasPFCli": 1.0,
        "horasCalDia": 672.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 232875.0,
        "horasOperacion": 697.0,
        "horasStandBy": 6.0,
        "horasPP": 7.0,
        "horasPFContr": 0.0,
        "horasPFCli": 10.0,
        "horasCalDia": 672.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 172764.0,
        "horasOperacion": 471.0,
        "horasStandBy": 230.0,
        "horasPP": 4.0,
        "horasPFContr": 0.0,
        "horasPFCli": 15.0,
        "horasCalDia": 672.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-11",
        "campo": "COSTAYACO",
        "energiaKwh": 54249.0,
        "horasOperacion": 140.0,
        "horasStandBy": 316.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 384.0,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-12",
        "campo": "COSTAYACO",
        "energiaKwh": 82256.0,
        "horasOperacion": 225.0,
        "horasStandBy": 231.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 0.0,
        "horasCalDia": 384.0,
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
        "detalle": "Activo dominante del mes: 3 fallas asociadas a COPOWER (6/03, 6/27, 6/28), todas contractuales"
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
        "cumplimiento": "NO CUMPLE",
        "detalle": "Mejora vs. mayo (+5.04pp Disp., +3.87pp Conf.), mismos 7 eventos que mayo pero menor severidad · Cumplimiento vs ≥98% contractual"
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
        "detalle": "Recuperación plena vs. mayo (95.97%/97.04%) · Cumplimiento vs ≥98% contractual"
      }
    ],
    "eventLog": [
      {
        "date": "2026-06-28",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "7:14hr sale de linea equipo cpw01 por salida MRU. 8:28 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "7:14hr sale de linea equipo cpw02 por salida MRU. 8:26 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "7:14hr sale de linea equipo cpw03 por salida MRU. 8:23 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "7:33hr sale de linea equipo cpw05  por parada manual entra en portencia inversa y falla en la gobernación.  8:09 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 1.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "7:31hr sale de linea equipo cpw06  sale de linea por sobrecarga.  7:46 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 1.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "7:14hr sale de linea equipo cpw07 por salida MRU. 8:20 hr ingresa a linea modo reparto de carga",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-27",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "FDL equipos G56 & 57,  se presenta perturbacion en la red generando elevacion del voltaje y potencia reactiva de los generadores CPW06 & 07, los cuales salen de linea, el voltaje l",
        "downtimeHours": 2.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 2.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-27",
        "equipment": "CPW07",
        "eventType": "Falla",
        "cause": "FDL equipos G56 & 57,  se presenta perturbacion en la red generando elevacion del voltaje y potencia reactiva de los generadores CPW06 & 07, los cuales salen de linea, el voltaje l",
        "downtimeHours": 5.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 5.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-26",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "01:00 FDL generación a gas CPW 01-02-03-04-05-06-07- Jinan 10 por disparo de C9 y reconectador RX por sobrecorriente. FDL - Parada Externa - Coordinación por parte de GTE",
        "downtimeHours": 2.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 2.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-26",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "01:00 FDL generación a gas CPW 01-02-03-04-05-06-07- Jinan 10 por disparo de C9 y reconectador RX por sobrecorriente. FDL - Parada Externa - Coordinación por parte de GTE",
        "downtimeHours": 2.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 2.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-26",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "01:00 FDL generación a gas CPW 01-02-03-04-05-06-07- Jinan 10 por disparo de C9 y reconectador RX por sobrecorriente. FDL - Parada Externa - Coordinación por parte de GTE",
        "downtimeHours": 2.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 2.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-26",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "01:00 FDL generación a gas CPW 01-02-03-04-05-06-07- Jinan 10 por disparo de C9 y reconectador RX por sobrecorriente. FDL. 13:26:00 p. m. se coordina con CCM se realiza el apagado ",
        "downtimeHours": 3.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 3.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-26",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "01:00 FDL generación a gas CPW 01-02-03-04-05-06-07- Jinan 10 por disparo de C9 y reconectador RX por sobrecorriente. FDL. 13:26:00 p. m. se coordina con CCM se realiza el apagado ",
        "downtimeHours": 3.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 3.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-25",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "11:30:00 a. m. salen de lienas equipos CPW001,CPW002,CPW003,CPW007,CPW010 y CPW011, por protección parada MRU. Sale MRU de operación por activación de nivel alto en tanque de NGL L",
        "downtimeHours": 12.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 12.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-25",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "11:30:00 a. m. salen de lienas equipos CPW001,CPW002,CPW003,CPW007,CPW010 y CPW011, por protección parada MRU. Sale MRU de operación por activación de nivel alto en tanque de NGL L",
        "downtimeHours": 11.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 11.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-25",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "11:30:00 a. m. salen de lienas equipos CPW001,CPW002,CPW003,CPW007,CPW010 y CPW011, por protección parada MRU. Sale MRU de operación por activación de nivel alto en tanque de NGL L",
        "downtimeHours": 12.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 12.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-25",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "11:30:00 a. m. salen de lienas equipos CPW001,CPW002,CPW003,CPW007,CPW010 y CPW011, por protección parada MRU. Sale MRU de operación por activación de nivel alto en tanque de NGL L",
        "downtimeHours": 12.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 12.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas,  8:16 hrs equipo cpw01 en coordin",
        "downtimeHours": 6.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 6.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas,  8:11 hrs equipo cpw02 en coordin",
        "downtimeHours": 11.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 11.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas,  8:16 hrs equipo cpw01 en coordin",
        "downtimeHours": 6.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 6.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "8:19 hrs equipo cpw07 en coordinación con CCM , sale de línea equipos cpw alineados con gas MRU+CHILLER,  causa corrección fuga de aceite en sistema QUINCY.  10:13  hrs ingresa a l",
        "downtimeHours": 6.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 6.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-24",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "10:43 hrs equipo jinan 2  en coordinación con CCM sale de línea equipo Jinan 02 por mantenimiento cyc 19.  16:20 hr equipo ingresa a linea",
        "downtimeHours": 6.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 6.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-23",
        "equipment": "CPW04",
        "eventType": "Falla",
        "cause": "se presentan dos salidas en las cuales se abre el totalizador principal de tablero de auxiliares 480V-Pendiente verificar reprote de configuración de protecciónes",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-23",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "se presentan dos salidas en las cuales se abre el totalizador principal de tablero de auxiliares 480V-Pendiente verificar reprote de configuración de protecciónes",
        "downtimeHours": 2.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 2.0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-23",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "8:10 pm  4 horas en stanby por daño en tuberia de cyc 19 inicia nuevamente a las 11:52 pm",
        "downtimeHours": 4.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 4.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-11",
        "equipment": "CPW03",
        "eventType": "Falla",
        "cause": "Sale por detonación equipo 15/06 sin reporte de falla.",
        "downtimeHours": 5.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 5.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-10",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "14:20 hrs Parada manual equipo CPW07 por protección presenta altas vivraciones y se nota alta oscilación de carga al pasar la turbina a diesel se informa a CCM.\n14:50 hrs Ingresa e",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-09",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Equipos entregado a GTE para inicio de arranque sobre las 15:00 se realiza verifiación y pruebas de magnetización de equipo.",
        "downtimeHours": 10.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 9.0 h | PF_contr 0.0 h | PF_cli 10.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-08",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Sale de linea equipo CPW010, 18:30 Se informa equipo disponible para magnetizar transformador 5MVA. Se solicita por Copower realizar el arranque al dia siguiente debido a falta de ",
        "downtimeHours": 5.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 19.0 h | PF_contr 0.0 h | PF_cli 5.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-07",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "FDL por SD detonación. Se evidencia en las tendencias de operación del equipo caída de presión de gas.se realiza cambio de base y rele k4, alimentación válvula shutoff suministro d",
        "downtimeHours": 3.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 3.0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-06",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "Sale de línea equipo JINAN-01 parada manual, se realizará cambio de válvula 3/4\" por parte de Confipetrol\nTiempo estimado 1 hora.",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-05",
        "equipment": "CPW01",
        "eventType": "Falla",
        "cause": "Sale para mantenimiento correctivo por exostacion del dia 2-06-2026, al momento de iniciar en linea el cual nos produjo daño en la integridad de el equipo, afectando el flexible de",
        "downtimeHours": 2.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 2.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-04",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Hora de operación posterior a el mantenimiento debido a daño en el tren de admision.",
        "downtimeHours": 23.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 23.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-03",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Falla en el sistema de admision.",
        "downtimeHours": 24.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 24.0 h | Falla_evento 0"
      },
      {
        "date": "2026-06-03",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "Cambio de intercooler por exceso de reciduo de secuestrante. Pendiente reporte de fallo.",
        "downtimeHours": 4.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 6.0 h | PF_contr 4.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-06-02",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Sale para mantenimiento semanal de MRU posteriormente presenta detonación al momento de iniciar en línea, el cual nos produjo daño en la integridad de el equipo. Pendiente procedim",
        "downtimeHours": 15.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 15.0 h | Falla_evento 0"
      }
    ],
    "kpi": {
      "availability": 0.9792,
      "reliability": 0.9792,
      "maintainability": null,
      "generationMwh": 4110.144,
      "operationalLossesMwh": null,
      "contractualCompliance": null
    },
    "kpiExcel": {
      "availability": 0.995939,
      "reliability": 0.996127,
      "mtbfHours": 514.4,
      "mttrHours": 2.0
    }
  }
};

export const GRAN_TIERRA_KPI_FROM_MONTHS: KpiRow[] = GRAN_TIERRA_MONTH_ORDER.map((month) => ({
  month,
  ...GRAN_TIERRA_MONTHLY_DATA[month].kpi,
}));

/** Tendencia SISTEMA N Costayaco (mismo criterio del análisis mensual). */
export const GRAN_TIERRA_TREND_FROM_MONTHS = GRAN_TIERRA_MONTH_ORDER.map((month) => {
  const row = GRAN_TIERRA_MONTHLY_DATA[month];
  return {
    month: GRAN_TIERRA_MONTH_LABELS[month],
    monthKey: month,
    availability: row.kpi.availability,
    reliability: row.kpi.reliability,
    mtbfHours: row.summary.mtbfHours,
    mttrHours: row.summary.mttrHours,
  };
});
