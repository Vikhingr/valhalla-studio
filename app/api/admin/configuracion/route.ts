import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { encrypt } from "@/lib/encrypt";

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  const db = await createServerClient();
  const { data, error } = await db
    .from("configuracion")
    .select("*")
    .eq("id", "global")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return only non-sensitive fields + presence booleans
  return NextResponse.json({
    rfc_emisor: data.rfc_emisor,
    nombre_emisor: data.nombre_emisor,
    nombre_comercial: data.nombre_comercial,
    regimen_fiscal: data.regimen_fiscal,
    codigo_postal: data.codigo_postal,
    facturapi_mode: data.facturapi_mode ?? "test",
    has_facturapi_key: !!data.facturapi_key,
    has_cer: !!data.cer_data,
    has_key: !!data.key_data,
    has_password: !!data.csd_password,
    updated_at: data.updated_at,
  });
}

export async function PUT(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = await req.json();
  const db = await createServerClient();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  // Plain fiscal fields
  const plain = ["rfc_emisor", "nombre_emisor", "nombre_comercial", "regimen_fiscal", "codigo_postal", "facturapi_mode"] as const;
  for (const f of plain) {
    if (body[f] !== undefined) update[f] = body[f] || null;
  }
  if (body.facturapi_mode) update.facturapi_mode = body.facturapi_mode;

  // Encrypted fields (only if provided)
  if (body.facturapi_key) update.facturapi_key = await encrypt(body.facturapi_key);
  if (body.csd_password) update.csd_password = await encrypt(body.csd_password);
  if (body.cer_data) update.cer_data = await encrypt(body.cer_data);
  if (body.key_data) update.key_data = await encrypt(body.key_data);

  const { error } = await db
    .from("configuracion")
    .update(update)
    .eq("id", "global");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
