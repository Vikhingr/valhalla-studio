/**
 * POST /api/admin/login
 *
 * Autenticación del panel admin con contraseña única.
 * Protecciones activas:
 *   1. Cloudflare Turnstile — bloquea bots antes de comparar contraseñas.
 *   2. Rate limiting en memoria — máximo 5 intentos fallidos por IP / 15 min.
 *   3. Delay artificial de 300 ms en fallos — desacelera ataques manuales.
 *
 * En éxito: setea cookie httpOnly `admin_token` (SESSION_SECRET, 7 días).
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit, resetRateLimit } from "@/lib/ratelimit";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  // 1. Rate limiting
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "demasiados_intentos" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => ({}));

  // 2. Turnstile
  const turnstileOk = await verifyTurnstile(body["cf-turnstile-response"], ip);
  if (!turnstileOk) {
    await delay(300);
    return NextResponse.json({ ok: false, error: "captcha" }, { status: 403 });
  }

  // 3. Contraseña
  if (!body.password || body.password !== process.env.ADMIN_PASSWORD) {
    await delay(300);
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Éxito: limpiar contador y setear cookie
  resetRateLimit(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", process.env.SESSION_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return response;
}
