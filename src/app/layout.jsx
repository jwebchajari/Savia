import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import "./design-tokens.css";

import BootstrapClient from "@/_components/Boostrap/BootstrapClient";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

/* ==============================
   METADATA GLOBAL
============================== */
export const metadata = {
  metadataBase: new URL("https://savia-sigma.vercel.app"),

  title: {
    default: "Savia – Almacén Natural | Chajarí, Entre Ríos",
    template: "%s | Savia – Almacén Natural",
  },

  description:
    "Savia es un almacén natural en Chajarí, Entre Ríos. Frutos secos, suplementos, productos veganos, sin TACC, sin azúcar y opciones saludables para todos los días.",

  keywords: [
    "almacén natural",
    "productos naturales",
    "frutos secos",
    "suplementos",
    "suplementos dietarios",
    "vegano",
    "sin TACC",
    "sin azúcar",
    "alimentación saludable",
    "Chajarí",
    "Entre Ríos",
  ],

  authors: [{ name: "Savia – Almacén Natural" }],
  creator: "Savia – Almacén Natural",

  alternates: {
    canonical: "https://savia-sigma.vercel.app",
  },

  /* ---------- OPEN GRAPH (WhatsApp / Facebook / Instagram) ---------- */
  openGraph: {
    title: "Savia – Almacén Natural | Chajarí",
    description:
      "Almacén natural en Chajarí. Frutos secos, suplementos y productos saludables.",
    url: "https://savia-sigma.vercel.app",
    siteName: "Savia – Almacén Natural",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Savia – Almacén Natural",
      },
    ],
  },

  /* ---------- TWITTER / X ---------- */
  twitter: {
    card: "summary_large_image",
    title: "Savia – Almacén Natural",
    description:
      "Productos naturales, frutos secos y suplementos en Chajarí.",
    images: ["/og-image.jpg"],
  },

  /* ---------- ICONOS ---------- */
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

/* ==============================
   ROOT LAYOUT
============================== */
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

        {/* ==============================
           JSON-LD: LOCAL BUSINESS
        ============================== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "@id": "https://savia-sigma.vercel.app/#store",
              name: "Savia – Almacén Natural",
              url: "https://savia-sigma.vercel.app",
              image: "https://savia-sigma.vercel.app/og-image.jpg",
              telephone: "+5493456020167",
              priceRange: "$$",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Avenida Belgrano 2011",
                addressLocality: "Chajarí",
                addressRegion: "Entre Ríos",
                postalCode: "3228",
                addressCountry: "AR",
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ],
                  opens: "07:30",
                  closes: "12:45",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ],
                  opens: "15:30",
                  closes: "21:00",
                },
              ],
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
