import api from './client';
import type { User } from './types';

export const userApi = {
  getCurrentUser: async (): Promise<Partial<User>> => {
    const { data } = await api.get('/users/me');
    return data;
  },
  getUsers: async (params: { page: number; pageSize: number; searchTerm?: string; role?: string; isActive?: boolean }): Promise<{ users: User[]; totalCount: number }> => {
    const { data } = await api.get('/users', { params });
    return data;
  },
  getUser: async (id: string): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
  createUser: async (user: any): Promise<User> => {
    const { data } = await api.post('/users', user);
    return data;
  },
  updateUser: async (id: string, user: any): Promise<User> => {
    const { data } = await api.put(`/users/${id}`, user);
    return data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};
