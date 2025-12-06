'use client'; 

import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isLiked = isInWishlist(product.id);
    
    // URL de una imagen gris neutra de Unsplash
    const placeholder = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop";
    const imageUrl = product.images.length > 0 ? product.images[0] : placeholder;
    
    const formattedPrice = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2
    }).format(product.price);

    // --- CORRECCIÓN DEL ERROR ---
    // Filtramos los colores para que sean únicos por su código HEX.
    // Esto evita el error de "same key" y que se vean bolitas repetidas.
    const uniqueColors = product.colors.filter((color, index, self) =>
        index === self.findIndex((c) => c.color_hex === color.color_hex)
    );

    return (
        <div className="group relative flex flex-col gap-3">
            {/* 1. Contenedor de Imagen */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
                <Link href={`/products/${product.id}`} className="block h-full w-full">
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="h-full w-full object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-105"
                        priority={product.is_new}
                    />
                </Link>

                {/* Badge "NUEVO" */}
                {product.is_new && (
                    <div className="absolute left-2 bottom-2 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-sm">
                        Nuevo
                    </div>
                )}

                {/* Botón de Favorito */}
                <button 
                    onClick={(e) => {
                        e.preventDefault(); 
                        toggleWishlist(product);
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 ${
                        isLiked 
                        ? 'opacity-100 bg-white text-red-500' 
                        : 'opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white text-gray-900'
                    }`}
                >
                    <Heart size={18} strokeWidth={isLiked ? 0 : 1.5} fill={isLiked ? "currentColor" : "none"} />
                </button>

                {/* Quick Add Visual */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
                    <span className="text-xs font-bold uppercase tracking-widest text-black">Vista Rápida</span>
                </div>
            </div>

            {/* 2. Información del Producto */}
            <div className="flex flex-col gap-1 text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {product.category}
                </span>

                <Link href={`/products/${product.id}`}>
                    <h3 className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </Link>

                <p className="text-sm font-normal text-gray-900 mt-1">
                    {formattedPrice}
                </p>
                
                {/* Colores disponibles (Usando la lista única) */}
                {uniqueColors.length > 0 && (
                    <div className="flex gap-1 mt-1">
                        {uniqueColors.slice(0, 4).map((color) => (
                            <div 
                                // Ahora la key es segura porque filtramos duplicados
                                key={color.color_hex} 
                                className="w-3 h-3 rounded-full border border-gray-200"
                                style={{ backgroundColor: color.color_hex }}
                                title={color.color_name}
                            />
                        ))}
                        {uniqueColors.length > 4 && (
                            <span className="text-[10px] text-gray-400">+</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}