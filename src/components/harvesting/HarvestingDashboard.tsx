import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface HarvestingDashboardProps {
  userId: string;
  userRole: string;
  onLogout: () => void;
}

interface Worker {
  id: string;
  staff_id: string;
  full_name: string;
}

export function HarvestingDashboard({ userId, userRole, onLogout }: HarvestingDashboardProps) {
  const [activeSection, setActiveSection] = useState<'attendance' | 'assign' | 'log' | 'request'>('attendance');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const [harvestLog, setHarvestLog] = useState({
    workerId: '',
    crop: '',
    weight: ''
  });

  const [request, setRequest] = useState({
    type: '',
    description: '',
    amount: ''
  });

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('person_records')
        .select('id, staff_id, full_name')
        .eq('person_type', 'staff')
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (workerId: string) => {
    try {
      const { error } = await supabase
        .from('attendance_logs')
        .insert({
          person_id: workerId,
          method: 'manual',
          location: 'harvest_field'
        });

      if (error) throw error;
      alert('Attendance marked successfully');
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const logHarvest = async () => {
    if (!harvestLog.workerId || !harvestLog.crop || !harvestLog.weight) {
      alert('Please fill all fields');
      return;
    }

    alert(`Harvest logged: ${harvestLog.weight}kg of ${harvestLog.crop}`);
    setHarvestLog({ workerId: '', crop: '', weight: '' });
  };

  const submitRequest = async () => {
    if (!request.type || !request.description) {
      alert('Please fill required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('onboarding_pending')
        .insert({
          entity_type: 'staff',
          data: {
            type: request.type,
            description: request.description,
            amount: request.amount
          },
          submitted_by: userId,
          status: 'pending'
        });

      if (error) throw error;
      alert('Request submitted for approval');
      setRequest({ type: '', description: '', amount: '' });
    } catch (error: any) {
      console.error('Error submitting request:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="bg-gradient-to-r from-green-700 to-lime-700 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Harvesting Dashboard</h1>
            <p className="text-green-100">Field Operations & Harvest Logging</p>
          </div>
          <Button onClick={onLogout} className="bg-green-800 hover:bg-green-900">
            Logout
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {userId}</h2>
        <p className="text-gray-600">Role: <span className="font-semibold">{userRole}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Button
          onClick={() => setActiveSection('attendance')}
          className={`p-4 h-auto ${activeSection === 'attendance' ? 'bg-blue-600' : 'bg-white text-gray-800 border'}`}
        >
          Daily Attendance
        </Button>
        <Button
          onClick={() => setActiveSection('assign')}
          className={`p-4 h-auto ${activeSection === 'assign' ? 'bg-green-600' : 'bg-white text-gray-800 border'}`}
        >
          Assign Jobs
        </Button>
        <Button
          onClick={() => setActiveSection('log')}
          className={`p-4 h-auto ${activeSection === 'log' ? 'bg-orange-600' : 'bg-white text-gray-800 border'}`}
        >
          Log Harvest
        </Button>
        <Button
          onClick={() => setActiveSection('request')}
          className={`p-4 h-auto ${activeSection === 'request' ? 'bg-purple-600' : 'bg-white text-gray-800 border'}`}
        >
          Request Resources
        </Button>
      </div>

      {activeSection === 'attendance' && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Daily Attendance</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {workers.map(worker => (
                <div key={worker.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>{worker.full_name} ({worker.staff_id})</span>
                  <Button
                    onClick={() => markAttendance(worker.id)}
                    className="bg-green-600 hover:bg-green-700 text-xs px-4 py-1"
                  >
                    Mark Present
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeSection === 'assign' && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Assign Harvest Job</h3>
          <p className="text-gray-600">Job assignment functionality</p>
        </Card>
      )}

      {activeSection === 'log' && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Log Harvest Data</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Worker</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={harvestLog.workerId}
                onChange={(e) => setHarvestLog({ ...harvestLog, workerId: e.target.value })}
              >
                <option value="">Select worker</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.full_name} ({worker.staff_id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Crop</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={harvestLog.crop}
                onChange={(e) => setHarvestLog({ ...harvestLog, crop: e.target.value })}
              >
                <option value="">Select crop</option>
                <option value="Cloves">Cloves</option>
                <option value="Black Pepper">Black Pepper</option>
                <option value="Nutmeg">Nutmeg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Weight (kg)</label>
              <input
                type="number"
                className="w-full p-3 border rounded-lg"
                placeholder="Enter weight"
                value={harvestLog.weight}
                onChange={(e) => setHarvestLog({ ...harvestLog, weight: e.target.value })}
              />
            </div>
            <Button
              onClick={logHarvest}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Log Harvest
            </Button>
          </div>
        </Card>
      )}

      {activeSection === 'request' && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Request Resources</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Request Type</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={request.type}
                onChange={(e) => setRequest({ ...request, type: e.target.value })}
              >
                <option value="">Select type</option>
                <option value="provisions">Provisions</option>
                <option value="wages">Wages</option>
                <option value="spares">Spares/Tools</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                className="w-full p-3 border rounded-lg"
                placeholder="Describe what you need"
                rows={3}
                value={request.description}
                onChange={(e) => setRequest({ ...request, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount (if applicable)</label>
              <input
                type="number"
                className="w-full p-3 border rounded-lg"
                placeholder="Enter amount"
                value={request.amount}
                onChange={(e) => setRequest({ ...request, amount: e.target.value })}
              />
            </div>
            <Button
              onClick={submitRequest}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Submit Request
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}