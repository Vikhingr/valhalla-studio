import { createServerClient } from "@/lib/supabase";
import ConfiguracionClient from "./ConfiguracionClient";

export const instant = false;

export default async function ConfiguracionPage() {
  const db = await createServerClient();
  const { data } = await db
    .from("configuracion")
    .select(
      "rfc_emisor, nombre_emisor, nombre_comercial, regimen_fiscal, codigo_postal, facturapi_mode, facturapi_key, cer_data, key_data, csd_password, updated_at"
    )
    .eq("id", "global")
    .single();

  const safe = {
    rfc_emisor: data?.rfc_emisor ?? "",
    nombre_emisor: data?.nombre_emisor ?? "",
    nombre_comercial: data?.nombre_comercial ?? "",
    regimen_fiscal: data?.regimen_fiscal ?? "612",
    codigo_postal: data?.codigo_postal ?? "",
    facturapi_mode: (data?.facturapi_mode ?? "test") as "test" | "live",
    has_facturapi_key: !!data?.facturapi_key,
    has_cer: !!data?.cer_data,
    has_key: !!data?.key_data,
    has_password: !!data?.csd_password,
    updated_at: data?.updated_at ?? null,
  };

  return <ConfiguracionClient initial={safe} />;
}
