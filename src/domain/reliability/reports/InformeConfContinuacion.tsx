import { type ReactNode, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FailureEventsView } from "./FailureEventsView";
import { EventInsightsDashboard } from "./EventInsightsDashboard";
import { EficienciaInformeSlide } from "./EficienciaInformeSlide";
import { buildEnergyEfficiency } from "./energyEfficiency";
import { buildUnitEfficiency } from "./unitEfficiency";
import { MantenimientoInformeSlide } from "./MantenimientoInformeSlide";
import { RepetitivosInformeSlide } from "./RepetitivosInformeSlide";
import { InventoryMinimumsDashboard } from "./InventoryMinimumsDashboard";
import { DegradationRiskDashboard } from "./DegradationRiskDashboard";
import { EXEC_JUN } from "./executiveJune2026";
import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";
import { buildDisponibilidadAnalisis } from "./DisponibilidadAnalisisBoard";
import { buildConfiabilidadAnalisis } from "./ConfiabilidadAnalisisBoard";
import { enrichEventLog } from "../events/eventLogUtils";
import { EditableEventDetail } from "../rca/components/EditableEventDetail";
import { equipoLabel, RCA_COSTAYACO_EVENTOS } from "../rca/data";
import {
  loadCostayacoRcaEvents,
  persistCostayacoRcaEvents,
  upsertCostayacoRcaEvent,
} from "../rca/rcaEventStore";
import type { RcaEventoFalla } from "../rca/types";
import { INVENTORY_MINIMUMS } from "./inventoryMinimumsData";
import { getPlanningCriticalSpares } from "./inventoryPlanningCritical";
import { MAINTENANCE_PLANS } from "./maintenancePlansData";
import {
  buildGteDegradationRiskPortfolio,
  topDegrading,
} from "./buildDegradationRiskPortfolio";
import { portfolioSummary } from "./degradationRiskEngine";
import {
  ExecInsight,
  foInsightKey,
  INFORME_EXEC_INSIGHTS,
} from "./informeExecInsights";

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

/** Slide contraíble del informe de confiabilidad. */
export function CollapsibleSlide({
  n,
  title,
  sub,
  badge,
  defaultOpen = true,
  children,
  className = "",
  id,
  insight,
}: {
  n: number;
  title: string;
  sub?: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
  insight?: string | null;
}) {
  return (
    <section className="panel" id={id}>
      <details className={`card disp-analisis maq-board-slide inf-conf-sec inf-conf-collapse ${className}`.trim()} open={defaultOpen}>
        <summary className="inf-conf-collapse-sum">
          <div className="inf-conf-collapse-sum-main">
            <p className="eyebrow">
              {n} · {title}
            </p>
            {sub ? <h3>{sub}</h3> : null}
          </div>
          <div className="inf-conf-collapse-sum-side">
            {badge ? <span className="maq-source-badge gte">{badge}</span> : null}
            <ChevronDown size={18} className="inf-conf-collapse-chevron" aria-hidden />
          </div>
        </summary>
        <div className="inf-conf-collapse-body">
          <ExecInsight text={insight} />
          {children}
        </div>
      </details>
    </section>
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

/** Contenido embebido · eventos repetitivos */
function InformeConfRepetitivosBody({
  month,
  monthLabel,
  slideViewport = true,
}: MonthProps & { slideViewport?: boolean }) {
  if (slideViewport) {
    return <RepetitivosInformeSlide month={month} monthLabel={monthLabel} />;
  }

  return (
    <>
      {month === "Jul" ? (
        <div className="inf-conf-vs-box inf-conf-vs-box--compact">
          <p className="eyebrow">Julio vs junio</p>
          <p>
            Fallas imputables: {EXEC_JUN.failures} (foco {EXEC_JUN.focalUnit}) → 0 en Conf. Patrón del
            mes: cascadas MRU / FO externas; sin cluster PF_contr de junio ({EXEC_JUN.hoursPfContr} h).
          </p>
        </div>
      ) : null}
      <EventInsightsDashboard
        report="gran_tierra"
        month={month}
        monthLabel={monthLabel}
        mode="repetitivos"
        compact
        embedded
      />
    </>
  );
}

/** Contenido embebido · mantenimiento */
function InformeConfMantenimientoBody({ month, monthLabel }: MonthProps) {
  return <MantenimientoInformeSlide month={month} monthLabel={monthLabel} />;
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
    <CollapsibleSlide
      n={7}
      title={`Análisis de fallas · ${monthLabel}`}
      sub="Resumen de formatos de ocurrencia FO-GE-033"
      badge="GTE"
      className="inf-conf-fallas-unified"
      insight={INFORME_EXEC_INSIGHTS.fallas}
    >
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
          </header>
          {periodRca.map((evento) => {
            const foKey = foInsightKey(evento.id) ?? foInsightKey(evento.fuente ?? "");
            return (
              <div key={evento.id} id={`inf-conf-rca-${evento.id}`} className="inf-conf-rca-item">
                {foKey ? <ExecInsight text={INFORME_EXEC_INSIGHTS[foKey]} /> : null}
                <EditableEventDetail
                  event={evento}
                  compact
                  readOnly
                  onSave={handleRcaSave}
                  onOpenRelated={openRelatedRca}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </CollapsibleSlide>
  );
}

/** Bloque 7–9: análisis de fallas + repetitivos + mantenimiento (slides separados). */
export function InformeConfFallasGroup({ month, monthLabel }: MonthProps) {
  return (
    <>
      <InformeConfFallasSection month={month} monthLabel={monthLabel} />
      <InformeConfRepetitivosSection month={month} monthLabel={monthLabel} />
      <InformeConfMantenimientoSection month={month} monthLabel={monthLabel} />
    </>
  );
}

/** 8 · Eventos repetitivos */
export function InformeConfRepetitivosSection({
  month,
  monthLabel,
  slideViewport = true,
}: MonthProps & { slideViewport?: boolean }) {
  return (
    <CollapsibleSlide
      id="inf-conf-repetitivos"
      n={8}
      title={`Eventos repetitivos · ${monthLabel}`}
      sub="Recurrencia por equipo y categoría"
      badge="GTE"
      className={`inf-conf-slide-one inf-rep-viewport-slide${slideViewport ? " inf-rep-slide-deck" : ""}`}
      insight={INFORME_EXEC_INSIGHTS.repetitivos}
    >
      <InformeConfRepetitivosBody month={month} monthLabel={monthLabel} slideViewport={slideViewport} />
    </CollapsibleSlide>
  );
}

/** 9 · Mantenimiento */
export function InformeConfMantenimientoSection({
  month,
  monthLabel,
  slideViewport = true,
}: MonthProps & { slideViewport?: boolean }) {
  return (
    <CollapsibleSlide
      id="inf-conf-mantenimiento"
      n={9}
      title={`Mantenimiento · ${monthLabel}`}
      sub="Plan vs ejecución · horas MTO e intervenciones"
      badge="MTO"
      className={`inf-conf-slide-one inf-mto-viewport-slide${slideViewport ? " inf-rep-slide-deck" : ""}`}
      insight={INFORME_EXEC_INSIGHTS.mantenimiento}
    >
      <InformeConfMantenimientoBody month={month} monthLabel={monthLabel} />
    </CollapsibleSlide>
  );
}

/** 10 · Mínimos de inventario */
export function InformeConfInventarioSection({ monthLabel }: { monthLabel: string }) {
  return (
    <CollapsibleSlide
      n={10}
      title={`Mínimos de inventario · ${monthLabel}`}
      sub={`Cobertura · ${INVENTORY_MINIMUMS.items.length} ítems`}
      badge="Activos"
      className="inf-conf-slide-one"
      insight={INFORME_EXEC_INSIGHTS.inventario}
    >
      <InventoryMinimumsDashboard hideCatalogTable embedded slide />
    </CollapsibleSlide>
  );
}

/** 11 · Tendencias de degradación y riesgos */
export function InformeConfDegradacionSection({ monthLabel }: { monthLabel: string }) {
  return (
    <CollapsibleSlide
      n={11}
      title={`Tendencias de degradación y riesgos · ${monthLabel}`}
      sub="Baseline APM junio · contraste operativo"
      badge="APM"
      className="inf-conf-slide-one"
      insight={INFORME_EXEC_INSIGHTS.degradacion}
    >
      <DegradationRiskDashboard
        monthLabel={`${monthLabel} · baseline junio`}
        slide
        embedded
      />
    </CollapsibleSlide>
  );
}

/** 12 · Eficiencia energética */
export function InformeConfEficienciaSection({
  month,
  monthLabel,
  slideViewport = true,
}: MonthProps & { slideViewport?: boolean }) {
  return (
    <CollapsibleSlide
      id="inf-conf-eficiencia"
      n={12}
      title={`Eficiencia energética · ${monthLabel}`}
      sub="Heat rate medido del gas Moqueta · CPW04–CPW06"
      badge="Gas MQT"
      className={`inf-conf-slide-one inf-eff-viewport-slide${slideViewport ? " inf-rep-slide-deck" : ""}`}
      insight={INFORME_EXEC_INSIGHTS.eficiencia}
    >
      <EficienciaInformeSlide month={month} monthLabel={monthLabel} />
    </CollapsibleSlide>
  );
}

/** 13 · Conclusiones */
export function ConclusionesConfiabilidadBoard({ month, monthLabel }: MonthProps) {
  const gte = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey];
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

  const cierre = useMemo(() => {
    const mto = MAINTENANCE_PLANS.monthlySummary.find((m) => m.monthKey === month) ?? null;
    // El catálogo ETL no marca faltantes; los repuestos en riesgo salen del cruce con RCA/IP.
    const criticalSpares = getPlanningCriticalSpares();
    const outOfStock = criticalSpares.filter((s) => s.onHand <= 0);
    const belowMin = criticalSpares.filter((s) => s.onHand > 0 && s.onHand < s.stockMin);

    const assets = buildGteDegradationRiskPortfolio();
    const apm = portfolioSummary(assets);
    const worstAsset = topDegrading(assets, 1)[0] ?? null;

    // La bitácora incluye una fila diaria por unidad: solo cuentan falla y causa común.
    const logRows = gte?.eventLog ?? [];
    // Mismo universo que la lámina 11: filas con igual fecha, tipo y causa se fusionan.
    const consolidatedEvents = enrichEventLog(logRows, "gran_tierra").length;
    const realEvents = logRows.filter((e) => !/operativ/i.test(e.eventType ?? ""));
    const isCommonCause = (e: (typeof logRows)[number]) =>
      /causa\s*com/i.test(e.eventType ?? "") || /parque/i.test(e.equipment ?? "");
    const commonCause = realEvents.filter(isCommonCause);

    const eqCounts = new Map<string, number>();
    for (const e of realEvents) {
      if (isCommonCause(e)) continue;
      const key = (e.equipment || "").trim() || "Sin unidad";
      eqCounts.set(key, (eqCounts.get(key) ?? 0) + 1);
    }
    const repeated = [...eqCounts.entries()]
      .filter(([, n]) => n > 1)
      .sort((a, b) => b[1] - a[1]);

    const units = buildUnitEfficiency(month);
    const worstUnit =
      units?.rows
        .filter((r) => r.efficiencyHhvPct != null)
        .sort((a, b) => (a.efficiencyHhvPct ?? 0) - (b.efficiencyHhvPct ?? 0))[0] ?? null;

    return {
      mto,
      eff: buildEnergyEfficiency(month),
      units,
      worstUnit,
      criticalSpares: criticalSpares.length,
      outOfStock: outOfStock.length,
      belowMin: belowMin.length,
      invTotal: INVENTORY_MINIMUMS.items.length,
      apm,
      worstAsset,
      realEvents: realEvents.length,
      commonCause: commonCause.length,
      repeatedUnits: repeated.length,
      topRepeated: repeated[0] ?? null,
      totalEvents: logRows.length,
      consolidatedEvents,
    };
  }, [gte, month]);

  const horasNoDesglosadas = disp.gteImpliedUnavailable;
  const horasExtra = disp.extraDiscounted;

  return (
    <CollapsibleSlide
      n={13}
      title={`Conclusiones · ${monthLabel}`}
      sub="Cierre del informe de confiabilidad"
      badge="Orden 1"
      className="inf-conf-conclusiones"
      insight={INFORME_EXEC_INSIGHTS.conclusiones}
    >
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
        <article>
          <span>Plan MTO</span>
          <strong>
            {cierre.mto ? `${cierre.mto.executedCount}/${cierre.mto.programmedCount}` : "—"}
          </strong>
          <small>
            {cierre.mto
              ? `${cierre.mto.executedHoursMto} de ${cierre.mto.plannedHoursMto} h MTO`
              : "Sin sábana del mes"}
          </small>
        </article>
        <article>
          <span>Salud APM</span>
          <strong>{cierre.apm.avgHealth}</strong>
          <small>
            {cierre.apm.criticalRisk} crítico · {cierre.apm.highRisk} alto de{" "}
            {cierre.apm.monitored}
          </small>
        </article>
      </div>

      <div className="inf-conf-concl-grid">
        <section className="inf-conf-concl-col">
          <p className="eyebrow">Lectura del mes</p>
          <ul>
            <li>
              <strong>Brecha de disponibilidad, no de fórmula.</strong> GTE reporta{" "}
              {dispGte != null ? `${dispGte.toFixed(2)} %` : "N/D"} y COPOWER{" "}
              {dispCpw != null ? `${dispCpw.toFixed(2)} %` : "N/D"} con la misma base (OP + SB) /
              calendario
              {horasNoDesglosadas != null
                ? `: ${fmtH(Number(horasNoDesglosadas.toFixed(1)))} no disponibles sin desglose`
                : ""}
              {horasExtra != null && horasExtra > 0
                ? ` (${fmtH(Number(horasExtra.toFixed(1)))} descontadas de más)`
                : ""}
              .
            </li>
            <li>
              <strong>Confiabilidad {confGte != null ? `${confGte.toFixed(2)} %` : "N/D"}.</strong>{" "}
              {fos.length} FO-GE-033 del periodo, 0 imputables al contratista; el origen es externo
              a los equipos COPOWER (cascadas MRU y eventos de red).
            </li>
            <li>
              <strong>Recurrencia acotada.</strong> {cierre.realEvents} eventos de falla o causa
              común dentro de los {cierre.consolidatedEvents} eventos consolidados de la lámina 11
              ({cierre.totalEvents} registros de bitácora)
              {cierre.commonCause > 0 ? `; ${cierre.commonCause} son cascadas de parque` : ""}
              {!cierre.topRepeated
                ? " y ninguna unidad repite"
                : cierre.repeatedUnits === 1
                  ? ` y ${cierre.topRepeated[0]} es la única unidad que repite (${cierre.topRepeated[1]})`
                  : ` y ${cierre.repeatedUnits} unidades repiten, foco ${cierre.topRepeated[0]} con ${cierre.topRepeated[1]}`}
              .
            </li>
            <li>
              <strong>Plan de mantenimiento al día.</strong>{" "}
              {cierre.mto
                ? `${cierre.mto.executedCount}/${cierre.mto.programmedCount} intervenciones cerradas y ${cierre.mto.executedHoursMto} h MTO reales sobre ${cierre.mto.plannedHoursMto} h planificadas`
                : "Sin sábana cargada para el periodo"}
              ; la indisponibilidad no proviene del preventivo.
            </li>
            {cierre.eff ? (
              <li>
                <strong>Consumo de gas al alza.</strong> Heat rate medido{" "}
                {cierre.eff.heatRateBtuKwh != null
                  ? `${Math.round(cierre.eff.heatRateBtuKwh).toLocaleString("es-CO")} BTU/kWh`
                  : "N/D"}
                {cierre.eff.previous?.deltaHeatRatePct != null
                  ? ` (${cierre.eff.previous.deltaHeatRatePct > 0 ? "+" : ""}${cierre.eff.previous.deltaHeatRatePct.toFixed(1)} % vs ${cierre.eff.previous.month.monthLabel})`
                  : ""}
                {cierre.units?.totals.efficiencyHhvPct != null
                  ? ` y eficiencia de planta ${cierre.units.totals.efficiencyHhvPct.toFixed(1)} %${
                      cierre.eff.previous?.reportedEfficiencyPct != null
                        ? ` frente al ${cierre.eff.previous.reportedEfficiencyPct} % de ${cierre.eff.previous.month.monthLabel}`
                        : ""
                    }`
                  : ""}
                {cierre.worstUnit?.efficiencyHhvPct != null
                  ? `; ${cierre.worstUnit.unit} es la más floja (${cierre.worstUnit.loadFactorPct?.toFixed(0)} % de carga)`
                  : ""}
                .
              </li>
            ) : null}
          </ul>
        </section>

        <section className="inf-conf-concl-col">
          <p className="eyebrow">Acciones · Orden 1</p>
          <ExecInsight text={INFORME_EXEC_INSIGHTS.acciones} className="inf-exec-insight--nested" />
          <ol>
            <li>
              Solicitar a Gran Tierra el <strong>desglose horario</strong> del{" "}
              {dispGte != null ? `${dispGte.toFixed(2)} %` : "indicador oficial"} y conciliar por
              evento antes del próximo corte.
            </li>
            <li>
              {month === "Jul" ? (
                <>
                  Cerrar los RCA de <strong>cascadas MRU</strong> y la frontera de responsabilidad
                  FO-60 gas MQT para blindar la confiabilidad reportada.
                </>
              ) : (
                <>
                  Cerrar los <strong>RCA abiertos</strong> del periodo y documentar la frontera de
                  responsabilidad de cada FO.
                </>
              )}
            </li>
            <li>
              Intervenir los activos de menor salud
              {cierre.worstAsset
                ? ` (${cierre.worstAsset.assetId} · HI ${cierre.worstAsset.healthIndex})`
                : ""}{" "}
              y sostener el plan AGC4 en{" "}
              {noCumple.map((m) => m.unidad).join(", ") || "las unidades fuera de meta"}.
            </li>
            <li>
              Reponer los <strong>{cierre.criticalSpares} repuestos críticos</strong> ligados a
              RCA/IP — {cierre.outOfStock} sin existencia y {cierre.belowMin} bajo mínimo — antes del
              siguiente ciclo de preventivo. El catálogo tiene {cierre.invTotal} ítems y el resto está
              en mínimo.
            </li>
          </ol>
        </section>
      </div>

      <p className="inf-conf-concl-meta">
        Meta Orden 1: disponibilidad y confiabilidad ≥ 98 %. Baseline junio: Disp.{" "}
        {(EXEC_JUN.availability * 100).toFixed(2)} % · MTBF {EXEC_JUN.mtbfHours.toFixed(0)} h ·{" "}
        {EXEC_JUN.failures} fallas imputables (foco {EXEC_JUN.focalUnit}).
      </p>
    </CollapsibleSlide>
  );
}

/** Bloque completo 7–12 para el resumen de Informes · Confiabilidad */
export function InformeConfContinuacion({ month, monthLabel }: MonthProps) {
  return (
    <>
      <InformeConfFallasGroup month={month} monthLabel={monthLabel} />
      <InformeConfInventarioSection monthLabel={monthLabel} />
      <InformeConfDegradacionSection monthLabel={monthLabel} />
      <InformeConfEficienciaSection month={month} monthLabel={monthLabel} slideViewport={false} />
      <ConclusionesConfiabilidadBoard month={month} monthLabel={monthLabel} />
    </>
  );
}
