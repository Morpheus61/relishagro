// components/onboarding/EnhancedOnboardingForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Fingerprint, Upload, Check, X, AlertCircle } from 'lucide-react';
import * as faceapi from 'face-api.js';

const EnhancedOnboardingForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    address: '',
    role: 'staff',
    aadhaar: '',
    entityType: 'staff'
  });

  const [faceCapture, setFaceCapture] = useState({
    image: null,
    detectionResult: null,
    isCapturing: false,
    isProcessing: false
  });

  const [fingerprintData, setFingerprintData] = useState(null);
  const [aadhaarDoc, setAadhaarDoc] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, success: false });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Load face-api models on component mount
  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  const loadModels = async () => {
    try {
      const MODEL_URL = '/models'; // Place face-api models in public/models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      setModelsLoaded(true);
    } catch (error) {
      console.error('Error loading face detection models:', error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setFaceCapture(prev => ({ ...prev, isCapturing: true }));
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please ensure camera permissions are granted.');
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
    setFaceCapture(prev => ({ ...prev, isCapturing: false }));
  };

  const captureFace = async () => {
    if (!modelsLoaded) {
      alert('Face detection models are still loading. Please wait...');
      return;
    }

    setFaceCapture(prev => ({ ...prev, isProcessing: true }));

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Detect face with face-api.js
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        // Draw detection box on canvas
        const displaySize = { width: canvas.width, height: canvas.height };
        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        // Get image as base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        setFaceCapture({
          image: imageData,
          detectionResult: {
            confidence: detections.detection.score,
            descriptor: detections.descriptor
          },
          isCapturing: false,
          isProcessing: false
        });

        stopCamera();
      } else {
        alert('No face detected. Please ensure your face is clearly visible and try again.');
        setFaceCapture(prev => ({ ...prev, isProcessing: false }));
      }
    } catch (error) {
      console.error('Error capturing face:', error);
      alert('Error detecting face. Please try again.');
      setFaceCapture(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const retakeFace = () => {
    setFaceCapture({
      image: null,
      detectionResult: null,
      isCapturing: false,
      isProcessing: false
    });
    startCamera();
  };

  const handleAadhaarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Aadhaar document must be less than 5MB');
        return;
      }
      setAadhaarDoc(file);
    }
  };

  const simulateFingerprintCapture = () => {
    // In production, this would interface with actual fingerprint hardware
    // For now, simulate fingerprint capture
    alert('Fingerprint capture would integrate with hardware device here');
    setFingerprintData({
      captured: true,
      quality: 85,
      timestamp: new Date().toISOString()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }

    if (!faceCapture.image) {
      alert('Please capture face image');
      return;
    }

    setSubmitStatus({ loading: true, error: null, success: false });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.firstName);
      formDataToSend.append('last_name', formData.lastName);
      formDataToSend.append('mobile', formData.mobile);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('aadhaar', formData.aadhaar);
      formDataToSend.append('entity_type', formData.entityType);

      // Convert base64 image to file
      const faceBlob = await fetch(faceCapture.image).then(r => r.blob());
      formDataToSend.append('face_image', faceBlob, 'face.jpg');

      if (aadhaarDoc) {
        formDataToSend.append('aadhaar_document', aadhaarDoc);
      }

      // Add face descriptor for verification
      if (faceCapture.detectionResult?.descriptor) {
        formDataToSend.append(
          'face_descriptor',
          JSON.stringify(Array.from(faceCapture.detectionResult.descriptor))
        );
      }

      const response = await fetch('/api/onboarding/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({ loading: false, error: null, success: true });
        alert('Onboarding request submitted successfully!');
        // Reset form
        resetForm();
      } else {
        throw new Error(result.detail || 'Failed to submit onboarding request');
      }
    } catch (error) {
      setSubmitStatus({
        loading: false,
        error: error.message,
        success: false
      });
      alert(`Error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      mobile: '',
      address: '',
      role: 'staff',
      aadhaar: '',
      entityType: 'staff'
    });
    setFaceCapture({
      image: null,
      detectionResult: null,
      isCapturing: false,
      isProcessing: false
    });
    setFingerprintData(null);
    setAadhaarDoc(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Enhanced Onboarding Form</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="staff">Staff</option>
              <option value="supervisor">Supervisor</option>
              <option value="harvestflow_manager">HarvestFlow Manager</option>
              <option value="flavorcore_manager">FlavorCore Manager</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhaar Number
            </label>
            <input
              type="text"
              value={formData.aadhaar}
              onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength="12"
              pattern="[0-9]{12}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity Type *
            </label>
            <select
              value={formData.entityType}
              onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="staff">Staff</option>
              <option value="supplier">Supplier</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
        </div>

        {/* Face Capture Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <Camera className="mr-2" size={20} />
            Face Recognition Setup *
          </h3>

          {!faceCapture.image ? (
            <div className="space-y-4">
              {!faceCapture.isCapturing ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center"
                  disabled={!modelsLoaded}
                >
                  <Camera className="mr-2" size={20} />
                  {modelsLoaded ? 'Start Camera' : 'Loading Face Detection Models...'}
                </button>
              ) : (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg border-2 border-blue-500"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                  />
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={captureFace}
                      disabled={faceCapture.isProcessing}
                      className="flex-1 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center justify-center disabled:opacity-50"
                    >
                      {faceCapture.isProcessing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Check className="mr-2" size={20} />
                          Capture Face
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={faceCapture.image}
                  alt="Captured face"
                  className="w-full rounded-lg border-2 border-green-500"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <Check size={16} className="mr-1" />
                  Face Detected ({(faceCapture.detectionResult.confidence * 100).toFixed(1)}% confidence)
                </div>
              </div>
              <button
                type="button"
                onClick={retakeFace}
                className="w-full py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
              >
                Retake Photo
              </button>
            </div>
          )}
        </div>

        {/* Fingerprint Section (Optional) */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <Fingerprint className="mr-2" size={20} />
            Fingerprint (Optional)
          </h3>

          {!fingerprintData ? (
            <button
              type="button"
              onClick={simulateFingerprintCapture}
              className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center justify-center"
            >
              <Fingerprint className="mr-2" size={20} />
              Capture Fingerprint
            </button>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
              <div className="flex items-center text-green-700">
                <Check className="mr-2" size={20} />
                Fingerprint Captured (Quality: {fingerprintData.quality}%)
              </div>
              <button
                type="button"
                onClick={() => setFingerprintData(null)}
                className="text-red-600 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Aadhaar Document Upload */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <Upload className="mr-2" size={20} />
            Aadhaar Document (Optional)
          </h3>

          <input
            type="file"
            onChange={handleAadhaarUpload}
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {aadhaarDoc && (
            <p className="mt-2 text-sm text-green-600 flex items-center">
              <Check size={16} className="mr-1" />
              {aadhaarDoc.name} selected
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="border-t pt-6">
          <button
            type="submit"
            disabled={submitStatus.loading || !faceCapture.image}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {submitStatus.loading ? 'Submitting...' : 'Submit Onboarding Request'}
          </button>

          {submitStatus.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start text-red-700">
              <AlertCircle className="mr-2 flex-shrink-0" size={20} />
              <span>{submitStatus.error}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default EnhancedOnboardingForm;