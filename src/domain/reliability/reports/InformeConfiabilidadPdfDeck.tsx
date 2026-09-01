import { useMemo } from "react";
import { COPOWER_PDF, PdfSlide } from "./CopowerPdfChrome";
import { AGOSTO_WEEKLY_PLANNING, informeMonthCoverage } from "./agostoWeeklyPlanning";
import { buildDisponibilidadAnalisis } from "./DisponibilidadAnalisisBoard";
import { buildConfiabilidadAnalisis } from "./ConfiabilidadAnalisisBoard";
import { buildEnergyEfficiency } from "./energyEfficiency";
import { GRAN_TIERRA_MONTHLY_DATA, generationBreakdown, type GranTierraMonthKey } from "./granTierraMonthly";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import { INVENTORY_MINIMUMS } from "./inventoryMinimumsData";
import { getInventoryItemsWithOverrides } from "./inventoryPlanningCritical";
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
  if (/moqueta|\bmqt\b/.test(t)) return "Moqueta";
  if (/\btea\b|quema/.test(t)) return "TEA";
  if (/\bsin\b|inyecci[oó]n/.test(t)) return "SIN";
  if (/presi[oó]n de gas|\bcyc\b/.test(t)) return "Gas CYC";
  if (/\bccm\b|solicitud del ccm/.test(t)) return "CCM";
  if (/mantenim|prevent/.test(t)) return "MTO";
  if (/stand\s*-?by/.test(t)) return "Stand-by";
  return "Otro";
}

function fleetOf(id: string) {
  const u = id.toUpperCase();
  if (u.startsWith("CPW")) return "Jenbacher";
  if (u.startsWith("G10")) return "Cummins";
  if (u.includes("JIN")) return "Jinan";
  return "Otro";
}

function familyShort(family: string) {
  if (family === "SIN CLASIFICAR") return "S/CLASE";
  if (family === "MATERIALES ELÉCTRICOS") return "ELÉCTRICOS";
  if (family === "HERRAMIENTA") return "HERRAM.";
  return family;
}

function capItem(text: string, max = 42) {
  const t = text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
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
    const invStock = inv.reduce((sum, i) => sum + i.onHand, 0);
    const invReview = inv.filter((i) => i.review).length;
    const invAgotado = inv.filter((i) => i.status === "AGOTADO" || i.onHand <= 0).length;
    const invUnclass = inv.filter((i) => i.family === "SIN CLASIFICAR").length;
    const moves = INVENTORY_MINIMUMS.movements ?? [];
    const invMovesIn = moves.filter((m) => m.kind === "entrada").length;
    const invMovesOut = moves.filter((m) => m.kind === "salida").length;
    const famMap = new Map<string, number>();
    const stMap = new Map<string, number>();
    for (const i of inv) {
      famMap.set(i.family, (famMap.get(i.family) ?? 0) + 1);
      stMap.set(i.status, (stMap.get(i.status) ?? 0) + 1);
    }
    const invFamilies = [...famMap.entries()]
      .map(([family, count]) => ({ family: familyShort(family), count }))
      .sort((a, b) => b.count - a.count || a.family.localeCompare(b.family))
      .slice(0, 6);
    const invStatus = (["BUENO", "REVISIÓN", "BAJO", "AGOTADO"] as const).map((status) => ({
      status,
      count: stMap.get(status) ?? 0,
    }));
    const invTopIssued = inv
      .filter((i) => i.issued > 0)
      .sort((a, b) => b.issued - a.issued || b.onHand - a.onHand)
      .slice(0, 6);
    const ops = gte ?? cpw ?? null;
    const gen = ops ? generationBreakdown(ops) : null;
    const eff = buildEnergyEfficiency(month);
    const machines = (gte?.machineIndicators ?? cpw?.machineIndicators ?? []).filter(
      (m) => !/SISTEMA/i.test(m.unidad),
    );
    const machineMap = new Map(machines.map((m) => [m.unidad, m]));
    const unitRows = (ops?.generationByEquipment ?? []).map((g) => {
      const m = machineMap.get(g.equipo);
      const ready = g.horasOperacion + g.horasStandBy;
      return {
        id: g.equipo,
        field: g.campo,
        fleet: fleetOf(g.equipo),
        op: g.horasOperacion,
        sb: g.horasStandBy,
        pp: g.horasPP,
        pf: g.horasPFCli,
        cal: g.horasCalDia,
        energy: g.energiaKwh,
        uso: ready > 0 ? g.horasOperacion / ready : 0,
        kw: g.horasOperacion > 0 ? g.energiaKwh / g.horasOperacion : 0,
        disp: m?.disponibilidadPct ?? null,
        conf: m?.confiabilidadPct ?? null,
        cumple: m?.cumplimiento ?? "N/A",
      };
    });
    const packField = (field: string) => {
      const rows = unitRows.filter((u) => u.field === field);
      const cal = rows.reduce((s, u) => s + u.cal, 0);
      const op = rows.reduce((s, u) => s + u.op, 0);
      const sb = rows.reduce((s, u) => s + u.sb, 0);
      return {
        field,
        units: rows.length,
        op,
        sb,
        pp: rows.reduce((s, u) => s + u.pp, 0),
        pf: rows.reduce((s, u) => s + u.pf, 0),
        energy: rows.reduce((s, u) => s + u.energy, 0),
        cal,
        disp: cal > 0 ? (op + sb) / cal : null,
        uso: op + sb > 0 ? op / (op + sb) : null,
      };
    };
    const fieldCyc = packField("COSTAYACO");
    const fieldVonu = packField("VONU");
    const readyAll = unitRows.reduce((s, u) => s + u.op + u.sb, 0);
    const opAll = unitRows.reduce((s, u) => s + u.op, 0);
    const energyAll = unitRows.reduce((s, u) => s + u.energy, 0);
    const usoFlota = readyAll > 0 ? opAll / readyAll : null;
    const noCumple = unitRows.filter((u) => u.cumple === "NO CUMPLE");
    const fleetChart = (["Jenbacher", "Jinan", "Cummins"] as const).map((name) => {
      const rows = unitRows.filter((u) => u.fleet === name);
      return {
        name,
        units: rows.length,
        op: rows.reduce((s, u) => s + u.op, 0),
        energy: rows.reduce((s, u) => s + u.energy, 0),
        pf: rows.reduce((s, u) => s + u.pf, 0),
        sb: rows.reduce((s, u) => s + u.sb, 0),
      };
    });
    const cummins = fleetChart.find((f) => f.name === "Cummins");
    const cumminsUso =
      cummins && cummins.op + cummins.sb > 0 ? cummins.op / (cummins.op + cummins.sb) : null;
    const machineTable = [...unitRows]
      .sort((a, b) => {
        const rank = (u: (typeof unitRows)[number]) => (u.cumple === "NO CUMPLE" ? 1000 : 0) + u.pf;
        return rank(b) - rank(a) || b.energy - a.energy;
      })
      .slice(0, 7);
    const watchPf = [...unitRows].sort((a, b) => b.pf - a.pf || b.pp - a.pp).slice(0, 6);
    const topEnergy = [...unitRows].sort((a, b) => b.energy - a.energy).slice(0, 6);
    const topKw = [...unitRows].filter((u) => u.kw > 0).sort((a, b) => b.kw - a.kw).slice(0, 6);
    const kwFlota = opAll > 0 ? energyAll / opAll : null;
    const gasShare = gen && gen.totalKwh > 0 ? gen.gasKwh / gen.totalKwh : null;
    const dieselShare = gen && gen.totalKwh > 0 ? gen.dieselKwh / gen.totalKwh : null;
    const eventLog = gte?.eventLog ?? cpw?.eventLog ?? [];
    const hoursDown = eventLog.filter((e) => e.downtimeHours > 0);
    const causeMap = new Map<string, { count: number; hours: number }>();
    for (const e of eventLog) {
      const kind = causeKind(e.cause);
      const row = causeMap.get(kind) ?? { count: 0, hours: 0 };
      row.count += 1;
      row.hours += e.downtimeHours;
      causeMap.set(kind, row);
    }
    const causeChart = [...causeMap.entries()]
      .map(([kind, v]) => ({ kind, count: v.count, hours: v.hours }))
      .sort((a, b) => b.hours - a.hours || b.count - a.count)
      .slice(0, 6);
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
      invStock,
      invReview,
      invAgotado,
      invUnclass,
      invMovesIn,
      invMovesOut,
      invFamilies,
      invStatus,
      invTopIssued,
      gen,
      eff,
      machines,
      unitRows,
      fieldCyc,
      fieldVonu,
      usoFlota,
      noCumple,
      fleetChart,
      cumminsUso,
      machineTable,
      watchPf,
      topEnergy,
      topKw,
      kwFlota,
      gasShare,
      dieselShare,
      hoursDown,
      causeChart,
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

      <PdfSlide page={2} title="Resumen ejecutivo" kicker={kicker(2, "Indicadores sistémicos")}>
        {model.gte || model.cpw ? (
          <div className="icpdf-mto icpdf-exec">
            <div className="icpdf-kpis icpdf-kpis-4">
              <article>
                <span>Generación</span>
                <strong>{n((model.gte ?? model.cpw)?.kpi.generationMwh, 1)} MWh</strong>
                <small>
                  CYC {n(model.fieldCyc.energy / 1000, 0)} · Vonú {n(model.fieldVonu.energy / 1000, 0)}
                </small>
              </article>
              {model.gte ? (
                <article className={model.gte.kpi.availability != null && model.gte.kpi.availability < META ? "is-warn" : "is-ok"}>
                  <span>Disp. GTE</span>
                  <strong>{pct(model.gte.kpi.availability)}</strong>
                  <small>Meta ≥ {(META * 100).toFixed(0)} %</small>
                </article>
              ) : null}
              <article className={model.disp.dispCpw != null && model.disp.dispCpw < META ? "is-warn" : "is-ok"}>
                <span>Disp. COPOWER</span>
                <strong>{pct(model.disp.dispCpw)}</strong>
                <small>
                  {n(model.disp.cpwAvailable, 0)} / {n(model.disp.programmed, 0)} h
                </small>
              </article>
              <article className="is-ok">
                <span>Confiabilidad</span>
                <strong>{pct(model.gte?.kpi.reliability ?? model.cpw?.kpi.reliability ?? model.conf.contractualConf)}</strong>
                <small>
                  {n((model.gte ?? model.cpw)?.summary.copowerFailures)} fallas · {n(model.eventLog.length)} bitácora
                </small>
              </article>
              {!model.gte ? (
                <article className="tone-orange">
                  <span>Paradas externas</span>
                  <strong>{n(model.disp.fleetCpw.pf, 0)} h</strong>
                  <small>MRU / Moqueta / CCM</small>
                </article>
              ) : model.eff?.efficiencyHhvPct != null ? (
                <article>
                  <span>Eficiencia</span>
                  <strong>{`${model.eff.efficiencyHhvPct.toFixed(1)} %`}</strong>
                  <small>Heat rate / HHV</small>
                </article>
              ) : (
                <article className="tone-orange">
                  <span>Paradas externas</span>
                  <strong>{n(model.disp.fleetCpw.pf, 0)} h</strong>
                </article>
              )}
            </div>
            {model.unitRows.length ? (
              <div className="icpdf-kpis icpdf-kpis-4">
                <article className="tone-blue">
                  <span>Costayaco</span>
                  <strong>{pct(model.fieldCyc.disp)}</strong>
                  <small>
                    {n(model.fieldCyc.units)} und · uso {pct(model.fieldCyc.uso, 1)}
                  </small>
                </article>
                <article className={model.fieldVonu.disp != null && model.fieldVonu.disp < META ? "is-warn" : "is-ok"}>
                  <span>Vonú</span>
                  <strong>{pct(model.fieldVonu.disp)}</strong>
                  <small>
                    {n(model.fieldVonu.units)} und · PP {n(model.fieldVonu.pp)} h
                  </small>
                </article>
                <article className="tone-violet">
                  <span>Uso de flota</span>
                  <strong>{pct(model.usoFlota, 1)}</strong>
                  <small>
                    OP {n(model.disp.fleetCpw.op, 0)} · SB {n(model.disp.fleetCpw.sb, 0)}
                  </small>
                </article>
                <article className="tone-orange">
                  <span>Mix diésel</span>
                  <strong>{pct(model.dieselShare, 1)}</strong>
                  <small>{n((model.gen?.dieselKwh ?? 0) / 1000, 1)} MWh</small>
                </article>
              </div>
            ) : null}
            <div className="icpdf-kpis icpdf-kpis-4">
              <article>
                <span>Preventivo</span>
                <strong>{n(model.disp.fleetCpw.pp, 0)} h</strong>
                <small>PP descuenta disponibilidad</small>
              </article>
              <article className="tone-blue">
                <span>Plan MTO</span>
                <strong>
                  {n(model.executed.length)}/{n(model.programmed.length)}
                </strong>
                <small>
                  {model.programmed.length
                    ? `${((model.executed.length / model.programmed.length) * 100).toFixed(0)} % ejecutado`
                    : "sin sábana"}
                </small>
              </article>
              <article className={model.noCumple.length ? "is-warn" : "is-ok"}>
                <span>Fuera de meta</span>
                <strong>{n(model.noCumple.length)}</strong>
                <small>
                  {model.noCumple.length
                    ? model.noCumple.map((u) => u.id).join(", ")
                    : `todas ≥ ${(META * 100).toFixed(0)} %`}
                </small>
              </article>
              <article>
                <span>Potencia media</span>
                <strong>{n(model.kwFlota, 0)} kW</strong>
                <small>energía / horas OP</small>
              </article>
            </div>
          </div>
        ) : (
          <>
            <EmptyKpis labels={["Generación", "Disp. COPOWER", "Confiabilidad", "Paradas externas"]} />
            <PendingBanner monthLabel={monthLabel} extra="Sin horas concertadas ni Data Soporte." />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={3} title="Análisis de disponibilidad" kicker={kicker(3, "Análisis de disponibilidad")}>
        {model.disp.dispCpw != null && model.unitRows.length ? (
          <div className="icpdf-mto">
            <div className="icpdf-row-head">
              <h3>COPOWER · horas concertadas{model.corte ? ` · ${model.corte}` : ""}</h3>
              <code>Disp = (OP + SB) / calendario</code>
            </div>
            <div className="icpdf-kpis icpdf-kpis-4">
              <article className="tone-blue">
                <span>Parque</span>
                <strong>{pct(model.disp.dispCpw)}</strong>
                <small>
                  {n(model.disp.cpwAvailable, 0)} / {n(model.disp.programmed, 0)} h
                </small>
              </article>
              <article className="is-ok">
                <span>Costayaco</span>
                <strong>{pct(model.fieldCyc.disp)}</strong>
                <small>
                  {n(model.fieldCyc.units)} und · uso {pct(model.fieldCyc.uso, 1)}
                </small>
              </article>
              <article className={model.fieldVonu.disp != null && model.fieldVonu.disp < META ? "is-warn" : "is-ok"}>
                <span>Vonú</span>
                <strong>{pct(model.fieldVonu.disp)}</strong>
                <small>
                  {n(model.fieldVonu.units)} und · PP {n(model.fieldVonu.pp)} h
                </small>
              </article>
              <article className="tone-orange">
                <span>Uso de flota</span>
                <strong>{pct(model.usoFlota, 1)}</strong>
                <small>
                  OP {n(model.disp.fleetCpw.op, 0)} · SB {n(model.disp.fleetCpw.sb, 0)}
                </small>
              </article>
            </div>
            <div className="icpdf-minicharts">
              <article>
                <h4>Horas OP por flota</h4>
                <ul className="icpdf-bars">
                  {model.fleetChart.map((row) => (
                    <li key={row.name}>
                      <span>{row.name}</span>
                      <b
                        style={{
                          width: `${(row.op / Math.max(...model.fleetChart.map((x) => x.op), 1)) * 100}%`,
                        }}
                      />
                      <em>{n(row.op)}</em>
                    </li>
                  ))}
                </ul>
              </article>
              <article>
                <h4>Pérdida vs calendario</h4>
                <ul className="icpdf-bars">
                  <li>
                    <span>PP</span>
                    <b
                      className="is-rev"
                      style={{
                        width: `${(Math.max(model.disp.fleetCpw.pp, 1) / Math.max(model.disp.fleetCpw.pf, model.disp.fleetCpw.pp, 1)) * 100}%`,
                      }}
                    />
                    <em>{n(model.disp.fleetCpw.pp, 0)} h</em>
                  </li>
                  <li>
                    <span>PF cli</span>
                    <b
                      className="is-out"
                      style={{
                        width: `${(Math.max(model.disp.fleetCpw.pf, 1) / Math.max(model.disp.fleetCpw.pf, model.disp.fleetCpw.pp, 1)) * 100}%`,
                      }}
                    />
                    <em>{n(model.disp.fleetCpw.pf, 0)} h</em>
                  </li>
                </ul>
                <p className="icpdf-weeks-leg">
                  La disp. contractual solo descuenta PP. Las {n(model.disp.fleetCpw.pf, 0)} h PF cliente
                  son gas / CCM, no falla COPOWER.
                </p>
              </article>
            </div>
          </div>
        ) : (
          <>
            <EmptyKpis labels={["Disponibilidad", "Costayaco", "Vonú", "Uso de flota"]} />
            <PendingBanner monthLabel={monthLabel} />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={4} title="Desempeño por máquina" kicker={kicker(4, "Desempeño por máquina")}>
        {model.machineTable.length ? (
          <div className="icpdf-mto">
            <div className="icpdf-kpis icpdf-kpis-4">
              <article>
                <span>Unidades</span>
                <strong>{n(model.unitRows.length)}</strong>
                <small>
                  {n(model.fieldCyc.units)} CYC · {n(model.fieldVonu.units)} Vonú
                </small>
              </article>
              <article className="is-ok">
                <span>CUMPLE</span>
                <strong>{n(model.unitRows.length - model.noCumple.length)}</strong>
                <small>meta disp. ≥ {(META * 100).toFixed(0)} %</small>
              </article>
              <article className={model.noCumple.length ? "is-warn" : "is-ok"}>
                <span>NO CUMPLE</span>
                <strong>{n(model.noCumple.length)}</strong>
                <small>
                  {model.noCumple.length
                    ? model.noCumple.map((u) => `${u.id} ${u.disp != null ? u.disp.toFixed(2) : "—"} %`).join(" · ")
                    : "todas en meta"}
                </small>
              </article>
              <article className="tone-violet">
                <span>Conf. unidades</span>
                <strong>100 %</strong>
                <small>0 fallas imputables</small>
              </article>
            </div>
            <div className="icpdf-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Unidad</th>
                    <th>Flota</th>
                    <th>OP h</th>
                    <th>Uso</th>
                    <th>PF cli</th>
                    <th>Disp.</th>
                  </tr>
                </thead>
                <tbody>
                  {model.machineTable.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.id}</strong>
                      </td>
                      <td>{u.fleet}</td>
                      <td>{n(u.op)}</td>
                      <td>{pct(u.uso, 0)}</td>
                      <td className={u.pf >= 40 ? "is-bad" : ""}>{n(u.pf)}</td>
                      <td className={u.cumple === "NO CUMPLE" ? "is-bad" : ""}>
                        {u.disp != null ? `${u.disp.toFixed(2)} %` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            <p className="icpdf-empty">Sin horas por máquina para {monthLabel}.</p>
            <PendingBanner monthLabel={monthLabel} />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={5} title="Detalle de la generación" kicker={kicker(5, "Generación")}>
        {model.gen && model.topEnergy.length ? (
          <div className="icpdf-mto">
            <div className="icpdf-kpis icpdf-kpis-4">
              <article>
                <span>Total</span>
                <strong>{n(model.gen.totalKwh / 1000, 1)} MWh</strong>
                <small>{model.corte ?? "parque"}</small>
              </article>
              <article className="tone-blue">
                <span>Gas</span>
                <strong>{pct(model.gasShare, 1)}</strong>
                <small>{n(model.gen.gasKwh / 1000, 1)} MWh</small>
              </article>
              <article className="tone-orange">
                <span>Diésel</span>
                <strong>{n(model.gen.dieselKwh / 1000, 1)} MWh</strong>
                <small>{pct(model.dieselShare, 1)} · solo Cummins CYC</small>
              </article>
              <article className="tone-violet">
                <span>Costayaco</span>
                <strong>{n(model.fieldCyc.energy / 1000, 1)} MWh</strong>
                <small>Vonú {n(model.fieldVonu.energy / 1000, 1)}</small>
              </article>
            </div>
            <div className="icpdf-minicharts">
              <article>
                <h4>Energía por flota</h4>
                <ul className="icpdf-bars">
                  {model.fleetChart.map((row) => (
                    <li key={row.name}>
                      <span>{row.name}</span>
                      <b
                        style={{
                          width: `${(row.energy / Math.max(...model.fleetChart.map((x) => x.energy), 1)) * 100}%`,
                        }}
                      />
                      <em>{n(row.energy / 1000, 0)}</em>
                    </li>
                  ))}
                </ul>
              </article>
              <article>
                <h4>Mayor generación</h4>
                <ul className="icpdf-bars">
                  {model.topEnergy.map((row) => (
                    <li key={row.id}>
                      <span>{row.id}</span>
                      <b
                        style={{
                          width: `${(row.energy / Math.max(model.topEnergy[0]?.energy ?? 1, 1)) * 100}%`,
                        }}
                      />
                      <em>{n(row.energy / 1000, 0)}</em>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        ) : (
          <>
            <EmptyKpis labels={["Total parque", "Gas", "Diésel", "Costayaco"]} />
            <PendingBanner monthLabel={monthLabel} extra="La generación sale de horas concertadas o Data Soporte." />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={6} title="Análisis de confiabilidad" kicker={kicker(6, "Confiabilidad")}>
        {model.gte || model.cpw ? (
          <div className="icpdf-mto">
            <div className="icpdf-kpis icpdf-kpis-4">
              <article className="is-ok">
                <span>Contractual</span>
                <strong>
                  {pct(model.conf.contractualConf ?? model.gte?.kpi.reliability ?? model.cpw?.kpi.reliability)}
                </strong>
                <small>0 FO imputables</small>
              </article>
              <article>
                <span>FO-GE-033</span>
                <strong>{n(model.conf.rows.length)}</strong>
                <small>{model.gte ? "oficiales del mes" : "sin digitalizar"}</small>
              </article>
              <article className="is-ok">
                <span>PF contratista</span>
                <strong>{n((model.gte ?? model.cpw)?.summary.hoursFailureCopower ?? model.conf.pfContr, 1)} h</strong>
                <small>MTBF no aplica</small>
              </article>
              <article className="tone-blue">
                <span>Horas OP sin falla</span>
                <strong>{n(model.disp.fleetCpw.op, 0)} h</strong>
                <small>{model.corte ?? "operación"}</small>
              </article>
            </div>
            <div className="icpdf-minicharts">
              <article>
                <h4>Frontera de responsabilidad</h4>
                <ul className="icpdf-bars">
                  <li>
                    <span>PF COPOWER</span>
                    <b className="is-ok" style={{ width: "4%" }} />
                    <em>{n((model.gte ?? model.cpw)?.summary.hoursFailureCopower, 0)} h</em>
                  </li>
                  <li>
                    <span>PP</span>
                    <b
                      className="is-rev"
                      style={{
                        width: `${((model.disp.fleetCpw.pp ?? 0) / Math.max(model.disp.fleetCpw.pf, model.disp.fleetCpw.pp, 1)) * 100}%`,
                      }}
                    />
                    <em>{n(model.disp.fleetCpw.pp, 0)} h</em>
                  </li>
                  <li>
                    <span>PF cliente</span>
                    <b
                      className="is-out"
                      style={{
                        width: `${((model.disp.fleetCpw.pf ?? 0) / Math.max(model.disp.fleetCpw.pf, model.disp.fleetCpw.pp, 1)) * 100}%`,
                      }}
                    />
                    <em>{n(model.disp.fleetCpw.pf, 0)} h</em>
                  </li>
                </ul>
              </article>
              <article>
                <h4>Lectura de campo</h4>
                <p className="icpdf-lead" style={{ margin: 0 }}>
                  Costayaco cierra sin falla imputable: la confiabilidad contractual es 100 %. El riesgo
                  del corte es de suministro de gas (MRU / Moqueta / CCM), que se ve en las{" "}
                  {n(model.disp.fleetCpw.pf, 0)} h PF cliente
                  {model.dieselShare != null ? ` y en el ${pct(model.dieselShare, 1)} diésel de las Cummins` : ""}.
                  {model.noCumple[0]
                    ? ` ${model.noCumple[0].id} queda bajo meta por ${n(model.noCumple[0].pp)} h de preventivo, no por FO.`
                    : " Todas las unidades cierran en meta de disponibilidad."}
                </p>
              </article>
            </div>
          </div>
        ) : (
          <>
            <EmptyKpis labels={["Confiabilidad", "FO-GE-033", "PF contratista", "OP sin falla"]} />
            <PendingBanner monthLabel={monthLabel} extra="Sin FO ni bitácora no se publica 100 % de confiabilidad." />
          </>
        )}
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
        {model.eventLog.length ? (
          <div className="icpdf-mto">
            <div className="icpdf-kpis icpdf-kpis-4">
              <article>
                <span>Registros</span>
                <strong>{n(model.eventLog.length)}</strong>
                <small>bitácora operativa</small>
              </article>
              <article className="tone-orange">
                <span>Con horas PF</span>
                <strong>{n(model.hoursDown.length)}</strong>
                <small>{n(model.disp.fleetCpw.pf, 0)} h cliente</small>
              </article>
              <article className="is-ok">
                <span>Fallas COPOWER</span>
                <strong>{n((model.gte ?? model.cpw)?.summary.copowerFailures)}</strong>
                <small>ningún mal actor de máquina</small>
              </article>
              <article className="tone-violet">
                <span>Origen dominante</span>
                <strong>{model.causeChart[0]?.kind ?? "—"}</strong>
                <small>{n(model.causeChart[0]?.count)} registros</small>
              </article>
            </div>
            <div className="icpdf-minicharts">
              <article>
                <h4>Origen de la bitácora</h4>
                <ul className="icpdf-bars">
                  {model.causeChart.map((row) => (
                    <li key={row.kind}>
                      <span>{row.kind}</span>
                      <b
                        style={{
                          width: `${(row.count / Math.max(model.causeChart[0]?.count ?? 1, 1)) * 100}%`,
                        }}
                      />
                      <em>{row.count}</em>
                    </li>
                  ))}
                </ul>
              </article>
              <article>
                <h4>Exposición PF cliente</h4>
                <ul className="icpdf-bars">
                  {model.watchPf.map((row) => (
                    <li key={row.id}>
                      <span>{row.id}</span>
                      <b
                        className="is-out"
                        style={{
                          width: `${(row.pf / Math.max(model.watchPf[0]?.pf ?? 1, 1)) * 100}%`,
                        }}
                      />
                      <em>{n(row.pf)} h</em>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
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

      <PdfSlide page={10} title="Bodega Costayaco" kicker={kicker(10, "Bodega Costayaco")}>
        <div className="icpdf-mto icpdf-inv">
          <div className="icpdf-kpis icpdf-kpis-4">
            <article>
              <span>Ítems</span>
              <strong>{n(model.inv.length)}</strong>
              <small>kardex de cierre</small>
            </article>
            <article className="tone-blue">
              <span>Stock</span>
              <strong>{n(model.invStock)}</strong>
              <small>unidades en bodega</small>
            </article>
            <article className="tone-violet">
              <span>Movimientos</span>
              <strong>{n(model.invMovesIn + model.invMovesOut)}</strong>
              <small>
                {n(model.invMovesIn)} ent · {n(model.invMovesOut)} sal
              </small>
            </article>
            <article className="is-warn">
              <span>A revisar</span>
              <strong>{n(model.invReview)}</strong>
              <small>{n(model.invAgotado)} agotados</small>
            </article>
          </div>
          <div className="icpdf-minicharts">
            <article>
              <h4>Cobertura por familia</h4>
              <ul className="icpdf-bars">
                {model.invFamilies.map((row) => (
                  <li key={row.family}>
                    <span>{row.family}</span>
                    <b
                      style={{
                        width: `${(row.count / Math.max(model.invFamilies[0]?.count ?? 1, 1)) * 100}%`,
                      }}
                    />
                    <em>{row.count}</em>
                  </li>
                ))}
              </ul>
            </article>
            <article>
              <h4>Estado del kardex</h4>
              <ul className="icpdf-bars">
                {model.invStatus.map((row) => (
                  <li key={row.status}>
                    <span>{row.status}</span>
                    <b
                      className={
                        row.status === "BUENO"
                          ? "is-ok"
                          : row.status === "REVISIÓN"
                            ? "is-rev"
                            : row.status === "BAJO"
                              ? "is-low"
                              : "is-out"
                      }
                      style={{
                        width: `${(row.count / Math.max(...model.invStatus.map((x) => x.count), 1)) * 100}%`,
                      }}
                    />
                    <em>{row.count}</em>
                  </li>
                ))}
              </ul>
            </article>
          </div>
          <div className="icpdf-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mayor consumo</th>
                  <th>Familia</th>
                  <th>Salidas</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {model.invTopIssued.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{capItem(row.description)}</strong>
                    </td>
                    <td>{familyShort(row.family)}</td>
                    <td>{row.issued}</td>
                    <td>{row.onHand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PdfSlide>

      <PdfSlide page={11} title="Riesgo operativo Costayaco" kicker={kicker(11, "Degradación")}>
        {model.watchPf.length ? (
          <div className="icpdf-mto">
            <div className="icpdf-kpis icpdf-kpis-4">
              <article className="tone-orange">
                <span>Mayor exposición</span>
                <strong>{model.watchPf[0]?.id ?? "—"}</strong>
                <small>{n(model.watchPf[0]?.pf)} h PF cliente</small>
              </article>
              <article className="tone-violet">
                <span>Reserva Cummins</span>
                <strong>{pct(model.cumminsUso, 0)}</strong>
                <small>uso · resto en stand-by</small>
              </article>
              <article className={model.noCumple.length ? "is-warn" : "is-ok"}>
                <span>Bajo meta</span>
                <strong>{model.noCumple[0]?.id ?? "Ninguna"}</strong>
                <small>
                  {model.noCumple[0]
                    ? `${n(model.noCumple[0].pp)} h PP · ${model.noCumple[0].disp?.toFixed(2)} %`
                    : "todas ≥ 98 %"}
                </small>
              </article>
              <article>
                <span>MTO pendientes</span>
                <strong>{n(model.pending.length)}</strong>
                <small>sábana del mes</small>
              </article>
            </div>
            <div className="icpdf-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Activo</th>
                    <th>Señal</th>
                    <th>OP / SB</th>
                    <th>PF / PP</th>
                  </tr>
                </thead>
                <tbody>
                  {model.watchPf.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.id}</strong>
                        <small> {u.fleet}</small>
                      </td>
                      <td>
                        {u.cumple === "NO CUMPLE"
                          ? "Disp. bajo meta por preventivo"
                          : u.fleet === "Cummins"
                            ? "Reserva diésel · alto stand-by"
                            : "Exposición a gas / CCM"}
                      </td>
                      <td>
                        {n(u.op)} / {n(u.sb)}
                      </td>
                      <td>
                        {n(u.pf)} / {n(u.pp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <PendingBanner
            monthLabel={monthLabel}
            extra="Sin horas por máquina no se arma la lista de vigilancia."
          />
        )}
      </PdfSlide>

      <PdfSlide page={12} title="Desempeño energético" kicker={kicker(12, "Eficiencia")}>
        {model.kwFlota != null && model.topKw.length ? (
          <div className="icpdf-mto">
            <div className="icpdf-kpis icpdf-kpis-4">
              <article className="tone-blue">
                <span>Potencia media</span>
                <strong>{n(model.kwFlota, 0)} kW</strong>
                <small>energía / horas OP</small>
              </article>
              <article>
                <span>Mix gas</span>
                <strong>{pct(model.gasShare, 1)}</strong>
                <small>Jenbacher + Jinan</small>
              </article>
              <article className="tone-orange">
                <span>Mix diésel</span>
                <strong>{pct(model.dieselShare, 1)}</strong>
                <small>G101V + G102J + G102K</small>
              </article>
              <article className="tone-violet">
                <span>Pico de carga</span>
                <strong>{model.topKw[0]?.id ?? "—"}</strong>
                <small>{n(model.topKw[0]?.kw, 0)} kW medios</small>
              </article>
            </div>
            <div className="icpdf-minicharts">
              <article>
                <h4>kW medios en operación</h4>
                <ul className="icpdf-bars">
                  {model.topKw.map((row) => (
                    <li key={row.id}>
                      <span>{row.id}</span>
                      <b
                        style={{
                          width: `${(row.kw / Math.max(model.topKw[0]?.kw ?? 1, 1)) * 100}%`,
                        }}
                      />
                      <em>{n(row.kw, 0)}</em>
                    </li>
                  ))}
                </ul>
              </article>
              <article>
                <h4>Lectura</h4>
                <p className="icpdf-lead" style={{ margin: 0 }}>
                  El diésel del corte son las tres Cummins de reserva de Costayaco, no las Jenbacher.
                  Heat rate y eficiencia HHV quedan pendientes del totalizador Moqueta (la hoja de
                  agosto trae fechas de abril). Hasta entonces el seguimiento es potencia media y mix
                  de combustible.
                </p>
              </article>
            </div>
          </div>
        ) : model.eff ? (
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
            <EmptyKpis labels={["Potencia media", "Mix gas", "Mix diésel", "Pico de carga"]} />
            <PendingBanner monthLabel={monthLabel} extra="Sin generación por máquina no hay potencia media." />
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
              disponibilidad parque {pct(model.disp.dispCpw)} (Costayaco {pct(model.fieldCyc.disp)}, Vonú{" "}
              {pct(model.fieldVonu.disp)}) y confiabilidad{" "}
              {pct(model.cpw?.kpi.reliability ?? model.conf.contractualConf)} con{" "}
              {n(model.cpw?.summary.copowerFailures)} fallas imputables. El riesgo del corte es gas
              (MRU / Moqueta): {n(model.disp.fleetCpw.pf, 0)} h PF cliente y {pct(model.dieselShare, 1)}{" "}
              diésel en Cummins.
              {model.noCumple[0]
                ? ` ${model.noCumple[0].id} no cumple la meta de disp. por ${n(model.noCumple[0].pp)} h de preventivo.`
                : ""}
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
            <strong>Inventario de bodega.</strong> {n(model.inv.length)} ítems y {n(model.invStock)} und
            en STOCK, {n(model.invMovesIn + model.invMovesOut)} movimientos ({n(model.invMovesIn)}{" "}
            entradas / {n(model.invMovesOut)} salidas) y {n(model.invReview)} referencias a revisar.
            El mínimo ya está alineado al cierre; el foco es clasificar y reponer las{" "}
            {n(model.invAgotado)} agotadas.
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
            Clasificar las {n(model.invReview)} referencias a revisar y las {n(model.invUnclass)} sin
            familia. Reponer las {n(model.invAgotado)} agotadas del kardex antes del siguiente
            preventivo.
          </li>
          {month === "Ago" ? (
            <li>
              Cerrar el preventivo de {model.noCumple[0]?.id ?? "JIN-01"} (hoy bajo meta por PP) y el
              MTO pendiente de G101V. Vigilar presión Moqueta / MRU sobre JIN-12, JIN-10 y CPW01–06;
              el diésel del corte ya salió de las Cummins de reserva.
            </li>
          ) : (
            <li>Sostener el plan AGC4 en las unidades fuera de meta e intervenir los activos de menor salud.</li>
          )}
        </ul>
      </PdfSlide>
    </div>
  );
}
