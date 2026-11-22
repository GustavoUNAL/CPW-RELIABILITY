import { ChevronRight, Factory, MapPin, MapPinned } from "lucide-react";
import type { FieldParkId } from "./urlRouting";
import { PARK_PROFILE } from "./ParkDossier";
import { NOVEMBER_2026 } from "../history/reliabilityHistory";
import type { WorkModule } from "./workModules";
import type { PageKey } from "../types";

const PARKS: { id: FieldParkId; icon: typeof MapPin; figure: string }[] = [
  { id: "costayaco", icon: MapPin, figure: `${NOVEMBER_2026.costayaco} registros en noviembre` },
  { id: "vonu", icon: MapPinned, figure: "Sin carpeta de fallas en noviembre" },
  { id: "pad4", icon: Factory, figure: `${NOVEMBER_2026.pad4} registros · parada ${NOVEMBER_2026.trip}` },
];

type Props = {
  monthLabel: string;
  activePark?: FieldParkId | null;
  onOpenPark: (park: FieldParkId) => void;
};

export function HomeBoard({ monthLabel, activePark, onOpenPark }: Props) {
  return (
    <div className="home-board">
      <header className="home-hero">
        <p className="eyebrow">{monthLabel}</p>
        <h1>Parques</h1>
        <p>Cada parque abre en su resumen. Cada sección tiene su propia página.</p>
      </header>

      <div className="home-parks">
        {PARKS.map((park) => {
          const profile = PARK_PROFILE[park.id];
          const Icon = park.icon;
          return (
            <button
              key={park.id}
              type="button"
              className={activePark === park.id ? "home-park active" : "home-park"}
              onClick={() => onOpenPark(park.id)}
            >
              <span className="home-module-icon" aria-hidden>
                <Icon size={18} />
              </span>
              <span className="home-park-copy">
                <strong>{profile.label}</strong>
                <small>{profile.place}</small>
                <em>{profile.goal}</em>
                <span>{park.figure}</span>
              </span>
              <span className="park-path">{profile.path}</span>
              <ChevronRight size={16} aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
}

type OpenHandler = (moduleId: string, page: PageKey, leaf: string) => void;

export function ModuleStrip({
  mod,
  activeLeaf,
  onOpen,
  onHome,
}: {
  mod: WorkModule;
  activeLeaf: string;
  onOpen: OpenHandler;
  onHome: () => void;
}) {
  return (
    <nav className="module-strip" aria-label={mod.label}>
      <button type="button" className="module-strip-home" onClick={onHome}>
        Inicio
      </button>
      <strong>{mod.label}</strong>
      <div className="module-strip-items">
        {mod.items.map((item) => (
          <button
            key={`${mod.id}-${item.leaf}`}
            type="button"
            className={activeLeaf === item.leaf ? "active" : undefined}
            onClick={() => onOpen(mod.id, item.page, item.leaf)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
