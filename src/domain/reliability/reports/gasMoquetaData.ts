/** Generado por scripts/etl-gas-moqueta.mjs — no editar a mano. */
export type GasMoquetaInterval = {
  from: string;
  to: string;
  spanDays: number;
  gasMcf: number;
  energyKwh: number;
  heatRateFt3Kwh: number;
};

export type GasMoquetaDay = {
  date: string;
  /** Gas asignado al día repartiendo cada delta del totalizador por energía. */
  gasMcf: number | null;
  energyKwh: number;
  heatRateFt3Kwh: number | null;
  pressureMqtPsi: number | null;
};

export type GasNominalPower = {
  unit: string;
  /** Set point máximo registrado en el mes: nominal de diseño en operación. */
  designKw: number;
  /** Promedio del set point: refleja el derateo aplicado por detonación. */
  operatedKw: number;
  deratedReadings: number;
  readings: number;
};

export type GasUnitWindow = {
  unit: string;
  energyKwh: number;
  opHours: number;
};

export type GasMoquetaMonth = {
  monthKey: string;
  monthLabel: string;
  yearMonth: string;
  units: string[];
  from: string;
  to: string;
  fromHour: number;
  toHour: number;
  spanDays: number;
  calendarDays: number;
  readingsRaw: number;
  readingsUsed: number;
  readingsDiscarded: number;
  daysWithoutEnergy: number;
  gasMcf: number;
  gasMcfPerDay: number;
  energyKwh: number;
  opHours: number;
  heatRateFt3Kwh: number | null;
  pressureMqtAvgPsi: number | null;
  pressureMqtMinPsi: number | null;
  lowPressureReadings: number;
  nominalPower: GasNominalPower[];
  unitsInWindow: GasUnitWindow[];
  intervals: GasMoquetaInterval[];
  daily: GasMoquetaDay[];
};

export type GasMoquetaPack = {
  sourceFile: string;
  dataSoporteFiles: string[];
  extractedAt: string;
  units: string[];
  notes: string;
  months: GasMoquetaMonth[];
};

export const GAS_MOQUETA: GasMoquetaPack = {
  "sourceFile": "data/eficiencia/parametros operacion gas moquta.xlsx",
  "dataSoporteFiles": [
    "data/GTE/Junio/Data Soporte Cálculo Copower PUTN Junio 2026 (1).xlsx",
    "data/Julio/GTE/Data Soporte Cálculo Copower PUTN Julio 2026.xlsx"
  ],
  "extractedAt": "2026-08-12",
  "units": [
    "CPW04",
    "CPW05",
    "CPW06"
  ],
  "notes": "Heat rate medido: delta del totalizador de gas Moqueta contra energía diaria del Data Soporte de las unidades reguladas por Medenus (CPW04–CPW06). El poder calorífico se parametriza aparte.",
  "months": [
    {
      "monthKey": "Jun",
      "monthLabel": "Junio",
      "yearMonth": "2026-06",
      "units": [
        "CPW04",
        "CPW05",
        "CPW06"
      ],
      "from": "2026-06-01",
      "to": "2026-06-30",
      "fromHour": 10.83,
      "toHour": 17,
      "spanDays": 29.26,
      "calendarDays": 30,
      "readingsRaw": 95,
      "readingsUsed": 89,
      "readingsDiscarded": 6,
      "daysWithoutEnergy": 0,
      "gasMcf": 14566.9,
      "gasMcfPerDay": 497.9,
      "energyKwh": 1635451,
      "opHours": 2022.6,
      "heatRateFt3Kwh": 8.907,
      "pressureMqtAvgPsi": 151.8,
      "pressureMqtMinPsi": 120,
      "lowPressureReadings": 3,
      "nominalPower": [
        {
          "unit": "CPW01",
          "designKw": 780,
          "operatedKw": 763.1,
          "deratedReadings": 35,
          "readings": 83
        },
        {
          "unit": "CPW02",
          "designKw": 780,
          "operatedKw": 780,
          "deratedReadings": 0,
          "readings": 92
        },
        {
          "unit": "CPW03",
          "designKw": 780,
          "operatedKw": 780,
          "deratedReadings": 0,
          "readings": 92
        },
        {
          "unit": "CPW04",
          "designKw": 1040,
          "operatedKw": 1040,
          "deratedReadings": 0,
          "readings": 97
        },
        {
          "unit": "CPW05",
          "designKw": 1040,
          "operatedKw": 1035.9,
          "deratedReadings": 9,
          "readings": 97
        },
        {
          "unit": "CPW06",
          "designKw": 1040,
          "operatedKw": 1031.3,
          "deratedReadings": 21,
          "readings": 97
        },
        {
          "unit": "JIN-10",
          "designKw": 450,
          "operatedKw": 415.8,
          "deratedReadings": 42,
          "readings": 83
        },
        {
          "unit": "JIN-11",
          "designKw": 400,
          "operatedKw": 383.2,
          "deratedReadings": 21,
          "readings": 25
        },
        {
          "unit": "JIN-12",
          "designKw": 400,
          "operatedKw": 383.2,
          "deratedReadings": 34,
          "readings": 44
        }
      ],
      "unitsInWindow": [
        {
          "unit": "CPW04",
          "energyKwh": 553671,
          "opHours": 690.2
        },
        {
          "unit": "CPW05",
          "energyKwh": 552650,
          "opHours": 681.5
        },
        {
          "unit": "CPW06",
          "energyKwh": 529130,
          "opHours": 651
        }
      ],
      "intervals": [
        {
          "from": "2026-06-01",
          "to": "2026-06-01",
          "spanDays": 0.125,
          "gasMcf": 58.75,
          "energyKwh": 14543.5,
          "heatRateFt3Kwh": 4.04
        },
        {
          "from": "2026-06-01",
          "to": "2026-06-02",
          "spanDays": 0.618,
          "gasMcf": 316.82,
          "energyKwh": 29132.1,
          "heatRateFt3Kwh": 10.875
        },
        {
          "from": "2026-06-02",
          "to": "2026-06-02",
          "spanDays": 0.125,
          "gasMcf": 65.42,
          "energyKwh": 13624.1,
          "heatRateFt3Kwh": 4.802
        },
        {
          "from": "2026-06-02",
          "to": "2026-06-02",
          "spanDays": 0.16,
          "gasMcf": 70.83,
          "energyKwh": 15733.6,
          "heatRateFt3Kwh": 4.502
        },
        {
          "from": "2026-06-02",
          "to": "2026-06-03",
          "spanDays": 0.771,
          "gasMcf": 375.53,
          "energyKwh": 37952.6,
          "heatRateFt3Kwh": 9.895
        },
        {
          "from": "2026-06-03",
          "to": "2026-06-03",
          "spanDays": 0.229,
          "gasMcf": 97.32,
          "energyKwh": 19099.4,
          "heatRateFt3Kwh": 5.095
        },
        {
          "from": "2026-06-03",
          "to": "2026-06-04",
          "spanDays": 0.542,
          "gasMcf": 274.8,
          "energyKwh": 32109.2,
          "heatRateFt3Kwh": 8.558
        },
        {
          "from": "2026-06-04",
          "to": "2026-06-04",
          "spanDays": 0.167,
          "gasMcf": 91.74,
          "energyKwh": 21108.9,
          "heatRateFt3Kwh": 4.346
        },
        {
          "from": "2026-06-04",
          "to": "2026-06-04",
          "spanDays": 0.17,
          "gasMcf": 91.41,
          "energyKwh": 21209.4,
          "heatRateFt3Kwh": 4.31
        },
        {
          "from": "2026-06-04",
          "to": "2026-06-05",
          "spanDays": 0.58,
          "gasMcf": 295.3,
          "energyKwh": 37607.2,
          "heatRateFt3Kwh": 7.852
        },
        {
          "from": "2026-06-05",
          "to": "2026-06-05",
          "spanDays": 0.229,
          "gasMcf": 98.71,
          "energyKwh": 23899.1,
          "heatRateFt3Kwh": 4.13
        },
        {
          "from": "2026-06-05",
          "to": "2026-06-06",
          "spanDays": 0.542,
          "gasMcf": 280.85,
          "energyKwh": 34889.8,
          "heatRateFt3Kwh": 8.05
        },
        {
          "from": "2026-06-06",
          "to": "2026-06-08",
          "spanDays": 1.604,
          "gasMcf": 799.77,
          "energyKwh": 101292.8,
          "heatRateFt3Kwh": 7.896
        },
        {
          "from": "2026-06-08",
          "to": "2026-06-08",
          "spanDays": 0.229,
          "gasMcf": 112.77,
          "energyKwh": 22832.7,
          "heatRateFt3Kwh": 4.939
        },
        {
          "from": "2026-06-08",
          "to": "2026-06-08",
          "spanDays": 0.167,
          "gasMcf": 81.9,
          "energyKwh": 20388.2,
          "heatRateFt3Kwh": 4.017
        },
        {
          "from": "2026-06-08",
          "to": "2026-06-09",
          "spanDays": 0.59,
          "gasMcf": 281.64,
          "energyKwh": 35995.6,
          "heatRateFt3Kwh": 7.824
        },
        {
          "from": "2026-06-09",
          "to": "2026-06-10",
          "spanDays": 0.938,
          "gasMcf": 483.11,
          "energyKwh": 56830.3,
          "heatRateFt3Kwh": 8.501
        },
        {
          "from": "2026-06-10",
          "to": "2026-06-11",
          "spanDays": 0.729,
          "gasMcf": 358.44,
          "energyKwh": 45550.6,
          "heatRateFt3Kwh": 7.869
        },
        {
          "from": "2026-06-11",
          "to": "2026-06-11",
          "spanDays": 0.167,
          "gasMcf": 89.97,
          "energyKwh": 20538.2,
          "heatRateFt3Kwh": 4.381
        },
        {
          "from": "2026-06-11",
          "to": "2026-06-13",
          "spanDays": 1.5,
          "gasMcf": 940.52,
          "energyKwh": 82801.7,
          "heatRateFt3Kwh": 11.359
        },
        {
          "from": "2026-06-13",
          "to": "2026-06-14",
          "spanDays": 0.667,
          "gasMcf": 329.15,
          "energyKwh": 42085.7,
          "heatRateFt3Kwh": 7.821
        },
        {
          "from": "2026-06-14",
          "to": "2026-06-14",
          "spanDays": 0.25,
          "gasMcf": 116.15,
          "energyKwh": 22035.1,
          "heatRateFt3Kwh": 5.271
        },
        {
          "from": "2026-06-14",
          "to": "2026-06-14",
          "spanDays": 0.16,
          "gasMcf": 87.01,
          "energyKwh": 10503.4,
          "heatRateFt3Kwh": 8.284
        },
        {
          "from": "2026-06-14",
          "to": "2026-06-15",
          "spanDays": 0.25,
          "gasMcf": 126.5,
          "energyKwh": 13034.1,
          "heatRateFt3Kwh": 9.705
        },
        {
          "from": "2026-06-15",
          "to": "2026-06-17",
          "spanDays": 2.257,
          "gasMcf": 1021.35,
          "energyKwh": 125748.1,
          "heatRateFt3Kwh": 8.122
        },
        {
          "from": "2026-06-17",
          "to": "2026-06-17",
          "spanDays": 0.333,
          "gasMcf": 303.3,
          "energyKwh": 24215.4,
          "heatRateFt3Kwh": 12.525
        },
        {
          "from": "2026-06-17",
          "to": "2026-06-17",
          "spanDays": 0.083,
          "gasMcf": 42,
          "energyKwh": 8879,
          "heatRateFt3Kwh": 4.73
        },
        {
          "from": "2026-06-17",
          "to": "2026-06-18",
          "spanDays": 0.167,
          "gasMcf": 65.35,
          "energyKwh": 9995.5,
          "heatRateFt3Kwh": 6.538
        },
        {
          "from": "2026-06-18",
          "to": "2026-06-18",
          "spanDays": 0.708,
          "gasMcf": 405.45,
          "energyKwh": 44869,
          "heatRateFt3Kwh": 9.036
        },
        {
          "from": "2026-06-18",
          "to": "2026-06-19",
          "spanDays": 0.09,
          "gasMcf": 71.79,
          "energyKwh": 5573.5,
          "heatRateFt3Kwh": 12.881
        },
        {
          "from": "2026-06-19",
          "to": "2026-06-19",
          "spanDays": 0.076,
          "gasMcf": 78.75,
          "energyKwh": 5018.2,
          "heatRateFt3Kwh": 15.693
        },
        {
          "from": "2026-06-19",
          "to": "2026-06-19",
          "spanDays": 0.75,
          "gasMcf": 372.43,
          "energyKwh": 46322.2,
          "heatRateFt3Kwh": 8.04
        },
        {
          "from": "2026-06-19",
          "to": "2026-06-19",
          "spanDays": 0.083,
          "gasMcf": 57.96,
          "energyKwh": 9264.4,
          "heatRateFt3Kwh": 6.256
        },
        {
          "from": "2026-06-20",
          "to": "2026-06-20",
          "spanDays": 0.076,
          "gasMcf": 53.17,
          "energyKwh": 4799.6,
          "heatRateFt3Kwh": 11.078
        },
        {
          "from": "2026-06-20",
          "to": "2026-06-20",
          "spanDays": 0.75,
          "gasMcf": 386.61,
          "energyKwh": 44304,
          "heatRateFt3Kwh": 8.726
        },
        {
          "from": "2026-06-20",
          "to": "2026-06-21",
          "spanDays": 0.083,
          "gasMcf": 50.15,
          "energyKwh": 4833.2,
          "heatRateFt3Kwh": 10.376
        },
        {
          "from": "2026-06-22",
          "to": "2026-06-22",
          "spanDays": 0.125,
          "gasMcf": 60.03,
          "energyKwh": 6747,
          "heatRateFt3Kwh": 8.897
        },
        {
          "from": "2026-06-22",
          "to": "2026-06-22",
          "spanDays": 0.167,
          "gasMcf": 84.52,
          "energyKwh": 13775.1,
          "heatRateFt3Kwh": 6.136
        },
        {
          "from": "2026-06-22",
          "to": "2026-06-22",
          "spanDays": 0.167,
          "gasMcf": 78.99,
          "energyKwh": 17523.5,
          "heatRateFt3Kwh": 4.508
        },
        {
          "from": "2026-06-22",
          "to": "2026-06-23",
          "spanDays": 0.813,
          "gasMcf": 431.88,
          "energyKwh": 43915.5,
          "heatRateFt3Kwh": 9.834
        },
        {
          "from": "2026-06-23",
          "to": "2026-06-24",
          "spanDays": 1.371,
          "gasMcf": 646.43,
          "energyKwh": 74289.4,
          "heatRateFt3Kwh": 8.702
        },
        {
          "from": "2026-06-24",
          "to": "2026-06-24",
          "spanDays": 0.116,
          "gasMcf": 58.35,
          "energyKwh": 8759.1,
          "heatRateFt3Kwh": 6.662
        },
        {
          "from": "2026-06-24",
          "to": "2026-06-25",
          "spanDays": 0.073,
          "gasMcf": 37.25,
          "energyKwh": 4007.3,
          "heatRateFt3Kwh": 9.296
        },
        {
          "from": "2026-06-25",
          "to": "2026-06-25",
          "spanDays": 0.399,
          "gasMcf": 215.72,
          "energyKwh": 23365,
          "heatRateFt3Kwh": 9.233
        },
        {
          "from": "2026-06-25",
          "to": "2026-06-25",
          "spanDays": 0.465,
          "gasMcf": 223.98,
          "energyKwh": 29379.7,
          "heatRateFt3Kwh": 7.624
        },
        {
          "from": "2026-06-25",
          "to": "2026-06-26",
          "spanDays": 0.14,
          "gasMcf": 70.22,
          "energyKwh": 7773.2,
          "heatRateFt3Kwh": 9.034
        },
        {
          "from": "2026-06-26",
          "to": "2026-06-26",
          "spanDays": 0.353,
          "gasMcf": 125.08,
          "energyKwh": 17579.5,
          "heatRateFt3Kwh": 7.115
        },
        {
          "from": "2026-06-26",
          "to": "2026-06-26",
          "spanDays": 0.229,
          "gasMcf": 76.14,
          "energyKwh": 17841.5,
          "heatRateFt3Kwh": 4.268
        },
        {
          "from": "2026-06-26",
          "to": "2026-06-28",
          "spanDays": 1.75,
          "gasMcf": 883.96,
          "energyKwh": 95815.9,
          "heatRateFt3Kwh": 9.226
        },
        {
          "from": "2026-06-28",
          "to": "2026-06-28",
          "spanDays": 0.229,
          "gasMcf": 112.59,
          "energyKwh": 21060,
          "heatRateFt3Kwh": 5.346
        },
        {
          "from": "2026-06-28",
          "to": "2026-06-28",
          "spanDays": 0.101,
          "gasMcf": 53.34,
          "energyKwh": 8898.1,
          "heatRateFt3Kwh": 5.995
        },
        {
          "from": "2026-06-28",
          "to": "2026-06-29",
          "spanDays": 0.073,
          "gasMcf": 38.07,
          "energyKwh": 4104.6,
          "heatRateFt3Kwh": 9.275
        },
        {
          "from": "2026-06-29",
          "to": "2026-06-29",
          "spanDays": 0.819,
          "gasMcf": 431.36,
          "energyKwh": 47917.9,
          "heatRateFt3Kwh": 9.002
        },
        {
          "from": "2026-06-29",
          "to": "2026-06-30",
          "spanDays": 0.556,
          "gasMcf": 242.65,
          "energyKwh": 32623.3,
          "heatRateFt3Kwh": 7.438
        },
        {
          "from": "2026-06-30",
          "to": "2026-06-30",
          "spanDays": 0.125,
          "gasMcf": 104.75,
          "energyKwh": 18601.2,
          "heatRateFt3Kwh": 5.631
        }
      ],
      "daily": [
        {
          "date": "2026-06-01",
          "gasMcf": 275.5,
          "energyKwh": 47380,
          "heatRateFt3Kwh": 5.815,
          "pressureMqtPsi": 151.7
        },
        {
          "date": "2026-06-02",
          "gasMcf": 480.5,
          "energyKwh": 46835,
          "heatRateFt3Kwh": 10.259,
          "pressureMqtPsi": 164
        },
        {
          "date": "2026-06-03",
          "gasMcf": 476.2,
          "energyKwh": 52387,
          "heatRateFt3Kwh": 9.09,
          "pressureMqtPsi": 157.8
        },
        {
          "date": "2026-06-04",
          "gasMcf": 529.4,
          "energyKwh": 66170,
          "heatRateFt3Kwh": 8,
          "pressureMqtPsi": 149
        },
        {
          "date": "2026-06-05",
          "gasMcf": 500.3,
          "energyKwh": 63731,
          "heatRateFt3Kwh": 7.85,
          "pressureMqtPsi": 151.6
        },
        {
          "date": "2026-06-06",
          "gasMcf": 496.6,
          "energyKwh": 65093,
          "heatRateFt3Kwh": 7.63,
          "pressureMqtPsi": 145
        },
        {
          "date": "2026-06-07",
          "gasMcf": 496.6,
          "energyKwh": 62900,
          "heatRateFt3Kwh": 7.896,
          "pressureMqtPsi": null
        },
        {
          "date": "2026-06-08",
          "gasMcf": 488.5,
          "energyKwh": 61890,
          "heatRateFt3Kwh": 7.893,
          "pressureMqtPsi": 147.3
        },
        {
          "date": "2026-06-09",
          "gasMcf": 502.4,
          "energyKwh": 59958,
          "heatRateFt3Kwh": 8.379,
          "pressureMqtPsi": 154.5
        },
        {
          "date": "2026-06-10",
          "gasMcf": 496.5,
          "energyKwh": 61941,
          "heatRateFt3Kwh": 8.016,
          "pressureMqtPsi": 151.5
        },
        {
          "date": "2026-06-11",
          "gasMcf": 604.8,
          "energyKwh": 63262,
          "heatRateFt3Kwh": 9.561,
          "pressureMqtPsi": 160
        },
        {
          "date": "2026-06-12",
          "gasMcf": 581.4,
          "energyKwh": 51187,
          "heatRateFt3Kwh": 11.359,
          "pressureMqtPsi": null
        },
        {
          "date": "2026-06-13",
          "gasMcf": 262.5,
          "energyKwh": 62870,
          "heatRateFt3Kwh": 4.175,
          "pressureMqtPsi": 176
        },
        {
          "date": "2026-06-14",
          "gasMcf": 497.8,
          "energyKwh": 63461,
          "heatRateFt3Kwh": 7.844,
          "pressureMqtPsi": 164
        },
        {
          "date": "2026-06-15",
          "gasMcf": 440.8,
          "energyKwh": 51813,
          "heatRateFt3Kwh": 8.507,
          "pressureMqtPsi": 158
        },
        {
          "date": "2026-06-16",
          "gasMcf": 466.8,
          "energyKwh": 57470,
          "heatRateFt3Kwh": 8.122,
          "pressureMqtPsi": null
        },
        {
          "date": "2026-06-17",
          "gasMcf": 613,
          "energyKwh": 58117,
          "heatRateFt3Kwh": 10.547,
          "pressureMqtPsi": 152
        },
        {
          "date": "2026-06-18",
          "gasMcf": 525.7,
          "energyKwh": 61829,
          "heatRateFt3Kwh": 8.503,
          "pressureMqtPsi": 138.3
        },
        {
          "date": "2026-06-19",
          "gasMcf": 532.1,
          "energyKwh": 60640,
          "heatRateFt3Kwh": 8.775,
          "pressureMqtPsi": 137.4
        },
        {
          "date": "2026-06-20",
          "gasMcf": 508.5,
          "energyKwh": 57998,
          "heatRateFt3Kwh": 8.767,
          "pressureMqtPsi": 147
        },
        {
          "date": "2026-06-21",
          "gasMcf": 530.3,
          "energyKwh": 8,
          "heatRateFt3Kwh": 66809.878,
          "pressureMqtPsi": 143.7
        },
        {
          "date": "2026-06-22",
          "gasMcf": 470.9,
          "energyKwh": 53976,
          "heatRateFt3Kwh": 8.725,
          "pressureMqtPsi": 149.1
        },
        {
          "date": "2026-06-23",
          "gasMcf": 498.9,
          "energyKwh": 54107,
          "heatRateFt3Kwh": 9.221,
          "pressureMqtPsi": 120
        },
        {
          "date": "2026-06-24",
          "gasMcf": 477.4,
          "energyKwh": 54249,
          "heatRateFt3Kwh": 8.801,
          "pressureMqtPsi": 163
        },
        {
          "date": "2026-06-25",
          "gasMcf": 510.2,
          "energyKwh": 57107,
          "heatRateFt3Kwh": 8.934,
          "pressureMqtPsi": 154
        },
        {
          "date": "2026-06-26",
          "gasMcf": 393.2,
          "energyKwh": 47910,
          "heatRateFt3Kwh": 8.208,
          "pressureMqtPsi": 144
        },
        {
          "date": "2026-06-27",
          "gasMcf": 519.2,
          "energyKwh": 56274,
          "heatRateFt3Kwh": 9.226,
          "pressureMqtPsi": null
        },
        {
          "date": "2026-06-28",
          "gasMcf": 508.8,
          "energyKwh": 56160,
          "heatRateFt3Kwh": 9.06,
          "pressureMqtPsi": 157
        },
        {
          "date": "2026-06-29",
          "gasMcf": 515.6,
          "energyKwh": 58473,
          "heatRateFt3Kwh": 8.818,
          "pressureMqtPsi": 155
        },
        {
          "date": "2026-06-30",
          "gasMcf": 366.4,
          "energyKwh": 58789,
          "heatRateFt3Kwh": 6.233,
          "pressureMqtPsi": 150
        }
      ]
    },
    {
      "monthKey": "Jul",
      "monthLabel": "Julio",
      "yearMonth": "2026-07",
      "units": [
        "CPW04",
        "CPW05",
        "CPW06"
      ],
      "from": "2026-07-01",
      "to": "2026-07-17",
      "fromHour": 7,
      "toHour": 11,
      "spanDays": 16.17,
      "calendarDays": 31,
      "readingsRaw": 67,
      "readingsUsed": 51,
      "readingsDiscarded": 16,
      "daysWithoutEnergy": 0,
      "gasMcf": 8268.3,
      "gasMcfPerDay": 511.4,
      "energyKwh": 850806,
      "opHours": 1073.7,
      "heatRateFt3Kwh": 9.718,
      "pressureMqtAvgPsi": 138.6,
      "pressureMqtMinPsi": 90,
      "lowPressureReadings": 17,
      "nominalPower": [
        {
          "unit": "CPW01",
          "designKw": 780,
          "operatedKw": 780,
          "deratedReadings": 0,
          "readings": 66
        },
        {
          "unit": "CPW02",
          "designKw": 780,
          "operatedKw": 780,
          "deratedReadings": 0,
          "readings": 57
        },
        {
          "unit": "CPW03",
          "designKw": 780,
          "operatedKw": 777.2,
          "deratedReadings": 2,
          "readings": 57
        },
        {
          "unit": "CPW04",
          "designKw": 1040,
          "operatedKw": 968,
          "deratedReadings": 18,
          "readings": 55
        },
        {
          "unit": "CPW05",
          "designKw": 1040,
          "operatedKw": 1017.3,
          "deratedReadings": 24,
          "readings": 63
        },
        {
          "unit": "CPW06",
          "designKw": 1040,
          "operatedKw": 1004.2,
          "deratedReadings": 24,
          "readings": 65
        },
        {
          "unit": "JIN-10",
          "designKw": 450,
          "operatedKw": 428.2,
          "deratedReadings": 19,
          "readings": 61
        },
        {
          "unit": "JIN-11",
          "designKw": 450,
          "operatedKw": 443.8,
          "deratedReadings": 4,
          "readings": 45
        },
        {
          "unit": "JIN-12",
          "designKw": 450,
          "operatedKw": 437.8,
          "deratedReadings": 8,
          "readings": 46
        }
      ],
      "unitsInWindow": [
        {
          "unit": "CPW04",
          "energyKwh": 238549,
          "opHours": 324.6
        },
        {
          "unit": "CPW05",
          "energyKwh": 303622,
          "opHours": 373.3
        },
        {
          "unit": "CPW06",
          "energyKwh": 308634,
          "opHours": 375.8
        }
      ],
      "intervals": [
        {
          "from": "2026-07-01",
          "to": "2026-07-01",
          "spanDays": 0.146,
          "gasMcf": 81.53,
          "energyKwh": 18379.9,
          "heatRateFt3Kwh": 4.436
        },
        {
          "from": "2026-07-01",
          "to": "2026-07-01",
          "spanDays": 0.083,
          "gasMcf": 41.62,
          "energyKwh": 9061.2,
          "heatRateFt3Kwh": 4.593
        },
        {
          "from": "2026-07-02",
          "to": "2026-07-02",
          "spanDays": 0.083,
          "gasMcf": 122.16,
          "energyKwh": 16980.3,
          "heatRateFt3Kwh": 7.194
        },
        {
          "from": "2026-07-02",
          "to": "2026-07-03",
          "spanDays": 0.625,
          "gasMcf": 310.7,
          "energyKwh": 36471.4,
          "heatRateFt3Kwh": 8.519
        },
        {
          "from": "2026-07-03",
          "to": "2026-07-05",
          "spanDays": 1.667,
          "gasMcf": 884.46,
          "energyKwh": 95696.6,
          "heatRateFt3Kwh": 9.242
        },
        {
          "from": "2026-07-05",
          "to": "2026-07-06",
          "spanDays": 0.938,
          "gasMcf": 473.94,
          "energyKwh": 50363.6,
          "heatRateFt3Kwh": 9.41
        },
        {
          "from": "2026-07-06",
          "to": "2026-07-06",
          "spanDays": 0.25,
          "gasMcf": 140.13,
          "energyKwh": 18333.8,
          "heatRateFt3Kwh": 7.643
        },
        {
          "from": "2026-07-06",
          "to": "2026-07-06",
          "spanDays": 0.083,
          "gasMcf": 60.26,
          "energyKwh": 11786,
          "heatRateFt3Kwh": 5.113
        },
        {
          "from": "2026-07-08",
          "to": "2026-07-08",
          "spanDays": 0.234,
          "gasMcf": 118.92,
          "energyKwh": 21868.3,
          "heatRateFt3Kwh": 5.438
        },
        {
          "from": "2026-07-08",
          "to": "2026-07-09",
          "spanDays": 0.512,
          "gasMcf": 267.2,
          "energyKwh": 28678.7,
          "heatRateFt3Kwh": 9.317
        },
        {
          "from": "2026-07-09",
          "to": "2026-07-09",
          "spanDays": 0.193,
          "gasMcf": 93.97,
          "energyKwh": 13728.5,
          "heatRateFt3Kwh": 6.845
        },
        {
          "from": "2026-07-09",
          "to": "2026-07-09",
          "spanDays": 0.474,
          "gasMcf": 229.65,
          "energyKwh": 26631.9,
          "heatRateFt3Kwh": 8.623
        },
        {
          "from": "2026-07-09",
          "to": "2026-07-10",
          "spanDays": 0.25,
          "gasMcf": 85.43,
          "energyKwh": 12715,
          "heatRateFt3Kwh": 6.719
        },
        {
          "from": "2026-07-10",
          "to": "2026-07-11",
          "spanDays": 1,
          "gasMcf": 1003.31,
          "energyKwh": 58480.9,
          "heatRateFt3Kwh": 17.156
        },
        {
          "from": "2026-07-12",
          "to": "2026-07-12",
          "spanDays": 0.124,
          "gasMcf": 78.69,
          "energyKwh": 15893.3,
          "heatRateFt3Kwh": 4.951
        },
        {
          "from": "2026-07-12",
          "to": "2026-07-12",
          "spanDays": 0.231,
          "gasMcf": 182.02,
          "energyKwh": 17496,
          "heatRateFt3Kwh": 10.404
        },
        {
          "from": "2026-07-12",
          "to": "2026-07-12",
          "spanDays": 0.083,
          "gasMcf": 35.94,
          "energyKwh": 6032.1,
          "heatRateFt3Kwh": 5.958
        },
        {
          "from": "2026-07-12",
          "to": "2026-07-13",
          "spanDays": 0.417,
          "gasMcf": 252.32,
          "energyKwh": 21228,
          "heatRateFt3Kwh": 11.886
        },
        {
          "from": "2026-07-13",
          "to": "2026-07-13",
          "spanDays": 0.167,
          "gasMcf": 119.3,
          "energyKwh": 17270,
          "heatRateFt3Kwh": 6.908
        },
        {
          "from": "2026-07-13",
          "to": "2026-07-13",
          "spanDays": 0.146,
          "gasMcf": 90.48,
          "energyKwh": 16074.4,
          "heatRateFt3Kwh": 5.629
        },
        {
          "from": "2026-07-13",
          "to": "2026-07-13",
          "spanDays": 0.146,
          "gasMcf": 55.05,
          "energyKwh": 13284.6,
          "heatRateFt3Kwh": 4.144
        },
        {
          "from": "2026-07-13",
          "to": "2026-07-14",
          "spanDays": 0.458,
          "gasMcf": 300.03,
          "energyKwh": 21794.9,
          "heatRateFt3Kwh": 13.766
        },
        {
          "from": "2026-07-14",
          "to": "2026-07-15",
          "spanDays": 0.792,
          "gasMcf": 699.07,
          "energyKwh": 36546.1,
          "heatRateFt3Kwh": 19.128
        },
        {
          "from": "2026-07-15",
          "to": "2026-07-16",
          "spanDays": 1.208,
          "gasMcf": 400.16,
          "energyKwh": 57024.5,
          "heatRateFt3Kwh": 7.017
        },
        {
          "from": "2026-07-16",
          "to": "2026-07-16",
          "spanDays": 0.167,
          "gasMcf": 89.05,
          "energyKwh": 11267.1,
          "heatRateFt3Kwh": 7.904
        },
        {
          "from": "2026-07-16",
          "to": "2026-07-17",
          "spanDays": 0.833,
          "gasMcf": 301.25,
          "energyKwh": 28470.5,
          "heatRateFt3Kwh": 10.581
        },
        {
          "from": "2026-07-17",
          "to": "2026-07-17",
          "spanDays": 0.167,
          "gasMcf": 93.85,
          "energyKwh": 10765.8,
          "heatRateFt3Kwh": 8.717
        }
      ],
      "daily": [
        {
          "date": "2026-07-01",
          "gasMcf": 320.5,
          "energyKwh": 59310,
          "heatRateFt3Kwh": 5.403,
          "pressureMqtPsi": 149.9
        },
        {
          "date": "2026-07-02",
          "gasMcf": 550.4,
          "energyKwh": 58218,
          "heatRateFt3Kwh": 9.454,
          "pressureMqtPsi": 153.1
        },
        {
          "date": "2026-07-03",
          "gasMcf": 495.8,
          "energyKwh": 58510,
          "heatRateFt3Kwh": 8.475,
          "pressureMqtPsi": 121.2
        },
        {
          "date": "2026-07-04",
          "gasMcf": 522.7,
          "energyKwh": 56552,
          "heatRateFt3Kwh": 9.242,
          "pressureMqtPsi": null
        },
        {
          "date": "2026-07-05",
          "gasMcf": 502.6,
          "energyKwh": 58983,
          "heatRateFt3Kwh": 8.522,
          "pressureMqtPsi": 127.4
        },
        {
          "date": "2026-07-06",
          "gasMcf": 861.5,
          "energyKwh": 47144,
          "heatRateFt3Kwh": 18.273,
          "pressureMqtPsi": 137.9
        },
        {
          "date": "2026-07-07",
          "gasMcf": 172.5,
          "energyKwh": 57545,
          "heatRateFt3Kwh": 2.998,
          "pressureMqtPsi": null
        },
        {
          "date": "2026-07-08",
          "gasMcf": 415.7,
          "energyKwh": 58201,
          "heatRateFt3Kwh": 7.143,
          "pressureMqtPsi": 134
        },
        {
          "date": "2026-07-09",
          "gasMcf": 450.1,
          "energyKwh": 49330,
          "heatRateFt3Kwh": 9.125,
          "pressureMqtPsi": 118.3
        },
        {
          "date": "2026-07-10",
          "gasMcf": 978.4,
          "energyKwh": 58511,
          "heatRateFt3Kwh": 16.721,
          "pressureMqtPsi": 135.6
        },
        {
          "date": "2026-07-11",
          "gasMcf": 179,
          "energyKwh": 57788,
          "heatRateFt3Kwh": 3.098,
          "pressureMqtPsi": 165.7
        },
        {
          "date": "2026-07-12",
          "gasMcf": 443.3,
          "energyKwh": 50355,
          "heatRateFt3Kwh": 8.804,
          "pressureMqtPsi": 142.7
        },
        {
          "date": "2026-07-13",
          "gasMcf": 609.3,
          "energyKwh": 51013,
          "heatRateFt3Kwh": 11.943,
          "pressureMqtPsi": 124.8
        },
        {
          "date": "2026-07-14",
          "gasMcf": 800.5,
          "energyKwh": 45575,
          "heatRateFt3Kwh": 17.564,
          "pressureMqtPsi": 130
        },
        {
          "date": "2026-07-15",
          "gasMcf": 410.7,
          "energyKwh": 51166,
          "heatRateFt3Kwh": 8.027,
          "pressureMqtPsi": 139
        },
        {
          "date": "2026-07-16",
          "gasMcf": 359,
          "energyKwh": 34705,
          "heatRateFt3Kwh": 10.344,
          "pressureMqtPsi": 140
        },
        {
          "date": "2026-07-17",
          "gasMcf": 196.2,
          "energyKwh": 33161,
          "heatRateFt3Kwh": 5.916,
          "pressureMqtPsi": 130
        }
      ]
    }
  ]
};

export function gasMoquetaMonth(monthKey: string): GasMoquetaMonth | null {
  return GAS_MOQUETA.months.find((m) => m.monthKey === monthKey) ?? null;
}
