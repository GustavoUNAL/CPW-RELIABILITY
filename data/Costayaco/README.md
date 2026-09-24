# Costayaco (Putumayo Norte / Vonú)

Carpeta de trabajo del campo **Costayaco**. Separada de **Acordionero**.

En datos y ETL el código de campo es `COSTAYACO` / PUTN (`FieldKey = "costayaco"` | `"vonu"`).

## Qué va en cada subcarpeta

| Carpeta | Contenido |
|---------|-----------|
| `Agosto/`, `Julio/`, `Septiembre/`, … | Fuentes del mes: horas, informes, fallas, GTE del mes |
| `GTE/` | Data Soporte / Análisis Indicadores PUTN por mes (Ene–…) |
| `RCA/` | RCA formales y reportes de falla históricos |
| `Datos COPOWER/` | Reporte diario Costayaco–Vonú (**solo local**, ~60 MB) |
| `concertacion horas/` | Horas concertadas transversales |
| `Mantenimiento/` | Inventarios / sábanas anuales (inventario Excel **solo local**) |
| `contratos/`, `eficiencia/` | Anexos contractuales y parámetros |

## Solo local (no GitHub)

Deja estos archivos en su sitio; Git los ignora:

| Archivo típico | Ruta sugerida |
|----------------|---------------|
| `INVENTARIO*.xlsx` | `Mantenimiento/` o carpeta del mes |
| `Reporte_Diario_Costayaco_Vonu*.xlsx` | `Datos COPOWER/` y/o `Julio/` (copia de trabajo) |

El resto (FO, alarmas, Data Soporte GTE, informes) sí se versiona.

## Convención

- No mezclar aquí archivos de Acordionero / ACRD / Pad 4
- Preferir mes en el nombre del archivo
- Tras mover fuentes, actualizar `sourceFile` en snapshots si cambia la ruta

## Relación con la app

Rutas de código y ETL: `data/Costayaco/...` (antes vivían en la raíz de `data/`).
