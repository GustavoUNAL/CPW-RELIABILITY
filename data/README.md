# data/

Fuentes por campo. El mismo criterio en los dos sitios.

```
data/
  inbox/          # llega sin clasificar
  archivo/        # zip original
  extract/        # csv/json regenerable
  Costayaco/      # Putumayo Norte · también Vonú
  Acordionero/    # Pad 4
```

Dentro de cada campo: `activos`, `operacion`, `concertacion`, `GTE`, `fallas`, `Mantenimiento` o `mantenimiento`, `inventarios`, `hse`, `contratos`, `facturacion`, `informes`.

Una falla vive en `fallas/AAAA-MM/AAAA-MM-DD_EQUIPO_RFxx/` con `formulario`, `logs`, `evidencias` y `analisis`. El informe publicado (pdf, html y sus fotos) se queda en `informes/AAAA-MM`.
