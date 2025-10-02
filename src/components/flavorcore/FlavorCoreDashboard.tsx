import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { supabase } from '../../lib/supabase';

interface FlavorCoreDashboardProps {
  userId: string;
  userRole: string;
  onLogout: () => void;
}

interface Lot {
  lot_id: string;
  crop: string;
  threshed_weight: number;
}

interface Product {
  id: string;
  name: string;
}

export function FlavorCoreDashboard({ userId, userRole, onLogout }: FlavorCoreDashboardProps) {
  const [activeTab, setActiveTab] = useState<'rfid' | 'drying' | 'inventory'>('rfid');
  const [lots, setLots] = useState<Lot[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // RFID Form State
  const [rfidScan, setRfidScan] = useState({
    lotId: '',
    sackCount: '',
    currentSack: 1,
    scannedTags: [] as string[]
  });

  // Drying Form State
  const [dryingUnit, setDryingUnit] = useState({
    product: '',
    trayId: '',
    chamber: ''
  });

  // Inventory Form State
  const [inventory, setInventory] = useState({
    product: '',
    batchNumber: '',
    weight: ''
  });

  useEffect(() => {
    loadLots();
    loadProducts();
  }, []);

  const loadLots = async () => {
    try {
      const { data, error } = await supabase
        .from('lots')
        .select('lot_id, crop, threshed_weight')
        .order('date_harvested', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLots(data || []);
    } catch (error) {
      console.error('Error loading lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const submitRFIDScan = async () => {
    if (!rfidScan.lotId || !rfidScan.sackCount) {
      alert('Please enter lot ID and sack count');
      return;
    }

    try {
      const { error } = await supabase
        .from('dispatches')
        .insert({
          lot_id: rfidScan.lotId,
          sack_count: parseInt(rfidScan.sackCount),
          rfid_tags: rfidScan.scannedTags
        });

      if (error) throw error;
      alert('RFID scan completed successfully');
      setRfidScan({ lotId: '', sackCount: '', currentSack: 1, scannedTags: [] });
    } catch (error: any) {
      console.error('Error submitting RFID scan:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const startDrying = async () => {
    if (!dryingUnit.product || !dryingUnit.trayId || !dryingUnit.chamber) {
      alert('Please fill all fields');
      return;
    }

    alert(`Drying started for ${dryingUnit.product} in ${dryingUnit.chamber}`);
    setDryingUnit({ product: '', trayId: '', chamber: '' });
  };

  const addToInventory = async () => {
    if (!inventory.product || !inventory.batchNumber || !inventory.weight) {
      alert('Please fill all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('inventory')
        .insert({
          product_id: inventory.product,
          quantity: parseFloat(inventory.weight)
        });

      if (error) throw error;
      alert('Added to inventory successfully');
      setInventory({ product: '', batchNumber: '', weight: '' });
    } catch (error: any) {
      console.error('Error adding to inventory:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-purple-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">FlavorCore Manager Dashboard</h1>
            <p className="text-purple-100">Processing Management</p>
          </div>
          <Button onClick={onLogout} className="bg-purple-700 hover:bg-purple-800">
            Logout
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 mx-4">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {userId}</h2>
        <p className="text-gray-600">Role: <span className="font-semibold">{userRole}</span></p>
      </div>

      <div className="p-4 space-y-6">
        <div className="flex space-x-4 border-b bg-white p-2 rounded-t-lg">
          <button
            className={`px-4 py-2 font-medium rounded ${activeTab === 'rfid' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('rfid')}
          >
            RFID In-Scan
          </button>
          <button
            className={`px-4 py-2 font-medium rounded ${activeTab === 'drying' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('drying')}
          >
            Drying Unit
          </button>
          <button
            className={`px-4 py-2 font-medium rounded ${activeTab === 'inventory' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
        </div>

        {activeTab === 'rfid' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">RFID In-Scan</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Lot ID</label>
                    <select 
                      className="w-full p-3 border rounded-lg"
                      value={rfidScan.lotId}
                      onChange={(e) => setRfidScan({...rfidScan, lotId: e.target.value})}
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
                    <label className="block text-sm font-medium mb-2">Sack Count</label>
                    <input 
                      type="number" 
                      className="w-full p-3 border rounded-lg" 
                      placeholder="Enter count"
                      value={rfidScan.sackCount}
                      onChange={(e) => setRfidScan({...rfidScan, sackCount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Scan RFID Tags</label>
                    <div className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Tap to scan sack #{rfidScan.currentSack}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={submitRFIDScan}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Complete Scan
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'drying' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Drying Unit</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product</label>
                  <select 
                    className="w-full p-3 border rounded-lg"
                    value={dryingUnit.product}
                    onChange={(e) => setDryingUnit({...dryingUnit, product: e.target.value})}
                  >
                    <option value="">Select product</option>
                    <option value="Cloves">Cloves</option>
                    <option value="Black Pepper">Black Pepper</option>
                    <option value="Nutmeg">Nutmeg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tray/Trolley ID</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border rounded-lg" 
                    placeholder="TRAY-001"
                    value={dryingUnit.trayId}
                    onChange={(e) => setDryingUnit({...dryingUnit, trayId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Drying Chamber</label>
                  <select 
                    className="w-full p-3 border rounded-lg"
                    value={dryingUnit.chamber}
                    onChange={(e) => setDryingUnit({...dryingUnit, chamber: e.target.value})}
                  >
                    <option value="">Select chamber</option>
                    <option value="Chamber A">Chamber A</option>
                    <option value="Chamber B">Chamber B</option>
                  </select>
                </div>
                <Button 
                  onClick={startDrying}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Start Drying
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Inventory</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product</label>
                  <select 
                    className="w-full p-3 border rounded-lg"
                    value={inventory.product}
                    onChange={(e) => setInventory({...inventory, product: e.target.value})}
                  >
                    <option value="">Select product</option>
                    <option value="Cloves">Cloves</option>
                    <option value="Black Pepper">Black Pepper</option>
                    <option value="Nutmeg">Nutmeg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Batch Number</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border rounded-lg" 
                    placeholder="BATCH-001"
                    value={inventory.batchNumber}
                    onChange={(e) => setInventory({...inventory, batchNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border rounded-lg" 
                    placeholder="Enter weight"
                    value={inventory.weight}
                    onChange={(e) => setInventory({...inventory, weight: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={addToInventory}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Add to Inventory
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}