import React, { createContext, useContext, useState, ReactNode } from 'react';
import { loginUser, logoutUser, userProfile } from '../services/authService';
import { User, LoginCredentials, LoginResponse } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await loginUser(credentials);
      const loginData: LoginResponse = response.data;
      
      
      // Store tokens with validation - handle multiple response formats
      let accessToken = loginData.access_token;
      let refreshToken = loginData.refresh_token;
      
      // Handle different token response formats
      if (!accessToken && loginData.token) {
        accessToken = loginData.token;
      }
      if (!accessToken && loginData.tokens?.access) {
        accessToken = loginData.tokens.access;
      }
      if (!refreshToken && loginData.tokens?.refresh) {
        refreshToken = loginData.tokens.refresh;
      }
      
      console.log('AuthContext: Extracted tokens - accessToken:', accessToken ? 'Present' : 'Missing', 'refreshToken:', refreshToken ? 'Present' : 'Missing');
      console.log('AuthContext: Full login response for debugging:', loginData);
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        console.log('AuthContext: Stored access token');
      } else {
        console.warn('AuthContext: No access token received from login response');
        console.warn('AuthContext: Available fields in response:', Object.keys(loginData));
        throw new Error('No access token received from server');
      }
      
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
        console.log('AuthContext: Stored refresh token');
      } else {
        console.warn('AuthContext: No refresh token received from login response');
      }
      
      // Get user details from the server since login only returns tokens
      let userData: User | null = null;
      try {
        const userResponse = await userProfile();
        userData = userResponse.data;
      } catch (error) {
        console.warn('Failed to get user details:', error);
        // Create a basic user object with email if we can't fetch user details
        userData = {
          id: 0,
          email: credentials.email,
          name: credentials.email,
          is_superuser: false,
        };
      }

      setUser(userData);
      setIsAuthenticated(true);
      
      // Store user info in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      logoutUser();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      // Clear from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Verify token by getting current user
      const userResponse = await userProfile();
      const userData = userResponse.data;
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.warn('Token validation failed:', error);
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing session on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAuth = localStorage.getItem('isAuthenticated');
    
    if (storedUser && storedAuth === 'true') {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.warn('Failed to parse stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    }
    
    // Verify token with server
    checkAuth();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
