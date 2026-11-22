# data/

Fuentes por campo. **No mezclar sitios.**

```text
data/
  Costayaco/     # Putumayo Norte · Vonú · PUTN
  Acordionero/   # Pad 4 · ACRD · VMM
```

Ver el `README.md` de cada carpeta.

---

## Qué va a GitHub vs qué queda solo en tu máquina

| En GitHub (sí) | Solo local (no) |
|----------------|-----------------|
| Informes PDF/PPTX, Data Soporte GTE (Excel chicos), FO-GE-033, RCA | Inventarios `INVENTARIO*.xlsx` (100–400 MB) |
| Zips/logs de falla razonables (&lt; ~5 MB por evento) | Reportes diarios `Reporte_Diario*.xlsx` (~60 MB) |
| Extracciones JSON/txt en `extract/` | `node_modules/`, `dist/`, `.vscode/` |
| Snapshots / packs que consume la app (`src/.../*.json`) | Carpetas `data/analytics/`, temporales `~$*.xlsx` |

Los pesados están en `.gitignore`. **Deben existir en disco** para correr ETL; no hace falta (ni conviene) versionarlos.

### Cómo recuperar / generar lo local

```bash
# Inventario → mínimos en la app
npm run etl:inventario

# Operación / reportes diarios (requiere el Excel local en Datos COPOWER o mes/)
npm run etl:operacion   # u otros etl:* según package.json
```

Coloca los Excel grandes en las rutas documentadas en `Costayaco/README.md` (no los renombres fuera de `data/`).

---

## Convención

1. Fuentes crudas → carpeta del **campo** y del **mes**.
2. ETL → JSON/TS que usa la UI (eso sí se commitea).
3. Tras mover rutas, actualizar `sourceFile` en snapshots si aplica.
