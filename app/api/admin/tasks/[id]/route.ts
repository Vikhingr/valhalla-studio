/**
 * PUT/PATCH/DELETE /api/admin/tasks/[id]
 *
 * PUT    — reemplaza todos los campos de una tarea (edición completa desde modal).
 * PATCH  — actualiza campos parciales (usado para cambio rápido de status desde la UI).
 * DELETE — elimina la tarea permanentemente.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const body = await req.json();
  const db = await createServerClient();
  const { data, error } = await db
    .from("tasks")
    .update({
      title: body.title,
      project_id: body.project_id || null,
      depends_on: body.depends_on,
      priority: body.priority,
      status: body.status,
      due_date: body.due_date || null,
    })
    .eq("id", id)
    .select("*, projects(id, name)")
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
    .from("tasks")
    .update(body)
    .eq("id", id)
    .select("*, projects(id, name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const db = await createServerClient();
  const { error } = await db.from("tasks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
