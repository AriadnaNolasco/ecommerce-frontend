'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShieldCheck, CreditCard, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authService } from '@/lib/auth-service';

export default function CartPage() {
    const { cart, removeFromCart, totalAmount } = useCart();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    const SHIPPING_COST = 0.00; 
    const total = totalAmount + SHIPPING_COST;

    // Verificar si el usuario está logueado al cargar la página
    useEffect(() => {
        const checkLogin = async () => {
            const token = authService.getToken();
            setIsLoggedIn(!!token); 
            setIsLoadingAuth(false);
        };
        checkLogin();
    }, []);

    const formattedTotal = new Intl.NumberFormat('es-PE', {
        style: 'currency', currency: 'PEN', minimumFractionDigits: 2
    }).format(total);

    if (cart.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-32 text-center">
                <h1 className="text-3xl font-serif font-light mb-4 uppercase tracking-widest">Tu Cesta está vacía</h1>
                <p className="text-gray-500 mb-8 font-light">Parece que aún no has añadido nada a tu bolsa.</p>
                <Link href="/" className="inline-block border border-black px-10 py-4 uppercase text-xs font-bold tracking-widest hover:bg-black hover:text-white transition-colors duration-300">
                    Seguir Comprando
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-2xl font-bold uppercase tracking-wide mb-10 text-left border-b border-gray-100 pb-4">
                Cesta ({cart.length})
            </h1>

            <div className="flex flex-col lg:flex-row gap-12">
                
                {/* LISTA DE PRODUCTOS */}
                <div className="flex-1 space-y-8">
                    {cart.map((item, index) => (
                        <div key={`${item.product_id}-${item.size}-${index}`} className="flex gap-6 py-6 border-b border-gray-100 last:border-0">
                            <div className="relative w-32 h-44 bg-gray-50 flex-shrink-0">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="128px"
                                />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-sm uppercase tracking-wide">{item.name}</h3>
                                        <span className="font-medium text-sm">S/ {Number(item.price).toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Talla: {item.size}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Color: {item.color}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Cantidad: {item.quantity}</p>
                                </div>
                                <div className="flex gap-6 mt-4">
                                    <button 
                                        onClick={() => removeFromCart(item.product_id, item.size, item.color)}
                                        className="text-[10px] text-gray-400 uppercase tracking-widest hover:text-black underline transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 size={12} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RESUMEN DEL PEDIDO */}
                <div className="lg:w-[400px] flex-shrink-0">
                    <div className="bg-gray-50 p-8 sticky top-24">
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-6 pb-4 border-b border-gray-200">Resumen</h2>
                        
                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>S/ {totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Envío</span>
                                <span className="text-green-600 font-medium">GRATIS</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-gray-200 pt-4 mb-8">
                            <span className="font-bold text-base uppercase tracking-wide">Total</span>
                            <span className="font-bold text-xl">{formattedTotal}</span>
                        </div>

                        {/* LÓGICA DE BOTONES */}
                        <div className="space-y-3">
                            {isLoadingAuth ? (
                                <button disabled className="w-full bg-gray-200 text-gray-400 py-4 text-xs font-bold uppercase tracking-[0.2em]">
                                    Cargando...
                                </button>
                            ) : isLoggedIn ? (
                                <button 
                                    onClick={() => router.push('/checkout')}
                                    className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Lock size={14} /> Proceder al Pago Seguro
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => router.push('/login?redirect=/checkout')}
                                        className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-colors"
                                    >
                                        Iniciar Sesión para Pagar
                                    </button>
                                    <p className="text-[10px] text-gray-500 text-center mt-2">
                                        ¿No tienes cuenta? <Link href="/register" className="underline hover:text-black">Regístrate aquí</Link>
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <ShieldCheck size={16} /> Compra 100% Segura
                            </div>
                            <div className="flex gap-2 opacity-50">
                                <CreditCard size={24} /> 
                                <div className="h-6 w-10 bg-gray-300 rounded"></div>
                                <div className="h-6 w-10 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}