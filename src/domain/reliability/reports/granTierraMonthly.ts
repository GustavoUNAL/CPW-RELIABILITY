import type { EventRecord, GenerationAssetRow, GenerationByEquipmentRow, KpiRow, MachineIndicatorRow, SummaryMetrics } from "../types";

export type GranTierraMonthKey = "Ene" | "Feb" | "Mar" | "Abr" | "May" | "Jun" | "Jul" | "Ago";

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

export const GRAN_TIERRA_MONTH_ORDER: GranTierraMonthKey[] = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago"];

export const GRAN_TIERRA_MONTH_LABELS: Record<GranTierraMonthKey, string> = {
  Ene: "Enero",
  Feb: "Febrero",
  Mar: "Marzo",
  Abr: "Abril",
  May: "Mayo",
  Jun: "Junio",
  Jul: "Julio",
  Ago: "Agosto",
};

export function granTierraMonthLabel(month: GranTierraMonthKey): string {
  return GRAN_TIERRA_MONTH_LABELS[month];
}

export type GenerationBreakdown = {
  gasKwh: number;
  dieselKwh: number;
  /** Suma de los activos: debe coincidir con `totalGenerationKwh`. */
  totalKwh: number;
  byField: { field: string; gasKwh: number; dieselKwh: number; totalKwh: number }[];
  /** Diferencia contra el total oficial; distinto de cero señala datos desalineados. */
  residualKwh: number;
};

/**
 * Desglose gas/diésel del mes.
 *
 * `summary.energyGasKwh` solo cubre Costayaco en los snapshots de GTE, así que
 * enfrentarlo al total del parque no cuadra. La descomposición por activo sí
 * suma el total, y es la única que se publica.
 */
export function generationBreakdown(snapshot: {
  generationByAsset: GenerationAssetRow[];
  totalGenerationKwh: number;
}): GenerationBreakdown {
  const byField = snapshot.generationByAsset.map((a) => ({
    field: a.asset,
    gasKwh: a.gasKwh,
    dieselKwh: a.dieselKwh,
    totalKwh: a.gasKwh + a.dieselKwh,
  }));
  const gasKwh = byField.reduce((s, f) => s + f.gasKwh, 0);
  const dieselKwh = byField.reduce((s, f) => s + f.dieselKwh, 0);
  const totalKwh = gasKwh + dieselKwh;
  return {
    gasKwh,
    dieselKwh,
    totalKwh,
    byField,
    residualKwh: snapshot.totalGenerationKwh - totalKwh,
  };
}

/** Datos por mes desde data/GTE, data/Julio/GTE y data/Agosto/Presentación GTE. May–Ago: KPIs oficiales; Ene–Abr: estimados Excel. */
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
        "cause": "sd parcial de campo por apertura de RL, salida por salida de la máquina. Determinar si este tipo de falla es atribuible a GTE o CPW, no debería protegerse!",
        "downtimeHours": 2.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 2.0 h | PF_cli 0.0 h | Falla_evento 1"
      },
      {
        "date": "2026-03-27",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "sd parcial de campo por apertura de RL, salida por salida de la máquina. Determinar si este tipo de falla es atribuible a GTE o CPW, no debería protegerse!",
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
      "totalEvents": 42,
      "mtbfHours": 986.71,
      "mttrHours": 2.6,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 6907.0,
      "hoursStandby": 3128.0,
      "hoursPreventive": 28.0,
      "hoursCorrective": 20.0,
      "hoursFailureCopower": 18.22,
      "hoursFailureClient": 179.38,
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
        "horasPFContr": 5.0,
        "horasPFCli": 83.0,
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
        "horasPFContr": 3.92,
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
        "horasPFContr": 1.0,
        "horasPFCli": 4.0,
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
        "horasPFContr": 2.0,
        "horasPFCli": 3.0,
        "horasCalDia": 672.0,
        "fallaEvento": 1
      },
      {
        "equipo": "CPW06",
        "campo": "COSTAYACO",
        "energiaKwh": 540992.607,
        "horasOperacion": 667.0,
        "horasStandBy": 45.0,
        "horasPP": 0.0,
        "horasPFContr": 6.3,
        "horasPFCli": 1.0,
        "horasCalDia": 720.0,
        "fallaEvento": 2
      },
      {
        "equipo": "CPW07",
        "campo": "COSTAYACO",
        "energiaKwh": 386221.0,
        "horasOperacion": 605.0,
        "horasStandBy": 90.0,
        "horasPP": 0.0,
        "horasPFContr": 0.0,
        "horasPFCli": 20.0,
        "horasCalDia": 672.0,
        "fallaEvento": 0
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
        "fallas": 2,
        "mtbfLabel": "286.00",
        "mttrHours": 2.5,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "2 fallas COPOWER: fuga junta de escape (6/05) y detonación por relé K4 (6/07), 5 h PF_contr"
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
        "mttrHours": 3.92,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Evento único (6/11): perturbación transitoria; FS≈3,92 h (15:12→19:25); ≈2.620 kWh estimados. Causa raíz no determinada"
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 12,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 1,
        "mtbfLabel": "708.00",
        "mttrHours": 1,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Familia 23–24/jun: iniciador EEP externo + descoordinación RL/480 V interna; 4 disparos. Efectividad del reajuste pendiente"
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 13,
        "disponibilidadPct": 98.89,
        "confiabilidadPct": 99.86,
        "fallas": 1,
        "mtbfLabel": "699.00",
        "mttrHours": 2,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "1 falla COPOWER: cascada EEP + descoordinación RL/480 V (23–24/jun). El evento 6/28 fue externo a los grupos"
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 46,
        "disponibilidadPct": 99.03,
        "confiabilidadPct": 99.03,
        "fallas": 2,
        "mtbfLabel": "333.50",
        "mttrHours": 3.15,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "CUMPLE",
        "detalle": "2 fallas COPOWER: intercooler/secuestrante (6/03, 4 h) y protección Q> 6/27 (EVT-2026-06-27-CPW06; FS≈2,30 h; ≈2.420 kWh). El 6/28 fue externo"
      },
      {
        "unidad": "CPW07",
        "campo": "COSTAYACO",
        "horasStandBy": 110,
        "disponibilidadPct": 99.31,
        "confiabilidadPct": 99.31,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Salida 6/27 consolidada en EVT-2026-06-27-CPW06 (protección Q>); no se cuenta como falla separada"
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
        "mtbfLabel": "986.71",
        "mttrHours": 2.6,
        "riesgoTecnico": "RIESGO MEDIO",
        "cumplimiento": "NO CUMPLE",
        "detalle": "7 fallas COPOWER (18,22 h PF_contr). 28-jun externo FS=0,38 h no imputable · Cumplimiento vs ≥98% contractual"
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
        "date": "2026-06-22",
        "equipment": "CPW01",
        "eventType": "Causa comun",
        "cause": "03:49 Shutdown general Costayaco por salida de la máquina — falla reconectador EEP 34.5 kV circuito Puerto Limón. Protecciones I>> etapa 2; origen externo red EEP. RCA formal Sec. 30.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 0.0 h | Falla_evento 0 | RCA-030 | EVT-2026-06-22-GENERAL"
      },
      {
        "date": "2026-06-22",
        "equipment": "CPW02",
        "eventType": "Causa comun",
        "cause": "03:49 Shutdown general Costayaco por salida de la máquina — falla reconectador EEP 34.5 kV circuito Puerto Limón. Protecciones I>> etapa 2; origen externo red EEP. RCA formal Sec. 30.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 0.0 h | Falla_evento 0 | RCA-030 | EVT-2026-06-22-GENERAL"
      },
      {
        "date": "2026-06-22",
        "equipment": "CPW03",
        "eventType": "Causa comun",
        "cause": "03:49 Shutdown general Costayaco por salida de la máquina — falla reconectador EEP 34.5 kV circuito Puerto Limón. Protecciones I>> etapa 2; origen externo red EEP. RCA formal Sec. 30.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 0.0 h | Falla_evento 0 | RCA-030 | EVT-2026-06-22-GENERAL"
      },
      {
        "date": "2026-06-22",
        "equipment": "CPW04",
        "eventType": "Causa comun",
        "cause": "03:49 Shutdown general Costayaco por salida de la máquina — falla reconectador EEP 34.5 kV circuito Puerto Limón. Origen externo red EEP. RCA formal Sec. 30.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 0.0 h | Falla_evento 0 | RCA-030 | EVT-2026-06-22-GENERAL"
      },
      {
        "date": "2026-06-22",
        "equipment": "CPW05",
        "eventType": "Causa comun",
        "cause": "03:49 Shutdown general Costayaco por salida de la máquina — falla reconectador EEP 34.5 kV circuito Puerto Limón. Origen externo red EEP. RCA formal Sec. 30.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 0.0 h | Falla_evento 0 | RCA-030 | EVT-2026-06-22-GENERAL"
      },
      {
        "date": "2026-06-22",
        "equipment": "CPW06",
        "eventType": "Causa comun",
        "cause": "03:49 Shutdown general Costayaco por salida de la máquina — falla reconectador EEP 34.5 kV. MAINS FAILURE / DAVR Trip. Origen externo red EEP. RCA formal Sec. 30.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 0.0 h | Falla_evento 0 | RCA-030 | EVT-2026-06-22-GENERAL"
      },
      {
        "date": "2026-06-22",
        "equipment": "CPW07",
        "eventType": "Causa comun",
        "cause": "03:49 Shutdown general Costayaco por salida de la máquina — falla reconectador EEP 34.5 kV circuito Puerto Limón. Origen externo red EEP. RCA formal Sec. 30.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 0.0 h | Falla_evento 0 | RCA-030 | EVT-2026-06-22-GENERAL"
      },
      {
        "date": "2026-06-22",
        "equipment": "CPW12",
        "eventType": "Causa comun",
        "cause": "03:49 Shutdown general Costayaco por salida de la máquina — falla reconectador EEP 34.5 kV circuito Puerto Limón. Origen externo red EEP. RCA formal Sec. 30.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 0.0 h | Falla_evento 0 | RCA-030 | EVT-2026-06-22-GENERAL"
      },
      {
        "date": "2026-06-22",
        "equipment": "JIN-01",
        "eventType": "Causa comun",
        "cause": "03:49 Shutdown general Costayaco por salida de la máquina — falla reconectador EEP 34.5 kV circuito Puerto Limón. Origen externo red EEP. RCA formal Sec. 30.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 0.0 h | Falla_evento 0 | RCA-030 | EVT-2026-06-22-GENERAL"
      },
      {
        "date": "2026-06-22",
        "equipment": "JIN-02",
        "eventType": "Causa comun",
        "cause": "03:49 Shutdown general Costayaco por salida de la máquina — falla reconectador EEP 34.5 kV circuito Puerto Limón. Origen externo red EEP. RCA formal Sec. 30.",
        "downtimeHours": 0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 0.0 h | Falla_evento 0 | RCA-030 | EVT-2026-06-22-GENERAL"
      },
      {
        "date": "2026-06-28",
        "equipment": "CPW01 / CPW02 / CPW03 / CPW05 / CPW06 / CPW07",
        "eventType": "Falla",
        "cause": "Perturbación externa 34,5 kV (gallinazo) → salida de la máquina → pérdida MRU+Chiller y salida de unidades; sobrecarga CPW-06 y parada manual CPW-05. Sin fallas propias. FS=0,38 h (07:10–07:33); ≈1.730 kWh estimados. Normalización completa posterior (hora no registrada).",
        "downtimeHours": 0.38,
        "responsible": "Externo",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 0.38 h | Falla_evento 1 | EVT-2026-06-28-RED34KV-A | FO-GE-033 · externo · FS=0,38 h (23 min contingencia) · ≈1.730 kWh (4.520 kW×0,383 h) · sin estimar normalización completa"
      },
      {
        "date": "2026-06-27",
        "equipment": "CPW06",
        "eventType": "Falla",
        "cause": "Salida CPW-06 por protección Q> tras salida MRU. FO sin horas oficiales; FS≈2,30 h (03:17–05:35 aprox. por tendencia); ≈2.420 kWh (1.051 kW nom.). Causa raíz / responsabilidad en investigación.",
        "downtimeHours": 2.3,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 2.3 h | PF_cli 0.0 h | Falla_evento 1 | EVT-2026-06-27-CPW06 | FO-GE-033 sin horas · tendencia ≈03:17→05:35 · FS≈2,30 h · ≈2.420 kWh nom. (con kW promedio pre-disparo ≈2,1–2,2 MWh) · RCA en investigación"
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
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 6.0 h | Falla_evento 0 | EVT-2026-06-23-CPW04 | 4ª operación EEP 05:13 (cascada FO-44)"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas,  8:11 hrs equipo cpw02 en coordin",
        "downtimeHours": 11.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 11.0 h | Falla_evento 0 | EVT-2026-06-23-CPW04 | 4ª operación EEP 05:13 (cascada FO-44)"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas,  8:16 hrs equipo cpw01 en coordin",
        "downtimeHours": 6.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 6.0 h | Falla_evento 0 | EVT-2026-06-23-CPW04 | 4ª operación EEP 05:13 (cascada FO-44)"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0 | EVT-2026-06-23-CPW04 | 4ª operación EEP 05:13 (cascada FO-44)"
      },
      {
        "date": "2026-06-24",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "05:13 EEP reporta disparo de reconectador línea 34.5 Kv Jauno - Piamonte, FDL generación CPW. FDL manual sistema inyección para control de cargas",
        "downtimeHours": 1.0,
        "responsible": "GTE",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 0.0 h | PF_cli 1.0 h | Falla_evento 0 | EVT-2026-06-23-CPW04 | 4ª operación EEP 05:13 (cascada FO-44)"
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
        "cause": "FO-GE-033 No. 44: cuatro operaciones del reconectador EEP Jauno–Piamonte (23-jun 15:24/16:59/22:06 y 24-jun 05:13) se propagaron porque RL no operó selectivamente y los interruptores 480 V estaban en Isd/Ii=1,5×. SD CPW-04/05; luego CPW-06/07 y auxiliares CPW-01/02/03. Ajuste final Isd=8×Ir, Ii=15×In; efectividad pendiente de estudio/verificación.",
        "downtimeHours": 1.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 1.0 h | PF_cli 0.0 h | Falla_evento 1 | EVT-2026-06-23-CPW04 | Iniciador EEP externo + habilitante interno COPOWER (selectividad RL/480 V)"
      },
      {
        "date": "2026-06-23",
        "equipment": "CPW05",
        "eventType": "Falla",
        "cause": "FO-GE-033 No. 44: cuatro operaciones del reconectador EEP Jauno–Piamonte (23-jun 15:24/16:59/22:06 y 24-jun 05:13) se propagaron porque RL no operó selectivamente y los interruptores 480 V estaban en Isd/Ii=1,5×. SD CPW-04/05; luego CPW-06/07 y auxiliares CPW-01/02/03. Ajuste final Isd=8×Ir, Ii=15×In; efectividad pendiente de estudio/verificación.",
        "downtimeHours": 2.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 2.0 h | PF_cli 0.0 h | Falla_evento 1 | EVT-2026-06-23-CPW04 | Iniciador EEP externo + habilitante interno COPOWER (selectividad RL/480 V)"
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
        "cause": "Durante la operación del grupo electrógeno se presentó una perturbación transitoria que ocasionó la salida automática de la unidad. Se realizaron las verificaciones técnicas correspondientes y el equipo retornó a operación normal el mismo día (19:25), sin evidenciar daños físicos ni requerir reemplazo de componentes.",
        "downtimeHours": 3.92,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 3.92 h | PF_cli 0.0 h | Falla_evento 1 | EVT-2026-06-11-CPW03-A | FS≈3,92 h (15:12→19:25); energía no generada ≈2.620 kWh (estimado); causa raíz no determinada"
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
        "cause": "Shutdown por detonación asociada a señal errónea del relé K4: caída de presión de gas en tendencias por corte de la válvula shutoff. Se cambia base y relé K4 y se restablece la alimentación de la válvula.",
        "downtimeHours": 3.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 3.0 h | PF_cli 0.0 h | Falla_evento 1 | EVT-2026-06-07-CPW01"
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
        "cause": "Fuga en la junta de escape del turbo (posterior a la reparación por exostación del 2-jun) que afectó el flexible del múltiple de gases. Defecto no visible en inspección; se revela a plena carga. Junta reemplazada con stock.",
        "downtimeHours": 2.0,
        "responsible": "COPOWER",
        "notes": "PP 0.0 h | SB 0.0 h | PF_contr 2.0 h | PF_cli 0.0 h | Falla_evento 1 | EVT-2026-06-05-CPW01"
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
        "cause": "Pérdida de potencia por obstrucción del intercooler (900 → 680 kW desde el 31-may; delta de presión ~200 mbar). Contaminación por secuestrante de H2S; se cambia el interno y se rediseñan aletas. Respaldo diésel G102J ~5 h.",
        "downtimeHours": 4.0,
        "responsible": "GTE + COPOWER",
        "notes": "PP 0.0 h | SB 6.0 h | PF_contr 4.0 h | PF_cli 0.0 h | Falla_evento 1 | EVT-2026-06-03-CPW06"
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
  },
  "Jul": {
      "label": "Julio",
      "sourceFile": "data/Julio/GTE/Data Soporte Cálculo Copower PUTN Julio 2026.xlsx",
      "summary": {
          "copowerFailures": 3,
          "totalEvents": 109,
          "mtbfHours": 2410.67,
          "mttrHours": 0,
          "actionsOverdue": null,
          "rcaPending": null,
          "hoursOperated": 7232,
          "hoursStandby": 3654,
          "hoursPreventive": 234,
          "hoursCorrective": 0,
          "hoursFailureCopower": 0,
          "hoursFailureClient": 40,
          "energyGasKwh": 3515954,
          "energyDieselKwh": 133081
      },
      "generationByAsset": [
          {
              "asset": "Costayaco",
              "gasKwh": 3515954,
              "dieselKwh": 133081
          },
          {
              "asset": "Vonu",
              "gasKwh": 482882,
              "dieselKwh": 0
          }
      ],
      "generationByEquipment": [
          {
              "equipo": "CPW01",
              "campo": "COSTAYACO",
              "energiaKwh": 435240,
              "horasOperacion": 664,
              "horasStandBy": 31,
              "horasPP": 41,
              "horasPFContr": 0,
              "horasPFCli": 8,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "CPW02",
              "campo": "COSTAYACO",
              "energiaKwh": 397129,
              "horasOperacion": 605,
              "horasStandBy": 80,
              "horasPP": 43,
              "horasPFContr": 0,
              "horasPFCli": 16,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "CPW03",
              "campo": "COSTAYACO",
              "energiaKwh": 409861,
              "horasOperacion": 638,
              "horasStandBy": 37,
              "horasPP": 60,
              "horasPFContr": 0,
              "horasPFCli": 9,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "CPW04",
              "campo": "COSTAYACO",
              "energiaKwh": 438156,
              "horasOperacion": 574,
              "horasStandBy": 152,
              "horasPP": 18,
              "horasPFContr": 0,
              "horasPFCli": 0,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "CPW05",
              "campo": "COSTAYACO",
              "energiaKwh": 431557,
              "horasOperacion": 544,
              "horasStandBy": 200,
              "horasPP": 0,
              "horasPFContr": 0,
              "horasPFCli": 0,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "CPW06",
              "campo": "COSTAYACO",
              "energiaKwh": 457101,
              "horasOperacion": 554,
              "horasStandBy": 188,
              "horasPP": 0,
              "horasPFContr": 0,
              "horasPFCli": 2,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "CPW07",
              "campo": "COSTAYACO",
              "energiaKwh": 439734,
              "horasOperacion": 686,
              "horasStandBy": 53,
              "horasPP": 0,
              "horasPFContr": 0,
              "horasPFCli": 5,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "G101V",
              "campo": "COSTAYACO",
              "energiaKwh": 14043,
              "horasOperacion": 41,
              "horasStandBy": 703,
              "horasPP": 0,
              "horasPFContr": 0,
              "horasPFCli": 0,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "G102J",
              "campo": "COSTAYACO",
              "energiaKwh": 78853,
              "horasOperacion": 104,
              "horasStandBy": 640,
              "horasPP": 0,
              "horasPFContr": 0,
              "horasPFCli": 0,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "G102K",
              "campo": "COSTAYACO",
              "energiaKwh": 40185,
              "horasOperacion": 55,
              "horasStandBy": 683,
              "horasPP": 6,
              "horasPFContr": 0,
              "horasPFCli": 0,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "JIN-01",
              "campo": "VONU",
              "energiaKwh": 256282,
              "horasOperacion": 731,
              "horasStandBy": 0,
              "horasPP": 13,
              "horasPFContr": 0,
              "horasPFCli": 0,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "JIN-02",
              "campo": "VONU",
              "energiaKwh": 226600,
              "horasOperacion": 723,
              "horasStandBy": 0,
              "horasPP": 21,
              "horasPFContr": 0,
              "horasPFCli": 0,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "JIN-10",
              "campo": "COSTAYACO",
              "energiaKwh": 224679,
              "horasOperacion": 571,
              "horasStandBy": 167,
              "horasPP": 6,
              "horasPFContr": 0,
              "horasPFCli": 0,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "JIN-11",
              "campo": "COSTAYACO",
              "energiaKwh": 132155,
              "horasOperacion": 346,
              "horasStandBy": 382,
              "horasPP": 16,
              "horasPFContr": 0,
              "horasPFCli": 0,
              "horasCalDia": 744,
              "fallaEvento": 0
          },
          {
              "equipo": "JIN-12",
              "campo": "COSTAYACO",
              "energiaKwh": 150342,
              "horasOperacion": 396,
              "horasStandBy": 338,
              "horasPP": 10,
              "horasPFContr": 0,
              "horasPFCli": 0,
              "horasCalDia": 744,
              "fallaEvento": 0
          }
      ],
      "totalGenerationKwh": 4131917,
      "machineIndicators": [
          {
              "unidad": "CPW01",
              "campo": "COSTAYACO",
              "horasStandBy": 39,
              "disponibilidadPct": 94.49,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO ALTO",
              "cumplimiento": "NO CUMPLE",
              "detalle": "Cambio controles AGC4 registrado en sábana julio como M10 (13–14 jul, con CPW03). Sin eventos correctivos. Meta Costayaco gas ≥98%."
          },
          {
              "unidad": "CPW02",
              "campo": "COSTAYACO",
              "horasStandBy": 96,
              "disponibilidadPct": 94.22,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO ALTO",
              "cumplimiento": "NO CUMPLE",
              "detalle": "Sábana julio: descarbonización 10–11 jul (48 h). PDF GTE atribuye AGC4; no figura como M10 en la sábana del mes. Meta Costayaco gas ≥98%."
          },
          {
              "unidad": "CPW03",
              "campo": "COSTAYACO",
              "horasStandBy": 46,
              "disponibilidadPct": 91.94,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO ALTO",
              "cumplimiento": "NO CUMPLE",
              "detalle": "Cambio controles AGC4 registrado en sábana julio como M10 (13–14 jul). Menor disponibilidad individual del mes (91.94%). Meta ≥98%."
          },
          {
              "unidad": "CPW04",
              "campo": "COSTAYACO",
              "horasStandBy": 152,
              "disponibilidadPct": 97.58,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO BAJO",
              "cumplimiento": "CUMPLE",
              "detalle": "Sin eventos correctivos. Disponibilidad 97.58% (bajo meta 98% individual Costayaco gas; anexo marca CUMPLE)."
          },
          {
              "unidad": "CPW05",
              "campo": "COSTAYACO",
              "horasStandBy": 200,
              "disponibilidadPct": 100,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO BAJO",
              "cumplimiento": "CUMPLE",
              "detalle": "Sin eventos correctivos. Disponibilidad y confiabilidad plenas."
          },
          {
              "unidad": "CPW06",
              "campo": "COSTAYACO",
              "horasStandBy": 190,
              "disponibilidadPct": 100,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO BAJO",
              "cumplimiento": "CUMPLE",
              "detalle": "Recupera vs. junio (entonces RIESGO MEDIO, 2 fallas). Sin eventos correctivos."
          },
          {
              "unidad": "CPW07",
              "campo": "COSTAYACO",
              "horasStandBy": 58,
              "disponibilidadPct": 100,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO BAJO",
              "cumplimiento": "CUMPLE",
              "detalle": "Sin eventos correctivos. Disponibilidad y confiabilidad plenas."
          },
          {
              "unidad": "JIN-10",
              "campo": "COSTAYACO",
              "horasStandBy": 167,
              "disponibilidadPct": 99.19,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO BAJO",
              "cumplimiento": "CUMPLE",
              "detalle": "Incorporada al consolidado Sistema CPW. Sin eventos correctivos."
          },
          {
              "unidad": "JIN-11",
              "campo": "COSTAYACO",
              "horasStandBy": 382,
              "disponibilidadPct": 97.85,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO BAJO",
              "cumplimiento": "CUMPLE",
              "detalle": "Entra al consolidado energético Sistema CPW (antes en estabilización). Sin eventos correctivos."
          },
          {
              "unidad": "JIN-12",
              "campo": "COSTAYACO",
              "horasStandBy": 338,
              "disponibilidadPct": 98.66,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO BAJO",
              "cumplimiento": "CUMPLE",
              "detalle": "Entra al consolidado energético Sistema CPW (antes en estabilización). Sin eventos correctivos."
          },
          {
              "unidad": "G101V",
              "campo": "COSTAYACO",
              "horasStandBy": 703,
              "disponibilidadPct": 100,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO BAJO",
              "cumplimiento": "CUMPLE",
              "detalle": "Diésel de respaldo. Energía del PDF anexo duplica JIN-11; se usa Data Soporte."
          },
          {
              "unidad": "G102J",
              "campo": "COSTAYACO",
              "horasStandBy": 640,
              "disponibilidadPct": 100,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO BAJO",
              "cumplimiento": "CUMPLE",
              "detalle": "Diésel de respaldo. Energía del PDF anexo duplica JIN-12; se usa Data Soporte."
          },
          {
              "unidad": "G102K",
              "campo": "COSTAYACO",
              "horasStandBy": 683,
              "disponibilidadPct": 99.19,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO BAJO",
              "cumplimiento": "CUMPLE",
              "detalle": "Diésel de respaldo. Sin eventos correctivos."
          },
          {
              "unidad": "JIN-01",
              "campo": "VONU",
              "horasStandBy": 0,
              "disponibilidadPct": 98.25,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO BAJO",
              "cumplimiento": "CUMPLE",
              "detalle": "Sin eventos correctivos (2.º mes). Meta Vonú ≥90%."
          },
          {
              "unidad": "JIN-02",
              "campo": "VONU",
              "horasStandBy": 0,
              "disponibilidadPct": 97.18,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO BAJO",
              "cumplimiento": "CUMPLE",
              "detalle": "Sin eventos correctivos (2.º mes). Meta Vonú ≥90%."
          },
          {
              "unidad": "SISTEMA N",
              "campo": "COSTAYACO",
              "horasStandBy": 948,
              "disponibilidadPct": 80.65,
              "confiabilidadPct": 100,
              "fallas": 3,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO ALTO",
              "cumplimiento": "NO CUMPLE",
              "detalle": "Oficial PDF jul-2026: Disp. 80.65% (−17.27 pp vs jun 97.92%). Conf. 100% (0 eventos). Caída por AGC4: sábana julio registra M10 en CPW01/03 (13–14) y descarbonización CPW02 (10–11). Energía Sistema CPW 3.515.954 kWh. Meta ≥98%. Concertación imputa 3 fallas COPOWER (CPW06×2, CPW07×1)."
          },
          {
              "unidad": "SISTEMA N",
              "campo": "VONU",
              "horasStandBy": 0,
              "disponibilidadPct": 98.79,
              "confiabilidadPct": 100,
              "fallas": 0,
              "mtbfLabel": "Sin Fallas",
              "mttrHours": 0,
              "riesgoTecnico": "RIESGO BAJO",
              "cumplimiento": "CUMPLE",
              "detalle": "Oficial anexo PDF: Disp. 98.79% / Conf. 100% (0 eventos). Narrativa §2.2 cita 95.43%; se usa el dashboard anexo. Meta Vonú ≥90%. Energía 119.038 kWh."
          }
      ],
      "eventLog": [
          {
              "date": "2026-07-25",
              "equipment": "PARQUE",
              "eventType": "Causa comun",
              "cause": "12:58 Cascada MRU por sobrepresión manifold CYC (CPW-01/02/03/07, JIN-10/11). Reingreso 14:39–15:23.",
              "downtimeHours": 2.42,
              "responsible": "GTE",
              "notes": "EVT-2026-07-25-MRU · FO-GE-033 No. 63 · data/Julio/RCA"
          },
          {
              "date": "2026-07-24",
              "equipment": "PARQUE",
              "eventType": "Causa comun",
              "cause": "07:08 Cascada MRU por disparo reconectador EEP 34.5 kV Junín–Mocoa (CPW-01/02/03/07, JIN-10). Reingreso CPW ~08:40–09:00; JIN-10 19:09.",
              "downtimeHours": 1.87,
              "responsible": "Externo",
              "notes": "EVT-2026-07-24-MRU · FO-GE-033 No. 62 · data/Julio/RCA"
          },
          {
              "date": "2026-07-21",
              "equipment": "PARQUE",
              "eventType": "Causa comun",
              "cause": "17:55 Cascada MRU por alto nivel de GLP (CPW-01/02/03/07, JIN-10). Reingreso 21:11–22:32. FS máx. 4,62 h.",
              "downtimeHours": 4.62,
              "responsible": "GTE",
              "notes": "EVT-2026-07-21-MRU · FO-GE-033 No. 61 · data/Julio/RCA"
          },
          {
              "date": "2026-07-21",
              "equipment": "CPW04",
              "eventType": "Falla",
              "cause": "15:16 Detonación alta en un cilindro (gas MQT). Stand-by hasta 20:21 (5,08 h). Deslastre 1040→850 kW.",
              "downtimeHours": 5.08,
              "responsible": "GTE + COPOWER",
              "notes": "EVT-2026-07-21-CPW04 · FO-GE-033 No. 60 · data/Julio/RCA"
          },
          {
              "date": "2026-07-12",
              "equipment": "PARQUE",
              "eventType": "Causa comun",
              "cause": "05:28 Cascada MRU por baja presión de aceite Quincy (CPW-01/03/07, JIN-10/11/12). Reingreso 07:16–08:00. FS máx. 2,53 h.",
              "downtimeHours": 2.53,
              "responsible": "GTE",
              "notes": "EVT-2026-07-12-MRU · FO-GE-033 No. 58 · data/Julio/RCA"
          },
          {
              "date": "2026-07-09",
              "equipment": "CPW06",
              "eventType": "Falla",
              "cause": "CPW-06-FDL al momento de salida de la MRU alto nivel de GLP en el recipiente. Presenta alta potencia de Reactiva.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "Horas concertadas · Numero de fallas 1 · PF_contr 0 h"
          },
          {
              "date": "2026-07-04",
              "equipment": "CPW06",
              "eventType": "Falla",
              "cause": "13:37 Sale de linea equipo CPW-06 por sobre carga en generador",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "Horas concertadas · Numero de fallas 1 · PF_contr 0 h"
          },
          {
              "date": "2026-07-04",
              "equipment": "CPW07",
              "eventType": "Falla",
              "cause": "13:35 Sale de linea equipo CPW-07 por sobre carga en generador",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "Horas concertadas · Numero de fallas 1 · PF_contr 0 h"
          },
          {
              "date": "2026-07-31",
              "equipment": "CPW02",
              "eventType": "Operativo",
              "cause": "Apagado por salida de campo MQT trabajos MCP",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 24 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-31",
              "equipment": "CPW04",
              "eventType": "Operativo",
              "cause": "Apagado por salida de campo MQT trabajos MCP",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 24 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-31",
              "equipment": "CPW05",
              "eventType": "Operativo",
              "cause": "Apagado por salida de campo MQT trabajos MCP",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 24 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-31",
              "equipment": "JIN-10",
              "eventType": "Operativo",
              "cause": "Mantenimiento preventivo M3",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 18 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-31",
              "equipment": "JIN-11",
              "eventType": "Operativo",
              "cause": "Se realiza apagado por rotación de equipos.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-31",
              "equipment": "JIN-12",
              "eventType": "Operativo",
              "cause": "Se realiza apagado por rotación de equipos.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 18 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-30",
              "equipment": "CPW02",
              "eventType": "Operativo",
              "cause": "Sale de liena por apagado de MQT",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 23 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-30",
              "equipment": "CPW04",
              "eventType": "Operativo",
              "cause": "Sale de liena por apagado de MQT",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 23 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-30",
              "equipment": "CPW05",
              "eventType": "Operativo",
              "cause": "Sale de liena por apagado de MQT",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 23 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-30",
              "equipment": "JIN-10",
              "eventType": "Operativo",
              "cause": "Sale de liena para recuperar gas CYC 10psi",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-29",
              "equipment": "CPW06",
              "eventType": "Operativo",
              "cause": "Salida por recuperación de gas MQT 110psid",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-29",
              "equipment": "JIN-10",
              "eventType": "Operativo",
              "cause": "Caida de presion gas CYC 10psid",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 8 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-23",
              "equipment": "JIN-11",
              "eventType": "Operativo",
              "cause": "Sabana de Mantenimiento",
              "downtimeHours": 7,
              "responsible": "COPOWER",
              "notes": "PP 7 h | SB 15 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-21",
              "equipment": "JIN-02",
              "eventType": "Operativo",
              "cause": "Mantenimiento preventivo (Data Soporte)",
              "downtimeHours": 9,
              "responsible": "COPOWER",
              "notes": "PP 9 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-18",
              "equipment": "CPW04",
              "eventType": "Operativo",
              "cause": "Sabana de Mantenimiento",
              "downtimeHours": 9,
              "responsible": "COPOWER",
              "notes": "PP 9 h | SB 15 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-16",
              "equipment": "CPW01",
              "eventType": "Operativo",
              "cause": "Trabajos de PAC para vinculación en reaparto de cargo posterior a cambio de controlador AGC4.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-16",
              "equipment": "CPW03",
              "eventType": "Operativo",
              "cause": "Apagado por trabajos en gasoducto liena de gas MQT.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 5 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-16",
              "equipment": "CPW04",
              "eventType": "Operativo",
              "cause": "CPW04 (16/07/2026)- a las 23:01 horas 15-07-2026, sale de linea equipo cpw04 por baja presion de gas moqueta 125 psi // ingresa a las 02:50 horas del 16-07-2026. //  06:54 hrs a solicitud del CCM FDL equipo CPW-04 por estabilidad de presión de gas Moqueta, 120 PSI, ingresa a linea a las 08:32 hrs a solicitud de CCM por salida de generador CPW01por  intervención de personal de PAC // CPW 03- 04-05-06, parada manual al compresor # 2, por autorización del supervisor de producción, suspender envió de gas MQT – CYC. Debido a trabajos realizados por contratista en línea del gasoducto en rio Mocoa.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 12 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-16",
              "equipment": "CPW05",
              "eventType": "Operativo",
              "cause": "Apagado por trabajos en gasoducto liena de gas MQT.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 7 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-16",
              "equipment": "CPW06",
              "eventType": "Operativo",
              "cause": "Apagado por trabajos en gasoducto liena de gas MQT.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 7 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-16",
              "equipment": "G101V",
              "eventType": "Operativo",
              "cause": "Respado por apagado de equipos con gas MQT",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 16 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-16",
              "equipment": "G102J",
              "eventType": "Operativo",
              "cause": "Respado por apagado de equipos con gas MQT",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 15 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-16",
              "equipment": "G102K",
              "eventType": "Operativo",
              "cause": "Respado por apagado de equipos con gas MQT",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 15 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-16",
              "equipment": "JIN-01",
              "eventType": "Operativo",
              "cause": "Se realiza preventivo M2.",
              "downtimeHours": 6,
              "responsible": "COPOWER",
              "notes": "PP 6 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-15",
              "equipment": "CPW03",
              "eventType": "Operativo",
              "cause": "Revisar tiempo standby Vs tiempo FDS por instalación control DEIF AGC4 MK ii",
              "downtimeHours": 20,
              "responsible": "COPOWER",
              "notes": "PP 20 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-15",
              "equipment": "JIN-10",
              "eventType": "Operativo",
              "cause": "Sabana de Mantenimiento",
              "downtimeHours": 6,
              "responsible": "COPOWER",
              "notes": "PP 6 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-14",
              "equipment": "CPW03",
              "eventType": "Operativo",
              "cause": "Cambio de Control AGC4",
              "downtimeHours": 24,
              "responsible": "COPOWER",
              "notes": "PP 24 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-13",
              "equipment": "CPW03",
              "eventType": "Operativo",
              "cause": "Cambio de Control AGC4",
              "downtimeHours": 16,
              "responsible": "COPOWER",
              "notes": "PP 16 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-12",
              "equipment": "CPW02",
              "eventType": "Operativo",
              "cause": "Continuan en cambio de Control AGC4",
              "downtimeHours": 4,
              "responsible": "COPOWER",
              "notes": "PP 4 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-11",
              "equipment": "CPW02",
              "eventType": "Operativo",
              "cause": "Continuan en cambio de Control AGC4",
              "downtimeHours": 23,
              "responsible": "COPOWER",
              "notes": "PP 23 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-11",
              "equipment": "CPW03",
              "eventType": "Operativo",
              "cause": "22:00 inicia pruebas de ajuste de mezcla y monitoreo en vacio",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-11",
              "equipment": "CPW05",
              "eventType": "Operativo",
              "cause": "12:09 Se presenta FDL del equipo G54, se revisa con el lider de MANTTO y personal de CONTROL, se encontro alta restriccion en la presion del MAP, se evalua carga minima para mantener en operación el equipo y se deja en 760 KW de potencia nominal.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-10",
              "equipment": "CPW01",
              "eventType": "Operativo",
              "cause": "7:37 EQUIPO: CPW-01-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 08:59 horas",
              "downtimeHours": 2,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 2 h | Falla_evento 0"
          },
          {
              "date": "2026-07-10",
              "equipment": "CPW02",
              "eventType": "Operativo",
              "cause": "7:37 EQUIPO: CPW-02-FDL por salida de la MRU alto nivel de GLP en el recipiente. Entra a mantenimiento cambio de control AGC4",
              "downtimeHours": 16,
              "responsible": "COPOWER",
              "notes": "PP 16 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-10",
              "equipment": "CPW03",
              "eventType": "Operativo",
              "cause": "7:37 EQUIPO: CPW-03-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 09:03 horas",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-10",
              "equipment": "CPW07",
              "eventType": "Operativo",
              "cause": "7:37 EQUIPO: CPW-07-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 09:26 horas",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 2 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-10",
              "equipment": "G102J",
              "eventType": "Operativo",
              "cause": "Ingreso en linea en respaldo de salida de equipos con gas suministro MRU",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 21 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-10",
              "equipment": "JIN-11",
              "eventType": "Operativo",
              "cause": "EQUIPO: Jinan-10, 11 & 12. a solicitud del CCM, pasan a operar con gas tratato Ingresa a las 10:10 horas",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 10 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-10",
              "equipment": "JIN-12",
              "eventType": "Operativo",
              "cause": "EQUIPO: Jinan-10, 11 & 12. a solicitud del CCM, pasan a operar con gas tratato Ingresa a las 10:10 horas",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 11 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-09",
              "equipment": "CPW01",
              "eventType": "Operativo",
              "cause": "EQUIPO: CPW-01-FDL por salida de la MRU alto nivel de GLP en el recipiente - se presento posterior a la salida falla en el Sello de la bomba por  contrapresion al momento de salir la MRU.",
              "downtimeHours": 1,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 0"
          },
          {
              "date": "2026-07-09",
              "equipment": "CPW02",
              "eventType": "Operativo",
              "cause": "EQUIPO: CPW-02-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 10:49 horas",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 3 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-09",
              "equipment": "CPW03",
              "eventType": "Operativo",
              "cause": "EQUIPO: CPW-02-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 10:44 horas",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 3 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-09",
              "equipment": "CPW04",
              "eventType": "Operativo",
              "cause": "SDL por baja presion de gas 11:00 a 17:00,  sale delinea por baja presion de gas MQT 105 psi  21:30 a 23:45",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 8 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-09",
              "equipment": "CPW06",
              "eventType": "Operativo",
              "cause": "CPW-06-FDL al momento de salida de la MRU alto nivel de GLP en el recipiente. Presenta alta potencia de Reactiva, Ingresa a las 10:25 horas pendiente verificar respuesta dinamica",
              "downtimeHours": 1,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 0"
          },
          {
              "date": "2026-07-09",
              "equipment": "CPW07",
              "eventType": "Operativo",
              "cause": "CPW-07-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 11:14 horas, EQUIPO: CPW-07-FDL por salida de la MRU alto nivel de GLP en el recipiente. Ingresa a las 18:49 horas",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 4 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-09",
              "equipment": "G101V",
              "eventType": "Operativo",
              "cause": "Ingresan como respaldo por salida de la MRU y equipos gas tratado",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 22 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-09",
              "equipment": "G102J",
              "eventType": "Operativo",
              "cause": "Ingresan como respaldo por salida de la MRU y equipos gas tratado",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 17 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-09",
              "equipment": "G102K",
              "eventType": "Operativo",
              "cause": "Ingresan como respaldo por salida de la MRU y equipos gas tratado",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 21 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-08",
              "equipment": "CPW01",
              "eventType": "Operativo",
              "cause": "Continuan en cambio de Control AGC4  - Actividad programada pero impacta disponibilidad al no ser de Sabana de mantenimiento",
              "downtimeHours": 24,
              "responsible": "COPOWER",
              "notes": "PP 24 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-08",
              "equipment": "CPW02",
              "eventType": "Operativo",
              "cause": "10:46 Sale de linea por mantenimiento semanal de la MRU.",
              "downtimeHours": 4,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 4 h | Falla_evento 0"
          },
          {
              "date": "2026-07-08",
              "equipment": "CPW03",
              "eventType": "Operativo",
              "cause": "10:46 Sale de linea por mantenimiento semanal de la MRU.",
              "downtimeHours": 4,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 4 h | Falla_evento 0"
          },
          {
              "date": "2026-07-08",
              "equipment": "CPW07",
              "eventType": "Operativo",
              "cause": "10:46 Sale de linea por mantenimiento semanal de la MRU.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 4 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-08",
              "equipment": "G101V",
              "eventType": "Operativo",
              "cause": "Ingresan por respaldo mantenimiento semanal de la MRU",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 19 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-08",
              "equipment": "G102J",
              "eventType": "Operativo",
              "cause": "Ingresan por respaldo mantenimiento semanal de la MRU",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 18 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-08",
              "equipment": "G102K",
              "eventType": "Operativo",
              "cause": "Ingresan por respaldo mantenimiento semanal de la MRU",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 19 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-08",
              "equipment": "JIN-10",
              "eventType": "Operativo",
              "cause": "Se realiza cambio de gas por mtto semanal de la MRU",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-07",
              "equipment": "CPW01",
              "eventType": "Operativo",
              "cause": "Cambio control DEIF @ AGC4 - Actividad programada pero impacta disponibilidad al no ser de Sabana de mantenimiento",
              "downtimeHours": 17,
              "responsible": "COPOWER",
              "notes": "PP 17 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-07",
              "equipment": "CPW02",
              "eventType": "Operativo",
              "cause": "Sale de linea por salida de la MRU.",
              "downtimeHours": 1,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 0"
          },
          {
              "date": "2026-07-07",
              "equipment": "CPW03",
              "eventType": "Operativo",
              "cause": "Sale de linea por salida de la MRU.",
              "downtimeHours": 2,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 2 h | Falla_evento 0"
          },
          {
              "date": "2026-07-07",
              "equipment": "CPW06",
              "eventType": "Operativo",
              "cause": "Sale equipo por perdida dinamica de generador.",
              "downtimeHours": 1,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 0"
          },
          {
              "date": "2026-07-07",
              "equipment": "CPW07",
              "eventType": "Operativo",
              "cause": "Sale de linea por salida de la MRU.",
              "downtimeHours": 2,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 2 h | Falla_evento 0"
          },
          {
              "date": "2026-07-07",
              "equipment": "G101V",
              "eventType": "Operativo",
              "cause": "Respaldo por salida de la MRU.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 18 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-07",
              "equipment": "G102J",
              "eventType": "Operativo",
              "cause": "Respaldo por salida de la MRU.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 21 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-07",
              "equipment": "G102K",
              "eventType": "Operativo",
              "cause": "Respaldo por salida de la MRU.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 21 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-07",
              "equipment": "JIN-10",
              "eventType": "Operativo",
              "cause": "Sale de linea por salida de la MRU.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 3 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-07",
              "equipment": "JIN-11",
              "eventType": "Operativo",
              "cause": "ingresan a operación por intervención de CPW01",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 10 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-07",
              "equipment": "JIN-12",
              "eventType": "Operativo",
              "cause": "ingresan a operación por intervención de CPW01",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 24 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-06",
              "equipment": "CPW02",
              "eventType": "Operativo",
              "cause": "9:00 Sale de linea para cambio gas MQT. 16:30 sale de linea por baja presión gas MQT 93psi",
              "downtimeHours": 7,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 7 h | Falla_evento 0"
          },
          {
              "date": "2026-07-06",
              "equipment": "CPW04",
              "eventType": "Operativo",
              "cause": "Se realiza mantenimiento M2",
              "downtimeHours": 9,
              "responsible": "COPOWER",
              "notes": "PP 9 h | SB 4 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-06",
              "equipment": "G102J",
              "eventType": "Operativo",
              "cause": "Ingresa como respaldo CPW04 que ingresa a MTTO 7:50 sale 9:40.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 23 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-06",
              "equipment": "JIN-10",
              "eventType": "Operativo",
              "cause": "9:00 ingresa con tratado de la MRU",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 9 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-06",
              "equipment": "JIN-11",
              "eventType": "Operativo",
              "cause": "22:47 Sale de linea por solicitud de CCM ingresa CPW04",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-06",
              "equipment": "JIN-12",
              "eventType": "Operativo",
              "cause": "14:17 Sale equipo por lluvia 16:30 ingresa en linea por baja presión gas MQT 93psi reslado de CPW04",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 13 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-05",
              "equipment": "CPW01",
              "eventType": "Operativo",
              "cause": "Sale de linea por salida de la MRU.",
              "downtimeHours": 3,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 3 h | Falla_evento 0"
          },
          {
              "date": "2026-07-05",
              "equipment": "CPW02",
              "eventType": "Operativo",
              "cause": "Sale de linea por salida de la MRU.",
              "downtimeHours": 2,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 2 h | Falla_evento 0"
          },
          {
              "date": "2026-07-05",
              "equipment": "CPW03",
              "eventType": "Operativo",
              "cause": "Sale de linea por salida de la MRU.",
              "downtimeHours": 2,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 2 h | Falla_evento 0"
          },
          {
              "date": "2026-07-05",
              "equipment": "CPW07",
              "eventType": "Operativo",
              "cause": "Sale de linea por salida de la MRU.",
              "downtimeHours": 3,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 3 h | Falla_evento 0"
          },
          {
              "date": "2026-07-05",
              "equipment": "G101V",
              "eventType": "Operativo",
              "cause": "Ingresa como respaldo por salida de equipos con gas tratado de la MRU",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 22 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-05",
              "equipment": "G102J",
              "eventType": "Operativo",
              "cause": "Ingresa como respaldo por salida de equipos con gas tratado de la MRU",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 20 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-05",
              "equipment": "G102K",
              "eventType": "Operativo",
              "cause": "Ingresa como respaldo por salida de equipos con gas tratado de la MRU",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 21 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-05",
              "equipment": "JIN-02",
              "eventType": "Operativo",
              "cause": "Mantenimiento preventivo programado M4",
              "downtimeHours": 12,
              "responsible": "COPOWER",
              "notes": "PP 12 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-05",
              "equipment": "JIN-11",
              "eventType": "Operativo",
              "cause": "Sale de linea por salida de la MRU.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 2 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-04",
              "equipment": "G101V",
              "eventType": "Operativo",
              "cause": "6:00 Inicia respaldo por apertura del RL.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 20 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-04",
              "equipment": "G102J",
              "eventType": "Operativo",
              "cause": "6:18 Inicia respaldo por apertura del RL.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 17 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-04",
              "equipment": "G102K",
              "eventType": "Operativo",
              "cause": "6:18 Inicia respaldo por apertura del RL.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 16 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-04",
              "equipment": "JIN-11",
              "eventType": "Operativo",
              "cause": "En standby por presion de gas CYC al momento de la apertura del RL.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 10 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-03",
              "equipment": "CPW04",
              "eventType": "Operativo",
              "cause": "20:00 Sale de line apor baja presión de gas MQT",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 2 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-03",
              "equipment": "CPW05",
              "eventType": "Operativo",
              "cause": "23:30 Sale de line apor baja presión de gas MQT",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 2 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-03",
              "equipment": "G102J",
              "eventType": "Operativo",
              "cause": "Respaldo por Salida de CPW04 y CPW05 por caida de presion MQT",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 22 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-03",
              "equipment": "JIN-01",
              "eventType": "Operativo",
              "cause": "9:20 Mantenimiento programado M1.",
              "downtimeHours": 7,
              "responsible": "COPOWER",
              "notes": "PP 7 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-03",
              "equipment": "JIN-10",
              "eventType": "Operativo",
              "cause": "12:36 hrs sale de linea equipo cpw010 a solicitud de ccm por baja presion de gas cyc 10 psi, 13:45 hrs ingresa a linea en modo reparto de carga.\r\n19:00 CPW-10 sale de linea a peticion de CCM para priorizar gas CYC a la MRU.",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 5 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-02",
              "equipment": "G102J",
              "eventType": "Operativo",
              "cause": "Respaldo por maniobra en sistema de inyección sale CPW05",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 23 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-02",
              "equipment": "G102K",
              "eventType": "Operativo",
              "cause": "Mantenimiento preventivo (Data Soporte)",
              "downtimeHours": 6,
              "responsible": "COPOWER",
              "notes": "PP 6 h | SB 18 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-02",
              "equipment": "JIN-11",
              "eventType": "Operativo",
              "cause": "8:51hrs equipo cpw011 inicia mantenimiento programado M0  17:00 hr finaliza mantenimiento\t\r\n17:20 equipo cpw011 ingresa a linea en modo reparto de carga, 23:18 hrs sale de línea equipo CPW011 parada manual por baja presión de gas CYC, equipo en stand by disponible.",
              "downtimeHours": 9,
              "responsible": "COPOWER",
              "notes": "PP 9 h | SB 9 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-01",
              "equipment": "CPW01",
              "eventType": "Operativo",
              "cause": "11:57hrs equipo cpw01 sale de linea por salida MRU, ingresa a linea 13:25 modo reparto de carga",
              "downtimeHours": 2,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 2 h | Falla_evento 0"
          },
          {
              "date": "2026-07-01",
              "equipment": "CPW02",
              "eventType": "Operativo",
              "cause": "11:57hrs equipo cpw02  sale de linea por salida MRU, ingresa a linea 13:25 modo reparto de carga",
              "downtimeHours": 2,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 2 h | Falla_evento 0"
          },
          {
              "date": "2026-07-01",
              "equipment": "CPW03",
              "eventType": "Operativo",
              "cause": "11:57hrs equipo cpw03  sale de linea por salida MRU, ingresa a linea 13:28 modo reparto de carga",
              "downtimeHours": 1,
              "responsible": "GTE",
              "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 1 h | Falla_evento 0"
          },
          {
              "date": "2026-07-01",
              "equipment": "CPW07",
              "eventType": "Operativo",
              "cause": "11:57hrs equipo cpw07  sale de linea por salida MRU, ingresa a linea 13:30 modo reparto de carga",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 2 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-01",
              "equipment": "G102J",
              "eventType": "Operativo",
              "cause": "Por respaldo salida equipos J320",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 22 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-01",
              "equipment": "JIN-11",
              "eventType": "Operativo",
              "cause": "14:05hrs equipo cpw011 ingresa a linea por solicitud de CCM, 16:30 sale de linea para ingresar el equipo cpw012 por finalizacion de mantenimiento",
              "downtimeHours": 0,
              "responsible": "COPOWER",
              "notes": "PP 0 h | SB 16 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          },
          {
              "date": "2026-07-01",
              "equipment": "JIN-12",
              "eventType": "Operativo",
              "cause": "08:00 hrs equipo COW012 inicia mantenimiento programdo M0, 16:38 ingresa equipo a linea modo reparto de carga",
              "downtimeHours": 10,
              "responsible": "COPOWER",
              "notes": "PP 10 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
          }
      ],
      "kpi": {
          "availability": 0.8065,
          "reliability": 1,
          "maintainability": null,
          "generationMwh": 4131.917,
          "operationalLossesMwh": null,
          "contractualCompliance": 0.8065
      },
      "kpiExcel": {
          "availability": 1,
          "reliability": 1,
          "mtbfHours": null,
          "mttrHours": 0
      }
  }
,
  Ago: {
    "label": "Agosto",
    "sourceFile": "data/Agosto/Presentación GTE/Data Soporte Cálculo Copower PUTN Agosto 2026.xlsx",
    "summary": {
      "copowerFailures": 0,
      "totalEvents": 128,
      "mtbfHours": null,
      "mttrHours": 0,
      "actionsOverdue": null,
      "rcaPending": null,
      "hoursOperated": 7992,
      "hoursStandby": 2358,
      "hoursPreventive": 90,
      "hoursCorrective": 0,
      "hoursFailureCopower": 0,
      "hoursFailureClient": 0,
      "energyGasKwh": 3717498,
      "energyDieselKwh": 215166
    },
    "generationByAsset": [
      {
        "asset": "Costayaco",
        "gasKwh": 3717498,
        "dieselKwh": 215166
      },
      {
        "asset": "Vonu",
        "gasKwh": 491898,
        "dieselKwh": 0
      }
    ],
    "generationByEquipment": [
      {
        "equipo": "CPW01",
        "campo": "COSTAYACO",
        "energiaKwh": 428315,
        "horasOperacion": 675,
        "horasStandBy": 63,
        "horasPP": 6,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW02",
        "campo": "COSTAYACO",
        "energiaKwh": 368061,
        "horasOperacion": 579,
        "horasStandBy": 165,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW03",
        "campo": "COSTAYACO",
        "energiaKwh": 423632,
        "horasOperacion": 668,
        "horasStandBy": 69,
        "horasPP": 7,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW04",
        "campo": "COSTAYACO",
        "energiaKwh": 437063,
        "horasOperacion": 590,
        "horasStandBy": 154,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW05",
        "campo": "COSTAYACO",
        "energiaKwh": 535985,
        "horasOperacion": 690,
        "horasStandBy": 54,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW06",
        "campo": "COSTAYACO",
        "energiaKwh": 490760,
        "horasOperacion": 639,
        "horasStandBy": 97,
        "horasPP": 8,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "CPW07",
        "campo": "COSTAYACO",
        "energiaKwh": 410177,
        "horasOperacion": 689,
        "horasStandBy": 49,
        "horasPP": 6,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "G101V",
        "campo": "COSTAYACO",
        "energiaKwh": 38427,
        "horasOperacion": 110,
        "horasStandBy": 394,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 504,
        "fallaEvento": 0
      },
      {
        "equipo": "G102J",
        "campo": "COSTAYACO",
        "energiaKwh": 85209,
        "horasOperacion": 110,
        "horasStandBy": 394,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 504,
        "fallaEvento": 0
      },
      {
        "equipo": "G102K",
        "campo": "COSTAYACO",
        "energiaKwh": 91530,
        "horasOperacion": 120,
        "horasStandBy": 384,
        "horasPP": 0,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 504,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-01",
        "campo": "VONU",
        "energiaKwh": 251747,
        "horasOperacion": 705,
        "horasStandBy": 23,
        "horasPP": 16,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-02",
        "campo": "VONU",
        "energiaKwh": 240151,
        "horasOperacion": 716,
        "horasStandBy": 13,
        "horasPP": 15,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-10",
        "campo": "COSTAYACO",
        "energiaKwh": 210864,
        "horasOperacion": 572,
        "horasStandBy": 164,
        "horasPP": 8,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-11",
        "campo": "COSTAYACO",
        "energiaKwh": 237646,
        "horasOperacion": 646,
        "horasStandBy": 82,
        "horasPP": 16,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      },
      {
        "equipo": "JIN-12",
        "campo": "COSTAYACO",
        "energiaKwh": 174995,
        "horasOperacion": 483,
        "horasStandBy": 253,
        "horasPP": 8,
        "horasPFContr": 0,
        "horasPFCli": 0,
        "horasCalDia": 744,
        "fallaEvento": 0
      }
    ],
    "totalGenerationKwh": 4424562,
    "machineIndicators": [
      {
        "unidad": "CPW01",
        "campo": "COSTAYACO",
        "horasStandBy": 63,
        "disponibilidadPct": 99.19,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin eventos correctivos. Indisponibilidad individual por sábana de mantenimiento; no afecta Sistema N. Meta Costayaco gas ≥98%."
      },
      {
        "unidad": "CPW02",
        "campo": "COSTAYACO",
        "horasStandBy": 165,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin eventos correctivos. Disponibilidad y confiabilidad plenas."
      },
      {
        "unidad": "CPW03",
        "campo": "COSTAYACO",
        "horasStandBy": 69,
        "disponibilidadPct": 99.06,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin eventos correctivos. Ventanas programadas absorbidas; Confiabilidad 100%. Meta ≥98%."
      },
      {
        "unidad": "CPW04",
        "campo": "COSTAYACO",
        "horasStandBy": 154,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin eventos correctivos. Disponibilidad y confiabilidad plenas."
      },
      {
        "unidad": "CPW05",
        "campo": "COSTAYACO",
        "horasStandBy": 54,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin eventos correctivos. Mayor aporte energético individual del mes."
      },
      {
        "unidad": "CPW06",
        "campo": "COSTAYACO",
        "horasStandBy": 97,
        "disponibilidadPct": 98.92,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin eventos correctivos. Cumple meta individual Costayaco gas ≥98%."
      },
      {
        "unidad": "CPW07",
        "campo": "COSTAYACO",
        "horasStandBy": 49,
        "disponibilidadPct": 99.19,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin eventos correctivos. Disponibilidad 99.19% / Confiabilidad 100%."
      },
      {
        "unidad": "JIN-10",
        "campo": "COSTAYACO",
        "horasStandBy": 164,
        "disponibilidadPct": 98.92,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin eventos correctivos. Indisponibilidad por sábana programada."
      },
      {
        "unidad": "JIN-11",
        "campo": "COSTAYACO",
        "horasStandBy": 82,
        "disponibilidadPct": 97.85,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Anexo GTE marca CUMPLE. Disp. 97.85% por PP de sábana (no FO). Confiabilidad 100%. Sistema N Costayaco no se afecta."
      },
      {
        "unidad": "JIN-12",
        "campo": "COSTAYACO",
        "horasStandBy": 253,
        "disponibilidadPct": 98.92,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin eventos correctivos. Cumple meta individual."
      },
      {
        "unidad": "G101V",
        "campo": "COSTAYACO",
        "horasStandBy": 394,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Diésel. Ventana de 21 días hasta solicitud de retiro del Coordinador GTE. No comparar mes completo vs julio sin normalizar."
      },
      {
        "unidad": "G102J",
        "campo": "COSTAYACO",
        "horasStandBy": 394,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Diésel. Ventana de 21 días hasta solicitud de retiro del Coordinador GTE. No comparar mes completo vs julio sin normalizar."
      },
      {
        "unidad": "G102K",
        "campo": "COSTAYACO",
        "horasStandBy": 384,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Diésel. Ventana de 21 días hasta solicitud de retiro del Coordinador GTE. No comparar mes completo vs julio sin normalizar."
      },
      {
        "unidad": "JIN-01",
        "campo": "VONU",
        "horasStandBy": 27,
        "disponibilidadPct": 97.85,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin eventos correctivos. Meta Vonú ≥90%. Horas de intervención documentadas."
      },
      {
        "unidad": "JIN-02",
        "campo": "VONU",
        "horasStandBy": 13,
        "disponibilidadPct": 97.98,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Sin eventos correctivos. Meta Vonú ≥90%."
      },
      {
        "unidad": "SISTEMA N",
        "campo": "COSTAYACO",
        "horasStandBy": 815,
        "disponibilidadPct": 100,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Oficial PDF ago-2026: Disp. 100.00% (+19.35 pp vs jul 80.65%). Conf. 100% (0 eventos). Energía Sistema CPW 3.717.498 kWh (+5.73% vs jul). Mantenimientos individuales absorbidos sin pérdida de función N. Meta ≥98%."
      },
      {
        "unidad": "SISTEMA N",
        "campo": "VONU",
        "horasStandBy": 40,
        "disponibilidadPct": 95.83,
        "confiabilidadPct": 100,
        "fallas": 0,
        "mtbfLabel": "Sin Fallas",
        "mttrHours": 0,
        "riesgoTecnico": "RIESGO BAJO",
        "cumplimiento": "CUMPLE",
        "detalle": "Oficial PDF ago-2026: Disp. 95.83% (bajo jul 98.79%, dentro de meta ≥90%). Conf. 100% (0 eventos). Energía 491.898 kWh. Sin señal correctiva."
      }
    ],
    "eventLog": [
      {
        "date": "2026-08-31",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "15:53 hrs. Parada manual generador CPW02 a solicitud de CCM para cambio de gas MRU a gas MQT  por estabilidad de gas de entrada MRU 15 psi. 15:54 hrs. Ingresa a linea con gas MQT",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-31",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "Equipo CPW-04, Disponible por baja presion en gas Moqueta.\r\n9:26 hrs. Ingresa a linea Generador CPW04 por salida del Generador CPW06. 11:36 hrs. Parada manual por ingreso a linea de generador CPW06\r\n14:05 hrs. Ingresa a linea solicitud de CCM generador CPW04 por estabilidad de gas MQT 160 psi",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 12 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-31",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "9:31 hrs. Des energizar generador COW06 y bloqueo Loto de la salida Q1dek tablero TDCPW02.\r\nActividad a ejecutar, retirar enclavamiento mecánico para conexionado y funcionamiento del sistema de aire propanado. 11:34 hrs. Ingresa a linea por finalización de maniobra.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 2 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-31",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "04:27 hrs. EQUIPO: JINAN-10. A solicitud de CCM. FDL por baja presión en gas Costayaco, 14 PSI.  //  Ingresa en linea a las 08:53 hrs.\r\n15:15 hrs. Parada manual generador CPW010 por estabilidad gas CYC 17 PSI. Equipo queda disponible.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 13 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-31",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "04:27 hrs. EQUIPO: JINAN-11. A solicitud de CCM. FDL por baja presión en gas Costayaco, 14 PSI\r\n8:00 hrs. Parada manual generador CPW011 por mantenimiento programado. Se termina a las 17:00 hrs. Equipo Queda disponible.",
        "downtimeHours": 9,
        "responsible": "COPOWER",
        "notes": "PP 9 h | SB 11 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-31",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "04:53 hrs. EQUIPO: JINAN-12. A solicitud de CCM. FDL por baja presión en gas tratado, 21 PSI. Ingresa a las 05:31 hrs.\r\n15:17 hrs. Parada manual generador CPW012 por estabilidad gas MRU 30 PSI. 17:10 hrs. Ingresa a linea por estabilidad gas MRU 46 psi.\r\n19:50 hrs. EQUIPO: JINAN-12. FDL. A solicitud del CCM. Por estabilidad en gas Tratado. Ingresa en linea a las 21:50 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 5 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-30",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "Equipo CPW-04, Disponible por baja presion en gas Moqueta.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 24 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-29",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "Equipo CPW-04, Disponible por baja presion en gas Moqueta.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 24 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-29",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "03:30 hrs. Equipo Jinan-10. A solicitud de CCM. parada manual por estabilidad de gas CYC. Ingresa en linea a las 04:55 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-28",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "14:19 hrs. A solicitud de CCM sale de linea generador CPW04 por estabilidad gas MQT 120 psi. 17:03 ingresa a linea por estabilidad de gas MQT 170 psi",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 18 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-28",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "04:06 hrs. EQUIPO: CPW-06. A solicitud de CCM. Entra en linea por estabilidad en gas Moqueta.\r\n06:38 hrs. A solicitud de CCM parada manual generador CPW06 por estabilidad del gas MQT 120 psi.  09:49 hrs. A solicitud de CCM ingresa a linea por estabilidad del gas MQT 180 psi.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-28",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "Mantenimiento preventivo (Data Soporte)",
        "downtimeHours": 8,
        "responsible": "COPOWER",
        "notes": "PP 8 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-28",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "04:05 hrs.EQUIPO. JINAN-11.  A solicitud de CCM. parada manual por estabilidad de gas CYC.\r\n06:34 hrs. A solicitud de CCM ingresa a linea generador CPW011 por estabilidad de gas CYC",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 2 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-27",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "14:19 hrs. A solicitud de CCM sale de linea generador CPW04 por estabilidad gas MQT 120 psi. 17:03 ingresa a linea por estabilidad de gas MQT 170 psi",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-27",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "04:06 hrs. EQUIPO: CPW-06. A solicitud de CCM. Entra en linea por estabilidad en gas Moqueta.\r\n06:38 hrs. A solicitud de CCM parada manual generador CPW06 por estabilidad del gas MQT 120 psi.  09:49 hrs. A solicitud de CCM ingresa a linea por estabilidad del gas MQT 180 psi.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-27",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "04:05 hrs.EQUIPO. JINAN-11.  A solicitud de CCM. parada manual por estabilidad de gas CYC.\r\n06:34 hrs. A solicitud de CCM ingresa a linea generador CPW011 por estabilidad de gas CYC",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 2 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-26",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "20:16 hrs. Equipo CPW-02. A solicitud del CCM.FDL por baja presion de gas Moqueta 115 PSI. Ingresa a las 22:01 Hrs. Operar con gas tratado.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-26",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "22:06 hrs. Equipo CPW-06. A solicitud del CCM.FDL por baja presion de gas Moqueta 120 PSI.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 2 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-26",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "00:25. Equipo CPW10. A solicitud de CCM FDL para estabilizar presión de gas CYC\r\n11:10 hrs. Ingresa a linea generador CPW010 a solicitud de CCM por estabilidad gas CYC\r\n16:09 hrs. Parada manual generador CPW010 a solicitud de CCM por estabilidad gas CYC, 16:20 hrs. Ingresa a linea",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 11 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-26",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "16:07 hrs. Parada manual generador CPW011 a solicitud de CCM por estabilidad gas CYC, 16:20 hrs. Ingresa a linea",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-26",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "01:08 hrs. A solicitud de CCM FDL. Para recuperar presion en gas CYC.  02:45 hrs. Ingresa equipo con gas tratado MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-25",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "10:02 hrs. EQUIPO: CPW-01. FDL por salida de la MRU. Ingresa en linea a las 10:29 hrs.---14:40 hrs. EQUIPO: CPW-01. FDL manual por mantenimiento semanal de la MRU Ingresa nuevamente en liea a las 19:38",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 5 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-25",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "10:02 hrs. EQUIPO: CPW-03. FDL por salida de la MRU. Ingresa en linea a las 10:37 hrs.----14:44 hrs. EQUIPO: CPW-03. FDL manual por mantenimiento semanal de la MRU  Ingresa nuevamente en liea a las 19:44",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 5 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-25",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "10:02 hrs. EQUIPO: CPW-06. FDL por salida de la MRU. Ingresa en linea a las 10:43 hrs.---14:43 hrs. EQUIPO: CPW-06. FDL manual por mantenimiento semanal de la MRU  Ingresa nuevamente en liea a las 19:50---15:29 hrs. EQUIPO: CPW-06. A solicitud del CCM. ingresa en linea, pasa a operar con gas Moqueta 182 PSI. //  FDL a las 17:30 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 4 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-25",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "10:02 hrs. EQUIPO: CPW-07. FDL por salida de la MRU. Ingresa en linea a las 10:50 hrs.---14:34 hrs. EQUIPO: CPW-07. FDL manual por mantenimiento semanal de la MRU  Ingresa nuevamente en liea a las 19:34",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-25",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "0:57 Sale de linea equipo Jinan 10 por baja presion de gas cyc 17 psi, Ingresa nuevamente en linea 03:44-----",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 2 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-25",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "16:59 pm. Salida de equipo CPW-11 por salida de la MRU, Ingresa en linea  nuevamente a las 18:03",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-25",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "1:25 Sale de linea equipo Jinan 12 por baja presion de gas cyc 17 psi, Ingresa nuevamente en linea 03:45",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 7 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-24",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "16:59 pm. Salida de equipo CPW-01 por salida de la MRU, Ingresa en linea  nuevamente a las 17:58",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-24",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "03:57 Salida de equipo CPW-02  por baja presion de gas MQT 120 psi ------06:43 hrs. Equipo CPW-02. A solicitud del CCM. Ingresan en linea, por estabilidad en gas Moqueta 170 PSI. // FDL a las 14:48 hrs. Por reeplazo del equipo 06 para poder incrementar carga en modo reparto.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 5 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-24",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "16:59 pm. Salida de equipo CPW-03 por salida de la MRU, Ingresa en linea  nuevamente a las 17:56",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-24",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "16:59 pm. Salida de equipo CPW-06 por salida de la MRU, Ingresa en linea  nuevamente a las 17:59",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 4 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-24",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "16:59 pm. Salida de equipo CPW-07 por salida de la MRU, Ingresa en linea  nuevamente a las 17:59",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-24",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "0:57 Sale de linea equipo Jinan 10 por baja presion de gas cyc 17 psi, Ingresa nuevamente en linea 03:44-----",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 3 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-24",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "16:59 pm. Salida de equipo CPW-11 por salida de la MRU, Ingresa en linea  nuevamente a las 18:03",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-24",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "1:25 Sale de linea equipo Jinan 12 por baja presion de gas cyc 17 psi, Ingresa nuevamente en linea 03:45",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 3 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-23",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "0:12 Sale de linea equipo CPW02 por baja presion de gas MQT 120 psi ingresa nuevamente en linea a las 4:20 am por alta presion de gas MQT 175 psi------07:17 hrs. EQUIPO: CPW-02. A solicitud del CCM, FDL por baja presión de gas Moqueta 100 PSI. Entra en linea a las 15:15. A solicitud del CCM, Entra en linea por estabilidad en presión de gas Moqueta 175 PSI.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 16 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-23",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "4:00 Sale de linea CPW 10 por baja presion de gas CYC fuertes lluvias en la zona---07:56 hrs. EQUIPO: Jinan-10.  A solicitud del CCM, Ingresa en linea con suministro de gas Costayaco. // . A la 09:37 horas.  FDL. A solicitud del CCM, FDL por baja presión en gas CYC 16 PSI.----11:56 hrs. EQUIPO: Jinan-10. A solicitud del CCM, Entra en linea con suministro de gas Costayaco.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-23",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "4:22 Sale de linea CPW 12 por baja presion de gas CYC fuertes lluvias en la zona---14:23 hrs. EQUIPO: Jinan-12. A solicitud del CCM, Entra en linea con suministro de gas Costayaco.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 10 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-21",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "Mantenimiento preventivo (Data Soporte)",
        "downtimeHours": 8,
        "responsible": "COPOWER",
        "notes": "PP 8 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-20",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "Mantenimiento preventivo (Data Soporte)",
        "downtimeHours": 8,
        "responsible": "COPOWER",
        "notes": "PP 8 h | SB 16 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-19",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Mantenimiento preventivo (Data Soporte)",
        "downtimeHours": 6,
        "responsible": "COPOWER",
        "notes": "PP 6 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-18",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Mantenimiento preventivo (Data Soporte)",
        "downtimeHours": 8,
        "responsible": "COPOWER",
        "notes": "PP 8 h | SB 4 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-17",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "Mantenimiento preventivo (Data Soporte)",
        "downtimeHours": 6,
        "responsible": "COPOWER",
        "notes": "PP 6 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-11",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "Mantenimiento preventivo (Data Soporte)",
        "downtimeHours": 7,
        "responsible": "COPOWER",
        "notes": "PP 7 h | SB 5 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-10",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "10:59 hrs. Generador CPW01  parada manual a solicitud de CCM  por mantenimiento programado  a la MRU, Ingresa en linea a las 22:01 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 11 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-10",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "10:59 hrs. Generador CPW02  parada manual a solicitud de CCM  por mantenimiento programado  a la MRU, Ingresa en linea a las 21:46 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 10 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-10",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "11:01 hrs. Generador CPW03  parada manual a solicitud de CCM  por mantenimiento programado  a la MRU,  Ingresa en linea a las 21:44 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 11 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-10",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "13:11 hrs A solicitud del CCM. parada manual del generador CPW05 por baja presión de gas MQT 120 psi. 15:41 hrs  equipo ingresa a linea por estabilidad del gas MQT 180 psi.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 2 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-10",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "02:29 hrs. Equipo CPW-06. A solicitud del CCM, FDL por baja presión en gas Moqueta, 100 PSI.\r\n10:51 hrs. Generador CPW06  ingresa a linea a solicitud de CCM  por estabilidad gas MQT 180 psi,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 8 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-10",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "11:04 hrs. Generador CPW07  parada manual a solicitud de CCM  por mantenimiento programado  a la MRU, Ingresa en linea a las 21:37 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 10 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-10",
        "equipment": "G102J",
        "eventType": "Operativo",
        "cause": "08:41 hrs  a solicitud del CCM. Generador G102J ingresa a linea como respaldo por caída de tensión en el SIN. 11:20 hrs sale de linea a solicitud de CCM\r\n21:22 hrs. EQUIPO:G102J. A solicitud del CCM. ingresa a linea Por salida de equipo Jinan-11 alineado a gas Costayaco. FDL a las 21:56 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 21 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-10",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "9:19 hrs generador JINAN 02  parada manual por mantenimiento programado, 16:12 finaliza mantenimiento programado equipo ingresa a linea.",
        "downtimeHours": 7,
        "responsible": "COPOWER",
        "notes": "PP 7 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-10",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "11:05 hrs. A solicitud de CCM Generador CPW011 se realiza cambio de gas MRU a gas CYC\r\n21:19 hrs. EQUIPO: Jinan-11, FDL A solicitud del CCM, FDL por prioridad gas Costayaco a MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-10",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "22:13 hrs. EQUIPO: Jinan-12, A solicitud del CCM, FDL por prioridad gas Costayaco a MRU. Ingresa en linea a las 22:49 hrs, A solicitud del CCM, Ingresa en linea con suministro de gas tratado.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 2 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-09",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "00:07 hrs. EQUIPO: CPW-06, FDL a solicitu del CCM, por baja presion en gas Moqueta, 100 PSI\r\n04:14 hrs. Equipo CPW06. ingresa en linea A solicitud del CCM, entra en linea por estabilidad en presión gas Moqueta 170 PSI.\r\n 05:38 hrs sale equipo de linea por potencia inversa al momento de pasar equipo a operación a modo isla. 6:16 equipo ingresa en linea en carga base con gas MQT\r\n16:34 A solicitud de ccm sale de linea equipo CPW06 parada manual por caída de presión de gas MQT.\r\n19:54 hrs. EQUIPO: CPW06, A solicitud del CCM, ingresa en linea por estabilidad de presión en gas Moqueta, 170 PSI.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 8 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-09",
        "equipment": "G102J",
        "eventType": "Operativo",
        "cause": "04:30 hrs. Equipos diesel G102J & G102K, A solicitud del CCM, entran en linea por operación en modo isla.\r\n15:58 A solicitud de ccm sale de linea equipo G102J parada manual.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 12 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-09",
        "equipment": "G102K",
        "eventType": "Operativo",
        "cause": "04:30 hrs. Equipos diesel G102J & G102K, A solicitud del CCM, entran en linea por operación en modo isla.\r\n08:32 hrs sale de linea equipo G102K a peticion de CCM.\r\n14:53 Ingresa equipo G102K en linea a peticion del CCM. 15:15 sale equipo con parada manual por orden de CCM.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 19 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-08",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "15:41 CPW-01 sale de linea por falla de comunicación CAN",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-08",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "15:39 CPW-04 sale de linea a petición de CCM por baja de presión gas MQT 119psi\r\n17:16 hrs. EQUIPO: CPW-04. A solicitud del CCM, entra en linea por estabilidad en presión gas Moqueta",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 4 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-08",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "02:42 hrs. EQUIPO: CPW-06, A solicitud del CCM, FDL para recuperar presión de gas Moqueta 105 PSI\r\n07:50 CPW-06 ingresa en linea con 800KW a peticion de CCM por recuperación de presión gas MQT 177psi\r\n09:50 CPW-06 sale de linea a petición de CCM por baja de presión gas MQT 119psi\r\n 13:20 CPW-06 ingresa en linea con 800KW a petición de CCM por recuperación de presión gas MQT 180psi",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 8 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-08",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "Equipo disponible ppr baja presion en suministro de gas\r\n2:52 hrs. EQUIPO: Jinan-11, A solicitud del CCM, ingresa en linea con suministro de gas tratado.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 3 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-08",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "Equipo disponible por baja presion en suministro de gas\r\n11:23 CPW-12 ingresa en linea a petición de CCM alineado con gas CYC\r\n15:46 cpw-12 sale de linea por que asume carga por la salida del CPW-01 y sale por alta temperatura de cilindro",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 11 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-07",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "06:40 A solocitud de CCM Sale de linea equipo CPW01 por apagado de MRU por cambio de filtro  presión aceite Quincy en 78 psig, a 4 del disparo. 09.35 A solicitud de CCM, ingresa en linea equipo CPW-01 alineado con gas MRU.\r\n14:23 sale de linea equipo CPW01 por sd alta temperatura en cilindro 19, 14:49 equipo ingres en linea alineado con gas MRU.\r\n17:17 hrs. FDL Equipo CPW01, por apagado de la MRU, ingresa a las 20:21 hrs",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 7 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-07",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "06:41 A solocitud de CCM Sale de linea equipo CPW02 por apagado de MRU por cambio de filtro  presión aceite Quincy en 78 psig, a 4 del disparo.\r\n09:32 A solicitud de CCM, ingresa en linea equipo CPW-02 alineado con gas MRU.\r\n17:17 hrs. FDL Equipo CPW02, por apagado de la MRU, ingresa a las 20:18 hrs",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-07",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "06:43 A solocitud de CCM Sale de linea equipo CPW03 por apagado de MRU por cambio de filtro  presión aceite Quincy en 78 psig, a 4 del disparo.\r\n17:03 Equipo CPW03  ingresa en linea se finalizo mantenimiento preventivo, 17:17 sale de linea por protección apagado de MRU.\r\n17:17 hrs. FDL Equipo CPW03, por apagado de la MRU, ingresa a las 20:14 hrs",
        "downtimeHours": 7,
        "responsible": "COPOWER",
        "notes": "PP 7 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-07",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "12:48 Sale de linea equipo CPW04 por detonación, 12:58 Equipo ingresa en linea.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-07",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "01:00 hrs. EQUIPO: CPW05, Ingresa en linea a solicitud del CCM, por estabilidad en gas Moqueta 160 PSI.\r\n03:50 EQUIPO: CPW05, FDL,  a solicitud del CCM, por baja presion en gas Moqueta 105 PSI.\r\n09:09 A solicitud de CCM, ingresa en linea equipo CPW-05 alineado con gas MQT",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-07",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "11:34 Sale de linea equipo CPW06 parada manual, por baja presión de gas MQT.\r\n14:01 A solicitud de CCM, ingresa en linea equipo CPW-06 alineado con gas MQT.\r\n18:12 hrs. FDL Equipo CPW06, por baja presion de gas Moqueta 100 PSI, ingresa en linea a las 20:47 hrs",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 5 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-07",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "06:46 A solocitud de CCM Sale de linea equipo CPW07 por apagado de MRU por cambio de filtro  presión aceite Quincy en 78 psig, a 4 del disparo.\r\n09:29 A solicitud de CCM, ingresa en linea equipo CPW-07 alineado con gas MRU.\r\n10:35 Sale de linea equipo CPW07 por detonación, se informo a ccm antes de salir de linea que equipos gas MRU y gas MQT, presentan altas vibraciones KNOCK. 10:50 equipo ingresa en linea con gas MRU.\r\n17:17 hrs. FDL Equipo CPW07, por apagado de la MRU, ingresa a las 20:15 hrs",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-07",
        "equipment": "G101V",
        "eventType": "Operativo",
        "cause": "17:55 Ingresa en linea equipo Diesel G101V como respaldo de carga, por salida equipos por apagado MRU. FDL a las 20:45 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 22 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-07",
        "equipment": "G102J",
        "eventType": "Operativo",
        "cause": "06:34 A solocitud de CCM Ingresa en linea equipos DIESEL G102J, como respaldo de carga.\r\n10:24  A solicitud de CCM sale de linea parada manual equipo Diesel G102J.\r\n17:30 Ingresa en linea equipo Diesel G102J como respaldo de carga. por salida equipos por apagado MRU. FDL a als 20:50 hrs",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 17 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-07",
        "equipment": "G102K",
        "eventType": "Operativo",
        "cause": "06:34  A solocitud de CCM Ingresa en linea equipos DIESEL G102K como respaldo de carga.\r\n10:26  A solicitud de CCM sale de linea parada manual equipo Diesel G102K.\r\n17:41 Ingresa en linea equipo Diesel G102K como respaldo de carga, por salida equipos por apagado MRU. FDL a las 20:52 hrs",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 16 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-07",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "06:54 A solocitud de CCM Ingresa en linea equipos CPW10, alineado con gas Costayaco.\r\n09:10 A solicitud de CCM sale de linea parada manual equipo CPW10, en stand by disponible.\r\n10:52 A solicitud de CCM, ingresa en linea equipo CPW-10 alineado con gas CYC.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 9 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-07",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "06:47 A solocitud de CCM Sale de linea equipo CPW11 por apagado de MRU por cambio de filtro  presión aceite Quincy en 78 psig, a 4 del disparo.\r\n10:12  A solicitud de CCM, ingresa en linea equipo CPW-11 alineado con gas MRU.\r\n17:17 salen de linea Equipo CPW011 por protección apagado de MRU.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 10 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-07",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "06:58 A solocitud de CCM Ingresa en linea equipos CPW12, alineado con gas Costayaco.\r\n08:17 A solicitud de CCM sale de linea parada manual equipo CPW12.\r\n10:13  A solicitud de CCM, ingresa en linea equipo CPW-12 alineado con gas MRU.\r\n12:48 sale de linea equipo CPW12 por sobrecarga del generador al momento de la salida de linea equipo CPW04: 12:56 Equipo ingresa en linea.\r\n17:02 sale de linea equipo CPW12 parada manual por rotación de equipo, ingresa en linea CPW03.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 16 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-06",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "Equipo disponible desde el dia anterio.\r\n04:28 hrs. En coordinacion con el CCM se hace rotacion de equipos, entra en linea el CPW-01, FDL equipo CPW-02, queda disponible con suministro de gas Moqueta",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 4 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-06",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "04:28 hrs. En coordinacion con el CCM se hace rotacion de equipos, entra en linea el CPW-01, FDL equipo CPW-02, queda disponible con suministro de gas Moqueta\r\n07:10 En coordinación de CCM ingresa en linea CPW02, alineado con gas MQT como respaldo de carga. por mantenimiento preventivo programado equipo CPW06. 08:32 En coordinación de CCM sale de linea CPW02, por caída de presión de gas MQT 110 psi.\r\n09:38 En coordinación de CCM ingresa en linea Equipo CPW02, alineado con gas MOQUETA",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 3 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-06",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "15:07 sale de linea parada manual equipo cpw-04 por baja presión de gas MQT, 15:56 revisión y arranque manual del equipo, ingresa alineado con gas MQT.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 1 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-06",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "18:12 Horas. FDL eqipo cpw05, a solicitud del CCM, por baja presion en gas Moqueta. 110 PSI.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-06",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "07:13 sale de linea equipo CPW06 parada manual por mantenimiento preventivo programado, como respaldo de carga ingresa CPW02. 16:02 ingresa en linea equipo cpw06 alineado con gas MOQUETA, se finaliza mantenimiento preventivo correctivo.",
        "downtimeHours": 8,
        "responsible": "COPOWER",
        "notes": "PP 8 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-06",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "Equipo disponible desde el dia anterior\r\nEquipo Jinan-10 Disponible por baja presion en gas Costayaco",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 24 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-06",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "Equipo disponible desde el dia anterior\r\n11:32 A solicitud de CCM ingresa en linea equipo CPW011, alineado con gas tratado MRU.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 12 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-06",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "Equipo disponible desde el dia anterior\r\nEquipo Jinan-12 Disponible por bajo suministro en gas tratado MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 24 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-05",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "01:26 Ingresa en linea equipo CPW-01 con gas tratado MRU peticion operador de CCM\r\n6:00 Sale de linea equipo cpw-01 a peticion del operador de ccm",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 19 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-05",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "01:48 Ingresa equipo cpw-02 con gas MQT para controlar presion  177 psi\r\n3:37 Sale de linea el equipo cpw-02 a peticion del operador de ccm\r\n15:47 a solicitud de ccm ingresa en linea equipo CPW02, alineado con gas MRU. 16:48 sale de linea por solicitud de ccm, a causa salida sistema de inyección.\r\n 20:29 hrs. Equipo CPW02. A solicitud del CCM, entra en linea con suministro de gas Moqueta. A las 23:15 pasa a operar con gas tratado.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 17 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-05",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "2:55 Ingresa equipo cpw-03 con gas MRU a petion del operador de ccm\r\n20:04 hrs. EQUIPO: CPW03, 06, 07 & 11, FDL por apagado de la MRU. Ingresa a als 23:10 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-05",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "20:04 hrs. EQUIPO: CPW03, 06, 07 & 11, FDL por apagado de la MRU. Ingresa a las 23:43 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 4 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-05",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "20:04 hrs. EQUIPO: CPW03, 06, 07 & 11, FDL por apagado de la MRU. Ingresa a las 23:46 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 4 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-05",
        "equipment": "G101V",
        "eventType": "Operativo",
        "cause": "20:10 hrs. A solicitud del CCM. por salida de la MRU. FDL a las 20:51 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 24 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-05",
        "equipment": "G102J",
        "eventType": "Operativo",
        "cause": "20:25 hrs. A solicitud del CCM. por salida de la MRU. FDL a las 20:49 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 23 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-05",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "FDL desde la 10:30 del 04-08-2026 // 16:15 A solicitud del CCM, ingresa en linea equipo JINAN01 alineado con gas VONU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 17 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-05",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "01:21Sale de linea jinan 10 por peticion de operador CCM\r\n22:43 hrs. Ingresa en linea a solicitud del CCM equipo Jinan-10. FDL a las 23:48 hrs.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 21 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-05",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "4:00 Ingresa equipo jinan-11 con gas tratado MRU a peticion del operador dr ccm\r\n20:04 hrs. EQUIPO: CPW03, 06, 07 & 11, FDL por apagado de la MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 8 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-04",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "01:03 ingresa equipo CPW01 alineado con gas MRU,,,,08:41 hrs. Generador CPW01  parada manual a solicitud de CCM  por mantenimiento programado  a la MRU, 15:55  hrs. Equipo ingresa en linea con gas MRU---23:42 Sale de linea equipo CPW01 a peticion de operador de ccm",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 8 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-04",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "0:44 Ingresa en linea equipo CPW02 alineado con gas moqueta 170 psi----3:00 Sale de linea equipo CpW 02 baja presion de gas MQT 120psi,,,10:28hrs. Generador CPW02 ingresa a linea a solicitud de CCM con gas MQT por estabilidad en la linea 172psi. 14:15 hrs. Sale de linea por estabilidad gas MQT 110PSI,,,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 17 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-04",
        "equipment": "CPW03",
        "eventType": "Operativo",
        "cause": "0:55 Ingresa equipo CPW03 alineado con gas MRU ---08:41 hrs. Generador CPW03  parada manual a solicitud de CCM  por mantenimiento programado  a la MRU,  15:57   hrs. Equipo ingresa en linea con gas MRU----23:45 Sale de linea equipo CPW03 a peticion de operador de ccm",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 8 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-04",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "03:53 ingresa en linea equipo Cpw06 una vez estabiliza presion de gas MRU ,,,08:38 hrs. Generador CPW06  parada manual a solicitud de CCM  por mantenimiento programado  a la MRU,  16:32  hrs. Equipo ingresa en linea con gas MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 11 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-04",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "0:55 Ingresa equipo CPW07 alineado con gas MRU ,,,,08:37hrs. Generador CPW07  parada manual a solicitud de CCM  por mantenimiento programado  a la MRU, 16:05  hrs. Equipo ingresa en linea con gas MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 8 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-04",
        "equipment": "G101V",
        "eventType": "Operativo",
        "cause": "14:10hrs. Generador G101V ingresa a linea a solicitud de CCM  ,  16:19  hrs sale de linea a solicitud de CCM ,,,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 22 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-04",
        "equipment": "G102J",
        "eventType": "Operativo",
        "cause": "08:34hrs. Generador G102J ingresa a linea a solicitud de CCM por mantenimiento programado  a la MRU, 16:14  hrs sale de linea a solicitud de CCM ,,,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 15 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-04",
        "equipment": "G102K",
        "eventType": "Operativo",
        "cause": "08:34hrs. Generador G102k ingresa a linea a solicitud de CCM  por mantenimiento programado  a la MRU, 16:14  hrs sale de linea a solicitud de CCM ,,,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 16 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-04",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "05:50 Ingres en linea equipo CPW10 con gas CYC,,,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-04",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "7:01:00 p. m.ingresa en linea equipo cpw 11 con gas tratado MRU,,,09:01hrs. Generador CPW011 ingresa a linea a solicitud de CCM con gas CYC. 14:05 Parada manual por ingreso de la MRU----23:37 Sale de linea equipo CPW11 a peticion de operador de ccm",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 14 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-04",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "09:22hrs. Generador CPW012 ingresa a linea a solicitud de CCM con gas CYC. 14:07 Parada manual por ingreso de la MRU,,,",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 19 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-03",
        "equipment": "CPW01",
        "eventType": "Operativo",
        "cause": "10:17 hrs. Generador CPW01  parada manual a solicitud de CCM por parada de MRU por cambio de filtros, 12:32 hrs. Equipo ingresa en linea con gas MRU-----22:44 Sale de linea equipo CPW-01 por salida de MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 4 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-03",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "12:43 hrs. Generador CPW02 ingresa a linea a solicitud de CCM con gas MRU-----22:44 Sale de linea equipo CPW-02 por salida de MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 14 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-03",
        "equipment": "CPW06",
        "eventType": "Operativo",
        "cause": "10:32 hrs. Generador CPW06  parada manual a solicitud de CCM por parada de MRU por cambio de filtros, 12:50 hrs. Equipo ingresa en linea con gas MRU----22:44 Sale de linea equipo CPW-06 por salida de MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 3 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-03",
        "equipment": "CPW07",
        "eventType": "Operativo",
        "cause": "22:44 Sale de linea equipo CPW-07 por salida de MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 3 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-03",
        "equipment": "G101V",
        "eventType": "Operativo",
        "cause": "10:12hrs. Generador G101V ingresa a linea a solicitud de CCM por salida de generacion asociada a la MRU, 13:00hrs sale de linea a solicitud de CCM",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 21 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-03",
        "equipment": "G102J",
        "eventType": "Operativo",
        "cause": "10:10hrs. Generador G102J ingresa a linea a solicitud de CCM por salida de generacion asociada a la MRU, 12:56hrs sale de linea a solicitud de CCM",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 20 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-03",
        "equipment": "G102K",
        "eventType": "Operativo",
        "cause": "10:10hrs. Generador G102k ingresa a linea a solicitud de CCM por salida de generacion asociada a la MRU, 12:56hrs sale de linea a solicitud de CCM",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 21 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-03",
        "equipment": "JIN-01",
        "eventType": "Operativo",
        "cause": "09:00 hrs. EQUIPO: Jinan-01, A solicitud de Copower, se inicia mantenimiento preventivo programado.----20:50 Ingresa en linea jinan 01 campo Vonu-----Sale de linea por vector Shift a la hora de evento salida de generacion por MRU",
        "downtimeHours": 8,
        "responsible": "COPOWER",
        "notes": "PP 8 h | SB 4 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-03",
        "equipment": "JIN-02",
        "eventType": "Operativo",
        "cause": "09:20 hrs. A solicitud del CCM, sale de linea generador JINAN02 Por apertura de Reconectador R18, para realizar trabajo de tendido de fibra òptica por parte de la empresa de KFJ-------20:20 Ingresa en linea jinan 02 campo Vonu---- Sale de linea por vector Shift a la hora de evento salida de generacion por MRU",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 11 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-03",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "07:37 hrs. EQUIPO: Jinan-10, A solicitud del CCM, entra en linea con suministro de gas Costayaco.----19:57 A solicitud del CCM. ingresa equipo CPW10 con gas CYC.----23:36 Sale de linea CPW 10 por naja presion de gas CYC 13 psi",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 16 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-03",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "10:22 hrs. Generador CPW011 parada manual a solicitud de CCM por cambio de gas MRU a gas CYC, 10:29 hrs. Equipo ingresa en linea con gas CYC-----12:20 hrs. Generador CPW011 parada manual a solicitud de CCM por baja presion de gas CYC, 14:25 hrs. Ingresa a linea a solicitud CCM con gas MRU---14:27 hrs. EQUIPO: Jinan-11. A solicitud del CCM. Ingresa en linea con suministro de gas tratado.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 3 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-03",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "22:47 Sale de linea CPW12 por baja presion de gas CYC15 psi",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 22 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-02",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "18:00 hrs. EQUIPO:CPW-02, A solicitud del CCM, Ingresan con gas Moqueta----19:54. EQUIPO:CPW-02, A solicitud del CCM, sale de linea para recuperar presion de gas moqueta 119 psi",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 22 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-02",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "14:20 hrs. EQUIPO:CPW-04, A solicitud del CCM, Ingresan con gas Moqueta",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 14 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-02",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "14:42 hrs. EQUIPO:CPW-05, A solicitud del CCM, Ingresan con gas Moqueta",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 15 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-02",
        "equipment": "G102J",
        "eventType": "Operativo",
        "cause": "8:24 EQUIPO:G102J, A solicitud del CCM, entran en linea.  Por inicio de maniobras para pasar equipos de reparto de carga a carga base para cambio de control de frontera",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 22 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-02",
        "equipment": "G102K",
        "eventType": "Operativo",
        "cause": "8:23 EQUIPO:G102K, A solicitud del CCM, entran en linea. Por inicio de maniobras para pasar equipos de reparto de carga a carga base para cambio de control de frontera",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 21 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-01",
        "equipment": "CPW02",
        "eventType": "Operativo",
        "cause": "24 horas de stand by por trabajos en linea de gas moqueta",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 24 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-01",
        "equipment": "CPW04",
        "eventType": "Operativo",
        "cause": "24 horas de stand by por trabajos en linea de gas moqueta",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 24 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-01",
        "equipment": "CPW05",
        "eventType": "Operativo",
        "cause": "24 horas de stand by por trabajos en linea de gas moqueta",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 24 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-01",
        "equipment": "JIN-10",
        "eventType": "Operativo",
        "cause": "9:00 hrs. Equipo Jinan-10, entra a mantenimiento preventivo programado, se termina a las 15:00 hrs. Equipo queda disponible.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 6 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-01",
        "equipment": "JIN-11",
        "eventType": "Operativo",
        "cause": "06:06 Se ingresa en linea equipo Jinan-11, en coordinacion con el CCM se realiza rotacion de operación del equipo con el Jinan 12.",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 0 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      },
      {
        "date": "2026-08-01",
        "equipment": "JIN-12",
        "eventType": "Operativo",
        "cause": "6:06 Sale de linea y se realiza rotacion con equipo jinan 11",
        "downtimeHours": 0,
        "responsible": "COPOWER",
        "notes": "PP 0 h | SB 24 h | PF_contr 0 h | PF_cli 0 h | Falla_evento 0"
      }
    ],
    "kpi": {
      "availability": 1,
      "reliability": 1,
      "maintainability": null,
      "generationMwh": 4424.562,
      "operationalLossesMwh": null,
      "contractualCompliance": 1
    },
    "kpiExcel": {
      "availability": 1,
      "reliability": 1,
      "mtbfHours": null,
      "mttrHours": 0
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
