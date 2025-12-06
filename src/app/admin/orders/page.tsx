'use client';

import { useEffect, useState } from 'react';
import { authenticatedClient } from '@/lib/api-client'; 
import Link from 'next/link';
import { Eye, Truck, PackageCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);

    // Función para obtener órdenes
    const fetchOrders = async () => {
        try {
            const res = await authenticatedClient.get('/orders'); // Endpoint de admin
            setOrders(res.data.orders);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pendiente': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={12}/> Pendiente</span>;
            case 'enviado': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Truck size={12}/> Enviado</span>;
            case 'entregado': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><PackageCheck size={12}/> Entregado</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-7xl mx-auto">
                
                {/* Header con Flecha de Retorno */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 bg-white border border-gray-200 rounded-lg hover:border-black transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900">Pedidos</h1>
                        <p className="text-sm text-gray-500">Gestión de órdenes ({orders.length})</p>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">Nº Orden</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-sm">{order.order_number}</td>
                                    <td className="px-6 py-4 text-sm font-bold">{order.user_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm font-bold">S/ {Number(order.total).toFixed(2)}</td>
                                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline text-sm font-bold flex items-center justify-end gap-1">
                                            <Eye size={14} /> Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && !loading && (
                        <div className="p-12 text-center text-gray-400">No hay pedidos registrados.</div>
                    )}
                </div>
            </div>
        </div>
    );
}