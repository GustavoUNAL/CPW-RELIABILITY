/** FO-GE-007 · Pad 4 · noviembre 2026. Recesión = medición base − medición actual. */
export type ValveId = "A1" | "A2" | "E1" | "E2";
export type ValveStatus = "verde" | "vigilancia" | "amarillo" | "rojo" | "na";

export type ValveCylinder = {
  cyl: number;
  A1: number | null;
  A2: number | null;
  E1: number | null;
  E2: number | null;
  worst: ValveId | null;
  worstMm: number | null;
  status: ValveStatus;
};

export type ValveMachine = {
  unit: string;
  baseDate: string;
  currentDate: string;
  hours: number;
  avgMm: number;
  maxMm: number;
  avgAdm: number;
  avgEsc: number;
  green: number;
  yellow: number;
  red: number;
  top: { cyl: number; worst: ValveId | null; mm: number | null };
  watch: { cyl: number; worst: ValveId | null; mm: number | null }[];
  note: string;
  cylinders: ValveCylinder[];
};

export const VALVE_THRESHOLDS = {
  yellow: 1.5,
  red: 2.0,
  watch: 1.2,
  maxScale: 2.0,
} as const;

export const VALVE_CONCLUSIONS = [
  "Los 80 cilindros medidos están en verde. Ninguna válvula llega a 1,5 mm, así que no aplica todavía la reducción del intervalo de inspección ni el cambio de culatas.",
  "Priorizar la próxima medición en G-803 y G-801: cuatro cilindros de G-803 entre 1,36 y 1,46 mm, y G-801-C19 en 1,47 mm, el máximo de la flota.",
  "Actualizar G-802: su última medición es del 4 de agosto de 2026 y tiene cuatro cilindros en vigilancia.",
  "Depurar el formato: fechas base de G-801 y G-803, recesiones negativas de G-804 (C07-A2 y C13-A2) y completar G-805, G-806 y G-807.",
] as const;

export const PAD4_VALVE_FLEET: ValveMachine[] = [
  {
    unit: "G-801",
    baseDate: "2023-10-15",
    currentDate: "2026-11-04",
    hours: 26780,
    avgMm: 0.58,
    maxMm: 1.47,
    avgAdm: 0.37,
    avgEsc: 0.8,
    green: 20,
    yellow: 0,
    red: 0,
    note: "El desgaste se concentra en las válvulas de escape (peor en 19 de 20 cilindros). C19-A1 (1,47 mm) es un valor aislado frente al resto de admisiones.",
    top: {"cyl": 19, "worst": "A1", "mm": 1.47},
    watch: [{"cyl": 19, "worst": "A1", "mm": 1.47}],
    cylinders: [
      {"cyl": 1, "A1": 0.61, "A2": 0.46, "E1": 0.92, "E2": 0.2, "worst": "E1", "worstMm": 0.92, "status": "verde"},
      {"cyl": 2, "A1": 0.12, "A2": 0.63, "E1": 0.93, "E2": 1.1, "worst": "E2", "worstMm": 1.1, "status": "verde"},
      {"cyl": 3, "A1": 0.1, "A2": 0.7, "E1": 1.08, "E2": 1.03, "worst": "E1", "worstMm": 1.08, "status": "verde"},
      {"cyl": 4, "A1": 0.2, "A2": 0.25, "E1": 0.92, "E2": 0.96, "worst": "E2", "worstMm": 0.96, "status": "verde"},
      {"cyl": 5, "A1": 0.2, "A2": 0.35, "E1": 0.87, "E2": 0.74, "worst": "E1", "worstMm": 0.87, "status": "verde"},
      {"cyl": 6, "A1": 0.16, "A2": 0.7, "E1": 1.17, "E2": 0.83, "worst": "E1", "worstMm": 1.17, "status": "verde"},
      {"cyl": 7, "A1": 0.3, "A2": 0.35, "E1": 1.06, "E2": 0.91, "worst": "E1", "worstMm": 1.06, "status": "verde"},
      {"cyl": 8, "A1": 0.6, "A2": 0.11, "E1": 1.15, "E2": 1.05, "worst": "E1", "worstMm": 1.15, "status": "verde"},
      {"cyl": 9, "A1": 0.3, "A2": 0.4, "E1": 0.87, "E2": 0.54, "worst": "E1", "worstMm": 0.87, "status": "verde"},
      {"cyl": 10, "A1": 0.2, "A2": 0.71, "E1": 1.11, "E2": 0.88, "worst": "E1", "worstMm": 1.11, "status": "verde"},
      {"cyl": 11, "A1": 0.38, "A2": 0.27, "E1": 0.38, "E2": 0.76, "worst": "E2", "worstMm": 0.76, "status": "verde"},
      {"cyl": 12, "A1": 0.2, "A2": 0.35, "E1": 0.28, "E2": 0.37, "worst": "E2", "worstMm": 0.37, "status": "verde"},
      {"cyl": 13, "A1": 0.2, "A2": 0.4, "E1": 1.07, "E2": 0.78, "worst": "E1", "worstMm": 1.07, "status": "verde"},
      {"cyl": 14, "A1": 0.17, "A2": 0.26, "E1": 0.2, "E2": 1.08, "worst": "E2", "worstMm": 1.08, "status": "verde"},
      {"cyl": 15, "A1": 0.26, "A2": 0.32, "E1": 0.72, "E2": 1.18, "worst": "E2", "worstMm": 1.18, "status": "verde"},
      {"cyl": 16, "A1": 0.22, "A2": 0.26, "E1": 1.03, "E2": 0.27, "worst": "E1", "worstMm": 1.03, "status": "verde"},
      {"cyl": 17, "A1": 0.37, "A2": 0.55, "E1": 0.55, "E2": 1.03, "worst": "E2", "worstMm": 1.03, "status": "verde"},
      {"cyl": 18, "A1": 0.18, "A2": 0.2, "E1": 0.23, "E2": 0.99, "worst": "E2", "worstMm": 0.99, "status": "verde"},
      {"cyl": 19, "A1": 1.47, "A2": 0.64, "E1": 0.7, "E2": 0.46, "worst": "A1", "worstMm": 1.47, "status": "vigilancia"},
      {"cyl": 20, "A1": 0.3, "A2": 0.34, "E1": 0.71, "E2": 0.86, "worst": "E2", "worstMm": 0.86, "status": "verde"},
    ],
  },
  {
    unit: "G-802",
    baseDate: "2023-10-13",
    currentDate: "2026-08-04",
    hours: 24120,
    avgMm: 0.62,
    maxMm: 1.32,
    avgAdm: 0.6,
    avgEsc: 0.64,
    green: 20,
    yellow: 0,
    red: 0,
    note: "El desgaste se carga en la admisión A1. Última medición del 4 ago 2026: es la más antigua de las cuatro máquinas.",
    top: {"cyl": 11, "worst": "A1", "mm": 1.32},
    watch: [{"cyl": 11, "worst": "A1", "mm": 1.32}, {"cyl": 14, "worst": "E2", "mm": 1.21}, {"cyl": 16, "worst": "E2", "mm": 1.2}, {"cyl": 18, "worst": "A1", "mm": 1.3}],
    cylinders: [
      {"cyl": 1, "A1": 0.49, "A2": 0.52, "E1": 0.07, "E2": 0.9, "worst": "E2", "worstMm": 0.9, "status": "verde"},
      {"cyl": 2, "A1": 1.12, "A2": 0.69, "E1": 0.57, "E2": 0.82, "worst": "A1", "worstMm": 1.12, "status": "verde"},
      {"cyl": 3, "A1": 0.71, "A2": 0.19, "E1": 0.71, "E2": 0.46, "worst": "A1", "worstMm": 0.71, "status": "verde"},
      {"cyl": 4, "A1": 1.06, "A2": 0.1, "E1": 0.18, "E2": 0.12, "worst": "A1", "worstMm": 1.06, "status": "verde"},
      {"cyl": 5, "A1": 0.62, "A2": 0.21, "E1": 1.09, "E2": 0.82, "worst": "E1", "worstMm": 1.09, "status": "verde"},
      {"cyl": 6, "A1": 0.92, "A2": 0.33, "E1": 0.76, "E2": 0.54, "worst": "A1", "worstMm": 0.92, "status": "verde"},
      {"cyl": 7, "A1": 1.11, "A2": 0.29, "E1": 0.73, "E2": 0.43, "worst": "A1", "worstMm": 1.11, "status": "verde"},
      {"cyl": 8, "A1": 0.93, "A2": 0.09, "E1": 0.5, "E2": 0.37, "worst": "A1", "worstMm": 0.93, "status": "verde"},
      {"cyl": 9, "A1": 0.85, "A2": 0.26, "E1": 0.4, "E2": 0.83, "worst": "A1", "worstMm": 0.85, "status": "verde"},
      {"cyl": 10, "A1": 1.02, "A2": 0.24, "E1": 0.8, "E2": 0.3, "worst": "A1", "worstMm": 1.02, "status": "verde"},
      {"cyl": 11, "A1": 1.32, "A2": 0.42, "E1": 0.49, "E2": 1.01, "worst": "A1", "worstMm": 1.32, "status": "vigilancia"},
      {"cyl": 12, "A1": 1.14, "A2": 0.4, "E1": 0.4, "E2": 0.55, "worst": "A1", "worstMm": 1.14, "status": "verde"},
      {"cyl": 13, "A1": 0.74, "A2": 0.64, "E1": 0.65, "E2": 0.94, "worst": "E2", "worstMm": 0.94, "status": "verde"},
      {"cyl": 14, "A1": 0.99, "A2": 0.54, "E1": 0.52, "E2": 1.21, "worst": "E2", "worstMm": 1.21, "status": "vigilancia"},
      {"cyl": 15, "A1": 0.75, "A2": 0.1, "E1": 0.91, "E2": 0.33, "worst": "E1", "worstMm": 0.91, "status": "verde"},
      {"cyl": 16, "A1": 0.53, "A2": 0.1, "E1": 0.76, "E2": 1.2, "worst": "E2", "worstMm": 1.2, "status": "vigilancia"},
      {"cyl": 17, "A1": 0.65, "A2": 0.12, "E1": 0.34, "E2": 0.88, "worst": "E2", "worstMm": 0.88, "status": "verde"},
      {"cyl": 18, "A1": 1.3, "A2": 0.21, "E1": 0.26, "E2": 0.64, "worst": "A1", "worstMm": 1.3, "status": "vigilancia"},
      {"cyl": 19, "A1": 0.93, "A2": 0.1, "E1": 0.9, "E2": 0.92, "worst": "A1", "worstMm": 0.93, "status": "verde"},
      {"cyl": 20, "A1": 0.94, "A2": 0.29, "E1": 0.93, "E2": 0.19, "worst": "A1", "worstMm": 0.94, "status": "verde"},
    ],
  },
  {
    unit: "G-803",
    baseDate: "2023-10-13",
    currentDate: "2026-11-05",
    hours: 26345,
    avgMm: 0.64,
    maxMm: 1.46,
    avgAdm: 0.7,
    avgEsc: 0.59,
    green: 20,
    yellow: 0,
    red: 0,
    note: "Es la máquina más cercana al amarillo: C17, C02, C09 y C18 están entre 1,36 y 1,46 mm. A1 es la peor en 16 de 20 cilindros.",
    top: {"cyl": 17, "worst": "A1", "mm": 1.46},
    watch: [{"cyl": 2, "worst": "A1", "mm": 1.45}, {"cyl": 9, "worst": "E2", "mm": 1.42}, {"cyl": 17, "worst": "A1", "mm": 1.46}, {"cyl": 18, "worst": "A1", "mm": 1.36}],
    cylinders: [
      {"cyl": 1, "A1": 0.68, "A2": 0.35, "E1": 0.71, "E2": 0.63, "worst": "E1", "worstMm": 0.71, "status": "verde"},
      {"cyl": 2, "A1": 1.45, "A2": 0.55, "E1": 0.3, "E2": 0.2, "worst": "A1", "worstMm": 1.45, "status": "vigilancia"},
      {"cyl": 3, "A1": 1.02, "A2": 0.02, "E1": 0.53, "E2": 0.33, "worst": "A1", "worstMm": 1.02, "status": "verde"},
      {"cyl": 4, "A1": 0.92, "A2": 0.3, "E1": 0.57, "E2": 0.29, "worst": "A1", "worstMm": 0.92, "status": "verde"},
      {"cyl": 5, "A1": 0.7, "A2": 0.7, "E1": 0.4, "E2": 0.73, "worst": "E2", "worstMm": 0.73, "status": "verde"},
      {"cyl": 6, "A1": 0.78, "A2": 0.01, "E1": 0.75, "E2": 0.47, "worst": "A1", "worstMm": 0.78, "status": "verde"},
      {"cyl": 7, "A1": 0.84, "A2": 0.3, "E1": 0.74, "E2": 0.29, "worst": "A1", "worstMm": 0.84, "status": "verde"},
      {"cyl": 8, "A1": 1.11, "A2": 0.2, "E1": 0.74, "E2": 0.57, "worst": "A1", "worstMm": 1.11, "status": "verde"},
      {"cyl": 9, "A1": 1.14, "A2": 0.03, "E1": 0.6, "E2": 1.42, "worst": "E2", "worstMm": 1.42, "status": "vigilancia"},
      {"cyl": 10, "A1": 1.02, "A2": 0.8, "E1": 0.86, "E2": 0.5, "worst": "A1", "worstMm": 1.02, "status": "verde"},
      {"cyl": 11, "A1": 1.12, "A2": 0.9, "E1": 0.26, "E2": 0.63, "worst": "A1", "worstMm": 1.12, "status": "verde"},
      {"cyl": 12, "A1": 0.7, "A2": 0.07, "E1": 0.6, "E2": 0.1, "worst": "A1", "worstMm": 0.7, "status": "verde"},
      {"cyl": 13, "A1": 0.88, "A2": 0.5, "E1": 0.32, "E2": 0.91, "worst": "E2", "worstMm": 0.91, "status": "verde"},
      {"cyl": 14, "A1": 0.79, "A2": 0.41, "E1": 0.4, "E2": 0.71, "worst": "A1", "worstMm": 0.79, "status": "verde"},
      {"cyl": 15, "A1": 0.72, "A2": 0.02, "E1": 0.36, "E2": 0.59, "worst": "A1", "worstMm": 0.72, "status": "verde"},
      {"cyl": 16, "A1": 1.16, "A2": 0.6, "E1": 0.59, "E2": 0.91, "worst": "A1", "worstMm": 1.16, "status": "verde"},
      {"cyl": 17, "A1": 1.46, "A2": 0.5, "E1": 0.76, "E2": 0.61, "worst": "A1", "worstMm": 1.46, "status": "vigilancia"},
      {"cyl": 18, "A1": 1.36, "A2": 0.06, "E1": 0.78, "E2": 0.85, "worst": "A1", "worstMm": 1.36, "status": "vigilancia"},
      {"cyl": 19, "A1": 1.15, "A2": 0.97, "E1": 0.41, "E2": 0.82, "worst": "A1", "worstMm": 1.15, "status": "verde"},
      {"cyl": 20, "A1": 0.95, "A2": 0.61, "E1": 0.45, "E2": 0.71, "worst": "A1", "worstMm": 0.95, "status": "verde"},
    ],
  },
  {
    unit: "G-804",
    baseDate: "2023-11-13",
    currentDate: "2026-11-07",
    hours: 25482,
    avgMm: 0.35,
    maxMm: 0.9,
    avgAdm: 0.33,
    avgEsc: 0.37,
    green: 20,
    yellow: 0,
    red: 0,
    note: "Desgaste bajo y parejo. Hay lecturas negativas en C07-A2 y C13-A2: conviene verificar la medición base o repetir la medida.",
    top: {"cyl": 1, "worst": "E2", "mm": 0.9},
    watch: [],
    cylinders: [
      {"cyl": 1, "A1": 0.25, "A2": 0.45, "E1": 0.5, "E2": 0.9, "worst": "E2", "worstMm": 0.9, "status": "verde"},
      {"cyl": 2, "A1": 0.2, "A2": 0.3, "E1": 0.7, "E2": 0.0, "worst": "E1", "worstMm": 0.7, "status": "verde"},
      {"cyl": 3, "A1": 0.5, "A2": 0.4, "E1": 0.4, "E2": 0.3, "worst": "A1", "worstMm": 0.5, "status": "verde"},
      {"cyl": 4, "A1": 0.3, "A2": 0.3, "E1": 0.1, "E2": 0.2, "worst": "A1", "worstMm": 0.3, "status": "verde"},
      {"cyl": 5, "A1": 0.38, "A2": 0.5, "E1": 0.69, "E2": 0.4, "worst": "E1", "worstMm": 0.69, "status": "verde"},
      {"cyl": 6, "A1": 0.9, "A2": 0.3, "E1": 0.3, "E2": 0.0, "worst": "A1", "worstMm": 0.9, "status": "verde"},
      {"cyl": 7, "A1": 0.25, "A2": -0.17, "E1": 0.29, "E2": 0.26, "worst": "E1", "worstMm": 0.29, "status": "verde"},
      {"cyl": 8, "A1": 0.25, "A2": 0.7, "E1": 0.5, "E2": 0.5, "worst": "A2", "worstMm": 0.7, "status": "verde"},
      {"cyl": 9, "A1": 0.5, "A2": 0.05, "E1": 0.4, "E2": 0.2, "worst": "A1", "worstMm": 0.5, "status": "verde"},
      {"cyl": 10, "A1": 0.3, "A2": 0.5, "E1": 0.4, "E2": 0.6, "worst": "E2", "worstMm": 0.6, "status": "verde"},
      {"cyl": 11, "A1": 0.3, "A2": 0.3, "E1": 0.28, "E2": 0.6, "worst": "E2", "worstMm": 0.6, "status": "verde"},
      {"cyl": 12, "A1": 0.3, "A2": 0.6, "E1": 0.2, "E2": 0.6, "worst": "A2", "worstMm": 0.6, "status": "verde"},
      {"cyl": 13, "A1": 0.41, "A2": -0.2, "E1": 0.4, "E2": 0.1, "worst": "A1", "worstMm": 0.41, "status": "verde"},
      {"cyl": 14, "A1": 0.3, "A2": 0.3, "E1": 0.0, "E2": 0.4, "worst": "E2", "worstMm": 0.4, "status": "verde"},
      {"cyl": 15, "A1": 0.7, "A2": 0.5, "E1": 0.47, "E2": 0.28, "worst": "A1", "worstMm": 0.7, "status": "verde"},
      {"cyl": 16, "A1": 0.8, "A2": 0.1, "E1": 0.5, "E2": 0.5, "worst": "A1", "worstMm": 0.8, "status": "verde"},
      {"cyl": 17, "A1": 0.1, "A2": 0.21, "E1": 0.2, "E2": 0.4, "worst": "E2", "worstMm": 0.4, "status": "verde"},
      {"cyl": 18, "A1": 0.4, "A2": 0.1, "E1": 0.0, "E2": 0.9, "worst": "E2", "worstMm": 0.9, "status": "verde"},
      {"cyl": 19, "A1": 0.0, "A2": 0.29, "E1": 0.04, "E2": 0.41, "worst": "E2", "worstMm": 0.41, "status": "verde"},
      {"cyl": 20, "A1": 0.4, "A2": 0.0, "E1": 0.57, "E2": 0.5, "worst": "E1", "worstMm": 0.57, "status": "verde"},
    ],
  },
];
