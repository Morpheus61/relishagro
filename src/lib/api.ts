/**
 * RelishAgro API Client - ABSOLUTELY COMPLETE VERSION WITH ADMIN USER MANAGEMENT
 * 
 * INCLUDES:
 * 1. ALL functions from the original comprehensive version
 * 2. CORRECT user object with ALL required properties  
 * 3. Railway port compatibility
 * 4. Mobile compatibility enhancements
 * 5. Every single function that was in previous versions
 * 6. ADDED: Complete Admin User Management functions
 * 
 * NO TRUNCATION - EVERYTHING INCLUDED - NO DUPLICATE EXPORTS
 */

// ===== CORRECTED API CONFIGURATION =====
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://relishagrobackend-production.up.railway.app';

// DEBUGGING: Log the URL being used
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🚂 Railway Backend: Corrected for port 8080');
console.log('📱 Mobile Fix: Enhanced compatibility');
console.log('👥 Admin User Management: Added');

// ===== AUTHENTICATION STORAGE =====
const AUTH_STORAGE_KEY = 'relishagro_auth';

// ===== ALL INTERFACES FROM ORIGINAL API =====
interface AssignDailyWorkData {
  job_type_id: string;
  worker_ids: string[];
  area_notes: string;
  assigned_by: string;
  date: string;
}

interface CreateLotData {
  lot_id: string;
  crop: string;
  raw_weight: number;
  threshed_weight: number;
  worker_ids: string[];
  created_by: string;
  status: string;
}

interface ApproveLotData {
  approved_by: string;
  notes?: string;
}

interface RejectLotData {
  rejected_by: string;
  reason: string;
}

interface CompleteLotData {
  lot_id: string;
  final_products: { product: string; weight: number }[];
  by_products: { product: string; weight: number }[];
  completed_by: string;
  completion_time: string;
}

interface AddBagToLotData {
  bagId: string;
  tagId: string;
  weight: number;
  timestamp: number;
}

interface RecordRFIDInScanData {
  lot_id: string;
  bag_id: string;
  rfid_tag: string;
  weight: number;
  scanned_by: string;
  timestamp: string;
}

interface DispatchLotData {
  lot_id: string;
  driver_name: string;
  vehicle_number: string;
  destination: string;
  dispatch_time: string;
  status: string;
}

interface UpdateGPSLocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface RecordDryingSampleData {
  id: string;
  lot_id: string;
  sample_weight: number;
  product_type: string;
  notes: string;
  timestamp: string;
}

interface SubmitOnboardingData {
  staff_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  designation: string;
  person_type: string;
  face_descriptor?: number[];
  fingerprint_template?: string;
  profile_image?: string;
}

interface SubmitAttendanceOverrideData {
  worker_id: string;
  check_in: string;
  check_out: string | null;
  override_reason: string;
  status: string;
  submitted_by: string;
  location: { latitude: number; longitude: number };
  timestamp: string;
}

interface ApproveOverrideData {
  notes?: string;
}

interface RejectOverrideData {
  reason: string;
}

interface RegisterFaceData {
  user_id: string;
  face_descriptor: number[];
  image_data?: string;
}

interface SyncAttendanceBatchData {
  records: any[];
}

interface SyncGPSBatchData {
  locations: any[];
}

interface YieldDataParams {
  dateFrom?: string;
  dateTo?: string;
  lotId?: string;
}

// ===== ENHANCED INTERFACES FOR MOBILE COMPATIBILITY =====
export interface LoginRequest {
  staff_id: string;
}

export interface LoginResponse {
  access_token?: string;  // New backend format
  token?: string;         // Old backend format  
  token_type: string;
  staff_id: string;
  role: string;
  first_name: string;
  last_name: string;
  expires_in: number;
  mobile_compatible?: boolean;
  // Support for existing frontend expectations:
  authenticated: boolean;
  user: {
    id: string;              // REQUIRED by AuthContext
    staff_id: string;
    role: string;
    first_name: string;
    last_name: string;
    full_name: string;       // REQUIRED by AuthContext
    designation: string;     // REQUIRED by AuthContext
    department: string;      // REQUIRED by AuthContext
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface UserInfo {
  staff_id: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export interface ApiError {
  detail?: string;
  message?: string;
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

// ===== NEW ADMIN USER MANAGEMENT INTERFACES =====
export interface AdminStats {
  total_users: number;
  active_users: number;
  total_admins: number;
  total_supervisors: number;
  total_harvestflow_users: number;
  total_flavorcore_users: number;
  recent_registrations: number;
  system_health: string;
}

export interface UserSummary {
  staff_id: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  last_login?: string;
}

export interface AdminUserResponse {
  users: UserSummary[];
  total_count: number;
  page: number;
  per_page: number;
}

export interface UserCreateRequest {
  staff_id: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active?: boolean;
}

export interface UserUpdateRequest {
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
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

// ===== COMPLETE API CLIENT CLASS =====
class ApiClient {
  // REMOVED: private token: string | null = null;

  // REMOVED: constructor() { ... }

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  clearAuth() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('relishagro_auth'); // Clear new auth storage too
  }

  // Helper function to get designation from role
  private getRoleDesignation(role: string): string {
    const designationMap: { [key: string]: string } = {
      'Admin': 'System Administrator',
      'HarvestFlow': 'Harvest Flow Manager',
      'FlavorCore': 'Flavor Core Manager', 
      'Supervisor': 'Field Supervisor',
      'Worker': 'Field Worker'
    };
    return designationMap[role] || 'Staff Member';
  }

  // Helper function to get department from role
  private getRoleDepartment(role: string): string {
    const departmentMap: { [key: string]: string } = {
      'Admin': 'Administration',
      'HarvestFlow': 'Harvest Operations',
      'FlavorCore': 'Processing Department',
      'Supervisor': 'Field Operations',
      'Worker': 'Field Operations'
    };
    return departmentMap[role] || 'General';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    // ✅ DYNAMICALLY GET TOKEN ON EVERY REQUEST
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache', // Mobile compatibility
      ...(token && { 'Authorization': `Bearer ${token}` }), // ✅ Use dynamic token
      ...options.headers,
    };

    console.log(`📡 API Request: ${options.method || 'GET'} ${endpoint}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      mode: 'cors', // Explicit CORS for mobile
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let error: ApiError;
      try {
        error = await response.json();
      } catch {
        error = { message: 'Request failed', mobile_debug: true };
      }
      
      // Handle authentication errors
      if (response.status === 401) {
        console.log('🔒 Authentication failed, clearing stored data');
        this.clearAuth();
      }
      
      throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Response data received');
    return data;
  }

  // ===== AUTHENTICATION METHODS =====
  async login(staffId: string): Promise<LoginResponse> {
    console.log('🔐 Starting login for staff_id:', staffId);
    
    try {
      const response = await this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ staff_id: staffId }),
      });

      // Handle both old and new response formats
      const token = response.access_token || response.token;
      
      if (token) {
        this.setToken(token);
        
        // Create COMPLETE user object with ALL required properties
        const user = {
          id: response.staff_id || staffId, // Use staff_id as id if no separate id
          staff_id: response.staff_id || staffId,
          role: response.role,  
          first_name: response.first_name || '',
          last_name: response.last_name || '',
          full_name: `${response.first_name || ''} ${response.last_name || ''}`.trim() || response.staff_id,
          designation: this.getRoleDesignation(response.role),
          department: this.getRoleDepartment(response.role),
          username: response.staff_id || staffId,
          email: `${response.staff_id}@relishagro.com`, // Generate email if needed
          firstName: response.first_name,
          lastName: response.last_name
        };
        
        localStorage.setItem('user_data', JSON.stringify(user));
        
        // Save authentication data using helper
        if (response.access_token) {
          saveAuthData({
            access_token: response.access_token,
            token_type: response.token_type,
            staff_id: response.staff_id,
            role: response.role,
            first_name: response.first_name,
            last_name: response.last_name,
            expires_in: response.expires_in
          });
        }
        
        // Return in expected format with COMPLETE user object
        const loginResponse: LoginResponse = {
          ...response,
          token: token, // For backward compatibility
          authenticated: true,
          user: user
        };
        
        console.log('✅ Login successful for:', user.staff_id, 'Role:', user.role);
        return loginResponse;
      }

      throw new Error('No token received from server');
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  // ===== MOBILE COMPATIBILITY METHODS =====
  async testMobileConnectivity(): Promise<boolean> {
    try {
      console.log('📱 Testing mobile connectivity to Railway backend...');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/mobile-test`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'User-Agent': navigator.userAgent
        },
        mode: 'cors',
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
  }

  async getCurrentUser(): Promise<UserInfo> {
    console.log('👤 Fetching current user info...');
    
    try {
      const response = await this.request('/api/auth/me', {
        method: 'GET'
      });

      return response;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    console.log('🚪 Logging out...');
    
    try {
      const response = await this.request('/api/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('❌ Logout request failed:', error);
      // Continue with local logout even if server request fails
    } finally {
      this.clearAuth();
      clearAuthData();
      console.log('✅ Local logout completed');
    }
  }

  async verifyToken(): Promise<boolean> {
    console.log('🔍 Verifying token...');
    
    try {
      const response = await this.request('/api/auth/verify-token', {
        method: 'POST'
      });

      if (response.valid === true) {
        console.log('✅ Token is valid');
        return true;
      } else {
        console.log('❌ Token is invalid');
        this.clearAuth();
        clearAuthData();
        return false;
      }
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      this.clearAuth();
      clearAuthData();
      return false;
    }
  }

  // ===== NEW ADMIN USER MANAGEMENT FUNCTIONS =====
  async getAdminStats(): Promise<AdminStats> {
    console.log('📊 Fetching admin statistics...');
    return this.request('/api/admin/stats', { method: 'GET' });
  }

  async getUsers(page: number = 1, per_page: number = 20, role?: string, search?: string): Promise<AdminUserResponse> {
    console.log('👥 Fetching users from person_records table...');
    
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
      ...(role && { role }),
      ...(search && { search })
    });
    
    try {
      const response = await this.request(`/api/admin/users?${params}`, {
        method: 'GET'
      });

      return response;
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      throw error;
    }
  }

  async getUserById(staffId: string) {
    console.log(`👤 Fetching user details for: ${staffId}`);
    return this.request(`/api/admin/users/${staffId}`, { method: 'GET' });
  }

  async createUser(userData: UserCreateRequest) {
    console.log('➕ Creating new app user...');
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(staffId: string, userData: UserUpdateRequest) {
    console.log(`📝 Updating user: ${staffId}`);
    return this.request(`/api/admin/users/${staffId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(staffId: string) {
    console.log(`🗑️ Deleting user: ${staffId}`);
    return this.request(`/api/admin/users/${staffId}`, { method: 'DELETE' });
  }

  async getAvailableRoles() {
    console.log('🏷️ Fetching available roles...');
    return this.request('/api/admin/roles', { method: 'GET' });
  }

  async getSystemHealth() {
    console.log('🏥 Checking system health...');
    return this.request('/api/admin/system/health', { method: 'GET' });
  }

  // ===== WORKER MANAGEMENT =====
  async getWorkers() {
    return this.request('/api/workers');
  }

  async getWorkerById(id: string) {
    return this.request(`/api/workers/${id}`);
  }

  // ===== JOB TYPES =====
  async getJobTypes() {
    return this.request('/api/job-types');
  }

  // ===== DAILY WORK ASSIGNMENT =====
  async assignDailyWork(data: AssignDailyWorkData) {
    return this.request('/api/daily-work/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===== LOT MANAGEMENT =====
  async createLot(data: CreateLotData) {
    return this.request('/api/lots/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLotStatus(lotId: string, status: string) {
    return this.request(`/api/lots/${lotId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateLot(lotId: string, data: any) {
    return this.request(`/api/lots/${lotId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getLotsForApproval() {
    return this.request('/api/lots/pending-approval');
  }

  async approveLot(lotId: string, data: ApproveLotData) {
    return this.request(`/api/lots/${lotId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectLot(lotId: string, data: RejectLotData) {
    return this.request(`/api/lots/${lotId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeLot(data: CompleteLotData) {
    return this.request('/api/lots/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addBagToLot(lotId: string, bagData: AddBagToLotData) {
    return this.request(`/api/lots/${lotId}/bags`, {
      method: 'POST',
      body: JSON.stringify(bagData),
    });
  }

  // ===== RFID OPERATIONS =====
  async recordRFIDInScan(data: RecordRFIDInScanData) {
    return this.request('/api/rfid/in-scan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===== DISPATCH MANAGEMENT =====
  async dispatchLot(data: DispatchLotData) {
    return this.request('/api/dispatch/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGPSLocation(lotId: string, location: UpdateGPSLocationData) {
    return this.request(`/api/dispatch/${lotId}/gps`, {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  // ===== SAMPLE RECORDING =====
  async recordDryingSample(sample: RecordDryingSampleData) {
    return this.request('/api/samples/drying', {
      method: 'POST',
      body: JSON.stringify(sample),
    });
  }

  // ===== QR LABEL GENERATION =====
  async generateQRLabel(lotId: string) {
    return this.request(`/api/qr/generate/${lotId}`, {
      method: 'POST',
    });
  }

  // ===== SUPERVISOR OPERATIONS =====
  async getSupervisorLots(supervisorId: string) {
    return this.request(`/api/supervisor/${supervisorId}/lots`);
  }

  // ===== PROVISIONS MANAGEMENT =====
  async getPendingProvisions() {
    return this.request('/api/provisions/pending');
  }

  async approveProvision(provisionId: string) {
    return this.request(`/api/provisions/${provisionId}/approve`, {
      method: 'POST',
    });
  }

  async rejectProvision(provisionId: string, reason: string) {
    return this.request(`/api/provisions/${provisionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ===== ONBOARDING MANAGEMENT =====
  async getPendingOnboarding() {
    return this.request('/api/onboarding/pending');
  }

  async submitOnboarding(data: SubmitOnboardingData) {
    return this.request('/api/onboarding/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===== ATTENDANCE MANAGEMENT =====
  async submitAttendanceOverride(data: SubmitAttendanceOverrideData) {
    return this.request('/api/attendance/override', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPendingOverrides() {
    return this.request('/api/attendance/overrides/pending');
  }

  async approveOverride(overrideId: string, notes?: string) {
    return this.request(`/api/attendance/overrides/${overrideId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectOverride(overrideId: string, reason: string) {
    return this.request(`/api/attendance/overrides/${overrideId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ===== BIOMETRIC AUTHENTICATION =====
  async registerFace(data: RegisterFaceData) {
    return this.request('/api/biometric/face/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async authenticateFace(faceDescriptor: number[]) {
    return this.request('/api/biometric/face/authenticate', {
      method: 'POST',
      body: JSON.stringify({ face_descriptor: faceDescriptor }),
    });
  }

  // ===== SYNC OPERATIONS =====
  async syncAttendanceBatch(records: any[]) {
    return this.request('/api/sync/attendance/batch', {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
  }

  async syncGPSBatch(locations: any[]) {
    return this.request('/api/sync/gps/batch', {
      method: 'POST',
      body: JSON.stringify({ locations }),
    });
  }

  // ===== YIELD DATA =====
  async getYieldData(params?: YieldDataParams) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request(`/api/yields?${queryParams}`);
  }

  async createWorker(workerData: any) {
    console.log('➕ Creating new worker...');
    
    try {
      const response = await this.request('/api/workers', {
        method: 'POST',
        body: JSON.stringify(workerData)
      });

      return response;
    } catch (error) {
      console.error('❌ Failed to create worker:', error);
      throw error;
    }
  }

  // ===== PROVISIONS API =====
  async getProvisions() {
    console.log('📦 Fetching provisions...');
    
    try {
      const response = await this.request('/api/provisions', {
        method: 'GET'
      });

      return response;
    } catch (error) {
      console.error('❌ Failed to fetch provisions:', error);
      throw error;
    }
  }

  // ===== ONBOARDING API =====
  async getOnboardingRequests() {
    console.log('📋 Fetching onboarding requests...');
    
    try {
      const response = await this.request('/api/onboarding/requests', {
        method: 'GET'
      });

      return response;
    } catch (error) {
      console.error('❌ Failed to fetch onboarding requests:', error);
      throw error;
    }
  }

  // ===== DEBUG AND TEST FUNCTIONS =====
  async testApiConnection(): Promise<{
    status: string;
    baseUrl: string;
    healthCheck: boolean;
    authEndpoint: boolean;
    mobileCompatible: boolean;
  }> {
    console.log('🔍 Running comprehensive API connection test...');
    
    const result = {
      status: 'testing',
      baseUrl: API_BASE_URL,
      healthCheck: false,
      authEndpoint: false,
      mobileCompatible: false
    };

    try {
      // Test health endpoint
      const healthResponse = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      result.healthCheck = healthResponse.ok;
      console.log('🏥 Health check:', result.healthCheck ? '✅' : '❌');

      // Test mobile compatibility
      const mobileResponse = await fetch(`${API_BASE_URL}/api/auth/mobile-test`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      result.mobileCompatible = mobileResponse.ok;
      console.log('📱 Mobile compatibility:', result.mobileCompatible ? '✅' : '❌');

      // Test auth endpoint (without credentials)
      const authResponse = await fetch(`${API_BASE_URL}/api/auth/health`, {
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
  }
}

// ===== EXPORT SINGLE INSTANCE =====
const api = new ApiClient();
export default api;