/**
 * POST /api/admin/logout
 *
 * Cierra la sesión admin sobreescribiendo `admin_token` con un string vacío
 * y maxAge 0, lo que hace que el browser la elimine de inmediato.
 * No requiere autenticación previa (no dañino hacer logout sin sesión).
 */
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    maxAge: 0,   // expiración inmediata → el browser borra la cookie
    path: '/',
  })
  return response
}
