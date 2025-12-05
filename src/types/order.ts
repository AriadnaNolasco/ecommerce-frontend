export type PaymentMethod = 'tarjeta' | 'yape' | 'plin';
export type OrderStatus = 'pendiente' | 'en_proceso' | 'enviado' | 'entregado' | 'cancelado';

export interface OrderItemRequest {
    product_id: number;
    color: string;
    size: string;
    quantity: number;
    price: number;
    name: string;
}

export interface CreateOrderRequest {
    items: OrderItemRequest[];
    payment_method: PaymentMethod;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_district: string;
    shipping_reference?: string; // Opcional para simulación de tarjeta (si el método es 'tarjeta') 
    card_number?: string;
}

export interface CreateOrderResponse {
    success: true;
    message: string;
    order: {
        id: number;
        order_number: string;
        total: number;
        payment_status: 'aprobado' | 'rechazado' | 'pendiente';
    };
}

export interface OrderListItem {
    id: number;
    order_number: string;
    total: number;
    status: OrderStatus;
    payment_method: PaymentMethod;
    created_at: string;
}

export interface MyOrdersResponse {
    success: true;
    count: number;
    orders: OrderListItem[];
}