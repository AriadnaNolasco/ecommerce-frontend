import { ProductsResponse, Product } from '@/types/product';
import { authenticatedClient } from './api-client';
import { ProductColor, ProductStock } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ProductPayload extends Omit<Product, 'id' | 'created_at' | 'updated_at' | 'active' | 'total_stock' | 'images' | 'colors' | 'stock_by_size'> {
    images: string[];
    colors: { name: string, hex: string }[];
    stock: { size: string, quantity: number }[];
}

export interface ProductCreationResponse { success: boolean; message: string; productId?: number; }
export async function getAllProducts(): Promise<Product[]> {
    try {
        // Usamos fetch nativo con opciones de Next.js para revalidación (ISR)
        const res = await fetch(`${API_URL}/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Revalidar los datos cada 60 minutos (3600 segundos)
            next: {
                revalidate: 3600
            },
        });

        if (!res.ok) {
            // Si la respuesta no es 200-299, lanza un error
            console.error(`Error al obtener productos: ${res.status} ${res.statusText}`);
            throw new Error('Error al cargar el catálogo de productos.');
        }

        const data: ProductsResponse = await res.json();
        return data.products;
    } catch (error) {
        console.error('Error en fetch de productos:', error);
        // En caso de error, retorna un array vacío para no romper la UI
        return [];
    }
}

/**
 * Obtiene un producto específico por ID.
 * También se ejecuta en el servidor.
 */
export async function getProductById(id: string | number): Promise<Product | null> {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Cachear los datos del producto por un día (ISR)
            next: {
                revalidate: 86400
            },
        });

        if (res.status === 404) {
            return null; // Producto no encontrado
        }

        if (!res.ok) {
            console.error(`Error al obtener detalle: ${res.status} ${res.statusText}`);
            throw new Error('Error al cargar el detalle del producto.');
        }

        const data: { success: true; product: Product } = await res.json();
        return data.product;

    } catch (error) {
        console.error('Error en fetch de detalle de producto:', error);
        return null;
    }
}

/**
 * Crea un nuevo producto. Requiere rol 'admin'.
 */
createProduct: async (productData: ProductPayload): Promise<ProductCreationResponse> => {
    try {
        const response = await authenticatedClient.post<ProductCreationResponse>('/products', productData);
        return response.data;
    } catch (error: any) {
        console.error('Error al crear producto:', error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Error al crear producto.');
    }
},

    /**
     * Actualiza un producto existente. Requiere rol 'admin'.
     */
    updateProduct: async (id: number, productData: Partial<ProductPayload>): Promise<{ success: boolean, message: string }> => {
        try {
            const response = await authenticatedClient.put<{ success: boolean, message: string }>(`/products/${id}`, productData);
            return response.data;
        } catch (error: any) {
            console.error(`Error al actualizar producto ${id}:`, error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Error al actualizar producto.');
        }
    },

        /**
         * Elimina (desactiva) un producto. Requiere rol 'admin'.
         */
        deleteProduct: async (id: number): Promise<{ success: boolean, message: string }> => {
            try {
                const response = await authenticatedClient.delete<{ success: boolean, message: string }>(`/products/${id}`);
                return response.data;
            } catch (error: any) {
                console.error(`Error al eliminar producto ${id}:`, error.response?.data?.message || error.message);
                throw new Error(error.response?.data?.message || 'Error al eliminar producto.');
            }
        },
};