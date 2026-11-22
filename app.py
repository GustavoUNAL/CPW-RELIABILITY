import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st


st.set_page_config(
    page_title="Confiabilidad de Parque de Generacion",
    layout="wide",
    initial_sidebar_state="expanded",
)


def _month_label(idx: pd.Timestamp) -> str:
    return idx.strftime("%Y-%m")


def generate_demo_monthly_data() -> pd.DataFrame:
    rng = np.random.default_rng(42)
    months = pd.date_range("2025-01-01", periods=18, freq="MS")
    units = ["GT-01", "GT-02", "ST-01", "BOP"]

    rows = []
    for month in months:
        for unit in units:
            period_hours = 720
            potential_mwh = float(rng.integers(18000, 32000))
            forced_outage_h = float(rng.integers(4, 52))
            planned_outage_h = float(rng.integers(10, 80))
            failures = int(rng.integers(0, 7))
            derate_pct = float(rng.uniform(0.005, 0.07))

            gross_losses = potential_mwh * derate_pct + forced_outage_h * (potential_mwh / period_hours)
            generated_mwh = max(0.0, potential_mwh - gross_losses)

            rows.append(
                {
                    "month": month,
                    "unit": unit,
                    "period_hours": period_hours,
                    "potential_mwh": potential_mwh,
                    "generated_mwh": generated_mwh,
                    "forced_outage_h": forced_outage_h,
                    "planned_outage_h": planned_outage_h,
                    "failures": failures,
                }
            )

    return pd.DataFrame(rows)


def generate_demo_events(monthly_df: pd.DataFrame) -> pd.DataFrame:
    rng = np.random.default_rng(7)
    equipments = [
        ("Combustion System", "Operacion inestable", "Alto"),
        ("Lubrication Pump", "Baja presion aceite", "Medio"),
        ("Excitation System", "Falla de control", "Alto"),
        ("Boiler Feed Valve", "Actuador trabado", "Medio"),
        ("Cooling Tower Fan", "Vibracion elevada", "Bajo"),
        ("DCS Network", "Latencia intermitente", "Alto"),
    ]

    rows = []
    for _, row in monthly_df.iterrows():
        event_count = int(rng.integers(0, 4))
        for _ in range(event_count):
            eq, cause, crit = equipments[int(rng.integers(0, len(equipments)))]
            dur = float(rng.uniform(1.0, 18.0))
            lost_mwh = dur * (row["potential_mwh"] / row["period_hours"]) * float(rng.uniform(0.6, 1.0))
            rows.append(
                {
                    "month": row["month"],
                    "unit": row["unit"],
                    "equipment": eq,
                    "cause": cause,
                    "criticality": crit,
                    "downtime_h": dur,
                    "generation_loss_mwh": lost_mwh,
                    "rca_status": rng.choice(["Pendiente", "En curso", "Cerrado"], p=[0.35, 0.4, 0.25]),
                }
            )
    return pd.DataFrame(rows)


def calculate_kpis(monthly_df: pd.DataFrame) -> pd.DataFrame:
    grouped = (
        monthly_df.groupby("month", as_index=False)[
            [
                "period_hours",
                "potential_mwh",
                "generated_mwh",
                "forced_outage_h",
                "planned_outage_h",
                "failures",
            ]
        ]
        .sum()
        .sort_values("month")
    )

    grouped["availability"] = (
        (grouped["period_hours"] - grouped["forced_outage_h"] - grouped["planned_outage_h"]) / grouped["period_hours"]
    ).clip(lower=0)
    grouped["operational_losses_mwh"] = (grouped["potential_mwh"] - grouped["generated_mwh"]).clip(lower=0)
    grouped["generation_performance"] = (grouped["generated_mwh"] / grouped["potential_mwh"]).clip(upper=1)

    grouped["operating_hours"] = grouped["period_hours"] - grouped["forced_outage_h"]
    grouped["mtbf_h"] = np.where(grouped["failures"] > 0, grouped["operating_hours"] / grouped["failures"], grouped["operating_hours"])
    grouped["mttr_h"] = np.where(grouped["failures"] > 0, grouped["forced_outage_h"] / grouped["failures"], 0)
    grouped["reliability"] = grouped["mtbf_h"] / (grouped["mtbf_h"] + grouped["mttr_h"] + 1e-9)
    grouped["maintainability"] = 1 / (1 + (grouped["mttr_h"] / 8))

    return grouped


def pct(value: float) -> str:
    return f"{value * 100:.1f}%"


st.title("App de Analisis de Confiabilidad - Parque de Generacion")
st.caption(
    "Monitoreo integral de disponibilidad, confiabilidad, mantenibilidad, perdidas operacionales y cumplimiento contractual."
)

with st.sidebar:
    st.header("Configuracion")
    source = st.radio("Fuente de datos", ["Demo", "Cargar CSV"], index=0)

    target_availability = st.slider("Meta disponibilidad (%)", 70, 100, 92) / 100
    target_reliability = st.slider("Meta confiabilidad (%)", 70, 100, 90) / 100
    target_maintainability = st.slider("Meta mantenibilidad (%)", 40, 100, 75) / 100
    target_generation = st.slider("Meta desempeno generacion (%)", 70, 100, 95) / 100
    contractual_target = st.slider("Meta contractual energia (%)", 70, 100, 96) / 100

    if source == "Cargar CSV":
        st.markdown("CSV mensual obligatorio con columnas:")
        st.code(
            "month,unit,period_hours,potential_mwh,generated_mwh,forced_outage_h,planned_outage_h,failures",
            language="text",
        )
        monthly_file = st.file_uploader("Cargar CSV mensual", type=["csv"])
        st.markdown("CSV de eventos opcional con columnas:")
        st.code("month,unit,equipment,cause,criticality,downtime_h,generation_loss_mwh,rca_status", language="text")
        events_file = st.file_uploader("Cargar CSV de eventos", type=["csv"])
    else:
        monthly_file = None
        events_file = None


if source == "Cargar CSV" and monthly_file is not None:
    monthly_df = pd.read_csv(monthly_file)
    monthly_df["month"] = pd.to_datetime(monthly_df["month"])
else:
    monthly_df = generate_demo_monthly_data()

if source == "Cargar CSV" and events_file is not None:
    events_df = pd.read_csv(events_file)
    events_df["month"] = pd.to_datetime(events_df["month"])
else:
    events_df = generate_demo_events(monthly_df)

kpis = calculate_kpis(monthly_df)
kpis["month_label"] = kpis["month"].apply(_month_label)

targets = {
    "availability": target_availability,
    "reliability": target_reliability,
    "maintainability": target_maintainability,
    "generation_performance": target_generation,
    "contractual_compliance": contractual_target,
}

kpis["contractual_compliance"] = (
    kpis["generated_mwh"] / (kpis["potential_mwh"] * contractual_target + 1e-9)
).clip(upper=1.5)

latest = kpis.iloc[-1]
previous = kpis.iloc[-2] if len(kpis) > 1 else latest

st.subheader("Indicadores del periodo")
c1, c2, c3, c4, c5, c6 = st.columns(6)
c1.metric("Disponibilidad", pct(latest["availability"]), f"{(latest['availability'] - previous['availability']) * 100:.1f} pp")
c2.metric("Confiabilidad", pct(latest["reliability"]), f"{(latest['reliability'] - previous['reliability']) * 100:.1f} pp")
c3.metric("Mantenibilidad", pct(latest["maintainability"]), f"{(latest['maintainability'] - previous['maintainability']) * 100:.1f} pp")
c4.metric("Generacion", f"{latest['generated_mwh']:.0f} MWh", f"{latest['generated_mwh'] - previous['generated_mwh']:.0f} MWh")
c5.metric("Perdidas oper.", f"{latest['operational_losses_mwh']:.0f} MWh", f"{latest['operational_losses_mwh'] - previous['operational_losses_mwh']:.0f} MWh")
c6.metric("Cumpl. contractual", pct(min(1.0, latest["contractual_compliance"])), f"{(latest['contractual_compliance'] - previous['contractual_compliance']) * 100:.1f} pp")

trend_df = kpis[
    [
        "month",
        "availability",
        "reliability",
        "maintainability",
        "generation_performance",
    ]
].melt(id_vars="month", var_name="indicator", value_name="value")

fig = px.line(trend_df, x="month", y="value", color="indicator", markers=True, title="Comparacion contra meses anteriores")
fig.update_yaxes(tickformat=".0%")
st.plotly_chart(fig, use_container_width=True)

st.subheader("Analisis de desviaciones")
deviation_rows = []
for key in ["availability", "reliability", "maintainability", "generation_performance"]:
    current = latest[key]
    target = targets[key]
    gap = current - target
    status = "En meta" if gap >= 0 else "Fuera de meta"
    technical_note = (
        "Resultado afectado por indisponibilidades forzadas y eventos repetitivos."
        if gap < 0
        else "Resultado estable con control operativo y ejecucion de mantenimiento."
    )
    deviation_rows.append(
        {
            "Indicador": key,
            "Actual": pct(current),
            "Meta": pct(target),
            "Brecha (pp)": f"{gap * 100:.1f}",
            "Estado": status,
            "Explicacion tecnica": technical_note,
        }
    )

deviation_df = pd.DataFrame(deviation_rows)
st.dataframe(deviation_df, use_container_width=True, hide_index=True)

st.subheader("Fallas y malos actores")
if events_df.empty:
    st.info("No hay eventos cargados para analizar malos actores.")
else:
    actor_df = (
        events_df.groupby(["equipment", "criticality", "cause"], as_index=False)
        .agg(
            frecuencia=("equipment", "count"),
            indisponibilidad_h=("downtime_h", "sum"),
            perdida_mwh=("generation_loss_mwh", "sum"),
        )
        .sort_values(["perdida_mwh", "indisponibilidad_h"], ascending=False)
    )
    actor_df["criticidad_score"] = actor_df["criticality"].map({"Alto": 3, "Medio": 2, "Bajo": 1}).fillna(1)
    actor_df["impacto_total"] = actor_df["perdida_mwh"] * actor_df["criticidad_score"]
    st.dataframe(actor_df.head(15), use_container_width=True, hide_index=True)

    fig_bad = px.bar(
        actor_df.head(10),
        x="equipment",
        y="perdida_mwh",
        color="criticality",
        title="Equipos con mayor afectacion en generacion",
    )
    st.plotly_chart(fig_bad, use_container_width=True)

st.subheader("Causas raiz")
if events_df.empty:
    st.info("Sin datos de eventos para RCA.")
else:
    rca_status = (
        events_df.groupby("rca_status", as_index=False)
        .agg(eventos=("rca_status", "count"), perdida_mwh=("generation_loss_mwh", "sum"))
        .sort_values("eventos", ascending=False)
    )
    c1, c2 = st.columns(2)
    with c1:
        st.dataframe(rca_status, use_container_width=True, hide_index=True)
    with c2:
        fig_rca = px.pie(rca_status, names="rca_status", values="eventos", title="Avance de RCA")
        st.plotly_chart(fig_rca, use_container_width=True)

st.subheader("Plan de mantenimiento")
maintenance_seed = pd.DataFrame(
    [
        {
            "sistema": "Combustion System",
            "tipo": "Preventivo",
            "ajuste_propuesto": "Reducir intervalo de inspeccion de 6 a 4 semanas",
            "justificacion": "Alta recurrencia de inestabilidad y criticidad alta",
            "recomendacion_fabricante": "Inspeccion termica quincenal",
        },
        {
            "sistema": "Excitation System",
            "tipo": "Predictivo",
            "ajuste_propuesto": "Monitoreo continuo de variables electricas",
            "justificacion": "Eventos repetitivos con perdida elevada de MWh",
            "recomendacion_fabricante": "Actualizar firmware y pruebas mensuales",
        },
        {
            "sistema": "Lubrication Pump",
            "tipo": "Correctivo",
            "ajuste_propuesto": "Overhaul y reemplazo de sello mecanico",
            "justificacion": "Tendencia de presion fuera de rango",
            "recomendacion_fabricante": "Cambio de sello cada 8.000 h",
        },
    ]
)
st.data_editor(maintenance_seed, use_container_width=True, num_rows="dynamic")

st.subheader("Riesgos y tendencias")
kpis["loss_ratio"] = kpis["operational_losses_mwh"] / kpis["potential_mwh"]
kpis["rolling_availability"] = kpis["availability"].rolling(3, min_periods=1).mean()
kpis["rolling_reliability"] = kpis["reliability"].rolling(3, min_periods=1).mean()

risk_flags = []
if latest["rolling_availability"] < target_availability:
    risk_flags.append("Riesgo de degradacion de disponibilidad por debajo de meta en tendencia movil 3M.")
if latest["rolling_reliability"] < target_reliability:
    risk_flags.append("Riesgo de continuidad de servicio por tendencia negativa de confiabilidad.")
if latest["loss_ratio"] > (1 - target_generation):
    risk_flags.append("Riesgo de perdida de capacidad de generacion por aumento de perdidas operacionales.")

if risk_flags:
    for risk in risk_flags:
        st.warning(risk)
else:
    st.success("Sin riesgos criticos en tendencia para el ultimo corte.")

fig_risk = px.line(
    kpis,
    x="month",
    y=["rolling_availability", "rolling_reliability", "loss_ratio"],
    markers=True,
    title="Tendencias de confiabilidad y perdidas",
)
fig_risk.update_yaxes(tickformat=".0%")
st.plotly_chart(fig_risk, use_container_width=True)

st.subheader("Plan de accion")
action_template = pd.DataFrame(
    [
        {
            "accion": "Ajustar logica de control en excitation system",
            "tipo": "Correctiva",
            "responsable": "Ing. Control",
            "fecha_compromiso": "2026-08-15",
            "estado": "En curso",
            "evidencia": "OT-18422",
            "resultado_esperado": "Reducir 30% fallas recurrentes en 2 meses",
        },
        {
            "accion": "Implementar inspecciones termograficas quincenales",
            "tipo": "Preventiva",
            "responsable": "Supervisor Mantenimiento",
            "fecha_compromiso": "2026-08-05",
            "estado": "Pendiente",
            "evidencia": "Plan PM v2",
            "resultado_esperado": "Disminuir indisponibilidad forzada en 10%",
        },
        {
            "accion": "Programa piloto de analitica predictiva en bombas",
            "tipo": "Mejora",
            "responsable": "Confiabilidad",
            "fecha_compromiso": "2026-09-01",
            "estado": "Pendiente",
            "evidencia": "Proyecto AP-07",
            "resultado_esperado": "Detectar degradacion temprana y evitar paradas no planificadas",
        },
    ]
)
st.data_editor(action_template, use_container_width=True, num_rows="dynamic")

with st.expander("Ver datos base"):
    st.markdown("**Datos mensuales**")
    st.dataframe(monthly_df.sort_values(["month", "unit"]), use_container_width=True, hide_index=True)
    st.markdown("**Datos de eventos**")
    st.dataframe(events_df.sort_values(["month", "unit"]), use_container_width=True, hide_index=True)
