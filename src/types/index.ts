// src/types/index.ts
export type Role = 'admin' | 'harvestflow_manager' | 'flavorcore_manager' | 'staff';

export interface User {
  id: string;
  full_name: string;
  mobile: string;
  role: Role;
  aadhaar_verified: boolean;
  face_template?: string;
  fingerprint_template?: string;
}

export interface Job {
  id: string;
  type: 'daily' | 'harvest';
  crop?: string;
  area: string;
  staff_ids: string[];
  tools?: string[];
  assigned_by: string;
  assigned_at: string;
  completed: boolean;
  review?: string;
}

export interface HarvestLog {
  id: string;
  staff_id: string;
  crop: string;
  raw_weight: number;
  threshed_weight: number;
  rate_per_kg: number;
  wage: number;
  date: string;
  shift: 'morning' | 'evening';
}

export interface ProcurementRequest {
  id: string;
  type: 'goods' | 'wages';
  description: string;
  estimated_cost: number;
  vendor?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  receipts?: string[];
  submitted_by: string;
  submitted_at: string;
}

export interface ProductLot {
  lot_id: string;
  product: string;
  source: 'harvestflow' | 'external';
  raw_weight: number;
  final_weight: number;
  yield_pct: number;
  processed_by: string;
  processed_at: string;
  qr_code: string;
}