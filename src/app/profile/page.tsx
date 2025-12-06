'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth-service';
import { User } from '@/types/auth';
import Link from 'next/link';
import { User as UserIcon, Mail, Package, Heart, LogOut, Shield, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await authService.getProfile();
                if (!profile) {
                    router.push('/login');
                } else {
                    setUser(profile);
                }
            } catch (error) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-400">Cargando Perfil...</div>;

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Mi Cuenta</h1>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {/* Cabecera del Perfil */}
                    <div className="p-8 border-b border-gray-100 flex flex-col items-center text-center bg-white">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                            <UserIcon size={40} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                        <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">
                            <Mail size={14} /> {user.email}
                        </div>
                        <div className="mt-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                user.role === 'admin' ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                                {user.role}
                            </span>
                        </div>
                    </div>

                    {/* Opciones de Menú */}
                    <div className="divide-y divide-gray-100">
                        {/* Mis Pedidos */}
                        <Link href="/orders/my-orders" className="flex items-center justify-between p-6 hover:bg-gray-50 transition group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition">
                                    <Package size={20} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900 uppercase tracking-wide">Mis Pedidos</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Rastrea y ve tu historial de compras</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition" />
                        </Link>

                        {/* Lista de Deseos */}
                        <Link href="/wishlist" className="flex items-center justify-between p-6 hover:bg-gray-50 transition group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-pink-50 text-pink-500 rounded-lg group-hover:bg-pink-100 transition">
                                    <Heart size={20} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900 uppercase tracking-wide">Lista de Deseos</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Tus productos favoritos guardados</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition" />
                        </Link>

                        {/* Acceso Admin (Solo visible si es admin) */}
                        {user.role === 'admin' && (
                            <Link href="/admin" className="flex items-center justify-between p-6 hover:bg-gray-50 transition group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-black text-white rounded-lg group-hover:bg-gray-800 transition">
                                        <Shield size={20} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 uppercase tracking-wide">Panel de Admin</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Gestionar tienda, productos y usuarios</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition" />
                            </Link>
                        )}

                        {/* Cerrar Sesión */}
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between p-6 hover:bg-red-50 transition group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-100 text-gray-500 rounded-lg group-hover:bg-red-100 group-hover:text-red-600 transition">
                                    <LogOut size={20} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-600 group-hover:text-red-600 uppercase tracking-wide transition">Cerrar Sesión</p>
                                    <p className="text-xs text-gray-400 group-hover:text-red-400 transition">Salir de tu cuenta de forma segura</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}