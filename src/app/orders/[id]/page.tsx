'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/lib/order-service';
import { Order, OrderItem } from '@/types/order-detail';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth-service';
import { ArrowLeft, MapPin, CreditCard, Package } from 'lucide-react';
import Image from 'next/image';

interface OrderDetailPageProps {
    params: Promise<{ id: string }>; // Params es una Promesa
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
    // 1. Desempaquetar params usando React.use()
    const [orderId, setOrderId] = useState<string>('');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    // Placeholder para imágenes si no cargan
    const placeholder = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000";

    useEffect(() => {
        // [5.1] Prevenir ejecución si orderId no se ha resuelto aún
        if (!orderId) return; ///page.tsx]

        if (!authService.getToken()) { ///page.tsx]
            router.push('/login'); ///page.tsx]
            return; ///page.tsx]
        }

        const fetchDetail = async () => { ///page.tsx]
            setLoading(true); ///page.tsx]
            try {
                // Ahora orderId es una cadena válida
                const data = await orderService.getOrderDetail(orderId); ///page.tsx]
                if (data) {
                    setOrder(data); ///page.tsx]
                } else {
                    setError('Pedido no encontrado o no tienes permiso.'); ///page.tsx]
                }
            } catch (err: any) {
                console.error(err); ///page.tsx]
                setError('Error al cargar el pedido.'); ///page.tsx]
            } finally {
                setLoading(false); ///page.tsx]
            }
        };

        fetchDetail(); ///page.tsx]
    }, [orderId, router]); ///page.tsx]

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-xs font-bold uppercase text-gray-400">Cargando...</div>;

    if (error || !order) return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
            <p className="text-gray-500">{error || 'No encontrado'}</p>
            <Link href="/orders/my-orders" className="text-black underline text-sm">Volver a la lista</Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 bg-white min-h-screen">
            <Link href="/orders/my-orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-black text-xs font-bold uppercase tracking-widest mb-8 transition-colors">
                <ArrowLeft size={14} /> Volver a mis pedidos
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Pedido #{order.order_number}</h1>
                    <p className="text-sm text-gray-500 mt-1">Realizado el {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${order.status === 'entregado' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                    {order.status.replace('_', ' ')}
                </span>
            </div>

            <div className="grid md:grid-cols-3 gap-12">

                {/* Columna Izquierda: Productos */}
                <div className="md:col-span-2 space-y-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2">Productos ({order.items.length})</h2>
                    <div className="space-y-6">
                        {order.items.map((item: OrderItem) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden relative flex-shrink-0">
                                    <Image src={placeholder} alt={item.product_name} fill className="object-cover opacity-80" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <Link href={`/products/${item.product_id}`} className="font-bold text-sm text-gray-900 hover:underline">
                                            {item.product_name}
                                        </Link>
                                        <span className="font-medium text-sm">{formatCurrency(item.subtotal)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {item.color} / {item.size} • Cantidad: {item.quantity}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Resumen de Costos */}
                    <div className="bg-gray-50 p-6 rounded-lg mt-6 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.total - order.shipping_cost)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Envío</span>
                            <span>{formatCurrency(order.shipping_cost)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-gray-900 pt-4 border-t border-gray-200 mt-2">
                            <span>Total Pagado</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Info Envío */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                            <MapPin size={16} /> Envío
                        </h2>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="font-bold text-gray-900">{order.shipping_name}</p>
                            <p>{order.shipping_address}</p>
                            <p>{order.shipping_district}</p>
                            <p className="text-xs text-gray-400 mt-2">{order.shipping_phone}</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                            <CreditCard size={16} /> Pago
                        </h2>
                        <div className="text-sm text-gray-600">
                            <p className="capitalize mb-1">{order.payment_method}</p>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${order.payment_status === 'aprobado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {order.payment_status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}