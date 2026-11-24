import { useMemo } from "react";
import type { FieldParkId } from "./urlRouting";
import { PARK_PROFILE } from "./ParkDossier";
import {
  ACRD_HISTORY,
  NOVEMBER_2026,
  PUTN_HISTORY,
} from "../history/reliabilityHistory";
import {
  clipListText,
  compactHours,
  failureCalendarDays,
  fmtHours,
  quantifiedNovember,
  reliabilitySnapshot,
} from "../history/failureMetrics";
import type { NovemberField } from "../history/novemberFailures";
import { IndicatorChart, NovemberChart } from "../history/IndicatorChart";
import {
  novemberDailyField,
  novemberDailyHasData,
  novemberDailyMeta,
  novemberDailyObsRecent,
} from "../history/novemberDailyGte";
import {
  novemberDailyPad4Field,
  novemberDailyPad4HasData,
  novemberDailyPad4Meta,
} from "../history/novemberDailyPad4";

type Props = {
  park: FieldParkId;
  month: string;
  monthLabel: string;
  onOpenFallas?: () => void;
};

const GOAL: Record<FieldParkId, number | null> = {
  costayaco: 98,
  vonu: 90,
  pad4: null,
};

const FO_FIELD: Partial<Record<FieldParkId, NovemberField>> = {
  costayaco: "costayaco",
  pad4: "pad4",
};

function pct(value: number | null | undefined) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(2).replace(".", ",")} %`;
}

function lastClosedPutn(park: "costayaco" | "vonu") {
  for (let i = PUTN_HISTORY.length - 1; i >= 0; i--) {
    const row = PUTN_HISTORY[i];
    if (row.coverage === "abierto") continue;
    if (park === "vonu" && row.vonuAvailability != null) {
      return {
        label: row.label,
        availability: row.vonuAvailability,
        reliability: row.vonuReliability,
        failures: null as number | null,
      };
    }
    if (park === "costayaco" && row.copower.availability != null) {
      return {
        label: row.label,
        availability: row.copower.availability,
        reliability: row.copower.reliability,
        failures: row.copower.failures,
      };
    }
  }
  return null;
}

function lastClosedPad4() {
  for (let i = ACRD_HISTORY.length - 1; i >= 0; i--) {
    const row = ACRD_HISTORY[i];
    if (row.coverage === "abierto" || !row.kpi?.availability) continue;
    return {
      label: row.label,
      availability: row.kpi.availability,
      reliability: row.kpi.reliability,
      failures: row.kpi.failures,
    };
  }
  return null;
}

function availabilitySeries(park: FieldParkId) {
  if (park === "pad4") {
    const live = novemberDailyPad4Field();
    return ACRD_HISTORY.map((row) => ({
      mes: row.label.slice(0, 3),
      valor:
        row.key === "Nov" && live.disp != null
          ? Number((live.disp * 100).toFixed(2))
          : row.kpi?.availability == null
            ? null
            : row.kpi.availability * 100,
    }));
  }
  const base = PUTN_HISTORY.map((row) => {
    if (park === "vonu") {
      return {
        mes: row.label.slice(0, 3),
        valor: row.vonuAvailability == null ? null : row.vonuAvailability * 100,
      };
    }
    return {
      mes: row.label.slice(0, 3),
      valor: row.copower.availability == null ? null : row.copower.availability * 100,
    };
  });
  if (park === "costayaco" || park === "vonu") {
    const live = novemberDailyField(park);
    return base.map((row) =>
      row.mes === "Nov" && live.disp != null
        ? { ...row, valor: Number((live.disp * 100).toFixed(2)) }
        : row,
    );
  }
  return base;
}

function FoHoursChart({
  days,
  ariaLabel = "Horas fuera por día",
  valueMode = "hours",
}: {
  days: { nombre: string; valor: number; hoursLabel: string }[];
  ariaLabel?: string;
  valueMode?: "hours" | "raw";
}) {
  const max = Math.max(1, ...days.map((d) => d.valor));
  return (
    <div className="park-pulse-fochart" role="img" aria-label={ariaLabel}>
      {days.map((day) => (
        <div key={day.nombre} className="park-pulse-foBar" title={`${day.nombre}: ${day.hoursLabel}`}>
          <span className="park-pulse-foVal">
            {valueMode === "raw" ? day.hoursLabel.replace(" MWh", "") : compactHours(day.valor)}
          </span>
          <span className="park-pulse-foTrack">
            <span style={{ height: `${(day.valor / max) * 100}%` }} />
          </span>
          <span className="park-pulse-foName">{day.nombre}</span>
        </div>
      ))}
    </div>
  );
}

export function ParkPulse({ park, month, monthLabel, onOpenFallas }: Props) {
  const profile = PARK_PROFILE[park];
  const goal = GOAL[park];
  const openMonth =
    month === "Nov" ||
    novemberDailyHasData(month) ||
    (park === "pad4" && novemberDailyPad4HasData(month));
  const putnMeta = novemberDailyMeta();
  const pad4Meta = novemberDailyPad4Meta();
  const putnField = park === "costayaco" || park === "vonu" ? park : null;
  const putnDaily = openMonth && putnField ? novemberDailyField(putnField) : null;
  const pad4Daily = openMonth && park === "pad4" ? novemberDailyPad4Field() : null;
  const dailyObs = putnField ? novemberDailyObsRecent(putnField, 10) : [];
  const dailyMeta = park === "pad4" ? pad4Meta : putnMeta;

  const foField = FO_FIELD[park];
  const events = useMemo(
    () => (openMonth && foField ? quantifiedNovember([foField]) : []),
    [openMonth, foField],
  );
  const snap = useMemo(() => reliabilitySnapshot(events), [events]);
  const byDay = useMemo(() => failureCalendarDays(events), [events]);

  const corteDay = dailyMeta.corteDay;
  const corteLabel = openMonth ? dailyMeta.corteLabel : `Cierre · ${monthLabel}`;

  const closed =
    park === "pad4" ? lastClosedPad4() : lastClosedPutn(park === "vonu" ? "vonu" : "costayaco");

  const liveDisp =
    putnDaily?.disp != null
      ? Number((putnDaily.disp * 100).toFixed(2))
      : pad4Daily?.disp != null
        ? Number((pad4Daily.disp * 100).toFixed(2))
        : null;
  const liveConf =
    putnDaily?.conf != null
      ? Number((putnDaily.conf * 100).toFixed(2))
      : pad4Daily?.conf != null
        ? Number((pad4Daily.conf * 100).toFixed(2))
        : null;
  const liveMwh = putnDaily?.mwh ?? pad4Daily?.mwh ?? null;
  const foCount = openMonth ? (foField ? snap.events : putnDaily?.fallas ?? pad4Daily?.fallas ?? null) : null;
  const fueraLabel = openMonth ? compactHours(snap.downtimeHours) : "—";
  const extLabel =
    openMonth && foField
      ? compactHours(snap.externalHours)
      : putnDaily
        ? compactHours(putnDaily.hExt)
        : pad4Daily
          ? compactHours(pad4Daily.hCli)
          : openMonth
            ? compactHours(snap.externalHours)
            : "—";

  const foDayBars = useMemo(() => {
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([iso, list]) => {
        const hours = list.reduce((sum, e) => sum + e.downtimeHours, 0);
        return {
          nombre: String(Number(iso.slice(8, 10))),
          valor: Number(hours.toFixed(2)),
          hoursLabel: fmtHours(hours),
        };
      });
  }, [byDay]);

  const genDayBars = useMemo(() => {
    const rows = putnDaily?.daily ?? pad4Daily?.daily ?? [];
    if (!rows.length) return [];
    return rows.map((row) => ({
      nombre: String(Number(row.fecha.slice(8, 10))),
      valor: Number((row.kwh / 1000).toFixed(2)),
      hoursLabel: `${(row.kwh / 1000).toFixed(1)} MWh`,
    }));
  }, [putnDaily, pad4Daily]);

  const recordDays =
    park === "costayaco"
      ? NOVEMBER_2026.costayacoDays
      : park === "pad4"
        ? NOVEMBER_2026.pad4Days
        : [];

  const series = availabilitySeries(park);
  const tone =
    liveDisp != null && goal != null
      ? liveDisp >= goal
        ? "ok"
        : "warn"
      : snap.copowerHours > 0
        ? "warn"
        : "ok";

  const chartMode =
    openMonth && genDayBars.length && (park === "costayaco" || park === "vonu" || park === "pad4")
      ? "gen"
      : openMonth && foDayBars.length
        ? "fo"
        : openMonth && recordDays.length
          ? "records"
          : "hist";

  const avanceNote =
    pad4Daily
      ? `${pad4Daily.days} d · ${pad4Daily.units} máq.`
      : putnDaily
        ? `${putnDaily.days} d · ${putnDaily.units} máq.`
        : openMonth
          ? `FO hasta día ${foDayBars.at(-1)?.nombre ?? "—"}`
          : monthLabel;

  return (
    <section className={`park-pulse park-pulse--${tone}`} aria-label={`Corte de ${profile.label}`}>
      <header className="park-pulse-head">
        <div>
          <p className="park-pulse-kicker">{corteLabel}</p>
          <h2>Corte del mes</h2>
          <p className="park-pulse-sub">
            {openMonth
              ? putnDaily
                ? "Disp · Conf · energía · FO"
                : pad4Daily
                  ? "ACR · N+1"
                  : "Mes abierto · FO"
              : "Indicadores del mes"}
          </p>
        </div>
        {goal != null ? <span className="park-pulse-goal">Meta {goal}%</span> : <span className="park-pulse-goal">N+1</span>}
      </header>

      <dl className="park-pulse-kpis park-pulse-kpis--summary">
        <div className="park-pulse-kpi park-pulse-kpi--hero">
          <dt>Disp.</dt>
          <dd>{liveDisp == null ? "—" : `${String(liveDisp).replace(".", ",")}%`}</dd>
        </div>
        <div className="park-pulse-kpi park-pulse-kpi--hero">
          <dt>Conf.</dt>
          <dd>{liveConf == null ? "—" : `${String(liveConf).replace(".", ",")}%`}</dd>
        </div>
        <div className="park-pulse-kpi">
          <dt>MWh</dt>
          <dd>
            {liveMwh == null
              ? "—"
              : liveMwh.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
          </dd>
        </div>
        <div className="park-pulse-kpi">
          <dt>FO</dt>
          <dd>{foCount ?? "—"}</dd>
        </div>
      </dl>

      <div className="park-pulse-status">
        <div className="park-pulse-status-main">
          <div className="park-pulse-progress" aria-hidden={!openMonth}>
            <span style={{ width: openMonth ? `${(corteDay / 30) * 100}%` : "100%" }} />
          </div>
          <p className="park-pulse-status-line">
            <strong>{openMonth ? `${corteDay}/30` : monthLabel}</strong>
            <span>{avanceNote}</span>
          </p>
        </div>
        <dl className="park-pulse-status-side">
          <div>
            <dt>Fuera</dt>
            <dd title={openMonth ? fmtHours(snap.downtimeHours) : undefined}>{fueraLabel}</dd>
          </div>
          <div>
            <dt>Ext.</dt>
            <dd>{extLabel}</dd>
          </div>
          <div>
            <dt>Cierre</dt>
            <dd title={closed ? `${pct(closed.availability)} / ${pct(closed.reliability)}` : undefined}>
              {closed?.label ?? "—"}
            </dd>
          </div>
        </dl>
      </div>

      <section className="park-pulse-livechart" aria-label="Lectura rápida del mes">
        <header>
          <h3>
            {chartMode === "gen"
              ? "Energía del mes"
              : chartMode === "fo"
                ? "Fuera de servicio"
                : chartMode === "records"
                  ? "Registros FO"
                  : "Tendencia"}
          </h3>
          <span>{openMonth ? corteLabel : monthLabel}</span>
        </header>
        {chartMode === "gen" ? (
          <FoHoursChart days={genDayBars} ariaLabel="MWh por día" valueMode="raw" />
        ) : chartMode === "fo" ? (
          <FoHoursChart days={foDayBars} />
        ) : chartMode === "records" ? (
          <NovemberChart data={recordDays} />
        ) : (
          <IndicatorChart data={series} goal={goal ?? undefined} />
        )}
      </section>

      {onOpenFallas && openMonth && (park === "costayaco" || park === "pad4") ? (
        <div className="park-pulse-actions">
          <button type="button" className="park-more-btn park-more-btn--ghost" onClick={onOpenFallas}>
            Ver fallas del mes
          </button>
        </div>
      ) : null}

      {chartMode !== "hist" ? (
        <details className="park-more">
          <summary>Tendencia vs meta</summary>
          <div className="park-more-body park-pulse-board">
            <section className="park-pulse-card park-pulse-chart">
              <IndicatorChart data={series} goal={goal ?? undefined} />
            </section>
          </div>
        </details>
      ) : null}

      <details className="park-more">
        <summary>Ver más del corte</summary>
        <div className="park-more-body park-bitin-body">
          <p>
            <strong>{profile.place}.</strong> {profile.goal}
            {closed ? ` Último cierre ${closed.label}: Disp ${pct(closed.availability)}.` : ""}
          </p>
          {openMonth && putnDaily ? (
            <>
              <p>
                Fuente GTE {dailyMeta.corte} · {dailyMeta.recordCount} filas · OP {putnDaily.hOp} · SB{" "}
                {putnDaily.hSb} · MTO {putnDaily.hMtoP + putnDaily.hMtoC} · Ext {putnDaily.hExt} h ·{" "}
                {putnDaily.obsCount} observaciones.
              </p>
              <div className="park-bitin-block">
                <h4>Flota · corte GTE</h4>
                <div className="park-daily-table-wrap">
                  <table className="park-daily-table">
                    <thead>
                      <tr>
                        <th>TAG</th>
                        <th>Unidad</th>
                        <th>MWh</th>
                        <th>OP</th>
                        <th>SB</th>
                        <th>Ext</th>
                        <th>Disp</th>
                        <th>FO</th>
                        <th>Horóm.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {putnDaily.unitsDetail.map((row) => (
                        <tr key={row.tag}>
                          <td>
                            <strong>{row.tag}</strong>
                          </td>
                          <td>{row.unidad}</td>
                          <td>{(row.kwh / 1000).toFixed(1)}</td>
                          <td>{row.hOp}</td>
                          <td>{row.hSb}</td>
                          <td>{row.hExt}</td>
                          <td>{row.disp == null ? "—" : `${(row.disp * 100).toFixed(1)}%`}</td>
                          <td>{row.fallas || "—"}</td>
                          <td>
                            {row.horometroFinal == null
                              ? "—"
                              : row.horometroFinal.toLocaleString("es-CO")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {dailyObs.length ? (
                <div className="park-bitin-block">
                  <h4>Observaciones recientes</h4>
                  <ul className="park-daily-obs">
                    {dailyObs.map((row) => (
                      <li key={`${row.fecha}-${row.tag}-${row.texto.slice(0, 24)}`}>
                        <strong>
                          {Number(row.fecha.slice(8, 10))}/{row.fecha.slice(5, 7)} · {row.tag}
                        </strong>
                        <span title={row.texto}>{clipListText(row.texto, 110)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {snap.machines.length ? (
                <div className="park-bitin-block">
                  <h4>FO · más horas</h4>
                  <ul className="park-bitin-chips">
                    {snap.machines.slice(0, 5).map((row) => (
                      <li key={row.unit}>
                        <strong>{row.unit}</strong>
                        <span>{compactHours(row.hours)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {snap.causes.length ? (
                <div className="park-bitin-block">
                  <h4>Causas FO</h4>
                  <ul className="park-bitin-causes">
                    {snap.causes.slice(0, 3).map((row) => (
                      <li key={row.label} title={row.label}>
                        <strong>
                          {row.count}× · {compactHours(row.hours)}
                        </strong>
                        <span>{clipListText(row.label, 40)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : openMonth && pad4Daily ? (
            <>
              <p>
                Fuente reporte diario ACR {dailyMeta.corte} · OP {pad4Daily.hOp} · SB {pad4Daily.hSb} ·
                Prog {pad4Daily.hProg} · FS COPOWER {pad4Daily.hFs} · Cliente {pad4Daily.hCli} h · gas{" "}
                {pad4Daily.gasM3.toLocaleString("es-CO")} m³.
              </p>
              <div className="park-bitin-block">
                <h4>Flota · corte Pad 4</h4>
                <div className="park-daily-table-wrap">
                  <table className="park-daily-table">
                    <thead>
                      <tr>
                        <th>TAG</th>
                        <th>kW nom.</th>
                        <th>MWh</th>
                        <th>OP</th>
                        <th>SB</th>
                        <th>Prog</th>
                        <th>FS</th>
                        <th>Disp</th>
                        <th>FO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pad4Daily.unitsDetail.map((row) => (
                        <tr key={row.tag}>
                          <td>
                            <strong>{row.tag}</strong>
                          </td>
                          <td>{row.kwNom}</td>
                          <td>{(row.kwh / 1000).toFixed(1)}</td>
                          <td>{row.hOp}</td>
                          <td>{row.hSb}</td>
                          <td>{row.hProg || "—"}</td>
                          <td>{row.hFs || "—"}</td>
                          <td>{row.disp == null ? "—" : `${(row.disp * 100).toFixed(1)}%`}</td>
                          <td>{row.fallas || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {snap.machines.length ? (
                <div className="park-bitin-block">
                  <h4>FO · más horas</h4>
                  <ul className="park-bitin-chips">
                    {snap.machines.slice(0, 5).map((row) => (
                      <li key={row.unit}>
                        <strong>{row.unit}</strong>
                        <span>{compactHours(row.hours)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : openMonth ? (
            <>
              <p>Sin reporte diario cargado. Se muestran FO documentados.</p>
              {snap.machines.length ? (
                <ul className="park-bitin-chips">
                  {snap.machines.slice(0, 5).map((row) => (
                    <li key={row.unit}>
                      <strong>{row.unit}</strong>
                      <span>{compactHours(row.hours)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Sin horas por máquina.</p>
              )}
            </>
          ) : (
            <p>Elija noviembre para el detalle del mes abierto.</p>
          )}
        </div>
      </details>
    </section>
  );
}
