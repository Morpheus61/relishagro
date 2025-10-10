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

  // ... rest of your methods unchanged ...
}

const api = new ApiClient();
export default api;