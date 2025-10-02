import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { supabase } from '../../lib/supabase';

interface HarvestFlowDashboardProps {
  userId: string;
  userRole: string;
  onLogout: () => void;
}

interface Worker {
  id: string;
  staff_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

interface Job {
  id: string;
  name: string;
  category: string;
}

export function HarvestFlowDashboard({ userId, userRole, onLogout }: HarvestFlowDashboardProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'harvest' | 'wages'>('daily');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Daily Work Form State
  const [dailyWork, setDailyWork] = useState({
    jobId: '',
    area: '',
    selectedWorkers: [] as string[]
  });

  // Harvest Form State
  const [harvestJob, setHarvestJob] = useState({
    crop: '',
    selectedWorkers: [] as string[]
  });

  // Wage Form State
  const [wageCalc, setWageCalc] = useState({
    workerId: '',
    cropType: '',
    harvestedWeight: '',
    threshedWeight: '',
    ratePerKg: ''
  });

  useEffect(() => {
    loadWorkers();
    loadJobs();
  }, []);

  const loadWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('person_records')
        .select('id, staff_id, first_name, last_name, full_name')
        .eq('person_type', 'staff')
        .eq('status', 'active')
        .order('first_name');

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_jobs')
        .select('id, name, category')
        .order('name');

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleWorkerSelection = (workerId: string, type: 'daily' | 'harvest') => {
    if (type === 'daily') {
      const selected = dailyWork.selectedWorkers.includes(workerId)
        ? dailyWork.selectedWorkers.filter(id => id !== workerId)
        : [...dailyWork.selectedWorkers, workerId];
      setDailyWork({ ...dailyWork, selectedWorkers: selected });
    } else {
      const selected = harvestJob.selectedWorkers.includes(workerId)
        ? harvestJob.selectedWorkers.filter(id => id !== workerId)
        : [...harvestJob.selectedWorkers, workerId];
      setHarvestJob({ ...harvestJob, selectedWorkers: selected });
    }
  };

  const submitDailyWork = async () => {
    if (!dailyWork.jobId || dailyWork.selectedWorkers.length === 0) {
      alert('Please select job and workers');
      return;
    }

    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          job_id: dailyWork.jobId,
          date: new Date().toISOString().split('T')[0],
          workers_involved: dailyWork.selectedWorkers.length,
          notes: `Area: ${dailyWork.area}`,
          recorded_by: userId
        });

      if (error) throw error;
      alert('Daily work assignment submitted successfully');
      setDailyWork({ jobId: '', area: '', selectedWorkers: [] });
    } catch (error: any) {
      console.error('Error submitting daily work:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const submitHarvestJob = async () => {
    if (!harvestJob.crop || harvestJob.selectedWorkers.length === 0) {
      alert('Please select crop and workers');
      return;
    }

    try {
      const lotId = `LOT-${harvestJob.crop.toUpperCase()}-${Date.now()}`;
      
      const { error } = await supabase
        .from('lots')
        .insert({
          lot_id: lotId,
          crop: harvestJob.crop,
          date_harvested: new Date().toISOString().split('T')[0],
          created_by: userId
        });

      if (error) throw error;
      alert(`Harvest job created: ${lotId}`);
      setHarvestJob({ crop: '', selectedWorkers: [] });
    } catch (error: any) {
      console.error('Error submitting harvest job:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const calculateWage = () => {
    const { harvestedWeight, threshedWeight, ratePerKg } = wageCalc;
    
    if (!harvestedWeight || !ratePerKg) {
      alert('Please enter harvested weight and rate');
      return;
    }

    const weight = parseFloat(threshedWeight || harvestedWeight);
    const rate = parseFloat(ratePerKg);
    const totalWage = weight * rate;

    alert(`Calculated Wage: ₹${totalWage.toFixed(2)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-orange-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">HarvestFlow Manager Dashboard</h1>
            <p className="text-orange-100">Farm Operations Management</p>
          </div>
          <Button onClick={onLogout} className="bg-orange-700 hover:bg-orange-800">
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
            className={`px-4 py-2 font-medium rounded ${activeTab === 'daily' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('daily')}
          >
            Daily Work
          </button>
          <button
            className={`px-4 py-2 font-medium rounded ${activeTab === 'harvest' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('harvest')}
          >
            Harvesting
          </button>
          <button
            className={`px-4 py-2 font-medium rounded ${activeTab === 'wages' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('wages')}
          >
            Wages
          </button>
        </div>

        {activeTab === 'daily' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Assign Daily Work</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Job</label>
                    <select 
                      className="w-full p-3 border rounded-lg"
                      value={dailyWork.jobId}
                      onChange={(e) => setDailyWork({...dailyWork, jobId: e.target.value})}
                    >
                      <option value="">Select a job</option>
                      {jobs.map(job => (
                        <option key={job.id} value={job.id}>{job.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Area/Notes</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border rounded-lg" 
                      placeholder="North Block A"
                      value={dailyWork.area}
                      onChange={(e) => setDailyWork({...dailyWork, area: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Staff</label>
                    <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                      {workers.map(worker => (
                        <label key={worker.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dailyWork.selectedWorkers.includes(worker.id)}
                            onChange={() => handleWorkerSelection(worker.id, 'daily')}
                          />
                          <span>{worker.full_name} ({worker.staff_id})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={submitDailyWork}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Submit Assignment
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'harvest' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Assign Harvest Job</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Crop</label>
                    <select 
                      className="w-full p-3 border rounded-lg"
                      value={harvestJob.crop}
                      onChange={(e) => setHarvestJob({...harvestJob, crop: e.target.value})}
                    >
                      <option value="">Select crop</option>
                      <option value="Cloves">Cloves</option>
                      <option value="Black Pepper">Black Pepper</option>
                      <option value="Nutmeg">Nutmeg</option>
                      <option value="Cardamom">Cardamom</option>
                      <option value="Cinnamon">Cinnamon</option>
                      <option value="Coconut">Coconut</option>
                      <option value="Jackfruit">Jackfruit</option>
                      <option value="Areca Nut">Areca Nut</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Clove Leaves">Clove Leaves</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Staff</label>
                    <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                      {workers.map(worker => (
                        <label key={worker.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={harvestJob.selectedWorkers.includes(worker.id)}
                            onChange={() => handleWorkerSelection(worker.id, 'harvest')}
                          />
                          <span>{worker.full_name} ({worker.staff_id})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={submitHarvestJob}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Submit Assignment
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'wages' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Wage Calculation</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Worker</label>
                    <select 
                      className="w-full p-3 border rounded-lg"
                      value={wageCalc.workerId}
                      onChange={(e) => setWageCalc({...wageCalc, workerId: e.target.value})}
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
                    <label className="block text-sm font-medium mb-2">Crop Type</label>
                    <select 
                      className="w-full p-3 border rounded-lg"
                      value={wageCalc.cropType}
                      onChange={(e) => setWageCalc({...wageCalc, cropType: e.target.value})}
                    >
                      <option value="">Select crop</option>
                      <option value="Cloves">Cloves</option>
                      <option value="Black Pepper">Black Pepper</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Harvested Weight (kg)</label>
                    <input 
                      type="number" 
                      className="w-full p-3 border rounded-lg" 
                      placeholder="Enter weight"
                      value={wageCalc.harvestedWeight}
                      onChange={(e) => setWageCalc({...wageCalc, harvestedWeight: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Threshed Weight (kg)</label>
                    <input 
                      type="number" 
                      className="w-full p-3 border rounded-lg" 
                      placeholder="Enter weight"
                      value={wageCalc.threshedWeight}
                      onChange={(e) => setWageCalc({...wageCalc, threshedWeight: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rate per kg (₹)</label>
                    <input 
                      type="number" 
                      className="w-full p-3 border rounded-lg" 
                      placeholder="Enter rate"
                      value={wageCalc.ratePerKg}
                      onChange={(e) => setWageCalc({...wageCalc, ratePerKg: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={calculateWage}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Calculate Wage
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}