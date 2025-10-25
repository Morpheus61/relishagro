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
    
    request.onerror = () => {
      debugLog('IndexedDB error', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
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
    // Check localStorage first (faster)
    const cachedUsers = localStorage.getItem('cached_users');
    if (cachedUsers) {
      const users = JSON.parse(cachedUsers);
      const user = users.find((u: any) => u.staff_id === staffId);
      if (user) {
        debugLog('✅ Found user in localStorage cache', user);
        return user;
      }
    }
    
    // Check IndexedDB
    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      
      return new Promise((resolve, reject) => {
        const request = store.get(staffId);
        
        request.onsuccess = () => {
          if (request.result) {
            debugLog('✅ Found user in IndexedDB', request.result);
            resolve(request.result);
          } else {
            resolve(null);
          }
        };
        
        request.onerror = () => {
          debugLog('IndexedDB get error', request.error);
          resolve(null);
        };
      });
    } catch (dbError) {
      debugLog('IndexedDB not available, using localStorage only', dbError);
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
    // Save to localStorage
    const cachedUsers = localStorage.getItem('cached_users');
    const users = cachedUsers ? JSON.parse(cachedUsers) : [];
    
    // Update or add user
    const existingIndex = users.findIndex((u: any) => u.staff_id === user.staff_id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem('cached_users', JSON.stringify(users));
    debugLog('✅ User cached in localStorage');
    
    // Save to IndexedDB
    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      
      store.put(user);
      
      transaction.oncomplete = () => {
        debugLog('✅ User cached in IndexedDB');
      };
      
      transaction.onerror = () => {
        debugLog('IndexedDB cache error', transaction.error);
      };
    } catch (dbError) {
      debugLog('IndexedDB not available for caching', dbError);
    }
  } catch (err) {
    debugLog('Error caching user', err);
  }
};

// ✅ Helper: Background sync (non-blocking)
const syncInBackground = async (staffId: string): Promise<void> => {
  if (!navigator.onLine) {
    debugLog('🔴 Offline - skipping background sync');
    return;
  }
  
  try {
    debugLog('🔄 Background sync attempt...');
    const response = await api.login(staffId);
    
    if (response.success && response.data?.token && response.data?.user) {
      const userData: User = {
        staff_id: response.data.user.staff_id,
        full_name: response.data.user.full_name || response.data.user.staff_id,
        role: response.data.user.role,
        department: response.data.user.department || 'General',
        id: response.data.user.id,
        designation: response.data.user.designation || 'Staff Member'
      };
      
      // Update cached user data
      await cacheUserOffline(userData);
      debugLog('✅ Background sync successful');
    }
  } catch (err) {
    debugLog('⚠️ Background sync failed (not critical)', err);
  }
};

// ✅ NEW: Direct fetch with custom timeout (fallback method)
const directLoginFetch = async (staffId: string, timeoutMs: number = 30000): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://relishagrobackend-production.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ staff_id: staffId }),
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Login request timed out. Please check your internet connection.');
    }
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
          // Check if it's an offline token
          if (token.startsWith('offline_')) {
            debugLog('Restoring offline session');
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsOfflineMode(true);
            setLoading(false);
            return;
          }

          // Check JWT expiration for online tokens
          const payloadBase64 = token.split('.')[1];
          if (!payloadBase64) throw new Error('Invalid token format');
          
          const payloadJson = atob(payloadBase64);
          const payload = JSON.parse(payloadJson);
          const isExpired = payload.exp * 1000 < Date.now();

          if (isExpired) {
            debugLog('Token expired - checking offline cache');
            
            // Try to restore from offline cache
            const userData = JSON.parse(savedUser);
            const offlineUser = await checkOfflineUser(userData.staff_id);
            
            if (offlineUser) {
              debugLog('✅ Restored from offline cache after token expiry');
              setUser(offlineUser);
              setIsOfflineMode(true);
              
              // Generate new offline token
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
      
      // ✅ STEP 1: Validate Staff ID format
      const validPrefixes = ['Admin-', 'HF-', 'FL-', 'SUP-'];
      const hasValidPrefix = validPrefixes.some(prefix => staffId.startsWith(prefix));
      
      if (!hasValidPrefix) {
        throw new Error('Invalid Staff ID format. Use: Admin-Name, HF-Name, FL-Name, or SUP-Name');
      }
      
      // ✅ STEP 2: Check if user exists in offline database FIRST
      const offlineUser = await checkOfflineUser(staffId);
      
      if (offlineUser) {
        // ✅ User exists offline - login immediately
        debugLog('✅ Offline login successful', offlineUser);
        
        const userData: User = {
          staff_id: offlineUser.staff_id,
          full_name: offlineUser.full_name || offlineUser.staff_id,
          role: offlineUser.role,
          department: offlineUser.department || 'General',
          id: offlineUser.id,
          designation: offlineUser.designation || 'Staff Member'
        };
        
        // Generate a local token (for offline use)
        const offlineToken = `offline_${staffId}_${Date.now()}`;
        localStorage.setItem('auth_token', offlineToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        localStorage.setItem('offline_mode', 'true');
        
        setUser(userData);
        setIsOfflineMode(true);
        setLoading(false); // ✅ CRITICAL: Set loading to false before returning
        debugLog('✅ Logged in offline mode');
        
        // ✅ Try to sync in background (don't wait)
        syncInBackground(staffId).catch(err => 
          debugLog('Background sync failed (expected if offline)', err)
        );
        
        return;
      }
      
      // ✅ STEP 3: User not in offline DB - try online authentication
      if (!navigator.onLine) {
        throw new Error('🔴 You are offline and this Staff ID is not cached. Please connect to internet for first-time login.');
      }
      
      debugLog('Attempting online authentication...');
      
      // ✅ CRITICAL FIX: Try direct fetch with shorter timeout first
      let response;
      try {
        debugLog('🔄 Attempting login with 30-second timeout...');
        response = await directLoginFetch(staffId, 30000); // 30 seconds
      } catch (fetchError: any) {
        debugLog('❌ Direct fetch failed, trying API client...', fetchError.message);
        
        // Fallback to API client
        try {
          response = await api.login(staffId);
        } catch (apiError: any) {
          debugLog('❌ API client also failed', apiError.message);
          throw new Error('Unable to connect to server. Please check your internet connection and try again.');
        }
      }
      
      // ✅ STEP 4: Process successful response
      if (response && response.success && response.data?.token && response.data?.user) {
        const { token, user: apiUser } = response.data;
        
        debugLog('✅ Login successful, storing token...');
        
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
        
        // ✅ Cache user in offline database for future offline logins
        await cacheUserOffline(userData);
        
        setUser(userData);
        setIsOfflineMode(false);
        setLoading(false); // ✅ CRITICAL: Set loading to false
        debugLog('✅ Login complete (online mode)');
      } else {
        debugLog('❌ Authentication failed - invalid response', response);
        throw new Error('Invalid credentials. Please check your Staff ID and try again.');
      }
      
    } catch (error: any) {
      debugLog('❌ Login error', error);
      setUser(null);
      setIsOfflineMode(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setError(errorMessage);
      
      throw error;
    } finally {
      setLoading(false); // ✅ CRITICAL: Always set loading to false
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