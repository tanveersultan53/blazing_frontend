import axios, { type AxiosResponse } from "axios";
import api from "./axiosInterceptor";
import type { User } from "@/redux/features/userSlice";

interface LoginCredentials {
  email: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

// Create a direct axios instance without interceptors
const directApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginUser = ({ email, password }: LoginCredentials): Promise<AxiosResponse<TokenResponse>> => 
  directApi.post("/accounts/auth/access-token", {
    email,
    password,
  });

export const refresh_token = (): Promise<AxiosResponse<TokenResponse>> => {
  const refresh_token = localStorage.getItem("refresh_token");
  return api.post("/accounts/refresh-token", {
    refresh_token,
  });
};

export const logoutUser = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/";
};

export const userProfile = (): Promise<AxiosResponse<User>> => 
  api.get("/accounts/users/user-profile");

