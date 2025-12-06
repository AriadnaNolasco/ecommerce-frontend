'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/lib/auth-service';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Estado para ver contraseña
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authService.login({ email, password });
            if (response.success) {
                toast.success('Bienvenido de nuevo');
                window.location.href = '/'; 
            } else {
                toast.error(response.message || 'Credenciales inválidas');
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
            <div className="hidden lg:block lg:w-1/2 relative">
                <Image
                    src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"
                    alt="Fashion Editorial"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-10 left-10 text-white">
                    <h2 className="text-4xl font-serif font-bold mb-2">FINA PERÚ</h2>
                    <p className="text-sm tracking-widest uppercase">Colección Otoño / Invierno 2024</p>
                </div>
            </div>

            {/* Columna Derecha */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">INICIAR SESIÓN</h1>
                        <p className="text-sm text-gray-500 tracking-wide uppercase">Accede a tu cuenta</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-10">
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
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Contraseña</label>
                                <a href="#" className="text-xs text-gray-500 hover:text-black hover:underline">¿Olvidaste tu contraseña?</a>
                            </div>
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
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition disabled:opacity-70 disabled:cursor-not-allowed mt-8"
                        >
                            {loading ? 'Iniciando...' : 'Ingresar'}
                        </button>
                    </form>

                    <div className="text-center mt-8 pt-8 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-4">¿Aún no tienes una cuenta?</p>
                        <Link 
                            href="/register" 
                            className="inline-block border border-black px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition duration-300"
                        >
                            Crear Cuenta
                        </Link>
                    </div>
                    
                    <p className="text-center text-[10px] text-gray-400 mt-8">
                        Admin Demo: admin@ecommerce.com / admin123
                    </p>
                </div>
            </div>
        </div>
    );
}