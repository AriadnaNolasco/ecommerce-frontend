import axios from 'axios';
import { authService } from './auth-service';
import { authenticatedClient } from './api-client';
import { AllUsersResponse, StatsResponse, DashboardStats, AdminUser } from '@/types/admin';
import { Role } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const adminService = {
    // 1. Obtener estadísticas del Dashboard (GET /stats/dashboard)
    getDashboardStats: async (): Promise<DashboardStats | null> => {
        try {
            const response = await authenticatedClient.get<StatsResponse>(`/stats/dashboard`);
            return response.data.stats;
        } catch (error) {
            // Un error 403 o 401 de la API se manejará en el componente padre
            console.error('Error al obtener estadísticas del dashboard:', error);
            return null;
        }
    },
    // 2. Obtener lista completa de usuarios (GET /users)
    getAllUsers: async (): Promise<AdminUser[]> => {
        try {
            const response = await authenticatedClient.get<AllUsersResponse>(`${API_URL}/users`);
            return response.data.users;
        } catch (error) {
            // Un error 403 o 401 de la API se manejará en el componente padre
            console.error('Error al obtener la lista de usuarios:', error);
            return [];
        }
    },
    // 3. Obtener detalle de usuario por ID (GET /users/:id)
    getUserById: async (userId: string | number): Promise<AdminUser | null> => {
        try {
            const response = await authenticatedClient.get<{ success: true, user: AdminUser }>(`/users/${userId}`);
            return response.data.user;
        } catch (error) {
            console.error(`Error al obtener usuario ${userId}:`, error);
            return null;
        }
    },
    // 4. Cambiar rol de usuario (PATCH /users/:id/role)
    updateUserRole: async (userId: string | number, role: Role): Promise<{ success: boolean, message: string }> => {
        try {
            const response = await authenticatedClient.patch<{ success: boolean, message: string }>(`/users/${userId}/role`, { role });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al actualizar rol.');
        }
    },

    // 5. Cambiar estado de usuario (PATCH /users/:id/status)
    toggleUserStatus: async (userId: string | number, active: boolean): Promise<{ success: boolean, message: string }> => {
        try {
            const response = await authenticatedClient.patch<{ success: boolean, message: string }>(`/users/${userId}/status`, { active });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al cambiar estado.');
        }
    },
};