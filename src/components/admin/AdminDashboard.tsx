import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

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

export function AdminDashboard({ userId, userRole, onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, pendingApprovals: 0, activeSessions: 0 });
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newUser, setNewUser] = useState({
    roleType: '',
    staffId: '',
    firstName: '',
    lastName: '',
    designation: ''
  });

  useEffect(() => {
    loadUsers();
    loadStats();
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
      // Total users
      const { count: userCount } = await supabase
        .from('person_records')
        .select('*', { count: 'exact', head: true });

      // Pending approvals from onboarding_pending
      const { count: approvalCount } = await supabase
        .from('onboarding_pending')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalUsers: userCount || 0,
        pendingApprovals: approvalCount || 0,
        activeSessions: 0 // This would need session tracking implementation
      });
    } catch (error) {
      console.error('Error loading stats:', error);
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

  const renderContent = () => {
    switch (activeSection) {
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
            <p className="text-gray-600 mb-4">Connect this to a system_parameters table in your database</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-4">Harvest Parameters</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Daily Harvest Target (kg)</label>
                    <Input type="number" placeholder="500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Working Hours</label>
                    <Input type="text" placeholder="8:00 AM - 5:00 PM" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Processing Parameters</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Drying Temperature (°C)</label>
                    <Input type="number" placeholder="45" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Drying Duration (hours)</label>
                    <Input type="number" placeholder="24" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
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
            <p className="text-gray-600 mb-4">Connect this to onboarding_pending table</p>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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