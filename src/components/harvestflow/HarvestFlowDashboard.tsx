// src/components/harvestflow/HarvestFlowDashboard.tsx
import { useState } from 'react'; // ✅ Remove unused 'React' import
import { Button } from '../ui/button';    // ✅ Fix: '../ui' not '../../ui'
import { Card } from '../ui/card';        // ✅ Fix: '../ui' not '../../ui'

interface HarvestFlowDashboardProps {

}

export function HarvestFlowDashboard({}: HarvestFlowDashboardProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'harvest' | 'wages'>('daily');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-green-800 text-white p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.location.href = '/'}
            className="text-white hover:bg-green-700"
          >
            ←
          </Button>
          <h1 className="text-lg">HarvestFlow Dashboard</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Tabs */}
        <div className="flex space-x-4 border-b">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'daily' ? 'border-b-2 border-white text-white' : 'text-gray-300'}`}
            onClick={() => setActiveTab('daily')}
          >
            Daily Work
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'harvest' ? 'border-b-2 border-white text-white' : 'text-gray-300'}`}
            onClick={() => setActiveTab('harvest')}
          >
            Harvesting
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'wages' ? 'border-b-2 border-white text-white' : 'text-gray-300'}`}
            onClick={() => setActiveTab('wages')}
          >
            Wages
          </button>
        </div>

        {activeTab === 'daily' && (
          <div className="space-y-6">
            <Card className="p-4">
              <h2 className="text-lg mb-4">Assign Daily Work</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Select Job</label>
                  <select className="w-full p-2 border rounded">
                    <option>Weeding</option>
                    <option>Fertilizing</option>
                    <option>Pruning</option>
                    <option>Pest Control</option>
                    <option>Planting/Re-Planting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Select Area</label>
                  <select className="w-full p-2 border rounded">
                    <option>North Block A</option>
                    <option>East Grove</option>
                    <option>South Block B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Select Staff</label>
                  <select multiple className="w-full p-2 border rounded">
                    <option>Ramesh Kumar</option>
                    <option>Suresh Patil</option>
                    <option>Priya Nair</option>
                  </select>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Submit Assignment
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'harvest' && (
          <div className="space-y-6">
            <Card className="p-4">
              <h2 className="text-lg mb-4">Assign Harvest Job</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Select Crop</label>
                  <select className="w-full p-2 border rounded">
                    <option>Cloves</option>
                    <option>Black Pepper</option>
                    <option>Nutmeg</option>
                    <option>Cardamom</option>
                    <option>Cinnamon</option>
                    <option>Coconut</option>
                    <option>Jackfruit</option>
                    <option>Areca Nut</option>
                    <option>Cotton</option>
                    <option>Clove Leaves</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Select Staff</label>
                  <select multiple className="w-full p-2 border rounded">
                    <option>Ramesh Kumar</option>
                    <option>Suresh Patil</option>
                    <option>Priya Nair</option>
                  </select>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Submit Assignment
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'wages' && (
          <div className="space-y-6">
            <Card className="p-4">
              <h2 className="text-lg mb-4">Wage Calculation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Select Worker</label>
                  <select className="w-full p-2 border rounded">
                    <option>Ramesh Kumar</option>
                    <option>Suresh Patil</option>
                    <option>Priya Nair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Crop Type</label>
                  <select className="w-full p-2 border rounded">
                    <option>Cloves</option>
                    <option>Black Pepper</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Harvested Weight (kg)</label>
                  <input type="number" className="w-full p-2 border rounded" placeholder="Enter weight" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Threshed Weight (kg)</label>
                  <input type="number" className="w-full p-2 border rounded" placeholder="Enter weight" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Rate per kg (₹)</label>
                  <input type="number" className="w-full p-2 border rounded" placeholder="Enter rate" />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Calculate Wage
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}