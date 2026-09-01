import { useMemo } from "react";
import { COPOWER_PDF, PdfSlide } from "./CopowerPdfChrome";
import { AGOSTO_WEEKLY_PLANNING, informeMonthCoverage } from "./agostoWeeklyPlanning";
import { buildDisponibilidadAnalisis } from "./DisponibilidadAnalisisBoard";
import { buildConfiabilidadAnalisis } from "./ConfiabilidadAnalisisBoard";
import { buildEnergyEfficiency } from "./energyEfficiency";
import { GRAN_TIERRA_MONTHLY_DATA, generationBreakdown, type GranTierraMonthKey } from "./granTierraMonthly";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import { INVENTORY_MINIMUMS } from "./inventoryMinimumsData";
import { getInventoryItemsWithOverrides, getPlanningCriticalSpares } from "./inventoryPlanningCritical";
import { MAINTENANCE_PLANS } from "./maintenancePlansData";
import { equipoLabel } from "../rca/data";
import { CONTRACTUAL_KPI_TARGETS } from "../contracts/gteOrders";

type Props = {
  month: string;
  monthLabel: string;
};

const META = CONTRACTUAL_KPI_TARGETS.reliability;

function pct(v: number | null | undefined, d = 2) {
  return v == null || Number.isNaN(v) ? "—" : `${(v * 100).toFixed(d)} %`;
}
function n(v: number | null | undefined, d = 0) {
  return v == null || Number.isNaN(v)
    ? "—"
    : v.toLocaleString("es-CO", { maximumFractionDigits: d, minimumFractionDigits: d });
}
function isoWeekLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = (date.getDay() + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - day);
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const week = Math.floor(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7) + 1;
  return `S${week}`;
}

function PendingBanner({ monthLabel, extra }: { monthLabel: string; extra?: string }) {
  return (
    <p className="icpdf-alert">
      {monthLabel} no tiene Data Soporte GTE, FO-GE-033 ni gas Moqueta del mes. No se copian las
      cifras de julio.{extra ? ` ${extra}` : ""}
    </p>
  );
}

function causeKind(obs: string) {
  const t = obs.toLowerCase();
  if (/mru/.test(t)) return "MRU";
  if (/moqueta|\bmqt\b|presi[oó]n de gas/.test(t)) return "Gas Moqueta";
  if (/\bccm\b|solicitud del ccm/.test(t)) return "CCM";
  if (/stand\s*-?by/.test(t)) return "Stand-by";
  return "Externa";
}

function shortObs(obs: string) {
  let cleaned = obs
    .replace(/\s+/g, " ")
    .replace(/\d{1,2}:\d{2}\s*(hrs?\.?)?/gi, "")
    .replace(/EQUIPO:\s*[^,]+,\s*/i, "")
    .replace(/Equipo disponible desde el d[ií]a anterior\.?/gi, "")
    .trim();
  const hit = cleaned.match(/(FDL[^.]+|A solicitud[^.]+|Ingresa[^.]+|Sale[^.]+|baja presi[oó]n[^.]+)/i);
  if (hit) cleaned = hit[1].trim();
  return cleaned.length > 64 ? `${cleaned.slice(0, 62)}…` : cleaned;
}

function EmptyKpis({ labels }: { labels: string[] }) {
  return (
    <div className="icpdf-kpis">
      {labels.map((label) => (
        <article key={label}>
          <span>{label}</span>
          <strong>—</strong>
          <small>Fuente pendiente</small>
        </article>
      ))}
    </div>
  );
}

export function InformeConfiabilidadPdfDeck({ month, monthLabel }: Props) {
  const model = useMemo(() => {
    const gte = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey];
    const cpw = COPOWER_MONTHLY_DATA[month as CopowerMonthKey];
    const disp = buildDisponibilidadAnalisis(month);
    const conf = buildConfiabilidadAnalisis(month);
    const cov = informeMonthCoverage(month);
    const mto = MAINTENANCE_PLANS.monthlySummary.find((m) => m.monthKey === month) ?? null;
    const executions = MAINTENANCE_PLANS.executions.filter((e) => e.monthKey === month);
    const slots = MAINTENANCE_PLANS.calendarSlots.filter((s) => s.monthKey === month && !s.isRun);
    const programmed = executions.filter((e) => e.programmed);
    const executed = programmed.filter((e) => e.status === "ejecutado");
    const pending = programmed.filter((e) => e.status === "pendiente");
    const inv = getInventoryItemsWithOverrides();
    const invSin = inv.filter((i) => i.onHand <= 0).length;
    const invBajo = inv.filter((i) => i.onHand > 0 && i.onHand < i.stockMin).length;
    const invMin = inv.filter((i) => i.onHand === i.stockMin).length;
    const invOk = inv.filter((i) => i.onHand > i.stockMin).length;
    const critics = getPlanningCriticalSpares().slice(0, 6);
    const ops = gte ?? cpw ?? null;
    const gen = ops ? generationBreakdown(ops) : null;
    const eff = buildEnergyEfficiency(month);
    const machines = (gte?.machineIndicators ?? cpw?.machineIndicators ?? [])
      .filter((m) => !/SISTEMA/i.test(m.unidad))
      .slice(0, 10);
    const eventLog = gte?.eventLog ?? cpw?.eventLog ?? [];
    const repeats = [...eventLog.reduce((map, e) => {
      map.set(e.equipment, (map.get(e.equipment) ?? 0) + 1);
      return map;
    }, new Map<string, number>())]
      .map(([equipment, count]) => ({ equipment, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topOutages = eventLog
      .filter((e) => e.downtimeHours > 0)
      .slice()
      .sort((a, b) => b.downtimeHours - a.downtimeHours || b.date.localeCompare(a.date))
      .slice(0, 7)
      .map((e) => ({
        date: e.date.slice(5),
        equipment: e.equipment,
        hours: e.downtimeHours,
        kind: causeKind(e.cause),
        note: shortObs(e.cause) || e.eventType,
      }));

    const equipMap = new Map<string, number>();
    for (const e of programmed) {
      for (const part of e.equipment.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)) {
        const label = part.replace(/\s+/g, " ").replace(/JINAN\s+/i, "JIN-");
        equipMap.set(label, (equipMap.get(label) ?? 0) + 1);
      }
    }
    const equipChart = [...equipMap.entries()]
      .map(([equipment, count]) => ({ equipment, count }))
      .sort((a, b) => b.count - a.count || a.equipment.localeCompare(b.equipment))
      .slice(0, 6);

    const weekMap = new Map<string, { planned: number; executed: number }>();
    for (const s of slots) {
      const w = isoWeekLabel(s.date);
      const row = weekMap.get(w) ?? { planned: 0, executed: 0 };
      row.planned += s.hoursMto ?? 0;
      weekMap.set(w, row);
    }
    for (const e of executed) {
      const w = isoWeekLabel(e.date);
      const row = weekMap.get(w) ?? { planned: 0, executed: 0 };
      row.executed += slots.filter((s) => s.date === e.date).reduce((sum, x) => sum + (x.hoursMto ?? 0), 0);
      weekMap.set(w, row);
    }
    const weekChart = [...weekMap.entries()]
      .map(([week, v]) => ({ week, planned: Number(v.planned.toFixed(1)), executed: Number(v.executed.toFixed(1)) }))
      .filter((v) => v.planned > 0 || v.executed > 0)
      .sort((a, b) => a.week.localeCompare(b.week));

    const recent = programmed
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);

    return {
      gte,
      cpw,
      disp,
      conf,
      cov,
      mto,
      programmed,
      executed,
      pending,
      inv,
      invSin,
      invBajo,
      invMin,
      invOk,
      critics,
      gen,
      eff,
      machines,
      eventLog,
      repeats,
      topOutages,
      equipChart,
      weekChart,
      recent,
      period: monthLabel.toUpperCase(),
      corte: month === "Ago" ? "corte 01–22" : null,
    };
  }, [month, monthLabel]);

  const kicker = (nSlide: number, name: string) =>
    `${nSlide} · ${name.toUpperCase()} · ${model.period}`;

  return (
    <div className="icpdf-deck">
      <PdfSlide page={1} cover>
        <div className="icpdf-cover">
          <div className="icpdf-cover-hero">
            <p className="icpdf-cover-kicker">INFORME MENSUAL</p>
            <h1>INFORME DE CONFIABILIDAD</h1>
            <p className="icpdf-cover-month">{model.period} 2026</p>
            <hr />
            <h2>PARQUE DE GENERACIÓN COSTAYACO – VONU</h2>
            <p className="icpdf-cover-author">
              {COPOWER_PDF.author}
              <br />
              {COPOWER_PDF.authorEmail}
            </p>
          </div>
          <p className="icpdf-cover-blurb">
            Presentación mensual de resultados operacionales, desempeño de activos, eventos
            relevantes, riesgos y planes de acción para asegurar la continuidad y confiabilidad del
            sistema de generación.
          </p>
        </div>
      </PdfSlide>

      <PdfSlide page={2} title="Resumen ejecutivo" kicker={kicker(1, "Indicadores sistémicos")}>
        {model.gte || model.cpw ? (
          <>
            <p className="icpdf-sub">
              Cumplimiento contractual{model.corte ? ` · ${model.corte}` : ""}
            </p>
            <div className="icpdf-kpis icpdf-kpis-4">
              <article>
                <span>Generación total</span>
                <strong>{n((model.gte ?? model.cpw)?.kpi.generationMwh, 1)} MWh</strong>
                <small>{model.gte ? "Meta operativa del parque" : "Horas concertadas 01–22"}</small>
              </article>
              {model.gte ? (
                <article className={model.gte.kpi.availability != null && model.gte.kpi.availability < META ? "is-warn" : "is-ok"}>
                  <span>Disponibilidad GTE</span>
                  <strong>{pct(model.gte.kpi.availability)}</strong>
                  <small>Meta ≥ {(META * 100).toFixed(0)} %</small>
                </article>
              ) : null}
              <article className={model.disp.dispCpw != null && model.disp.dispCpw < META ? "is-warn" : "is-ok"}>
                <span>Disponibilidad COPOWER</span>
                <strong>{pct(model.disp.dispCpw)}</strong>
                <small>Meta ≥ {(META * 100).toFixed(0)} %</small>
              </article>
              <article className="is-ok">
                <span>Confiabilidad</span>
                <strong>{pct(model.gte?.kpi.reliability ?? model.cpw?.kpi.reliability ?? model.conf.contractualConf)}</strong>
                <small>{model.gte ? `Meta ≥ ${(META * 100).toFixed(0)} %` : "0 fallas imputables 01–22"}</small>
              </article>
              {model.gte && model.eff?.efficiencyHhvPct != null ? (
                <article>
                  <span>Eficiencia medida</span>
                  <strong>{`${model.eff.efficiencyHhvPct.toFixed(1)} %`}</strong>
                  <small>Heat rate / HHV</small>
                </article>
              ) : (
                <article className="tone-orange">
                  <span>Paradas externas</span>
                  <strong>{n(model.disp.fleetCpw.pf, 0)} h</strong>
                  <small>MRU / gas / CCM</small>
                </article>
              )}
            </div>
            <p className="icpdf-sub" style={{ marginTop: "0.45rem" }}>
              2 · Horas y eventos
            </p>
            <div className="icpdf-kpis icpdf-kpis-4">
              <article>
                <span>Horas operación</span>
                <strong>{n(model.disp.fleetCpw.op, 0)} h</strong>
              </article>
              <article>
                <span>Stand-by</span>
                <strong>{n(model.disp.fleetCpw.sb, 0)} h</strong>
              </article>
              <article>
                <span>Fallas COPOWER</span>
                <strong>{n((model.gte ?? model.cpw)?.summary.copowerFailures)}</strong>
              </article>
              <article>
                <span>Registros bitácora</span>
                <strong>{n(model.eventLog.length)}</strong>
              </article>
            </div>
            {!model.gte ? (
              <PendingBanner
                monthLabel={monthLabel}
                extra="El corte concertado llega al 22. Data Soporte GTE y eficiencia quedan pendientes."
              />
            ) : null}
          </>
        ) : (
          <>
            <EmptyKpis labels={["Generación total", "Disp. COPOWER", "Confiabilidad", "Paradas externas"]} />
            <PendingBanner monthLabel={monthLabel} extra="Sin horas concertadas ni Data Soporte." />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={3} title="Análisis de disponibilidad" kicker={kicker(3, "Análisis de disponibilidad")}>
        <div className="icpdf-row-head">
          <h3>COPOWER · horas concertadas{model.corte ? ` · ${model.corte}` : ""}</h3>
          <code>Disp = (OP + SB) / calendario × 100</code>
        </div>
        {model.disp.dispCpw != null ? (
          <>
            <div className="icpdf-kpis icpdf-kpis-4">
              <article className="tone-blue">
                <span>Disponibilidad</span>
                <strong>{pct(model.disp.dispCpw)}</strong>
                <small>
                  {n(model.disp.cpwAvailable, 0)} / {n(model.disp.programmed, 0)} h
                </small>
              </article>
              <article>
                <span>Operación</span>
                <strong>{n(model.disp.fleetCpw.op, 0)} h</strong>
              </article>
              <article>
                <span>Stand-by</span>
                <strong>{n(model.disp.fleetCpw.sb, 0)} h</strong>
              </article>
              <article className="tone-orange">
                <span>Paradas externas</span>
                <strong>{n(model.disp.fleetCpw.pf, 0)} h</strong>
                <small>PP {n(model.disp.fleetCpw.pp, 0)} h</small>
              </article>
            </div>
            {model.gte ? (
              <div className="icpdf-kpis icpdf-kpis-3" style={{ marginTop: "0.45rem" }}>
                <article className="tone-violet">
                  <span>Gran Tierra · Data Soporte</span>
                  <strong>{pct(model.disp.dispGteExcel)}</strong>
                </article>
                <article className="tone-orange">
                  <span>Gran Tierra · informe</span>
                  <strong>{pct(model.disp.dispOficial)}</strong>
                </article>
              </div>
            ) : (
              <p className="icpdf-lead" style={{ marginTop: "0.45rem" }}>
                Conciliación vs Gran Tierra queda para cuando llegue el Data Soporte. No se copia julio.
              </p>
            )}
          </>
        ) : (
          <>
            <EmptyKpis labels={["Disponibilidad", "Operación", "Stand-by", "Paradas externas"]} />
            <PendingBanner monthLabel={monthLabel} />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={4} title="Indicadores de desempeño por máquina" kicker={kicker(4, "Desempeño por máquina")}>
        {model.machines.length ? (
          <div className="icpdf-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Disponibilidad</th>
                  <th>Confiabilidad</th>
                  <th>Cumplimiento</th>
                </tr>
              </thead>
              <tbody>
                {model.machines.map((m) => (
                  <tr key={m.unidad}>
                    <td>
                      <strong>{m.unidad}</strong>
                    </td>
                    <td>{m.disponibilidadPct != null ? `${m.disponibilidadPct.toFixed(2)} %` : "—"}</td>
                    <td>{m.confiabilidadPct != null ? `${m.confiabilidadPct.toFixed(2)} %` : "—"}</td>
                    <td>{m.cumplimiento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <p className="icpdf-empty">Sin anexo GTE de indicadores por máquina para {monthLabel}.</p>
            <PendingBanner monthLabel={monthLabel} />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={5} title="Detalle de la generación." kicker={kicker(5, "Generación")}>
        {model.gen ? (
          <>
            <div className="icpdf-kpis icpdf-kpis-3">
              <article>
                <span>Total</span>
                <strong>{n(model.gen.totalKwh / 1000, 1)} MWh</strong>
              </article>
              <article>
                <span>Gas</span>
                <strong>{n(model.gen.gasKwh / 1000, 1)} MWh</strong>
              </article>
              <article>
                <span>Diésel</span>
                <strong>{n(model.gen.dieselKwh / 1000, 1)} MWh</strong>
              </article>
            </div>
            <div className="icpdf-table-wrap" style={{ marginTop: "0.45rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Gas kWh</th>
                    <th>Diésel kWh</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {model.gen.byField.map((f) => (
                    <tr key={f.field}>
                      <td>{f.field}</td>
                      <td>{n(f.gasKwh)}</td>
                      <td>{n(f.dieselKwh)}</td>
                      <td>{n(f.totalKwh)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <EmptyKpis labels={["Total parque", "Gas", "Diésel"]} />
            <PendingBanner monthLabel={monthLabel} extra="La generación oficial sale del Data Soporte GTE." />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={6} title="Análisis de confiabilidad" kicker={kicker(6, "Confiabilidad")}>
        {model.gte || model.cpw ? (
          <div className="icpdf-kpis icpdf-kpis-3">
            <article className="is-ok">
              <span>Confiabilidad contractual</span>
              <strong>
                {pct(model.conf.contractualConf ?? model.gte?.kpi.reliability ?? model.cpw?.kpi.reliability)}
              </strong>
              <small>
                {n(model.conf.imputables.length)} FO imputables
                {model.corte ? ` · ${model.corte}` : ""}
              </small>
            </article>
            <article>
              <span>FO-GE-033 del periodo</span>
              <strong>{n(model.conf.rows.length)}</strong>
            </article>
            <article>
              <span>Parada por falla contratista</span>
              <strong>{n(model.conf.pfContr, 1)} h</strong>
            </article>
          </div>
        ) : (
          <>
            <EmptyKpis labels={["Confiabilidad", "FO-GE-033", "PF contratista"]} />
            <PendingBanner monthLabel={monthLabel} extra="Sin FO ni bitácora no se publica 100 % de confiabilidad." />
          </>
        )}
        {!model.gte && model.cpw ? (
          <PendingBanner monthLabel={monthLabel} extra="Sin FO-GE-033 oficiales; 0 fallas en el consolidado 01–22." />
        ) : null}
      </PdfSlide>

      <PdfSlide page={7} title="Fallas e indisponibilidades" kicker={kicker(7, "Fallas")}>
        {model.conf.rows.length ? (
          <ol className="icpdf-fo">
            {model.conf.rows.slice(0, 5).map((r) => (
              <li key={r.foLabel}>
                <strong>{equipoLabel(r.fo.equipo)}</strong>
                {r.fo.descripcion_tecnica ? ` · ${r.fo.descripcion_tecnica.slice(0, 90)}` : ""}
              </li>
            ))}
          </ol>
        ) : model.topOutages.length ? (
          <>
            <div className="icpdf-kpis icpdf-kpis-4">
              <article className="is-ok">
                <span>Fallas COPOWER</span>
                <strong>{n((model.gte ?? model.cpw)?.summary.copowerFailures)}</strong>
                <small>imputables</small>
              </article>
              <article>
                <span>FO-GE-033</span>
                <strong>0</strong>
                <small>sin digitalizar</small>
              </article>
              <article className="tone-orange">
                <span>Paradas externas</span>
                <strong>{n(model.disp.fleetCpw.pf, 0)} h</strong>
                <small>MRU / Moqueta / CCM</small>
              </article>
              <article>
                <span>Eventos</span>
                <strong>{n(model.eventLog.length)}</strong>
                <small>{model.corte ?? "bitácora"}</small>
              </article>
            </div>
            <h4 className="icpdf-table-title">
              Mayores indisponibilidades <span>top {model.topOutages.length} por horas</span>
            </h4>
            <div className="icpdf-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Equipo</th>
                    <th>Horas</th>
                    <th>Origen</th>
                    <th>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {model.topOutages.map((e, i) => (
                    <tr key={`${e.date}-${e.equipment}-${e.hours}-${i}`}>
                      <td>{e.date}</td>
                      <td>
                        <strong>{e.equipment}</strong>
                      </td>
                      <td>{e.hours}</td>
                      <td>
                        <b className={`icpdf-pill ${e.kind === "MRU" ? "is-high" : "is-ext"}`}>{e.kind}</b>
                      </td>
                      <td>{e.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <PendingBanner monthLabel={monthLabel} extra="No se digitalizaron FO-GE-033 del mes." />
        )}
      </PdfSlide>

      <PdfSlide page={8} title="Eventos repetitivos y malos actores" kicker={kicker(8, "Repetitivos")}>
        {model.repeats.length ? (
          <>
            <p className="icpdf-lead">
              Recurrencia sobre {n(model.eventLog.length)} registros de bitácora
              {model.corte ? ` · ${model.corte}` : ""}.
            </p>
            <div className="icpdf-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Equipo</th>
                    <th>Eventos</th>
                  </tr>
                </thead>
                <tbody>
                  {model.repeats.map((r) => (
                    <tr key={r.equipment}>
                      <td>
                        <strong>{r.equipment}</strong>
                      </td>
                      <td>{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <PendingBanner monthLabel={monthLabel} extra="Sin bitácora no hay recurrencia que consolidar." />
        )}
      </PdfSlide>

      <PdfSlide page={9} title="Plan de mantenimiento" kicker={kicker(9, "Plan de mantenimiento")}>
        <div className="icpdf-mto">
          <div className="icpdf-kpis icpdf-kpis-4">
            <article>
              <span>Programados</span>
              <strong>{model.programmed.length}</strong>
            </article>
            <article className="tone-blue">
              <span>Ejecutados</span>
              <strong>{model.executed.length}</strong>
              <small>
                {model.programmed.length
                  ? `${((model.executed.length / model.programmed.length) * 100).toFixed(0)} %`
                  : ""}
              </small>
            </article>
            <article className="tone-violet">
              <span>Pendientes</span>
              <strong>{model.pending.length}</strong>
            </article>
            <article className="is-ok">
              <span>Horas MTO</span>
              <strong>{n(model.mto?.executedHoursMto)}</strong>
              <small>de {n(model.mto?.plannedHoursMto)} h</small>
            </article>
          </div>
          <div className="icpdf-minicharts">
            <article>
              <h4>Intervenciones por equipo</h4>
              <ul className="icpdf-bars">
                {model.equipChart.map((row) => (
                  <li key={row.equipment}>
                    <span>{row.equipment}</span>
                    <b style={{ width: `${(row.count / Math.max(model.equipChart[0]?.count ?? 1, 1)) * 100}%` }} />
                    <em>{row.count}</em>
                  </li>
                ))}
              </ul>
            </article>
            <article>
              <h4>Horas MTO por semana</h4>
              <div className="icpdf-weeks">
                {model.weekChart.map((w) => {
                  const max = Math.max(...model.weekChart.flatMap((x) => [x.planned, x.executed]), 1);
                  return (
                    <div key={w.week}>
                      <div className="icpdf-weeks-col">
                        <i className="is-plan" style={{ height: `${(w.planned / max) * 100}%` }} title={`Plan ${w.planned}`} />
                        <i className="is-exec" style={{ height: `${(w.executed / max) * 100}%` }} title={`Ejec ${w.executed}`} />
                      </div>
                      <span>{w.week}</span>
                    </div>
                  );
                })}
              </div>
              <p className="icpdf-weeks-leg">
                <i className="is-plan" /> Plan · <i className="is-exec" /> Ejecutado
              </p>
            </article>
          </div>
          <div className="icpdf-split">
            <div className="icpdf-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pendiente</th>
                    <th>Equipo</th>
                  </tr>
                </thead>
                <tbody>
                  {(model.pending.length ? model.pending : model.recent).map((row) => (
                    <tr key={`${row.date}-${row.equipment}`}>
                      <td>{row.date.slice(5)}</td>
                      <td>{row.equipment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {month === "Ago" ? (
              <div className="icpdf-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>31 ago–6 sep</th>
                      <th>Cód.</th>
                      <th>h</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AGOSTO_WEEKLY_PLANNING.jobs.map((j) => (
                      <tr key={`${j.date}-${j.equipment}`}>
                        <td>
                          {j.weekday} · {j.equipment}
                        </td>
                        <td>{j.code}</td>
                        <td>{j.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      </PdfSlide>

      <PdfSlide page={10} title="Mínimos de inventario" kicker={kicker(10, "Mínimos de inventario")}>
        <h3>Cobertura · {model.inv.length} ítems · bodega Costayaco</h3>
        <div className="icpdf-kpis icpdf-kpis-5">
          <article>
            <span>Ítems catalogados</span>
            <strong>{n(model.inv.length)}</strong>
          </article>
          <article>
            <span>Sin existencia</span>
            <strong className="is-bad">{n(model.invSin)}</strong>
          </article>
          <article>
            <span>Bajo mínimo</span>
            <strong className="is-bad">{n(model.invBajo)}</strong>
          </article>
          <article>
            <span>En mínimo</span>
            <strong>{n(model.invMin)}</strong>
          </article>
          <article>
            <span>Sobre mínimo</span>
            <strong className="is-good">{n(model.invOk)}</strong>
          </article>
        </div>
        <h4 className="icpdf-table-title">
          Críticos del plan <span>{model.critics.length} · kardex agosto</span>
        </h4>
        <div className="icpdf-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Urgencia</th>
                <th>Repuesto</th>
                <th>P/N</th>
                <th>Exist. / mín.</th>
                <th>Equipo</th>
              </tr>
            </thead>
            <tbody>
              {model.critics.map((s) => (
                <tr key={s.id}>
                  <td>
                    <b className={`icpdf-pill ${s.urgency === "Crítica" ? "is-crit" : "is-high"}`}>{s.urgency}</b>
                  </td>
                  <td>
                    <strong>{s.description}</strong>
                    <small> {s.family}</small>
                  </td>
                  <td>{s.partNumber}</td>
                  <td className={s.onHand < s.stockMin ? "is-bad" : ""}>
                    {s.onHand}/{s.stockMin}
                  </td>
                  <td>{s.asset}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PdfSlide>

      <PdfSlide page={11} title="Tendencias de degradación y riesgos" kicker={kicker(11, "Degradación")}>
        <p className="icpdf-lead">
          Se evaluaron tendencias de condición y degradación que puedan afectar la continuidad,
          capacidad o confiabilidad del sistema de generación. Los riesgos fueron priorizados según
          probabilidad, impacto y urgencia de intervención.
        </p>
        {month === "Ago" ? (
          <PendingBanner
            monthLabel={monthLabel}
            extra="El índice APM se conserva como baseline de junio; sin horas ni fallas del mes no se recalcula el riesgo."
          />
        ) : null}
      </PdfSlide>

      <PdfSlide page={12} title="Eficiencia" kicker={kicker(12, "Eficiencia")}>
        {model.eff ? (
          <div className="icpdf-kpis icpdf-kpis-3">
            <article>
              <span>Heat rate</span>
              <strong>{n(model.eff.heatRateBtuKwh)} BTU/kWh</strong>
            </article>
            <article>
              <span>Eficiencia HHV</span>
              <strong>{model.eff.efficiencyHhvPct != null ? `${model.eff.efficiencyHhvPct.toFixed(1)} %` : "—"}</strong>
            </article>
            <article>
              <span>Gas Moqueta</span>
              <strong>{n(model.eff.month.gasMcf, 0)} MCF</strong>
            </article>
          </div>
        ) : (
          <>
            <p className="icpdf-lead">
              Se evaluó el desempeño energético relacionando el consumo específico de gas con la
              generación obtenida.
            </p>
            <PendingBanner
              monthLabel={monthLabel}
              extra="La hoja «Agosto 2026» del log de Moqueta trae fechas de abril, no lecturas del mes."
            />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={13} title="Conclusiones." kicker={kicker(13, "Conclusiones")}>
        <ul className="icpdf-bullets">
          {model.gte ? (
            <>
              <li>
                <strong>Brecha de disponibilidad.</strong> GTE reporta {pct(model.disp.dispOficial)} y
                COPOWER {pct(model.disp.dispCpw)} con la misma base (OP + SB) / calendario.
              </li>
              <li>
                <strong>Confiabilidad {pct(model.gte.kpi.reliability ?? model.conf.contractualConf)}.</strong>{" "}
                {n(model.conf.rows.length)} FO-GE-033 del periodo, {n(model.conf.imputables.length)}{" "}
                imputables al contratista.
              </li>
            </>
          ) : (
            <li>
              <strong>Corte 01–22 concertado.</strong> Generación {n(model.cpw?.kpi.generationMwh, 1)} MWh,
              disponibilidad COPOWER {pct(model.disp.dispCpw)} y confiabilidad{" "}
              {pct(model.cpw?.kpi.reliability ?? model.conf.contractualConf)} con{" "}
              {n(model.cpw?.summary.copowerFailures)} fallas imputables. GTE oficial, 23–31 y FO-GE-033
              siguen pendientes; no se copia julio.
            </li>
          )}
          <li>
            <strong>Plan de mantenimiento.</strong> {model.executed.length}/{model.programmed.length}{" "}
            intervenciones y {n(model.mto?.executedHoursMto)} de {n(model.mto?.plannedHoursMto)} h
            MTO ejecutadas
            {model.pending.length
              ? ` · ${model.pending.length} pendientes: ${model.pending.map((p) => p.equipment).join(", ")}`
              : ""}.
          </li>
          <li>
            <strong>Inventario de bodega.</strong> {n(model.inv.length)} ítems en el kardex Costayaco,{" "}
            {n(model.invSin)} sin existencia y {n(model.invBajo)} bajo mínimo ·{" "}
            {n(INVENTORY_MINIMUMS.movements?.length)} movimientos de entrada/salida.
          </li>
        </ul>
      </PdfSlide>

      <PdfSlide page={14} title="Acciones" kicker={kicker(14, "Acciones")}>
        <ul className="icpdf-bullets">
          {model.gte ? (
            <li>
              Solicitar a Gran Tierra el desglose horario del {pct(model.disp.dispOficial)} y
              conciliar por evento antes del próximo corte.
            </li>
          ) : (
            <li>
              Incorporar Data Soporte GTE, el tramo 23–31 de horas concertadas, FO-GE-033 y el
              totalizador Moqueta. No usar julio como proxy.
            </li>
          )}
          <li>
            Completar las intervenciones pendientes de la sábana
            {model.pending.length
              ? ` (${model.pending.map((p) => `${p.equipment} ${p.date.slice(5)}`).join("; ")})`
              : ""}.
          </li>
          <li>
            Reponer los {model.invSin + model.invBajo} ítems sin existencia o bajo mínimo del
            catálogo de {model.inv.length} antes del siguiente ciclo de preventivo.
          </li>
          {month === "Ago" ? (
            <li>
              Ejecutar la semana {AGOSTO_WEEKLY_PLANNING.periodLabel}:{" "}
              {AGOSTO_WEEKLY_PLANNING.jobs.map((j) => `${j.equipment} ${j.code}`).join(", ")}.
            </li>
          ) : (
            <li>Sostener el plan AGC4 en las unidades fuera de meta e intervenir los activos de menor salud.</li>
          )}
        </ul>
      </PdfSlide>
    </div>
  );
}
