import { productService } from '@/lib/product-service';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductColor, ProductStock } from '@/types/product';
import DeleteProductButton from '@/components/products/DeleteProductButton';
import ProductForm from '@/components/products/ProductForm'; // Importar el formulario
import { authService } from '@/lib/auth-service';
import AdminEditWrapper from '@/components/products/AdminEditWrapper';

interface ProductPageProps {
    params: {
        id: string; // ID del producto de la ruta dinámica
    };
}

// Componente de página de detalle (Server Component Asíncrono)
export default async function ProductPage({ params }: ProductPageProps) {
    const productId = params.id;

    // FIX 2: Llamar a la función a través del objeto 'productService'
    const product = await productService.getProductById(productId);

    if (!product) {
        // Si el producto no existe (404 del backend), usamos la función notFound de Next.js
        notFound();
    }
    // Formato de precio y stock total
    const formattedPrice = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(product.price);

    // FIX 3 & 4: Tipar explícitamente los parámetros del reduce
    const stockTotal = product.stock_by_size.reduce((sum: number, s: ProductStock) => sum + s.stock, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block font-medium">
                ← Volver al Catálogo
            </Link>

            {/* Contenedor principal del detalle */}
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden md:flex">

                {/* Columna de Imagen */}
                <div className="md:w-1/2 relative h-96">
                    <Image
                        src={product.images[0] || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        sizes="100vw"
                        priority // Carga prioritaria en la página de detalle
                        style={{ objectFit: 'cover' }}
                    />
                </div>

                {/* Columna de Información */}
                <div className="md:w-1/2 p-8 space-y-6">

                    <span className="text-sm font-semibold uppercase text-gray-500">
                        {product.gender} • {product.category}
                    </span>

                    <h1 className="text-4xl font-extrabold text-gray-900">
                        {product.name}
                    </h1>

                    <p className="text-5xl font-extrabold text-blue-600">
                        {formattedPrice}
                    </p>

                    <p className="text-gray-700 leading-relaxed">
                        {product.description}
                    </p>

                    {/* Colores */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Colores:</h3>
                        <div className="flex space-x-2">
                            {product.colors.map((color: ProductColor) => (
                                <div
                                    key={color.color_hex}
                                    title={color.color_name}
                                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                                    style={{ backgroundColor: color.color_hex }}
                                ></div>
                            ))}
                        </div>
                    </div>
                    {/* Stock y Tallas */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Stock por Talla:</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.stock_by_size.map((stock: ProductStock) => (
                                <span
                                    key={stock.size}
                                    className={`px-4 py-1 border rounded-lg font-semibold text-sm ${stock.stock > 0 ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'
                                        }`}
                                >
                                    {stock.size}: {stock.stock}
                                </span>
                            ))}
                        </div>
                        <p className="text-sm font-bold mt-4">
                            Stock Total: {stockTotal}
                        </p>
                    </div>

                    {/* Botón de Agregar (temporalmente un placeholder) */}
                    <button className="w-full py-3 px-4 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 transition">
                        Añadir al Carrito
                    </button>
                </div>
            </div>

            {/* Nuevo: Wrapper de Edición para Administradores */}
            <AdminEditWrapper product={product} />
        </div>
    );
}

export function generateMetadata({ params }: ProductPageProps) {
    return {
        title: `Producto ${params.id} | Marketplace`,
        description: 'Detalles del producto específico.'
    };
}