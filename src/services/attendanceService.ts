// src/services/attendanceService.ts
import type { 
  AttendanceRecord, 
  FaceAuthResponse, 
  AttendanceLogRequest,
  AttendanceStatsResponse 
} from '../types/attendance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://relishagro-backend.up.railway.app';

class AttendanceService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async authenticateFace(imageBlob: Blob): Promise<FaceAuthResponse> {
    const formData = new FormData();
    formData.append('image', imageBlob, 'face.jpg');

    const response = await fetch(`${API_BASE_URL}/api/face/authenticate`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Face authentication failed');
    }

    return response.json();
  }

  async logAttendance(data: AttendanceLogRequest): Promise<AttendanceRecord> {
    const response = await fetch(`${API_BASE_URL}/api/attendance/log`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to log attendance');
    }

    const result = await response.json();
    return result.data;
  }

  async getAttendanceRecords(filters?: {
    date?: string;
    person_id?: string;
    location?: string;
    method?: string;
  }): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/attendance?${params.toString()}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch attendance records');
    }

    const result = await response.json();
    return result.data || [];
  }

  async getAttendanceStats(location: string): Promise<AttendanceStatsResponse> {
    const today = new Date().toISOString().split('T')[0];
    const records = await this.getAttendanceRecords({ date: today, location });

    const checkInMethods = ['face', 'manual', 'rfid', 'override'];

    return {
      total_records: records.length,
      present_today: records.filter(r => checkInMethods.includes(r.method)).length,
      face_checkins: records.filter(r => r.method === 'face').length,
      manual_checkins: records.filter(r => r.method === 'manual').length,
      average_checkin_time: this.calculateAverageTime(records),
    };
  }

  async updateAttendance(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const response = await fetch(`${API_BASE_URL}/api/attendance/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update attendance');
    }

    const result = await response.json();
    return result.data;
  }

  async deleteAttendance(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/attendance/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete attendance');
    }
  }

  private calculateAverageTime(records: AttendanceRecord[]): string {
    if (records.length === 0) return 'N/A';

    const times = records.map(r => new Date(r.timestamp).getTime());
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    
    return new Date(average).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async checkFaceRegistrationStatus(personId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/face/status/${personId}`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.registered || false;
      }
      return false;
    } catch {
      return false;
    }
  }

  async registerFace(personId: string, imageBlob: Blob): Promise<void> {
    const formData = new FormData();
    formData.append('person_id', personId);
    formData.append('image', imageBlob, 'face.jpg');

    const response = await fetch(`${API_BASE_URL}/api/face/register`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Face registration failed');
    }
  }
}

export const attendanceService = new AttendanceService();