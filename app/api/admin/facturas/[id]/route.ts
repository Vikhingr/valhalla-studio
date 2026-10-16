import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { decrypt } from "@/lib/encrypt";
import { callFacturapi } from "@/lib/facturapi";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const db = await createServerClient();
  const { data, error } = await db
    .from("facturas")
    .select("*, clients(id, name, company, rfc, nombre_fiscal)")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  const body = await req.json();
  const db = await createServerClient();

  if (body.action === "retry_timbrado") {
    const { data: factura, error: fetchErr } = await db
      .from("facturas")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchErr || !factura) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    if (factura.tipo === "cfdi") return NextResponse.json({ error: "La factura ya fue timbrada" }, { status: 400 });

    const { data: config } = await db
      .from("configuracion")
      .select("facturapi_key")
      .eq("id", "global")
      .single();
    if (!config?.facturapi_key) return NextResponse.json({ error: "FacturAPI no configurado" }, { status: 400 });

    let updateData: Record<string, unknown>;
    try {
      const apiKey = await decrypt(config.facturapi_key);
      const cfdi = await callFacturapi(factura as Record<string, unknown>, apiKey);
      updateData = {
        tipo: "cfdi",
        facturapi_id: cfdi.id ?? null,
        cfdi_uuid: cfdi.uuid ?? null,
        cfdi_sello: cfdi.stamp?.signature ?? null,
        cfdi_sello_sat: cfdi.stamp?.sat_signature ?? null,
        cfdi_fecha_timbrado: cfdi.stamp?.date ?? null,
        cfdi_num_cert_sat: cfdi.stamp?.sat_cert_number ?? null,
        facturapi_error: null,
      };
    } catch (err) {
      updateData = { facturapi_error: err instanceof Error ? err.message : String(err) };
    }

    const { data, error } = await db
      .from("facturas")
      .update(updateData)
      .eq("id", id)
      .select("*, clients(id, name, company)")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (body.status !== "cancelada") {
    return NextResponse.json({ error: "Acción no permitida" }, { status: 400 });
  }

  const { data: factura, error: fetchErr } = await db
    .from("facturas")
    .select("tipo, facturapi_id, status")
    .eq("id", id)
    .single();
  if (fetchErr || !factura) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  if (factura.status === "cancelada") return NextResponse.json({ error: "La factura ya está cancelada" }, { status: 400 });

  // Para CFDI con facturapi_id: cancelar ante el SAT vía FacturAPI
  if (factura.tipo === "cfdi" && factura.facturapi_id) {
    const { data: config } = await db
      .from("configuracion")
      .select("facturapi_key")
      .eq("id", "global")
      .single();
    if (!config?.facturapi_key) return NextResponse.json({ error: "FacturAPI no configurado" }, { status: 400 });

    try {
      const apiKey = await decrypt(config.facturapi_key);
      const motive = (body.motive as string) ?? "02";
      const url = `https://www.facturapi.io/v2/invoices/${factura.facturapi_id}?motive=${motive}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: (err as { message?: string }).message ?? `FacturAPI ${res.status}` },
          { status: 400 }
        );
      }
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
  }

  const { data, error } = await db
    .from("facturas")
    .update({ status: "cancelada" })
    .eq("id", id)
    .select("*, clients(id, name, company)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

