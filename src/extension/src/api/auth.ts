import { storage } from '../services/storage';
import { googleSheetsService } from '../services/googleSheetsService';
import type { AuthResponse } from './types';

export const authApi = {
  login: async (_usernameOrEmail: string, _password: string, _hostUrl?: string): Promise<AuthResponse> => {
    const mockToken = 'google-sheet-auth-mock-token';
    await storage.set('hamham_token', mockToken);
    await storage.set('hamham_user_name', 'Hamster');
    return {
      token: mockToken,
      refreshToken: 'mock-refresh-token',
      name: 'Hamster'
    };
  },
  register: async (_name: string, _username: string, _email: string, _password: string, _hostUrl?: string) => {
    return { success: true };
  },
  logout: async () => {
    await storage.remove('hamham_token');
    await storage.remove('hamham_refresh_token');
    await storage.remove('hamham_user_name');
    await googleSheetsService.disconnect();
  }
};
