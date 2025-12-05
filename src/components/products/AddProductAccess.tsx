'use client';

import { use, useEffect, useState } from 'react';
import ProductForm from './ProductForm';
import { authService } from '@/lib/auth-service';
import { User } from '@/types/auth';

// Hook simple para gestionar el estado de autenticación (Copia de Navbar para asegurar independencia)
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

// Componente para mostrar el botón de creación solo a los administradores
export default function AddProductAccess() {
    const { user, isLoading } = useAuth();

    if (isLoading || user?.role !== 'admin') {
        return null; // No mostrar nada si está cargando o no es admin
    }

    // Mostrar el botón que dispara el modal del formulario
    return <ProductForm initialProduct={null} />;
}