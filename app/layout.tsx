/**
 * RootLayout — Layout raíz de toda la aplicación Next.js.
 *
 * Fuentes autoalojadas con next/font/google: se descargan en build y se sirven
 * desde _next/static/, sin peticiones a fonts.googleapis.com en runtime.
 * Las variables --font-caveat, --font-kalam y --font-courier se aplican al <html>
 * y se usan en globals.css a través de --font-hand, --font-body y --font-mono.
 */
import type { Metadata, Viewport } from "next";
import { Caveat, Kalam, Courier_Prime } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const kalam = Kalam({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-kalam",
  display: "swap",
});

const courierPrime = Courier_Prime({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-courier",
  display: "swap",
});

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
    <html lang="es" className={`${caveat.variable} ${kalam.variable} ${courierPrime.variable}`}>
      <body>
        <a href="#inicio" className="skip-link">Ir al contenido principal</a>
        {children}
      </body>
    </html>
  );
}
