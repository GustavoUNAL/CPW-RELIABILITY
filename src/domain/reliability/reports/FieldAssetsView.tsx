import { useState } from "react";
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

type FieldDataSource = "auto" | "copower" | "gran_tierra";

const META = 98;
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

type UnitDescriptor = {
  power?: string;
  characteristic?: string;
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

function buildUnitDescriptors(field: FieldProfile): Map<string, UnitDescriptor> {
  const descriptors = new Map<string, UnitDescriptor>();

  for (const unit of field.fleet ?? []) {
    descriptors.set(normId(unit.id), {
      power: unit.power,
      characteristic: unit.family,
    });
  }

  for (const group of field.groups) {
    for (const card of group.cards) {
      for (const unitId of card.units ?? []) {
        const key = normId(unitId);
        const existing = descriptors.get(key);
        descriptors.set(key, {
          power: existing?.power ?? card.power,
          characteristic: existing?.characteristic ?? card.title,
        });
      }
    }
  }

  return descriptors;
}

function MeterBar({ value, meta = META }: { value: number | null; meta?: number }) {
  if (value == null) {
    return <div className="field-meter field-meter--empty" />;
  }
  const width = Math.max(0, Math.min(100, value));
  const tone = value >= meta ? "ok" : value >= meta - 2 ? "warn" : "bad";
  return (
    <div className="field-meter" aria-hidden>
      <div className={`field-meter-fill field-meter-fill--${tone}`} style={{ width: `${width}%` }} />
      <span className="field-meter-mark" style={{ left: `${meta}%` }} />
    </div>
  );
}

function FieldHeroBanner({ field, monthLabel }: { field: FieldProfile; monthLabel: string }) {
  if (!field.hero) return null;
  const [primary, ...secondary] = field.stats;
  const voltage = field.stats.find((s) => s.label.toLowerCase().includes("tensión"))?.value;

  return (
    <section className={`field-hero field-hero--${field.key}`}>
      <div className="field-hero-copy">
        <span className="field-hero-role">{field.hero.role}</span>
        <h2 className="field-hero-title">{field.label}</h2>
        <p className="field-hero-location">
          <MapPin size={14} />
          {field.hero.location}
        </p>
        <p className="field-hero-desc">{field.description}</p>
        <div className="field-hero-badges">
          {field.hero.orders.map((order) => (
            <span key={order} className="field-order-badge">
              <FileText size={12} />
              Orden {order}
            </span>
          ))}
          {voltage ? <span className="field-voltage-badge">{voltage}</span> : null}
          <span className="field-period-badge">{monthLabel}</span>
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

function FleetPanel({ fleet, fieldKey }: { fleet: FleetUnit[]; fieldKey: FieldKey }) {
  const jinan = fleet.filter((u) => u.variant === "jinan");
  const jenbacher = fleet.filter((u) => u.variant === "jenbacher");
  const jinanTrioLabel = jinan.length >= 3 ? jinan.slice(0, 3).map((u) => u.id).join(" · ") : "N/D";
  const jenA = jenbacher.slice(0, 3);
  const jenB = jenbacher.slice(3, 6);

  return (
    <section className="field-fleet-panel">
      <div className="field-section-label">
        <Shield size={15} />
        <span>Parque operativo · contrato</span>
        <span className="field-group-count">{fleet.length} unidades</span>
      </div>
      <div className={`field-fleet-layout${jenbacher.length === 0 ? " field-fleet-layout--single" : ""}`}>
        {jinan.length > 0 ? (
          <div className="field-fleet-family">
            <header>
              <span className="field-fleet-family-tag field-fleet-family-tag--jinan">Jinan</span>
              <span>
                {jinan.length} × CPW500
                {fieldKey === "vonu" ? " · Vonú" : ""}
              </span>
            </header>
            <ul className="field-fleet-ref-list">
              <li>Referencia: {jinanTrioLabel}</li>
              <li>Potencia nominal: {(jinan.length * 500).toLocaleString("es-CO")} kW</li>
              <li>Seguimiento: Disp · Conf · Fallas · MTBF</li>
            </ul>
            <div className="field-fleet-grid">
              {jinan.map((u) => (
                <article key={u.id} className="field-fleet-unit field-fleet-unit--jinan">
                  <strong>{u.id}</strong>
                  <span>{u.power}</span>
                  <small>{u.family}</small>
                </article>
              ))}
            </div>
          </div>
        ) : null}
        {jenbacher.length > 0 ? (
          <div className="field-fleet-family field-fleet-family--wide">
            <header>
              <span className="field-fleet-family-tag field-fleet-family-tag--jenbacher">Jenbacher</span>
              <span>{jenbacher.length} × J420 en operación</span>
            </header>
            <ul className="field-fleet-ref-list">
              <li>Trío A: {jenA.length ? jenA.map((u) => u.id).join(" · ") : "N/D"}</li>
              {jenB.length ? <li>Trío B: {jenB.map((u) => u.id).join(" · ")}</li> : null}
              <li>Indicadores por grupo de 3 máquinas</li>
            </ul>
            <div className="field-fleet-grid field-fleet-grid--jenbacher">
              {jenbacher.map((u) => (
                <article key={u.id} className="field-fleet-unit field-fleet-unit--jenbacher">
                  <strong>{u.id}</strong>
                  <span>{u.power}</span>
                  <small>{u.family}</small>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function LiveUnitTile({ unit, descriptor }: { unit: MergedUnit; descriptor?: UnitDescriptor }) {
  const riskClass =
    unit.riesgo === "RIESGO ALTO"
      ? "field-live-unit--risk-high"
      : unit.riesgo === "RIESGO MEDIO"
        ? "field-live-unit--risk-med"
        : "field-live-unit--risk-low";

  return (
    <article className={`field-live-unit ${riskClass}${unit.fallas >= 3 ? " field-live-unit--alert" : ""}`}>
      <header className="field-live-unit-head">
        <div>
          <strong>{unit.id}</strong>
          <p className="field-live-spec">
            {descriptor?.characteristic ?? "Unidad de campo"}
            {descriptor?.power ? ` · ${descriptor.power}` : ""}
          </p>
        </div>
        <span
          className={`badge ${
            unit.riesgo === "RIESGO ALTO" ? "danger" : unit.riesgo === "RIESGO MEDIO" ? "warn" : "success"
          }`}
        >
          {unit.riesgo.replace("RIESGO ", "")}
        </span>
      </header>

      <div className="field-live-meters">
        <div>
          <div className="field-live-meter-labels">
            <span>Disponibilidad</span>
            <strong>{pct(unit.disp)}</strong>
          </div>
          <MeterBar value={unit.disp} />
        </div>
        <div>
          <div className="field-live-meter-labels">
            <span>Confiabilidad</span>
            <strong>{pct(unit.conf)}</strong>
          </div>
          <MeterBar value={unit.conf} />
        </div>
      </div>

      <div className="field-live-metrics">
        <div className="field-live-metric field-live-fallas">
          <span>Fallas</span>
          <strong>{unit.fallas}</strong>
        </div>
        <div className="field-live-metric">
          <span>MTBF</span>
          <strong>{unit.mtbf}</strong>
        </div>
        <div className="field-live-metric">
          <span>MTTR</span>
          <strong>{unit.mttr == null ? "N/D" : `${unit.mttr} h`}</strong>
        </div>
      </div>

      <footer className="field-live-unit-foot">
        {unit.energiaKwh != null ? (
          <span className="field-live-energy">
            {Math.round(unit.energiaKwh).toLocaleString("es-CO")} kWh generados
          </span>
        ) : (
          <span className="field-live-energy muted">Sin energía reportada</span>
        )}
      </footer>
    </article>
  );
}

function SourceSwitch({
  source,
  onSourceChange,
}: {
  source: FieldDataSource;
  onSourceChange: (source: FieldDataSource) => void;
}) {
  return (
    <div className="field-source-switch" role="tablist" aria-label="Fuente de datos del campo">
      {(
        [
          ["auto", "Auto"],
          ["copower", "COPOWER"],
          ["gran_tierra", "Gran Tierra"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          className={`field-source-chip${source === id ? " field-source-chip--active" : ""}`}
          onClick={() => onSourceChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function FieldPerformanceSection({
  field,
  fieldKey,
  month,
  monthLabel,
  source,
  onSourceChange,
}: {
  field: FieldProfile;
  fieldKey: FieldKey;
  month: string;
  monthLabel: string;
  source: FieldDataSource;
  onSourceChange: (source: FieldDataSource) => void;
}) {
  const gte = getFieldOperational("gran_tierra", month, fieldKey);
  const cpw = getFieldOperational("copower", month, fieldKey);

  if (!gte.available && !cpw.available) {
    return (
      <section className="field-op-section">
        <div className="field-section-label">
          <Activity size={15} />
          <span>Desempeño del periodo</span>
          <span className="field-group-count">{monthLabel}</span>
        </div>
        <SourceSwitch source={source} onSourceChange={onSourceChange} />
        <p className="field-op-empty">Sin indicadores cargados para este campo en el periodo.</p>
      </section>
    );
  }

  const autoPrimary: FieldOperationalData = cpw.available ? cpw : gte;
  const selectedPrimary: FieldOperationalData =
    source === "copower" ? (cpw.available ? cpw : gte) : source === "gran_tierra" ? (gte.available ? gte : cpw) : autoPrimary;
  const selectedSecondary: FieldOperationalData | null =
    selectedPrimary.reportLabel === "COPOWER"
      ? gte.available
        ? gte
        : null
      : cpw.available
        ? cpw
        : null;
  const unitDescriptors = buildUnitDescriptors(field);

  const units =
    source === "auto"
      ? mergeFieldUnits(gte.units, cpw.units)
      : selectedPrimary.units.length > 0
        ? mergeFieldUnits([], selectedPrimary.units)
        : mergeFieldUnits(gte.units, cpw.units);

  const sourceHint =
    source === "auto"
      ? "Fuente automática (COPOWER prioridad · GTE referencia)"
      : selectedPrimary.reportLabel === "COPOWER"
        ? "Fuente seleccionada: COPOWER"
        : "Fuente seleccionada: Gran Tierra Energy";

  const critical = units.filter((u) => u.fallas >= 2 || u.riesgo !== "RIESGO BAJO").length;

  return (
    <section className="field-op-section">
      <div className="field-section-label">
        <Activity size={15} />
        <span>Desempeño del periodo</span>
        <span className="field-group-count">{monthLabel}</span>
      </div>
      <SourceSwitch source={source} onSourceChange={onSourceChange} />

      <article className="field-op-pane field-op-pane--field">
        <header className="field-op-pane-head">
          <div>
            <strong>Indicadores del campo · {FIELD_PROFILES[fieldKey].label}</strong>
            <small>{sourceHint}</small>
          </div>
          {critical > 0 ? (
            <span className="badge warn">{critical} unidad(es) en seguimiento</span>
          ) : (
            <span className="badge success">Sin críticos</span>
          )}
        </header>

        <div className="field-op-kpi-grid">
          <div className="field-op-kpi field-op-kpi--hero">
            <span>Disponibilidad</span>
            <strong>{pct(selectedPrimary.disp)}</strong>
            <MeterBar value={selectedPrimary.disp} />
            <small>Meta ≥ {META}%</small>
          </div>
          <div className="field-op-kpi field-op-kpi--hero">
            <span>Confiabilidad</span>
            <strong>{pct(selectedPrimary.conf)}</strong>
            <MeterBar value={selectedPrimary.conf} />
            <small>Meta ≥ {META}%</small>
          </div>
          <div className="field-op-kpi">
            <span>Generación</span>
            <strong>{kwh(selectedPrimary.generationKwh)}</strong>
            <small>
              {selectedPrimary.gasKwh != null
                ? `Gas ${kwh(selectedPrimary.gasKwh)}${
                    selectedPrimary.dieselKwh ? ` · Diésel ${kwh(selectedPrimary.dieselKwh)}` : ""
                  }`
                : "Energía del periodo"}
            </small>
          </div>
          <div className={`field-op-kpi${selectedPrimary.fallas >= 3 ? " field-op-kpi--warn" : ""}`}>
            <span>Fallas</span>
            <strong>{selectedPrimary.fallas}</strong>
            <small>
              {selectedSecondary && selectedPrimary.fallas !== selectedSecondary.fallas
                ? `CPW/GTE: ${selectedPrimary.fallas} / ${selectedSecondary.fallas}`
                : "Unidades del campo"}
            </small>
          </div>
          <div className="field-op-kpi">
            <span>Horas operación</span>
            <strong>{hours(selectedPrimary.hoursOp)}</strong>
            <small>Suma equipos del campo</small>
          </div>
          <div className="field-op-kpi">
            <span>Horas FS</span>
            <strong>{hours(selectedPrimary.hoursFs)}</strong>
            <small>PF contr + PF cli</small>
          </div>
        </div>

        <div className="field-live-block-head">
          <h4>Unidades del campo</h4>
          <span className="muted">{units.length} equipos · ordenados por fallas</span>
        </div>

        {units.length > 0 ? (
          <div className="field-live-grid">
            {units.map((u) => (
              <LiveUnitTile key={u.id} unit={u} descriptor={unitDescriptors.get(normId(u.id))} />
            ))}
          </div>
        ) : (
          <p className="field-op-empty">Sin unidades registradas para este campo.</p>
        )}

        <p className="field-op-sources muted">
          Fuentes: {selectedPrimary.sourceFile?.split("/").pop() ?? "N/D"}
          {selectedSecondary?.sourceFile ? ` · ${selectedSecondary.sourceFile.split("/").pop()}` : ""}
        </p>
      </article>
    </section>
  );
}

function StatGrid({ stats }: { stats: FieldProfile["stats"] }) {
  return (
    <div className="field-stat-grid field-stat-grid--compact">
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

const SECTION_META: Record<
  AssetCardKind,
  { label: string; Icon: LucideIcon; blurb: string }
> = {
  gas: {
    label: "Generación a gas",
    Icon: Zap,
    blurb: "Activos de generación primaria a gas",
  },
  diesel: {
    label: "Respaldo diésel",
    Icon: Droplets,
    blurb: "Capacidad de respaldo y renta diésel",
  },
  power: {
    label: "Potencia y balance",
    Icon: Activity,
    blurb: "Elevación, entrega y balance eléctrico",
  },
  infra: {
    label: "Infraestructura",
    Icon: Factory,
    blurb: "Sitio, periféricos y soporte O&M",
  },
};

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

function AssetGroupSection({ group, index }: { group: AssetGroup; index: number }) {
  const kind = group.kind ?? group.cards[0]?.kind ?? "gas";
  const meta = SECTION_META[kind];
  const SectionIcon = meta.Icon;
  const unitCount = group.cards.reduce((n, c) => n + (c.units?.length ?? c.count ?? 0), 0);
  const powerHints = group.cards.map((c) => c.power).filter(Boolean).slice(0, 3);

  return (
    <section className={`field-asset-section field-asset-section--${kind}`} aria-labelledby={`field-sec-${index}`}>
      <header className="field-asset-section-head">
        <div className={`field-asset-section-icon field-asset-section-icon--${kind}`}>
          <SectionIcon size={22} />
        </div>
        <div className="field-asset-section-copy">
          <p className="field-asset-section-kicker">
            <Layers size={12} />
            Sección {index + 1} · {meta.blurb}
          </p>
          <h3 id={`field-sec-${index}`}>{group.title}</h3>
          <p className="field-asset-section-sub">
            {group.subtitle ?? meta.blurb}
          </p>
        </div>
        <div className="field-asset-section-stats">
          <article>
            <span>Activos</span>
            <strong>{group.cards.length}</strong>
          </article>
          <article>
            <span>Unidades / ítems</span>
            <strong>{unitCount || group.cards.length}</strong>
          </article>
        </div>
      </header>

      {powerHints.length ? (
        <div className="field-asset-section-chips">
          {powerHints.map((p) => (
            <span key={String(p)} className="field-asset-section-chip">
              {p}
            </span>
          ))}
        </div>
      ) : null}

      <div className="field-card-grid field-card-grid--featured">
        {group.cards.map((card) => (
          <AssetCardView key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}

function FieldPage({
  field,
  fieldKey,
  month,
  monthLabel,
  source,
  onSourceChange,
}: {
  field: FieldProfile;
  fieldKey: FieldKey;
  month: string;
  monthLabel: string;
  source: FieldDataSource;
  onSourceChange: (source: FieldDataSource) => void;
}) {
  const contractStats = field.stats.slice(3);

  return (
    <div className={`field-view field-view--${fieldKey}`}>
      <FieldHeroBanner field={field} monthLabel={monthLabel} />

      {field.fleet ? <FleetPanel fleet={field.fleet} fieldKey={fieldKey} /> : null}

      <FieldPerformanceSection
        field={field}
        fieldKey={fieldKey}
        month={month}
        monthLabel={monthLabel}
        source={source}
        onSourceChange={onSourceChange}
      />

      {contractStats.length ? (
        <section className="field-contract-block">
          <div className="field-section-label">
            <Gauge size={15} />
            <span>Marco contractual del campo</span>
          </div>
          <StatGrid stats={contractStats} />
        </section>
      ) : null}

      <div className="field-assets-stack">
        <div className="field-section-label">
          <Layers size={15} />
          <span>Inventario de activos del campo</span>
          <span className="field-group-count">{field.groups.length} secciones</span>
        </div>
        {field.groups.map((group, index) => (
          <AssetGroupSection key={group.title} group={group} index={index} />
        ))}
      </div>
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
  const [fieldSource, setFieldSource] = useState<FieldDataSource>("auto");

  return (
    <ScreenShell report="dual" title={field.label} subtitle={`${field.description} · ${monthLabel}`} headless>
      <FieldPage
        field={field}
        fieldKey={fieldKey}
        month={month}
        monthLabel={monthLabel}
        source={fieldSource}
        onSourceChange={setFieldSource}
      />

      <p className="field-source-note">
        <Cpu size={14} />
        Vista por campo · activos contractuales · desempeño consolidado del periodo seleccionado
      </p>
    </ScreenShell>
  );
}
