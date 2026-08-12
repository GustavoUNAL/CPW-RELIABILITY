import type { ReactNode } from "react";

/** Lecturas ejecutivas del informe de confiabilidad (julio 2026). */
export const INFORME_EXEC_INSIGHTS = {
  resumen:
    "Durante julio, el parque presentó una disponibilidad COPOWER de **97,73 %** sobre **11.161** horas de calendario, con **10.908** horas disponibles. La confiabilidad contractual se mantuvo en **100 %**, dado que los cinco eventos FO-GE-033 analizados no fueron imputables al contratista. Los principales focos identificados corresponden a la brecha de disponibilidad frente al indicador reportado por GTE, la recurrencia asociada a determinados activos y las condiciones del sistema MRU.",
  disponibilidad:
    "La disponibilidad calculada con la base operacional de COPOWER alcanza **97,73 %**, resultado de **7.232** horas de operación y **3.676** horas de stand-by sobre un calendario de **11.161** horas. Frente al **80,65 %** reportado por GTE permanece una diferencia que requiere conciliación mediante el desglose horario de los eventos y de las indisponibilidades consideradas por cada metodología.",
  maquinasGte:
    "El comportamiento individual muestra que la disponibilidad del parque no está determinada de manera uniforme por todas las unidades. La identificación de los activos con menor desempeño permite concentrar el seguimiento sobre aquellos equipos que generan mayor impacto sobre la disponibilidad global y establecer prioridades de intervención.",
  maquinasCopower:
    "Desde la trazabilidad operacional de COPOWER, las unidades presentan diferentes niveles de disponibilidad según sus horas de operación, stand-by y mantenimiento. Este detalle permite separar las indisponibilidades asociadas al mantenimiento programado de aquellas relacionadas con eventos operacionales y establecer con mayor precisión el desempeño de cada activo.",
  generacion:
    "Durante julio se registró una generación total de **4.131,9 MWh**, distribuida entre Costayaco y Vonú. Este resultado constituye la expresión energética del comportamiento operacional del parque y permite relacionar la generación obtenida con las horas efectivamente disponibles y operativas de las unidades.",
  confiabilidad:
    "El resultado de confiabilidad del periodo fue de **100 % para COPOWER**, debido a que los eventos analizados no fueron atribuidos al contratista. El análisis de causa evidencia principalmente afectaciones asociadas a cascadas derivadas del sistema MRU y perturbaciones externas de red, por lo que el foco de gestión se concentra en reducir la recurrencia y fortalecer la frontera de responsabilidades.",
  fallas:
    "Durante julio se analizaron los eventos que tuvieron mayor incidencia sobre la disponibilidad y continuidad operacional del parque. Los cinco eventos FO-GE-033 presentan diferentes mecanismos de afectación, pero tienen como elemento común la necesidad de distinguir claramente entre las condiciones propias de los activos y los factores externos que desencadenaron las indisponibilidades.",
  fo58:
    "El FO-58 evidencia el efecto de una condición asociada al sistema MRU sobre la operación de las unidades, generando una afectación tipo cascada. El evento resulta relevante porque demuestra cómo una condición en un sistema común puede amplificar su impacto sobre varios activos del parque.",
  fo60:
    "El FO-60 presenta una condición asociada al gas MQT que produjo la salida de la unidad y su posterior permanencia en stand-by. Por su naturaleza, este evento requiere especial atención en la definición de la frontera de responsabilidad y en el cierre del RCA correspondiente.",
  fo61:
    "El FO-61 corresponde nuevamente a una afectación asociada al sistema MRU, evidenciando recurrencia de este sistema como fuente de eventos con impacto sobre la operación. Su análisis resulta relevante para priorizar acciones sobre los activos y componentes con menor condición de salud.",
  fo62:
    "El FO-62 se diferencia de los eventos anteriores al estar asociado a una perturbación externa de la red de 34,5 kV. La afectación evidencia el impacto que pueden tener condiciones externas sobre la continuidad operacional del parque, aun cuando los equipos se encuentren en condiciones normales de operación.",
  fo63:
    "El FO-63 constituye otro evento relacionado con el sistema MRU y refuerza la necesidad de intervenir las condiciones recurrentes identificadas. La repetición de eventos sobre este sistema lo convierte en uno de los principales focos técnicos del periodo.",
  repetitivos:
    "El análisis de recurrencia permite pasar de la revisión individual de cada evento a la identificación de patrones. Los resultados concentran la atención en determinados activos y sistemas, destacándose CPW02 y las condiciones asociadas al MRU como focos prioritarios para reducir la repetición de eventos.",
  mantenimiento:
    "Durante el periodo se ejecutaron **19 de 19 intervenciones programadas**, acumulando **372 horas** de mantenimiento frente a **382 horas** planificadas. El resultado evidencia cumplimiento de las intervenciones previstas, aunque permanece una diferencia de 10 horas entre la planificación y la ejecución que debe mantenerse bajo seguimiento.",
  inventario:
    "El inventario comprende **221 ítems catalogados**, de los cuales 4 se encuentran sin existencia y 3 por debajo del mínimo establecido. Estos siete elementos representan el riesgo inmediato de suministro y deben priorizarse para evitar que una indisponibilidad de repuestos se convierta en una limitación para las actividades de mantenimiento.",
  degradacion:
    "El análisis de condición permite identificar los activos con mayor nivel de riesgo y orientar las acciones de mantenimiento hacia aquellos equipos que pueden comprometer la continuidad operacional. En particular, el seguimiento de la salud de los sistemas MRU y de los activos priorizados permite anticipar condiciones que podrían traducirse en nuevos eventos.",
  eficiencia:
    "El desempeño energético se evalúa mediante el heat rate y la eficiencia de las unidades, relacionando el consumo específico de gas con la generación obtenida. El indicador permite establecer la calidad del desempeño energético del parque y detectar desviaciones que puedan representar oportunidades de optimización operacional.",
  conclusiones:
    "Los resultados de julio muestran un parque con **100 % de confiabilidad contractual** y una disponibilidad COPOWER de **97,73 %**, pero con una diferencia significativa frente al **80,65 %** reportado por GTE que aún requiere conciliación. Los eventos analizados concentran su origen principalmente en condiciones externas, cascadas MRU y eventos de red, mientras que el mantenimiento mantiene un alto nivel de cumplimiento.",
  acciones:
    "Las acciones para el siguiente periodo se concentran en cuatro frentes: conciliar la diferencia de disponibilidad con GTE, cerrar los RCA asociados a las cascadas MRU y al evento FO-60, intervenir los activos con menor condición de salud y asegurar la disponibilidad de los repuestos críticos. El objetivo es transformar los hallazgos de julio en acciones concretas de reducción de riesgo y mejora de continuidad operacional.",
} as const;

export type InformeExecInsightKey = keyof typeof INFORME_EXEC_INSIGHTS;

const FO_INSIGHT_BY_ID: Record<string, InformeExecInsightKey> = {
  "EVT-2026-07-12-MRU": "fo58",
  "EVT-2026-07-21-CPW04": "fo60",
  "EVT-2026-07-21-MRU": "fo61",
  "EVT-2026-07-24-MRU": "fo62",
  "EVT-2026-07-25-MRU": "fo63",
};

/** Resuelve la lectura FO a partir del id del evento o de la etiqueta FO-xx. */
export function foInsightKey(eventIdOrLabel: string): InformeExecInsightKey | null {
  if (FO_INSIGHT_BY_ID[eventIdOrLabel]) return FO_INSIGHT_BY_ID[eventIdOrLabel];
  const m = /FO[- ]?(?:GE-033\s*No\.\s*)?(\d+)/i.exec(eventIdOrLabel);
  if (!m) return null;
  const map: Record<string, InformeExecInsightKey> = {
    "58": "fo58",
    "60": "fo60",
    "61": "fo61",
    "62": "fo62",
    "63": "fo63",
  };
  return map[m[1]] ?? null;
}

function renderInsightCopy(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

/** Párrafo interpretativo al inicio de cada slide del informe. */
export function ExecInsight({
  text,
  children,
  className = "",
}: {
  text?: string | null;
  children?: ReactNode;
  className?: string;
}) {
  const body = text?.trim() || children;
  if (!body) return null;
  return (
    <aside className={`inf-exec-insight ${className}`.trim()}>
      <p className="inf-exec-insight-label">Lectura del periodo</p>
      {typeof body === "string" ? (
        <p className="inf-exec-insight-copy">{renderInsightCopy(body)}</p>
      ) : (
        body
      )}
    </aside>
  );
}
