import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';

interface ViewProps {
  onBack: () => void;
}

export function HarvestFlowStaffView({ onBack }: ViewProps) {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('person_records')
        .select('*')
        .in('person_type', ['staff', 'harvestflow_manager'])
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-orange-700">HarvestFlow Staff List</h3>
        <Button onClick={onBack} className="bg-gray-500 hover:bg-gray-600">
          Back
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-orange-100">
              <tr>
                <th className="p-3 text-left">Staff ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Designation</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((person) => (
                <tr key={person.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{person.staff_id}</td>
                  <td className="p-3">{person.full_name}</td>
                  <td className="p-3">{person.designation}</td>
                  <td className="p-3">{person.person_type}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {person.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function HarvestFlowAttendanceView({ onBack }: ViewProps) {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select(`
          *,
          person_records (staff_id, full_name)
        `)
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-blue-700">Daily Attendance (Last 7 Days)</h3>
        <Button onClick={onBack} className="bg-gray-500 hover:bg-gray-600">
          Back
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-3 text-left">Date/Time</th>
                <th className="p-3 text-left">Staff ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Method</th>
                <th className="p-3 text-left">Location</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{new Date(record.timestamp).toLocaleString()}</td>
                  <td className="p-3">{record.person_records?.staff_id}</td>
                  <td className="p-3">{record.person_records?.full_name}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {record.method}
                    </span>
                  </td>
                  <td className="p-3">{record.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function HarvestFlowJobsView({ onBack }: ViewProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_job_types')
        .select('*')
        .order('job_name');

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-green-700">Job Types & Completion</h3>
        <Button onClick={onBack} className="bg-gray-500 hover:bg-gray-600">
          Back
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-100">
                <tr>
                  <th className="p-3 text-left">Job Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Unit</th>
                  <th className="p-3 text-left">Expected Output</th>
                  <th className="p-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{job.job_name}</td>
                    <td className="p-3">{job.category || 'N/A'}</td>
                    <td className="p-3">{job.unit_of_measurement || 'N/A'}</td>
                    <td className="p-3">{job.expected_output_per_worker || 'N/A'}</td>
                    <td className="p-3">{new Date(job.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {jobs.length === 0 && (
            <p className="text-gray-500 text-center">No job types defined yet</p>
          )}
        </div>
      )}
    </div>
  );
}

export function HarvestFlowHarvestView({ onBack }: ViewProps) {
  const [harvestData, setHarvestData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHarvestData();
  }, []);

  const loadHarvestData = async () => {
    try {
      const { data, error } = await supabase
        .from('lots')
        .select('*')
        .order('date_harvested', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHarvestData(data || []);
    } catch (error) {
      console.error('Error loading harvest data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-yellow-700">Harvest Data & Lots</h3>
        <Button onClick={onBack} className="bg-gray-500 hover:bg-gray-600">
          Back
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">Total Lots</h4>
              <p className="text-3xl font-bold text-yellow-600">{harvestData.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Total Raw Weight</h4>
              <p className="text-3xl font-bold text-green-600">
                {harvestData.reduce((sum, lot) => sum + (lot.raw_weight || 0), 0)}kg
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Total Threshed</h4>
              <p className="text-3xl font-bold text-blue-600">
                {harvestData.reduce((sum, lot) => sum + (lot.threshed_weight || 0), 0)}kg
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-yellow-100">
                <tr>
                  <th className="p-3 text-left">Lot ID</th>
                  <th className="p-3 text-left">Crop</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Raw Weight</th>
                  <th className="p-3 text-left">Threshed Weight</th>
                  <th className="p-3 text-left">Yield %</th>
                </tr>
              </thead>
              <tbody>
                {harvestData.map((lot) => (
                  <tr key={lot.lot_id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{lot.lot_id}</td>
                    <td className="p-3">{lot.crop}</td>
                    <td className="p-3">{new Date(lot.date_harvested).toLocaleDateString()}</td>
                    <td className="p-3">{lot.raw_weight}kg</td>
                    <td className="p-3">{lot.threshed_weight}kg</td>
                    <td className="p-3">
                      {lot.raw_weight && lot.threshed_weight 
                        ? `${((lot.threshed_weight / lot.raw_weight) * 100).toFixed(1)}%`
                        : 'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function HarvestFlowDispatchView({ onBack }: ViewProps) {
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDispatches();
  }, []);

  const loadDispatches = async () => {
    try {
      const { data, error } = await supabase
        .from('dispatches')
        .select(`
          *,
          lots (lot_id, crop, threshed_weight)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDispatches(data || []);
    } catch (error) {
      console.error('Error loading dispatches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-purple-700">Dispatch Records</h3>
        <Button onClick={onBack} className="bg-gray-500 hover:bg-gray-600">
          Back
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Total Dispatches</h4>
              <p className="text-3xl font-bold text-purple-600">{dispatches.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Total Sacks</h4>
              <p className="text-3xl font-bold text-blue-600">
                {dispatches.reduce((sum, dispatch) => sum + (dispatch.sack_count || 0), 0)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">This Month</h4>
              <p className="text-3xl font-bold text-green-600">
                {dispatches.filter(d => 
                  new Date(d.created_at).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-100">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Lot ID</th>
                  <th className="p-3 text-left">Crop</th>
                  <th className="p-3 text-left">Sack Count</th>
                  <th className="p-3 text-left">Vehicle</th>
                  <th className="p-3 text-left">Driver</th>
                </tr>
              </thead>
              <tbody>
                {dispatches.map((dispatch) => (
                  <tr key={dispatch.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(dispatch.created_at).toLocaleDateString()}</td>
                    <td className="p-3 font-mono text-sm">{dispatch.lot_id}</td>
                    <td className="p-3">{dispatch.lots?.crop || 'N/A'}</td>
                    <td className="p-3">{dispatch.sack_count}</td>
                    <td className="p-3">{dispatch.vehicle_number || 'N/A'}</td>
                    <td className="p-3">{dispatch.driver_name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function HarvestFlowWagesView({ onBack }: ViewProps) {
  const [wages, setWages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAccrued, setTotalAccrued] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    loadWages();
  }, []);

  const loadWages = async () => {
    try {
      const { data, error } = await supabase
        .from('wages')
        .select(`
          *,
          person_records (staff_id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWages(data || []);

      // Calculate totals
      const accrued = data?.reduce((sum, wage) => sum + (wage.total_amount || 0), 0) || 0;
      const paid = data?.filter(w => w.status === 'paid')
        .reduce((sum, wage) => sum + (wage.total_amount || 0), 0) || 0;
      
      setTotalAccrued(accrued);
      setTotalPaid(paid);
    } catch (error) {
      console.error('Error loading wages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-red-700">💰 Wages & Financial Data</h3>
        <Button onClick={onBack} className="bg-gray-500 hover:bg-gray-600">
          Back
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Total Wages Accrued</h4>
              <p className="text-3xl font-bold text-green-600">₹{totalAccrued.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Wages Paid</h4>
              <p className="text-3xl font-bold text-blue-600">₹{totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">Outstanding</h4>
              <p className="text-3xl font-bold text-red-600">₹{(totalAccrued - totalPaid).toLocaleString()}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-100">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Worker</th>
                  <th className="p-3 text-left">Hours</th>
                  <th className="p-3 text-left">Rate</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {wages.map((wage) => (
                  <tr key={wage.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(wage.date).toLocaleDateString()}</td>
                    <td className="p-3">{wage.person_records?.full_name || 'N/A'}</td>
                    <td className="p-3">{wage.hours_worked}</td>
                    <td className="p-3">₹{wage.hourly_rate}</td>
                    <td className="p-3 font-semibold">₹{wage.total_amount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        wage.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {wage.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function FlavorCoreProcessingView({ onBack }: ViewProps) {
  const [processing, setProcessing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProcessing();
  }, []);

  const loadProcessing = async () => {
    try {
      const { data, error } = await supabase
        .from('flavorcore_processing')
        .select(`
          *,
          lots (lot_id, crop)
        `)
        .order('processed_date', { ascending: false });

      if (error) throw error;
      setProcessing(data || []);
    } catch (error) {
      console.error('Error loading processing data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-purple-700">FlavorCore Processing Status</h3>
        <Button onClick={onBack} className="bg-gray-500 hover:bg-gray-600">
          Back
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Total Batches Processed</h4>
              <p className="text-3xl font-bold text-purple-600">{processing.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Total Weight Processed</h4>
              <p className="text-3xl font-bold text-blue-600">
                {processing.reduce((sum, p) => sum + (p.in_scan_weight || 0), 0)}kg
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-100">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Lot ID</th>
                  <th className="p-3 text-left">Crop</th>
                  <th className="p-3 text-left">In-Scan Weight</th>
                  <th className="p-3 text-left">Handled By</th>
                </tr>
              </thead>
              <tbody>
                {processing.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(record.processed_date).toLocaleDateString()}</td>
                    <td className="p-3 font-mono text-sm">{record.lot_id}</td>
                    <td className="p-3">{record.lots?.crop || 'N/A'}</td>
                    <td className="p-3">{record.in_scan_weight}kg</td>
                    <td className="p-3">{record.handled_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function FlavorCoreInventoryView({ onBack }: ViewProps) {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-indigo-700">FlavorCore Inventory Levels</h3>
        <Button onClick={onBack} className="bg-gray-500 hover:bg-gray-600">
          Back
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-800 mb-2">Total Items</h4>
              <p className="text-3xl font-bold text-indigo-600">{inventory.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Total Quantity</h4>
              <p className="text-3xl font-bold text-green-600">
                {inventory.reduce((sum, item) => sum + (item.quantity || 0), 0)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="p-3 text-left">Product ID</th>
                  <th className="p-3 text-left">Quantity</th>
                  <th className="p-3 text-left">Unit</th>
                  <th className="p-3 text-left">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{item.product_id}</td>
                    <td className="p-3 font-semibold">{item.quantity}</td>
                    <td className="p-3">{item.unit || 'kg'}</td>
                    <td className="p-3">{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function FlavorCoreQualityView({ onBack }: ViewProps) {
  const [qualityData, setQualityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQualityData();
  }, []);

  const loadQualityData = async () => {
    try {
      // Simulate quality data - replace with actual table when available
      const { data, error } = await supabase
        .from('product_lots')
        .select('*')
        .order('processed_at', { ascending: false });

      if (error) throw error;
      setQualityData(data || []);
    } catch (error) {
      console.error('Error loading quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-pink-700">Product Quality Metrics</h3>
        <Button onClick={onBack} className="bg-gray-500 hover:bg-gray-600">
          Back
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
              <h4 className="font-semibold text-pink-800 mb-2">Product Lots</h4>
              <p className="text-3xl font-bold text-pink-600">{qualityData.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Avg Yield</h4>
              <p className="text-3xl font-bold text-green-600">
                {qualityData.length > 0 
                  ? (qualityData.reduce((sum, lot) => sum + (lot.yield_pct || 0), 0) / qualityData.length).toFixed(1)
                  : 0
                }%
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Total Final Weight</h4>
              <p className="text-3xl font-bold text-blue-600">
                {qualityData.reduce((sum, lot) => sum + (lot.final_weight || 0), 0)}kg
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-100">
                <tr>
                  <th className="p-3 text-left">Lot ID</th>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Source</th>
                  <th className="p-3 text-left">Raw Weight</th>
                  <th className="p-3 text-left">Final Weight</th>
                  <th className="p-3 text-left">Yield %</th>
                  <th className="p-3 text-left">QR Code</th>
                </tr>
              </thead>
              <tbody>
                {qualityData.map((lot) => (
                  <tr key={lot.lot_id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{lot.lot_id}</td>
                    <td className="p-3">{lot.product}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        lot.source === 'harvestflow' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {lot.source}
                      </span>
                    </td>
                    <td className="p-3">{lot.raw_weight}kg</td>
                    <td className="p-3">{lot.final_weight}kg</td>
                    <td className="p-3">
                      <span className={`font-semibold ${
                        lot.yield_pct >= 80 ? 'text-green-600' :
                        lot.yield_pct >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {lot.yield_pct}%
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">{lot.qr_code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}