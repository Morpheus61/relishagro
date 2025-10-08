import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { RFIDScanner } from '../shared/RFIDScanner';
import api from '../../lib/api';
import { Smartphone, Package, Beaker, QrCode, CheckCircle, AlertCircle } from 'lucide-react';

interface SupervisorDashboardProps {
  userId: string;
  userRole: string;
  onLogout: () => void;
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

export function SupervisorDashboard({ userId, userRole, onLogout }: SupervisorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'rfid' | 'drying' | 'qr' | 'completion'>('rfid');
  const [assignedLots, setAssignedLots] = useState<ProcessingLot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedLots();
  }, []);

  const loadAssignedLots = async () => {
    try {
      const lots = await api.getSupervisorLots(userId);
      setAssignedLots(lots || []);
    } catch (error) {
      console.error('Error loading assigned lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'rfid':
        return <RFIDInScanTab lots={assignedLots} onRefresh={loadAssignedLots} />;
      case 'drying':
        return <DryingSamplesTab lots={assignedLots} />;
      case 'qr':
        return <QRGenerationTab lots={assignedLots} />;
      case 'completion':
        return <LotCompletionTab lots={assignedLots} onRefresh={loadAssignedLots} />;
      default:
        return <RFIDInScanTab lots={assignedLots} onRefresh={loadAssignedLots} />;
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
          </div>
          <Button onClick={onLogout} className="bg-indigo-800 hover:bg-indigo-900">
            Logout
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-md overflow-x-auto">
        <div className="flex gap-2 p-4 min-w-max">
          <TabButton active={activeTab === 'rfid'} onClick={() => setActiveTab('rfid')}>
            📱 RFID In-Scan
          </TabButton>
          <TabButton active={activeTab === 'drying'} onClick={() => setActiveTab('drying')}>
            🧪 Drying Samples
          </TabButton>
          <TabButton active={activeTab === 'qr'} onClick={() => setActiveTab('qr')}>
            🏷️ QR Labels
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

// RFID In-Scan Tab
function RFIDInScanTab({ lots, onRefresh }: { lots: ProcessingLot[]; onRefresh: () => void }) {
  const [selectedLot, setSelectedLot] = useState<string>('');
  const [scannedBags, setScannedBags] = useState<any[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);

  const handleBagScanned = async (bagData: { tagId: string; bagId: string; weight?: number }) => {
    try {
      // Record RFID in-scan
      await api.recordRFIDInScan({
        lot_id: selectedLot,
        bag_id: bagData.bagId,
        rfid_tag: bagData.tagId,
        weight: bagData.weight || 0,
        scanned_by: 'supervisor',
        timestamp: new Date().toISOString()
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📱 RFID In-Scan Operations</h2>

      {/* Lot Selection */}
      <Card className="p-6">
        <label className="block text-sm font-medium mb-2">Select Lot to Process:</label>
        <select
          value={selectedLot}
          onChange={(e) => {
            setSelectedLot(e.target.value);
            setScannedBags([]);
            setTotalWeight(0);
          }}
          className="w-full p-3 border rounded-lg text-lg"
        >
          <option value="">Choose a lot...</option>
          {lots.map(lot => (
            <option key={lot.lot_id} value={lot.lot_id}>
              {lot.lot_id} - {lot.crop} ({lot.threshed_weight} kg)
            </option>
          ))}
        </select>
      </Card>

      {selectedLot && (
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
                <h3 className="text-xl font-bold">Scanned Bags</h3>
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
        notes,
        timestamp: new Date().toISOString()
      };

      await api.recordDryingSample(sample);
      
      setSamples([...samples, sample]);
      
      // Reset form
      setSampleWeight('');
      setProductType('');
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
            <label className="block text-sm font-medium mb-2">Notes (optional):</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="Quality observations, moisture level, etc."
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
          <h3 className="text-xl font-bold mb-4">Recorded Samples</h3>
          <div className="space-y-3">
            {samples.map(sample => (
              <div key={sample.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{sample.product_type}</p>
                    <p className="text-sm text-gray-600">Lot: {sample.lot_id}</p>
                    <p className="text-sm text-gray-600">Weight: {sample.sample_weight} kg</p>
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
  const [qrLabel, setQrLabel] = useState<QRLabel | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerateQR = async () => {
    if (!selectedLot) {
      alert('Please select a lot');
      return;
    }

    setGenerating(true);
    try {
      const label = await api.generateQRLabel(selectedLot);
      setQrLabel(label);
    } catch (error: any) {
      alert('Failed to generate QR label: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrLabel) return;

    // Create downloadable QR code image
    const qrDataURL = generateQRCodeDataURL(qrLabel.qr_code);
    
    const link = document.createElement('a');
    link.download = `QR_${qrLabel.lot_id}.png`;
    link.href = qrDataURL;
    link.click();
  };

  const generateQRCodeDataURL = (data: string): string => {
    // Simple QR code generation placeholder
    // In production, use a library like qrcode.react or qrcode
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;
    
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = 'black';
      ctx.font = '12px monospace';
      ctx.fillText(data, 10, 150);
    }
    
    return canvas.toDataURL();
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

      {/* Generated QR Label */}
      {qrLabel && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Generated Label</h3>
          
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 text-center">
            <div className="mb-4">
              <div className="w-64 h-64 mx-auto bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                <QrCode size={200} className="text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-2 text-left">
              <p className="font-bold text-lg">{qrLabel.product}</p>
              <p className="text-sm text-gray-600">Lot ID: {qrLabel.lot_id}</p>
              <p className="text-sm text-gray-600">Weight: {qrLabel.final_weight} kg</p>
              <p className="text-sm text-gray-600">QR Code: {qrLabel.qr_code}</p>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={handleDownloadQR}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                📥 Download Label (PNG)
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                🖨️ Print Label
              </Button>
            </div>
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

  const handleAddProduct = (type: 'final' | 'by') => {
    const product = prompt(`Enter ${type === 'final' ? 'final' : 'by-'} product name:`);
    if (!product) return;
    
    const weight = prompt('Enter weight (kg):');
    if (!weight || isNaN(parseFloat(weight))) return;

    const newProduct = { product, weight: parseFloat(weight) };
    
    if (type === 'final') {
      setFinalProducts([...finalProducts, newProduct]);
    } else {
      setByProducts([...byProducts, newProduct]);
    }
  };

  const handleSubmitCompletion = async () => {
    if (!selectedLot || finalProducts.length === 0) {
      alert('Please select lot and add at least one final product');
      return;
    }

    try {
      await api.completeLot({
        lot_id: selectedLot,
        final_products: finalProducts,
        by_products: byProducts,
        completed_by: 'supervisor',
        completion_time: new Date().toISOString()
      });

      alert('Lot marked as complete and submitted for manager approval!');
      
      // Reset
      setSelectedLot('');
      setFinalProducts([]);
      setByProducts([]);
      onRefresh();
      
    } catch (error: any) {
      alert('Failed to complete lot: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">✅ Lot Completion</h2>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Submit Lot for Approval</h3>
        
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
                <p className="font-semibold text-yellow-800">Approval Required</p>
                <p className="text-sm text-yellow-700">
                  Lot will be submitted to FlavorCore Manager for final approval after completion
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
            Submit for Approval
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