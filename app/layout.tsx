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

const SITE_URL = "https://www.valhallastudio.com.mx";

const DESCRIPTION =
  "Gabriel Castañeda · Valhalla Studio. Diseño y desarrollo de páginas web, sistemas y herramientas a la medida desde la Ciudad de México.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Valhalla Studio · Gabriel Castañeda",
    template: "%s — Valhalla Studio",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "Valhalla Studio · Gabriel Castañeda",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Valhalla Studio",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Valhalla Studio — Diseño y desarrollo web · Ciudad de México",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Valhalla Studio · Gabriel Castañeda",
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "BPtUlurLKUr9_mKrT73e5ZCRMi77IgYyyyF3iew6P9o",
  },
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": SITE_URL,
  name: "Valhalla Studio",
  description: DESCRIPTION,
  url: SITE_URL,
  email: "contacto@valhallastudio.com.mx",
  founder: {
    "@type": "Person",
    name: "Gabriel Castañeda",
    jobTitle: "Diseñador y desarrollador web",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ciudad de México",
    addressRegion: "CDMX",
    addressCountry: "MX",
  },
  areaServed: {
    "@type": "City",
    name: "Ciudad de México",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servicios web",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Diseño y desarrollo de páginas web" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Aplicaciones web a la medida" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sistemas de administración" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Automatizaciones y herramientas digitales" } },
    ],
  },
  inLanguage: "es-MX",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${caveat.variable} ${kalam.variable} ${courierPrime.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a href="#inicio" className="skip-link">Ir al contenido principal</a>
        {children}
      </body>
    </html>
  );
}
