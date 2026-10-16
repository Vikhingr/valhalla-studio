export const VALID_TAX_SYSTEMS = new Set([
  '601','603','605','606','607','608','610','611','612',
  '614','615','616','620','621','622','623','624','625','626',
]);

export function isPersonaMoral(rfc: string): boolean {
  const clean = rfc.replace(/\s/g, "");
  return clean.length === 12 && clean !== "XAXX010101000" && clean !== "XEXX010101000";
}

const GENERIC_RFCS = new Set(["XAXX010101000", "XEXX010101000"]);

export async function callFacturapi(facturaData: Record<string, unknown>, apiKey: string) {
  const withIva = (facturaData.iva as number) > 0;
  const ivaRetenido = (facturaData.iva_retenido as number) ?? 0;

  const taxes: { type: string; rate: number; withholding?: boolean }[] = [];
  if (withIva) taxes.push({ type: "IVA", rate: 0.16 });
  if (ivaRetenido > 0) taxes.push({ type: "IVA", rate: 0.16 * (2 / 3), withholding: true });

  const rfc = String(facturaData.receptor_rfc ?? "").trim().toUpperCase();
  const isGenericRfc = GENERIC_RFCS.has(rfc);

  const rawRegimen = String(facturaData.receptor_regimen ?? "");
  // RFC genérico (XAXX/XEXX) only accepts tax_system "616" per FacturAPI schema
  const taxSystem = isGenericRfc ? "616" : (VALID_TAX_SYSTEMS.has(rawRegimen) ? rawRegimen : "616");

  // RFC genérico must use S01 (Sin efectos fiscales) per SAT CFDI 4.0 rules
  const usoCfdi = isGenericRfc ? "S01" : String(facturaData.uso_cfdi ?? "G03");

  const payload = {
    customer: {
      legal_name: facturaData.receptor_nombre,
      tax_id: rfc,
      tax_system: taxSystem,
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
    use: usoCfdi,
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
    console.error("[FacturAPI] Error:", JSON.stringify(err));
    throw new Error((err as { message?: string }).message ?? `Facturapi ${res.status}`);
  }
  return res.json();
}
