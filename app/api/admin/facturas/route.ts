/**
 * GET/POST /api/admin/facturas
 *
 * GET  — lista todas las facturas con datos básicos del cliente (join).
 *        Ordenadas por created_at descendente.
 *
 * POST — crea una factura nueva. Flujo:
 *   1. Calcula IVA (16%) y retención de IVA si el receptor es Persona Moral
 *      (RFC de 12 chars → retiene 2/3 del IVA = 10.67%, Art. 1-A LIVA).
 *   2. Si FacturAPI está configurado, intenta timbrar el CFDI ante el SAT.
 *      - Éxito: tipo='cfdi', guarda UUID y datos del sello.
 *      - Error:  tipo='pdf' queda activo, guarda el mensaje de error.
 *   3. Si FacturAPI no está configurado, crea solo el registro (tipo='pdf').
 *
 * El campo `folio` no existe en la tabla — se calcula en el frontend por posición.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { decrypt } from "@/lib/encrypt";
import { callFacturapi, isPersonaMoral } from "@/lib/facturapi";

const SERVICIOS_MAP: Record<string, { clave_prod_serv: string; clave_unidad: string }> = {
  landing:        { clave_prod_serv: "81112103", clave_unidad: "E48" },
  sitio_web:      { clave_prod_serv: "81111509", clave_unidad: "E48" },
  app_web:        { clave_prod_serv: "81111509", clave_unidad: "E48" },
  app_movil:      { clave_prod_serv: "81111504", clave_unidad: "E48" },
  diseno_grafico: { clave_prod_serv: "82141504", clave_unidad: "E48" },
  automatizacion: { clave_prod_serv: "81111504", clave_unidad: "E48" },
  mantenimiento:  { clave_prod_serv: "81111509", clave_unidad: "E48" },
};

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
      facturaData.cfdi_sello = cfdi.stamp?.signature ?? null;
      facturaData.cfdi_sello_sat = cfdi.stamp?.sat_signature ?? null;
      facturaData.cfdi_fecha_timbrado = cfdi.stamp?.date ?? null;
      facturaData.cfdi_num_cert_sat = cfdi.stamp?.sat_cert_number ?? null;
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
