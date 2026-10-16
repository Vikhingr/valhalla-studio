/**
 * FloatingWhatsApp — Botón flotante de WhatsApp en la esquina inferior derecha.
 *
 * Enlace directo a WhatsApp con mensaje pre-escrito de cotización.
 * El número de teléfono está en la URL (wa.me/52...) — nunca en texto visible
 * del HTML público por política de privacidad del proyecto.
 * El tooltip aparece al hacer hover en desktop.
 */
"use client";
import { useState } from "react";
import { WhatsappLogo } from "@phosphor-icons/react";

export default function FloatingWhatsApp() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="https://wa.me/525543424718?text=Hola%20Gabriel%2C%20me%20interesa%20cotizar%20un%20proyecto"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
      }}
      aria-label="Escríbeme por WhatsApp"
    >
      {/* Tooltip */}
      <span
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          color: "var(--ink)",
          padding: "7px 14px",
          borderRadius: 100,
          fontSize: 13,
          fontWeight: 600,
          whiteSpace: "nowrap",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(8px)",
          transition: "opacity 0.2s, transform 0.2s",
          pointerEvents: "none",
        }}
      >
        ¡Escríbeme!
      </span>

      {/* Button */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "var(--green)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          boxShadow: hovered
            ? "0 6px 24px oklch(0.70 0.18 160 / 0.45)"
            : "0 3px 12px oklch(0.70 0.18 160 / 0.25)",
          transform: hovered ? "scale(1.08)" : "scale(1)",
          transition: "box-shadow 0.2s, transform 0.2s",
        }}
      >
        <WhatsappLogo size={26} weight="fill" />
      </div>
    </a>
  );
}
