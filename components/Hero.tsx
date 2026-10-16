"use client";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export default function Hero() {
  const reduced = useReducedMotion();

  const easing = [0.22, 1, 0.36, 1] as [number, number, number, number];

  const left = {
    initial: { opacity: 0, x: reduced ? 0 : -28 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.65, ease: easing },
  };

  const right = {
    initial: { opacity: 0, x: reduced ? 0 : 28 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.65, ease: easing, delay: 0.12 },
  };

  return (
    <section
      id="inicio"
      className="hero-section"
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        padding: "120px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-15%",
          right: "-8%",
          width: 700,
          height: 700,
          background: "radial-gradient(circle, oklch(0.58 0.22 293 / 0.10) 0%, transparent 65%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "55fr 45fr",
          gap: 64,
          alignItems: "center",
        }}
        className="hero-grid"
      >
        {/* Left: content */}
        <motion.div {...left}>
          {/* Availability status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 32,
              color: "var(--muted)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--green)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            Disponible para nuevos proyectos
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: "clamp(2.5rem, 4.5vw, 4.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              color: "var(--ink)",
              marginBottom: 24,
            }}
          >
            Diseño que funciona.
            <br />
            <span style={{ color: "var(--violet-light)" }}>Código que lo hace real.</span>
          </h1>

          {/* Tagline */}
          <p
            style={{
              color: "var(--muted)",
              fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
              lineHeight: 1.72,
              maxWidth: "52ch",
              marginBottom: 40,
            }}
          >
            Soy Gabriel Castañeda — diseño y construyo sitios web y apps que no solo se ven bien, sino que convierten y funcionan de verdad.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#proyectos" className="btn-primary">Ver proyectos</a>
            <a href="#contacto" className="btn-secondary">Hablemos →</a>
          </div>
        </motion.div>

        {/* Right: browser mockup */}
        <motion.div {...right} style={{ display: "flex", justifyContent: "flex-end" }} className="hero-photo">
          <div style={{ position: "relative", width: 420, paddingBottom: 24, paddingLeft: 24 }}>

            {/* Stat badge — top left */}
            <div
              style={{
                position: "absolute",
                top: -8,
                left: 0,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 18px",
                zIndex: 2,
              }}
            >
              <div style={{ color: "var(--muted)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 }}>Proyectos entregados</div>
              <div style={{ color: "var(--ink)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>4+</div>
            </div>

            {/* Browser frame */}
            <div
              style={{
                width: "100%",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                marginTop: 32,
              }}
            >
              {/* Browser chrome */}
              <div
                style={{
                  padding: "10px 14px",
                  background: "oklch(0.16 0.02 270)",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "oklch(0.60 0.18 25)", flexShrink: 0 }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "oklch(0.72 0.16 80)", flexShrink: 0 }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "oklch(0.60 0.18 140)", flexShrink: 0 }} />
                <div
                  style={{
                    flex: 1,
                    marginLeft: 8,
                    background: "oklch(0.20 0.02 270)",
                    borderRadius: 5,
                    padding: "3px 10px",
                    fontSize: 11,
                    color: "var(--muted)",
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  pepesbarbershop.com.mx
                </div>
              </div>

              {/* Screenshot */}
              <div style={{ position: "relative", height: 240 }}>
                <Image
                  src="/projects/pepes-inicio.png"
                  alt="Pepe's Barber Shop"
                  fill
                  priority
                  style={{ objectFit: "cover", objectPosition: "top" }}
                />
              </div>
            </div>

            {/* Project badge — bottom right */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: -8,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 16px",
                zIndex: 2,
              }}
            >
              <div style={{ color: "var(--violet-light)", fontSize: 13, fontWeight: 700 }}>Pepe&apos;s Barber Shop</div>
              <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>Diseño + Desarrollo web</div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-section { padding: 90px 20px 60px !important; min-height: unset !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-photo { justify-content: center !important; }
          .hero-photo > div { width: 100% !important; max-width: 360px; padding-left: 0 !important; padding-bottom: 32px !important; }
        }
        @media (max-width: 480px) {
          .hero-photo > div { max-width: 100%; }
        }
      `}</style>
    </section>
  );
}
