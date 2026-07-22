import { ESTADO_COLOR } from "../constants";
import type { HorasEstado } from "../types";

type Props = {
  horas: HorasEstado;
  height?: number;
};

export function DisponibilidadBar({ horas, height = 14 }: Props) {
  const total = horas.op + horas.sb + horas.pe + horas.mto + horas.fs;
  if (total <= 0) {
    return <div className="op-stack-bar op-stack-bar--empty" style={{ height }} />;
  }
  const segs: { key: keyof HorasEstado; color: string }[] = [
    { key: "op", color: ESTADO_COLOR.OP },
    { key: "sb", color: ESTADO_COLOR.SB },
    { key: "pe", color: ESTADO_COLOR.PE },
    { key: "mto", color: ESTADO_COLOR.MTO },
    { key: "fs", color: ESTADO_COLOR.FS },
  ];
  return (
    <div className="op-stack-bar" style={{ height }} title={`OP ${horas.op} · SB ${horas.sb} · PE ${horas.pe} · MTO ${horas.mto} · FS ${horas.fs}`}>
      {segs.map((s) => {
        const v = horas[s.key];
        if (v <= 0) return null;
        return (
          <span key={s.key} style={{ width: `${(v / total) * 100}%`, background: s.color }} />
        );
      })}
    </div>
  );
}
