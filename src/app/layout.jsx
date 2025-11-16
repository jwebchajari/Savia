// app/layout.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import BootstrapClient from '@/_components/Boostrap/BootstrapClient';
import { CartProvider } from '@/context/CartContext';

export const metadata = {
  title: "Savia - Almacén Natural",
  description: "Productos naturales, veganos y saludables en Chajarí.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <CartProvider>
        <body suppressHydrationWarning className="font-base">
          <BootstrapClient />
          {children}
        </body>
      </CartProvider>
    </html>
  );
}
