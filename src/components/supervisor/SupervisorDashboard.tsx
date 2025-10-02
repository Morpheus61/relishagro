import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface SupervisorDashboardProps {
  userId: string;
  userRole: string;
  onLogout: () => void;
}

interface Lot {
  lot_id: string;
  crop: string;
  threshed_weight: number;
}

export function SupervisorDashboard({ userId, userRole, onLogout }: SupervisorDashboardProps) {
  const [activeSection, setActiveSection] = useState<'rfid' | 'drying' | 'qr'>('rfid');
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);

  const [rfidScan, setRfidScan] = useState({
    lotId: '',
    weight: ''
  });

  const [dryingSchedule, setDryingSchedule] = useState({
    product: '',
    timeIn: '',
    timeOut: ''
  });

  const [qrLabel, setQrLabel] = useState({
    productName: '',
    batchId: '',
    weight: ''
  });

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = async () => {
    try {
      const { data, error } = await supabase
        .from('lots')
        .select('lot_id, crop, threshed_weight')
        .order('date_harvested', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLots(data || []);
    } catch (error) {
      console.error('Error loading lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRFIDScan = async () => {
    if (!rfidScan.lotId || !rfidScan.weight) {
      alert('Please select lot and enter weight');
      return;
    }

    try {
      const { error } = await supabase
        .from('flavorcore_processing')
        .insert({
          lot_id: rfidScan.lotId,
          in_scan_weight: parseFloat(rfidScan.weight),
          processed_date: new Date().toISOString().split('T')[0],
          handled_by: userId
        });

      if (error) throw error;
      alert('RFID scan recorded successfully');
      setRfidScan({ lotId: '', weight: '' });
    } catch (error: any) {
      console.error('Error recording RFID scan:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDryingSchedule = () => {
    if (!dryingSchedule.product || !dryingSchedule.timeIn || !dryingSchedule.timeOut) {
      alert('Please fill all fields');
      return;
    }

    alert(`Drying schedule logged: ${dryingSchedule.product} from ${dryingSchedule.timeIn} to ${dryingSchedule.timeOut}`);
    setDryingSchedule({ product: '', timeIn: '', timeOut: '' });
  };

  const generateQRLabel = async () => {
    if (!qrLabel.productName || !qrLabel.batchId) {
      alert('Please fill required fields');
      return;
    }

    try {
      const qrCode = `QR-${qrLabel.batchId}-${Date.now()}`;
      
      const { error } = await supabase
        .from('products')
        .insert({
          name: qrLabel.productName,
          batch_id: qrLabel.batchId,
          qr_code: qrCode
        });

      if (error) throw error;
      alert(`QR Label generated: ${qrCode}`);
      setQrLabel({ productName: '', batchId: '', weight: '' });
    } catch (error: any) {
      console.error('Error generating QR label:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">FlavorCore Supervisor Dashboard</h1>
            <p className="text-purple-100">RFID Scanning & Product Management</p>
          </div>
          <Button onClick={onLogout} className="bg-purple-700 hover:bg-purple-800">
            Logout
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {userId}</h2>
        <p className="text-gray-600">Role: <span className="font-semibold">{userRole}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Button
          onClick={() => setActiveSection('rfid')}
          className={`p-6 h-auto flex flex-col items-start ${activeSection === 'rfid' ? 'bg-indigo-600' : 'bg-white text-gray-800 border'}`}
        >
          <h3 className="text-lg font-semibold mb-2">RFID In-Scan</h3>
          <p className="text-sm">Scan incoming products from HarvestFlow</p>
        </Button>

        <Button
          onClick={() => setActiveSection('drying')}
          className={`p-6 h-auto flex flex-col items-start ${activeSection === 'drying' ? 'bg-indigo-600' : 'bg-white text-gray-800 border'}`}
        >
          <h3 className="text-lg font-semibold mb-2">Drying Schedules</h3>
          <p className="text-sm">Log product drying times</p>
        </Button>

        <Button
          onClick={() => setActiveSection('qr')}
          className={`p-6 h-auto flex flex-col items-start ${activeSection === 'qr' ? 'bg-indigo-600' : 'bg-white text-gray-800 border'}`}
        >
          <h3 className="text-lg font-semibold mb-2">QR Label Generation</h3>
          <p className="text-sm">Create labels for finished products</p>
        </Button>
      </div>

      {activeSection === 'rfid' && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">RFID In-Scan</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Lot</label>
                <select
                  className="w-full p-3 border rounded-lg"
                  value={rfidScan.lotId}
                  onChange={(e) => setRfidScan({ ...rfidScan, lotId: e.target.value })}
                >
                  <option value="">Select lot</option>
                  {lots.map(lot => (
                    <option key={lot.lot_id} value={lot.lot_id}>
                      {lot.lot_id} - {lot.crop} ({lot.threshed_weight}kg)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Verified Weight (kg)</label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg"
                  placeholder="Enter weight"
                  value={rfidScan.weight}
                  onChange={(e) => setRfidScan({ ...rfidScan, weight: e.target.value })}
                />
              </div>
              <Button
                onClick={handleRFIDScan}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Record RFID Scan
              </Button>
            </div>
          )}
        </Card>
      )}

      {activeSection === 'drying' && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Drying Schedule</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={dryingSchedule.product}
                onChange={(e) => setDryingSchedule({ ...dryingSchedule, product: e.target.value })}
              >
                <option value="">Select product</option>
                <option value="Cloves">Cloves</option>
                <option value="Black Pepper">Black Pepper</option>
                <option value="Nutmeg">Nutmeg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time In</label>
              <input
                type="datetime-local"
                className="w-full p-3 border rounded-lg"
                value={dryingSchedule.timeIn}
                onChange={(e) => setDryingSchedule({ ...dryingSchedule, timeIn: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time Out (Expected)</label>
              <input
                type="datetime-local"
                className="w-full p-3 border rounded-lg"
                value={dryingSchedule.timeOut}
                onChange={(e) => setDryingSchedule({ ...dryingSchedule, timeOut: e.target.value })}
              />
            </div>
            <Button
              onClick={handleDryingSchedule}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Log Drying Schedule
            </Button>
          </div>
        </Card>
      )}

      {activeSection === 'qr' && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Generate QR Label</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="e.g., Premium Cloves"
                value={qrLabel.productName}
                onChange={(e) => setQrLabel({ ...qrLabel, productName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Batch ID</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="BATCH-001"
                value={qrLabel.batchId}
                onChange={(e) => setQrLabel({ ...qrLabel, batchId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Net Weight (kg)</label>
              <input
                type="number"
                className="w-full p-3 border rounded-lg"
                placeholder="Enter weight"
                value={qrLabel.weight}
                onChange={(e) => setQrLabel({ ...qrLabel, weight: e.target.value })}
              />
            </div>
            <Button
              onClick={generateQRLabel}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Generate QR Label
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}