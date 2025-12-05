import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import Navbar from '@/components/Navbar'; // Importar el Navbar
import Footer from '@/components/Footer'; // Crearemos un Footer simple
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Marketplace E-commerce",
  description: "Plataforma de E-commerce de Ropa con Next.js y Node.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div id="root-app">
          <Navbar /> {/* Barra de Navegación en la parte superior */}
          <main className="min-h-[80vh]">
            {children}
          </main>
          <Footer /> {/* Pie de página */}
        </div>
      </body>
    </html>
  );
}
