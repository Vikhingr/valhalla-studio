/**
 * ClientesPage — Server Component que carga la lista de clientes.
 * Hidrata ClientesClient con los datos iniciales para evitar un fetch en el lado cliente.
 * `instant = false` opta por renderizado dinámico (sin caché estática).
 */
import { createServerClient } from "@/lib/supabase";
import ClientesClient from "./ClientesClient";

export const instant = false;

export default async function ClientesPage() {
  const db = await createServerClient();
  const { data } = await db.from("clients").select("*").order("created_at", { ascending: false });
  return <ClientesClient initial={data ?? []} />;
}
