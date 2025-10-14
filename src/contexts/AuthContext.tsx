import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
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

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function - FORCE REDIRECT VERSION
  const login = async (staffId: string, password?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://relishagrobackend-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staff_id: staffId }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (data.access_token && data.staff_id && data.role) {
        const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.staff_id;
        
        const userData: User = {
          staff_id: data.staff_id,
          full_name: fullName,
          role: data.role,
          department: data.role,
          phone_number: data.phone_number,
          email: data.email,
          id: data.staff_id,
          designation: data.role
        };
        
        // Store data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set user state
        setUser(userData);
        
        // FORCE REDIRECT IMMEDIATELY
        setTimeout(() => {
          const roleRoutes: { [key: string]: string } = {
            'Admin': '/admin',
            'HarvestFlow': '/harvest-flow',
            'FlavorCore': '/flavor-core',
            'Supervisor': '/supervisor'
          };
          
          const targetRoute = roleRoutes[data.role] || '/dashboard';
          window.location.href = targetRoute;
        }, 100);
        
      } else {
        throw new Error('Invalid response');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
    window.location.href = '/';
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