/**
 * RootLayout — Layout raíz de toda la aplicación Next.js.
 *
 * Carga las fuentes del estilo a lápiz (Caveat, Kalam y Courier Prime) desde Google Fonts;
 * las variables --font-hand, --font-body y --font-mono están en globals.css.
 * El export `viewport` configura el comportamiento móvil nativo:
 *   - viewportFit=cover: permite pintar bajo el notch/Dynamic Island.
 *   - interactiveWidget=resizes-content: el teclado virtual en Android
 *     encoge el viewport en lugar de hacer overlay, sincronizando con iOS.
 *   - themeColor: colorea la barra de estado del sistema operativo.
 */
import type { Metadata, Viewport } from "next";
import "./globals.css";

// Mismas tipografías del portafolio a lápiz (Google Fonts, igual que en public/index.html)
const FONTS =
  "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Kalam:wght@400;700&family=Courier+Prime:wght@400;700&display=swap";

export const metadata: Metadata = {
  title: "Valhalla Studio · Gabriel Castañeda",
  description: "Gabriel Castañeda — Diseñador y desarrollador freelance. Sitios web, apps y automatizaciones con diseño de alto impacto.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efece4" },
    { media: "(prefers-color-scheme: dark)", color: "#efece4" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>
        <a href="#inicio" className="skip-link">Ir al contenido principal</a>
        {children}
      </body>
    </html>
  );
}
