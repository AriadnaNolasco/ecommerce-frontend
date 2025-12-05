'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/lib/order-service';
import { OrderListItem } from '@/types/order';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth-service';

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true); const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => { // 1. Verificar autenticación al cargar 
        if (!authService.getToken()) {
            alert('Debes iniciar sesión para ver tus pedidos.');
            router.push('/login');
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            setError('');
            try {
                // 2. Llamada al servicio autenticado
                const userOrders = await orderService.getMyOrders();
                setOrders(userOrders);
            } catch (err: any) {
                console.error("Error fetching orders:", err);
                // El interceptor de axios ya debería manejar 401/403, pero si hay otro error:
                setError('Error al cargar tus pedidos. Por favor, intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    // Helper para mostrar el estado con color 
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'entregado': return 'bg-green-100 text-green-800';
            case 'enviado': return 'bg-blue-100 text-blue-800';
            case 'en_proceso': return 'bg-yellow-100 text-yellow-800';
            case 'cancelado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper para formatear moneda y fecha 
    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-PE', {
        style: 'currency', currency: 'PEN'
    }).format(amount);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8"> Mis Pedidos 📦 </h1>
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando historial...</p>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-lg">
                    <p className="text-xl text-gray-600 mb-4">
                        Aún no has realizado ningún pedido.
                    </p>
                    <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium text-lg">
                        Ir al catálogo
                    </Link>
                </div>
            ) : (
                <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nº Orden
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Método de Pago
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                                        {order.order_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                        {formatCurrency(order.total)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {order.payment_method}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusClass(order.status)}`}
                                        >
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                                            Ver Detalle
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
