-- Esquema Operación (Postgres) — listo para Prisma / ETL SQL.
-- La app Vite actual consume el JSON generado por scripts/etl-operacion.mjs.

CREATE TABLE IF NOT EXISTS equipo (
  id            TEXT PRIMARY KEY,
  sheet_name    TEXT NOT NULL,
  label         TEXT NOT NULL,
  planta        TEXT NOT NULL CHECK (planta IN ('Costayaco','Vonu','Conejo')),
  combustible   TEXT NOT NULL CHECK (combustible IN ('gas','diesel')),
  kw_nominal    NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS resumen_diario (
  fecha               DATE NOT NULL,
  equipo_id           TEXT NOT NULL REFERENCES equipo(id),
  op                  NUMERIC NOT NULL DEFAULT 0,
  sb                  NUMERIC NOT NULL DEFAULT 0,
  pe                  NUMERIC NOT NULL DEFAULT 0,
  mto                 NUMERIC NOT NULL DEFAULT 0,
  fs                  NUMERIC NOT NULL DEFAULT 0,
  tr                  NUMERIC NOT NULL DEFAULT 0,
  kw_acumulado_dia    NUMERIC,
  consumo_gas_mscfd   NUMERIC,
  consumo_gas_ft3_kwh NUMERIC,
  kw_promedio_dia     NUMERIC,
  PRIMARY KEY (fecha, equipo_id)
);

CREATE TABLE IF NOT EXISTS registro_horario (
  fecha       DATE NOT NULL,
  hora        SMALLINT NOT NULL CHECK (hora BETWEEN 0 AND 23),
  equipo_id   TEXT NOT NULL REFERENCES equipo(id),
  op NUMERIC, sb NUMERIC, pe NUMERIC, mto NUMERIC, fs NUMERIC, tr NUMERIC,
  vl1 NUMERIC, vl2 NUMERIC, vl3 NUMERIC,
  il1 NUMERIC, il2 NUMERIC, il3 NUMERIC,
  hz NUMERIC, fp NUMERIC, kw NUMERIC, kvar NUMERIC, kw_acumulado NUMERIC,
  consumo_gas_m3_kwh NUMERIC, consumo_gas_ft3_kwh NUMERIC, consumo_gas_mscf_h NUMERIC,
  psi_gas NUMERIC, eff_pct NUMERIC, horometro NUMERIC,
  adicion_aceite NUMERIC, cambio_aceite NUMERIC, adicion_coolant NUMERIC,
  PRIMARY KEY (fecha, hora, equipo_id)
);

CREATE TABLE IF NOT EXISTS evento_operacion (
  id               TEXT PRIMARY KEY,
  fecha            DATE NOT NULL,
  hora             TEXT,
  turno            TEXT NOT NULL CHECK (turno IN ('DIA','NOCHE')),
  descripcion      TEXT NOT NULL,
  tiempo_fuera_min NUMERIC,
  equipo_id        TEXT REFERENCES equipo(id)
);

CREATE TABLE IF NOT EXISTS actividad_operacion (
  id              TEXT PRIMARY KEY,
  fecha           DATE NOT NULL,
  turno           TEXT NOT NULL CHECK (turno IN ('DIA','NOCHE')),
  hora            TEXT,
  tecnico         TEXT,
  descripcion     TEXT NOT NULL,
  personal_campo  TEXT,
  cargo           TEXT
);

CREATE TABLE IF NOT EXISTS consumo_mensual (
  mes              TEXT NOT NULL,
  locacion         TEXT NOT NULL,
  equipo_id        TEXT NOT NULL,
  adicion_aceite   NUMERIC NOT NULL DEFAULT 0,
  cambio_aceite    NUMERIC NOT NULL DEFAULT 0,
  adicion_coolant  NUMERIC NOT NULL DEFAULT 0,
  PRIMARY KEY (mes, equipo_id, locacion)
);

CREATE TABLE IF NOT EXISTS registro_conejo (
  fecha DATE NOT NULL,
  hora TEXT,
  equipo_id TEXT NOT NULL,
  horometro NUMERIC,
  carga_kw NUMERIC,
  kwh24 NUMERIC,
  estado TEXT,
  consumo_teorico NUMERIC,
  horas_op NUMERIC, horas_sb NUMERIC, horas_pe NUMERIC,
  horas_mto NUMERIC, horas_fs NUMERIC, horas_tr NUMERIC,
  presion NUMERIC,
  gas_mscfd NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_resumen_fecha ON resumen_diario (fecha);
CREATE INDEX IF NOT EXISTS idx_evento_fecha ON evento_operacion (fecha);
CREATE INDEX IF NOT EXISTS idx_horario_equipo ON registro_horario (equipo_id, fecha);

-- ─── Extensión plataforma (diseño · la app Vite aún consume TS/JSON) ───

CREATE TABLE IF NOT EXISTS snapshot_mensual (
  fuente          TEXT NOT NULL CHECK (fuente IN ('copower','gran_tierra')),
  mes_key         TEXT NOT NULL,
  anio            SMALLINT NOT NULL,
  disponibilidad  NUMERIC,
  confiabilidad   NUMERIC,
  energia_kwh     NUMERIC,
  fallas          INTEGER,
  payload_json    JSONB NOT NULL,
  PRIMARY KEY (fuente, mes_key)
);

CREATE TABLE IF NOT EXISTS rca_evento (
  id              TEXT PRIMARY KEY,
  fecha           DATE,
  equipo          TEXT,
  titulo          TEXT NOT NULL,
  estado          TEXT,
  criticidad      TEXT,
  calidad_dato    TEXT,
  es_plantilla    BOOLEAN NOT NULL DEFAULT FALSE,
  payload_json    JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS inventario_minimo (
  id              TEXT PRIMARY KEY,
  familia         TEXT NOT NULL,
  descripcion     TEXT NOT NULL,
  stock_min       NUMERIC NOT NULL,
  existencia      NUMERIC NOT NULL,
  part_number     TEXT,
  estado          TEXT
);

CREATE TABLE IF NOT EXISTS plan_mto_ejecucion (
  id              TEXT PRIMARY KEY,
  fecha           DATE,
  equipo          TEXT NOT NULL,
  estado          TEXT NOT NULL,
  horas_mto       NUMERIC,
  horas_hombre    NUMERIC,
  notas           TEXT
);
