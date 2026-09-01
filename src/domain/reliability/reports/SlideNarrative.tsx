import { slideNarrative, type SlideNarrativeKey } from "./slideNarratives";

/** Párrafo de lectura que abre una lámina del informe. */
export function SlideNarrative({
  month,
  monthLabel,
  slide,
}: {
  month: string;
  monthLabel: string;
  slide: SlideNarrativeKey;
}) {
  const text = slideNarrative(month, monthLabel, slide);
  if (!text) return null;
  return <p className="inf-slide-narrative">{text}</p>;
}
