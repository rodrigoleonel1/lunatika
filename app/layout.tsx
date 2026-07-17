import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const font = Urbanist({ subsets: ["latin"], variable: "--font-urbanist" });

const SITE_URL = "https://lunatika.vercel.app";
const SITE_NAME = "Lunatika Accesorios";
const SITE_DESCRIPTION =
  "Venta minorista de accesorios: aritos, pulseras, anillos y cadenas en acero quirúrgico. Envíos a todo el país.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Aritos, pulseras, anillos y cadenas`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "accesorios",
    "aritos",
    "pulseras",
    "anillos",
    "cadenas",
    "acero quirúrgico",
    "bijouterie",
    "Lunatika",
  ],
  authors: [{ name: "Lunatika" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Aritos, pulseras, anillos y cadenas`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Aritos, pulseras, anillos y cadenas`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.jpg`,
  sameAs: ["https://www.instagram.com/lunatika.ac/"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={font.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
