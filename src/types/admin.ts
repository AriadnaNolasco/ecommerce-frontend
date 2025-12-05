import { User, Role } from './auth'; // Importa tipos base de auth.ts

// 1. Tipo para un usuario en la vista de administración 
export interface AdminUser extends Omit<User, 'role'> { 
    role: Role; 
    active: boolean; 
    created_at: string; 
    total_orders: number; 
    total_spent: string; // Viene como DECIMAL de MySQL, se maneja como string 
}
export interface AllUsersResponse { 
    success: true; 
    count: number; 
    users: AdminUser[]; 
}

// 2. Tipos para las estadísticas del Dashboard 
export interface SalesByDay { 
    date: string; 
    sales: number; 
}

export interface DashboardStats { 
    total_sales: number; 
    total_orders: number; 
    total_users: number; 
    sales_by_day: SalesByDay[]; 
    sales_by_category: { 
        category: string; 
        quantity_sold: number; 
        total_sales: number; 
    }[]; 
    recent_orders: { 
        id: number; 
        order_number: string; 
        total: number; 
        status: string; 
        created_at: string; 
        user_name: string; 
    }[]; 
}

export interface StatsResponse { 
    success: true; 
    stats: DashboardStats; 
}