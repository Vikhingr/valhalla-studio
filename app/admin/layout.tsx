import AdminShell from "./AdminShell";

export const metadata = {
  title: "Oficina Virtual — Valhalla Studio",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
