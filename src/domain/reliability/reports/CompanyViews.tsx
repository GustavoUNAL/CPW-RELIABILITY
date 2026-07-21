import type { ReactNode } from "react";
import { Building2, FileText, MapPin, Phone } from "lucide-react";
import {
  COPOWER_PROFILE,
  GTE_PROFILE,
  type CompanyContractRow,
  type CompanyFact,
} from "../contracts/companyProfiles";
import { ScreenShell } from "../ui/ScreenShell";

function FactGrid({ facts }: { facts: CompanyFact[] }) {
  return (
    <div className="company-fact-grid">
      {facts.map((f) => (
        <div key={f.label} className="company-fact">
          <span>{f.label}</span>
          <strong>{f.value}</strong>
        </div>
      ))}
    </div>
  );
}

function ContractTable({ rows, title }: { rows: CompanyContractRow[]; title: string }) {
  return (
    <div className="company-contract-block">
      <h4>{title}</h4>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Objeto</th>
              <th>Vigencia</th>
              <th>Valor ref.</th>
              <th>Confiabilidad</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.orderNo}>
                <td>
                  <strong>{r.orderNo}</strong>
                  <br />
                  <small className="muted">{r.sourceFile.replace("data/contratos/", "")}</small>
                </td>
                <td>{r.object}</td>
                <td>{r.term}</td>
                <td>{r.estimatedValue}</td>
                <td>{r.reliabilityScope}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.some((r) => r.admin || r.offerRef) ? (
        <ul className="insight-list company-meta-list">
          {rows.map(
            (r) =>
              r.admin || r.offerRef ? (
                <li key={`meta-${r.orderNo}`}>
                  <strong>{r.orderNo}</strong>
                  {r.offerRef ? ` · Oferta ${r.offerRef}` : ""}
                  {r.admin ? ` · Admin: ${r.admin}` : ""}
                </li>
              ) : null,
          )}
        </ul>
      ) : null}
    </div>
  );
}

function CompanyIdentity({
  name,
  role,
  badge,
  children,
}: {
  name: string;
  role: string;
  badge: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="company-identity">
      <div className="company-identity-head">
        <div>
          <h3>{name}</h3>
          <p className="muted">{role}</p>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

export function CopowerCompanyView() {
  return (
    <ScreenShell report="copower" headless>
      <CompanyIdentity
        name={COPOWER_PROFILE.legalName}
        role={COPOWER_PROFILE.role}
        badge={<span className="source-badge cpw">Operador</span>}
      >
        <div className="company-contact-row">
          <span>
            <Building2 size={14} /> NIT {COPOWER_PROFILE.nit} · SAP {COPOWER_PROFILE.sapCode}
          </span>
          <span>
            <MapPin size={14} /> {COPOWER_PROFILE.address}, {COPOWER_PROFILE.city}
          </span>
          <span>
            <Phone size={14} /> {COPOWER_PROFILE.phone}
          </span>
          <span>
            <FileText size={14} /> {COPOWER_PROFILE.emails}
          </span>
        </div>
      </CompanyIdentity>

      <p className="muted company-subrole">Proveedor adjudicado · Costayaco y Vonú, Putumayo</p>

      <FactGrid facts={COPOWER_PROFILE.facts} />

      <ContractTable rows={COPOWER_PROFILE.activeOrders} title="Órdenes activas con Gran Tierra (data/contratos)" />

      <p className="muted company-footnote">
        La Orden <strong>1200005030</strong> (costayaco.pdf) define metas de disponibilidad y confiabilidad sistémica ≥
        98% para el bloque 8 MW. La Orden <strong>9000007071</strong> (vonus.pdf) complementa con renta de equipos
        diésel/gas por tarifa diaria, sin indicadores de confiabilidad de sistema.
      </p>
    </ScreenShell>
  );
}

export function GteCompanyView() {
  return (
    <ScreenShell report="gran_tierra" headless>
      <CompanyIdentity
        name={GTE_PROFILE.legalName}
        role={GTE_PROFILE.role}
        badge={<span className="source-badge gte">Cliente</span>}
      >
        <div className="company-contact-row">
          <span>
            <Building2 size={14} /> NIT {GTE_PROFILE.nit}
          </span>
          <span>
            <MapPin size={14} /> {GTE_PROFILE.address}, {GTE_PROFILE.city}
          </span>
          <span>
            <Phone size={14} /> {GTE_PROFILE.phone}
          </span>
        </div>
      </CompanyIdentity>

      <p className="muted company-subrole">{GTE_PROFILE.area} · Aceptante contractual</p>

      <FactGrid facts={GTE_PROFILE.facts} />

      <ContractTable rows={GTE_PROFILE.contractOrders} title="Marco contractual en carpeta data/contratos" />

      <p className="muted company-footnote">{GTE_PROFILE.reliabilityNote}</p>
    </ScreenShell>
  );
}
