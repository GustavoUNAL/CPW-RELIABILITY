import { useState, type FormEvent } from "react";
import { LogIn } from "lucide-react";
import { InformeLogo } from "../reports/InformeBrandChrome";
import { authenticate, DEMO_LOGIN } from "./users";
import type { SessionUser } from "./users";

type Props = {
  onSuccess: (user: SessionUser) => void;
};

const AUDIENCES = [
  { who: "Gerencia", what: "Si el mes cumplió la meta y cuánta energía se entregó." },
  { who: "Coordinación", what: "Qué campo y qué máquina hay que mirar este cierre." },
  { who: "Operación", what: "Qué significa disponibilidad, falla y stand-by." },
];

export function LoginScreen({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const enter = async (user: string, pass: string) => {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const result = await authenticate(user, pass);
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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void enter(email, password);
  };

  return (
    <div className="login-screen">
      <div className="login-atmosphere" aria-hidden />
      <div className="login-card">
        <header className="login-brand">
          <InformeLogo className="app-logo app-logo--login" />
          <h1 className="login-brand-title">Cómo va el parque</h1>
          <p className="login-brand-sub">
            Una lectura corta del cierre para gerencia, coordinación de campo y operación.
          </p>
        </header>

        <ul className="login-audiences">
          {AUDIENCES.map((item) => (
            <li key={item.who}>
              <strong>{item.who}</strong>
              <span>{item.what}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="login-submit"
          disabled={busy}
          onClick={() => void enter(DEMO_LOGIN.user, DEMO_LOGIN.password)}
        >
          <LogIn size={18} aria-hidden />
          {busy ? "Ingresando…" : "Entrar a probar"}
        </button>
        <p className="login-demo-hint">
          Usuario y clave de prueba: <strong>{DEMO_LOGIN.user}</strong>
        </p>

        <form className="login-form" onSubmit={onSubmit} noValidate>
          <p className="login-or">o ingrese con su usuario</p>
          <label className="login-field">
            <span>Usuario</span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admincopower"
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
              placeholder="admincopower"
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
            className="login-secondary"
            disabled={busy || !email.trim() || !password}
          >
            {busy ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
