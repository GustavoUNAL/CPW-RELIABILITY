import { DisponibilidadAnalisisBoard } from "./DisponibilidadAnalisisBoard";

type Props = {
  month: string;
  monthLabel: string;
};

/** Misma vista que el análisis: un solo puente de horas. */
export function DisponibilidadConciliacionSlide({ month, monthLabel }: Props) {
  return <DisponibilidadAnalisisBoard month={month} monthLabel={monthLabel} />;
}
