import { createServerClient } from "@/lib/supabase";
import CotizacionesClient from "./CotizacionesClient";

export const instant = false;

export default async function CotizacionesPage() {
  const db = await createServerClient();
  const { data: cotizaciones } = await db
    .from("cotizaciones")
    .select("*")
    .order("created_at", { ascending: false });

  return <CotizacionesClient initial={cotizaciones ?? []} />;
}
