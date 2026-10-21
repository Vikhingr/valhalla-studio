/**
 * GET/PUT /api/admin/decoraciones — Solo para el panel (requiere sesión de admin).
 *
 * GET — lista de decoraciones de temporada (guardado + valores de fábrica).
 * PUT — guarda { decoraciones: [{ id, desde, hasta, activa }] } en configuracion.decoraciones.
 *       Los datos se validan con mezclarDecoraciones (ids conocidos, fechas MM-DD).
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { mezclarDecoraciones } from "@/lib/decoraciones";

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  const db = await createServerClient();
  const { data, error } = await db.from("configuracion").select("decoraciones").eq("id", "global").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ decoraciones: mezclarDecoraciones(data?.decoraciones) });
}

export async function PUT(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = await req.json().catch(() => ({}));
  const decoraciones = mezclarDecoraciones(body?.decoraciones).map(({ id, desde, hasta, activa }) => ({ id, desde, hasta, activa }));

  const db = await createServerClient();
  const { error } = await db
    .from("configuracion")
    .update({ decoraciones, updated_at: new Date().toISOString() })
    .eq("id", "global");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, decoraciones: mezclarDecoraciones(decoraciones) });
}
