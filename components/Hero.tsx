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

        {/* Right: photo */}
        <motion.div {...right} style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ position: "relative", width: 300, height: 380 }}>
            {/* Photo frame */}
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              <Image
                src="/gabriel.jpg"
                alt="Gabriel Castañeda"
                fill
                priority
                style={{ objectFit: "cover", objectPosition: "top" }}
              />
            </div>

            {/* Identity badge */}
            <div
              style={{
                position: "absolute",
                bottom: -20,
                left: -24,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "12px 20px",
              }}
            >
              <div style={{ color: "var(--violet-light)", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>
                Viking
              </div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>Valhalla Studio</div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .hero-grid > *:last-child {
            justify-content: center !important;
          }
        }
      `}</style>
    </section>
  );
}
