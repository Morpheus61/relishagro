import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Import UI components with correct paths for flavorcore subfolder
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  Users, 
  DollarSign, 
  CheckCircle,
  XCircle,
  Search,
  Download,
  Eye,
  Edit,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Package,
  Truck,
  FileText,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Activity,
  Settings,
  UserCheck,
  Clipboard
} from 'lucide-react';

// Enhanced Navigation Component for FlavorCore Manager
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
                  activeTab === item.id ? 'bg-purple-50 text-purple-600 font-medium' : ''
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

// FlavorCore Specific Interfaces
interface FlavorCoreStaff {
  id: string;
  staff_id: string;
  full_name: string;
  role: string;
  phone: string;
  daily_wage: number;
  status: 'active' | 'inactive';
  hire_date: string;
  department: 'processing' | 'quality_control' | 'packaging' | 'maintenance';
}

interface AttendanceRecord {
  id: string;
  staff_id: string;
  full_name: string;
  date: string;
  time_in: string;
  time_out?: string;
  hours_worked: number;
  status: 'present' | 'absent' | 'half_day';
  overtime_hours: number;
}

interface WageRecord {
  id: string;
  staff_id: string;
  full_name: string;
  period_start: string;
  period_end: string;
  regular_hours: number;
  overtime_hours: number;
  daily_wage: number;
  gross_pay: number;
  deductions: number;
  net_pay: number;
  status: 'pending' | 'paid';
  paid_date?: string;
}

interface ProductionData {
  batch_id: string;
  lot_id: string;
  product_type: string;
  input_weight: number;
  output_weight: number;
  yield_percentage: number;
  processing_date: string;
  status: 'in_progress' | 'completed' | 'quality_check' | 'approved';
  quality_score: number;
  supervisor_id: string;
}

interface FinishedProductForm {
  id: string;
  batch_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  quality_grade: 'A' | 'B' | 'C';
  packaging_type: string;
  production_date: string;
  expiry_date: string;
  supervisor_id: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  submitted_date: string;
  notes?: string;
}

interface InventoryItem {
  id: string;
  product_name: string;
  current_stock: number;
  unit: string;
  location: string;
  last_updated: string;
  minimum_threshold: number;
  status: 'adequate' | 'low_stock' | 'critical';
}

interface ProcurementRequest {
  id: string;
  requested_by: string;
  item_name: string;
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high';
  purpose: string;
  requested_date: string;
  required_by: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  notes?: string;
}

const FlavorCoreManagerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [flavorCoreStaff, setFlavorCoreStaff] = useState<FlavorCoreStaff[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [wageRecords, setWageRecords] = useState<WageRecord[]>([]);
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [finishedProductForms, setFinishedProductForms] = useState<FinishedProductForm[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [procurementRequests, setProcurementRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API Base URL
  const API_BASE = process.env.REACT_APP_API_URL || 'https://relishagrobackend-production.up.railway.app';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  };

  // API headers with authentication
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // FlavorCore Specific API Functions
  const fetchFlavorCoreStaff = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/flavorcore/staff`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setFlavorCoreStaff(data);
      } else {
        // Mock data for FlavorCore staff
        setFlavorCoreStaff([
          {
            id: '1',
            staff_id: 'FC-001',
            full_name: 'John Martinez',
            role: 'Processing Operator',
            phone: '+1-555-0150',
            daily_wage: 250,
            status: 'active',
            hire_date: '2024-01-15',
            department: 'processing'
          },
          {
            id: '2',
            staff_id: 'FC-002',
            full_name: 'Maria Santos',
            role: 'Quality Controller',
            phone: '+1-555-0151',
            daily_wage: 280,
            status: 'active',
            hire_date: '2024-02-01',
            department: 'quality_control'
          },
          {
            id: '3',
            staff_id: 'FC-003',
            full_name: 'David Chen',
            role: 'Packaging Specialist',
            phone: '+1-555-0152',
            daily_wage: 230,
            status: 'active',
            hire_date: '2024-01-20',
            department: 'packaging'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching FlavorCore staff:', err);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/flavorcore/attendance`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data);
      } else {
        // Mock attendance data
        setAttendanceRecords([
          {
            id: '1',
            staff_id: 'FC-001',
            full_name: 'John Martinez',
            date: '2024-03-15',
            time_in: '08:00',
            time_out: '17:00',
            hours_worked: 8,
            status: 'present',
            overtime_hours: 0
          },
          {
            id: '2',
            staff_id: 'FC-002',
            full_name: 'Maria Santos',
            date: '2024-03-15',
            time_in: '08:15',
            time_out: '17:15',
            hours_worked: 8,
            status: 'present',
            overtime_hours: 0
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching attendance records:', err);
    }
  };

  const fetchProductionData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/flavorcore/production`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setProductionData(data);
      } else {
        // Mock production data
        setProductionData([
          {
            batch_id: 'FC-B-001',
            lot_id: 'HF-L-012',
            product_type: 'Premium Tomato Sauce',
            input_weight: 5000,
            output_weight: 4250,
            yield_percentage: 85,
            processing_date: '2024-03-15',
            status: 'completed',
            quality_score: 92,
            supervisor_id: 'SUP-001'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching production data:', err);
    }
  };

  const fetchFinishedProductForms = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/flavorcore/finished-products`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setFinishedProductForms(data);
      } else {
        // Mock finished product forms
        setFinishedProductForms([
          {
            id: '1',
            batch_id: 'FC-B-001',
            product_name: 'Premium Tomato Sauce',
            quantity: 850,
            unit: 'bottles',
            quality_grade: 'A',
            packaging_type: 'Glass Bottles 500ml',
            production_date: '2024-03-15',
            expiry_date: '2025-03-15',
            supervisor_id: 'SUP-001',
            status: 'pending_approval',
            submitted_date: '2024-03-15',
            notes: 'High quality batch, excellent color and consistency'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching finished product forms:', err);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/flavorcore/inventory`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data);
      } else {
        // Mock inventory data
        setInventoryItems([
          {
            id: '1',
            product_name: 'Premium Tomato Sauce',
            current_stock: 1250,
            unit: 'bottles',
            location: 'Warehouse A-1',
            last_updated: '2024-03-15',
            minimum_threshold: 200,
            status: 'adequate'
          },
          {
            id: '2',
            product_name: 'Organic Onion Paste',
            current_stock: 85,
            unit: 'jars',
            location: 'Warehouse A-2',
            last_updated: '2024-03-14',
            minimum_threshold: 100,
            status: 'low_stock'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching inventory items:', err);
    }
  };

  const fetchProcurementRequests = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/flavorcore/procurement-requests`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setProcurementRequests(data);
      } else {
        // Mock procurement requests
        setProcurementRequests([
          {
            id: '1',
            requested_by: 'HF-Manager',
            item_name: 'Industrial Salt',
            quantity: 500,
            unit: 'kg',
            urgency: 'medium',
            purpose: 'Tomato sauce production',
            requested_date: '2024-03-14',
            required_by: '2024-03-20',
            status: 'pending',
            notes: 'Food grade industrial salt for processing'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching procurement requests:', err);
    }
  };

  // FlavorCore Manager specific actions
  const approveFinishedProduct = async (formId: string, notes: string = '') => {
    try {
      const response = await fetch(`${API_BASE}/api/flavorcore/approve-finished-product/${formId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          approved_by: user?.staff_id,
          notes 
        })
      });

      if (response.ok) {
        setFinishedProductForms(prev => 
          prev.map(form => 
            form.id === formId 
              ? { ...form, status: 'approved' as const }
              : form
          )
        );
        
        // Add to inventory after approval
        const approvedForm = finishedProductForms.find(f => f.id === formId);
        if (approvedForm) {
          await addToInventory(approvedForm);
        }
      }
    } catch (err) {
      console.error('Error approving finished product:', err);
    }
  };

  const addToInventory = async (product: FinishedProductForm) => {
    try {
      const response = await fetch(`${API_BASE}/api/flavorcore/add-to-inventory`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          product_name: product.product_name,
          quantity: product.quantity,
          unit: product.unit,
          batch_id: product.batch_id,
          production_date: product.production_date,
          expiry_date: product.expiry_date,
          quality_grade: product.quality_grade
        })
      });

      if (response.ok) {
        await fetchInventoryItems(); // Refresh inventory
      }
    } catch (err) {
      console.error('Error adding to inventory:', err);
    }
  };

  const respondToProcurementRequest = async (requestId: string, status: 'approved' | 'rejected', notes: string = '') => {
    try {
      const response = await fetch(`${API_BASE}/api/flavorcore/respond-procurement/${requestId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          status,
          response_by: user?.staff_id,
          notes 
        })
      });

      if (response.ok) {
        setProcurementRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: status as any }
              : req
          )
        );
      }
    } catch (err) {
      console.error('Error responding to procurement request:', err);
    }
  };

  // Navigation items for FlavorCore Manager
  const navigationItems = [
    { id: 'overview', label: 'Processing Overview' },
    { id: 'staff', label: 'FlavorCore Staff' },
    { id: 'attendance', label: 'Daily Attendance' },
    { id: 'wages', label: 'Wages & Salaries' },
    { id: 'production', label: 'Production Data' },
    { id: 'approvals', label: 'Product Approvals' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'procurement', label: 'Procurement Requests' }
  ];

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchFlavorCoreStaff(),
          fetchAttendanceRecords(),
          fetchProductionData(),
          fetchFinishedProductForms(),
          fetchInventoryItems(),
          fetchProcurementRequests()
        ]);
      } catch (err: any) {
        console.error('Error fetching FlavorCore data:', err);
        setError(`Error loading dashboard: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Calculate dashboard statistics
  const totalStaff = flavorCoreStaff.length;
  const activeStaff = flavorCoreStaff.filter(s => s.status === 'active').length;
  const todayAttendance = attendanceRecords.filter(a => a.date === new Date().toISOString().split('T')[0]);
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const pendingApprovals = finishedProductForms.filter(f => f.status === 'pending_approval').length;
  const pendingProcurement = procurementRequests.filter(r => r.status === 'pending').length;
  const lowStockItems = inventoryItems.filter(i => i.status === 'low_stock' || i.status === 'critical').length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FlavorCore Manager Dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-8">
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
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">FlavorCore Staff</p>
              <p className="text-3xl font-bold text-purple-600">{activeStaff}/{totalStaff}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-3xl font-bold text-green-600">{presentToday}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-orange-600">{pendingApprovals}</p>
            </div>
            <Clipboard className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-red-600">{lowStockItems}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Current Processing Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-purple-600" />
            Current Production
          </h3>
          <div className="space-y-4">
            {productionData.slice(0, 3).map(batch => (
              <div key={batch.batch_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{batch.batch_id}</h4>
                    <p className="text-sm text-gray-600">{batch.product_type}</p>
                  </div>
                  <Badge variant={batch.status === 'completed' ? 'default' : 'outline'}>
                    {batch.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Yield:</span>
                    <span className="ml-2 font-medium">{batch.yield_percentage}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quality:</span>
                    <span className="ml-2 font-medium">{batch.quality_score}/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Pending Actions
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div>
                <p className="font-medium text-orange-800">Product Approvals</p>
                <p className="text-sm text-orange-600">{pendingApprovals} forms awaiting approval</p>
              </div>
              <Badge variant="outline" className="border-orange-300 text-orange-700">
                {pendingApprovals}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">Procurement Requests</p>
                <p className="text-sm text-blue-600">{pendingProcurement} requests pending response</p>
              </div>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                {pendingProcurement}
              </Badge>
            </div>
            
            {lowStockItems > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <p className="font-medium text-red-800">Low Stock Alert</p>
                  <p className="text-sm text-red-600">{lowStockItems} items need restocking</p>
                </div>
                <Badge variant="outline" className="border-red-300 text-red-700">
                  {lowStockItems}
                </Badge>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderStaffManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">FlavorCore Staff Management</h3>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Staff List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing Staff</p>
              <p className="text-2xl font-bold text-purple-600">
                {flavorCoreStaff.filter(s => s.department === 'processing').length}
              </p>
            </div>
            <Settings className="h-6 w-6 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quality Control</p>
              <p className="text-2xl font-bold text-green-600">
                {flavorCoreStaff.filter(s => s.department === 'quality_control').length}
              </p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Packaging</p>
              <p className="text-2xl font-bold text-blue-600">
                {flavorCoreStaff.filter(s => s.department === 'packaging').length}
              </p>
            </div>
            <Package className="h-6 w-6 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">
                {flavorCoreStaff.filter(s => s.department === 'maintenance').length}
              </p>
            </div>
            <Settings className="h-6 w-6 text-yellow-600" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold mb-4">Staff Directory</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Staff</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Department</th>
                  <th className="text-left p-4">Daily Wage</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flavorCoreStaff.map(staff => (
                  <tr key={staff.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{staff.full_name}</p>
                        <p className="text-sm text-gray-600">{staff.staff_id} • {staff.phone}</p>
                      </div>
                    </td>
                    <td className="p-4">{staff.role}</td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {staff.department.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">₹{staff.daily_wage}/day</td>
                    <td className="p-4">
                      <Badge variant={staff.status === 'active' ? 'default' : 'outline'}>
                        {staff.status}
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

  const renderProductApprovals = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Finished Product Approvals</h3>
        <Badge variant="outline" className="border-orange-300 text-orange-700">
          {pendingApprovals} Pending Reviews
        </Badge>
      </div>

      <div className="grid gap-6">
        {finishedProductForms.map(form => (
          <Card key={form.id} className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold">{form.product_name}</h4>
                  <p className="text-gray-600">Batch: {form.batch_id} • Supervisor: {form.supervisor_id}</p>
                </div>
                <Badge variant={
                  form.status === 'approved' ? 'default' :
                  form.status === 'rejected' ? 'outline' : 'outline'
                }>
                  {form.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Product Details</h5>
                  <div className="space-y-1 text-sm">
                    <p><Package className="inline h-4 w-4 mr-1" />Quantity: {form.quantity} {form.unit}</p>
                    <p><CheckCircle className="inline h-4 w-4 mr-1" />Grade: {form.quality_grade}</p>
                    <p><Calendar className="inline h-4 w-4 mr-1" />Production: {form.production_date}</p>
                    <p><Clock className="inline h-4 w-4 mr-1" />Expiry: {form.expiry_date}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Packaging</h5>
                  <div className="space-y-1 text-sm">
                    <p><Package className="inline h-4 w-4 mr-1" />{form.packaging_type}</p>
                    <p><Calendar className="inline h-4 w-4 mr-1" />Submitted: {form.submitted_date}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Notes</h5>
                  <p className="text-sm text-gray-600">
                    {form.notes || 'No additional notes provided'}
                  </p>
                </div>
              </div>

              {form.status === 'pending_approval' && (
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                  <div className="flex-1">
                    <Textarea 
                      placeholder="Approval notes (optional)" 
                      className="w-full" 
                      id={`notes-${form.id}`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const notes = (document.getElementById(`notes-${form.id}`) as HTMLTextAreaElement)?.value || '';
                        approveFinishedProduct(form.id, notes);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Add to Inventory
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Inventory Management</h3>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Inventory
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-blue-600">{inventoryItems.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Adequate Stock</p>
              <p className="text-3xl font-bold text-green-600">
                {inventoryItems.filter(i => i.status === 'adequate').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-red-600">{lowStockItems}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h4 className="text-lg font-semibold mb-4">Current Inventory</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4">Current Stock</th>
                  <th className="text-left p-4">Location</th>
                  <th className="text-left p-4">Minimum Threshold</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-medium">{item.product_name}</p>
                    </td>
                    <td className="p-4">{item.current_stock} {item.unit}</td>
                    <td className="p-4">{item.location}</td>
                    <td className="p-4">{item.minimum_threshold} {item.unit}</td>
                    <td className="p-4">
                      <Badge variant={
                        item.status === 'adequate' ? 'default' : 
                        item.status === 'low_stock' ? 'outline' : 'outline'
                      }>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">{item.last_updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderProcurementRequests = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Procurement Requests from HarvestFlow</h3>
        <Badge variant="outline" className="border-blue-300 text-blue-700">
          {pendingProcurement} Pending Responses
        </Badge>
      </div>

      <div className="grid gap-6">
        {procurementRequests.map(request => (
          <Card key={request.id} className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold">{request.item_name}</h4>
                  <p className="text-gray-600">Requested by: {request.requested_by}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={
                    request.urgency === 'high' ? 'default' :
                    request.urgency === 'medium' ? 'outline' : 'outline'
                  }>
                    {request.urgency} priority
                  </Badge>
                  <Badge variant={
                    request.status === 'approved' ? 'default' :
                    request.status === 'rejected' ? 'outline' : 'outline'
                  }>
                    {request.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Request Details</h5>
                  <div className="space-y-1 text-sm">
                    <p><Package className="inline h-4 w-4 mr-1" />Quantity: {request.quantity} {request.unit}</p>
                    <p><FileText className="inline h-4 w-4 mr-1" />Purpose: {request.purpose}</p>
                    <p><Calendar className="inline h-4 w-4 mr-1" />Requested: {request.requested_date}</p>
                    <p><Clock className="inline h-4 w-4 mr-1" />Required by: {request.required_by}</p>
                  </div>
                </div>
                
                {request.notes && (
                  <div>
                    <h5 className="font-medium mb-2">Additional Notes</h5>
                    <p className="text-sm text-gray-600">{request.notes}</p>
                  </div>
                )}
              </div>

              {request.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                  <div className="flex-1">
                    <Textarea 
                      placeholder="Response notes (optional)" 
                      className="w-full" 
                      id={`response-notes-${request.id}`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const notes = (document.getElementById(`response-notes-${request.id}`) as HTMLTextAreaElement)?.value || '';
                        respondToProcurementRequest(request.id, 'approved', notes);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Request
                    </Button>
                    <Button
                      onClick={() => {
                        const notes = (document.getElementById(`response-notes-${request.id}`) as HTMLTextAreaElement)?.value || '';
                        respondToProcurementRequest(request.id, 'rejected', notes);
                      }}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Request
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'staff':
        return renderStaffManagement();
      case 'attendance':
        return <div className="p-8 text-center text-gray-600">Attendance management coming soon...</div>;
      case 'wages':
        return <div className="p-8 text-center text-gray-600">Wages & salary management coming soon...</div>;
      case 'production':
        return <div className="p-8 text-center text-gray-600">Production data analytics coming soon...</div>;
      case 'approvals':
        return renderProductApprovals();
      case 'inventory':
        return renderInventory();
      case 'procurement':
        return renderProcurementRequests();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* SINGLE CLEAN HEADER */}
      <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <img 
                src="/flavorcore-logo.png" 
                alt="FlavorCore Logo" 
                className="h-10 w-10 rounded-lg bg-white/10 p-1"
                onError={(e) => {
                  console.error('Logo failed to load from /flavorcore-logo.png');
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-xl font-bold">FlavorCore Agricultural Management</h1>
                <p className="text-purple-100 text-sm">Post-Harvest Processing Dashboard</p>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">Welcome, {user?.full_name || 'User'}</p>
                <p className="text-purple-100 text-sm">
                  FlavorCore Manager ({user?.staff_id})
                </p>
              </div>
              <Button 
                onClick={logout}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN DASHBOARD CONTENT */}
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

export default FlavorCoreManagerDashboard;