import { authenticatedClient } from './api-client';
import { CreateOrderRequest, CreateOrderResponse, MyOrdersResponse, OrderListItem } from '@/types/order';
//import { Order } from '@/types/order-detail';

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
    },

    /**
   * Obtiene el detalle de un pedido por ID.
   */
  getOrderDetail: async (orderId: string): Promise<Order | null> => {
    try {
        // La ruta para detalle es /orders/:id. La API verifica si pertenece al usuario o si es admin.
        const response = await authenticatedClient.get<{ success: true, order: Order }>(`/orders/${orderId}`);
        return response.data.order;
    } catch (error) {
        console.error('Error al obtener detalle de pedido:', error);
        // Si hay un error 404 o 403, retorna null para que la página lo maneje.
        if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 403)) {
            return null;
        }
        throw error; // Propagar otros errores
    }
  }
};