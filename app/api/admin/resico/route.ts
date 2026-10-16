/**
 * GET/POST /api/admin/resico
 *
 * Módulo de estimación fiscal mensual para el Régimen Simplificado de Confianza
 * (RESICO, Art. 113-E LISR), aplicable a personas físicas con ingresos ≤ 3.5 M MXN/año.
 *
 * GET ?mes=N&año=YYYY — calcula y retorna:
 *   - ingresos: facturas activas del mes (base ISR + IVA cobrado)
 *   - isr_estimado: ISR según tabla por tramos del Art. 113-E LISR (actualizada 2025)
 *   - gastos: CFDIs de egresos del mes (tabla gastos_resico)
 *   - iva_neto: IVA a pagar = IVA cobrado − IVA acreditable de gastos (mínimo 0)
 *
 * POST — registra un gasto con IVA acreditable a partir de un CFDI XML parseado
 *        en el cliente. El CFDI UUID tiene restricción UNIQUE en la tabla.
 *
 * Nota: calcISR se exporta para que los tests puedan verificar los tramos.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export const instant = false;

// RESICO ISR table (Art. 113-E LISR) — monthly income brackets
const RESICO_TABLE = [
  { max: 25_000,    rate: 0.010 },
  { max: 50_000,    rate: 0.011 },
  { max: 83_333,    rate: 0.015 },
  { max: 166_667,   rate: 0.020 },
  { max: 291_667,   rate: 0.025 },
  { max: Infinity,  rate: 0.025 },
];

export function calcISR(ingreso: number): { tasa: number; isr: number } {
  const bracket = RESICO_TABLE.find((b) => ingreso <= b.max) ?? RESICO_TABLE[RESICO_TABLE.length - 1];
  return { tasa: bracket.rate, isr: Math.round(ingreso * bracket.rate * 100) / 100 };
}

export async function GET(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const mes = parseInt(searchParams.get("mes") ?? "0");
  const año = parseInt(searchParams.get("año") ?? "0");

  if (!mes || !año) return NextResponse.json({ error: "mes y año requeridos" }, { status: 400 });

  const db = await createServerClient();

  // Facturas activas del mes (base ISR + IVA cobrado)
  const desde = `${año}-${String(mes).padStart(2, "0")}-01`;
  const hasta = new Date(año, mes, 0).toISOString().slice(0, 10); // último día del mes

  const { data: facturas } = await db
    .from("facturas")
    .select("id, fecha, receptor_nombre, descripcion, subtotal, iva, iva_retenido, total, tipo, status")
    .neq("status", "cancelada")
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .order("fecha");

  const ingresos = facturas ?? [];
  const subtotal_ingresos = ingresos.reduce((s, f) => s + (f.subtotal ?? 0), 0);
  const iva_cobrado = ingresos.reduce((s, f) => s + (f.iva ?? 0), 0);
  const { tasa, isr } = calcISR(subtotal_ingresos);

  // Gastos con IVA acreditable del mes
  const { data: gastos } = await db
    .from("gastos_resico")
    .select("*")
    .eq("mes", mes)
    .eq("año", año)
    .order("fecha");

  const gastosData = gastos ?? [];
  const iva_acreditable = gastosData.reduce((s, g) => s + (g.iva ?? 0), 0);
  const iva_neto = Math.max(0, Math.round((iva_cobrado - iva_acreditable) * 100) / 100);

  return NextResponse.json({
    mes, año,
    ingresos,
    subtotal_ingresos: Math.round(subtotal_ingresos * 100) / 100,
    iva_cobrado: Math.round(iva_cobrado * 100) / 100,
    tasa_isr: tasa,
    isr_estimado: isr,
    gastos: gastosData,
    iva_acreditable: Math.round(iva_acreditable * 100) / 100,
    iva_neto,
  });
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const body = await req.json();
  const { mes, año, fecha, emisor_nombre, emisor_rfc, concepto, subtotal, iva, total, cfdi_uuid } = body;

  if (!cfdi_uuid || !emisor_rfc || !fecha) {
    return NextResponse.json({ error: "Datos incompletos del CFDI" }, { status: 400 });
  }

  const db = await createServerClient();
  const { data, error } = await db
    .from("gastos_resico")
    .insert({ mes, año, fecha, emisor_nombre, emisor_rfc, concepto, subtotal, iva, total, cfdi_uuid })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Este CFDI ya fue registrado" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
