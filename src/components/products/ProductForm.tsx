'use client';

import { useState } from 'react';
import { ProductPayload, productService } from '@/lib/product-service';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { toast } from 'sonner';
import { X, Plus, Trash2 } from 'lucide-react';

// Valores iniciales seguros
const initialFormState: ProductPayload = {
    name: '', 
    description: '', 
    price: 0, 
    gender: 'mujer', 
    category: 'poleras', 
    style: 'casual',
    material: '', 
    care_instructions: '', 
    is_new: false,
    images: [''], 
    colors: [{ name: 'Negro', hex: '#000000' }], 
    stock: [{ size: 'M', quantity: 0 }],
};

interface ProductFormProps {
    initialProduct?: Product | null;
    onClose?: () => void;
}

const GENDERS = ['mujer', 'hombre', 'ninos'];
const CATEGORIES = ['poleras', 'pantalones', 'vestidos', 'chaquetas', 'zapatos'];
const STYLES = ['casual', 'formal', 'deportivo'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductForm({ initialProduct = null, onClose }: ProductFormProps) {
    const router = useRouter();
    const isEditMode = !!initialProduct;

    // Inicialización de estado segura (Protección contra nulos)
    const [formData, setFormData] = useState<ProductPayload>(() => {
        if (isEditMode && initialProduct) {
            return {
                ...initialFormState,
                ...initialProduct,
                // Mapeo seguro con optional chaining (?.) y valores por defecto (||)
                colors: initialProduct.colors?.map(c => ({ name: c.color_name, hex: c.color_hex })) || initialFormState.colors,
                stock: initialProduct.stock_by_size?.map(s => ({ size: s.size, quantity: s.stock })) || initialFormState.stock,
                images: (initialProduct.images && initialProduct.images.length > 0) ? initialProduct.images : initialFormState.images,
            };
        }
        return initialFormState;
    });

    const [loading, setLoading] = useState(false);

    const handleMainChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    // Manejador genérico para arrays (imágenes, colores, stock)
    const handleArrayChange = (arrayName: 'images' | 'colors' | 'stock', index: number, field: string, value: string | number) => {
        setFormData(prev => {
            const currentArray = prev[arrayName] || [];
            const newArray = currentArray.map((item: any, i: number) => {
                if (i === index) {
                    // Si hay campo específico (ej: colors.name), actualizamos objeto. Si no, es valor directo (ej: images).
                    return field ? { ...item, [field]: value } : value;
                }
                return item;
            });
            return { ...prev, [arrayName]: newArray as any };
        });
    };

    const handleAdd = (arrayName: 'images' | 'colors' | 'stock') => {
        setFormData(prev => {
            const defaults = {
                images: '', colors: { name: '', hex: '#ffffff' }, stock: { size: 'M', quantity: 0 },
            };
            const currentArray = prev[arrayName] || [];
            return { ...prev, [arrayName]: [...currentArray, defaults[arrayName]] };
        });
    };

    const handleRemove = (arrayName: 'images' | 'colors' | 'stock', index: number) => {
        setFormData(prev => {
            const currentArray = prev[arrayName] || [];
            return { ...prev, [arrayName]: currentArray.filter((_: any, i: number) => i !== index) as any };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Preparar payload y limpiar datos vacíos
            const payload: ProductPayload = {
                ...formData,
                price: parseFloat(formData.price.toString()), // Asegurar número
                images: (formData.images || []).filter(img => img && img.trim() !== ''),
                colors: (formData.colors || []).filter(c => c.name && c.hex),
                stock: (formData.stock || []).filter(s => s.quantity !== null && s.quantity >= 0),
            };

            let result;
            if (isEditMode && initialProduct) {
                result = await productService.updateProduct(initialProduct.id, payload);
            } else {
                result = await productService.createProduct(payload);
            }

            toast.success(result.message);
            if (onClose) onClose();
            router.refresh();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error al guardar producto');
        } finally {
            setLoading(false);
        }
    };

    // Estilos
    const labelStyle = "block text-xs font-bold uppercase text-gray-400 tracking-widest mb-2";
    const inputStyle = "w-full border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent placeholder-gray-400";
    const selectStyle = "w-full border-b border-gray-300 py-2 text-sm focus:outline-none focus:border-black bg-transparent";

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-4">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className={labelStyle}>Nombre del Producto</label>
                    <input name="name" value={formData.name} onChange={handleMainChange} className={inputStyle} required placeholder="Ej: Vestido Seda" />
                </div>
                <div>
                    <label className={labelStyle}>Precio (S/.)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleMainChange} className={inputStyle} required min="0" step="0.01" />
                </div>
            </div>

            <div>
                <label className={labelStyle}>Descripción</label>
                <textarea name="description" value={formData.description} onChange={handleMainChange} className={inputStyle} rows={2} placeholder="Detalles del producto..." />
            </div>

            {/* Categorización */}
            <div className="grid grid-cols-3 gap-6">
                <div>
                    <label className={labelStyle}>Género</label>
                    <select name="gender" value={formData.gender} onChange={handleMainChange} className={selectStyle}>
                        {GENDERS.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelStyle}>Categoría</label>
                    <select name="category" value={formData.category} onChange={handleMainChange} className={selectStyle}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelStyle}>Estilo</label>
                    <select name="style" value={formData.style} onChange={handleMainChange} className={selectStyle}>
                        {STYLES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            {/* Imágenes */}
            <div>
                <div className="flex justify-between items-end mb-4 border-b border-gray-100 pb-2">
                    <label className={labelStyle + " mb-0"}>Imágenes (URLs)</label>
                    <button type="button" onClick={() => handleAdd('images')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <Plus size={14} /> Agregar
                    </button>
                </div>
                <div className="space-y-3">
                    {formData.images?.map((img, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input
                                value={img}
                                onChange={(e) => handleArrayChange('images', index, '', e.target.value)}
                                className={inputStyle}
                                placeholder="https://ejemplo.com/imagen.jpg"
                            />
                            <button type="button" onClick={() => handleRemove('images', index)} className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Colores */}
            <div>
                <div className="flex justify-between items-end mb-4 border-b border-gray-100 pb-2">
                    <label className={labelStyle + " mb-0"}>Colores</label>
                    <button type="button" onClick={() => handleAdd('colors')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <Plus size={14} /> Agregar
                    </button>
                </div>
                <div className="space-y-3">
                    {formData.colors?.map((color, index) => (
                        <div key={index} className="grid grid-cols-6 gap-4 items-center">
                            <input
                                type="text"
                                placeholder="Nombre (Ej: Rojo)"
                                value={color.name}
                                onChange={(e) => handleArrayChange('colors', index, 'name', e.target.value)}
                                className={`col-span-4 ${inputStyle}`}
                            />
                            <input
                                type="color"
                                value={color.hex}
                                onChange={(e) => handleArrayChange('colors', index, 'hex', e.target.value)}
                                className="col-span-1 h-8 w-full cursor-pointer border-none bg-transparent"
                            />
                            <div className="col-span-1 flex justify-end">
                                <button type="button" onClick={() => handleRemove('colors', index)} className="text-red-500 hover:text-red-700 p-1">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stock */}
            <div>
                <div className="flex justify-between items-end mb-4 border-b border-gray-100 pb-2">
                    <label className={labelStyle + " mb-0"}>Stock por Talla</label>
                    <button type="button" onClick={() => handleAdd('stock')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <Plus size={14} /> Agregar
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.stock?.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100">
                            <select
                                value={item.size}
                                onChange={(e) => handleArrayChange('stock', index, 'size', e.target.value)}
                                className="bg-transparent text-sm font-bold border-none focus:ring-0 w-16 cursor-pointer"
                            >
                                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleArrayChange('stock', index, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-full bg-transparent border-b border-gray-300 text-center text-sm focus:border-black focus:outline-none"
                                placeholder="0"
                                min="0"
                            />
                            <button type="button" onClick={() => handleRemove('stock', index)} className="text-red-400 hover:text-red-600 p-1">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Checkbox Novedad */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                    type="checkbox" 
                    name="is_new" 
                    checked={formData.is_new} 
                    onChange={handleMainChange} 
                    className="accent-black w-4 h-4 cursor-pointer" 
                />
                <span className="text-sm font-medium text-gray-700">Marcar como "NUEVO"</span>
            </label>

            {/* Botones Finales */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
                {onClose && (
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition border border-transparent hover:border-gray-200 rounded"
                    >
                        Cancelar
                    </button>
                )}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition disabled:opacity-50 rounded shadow-sm"
                >
                    {loading ? 'Guardando...' : isEditMode ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
            </div>
        </form>
    );
}