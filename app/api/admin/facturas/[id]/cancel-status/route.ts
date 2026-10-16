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
    .select("facturapi_id, tipo, status")
    .eq("id", id)
    .single();

  if (!factura?.facturapi_id || factura.tipo !== "cfdi") {
    return NextResponse.json({ error: "No aplica" }, { status: 400 });
  }

  const { data: config } = await db
    .from("configuracion")
    .select("facturapi_key")
    .eq("id", "global")
    .single();

  if (!config?.facturapi_key) {
    return NextResponse.json({ error: "FacturAPI no configurado" }, { status: 400 });
  }

  const apiKey = await decrypt(config.facturapi_key);
  const res = await fetch(`https://www.facturapi.io/v2/invoices/${factura.facturapi_id}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: (err as { message?: string }).message ?? `FacturAPI ${res.status}` },
      { status: 400 }
    );
  }

  const data = await res.json();
  return NextResponse.json({ cancellation_status: data.cancellation_status ?? "none" });
}
