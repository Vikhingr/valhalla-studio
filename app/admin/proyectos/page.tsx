import { createServerClient } from "@/lib/supabase";
import ProyectosClient from "./ProyectosClient";

export const instant = false;

export default async function ProyectosPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const db = await createServerClient();
  const [{ data: projects }, { data: clients }, { data: cotizaciones }] = await Promise.all([
    db.from("projects").select("*, clients(id, name, company)").order("created_at", { ascending: false }),
    db.from("clients").select("id, name, company, protonpass_ref").order("name"),
    db.from("cotizaciones").select("*").order("created_at", { ascending: false }),
  ]);

  return <ProyectosClient initial={projects ?? []} clients={clients ?? []} cotizaciones={cotizaciones ?? []} defaultCotizacionId={from} />;
}
