import { useState } from "react";
import type { PageKey } from "../types";
import { ExplainDialog, IndicatorChart, NovemberChart } from "./IndicatorChart";
import { NOVEMBER_2026 } from "./reliabilityHistory";
import { getFieldOperational } from "../contracts/fieldOperational";
import {
  ACRD_HISTORY,
  COVERAGE_LABEL,
  PUTN_HISTORY,
  type HistoryCoverage,
  type HistoryKpi,
} from "./reliabilityHistory";
import {
  novemberDailyField,
  novemberDailyHasData,
  novemberDailyMeta,
} from "./novemberDailyGte";

export type IndependentField = "costayaco" | "vonu" | "pad4";

type Props = {
  field: IndependentField;
  month: string;
  monthLabel: string;
  onOpen?: (page: PageKey, leafId: string) => void;
  embedded?: boolean;
};

type FieldRow = {
  key: string;
  label: string;
  coverage: HistoryCoverage;
  kpi: HistoryKpi;
  note: string;
};

const PROFILE: Record<
  IndependentField,
  { title: string; place: string; goal: string; reading: string }
> = {
  costayaco: {
    title: "Costayaco",
    place: "PUTN · Bloque Chaza",
    goal: "La meta de este campo es 98 % de disponibilidad o más.",
    reading: "De enero a agosto la cifra sale del modelo del campo. En septiembre y octubre sale de la presentación de cierre.",
  },
  vonu: {
    title: "Vonú",
    place: "PUTN · Bloque Chaza",
    goal: "La meta de este campo es 90 % de disponibilidad o más.",
    reading: "De enero a agosto la cifra sale del modelo del campo. En septiembre y octubre sale de la presentación, aparte de Costayaco.",
  },
  pad4: {
    title: "Pad 4",
    place: "Acordionero · otro contrato",
    goal: "Se lee en N+1 operacional. No se suma con Costayaco ni con Vonú.",
    reading: "Septiembre y octubre salen de la presentación del pad. Agosto está en disco y todavía no entra a esta ficha.",
  },
};

const pct = (value: number | null | undefined) =>
  value == null ? "—" : `${(value * 100).toFixed(2).replace(".", ",")} %`;

const mwh = (value: number | null | undefined) =>
  value == null
    ? "—"
    : `${value.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MWh`;

const ratio = (value: number | null | undefined) =>
  value == null ? null : value > 1 ? value / 100 : value;

function emptyKpi(): HistoryKpi {
  return { availability: null, reliability: null, generationMwh: null, failures: null };
}

function modelRow(field: "costayaco" | "vonu", key: string, label: string): FieldRow | null {
  const cpw = getFieldOperational("copower", key, field);
  const gte = getFieldOperational("gran_tierra", key, field);
  const ops = cpw.available ? cpw : gte;
  if (!ops.available || (ops.disp == null && ops.generationKwh == null)) return null;
  const fromGteDaily = !cpw.available && gte.available && key === "Nov";
  return {
    key,
    label,
    coverage: fromGteDaily ? "abierto" : "modelo",
    kpi: {
      availability: ratio(ops.disp),
      reliability: ratio(ops.conf),
      generationMwh: ops.generationKwh == null ? null : ops.generationKwh / 1000,
      failures: ops.fallas,
    },
    note: fromGteDaily
      ? `Corte ${novemberDailyMeta().corteLabel} · reporte diario GTE. Sin cierre contractual.`
      : "Cifra de este campo en el modelo COPOWER.",
  };
}

function rowsFor(field: IndependentField): FieldRow[] {
  if (field === "pad4") {
    return PUTN_HISTORY.map((month) => {
      const acrd = ACRD_HISTORY.find((row) => row.key === month.key);
      if (!acrd) {
        return {
          key: month.key,
          label: month.label,
          coverage: "abierto",
          kpi: emptyKpi(),
          note: "Pad 4 no tiene cierre cargado en este mes.",
        };
      }
      return {
        key: acrd.key,
        label: acrd.label,
        coverage: acrd.coverage,
        kpi: acrd.kpi ?? emptyKpi(),
        note: acrd.note,
      };
    });
  }

  return PUTN_HISTORY.map((month) => {
    const fromModel = modelRow(field, month.key, month.label);
    if (fromModel) return fromModel;
    if (field === "vonu" && month.vonuAvailability != null) {
      return {
        key: month.key,
        label: month.label,
        coverage: month.coverage,
        kpi: {
          availability: month.vonuAvailability,
          reliability: month.vonuReliability,
          generationMwh: null,
          failures: null,
        },
        note: "Cifra de Vonú en la presentación de cierre. Va aparte de Costayaco.",
      };
    }
    if (field === "costayaco" && (month.key === "Sep" || month.key === "Oct")) {
      return {
        key: month.key,
        label: month.label,
        coverage: month.coverage,
        kpi: {
          availability: month.copower.availability,
          reliability: month.copower.reliability,
          generationMwh: null,
          failures: month.copower.failures,
        },
        note: `${month.note} La energía publicada ese mes es del parque, no solo de Costayaco.`,
      };
    }
    return {
      key: month.key,
      label: month.label,
      coverage: month.key === "Nov" ? "abierto" : month.coverage,
      kpi: emptyKpi(),
      note: month.key === "Nov" ? month.note : "Este mes no trae una cifra propia del campo.",
    };
  });
}

export function CampoFicha({ field, month, monthLabel, onOpen, embedded = false }: Props) {
  const profile = PROFILE[field];
  const rows = rowsFor(field);
  const current = rows.find((row) => row.key === month) ?? rows[rows.length - 1];
  const [open, setOpen] = useState(false);
  const november = month === "Nov";
  const goal = field === "costayaco" ? 98 : field === "vonu" ? 90 : undefined;
  const series = rows.map((row) => ({
    mes: row.label.slice(0, 3),
    valor: row.kpi.availability == null ? null : row.kpi.availability * 100,
  }));
  const novemberDays =
    field === "costayaco" ? NOVEMBER_2026.costayacoDays : field === "pad4" ? NOVEMBER_2026.pad4Days : [];

  return (
    <div className="hist-page">
      <header className="card section-head">
        <div>
          <p className="hist-kicker">{profile.place}</p>
          <h2>{profile.title}</h2>
        </div>
        <button type="button" className="hist-link" onClick={() => setOpen(true)}>
          Ver más
        </button>
      </header>

      <dl className="hist-stats">
        {november && field === "pad4" ? (
          <>
            <div>
              <dt>Registros</dt>
              <dd>{NOVEMBER_2026.pad4}</dd>
            </div>
            <div>
              <dt>12 nov</dt>
              <dd>6 de 6</dd>
            </div>
            <div>
              <dt>Potencia</dt>
              <dd>{NOVEMBER_2026.trip}</dd>
            </div>
            <div>
              <dt>Disponibilidad</dt>
              <dd>Sin cierre</dd>
            </div>
          </>
        ) : november && novemberDailyHasData(month) && (field === "costayaco" || field === "vonu") ? (
          <>
            <div>
              <dt>Disponibilidad</dt>
              <dd>{pct(novemberDailyField(field).disp)}</dd>
            </div>
            <div>
              <dt>Confiabilidad</dt>
              <dd>{pct(novemberDailyField(field).conf)}</dd>
            </div>
            <div>
              <dt>Generación</dt>
              <dd>{mwh(novemberDailyField(field).mwh)}</dd>
            </div>
            <div>
              <dt>Fallas</dt>
              <dd>{novemberDailyField(field).fallas}</dd>
            </div>
          </>
        ) : november ? (
          <>
            <div>
              <dt>Registros</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt>Carpeta</dt>
              <dd>No hay</dd>
            </div>
            <div>
              <dt>Último cierre</dt>
              <dd>{pct([...rows].reverse().find((row) => row.kpi.availability != null)?.kpi.availability)}</dd>
            </div>
            <div>
              <dt>Disponibilidad</dt>
              <dd>Sin cierre</dd>
            </div>
          </>
        ) : (
          <>
            <div>
              <dt>Disponibilidad</dt>
              <dd>{pct(current?.kpi.availability)}</dd>
            </div>
            <div>
              <dt>Confiabilidad</dt>
              <dd>{pct(current?.kpi.reliability)}</dd>
            </div>
            <div>
              <dt>Generación</dt>
              <dd>{mwh(current?.kpi.generationMwh)}</dd>
            </div>
            <div>
              <dt>Fallas</dt>
              <dd>{current?.kpi.failures == null ? "—" : current.kpi.failures}</dd>
            </div>
          </>
        )}
      </dl>

      <section className="card">
        <h3>
          {november && novemberDays.length
            ? `Registros · ${monthLabel}`
            : november
              ? "Últimos cierres"
              : `Disponibilidad · ${monthLabel}`}
        </h3>
        {november && novemberDays.length ? (
          <NovemberChart data={novemberDays} />
        ) : (
          <IndicatorChart data={series} goal={goal} />
        )}
      </section>

      {open ? (
        <ExplainDialog title={profile.title} onClose={() => setOpen(false)}>
          <p>
            {profile.goal} {profile.reading}
          </p>
          <p>
            <strong>{monthLabel}.</strong> {current?.note}
          </p>
          <ul>
            {rows
              .filter((row) => row.kpi.availability != null || row.coverage === "fuente" || row.coverage === "abierto")
              .map((row) => (
                <li key={row.key}>
                  <strong>{row.label}.</strong> {COVERAGE_LABEL[row.coverage]}. Disponibilidad {pct(row.kpi.availability)}. {row.note}
                </li>
              ))}
          </ul>
        </ExplainDialog>
      ) : null}

      {embedded ? null : (
      <div className="hist-links">
        <button type="button" className="hist-link" onClick={() => onOpen?.("dashboard", "dash-historial")}>
          Ver el parque
        </button>
        {field !== "costayaco" ? (
          <button type="button" className="hist-link" onClick={() => onOpen?.("campos", "cfg-campos-costayaco-resumen")}>
            Costayaco
          </button>
        ) : null}
        {field !== "vonu" ? (
          <button type="button" className="hist-link" onClick={() => onOpen?.("campos", "cfg-campos-vonu-resumen")}>
            Vonú
          </button>
        ) : null}
        {field !== "pad4" ? (
          <button type="button" className="hist-link" onClick={() => onOpen?.("campos", "cfg-campos-pad4-resumen")}>
            Pad 4
          </button>
        ) : null}
      </div>
      )}
    </div>
  );
}
