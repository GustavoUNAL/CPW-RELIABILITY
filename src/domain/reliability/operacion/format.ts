export function fmtNum(v: number | null | undefined, digits = 1): string {
  if (v == null || Number.isNaN(v)) return "N/D";
  return v.toLocaleString("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtPct(v: number | null | undefined, digits = 2): string {
  if (v == null || Number.isNaN(v)) return "N/D";
  return `${fmtNum(v, digits)}%`;
}

export function fmtKw(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "N/D";
  return `${fmtNum(v, 0)} kW`;
}

export function fmtMwh(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "N/D";
  return `${fmtNum(v, 1)} MWh`;
}

export function fmtHours(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "N/D";
  return `${fmtNum(v, 1)} h`;
}

export function fmtHeatRate(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "N/D";
  return `${fmtNum(v, 1)} ft³/kWh`;
}
