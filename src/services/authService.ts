import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { User } from '../types';

export const authService = {
    login: async (userId: string): Promise<User | null> => {
        // In a real app, this would POST credentials
        // For now, we simulate "me" endpoint or specific user fetch
        // Since we are mocking, we just assume we get the user back
        // We might need to adjust client.ts to handle 'login' specific logic if needed
        // but typically 'login' sets a token.
        // Here we just fetch the user detail.
        return apiClient.get<User>(`${API_ENDPOINTS.AUTH.LOGIN}?userId=${userId}`);
    },

    getCurrentUser: async (): Promise<User | null> => {
        return apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    }
};
