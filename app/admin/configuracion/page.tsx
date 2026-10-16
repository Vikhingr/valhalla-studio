import { createServerClient } from "@/lib/supabase";
import ConfiguracionClient from "./ConfiguracionClient";

export const instant = false;

export default async function ConfiguracionPage() {
  const db = await createServerClient();
  const { data } = await db
    .from("configuracion")
    .select(
      "rfc_emisor, nombre_emisor, nombre_comercial, regimen_fiscal, codigo_postal, domicilio_fiscal, facturapi_mode, facturapi_key, cer_data, key_data, csd_password, updated_at, usos_cfdi_visibles, resico_alerta_1, resico_alerta_2, resico_alerta_3"
    )
    .eq("id", "global")
    .single();

  const safe = {
    rfc_emisor: data?.rfc_emisor ?? "",
    nombre_emisor: data?.nombre_emisor ?? "",
    nombre_comercial: data?.nombre_comercial ?? "",
    regimen_fiscal: data?.regimen_fiscal ?? "612",
    codigo_postal: data?.codigo_postal ?? "",
    domicilio_fiscal: data?.domicilio_fiscal ?? null,
    facturapi_mode: (data?.facturapi_mode ?? "test") as "test" | "live",
    has_facturapi_key: !!data?.facturapi_key,
    has_cer: !!data?.cer_data,
    has_key: !!data?.key_data,
    has_password: !!data?.csd_password,
    updated_at: data?.updated_at ?? null,
    usos_cfdi_visibles: data?.usos_cfdi_visibles ?? null,
    resico_alerta_1: data?.resico_alerta_1 ?? 5,
    resico_alerta_2: data?.resico_alerta_2 ?? 10,
    resico_alerta_3: data?.resico_alerta_3 ?? 15,
  };

  return <ConfiguracionClient initial={safe} />;
}
