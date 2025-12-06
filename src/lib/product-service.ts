import { ProductsResponse, Product } from '@/types/product';
import { authenticatedClient } from './api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Re-declaración de interfaces para que sean exportadas individualmente
export interface ProductPayload extends Omit<Product, 'id' | 'created_at' | 'updated_at' | 'active' | 'total_stock' | 'images' | 'colors' | 'stock_by_size'> {
    images: string[];
    colors: { name: string, hex: string }[];
    stock: { size: string, quantity: number }[];
}

export interface ProductCreationResponse { success: boolean; message: string; productId?: number; }

// Exportamos un objeto único con todas las funcionalidades
export const productService = {

    /**
     * Obtiene todos los productos.
     * Modificado para aceptar filtros (searchParams) de forma segura y evitar caché (no-store).
     */
    getAllProducts: async function (searchParams?: { [key: string]: string }): Promise<Product[]> {
        try {
            // Creamos una instancia vacía de URLSearchParams
            const params = new URLSearchParams();

            // Agregamos manualmente solo si existen valores válidos y son strings
            if (searchParams) {
                Object.keys(searchParams).forEach(key => {
                    const value = searchParams[key];
                    if (value && typeof value === 'string') {
                        params.append(key, value);
                    }
                });
            }
            
            const queryString = params.toString();
            // Construimos la URL final asegurando que API_URL esté definido
            const baseUrl = API_URL || ''; 
            const url = `${baseUrl}/products${queryString ? `?${queryString}` : ''}`;
            
            console.log("Fetching URL:", url); // Para depuración en servidor

            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                // 'no-store' asegura que siempre obtengamos datos frescos al filtrar
                cache: 'no-store', 
            });

            if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
            
            const data: ProductsResponse = await res.json();
            return data.products;
        } catch (error) {
            console.error('Error fetching products:', error);
            // Retornamos array vacío para no romper la UI si falla el fetch
            return [];
        }
    },

    /**
     * Obtiene un producto específico por ID. Optimizada para Server Components con ISR.
     */
    getProductById: async function (id: string | number): Promise<Product | null> {
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
    },

    /**
     * Crea un nuevo producto. Requiere rol 'admin'. Usa Axios con autenticación.
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
     * Actualiza un producto existente. Requiere rol 'admin'. Usa Axios con autenticación.
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
     * Elimina (desactiva) un producto. Requiere rol 'admin'. Usa Axios con autenticación.
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