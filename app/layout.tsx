/**
 * RootLayout — Layout raíz de toda la aplicación Next.js.
 *
 * Aplica las fuentes Geist Sans y Mono via `next/font` (sin petición externa).
 * El export `viewport` configura el comportamiento móvil nativo:
 *   - viewportFit=cover: permite pintar bajo el notch/Dynamic Island.
 *   - interactiveWidget=resizes-content: el teclado virtual en Android
 *     encoge el viewport en lugar de hacer overlay, sincronizando con iOS.
 *   - themeColor: colorea la barra de estado del sistema operativo.
 */
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valhalla Studio — Diseño que funciona. Código que lo hace real.",
  description: "Gabriel Castañeda — Diseñador y desarrollador freelance. Sitios web, apps y automatizaciones con diseño de alto impacto.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#0d0c14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
