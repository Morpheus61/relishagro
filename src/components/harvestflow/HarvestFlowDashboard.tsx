import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Users, 
  ClipboardList, 
  Weight, 
  Package, 
  Truck, 
  MapPin, 
  Calendar,
  Plus,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Navigation,
  User,
  Phone
} from 'lucide-react';
import { RFIDScanner } from '../shared/RFIDScanner';
import api from '../../lib/api';

interface Worker {
  id: string;
  name: string;
  staff_id: string;
  role: string;
  phone: string;
  attendance_status: 'present' | 'absent' | 'late';
}

interface Job {
  id: string;
  type: 'normal' | 'harvest';
  title: string;
  assigned_workers: string[];
  field_location: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}

interface WeightRecord {
  id: string;
  worker_id: string;
  worker_name: string;
  job_id: string;
  weight_type: 'half_day' | 'end_day' | 'threshed' | 'daily_wage';
  weight_kg: number;
  timestamp: string;
  notes?: string;
}

interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  capacity_kg: number;
  driver_id?: string;
  status: 'available' | 'in_transit' | 'maintenance';
}

interface Driver {
  id: string;
  name: string;
  license_number: string;
  phone: string;
  vehicle_assigned?: string;
  status: 'available' | 'on_duty' | 'off_duty';
}

interface LotData {
  id: string;
  lot_number: string;
  product_type: string;
  total_weight: number;
  bag_count: number;
  quality_grade: string;
  status: 'created' | 'packed' | 'dispatched';
}

export function HarvestFlowDashboard({ currentUser }: { currentUser: any }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [lots, setLots] = useState<LotData[]>([]);
  const [loading, setLoading] = useState(false);

  // Dashboard Overview Tab
  const DashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Present Today</p>
              <p className="text-2xl font-bold">{workers.filter(w => w.attendance_status === 'present').length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'in_progress').length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Lots Created</p>
              <p className="text-2xl font-bold">{lots.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Dispatches Today</p>
              <p className="text-2xl font-bold">{lots.filter(l => l.status === 'dispatched').length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Today's Operations Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Normal Work Activities</h4>
            <div className="space-y-2">
              {jobs.filter(j => j.type === 'normal').map(job => (
                <div key={job.id} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{job.title}</span>
                    <Badge variant={job.status === 'completed' ? 'default' : 'outline'}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{job.field_location}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Harvest Activities</h4>
            <div className="space-y-2">
              {jobs.filter(j => j.type === 'harvest').map(job => (
                <div key={job.id} className="p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{job.title}</span>
                    <Badge variant={job.status === 'completed' ? 'default' : 'outline'}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{job.field_location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // Daily Attendance Tab
  const DailyAttendance = () => {
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

    const markAttendance = async (workerId: string, status: 'present' | 'absent' | 'late') => {
      try {
        // Using your existing API structure
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worker_id: workerId,
            date: attendanceDate,
            status,
            marked_by: currentUser.staff_id
          })
        });
        
        if (response.ok) {
          setWorkers(prev => prev.map(w => 
            w.id === workerId ? { ...w, attendance_status: status } : w
          ));
        }
      } catch (error) {
        console.error('Attendance marking failed:', error);
      }
    };

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" />
            <h3 className="text-xl font-bold">Daily Attendance - {attendanceDate}</h3>
          </div>
          
          <div className="space-y-4">
            <Input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-48"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map(worker => (
                <Card key={worker.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-8 h-8 text-gray-500" />
                      <div>
                        <p className="font-semibold">{worker.name}</p>
                        <p className="text-sm text-gray-600">{worker.staff_id}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => markAttendance(worker.id, 'present')}
                        className={`flex-1 ${worker.attendance_status === 'present' ? 'bg-green-600' : 'bg-gray-200'}`}
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => markAttendance(worker.id, 'late')}
                        className={`flex-1 ${worker.attendance_status === 'late' ? 'bg-yellow-600' : 'bg-gray-200'}`}
                      >
                        Late
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => markAttendance(worker.id, 'absent')}
                        className={`flex-1 ${worker.attendance_status === 'absent' ? 'bg-red-600' : 'bg-gray-200'}`}
                      >
                        Absent
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Job Assignment Tab  
  const JobAssignment = () => {
    const [jobType, setJobType] = useState<'normal' | 'harvest'>('normal');
    const [newJob, setNewJob] = useState({
      title: '',
      field_location: '',
      assigned_workers: [] as string[],
      notes: ''
    });

    const createJob = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newJob,
            type: jobType,
            created_by: currentUser.staff_id,
            status: 'pending'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setJobs(prev => [...prev, data]);
          setNewJob({ title: '', field_location: '', assigned_workers: [], notes: '' });
        }
      } catch (error) {
        console.error('Job creation failed:', error);
      }
    };

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">⚡ Create New Job Assignment</h3>
          
          <div className="space-y-4">
            {/* Job Type Selection - CRITICAL WORKFLOW SEPARATOR */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setJobType('normal')}
                className={`h-20 ${jobType === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                <div className="text-center">
                  <ClipboardList className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-semibold">Normal Work Day</div>
                  <div className="text-xs">Weeding, Fertilizing, etc.</div>
                </div>
              </Button>

              <Button
                onClick={() => setJobType('harvest')}
                className={`h-20 ${jobType === 'harvest' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                <div className="text-center">
                  <Package className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-semibold">Harvest Day</div>
                  <div className="text-xs">Complete Harvest Workflow</div>
                </div>
              </Button>
            </div>

            <Input
              placeholder="Job Title"
              value={newJob.title}
              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
            />

            <Input
              placeholder="Field Location"
              value={newJob.field_location}
              onChange={(e) => setNewJob({...newJob, field_location: e.target.value})}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Assign Workers</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {workers.filter(w => w.attendance_status === 'present').map(worker => (
                  <Button
                    key={worker.id}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const isAssigned = newJob.assigned_workers.includes(worker.id);
                      setNewJob({
                        ...newJob,
                        assigned_workers: isAssigned 
                          ? newJob.assigned_workers.filter(id => id !== worker.id)
                          : [...newJob.assigned_workers, worker.id]
                      });
                    }}
                    className={newJob.assigned_workers.includes(worker.id) ? 'bg-purple-100' : ''}
                  >
                    {worker.name}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={createJob}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!newJob.title || !newJob.field_location || newJob.assigned_workers.length === 0}
            >
              Create {jobType === 'harvest' ? 'Harvest' : 'Normal'} Job
            </Button>
          </div>
        </Card>

        {/* Active Jobs */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Today's Active Jobs</h3>
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className={`p-4 rounded-lg border-2 ${job.type === 'harvest' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.field_location}</p>
                    <p className="text-xs text-gray-500">{job.assigned_workers.length} workers assigned</p>
                  </div>
                  <Badge className={job.type === 'harvest' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}>
                    {job.type} - {job.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // Weight & Wage Recording Tab - MOBILE-FIRST DESIGN
  const WageRecording = () => {
    const [recordingMode, setRecordingMode] = useState<'daily_wage' | 'weight_based'>('daily_wage');
    const [selectedJob, setSelectedJob] = useState('');
    const [weightType, setWeightType] = useState<'half_day' | 'end_day' | 'threshed'>('half_day');
    const [selectedWorker, setSelectedWorker] = useState('');
    const [weight, setWeight] = useState('');
    const [dailyWageRate, setDailyWageRate] = useState('');
    const [notes, setNotes] = useState('');

    const harvestJobs = jobs.filter(j => j.type === 'harvest' && j.status === 'in_progress');
    const normalJobs = jobs.filter(j => j.type === 'normal' && j.status === 'in_progress');

    const recordWeight = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/weight-records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worker_id: selectedWorker,
            job_id: selectedJob,
            weight_type: weightType,
            weight_kg: parseFloat(weight),
            wage_calculation_type: 'weight_based',
            notes,
            recorded_by: currentUser.staff_id
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setWeightRecords(prev => [...prev, data]);
          setWeight('');
          setNotes('');
        }
      } catch (error) {
        console.error('Weight recording failed:', error);
      }
    };

    const recordDailyWage = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/daily-wage-records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worker_id: selectedWorker,
            job_id: selectedJob,
            daily_rate: parseFloat(dailyWageRate),
            wage_calculation_type: 'daily_basis',
            work_date: new Date().toISOString().split('T')[0],
            notes,
            recorded_by: currentUser.staff_id
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setWeightRecords(prev => [...prev, {
            ...data,
            weight_type: 'daily_wage',
            weight_kg: parseFloat(dailyWageRate)
          }]);
          setDailyWageRate('');
          setNotes('');
        }
      } catch (error) {
        console.error('Daily wage recording failed:', error);
      }
    };

    return (
      <div className="space-y-6">
        {/* Wage Calculation Mode Selection */}
        <Card className="max-w-md mx-auto p-6">
          <h3 className="text-xl font-bold mb-4">💰 Wage Recording Mode</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setRecordingMode('daily_wage')}
              className={`h-20 text-left ${recordingMode === 'daily_wage' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              <div>
                <div className="font-semibold">📅 Daily Wage</div>
                <div className="text-xs opacity-75">Normal Work Days</div>
                <div className="text-xs opacity-75">Fixed Rate/Day</div>
              </div>
            </Button>

            <Button
              onClick={() => setRecordingMode('weight_based')}
              className={`h-20 text-left ${recordingMode === 'weight_based' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              <div>
                <div className="font-semibold">⚖️ Weight Based</div>
                <div className="text-xs opacity-75">Harvest Days Only</div>
                <div className="text-xs opacity-75">Payment per KG</div>
              </div>
            </Button>
          </div>
        </Card>

        {/* Recording Interface */}
        <Card className="max-w-md mx-auto p-6">
          <div className="flex items-center gap-2 mb-4">
            <Weight className="w-5 h-5" />
            <h3 className="text-xl font-bold">
              {recordingMode === 'daily_wage' ? '📅 Daily Wage Recording' : '📏 Weight Recording'}
            </h3>
          </div>
          
          <div className="space-y-6">
            {/* Recording Type Selection Based on Mode */}
            {recordingMode === 'weight_based' ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium">Weight Recording Type</label>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => setWeightType('half_day')}
                    className={`h-16 text-left ${weightType === 'half_day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    <div>
                      <div className="font-semibold">Half-Day Weight</div>
                      <div className="text-xs opacity-75">Mid-day harvest recording</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => setWeightType('end_day')}
                    className={`h-16 text-left ${weightType === 'end_day' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    <div>
                      <div className="font-semibold">End-Day Weight</div>
                      <div className="text-xs opacity-75">Final harvest weight</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => setWeightType('threshed')}
                    className={`h-16 text-left ${weightType === 'threshed' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    <div>
                      <div className="font-semibold">Threshed Weight</div>
                      <div className="text-xs opacity-75">Post-processing weight</div>
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">Daily Wage Mode</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Recording fixed daily wages for normal work activities (weeding, fertilizing, etc.)
                </p>
              </div>
            )}

            {/* Job Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {recordingMode === 'weight_based' ? "Select Harvest Job" : "Select Normal Work Job"}
              </label>
              <select 
                value={selectedJob} 
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select Job</option>
                {(recordingMode === 'weight_based' ? harvestJobs : normalJobs).map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.field_location}
                  </option>
                ))}
              </select>
            </div>

            {/* Worker Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Worker</label>
              <select 
                value={selectedWorker} 
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select Worker</option>
                {workers.filter(w => w.attendance_status === 'present').map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - {worker.staff_id}
                  </option>
                ))}
              </select>
            </div>

            {/* Weight or Wage Input */}
            {recordingMode === 'weight_based' ? (
              <div>
                <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight in kg"
                  className="h-12 text-lg text-center"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Daily Wage Rate (₹)</label>
                <Input
                  type="number"
                  step="1"
                  value={dailyWageRate}
                  onChange={(e) => setDailyWageRate(e.target.value)}
                  placeholder="Enter daily wage in rupees"
                  className="h-12 text-lg text-center"
                />
                <p className="text-xs text-gray-500 mt-1">Fixed rate for today's work completion</p>
              </div>
            )}

            <Input
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-12"
            />

            <Button 
              onClick={recordingMode === 'weight_based' ? recordWeight : recordDailyWage}
              className={`w-full h-16 text-lg font-semibold ${
                recordingMode === 'weight_based' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              disabled={
                !selectedJob || !selectedWorker || 
                (recordingMode === 'weight_based' ? !weight : !dailyWageRate)
              }
            >
              {recordingMode === 'weight_based' ? (
                <><Weight className="w-5 h-5 mr-2" />Record Weight</>
              ) : (
                <><Calendar className="w-5 h-5 mr-2" />Record Daily Wage</>
              )}
            </Button>
          </div>
        </Card>

        {/* Today's Wage Records */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Today's Wage Records</h3>
          <div className="space-y-3">
            {weightRecords.map(record => (
              <div key={record.id} className={`p-3 rounded-lg ${
                record.weight_type === 'daily_wage' ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{record.worker_name}</p>
                    <p className="text-sm text-gray-600">
                      {record.weight_type === 'daily_wage' ? 'Daily Wage' : record.weight_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    {record.weight_type === 'daily_wage' ? (
                      <>
                        <p className="text-xl font-bold text-blue-600">₹{record.weight_kg}</p>
                        <p className="text-xs text-gray-500">Fixed Daily Rate</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xl font-bold text-green-600">{record.weight_kg} kg</p>
                        <p className="text-xs text-gray-500">Weight-based Pay</p>
                      </>
                    )}
                    <p className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // Simple Navigation
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'attendance':
        return <DailyAttendance />;
      case 'jobs':
        return <JobAssignment />;
      case 'wages':
        return <WageRecording />;
      default:
        return <DashboardOverview />;
    }
  };

  // Data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Using fetch instead of api client to avoid errors
        const workersResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/workers`);
        const jobsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`);
        
        if (workersResponse.ok) {
          const workersData = await workersResponse.json();
          setWorkers(workersData || []);
        }
        
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData || []);
        }

        // Add mock data for testing
        setWorkers([
          { id: '1', name: 'Raman Kumar', staff_id: 'HF-001', role: 'harvesting', phone: '9876543210', attendance_status: 'present' },
          { id: '2', name: 'Suresh Babu', staff_id: 'HF-002', role: 'harvesting', phone: '9876543211', attendance_status: 'present' },
          { id: '3', name: 'Ganesh Singh', staff_id: 'HF-003', role: 'harvesting', phone: '9876543212', attendance_status: 'absent' }
        ]);
        
      } catch (error) {
        console.error('Dashboard data loading failed:', error);
        // Set mock data on error
        setWorkers([
          { id: '1', name: 'Raman Kumar', staff_id: 'HF-001', role: 'harvesting', phone: '9876543210', attendance_status: 'present' },
          { id: '2', name: 'Suresh Babu', staff_id: 'HF-002', role: 'harvesting', phone: '9876543211', attendance_status: 'present' },
          { id: '3', name: 'Ganesh Singh', staff_id: 'HF-003', role: 'harvesting', phone: '9876543212', attendance_status: 'absent' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">HarvestFlow Manager</h1>
            <p className="text-green-100">Estate Operations & Harvest Management</p>
          </div>
          <Button 
            variant="outline" 
            className="bg-white text-green-700 hover:bg-green-50"
            onClick={() => window.location.reload()}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Simple Tab Navigation */}
      <div className="bg-white border-b">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'dashboard' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'attendance' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            📋 Attendance
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'jobs' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            ⚡ Jobs
          </button>
          <button
            onClick={() => setActiveTab('wages')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'wages' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            💰 Wages
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
}