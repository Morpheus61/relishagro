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

// Add similar components for other views following the same pattern
export function HarvestFlowJobsView({ onBack }: ViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Job Completion Data</h3>
        <Button onClick={onBack}>Back</Button>
      </div>
      <p>Real-time job completion tracking will be displayed here</p>
    </div>
  );
}

export function HarvestFlowHarvestView({ onBack }: ViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Daily Harvest Data</h3>
        <Button onClick={onBack}>Back</Button>
      </div>
      <p>Per-staff harvest quantities and threshing data will be displayed here</p>
    </div>
  );
}

export function HarvestFlowDispatchView({ onBack }: ViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Dispatch Records</h3>
        <Button onClick={onBack}>Back</Button>
      </div>
      <p>Outbound dispatch tracking will be displayed here</p>
    </div>
  );
}

export function HarvestFlowWagesView({ onBack }: ViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-red-700">💰 Wages & Financial Data</h3>
        <Button onClick={onBack}>Back</Button>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Total Wages Accrued</h4>
            <p className="text-3xl font-bold text-green-600">₹0</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Wages Paid</h4>
            <p className="text-3xl font-bold text-blue-600">₹0</p>
          </div>
        </div>
        <p className="text-gray-600">Connect wage calculation logic to display real-time data</p>
      </div>
    </div>
  );
}

export function FlavorCoreProcessingView({ onBack }: ViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-purple-700">Processing Status</h3>
        <Button onClick={onBack}>Back</Button>
      </div>
      <p>Current batch processing data will be displayed here</p>
    </div>
  );
}

export function FlavorCoreInventoryView({ onBack }: ViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-indigo-700">Inventory Levels</h3>
        <Button onClick={onBack}>Back</Button>
      </div>
      <p>Stock levels and inventory tracking will be displayed here</p>
    </div>
  );
}

export function FlavorCoreQualityView({ onBack }: ViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-pink-700">Quality Metrics</h3>
        <Button onClick={onBack}>Back</Button>
      </div>
      <p>Product quality grades and metrics will be displayed here</p>
    </div>
  );
}