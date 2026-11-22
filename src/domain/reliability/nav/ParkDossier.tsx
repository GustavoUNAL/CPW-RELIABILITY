import { parkPath, type FieldParkId } from "./urlRouting";
import { FieldAssetsView } from "../reports/FieldAssetsView";
import { CampoFicha } from "../history/CampoFicha";
import { NovemberRecords } from "../history/NovemberRecords";
import { EventoPad4Nov12 } from "../reports/EventoPad4Nov12";
import { CostayacoRcaEventsApp } from "../rca/CostayacoRcaEventsApp";
import type { RcaEventoFalla } from "../rca/types";
import { ParkPulse } from "./ParkPulse";

export const PARK_PROFILE: Record<
  FieldParkId,
  { label: string; place: string; goal: string; path: string }
> = {
  costayaco: {
    label: "Costayaco",
    place: "PUTN · Bloque Chaza",
    goal: "Meta de disponibilidad 98 %.",
    path: "/parques/costayaco/resumen",
  },
  vonu: {
    label: "Vonú",
    place: "PUTN · Bloque Chaza",
    goal: "Meta de disponibilidad 90 %.",
    path: "/parques/vonu/resumen",
  },
  pad4: {
    label: "Pad 4",
    place: "Acordionero · otro contrato",
    goal: "Se lee en N+1. No se suma con Costayaco ni con Vonú.",
    path: "/parques/pad4/resumen",
  },
};

export const PARK_SECTIONS: Record<
  FieldParkId,
  { id: string; label: string; short: string }[]
> = {
  costayaco: [
    { id: "resumen", label: "Resumen", short: "Resumen" },
    { id: "desempeno", label: "Desempeño", short: "Desemp." },
    { id: "contrato", label: "Contrato", short: "Contrato" },
    { id: "maquinas", label: "Máquinas", short: "Máq." },
    { id: "activos", label: "Activos", short: "Activos" },
    { id: "fallas", label: "Fallas", short: "Fallas" },
    { id: "causas", label: "Causas", short: "Causas" },
  ],
  vonu: [
    { id: "resumen", label: "Resumen", short: "Resumen" },
    { id: "desempeno", label: "Desempeño", short: "Desemp." },
    { id: "contrato", label: "Contrato", short: "Contrato" },
    { id: "maquinas", label: "Máquinas", short: "Máq." },
    { id: "activos", label: "Activos", short: "Activos" },
    { id: "fallas", label: "Fallas", short: "Fallas" },
  ],
  pad4: [
    { id: "resumen", label: "Resumen", short: "Resumen" },
    { id: "fallas", label: "Fallas", short: "Fallas" },
    { id: "parada", label: "Parada del 12", short: "Parada 12" },
  ],
};

export function parkSectionId(park: FieldParkId, section?: string | null): string {
  const sections = PARK_SECTIONS[park];
  if (section && sections.some((item) => item.id === section)) return section;
  return sections[0].id;
}

type Props = {
  park: FieldParkId;
  month: string;
  monthLabel: string;
  activeSection?: string | null;
  onSection: (sectionId: string) => void;
  rcaEvents?: RcaEventoFalla[];
  onRcaChange?: (next: RcaEventoFalla) => void;
};

function ParkSectionBody({
  park,
  section,
  month,
  monthLabel,
  rcaEvents,
  onRcaChange,
  onSection,
}: {
  park: FieldParkId;
  section: string;
  month: string;
  monthLabel: string;
  rcaEvents?: RcaEventoFalla[];
  onRcaChange?: (next: RcaEventoFalla) => void;
  onSection: (sectionId: string) => void;
}) {
  if (section === "resumen") {
    return (
      <section className="park-block park-block--pulse">
        <ParkPulse
          park={park}
          month={month}
          monthLabel={monthLabel}
          onOpenFallas={() => onSection("fallas")}
        />
        <details className="park-more park-more--tech">
          <summary>Ver ficha técnica</summary>
          <div className="park-more-body">
            {park === "pad4" ? (
              <CampoFicha field="pad4" month={month} monthLabel={monthLabel} embedded />
            ) : (
              <FieldAssetsView
                fieldKey={park === "vonu" ? "vonu" : "costayaco"}
                section="resumen"
                month={month}
                monthLabel={monthLabel}
              />
            )}
          </div>
        </details>
      </section>
    );
  }

  if (park === "pad4") {
    if (section === "fallas") {
      return (
        <section className="park-block park-block--flush">
          <NovemberRecords view="gte" month={month} monthLabel={monthLabel} />
        </section>
      );
    }
    if (section === "parada") {
      return (
        <section className="park-block">
          <h2>Parada del 12 de noviembre</h2>
          <EventoPad4Nov12 />
        </section>
      );
    }
    return (
      <section className="park-block">
        <CampoFicha field="pad4" month={month} monthLabel={monthLabel} embedded />
      </section>
    );
  }

  if (section === "fallas") {
    return (
      <section className="park-block park-block--flush">
        {park === "costayaco" ? (
          <NovemberRecords view="copower" month={month} monthLabel={monthLabel} />
        ) : (
          <p className="card">Vonú no tiene carpeta de fallas FO-GE-033 en este periodo.</p>
        )}
      </section>
    );
  }

  if (section === "causas" && park === "costayaco") {
    return (
      <section className="park-block park-block--flush">
        <CostayacoRcaEventsApp events={rcaEvents} onEventChange={onRcaChange} />
      </section>
    );
  }

  const fieldSection = section === "maquinas" ? "parque" : section;
  return (
    <section className="park-block">
      <FieldAssetsView
        fieldKey={park}
        section={fieldSection === "desempeno" || fieldSection === "contrato" || fieldSection === "activos" || fieldSection === "parque" ? fieldSection : "resumen"}
        month={month}
        monthLabel={monthLabel}
      />
    </section>
  );
}

export function ParkDossier({
  park,
  month,
  monthLabel,
  activeSection,
  onSection,
  rcaEvents,
  onRcaChange,
}: Props) {
  const profile = PARK_PROFILE[park];
  const sections = PARK_SECTIONS[park];
  const section = parkSectionId(park, activeSection);

  return (
    <div className="park-dossier">
      <header className="park-dossier-head">
        <div className="park-dossier-head-main">
          <p className="eyebrow">{profile.place}</p>
          <h1>{profile.label}</h1>
        </div>
        <p className="park-dossier-goal">
          <span className="park-dossier-goal-full">
            {profile.goal} Mes de {monthLabel.trim()}.
          </span>
          <span className="park-dossier-goal-short">
            Meta · {monthLabel.trim()}
          </span>
        </p>
        <p className="park-path">{parkPath(park, section)}</p>
      </header>
      <nav
        className={`park-toc park-toc--${park}`}
        aria-label={`Secciones de ${profile.label}`}
      >
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            className={section === item.id ? "active" : undefined}
            aria-current={section === item.id ? "page" : undefined}
            onClick={() => onSection(item.id)}
          >
            <span className="park-toc-full">{item.label}</span>
            <span className="park-toc-short">{item.short}</span>
          </button>
        ))}
      </nav>
      <ParkSectionBody
        park={park}
        section={section}
        month={month}
        monthLabel={monthLabel}
        rcaEvents={rcaEvents}
        onRcaChange={onRcaChange}
        onSection={onSection}
      />
    </div>
  );
}
