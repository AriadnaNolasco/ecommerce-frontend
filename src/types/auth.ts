export type Role = 'cliente' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ProfileResponse {
  success: boolean;
  user: User & {
    created_at: string;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
}