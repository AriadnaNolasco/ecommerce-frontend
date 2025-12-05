'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth-service';
import { adminService } from '@/lib/admin-service';
import { AdminUser, DashboardStats } from '@/types/admin';
import Link from 'next/link';
import { User } from '@/types/auth';

// Hook simple para gestionar el estado de autenticación (Se puede mover a un archivo utils)
const useAuth = () => {
    const [user, setUser] = useState<{ role: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const profile = await authService.getProfile();
            if (profile) {
                setUser({ role: profile.role });
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    return { user, isLoading };
};

export default function AdminPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');

    // 1. Lógica de Protección y Redirección
    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                // No autenticado -> Login
                router.push('/login');
            } else if (user.role !== 'admin') {
                // Autenticado pero no admin -> Home
                router.push('/');
                alert('Acceso denegado: No tienes permisos de administrador.');
            }
        }
    }, [user, isLoading, router]);

    // 2. Carga de Datos (Solo si es admin)
    useEffect(() => {
        if (user?.role === 'admin') {
            const loadData = async () => {
                setDataLoading(true);
                try {
                    // Carga simultánea de estadísticas y usuarios
                    const [dashboardStats, allUsers] = await Promise.all([
                        adminService.getDashboardStats(),
                        adminService.getAllUsers(),
                    ]);

                    setStats(dashboardStats);
                    setUsers(allUsers);
                } catch (err: any) {
                    console.error(err);
                    // Si hay error en la petición (ej. token expirado/rol negado), redirigir
                    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                        authService.logout(); // Limpiar token y forzar login
                    } else {
                        setError('Error al cargar datos del dashboard. Verifica la conexión del backend.');
                    }
                } finally {
                    setDataLoading(false);
                }
            };
            loadData();
        }
    }, [user]);

    // Pantalla de Carga Inicial (mientras se resuelve la autenticación)
    if (isLoading || !user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-xl text-gray-500">
                    Cargando o verificando permisos...
                </div>
            </div>
        );
    }

    // Helper para formatear moneda
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-4xl font-extrabold text-red-600 mb-8 border-b pb-4">
                Panel de Administración 📊
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Indicador de Carga para los datos */}
            {dataLoading ? (
                <div className="text-center py-20">
                    <p className="text-gray-500">Cargando estadísticas...</p>
                </div>
            ) : (
                <div className="space-y-12">

                    {/* SECCIÓN 1: ESTADÍSTICAS GENERALES */}
                    <section>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Resumen Mensual</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Tarjeta de Ventas Totales (total_sales) */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500">
                                <p className="text-sm font-medium text-gray-500">Ventas del Mes</p>
                                <p className="text-4xl font-extrabold text-blue-700 mt-1">
                                    {stats?.total_sales !== undefined ? formatCurrency(stats.total_sales) : 'N/A'}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">Ventas de este mes (excl. cancelados)</p>
                            </div>

                            {/* Tarjeta de Total de Pedidos (total_orders) */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500">
                                <p className="text-sm font-medium text-gray-500">Total Pedidos</p>
                                <p className="text-4xl font-extrabold text-green-700 mt-1">
                                    {stats?.total_orders?.toLocaleString() ?? 'N/A'}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">Total de pedidos realizados</p>
                            </div>

                            {/* Tarjeta de Usuarios Activos (total_users) */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-purple-500">
                                <p className="text-sm font-medium text-gray-500">Usuarios Activos</p>
                                <p className="text-4xl font-extrabold text-purple-700 mt-1">
                                    {stats?.total_users?.toLocaleString() ?? 'N/A'}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">Usuarios con cuenta activa</p>
                            </div>
                        </div>
                    </section>

                    {/* SECCIÓN 2: LISTA DE USUARIOS */}
                    <section>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Usuarios ({users.length})</h2>

                        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Gastado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((userItem) => (
                                        <tr key={userItem.id} className={userItem.role === 'admin' ? 'bg-red-50/50 hover:bg-red-100/50' : 'hover:bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{userItem.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <Link href={`/admin/users/${userItem.id}`} className="text-indigo-600 hover:text-indigo-900 font-semibold">
                                                    {userItem.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{userItem.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 capitalize">{userItem.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${userItem.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {userItem.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {/* Es necesario parsear a float para formatear la moneda */}
                                                {formatCurrency(parseFloat(userItem.total_spent))}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* Enlace al detalle/edición */}
                                                <Link href={`/admin/users/${userItem.id}`} className="text-indigo-600 hover:text-indigo-900">
                                                    Editar
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* SECCIÓN 3: ÓRDENES RECIENTES */}
                    <section>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Órdenes Recientes ({stats?.recent_orders.length ?? 0})</h2>
                        <div className="text-gray-500 bg-white p-4 rounded-xl shadow-lg">
                            <p>La tabla de órdenes recientes se implementará en pasos posteriores.</p>
                        </div>
                    </section>

                </div>
            )}
        </div>
    );
}