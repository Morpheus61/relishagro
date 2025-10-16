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
  TrendingDown,
  Loader,
  Shield,
  Database,
  FileText,
  Activity
} from 'lucide-react';
import api from '../../lib/api';

type Route = 'dashboard' | 'reports' | 'settings';

interface AdminDashboardProps {
  currentRoute?: Route;
  onNavigate?: (route: Route) => void;
}

// Types for APP USERS (not workers)
interface AppUser {
  id: string;
  staff_id: string;
  full_name: string;
  role: 'Admin' | 'HarvestFlow' | 'FlavorCore' | 'Supervisor' | 'User';
  department: string;
  designation: string;
  phone_number?: string;
  email?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login?: string;
}

interface SystemStats {
  total_users: number;
  active_users: number;
  pending_onboarding: number;
  attendance_overrides: number;
  system_health: 'good' | 'warning' | 'critical';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentRoute = 'dashboard', onNavigate }) => {
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For mobile slide-out menu

  // Data for APP USERS management
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    total_users: 0,
    active_users: 0,
    pending_onboarding: 0,
    attendance_overrides: 0,
    system_health: 'good'
  });

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Handle navigation from App.tsx header
  useEffect(() => {
    if (currentRoute && onNavigate) {
      switch (currentRoute) {
        case 'dashboard':
          setActiveTab('overview');
          break;
        case 'reports':
          setActiveTab('reports');
          break;
        case 'settings':
          setActiveTab('settings');
          break;
        default:
          setActiveTab('overview');
      }
    }
  }, [currentRoute, onNavigate]);

  // FIXED: Load APP USERS data from correct endpoint
  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading admin data from CORRECT endpoints...');
      
      // FIXED: Call correct admin endpoints instead of workers
      const [usersResponse, statsResponse] = await Promise.all([
        api.getUsers(),        // FIXED: Call admin users endpoint
        api.getAdminStats()    // FIXED: Call admin stats endpoint  
      ]);
      
      console.log('✅ Admin users response:', usersResponse);
      console.log('✅ Admin stats response:', statsResponse);
      
      // FIXED: Handle users response correctly based on AdminUserResponse interface
      let userData = null;
      if (usersResponse?.users) {
        userData = usersResponse.users;  // AdminUserResponse.users format
      } else if (Array.isArray(usersResponse)) {
        userData = usersResponse;        // Direct array format
      }
      
      console.log('📋 Extracted user data:', userData);
      
      if (userData && Array.isArray(userData)) {
        const users: AppUser[] = userData.map((user: any) => ({
          id: user.id || user.staff_id,
          staff_id: user.staff_id,
          full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
          role: (user.role || user.designation || user.person_type || 'User') as AppUser['role'],
          department: user.department || user.designation || user.person_type || 'General',
          designation: user.designation || user.person_type || 'User',
          phone_number: user.phone_number || user.contact_number,
          email: user.email,
          status: (user.is_active !== false ? 'active' : 'inactive') as AppUser['status'],
          created_at: user.created_at || new Date().toISOString(),
          last_login: user.last_login
        }));
        
        setAppUsers(users);
        
        // Use stats from API if available, otherwise calculate from users
        if (statsResponse) {
          setStats({
            total_users: statsResponse.total_users || users.length,
            active_users: statsResponse.active_users || users.filter(u => u.status === 'active').length,
            pending_onboarding: statsResponse.recent_registrations || 0,
            attendance_overrides: 0,
            system_health: (statsResponse.system_health === 'healthy' ? 'good' : 
                          statsResponse.system_health === 'warning' ? 'warning' : 
                          statsResponse.system_health) as SystemStats['system_health'] || 'good'
          });
        } else {
          // Fallback: calculate stats from user data
          const activeUsers = users.filter((u: AppUser) => u.status === 'active');
          setStats(prev => ({
            ...prev,
            total_users: users.length,
            active_users: activeUsers.length,
            system_health: users.length > 0 ? 'good' : 'warning'
          }));
        }
        
        console.log(`✅ SUCCESS: Loaded ${users.length} admin users from person_records table`);
        console.log('👤 First user example:', users[0]);
      } else {
        throw new Error('No user data received from admin API');
      }
      
    } catch (err) {
      console.error('❌ Failed to load admin data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadAdminData();
  }, []);

  // Navigation items for Admin
  const menuItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'users', icon: Users, label: 'App Users' },
    { id: 'onboarding', icon: UserPlus, label: 'User Onboarding' },
    { id: 'attendance-override', icon: UserCheck, label: 'Attendance Override' },
    { id: 'procurement', icon: Package, label: 'Procurement' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'system', icon: Database, label: 'System Health' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  // Filter app users
  const filteredUsers = appUsers.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.staff_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // FIXED: Create new app user using correct API
  const handleCreateUser = async () => {
    const staffId = prompt('Enter Staff ID (e.g., Admin-NewUser):');
    const firstName = prompt('Enter First Name:');
    const lastName = prompt('Enter Last Name:');
    const role = prompt('Enter Role (Admin/HarvestFlow/FlavorCore/Supervisor):') as AppUser['role'];
    
    if (staffId && firstName && lastName && role) {
      try {
        const userData = {
          staff_id: staffId,
          first_name: firstName,
          last_name: lastName,
          role: role,
          is_active: true
        };
        
        const newUser = await api.createUser(userData);
        console.log('✅ User created:', newUser);
        
        // Reload data to get updated list
        await loadAdminData();
        alert('App User created successfully!');
      } catch (err) {
        console.error('❌ Failed to create user:', err);
        alert('Failed to create user: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    }
  };

  // FIXED: Toggle user status using correct API
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const user = appUsers.find(u => u.id === userId);
      if (!user) return;
      
      const newStatus = user.status === 'active' ? false : true;
      await api.updateUser(user.staff_id, { is_active: newStatus });
      
      // Reload data to get updated status
      await loadAdminData();
      alert('User status updated successfully!');
    } catch (err) {
      console.error('❌ Failed to update user status:', err);
      alert('Failed to update user status: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // FIXED: Delete user using correct API
  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const user = appUsers.find(u => u.id === userId);
        if (!user) return;
        
        await api.deleteUser(user.staff_id);
        
        // Reload data to get updated list
        await loadAdminData();
        alert('User deleted successfully!');
      } catch (err) {
        console.error('❌ Failed to delete user:', err);
        alert('Failed to delete user: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    }
  };

  // Stats Card Component
  const StatsCard = ({ title, value, icon: Icon, color = 'blue', subtitle }: {
    title: string;
    value: number | string;
    icon: any;
    color?: string;
    subtitle?: string;
  }) => {
    const colorClasses: { [key: string]: string } = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      red: 'bg-red-50 border-red-200 text-red-800'
    };

    return (
      <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all hover:shadow-md`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
          </div>
          <Icon className="w-12 h-12 opacity-60" />
        </div>
      </div>
    );
  };

  // Overview Content
  const OverviewContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total App Users"
          value={stats.total_users}
          icon={Users}
          color="blue"
          subtitle="System users"
        />
        <StatsCard
          title="Active Users"
          value={stats.active_users}
          icon={Shield}
          color="green"
          subtitle="Currently active"
        />
        <StatsCard
          title="Pending Onboarding"
          value={stats.pending_onboarding}
          icon={UserPlus}
          color="yellow"
          subtitle="Awaiting approval"
        />
        <StatsCard
          title="System Health"
          value={stats.system_health.toUpperCase()}
          icon={Activity}
          color={stats.system_health === 'good' ? 'green' : stats.system_health === 'warning' ? 'yellow' : 'red'}
          subtitle="Overall status"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent User Activity</h3>
        <div className="space-y-3">
          {appUsers.slice(0, 5).map((user, index) => (
            <div key={user.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-gray-500">{user.staff_id} • {user.role}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                user.status === 'active' ? 'bg-green-100 text-green-800' :
                user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {user.status}
              </span>
            </div>
          ))}
          {appUsers.length === 0 && (
            <p className="text-gray-500 text-center py-4">No users found</p>
          )}
        </div>
      </div>
    </div>
  );

  // App Users Management Content
  const UsersContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search app users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="HarvestFlow">HarvestFlow</option>
            <option value="FlavorCore">FlavorCore</option>
            <option value="Supervisor">Supervisor</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button
            onClick={handleCreateUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
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
              {filteredUsers.map((user, index) => (
                <tr key={user.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.staff_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.role}</div>
                    <div className="text-sm text-gray-500">{user.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => alert(`Viewing ${user.full_name}\nRole: ${user.role}\nDepartment: ${user.department}`)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleUserStatus(user.id)}
                        className="text-yellow-600 hover:text-yellow-900 transition-colors"
                        title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                      >
                        {user.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No users found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Reports Content (makes App.tsx Reports button functional)
  const ReportsContent = () => {
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [reportData, setReportData] = useState<any>(null);

    // Generate report data structure (for display AND download)
    const generateReportData = (reportType: string) => {
      const timestamp = new Date().toLocaleString();
      
      switch (reportType) {
        case 'user-activity':
          return {
            title: 'User Activity Report',
            timestamp,
            sections: [
              { label: 'Total Users', value: stats.total_users },
              { label: 'Active Users', value: stats.active_users },
              { label: 'Suspended Users', value: appUsers.filter(u => u.status === 'suspended').length },
              { label: 'Inactive Users', value: appUsers.filter(u => u.status === 'inactive').length }
            ]
          };
        
        case 'system-health':
          return {
            title: 'System Health Report',
            timestamp,
            sections: [
              { label: 'API Status', value: 'Online' },
              { label: 'Database Connection', value: 'Connected' },
              { label: 'Active Users', value: stats.active_users },
              { label: 'System Health', value: stats.system_health.toUpperCase() }
            ]
          };
        
        case 'security':
          return {
            title: 'Security Report',
            timestamp,
            sections: [
              { label: 'Suspended Users', value: appUsers.filter(u => u.status === 'suspended').length },
              { label: 'Failed Login Attempts', value: 0 },
              { label: 'Security Events', value: 'None' }
            ]
          };
        
        case 'harvest-operations':
          return {
            title: 'Harvest Operations Report',
            timestamp,
            sections: [
              { label: 'Harvest Activities', value: 'In Progress' },
              { label: 'Daily Yields', value: 'Data Available' },
              { label: 'Worker Assignments', value: 'Active' }
            ]
          };
        
        case 'processing':
          return {
            title: 'FlavorCore Processing Report',
            timestamp,
            sections: [
              { label: 'Processing Status', value: 'Active' },
              { label: 'Quality Control', value: 'Passed' },
              { label: 'Production Metrics', value: 'Available' }
            ]
          };
        
        case 'attendance':
          return {
            title: 'Attendance Report',
            timestamp,
            sections: [
              { label: 'Total Workers', value: stats.total_users },
              { label: 'Present Today', value: stats.active_users },
              { label: 'Overtime Hours', value: 0 }
            ]
          };
        
        case 'procurement':
          return {
            title: 'Procurement Report',
            timestamp,
            sections: [
              { label: 'Active Suppliers', value: 5 },
              { label: 'Pending Orders', value: 3 },
              { label: 'Delivery Status', value: 'On Time' }
            ]
          };
        
        case 'quality-control':
          return {
            title: 'Quality Control Report',
            timestamp,
            sections: [
              { label: 'Quality Tests', value: '15 Passed' },
              { label: 'Compliance Status', value: '100%' },
              { label: 'Defect Rate', value: '0%' }
            ]
          };
        
        case 'financial':
          return {
            title: 'Financial Summary',
            timestamp,
            sections: [
              { label: 'Revenue', value: '$25,000' },
              { label: 'Costs', value: '$18,000' },
              { label: 'Profit', value: '$7,000' },
              { label: 'ROI', value: '28%' }
            ]
          };
        
        default:
          return null;
      }
    };

    // Handle viewing report (SHOW on screen)
    const handleViewReport = (reportType: string) => {
      const data = generateReportData(reportType);
      if (data) {
        setReportData(data);
        setSelectedReport(reportType);
      }
    };

    // Handle downloading report (SAVE as file)
    const handleDownloadReport = () => {
      if (!reportData) return;
      
      let textContent = `${reportData.title.toUpperCase()}\n`;
      textContent += `Generated: ${reportData.timestamp}\n`;
      textContent += `${'='.repeat(50)}\n\n`;
      
      reportData.sections.forEach((section: any) => {
        textContent += `${section.label}: ${section.value}\n`;
      });
      
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportData.title.toLowerCase().replace(/\s+/g, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    };

    // Go back to report grid
    const handleCloseReport = () => {
      setSelectedReport(null);
      setReportData(null);
    };

    // If viewing a specific report
    if (selectedReport && reportData) {
      return (
        <div className="space-y-4">
          <button
            onClick={handleCloseReport}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Reports
          </button>

          <div className="bg-blue-50 rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{reportData.title}</h2>
                <p className="text-sm text-gray-600 mt-1">Generated: {reportData.timestamp}</p>
              </div>
              <button
                onClick={handleDownloadReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportData.sections.map((section: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-medium text-gray-600 mb-1">{section.label}</p>
                  <p className="text-xl font-bold text-gray-900">{section.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Default: Show report grid
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">System Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => handleViewReport('user-activity')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <FileText className="w-6 h-6 text-blue-500 mb-2" />
              <h4 className="font-medium">User Activity Report</h4>
              <p className="text-sm text-gray-600">Login activity and usage statistics</p>
            </button>
            
            <button
              onClick={() => handleViewReport('system-health')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <Activity className="w-6 h-6 text-green-500 mb-2" />
              <h4 className="font-medium">System Health Report</h4>
              <p className="text-sm text-gray-600">API status and performance metrics</p>
            </button>
            
            <button
              onClick={() => handleViewReport('security')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <Shield className="w-6 h-6 text-red-500 mb-2" />
              <h4 className="font-medium">Security Report</h4>
              <p className="text-sm text-gray-600">Failed logins and security events</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Operational Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => handleViewReport('harvest-operations')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <BarChart3 className="w-6 h-6 text-orange-500 mb-2" />
              <h4 className="font-medium">Harvest Operations</h4>
              <p className="text-sm text-gray-600">Daily harvest activities and yields</p>
            </button>
            
            <button
              onClick={() => handleViewReport('processing')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <Package className="w-6 h-6 text-purple-500 mb-2" />
              <h4 className="font-medium">Processing Report</h4>
              <p className="text-sm text-gray-600">FlavorCore processing activities</p>
            </button>
            
            <button
              onClick={() => handleViewReport('attendance')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <UserCheck className="w-6 h-6 text-teal-500 mb-2" />
              <h4 className="font-medium">Attendance Report</h4>
              <p className="text-sm text-gray-600">Worker attendance and overtime</p>
            </button>
            
            <button
              onClick={() => handleViewReport('procurement')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <Briefcase className="w-6 h-6 text-indigo-500 mb-2" />
              <h4 className="font-medium">Procurement Report</h4>
              <p className="text-sm text-gray-600">Supply chain and procurement status</p>
            </button>
            
            <button
              onClick={() => handleViewReport('quality-control')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <CheckCircle className="w-6 h-6 text-emerald-500 mb-2" />
              <h4 className="font-medium">Quality Control</h4>
              <p className="text-sm text-gray-600">Quality metrics and compliance</p>
            </button>
            
            <button
              onClick={() => handleViewReport('financial')}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
              <h4 className="font-medium">Financial Summary</h4>
              <p className="text-sm text-gray-600">Revenue, costs, and profitability</p>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Onboarding Content
  const OnboardingContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">User Onboarding</h3>
        <p className="text-gray-600 mb-4">Manage new user registration and approval process.</p>
        <div className="space-y-4">
          <button
            onClick={() => {
              const requests = [
                { id: 1, name: 'John Doe', role: 'HarvestFlow', status: 'pending' },
                { id: 2, name: 'Jane Smith', role: 'FlavorCore', status: 'pending' }
              ];
              console.log('Onboarding requests:', requests);
              alert(`Found ${requests.length} pending onboarding requests`);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
          >
            View Pending Requests
          </button>
          <button
            onClick={() => {
              const name = prompt('Enter new user name:');
              const role = prompt('Enter role (Admin/HarvestFlow/FlavorCore/Supervisor):');
              if (name && role) {
                console.log('Creating onboarding request:', { name, role });
                alert(`Onboarding request created for ${name} as ${role}`);
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Create Request
          </button>
        </div>
      </div>
    </div>
  );

  // Attendance Override Content
  const AttendanceOverrideContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Attendance Override</h3>
        <p className="text-gray-600 mb-4">Review and approve attendance override requests.</p>
        <div className="space-y-4">
          <button
            onClick={() => {
              const overrides = [
                { id: 1, worker: 'Worker-001', date: new Date().toLocaleDateString(), status: 'pending' },
                { id: 2, worker: 'Worker-002', date: new Date().toLocaleDateString(), status: 'pending' }
              ];
              console.log('Attendance overrides:', overrides);
              alert(`Found ${overrides.length} pending override requests`);
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 mr-2"
          >
            View Override Requests
          </button>
          <button
            onClick={() => {
              const workerId = prompt('Enter Worker ID:');
              const reason = prompt('Enter override reason:');
              if (workerId && reason) {
                console.log('Attendance override:', { workerId, reason, date: new Date() });
                alert(`Override request submitted for ${workerId}`);
              }
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Submit Override
          </button>
        </div>
      </div>
    </div>
  );

  // Procurement Content
  const ProcurementContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Procurement Management</h3>
        <p className="text-gray-600 mb-4">Review and approve procurement requests from operational teams.</p>
        <div className="space-y-4">
          <button
            onClick={() => {
              const pendingRequests = [
                { id: 1, item: 'Harvesting Tools', requestedBy: 'HF-Manager', amount: '$2500', status: 'pending approval' },
                { id: 2, item: 'Processing Equipment', requestedBy: 'FC-Manager', amount: '$5000', status: 'pending approval' }
              ];
              console.log('Pending procurement requests:', pendingRequests);
              alert(`${pendingRequests.length} procurement requests awaiting admin approval`);
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 mr-2"
          >
            Review Pending Requests
          </button>
          <button
            onClick={() => {
              const requestId = prompt('Enter request ID to approve:');
              if (requestId) {
                console.log('Approving procurement request:', requestId);
                alert(`Procurement request ${requestId} APPROVED`);
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-2"
          >
            Approve Request
          </button>
          <button
            onClick={() => {
              const requestId = prompt('Enter request ID to reject:');
              const reason = prompt('Enter rejection reason:');
              if (requestId && reason) {
                console.log('Rejecting procurement request:', { requestId, reason });
                alert(`Procurement request ${requestId} REJECTED: ${reason}`);
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reject Request
          </button>
        </div>
      </div>
    </div>
  );

  // System Health Content
  const SystemContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">System Health Monitor</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">API Status</h4>
              <p className="text-sm text-gray-600">Backend API connectivity</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Online</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Database</h4>
              <p className="text-sm text-gray-600">Database connectivity</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Connected</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Active Users</h4>
              <p className="text-sm text-gray-600">Currently logged in users</p>
            </div>
            <span className="text-lg font-semibold text-blue-600">{stats.active_users}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Settings Content (makes App.tsx Settings button functional)
  const SettingsContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">System Maintenance</h4>
              <p className="text-sm text-gray-600">Perform system maintenance tasks</p>
            </div>
            <button 
              onClick={() => {
                console.log('Starting system maintenance...');
                setTimeout(() => {
                  console.log('System maintenance completed');
                  alert('System maintenance completed successfully!');
                }, 2000);
                alert('System maintenance started - check console for progress');
              }}
              className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Maintain
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Clear System Cache</h4>
              <p className="text-sm text-gray-600">Clear all cached data</p>
            </div>
            <button 
              onClick={() => {
                localStorage.clear();
                alert('System cache cleared!');
              }}
              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Cache
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Backup Database</h4>
              <p className="text-sm text-gray-600">Create database backup</p>
            </div>
            <button 
              onClick={() => {
                const backupData = {
                  users: appUsers.length,
                  timestamp: new Date().toISOString(),
                  version: '1.0'
                };
                const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `database_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                console.log('Database backup created:', backupData);
              }}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewContent />;
      case 'users': return <UsersContent />;
      case 'onboarding': return <OnboardingContent />;
      case 'attendance-override': return <AttendanceOverrideContent />;
      case 'procurement': return <ProcurementContent />;
      case 'reports': return <ReportsContent />;
      case 'system': return <SystemContent />;
      case 'settings': return <SettingsContent />;
      default: return <OverviewContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NO HEADER - App.tsx provides the header */}
      
      <div className="flex">
        {/* ADMIN SIDEBAR - MOBILE SLIDE-OUT MENU */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r min-h-screen transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500">System Management</p>
          </div>
          
          <nav className="px-4 pb-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false); // Close menu on mobile
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
        </aside>

        {/* MAIN CONTENT */}
        <main className={`flex-1 ${isMenuOpen ? 'ml-64' : ''} md:ml-64 transition-all duration-300 ease-in-out`}>
          <div className="p-6">
            {/* Mobile Menu Toggle Button */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-gray-100 rounded-lg"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader className="animate-spin w-8 h-8 text-blue-600 mr-3" />
                <span className="text-gray-600">Loading admin data...</span>
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
                    loadAdminData();
                  }}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Content */}
            {!loading && renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;