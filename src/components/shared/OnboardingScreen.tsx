// src/components/shared/OnboardingScreen.tsx
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, CheckCircle, Camera, Fingerprint, IdCard } from 'lucide-react';

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAadhaarVerify = async () => {
    if (!consentGiven) {
      alert("Please provide consent to proceed with Aadhaar verification.");
      return;
    }

    if (verifyLater) {
      // Save for later verification
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
        aadhaar: formData.aadhaar,
        method: verificationMethod,
        // For OTP: send mobile number
        // For fingerprint: capture template (simulated here)
        mobile: formData.mobile,
      };

      const response = await fetch('/api/aadhaar/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.status === 'verified') {
        setAadhaarVerified(true);
        alert('Aadhaar verified successfully!');
      } else if (data.status === 'queued') {
        setAadhaarVerified(true);
        alert('Aadhaar details recorded. Verification will be completed when network is available.');
      } else {
        alert('Verification failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error("Verification error:", err);
      alert('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoCapture = () => {
    // Simulate photo capture
    setTimeout(() => {
      setPhotoTaken(true);
    }, 1500);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Worker registered successfully! Pending admin approval.');
      navigateToScreen('dashboard');
    }, 2000);
  };

  const canSubmit = formData.firstName && formData.lastName && formData.mobile && 
                   formData.role && (aadhaarVerified || verifyLater) && photoTaken && consentGiven;

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
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Personal Information */}
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

        {/* Consent */}
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm">
              <strong>Consent:</strong> I allow R F Plantations to verify my identity using Aadhaar. 
              My data will be stored securely and used only for employment purposes.
            </span>
          </label>
        </Card>

        {/* Aadhaar Verification */}
        <Card className="p-4">
          <h2 className="text-lg mb-4">Aadhaar Verification</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Aadhaar Number</label>
              <Input
                placeholder="Enter 12-digit Aadhaar number"
                value={formData.aadhaar}
                onChange={(e) => handleInputChange('aadhaar', e.target.value)}
                maxLength={12}
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
                  >
                    <Fingerprint size={16} className="mr-2" />
                    Fingerprint
                  </Button>
                  <Button 
                    variant={verificationMethod === 'otp' ? 'default' : 'outline'}
                    onClick={() => setVerificationMethod('otp')}
                    className="flex-1"
                  >
                    OTP
                  </Button>
                </div>
              </>
            )}

            <Button 
              onClick={handleAadhaarVerify}
              disabled={!formData.aadhaar || formData.aadhaar.length !== 12 || !consentGiven || (verifyLater ? false : !verificationMethod)}
              className="w-full"
            >
              {aadhaarVerified ? 'Verified' : verifyLater ? 'Save for Later Verification' : 'Verify Aadhaar'}
            </Button>
            
            {aadhaarVerified && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm">
                  {verifyLater ? 'Aadhaar recorded for later verification' : 'Aadhaar Verified'}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Face Capture */}
        <Card className="p-4">
          <h2 className="text-lg mb-4">Capture Face</h2>
          <div className="space-y-4">
            <div className="text-center">
              {photoTaken ? (
                <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={48} className="text-green-600" />
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                  <Camera size={48} className="text-gray-400" />
                </div>
              )}
            </div>
            
            <Button 
              onClick={handlePhotoCapture}
              disabled={photoTaken}
              className="w-full"
            >
              {photoTaken ? 'Photo Captured' : 'Take Photo'}
            </Button>
            
            {photoTaken && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm">Face captured successfully</span>
              </div>
            )}
          </div>
        </Card>

        {/* Submit */}
        <div className="space-y-4">
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full bg-green-700 hover:bg-green-800"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Admin Approval'}
          </Button>
          
          {!canSubmit && (
            <div className="text-center text-sm text-gray-500">
              Please complete all sections to submit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}