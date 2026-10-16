/**
 * Projects — Sección de portafolio del sitio público.
 *
 * Estructura:
 *   - Proyecto destacado (Pepe's) en tarjeta hero con grid 50/50.
 *   - Resto de proyectos en grid de tarjetas 280px+.
 *   - Al hacer clic en cualquier tarjeta abre un Modal con galería de capturas.
 *   - El Modal tiene navegación por flechas (teclado/botones) y un Lightbox
 *     que muestra la imagen a pantalla completa con botón cerrar y contador.
 *
 * Todos los proyectos están definidos como constante en el mismo archivo.
 * Para agregar un nuevo proyecto: añadir una entrada a `projects[]` y subir
 * las imágenes a /public/projects/.
 */
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowUpRight, X, CaretLeft, CaretRight, MagnifyingGlassPlus } from "@phosphor-icons/react";

type Project = {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  url: string;
  img: string;
  screenshots: string[];
  featured: boolean;
};

const projects: Project[] = [
  {
    id: "pepes",
    title: "Pepe's Barber Shop",
    desc: "Sitio web completo para una barbería premium en Narvarte Poniente, CDMX. Sistema de reservas en línea, catálogo de servicios y horarios en tiempo real.",
    tags: ["Sitio Web", "Reservas Online", "Diseño de Marca"],
    url: "https://pepesbarbershop.com.mx/",
    img: "/projects/pepes-inicio.png",
    screenshots: [
      "/projects/pepes-inicio.png",
      "/projects/pepe-ajustes.png",
      "/projects/pepe-panel.png",
      "/projects/pepe-panel2.png",
      "/projects/pepe-servicios.png",
    ],
    featured: true,
  },
  {
    id: "wardex",
    title: "Wardex",
    desc: "SaaS completo para empresas de seguridad privada. Panel de administración con gestión de personal, asistencia por QR, incidencias, horarios y docs LFT.",
    tags: ["SaaS", "CRM", "B2B"],
    url: "https://wardex-mu.vercel.app/",
    img: "/projects/wardex-inicio.png",
    screenshots: [
      "/projects/wardex-inicio.png",
      "/projects/wardex-dashboard.png",
      "/projects/wardex-personal.png",
      "/projects/wardex-asistencia.png",
      "/projects/wardex-horas.png",
      "/projects/wardex-incidencias.png",
      "/projects/wardex-reportes.png",
      "/projects/wardex-vacaciones.png",
      "/projects/wardex.servicios.png",
    ],
    featured: false,
  },
  {
    id: "eyldon",
    title: "Cadena Eyldon Torrens",
    desc: "Plataforma web para el movimiento de juventudes cristianas. Sistema de autenticación, registro de miembros y presentación del movimiento.",
    tags: ["Plataforma", "Auth", "Comunidad"],
    url: "https://eyldon-torrens.vercel.app/",
    img: "/projects/eyldon.png",
    screenshots: [
      "/projects/eyldon.png",
      "/projects/eyldon-actividades.png",
      "/projects/eyldon-caja.png",
      "/projects/eyldon-calendario.png",
      "/projects/eyldon-dashboard.png",
      "/projects/eyldon-menu.png",
      "/projects/eyldon-perfil.png",
    ],
    featured: false,
  },
  {
    id: "simulador",
    title: "Simulador Educativo",
    desc: "App educativa con integración a la API de Bsale. Login, roles de usuario y flujos de capacitación interactivos para gestión empresarial.",
    tags: ["App Web", "Educación", "API Integration"],
    url: "https://simulador-educativo-api-bsale-production.up.railway.app/login",
    img: "/projects/simulador.png",
    screenshots: [
      "/projects/simulador.png",
      "/projects/simulador-dashboard.png",
      "/projects/simulador-herramientas.png",
      "/projects/simulador-lecciones.png",
      "/projects/simulador-panel.png",
    ],
    featured: false,
  },
];

function Lightbox({ src, alt, onClose, current, total }: { src: string; alt: string; onClose: () => void; current: number; total: number }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "oklch(0.03 0.005 280 / 0.97)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "zoom-out",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 20, right: 20,
          background: "oklch(0.14 0.015 280 / 0.9)", border: "1px solid var(--border)",
          borderRadius: 8, color: "var(--ink)", cursor: "pointer", padding: "8px 10px",
          display: "flex", zIndex: 1,
        }}
        aria-label="Cerrar imagen"
      >
        <X size={20} weight="bold" />
      </button>
      {total > 1 && (
        <div style={{
          position: "absolute", top: 20, left: 20, zIndex: 1,
          background: "oklch(0.14 0.015 280 / 0.9)", border: "1px solid var(--border)",
          borderRadius: 8, color: "var(--muted)", padding: "6px 12px",
          fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums",
        }}>
          {current + 1} / {total}
        </div>
      )}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: "92vw", height: "92vh", cursor: "default" }}
      >
        <Image src={src} alt={alt} fill style={{ objectFit: "contain" }} sizes="92vw" />
      </div>
    </div>
  );
}

function Modal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const total = project.screenshots.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setActive((a) => (a + 1) % total);
      if (e.key === "ArrowLeft") setActive((a) => (a - 1 + total) % total);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [total, onClose, lightboxOpen]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "oklch(0.05 0.010 280 / 0.88)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 16, width: "100%", maxWidth: 900, maxHeight: "90vh",
          overflow: "hidden", display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
              {project.tags.map((tag) => (
                <span key={tag} style={{ border: "1px solid var(--border)", color: "var(--muted)", padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 500 }}>
                  {tag}
                </span>
              ))}
            </div>
            <h3 style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>{project.title}</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 6, display: "flex", borderRadius: 8 }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Image — scrollable, clicks to lightbox */}
        <div style={{ height: "clamp(220px, 45vh, 420px)", flexShrink: 0, background: "var(--bg)", overflowY: "auto", overflowX: "hidden", position: "relative", cursor: "zoom-in" }} onClick={() => setLightboxOpen(true)}>
          <Image key={active} src={project.screenshots[active]} alt={`${project.title} — captura ${active + 1}`} width={900} height={600} style={{ width: "100%", height: "auto", display: "block" }} />
          <div style={{ position: "absolute", top: 10, right: 10, background: "oklch(0.10 0.010 280 / 0.82)", backdropFilter: "blur(4px)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--muted)", padding: "5px 9px", display: "flex", gap: 5, alignItems: "center", fontSize: 11, fontWeight: 500, pointerEvents: "none" }}>
            <MagnifyingGlassPlus size={13} weight="bold" />
            Ver en grande
          </div>
          {total > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + total) % total); }} style={{ position: "absolute", left: 12, top: 20, background: "oklch(0.10 0.010 280 / 0.78)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--ink)", cursor: "pointer", padding: "8px 10px", display: "flex" }}>
                <CaretLeft size={18} weight="bold" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % total); }} style={{ position: "absolute", right: 12, top: 20, background: "oklch(0.10 0.010 280 / 0.78)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--ink)", cursor: "pointer", padding: "8px 10px", display: "flex" }}>
                <CaretRight size={18} weight="bold" />
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 20, alignItems: "flex-end", flexWrap: "wrap", flexShrink: 0 }}>
          {total > 1 && (
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {project.screenshots.map((src, i) => (
                <button key={i} onClick={() => setActive(i)} style={{ width: 56, height: 40, borderRadius: 6, overflow: "hidden", position: "relative", border: "2px solid", cursor: "pointer", padding: 0, borderColor: i === active ? "var(--violet)" : "var(--border)", opacity: i === active ? 1 : 0.55, transition: "opacity 0.15s, border-color 0.15s" }}>
                  <Image src={src} alt="" fill style={{ objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, flex: 1, minWidth: 160 }}>{project.desc}</p>
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ flexShrink: 0 }}>
              Ir al proyecto <ArrowUpRight size={15} weight="bold" />
            </a>
          </div>
        </div>

        {lightboxOpen && (
          <Lightbox
            src={project.screenshots[active]}
            alt={`${project.title} — captura ${active + 1}`}
            onClose={() => setLightboxOpen(false)}
            current={active}
            total={total}
          />
        )}
      </div>
    </div>
  );
}

export default function Projects() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const featured = projects[0];
  const rest = projects.slice(1);

  return (
    <section id="proyectos" style={{ padding: "120px 0", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: "var(--ink)", marginBottom: 64, maxWidth: "18ch" }}>
          Trabajo real,<br />de principio a fin.
        </h2>

        {/* Featured */}
        <div onClick={() => setOpenProject(featured)} onMouseEnter={() => setHovered(featured.id)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer", marginBottom: 20 }}>
          <div style={{ borderRadius: 12, overflow: "hidden", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", background: "var(--surface)", border: "1px solid", transition: "border-color 0.2s", borderColor: hovered === featured.id ? "var(--violet)" : "var(--border)" }}>
            <div style={{ position: "relative", minHeight: 300 }}>
              <Image src={featured.img} alt={featured.title} fill style={{ objectFit: "cover", transform: hovered === featured.id ? "scale(1.03)" : "scale(1)", transition: "transform 0.5s ease" }} />
            </div>
            <div style={{ padding: "40px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                <span style={{ background: "var(--violet)", color: "white", padding: "3px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>Destacado</span>
                {featured.tags.map((tag) => (
                  <span key={tag} style={{ border: "1px solid var(--border)", color: "var(--muted)", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 500 }}>{tag}</span>
                ))}
              </div>
              <h3 style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", fontWeight: 800, color: "var(--ink)", marginBottom: 14, letterSpacing: "-0.02em" }}>{featured.title}</h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 28, fontSize: 14 }}>{featured.desc}</p>
              <span className="btn-primary" style={{ alignSelf: "flex-start" }}>Ver proyecto <ArrowUpRight size={16} weight="bold" /></span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {rest.map((p) => (
            <div key={p.id} onClick={() => setOpenProject(p)} onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
              <div style={{ borderRadius: 12, overflow: "hidden", background: "var(--surface)", border: "1px solid", transition: "border-color 0.2s", borderColor: hovered === p.id ? "var(--violet)" : "var(--border)", height: "100%" }}>
                <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                  <Image src={p.img} alt={p.title} fill style={{ objectFit: "cover", transform: hovered === p.id ? "scale(1.04)" : "scale(1)", transition: "transform 0.4s ease" }} />
                  {p.screenshots.length > 1 && (
                    <div style={{ position: "absolute", bottom: 8, right: 8, background: "oklch(0.10 0.010 280 / 0.80)", backdropFilter: "blur(4px)", color: "var(--muted)", fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 100, letterSpacing: "0.04em" }}>
                      +{p.screenshots.length - 1} fotos
                    </div>
                  )}
                </div>
                <div style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {p.tags.map((tag) => (
                      <span key={tag} style={{ border: "1px solid var(--border)", color: "var(--muted)", padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8, letterSpacing: "-0.01em" }}>{p.title}</h3>
                  <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>{p.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {openProject && (
        <Modal project={openProject} onClose={() => setOpenProject(null)} />
      )}
    </section>
  );
}
