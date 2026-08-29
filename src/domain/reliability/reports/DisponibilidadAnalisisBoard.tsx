import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import {
  GRAN_TIERRA_MONTHLY_DATA,
  type GranTierraMonthKey,
} from "./granTierraMonthly";
import { ExecInsight, INFORME_EXEC_INSIGHTS } from "./informeExecInsights";
import { MAINTENANCE_PLANS } from "./maintenancePlansData";

type Props = {
  month: string;
  monthLabel?: string;
};

function fmtN(v: number) {
  return v.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function fmtPct(v: number, digits = 2) {
  return `${(v * 100).toLocaleString("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} %`;
}

function normEq(s: string) {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function agc4HoursFromSabana(month: string) {
  const execs = MAINTENANCE_PLANS.executions.filter(
    (e) => e.monthKey === month && /AGC\s*4/i.test(e.notes ?? ""),
  );
  let hoursMto = 0;
  let manHours = 0;
  const parts: string[] = [];
  for (const e of execs) {
    const eqs = e.equipment
      .split(/[,/]/)
      .map((s) => s.trim())
      .filter((s) => s && s !== "—");
    for (const slot of MAINTENANCE_PLANS.calendarSlots) {
      if (slot.date !== e.date || slot.monthKey !== month) continue;
      if (!eqs.some((eq) => normEq(eq) === normEq(slot.equipment))) continue;
      hoursMto += slot.hoursMto ?? 0;
      manHours += slot.manHours ?? 0;
      const day = slot.date.slice(8, 10);
      parts.push(`${slot.equipment} ${day}-${slot.date.slice(5, 7)} ${slot.hoursMto ?? 0} h`);
    }
  }
  return { hoursMto, manHours, parts, count: execs.length };
}

function sumHours(rows: {
  horasOperacion?: number;
  horasStandBy?: number;
  horasPP?: number;
  horasPFContr?: number;
  horasPFCli?: number;
  horasCalDia?: number;
}[]) {
  return {
    op: rows.reduce((s, u) => s + (u.horasOperacion ?? 0), 0),
    sb: rows.reduce((s, u) => s + (u.horasStandBy ?? 0), 0),
    pp: rows.reduce((s, u) => s + (u.horasPP ?? 0), 0),
    pfContr: rows.reduce((s, u) => s + (u.horasPFContr ?? 0), 0),
    pf: rows.reduce((s, u) => s + (u.horasPFCli ?? 0), 0),
    cal: rows.reduce((s, u) => s + (u.horasCalDia ?? 0), 0),
  };
}

/**
 * Disponibilidad Gran Tierra:
 * (Tiempo total planificado − (paradas programadas + paradas no programadas)) / planificado × 100
 */
export function gteAvailabilityTerms(hours: {
  op: number;
  sb: number;
  pp: number;
  pfContr: number;
  pf: number;
  cal: number;
}) {
  const states = hours.op + hours.sb + hours.pp + hours.pfContr + hours.pf;
  const planned = hours.cal > 0 ? hours.cal : states;
  const scheduled = hours.pp;
  const unscheduled = hours.pfContr + hours.pf;
  const available = planned - (scheduled + unscheduled);
  const disp = planned > 0 ? available / planned : null;
  return { planned, scheduled, unscheduled, available, disp };
}

export function buildDisponibilidadAnalisis(month: string) {
  const cpw = COPOWER_MONTHLY_DATA[month as CopowerMonthKey];
  const gte = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey];
  const fleetCpw = sumHours(cpw?.generationByEquipment ?? []);
  const fleetGte = sumHours(gte?.generationByEquipment ?? []);
  const gteFormula = gteAvailabilityTerms(fleetGte);
  const dispCpw = fleetCpw.cal > 0 ? (fleetCpw.op + fleetCpw.sb) / fleetCpw.cal : null;
  const dispGteExcel = gteFormula.disp;
  const dispOficial = gte?.kpi.availability ?? null;
  const programmed = fleetCpw.cal;
  const cpwAvailable = fleetCpw.op + fleetCpw.sb;
  const gteExcelAvailable = fleetGte.op + fleetGte.sb;
  const gteImpliedAvailable = dispOficial != null && programmed > 0 ? programmed * dispOficial : null;
  const gteImpliedUnavailable =
    gteImpliedAvailable != null ? programmed - gteImpliedAvailable : null;
  const extraDiscounted =
    gteImpliedAvailable != null ? cpwAvailable - gteImpliedAvailable : null;
  const agc4 = agc4HoursFromSabana(month);
  const descarbCpw02 = MAINTENANCE_PLANS.calendarSlots
    .filter(
      (s) =>
        s.monthKey === month &&
        normEq(s.equipment) === "CPW02" &&
        /2026-07-1[01]/.test(s.date),
    )
    .reduce((s, r) => s + (r.hoursMto ?? 0), 0);

  return {
    fleetCpw,
    fleetGte,
    gteFormula,
    dispCpw,
    dispGteExcel,
    dispOficial,
    programmed,
    cpwAvailable,
    gteExcelAvailable,
    gteImpliedAvailable,
    gteImpliedUnavailable,
    extraDiscounted,
    agc4,
    descarbCpw02,
    sourceCpw: cpw?.sourceFile.split("/").pop() ?? "Horas concertadas",
    sourceGte: gte?.sourceFile.split("/").pop() ?? "Data Soporte",
  };
}

export function DisponibilidadAnalisisBoard({ month, monthLabel }: Props) {
  const a = buildDisponibilidadAnalisis(month);
  if (!a.programmed || a.dispCpw == null) {
    return (
      <section className="panel">
        <article className="card">
          <p className="eyebrow">Análisis de disponibilidad</p>
          <p className="empty-state">Sin horas concertadas para este periodo.</p>
        </article>
      </section>
    );
  }

  return (
    <section className="panel inf-report-section" id="inf-sec-disponibilidad">
      <ExecInsight text={INFORME_EXEC_INSIGHTS.disponibilidad} />
      <details className="card disp-analisis inf-conf-collapse" open>
        <summary className="inf-conf-collapse-sum">
          <div className="inf-conf-collapse-sum-main">
            <p className="eyebrow">3 · Análisis de disponibilidad{monthLabel ? ` · ${monthLabel}` : ""}</p>
            <h3>Conciliación COPOWER vs Gran Tierra</h3>
          </div>
          <div
            className="disp-formula"
            aria-label="Disponibilidad igual a tiempo total planificado menos paradas programadas y no programadas, sobre tiempo total planificado, por 100"
          >
            <span className="disp-formula-name">Disp</span>
            <span className="disp-formula-op">=</span>
            <span className="disp-formula-frac disp-formula-frac--gte">
              <span>
                Tiempo total planificado − (paradas programadas + paradas no programadas)
              </span>
              <span>Tiempo total planificado</span>
            </span>
            <span className="disp-formula-op">×</span>
            <span className="disp-formula-100">100</span>
          </div>
        </summary>
        <div className="inf-conf-collapse-body">
        <div className="disp-kpi-row disp-kpi-row-3">
          <article className="disp-kpi disp-kpi-cpw">
            <span>COPOWER · Horas concertadas</span>
            <strong>{fmtPct(a.dispCpw)}</strong>
            <p>
              <b>{fmtN(a.cpwAvailable)}</b> / {fmtN(a.programmed)}
            </p>
            <small>
              {fmtN(a.fleetCpw.op)} operación + {fmtN(a.fleetCpw.sb)} stand-by
            </small>
          </article>
          <article className="disp-kpi disp-kpi-gte">
            <span>Gran Tierra · Data Soporte</span>
            <strong>{a.dispGteExcel != null ? fmtPct(a.dispGteExcel) : "—"}</strong>
            <p>
              <b>{fmtN(a.gteFormula.available)}</b> / {fmtN(a.gteFormula.planned)}
            </p>
            <small>
              Planificado − (PP {fmtN(a.gteFormula.scheduled)} + no prog.{" "}
              {fmtN(a.gteFormula.unscheduled)})
            </small>
          </article>
          <article className="disp-kpi disp-kpi-off">
            <span>Gran Tierra · informe</span>
            <strong>{a.dispOficial != null ? fmtPct(a.dispOficial) : "—"}</strong>
            <p>Resultado publicado</p>
            <small>Sin desglose de horas en el anexo</small>
          </article>
        </div>

        {a.dispOficial != null && a.gteImpliedAvailable != null ? (
          <p className="disp-implied">
            Se reporta {fmtPct(a.dispOficial)}. Falta el desglose de horas que produce este
            resultado. Sobre el calendario concertado: {fmtN(a.programmed)} ×{" "}
            {fmtPct(a.dispOficial)} = {fmtN(a.gteImpliedAvailable)} h disponibles.
          </p>
        ) : null}

        <div className="disp-body">
          <div className="disp-units">
            <p className="eyebrow">Horas en las fuentes</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Concertación</th>
                    <th>Data Soporte</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Operación</td>
                    <td>{fmtN(a.fleetCpw.op)}</td>
                    <td>{fmtN(a.fleetGte.op)}</td>
                  </tr>
                  <tr>
                    <td>Stand-by</td>
                    <td>{fmtN(a.fleetCpw.sb)}</td>
                    <td>{fmtN(a.fleetGte.sb)}</td>
                  </tr>
                  <tr>
                    <td>Preventivo</td>
                    <td>{fmtN(a.fleetCpw.pp)}</td>
                    <td>{fmtN(a.fleetGte.pp)}</td>
                  </tr>
                  <tr>
                    <td>Paradas externas</td>
                    <td>{fmtN(a.fleetCpw.pf)}</td>
                    <td>{fmtN(a.fleetGte.pf)}</td>
                  </tr>
                  <tr>
                    <td>Calendario</td>
                    <td>{fmtN(a.fleetCpw.cal)}</td>
                    <td>{fmtN(a.fleetGte.cal)}</td>
                  </tr>
                  <tr>
                    <td>Disponibles</td>
                    <td>{fmtN(a.cpwAvailable)}</td>
                    <td>{fmtN(a.gteExcelAvailable)}</td>
                  </tr>
                  <tr>
                    <td>Disponibilidad</td>
                    <td>{fmtPct(a.dispCpw)}</td>
                    <td>{a.dispGteExcel != null ? fmtPct(a.dispGteExcel) : "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="disp-hours">
            <p className="eyebrow">Preventivo concertado ({fmtN(a.fleetCpw.pp)} h)</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Actividad</th>
                    <th>Horas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>AGC4 · CPW01 y CPW03</td>
                    <td>{fmtN(a.agc4.hoursMto)}</td>
                  </tr>
                  <tr>
                    <td>CPW02 10–11 jul (sábana: descarbonización; Data Soporte: AGC4)</td>
                    <td>{fmtN(a.descarbCpw02)}</td>
                  </tr>
                  <tr>
                    <td>Resto (otros preventivos del mes, no AGC4 ni descarbonización)</td>
                    <td>{fmtN(a.fleetCpw.pp - a.agc4.hoursMto - a.descarbCpw02)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th>Total</th>
                    <th>{fmtN(a.fleetCpw.pp)}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        </div>
      </details>
    </section>
  );
}
