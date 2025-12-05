'use client';

import { productService } from '@/lib/product-service';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
    productId: number;
    productName: string;
}

export default function DeleteProductButton({ productId, productName }: DeleteButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        // Implementación de modal/confirmación personalizada (mejor que alert())
        if (!window.confirm(`¿Estás seguro de desactivar el producto: "${productName}"?`)) {
            return;
        }

        setLoading(true);
        try {
            await productService.deleteProduct(productId);
            alert(`Producto ${productName} desactivado exitosamente.`);

            // Recargar la página para reflejar el cambio (SSR cache clear)
            router.refresh();

        } catch (error: any) {
            alert(`Error al eliminar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="text-red-500 hover:text-red-700 font-semibold text-sm transition disabled:opacity-50"
        >
            {loading ? 'Eliminando...' : 'Eliminar'}
        </button>
    );
}