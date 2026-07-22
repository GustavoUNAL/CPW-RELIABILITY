import { useMemo, useState } from "react";
import { EQUIPOS, PLANTAS } from "../constants";
import type { Equipo, EquipoId, OperacionFilters, Planta } from "../types";

type Props = {
  filters: OperacionFilters;
  onChange: (next: OperacionFilters) => void;
  dateMin?: string;
  dateMax?: string;
  /** Máquinas con datos reales (si no se pasa, usa catálogo). */
  equiposConDatos?: Equipo[];
};

export function FiltrosFecha({
  filters,
  onChange,
  dateMin,
  dateMax,
  equiposConDatos,
}: Props) {
  const [q, setQ] = useState("");
  const catalog = equiposConDatos?.length ? equiposConDatos : EQUIPOS;

  const maquinas = useMemo(() => {
    const byPlanta = catalog.filter((eq) => filters.planta === "Todas" || eq.planta === filters.planta);
    const needle = q.trim().toLowerCase();
    if (!needle) return byPlanta;
    return byPlanta.filter(
      (eq) =>
        eq.id.toLowerCase().includes(needle) ||
        eq.label.toLowerCase().includes(needle) ||
        eq.planta.toLowerCase().includes(needle),
    );
  }, [catalog, filters.planta, q]);

  return (
    <div className="op-filters">
      <label>
        <span>Desde</span>
        <input
          type="date"
          value={filters.from}
          min={dateMin}
          max={dateMax}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
        />
      </label>
      <label>
        <span>Hasta</span>
        <input
          type="date"
          value={filters.to}
          min={dateMin}
          max={dateMax}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
        />
      </label>
      <label>
        <span>Planta</span>
        <select
          value={filters.planta}
          onChange={(e) =>
            onChange({ ...filters, planta: e.target.value as Planta | "Todas", equipoId: "Todos" })
          }
        >
          <option value="Todas">Todas</option>
          {PLANTAS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className="op-filter-maquina">
        <span>Máquina</span>
        <input
          type="search"
          placeholder="Buscar CPW01, JINAN…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Buscar máquina"
        />
        <select
          value={filters.equipoId}
          onChange={(e) => onChange({ ...filters, equipoId: e.target.value as EquipoId | "Todos" })}
        >
          <option value="Todos">Todas las máquinas</option>
          {maquinas.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.label} · {eq.id} · {eq.planta}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
