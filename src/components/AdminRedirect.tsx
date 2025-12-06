'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth-service';
import { User } from '@/types/auth';

export default function AdminRedirect() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const user = await authService.getProfile();
                if (user?.role === 'admin') {
                    setIsAdmin(true);
                    router.replace('/admin'); // Te manda al dashboard
                } else {
                    setIsChecking(false); // Si es cliente, deja ver la tienda
                }
            } catch (error) {
                setIsChecking(false);
            }
        };
        checkUser();
    }, [router]);

    // Si está verificando o si ES admin (y está esperando la redirección),
    // mostramos una pantalla blanca de carga para tapar el catálogo.
    if (isChecking || isAdmin) {
        return (
            <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mb-4"></div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
                    {isAdmin ? 'Accediendo al Panel...' : 'Cargando FINA...'}
                </p>
            </div>
        );
    }

    return null; // Si no es admin, desaparece y muestra la tienda
}