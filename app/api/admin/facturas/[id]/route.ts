import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { decrypt } from "@/lib/encrypt";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const db = await createServerClient();
  const { data, error } = await db
    .from("facturas")
    .select("*, clients(id, name, company, rfc, nombre_fiscal)")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const body = await req.json();
  const db = await createServerClient();

  // Only allow status update (cancel)
  if (body.status !== "cancelada") {
    return NextResponse.json({ error: "Solo se puede cancelar una factura" }, { status: 400 });
  }

  const { data, error } = await db
    .from("facturas")
    .update({ status: "cancelada" })
    .eq("id", id)
    .select("*, clients(id, name, company)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

