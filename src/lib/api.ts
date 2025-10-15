/**
 * RelishAgro API Client - CORRECTED for Railway Port 8080
 * 
 * CRITICAL FIXES:
 * 1. Railway uses port 8080 (shown in logs), not 8000
 * 2. Mobile compatibility enhancements
 * 3. Proper error handling and debugging
 */

// ===== CORRECTED API CONFIGURATION =====
// Railway automatically handles port routing - no need to specify port in URL
const BASE_URL = import.meta.env.VITE_API_URL || 'https://relishagrobackend-production.up.railway.app';

// DEBUGGING: Log the URL being used
console.log('🔗 API Base URL:', BASE_URL);
console.log('🚂 Railway Backend: Uses internal port 8080, external HTTPS routing');
console.log('📱 Mobile Fix: Corrected URL configuration');

// ===== AUTHENTICATION STORAGE =====
const AUTH_STORAGE_KEY = 'relishagro_auth';

// ===== TYPES =====
export interface LoginRequest {
  staff_id: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  staff_id: string;
  role: string;
  first_name: string;
  last_name: string;
  expires_in: number;
  mobile_compatible?: boolean;
}

export interface UserInfo {
  staff_id: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export interface ApiError {
  detail: string;
  mobile_debug?: boolean;
}

export interface AuthData {
  access_token: string;
  token_type: string;
  staff_id: string;
  role: string;
  first_name: string;
  last_name: string;
  expires_in: number;
}

// ===== STORAGE HELPERS =====
export const saveAuthData = (authData: AuthData): void => {
  try {
    const authWithTimestamp = {
      ...authData,
      timestamp: Date.now(),
      expires_at: Date.now() + (authData.expires_in * 1000)
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authWithTimestamp));
    console.log('✅ Auth data saved to localStorage');
  } catch (error) {
    console.error('❌ Failed to save auth data:', error);
  }
};

export const getAuthData = (): AuthData | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      console.log('ℹ️ No auth data in localStorage');
      return null;
    }

    const parsed = JSON.parse(stored);
    
    // Check if token is expired
    if (parsed.expires_at && Date.now() > parsed.expires_at) {
      console.log('⏰ Token expired, clearing auth data');
      clearAuthData();
      return null;
    }

    console.log('✅ Valid auth data retrieved');
    return parsed;
  } catch (error) {
    console.error('❌ Failed to parse auth data:', error);
    clearAuthData();
    return null;
  }
};

export const clearAuthData = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    console.log('🗑️ Auth data cleared from localStorage');
  } catch (error) {
    console.error('❌ Failed to clear auth data:', error);
  }
};

export const getAuthToken = (): string | null => {
  const authData = getAuthData();
  return authData ? authData.access_token : null;
};

// ===== HTTP CLIENT HELPERS =====
const createHeaders = (includeAuth: boolean = false): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache', // Mobile compatibility
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

const handleResponse = async (response: Response) => {
  console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
  console.log('📍 Response URL:', response.url);
  
  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
      console.error('❌ API Error:', errorData);
    } catch {
      errorData = { 
        detail: `HTTP ${response.status}: ${response.statusText}`,
        mobile_debug: true 
      };
    }
    
    // Special handling for authentication errors
    if (response.status === 401) {
      console.log('🔒 Authentication failed, clearing stored data');
      clearAuthData();
    }
    
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  try {
    const data = await response.json();
    console.log('✅ Response data received:', Object.keys(data));
    return data;
  } catch (error) {
    console.error('❌ Failed to parse JSON response:', error);
    throw new Error('Invalid JSON response from server');
  }
};

// ===== MOBILE CONNECTIVITY TEST =====
export const testMobileConnectivity = async (): Promise<boolean> => {
  try {
    console.log('📱 Testing mobile connectivity to Railway backend...');
    
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      mode: 'cors'
    });

    console.log('📡 Mobile test response:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Mobile connectivity successful:', data);
      return true;
    } else {
      console.error('❌ Mobile connectivity failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Mobile connectivity error:', error);
    return false;
  }
};

// ===== AUTHENTICATION API =====
export const login = async (staff_id: string): Promise<LoginResponse> => {
  console.log('🔐 Starting login process for staff_id:', staff_id);
  console.log('🌐 Using API URL:', BASE_URL);

  // First test connectivity
  const isConnected = await testMobileConnectivity();
  if (!isConnected) {
    throw new Error('Cannot connect to backend server. Please check your network connection.');
  }

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify({ staff_id }),
      mode: 'cors'
    });

    const data = await handleResponse(response);
    
    // Save authentication data
    if (data.access_token) {
      saveAuthData({
        access_token: data.access_token,
        token_type: data.token_type,
        staff_id: data.staff_id,
        role: data.role,
        first_name: data.first_name,
        last_name: data.last_name,
        expires_in: data.expires_in
      });
    }

    console.log('✅ Login successful for:', data.staff_id, 'Role:', data.role);
    return data;
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<UserInfo> => {
  console.log('👤 Fetching current user info...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: createHeaders(true),
      mode: 'cors'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Failed to get current user:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  console.log('🚪 Logging out...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: createHeaders(true),
      mode: 'cors'
    });

    await handleResponse(response);
  } catch (error) {
    console.error('❌ Logout request failed:', error);
    // Continue with local logout even if server request fails
  } finally {
    clearAuthData();
    console.log('✅ Local logout completed');
  }
};

export const verifyToken = async (): Promise<boolean> => {
  console.log('🔍 Verifying token...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/verify-token`, {
      method: 'POST',
      headers: createHeaders(true),
      mode: 'cors'
    });

    if (response.ok) {
      console.log('✅ Token is valid');
      return true;
    } else {
      console.log('❌ Token is invalid');
      clearAuthData();
      return false;
    }
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    clearAuthData();
    return false;
  }
};

// ===== ADMIN API =====
export const getUsers = async () => {
  console.log('👥 Fetching users list...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'GET',
      headers: createHeaders(true),
      mode: 'cors'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Failed to fetch users:', error);
    throw error;
  }
};

// ===== WORKERS API =====
export const getWorkers = async () => {
  console.log('👷 Fetching workers list...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/workers`, {
      method: 'GET',
      headers: createHeaders(true),
      mode: 'cors'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Failed to fetch workers:', error);
    throw error;
  }
};

export const createWorker = async (workerData: any) => {
  console.log('➕ Creating new worker...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/workers`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(workerData),
      mode: 'cors'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Failed to create worker:', error);
    throw error;
  }
};

// ===== JOB TYPES API =====
export const getJobTypes = async () => {
  console.log('🔧 Fetching job types...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/job-types`, {
      method: 'GET',
      headers: createHeaders(true),
      mode: 'cors'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Failed to fetch job types:', error);
    throw error;
  }
};

// ===== PROVISIONS API =====
export const getProvisions = async () => {
  console.log('📦 Fetching provisions...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/provisions`, {
      method: 'GET',
      headers: createHeaders(true),
      mode: 'cors'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Failed to fetch provisions:', error);
    throw error;
  }
};

// ===== ONBOARDING API =====
export const getOnboardingRequests = async () => {
  console.log('📋 Fetching onboarding requests...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/onboarding/requests`, {
      method: 'GET',
      headers: createHeaders(true),
      mode: 'cors'
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Failed to fetch onboarding requests:', error);
    throw error;
  }
};

// ===== DEBUG AND TEST FUNCTIONS =====
export const testApiConnection = async (): Promise<{
  status: string;
  baseUrl: string;
  healthCheck: boolean;
  authEndpoint: boolean;
  mobileCompatible: boolean;
}> => {
  console.log('🔍 Running comprehensive API connection test...');
  
  const result = {
    status: 'testing',
    baseUrl: BASE_URL,
    healthCheck: false,
    authEndpoint: false,
    mobileCompatible: false
  };

  try {
    // Test health endpoint
    const healthResponse = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      mode: 'cors'
    });
    result.healthCheck = healthResponse.ok;
    console.log('🏥 Health check:', result.healthCheck ? '✅' : '❌');

    // Test mobile compatibility
    const mobileResponse = await fetch(`${BASE_URL}/api/auth/mobile-test`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      mode: 'cors'
    });
    result.mobileCompatible = mobileResponse.ok;
    console.log('📱 Mobile compatibility:', result.mobileCompatible ? '✅' : '❌');

    // Test auth endpoint (without credentials)
    const authResponse = await fetch(`${BASE_URL}/api/auth/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      mode: 'cors'
    });
    result.authEndpoint = authResponse.ok;
    console.log('🔐 Auth endpoint:', result.authEndpoint ? '✅' : '❌');

    result.status = 'completed';
    
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    result.status = 'failed';
  }

  console.log('🎯 API Test Results:', result);
  return result;
};

// Export default api object for backward compatibility
export default {
  login,
  getCurrentUser,
  logout,
  verifyToken,
  getUsers,
  getWorkers,
  createWorker,
  getJobTypes,
  getProvisions,
  getOnboardingRequests,
  testApiConnection,
  testMobileConnectivity,
  // Storage helpers
  saveAuthData,
  getAuthData,
  clearAuthData,
  getAuthToken
};