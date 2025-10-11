import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { RFIDScanner } from '../shared/RFIDScanner';
import { Smartphone, Package, Beaker, QrCode, CheckCircle, AlertCircle, Printer, Box, Send } from 'lucide-react';

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

interface PackedProduct {
  id: string;
  lot_id: string;
  product_name: string;
  pack_size: string;
  quantity_packed: number;
  total_weight: number;
  qr_code: string;
  batch_number: string;
  packing_date: string;
  expiry_date: string;
  quality_grade: string;
  packed_by: string;
}

interface SubmissionForm {
  lot_id: string;
  packed_products: PackedProduct[];
  total_input_weight: number;
  total_output_weight: number;
  yield_percentage: number;
  quality_notes: string;
  supervisor_signature: string;
  submission_timestamp: string;
  status: 'pending_flavorcore_approval' | 'pending_harvestflow_approval' | 'approved' | 'rejected';
}

export function SupervisorDashboard({ currentUser }: SupervisorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rfid' | 'samples' | 'packing' | 'submissions'>('dashboard');
  const [assignedLots, setAssignedLots] = useState<ProcessingLot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedLots();
  }, []);

  const loadAssignedLots = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/supervisor-lots`);
      if (response.ok) {
        const lots = await response.json();
        setAssignedLots(lots || []);
      } else {
        // Mock data for testing
        setAssignedLots([
          { lot_id: 'LOT-2024-001', crop: 'Black Pepper', threshed_weight: 850, bags_scanned: 20, total_bags: 20, status: 'ready_for_packing' },
          { lot_id: 'LOT-2024-002', crop: 'Cloves', threshed_weight: 650, bags_scanned: 12, total_bags: 12, status: 'ready_for_packing' },
          { lot_id: 'LOT-2024-003', crop: 'Nutmeg', threshed_weight: 400, bags_scanned: 8, total_bags: 8, status: 'processing' }
        ]);
      }
    } catch (error) {
      console.error('Error loading assigned lots:', error);
      setAssignedLots([
        { lot_id: 'LOT-2024-001', crop: 'Black Pepper', threshed_weight: 850, bags_scanned: 20, total_bags: 20, status: 'ready_for_packing' },
        { lot_id: 'LOT-2024-002', crop: 'Cloves', threshed_weight: 650, bags_scanned: 12, total_bags: 12, status: 'ready_for_packing' },
        { lot_id: 'LOT-2024-003', crop: 'Nutmeg', threshed_weight: 400, bags_scanned: 8, total_bags: 8, status: 'processing' }
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
      case 'packing':
        return <FinalProductPackingTab lots={assignedLots} currentUser={currentUser} onRefresh={loadAssignedLots} />;
      case 'submissions':
        return <SubmissionTrackingTab currentUser={currentUser} />;
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
            <p className="text-indigo-200">Processing Floor Operations & Final Packing</p>
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

      {/* Tab Navigation */}
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
          <TabButton active={activeTab === 'packing'} onClick={() => setActiveTab('packing')}>
            📦 Final Packing
          </TabButton>
          <TabButton active={activeTab === 'submissions'} onClick={() => setActiveTab('submissions')}>
            📋 Submissions
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
function DashboardOverview({ lots, setActiveTab }: { lots: ProcessingLot[]; setActiveTab: (tab: 'dashboard' | 'rfid' | 'samples' | 'packing' | 'submissions') => void }) {
  const totalLots = lots.length;
  const readyForPacking = lots.filter(lot => lot.status === 'ready_for_packing').length;
  const completedScans = lots.reduce((sum, lot) => sum + lot.bags_scanned, 0);
  const totalBags = lots.reduce((sum, lot) => sum + (lot.total_bags || 0), 0);

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
            <Box className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Ready for Packing</p>
              <p className="text-2xl font-bold">{readyForPacking}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Bags Scanned</p>
              <p className="text-2xl font-bold">{completedScans}</p>
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

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={() => setActiveTab('rfid')}
            className="h-16 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            RFID Scanning
          </Button>
          <Button 
            onClick={() => setActiveTab('samples')}
            className="h-16 bg-green-600 hover:bg-green-700 text-white"
          >
            <Beaker className="w-5 h-5 mr-2" />
            Drying Samples
          </Button>
          <Button 
            onClick={() => setActiveTab('packing')}
            className="h-16 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Box className="w-5 h-5 mr-2" />
            Final Packing
          </Button>
          <Button 
            onClick={() => setActiveTab('submissions')}
            className="h-16 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Send className="w-5 h-5 mr-2" />
            View Submissions
          </Button>
        </div>
      </Card>

      {/* Lots Status */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">📦 Assigned Lots Status</h3>
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
                    <p className="text-sm text-gray-600">Bags: {lot.bags_scanned}/{lot.total_bags || 0}</p>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      lot.status === 'ready_for_packing' ? 'bg-green-100 text-green-800' :
                      lot.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      lot.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lot.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  {lot.status === 'ready_for_packing' && (
                    <Button
                      onClick={() => setActiveTab('packing')}
                      className="bg-green-600 hover:bg-green-700 text-sm"
                    >
                      Start Packing
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Final Product Packing Tab (NEW)
function FinalProductPackingTab({ lots, currentUser, onRefresh }: { lots: ProcessingLot[]; currentUser: any; onRefresh: () => void }) {
  const [selectedLot, setSelectedLot] = useState('');
  const [packedProducts, setPackedProducts] = useState<PackedProduct[]>([]);
  const [currentPacking, setCurrentPacking] = useState({
    product_name: '',
    pack_size: '1kg',
    quantity_packed: 1,
    quality_grade: 'A',
    expiry_months: 24
  });

  const readyLots = lots.filter(lot => lot.status === 'ready_for_packing');
  const packSizes = ['250g', '500g', '1kg', '2kg', '5kg', '10kg', 'Bulk-25kg'];
  const qualityGrades = ['A - Premium', 'B - Standard', 'C - Basic'];

  const generateQRCode = (product: PackedProduct) => {
    return `QR-${product.lot_id}-${product.id}-${Date.now()}`;
  };

  const generateBatchNumber = (lotId: string) => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${lotId}-${year}${month}${day}`;
  };

  const calculateExpiryDate = (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const handleAddPackedProduct = () => {
    if (!selectedLot || !currentPacking.product_name) {
      alert('Please select lot and enter product name');
      return;
    }

    const newProduct: PackedProduct = {
      id: `PACK-${Date.now()}`,
      lot_id: selectedLot,
      product_name: currentPacking.product_name,
      pack_size: currentPacking.pack_size,
      quantity_packed: currentPacking.quantity_packed,
      total_weight: currentPacking.quantity_packed * parseFloat(currentPacking.pack_size.replace(/[^0-9.]/g, '')),
      qr_code: '',
      batch_number: generateBatchNumber(selectedLot),
      packing_date: new Date().toISOString().split('T')[0],
      expiry_date: calculateExpiryDate(currentPacking.expiry_months),
      quality_grade: currentPacking.quality_grade,
      packed_by: currentUser.full_name
    };

    // Generate QR Code
    newProduct.qr_code = generateQRCode(newProduct);

    setPackedProducts([...packedProducts, newProduct]);
    
    // Reset form
    setCurrentPacking({
      product_name: '',
      pack_size: '1kg',
      quantity_packed: 1,
      quality_grade: 'A',
      expiry_months: 24
    });
  };

  const handlePrintQRLabel = (product: PackedProduct) => {
    // Create printable QR label data
    const labelData = {
      product_name: product.product_name,
      batch_number: product.batch_number,
      pack_size: product.pack_size,
      packing_date: product.packing_date,
      expiry_date: product.expiry_date,
      quality_grade: product.quality_grade,
      qr_code: product.qr_code,
      lot_id: product.lot_id,
      traceability: {
        supervisor: product.packed_by,
        processing_facility: 'FlavorCore Processing Unit',
        certification: 'Organic Certified'
      }
    };

    // Create downloadable/printable label
    const printContent = `
      <div style="border: 2px solid #000; padding: 20px; width: 300px; font-family: Arial;">
        <h2 style="text-align: center; margin: 0;">${product.product_name}</h2>
        <div style="text-align: center; margin: 10px 0;">
          <div style="border: 1px solid #000; padding: 10px; display: inline-block;">
            QR CODE PLACEHOLDER<br>
            ${product.qr_code}
          </div>
        </div>
        <p><strong>Batch:</strong> ${product.batch_number}</p>
        <p><strong>Pack Size:</strong> ${product.pack_size}</p>
        <p><strong>Grade:</strong> ${product.quality_grade}</p>
        <p><strong>Packed:</strong> ${product.packing_date}</p>
        <p><strong>Expires:</strong> ${product.expiry_date}</p>
        <p><strong>Lot ID:</strong> ${product.lot_id}</p>
        <p style="font-size: 10px; margin-top: 20px;">
          Packed by: ${product.packed_by}<br>
          FlavorCore Processing - Organic Certified
        </p>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSubmitToManagers = async () => {
    if (!selectedLot || packedProducts.length === 0) {
      alert('Please select lot and add packed products');
      return;
    }

    const selectedLotData = lots.find(l => l.lot_id === selectedLot);
    const totalOutputWeight = packedProducts.reduce((sum, p) => sum + p.total_weight, 0);
    const yieldPercentage = selectedLotData ? (totalOutputWeight / selectedLotData.threshed_weight) * 100 : 0;

    const submissionForm: SubmissionForm = {
      lot_id: selectedLot,
      packed_products: packedProducts,
      total_input_weight: selectedLotData?.threshed_weight || 0,
      total_output_weight: totalOutputWeight,
      yield_percentage: yieldPercentage,
      quality_notes: `Processed and packed by ${currentUser.full_name}. All products meet quality standards.`,
      supervisor_signature: currentUser.full_name,
      submission_timestamp: new Date().toISOString(),
      status: 'pending_flavorcore_approval'
    };

    try {
      // Submit to FlavorCore Manager first, then HarvestFlow Manager + Admin
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/submit-packed-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...submissionForm,
          notification_recipients: [
            { role: 'flavorcore_manager', action: 'approve' },
            { role: 'harvestflow_manager', action: 'view_pending' },
            { role: 'admin', action: 'view_override' }
          ]
        })
      });

      alert(`Submission successful! 
      
Packed Products Summary:
- Lot: ${selectedLot}
- Products: ${packedProducts.length} items
- Total Weight: ${totalOutputWeight.toFixed(1)} kg
- Yield: ${yieldPercentage.toFixed(1)}%

📋 Approval Workflow:
1. ✅ Submitted to FlavorCore Manager for approval
2. ⏳ Pending HarvestFlow Manager review
3. ⏳ Admin override available if needed
4. ⏳ Upon approval: Entry into inventory system

Your submission is now in the approval queue.`);

      // Reset form
      setSelectedLot('');
      setPackedProducts([]);
      onRefresh();

    } catch (error: any) {
      alert('Submission failed: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📦 Final Product Packing & QR Labeling</h2>

      {/* Lot Selection */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Select Lot for Packing</h3>
        <select
          value={selectedLot}
          onChange={(e) => {
            setSelectedLot(e.target.value);
            setPackedProducts([]);
          }}
          className="w-full p-3 border rounded-lg text-lg"
        >
          <option value="">Choose a lot ready for packing...</option>
          {readyLots.map(lot => (
            <option key={lot.lot_id} value={lot.lot_id}>
              {lot.lot_id} - {lot.crop} ({lot.threshed_weight} kg processed)
            </option>
          ))}
        </select>
      </Card>

      {selectedLot && (
        <>
          {/* Packing Form */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Pack Product</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name:</label>
                <input
                  type="text"
                  value={currentPacking.product_name}
                  onChange={(e) => setCurrentPacking({...currentPacking, product_name: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  placeholder="e.g., Organic Black Pepper Whole"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pack Size:</label>
                <select
                  value={currentPacking.pack_size}
                  onChange={(e) => setCurrentPacking({...currentPacking, pack_size: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                >
                  {packSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  value={currentPacking.quantity_packed}
                  onChange={(e) => setCurrentPacking({...currentPacking, quantity_packed: parseInt(e.target.value)})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quality Grade:</label>
                <select
                  value={currentPacking.quality_grade}
                  onChange={(e) => setCurrentPacking({...currentPacking, quality_grade: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                >
                  {qualityGrades.map(grade => (
                    <option key={grade} value={grade.split(' ')[0]}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Shelf Life (months):</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={currentPacking.expiry_months}
                  onChange={(e) => setCurrentPacking({...currentPacking, expiry_months: parseInt(e.target.value)})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleAddPackedProduct}
                  className="w-full bg-green-600 hover:bg-green-700 h-12"
                >
                  <Box className="mr-2" size={20} />
                  Add Packed Product
                </Button>
              </div>
            </div>
          </Card>

          {/* Packed Products List */}
          {packedProducts.length > 0 && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Packed Products</h3>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Products: {packedProducts.length}</p>
                  <p className="text-sm text-gray-600">Total Weight: {packedProducts.reduce((sum, p) => sum + p.total_weight, 0).toFixed(1)} kg</p>
                </div>
              </div>

              <div className="space-y-4">
                {packedProducts.map((product, index) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{product.product_name}</h4>
                        <p className="text-sm text-gray-600">
                          Batch: {product.batch_number} | Pack: {product.pack_size} × {product.quantity_packed} = {product.total_weight} kg
                        </p>
                        <p className="text-sm text-gray-600">
                          Grade: {product.quality_grade} | Packed: {product.packing_date} | Expires: {product.expiry_date}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded flex items-center justify-center mb-2">
                          <QrCode size={40} className="text-gray-400" />
                        </div>
                        <p className="text-xs font-mono">{product.qr_code.slice(-8)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePrintQRLabel(product)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Printer className="mr-2" size={16} />
                        Print QR Label
                      </Button>
                      <Button
                        onClick={() => setPackedProducts(packedProducts.filter(p => p.id !== product.id))}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit to Managers */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="text-yellow-600 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-yellow-800">Approval Workflow</p>
                    <p className="text-sm text-yellow-700">
                      1. FlavorCore Manager → Approves quality & processing<br/>
                      2. HarvestFlow Manager → Reviews for inventory entry<br/>
                      3. Admin → Override capability if managers unavailable<br/>
                      4. Upon approval → Automatic inventory system entry
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={handleSubmitToManagers}
                  className="w-full bg-orange-600 hover:bg-orange-700 h-12"
                >
                  <Send className="mr-2" size={20} />
                  Submit to FlavorCore Manager → HarvestFlow Manager → Admin
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// Submission Tracking Tab (NEW)
function SubmissionTrackingTab({ currentUser }: { currentUser: any }) {
  const [submissions, setSubmissions] = useState<SubmissionForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/my-submissions?supervisor_id=${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data || []);
      } else {
        // Mock data
        setSubmissions([
          {
            lot_id: 'LOT-2024-001',
            packed_products: [
              { id: '1', product_name: 'Organic Black Pepper Whole', pack_size: '1kg', quantity_packed: 50 } as PackedProduct
            ],
            total_input_weight: 850,
            total_output_weight: 800,
            yield_percentage: 94.1,
            quality_notes: 'Excellent quality processing',
            supervisor_signature: currentUser.full_name,
            submission_timestamp: new Date().toISOString(),
            status: 'pending_flavorcore_approval'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_flavorcore_approval': return 'bg-yellow-100 text-yellow-800';
      case 'pending_harvestflow_approval': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📋 My Submissions & Approval Status</h2>

      {submissions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">No submissions yet. Complete packing to create submissions.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission, index) => (
            <Card key={index} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{submission.lot_id}</h3>
                  <p className="text-sm text-gray-600">
                    Submitted: {new Date(submission.submission_timestamp).toLocaleString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(submission.status)}`}>
                  {submission.status.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Products Packed</p>
                  <p className="text-lg font-bold">{submission.packed_products.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Output</p>
                  <p className="text-lg font-bold">{submission.total_output_weight} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Yield</p>
                  <p className="text-lg font-bold">{submission.yield_percentage.toFixed(1)}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Packed Products:</h4>
                {submission.packed_products.map((product, pidx) => (
                  <div key={pidx} className="text-sm bg-gray-50 p-2 rounded">
                    {product.product_name} - {product.pack_size} × {product.quantity_packed}
                  </div>
                ))}
              </div>

              {submission.quality_notes && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm"><strong>Quality Notes:</strong> {submission.quality_notes}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// RFID In-Scan Tab (Simplified version)
function RFIDInScanTab({ lots, onRefresh }: { lots: ProcessingLot[]; onRefresh: () => void }) {
  const [selectedLot, setSelectedLot] = useState<string>('');
  const [sessionActive, setSessionActive] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📱 RFID In-Scan Operations</h2>
      
      <Card className="p-6">
        <p className="text-gray-600">RFID scanning functionality for processing lots.</p>
        <div className="mt-4">
          <select
            value={selectedLot}
            onChange={(e) => setSelectedLot(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Choose lot to scan...</option>
            {lots.map(lot => (
              <option key={lot.lot_id} value={lot.lot_id}>
                {lot.lot_id} - {lot.crop}
              </option>
            ))}
          </select>
        </div>
      </Card>
    </div>
  );
}

// Drying Samples Tab (Simplified version)
function DryingSamplesTab({ lots }: { lots: ProcessingLot[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">🧪 Drying & Sample Logging</h2>
      
      <Card className="p-6">
        <p className="text-gray-600">Quality sampling and drying process documentation.</p>
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