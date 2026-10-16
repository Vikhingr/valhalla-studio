/**
 * FacturasPage — Server Component que carga facturas, clientes y config fiscal.
 *
 * Las tres queries corren en paralelo. Le pasa a FacturasClient:
 *   - `facturapiconfigured`: si hay API key → habilita el botón "Timbrar CFDI".
 *   - `emisorNombre`: se muestra en la vista previa antes de timbrar.
 *   - `usosCfdiVisibles`: array de claves SAT permitidas en el selector (o null = todas).
 */
import { createServerClient } from "@/lib/supabase";
import FacturasClient from "./FacturasClient";

export const instant = false;

export default async function FacturasPage() {
  const db = await createServerClient();
  const [{ data: facturas }, { data: clients }, { data: cfg }] = await Promise.all([
    db
      .from("facturas")
      .select("*, clients(id, name, company)")
      .order("created_at", { ascending: false }),
    db.from("clients").select("id, name, company, rfc, nombre_fiscal, regimen_fiscal, codigo_postal").order("name"),
    db.from("configuracion").select("facturapi_key, nombre_emisor, usos_cfdi_visibles").eq("id", "global").single(),
  ]);

  return (
    <FacturasClient
      initial={facturas ?? []}
      clients={clients ?? []}
      facturapiconfigured={!!cfg?.facturapi_key}
      emisorNombre={cfg?.nombre_emisor ?? "Valhalla Studio"}
      usosCfdiVisibles={cfg?.usos_cfdi_visibles ?? null}
    />
  );
}
