/**
 * Navbar — Barra de navegación fija del sitio público.
 *
 * Comportamiento:
 *   - En desktop: muestra links de anclas + botón CTA.
 *   - En móvil: muestra hamburger que despliega un menú vertical.
 *   - Al hacer scroll > 40px, agrega fondo semitransparente con blur (efecto glassmorphism).
 *
 * Todos los links son anclas (#inicio, #sobre-mi…) — el sitio es una SPA de una sola página.
 * El menú móvil se cierra automáticamente al seleccionar un link.
 */
"use client";
import { useState, useEffect } from "react";
import { List, X } from "@phosphor-icons/react";

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#sobre-mi", label: "Sobre mí" },
  { href: "#proyectos", label: "Proyectos" },
  { href: "#servicios", label: "Servicios" },
  { href: "#contacto", label: "Contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: scrolled ? "oklch(0.10 0.010 280 / 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-subtle)" : "none",
        transition: "background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease",
        viewTransitionName: "site-header",
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a href="#inicio" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--violet)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 800,
              color: "white",
              flexShrink: 0,
            }}
          >
            V
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)", letterSpacing: "-0.02em" }}>
            Valhalla<span style={{ color: "var(--violet-light)" }}>Studio</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="nav-links" style={{ listStyle: "none", display: "none", alignItems: "center", gap: 32 }}>
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="nav-link"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a href="#contacto" className="btn-primary nav-cta" style={{ padding: "9px 20px", fontSize: 13, display: "none" }}>
          Hablemos
        </a>

        {/* Mobile toggle */}
        <button
          className="nav-burger"
          onClick={() => setOpen(!open)}
          style={{ background: "none", border: "none", color: "var(--ink-2)", cursor: "pointer", padding: 4, display: "flex" }}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="nav-mobile-menu"
        >
          {open ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
        </button>
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .nav-links { display: flex !important; }
          .nav-cta { display: inline-flex !important; }
          .nav-burger { display: none !important; }
        }
        .nav-link {
          color: var(--muted);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.15s;
        }
        .nav-mobile-link {
          display: block;
          padding: 12px 0;
          font-size: 15px;
          border-bottom: 1px solid var(--border-subtle);
        }
        @media (hover: hover) and (pointer: fine) {
          .nav-link:hover { color: var(--ink); }
        }
      `}</style>

      {/* Mobile menu */}
      {open && (
        <div
          id="nav-mobile-menu"
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--border-subtle)",
            padding: "16px 24px 24px",
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="nav-link nav-mobile-link"
            >
              {l.label}
            </a>
          ))}
          <a href="#contacto" className="btn-primary" style={{ marginTop: 16, width: "100%", justifyContent: "center" }} onClick={() => setOpen(false)}>
            Hablemos
          </a>
        </div>
      )}
    </header>
  );
}
