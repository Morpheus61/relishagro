import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  HarvestFlowStaffView,
  HarvestFlowAttendanceView,
  HarvestFlowJobsView,
  HarvestFlowHarvestView,
  HarvestFlowDispatchView,
  HarvestFlowWagesView,
  FlavorCoreProcessingView,
  FlavorCoreInventoryView,
  FlavorCoreQualityView
} from './DataViews';

interface AdminDashboardProps {
  userId: string;
  userRole: string;
  onLogout: () => void;
}

interface User {
  id: string;
  staff_id: string;
  first_name: string;
  last_name: string;
  person_type: string;
  designation: string;
  status: string;
}

interface Stats {
  totalUsers: number;
  pendingApprovals: number;
  activeSessions: number;
}

interface SystemParams {
  hf_daily_work_start: string;
  hf_daily_work_end: string;
  hf_daily_wage: number;
  hf_harvest_segment1_start: string;
  hf_harvest_segment1_end: string;
  hf_harvest_segment2_start: string;
  hf_harvest_segment2_end: string;
  fc_work_start: string;
  fc_work_end: string;
  fc_wage_frequency: string;
}

export function AdminDashboard({ userId, userRole, onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, pendingApprovals: 0, activeSessions: 0 });
  const [loading, setLoading] = useState(true);
  
  const [newUser, setNewUser] = useState({
    roleType: '',
    staffId: '',
    firstName: '',
    lastName: '',
    designation: ''
  });

  const [systemParams, setSystemParams] = useState<SystemParams>({
    hf_daily_work_start: '08:00',
    hf_daily_work_end: '17:00',
    hf_daily_wage: 500,
    hf_harvest_segment1_start: '07:00',
    hf_harvest_segment1_end: '10:00',
    hf_harvest_segment2_start: '11:00',
    hf_harvest_segment2_end: '15:00',
    fc_work_start: '08:00',
    fc_work_end: '17:00',
    fc_wage_frequency: 'monthly'
  });

  useEffect(() => {
    loadUsers();
    loadStats();
    loadSystemParams();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('person_records')
        .select('id, staff_id, first_name, last_name, person_type, designation, status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { count: userCount } = await supabase
        .from('person_records')
        .select('*', { count: 'exact', head: true });

      const { count: approvalCount } = await supabase
        .from('onboarding_pending')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalUsers: userCount || 0,
        pendingApprovals: approvalCount || 0,
        activeSessions: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadSystemParams = async () => {
    try {
      const { data, error } = await supabase
        .from('system_parameters')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setSystemParams(data);
      }
    } catch (error) {
      console.error('Error loading system parameters:', error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.staffId || !newUser.firstName || !newUser.lastName || !newUser.roleType) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('person_records')
        .insert({
          staff_id: newUser.staffId,
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          person_type: newUser.roleType,
          designation: newUser.designation,
          status: 'active'
        });

      if (error) throw error;

      alert('User created successfully');
      setNewUser({ roleType: '', staffId: '', firstName: '', lastName: '', designation: '' });
      loadUsers();
      loadStats();
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('person_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('User deleted successfully');
      loadUsers();
      loadStats();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const saveSystemParams = async () => {
    try {
      const { data: existingParams } = await supabase
        .from('system_parameters')
        .select('id')
        .single();

      if (existingParams) {
        const { error } = await supabase
          .from('system_parameters')
          .update(systemParams)
          .eq('id', existingParams.id);

        if (error) throw error;
      }
      
      alert('System parameters saved successfully');
    } catch (error: any) {
      console.error('Error saving parameters:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'hf-staff':
        return <HarvestFlowStaffView onBack={() => setActiveSection('dashboard')} />;

      case 'hf-attendance':
        return <HarvestFlowAttendanceView onBack={() => setActiveSection('dashboard')} />;

      case 'hf-jobs':
        return <HarvestFlowJobsView onBack={() => setActiveSection('dashboard')} />;

      case 'hf-harvest':
        return <HarvestFlowHarvestView onBack={() => setActiveSection('dashboard')} />;

      case 'hf-dispatch':
        return <HarvestFlowDispatchView onBack={() => setActiveSection('dashboard')} />;

      case 'hf-wages':
        return <HarvestFlowWagesView onBack={() => setActiveSection('dashboard')} />;

      case 'fc-processing':
        return <FlavorCoreProcessingView onBack={() => setActiveSection('dashboard')} />;

      case 'fc-inventory':
        return <FlavorCoreInventoryView onBack={() => setActiveSection('dashboard')} />;

      case 'fc-quality':
        return <FlavorCoreQualityView onBack={() => setActiveSection('dashboard')} />;

      case 'user-management':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-6">User Management</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold mb-4">Create New User</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Role Type</label>
                    <select 
                      className="w-full p-3 border rounded-lg"
                      value={newUser.roleType}
                      onChange={(e) => setNewUser({...newUser, roleType: e.target.value})}
                    >
                      <option value="">Select Role Type</option>
                      <option value="admin">Admin</option>
                      <option value="harvestflow_manager">HarvestFlow Manager</option>
                      <option value="flavorcore_manager">FlavorCore Manager</option>
                      <option value="flavorcore_supervisor">FlavorCore Supervisor</option>
                      <option value="harvesting">Harvesting</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Staff ID</label>
                    <Input 
                      type="text" 
                      placeholder="Raja-001" 
                      value={newUser.staffId}
                      onChange={(e) => setNewUser({...newUser, staffId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input 
                      type="text" 
                      placeholder="Raja" 
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input 
                      type="text" 
                      placeholder="Kumar" 
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Designation</label>
                    <Input 
                      type="text" 
                      placeholder="Manager" 
                      value={newUser.designation}
                      onChange={(e) => setNewUser({...newUser, designation: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateUser}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Create User
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Existing Users ({users.length})</h4>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {users.map((user) => (
                      <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{user.staff_id}</span>
                          <p className="text-xs text-gray-600">{user.first_name} {user.last_name} - {user.person_type}</p>
                          <p className="text-xs text-gray-500">{user.designation}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-red-500 text-white text-xs px-3 py-1"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={() => setActiveSection('dashboard')}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        );

      case 'system-parameters':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-6">System Parameters</h3>
            
            <div className="mb-8">
              <h4 className="text-xl font-semibold mb-4 text-orange-700">HarvestFlow Parameters</h4>
              
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <h5 className="font-semibold mb-3">Daily Jobs (Non-Harvest Period)</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Work Start Time</label>
                    <Input 
                      type="time" 
                      value={systemParams.hf_daily_work_start}
                      onChange={(e) => setSystemParams({...systemParams, hf_daily_work_start: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Work End Time</label>
                    <Input 
                      type="time" 
                      value={systemParams.hf_daily_work_end}
                      onChange={(e) => setSystemParams({...systemParams, hf_daily_work_end: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Daily Wage (₹)</label>
                    <Input 
                      type="number" 
                      value={systemParams.hf_daily_wage}
                      onChange={(e) => setSystemParams({...systemParams, hf_daily_wage: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h5 className="font-semibold mb-3">Harvest Period (Two Segments)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-r pr-4">
                    <p className="text-sm font-medium mb-2">Segment 1</p>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs mb-1">Start Time</label>
                        <Input 
                          type="time" 
                          value={systemParams.hf_harvest_segment1_start}
                          onChange={(e) => setSystemParams({...systemParams, hf_harvest_segment1_start: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">End Time</label>
                        <Input 
                          type="time" 
                          value={systemParams.hf_harvest_segment1_end}
                          onChange={(e) => setSystemParams({...systemParams, hf_harvest_segment1_end: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Segment 2</p>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs mb-1">Start Time</label>
                        <Input 
                          type="time" 
                          value={systemParams.hf_harvest_segment2_start}
                          onChange={(e) => setSystemParams({...systemParams, hf_harvest_segment2_start: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">End Time</label>
                        <Input 
                          type="time" 
                          value={systemParams.hf_harvest_segment2_end}
                          onChange={(e) => setSystemParams({...systemParams, hf_harvest_segment2_end: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Note: Wages for harvest period are configured per staff based on daily wage or per-kg rates</p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-xl font-semibold mb-4 text-purple-700">FlavorCore Parameters</h4>
              
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <h5 className="font-semibold mb-3">Working Hours</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Work Start Time</label>
                    <Input 
                      type="time" 
                      value={systemParams.fc_work_start}
                      onChange={(e) => setSystemParams({...systemParams, fc_work_start: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Work End Time</label>
                    <Input 
                      type="time" 
                      value={systemParams.fc_work_end}
                      onChange={(e) => setSystemParams({...systemParams, fc_work_end: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h5 className="font-semibold mb-3">Wage Frequency</h5>
                <select 
                  className="w-full p-3 border rounded-lg"
                  value={systemParams.fc_wage_frequency}
                  onChange={(e) => setSystemParams({...systemParams, fc_wage_frequency: e.target.value})}
                >
                  <option value="daily">Per Day</option>
                  <option value="weekly">Per Week</option>
                  <option value="monthly">Per Month</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={saveSystemParams}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Save Parameters
              </Button>
              <Button 
                onClick={() => setActiveSection('dashboard')}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Back
              </Button>
            </div>
          </div>
        );

      case 'approvals':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-6">Pending Approvals</h3>
            <p className="text-gray-600 mb-4">Real-time approval workflows will be loaded from database</p>
            <Button 
              onClick={() => setActiveSection('dashboard')}
              className="mt-6 bg-gray-500 hover:bg-gray-600 text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        );

      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="text-lg font-semibold mb-3">User Management</h3>
                <p className="text-gray-600 mb-4">Create and manage all system users</p>
                <Button 
                  onClick={() => setActiveSection('user-management')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Manage Users
                </Button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">⚙️</div>
                <h3 className="text-lg font-semibold mb-3">System Parameters</h3>
                <p className="text-gray-600 mb-4">Configure harvest and processing settings</p>
                <Button 
                  onClick={() => setActiveSection('system-parameters')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Set Parameters
                </Button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-semibold mb-3">Approvals</h3>
                <p className="text-gray-600 mb-4">Review and approve all activities</p>
                <Button 
                  onClick={() => setActiveSection('approvals')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  View Approvals ({stats.pendingApprovals})
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-blue-800 font-semibold mb-1">Total Users</h4>
                <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                <p className="text-xs text-blue-600 mt-1">Active system accounts</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-orange-800 font-semibold mb-1">Pending Approvals</h4>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingApprovals}</p>
                <p className="text-xs text-orange-600 mt-1">Requires attention</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="text-purple-800 font-semibold mb-1">System Health</h4>
                <p className="text-3xl font-bold text-purple-600">✅</p>
                <p className="text-xs text-purple-600 mt-1">All systems operational</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-2xl font-bold text-orange-700 mb-6 flex items-center gap-2">
                <span>🌾</span> HarvestFlow Operations Data
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Button
                  onClick={() => setActiveSection('hf-staff')}
                  className="h-auto py-4 bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-300"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="font-semibold">Staff List</div>
                    <div className="text-sm">View all field staff</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setActiveSection('hf-attendance')}
                  className="h-auto py-4 bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📋</div>
                    <div className="font-semibold">Daily Attendance</div>
                    <div className="text-sm">Check-in records</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setActiveSection('hf-jobs')}
                  className="h-auto py-4 bg-green-100 hover:bg-green-200 text-green-900 border border-green-300"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="font-semibold">Job Completion</div>
                    <div className="text-sm">Task tracking</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setActiveSection('hf-harvest')}
                  className="h-auto py-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border border-yellow-300"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🌾</div>
                    <div className="font-semibold">Harvest Data</div>
                    <div className="text-sm">Daily yields</div>
                  </div>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => setActiveSection('hf-dispatch')}
                  className="h-auto py-4 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🚚</div>
                    <div className="font-semibold">Dispatch Records</div>
                    <div className="text-sm">Outbound shipments</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setActiveSection('hf-wages')}
                  className="h-auto py-4 bg-red-100 hover:bg-red-200 text-red-900 border border-red-300"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💰</div>
                    <div className="font-semibold">Wages & Money</div>
                    <div className="text-sm">Financial tracking</div>
                  </div>
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-bold text-purple-700 mb-6 flex items-center gap-2">
                <span>⚙️</span> FlavorCore Processing Data
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={() => setActiveSection('fc-processing')}
                  className="h-auto py-4 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚗️</div>
                    <div className="font-semibold">Processing Status</div>
                    <div className="text-sm">Current batches</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setActiveSection('fc-inventory')}
                  className="h-auto py-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📦</div>
                    <div className="font-semibold">Inventory Levels</div>
                    <div className="text-sm">Stock management</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setActiveSection('fc-quality')}
                  className="h-auto py-4 bg-pink-100 hover:bg-pink-200 text-pink-900 border border-pink-300"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">⭐</div>
                    <div className="font-semibold">Quality Metrics</div>
                    <div className="text-sm">Product grades</div>
                  </div>
                </Button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="bg-gradient-to-r from-red-800 to-orange-800 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-red-100">System Administration & Control</p>
          </div>
          <Button 
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {userId}</h2>
        <p className="text-gray-600">
          Role: <span className="font-semibold text-red-700">System Administrator</span>
        </p>
        <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded inline-block">
          Section: {activeSection} | Full admin control active
        </div>
      </div>

      {renderContent()}

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">Powered by RelishAgro Admin System v1.0</p>
      </div>
    </div>
  );
}