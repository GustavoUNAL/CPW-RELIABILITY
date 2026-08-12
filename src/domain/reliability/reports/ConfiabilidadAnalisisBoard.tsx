import { equipoLabel, RCA_COSTAYACO_EVENTOS } from "../rca/data";
import type { RcaEventoFalla } from "../rca/types";
import type { EventRecord } from "../types";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import {
  GRAN_TIERRA_MONTHLY_DATA,
  type GranTierraMonthKey,
} from "./granTierraMonthly";
import { RCA_DELIVERED_DOCUMENTS } from "./rcaDocuments";
import { ExecInsight, INFORME_EXEC_INSIGHTS } from "./informeExecInsights";

type Props = {
  month: string;
  monthLabel?: string;
};

const MONTH_ISO: Record<string, string> = {
  Ene: "01",
  Feb: "02",
  Mar: "03",
  Abr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Ago: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dic: "12",
};

function fmtPct(v: number, digits = 2) {
  return `${(v * 100).toLocaleString("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} %`;
}

function fmtH(v: number) {
  return `${v.toLocaleString("es-CO", {
    minimumFractionDigits: v % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })} h`;
}

function monthPrefix(month: string, year = 2026) {
  const mm = MONTH_ISO[month];
  return mm ? `${year}-${mm}` : "";
}

function foNumber(evento: RcaEventoFalla) {
  const fromFuente = /FO-GE-033\s+No\.\s*(\d+)/i.exec(evento.fuente ?? "");
  if (fromFuente) return `FO-${fromFuente[1]}`;
  const day = evento.fecha ?? "";
  const doc = RCA_DELIVERED_DOCUMENTS.find((d) => d.eventDate === day);
  return doc?.sequential ?? "—";
}

function foDigits(label: string) {
  const m = /(\d+)/.exec(label);
  return m?.[1] ?? "";
}

function foUrl(evento: RcaEventoFalla) {
  const n = foNumber(evento);
  const doc = RCA_DELIVERED_DOCUMENTS.find(
    (d) => d.sequential === n || d.eventDate === (evento.fecha ?? ""),
  );
  return doc?.url;
}

function isImputable(evento: RcaEventoFalla) {
  const tipo = (evento.clasificacion?.tipo ?? "").toLowerCase();
  if (tipo.includes("externa")) return false;
  return (evento.responsable ?? "").trim().toUpperCase() === "COPOWER";
}

function fmtDay(iso: string | null) {
  if (!iso) return "—";
  const [, m, d] = iso.split("-");
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const mi = Number(m) - 1;
  return `${Number(d)} ${months[mi] ?? m}`;
}

function normEq(s: string) {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function equiposOf(evento: RcaEventoFalla) {
  return (Array.isArray(evento.equipo) ? evento.equipo : [evento.equipo])
    .filter(Boolean)
    .map((e) => normEq(e));
}

function foFromNotes(notes: string) {
  const m = /FO-GE-033\s+No\.\s*(\d+)/i.exec(notes);
  return m ? `FO-${m[1]}` : null;
}

type LinkedMark = {
  event: EventRecord;
  how: "fo" | "fecha-equipo";
};

function linkMarks(evento: RcaEventoFalla, log: EventRecord[]): LinkedMark[] {
  const n = foNumber(evento);
  const digits = foDigits(n);
  const eqs = new Set(equiposOf(evento));
  const seen = new Set<string>();
  const out: LinkedMark[] = [];
  for (const row of log) {
    const key = `${row.date}|${row.equipment}|${row.eventType}`;
    const byFo = digits && foFromNotes(row.notes ?? "") === n;
    const byEq = row.date === evento.fecha && eqs.has(normEq(row.equipment));
    if (!byFo && !byEq) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ event: row, how: byFo ? "fo" : "fecha-equipo" });
  }
  return out;
}

function markSummary(links: LinkedMark[]) {
  if (links.length === 0) return "No aparece como falla en el Excel";
  const fallas = links.filter((l) => l.event.eventType === "Falla");
  if (fallas.length > 0) {
    return `Misma bitácora · ${fallas.map((l) => l.event.equipment).join(", ")}`;
  }
  const tipos = [...new Set(links.map((l) => l.event.eventType.toLowerCase()))];
  return `Bitácora como ${tipos.join(" / ")} · no suma falla`;
}

export function buildConfiabilidadAnalisis(month: string) {
  const prefix = monthPrefix(month);
  const cpw = COPOWER_MONTHLY_DATA[month as CopowerMonthKey];
  const gte = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey];
  const log = cpw?.eventLog ?? [];
  const fos = RCA_COSTAYACO_EVENTOS.filter((e) => (e.fecha ?? "").startsWith(prefix)).sort((a, b) =>
    (a.fecha ?? "").localeCompare(b.fecha ?? "") || (a.hora ?? "").localeCompare(b.hora ?? ""),
  );
  const foNums = new Set(fos.map((e) => foNumber(e)));
  const concertacionFallas = log.filter((e) => e.eventType === "Falla");
  const orphanMarks = concertacionFallas.filter((e) => {
    const tagged = foFromNotes(e.notes ?? "");
    if (tagged && foNums.has(tagged)) return false;
    return !fos.some((fo) => fo.fecha === e.date && equiposOf(fo).includes(normEq(e.equipment)));
  });
  const rows = fos.map((fo) => {
    const links = linkMarks(fo, log);
    const imputable = isImputable(fo);
    return {
      fo,
      foLabel: foNumber(fo),
      url: foUrl(fo),
      links,
      imputable,
      concertacion: markSummary(links),
    };
  });
  const imputables = rows.filter((r) => r.imputable);
  const contractualConf = imputables.length === 0 ? 1 : null;
  const pfContr = cpw?.summary.hoursFailureCopower ?? 0;
  const gteConf = gte?.kpi.reliability ?? null;

  return {
    rows,
    orphanMarks,
    imputables,
    contractualConf,
    pfContr,
    gteConf,
    sameOnContract:
      gteConf != null && contractualConf != null && Math.abs(gteConf - contractualConf) < 0.0005,
  };
}

export function ConfiabilidadAnalisisBoard({ month, monthLabel }: Props) {
  const a = buildConfiabilidadAnalisis(month);
  const period = monthLabel ?? month;

  return (
    <section className="panel">
      <details className="card disp-analisis conf-analisis inf-conf-collapse" open>
        <summary className="inf-conf-collapse-sum">
          <div className="inf-conf-collapse-sum-main">
            <p className="eyebrow">5 · Análisis de confiabilidad{period ? ` · ${period}` : ""}</p>
            <h3>Justificación de confiabilidad 100 %</h3>
          </div>
          <div className="disp-formula" aria-label="Confiabilidad contractual: 100 por ciento si no hay formatos de ocurrencia imputables">
            <span className="disp-formula-name">Confiabilidad</span>
            <span className="disp-formula-op">=</span>
            <span className="disp-formula-frac">
              <span>0 formatos de ocurrencia imputables</span>
              <span>regla del anexo Gran Tierra</span>
            </span>
            <span className="disp-formula-op">→</span>
            <span className="disp-formula-100">100 %</span>
          </div>
        </summary>
        <div className="inf-conf-collapse-body">
        <ExecInsight text={INFORME_EXEC_INSIGHTS.confiabilidad} />
        <div className="disp-kpi-row">
          <article className="disp-kpi disp-kpi-gte">
            <span>Gran Tierra · informe</span>
            <strong>{a.gteConf != null ? fmtPct(a.gteConf) : "—"}</strong>
            <p>
              <b>{a.imputables.length}</b> formatos de ocurrencia imputables / {a.rows.length} reportes
            </p>
            <small>Formatos de ocurrencia externos no entran al indicador</small>
          </article>
          <article className="disp-kpi disp-kpi-cpw">
            <span>COPOWER · misma regla</span>
            <strong>{a.contractualConf != null ? fmtPct(a.contractualConf) : "—"}</strong>
            <p>
              Parada por falla del contratista <b>{fmtH(a.pfContr)}</b>
            </p>
            <small>Ningún formato de ocurrencia deja la falla en COPOWER</small>
          </article>
        </div>

        <p className={a.sameOnContract ? "disp-implied conf-implied-ok" : "disp-implied"}>
          {a.sameOnContract ? (
            <>
              Los {a.rows.length} formatos de ocurrencia FO-GE-033 del mes clasifican la falla como
              externa a los grupos. Parada por falla del contratista {fmtH(a.pfContr)}. Por eso{" "}
              <b>confiabilidad = {fmtPct(a.gteConf ?? 1)}</b> en ambas lecturas.
            </>
          ) : (
            <>
              Con la regla de formatos de ocurrencia imputables el mes no cierra igual. Revisar
              clasificación de los reportes FO-GE-033 frente al{" "}
              {a.gteConf != null ? fmtPct(a.gteConf) : "indicador"} del informe.
            </>
          )}
        </p>

        <div className="disp-units conf-one-table">
          <p className="eyebrow">Formatos de ocurrencia FO-GE-033 y su rastro en horas concertadas</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Formato</th>
                  <th>Fecha</th>
                  <th>Qué ocurrió</th>
                  <th>En el Excel</th>
                  <th>Imputable</th>
                </tr>
              </thead>
              <tbody>
                {a.rows.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Sin formatos de ocurrencia FO-GE-033 en el periodo.</td>
                  </tr>
                ) : (
                  a.rows.map((r) => (
                    <tr key={r.fo.id} className={r.imputable ? "conf-row-imp" : undefined}>
                      <td>
                        {r.url ? (
                          <a href={r.url} target="_blank" rel="noreferrer">
                            {r.foLabel}
                          </a>
                        ) : (
                          r.foLabel
                        )}
                      </td>
                      <td>
                        {fmtDay(r.fo.fecha)}
                        {r.fo.hora ? ` · ${r.fo.hora}` : ""}
                      </td>
                      <td>
                        {r.fo.titulo}
                        <small>
                          {equipoLabel(r.fo.equipo)} · fuera de servicio{" "}
                          {r.fo.duracion_horas != null ? fmtH(r.fo.duracion_horas) : "—"} ·{" "}
                          {r.fo.clasificacion?.tipo ?? "—"}
                        </small>
                      </td>
                      <td>{r.concertacion}</td>
                      <td>{r.imputable ? "Sí" : "No"}</td>
                    </tr>
                  ))
                )}
                {a.orphanMarks.map((e) => (
                  <tr key={`orphan-${e.date}-${e.equipment}`}>
                    <td>—</td>
                    <td>{fmtDay(e.date)}</td>
                    <td>
                      {e.cause}
                      <small>{e.equipment} · no se emitió formato de ocurrencia FO-GE-033</small>
                    </td>
                    <td>Anotación de bitácora · no entra a confiabilidad</td>
                    <td>No</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </details>
    </section>
  );
}
