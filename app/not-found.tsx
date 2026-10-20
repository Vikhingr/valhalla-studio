/**
 * NotFound — Página 404 con el estilo a lápiz del portafolio.
 *
 * Renderizada automáticamente por Next.js cuando ninguna ruta coincide.
 * Una hoja de cuaderno con cinta, un "404" escrito a mano y un botón de regreso al inicio.
 */
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "48px 16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(460px, 100%)",
          background: "var(--surface)",
          backgroundImage:
            "linear-gradient(90deg, transparent 30px, var(--margin-red) 30px, var(--margin-red) 32px, transparent 32px), repeating-linear-gradient(var(--surface) 0 31px, var(--rule-blue) 31px 32px)",
          border: "2px solid var(--ink)",
          borderRadius: "var(--card-radius)",
          boxShadow: "6px 8px 0 rgba(42,42,46,0.16)",
          transform: "rotate(-0.8deg)",
          padding: "40px 28px 32px 48px",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute", top: -14, left: "50%", width: 110, height: 28,
            transform: "translateX(-50%) rotate(-3deg)",
            background: "rgba(215,205,170,0.78)", border: "1px solid rgba(42,42,46,0.15)",
          }}
        />
        <p style={{ fontFamily: "var(--font-hand), cursive", fontSize: "clamp(90px, 22vw, 140px)", fontWeight: 700, lineHeight: 0.9, color: "var(--ink)", margin: 0, userSelect: "none" }}>
          404
        </p>
        <h1 style={{ fontFamily: "var(--font-hand), cursive", fontSize: 34, fontWeight: 700, color: "var(--ink)", margin: "10px 0 8px" }}>
          Esta hoja está en blanco
        </h1>
        <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 26px" }}>
          La página que buscas no existe o cambió de lugar.
        </p>
        <Link href="/" className="btn-primary">Volver al inicio</Link>
      </div>
    </main>
  );
}
