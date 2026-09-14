# Acordionero

Carpeta de trabajo del campo **Acordionero**. Se analiza **aparte** de Putumayo Norte (Costayaco / Vonú).

En datos y ETL el código de campo es `ACORDIONERO` (`FieldKey = "acordionero"`).

## Qué va en cada subcarpeta

| Carpeta | Contenido |
|---------|-----------|
| `GTE/` | Data Soporte / anexos Gran Tierra del campo (Excel, PDF) |
| `concertacion/` | Horas concertadas / consolidado COPOWER del campo |
| `mantenimiento/` | Sábana y planeación semanal de MTO |
| `fallas/` | FO-GE-033, RCA, zips de reporte de falla |
| `inventarios/` | Cierres de bodega / mínimos del sitio |
| `informes/` | PDFs o decks generados del campo |
| `extract/` | Extracciones intermedias (xls → csv/json) para ETL |

## Convención de nombres

- Prefiere mes en el nombre: `… Agosto 2026.xlsx`, `… Sep 2026.pdf`
- No mezclar aquí archivos de Costayaco / Vonú / PUTN
- Tras cargar fuentes, el snapshot debe etiquetar unidades con `campo: "ACORDIONERO"`

## Flujo sugerido

1. Dejar los archivos crudos en la subcarpeta que corresponda.
2. Extraer a `extract/` si hace falta.
3. ETL → snapshot mensual (mismo patrón que PUTN, filtrado por este campo).
4. Revisar en la app: **Campos → Acordionero**.

## Estado

Estructura lista. Sin Data Soporte ni horas cargadas aún: la UI del campo muestra perfil pendiente hasta que entren datos.
