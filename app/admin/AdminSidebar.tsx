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
  Confetti,
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
  { href: "/admin/decoraciones",  label: "Decoraciones",  icon: Confetti },
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
        width: 232,
        minHeight: "100vh",
        background: "var(--surface)",
        // Hoja de cuaderno: margen rojo + renglones azules
        backgroundImage:
          "linear-gradient(90deg, transparent 26px, var(--margin-red) 26px, var(--margin-red) 28px, transparent 28px), repeating-linear-gradient(var(--surface) 0 37px, var(--rule-blue) 37px 38px)",
        borderRight: "2px solid var(--ink)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 12px 16px 36px",
          borderBottom: "2px solid var(--ink)",
          display: "flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            background: "var(--surface)",
            border: "2px solid var(--ink)",
            borderRadius: "var(--hand-radius)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-hand), cursive",
            fontSize: 24,
            fontWeight: 700,
            color: "var(--ink)",
            transform: "rotate(-4deg)",
            flexShrink: 0,
          }}
        >
          V
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-hand), cursive", fontSize: 23, fontWeight: 700, color: "var(--ink)", lineHeight: 1, whiteSpace: "nowrap" }}>
            Valhalla <span style={{ color: "var(--violet)" }}>Studio</span>
          </div>
          <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginTop: 3 }}>Oficina Virtual</div>
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
      <nav style={{ padding: "12px 10px 12px 34px", flex: 1 }}>
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
                padding: "6px 10px",
                minHeight: 38,
                borderRadius: "var(--hand-radius)",
                border: active ? "2px solid var(--violet)" : "2px solid transparent",
                fontSize: 15,
                fontWeight: active ? 700 : 400,
                color: active ? "var(--violet)" : "var(--ink-2)",
                background: active ? "rgba(42,91,215,0.08)" : "transparent",
                textDecoration: "none",
                marginBottom: 0,
                transform: active ? "rotate(-1deg)" : "none",
                transition: "background 0.15s, color 0.15s, transform 0.1s, opacity 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "var(--ink)";
                  e.currentTarget.style.color = "var(--ink)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.color = "var(--ink-2)";
                }
              }}
            >
              <Icon size={18} weight={active ? "bold" : "regular"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "10px 10px 14px 34px", borderTop: "2px solid var(--ink)" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "6px 10px",
            borderRadius: "var(--hand-radius)",
            fontSize: 15,
            fontWeight: 400,
            fontFamily: "inherit",
            color: "var(--muted)",
            background: "transparent",
            border: "2px solid transparent",
            cursor: "pointer",
            width: "100%",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "oklch(0.52 0.16 25)";
            e.currentTarget.style.color = "oklch(0.52 0.16 25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "transparent";
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
          box-shadow: 6px 0 0 rgba(42,42,46,0.12);
          padding-top: env(safe-area-inset-top, 0px);
        }
        .adm-sidebar--open { transform: translateX(0) !important; }
        .adm-sidebar-close { display: flex !important; }
      }
    `}</style>
    </>
  );
}
