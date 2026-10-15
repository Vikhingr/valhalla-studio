import { createServerClient } from "@/lib/supabase";
import ClientesClient from "./ClientesClient";

export const instant = false;

export default async function ClientesPage() {
  const db = await createServerClient();
  const { data } = await db.from("clients").select("*").order("created_at", { ascending: false });
  return <ClientesClient initial={data ?? []} />;
}
