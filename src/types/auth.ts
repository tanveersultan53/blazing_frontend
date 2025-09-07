// Shared authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
  // Add common Django REST framework response fields
  token?: string;
  tokens?: {
    access: string;
    refresh: string;
  };
}

export interface RefreshTokenResponse {
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  is_superuser?: boolean;
  is_active?: boolean;
  date_joined?: string;
}

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  is_superuser?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  date_joined?: string;
}

export interface UsersListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface ApiError {
  detail: string;
  status_code?: number;
}
