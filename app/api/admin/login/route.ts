/**
 * POST /api/admin/login
 *
 * Autenticación del panel admin con contraseña única.
 * Si ADMIN_PASSWORD coincide, crea la cookie httpOnly `admin_token` con el valor
 * de SESSION_SECRET. Esa cookie es verificada en cada request protegido por requireAdmin().
 *
 * La cookie tiene maxAge de 7 días; después hay que volver a hacer login.
 * secure:true en producción garantiza que solo viaje por HTTPS.
 */
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_token', process.env.SESSION_SECRET!, {
    httpOnly: true,                                    // no accesible por JS del cliente
    secure: process.env.NODE_ENV === 'production',     // solo HTTPS en prod
    sameSite: 'strict',                                // protección CSRF
    maxAge: 7 * 24 * 60 * 60,                          // 7 días en segundos
    path: '/',
  })

  return response
}
