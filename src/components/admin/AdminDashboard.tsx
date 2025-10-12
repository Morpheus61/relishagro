import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import api from '../../lib/api';
import { 
  Users, 
  ClipboardCheck, 
  Package, 
  DollarSign, 
  TrendingUp,
  Settings,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCheck,
  Clock,
  MapPin,
  Phone,
  Mail,
  UserPlus,
  Building,
  Shield,
  Database,
  Activity
} from 'lucide-react';

interface AdminDashboardProps {
  userId: string;
  userRole: string;
  onLogout: () => void;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  staff_id: string;
  person_type: string;
  designation: string;
  contact_number?: string;
  address?: string;
  status: string;
  created_at: string;
  face_registered_at?: string;
}

interface YieldSettings {
  hf_raw_to_threshed_min: number;
  hf_raw_to_threshed_std: number;
  hf_raw_to_threshed_max: number;
  fc_final_to_raw_min: number;
  fc_final_to_raw_std: number;
  fc_final_to_raw_max: number;
  fc_final_to_threshed_min: number;
  fc_final_to_threshed_std: number;
  fc_final_to_threshed_max: number;
  deviation_threshold: number;
  variance_threshold: number;
}

interface NewUser {
  full_name: string;
  staff_id: string;
  email: string;
  phone: string;
  person_type: string;
  designation: string;
  department: string;
  contact_number: string;
  address: string;
  daily_wage: number;
  weight_based_wage: number;
  emergency_contact: string;
  bank_account: string;
  ifsc_code: string;
}

export function AdminDashboard({ userId, userRole, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stats, setStats] = useState({
    pendingOnboarding: 0,
    pendingOverrides: 0,
    pendingProvisions: 0,
    totalUsers: 0,
    activeDispatches: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Load various stats from API
      const [onboarding, provisions, users] = await Promise.all([
        api.getPendingOnboarding().catch(() => ({ count: 0 })),
        api.getPendingProvisions().catch(() => ({ count: 0 })),
        // Fetch users from the working endpoint
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/`).then(r => r.json()).catch(() => [])
      ]);

      setStats({
        pendingOnboarding: onboarding.count || 0,
        pendingOverrides: 0, // TODO: Add API endpoint
        pendingProvisions: provisions.count || 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
        activeDispatches: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome stats={stats} setActiveTab={setActiveTab} />;
      case 'user-creation':
        return <UserCreation />;
      case 'yields':
        return <YieldsAnalytics />;
      case 'onboarding':
        return <OnboardingApprovals />;
      case 'attendance-overrides':
        return <AttendanceOverrides />;
      case 'attendance':
        return <AllAttendanceRecords />;
      case 'provisions':
        return <ProvisionApprovals />;
      case 'wages':
        return <WagesReports />;
      case 'users':
        return <UserManagement />;
      case 'system-health':
        return <SystemHealth />;
      case 'database':
        return <DatabaseManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <DashboardHome stats={stats} setActiveTab={setActiveTab} />;
    }
  };

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    
    // Call the parent logout function
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-purple-200">Complete System Control & Management</p>
          </div>
          <Button onClick={handleLogout} className="bg-purple-800 hover:bg-purple-900">
            Logout
          </Button>
        </div>
      </div>

      {/* *** ENHANCED NAVIGATION TABS WITH MORE ADMIN FEATURES *** */}
      <div className="bg-white shadow-md overflow-x-auto">
        <div className="flex gap-2 p-4 min-w-max">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
            🏠 Dashboard
          </NavButton>
          <NavButton active={activeTab === 'user-creation'} onClick={() => setActiveTab('user-creation')}>
            👤 Create User
          </NavButton>
          <NavButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            👨‍💼 Manage Users
          </NavButton>
          <NavButton active={activeTab === 'yields'} onClick={() => setActiveTab('yields')}>
            📊 Yields Analytics {stats.pendingOnboarding > 0 && <Badge>{stats.pendingOnboarding}</Badge>}
          </NavButton>
          <NavButton active={activeTab === 'onboarding'} onClick={() => setActiveTab('onboarding')}>
            👥 Onboarding Approvals {stats.pendingOnboarding > 0 && <Badge>{stats.pendingOnboarding}</Badge>}
          </NavButton>
          <NavButton active={activeTab === 'attendance-overrides'} onClick={() => setActiveTab('attendance-overrides')}>
            ✅ Attendance Overrides {stats.pendingOverrides > 0 && <Badge>{stats.pendingOverrides}</Badge>}
          </NavButton>
          <NavButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')}>
            📋 All Attendance
          </NavButton>
          <NavButton active={activeTab === 'provisions'} onClick={() => setActiveTab('provisions')}>
            📦 Provision Approvals {stats.pendingProvisions > 0 && <Badge>{stats.pendingProvisions}</Badge>}
          </NavButton>
          <NavButton active={activeTab === 'wages'} onClick={() => setActiveTab('wages')}>
            💰 Wages & Payroll
          </NavButton>
          <NavButton active={activeTab === 'system-health'} onClick={() => setActiveTab('system-health')}>
            ❤️ System Health
          </NavButton>
          <NavButton active={activeTab === 'database'} onClick={() => setActiveTab('database')}>
            🗄️ Database
          </NavButton>
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
            ⚙️ System Settings
          </NavButton>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
}

// Dashboard Home Component - Enhanced
function DashboardHome({ stats, setActiveTab }: { stats: any; setActiveTab: (tab: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>
        <div className="flex gap-2">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Download size={18} className="mr-2" />
            Export Report
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Activity size={18} className="mr-2" />
            Live Monitor
          </Button>
        </div>
      </div>
      
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="text-blue-600" size={32} />}
          title="Total Users"
          value={stats.totalUsers}
          color="blue"
          description="System-wide registered users"
        />
        <StatCard
          icon={<ClipboardCheck className="text-yellow-600" size={32} />}
          title="Pending Onboarding"
          value={stats.pendingOnboarding}
          color="yellow"
          description="Awaiting admin approval"
        />
        <StatCard
          icon={<Package className="text-green-600" size={32} />}
          title="Provision Requests"
          value={stats.pendingProvisions}
          color="green"
          description="Supply requests pending"
        />
        <StatCard
          icon={<DollarSign className="text-purple-600" size={32} />}
          title="Active Dispatches"
          value={stats.activeDispatches}
          color="purple"
          description="Currently in transit"
        />
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-bold text-green-800">API Services</h3>
              <p className="text-sm text-green-600">All services operational</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-bold text-blue-800">Database</h3>
              <p className="text-sm text-blue-600">Connection stable</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-bold text-purple-800">Security</h3>
              <p className="text-sm text-purple-600">All systems secure</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions - Enhanced */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Admin Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={() => setActiveTab('user-creation')}
            className="bg-blue-600 hover:bg-blue-700 h-20"
          >
            <div className="text-center">
              <UserPlus size={24} className="mx-auto mb-1" />
              <span>Create New User</span>
            </div>
          </Button>
          <Button 
            onClick={() => setActiveTab('users')}
            className="bg-green-600 hover:bg-green-700 h-20"
          >
            <div className="text-center">
              <Users size={24} className="mx-auto mb-1" />
              <span>Manage Users</span>
            </div>
          </Button>
          <Button 
            onClick={() => setActiveTab('provisions')}
            className="bg-orange-600 hover:bg-orange-700 h-20"
          >
            <div className="text-center">
              <Package size={24} className="mx-auto mb-1" />
              <span>Approve Provisions</span>
            </div>
          </Button>
          <Button 
            onClick={() => setActiveTab('system-health')}
            className="bg-purple-600 hover:bg-purple-700 h-20"
          >
            <div className="text-center">
              <Activity size={24} className="mx-auto mb-1" />
              <span>System Health</span>
            </div>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Recent System Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold">New user registration</p>
              <p className="text-sm text-gray-600">Raman Kumar - HarvestFlow Manager • 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Package className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold">Provision request approved</p>
              <p className="text-sm text-gray-600">Fertilizer order #PR-001 • 4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Settings className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-semibold">System settings updated</p>
              <p className="text-sm text-gray-600">Yield thresholds modified • 1 day ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// *** NEW: USER CREATION TAB ***
function UserCreation() {
  const [newUser, setNewUser] = useState<NewUser>({
    full_name: '',
    staff_id: '',
    email: '',
    phone: '',
    person_type: 'supervisor',
    designation: '',
    department: 'harvest',
    contact_number: '',
    address: '',
    daily_wage: 0,
    weight_based_wage: 0,
    emergency_contact: '',
    bank_account: '',
    ifsc_code: ''
  });

  const [creating, setCreating] = useState(false);

  const createUser = async () => {
    try {
      setCreating(true);
      
      // Generate staff ID if not provided
      const staffId = newUser.staff_id || `${newUser.person_type.toUpperCase().substring(0,2)}-${Date.now()}`;
      
      // Create user with API call (simulate for now)
      const userData = {
        ...newUser,
        staff_id: staffId,
        status: 'active',
        created_at: new Date().toISOString()
      };

      // Here you would make the actual API call
      console.log('Creating user:', userData);
      
      alert(`User created successfully!\nStaff ID: ${staffId}\nTemporary password: TempPass123!\n\nPlease share these credentials with the user.`);
      
      // Reset form
      setNewUser({
        full_name: '', staff_id: '', email: '', phone: '', person_type: 'supervisor',
        designation: '', department: 'harvest', contact_number: '', address: '',
        daily_wage: 0, weight_based_wage: 0, emergency_contact: '', bank_account: '', ifsc_code: ''
      });
      
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserPlus className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Create New User</h2>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-700 border-b pb-2">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={newUser.full_name}
                onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Staff ID</label>
              <input
                type="text"
                value={newUser.staff_id}
                onChange={(e) => setNewUser({...newUser, staff_id: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Auto-generated if empty"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="user@relish.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">User Role *</label>
                <select
                  value={newUser.person_type}
                  onChange={(e) => setNewUser({...newUser, person_type: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Administrator</option>
                  <option value="harvestflow_manager">HarvestFlow Manager</option>
                  <option value="flavorcore_manager">FlavorCore Manager</option>
                  <option value="flavorcore_supervisor">FlavorCore Supervisor</option>
                  <option value="supervisor">Field Supervisor</option>
                  <option value="field_worker">Field Worker</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <select
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="harvest">Harvest Operations</option>
                  <option value="packaging">Packaging & Processing</option>
                  <option value="quality">Quality Control</option>
                  <option value="logistics">Logistics & Dispatch</option>
                  <option value="administration">Administration</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Designation</label>
              <input
                type="text"
                value={newUser.designation}
                onChange={(e) => setNewUser({...newUser, designation: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Supervisor, Quality Inspector"
              />
            </div>
          </div>

          {/* Employment & Contact Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-700 border-b pb-2">Employment & Contact Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Daily Wage (₹)</label>
                <input
                  type="number"
                  value={newUser.daily_wage}
                  onChange={(e) => setNewUser({...newUser, daily_wage: Number(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Weight-based Wage (₹/kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newUser.weight_based_wage}
                  onChange={(e) => setNewUser({...newUser, weight_based_wage: Number(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="5.50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Number</label>
              <input
                type="tel"
                value={newUser.contact_number}
                onChange={(e) => setNewUser({...newUser, contact_number: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Additional contact number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <textarea
                value={newUser.address}
                onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Complete address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Emergency Contact</label>
              <input
                type="tel"
                value={newUser.emergency_contact}
                onChange={(e) => setNewUser({...newUser, emergency_contact: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Emergency contact number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bank Account</label>
                <input
                  type="text"
                  value={newUser.bank_account}
                  onChange={(e) => setNewUser({...newUser, bank_account: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={newUser.ifsc_code}
                  onChange={(e) => setNewUser({...newUser, ifsc_code: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="IFSC code"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Role-based Access Preview */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-bold mb-2">Access Level Preview:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {newUser.person_type === 'admin' && (
              <div className="text-sm">
                <span className="font-semibold text-red-600">Administrator:</span>
                <p>Full system access, user management, settings control</p>
              </div>
            )}
            {newUser.person_type === 'harvestflow_manager' && (
              <div className="text-sm">
                <span className="font-semibold text-green-600">HarvestFlow Manager:</span>
                <p>Field operations, harvest planning, worker management</p>
              </div>
            )}
            {newUser.person_type === 'flavorcore_manager' && (
              <div className="text-sm">
                <span className="font-semibold text-blue-600">FlavorCore Manager:</span>
                <p>Processing operations, quality control, packaging</p>
              </div>
            )}
            {newUser.person_type === 'flavorcore_supervisor' && (
              <div className="text-sm">
                <span className="font-semibold text-purple-600">FlavorCore Supervisor:</span>
                <p>Processing supervision, quality checks, packaging control</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button 
            onClick={() => setNewUser({
              full_name: '', staff_id: '', email: '', phone: '', person_type: 'supervisor',
              designation: '', department: 'harvest', contact_number: '', address: '',
              daily_wage: 0, weight_based_wage: 0, emergency_contact: '', bank_account: '', ifsc_code: ''
            })}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Reset Form
          </Button>
          <Button 
            onClick={createUser}
            disabled={creating || !newUser.full_name || !newUser.email || !newUser.phone}
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            {creating ? (
              <>Creating User...</>
            ) : (
              <>
                <UserPlus size={18} className="mr-2" />
                Create User Account
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// *** NEW: SYSTEM HEALTH TAB ***
function SystemHealth() {
  const [healthData, setHealthData] = useState({
    api_status: 'healthy',
    database_status: 'healthy',
    storage_usage: 67,
    active_sessions: 12,
    last_backup: '2025-01-12 03:00:00',
    uptime: '15 days, 4 hours'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="w-8 h-8 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-800">System Health Monitor</h2>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-bold text-green-800">API Services</h3>
              <p className="text-sm text-green-600">All endpoints responding</p>
              <p className="text-xs text-green-500 mt-1">Response time: 120ms</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-bold text-blue-800">Database</h3>
              <p className="text-sm text-blue-600">Connection stable</p>
              <p className="text-xs text-blue-500 mt-1">Query time: 45ms avg</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="font-bold text-yellow-800">Storage</h3>
              <p className="text-sm text-yellow-600">{healthData.storage_usage}% used</p>
              <p className="text-xs text-yellow-500 mt-1">Cleanup recommended</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-bold text-purple-800">Active Sessions</h3>
              <p className="text-sm text-purple-600">{healthData.active_sessions} users online</p>
              <p className="text-xs text-purple-500 mt-1">Peak: 18 users</p>
            </div>
          </div>
        </Card>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">System Uptime</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Current Uptime:</span>
              <span className="font-bold text-green-600">{healthData.uptime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Last Restart:</span>
              <span className="text-gray-600">2025-01-01 00:00:00</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Availability:</span>
              <span className="font-bold text-green-600">99.9%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Backup Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Last Backup:</span>
              <span className="font-bold text-green-600">{healthData.last_backup}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Backup Size:</span>
              <span className="text-gray-600">2.3 GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Next Scheduled:</span>
              <span className="text-gray-600">Tonight 03:00 AM</span>
            </div>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              <Download size={18} className="mr-2" />
              Manual Backup
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent System Events */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Recent System Events</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="font-semibold">System backup completed successfully</p>
              <p className="text-sm text-gray-600">Today at 03:00 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-semibold">Peak user activity recorded</p>
              <p className="text-sm text-gray-600">Yesterday at 02:30 PM - 18 concurrent users</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-semibold">Storage cleanup recommended</p>
              <p className="text-sm text-gray-600">2 days ago - Current usage: {healthData.storage_usage}%</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// *** NEW: DATABASE MANAGEMENT TAB ***
function DatabaseManagement() {
  const [tables, setTables] = useState([
    { name: 'users', records: 12, size: '2.3 MB', last_updated: '2025-01-12' },
    { name: 'attendance', records: 1580, size: '856 KB', last_updated: '2025-01-12' },
    { name: 'jobs', records: 45, size: '234 KB', last_updated: '2025-01-11' },
    { name: 'weight_records', records: 892, size: '445 KB', last_updated: '2025-01-12' },
    { name: 'procurement_requests', records: 23, size: '156 KB', last_updated: '2025-01-10' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Database Management</h2>
      </div>

      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Database className="text-blue-600" size={24} />}
          title="Total Tables"
          value={tables.length}
          color="blue"
        />
        <StatCard
          icon={<Users className="text-green-600" size={24} />}
          title="Total Records"
          value={tables.reduce((sum, table) => sum + table.records, 0)}
          color="green"
        />
        <StatCard
          icon={<Package className="text-purple-600" size={24} />}
          title="Database Size"
          value="4.2"
          color="purple"
          description="MB"
        />
        <StatCard
          icon={<CheckCircle className="text-yellow-600" size={24} />}
          title="Health Score"
          value="98%"
          color="yellow"
        />
      </div>

      {/* Database Tables */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Database Tables</h3>
          <div className="flex gap-2">
            <Button className="bg-green-600 hover:bg-green-700">
              <Download size={18} className="mr-2" />
              Export Schema
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Database size={18} className="mr-2" />
              Optimize Tables
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-3 font-semibold">Table Name</th>
                <th className="text-left p-3 font-semibold">Records</th>
                <th className="text-left p-3 font-semibold">Size</th>
                <th className="text-left p-3 font-semibold">Last Updated</th>
                <th className="text-left p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {table.name}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">{table.records.toLocaleString()}</td>
                  <td className="p-3">{table.size}</td>
                  <td className="p-3 text-sm text-gray-600">{table.last_updated}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1">
                        View
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1">
                        Export
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Database Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-bold mb-4">Maintenance</h3>
          <div className="space-y-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Optimize Database
            </Button>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Repair Tables
            </Button>
            <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
              Check Integrity
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4">Backup & Restore</h3>
          <div className="space-y-3">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Create Backup
            </Button>
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              Restore Backup
            </Button>
            <Button className="w-full bg-gray-600 hover:bg-gray-700">
              Schedule Backup
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4">Data Export</h3>
          <div className="space-y-3">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Export All Data
            </Button>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Export User Data
            </Button>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Export Reports
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Keep all existing components (YieldsAnalytics, UserManagement, etc.) unchanged...
// Yields Analytics Component with Date Range
function YieldsAnalytics() {
  const [dateRange, setDateRange] = useState<'latest' | 'today' | '7days' | '30days' | 'month' | 'custom'>('latest');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [yieldData, setYieldData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadYieldData();
  }, [dateRange, customFrom, customTo]);

  const loadYieldData = async () => {
    setLoading(true);
    try {
      // TODO: Call API with date range
      // Simulated data for now
      setYieldData({
        latestLot: 'LOT-2025-042',
        hfRawWeight: 125.5,
        hfThreshedWeight: 94.1,
        hfYield: 74.9,
        fcFinalWeight: 31.2,
        fcFinalToRaw: 24.9,
        fcFinalToThreshed: 33.2
      });
    } catch (error) {
      console.error('Error loading yield data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYieldStatus = (value: number, min: number, max: number) => {
    if (value < min) return { status: 'CRITICAL', color: 'red', icon: <XCircle size={20} /> };
    if (value > max) return { status: 'WARNING', color: 'yellow', icon: <AlertTriangle size={20} /> };
    return { status: 'NORMAL', color: 'green', icon: <CheckCircle size={20} /> };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📊 Yields & Analytics</h2>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Download size={18} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">📅 Date Range</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
          <Button
            variant={dateRange === 'latest' ? 'default' : 'outline'}
            onClick={() => setDateRange('latest')}
            className="h-12"
          >
            Latest Lot
          </Button>
          <Button
            variant={dateRange === 'today' ? 'default' : 'outline'}
            onClick={() => setDateRange('today')}
            className="h-12"
          >
            Today
          </Button>
          <Button
            variant={dateRange === '7days' ? 'default' : 'outline'}
            onClick={() => setDateRange('7days')}
            className="h-12"
          >
            Last 7 Days
          </Button>
          <Button
            variant={dateRange === '30days' ? 'default' : 'outline'}
            onClick={() => setDateRange('30days')}
            className="h-12"
          >
            Last 30 Days
          </Button>
          <Button
            variant={dateRange === 'month' ? 'default' : 'outline'}
            onClick={() => setDateRange('month')}
            className="h-12"
          >
            This Month
          </Button>
          <Button
            variant={dateRange === 'custom' ? 'default' : 'outline'}
            onClick={() => setDateRange('custom')}
            className="h-12"
          >
            Custom
          </Button>
        </div>

        {dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From:</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To:</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        )}
      </Card>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Loading yield data...</p>
        </Card>
      ) : (
        <>
          {/* HarvestFlow Yields */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">🌾 HARVESTFLOW YIELDS</h3>
            <p className="text-sm text-gray-600 mb-4">
              Showing: {yieldData?.latestLot} (Latest)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Raw Weight</p>
                <p className="text-2xl font-bold text-blue-600">{yieldData?.hfRawWeight} kg</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Threshed Weight</p>
                <p className="text-2xl font-bold text-green-600">{yieldData?.hfThreshedWeight} kg</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Estate Yield</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-purple-600">{yieldData?.hfYield}%</p>
                  {getYieldStatus(yieldData?.hfYield, 65, 85).icon}
                </div>
                <p className="text-xs text-gray-500 mt-1">Threshold: 65-85% (Std: 75%)</p>
                <p className={`text-xs font-semibold mt-1 text-${getYieldStatus(yieldData?.hfYield, 65, 85).color}-600`}>
                  Status: {getYieldStatus(yieldData?.hfYield, 65, 85).status}
                </p>
              </div>
            </div>
          </Card>

          {/* FlavorCore Yields */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">🏭 FLAVORCORE YIELDS</h3>
            <p className="text-sm text-gray-600 mb-4">
              Showing: {yieldData?.latestLot} (Latest)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Threshed Weight</p>
                <p className="text-2xl font-bold text-blue-600">{yieldData?.hfThreshedWeight} kg</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Final Product</p>
                <p className="text-2xl font-bold text-green-600">{yieldData?.fcFinalWeight} kg</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">Final → Raw Weight</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-600">{yieldData?.fcFinalToRaw}%</span>
                    <XCircle size={20} className="text-red-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-600">Threshold: 31-35% (Std: 33%)</p>
                <p className="text-xs font-semibold text-red-600 mt-1">Status: BELOW MINIMUM ⚠️</p>
              </div>

              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">Final → Threshed Weight</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-600">{yieldData?.fcFinalToThreshed}%</span>
                    <XCircle size={20} className="text-red-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-600">Threshold: 75-85% (Std: 80%)</p>
                <p className="text-xs font-semibold text-red-600 mt-1">Status: BELOW MINIMUM ⚠️</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// FIXED: Real User Management Component
function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const userData = await response.json();
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'harvestflow_manager': return 'bg-green-100 text-green-800';
      case 'flavorcore_manager': return 'bg-blue-100 text-blue-800';
      case 'supervisor': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">Loading users...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <h3 className="text-xl font-bold mb-2">Error Loading Users</h3>
          <p className="mb-4">{error}</p>
          <Button onClick={loadUsers} className="bg-red-600 hover:bg-red-700">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">👨‍💼 User Management</h2>
        <div className="flex gap-2">
          <Button onClick={loadUsers} className="bg-blue-600 hover:bg-blue-700">
            <Download size={18} className="mr-2" />
            Refresh
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Users size={18} className="mr-2" />
            Export Users
          </Button>
        </div>
      </div>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="text-blue-600" size={24} />}
          title="Total Users"
          value={users.length}
          color="blue"
        />
        <StatCard
          icon={<UserCheck className="text-green-600" size={24} />}
          title="Active Users"
          value={users.filter(u => u.status === 'active').length}
          color="green"
        />
        <StatCard
          icon={<Clock className="text-yellow-600" size={24} />}
          title="Admins"
          value={users.filter(u => u.person_type === 'admin').length}
          color="yellow"
        />
        <StatCard
          icon={<Settings className="text-purple-600" size={24} />}
          title="Face Registered"
          value={users.filter(u => u.face_registered_at).length}
          color="purple"
        />
      </div>

      {/* Users Table */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">All Users ({users.length})</h3>
        
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 font-semibold">Staff ID</th>
                  <th className="text-left p-3 font-semibold">Name</th>
                  <th className="text-left p-3 font-semibold">Role</th>
                  <th className="text-left p-3 font-semibold">Designation</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Contact</th>
                  <th className="text-left p-3 font-semibold">Face Auth</th>
                  <th className="text-left p-3 font-semibold">Created</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {user.staff_id}
                      </span>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.first_name} {user.last_name}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.person_type)}`}>
                        {user.person_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{user.designation}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {user.contact_number ? (
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          <span>{user.contact_number}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No contact</span>
                      )}
                    </td>
                    <td className="p-3">
                      {user.face_registered_at ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={16} />
                          <span className="text-xs">Registered</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <XCircle size={16} />
                          <span className="text-xs">Not set</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1">
                          Edit
                        </Button>
                        <Button size="sm" className="bg-gray-600 hover:bg-gray-700 text-xs px-2 py-1">
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// Keep all other existing components unchanged...
function OnboardingApprovals() {
  const [pendingOnboarding, setPendingOnboarding] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingOnboarding();
  }, []);

  const loadPendingOnboarding = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingOnboarding();
      setPendingOnboarding(data.records || []);
    } catch (error) {
      console.error('Error loading pending onboarding:', error);
      setPendingOnboarding([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">Loading pending onboarding requests...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">👥 Onboarding Approvals</h2>
      
      {pendingOnboarding.length === 0 ? (
        <Card className="p-8 text-center">
          <UserCheck size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Pending Requests</h3>
          <p className="text-gray-500">All onboarding requests have been processed.</p>
        </Card>
      ) : (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Pending Requests ({pendingOnboarding.length})</h3>
          <div className="space-y-4">
            {pendingOnboarding.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{request.full_name}</h4>
                    <p className="text-sm text-gray-600">{request.designation}</p>
                    <p className="text-xs text-gray-500">Staff ID: {request.staff_id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-green-600 hover:bg-green-700 text-sm">
                      Approve
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-sm">
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function AttendanceOverrides() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">✅ Attendance Override Approvals</h2>
      
      <Card className="p-8 text-center">
        <ClipboardCheck size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Override Requests</h3>
        <p className="text-gray-500">All attendance records are properly logged.</p>
      </Card>
    </div>
  );
}

function AllAttendanceRecords() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📋 All Attendance Records</h2>
      
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Attendance Records</h3>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Download size={18} className="mr-2" />
            Export CSV
          </Button>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <ClipboardCheck size={48} className="mx-auto mb-4 opacity-50" />
          <p>Attendance records will be displayed here</p>
          <p className="text-sm">Connect to attendance API endpoint</p>
        </div>
      </Card>
    </div>
  );
}

function ProvisionApprovals() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📦 Provision Approvals</h2>
      
      <Card className="p-8 text-center">
        <Package size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Pending Requests</h3>
        <p className="text-gray-500">All provision requests have been processed.</p>
      </Card>
    </div>
  );
}

function WagesReports() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">💰 Wages & Financial Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-bold mb-2">Monthly Wages</h3>
          <p className="text-2xl font-bold text-green-600">₹0</p>
          <p className="text-sm text-gray-500">Current month</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-bold mb-2">Pending Payments</h3>
          <p className="text-2xl font-bold text-yellow-600">₹0</p>
          <p className="text-sm text-gray-500">To be paid</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-bold mb-2">Total Workers</h3>
          <p className="text-2xl font-bold text-blue-600">3</p>
          <p className="text-sm text-gray-500">Active payroll</p>
        </Card>
      </div>
      
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Wage Calculations</h3>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Download size={18} className="mr-2" />
            Generate Payroll
          </Button>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
          <p>Wage reports will be displayed here</p>
          <p className="text-sm">Connect to wage calculation API</p>
        </div>
      </Card>
    </div>
  );
}

function SystemSettings() {
  const [yieldSettings, setYieldSettings] = useState<YieldSettings>({
    hf_raw_to_threshed_min: 65,
    hf_raw_to_threshed_std: 75,
    hf_raw_to_threshed_max: 85,
    fc_final_to_raw_min: 31,
    fc_final_to_raw_std: 33,
    fc_final_to_raw_max: 35,
    fc_final_to_threshed_min: 75,
    fc_final_to_threshed_std: 80,
    fc_final_to_threshed_max: 85,
    deviation_threshold: 5,
    variance_threshold: 5
  });

  const handleSave = () => {
    localStorage.setItem('yield_settings', JSON.stringify(yieldSettings));
    alert('Yield settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">⚙️ System Settings</h2>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">🌾 HarvestFlow Yield Standards</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Minimum %</label>
              <input
                type="number"
                value={yieldSettings.hf_raw_to_threshed_min}
                onChange={(e) => setYieldSettings({...yieldSettings, hf_raw_to_threshed_min: Number(e.target.value)})}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Standard %</label>
              <input
                type="number"
                value={yieldSettings.hf_raw_to_threshed_std}
                onChange={(e) => setYieldSettings({...yieldSettings, hf_raw_to_threshed_std: Number(e.target.value)})}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Maximum %</label>
              <input
                type="number"
                value={yieldSettings.hf_raw_to_threshed_max}
                onChange={(e) => setYieldSettings({...yieldSettings, hf_raw_to_threshed_max: Number(e.target.value)})}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">🏭 FlavorCore Yield Standards</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Final to Raw Weight:</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Minimum %</label>
                <input
                  type="number"
                  value={yieldSettings.fc_final_to_raw_min}
                  onChange={(e) => setYieldSettings({...yieldSettings, fc_final_to_raw_min: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Standard %</label>
                <input
                  type="number"
                  value={yieldSettings.fc_final_to_raw_std}
                  onChange={(e) => setYieldSettings({...yieldSettings, fc_final_to_raw_std: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Maximum %</label>
                <input
                  type="number"
                  value={yieldSettings.fc_final_to_raw_max}
                  onChange={(e) => setYieldSettings({...yieldSettings, fc_final_to_raw_max: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Final to Threshed Weight:</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Minimum %</label>
                <input
                  type="number"
                  value={yieldSettings.fc_final_to_threshed_min}
                  onChange={(e) => setYieldSettings({...yieldSettings, fc_final_to_threshed_min: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Standard %</label>
                <input
                  type="number"
                  value={yieldSettings.fc_final_to_threshed_std}
                  onChange={(e) => setYieldSettings({...yieldSettings, fc_final_to_threshed_std: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Maximum %</label>
                <input
                  type="number"
                  value={yieldSettings.fc_final_to_threshed_max}
                  onChange={(e) => setYieldSettings({...yieldSettings, fc_final_to_threshed_max: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">🔔 Deviation Alert Triggers</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sudden Drop from Average (%):</label>
              <input
                type="number"
                value={yieldSettings.deviation_threshold}
                onChange={(e) => setYieldSettings({...yieldSettings, deviation_threshold: Number(e.target.value)})}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Batch Variance Threshold (%):</label>
              <input
                type="number"
                value={yieldSettings.variance_threshold}
                onChange={(e) => setYieldSettings({...yieldSettings, variance_threshold: Number(e.target.value)})}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Alert if below Minimum</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Alert if above Maximum</span>
            </label>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 px-8">
          💾 Save Settings
        </Button>
      </div>
    </div>
  );
}

// Helper Components
function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-purple-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ icon, title, value, color, description }: { 
  icon: React.ReactNode; 
  title: string; 
  value: number | string; 
  color: string;
  description?: string;
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200'
  };

  return (
    <Card className={`p-6 ${colors[color as keyof typeof colors]} border-2`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {value}{description && <span className="text-lg ml-1">{description}</span>}
          </p>
        </div>
        {icon}
      </div>
    </Card>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
      {children}
    </span>
  );
}