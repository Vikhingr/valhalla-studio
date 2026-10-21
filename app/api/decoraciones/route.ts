/**
 * GET /api/decoraciones — Pública. La usa el portafolio (public/index.html) al cargar.
 *
 * Responde la lista de decoraciones de temporada (fechas e interruptores del panel)
 * y cuál toca hoy. Si la base de datos falla, responde la lista de fábrica.
 * Se cachea 5 minutos en el CDN para no consultar Supabase en cada visita.
 */
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { DECORACIONES_DEFAULT, decoracionDeHoy, mezclarDecoraciones } from "@/lib/decoraciones";

export async function GET() {
  let lista = DECORACIONES_DEFAULT;
  try {
    const db = await createServerClient();
    const { data } = await db.from("configuracion").select("decoraciones").eq("id", "global").maybeSingle();
    lista = mezclarDecoraciones(data?.decoraciones);
  } catch {
    // sin conexión a la base: se usan las fechas de fábrica
  }
  return NextResponse.json(
    { decoraciones: lista, hoy: decoracionDeHoy(lista)?.id ?? null },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
