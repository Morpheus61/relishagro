// components/attendance/FaceAttendanceKiosk.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, X, Clock, User, MapPin, AlertCircle } from 'lucide-react';
import * as faceapi from 'face-api.js';

const FaceAttendanceKiosk = ({ location = 'main_gate', deviceId = 'kiosk_01' }) => {
  const [kioskState, setKioskState] = useState({
    isActive: false,
    isProcessing: false,
    modelsLoaded: false,
    lastAttendance: null,
    error: null
  });

  const [attendanceResult, setAttendanceResult] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const processingRef = useRef(false);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  // Auto-detection interval
  useEffect(() => {
    let detectionInterval;

    if (kioskState.isActive && kioskState.modelsLoaded && !kioskState.isProcessing) {
      detectionInterval = setInterval(async () => {
        await autoDetectAndMark();
      }, 2000); // Check every 2 seconds
    }

    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [kioskState.isActive, kioskState.modelsLoaded, kioskState.isProcessing]);

  const loadModels = async () => {
    try {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      setKioskState(prev => ({ ...prev, modelsLoaded: true }));
    } catch (error) {
      console.error('Error loading face detection models:', error);
      setKioskState(prev => ({
        ...prev,
        error: 'Failed to load face detection models'
      }));
    }
  };

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
        setKioskState(prev => ({ ...prev, isActive: true, error: null }));
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setKioskState(prev => ({
        ...prev,
        error: 'Could not access camera. Please check permissions.'
      }));
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setKioskState(prev => ({ ...prev, isActive: false }));
  };

  const autoDetectAndMark = async () => {
    if (processingRef.current || !videoRef.current || !canvasRef.current) {
      return;
    }

    try {
      processingRef.current = true;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Detect face
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections && detections.detection.score > 0.7) {
        // Draw detection on canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        const displaySize = { width: canvas.width, height: canvas.height };
        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvas, resizedDetections);

        // Capture image and mark attendance
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        await markAttendance(imageData);
      } else {
        // Clear canvas if no good detection
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    } catch (error) {
      console.error('Auto-detection error:', error);
    } finally {
      processingRef.current = false;
    }
  };

  const markAttendance = async (imageBase64) => {
    setKioskState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Convert data URL to base64 string (remove prefix)
      const base64Data = imageBase64.split(',')[1];

      const response = await fetch('/api/face-integration/attendance/mark-with-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64Data,
          location: location,
          device_id: deviceId
        })
      });

      const result = await response.json();

      if (result.success && result.authenticated) {
        // Show success message
        setAttendanceResult({
          success: true,
          personName: result.person_name,
          staffId: result.staff_id,
          confidence: result.confidence,
          timestamp: new Date(result.timestamp),
          location: result.location
        });

        // Start countdown to clear message
        setCountdown(5);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setAttendanceResult(null);
              return null;
            }
            return prev - 1;
          });
        }, 1000);

        // Update last attendance
        setKioskState(prev => ({
          ...prev,
          lastAttendance: result,
          isProcessing: false
        }));
      } else {
        // Show failure message
        setAttendanceResult({
          success: false,
          error: result.error || 'Face not recognized',
          confidence: result.confidence
        });

        // Clear error after 3 seconds
        setTimeout(() => {
          setAttendanceResult(null);
        }, 3000);

        setKioskState(prev => ({ ...prev, isProcessing: false }));
      }
    } catch (error) {
      console.error('Attendance marking error:', error);
      setAttendanceResult({
        success: false,
        error: 'Network error. Please try again.'
      });

      setTimeout(() => {
        setAttendanceResult(null);
      }, 3000);

      setKioskState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Camera size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Face Recognition Attendance</h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <MapPin size={16} className="mr-1" />
                  {location.replace('_', ' ').toUpperCase()}
                  <span className="mx-2">•</span>
                  <Clock size={16} className="mr-1" />
                  {getCurrentTime()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!kioskState.isActive ? (
                <button
                  onClick={startCamera}
                  disabled={!kioskState.modelsLoaded}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold"
                >
                  <Camera className="mr-2" size={20} />
                  {kioskState.modelsLoaded ? 'Start Kiosk' : 'Loading...'}
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center font-semibold"
                >
                  <X className="mr-2" size={20} />
                  Stop Kiosk
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {kioskState.error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 flex items-center text-red-700">
            <AlertCircle className="mr-3 flex-shrink-0" size={24} />
            <span className="font-medium">{kioskState.error}</span>
          </div>
        )}

        {/* Camera Feed and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Live Camera Feed</h2>

              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {kioskState.isActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full"
                    />

                    {/* Processing Indicator */}
                    {kioskState.isProcessing && (
                      <div className="absolute top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-full flex items-center animate-pulse">
                        <div className="w-3 h-3 bg-white rounded-full mr-2 animate-ping"></div>
                        Processing...
                      </div>
                    )}

                    {/* Detection Hint */}
                    {!attendanceResult && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-full">
                        Position your face in the frame
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Camera size={64} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Camera is off</p>
                      <p className="text-sm">Click "Start Kiosk" to begin</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Status</h3>

              {attendanceResult ? (
                attendanceResult.success ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-center mb-3">
                        <div className="bg-green-500 rounded-full p-3">
                          <Check size={32} className="text-white" />
                        </div>
                      </div>

                      <h4 className="text-center text-xl font-bold text-green-700 mb-2">
                        Attendance Marked!
                      </h4>

                      <div className="space-y-2 text-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Name:</span>
                          <span className="font-semibold">{attendanceResult.personName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Staff ID:</span>
                          <span className="font-semibold">{attendanceResult.staffId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Confidence:</span>
                          <span className="font-semibold">{(attendanceResult.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Time:</span>
                          <span className="font-semibold">
                            {attendanceResult.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      {countdown !== null && (
                        <p className="text-center text-sm text-gray-600 mt-3">
                          Clearing in {countdown}s...
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-3">
                      <div className="bg-red-500 rounded-full p-3">
                        <X size={32} className="text-white" />
                      </div>
                    </div>

                    <h4 className="text-center text-xl font-bold text-red-700 mb-2">
                      Not Recognized
                    </h4>

                    <p className="text-center text-gray-700">
                      {attendanceResult.error}
                    </p>

                    {attendanceResult.confidence && (
                      <p className="text-center text-sm text-gray-600 mt-2">
                        Confidence: {(attendanceResult.confidence * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <User size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Waiting for face detection...</p>
                </div>
              )}
            </div>

            {/* Last Successful Attendance */}
            {kioskState.lastAttendance && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Last Attendance</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{kioskState.lastAttendance.person_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Staff ID:</span>
                    <span className="font-medium">{kioskState.lastAttendance.staff_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {new Date(kioskState.lastAttendance.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-medium">
                      {(kioskState.lastAttendance.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Instructions</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Stand in front of the camera</li>
                <li>Ensure good lighting</li>
                <li>Look directly at the camera</li>
                <li>Remove sunglasses/mask</li>
                <li>Wait for automatic detection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceAttendanceKiosk;