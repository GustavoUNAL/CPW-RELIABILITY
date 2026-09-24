# CPW-RELIABILITY

Dashboard de confiabilidad (React + Vite + TypeScript) para parques de generación CoPower / Gran Tierra.

## Ejecutar

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Estructura

```text
src/                 # App y datasets derivados (sí → GitHub)
scripts/             # ETL / export (sí → GitHub)
data/
  Costayaco/         # Fuentes PUTN / Vonú
  Acordionero/       # Fuentes Pad 4 / ACRD
public/
```

Detalle de carpetas por campo: `data/README.md`.

## Qué se sube a GitHub

**Sí:** código, scripts ETL, JSON/packs que alimentan la UI, informes, FO/RCA, Data Soporte GTE livianos.

**No (solo en tu máquina):** inventarios Excel grandes, reportes diarios Vonú (~60 MB+), `node_modules/`, `dist/`. Están en `.gitignore` y documentados en `data/README.md`.

Sin esos Excel locales, algunos `npm run etl:*` fallarán; la app en sí corre con los snapshots ya generados en `src/`.

## Campos

| Carpeta | Campo |
|---------|--------|
| `data/Costayaco/` | Putumayo Norte · Costayaco / Vonú · PUTN |
| `data/Acordionero/` | Acordionero Pad 4 · ACRD |

No mezclar archivos entre campos.
