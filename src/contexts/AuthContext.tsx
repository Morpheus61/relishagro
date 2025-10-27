// src/contexts/AuthContext.tsx
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
  login: (staffId: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isOfflineMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Helper: Open IndexedDB
const openOfflineDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RelishAgroDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'staff_id' });
      }
      if (!db.objectStoreNames.contains('workData')) {
        db.createObjectStore('workData', { keyPath: 'id', autoIncrement: true });
      }
      debugLog('IndexedDB schema created/upgraded');
    };
  });
};

// ✅ Helper: Check if user exists in offline database
const checkOfflineUser = async (staffId: string): Promise<User | null> => {
  try {
    const cachedUsers = localStorage.getItem('cached_users');
    if (cachedUsers) {
      const users = JSON.parse(cachedUsers);
      const user = users.find((u: any) => u.staff_id === staffId);
      if (user) {
        debugLog('✅ Found user in localStorage cache', user);
        return user;
      }
    }
    
    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      
      return new Promise((resolve) => {
        const request = store.get(staffId);
        request.onsuccess = () => {
          if (request.result) {
            debugLog('✅ Found user in IndexedDB', request.result);
            resolve(request.result);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (dbError) {
      debugLog('IndexedDB not available, using localStorage only');
      return null;
    }
  } catch (err) {
    debugLog('Error checking offline user', err);
    return null;
  }
};

// ✅ Helper: Cache user for offline access
const cacheUserOffline = async (user: User): Promise<void> => {
  try {
    const cachedUsers = localStorage.getItem('cached_users');
    const users = cachedUsers ? JSON.parse(cachedUsers) : [];
    
    const existingIndex = users.findIndex((u: any) => u.staff_id === user.staff_id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem('cached_users', JSON.stringify(users));
    debugLog('✅ User cached in localStorage');
    
    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      store.put(user);
      transaction.oncomplete = () => debugLog('✅ User cached in IndexedDB');
    } catch (dbError) {
      debugLog('IndexedDB not available for caching');
    }
  } catch (err) {
    debugLog('Error caching user', err);
  }
};

// ✅ FIXED: Simplified direct fetch without AbortController
const directLoginFetch = async (staffId: string): Promise<any> => {
  debugLog('🔄 Starting direct login fetch...', { staffId });
  
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000);
    });
    
    const fetchPromise = fetch('https://relishagrobackend-production.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ staff_id: staffId }),
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    }).then(async (response) => {
      debugLog('✅ Response received', { status: response.status });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      debugLog('✅ Data parsed successfully');
      return data;
    });
    
    return await Promise.race([fetchPromise, timeoutPromise]);
    
  } catch (error: any) {
    debugLog('❌ Direct fetch error', { message: error.message });
    throw error;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    debugLog('Auth State Changed', {
      user: user ? { staff_id: user.staff_id, role: user.role } : null,
      loading,
      isAuthenticated,
      isOfflineMode
    });
  }, [user, loading, isAuthenticated, isOfflineMode]);

  useEffect(() => {
    const initializeAuth = async () => {
      debugLog('AuthProvider initializing...');
      
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user_data');
      const offlineMode = localStorage.getItem('offline_mode') === 'true';
      
      debugLog('Found stored data', { 
        hasToken: !!token, 
        hasUser: !!savedUser,
        offlineMode
      });

      if (token && savedUser) {
        try {
          if (token.startsWith('offline_')) {
            debugLog('Restoring offline session');
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsOfflineMode(true);
            setLoading(false);
            return;
          }

          const payloadBase64 = token.split('.')[1];
          if (!payloadBase64) throw new Error('Invalid token format');
          
          const payloadJson = atob(payloadBase64);
          const payload = JSON.parse(payloadJson);
          const isExpired = payload.exp * 1000 < Date.now();

          if (isExpired) {
            debugLog('Token expired - checking offline cache');
            const userData = JSON.parse(savedUser);
            const offlineUser = await checkOfflineUser(userData.staff_id);
            
            if (offlineUser) {
              debugLog('✅ Restored from offline cache after token expiry');
              setUser(offlineUser);
              setIsOfflineMode(true);
              const offlineToken = `offline_${offlineUser.staff_id}_${Date.now()}`;
              localStorage.setItem('auth_token', offlineToken);
              localStorage.setItem('offline_mode', 'true');
            } else {
              debugLog('Token expired, no offline cache - clearing auth');
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              localStorage.removeItem('offline_mode');
              api.clearAuth();
            }
            
            setLoading(false);
            return;
          }

          const userData = JSON.parse(savedUser);
          debugLog('Restoring user from localStorage', userData);
          setUser(userData);
          setIsOfflineMode(offlineMode);
          api.setToken(token);
        } catch (error) {
          debugLog('Error parsing stored user data', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('offline_mode');
          api.clearAuth();
        }
      } else {
        debugLog('No stored authentication found');
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (staffId: string): Promise<void> => {
    try {
      debugLog('Starting login process', { staffId, online: navigator.onLine });
      setLoading(true);
      setError(null);
      
      const validPrefixes = ['Admin-', 'HF-', 'FL-', 'SUP-'];
      const hasValidPrefix = validPrefixes.some(prefix => staffId.startsWith(prefix));
      
      if (!hasValidPrefix) {
        throw new Error('Invalid Staff ID format. Use: Admin-Name, HF-Name, FL-Name, or SUP-Name');
      }
      
      // ✅ CHECK IF ACTUALLY OFFLINE FIRST
      if (!navigator.onLine) {
        debugLog('❌ Device is offline - checking cache...');
        const offlineUser = await checkOfflineUser(staffId);
        
        if (offlineUser) {
          debugLog('✅ Found user in offline cache');
          
          const userData: User = {
            staff_id: offlineUser.staff_id,
            full_name: offlineUser.full_name || offlineUser.staff_id,
            role: offlineUser.role,
            department: offlineUser.department || 'General',
            id: offlineUser.id,
            designation: offlineUser.designation || 'Staff Member'
          };
          
          const offlineToken = `offline_${staffId}_${Date.now()}`;
          localStorage.setItem('auth_token', offlineToken);
          localStorage.setItem('user_data', JSON.stringify(userData));
          localStorage.setItem('offline_mode', 'true');
          
          setUser(userData);
          setIsOfflineMode(true);
          setLoading(false);
          debugLog('✅ Logged in offline mode');
          return;
        } else {
          throw new Error('🔴 You are offline and this Staff ID is not cached. Please connect to internet for first-time login.');
        }
      }
      
      // ✅ DEVICE IS ONLINE - ALWAYS TRY ONLINE LOGIN FIRST
      debugLog('🌐 Device is online - attempting online authentication...');
      
      try {
        const response = await directLoginFetch(staffId);
        
        if (response && response.success && response.data?.token && response.data?.user) {
          const { token, user: apiUser } = response.data;
          
          debugLog('✅ Online login successful, storing token...');
          
          api.setToken(token);
          localStorage.setItem('auth_token', token);
          localStorage.removeItem('offline_mode');
          
          const userData: User = {
            staff_id: apiUser.staff_id,
            full_name: apiUser.full_name || apiUser.staff_id,
            role: apiUser.role,
            department: apiUser.department || 'General',
            id: apiUser.id,
            designation: apiUser.designation || 'Staff Member'
          };
          
          localStorage.setItem('user_data', JSON.stringify(userData));
          
          debugLog('✅ Caching user for offline access...');
          await cacheUserOffline(userData);
          
          setUser(userData);
          setIsOfflineMode(false);
          setLoading(false);
          debugLog('✅ Login complete (ONLINE MODE)');
          return;
        } else {
          throw new Error('Invalid credentials from server');
        }
      } catch (onlineError: any) {
        debugLog('❌ Online login failed', onlineError.message);
        
        // ✅ ONLINE LOGIN FAILED - TRY OFFLINE AS FALLBACK
        debugLog('Checking offline cache as fallback...');
        const offlineUser = await checkOfflineUser(staffId);
        
        if (offlineUser) {
          debugLog('⚠️ Using offline cache due to online login failure');
          
          const userData: User = {
            staff_id: offlineUser.staff_id,
            full_name: offlineUser.full_name || offlineUser.staff_id,
            role: offlineUser.role,
            department: offlineUser.department || 'General',
            id: offlineUser.id,
            designation: offlineUser.designation || 'Staff Member'
          };
          
          const offlineToken = `offline_${staffId}_${Date.now()}`;
          localStorage.setItem('auth_token', offlineToken);
          localStorage.setItem('user_data', JSON.stringify(userData));
          localStorage.setItem('offline_mode', 'true');
          
          setUser(userData);
          setIsOfflineMode(true);
          setLoading(false);
          debugLog('✅ Logged in offline mode (fallback)');
          return;
        } else {
          // No offline cache available - throw the original error
          throw new Error('Invalid credentials. Please check your Staff ID and try again.');
        }
      }
      
    } catch (error: any) {
      debugLog('❌ Login error', error);
      setUser(null);
      setIsOfflineMode(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setError(errorMessage);
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    debugLog('Logging out user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('offline_mode');
    api.clearAuth();
    setUser(null);
    setIsOfflineMode(false);
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
    isOfflineMode,
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