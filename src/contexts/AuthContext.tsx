import React, { createContext, useContext, useState, useEffect } from 'react';

// User interface
interface User {
  id: string;
  username: string;
  role: 'admin' | 'harvestflow_manager' | 'flavorcore_manager' | 'flavorcore_supervisor';
  email?: string;
  firstName?: string;
  lastName?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
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

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async (): Promise<void> => {
      try {
        const savedUser = localStorage.getItem('flavorcore_user');
        if (savedUser) {
          const parsedUser: User = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('flavorcore_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Mock users for demonstration - replace with your actual API
      const mockUsers: User[] = [
        { 
          id: '1', 
          username: 'admin', 
          role: 'admin', 
          email: 'admin@flavorcore.com',
          firstName: 'Admin',
          lastName: 'User'
        },
        { 
          id: '2', 
          username: 'harvest_mgr', 
          role: 'harvestflow_manager', 
          email: 'harvest@flavorcore.com',
          firstName: 'Harvest',
          lastName: 'Manager'
        },
        { 
          id: '3', 
          username: 'flavor_mgr', 
          role: 'flavorcore_manager', 
          email: 'manager@flavorcore.com',
          firstName: 'Flavor',
          lastName: 'Manager'
        },
        { 
          id: '4', 
          username: 'supervisor', 
          role: 'flavorcore_supervisor', 
          email: 'supervisor@flavorcore.com',
          firstName: 'Supervisor',
          lastName: 'User'
        }
      ];

      // Mock authentication - replace with real API call
      const foundUser = mockUsers.find(u => u.username === username);
      
      if (foundUser && password === 'password') {
        setUser(foundUser);
        localStorage.setItem('flavorcore_user', JSON.stringify(foundUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('flavorcore_user');
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: user !== null
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
