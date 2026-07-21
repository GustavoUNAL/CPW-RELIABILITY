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
import { DashboardGerencia, DashboardMantenimiento, DashboardOverview } from "./DashboardViews";
import { GenerationDashboard } from "./GenerationDashboard";
import { CopowerCompanyView, GteCompanyView } from "./CompanyViews";
import { FieldAssetsView } from "./FieldAssetsView";
import { fieldKeyFromLeaf } from "../contracts/fieldAssets";
import { CopowerResumen } from "./CopowerResumen";
import { ExecutiveResumen } from "./ExecutiveResumen";
import { MeetingBrief } from "./MeetingBrief";
import { ComparativeAnalysis } from "./ComparativeAnalysis";
import { SourceMeetingBrief, SourceMonthCompare } from "./SourcePanels";
import { MarcoContractual } from "./MarcoContractual";
import { JUNE_2026_IMPUTABLE_EVENTS } from "./juneImputableEvents";
import { CONTRACT_CALC_BASE, CONTRACTUAL_KPI_TARGETS } from "../contracts/gteOrders";
import { assessTechnicalRisk } from "../risk/technicalRisk";
import { generationSectionFromLeaf, resolveReport, resolveViewContext } from "../nav/resolveContext";
import type { PageKey, ReportKey } from "../types";
import { METRIC_DEFS } from "../ui/metricDefs";
import { EmptyScreen, ScreenShell } from "../ui/ScreenShell";

type Props = {
  page: PageKey;
  leafId: string;
  month: string;
  monthLabel: string;
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
}: {
  page: PageKey;
  leafId: string;
  month: string;
  monthLabel: string;
  body?: (report: ReportKey) => ReactNode;
}) {
  return (
    <div className="dual-source-wrap">
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
                <PlatformBody page={page} leafId={leafId} month={month} monthLabel={monthLabel} report={report} />
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
  metric: "disp" | "conf" | "mtbf" | "mttr" | "prod" | "util" | "fs";
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
    fs: {
      label: "Forced / Planned outage",
      value: `${hours(s.hoursFailureCopower)} / ${hours(s.hoursPreventive)}`,
      note: "PF_contr (forzado imputable) · PP (planificado)",
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
}: Props & { report: ReportKey }) {
  const cpwMonth = (COPOWER_MONTHLY_DATA[month as CopowerMonthKey] ? month : "Jun") as CopowerMonthKey;
  const gteMonthOk = Boolean(GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey]);

  if (page === "generacion") {
    return (
      <ScreenShell report="copower" headless>
        <GenerationDashboard section={generationSectionFromLeaf(leafId)} />
      </ScreenShell>
    );
  }

  if (page === "campos") {
    const fieldKey = fieldKeyFromLeaf(leafId);
    if (fieldKey) {
      return <FieldAssetsView fieldKey={fieldKey} month={month} monthLabel={monthLabel} />;
    }
  }

  if (page === "configuracion") {
    if (leafId === "cfg-empresas-copower") {
      return <CopowerCompanyView />;
    }
    if (leafId === "cfg-empresas-gte") {
      return <GteCompanyView />;
    }
    if (leafId === "cfg-parametros") {
      return <MarcoContractual leaf="sec-1-2" report="gran_tierra" month={month} monthLabel={monthLabel} />;
    }
  }

  if (page === "eventos") {
    if (leafId === "bd-ev-dual" || leafId === "bd-fallas") {
      return (
        <ScreenShell report="dual" headless>
          <FailureEventsView month={month} monthLabel={monthLabel} mode="dual" />
        </ScreenShell>
      );
    }
    if (leafId === "bd-ev-copower" || leafId === "proc-eventos") {
      return (
        <ScreenShell report="copower" headless>
          <FailureEventsView month={month} monthLabel={monthLabel} mode="copower" />
        </ScreenShell>
      );
    }
    if (leafId === "bd-ev-gte") {
      return (
        <ScreenShell report="gran_tierra" headless>
          <FailureEventsView month={month} monthLabel={monthLabel} mode="gte" />
        </ScreenShell>
      );
    }
    if (leafId === "an-pareto") {
      return (
        <ScreenShell report="dual" headless>
          <FailureEventsView month={month} monthLabel={monthLabel} mode="dual" failuresOnlyDefault />
        </ScreenShell>
      );
    }
    if (leafId === "proc-clasif") {
      return (
        <ScreenShell report="copower" headless>
          <FailureEventsView month={month} monthLabel={monthLabel} mode="copower" failuresOnlyDefault />
        </ScreenShell>
      );
    }
    if (leafId === "an-criticos") {
      const snap = getSnap("copower", month);
      const ranked = [...(snap?.machineIndicators ?? [])]
        .filter((m) => m.unidad !== "SISTEMA N" && m.fallas > 0)
        .sort((a, b) => b.fallas - a.fallas);
      return (
        <ScreenShell report="copower" title="Equipos críticos" subtitle="Ranking por frecuencia de fallas">
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
    if (leafId === "an-rca") {
      if (month === "Jun") {
        return (
          <ScreenShell report="gran_tierra" title="RCA imputables" subtitle="Junio 2026 · Orden 1">
            <p className="alert-inline">0/7 RCA — multa 4% facturación si no se entregan reportes.</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Unidad</th>
                    <th>PF_contr</th>
                    <th>Observación</th>
                    <th>RCA</th>
                  </tr>
                </thead>
                <tbody>
                  {JUNE_2026_IMPUTABLE_EVENTS.map((e) => (
                    <tr key={e.id}>
                      <td>{e.date}</td>
                      <td>{e.equipment}</td>
                      <td>{e.hoursPfContr} h</td>
                      <td className="detalle-cell">{e.observation}</td>
                      <td>
                        <span className="badge danger">No</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScreenShell>
        );
      }
      return <EmptyScreen detail="Sin tracker RCA formal en este periodo — pendiente de carga." report="gran_tierra" />;
    }
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
    const cpwMap: Record<string, "disp" | "conf" | "mtbf" | "mttr" | "prod" | "util" | "fs"> = {
      "kpi-cpw-disp": "disp",
      "kpi-cpw-conf": "conf",
      "kpi-cpw-mtbf": "mtbf",
      "kpi-cpw-mttr": "mttr",
      "kpi-cpw-prod": "prod",
      "kpi-cpw-util": "util",
      "kpi-cpw-for": "fs",
      "kpi-cpw-planned": "fs",
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

  if (page === "operacion") {
    if (leafId === "bd-op-copower") return <CopowerResumen month={cpwMonth} />;
    if (leafId === "bd-mto") {
      return <EmptyScreen detail="Plan MTO / órdenes de trabajo no vienen en PDF/Excel actuales." report={report} />;
    }
    if (leafId === "bd-alarmas") {
      return <EmptyScreen detail="Pendiente de fuente de alarmas SCADA / DCS." report={report} />;
    }
    if (leafId === "bd-historicos") {
      return <SourceMonthCompare report={report} month={month} monthLabel={monthLabel} />;
    }

    const titles: Record<string, string> = {
      "proc-op": "Horas operación",
      "proc-disp": "Horas disponibles (OP+SB)",
      "proc-fs": "Horas fuera de servicio",
      "proc-mto": "Horas mantenimiento (PP)",
    };
    const snap = getSnap("copower", month);
    if (leafId === "proc-op") {
      return (
        <ScreenShell report="copower" title={titles[leafId]} sourceFile={snap?.sourceFile}>
          <div className="exec-kpi kpi-hero">
            <span>Horas operación</span>
            <strong>{hours(snap?.summary.hoursOperated)}</strong>
          </div>
        </ScreenShell>
      );
    }
    if (leafId === "proc-disp") {
      const avail = snap ? snap.summary.hoursOperated + snap.summary.hoursStandby : null;
      return (
        <ScreenShell report="copower" title={titles[leafId]} sourceFile={snap?.sourceFile}>
          <div className="exec-kpi kpi-hero">
            <span>Disponibles</span>
            <strong>{hours(avail)}</strong>
          </div>
        </ScreenShell>
      );
    }
    if (leafId === "proc-fs") {
      return (
        <ScreenShell report="copower" title={titles[leafId]} sourceFile={snap?.sourceFile}>
          <HoursPanel report="copower" month={month} />
        </ScreenShell>
      );
    }
    if (leafId === "proc-mto") {
      return (
        <ScreenShell report="copower" title={titles[leafId]} sourceFile={snap?.sourceFile}>
          <div className="exec-kpi kpi-hero">
            <span>Preventivo</span>
            <strong>{hours(snap?.summary.hoursPreventive)}</strong>
          </div>
        </ScreenShell>
      );
    }
  }

  if (page === "calidad_datos") {
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
    return (
      <EmptyScreen
        detail={`Módulo de calidad pendiente de pipeline formal (sin inventar reglas).`}
        report={report}
      />
    );
  }

  if (page === "analisis") {
    if (leafId === "an-weibull" || leafId === "an-curvas" || leafId === "an-pred") {
      return (
        <EmptyScreen
          detail="Pendiente de modelo estadístico (Weibull / curvas / predicción) sobre histórico real."
          report="copower"
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
  }

  if (page === "dashboard") {
    if (leafId === "dash-resumen") {
      return <DashboardOverview month={month} monthLabel={monthLabel} />;
    }
    if (leafId === "dash-ejecutivo") {
      return month === "Jun" && gteMonthOk ? (
        <ExecutiveResumen />
      ) : (
        <MeetingBrief month={month as GranTierraMonthKey} monthLabel={monthLabel} />
      );
    }
    if (leafId === "dash-gerencia") {
      return <DashboardGerencia month={month} monthLabel={monthLabel} />;
    }
    if (leafId === "dash-operacion") return <CopowerResumen month={cpwMonth} />;
    if (leafId === "dash-mto") {
      return <DashboardMantenimiento month={month} monthLabel={monthLabel} />;
    }
  }

  if (page === "reportes") {
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
  }

  return <EmptyScreen detail="Seleccione una opción del árbol lateral." />;
}

export function PlatformContent({ page, leafId, month, monthLabel }: Props) {
  const ctx = resolveViewContext(page, leafId);

  if (page === "calidad_datos" && leafId === "cq-auditoria") {
    return month === "Jun" ? (
      <ComparativeAnalysis month="Jun" monthLabel={monthLabel} />
    ) : (
      <EmptyScreen detail="Auditoría PDF vs Excel disponible solo para junio 2026." report="dual" />
    );
  }

  if (page === "comparacion") {
    if (leafId === "cmp-bench") {
      return <EmptyScreen detail="Sin benchmark externo cargado (solo metas Orden 1 internas)." report="dual" />;
    }
    if (leafId === "cmp-kpi" || leafId === "cmp-diff" || leafId === "cmp-tend") {
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

  if (ctx.report === "dual") {
    return <DualCompare page={page} leafId={leafId} month={month} monthLabel={monthLabel} />;
  }

  const report = resolveReport(page, leafId);
  return <PlatformBody page={page} leafId={leafId} month={month} monthLabel={monthLabel} report={report} />;
}
