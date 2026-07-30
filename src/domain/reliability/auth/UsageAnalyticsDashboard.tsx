import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RefreshCw, Users } from "lucide-react";
import { ROLE_LABELS, type UserRole } from "./users";
import { fetchUsageReport, formatDuration, type UsageReport } from "./usageAnalytics";
import { ScreenShell } from "../ui/ScreenShell";

function roleLabel(role: string) {
  return ROLE_LABELS[role as UserRole] ?? role;
}

function formatWhen(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function UsageAnalyticsDashboard() {
  const [report, setReport] = useState<UsageReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsageReport();
      setReport(data);
    } catch (e) {
      setError(String((e as Error)?.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  const chartTime =
    report?.topByTime.slice(0, 8).map((p) => ({
      name: p.label.length > 22 ? `${p.label.slice(0, 20)}…` : p.label,
      minutos: Math.round(p.ms / 60000),
    })) ?? [];

  const chartViews =
    report?.topByViews.slice(0, 8).map((p) => ({
      name: p.label.length > 22 ? `${p.label.slice(0, 20)}…` : p.label,
      vistas: p.views,
    })) ?? [];

  return (
    <ScreenShell
      report="dual"
      title="Uso de la plataforma"
      subtitle="Logins, tiempo de sesión y pantallas más visitadas (solo admin)"
    >
      <div className="usage-module exec-dashboard">
        <header className="usage-head">
          <div>
            <p className="usage-lead">
              Registro de accesos de los usuarios de COPOWER. En producción se guarda en el
              servidor; si la API no está disponible se muestra el historial local de este
              navegador.
            </p>
            {report ? (
              <p className="usage-meta muted">
                Fuente: <strong>{report.source === "server" ? "servidor" : "local"}</strong>
                {" · "}
                actualizado {formatWhen(report.generatedAt)}
              </p>
            ) : null}
          </div>
          <button type="button" className="usage-refresh" onClick={() => void load()} disabled={loading}>
            <RefreshCw size={16} />
            {loading ? "Cargando…" : "Actualizar"}
          </button>
        </header>

        {error ? <p className="usage-error">{error}</p> : null}

        {report ? (
          <>
            <div className="usage-kpi-grid">
              <article className="usage-kpi">
                <span>Personas que han entrado</span>
                <strong>{report.summary.uniqueUsers}</strong>
              </article>
              <article className="usage-kpi">
                <span>Sesiones totales</span>
                <strong>{report.summary.totalSessions}</strong>
              </article>
              <article className="usage-kpi">
                <span>Activos ahora</span>
                <strong>{report.summary.activeNow}</strong>
                <small>vistos en los últimos 2 min</small>
              </article>
              <article className="usage-kpi">
                <span>Tiempo total</span>
                <strong>{formatDuration(report.summary.totalMs)}</strong>
              </article>
              <article className="usage-kpi">
                <span>Promedio por sesión</span>
                <strong>{formatDuration(report.summary.avgSessionMs)}</strong>
              </article>
            </div>

            <div className="usage-panels">
              <section className="usage-panel">
                <h3>Lo que más miran (por tiempo)</h3>
                <div className="usage-chart">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartTime} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => [`${Number(v ?? 0)} min`, "Tiempo"]} />
                      <Bar dataKey="minutos" fill="#2bb3a3" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
              <section className="usage-panel">
                <h3>Lo que más miran (por visitas)</h3>
                <div className="usage-chart">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartViews} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="vistas" fill="#3d7ea6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            <section className="usage-panel">
              <h3>
                <Users size={16} /> Por persona
              </h3>
              <div className="table-wrap">
                <table className="usage-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Sesiones</th>
                      <th>Tiempo total</th>
                      <th>Promedio</th>
                      <th>Última actividad</th>
                      <th>Más mirado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.users.map((u) => (
                      <tr key={u.userId}>
                        <td>
                          <strong>{u.name}</strong>
                          <div className="muted" style={{ fontSize: "0.75rem" }}>
                            {u.email}
                          </div>
                        </td>
                        <td>{roleLabel(u.role)}</td>
                        <td>{u.sessions}</td>
                        <td>{formatDuration(u.totalMs)}</td>
                        <td>{formatDuration(u.avgMs)}</td>
                        <td>{formatWhen(u.lastSeenAt)}</td>
                        <td>
                          {u.topPages[0]
                            ? `${u.topPages[0].label} (${formatDuration(u.topPages[0].ms)})`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                    {report.users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="muted">
                          Aún no hay sesiones registradas. Los datos aparecen cuando alguien inicia
                          sesión con el servidor de producción activo.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="usage-panel">
              <h3>Sesiones recientes</h3>
              <div className="table-wrap">
                <table className="usage-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Inicio</th>
                      <th>Última vista</th>
                      <th>Fin</th>
                      <th>Duración</th>
                      <th>Pantallas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.recentSessions.map((s) => (
                      <tr key={s.sessionId}>
                        <td>
                          <strong>{s.name}</strong>
                          <div className="muted" style={{ fontSize: "0.75rem" }}>
                            {s.email}
                          </div>
                        </td>
                        <td>{formatWhen(s.startedAt)}</td>
                        <td>{formatWhen(s.lastSeenAt)}</td>
                        <td>{s.endedAt ? formatWhen(s.endedAt) : "En curso"}</td>
                        <td>{formatDuration(s.durationMs)}</td>
                        <td>{s.pageCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : loading ? (
          <p className="muted">Cargando analítica…</p>
        ) : null}
      </div>
    </ScreenShell>
  );
}
