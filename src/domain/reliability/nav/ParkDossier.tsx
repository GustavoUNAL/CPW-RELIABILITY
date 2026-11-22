import { parkPath, type FieldParkId } from "./urlRouting";
import { FieldAssetsView } from "../reports/FieldAssetsView";
import { CampoFicha } from "../history/CampoFicha";
import { NovemberRecords } from "../history/NovemberRecords";
import { EventoPad4Nov12 } from "../reports/EventoPad4Nov12";
import { CostayacoRcaEventsApp } from "../rca/CostayacoRcaEventsApp";
import type { RcaEventoFalla } from "../rca/types";

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

export const PARK_SECTIONS: Record<FieldParkId, { id: string; label: string }[]> = {
  costayaco: [
    { id: "resumen", label: "Resumen" },
    { id: "desempeno", label: "Desempeño" },
    { id: "contrato", label: "Contrato" },
    { id: "maquinas", label: "Máquinas" },
    { id: "activos", label: "Activos" },
    { id: "fallas", label: "Fallas" },
    { id: "causas", label: "Causas" },
  ],
  vonu: [
    { id: "resumen", label: "Resumen" },
    { id: "desempeno", label: "Desempeño" },
    { id: "contrato", label: "Contrato" },
    { id: "maquinas", label: "Máquinas" },
    { id: "activos", label: "Activos" },
    { id: "fallas", label: "Fallas" },
  ],
  pad4: [
    { id: "resumen", label: "Resumen" },
    { id: "fallas", label: "Fallas" },
    { id: "parada", label: "Parada del 12" },
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
}: {
  park: FieldParkId;
  section: string;
  month: string;
  monthLabel: string;
  rcaEvents?: RcaEventoFalla[];
  onRcaChange?: (next: RcaEventoFalla) => void;
}) {
  if (park === "pad4") {
    if (section === "fallas") {
      return (
        <section className="park-block">
          <h2>Fallas</h2>
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
      <section className="park-block">
        <h2>Fallas</h2>
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
      <section className="park-block">
        <h2>Causas</h2>
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
        <p className="eyebrow">{profile.place}</p>
        <h1>{profile.label}</h1>
        <p>
          {profile.goal} Mes de {monthLabel}.
        </p>
        <p className="park-path">{parkPath(park, section)}</p>
      </header>
      <nav className="park-toc" aria-label={`Secciones de ${profile.label}`}>
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            className={section === item.id ? "active" : undefined}
            aria-current={section === item.id ? "page" : undefined}
            onClick={() => onSection(item.id)}
          >
            {item.label}
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
      />
    </div>
  );
}
