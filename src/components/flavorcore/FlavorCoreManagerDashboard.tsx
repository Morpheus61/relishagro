import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  RefreshCw,
  Filter,
  Search,
  Clock,
  User,
  MapPin,
  Star,
  Award,
  Activity,
  TrendingUp,
  BarChart,
  PieChart,
  Target,
  Zap,
  Settings,
  Bell,
  Calendar,
  FileText,
  Database,
  Shield,
  Layers,
  Clipboard,
  Package,
  Scale,
  Thermometer,
  Droplets,
  Sun,
  CloudRain,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
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

// Data interfaces
interface QualityTest {
  id: string;
  batchId: string;
  productName: string;
  testType: string;
  testDate: string;
  inspector: string;
  status: 'passed' | 'failed' | 'pending' | 'requires_retest';
  score: number;
  maxScore: number;
  notes?: string;
  parameters: {
    moisture: number;
    pH: number;
    temperature: number;
    appearance: string;
    texture: string;
    color: string;
  };
}

interface ProcessingBatch {
  id: string;
  productName: string;
  batchSize: number;
  unit: string;
  startDate: string;
  expectedCompletion: string;
  currentStage: string;
  progress: number;
  assignedOperator: string;
  qualityChecksPassed: number;
  totalQualityChecks: number;
  status: 'processing' | 'completed' | 'on_hold' | 'failed';
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    supplier: string;
  }[];
}

interface ComplianceRecord {
  id: string;
  regulationType: string;
  checkDate: string;
  inspector: string;
  status: 'compliant' | 'non_compliant' | 'pending_review';
  score: number;
  issues: string[];
  correctiveActions: string[];
  dueDate?: string;
  resolved: boolean;
}

interface InventoryItem {
  id: string;
  name: string;
  category: 'raw_material' | 'packaging' | 'finished_product' | 'equipment';
  currentStock: number;
  unit: string;
  minimumThreshold: number;
  lastUpdated: string;
  supplier?: string;
  expiryDate?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

const FlavorCoreManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [qualityTests, setQualityTests] = useState<QualityTest[]>([]);
  const [processingBatches, setProcessingBatches] = useState<ProcessingBatch[]>([]);
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Navigation items
  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview' },
    { id: 'quality', label: 'Quality Control' },
    { id: 'processing', label: 'Processing Monitor' },
    { id: 'compliance', label: 'Compliance Tracking' },
    { id: 'inventory', label: 'Inventory Management' },
    { id: 'reports', label: 'Production Reports' },
    { id: 'settings', label: 'System Settings' }
  ];

  // API Functions
  const fetchQualityTests = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/quality/tests`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setQualityTests(data);
      } else {
        // Fallback mock data
        setQualityTests([
          {
            id: '1',
            batchId: 'BTH-2024-001',
            productName: 'Premium Tomato Sauce',
            testType: 'Final Quality Check',
            testDate: '2024-03-15',
            inspector: 'Dr. Sarah Johnson',
            status: 'passed',
            score: 92,
            maxScore: 100,
            parameters: {
              moisture: 85.2,
              pH: 4.2,
              temperature: 22.5,
              appearance: 'Excellent',
              texture: 'Smooth',
              color: 'Deep Red'
            }
          },
          {
            id: '2',
            batchId: 'BTH-2024-002',
            productName: 'Organic Salsa Verde',
            testType: 'Microbiological Test',
            testDate: '2024-03-14',
            inspector: 'Mike Chen',
            status: 'requires_retest',
            score: 78,
            maxScore: 100,
            notes: 'Minor pH variance detected, retest required',
            parameters: {
              moisture: 82.1,
              pH: 3.8,
              temperature: 23.1,
              appearance: 'Good',
              texture: 'Chunky',
              color: 'Bright Green'
            }
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching quality tests:', err);
      setQualityTests([]);
    }
  };

  const fetchProcessingBatches = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/processing/batches`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setProcessingBatches(data);
      } else {
        // Fallback mock data
        setProcessingBatches([
          {
            id: '1',
            productName: 'Premium Tomato Sauce',
            batchSize: 5000,
            unit: 'liters',
            startDate: '2024-03-10',
            expectedCompletion: '2024-03-17',
            currentStage: 'Quality Testing',
            progress: 85,
            assignedOperator: 'John Martinez',
            qualityChecksPassed: 8,
            totalQualityChecks: 10,
            status: 'processing',
            ingredients: [
              { name: 'Tomatoes', quantity: 3000, unit: 'kg', supplier: 'Valley Fresh Farms' },
              { name: 'Onions', quantity: 500, unit: 'kg', supplier: 'Local Produce Co.' }
            ]
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching processing batches:', err);
      setProcessingBatches([]);
    }
  };

  const fetchComplianceRecords = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/compliance/records`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setComplianceRecords(data);
      } else {
        // Fallback mock data
        setComplianceRecords([
          {
            id: '1',
            regulationType: 'FDA Food Safety',
            checkDate: '2024-03-01',
            inspector: 'FDA Inspector Johnson',
            status: 'compliant',
            score: 95,
            issues: [],
            correctiveActions: [],
            resolved: true
          },
          {
            id: '2',
            regulationType: 'HACCP Compliance',
            checkDate: '2024-03-05',
            inspector: 'Internal Audit Team',
            status: 'non_compliant',
            score: 78,
            issues: [
              'Temperature logging gaps in cold storage',
              'Missing documentation for batch BTH-2024-001'
            ],
            correctiveActions: [
              'Install automated temperature monitoring',
              'Update documentation procedures'
            ],
            dueDate: '2024-03-20',
            resolved: false
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching compliance records:', err);
      setComplianceRecords([]);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/inventory`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      } else {
        // Fallback mock data
        setInventory([
          {
            id: '1',
            name: 'Tomatoes - Grade A',
            category: 'raw_material',
            currentStock: 15000,
            unit: 'kg',
            minimumThreshold: 5000,
            lastUpdated: '2024-03-15',
            supplier: 'Valley Fresh Farms',
            expiryDate: '2024-03-20',
            status: 'in_stock'
          },
          {
            id: '2',
            name: 'Glass Jars - 500ml',
            category: 'packaging',
            currentStock: 2500,
            unit: 'pieces',
            minimumThreshold: 5000,
            lastUpdated: '2024-03-14',
            supplier: 'Container Solutions Inc.',
            status: 'low_stock'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setInventory([]);
    }
  };

  // Calculate statistics
  const totalBatches = processingBatches.length;
  const activeBatches = processingBatches.filter(b => b.status === 'processing').length;
  const pendingQualityTests = qualityTests.filter(t => t.status === 'pending').length;
  const complianceIssues = complianceRecords.filter(c => c.status === 'non_compliant' && !c.resolved).length;
  const lowStockItems = inventory.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length;

  const handleApproveTest = async (testId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/quality/tests/approve/${testId}`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (response.ok) {
        setQualityTests(prev =>
          prev.map(test =>
            test.id === testId ? { ...test, status: 'passed' as const } : test
          )
        );
      }
    } catch (err) {
      console.error('Error approving test:', err);
      // Update locally anyway for demo
      setQualityTests(prev =>
        prev.map(test =>
          test.id === testId ? { ...test, status: 'passed' as const } : test
        )
      );
    }
  };

  const handleRejectTest = async (testId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/quality/tests/reject/${testId}`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (response.ok) {
        setQualityTests(prev =>
          prev.map(test =>
            test.id === testId ? { ...test, status: 'failed' as const } : test
          )
        );
      }
    } catch (err) {
      console.error('Error rejecting test:', err);
      // Update locally anyway for demo
      setQualityTests(prev =>
        prev.map(test =>
          test.id === testId ? { ...test, status: 'failed' as const } : test
        )
      );
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchQualityTests(),
          fetchProcessingBatches(),
          fetchComplianceRecords(),
          fetchInventory()
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FlavorCore dashboard...</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Batches</p>
              <p className="text-3xl font-bold text-blue-600">{activeBatches}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tests</p>
              <p className="text-3xl font-bold text-orange-600">{pendingQualityTests}</p>
            </div>
            <Clipboard className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
        
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliance Issues</p>
              <p className="text-3xl font-bold text-red-600">{complianceIssues}</p>
            </div>
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-yellow-600">{lowStockItems}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Production Efficiency</p>
              <p className="text-3xl font-bold text-green-600">87%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Quality Tests</h3>
          <div className="space-y-3">
            {qualityTests.slice(0, 5).map(test => (
              <div key={test.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{test.productName}</p>
                  <p className="text-sm text-gray-600">{test.testType} - {test.inspector}</p>
                </div>
                <Badge variant={test.status === 'passed' ? 'default' : 'outline'}>
                  {test.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Processing Batches</h3>
          <div className="space-y-4">
            {processingBatches.filter(b => b.status === 'processing').map(batch => (
              <div key={batch.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{batch.productName}</p>
                  <span className="text-sm text-gray-600">{batch.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${batch.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {batch.currentStage} - {batch.assignedOperator}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <p className="font-medium text-red-800">Critical: Out of Stock Items</p>
              <p className="text-sm text-red-600">{inventory.filter(i => i.status === 'out_of_stock').length} raw materials are out of stock and may affect production</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <Clock className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">Warning: Compliance Deadline</p>
              <p className="text-sm text-yellow-600">HACCP corrective actions due in 5 days</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-md">
            <Bell className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-800">Info: Quality Test Required</p>
              <p className="text-sm text-blue-600">Batch BTH-2024-002 requires retesting</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderQualityControl = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Quality Control</h3>
        <div className="flex gap-2">
          <Button>
            <Clipboard className="h-4 w-4 mr-2" />
            New Test
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tests Passed</p>
              <p className="text-3xl font-bold text-green-600">
                {qualityTests.filter(t => t.status === 'passed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tests Failed</p>
              <p className="text-3xl font-bold text-red-600">
                {qualityTests.filter(t => t.status === 'failed').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tests</p>
              <p className="text-3xl font-bold text-orange-600">{pendingQualityTests}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-3xl font-bold text-blue-600">
                {qualityTests.length > 0 
                  ? Math.round(qualityTests.reduce((sum, t) => sum + t.score, 0) / qualityTests.length)
                  : '0'
                }
              </p>
            </div>
            <Star className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search quality tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Product/Batch</th>
                  <th className="text-left p-4">Test Type</th>
                  <th className="text-left p-4">Inspector</th>
                  <th className="text-left p-4">Score</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {qualityTests.map(test => (
                  <tr key={test.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{test.productName}</p>
                        <p className="text-sm text-gray-600">{test.batchId}</p>
                      </div>
                    </td>
                    <td className="p-4">{test.testType}</td>
                    <td className="p-4">{test.inspector}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className="font-medium">{test.score}/{test.maxScore}</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              test.score >= 90 ? 'bg-green-600' :
                              test.score >= 80 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${(test.score / test.maxScore) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={test.status === 'passed' ? 'default' : 'outline'}>
                        {test.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">{test.testDate}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {test.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveTest(test.id)}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectTest(test.id)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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

  const renderProcessingMonitor = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Processing Monitor</h3>
        <div className="flex gap-2">
          <Button>
            <Package className="h-4 w-4 mr-2" />
            New Batch
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {processingBatches.map(batch => (
          <Card key={batch.id} className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold">{batch.productName}</h4>
                  <p className="text-gray-600">
                    Batch Size: {batch.batchSize.toLocaleString()} {batch.unit}
                  </p>
                </div>
                <Badge variant={batch.status === 'processing' ? 'default' : 'outline'}>
                  {batch.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{batch.currentStage}</span>
                      <span className="text-sm font-medium">{batch.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${batch.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Timeline</p>
                  <div className="mt-2 text-sm">
                    <p>Started: {batch.startDate}</p>
                    <p>Expected: {batch.expectedCompletion}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Quality Checks</p>
                  <div className="mt-2">
                    <p className="text-lg font-semibold">
                      {batch.qualityChecksPassed}/{batch.totalQualityChecks}
                    </p>
                    <p className="text-sm text-gray-600">Passed</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Operator</p>
                  <div className="mt-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm">{batch.assignedOperator}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-2">Ingredients</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {batch.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{ingredient.name}</span>
                      <span className="text-sm text-gray-600">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Stage
                </Button>
                <Button variant="outline" size="sm">
                  <Clipboard className="h-4 w-4 mr-2" />
                  Quality Check
                </Button>
                {batch.status === 'on_hold' && (
                  <Button variant="outline" size="sm" className="text-green-600 border-green-600">
                    Resume Processing
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderComplianceTracking = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Compliance Tracking</h3>
        <div className="flex gap-2">
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            New Audit
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Compliance Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliant</p>
              <p className="text-3xl font-bold text-green-600">
                {complianceRecords.filter(c => c.status === 'compliant').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
              <p className="text-3xl font-bold text-red-600">
                {complianceRecords.filter(c => c.status === 'non_compliant').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-orange-600">
                {complianceRecords.filter(c => c.status === 'pending_review').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6">
        {complianceRecords.map(record => (
          <Card key={record.id} className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold">{record.regulationType}</h4>
                  <p className="text-gray-600">Inspector: {record.inspector}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{record.score}/100</p>
                    <p className="text-sm text-gray-600">Compliance Score</p>
                  </div>
                  <Badge variant={record.status === 'compliant' ? 'default' : 'outline'}>
                    {record.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Check Date</p>
                  <p>{record.checkDate}</p>
                  {record.dueDate && (
                    <>
                      <p className="text-sm font-medium text-gray-600 mb-2 mt-3">Due Date</p>
                      <p className="text-red-600">{record.dueDate}</p>
                    </>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600 mb-2">Status</p>
                  <div className="flex items-center justify-end">
                    {record.resolved ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolved
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <XCircle className="h-4 w-4 mr-1" />
                        Unresolved
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {record.issues.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2 text-red-600">Issues Identified</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {record.issues.map((issue, index) => (
                      <li key={index} className="text-red-600">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {record.correctiveActions.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2 text-blue-600">Corrective Actions</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {record.correctiveActions.map((action, index) => (
                      <li key={index} className="text-blue-600">{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Report
                </Button>
                {!record.resolved && record.status === 'non_compliant' && (
                  <Button variant="outline" size="sm" className="text-green-600 border-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Add Notes
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderInventoryManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Inventory Management</h3>
        <div className="flex gap-2">
          <Button>
            <Package className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Stock
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-3xl font-bold text-green-600">
                {inventory.filter(i => i.status === 'in_stock').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600">
                {inventory.filter(i => i.status === 'low_stock').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">
                {inventory.filter(i => i.status === 'out_of_stock').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-3xl font-bold text-gray-600">
                {inventory.filter(i => i.status === 'expired').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-gray-600" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md bg-white">
              <option value="all">All Categories</option>
              <option value="raw_material">Raw Materials</option>
              <option value="packaging">Packaging</option>
              <option value="finished_product">Finished Products</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Item Name</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Current Stock</th>
                  <th className="text-left p-4">Minimum Threshold</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Expiry Date</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.supplier && (
                          <p className="text-sm text-gray-600">{item.supplier}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {item.category.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${
                        item.currentStock <= item.minimumThreshold ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {item.currentStock.toLocaleString()} {item.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.minimumThreshold.toLocaleString()} {item.unit}
                    </td>
                    <td className="p-4">
                      <Badge variant={
                        item.status === 'in_stock' ? 'default' : 
                        item.status === 'low_stock' ? 'outline' :
                        'outline'
                      }>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {item.expiryDate || 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4" />
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

  const renderReports = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Production Reports</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Quality Control Report</h4>
              <p className="text-sm text-gray-600 mt-1">Test results and quality metrics</p>
            </div>
            <Clipboard className="h-8 w-8 text-blue-600" />
          </div>
          <Button variant="outline" className="w-full mt-4">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Production Efficiency</h4>
              <p className="text-sm text-gray-600 mt-1">Batch processing and efficiency metrics</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>  
          <Button variant="outline" className="w-full mt-4">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Compliance Summary</h4>
              <p className="text-sm text-gray-600 mt-1">Regulatory compliance status</p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
          <Button variant="outline" className="w-full mt-4">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Inventory Report</h4>
              <p className="text-sm text-gray-600 mt-1">Stock levels and usage analytics</p>
            </div>
            <Package className="h-8 w-8 text-orange-600" />
          </div>
          <Button variant="outline" className="w-full mt-4">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Cost Analysis</h4>
              <p className="text-sm text-gray-600 mt-1">Production costs and profit margins</p>
            </div>
            <BarChart className="h-8 w-8 text-red-600" />
          </div>
          <Button variant="outline" className="w-full mt-4">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Environmental Impact</h4>
              <p className="text-sm text-gray-600 mt-1">Sustainability and waste metrics</p>
            </div>
            <Layers className="h-8 w-8 text-green-700" />
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
      <h3 className="text-lg font-semibold">System Settings</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Quality Control Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Quality Score Threshold</label>
              <Input type="number" placeholder="85" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Auto-approval Score</label>
              <Input type="number" placeholder="95" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Retest Requirements</label>
              <Button variant="outline">Configure Rules</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4">Processing Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Batch Size Limits</label>
              <Input type="number" placeholder="10000" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Processing Stage Templates</label>
              <Button variant="outline">Manage Templates</Button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Operator Assignments</label>
              <Button variant="outline">Configure Assignments</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4">Inventory Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Low Stock Alert Threshold</label>
              <Input type="number" placeholder="20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expiry Warning Days</label>
              <Input type="number" placeholder="30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Auto-reorder Settings</label>
              <Button variant="outline">Configure Auto-reorder</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4">Compliance Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Audit Frequency</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Semi-annually</option>
                <option>Annually</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notification Settings</label>
              <Button variant="outline">Configure Notifications</Button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Regulatory Updates</label>
              <Button variant="outline">Subscribe to Updates</Button>
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
      case 'quality':
        return renderQualityControl();
      case 'processing':
        return renderProcessingMonitor();
      case 'compliance':
        return renderComplianceTracking();
      case 'inventory':
        return renderInventoryManagement();
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
              <h1 className="text-xl font-semibold text-gray-900">FlavorCore Manager</h1>
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

export default FlavorCoreManagerDashboard;