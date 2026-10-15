import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const db = await createServerClient();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  let query = db.from("tasks").select("*, projects(id, name)").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = await req.json();
  const db = await createServerClient();
  const { data, error } = await db
    .from("tasks")
    .insert({
      title: body.title,
      project_id: body.project_id || null,
      depends_on: body.depends_on || "me",
      priority: body.priority || "media",
      status: body.status || "pendiente",
      due_date: body.due_date || null,
    })
    .select("*, projects(id, name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
