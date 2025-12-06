'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/lib/order-service';
import { OrderListItem } from '@/types/order';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth-service';
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authService.getToken()) {
            router.push('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const userOrders = await orderService.getMyOrders();
                setOrders(userOrders);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'entregado': return <CheckCircle size={16} className="text-green-600" />;
            case 'enviado': return <Truck size={16} className="text-blue-600" />;
            case 'cancelado': return <XCircle size={16} className="text-red-600" />;
            default: return <Clock size={16} className="text-yellow-600" />;
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-400">
            Cargando historial...
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2 text-center">Mis Pedidos</h1>
            <p className="text-center text-gray-500 text-sm mb-12">Historial de compras y seguimiento</p>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-lg text-gray-900 font-medium mb-2">Aún no tienes pedidos</p>
                    <p className="text-gray-500 text-sm mb-6">Descubre nuestra nueva colección y realiza tu primera compra.</p>
                    <Link href="/" className="inline-block bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition">
                        Ir a la Tienda
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="group bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                
                                {/* Info Principal */}
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-sm font-bold text-gray-900">Orden #{order.order_number}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 border ${
                                            order.status === 'entregado' ? 'bg-green-50 text-green-700 border-green-100' :
                                            order.status === 'cancelado' ? 'bg-red-50 text-red-700 border-red-100' :
                                            'bg-yellow-50 text-yellow-700 border-yellow-100'
                                        }`}>
                                            {getStatusIcon(order.status)}
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {formatDate(order.created_at)} • Pago con {order.payment_method}
                                    </p>
                                </div>

                                {/* Total y Botón */}
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <p className="text-lg font-serif font-bold text-gray-900">
                                        {formatCurrency(order.total)}
                                    </p>
                                    <Link 
                                        href={`/orders/${order.id}`}
                                        className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:underline decoration-1 underline-offset-4"
                                    >
                                        Ver Detalles <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}