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
  MapPinIcon
} from 'lucide-react';
import { RFIDScanner } from '../shared/RFIDScanner';
import api from '../../lib/api';

interface Worker {
  id: string;
  name: string;
  staff_id: string;
  role: string;
  phone: string;
  attendance_status: 'present' | 'absent' | 'late';
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

interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  capacity_kg: number;
  driver_id?: string;
  status: 'available' | 'in_transit' | 'maintenance';
}

interface Driver {
  id: string;
  name: string;
  license_number: string;
  phone: string;
  vehicle_assigned?: string;
  status: 'available' | 'on_duty' | 'off_duty';
}

interface LotData {
  id: string;
  lot_number: string;
  product_type: string;
  total_weight: number;
  bag_count: number;
  quality_grade: string;
  status: 'created' | 'packed' | 'dispatched';
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

interface DispatchRecord {
  id: string;
  lot_id: string;
  vehicle_id: string;
  driver_id: string;
  destination: string;
  dispatch_time: string;
  estimated_arrival: string;
  status: 'preparing' | 'dispatched' | 'delivered';
  gps_tracking?: string;
}

export function HarvestFlowDashboard({ currentUser }: { currentUser: any }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [lots, setLots] = useState<LotData[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [procurementRequests, setProcurementRequests] = useState<ProcurementRequest[]>([]);
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // WORKING LOGOUT FUNCTION
  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Clear API authentication
    if (api && api.clearAuth) {
      api.clearAuth();
    }
    
    // Redirect to login or reload
    window.location.href = '/';
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
              <p className="text-sm text-gray-600">Lots Created</p>
              <p className="text-2xl font-bold">{lots.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Dispatches Today</p>
              <p className="text-2xl font-bold">{dispatches.filter(d => d.status === 'dispatched').length}</p>
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
                    <Badge variant={job.status === 'completed' ? 'default' : 'outline'}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{job.field_location}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Harvest Activities</h4>
            <div className="space-y-2">
              {jobs.filter(j => j.type === 'harvest').map(job => (
                <div key={job.id} className="p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{job.title}</span>
                    <Badge variant={job.status === 'completed' ? 'default' : 'outline'}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{job.field_location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // *** NEW: EMPLOYEE ONBOARDING TAB ***
  const EmployeeOnboarding = () => {
    const [newEmployee, setNewEmployee] = useState({
      name: '',
      email: '',
      phone: '',
      role: 'field_worker',
      department: 'harvest',
      daily_wage: 0,
      weight_based_wage: 0,
      address: '',
      emergency_contact: '',
      bank_account: '',
      ifsc_code: ''
    });

    const createEmployee = async () => {
      try {
        const employeeData = {
          ...newEmployee,
          employee_id: `HF-${Date.now()}`,
          created_by: currentUser.staff_id,
          status: 'active'
        };

        // Add to local state immediately
        const newEmp: Employee = {
          id: `emp-${Date.now()}`,
          ...employeeData
        };
        setEmployees(prev => [...prev, newEmp]);

        // Reset form
        setNewEmployee({
          name: '', email: '', phone: '', role: 'field_worker', department: 'harvest',
          daily_wage: 0, weight_based_wage: 0, address: '', emergency_contact: '',
          bank_account: '', ifsc_code: ''
        });

        alert('Employee onboarded successfully!');
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
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Employment Details</h4>
              
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

              <Input
                placeholder="Address"
                value={newEmployee.address}
                onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
              />

              <Input
                placeholder="Emergency Contact"
                value={newEmployee.emergency_contact}
                onChange={(e) => setNewEmployee({...newEmployee, emergency_contact: e.target.value})}
              />

              <Input
                placeholder="Bank Account Number"
                value={newEmployee.bank_account}
                onChange={(e) => setNewEmployee({...newEmployee, bank_account: e.target.value})}
              />

              <Input
                placeholder="IFSC Code"
                value={newEmployee.ifsc_code}
                onChange={(e) => setNewEmployee({...newEmployee, ifsc_code: e.target.value})}
              />
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
          <h3 className="text-xl font-bold mb-4">Current Team ({employees.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(emp => (
              <Card key={emp.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold">{emp.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{emp.role} - {emp.department}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />
                    <span>{emp.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Daily: ₹{emp.daily_wage}</span>
                    <span>Per kg: ₹{emp.weight_based_wage}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // *** NEW: PROCUREMENT TAB ***
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

  // *** NEW: LOT MANAGEMENT TAB ***
  const LotManagement = () => {
    const [newLot, setNewLot] = useState({
      product_type: 'rice',
      quality_grade: 'A',
      bag_count: 0,
      weight_per_bag: 25,
      notes: ''
    });

    const createLot = async () => {
      try {
        const completedJobs = jobs.filter(j => j.status === 'completed' && j.type === 'harvest');
        if (completedJobs.length === 0) {
          alert('No completed harvest jobs found. Please complete harvest jobs first.');
          return;
        }

        const totalWeight = newLot.bag_count * newLot.weight_per_bag;
        const lotData: LotData = {
          id: `lot-${Date.now()}`,
          lot_number: `LOT-${new Date().getFullYear()}-${String(lots.length + 1).padStart(3, '0')}`,
          product_type: newLot.product_type,
          total_weight: totalWeight,
          bag_count: newLot.bag_count,
          quality_grade: newLot.quality_grade,
          status: 'created'
        };

        setLots(prev => [...prev, lotData]);
        setNewLot({
          product_type: 'rice', quality_grade: 'A', bag_count: 0, 
          weight_per_bag: 25, notes: ''
        });

        alert(`Lot ${lotData.lot_number} created successfully!`);
      } catch (error) {
        console.error('Lot creation failed:', error);
        alert('Lot creation failed. Please try again.');
      }
    };

    const completedHarvestJobs = jobs.filter(j => j.status === 'completed' && j.type === 'harvest');
    const totalHarvestWeight = weightRecords
      .filter(w => w.weight_type === 'end_day' || w.weight_type === 'threshed')
      .reduce((sum, w) => sum + w.weight_kg, 0);

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Archive className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold">📦 Lot Management</h3>
          </div>

          {/* Harvest Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-green-50">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed Jobs</p>
                  <p className="text-2xl font-bold text-green-600">{completedHarvestJobs.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-blue-50">
              <div className="flex items-center gap-3">
                <Weight className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Weight</p>
                  <p className="text-2xl font-bold text-blue-600">{totalHarvestWeight} kg</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-purple-50">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Lots Created</p>
                  <p className="text-2xl font-bold text-purple-600">{lots.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Create New Lot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Create Production Lot</h4>
              
              <select 
                value={newLot.product_type} 
                onChange={(e) => setNewLot({...newLot, product_type: e.target.value})}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg"
              >
                <option value="rice">Rice</option>
                <option value="wheat">Wheat</option>
                <option value="barley">Barley</option>
                <option value="mixed_grain">Mixed Grain</option>
              </select>

              <select 
                value={newLot.quality_grade} 
                onChange={(e) => setNewLot({...newLot, quality_grade: e.target.value})}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg"
              >
                <option value="A">Grade A - Premium</option>
                <option value="B">Grade B - Standard</option>
                <option value="C">Grade C - Regular</option>
              </select>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Bag Count</label>
                  <Input
                    type="number"
                    placeholder="Number of bags"
                    value={newLot.bag_count}
                    onChange={(e) => setNewLot({...newLot, bag_count: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Weight/Bag (kg)</label>
                  <Input
                    type="number"
                    placeholder="Weight per bag"
                    value={newLot.weight_per_bag}
                    onChange={(e) => setNewLot({...newLot, weight_per_bag: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-800">Total Lot Weight</p>
                <p className="text-2xl font-bold text-purple-600">
                  {newLot.bag_count * newLot.weight_per_bag} kg
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Harvest Job Closure Summary</h4>
              
              {completedHarvestJobs.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {completedHarvestJobs.map(job => {
                    const jobWeights = weightRecords.filter(w => w.job_id === job.id);
                    const halfDayWeight = jobWeights.find(w => w.weight_type === 'half_day')?.weight_kg || 0;
                    const endDayWeight = jobWeights.find(w => w.weight_type === 'end_day')?.weight_kg || 0;
                    const threshedWeight = jobWeights.find(w => w.weight_type === 'threshed')?.weight_kg || 0;

                    return (
                      <div key={job.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h5 className="font-semibold text-green-800">{job.title}</h5>
                        <p className="text-sm text-green-600">{job.field_location}</p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                          <div>Half-day: <span className="font-bold">{halfDayWeight}kg</span></div>
                          <div>End-day: <span className="font-bold">{endDayWeight}kg</span></div>
                          <div>Threshed: <span className="font-bold">{threshedWeight}kg</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-yellow-800 font-medium">No completed harvest jobs found</p>
                  <p className="text-sm text-yellow-600">Complete harvest jobs with weight recordings first</p>
                </div>
              )}

              <textarea
                value={newLot.notes}
                onChange={(e) => setNewLot({...newLot, notes: e.target.value})}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Lot creation notes..."
              />
            </div>
          </div>

          <Button 
            onClick={createLot}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 h-12 text-lg"
            disabled={!newLot.bag_count || completedHarvestJobs.length === 0}
          >
            <Archive className="w-5 h-5 mr-2" />
            Create Production Lot
          </Button>
        </Card>

        {/* Existing Lots */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Production Lots ({lots.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lots.map(lot => (
              <Card key={lot.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{lot.lot_number}</h4>
                      <p className="text-sm text-gray-600 capitalize">{lot.product_type}</p>
                    </div>
                    <Badge className={`${
                      lot.status === 'dispatched' ? 'bg-green-100 text-green-800' :
                      lot.status === 'packed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lot.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Weight:</span>
                      <span className="font-semibold">{lot.total_weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bags:</span>
                      <span className="font-semibold">{lot.bag_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Grade:</span>
                      <span className={`font-semibold ${
                        lot.quality_grade === 'A' ? 'text-green-600' :
                        lot.quality_grade === 'B' ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        Grade {lot.quality_grade}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Pack
                    </Button>
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      Dispatch
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // *** NEW: DISPATCH TAB ***
  const DispatchManagement = () => {
    const [newDispatch, setNewDispatch] = useState({
      lot_id: '',
      vehicle_id: '',
      driver_id: '',
      destination: '',
      estimated_arrival: '',
      notes: ''
    });

    const createDispatch = async () => {
      try {
        const dispatchData: DispatchRecord = {
          id: `dispatch-${Date.now()}`,
          ...newDispatch,
          dispatch_time: new Date().toISOString(),
          status: 'preparing'
        };

        setDispatches(prev => [...prev, dispatchData]);
        
        // Update lot status
        setLots(prev => prev.map(lot => 
          lot.id === newDispatch.lot_id 
            ? { ...lot, status: 'dispatched' as const }
            : lot
        ));

        setNewDispatch({
          lot_id: '', vehicle_id: '', driver_id: '', destination: '', 
          estimated_arrival: '', notes: ''
        });

        alert('Dispatch created successfully!');
      } catch (error) {
        console.error('Dispatch creation failed:', error);
        alert('Dispatch creation failed. Please try again.');
      }
    };

    // Mock vehicles and drivers if not loaded
    const mockVehicles = [
      { id: 'v1', vehicle_number: 'TN-01-AB-1234', vehicle_type: 'Truck', capacity_kg: 5000, status: 'available' as const },
      { id: 'v2', vehicle_number: 'TN-01-CD-5678', vehicle_type: 'Mini Truck', capacity_kg: 2000, status: 'available' as const }
    ];

    const mockDrivers = [
      { id: 'd1', name: 'Raman Singh', license_number: 'TN1234567890', phone: '9876543210', status: 'available' as const },
      { id: 'd2', name: 'Suresh Kumar', license_number: 'TN0987654321', phone: '9876543211', status: 'available' as const }
    ];

    const availableVehicles = vehicles.length > 0 ? vehicles : mockVehicles;
    const availableDrivers = drivers.length > 0 ? drivers : mockDrivers;
    const readyLots = lots.filter(l => l.status === 'packed' || l.status === 'created');

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-bold">🚚 Dispatch Management</h3>
          </div>

          {/* Fleet Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-green-50">
              <div className="flex items-center gap-3">
                <Truck className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Available Vehicles</p>
                  <p className="text-2xl font-bold text-green-600">
                    {availableVehicles.filter(v => v.status === 'available').length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-blue-50">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Available Drivers</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {availableDrivers.filter(d => d.status === 'available').length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-orange-50">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Ready for Dispatch</p>
                  <p className="text-2xl font-bold text-orange-600">{readyLots.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Create Dispatch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Create New Dispatch</h4>
              
              <div>
                <label className="block text-sm font-medium mb-2">Select Lot</label>
                <select 
                  value={newDispatch.lot_id} 
                  onChange={(e) => setNewDispatch({...newDispatch, lot_id: e.target.value})}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Select lot to dispatch</option>
                  {readyLots.map(lot => (
                    <option key={lot.id} value={lot.id}>
                      {lot.lot_number} - {lot.total_weight}kg ({lot.product_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Vehicle</label>
                <select 
                  value={newDispatch.vehicle_id} 
                  onChange={(e) => setNewDispatch({...newDispatch, vehicle_id: e.target.value})}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Select vehicle</option>
                  {availableVehicles.filter(v => v.status === 'available').map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_number} - {vehicle.vehicle_type} ({vehicle.capacity_kg}kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Driver</label>
                <select 
                  value={newDispatch.driver_id} 
                  onChange={(e) => setNewDispatch({...newDispatch, driver_id: e.target.value})}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Select driver</option>
                  {availableDrivers.filter(d => d.status === 'available').map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.phone}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Delivery Details</h4>
              
              <div>
                <label className="block text-sm font-medium mb-2">Destination</label>
                <Input
                  placeholder="Delivery address"
                  value={newDispatch.destination}
                  onChange={(e) => setNewDispatch({...newDispatch, destination: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estimated Arrival</label>
                <Input
                  type="datetime-local"
                  value={newDispatch.estimated_arrival}
                  onChange={(e) => setNewDispatch({...newDispatch, estimated_arrival: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dispatch Notes</label>
                <textarea
                  value={newDispatch.notes}
                  onChange={(e) => setNewDispatch({...newDispatch, notes: e.target.value})}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Special instructions, route details, contact information..."
                />
              </div>

              {newDispatch.lot_id && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-orange-800">Selected Lot</p>
                  {(() => {
                    const selectedLot = readyLots.find(l => l.id === newDispatch.lot_id);
                    return selectedLot ? (
                      <div>
                        <p className="font-bold text-orange-600">{selectedLot.lot_number}</p>
                        <p className="text-sm text-orange-600">
                          {selectedLot.total_weight}kg • {selectedLot.bag_count} bags • Grade {selectedLot.quality_grade}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={createDispatch}
            className="w-full mt-6 bg-orange-600 hover:bg-orange-700 h-12 text-lg"
            disabled={!newDispatch.lot_id || !newDispatch.vehicle_id || !newDispatch.driver_id || !newDispatch.destination}
          >
            <Send className="w-5 h-5 mr-2" />
            Create Dispatch
          </Button>
        </Card>

        {/* Active Dispatches */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Active Dispatches ({dispatches.length})</h3>
          <div className="space-y-4">
            {dispatches.map(dispatch => {
              const lot = readyLots.find(l => l.id === dispatch.lot_id);
              const vehicle = availableVehicles.find(v => v.id === dispatch.vehicle_id);
              const driver = availableDrivers.find(d => d.id === dispatch.driver_id);

              return (
                <div key={dispatch.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold">{lot?.lot_number}</h4>
                      <p className="text-sm text-gray-600">{lot?.total_weight}kg • {lot?.product_type}</p>
                      <Badge className={`mt-1 ${
                        dispatch.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        dispatch.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {dispatch.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{vehicle?.vehicle_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{driver?.name}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPinIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{dispatch.destination}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        ETA: {new Date(dispatch.estimated_arrival).toLocaleString()}
                      </p>
                      <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                        Track
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  // Daily Attendance Tab (unchanged)
  const DailyAttendance = () => {
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

    const markAttendance = async (workerId: string, status: 'present' | 'absent' | 'late') => {
      try {
        // Using your existing API structure
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worker_id: workerId,
            date: attendanceDate,
            status,
            marked_by: currentUser.staff_id
          })
        });
        
        if (response.ok) {
          setWorkers(prev => prev.map(w => 
            w.id === workerId ? { ...w, attendance_status: status } : w
          ));
        }
      } catch (error) {
        console.error('Attendance marking failed:', error);
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
              {workers.map(worker => (
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
                        onClick={() => markAttendance(worker.id, 'present')}
                        className={`flex-1 ${worker.attendance_status === 'present' ? 'bg-green-600' : 'bg-gray-200'}`}
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => markAttendance(worker.id, 'late')}
                        className={`flex-1 ${worker.attendance_status === 'late' ? 'bg-yellow-600' : 'bg-gray-200'}`}
                      >
                        Late
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => markAttendance(worker.id, 'absent')}
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

  // Job Assignment Tab (unchanged) 
  const JobAssignment = () => {
    const [jobType, setJobType] = useState<'normal' | 'harvest'>('normal');
    const [newJob, setNewJob] = useState({
      title: '',
      field_location: '',
      assigned_workers: [] as string[],
      notes: ''
    });

    const createJob = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newJob,
            type: jobType,
            created_by: currentUser.staff_id,
            status: 'pending'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setJobs(prev => [...prev, data]);
          setNewJob({ title: '', field_location: '', assigned_workers: [], notes: '' });
        }
      } catch (error) {
        console.error('Job creation failed:', error);
      }
    };

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">⚡ Create New Job Assignment</h3>
          
          <div className="space-y-4">
            {/* Job Type Selection - CRITICAL WORKFLOW SEPARATOR */}
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
                {workers.filter(w => w.attendance_status === 'present').map(worker => (
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
              onClick={createJob}
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
          </div>
        </Card>
      </div>
    );
  };

  // Weight & Wage Recording Tab (unchanged)
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
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/weight-records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worker_id: selectedWorker,
            job_id: selectedJob,
            weight_type: weightType,
            weight_kg: parseFloat(weight),
            wage_calculation_type: 'weight_based',
            notes,
            recorded_by: currentUser.staff_id
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setWeightRecords(prev => [...prev, data]);
          setWeight('');
          setNotes('');
        }
      } catch (error) {
        console.error('Weight recording failed:', error);
      }
    };

    const recordDailyWage = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/daily-wage-records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worker_id: selectedWorker,
            job_id: selectedJob,
            daily_rate: parseFloat(dailyWageRate),
            wage_calculation_type: 'daily_basis',
            work_date: new Date().toISOString().split('T')[0],
            notes,
            recorded_by: currentUser.staff_id
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setWeightRecords(prev => [...prev, {
            ...data,
            weight_type: 'daily_wage',
            weight_kg: parseFloat(dailyWageRate)
          }]);
          setDailyWageRate('');
          setNotes('');
        }
      } catch (error) {
        console.error('Daily wage recording failed:', error);
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
            {/* Recording Type Selection Based on Mode */}
            {recordingMode === 'weight_based' ? (
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
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">Daily Wage Mode</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Recording fixed daily wages for normal work activities (weeding, fertilizing, etc.)
                </p>
              </div>
            )}

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
                {workers.filter(w => w.attendance_status === 'present').map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - {worker.staff_id}
                  </option>
                ))}
              </select>
            </div>

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
                        <p className="text-xl font-bold text-blue-600">₹{record.weight_kg}</p>
                        <p className="text-xs text-gray-500">Fixed Daily Rate</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xl font-bold text-green-600">{record.weight_kg} kg</p>
                        <p className="text-xs text-gray-500">Weight-based Pay</p>
                      </>
                    )}
                    <p className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}
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
      case 'lot-management':
        return <LotManagement />;
      case 'dispatch':
        return <DispatchManagement />;
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
        // Using fetch instead of api client to avoid errors
        const workersResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/workers`);
        const jobsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`);
        
        if (workersResponse.ok) {
          const workersData = await workersResponse.json();
          setWorkers(workersData || []);
        }
        
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData || []);
        }

        // Add mock data for testing
        setWorkers([
          { id: '1', name: 'Raman Kumar', staff_id: 'HF-001', role: 'harvesting', phone: '9876543210', attendance_status: 'present' },
          { id: '2', name: 'Suresh Babu', staff_id: 'HF-002', role: 'harvesting', phone: '9876543211', attendance_status: 'present' },
          { id: '3', name: 'Ganesh Singh', staff_id: 'HF-003', role: 'harvesting', phone: '9876543212', attendance_status: 'absent' }
        ]);
        
      } catch (error) {
        console.error('Dashboard data loading failed:', error);
        // Set mock data on error
        setWorkers([
          { id: '1', name: 'Raman Kumar', staff_id: 'HF-001', role: 'harvesting', phone: '9876543210', attendance_status: 'present' },
          { id: '2', name: 'Suresh Babu', staff_id: 'HF-002', role: 'harvesting', phone: '9876543211', attendance_status: 'present' },
          { id: '3', name: 'Ganesh Singh', staff_id: 'HF-003', role: 'harvesting', phone: '9876543212', attendance_status: 'absent' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">HarvestFlow Manager</h1>
            <p className="text-green-100">Estate Operations & Harvest Management</p>
          </div>
          <Button 
            variant="outline" 
            className="bg-white text-green-700 hover:bg-green-50"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* *** FIXED: COMPLETE TAB NAVIGATION WITH ALL MISSING ITEMS *** */}
      <div className="bg-white border-b overflow-x-auto">
        <div className="flex">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'dashboard' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'onboarding' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            👥 Onboarding
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'attendance' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            📋 Attendance
          </button>
          <button
            onClick={() => setActiveTab('procurement')}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'procurement' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            🛒 Procurement
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'jobs' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            ⚡ Jobs
          </button>
          <button
            onClick={() => setActiveTab('lot-management')}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'lot-management' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            📦 Lot Management
          </button>
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'dispatch' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            🚚 Dispatch
          </button>
          <button
            onClick={() => setActiveTab('wages')}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'wages' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            💰 Wages
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
}