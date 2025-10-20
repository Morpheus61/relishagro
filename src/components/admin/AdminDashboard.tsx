import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import YieldAnalytics from '../shared/YieldAnalytics';
import { 
  Users, 
  Package,
  AlertTriangle,
  UserPlus,
  CheckCircle,
  XCircle,
  Search,
  Download,
  Eye,
  Edit,
  RefreshCw,
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
                className="mr-2 flex-shrink-0 whitespace-nowrap min-w-0"
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

  // ✅ Use the same base URL as api.ts
  const API_BASE = 'https://relishagrobackend-production.up.railway.app';

  // ✅ FIXED: Use the correct token key 'auth_token'
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
      const usersArray = Array.isArray(data) ? data : (data.users || []);
      setUsers(usersArray.map((u: any) => ({
        id: u.staff_id,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.staff_id,
        phone: u.phone_number || 'N/A',
        role: u.role,
        status: u.is_active ? 'active' : 'inactive',
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
        const workersArray = Array.isArray(data) ? data : (data.workers || []);
        setWorkers(workersArray.map((w: any) => ({
          id: w.staff_id,
          name: `${w.first_name || ''} ${w.last_name || ''}`.trim() || w.staff_id,
          staff_id: w.staff_id,
          role: w.role,
          phone: w.phone_number || 'N/A',
          department: w.role || 'General',
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

  const totalUsers = users.length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const pendingOnboardingCount = onboardingRequests.filter(req => req.status === 'pending').length;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedUserStatus === 'all' || user.status === selectedUserStatus;
    return matchesSearch && matchesStatus;
  });

  // ======================
  // RENDERERS
  // ======================

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Total Users</p><p className="text-3xl font-bold">{totalUsers}</p></div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Active Workers</p><p className="text-3xl font-bold text-green-600">{activeWorkers}</p></div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Pending Approvals</p><p className="text-3xl font-bold text-orange-600">{pendingOnboardingCount}</p></div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">User Management</h3>
        <Button><UserPlus className="h-4 w-4 mr-2" /> Add User</Button>
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
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Join Date</th>
                <th className="text-left p-4">Actions</th>
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
                      <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Job Types</h3>
        <Button><UserPlus className="h-4 w-4 mr-2" /> Add Job Type</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Unit</th>
                <th className="text-left p-4">Output/Worker</th>
                <th className="text-left p-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {jobTypes.map(job => (
                <tr key={job.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{job.job_name}</td>
                  <td className="p-4">{job.category}</td>
                  <td className="p-4">{job.unit_of_measurement}</td>
                  <td className="p-4">{job.expected_output_per_worker}</td>
                  <td className="p-4">{new Date(job.created_at).toLocaleDateString()}</td>
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
        {onboardingRequests.map(request => (
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
                    <Textarea placeholder="Review notes (optional)" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApproveOnboarding(request.id)} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve
                    </Button>
                    <Button variant="outline" onClick={() => handleRejectOnboarding(request.id)} className="border-red-600 text-red-600 hover:bg-red-50">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedNavigation items={navigationItems} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;