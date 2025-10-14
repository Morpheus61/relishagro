import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

// Enhanced debug logging
const debugLog = (message: string, data?: any) => {
  console.log(`[AuthContext DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// Types - Match your existing structure
interface User {
  staff_id: string;
  full_name: string;
  role: string;
  department: string;
  phone_number?: string;
  email?: string;
  id: string;
  designation: string;
}

interface AuthContextType {
  user: User | null;
  login: (staffId: string, password?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Enhanced auth state debugging
  useEffect(() => {
    debugLog('Auth State Changed', {
      user: user ? { staff_id: user.staff_id, role: user.role } : null,
      loading,
      isAuthenticated
    });
  }, [user, loading, isAuthenticated]);

  // Initialize auth state from localStorage
  useEffect(() => {
    debugLog('AuthProvider initializing...');
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        debugLog('Restoring user from localStorage', userData);
        setUser(userData);
        // Make sure api client has the token
        api.setToken(token);
      } catch (error) {
        debugLog('Error parsing stored user data', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        api.clearAuth();
      }
    } else {
      debugLog('No stored authentication found');
    }
    setLoading(false);
  }, []);

  // Login function - Uses your api.ts client
  const login = async (staffId: string, password?: string) => {
    try {
      debugLog('Starting login process', { staffId });
      setLoading(true);
      setError(null);
      
      // Use your api.ts login method
      const response = await api.login(staffId);
      debugLog('API login response', response);
      
      if (response.authenticated && response.user) {
        // Create user object in your expected format
        const userData: User = {
          staff_id: response.user.staff_id,
          full_name: response.user.full_name || response.user.staff_id,
          role: response.user.role,
          department: response.user.role,
          phone_number: response.user.phone_number,
          email: response.user.email,
          id: response.user.staff_id,
          designation: response.user.role
        };
        
        debugLog('Setting user data', userData);
        setUser(userData);
        debugLog('Login successful - React Router will handle navigation');
      } else {
        debugLog('Authentication failed', response);
        throw new Error('Authentication failed');
      }
      
    } catch (error) {
      debugLog('Login error', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error; // Re-throw so calling component can handle it
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    debugLog('Logging out user');
    api.clearAuth();
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isAuthenticated,
    isLoading: loading,
    error,
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