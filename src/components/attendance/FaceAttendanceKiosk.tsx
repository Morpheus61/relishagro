// components/attendance/FaceAttendanceKiosk.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, Clock, Users } from 'lucide-react';

interface AttendanceRecord {
  person_id: string;
  person_name: string;
  staff_id: string;
  timestamp: string;
  confidence: number;
}

const FaceAttendanceKiosk: React.FC = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: AttendanceRecord;
  } | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setIsCapturing(true);
      setResult(null);
      setCapturedImage(null);
    } catch (error) {
      console.error('Camera access error:', error);
      setResult({
        success: false,
        message: 'Failed to access camera. Please grant camera permissions.'
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const submitAttendance = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://relishagrobackend-production.up.railway.app';
      const base64Image = capturedImage.split(',')[1];

      const response = await fetch(`${API_URL}/api/face-integration/attendance/mark-with-face`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64Image,
          location: 'main_gate',
          device_id: 'kiosk_01'
        })
      });

      const data = await response.json();

      if (data.success && data.authenticated) {
        setResult({
          success: true,
          message: `Welcome, ${data.person_name}!`,
          data: {
            person_id: data.person_id,
            person_name: data.person_name,
            staff_id: data.staff_id,
            timestamp: data.timestamp,
            confidence: data.confidence
          }
        });
        
        setRecentAttendance(prev => [
          {
            person_id: data.person_id,
            person_name: data.person_name,
            staff_id: data.staff_id,
            timestamp: data.timestamp,
            confidence: data.confidence
          },
          ...prev.slice(0, 4)
        ]);

        setTimeout(() => {
          setCapturedImage(null);
          setResult(null);
        }, 3000);
      } else {
        setResult({
          success: false,
          message: data.error || 'Face not recognized. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Attendance submission error:', error);
      setResult({
        success: false,
        message: 'Failed to mark attendance. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const retryCapture = () => {
    setCapturedImage(null);
    setResult(null);
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Camera className="mr-3 text-blue-600" size={36} />
                Face Recognition Attendance
              </h1>
              <p className="text-gray-600 mt-2">
                Position your face in the camera and capture to mark attendance
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Today's Date</div>
              <div className="text-xl font-bold text-gray-800">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Camera View</h2>
              
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '480px' }}>
                {!isCapturing && !capturedImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={startCamera}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center shadow-lg transition-all"
                    >
                      <Camera className="mr-3" size={24} />
                      Start Camera
                    </button>
                  </div>
                )}

                {isCapturing && (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-4 border-white rounded-full opacity-50" style={{ width: '300px', height: '400px' }}></div>
                    </div>
                  </>
                )}

                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                )}

                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="mt-6 flex gap-4">
                {isCapturing && (
                  <>
                    <button
                      onClick={capturePhoto}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center transition-all"
                    >
                      <Camera className="mr-2" size={20} />
                      Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-6 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {capturedImage && !result && (
                  <>
                    <button
                      onClick={submitAttendance}
                      disabled={isProcessing}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2" size={20} />
                          Mark Attendance
                        </>
                      )}
                    </button>
                    <button
                      onClick={retryCapture}
                      className="px-6 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
                    >
                      Retake
                    </button>
                  </>
                )}
              </div>

              {result && (
                <div className={`mt-6 p-4 rounded-lg flex items-start ${
                  result.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                }`}>
                  {result.success ? (
                    <CheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-red-600 mt-1 mr-3 flex-shrink-0" size={24} />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.message}
                    </p>
                    {result.data && (
                      <div className="mt-2 text-sm text-gray-700">
                        <p>Staff ID: {result.data.staff_id}</p>
                        <p>Confidence: {(result.data.confidence * 100).toFixed(1)}%</p>
                        <p>Time: {new Date(result.data.timestamp).toLocaleTimeString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Users className="mr-2 text-purple-600" size={24} />
                Recent Check-ins
              </h2>

              {recentAttendance.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Clock className="mx-auto mb-2 text-gray-400" size={48} />
                  <p>No recent check-ins</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAttendance.map((record, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">{record.person_name}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          ✓ Checked In
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>ID: {record.staff_id}</p>
                        <p>Time: {new Date(record.timestamp).toLocaleTimeString()}</p>
                        <p>Match: {(record.confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg shadow-lg p-6 mt-6">
              <h3 className="font-bold text-gray-800 mb-3">Instructions</h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Click "Start Camera" to begin</li>
                <li>Position your face within the oval guide</li>
                <li>Look directly at the camera</li>
                <li>Click "Capture Photo" when ready</li>
                <li>Click "Mark Attendance" to submit</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceAttendanceKiosk;