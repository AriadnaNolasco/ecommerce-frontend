'use client';

import { useEffect, useState } from 'react';
import { authService } from '@/lib/auth-service';
import { Product } from '@/types/product';
import ProductForm from './ProductForm';
import { User } from '@/types/auth';
import DeleteProductButton from './DeleteProductButton';

interface AdminEditWrapperProps {
    product: Product;
}

export default function AdminEditWrapper({ product }: AdminEditWrapperProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const profile = await authService.getProfile();
            setUser(profile);
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    // 1. Mostrar spinner de carga si está verificando el perfil
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span className="ml-3 text-gray-500">Verificando permisos...</span>
            </div>
        );
    }

    // 2. Si es administrador, renderizar el formulario de edición
    if (user?.role === 'admin') {
        return (
            <>
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-indigo-700 mb-4">Gestión de Administrador</h2>
                    {/* El formulario ya contiene toda la lógica de edición/actualización */}
                    <ProductForm initialProduct={product} />

                    {/* Botón de Eliminación (Ya implementado) */}
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
                        <p className="text-sm text-red-700">Desactivar permanentemente este producto del catálogo.</p>
                        <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                </div>
            </>
        );
    }

    // 3. Si no es administrador, no renderizar nada más.
    return null;
}