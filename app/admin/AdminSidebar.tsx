"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  Users,
  Briefcase,
  CheckSquare,
  Calculator,
  SignOut,
} from "@phosphor-icons/react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard",   icon: SquaresFour },
  { href: "/admin/clientes",  label: "Clientes",     icon: Users },
  { href: "/admin/proyectos", label: "Proyectos",    icon: Briefcase },
  { href: "/admin/pendientes",label: "Pendientes",   icon: CheckSquare },
  { href: "/admin/cotizador", label: "Cotizador",    icon: Calculator },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px 18px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            background: "var(--violet)",
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          V
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            Valhalla<span style={{ color: "var(--violet-light)" }}>Studio</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>Oficina Virtual</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "10px 8px", flex: 1 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "9px 10px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? "#fff" : "var(--ink-2)",
                background: active ? "var(--violet)" : "transparent",
                textDecoration: "none",
                marginBottom: 2,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--surface-2)";
                  e.currentTarget.style.color = "var(--ink)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--ink-2)";
                }
              }}
            >
              <Icon size={16} weight={active ? "fill" : "regular"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "9px 10px",
            borderRadius: 7,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--muted)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            width: "100%",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "oklch(0.25 0.06 25 / 0.3)";
            e.currentTarget.style.color = "oklch(0.75 0.14 25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--muted)";
          }}
        >
          <SignOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
