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
import type { ReportKey } from "../types";
import { CopowerIndicatorsPanel } from "./CopowerIndicatorsPanel";
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

function LiveUnitTile({ unit }: { unit: FieldUnitLive }) {
  const riskClass =
    unit.riesgo === "RIESGO ALTO"
      ? "field-live-unit--risk-high"
      : unit.riesgo === "RIESGO MEDIO"
        ? "field-live-unit--risk-med"
        : "";

  return (
    <article className={`field-live-unit ${riskClass}`}>
      <strong>{unit.id}</strong>
      <span className="field-live-metric">Disp {pct(unit.disp)}</span>
      <span className="field-live-metric">Conf {pct(unit.conf)}</span>
      <span className="field-live-fallas">{unit.fallas > 0 ? `${unit.fallas} falla(s)` : "Sin fallas"}</span>
      {unit.energiaKwh != null ? (
        <span className="field-live-energy">{Math.round(unit.energiaKwh).toLocaleString("es-CO")} kWh</span>
      ) : null}
    </article>
  );
}

function OperationalSourcePane({
  report,
  data,
}: {
  report: ReportKey;
  data: FieldOperationalData;
}) {
  const badge = report === "gran_tierra" ? "gte" : "cpw";
  const short = report === "gran_tierra" ? "GTE" : "CPW";

  if (!data.available) {
    return (
      <article className={`field-op-pane field-op-pane--${badge}`}>
        <header className="field-op-pane-head">
          <strong>{data.reportLabel}</strong>
          <span className={`source-badge ${badge}`}>{short}</span>
        </header>
        <p className="field-op-empty">Sin datos para este periodo en esta fuente.</p>
      </article>
    );
  }

  return (
    <article className={`field-op-pane field-op-pane--${badge}`}>
      <header className="field-op-pane-head">
        <div>
          <strong>{data.reportLabel}</strong>
          <small>{data.units.length} unidades · {data.sourceFile?.split("/").pop()}</small>
        </div>
        <span className={`source-badge ${badge}`}>{short}</span>
      </header>

      <div className="field-op-kpi-grid">
        <div className="field-op-kpi field-op-kpi--hero">
          <span>Disponibilidad</span>
          <strong>{pct(data.disp)}</strong>
        </div>
        <div className="field-op-kpi field-op-kpi--hero">
          <span>Confiabilidad</span>
          <strong>{pct(data.conf)}</strong>
        </div>
        <div className="field-op-kpi">
          <span>Generación</span>
          <strong>{kwh(data.generationKwh)}</strong>
          {data.gasKwh != null ? (
            <small>
              Gas {kwh(data.gasKwh)}
              {data.dieselKwh ? ` · Diésel ${kwh(data.dieselKwh)}` : ""}
            </small>
          ) : null}
        </div>
        <div className="field-op-kpi">
          <span>Fallas</span>
          <strong>{data.fallas}</strong>
          <small>Suma unidades del campo</small>
        </div>
        <div className="field-op-kpi">
          <span>Horas operación</span>
          <strong>{hours(data.hoursOp)}</strong>
        </div>
        <div className="field-op-kpi">
          <span>Horas FS</span>
          <strong>{hours(data.hoursFs)}</strong>
          <small>PF contr + PF cli</small>
        </div>
      </div>

      {data.units.length > 0 ? (
        <div className="field-live-grid">
          {data.units.map((u) => (
            <LiveUnitTile key={u.id} unit={u} />
          ))}
        </div>
      ) : (
        <p className="field-op-empty">Sin unidades registradas para este campo.</p>
      )}
    </article>
  );
}

function OperationalDualSection({
  fieldKey,
  month,
  monthLabel,
}: {
  fieldKey: FieldKey;
  month: string;
  monthLabel: string;
}) {
  const gte = getFieldOperational("gran_tierra", month, fieldKey);

  return (
    <section className="field-op-section">
      <div className="field-section-label">
        <Activity size={15} />
        <span>Indicadores COPOWER</span>
        <span className="field-group-count">{monthLabel}</span>
      </div>
      <CopowerIndicatorsPanel month={month} fieldKey={fieldKey} />

      <div className="field-section-label field-section-label--sub">
        <Gauge size={15} />
        <span>Comparativo Gran Tierra</span>
      </div>
      <div className="field-op-compare-single">
        <OperationalSourcePane report="gran_tierra" data={gte} />
      </div>
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
        <div>
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
      <OperationalDualSection fieldKey={fieldKey} month={month} monthLabel={monthLabel} />

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
      <OperationalDualSection fieldKey={fieldKey} month={month} monthLabel={monthLabel} />

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
        Activos: data/contratos · Indicadores: Gran Tierra (informe oficial) + COPOWER (reporte diario)
      </p>
    </ScreenShell>
  );
}
