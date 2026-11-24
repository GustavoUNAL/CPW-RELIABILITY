import { useEffect, useState } from "react";
import {
  CYC_FAMILIES,
  CYC_MACHINES,
  CYC_OVERVIEW_ASSETS,
  CYC_SYSTEM,
  type CycMachine,
  type CycMachineFamily,
} from "./costayacoOverviewData";

function kw(n: number) {
  return n.toLocaleString("es-CO");
}

function preferOverviewOpen() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 901px)").matches;
}

type Props = {
  onOpenSection?: (sectionId: string) => void;
  /** Solo mapa/flota/unifilar, sin strip de contexto. */
  mapOnly?: boolean;
};

export function CostayacoFieldOverview({ onOpenSection, mapOnly = false }: Props) {
  const [selected, setSelected] = useState<CycMachine | null>(CYC_MACHINES[0]);
  const [lightbox, setLightbox] = useState<"config" | "unifilar" | null>(null);
  const [open, setOpen] = useState(mapOnly);
  const family = selected ? CYC_FAMILIES[selected.family] : null;

  useEffect(() => {
    if (mapOnly) {
      setOpen(true);
      return;
    }
    setOpen(preferOverviewOpen());
  }, [mapOnly]);

  const mapBody = (
    <div className={`cyc-overview-body${mapOnly ? " cyc-overview-body--bare" : ""}`}>
      <div className="cyc-overview-map-grid">
        <div className="cyc-overview-map" role="img" aria-label="Croquis de máquinas Costayaco">
          <svg viewBox="0 0 100 100" className="cyc-pad-svg">
            <defs>
              <linearGradient id="cycPadGround" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#dfe8df" />
                <stop offset="55%" stopColor="#cfd9cf" />
                <stop offset="100%" stopColor="#b9c7bc" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="96" height="96" rx="3" fill="url(#cycPadGround)" />
            <rect
              x="8"
              y="12"
              width="58"
              height="76"
              rx="2"
              fill="none"
              stroke="#5b6b5e"
              strokeWidth="0.4"
              strokeDasharray="1.2 0.8"
            />
            <text x="10" y="10" className="cyc-pad-label">
              Pad Costayaco · gas
            </text>
            <rect
              x="68"
              y="12"
              width="24"
              height="76"
              rx="2"
              fill="none"
              stroke="#4a6b52"
              strokeWidth="0.4"
              strokeDasharray="1.2 0.8"
            />
            <text x="70" y="10" className="cyc-pad-label">
              Jinan
            </text>
            <line x1="10" y1="86" x2="88" y2="86" stroke="#1e3a5f" strokeWidth="1.1" />
            <text x="50" y="93" textAnchor="middle" className="cyc-pad-bus">
              Barra 13,8 kV
            </text>
            {CYC_MACHINES.map((m) => {
              const active = selected?.tag === m.tag;
              return (
                <g
                  key={m.tag}
                  className={`cyc-pad-unit cyc-pad-unit--${m.family}${active ? " is-active" : ""}`}
                  transform={`translate(${m.x} ${m.y})`}
                  onClick={() => setSelected(m)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(m);
                    }
                  }}
                >
                  <rect x="-5.5" y="-4.2" width="11" height="8.4" rx="1.1" />
                  <text y="1.1" textAnchor="middle">
                    {m.tag.replace("CPW-", "")}
                  </text>
                  <title>
                    {m.tag} · {m.model} · {kw(m.installedKw)} kW
                  </title>
                </g>
              );
            })}
          </svg>
          <ul className="cyc-pad-legend">
            <li className="cyc-pad-legend--j320">J320 · 4</li>
            <li className="cyc-pad-legend--j420">J420 · 3</li>
            <li className="cyc-pad-legend--jinan">Jinan · 3</li>
          </ul>
        </div>

        <aside className="cyc-overview-selected" aria-live="polite">
          {selected && family ? (
            <>
              <img src={family.photo} alt={family.label} />
              <div>
                <p className="eyebrow">{family.label}</p>
                <h3>{selected.tag}</h3>
                <dl>
                  <div>
                    <dt>Modelo</dt>
                    <dd>{selected.model}</dd>
                  </div>
                  <div>
                    <dt>Instalada</dt>
                    <dd>{kw(selected.installedKw)} kW</dd>
                  </div>
                  <div>
                    <dt>Cap. media</dt>
                    <dd>{kw(selected.deliveredKw)} kW</dd>
                  </div>
                  <div>
                    <dt>Familia</dt>
                    <dd>{family.units.length}</dd>
                  </div>
                </dl>
              </div>
            </>
          ) : null}
        </aside>
      </div>

      <div className="cyc-overview-families">
        {(Object.keys(CYC_FAMILIES) as CycMachineFamily[]).map((key) => {
          const fam = CYC_FAMILIES[key];
          return (
            <article key={key} className={`cyc-family-card cyc-family-card--${fam.tone}`}>
              <header>
                <h3>{fam.label}</h3>
                <p>
                  {kw(fam.installedKw)} kW · {fam.units.length} equipos
                </p>
              </header>
              <div className="cyc-family-card-body">
                <img src={fam.photo} alt={fam.label} />
                <ul>
                  {fam.units.map((u) => (
                    <li key={u}>
                      <button
                        type="button"
                        onClick={() => setSelected(CYC_MACHINES.find((m) => m.tag === u) ?? null)}
                      >
                        {u}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>

      <div className="cyc-overview-visuals">
        <figure className="cyc-overview-figure">
          <button type="button" className="cyc-overview-zoom" onClick={() => setLightbox("config")}>
            <img src={CYC_OVERVIEW_ASSETS.configuracion} alt="Configuración de equipos Costayaco" />
          </button>
          <figcaption>Configuración · indicadores PUTN</figcaption>
        </figure>
        <figure className="cyc-overview-figure">
          <button type="button" className="cyc-overview-zoom" onClick={() => setLightbox("unifilar")}>
            <img src={CYC_OVERVIEW_ASSETS.unifilar} alt="Unifilar Costayaco" />
          </button>
          <figcaption>Unifilar · GTE-PR-FO-028</figcaption>
        </figure>
      </div>
    </div>
  );

  return (
    <section className="cyc-field" aria-label="Contexto del campo Costayaco">
      {!mapOnly ? (
        <div className="cyc-field-strip">
          <div className="cyc-field-strip-copy">
            <p className="eyebrow">{CYC_SYSTEM.place}</p>
            <h2>Confiabilidad del campo</h2>
            <p className="cyc-field-strip-lead">{CYC_SYSTEM.description}</p>
          </div>
          {onOpenSection ? (
            <nav className="cyc-field-jump" aria-label="Explorar confiabilidad">
              <button type="button" onClick={() => onOpenSection("fallas")}>
                Fallas
              </button>
              <button type="button" onClick={() => onOpenSection("maquinas")}>
                Máquinas
              </button>
              <button type="button" onClick={() => onOpenSection("mantenimiento")}>
                Mto.
              </button>
              <button type="button" onClick={() => onOpenSection("causas")}>
                Causas
              </button>
            </nav>
          ) : null}
          <dl className="cyc-overview-stats">
            <div>
              <dt>Máq.</dt>
              <dd>{CYC_SYSTEM.gasMachines}</dd>
            </div>
            <div>
              <dt>MW</dt>
              <dd>8</dd>
            </div>
            <div>
              <dt>kV</dt>
              <dd>13,8</dd>
            </div>
            <div>
              <dt>Meta</dt>
              <dd>98%</dd>
            </div>
          </dl>
        </div>
      ) : null}

      {mapOnly ? (
        mapBody
      ) : (
        <details
          className="cyc-overview"
          open={open}
          onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
        >
          <summary className="cyc-overview-summary">
            <span className="cyc-overview-summary-title">Mapa y unifilar</span>
            <span className="cyc-overview-summary-hint">Croquis del pad · familias · diagrama</span>
          </summary>
          {mapBody}
        </details>
      )}

      {lightbox ? (
        <div
          className="cyc-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox === "config" ? "Configuración de equipos" : "Unifilar Costayaco"}
          onClick={() => setLightbox(null)}
        >
          <button type="button" className="cyc-lightbox-close" onClick={() => setLightbox(null)}>
            Cerrar
          </button>
          <img
            src={
              lightbox === "config" ? CYC_OVERVIEW_ASSETS.configuracion : CYC_OVERVIEW_ASSETS.unifilar
            }
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}
