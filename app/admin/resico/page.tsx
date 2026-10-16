/**
 * ResicоPage — Página del módulo fiscal RESICO (Art. 113-E LISR).
 *
 * Usa ResicоLoader como wrapper que importa ResicоClient con `dynamic({ ssr: false })`.
 * Esto es necesario porque ResicоClient lee cookies en el cliente para llamadas a la API,
 * lo que no es compatible con SSR sin lógica extra.
 *
 * El nombre "Resicо" usa una "о" cirílica por compatibilidad con el sistema de archivos
 * de Windows — no se puede renombrar sin romper el git history.
 */
import ResicоLoader from "./ResicоLoader";

export const instant = false;
export const metadata = { title: "RESICO — Valhalla Studio" };

export default function ResicоPage() {
  return <ResicоLoader />;
}
