import { useMemo, useState } from "react";
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
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getFieldOperational,
  type FieldOperationalData,
  type FieldUnitLive,
} from "../contracts/fieldOperational";
import {
  FIELD_PROFILES,
  fleetVariantRank,
  type AssetCard,
  type AssetCardKind,
  type AssetGroup,
  type FieldKey,
  type FieldProfile,
  type FieldSection,
  type FleetUnit,
  type FleetVariant,
} from "../contracts/fieldAssets";
import { loadOperacionPack } from "../operacion/api";
import { eficienciaCampoSnapshot } from "../operacion/eficiencia";
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
  horasOperacion: number | null;
};

type UnitDescriptor = {
  power?: string;
  characteristic?: string;
  voltage?: string;
  deliveryVoltage?: string;
  kwNominal?: number;
  combustible?: "gas" | "diesel";
  frecuenciaHz?: number;
  factorPotencia?: number;
  variant?: FleetVariant;
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
      horasOperacion: u.horasOperacion,
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
      if (existing.horasOperacion == null) existing.horasOperacion = u.horasOperacion;
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
        horasOperacion: u.horasOperacion,
      });
    }
  }

  return [...map.values()];
}

function sortUnitsByFleet(units: MergedUnit[], descriptors: Map<string, UnitDescriptor>): MergedUnit[] {
  return [...units].sort((a, b) => {
    const va = fleetVariantRank(descriptors.get(normId(a.id))?.variant ?? "diesel");
    const vb = fleetVariantRank(descriptors.get(normId(b.id))?.variant ?? "diesel");
    if (va !== vb) return va - vb;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });
}

function buildUnitDescriptors(field: FieldProfile): Map<string, UnitDescriptor> {
  const descriptors = new Map<string, UnitDescriptor>();

  for (const unit of field.fleet ?? []) {
    descriptors.set(normId(unit.id), {
      power: unit.power,
      characteristic: unit.family,
      voltage: unit.voltage,
      deliveryVoltage: unit.deliveryVoltage,
      kwNominal: unit.kwNominal,
      combustible: unit.combustible,
      frecuenciaHz: unit.frecuenciaHz,
      factorPotencia: unit.factorPotencia,
      variant: unit.variant,
    });
  }

  for (const group of field.groups) {
    for (const card of group.cards) {
      for (const unitId of card.units ?? []) {
        const key = normId(unitId);
        const existing = descriptors.get(key);
        if (existing) continue;
        descriptors.set(key, {
          power: card.power,
          characteristic: card.title,
        });
      }
    }
  }

  return descriptors;
}

function avgKwFromEnergy(energiaKwh: number | null, horas: number | null): number | null {
  if (energiaKwh == null || horas == null || horas <= 0) return null;
  return energiaKwh / horas;
}

function CapacityBar({ delivered, nominal }: { delivered: number | null; nominal: number | null }) {
  if (nominal == null || nominal <= 0) {
    return <div className="field-capacity-bar field-capacity-bar--empty" />;
  }
  const pctVal = delivered == null ? 0 : Math.max(0, Math.min(100, (delivered / nominal) * 100));
  const tone = pctVal >= 85 ? "high" : pctVal >= 50 ? "mid" : pctVal > 0 ? "low" : "empty";
  return (
    <div className="field-capacity-bar" aria-hidden>
      <div className={`field-capacity-fill field-capacity-fill--${tone}`} style={{ width: `${pctVal}%` }} />
    </div>
  );
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

function FleetUnitCard({ unit }: { unit: FleetUnit }) {
  const fuelLabel = unit.combustible === "gas" ? "Gas" : "Diésel";
  return (
    <article className={`field-fleet-unit field-fleet-unit--${unit.variant} field-fleet-unit--fuel-${unit.combustible}`}>
      <header className="field-fleet-unit-head">
        <div className="field-fleet-unit-title">
          <strong>{unit.id}</strong>
          <span className={`field-fuel-chip field-fuel-chip--${unit.combustible}`}>{fuelLabel}</span>
        </div>
        <span className="field-fleet-unit-voltage">{unit.voltage}</span>
      </header>
      <p className="field-fleet-unit-family">{unit.family}</p>
      <dl className="field-fleet-unit-specs">
        <div>
          <dt>Nominal</dt>
          <dd>{unit.power}</dd>
        </div>
        <div>
          <dt>Hz / FP</dt>
          <dd>
            {unit.frecuenciaHz} / {unit.factorPotencia.toFixed(1)}
          </dd>
        </div>
        {unit.deliveryVoltage ? (
          <div className="field-fleet-unit-specs--wide">
            <dt>Entrega sistema</dt>
            <dd>{unit.deliveryVoltage}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

function FleetFamilyBlock({
  tag,
  tagTone,
  subtitle,
  units,
  first,
}: {
  tag: string;
  tagTone: FleetVariant;
  subtitle: string;
  units: FleetUnit[];
  first?: boolean;
}) {
  if (units.length === 0) return null;
  const kw = units.reduce((s, u) => s + u.kwNominal, 0);
  return (
    <div className={`field-fleet-family field-fleet-family--${tagTone}${first ? " field-fleet-family--first" : ""}`}>
      <header>
        <div className="field-fleet-family-head">
          <span className={`field-fleet-family-tag field-fleet-family-tag--${tagTone}`}>{tag}</span>
          <span className="field-fleet-family-sub">{subtitle}</span>
        </div>
        <span className="field-fleet-family-kw">
          {units.length} und · {kw.toLocaleString("es-CO")} kW
        </span>
      </header>
      <div className={`field-fleet-grid field-fleet-grid--${tagTone}`}>
        {units.map((u) => (
          <FleetUnitCard key={u.id} unit={u} />
        ))}
      </div>
    </div>
  );
}

function FleetPanel({
  fleet,
  fieldKey,
  compact = false,
}: {
  fleet: FleetUnit[];
  fieldKey: FieldKey;
  compact?: boolean;
}) {
  const cpw = fleet.filter((u) => u.variant === "cpw");
  const jinan = fleet.filter((u) => u.variant === "jinan");
  const jenbacher = fleet.filter((u) => u.variant === "jenbacher");
  const diesel = fleet.filter((u) => u.variant === "diesel");
  const gasUnits = [...cpw, ...jinan];
  const dieselUnits = [...jenbacher, ...diesel];
  const kwInstalled = fleet.reduce((s, u) => s + u.kwNominal, 0);
  const kwGas = gasUnits.reduce((s, u) => s + u.kwNominal, 0);
  const kwDiesel = dieselUnits.reduce((s, u) => s + u.kwNominal, 0);

  return (
    <section className={`field-fleet-panel${compact ? " field-fleet-panel--compact" : ""}`}>
      <div className="field-section-label">
        <Shield size={15} />
        <span>Parque operativo · contrato</span>
        <span className="field-group-count">
          {fleet.length} unidades · {kwInstalled.toLocaleString("es-CO")} kW
        </span>
      </div>

      <div className="field-fleet-summary">
        <article className="field-fleet-summary-card field-fleet-summary-card--gas">
          <span>Generación a gas</span>
          <strong>{kwGas.toLocaleString("es-CO")} kW</strong>
          <small>{gasUnits.length} máquinas · flota principal</small>
        </article>
        <article className="field-fleet-summary-card field-fleet-summary-card--diesel">
          <span>Respaldo diésel</span>
          <strong>{kwDiesel.toLocaleString("es-CO")} kW</strong>
          <small>{dieselUnits.length} máquinas · contingencia</small>
        </article>
      </div>

      {compact ? (
        <p className="muted field-fleet-compact-note">
          Detalle por máquina en la hoja Parque · {fieldKey === "vonu" ? "Vonú" : "Costayaco"}
        </p>
      ) : (
        <>
          <div className="field-fleet-band field-fleet-band--gas">
            <p className="field-fleet-band-label">Gas · operación principal</p>
            <FleetFamilyBlock
              tag="CPW"
              tagTone="cpw"
              subtitle={`${cpw.length} × 800 kW · entrega 13,8 kV · ${fieldKey === "vonu" ? "Vonú" : "Costayaco"}`}
              units={cpw}
              first
            />
            <FleetFamilyBlock
              tag="Jinan"
              tagTone="jinan"
              subtitle={`${jinan.length} × gas · ${fieldKey === "vonu" ? "Vonú BT 0,48 kV" : "Costayaco 13,8 kV"}`}
              units={jinan}
            />
          </div>

          <div className="field-fleet-band field-fleet-band--diesel">
            <p className="field-fleet-band-label">Diésel · respaldo (bitácora operativa)</p>
            <FleetFamilyBlock
              tag="G10x"
              tagTone="jenbacher"
              subtitle={`${jenbacher.length} × 500 kW · 480 V · respaldo diésel verificado en eventos`}
              units={jenbacher}
            />
            <FleetFamilyBlock tag="Diésel" tagTone="diesel" subtitle="Otros diésel contractuales" units={diesel} />
          </div>
        </>
      )}
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

  const kwAvg = avgKwFromEnergy(unit.energiaKwh, unit.horasOperacion);
  const kwNom = descriptor?.kwNominal ?? null;
  const loadPct = kwAvg != null && kwNom != null && kwNom > 0 ? (kwAvg / kwNom) * 100 : null;

  return (
    <article className={`field-live-unit ${riskClass}${unit.fallas >= 3 ? " field-live-unit--alert" : ""}`}>
      <header className="field-live-unit-head">
        <div>
          <strong>{unit.id}</strong>
          <p className="field-live-spec">
            {descriptor?.characteristic ?? "Unidad de campo"}
            {descriptor?.variant === "jenbacher" ? " · respaldo diésel" : ""}
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

      <dl className="field-live-tech">
        <div>
          <dt>Tensión</dt>
          <dd>{descriptor?.voltage ?? "N/D"}</dd>
        </div>
        <div>
          <dt>Nominal</dt>
          <dd>{descriptor?.power ?? (kwNom != null ? `${kwNom} kW` : "N/D")}</dd>
        </div>
        <div>
          <dt>Combustible</dt>
          <dd>
            {descriptor?.combustible === "diesel"
              ? "Diésel"
              : descriptor?.combustible === "gas"
                ? "Gas"
                : "N/D"}
          </dd>
        </div>
        <div>
          <dt>Hz / FP</dt>
          <dd>
            {descriptor?.frecuenciaHz != null ? `${descriptor.frecuenciaHz}` : "—"}
            {descriptor?.factorPotencia != null ? ` / ${descriptor.factorPotencia.toFixed(1)}` : ""}
          </dd>
        </div>
        {descriptor?.deliveryVoltage ? (
          <div className="field-live-tech--wide">
            <dt>Entrega sistema</dt>
            <dd>{descriptor.deliveryVoltage}</dd>
          </div>
        ) : null}
      </dl>

      <div className="field-live-capacity">
        <div className="field-live-capacity-labels">
          <span>Capacidad entregada vs máxima</span>
          <strong>
            {kwAvg != null ? `${Math.round(kwAvg).toLocaleString("es-CO")} kW` : "N/D"}
            <span className="muted"> / {kwNom != null ? `${kwNom} kW` : "N/D"}</span>
          </strong>
        </div>
        <CapacityBar delivered={kwAvg} nominal={kwNom} />
        <small>
          {loadPct != null
            ? `Factor de carga ${loadPct.toFixed(0)}% · kW medio = energía / horas OP`
            : "Sin horas de operación para estimar kW medio"}
        </small>
      </div>

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
            {Math.round(unit.energiaKwh).toLocaleString("es-CO")} kWh
            {unit.horasOperacion != null ? ` · ${hours(unit.horasOperacion)} OP` : ""}
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

  const unitsRaw =
    source === "auto"
      ? mergeFieldUnits(gte.units, cpw.units)
      : selectedPrimary.units.length > 0
        ? mergeFieldUnits([], selectedPrimary.units)
        : mergeFieldUnits(gte.units, cpw.units);
  const units = sortUnitsByFleet(unitsRaw, unitDescriptors);

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
          <span className="muted">{units.length} equipos · gas primero · luego diésel</span>
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

function FieldResumenFacts({
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
  const ops = useMemo(() => {
    const cpw = getFieldOperational("copower", month, fieldKey);
    const gte = getFieldOperational("gran_tierra", month, fieldKey);
    return cpw.available ? cpw : gte;
  }, [fieldKey, month]);

  const fleet = field.fleet ?? [];
  const gasFleet = fleet.filter((u) => u.combustible === "gas");
  const dieselFleet = fleet.filter((u) => u.combustible === "diesel");
  const kwGas = gasFleet.reduce((s, u) => s + u.kwNominal, 0);
  const kwDiesel = dieselFleet.reduce((s, u) => s + u.kwNominal, 0);
  const kwTotal = kwGas + kwDiesel;

  const voltagesGen = [...new Set(fleet.map((u) => u.voltage).filter(Boolean))];
  const voltagesDel = [...new Set(fleet.map((u) => u.deliveryVoltage).filter(Boolean))];
  const hz = fleet[0]?.frecuenciaHz ?? 60;
  const fp = fleet[0]?.factorPotencia ?? 0.9;

  const ranked = useMemo(() => {
    return [...ops.units]
      .map((u) => {
        const desc = fleet.find((f) => normId(f.id) === normId(u.id));
        const avgKw =
          u.energiaKwh != null && u.horasOperacion != null && u.horasOperacion > 0
            ? u.energiaKwh / u.horasOperacion
            : null;
        const load =
          avgKw != null && desc?.kwNominal
            ? (avgKw / desc.kwNominal) * 100
            : null;
        return {
          id: u.id,
          energiaKwh: u.energiaKwh ?? 0,
          horas: u.horasOperacion ?? 0,
          avgKw,
          load,
          nominal: desc?.kwNominal ?? null,
          voltage: desc?.voltage ?? null,
          fuel: desc?.combustible ?? null,
          family: desc?.family ?? null,
        };
      })
      .filter((u) => u.energiaKwh > 0)
      .sort((a, b) => b.energiaKwh - a.energiaKwh);
  }, [ops.units, fleet]);

  const top = ranked[0] ?? null;
  const totalGenKwh = ranked.reduce((s, u) => s + u.energiaKwh, 0);
  const chartData = ranked.slice(0, 12).map((u) => ({
    id: u.id,
    mwh: Number((u.energiaKwh / 1000).toFixed(1)),
    fuel: u.fuel ?? "gas",
  }));

  const transformers = field.stats.find((s) => /transformador/i.test(s.label));
  const blockMw = field.stats.find((s) => /potencia bloque|potencia instalada/i.test(s.label));
  const gasShare = kwTotal > 0 ? Math.round((kwGas / kwTotal) * 100) : 0;

  const effCampo = useMemo(() => {
    const pack = loadOperacionPack();
    return eficienciaCampoSnapshot(pack.resumenDiario, month);
  }, [month]);
  const plantaLabel = fieldKey === "vonu" ? "Vonu" : "Costayaco";
  const effPlanta = effCampo.porCampo.find((c) => c.label === plantaLabel);
  const effPct =
    effPlanta?.eficienciaPct ?? effCampo.general.eficienciaPct ?? null;
  const effHr =
    effPlanta?.heatRateFt3Kwh ?? effCampo.general.heatRateFt3Kwh ?? null;

  const indicators = [
    {
      label: "Tensión gen.",
      value: voltagesGen.join(" / ") || "N/D",
      hint: `${hz} Hz · FP ${fp.toFixed(1)}`,
    },
    {
      label: "Tensión entrega",
      value: voltagesDel.join(" / ") || "N/D",
      hint: field.hero?.role ?? "Entrega",
    },
    {
      label: "Máquinas",
      value: String(fleet.length),
      hint: `${gasFleet.length} gas · ${dieselFleet.length} diésel`,
    },
    {
      label: "Potencia",
      value: `${kwTotal.toLocaleString("es-CO")} kW`,
      hint: blockMw ? `Bloque ${blockMw.value}` : `${gasShare}% gas`,
    },
    {
      label: "Eficiencia",
      value: effPct == null ? "N/D" : `${effPct.toFixed(1)}%`,
      hint:
        effHr != null
          ? `HR ${effHr.toFixed(2)} ft³/kWh · ${effCampo.yearMonth}`
          : `Gas/energía emparejados · ${effCampo.yearMonth}`,
    },
    {
      label: "Mayor generador",
      value: top?.id ?? "N/D",
      hint: top
        ? `${(top.energiaKwh / 1000).toFixed(1)} MWh · ${top.load?.toFixed(0) ?? "—"}% carga`
        : "Sin energía",
    },
    {
      label: "Generación mes",
      value: totalGenKwh > 0 ? `${(totalGenKwh / 1000).toFixed(1)} MWh` : "N/D",
      hint: transformers
        ? `${transformers.value} trf.`
        : fieldKey === "vonu"
          ? "BT directa"
          : ops.reportLabel,
    },
  ];

  return (
    <section className="field-tech-brief">
      <div className="field-section-label field-tech-brief-label">
        <Cpu size={15} />
        <span>Resumen técnico · {field.label}</span>
        <span className="field-group-count">{monthLabel}</span>
      </div>

      <div className="field-tech-indicators">
        {indicators.map((item) => (
          <article key={item.label} className="field-tech-indicator">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.hint}</small>
          </article>
        ))}
      </div>

      <section className="field-tech-panel field-tech-panel--chart field-tech-panel--primary">
        <header className="field-tech-chart-head">
          <div>
            <h4>Generación por máquina</h4>
            <p className="muted">MWh · {monthLabel} · gas vs diésel</p>
          </div>
          <div className="field-tech-chart-legend">
            <span>
              <i style={{ background: "#2bb3a3" }} /> Gas
            </span>
            <span>
              <i style={{ background: "#d4a017" }} /> Diésel
            </span>
            {top ? (
              <span className="field-tech-chart-legend-top">
                Líder <strong>{top.id}</strong> · {(top.energiaKwh / 1000).toFixed(1)} MWh
              </span>
            ) : null}
          </div>
        </header>
        <div className="dash-chart field-tech-chart-main">
          {chartData.length === 0 ? (
            <p className="empty-state">Sin datos de energía por unidad en el periodo.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="id" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={44} />
                <YAxis tick={{ fontSize: 11 }} width={38} />
                <Tooltip
                  formatter={(v) => [`${Number(v).toLocaleString("es-CO")} MWh`, "Energía"]}
                  labelFormatter={(id) => `Máquina ${id}`}
                />
                <Bar dataKey="mwh" name="MWh" radius={[4, 4, 0, 0]}>
                  {chartData.map((row) => (
                    <Cell key={row.id} fill={row.fuel === "diesel" ? "#d4a017" : "#2bb3a3"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </section>
  );
}

function FieldPage({
  field,
  fieldKey,
  section,
  month,
  monthLabel,
  source,
  onSourceChange,
}: {
  field: FieldProfile;
  fieldKey: FieldKey;
  section: FieldSection;
  month: string;
  monthLabel: string;
  source: FieldDataSource;
  onSourceChange: (source: FieldDataSource) => void;
}) {
  const showHero = section === "contrato";
  const showParque = section === "parque";
  const showDesempeno = section === "desempeno";
  const showContrato = section === "contrato";
  const showActivos = section === "activos";

  const sectionTitle =
    section === "parque"
      ? "Parque operativo"
      : section === "desempeno"
        ? "Desempeño del periodo"
        : section === "contrato"
          ? "Marco contractual"
          : section === "activos"
            ? "Inventario de activos"
            : "Resumen del campo";

  return (
    <div className={`field-view field-view--${fieldKey} field-view--section-${section}`}>
      {section !== "resumen" ? (
        <p className="field-section-eyebrow">
          {field.label} · {sectionTitle}
        </p>
      ) : null}

      {showHero ? <FieldHeroBanner field={field} monthLabel={monthLabel} /> : null}

      {showParque && field.fleet ? (
        <FleetPanel fleet={field.fleet} fieldKey={fieldKey} compact={section === "resumen"} />
      ) : null}

      {showDesempeno ? (
        <FieldPerformanceSection
          field={field}
          fieldKey={fieldKey}
          month={month}
          monthLabel={monthLabel}
          source={source}
          onSourceChange={onSourceChange}
        />
      ) : null}

      {showContrato ? (
        <section className="field-contract-block">
          <div className="field-section-label">
            <Gauge size={15} />
            <span>Marco contractual del campo</span>
          </div>
          <StatGrid stats={field.stats} />
        </section>
      ) : null}

      {section === "resumen" ? (
        <FieldResumenFacts field={field} fieldKey={fieldKey} month={month} monthLabel={monthLabel} />
      ) : null}

      {showActivos ? (
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
      ) : null}
    </div>
  );
}

function pickFieldOps(fieldKey: FieldKey, month: string) {
  const cpw = getFieldOperational("copower", month, fieldKey);
  const gte = getFieldOperational("gran_tierra", month, fieldKey);
  return cpw.available ? cpw : gte;
}

function FieldsOverview({ month, monthLabel }: { month: string; monthLabel: string }) {
  const keys: FieldKey[] = ["costayaco", "vonu"];
  const rows = keys.map((key) => {
    const profile = FIELD_PROFILES[key];
    const ops = pickFieldOps(key, month);
    const fleet = profile.fleet ?? [];
    return {
      key,
      profile,
      ops,
      units: fleet.length,
      jinan: fleet.filter((u) => u.variant === "jinan").length,
      jenbacher: fleet.filter((u) => u.variant === "jenbacher").length,
      cpw: fleet.filter((u) => u.variant === "cpw").length,
      dieselCards: profile.groups.filter((g) => g.kind === "diesel").reduce((n, g) => n + g.cards.length, 0),
      genMwh: ops.generationKwh != null ? Number((ops.generationKwh / 1000).toFixed(1)) : 0,
    };
  });

  const totalUnits = rows.reduce((s, r) => s + r.units, 0);
  const totalFallas = rows.reduce((s, r) => s + r.ops.fallas, 0);
  const totalGen = rows.reduce((s, r) => s + (r.ops.generationKwh ?? 0), 0);
  const dispVals = rows.map((r) => r.ops.disp).filter((v): v is number => v != null);
  const confVals = rows.map((r) => r.ops.conf).filter((v): v is number => v != null);
  const avgDisp = dispVals.length ? dispVals.reduce((a, b) => a + b, 0) / dispVals.length : null;
  const avgConf = confVals.length ? confVals.reduce((a, b) => a + b, 0) / confVals.length : null;

  const effCampo = useMemo(() => {
    const pack = loadOperacionPack();
    return eficienciaCampoSnapshot(pack.resumenDiario, month);
  }, [month]);
  const effCyc = effCampo.porCampo.find((c) => c.label === "Costayaco");
  const effVonu = effCampo.porCampo.find((c) => c.label === "Vonu");
  const effPctLabel =
    effCampo.general.eficienciaPct == null
      ? "N/D"
      : `${effCampo.general.eficienciaPct.toFixed(1)}%`;
  const effHint = [effCyc, effVonu]
    .filter((c): c is NonNullable<typeof c> => c != null && c.eficienciaPct != null)
    .map((c) => `${c.label === "Costayaco" ? "CYC" : "Vonú"} ${c.eficienciaPct!.toFixed(1)}%`)
    .join(" · ");

  const unitBars = rows.flatMap((r) =>
    [...r.ops.units]
      .filter((u) => (u.energiaKwh ?? 0) > 0)
      .sort((a, b) => (b.energiaKwh ?? 0) - (a.energiaKwh ?? 0))
      .slice(0, r.key === "costayaco" ? 7 : 3)
      .map((u) => ({
        id: u.id,
        mwh: Number(((u.energiaKwh ?? 0) / 1000).toFixed(1)),
        campo: r.key,
        label: r.profile.label,
      })),
  );

  return (
    <div className="field-overview">
      <header className="field-overview-hero">
        <div>
          <p className="eyebrow">Campos · Bloque Chaza</p>
          <h2>Resumen Costayaco + Vonú</h2>
          <p className="muted">
            Vista consolidada de ambos campos · {monthLabel} · activos contractuales y desempeño del periodo
          </p>
        </div>
        <span className="badge info">2 campos</span>
      </header>

      <div className="field-overview-kpis field-overview-kpis--6">
        <article>
          <span>Unidades en flota</span>
          <strong>{totalUnits}</strong>
          <small>
            Costayaco {rows[0].units} · Vonú {rows[1].units}
          </small>
        </article>
        <article>
          <span>Disponibilidad media</span>
          <strong>{pct(avgDisp)}</strong>
          <small>Meta ≥ 98%</small>
        </article>
        <article>
          <span>Confiabilidad media</span>
          <strong>{pct(avgConf)}</strong>
          <small>Promedio de ambos campos</small>
        </article>
        <article>
          <span>Eficiencia</span>
          <strong>{effPctLabel}</strong>
          <small>{effHint || `Campo · ${effCampo.yearMonth}`}</small>
        </article>
        <article>
          <span>Generación</span>
          <strong>{kwh(totalGen || null)}</strong>
          <small>Suma del periodo</small>
        </article>
        <article className={totalFallas >= 3 ? "field-overview-kpi--warn" : undefined}>
          <span>Fallas</span>
          <strong>{totalFallas}</strong>
          <small>Ambos campos</small>
        </article>
      </div>

      <section className="field-overview-mini-chart">
        <header>
          <div>
            <h4>Generación por máquina</h4>
            <p className="muted">
              MWh · CYC {rows[0].genMwh.toLocaleString("es-CO")} · Vonú {rows[1].genMwh.toLocaleString("es-CO")}
            </p>
          </div>
          <div className="field-tech-chart-legend">
            <span>
              <i style={{ background: "#2bb3a3" }} /> Costayaco
            </span>
            <span>
              <i style={{ background: "#3d7ea6" }} /> Vonú
            </span>
          </div>
        </header>
        <div className="dash-chart field-overview-mini-chart-plot">
          {unitBars.length === 0 ? (
            <p className="empty-state">Sin energía unitaria en el periodo.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitBars} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis dataKey="id" tick={{ fontSize: 10 }} interval={0} angle={-16} textAnchor="end" height={36} />
                <YAxis tick={{ fontSize: 10 }} width={32} />
                <Tooltip
                  formatter={(v) => [`${Number(v).toLocaleString("es-CO")} MWh`, "Energía"]}
                  labelFormatter={(id, payload) => {
                    const row = payload?.[0]?.payload as { label?: string } | undefined;
                    return row?.label ? `${row.label} · ${id}` : String(id);
                  }}
                />
                <Bar dataKey="mwh" name="MWh" radius={[3, 3, 0, 0]}>
                  {unitBars.map((row) => (
                    <Cell key={`${row.campo}-${row.id}`} fill={row.campo === "vonu" ? "#3d7ea6" : "#2bb3a3"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <div className="field-overview-grid">
        {rows.map((r) => (
          <article key={r.key} className={`field-overview-card field-overview-card--${r.key}`}>
            <header>
              <div>
                <span className="field-hero-role">{r.profile.hero?.role ?? "Campo"}</span>
                <h3>{r.profile.label}</h3>
                <p>
                  <MapPin size={13} />
                  {r.profile.hero?.location ?? "Bloque Chaza"}
                </p>
              </div>
              <span className="badge">{r.units} ud.</span>
            </header>

            <p className="field-overview-desc">{r.profile.description}</p>

            <div className="field-overview-stat-row">
              {r.profile.stats.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <span>{s.label}</span>
                  <strong>{s.value}</strong>
                </div>
              ))}
            </div>

            <div className="field-overview-ops">
              <div>
                <span>Disp</span>
                <strong>{pct(r.ops.disp)}</strong>
              </div>
              <div>
                <span>Conf</span>
                <strong>{pct(r.ops.conf)}</strong>
              </div>
              <div>
                <span>Fallas</span>
                <strong>{r.ops.fallas}</strong>
              </div>
              <div>
                <span>Generación</span>
                <strong>{kwh(r.ops.generationKwh)}</strong>
              </div>
            </div>

            <div className="field-overview-tags">
              {r.cpw > 0 ? <span>{r.cpw} CPW gas</span> : null}
              {r.jinan > 0 ? <span>{r.jinan} Jinan gas</span> : null}
              {r.jenbacher > 0 ? <span>{r.jenbacher} respaldo diésel</span> : null}
              {r.dieselCards > 0 ? <span>{r.dieselCards} grupos diésel</span> : null}
              <span>{r.profile.groups.length} secciones de activos</span>
            </div>

            {r.profile.hero?.orders?.length ? (
              <div className="field-overview-orders">
                {r.profile.hero.orders.map((o) => (
                  <span key={o} className="field-order-badge">
                    <FileText size={12} />
                    Orden {o}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <aside className="field-overview-note">
        <p>
          <strong>Lectura conjunta:</strong> Costayaco concentra la generación MT (13,8 kV) y el respaldo diésel;
          Vonú aporta 1,5 MW en BT (0,48 kV) dentro del mismo bloque sistémico de 8 MW. Use las hojas Costayaco / Vonú
          para el detalle de activos y unidades.
        </p>
      </aside>
    </div>
  );
}

type Props = {
  fieldKey: FieldKey;
  section?: FieldSection;
  month: string;
  monthLabel: string;
};

export function FieldAssetsView({ fieldKey, section = "resumen", month, monthLabel }: Props) {
  const field = FIELD_PROFILES[fieldKey];
  const [fieldSource, setFieldSource] = useState<FieldDataSource>("auto");
  const sectionLabel =
    section === "parque"
      ? "Parque"
      : section === "desempeno"
        ? "Desempeño"
        : section === "contrato"
          ? "Contrato"
          : section === "activos"
            ? "Activos"
            : "Resumen";

  return (
    <ScreenShell
      report="dual"
      title={`${field.label} · ${sectionLabel}`}
      subtitle={`${field.description} · ${monthLabel}`}
      headless
    >
      <FieldPage
        field={field}
        fieldKey={fieldKey}
        section={section}
        month={month}
        monthLabel={monthLabel}
        source={fieldSource}
        onSourceChange={setFieldSource}
      />

      {section !== "resumen" ? (
        <p className="field-source-note">
          <Cpu size={14} />
          {field.label} · {sectionLabel} · activos contractuales y operación del periodo
        </p>
      ) : null}
    </ScreenShell>
  );
}

export function FieldsOverviewView({ month, monthLabel }: { month: string; monthLabel: string }) {
  return (
    <ScreenShell
      report="dual"
      title="Resumen de campos"
      subtitle={`Costayaco + Vonú · ${monthLabel}`}
      headless
    >
      <FieldsOverview month={month} monthLabel={monthLabel} />
    </ScreenShell>
  );
}
