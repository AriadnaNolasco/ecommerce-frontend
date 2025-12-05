'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from '@/types/auth';
import { authService } from '@/lib/auth-service';
import { useRouter } from 'next/navigation';

// Hook simple para gestionar el estado de autenticación
const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const profile = await authService.getProfile();
            setUser(profile);
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    return { user, isLoading };
};

export default function Navbar() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        authService.logout();
        // No es necesario llamar a router.push ya que authService.logout ya redirige
    };

    // Mientras carga el perfil, muestra un estado mínimo
    if (isLoading) {
        return (
            <header className="bg-white shadow-md">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <span className="text-xl font-bold text-gray-800">Cargando...</span>
                </nav>
            </header>
        );
    }

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                {/* Logo/Home */}
                <Link href="/" className="text-2xl font-extrabold text-blue-600 hover:text-blue-800 transition">
                    🛍️ Marketplace
                </Link>

                {/* Links de Navegación */}
                <div className="flex items-center space-x-6">
                    <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">
                        Productos
                    </Link>

                    {/* Link para Admin */}
                    {user?.role === 'admin' && (
                        <Link href="/admin" className="text-red-600 hover:text-red-800 font-bold">
                            ADMIN
                        </Link>
                    )}

                    {/* Estado de Sesión */}
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700 font-semibold">
                                Hola, {user.name} ({user.role})
                            </span>
                            <button
                                onClick={handleLogout}
                                className="py-1.5 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    ) : (
                        <div className="space-x-2">
                            <Link href="/login" className="py-1.5 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium">
                                Iniciar Sesión
                            </Link>
                            <Link href="/register" className="py-1.5 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition text-sm font-medium">
                                Registrar
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}