import { createServerClient } from "@/lib/supabase";
import ProyectosClient from "./ProyectosClient";

export const instant = false;

export default async function ProyectosPage() {
  const db = await createServerClient();
  const [{ data: projects }, { data: clients }] = await Promise.all([
    db.from("projects").select("*, clients(id, name, company)").order("created_at", { ascending: false }),
    db.from("clients").select("id, name, company").order("name"),
  ]);

  return <ProyectosClient initial={projects ?? []} clients={clients ?? []} />;
}
