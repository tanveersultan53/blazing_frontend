import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { refreshToken, logoutUser } from './authService';
import { RefreshTokenResponse, ApiError } from '../types/auth';

// Extend AxiosRequestConfig to include retry flag
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Create an Axios instance
const api = axios.create({
  baseURL:  'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Automatically add the access token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    console.log('Request interceptor - Access token:', accessToken ? 'Found' : 'Not found');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
      console.log('Request interceptor - Added Authorization header');
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Handle 401 (Unauthorized) and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // If 401 Unauthorized error, try refreshing the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await refreshToken();
        const tokens: RefreshTokenResponse = response.data;
        
        const accessToken = tokens.access_token;
        const refreshTokenValue = tokens.refresh_token;
        
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        if (refreshTokenValue) {
          localStorage.setItem('refreshToken', refreshTokenValue);
        }

        // Update headers with new access token and retry the request
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return api(originalRequest);  // Retry the original request
      } catch (refreshError) {
        // If refreshing token fails, log the user out
        logoutUser();
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      const errorData = error.response.data;
      const status = error.response.status;
      const errorMessage = errorData?.detail || `HTTP error! status: ${status}`;
      console.error('API Error:', errorMessage);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;