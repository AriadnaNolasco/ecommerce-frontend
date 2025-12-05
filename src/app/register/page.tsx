'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth-service';
import { User } from '@/types/auth';

// Componente simple de registro
export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authService.register({ name, email, password });

            if (response.success) {
                alert('Registro exitoso! Serás redirigido.');
                router.push('/'); // Redirige a la página principal
            } else {
                setError(response.message || 'Error en el registro.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error de conexión al servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-800">
                    Crear Cuenta 🛒
                </h1>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Registrando...' : 'Registrar'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Inicia Sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}