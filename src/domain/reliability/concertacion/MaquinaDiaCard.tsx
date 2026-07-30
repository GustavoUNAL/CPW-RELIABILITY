import type { DiaDetalleUnidad, MaquinaEstadoDia } from "./dayDetail";
import { estadoLabel } from "./dayDetail";

const hours = (v: number) =>
  v > 0 ? `${v.toLocaleString("es-CO", { maximumFractionDigits: 1 })} h` : "—";

function estadoTone(e: MaquinaEstadoDia): string {
  switch (e) {
    case "operacion_plena":
      return "ok";
    case "parada_externa":
      return "ext";
    case "mantenimiento_preventivo":
    case "mantenimiento_correctivo":
      return "mto";
    case "standby":
    case "sin_generacion":
      return "sb";
    case "respaldo_diesel":
      return "diesel";
    default:
      return "neutral";
  }
}

function HourBar({ r }: { r: DiaDetalleUnidad["registro"] }) {
  const segments = [
    { h: r.horasOperacion, cls: "op", label: "OP" },
    { h: r.horasStandBy, cls: "sb", label: "SB" },
    { h: r.horasMmtPreventivo, cls: "prev", label: "MMT P" },
    { h: r.horasMmtCorrectivo, cls: "corr", label: "MMT C" },
  ].filter((s) => s.h > 0);

  return (
    <div className="conc-hourbar" aria-label="Distribución de 24 horas">
      <div className="conc-hourbar-track">
        {segments.map((s) => (
          <div
            key={s.cls}
            className={`conc-hourbar-seg conc-hourbar-seg--${s.cls}`}
            style={{ flex: s.h }}
            title={`${s.label}: ${s.h} h`}
          />
        ))}
      </div>
      <div className="conc-hourbar-legend">
        {segments.map((s) => (
          <span key={s.cls}>
            <i className={`conc-hourbar-dot conc-hourbar-dot--${s.cls}`} />
            {s.label} {s.h}h
          </span>
        ))}
        {r.horasParadasExternas > 0 ? (
          <span className="conc-hourbar-ext">Par. ext. {r.horasParadasExternas} h</span>
        ) : null}
      </div>
    </div>
  );
}

type CardProps = {
  item: DiaDetalleUnidad;
  defaultOpen?: boolean;
};

export function MaquinaDiaCard({ item, defaultOpen = true }: CardProps) {
  const { registro: r, estados, eventosObs, motivoResumen, tuvoParo } = item;
  const horometroDelta =
    r.horometroInicial != null && r.horometroFinal != null
      ? r.horometroFinal - r.horometroInicial
      : null;

  return (
    <details className={`conc-machine${tuvoParo ? " conc-machine--event" : ""}`} open={defaultOpen}>
      <summary className="conc-machine-head">
        <div className="conc-machine-title">
          <strong>{r.tag}</strong>
          <span className="conc-machine-meta">
            {r.unidad} · {r.campo}
          </span>
        </div>
        <div className="conc-machine-badges">
          {estados.map((e) => (
            <span key={e} className={`conc-badge conc-badge--${estadoTone(e)}`}>
              {estadoLabel(e)}
            </span>
          ))}
          {r.horasParadasExternas > 0 ? (
            <span className="conc-badge conc-badge--ext">{r.horasParadasExternas} h ext.</span>
          ) : null}
        </div>
        <span className="conc-machine-op">{Math.round(item.pctOperacion)}% OP</span>
      </summary>

      <div className="conc-machine-body">
        <HourBar r={r} />

        <div className="conc-machine-grid">
          <div>
            <span className="conc-field-label">Operación</span>
            <strong>{hours(r.horasOperacion)}</strong>
          </div>
          <div>
            <span className="conc-field-label">Stand-by</span>
            <strong>{hours(r.horasStandBy)}</strong>
          </div>
          <div>
            <span className="conc-field-label">MMT preventivo</span>
            <strong className={r.horasMmtPreventivo > 0 ? "conc-warn" : undefined}>
              {hours(r.horasMmtPreventivo)}
            </strong>
          </div>
          <div>
            <span className="conc-field-label">MMT correctivo</span>
            <strong className={r.horasMmtCorrectivo > 0 ? "conc-warn" : undefined}>
              {hours(r.horasMmtCorrectivo)}
            </strong>
          </div>
          <div>
            <span className="conc-field-label">Paradas externas</span>
            <strong className={r.horasParadasExternas > 0 ? "conc-warn" : undefined}>
              {hours(r.horasParadasExternas)}
            </strong>
          </div>
          <div>
            <span className="conc-field-label">Fallas</span>
            <strong>{r.numeroFallas > 0 ? r.numeroFallas : "—"}</strong>
          </div>
        </div>

        {motivoResumen ? (
          <section className="conc-machine-block">
            <h4>Motivo / situación del día</h4>
            <p className="conc-machine-motivo">{motivoResumen}</p>
          </section>
        ) : null}

        {eventosObs.length > 0 ? (
          <section className="conc-machine-block">
            <h4>Comentarios y secuencia operativa</h4>
            <ol className="conc-event-list">
              {eventosObs.map((ev, i) => (
                <li key={`${i}-${ev.slice(0, 24)}`}>{ev}</li>
              ))}
            </ol>
          </section>
        ) : !motivoResumen ? (
          <p className="conc-machine-sin-obs muted">Sin observaciones registradas — operación reportada sin novedad.</p>
        ) : null}

        <section className="conc-machine-block conc-machine-block--tech">
          <h4>Generación y horómetro</h4>
          <dl className="conc-tech-dl">
            <div>
              <dt>kWh generados</dt>
              <dd>{r.kwhGenerados != null ? Math.round(r.kwhGenerados).toLocaleString("es-CO") : "—"}</dd>
            </div>
            <div>
              <dt>Potencia prom.</dt>
              <dd>{r.potenciaPromedioKw != null ? `${Math.round(r.potenciaPromedioKw)} kW` : "—"}</dd>
            </div>
            <div>
              <dt>Cap. entregada</dt>
              <dd>{r.capacidadEntregadaKw ?? "—"} kW</dd>
            </div>
            <div>
              <dt>Horómetro</dt>
              <dd>
                {r.horometroInicial ?? "—"} → {r.horometroFinal ?? "—"}
                {horometroDelta != null ? ` (+${horometroDelta} h)` : ""}
              </dd>
            </div>
            <div>
              <dt>Combustible</dt>
              <dd>{r.combustiblePrimario ?? "—"}</dd>
            </div>
            <div>
              <dt>Total día</dt>
              <dd>{r.totalHoras} h</dd>
            </div>
          </dl>
        </section>
      </div>
    </details>
  );
}
