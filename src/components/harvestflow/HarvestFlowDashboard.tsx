// src/components/harvestflow/HarvestFlowDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Users, 
  ClipboardList, 
  Weight, 
  Package, 
  Truck, 
  MapPin, 
  Calendar,
  Plus,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Navigation,
  User,
  Phone,
  UserPlus,
  ShoppingCart,
  Archive,
  Send,
  Building,
  Mail,
  MapPinIcon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

// Enhanced Navigation Component
interface NavigationItem {
  id: string;
  label: string;
}
interface EnhancedNavigationProps {
  items: NavigationItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({
  items,
  activeTab,
  onTabChange,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollLeft = () => {
    const newPosition = Math.max(0, scrollPosition - 200);
    setScrollPosition(newPosition);
  };
  const scrollRight = () => {
    const maxScroll = Math.max(0, (items.length * 120) - 600);
    const newPosition = Math.min(maxScroll, scrollPosition + 200);
    setScrollPosition(newPosition);
  };
  return (
    <>
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="w-full flex items-center justify-between"
        >
          <span>{items.find(item => item.id === activeTab)?.label || 'Menu'}</span>
          {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        {showMobileMenu && (
          <div className="mt-2 space-y-1 bg-white border rounded-md shadow-lg z-10 absolute left-0 right-0 mx-4">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-600 font-medium' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="hidden md:flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={scrollLeft}
          disabled={scrollPosition === 0}
          className="mr-2 flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${scrollPosition}px)` }}
          >
            {items.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "outline"}
                onClick={() => onTabChange(item.id)}
                className="mr-2 flex-shrink-0 whitespace-nowrap min-w-0 transition-all"
                style={{ minWidth: '120px' }}
              >
                <span className="truncate px-1">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={scrollRight}
          disabled={scrollPosition >= Math.max(0, (items.length * 120) - 600)}
          className="ml-2 flex-shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

// Interfaces
interface Worker {
  id: string;
  name: string;
  staff_id: string;
  role: string;
  phone: string;
  department: string;
  attendance_status: 'present' | 'absent' | 'late';
  created_at: string;
}
interface Job {
  id: string;
  type: 'normal' | 'harvest';
  title: string;
  assigned_workers: string[];
  field_location: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}
interface WeightRecord {
  id: string;
  worker_id: string;
  worker_name: string;
  job_id: string;
  weight_type: 'half_day' | 'end_day' | 'threshed' | 'daily_wage';
  weight_kg: number;
  timestamp: string;
  notes?: string;
}
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  daily_wage: number;
  weight_based_wage: number;
  employee_id: string;
  created_at: string;
}
interface ProcurementRequest {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  supplier: string;
  cost_estimate: number;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'ordered' | 'delivered';
  requested_date: string;
  notes: string;
}
interface CurrentUser {
  staff_id: string;
  full_name: string;
  role: string;
  department?: string;
  email?: string;
}
interface HarvestFlowDashboardProps {
  currentUser: CurrentUser | null;
}

const HarvestFlowDashboard: React.FC<HarvestFlowDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [procurementRequests, setProcurementRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API Base URL
  const API_BASE = process.env.REACT_APP_API_URL || 'https://relishagrobackend-production.up.railway.app';

  // Get auth token
  const getAuthToken = () => {
  return localStorage.getItem('auth_token'); // Match AuthContext
};

  // API headers with authentication
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Navigation items configuration
  const navigationItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'onboarding', label: '👥 Onboarding' },
    { id: 'attendance', label: '📋 Attendance' },
    { id: 'procurement', label: '🛒 Procurement' },
    { id: 'jobs', label: '⚡ Jobs' },
    { id: 'wages', label: '💰 Wages' }
  ];

  // API Functions
  const fetchWorkers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/workers`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setWorkers(data.map((worker: any) => ({
          ...worker,
          attendance_status: 'present' as const // Default status
        })));
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
      // Fallback data
      setWorkers([
        { id: '1', name: 'Raman Kumar', staff_id: 'HF-001', role: 'harvesting', phone: '9876543210', department: 'harvest', attendance_status: 'present', created_at: '2024-01-01' },
        { id: '2', name: 'Suresh Babu', staff_id: 'HF-002', role: 'harvesting', phone: '9876543211', department: 'harvest', attendance_status: 'present', created_at: '2024-01-01' }
      ]);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/jobs`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setJobs([]);
    }
  };

  const createWorker = async (workerData: any) => {
    try {
      const response = await fetch(`${API_BASE}/api/workers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(workerData)
      });
      if (response.ok) {
        const newWorker = await response.json();
        setWorkers(prev => [...prev, { ...newWorker, attendance_status: 'present' }]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating worker:', err);
      return false;
    }
  };

  const createJob = async (jobData: any) => {
    try {
      const response = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(jobData)
      });
      if (response.ok) {
        const newJob = await response.json();
        setJobs(prev => [...prev, newJob]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating job:', err);
      return false;
    }
  };

  const markAttendance = async (workerId: string, status: 'present' | 'absent' | 'late') => {
    try {
      const response = await fetch(`${API_BASE}/api/attendance`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          worker_id: workerId,
          date: new Date().toISOString().split('T')[0],
          status,
          marked_by: currentUser?.staff_id || 'admin'
        })
      });
      if (response.ok) {
        setWorkers(prev => prev.map(w => 
          w.id === workerId ? { ...w, attendance_status: status } : w
        ));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error marking attendance:', err);
      return false;
    }
  };

  // Dashboard Overview Tab
  const DashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Present Today</p>
              <p className="text-2xl font-bold">{workers.filter(w => w.attendance_status === 'present').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'in_progress').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Total Workers</p>
              <p className="text-2xl font-bold">{workers.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Procurement Requests</p>
              <p className="text-2xl font-bold">{procurementRequests.length}</p>
            </div>
          </div>
        </Card>
      </div>
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Today's Operations Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Normal Work Activities</h4>
            <div className="space-y-2">
              {jobs.filter(j => j.type === 'normal').map(job => (
                <div key={job.id} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{job.title}</span>
                    <Badge className={
                      job.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{job.field_location}</p>
                </div>
              ))}
              {jobs.filter(j => j.type === 'normal').length === 0 && (
                <p className="text-gray-500 text-sm">No normal work activities today</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Harvest Activities</h4>
            <div className="space-y-2">
              {jobs.filter(j => j.type === 'harvest').map(job => (
                <div key={job.id} className="p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{job.title}</span>
                    <Badge className={
                      job.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{job.field_location}</p>
                </div>
              ))}
              {jobs.filter(j => j.type === 'harvest').length === 0 && (
                <p className="text-gray-500 text-sm">No harvest activities today</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // Employee Onboarding Tab
  const EmployeeOnboarding = () => {
    const [newEmployee, setNewEmployee] = useState({
      name: '',
      email: '',
      phone: '',
      role: 'field_worker',
      department: 'harvest',
      daily_wage: 0,
      weight_based_wage: 0
    });

    const createEmployee = async () => {
      try {
        const employeeData = {
          ...newEmployee,
          staff_id: `HF-${Date.now()}`,
          status: 'active'
        };
        const success = await createWorker(employeeData);
        if (success) {
          setNewEmployee({
            name: '', email: '', phone: '', role: 'field_worker', department: 'harvest',
            daily_wage: 0, weight_based_wage: 0
          });
          alert('Employee onboarded successfully!');
        } else {
          alert('Onboarding failed. Please try again.');
        }
      } catch (error) {
        console.error('Employee onboarding failed:', error);
        alert('Onboarding failed. Please try again.');
      }
    };

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold">👥 Employee Onboarding</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Personal Information</h4>
              <Input
                placeholder="Full Name *"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
              />
              <Input
                type="email"
                placeholder="Email Address *"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
              />
              <Input
                type="tel"
                placeholder="Phone Number *"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
              />
              <select 
                value={newEmployee.role} 
                onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg"
              >
                <option value="field_worker">Field Worker</option>
                <option value="harvesting_specialist">Harvesting Specialist</option>
                <option value="supervisor">Supervisor</option>
                <option value="quality_inspector">Quality Inspector</option>
                <option value="machine_operator">Machine Operator</option>
              </select>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Employment Details</h4>
              <select 
                value={newEmployee.department} 
                onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg"
              >
                <option value="harvest">Harvest Operations</option>
                <option value="field_maintenance">Field Maintenance</option>
                <option value="quality_control">Quality Control</option>
                <option value="logistics">Logistics</option>
              </select>
              <div>
                <label className="block text-sm font-medium mb-1">Daily Wage (₹)</label>
                <Input
                  type="number"
                  placeholder="Daily wage rate"
                  value={newEmployee.daily_wage}
                  onChange={(e) => setNewEmployee({...newEmployee, daily_wage: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight-based Wage (₹/kg)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Rate per kg"
                  value={newEmployee.weight_based_wage}
                  onChange={(e) => setNewEmployee({...newEmployee, weight_based_wage: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
          <Button 
            onClick={createEmployee}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 h-12 text-lg"
            disabled={!newEmployee.name || !newEmployee.phone}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Onboard New Employee
          </Button>
        </Card>
        {/* Current Employees */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Current Team ({workers.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map((worker: Worker) => (
              <Card key={worker.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold">{worker.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{worker.role} - {worker.department}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />
                    <span>{worker.phone}</span>
                  </div>
                  <p className="text-xs text-gray-400">ID: {worker.staff_id}</p>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // Daily Attendance Tab
  const DailyAttendance = () => {
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const handleMarkAttendance = async (workerId: string, status: 'present' | 'absent' | 'late') => {
      const success = await markAttendance(workerId, status);
      if (!success) {
        alert('Failed to mark attendance. Please try again.');
      }
    };

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" />
            <h3 className="text-xl font-bold">Daily Attendance - {attendanceDate}</h3>
          </div>
          <div className="space-y-4">
            <Input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-48"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((worker: Worker) => (
                <Card key={worker.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-8 h-8 text-gray-500" />
                      <div>
                        <p className="font-semibold">{worker.name}</p>
                        <p className="text-sm text-gray-600">{worker.staff_id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleMarkAttendance(worker.id, 'present')}
                        className={`flex-1 ${worker.attendance_status === 'present' ? 'bg-green-600' : 'bg-gray-200'}`}
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleMarkAttendance(worker.id, 'late')}
                        className={`flex-1 ${worker.attendance_status === 'late' ? 'bg-yellow-600' : 'bg-gray-200'}`}
                      >
                        Late
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleMarkAttendance(worker.id, 'absent')}
                        className={`flex-1 ${worker.attendance_status === 'absent' ? 'bg-red-600' : 'bg-gray-200'}`}
                      >
                        Absent
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Procurement Management Tab
  const ProcurementManagement = () => {
    const [newRequest, setNewRequest] = useState({
      item_name: '',
      quantity: 0,
      unit: 'kg',
      supplier: '',
      cost_estimate: 0,
      urgency: 'medium' as 'low' | 'medium' | 'high',
      notes: ''
    });

    const createProcurementRequest = async () => {
      try {
        const requestData: ProcurementRequest = {
          id: `req-${Date.now()}`,
          ...newRequest,
          status: 'pending',
          requested_date: new Date().toISOString(),
        };
        setProcurementRequests(prev => [...prev, requestData]);
        setNewRequest({
          item_name: '', quantity: 0, unit: 'kg', supplier: '', 
          cost_estimate: 0, urgency: 'medium', notes: ''
        });
        alert('Procurement request submitted successfully!');
      } catch (error) {
        console.error('Procurement request failed:', error);
        alert('Request submission failed. Please try again.');
      }
    };

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold">🛒 Procurement Management</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">New Procurement Request</h4>
              <Input
                placeholder="Item Name (e.g., Fertilizer, Seeds, Tools)"
                value={newRequest.item_name}
                onChange={(e) => setNewRequest({...newRequest, item_name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={newRequest.quantity}
                  onChange={(e) => setNewRequest({...newRequest, quantity: Number(e.target.value)})}
                />
                <select 
                  value={newRequest.unit} 
                  onChange={(e) => setNewRequest({...newRequest, unit: e.target.value})}
                  className="h-12 px-3 border border-gray-300 rounded-lg"
                >
                  <option value="kg">Kilograms</option>
                  <option value="liters">Liters</option>
                  <option value="pieces">Pieces</option>
                  <option value="bags">Bags</option>
                  <option value="boxes">Boxes</option>
                </select>
              </div>
              <Input
                placeholder="Preferred Supplier"
                value={newRequest.supplier}
                onChange={(e) => setNewRequest({...newRequest, supplier: e.target.value})}
              />
              <Input
                type="number"
                placeholder="Estimated Cost (₹)"
                value={newRequest.cost_estimate}
                onChange={(e) => setNewRequest({...newRequest, cost_estimate: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Request Details</h4>
              <div>
                <label className="block text-sm font-medium mb-2">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setNewRequest({...newRequest, urgency: 'low'})}
                    className={`h-12 ${newRequest.urgency === 'low' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    🟢 Low
                  </Button>
                  <Button
                    onClick={() => setNewRequest({...newRequest, urgency: 'medium'})}
                    className={`h-12 ${newRequest.urgency === 'medium' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    🟡 Medium
                  </Button>
                  <Button
                    onClick={() => setNewRequest({...newRequest, urgency: 'high'})}
                    className={`h-12 ${newRequest.urgency === 'high' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    🔴 High
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                <textarea
                  value={newRequest.notes}
                  onChange={(e) => setNewRequest({...newRequest, notes: e.target.value})}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Special requirements, delivery instructions, etc."
                />
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Total Estimate</p>
                <p className="text-2xl font-bold text-blue-600">₹{newRequest.cost_estimate}</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={createProcurementRequest}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 h-12 text-lg"
            disabled={!newRequest.item_name || !newRequest.quantity}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Submit Procurement Request
          </Button>
        </Card>
        {/* Procurement Requests */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Procurement Requests ({procurementRequests.length})</h3>
          <div className="space-y-4">
            {procurementRequests.map(request => (
              <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-semibold">{request.item_name}</h4>
                    <p className="text-sm text-gray-600">
                      {request.quantity} {request.unit} • {request.supplier}
                    </p>
                    <p className="text-lg font-bold text-green-600">₹{request.cost_estimate}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={`${
                      request.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.urgency.toUpperCase()}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      {request.status.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {new Date(request.requested_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {request.notes && (
                  <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                    {request.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // Job Assignment Tab
  const JobAssignment = () => {
    const [jobType, setJobType] = useState<'normal' | 'harvest'>('normal');
    const [newJob, setNewJob] = useState({
      title: '',
      field_location: '',
      assigned_workers: [] as string[],
      notes: ''
    });

    const handleCreateJob = async () => {
      try {
        const jobData = {
          ...newJob,
          type: jobType,
          status: 'pending'
        };
        const success = await createJob(jobData);
        if (success) {
          setNewJob({ title: '', field_location: '', assigned_workers: [], notes: '' });
          alert('Job created successfully!');
        } else {
          alert('Job creation failed. Please try again.');
        }
      } catch (error) {
        console.error('Job creation failed:', error);
        alert('Job creation failed. Please try again.');
      }
    };

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">⚡ Create New Job Assignment</h3>
          <div className="space-y-4">
            {/* Job Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setJobType('normal')}
                className={`h-20 ${jobType === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                <div className="text-center">
                  <ClipboardList className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-semibold">Normal Work Day</div>
                  <div className="text-xs">Weeding, Fertilizing, etc.</div>
                </div>
              </Button>
              <Button
                onClick={() => setJobType('harvest')}
                className={`h-20 ${jobType === 'harvest' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                <div className="text-center">
                  <Package className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-semibold">Harvest Day</div>
                  <div className="text-xs">Complete Harvest Workflow</div>
                </div>
              </Button>
            </div>
            <Input
              placeholder="Job Title"
              value={newJob.title}
              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
            />
            <Input
              placeholder="Field Location"
              value={newJob.field_location}
              onChange={(e) => setNewJob({...newJob, field_location: e.target.value})}
            />
            <div>
              <label className="block text-sm font-medium mb-2">Assign Workers</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {workers.filter(w => w.attendance_status === 'present').map((worker: Worker) => (
                  <Button
                    key={worker.id}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const isAssigned = newJob.assigned_workers.includes(worker.id);
                      setNewJob({
                        ...newJob,
                        assigned_workers: isAssigned 
                          ? newJob.assigned_workers.filter(id => id !== worker.id)
                          : [...newJob.assigned_workers, worker.id]
                      });
                    }}
                    className={newJob.assigned_workers.includes(worker.id) ? 'bg-purple-100' : ''}
                  >
                    {worker.name}
                  </Button>
                ))}
              </div>
            </div>
            <Button 
              onClick={handleCreateJob}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!newJob.title || !newJob.field_location || newJob.assigned_workers.length === 0}
            >
              Create {jobType === 'harvest' ? 'Harvest' : 'Normal'} Job
            </Button>
          </div>
        </Card>
        {/* Active Jobs */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Today's Active Jobs</h3>
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className={`p-4 rounded-lg border-2 ${job.type === 'harvest' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.field_location}</p>
                    <p className="text-xs text-gray-500">{job.assigned_workers.length} workers assigned</p>
                  </div>
                  <Badge className={job.type === 'harvest' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}>
                    {job.type} - {job.status}
                  </Badge>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <p className="text-gray-500 text-center py-4">No jobs created yet</p>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // Weight & Wage Recording Tab
  const WageRecording = () => {
    const [recordingMode, setRecordingMode] = useState<'daily_wage' | 'weight_based'>('daily_wage');
    const [selectedJob, setSelectedJob] = useState('');
    const [weightType, setWeightType] = useState<'half_day' | 'end_day' | 'threshed'>('half_day');
    const [selectedWorker, setSelectedWorker] = useState('');
    const [weight, setWeight] = useState('');
    const [dailyWageRate, setDailyWageRate] = useState('');
    const [notes, setNotes] = useState('');

    const harvestJobs = jobs.filter(j => j.type === 'harvest' && j.status === 'in_progress');
    const normalJobs = jobs.filter(j => j.type === 'normal' && j.status === 'in_progress');

    const recordWeight = async () => {
      try {
        const recordData: WeightRecord = {
          id: `weight-${Date.now()}`,
          worker_id: selectedWorker,
          worker_name: workers.find(w => w.id === selectedWorker)?.name || '',
          job_id: selectedJob,
          weight_type: weightType,
          weight_kg: parseFloat(weight),
          timestamp: new Date().toISOString(),
          notes
        };
        setWeightRecords(prev => [...prev, recordData]);
        setWeight('');
        setNotes('');
        alert('Weight recorded successfully!');
      } catch (error) {
        console.error('Weight recording failed:', error);
        alert('Weight recording failed. Please try again.');
      }
    };

    const recordDailyWage = async () => {
      try {
        const recordData: WeightRecord = {
          id: `wage-${Date.now()}`,
          worker_id: selectedWorker,
          worker_name: workers.find(w => w.id === selectedWorker)?.name || '',
          job_id: selectedJob,
          weight_type: 'daily_wage',
          weight_kg: parseFloat(dailyWageRate),
          timestamp: new Date().toISOString(),
          notes
        };
        setWeightRecords(prev => [...prev, recordData]);
        setDailyWageRate('');
        setNotes('');
        alert('Daily wage recorded successfully!');
      } catch (error) {
        console.error('Daily wage recording failed:', error);
        alert('Daily wage recording failed. Please try again.');
      }
    };

    return (
      <div className="space-y-6">
        {/* Wage Calculation Mode Selection */}
        <Card className="max-w-md mx-auto p-6">
          <h3 className="text-xl font-bold mb-4">💰 Wage Recording Mode</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setRecordingMode('daily_wage')}
              className={`h-20 text-left ${recordingMode === 'daily_wage' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              <div>
                <div className="font-semibold">📅 Daily Wage</div>
                <div className="text-xs opacity-75">Normal Work Days</div>
                <div className="text-xs opacity-75">Fixed Rate/Day</div>
              </div>
            </Button>
            <Button
              onClick={() => setRecordingMode('weight_based')}
              className={`h-20 text-left ${recordingMode === 'weight_based' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              <div>
                <div className="font-semibold">⚖️ Weight Based</div>
                <div className="text-xs opacity-75">Harvest Days Only</div>
                <div className="text-xs opacity-75">Payment per KG</div>
              </div>
            </Button>
          </div>
        </Card>
        {/* Recording Interface */}
        <Card className="max-w-md mx-auto p-6">
          <div className="flex items-center gap-2 mb-4">
            <Weight className="w-5 h-5" />
            <h3 className="text-xl font-bold">
              {recordingMode === 'daily_wage' ? '📅 Daily Wage Recording' : '📏 Weight Recording'}
            </h3>
          </div>
          <div className="space-y-6">
            {/* Job Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {recordingMode === 'weight_based' ? "Select Harvest Job" : "Select Normal Work Job"}
              </label>
              <select 
                value={selectedJob} 
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select Job</option>
                {(recordingMode === 'weight_based' ? harvestJobs : normalJobs).map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.field_location}
                  </option>
                ))}
              </select>
            </div>
            {/* Worker Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Worker</label>
              <select 
                value={selectedWorker} 
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select Worker</option>
                {workers.filter(w => w.attendance_status === 'present').map((worker: Worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - {worker.staff_id}
                  </option>
                ))}
              </select>
            </div>
            {/* Weight Type Selection for weight-based recording */}
            {recordingMode === 'weight_based' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium">Weight Recording Type</label>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => setWeightType('half_day')}
                    className={`h-16 text-left ${weightType === 'half_day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    <div>
                      <div className="font-semibold">Half-Day Weight</div>
                      <div className="text-xs opacity-75">Mid-day harvest recording</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setWeightType('end_day')}
                    className={`h-16 text-left ${weightType === 'end_day' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    <div>
                      <div className="font-semibold">End-Day Weight</div>
                      <div className="text-xs opacity-75">Final harvest weight</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setWeightType('threshed')}
                    className={`h-16 text-left ${weightType === 'threshed' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    <div>
                      <div className="font-semibold">Threshed Weight</div>
                      <div className="text-xs opacity-75">Post-processing weight</div>
                    </div>
                  </Button>
                </div>
              </div>
            )}
            {/* Weight or Wage Input */}
            {recordingMode === 'weight_based' ? (
              <div>
                <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight in kg"
                  className="h-12 text-lg text-center"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Daily Wage Rate (₹)</label>
                <Input
                  type="number"
                  step="1"
                  value={dailyWageRate}
                  onChange={(e) => setDailyWageRate(e.target.value)}
                  placeholder="Enter daily wage in rupees"
                  className="h-12 text-lg text-center"
                />
                <p className="text-xs text-gray-500 mt-1">Fixed rate for today's work completion</p>
              </div>
            )}
            <Input
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-12"
            />
            <Button 
              onClick={recordingMode === 'weight_based' ? recordWeight : recordDailyWage}
              className={`w-full h-16 text-lg font-semibold ${
                recordingMode === 'weight_based' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              disabled={
                !selectedJob || !selectedWorker || 
                (recordingMode === 'weight_based' ? !weight : !dailyWageRate)
              }
            >
              {recordingMode === 'weight_based' ? (
                <><Weight className="w-5 h-5 mr-2" />Record Weight</>
              ) : (
                <><Calendar className="w-5 h-5 mr-2" />Record Daily Wage</>
              )}
            </Button>
          </div>
        </Card>
        {/* Today's Wage Records */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Today's Wage Records</h3>
          <div className="space-y-3">
            {weightRecords.map(record => (
              <div key={record.id} className={`p-3 rounded-lg ${
                record.weight_type === 'daily_wage' ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{record.worker_name}</p>
                    <p className="text-sm text-gray-600">
                      {record.weight_type === 'daily_wage' ? 'Daily Wage' : record.weight_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    {record.weight_type === 'daily_wage' ? (
                      <>
                        <p className="text-xl font-bold text-blue-600">₹{record.weight_kg} kg</p>
                        <p className="text-xs text-gray-500">Weight-based Pay</p>
                      </>
                    ) : null}
                    <p className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {weightRecords.length === 0 && (
              <p className="text-gray-500 text-center py-4">No wage records for today</p>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // Simple Navigation
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'onboarding':
        return <EmployeeOnboarding />;
      case 'attendance':
        return <DailyAttendance />;
      case 'procurement':
        return <ProcurementManagement />;
      case 'jobs':
        return <JobAssignment />;
      case 'wages':
        return <WageRecording />;
      default:
        return <DashboardOverview />;
    }
  };

  // Data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchWorkers(),
          fetchJobs()
        ]);
      } catch (error) {
        console.error('Dashboard data loading failed:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading HarvestFlow dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Card className="border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error Loading Dashboard</span>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Enhanced Navigation */}
      <div className="bg-white shadow-sm border-b p-4">
        <EnhancedNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          items={navigationItems}
        />
      </div>
      {/* Content */}
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default HarvestFlowDashboard;