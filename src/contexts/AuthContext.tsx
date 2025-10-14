import React, { createContext, useContext, useState, useEffect } from 'react';

// Types - Updated to match App.tsx usage
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
  const [error, setError] = useState<string | null>(null); // Add error state

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
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
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

  // Login function - Updated to handle new backend response format
  const login = async (staffId: string, password?: string) => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      const response = await fetch('https://relishagrobackend-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staff_id: staffId }), // Only staff_id needed
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('Backend response:', data); // Debug log
      
      // Handle the new multi-format backend response
      if (data.success !== false && (data.access_token || data.token)) {
        // Extract user data from multiple possible formats
        const userData: User = {
          staff_id: data.staff_id,
          full_name: data.user?.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.staff_id,
          role: data.role,
          department: data.role, // Use role as department fallback
          phone_number: data.user?.phone_number,
          email: data.user?.email,
          // Map to properties App.tsx expects
          id: data.staff_id,           // Map staff_id to id for App.tsx line 88
          designation: data.role       // Map role to designation for App.tsx line 181
        };
        
        const token = data.access_token || data.token;
        
        // Store token and user data
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        
        // Don't redirect here - let App.tsx handle it
        console.log('Login successful, user set:', userData);
        
      } else {
        // Handle error response
        const errorMessage = data.message || data.error || 'Login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Role-based dashboard redirection - Updated for new role mapping
  const redirectToDashboard = (role: string) => {
    const roleRoutes = {
      'Admin': '/admin-dashboard',
      'HarvestFlow': '/harvest-flow-dashboard', 
      'FlavorCore': '/flavorcore-dashboard',
      'Supervisor': '/supervisor-dashboard',
      // Legacy mappings
      'admin': '/admin-dashboard',
      'harvest_field': '/harvest-flow-dashboard', 
      'flavor_core': '/flavorcore-dashboard',
      'supervisor': '/supervisor-dashboard',
      'quality_control': '/quality-dashboard',
      'logistics': '/logistics-dashboard',
      'general': '/general-dashboard'
    };

    const targetRoute = roleRoutes[role as keyof typeof roleRoutes] || '/dashboard';
    
    // Use replace to prevent back navigation to login
    window.location.replace(targetRoute);
  };

  // Logout function
  const logout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Clear user state and errors
      setUser(null);
      setError(null);
      
      // Redirect to login
      window.location.replace('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isAuthenticated,
    // Add the missing properties that App.tsx expects
    isLoading: loading,     // Alias for loading (App.tsx line 16)
    error,                  // Error state (App.tsx line 16)
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