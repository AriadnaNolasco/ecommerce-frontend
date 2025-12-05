import axios from 'axios';
import { authService } from './auth-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authenticatedClient = axios.create({
    baseURL: API_URL,
});

// Interceptor: Inyecta el token en cada petición a esta instancia
authenticatedClient.interceptors.request.use(config => {
    const token = authService.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor para manejo de errores de autenticación
authenticatedClient.interceptors.response.use(
    response => response,
    error => {
        // Si la respuesta es 401 (No autorizado) o 403 (Prohibido)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Si no es la ruta de login, forzamos el cierre de sesión.
            // Esto previene un bucle de redirección en caso de token expirado.
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                // Redirigir y limpiar token
                authService.removeToken();
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);