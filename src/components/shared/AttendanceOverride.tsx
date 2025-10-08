import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import api from '../../lib/api';
import { AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';

interface AttendanceOverrideProps {
  workerId: string;
  workerName: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function AttendanceOverride({ workerId, workerName, onComplete, onCancel }: AttendanceOverrideProps) {
  const [reason, setReason] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const commonReasons = [
    'Biometric device malfunction',
    'Fingerprint recognition failed',
    'Face recognition failed',
    'Network connectivity issue',
    'Device battery dead',
    'Worker injured hand',
    'Other (specify below)'
  ];

  const handleSubmit = async () => {
    if (!reason || !checkInTime) {
      alert('Please select reason and check-in time');
      return;
    }

    setSubmitting(true);
    try {
      // Get current location for verification
      const location = await getCurrentLocation();

      await api.submitAttendanceOverride({
        worker_id: workerId,
        check_in: checkInTime,
        check_out: checkOutTime || null,
        override_reason: reason,
        status: 'pending_approval',
        submitted_by: 'manager', // Will be replaced by actual manager ID
        location: location,
        timestamp: new Date().toISOString()
      });

      alert('Attendance override submitted successfully!\nNotification sent to Admin and FC Manager for approval.');
      onComplete();
      
    } catch (error: any) {
      alert('Failed to submit override: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          () => {
            // If geolocation fails, return null coordinates
            resolve({ latitude: 0, longitude: 0 });
          }
        );
      } else {
        resolve({ latitude: 0, longitude: 0 });
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="text-yellow-600" size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Manual Attendance Override</h2>
              <p className="text-gray-600">Worker: {workerName}</p>
              <p className="text-sm text-gray-500">ID: {workerId}</p>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 mt-1" size={20} />
              <div>
                <p className="font-semibold text-yellow-800">Approval Required</p>
                <p className="text-sm text-yellow-700">
                  This override will be flagged as "Pending Approval" and sent to Admin and FlavorCore Manager for review.
                  The worker can continue working, but the attendance record will be marked for audit.
                </p>
              </div>
            </div>
          </div>

          {/* Override Reason */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Override Reason:</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Choose reason...</option>
              {commonReasons.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Additional Notes (if "Other" selected) */}
          {reason === 'Other (specify below)' && (
            <div>
              <label className="block text-sm font-medium mb-2">Additional Details:</label>
              <textarea
                className="w-full p-3 border rounded-lg"
                rows={3}
                placeholder="Please specify the reason..."
              />
            </div>
          )}

          {/* Check-in Time */}
          <div>
            <label className="block text-sm font-medium mb-2">Check-In Time:</label>
            <input
              type="datetime-local"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Check-out Time (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">Check-Out Time (Optional):</label>
            <input
              type="datetime-local"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !reason || !checkInTime}
              className="flex-1 bg-orange-600 hover:bg-orange-700 h-12"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={20} />
                  Submit Override
                </>
              )}
            </Button>
            <Button
              onClick={onCancel}
              disabled={submitting}
              className="bg-gray-500 hover:bg-gray-600 h-12 px-8"
            >
              Cancel
            </Button>
          </div>

          {/* Info Footer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="font-semibold text-blue-800 text-sm">What Happens Next?</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>✅ Worker can continue working immediately</li>
                  <li>📧 Notification sent to Admin & FC Manager</li>
                  <li>🔍 Record flagged for approval in system</li>
                  <li>⏰ Pending approval status until reviewed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Attendance Override Approval Component (for Admin/Manager)
export function AttendanceOverrideApproval({ override, onApprove, onReject }: {
  override: any;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [notes, setNotes] = useState('');

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <User className="text-yellow-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{override.worker_name}</h3>
            <p className="text-sm text-gray-600">Worker ID: {override.worker_id}</p>
            <p className="text-sm text-gray-600">
              Submitted by: {override.submitted_by} on {new Date(override.timestamp).toLocaleString()}
            </p>
          </div>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
            Pending
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Check-In</p>
            <p className="font-semibold">{new Date(override.check_in).toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Check-Out</p>
            <p className="font-semibold">
              {override.check_out ? new Date(override.check_out).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-1">Override Reason:</p>
          <p className="text-sm text-yellow-700">{override.override_reason}</p>
        </div>

        {override.location && override.location.latitude !== 0 && (
          <div className="text-sm text-gray-600">
            📍 Location: {override.location.latitude.toFixed(6)}, {override.location.longitude.toFixed(6)}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Approval Notes (optional):</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows={2}
            placeholder="Add any notes about this approval/rejection..."
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => onApprove()}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2" size={18} />
            Approve Override
          </Button>
          <Button
            onClick={() => onReject()}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            ✕ Reject Override
          </Button>
        </div>
      </div>
    </Card>
  );
}