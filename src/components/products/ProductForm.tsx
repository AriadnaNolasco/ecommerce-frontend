'use client';

import { useState } from 'react';
import { ProductPayload, productService } from '@/lib/product-service';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';

// Valores iniciales (vacíos o por defecto)
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
    images: [''], // Inicializar con un campo de imagen
    colors: [{ name: 'Negro', hex: '#000000' }],
    stock: [{ size: 'M', quantity: 0 }],
};

interface ProductFormProps {
    // Si se pasa un producto, se usa para editar. Si es null, es para crear.
    initialProduct?: Product | null;
}

// Opciones predefinidas para selects (basado en database.sql)
const GENDERS = ['mujer', 'hombre', 'ninos'];
const CATEGORIES = ['poleras', 'pantalones', 'vestidos', 'chaquetas', 'zapatos'];
const STYLES = ['casual', 'formal', 'deportivo'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductForm({ initialProduct = null }: ProductFormProps) {
    const router = useRouter();
    const isEditMode = !!initialProduct;

    // Convertir el objeto Product a ProductPayload para edición
    const defaultState = isEditMode ? {
        ...initialFormState, // Tomar valores por defecto para campos omitidos
        ...initialProduct,
        // Mapear arrays anidados de Product a ProductPayload si es necesario (simplificado)
        colors: initialProduct?.colors.map(c => ({ name: c.color_name, hex: c.color_hex })) || initialFormState.colors,
        stock: initialProduct?.stock_by_size.map(s => ({ size: s.size, quantity: s.stock })) || initialFormState.stock,
        images: initialProduct?.images || initialFormState.images,
    } : initialFormState;

    const [formData, setFormData] = useState<ProductPayload>(defaultState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleMainChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleArrayChange = (arrayName: 'images' | 'colors' | 'stock', index: number, field: string, value: string | number) => {
        setFormData(prev => {
            const newArray = prev[arrayName].map((item: any, i: number) => {
                if (i === index) {
                    return { ...item, [field]: value };
                }
                return item;
            });
            return { ...prev, [arrayName]: newArray as any };
        });
    };

    const handleAdd = (arrayName: 'images' | 'colors' | 'stock') => {
        setFormData(prev => {
            const defaults = {
                images: '',
                colors: { name: '', hex: '#ffffff' },
                stock: { size: 'M', quantity: 0 },
            };
            return { ...prev, [arrayName]: [...prev[arrayName], defaults[arrayName]] };
        });
    };

    const handleRemove = (arrayName: 'images' | 'colors' | 'stock', index: number) => {
        setFormData(prev => {
            const newArray = prev[arrayName].filter((_: any, i: number) => i !== index);
            return { ...prev, [arrayName]: newArray as any };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload: ProductPayload = {
                ...formData,
                price: parseFloat(formData.price as any), // Asegurar que price sea un número
                // Limpieza de datos (ej. filtrar imágenes/stock vacíos si la API es estricta)
                images: formData.images.filter(img => img.trim() !== ''),
                // Asegurar que los arrays tengan al menos un elemento si es un requisito
                colors: formData.colors.filter(c => c.name && c.hex),
                stock: formData.stock.filter(s => s.quantity !== null && s.quantity >= 0),
            };

            let result;
            if (isEditMode && initialProduct) {
                // Modo Edición
                result = await productService.updateProduct(initialProduct.id, payload);
            } else {
                // Modo Creación
                result = await productService.createProduct(payload);
            }

            alert(result.message);
            setIsModalOpen(false); // Cierra el modal
            router.refresh(); // Recarga la data del Server Component padre

        } catch (err: any) {
            setError(err.message || 'Ocurrió un error en el servidor.');
        } finally {
            setLoading(false);
        }
    };

    // Estilos de los inputs para Tailwind
    const inputStyle = "w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition disabled:bg-gray-100";
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const buttonBaseStyle = "px-3 py-1 rounded-md text-white font-medium text-sm transition disabled:opacity-50";

    const FormContent = (
        <form onSubmit={handleSubmit} className="space-y-6">

            {error && <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg">{error}</div>}

            {/* Campos de Producto Básicos */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className={labelStyle}>Nombre *</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleMainChange} className={inputStyle} required />
                </div>
                <div>
                    <label htmlFor="price" className={labelStyle}>Precio *</label>
                    <input type="number" id="price" name="price" value={formData.price} onChange={handleMainChange} className={inputStyle} required min="0.01" step="0.01" />
                </div>
                <div className="col-span-2">
                    <label htmlFor="description" className={labelStyle}>Descripción</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleMainChange} className={inputStyle} rows={3} />
                </div>
            </div>

            {/* Selects de Categoría y Género */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label htmlFor="gender" className={labelStyle}>Género *</label>
                    <select id="gender" name="gender" value={formData.gender} onChange={handleMainChange} className={inputStyle} required>
                        {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="category" className={labelStyle}>Categoría *</label>
                    <select id="category" name="category" value={formData.category} onChange={handleMainChange} className={inputStyle} required>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="style" className={labelStyle}>Estilo *</label>
                    <select id="style" name="style" value={formData.style} onChange={handleMainChange} className={inputStyle} required>
                        {STYLES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <input type="checkbox" id="is_new" name="is_new" checked={formData.is_new} onChange={handleMainChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <label htmlFor="is_new" className="text-sm font-medium text-gray-700">Marcar como Novedad</label>
            </div>

            {/* Gestión de Imágenes */}
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Imágenes (URLs)</h3>
            <div className="space-y-2">
                {formData.images.map((img, index) => (
                    <div key={index} className="flex space-x-2 items-center">
                        <input
                            type="url"
                            placeholder={`URL de Imagen ${index + 1}`}
                            value={img}
                            onChange={(e) => handleArrayChange('images', index, '', e.target.value)}
                            className={inputStyle}
                        />
                        {formData.images.length > 1 && (
                            <button type="button" onClick={() => handleRemove('images', index)} className={`${buttonBaseStyle} bg-red-500 hover:bg-red-600`}>
                                -
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={() => handleAdd('images')} className={`${buttonBaseStyle} bg-blue-500 hover:bg-blue-600`}>
                    + Agregar Imagen
                </button>
            </div>

            {/* Gestión de Colores */}
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Colores</h3>
            <div className="space-y-2">
                {formData.colors.map((color, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 items-center">
                        <input
                            type="text"
                            placeholder="Nombre Color"
                            value={color.name}
                            onChange={(e) => handleArrayChange('colors', index, 'name', e.target.value)}
                            className="col-span-2 p-2 border border-gray-300 rounded-lg"
                        />
                        <input
                            type="color"
                            value={color.hex}
                            onChange={(e) => handleArrayChange('colors', index, 'hex', e.target.value)}
                            className="col-span-1 h-10 w-full"
                        />
                        <div className="col-span-1 flex justify-end">
                            {formData.colors.length > 1 && (
                                <button type="button" onClick={() => handleRemove('colors', index)} className={`${buttonBaseStyle} bg-red-500 hover:bg-red-600`}>
                                    -
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <button type="button" onClick={() => handleAdd('colors')} className={`${buttonBaseStyle} bg-blue-500 hover:bg-blue-600`}>
                    + Agregar Color
                </button>
            </div>

            {/* Gestión de Stock */}
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Stock por Talla</h3>
            <div className="space-y-2">
                {formData.stock.map((stockItem, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-center">
                        <select
                            value={stockItem.size}
                            onChange={(e) => handleArrayChange('stock', index, 'size', e.target.value)}
                            className="col-span-2 p-2 border border-gray-300 rounded-lg"
                        >
                            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input
                            type="number"
                            placeholder="Cantidad"
                            value={stockItem.quantity}
                            onChange={(e) => handleArrayChange('stock', index, 'quantity', parseInt(e.target.value) || 0)}
                            className="col-span-1 p-2 border border-gray-300 rounded-lg"
                            min="0"
                        />
                        <div className="col-span-1 flex justify-end">
                            {formData.stock.length > 1 && (
                                <button type="button" onClick={() => handleRemove('stock', index)} className={`${buttonBaseStyle} bg-red-500 hover:bg-red-600`}>
                                    -
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <button type="button" onClick={() => handleAdd('stock')} className={`${buttonBaseStyle} bg-blue-500 hover:bg-blue-600`}>
                    + Agregar Talla
                </button>
            </div>

            <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`${buttonBaseStyle} bg-gray-500 hover:bg-gray-600`}>
                    Cancelar
                </button>
                <button type="submit" disabled={loading} className={`${buttonBaseStyle} ${isEditMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'}`}>
                    {loading ? (isEditMode ? 'Guardando...' : 'Creando...') : (isEditMode ? 'Guardar Cambios' : 'Crear Producto')}
                </button>
            </div>
        </form>
    );

    // Si es modo edición, no usa modal, solo retorna el formulario
    if (isEditMode) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
                <h2 className="text-2xl font-bold mb-4 text-indigo-700">Editar Producto ID: {initialProduct?.id}</h2>
                {FormContent}
            </div>
        );
    }

    // Si es modo creación, usa modal para lanzar el formulario
    return (
        <>
            <button
                onClick={() => {
                    setFormData(initialFormState); // Resetear estado al abrir
                    setIsModalOpen(true);
                }}
                className="py-2 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
            >
                + Nuevo Producto
            </button>

            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsModalOpen(false)} // Cierra al hacer click fuera
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()} // Previene que el click en el modal lo cierre
                    >
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Producto</h2>
                        {FormContent}
                    </div>
                </div>
            )}
        </>
    );
}