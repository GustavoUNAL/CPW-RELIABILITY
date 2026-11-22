/** Tipos del módulo Operación (Reporte Diario Costayaco / Vonú / Conejo). */

export type Planta = "Costayaco" | "Vonu" | "Conejo";

export type DisponibilidadEstado = "OP" | "SB" | "PE" | "MTO" | "FS" | "TR";

export type Turno = "DIA" | "NOCHE";

export type EquipoId = string;

export type Equipo = {
  id: EquipoId;
  sheetName: string;
  label: string;
  planta: Planta;
  combustible: "gas" | "diesel";
  kwNominal: number;
};

export type HorasEstado = {
  op: number;
  sb: number;
  pe: number;
  mto: number;
  fs: number;
  tr: number;
};

export type RegistroHorario = HorasEstado & {
  fecha: string; // YYYY-MM-DD
  hora: number; // 0-23
  equipoId: EquipoId;
  vl1: number | null;
  vl2: number | null;
  vl3: number | null;
  il1: number | null;
  il2: number | null;
  il3: number | null;
  hz: number | null;
  fp: number | null;
  kw: number | null;
  kvar: number | null;
  kwAcumulado: number | null;
  consumoGasM3Kwh: number | null;
  consumoGasFt3Kwh: number | null;
  consumoGasMscfH: number | null;
  psiGas: number | null;
  effPct: number | null;
  horometro: number | null;
  adicionAceite: number | null;
  cambioAceite: number | null;
  adicionCoolant: number | null;
};

export type ResumenDiario = HorasEstado & {
  fecha: string;
  equipoId: EquipoId;
  kwAcumuladoDia: number | null;
  consumoGasMscfd: number | null;
  consumoGasFt3Kwh: number | null;
  kwPromedioDia: number | null;
};

export type EventoOperacion = {
  id: string;
  fecha: string;
  hora: string | null;
  turno: Turno;
  descripcion: string;
  tiempoFueraMin: number | null;
  equipoId: EquipoId | null;
};

export type ActividadOperacion = {
  id: string;
  fecha: string;
  turno: Turno;
  hora: string | null;
  tecnico: string | null;
  descripcion: string;
  personalCampo: string | null;
  cargo: string | null;
};

export type ConsumoMensual = {
  mes: string; // YYYY-MM
  locacion: string;
  equipoId: EquipoId;
  adicionAceite: number;
  cambioAceite: number;
  adicionCoolant: number;
};

export type RegistroConejo = {
  fecha: string;
  hora: string | null;
  equipoId: EquipoId;
  horometro: number | null;
  cargaKw: number | null;
  kwh24: number | null;
  estado: string | null;
  consumoTeorico: number | null;
  horasOp: number;
  horasSb: number;
  horasPe: number;
  horasMto: number;
  horasFs: number;
  horasTr: number;
  presion: number | null;
  gasMscfd: number | null;
};

export type EquipoStatusSnapshot = {
  equipoId: EquipoId;
  fecha: string;
  estado: DisponibilidadEstado;
  kw: number | null;
  horometro: number | null;
  disponibilidadPct: number | null;
};

export type OperacionFilters = {
  from: string;
  to: string;
  planta: Planta | "Todas";
  equipoId: EquipoId | "Todos";
};

export type OperacionPack = {
  generatedAt: string;
  sourceFile: string;
  dateRange: { min: string; max: string };
  equipos: Equipo[];
  resumenDiario: ResumenDiario[];
  eventos: EventoOperacion[];
  actividades: ActividadOperacion[];
  consumos: ConsumoMensual[];
  conejo: RegistroConejo[];
  /** Últimas ~14 días horarias por equipo (detalle / series). */
  hourlyRecent: Record<string, RegistroHorario[]>;
  status: EquipoStatusSnapshot[];
};
