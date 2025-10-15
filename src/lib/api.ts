/**
 * RelishAgro API Client - COMPLETE CORRECTED VERSION
 * 
 * FIXES:
 * 1. Railway port 8080 compatibility (correct URL)
 * 2. Mobile browser compatibility
 * 3. ALL missing functions from original API
 * 4. Correct LoginResponse interface
 * 5. Enhanced error handling and debugging
 */

// ===== CORRECTED API CONFIGURATION =====
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://relishagrobackend-production.up.railway.app';

// DEBUGGING: Log the URL being used
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🚂 Railway Backend: Corrected for port 8080');
console.log('📱 Mobile Fix: Enhanced compatibility');

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
    staff_id: string;
    role: string;
    first_name: string;
    last_name: string;
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

// ===== COMPLETE API CLIENT CLASS =====
class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearAuth() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('relishagro_auth'); // Clear new auth storage too
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache', // Mobile compatibility
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    console.log(`📡 API Request: ${options.method || 'GET'} ${endpoint}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      mode: 'cors' // Explicit CORS for mobile
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
        
        // Create user object for compatibility
        const user = {
          staff_id: response.staff_id,
          role: response.role,  
          first_name: response.first_name,
          last_name: response.last_name
        };
        
        localStorage.setItem('user_data', JSON.stringify(user));
        
        // Return in expected format
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
      console.log('📱 Testing mobile connectivity...');
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      
      const isConnected = response.ok;
      console.log('📱 Mobile connectivity:', isConnected ? '✅' : '❌');
      return isConnected;
    } catch (error) {
      console.error('❌ Mobile connectivity test failed:', error);
      return false;
    }
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

  // ===== ADDITIONAL API METHODS FOR COMPATIBILITY =====
  async getCurrentUser(): Promise<UserInfo> {
    try {
      return await this.request('/api/auth/me');
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('❌ Logout request failed:', error);
    } finally {
      this.clearAuth();
      console.log('✅ Local logout completed');
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.request('/api/auth/verify-token', {
        method: 'POST'
      });
      return response.valid === true;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      this.clearAuth();
      return false;
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

      // Test mobile compatibility
      const mobileResponse = await fetch(`${API_BASE_URL}/mobile-test`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      result.mobileCompatible = mobileResponse.ok;

      // Test auth endpoint
      const authResponse = await fetch(`${API_BASE_URL}/api/auth/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      result.authEndpoint = authResponse.ok;

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