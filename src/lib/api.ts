/**
 * API Client for Railway Python Backend
 * Base URL: https://relishagrobackend-production.up.railway.app
 */

// CORRECTED: Use your actual Railway URL from the dashboard
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://relishagrobackend-production.up.railway.app';

// Enhanced debug logging
const debugLog = (message: string, data?: any) => {
  console.log(`[API DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// Define all data interfaces
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

class ApiClient {
  private token: string | null = null;

  constructor() {
    // FIXED: Use same token key as AuthContext
    this.token = localStorage.getItem('access_token');
    debugLog('ApiClient initialized', { hasToken: !!this.token, baseUrl: API_BASE_URL });
  }

  setToken(token: string) {
    debugLog('Setting API token');
    this.token = token;
    // FIXED: Use same token key as AuthContext
    localStorage.setItem('access_token', token);
  }

  clearAuth() {
    debugLog('Clearing API authentication');
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    debugLog('Making API request', { url, method: options.method || 'GET' });

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      debugLog('API response received', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        debugLog('API request failed', error);
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      debugLog('API request successful', { endpoint });
      return data;

    } catch (error) {
      debugLog('API request error', error);
      throw error;
    }
  }

  async login(staffId: string) {
    debugLog('API login attempt', { staffId });
    
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ staff_id: staffId }),
    });

    debugLog('Login response received', response);

    // Handle different response formats from your backend
    if (response.access_token) {
      debugLog('Setting token from access_token field');
      this.setToken(response.access_token);
      
      // Store user data in same format as AuthContext expects
      const userData = {
        staff_id: response.staff_id,
        role: response.role,
        full_name: response.full_name || (response.first_name && response.last_name ? `${response.first_name} ${response.last_name}` : staffId),
        department: response.role,
        phone_number: response.phone_number,
        email: response.email,
        id: response.staff_id,
        designation: response.role
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      return {
        authenticated: true,
        user: userData,
        access_token: response.access_token
      };
    } else if (response.token) {
      debugLog('Setting token from token field');
      this.setToken(response.token);
      
      const userData = response.user || {
        staff_id: staffId,
        role: response.role || 'staff',
        full_name: response.full_name || staffId,
        department: response.role || 'staff',
        id: staffId,
        designation: response.role || 'staff'
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      return {
        authenticated: true,
        user: userData,
        access_token: response.token
      };
    }

    debugLog('Login failed - no token in response');
    return {
      authenticated: false,
      user: null
    };
  }

  // ... rest of your methods remain exactly the same ...
  async getWorkers() {
    return this.request('/api/workers');
  }

  async getWorkerById(id: string) {
    return this.request(`/api/workers/${id}`);
  }

  async getJobTypes() {
    return this.request('/api/job-types');
  }

  async assignDailyWork(data: AssignDailyWorkData) {
    return this.request('/api/daily-work/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

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

  async recordRFIDInScan(data: RecordRFIDInScanData) {
    return this.request('/api/rfid/in-scan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

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

  async recordDryingSample(sample: RecordDryingSampleData) {
    return this.request('/api/samples/drying', {
      method: 'POST',
      body: JSON.stringify(sample),
    });
  }

  async generateQRLabel(lotId: string) {
    return this.request(`/api/qr/generate/${lotId}`, {
      method: 'POST',
    });
  }

  async getSupervisorLots(supervisorId: string) {
    return this.request(`/api/supervisor/${supervisorId}/lots`);
  }

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

  async getPendingOnboarding() {
    return this.request('/api/onboarding/pending');
  }

  async submitOnboarding(data: SubmitOnboardingData) {
    return this.request('/api/onboarding/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

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

  async getYieldData(params?: YieldDataParams) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request(`/api/yields?${queryParams}`);
  }
}

const api = new ApiClient();
export default api;