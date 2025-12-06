import { productService } from '@/lib/product-service';
import ProductCard from '@/components/products/ProductCard';
import SidebarFilters from '@/components/products/SidebarFilters';
import Image from 'next/image';
import Link from 'next/link';
import AdminRedirect from '@/components/AdminRedirect'; // <--- 1. IMPORTAR AQUÍ

// Definimos el tipo exacto que esperamos
interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home(props: HomeProps) {
  // En Next.js 15+, searchParams es una promesa, hay que esperarla
  const searchParams = await props.searchParams;

  // Convertimos los valores a string simple para nuestro servicio
  const filters: { [key: string]: string } = {};
  
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === 'string') {
        filters[key] = value;
      } else if (Array.isArray(value) && value.length > 0) {
        filters[key] = value[0]; // Tomamos el primer valor si es un array
      }
    });
  }

  const products = await productService.getAllProducts(filters);

  return (
    <div className="bg-white min-h-screen">
      {/* 2. COMPONENTE DE REDIRECCIÓN */}
      {/* Si es admin, lo expulsará de aquí hacia /admin automáticamente */}
      <AdminRedirect />

      {/* HERO BANNER - Estilo Minimalista */}
      <div className="relative w-full h-[60vh] md:h-[70vh] bg-gray-100 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Colección Otoño 2024"
          fill
          className="object-cover object-center brightness-[0.85]"
          priority
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-4">
          <span className="text-sm md:text-base uppercase tracking-[0.3em] mb-4">Nueva Temporada</span>
          <h1 className="text-5xl md:text-7xl font-light mb-8 tracking-wide">ELEGANCIA NATURAL</h1>
          <Link href="#shop" className="border border-white px-8 py-3 uppercase text-sm tracking-widest hover:bg-white hover:text-black transition duration-300">
            Ver Colección
          </Link>
        </div>
      </div>

      <div id="shop" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <SidebarFilters />

        {/* Contenido Principal */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-light uppercase tracking-wide">Catálogo</h2>
            <span className="text-sm text-gray-500">{products.length} Resultados</span>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No se encontraron productos con estos filtros.</p>
              <Link href="/" className="text-black underline text-sm hover:opacity-70">
                Limpiar filtros
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}