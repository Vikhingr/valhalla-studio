/** Redirige /admin → /admin/dashboard para evitar una página vacía. */
import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/dashboard");
}
