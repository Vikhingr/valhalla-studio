"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { List } from "@phosphor-icons/react";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div style={{ display: "flex", minHeight: "100dvh", background: "var(--bg)" }}>
      {/* Overlay mobile */}
      <div
        className={`adm-overlay${open ? " adm-overlay--on" : ""}`}
        onClick={() => setOpen(false)}
      />

      <AdminSidebar open={open} onClose={() => setOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar — solo visible en mobile */}
        <div className="adm-topbar">
          <button
            aria-label="Abrir menú"
            onClick={() => setOpen(true)}
            style={{ background: "none", border: "none", color: "var(--ink)", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", borderRadius: 6 }}
          >
            <List size={22} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, background: "var(--violet)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>V</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
              Valhalla<span style={{ color: "var(--violet-light)" }}>Studio</span>
            </span>
          </div>
        </div>

        <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          {children}
        </main>
      </div>

      <style>{`
        .adm-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          z-index: 199;
          backdrop-filter: blur(2px);
        }
        .adm-topbar {
          display: none;
          align-items: center;
          gap: 12px;
          padding: 11px 16px;
          padding-top: calc(11px + env(safe-area-inset-top, 0px));
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
          flex-shrink: 0;
        }
        .adm-topbar button:active { opacity: 0.6; transform: scale(0.92); transition: transform 100ms, opacity 100ms; }
        @media (max-width: 768px) {
          .adm-overlay--on { display: block; }
          .adm-topbar { display: flex; }
        }
      `}</style>
    </div>
  );
}
