import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const db = await createServerClient();
  const { data, error } = await db
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = await createServerClient();
  const { data, error } = await db
    .from("clients")
    .insert({
      name: body.name,
      company: body.company || null,
      email: body.email || null,
      phone: body.phone || null,
      notes: body.notes || null,
      protonpass_ref: body.protonpass_ref || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
