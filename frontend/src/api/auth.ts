import { apiClient } from './client';

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', data.token);
    return data;
};

export const getCurrentUser = async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
};

export const logout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
}; 