// src/components/shared/AttendanceScreen.tsx
import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface AuthResult {
  authenticated: boolean;
  person_id?: string;
  name?: string;
  confidence?: number;
  error?: string;
  checkin_time?: string;
}

export function AttendanceScreen() {
  const [result, setResult] = useState<AuthResult | null>(null);
  const [staffId, setStaffId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    // Simulate API call
    setTimeout(() => {
      setResult({
        authenticated: true,
        person_id: staffId,
        name: `Worker ${staffId}`,
        confidence: 0.95,
        checkin_time: new Date().toISOString()
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Face-Based Attendance</h1>

      {/* Manual Entry */}
      <Card className="p-6 max-w-md mx-auto mb-6">
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Staff ID</label>
            <Input
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="Enter Staff ID"
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Checking In...' : 'Check In'}
          </Button>
        </form>
      </Card>

      {/* Camera Capture Placeholder */}
      <Card className="p-6 max-w-md mx-auto">
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          📷 Camera integration coming soon
        </div>
      </Card>

      {/* Result */}
      {result && (
        <Card
          className={`mt-6 p-4 ${
            result.authenticated
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <h3 className="font-semibold text-lg">
            {result.authenticated ? '✅ Verified' : '❌ Not Recognized'}
          </h3>
          {result.authenticated ? (
            <div className="space-y-1 text-sm mt-2">
              <p><strong>Name:</strong> {result.name}</p>
              <p><strong>ID:</strong> {result.person_id}</p>
              {result.confidence && (
                <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
              )}
              {result.checkin_time && (
                <p>
                  <strong>Status:</strong> Check-in recorded at{' '}
                  {new Date(result.checkin_time).toLocaleTimeString()}
                </p>
              )}
            </div>
          ) : (
            <p>{result.error || 'Authentication failed'}</p>
          )}
        </Card>
      )}
    </div>
  );
}