import { ConfiabilidadAnalisisBoard } from "./ConfiabilidadAnalisisBoard";

type Props = {
  month: string;
  monthLabel: string;
};

/** Misma vista que el análisis 4: FO de julio vs Conf 100 %. */
export function ConfiabilidadConciliacionSlide({ month, monthLabel }: Props) {
  return <ConfiabilidadAnalisisBoard month={month} monthLabel={monthLabel} />;
}
