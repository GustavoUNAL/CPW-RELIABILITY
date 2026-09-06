import { useMemo, type ReactNode } from "react";
import { COPOWER_PDF, PdfSlide } from "./CopowerPdfChrome";
import { AGOSTO_WEEKLY_PLANNING, informeMonthCoverage } from "./agostoWeeklyPlanning";
import { buildDisponibilidadAnalisis } from "./DisponibilidadAnalisisBoard";
import { buildConfiabilidadAnalisis } from "./ConfiabilidadAnalisisBoard";
import { buildEnergyEfficiency } from "./energyEfficiency";
import { GRAN_TIERRA_MONTHLY_DATA, generationBreakdown, type GranTierraMonthKey } from "./granTierraMonthly";
import { COPOWER_MONTHLY_DATA, COPOWER_MONTH_ORDER, type CopowerMonthKey } from "./copowerMonthly";
import { getConcertacionMonth } from "./concertacionHoursData";
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
const META_VONU = 0.9;

function pct(v: number | null | undefined, d = 2) {
  return v == null || Number.isNaN(v) ? "—" : `${(v * 100).toFixed(d)} %`;
}
function n(v: number | null | undefined, d = 0) {
  return v == null || Number.isNaN(v)
    ? "—"
    : v.toLocaleString("es-CO", { maximumFractionDigits: d, minimumFractionDigits: d });
}
function signedPct(v: number | null | undefined, d = 1) {
  if (v == null || Number.isNaN(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${(v * 100).toFixed(d)} %`;
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

function sortUnits<T extends { id: string; field: string; fleet: string }>(rows: T[]) {
  const fleetOrder = ["Jenbacher", "Jinan", "Cummins"];
  return [...rows].sort((a, b) => {
    const field = (a.field === "COSTAYACO" ? 0 : 1) - (b.field === "COSTAYACO" ? 0 : 1);
    if (field) return field;
    const fleet = fleetOrder.indexOf(a.fleet) - fleetOrder.indexOf(b.fleet);
    if (fleet) return fleet;
    return a.id.localeCompare(b.id, "es", { numeric: true });
  });
}

function mtoEquip(raw: string) {
  return raw
    .replace(/\s+/g, " ")
    .replace(/JINAN\s+/gi, "JIN-")
    .replace(/\bG\s*10(\d)\s*([A-Z])\b/gi, "G10$1$2")
    .replace(/\bCPW\s+(\d+)\b/gi, (_m, d: string) => `CPW${String(d).padStart(2, "0")}`)
    .replace(/\bCYC\b/g, "Costayaco")
    .trim();
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

function mtoWhy(notes: string | null) {
  if (!notes) return "Sin cierre en sábana";
  const t = notes.replace(/\s+/g, " ").trim();
  if (/falta de permisos/i.test(t)) return "Falta de permisos · se reprograma";
  if (/aplaza/i.test(t)) return "Se aplaza";
  return t.length > 44 ? `${t.slice(0, 42)}…` : t;
}

function isLowPressure(obs: string) {
  return /baja(?:\s+de)?\s*presi[oó]n|bajo\s+suministro|presi[oó]n en gas|presion en gas|presi[oó]n de gas/i.test(
    obs,
  );
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

function cubicPath(xs: number[], ys: number[]) {
  if (!ys.length) return "";
  if (ys.length === 1) return `M ${xs[0]} ${ys[0]}`;
  let d = `M ${xs[0].toFixed(1)} ${ys[0].toFixed(1)}`;
  for (let i = 0; i < ys.length - 1; i++) {
    const mx = (xs[i] + xs[i + 1]) / 2;
    d += ` C ${mx.toFixed(1)} ${ys[i].toFixed(1)}, ${mx.toFixed(1)} ${ys[i + 1].toFixed(1)}, ${xs[i + 1].toFixed(1)} ${ys[i + 1].toFixed(1)}`;
  }
  return d;
}

function ExecTrend({
  points,
}: {
  points: { month: string; disp: number | null; genDay: number | null; partial?: boolean }[];
}) {
  const w = 360;
  const h = 92;
  const pad = { l: 6, r: 6, t: 8, b: 18 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const disps = points.map((p) => p.disp).filter((v): v is number => v != null && v > 0);
  const gens = points.map((p) => p.genDay).filter((v): v is number => v != null && v > 0);
  if (points.length < 2 || disps.length < 2) return null;
  const dMin = Math.min(META - 0.04, ...disps);
  const dMax = 1;
  const gMin = Math.min(...gens) * 0.92;
  const gMax = Math.max(...gens) * 1.06;
  const xAt = (i: number) => pad.l + (i / (points.length - 1)) * innerW;
  const yDisp = (v: number) => pad.t + innerH - ((v - dMin) / (dMax - dMin || 1)) * innerH;
  const yGen = (v: number) => pad.t + innerH - ((v - gMin) / (gMax - gMin || 1)) * innerH;
  const xs = points.map((_, i) => xAt(i));
  const dispYs = points.map((p) => yDisp(p.disp ?? dMin));
  const genYs = points.map((p) => yGen(p.genDay ?? gMin));
  const last = points.length - 1;
  const metaY = yDisp(META);
  const area = `${cubicPath(xs, dispYs)} L ${xs[last].toFixed(1)} ${(pad.t + innerH).toFixed(1)} L ${xs[0].toFixed(1)} ${(pad.t + innerH).toFixed(1)} Z`;
  return (
    <div className="icpdf-trend">
      <div className="icpdf-trend-head">
        <h4>
          Tendencia COPOWER · {points[0]?.month}–{points[last]?.month}
        </h4>
        <p className="icpdf-trend-leg">
          <span>
            <i className="is-disp" /> Disp.
          </span>
          <span>
            <i className="is-gen" /> Generación MWh/día
          </span>
          <span>
            <i className="is-meta" /> Meta {(META * 100).toFixed(0)} %
          </span>
          {points.some((p) => p.partial) ? <span>Mes parcial</span> : null}
        </p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
        <line x1={pad.l} y1={metaY} x2={w - pad.r} y2={metaY} className="is-meta" />
        <path d={area} className="is-fill" />
        <path d={cubicPath(xs, genYs)} className="is-gen" />
        <path d={cubicPath(xs, dispYs)} className="is-disp" />
        {points.map((p, i) => (
          <circle key={`d-${p.month}`} cx={xs[i]} cy={dispYs[i]} r={p.partial ? 2.4 : 2} className="is-disp" />
        ))}
        {points.map((p, i) => (
          <circle key={`g-${p.month}`} cx={xs[i]} cy={genYs[i]} r={p.partial ? 2.4 : 1.8} className="is-gen" />
        ))}
        {points.map((p, i) => (
          <text key={p.month} x={xs[i]} y={h - 4} textAnchor="middle">
            {p.month}
          </text>
        ))}
      </svg>
    </div>
  );
}

function EventFreq({
  days,
}: {
  days: { date: string; count: number; mru?: number }[];
}) {
  if (days.length < 2) return null;
  const w = 360;
  const h = 104;
  const pad = { l: 18, r: 8, t: 16, b: 16 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(...days.map((d) => Math.max(d.count, d.mru ?? 0)), 1);
  const avg = days.reduce((s, d) => s + d.count, 0) / days.length;
  const xAt = (i: number) => pad.l + (i / (days.length - 1)) * innerW;
  const yAt = (v: number) => pad.t + innerH - (v / max) * innerH;
  const xs = days.map((_, i) => xAt(i));
  const ys = days.map((d) => yAt(d.count));
  const mruYs = days.map((d) => yAt(d.mru ?? 0));
  const last = days.length - 1;
  const peakIdx = days.reduce((best, d, i) => ((d.mru ?? 0) > (days[best].mru ?? 0) ? i : best), 0);
  const peak = days[peakIdx];
  const peakShare = peakIdx / last;
  const peakAnchor = peakShare < 0.18 ? "start" : peakShare > 0.82 ? "end" : "middle";
  const ticks = [0, Math.round(max / 2), max].filter((v, i, a) => a.indexOf(v) === i);
  const labeled = (d: string) => {
    const day = Number(d);
    return day === 1 || day === Number(days[last]?.date) || day % 7 === 1;
  };
  const area = `${cubicPath(xs, ys)} L ${xs[last].toFixed(1)} ${(pad.t + innerH).toFixed(1)} L ${xs[0].toFixed(1)} ${(pad.t + innerH).toFixed(1)} Z`;
  return (
    <div className="icpdf-trend icpdf-eventfreq">
      <div className="icpdf-trend-head">
        <h4>Salidas de MRU frente a la bitácora · 1–{days[last]?.date} ago</h4>
        <p className="icpdf-trend-leg">
          <span>
            <i className="is-disp" /> Toda la bitácora
          </span>
          <span>
            <i className="is-gen" /> Salidas MRU
          </span>
          <span>
            Pico MRU: día {Number(peak.date)} · {peak.mru ?? 0}
          </span>
        </p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} y1={yAt(t)} x2={w - pad.r} y2={yAt(t)} className="is-grid" />
            <text className="is-axis" x={pad.l - 3} y={yAt(t) + 2.5} textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        <line x1={pad.l} y1={yAt(avg)} x2={w - pad.r} y2={yAt(avg)} className="is-meta" />
        <line
          x1={xs[peakIdx]}
          y1={pad.t}
          x2={xs[peakIdx]}
          y2={pad.t + innerH}
          className="is-meta"
        />
        <path d={area} className="is-fill" />
        <path d={cubicPath(xs, ys)} className="is-disp" />
        <path d={cubicPath(xs, mruYs)} className="is-gen" />
        {days.map((d, i) => (
          <circle key={`t-${d.date}`} cx={xs[i]} cy={ys[i]} r={1.5} className="is-disp" />
        ))}
        {days.map((d, i) =>
          (d.mru ?? 0) > 0 ? (
            <circle
              key={`m-${d.date}`}
              cx={xs[i]}
              cy={mruYs[i]}
              r={i === peakIdx ? 3 : 1.7}
              className="is-gen"
            />
          ) : null,
        )}
        <text
          className="is-peak"
          x={xs[peakIdx]}
          y={Math.max(10, mruYs[peakIdx] - 7)}
          textAnchor={peakAnchor}
        >
          Día {Number(peak.date)} · {peak.mru ?? 0}× MRU
        </text>
        {days.map((d, i) => (
          <text key={`x-${d.date}`} x={xs[i]} y={h - 3} textAnchor="middle">
            {labeled(d.date) ? Number(d.date) : ""}
          </text>
        ))}
      </svg>
    </div>
  );
}

function DailyGen({
  days,
}: {
  days: { date: string; gas: number; diesel: number }[];
}) {
  if (days.length < 2) return null;
  const max = Math.max(...days.map((d) => d.gas + d.diesel), 1);
  const peak = days.reduce((a, b) => (a.gas + a.diesel >= b.gas + b.diesel ? a : b));
  const lastDay = Number(days[days.length - 1]?.date);
  const labeled = (d: string) => {
    const day = Number(d);
    return day === 1 || day === lastDay || day % 7 === 1;
  };
  return (
    <div className="icpdf-days">
      <div className="icpdf-trend-head">
        <h4>Generación diaria · MWh</h4>
        <p className="icpdf-trend-leg">
          <span>
            <i className="is-disp" /> Gas
          </span>
          <span>
            <i className="is-gen" /> Diésel
          </span>
          <span>
            Pico día {Number(peak.date)} · {n(peak.gas + peak.diesel, 0)} MWh
          </span>
        </p>
      </div>
      <div className="icpdf-days-plot" style={{ ["--n" as string]: days.length }}>
        {days.map((d) => {
          const tot = d.gas + d.diesel;
          return (
            <div key={d.date}>
              <span style={{ height: `${(tot / max) * 100}%` }}>
                {d.diesel > 0 ? <i className="is-diesel" style={{ flex: d.diesel }} /> : null}
                <i className="is-gas" style={{ flex: Math.max(d.gas, 0.01) }} />
              </span>
              <em>{labeled(d.date) ? Number(d.date) : ""}</em>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FracEq({ num, den, after }: { num: ReactNode; den: ReactNode; after: ReactNode }) {
  return (
    <div className="icpdf-frac-row">
      <span className="icpdf-frac">
        <b>{num}</b>
        <i />
        <b>{den}</b>
      </span>
      <em>{after}</em>
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
    const invAgotados = inv
      .filter((i) => i.status === "AGOTADO" || i.onHand <= 0)
      .sort((a, b) => b.issued - a.issued || a.description.localeCompare(b.description, "es"))
      .slice(0, 6);
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
        pfContr: g.horasPFContr ?? 0,
        cal: g.horasCalDia,
        energy: g.energiaKwh,
        uso: ready > 0 ? g.horasOperacion / ready : 0,
        kw: g.horasOperacion > 0 ? g.energiaKwh / g.horasOperacion : 0,
        disp: m?.disponibilidadPct ?? null,
        conf: m?.confiabilidadPct ?? null,
        fallas: m?.fallas ?? g.fallaEvento ?? 0,
        rInd:
          g.horasCalDia > 0
            ? Math.max(0, (g.horasCalDia - (g.horasPFContr ?? 0)) / g.horasCalDia)
            : 1,
        aInd:
          g.horasCalDia > 0
            ? Math.max(0, (g.horasCalDia - g.horasPP - (g.horasPFContr ?? 0)) / g.horasCalDia)
            : 1,
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
    const cycUnits = unitRows.filter((u) => u.field === "COSTAYACO");
    const cycGasN = cycUnits.filter((u) => u.fleet !== "Cummins").length;
    const cycDieselN = cycUnits.filter((u) => u.fleet === "Cummins").length;
    const cycPfContr = cycUnits.reduce((s, u) => s + u.pfContr, 0);
    const cycFails = cycUnits.reduce((s, u) => s + u.fallas, 0);
    const cycRel = {
      units: cycUnits,
      n: cycUnits.length,
      cal: fieldCyc.cal,
      op: fieldCyc.op,
      pp: fieldCyc.pp,
      pf: fieldCyc.pf,
      pfContr: cycPfContr,
      fails: cycFails,
      r: fieldCyc.cal > 0 ? (fieldCyc.cal - cycPfContr) / fieldCyc.cal : null,
      a: fieldCyc.disp,
      rs: cycUnits.length ? 1 - cycUnits.reduce((p, u) => p * (1 - u.rInd), 1) : null,
      rMin: cycUnits.length ? Math.min(...cycUnits.map((u) => u.rInd)) : null,
      confOk: cycUnits.filter((u) => u.rInd >= META).length,
      noCumple: cycUnits.filter((u) => u.cumple === "NO CUMPLE"),
    };
    const readyAll = unitRows.reduce((s, u) => s + u.op + u.sb, 0);
    const opAll = unitRows.reduce((s, u) => s + u.op, 0);
    const energyAll = unitRows.reduce((s, u) => s + u.energy, 0);
    const usoFlota = readyAll > 0 ? opAll / readyAll : null;
    const noCumple = unitRows.filter((u) => u.cumple === "NO CUMPLE");
    const fleetChart = (["Jenbacher", "Jinan", "Cummins"] as const).map((name) => {
      const rows = unitRows.filter((u) => u.fleet === name);
      const energy = rows.reduce((s, u) => s + u.energy, 0);
      const op = rows.reduce((s, u) => s + u.op, 0);
      return {
        name,
        units: rows.length,
        op,
        energy,
        pf: rows.reduce((s, u) => s + u.pf, 0),
        sb: rows.reduce((s, u) => s + u.sb, 0),
        share: energyAll > 0 ? energy / energyAll : 0,
        kw: op > 0 ? energy / op : 0,
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
    const riskWatch = [...unitRows]
      .filter((u) => u.pf > 0 || u.cumple === "NO CUMPLE")
      .sort(
        (a, b) =>
          (b.cumple === "NO CUMPLE" ? 1 : 0) - (a.cumple === "NO CUMPLE" ? 1 : 0) ||
          b.pf - a.pf ||
          b.pp - a.pp,
      )
      .slice(0, 8);
    const topEnergy = [...unitRows].sort((a, b) => b.energy - a.energy).slice(0, 6);
    const topKw = [...unitRows].filter((u) => u.kw > 0).sort((a, b) => b.kw - a.kw).slice(0, 6);
    const kwFlota = opAll > 0 ? energyAll / opAll : null;
    const gasShare = gen && gen.totalKwh > 0 ? gen.gasKwh / gen.totalKwh : null;
    const dieselShare = gen && gen.totalKwh > 0 ? gen.dieselKwh / gen.totalKwh : null;
    const monthIdx = COPOWER_MONTH_ORDER.indexOf(month as CopowerMonthKey);
    const fromFeb = COPOWER_MONTH_ORDER.indexOf("Feb");
    const trendEnd = monthIdx < 0 ? COPOWER_MONTH_ORDER.length : monthIdx + 1;
    const execTrend = COPOWER_MONTH_ORDER.slice(Math.max(fromFeb, 0), Math.max(trendEnd, fromFeb + 1)).map((key) => {
      const snap = COPOWER_MONTHLY_DATA[key];
      const days = new Date(2026, COPOWER_MONTH_ORDER.indexOf(key) + 1, 0).getDate();
      const gen = snap.kpi.generationMwh;
      return {
        month: key,
        disp: snap.kpi.availability,
        genDay: gen != null && days > 0 ? gen / days : null,
        partial: false,
      };
    });
    const daysThis = new Date(2026, Math.max(monthIdx, 0) + 1, 0).getDate();
    const prevKey = monthIdx > 0 ? COPOWER_MONTH_ORDER[monthIdx - 1] : null;
    const prevSnap = prevKey ? COPOWER_MONTHLY_DATA[prevKey] : null;
    const daysPrev =
      prevKey == null ? 0 : new Date(2026, COPOWER_MONTH_ORDER.indexOf(prevKey) + 1, 0).getDate();
    const mwhDay = gen && daysThis > 0 ? gen.totalKwh / 1000 / daysThis : null;
    const prevMwhDay =
      prevSnap?.kpi.generationMwh != null && daysPrev > 0
        ? prevSnap.kpi.generationMwh / daysPrev
        : null;
    const mwhDayDelta =
      mwhDay != null && prevMwhDay ? (mwhDay - prevMwhDay) / prevMwhDay : null;
    const dieselDay = gen && daysThis > 0 ? gen.dieselKwh / 1000 / daysThis : null;
    const prevDieselDay =
      prevSnap && daysPrev > 0 ? (prevSnap.summary.energyDieselKwh ?? 0) / 1000 / daysPrev : null;
    const dieselDayDelta =
      dieselDay != null && prevDieselDay && prevDieselDay > 0
        ? (dieselDay - prevDieselDay) / prevDieselDay
        : null;
    const cycShare = energyAll > 0 ? fieldCyc.energy / energyAll : null;
    const vonuShare = energyAll > 0 ? fieldVonu.energy / energyAll : null;
    const producing = unitRows.filter((u) => u.energy > 0).length;
    const top3Share =
      energyAll > 0 ? topEnergy.slice(0, 3).reduce((s, u) => s + u.energy, 0) / energyAll : null;
    const genMwh = energyAll / 1000;
    const avgMwhUnit = producing > 0 ? genMwh / producing : null;
    const energyBars = [...unitRows]
      .filter((u) => u.energy > 0)
      .sort((a, b) => b.energy - a.energy)
      .map((u) => ({ id: u.id, mwh: u.energy / 1000, kw: u.kw }));
    const prevGenMwh = prevSnap?.kpi.generationMwh ?? null;
    const genMwhDelta = prevGenMwh != null ? genMwh - prevGenMwh : null;
    const dayMap = new Map<string, { gas: number; diesel: number }>();
    for (const row of getConcertacionMonth(month)?.daily ?? []) {
      if (month === "Ago" && row.fuel === "DIESEL" && row.date > "2026-08-21") continue;
      const cur = dayMap.get(row.date) ?? { gas: 0, diesel: 0 };
      if (row.fuel === "DIESEL") cur.diesel += row.kwh / 1000;
      else cur.gas += row.kwh / 1000;
      dayMap.set(row.date, cur);
    }
    const genDays = [...dayMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date: date.slice(8), gas: v.gas, diesel: v.diesel }));
    const genPeak = genDays.reduce<{ date: string; mwh: number } | null>((acc, d) => {
      const mwh = d.gas + d.diesel;
      if (!acc || mwh > acc.mwh) return { date: d.date, mwh };
      return acc;
    }, null);
    const genValle = genDays.reduce<{ date: string; mwh: number } | null>((acc, d) => {
      const mwh = d.gas + d.diesel;
      if (!acc || mwh < acc.mwh) return { date: d.date, mwh };
      return acc;
    }, null);
    const dieselDaysN = genDays.filter((d) => d.diesel > 0.05).length;
    const opsSnap = gte ?? cpw;
    const pfCpw = opsSnap?.summary.hoursFailureCopower ?? 0;
    const failsCpw = opsSnap?.summary.copowerFailures ?? 0;
    const prevFails = prevSnap?.summary.copowerFailures ?? null;
    const calH = disp.programmed;
    const confByHours = calH > 0 ? (calH - pfCpw) / calH : null;
    const aByHours =
      calH > 0 ? (calH - ((disp.fleetCpw.pp ?? 0) + pfCpw)) / calH : null;
    const rSistema = unitRows.length
      ? 1 - unitRows.reduce((p, u) => p * (1 - u.rInd), 1)
      : null;
    const rMin = unitRows.length ? Math.min(...unitRows.map((u) => u.rInd)) : null;
    const mtbf = failsCpw > 0 && opAll > 0 ? opAll / failsCpw : null;
    const mttr = failsCpw > 0 ? pfCpw / failsCpw : null;
    const confOk = unitRows.filter((u) => u.rInd >= META).length;
    const eventLog = gte?.eventLog ?? cpw?.eventLog ?? [];
    const hoursDown = eventLog.filter((e) => e.downtimeHours > 0);
    const logFalla = eventLog.filter((e) => e.eventType === "Falla").length;
    const logOp = eventLog.length - logFalla;
    const logNotesOnly = eventLog.length - hoursDown.length;
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
      .sort((a, b) => b.count - a.count || b.hours - a.hours)
      .slice(0, 6);
    const dayLog = new Map<string, { count: number; mru: number }>();
    const dates = eventLog.map((e) => e.date).sort();
    if (dates.length) {
      const cursor = new Date(`${dates[0]}T12:00:00`);
      const lastDate = new Date(`${dates[dates.length - 1]}T12:00:00`);
      while (cursor <= lastDate) {
        dayLog.set(cursor.toISOString().slice(0, 10), { count: 0, mru: 0 });
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    for (const e of eventLog) {
      const cur = dayLog.get(e.date) ?? { count: 0, mru: 0 };
      cur.count += 1;
      if (causeKind(e.cause) === "MRU") cur.mru += 1;
      dayLog.set(e.date, cur);
    }
    const logDays = [...dayLog.entries()]
      .sort(([x], [y]) => x.localeCompare(y))
      .map(([date, v]) => ({ date: date.slice(8), count: v.count, mru: v.mru }));
    const mruRaw = causeMap.get("MRU") ?? { count: 0, hours: 0 };
    const mruCause = { kind: "MRU", count: mruRaw.count, hours: mruRaw.hours };
    const pfIfNoMru = Math.max(0, (disp.fleetCpw.pf ?? 0) - mruCause.hours);
    const kwById = new Map(unitRows.map((u) => [u.id.toUpperCase(), u.kw]));
    const fleetKw = opAll > 0 ? energyAll / opAll : 0;
    const unitKw = (eq: string) => {
      const key = eq.toUpperCase().replace(/\s+/g, "").replace(/JINAN/g, "JIN-").replace(/^CPW-/, "CPW");
      return kwById.get(key) || fleetKw;
    };
    const mruLostKwh = eventLog.reduce((s, e) => {
      if (causeKind(e.cause) !== "MRU" || e.downtimeHours <= 0) return s;
      return s + e.downtimeHours * unitKw(e.equipment);
    }, 0);

    const pairMap = new Map<string, { equipment: string; kind: string; count: number }>();
    for (const e of eventLog) {
      const kind = causeKind(e.cause);
      const key = `${e.equipment}|${kind}`;
      const row = pairMap.get(key) ?? { equipment: e.equipment, kind, count: 0 };
      row.count += 1;
      pairMap.set(key, row);
    }
    const topPair = [...pairMap.values()].sort((x, y) => y.count - x.count)[0] ?? null;
    const topTwoCount = (causeChart[0]?.count ?? 0) + (causeChart[1]?.count ?? 0);

    const repeats = [...eventLog.reduce((map, e) => {
      map.set(e.equipment, (map.get(e.equipment) ?? 0) + 1);
      return map;
    }, new Map<string, number>())]
      .map(([equipment, count]) => ({ equipment, count }))
      .sort((x, y) => y.count - x.count)
      .slice(0, 6);

    const otherDown = hoursDown.filter((e) => !isLowPressure(e.cause));
    const topEvents = otherDown
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
    const otherPfH = otherDown.reduce((s, e) => s + e.downtimeHours, 0);

    const equipMap = new Map<string, number>();
    for (const e of programmed) {
      for (const part of e.equipment.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)) {
        const label = mtoEquip(part);
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
      invAgotados,
      gen,
      eff,
      machines,
      unitRows,
      fieldCyc,
      fieldVonu,
      cycGasN,
      cycDieselN,
      cycRel,
      usoFlota,
      noCumple,
      fleetChart,
      cumminsUso,
      machineTable,
      watchPf,
      riskWatch,
      topEnergy,
      topKw,
      kwFlota,
      gasShare,
      dieselShare,
      execTrend,
      prevMonth: prevKey,
      mwhDay,
      mwhDayDelta,
      dieselDay,
      dieselDayDelta,
      cycShare,
      vonuShare,
      producing,
      top3Share,
      genMwh,
      avgMwhUnit,
      energyBars,
      prevGenMwh,
      genMwhDelta,
      genDays,
      genPeak,
      genValle,
      dieselDaysN,
      pfCpw,
      failsCpw,
      prevFails,
      calH,
      confByHours,
      aByHours,
      rSistema,
      rMin,
      mtbf,
      mttr,
      confOk,
      hoursDown,
      logDays,
      mruCause,
      pfIfNoMru,
      mruLostKwh,
      topPair,
      topTwoCount,
      logFalla,
      logOp,
      logNotesOnly,
      causeChart,
      eventLog,
      repeats,
      topEvents,
      otherDownN: otherDown.length,
      otherPfH,
      equipChart,
      weekChart,
      recent,
      period: monthLabel.toUpperCase(),
      corte: month === "Ago" ? "gas 01–31 · diésel 01–21" : null,
    };
  }, [month, monthLabel]);

  const kicker = (nSlide: number, name: string) =>
    `${nSlide} · ${name.toUpperCase()} · ${model.period}`;

  return (
    <div className="icpdf-deck">
      <PdfSlide page={1} cover>
        <div className="icpdf-cover">
          <div className="icpdf-cover-hero">
            <p className="icpdf-cover-kicker">INFORME MENSUAL · CONCILIADO CON DATA SOPORTE GTE</p>
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
            Base: Data Soporte GTE PUTN agosto 2026 y horas concertadas. A% = (OP + SB) / Tcal ·
            R% = (Tcal − FO) / Tcal · Tcal = 24 h/día · PF cliente no resta. Gas 01–31 · diésel
            01–21. Meta Costayaco ≥ 98 % · Vonú ≥ 90 %.
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
              <article className={model.disp.dispCpw != null && model.disp.dispCpw < META ? "is-warn" : "is-ok"}>
                <span>Disponibilidad</span>
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
              <article className="tone-orange">
                <span>Paradas externas</span>
                <strong>{n(model.disp.fleetCpw.pf, 0)} h</strong>
                <small>MRU / Moqueta / CCM</small>
              </article>
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
                <article className={model.fieldVonu.disp != null && model.fieldVonu.disp < META_VONU ? "is-warn" : "is-ok"}>
                  <span>Vonú</span>
                  <strong>{pct(model.fieldVonu.disp)}</strong>
                  <small>PP {n(model.fieldVonu.pp)} h</small>
                </article>
                <article className="tone-violet">
                  <span>Uso de flota</span>
                  <strong>{pct(model.usoFlota, 1)}</strong>
                  <small>
                    OP {n(model.disp.fleetCpw.op, 0)} · SB {n(model.disp.fleetCpw.sb, 0)}
                  </small>
                </article>
                <article className={model.noCumple.length ? "is-warn" : "tone-blue"}>
                  <span>Plan MTO</span>
                  <strong>
                    {n(model.executed.length)}/{n(model.programmed.length)}
                  </strong>
                  <small>
                    {model.noCumple.length
                      ? `fuera de meta ${model.noCumple.map((u) => u.id).join(", ")}`
                      : `${n(model.disp.fleetCpw.pp, 0)} h PP`}
                  </small>
                </article>
              </div>
            ) : null}
            <ExecTrend points={model.execTrend} />
          </div>
        ) : (
          <>
            <EmptyKpis labels={["Generación", "Disp. COPOWER", "Confiabilidad", "Paradas externas"]} />
            <PendingBanner monthLabel={monthLabel} extra="Sin horas concertadas ni Data Soporte." />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={3} title={`Análisis de disponibilidad ${monthLabel}`} kicker={kicker(3, "Análisis de disponibilidad")}>
        {model.disp.dispCpw != null && model.unitRows.length ? (
          <div className="icpdf-mto icpdf-disp icpdf-disp-formula">
            <div className="icpdf-row-head">
              <h3>Disponibilidad del parque{model.corte ? ` · ${model.corte}` : ""}</h3>
              <code>Costayaco ≥ {(META * 100).toFixed(0)} % · Vonú ≥ {(META_VONU * 100).toFixed(0)} % · PF cliente no resta</code>
            </div>
            <div className="icpdf-kpis icpdf-kpis-3">
              <article className={model.disp.dispCpw < META ? "is-warn" : "is-ok"}>
                <span>Parque</span>
                <strong>{pct(model.disp.dispCpw)}</strong>
                <small>
                  {n(model.disp.cpwAvailable, 0)} / {n(model.disp.programmed, 0)} h
                </small>
              </article>
              <article className={(model.fieldCyc.disp ?? 0) < META ? "is-warn" : "is-ok"}>
                <span>Costayaco</span>
                <strong>{pct(model.fieldCyc.disp)}</strong>
                <small>
                  {n(model.fieldCyc.units)} und · {n(model.fieldCyc.op + model.fieldCyc.sb, 0)} h disp.
                </small>
              </article>
              <article className={(model.fieldVonu.disp ?? 0) < META_VONU ? "is-warn" : "is-ok"}>
                <span>Vonú</span>
                <strong>{pct(model.fieldVonu.disp)}</strong>
                <small>
                  {n(model.fieldVonu.units)} und · PP {n(model.fieldVonu.pp)} h
                </small>
              </article>
            </div>
            <div className="icpdf-method">
              <article className="is-d">
                <h4>Disponibilidad</h4>
                <p className="icpdf-regla">
                  Horas en que la máquina está lista. El stand-by cuenta como disponible.
                </p>
                <FracEq num="OP + SB" den="Tiempo calendario" after="× 100" />
                <FracEq
                  num={
                    <>
                      {n(model.disp.fleetCpw.op, 0)} + {n(model.disp.fleetCpw.sb, 0)}
                    </>
                  }
                  den={n(model.disp.programmed, 0)}
                  after={`= ${pct(model.disp.dispCpw)}`}
                />
              </article>
              <article className="is-a">
                <h4>A% · contractual</h4>
                <p className="icpdf-regla">
                  Restan preventivo (PP) y fallas imputables. PF cliente se excluye.
                </p>
                <FracEq num="Planificado − (PP + Fallas)" den="Tiempo planificado" after="× 100" />
                <FracEq
                  num={
                    <>
                      {n(model.disp.programmed, 0)} − ({n(model.disp.fleetCpw.pp, 0)} + {n(model.pfCpw, 0)})
                    </>
                  }
                  den={n(model.disp.programmed, 0)}
                  after={`= ${pct(model.aByHours)}`}
                />
              </article>
            </div>
            <div className="icpdf-method icpdf-method-fields">
              <article className="is-d">
                <h4>
                  {month === "Ago" && model.cycDieselN
                    ? `Costayaco · ${n(model.cycGasN)} gas × 31 + ${n(model.cycDieselN)} diésel × 21`
                    : `Costayaco · ${n(model.fieldCyc.units)} × ${n(
                        model.fieldCyc.units ? model.fieldCyc.cal / model.fieldCyc.units / 24 : null,
                        0,
                      )} × 24`}
                </h4>
                <p className="icpdf-regla">
                  Misma base. PP {n(model.fieldCyc.pp, 0)} h · FO 0 h · PF cliente no entra.
                </p>
                <FracEq num="OP + SB" den="Tcalendario CYC" after="× 100" />
                <FracEq
                  num={
                    <>
                      {n(model.fieldCyc.op, 0)} + {n(model.fieldCyc.sb, 0)}
                    </>
                  }
                  den={n(model.fieldCyc.cal, 0)}
                  after={`= ${pct(model.fieldCyc.disp)}`}
                />
              </article>
              <article className={(model.fieldVonu.disp ?? 1) < META_VONU ? "is-v" : "is-d"}>
                <h4>
                  Vonú · {n(model.fieldVonu.units)} ×{" "}
                  {n(model.fieldVonu.units ? model.fieldVonu.cal / model.fieldVonu.units / 24 : null, 0)} × 24
                </h4>
                <p className="icpdf-regla">
                  {model.unitRows
                    .filter((u) => u.field === "VONU")
                    .map((u) => `${u.id} ${n(u.pp)} h PP`)
                    .join(" · ") || `PP ${n(model.fieldVonu.pp, 0)} h`}
                  . FO 0 h.
                </p>
                <FracEq num="OP + SB" den="Tcalendario Vonú" after="× 100" />
                <FracEq
                  num={
                    <>
                      {n(model.fieldVonu.op, 0)} + {n(model.fieldVonu.sb, 0)}
                    </>
                  }
                  den={n(model.fieldVonu.cal, 0)}
                  after={`= ${pct(model.fieldVonu.disp)}`}
                />
                <FracEq
                  num={
                    <>
                      {n(model.fieldVonu.cal, 0)} − ({n(model.fieldVonu.pp, 0)} + 0)
                    </>
                  }
                  den={n(model.fieldVonu.cal, 0)}
                  after={`= ${pct(
                    model.fieldVonu.cal > 0
                      ? (model.fieldVonu.cal - model.fieldVonu.pp) / model.fieldVonu.cal
                      : null,
                  )}`}
                />
              </article>
            </div>
            <p className="icpdf-conf-foot">
              {model.noCumple.length
                ? `Bajo meta Costayaco (≥ ${(META * 100).toFixed(0)} %): ${model.noCumple
                    .map((u) => `${u.id} ${u.disp != null ? u.disp.toFixed(2) : "—"} %`)
                    .join(" · ")}. ${model.noCumple.length === 1 ? "Sale" : "Salen"} por PP, no por FO. Vonú cumple ≥ ${(META_VONU * 100).toFixed(0)} %.`
                : `Todas las unidades cumplen la meta de disponibilidad. Fallas imputables: ${n(model.pfCpw, 0)} h.`}
            </p>
          </div>
        ) : (
          <>
            <EmptyKpis labels={["Parque", "Costayaco", "Vonú"]} />
            <PendingBanner monthLabel={monthLabel} extra="Sin horas concertadas no se publica la disponibilidad." />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={4} title={`Análisis de confiabilidad ${monthLabel}`} kicker={kicker(4, "Análisis de confiabilidad")}>
        {model.cycRel.n ? (
          <div className="icpdf-mto icpdf-disp icpdf-disp-formula">
            <div className="icpdf-row-head">
              <h3>
                Solo Costayaco{model.corte ? ` · ${model.corte}` : ""} · {n(model.cycRel.n)} unidades en
                paralelo
              </h3>
              <code>Meta ≥ {(META * 100).toFixed(0)} % · Vonú no entra · PF cliente no resta</code>
            </div>
            <div className="icpdf-kpis icpdf-kpis-3">
              <article className={(model.cycRel.r ?? 0) < META ? "is-warn" : "is-ok"}>
                <span>Confiabilidad R%</span>
                <strong>{pct(model.cycRel.r)}</strong>
                <small>solo restan fallas imputables</small>
              </article>
              <article className={(model.cycRel.a ?? 1) < META ? "is-warn" : "tone-violet"}>
                <span>Disponibilidad A%</span>
                <strong>{pct(model.cycRel.a)}</strong>
                <small>restan fallas + preventivo</small>
              </article>
              <article className={(model.cycRel.rs ?? 0) < META ? "is-warn" : "tone-blue"}>
                <span>R sistema paralelo</span>
                <strong>{pct(model.cycRel.rs)}</strong>
                <small>
                  {n(model.cycRel.n)} und · 1 − ∏(1 − Rᵢ)
                </small>
              </article>
            </div>
            <div className="icpdf-method">
              <article className="is-r">
                <h4>R% · individual Costayaco</h4>
                <p className="icpdf-regla">
                  Paradas no programadas = fallas a cargo de COPOWER. El preventivo no entra.
                </p>
                <FracEq num="Planificado − Fallas" den="Tiempo planificado" after="× 100" />
                <FracEq
                  num={
                    <>
                      {n(model.cycRel.cal, 0)} − {n(model.cycRel.pfContr, 0)}
                    </>
                  }
                  den={n(model.cycRel.cal, 0)}
                  after={`= ${pct(model.cycRel.r)}`}
                />
              </article>
              <article className="is-a">
                <h4>A% · individual Costayaco</h4>
                <p className="icpdf-regla">
                  Restan preventivo (PP) y fallas imputables. PF cliente se excluye.
                </p>
                <FracEq num="Planificado − (PP + Fallas)" den="Tiempo planificado" after="× 100" />
                <FracEq
                  num={
                    <>
                      {n(model.cycRel.cal, 0)} − ({n(model.cycRel.pp, 0)} + {n(model.cycRel.pfContr, 0)})
                    </>
                  }
                  den={n(model.cycRel.cal, 0)}
                  after={`= ${pct(model.cycRel.a)}`}
                />
              </article>
            </div>
            <div className="icpdf-method icpdf-method-fields">
              <article className="is-d">
                <h4>
                  {month === "Ago" && model.cycDieselN
                    ? `Calendario · ${n(model.cycGasN)}×31 + ${n(model.cycDieselN)}×21`
                    : `Calendario · ${n(model.cycRel.n)} × ${n(
                        model.cycRel.n ? model.cycRel.cal / model.cycRel.n / 24 : null,
                        0,
                      )} × 24`}
                </h4>
                <p className="icpdf-regla">
                  {month === "Ago" && model.cycDieselN
                    ? "Tplan Costayaco. Gas 01–31 · diésel 01–21. Sin Vonú."
                    : "Tplan Costayaco. Misma base de la lámina de disponibilidad, sin Vonú."}
                </p>
                <FracEq
                  num={
                    month === "Ago" && model.cycDieselN ? (
                      <>
                        {n(model.cycGasN)}×31×24 + {n(model.cycDieselN)}×21×24
                      </>
                    ) : (
                      <>
                        {n(model.cycRel.n)} ×{" "}
                        {n(model.cycRel.n ? model.cycRel.cal / model.cycRel.n / 24 : null, 0)} × 24
                      </>
                    )
                  }
                  den={month === "Ago" && model.cycDieselN ? "gas + diésel" : "unidades × días × 24"}
                  after={`= ${n(model.cycRel.cal, 0)} h`}
                />
              </article>
              <article className="is-r">
                <h4>R<sub>s</sub> · sistema en paralelo</h4>
                <p className="icpdf-regla">
                  {model.cycRel.fails === 0
                    ? `Las ${n(model.cycRel.n)} máquinas tienen Rᵢ = 100 %. El producto es 0.`
                    : `Rᵢ mín. ${pct(model.cycRel.rMin)}.`}
                </p>
                <p className="icpdf-eq-line">
                  R<sub>s</sub> = 1 − ∏ (1 − R<sub>i</sub>)
                </p>
                <p className="icpdf-eq-sub">
                  1 − 0 = <strong>{pct(model.cycRel.rs)}</strong>
                </p>
              </article>
            </div>
            <ul className="icpdf-chips">
              <li>
                <strong>Planificado</strong> {n(model.cycRel.cal, 0)} h
                <span>denominador de R y A</span>
              </li>
              <li>
                <strong>Fallas</strong> {n(model.cycRel.pfContr, 0)} h
                <span>{n(model.cycRel.fails)} FO · restan R y A</span>
              </li>
              <li>
                <strong>Preventivo</strong> {n(model.cycRel.pp, 0)} h
                <span>
                  no entra en R
                  {model.cycRel.noCumple.length
                    ? ` · ${model.cycRel.noCumple.map((u) => u.id).join(", ")} bajo A`
                    : " · todas en meta A"}
                </span>
              </li>
              <li>
                <strong>PF cliente</strong> {n(model.cycRel.pf, 0)} h
                <span>excluido · ajeno al contratista</span>
              </li>
            </ul>
            <p className="icpdf-conf-foot">
              {model.cycRel.noCumple.length
                ? `Bajo meta A (≥ ${(META * 100).toFixed(0)} %): ${model.cycRel.noCumple
                    .map((u) => `${u.id} ${u.aInd != null ? (u.aInd * 100).toFixed(2) : "—"} %`)
                    .join(" · ")}. Sale por PP, no por FO. `
                : "Todas las unidades de Costayaco cumplen A%. "}
              MTBF y MTTR no se calculan (N = {n(model.cycRel.fails)}).
              {model.conf.rows.length
                ? ` FO-GE-033: ${n(model.conf.rows.length)} · ${n(model.conf.imputables.length)} imputables.`
                : " FO-GE-033 de agosto pendiente; no se copian los de julio."}
            </p>
          </div>
        ) : (
          <>
            <EmptyKpis labels={["Confiabilidad R%", "Disponibilidad A%", "R sistema paralelo"]} />
            <PendingBanner monthLabel={monthLabel} extra="Sin horas de Costayaco no se publica la Conf." />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={5} title="Detalle de la generación" kicker={kicker(5, "Generación")}>
        {model.gen && model.topEnergy.length ? (
          <div className="icpdf-mto icpdf-exec icpdf-gen">
            <div className="icpdf-kpis icpdf-kpis-4">
              <article>
                <span>Total</span>
                <strong>{n(model.gen.totalKwh / 1000, 1)} MWh</strong>
                <small>
                  {model.corte ?? "parque"} · {n(model.producing)}/{n(model.unitRows.length)} en carga
                </small>
              </article>
              <article className={model.mwhDayDelta != null && model.mwhDayDelta < 0 ? "is-warn" : "is-ok"}>
                <span>Ritmo diario</span>
                <strong>{n(model.mwhDay, 1)} MWh/d</strong>
                <small>
                  {signedPct(model.mwhDayDelta)}
                  {model.prevMonth ? ` vs ${model.prevMonth}` : ""}
                </small>
              </article>
              <article className="tone-violet">
                <span>Pico diario</span>
                <strong>{n(model.genPeak?.mwh, 0)} MWh</strong>
                <small>
                  día {model.genPeak ? Number(model.genPeak.date) : "—"} · valle {n(model.genValle?.mwh, 0)}
                </small>
              </article>
              <article className="tone-blue">
                <span>Potencia media</span>
                <strong>{n(model.kwFlota, 0)} kW</strong>
                <small>
                  {n(model.disp.fleetCpw.op, 0)} h OP · top 3 {pct(model.top3Share, 0)}
                </small>
              </article>
            </div>
            <div className="icpdf-kpis icpdf-kpis-4">
              <article className="tone-blue">
                <span>Mix gas</span>
                <strong>{pct(model.gasShare, 1)}</strong>
                <small>{n(model.gen.gasKwh / 1000, 1)} MWh Jenbacher + Jinan</small>
              </article>
              <article className={model.dieselDayDelta != null && model.dieselDayDelta > 0.2 ? "is-warn" : "tone-orange"}>
                <span>Diésel / día</span>
                <strong>{n(model.dieselDay, 1)} MWh/d</strong>
                <small>
                  {pct(model.dieselShare, 1)} · {n(model.dieselDaysN)} d · {signedPct(model.dieselDayDelta)}
                  {model.prevMonth ? ` vs ${model.prevMonth}` : ""}
                </small>
              </article>
              <article>
                <span>Costayaco</span>
                <strong>{n(model.fieldCyc.energy / 1000, 1)} MWh</strong>
                <small>
                  {pct(model.cycShare, 1)} · {n(model.fieldCyc.op)} h OP
                </small>
              </article>
              <article className="tone-violet">
                <span>Vonú</span>
                <strong>{n(model.fieldVonu.energy / 1000, 1)} MWh</strong>
                <small>
                  {pct(model.vonuShare, 1)} · {n(model.fieldVonu.op)} h OP
                </small>
              </article>
            </div>
            <DailyGen days={model.genDays} />
            <ul className="icpdf-bars icpdf-gen-fleets">
              {model.fleetChart.map((row) => (
                <li key={row.name}>
                  <span>{row.name}</span>
                  <b
                    className={row.name === "Cummins" ? "is-rev" : undefined}
                    style={{
                      width: `${(row.energy / Math.max(...model.fleetChart.map((x) => x.energy), 1)) * 100}%`,
                    }}
                  />
                  <em>
                    {n(row.energy / 1000, 0)} · {pct(row.share, 0)}
                  </em>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <EmptyKpis labels={["Total", "Ritmo diario", "Mix gas", "Potencia media"]} />
            <PendingBanner monthLabel={monthLabel} extra="La generación sale de horas concertadas o Data Soporte." />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={6} title="Desempeño por máquina" kicker={kicker(6, "Desempeño por máquina")}>
        {model.unitRows.length ? (
          <div className="icpdf-mto icpdf-disp icpdf-machines">
            <div className="icpdf-machines-eq" aria-label="Fórmulas R y A">
              <article className="is-r">
                <h4>R%</h4>
                <FracEq num="Tplan − Fallas" den="Tplan" after="× 100 · PP no resta" />
              </article>
              <article className="is-a">
                <h4>A%</h4>
                <FracEq num="Tplan − (PP + Fallas)" den="Tplan" after="× 100 · PF no resta" />
              </article>
            </div>
            <div className="icpdf-kpis icpdf-kpis-4">
              <article>
                <span>Unidades</span>
                <strong>{n(model.unitRows.length)}</strong>
                <small>
                  {n(model.fieldCyc.units)} CYC · {n(model.fieldVonu.units)} Vonú
                </small>
              </article>
              <article className={(model.confByHours ?? 0) >= META ? "is-ok" : "is-warn"}>
                <span>R%</span>
                <strong>{pct(model.confByHours)}</strong>
                <small>{n(model.failsCpw)} fallas · PP no resta</small>
              </article>
              <article className="is-ok">
                <span>CUMPLE A%</span>
                <strong>{n(model.unitRows.length - model.noCumple.length)}</strong>
                <small>CYC ≥ {(META * 100).toFixed(0)} % · Vonú ≥ {(META_VONU * 100).toFixed(0)} %</small>
              </article>
              <article className={model.noCumple.length ? "is-warn" : "is-ok"}>
                <span>NO CUMPLE</span>
                <strong>{n(model.noCumple.length)}</strong>
                <small>
                  {model.noCumple.length
                    ? model.noCumple.map((u) => u.id).join(" · ")
                    : "todas en meta"}
                </small>
              </article>
            </div>
            <div className="icpdf-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Unidad</th>
                    <th>Campo</th>
                    <th>Tplan</th>
                    <th>PP</th>
                    <th>FO</th>
                    <th>R%</th>
                    <th>A%</th>
                  </tr>
                </thead>
                <tbody>
                  {sortUnits(model.unitRows).map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.id}</strong>
                      </td>
                      <td>{u.field === "COSTAYACO" ? "CYC" : "Vonú"}</td>
                      <td>{n(u.cal)}</td>
                      <td>{n(u.pp)}</td>
                      <td>{n(u.pfContr, 0)}</td>
                      <td>{pct(u.rInd)}</td>
                      <td>{pct(u.aInd)}</td>
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
        ) : model.eventLog.length ? (
          <div className="icpdf-mto icpdf-disp icpdf-fails">
            <div className="icpdf-kpis icpdf-kpis-4">
              <article className="is-ok">
                <span>Fallas COPOWER</span>
                <strong>{n((model.gte ?? model.cpw)?.summary.copowerFailures)}</strong>
                <small>imputables</small>
              </article>
              <article>
                <span>FO-GE-033</span>
                <strong>0</strong>
                <small>no se abrió ninguno</small>
              </article>
              <article className="tone-orange">
                <span>PF cliente</span>
                <strong>{n(model.disp.fleetCpw.pf, 0)} h</strong>
                <small>todas las PF del mes</small>
              </article>
              <article>
                <span>Otras paradas</span>
                <strong>{n(model.otherDownN)}</strong>
                <small>{n(model.otherPfH, 0)} h · sin baja presión</small>
              </article>
            </div>
            <article className="icpdf-callout is-rule">
              <p>
                <span>
                  Esas horas de baja presión se sacan del listado. El resto de la bitácora sí se
                  muestra: CCM, MRU y paradas externas. Siguen siendo PF, no FO.
                </span>
              </p>
              <ul>
                <li className="is-ok">
                  <b>0</b>
                  <span>FO imputable</span>
                </li>
                <li className="is-warn">
                  <b>{n(model.otherDownN)}</b>
                  <span>eventos listados</span>
                </li>
                <li>
                  <b>R%</b>
                  <span>sin recorte</span>
                </li>
              </ul>
            </article>
            <h4 className="icpdf-table-title">
              Eventos con horas <span>top {model.topEvents.length} · sin baja presión</span>
            </h4>
            <div className="icpdf-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Equipo</th>
                    <th>h PF</th>
                    <th>Origen</th>
                    <th>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {model.topEvents.map((e, i) => (
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
          </div>
        ) : (
          <PendingBanner monthLabel={monthLabel} extra="No se digitalizaron FO-GE-033 del mes." />
        )}
      </PdfSlide>

      <PdfSlide page={8} title="Eventos repetitivos y malos actores" kicker={kicker(8, "Repetitivos")}>
        {model.eventLog.length ? (
          <div className="icpdf-mto icpdf-repeat">
            <div className="icpdf-kpis icpdf-kpis-4">
              <article className="tone-orange">
                <span>Salidas MRU</span>
                <strong>{n(model.mruCause.count)}</strong>
                <small>
                  {model.eventLog.length
                    ? `${((model.mruCause.count / model.eventLog.length) * 100).toFixed(0)} % de la bitácora`
                    : "del mes"}
                </small>
              </article>
              <article>
                <span>Horas PF de MRU</span>
                <strong>{n(model.mruCause.hours, 0)} h</strong>
                <small>
                  de {n(model.disp.fleetCpw.pf, 0)} h cliente
                  {model.disp.fleetCpw.pf
                    ? ` · ${((model.mruCause.hours / model.disp.fleetCpw.pf) * 100).toFixed(0)} %`
                    : ""}
                </small>
              </article>
              <article className="tone-violet">
                <span>Dejó de generar</span>
                <strong>{n(model.mruLostKwh / 1000, 0)} MWh</strong>
                <small>{n(model.mruLostKwh)} kWh · salidas MRU</small>
              </article>
              <article className="is-ok">
                <span>Si se estabiliza</span>
                <strong>{n(model.pfIfNoMru, 0)} h</strong>
                <small>PF que quedarían · no es máquina</small>
              </article>
            </div>
            <div className="icpdf-minicharts">
              <article>
                <h4>Salidas de MRU vs el resto</h4>
                <ul className="icpdf-bars">
                  {model.causeChart.map((row) => (
                    <li key={row.kind}>
                      <span>{row.kind}</span>
                      <b
                        className={row.kind === "MRU" ? "is-out" : undefined}
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
                <h4>Hoy vs si se estabiliza</h4>
                <ul className="icpdf-bars">
                  <li>
                    <span>PF hoy</span>
                    <b
                      className="is-out"
                      style={{
                        width: "100%",
                      }}
                    />
                    <em>{n(model.disp.fleetCpw.pf, 0)} h</em>
                  </li>
                  <li>
                    <span>PF estable</span>
                    <b
                      style={{
                        width: `${((model.pfIfNoMru || 0) / Math.max(model.disp.fleetCpw.pf || 1, 1)) * 100}%`,
                      }}
                    />
                    <em>{n(model.pfIfNoMru, 0)} h</em>
                  </li>
                  <li>
                    <span>Energía hoy</span>
                    <b
                      className="is-ok"
                      style={{
                        width: `${((model.genMwh || 0) / Math.max((model.genMwh || 0) + model.mruLostKwh / 1000, 1)) * 100}%`,
                      }}
                    />
                    <em>{n(model.genMwh, 0)} MWh</em>
                  </li>
                  <li>
                    <span>+ si no para MRU</span>
                    <b
                      className="is-low"
                      style={{
                        width: `${(model.mruLostKwh / 1000 / Math.max((model.genMwh || 0) + model.mruLostKwh / 1000, 1)) * 100}%`,
                      }}
                    />
                    <em>+{n(model.mruLostKwh / 1000, 0)} MWh</em>
                  </li>
                </ul>
              </article>
            </div>
            <EventFreq days={model.logDays} />
            <p className="icpdf-conf-foot">
              <strong>Panorama general.</strong> Por salidas de MRU, mal actor del mes, se dejó de
              generar {n(model.mruLostKwh)} kWh ({n(model.mruLostKwh / 1000, 1)} MWh). Si se
              estabiliza, ese volumen se recupera y el PF cliente baja de{" "}
              {n(model.disp.fleetCpw.pf, 0)} h a {n(model.pfIfNoMru, 0)} h.
            </p>
          </div>
        ) : (
          <PendingBanner monthLabel={monthLabel} extra="Sin bitácora no hay recurrencia que consolidar." />
        )}
      </PdfSlide>

      <PdfSlide page={9} title="Plan de mantenimiento" kicker={kicker(9, "Plan de mantenimiento")}>
        <div className="icpdf-mto icpdf-mto-plan">
          <div className="icpdf-kpis icpdf-kpis-4">
            <article>
              <span>Programados</span>
              <strong>{model.programmed.length}</strong>
              <small>sábana de {monthLabel.toLowerCase()}</small>
            </article>
            <article className="tone-blue">
              <span>Ejecutados</span>
              <strong>{model.executed.length}</strong>
              <small>
                {model.programmed.length
                  ? `${((model.executed.length / model.programmed.length) * 100).toFixed(0)} % cerrados`
                  : ""}
              </small>
            </article>
            <article className="tone-violet">
              <span>Reprogramados</span>
              <strong>{model.pending.length}</strong>
              <small>se mueven de sábana</small>
            </article>
            <article className="is-ok">
              <span>Horas MTO</span>
              <strong>{n(model.mto?.executedHoursMto)}</strong>
              <small>de {n(model.mto?.plannedHoursMto)} h plan</small>
            </article>
          </div>
          <div className="icpdf-minicharts">
            <article>
              <h4>Quién tuvo intervención</h4>
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
            <article className="icpdf-weeks-card">
              <h4>Horas plan vs ejecutadas</h4>
              <div className="icpdf-weeks" style={{ ["--n" as string]: model.weekChart.length }}>
                {model.weekChart.map((w) => {
                  const max = Math.max(...model.weekChart.flatMap((x) => [x.planned, x.executed]), 1);
                  return (
                    <div key={w.week}>
                      <div className="icpdf-weeks-col">
                        <i className="is-plan" style={{ height: `${(w.planned / max) * 100}%` }} title={`Plan ${w.planned}`} />
                        <i className="is-exec" style={{ height: `${(w.executed / max) * 100}%` }} title={`Ejec ${w.executed}`} />
                      </div>
                      <strong>{w.week}</strong>
                      <em>
                        {n(w.planned, 0)}/{n(w.executed, 0)} h
                      </em>
                    </div>
                  );
                })}
              </div>
              <p className="icpdf-weeks-leg">
                <i className="is-plan" /> Plan · <i className="is-exec" /> Ejecutado
              </p>
            </article>
          </div>
          <div className="icpdf-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>Por qué se reprogramó</th>
                </tr>
              </thead>
              <tbody>
                {(model.pending.length ? model.pending : model.recent).map((row) => (
                  <tr key={`${row.date}-${row.equipment}`}>
                    <td>{row.date.slice(5)}</td>
                    <td>{mtoEquip(row.equipment)}</td>
                    <td>{mtoWhy(row.notes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {month === "Ago" ? (
            <p className="icpdf-conf-foot">
              Próxima semana (31 ago–6 sep):{" "}
              {AGOSTO_WEEKLY_PLANNING.jobs.map((j) => `${j.equipment} ${j.code}`).join(" · ")}.
            </p>
          ) : null}
        </div>
      </PdfSlide>

      <PdfSlide page={10} title="Bodega Costayaco" kicker={kicker(10, "Bodega Costayaco")}>
        <div className="icpdf-mto icpdf-inv">
          <div className="icpdf-kpis icpdf-kpis-3">
            <article className="tone-blue">
              <span>En bodega</span>
              <strong>{n(model.invStock)}</strong>
              <small>{n(model.inv.length)} ítems del kardex</small>
            </article>
            <article className="is-ok">
              <span>Buen estado</span>
              <strong>{n(model.invStatus.find((s) => s.status === "BUENO")?.count)}</strong>
              <small>listos para usar</small>
            </article>
            <article className="tone-orange">
              <span>Bajo OC o bodega principal</span>
              <strong>{n(model.invAgotado)}</strong>
              <small>bajo orden de compra o en bodega principal</small>
            </article>
          </div>
          <div className="icpdf-minicharts">
            <article>
              <h4>Estado del kardex</h4>
              <ul className="icpdf-bars">
                {model.invStatus
                  .filter((row) => row.status !== "REVISIÓN")
                  .map((row) => (
                  <li key={row.status}>
                    <span>
                      {row.status === "AGOTADO"
                        ? "OC o bodega principal"
                        : row.status === "BAJO"
                          ? "Stock bajo"
                          : "Bueno"}
                    </span>
                    <b
                      className={
                        row.status === "BUENO"
                          ? "is-ok"
                          : row.status === "BAJO"
                            ? "is-low"
                            : "is-out"
                      }
                      style={{
                        width: `${(row.count / Math.max(...model.invStatus.filter((x) => x.status !== "REVISIÓN").map((x) => x.count), 1)) * 100}%`,
                      }}
                    />
                    <em>{row.count}</em>
                  </li>
                ))}
              </ul>
            </article>
            <article>
              <h4>Cobertura por familia</h4>
              <ul className="icpdf-bars">
                {model.invFamilies.map((row) => (
                  <li key={row.family}>
                    <span>{row.family === "S/CLASE" ? "Sin clase" : row.family}</span>
                    <b
                      className={row.family === "S/CLASE" ? "is-rev" : undefined}
                      style={{
                        width: `${(row.count / Math.max(model.invFamilies[0]?.count ?? 1, 1)) * 100}%`,
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
                  <th>Bajo OC o bodega principal</th>
                  <th>Familia</th>
                  <th>Salidas</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {model.invAgotados.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{capItem(row.description)}</strong>
                    </td>
                    <td>{familyShort(row.family) === "S/CLASE" ? "Sin clase" : familyShort(row.family)}</td>
                    <td>{row.issued}</td>
                    <td>0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="icpdf-conf-foot">
            Stock 0 en Costayaco está bajo orden de compra o en bodega principal. Se cuenta con el
            apoyo de las bodegas a disposición para Jinan.
          </p>
        </div>
      </PdfSlide>

      <PdfSlide page={11} title="Desempeño energético" kicker={kicker(11, "Eficiencia")}>
        {model.kwFlota != null && model.energyBars.length ? (
          <div className="icpdf-mto icpdf-energy">
            <div className="icpdf-kpis icpdf-kpis-4">
              <article className="is-ok">
                <span>Entrega / máquina</span>
                <strong>{n(model.avgMwhUnit, 0)} MWh</strong>
                <small>promedio de {n(model.producing)} unidades</small>
              </article>
              <article className="tone-blue">
                <span>Potencia media</span>
                <strong>{n(model.kwFlota, 0)} kW</strong>
                <small>varias máquinas en línea</small>
              </article>
              <article className="tone-violet">
                <span>Impacto vs {model.prevMonth ?? "mes ant."}</span>
                <strong>
                  {model.genMwhDelta != null
                    ? `${model.genMwhDelta >= 0 ? "+" : ""}${n(model.genMwhDelta, 0)}`
                    : "—"}
                </strong>
                <small>MWh más que el mes anterior</small>
              </article>
              <article>
                <span>Parque</span>
                <strong>{n(model.genMwh, 0)} MWh</strong>
                <small>{pct(model.gasShare, 1)} gas</small>
              </article>
            </div>
            <div className="icpdf-energy-body">
              <article>
                <h4>Cuánto entregó cada máquina · MWh</h4>
                <ul className="icpdf-bars icpdf-energy-units">
                  {model.energyBars.map((row) => (
                    <li key={row.id}>
                      <span>{row.id}</span>
                      <b
                        className={row.mwh >= (model.avgMwhUnit ?? 0) ? "is-ok" : undefined}
                        style={{
                          width: `${(row.mwh / Math.max(model.energyBars[0]?.mwh ?? 1, 1)) * 100}%`,
                        }}
                      />
                      <em>{n(row.mwh, 0)}</em>
                    </li>
                  ))}
                </ul>
              </article>
              <div className="icpdf-energy-side">
                <article>
                  <h4>Impacto en la entrega · MWh</h4>
                  <div
                    className="icpdf-energy-cols"
                    style={{
                      ["--n" as string]: model.prevGenMwh != null ? "2" : "1",
                    }}
                  >
                    {model.prevGenMwh != null ? (
                      <div>
                        <i
                          className="is-prev"
                          style={{
                            height: `${(model.prevGenMwh / Math.max(model.genMwh || 1, model.prevGenMwh, 1)) * 100}%`,
                          }}
                        />
                        <strong>{n(model.prevGenMwh, 0)}</strong>
                        <span>{model.prevMonth ?? "Antes"}</span>
                      </div>
                    ) : null}
                    <div>
                      <i className="is-now" style={{ height: "100%" }} />
                      <strong>{n(model.genMwh, 0)}</strong>
                      <span>Ago</span>
                    </div>
                  </div>
                  {model.genMwhDelta != null ? (
                    <p className="icpdf-energy-delta">
                      {model.genMwhDelta >= 0 ? "+" : ""}
                      {n(model.genMwhDelta, 0)} MWh vs {model.prevMonth}
                    </p>
                  ) : null}
                </article>
                <article>
                  <h4>Promedio por flota · MWh / máquina</h4>
                  <ul className="icpdf-energy-fleets">
                    {model.fleetChart
                      .filter((row) => row.units > 0)
                      .map((row) => (
                        <li key={row.name}>
                          <span>{row.name}</span>
                          <strong>{n(row.energy / 1000 / row.units, 0)}</strong>
                          <em>{n(row.units)} und</em>
                        </li>
                      ))}
                  </ul>
                </article>
              </div>
            </div>
            <p className="icpdf-conf-foot">
              Con {n(model.producing)} máquinas, cada una entrega en promedio {n(model.avgMwhUnit, 0)}{" "}
              MWh a {n(model.kwFlota, 0)} kW medios. El parque suma {n(model.genMwh, 1)} MWh
              {model.genMwhDelta != null
                ? ` (${model.genMwhDelta >= 0 ? "+" : ""}${n(model.genMwhDelta, 0)} vs ${model.prevMonth})`
                : ""}
              , igual al Data Soporte GTE. Diésel en Tcal 01–21.
            </p>
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
            <EmptyKpis labels={["Potencia media", "Mix gas", "Mix diésel", "Más cargada"]} />
            <PendingBanner monthLabel={monthLabel} extra="Sin generación por máquina no hay potencia media." />
          </>
        )}
      </PdfSlide>

      <PdfSlide page={12} title="Acción de mejora" kicker={kicker(12, "Controladores")}>
        <div className="icpdf-mto icpdf-agc">
          <div className="icpdf-agc-hero">
            <div className="is-out">
              <span>Controlador saliente</span>
              <strong>AGC 150</strong>
            </div>
            <em aria-hidden>→</em>
            <div className="is-in">
              <span>Controlador seleccionado</span>
              <strong>AGC-4</strong>
            </div>
          </div>
          <ul className="icpdf-agc-bens">
            <li>
              <strong>Continuidad funcional</strong>
              <span>Sincronización, load sharing / PMS y AVR / gobernador se mantienen.</span>
            </li>
            <li>
              <strong>Protección y control</strong>
              <span>Protecciones amplias más funciones avanzadas de generación y potencia.</span>
            </li>
            <li>
              <strong>Escalabilidad</strong>
              <span>Hasta 40 AGC, CAN / J1939 y configuración modular por opciones.</span>
            </li>
          </ul>
          <div className="icpdf-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>AGC 150 – Saliente</th>
                  <th>AGC-4 – Actual</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Aplicación</td>
                  <td>Control avanzado de grupos electrógenos</td>
                  <td>Control de generación y gestión de potencia</td>
                </tr>
                <tr>
                  <td>Sincronización</td>
                  <td className="is-ok">✓</td>
                  <td className="is-ok">✓</td>
                </tr>
                <tr>
                  <td>Load Sharing / PMS</td>
                  <td className="is-ok">✓</td>
                  <td className="is-ok">✓</td>
                </tr>
                <tr>
                  <td>Control AVR / Gobernador</td>
                  <td className="is-ok">✓</td>
                  <td className="is-ok">✓</td>
                </tr>
                <tr>
                  <td>Protecciones eléctricas</td>
                  <td>Amplias</td>
                  <td>Amplias + funciones avanzadas</td>
                </tr>
                <tr>
                  <td>Comunicación</td>
                  <td>CAN, RS-485, Ethernet, USB</td>
                  <td>CAN, RS-485, Ethernet, USB</td>
                </tr>
                <tr>
                  <td>Comunicación motor</td>
                  <td>CAN / J1939</td>
                  <td>CAN / J1939</td>
                </tr>
                <tr>
                  <td>Escalabilidad</td>
                  <td>Hasta 40 controladores</td>
                  <td>Hasta 40 AGC / sistemas de mayor escala</td>
                </tr>
                <tr>
                  <td>Configurabilidad</td>
                  <td>Alta</td>
                  <td>Alta / modular mediante opciones</td>
                </tr>
                <tr>
                  <td>Estado</td>
                  <td>Controlador saliente</td>
                  <td>Controlador seleccionado</td>
                </tr>
              </tbody>
            </table>
          </div>
          <article className="icpdf-agc-diesel">
            <div>
              <strong>Salen diésel</strong>
              <ul>
                {sortUnits(model.unitRows.filter((u) => u.fleet === "Cummins")).map((u) => (
                  <li key={u.id}>{u.id}</li>
                ))}
              </ul>
            </div>
            <p>
              En septiembre salen del parque. Se analizará el impacto de este cambio en la operación
              y en la entrega de energía.
            </p>
          </article>
          <p className="icpdf-conf-foot">
            El reemplazo del AGC 150 por el AGC-4 mantiene control, sincronización, protección y
            gestión de potencia, con una plataforma robusta y configurable para el sistema de
            generación.
          </p>
        </div>
      </PdfSlide>

      <PdfSlide page={13} title="Conclusiones" kicker={kicker(13, "Conclusiones")}>
        <ol className="icpdf-close-list">
          <li>
            <strong>Cierre operativo.</strong>{" "}
            {model.gte ? (
              <>
                GTE publica {pct(model.disp.dispOficial)} y COPOWER {pct(model.disp.dispCpw)} con la
                misma base OP + SB. El parque entrega {n(model.gte.kpi.generationMwh, 1)} MWh.
              </>
            ) : (
              <>
                Tras conciliar el Data Soporte GTE, el parque cierra con{" "}
                {n(model.cpw?.kpi.generationMwh ?? model.genMwh, 1)} MWh y disponibilidad{" "}
                {pct(model.disp.dispCpw)} (Tcal 24 h/día). Costayaco sostiene el sistema en paralelo
                con R% {pct(model.cycRel.r)} y cero fallas a cargo de COPOWER.
              </>
            )}
          </li>
          <li>
            <strong>Lo que no cumple no es falla.</strong>{" "}
            {model.noCumple.length
              ? `${model.noCumple.map((u) => u.id).join(", ")} ${model.noCumple.length === 1 ? "queda" : "quedan"} bajo la meta de Costayaco (≥ ${(META * 100).toFixed(0)} %) por preventivo (${n(
                  model.noCumple.reduce((s, u) => s + (u.pp ?? 0), 0),
                  0,
                )} h PP), no por FO. Vonú cumple ≥ ${(META_VONU * 100).toFixed(0)} %. El PF cliente (${n(model.disp.fleetCpw.pf, 0)} h) no resta ni A% ni R%.`
              : `Todas las unidades cumplen la meta de A%. El PF cliente (${n(
                  model.disp.fleetCpw.pf,
                  0,
                )} h) no resta disponibilidad ni confiabilidad.`}
          </li>
          <li>
            <strong>El riesgo es el gas.</strong> {n(model.mruCause.count)} salidas MRU restaron{" "}
            {n(model.mruCause.hours, 0)} h PF y {n(model.mruLostKwh / 1000, 0)} MWh. Si se estabiliza
            la MRU, el PF cliente bajaría de {n(model.disp.fleetCpw.pf, 0)} h a{" "}
            {n(model.pfIfNoMru, 0)} h. Baja presión no se contabiliza como falla.
          </li>
          <li>
            <strong>Mantenimiento y bodega.</strong> Plan MTO {n(model.executed.length)}/
            {n(model.programmed.length)} cerrado
            {model.pending.length ? ` · ${n(model.pending.length)} reprogramados` : ""}
            {model.mto
              ? ` · ${n(model.mto.executedHoursMto)} de ${n(model.mto.plannedHoursMto)} h`
              : ""}
            . Bodega con mínimos alineados al corte
            {model.invAgotado
              ? `; ${n(model.invAgotado)} referencias en OC o bodega principal`
              : ""}
            .
          </li>
          <li>
            <strong>Acción de septiembre.</strong> Reemplazo AGC 150 → AGC-4: se conservan
            sincronización, protección y gestión de potencia, con una plataforma más configurable y
            escalable.
          </li>
        </ol>
      </PdfSlide>
    </div>
  );
}
