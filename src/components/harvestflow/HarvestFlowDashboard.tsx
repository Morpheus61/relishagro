import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { supabase } from '../../lib/supabase';
import { OnboardingScreen } from '../shared/OnboardingScreen';
import { ProcurementScreen } from '../shared/ProcurementScreen';

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
  // ✅ UPDATED: Added new tabs for onboarding, procurement, attendance, planning, equipment
  const [activeTab, setActiveTab] = useState<'daily' | 'harvest' | 'wages' | 'onboarding' | 'procurement' | 'attendance' | 'planning' | 'equipment'>('daily');
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
      // ✅ FIXED: Changed from 'daily_jobs' to 'daily_job_types' (correct table name)
      const { data, error } = await supabase
        .from('daily_job_types')
        .select('id, job_name, category')
        .order('job_name');

      if (error) throw error;
      // ✅ FIXED: Map job_name to name for consistency
      const mappedJobs = data?.map(job => ({
        id: job.id,
        name: job.job_name,
        category: job.category
      })) || [];
      setJobs(mappedJobs);
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
      // ✅ FIXED: Updated to use correct table and field names
      const { error } = await supabase
        .from('hf_daily_jobs')
        .insert({
          job_type_id: dailyWork.jobId,
          assignment_date: new Date().toISOString().split('T')[0],
          assigned_workers: dailyWork.selectedWorkers,
          area_notes: dailyWork.area,
          assigned_by: userId,
          status: 'assigned'
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
      const lotId = `LOT-${harvestJob.crop.toUpperCase().replace(/\s+/g, '')}-${Date.now()}`;
      
      const { error } = await supabase
        .from('lots')
        .insert({
          lot_id: lotId,
          crop: harvestJob.crop,
          date_harvested: new Date().toISOString().split('T')[0],
          created_by: userId,
          status: 'harvesting',
          assigned_workers: harvestJob.selectedWorkers
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

  // ✅ NEW: Navigation handler for screens
  const handleNavigateToScreen = (screen: string) => {
    if (screen === 'dashboard') {
      setActiveTab('daily');
    }
  };

  // ✅ NEW: Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'onboarding':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <OnboardingScreen 
              navigateToScreen={handleNavigateToScreen} 
              user={userId} 
            />
          </div>
        );

      case 'procurement':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <ProcurementScreen 
              navigateToScreen={handleNavigateToScreen} 
              user={userId} 
            />
          </div>
        );

      case 'attendance':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">📋 Daily Attendance</h2>
              <p className="text-gray-600 mb-4">Face recognition attendance system coming soon...</p>
              <div className="space-y-4">
                <p className="text-sm text-orange-600">
                  🚧 This feature will include:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Face recognition check-in/check-out</li>
                  <li>Manual attendance entry (backup)</li>
                  <li>Daily attendance reports</li>
                  <li>Worker location tracking</li>
                </ul>
              </div>
            </Card>
          </div>
        );

      case 'planning':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">📊 Harvest Planning</h2>
              <p className="text-gray-600 mb-4">Seasonal planning and management tools</p>
              <div className="space-y-4">
                <p className="text-sm text-orange-600">
                  🚧 This feature will include:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Seasonal crop planning calendar</li>
                  <li>Weather integration for planning</li>
                  <li>Resource allocation planning</li>
                  <li>Harvest forecasting</li>
                </ul>
              </div>
            </Card>
          </div>
        );

      case 'equipment':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">🚜 Equipment Management</h2>
              <p className="text-gray-600 mb-4">Farm equipment tracking and maintenance</p>
              <div className="space-y-4">
                <p className="text-sm text-orange-600">
                  🚧 This feature will include:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Equipment inventory tracking</li>
                  <li>Maintenance scheduling</li>
                  <li>Usage logs and reports</li>
                  <li>Equipment allocation to workers</li>
                </ul>
              </div>
            </Card>
          </div>
        );

      case 'daily':
        return (
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
        );

      case 'harvest':
        return (
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
        );

      case 'wages':
        return (
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
        );

      default:
        return renderTabContent();
    }
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
        {/* ✅ UPDATED: Enhanced tab navigation with all features */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Core Operations */}
            <button
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'daily' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('daily')}
            >
              📋 Daily Work
            </button>
            
            <button
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'harvest' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('harvest')}
            >
              🌾 Harvesting
            </button>
            
            <button
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'wages' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('wages')}
            >
              💰 Wages
            </button>

            {/* Staff Management */}
            <button
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'onboarding' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              onClick={() => setActiveTab('onboarding')}
            >
              👥 Staff Onboarding
            </button>

            <button
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'attendance' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
              onClick={() => setActiveTab('attendance')}
            >
              📋 Attendance
            </button>

            {/* Administrative */}
            <button
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'procurement' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              onClick={() => setActiveTab('procurement')}
            >
              🛒 Procurement
            </button>

            <button
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'planning' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
              onClick={() => setActiveTab('planning')}
            >
              📊 Planning
            </button>

            <button
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'equipment' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('equipment')}
            >
              🚜 Equipment
            </button>
          </div>

          {/* ✅ UPDATED: Tab indicators */}
          <div className="text-sm text-gray-500 mb-4">
            Active Section: <span className="font-medium text-orange-600">
              {activeTab === 'daily' && '📋 Daily Work Assignment'}
              {activeTab === 'harvest' && '🌾 Harvest Management'}
              {activeTab === 'wages' && '💰 Wage Calculation'}
              {activeTab === 'onboarding' && '👥 Staff Onboarding'}
              {activeTab === 'attendance' && '📋 Daily Attendance'}
              {activeTab === 'procurement' && '🛒 Procurement Requests'}
              {activeTab === 'planning' && '📊 Harvest Planning'}
              {activeTab === 'equipment' && '🚜 Equipment Management'}
            </span>
          </div>
        </div>

        {/* ✅ UPDATED: Render the appropriate content */}
        {renderTabContent()}
      </div>
    </div>
  );
}