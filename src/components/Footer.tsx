import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-700">
                <div className="text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} Marketplace E-commerce. Todos los derechos reservados.
                </div>
                <div className="flex justify-center space-x-6 mt-4">
                    <a href="#" className="text-gray-400 hover:text-white text-sm">
                        Términos de Servicio
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white text-sm">
                        Política de Privacidad
                    </a>
                    <a href="https://github.com/anjelisahori" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">
                        Backend Repository
                    </a>
                </div>
            </div>
        </footer>
    );
}