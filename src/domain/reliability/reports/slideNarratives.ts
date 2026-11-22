import { buildDisponibilidadAnalisis } from "./DisponibilidadAnalisisBoard";
import { buildGteDegradationRiskPortfolio, topDegrading } from "./buildDegradationRiskPortfolio";
import { portfolioSummary } from "./degradationRiskEngine";
import { buildEnergyEfficiency, REPORT_HEATING_VALUE } from "./energyEfficiency";
import { enrichEventLog } from "../events/eventLogUtils";
import { GRAN_TIERRA_MONTHLY_DATA, type GranTierraMonthKey } from "./granTierraMonthly";
import { COPOWER_MONTHLY_DATA, type CopowerMonthKey } from "./copowerMonthly";
import { INVENTORY_MINIMUMS } from "./inventoryMinimumsData";
import { getInventoryItemsWithOverrides } from "./inventoryPlanningCritical";
import { MAINTENANCE_PLANS } from "./maintenancePlansData";
import { RCA_COSTAYACO_EVENTOS } from "../rca/data";
import { buildUnitEfficiency } from "./unitEfficiency";

/**
 * Párrafo de lectura que abre cada lámina del informe de confiabilidad.
 *
 * Las cifras se interpolan desde las mismas funciones que alimentan los KPI de
 * cada sección: si un dato cambia, el texto cambia con él y no queda una
 * versión narrada que contradiga la tabla que tiene debajo.
 */
export type SlideNarrativeKey =
  | "sistemicos"
  | "horasEventos"
  | "disponibilidad"
  | "desgloseHoras"
  | "confiabilidad"
  | "maquinas"
  | "fallas"
  | "repetitivos"
  | "mantenimiento"
  | "inventario"
  | "degradacion"
  | "eficiencia"
  | "conclusiones"
  | "facturacion";

const MONTH_ISO: Record<string, string> = {
  Ene: "01",
  Feb: "02",
  Mar: "03",
  Abr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Ago: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dic: "12",
};

function n0(v: number | null | undefined) {
  return v == null ? "N/D" : v.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function n1(v: number | null | undefined) {
  return v == null
    ? "N/D"
    : v.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function pct2(ratio: number | null | undefined) {
  return ratio == null
    ? "N/D"
    : `${(ratio * 100).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
}

function pct1(value: number | null | undefined) {
  return value == null
    ? "N/D"
    : `${value.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

export function buildSlideNarratives(
  month: string,
  monthLabel: string,
): Record<SlideNarrativeKey, string> {
  const cpw = COPOWER_MONTHLY_DATA[month as CopowerMonthKey];
  const gte = GRAN_TIERRA_MONTHLY_DATA[month as GranTierraMonthKey];
  const disp = buildDisponibilidadAnalisis(month);
  const periodo = monthLabel.toLowerCase();
  const mto = MAINTENANCE_PLANS.monthlySummary.find((m) => m.monthKey === month) ?? null;

  if (!gte) {
    const pendingMto = mto
      ? `La sábana cierra ${mto.executedCount} de ${mto.programmedCount} intervenciones programadas ` +
        `(${n0(mto.executedHoursMto)} h MTO de ${n0(mto.plannedHoursMto)} planificadas)` +
        (mto.pendingCount ? `, con ${mto.pendingCount} pendientes` : "") +
        "."
      : "Aún no hay sábana de mantenimiento para el periodo.";
    const invItems = getInventoryItemsWithOverrides();
    const invStock = invItems.reduce((sum, i) => sum + i.onHand, 0);
    const invReview = invItems.filter((i) => i.review).length;
    const invAgotado = invItems.filter((i) => i.status === "AGOTADO" || i.onHand <= 0).length;
    const invMoves = INVENTORY_MINIMUMS.movements ?? [];
    const invMovesIn = invMoves.filter((m) => m.kind === "entrada").length;
    const invMovesOut = invMoves.filter((m) => m.kind === "salida").length;
    const pending = {
      sistemicos:
        (cpw
          ? `El informe de ${periodo} se abre con el consolidado de horas concertadas del 01 al 31: ` +
            `${n1(cpw.kpi.generationMwh)} MWh, disponibilidad COPOWER ${pct2(disp.dispCpw)} ` +
            `(OP ${n0(disp.fleetCpw.op)} h + SB ${n0(disp.fleetCpw.sb)} h sobre ${n0(disp.programmed)} h ` +
            `calendario) y ${n0(cpw.summary.copowerFailures)} fallas imputables. `
          : `El informe de ${periodo} se abre con las fuentes que sí llegaron: sábana de mantenimiento y ` +
            `planeación semanal. `) +
        `Faltan Data Soporte GTE, RCA y el totalizador de gas Moqueta, así que no se ` +
        `publican los indicadores oficiales de Gran Tierra ni se copian las cifras de julio.`,
      horasEventos:
        cpw
          ? `Sobre el corte 01–31 hay ${n0(cpw.summary.hoursOperated)} h de operación, ` +
            `${n0(cpw.summary.hoursStandby)} h stand-by, ${n0(cpw.summary.hoursPreventive)} h preventivo y ` +
            `${n0(cpw.summary.hoursFailureClient)} h de paradas externas, con ${n0(cpw.summary.totalEvents)} ` +
            `registros en bitácora y ${n0(cpw.summary.copowerFailures)} fallas COPOWER. ${pendingMto}`
          : `Sin bitácora ni horas concertadas de ${periodo} no hay MTBF, MTTR ni desglose OP/SB del mes. ` +
            pendingMto,
      disponibilidad:
        disp.dispCpw != null
          ? `La disponibilidad COPOWER del 01–31 es ${pct2(disp.dispCpw)} sobre horas concertadas. ` +
            `La cifra oficial de Gran Tierra sigue pendiente del Data Soporte. ${pendingMto}`
          : `La disponibilidad oficial de ${periodo} queda pendiente del Data Soporte GTE y de la sábana de ` +
            `horas concertadas. ${pendingMto}`,
      desgloseHoras:
        cpw
          ? `El desglose 01–31 sale del consolidado concertado: OP ${n0(disp.fleetCpw.op)} h, ` +
            `SB ${n0(disp.fleetCpw.sb)} h, PP ${n0(disp.fleetCpw.pp)} h y PF cliente ` +
            `${n0(disp.fleetCpw.pf)} h.`
          : `El desglose de horas de ${periodo} requiere el Excel de horas concertadas, que todavía no está ` +
            `en el repositorio.`,
      confiabilidad:
        cpw
          ? `En el consolidado 01–31 no hay fallas imputables a COPOWER (${n0(cpw.summary.copowerFailures)} ` +
            `FO en horas concertadas, ${n1(cpw.summary.hoursFailureCopower)} h PF contratista). La ` +
            `confiabilidad contractual del corte es ${pct2(cpw.kpi.reliability)}. Siguen pendientes los ` +
            `FO-GE-033 oficiales del mes.`
          : `No hay FO-GE-033 ni bitácora de ${periodo} cargados. La confiabilidad contractual no se calcula ` +
            `hasta que existan esos registros.`,
      maquinas:
        cpw
          ? `El desempeño por máquina del 01–31 se calcula sobre horas concertadas (OP + SB) / calendario. ` +
            `El anexo GTE de indicadores por unidad sigue pendiente.`
          : `El desempeño por máquina de ${periodo} se publicará cuando llegue el anexo GTE y las horas ` +
            `concertadas. Hasta entonces el seguimiento operativo sale de la sábana de mantenimiento.`,
      fallas:
        cpw
          ? `No se digitalizaron FO-GE-033 de ${periodo}. El consolidado 01–31 registra ` +
            `${n0(cpw.summary.hoursFailureClient)} h de paradas externas (MRU / gas Moqueta / CCM) y ` +
            `${n0(cpw.summary.copowerFailures)} fallas imputables a COPOWER.`
          : `No se digitalizaron FO-GE-033 de ${periodo}. Cuando existan se incorporan a esta lámina con el ` +
            `mismo criterio de frontera de responsabilidad usado en junio y julio.`,
      repetitivos:
        cpw
          ? `La recurrencia del 01–31 se lee sobre ${n0(cpw.eventLog.length)} registros del consolidado ` +
            `concertado, concentrados en paradas externas por MRU y baja presión de gas Moqueta.`
          : `Sin bitácora de ${periodo} no hay recurrencia que consolidar. El patrón de cascadas MRU de meses ` +
            `previos se mantiene como hipótesis de seguimiento, no como conteo del mes.`,
      mantenimiento: mto
        ? `Durante ${periodo} se ejecutaron ${mto.executedCount} de ${mto.programmedCount} intervenciones ` +
          `programadas, acumulando ${n0(mto.executedHoursMto)} horas de mantenimiento frente a ` +
          `${n0(mto.plannedHoursMto)} planificadas` +
          (mto.pendingCount
            ? `. Quedan ${mto.pendingCount} intervenciones pendientes, incluidas las diferidas por no ` +
              `cumplir 350 h de operación.`
            : ".")
        : `Sin sábana de mantenimiento cargada para ${periodo}.`,
      inventario:
        `El cierre de bodega Costayaco queda registrado: ${n0(invItems.length)} ítems, ` +
        `${n0(invStock)} unidades en STOCK, ${n0(invMoves.length)} movimientos ` +
        `(${n0(invMovesIn)} entradas / ${n0(invMovesOut)} salidas) y ${n0(invReview)} referencias a revisar. ` +
        `El mínimo ya está alineado al cierre; quedan ${n0(invAgotado)} agotadas.`,
      degradacion:
        `El índice de salud APM se conserva como baseline de junio. Sin FO oficiales de ${periodo} no ` +
        `se recalcula el riesgo operativo del mes completo.`,
      eficiencia:
        `La hoja «Agosto 2026» del log de Moqueta no trae lecturas de agosto (las fechas son de abril). ` +
        `El heat rate del mes queda pendiente de un totalizador real y del Data Soporte.`,
      conclusiones:
        (cpw
          ? `El corte 01–31 cierra con ${n1(cpw.kpi.generationMwh)} MWh y disponibilidad COPOWER ` +
            `${pct2(disp.dispCpw)}, sin fallas imputables. `
          : "") +
        `El mantenimiento cierra ${pendingMto} Las acciones inmediatas son completar las intervenciones ` +
        `pendientes, incorporar Data Soporte GTE, y no usar julio como proxy de los ` +
        `indicadores oficiales.`,
      facturacion:
        `El formato «Nuevo Fac» ya está digitalizado para ${periodo}: encabezado OPEX/CAPEX, bloques ` +
        `diarios OP/SB/PE/M/FS/TR, dashboard, novedades y tarifas. El ejemplo lleno es Ecuador (julio, ` +
        `CW7581). Putumayo Norte usará Costayaco y Vonú en los mismos bloques; el consolidado 01–31 ya ` +
        `alimenta horas, y el recuadro de valor oficial espera Data Soporte.`,
    };
    return pending;
  }

  const dispCpw = pct2(disp.dispCpw);
  const dispGte = pct2(disp.dispOficial);
  const conf = pct2(gte?.kpi.reliability);
  const calendario = n0(disp.programmed);
  const disponibles = n0(disp.cpwAvailable);
  const opHoras = n0(disp.fleetCpw.op);
  const sbHoras = n0(disp.fleetCpw.sb);
  const sinDesglose = n1(disp.gteImpliedUnavailable);
  const generacionMwh = n1(gte?.kpi.generationMwh);

  const foCount = RCA_COSTAYACO_EVENTOS.filter((e) =>
    (e.fecha ?? "").startsWith(MONTH_ISO[month] ? `2026-${MONTH_ISO[month]}` : "\u0000"),
  ).length;

  const rawEvents = gte?.eventLog.length ?? 0;
  const consolidated = gte ? enrichEventLog(gte.eventLog, "gran_tierra") : [];
  // Mismo conteo que la lámina 8 para que el texto no nombre otro foco que la tabla.
  const eqCounts = new Map<string, number>();
  for (const e of consolidated) {
    const key = (e.equipment || "").trim() || "Sin unidad";
    eqCounts.set(key, (eqCounts.get(key) ?? 0) + 1);
  }
  const ranked = [...eqCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const topUnit = ranked[0] ?? null;
  const runnersUp = ranked.slice(1, 4).map(([, count]) => count);
  const spread = (() => {
    if (runnersUp.length === 0) return null;
    const min = Math.min(...runnersUp);
    const max = Math.max(...runnersUp);
    return min === max ? `en ${min}` : `entre ${min} y ${max}`;
  })();

  const mtoGap = mto ? mto.plannedHoursMto - mto.executedHoursMto : null;

  const inventory = getInventoryItemsWithOverrides();
  const invTotal = inventory.length;
  const invStock = inventory.reduce((sum, i) => sum + i.onHand, 0);
  const invReview = inventory.filter((i) => i.review).length;
  const invAgotado = inventory.filter((i) => i.status === "AGOTADO" || i.onHand <= 0).length;
  const invMoves = INVENTORY_MINIMUMS.movements ?? [];
  const invMovesIn = invMoves.filter((m) => m.kind === "entrada").length;
  const invMovesOut = invMoves.filter((m) => m.kind === "salida").length;

  const apm = portfolioSummary(buildGteDegradationRiskPortfolio());
  const worstAsset = topDegrading(buildGteDegradationRiskPortfolio(), 1)[0] ?? null;

  const eff = buildEnergyEfficiency(month);
  const units = buildUnitEfficiency(month);

  return {
    sistemicos:
      `Durante ${periodo}, el parque presentó una disponibilidad COPOWER de ${dispCpw} sobre ` +
      `${calendario} horas de calendario, con ${disponibles} horas disponibles, y una generación total ` +
      `de ${generacionMwh} MWh distribuida entre Costayaco y Vonú. La confiabilidad contractual se ` +
      `mantuvo en ${conf}, dado que los ${foCount} eventos FO-GE-033 analizados no fueron imputables al ` +
      `contratista. Los focos del periodo son la brecha frente al ${dispGte} reportado por Gran Tierra, ` +
      `la recurrencia sobre determinados activos y las condiciones del sistema MRU.`,

    horasEventos:
      `Las ${calendario} horas de calendario se reparten en ${opHoras} horas de operación y ${sbHoras} de ` +
      `stand-by, más las consumidas por mantenimiento y por salidas fuera de servicio. La bitácora del ` +
      `periodo acumula ${n0(rawEvents)} registros, ninguno de ellos una falla imputable al contratista, ` +
      `por lo que el mes no tiene MTBF ni MTTR propios y las cifras históricas se conservan solo como ` +
      `línea base de comparación.`,

    disponibilidad:
      `La disponibilidad calculada con la base operacional de COPOWER alcanza ${dispCpw}, resultado de ` +
      `${opHoras} horas de operación y ${sbHoras} horas de stand-by sobre un calendario de ${calendario} ` +
      `horas. Frente al ${dispGte} reportado por Gran Tierra permanece una diferencia que requiere ` +
      `conciliación mediante el desglose horario de los eventos y de las indisponibilidades consideradas ` +
      `por cada metodología.`,

    desgloseHoras:
      `El desglose separa la operación y el stand-by de las horas consumidas por mantenimiento programado ` +
      `y por salidas fuera de servicio. Esta apertura es la que sustenta el ${dispCpw} ante Gran Tierra y ` +
      `la que se requiere del lado del cliente para explicar las ${sinDesglose} horas que su indicador ` +
      `descuenta sin detalle por evento.`,

    confiabilidad:
      `El resultado de confiabilidad del periodo fue de ${conf} para COPOWER, debido a que los eventos ` +
      `analizados no fueron atribuidos al contratista. El análisis de causa evidencia principalmente ` +
      `afectaciones asociadas a cascadas derivadas del sistema MRU y perturbaciones externas de red, por ` +
      `lo que el foco de gestión se concentra en reducir la recurrencia y fortalecer la frontera de ` +
      `responsabilidades.`,

    maquinas:
      `El comportamiento individual muestra que la disponibilidad del parque no está determinada de manera ` +
      `uniforme por todas las unidades. La tabla de Gran Tierra reproduce el anexo oficial y la de COPOWER ` +
      `recalcula cada unidad sobre horas concertadas, lo que permite separar las indisponibilidades del ` +
      `mantenimiento programado de las asociadas a eventos operacionales y concentrar el seguimiento sobre ` +
      `los activos de mayor impacto en la disponibilidad global.`,

    fallas:
      `Durante ${periodo} se analizaron los eventos con mayor incidencia sobre la disponibilidad y la ` +
      `continuidad operacional del parque. Los ${foCount} eventos FO-GE-033 presentan mecanismos de ` +
      `afectación distintos —cascadas del sistema MRU, la frontera de responsabilidad del gas MQT y una ` +
      `perturbación externa de la red de 34,5 kV— pero comparten la necesidad de distinguir con claridad ` +
      `las condiciones propias de los activos de los factores externos que desencadenaron cada ` +
      `indisponibilidad.`,

    repetitivos:
      `El análisis de recurrencia pasa de la revisión individual de cada evento a la identificación de ` +
      `patrones: ${n0(consolidated.length)} eventos consolidados a partir de ${n0(rawEvents)} registros de ` +
      `bitácora. ` +
      (topUnit
        ? `${topUnit[0]} encabeza con ${topUnit[1]} eventos` +
          (spread ? ` y las unidades siguientes quedan ${spread}` : "") +
          `, de modo que la repetición está repartida y no hay un mal actor dominante. `
        : "Ninguna unidad concentra la repetición del periodo. ") +
      `El foco de gestión se mantiene sobre las condiciones del sistema MRU, que es el origen común de ` +
      `las cascadas que afectan a varias unidades a la vez.`,

    mantenimiento: mto
      ? `Durante el periodo se ejecutaron ${mto.executedCount} de ${mto.programmedCount} intervenciones ` +
        `programadas, acumulando ${n0(mto.executedHoursMto)} horas de mantenimiento frente a ` +
        `${n0(mto.plannedHoursMto)} planificadas. El resultado evidencia cumplimiento de las intervenciones ` +
        `previstas, aunque permanece una diferencia de ${n0(mtoGap)} horas entre la planificación y la ` +
        `ejecución que debe mantenerse bajo seguimiento.`
      : `Sin sábana de mantenimiento cargada para ${periodo}: no es posible contrastar las intervenciones ` +
        `ejecutadas contra el plan del periodo.`,

    inventario:
      `El inventario de bodega Costayaco cierra en ${n0(invTotal)} ítems y ${n0(invStock)} unidades en STOCK. ` +
      `El kardex registra ${n0(invMoves.length)} movimientos (${n0(invMovesIn)} entradas / ${n0(invMovesOut)} salidas) ` +
      `y ${n0(invReview)} referencias a revisar. El mínimo ya está alineado al cierre; el riesgo inmediato ` +
      `son las ${n0(invAgotado)} agotadas, que deben reponerse para no limitar el preventivo.`,

    degradacion:
      `El análisis de condición permite identificar los activos con mayor nivel de riesgo y orientar las ` +
      `acciones de mantenimiento hacia aquellos equipos que pueden comprometer la continuidad operacional. ` +
      `Con una salud promedio de ${n1(apm.avgHealth)} sobre ${apm.monitored} activos monitoreados y ` +
      `${apm.criticalRisk} en riesgo crítico` +
      `${worstAsset ? `, encabezados por ${worstAsset.assetId} con índice de salud ${worstAsset.healthIndex}` : ""}` +
      `, el seguimiento del sistema MRU y de los activos priorizados permite anticipar condiciones que ` +
      `podrían traducirse en nuevos eventos.`,

    eficiencia:
      `El desempeño energético se evalúa mediante el heat rate y la eficiencia de las unidades, relacionando ` +
      `el consumo específico de gas con la generación obtenida. El periodo cierra en ` +
      `${n0(eff?.heatRateBtuKwh)} BTU/kWh y una eficiencia de planta de ` +
      `${pct1(units?.totals.efficiencyHhvPct)} calculada sobre el poder calorífico contractual de ` +
      `${n0(REPORT_HEATING_VALUE.hhvBtuScf)} BTU/scf HHV. El indicador permite establecer la calidad del ` +
      `desempeño energético del parque y detectar desviaciones que representen oportunidades de ` +
      `optimización operacional.`,

    conclusiones:
      `Los resultados de ${periodo} muestran un parque con ${conf} de confiabilidad contractual y una ` +
      `disponibilidad COPOWER de ${dispCpw}, pero con una diferencia significativa frente al ${dispGte} ` +
      `reportado por Gran Tierra que aún requiere conciliación. Los eventos analizados concentran su origen ` +
      `principalmente en condiciones externas, cascadas del sistema MRU y eventos de red, mientras que el ` +
      `mantenimiento mantiene un alto nivel de cumplimiento. Las acciones del siguiente periodo se ` +
      `concentran en cuatro frentes: conciliar la diferencia de disponibilidad con Gran Tierra, cerrar los ` +
      `RCA asociados a las cascadas MRU y al FO-60, intervenir los activos con menor condición de salud y ` +
      `asegurar la disponibilidad de los repuestos críticos.`,

    facturacion:
      `El soporte de facturación sigue la hoja «Nuevo Fac» del ejemplo Ecuador (contrato CW7581): un bloque ` +
      `por equipo con los días 1–31 en columnas y las filas OP, SB, PE, M, FS y TR, más el dashboard de ` +
      `indicadores, el consolidado de novedades y las tablas OPEX/CAPEX por campo. El formato viejo ponía ` +
      `los días en filas; el nuevo rota esa matriz. Para Putumayo Norte el mismo esqueleto se rellena con ` +
      `Costayaco y Vonú (CPW, Jinan y Cummins). El ejemplo de julio Ecuador ilustra cómo se ve lleno; ` +
      `${periodo} no trae aún concertación ni Data Soporte, así que no se inventan valores de factura.`,
  };
}

export function slideNarrative(
  month: string,
  monthLabel: string,
  key: SlideNarrativeKey,
): string {
  return buildSlideNarratives(month, monthLabel)[key];
}
