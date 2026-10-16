/**
 * LoginPage — Página de autenticación del panel admin.
 *
 * Formulario de una sola contraseña (ADMIN_PASSWORD en .env).
 * En éxito, el server setea la cookie httpOnly `admin_token` y
 * redirige al dashboard. En error muestra mensaje sin revelar detalles.
 */
"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, justifyContent: "center" }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "var(--violet)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            V
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>
            Valhalla<span style={{ color: "var(--violet-light)" }}>Studio</span>
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "28px 28px 32px",
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
            Acceso privado
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
            Oficina Virtual · Solo para Gabriel
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 6,
                }}
              >
                Contraseña
              </label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg)",
                  border: `1px solid ${error ? "oklch(0.55 0.16 25 / 0.6)" : "var(--border)"}`,
                  borderRadius: 8,
                  padding: "11px 14px",
                  color: "var(--ink)",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => { if (!error) e.target.style.borderColor = "var(--violet-light)"; }}
                onBlur={(e) => { if (!error) e.target.style.borderColor = "var(--border)"; }}
              />
            </div>

            {error && (
              <p
                role="alert"
                style={{ fontSize: 12, color: "oklch(0.75 0.14 25)", margin: 0 }}
              >
                Contraseña incorrecta. Inténtalo de nuevo.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ justifyContent: "center", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
