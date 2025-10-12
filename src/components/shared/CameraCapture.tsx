import React, { useRef, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Camera, X, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  isLoading?: boolean;
  purpose?: 'face' | 'document' | 'general';
  showInstructions?: boolean;
}

export function CameraCapture({ 
  onCapture, 
  isLoading = false, 
  purpose = 'face',
  showInstructions = true 
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [hasCamera, setHasCamera] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [captureReady, setCaptureReady] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    setCaptureReady(false);
    
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsStreaming(true);
          // Give camera time to adjust
          setTimeout(() => setCaptureReady(true), 1000);
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      
      if (err instanceof Error) {
        switch (err.name) {
          case 'NotAllowedError':
            setError('Camera access denied. Please allow camera permissions and refresh the page.');
            break;
          case 'NotFoundError':
            setError('No camera found on this device. Please ensure a camera is connected.');
            break;
          case 'NotReadableError':
            setError('Camera is already in use by another application. Please close other apps using the camera.');
            break;
          case 'OverconstrainedError':
            setError('Camera doesn\'t support the required settings. Trying fallback...');
            // Try with less restrictive constraints
            setTimeout(() => startCameraFallback(), 1000);
            return;
          default:
            setError('Unable to access camera. Please check permissions and try again.');
        }
      }
      
      setHasCamera(false);
    }
  };

  const startCameraFallback = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsStreaming(true);
          setCaptureReady(true);
        };
      }
      setError(null);
      setHasCamera(true);
    } catch (err) {
      setError('Unable to access camera with fallback settings.');
      setHasCamera(false);
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
    
    setIsStreaming(false);
    setCaptureReady(false);
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    stopCamera();
    setTimeout(() => startCamera(), 500);
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !captureReady) {
      setError('Camera not ready. Please wait a moment and try again.');
      return;
    }

    const { videoWidth, videoHeight } = video;
    
    if (videoWidth === 0 || videoHeight === 0) {
      setError('Video not ready. Please wait for the camera to initialize.');
      return;
    }

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Unable to process image. Please try again.');
      return;
    }

    // Mirror the image if using front camera for better UX
    if (facingMode === 'user') {
      ctx.scale(-1, 1);
      ctx.drawImage(video, -videoWidth, 0, videoWidth, videoHeight);
    } else {
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    }
    
    // Convert to base64 JPEG with good quality
    const imageData = canvas.toDataURL('image/jpeg', 0.92);
    const base64 = imageData.split(',')[1];
    
    // Validate image data
    if (!base64 || base64.length < 1000) {
      setError('Captured image is too small or invalid. Please ensure good lighting and try again.');
      return;
    }

    onCapture(base64);
  };

  const getInstructions = () => {
    switch (purpose) {
      case 'face':
        return [
          'Position your face within the oval guide',
          'Ensure good lighting on your face',
          'Look directly at the camera',
          'Remove glasses if they cause glare',
          'Keep your face steady during capture'
        ];
      case 'document':
        return [
          'Position document flat and centered',
          'Ensure all text is clearly visible',
          'Avoid shadows on the document',
          'Keep the document within the frame',
          'Use good lighting for clarity'
        ];
      default:
        return [
          'Position subject clearly in frame',
          'Ensure good lighting',
          'Hold steady during capture',
          'Check focus before capturing'
        ];
    }
  };

  const getGuideOverlay = () => {
    if (purpose === 'face') {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-80 border-4 border-dashed border-green-400 rounded-full opacity-70">
            <div className="absolute inset-4 border-2 border-green-300 rounded-full opacity-50"></div>
          </div>
        </div>
      );
    } else if (purpose === 'document') {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-80 h-56 border-4 border-dashed border-blue-400 rounded-lg opacity-70">
            <div className="absolute inset-2 border-2 border-blue-300 rounded opacity-50"></div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-medium">Camera Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              {!hasCamera && (
                <Button
                  onClick={() => {
                    setError(null);
                    setHasCamera(true);
                    startCamera();
                  }}
                  size="sm"
                  className="mt-2 bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {!isStreaming ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
            <Camera className="w-12 h-12 text-purple-600" />
          </div>
          
          <Button
            onClick={startCamera}
            disabled={!hasCamera || isLoading}
            className="bg-purple-600 hover:bg-purple-700 px-8 py-4 text-lg font-semibold"
          >
            <Camera className="w-5 h-5 mr-2" />
            {hasCamera ? `Start ${purpose === 'face' ? 'Face' : 'Camera'} Capture` : 'Camera Unavailable'}
          </Button>
          
          {hasCamera && (
            <p className="text-sm text-gray-600 mt-4">
              Click to access your camera and begin capture
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Camera Preview */}
          <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden border-4 border-purple-400 bg-black shadow-xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
            
            {/* Guide Overlay */}
            {getGuideOverlay()}

            {/* Camera Controls Overlay */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={switchCamera}
                className="bg-white/90 hover:bg-white shadow-lg"
                title="Switch Camera"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={stopCamera}
                className="bg-white/90 hover:bg-white shadow-lg"
                title="Stop Camera"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Camera Status Indicator */}
            <div className="absolute top-4 left-4">
              <div className="flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                <div className={`w-2 h-2 rounded-full ${captureReady ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span>{captureReady ? 'Ready' : 'Initializing...'}</span>
              </div>
            </div>

            {/* Camera Type Indicator */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {facingMode === 'user' ? '📱 Front Camera' : '📷 Back Camera'}
              </div>
            </div>
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Instructions */}
          {showInstructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Capture Guidelines:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                {getInstructions().map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Capture Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={captureImage}
              disabled={isLoading || !captureReady}
              className="bg-green-600 hover:bg-green-700 px-12 py-4 text-lg font-semibold shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : !captureReady ? (
                <>
                  <div className="animate-pulse w-5 h-5 bg-white/50 rounded mr-2" />
                  Camera Starting...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Capture {purpose === 'face' ? 'Face' : 'Image'}
                </>
              )}
            </Button>
          </div>

          {/* Quality Tips */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              💡 For best results: {purpose === 'face' ? 'Face the camera directly with good lighting' : 'Ensure clear focus and adequate lighting'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}