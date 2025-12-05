import { getAllProducts } from '@/lib/product-service';
import ProductCard from '@/components/products/ProductCard';
import AddProductAccess from '@/components/products/AddProductAccess';

export default async function Home() {
  // 1. Obtención de datos en el servidor
  const products = await getAllProducts();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10">
        Catálogo de Productos 👕
      </h1>
      {/* Componente que verifica si es admin y muestra el botón de Crear Producto */} 
      <AddProductAccess />

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600">
            No se encontraron productos en el catálogo. Verifica que el backend esté corriendo y contenga datos.
          </p>
        </div>
      ) : (
        // 2. Renderizado de la cuadrícula de productos
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
