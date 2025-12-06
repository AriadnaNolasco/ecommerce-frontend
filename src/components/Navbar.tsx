'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User } from '@/types/auth';
import { authService } from '@/lib/auth-service';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { 
    Search, ShoppingBag, User as UserIcon, Heart, Menu, X, LogOut, 
    LayoutDashboard, Package, Users, ClipboardList 
} from 'lucide-react';

const NAV_LINKS = [
    { name: 'NUEVO', href: '/?is_new=true' },
    { name: 'ROPA', href: '/?category=poleras' },
    { name: 'VESTIDOS', href: '/?category=vestidos' },
    { name: 'PANTALONES', href: '/?category=pantalones' },
    { name: 'CHAQUETAS', href: '/?category=chaquetas' },
    { name: 'CALZADO', href: '/?category=zapatos' },
    { name: 'REBAJAS', href: '/?sale=true', className: 'text-red-600' },
];

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

export default function Navbar() {
    const { user, isLoading } = useAuth();
    const { totalItems } = useCart();
    const { wishlistCount } = useWishlist();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Determinar si es admin para ocultar elementos
    const isAdmin = user?.role === 'admin';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('search', searchQuery);
            router.push(`/?${params.toString()}`);
            setIsSearchOpen(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/'; 
    };

    return (
        <header className="flex flex-col w-full font-sans">
            {/* 1. TOP BAR - Ocultar para admin si prefieres, o dejarla */}
            {!isAdmin && (
                <div className="bg-gray-100 text-xs text-center py-2 px-4 text-gray-600 tracking-wide">
                    <span>ENVÍOS GRATIS A TODO EL PERÚ EN PEDIDOS MAYORES A S/. 200</span>
                    <span className="mx-2">|</span>
                    <Link href="/help" className="hover:underline">Ayuda y Contacto</Link>
                </div>
            )}

            {/* 2. MAIN HEADER */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    
                    {/* Izquierda: Menú Móvil & Logo */}
                    <div className="flex items-center gap-4">
                        <button 
                            className="lg:hidden p-2 -ml-2 text-gray-900"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        
                        <Link href="/" className="text-2xl md:text-3xl font-serif tracking-widest font-bold text-black uppercase">
                            FINA<span className="text-xs align-top font-sans font-normal ml-1">PERÚ</span>
                        </Link>
                    </div>

                    {/* Centro: Barra de Búsqueda (Solo si NO es admin, o mantenerla si quieres buscar productos para editar) */}
                    {!isAdmin && (
                        <div className="hidden lg:flex flex-1 max-w-lg mx-8">
                            <form onSubmit={handleSearch} className="w-full relative group">
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-b border-gray-300 py-2 pl-2 pr-10 text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-400"
                                />
                                <button type="submit" className="absolute right-0 top-2 text-gray-400 hover:text-black transition">
                                    <Search size={18} />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Derecha: Iconos */}
                    <div className="flex items-center gap-1 md:gap-4">
                        {!isAdmin && (
                            <button 
                                className="lg:hidden p-2 text-gray-900"
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                            >
                                <Search size={22} strokeWidth={1.5} />
                            </button>
                        )}

                        {/* Usuario / Login */}
                        {isLoading ? (
                            <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
                        ) : user ? (
                            <div className="relative group flex items-center">
                                <Link href={isAdmin ? '/admin' : '/profile'} className="p-2 text-gray-900 hover:text-gray-600 flex items-center gap-2">
                                    <UserIcon size={22} strokeWidth={1.5} />
                                    <span className="text-xs font-medium hidden md:block uppercase truncate max-w-[100px]">
                                        Hola, {user.name.split(' ')[0]}
                                    </span>
                                </Link>
                                
                                {/* Dropdown Menú Usuario */}
                                <div className="absolute top-full right-0 w-64 bg-white border border-gray-100 shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 rounded-b-lg">
                                    <div className="px-4 py-3 border-b border-gray-50 mb-2">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Cuenta</p>
                                        <p className="text-sm font-bold truncate text-gray-900">{user.email}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider mt-2 inline-block font-bold ${
                                            isAdmin ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                                        </span>
                                    </div>

                                    {isAdmin ? (
                                        // === OPCIONES DE ADMINISTRADOR ===
                                        <div className="py-1">
                                            <p className="px-4 py-1 text-[10px] text-gray-400 uppercase tracking-widest">Gestión</p>
                                            <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black flex items-center gap-3">
                                                <LayoutDashboard size={16} /> Dashboard
                                            </Link>
                                            <Link href="/admin/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black flex items-center gap-3">
                                                <Package size={16} /> Productos
                                            </Link>
                                            <Link href="/admin/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black flex items-center gap-3">
                                                <ClipboardList size={16} /> Pedidos (Todos)
                                            </Link>
                                            <Link href="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black flex items-center gap-3">
                                                <Users size={16} /> Usuarios
                                            </Link>
                                        </div>
                                    ) : (
                                        // === OPCIONES DE CLIENTE ===
                                        <div className="py-1">
                                            <Link href="/orders/my-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black flex items-center gap-3">
                                                <ClipboardList size={16} /> Mis Pedidos
                                            </Link>
                                            <Link href="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black flex items-center gap-3">
                                                <Heart size={16} /> Favoritos
                                            </Link>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-50 mt-2 pt-2">
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                                        >
                                            <LogOut size={16} /> Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="p-2 text-gray-900 hover:text-gray-600 text-sm font-medium">
                                <span className="hidden md:inline">Iniciar Sesión</span>
                                <UserIcon className="md:hidden" size={22} strokeWidth={1.5} />
                            </Link>
                        )}

                        {/* Favoritos: Solo visible si NO es admin */}
                        {!isAdmin && (
                            <Link href="/wishlist" className="hidden md:block p-2 text-gray-900 hover:text-gray-600 relative">
                                <Heart size={22} strokeWidth={1.5} />
                                {wishlistCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Bolsa: Solo visible si NO es admin */}
                        {!isAdmin && (
                            <Link href="/cart" className="p-2 text-gray-900 hover:text-gray-600 relative">
                                <ShoppingBag size={22} strokeWidth={1.5} />
                                {totalItems > 0 && (
                                    <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>
                </div>

                {/* 3. NAVIGATION BAR (Categorías) - OCULTO PARA ADMIN */}
                {!isAdmin && (
                    <div className="hidden lg:flex justify-center border-t border-gray-100">
                        <nav className="flex space-x-8 py-3">
                            {NAV_LINKS.map((link) => (
                                <Link 
                                    key={link.name} 
                                    href={link.href}
                                    className={`text-xs font-bold tracking-widest hover:underline decoration-1 underline-offset-4 transition-colors ${link.className || 'text-gray-900'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}

                {/* Mobile Search (Solo clientes) */}
                {isSearchOpen && !isAdmin && (
                    <div className="lg:hidden px-4 pb-4 border-b border-gray-100 animate-in slide-in-from-top-2">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border border-transparent py-2 pl-4 pr-10 text-sm focus:bg-white focus:border-gray-300 outline-none rounded"
                            />
                            <button type="submit" className="absolute right-3 top-2 text-gray-400">
                                <Search size={18} />
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-[80%] max-w-sm bg-white p-6 shadow-xl animate-in slide-in-from-left">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-serif font-bold">MENÚ</h2>
                            <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
                        </div>
                        <nav className="flex flex-col space-y-4">
                            {/* Solo mostrar links de tienda si NO es admin */}
                            {!isAdmin && NAV_LINKS.map((link) => (
                                <Link 
                                    key={link.name} 
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`text-sm font-bold tracking-widest py-2 border-b border-gray-100 ${link.className || 'text-gray-900'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {/* Opciones de Admin en Móvil */}
                            {isAdmin && (
                                <>
                                    <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold py-2 border-b border-gray-100">Dashboard</Link>
                                    <Link href="/admin/products" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold py-2 border-b border-gray-100">Productos</Link>
                                    <Link href="/admin/orders" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold py-2 border-b border-gray-100">Pedidos</Link>
                                </>
                            )}

                            {!user && (
                                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-3">
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="bg-black text-white text-center py-3 text-sm font-bold uppercase tracking-widest">
                                        Iniciar Sesión
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMenuOpen(false)} className="border border-black text-black text-center py-3 text-sm font-bold uppercase tracking-widest">
                                        Registrarse
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
}