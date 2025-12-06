'use client';

import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { orderService } from '@/lib/order-service';
import { CreateOrderRequest } from '@/types/order';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { CreditCard, Truck, Lock, Smartphone, MapPin, Calendar, ShieldCheck } from 'lucide-react';

const DISTRITOS_LIMA = [
    "Cercado de Lima", "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos",
    "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María", "La Molina", "La Victoria",
    "Lince", "Los Olivos", "Lurigancho-Chosica", "Lurin", "Magdalena del Mar", "Miraflores", "Pachacámac",
    "Pucusana", "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac", "San Bartolo",
    "San Borja", "San Isidro", "San Juan de Lurigancho", "San Juan de Miraflores", "San Luis", "San Martín de Porres",
    "San Miguel", "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco", "Surquillo",
    "Villa El Salvador", "Villa María del Triunfo"
];

export default function CheckoutPage() {
    const { cart, totalAmount, clearCart } = useCart();
    const router = useRouter();
    const SHIPPING_COST = 0.00; 
    const finalTotal = totalAmount + SHIPPING_COST;
    
    const [loading, setLoading] = useState(false);
    
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvv: ''
    });

    const [formData, setFormData] = useState({
        shipping_name: '',
        shipping_phone: '',
        shipping_address: '',
        shipping_district: '',
        shipping_reference: '',
        payment_method: 'tarjeta' as const, // Único método disponible
    });

    useEffect(() => {
        if (cart.length === 0) {
            router.push('/');
        }
    }, [cart, router]);

    // --- FORMATEADORES ---

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
        const formatted = raw.replace(/(\d{3})(\d{3})?(\d{3})?/, (match, p1, p2, p3) => {
            return [p1, p2, p3].filter(Boolean).join(' ');
        });
        setFormData({ ...formData, shipping_phone: formatted });
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
        setCardData({ ...cardData, number: formatted });
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
        let formatted = raw;
        if (raw.length >= 3) {
            formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
        }
        setCardData({ ...cardData, expiry: formatted });
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 3);
        setCardData({ ...cardData, cvv: raw });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- SUBMIT ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (formData.payment_method === 'tarjeta') {
            if (cardData.number.replace(/\s/g, '').length < 16) {
                toast.error('Número de tarjeta incompleto');
                setLoading(false);
                return;
            }
            if (cardData.cvv.length < 3) {
                toast.error('CVV incompleto');
                setLoading(false);
                return;
            }
        }

        const toastId = toast.loading('Conectando con la pasarela de pagos...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        const requestBody: CreateOrderRequest = {
            ...formData,
            shipping_phone: formData.shipping_phone.replace(/\s/g, ''),
            items: cart.map(item => ({
                product_id: item.product_id,
                color: item.color, 
                size: item.size,
                quantity: item.quantity, 
                price: item.price,
                name: item.name 
            })),
            card_number: cardData.number.replace(/\s/g, '')
        };

        try {
            const res = await orderService.createOrder(requestBody);
            toast.dismiss(toastId);

            if (res.success) {
                toast.success('¡Pago Aprobado!', {
                    description: `Orden #${res.order.order_number} generada.`,
                    duration: 6000,
                });
                clearCart();
                router.push('/orders/my-orders');
            }
        } catch (error: any) {
            toast.dismiss(toastId);
            const msg = error.response?.data?.message || 'Error desconocido';
            toast.error('Pago Rechazado', { description: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-serif font-bold mb-10 text-center tracking-wider uppercase">Checkout Seguro</h1>
            
            <div className="grid lg:grid-cols-3 gap-10">
                {/* COLUMNA FORMULARIO */}
                <div className="lg:col-span-2 space-y-8">
                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* 1. Datos de Envío (Ya sin Email) */}
                        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="flex items-center gap-2 text-sm font-bold uppercase mb-6 border-b pb-2">
                                <Truck size={18} /> Dirección de Envío
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Recibe</span>
                                    <input name="shipping_name" onChange={handleChange} placeholder="Nombre y Apellidos" required className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none" />
                                </div>
                                
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Celular</span>
                                    <div className="relative">
                                        <Smartphone size={16} className="absolute left-3 top-4 text-gray-400" />
                                        <input 
                                            name="shipping_phone" 
                                            value={formData.shipping_phone}
                                            onChange={handlePhoneChange} 
                                            placeholder="999 999 999" 
                                            required 
                                            className="w-full mt-1 p-3 pl-10 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Distrito</span>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-4 text-gray-400" />
                                        <select 
                                            name="shipping_district" 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full mt-1 p-3 pl-10 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none appearance-none"
                                        >
                                            <option value="">Seleccionar Distrito</option>
                                            {DISTRITOS_LIMA.map(dist => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Dirección Exacta</span>
                                    <input name="shipping_address" onChange={handleChange} placeholder="Av. Calle, Nro, Dpto..." required className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none" />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Referencia (Opcional)</span>
                                    <input name="shipping_reference" onChange={handleChange} placeholder="Ej: Frente al parque..." className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded focus:border-black outline-none" />
                                </div>
                            </div>
                        </section>

                        {/* 2. Método de Pago (Solo Tarjeta) */}
                        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="flex items-center gap-2 text-sm font-bold uppercase mb-6 border-b pb-2">
                                <CreditCard size={18} /> Método de Pago
                            </h2>
                            
                            <div className="flex gap-4 mb-6">
                                <button
                                    type="button"
                                    className="flex-1 py-3 border rounded-lg text-sm font-bold uppercase transition border-black bg-black text-white cursor-default"
                                >
                                    Tarjeta de Crédito / Débito
                                </button>
                                {/* Yape eliminado */}
                            </div>

                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold uppercase text-gray-500">Detalles de Tarjeta</span>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-5 bg-gray-300 rounded"></div>
                                        <div className="w-8 h-5 bg-gray-300 rounded"></div>
                                    </div>
                                </div>
                                
                                {/* Input Número Tarjeta */}
                                <div>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                        <input 
                                            value={cardData.number}
                                            onChange={handleCardNumberChange}
                                            placeholder="0000 0000 0000 0000" 
                                            maxLength={19} 
                                            className="w-full p-3 pl-10 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none tracking-widest font-mono text-lg"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-gray-500">Vencimiento</span>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                            <input 
                                                value={cardData.expiry}
                                                onChange={handleExpiryChange}
                                                placeholder="MM/AA" 
                                                maxLength={5}
                                                className="w-full mt-1 p-3 pl-10 border border-gray-300 rounded focus:border-black outline-none text-center font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-gray-500">CVV</span>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                            <input 
                                                value={cardData.cvv}
                                                onChange={handleCvvChange}
                                                type="password"
                                                placeholder="123" 
                                                maxLength={3}
                                                className="w-full mt-1 p-3 pl-10 border border-gray-300 rounded focus:border-black outline-none text-center font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-[10px] text-gray-400 text-center pt-2">
                                    🔒 Encriptación SSL de 256-bits. Tu pago es seguro.
                                </p>
                            </div>
                        </section>
                    </form>
                </div>

                {/* COLUMNA LATERAL (Resumen) */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 shadow-lg rounded-xl border border-gray-100 sticky top-24">
                        <h3 className="text-lg font-serif font-bold mb-6 pb-4 border-b">Tu Pedido</h3>
                        
                        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar">
                            {cart.map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 w-10 h-12 rounded flex-shrink-0 overflow-hidden relative">
                                             <Image src={item.image} alt="" fill className="object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.quantity} x S/ {Number(item.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <span className="font-medium">S/ {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed border-gray-300 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>S/ {totalAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between text-gray-600"><span>Envío</span><span className="text-green-600 font-bold">GRATIS</span></div>
                            <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-gray-100">
                                <span>Total a Pagar</span>
                                <span>S/ {finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            form="checkout-form"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white mt-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Procesando...</>
                            ) : (
                                <><Lock size={16} /> Pagar S/ {finalTotal.toFixed(2)}</>
                            )}
                        </button>
                        
                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider">
                            <ShieldCheck size={14} /> Garantía de Devolución
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}