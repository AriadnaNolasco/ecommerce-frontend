'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/product';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShoppingCart, CreditCard } from 'lucide-react';

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const router = useRouter();
    
    // Protección contra arrays vacíos o nulos
    const colors = product.colors || [];
    const stocks = product.stock_by_size || [];

    // Estado inicial seguro (si no hay colores, null)
    const [selectedColor, setSelectedColor] = useState(colors.length > 0 ? colors[0] : null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    // Calcular stock disponible para la talla seleccionada
    const selectedStock = stocks.find(s => s.size === selectedSize);
    const availableStock = selectedStock?.stock || 0;

    const handleAddToCart = (redirect = false) => {
        if (!selectedSize) {
            toast.error('Por favor selecciona una talla');
            return;
        }

        // Si el producto no tiene colores (error de datos), usamos un genérico
        const colorToSave = selectedColor ? selectedColor.color_name : 'Único';
        const colorHexToSave = selectedColor ? selectedColor.color_hex : '#000000';

        addToCart({
            product_id: product.id,
            name: product.name,
            color: colorToSave,
            size: selectedSize,
            quantity,
            price: product.price,
            image: product.images[0] || '',
        });

        toast.success(`Agregado al carrito: ${product.name}`);
        
        if (redirect) router.push('/cart');
    };

    return (
        <div className="space-y-8">
            {/* 1. Selector de Color */}
            {colors.length > 0 ? (
                <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-900">
                        Color: <span className="text-gray-500 font-normal ml-1">{selectedColor?.color_name}</span>
                    </span>
                    <div className="flex gap-3">
                        {colors.map((color) => (
                            <button
                                key={color.color_hex}
                                onClick={() => setSelectedColor(color)}
                                className={`w-8 h-8 rounded-full border border-gray-200 shadow-sm transition-all ${
                                    selectedColor?.color_hex === color.color_hex 
                                        ? 'ring-2 ring-offset-2 ring-black scale-110' 
                                        : 'hover:scale-105'
                                }`}
                                style={{ backgroundColor: color.color_hex }}
                                title={color.color_name}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-xs text-gray-400 italic">Color único</p>
            )}

            {/* 2. Selector de Talla */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-900">Talla</span>
                    <button className="text-xs text-gray-500 underline hover:text-black">Guía de tallas</button>
                </div>
                
                {stocks.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {stocks.map((stock) => {
                            const isAvailable = stock.stock > 0;
                            const isSelected = selectedSize === stock.size;
                            
                            return (
                                <button
                                    key={stock.size}
                                    onClick={() => isAvailable && setSelectedSize(stock.size)}
                                    disabled={!isAvailable}
                                    className={`
                                        py-2 text-xs font-bold border transition-all
                                        ${!isAvailable 
                                            ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed decoration-slice line-through' 
                                            : isSelected
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-gray-900 border-gray-200 hover:border-black'
                                        }
                                    `}
                                >
                                    {stock.size}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-red-500">No hay stock disponible</p>
                )}

                {/* Mensaje de stock bajo */}
                {selectedSize && availableStock > 0 && availableStock < 5 && (
                    <p className="text-xs text-red-600 animate-pulse">
                        ¡Solo quedan {availableStock} unidades!
                    </p>
                )}
            </div>

            {/* 3. Botones de Acción */}
            <div className="flex flex-col gap-3 pt-4">
                <button
                    onClick={() => handleAddToCart(false)}
                    disabled={!selectedSize || availableStock === 0}
                    className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex justify-center gap-2 items-center"
                >
                    <ShoppingCart size={16} />
                    {availableStock === 0 ? 'Agotado' : 'Añadir a mi cesta'}
                </button>
                
                <button
                    onClick={() => handleAddToCart(true)}
                    disabled={!selectedSize || availableStock === 0}
                    className="w-full bg-white text-black border border-black py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2 items-center"
                >
                   <CreditCard size={16} /> Comprar Ahora
                </button>
            </div>
        </div>
    );
}