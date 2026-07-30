import { useState, type FormEvent } from "react";
import { LogIn } from "lucide-react";
import { authenticate } from "./users";
import type { SessionUser } from "./users";
import { PROJECT_TITLE } from "../nav/projectTree";

type Props = {
  onSuccess: (user: SessionUser) => void;
};

export function LoginScreen({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const result = await authenticate(email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSuccess(result.user);
    } catch {
      setError("No se pudo iniciar sesión. Intente de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-atmosphere" aria-hidden />
      <div className="login-card">
        <header className="login-brand">
          <p className="login-brand-mark">COPOWER</p>
          <h1 className="login-brand-title">{PROJECT_TITLE}</h1>
          <p className="login-brand-sub">Acceso a la plataforma de confiabilidad</p>
        </header>

        <form className="login-form" onSubmit={onSubmit} noValidate>
          <label className="login-field">
            <span>Correo</span>
            <input
              type="email"
              name="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@copower.com"
              required
              disabled={busy}
            />
          </label>
          <label className="login-field">
            <span>Contraseña</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              enterKeyHint="go"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={busy}
            />
          </label>

          {error ? (
            <p className="login-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="login-submit"
            disabled={busy || !email.trim() || !password}
          >
            <LogIn size={18} aria-hidden />
            {busy ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
