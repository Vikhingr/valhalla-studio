/**
 * proxy.ts — Middleware de protección de rutas del panel admin.
 *
 * Ejecutado por el Edge Runtime en cada request que coincida con /admin/:path*.
 * Verifica la cookie `admin_token` antes de permitir acceso.
 * Si la cookie no existe o no coincide con SESSION_SECRET, redirige a /admin/login.
 *
 * Funciona en paralelo con requireAdmin() de lib/auth.ts:
 *   - proxy.ts: protege la navegación a nivel de página (redirige a login)
 *   - requireAdmin(): protege los API routes (retorna 401 JSON)
 *
 * La ruta /admin/login se excluye explícitamente para no crear loop de redirección.
 * El matcher limita la ejecución del middleware solo a rutas /admin/* (eficiencia).
 */
import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get('admin_token')?.value
  const expected = process.env.SESSION_SECRET

  if (!token || !expected || token !== expected) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
