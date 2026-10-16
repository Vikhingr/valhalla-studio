/**
 * CotizacionesPage — Thin wrapper del módulo de cotizaciones.
 * Todo el estado y fetching está en CotizacionesClient (Client Component).
 */
import CotizacionesClient from "./CotizacionesClient";

export const instant = false;

export default function CotizacionesPage() {
  return <CotizacionesClient />;
}
