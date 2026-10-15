import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const db = await createServerClient();
  const { data, error } = await db
    .from("projects")
    .select("*, clients(id, name, company)")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const body = await req.json();
  const db = await createServerClient();
  const { data, error } = await db
    .from("projects")
    .update({
      name: body.name,
      client_id: body.client_id || null,
      stage: body.stage,
      start_date: body.start_date || null,
      deadline: body.deadline || null,
      quoted_price: body.quoted_price ? Number(body.quoted_price) : null,
      paid_amount: body.paid_amount ? Number(body.paid_amount) : 0,
      project_url: body.project_url || null,
      notes: body.notes || null,
      protonpass_ref: body.protonpass_ref || null,
    })
    .eq("id", id)
    .select("*, clients(id, name, company)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const body = await req.json();
  const db = await createServerClient();
  const { data, error } = await db
    .from("projects")
    .update(body)
    .eq("id", id)
    .select("*, clients(id, name, company)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const db = await createServerClient();
  const { error } = await db.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
