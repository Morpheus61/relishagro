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
    const initializeAuth = () => {
      try {
        console.log('🔄 AuthContext: Initializing authentication...');
        const token = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          console.log('🔄 AuthContext: Restored user from localStorage:', userData);
          setUser(userData);
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

  // Login function - BULLETPROOF version with extensive error handling
  const login = async (staffId: string, password?: string) => {
    try {
      console.log('🚀 AuthContext: Starting login for:', staffId);
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://relishagrobackend-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staff_id: staffId }),
      });

      console.log('📡 AuthContext: Response status:', response.status);
      console.log('📡 AuthContext: Response ok:', response.ok);

      if (!response.ok) {
        console.error('❌ AuthContext: Response not ok');
        const errorText = await response.text();
        console.error('❌ AuthContext: Error response:', errorText);
        throw new Error(`Login failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 AuthContext: Backend response received:', data);
      
      // Validate required fields
      if (!data.access_token) {
        console.error('❌ AuthContext: Missing access_token in response');
        throw new Error('Invalid response: missing access_token');
      }
      
      if (!data.staff_id) {
        console.error('❌ AuthContext: Missing staff_id in response');
        throw new Error('Invalid response: missing staff_id');
      }
      
      if (!data.role) {
        console.error('❌ AuthContext: Missing role in response');
        throw new Error('Invalid response: missing role');
      }

      console.log('✅ AuthContext: All required fields present');
      
      // Build full name safely
      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim() || data.staff_id;
      
      console.log('🔧 AuthContext: Building user data...');
      console.log('🔧 AuthContext: first_name:', data.first_name);
      console.log('🔧 AuthContext: last_name:', data.last_name);
      console.log('🔧 AuthContext: calculated fullName:', fullName);
      
      const userData: User = {
        staff_id: data.staff_id,
        full_name: fullName,
        role: data.role,
        department: data.role, // Use role as department
        phone_number: data.phone_number || undefined,
        email: data.email || undefined,
        // Properties App.tsx expects
        id: data.staff_id,        // Map staff_id to id
        designation: data.role    // Map role to designation
      };
      
      console.log('✅ AuthContext: User data created successfully:', userData);
      
      // Store data safely
      try {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ AuthContext: Data stored in localStorage');
      } catch (storageError) {
        console.error('❌ AuthContext: localStorage error:', storageError);
        // Continue without localStorage
      }
      
      // Set user state
      console.log('🎯 AuthContext: Setting user state...');
      setUser(userData);
      console.log('🎯 AuthContext: User state set successfully');
      
      // Clear any previous errors
      setError(null);
      
      console.log('🎉 AuthContext: Login completed successfully!');
      
    } catch (error) {
      console.error('❌ AuthContext: Login error occurred:', error);
      console.error('❌ AuthContext: Error type:', typeof error);
      console.error('❌ AuthContext: Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      
      // Don't re-throw the error - let the UI handle it via error state
      console.log('⚠️ AuthContext: Error set, not re-throwing');
      
    } finally {
      console.log('🏁 AuthContext: Login finally block - setting loading false');
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

  // Debug user state changes
  useEffect(() => {
    console.log('👤 AuthContext: User state changed to:', user);
    console.log('👤 AuthContext: isAuthenticated:', isAuthenticated);
  }, [user, isAuthenticated]);

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