'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService } from '@/lib/admin-service';
import { AdminUser } from '@/types/admin';
import { Role } from '@/types/auth';
import { ArrowLeft, ShoppingBag, CreditCard, User as UserIcon, ShieldAlert, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
    const router = useRouter();
    const [userId, setUserId] = useState<string>('');
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const unwrapParams = async () => {
            const resolvedParams = await params;
            setUserId(resolvedParams.id);
        };
        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (!userId) return;
        
        const fetchUser = async () => {
            setLoading(true);
            try {
                const userData = await adminService.getUserById(userId);
                if (userData) {
                    setUser(userData);
                } else {
                    setError('Usuario no encontrado.');
                }
            } catch (err: any) {
                console.error(err);
                setError('Error al cargar datos.');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    const handleRoleChange = async (newRole: string) => {
        if (!user || isSubmitting) return;
        if (user.role === newRole) return;
        
        const confirmMsg = newRole === 'admin' 
            ? `⚠️ ¿Hacer ADMIN a ${user.name}?\nTendrá acceso total al panel.` 
            : `¿Quitar permisos de admin a ${user.name}?`;

        if (!window.confirm(confirmMsg)) return;

        setIsSubmitting(true);
        try {
            await adminService.updateUserRole(userId, newRole as Role);
            toast.success(`Rol actualizado a ${newRole.toUpperCase()}`);
            setUser(prev => prev ? { ...prev, role: newRole as Role } : null);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!user || isSubmitting) return;
        const newStatus = !user.active;
        
        if (!window.confirm(`¿${newStatus ? 'Activar' : 'BLOQUEAR'} acceso a ${user.name}?`)) return;

        setIsSubmitting(true);
        try {
            await adminService.toggleUserStatus(userId, newStatus);
            toast.success(`Usuario ${newStatus ? 'activado' : 'bloqueado'}`);
            setUser(prev => prev ? { ...prev, active: newStatus } : null);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!user || isSubmitting) return;
        
        const confirm1 = window.confirm(`⛔ PELIGRO: ¿Estás seguro de ELIMINAR PERMANENTEMENTE a ${user.name}?`);
        if (!confirm1) return;
        
        const confirm2 = window.confirm(`Esta acción no se puede deshacer. Se borrará todo el historial. ¿Proceder?`);
        if (!confirm2) return;

        setIsSubmitting(true);
        try {
            await adminService.deleteUser(userId); 
            toast.success('Usuario eliminado correctamente');
            router.push('/admin/users');
        } catch (err: any) {
            toast.error('Error al eliminar: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: string) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(parseFloat(amount));

    if (loading) return <div className="min-h-screen flex items-center justify-center text-xs font-bold uppercase text-gray-400">Cargando...</div>;

    if (error || !user) return (
        <div className="max-w-4xl mx-auto py-20 text-center">
            <p className="text-gray-500 mb-4">{error || 'Usuario no encontrado'}</p>
            <Link href="/admin/users" className="text-black underline text-sm">Volver a Usuarios</Link>
        </div>
    );

    // Variable para verificar si el usuario que estamos viendo es admin
    const isUserAdmin = user.role === 'admin';

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/users" className="text-gray-500 hover:text-black text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-8 transition-colors">
                    <ArrowLeft size={16} /> Volver a la lista
                </Link>

                {/* Tarjeta Principal */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-8">
                    {/* Si es admin, quitamos el borde inferior para que se vea como una tarjeta única */}
                    <div className={`p-8 flex justify-between items-start ${!isUserAdmin ? 'border-b border-gray-100' : ''} ${isUserAdmin ? 'bg-gray-50/30' : ''}`}>
                        <div className="flex gap-6 items-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                <UserIcon size={40} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-serif font-bold text-gray-900">{user.name}</h1>
                                <p className="text-gray-500 text-sm mt-1">{user.email}</p>
                                <div className="flex gap-2 mt-3">
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                                        isUserAdmin ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {user.role}
                                    </span>
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                                        user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {user.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                            ID: #{user.id} <br />
                            Registrado: {new Date(user.created_at).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Estadísticas: SOLO SE MUESTRAN SI NO ES ADMIN */}
                    {!isUserAdmin && (
                        <div className="grid grid-cols-2 divide-x divide-gray-100">
                            <div className="p-8 flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pedidos</p>
                                    <p className="text-2xl font-light text-gray-900">{user.total_orders}</p>
                                </div>
                            </div>
                            <div className="p-8 flex items-center gap-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Gastado</p>
                                    <p className="text-2xl font-light text-gray-900">{formatCurrency(user.total_spent)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Panel de Gestión */}
                <div className="bg-white border border-gray-200 rounded-xl p-8">
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-6">Acciones de Cuenta</h3>
                    
                    <div className="space-y-6">
                        {/* Cambio de Rol */}
                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition">
                            <div className="flex items-center gap-4">
                                <ShieldAlert className="text-gray-400" />
                                <div>
                                    <p className="font-bold text-sm text-gray-900">Nivel de Acceso</p>
                                    <p className="text-xs text-gray-500">Define los permisos del usuario en la plataforma.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleRoleChange('cliente')}
                                    disabled={user.role === 'cliente' || isSubmitting}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition ${
                                        user.role === 'cliente' ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-white border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    Cliente
                                </button>
                                <button
                                    onClick={() => handleRoleChange('admin')}
                                    disabled={user.role === 'admin' || isSubmitting}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition ${
                                        user.role === 'admin' ? 'bg-black text-white cursor-default' : 'bg-white border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    Admin
                                </button>
                            </div>
                        </div>

                        {/* Activar/Desactivar */}
                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition">
                            <div className="flex items-center gap-4">
                                <Power className={user.active ? "text-green-500" : "text-red-500"} />
                                <div>
                                    <p className="font-bold text-sm text-gray-900">Estado de la cuenta</p>
                                    <p className="text-xs text-gray-500">Bloquea temporalmente el acceso.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleToggleStatus}
                                disabled={isSubmitting}
                                className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded text-white transition ${
                                    user.active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {isSubmitting ? '...' : user.active ? 'Bloquear' : 'Desbloquear'}
                            </button>
                        </div>

                        {/* Zona de Peligro: Eliminar Cuenta */}
                        <div className="pt-6 border-t border-red-100 mt-6">
                            <div className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-lg hover:border-red-200 transition group">
                                <div className="flex items-center gap-4">
                                    <Trash2 className="text-red-400 group-hover:text-red-600 transition" />
                                    <div>
                                        <p className="font-bold text-sm text-red-900">Eliminar Usuario</p>
                                        <p className="text-xs text-red-700/70">Esta acción es irreversible. Se perderán todos los datos.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 text-xs font-bold uppercase tracking-widest rounded text-red-700 border border-red-200 hover:bg-red-600 hover:text-white transition"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}