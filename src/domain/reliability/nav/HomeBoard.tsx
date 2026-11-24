import { Factory, MapPin, MapPinned } from "lucide-react";
import { useMemo } from "react";
import type { FieldParkId } from "./urlRouting";
import { PARK_PROFILE } from "./ParkDossier";
import { NOVEMBER_2026 } from "../history/reliabilityHistory";
import { fmtHours, quantifiedNovember, reliabilitySnapshot } from "../history/failureMetrics";
import { novemberDailyField, novemberDailyMeta } from "../history/novemberDailyGte";
import type { WorkModule } from "./workModules";
import type { PageKey } from "../types";

type Props = {
  monthLabel: string;
  activePark?: FieldParkId | null;
  onOpenPark: (park: FieldParkId) => void;
};

function pctShort(v: number | null | undefined) {
  if (v == null) return "—";
  return `${(v * 100).toFixed(1).replace(".", ",")}%`;
}

export function HomeBoard({ monthLabel, activePark, onOpenPark }: Props) {
  const meta = novemberDailyMeta();
  const pulses = useMemo(() => {
    const cycLive = novemberDailyField("costayaco");
    const vonuLive = novemberDailyField("vonu");
    const cycFo = reliabilitySnapshot(quantifiedNovember(["costayaco"]));
    const pad = reliabilitySnapshot(quantifiedNovember(["pad4"]));
    return {
      costayaco: `${pctShort(cycLive.disp)} · ${Math.round(cycLive.mwh)} MWh · ${cycFo.events} FO`,
      vonu: `${pctShort(vonuLive.disp)} · ${Math.round(vonuLive.mwh)} MWh`,
      pad4: `${pad.events} FO · ${fmtHours(pad.downtimeHours)} · parada ${NOVEMBER_2026.trip}`,
    };
  }, []);

  const parks: { id: FieldParkId; icon: typeof MapPin; figure: string }[] = [
    { id: "costayaco", icon: MapPin, figure: pulses.costayaco },
    { id: "vonu", icon: MapPinned, figure: pulses.vonu },
    { id: "pad4", icon: Factory, figure: pulses.pad4 },
  ];

  return (
    <div className="home-board">
      <header className="home-hero">
        <p className="eyebrow">
          {monthLabel} · corte {meta.corteDay}
        </p>
        <h1>Parques</h1>
        <p>Corte con reporte diario GTE. Entre a cada parque para indicadores y gráficas.</p>
      </header>

      <div className="home-parks">
        {parks.map((park) => {
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
