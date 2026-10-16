/**
 * GET/POST/PATCH/DELETE /api/admin/cotizaciones
 *
 * GET    — lista todas las cotizaciones, más recientes primero.
 * POST   — crea una cotización nueva desde el cotizador.
 * PATCH  — actualiza campos individuales (ej. marcar anticipo_pagado o pagado_completo).
 *          El id se incluye en el body (no en la URL) por conveniencia del cliente.
 * DELETE — elimina una cotización. El id también va en el body.
 *
 * selected_features: array JSON de { id, label, price } — los servicios seleccionados
 * en el cotizador interactivo.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  const db = await createServerClient();
  const { data, error } = await db
    .from("cotizaciones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = await req.json();
  const db = await createServerClient();
  const { data, error } = await db
    .from("cotizaciones")
    .insert({
      name: body.name,
      project_type: body.project_type,
      selected_features: body.selected_features,
      subtotal: body.subtotal,
      iva: body.iva,
      total: body.total,
      with_iva: body.with_iva,
      anticipo: body.anticipo,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id, ...updates } = await req.json();
  const db = await createServerClient();
  const { data, error } = await db
    .from("cotizaciones")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await req.json();
  const db = await createServerClient();
  const { error } = await db.from("cotizaciones").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
