import type { ReportDataset, ReportKey } from "../types";
import { copowerInternoReport } from "./copowerInterno";
import { granTierraReport } from "./granTierra";

export const REPORT_DATASETS: Record<ReportKey, ReportDataset> = {
  gran_tierra: granTierraReport,
  copower_interno: copowerInternoReport,
};
