'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService } from '@/lib/admin-service';
import { AdminUser } from '@/types/admin';
import { Role } from '@/types/auth';

interface UserDetailPageProps {
    params: { id: string };
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
    const { id: userId } = params;
    const router = useRouter();

    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // La protección de ruta inicial se delega al componente padre /admin/page.tsx
        // Aquí solo cargamos los datos
        const fetchUser = async () => {
            setLoading(true);
            try {
                const userData = await adminService.getUserById(userId);
                if (userData) {
                    setUser(userData);
                } else {
                    setError('Usuario no encontrado o acceso denegado.');
                }
            } catch (err: any) {
                console.error(err);
                setError('Error al cargar datos del usuario.');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    // --- Handlers de Acciones ---

    const handleRoleChange = async (newRole: string) => {
        if (!user || isSubmitting) return;

        if (user.role === newRole) return; // No hacer nada si es el mismo rol
        if (!window.confirm(`¿Estás seguro de cambiar el rol de ${user.name} a ${newRole}?`)) return;

        setIsSubmitting(true);
        try {
            await adminService.updateUserRole(userId, newRole as Role);
            alert('Rol actualizado exitosamente.');
            setUser(prev => prev ? { ...prev, role: newRole as Role } : null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!user || isSubmitting) return;

        const newStatus = !user.active;
        const action = newStatus ? 'activar' : 'desactivar';

        if (!window.confirm(`¿Estás seguro de ${action} la cuenta de ${user.name}?`)) return;

        setIsSubmitting(true);
        try {
            await adminService.toggleUserStatus(userId, newStatus);
            alert(`Cuenta ${action}da exitosamente.`);
            setUser(prev => prev ? { ...prev, active: newStatus } : null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: string) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(parseFloat(amount));

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-500"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="max-w-4xl mx-auto p-8 my-10 bg-red-50 rounded-xl border-2 border-red-300">
                <p className="text-xl text-red-700 font-semibold">{error || 'Error al cargar los datos del usuario.'}</p>
                <Link href="/admin" className="text-red-600 hover:text-red-800 mt-4 inline-block">← Volver al Panel</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <Link href="/admin" className="text-red-600 hover:text-red-800 mb-6 inline-block font-medium">
                ← Volver al Panel de Usuarios
            </Link>

            <div className="bg-white shadow-2xl rounded-2xl p-8 space-y-8">

                {/* Cabecera y Estado */}
                <div className="flex justify-between items-start border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">{user.name}</h1>
                        <p className="text-gray-500">{user.email}</p>
                    </div>
                    <span className={`px-4 py-1 rounded-full font-bold uppercase text-sm ${user.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                </div>

                {/* Sección de Métricas */}
                <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-500">ID Usuario</p>
                        <p className="text-lg font-bold text-gray-800">{user.id}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-500">Pedidos Totales</p>
                        <p className="text-2xl font-bold text-blue-600">{user.total_orders}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-500">Monto Gastado</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(user.total_spent)}</p>
                    </div>
                </div>

                {/* Sección de Gestión de Permisos */}
                <div className="border-t pt-6 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800">Gestión de Cuenta</h2>

                    {/* Control de Rol */}
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                        <div>
                            <p className="font-semibold text-gray-900">Rol Actual:</p>
                            <p className={`capitalize font-bold text-lg ${user.role === 'admin' ? 'text-red-600' : 'text-blue-600'}`}>
                                {user.role}
                            </p>
                        </div>
                        <div className="space-x-3">
                            <button
                                onClick={() => handleRoleChange('cliente')}
                                disabled={user.role === 'cliente' || isSubmitting}
                                className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
                            >
                                {isSubmitting ? 'Cambiando...' : 'Degradar a Cliente'}
                            </button>
                            <button
                                onClick={() => handleRoleChange('admin')}
                                disabled={user.role === 'admin' || isSubmitting}
                                className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
                            >
                                {isSubmitting ? 'Cambiando...' : 'Promover a Admin'}
                            </button>
                        </div>
                    </div>

                    {/* Control de Estado */}
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                        <div>
                            <p className="font-semibold text-gray-900">Estado de Cuenta:</p>
                            <p className={`font-bold text-lg ${user.active ? 'text-green-600' : 'text-gray-600'}`}>
                                {user.active ? 'Activa' : 'Desactivada'}
                            </p>
                        </div>
                        <button
                            onClick={handleToggleStatus}
                            disabled={isSubmitting}
                            className={`py-2 px-4 text-white rounded-lg transition disabled:opacity-50 ${user.active ? 'bg-gray-700 hover:bg-gray-800' : 'bg-green-700 hover:bg-green-800'}`}
                        >
                            {isSubmitting
                                ? 'Procesando...'
                                : user.active
                                    ? 'Desactivar Cuenta'
                                    : 'Activar Cuenta'
                            }
                        </button>
                    </div>

                    <p className="text-xs text-gray-400">Creado el: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>

                {/* Placeholder para Lista de Pedidos del Usuario */}
                <div className="border-t pt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Pedidos de {user.name}</h2>
                    <p className="text-gray-500">Se mostraría un listado de los pedidos realizados por este usuario.</p>
                </div>
            </div>
        </div>
    );
}