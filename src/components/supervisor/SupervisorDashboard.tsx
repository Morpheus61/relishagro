// src/components/supervisor/SupervisorDashboard.tsx
import React, { useState, useEffect } from 'react';

// Types
interface User {
  staff_id: string;
  role: string;
  name: string;
}

interface RFIDScan {
  id: string;
  worker_id: string;
  worker_name: string;
  scan_time: string;
  location: string;
  task: string;
  status: string;
}

interface DryingMonitor {
  id: string;
  batch_id: string;
  product: string;
  start_time: string;
  temperature: number;
  humidity: number;
  duration_hours: number;
  status: string;
}

interface QualitySample {
  id: string;
  batch_id: string;
  product: string;
  sample_time: string;
  moisture_content: number;
  color_grade: string;
  size_grade: string;
  defects: number;
  overall_grade: string;
}

interface PackagingRecord {
  id: string;
  batch_id: string;
  product: string;
  package_time: string;
  quantity: number;
  package_type: string;
  qr_code: string;
  status: string;
}

interface LotSubmission {
  id: string;
  lot_number: string;
  products: string[];
  total_quantity: number;
  submission_time: string;
  quality_grade: string;
  status: string;
}

interface Props {
  currentUser: User;
}

const SupervisorDashboard: React.FC<Props> = ({ currentUser }) => {
  // State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [rfidScans, setRfidScans] = useState<RFIDScan[]>([]);
  const [dryingMonitors, setDryingMonitors] = useState<DryingMonitor[]>([]);
  const [qualitySamples, setQualitySamples] = useState<QualitySample[]>([]);
  const [packagingRecords, setPackagingRecords] = useState<PackagingRecord[]>([]);
  const [lotSubmissions, setLotSubmissions] = useState<LotSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ Modal states
  const [showNewScanModal, setShowNewScanModal] = useState(false);
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [showNewSampleModal, setShowNewSampleModal] = useState(false);
  const [showNewPackageModal, setShowNewPackageModal] = useState(false);
  const [showNewLotModal, setShowNewLotModal] = useState(false);

  // ✅ Form states
  const [newScan, setNewScan] = useState({
    worker_id: '',
    location: '',
    task: ''
  });

  const [newBatch, setNewBatch] = useState({
    product: '',
    batch_id: '',
    temperature: 65,
    humidity: 45
  });

  const [newSample, setNewSample] = useState({
    batch_id: '',
    product: '',
    moisture_content: 0,
    color_grade: 'A',
    size_grade: 'Large',
    defects: 0
  });

  const [newPackage, setNewPackage] = useState({
    batch_id: '',
    product: '',
    quantity: 0,
    package_type: '5kg boxes'
  });

  const [newLot, setNewLot] = useState({
    products: [] as string[],
    total_quantity: 0,
    quality_grade: 'Grade A'
  });

  // Mock data initialization
  useEffect(() => {
    const mockRfidScans: RFIDScan[] = [
      {
        id: 'RFID001',
        worker_id: 'W001',
        worker_name: 'Carlos Martinez',
        scan_time: '2024-01-15T08:15:00',
        location: 'Drying Station A',
        task: 'Temperature Check',
        status: 'Completed'
      },
      {
        id: 'RFID002',
        worker_id: 'W002',
        worker_name: 'Maria Santos',
        scan_time: '2024-01-15T09:30:00',
        location: 'Quality Station B',
        task: 'Sample Collection',
        status: 'In Progress'
      }
    ];

    const mockDryingMonitors: DryingMonitor[] = [
      {
        id: 'DRY001',
        batch_id: 'BATCH-2024-001',
        product: 'Premium Tomatoes',
        start_time: '2024-01-14T18:00:00',
        temperature: 65.5,
        humidity: 45.2,
        duration_hours: 14,
        status: 'In Progress'
      },
      {
        id: 'DRY002',
        batch_id: 'BATCH-2024-002',
        product: 'Cherry Tomatoes',
        start_time: '2024-01-14T20:00:00',
        temperature: 62.0,
        humidity: 48.1,
        duration_hours: 12,
        status: 'In Progress'
      }
    ];

    const mockQualitySamples: QualitySample[] = [
      {
        id: 'QS001',
        batch_id: 'BATCH-2024-001',
        product: 'Premium Tomatoes',
        sample_time: '2024-01-15T10:00:00',
        moisture_content: 12.5,
        color_grade: 'A',
        size_grade: 'Large',
        defects: 2,
        overall_grade: 'Grade A'
      },
      {
        id: 'QS002',
        batch_id: 'BATCH-2024-002',
        product: 'Cherry Tomatoes',
        sample_time: '2024-01-15T10:30:00',
        moisture_content: 11.8,
        color_grade: 'A',
        size_grade: 'Medium',
        defects: 0,
        overall_grade: 'Grade AA'
      }
    ];

    const mockPackagingRecords: PackagingRecord[] = [
      {
        id: 'PKG001',
        batch_id: 'BATCH-2024-001',
        product: 'Premium Tomatoes',
        package_time: '2024-01-15T11:00:00',
        quantity: 25,
        package_type: '5kg boxes',
        qr_code: 'QR-PT-240115-001',
        status: 'Completed'
      },
      {
        id: 'PKG002',
        batch_id: 'BATCH-2024-002',
        product: 'Cherry Tomatoes',
        package_time: '2024-01-15T11:30:00',
        quantity: 40,
        package_type: '2kg containers',
        qr_code: 'QR-CT-240115-002',
        status: 'In Progress'
      }
    ];

    const mockLotSubmissions: LotSubmission[] = [
      {
        id: 'LOT001',
        lot_number: 'LOT-2024-001',
        products: ['Premium Tomatoes', 'Cherry Tomatoes'],
        total_quantity: 165,
        submission_time: '2024-01-15T12:00:00',
        quality_grade: 'Grade A',
        status: 'Submitted'
      }
    ];

    setRfidScans(mockRfidScans);
    setDryingMonitors(mockDryingMonitors);
    setQualitySamples(mockQualitySamples);
    setPackagingRecords(mockPackagingRecords);
    setLotSubmissions(mockLotSubmissions);
  }, []);

  // ✅ Handlers
  const handleAddScan = () => {
    if (!newScan.worker_id || !newScan.location || !newScan.task) {
      alert('Please fill in all fields');
      return;
    }

    const scan: RFIDScan = {
      id: `RFID${String(rfidScans.length + 1).padStart(3, '0')}`,
      worker_id: newScan.worker_id,
      worker_name: `Worker ${newScan.worker_id}`,
      scan_time: new Date().toISOString(),
      location: newScan.location,
      task: newScan.task,
      status: 'Completed'
    };

    setRfidScans([...rfidScans, scan]);
    setNewScan({ worker_id: '', location: '', task: '' });
    setShowNewScanModal(false);
    alert('RFID scan recorded successfully!');
  };

  const handleAddBatch = () => {
    if (!newBatch.product || !newBatch.batch_id) {
      alert('Please fill in all fields');
      return;
    }

    const batch: DryingMonitor = {
      id: `DRY${String(dryingMonitors.length + 1).padStart(3, '0')}`,
      batch_id: newBatch.batch_id,
      product: newBatch.product,
      start_time: new Date().toISOString(),
      temperature: newBatch.temperature,
      humidity: newBatch.humidity,
      duration_hours: 0,
      status: 'In Progress'
    };

    setDryingMonitors([...dryingMonitors, batch]);
    setNewBatch({ product: '', batch_id: '', temperature: 65, humidity: 45 });
    setShowNewBatchModal(false);
    alert('Drying batch started successfully!');
  };

  const handleAddSample = () => {
    if (!newSample.batch_id || !newSample.product) {
      alert('Please fill in all fields');
      return;
    }

    const grade = newSample.defects === 0 ? 'Grade AA' : newSample.defects <= 2 ? 'Grade A' : 'Grade B';

    const sample: QualitySample = {
      id: `QS${String(qualitySamples.length + 1).padStart(3, '0')}`,
      batch_id: newSample.batch_id,
      product: newSample.product,
      sample_time: new Date().toISOString(),
      moisture_content: newSample.moisture_content,
      color_grade: newSample.color_grade,
      size_grade: newSample.size_grade,
      defects: newSample.defects,
      overall_grade: grade
    };

    setQualitySamples([...qualitySamples, sample]);
    setNewSample({ batch_id: '', product: '', moisture_content: 0, color_grade: 'A', size_grade: 'Large', defects: 0 });
    setShowNewSampleModal(false);
    alert('Quality sample recorded successfully!');
  };

  const handleAddPackage = () => {
    if (!newPackage.batch_id || !newPackage.product || !newPackage.quantity) {
      alert('Please fill in all fields');
      return;
    }

    const qrCode = `QR-${newPackage.product.substring(0, 2).toUpperCase()}-${Date.now()}`;

    const packageRecord: PackagingRecord = {
      id: `PKG${String(packagingRecords.length + 1).padStart(3, '0')}`,
      batch_id: newPackage.batch_id,
      product: newPackage.product,
      package_time: new Date().toISOString(),
      quantity: newPackage.quantity,
      package_type: newPackage.package_type,
      qr_code: qrCode,
      status: 'Completed'
    };

    setPackagingRecords([...packagingRecords, packageRecord]);
    setNewPackage({ batch_id: '', product: '', quantity: 0, package_type: '5kg boxes' });
    setShowNewPackageModal(false);
    alert('Package created successfully!');
  };

  const handleAddLot = () => {
    if (newLot.products.length === 0 || !newLot.total_quantity) {
      alert('Please fill in all fields');
      return;
    }

    const lot: LotSubmission = {
      id: `LOT${String(lotSubmissions.length + 1).padStart(3, '0')}`,
      lot_number: `LOT-2024-${String(lotSubmissions.length + 1).padStart(3, '0')}`,
      products: newLot.products,
      total_quantity: newLot.total_quantity,
      submission_time: new Date().toISOString(),
      quality_grade: newLot.quality_grade,
      status: 'Submitted'
    };

    setLotSubmissions([...lotSubmissions, lot]);
    setNewLot({ products: [], total_quantity: 0, quality_grade: 'Grade A' });
    setShowNewLotModal(false);
    alert('Lot submitted successfully!');
  };

  const handleCompleteBatch = (id: string) => {
    setDryingMonitors(dryingMonitors.map(m => 
      m.id === id ? { ...m, status: 'Completed' } : m
    ));
    alert('Batch completed!');
  };

  const handlePrintQR = (qrCode: string) => {
    alert(`Printing QR Code: ${qrCode}`);
  };

  const handleCompletePackage = (id: string) => {
    setPackagingRecords(packagingRecords.map(p => 
      p.id === id ? { ...p, status: 'Completed' } : p
    ));
    alert('Package completed!');
  };

  // Navigation
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'rfid', name: 'RFID Scanning', icon: '📱' },
    { id: 'drying', name: 'Drying Monitor', icon: '🌡️' },
    { id: 'quality', name: 'Quality Sampling', icon: '🔬' },
    { id: 'packaging', name: 'Packaging', icon: '📦' },
    { id: 'lots', name: 'Lot Submission', icon: '📋' }
  ];

  // =====================
  // MODAL COMPONENTS
  // =====================

  const NewScanModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">New RFID Scan</h3>
          <button onClick={() => setShowNewScanModal(false)} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Worker ID</label>
            <input
              type="text"
              placeholder="Scan or enter Worker RFID"
              value={newScan.worker_id}
              onChange={(e) => setNewScan({...newScan, worker_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select 
              value={newScan.location}
              onChange={(e) => setNewScan({...newScan, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Location</option>
              <option value="Drying Station A">Drying Station A</option>
              <option value="Drying Station B">Drying Station B</option>
              <option value="Quality Station A">Quality Station A</option>
              <option value="Quality Station B">Quality Station B</option>
              <option value="Packaging Area">Packaging Area</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task</label>
            <select 
              value={newScan.task}
              onChange={(e) => setNewScan({...newScan, task: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Task</option>
              <option value="Temperature Check">Temperature Check</option>
              <option value="Sample Collection">Sample Collection</option>
              <option value="Quality Inspection">Quality Inspection</option>
              <option value="Packaging">Packaging</option>
              <option value="Equipment Maintenance">Equipment Maintenance</option>
            </select>
          </div>
          <button 
            onClick={handleAddScan}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 whitespace-nowrap"
            disabled={!newScan.worker_id || !newScan.location || !newScan.task}
          >
            Record Scan
          </button>
        </div>
      </div>
    </div>
  );

  const NewBatchModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Start New Drying Batch</h3>
          <button onClick={() => setShowNewBatchModal(false)} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
            <input
              type="text"
              placeholder="Product name"
              value={newBatch.product}
              onChange={(e) => setNewBatch({...newBatch, product: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch ID</label>
            <input
              type="text"
              placeholder="BATCH-2024-XXX"
              value={newBatch.batch_id}
              onChange={(e) => setNewBatch({...newBatch, batch_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
            <input
              type="number"
              value={newBatch.temperature}
              onChange={(e) => setNewBatch({...newBatch, temperature: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Humidity (%)</label>
            <input
              type="number"
              value={newBatch.humidity}
              onChange={(e) => setNewBatch({...newBatch, humidity: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button 
            onClick={handleAddBatch}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 whitespace-nowrap"
            disabled={!newBatch.product || !newBatch.batch_id}
          >
            Start Batch
          </button>
        </div>
      </div>
    </div>
  );

  const NewSampleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">New Quality Sample</h3>
          <button onClick={() => setShowNewSampleModal(false)} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch ID</label>
            <input
              type="text"
              value={newSample.batch_id}
              onChange={(e) => setNewSample({...newSample, batch_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
            <input
              type="text"
              value={newSample.product}
              onChange={(e) => setNewSample({...newSample, product: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Moisture Content (%)</label>
            <input
              type="number"
              step="0.1"
              value={newSample.moisture_content}
              onChange={(e) => setNewSample({...newSample, moisture_content: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Grade</label>
            <select
              value={newSample.color_grade}
              onChange={(e) => setNewSample({...newSample, color_grade: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Size Grade</label>
            <select
              value={newSample.size_grade}
              onChange={(e) => setNewSample({...newSample, size_grade: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="Large">Large</option>
              <option value="Medium">Medium</option>
              <option value="Small">Small</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Defects</label>
            <input
              type="number"
              value={newSample.defects}
              onChange={(e) => setNewSample({...newSample, defects: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button 
            onClick={handleAddSample}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 whitespace-nowrap"
            disabled={!newSample.batch_id || !newSample.product}
          >
            Record Sample
          </button>
        </div>
      </div>
    </div>
  );

  const NewPackageModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">New Package</h3>
          <button onClick={() => setShowNewPackageModal(false)} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch ID</label>
            <input
              type="text"
              value={newPackage.batch_id}
              onChange={(e) => setNewPackage({...newPackage, batch_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
            <input
              type="text"
              value={newPackage.product}
              onChange={(e) => setNewPackage({...newPackage, product: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              value={newPackage.quantity}
              onChange={(e) => setNewPackage({...newPackage, quantity: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
            <select
              value={newPackage.package_type}
              onChange={(e) => setNewPackage({...newPackage, package_type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="5kg boxes">5kg boxes</option>
              <option value="2kg containers">2kg containers</option>
              <option value="10kg boxes">10kg boxes</option>
              <option value="1kg bags">1kg bags</option>
            </select>
          </div>
          <button 
            onClick={handleAddPackage}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 whitespace-nowrap"
            disabled={!newPackage.batch_id || !newPackage.product || !newPackage.quantity}
          >
            Create Package
          </button>
        </div>
      </div>
    </div>
  );

  const NewLotModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Lot</h3>
          <button onClick={() => setShowNewLotModal(false)} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Products (comma-separated)</label>
            <input
              type="text"
              placeholder="Premium Tomatoes, Cherry Tomatoes"
              value={newLot.products.join(', ')}
              onChange={(e) => setNewLot({...newLot, products: e.target.value.split(',').map(p => p.trim())})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Quantity</label>
            <input
              type="number"
              value={newLot.total_quantity}
              onChange={(e) => setNewLot({...newLot, total_quantity: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality Grade</label>
            <select
              value={newLot.quality_grade}
              onChange={(e) => setNewLot({...newLot, quality_grade: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="Grade AA">Grade AA</option>
              <option value="Grade A">Grade A</option>
              <option value="Grade B">Grade B</option>
            </select>
          </div>
          <button 
            onClick={handleAddLot}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
            disabled={newLot.products.length === 0 || !newLot.total_quantity}
          >
            Submit Lot
          </button>
        </div>
      </div>
    </div>
  );

  // =====================
  // VIEW COMPONENTS
  // =====================

  // Dashboard Overview Component
  const DashboardOverview: React.FC = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Drying</p>
              <p className="text-2xl font-bold text-gray-900">{dryingMonitors.filter(d => d.status === 'In Progress').length}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <span className="text-orange-600 text-xl">🌡️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quality Samples</p>
              <p className="text-2xl font-bold text-gray-900">{qualitySamples.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <span className="text-blue-600 text-xl">🔬</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Packages Today</p>
              <p className="text-2xl font-bold text-gray-900">{packagingRecords.length}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <span className="text-green-600 text-xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lots Submitted</p>
              <p className="text-2xl font-bold text-gray-900">{lotSubmissions.length}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <span className="text-purple-600 text-xl">📋</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Drying Processes</h3>
          <div className="space-y-3">
            {dryingMonitors.filter(d => d.status === 'In Progress').map((monitor) => (
              <div key={monitor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{monitor.product}</p>
                  <p className="text-xs text-gray-500">Temp: {monitor.temperature}°C | Humidity: {monitor.humidity}%</p>
                  <p className="text-xs text-gray-500">Duration: {monitor.duration_hours}h</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 whitespace-nowrap">
                  {monitor.status}
                </span>
              </div>
            ))}
            {dryingMonitors.filter(d => d.status === 'In Progress').length === 0 && (
              <p className="text-gray-500 text-center py-4">No active drying processes</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Quality Samples</h3>
          <div className="space-y-3">
            {qualitySamples.map((sample) => (
              <div key={sample.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{sample.product}</p>
                  <p className="text-xs text-gray-500">Moisture: {sample.moisture_content}% | Color: {sample.color_grade}</p>
                  <p className="text-xs text-gray-500">Defects: {sample.defects}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                  sample.overall_grade === 'Grade AA' ? 'bg-green-100 text-green-800' :
                  sample.overall_grade === 'Grade A' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {sample.overall_grade}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent RFID Scans</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rfidScans.map((scan) => (
                <tr key={scan.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{scan.worker_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scan.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scan.task}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(scan.scan_time).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      scan.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {scan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // RFID Scanning Component
  const RFIDScanning: React.FC = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">RFID Scanning</h2>
        <button 
          onClick={() => setShowNewScanModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
        >
          New Scan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Scans</h3>
          <div className="space-y-3">
            {rfidScans.map((scan) => (
              <div key={scan.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{scan.worker_name}</p>
                    <p className="text-xs text-gray-500">{scan.location} - {scan.task}</p>
                    <p className="text-xs text-gray-500">{new Date(scan.scan_time).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                    scan.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {scan.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Scans Today</span>
              <span className="text-lg font-bold text-gray-900">{rfidScans.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-lg font-bold text-green-600">{rfidScans.filter(s => s.status === 'Completed').length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-lg font-bold text-yellow-600">{rfidScans.filter(s => s.status === 'In Progress').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Drying Monitor Component
  const DryingMonitor: React.FC = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Drying Monitor</h2>
        <button 
          onClick={() => setShowNewBatchModal(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 whitespace-nowrap"
        >
          Start New Batch
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dryingMonitors.map((monitor) => (
          <div key={monitor.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{monitor.product}</h3>
              <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                monitor.status === 'In Progress' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
              }`}>
                {monitor.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Batch ID:</span>
                <span className="text-sm font-medium text-gray-900">{monitor.batch_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Temperature:</span>
                <span className="text-sm font-medium text-gray-900">{monitor.temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Humidity:</span>
                <span className="text-sm font-medium text-gray-900">{monitor.humidity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="text-sm font-medium text-gray-900">{monitor.duration_hours} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Started:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(monitor.start_time).toLocaleString()}
                </span>
              </div>
            </div>

            {monitor.status === 'In Progress' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap">
                    Update
                  </button>
                  <button 
                    onClick={() => handleCompleteBatch(monitor.id)}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
                  >
                    Complete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Quality Sampling Component
  const QualitySampling: React.FC = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quality Sampling</h2>
        <button 
          onClick={() => setShowNewSampleModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 whitespace-nowrap"
        >
          New Sample
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moisture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {qualitySamples.map((sample) => (
                <tr key={sample.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sample.product}</div>
                    <div className="text-sm text-gray-500">{new Date(sample.sample_time).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sample.batch_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sample.moisture_content}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sample.color_grade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sample.size_grade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sample.defects}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      sample.overall_grade === 'Grade AA' ? 'bg-green-100 text-green-800' :
                      sample.overall_grade === 'Grade A' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sample.overall_grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 whitespace-nowrap">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Packaging Component
  const Packaging: React.FC = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Packaging</h2>
        <button 
          onClick={() => setShowNewPackageModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 whitespace-nowrap"
        >
          New Package
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packagingRecords.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.product}</div>
                    <div className="text-sm text-gray-500">{new Date(record.package_time).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.batch_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.package_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{record.qr_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      record.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handlePrintQR(record.qr_code)}
                      className="text-blue-600 hover:text-blue-900 mr-3 whitespace-nowrap"
                    >
                      Print QR
                    </button>
                    {record.status !== 'Completed' && (
                      <button 
                        onClick={() => handleCompletePackage(record.id)}
                        className="text-green-600 hover:text-green-900 whitespace-nowrap"
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Lot Submission Component
  const LotSubmission: React.FC = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Lot Submission</h2>
        <button 
          onClick={() => setShowNewLotModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
        >
          Create Lot
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lotSubmissions.map((lot) => (
                <tr key={lot.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lot.lot_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lot.products.join(', ')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lot.total_quantity} units</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lot.quality_grade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(lot.submission_time).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 whitespace-nowrap">
                      {lot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 whitespace-nowrap">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render current view
  const renderCurrentView = (): JSX.Element => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'rfid':
        return <RFIDScanning />;
      case 'drying':
        return <DryingMonitor />;
      case 'quality':
        return <QualitySampling />;
      case 'packaging':
        return <Packaging />;
      case 'lots':
        return <LotSubmission />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-indigo-600 rounded-lg p-2 mr-3">
                <span className="text-white text-xl">👷</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Supervisor Dashboard</h1>
                <p className="text-sm text-gray-500">Production Operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full text-left px-6 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                  currentView === item.id ? 'bg-indigo-50 border-r-2 border-indigo-600 text-indigo-600' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : (
            renderCurrentView()
          )}
        </main>
      </div>

      {/* Modals */}
      {showNewScanModal && <NewScanModal />}
      {showNewBatchModal && <NewBatchModal />}
      {showNewSampleModal && <NewSampleModal />}
      {showNewPackageModal && <NewPackageModal />}
      {showNewLotModal && <NewLotModal />}
    </div>
  );
};

export default SupervisorDashboard;