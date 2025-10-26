// src/components/admin/AdminDashboard.tsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import YieldAnalytics from '../shared/YieldAnalytics';
import AddUserModal from './AddUserModal'; // ✅ Import the new modal
import { 
  Users, 
  Package,
  AlertTriangle,
  UserPlus,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Edit,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

// Interfaces
interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

interface OnboardingRequest {
  id: string;
  applicantName: string;
  phone: string;
  farmLocation: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
}

interface Worker {
  id: string;
  name: string;
  staff_id: string;
  role: string;
  phone: string;
  department: string;
  status: 'active' | 'inactive';
}

interface JobType {
  id: string;
  job_name: string;
  category: string;
  unit_of_measurement: string;
  expected_output_per_worker: number;
  created_at: string;
}

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
                className="mr-2 flex-shrink-0 whitespace-nowrap"
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

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [onboardingRequests, setOnboardingRequests] = useState<OnboardingRequest[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserStatus, setSelectedUserStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddJobTypeModal, setShowAddJobTypeModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states (removed newUser state - now managed in modal)
  const [editUserForm, setEditUserForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    role: 'staff',
    department: 'general',
    status: 'active'
  });

  const [newJobType, setNewJobType] = useState({
    job_name: '',
    category: '',
    unit_of_measurement: 'kg',
    expected_output_per_worker: 0
  });

  const API_BASE = 'https://relishagrobackend-production.up.railway.app';

  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, { headers: getHeaders() });
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const data = await response.json();
      const usersArray = Array.isArray(data) ? data : (data.data || data.users || []);
      setUsers(usersArray.map((u: any) => ({
        id: u.staff_id || u.id,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.staff_id || u.name || 'Unknown',
        phone: u.phone_number || u.contact_number || u.phone || 'N/A',
        role: u.role || u.person_type || 'staff',
        status: (u.is_active || u.status === 'active') ? 'active' : 'inactive',
        joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'
      })));
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/workers`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        const workersArray = Array.isArray(data) ? data : (data.data || data.workers || []);
        setWorkers(workersArray.map((w: any) => ({
          id: w.staff_id || w.id,
          name: `${w.first_name || ''} ${w.last_name || ''}`.trim() || w.staff_id || w.name || 'Unknown',
          staff_id: w.staff_id || w.id,
          role: w.role || w.person_type || 'staff',
          phone: w.phone_number || w.contact_number || w.phone || 'N/A',
          department: w.department || w.role || 'General',
          status: 'active'
        })));
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
      setWorkers([]);
    }
  };

  const fetchOnboardingRequests = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/onboarding/pending`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        const requestsArray = Array.isArray(data) ? data : (data.data || []);
        setOnboardingRequests(requestsArray.map((req: any) => {
          if (req.first_name) {
            return {
              id: req.id,
              applicantName: `${req.first_name} ${req.last_name}`.trim(),
              phone: req.mobile || 'N/A',
              farmLocation: req.address || 'N/A',
              status: req.status,
              reviewNotes: req.remarks
            };
          } else {
            const dataObj = typeof req.data === 'string' ? JSON.parse(req.data) : req.data;
            return {
              id: req.id,
              applicantName: `${dataObj.personal_info.first_name || ''} ${dataObj.personal_info.last_name || ''}`.trim(),
              phone: dataObj.personal_info.mobile || 'N/A',
              farmLocation: dataObj.personal_info.address || 'N/A',
              status: req.status,
              reviewNotes: req.remarks
            };
          }
        }));
      }
    } catch (err) {
      console.error('Error fetching onboarding:', err);
      setOnboardingRequests([]);
    }
  };

  const fetchJobTypes = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/job-types`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        const jobTypesArray = Array.isArray(data) ? data : (data.data || []);
        setJobTypes(jobTypesArray.map((j: any) => ({
          id: j.id,
          job_name: j.job_name,
          category: j.category,
          unit_of_measurement: j.unit_of_measurement,
          expected_output_per_worker: j.expected_output_per_worker,
          created_at: j.created_at
        })));
      }
    } catch (err) {
      console.error('Error fetching job types:', err);
      setJobTypes([]);
    }
  };

  // ✅ UPDATED: handleAddUser now accepts userData and returns Promise
  const handleAddUser = async (userData: {
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    department: string;
  }): Promise<void> => {
    try {
      console.log('📤 Submitting new user:', userData);
      
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone_number: userData.phone,
          role: userData.role,
          department: userData.department,
          staff_id: `${userData.role.toUpperCase()}-${Date.now()}`,
          status: 'active'
        })
      });

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        await fetchUsers();
        alert('✅ User added successfully!');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to add user:', errorText);
        throw new Error('Failed to add user');
      }
    } catch (err) {
      console.error('❌ Error adding user:', err);
      throw err; // Re-throw so modal can handle it
    }
  };

  const handleAddJobType = async () => {
    if (!newJobType.job_name || !newJobType.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/job-types`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newJobType)
      });

      if (response.ok) {
        await fetchJobTypes();
        setShowAddJobTypeModal(false);
        setNewJobType({ job_name: '', category: '', unit_of_measurement: 'kg', expected_output_per_worker: 0 });
        alert('Job type added successfully!');
      } else {
        alert('Failed to add job type. Please try again.');
      }
    } catch (err) {
      console.error('Error adding job type:', err);
      alert('Failed to add job type. Please try again.');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    setEditUserForm({
      firstName,
      lastName,
      phone: user.phone,
      role: user.role,
      department: 'general',
      status: user.status
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !editUserForm.firstName || !editUserForm.lastName || !editUserForm.phone) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          first_name: editUserForm.firstName,
          last_name: editUserForm.lastName,
          phone_number: editUserForm.phone,
          role: editUserForm.role,
          department: editUserForm.department,
          status: editUserForm.status
        })
      });

      if (response.ok) {
        await fetchUsers();
        setShowEditUserModal(false);
        setSelectedUser(null);
        setEditUserForm({ firstName: '', lastName: '', phone: '', role: 'staff', department: 'general', status: 'active' });
        alert('User updated successfully!');
      } else {
        alert('Failed to update user. Please try again.');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleApproveOnboarding = async (requestId: string, notes: string = '') => {
    try {
      const response = await fetch(`${API_BASE}/api/onboarding/approve/${requestId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ notes })
      });
      if (response.ok) {
        setOnboardingRequests(prev => 
          prev.map(req => req.id === requestId ? { ...req, status: 'approved', reviewNotes: notes } : req)
        );
        alert('Request approved successfully!');
      }
    } catch (err) {
      alert('Failed to approve request');
    }
  };

  const handleRejectOnboarding = async (requestId: string, notes: string = '') => {
    try {
      const response = await fetch(`${API_BASE}/api/onboarding/reject/${requestId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ notes })
      });
      if (response.ok) {
        setOnboardingRequests(prev => 
          prev.map(req => req.id === requestId ? { ...req, status: 'rejected', reviewNotes: notes } : req)
        );
        alert('Request rejected.');
      }
    } catch (err) {
      alert('Failed to reject request');
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchUsers(),
          fetchWorkers(),
          fetchJobTypes(),
          fetchOnboardingRequests()
        ]);
      } catch (err: any) {
        setError(`Error loading dashboard: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const totalUsers = users?.length || 0;
  const activeWorkers = (workers || []).filter(w => w.status === 'active').length;
  const pendingOnboardingCount = (onboardingRequests || []).filter(req => req.status === 'pending').length;
  const totalJobTypes = jobTypes?.length || 0;

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedUserStatus === 'all' || user.status === selectedUserStatus;
    return matchesSearch && matchesStatus;
  });

  // ✅ EditUserModal and AddJobTypeModal remain the same
  const EditUserModal = memo(() => {
    const handleFirstNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setEditUserForm(prev => ({...prev, firstName: e.target.value}));
    }, []);

    const handleLastNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setEditUserForm(prev => ({...prev, lastName: e.target.value}));
    }, []);

    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setEditUserForm(prev => ({...prev, phone: e.target.value}));
    }, []);

    const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      setEditUserForm(prev => ({...prev, role: e.target.value}));
    }, []);

    const handleDepartmentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setEditUserForm(prev => ({...prev, department: e.target.value}));
    }, []);

    const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      setEditUserForm(prev => ({...prev, status: e.target.value as 'active' | 'inactive'}));
    }, []);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit User</h3>
            <Button variant="outline" size="sm" onClick={() => {
              setShowEditUserModal(false);
              setSelectedUser(null);
            }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <Input
                value={selectedUser?.id || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
            <Input
              placeholder="First Name"
              value={editUserForm.firstName}
              onChange={handleFirstNameChange}
            />
            <Input
              placeholder="Last Name"
              value={editUserForm.lastName}
              onChange={handleLastNameChange}
            />
            <Input
              placeholder="Phone Number"
              value={editUserForm.phone}
              onChange={handlePhoneChange}
            />
            <select
              value={editUserForm.role}
              onChange={handleRoleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="harvestflow_manager">HarvestFlow Manager</option>
              <option value="flavorcore_manager">FlavorCore Manager</option>
              <option value="supervisor">Supervisor</option>
            </select>
            <Input
              placeholder="Department"
              value={editUserForm.department}
              onChange={handleDepartmentChange}
            />
            <select
              value={editUserForm.status}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex gap-2">
              <Button 
                className="flex-1 whitespace-nowrap" 
                onClick={handleUpdateUser}
                disabled={!editUserForm.firstName || !editUserForm.lastName || !editUserForm.phone}
              >
                Update User
              </Button>
              <Button 
                variant="outline"
                className="flex-1 whitespace-nowrap" 
                onClick={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  });

  EditUserModal.displayName = 'EditUserModal';

  const AddJobTypeModal = memo(() => {
    const handleJobNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setNewJobType(prev => ({...prev, job_name: e.target.value}));
    }, []);

    const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setNewJobType(prev => ({...prev, category: e.target.value}));
    }, []);

    const handleUnitChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      setNewJobType(prev => ({...prev, unit_of_measurement: e.target.value}));
    }, []);

    const handleOutputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setNewJobType(prev => ({...prev, expected_output_per_worker: Number(e.target.value)}));
    }, []);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add New Job Type</h3>
            <Button variant="outline" size="sm" onClick={() => setShowAddJobTypeModal(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="Job Name"
              value={newJobType.job_name}
              onChange={handleJobNameChange}
            />
            <Input
              placeholder="Category"
              value={newJobType.category}
              onChange={handleCategoryChange}
            />
            <select
              value={newJobType.unit_of_measurement}
              onChange={handleUnitChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="units">Units</option>
              <option value="hours">Hours</option>
              <option value="acres">Acres</option>
            </select>
            <Input
              type="number"
              placeholder="Expected Output per Worker"
              value={newJobType.expected_output_per_worker || ''}
              onChange={handleOutputChange}
            />
            <Button 
              className="w-full whitespace-nowrap" 
              onClick={handleAddJobType}
              disabled={!newJobType.job_name || !newJobType.category}
            >
              Add Job Type
            </Button>
          </div>
        </Card>
      </div>
    );
  });

  AddJobTypeModal.displayName = 'AddJobTypeModal';

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold">{totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Workers</p>
              <p className="text-3xl font-bold text-green-600">{activeWorkers}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-orange-600">{pendingOnboardingCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Job Types</p>
              <p className="text-3xl font-bold text-purple-600">{totalJobTypes}</p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">User Management</h3>
        <Button onClick={() => setShowAddUserModal(true)} className="whitespace-nowrap w-full sm:w-auto px-4 py-2">
          <UserPlus className="h-4 w-4 mr-2" /> 
          <span>Add User</span>
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <select value={selectedUserStatus} onChange={(e) => setSelectedUserStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 whitespace-nowrap">User</th>
                <th className="text-left p-4 whitespace-nowrap">Phone</th>
                <th className="text-left p-4 whitespace-nowrap">Role</th>
                <th className="text-left p-4 whitespace-nowrap">Status</th>
                <th className="text-left p-4 whitespace-nowrap">Join Date</th>
                <th className="text-left p-4 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4">{user.phone}</td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4">
                    <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="p-4">{user.joinDate}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditUser(user)} title="Edit user">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderJobTypes = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Job Types</h3>
        <Button onClick={() => setShowAddJobTypeModal(true)} className="whitespace-nowrap w-full sm:w-auto px-4 py-2">
          <UserPlus className="h-4 w-4 mr-2" /> 
          <span>Add Job Type</span>
        </Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 whitespace-nowrap">Name</th>
                <th className="text-left p-4 whitespace-nowrap">Category</th>
                <th className="text-left p-4 whitespace-nowrap">Unit</th>
                <th className="text-left p-4 whitespace-nowrap">Output/Worker</th>
                <th className="text-left p-4 whitespace-nowrap">Created</th>
              </tr>
            </thead>
            <tbody>
              {(jobTypes || []).map(job => (
                <tr key={job.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{job.job_name}</td>
                  <td className="p-4">{job.category}</td>
                  <td className="p-4">{job.unit_of_measurement}</td>
                  <td className="p-4">{job.expected_output_per_worker}</td>
                  <td className="p-4">{job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderOnboardingApprovals = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Onboarding Approvals</h3>
        <Badge className="bg-orange-100 text-orange-800">{pendingOnboardingCount} Pending</Badge>
      </div>
      <div className="grid gap-6">
        {(onboardingRequests || []).map(request => (
          <Card key={request.id} className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold">{request.applicantName}</h4>
                  <p className="text-gray-600">📞 {request.phone} • 📍 {request.farmLocation}</p>
                </div>
                <Badge className={
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-orange-100 text-orange-800'
                }>
                  {request.status}
                </Badge>
              </div>
              {request.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                  <div className="flex-1">
                    <Textarea placeholder="Review notes (optional)" id={`notes-${request.id}`} />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        const notes = (document.getElementById(`notes-${request.id}`) as HTMLTextAreaElement)?.value || '';
                        handleApproveOnboarding(request.id, notes);
                      }} 
                      className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const notes = (document.getElementById(`notes-${request.id}`) as HTMLTextAreaElement)?.value || '';
                        handleRejectOnboarding(request.id, notes);
                      }} 
                      className="border-red-600 text-red-600 hover:bg-red-50 whitespace-nowrap"
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              )}
              {request.reviewNotes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">📝 {request.reviewNotes}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
        {(!onboardingRequests || onboardingRequests.length === 0) && (
          <Card className="p-8 text-center text-gray-500">
            No onboarding requests to display
          </Card>
        )}
      </div>
    </div>
  );

  const renderYieldAnalytics = () => {
    return <YieldAnalytics />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'users': return renderUserManagement();
      case 'jobs': return renderJobTypes();
      case 'onboarding': return renderOnboardingApprovals();
      case 'yields': return renderYieldAnalytics();
      default: return renderOverview();
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'users', label: 'Users' },
    { id: 'jobs', label: 'Job Types' },
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'yields', label: 'Yield Analytics' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="whitespace-nowrap">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedNavigation items={navigationItems} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">{renderContent()}</div>
      </div>

      {/* ✅ UPDATED: Use new AddUserModal with proper props */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSubmit={handleAddUser}
      />
      
      {showEditUserModal && <EditUserModal />}
      {showAddJobTypeModal && <AddJobTypeModal />}
    </div>
  );
};

export default AdminDashboard;