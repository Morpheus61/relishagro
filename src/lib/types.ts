export interface User {
  id: string;
  staff_id: string;
  full_name: string;
  role: 'admin' | 'harvestflow_manager' | 'flavorcore_manager' | 'flavorcore_supervisor' | 'vendor' | 'driver';
  role_display: string;
  designation?: string;
  contact_number?: string;
}

export interface AttendanceRecord {
  id: string;
  worker_id: string;
  worker_name: string;
  check_in: string;
  check_out?: string;
  method: 'face' | 'fingerprint' | 'manual_override';
  override_reason?: string;
  override_by?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Lot {
  lot_id: string;
  crop: string;
  date_harvested: string;
  threshed_weight?: number;
  estate_yield_pct?: number;
  driver_id?: string;
  vehicle_id?: string;
  rfid_tags?: string[];
  status: string;
}

export interface ProvisionRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface OnboardingRequest {
  id: string;
  full_name: string;
  aadhaar_number: string;
  contact_number: string;
  person_type: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}