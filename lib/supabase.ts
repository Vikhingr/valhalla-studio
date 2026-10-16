/**
 * lib/supabase.ts — Cliente de Supabase para uso exclusivo en el servidor.
 *
 * Usa la clave service_role (privilegiada), que bypasea las Row Level Security
 * policies de Supabase. Por eso este archivo NUNCA debe importarse en componentes
 * del cliente ("use client") ni en código que corra en el navegador.
 *
 * El `await cookies()` no hace nada útil en sí, pero opt-in al "dynamic rendering"
 * de Next.js: sin esta línea, una Server Component que llame a createServerClient
 * podría ser pre-renderizada con datos obsoletos en el build.
 *
 * Variables de entorno requeridas:
 *   SUPABASE_URL              — URL del proyecto en Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — clave service_role (secreta, solo servidor)
 */
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Crea y retorna un cliente Supabase con permisos de service_role.
 * Llamar al inicio de cada API route o Server Component que necesite leer/escribir BD.
 */
export async function createServerClient() {
  // Fuerza dynamic rendering; sin esto Next.js podría cachear la respuesta en build
  await cookies()
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }  // servidor stateless: no guardar sesión de usuario
  )
}
