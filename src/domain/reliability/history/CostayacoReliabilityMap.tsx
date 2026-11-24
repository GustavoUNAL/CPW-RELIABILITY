import { useMemo, useState } from "react";
import {
  ORIGIN_LABEL,
  ORIGIN_SHORT,
  compactHours,
  fmtHours,
  type FailureOrigin,
  type QuantifiedFailure,
} from "./failureMetrics";

type Props = {
  events: QuantifiedFailure[];
  onOpenDay: (iso: string, eventId?: string) => void;
  /** Solo diagrama + lectura; la lista de FO vive en la vista padre. */
  compact?: boolean;
  /** Sincroniza el nodo activo con el filtro de la vista. */
  focusOrigin?: FailureOrigin | null;
  onFocusOrigin?: (origin: FailureOrigin | null) => void;
};

type SystemNode = {
  id: FailureOrigin | "parque";
  label: string;
  role: string;
  x: number;
  y: number;
};

const NODES: SystemNode[] = [
  { id: "sin", label: "SIN", role: "Referencia eléctrica", x: 18, y: 18 },
  { id: "red", label: "Red campo", role: "Distribución / PAD", x: 82, y: 18 },
  { id: "mru", label: "MRU", role: "Gas tratado · Soenergy", x: 18, y: 52 },
  { id: "gas", label: "Gas crudo", role: "MQT · VNU · CYC", x: 82, y: 52 },
  { id: "copower", label: "Activo CPW", role: "Falla propia máquina", x: 50, y: 38 },
  { id: "parque", label: "Parque CYC", role: "Generación COPOWER", x: 50, y: 78 },
];

const LINKS: { from: SystemNode["id"]; to: SystemNode["id"]; label: string }[] = [
  { from: "sin", to: "parque", label: "isla / referencia" },
  { from: "red", to: "parque", label: "falla / cortocircuito" },
  { from: "mru", to: "parque", label: "gas tratado" },
  { from: "gas", to: "parque", label: "combustible" },
  { from: "copower", to: "parque", label: "protección / shutdown" },
];

function dayNumber(iso: string) {
  return Number(iso.slice(8, 10));
}

function nodeEvents(events: QuantifiedFailure[], nodeId: SystemNode["id"]) {
  if (nodeId === "parque") return events;
  return events.filter((e) => e.origin === nodeId);
}

export function CostayacoReliabilityMap({
  events,
  onOpenDay,
  compact = false,
  focusOrigin = null,
  onFocusOrigin,
}: Props) {
  const [localFocus, setLocalFocus] = useState<SystemNode["id"] | null>(null);
  const focus = onFocusOrigin ? focusOrigin : localFocus;

  const setFocus = (next: SystemNode["id"] | null) => {
    const value = next === "parque" ? null : next;
    if (onFocusOrigin) {
      onFocusOrigin(value && value !== "parque" ? (value as FailureOrigin) : null);
      return;
    }
    setLocalFocus(next);
  };

  const focusedEvents = useMemo(() => {
    if (!focus) return events;
    return nodeEvents(events, focus);
  }, [events, focus]);

  const ownHours = events
    .filter((e) => e.origin === "copower")
    .reduce((s, e) => s + e.downtimeHours, 0);
  const mruHours = events.filter((e) => e.origin === "mru").reduce((s, e) => s + e.downtimeHours, 0);
  const externalish = events
    .filter((e) => e.origin === "mru" || e.origin === "red" || e.origin === "sin")
    .reduce((s, e) => s + e.downtimeHours, 0);

  const insight =
    mruHours >= ownHours && mruHours > 0
      ? `La mayor parte del impacto externo ligado a combustible tratado viene de la MRU (${fmtHours(mruHours)}). Separarlo de fallas propias evita castigar la confiabilidad COPOWER.`
      : ownHours > 0
        ? `Hay ${fmtHours(ownHours)} imputables al activo COPOWER. Compáralas con ${fmtHours(externalish)} de MRU/red/SIN para ver el sistema, no solo la máquina.`
        : `Noviembre muestra sobre todo disparadores externos (MRU, red, SIN). El mapa marca la cascada hasta el parque.`;

  return (
    <section
      className={`cyc-sysmap${compact ? " cyc-sysmap--compact" : ""}`}
      aria-label="Sistema dinámico de confiabilidad Costayaco"
    >
      {!compact ? (
        <header className="cyc-sysmap-head">
          <div>
            <p className="eyebrow">Análisis de sistema</p>
            <h3>Cómo se relacionan las FO</h3>
            <p className="muted">Toque un nodo para filtrar el origen.</p>
          </div>
        </header>
      ) : null}

      <div className="cyc-sysmap-canvas-wrap">
        <svg
          className="cyc-sysmap-canvas"
          viewBox="0 0 100 100"
          role="img"
          aria-label="Diagrama SIN, red, MRU, gas y parque"
        >
          {LINKS.map((link) => {
            const from = NODES.find((n) => n.id === link.from)!;
            const to = NODES.find((n) => n.id === link.to)!;
            const active =
              !focus || focus === link.from || focus === link.to || focus === "parque";
            return (
              <g key={`${link.from}-${link.to}`} className={active ? "is-on" : "is-dim"}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className="cyc-sysmap-link"
                />
              </g>
            );
          })}
          {NODES.map((node) => {
            const related = nodeEvents(events, node.id);
            const hours = related.reduce((s, e) => s + e.downtimeHours, 0);
            const active = !focus || focus === node.id || node.id === "parque";
            const selected = focus === node.id;
            return (
              <g
                key={node.id}
                className={[
                  "cyc-sysmap-node",
                  `cyc-sysmap-node--${node.id}`,
                  active ? "is-on" : "is-dim",
                  selected ? "is-selected" : "",
                ].join(" ")}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.id === "parque" ? 11 : 9}
                  className="cyc-sysmap-hit"
                  onClick={() => setFocus(focus === node.id ? null : node.id)}
                />
                <text x={node.x} y={node.y - 1.2} textAnchor="middle" className="cyc-sysmap-label">
                  {node.label}
                </text>
                <text x={node.x} y={node.y + 3.8} textAnchor="middle" className="cyc-sysmap-meta">
                  {related.length
                    ? `${related.length} · ${compactHours(hours)}`
                    : node.id === "parque"
                      ? `${events.length} FO`
                      : "—"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="cyc-sysmap-insight">{insight}</p>

      {!compact ? (
        <ul className="cyc-sysmap-events">
          {focusedEvents
            .slice()
            .sort((a, b) => a.day.localeCompare(b.day) || b.downtimeHours - a.downtimeHours)
            .map((event) => (
              <li key={event.id}>
                <button type="button" onClick={() => onOpenDay(event.day, event.id)}>
                  <span className={`cyc-sysmap-pill cyc-sysmap-pill--${event.origin}`}>
                    {ORIGIN_SHORT[event.origin]}
                  </span>
                  <span className="cyc-sysmap-event-main">
                    <strong>
                      Día {dayNumber(event.day)} · {event.rf}
                    </strong>
                    <em>
                      {event.units.length ? event.units.slice(0, 3).join(" · ") : "Parque"} ·{" "}
                      {fmtHours(event.downtimeHours)}
                    </em>
                  </span>
                  <span className="cyc-sysmap-event-cause" title={event.originLabel}>
                    {ORIGIN_LABEL[event.origin]}
                  </span>
                </button>
              </li>
            ))}
          {!focusedEvents.length ? <li className="muted">Sin FO en este nodo.</li> : null}
        </ul>
      ) : null}

    </section>
  );
}
