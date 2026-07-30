export type UserRole = "admin" | "innovacion" | "gerencia" | "operacion";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** SHA-256 hex of `cpw-rel:${email}:${password}` — never store plaintext. */
  passwordHash: string;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  innovacion: "Innovación",
  gerencia: "Gerencia",
  operacion: "Operación",
};

/**
 * Usuarios semilla de la plataforma.
 * Contraseñas solo como hash; verificación en cliente (SPA offline).
 */
export const APP_USERS: readonly AppUser[] = [
  {
    id: "usr-gustavo",
    name: "Gustavo Arteaga",
    email: "gustavo@copower.com",
    role: "admin",
    passwordHash: "8681b0a20b5bc4947060a8cdd0be03266a95087f995f0796767407f07facfbf7",
  },
  {
    id: "usr-arthur",
    name: "Arthur",
    email: "arthur@copower.com",
    role: "innovacion",
    passwordHash: "52ec43c6788fc1e1471005c4fab6f39e3b5f0d2c18d5adf01dc1ad68595cb7f8",
  },
  {
    id: "usr-gerencia",
    name: "Gerencia",
    email: "gerencia@copower.com",
    role: "gerencia",
    passwordHash: "edfd657457b413ac9ae5bd304eacac18b181d0a5ca3cd7424c755bb7ca7436d3",
  },
  {
    id: "usr-operacion",
    name: "Operación",
    email: "operacion@copower.com",
    role: "operacion",
    passwordHash: "2f2d3f374865dad84c9ec01a4c1c867ca73ac9dadfa555d4c239b2fbc25511c9",
  },
];

export function findUserByEmail(email: string): AppUser | undefined {
  const key = email.trim().toLowerCase();
  return APP_USERS.find((u) => u.email.toLowerCase() === key);
}

export async function hashPassword(email: string, password: string): Promise<string> {
  const payload = `cpw-rel:${email.trim().toLowerCase()}:${password}`;
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function authenticate(
  email: string,
  password: string,
): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const user = findUserByEmail(email);
  if (!user) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }
  const hash = await hashPassword(user.email, password);
  if (hash !== user.passwordHash) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }
  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
