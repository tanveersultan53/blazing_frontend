import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { refresh_token, logoutUser } from "./authService";

// Create an Axios instance
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://blazing-social-backend-368859323211.us-central1.run.app",
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Request Interceptor: Automatically add the access token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const access_token = localStorage.getItem("access_token");
    if (access_token && config.headers) {
      config.headers["Authorization"] = `Bearer ${access_token}`;
    }
    // Only set JSON header for non-FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Handle 401 (Unauthorized) and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 Unauthorized error, try refreshing the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = await refresh_token();
        localStorage.setItem("access_token", tokens.data.access_token);
        localStorage.setItem("refresh_token", tokens.data.refresh_token);

        // Update headers with new access token and retry the request
        if (originalRequest.headers) {
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${tokens.data.access_token}`;
        }
        return api(originalRequest); // Retry the original request
      } catch (err) {
        // If refreshing token fails, log the user out
        logoutUser();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
