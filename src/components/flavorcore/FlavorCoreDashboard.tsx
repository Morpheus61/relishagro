// src/components/flavorcore/FlavorCoreDashboard.tsx
import { useState } from 'react'; // ✅ Remove unused 'React' import
import { Button } from '../ui/button';    // ✅ Fix: '../ui' not '../../ui'
import { Card } from '../ui/card';        // ✅ Fix: '../ui' not '../../ui'

interface FlavorCoreDashboardProps {
  // Remove unused 'session' prop
}

export function FlavorCoreDashboard({}: FlavorCoreDashboardProps) {
  const [activeTab, setActiveTab] = useState<'rfid' | 'drying' | 'inventory'>('rfid');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-800 text-white p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.location.href = '/'}
            className="text-white hover:bg-blue-700"
          >
            ←
          </Button>
          <h1 className="text-lg">FlavorCore Dashboard</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Tabs */}
        <div className="flex space-x-4 border-b">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'rfid' ? 'border-b-2 border-white text-white' : 'text-gray-300'}`}
            onClick={() => setActiveTab('rfid')}
          >
            RFID In-Scan
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'drying' ? 'border-b-2 border-white text-white' : 'text-gray-300'}`}
            onClick={() => setActiveTab('drying')}
          >
            Drying Unit
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'inventory' ? 'border-b-2 border-white text-white' : 'text-gray-300'}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
        </div>

        {activeTab === 'rfid' && (
          <div className="space-y-6">
            <Card className="p-4">
              <h2 className="text-lg mb-4">RFID In-Scan</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Lot ID</label>
                  <input type="text" className="w-full p-2 border rounded" placeholder="LOT-CLOVES-20250405-123" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Sack Count</label>
                  <input type="number" className="w-full p-2 border rounded" placeholder="Enter count" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Scan RFID Tags</label>
                  <div className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Tap to scan sack #1</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Scan Sack #1
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'drying' && (
          <div className="space-y-6">
            <Card className="p-4">
              <h2 className="text-lg mb-4">Drying Unit</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Product</label>
                  <select className="w-full p-2 border rounded">
                    <option>Cloves</option>
                    <option>Black Pepper</option>
                    <option>Nutmeg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Tray/Trolley ID</label>
                  <input type="text" className="w-full p-2 border rounded" placeholder="TRAY-001" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Drying Chamber</label>
                  <select className="w-full p-2 border rounded">
                    <option>Chamber A</option>
                    <option>Chamber B</option>
                  </select>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Start Drying
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <Card className="p-4">
              <h2 className="text-lg mb-4">Inventory</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Product</label>
                  <select className="w-full p-2 border rounded">
                    <option>Cloves</option>
                    <option>Black Pepper</option>
                    <option>Nutmeg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Batch Number</label>
                  <input type="text" className="w-full p-2 border rounded" placeholder="BATCH-001" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Weight (kg)</label>
                  <input type="number" className="w-full p-2 border rounded" placeholder="Enter weight" />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
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