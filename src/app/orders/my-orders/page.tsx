'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/lib/order-service';
import { OrderListItem } from '@/types/order';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth-service';
import { Package, Eye, Clock, CheckCircle, XCircle, Truck, Calendar, CreditCard } from 'lucide-react';

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Verificar sesión
        const token = authService.getToken();
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const userOrders = await orderService.getMyOrders();
                // Aseguramos que sea un array
                setOrders(Array.isArray(userOrders) ? userOrders : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(amount));

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'entregado': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase bg-green-100 text-green-800"><CheckCircle size={12}/> Entregado</span>;
            case 'enviado': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800"><Truck size={12}/> Enviado</span>;
            case 'cancelado': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800"><XCircle size={12}/> Cancelado</span>;
            default: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase bg-yellow-100 text-yellow-800"><Clock size={12}/> Pendiente</span>;
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-400">
            Cargando historial...
        </div>
    );

    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen bg-white">
            
            {/* Header de Sección */}
            <div className="mb-10 border-b border-gray-100 pb-6">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Mis Pedidos</h1>
                <p className="text-sm text-gray-500">Historial de compras y estado de envíos</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 rounded-xl border border-gray-100">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Aún no tienes pedidos</h3>
                    <p className="text-gray-500 text-sm mb-8">Descubre nuestra nueva colección y realiza tu primera compra.</p>
                    <Link href="/" className="inline-block bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition">
                        Explorar Tienda
                    </Link>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            {/* Cabecera de Tabla */}
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">Nº Orden</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Fecha</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Total</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Pago</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Estado</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Detalle</th>
                                </tr>
                            </thead>
                            
                            {/* Cuerpo de Tabla */}
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-5 font-mono text-blue-600 font-medium">
                                            {order.order_number}
                                        </td>
                                        <td className="px-6 py-5 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {formatDate(order.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-gray-900">
                                            {formatCurrency(order.total)}
                                        </td>
                                        <td className="px-6 py-5 capitalize text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <CreditCard size={14} className="text-gray-400" />
                                                {order.payment_method}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Link 
                                                href={`/orders/${order.id}`}
                                                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-900 hover:text-blue-600 transition-colors border-b border-transparent hover:border-blue-600 pb-0.5"
                                            >
                                                Ver <Eye size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}