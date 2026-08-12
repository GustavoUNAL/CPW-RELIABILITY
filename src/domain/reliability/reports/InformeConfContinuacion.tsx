import { useMemo, useState } from "react";
import { FailureEventsView } from "./FailureEventsView";
import { EventInsightsDashboard } from "./EventInsightsDashboard";
import { InventoryMinimumsDashboard } from "./InventoryMinimumsDashboard";
import { DegradationRiskDashboard } from "./DegradationRiskDashboard";
import { EXEC_JUN } from "./executiveJune2026";
import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import { buildDisponibilidadAnalisis } from "./DisponibilidadAnalisisBoard";
import { buildConfiabilidadAnalisis } from "./ConfiabilidadAnalisisBoard";
import { EditableEventDetail } from "../rca/components/EditableEventDetail";
import { equipoLabel, RCA_COSTAYACO_EVENTOS } from "../rca/data";
import {
  loadCostayacoRcaEvents,
  persistCostayacoRcaEvents,
  upsertCostayacoRcaEvent,
} from "../rca/rcaEventStore";
import type { RcaEventoFalla } from "../rca/types";
import { INVENTORY_MINIMUMS } from "./inventoryMinimumsData";

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

type MonthProps = {
  month: string;
  monthLabel: string;
};

function SectionHead({
  n,
  title,
  sub,
  badge,
}: {
  n: number;
  title: string;
  sub?: string;
  badge?: string;
}) {
  return (
    <header className="disp-analisis-head maq-head-slide inf-conf-sec-head">
      <div>
        <p className="eyebrow">
          {n} · {title}
        </p>
        {sub ? <h3>{sub}</h3> : null}
      </div>
      {badge ? <span className="maq-source-badge gte">{badge}</span> : null}
    </header>
  );
}

function fmtPct(v: number) {
  return `${(v * 100).toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`;
}

function fmtH(v: number) {
  return `${v.toLocaleString("es-CO", {
    minimumFractionDigits: v % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })} h`;
}

function fmtDay(iso: string | null | undefined) {
  if (!iso) return "—";
  const [, m, d] = iso.split("-");
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const mi = Number(m) - 1;
  return `${Number(d)} ${months[mi] ?? m}`;
}

/** 7 · Análisis de fallas */
export function InformeConfFallasSection({ month, monthLabel }: MonthProps) {
  const conf = buildConfiabilidadAnalisis(month);
  const confPct =
    conf.gteConf != null
      ? fmtPct(conf.gteConf)
      : conf.contractualConf != null
        ? fmtPct(conf.contractualConf)
        : "—";

  const [rcaEvents, setRcaEvents] = useState<RcaEventoFalla[]>(() => loadCostayacoRcaEvents());
  const monthPrefix = MONTH_ISO[month] ? `2026-${MONTH_ISO[month]}` : "";
  const periodRca = useMemo(() => {
    const byId = new Map(rcaEvents.map((e) => [e.id, e]));
    const fromConf = conf.rows
      .map((r) => byId.get(r.fo.id) ?? r.fo)
      .sort(
        (a, b) =>
          (a.fecha ?? "").localeCompare(b.fecha ?? "") ||
          (a.hora ?? "").localeCompare(b.hora ?? ""),
      );
    if (fromConf.length > 0) return fromConf;
    return rcaEvents
      .filter((e) => (e.fecha ?? "").startsWith(monthPrefix))
      .sort(
        (a, b) =>
          (a.fecha ?? "").localeCompare(b.fecha ?? "") ||
          (a.hora ?? "").localeCompare(b.hora ?? ""),
      );
  }, [rcaEvents, conf.rows, monthPrefix]);

  const handleRcaSave = (next: RcaEventoFalla) => {
    setRcaEvents((prev) => {
      const updated = upsertCostayacoRcaEvent(prev, next);
      persistCostayacoRcaEvents(updated);
      return updated;
    });
  };

  const openRelatedRca = (id: string) => {
    const el = document.getElementById(`inf-conf-rca-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="panel">
      <article className="card disp-analisis maq-board-slide inf-conf-sec inf-conf-fallas-unified">
        <SectionHead
          n={7}
          title={`Análisis de fallas · ${monthLabel}`}
          sub="Resumen de formatos de ocurrencia FO-GE-033"
          badge="GTE"
        />
        <div className="inf-conf-fallas-kpis" aria-label="Indicadores demostrados del periodo">
          <article>
            <span>Formatos de ocurrencia FO-GE-033</span>
            <strong>{conf.rows.length}</strong>
            <small>{conf.imputables.length} imputables al contratista</small>
          </article>
          <article>
            <span>Confiabilidad</span>
            <strong>{confPct}</strong>
            <small>Misma regla del informe oficial</small>
          </article>
          <article>
            <span>Marcas sin formato de ocurrencia</span>
            <strong>{conf.orphanMarks.length}</strong>
            <small>Concertación · no bajan confiabilidad</small>
          </article>
          <article>
            <span>Parada por falla del contratista</span>
            <strong>{fmtH(conf.pfContr)}</strong>
            <small>Horas PF_contr del periodo</small>
          </article>
        </div>

        <div className="inf-conf-fallas-slide">
          <div className="inf-conf-fo-resumen">
            <p className="eyebrow">Eventos de falla del periodo · {conf.rows.length} FO-GE-033</p>
            <ol className="inf-conf-fo-list">
              {conf.rows.map((r) => (
                <li key={r.fo.id}>
                  <header>
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noreferrer">
                        {r.foLabel}
                      </a>
                    ) : (
                      <strong>{r.foLabel}</strong>
                    )}
                    <span>
                      {fmtDay(r.fo.fecha)}
                      {r.fo.hora ? ` · ${r.fo.hora}` : ""}
                    </span>
                    <em className={r.imputable ? "imp" : "ext"}>
                      {r.imputable ? "Imputable" : "No imputable"}
                    </em>
                  </header>
                  <p>{r.fo.titulo}</p>
                  <small>
                    {equipoLabel(r.fo.equipo)}
                    {r.fo.duracion_horas != null ? ` · fuera de servicio ${fmtH(r.fo.duracion_horas)}` : ""}
                    {r.fo.clasificacion?.tipo ? ` · ${r.fo.clasificacion.tipo}` : ""}
                  </small>
                </li>
              ))}
              {conf.rows.length === 0 ? (
                <li className="empty">Sin formatos de ocurrencia FO-GE-033 en el periodo.</li>
              ) : null}
            </ol>
          </div>
          <FailureEventsView
            month={month}
            monthLabel={monthLabel}
            mode="gte"
            failuresOnlyDefault
            informeStats
            embedded
            hideStatsPanel
            hideEventLists
          />
        </div>

        {periodRca.length > 0 ? (
          <div className="inf-conf-rca-stack">
            <header className="inf-conf-rca-stack-head">
              <p className="eyebrow">Fichas RCA · {monthLabel}</p>
              <h3>
                Detalle FO-GE-033 · {periodRca.length} evento{periodRca.length === 1 ? "" : "s"}
              </h3>
              <p className="muted">
                Misma presentación slide que RCA Costayaco (resumen, timeline, causas, 5 porqués y
                cierre).
              </p>
            </header>
            {periodRca.map((evento) => (
              <div key={evento.id} id={`inf-conf-rca-${evento.id}`} className="inf-conf-rca-item">
                <EditableEventDetail
                  event={evento}
                  compact
                  readOnly
                  onSave={handleRcaSave}
                  onOpenRelated={openRelatedRca}
                />
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}

/** 8 · Eventos repetitivos y malos actores */
export function InformeConfRepetitivosSection({ month, monthLabel }: MonthProps) {
  return (
    <section className="panel">
      <article className="card disp-analisis maq-board-slide inf-conf-sec">
        <SectionHead
          n={8}
          title={`Eventos repetitivos y malos actores · ${monthLabel}`}
          sub="Recurrencia e impacto operacional"
          badge="GTE"
        />
        <p className="inf-conf-sec-lead">
          Misma lectura que en junio: equipos y causas que se repiten, y unidades con mayor impacto
          (IIO) en el periodo.
        </p>
        {month === "Jul" ? (
          <div className="inf-conf-vs-box">
            <p className="eyebrow">Julio vs junio</p>
            <ul>
              <li>
                <strong>Fallas imputables:</strong> junio {EXEC_JUN.failures} (foco {EXEC_JUN.focalUnit})
                → julio 0 en el KPI de confiabilidad.
              </li>
              <li>
                <strong>Patrón del mes:</strong> cascadas MRU / externas (FO-GE-033) y marcas de
                concertación sin FO; no reaparece el cluster de PF_contr de junio (
                {EXEC_JUN.hoursPfContr} h).
              </li>
            </ul>
          </div>
        ) : null}
      </article>
      <EventInsightsDashboard
        report="gran_tierra"
        month={month}
        monthLabel={monthLabel}
        mode="repetitivos"
      />
      <EventInsightsDashboard
        report="gran_tierra"
        month={month}
        monthLabel={monthLabel}
        mode="badactors"
      />
    </section>
  );
}

/** 9 · Mínimos de inventario */
export function InformeConfInventarioSection({ monthLabel }: { monthLabel: string }) {
  return (
    <section className="panel">
      <article className="card disp-analisis maq-board-slide inf-conf-sec">
        <SectionHead
          n={9}
          title={`Mínimos de inventario · ${monthLabel}`}
          sub="Cobertura de críticos vs. mínimo contractual"
          badge="Activos"
        />
        <p className="inf-conf-sec-lead">
          Catálogo vigente ({INVENTORY_MINIMUMS.items.length} ítems). Referencia del periodo{" "}
          {monthLabel}; la base es la misma plataforma usada en el cierre de junio.
        </p>
      </article>
      <InventoryMinimumsDashboard hideCatalogTable embedded />
    </section>
  );
}

/** 10 · Tendencias de degradación y riesgos (vs junio) */
export function InformeConfDegradacionSection({ monthLabel }: { monthLabel: string }) {
  return (
    <section className="panel">
      <article className="card disp-analisis maq-board-slide inf-conf-sec">
        <SectionHead
          n={10}
          title={`Tendencias de degradación y riesgos · ${monthLabel}`}
          sub="Comparación con el portafolio de junio"
          badge="APM"
        />
        <p className="inf-conf-sec-lead">
          El motor APM conserva el portafolio Costayaco calibrado en junio (seed GTE). Abajo se
          muestra ese baseline y, en la caja, el contraste operativo de julio frente a junio.
        </p>
        <div className="inf-conf-vs-box">
          <p className="eyebrow">Julio vs junio</p>
          <ul>
            <li>
              <strong>Disponibilidad sistema:</strong> junio {(EXEC_JUN.availability * 100).toFixed(2)}{" "}
              % → julio 80,65 % (−17,27 pp).
            </li>
            <li>
              <strong>Confiabilidad:</strong> junio {(EXEC_JUN.reliability * 100).toFixed(2)} % → julio
              100 % (0 FO imputables).
            </li>
            <li>
              <strong>Fallas imputables:</strong> junio {EXEC_JUN.failures} → julio 0 en el KPI
              (FO externas; marcas de concertación no bajan Conf).
            </li>
            <li>
              <strong>Riesgo APM:</strong> activos AGC4 / preventivo (CPW01–03) y cascadas MRU
              concentran la presión de julio sobre el baseline de junio.
            </li>
          </ul>
        </div>
      </article>
      <DegradationRiskDashboard monthLabel={`${monthLabel} · baseline junio`} />
    </section>
  );
}

/** 11 · Conclusiones */
export function ConclusionesConfiabilidadBoard({ month, monthLabel }: MonthProps) {
  const gte = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey];
  const cpw = COPOWER_MONTHLY_DATA[month as CopowerMonthKey];
  const disp = buildDisponibilidadAnalisis(month);
  const prefix = month === "Jul" ? "2026-07" : month === "Jun" ? "2026-06" : "";
  const fos = RCA_COSTAYACO_EVENTOS.filter((e) => (e.fecha ?? "").startsWith(prefix));
  const dispGte = gte?.kpi.availability != null ? gte.kpi.availability * 100 : null;
  const confGte = gte?.kpi.reliability != null ? gte.kpi.reliability * 100 : null;
  const dispCpw = disp.dispCpw != null ? disp.dispCpw * 100 : null;
  const deltaDisp =
    dispGte != null ? Number((dispGte - EXEC_JUN.availability * 100).toFixed(2)) : null;
  const noCumple =
    gte?.machineIndicators.filter(
      (m) => m.cumplimiento === "NO CUMPLE" && !/SISTEMA/i.test(m.unidad),
    ) ?? [];

  return (
    <section className="panel">
      <article className="card disp-analisis maq-board-slide inf-conf-sec inf-conf-conclusiones">
        <SectionHead
          n={11}
          title={`Conclusiones · ${monthLabel}`}
          sub="Cierre del informe de confiabilidad"
          badge="Orden 1"
        />

        <div className="inf-conf-concl-kpis">
          <article>
            <span>Disp. GTE</span>
            <strong>{dispGte != null ? `${dispGte.toFixed(2)} %` : "—"}</strong>
            <small>
              vs jun {(EXEC_JUN.availability * 100).toFixed(2)} %
              {deltaDisp != null ? ` (${deltaDisp > 0 ? "+" : ""}${deltaDisp} pp)` : ""}
            </small>
          </article>
          <article>
            <span>Disp. COPOWER</span>
            <strong>{dispCpw != null ? `${dispCpw.toFixed(2)} %` : "—"}</strong>
            <small>Concertación · OP + stand-by</small>
          </article>
          <article>
            <span>Confiabilidad</span>
            <strong>{confGte != null ? `${confGte.toFixed(2)} %` : "—"}</strong>
            <small>vs jun {(EXEC_JUN.reliability * 100).toFixed(2)} %</small>
          </article>
          <article>
            <span>FO-GE-033</span>
            <strong>{fos.length}</strong>
            <small>0 imputables al contratista</small>
          </article>
        </div>

        <div className="rep-conclusions inf-conf-concl-copy">
          {month === "Jul" ? (
            <>
              <p>
                Julio cierra con <strong>confiabilidad 100 %</strong> (sin FO imputables) y
                disponibilidad oficial <strong>80,65 %</strong>, 17,27 pp por debajo de junio (
                {(EXEC_JUN.availability * 100).toFixed(2)} %). La lectura COPOWER de concertación
                sostiene <strong>{dispCpw != null ? `${dispCpw.toFixed(2)} %` : "97,73 %"}</strong>{" "}
                con la misma fórmula (OP + SB) / calendario: el hueco no es de fórmula, sino de
                horas que el informe aún no desglosa.
              </p>
              <p>
                El parque registró <strong>{fos.length} formatos de ocurrencia FO-GE-033</strong>{" "}
                (cascadas MRU y detonación CPW-04), todos externos a los grupos. Las marcas de
                concertación (CPW06 / CPW07) no tienen FO y no mueven parada por falla del
                contratista. En cumplimiento por máquina, GTE marca fuera de meta a{" "}
                <strong>{noCumple.map((m) => m.unidad).join(", ") || "ninguna"}</strong>{" "}
                (AGC4 / preventivo); COPOWER añade unidades cuya Disp (OP+SB) queda bajo 98 %.
              </p>
              <p>
                Frente a junio (MTBF {EXEC_JUN.mtbfHours.toFixed(0)} h · {EXEC_JUN.failures} fallas
                imputables · foco {EXEC_JUN.focalUnit}), julio prioriza: (1) obtener de Gran Tierra
                el desglose de horas del 80,65 %; (2) cerrar causas MRU / Soenergy y la frontera
                FO-60 gas MQT; (3) sostener el plan AGC4 y el baseline APM de junio sobre activos
                críticos; (4) vigilar mínimos de inventario y reincidencias de cascada. Meta Orden
                1: Disp / Conf ≥ 98 %.
              </p>
            </>
          ) : (
            <>
              <p>
                El desempeño de {monthLabel} permite cerrar el ciclo de confiabilidad con la misma
                estructura del informe de junio: indicadores, conciliación, máquinas, fallas,
                repetitivos, inventario y degradación.
              </p>
              <p>
                Generación {cpw?.kpi.generationMwh != null ? `${cpw.kpi.generationMwh.toFixed(1)} MWh` : "N/D"}{" "}
                · Disp. GTE {dispGte != null ? `${dispGte.toFixed(2)} %` : "N/D"} · Conf.{" "}
                {confGte != null ? `${confGte.toFixed(2)} %` : "N/D"}. Priorizar activos fuera de
                meta y el cierre documental de FO / RCA del periodo.
              </p>
            </>
          )}
        </div>
      </article>
    </section>
  );
}

/** Bloque completo 7–11 para el resumen de Informes · Confiabilidad */
export function InformeConfContinuacion({ month, monthLabel }: MonthProps) {
  return (
    <>
      <InformeConfFallasSection month={month} monthLabel={monthLabel} />
      <InformeConfRepetitivosSection month={month} monthLabel={monthLabel} />
      <InformeConfInventarioSection monthLabel={monthLabel} />
      <InformeConfDegradacionSection monthLabel={monthLabel} />
      <ConclusionesConfiabilidadBoard month={month} monthLabel={monthLabel} />
    </>
  );
}
