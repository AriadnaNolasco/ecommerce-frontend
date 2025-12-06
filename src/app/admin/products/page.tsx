'use client';

import { useEffect, useState } from 'react';
import { productService } from '@/lib/product-service';
import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit, Trash2, ArrowLeft, X } from 'lucide-react';
import ProductForm from '@/components/products/ProductForm';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // URL de imagen por defecto para evitar el error 404
    const placeholder = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop";

    const loadProducts = async () => {
        setLoading(true);
        const data = await productService.getAllProducts();
        setProducts(data);
        setLoading(false);
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            await productService.deleteProduct(id);
            loadProducts(); // Recargar lista
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header con Flecha de Retorno */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white border border-gray-200 rounded-lg hover:border-black transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-gray-900">Productos</h1>
                            <p className="text-sm text-gray-500">Gestiona tu catálogo ({products.length})</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                        className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition"
                    >
                        <Plus size={18} /> Nuevo Producto
                    </button>
                </div>

                {/* Tabla de Productos */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Producto</th>
                                    <th className="px-6 py-4">Categoría</th>
                                    <th className="px-6 py-4">Precio</th>
                                    <th className="px-6 py-4">Stock Total</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <div className="relative w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {/* AQUÍ ESTABA EL ERROR: Ahora usa 'placeholder' */}
                                                <Image 
                                                    src={product.images[0] || placeholder} 
                                                    alt={product.name} 
                                                    fill 
                                                    className="object-cover" 
                                                />
                                            </div>
                                            <span className="font-bold text-gray-900">{product.name}</span>
                                        </td>
                                        <td className="px-6 py-4 capitalize text-gray-600">{product.category}</td>
                                        
                                        {/* Precio formateado */}
                                        <td className="px-6 py-4 font-medium">S/ {Number(product.price).toFixed(2)}</td>
                                        
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${product.total_stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.total_stock} unid.
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => { setEditingProduct(product); setIsFormOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {products.length === 0 && !loading && (
                        <div className="p-12 text-center text-gray-400">No hay productos en el catálogo.</div>
                    )}
                </div>
            </div>

            {/* Modal para Formulario */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <button onClick={() => setIsFormOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black transition">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-serif font-bold mb-8 pb-4 border-b border-gray-100">
                            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>
                        
                        <ProductForm 
                            initialProduct={editingProduct} 
                            onClose={() => { setIsFormOpen(false); loadProducts(); }} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}