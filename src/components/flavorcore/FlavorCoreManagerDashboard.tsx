import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import api from '../../lib/api';
import { exportYieldCSV } from '../../lib/exportHelpers';
import { Package, CheckCircle, XCircle, TrendingUp, Users, AlertTriangle } from 'lucide-react';

interface FlavorCoreManagerDashboardProps {
  userId: string;
  userRole: string;
  onLogout: () => void;
}

interface Lot {
  lot_id: string;
  crop: string;
  raw_weight: number;
  threshed_weight: number;
  final_weight?: number;
  status: string;
  processed_date?: string;
  supervisor_id?: string;
}

interface ProvisionRequest {
  id: string;
  item_name: string;
  quantity: number;
  requested_by: string;
  requested_date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function FlavorCoreManagerDashboard({ userId, userRole, onLogout }: FlavorCoreManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lots' | 'provisions' | 'staff' | 'reports'>('dashboard');
  const [pendingLots, setPendingLots] = useState<Lot[]>([]);
  const [pendingProvisions, setPendingProvisions] = useState<ProvisionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [lots, provisions] = await Promise.all([
        api.getLotsForApproval(),
        api.getPendingProvisions()
      ]);
      
      setPendingLots(lots || []);
      setPendingProvisions(provisions || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome lots={pendingLots} provisions={pendingProvisions} />;
      case 'lots':
        return <LotReviewTab lots={pendingLots} onRefresh={loadDashboardData} />;
      case 'provisions':
        return <ProvisionReviewTab provisions={pendingProvisions} onRefresh={loadDashboardData} />;
      case 'staff':
        return <StaffManagementTab />;
      case 'reports':
        return <ReportsTab />;
      default:
        return <DashboardHome lots={pendingLots} provisions={pendingProvisions} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading FlavorCore Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">FlavorCore Manager</h1>
            <p className="text-purple-200">Processing Oversight & Quality Control</p>
          </div>
          <Button onClick={onLogout} className="bg-purple-800 hover:bg-purple-900">
            Logout
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-md overflow-x-auto">
        <div className="flex gap-2 p-4 min-w-max">
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
            🏠 Dashboard
          </TabButton>
          <TabButton active={activeTab === 'lots'} onClick={() => setActiveTab('lots')}>
            📦 Lot Review {pendingLots.length > 0 && <Badge>{pendingLots.length}</Badge>}
          </TabButton>
          <TabButton active={activeTab === 'provisions'} onClick={() => setActiveTab('provisions')}>
            🛒 Provisions {pendingProvisions.length > 0 && <Badge>{pendingProvisions.length}</Badge>}
          </TabButton>
          <TabButton active={activeTab === 'staff'} onClick={() => setActiveTab('staff')}>
            👥 Staff
          </TabButton>
          <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>
            📊 Reports
          </TabButton>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
}

// Dashboard Home
function DashboardHome({ lots, provisions }: { lots: Lot[]; provisions: ProvisionRequest[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Processing Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Package className="text-blue-600" size={32} />}
          title="Pending Lot Reviews"
          value={lots.length}
          color="blue"
        />
        <StatCard
          icon={<AlertTriangle className="text-yellow-600" size={32} />}
          title="Provision Requests"
          value={provisions.length}
          color="yellow"
        />
        <StatCard
          icon={<TrendingUp className="text-green-600" size={32} />}
          title="Active Processing"
          value={lots.filter(l => l.status === 'processing').length}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700 h-16">
            <Package className="mr-2" size={20} />
            Review Pending Lots
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 h-16">
            <CheckCircle className="mr-2" size={20} />
            Approve Provisions
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      {lots.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Recent Lots Awaiting Approval</h3>
          <div className="space-y-3">
            {lots.slice(0, 5).map(lot => (
              <div key={lot.lot_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{lot.lot_id}</p>
                  <p className="text-sm text-gray-600">{lot.crop} - {lot.final_weight || 0} kg final</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                  Pending Review
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Lot Review Tab
function LotReviewTab({ lots, onRefresh }: { lots: Lot[]; onRefresh: () => void }) {
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [notes, setNotes] = useState('');

  const handleApprove = async (lotId: string) => {
    try {
      await api.approveLot(lotId, { approved_by: 'manager', notes });
      alert('Lot approved successfully!');
      setSelectedLot(null);
      setNotes('');
      onRefresh();
    } catch (error: any) {
      alert('Failed to approve lot: ' + error.message);
    }
  };

  const handleReject = async (lotId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.rejectLot(lotId, { rejected_by: 'manager', reason });
      alert('Lot rejected');
      setSelectedLot(null);
      onRefresh();
    } catch (error: any) {
      alert('Failed to reject lot: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Lot Review & Approval</h2>
        <Button onClick={onRefresh} className="bg-purple-600 hover:bg-purple-700">
          Refresh
        </Button>
      </div>

      {lots.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <p className="text-gray-600">No lots pending approval</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {lots.map(lot => (
            <Card key={lot.lot_id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{lot.lot_id}</h3>
                  <p className="text-sm text-gray-600">{lot.crop}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                  {lot.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Raw Weight</p>
                  <p className="text-lg font-bold text-blue-600">{lot.raw_weight} kg</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Threshed</p>
                  <p className="text-lg font-bold text-green-600">{lot.threshed_weight} kg</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Final Product</p>
                  <p className="text-lg font-bold text-purple-600">{lot.final_weight || 'N/A'} kg</p>
                </div>
              </div>

              {selectedLot?.lot_id === lot.lot_id ? (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    rows={3}
                    placeholder="Add approval notes (optional)..."
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(lot.lot_id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2" size={18} />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(lot.lot_id)}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="mr-2" size={18} />
                      Reject
                    </Button>
                    <Button
                      onClick={() => setSelectedLot(null)}
                      className="bg-gray-500 hover:bg-gray-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setSelectedLot(lot)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Review Lot
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Provision Review Tab
function ProvisionReviewTab({ provisions, onRefresh }: { provisions: ProvisionRequest[]; onRefresh: () => void }) {
  const handleApprove = async (id: string) => {
    try {
      await api.approveProvision(id);
      alert('Provision request approved!');
      onRefresh();
    } catch (error: any) {
      alert('Failed to approve: ' + error.message);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.rejectProvision(id, reason);
      alert('Provision request rejected');
      onRefresh();
    } catch (error: any) {
      alert('Failed to reject: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Provision Request Review</h2>

      {provisions.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <p className="text-gray-600">No pending provision requests</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {provisions.map(request => (
            <Card key={request.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{request.item_name}</h3>
                  <p className="text-sm text-gray-600">Quantity: {request.quantity}</p>
                  <p className="text-sm text-gray-600">Requested by: {request.requested_by}</p>
                  <p className="text-sm text-gray-600">Date: {new Date(request.requested_date).toLocaleDateString()}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Pending
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(request.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2" size={18} />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(request.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="mr-2" size={18} />
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Staff Management Tab
function StaffManagementTab() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Staff Management</h2>
      <p className="text-gray-600">Staff onboarding and management features coming soon...</p>
    </Card>
  );
}

// Reports Tab
function ReportsTab() {
  const handleExport = () => {
    // TODO: Fetch actual data
    const sampleData = [
      {
        lot_id: 'LOT-CLOVES-001',
        date_harvested: new Date().toISOString(),
        crop: 'Cloves',
        raw_weight: 100,
        threshed_weight: 75,
        estate_yield_pct: 75,
        final_weight: 25,
        fc_yield_raw: 25,
        fc_yield_threshed: 33
      }
    ];
    
    exportYieldCSV(sampleData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
      
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Export Reports</h3>
        <div className="space-y-3">
          <Button onClick={handleExport} className="w-full bg-purple-600 hover:bg-purple-700 h-12">
            📊 Export Yield Data (CSV)
          </Button>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12">
            📦 Export Inventory (CSV)
          </Button>
          <Button className="w-full bg-green-600 hover:bg-green-700 h-12">
            💰 Export Financial Reports (CSV)
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Helper Components
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
        active ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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