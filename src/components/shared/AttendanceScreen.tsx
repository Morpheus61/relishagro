// src/components/shared/AttendanceScreen.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { CameraCapture } from './CameraCapture';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AuthResult {
  authenticated: boolean;
  person_id?: string;
  person_name?: string;
  confidence?: number;
  error?: string;
  checkin_time?: string;
  mode?: string;
}

interface AttendanceScreenProps {
  module: 'harvestflow' | 'flavorcore';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://relishagro-backend.up.railway.app';

export function AttendanceScreen({ module }: AttendanceScreenProps) {
  const [result, setResult] = useState<AuthResult | null>(null);
  const [staffId, setStaffId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'face' | 'manual'>('face');
  const [error, setError] = useState<string | null>(null);
  const [todayStats, setTodayStats] = useState({ total: 0, present: 0 });

  const moduleTitle = module === 'harvestflow' ? 'HarvestFlow' : 'FlavorCore';
  const location = module === 'harvestflow' ? 'farm_gate' : 'processing_unit';

  useEffect(() => {
    fetchTodayStats();
  }, [module]);

  const fetchTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${API_BASE_URL}/api/attendance?date=${today}&location=${location}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTodayStats({
          total: data.data?.length || 0,
          present: data.data?.filter((a: any) => a.method !== 'checkout').length || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleFaceAuthentication = async (imageBase64: string) => {
    setIsSubmitting(true);
    setResult(null);
    setError(null);

    try {
      // Convert base64 to blob for FormData
      const blob = await fetch(`data:image/jpeg;base64,${imageBase64}`).then(r => r.blob());
      const formData = new FormData();
      formData.append('image', blob, 'face.jpg');

      // Face authentication
      const authResponse = await fetch(`${API_BASE_URL}/api/face/authenticate`, {
        method: 'POST',
        body: formData,
      });

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(authData.error || 'Face authentication failed');
      }

      if (authData.authenticated) {
        // Log attendance
        const attendanceResponse = await fetch(`${API_BASE_URL}/api/attendance/log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            person_id: authData.person_id,
            method: 'face',
            location,
            confidence_score: authData.confidence,
          }),
        });

        if (!attendanceResponse.ok) {
          throw new Error('Failed to log attendance');
        }

        const attendanceData = await attendanceResponse.json();

        setResult({
          authenticated: true,
          person_id: authData.person_id,
          person_name: authData.person_name,
          confidence: authData.confidence,
          checkin_time: attendanceData.data?.timestamp || new Date().toISOString(),
          mode: authData.mode,
        });

        fetchTodayStats();
      } else {
        setResult({
          authenticated: false,
          error: authData.error || 'Face not recognized',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setResult({
        authenticated: false,
        error: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staffId.trim()) {
      setError('Please enter a Staff ID');
      return;
    }

    setIsSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          person_id: staffId.trim(),
          method: 'manual',
          location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Check-in failed');
      }

      setResult({
        authenticated: true,
        person_id: data.data?.person_id || staffId,
        person_name: data.data?.person?.full_name || `Worker ${staffId}`,
        checkin_time: data.data?.timestamp || new Date().toISOString(),
      });

      setStaffId('');
      fetchTodayStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setResult({
        authenticated: false,
        error: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {moduleTitle} Attendance
          </h1>
          <p className="text-slate-600 mt-1">
            Face recognition and manual check-in system
          </p>
        </div>

        {/* Stats Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Today's Check-ins</p>
              <p className="text-3xl font-bold text-purple-700">{todayStats.present}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Records</p>
              <p className="text-3xl font-bold text-blue-700">{todayStats.total}</p>
            </div>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('face')}
            variant={activeTab === 'face' ? 'default' : 'outline'}
            className="flex-1"
          >
            Face Recognition
          </Button>
          <Button
            onClick={() => setActiveTab('manual')}
            variant={activeTab === 'manual' ? 'default' : 'outline'}
            className="flex-1"
          >
            Manual Entry
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Face Recognition Tab */}
        {activeTab === 'face' && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Face Recognition Check-in</h2>
            <CameraCapture
              onCapture={handleFaceAuthentication}
              isLoading={isSubmitting}
            />
            <p className="text-sm text-slate-500 mt-4 text-center">
              Position your face in the camera frame and capture
            </p>
          </Card>
        )}

        {/* Manual Entry Tab */}
        {activeTab === 'manual' && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Manual Check-in</h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="staffId" className="block text-sm font-medium mb-1">
                  Staff ID
                </label>
                <Input
                  id="staffId"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="Enter Staff ID or UUID"
                  disabled={isSubmitting}
                  className="text-lg"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !staffId.trim()}
                className="w-full py-6 text-lg"
              >
                {isSubmitting ? 'Checking In...' : 'Check In'}
              </Button>
            </form>
          </Card>
        )}

        {/* Result Display */}
        {result && (
          <Card
            className={`p-6 ${
              result.authenticated
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="flex items-start gap-4">
              {result.authenticated ? (
                <CheckCircle className="w-8 h-8 text-green-600 mt-1" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 mt-1" />
              )}
              
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">
                  {result.authenticated ? 'Check-in Successful' : 'Check-in Failed'}
                </h3>
                
                {result.authenticated ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{result.person_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">ID:</span>
                      <span className="font-mono">{result.person_id}</span>
                    </div>
                    {result.confidence && (
                      <div className="flex justify-between">
                        <span className="font-medium">Confidence:</span>
                        <span>{(result.confidence * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {result.checkin_time && (
                      <div className="flex justify-between">
                        <span className="font-medium">Time:</span>
                        <span>
                          {new Date(result.checkin_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Location:</span>
                      <span className="capitalize">{location.replace('_', ' ')}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-700">{result.error || 'Authentication failed'}</p>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}