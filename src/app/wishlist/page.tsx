'use client';

import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';

export default function WishlistPage() {
    const { wishlist } = useWishlist();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <header className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-light uppercase tracking-[0.2em] mb-4">Mis Favoritos</h1>
                <p className="text-gray-500 text-sm">{wishlist.length} artículos guardados</p>
            </header>

            {wishlist.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-xl text-gray-400 font-light mb-6">Tu lista de deseos está vacía.</p>
                    <Link href="/" className="border-b border-black pb-1 text-sm uppercase tracking-widest hover:text-gray-600 transition">
                        Explorar Colección
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {wishlist.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}