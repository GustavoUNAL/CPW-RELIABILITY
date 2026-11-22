import { useState } from "react";
import type { PageKey } from "../types";
import { NOVEMBER_2026, PUTN_HISTORY } from "./reliabilityHistory";
import { ExplainDialog, IndicatorChart, NovemberChart } from "./IndicatorChart";

type Props = {
  month?: string;
  onOpen?: (page: PageKey, leafId: string) => void;
  isAdmin?: boolean;
};

const pct = (value: number | null | undefined) =>
  value == null || Number.isNaN(value) ? "—" : `${(value * 100).toFixed(2).replace(".", ",")} %`;

const mwh = (value: number | null | undefined) =>
  value == null
    ? "—"
    : `${value.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MWh`;

const count = (value: number | null | undefined) => (value == null ? "—" : String(value));

export function HistorialConfiabilidad({ month, onOpen }: Props) {
  const current = PUTN_HISTORY.find((row) => row.key === month) ?? PUTN_HISTORY[PUTN_HISTORY.length - 1];
  const [open, setOpen] = useState(false);
  const november = month === "Nov" || current.key === "Nov";
  const series = PUTN_HISTORY.map((row) => ({
    mes: row.label.slice(0, 3),
    valor: row.copower.availability == null ? null : row.copower.availability * 100,
  }));

  return (
    <div className="hist-page">
      <header className="card section-head">
        <div>
          <p className="hist-kicker">Confiabilidad 2026</p>
          <h2>Cómo va el parque</h2>
        </div>
        <button type="button" className="hist-link" onClick={() => setOpen(true)}>
          Ver más
        </button>
      </header>
      <dl className="hist-stats">
        {november ? (
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
              <dt>Disponibilidad</dt>
              <dd>{pct(current.copower.availability)}</dd>
            </div>
            <div>
              <dt>Confiabilidad</dt>
              <dd>{pct(current.copower.reliability)}</dd>
            </div>
            <div>
              <dt>Generación</dt>
              <dd>{mwh(current.copower.generationMwh)}</dd>
            </div>
            <div>
              <dt>Fallas</dt>
              <dd>{count(current.copower.failures)}</dd>
            </div>
          </>
        )}
      </dl>
      <section className="card">
        <h3>{november ? "Registros de falla · noviembre" : "Disponibilidad COPOWER"}</h3>
        {november ? <NovemberChart data={NOVEMBER_2026.byField} /> : <IndicatorChart data={series} goal={98} />}
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
      </div>
      {open ? (
        <ExplainDialog title="Cómo leer el parque" onClose={() => setOpen(false)}>
          <p>Costayaco debe sostener al menos 98 % de disponibilidad. Vonú, al menos 90 %. El número de cada mes es el de COPOWER.</p>
          <p>Disponibilidad: de cada 100 horas del mes, cuántas la máquina pudo estar lista para generar. El stand-by cuenta como disponible.</p>
          <p>Confiabilidad: de esas horas, cuántas no hubo una falla imputable a COPOWER. El mantenimiento programado no se cuenta como falla.</p>
          <p>Generación: energía entregada, en MWh. Sirve para ver el tamaño del mes, no para decir si se cumplió el contrato.</p>
          <p>Hasta junio las fallas salen del reporte diario. Desde julio salen de las horas concertadas con el cliente, por eso el conteo baja y no se compara directo.</p>
          <p>
            <strong>{current.label}.</strong> {current.note}
          </p>
        </ExplainDialog>
      ) : null}
    </div>
  );
}
