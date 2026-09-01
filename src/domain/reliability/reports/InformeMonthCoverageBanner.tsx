import { informeMonthCoverage } from "./agostoWeeklyPlanning";

export function InformeMonthCoverageBanner({ month, monthLabel }: { month: string; monthLabel: string }) {
  const cov = informeMonthCoverage(month);
  if (cov.pendingSources.length === 0) return null;
  return (
    <section className="panel">
      <p className="inf-slide-narrative">
        El informe de {monthLabel.toLowerCase()} ya tiene sábana de mantenimiento y la planeación de la
        semana 31 ago–6 sep. Todavía no llegan Data Soporte GTE, horas concertadas, RCA ni el totalizador
        de gas Moqueta del mes: las láminas de disponibilidad, confiabilidad, fallas y eficiencia quedan
        en blanco a propósito, para no repetir las cifras de julio.
      </p>
      <ul className="inf-conf-sec-lead" style={{ marginTop: "0.4rem" }}>
        {cov.pendingSources.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </section>
  );
}
