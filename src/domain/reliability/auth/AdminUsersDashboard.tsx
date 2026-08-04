import { ROLE_LABELS, APP_USERS, type UserRole } from "./users";
import { ScreenShell } from "../ui/ScreenShell";

const ROLE_HINT: Record<UserRole, string> = {
  admin: "Acceso total · usuarios, uso y configuración",
  innovacion: "Análisis, RCA y módulos de mejora",
  gerencia: "Resúmenes ejecutivos e indicadores",
  operacion: "Operación diaria, eventos y mantenimiento",
  generacion: "Módulo de generación · energía y unidades",
};

export function AdminUsersDashboard() {
  return (
    <ScreenShell
      report="dual"
      title="Administrar usuarios"
      subtitle="Cuentas habilitadas en la plataforma COPOWER"
    >
      <div className="admin-module">
        <p className="admin-lead">
          Usuarios con acceso al portal. Las contraseñas se validan en el cliente (hash); no se
          muestran en claro. Para dar de alta o cambiar roles, actualiza el catálogo en el código
          o solicita el cambio al administrador del repositorio.
        </p>

        <div className="admin-user-grid">
          {APP_USERS.map((u) => (
            <article key={u.id} className="admin-user-card">
              <header className="admin-user-card-head">
                <strong>{u.name}</strong>
                <span className={`admin-role-pill admin-role-pill--${u.role}`}>
                  {ROLE_LABELS[u.role]}
                </span>
              </header>
              <p className="admin-user-email">{u.email}</p>
              <p className="admin-user-hint">{ROLE_HINT[u.role]}</p>
              <dl className="admin-user-meta">
                <div>
                  <dt>ID</dt>
                  <dd>{u.id}</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>Activo</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <section className="admin-panel">
          <h3>Resumen por rol</h3>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Usuarios</th>
                  <th>Correos</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => {
                  const list = APP_USERS.filter((u) => u.role === role);
                  return (
                    <tr key={role}>
                      <td>{ROLE_LABELS[role]}</td>
                      <td>{list.length}</td>
                      <td>{list.map((u) => u.email).join(", ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ScreenShell>
  );
}
