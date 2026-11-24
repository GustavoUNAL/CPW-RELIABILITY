import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PAD4_VALVE_FLEET,
  VALVE_CONCLUSIONS,
  VALVE_THRESHOLDS,
  type ValveCylinder,
  type ValveMachine,
  type ValveStatus,
} from "./pad4ValveData";

const PDF_HREF = "/pad4/valvulas-nov-2026/Verificacion_Valvulas_Pad4_Nov2026.pdf";

type Filter = "todas" | "vigilancia" | "admision" | "escape";

function fmtMm(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(2).replace(".", ",")} mm`;
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${d} ${months[m - 1]} ${y}`;
}

function fmtHours(h: number) {
  return h.toLocaleString("es-CO");
}

function statusOf(mm: number | null | undefined): ValveStatus {
  if (mm == null) return "na";
  if (mm >= VALVE_THRESHOLDS.red) return "rojo";
  if (mm >= VALVE_THRESHOLDS.yellow) return "amarillo";
  if (mm >= VALVE_THRESHOLDS.watch) return "vigilancia";
  return "verde";
}

function barColor(status: ValveStatus) {
  if (status === "rojo") return "#dc2626";
  if (status === "amarillo") return "#eab308";
  if (status === "vigilancia") return "#d97706";
  return "#22c55e";
}

export function Pad4ValvulasDeck() {
  const [unitId, setUnitId] = useState(PAD4_VALVE_FLEET[0].unit);
  const [filter, setFilter] = useState<Filter>("todas");
  const [selectedCyl, setSelectedCyl] = useState<number | null>(null);

  const machine = PAD4_VALVE_FLEET.find((item) => item.unit === unitId) ?? PAD4_VALVE_FLEET[0];
  const fleetWatch = PAD4_VALVE_FLEET.reduce((n, item) => n + item.watch.length, 0);
  const fleetMax = Math.max(...PAD4_VALVE_FLEET.map((item) => item.maxMm));

  const cylinders = useMemo(() => {
    return machine.cylinders.filter((cyl) => {
      if (filter === "vigilancia") return cyl.status === "vigilancia";
      if (filter === "admision") return cyl.worst === "A1" || cyl.worst === "A2";
      if (filter === "escape") return cyl.worst === "E1" || cyl.worst === "E2";
      return true;
    });
  }, [filter, machine]);

  const selected =
    selectedCyl == null
      ? null
      : (machine.cylinders.find((cyl) => cyl.cyl === selectedCyl) ?? null);

  const chartData = machine.cylinders.map((cyl) => ({
    name: String(cyl.cyl),
    mm: cyl.worstMm ?? 0,
    valve: cyl.worst ?? "",
    status: cyl.status,
  }));

  return (
    <div className="valv-app">
      <header className="card section-head valv-app-head">
        <div>
          <p className="eyebrow">FO-GE-007 · Pad 4 · noviembre 2026</p>
          <h2>Verificación de tolerancia de válvulas</h2>
        </div>
        <a className="btn ghost" href={PDF_HREF} download>
          <Download size={15} /> PDF
        </a>
      </header>

      <section className="valv-kpi-row" aria-label="Resumen de flota">
        <article className="card valv-kpi">
          <p className="eyebrow">Cilindros</p>
          <strong>80 / 80</strong>
          <span>en semáforo verde</span>
        </article>
        <article className="card valv-kpi">
          <p className="eyebrow">En vigilancia</p>
          <strong>{fleetWatch}</strong>
          <span>≥ 1,2 mm · aún en verde</span>
        </article>
        <article className="card valv-kpi">
          <p className="eyebrow">Recesión máxima</p>
          <strong>{fmtMm(fleetMax)}</strong>
          <span>G-801 · C19 · A1</span>
        </article>
        <article className="card valv-kpi">
          <p className="eyebrow">Amarillo / rojo</p>
          <strong>0 / 0</strong>
          <span>umbral 1,5 mm y 2,0 mm</span>
        </article>
      </section>

      <section className="card valv-fleet" aria-label="Máquinas">
        <div className="valv-fleet-grid">
          {PAD4_VALVE_FLEET.map((item) => (
            <button
              key={item.unit}
              type="button"
              className={`valv-machine${item.unit === unitId ? " active" : ""}`}
              onClick={() => {
                setUnitId(item.unit);
                setSelectedCyl(null);
              }}
            >
              <span className="valv-machine-id">{item.unit}</span>
              <span className="valv-machine-meta">
                {fmtDate(item.currentDate)} · {fmtHours(item.hours)} h
              </span>
              <span className="valv-machine-stats">
                prom. {fmtMm(item.avgMm)} · máx. {fmtMm(item.maxMm)}
              </span>
              <span className={`valv-pill valv-pill--${item.watch.length ? "watch" : "ok"}`}>
                {item.watch.length ? `${item.watch.length} en vigilancia` : "Sin vigilancia"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <MachinePanel
        machine={machine}
        filter={filter}
        onFilter={setFilter}
        cylinders={cylinders}
        chartData={chartData}
        selected={selected}
        selectedCyl={selectedCyl}
        onSelect={(cyl) => setSelectedCyl((prev) => (prev === cyl ? null : cyl))}
      />

      <section className="card valv-criteria">
        <h3>Criterio del semáforo</h3>
        <div className="valv-criteria-grid">
          <article>
            <span className="valv-dot valv-dot--verde" />
            <strong>Verde · 0 – 1,5 mm</strong>
            <p>Se mantiene el intervalo de inspección.</p>
          </article>
          <article>
            <span className="valv-dot valv-dot--amarillo" />
            <strong>Amarillo · 1,5 – 2,0 mm</strong>
            <p>Intervalo de inspección a la mitad.</p>
          </article>
          <article>
            <span className="valv-dot valv-dot--rojo" />
            <strong>Rojo · ≥ 2,0 mm</strong>
            <p>Zona de cambio de culatas (máx. 2,5 mm).</p>
          </article>
          <article>
            <span className="valv-dot valv-dot--vigilancia" />
            <strong>Vigilancia · ≥ 1,2 mm</strong>
            <p>Prioridad interna: aún verde, cerca del amarillo.</p>
          </article>
        </div>
      </section>

      <section className="card valv-conclusions">
        <h3>Conclusiones</h3>
        <ol>
          {VALVE_CONCLUSIONS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function MachinePanel({
  machine,
  filter,
  onFilter,
  cylinders,
  chartData,
  selected,
  selectedCyl,
  onSelect,
}: {
  machine: ValveMachine;
  filter: Filter;
  onFilter: (next: Filter) => void;
  cylinders: ValveCylinder[];
  chartData: { name: string; mm: number; valve: string; status: ValveStatus }[];
  selected: ValveCylinder | null;
  selectedCyl: number | null;
  onSelect: (cyl: number) => void;
}) {
  return (
    <section className="card valv-panel">
      <header className="valv-panel-head">
        <div>
          <p className="eyebrow">{machine.unit} · Jenbacher J420</p>
          <h3>
            {fmtDate(machine.baseDate)} → {fmtDate(machine.currentDate)} · {fmtHours(machine.hours)} h
          </h3>
          <p>{machine.note}</p>
        </div>
        <div className="valv-panel-kpis">
          <div>
            <span>Promedio</span>
            <strong>{fmtMm(machine.avgMm)}</strong>
          </div>
          <div>
            <span>Admisión / Escape</span>
            <strong>
              {fmtMm(machine.avgAdm)} / {fmtMm(machine.avgEsc)}
            </strong>
          </div>
          <div>
            <span>Máximo</span>
            <strong>
              {fmtMm(machine.maxMm)} · C{String(machine.top.cyl).padStart(2, "0")} · {machine.top.worst}
            </strong>
          </div>
        </div>
      </header>

      <div className="valv-filters" role="tablist" aria-label="Filtro de cilindros">
        {(
          [
            ["todas", "Todos"],
            ["vigilancia", "En vigilancia"],
            ["admision", "Peor en admisión"],
            ["escape", "Peor en escape"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            className={filter === id ? "active" : undefined}
            onClick={() => onFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="valv-chart" aria-label={`Recesión por cilindro de ${machine.unit}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis
              domain={[0, VALVE_THRESHOLDS.maxScale]}
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => String(v).replace(".", ",")}
              width={34}
            />
            <Tooltip
              formatter={(value, _name, item) => {
                const mm = typeof value === "number" ? value : Number(value);
                const valve = (item?.payload as { valve?: string } | undefined)?.valve ?? "";
                return [`${fmtMm(mm)} · ${valve}`, "Peor válvula"];
              }}
              labelFormatter={(label) => `Cilindro ${label}`}
            />
            <ReferenceLine
              y={VALVE_THRESHOLDS.watch}
              stroke="#d97706"
              strokeDasharray="4 4"
              label={{ value: "1,2", position: "insideTopRight", fill: "#d97706", fontSize: 11 }}
            />
            <ReferenceLine
              y={VALVE_THRESHOLDS.yellow}
              stroke="#eab308"
              strokeDasharray="4 4"
              label={{ value: "1,5", position: "insideTopRight", fill: "#ca8a04", fontSize: 11 }}
            />
            <Bar
              dataKey="mm"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={(data) => {
                const name = (data as { name?: string } | undefined)?.name;
                if (name) onSelect(Number(name));
              }}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={barColor(entry.status)}
                  opacity={selectedCyl == null || selectedCyl === Number(entry.name) ? 1 : 0.35}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="valv-cyl-grid">
        {cylinders.map((cyl) => (
          <button
            key={cyl.cyl}
            type="button"
            className={`valv-cyl${selectedCyl === cyl.cyl ? " active" : ""} valv-cyl--${cyl.status}`}
            onClick={() => onSelect(cyl.cyl)}
          >
            <span className="valv-cyl-top">
              <strong>C{String(cyl.cyl).padStart(2, "0")}</strong>
              <em>{fmtMm(cyl.worstMm)}</em>
            </span>
            <span className="valv-cyl-worst">
              Peor · {cyl.worst ?? "—"}
            </span>
            <span className="valv-mini-bars" aria-hidden>
              {(["A1", "A2", "E1", "E2"] as const).map((valve) => {
                const mm = cyl[valve];
                const width = Math.max(0, Math.min(100, ((mm ?? 0) / VALVE_THRESHOLDS.maxScale) * 100));
                return (
                  <span key={valve} className="valv-mini-row">
                    <i>{valve}</i>
                    <b>
                      <u style={{ width: `${width}%`, background: barColor(statusOf(mm)) }} />
                    </b>
                    <small>{mm == null ? "—" : mm.toFixed(2).replace(".", ",")}</small>
                  </span>
                );
              })}
            </span>
          </button>
        ))}
      </div>

      {selected ? <CylinderDetail machine={machine} cyl={selected} /> : null}
    </section>
  );
}

function CylinderDetail({ machine, cyl }: { machine: ValveMachine; cyl: ValveCylinder }) {
  const valves = (["A1", "A2", "E1", "E2"] as const).map((id) => ({
    id,
    mm: cyl[id],
    kind: id.startsWith("A") ? "Admisión" : "Escape",
    status: statusOf(cyl[id]),
  }));

  return (
    <aside className="valv-detail" aria-live="polite">
      <header>
        <p className="eyebrow">
          {machine.unit} · cilindro {String(cyl.cyl).padStart(2, "0")}
        </p>
        <h4>
          Peor válvula {cyl.worst} · {fmtMm(cyl.worstMm)}
        </h4>
        <p>
          Margen al amarillo:{" "}
          {cyl.worstMm == null
            ? "—"
            : fmtMm(Math.max(0, VALVE_THRESHOLDS.yellow - cyl.worstMm))}
        </p>
      </header>
      <div className="valv-detail-bars">
        {valves.map((valve) => {
          const width = Math.max(0, Math.min(100, ((valve.mm ?? 0) / VALVE_THRESHOLDS.maxScale) * 100));
          return (
            <div key={valve.id} className="valv-detail-row">
              <div className="valv-detail-label">
                <strong>{valve.id}</strong>
                <span>{valve.kind}</span>
              </div>
              <div className="valv-detail-track">
                <span
                  className="valv-detail-fill"
                  style={{ width: `${width}%`, background: barColor(valve.status) }}
                />
                <i style={{ left: `${(VALVE_THRESHOLDS.watch / VALVE_THRESHOLDS.maxScale) * 100}%` }} />
                <i
                  className="is-yellow"
                  style={{ left: `${(VALVE_THRESHOLDS.yellow / VALVE_THRESHOLDS.maxScale) * 100}%` }}
                />
              </div>
              <strong className="valv-detail-mm">{fmtMm(valve.mm)}</strong>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
