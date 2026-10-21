/**
 * DecoracionesPage — Server Component. Carga las decoraciones de temporada guardadas
 * (configuracion.decoraciones) combinadas con las de fábrica y las pasa al cliente.
 */
import { createServerClient } from "@/lib/supabase";
import { mezclarDecoraciones } from "@/lib/decoraciones";
import DecoracionesClient from "./DecoracionesClient";

export const instant = false;

export default async function DecoracionesPage() {
  let guardadas: unknown = null;
  let sinColumna = false;
  try {
    const db = await createServerClient();
    const { data, error } = await db.from("configuracion").select("decoraciones").eq("id", "global").maybeSingle();
    if (error) sinColumna = /decoraciones/i.test(error.message);
    guardadas = data?.decoraciones ?? null;
  } catch {
    // se muestran las de fábrica
  }
  return <DecoracionesClient initial={mezclarDecoraciones(guardadas)} sinColumna={sinColumna} />;
}
