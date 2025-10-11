/**
 * API Client for Railway Python Backend
 * Base URL: https://relishagrobackend-production.up.railway.app
 */

// Change this line in api.ts:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://relishagrobackend-production.up.railway.app';

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
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async login(staffId: string) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ staff_id: staffId }),
    });

    if (response.token) {
      this.setToken(response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    }

    return response;
  }

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