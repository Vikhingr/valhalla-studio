/**
 * DELETE /api/admin/resico/[id]
 *
 * Elimina un gasto de la tabla gastos_resico por su UUID.
 * Los gastos son CFDIs de egresos cargados manualmente para acreditar IVA
 * en la declaración RESICO mensual.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export const instant = false;

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await params;
  const db = await createServerClient();

  const { error } = await db.from("gastos_resico").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
