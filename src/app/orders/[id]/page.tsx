'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/lib/order-service';
import { Order } from '@/types/order-detail';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth-service';
import { OrderItem } from '@/types/order-detail';

interface OrderDetailPageProps {
    params: { id: string };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
    const { id: orderId } = params;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        // 1. Redirección si no está autenticado
        if (!authService.getToken()) {
            alert('Debes iniciar sesión para ver los detalles del pedido.');
            router.push('/login');
            return;
        }

        const fetchOrderDetail = async () => {
            setLoading(true);
            setError('');
            try {
                // 2. Llamada al servicio
                const orderData = await orderService.getOrderDetail(orderId);
                if (!orderData) {
                    setError('Pedido no encontrado o no tienes permiso para verlo.');
                } else {
                    setOrder(orderData);
                }
            } catch (err: any) {
                console.error("Error fetching order detail:", err);
                setError(err.message || 'Error al cargar el detalle del pedido.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId, router]);

    // Helper para formatear moneda y fecha
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    // Clase de estilo para el estado de la orden
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'entregado': return 'bg-green-600';
            case 'enviado': return 'bg-blue-600';
            case 'en_proceso': return 'bg-yellow-600';
            case 'cancelado': return 'bg-red-600';
            default: return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-4xl mx-auto p-8 my-10 bg-red-50 rounded-xl border-2 border-red-300">
                <p className="text-xl text-red-700 font-semibold">{error || 'El pedido no existe o fue cancelado.'}</p>
                <Link href="/orders/my-orders" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">← Volver a Mis Pedidos</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <Link href="/orders/my-orders" className="text-blue-600 hover:text-blue-800 mb-6 inline-block font-medium">
                ← Volver a Mis Pedidos
            </Link>

            <div className="bg-white shadow-2xl rounded-2xl p-8 space-y-8">
                <div className="flex justify-between items-center border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Pedido {order.order_number}
                    </h1>
                    <span
                        className={`text-white font-bold py-2 px-4 rounded-full uppercase text-sm ${getStatusClass(order.status)}`}
                    >
                        {order.status.replace('_', ' ')}
                    </span>
                </div>

                {/* Resumen y Fechas */}
                <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                    <div>
                        <p className="font-semibold text-gray-900">Fecha de Pedido:</p>
                        <p>{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">Monto Total:</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(order.total)}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">Estado de Pago:</p>
                        <p className={`capitalize font-bold ${order.payment_status === 'aprobado' ? 'text-green-600' : order.payment_status === 'rechazado' ? 'text-red-600' : 'text-gray-600'}`}>
                            {order.payment_status}
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">Método:</p>
                        <p className="capitalize">{order.payment_method}</p>
                    </div>
                </div>

                {/* Dirección de Envío */}
                <div className="border-t pt-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Detalles de Envío</h2>
                    <div className="space-y-1 text-gray-700">
                        <p><strong>Recibe:</strong> {order.shipping_name} ({order.shipping_phone})</p>
                        <p><strong>Dirección:</strong> {order.shipping_address}, {order.shipping_district}</p>
                        {order.shipping_reference && <p><strong>Referencia:</strong> {order.shipping_reference}</p>}
                    </div>
                </div>

                {/* Detalle de Items */}
                <div className="border-t pt-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Productos ({order.items.length})</h2>
                    <div className="space-y-4">
                        {order.items.map((item: OrderItem) => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <Link href={`/products/${item.product_id}`} className="flex-1 text-blue-600 hover:underline font-semibold">
                                    {item.product_name}
                                </Link>
                                <div className="text-right space-x-4 text-sm text-gray-700">
                                    <span>{item.color} / {item.size} (x{item.quantity})</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totales Finales */}
                <div className="border-t pt-6 flex justify-end">
                    <div className="w-full max-w-sm space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span>Subtotal Productos:</span>
                            <span className="font-semibold">{formatCurrency(order.total - order.shipping_cost)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Costo de Envío:</span>
                            <span className="font-semibold">{formatCurrency(order.shipping_cost)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-extrabold text-red-600 border-t pt-2">
                            <span>TOTAL PAGADO:</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}