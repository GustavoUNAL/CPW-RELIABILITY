import { useState } from "react";
import type { PageKey } from "../types";
import { ACRD_HISTORY, NOVEMBER_2026, PUTN_HISTORY } from "./reliabilityHistory";
import { ExplainDialog, IndicatorChart, NovemberChart } from "./IndicatorChart";

type Props = {
  month: string;
  monthLabel: string;
  onOpen?: (page: PageKey, leafId: string) => void;
};

const pct = (value: number | null | undefined) =>
  value == null ? "—" : `${(value * 100).toFixed(2).replace(".", ",")} %`;

const mwh = (value: number | null | undefined) =>
  value == null
    ? "—"
    : `${value.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MWh`;

export function CierreReciente({ month, monthLabel, onOpen }: Props) {
  const putn = PUTN_HISTORY.find((row) => row.key === month);
  const acrd = ACRD_HISTORY.find((row) => row.key === month);
  const abierto = month === "Nov";
  const [open, setOpen] = useState(false);
  const series = PUTN_HISTORY.map((row) => ({
    mes: row.label.slice(0, 3),
    valor: row.copower.availability == null ? null : row.copower.availability * 100,
  }));

  return (
    <div className="hist-page">
      <header className="card section-head">
        <div>
          <p className="hist-kicker">{abierto ? "Mes abierto" : "Cierre publicado"}</p>
          <h2>{monthLabel} 2026</h2>
        </div>
        <button type="button" className="hist-link" onClick={() => setOpen(true)}>
          Ver más
        </button>
      </header>

      <dl className="hist-stats">
        {abierto ? (
          <>
            <div>
              <dt>Costayaco</dt>
              <dd>{NOVEMBER_2026.costayaco}</dd>
            </div>
            <div>
              <dt>Vonú</dt>
              <dd>{NOVEMBER_2026.vonu}</dd>
            </div>
            <div>
              <dt>Pad 4</dt>
              <dd>{NOVEMBER_2026.pad4}</dd>
            </div>
            <div>
              <dt>Parada 12 nov</dt>
              <dd>{NOVEMBER_2026.trip}</dd>
            </div>
          </>
        ) : (
          <>
            <div>
              <dt>Costayaco</dt>
              <dd>{pct(putn?.copower.availability)}</dd>
            </div>
            <div>
              <dt>Vonú</dt>
              <dd>{pct(putn?.vonuAvailability)}</dd>
            </div>
            <div>
              <dt>Pad 4</dt>
              <dd>{pct(acrd?.kpi?.availability)}</dd>
            </div>
            <div>
              <dt>Generación PUTN</dt>
              <dd>{mwh(putn?.copower.generationMwh)}</dd>
            </div>
          </>
        )}
      </dl>

      <section className="card">
        <h3>{abierto ? "Registros de falla · noviembre" : "Disponibilidad COPOWER"}</h3>
        {abierto ? <NovemberChart data={NOVEMBER_2026.byField} /> : <IndicatorChart data={series} goal={98} />}
      </section>

      <div className="hist-links">
        <button type="button" className="hist-link" onClick={() => onOpen?.("campos", "cfg-campos-costayaco-resumen")}>
          Costayaco
        </button>
        <button type="button" className="hist-link" onClick={() => onOpen?.("campos", "cfg-campos-vonu-resumen")}>
          Vonú
        </button>
        <button type="button" className="hist-link" onClick={() => onOpen?.("campos", "cfg-campos-pad4-resumen")}>
          Pad 4
        </button>
        <button type="button" className="hist-link" onClick={() => onOpen?.("dashboard", "dash-historial")}>
          Ver el año
        </button>
      </div>

      {open ? (
        <ExplainDialog title={`${monthLabel} 2026`} onClose={() => setOpen(false)}>
          <p>
            {abierto
              ? "Noviembre no tiene cierre de disponibilidad. Las cifras de esta pantalla son registros de falla con carpeta: 7 en Costayaco, ninguno propio de Vonú y 6 en Pad 4. La parada del 12 dejó 9,2 MW fuera de barra."
              : "Este mes ya tiene cierre. Agosto y los meses anteriores conservan el tablero completo de máquinas."}
          </p>
          {putn ? <p>{putn.note}</p> : null}
          {putn?.copower.generationMwh != null ? (
            <p>La energía del parque PUTN, Costayaco y Vonú juntos, fue {mwh(putn.copower.generationMwh)}.</p>
          ) : null}
          {putn ? <p className="muted">{putn.source}</p> : null}
          {acrd ? <p>{acrd.note}</p> : null}
          {acrd ? <p className="muted">{acrd.source}</p> : null}
        </ExplainDialog>
      ) : null}
    </div>
  );
}
