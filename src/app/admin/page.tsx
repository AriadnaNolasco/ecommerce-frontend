'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth-service';
import { adminService } from '@/lib/admin-service';
import { DashboardStats } from '@/types/admin';
import Link from 'next/link';
import { 
    DollarSign, ShoppingBag, Users, TrendingUp, 
    Package, ClipboardList, UserCog, ArrowRight 
} from 'lucide-react';
import SalesChart from '@/components/admin/SalesChart';

export default function AdminPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const user = await authService.getProfile();
            if (user?.role !== 'admin') {
                router.push('/'); // Si no es admin, fuera
                return;
            }
            try {
                const data = await adminService.getDashboardStats();
                setStats(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router]);

    if (loading) return null; // El loader global ya se encarga

    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Admin */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Dashboard General</h1>
                    <p className="text-sm text-gray-500 mt-1">Bienvenido al panel de gestión de FINA PERÚ</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
                
                {/* 1. MÉTRICAS PRINCIPALES */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Ventas */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ventas del Mes</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats?.total_sales || 0)}</h3>
                            <span className="text-xs text-green-600 flex items-center mt-2 font-medium">
                                <TrendingUp size={14} className="mr-1" /> +12% vs mes anterior
                            </span>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <DollarSign size={24} />
                        </div>
                    </div>

                    {/* Pedidos */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pedidos Totales</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_orders}</h3>
                            <span className="text-xs text-gray-500 mt-2 block">Procesados exitosamente</span>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <ShoppingBag size={24} />
                        </div>
                    </div>

                    {/* Usuarios */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Usuarios</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_users}</h3>
                            <span className="text-xs text-gray-500 mt-2 block">Clientes registrados</span>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <Users size={24} />
                        </div>
                    </div>
                </section>

                {/* 2. ACCESOS RÁPIDOS A GESTIÓN (Lo que pediste) */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Gestión de Tienda</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Gestión de Productos */}
                        <Link href="/admin/products" className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-black transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gray-100 rounded-full group-hover:bg-black group-hover:text-white transition">
                                    <Package size={24} />
                                </div>
                                <ArrowRight size={20} className="text-gray-300 group-hover:text-black" />
                            </div>
                            <h3 className="font-bold text-gray-900">Productos</h3>
                            <p className="text-sm text-gray-500 mt-1">Crear, editar y gestionar inventario y tallas.</p>
                        </Link>

                        {/* Gestión de Pedidos (Próximamente implementaremos la vista completa) */}
                        <Link href="/admin/orders" className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-black transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gray-100 rounded-full group-hover:bg-black group-hover:text-white transition">
                                    <ClipboardList size={24} />
                                </div>
                                <ArrowRight size={20} className="text-gray-300 group-hover:text-black" />
                            </div>
                            <h3 className="font-bold text-gray-900">Pedidos</h3>
                            <p className="text-sm text-gray-500 mt-1">Ver estados, cambiar a enviado/entregado.</p>
                        </Link>

                        {/* Gestión de Usuarios */}
                        <Link href="/admin/users" className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-black transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gray-100 rounded-full group-hover:bg-black group-hover:text-white transition">
                                    <UserCog size={24} />
                                </div>
                                <ArrowRight size={20} className="text-gray-300 group-hover:text-black" />
                            </div>
                            <h3 className="font-bold text-gray-900">Usuarios</h3>
                            <p className="text-sm text-gray-500 mt-1">Gestionar roles y accesos de clientes.</p>
                        </Link>
                    </div>
                </section>

                {/* 3. GRÁFICOS */}
                <section className="grid lg:grid-cols-2 gap-8">
                    {stats?.sales_by_day && <SalesChart data={stats.sales_by_day} type="line" />}
                    {stats?.sales_by_category && <SalesChart data={stats.sales_by_category} type="bar" />}
                </section>

                {/* 4. ÚLTIMOS PEDIDOS (Resumen rápido) */}
                <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Últimos 5 Pedidos</h3>
                        <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline font-bold uppercase">Ver todos</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Nº Orden</th>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3">Estado</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats?.recent_orders?.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-blue-600">{order.order_number}</td>
                                        <td className="px-6 py-4">{order.user_name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'entregado' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold">{formatCurrency(order.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}