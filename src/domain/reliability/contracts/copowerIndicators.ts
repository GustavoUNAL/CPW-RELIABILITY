import type { EventRecord, MachineIndicatorRow } from "../types";
import {
  COPOWER_MONTHLY_DATA,
  type CopowerMonthKey,
} from "../reports/copowerMonthly";
import type { FieldKey } from "./fieldAssets";

const CAMPO: Record<FieldKey, string> = {
  costayaco: "COSTAYACO",
  vonu: "VONU",
};

export type CopowerUnitRow = {
  id: string;
  disp: number | null;
  conf: number | null;
  fallas: number;
  mtbf: string;
  mttr: number | null;
  riesgo: string;
  cumplimiento: string;
  energiaKwh: number | null;
  horasOp: number | null;
  horasSb: number | null;
  horasPp: number | null;
  horasPf: number | null;
  detalle?: string;
};

export type CopowerIndicatorsSnapshot = {
  available: boolean;
  label: string;
  sourceFile?: string;
  fieldLabel?: string;
  /** Campo filtrado o sistema completo. */
  scope: "field" | "system";
  disp: number | null;
  conf: number | null;
  systemDisp: number | null;
  systemConf: number | null;
  generationKwh: number | null;
  generationMwh: number | null;
  gasKwh: number | null;
  dieselKwh: number | null;
  fallas: number;
  copowerFailures: number | null;
  totalEvents: number | null;
  mtbf: number | null;
  mttr: number | null;
  hoursOp: number | null;
  hoursStandby: number | null;
  hoursPreventive: number | null;
  hoursCorrective: number | null;
  hoursPfContr: number | null;
  hoursPfCli: number | null;
  oilGal: number | null;
  units: CopowerUnitRow[];
  failureEvents: EventRecord[];
};

function avgPct(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v != null && !Number.isNaN(v));
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function assetForField(fieldKey: FieldKey, asset: string) {
  return fieldKey === "costayaco" ? /costayaco/i.test(asset) : /von/i.test(asset);
}

function unitIds(units: MachineIndicatorRow[]) {
  return new Set(units.map((u) => u.unidad));
}

export function getCopowerIndicators(
  month: string,
  fieldKey?: FieldKey,
): CopowerIndicatorsSnapshot | null {
  const snap = COPOWER_MONTHLY_DATA[month as CopowerMonthKey];
  if (!snap) return null;

  const scope = fieldKey ? "field" : "system";
  const campo = fieldKey ? CAMPO[fieldKey] : null;

  const unitsRaw = snap.machineIndicators.filter(
    (m) =>
      m.unidad !== "SISTEMA N" &&
      !/excluida|estabili/i.test(m.detalle ?? "") &&
      (campo ? m.campo === campo : true),
  );

  const equipRows = campo
    ? snap.generationByEquipment.filter((e) => e.campo === campo)
    : snap.generationByEquipment;
  const equipByUnit = new Map(equipRows.map((e) => [e.equipo, e]));

  const assetRow = fieldKey
    ? snap.generationByAsset.find((a) => assetForField(fieldKey, a.asset))
    : null;

  const consumos = campo
    ? snap.consumos.filter((c) => c.campo === campo)
    : snap.consumos;
  const oilGal = consumos.length
    ? consumos.reduce((s, c) => s + c.adicionAceite + c.cambioAceite, 0)
    : null;

  const ids = unitIds(unitsRaw);
  const failureEvents = snap.eventLog
    .filter((e) => e.eventType === "Falla" && (campo ? ids.has(e.equipment) || e.equipment.includes(campo) : true))
    .slice(0, 12);

  const disp = avgPct(unitsRaw.map((u) => u.disponibilidadPct));
  const conf = avgPct(unitsRaw.map((u) => u.confiabilidadPct));
  const fallas = unitsRaw.reduce((s, u) => s + u.fallas, 0);

  const generationKwh = fieldKey
    ? assetRow
      ? assetRow.gasKwh + assetRow.dieselKwh
      : equipRows.length
        ? equipRows.reduce((s, e) => s + e.energiaKwh, 0)
        : null
    : snap.totalGenerationKwh;

  const gasKwh = fieldKey ? (assetRow?.gasKwh ?? null) : snap.summary.energyGasKwh;
  const dieselKwh = fieldKey ? (assetRow?.dieselKwh ?? null) : snap.summary.energyDieselKwh;

  const hoursOp = equipRows.length ? equipRows.reduce((s, e) => s + e.horasOperacion, 0) : null;
  const hoursStandby = equipRows.length ? equipRows.reduce((s, e) => s + e.horasStandBy, 0) : null;
  const hoursPreventive = equipRows.length ? equipRows.reduce((s, e) => s + e.horasPP, 0) : null;
  const hoursPfContr = equipRows.length ? equipRows.reduce((s, e) => s + e.horasPFContr, 0) : null;
  const hoursPfCli = equipRows.length ? equipRows.reduce((s, e) => s + e.horasPFCli, 0) : null;
  const hoursCorrective = equipRows.length
    ? (hoursPfContr ?? 0) + (hoursPfCli ?? 0)
    : fieldKey
      ? null
      : snap.summary.hoursCorrective;

  return {
    available: true,
    label: snap.label,
    sourceFile: snap.sourceFile,
    fieldLabel: fieldKey === "costayaco" ? "Costayaco" : fieldKey === "vonu" ? "Vonú" : undefined,
    scope,
    disp,
    conf,
    systemDisp: snap.kpi.availability != null ? snap.kpi.availability * 100 : null,
    systemConf: snap.kpi.reliability != null ? snap.kpi.reliability * 100 : null,
    generationKwh,
    generationMwh: generationKwh != null ? generationKwh / 1000 : snap.kpi.generationMwh,
    gasKwh,
    dieselKwh,
    fallas,
    copowerFailures: snap.summary.copowerFailures,
    totalEvents: snap.summary.totalEvents,
    mtbf: snap.summary.mtbfHours,
    mttr: snap.summary.mttrHours,
    hoursOp,
    hoursStandby,
    hoursPreventive,
    hoursCorrective,
    hoursPfContr,
    hoursPfCli,
    oilGal,
    units: unitsRaw.map((u) => {
      const eq = equipByUnit.get(u.unidad);
      return {
        id: u.unidad,
        disp: u.disponibilidadPct,
        conf: u.confiabilidadPct,
        fallas: u.fallas,
        mtbf: u.mtbfLabel,
        mttr: u.mttrHours,
        riesgo: u.riesgoTecnico,
        cumplimiento: u.cumplimiento,
        energiaKwh: eq?.energiaKwh ?? null,
        horasOp: eq?.horasOperacion ?? null,
        horasSb: eq?.horasStandBy ?? null,
        horasPp: eq?.horasPP ?? null,
        horasPf: eq != null ? eq.horasPFContr + eq.horasPFCli : null,
        detalle: u.detalle,
      };
    }),
    failureEvents,
  };
}
