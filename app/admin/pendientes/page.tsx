/**
 * PendientesPage — Server Component que carga tareas y proyectos.
 * Ambas queries en paralelo. Hidrata PendientesClient para evitar
 * el spinner inicial de carga en el lado cliente.
 */
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
