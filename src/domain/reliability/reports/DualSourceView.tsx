import { COPOWER_SOURCE_FILE } from "./copowerMonthly";
import { DualCompare } from "./PlatformContent";
import type { PageKey } from "../types";

type Props = {
  page: PageKey;
  leafId: string;
  month: string;
  monthLabel: string;
};

/** Vista dual GTE | COPOWER — la fuente la define el nodo del árbol. */
export function DualSourceView({ page, leafId, month, monthLabel }: Props) {
  return <DualCompare page={page} leafId={leafId} month={month} monthLabel={monthLabel} />;
}

export { COPOWER_SOURCE_FILE };
