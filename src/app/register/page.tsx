'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/lib/auth-service';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Estado
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authService.register({ name, email, password });
            if (response.success) {
                toast.success('Cuenta creada exitosamente');
                window.location.href = '/';
            } else {
                toast.error(response.message || 'Error al registrarse');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Columna Izquierda */}
            <div className="hidden lg:block lg:w-1/2 relative order-2">
                <Image
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop"
                    alt="New Collection"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-10 right-10 text-white text-right">
                    <h2 className="text-3xl font-serif font-bold">ÚNETE A FINA</h2>
                    <p className="text-xs tracking-widest uppercase mt-2">Acceso exclusivo a nuevas colecciones</p>
                </div>
            </div>

            {/* Columna Derecha */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 order-1">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">CREAR CUENTA</h1>
                        <p className="text-sm text-gray-500 tracking-wide">Completa tus datos para comenzar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-10">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Nombre Completo</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className="w-full border-b border-gray-300 py-2 text-gray-900 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-gray-400"
                                placeholder="Tu Nombre"
                                required 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="w-full border-b border-gray-300 py-2 text-gray-900 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-gray-400"
                                placeholder="tu@email.com"
                                required 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Contraseña</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="w-full border-b border-gray-300 py-2 pr-10 text-gray-900 focus:outline-none focus:border-black transition-colors bg-transparent"
                                    placeholder="••••••••"
                                    required 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-2 text-gray-400 hover:text-black transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Mínimo 6 caracteres</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition disabled:opacity-70 disabled:cursor-not-allowed mt-8"
                        >
                            {loading ? 'Creando Cuenta...' : 'Registrarse'}
                        </button>
                    </form>

                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes una cuenta?{' '}
                            <Link href="/login" className="font-bold text-black hover:underline">
                                Iniciar Sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}