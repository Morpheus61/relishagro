import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { RFIDScanner } from '../shared/RFIDScanner';
import { Smartphone, Package, Beaker, QrCode, CheckCircle, AlertCircle } from 'lucide-react';

interface SupervisorDashboardProps {
  currentUser: {
    id: string;
    staff_id: string;
    full_name: string;
    role: string;
  };
}

interface ProcessingLot {
  lot_id: string;
  crop: string;
  threshed_weight: number;
  bags_scanned: number;
  total_bags?: number;
  status: string;
}

interface DryingSample {
  id: string;
  lot_id: string;
  sample_weight: number;
  product_type: string;
  quality_grade?: string;
  moisture_level?: number;
  notes: string;
  timestamp: string;
}

interface QRLabel {
  lot_id: string;
  qr_code: string;
  product: string;
  final_weight: number;
  traceability_data: any;
}

export function SupervisorDashboard({ currentUser }: SupervisorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rfid' | 'samples' | 'qr' | 'completion'>('dashboard');
  const [assignedLots, setAssignedLots] = useState<ProcessingLot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedLots();
  }, []);

  const loadAssignedLots = async () => {
    try {
      // Using fetch instead of api client
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/supervisor-lots`);
      if (response.ok) {
        const lots = await response.json();
        setAssignedLots(lots || []);
      } else {
        // Mock data for testing
        setAssignedLots([
          { lot_id: 'LOT-2024-001', crop: 'Black Pepper', threshed_weight: 850, bags_scanned: 15, total_bags: 20, status: 'processing' },
          { lot_id: 'LOT-2024-002', crop: 'Cloves', threshed_weight: 650, bags_scanned: 8, total_bags: 12, status: 'processing' },
          { lot_id: 'LOT-2024-003', crop: 'Nutmeg', threshed_weight: 400, bags_scanned: 0, total_bags: 8, status: 'pending' }
        ]);
      }
    } catch (error) {
      console.error('Error loading assigned lots:', error);
      // Mock data fallback
      setAssignedLots([
        { lot_id: 'LOT-2024-001', crop: 'Black Pepper', threshed_weight: 850, bags_scanned: 15, total_bags: 20, status: 'processing' },
        { lot_id: 'LOT-2024-002', crop: 'Cloves', threshed_weight: 650, bags_scanned: 8, total_bags: 12, status: 'processing' },
        { lot_id: 'LOT-2024-003', crop: 'Nutmeg', threshed_weight: 400, bags_scanned: 0, total_bags: 8, status: 'pending' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview lots={assignedLots} setActiveTab={setActiveTab} />;
      case 'rfid':
        return <RFIDInScanTab lots={assignedLots} onRefresh={loadAssignedLots} />;
      case 'samples':
        return <DryingSamplesTab lots={assignedLots} />;
      case 'qr':
        return <QRGenerationTab lots={assignedLots} />;
      case 'completion':
        return <LotCompletionTab lots={assignedLots} onRefresh={loadAssignedLots} />;
      default:
        return <DashboardOverview lots={assignedLots} setActiveTab={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Supervisor Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">FlavorCore Supervisor</h1>
            <p className="text-indigo-200">Processing Floor Operations</p>
            <p className="text-indigo-200 text-sm">Welcome, {currentUser.full_name}</p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-indigo-800 hover:bg-indigo-900"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Simple Tab Navigation */}
      <div className="bg-white shadow-md overflow-x-auto">
        <div className="flex gap-2 p-4 min-w-max">
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
            📊 Dashboard
          </TabButton>
          <TabButton active={activeTab === 'rfid'} onClick={() => setActiveTab('rfid')}>
            📱 RFID Scanning
          </TabButton>
          <TabButton active={activeTab === 'samples'} onClick={() => setActiveTab('samples')}>
            🧪 Drying Samples
          </TabButton>
          <TabButton active={activeTab === 'qr'} onClick={() => setActiveTab('qr')}>
            🏷️ QR Generation
          </TabButton>
          <TabButton active={activeTab === 'completion'} onClick={() => setActiveTab('completion')}>
            ✅ Lot Completion
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

// Dashboard Overview Tab
function DashboardOverview({ lots, setActiveTab }: { lots: ProcessingLot[]; setActiveTab: (tab: 'dashboard' | 'rfid' | 'samples' | 'qr' | 'completion') => void }) {
  const totalLots = lots.length;
  const completedScans = lots.reduce((sum, lot) => sum + lot.bags_scanned, 0);
  const totalBags = lots.reduce((sum, lot) => sum + (lot.total_bags || 0), 0);
  const activeLots = lots.filter(lot => lot.status === 'processing').length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📊 Processing Floor Overview</h2>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-600">Total Lots</p>
              <p className="text-2xl font-bold">{totalLots}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Bags Scanned</p>
              <p className="text-2xl font-bold">{completedScans}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Beaker className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Active Processing</p>
              <p className="text-2xl font-bold">{activeLots}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <QrCode className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Scan Progress</p>
              <p className="text-2xl font-bold">{totalBags > 0 ? Math.round((completedScans / totalBags) * 100) : 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Lots */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">📦 Assigned Lots</h3>
        <div className="space-y-4">
          {lots.map(lot => (
            <div key={lot.lot_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-lg">{lot.lot_id}</h4>
                <p className="text-gray-600">{lot.crop} - {lot.threshed_weight} kg</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Bags Progress</p>
                    <p className="font-semibold">{lot.bags_scanned}/{lot.total_bags || 0}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    lot.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    lot.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lot.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={() => setActiveTab('rfid')}
            className="h-16 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            Start RFID Scanning
          </Button>
          <Button 
            onClick={() => setActiveTab('samples')}
            className="h-16 bg-green-600 hover:bg-green-700 text-white"
          >
            <Beaker className="w-5 h-5 mr-2" />
            Log Drying Sample
          </Button>
          <Button 
            onClick={() => setActiveTab('qr')}
            className="h-16 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Generate QR Label
          </Button>
          <Button 
            onClick={() => setActiveTab('completion')}
            className="h-16 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Complete Lot
          </Button>
        </div>
      </Card>
    </div>
  );
}

// RFID In-Scan Tab
function RFIDInScanTab({ lots, onRefresh }: { lots: ProcessingLot[]; onRefresh: () => void }) {
  const [selectedLot, setSelectedLot] = useState<string>('');
  const [scannedBags, setScannedBags] = useState<any[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);

  const handleBagScanned = async (bagData: { tagId: string; bagId: string; weight?: number }) => {
    try {
      // Record RFID in-scan
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/rfid-in-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lot_id: selectedLot,
          bag_id: bagData.bagId,
          rfid_tag: bagData.tagId,
          weight: bagData.weight || 0,
          scanned_by: 'supervisor',
          timestamp: new Date().toISOString()
        })
      });

      const newBag = {
        ...bagData,
        timestamp: Date.now()
      };

      setScannedBags([...scannedBags, newBag]);
      setTotalWeight(totalWeight + (bagData.weight || 0));

      onRefresh();
    } catch (error: any) {
      alert('Failed to record scan: ' + error.message);
    }
  };

  const startScanSession = () => {
    setSessionActive(true);
    setScannedBags([]);
    setTotalWeight(0);
  };

  const endScanSession = async () => {
    if (scannedBags.length === 0) {
      alert('No bags scanned in this session');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/scan-session-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lot_id: selectedLot,
          bags_scanned: scannedBags.length,
          total_weight: totalWeight,
          session_end: new Date().toISOString()
        })
      });

      alert(`Scan session completed! ${scannedBags.length} bags (${totalWeight.toFixed(1)} kg) recorded.`);
      setSessionActive(false);
      onRefresh();
    } catch (error) {
      console.error('Session completion error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📱 RFID In-Scan Operations</h2>

      {/* Session Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${sessionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="font-semibold">
              Scan Session: {sessionActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          {sessionActive && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Bags Scanned</p>
              <p className="text-xl font-bold text-green-600">{scannedBags.length}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Lot Selection */}
      <Card className="p-6">
        <label className="block text-sm font-medium mb-2">Select Lot to Process:</label>
        <select
          value={selectedLot}
          onChange={(e) => {
            setSelectedLot(e.target.value);
            setScannedBags([]);
            setTotalWeight(0);
            setSessionActive(false);
          }}
          className="w-full p-3 border rounded-lg text-lg"
          disabled={sessionActive}
        >
          <option value="">Choose a lot...</option>
          {lots.map(lot => (
            <option key={lot.lot_id} value={lot.lot_id}>
              {lot.lot_id} - {lot.crop} ({lot.threshed_weight} kg)
            </option>
          ))}
        </select>

        {selectedLot && !sessionActive && (
          <Button
            onClick={startScanSession}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 h-12"
          >
            🚀 Start Scan Session
          </Button>
        )}

        {sessionActive && (
          <Button
            onClick={endScanSession}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 h-12"
          >
            🛑 End Session
          </Button>
        )}
      </Card>

      {selectedLot && sessionActive && (
        <>
          {/* RFID Scanner */}
          <RFIDScanner
            lotId={selectedLot}
            onScanComplete={handleBagScanned}
            showWeightInput={true}
          />

          {/* Scanned Bags Summary */}
          {scannedBags.length > 0 && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Session Progress</h3>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Scanned</p>
                  <p className="text-2xl font-bold text-indigo-600">{scannedBags.length} bags</p>
                  <p className="text-sm text-gray-600">Total Weight: {totalWeight.toFixed(1)} kg</p>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {scannedBags.map((bag, index) => (
                  <div key={bag.bagId} className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">Bag #{index + 1}</p>
                      <p className="text-xs font-mono text-gray-600">{bag.tagId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-indigo-700">{bag.weight} kg</p>
                      <p className="text-xs text-gray-500">{new Date(bag.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// Drying Samples Tab
function DryingSamplesTab({ lots }: { lots: ProcessingLot[] }) {
  const [selectedLot, setSelectedLot] = useState('');
  const [sampleWeight, setSampleWeight] = useState('');
  const [productType, setProductType] = useState('');
  const [qualityGrade, setQualityGrade] = useState('A');
  const [moistureLevel, setMoistureLevel] = useState('');
  const [notes, setNotes] = useState('');
  const [samples, setSamples] = useState<DryingSample[]>([]);

  const handleSubmitSample = async () => {
    if (!selectedLot || !sampleWeight || !productType) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const sample: DryingSample = {
        id: `SAMPLE-${Date.now()}`,
        lot_id: selectedLot,
        sample_weight: parseFloat(sampleWeight),
        product_type: productType,
        quality_grade: qualityGrade,
        moisture_level: moistureLevel ? parseFloat(moistureLevel) : undefined,
        notes,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/drying-samples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sample)
      });
      
      setSamples([...samples, sample]);
      
      // Reset form
      setSampleWeight('');
      setProductType('');
      setQualityGrade('A');
      setMoistureLevel('');
      setNotes('');
      
      alert('Drying sample recorded successfully!');
    } catch (error: any) {
      alert('Failed to record sample: ' + error.message);
    }
  };

  const productTypes = [
    'Whole Cloves',
    'Broken Cloves',
    'Clove Stems',
    'Black Pepper Whole',
    'Black Pepper Powder',
    'Nutmeg Whole',
    'Nutmeg Powder',
    'Cardamom Green',
    'Cardamom Black'
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">🧪 Drying & Sample Logging</h2>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Record Drying Sample</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Lot:</label>
            <select
              value={selectedLot}
              onChange={(e) => setSelectedLot(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Choose lot...</option>
              {lots.map(lot => (
                <option key={lot.lot_id} value={lot.lot_id}>
                  {lot.lot_id} - {lot.crop}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Product Type:</label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select product type...</option>
              {productTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sample Weight (kg):</label>
              <input
                type="number"
                step="0.01"
                value={sampleWeight}
                onChange={(e) => setSampleWeight(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quality Grade:</label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="A">Grade A - Premium</option>
                <option value="B">Grade B - Standard</option>
                <option value="C">Grade C - Basic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Moisture Level % (optional):</label>
            <input
              type="number"
              step="0.1"
              value={moistureLevel}
              onChange={(e) => setMoistureLevel(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="12.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes (optional):</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="Quality observations, drying conditions, etc."
            />
          </div>

          <Button
            onClick={handleSubmitSample}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12"
          >
            <Beaker className="mr-2" size={20} />
            Record Sample
          </Button>
        </div>
      </Card>

      {/* Recorded Samples */}
      {samples.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Today's Samples</h3>
          <div className="space-y-3">
            {samples.map(sample => (
              <div key={sample.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{sample.product_type}</p>
                    <p className="text-sm text-gray-600">Lot: {sample.lot_id}</p>
                    <p className="text-sm text-gray-600">Weight: {sample.sample_weight} kg | Grade: {sample.quality_grade}</p>
                    {sample.moisture_level && <p className="text-sm text-gray-600">Moisture: {sample.moisture_level}%</p>}
                    {sample.notes && <p className="text-sm text-gray-600 mt-1">Notes: {sample.notes}</p>}
                  </div>
                  <p className="text-xs text-gray-500">{new Date(sample.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// QR Label Generation Tab
function QRGenerationTab({ lots }: { lots: ProcessingLot[] }) {
  const [selectedLot, setSelectedLot] = useState('');
  const [qrLabels, setQrLabels] = useState<QRLabel[]>([]);
  const [generating, setGenerating] = useState(false);

  const handleGenerateQR = async () => {
    if (!selectedLot) {
      alert('Please select a lot');
      return;
    }

    setGenerating(true);
    try {
      const selectedLotData = lots.find(l => l.lot_id === selectedLot);
      
      const label: QRLabel = {
        lot_id: selectedLot,
        qr_code: `QR-${selectedLot}-${Date.now()}`,
        product: selectedLotData?.crop || 'Unknown',
        final_weight: selectedLotData?.threshed_weight || 0,
        traceability_data: {
          lot_id: selectedLot,
          crop: selectedLotData?.crop,
          processing_date: new Date().toISOString(),
          supervisor: 'FlavorCore Supervisor',
          quality_grade: 'A'
        }
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/qr-labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(label)
      });

      setQrLabels([...qrLabels, label]);
      alert('QR Label generated successfully!');
    } catch (error: any) {
      alert('Failed to generate QR label: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadQR = (label: QRLabel) => {
    // Create downloadable QR code data
    const qrData = JSON.stringify(label.traceability_data, null, 2);
    const blob = new Blob([qrData], { type: 'text/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `QR_${label.lot_id}.json`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">🏷️ QR Label Generation</h2>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Generate Traceability Label</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Lot:</label>
            <select
              value={selectedLot}
              onChange={(e) => setSelectedLot(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Choose lot...</option>
              {lots.map(lot => (
                <option key={lot.lot_id} value={lot.lot_id}>
                  {lot.lot_id} - {lot.crop}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleGenerateQR}
            disabled={generating || !selectedLot}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                <QrCode className="mr-2" size={20} />
                Generate QR Label
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Generated QR Labels History */}
      {qrLabels.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Generated Labels</h3>
          
          <div className="space-y-4">
            {qrLabels.map((label, index) => (
              <div key={index} className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg">{label.product}</p>
                    <p className="text-sm text-gray-600">Lot ID: {label.lot_id}</p>
                    <p className="text-sm text-gray-600">Weight: {label.final_weight} kg</p>
                    <p className="text-sm text-gray-600">QR Code: {label.qr_code}</p>
                  </div>
                  <div className="w-24 h-24 bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                    <QrCode size={60} className="text-gray-400" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleDownloadQR(label)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    📥 Download Data
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    🖨️ Print Label
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Lot Completion Tab
function LotCompletionTab({ lots, onRefresh }: { lots: ProcessingLot[]; onRefresh: () => void }) {
  const [selectedLot, setSelectedLot] = useState('');
  const [finalProducts, setFinalProducts] = useState<{ product: string; weight: number }[]>([]);
  const [byProducts, setByProducts] = useState<{ product: string; weight: number }[]>([]);
  const [yieldAnalysis, setYieldAnalysis] = useState<{ totalInput: number; totalOutput: number; yieldPercentage: number }>({ totalInput: 0, totalOutput: 0, yieldPercentage: 0 });

  const handleAddProduct = (type: 'final' | 'by') => {
    const product = prompt(`Enter ${type === 'final' ? 'final' : 'by-'} product name:`);
    if (!product) return;
    
    const weight = prompt('Enter weight (kg):');
    if (!weight || isNaN(parseFloat(weight))) return;

    const newProduct = { product, weight: parseFloat(weight) };
    
    if (type === 'final') {
      const newFinalProducts = [...finalProducts, newProduct];
      setFinalProducts(newFinalProducts);
      updateYieldAnalysis(newFinalProducts, byProducts);
    } else {
      const newByProducts = [...byProducts, newProduct];
      setByProducts(newByProducts);
      updateYieldAnalysis(finalProducts, newByProducts);
    }
  };

  const updateYieldAnalysis = (finals: any[], bys: any[]) => {
    const selectedLotData = lots.find(l => l.lot_id === selectedLot);
    const totalInput = selectedLotData?.threshed_weight || 0;
    const totalOutput = [...finals, ...bys].reduce((sum, p) => sum + p.weight, 0);
    const yieldPercentage = totalInput > 0 ? (totalOutput / totalInput) * 100 : 0;
    
    setYieldAnalysis({ totalInput, totalOutput, yieldPercentage });
  };

  const handleSubmitCompletion = async () => {
    if (!selectedLot || finalProducts.length === 0) {
      alert('Please select lot and add at least one final product');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lot-completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lot_id: selectedLot,
          final_products: finalProducts,
          by_products: byProducts,
          yield_analysis: yieldAnalysis,
          completed_by: 'supervisor',
          completion_time: new Date().toISOString()
        })
      });

      alert('Lot marked as complete and submitted for manager approval!');
      
      // Reset
      setSelectedLot('');
      setFinalProducts([]);
      setByProducts([]);
      setYieldAnalysis({ totalInput: 0, totalOutput: 0, yieldPercentage: 0 });
      onRefresh();
      
    } catch (error: any) {
      alert('Failed to complete lot: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">✅ Lot Completion & Yield Analysis</h2>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Submit Lot for Approval</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Lot:</label>
            <select
              value={selectedLot}
              onChange={(e) => {
                setSelectedLot(e.target.value);
                setFinalProducts([]);
                setByProducts([]);
                setYieldAnalysis({ totalInput: 0, totalOutput: 0, yieldPercentage: 0 });
              }}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Choose lot...</option>
              {lots.map(lot => (
                <option key={lot.lot_id} value={lot.lot_id}>
                  {lot.lot_id} - {lot.crop} ({lot.threshed_weight} kg input)
                </option>
              ))}
            </select>
          </div>

          {/* Yield Analysis */}
          {selectedLot && (
            <Card className="p-4 bg-blue-50">
              <h4 className="font-semibold mb-2">📊 Yield Analysis</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Input Weight</p>
                  <p className="text-xl font-bold text-blue-600">{yieldAnalysis.totalInput} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Output Weight</p>
                  <p className="text-xl font-bold text-green-600">{yieldAnalysis.totalOutput} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Yield %</p>
                  <p className="text-xl font-bold text-purple-600">{yieldAnalysis.yieldPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
          )}

          {/* Final Products */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Final Products:</label>
              <Button
                onClick={() => handleAddProduct('final')}
                className="bg-green-600 hover:bg-green-700 h-8 text-sm"
              >
                + Add Product
              </Button>
            </div>
            {finalProducts.length > 0 ? (
              <div className="space-y-2">
                {finalProducts.map((prod, index) => (
                  <div key={index} className="flex justify-between p-2 bg-green-50 border border-green-200 rounded">
                    <span className="font-semibold">{prod.product}</span>
                    <span className="text-green-700">{prod.weight} kg</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No products added yet</p>
            )}
          </div>

          {/* By-Products */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">By-Products (optional):</label>
              <Button
                onClick={() => handleAddProduct('by')}
                className="bg-blue-600 hover:bg-blue-700 h-8 text-sm"
              >
                + Add By-Product
              </Button>
            </div>
            {byProducts.length > 0 && (
              <div className="space-y-2">
                {byProducts.map((prod, index) => (
                  <div key={index} className="flex justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                    <span className="font-semibold">{prod.product}</span>
                    <span className="text-blue-700">{prod.weight} kg</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-1" size={20} />
              <div>
                <p className="font-semibold text-yellow-800">Manager Approval Required</p>
                <p className="text-sm text-yellow-700">
                  Lot will be submitted to FlavorCore Manager for final approval and quality verification
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmitCompletion}
            disabled={!selectedLot || finalProducts.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12"
          >
            <CheckCircle className="mr-2" size={20} />
            Submit for Manager Approval
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Helper Component
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
        active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}