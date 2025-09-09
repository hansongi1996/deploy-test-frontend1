import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AuthUser, LoginRequest, LoginResponse } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('authUser');
        const storedToken = localStorage.getItem('authToken');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          // Check if token is still valid (basic check)
          const tokenExpiry = localStorage.getItem('tokenExpiry');
          if (tokenExpiry && new Date().getTime() < parseInt(tokenExpiry)) {
            setUser({ ...userData, token: storedToken });
          } else {
            // Token expired, clear storage
            localStorage.removeItem('authUser');
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpiry');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiry');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Mock login - 실제로는 API 호출
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: LoginResponse = await response.json();
      
      // Store user data and token
      const authUser: AuthUser = {
        ...data.user,
        role: data.user.role || 'STUDENT',
        token: data.token,
      };

      setUser(authUser);
      
      // Store in localStorage
      localStorage.setItem('authUser', JSON.stringify(authUser));
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('tokenExpiry', (new Date().getTime() + data.expiresIn * 1000).toString());
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
