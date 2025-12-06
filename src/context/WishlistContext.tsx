'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // 1. Cargar favoritos guardados
  useEffect(() => {
    const saved = localStorage.getItem('fina-wishlist');
    if (saved) {
        try {
            setWishlist(JSON.parse(saved));
        } catch (e) {
            console.error(e);
        }
    }
  }, []);

  // 2. Guardar cambios automáticamente
  useEffect(() => {
    localStorage.setItem('fina-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        toast.dismiss(); // Limpiar toasts anteriores
        toast("Eliminado de favoritos", { duration: 1500 });
        return prev.filter((p) => p.id !== product.id);
      } else {
        toast.success("¡Agregado a favoritos!", { duration: 1500 });
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some((p) => p.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, wishlistCount: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist debe usarse dentro de un WishlistProvider');
  return context;
};