import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { 
  Camera, 
  User, 
  Check, 
  AlertCircle, 
  Loader, 
  ArrowLeft,
  CheckCircle,
  RotateCcw,
  X,
  Shield,
  UserCheck
} from 'lucide-react';

interface OnboardingScreenProps {
  navigateToScreen: (screen: string) => void;
  currentUser: {
    id: string;
    staff_id: string;
    full_name: string;
    role: string;
  } | null;
}

export function OnboardingScreen({ navigateToScreen, currentUser }: OnboardingScreenProps) {
  // Check if user has manager access
  const hasManagerAccess = currentUser && (
    currentUser.role === 'harvestflow_manager' || 
    currentUser.role === 'flavorcore_manager' ||
    currentUser.role === 'admin'
  );

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    address: '',
    role: '',
    aadhaar: '',
    consentGivenAt: null as string | null,
    onboardedBy: currentUser?.full_name || ''
  });
  
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [verifyLater, setVerifyLater] = useState(false);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // If not manager, show access denied
  if (!hasManagerAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              Worker onboarding is restricted to managers only.
            </p>
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <p>✅ HarvestFlow Managers</p>
              <p>✅ FlavorCore Managers</p>
              <p>✅ System Administrators</p>
            </div>
            <Button
              onClick={() => navigateToScreen('dashboard')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAadhaarVerify = async () => {
    if (!consentGiven) {
      alert("Please provide consent to proceed with Aadhaar verification.");
      return;
    }

    if (verifyLater) {
      setAadhaarVerified(true);
      alert("Aadhaar details recorded. Verification will be completed when network is available.");
      return;
    }

    if (!formData.aadhaar || formData.aadhaar.length !== 12) {
      alert("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock verification for demo - replace with actual UIDAI integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAadhaarVerified(true);
      alert('Aadhaar verified successfully!');
    } catch (err) {
      console.error("Verification error:", err);
      alert('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startCamera = async (facing: 'user' | 'environment' = facingMode) => {
    try {
      setCameraError(null);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: facing
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setFacingMode(facing);
      setShowCamera(true);
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError(`Unable to access ${facing === 'user' ? 'front' : 'back'} camera. Please ensure camera permissions are granted.`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraError(null);
  };

  const switchCamera = () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    startCamera(newFacing);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        if (facingMode === 'user') {
          context.scale(-1, 1);
          context.drawImage(video, -canvas.width, 0);
        } else {
          context.drawImage(video, 0, 0);
        }
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        setPhotoTaken(true);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setPhotoTaken(false);
    startCamera();
  };

  const handlePhotoCapture = () => {
    startCamera('user');
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      alert('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit to admin approval workflow
      const submissionData = {
        ...formData,
        face_image: capturedImage,
        consent_given_at: formData.consentGivenAt,
        status: 'pending_admin_approval',
        submitted_at: new Date().toISOString(),
        submitted_by_manager: currentUser?.full_name,
        manager_role: currentUser?.role
      };

      console.log('Onboarding submission to admin:', submissionData);

      // Mock API call - replace with actual submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`✅ Worker registration submitted successfully!

📋 Summary:
• Worker: ${formData.firstName} ${formData.lastName}
• Role: ${formData.role}
• Mobile: ${formData.mobile}
• Submitted by: ${currentUser?.full_name}

🔄 Workflow:
1. ✅ Manager Submitted
2. ⏳ Pending Admin Approval  
3. ⏳ System Access Creation

The admin will review and approve this registration.`);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        mobile: '',
        address: '',
        role: '',
        aadhaar: '',
        consentGivenAt: null,
        onboardedBy: currentUser?.full_name || ''
      });
      setPhotoTaken(false);
      setCapturedImage(null);
      setAadhaarVerified(false);
      setConsentGiven(false);
      
      navigateToScreen('dashboard');
    } catch (error: any) {
      console.error('Submission error:', error);
      alert(`Failed to submit: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = formData.firstName && formData.lastName && formData.mobile && 
                   formData.role && (aadhaarVerified || verifyLater) && photoTaken && consentGiven;

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Available roles based on manager type
  const getAvailableRoles = () => {
    if (!currentUser) return [];
    
    const baseRoles = [
      { value: 'field_worker', label: 'Field Worker' },
      { value: 'harvest_worker', label: 'Harvest Worker' },
      { value: 'processing_worker', label: 'Processing Worker' },
      { value: 'driver', label: 'Driver' },
      { value: 'quality_checker', label: 'Quality Checker' }
    ];

    if (currentUser.role === 'harvestflow_manager') {
      return [
        ...baseRoles,
        { value: 'harvest_supervisor', label: 'Harvest Supervisor' }
      ];
    }

    if (currentUser.role === 'flavorcore_manager') {
      return [
        ...baseRoles,
        { value: 'flavorcore_supervisor', label: 'FlavorCore Supervisor' }
      ];
    }

    if (currentUser.role === 'admin') {
      return [
        ...baseRoles,
        { value: 'harvest_supervisor', label: 'Harvest Supervisor' },
        { value: 'flavorcore_supervisor', label: 'FlavorCore Supervisor' },
        { value: 'harvestflow_manager', label: 'HarvestFlow Manager' },
        { value: 'flavorcore_manager', label: 'FlavorCore Manager' }
      ];
    }

    return baseRoles;
  };

  const availableRoles = getAvailableRoles();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-green-800 text-white p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateToScreen('dashboard')}
            className="text-white hover:bg-green-700"
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Worker Onboarding</h1>
            <p className="text-green-200 text-sm">Manager: {currentUser?.full_name}</p>
          </div>
          <UserCheck className="text-green-200" size={24} />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Manager Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <UserCheck className="text-blue-600" size={20} />
            <div>
              <p className="font-semibold text-blue-800">Manager Onboarding Session</p>
              <p className="text-sm text-blue-600">
                Submitting for Admin Approval • {currentUser?.role.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-green-600" size={20} />
            <h2 className="text-lg font-semibold">Worker Information</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Mobile Number *</label>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Address *</label>
              <textarea
                placeholder="Enter complete address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Job Role *</label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select job role</option>
                {availableRoles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Consent */}
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <Shield className="text-yellow-600 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 mb-2">Worker Consent</h3>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => {
                    setConsentGiven(e.target.checked);
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, consentGivenAt: new Date().toISOString() }));
                    }
                  }}
                  className="mt-1"
                />
                <span className="text-sm text-yellow-800">
                  <strong>Worker has provided consent</strong> for FlavorCore to collect and process 
                  their personal data (including Aadhaar and biometric data) for employment verification 
                  and system access. Data will be stored securely per company policy.
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* Aadhaar Verification */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold">Identity Verification</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Aadhaar Number *</label>
              <input
                type="text"
                placeholder="Enter 12-digit Aadhaar number"
                value={formData.aadhaar}
                onChange={(e) => handleInputChange('aadhaar', e.target.value.replace(/\D/g, ''))}
                maxLength={12}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verifyLater"
                checked={verifyLater}
                onChange={(e) => setVerifyLater(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="verifyLater" className="text-sm">
                Skip verification (verify when network available)
              </label>
            </div>

            <Button 
              onClick={handleAadhaarVerify}
              disabled={!formData.aadhaar || formData.aadhaar.length !== 12 || !consentGiven || isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting && !aadhaarVerified ? (
                <div className="flex items-center gap-2">
                  <Loader className="animate-spin" size={16} />
                  Verifying...
                </div>
              ) : aadhaarVerified ? (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  Verified
                </div>
              ) : verifyLater ? (
                'Save for Later Verification'
              ) : (
                'Verify Aadhaar'
              )}
            </Button>
            
            {aadhaarVerified && (
              <div className="flex items-center gap-2 text-green-600 p-2 bg-green-50 rounded">
                <CheckCircle size={16} />
                <span className="text-sm">
                  {verifyLater ? 'Aadhaar saved for later verification' : 'Aadhaar verified successfully'}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Face Capture */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="text-purple-600" size={20} />
            <h2 className="text-lg font-semibold">Worker Photo</h2>
          </div>
          
          <div className="space-y-4">
            {cameraError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{cameraError}</p>
              </div>
            )}

            {showCamera && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-md mx-auto rounded-lg"
                  style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                />
                
                <div className="flex gap-3 mt-4 justify-center">
                  <Button onClick={capturePhoto} className="bg-green-600 hover:bg-green-700">
                    <Camera size={16} className="mr-2" />
                    Capture
                  </Button>
                  
                  <Button onClick={switchCamera} variant="outline">
                    <RotateCcw size={16} className="mr-2" />
                    Switch
                  </Button>
                  
                  <Button onClick={stopCamera} variant="outline">
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="text-center">
                <img 
                  src={capturedImage} 
                  alt="Worker photo" 
                  className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-green-500"
                />
                <div className="flex gap-3 mt-4 justify-center">
                  <Button onClick={retakePhoto} variant="outline">
                    Retake Photo
                  </Button>
                </div>
              </div>
            )}

            {!photoTaken && !showCamera && (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Camera size={48} className="text-gray-400" />
                </div>
                <Button 
                  onClick={handlePhotoCapture}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Camera size={16} className="mr-2" />
                  Take Worker Photo
                </Button>
              </div>
            )}
            
            {photoTaken && (
              <div className="flex items-center justify-center gap-2 text-green-600 p-2 bg-green-50 rounded">
                <CheckCircle size={16} />
                <span className="text-sm">Worker photo captured successfully</span>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Card>

        {/* Submit */}
        <div className="space-y-4">
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full bg-green-700 hover:bg-green-800 h-12 text-lg font-semibold"
          >
            {isSubmitting && canSubmit ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={20} />
                Submitting to Admin...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check size={20} />
                Submit to Admin for Approval
              </div>
            )}
          </Button>
          
          {!canSubmit && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                Complete all sections to submit registration
              </p>
              <div className="flex justify-center gap-4 text-xs">
                <span className={formData.firstName && formData.lastName && formData.mobile && formData.role ? 'text-green-600' : 'text-gray-400'}>
                  ✓ Worker Info
                </span>
                <span className={consentGiven ? 'text-green-600' : 'text-gray-400'}>
                  ✓ Consent
                </span>
                <span className={aadhaarVerified || verifyLater ? 'text-green-600' : 'text-gray-400'}>
                  ✓ Aadhaar
                </span>
                <span className={photoTaken ? 'text-green-600' : 'text-gray-400'}>
                  ✓ Photo
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}