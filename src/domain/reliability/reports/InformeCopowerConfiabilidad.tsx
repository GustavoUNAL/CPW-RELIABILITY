import { useMemo, type ReactNode } from "react";
import { InformeLogo } from "./InformeBrandChrome";
import { CopowerResumen } from "./CopowerResumen";
import { DisponibilidadHorasBoard } from "./DisponibilidadHorasBoard";
import { DesempenoMaquinaBoard } from "./DesempenoMaquinaBoard";
import { FailureEventsView } from "./FailureEventsView";
import {
  CollapsibleSlide,
  InformeConfEficienciaSection,
  InformeConfInventarioSection,
  InformeConfMantenimientoSection,
  InformeConfRepetitivosSection,
} from "./InformeConfContinuacion";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import { buildDisponibilidadAnalisis } from "./DisponibilidadAnalisisBoard";
import { enrichEventLog } from "../events/eventLogUtils";
import { MAINTENANCE_PLANS } from "./maintenancePlansData";
import { buildEnergyEfficiency } from "./energyEfficiency";

type Props = {
  month: string;
  monthLabel: string;
  leafId: string;
};

function fmtPct(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return "—";
  return `${v.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`;
}

function fmtH(v: number) {
  return `${v.toLocaleString("es-CO", { maximumFractionDigits: 0 })} h`;
}

function Cover({ monthLabel }: { monthLabel: string }) {
  return (
    <header className="exec-header dash-hero inf-report-cover">
      <InformeLogo className="inf-brand-logo inf-brand-logo--cover" />
      <div className="inf-report-cover-copy">
        <p className="eyebrow">Informes · Confiabilidad COPOWER</p>
        <h2>Informe interno de confiabilidad · Putumayo Norte</h2>
        <p className="muted">
          Periodo {monthLabel} · Costayaco / Vonú · fuente reporte diario y concertación de horas
        </p>
      </div>
      <span className="source-badge cpw">COPOWER</span>
    </header>
  );
}

function ConclusionesCopowerBoard({ month, monthLabel }: { month: string; monthLabel: string }) {
  const cpw = COPOWER_MONTHLY_DATA[month as CopowerMonthKey];
  const disp = buildDisponibilidadAnalisis(month);
  const dispCpw = disp.dispCpw != null ? disp.dispCpw * 100 : null;
  const confCpw = cpw?.kpi.reliability != null ? cpw.kpi.reliability * 100 : null;

  const cierre = useMemo(() => {
    const mto = MAINTENANCE_PLANS.monthlySummary.find((m) => m.monthKey === month) ?? null;
    const logRows = cpw?.eventLog ?? [];
    const consolidated = enrichEventLog(logRows, "copower");
    const failures = logRows.filter((e) => /falla/i.test(e.eventType ?? ""));
    const eqCounts = new Map<string, number>();
    for (const e of failures) {
      const key = (e.equipment || "").trim() || "Sin unidad";
      eqCounts.set(key, (eqCounts.get(key) ?? 0) + 1);
    }
    const repeated = [...eqCounts.entries()]
      .filter(([, n]) => n > 1)
      .sort((a, b) => b[1] - a[1]);
    return {
      mto,
      eff: buildEnergyEfficiency(month),
      failures: failures.length,
      consolidated: consolidated.length,
      totalEvents: logRows.length,
      topRepeated: repeated[0] ?? null,
      copowerFailures: cpw?.summary.copowerFailures ?? 0,
    };
  }, [cpw, month]);

  return (
    <CollapsibleSlide
      id="inf-sec-conclusiones-cpw"
      n={9}
      title={`Conclusiones · ${monthLabel}`}
      sub="Cierre del informe interno COPOWER"
      badge="COPOWER"
      className="inf-conf-conclusiones"
    >
      <div className="inf-conf-concl-kpis">
        <article>
          <span>Disp. COPOWER</span>
          <strong>{fmtPct(dispCpw)}</strong>
          <small>Concertación · OP + stand-by</small>
        </article>
        <article>
          <span>Confiabilidad</span>
          <strong>{fmtPct(confCpw)}</strong>
          <small>Reporte diario</small>
        </article>
        <article>
          <span>Generación</span>
          <strong>
            {cpw ? `${(cpw.totalGenerationKwh / 1000).toFixed(1)} MWh` : "—"}
          </strong>
          <small>Costayaco / Vonú</small>
        </article>
        <article>
          <span>Bitácora</span>
          <strong>{cierre.failures}</strong>
          <small>
            {cierre.copowerFailures} imputables · {cierre.consolidated} consolidados
          </small>
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
      </div>
      <div className="inf-conf-concl-grid">
        <section className="inf-conf-concl-col">
          <p className="eyebrow">Lectura del mes</p>
          <ul>
            <li>
              <strong>Disponibilidad interna {fmtPct(dispCpw)}.</strong> Base concertada (OP + SB) /
              calendario
              {disp.programmed > 0
                ? `: ${fmtH(disp.cpwAvailable)} / ${fmtH(disp.programmed)}`
                : ""}
              . No se usa el indicador publicado por el cliente.
            </li>
            <li>
              <strong>Confiabilidad {fmtPct(confCpw)}.</strong> {cierre.failures} registros tipo
              falla en bitácora COPOWER ({cierre.copowerFailures} clasificados como imputables al
              contratista) sobre {cierre.totalEvents} filas del reporte diario.
            </li>
            <li>
              <strong>Recurrencia.</strong>{" "}
              {!cierre.topRepeated
                ? "Ninguna unidad concentra repeticiones en el periodo."
                : `${cierre.topRepeated[0]} concentra ${cierre.topRepeated[1]} eventos de falla.`}
            </li>
            <li>
              <strong>Plan de mantenimiento.</strong>{" "}
              {cierre.mto
                ? `${cierre.mto.executedCount}/${cierre.mto.programmedCount} intervenciones cerradas y ${cierre.mto.executedHoursMto} h MTO reales sobre ${cierre.mto.plannedHoursMto} h planificadas.`
                : "Sin sábana cargada para el periodo."}
            </li>
            {cierre.eff ? (
              <li>
                <strong>Eficiencia medida.</strong> Heat rate{" "}
                {cierre.eff.heatRateBtuKwh == null
                  ? "N/D"
                  : `${Math.round(cierre.eff.heatRateBtuKwh).toLocaleString("es-CO")} BTU/kWh`}
                {cierre.eff.efficiencyHhvPct != null
                  ? ` · ${cierre.eff.efficiencyHhvPct.toFixed(1)} % HHV`
                  : ""}
                .
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </CollapsibleSlide>
  );
}

function FallasCopowerSection({ month, monthLabel }: { month: string; monthLabel: string }) {
  return (
    <CollapsibleSlide
      id="inf-cpw-fallas-sec"
      n={4}
      title={`Análisis de fallas · ${monthLabel}`}
      sub="Bitácora interna del reporte diario"
      badge="COPOWER"
    >
      <FailureEventsView
        month={month}
        monthLabel={monthLabel}
        mode="copower"
        embedded
        rcaCases={[]}
        costayacoRcaEvents={[]}
      />
    </CollapsibleSlide>
  );
}

function CopowerReportBody({ month, monthLabel }: { month: CopowerMonthKey; monthLabel: string }) {
  return (
    <>
      <CopowerResumen month={month} hideHeader />
      <DisponibilidadHorasBoard month={month} monthLabel={monthLabel} hideInsight n={2} />
      <DesempenoMaquinaBoard month={month} monthLabel={monthLabel} source="copower" />
      <FallasCopowerSection month={month} monthLabel={monthLabel} />
      <InformeConfRepetitivosSection
        month={month}
        monthLabel={monthLabel}
        slideViewport={false}
        report="copower"
      />
      <InformeConfMantenimientoSection
        month={month}
        monthLabel={monthLabel}
        slideViewport={false}
        n={6}
      />
      <InformeConfInventarioSection monthLabel={monthLabel} n={7} />
      <InformeConfEficienciaSection
        month={month}
        monthLabel={monthLabel}
        slideViewport={false}
        n={8}
      />
      <ConclusionesCopowerBoard month={month} monthLabel={monthLabel} />
    </>
  );
}

export function InformeCopowerConfiabilidad({ month, monthLabel, leafId }: Props) {
  const cpwMonth = (month in COPOWER_MONTHLY_DATA ? month : "Jul") as CopowerMonthKey;
  const shell = (children: ReactNode, extraClass = "") => (
    <div className={`dash-module exec-dashboard inf-resultados${extraClass}`}>
      {leafId === "inf-cpw-resumen" ? <Cover monthLabel={monthLabel} /> : null}
      {children}
    </div>
  );

  if (leafId === "inf-cpw-horas") {
    return shell(
      <DisponibilidadHorasBoard month={cpwMonth} monthLabel={monthLabel} hideInsight n={2} />,
    );
  }
  if (leafId === "inf-cpw-maquinas") {
    return shell(
      <DesempenoMaquinaBoard month={cpwMonth} monthLabel={monthLabel} source="copower" />,
    );
  }
  if (leafId === "inf-cpw-fallas") {
    return shell(<FallasCopowerSection month={cpwMonth} monthLabel={monthLabel} />);
  }
  if (leafId === "inf-cpw-repetitivos") {
    return shell(
      <InformeConfRepetitivosSection
        month={cpwMonth}
        monthLabel={monthLabel}
        slideViewport
        report="copower"
      />,
      " inf-viewport-page",
    );
  }
  if (leafId === "inf-cpw-mantenimiento") {
    return shell(
      <InformeConfMantenimientoSection
        month={cpwMonth}
        monthLabel={monthLabel}
        slideViewport
        n={6}
      />,
      " inf-viewport-page",
    );
  }
  if (leafId === "inf-cpw-inventario") {
    return shell(<InformeConfInventarioSection monthLabel={monthLabel} n={7} />);
  }
  if (leafId === "inf-cpw-eficiencia") {
    return shell(
      <InformeConfEficienciaSection
        month={cpwMonth}
        monthLabel={monthLabel}
        slideViewport
        n={8}
      />,
      " inf-viewport-page",
    );
  }
  if (leafId === "inf-cpw-conclusiones") {
    return shell(<ConclusionesCopowerBoard month={cpwMonth} monthLabel={monthLabel} />);
  }

  return shell(<CopowerReportBody month={cpwMonth} monthLabel={monthLabel} />);
}
