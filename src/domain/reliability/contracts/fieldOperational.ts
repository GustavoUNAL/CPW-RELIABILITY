import type { ReportKey } from "../types";
import {
  COPOWER_MONTHLY_DATA,
  type CopowerMonthKey,
} from "../reports/copowerMonthly";
import {
  GRAN_TIERRA_MONTHLY_DATA,
  type GranTierraMonthKey,
} from "../reports/granTierraMonthly";
import type { FieldKey } from "./fieldAssets";
import {
  novemberDailyField,
  novemberDailyHasData,
  novemberDailyMeta,
} from "../history/novemberDailyGte";

const CAMPO: Record<FieldKey, string> = {
  costayaco: "COSTAYACO",
  vonu: "VONU",
};

export type FieldUnitLive = {
  id: string;
  disp: number | null;
  conf: number | null;
  fallas: number;
  mtbf: string;
  mttr: number | null;
  riesgo: string;
  energiaKwh: number | null;
  horasOperacion: number | null;
};

export type FieldOperationalData = {
  available: boolean;
  sourceFile?: string;
  reportLabel: string;
  disp: number | null;
  conf: number | null;
  generationKwh: number | null;
  gasKwh: number | null;
  dieselKwh: number | null;
  fallas: number;
  hoursOp: number | null;
  hoursFs: number | null;
  units: FieldUnitLive[];
};

function getSnap(report: ReportKey, month: string) {
  if (report === "gran_tierra") {
    return GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  }
  return COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ?? null;
}

function avgPct(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v != null && !Number.isNaN(v));
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function assetForField(fieldKey: FieldKey, asset: string) {
  return fieldKey === "costayaco" ? /costayaco/i.test(asset) : /von/i.test(asset);
}

function fromNovemberDaily(
  fieldKey: Extract<FieldKey, "costayaco" | "vonu">,
  reportLabel: string,
): FieldOperationalData {
  const live = novemberDailyField(fieldKey);
  const meta = novemberDailyMeta();
  const gasKwh = live.unitsDetail
    .filter((u) => /GAS/i.test(u.fuel))
    .reduce((s, u) => s + u.kwh, 0);
  return {
    available: true,
    sourceFile: meta.sourceFile,
    reportLabel: `${reportLabel} · ${meta.corteLabel}`,
    disp: live.disp == null ? null : live.disp * 100,
    conf: live.conf == null ? null : live.conf * 100,
    generationKwh: live.kwh,
    gasKwh,
    dieselKwh: live.kwh - gasKwh,
    fallas: live.fallas,
    hoursOp: live.hOp,
    hoursFs: live.hMtoC + live.hExt,
    units: live.unitsDetail.map((u) => ({
      id: u.tag,
      disp: u.disp == null ? null : u.disp * 100,
      conf: u.conf == null ? null : u.conf * 100,
      fallas: u.fallas,
      mtbf: "—",
      mttr: null,
      riesgo: u.fallas > 0 ? "FO" : "OK",
      energiaKwh: u.kwh,
      horasOperacion: u.hOp,
    })),
  };
}

export function getFieldOperational(
  report: ReportKey,
  month: string,
  fieldKey: FieldKey,
): FieldOperationalData {
  const snap = getSnap(report, month);
  const campo = CAMPO[fieldKey];
  const reportLabel = report === "gran_tierra" ? "Gran Tierra Energy" : "COPOWER";

  // Noviembre abierto: el pack diario GTE (carpeta reporte-diario/2026-11) alimenta GTE.
  if (
    !snap &&
    report === "gran_tierra" &&
    novemberDailyHasData(month) &&
    (fieldKey === "costayaco" || fieldKey === "vonu")
  ) {
    return fromNovemberDaily(fieldKey, reportLabel);
  }

  if (!snap) {
    return {
      available: false,
      reportLabel,
      disp: null,
      conf: null,
      generationKwh: null,
      gasKwh: null,
      dieselKwh: null,
      fallas: 0,
      hoursOp: null,
      hoursFs: null,
      units: [],
    };
  }

  const sistema = snap.machineIndicators.find((m) => m.unidad === "SISTEMA N" && m.campo === campo);
  const unitsRaw = snap.machineIndicators.filter(
    (m) => m.campo === campo && m.unidad !== "SISTEMA N" && !/excluida|estabili/i.test(m.detalle ?? ""),
  );
  const equipRows = snap.generationByEquipment.filter((e) => e.campo === campo);
  const equipByUnit = new Map(equipRows.map((e) => [e.equipo, e]));
  const assetRow = snap.generationByAsset.find((a) => assetForField(fieldKey, a.asset));

  const disp = sistema?.disponibilidadPct ?? avgPct(unitsRaw.map((u) => u.disponibilidadPct));
  const conf = sistema?.confiabilidadPct ?? avgPct(unitsRaw.map((u) => u.confiabilidadPct));
  const fallas = unitsRaw.reduce((s, u) => s + u.fallas, 0);
  const hoursOp = equipRows.length ? equipRows.reduce((s, e) => s + e.horasOperacion, 0) : null;
  const hoursFs = equipRows.length
    ? equipRows.reduce((s, e) => s + e.horasPFContr + e.horasPFCli, 0)
    : null;
  const generationKwh = assetRow
    ? assetRow.gasKwh + assetRow.dieselKwh
    : equipRows.length
      ? equipRows.reduce((s, e) => s + e.energiaKwh, 0)
      : null;

  return {
    available: true,
    sourceFile: snap.sourceFile,
    reportLabel,
    disp,
    conf,
    generationKwh,
    gasKwh: assetRow?.gasKwh ?? null,
    dieselKwh: assetRow?.dieselKwh ?? null,
    fallas,
    hoursOp,
    hoursFs,
    units: unitsRaw.map((u) => {
      const gen = equipByUnit.get(u.unidad);
      return {
        id: u.unidad,
        disp: u.disponibilidadPct,
        conf: u.confiabilidadPct,
        fallas: u.fallas,
        mtbf: u.mtbfLabel,
        mttr: u.mttrHours,
        riesgo: u.riesgoTecnico,
        energiaKwh: gen?.energiaKwh ?? null,
        horasOperacion: gen?.horasOperacion ?? null,
      };
    }),
  };
}
