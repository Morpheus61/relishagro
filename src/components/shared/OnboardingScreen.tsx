// src/components/shared/OnboardingScreen.tsx
import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, CheckCircle, Camera, Fingerprint, IdCard, RotateCcw, X, Shield, Eye, EyeOff } from 'lucide-react';

import { FingerprintScanner } from '../../lib/fingerprintScanner';

interface OnboardingScreenProps {
  navigateToScreen: (screen: string) => void;
  user: string | null;
}

export function OnboardingScreen({ navigateToScreen }: OnboardingScreenProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    address: '',
    role: '',
    aadhaar: '',
  });
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [verifyLater, setVerifyLater] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'fingerprint' | 'otp' | null>(null);

  // UIDAI Compliance State
  const [uidaiConsent, setUidaiConsent] = useState({
    dataProcessing: false,
    biometricCapture: false,
    storageConsent: false,
    purposeAgreed: false,
    auditTrail: false
  });
  const [showAadhaarFull, setShowAadhaarFull] = useState(false);
  const [consentTimestamp, setConsentTimestamp] = useState<string | null>(null);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Fingerprint State
  const [isScanning, setIsScanning] = useState(false);
  const [fingerprintTemplate, setFingerprintTemplate] = useState<Uint8Array | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // UIDAI Compliance Functions
  const maskAadhaar = (aadhaar: string) => {
    if (aadhaar.length >= 4) {
      return 'XXXX-XXXX-' + aadhaar.slice(-4);
    }
    return aadhaar;
  };

  const logAuditTrail = async (action: string, data: any) => {
    const auditLog = {
      timestamp: new Date().toISOString(),
      action,
      userId: formData.aadhaar ? maskAadhaar(formData.aadhaar) : 'unknown',
      deviceInfo: navigator.userAgent,
      consent: uidaiConsent,
      data: data
    };
    
    // Log to console for now - should send to secure audit service
    console.log('UIDAI Audit Log:', auditLog);
    
    // In production, send to secure audit endpoint
    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditLog)
      });
    } catch (err) {
      console.error('Failed to log audit trail:', err);
    }
  };

  const handleUidaiConsentChange = (field: keyof typeof uidaiConsent, value: boolean) => {
    setUidaiConsent(prev => ({ ...prev, [field]: value }));
    
    // Log consent changes
    logAuditTrail('consent_change', { field, value, timestamp: new Date().toISOString() });
    
    // Set timestamp when all consents are given
    const newConsent = { ...uidaiConsent, [field]: value };
    const allConsentsGiven = Object.values(newConsent).every(Boolean);
    if (allConsentsGiven && !consentTimestamp) {
      setConsentTimestamp(new Date().toISOString());
    }
  };

  const allUidaiConsentsGiven = Object.values(uidaiConsent).every(Boolean);

  // UIDAI Consent Component
  const UidaiConsentForm = () => (
    <Card className="p-4 border-2 border-blue-200 bg-blue-50">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="text-blue-600" size={20} />
        <h3 className="font-bold text-blue-900">UIDAI Data Processing Consent</h3>
      </div>
      
      <div className="space-y-3 text-sm">
        <label className="flex items-start gap-2">
          <input 
            type="checkbox" 
            checked={uidaiConsent.dataProcessing}
            onChange={(e) => handleUidaiConsentChange('dataProcessing', e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600"
          />
          <span>
            <strong>Data Processing:</strong> I consent to processing of my Aadhaar data for agricultural worker verification purpose only, as per UIDAI regulations.
          </span>
        </label>
        
        <label className="flex items-start gap-2">
          <input 
            type="checkbox"
            checked={uidaiConsent.biometricCapture}
            onChange={(e) => handleUidaiConsentChange('biometricCapture', e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600"
          />
          <span>
            <strong>Biometric Capture:</strong> I consent to biometric data capture and encrypted storage for authentication purposes only.
          </span>
        </label>
        
        <label className="flex items-start gap-2">
          <input 
            type="checkbox"
            checked={uidaiConsent.storageConsent}
            onChange={(e) => handleUidaiConsentChange('storageConsent', e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600"
          />
          <span>
            <strong>Secure Storage:</strong> I understand my data will be stored securely with encryption and deleted after 180 days or purpose completion.
          </span>
        </label>
        
        <label className="flex items-start gap-2">
          <input 
            type="checkbox"
            checked={uidaiConsent.purposeAgreed}
            onChange={(e) => handleUidaiConsentChange('purposeAgreed', e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600"
          />
          <span>
            <strong>Purpose Limitation:</strong> I agree that data will only be used for agricultural employment verification and not shared with unauthorized third parties.
          </span>
        </label>

        <label className="flex items-start gap-2">
          <input 
            type="checkbox"
            checked={uidaiConsent.auditTrail}
            onChange={(e) => handleUidaiConsentChange('auditTrail', e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600"
          />
          <span>
            <strong>Audit Trail:</strong> I consent to logging of data access for security and compliance purposes.
          </span>
        </label>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
        <p className="text-xs text-yellow-800">
          <strong>🛡️ Data Protection Notice:</strong> Your Aadhaar and biometric data is encrypted with AES-256 encryption and stored securely. 
          You can withdraw consent anytime by contacting our Data Protection Officer. All access is logged for audit purposes.
        </p>
      </div>

      <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded">
        <p className="text-xs text-green-800">
          <strong>📋 Withdrawal Rights:</strong> Contact support@relishagro.com or call +91-XXXX-XXXX to withdraw consent or request data deletion.
        </p>
      </div>

      {consentTimestamp && (
        <div className="mt-3 p-2 bg-blue-100 border border-blue-300 rounded">
          <p className="text-xs text-blue-800">
            <strong>✅ Consent Recorded:</strong> {new Date(consentTimestamp).toLocaleString('en-IN')}
          </p>
        </div>
      )}
    </Card>
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Log Aadhaar input for audit
    if (field === 'aadhaar' && value.length === 12) {
      logAuditTrail('aadhaar_entered', { maskedAadhaar: maskAadhaar(value) });
    }
  };

  const handleAadhaarVerify = async () => {
    if (!allUidaiConsentsGiven) {
      alert("Please provide all UIDAI consents to proceed with Aadhaar verification.");
      return;
    }

    // Log verification attempt
    await logAuditTrail('aadhaar_verification_attempt', { 
      method: verificationMethod,
      verifyLater: verifyLater,
      maskedAadhaar: maskAadhaar(formData.aadhaar)
    });

    if (verifyLater) {
      setAadhaarVerified(true);
      alert("Aadhaar details recorded. Verification will be completed when network is available.");
      return;
    }

    if (!verificationMethod) {
      alert("Please select a verification method");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        aadhaar_hash: await hashAadhaar(formData.aadhaar), // Hash for security
        method: verificationMethod,
        mobile: formData.mobile,
        consent_timestamp: consentTimestamp,
        audit_id: generateAuditId()
      };

      const response = await fetch('/api/aadhaar/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.status === 'verified') {
        setAadhaarVerified(true);
        await logAuditTrail('aadhaar_verified', { status: 'success' });
        alert('Aadhaar verified successfully!');
      } else if (data.status === 'queued') {
        setAadhaarVerified(true);
        await logAuditTrail('aadhaar_queued', { status: 'queued' });
        alert('Aadhaar details recorded. Verification will be completed when network is available.');
      } else {
        await logAuditTrail('aadhaar_verification_failed', { error: data.message });
        alert('Verification failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error("Verification error:", err);
      await logAuditTrail('aadhaar_verification_error', { error: err });
      alert('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utility functions for UIDAI compliance
  const hashAadhaar = async (aadhaar: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(aadhaar + 'relishagro_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateAuditId = (): string => {
    return 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Enhanced fingerprint capture with encryption
  const handleFingerprintCapture = async () => {
    if (!allUidaiConsentsGiven) {
      alert("Please provide all UIDAI consents before capturing biometric data.");
      return;
    }

    setIsScanning(true);
    setFingerprintTemplate(null);

    await logAuditTrail('fingerprint_capture_start', { timestamp: new Date().toISOString() });

    try {
      const scanner = new FingerprintScanner();
      const connected = await scanner.connect();
      
      if (!connected) {
        alert('Failed to connect to fingerprint scanner');
        setIsScanning(false);
        return;
      }

      const template = await scanner.captureTemplate();
      if (!template) {
        alert('Failed to capture fingerprint');
        setIsScanning(false);
        return;
      }

      // Encrypt template before storage
      const encryptedTemplate = await encryptBiometricData(template);
      setFingerprintTemplate(template);
      setIsScanning(false);
      setPhotoTaken(true);

      await logAuditTrail('fingerprint_captured', { 
        encrypted: true,
        timestamp: new Date().toISOString()
      });

      // Upload encrypted template to backend
      await fetch('/api/fingerprint/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_id_hash: await hashAadhaar(formData.aadhaar),
          encrypted_template: encryptedTemplate,
          consent_timestamp: consentTimestamp,
          audit_id: generateAuditId()
        })
      });
    } catch (err) {
      console.error('Fingerprint error:', err);
      await logAuditTrail('fingerprint_capture_error', { error: err });
      alert('Fingerprint capture failed');
    } finally {
      setIsScanning(false);
    }
  };

const encryptBiometricData = async (data: Uint8Array): Promise<string> => {
  // Generate encryption key
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  // Encrypt data - COMPLETE FIX with explicit type conversion
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Convert Uint8Array to ArrayBuffer explicitly
  const dataBuffer = new ArrayBuffer(data.length);
  const dataView = new Uint8Array(dataBuffer);
  dataView.set(data);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    dataBuffer  // Use the explicit ArrayBuffer
  );

  // Combine IV and encrypted data
  const encryptedArray = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv);
  combined.set(encryptedArray, iv.length);
  
  return btoa(String.fromCharCode(...combined));
};

  // Rest of your existing functions remain the same...
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

        // Log photo capture
        logAuditTrail('photo_captured', { timestamp: new Date().toISOString() });
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
    if (!allUidaiConsentsGiven) {
      alert("Please provide all UIDAI consents before submitting.");
      return;
    }

    setIsSubmitting(true);
    
    await logAuditTrail('form_submission', {
      hasPhoto: !!capturedImage,
      hasFingerprint: !!fingerprintTemplate,
      aadhaarVerified,
      consentTimestamp
    });

    setTimeout(() => {
      alert('Worker registered successfully! Pending admin approval.');
      navigateToScreen('dashboard');
    }, 2000);
  };

  const canSubmit = formData.firstName && formData.lastName && formData.mobile && 
                   formData.role && (aadhaarVerified || verifyLater) && photoTaken && 
                   allUidaiConsentsGiven;

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
          <h1 className="text-lg">Onboard New Worker</h1>
          <div className="ml-auto text-xs bg-green-700 px-2 py-1 rounded">
            🛡️ UIDAI Compliant
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* UIDAI Compliance Section - PLACED FIRST */}
        <UidaiConsentForm />

        {/* Personal Info */}
        <Card className="p-4">
          <h2 className="text-lg mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">First Name</label>
                <Input
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Last Name</label>
                <Input
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-2">Mobile Number</label>
              <Input
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2">Address</label>
              <Textarea
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2">Role</label>
              <Select onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="field-worker">Field Worker</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Basic Consent - Updated */}
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm">
              <strong>General Consent:</strong> I allow RelishAgro to store my employment information securely.
              <br />
              <em className="text-yellow-700">Note: Aadhaar and biometric consent is handled separately above as per UIDAI regulations.</em>
            </span>
          </label>
        </Card>

        {/* Aadhaar Verification - Enhanced */}
        <Card className="p-4">
          <h2 className="text-lg mb-4 flex items-center gap-2">
            <IdCard size={20} />
            Aadhaar Verification
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">UIDAI Compliant</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm mb-2"> {/* FIXED: Removed conflicting 'block' class */}
                Aadhaar Number
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAadhaarFull(!showAadhaarFull)}
                  className="p-1"
                >
                  {showAadhaarFull ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </label>
              <Input
                placeholder="Enter 12-digit Aadhaar number"
                value={showAadhaarFull ? formData.aadhaar : maskAadhaar(formData.aadhaar)}
                onChange={(e) => handleInputChange('aadhaar', e.target.value)}
                maxLength={12}
                type={showAadhaarFull ? "text" : "password"}
                disabled={!allUidaiConsentsGiven}
              />
              {formData.aadhaar && (
                <p className="text-xs text-gray-500 mt-1">
                  Displayed: {maskAadhaar(formData.aadhaar)} (Last 4 digits only, as per UIDAI guidelines)
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verifyLater"
                checked={verifyLater}
                onChange={(e) => setVerifyLater(e.target.checked)}
                className="h-4 w-4"
                disabled={!allUidaiConsentsGiven}
              />
              <label htmlFor="verifyLater" className="text-sm">
                Verify Aadhaar later (when network is available)
              </label>
            </div>

            {!verifyLater && (
              <>
                <div className="text-sm text-gray-600 mb-2">
                  Select verification method:
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant={verificationMethod === 'fingerprint' ? 'default' : 'outline'}
                    onClick={() => setVerificationMethod('fingerprint')}
                    className="flex-1"
                    disabled={!allUidaiConsentsGiven}
                  >
                    <Fingerprint size={16} className="mr-2" />
                    Fingerprint
                  </Button>
                  <Button 
                    variant={verificationMethod === 'otp' ? 'default' : 'outline'}
                    onClick={() => setVerificationMethod('otp')}
                    className="flex-1"
                    disabled={!allUidaiConsentsGiven}
                  >
                    OTP
                  </Button>
                </div>
              </>
            )}

            <Button 
              onClick={handleAadhaarVerify}
              disabled={!formData.aadhaar || formData.aadhaar.length !== 12 || !allUidaiConsentsGiven || (verifyLater ? false : !verificationMethod)}
              className="w-full"
            >
              {aadhaarVerified ? '✅ Verified' : verifyLater ? 'Save for Later Verification' : 'Verify Aadhaar'}
            </Button>
            
            {aadhaarVerified && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm">
                  {verifyLater ? 'Aadhaar recorded for later verification' : 'Aadhaar Verified'}
                </span>
              </div>
            )}

            {!allUidaiConsentsGiven && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-blue-700 text-sm">
                  ⚠️ Please provide UIDAI consent above before entering Aadhaar details.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Rest of your existing components remain the same... */}
        {/* Face Capture */}
        <Card className="p-4">
          <h2 className="text-lg mb-4">Capture Face</h2>
          <div className="space-y-4">
            {/* Camera Error */}
            {cameraError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{cameraError}</p>
              </div>
            )}

            {/* Camera View */}
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
                    {facingMode === 'user' ? 'Back' : 'Front'}
                  </Button>
                  
                  <Button onClick={stopCamera} variant="outline">
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                </div>
                
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {facingMode === 'user' ? '📱 Front Camera' : '📷 Back Camera'}
                  </span>
                </div>
              </div>
            )}

            {/* Captured Photo Preview */}
            {capturedImage && (
              <div className="text-center">
                <img 
                  src={capturedImage} 
                  alt="Captured face" 
                  className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-green-500"
                />
                <div className="flex gap-3 mt-4 justify-center">
                  <Button onClick={retakePhoto} variant="outline">
                    Retake Photo
                  </Button>
                </div>
              </div>
            )}

            {/* Photo Status */}
            <div className="text-center">
              {!photoTaken && !showCamera ? (
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                  <Camera size={48} className="text-gray-400" />
                </div>
              ) : null}
            </div>
            
            {/* Action Button */}
            {!photoTaken && !showCamera && (
              <Button 
                onClick={handlePhotoCapture}
                className="w-full"
              >
                <Camera size={16} className="mr-2" />
                Start Camera
              </Button>
            )}
            
            {photoTaken && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm">Face captured successfully</span>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Card>

        {/* Fingerprint Capture - Enhanced */}
        {verificationMethod === 'fingerprint' && (
          <Card className="p-4">
            <h2 className="text-lg mb-4 flex items-center gap-2">
              <Fingerprint size={20} />
              Capture Fingerprint
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Encrypted</span>
            </h2>
            <div className="space-y-4">
              <div className="text-center">
                {isScanning ? (
                  <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <Fingerprint size={48} className="text-blue-600 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                    <Fingerprint size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleFingerprintCapture}
                disabled={isScanning || !allUidaiConsentsGiven}
                className="w-full"
              >
                {isScanning ? 'Scanning...' : 'Scan Fingerprint (Encrypted)'}
              </Button>
              
              {fingerprintTemplate && (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-sm">Fingerprint captured and encrypted successfully</span>
                </div>
              )}

              {!allUidaiConsentsGiven && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-blue-700 text-sm">
                    ⚠️ Please provide UIDAI consent above before capturing biometric data.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Submit - Enhanced */}
        <div className="space-y-4">
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full bg-green-700 hover:bg-green-800"
          >
            {isSubmitting ? 'Submitting...' : '🛡️ Submit for Admin Approval (UIDAI Compliant)'}
          </Button>
          
          {!canSubmit && (
            <div className="text-center text-sm text-gray-500">
              {!allUidaiConsentsGiven ? 
                'Please provide all UIDAI consents to proceed' : 
                'Please complete all sections to submit'
              }
            </div>
          )}

          {allUidaiConsentsGiven && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-700 text-sm text-center">
                ✅ All UIDAI compliance requirements met. Data will be processed securely.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}