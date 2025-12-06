'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const CATEGORIES = ['poleras', 'pantalones', 'vestidos', 'chaquetas', 'zapatos'];
const STYLES = ['casual', 'formal', 'deportivo'];

export default function SidebarFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/?${params.toString()}`);
  };

  return (
    <aside className="w-full md:w-64 space-y-8 hidden md:block h-fit sticky top-24">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b pb-2">Categoría</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          {CATEGORIES.map(cat => (
            <li key={cat}>
              <button onClick={() => handleFilter('category', cat)} className={`hover:text-black capitalize ${searchParams.get('category') === cat ? 'font-bold text-black' : ''}`}>
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Puedes agregar más secciones (Estilo, Precio) siguiendo este patrón */}
      <button onClick={() => router.push('/')} className="text-xs text-red-500 underline">Limpiar Filtros</button>
    </aside>
  );
}