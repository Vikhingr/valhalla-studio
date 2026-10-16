/**
 * AdminSidebar — Barra de navegación lateral del panel admin.
 *
 * En escritorio es un panel fijo a la izquierda (siempre visible).
 * En móvil se convierte en un drawer que entra desde la izquierda:
 *   - Controlado por la prop `open` desde AdminShell.
 *   - Easing iOS cubic-bezier(0.32, 0.72, 0, 1) para sensación nativa.
 *   - safe-area-inset-top para respetar el notch / Dynamic Island.
 *   - Botón de cerrar (X) visible solo en móvil.
 *
 * El link activo se detecta por coincidencia exacta (dashboard) o prefijo
 * (cualquier subruta, ej. /admin/clientes/123 activa "Clientes").
 *
 * Logout: llama a /api/admin/logout, luego redirige a /admin/login.
 */
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  Users,
  Briefcase,
  CheckSquare,
  Calculator,
  Receipt,
  FilePdf,
  Gear,
  SignOut,
  ChartBar,
  X,
} from "@phosphor-icons/react";

const NAV = [
  { href: "/admin/dashboard",     label: "Dashboard",     icon: SquaresFour },
  { href: "/admin/clientes",      label: "Clientes",      icon: Users },
  { href: "/admin/proyectos",     label: "Proyectos",     icon: Briefcase },
  { href: "/admin/pendientes",    label: "Pendientes",    icon: CheckSquare },
  { href: "/admin/cotizaciones",  label: "Cotizaciones",  icon: Receipt },
  { href: "/admin/cotizador",     label: "Cotizador",     icon: Calculator },
  { href: "/admin/facturas",      label: "Facturas",      icon: FilePdf },
  { href: "/admin/resico",        label: "RESICO",        icon: ChartBar },
  { href: "/admin/configuracion", label: "Configuración", icon: Gear },
];

export default function AdminSidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
    <aside
      className={`adm-sidebar${open ? " adm-sidebar--open" : ""}`}
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
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            Valhalla<span style={{ color: "var(--violet-light)" }}>Studio</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>Oficina Virtual</div>
        </div>
        {/* Botón cerrar — solo mobile */}
        <button
          className="adm-sidebar-close"
          onClick={onClose}
          aria-label="Cerrar menú"
          style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4, display: "none", flexShrink: 0 }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: "10px 8px", flex: 1 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="adm-nav-link"
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
                transition: "background 0.15s, color 0.15s, transform 0.1s, opacity 0.1s",
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

    <style>{`
      .adm-sidebar { transition: transform 0.3s cubic-bezier(0.32,0.72,0,1); }
      .adm-sidebar-close:active { opacity: 0.6; transform: scale(0.9); }
      .adm-nav-link:active { opacity: 0.7; transform: scale(0.97); }
      @media (max-width: 768px) {
        .adm-sidebar {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          height: 100dvh !important;
          min-height: 100dvh !important;
          z-index: 200 !important;
          transform: translateX(-100%);
          box-shadow: 4px 0 32px rgba(0,0,0,0.4);
          padding-top: env(safe-area-inset-top, 0px);
        }
        .adm-sidebar--open { transform: translateX(0) !important; }
        .adm-sidebar-close { display: flex !important; }
      }
    `}</style>
    </>
  );
}
