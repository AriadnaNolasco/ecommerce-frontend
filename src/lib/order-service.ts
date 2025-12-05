import { authenticatedClient } from './api-client';
import { CreateOrderRequest, CreateOrderResponse, MyOrdersResponse, OrderListItem } from '@/types/order';

export const orderService = {
    /**
     * Crea un nuevo pedido. Requiere autenticación.
     * @param orderData Los datos del pedido, incluyendo items y envío.
     */
    createOrder: async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
        const response = await authenticatedClient.post<CreateOrderResponse>('/orders', orderData);
        return response.data;
    },

    /**
   * Obtiene la lista de pedidos del usuario autenticado.
   */
    getMyOrders: async (): Promise<OrderListItem[]> => {
        try {
            // La ruta para cliente es /orders/my-orders
            const response = await authenticatedClient.get<MyOrdersResponse>('/orders/my-orders');
            return response.data.orders;
        } catch (error) {
            console.error('Error al obtener mis pedidos:', error);
            return [];
        }
    }
};