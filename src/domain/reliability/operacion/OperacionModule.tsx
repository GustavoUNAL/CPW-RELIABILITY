import { useEffect, useMemo, useState } from "react";
import { loadOperacionPack } from "./api";
import { EQUIPO_BY_ID, EQUIPOS } from "./constants";
import { OperacionViews, type OperacionSection } from "./OperacionViews";
import type { OperacionFilters } from "./types";

type Props = {
  section: OperacionSection;
};

export function OperacionModule({ section }: Props) {
  const pack = useMemo(() => loadOperacionPack(), []);
  const [detalleId, setDetalleId] = useState<string | undefined>();
  const [filters, setFilters] = useState<OperacionFilters>(() => ({
    from: `${pack.dateRange.max.slice(0, 4)}-01-01`,
    to: pack.dateRange.max,
    planta: "Todas",
    equipoId: "Todos",
  }));

  useEffect(() => {
    if (section !== "detalle" && section !== "equipos") setDetalleId(undefined);
  }, [section]);

  const effective: OperacionSection =
    detalleId && (section === "equipos" || section === "detalle") ? "detalle" : section;

  const activeEquipoId =
    detalleId || (filters.equipoId !== "Todos" ? filters.equipoId : undefined);

  return (
    <OperacionViews
      section={effective}
      equipoId={activeEquipoId}
      filters={filters}
      onFiltersChange={(next) => {
        setFilters(next);
        if (next.equipoId !== "Todos") setDetalleId(undefined);
      }}
      onSelectEquipo={(id) => {
        setDetalleId(id);
        setFilters((f) => ({ ...f, equipoId: id, planta: EQUIPO_BY_ID[id]?.planta ?? f.planta }));
      }}
      equiposCatalog={EQUIPOS.filter((eq) =>
        pack.resumenDiario.some((r) => r.equipoId === eq.id) ||
        pack.consumos.some((c) => c.equipoId === eq.id) ||
        eq.planta === "Conejo",
      )}
    />
  );
}

export function operacionSectionFromLeaf(leafId: string): OperacionSection {
  switch (leafId) {
    case "op-equipos":
      return "equipos";
    case "op-detalle":
      return "detalle";
    case "op-resumen-diario":
      return "resumen";
    case "op-eventos":
      return "eventos";
    case "op-actividades":
      return "actividades";
    case "op-consumos":
      return "consumos";
    case "op-eficiencia":
      return "eficiencia";
    case "op-dashboard":
    case "bd-op-copower":
    default:
      return "dashboard";
  }
}
