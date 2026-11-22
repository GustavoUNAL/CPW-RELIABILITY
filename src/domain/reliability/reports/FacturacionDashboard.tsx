import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ScreenShell } from "../ui/ScreenShell";
import {
  FACTURACION_JULIO_2026 as PACK,
  FACTURACION_SOURCE,
  type FacturacionUnit,
  type HourState,
} from "./facturacionEcuadorData";

type Props = {
  leafId: string;
};

const STATE_LABEL: Record<HourState, string> = {
  OP: "OP",
  SB: "SB",
  PE: "PE",
  M: "M",
  FS: "FS",
  TR: "TR",
};

const STATE_HINT: Record<HourState, string> = {
  OP: "Operación",
  SB: "Stand-by",
  PE: "Parada externa",
  M: "Mantenimiento",
  FS: "Fuera de servicio",
  TR: "Tiempo de reparación",
};

function fmtN(v: number, d = 0): string {
  return v.toLocaleString("es-CO", { maximumFractionDigits: d, minimumFractionDigits: d });
}

function fmtPct(v: number | null): string {
  if (v == null) return "—";
  return `${(v * 100).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
}

function fmtH(v: number | null): string {
  if (v == null) return "N/A";
  return `${fmtN(v, v % 1 ? 2 : 0)} h`;
}

function daysFromHours(h: number): number {
  return Math.round((h / 24) * 100) / 100;
}

function cellClass(state: HourState, h: number): string {
  if (!h) return "fac-h0";
  if (state === "OP") return h >= 20 ? "fac-op" : "fac-op-mid";
  if (state === "SB") return "fac-sb";
  if (state === "PE") return "fac-pe";
  if (state === "M") return "fac-m";
  if (state === "FS") return "fac-fs";
  return "fac-tr";
}

function HourGrid({ unit }: { unit: FacturacionUnit }) {
  const days = unit.days;
  return (
    <article className="fac-grid-card">
      <header className="fac-grid-head">
        <div>
          <strong>{unit.tag}</strong>
          <span className="muted">
            {unit.campo} · {unit.owner === "CPW" ? "equipo COPOWER" : "equipo GTE"}
          </span>
        </div>
        <span className={`badge ${unit.owner === "CPW" ? "info" : "neutral"}`}>{unit.owner}</span>
      </header>
      <div className="table-wrap fac-grid-wrap">
        <table className="fac-hour-grid">
          <thead>
            <tr>
              <th> </th>
              {days.map((_, i) => (
                <th key={i}>{i + 1}</th>
              ))}
              <th>Σ</th>
            </tr>
          </thead>
          <tbody>
            {(PACK.states as HourState[]).map((st) => (
              <tr key={st}>
                <th title={STATE_HINT[st]}>{STATE_LABEL[st]}</th>
                {days.map((d, i) => (
                  <td key={i} className={cellClass(st, d[st])}>
                    {d[st] || ""}
                  </td>
                ))}
                <td className="fac-sum">{unit.totals[st]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function DocHeader() {
  const d = PACK.document;
  const kwh = PACK.ops.reduce((s, u) => s + u.kwh, 0);
  const op = PACK.ops.reduce((s, u) => s + u.op, 0);
  return (
    <header className="fac-doc-head">
      <div className="fac-doc-brand">
        <img src="/facturacion/image1.png" alt="COPOWER" className="fac-logo" />
        <div>
          <p className="eyebrow">Documento · {d.tipo}</p>
          <h2>{d.nombre}</h2>
          <p className="muted">
            Contrato {d.contrato} · {d.empresa} · {d.cliente} · {d.region}, {d.pais}
          </p>
        </div>
      </div>
      <dl className="fac-meta">
        <div>
          <dt>Origen</dt>
          <dd>{d.origen}</dd>
        </div>
        <div>
          <dt>Período</dt>
          <dd>{d.periodo}</dd>
        </div>
        <div>
          <dt>Envío</dt>
          <dd>{d.enviado}</dd>
        </div>
        <div>
          <dt>OPEX</dt>
          <dd>Sin tarifa</dd>
        </div>
        <div>
          <dt>CAPEX</dt>
          <dd>Sin tarifa</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>USD 0,00</dd>
        </div>
      </dl>
      <div className="exec-kpi-row">
        <article className="exec-kpi">
          <span>kWh del mes</span>
          <strong>{fmtN(kwh)}</strong>
        </article>
        <article className="exec-kpi">
          <span>Horas OP</span>
          <strong>{fmtH(op)}</strong>
        </article>
        <article className="exec-kpi">
          <span>Unidades</span>
          <strong>{PACK.units.length}</strong>
          <small>4 campos con dato · Perico vacío</small>
        </article>
        <article className="exec-kpi">
          <span>Fallas imputables</span>
          <strong>1</strong>
          <small>KB-600-06 · 9 jul</small>
        </article>
      </div>
    </header>
  );
}

function IndicadoresTablas() {
  const kpiByTag = PACK.kpiByTag as Record<string, (typeof PACK.kpiByTag)[keyof typeof PACK.kpiByTag]>;
  const rows = PACK.units.map((u) => kpiByTag[u.tag]).filter(Boolean);
  const cpw = PACK.units.filter((u) => u.owner === "CPW");
  return (
    <div className="fac-pair">
      <article className="card ind-subcard">
        <h4>Indicadores de desempeño por equipo</h4>
        <p className="muted fac-note">{PACK.formulas.riesgo}</p>
        <div className="table-wrap">
          <table className="indicators-table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Equipo</th>
                <th>Hrs SB*</th>
                <th>Disp. %</th>
                <th>Conf. %</th>
                <th>Fallas</th>
                <th>MTBF</th>
                <th>MTTR</th>
                <th>Riesgo</th>
                <th>Cump.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.tag}>
                  <td>{r.campo}</td>
                  <td>
                    <strong>{r.tag}</strong>
                  </td>
                  <td>{fmtH(r.sb)}</td>
                  <td>{fmtPct(r.disp)}</td>
                  <td>{fmtPct(r.conf)}</td>
                  <td>{r.fallas}</td>
                  <td>{r.fallas ? fmtH(r.mtbf) : "N/A"}</td>
                  <td>{r.fallas ? fmtH(r.mttr) : "N/A"}</td>
                  <td>
                    <span className="badge success">{r.riesgo}</span>
                  </td>
                  <td>
                    <span className="badge success">{r.cumplimiento}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted fac-note">
          *En el Excel, “Horas SB” del tablero de indicadores copia PE de la bitácora (p. ej. KB-600-02 = 4 h
          externas). {PACK.formulas.mtbf}. {PACK.formulas.mttr}.
        </p>
      </article>
      <article className="card ind-subcard">
        <h4>Equipos propios COPOWER</h4>
        <div className="table-wrap">
          <table className="indicators-table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Equipo</th>
                <th>Disp. %</th>
                <th>Conf. %</th>
                <th>Fallas</th>
              </tr>
            </thead>
            <tbody>
              {cpw.map((u) => {
                const k = kpiByTag[u.tag];
                return (
                  <tr key={u.tag}>
                    <td>{u.campo}</td>
                    <td>
                      <strong>{u.tag}</strong>
                    </td>
                    <td>{fmtPct(k?.disp ?? null)}</td>
                    <td>{fmtPct(k?.conf ?? null)}</td>
                    <td>{k?.fallas ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

function SistemaTabla() {
  return (
    <article className="card ind-subcard">
      <h4>Indicadores por sistema N+1</h4>
      <div className="table-wrap">
        <table className="indicators-table">
          <thead>
            <tr>
              <th>Campo</th>
              <th>Sistema</th>
              <th>Hrs SB</th>
              <th>Disp. %</th>
              <th>Conf. %</th>
              <th>Fallas</th>
              <th>MTBF</th>
              <th>MTTR</th>
              <th>Riesgo</th>
              <th>Cump.</th>
            </tr>
          </thead>
          <tbody>
            {PACK.systems.map((r, i) => (
              <tr key={`${r.campo}-${r.sistema}-${i}`}>
                <td>{r.campo}</td>
                <td>
                  <strong>{r.sistema}</strong>
                </td>
                <td>{fmtH(r.sb)}</td>
                <td>{fmtPct(r.disp)}</td>
                <td>{fmtPct(r.conf)}</td>
                <td>{r.fallas ?? "—"}</td>
                <td>{r.fallas ? fmtH(r.mtbf) : "—"}</td>
                <td>{r.fallas ? fmtH(r.mttr) : "—"}</td>
                <td>
                  <span className="badge success">{r.riesgo}</span>
                </td>
                <td>
                  <span className="badge success">{r.cumplimiento}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function ConsumoTabla() {
  const totalKwh = PACK.ops.reduce((s, u) => s + u.kwh, 0);
  const totalFt = PACK.ops.reduce((s, u) => s + (u.ft3 ?? 0), 0);
  const totalGal = PACK.ops.reduce((s, u) => s + (u.gal ?? 0), 0);
  return (
    <article className="card ind-subcard">
      <h4>Indicadores operativos y de consumo mensual</h4>
      <div className="table-wrap">
        <table className="indicators-table">
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Campo</th>
              <th>OP</th>
              <th>SB</th>
              <th>PE</th>
              <th>MTTO</th>
              <th>FS</th>
              <th>TR</th>
              <th>kWh</th>
              <th>ft³</th>
              <th>gal</th>
              <th>kW prom</th>
            </tr>
          </thead>
          <tbody>
            {PACK.ops.map((u) => (
              <tr key={u.tag}>
                <td>
                  <strong>{u.tag}</strong>
                </td>
                <td>{u.campo}</td>
                <td>{u.op}</td>
                <td>{u.sb}</td>
                <td>{u.pe}</td>
                <td>{u.mtto}</td>
                <td>{u.fs}</td>
                <td>{u.tr}</td>
                <td>{fmtN(u.kwh)}</td>
                <td>{u.ft3 == null ? "—" : fmtN(u.ft3)}</td>
                <td>{u.gal == null ? "—" : fmtN(u.gal)}</td>
                <td>{fmtN(u.kwProm, 0)}</td>
              </tr>
            ))}
            <tr className="row-sistema">
              <td colSpan={8}>
                <strong>TOTAL</strong>
              </td>
              <td>{fmtN(totalKwh)}</td>
              <td>{fmtN(totalFt)}</td>
              <td>{fmtN(totalGal)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}

function Charts() {
  const kwh = PACK.ops.map((u) => ({ tag: u.tag, kwh: u.kwh, kw: Math.round(u.kwProm) }));
  const fuel = PACK.ops.map((u) => ({
    tag: u.tag,
    gas: u.ft3 ?? 0,
    diesel: u.gal ?? 0,
  }));
  return (
    <div className="fac-charts">
      <article className="dash-chart-panel ind-chart-card">
        <h4>kWh generados por equipo</h4>
        <p className="ind-chart-lead">Gráfico 2 del Excel · Julio 2026.</p>
        <div className="ind-chart-frame" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kwh} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="tag" width={88} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${fmtN(Number(v))} kWh`, "kWh"]} />
              <Bar dataKey="kwh" name="kWh/mes" fill="#4472C4" radius={[0, 3, 3, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
      <article className="dash-chart-panel ind-chart-card">
        <h4>kW promedio por equipo</h4>
        <p className="ind-chart-lead">Gráfico 1 del Excel.</p>
        <div className="ind-chart-frame" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kwh} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="tag" width={88} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${fmtN(Number(v))} kW`, "kW prom"]} />
              <Bar dataKey="kw" name="kW promedio" fill="#ED7D31" radius={[0, 3, 3, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
      <article className="dash-chart-panel ind-chart-card fac-chart-wide">
        <h4>Combustible · gas (ft³) y diésel (gal)</h4>
        <p className="ind-chart-lead">Gráfico 3 del Excel. Gas en Jenbacher; galones en Cummins / KTA.</p>
        <div className="ind-chart-frame" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fuel} margin={{ top: 8, right: 16, left: 8, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="tag" tick={{ fontSize: 10 }} interval={0} angle={-32} textAnchor="end" height={56} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="gas" name="ft³ gas" fill="#4472C4" />
              <Bar dataKey="diesel" name="gal diésel" fill="#70AD47" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  );
}

function Tickets() {
  const byCampo = useMemo(() => {
    const map = new Map<string, typeof PACK.ops>();
    for (const u of PACK.ops) {
      const list = map.get(u.campo) ?? [];
      list.push(u);
      map.set(u.campo, list);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="fac-tickets">
      <p className="muted fac-note">{PACK.formulas.ariba} Las tarifas unitarias del Excel están en blanco → USD 0,00.</p>
      {byCampo.map(([campo, units]) => (
        <article key={campo} className="card ind-subcard">
          <h4>
            Facturación {campo} · Contrato {PACK.document.contrato}
          </h4>
          <div className="fac-ticket-pair">
            <div>
              <p className="eyebrow">OPEX</p>
              <table className="indicators-table">
                <thead>
                  <tr>
                    <th>Ítem</th>
                    <th>Detalle</th>
                    <th>Eq. días (h/24)</th>
                    <th>Tarifa USD</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {PACK.opexLines.map((line, i) => (
                    <tr key={line.detalle}>
                      <td>{i + 1}</td>
                      <td>{line.detalle}</td>
                      <td>
                        {i === 0
                          ? fmtN(
                              units.reduce((s, u) => s + daysFromHours(u.op), 0),
                              2,
                            )
                          : "—"}
                      </td>
                      <td>—</td>
                      <td>USD 0,00</td>
                    </tr>
                  ))}
                  <tr className="row-sistema">
                    <td colSpan={4}>Subtotal / IVA 15% / Total</td>
                    <td>USD 0,00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <p className="eyebrow">CAPEX</p>
              <table className="indicators-table">
                <thead>
                  <tr>
                    <th>Equipo</th>
                    <th>OP h</th>
                    <th>SB h</th>
                    <th>PE</th>
                    <th>MP</th>
                    <th>FS</th>
                    <th>Días OP</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={u.tag}>
                      <td>
                        <strong>{u.tag}</strong>
                      </td>
                      <td>{u.op}</td>
                      <td>{u.sb}</td>
                      <td>{u.pe}</td>
                      <td>{u.mtto}</td>
                      <td>{u.fs}</td>
                      <td>{fmtN(daysFromHours(u.op), 2)}</td>
                      <td>USD 0,00</td>
                    </tr>
                  ))}
                  <tr className="row-sistema">
                    <td colSpan={7}>Subtotal / IVA 15% / Total</td>
                    <td>USD 0,00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Firmas() {
  const f = PACK.firmas;
  const block = (title: string, p: { nombre: string; cargo: string; fecha: string }) => (
    <article className="fac-sign">
      <p className="eyebrow">{title}</p>
      <p>
        Fecha: <strong>{p.fecha}</strong>
      </p>
      <p>
        Nombre: <strong>{p.nombre || "—"}</strong>
      </p>
      <p>
        Empresa / cargo: <strong>{p.cargo || "—"}</strong>
      </p>
    </article>
  );
  return (
    <div className="fac-sign-row">
      {block("Elaborado por", f.elaborado)}
      {block("Revisado por", f.revisado)}
      {block("Aprobado por", f.aprobado)}
    </div>
  );
}

export function FacturacionDashboard({ leafId }: Props) {
  const campos = [...new Set(PACK.units.map((u) => u.campo))];
  const showAll = leafId === "fac-documento" || !leafId.startsWith("fac-");
  const showOps = showAll || leafId === "fac-operaciones";
  const showInd = showAll || leafId === "fac-indicadores";
  const showNov = showAll || leafId === "fac-novedades";
  const showTkt = showAll || leafId === "fac-tickets";

  return (
    <ScreenShell
      report="copower"
      title="Facturación · Copower Ecuador – GTE"
      subtitle={`${PACK.document.periodo} · soporte de facturación · ${PACK.document.contrato}`}
      sourceFile={FACTURACION_SOURCE}
    >
      <div className="fac-doc">
        <DocHeader />

        {showOps ? (
          <section className="fac-section">
            <h3>Resumen de operaciones · período de facturación</h3>
            <p className="muted">
              Cada recuadro es un equipo: 31 días × OP / SB / PE / M / FS / TR. Los números salen de la hoja
              «Julio 2026»; «Nuevo Fac» es la plantilla (las celdas de horas aún estaban vacías).
            </p>
            {campos.map((campo) => (
              <div key={campo} className="fac-campo-block">
                <h4>{campo}</h4>
                <div className="fac-grids">
                  {PACK.units.filter((u) => u.campo === campo).map((u) => (
                    <HourGrid key={u.tag} unit={u} />
                  ))}
                </div>
              </div>
            ))}
            <div className="fac-campo-block">
              <h4>Perico A / Perico C</h4>
              <p className="muted">Plantilla en «Nuevo Fac» sin horas en julio. Equipos: KB-600-16, KTA19-05, KB-600-17, KTA19-06.</p>
            </div>
          </section>
        ) : null}

        {showInd ? (
          <section className="fac-section">
            <h3>Dashboard de indicadores · {PACK.document.horasMes} h de mes</h3>
            <IndicadoresTablas />
            <SistemaTabla />
            <ConsumoTabla />
            <Charts />
            <h4>Sustento de indicadores GTE</h4>
            <p className="muted">
              Hoja «Pantallazo» del Excel: capturas pegadas como evidencia. Aquí se muestran las mismas imágenes del
              libro.
            </p>
            <div className="fac-shots">
              {["image2", "image3", "image4", "image5", "image6", "image7"].map((id, i) => (
                <figure key={id} className="fac-shot">
                  <img src={`/facturacion/${id}.png`} alt={`Sustento GTE página ${i + 1}`} />
                  <figcaption>Página {i + 1}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {showNov ? (
          <section className="fac-section">
            <h3>Consolidado de novedades operativas</h3>
            <div className="table-wrap">
              <table className="indicators-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Campo</th>
                    <th>Equipo</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Penalidad</th>
                    <th>Soporte</th>
                  </tr>
                </thead>
                <tbody>
                  {PACK.events.map((e) => (
                    <tr key={e.item}>
                      <td>{e.item}</td>
                      <td>{e.fecha}</td>
                      <td>{e.campo}</td>
                      <td>{e.unidad}</td>
                      <td>{e.tipo}</td>
                      <td>{e.descripcion}</td>
                      <td>{e.penalidad}</td>
                      <td>{e.soporte}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h4>Tiempos de parada y mantenimiento correctivo</h4>
            <div className="table-wrap">
              <table className="indicators-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Equipo</th>
                    <th>Hora apagado</th>
                    <th>MTTO corr.</th>
                    <th>Tiempo muerto (PE)</th>
                    <th>Movilización</th>
                    <th>Total FS</th>
                  </tr>
                </thead>
                <tbody>
                  {PACK.downtime.map((r) => (
                    <tr key={`${r.fecha}-${r.equipo}`}>
                      <td>{r.fecha}</td>
                      <td>
                        <strong>{r.equipo}</strong>
                      </td>
                      <td>{r.horaApagado}</td>
                      <td>{fmtH(r.mttoCorr)}</td>
                      <td>{fmtH(r.pe)}</td>
                      <td>{fmtH(r.movil)}</td>
                      <td>{fmtH(r.totalFs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h4>Bitácora de aportes y mejora operativa</h4>
            <p className="muted">En el Excel solo está el título. No hay filas cargadas.</p>
          </section>
        ) : null}

        {showTkt ? (
          <section className="fac-section">
            <h3>Tickets OPEX / CAPEX por plataforma</h3>
            <Tickets />
            <h4>Registro de firmas</h4>
            <Firmas />
          </section>
        ) : null}
      </div>
    </ScreenShell>
  );
}
