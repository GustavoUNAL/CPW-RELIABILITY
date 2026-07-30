import { APP_USERS, ROLE_LABELS } from "./users";

export function UsersDirectory() {
  return (
    <div className="users-directory">
      <p className="eyebrow">Usuarios</p>
      <ul className="users-directory-list">
        {APP_USERS.map((u) => (
          <li key={u.id}>
            <strong>{u.name}</strong>
            <span>{u.email}</span>
            <em>{ROLE_LABELS[u.role]}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
