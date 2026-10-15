import { createServerClient } from "@/lib/supabase";
import PendientesClient from "./PendientesClient";

export const instant = false;

export default async function PendientesPage() {
  const db = await createServerClient();
  const [{ data: tasks }, { data: projects }] = await Promise.all([
    db.from("tasks").select("*, projects(id, name)").order("created_at", { ascending: false }),
    db.from("projects").select("id, name").order("name"),
  ]);

  return <PendientesClient initial={tasks ?? []} projects={projects ?? []} />;
}
