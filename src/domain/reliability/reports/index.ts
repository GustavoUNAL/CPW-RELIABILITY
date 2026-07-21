import type { ReportDataset, ReportKey } from "../types";
import { copowerReport } from "./copower";
import { granTierraReport } from "./granTierra";

export const REPORT_DATASETS: Record<ReportKey, ReportDataset> = {
  gran_tierra: granTierraReport,
  copower: copowerReport,
};
