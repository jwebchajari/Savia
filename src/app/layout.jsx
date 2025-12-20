import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import "./design-tokens.css";

import BootstrapClient from "@/_components/Boostrap/BootstrapClient";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  metadataBase: new URL("https://savia-sigma.vercel.app"),

  title: {
    default: "Savia – Almacén Natural | Chajarí, Entre Ríos",
    template: "%s | Savia – Almacén Natural",
  },

  description:
    "Almacén natural en Chajarí. Frutos secos, suplementos, productos veganos, sin TACC y opciones saludables.",

  keywords: [
    "almacén natural",
    "productos naturales",
    "frutos secos",
    "suplementos",
    "sin TACC",
    "vegano",
    "alimentación saludable",
    "Chajarí",
    "Entre Ríos",
  ],

  authors: [{ name: "Savia – Almacén Natural" }],
  creator: "Savia – Almacén Natural",

  openGraph: {
    title: "Savia – Almacén Natural",
    description:
      "Productos naturales, frutos secos, suplementos y alimentos saludables en Chajarí.",
    url: "https://savia-sigma.vercel.app",
    siteName: "Savia – Almacén Natural",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Savia – Almacén Natural",
      },
    ],
    locale: "es_AR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Savia – Almacén Natural",
    description:
      "Almacén natural en Chajarí con productos saludables, veganos y sin TACC.",
    images: ["/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },

  alternates: {
    canonical: "https://savia-sigma.vercel.app",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-base" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <BootstrapClient />
            {children}
          </CartProvider>
        </AuthProvider>

        {/* JSON-LD LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "Savia – Almacén Natural",
              image: "https://savia-sigma.vercel.app/og-image.jpg",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Avenida Belgrano 2011",
                addressLocality: "Chajarí",
                addressRegion: "Entre Ríos",
                addressCountry: "AR",
              },
              openingHours: "Mo-Sa 07:30-12:45,15:30-21:00",
              telephone: "+5493456020167",
              url: "https://savia-sigma.vercel.app",
              sameAs: [
                "https://www.instagram.com/saviaalmacennatural/",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
