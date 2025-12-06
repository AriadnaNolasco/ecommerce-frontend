import { productService } from '@/lib/product-service';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/products/AddToCartButton'; // Asegúrate de tener este componente
import AdminEditWrapper from '@/components/products/AdminEditWrapper';

// Definimos la interfaz para los props de la página
interface ProductPageProps {
    params: Promise<{ id: string }>; // En Next.js 15+, params es una promesa
}

export default async function ProductPage({ params }: ProductPageProps) {
    // 1. Esperamos a que los params se resuelvan (solución al error de rutas dinámicas)
    const { id } = await params;
    
    // 2. Buscamos el producto
    const product = await productService.getProductById(id);

    // Si no existe, mostramos 404
    if (!product) {
        notFound();
    }

    const formattedPrice = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2
    }).format(product.price);

    // Placeholder para imágenes si fallan
    const placeholder = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop";

    return (
        <div className="bg-white min-h-screen">
            {/* Breadcrumb simple */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs uppercase tracking-widest text-gray-500 border-b border-gray-100">
                <Link href="/" className="hover:text-black">Inicio</Link> 
                <span className="mx-2">/</span> 
                <Link href={`/?category=${product.category}`} className="hover:text-black">{product.category}</Link>
                <span className="mx-2">/</span>
                <span className="text-black">{product.name}</span>
            </div>

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    
                    {/* COLUMNA IZQUIERDA: Galería de Imágenes (Estilo Fina/Revolve) */}
                    <div className="space-y-4">
                        {/* Imagen Principal Grande */}
                        <div className="relative aspect-[3/4] w-full bg-gray-50 overflow-hidden">
                            <Image
                                src={product.images[0] || placeholder}
                                alt={product.name}
                                fill
                                priority
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        
                        {/* Grilla de imágenes secundarias (si existen) */}
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-2 gap-4">
                                {product.images.slice(1).map((img, idx) => (
                                    <div key={idx} className="relative aspect-[3/4] w-full bg-gray-50">
                                        <Image
                                            src={img}
                                            alt={`${product.name} - ${idx + 2}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: Información y Compra */}
                    <div className="lg:sticky lg:top-32 h-fit space-y-8 pt-4">
                        
                        {/* Cabecera del Producto */}
                        <div className="space-y-2 border-b border-gray-100 pb-6">
                            <div className="flex justify-between items-start">
                                <h1 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 uppercase tracking-wide">
                                    {product.name}
                                </h1>
                                {/* Icono de Wishlist (opcional aquí) */}
                            </div>
                            
                            <p className="text-xl font-light text-gray-900">
                                {formattedPrice}
                            </p>
                            
                            <p className="text-sm text-gray-500 pt-2 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Componente Interactivo de Compra (Client Component) */}
                        <div className="pt-2">
                            <AddToCartButton product={product} />
                        </div>

                        {/* Detalles Adicionales (Acordeón o lista simple) */}
                        <div className="border-t border-gray-100 pt-6 space-y-4 text-xs tracking-wide uppercase text-gray-500">
                            {product.material && (
                                <div className="flex gap-2">
                                    <span className="font-bold text-black">Composición:</span> 
                                    <span>{product.material}</span>
                                </div>
                            )}
                            {product.care_instructions && (
                                <div className="flex gap-2">
                                    <span className="font-bold text-black">Cuidado:</span> 
                                    <span>{product.care_instructions}</span>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <span className="font-bold text-black">Estilo:</span> 
                                <span>{product.style}</span>
                            </div>
                            <div className="flex gap-2 text-green-600">
                                <span className="font-bold">Envío:</span> 
                                <span>Disponible para entrega inmediata</span>
                            </div>
                        </div>

                        {/* Wrapper Admin (Solo visible para admins) */}
                        <AdminEditWrapper product={product} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Generación de Metadata para SEO
export async function generateMetadata({ params }: ProductPageProps) {
    const { id } = await params;
    const product = await productService.getProductById(id);
    
    if (!product) return { title: 'Producto No Encontrado' };

    return {
        title: `${product.name} | FINA PERÚ`,
        description: product.description,
        openGraph: {
            images: [product.images[0] || ''],
        },
    };
}