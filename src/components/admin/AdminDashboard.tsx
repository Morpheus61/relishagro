import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  UserPlus,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  Award,
  Activity,
  Zap,
  Target,
  BarChart,
  PieChart,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Building,
  Package
} from 'lucide-react';

// Enhanced Navigation Component - Built into this file
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
      {/* Mobile Navigation */}
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

      {/* Desktop Navigation */}
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

// API interfaces
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastActive: string;
  avatar?: string;
}

interface YieldData {
  id: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  variety: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  qualityGrade: 'A' | 'B' | 'C';
  pricePerUnit: number;
  totalValue: number;
  location: string;
  verified: boolean;
}

interface OnboardingRequest {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  farmLocation: string;
  farmSize: number;
  primaryCrops: string[];
  experienceYears: number;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    idProof: boolean;
    landOwnership: boolean;
    bankDetails: boolean;
    cropCertificates: boolean;
  };
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
  created_at: string;
}

interface JobType {
  id: string;
  name: string;
  description: string;
  department: string;
  created_at: string;
}

interface Provision {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  supplier: string;
  cost: number;
  status: 'ordered' | 'delivered' | 'pending';
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [yieldData, setYieldData] = useState<YieldData[]>([]);
  const [onboardingRequests, setOnboardingRequests] = useState<OnboardingRequest[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserStatus, setSelectedUserStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API Base URL
  const API_BASE = process.env.REACT_APP_API_URL || 'https://relishagrobackend-production.up.railway.app';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API headers with authentication
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // API Functions
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        headers: getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      // Fallback to mock data
      setUsers([
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1-555-0123',
          role: 'Farmer',
          status: 'active',
          joinDate: '2024-01-15',
          lastActive: '2024-03-15'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          phone: '+1-555-0124',
          role: 'Buyer',
          status: 'active',
          joinDate: '2024-02-01',
          lastActive: '2024-03-14'
        }
      ]);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/workers`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkers(data);
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
      setWorkers([
        {
          id: '1',
          name: 'Mike Wilson',
          staff_id: 'SW-001',
          role: 'Field Worker',
          phone: '+1-555-0125',
          department: 'Farming',
          status: 'active',
          created_at: '2024-01-10'
        }
      ]);
    }
  };

  const fetchJobTypes = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/job-types`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobTypes(data);
      }
    } catch (err) {
      console.error('Error fetching job types:', err);
      setJobTypes([
        {
          id: '1',
          name: 'Planting',
          description: 'Crop planting activities',
          department: 'Farming',
          created_at: '2024-01-01'
        },
        {
          id: '2',
          name: 'Harvesting',
          description: 'Crop harvesting activities',
          department: 'Farming',
          created_at: '2024-01-01'
        }
      ]);
    }
  };

  const fetchProvisions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/provisions`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setProvisions(data);
      }
    } catch (err) {
      console.error('Error fetching provisions:', err);
      setProvisions([
        {
          id: '1',
          item_name: 'Fertilizer',
          quantity: 100,
          unit: 'bags',
          supplier: 'Agro Supplies Inc.',
          cost: 5000,
          status: 'delivered',
          created_at: '2024-03-01'
        }
      ]);
    }
  };

  const fetchOnboardingRequests = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/onboarding/requests`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setOnboardingRequests(data);
      } else {
        // Mock data for onboarding requests
        setOnboardingRequests([
          {
            id: '1',
            applicantName: 'David Brown',
            email: 'david.brown@email.com',
            phone: '+1-555-0200',
            farmLocation: 'Valley Springs, CA',
            farmSize: 25,
            primaryCrops: ['Corn', 'Soybeans'],
            experienceYears: 8,
            applicationDate: '2024-03-10',
            status: 'pending',
            documents: {
              idProof: true,
              landOwnership: true,
              bankDetails: false,
              cropCertificates: true
            }
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching onboarding requests:', err);
      setOnboardingRequests([]);
    }
  };

  // Navigation items
  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview' },
    { id: 'users', label: 'User Management' },
    { id: 'workers', label: 'Worker Management' },
    { id: 'jobs', label: 'Job Types' },
    { id: 'provisions', label: 'Provisions' },
    { id: 'onboarding', label: 'Onboarding Approvals' },
    { id: 'yields', label: 'Yield Analytics' },
    { id: 'reports', label: 'System Reports' },
    { id: 'settings', label: 'Admin Settings' }
  ];

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedUserStatus === 'all' || user.status === selectedUserStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApproveOnboarding = async (requestId: string, notes: string = '') => {
    try {
      const response = await fetch(`${API_BASE}/api/onboarding/approve/${requestId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        setOnboardingRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'approved' as const, reviewNotes: notes }
              : req
          )
        );
      }
    } catch (err) {
      console.error('Error approving onboarding:', err);
      alert('Error approving onboarding request');
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
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'rejected' as const, reviewNotes: notes }
              : req
          )
        );
      }
    } catch (err) {
      console.error('Error rejecting onboarding:', err);
      alert('Error rejecting onboarding request');
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchUsers(),
          fetchWorkers(),
          fetchJobTypes(),
          fetchProvisions(),
          fetchOnboardingRequests()
        ]);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(`Error loading dashboard: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter((worker: Worker) => worker.status === 'active').length;
  const pendingOnboardingCount = onboardingRequests.filter(req => req.status === 'pending').length;
  const totalProvisions = provisions.reduce((sum, p) => sum + p.cost, 0);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
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
              <p className="text-sm font-medium text-gray-600">Total Provisions</p>
              <p className="text-3xl font-bold text-green-600">₹{totalProvisions.toLocaleString()}</p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent User Activity</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.role}</p>
                </div>
                <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                  {user.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Server Status</span>
              <Badge variant="default">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Connection</span>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Response Time</span>
              <Badge variant="default">Fast</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage Usage</span>
              <Badge variant="outline">68%</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">User Management</h3>
        <div className="flex gap-2">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedUserStatus}
          onChange={(e) => setSelectedUserStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Join Date</th>
                <th className="text-left p-4">Last Active</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4">
                    <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="p-4">{user.joinDate}</td>
                  <td className="p-4">{user.lastActive}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
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

  const renderWorkerManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Worker Management</h3>
        <div className="flex gap-2">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Worker
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Workers</p>
              <p className="text-3xl font-bold text-gray-900">{totalWorkers}</p>
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
              <p className="text-sm font-medium text-gray-600">Job Types</p>
              <p className="text-3xl font-bold text-purple-600">{jobTypes.length}</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold mb-4">Workers List</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Worker</th>
                  <th className="text-left p-4">Staff ID</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Department</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker: Worker) => (
                  <tr key={worker.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{worker.name}</p>
                        <p className="text-sm text-gray-600">{worker.phone}</p>
                      </div>
                    </td>
                    <td className="p-4">{worker.staff_id}</td>
                    <td className="p-4">{worker.role}</td>
                    <td className="p-4">{worker.department}</td>
                    <td className="p-4">
                      <Badge variant={worker.status === 'active' ? 'default' : 'outline'}>
                        {worker.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderJobTypes = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Job Types Management</h3>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Add Job Type
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobTypes.map(jobType => (
          <Card key={jobType.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{jobType.name}</h4>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600">{jobType.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Department:</span>
                <Badge variant="outline">{jobType.department}</Badge>
              </div>
              <div className="text-xs text-gray-400">
                Created: {new Date(jobType.created_at).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProvisions = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Provisions Management</h3>
        <Button>
          <Package className="h-4 w-4 mr-2" />
          Add Provision
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-3xl font-bold text-green-600">₹{totalProvisions.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-3xl font-bold text-blue-600">
                {provisions.filter(p => p.status === 'delivered').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-orange-600">
                {provisions.filter(p => p.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold mb-4">Provisions List</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Item</th>
                  <th className="text-left p-4">Quantity</th>
                  <th className="text-left p-4">Supplier</th>
                  <th className="text-left p-4">Cost</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {provisions.map(provision => (
                  <tr key={provision.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-medium">{provision.item_name}</p>
                    </td>
                    <td className="p-4">{provision.quantity} {provision.unit}</td>
                    <td className="p-4">{provision.supplier}</td>
                    <td className="p-4">₹{provision.cost.toLocaleString()}</td>
                    <td className="p-4">
                      <Badge variant={provision.status === 'delivered' ? 'default' : 'outline'}>
                        {provision.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderOnboardingApprovals = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Onboarding Approvals</h3>
        <Badge variant="outline">
          {pendingOnboardingCount} Pending Reviews
        </Badge>
      </div>

      <div className="grid gap-6">
        {onboardingRequests.map(request => (
          <Card key={request.id} className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold">{request.applicantName}</h4>
                  <p className="text-gray-600">{request.email} • {request.phone}</p>
                </div>
                <Badge variant={
                  request.status === 'approved' ? 'default' :
                  request.status === 'rejected' ? 'outline' : 'outline'
                }>
                  {request.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Farm Details</h5>
                  <div className="space-y-1 text-sm">
                    <p><MapPin className="inline h-4 w-4 mr-1" />{request.farmLocation}</p>
                    <p><Target className="inline h-4 w-4 mr-1" />{request.farmSize} acres</p>
                    <p><Activity className="inline h-4 w-4 mr-1" />{request.experienceYears} years experience</p>
                    <p><Star className="inline h-4 w-4 mr-1" />Crops: {request.primaryCrops.join(', ')}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Document Status</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      {request.documents.idProof ? 
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> :
                        <XCircle className="h-4 w-4 text-red-600 mr-2" />
                      }
                      ID Proof
                    </div>
                    <div className="flex items-center">
                      {request.documents.landOwnership ? 
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> :
                        <XCircle className="h-4 w-4 text-red-600 mr-2" />
                      }
                      Land Ownership
                    </div>
                    <div className="flex items-center">
                      {request.documents.bankDetails ? 
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> :
                        <XCircle className="h-4 w-4 text-red-600 mr-2" />
                      }
                      Bank Details
                    </div>
                    <div className="flex items-center">
                      {request.documents.cropCertificates ? 
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> :
                        <XCircle className="h-4 w-4 text-red-600 mr-2" />
                      }
                      Crop Certificates
                    </div>
                  </div>
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                  <div className="flex-1">
                    <Textarea placeholder="Review notes (optional)" className="w-full" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveOnboarding(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRejectOnboarding(request.id)}
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {request.reviewNotes && (
                <div className="pt-4 border-t">
                  <h5 className="font-medium mb-2">Review Notes</h5>
                  <p className="text-sm text-gray-600">{request.reviewNotes}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderYieldAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Yield Analytics</h3>
      <Card className="p-6">
        <p className="text-gray-600">Yield analytics data will be displayed here when integrated with the backend system.</p>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">System Reports</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">User Activity Report</h4>
              <p className="text-sm text-gray-600 mt-1">Daily active users and engagement metrics</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <Button variant="outline" className="w-full mt-4">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Worker Management Report</h4>
              <p className="text-sm text-gray-600 mt-1">Worker performance and analytics</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <Button variant="outline" className="w-full mt-4">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Financial Summary</h4>
              <p className="text-sm text-gray-600 mt-1">Revenue and expense analytics</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
          <Button variant="outline" className="w-full mt-4">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </Card>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Admin Settings</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold mb-4">System Configuration</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">System Maintenance Mode</label>
              <Button variant="outline">Toggle Maintenance</Button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Auto-approval Threshold</label>
              <Input type="number" placeholder="Enter threshold value" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Notifications</label>
              <Button variant="outline">Configure Notifications</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4">Security Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Password</label>
              <Button variant="outline">Change Password</Button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Two-Factor Authentication</label>
              <Button variant="outline">Enable 2FA</Button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Session Timeout</label>
              <Input type="number" placeholder="Minutes" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUserManagement();
      case 'workers':
        return renderWorkerManagement();
      case 'jobs':
        return renderJobTypes();
      case 'provisions':
        return renderProvisions();
      case 'onboarding':
        return renderOnboardingApprovals();
      case 'yields':
        return renderYieldAnalytics();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedNavigation
          items={navigationItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;