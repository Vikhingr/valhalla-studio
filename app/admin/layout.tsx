/**
 * AdminLayout — Layout raíz del panel de administración.
 *
 * Envuelve todos los children de /admin/* con AdminShell,
 * que provee la topbar, el drawer lateral y el cuerpo con scroll.
 * La ruta /admin/login también pasa por aquí pero AdminShell
 * omite el drawer cuando está en esa ruta.
 */
import AdminShell from "./AdminShell";

export const metadata = {
  title: "Oficina Virtual — Valhalla Studio",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
