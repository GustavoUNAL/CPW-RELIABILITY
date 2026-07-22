import { useMemo } from "react";
import {
  COPOWER_MONTHLY_DATA,
  type CopowerMonthKey,
} from "./copowerMonthly";
import {
  GRAN_TIERRA_MONTHLY_DATA,
  type GranTierraMonthKey,
} from "./granTierraMonthly";
import {
  classifyEventCategory,
  EVENT_CATEGORIES,
  type EventCategoryCode,
} from "../events/eventCategories";
import type { ReportKey } from "../types";

type Props = {
  month: string;
  monthLabel: string;
};

function getSnap(report: ReportKey, month: string) {
  if (report === "gran_tierra") return GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  return COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ?? null;
}

/** Misma lógica de origen GTE-junio que EventInsightsDashboard. */
function classifyGranTierraJuneByOrigin(input: {
  cause: string;
  notes: string;
  date: string;
  equipment: string;
}): EventCategoryCode {
  const text = `${input.cause || ""} ${input.notes || ""}`.toLowerCase();

  if (/tablero de auxiliares|totalizador principal|protecci/.test(text)) return "ELEC_PROTECCIONES";
  if (/reconectador|34\.?5\s*kv|disparo de c9|perturbacion en la red|elevacion del voltaje|potencia reactiva|sobrecorriente/.test(text)) {
    return "ELEC_RED";
  }
  if (/tuberia de cyc|cyc 19/.test(text)) return "INFRA_AUXILIARES";
  if (/magnetiz|pruebas de magnetiz/.test(text)) return "OPER_MANIOBRA";
  if (/mantenimiento semanal de mru|mantenimiento cyc|cambio de v[áa]lvula/.test(text)) return "MTO_PROGRAMADO";
  if (/mru|ngl|quincy|chiller|secuestrante/.test(text)) return "GAS_TRATAMIENTO";
  if (/deton/.test(text)) return "MEC_COMBUSTION";
  if (/intercooler|aceite|enfriamiento/.test(text)) return "MEC_ENFRIAMIENTO_LUBRICACION";
  if (/admisi[oó]n|escape|flexible|tren de admision/.test(text)) return "MEC_ADMISION_ESCAPE";
  if (/potencia inversa|sobrecarga|gobernaci[oó]n|reparto de carga/.test(text)) return "CTRL_GOBERNACION";
  if (/altas vivraciones|altas vibraciones/.test(text)) return "DATOS_INSUFICIENTES";

  return classifyEventCategory(text).code;
}

function classifyEvent(
  report: ReportKey,
  month: string,
  cause: string,
  notes: string,
  date: string,
  equipment: string,
): EventCategoryCode {
  if (report === "gran_tierra" && month === "Jun") {
    return classifyGranTierraJuneByOrigin({ cause, notes, date, equipment });
  }
  return classifyEventCategory(notes || cause || "").code;
}

export function FailureClassificationView({ month, monthLabel }: Props) {
  const rows = useMemo(() => {
    const counts = new Map<string, number>();
    for (const cat of EVENT_CATEGORIES) counts.set(cat.code, 0);

    let total = 0;
    for (const report of ["copower", "gran_tierra"] as const) {
      const snap = getSnap(report, month);
      if (!snap) continue;
      for (const e of snap.eventLog) {
        const code = classifyEvent(report, month, e.cause || "", e.notes || "", e.date, e.equipment || "");
        counts.set(code, (counts.get(code) ?? 0) + 1);
        total += 1;
      }
    }

    return EVENT_CATEGORIES.map((cat) => {
      const count = counts.get(cat.code) ?? 0;
      return {
        code: cat.code,
        label: cat.label,
        count,
        share: total > 0 ? (count / total) * 100 : 0,
      };
    });
  }, [month]);

  const totalEvents = rows.reduce((s, r) => s + r.count, 0);

  return (
    <div className="panel">
      <article className="card">
        <p className="eyebrow">Taxonomía de causa · COPOWER + Gran Tierra</p>
        <div className="screen-shell-head">
          <h3>Clasificación de fallas</h3>
          <span className="source-badge dual">Integrado</span>
        </div>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          Catálogo de categorías · {monthLabel} · {totalEvents} evento(s) clasificado(s)
        </p>

        <div className="table-wrap category-modal-table" style={{ marginTop: "0.85rem" }}>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Categoría</th>
                <th>Eventos</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((cat) => (
                <tr key={cat.code}>
                  <td>
                    <strong>{cat.code}</strong>
                  </td>
                  <td>{cat.label}</td>
                  <td>{cat.count}</td>
                  <td>{cat.share.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
