// components/onboarding/EnhancedOnboardingForm.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Check, X, AlertCircle } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  mobile: string;
  address: string;
  role: string;
  aadhaar: string;
  entityType: string;
}

interface FaceCapture {
  image: string | null;
  isCapturing: boolean;
  isProcessing: boolean;
}

const EnhancedOnboardingForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    mobile: '',
    address: '',
    role: 'staff',
    aadhaar: '',
    entityType: 'staff'
  });

  const [faceCapture, setFaceCapture] = useState<FaceCapture>({
    image: null,
    isCapturing: false,
    isProcessing: false
  });

  const [aadhaarDoc, setAadhaarDoc] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null as string | null, success: false });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setFaceCapture(prev => ({ ...prev, isCapturing: false }));
  };

  const captureFace = async () => {
    setFaceCapture(prev => ({ ...prev, isProcessing: true }));

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        throw new Error('Video or canvas not available');
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        setFaceCapture({
          image: imageData,
          isCapturing: false,
          isProcessing: false
        });

        stopCamera();
      }
    } catch (error) {
      console.error('Face capture error:', error);
      setFaceCapture(prev => ({ ...prev, isProcessing: false }));
      alert('Failed to capture face. Please try again.');
    }
  };

  const retakeFace = () => {
    setFaceCapture({
      image: null,
      isCapturing: false,
      isProcessing: false
    });
    startCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAadhaarDoc(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.mobile) {
      alert('Please fill in all required fields');
      return;
    }

    if (!faceCapture.image) {
      alert('Please capture your face photo');
      return;
    }

    setSubmitStatus({ loading: true, error: null, success: false });

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://relishagrobackend-production.up.railway.app';
      
      const response = await fetch(`${API_URL}/api/onboarding/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          face_image: faceCapture.image.split(',')[1] // Remove data:image/jpeg;base64, prefix
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit onboarding request');
      }

      setSubmitStatus({ loading: false, error: null, success: true });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        mobile: '',
        address: '',
        role: 'staff',
        aadhaar: '',
        entityType: 'staff'
      });
      setFaceCapture({ image: null, isCapturing: false, isProcessing: false });
      setAadhaarDoc(null);

      alert('Onboarding request submitted successfully!');
    } catch (error: any) {
      console.error('Submission error:', error);
      setSubmitStatus({ loading: false, error: error.message, success: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Enhanced Onboarding Form</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff">Staff</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  maxLength={12}
                />
              </div>
            </div>

            {/* Face Capture Section */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Camera className="mr-2 text-blue-600" size={24} />
                Face Capture *
              </h2>

              <div className="bg-gray-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                {!faceCapture.isCapturing && !faceCapture.image && (
                  <div className="h-full flex items-center justify-center">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center"
                    >
                      <Camera className="mr-2" size={20} />
                      Start Camera
                    </button>
                  </div>
                )}

                {faceCapture.isCapturing && (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-4 border-white rounded-full opacity-50" style={{ width: '250px', height: '300px' }}></div>
                    </div>
                  </>
                )}

                {faceCapture.image && (
                  <img
                    src={faceCapture.image}
                    alt="Captured face"
                    className="w-full h-full object-cover"
                  />
                )}

                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="mt-4 flex gap-4">
                {faceCapture.isCapturing && (
                  <>
                    <button
                      type="button"
                      onClick={captureFace}
                      disabled={faceCapture.isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center disabled:opacity-50"
                    >
                      <Check className="mr-2" size={20} />
                      {faceCapture.isProcessing ? 'Processing...' : 'Capture Face'}
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-6 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {faceCapture.image && (
                  <button
                    type="button"
                    onClick={retakeFace}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center"
                  >
                    <Camera className="mr-2" size={20} />
                    Retake Photo
                  </button>
                )}
              </div>
            </div>

            {/* Aadhaar Document Upload */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Upload className="mr-2 text-blue-600" size={24} />
                Aadhaar Document (Optional)
              </h2>
              
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              
              {aadhaarDoc && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <Check className="mr-1" size={16} />
                  File uploaded: {aadhaarDoc.name}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="border-t pt-6">
              {submitStatus.error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="text-red-600 mt-1 mr-3 flex-shrink-0" size={20} />
                  <p className="text-red-800">{submitStatus.error}</p>
                </div>
              )}

              {submitStatus.success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                  <Check className="text-green-600 mt-1 mr-3 flex-shrink-0" size={20} />
                  <p className="text-green-800">Onboarding request submitted successfully!</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitStatus.loading || !faceCapture.image}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitStatus.loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2" size={20} />
                    Submit Onboarding Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOnboardingForm;