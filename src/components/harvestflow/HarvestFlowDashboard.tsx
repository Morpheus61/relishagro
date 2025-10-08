import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { RFIDScanner } from '../shared/RFIDScanner';
import api from '../../lib/api';
import { Package, Users, Clipboard, TrendingUp, Truck, MapPin } from 'lucide-react';

interface HarvestFlowDashboardProps {
  userId: string;
  userRole: string;
  onLogout: () => void;
}

interface Worker {
  id: string;
  staff_id: string;
  full_name: string;
}

interface JobType {
  id: string;
  job_name: string;
  category: string;
}

interface LotData {
  lotId: string;
  crop: string;
  rawWeight: number;
  threshedWeight: number;
  workers: string[];
  bags: BagData[];
  status: 'harvesting' | 'processing' | 'ready' | 'dispatched';
}

interface BagData {
  bagId: string;
  tagId: string;
  weight: number;
  timestamp: number;
}

export function HarvestFlowDashboard({ userId, userRole, onLogout }: HarvestFlowDashboardProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'harvest' | 'lots' | 'dispatch' | 'wages'>('daily');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [workersData, jobsData] = await Promise.all([
        api.getWorkers(),
        api.getJobTypes()
      ]);
      
      setWorkers(workersData || []);
      setJobTypes(jobsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'daily':
        return <DailyWorkTab workers={workers} jobTypes={jobTypes} userId={userId} />;
      case 'harvest':
        return <HarvestJobTab workers={workers} userId={userId} />;
      case 'lots':
        return <LotsManagementTab />;
      case 'dispatch':
        return <DispatchManagementTab />;
      case 'wages':
        return <WagesTab workers={workers} />;
      default:
        return <DailyWorkTab workers={workers} jobTypes={jobTypes} userId={userId} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading HarvestFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">HarvestFlow Manager</h1>
            <p className="text-orange-200">Estate Operations Management</p>
          </div>
          <Button onClick={onLogout} className="bg-orange-800 hover:bg-orange-900">
            Logout
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-md overflow-x-auto">
        <div className="flex gap-2 p-4 min-w-max">
          <TabButton active={activeTab === 'daily'} onClick={() => setActiveTab('daily')}>
            📋 Daily Work
          </TabButton>
          <TabButton active={activeTab === 'harvest'} onClick={() => setActiveTab('harvest')}>
            🌾 Harvest Jobs
          </TabButton>
          <TabButton active={activeTab === 'lots'} onClick={() => setActiveTab('lots')}>
            📦 Lot Management
          </TabButton>
          <TabButton active={activeTab === 'dispatch'} onClick={() => setActiveTab('dispatch')}>
            🚛 Dispatch
          </TabButton>
          <TabButton active={activeTab === 'wages'} onClick={() => setActiveTab('wages')}>
            💰 Wages
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

// Daily Work Assignment Tab
function DailyWorkTab({ workers, jobTypes, userId }: { workers: Worker[]; jobTypes: JobType[]; userId: string }) {
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [area, setArea] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleWorkerToggle = (workerId: string) => {
    setSelectedWorkers(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedJob || selectedWorkers.length === 0) {
      alert('Please select job type and at least one worker');
      return;
    }

    setSubmitting(true);
    try {
      await api.assignDailyWork({
        job_type_id: selectedJob,
        worker_ids: selectedWorkers,
        area_notes: area,
        assigned_by: userId,
        date: new Date().toISOString().split('T')[0]
      });

      alert('Daily work assigned successfully!');
      setSelectedJob('');
      setSelectedWorkers([]);
      setArea('');
    } catch (error: any) {
      alert('Failed to assign work: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">📋 Assign Daily Work</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Job Type:</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Choose job type...</option>
              {jobTypes.map(job => (
                <option key={job.id} value={job.id}>
                  {job.job_name} ({job.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Area/Location Notes:</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="e.g., North Block A, Section 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Workers ({selectedWorkers.length} selected):
            </label>
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
              {workers.map(worker => (
                <label key={worker.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedWorkers.includes(worker.id)}
                    onChange={() => handleWorkerToggle(worker.id)}
                    className="w-5 h-5"
                  />
                  <span className="flex-1">{worker.full_name}</span>
                  <span className="text-sm text-gray-500">{worker.staff_id}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-orange-600 hover:bg-orange-700 h-12"
          >
            {submitting ? 'Assigning...' : 'Assign Work'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Harvest Job Tab with Lot Creation
function HarvestJobTab({ workers, userId }: { workers: Worker[]; userId: string }) {
  const [step, setStep] = useState<'create' | 'rfid' | 'dispatch'>('create');
  const [lotData, setLotData] = useState<Partial<LotData>>({
    bags: [],
    workers: []
  });
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  const handleCreateLot = async (data: any) => {
    try {
      const lotId = `LOT-${data.crop.toUpperCase()}-${Date.now()}`;
      
      const newLot = {
        lotId,
        crop: data.crop,
        rawWeight: data.rawWeight,
        threshedWeight: data.threshedWeight,
        workers: data.workers,
        bags: [],
        status: 'processing' as const
      };

      setLotData(newLot);
      
      // Save to backend
      await api.createLot({
        lot_id: lotId,
        crop: data.crop,
        raw_weight: data.rawWeight,
        threshed_weight: data.threshedWeight,
        worker_ids: data.workers,
        created_by: userId,
        status: 'processing'
      });

      setShowDispatchModal(true);
      
    } catch (error: any) {
      alert('Failed to create lot: ' + error.message);
    }
  };

  const handleDispatchDecision = (decision: 'dispatch' | 'hold') => {
    setShowDispatchModal(false);
    
    if (decision === 'dispatch') {
      setStep('rfid');
    } else {
      // Hold stock - update lot status
      api.updateLotStatus(lotData.lotId!, 'ready');
      alert(`Lot ${lotData.lotId} marked as Ready - Holding at HarvestFlow`);
      resetForm();
    }
  };

  const resetForm = () => {
    setStep('create');
    setLotData({ bags: [], workers: [] });
  };

  if (step === 'rfid' && lotData.lotId) {
    return <RFIDTaggingScreen lotData={lotData} onComplete={() => setStep('dispatch')} onBack={resetForm} />;
  }

  if (step === 'dispatch' && lotData.lotId) {
    return <DispatchScreen lotData={lotData} onComplete={resetForm} onBack={() => setStep('rfid')} />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">🌾 Create Harvest Lot</h2>
        <HarvestForm workers={workers} onSubmit={handleCreateLot} />
      </Card>

      {/* Dispatch Decision Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-8 max-w-md mx-4">
            <h3 className="text-2xl font-bold mb-4">Lot Created Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Lot ID: <span className="font-mono font-semibold">{lotData.lotId}</span>
            </p>
            <p className="mb-6">What would you like to do next?</p>
            
            <div className="space-y-3">
              <Button
                onClick={() => handleDispatchDecision('dispatch')}
                className="w-full bg-green-600 hover:bg-green-700 h-16 text-lg"
              >
                <Truck className="mr-3" size={24} />
                Proceed to Dispatch
              </Button>
              <Button
                onClick={() => handleDispatchDecision('hold')}
                className="w-full bg-blue-600 hover:bg-blue-700 h-16 text-lg"
              >
                <Package className="mr-3" size={24} />
                Hold Stock at HarvestFlow
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Harvest Form Component
function HarvestForm({ workers, onSubmit }: { workers: Worker[]; onSubmit: (data: any) => void }) {
  const [crop, setCrop] = useState('');
  const [rawWeight, setRawWeight] = useState('');
  const [threshedWeight, setThreshedWeight] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);

  const crops = ['Cloves', 'Black Pepper', 'Nutmeg', 'Cardamom', 'Cinnamon', 'Coconut', 'Areca Nut'];

  const handleSubmit = () => {
    if (!crop || !rawWeight || !threshedWeight || selectedWorkers.length === 0) {
      alert('Please fill all fields and select at least one worker');
      return;
    }

    onSubmit({
      crop,
      rawWeight: parseFloat(rawWeight),
      threshedWeight: parseFloat(threshedWeight),
      workers: selectedWorkers
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Crop Type:</label>
        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="w-full p-3 border rounded-lg"
        >
          <option value="">Select crop...</option>
          {crops.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Raw Weight (kg):</label>
          <input
            type="number"
            step="0.1"
            value={rawWeight}
            onChange={(e) => setRawWeight(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="0.0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Threshed Weight (kg):</label>
          <input
            type="number"
            step="0.1"
            value={threshedWeight}
            onChange={(e) => setThreshedWeight(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="0.0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Workers ({selectedWorkers.length} selected):
        </label>
        <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
          {workers.map(worker => (
            <label key={worker.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selectedWorkers.includes(worker.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedWorkers([...selectedWorkers, worker.id]);
                  } else {
                    setSelectedWorkers(selectedWorkers.filter(id => id !== worker.id));
                  }
                }}
                className="w-5 h-5"
              />
              <span className="flex-1">{worker.full_name}</span>
              <span className="text-sm text-gray-500">{worker.staff_id}</span>
            </label>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full bg-orange-600 hover:bg-orange-700 h-12"
      >
        Create Lot
      </Button>
    </div>
  );
}

// RFID Tagging Screen
function RFIDTaggingScreen({ lotData, onComplete, onBack }: { 
  lotData: Partial<LotData>; 
  onComplete: () => void; 
  onBack: () => void;
}) {
  const [bags, setBags] = useState<BagData[]>([]);
  const [totalBags, setTotalBags] = useState('');

  const handleBagScanned = async (bagData: { tagId: string; bagId: string; weight?: number }) => {
    const newBag: BagData = {
      bagId: bagData.bagId,
      tagId: bagData.tagId,
      weight: bagData.weight || 0,
      timestamp: Date.now()
    };

    setBags([...bags, newBag]);

    // Save to backend
    await api.addBagToLot(lotData.lotId!, newBag);
  };

  const handleComplete = async () => {
    if (totalBags && bags.length < parseInt(totalBags)) {
      if (!confirm(`You've scanned ${bags.length} bags but indicated ${totalBags} total. Continue anyway?`)) {
        return;
      }
    }

    // Update lot with bags
    await api.updateLot(lotData.lotId!, { bags, status: 'ready' });
    onComplete();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">📦 RFID Bag Tagging</h2>
            <p className="text-sm text-gray-600">Lot: {lotData.lotId}</p>
          </div>
          <Button onClick={onBack} className="bg-gray-500 hover:bg-gray-600">
            Back
          </Button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Total Number of Bags (optional):</label>
          <input
            type="number"
            value={totalBags}
            onChange={(e) => setTotalBags(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Enter total bag count"
          />
        </div>

        <RFIDScanner lotId={lotData.lotId!} onScanComplete={handleBagScanned} showWeightInput={true} />

        {bags.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">
              Scanned Bags ({bags.length}{totalBags ? `/${totalBags}` : ''}):
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bags.map((bag, index) => (
                <div key={bag.bagId} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">Bag #{index + 1}</p>
                    <p className="text-xs font-mono text-gray-600">{bag.bagId}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-700">{bag.weight} kg</p>
                    <p className="text-xs text-gray-500">{new Date(bag.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleComplete}
              className="w-full bg-green-600 hover:bg-green-700 h-12 mt-4"
            >
              Complete Tagging & Proceed
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// Dispatch Screen
function DispatchScreen({ lotData, onComplete, onBack }: {
  lotData: Partial<LotData>;
  onComplete: () => void;
  onBack: () => void;
}) {
  const [driver, setDriver] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [destination, setDestination] = useState('FlavorCore Processing Unit');
  const [tracking, setTracking] = useState(false);

  const handleDispatch = async () => {
    if (!driver || !vehicle) {
      alert('Please enter driver and vehicle details');
      return;
    }

    try {
      await api.dispatchLot({
  lot_id: lotData.lotId!,  // Non-null assertion
        driver_name: driver,
        vehicle_number: vehicle,
        destination,
        dispatch_time: new Date().toISOString(),
        status: 'dispatched'
      });

      // Start GPS tracking if available
      if ('geolocation' in navigator) {
        setTracking(true);
        startGPSTracking(lotData.lotId!);
      }

      alert('Lot dispatched successfully!');
      onComplete();
      
    } catch (error: any) {
      alert('Failed to dispatch: ' + error.message);
    }
  };

  const startGPSTracking = (lotId: string) => {
    navigator.geolocation.watchPosition(
      (position) => {
        api.updateGPSLocation(lotId, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now()
        });
      },
      (error) => console.error('GPS error:', error),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">🚛 Dispatch Lot</h2>
            <p className="text-sm text-gray-600">Lot: {lotData.lotId}</p>
          </div>
          <Button onClick={onBack} className="bg-gray-500 hover:bg-gray-600">
            Back
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Bags</p>
              <p className="text-2xl font-bold text-blue-600">{lotData.bags?.length || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Weight</p>
              <p className="text-2xl font-bold text-green-600">
                {lotData.bags?.reduce((sum, bag) => sum + bag.weight, 0).toFixed(1) || 0} kg
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Driver Name:</label>
            <input
              type="text"
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Enter driver name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Vehicle Number:</label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="e.g., KA-01-AB-1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Destination:</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-yellow-600 mt-1" size={20} />
              <div>
                <p className="font-semibold text-yellow-800">GPS Tracking</p>
                <p className="text-sm text-yellow-700">
                  {tracking 
                    ? 'GPS tracking active - Vehicle location will be monitored'
                    : 'GPS tracking will start when dispatch is confirmed'
                  }
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDispatch}
            className="w-full bg-green-600 hover:bg-green-700 h-12"
          >
            <Truck className="mr-2" size={20} />
            Confirm Dispatch
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Placeholder Tabs
function LotsManagementTab() {
  return <Card className="p-6"><h3 className="text-xl font-bold">Lot Management Coming Soon</h3></Card>;
}

function DispatchManagementTab() {
  return <Card className="p-6"><h3 className="text-xl font-bold">Dispatch Management Coming Soon</h3></Card>;
}

function WagesTab({ workers }: { workers: Worker[] }) {
  return <Card className="p-6"><h3 className="text-xl font-bold">Wage Calculation Coming Soon</h3></Card>;
}

// Helper Component
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
        active ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}