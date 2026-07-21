import { Gauge, Wrench, Zap } from "lucide-react";
import { getCopowerIndicators, type CopowerIndicatorsSnapshot } from "../contracts/copowerIndicators";
import type { FieldKey } from "../contracts/fieldAssets";

const pct = (v: number | null | undefined, asRatio = false) => {
  if (v == null || Number.isNaN(v)) return "N/D";
  const n = asRatio ? v * 100 : v;
  return `${n.toFixed(2)}%`;
};
const kwh = (v: number | null | undefined) =>
  v == null || Number.isNaN(v) ? "N/D" : `${Math.round(v).toLocaleString("es-CO")} kWh`;
const hours = (v: number | null | undefined) =>
  v == null || Number.isNaN(v) ? "N/D" : `${v.toLocaleString("es-CO", { maximumFractionDigits: 1 })} h`;
const num = (v: number | null | undefined, d = 1) =>
  v == null || Number.isNaN(v) ? "N/D" : v.toFixed(d);

function KpiCard({
  label,
  value,
  hint,
  hero,
}: {
  label: string;
  value: string;
  hint?: string;
  hero?: boolean;
}) {
  return (
    <article className={`field-op-kpi${hero ? " field-op-kpi--hero" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}

function UnitTable({ units }: { units: CopowerIndicatorsSnapshot["units"] }) {
  if (units.length === 0) {
    return <p className="field-op-empty">Sin unidades registradas.</p>;
  }
  return (
    <div className="table-wrap field-op-table-wrap">
      <table className="indicators-table exec-unit-table">
        <thead>
          <tr>
            <th>Unidad</th>
            <th>Disp.</th>
            <th>Conf.</th>
            <th>Fallas</th>
            <th>MTBF</th>
            <th>MTTR</th>
            <th>Energía</th>
            <th>OP</th>
            <th>SB</th>
            <th>MTO</th>
            <th>FS</th>
            <th>Riesgo</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.id} className={u.fallas >= 3 ? "row-repeat" : undefined}>
              <td>
                <strong>{u.id}</strong>
              </td>
              <td>{pct(u.disp)}</td>
              <td>{pct(u.conf)}</td>
              <td>{u.fallas}</td>
              <td>{u.mtbf}</td>
              <td>{u.mttr ?? "N/D"}</td>
              <td>{u.energiaKwh != null ? kwh(u.energiaKwh) : "N/D"}</td>
              <td>{u.horasOp != null ? num(u.horasOp) : "N/D"}</td>
              <td>{u.horasSb != null ? num(u.horasSb) : "N/D"}</td>
              <td>{u.horasPp != null ? num(u.horasPp) : "N/D"}</td>
              <td>{u.horasPf != null ? num(u.horasPf) : "N/D"}</td>
              <td>
                <span
                  className={`badge ${
                    u.riesgo === "RIESGO ALTO" ? "danger" : u.riesgo === "RIESGO MEDIO" ? "warn" : "success"
                  }`}
                >
                  {u.riesgo.replace("RIESGO ", "")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Props = {
  month: string;
  fieldKey?: FieldKey;
};

export function CopowerIndicatorsPanel({ month, fieldKey }: Props) {
  const data = getCopowerIndicators(month, fieldKey);

  if (!data) {
    return (
      <article className="field-op-pane field-op-pane--cpw field-op-pane--full">
        <header className="field-op-pane-head">
          <strong>COPOWER · Operación diaria</strong>
          <span className="source-badge cpw">CPW</span>
        </header>
        <p className="field-op-empty">Sin datos COPOWER para este periodo.</p>
      </article>
    );
  }

  const scopeNote =
    data.scope === "field" && data.fieldLabel
      ? `Campo ${data.fieldLabel} · ${data.units.length} unidades`
      : `Sistema Costayaco + Vonú · ${data.units.length} unidades`;
  const isField = data.scope === "field";

  return (
    <article className="field-op-pane field-op-pane--cpw field-op-pane--full">
      <header className="field-op-pane-head">
        <div>
          <strong>COPOWER · Operación diaria</strong>
          <small>
            {data.label} · {scopeNote} · {data.sourceFile?.split("/").pop()}
          </small>
        </div>
        <span className="source-badge cpw">CPW</span>
      </header>

      <div className="field-op-block">
        <p className="field-op-block-title">Desempeño</p>
        <div className="field-op-kpi-grid field-op-kpi-grid--wide">
          <KpiCard
            label={isField ? "Disponibilidad campo" : "Disponibilidad promedio"}
            value={pct(data.disp)}
            hero
            hint={isField ? "Promedio unidades del campo" : "Promedio todas las unidades"}
          />
          <KpiCard
            label={isField ? "Confiabilidad campo" : "Confiabilidad promedio"}
            value={pct(data.conf)}
            hero
            hint={isField ? "Promedio unidades del campo" : "Promedio todas las unidades"}
          />
          <KpiCard label="Disp. sistémica" value={pct(data.systemDisp)} hint="Resumen OP · bloque completo" />
          <KpiCard label="Conf. sistémica" value={pct(data.systemConf)} hint="Resumen OP · bloque completo" />
          <KpiCard
            label="Generación"
            value={kwh(data.generationKwh)}
            hint={data.generationMwh != null ? `${num(data.generationMwh, 1)} MWh` : undefined}
          />
          <KpiCard label="Gas" value={kwh(data.gasKwh)} />
          <KpiCard label="Diésel" value={kwh(data.dieselKwh)} />
        </div>
      </div>

      <div className="field-op-block">
        <p className="field-op-block-title">Horas y eventos</p>
        <div className="field-op-kpi-grid field-op-kpi-grid--wide">
          <KpiCard label="Horas operación" value={hours(data.hoursOp)} />
          <KpiCard label="Stand-by" value={hours(data.hoursStandby)} />
          <KpiCard label="Mantenimiento (PP)" value={hours(data.hoursPreventive)} />
          <KpiCard label="FS total" value={hours(data.hoursCorrective)} hint="PF contr + PF cli" />
          <KpiCard label="PF contr" value={hours(data.hoursPfContr)} />
          <KpiCard label="PF cli" value={hours(data.hoursPfCli)} />
          <KpiCard
            label={isField ? "Fallas campo" : "Fallas totales"}
            value={String(data.fallas)}
            hint={isField ? "Σ unidades del campo" : "Σ todas las unidades"}
          />
          <KpiCard
            label="Fallas imputables"
            value={data.copowerFailures != null ? String(data.copowerFailures) : "N/D"}
            hint="Sistémico · clasificación COPOWER"
          />
          <KpiCard
            label="Eventos registrados"
            value={data.totalEvents != null ? String(data.totalEvents) : "N/D"}
            hint="Bitácora del mes"
          />
        </div>
      </div>

      <div className="field-op-block">
        <p className="field-op-block-title">
          <Gauge size={14} />
          Frecuencia y severidad
        </p>
        <div className="field-op-kpi-grid">
          <KpiCard label="MTBF" value={hours(data.mtbf)} hint="OP / # fallas · sistémico" />
          <KpiCard label="MTTR" value={hours(data.mttr)} hint="FS / # fallas · sistémico" />
          <KpiCard
            label="Aceite (adición + cambio)"
            value={data.oilGal != null ? `${num(data.oilGal)} gal` : "N/D"}
            hint="Hoja Consumos"
          />
        </div>
      </div>

      <div className="field-op-block">
        <p className="field-op-block-title">
          <Wrench size={14} />
          Indicadores por unidad
        </p>
        <UnitTable units={data.units} />
      </div>

      {data.failureEvents.length > 0 ? (
        <div className="field-op-block">
          <p className="field-op-block-title">
            <Zap size={14} />
            Eventos de falla recientes
          </p>
          <div className="table-wrap field-op-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>Horas</th>
                  <th>Responsable</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {data.failureEvents.map((e) => (
                  <tr key={`${e.date}-${e.equipment}-${e.cause.slice(0, 20)}`}>
                    <td>{e.date}</td>
                    <td>{e.equipment}</td>
                    <td>{hours(e.downtimeHours)}</td>
                    <td>{e.responsible}</td>
                    <td className="detalle-cell">{e.cause || e.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </article>
  );
}

/** Resumen global para Base de Datos → Indicadores COPOWER. */
export function CopowerIndicatorsDashboard({ month }: { month: string }) {
  const data = getCopowerIndicators(month);

  return (
    <div className="exec-dashboard">
      <header className="exec-header">
        <div>
          <p className="eyebrow">COPOWER · Operación diaria</p>
          <h2>{data?.label ?? month} — Costayaco / Vonú</h2>
          <p className="muted">Todos los indicadores del reporte diario de operaciones</p>
        </div>
        <span className="badge info">Fuente COPOWER</span>
      </header>
      <CopowerIndicatorsPanel month={month} />
      {data ? (
        <aside className="exec-source-note" aria-label="Fuente">
          <p>
            <strong>Fuente:</strong> {data.sourceFile}. Hojas: Resumen OP, Eventos de Generación, Consumos.
            Indicadores operativos internos COPOWER — no sustituyen el cumplimiento contractual reportado a Gran
            Tierra.
          </p>
        </aside>
      ) : null}
    </div>
  );
}
