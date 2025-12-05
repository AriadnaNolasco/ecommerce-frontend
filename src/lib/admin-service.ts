import axios from 'axios';
import { authService } from './auth-service';
import { authenticatedClient } from './api-client';
import { AllUsersResponse, StatsResponse, DashboardStats, AdminUser } from '@/types/admin';

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
};