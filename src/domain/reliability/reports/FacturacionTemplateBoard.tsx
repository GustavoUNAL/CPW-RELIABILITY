import type { CSSProperties } from "react";
import {
  FAC_CAPEX_CODES,
  FAC_DASHBOARD_ROWS,
  FAC_ECUADOR_UNITS,
  FAC_EXAMPLE_UNITS,
  FAC_HOUR_CODES,
  FAC_MONTH_HOURS,
  FAC_NOVEDADES_SAMPLE,
  FAC_OPEX_LINES,
  FAC_PUTUMAYO_UNITS,
  FAC_TEMPLATE_META,
  FAC_TEMPLATE_SECTIONS,
  type FacUnitExample,
} from "./facturacionTemplateData";

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function fmtInt(v: number | null | undefined) {
  if (v == null) return "—";
  return v.toLocaleString("es-CO");
}

function HourGrid({ unit }: { unit: FacUnitExample }) {
  return (
    <article className="fac-tpl-unit">
      <header className="fac-tpl-unit-head">
        <strong>
          {unit.field.toUpperCase()} – {unit.tag} ({unit.owner})
        </strong>
        <span>{unit.role}</span>
      </header>
      <div className="fac-tpl-grid-wrap">
        <table className="fac-tpl-grid">
          <thead>
            <tr>
              <th> </th>
              {DAYS.map((d) => (
                <th key={d}>{d}</th>
              ))}
              <th>Σ</th>
            </tr>
          </thead>
          <tbody>
            {FAC_HOUR_CODES.map((row) => (
              <tr key={row.code}>
                <th>{row.code}</th>
                {unit.hours[row.code].map((h, i) => (
                  <td
                    key={i}
                    className={`fac-h fac-h--${row.code.toLowerCase()}${h ? " is-on" : ""}`}
                    style={h ? ({ "--fac-a": String(Math.max(0.22, h / 24)) } as CSSProperties) : undefined}
                  >
                    {h || ""}
                  </td>
                ))}
                <td className="fac-h-sum">{fmtInt(unit.totals[row.code])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fac-tpl-unit-foot">
        {fmtInt(unit.totals.OP + unit.totals.SB + unit.totals.PE + unit.totals.M + unit.totals.FS)} h
        de balance (OP+SB+PE+M+FS) · {FAC_MONTH_HOURS} h de mes · {fmtInt(unit.kwh)} kWh ·{" "}
        {unit.ft3 != null ? `${fmtInt(unit.ft3)} ft³` : `${fmtInt(unit.gal)} gal`} · {unit.kwAvg} kW
        prom.
      </p>
    </article>
  );
}

function OwnerBadge({ owner }: { owner: "GTE" | "CPW" }) {
  return <span className={`fac-owner fac-owner--${owner.toLowerCase()}`}>{owner}</span>;
}

export function FacturacionTemplateBoard() {
  const highlightDays = new Set([3, 17, 18, 19]);

  return (
    <div className="fac-tpl">
      <section className="fac-tpl-sheet" aria-label="Encabezado del soporte de facturación">
        <div className="fac-tpl-meta">
          <div>
            <span>Documento</span>
            <strong>Soporte de facturación</strong>
          </div>
          <div>
            <span>Nombre</span>
            <strong>{FAC_TEMPLATE_META.documentName}</strong>
          </div>
          <div>
            <span>Contrato</span>
            <strong>{FAC_TEMPLATE_META.contract}</strong>
          </div>
          <div>
            <span>Origen</span>
            <strong>{FAC_TEMPLATE_META.origin}</strong>
          </div>
          <div>
            <span>Autor del formato</span>
            <strong>
              {FAC_TEMPLATE_META.author} · 25 ago 2026
            </strong>
          </div>
        </div>
        <div className="fac-tpl-values" aria-label="Valor de facturación del período">
          <p className="eyebrow">Valor de facturación del período</p>
          <div>
            <article>
              <span>OPEX</span>
              <strong>—</strong>
            </article>
            <article>
              <span>CAPEX</span>
              <strong>—</strong>
            </article>
            <article>
              <span>Total</span>
              <strong>—</strong>
            </article>
          </div>
          <small>Celdas vacías a propósito: la hoja «Nuevo Fac» es plantilla, no un cierre.</small>
        </div>
      </section>

      <ol className="fac-tpl-anatomy">
        {FAC_TEMPLATE_SECTIONS.map((s) => (
          <li key={s.n}>
            <span>{s.n}</span>
            <div>
              <strong>{s.title}</strong>
              <p>{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <section>
        <p className="eyebrow">Códigos de hora · balance 24 h/día</p>
        <ul className="fac-tpl-codes">
          {FAC_HOUR_CODES.map((c) => (
            <li key={c.code}>
              <b className={`fac-h fac-h--${c.code.toLowerCase()} is-on`}>{c.code}</b>
              <div>
                <strong>{c.label}</strong>
                <p>{c.meaning}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="fac-tpl-note">
          OP + SB + PE + M + FS = 24 h. TR viaja al lado de FS y no suma al día. En el formato viejo
          («Julio 2026») los días iban en filas; «Nuevo Fac» rota la matriz: días en columnas, códigos
          en filas.
        </p>
      </section>

      <section>
        <p className="eyebrow">Resumen de operaciones · ejemplo lleno (julio Ecuador)</p>
        <p className="fac-tpl-note">
          Así se ve un bloque del template cuando ya tiene horas. Chanangue J muestra el N+1: el día 3
          el principal entra 10 h a M3 y la reserva G301-B pasa esas mismas 10 h de SB a OP. Los días{" "}
          {Array.from(highlightDays).join(", ")} son los que rompen el 24/24.
        </p>
        <div className="fac-tpl-units">
          {FAC_EXAMPLE_UNITS.map((unit) => (
            <HourGrid key={unit.tag} unit={unit} />
          ))}
        </div>
      </section>

      <section>
        <p className="eyebrow">Dashboard del período · {FAC_MONTH_HOURS} h de mes</p>
        <div className="table-wrap fac-tpl-table">
          <table>
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Campo</th>
                <th>OP</th>
                <th>SB</th>
                <th>PE</th>
                <th>MTTO</th>
                <th>FS</th>
                <th>TR</th>
                <th>kWh/mes</th>
                <th>ft³ / gal</th>
                <th>kW prom</th>
              </tr>
            </thead>
            <tbody>
              {FAC_DASHBOARD_ROWS.map((r) => (
                <tr key={r.tag}>
                  <td>
                    <strong>{r.tag}</strong>
                  </td>
                  <td>{r.field}</td>
                  <td>{fmtInt(r.op)}</td>
                  <td>{fmtInt(r.sb)}</td>
                  <td>{fmtInt(r.pe)}</td>
                  <td>{fmtInt(r.m)}</td>
                  <td>{fmtInt(r.fs)}</td>
                  <td>{fmtInt(r.tr)}</td>
                  <td>{fmtInt(r.kwh)}</td>
                  <td>{r.ft3 != null ? `${fmtInt(r.ft3)} ft³` : `${fmtInt(r.gal)} gal`}</td>
                  <td>{fmtInt(r.kw)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <p className="eyebrow">Consolidado de novedades · muestra</p>
        <div className="table-wrap fac-tpl-table">
          <table>
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
              {FAC_NOVEDADES_SAMPLE.map((n) => (
                <tr key={n.item}>
                  <td>{n.item}</td>
                  <td>{n.date}</td>
                  <td>{n.field}</td>
                  <td>{n.unit}</td>
                  <td>{n.type}</td>
                  <td className="detalle-cell">{n.detail}</td>
                  <td>{n.penalty}</td>
                  <td>{n.support}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="fac-tpl-bill">
        <article>
          <p className="eyebrow">Facturación OPEX – por campo</p>
          <p className="fac-tpl-note">Generación de energía · contrato {FAC_TEMPLATE_META.contract}</p>
          <div className="table-wrap fac-tpl-table">
            <table>
              <thead>
                <tr>
                  <th>Ítem</th>
                  <th>Detalle</th>
                  <th>Eq. días arriba</th>
                  <th>Días</th>
                  <th>Tarifa USD</th>
                  <th>Valor USD</th>
                </tr>
              </thead>
              <tbody>
                {FAC_OPEX_LINES.map((line) => (
                  <tr key={line.item}>
                    <td>{line.item}</td>
                    <td>
                      {line.detail}
                      <small className="fac-tpl-hint">{line.hint}</small>
                    </td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={5}>Subtotal · IVA {FAC_TEMPLATE_META.ivaPct} % · Total</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
        <article>
          <p className="eyebrow">Facturación CAPEX – por campo</p>
          <p className="fac-tpl-note">El valor se arma con el desglose horario del mismo equipo.</p>
          <div className="table-wrap fac-tpl-table">
            <table>
              <thead>
                <tr>
                  <th>Ítem</th>
                  <th>Detalle</th>
                  <th>Equipo</th>
                  {FAC_CAPEX_CODES.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                  <th>Valor OP</th>
                  <th>Valor SB/PE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Tablero distribución</td>
                  <td>TD-01</td>
                  {FAC_CAPEX_CODES.map((c) => (
                    <td key={c}>—</td>
                  ))}
                  <td>—</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Filtro coalescente</td>
                  <td>FC-01</td>
                  {FAC_CAPEX_CODES.map((c) => (
                    <td key={c}>—</td>
                  ))}
                  <td>—</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section>
        <p className="eyebrow">Cómo se aplica a Putumayo Norte</p>
        <p className="fac-tpl-note">
          Cada fila de la tabla de abajo es un bloque «CAMPO – TAG (GTE|CPW)» igual al de Ecuador. Las
          horas salen de la concertación diaria (OP/SB/PE/M/FS/TR); las novedades, de la bitácora y de
          los FO-GE-033; el MTO, de la sábana. Agosto todavía no tiene esas fuentes, así que el soporte
          de facturación de Putumayo no se rellena con cifras.
        </p>
        <div className="fac-tpl-map">
          <article>
            <p className="eyebrow">Ejemplo Ecuador · {FAC_ECUADOR_UNITS.length} bloques</p>
            <ul>
              {FAC_ECUADOR_UNITS.map((u) => (
                <li key={`${u.field}-${u.tag}`}>
                  <OwnerBadge owner={u.owner} />
                  <span>
                    {u.field} – {u.tag}
                  </span>
                </li>
              ))}
            </ul>
          </article>
          <article>
            <p className="eyebrow">Putumayo Norte · {FAC_PUTUMAYO_UNITS.length} bloques</p>
            <ul>
              {FAC_PUTUMAYO_UNITS.map((u) => (
                <li key={u.tag}>
                  <OwnerBadge owner={u.owner} />
                  <span>
                    {u.field} – {u.tag}
                    <small>{u.model}</small>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <footer className="fac-tpl-sign">
        <div>
          <span>Elaboró</span>
          <strong>{FAC_TEMPLATE_META.author}</strong>
          <small>25 ago 2026</small>
        </div>
        <div>
          <span>Revisó</span>
          <strong>—</strong>
          <small>Cargo pendiente en la plantilla</small>
        </div>
        <div>
          <span>Aprobó</span>
          <strong>—</strong>
          <small>Cargo pendiente en la plantilla</small>
        </div>
      </footer>
    </div>
  );
}

