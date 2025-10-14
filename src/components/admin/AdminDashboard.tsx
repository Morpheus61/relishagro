import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Calendar, 
  MapPin, 
  UserCheck,
  Briefcase,
  Package,
  UserPlus,
  LogOut,
  Menu,
  X,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import api from '../../lib/api';

// Types and Interfaces
interface Worker {
  id: string;
  staff_id: string;
  name: string;
  role: string;
  department: string;
  hire_date: string;
  status: 'active' | 'inactive' | 'on_leave';
  phone?: string;
  email?: string;
}

interface JobType {
  id: string;
  name: string;
  description: string;
  rate: number;
  unit: string;
  active: boolean;
  created_at: string;
}

interface Provision {
  id: string;
  name: string;
  category: string;
  unit: string;
  cost: number;
  stock_level: number;
  reorder_level: number;
  active: boolean;
}

interface OnboardingRequest {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  department: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
}

interface AttendanceRecord {
  id: string;
  staff_id: string;
  name: string;
  check_in: string;
  check_out?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'early_departure';
  hours_worked?: number;
}

interface DashboardStats {
  total_workers: number;
  active_workers: number;
  total_job_types: number;
  pending_onboarding: number;
  today_attendance: number;
  total_provisions: number;
  low_stock_items: number;
}

const AdminDashboard: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data States with proper initialization
  const [stats, setStats] = useState<DashboardStats>({
    total_workers: 0,
    active_workers: 0,
    total_job_types: 0,
    pending_onboarding: 0,
    today_attendance: 0,
    total_provisions: 0,
    low_stock_items: 0
  });
  
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [onboardingRequests, setOnboardingRequests] = useState<OnboardingRequest[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  // Modal States
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showAddJobType, setShowAddJobType] = useState(false);
  const [showAddProvision, setShowAddProvision] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Load Data Functions with Null Safety
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load available data using existing API methods
      const workersRes = await api.getWorkers().catch(err => ({ error: err }));
      const jobTypesRes = await api.getJobTypes().catch(err => ({ error: err }));
      const onboardingRes = await api.getPendingOnboarding().catch(err => ({ error: err }));
      
      // For provisions and attendance, we'll use empty arrays for now since methods don't exist
      const provisionsRes = { data: [] };
      const attendanceRes = { data: [] };

      // Handle workers data with null safety
      if (workersRes && !workersRes.error && workersRes.data) {
        const workersData = Array.isArray(workersRes.data) ? workersRes.data : [];
        setWorkers(workersData);
      } else {
        setWorkers([]);
        console.warn('Failed to load workers:', workersRes.error || 'No data');
      }

      // Handle job types data with null safety
      if (jobTypesRes && !jobTypesRes.error && jobTypesRes.data) {
        const jobTypesData = Array.isArray(jobTypesRes.data) ? jobTypesRes.data : [];
        setJobTypes(jobTypesData);
      } else {
        setJobTypes([]);
        console.warn('Failed to load job types:', jobTypesRes.error || 'No data');
      }

      // Handle provisions data (empty for now)
      setProvisions([]);

      // Handle onboarding data with null safety
      if (onboardingRes && !onboardingRes.error && onboardingRes.data) {
        const onboardingData = Array.isArray(onboardingRes.data) ? onboardingRes.data : [];
        setOnboardingRequests(onboardingData);
      } else {
        setOnboardingRequests([]);
        console.warn('Failed to load onboarding:', onboardingRes.error || 'No data');
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      // Set empty arrays as fallbacks
      setWorkers([]);
      setJobTypes([]);
      setProvisions([]);
      setOnboardingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    // For now, set empty attendance data since the API method doesn't exist yet
    setAttendanceRecords([]);
    console.log('Attendance data loading not implemented yet - using empty array');
  };

  // Calculate Stats with Null Safety
  useEffect(() => {
    const calculateStats = () => {
      const safeWorkers = Array.isArray(workers) ? workers : [];
      const safeJobTypes = Array.isArray(jobTypes) ? jobTypes : [];
      const safeProvisions = Array.isArray(provisions) ? provisions : [];
      const safeOnboarding = Array.isArray(onboardingRequests) ? onboardingRequests : [];
      const safeAttendance = Array.isArray(attendanceRecords) ? attendanceRecords : [];

      setStats({
        total_workers: safeWorkers.length,
        active_workers: safeWorkers.filter(w => w.status === 'active').length,
        total_job_types: safeJobTypes.filter(j => j.active).length,
        pending_onboarding: safeOnboarding.filter(r => r.status === 'pending').length,
        today_attendance: safeAttendance.filter(a => a.status === 'present').length,
        total_provisions: safeProvisions.filter(p => p.active).length,
        low_stock_items: safeProvisions.filter(p => p.active && p.stock_level <= p.reorder_level).length
      });
    };

    calculateStats();
  }, [workers, jobTypes, provisions, onboardingRequests, attendanceRecords]);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
    loadAttendanceData();
  }, []);

  // Filtered Data with Null Safety
  const getFilteredWorkers = () => {
    const safeWorkers = Array.isArray(workers) ? workers : [];
    return safeWorkers.filter(worker => {
      const matchesSearch = searchTerm === '' || 
        worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.staff_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || worker.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || worker.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  };

  const getFilteredJobTypes = () => {
    const safeJobTypes = Array.isArray(jobTypes) ? jobTypes : [];
    return safeJobTypes.filter(jobType => {
      const matchesSearch = searchTerm === '' || 
        jobType.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jobType.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && jobType.active) ||
        (statusFilter === 'inactive' && !jobType.active);
      
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredProvisions = () => {
    const safeProvisions = Array.isArray(provisions) ? provisions : [];
    return safeProvisions.filter(provision => {
      const matchesSearch = searchTerm === '' || 
        provision.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provision.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && provision.active) ||
        (statusFilter === 'inactive' && !provision.active) ||
        (statusFilter === 'low_stock' && provision.stock_level <= provision.reorder_level);
      
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredOnboarding = () => {
    const safeOnboarding = Array.isArray(onboardingRequests) ? onboardingRequests : [];
    return safeOnboarding.filter(request => {
      const matchesSearch = searchTerm === '' || 
        request.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.role?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  };

  // Navigation Menu Items
  const menuItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'workers', icon: Users, label: 'Workers' },
    { id: 'job-types', icon: Briefcase, label: 'Job Types' },
    { id: 'provisions', icon: Package, label: 'Provisions' },
    { id: 'onboarding', icon: UserPlus, label: 'Onboarding' },
    { id: 'attendance', icon: UserCheck, label: 'Attendance' },
    { id: 'gps-tracking', icon: MapPin, label: 'GPS Tracking' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  // Stats Cards Component
  const StatsCard = ({ title, value, icon: Icon, trend, color = 'blue' }: {
    title: string;
    value: number;
    icon: any;
    trend?: { value: number; direction: 'up' | 'down' };
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800'
    };

    return (
      <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all hover:shadow-md`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
            {trend && (
              <div className="flex items-center mt-2 text-sm">
                {trend.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1 text-red-600" />
                )}
                <span className={trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
          <Icon className="w-12 h-12 opacity-60" />
        </div>
      </div>
    );
  };

  // Overview Tab Content
  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Workers"
          value={stats.total_workers}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Workers"
          value={stats.active_workers}
          icon={UserCheck}
          color="green"
        />
        <StatsCard
          title="Job Types"
          value={stats.total_job_types}
          icon={Briefcase}
          color="purple"
        />
        <StatsCard
          title="Pending Onboarding"
          value={stats.pending_onboarding}
          icon={UserPlus}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Today's Attendance"
          value={stats.today_attendance}
          icon={Calendar}
          color="green"
        />
        <StatsCard
          title="Total Provisions"
          value={stats.total_provisions}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.low_stock_items}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {Array.isArray(onboardingRequests) && onboardingRequests.slice(0, 5).map((request, index) => (
            <div key={request.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">{request.full_name}</p>
                <p className="text-xs text-gray-500">Applied for {request.role} position</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {request.status}
              </span>
            </div>
          ))}
          {(!Array.isArray(onboardingRequests) || onboardingRequests.length === 0) && (
            <p className="text-gray-500 text-center">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );

  // Workers Tab Content
  const WorkersContent = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
          </select>
          
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            <option value="admin">Admin</option>
            <option value="harvestflow">HarvestFlow</option>
            <option value="flavorcore">FlavorCore</option>
            <option value="supervisor">Supervisor</option>
          </select>

          <button
            onClick={() => setShowAddWorker(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Worker
          </button>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hire Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredWorkers().map((worker, index) => (
                <tr key={worker.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                      <div className="text-sm text-gray-500">{worker.staff_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{worker.role}</div>
                    <div className="text-sm text-gray-500">{worker.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(worker.hire_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      worker.status === 'active' ? 'bg-green-100 text-green-800' :
                      worker.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {worker.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {getFilteredWorkers().length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No workers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Job Types Tab Content
  const JobTypesContent = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search job types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => setShowAddJobType(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Job Type
          </button>
        </div>
      </div>

      {/* Job Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredJobTypes().map((jobType, index) => (
          <div key={jobType.id || index} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{jobType.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{jobType.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                jobType.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {jobType.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">${jobType.rate}</p>
                <p className="text-sm text-gray-500">per {jobType.unit}</p>
              </div>
              
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-green-600 hover:text-green-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {getFilteredJobTypes().length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">
            No job types found
          </div>
        )}
      </div>
    </div>
  );

  // Provisions Tab Content
  const ProvisionsContent = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search provisions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="low_stock">Low Stock</option>
          </select>

          <button
            onClick={() => setShowAddProvision(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Provision
          </button>
        </div>
      </div>

      {/* Provisions Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost per Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredProvisions().map((provision, index) => (
                <tr key={provision.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{provision.name}</div>
                      <div className="text-sm text-gray-500">Unit: {provision.unit}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {provision.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${provision.cost}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900 mr-2">{provision.stock_level}</div>
                      {provision.stock_level <= provision.reorder_level && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Reorder at: {provision.reorder_level}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      provision.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {provision.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {getFilteredProvisions().length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No provisions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Onboarding Tab Content
  const OnboardingContent = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Onboarding Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {getFilteredOnboarding().map((request, index) => (
          <div key={request.id || index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{request.full_name}</h3>
                <p className="text-sm text-gray-600">{request.phone}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {request.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm"><strong>Role:</strong> {request.role}</p>
              <p className="text-sm"><strong>Department:</strong> {request.department}</p>
              <p className="text-sm"><strong>Submitted:</strong> {new Date(request.submitted_at).toLocaleDateString()}</p>
              {request.notes && (
                <p className="text-sm"><strong>Notes:</strong> {request.notes}</p>
              )}
            </div>
            
            {request.status === 'pending' && (
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}
            
            {request.status !== 'pending' && request.reviewed_by && (
              <div className="text-xs text-gray-500 mt-4">
                Reviewed by {request.reviewed_by} on {request.reviewed_at ? new Date(request.reviewed_at).toLocaleDateString() : 'Unknown'}
              </div>
            )}
          </div>
        ))}
        {getFilteredOnboarding().length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">
            No onboarding requests found
          </div>
        )}
      </div>
    </div>
  );

  // Attendance Tab Content
  const AttendanceContent = () => (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="flex gap-4 items-center">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours Worked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(attendanceRecords) && attendanceRecords.map((record, index) => (
                <tr key={record.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{record.name}</div>
                      <div className="text-sm text-gray-500">{record.staff_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.check_in ? new Date(record.check_in).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.check_out ? new Date(record.check_out).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.hours_worked ? `${record.hours_worked}h` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // GPS Tracking Content
  const GPSTrackingContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">GPS Tracking</h3>
        <p className="text-gray-600">GPS tracking functionality will be implemented here.</p>
      </div>
    </div>
  );

  // Settings Content
  const SettingsContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Settings</h3>
        <p className="text-gray-600">Settings panel will be implemented here.</p>
      </div>
    </div>
  );

  // Render Tab Content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewContent />;
      case 'workers':
        return <WorkersContent />;
      case 'job-types':
        return <JobTypesContent />;
      case 'provisions':
        return <ProvisionsContent />;
      case 'onboarding':
        return <OnboardingContent />;
      case 'attendance':
        return <AttendanceContent />;
      case 'gps-tracking':
        return <GPSTrackingContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <OverviewContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SINGLE HEADER - FIXED DESIGN ISSUE #1 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and menu toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <div className="flex items-center gap-3">
                <img 
                  src="/flavorcore-logo.png" 
                  alt="FlavorCore" 
                  className="h-8 w-8 object-contain"
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500 hidden sm:block">FlavorCore Management System</p>
                </div>
              </div>
            </div>

            {/* Right side - User menu and logout */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* SINGLE SIDEBAR NAVIGATION - FIXED DESIGN ISSUE #2 */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0 lg:z-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full pt-20 lg:pt-4">
            {/* Navigation Menu */}
            <nav className="flex-1 px-4 pb-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                    className={`
                      w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="mr-3 w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading dashboard data...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    loadDashboardData();
                  }}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Tab Content */}
            {!loading && !error && renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;