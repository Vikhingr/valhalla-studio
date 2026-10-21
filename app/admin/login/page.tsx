"use client";
/**
 * LoginPage — Página de autenticación del panel admin.
 *
 * Incluye Cloudflare Turnstile para bloquear bots.
 * El widget renderiza automáticamente dentro de #turnstile-widget.
 * El token se envía junto con la contraseña al API.
 *
 * Variables de entorno requeridas:
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY — clave pública de Turnstile
 *     Prueba (siempre pasa): 1x00000000000000000000AA
 *     Real: obtén en https://dash.cloudflare.com → Turnstile
 */
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

const SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

declare global {
  interface Window {
    turnstile?: {
      render(container: string | HTMLElement, options: Record<string, unknown>): string;
      reset(widgetId: string): void;
    };
    _tsWidgetId?: string;
    _tsToken?: string;
  }
}

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function renderTurnstile() {
    if (!window.turnstile) return;
    window._tsWidgetId = window.turnstile.render("#turnstile-widget", {
      sitekey: SITE_KEY,
      theme: "light",
      callback: (token: string) => { window._tsToken = token; },
      "error-callback": () => { window._tsToken = ""; },
      "expired-callback": () => { window._tsToken = ""; },
    });
  }

  // Renderizar cuando el script ya cargó antes de este montaje
  useEffect(() => {
    if (window.turnstile) renderTurnstile();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const token = window._tsToken ?? "";
    if (!token) {
      setError("Completa la verificación antes de continuar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, "cf-turnstile-response": token }),
      });
      if (res.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        const j = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setError("Demasiados intentos. Espera unos minutos.");
        } else if (j.error === "captcha") {
          setError("La verificación anti-bot falló. Recarga la página.");
        } else {
          setError("Contraseña incorrecta. Inténtalo de nuevo.");
        }
        if (window._tsWidgetId && window.turnstile) {
          window.turnstile.reset(window._tsWidgetId);
          window._tsToken = "";
        }
      }
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={renderTurnstile}
      />

      <div
        className="adm-main"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 360 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, justifyContent: "center" }}>
            <div
              style={{
                width: 40, height: 40,
                border: "2px solid var(--ink)",
                borderRadius: "var(--hand-radius)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-hand), cursive",
                fontSize: 28, fontWeight: 700,
                color: "var(--ink)",
                transform: "rotate(-4deg)",
              }}
            >
              V
            </div>
            <span style={{ fontFamily: "var(--font-hand), cursive", fontSize: 30, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>
              Valhalla <span style={{ color: "var(--violet)" }}>Studio</span>
            </span>
          </div>

          {/* Card: hoja de cuaderno */}
          <div
            style={{
              position: "relative",
              background: "var(--surface)",
              backgroundImage:
                "linear-gradient(90deg, transparent 30px, var(--margin-red) 30px, var(--margin-red) 32px, transparent 32px), repeating-linear-gradient(var(--surface) 0 31px, var(--rule-blue) 31px 32px)",
              border: "2px solid var(--ink)",
              borderRadius: "var(--card-radius)",
              boxShadow: "6px 8px 0 rgba(42,42,46,0.16)",
              transform: "rotate(-0.6deg)",
              padding: "34px 28px 32px 48px",
            }}
          >
            <span aria-hidden style={{ position: "absolute", top: -14, left: "50%", width: 110, height: 28, transform: "translateX(-50%) rotate(-3deg)", background: "rgba(215,205,170,0.78)", border: "1px solid rgba(42,42,46,0.15)" }} />
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>
              Acceso privado
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
              Oficina Virtual · Solo para Gabriel
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
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

              {/* Turnstile widget */}
              <div id="turnstile-widget" style={{ minHeight: 65 }} />

              {error && (
                <p role="alert" style={{ fontSize: 13, color: "oklch(0.50 0.16 25)", margin: 0 }}>
                  {error}
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
    </>
  );
}
