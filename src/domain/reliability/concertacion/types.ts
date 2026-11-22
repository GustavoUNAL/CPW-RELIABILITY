export type ConcertacionRegistro = {
  fecha: string;
  cuenca: string | null;
  campo: string | null;
  contratista: string | null;
  unidad: string | null;
  tag: string;
  capacidadInstaladaKw: number | null;
  capacidadEntregadaKw: number | null;
  horometroInicial: number | null;
  horometroFinal: number | null;
  kwhGenerados: number | null;
  potenciaPromedioKw: number | null;
  horasOperacion: number;
  horasStandBy: number;
  horasMmtPreventivo: number;
  horasMmtCorrectivo: number;
  totalHoras: number;
  horasParadasExternas: number;
  numeroFallas: number;
  combustiblePrimario: string | null;
  observaciones: string | null;
  balanceOk: boolean;
  sumaComponentes: number;
  sumaOk: boolean;
};

export type ConcertacionPack = {
  meta: {
    fuente: string;
    hoja: string;
    generado: string;
    periodo: { desde: string; hasta: string };
    fechasConDatos: string[];
    diasConDatos: number;
    diasEsperados: number;
    unidades: number;
    registros: number;
    notas: string[];
  };
  registros: ConcertacionRegistro[];
};

export type ConcertacionSection =
  | "resumen"
  | "unidades"
  | "diario"
  | "paradas"
  | "validacion";

export type UnidadResumen = {
  tag: string;
  campo: string;
  dias: number;
  horasOperacion: number;
  horasStandBy: number;
  horasMmtPreventivo: number;
  horasMmtCorrectivo: number;
  horasParadasExternas: number;
  horasTeoricas: number;
  kwhGenerados: number;
  pctOperacion: number;
  pctStandBy: number;
  pctPreventivo: number;
  pctCorrectivo: number;
  pctParadasExternas: number;
  diasConObservacion: number;
  diasConParadaExterna: number;
};

export type DiaResumen = {
  fecha: string;
  label: string;
  unidades: number;
  horasOperacion: number;
  horasStandBy: number;
  horasMmtPreventivo: number;
  horasMmtCorrectivo: number;
  horasParadasExternas: number;
  kwhGenerados: number;
  registrosConObs: number;
};

export type ParadaDestacada = {
  fecha: string;
  tag: string;
  campo: string | null;
  horasParadasExternas: number;
  horasOperacion: number;
  horasStandBy: number;
  observaciones: string;
};

export type ValidacionFila = {
  fecha: string;
  tag: string;
  totalHoras: number;
  sumaComponentes: number;
  balanceOk: boolean;
  sumaOk: boolean;
};

export type ConcertacionAnalysis = {
  meta: ConcertacionPack["meta"];
  unidadOrder: string[];
  resumenFlota: {
    horasOperacion: number;
    horasStandBy: number;
    horasMmtPreventivo: number;
    horasMmtCorrectivo: number;
    horasParadasExternas: number;
    horasTeoricas: number;
    kwhGenerados: number;
    pctOperacion: number;
    pctStandBy: number;
    pctPreventivo: number;
    pctCorrectivo: number;
    pctParadasExternas: number;
    registrosConObs: number;
    registrosConParadaExt: number;
    diasFaltantes: string[];
  };
  porUnidad: UnidadResumen[];
  porDia: DiaResumen[];
  paradas: ParadaDestacada[];
  observaciones: ParadaDestacada[];
  validacion: {
    filasInvalidas: ValidacionFila[];
    todasOk: boolean;
  };
  porCampo: Array<{
    campo: string;
    unidades: number;
    horasOperacion: number;
    horasParadasExternas: number;
    pctOperacion: number;
  }>;
};
