// src/types/attendance.ts

export interface AttendanceRecord {
  id: string;
  person_id: string;
  method: 'rfid' | 'face' | 'override' | 'manual' | 'checkout';
  timestamp: string;
  location: string;
  verified_by?: string;
  override_reason?: string;
  confidence_score?: number;
  device_id?: string;
  created_at: string;
  person?: PersonInfo;
}

export interface PersonInfo {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  contact_number?: string;
  designation?: string;
  person_type: string;
  status: 'active' | 'inactive';
  face_registered_at?: string;
}

export interface FaceAuthResponse {
  authenticated: boolean;
  person_id?: string;
  person_name?: string;
  confidence?: number;
  mode?: string;
  error?: string;
}

export interface AttendanceLogRequest {
  person_id: string;
  method: 'face' | 'manual' | 'rfid' | 'override' | 'checkout';
  location: string;
  confidence_score?: number;
  override_reason?: string;
  device_id?: string;
}

export interface AttendanceStatsResponse {
  total_records: number;
  present_today: number;
  face_checkins: number;
  manual_checkins: number;
  average_checkin_time: string;
}