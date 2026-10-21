/**
 * lib/ratelimit.ts — Rate limiter en memoria para el login admin.
 *
 * Registra intentos fallidos por IP. Tras MAX_ATTEMPTS en WINDOW_MS, bloquea
 * con 429. Se resetea en login exitoso. No requiere Redis; suficiente para
 * un solo admin con Turnstile como defensa principal contra bots.
 *
 * Nota: el Map vive en la instancia de la función serverless. En Vercel, varias
 * instancias corren en paralelo, pero Turnstile ya elimina la mayoría de ataques
 * automatizados antes de llegar aquí.
 */

const attempts = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

export function checkRateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { ok: true };
}

export function resetRateLimit(ip: string) {
  attempts.delete(ip);
}
