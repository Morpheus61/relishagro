// src/components/supervisor/SupervisorDashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';

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
  rfid_tag?: string;
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

interface RFIDConfig {
  enabled: boolean;
  reader_type: 'nfc' | 'usb_reader' | 'bluetooth';
  tag_format: string;
  auto_scan: boolean;
}

interface PrinterConfig {
  enabled: boolean;
  printer_type: 'thermal' | 'laser' | 'browser';
  paper_size: 'A4' | 'label_4x6' | 'label_2x4';
  dpi: number;
  print_url?: string;
}

interface Props {
  currentUser: User;
}

// ✅ MODAL COMPONENTS - OUTSIDE MAIN COMPONENT WITH REACT PORTAL

interface NewScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scanData: { worker_id: string; location: string; task: string }) => Promise<void>;
  rfidConfig: RFIDConfig | null;
}

const NewScanModalComponent: React.FC<NewScanModalProps> = ({ isOpen, onClose, onSubmit, rfidConfig }) => {
  const [formData, setFormData] = useState({
    worker_id: '',
    location: '',
    task: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nfcScanning, setNfcScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ worker_id: '', location: '', task: '' });
    }
  }, [isOpen]);

  const handleNFCScan = async () => {
    if (!('NDEFReader' in window)) {
      alert('NFC is not supported on this device. Please use a compatible mobile device or enter RFID manually.');
      return;
    }

    try {
      setNfcScanning(true);
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      
      ndef.addEventListener('reading', ({ serialNumber }: any) => {
        setFormData(prev => ({ ...prev, worker_id: serialNumber }));
        setNfcScanning(false);
        alert('✅ RFID Tag scanned successfully!');
      });
    } catch (error) {
      console.error('NFC scan error:', error);
      alert('Failed to scan NFC tag. Please try again or enter manually.');
      setNfcScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.worker_id || !formData.location || !formData.task) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to record scan:', error);
      alert('Failed to record scan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">New RFID Scan</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isSubmitting}>
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Worker RFID *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Scan or enter Worker RFID"
                  value={formData.worker_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, worker_id: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                  required
                />
                {rfidConfig?.enabled && rfidConfig.reader_type === 'nfc' && (
                  <button
                    type="button"
                    onClick={handleNFCScan}
                    disabled={nfcScanning || isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 whitespace-nowrap"
                  >
                    {nfcScanning ? '📡 Scanning...' : '📱 Scan NFC'}
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <select 
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
                required
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Task *</label>
              <select 
                value={formData.task}
                onChange={(e) => setFormData(prev => ({ ...prev, task: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
                required
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
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 whitespace-nowrap"
              disabled={isSubmitting || !formData.worker_id || !formData.location || !formData.task}
            >
              {isSubmitting ? 'Recording...' : 'Record Scan'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ✅ OTHER MODALS (Similar pattern)
interface NewBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (batchData: { product: string; batch_id: string; temperature: number; humidity: number }) => Promise<void>;
}

const NewBatchModalComponent: React.FC<NewBatchModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    product: '',
    batch_id: '',
    temperature: 65,
    humidity: 45
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ product: '', batch_id: '', temperature: 65, humidity: 45 });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      alert('Failed to start batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Start New Drying Batch</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isSubmitting}>✕</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
              <input type="text" placeholder="Product name" value={formData.product} onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isSubmitting} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch ID *</label>
              <input type="text" placeholder="BATCH-2024-XXX" value={formData.batch_id} onChange={(e) => setFormData(prev => ({ ...prev, batch_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isSubmitting} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
              <input type="number" value={formData.temperature} onChange={(e) => setFormData(prev => ({ ...prev, temperature: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isSubmitting} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Humidity (%)</label>
              <input type="number" value={formData.humidity} onChange={(e) => setFormData(prev => ({ ...prev, humidity: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isSubmitting} />
            </div>
            <button type="submit" className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-400" disabled={isSubmitting || !formData.product || !formData.batch_id}>
              {isSubmitting ? 'Starting...' : 'Start Batch'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ✅ Print Label Modal with Template
interface PrintLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: PackagingRecord | null;
  printerConfig: PrinterConfig | null;
}

const PrintLabelModalComponent: React.FC<PrintLabelModalProps> = ({ isOpen, onClose, packageData, printerConfig }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printerConfig?.enabled) {
      alert('Printer not configured. Please contact admin.');
      return;
    }

    if (printerConfig.printer_type === 'browser') {
      window.print();
    } else if (printerConfig.print_url) {
      // Send to network printer
      fetch(printerConfig.print_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label_data: packageData,
          template: 'standard_package_label',
          printer_config: printerConfig
        })
      }).then(() => alert('✅ Print job sent!')).catch(() => alert('❌ Print failed'));
    }
  };

  if (!isOpen || !packageData) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Print Package Label</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          
          {/* Print Preview */}
          <div ref={printRef} className="border-2 border-dashed border-gray-300 p-8 mb-4 bg-white" style={{ width: '4in', height: '6in' }}>
            <div className="h-full flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-4">RELISH AGRO</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Product:</strong> {packageData.product}</p>
                  <p><strong>Batch ID:</strong> {packageData.batch_id}</p>
                  <p><strong>Quantity:</strong> {packageData.quantity}</p>
                  <p><strong>Package Type:</strong> {packageData.package_type}</p>
                  <p><strong>Date:</strong> {new Date(packageData.package_time).toLocaleDateString()}</p>
                  {packageData.rfid_tag && <p><strong>RFID:</strong> {packageData.rfid_tag}</p>}
                </div>
              </div>
              <div className="flex justify-center">
                <QRCodeSVG value={packageData.qr_code} size={128} level="H" includeMargin />
              </div>
              <div className="text-center text-xs text-gray-600">
                <p>{packageData.qr_code}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
              🖨️ Print Label
            </button>
            <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ✅ MAIN COMPONENT
const SupervisorDashboard: React.FC<Props> = ({ currentUser }) => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [rfidScans, setRfidScans] = useState<RFIDScan[]>([]);
  const [dryingMonitors, setDryingMonitors] = useState<DryingMonitor[]>([]);
  const [qualitySamples, setQualitySamples] = useState<QualitySample[]>([]);
  const [packagingRecords, setPackagingRecords] = useState<PackagingRecord[]>([]);
  const [lotSubmissions, setLotSubmissions] = useState<LotSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Configuration states
  const [rfidConfig, setRfidConfig] = useState<RFIDConfig | null>(null);
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig | null>(null);

  // Modal states
  const [showNewScanModal, setShowNewScanModal] = useState(false);
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [showPrintLabelModal, setShowPrintLabelModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackagingRecord | null>(null);

  const API_BASE = 'https://relishagrobackend-production.up.railway.app';

  const getAuthToken = () => localStorage.getItem('auth_token');
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  });

  // ✅ REAL API CALLS
  const fetchRFIDScans = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/supervisor/rfid-scans`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setRfidScans(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Error fetching RFID scans:', err);
      setRfidScans([]);
    }
  };

  const fetchDryingMonitors = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/supervisor/drying-batches`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setDryingMonitors(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Error fetching drying monitors:', err);
      setDryingMonitors([]);
    }
  };

  const fetchQualitySamples = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/supervisor/quality-samples`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setQualitySamples(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Error fetching quality samples:', err);
      setQualitySamples([]);
    }
  };

  const fetchPackagingRecords = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/supervisor/packaging`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setPackagingRecords(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Error fetching packaging records:', err);
      setPackagingRecords([]);
    }
  };

  const fetchLotSubmissions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/supervisor/lot-submissions`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setLotSubmissions(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Error fetching lot submissions:', err);
      setLotSubmissions([]);
    }
  };

  const fetchConfigurations = async () => {
    try {
      const [rfidRes, printerRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/rfid-config`, { headers: getHeaders() }),
        fetch(`${API_BASE}/api/admin/printer-config`, { headers: getHeaders() })
      ]);
      
      if (rfidRes.ok) {
        const rfidData = await rfidRes.json();
        setRfidConfig(rfidData);
      }
      
      if (printerRes.ok) {
        const printerData = await printerRes.json();
        setPrinterConfig(printerData);
      }
    } catch (err) {
      console.error('Error fetching configurations:', err);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchRFIDScans(),
          fetchDryingMonitors(),
          fetchQualitySamples(),
          fetchPackagingRecords(),
          fetchLotSubmissions(),
          fetchConfigurations()
        ]);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Handler functions
  const handleAddScan = async (scanData: { worker_id: string; location: string; task: string }) => {
    const response = await fetch(`${API_BASE}/api/supervisor/rfid-scans`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(scanData)
    });
    if (response.ok) {
      await fetchRFIDScans();
      alert('✅ Scan recorded successfully!');
    } else {
      throw new Error('Failed to record scan');
    }
  };

  const handleAddBatch = async (batchData: { product: string; batch_id: string; temperature: number; humidity: number }) => {
    const response = await fetch(`${API_BASE}/api/supervisor/drying-batches`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(batchData)
    });
    if (response.ok) {
      await fetchDryingMonitors();
      alert('✅ Batch started successfully!');
    } else {
      throw new Error('Failed to start batch');
    }
  };

  const handlePrintLabel = (pkg: PackagingRecord) => {
    setSelectedPackage(pkg);
    setShowPrintLabelModal(true);
  };

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'rfid', name: 'RFID Scanning', icon: '📡' },
    { id: 'drying', name: 'Drying Monitor', icon: '🌡️' },
    { id: 'quality', name: 'Quality Sampling', icon: '✓' },
    { id: 'packaging', name: 'Packaging', icon: '📦' },
    { id: 'lots', name: 'Lot Submission', icon: '🚚' }
  ];

  // Dashboard Overview Component
  const DashboardOverview: React.FC = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">RFID Scans Today</p>
              <p className="text-3xl font-bold text-blue-600">{rfidScans.length}</p>
            </div>
            <div className="text-4xl">📡</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Drying Batches</p>
              <p className="text-3xl font-bold text-orange-600">{dryingMonitors.filter(d => d.status === 'In Progress').length}</p>
            </div>
            <div className="text-4xl">🌡️</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Quality Samples</p>
              <p className="text-3xl font-bold text-green-600">{qualitySamples.length}</p>
            </div>
            <div className="text-4xl">✓</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Packages Ready</p>
              <p className="text-3xl font-bold text-purple-600">{packagingRecords.filter(p => p.status === 'Completed').length}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">System Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium">RFID System</span>
            <span className={`px-3 py-1 rounded-full text-sm ${rfidConfig?.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {rfidConfig?.enabled ? '✓ Enabled' : '✕ Disabled'}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium">Printer</span>
            <span className={`px-3 py-1 rounded-full text-sm ${printerConfig?.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {printerConfig?.enabled ? '✓ Enabled' : '✕ Disabled'}
            </span>
          </div>
        </div>
        {(!rfidConfig?.enabled || !printerConfig?.enabled) && (
          <p className="mt-4 text-sm text-amber-600">⚠️ Contact admin to configure disabled systems</p>
        )}
      </div>
    </div>
  );

  // Packaging Component
  const Packaging: React.FC = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Packaging</h2>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packagingRecords.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.product}</div>
                    <div className="text-sm text-gray-500">{new Date(record.package_time).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{record.batch_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{record.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{record.qr_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${record.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => handlePrintLabel(record)} className="text-blue-600 hover:text-blue-900 mr-3">
                      🖨️ Print Label
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCurrentView = (): JSX.Element => {
    switch (currentView) {
      case 'dashboard': return <DashboardOverview />;
      case 'packaging': return <Packaging />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-indigo-600 rounded-lg p-2 mr-3">
                <span className="text-white text-xl">👷</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Supervisor Dashboard</h1>
                <p className="text-sm text-gray-500">Production Operations</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full text-left px-6 py-3 flex items-center space-x-3 hover:bg-gray-50 ${
                  currentView === item.id ? 'bg-indigo-50 border-r-2 border-indigo-600 text-indigo-600' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              </button>
            ))}
          </nav>
        </aside>

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

      {/* ✅ ALL MODALS USE REACT PORTAL */}
      <NewScanModalComponent
        isOpen={showNewScanModal}
        onClose={() => setShowNewScanModal(false)}
        onSubmit={handleAddScan}
        rfidConfig={rfidConfig}
      />
      
      <NewBatchModalComponent
        isOpen={showNewBatchModal}
        onClose={() => setShowNewBatchModal(false)}
        onSubmit={handleAddBatch}
      />

      <PrintLabelModalComponent
        isOpen={showPrintLabelModal}
        onClose={() => {
          setShowPrintLabelModal(false);
          setSelectedPackage(null);
        }}
        packageData={selectedPackage}
        printerConfig={printerConfig}
      />
    </div>
  );
};

export default SupervisorDashboard;