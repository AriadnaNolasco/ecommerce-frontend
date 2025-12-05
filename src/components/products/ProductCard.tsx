import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
    product: Product;
}

// Componente de Tarjeta de Producto (Server Component)
export default function ProductCard({ product }: ProductCardProps) {
    // Determina la URL de la primera imagen o una de reemplazo
    const imageUrl = product.images.length > 0 ? product.images[0] : '/placeholder.jpg';

    // Mostrar el precio con formato de moneda
    const formattedPrice = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(product.price);

    return (
        <Link
            href={`/products/${product.id}`}
            className="block bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
        >
            <div className="relative w-full h-64">
                {/* Usamos next/image para optimización y lazy loading */}
                <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 hover:scale-105"
                    priority={product.is_new} // Carga prioritaria si es nuevo
                />
                {product.is_new && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                        NUEVO
                    </span>
                )}
            </div>

            <div className="p-4">
                <div className="text-xs font-semibold uppercase text-blue-600 mb-1">
                    {product.category} ({product.gender})
                </div>
                <h2 className="text-xl font-bold text-gray-900 truncate" title={product.name}>
                    {product.name}
                </h2>
                <p className="mt-2 text-3xl font-extrabold text-gray-800">
                    {formattedPrice}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    Stock: <span className="font-semibold text-gray-700">{product.total_stock}</span>
                </p>
            </div>
        </Link>
    );
}