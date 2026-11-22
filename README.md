# Dashboard de Confiabilidad (NPM)

Aplicacion web moderna en React + Vite + TypeScript para seguimiento integral de confiabilidad en parques de generacion.

## Funcionalidades

- Indicadores del periodo: disponibilidad, confiabilidad, mantenibilidad, generacion, perdidas y cumplimiento contractual.
- Comparacion historica por mes con graficos interactivos.
- Analisis de desviaciones contra meta con explicacion tecnica.
- Fallas y malos actores con criticidad, frecuencia, causa y afectacion en MWh.
- Estado de causas raiz (RCA) y comparativo de cumplimiento de metas.
- Plan de mantenimiento editable en pantalla.
- Riesgos y tendencias con alertas visuales.
- Plan de accion editable con responsable, fecha compromiso, estado, evidencia y resultado esperado.
- Contexto dual de reportes: `Gran Tierra Energy` y `CoPower Interno`.

## Estructura del proyecto

```text
src/
  App.tsx
  main.tsx
  styles.css
  domain/
    reliability/
      types.ts
      reports/
        granTierra.ts
        copowerInterno.ts
        index.ts
```

- `types.ts`: contratos de datos comunes (KPIs, malos actores, RCA, mantenimiento, acciones).
- `reports/granTierra.ts`: dataset y metas del reporte de Gran Tierra Energy.
- `reports/copowerInterno.ts`: dataset y metas del reporte interno de CoPower.
- `reports/index.ts`: punto unico de carga de datasets por reporte.

## Ejecutar

```bash
npm install
npm run dev
```

## Compilar para produccion

```bash
npm run build
npm run preview
```
# CPW-RELIABILITY
