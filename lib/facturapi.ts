/**
 * lib/facturapi.ts — Integración con FacturAPI v2 para timbrado de CFDI 4.0.
 *
 * FacturAPI es el intermediario entre Valhalla Studio y el SAT. Recibe los datos
 * de la factura, genera el XML, lo firma con el CSD y regresa el UUID del CFDI.
 *
 * Reglas fiscales SAT que aplica este módulo:
 *  - RFC de 12 caracteres = Persona Moral → retención de IVA (2/3 del 16% = 10.67%)
 *  - RFC genérico (XAXX010101000 o XEXX010101000) → régimen fiscal "616" y uso "S01"
 *    obligatorios por esquema CFDI 4.0 del SAT
 *  - Régimen fiscal inválido → fallback a "616" (Sin obligaciones fiscales)
 */

/** Regímenes fiscales válidos según el catálogo SAT c_RegimenFiscal */
export const VALID_TAX_SYSTEMS = new Set([
  '601','603','605','606','607','608','610','611','612',
  '614','615','616','620','621','622','623','624','625','626',
]);

/**
 * Determina si un RFC pertenece a una Persona Moral.
 * RFC de 12 caracteres = Persona Moral (8 letras + 6 dígitos).
 * RFC de 13 caracteres = Persona Física (4 letras + 6 dígitos + 3 homoclave).
 * Los RFC genéricos se excluyen aunque tengan 12 caracteres.
 */
export function isPersonaMoral(rfc: string): boolean {
  const clean = rfc.replace(/\s/g, "");
  return clean.length === 12 && clean !== "XAXX010101000" && clean !== "XEXX010101000";
}

/** RFC genérico para público en general (nacional y extranjero) */
const GENERIC_RFCS = new Set(["XAXX010101000", "XEXX010101000"]);

/**
 * Envía una factura a FacturAPI para su timbrado ante el SAT.
 * Construye el payload CFDI 4.0 con los impuestos correctos y lanza un error
 * si FacturAPI responde con un código de error.
 *
 * @param facturaData - Datos de la factura almacenados en Supabase
 * @param apiKey      - Clave de FacturAPI ya descifrada (modo test o live)
 * @returns Objeto JSON de FacturAPI con uuid, id, stamp, etc.
 * @throws Error con el mensaje de FacturAPI si el timbrado falla
 */
export async function callFacturapi(facturaData: Record<string, unknown>, apiKey: string) {
  const withIva      = (facturaData.iva as number) > 0;
  const ivaRetenido  = (facturaData.iva_retenido as number) ?? 0;

  // Construir array de impuestos: IVA trasladado y, si aplica, IVA retenido
  const taxes: { type: string; rate: number; withholding?: boolean }[] = [];
  if (withIva) taxes.push({ type: "IVA", rate: 0.16 });
  // Retención = 2/3 del 16% para Persona Moral (Art. 1-A LIVA)
  if (ivaRetenido > 0) taxes.push({ type: "IVA", rate: 0.16 * (2 / 3), withholding: true });

  const rfc          = String(facturaData.receptor_rfc ?? "").trim().toUpperCase();
  const isGenericRfc = GENERIC_RFCS.has(rfc);

  const rawRegimen = String(facturaData.receptor_regimen ?? "");
  // RFC genérico solo acepta régimen "616"; RFC válido usa el régimen del receptor
  const taxSystem = isGenericRfc
    ? "616"
    : (VALID_TAX_SYSTEMS.has(rawRegimen) ? rawRegimen : "616");

  // RFC genérico usa "S01" (Sin efectos fiscales); obligatorio por validación SAT CFDI 4.0
  const usoCfdi = isGenericRfc ? "S01" : String(facturaData.uso_cfdi ?? "G03");

  const payload = {
    customer: {
      legal_name: facturaData.receptor_nombre,
      tax_id:     rfc,
      tax_system: taxSystem,
      address: { zip: facturaData.receptor_cp },
    },
    items: [
      {
        quantity: 1,
        product: {
          description: facturaData.descripcion,
          product_key: facturaData.clave_prod_serv ?? "81112103",  // clave SAT del servicio
          unit_key:    facturaData.clave_unidad    ?? "E48",       // E48 = Unidad de servicio
          price:       facturaData.subtotal,
          tax_included: false,
          taxes,
        },
      },
    ],
    use:          usoCfdi,
    payment_form: facturaData.forma_pago,
  };

  const res = await fetch("https://www.facturapi.io/v2/invoices", {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${apiKey}`,
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
