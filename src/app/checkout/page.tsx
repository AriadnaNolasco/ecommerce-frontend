'use client';

import { useState } from 'react';
import { CreateOrderRequest, OrderItemRequest, PaymentMethod } from '@/types/order';
import { orderService } from '@/lib/order-service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Simulación de los ítems del carrito (En una aplicación real, esto vendría del estado global/local)
const mockCartItems: OrderItemRequest[] = [
    { product_id: 1, color: 'Blanco', size: 'M', quantity: 1, price: 49.90, name: 'Polera Básica Blanca' },
    { product_id: 3, color: 'Rosa', size: 'S', quantity: 2, price: 89.90, name: 'Vestido Floral Verano' },
];

export default function CheckoutPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<Omit<CreateOrderRequest, 'items'>>({
        shipping_name: '',
        shipping_phone: '',
        shipping_address: '',
        shipping_district: '',
        shipping_reference: '',
        payment_method: 'tarjeta',
        card_number: '', // Solo para simulación
    });

    const totalOrder = mockCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = 10.00;
    const finalTotal = totalOrder + shippingCost;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // 1. Construir el Request Body
        const requestBody: CreateOrderRequest = {
            // El backend NO necesita 'name' en el objeto item, por lo que lo omitiremos al mapear
            // Nota: Como estamos usando mockCartItems directamente, y TypeScript permite propiedades 
            // adicionales en objetos literales, podemos dejarlo así, ya que el backend ignora
            // campos extra. Pero si fuera una validación estricta, deberíamos mapear solo los campos
            // que espera el backend.
            ...formData,
            // Aquí enviamos la lista que incluye 'name', pero el backend solo usa los campos que le interesan.
            items: mockCartItems.map(item => ({
                product_id: item.product_id,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                // No incluimos 'name' en el objeto final para el backend si no lo espera.
            })),
            // Solo incluimos card_number si es método tarjeta
            ...(formData.payment_method !== 'tarjeta' && { card_number: undefined }),
        };

        // Reconstrucción de requestBody para ser 100% seguro con lo que el backend espera
        const finalRequestBody: CreateOrderRequest = {
            ...formData,
            items: mockCartItems.map(({ product_id, color, size, quantity, price }) => ({
                product_id,
                color,
                size,
                quantity,
                price,
            })),
            // Solo incluimos card_number si es método tarjeta
            ...(formData.payment_method !== 'tarjeta' && { card_number: undefined }),
        } as CreateOrderRequest; // Type assertion ya que omitimos 'name' aquí

        try {
            // 2. Llamada a la API (POST /orders)
            const response = await orderService.createOrder(finalRequestBody); // Usar el cuerpo mapeado

            if (response.success) {
                alert(`¡Orden ${response.order.order_number} creada y ${response.order.payment_status}! Total: ${response.order.total}`);
                // Redirigir a una página de confirmación o de mis pedidos
                router.push('/orders/my-orders');
            } else {
                setError(response.message || 'Error desconocido al procesar el pedido.');
            }
        } catch (err: any) {
            console.error(err);
            // Manejo específico de errores de autenticación o de backend
            const msg = err.response?.data?.message || 'Error de conexión. Asegúrate de estar logueado.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 bg-gray-50 rounded-lg shadow-xl my-10">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Finalizar Compra</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">{error}</div>
            )}

            <div className="md:grid md:grid-cols-3 gap-8">
                {/* Columna de Formulario (md:col-span-2) */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-700">1. Datos de Envío</h2>

                        <input type="text" name="shipping_name" placeholder="Nombre Completo" value={formData.shipping_name} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
                        <input type="tel" name="shipping_phone" placeholder="Teléfono" value={formData.shipping_phone} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
                        <input type="text" name="shipping_address" placeholder="Dirección de Envío" value={formData.shipping_address} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
                        <input type="text" name="shipping_district" placeholder="Distrito/Ciudad" value={formData.shipping_district} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
                        <input type="text" name="shipping_reference" placeholder="Referencia (Opcional)" value={formData.shipping_reference} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />

                        <h2 className="text-xl font-bold pt-4 mb-2 text-gray-700">2. Método de Pago</h2>
                        <select name="payment_method" value={formData.payment_method} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded">
                            <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                            <option value="yape">Yape</option>
                            <option value="plin">Plin</option>
                        </select>

                        {formData.payment_method === 'tarjeta' && (
                            <input
                                type="text"
                                name="card_number"
                                placeholder="Número de Tarjeta (Prueba: 4111...1111 para OK / 4000...0002 para Fallo)"
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-3 bg-red-600 text-white font-bold text-lg rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Procesando Pedido...' : `Pagar ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(finalTotal)}`}
                        </button>

                        <div className="text-xs text-center text-gray-500 mt-4">
                            <p>Esta operación requiere que inicies sesión.</p>
                            <Link href="/orders/my-orders" className="text-blue-600 hover:underline">Ver mis pedidos</Link>
                        </div>
                    </form>
                </div>

                {/* Columna de Resumen (md:col-span-1) */}
                <div className="mt-8 md:mt-0">
                    <div className="bg-gray-100 p-6 rounded-lg shadow-md border">
                        <h2 className="text-xl font-bold mb-4 text-gray-700">Resumen del Pedido</h2>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {mockCartItems.map((item, index) => (
                                <li key={index} className="flex justify-between border-b pb-2">
                                    {/* Ya no da error, 'name' está en el tipo OrderItemRequest */}
                                    <span>{item.name} (x{item.quantity})</span>
                                    <span>{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(item.price * item.quantity)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 pt-4 border-t border-gray-300 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(totalOrder)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Envío:</span>
                                <span>{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(shippingCost)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                                <span>Total Final:</span>
                                <span>{new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(finalTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}