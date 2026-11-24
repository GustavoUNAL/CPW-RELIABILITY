/** Overview del campo Costayaco · flota gas + assets visuales. */

export type CycMachineFamily = "j320" | "j420" | "jinan";

export type CycMachine = {
  tag: string;
  family: CycMachineFamily;
  model: string;
  maker: string;
  installedKw: number;
  deliveredKw: number;
  /** Posición en el croquis del pad (porcentaje). */
  x: number;
  y: number;
};

export const CYC_SYSTEM = {
  title: "Campo Costayaco",
  place: "PUTN · Bloque Chaza · Putumayo Norte",
  tension: "13,8 kV",
  metaDisp: "98 %",
  potenciaBloque: "8 MW",
  gasMachines: 10,
  dieselBackup: 6,
  description: "10 máquinas a gas · entrega 13,8 kV · meta 98 %.",
  detail:
    "Jenbacher J320/J420 y Jinan en el pad Costayaco. Respaldo diésel contractual aparte.",
};

export const CYC_FAMILIES: Record<
  CycMachineFamily,
  { label: string; photo: string; installedKw: number; units: string[]; tone: string }
> = {
  j320: {
    label: "Jenbacher J320",
    photo: "/costayaco/overview/equipo-j320.png",
    installedKw: 1050,
    units: ["CPW-01", "CPW-02", "CPW-03", "CPW-07"],
    tone: "j320",
  },
  j420: {
    label: "Jenbacher J420",
    photo: "/costayaco/overview/equipo-j420.png",
    installedKw: 1300,
    units: ["CPW-04", "CPW-05", "CPW-06"],
    tone: "j420",
  },
  jinan: {
    label: "Jinan",
    photo: "/costayaco/overview/equipo-jinan.png",
    installedKw: 600,
    units: ["CPW-10", "CPW-11", "CPW-12"],
    tone: "jinan",
  },
};

/** Croquis lógico del pad Costayaco (no georreferenciado). */
export const CYC_MACHINES: CycMachine[] = [
  { tag: "CPW-01", family: "j320", model: "J320", maker: "Jenbacher", installedKw: 1050, deliveredKw: 700, x: 14, y: 28 },
  { tag: "CPW-02", family: "j320", model: "J320", maker: "Jenbacher", installedKw: 1050, deliveredKw: 700, x: 28, y: 28 },
  { tag: "CPW-03", family: "j320", model: "J320", maker: "Jenbacher", installedKw: 1050, deliveredKw: 700, x: 42, y: 28 },
  { tag: "CPW-07", family: "j320", model: "J320", maker: "Jenbacher", installedKw: 1050, deliveredKw: 740, x: 56, y: 28 },
  { tag: "CPW-04", family: "j420", model: "J420", maker: "Jenbacher", installedKw: 1300, deliveredKw: 1040, x: 18, y: 58 },
  { tag: "CPW-05", family: "j420", model: "J420", maker: "Jenbacher", installedKw: 1300, deliveredKw: 1040, x: 34, y: 58 },
  { tag: "CPW-06", family: "j420", model: "J420", maker: "Jenbacher", installedKw: 1300, deliveredKw: 1040, x: 50, y: 58 },
  { tag: "CPW-10", family: "jinan", model: "JINAN", maker: "Jinan", installedKw: 600, deliveredKw: 450, x: 72, y: 28 },
  { tag: "CPW-11", family: "jinan", model: "JINAN", maker: "Jinan", installedKw: 600, deliveredKw: 450, x: 84, y: 28 },
  { tag: "CPW-12", family: "jinan", model: "JINAN", maker: "Jinan", installedKw: 600, deliveredKw: 450, x: 78, y: 58 },
];

export const CYC_OVERVIEW_ASSETS = {
  configuracion: "/costayaco/overview/configuracion-equipos.png",
  unifilar: "/costayaco/overview/unifilar-costayaco.png",
};
