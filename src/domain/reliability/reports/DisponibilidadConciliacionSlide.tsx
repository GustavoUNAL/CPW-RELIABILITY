import {
  GRAN_TIERRA_MONTHLY_DATA,
  type GranTierraMonthKey,
} from "./granTierraMonthly";
import {
  buildDisponibilidadAnalisis,
  gteAvailabilityTerms,
} from "./DisponibilidadAnalisisBoard";

type Props = {
  month: string;
  monthLabel: string;
};

function fmtN(v: number) {
  return v.toLocaleString("es-CO", { maximumFractionDigits: 1 });
}

function fmtPct(v: number | null, digits = 2) {
  if (v == null || Number.isNaN(v)) return "—";
  return `${(v * 100).toLocaleString("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} %`;
}

export function DisponibilidadConciliacionSlide({ month, monthLabel }: Props) {
  const gte = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey];
  const a = buildDisponibilidadAnalisis(month);
  const units = (gte?.generationByEquipment ?? []).map((u) => {
    const terms = gteAvailabilityTerms({
      op: u.horasOperacion,
      sb: u.horasStandBy,
      pp: u.horasPP,
      pfContr: u.horasPFContr,
      pf: u.horasPFCli,
      cal: u.horasCalDia,
    });
    return { ...u, ...terms };
  });
  const f = a.gteFormula;

  if (!gte || !f.planned) {
    return (
      <section className="panel">
        <article className="card">
          <p className="eyebrow">Conciliación de disponibilidad</p>
          <p className="empty-state">Sin Data Soporte de Gran Tierra para {monthLabel}.</p>
        </article>
      </section>
    );
  }

  return (
    <section className="panel inf-report-section" id="inf-sec-disponibilidad">
      <article className="card disp-analisis disp-conciliacion-slide">
        <div className="inf-conf-collapse-sum">
          <div className="inf-conf-collapse-sum-main">
            <p className="eyebrow">Slide conciliación Disp. · {monthLabel}</p>
            <h3>Disponibilidad Gran Tierra</h3>
          </div>
          <div
            className="disp-formula"
            aria-label="Disponibilidad igual a tiempo total planificado menos paradas programadas más no programadas, dividido entre tiempo total planificado, por 100"
          >
            <span className="disp-formula-op">=</span>
            <span className="disp-formula-frac disp-formula-frac--gte">
              <span>
                Tiempo total planificado − (tiempo paradas programadas + tiempo paradas no
                programadas)
              </span>
              <span>Tiempo total planificado</span>
            </span>
            <span className="disp-formula-op">×</span>
            <span className="disp-formula-100">100</span>
          </div>
        </div>

        <div className="inf-conf-collapse-body">
          <p className="disp-formula-sub">
            Sustitución Data Soporte · {gte.sourceFile.split("/").pop()}
          </p>
          <p className="disp-formula disp-formula-plug" aria-label="Valores sustituidos">
            <span className="disp-formula-op">=</span>
            <span className="disp-formula-frac disp-formula-frac--gte">
              <span>
                {fmtN(f.planned)} − ({fmtN(f.scheduled)} + {fmtN(f.unscheduled)})
              </span>
              <span>{fmtN(f.planned)}</span>
            </span>
            <span className="disp-formula-op">×</span>
            <span className="disp-formula-100">100</span>
            <span className="disp-formula-op">=</span>
            <span className="disp-formula-100">{fmtPct(f.disp)}</span>
          </p>

          <div className="disp-kpi-row disp-kpi-row-4">
            <article className="disp-kpi">
              <span>Tiempo total planificado</span>
              <strong>{fmtN(f.planned)}</strong>
              <small>Calendario Data Soporte · horas</small>
            </article>
            <article className="disp-kpi">
              <span>Paradas programadas</span>
              <strong>{fmtN(f.scheduled)}</strong>
              <small>Preventivo (PP)</small>
            </article>
            <article className="disp-kpi">
              <span>Paradas no programadas</span>
              <strong>{fmtN(f.unscheduled)}</strong>
              <small>
                PF contratista {fmtN(a.fleetGte.pfContr)} + PF cliente {fmtN(a.fleetGte.pf)}
              </small>
            </article>
            <article className="disp-kpi disp-kpi-gte">
              <span>Disponibilidad GTE</span>
              <strong>{fmtPct(f.disp)}</strong>
              <small>
                Disponibles {fmtN(f.available)} h · {fmtN(f.planned)} − (
                {fmtN(f.scheduled)} + {fmtN(f.unscheduled)})
              </small>
            </article>
          </div>

          {a.dispOficial != null ? (
            <p className="disp-implied">
              Con la ecuación y el Data Soporte el mes cierra en <b>{fmtPct(f.disp)}</b>. El
              informe publicado reporta <b>{fmtPct(a.dispOficial)}</b>
              {a.dispCpw != null ? (
                <>
                  {" "}
                  · concertación COPOWER {fmtPct(a.dispCpw)}
                </>
              ) : null}
              .
            </p>
          ) : null}

          <div className="disp-units">
            <p className="eyebrow">Aplicación por unidad · Data Soporte Gran Tierra</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Unidad</th>
                    <th>Campo</th>
                    <th className="ev-col-num">Planificado</th>
                    <th className="ev-col-num">PP</th>
                    <th className="ev-col-num">No prog.</th>
                    <th className="ev-col-num">Disponibles</th>
                    <th className="ev-col-num">Disp.</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={`${u.equipo}-${u.campo}`}>
                      <td>
                        <strong>{u.equipo}</strong>
                      </td>
                      <td>{u.campo}</td>
                      <td className="ev-col-num">{fmtN(u.planned)}</td>
                      <td className="ev-col-num">{fmtN(u.scheduled)}</td>
                      <td className="ev-col-num">{fmtN(u.unscheduled)}</td>
                      <td className="ev-col-num">{fmtN(u.available)}</td>
                      <td className="ev-col-num">{fmtPct(u.disp)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={2}>Flota</th>
                    <th className="ev-col-num">{fmtN(f.planned)}</th>
                    <th className="ev-col-num">{fmtN(f.scheduled)}</th>
                    <th className="ev-col-num">{fmtN(f.unscheduled)}</th>
                    <th className="ev-col-num">{fmtN(f.available)}</th>
                    <th className="ev-col-num">{fmtPct(f.disp)}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="rep-slide-note">
              Paradas programadas = horas PP. Paradas no programadas = PF contratista + PF cliente.
              Tiempo total planificado = horas calendario del Data Soporte.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
