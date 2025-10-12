import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

// User interface - updated to match your backend response
interface User {
  id: string;
  staff_id: string;
  username: string; // We'll use staff_id as username for compatibility
  role: 'admin' | 'harvestflow_manager' | 'flavorcore_manager' | 'flavorcore_supervisor';
  full_name: string;
  designation: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  login: (staffId: string, password?: string) => Promise<boolean>; // Made password optional since backend doesn't use it
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props interface
interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async (): Promise<void> => {
      try {
        const savedUser = localStorage.getItem('user_data'); // Use same key as api.ts
        const savedToken = localStorage.getItem('auth_token');
        
        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          
          // Convert backend user format to our User interface
          const formattedUser: User = {
            id: parsedUser.id,
            staff_id: parsedUser.staff_id,
            username: parsedUser.staff_id, // Use staff_id as username for compatibility
            role: parsedUser.role || 'admin', // Default to admin if role is missing
            full_name: parsedUser.full_name,
            designation: parsedUser.designation,
            firstName: parsedUser.full_name?.split(' ')[0],
            lastName: parsedUser.full_name?.split(' ').slice(1).join(' ')
          };
          
          setUser(formattedUser);
          console.log('✅ AuthContext: Restored user from localStorage:', formattedUser);
        }
      } catch (error) {
        console.error('❌ Error checking auth status:', error);
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function - now uses real backend API
  const login = async (staffId: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 AuthContext: Attempting login with staffId:', staffId);
      
      // Use the API client to login
      const response = await api.login(staffId);
      
      console.log('📡 AuthContext: API response:', response);

      if (!response.authenticated || !response.user) {
        setError('Authentication failed');
        return false;
      }

      // Convert backend user format to our User interface
      const formattedUser: User = {
        id: response.user.id,
        staff_id: response.user.staff_id,
        username: response.user.staff_id, // Use staff_id as username for compatibility
        role: response.user.role || 'admin',
        full_name: response.user.full_name,
        designation: response.user.designation,
        firstName: response.user.full_name?.split(' ')[0],
        lastName: response.user.full_name?.split(' ').slice(1).join(' ')
      };

      setUser(formattedUser);
      console.log('✅ AuthContext: User set successfully:', formattedUser);
      
      // The api.login() already saves to localStorage, but let's ensure consistency
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
      return true;

    } catch (error: any) {
      console.error('❌ AuthContext: Login error:', error);
      setError(error.message || 'Login failed. Please check your connection.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    console.log('🚪 AuthContext: Logging out user');
    setUser(null);
    setError(null);
    
    // Clear both AuthContext and API storage
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    
    // Also clear API client auth
    api.clearAuth();
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: user !== null,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export types
export type { User, AuthContextType };