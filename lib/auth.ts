/**
 * lib/auth.ts — Middleware de autenticación para el panel admin.
 *
 * El admin usa una cookie httpOnly (admin_token) cuyo valor es SESSION_SECRET.
 * No hay usuarios ni base de datos de sesiones — la validación es una comparación
 * simple de strings. Un solo administrador (Gabriel), sin roles ni permisos.
 *
 * Uso en cualquier API route:
 *   const deny = await requireAdmin();
 *   if (deny) return deny;    // 401 si no está autenticado
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Verifica que la cookie `admin_token` coincida con SESSION_SECRET.
 * Retorna una respuesta 401 si falla, o null si el acceso es válido.
 * Llamar al inicio de cada API route protegida.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const jar = await cookies();
  const token = jar.get("admin_token")?.value;
  if (!token || token !== process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}
