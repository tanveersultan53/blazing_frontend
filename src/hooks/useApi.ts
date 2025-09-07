import { useCallback } from 'react';
import { 
  loginUser, 
  logoutUser, 
  refreshToken, 
  userProfile, 
  getUsers, 
  addUser 
} from '../services/authService';
import api from '../services/axiosInterceptor';
import {
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  UserProfile,
  User,
  UsersListResponse
} from '../types/auth';

export const useApi = () => {
  // Authentication methods
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await loginUser(credentials);
    return response.data;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    logoutUser();
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<RefreshTokenResponse> => {
    const response = await refreshToken();
    return response.data;
  }, []);

  const getCurrentUser = useCallback(async (): Promise<UserProfile> => {
    const response = await userProfile();
    return response.data;
  }, []);

  // Token management
  const setTokens = useCallback((accessToken: string | null, refreshToken: string | null = null) => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
    
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }, []);

  const getAccessToken = useCallback((): string | null => {
    return localStorage.getItem('accessToken');
  }, []);

  const getRefreshToken = useCallback((): string | null => {
    return localStorage.getItem('refreshToken');
  }, []);

  const clearTokens = useCallback((): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    return !!localStorage.getItem('accessToken');
  }, []);

  // Generic HTTP methods using the axios interceptor
  const get = useCallback(async <T>(endpoint: string): Promise<T> => {
    const response = await api.get<T>(endpoint);
    return response.data;
  }, []);

  const post = useCallback(async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await api.post<T>(endpoint, data);
    return response.data;
  }, []);

  const put = useCallback(async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await api.put<T>(endpoint, data);
    return response.data;
  }, []);

  const patch = useCallback(async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await api.patch<T>(endpoint, data);
    return response.data;
  }, []);

  const del = useCallback(async <T>(endpoint: string): Promise<T> => {
    const response = await api.delete<T>(endpoint);
    return response.data;
  }, []);

  // User management
  const getUsersList = useCallback(async (): Promise<UsersListResponse> => {
    const response = await getUsers();
    return response.data;
  }, []);

  const createUser = useCallback(async (userInfo: Partial<User>): Promise<User> => {
    const response = await addUser(userInfo);
    return response.data;
  }, []);

  return {
    // Authentication
    login,
    logout,
    refreshToken: refreshAccessToken,
    getCurrentUser,
    
    // Token management
    setTokens,
    getAccessToken,
    getRefreshToken,
    clearTokens,
    isAuthenticated,
    
    // HTTP methods
    get,
    post,
    put,
    patch,
    delete: del,
    
    // User management
    getUsers: getUsersList,
    addUser: createUser,
    
    // Direct access to axios instance
    apiClient: api,
  };
};


