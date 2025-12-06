import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext'; 
import { WishlistProvider } from '@/context/WishlistContext'; // <--- IMPORTANTE
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "FINA Marketplace",
  description: "Moda exclusiva en Perú",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <CartProvider>
          <WishlistProvider> {/* <--- AQUÍ DEBE ESTAR EL ENCHUFE */}
            <div id="root-app">
              <Navbar />
              <main className="min-h-[80vh]">{children}</main>
              <Footer />
            </div>
            <Toaster position="top-center" richColors />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}