import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  const db = await createServerClient();
  const { data, error } = await db
    .from("projects")
    .select("*, clients(id, name, company)")
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
    .from("projects")
    .insert({
      name: body.name,
      client_id: body.client_id || null,
      stage: body.stage || "cotizacion",
      start_date: body.start_date || null,
      deadline: body.deadline || null,
      quoted_price: body.quoted_price ? Number(body.quoted_price) : null,
      paid_amount: body.paid_amount ? Number(body.paid_amount) : 0,
      project_url: body.project_url || null,
      notes: body.notes || null,
      protonpass_ref: body.protonpass_ref || null,
    })
    .select("*, clients(id, name, company)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
