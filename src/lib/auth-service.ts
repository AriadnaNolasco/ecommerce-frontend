import axios from 'axios';
import { AuthResponse, ProfileResponse, User } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/auth';

export const authService = {
    // 1. Almacenar/Obtener Token
    getToken: () => {
        // Usamos localStorage para simplificar, pero considera cookies para seguridad avanzada
        return localStorage.getItem('token');
    },
    setToken: (token: string) => {
        localStorage.setItem('token', token);
    },

    removeToken: () => {
        localStorage.removeItem('token');
    },

    // 2. Registro de Usuario (POST /auth/register)
    register: async (data: any): Promise<AuthResponse> => {
        const response = await axios.post<AuthResponse>(`${API_URL}/register`, data);
        // Guardar token al registrarse exitosamente
        if (response.data.success) {
            authService.setToken(response.data.token);
        }
        return response.data;
    },

    // 3. Login de Usuario (POST /auth/login)
    login: async (data: any): Promise<AuthResponse> => {
        const response = await axios.post<AuthResponse>(`${API_URL}/login`, data);

        // Guardar token al iniciar sesión exitosamente
        if (response.data.success) {
            authService.setToken(response.data.token);
        }
        return response.data;
    },

    // 4. Obtener Perfil (GET /auth/profile)
    getProfile: async (): Promise<User | null> => {
        const token = authService.getToken();
        if (!token) return null;

        try {
            const response = await axios.get<ProfileResponse>(`${API_URL}/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Envía el token en el header
                },
            });
            return response.data.user;
        } catch (error) {
            // Si el token es inválido o expirado, lo eliminamos
            authService.removeToken();
            return null;
        }
    },

    // 5. Cerrar Sesión
    logout: () => {
        authService.removeToken();
        // Forzar recarga de la página o redirección
        window.location.href = '/login';
    },
};