import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { decrypt } from "@/lib/encrypt";

const SERVICIOS_MAP: Record<string, { clave_prod_serv: string; clave_unidad: string }> = {
  landing:        { clave_prod_serv: "81112103", clave_unidad: "E48" },
  sitio_web:      { clave_prod_serv: "81111509", clave_unidad: "E48" },
  app_web:        { clave_prod_serv: "81111509", clave_unidad: "E48" },
  app_movil:      { clave_prod_serv: "81111504", clave_unidad: "E48" },
  diseno_grafico: { clave_prod_serv: "82141504", clave_unidad: "E48" },
  automatizacion: { clave_prod_serv: "81111504", clave_unidad: "E48" },
  mantenimiento:  { clave_prod_serv: "81111509", clave_unidad: "E48" },
};

// RFC de 12 caracteres = Persona Moral (retiene IVA al emisor RESICO)
function isPersonaMoral(rfc: string): boolean {
  const clean = rfc.replace(/\s/g, "");
  return clean.length === 12 && clean !== "XAXX010101000" && clean !== "XEXX010101000";
}

async function callFacturapi(facturaData: Record<string, unknown>, apiKey: string) {
  const withIva = (facturaData.iva as number) > 0;
  const ivaRetenido = (facturaData.iva_retenido as number) ?? 0;

  const taxes: { type: string; rate: number; withholding?: boolean }[] = [];
  if (withIva) taxes.push({ type: "IVA", rate: 0.16 });
  if (ivaRetenido > 0) taxes.push({ type: "IVA", rate: 0.16 * (2 / 3), withholding: true });

  const payload = {
    customer: {
      legal_name: facturaData.receptor_nombre,
      tax_id: facturaData.receptor_rfc,
      tax_system: facturaData.receptor_regimen,
      address: { zip: facturaData.receptor_cp },
    },
    items: [
      {
        quantity: 1,
        product: {
          description: facturaData.descripcion,
          product_key: facturaData.clave_prod_serv ?? "81112103",
          unit_key: facturaData.clave_unidad ?? "E48",
          price: facturaData.subtotal,
          tax_included: false,
          taxes,
        },
      },
    ],
    use: facturaData.uso_cfdi,
    payment_form: facturaData.forma_pago,
  };

  const res = await fetch("https://www.facturapi.io/v2/invoices", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Facturapi ${res.status}`);
  }
  return res.json();
}

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  const db = await createServerClient();
  const { data, error } = await db
    .from("facturas")
    .select("*, clients(id, name, company)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = await req.json();
  if (!body.receptor_nombre?.trim() || !body.descripcion?.trim()) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const db = await createServerClient();
  const { data: config } = await db
    .from("configuracion")
    .select("facturapi_key, facturapi_mode")
    .eq("id", "global")
    .single();

  const subtotal = Math.round(Number(body.subtotal) * 100) / 100;
  const iva = body.with_iva ? Math.round(subtotal * 0.16 * 100) / 100 : 0;

  const rfc = (body.receptor_rfc || "XAXX010101000").trim().toUpperCase();
  const ivaRetenido = iva > 0 && isPersonaMoral(rfc)
    ? Math.round(subtotal * 0.16 * (2 / 3) * 100) / 100
    : 0;

  const servicio = SERVICIOS_MAP[body.tipo_servicio] ?? SERVICIOS_MAP.landing;
  const total = subtotal + iva - ivaRetenido;

  const facturaData: Record<string, unknown> = {
    tipo: "pdf",
    status: "activa",
    client_id: body.client_id || null,
    project_id: body.project_id || null,
    cotizacion_id: body.cotizacion_id || null,
    receptor_rfc: rfc,
    receptor_nombre: body.receptor_nombre.trim(),
    receptor_regimen: body.receptor_regimen || "616",
    receptor_cp: body.receptor_cp || "00000",
    uso_cfdi: body.uso_cfdi || "G03",
    forma_pago: body.forma_pago || "99",
    descripcion: body.descripcion.trim(),
    subtotal,
    iva,
    iva_retenido: ivaRetenido,
    isr_retenido: 0,
    total,
    clave_prod_serv: servicio.clave_prod_serv,
    clave_unidad: servicio.clave_unidad,
    fecha: body.fecha || new Date().toISOString().split("T")[0],
  };

  // Attempt CFDI via Facturapi if key is configured
  if (config?.facturapi_key) {
    try {
      const apiKey = await decrypt(config.facturapi_key);
      const cfdi = await callFacturapi(facturaData, apiKey);
      facturaData.tipo = "cfdi";
      facturaData.cfdi_uuid = cfdi.uuid ?? null;
      facturaData.facturapi_id = cfdi.id ?? null;
    } catch (err) {
      facturaData.facturapi_error = err instanceof Error ? err.message : String(err);
    }
  }

  const { data, error } = await db
    .from("facturas")
    .insert(facturaData)
    .select("*, clients(id, name, company)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
