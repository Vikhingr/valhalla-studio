/**
 * GET /api/admin/facturas/[id]/xml
 *
 * Proxy que obtiene el XML del CFDI timbrado desde FacturAPI y lo sirve como
 * descarga. El XML es el comprobante fiscal oficial (archivo .xml sellado SAT).
 * Mismo patrón que /pdf pero con Content-Type application/xml.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { decrypt } from "@/lib/encrypt";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const db = await createServerClient();

  const { data: factura } = await db
    .from("facturas")
    .select("facturapi_id")
    .eq("id", id)
    .single();

  if (!factura?.facturapi_id) {
    return NextResponse.json({ error: "Sin ID de Facturapi" }, { status: 404 });
  }

  const { data: config } = await db
    .from("configuracion")
    .select("facturapi_key")
    .eq("id", "global")
    .single();

  if (!config?.facturapi_key) {
    return NextResponse.json({ error: "Facturapi no configurado" }, { status: 400 });
  }

  const apiKey = await decrypt(config.facturapi_key);
  const res = await fetch(`https://www.facturapi.io/v2/invoices/${factura.facturapi_id}/xml`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) return NextResponse.json({ error: "Error al obtener XML de Facturapi" }, { status: 502 });

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/xml",
      "Content-Disposition": `attachment; filename="factura-${id}.xml"`,
    },
  });
}
