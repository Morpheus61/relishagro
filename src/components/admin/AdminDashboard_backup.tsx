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
  XCircle
} from 'lucide-react';

interface AdminDashboardProps {
  userId: string;
  userRole: string;
  onLogout: () => void;
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
      const [onboarding, provisions] = await Promise.all([
        api.getPendingOnboarding(),
        api.getPendingProvisions()
      ]);

      setStats({
        pendingOnboarding: onboarding.count || 0,
        pendingOverrides: 0, // TODO: Add API endpoint
        pendingProvisions: provisions.count || 0,
        totalUsers: 0,
        activeDispatches: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome stats={stats} />;
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
      case 'settings':
        return <SystemSettings />;
      default:
        return <DashboardHome stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-purple-200">Complete System Control</p>
          </div>
          <Button onClick={onLogout} className="bg-purple-800 hover:bg-purple-900">
            Logout
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-md overflow-x-auto">
        <div className="flex gap-2 p-4 min-w-max">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
            🏠 Home
          </NavButton>
          <NavButton active={activeTab === 'yields'} onClick={() => setActiveTab('yields')}>
            📊 Yields {stats.pendingOnboarding > 0 && <Badge>{stats.pendingOnboarding}</Badge>}
          </NavButton>
          <NavButton active={activeTab === 'onboarding'} onClick={() => setActiveTab('onboarding')}>
            👥 Onboarding {stats.pendingOnboarding > 0 && <Badge>{stats.pendingOnboarding}</Badge>}
          </NavButton>
          <NavButton active={activeTab === 'attendance-overrides'} onClick={() => setActiveTab('attendance-overrides')}>
            ✅ Overrides {stats.pendingOverrides > 0 && <Badge>{stats.pendingOverrides}</Badge>}
          </NavButton>
          <NavButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')}>
            📋 Attendance
          </NavButton>
          <NavButton active={activeTab === 'provisions'} onClick={() => setActiveTab('provisions')}>
            📦 Provisions {stats.pendingProvisions > 0 && <Badge>{stats.pendingProvisions}</Badge>}
          </NavButton>
          <NavButton active={activeTab === 'wages'} onClick={() => setActiveTab('wages')}>
            💰 Wages
          </NavButton>
          <NavButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            👨‍💼 Users
          </NavButton>
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
            ⚙️ Settings
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

// Dashboard Home Component
function DashboardHome({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="text-blue-600" size={32} />}
          title="Pending Onboarding"
          value={stats.pendingOnboarding}
          color="blue"
        />
        <StatCard
          icon={<ClipboardCheck className="text-yellow-600" size={32} />}
          title="Override Approvals"
          value={stats.pendingOverrides}
          color="yellow"
        />
        <StatCard
          icon={<Package className="text-green-600" size={32} />}
          title="Provision Requests"
          value={stats.pendingProvisions}
          color="green"
        />
        <StatCard
          icon={<DollarSign className="text-purple-600" size={32} />}
          title="Active Dispatches"
          value={stats.activeDispatches}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700 h-20">
            <div className="text-center">
              <Users size={24} className="mx-auto mb-1" />
              <span>Review Onboarding</span>
            </div>
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 h-20">
            <div className="text-center">
              <Package size={24} className="mx-auto mb-1" />
              <span>Approve Provisions</span>
            </div>
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 h-20">
            <div className="text-center">
              <Download size={24} className="mx-auto mb-1" />
              <span>Export Reports</span>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}

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

// Placeholder components - will be implemented
function OnboardingApprovals() {
  return <Card className="p-6"><h3 className="text-xl font-bold">Onboarding Approvals Coming Soon</h3></Card>;
}

function AttendanceOverrides() {
  return <Card className="p-6"><h3 className="text-xl font-bold">Attendance Override Approvals Coming Soon</h3></Card>;
}

function AllAttendanceRecords() {
  return <Card className="p-6"><h3 className="text-xl font-bold">All Attendance Records Coming Soon</h3></Card>;
}

function ProvisionApprovals() {
  return <Card className="p-6"><h3 className="text-xl font-bold">Provision Approvals Coming Soon</h3></Card>;
}

function WagesReports() {
  return <Card className="p-6"><h3 className="text-xl font-bold">Wages & Financial Reports Coming Soon</h3></Card>;
}

function UserManagement() {
  return <Card className="p-6"><h3 className="text-xl font-bold">User Management Coming Soon</h3></Card>;
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
    // TODO: Save to backend
    localStorage.setItem('yield_settings', JSON.stringify(yieldSettings));
    alert('Yield settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">⚙️ System Settings</h2>

      {/* HarvestFlow Yield Standards */}
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

      {/* FlavorCore Yield Standards */}
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

      {/* Deviation Alert Triggers */}
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

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: number; color: string }) {
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
          <p className="text-3xl font-bold text-gray-900">{value}</p>
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