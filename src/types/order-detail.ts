import { PaymentMethod, OrderStatus } from './order';

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product_name: string; // Nombre del producto (viene de la BD)
    color: string; // Color seleccionado
    size: string; // Talla seleccionada
    quantity: number;
    price: number; // Precio unitario al momento de la compra
    subtotal: number; // price * quantity
}

// Interfaz para el detalle completo de una orden
export interface Order {
    id: number;
    user_id: number;
    order_number: string;
    total: number;
    shipping_cost: number;
    status: OrderStatus;
    payment_method: PaymentMethod;
    payment_status: 'pendiente' | 'aprobado' | 'rechazado';

    // Datos de Envío
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_district: string;
    shipping_reference: string | null;

    created_at: string;
    updated_at: string;

    // Items del pedido
    items: OrderItem[];
}
