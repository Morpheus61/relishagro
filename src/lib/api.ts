/**
 * API Client for Railway Python Backend
 * Base URL: https://relishagrobackend-production.up.railway.app
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://relishagrobackend-production.up.railway.app';

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
    const response = await this.request('/auth/login', {
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
    return this.request('/workers');
  }

  async getWorkerById(id: string) {
    return this.request(`/workers/${id}`);
  }

  async getJobTypes() {
    return this.request('/job-types');
  }

  async assignDailyWork(data: {
    job_type_id: string;
    worker_ids: string[];
    area_notes: string;
    assigned_by: string;
    date: string;
  }) {
    return this.request('/daily-work/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createLot(data: {
    lot_id: string;
    crop: string;
    raw_weight: number;
    threshed_weight: number;
    worker_ids: string[];
    created_by: string;
    status: string;
  }) {
    return this.request('/lots/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLotStatus(lotId: string, status: string) {
    return this.request(`/lots/${lotId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateLot(lotId: string, data: any) {
    return this.request(`/lots/${lotId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getLotsForApproval() {
    return this.request('/lots/pending-approval');
  }

  async approveLot(lotId: string, data: { approved_by: string; notes?: string }) {
    return this.request(`/lots/${lotId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectLot(lotId: string, data: { rejected_by: string; reason: string }) {
    return this.request(`/lots/${lotId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeLot(data: {
    lot_id: string;
    final_products: { product: string; weight: number }[];
    by_products: { product: string; weight: number }[];
    completed_by: string;
    completion_time: string;
  }) {
    return this.request('/lots/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addBagToLot(lotId: string, bagData: {
    bagId: string;
    tagId: string;
    weight: number;
    timestamp: number;
  }) {
    return this.request(`/lots/${lotId}/bags`, {
      method: 'POST',
      body: JSON.stringify(bagData),
    });
  }

  async recordRFIDInScan(data: {
    lot_id: string;
    bag_id: string;
    rfid_tag: string;
    weight: number;
    scanned_by: string;
    timestamp: string;
  }) {
    return this.request('/rfid/in-scan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async dispatchLot(data: {
    lot_id: string;
    driver_name: string;
    vehicle_number: string;
    destination: string;
    dispatch_time: string;
    status: string;
  }) {
    return this.request('/dispatch/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGPSLocation(lotId: string, location: {
    latitude: number;
    longitude: number;
    timestamp: number;
  }) {
    return this.request(`/dispatch/${lotId}/gps`, {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  async recordDryingSample(sample: {
    id: string;
    lot_id: string;
    sample_weight: number;
    product_type: string;
    notes: string;
    timestamp: string;
  }) {
    return this.request('/samples/drying', {
      method: 'POST',
      body: JSON.stringify(sample),
    });
  }

  async generateQRLabel(lotId: string) {
    return this.request(`/qr/generate/${lotId}`, {
      method: 'POST',
    });
  }

  async getSupervisorLots(supervisorId: string) {
    return this.request(`/supervisor/${supervisorId}/lots`);
  }

  async getPendingProvisions() {
    return this.request('/provisions/pending');
  }

  async approveProvision(provisionId: string) {
    return this.request(`/provisions/${provisionId}/approve`, {
      method: 'POST',
    });
  }

  async rejectProvision(provisionId: string, reason: string) {
    return this.request(`/provisions/${provisionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getPendingOnboarding() {
    return this.request('/onboarding/pending');
  }

  async submitOnboarding(data: {
    staff_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    designation: string;
    person_type: string;
    face_descriptor?: number[];
    fingerprint_template?: string;
    profile_image?: string;
  }) {
    return this.request('/onboarding/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitAttendanceOverride(data: {
    worker_id: string;
    check_in: string;
    check_out: string | null;
    override_reason: string;
    status: string;
    submitted_by: string;
    location: { latitude: number; longitude: number };
    timestamp: string;
  }) {
    return this.request('/attendance/override', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPendingOverrides() {
    return this.request('/attendance/overrides/pending');
  }

  async approveOverride(overrideId: string, notes?: string) {
    return this.request(`/attendance/overrides/${overrideId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectOverride(overrideId: string, reason: string) {
    return this.request(`/attendance/overrides/${overrideId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async registerFace(data: {
    user_id: string;
    face_descriptor: number[];
    image_data?: string;
  }) {
    return this.request('/biometric/face/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async authenticateFace(faceDescriptor: number[]) {
    return this.request('/biometric/face/authenticate', {
      method: 'POST',
      body: JSON.stringify({ face_descriptor: faceDescriptor }),
    });
  }

  async syncAttendanceBatch(records: any[]) {
    return this.request('/sync/attendance/batch', {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
  }

  async syncGPSBatch(locations: any[]) {
    return this.request('/sync/gps/batch', {
      method: 'POST',
      body: JSON.stringify({ locations }),
    });
  }

  async getYieldData(params?: {
    dateFrom?: string;
    dateTo?: string;
    lotId?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.request(`/yields?${queryParams}`);
  }
}

const api = new ApiClient();
export default api;