import React, { createContext, useContext, useState, useEffect } from 'react';

// Types - Updated to match App.tsx usage AND backend response
interface User {
  staff_id: string;
  full_name: string;
  role: string;
  department: string;
  phone_number?: string;
  email?: string;
  // Add missing properties that App.tsx expects
  id: string;              // For App.tsx line 88: user.id
  designation: string;     // For App.tsx line 181: user.designation
}

interface AuthContextType {
  user: User | null;
  login: (staffId: string, password?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  // Add missing properties that App.tsx expects
  isLoading: boolean;      // For App.tsx line 16: isLoading
  error: string | null;    // For App.tsx line 16: error
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          console.log('🔄 AuthContext: Restored user from localStorage:', userData);
        } else {
          console.log('🔒 AuthContext: No saved user found');
        }
      } catch (error) {
        console.error('❌ AuthContext: Error initializing auth:', error);
        setError('Failed to initialize authentication');
        // Clear invalid data
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function - FIXED to handle actual backend response format
  const login = async (staffId: string, password?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 AuthContext: Starting login for:', staffId);
      
      const response = await fetch('https://relishagrobackend-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staff_id: staffId }),
      });

      console.log('📡 AuthContext: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('📦 AuthContext: Backend response:', data);
      
      // FIXED: Handle the ACTUAL backend response format
      if (data.access_token && data.staff_id && data.role) {
        
        // Build full name from first_name and last_name (which exist in response)
        const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.staff_id;
        
        const userData: User = {
          staff_id: data.staff_id,
          full_name: fullName,
          role: data.role,
          department: data.role, // Use role as department
          phone_number: data.phone_number || undefined, // Backend doesn't return this
          email: data.email || undefined, // Backend doesn't return this
          // Properties App.tsx expects
          id: data.staff_id,        // Map staff_id to id
          designation: data.role    // Map role to designation
        };
        
        console.log('✅ AuthContext: Created user data:', userData);
        
        // Store token and user data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        console.log('🎯 AuthContext: User state set successfully');
        
      } else {
        const errorMessage = 'Invalid login response format';
        console.error('❌ AuthContext: Invalid response:', data);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    try {
      console.log('🚪 AuthContext: Logging out user');
      
      // Clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Clear user state and errors
      setUser(null);
      setError(null);
      
      // Redirect to login
      window.location.replace('/');
      
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
      setError('Logout failed');
    }
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

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};