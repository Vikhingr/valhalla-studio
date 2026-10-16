/**
 * NotFound — Página 404 personalizada.
 *
 * Renderizada automáticamente por Next.js cuando ninguna ruta coincide.
 * Mantiene la misma estética del Hero (glow de fondo + tipografía gradient).
 * Reutiliza el Navbar del sitio público para que el usuario pueda volver al inicio.
 */
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 80px",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {/* Ambient glow — misma estética que Hero */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, oklch(0.58 0.22 293 / 0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: 480 }}>
          {/* Número 404 grande */}
          <p
            style={{
              fontSize: "clamp(80px, 18vw, 140px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              background: "linear-gradient(135deg, oklch(0.70 0.22 293), oklch(0.50 0.20 293))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 8,
              userSelect: "none",
            }}
          >
            404
          </p>

          <h1
            style={{
              fontSize: "clamp(22px, 4vw, 30px)",
              fontWeight: 700,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
              marginBottom: 14,
            }}
          >
            Página no encontrada
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "var(--muted)",
              lineHeight: 1.7,
              marginBottom: 36,
            }}
          >
            La página que buscas no existe o fue movida.
            <br />
            Vuelve al inicio y sigue explorando.
          </p>

          <Link
            href="/"
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    </>
  );
}
