import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Factory,
  Gauge,
  Wrench,
} from "lucide-react";
import type { FieldParkId } from "./urlRouting";
import { PARK_PROFILE, PARK_SECTIONS } from "./ParkDossier";
import { CostayacoFieldOverview } from "../reports/CostayacoFieldOverview";
import { CYC_SYSTEM } from "../reports/costayacoOverviewData";
import { COSTAYACO_SABANA_NOV } from "../reports/costayacoSabanaNov2026";
import {
  ACRD_HISTORY,
  PUTN_HISTORY,
} from "../history/reliabilityHistory";
import {
  compactHours,
  quantifiedNovember,
  reliabilitySnapshot,
} from "../history/failureMetrics";
import type { NovemberField } from "../history/novemberFailures";
import {
  novemberDailyField,
  novemberDailyHasData,
  novemberDailyMeta,
} from "../history/novemberDailyGte";
import {
  novemberDailyPad4Field,
  novemberDailyPad4HasData,
  novemberDailyPad4Meta,
} from "../history/novemberDailyPad4";
import { ParkPulse } from "./ParkPulse";

type Props = {
  park: FieldParkId;
  month: string;
  monthLabel: string;
  onSection: (sectionId: string) => void;
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

function pct(v: number | null | undefined) {
  if (v == null) return "—";
  return `${String(v).replace(".", ",")}%`;
}

function lastClosedLabel(park: FieldParkId) {
  if (park === "pad4") {
    for (let i = ACRD_HISTORY.length - 1; i >= 0; i--) {
      const row = ACRD_HISTORY[i];
      if (row.coverage === "abierto" || !row.kpi?.availability) continue;
      return {
        label: row.label,
        disp: row.kpi.availability * 100,
        conf: row.kpi.reliability == null ? null : row.kpi.reliability * 100,
      };
    }
    return null;
  }
  for (let i = PUTN_HISTORY.length - 1; i >= 0; i--) {
    const row = PUTN_HISTORY[i];
    if (row.coverage === "abierto") continue;
    if (park === "vonu" && row.vonuAvailability != null) {
      return {
        label: row.label,
        disp: row.vonuAvailability * 100,
        conf: row.vonuReliability == null ? null : row.vonuReliability * 100,
      };
    }
    if (park === "costayaco" && row.copower.availability != null) {
      return {
        label: row.label,
        disp: row.copower.availability * 100,
        conf: row.copower.reliability == null ? null : row.copower.reliability * 100,
      };
    }
  }
  return null;
}

type NavCard = {
  id: string;
  label: string;
  hint: string;
  icon: typeof Activity;
};

export function ParkHome({ park, month, monthLabel, onSection }: Props) {
  const profile = PARK_PROFILE[park];
  const goal = GOAL[park];
  const openMonth =
    month === "Nov" ||
    novemberDailyHasData(month) ||
    (park === "pad4" && novemberDailyPad4HasData(month));

  const putnMeta = novemberDailyMeta();
  const pad4Meta = novemberDailyPad4Meta();
  const dailyMeta = park === "pad4" ? pad4Meta : putnMeta;
  const putnField = park === "costayaco" || park === "vonu" ? park : null;
  const putnDaily = openMonth && putnField ? novemberDailyField(putnField) : null;
  const pad4Daily = openMonth && park === "pad4" ? novemberDailyPad4Field() : null;

  const foField = FO_FIELD[park];
  const events = useMemo(
    () => (openMonth && foField ? quantifiedNovember([foField]) : []),
    [openMonth, foField],
  );
  const snap = useMemo(() => reliabilitySnapshot(events), [events]);
  const closed = lastClosedLabel(park);

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
  const foCount = openMonth
    ? foField
      ? snap.events
      : (putnDaily?.fallas ?? pad4Daily?.fallas ?? null)
    : null;
  const fueraLabel = openMonth ? compactHours(snap.downtimeHours) : "—";
  const extLabel = openMonth
    ? foField
      ? compactHours(snap.externalHours)
      : putnDaily
        ? compactHours(putnDaily.hExt)
        : pad4Daily
          ? compactHours(pad4Daily.hCli)
          : compactHours(snap.externalHours)
    : "—";

  const tone =
    liveDisp != null && goal != null
      ? liveDisp >= goal
        ? "ok"
        : "warn"
      : snap.copowerHours > 0
        ? "warn"
        : "ok";

  const corteDay = dailyMeta.corteDay;
  const corteLabel = openMonth ? dailyMeta.corteLabel : `Cierre · ${monthLabel}`;

  const topMachines = snap.machines.slice(0, 3);
  const topCauses = snap.causes.slice(0, 2);

  const navCards = useMemo((): NavCard[] => {
    const available = new Set(PARK_SECTIONS[park].map((s) => s.id));
    const cards: NavCard[] = [];

    if (available.has("fallas")) {
      cards.push({
        id: "fallas",
        label: "Fallas",
        hint:
          foCount != null
            ? `${foCount} eventos · ${fueraLabel} detenidas`
            : "Ver días con parada",
        icon: AlertTriangle,
      });
    }
    if (available.has("causas")) {
      cards.push({
        id: "causas",
        label: "Causas",
        hint: topCauses[0]
          ? `${topCauses[0].count} ${topCauses[0].count === 1 ? "evento" : "eventos"} · ${compactHours(topCauses[0].hours)}`
          : "Análisis RCA",
        icon: Activity,
      });
    }
    if (available.has("mantenimiento")) {
      cards.push({
        id: "mantenimiento",
        label: "Mantenimiento",
        hint: `${COSTAYACO_SABANA_NOV.programmedCount} trabajos · 16–22 nov`,
        icon: Wrench,
      });
    }
    if (available.has("maquinas")) {
      cards.push({
        id: "maquinas",
        label: "Máquinas",
        hint:
          park === "costayaco"
            ? `${CYC_SYSTEM.gasMachines} a gas · ${CYC_SYSTEM.potenciaBloque}`
            : "Estado de la flota",
        icon: Factory,
      });
    }
    if (available.has("desempeno")) {
      cards.push({
        id: "desempeno",
        label: "Desempeño",
        hint: goal != null ? `Meta ${goal}% disponibilidad` : "Indicadores del mes",
        icon: Gauge,
      });
    }
    if (available.has("parada")) {
      cards.push({
        id: "parada",
        label: "Parada del 12",
        hint: "Evento común a las 16:58",
        icon: AlertTriangle,
      });
    }
    if (available.has("valvulas")) {
      cards.push({
        id: "valvulas",
        label: "Válvulas",
        hint: "Estado y mediciones",
        icon: Wrench,
      });
    }
    return cards;
  }, [park, foCount, fueraLabel, topCauses, goal]);

  const goalHint =
    goal != null
      ? liveDisp == null
        ? `Meta ${goal}%`
        : liveDisp >= goal
          ? `Cumple meta ${goal}%`
          : `Bajo meta ${goal}%`
      : "Lectura N+1";

  return (
    <section className={`park-home park-home--${tone}`} aria-label={`Inicio de ${profile.label}`}>
      <header className="park-home-hero">
        <div className="park-home-hero-copy">
          <p className="park-home-kicker">{corteLabel}</p>
          <h2>¿Cómo va el campo?</h2>
          <p>
            {openMonth ? `Avance ${corteDay} de 30 días` : `Cierre de ${monthLabel}`}
            {" · "}
            {goalHint}
          </p>
        </div>
        <span className={`park-home-badge park-home-badge--${tone}`}>
          {tone === "ok" ? "En meta" : "Revisar"}
        </span>
      </header>

      <div className="park-home-score" aria-label="Indicadores principales">
        <article className="park-home-score-card">
          <p className="park-home-score-label">Disponibilidad</p>
          <p className="park-home-score-value">{pct(liveDisp)}</p>
          <p className="park-home-score-note">
            Tiempo listo para generar
            {goal != null ? ` · meta ${goal}%` : ""}
          </p>
        </article>
        <article className="park-home-score-card">
          <p className="park-home-score-label">Confiabilidad</p>
          <p className="park-home-score-value">{pct(liveConf)}</p>
          <p className="park-home-score-note">Estabilidad sin fallas imputables</p>
        </article>
      </div>

      <dl className="park-home-kpis" aria-label="Resumen operativo">
        <div className="park-home-kpi">
          <dt>Fallas</dt>
          <dd>{foCount ?? "—"}</dd>
          <small>eventos FO del mes</small>
        </div>
        <div className="park-home-kpi">
          <dt>Horas fuera</dt>
          <dd>{fueraLabel}</dd>
          <small>máquina detenida</small>
        </div>
        <div className="park-home-kpi">
          <dt>Horas externas</dt>
          <dd>{extLabel}</dd>
          <small>causa cliente / red</small>
        </div>
        <div className="park-home-kpi">
          <dt>Energía</dt>
          <dd>
            {liveMwh == null
              ? "—"
              : liveMwh.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
          </dd>
          <small>MWh generados</small>
        </div>
      </dl>

      <div className="park-home-progress" aria-hidden={!openMonth}>
        <div className="park-home-progress-track">
          <span style={{ width: openMonth ? `${(corteDay / 30) * 100}%` : "100%" }} />
        </div>
        <p>
          <strong>{openMonth ? `Día ${corteDay} / 30` : monthLabel}</strong>
          <span>
            {closed
              ? `Cierre ${closed.label}: disponibilidad ${pct(Number(closed.disp.toFixed(2)))}`
              : profile.goal}
          </span>
        </p>
      </div>

      {park === "costayaco" ? (
        <dl className="park-home-context" aria-label="Datos del campo">
          <div>
            <dt>Máquinas a gas</dt>
            <dd>{CYC_SYSTEM.gasMachines}</dd>
          </div>
          <div>
            <dt>Potencia</dt>
            <dd>{CYC_SYSTEM.potenciaBloque}</dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>{CYC_SYSTEM.tension}</dd>
          </div>
          <div>
            <dt>Meta del campo</dt>
            <dd>{CYC_SYSTEM.metaDisp}</dd>
          </div>
        </dl>
      ) : null}

      <div className="park-home-nav-wrap">
        <h3 className="park-home-section-title">Ir a</h3>
        <nav className="park-home-nav" aria-label="Explorar confiabilidad">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <button key={card.id} type="button" onClick={() => onSection(card.id)}>
                <span className="park-home-nav-icon" aria-hidden>
                  <Icon size={16} strokeWidth={1.5} />
                </span>
                <span className="park-home-nav-copy">
                  <strong>{card.label}</strong>
                  <em>{card.hint}</em>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {(topMachines.length > 0 || topCauses.length > 0) && openMonth ? (
        <section className="park-home-signals" aria-label="Qué está pasando">
          {topMachines.length ? (
            <div>
              <h3>Máquinas con más paradas</h3>
              <ul>
                {topMachines.map((row) => (
                  <li key={row.unit}>
                    <strong>{row.unit}</strong>
                    <span>{compactHours(row.hours)} fuera</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {topCauses.length ? (
            <div>
              <h3>Principales causas</h3>
              <ul>
                {topCauses.map((row) => (
                  <li key={row.label} title={row.label}>
                    <strong>
                      {row.count} {row.count === 1 ? "evento" : "eventos"} · {compactHours(row.hours)}
                    </strong>
                    <span>
                      {row.label.length > 48 ? `${row.label.slice(0, 48)}…` : row.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      <details className="park-more">
        <summary>Ver corte completo y gráficas</summary>
        <div className="park-more-body park-home-pulse">
          <ParkPulse
            park={park}
            month={month}
            monthLabel={monthLabel}
            onOpenFallas={() => onSection("fallas")}
          />
        </div>
      </details>

      {park === "costayaco" ? (
        <details className="park-more">
          <summary>Ver mapa y unifilar</summary>
          <div className="park-more-body">
            <CostayacoFieldOverview mapOnly onOpenSection={onSection} />
          </div>
        </details>
      ) : null}
    </section>
  );
}
