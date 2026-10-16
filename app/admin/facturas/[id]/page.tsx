/**
 * FacturaDetailPage — Vista de impresión/detalle de una factura (Server Component).
 *
 * Carga en paralelo: la factura con datos del cliente, la config fiscal del emisor,
 * y todos los IDs de facturas ordenados por fecha para calcular el folio.
 *
 * El `folio` es la posición 1-indexed de esta factura en orden cronológico.
 * Se calcula aquí (no está almacenado en BD) y se pasa a PrintInvoice.
 *
 * `hasCfdiDownload`: true solo si tanto la factura tiene facturapi_id como
 * existe la API key en configuracion — garantiza que los botones PDF/XML
 * solo aparecen cuando el CFDI realmente fue timbrado.
 */
import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import PrintInvoice from "./PrintInvoice";

export const instant = false;

export default async function FacturaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await createServerClient();

  const [{ data: factura }, { data: cfg }, { data: allIds }] = await Promise.all([
    db.from("facturas").select("*, clients(id, name, company, email, rfc, nombre_fiscal, domicilio)").eq("id", id).single(),
    db.from("configuracion").select("nombre_emisor, nombre_comercial, rfc_emisor, regimen_fiscal, codigo_postal, domicilio_fiscal, facturapi_key").eq("id", "global").single(),
    db.from("facturas").select("id").order("created_at", { ascending: true }),
  ]);

  if (!factura) notFound();

  const folio = (allIds?.findIndex(f => f.id === id) ?? -1) + 1;

  return (
    <PrintInvoice
      factura={factura}
      folio={folio}
      emisor={{
        nombre: cfg?.nombre_comercial || cfg?.nombre_emisor || "Valhalla Studio",
        nombre_fiscal: cfg?.nombre_emisor ?? "",
        rfc: cfg?.rfc_emisor ?? "",
        regimen: cfg?.regimen_fiscal ?? "",
        cp: cfg?.codigo_postal ?? "",
        domicilio_fiscal: cfg?.domicilio_fiscal ?? "",
      }}
      hasCfdiDownload={!!factura.facturapi_id && !!cfg?.facturapi_key}
    />
  );
}
