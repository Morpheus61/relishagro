import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const debugLog = (message: string, data?: any) => {
  console.log(`[AuthContext DEBUG] ${message}`, data || '');
};

interface User {
  staff_id: string;
  full_name: string;
  role: string;
  department: string;
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

  useEffect(() => {
    debugLog('Auth State Changed', {
      user: user ? { staff_id: user.staff_id, role: user.role } : null,
      loading,
      isAuthenticated
    });
  }, [user, loading, isAuthenticated]);

  useEffect(() => {
    debugLog('AuthProvider initializing...');
    
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');
    
    debugLog('Found stored data', { 
      hasToken: !!token, 
      hasUser: !!savedUser
    });

    if (token && savedUser) {
      try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) throw new Error('Invalid token format');
        
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
          debugLog('Token is expired, clearing auth data');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          api.clearAuth();
          setLoading(false);
          return;
        }

        const userData = JSON.parse(savedUser);
        debugLog('Restoring user from localStorage', userData);
        setUser(userData);
        api.setToken(token);
      } catch (error) {
        debugLog('Error parsing stored user data', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        api.clearAuth();
      }
    } else {
      debugLog('No stored authentication found');
    }
    setLoading(false);
  }, []);

  const login = async (staffId: string, password?: string) => {
    try {
      debugLog('Starting login process', { staffId });
      setLoading(true);
      setError(null);
      
      const response = await api.login(staffId);
      debugLog('API login response', response);
      
      // ✅ FIXED: Check correct properties
      if (response.success && response.data?.token && response.data?.user) {
        const { token, user: apiUser } = response.data;
        
        // Save token
        api.setToken(token);
        localStorage.setItem('auth_token', token);
        
        // Save user
        const userData: User = {
          staff_id: apiUser.staff_id,
          full_name: apiUser.full_name || apiUser.staff_id,
          role: apiUser.role,
          department: apiUser.department || 'General',
          id: apiUser.id,
          designation: apiUser.designation || 'Staff Member'
        };
        
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        debugLog('Login successful', userData);
      } else {
        debugLog('Authentication failed - invalid response', response);
        throw new Error('Authentication failed');
      }
      
    } catch (error) {
      debugLog('Login error', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
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