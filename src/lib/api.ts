// src/lib/api.ts
// TEMPORARY FIX: Direct Railway connection until Vercel proxy is fixed

const API_BASE_URL = 'https://relishagrobackend-production.up.railway.app';

export interface LoginResponse {
  success: boolean;
  authenticated?: boolean;  // ✅ ADDED
  data: {
    token: string;
    user: {
      id: string;
      staff_id: string;
      role: string;
      first_name: string;
      last_name: string;
      full_name: string;
      designation: string;
      department: string;
      username: string;
      email: string;
    };
  };
  user?: {  // ✅ ADDED - for backward compatibility
    id: string;
    staff_id: string;
    role: string;
    first_name: string;
    last_name: string;
    full_name: string;
    designation: string;
    department: string;
    username: string;
    email: string;
  };
  message: string;
}

export interface User {
  id: string;
  staff_id: string;
  role: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  designation?: string;
  department?: string;
  username?: string;
  email?: string;
  contact_number?: string;
  address?: string;
  person_type?: string;
  status?: string;
}

export interface Worker {
  id: string;
  staff_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  contact_number?: string;
  address?: string;
  person_type: string;
  status: string;
  employment_start_date?: string;
  is_seasonal_worker?: boolean;
}

export interface JobType {
  id: string;
  job_name: string;
  category: string;
  unit_of_measurement: string;
  expected_output_per_worker: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingRequest {
  id: string;
  first_name: string;
  last_name: string;
  mobile?: string;
  address?: string;
  role?: string;
  status: string;
  submitted_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProvisionRequest {
  id: string;
  request_type: string;
  description: string;
  amount?: number;
  vendor?: string;
  status: string;
  requested_by?: string;
  created_at: string;
  updated_at: string;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private token: string | null = null;  // ✅ ADDED

  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 90000; // 90 seconds

    console.log('🔗 API Configuration:');
    console.log('📍 Environment: Production (Direct to Railway)');
    console.log('🌐 Base URL:', this.baseURL);
    console.log('🚀 Mode: Direct Connection (Bypass Vercel)');
    console.log('📱 Mobile Compatible: Yes');
  }

  // ✅ ADDED: Token management
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private getAuthToken(): string | null {
    if (this.token) return this.token;
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  // ✅ ADDED: Clear auth
  clearAuth() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`📡 API Request: ${options.method || 'GET'} ${endpoint}`);
    console.log('🌐 Full URL:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏱️ Request timeout after 90 seconds');
      controller.abort();
    }, this.timeout);

    try {
      const token = this.getAuthToken();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
        mode: 'cors',
        credentials: 'omit',
      });

      clearTimeout(timeoutId);

      console.log(`✅ Response Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error: ${response.status}`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('❌ Request timeout');
        throw new Error('Request timeout - Server is not responding. Please check your internet connection.');
      }
      
      console.error('❌ Request failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  async login(staffId: string): Promise<LoginResponse> {
    console.log('🔐 Starting login for staff_id:', staffId);
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ staff_id: staffId }),
    });
  }

  async logout(): Promise<void> {
    console.log('🚪 Logging out');
    this.clearAuth();
  }

  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    return this.request('/api/auth/verify', {
      method: 'GET',
    });
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  async getUsers(): Promise<User[]> {
    const response = await this.request<{ success: boolean; data: User[] }>('/api/admin/users');
    return response.data || [];
  }

  async getUser(userId: string): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>(`/api/admin/users/${userId}`);
    return response.data;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data;
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // WORKER MANAGEMENT
  // ============================================================================

  async getWorkers(): Promise<Worker[]> {
    const response = await this.request<{ success: boolean; data: Worker[] }>('/api/workers');
    return response.data || [];
  }

  async getWorker(workerId: string): Promise<Worker> {
    const response = await this.request<{ success: boolean; data: Worker }>(`/api/workers/${workerId}`);
    return response.data;
  }

  async createWorker(workerData: Partial<Worker>): Promise<Worker> {
    const response = await this.request<{ success: boolean; data: Worker }>('/api/workers', {
      method: 'POST',
      body: JSON.stringify(workerData),
    });
    return response.data;
  }

  async updateWorker(workerId: string, workerData: Partial<Worker>): Promise<Worker> {
    const response = await this.request<{ success: boolean; data: Worker }>(`/api/workers/${workerId}`, {
      method: 'PUT',
      body: JSON.stringify(workerData),
    });
    return response.data;
  }

  async deleteWorker(workerId: string): Promise<void> {
    await this.request(`/api/workers/${workerId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // JOB TYPES
  // ============================================================================

  async getJobTypes(): Promise<JobType[]> {
    const response = await this.request<{ success: boolean; data: JobType[] }>('/api/job-types');
    return response.data || [];
  }

  async getJobType(jobTypeId: string): Promise<JobType> {
    const response = await this.request<{ success: boolean; data: JobType }>(`/api/job-types/${jobTypeId}`);
    return response.data;
  }

  async createJobType(jobTypeData: Partial<JobType>): Promise<JobType> {
    const response = await this.request<{ success: boolean; data: JobType }>('/api/job-types', {
      method: 'POST',
      body: JSON.stringify(jobTypeData),
    });
    return response.data;
  }

  async updateJobType(jobTypeId: string, jobTypeData: Partial<JobType>): Promise<JobType> {
    const response = await this.request<{ success: boolean; data: JobType }>(`/api/job-types/${jobTypeId}`, {
      method: 'PUT',
      body: JSON.stringify(jobTypeData),
    });
    return response.data;
  }

  async deleteJobType(jobTypeId: string): Promise<void> {
    await this.request(`/api/job-types/${jobTypeId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // ONBOARDING
  // ============================================================================

  async getPendingOnboarding(): Promise<OnboardingRequest[]> {
    const response = await this.request<{ success: boolean; data: OnboardingRequest[] }>('/api/onboarding/pending');
    return response.data || [];
  }

  async getOnboardingRequest(requestId: string): Promise<OnboardingRequest> {
    const response = await this.request<{ success: boolean; data: OnboardingRequest }>(`/api/onboarding/${requestId}`);
    return response.data;
  }

  async createOnboardingRequest(requestData: Partial<OnboardingRequest>): Promise<OnboardingRequest> {
    const response = await this.request<{ success: boolean; data: OnboardingRequest }>('/api/onboarding', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return response.data;
  }

  // ✅ ADDED: Submit onboarding (alias for create)
  async submitOnboarding(onboardingData: any): Promise<any> {
    return this.createOnboardingRequest(onboardingData);
  }

  async approveOnboardingRequest(requestId: string): Promise<void> {
    await this.request(`/api/onboarding/${requestId}/approve`, {
      method: 'POST',
    });
  }

  async rejectOnboardingRequest(requestId: string, reason?: string): Promise<void> {
    await this.request(`/api/onboarding/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ============================================================================
  // PROVISIONS
  // ============================================================================

  async getProvisionRequests(): Promise<ProvisionRequest[]> {
    const response = await this.request<{ success: boolean; data: ProvisionRequest[] }>('/api/provisions');
    return response.data || [];
  }

  async getPendingProvisions(): Promise<ProvisionRequest[]> {
    const response = await this.request<{ success: boolean; data: ProvisionRequest[] }>('/api/provisions/pending');
    return response.data || [];
  }

  async getProvisionRequest(requestId: string): Promise<ProvisionRequest> {
    const response = await this.request<{ success: boolean; data: ProvisionRequest }>(`/api/provisions/${requestId}`);
    return response.data;
  }

  async createProvisionRequest(requestData: Partial<ProvisionRequest>): Promise<ProvisionRequest> {
    const response = await this.request<{ success: boolean; data: ProvisionRequest }>('/api/provisions', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    return response.data;
  }

  async approveProvisionRequest(requestId: string): Promise<void> {
    await this.request(`/api/provisions/${requestId}/approve`, {
      method: 'POST',
    });
  }

  async rejectProvisionRequest(requestId: string, reason?: string): Promise<void> {
    await this.request(`/api/provisions/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ============================================================================
  // ATTENDANCE
  // ============================================================================

  async markAttendance(personId: string, method: string = 'manual'): Promise<void> {
    await this.request('/api/attendance', {
      method: 'POST',
      body: JSON.stringify({ person_id: personId, method }),
    });
  }

  async getAttendance(date?: string): Promise<any[]> {
    const endpoint = date ? `/api/attendance?date=${date}` : '/api/attendance';
    const response = await this.request<{ success: boolean; data: any[] }>(endpoint);
    return response.data || [];
  }

  // ✅ ADDED: Submit attendance override
  async submitAttendanceOverride(overrideData: any): Promise<any> {
    return this.request('/api/attendance/override', {
      method: 'POST',
      body: JSON.stringify(overrideData),
    });
  }

  // ✅ ADDED: Sync attendance batch
  async syncAttendanceBatch(attendanceRecords: any[]): Promise<any> {
    return this.request('/api/attendance/sync', {
      method: 'POST',
      body: JSON.stringify({ records: attendanceRecords }),
    });
  }

  // ============================================================================
  // BIOMETRIC / FACE RECOGNITION
  // ============================================================================

  // ✅ ADDED: Register face
  async registerFace(faceData: any): Promise<any> {
    return this.request('/api/face/register', {
      method: 'POST',
      body: JSON.stringify(faceData),
    });
  }

  // ✅ ADDED: Authenticate face
  async authenticateFace(faceData: any): Promise<any> {
    return this.request('/api/face/authenticate', {
      method: 'POST',
      body: JSON.stringify(faceData),
    });
  }

  // ============================================================================
  // GPS TRACKING
  // ============================================================================

  // ✅ ADDED: Sync GPS batch
  async syncGPSBatch(gpsRecords: any[]): Promise<any> {
    return this.request('/api/gps/sync', {
      method: 'POST',
      body: JSON.stringify({ records: gpsRecords }),
    });
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  async healthCheck(): Promise<{ status: string; database: string }> {
    return this.request('/health');
  }
}

// Export singleton instance
export const api = new ApiClient();
export default api;