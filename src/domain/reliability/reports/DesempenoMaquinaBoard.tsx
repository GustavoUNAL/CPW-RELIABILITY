import { CONTRACTUAL_KPI_TARGETS } from "../contracts/gteOrders";
import type { GenerationByEquipmentRow, MachineIndicatorRow } from "../types";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import { buildDisponibilidadAnalisis } from "./DisponibilidadAnalisisBoard";
import {
  GRAN_TIERRA_MONTHLY_DATA,
  type GranTierraMonthKey,
} from "./granTierraMonthly";
import { ExecInsight, INFORME_EXEC_INSIGHTS } from "./informeExecInsights";

type Props = {
  month: string;
  monthLabel?: string;
};

const META_COSTAYACO = CONTRACTUAL_KPI_TARGETS.availability * 100;
const META_VONU = 90;

type EnrichedRow = MachineIndicatorRow & {
  metaPct: number;
  op: number | null;
  pp: number | null;
  pf: number | null;
  energiaKwh: number | null;
  sistema?: boolean;
};

function fmtPct(v: number | null | undefined, digits = 2) {
  if (v == null) return "—";
  return `${v.toLocaleString("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function fmtN(v: number | null | undefined, digits = 0) {
  if (v == null) return "—";
  return v.toLocaleString("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fieldMeta(campo: string) {
  return /vonu/i.test(campo) ? META_VONU : META_COSTAYACO;
}

function fieldLabel(campo: string) {
  if (/vonu/i.test(campo)) return "Vonú";
  if (/costa/i.test(campo)) return "Costayaco";
  return campo;
}

function isSistema(u: MachineIndicatorRow) {
  return /SISTEMA/i.test(u.unidad);
}

function toneCumple(c: MachineIndicatorRow["cumplimiento"]) {
  if (c === "CUMPLE") return "ok";
  if (c === "NO CUMPLE") return "bad";
  return "na";
}

function campoOrder(campo: string) {
  if (/costa/i.test(campo)) return 0;
  if (/vonu/i.test(campo)) return 1;
  return 2;
}

function cumpleFromDisp(disp: number | null, campo: string): MachineIndicatorRow["cumplimiento"] {
  if (disp == null) return "N/A";
  return disp + 0.005 >= fieldMeta(campo) ? "CUMPLE" : "NO CUMPLE";
}

function enrich(
  rows: MachineIndicatorRow[],
  equipment: GenerationByEquipmentRow[],
): { machines: EnrichedRow[]; sistemas: EnrichedRow[] } {
  const byEq = new Map(equipment.map((u) => [u.equipo.toUpperCase(), u]));
  const all: EnrichedRow[] = rows.map((m) => {
    const eq = byEq.get(m.unidad.toUpperCase());
    const sistema = isSistema(m);
    return {
      ...m,
      metaPct: fieldMeta(m.campo),
      op: sistema
        ? equipment
            .filter((e) => e.campo.toUpperCase() === m.campo.toUpperCase())
            .reduce((s, e) => s + e.horasOperacion, 0)
        : (eq?.horasOperacion ?? null),
      pp: sistema
        ? equipment
            .filter((e) => e.campo.toUpperCase() === m.campo.toUpperCase())
            .reduce((s, e) => s + e.horasPP, 0)
        : (eq?.horasPP ?? null),
      pf: sistema
        ? equipment
            .filter((e) => e.campo.toUpperCase() === m.campo.toUpperCase())
            .reduce((s, e) => s + e.horasPFCli, 0)
        : (eq?.horasPFCli ?? null),
      energiaKwh: sistema
        ? equipment
            .filter((e) => e.campo.toUpperCase() === m.campo.toUpperCase())
            .reduce((s, e) => s + e.energiaKwh, 0)
        : (eq?.energiaKwh ?? null),
      horasStandBy: sistema
        ? equipment
            .filter((e) => e.campo.toUpperCase() === m.campo.toUpperCase())
            .reduce((s, e) => s + e.horasStandBy, 0)
        : m.horasStandBy,
      sistema,
    };
  });
  const machines = all
    .filter((r) => !r.sistema)
    .sort((a, b) => campoOrder(a.campo) - campoOrder(b.campo) || a.unidad.localeCompare(b.unidad));
  const sistemas = all
    .filter((r) => r.sistema)
    .sort((a, b) => campoOrder(a.campo) - campoOrder(b.campo));
  return { machines, sistemas };
}

function buildCopowerSistemas(month: string): MachineIndicatorRow[] {
  const cpw = COPOWER_MONTHLY_DATA[month as CopowerMonthKey];
  if (!cpw) return [];
  const byCampo = new Map<string, { op: number; sb: number; cal: number; fallas: number }>();
  for (const u of cpw.generationByEquipment) {
    const key = u.campo.toUpperCase();
    const cur = byCampo.get(key) ?? { op: 0, sb: 0, cal: 0, fallas: 0 };
    cur.op += u.horasOperacion;
    cur.sb += u.horasStandBy;
    cur.cal += u.horasCalDia;
    cur.fallas += u.fallaEvento;
    byCampo.set(key, cur);
  }
  const out: MachineIndicatorRow[] = [];
  for (const campo of ["COSTAYACO", "VONU"]) {
    const h = byCampo.get(campo);
    if (!h || h.cal <= 0) continue;
    const disp = ((h.op + h.sb) / h.cal) * 100;
    out.push({
      unidad: "SISTEMA N",
      campo,
      horasStandBy: h.sb,
      disponibilidadPct: Number(disp.toFixed(2)),
      confiabilidadPct: Number(disp.toFixed(2)),
      fallas: h.fallas,
      mtbfLabel: h.fallas > 0 ? "—" : "Sin Fallas",
      mttrHours: null,
      riesgoTecnico: disp + 0.005 >= fieldMeta(campo) ? "RIESGO BAJO" : "RIESGO ALTO",
      cumplimiento: cumpleFromDisp(disp, campo),
      detalle: `Concertación · (OP + SB) / calendario · ${Math.round(h.op + h.sb)} / ${Math.round(h.cal)} h`,
    });
  }
  return out;
}

export function buildDesempenoMaquina(month: string) {
  const gte = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey];
  const cpw = COPOWER_MONTHLY_DATA[month as CopowerMonthKey];
  const disp = buildDisponibilidadAnalisis(month);

  const gtePack = enrich(gte?.machineIndicators ?? [], gte?.generationByEquipment ?? []);
  const cpwMachines = (cpw?.machineIndicators ?? [])
    .filter((r) => !isSistema(r))
    .map((r) => ({
      ...r,
      cumplimiento:
        r.cumplimiento !== "N/A" ? r.cumplimiento : cumpleFromDisp(r.disponibilidadPct, r.campo),
    }));
  const cpwPack = enrich(
    [...cpwMachines, ...buildCopowerSistemas(month)],
    cpw?.generationByEquipment ?? [],
  );

  return {
    gte: gtePack,
    cpw: cpwPack,
    dispGte: gte?.kpi.availability != null ? gte.kpi.availability * 100 : null,
    dispCpw: disp.dispCpw != null ? disp.dispCpw * 100 : null,
  };
}

function IndicatorRow({ m }: { m: EnrichedRow }) {
  const underMeta =
    m.disponibilidadPct != null && m.disponibilidadPct + 0.005 < m.metaPct;

  return (
    <tr
      className={[
        m.cumplimiento === "NO CUMPLE" ? "maq-row-bad" : "",
        m.sistema ? "maq-row-sistema" : "",
      ]
        .filter(Boolean)
        .join(" ") || undefined}
      title={m.detalle ?? undefined}
    >
      <td>
        <strong>{m.sistema ? `Sistema · ${fieldLabel(m.campo)}` : m.unidad}</strong>
      </td>
      <td>{fieldLabel(m.campo)}</td>
      <td>≥ {fmtPct(m.metaPct, 0)}</td>
      <td className={underMeta ? "maq-num-warn" : undefined}>{fmtPct(m.disponibilidadPct)}</td>
      <td>{fmtPct(m.confiabilidadPct)}</td>
      <td>{fmtN(m.op)}</td>
      <td>{fmtN(m.horasStandBy)}</td>
      <td>{fmtN(m.pp)}</td>
      <td>{fmtN(m.pf)}</td>
      <td>{m.fallas}</td>
      <td>{m.mtbfLabel === "Sin Fallas" ? "—" : m.mtbfLabel}</td>
      <td>
        <span
          className={`maq-risk ${
            m.riesgoTecnico.includes("ALTO")
              ? "alto"
              : m.riesgoTecnico.includes("MEDIO")
                ? "medio"
                : "bajo"
          }`}
        >
          {m.riesgoTecnico.replace("RIESGO ", "")}
        </span>
      </td>
      <td>
        <span className={`maq-pill ${toneCumple(m.cumplimiento)}`}>{m.cumplimiento}</span>
      </td>
    </tr>
  );
}

function SourceTable({
  title,
  badge,
  headline,
  basis,
  machines,
  sistemas,
  tone,
  insight,
}: {
  title: string;
  badge: string;
  headline: string;
  basis: string;
  machines: EnrichedRow[];
  sistemas: EnrichedRow[];
  tone: "gte" | "cpw";
  insight?: string;
}) {
  return (
    <div className={`maq-source-table maq-source-${tone}`}>
      {insight ? <ExecInsight text={insight} className="inf-exec-insight--nested" /> : null}
      <header>
        <div>
          <p className="eyebrow">{title}</p>
          <strong>{headline}</strong>
          <small className="maq-source-basis">{basis}</small>
        </div>
        <span className={`maq-source-badge ${tone}`}>{badge}</span>
      </header>
      <div className="maq-table-slide">
        <table>
          <thead>
            <tr>
              <th>Unidad</th>
              <th>Campo</th>
              <th>Meta %</th>
              <th>Disp. %</th>
              <th>Conf. %</th>
              <th>OP h</th>
              <th>SB h</th>
              <th>PP h</th>
              <th>Ext h</th>
              <th>Fallas</th>
              <th>MTBF</th>
              <th>Riesgo</th>
              <th>Cumple</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((m) => (
              <IndicatorRow key={`${tone}-${m.campo}-${m.unidad}`} m={m} />
            ))}
            {sistemas.map((m) => (
              <IndicatorRow key={`${tone}-sistema-${m.campo}`} m={m} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DesempenoMaquinaBoard({ month, monthLabel }: Props) {
  const a = buildDesempenoMaquina(month);
  const period = monthLabel ?? month;
  if (!a.gte.machines.length && !a.cpw.machines.length) {
    return (
      <section className="panel">
        <article className="card">
          <p className="eyebrow">6 · Indicadores de desempeño por máquina</p>
          <p className="empty-state">Sin indicadores por unidad para este periodo.</p>
        </article>
      </section>
    );
  }

  return (
    <section className="panel">
      <details className="card disp-analisis maq-board maq-board-slide inf-conf-collapse" open>
        <summary className="inf-conf-collapse-sum">
          <div className="inf-conf-collapse-sum-main">
            <p className="eyebrow">6 · Indicadores de desempeño por máquina{period ? ` · ${period}` : ""}</p>
            <h3>Disponibilidad GTE y COPOWER por unidad y campo</h3>
          </div>
          <div className="maq-meta-strip" aria-label="Metas contractuales Orden 1">
            <span>Orden 1</span>
            <strong>Costayaco ≥ {META_COSTAYACO.toFixed(0)} %</strong>
            <em>Vonú ≥ {META_VONU} %</em>
          </div>
        </summary>
        <div className="inf-conf-collapse-body">
        <div className="maq-stack">
          <SourceTable
            title="Disponibilidad GTE"
            badge="Informe"
            headline={`${fmtPct(a.dispGte)} %`}
            basis="Base: anexo oficial GTE. Las filas Sistema replican el dashboard del informe, no el promedio de las unidades."
            machines={a.gte.machines}
            sistemas={a.gte.sistemas}
            tone="gte"
            insight={INFORME_EXEC_INSIGHTS.maquinasGte}
          />
          <SourceTable
            title="Disponibilidad COPOWER"
            badge="Concertación"
            headline={`${fmtPct(a.dispCpw)} %`}
            basis="Base: (OP + SB) / calendario sobre horas concertadas. Las filas Sistema se recalculan desde las unidades del campo."
            machines={a.cpw.machines}
            sistemas={a.cpw.sistemas}
            tone="cpw"
            insight={INFORME_EXEC_INSIGHTS.maquinasCopower}
          />
        </div>
        </div>
      </details>
    </section>
  );
}
