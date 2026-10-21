/**
 * lib/turnstile.ts — Verificación server-side de Cloudflare Turnstile.
 *
 * Requiere TURNSTILE_SECRET_KEY en .env.local y en Vercel.
 * Si la variable no está configurada, retorna true (modo desarrollo permisivo).
 * En producción siempre debe estar configurada.
 *
 * Claves de prueba (solo desarrollo, siempre pasan):
 *   Site key:   1x00000000000000000000AA
 *   Secret key: 1x0000000000000000000000000000000AA
 *
 * Obtén tus claves reales en: https://dash.cloudflare.com → Turnstile
 */

export async function verifyTurnstile(
  token: string | undefined | null,
  ip?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // sin configurar → solo en dev local

  if (!token) return false;

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          response: token,
          ...(ip ? { remoteip: ip } : {}),
        }),
      },
    );
    const data: { success: boolean } = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
