import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  userEmail: string | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    // Store in localStorage for persistence
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setUserEmail(null);
    setIsAuthenticated(false);
    // Clear from localStorage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAuthenticated');
  };

  // Check for existing session on mount
  React.useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const storedAuth = localStorage.getItem('isAuthenticated');
    
    if (storedEmail && storedAuth === 'true') {
      setUserEmail(storedEmail);
      setIsAuthenticated(true);
    }
  }, []);

  const value = {
    userEmail,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
