import axios, { AxiosResponse } from "axios";
import api from "./axiosInterceptor";
import {
  LoginCredentials,
  LoginResponse,
  RefreshTokenResponse,
  UserProfile,
  User,
  UsersListResponse
} from "../types/auth";


export const loginUser = async (credentials: LoginCredentials): Promise<AxiosResponse<LoginResponse>> => {
  console.log('Login attempt with credentials:', { email: credentials.email, password: '***' });
  
  try {
    console.log('Making fetch request to /accounts/auth/access-token...');
    const response = await fetch("http://127.0.0.1:8000/accounts/auth/access-token", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(credentials)
      }
    );
    
    console.log('Fetch response status:', response.status);
    console.log('Fetch response ok:', response.ok);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login failed with status:', response.status);
      console.error('Error data:', errorData);
      
      if (response.status === 400) {
        if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
          throw new Error(errorData.non_field_errors[0]);
        } else if (errorData.detail) {
          throw new Error(errorData.detail);
        }
      } else if (response.status === 401) {
        throw new Error('Invalid email or password');
      } else if (response.status === 404) {
        throw new Error('Login endpoint not found');
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Login successful! Response data:', data);
    
    // Convert fetch response to axios-like response
    return {
      data: data,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()) as any,
      config: {} as any,
      request: {} as any
    } as AxiosResponse<LoginResponse>;
    
  } catch (error) {
    console.error('Login endpoint failed:', error);
    throw error;
  }
};

export const refreshToken = async (): Promise<AxiosResponse<RefreshTokenResponse>> => {
  const refreshTokenValue = localStorage.getItem("refreshToken");
  if (!refreshTokenValue || refreshTokenValue === "undefined" || refreshTokenValue === "null") {
    throw new Error("No valid refresh token found");
  }
  
  console.log('Refreshing token with:', refreshTokenValue);
  
  return api.post<RefreshTokenResponse>("/accounts/auth/refresh-token", {
    refresh_token: refreshTokenValue,
  });
};

export const logoutUser = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/";
};

export const userProfile = async (): Promise<AxiosResponse<UserProfile>> => {
  console.log('userProfile - Making request to /accounts/auth/user-profile');
  const accessToken = localStorage.getItem('accessToken');
  console.log('userProfile - Current access token:', accessToken ? 'Present' : 'Missing');
  
  try {
    const response = await api.get<UserProfile>("accounts/users/user-profile");
    console.log('userProfile - Success:', response.data);
    return response;
  } catch (error) {
    console.error('userProfile - Error:', error);
    throw error;
  }
};

export const getUsers = async (): Promise<AxiosResponse<UsersListResponse>> => {
  return api.get<UsersListResponse>("/accounts/auth/users");
};

export const addUser = async (userInfo: Partial<User>): Promise<AxiosResponse<User>> => {
  return api.post<User>("accounts/auth/users", userInfo);
};

export interface SocialMediaData {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  vimeo?: string;
  yelp?: string;
  google?: string;
  blogr?: string;
  customapp?: string;
  socialapp?: string;
  moneyapp?: string;
}

export const getUserSocialMedia = async (rep_id: string): Promise<AxiosResponse<SocialMediaData>> => {
  return api.get<SocialMediaData>(`/accounts/admin/users/${rep_id}/socials`);
};

export const updateUserSocialMedia = async (rep_id: string, socialMediaData: SocialMediaData): Promise<AxiosResponse<any>> => {
  return api.put(`/accounts/admin/users/${rep_id}/socials`, socialMediaData);
};

export const getUserById = async (rep_id: string): Promise<AxiosResponse<User>> => {
  return api.get<User>(`accounts/auth/users/${rep_id}`);
};

export const updateUser = async (rep_id: string, userData: Partial<User>): Promise<AxiosResponse<User>> => {
  return api.put<User>(`/accounts/auth/users/${rep_id}`, userData);
};
