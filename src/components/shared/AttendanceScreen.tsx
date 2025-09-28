// src/components/shared/AttendanceScreen.tsx
import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArrowLeft, Camera, User, CheckCircle, AlertTriangle } from 'lucide-react';

interface AttendanceScreenProps {
  navigateToScreen: (screen: string) => void;
}

export function AttendanceScreen({ navigateToScreen }: AttendanceScreenProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([
    { id: 1, name: 'Ramesh Kumar', status: 'present', time: '08:00 AM' },
    { id: 2, name: 'Suresh Patil', status: 'absent', time: '-' },
    { id: 3, name: 'Priya Nair', status: 'present', time: '08:05 AM' },
  ]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);

  // Request camera access on mount
  useEffect(() => {
    const requestCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraAccess(true);
      } catch (err) {
        console.warn("Camera access denied:", err);
        setHasCameraAccess(false);
      }
    };

    requestCamera();

    return () => {
      // Clean up camera stream
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleFaceScan = async () => {
    if (!hasCameraAccess) {
      alert("Camera access required for face scan. Please enable camera permissions.");
      return;
    }

    setIsScanning(true);
    
    try {
      // Capture image from video
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      if (!video) throw new Error("Video element not found");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context not available");

      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');

      // Send to backend for face recognition
      const response = await fetch('/api/attendance/authenticate-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });

      const result = await response.json();
      
      if (result.authenticated) {
        const newRecord = {
          id: attendanceRecords.length + 1,
          name: result.person_name,
          status: 'present',
          time: new Date().toLocaleTimeString()
        };
        setAttendanceRecords(prev => [...prev, newRecord]);
      } else {
        alert("Face not recognized. Please try again or use manual entry.");
      }
    } catch (err) {
      console.error("Face scan error:", err);
      alert("Face scan failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualLogin = () => {
    if (manualId.trim()) {
      const newRecord = {
        id: attendanceRecords.length + 1,
        name: manualId,
        status: 'present',
        time: new Date().toLocaleTimeString()
      };
      setAttendanceRecords(prev => [...prev, newRecord]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-800 text-white p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateToScreen('dashboard')}
            className="text-white hover:bg-blue-700"
          >
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-lg">Attendance</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Camera Preview */}
        {hasCameraAccess !== null && (
          <Card className="p-4">
            <h2 className="text-lg mb-4">Face Scan</h2>
            <div className="text-center space-y-4">
              {hasCameraAccess ? (
                <>
                  <div className="relative w-full max-w-md mx-auto">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                    />
                    {isScanning && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="animate-pulse mb-2">
                            <Camera size={32} className="mx-auto" />
                          </div>
                          <p>Scanning face...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={handleFaceScan}
                    disabled={isScanning}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isScanning ? 'Scanning...' : 'Scan Face'}
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    Camera access denied. Please enable camera permissions in your browser settings.
                  </p>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-gray-600 hover:bg-gray-700"
                  >
                    Retry Camera Access
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Manual Entry */}
        <Card className="p-4">
          <h2 className="text-lg mb-4">Manual Entry</h2>
          <div className="text-center space-y-4">
            <div className="text-sm text-gray-600 mb-3">
              Enter worker ID to record attendance manually
            </div>
            <div className="flex gap-2">
              <User className="mt-2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Enter worker ID"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualLogin()}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button 
              onClick={handleManualLogin}
              disabled={!manualId.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Record Attendance
            </Button>
          </div>
        </Card>

        {/* Attendance Records */}
        <Card className="p-4">
          <h2 className="text-lg mb-4">Today's Attendance</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 pb-2 border-b">
              <div>NAME</div>
              <div>STATUS</div>
              <div>TIME</div>
            </div>
            {attendanceRecords.map((record) => (
              <div key={record.id} className="grid grid-cols-3 gap-2 items-center py-2 border-b border-gray-100">
                <div className="text-sm">{record.name}</div>
                <div className="flex items-center gap-1">
                  {record.status === 'present' ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-orange-600" />
                  )}
                  <Badge variant="outline" className={`text-xs ${record.status === 'present' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                    {record.status}
                  </Badge>
                </div>
                <div className="text-sm">{record.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}