/**
 * CotizacionDetailPage — Página de impresión/PDF de una cotización (Server Component).
 *
 * Carga en paralelo: la cotización y la config del emisor.
 * El folio es la posición 1-indexed de la cotización en orden cronológico.
 */
import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import PrintCotizacion from "./PrintCotizacion";

export const instant = false;

export default async function CotizacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await createServerClient();

  const [{ data: cotizacion }, { data: cfg }, { data: allIds }] = await Promise.all([
    db.from("cotizaciones").select("*").eq("id", id).single(),
    db.from("configuracion").select("nombre_emisor, nombre_comercial, rfc_emisor, regimen_fiscal, codigo_postal").eq("id", "global").single(),
    db.from("cotizaciones").select("id").order("created_at", { ascending: true }),
  ]);

  if (!cotizacion) notFound();

  const folio = (allIds?.findIndex((c: { id: string }) => c.id === id) ?? -1) + 1;

  return (
    <PrintCotizacion
      cotizacion={cotizacion}
      folio={folio}
      emisorNombre={cfg?.nombre_comercial || cfg?.nombre_emisor || "Valhalla Studio"}
      emisorRfc={cfg?.rfc_emisor ?? ""}
    />
  );
}
