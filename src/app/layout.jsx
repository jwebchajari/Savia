// app/layout.jsx
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import "./design-tokens.css";
import BootstrapClient from "@/_components/Boostrap/BootstrapClient";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Savia - Almacén Natural",
  description: "Productos naturales, veganos y saludables en Chajarí.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
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
      </body>
    </html>
  );
}
