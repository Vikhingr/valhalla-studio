import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import PrintInvoice from "./PrintInvoice";

export const instant = false;

export default async function FacturaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await createServerClient();

  const [{ data: factura }, { data: cfg }] = await Promise.all([
    db.from("facturas").select("*, clients(id, name, company, email, rfc, nombre_fiscal, domicilio)").eq("id", id).single(),
    db.from("configuracion").select("nombre_emisor, nombre_comercial, rfc_emisor, regimen_fiscal, codigo_postal, domicilio_fiscal, facturapi_key").eq("id", "global").single(),
  ]);

  if (!factura) notFound();

  return (
    <PrintInvoice
      factura={factura}
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
