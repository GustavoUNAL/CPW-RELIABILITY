import type { ReactNode } from "react";
import {
  COPOWER_MONTHLY_DATA,
  type CopowerMonthKey,
} from "./copowerMonthly";
import {
  GRAN_TIERRA_MONTHLY_DATA,
  type GranTierraMonthKey,
} from "./granTierraMonthly";
import { CopowerIndicatorsDashboard } from "./CopowerIndicatorsPanel";
import { FailureEventsView } from "./FailureEventsView";
import { FailureClassificationView } from "./FailureClassificationView";
import { EventInsightsDashboard } from "./EventInsightsDashboard";
import { OperacionModule, operacionSectionFromLeaf } from "../operacion/OperacionModule";
import { InterventionPlansDashboard } from "./InterventionPlansDashboard";
import { RcaAnalysisDashboard } from "./RcaAnalysisDashboard";
import type { RcaCaseDetail } from "./gteJuneRcaCases";
import type { RcaEventDraft } from "./rcaCaseStore";
import { MaintenanceOptimizationDashboard } from "./MaintenanceOptimizationDashboard";
import { DegradationRiskDashboard } from "./DegradationRiskDashboard";
import { ActionTrackingDashboard } from "./ActionTrackingDashboard";
import { OperationalPlanningDashboard } from "./OperationalPlanningDashboard";
import { MonthlyReportDashboard } from "./MonthlyReportDashboard";
import { DashboardMantenimiento, DashboardOverview } from "./DashboardViews";
import { FuentesCompareResumen } from "./FuentesCompareResumen";
import { GenerationDashboard } from "./GenerationDashboard";
import { CopowerCompanyView, GteCompanyView } from "./CompanyViews";
import { FieldAssetsView, FieldsOverviewView } from "./FieldAssetsView";
import { fieldKeyFromLeaf, fieldSectionFromLeaf } from "../contracts/fieldAssets";
import { CopowerResumen } from "./CopowerResumen";
import { GteResumen } from "./GteResumen";
import { ExecutiveResumen } from "./ExecutiveResumen";
import { MeetingBrief } from "./MeetingBrief";
import { ComparativeAnalysis } from "./ComparativeAnalysis";
import { SourceMeetingBrief, SourceMonthCompare } from "./SourcePanels";
import { MarcoContractual } from "./MarcoContractual";
import { CONTRACT_CALC_BASE, CONTRACTUAL_KPI_TARGETS } from "../contracts/gteOrders";
import { assessTechnicalRisk } from "../risk/technicalRisk";
import {
  capaFocusFromLeaf,
  generationSectionFromLeaf,
  INTEGRATED_DUAL_LEAVES,
  planningFocusFromLeaf,
  resolveReport,
  resolveViewContext,
} from "../nav/resolveContext";
import type { PageKey, ReportKey } from "../types";
import { METRIC_DEFS } from "../ui/metricDefs";
import { EmptyScreen, ScreenShell } from "../ui/ScreenShell";

type Props = {
  page: PageKey;
  leafId: string;
  month: string;
  monthLabel: string;
  onNavigateToRca?: (rcaId?: string) => void;
  focusRcaId?: string | null;
  onFocusRcaConsumed?: () => void;
  rcaCases?: RcaCaseDetail[];
  onRcaCasesChange?: (next: RcaCaseDetail[] | ((prev: RcaCaseDetail[]) => RcaCaseDetail[])) => void;
  onCreateRcaFromEvent?: (draft: RcaEventDraft) => void;
  onCreateBlankRca?: () => void;
};

const pct = (v: number | null | undefined, d = 2) =>
  v == null || Number.isNaN(v) ? "N/D" : `${(v * 100).toFixed(d)}%`;
const kwh = (v: number) => `${Math.round(v).toLocaleString("es-CO")} kWh`;
const hours = (v: number | null | undefined) =>
  v == null || Number.isNaN(v) ? "N/D" : `${v.toFixed(2)} h`;

function getSnap(report: ReportKey, month: string) {
  if (report === "gran_tierra") return GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ?? null;
  return COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ?? null;
}

export function DualCompare({
  page,
  leafId,
  month,
  monthLabel,
  body,
  onNavigateToRca,
  focusRcaId,
  onFocusRcaConsumed,
  rcaCases,
  onRcaCasesChange,
  onCreateRcaFromEvent,
  onCreateBlankRca,
}: {
  page: PageKey;
  leafId: string;
  month: string;
  monthLabel: string;
  body?: (report: ReportKey) => ReactNode;
  onNavigateToRca?: (rcaId?: string) => void;
  focusRcaId?: string | null;
  onFocusRcaConsumed?: () => void;
  rcaCases?: RcaCaseDetail[];
  onRcaCasesChange?: (next: RcaCaseDetail[] | ((prev: RcaCaseDetail[]) => RcaCaseDetail[])) => void;
  onCreateRcaFromEvent?: (draft: RcaEventDraft) => void;
  onCreateBlankRca?: () => void;
}) {
  return (
    <div className="dual-source-wrap dual-source-wrap--fit">
      <p className="muted dual-period-label">Comparativo · {monthLabel}</p>
      <div className="dual-source-grid">
        {(["gran_tierra", "copower"] as const).map((report) => (
          <section key={report} className="dual-pane">
            <header className="dual-pane-header">
              <strong>{report === "gran_tierra" ? "Gran Tierra Energy" : "COPOWER"}</strong>
              <span className={`source-badge ${report === "gran_tierra" ? "gte" : "cpw"}`}>
                {report === "gran_tierra" ? "GTE" : "CPW"}
              </span>
            </header>
            <div className="dual-pane-body">
              {body ? (
                body(report)
              ) : (
                <PlatformBody
                  page={page}
                  leafId={leafId}
                  month={month}
                  monthLabel={monthLabel}
                  report={report}
                  onNavigateToRca={onNavigateToRca}
                  focusRcaId={focusRcaId}
                  onFocusRcaConsumed={onFocusRcaConsumed}
                  rcaCases={rcaCases}
                  onRcaCasesChange={onRcaCasesChange}
                  onCreateRcaFromEvent={onCreateRcaFromEvent}
                  onCreateBlankRca={onCreateBlankRca}
                />
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function MachinesTable({
  report,
  month,
  campoFilter,
  unitPrefix,
}: {
  report: ReportKey;
  month: string;
  campoFilter?: string;
  unitPrefix?: RegExp;
}) {
  const snap = getSnap(report, month);
  if (!snap) {
    return <EmptyScreen detail="Sin registros para este periodo en esta fuente." report={report} />;
  }
  let rows = snap.machineIndicators.filter((m) => m.unidad !== "SISTEMA N");
  if (campoFilter) rows = rows.filter((m) => m.campo.toUpperCase().includes(campoFilter.toUpperCase()));
  if (unitPrefix) rows = rows.filter((m) => unitPrefix.test(m.unidad));
  if (rows.length === 0) {
    return <EmptyScreen detail="Sin equipos que coincidan con este filtro en la fuente cargada." report={report} />;
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Unidad</th>
            <th>Campo</th>
            <th>Disp. %</th>
            <th>Conf. %</th>
            <th>Fallas</th>
            <th>MTBF</th>
            <th>MTTR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.unidad}-${r.campo}`}>
              <td>{r.unidad}</td>
              <td>{r.campo}</td>
              <td>{r.disponibilidadPct == null ? "N/D" : r.disponibilidadPct.toFixed(2)}</td>
              <td>{r.confiabilidadPct == null ? "N/D" : r.confiabilidadPct.toFixed(2)}</td>
              <td>{r.fallas}</td>
              <td>{r.mtbfLabel}</td>
              <td>{r.mttrHours ?? "N/D"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HoursPanel({ report, month }: { report: ReportKey; month: string }) {
  const snap = getSnap(report, month);
  if (!snap) return <EmptyScreen detail="Sin registros para este periodo." report={report} />;
  const s = snap.summary;
  return (
    <div className="exec-kpi-row">
      <div className="exec-kpi">
        <span>Operación</span>
        <strong>{hours(s.hoursOperated)}</strong>
      </div>
      <div className="exec-kpi">
        <span>Stand-by</span>
        <strong>{hours(s.hoursStandby)}</strong>
      </div>
      <div className="exec-kpi">
        <span>Preventivo</span>
        <strong>{hours(s.hoursPreventive)}</strong>
      </div>
      <div className="exec-kpi">
        <span>Correctivo / FS</span>
        <strong>{hours(s.hoursCorrective)}</strong>
      </div>
      <div className="exec-kpi">
        <span>PF contr</span>
        <strong>{hours(s.hoursFailureCopower)}</strong>
      </div>
      <div className="exec-kpi">
        <span>PF cli</span>
        <strong>{hours(s.hoursFailureClient)}</strong>
      </div>
    </div>
  );
}

function KpiFocus({
  report,
  month,
  metric,
}: {
  report: ReportKey;
  month: string;
  metric: "disp" | "conf" | "mtbf" | "mttr" | "prod" | "util" | "for" | "pp";
}) {
  const snap = getSnap(report, month);
  if (!snap) return <EmptyScreen detail="Sin registros para este periodo." report={report} />;
  const s = snap.summary;
  const map = {
    disp: { label: "Disponibilidad", value: pct(snap.kpi.availability), note: "OP+SB / (OP+SB+MTO+FS) o anexo oficial" },
    conf: { label: "Confiabilidad", value: pct(snap.kpi.reliability), note: METRIC_DEFS.MTBF.es + " / ventana operativa" },
    mtbf: { label: "MTBF", value: hours(s.mtbfHours), note: METRIC_DEFS.MTBF.es },
    mttr: { label: "MTTR", value: hours(s.mttrHours), note: METRIC_DEFS.MTTR.es },
    prod: { label: "Producción", value: kwh(snap.totalGenerationKwh), note: `Gas ${kwh(s.energyGasKwh)} · Diésel ${kwh(s.energyDieselKwh)}` },
    util: {
      label: "Utilización",
      value:
        s.hoursOperated + s.hoursStandby > 0
          ? `${((s.hoursOperated / (s.hoursOperated + s.hoursStandby + s.hoursCorrective + s.hoursPreventive || 1)) * 100).toFixed(1)}%`
          : "N/D",
      note: "Estimado OP / (OP+SB+MTO+FS) desde Resumen OP",
    },
    for: {
      label: "Forced outage (PF_contr)",
      value: hours(s.hoursFailureCopower),
      note: "Horas de falla imputables a COPOWER (PF_contr)",
    },
    pp: {
      label: "Planned outage (PP)",
      value: hours(s.hoursPreventive),
      note: "Horas de mantenimiento preventivo programado",
    },
  } as const;
  const m = map[metric];
  return (
    <ScreenShell report={report} sourceFile={snap.sourceFile}>
      <div className="exec-kpi-row">
        <div className="exec-kpi kpi-hero">
          <span>{m.label}</span>
          <strong>{m.value}</strong>
          <small>{m.note}</small>
        </div>
      </div>
      {metric === "disp" || metric === "conf" || metric === "mtbf" || metric === "mttr" ? (
        <MachinesTable report={report} month={month} />
      ) : null}
    </ScreenShell>
  );
}

function MissingDataList({ report, month }: { report: ReportKey; month: string }) {
  const snap = getSnap(report, month);
  const missing: string[] = [];
  if (!snap) missing.push("Snapshot del mes");
  else {
    if (snap.kpi.availability == null) missing.push("Disponibilidad sistémica");
    if (snap.kpi.reliability == null) missing.push("Confiabilidad sistémica");
    if (snap.summary.mtbfHours == null) missing.push("MTBF");
    if (snap.summary.mttrHours == null) missing.push("MTTR");
    missing.push("Eficiencia %", "PMC", "Cumplimiento plan MTO %", "Stock repuestos %");
  }
  return (
    <ul className="insight-list">
      {missing.map((m) => (
        <li key={m}>{m}</li>
      ))}
    </ul>
  );
}

function DeviationPanel({ report, month }: { report: ReportKey; month: string }) {
  const snap = getSnap(report, month);
  const meta = CONTRACTUAL_KPI_TARGETS.reliability;
  return (
    <ScreenShell report={report} sourceFile={snap?.sourceFile} title="Desviaciones vs meta 98%">
      <div className="exec-kpi-row">
        <div className="exec-kpi">
          <span>Disp vs 98%</span>
          <strong>
            {snap?.kpi.availability == null ? "N/D" : `${((snap.kpi.availability - meta) * 100).toFixed(2)} pp`}
          </strong>
        </div>
        <div className="exec-kpi">
          <span>Conf vs 98%</span>
          <strong>
            {snap?.kpi.reliability == null ? "N/D" : `${((snap.kpi.reliability - meta) * 100).toFixed(2)} pp`}
          </strong>
        </div>
      </div>
      <MachinesTable report={report} month={month} />
    </ScreenShell>
  );
}

function PlatformBody({
  page,
  leafId,
  month,
  monthLabel,
  report,
  onNavigateToRca,
  focusRcaId,
  onFocusRcaConsumed,
  rcaCases,
  onRcaCasesChange,
  onCreateRcaFromEvent,
  onCreateBlankRca,
}: Props & { report: ReportKey }) {
  const cpwMonth = (COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ? month : "Jun") as CopowerMonthKey;
  const gteMonthOk = Boolean(GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey]);

  if (leafId.startsWith("gen-")) {
    return (
      <ScreenShell report="copower" headless>
        <GenerationDashboard section={generationSectionFromLeaf(leafId)} />
      </ScreenShell>
    );
  }

  if (leafId.startsWith("cfg-campos-") || leafId === "cfg-campos") {
    if (leafId === "cfg-campos" || leafId === "cfg-campos-resumen") {
      return <FieldsOverviewView month={month} monthLabel={monthLabel} />;
    }
    const fieldKey = fieldKeyFromLeaf(leafId);
    if (fieldKey) {
      return (
        <FieldAssetsView
          fieldKey={fieldKey}
          section={fieldSectionFromLeaf(leafId)}
          month={month}
          monthLabel={monthLabel}
        />
      );
    }
  }

  if (
    leafId === "cfg-empresas-copower" ||
    leafId === "cfg-empresas-gte" ||
    leafId === "cfg-parametros" ||
    leafId === "cfg-equipos" ||
    leafId === "cfg-usuarios" ||
    leafId === "cfg-catalogos"
  ) {
    if (leafId === "cfg-empresas-copower") {
      return <CopowerCompanyView />;
    }
    if (leafId === "cfg-empresas-gte") {
      return <GteCompanyView />;
    }
    if (leafId === "cfg-parametros") {
      return <MarcoContractual leaf="sec-1-2" report="gran_tierra" month={month} monthLabel={monthLabel} />;
    }
    return (
      <EmptyScreen
        detail={`${leafId === "cfg-equipos" ? "Catálogo de equipos" : leafId === "cfg-usuarios" ? "Gestión de usuarios" : "Catálogos"} pendiente de configuración administrativa.`}
        report="dual"
      />
    );
  }

  if (

    leafId.startsWith("bd-ev") ||
    leafId.startsWith("an-repetitivos") ||
    leafId.startsWith("an-badactors") ||
    leafId.startsWith("an-interv") ||
    leafId === "an-rca-gte" ||
    leafId === "an-rca" ||
    leafId === "an-pareto" ||
    leafId === "an-tendencias-fallas" ||
    leafId === "proc-clasif" ||
    leafId === "an-criticos" ||
    leafId === "bd-fallas"
  ) {
    if (leafId === "bd-ev-dual") {
      const mode = report === "gran_tierra" ? "gte" : "copower";
      return (
        <ScreenShell report={report} headless>
          <FailureEventsView
            month={month}
            monthLabel={monthLabel}
            mode={mode}
            onNavigateToRca={onNavigateToRca}
            rcaCases={rcaCases}
            onCreateRcaFromEvent={onCreateRcaFromEvent}
          />
        </ScreenShell>
      );
    }
    if (leafId === "bd-fallas") {
      return (
        <ScreenShell report="dual" headless>
          <FailureEventsView
            month={month}
            monthLabel={monthLabel}
            mode="dual"
            onNavigateToRca={onNavigateToRca}
            rcaCases={rcaCases}
            onCreateRcaFromEvent={onCreateRcaFromEvent}
          />
        </ScreenShell>
      );
    }
    if (leafId === "bd-ev-copower" || leafId === "proc-eventos") {
      return (
        <ScreenShell report="copower" headless>
          <FailureEventsView
            month={month}
            monthLabel={monthLabel}
            mode="copower"
            onNavigateToRca={onNavigateToRca}
            rcaCases={rcaCases}
            onCreateRcaFromEvent={onCreateRcaFromEvent}
          />
        </ScreenShell>
      );
    }
    if (leafId === "bd-ev-gte") {
      return (
        <ScreenShell report="gran_tierra" headless>
          <FailureEventsView
            month={month}
            monthLabel={monthLabel}
            mode="gte"
            onNavigateToRca={onNavigateToRca}
            rcaCases={rcaCases}
            onCreateRcaFromEvent={onCreateRcaFromEvent}
          />
        </ScreenShell>
      );
    }
    if (leafId === "an-pareto" || leafId === "an-tendencias-fallas") {
      return (
        <ScreenShell report="dual" headless>
          <FailureEventsView
            month={month}
            monthLabel={monthLabel}
            mode="dual"
            failuresOnlyDefault
            onNavigateToRca={onNavigateToRca}
            rcaCases={rcaCases}
            onCreateRcaFromEvent={onCreateRcaFromEvent}
          />
        </ScreenShell>
      );
    }
    if (leafId === "an-repetitivos" || leafId === "an-repetitivos-copower" || leafId === "an-repetitivos-gte") {
      const insightsReport: ReportKey =
        leafId === "an-repetitivos-gte" ? "gran_tierra" : leafId === "an-repetitivos-copower" ? "copower" : report;
      return (
        <EventInsightsDashboard
          report={insightsReport}
          month={month}
          monthLabel={monthLabel}
          mode="repetitivos"
        />
      );
    }
    if (leafId === "an-badactors" || leafId === "an-badactors-copower" || leafId === "an-badactors-gte") {
      const insightsReport: ReportKey =
        leafId === "an-badactors-gte" ? "gran_tierra" : leafId === "an-badactors-copower" ? "copower" : report;
      return (
        <EventInsightsDashboard
          report={insightsReport}
          month={month}
          monthLabel={monthLabel}
          mode="badactors"
        />
      );
    }
    if (leafId === "an-interv-copower") {
      return <InterventionPlansDashboard report="gran_tierra" month="Jun" monthLabel="junio 2026 (referencia)" />;
    }
    if (leafId === "an-interv-gte") {
      const intervMonth = month === "Jun" ? month : "Jun";
      const intervLabel = month === "Jun" ? monthLabel : `${monthLabel} · datos junio 2026`;
      return <InterventionPlansDashboard report="gran_tierra" month={intervMonth} monthLabel={intervLabel} />;
    }
    if (leafId === "an-rca-gte" || leafId === "an-rca") {
      return (
        <RcaAnalysisDashboard
          monthLabel={month === "Jun" ? monthLabel : `${monthLabel} · RCA junio 2026`}
          focusRcaId={focusRcaId}
          onFocusRcaConsumed={onFocusRcaConsumed}
          cases={rcaCases}
          onCasesChange={onRcaCasesChange}
          onCreateBlankRca={onCreateBlankRca}
        />
      );
    }
    if (leafId === "proc-clasif") {
      return <FailureClassificationView month={month} monthLabel={monthLabel} />;
    }
    if (leafId === "an-criticos") {
      const snap = getSnap(report, month) ?? getSnap("copower", month) ?? getSnap("gran_tierra", "Jun");
      const ranked = [...(snap?.machineIndicators ?? [])]
        .filter((m) => m.unidad !== "SISTEMA N" && m.fallas > 0)
        .sort((a, b) => b.fallas - a.fallas);
      return (
        <ScreenShell report={report} title="Equipos críticos" subtitle="Ranking por frecuencia de fallas">
          {ranked.length === 0 ? (
            <p className="empty-state">Sin unidades con fallas en el periodo.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Unidad</th>
                    <th>Fallas</th>
                    <th>MTBF</th>
                    <th>MTTR</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((r, i) => (
                    <tr key={r.unidad} className={r.fallas >= 3 ? "row-repeat" : undefined}>
                      <td>{i + 1}</td>
                      <td>{r.unidad}</td>
                      <td>{r.fallas}</td>
                      <td>{r.mtbfLabel}</td>
                      <td>{r.mttrHours ?? "N/D"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ScreenShell>
      );
    }
  }

  if (
    leafId === "mto-optimizacion" ||
    leafId === "mto-degradacion" ||
    leafId === "mto-dashboard" ||
    leafId === "ga-salud" ||
    page === "gestion_activos"
  ) {
    if (leafId === "mto-optimizacion") {
      return (
        <MaintenanceOptimizationDashboard
          monthLabel={month === "Jun" ? monthLabel : `${monthLabel} · MSO junio 2026`}
        />
      );
    }
    if (leafId === "mto-degradacion" || leafId === "ga-salud") {
      return (
        <DegradationRiskDashboard
          monthLabel={month === "Jun" ? monthLabel : `${monthLabel} · evaluación junio 2026`}
        />
      );
    }
    if (leafId === "mto-dashboard") {
      return <DashboardMantenimiento month={month} monthLabel={monthLabel} />;
    }
  }

  if (leafId.startsWith("capa-") || page === "gestion_acciones") {
    return <ActionTrackingDashboard monthLabel={monthLabel} focusId={capaFocusFromLeaf(leafId)} />;
  }

  if (
    page === "planeacion" ||
    leafId === "op-tablero" ||
    leafId === "op-riesgos" ||
    leafId === "op-alertas" ||
    leafId === "op-prioridades" ||
    leafId === "op-accion" ||
    leafId === "op-cronograma" ||
    leafId === "op-compromisos" ||
    leafId === "op-recursos"
  ) {
    return (
      <OperationalPlanningDashboard monthLabel={monthLabel} focusId={planningFocusFromLeaf(leafId)} />
    );
  }

  if (leafId === "conf-dashboard" || leafId === "dash-resumen") {
    return <DashboardOverview month={month} monthLabel={monthLabel} />;
  }

  if (leafId === "an-evolucion" || leafId === "an-evolucion-copower" || leafId === "an-evolucion-gte") {
    const evolucionReport: ReportKey =
      leafId === "an-evolucion-gte" ? "gran_tierra" : leafId === "an-evolucion-copower" ? "copower" : report;
    return <SourceMonthCompare report={evolucionReport} month={month} monthLabel={monthLabel} />;
  }

  if (leafId.startsWith("rep-inf-")) {
    return <MonthlyReportDashboard month={month} monthLabel={monthLabel} section={leafId} />;
  }

  if (leafId === "rep-historico") {
    return <SourceMonthCompare report="gran_tierra" month={month} monthLabel={monthLabel} />;
  }

  if (page === "confiabilidad") {
    if (leafId === "bd-ind-copower") {
      return <CopowerIndicatorsDashboard month={cpwMonth} />;
    }
    if (leafId === "bd-ind-gte") {
      return month === "Jun" && gteMonthOk ? (
        <ExecutiveResumen showAlerts={false} />
      ) : (
        <ScreenShell report="gran_tierra" title="Indicadores Gran Tierra" subtitle={monthLabel}>
          <HoursPanel report="gran_tierra" month={month} />
          <MachinesTable report="gran_tierra" month={month} />
        </ScreenShell>
      );
    }
    const cpwMap: Record<string, "disp" | "conf" | "mtbf" | "mttr" | "prod" | "util" | "for" | "pp"> = {
      "kpi-cpw-disp": "disp",
      "kpi-cpw-conf": "conf",
      "kpi-cpw-mtbf": "mtbf",
      "kpi-cpw-mttr": "mttr",
      "kpi-cpw-prod": "prod",
      "kpi-cpw-util": "util",
      "kpi-cpw-for": "for",
      "kpi-cpw-planned": "pp",
    };
    if (leafId === "kpi-cpw-prod") {
      return (
        <ScreenShell report="copower" headless>
          <GenerationDashboard section="dashboard" />
        </ScreenShell>
      );
    }
    if (leafId === "kpi-cpw-mdt") {
      return (
        <EmptyScreen
          detail="MDT no publicado como KPI separado en las fuentes; use MTTR como aproximación de reparación."
          report="copower"
        />
      );
    }
    if (cpwMap[leafId]) return <KpiFocus report="copower" month={cpwMonth} metric={cpwMap[leafId]} />;

    if (leafId === "kpi-gte-todos") {
      return month === "Jun" ? (
        <ExecutiveResumen />
      ) : (
        <SourceMonthCompare report="gran_tierra" month={month} monthLabel={monthLabel} />
      );
    }
    if (leafId === "kpi-gte-formulas") {
      return (
        <ScreenShell report="gran_tierra" title="Fórmulas Orden 1" subtitle="Base de cálculo contractual">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th>Fórmula</th>
                  <th>Meta</th>
                </tr>
              </thead>
              <tbody>
                {CONTRACT_CALC_BASE.map((r) => (
                  <tr key={r.indicator}>
                    <td>{r.indicator}</td>
                    <td>{r.formula}</td>
                    <td>{r.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScreenShell>
      );
    }
    if (leafId === "kpi-gte-metas") {
      return <MarcoContractual leaf="sec-1-2" report="gran_tierra" month={month} monthLabel={monthLabel} />;
    }
    if (leafId === "kpi-gte-historico") {
      return <SourceMonthCompare report="gran_tierra" month={month} monthLabel={monthLabel} />;
    }
  }

  if (leafId === "bd-historicos-copower" || leafId === "bd-historicos") {
    return <SourceMonthCompare report="copower" month={month} monthLabel={monthLabel} />;
  }
  if (leafId === "bd-historicos-gte") {
    return <SourceMonthCompare report="gran_tierra" month={month} monthLabel={monthLabel} />;
  }

  if (
    page === "operacion" ||
    leafId === "bd-op-copower" ||
    leafId === "op-dashboard" ||
    leafId === "op-equipos" ||
    leafId === "op-eficiencia" ||
    leafId === "op-resumen-diario" ||
    leafId === "op-eventos" ||
    leafId === "op-consumos" ||
    leafId === "op-detalle"
  ) {
    if (leafId === "bd-mto") {
      return <EmptyScreen detail="Plan MTO / órdenes de trabajo no vienen en PDF/Excel actuales." report={report} />;
    }
    if (leafId === "bd-alarmas") {
      return <EmptyScreen detail="Pendiente de fuente de alarmas SCADA / DCS." report={report} />;
    }
    return <OperacionModule section={operacionSectionFromLeaf(leafId)} />;
  }

  if (leafId.startsWith("cq-")) {
    if (leafId === "cq-faltantes") {
      return (
        <ScreenShell report={report} title="Datos faltantes / N/D" subtitle={monthLabel}>
          <MissingDataList report={report} month={month} />
        </ScreenShell>
      );
    }
    if (leafId === "cq-validacion") {
      return <SourceMonthCompare report={report} month={month} monthLabel={monthLabel} />;
    }
    if (leafId === "cq-auditoria") {
      return month === "Jun" ? (
        <ComparativeAnalysis month="Jun" monthLabel={monthLabel} />
      ) : (
        <EmptyScreen detail="Auditoría PDF vs Excel disponible solo para junio 2026." report="dual" />
      );
    }
    return (
      <EmptyScreen
        detail="Módulo de calidad pendiente de pipeline formal (sin inventar reglas). Disponible a nivel dual GTE + COPOWER."
        report="dual"
      />
    );
  }

  if (leafId === "an-riesgo") {
    const snap = getSnap("copower", month);
    const rows = (snap?.machineIndicators ?? [])
      .filter((m) => m.unidad !== "SISTEMA N")
      .map((m) => ({
        ...m,
        assessed: assessTechnicalRisk({
          fallas: m.fallas,
          mtbfLabel: m.mtbfLabel,
          mttrHours: m.mttrHours,
          disponibilidadPct: m.disponibilidadPct,
          skip: m.cumplimiento === "N/A",
        }),
      }));
    return (
      <ScreenShell
        report="copower"
        title="Matriz de riesgo técnico"
        subtitle="Probabilidad × Consecuencia — pendiente validación formal"
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Fallas</th>
                <th>Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.unidad}>
                  <td>{r.unidad}</td>
                  <td>{r.fallas}</td>
                  <td>{r.assessed.riesgo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScreenShell>
    );
  }

  if (page === "dashboard") {
    if (leafId === "dash-resumen") {
      return <DashboardOverview month={month} monthLabel={monthLabel} />;
    }
    if (leafId === "dash-operacion") return <CopowerResumen month={cpwMonth} />;
    if (leafId === "dash-operacion-gte") {
      const gteMonth = (GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey] ? month : "Jun") as GranTierraMonthKey;
      return <GteResumen month={gteMonth} />;
    }
    if (leafId === "dash-mto") {
      return <DashboardMantenimiento month={month} monthLabel={monthLabel} />;
    }
  }

  if (leafId === "rep-diario") return <CopowerResumen month={cpwMonth} />;
  if (leafId === "rep-semanal") {
    return <EmptyScreen detail="Sin corte semanal en las fuentes (solo agregados mensuales)." report="copower" />;
  }
  if (leafId === "rep-mensual" || leafId === "rep-cliente") {
    return gteMonthOk ? (
      <MeetingBrief month={month as GranTierraMonthKey} monthLabel={monthLabel} />
    ) : (
      <SourceMeetingBrief report="gran_tierra" month={month} monthLabel={monthLabel} />
    );
  }
  if (leafId === "rep-export") {
    return (
      <EmptyScreen
        detail="Use impresión del navegador sobre Reunión mensual / Dashboard; export automatizado pendiente."
        report="dual"
      />
    );
  }

  return <EmptyScreen detail="Seleccione una opción del árbol lateral." />;
}

export function PlatformContent({
  page,
  leafId,
  month,
  monthLabel,
  onNavigateToRca,
  focusRcaId,
  onFocusRcaConsumed,
  rcaCases,
  onRcaCasesChange,
  onCreateRcaFromEvent,
  onCreateBlankRca,
}: Props) {
  const ctx = resolveViewContext(page, leafId);

  if (leafId.startsWith("cmp-")) {
    if (leafId === "cmp-bench") {
      return <EmptyScreen detail="Sin benchmark externo cargado (solo metas Orden 1 internas)." report="dual" />;
    }
    if (leafId === "cmp-periodo-copower") {
      return <SourceMonthCompare report="copower" month={month} monthLabel={monthLabel} />;
    }
    if (leafId === "cmp-periodo-gte") {
      return <SourceMonthCompare report="gran_tierra" month={month} monthLabel={monthLabel} />;
    }
    if (
      leafId === "cmp-periodo" ||
      leafId === "cmp-kpi" ||
      leafId === "cmp-diff" ||
      leafId === "cmp-tend"
    ) {
      return (
        <DualCompare
          page={page}
          leafId={leafId}
          month={month}
          monthLabel={monthLabel}
          body={(r) => <SourceMonthCompare report={r} month={month} monthLabel={monthLabel} />}
        />
      );
    }
    if (leafId === "cmp-fuentes") {
      return (
        <div className="fuentes-compare-stack">
          <FuentesCompareResumen month={month} monthLabel={monthLabel} />
          <DualCompare
            page={page}
            leafId={leafId}
            month={month}
            monthLabel={monthLabel}
            body={(r) => (
              <ScreenShell report={r} headless>
                <HoursPanel report={r} month={month} />
                <MachinesTable report={r} month={month} />
              </ScreenShell>
            )}
          />
        </div>
      );
    }
    if (leafId === "cmp-desv" || leafId === "cmp-sla") {
      return (
        <DualCompare
          page={page}
          leafId={leafId}
          month={month}
          monthLabel={monthLabel}
          body={(r) => <DeviationPanel report={r} month={month} />}
        />
      );
    }
  }

  if (
    ctx.report === "dual" &&
    !INTEGRATED_DUAL_LEAVES.has(leafId) &&
    !leafId.startsWith("cfg-campos")
  ) {
    return (
      <DualCompare
        page={page}
        leafId={leafId}
        month={month}
        monthLabel={monthLabel}
        onNavigateToRca={onNavigateToRca}
        focusRcaId={focusRcaId}
        onFocusRcaConsumed={onFocusRcaConsumed}
        rcaCases={rcaCases}
        onRcaCasesChange={onRcaCasesChange}
        onCreateRcaFromEvent={onCreateRcaFromEvent}
        onCreateBlankRca={onCreateBlankRca}
      />
    );
  }

  const report = resolveReport(page, leafId);
  return (
    <PlatformBody
      page={page}
      leafId={leafId}
      month={month}
      monthLabel={monthLabel}
      report={report}
      onNavigateToRca={onNavigateToRca}
      focusRcaId={focusRcaId}
      onFocusRcaConsumed={onFocusRcaConsumed}
      rcaCases={rcaCases}
      onRcaCasesChange={onRcaCasesChange}
      onCreateRcaFromEvent={onCreateRcaFromEvent}
      onCreateBlankRca={onCreateBlankRca}
    />
  );
}
