import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Cpu,
  Droplets,
  Factory,
  FileText,
  Gauge,
  Layers,
  MapPin,
  Shield,
  Zap,
} from "lucide-react";
import {
  getFieldOperational,
  type FieldOperationalData,
  type FieldUnitLive,
} from "../contracts/fieldOperational";
import {
  FIELD_PROFILES,
  type AssetCard,
  type AssetCardKind,
  type AssetGroup,
  type FieldKey,
  type FieldProfile,
  type FleetUnit,
} from "../contracts/fieldAssets";
import { ScreenShell } from "../ui/ScreenShell";

const CARD_ICONS: Record<AssetCardKind, LucideIcon> = {
  gas: Zap,
  diesel: Droplets,
  power: Activity,
  infra: Factory,
};

const pct = (v: number | null) => (v == null || Number.isNaN(v) ? "N/D" : `${v.toFixed(2)}%`);
const kwh = (v: number | null) =>
  v == null || Number.isNaN(v) ? "N/D" : `${Math.round(v).toLocaleString("es-CO")} kWh`;
const hours = (v: number | null) =>
  v == null || Number.isNaN(v) ? "N/D" : `${v.toLocaleString("es-CO", { maximumFractionDigits: 1 })} h`;

function iconForCard(card: AssetCard) {
  return CARD_ICONS[card.kind ?? "gas"];
}

function pick<T>(primary: T | null | undefined, fallback: T | null | undefined): T | null {
  if (primary != null) return primary;
  if (fallback != null) return fallback;
  return null;
}

function normId(id: string) {
  return id.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

type MergedUnit = {
  id: string;
  disp: number | null;
  conf: number | null;
  fallas: number;
  mtbf: string;
  mttr: number | null;
  riesgo: string;
  energiaKwh: number | null;
};

function mergeFieldUnits(gte: FieldUnitLive[], cpw: FieldUnitLive[]): MergedUnit[] {
  const map = new Map<string, MergedUnit>();

  for (const u of gte) {
    map.set(normId(u.id), {
      id: u.id,
      disp: u.disp,
      conf: u.conf,
      fallas: u.fallas,
      mtbf: u.mtbf,
      mttr: u.mttr,
      riesgo: u.riesgo,
      energiaKwh: u.energiaKwh,
    });
  }

  for (const u of cpw) {
    const key = normId(u.id);
    const existing = map.get(key);
    if (existing) {
      if (existing.disp == null) existing.disp = u.disp;
      if (existing.conf == null) existing.conf = u.conf;
      if (existing.fallas === 0 && u.fallas > 0) existing.fallas = u.fallas;
      if (!existing.mtbf || existing.mtbf === "N/D") {
        if (u.mtbf) existing.mtbf = u.mtbf;
      }
      if (existing.mttr == null) existing.mttr = u.mttr;
      if (!existing.riesgo || existing.riesgo === "N/A") existing.riesgo = u.riesgo;
      if (existing.energiaKwh == null) existing.energiaKwh = u.energiaKwh;
    } else {
      map.set(key, {
        id: u.id,
        disp: u.disp,
        conf: u.conf,
        fallas: u.fallas,
        mtbf: u.mtbf,
        mttr: u.mttr,
        riesgo: u.riesgo,
        energiaKwh: u.energiaKwh,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.fallas - a.fallas || a.id.localeCompare(b.id));
}

function FieldHeroBanner({ field }: { field: FieldProfile }) {
  if (!field.hero) return null;
  const [primary, ...secondary] = field.stats;
  const voltage = field.stats.find((s) => s.label.toLowerCase().includes("tensión"))?.value;

  return (
    <section className="field-hero field-hero--costayaco">
      <div className="field-hero-copy">
        <span className="field-hero-role">{field.hero.role}</span>
        <p className="field-hero-location">
          <MapPin size={14} />
          {field.hero.location}
        </p>
        <div className="field-hero-badges">
          {field.hero.orders.map((order) => (
            <span key={order} className="field-order-badge">
              <FileText size={12} />
              Orden {order}
            </span>
          ))}
          {voltage ? <span className="field-voltage-badge">{voltage}</span> : null}
        </div>
      </div>
      <div className="field-hero-metrics">
        <article className="field-hero-metric field-hero-metric--primary">
          <span>{primary.label}</span>
          <strong>{primary.value}</strong>
          {primary.hint ? <small>{primary.hint}</small> : null}
        </article>
        {secondary.slice(0, 2).map((s) => (
          <article key={s.label} className="field-hero-metric">
            <span>{s.label}</span>
            <strong>{s.value}</strong>
            {s.hint ? <small>{s.hint}</small> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function FleetPanel({ fleet }: { fleet: FleetUnit[] }) {
  const jinan = fleet.filter((u) => u.variant === "jinan");
  const jenbacher = fleet.filter((u) => u.variant === "jenbacher");

  return (
    <section className="field-fleet-panel">
      <div className="field-section-label">
        <Shield size={15} />
        <span>Parque operativo · contrato</span>
        <span className="field-group-count">{fleet.length} unidades</span>
      </div>
      <div className="field-fleet-layout">
        <div className="field-fleet-family">
          <header>
            <span className="field-fleet-family-tag field-fleet-family-tag--jinan">Jinan</span>
            <span>{jinan.length} × CPW500</span>
          </header>
          <div className="field-fleet-grid">
            {jinan.map((u) => (
              <article key={u.id} className="field-fleet-unit field-fleet-unit--jinan">
                <strong>{u.id}</strong>
                <span>{u.power}</span>
              </article>
            ))}
          </div>
        </div>
        <div className="field-fleet-family field-fleet-family--wide">
          <header>
            <span className="field-fleet-family-tag field-fleet-family-tag--jenbacher">Jenbacher</span>
            <span>{jenbacher.length} × J420 en operación</span>
          </header>
          <div className="field-fleet-grid field-fleet-grid--jenbacher">
            {jenbacher.map((u) => (
              <article key={u.id} className="field-fleet-unit field-fleet-unit--jenbacher">
                <strong>{u.id}</strong>
                <span>{u.power}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveUnitTile({ unit }: { unit: MergedUnit }) {
  const riskClass =
    unit.riesgo === "RIESGO ALTO"
      ? "field-live-unit--risk-high"
      : unit.riesgo === "RIESGO MEDIO"
        ? "field-live-unit--risk-med"
        : "field-live-unit--risk-low";

  return (
    <article className={`field-live-unit ${riskClass}${unit.fallas >= 3 ? " field-live-unit--alert" : ""}`}>
      <header className="field-live-unit-head">
        <strong>{unit.id}</strong>
        <span
          className={`badge ${
            unit.riesgo === "RIESGO ALTO" ? "danger" : unit.riesgo === "RIESGO MEDIO" ? "warn" : "success"
          }`}
        >
          {unit.riesgo.replace("RIESGO ", "")}
        </span>
      </header>
      <div className="field-live-metrics">
        <div className="field-live-metric">
          <span>Disp</span>
          <strong>{pct(unit.disp)}</strong>
        </div>
        <div className="field-live-metric">
          <span>Conf</span>
          <strong>{pct(unit.conf)}</strong>
        </div>
        <div className="field-live-metric field-live-fallas">
          <span>Fallas</span>
          <strong>{unit.fallas}</strong>
        </div>
      </div>
      <footer className="field-live-unit-foot">
        <span>MTBF {unit.mtbf}</span>
        {unit.energiaKwh != null ? (
          <span className="field-live-energy">{Math.round(unit.energiaKwh).toLocaleString("es-CO")} kWh</span>
        ) : (
          <span className="field-live-energy muted">Sin energía</span>
        )}
      </footer>
    </article>
  );
}

function FieldPerformanceSection({
  fieldKey,
  month,
  monthLabel,
}: {
  fieldKey: FieldKey;
  month: string;
  monthLabel: string;
}) {
  const gte = getFieldOperational("gran_tierra", month, fieldKey);
  const cpw = getFieldOperational("copower", month, fieldKey);

  if (!gte.available && !cpw.available) {
    return (
      <section className="field-op-section">
        <div className="field-section-label">
          <Activity size={15} />
          <span>Desempeño del campo</span>
          <span className="field-group-count">{monthLabel}</span>
        </div>
        <p className="field-op-empty">Sin indicadores cargados para este campo en el periodo.</p>
      </section>
    );
  }

  const primary: FieldOperationalData = gte.available ? gte : cpw;
  const secondary: FieldOperationalData | null = gte.available && cpw.available ? cpw : null;

  const disp = pick(gte.available ? gte.disp : null, cpw.available ? cpw.disp : null);
  const conf = pick(gte.available ? gte.conf : null, cpw.available ? cpw.conf : null);
  const generationKwh = pick(
    gte.available ? gte.generationKwh : null,
    cpw.available ? cpw.generationKwh : null,
  );
  const gasKwh = pick(gte.available ? gte.gasKwh : null, cpw.available ? cpw.gasKwh : null);
  const dieselKwh = pick(gte.available ? gte.dieselKwh : null, cpw.available ? cpw.dieselKwh : null);
  const fallas = gte.available ? gte.fallas : cpw.fallas;
  const hoursOp = pick(gte.available ? gte.hoursOp : null, cpw.available ? cpw.hoursOp : null);
  const hoursFs = pick(gte.available ? gte.hoursFs : null, cpw.available ? cpw.hoursFs : null);
  const units = mergeFieldUnits(gte.available ? gte.units : [], cpw.available ? cpw.units : []);

  return (
    <section className="field-op-section">
      <div className="field-section-label">
        <Activity size={15} />
        <span>Desempeño del campo</span>
        <span className="field-group-count">{monthLabel}</span>
      </div>

      <article className="field-op-pane field-op-pane--field">
        <header className="field-op-pane-head">
          <div>
            <strong>{FIELD_PROFILES[fieldKey].label}</strong>
            <small>Un solo campo · informe oficial priorizado · operación diaria como complemento</small>
          </div>
        </header>

        <div className="field-op-kpi-grid">
          <div className="field-op-kpi field-op-kpi--hero">
            <span>Disponibilidad</span>
            <strong>{pct(disp)}</strong>
            {secondary && gte.disp != null && cpw.disp != null ? (
              <small>
                GTE {pct(gte.disp)} · CPW {pct(cpw.disp)}
              </small>
            ) : (
              <small>Campo · meta ≥ 98%</small>
            )}
          </div>
          <div className="field-op-kpi field-op-kpi--hero">
            <span>Confiabilidad</span>
            <strong>{pct(conf)}</strong>
            {secondary && gte.conf != null && cpw.conf != null ? (
              <small>
                GTE {pct(gte.conf)} · CPW {pct(cpw.conf)}
              </small>
            ) : (
              <small>Campo · meta ≥ 98%</small>
            )}
          </div>
          <div className="field-op-kpi">
            <span>Generación</span>
            <strong>{kwh(generationKwh)}</strong>
            {gasKwh != null ? (
              <small>
                Gas {kwh(gasKwh)}
                {dieselKwh ? ` · Diésel ${kwh(dieselKwh)}` : ""}
              </small>
            ) : (
              <small>Energía del periodo</small>
            )}
          </div>
          <div className={`field-op-kpi${fallas >= 3 ? " field-op-kpi--warn" : ""}`}>
            <span>Fallas</span>
            <strong>{fallas}</strong>
            {gte.available && cpw.available && gte.fallas !== cpw.fallas ? (
              <small>
                GTE {gte.fallas} · CPW {cpw.fallas}
              </small>
            ) : (
              <small>Unidades del campo</small>
            )}
          </div>
          <div className="field-op-kpi">
            <span>Horas operación</span>
            <strong>{hours(hoursOp)}</strong>
            <small>Suma equipos del campo</small>
          </div>
          <div className="field-op-kpi">
            <span>Horas FS</span>
            <strong>{hours(hoursFs)}</strong>
            <small>PF contr + PF cli</small>
          </div>
        </div>

        {units.length > 0 ? (
          <div className="field-live-grid">
            {units.map((u) => (
              <LiveUnitTile key={u.id} unit={u} />
            ))}
          </div>
        ) : (
          <p className="field-op-empty">Sin unidades registradas para este campo.</p>
        )}

        <p className="field-op-sources muted">
          Fuentes: {primary.sourceFile?.split("/").pop() ?? "N/D"}
          {secondary?.sourceFile ? ` · ${secondary.sourceFile.split("/").pop()}` : ""}
        </p>
      </article>
    </section>
  );
}

function StatGrid({ stats, compact }: { stats: FieldProfile["stats"]; compact?: boolean }) {
  return (
    <div className={`field-stat-grid${compact ? " field-stat-grid--compact" : ""}`}>
      {stats.map((s) => (
        <article key={s.label} className="field-stat-card">
          <span className="field-stat-label">{s.label}</span>
          <strong className="field-stat-value">{s.value}</strong>
          {s.hint ? <small>{s.hint}</small> : null}
        </article>
      ))}
    </div>
  );
}

function AssetCardView({ card }: { card: AssetCard }) {
  const Icon = iconForCard(card);
  const kind = card.kind ?? "gas";

  return (
    <article className={`field-asset-card field-asset-card--${kind}`}>
      <header className="field-asset-card-head">
        <div className={`field-asset-card-icon field-asset-card-icon--${kind}`}>
          <Icon size={18} />
        </div>
        <div className="field-asset-card-titles">
          <h4>{card.title}</h4>
          {card.power ? <span className="field-asset-power">{card.power}</span> : null}
        </div>
        {card.count != null ? (
          <span className="field-asset-count" title="Cantidad">
            ×{card.count}
          </span>
        ) : null}
      </header>
      <p className="field-asset-detail">{card.detail}</p>
      {card.units?.length ? (
        <div className="field-asset-units">
          {card.units.map((u) => (
            <span key={u} className="field-unit-chip">
              {u}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function AssetGroupSection({ group, wide }: { group: AssetGroup; wide?: boolean }) {
  return (
    <section className="field-group">
      <div className="field-section-label">
        <Layers size={15} />
        <span>{group.title}</span>
        <span className="field-group-count">{group.cards.length} activos</span>
      </div>
      <div className={`field-card-grid${wide ? " field-card-grid--wide" : ""}`}>
        {group.cards.map((card) => (
          <AssetCardView key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}

function CostayacoFieldView({
  field,
  fieldKey,
  month,
  monthLabel,
}: {
  field: FieldProfile;
  fieldKey: FieldKey;
  month: string;
  monthLabel: string;
}) {
  const hubGroups = field.groups.filter((g) => g.placement === "hub");
  const sideGroups = field.groups.filter((g) => g.placement === "side");
  const bottomGroups = field.groups.filter((g) => g.placement === "bottom");
  const secondaryStats = field.stats.slice(3);

  return (
    <div className="field-view field-view--costayaco">
      <FieldHeroBanner field={field} />
      {field.fleet ? <FleetPanel fleet={field.fleet} /> : null}
      <FieldPerformanceSection fieldKey={fieldKey} month={month} monthLabel={monthLabel} />

      {secondaryStats.length ? (
        <>
          <div className="field-section-label">
            <Gauge size={15} />
            <span>Indicadores contractuales</span>
          </div>
          <StatGrid stats={secondaryStats} compact />
        </>
      ) : null}

      <div className="field-hub-layout">
        <div className="field-hub-main">
          {hubGroups.map((group) => (
            <AssetGroupSection key={group.title} group={group} wide />
          ))}
        </div>
        <aside className="field-hub-side">
          {sideGroups.map((group) => (
            <AssetGroupSection key={group.title} group={group} />
          ))}
        </aside>
      </div>

      <div className="field-bottom-row">
        {bottomGroups.map((group) => (
          <AssetGroupSection key={group.title} group={group} wide />
        ))}
      </div>
    </div>
  );
}

function StandardFieldView({
  field,
  fieldKey,
  month,
  monthLabel,
}: {
  field: FieldProfile;
  fieldKey: FieldKey;
  month: string;
  monthLabel: string;
}) {
  return (
    <div className="field-view">
      <div className="field-section-label">
        <Gauge size={15} />
        <span>Indicadores contractuales</span>
      </div>
      <StatGrid stats={field.stats} />
      <FieldPerformanceSection fieldKey={fieldKey} month={month} monthLabel={monthLabel} />

      {field.groups.map((group) => (
        <AssetGroupSection key={group.title} group={group} />
      ))}
    </div>
  );
}

type Props = {
  fieldKey: FieldKey;
  month: string;
  monthLabel: string;
};

export function FieldAssetsView({ fieldKey, month, monthLabel }: Props) {
  const field = FIELD_PROFILES[fieldKey];

  return (
    <ScreenShell report="dual" title={field.label} subtitle={`${field.description} · ${monthLabel}`}>
      {field.layout === "hub" ? (
        <CostayacoFieldView field={field} fieldKey={fieldKey} month={month} monthLabel={monthLabel} />
      ) : (
        <StandardFieldView field={field} fieldKey={fieldKey} month={month} monthLabel={monthLabel} />
      )}

      <p className="field-source-note">
        <Cpu size={14} />
        Un solo campo · activos de contrato · desempeño consolidado del periodo
      </p>
    </ScreenShell>
  );
}
