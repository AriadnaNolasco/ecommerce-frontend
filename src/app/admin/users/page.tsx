'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/lib/admin-service';
import { AdminUser } from '@/types/admin';
import Link from 'next/link';
import { UserCog, ArrowLeft, Mail, Shield, Search, Users } from 'lucide-react';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'cliente' | 'admin'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await adminService.getAllUsers();
                // Validación de seguridad por si la API falla
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    setUsers([]);
                }
            } catch (error) {
                console.error(error);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Lógica de filtrado
    const filteredUsers = users.filter(user => {
        const matchesTab = activeTab === 'all' || user.role === activeTab;
        // Protección contra valores nulos
        const userName = user.name || '';
        const userEmail = user.email || '';
        
        const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              userEmail.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const adminsCount = users.filter(u => u.role === 'admin').length;
    const clientsCount = users.filter(u => u.role === 'cliente').length;

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Cargando Usuarios...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white border border-gray-200 rounded-lg hover:border-black transition">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-gray-900">Usuarios</h1>
                            <p className="text-sm text-gray-500">Gestión de roles y accesos</p>
                        </div>
                    </div>
                    
                    {/* Buscador */}
                    <div className="relative w-full md:w-64">
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre o email..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition text-sm"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                </div>

                {/* Pestañas de Filtro */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1 overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all border-b-2 whitespace-nowrap ${
                            activeTab === 'all' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Todos ({users.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('cliente')}
                        className={`px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all border-b-2 whitespace-nowrap ${
                            activeTab === 'cliente' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Clientes ({clientsCount})
                    </button>
                    <button 
                        onClick={() => setActiveTab('admin')}
                        className={`px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all border-b-2 whitespace-nowrap ${
                            activeTab === 'admin' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Admins ({adminsCount})
                    </button>
                </div>
                
                {/* Tabla de Usuarios */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Historial</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${user.role === 'admin' ? 'bg-black' : 'bg-gray-400'}`}>
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail size={10} /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white rounded text-[10px] font-bold uppercase tracking-wider">
                                                    <Shield size={10} /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                                    <Users size={10} /> Cliente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${user.active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-xs font-medium text-gray-600">{user.active ? 'Activo' : 'Bloqueado'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <ShoppingBagIcon count={user.total_orders || 0} />
                                                <span className="font-medium">{user.total_orders || 0} pedidos</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={`/admin/users/${user.id}`} 
                                                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide hover:underline decoration-1 underline-offset-4"
                                            >
                                                <UserCog size={14} /> Gestionar
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredUsers.length === 0 && !loading && (
                        <div className="p-12 text-center text-gray-400">
                            No se encontraron usuarios.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Icono auxiliar
function ShoppingBagIcon({ count }: { count: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={count > 0 ? "text-blue-600" : "text-gray-300"}>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
    );
}