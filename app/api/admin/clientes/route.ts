/**
 * GET/POST /api/admin/clientes
 *
 * GET  — lista todos los clientes ordenados por fecha de creación (más recientes primero).
 * POST — crea un cliente nuevo. Solo `name` es obligatorio; el resto es opcional.
 *
 * protonpass_ref: identificador de la entrada en ProtonPass donde Gabriel guarda
 * las credenciales del cliente (accesos a hosting, CMS, etc.).
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  const db = await createServerClient();
  const { data, error } = await db
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = await req.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }

  const db = await createServerClient();
  const { data, error } = await db
    .from("clients")
    .insert({
      name:            body.name.trim(),
      company:         body.company         || null,
      email:           body.email           || null,
      phone:           body.phone           || null,
      notes:           body.notes           || null,
      protonpass_ref:  body.protonpass_ref  || null,
      rfc:             body.rfc?.toUpperCase() || null,  // RFC siempre en mayúsculas
      nombre_fiscal:   body.nombre_fiscal   || null,
      regimen_fiscal:  body.regimen_fiscal  || null,
      codigo_postal:   body.codigo_postal   || null,
      domicilio:       body.domicilio       || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
