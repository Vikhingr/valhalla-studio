/**
 * GET/PUT /api/admin/configuracion
 *
 * Gestiona la configuración fiscal del emisor (fila única con id='global').
 *
 * GET — retorna campos fiscales visibles más booleanos has_* para datos sensibles.
 *       Los valores cifrados (facturapi_key, CSD) NUNCA se devuelven al cliente;
 *       solo se indica si existen o no.
 *
 * PUT — actualiza solo los campos presentes en el body. Los campos sensibles
 *       (facturapi_key, csd_password, cer_data, key_data) se cifran con AES-256
 *       antes de guardarse. Los campos ausentes del body no se tocan.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { encrypt } from "@/lib/encrypt";

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  const db = await createServerClient();
  const { data, error } = await db
    .from("configuracion")
    .select("*")
    .eq("id", "global")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Exponer presencia de datos sensibles sin exponer los valores
  return NextResponse.json({
    rfc_emisor:        data.rfc_emisor,
    nombre_emisor:     data.nombre_emisor,
    nombre_comercial:  data.nombre_comercial,
    regimen_fiscal:    data.regimen_fiscal,
    codigo_postal:     data.codigo_postal,
    domicilio_fiscal:  data.domicilio_fiscal ?? null,
    facturapi_mode:    data.facturapi_mode ?? "test",
    has_facturapi_key: !!data.facturapi_key,
    has_cer:           !!data.cer_data,
    has_key:           !!data.key_data,
    has_password:      !!data.csd_password,
    updated_at:        data.updated_at,
    usos_cfdi_visibles: data.usos_cfdi_visibles ?? null,
    // Días de aviso antes del vencimiento RESICO (default SAT: 5, 10, 15 días)
    resico_alerta_1: data.resico_alerta_1 ?? 5,
    resico_alerta_2: data.resico_alerta_2 ?? 10,
    resico_alerta_3: data.resico_alerta_3 ?? 15,
  });
}

export async function PUT(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = await req.json();
  const db   = await createServerClient();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  // Campos fiscales de texto plano — null si llegan vacíos
  const plain = ["rfc_emisor", "nombre_emisor", "nombre_comercial", "regimen_fiscal", "codigo_postal", "domicilio_fiscal", "facturapi_mode"] as const;
  for (const f of plain) {
    if (body[f] !== undefined) update[f] = body[f] || null;
  }
  if (body.facturapi_mode) update.facturapi_mode = body.facturapi_mode;

  // Umbrales de alerta RESICO en días
  if (body.resico_alerta_1 !== undefined) update.resico_alerta_1 = Number(body.resico_alerta_1) || 5;
  if (body.resico_alerta_2 !== undefined) update.resico_alerta_2 = Number(body.resico_alerta_2) || 10;
  if (body.resico_alerta_3 !== undefined) update.resico_alerta_3 = Number(body.resico_alerta_3) || 15;

  // Array de usos CFDI visibles en el formulario de factura; null = mostrar todos
  if (body.usos_cfdi_visibles !== undefined) {
    update.usos_cfdi_visibles = Array.isArray(body.usos_cfdi_visibles) && body.usos_cfdi_visibles.length > 0
      ? body.usos_cfdi_visibles
      : null;
  }

  // Campos sensibles: cifrar antes de guardar (solo si se envían en el body)
  if (body.facturapi_key) update.facturapi_key = await encrypt(body.facturapi_key);
  if (body.csd_password)  update.csd_password  = await encrypt(body.csd_password);
  if (body.cer_data)      update.cer_data       = await encrypt(body.cer_data);
  if (body.key_data)      update.key_data       = await encrypt(body.key_data);

  const { error } = await db
    .from("configuracion")
    .update(update)
    .eq("id", "global");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
