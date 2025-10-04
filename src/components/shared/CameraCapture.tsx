// src/components/shared/CameraCapture.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Camera, X, RotateCcw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  isLoading?: boolean;
}

export function CameraCapture({ onCapture, isLoading = false }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [hasCamera, setHasCamera] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    
    try {
      // Request camera permissions
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
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
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another application.');
        } else {
          setError('Unable to access camera. Please check permissions.');
        }
      }
      
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
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(() => startCamera(), 100);
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      setError('Unable to capture image');
      return;
    }

    const { videoWidth, videoHeight } = video;
    
    if (videoWidth === 0 || videoHeight === 0) {
      setError('Video not ready. Please wait.');
      return;
    }

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Unable to access canvas context');
      return;
    }

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    
    // Convert to base64 JPEG (better compression than PNG)
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    const base64 = imageData.split(',')[1];
    
    // Validate image data
    if (!base64 || base64.length < 100) {
      setError('Captured image is invalid. Please try again.');
      return;
    }

    onCapture(base64);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {!isStreaming ? (
        <div className="text-center py-8">
          <Button
            onClick={startCamera}
            disabled={!hasCamera}
            className="bg-purple-600 hover:bg-purple-700 px-8 py-6 text-lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            {hasCamera ? 'Start Face Scan' : 'Camera Unavailable'}
          </Button>
          
          {!hasCamera && (
            <p className="text-sm text-slate-600 mt-4">
              Please enable camera permissions in your browser settings
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Camera Preview */}
          <div className="relative w-full max-w-lg mx-auto rounded-lg overflow-hidden border-4 border-purple-400 bg-black shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
            />
            
            {/* Face Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-80 border-4 border-dashed border-green-400 rounded-full opacity-50"></div>
              </div>
            </div>

            {/* Camera Controls Overlay */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={switchCamera}
                className="bg-white/80 hover:bg-white"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={stopCamera}
                className="bg-white/80 hover:bg-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <ul className="list-disc list-inside space-y-1">
              <li>Position your face within the guide</li>
              <li>Ensure good lighting</li>
              <li>Look directly at the camera</li>
              <li>Remove glasses if possible</li>
            </ul>
          </div>

          {/* Capture Button */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={captureImage}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 px-12 py-6 text-lg font-semibold shadow-lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              {isLoading ? 'Scanning...' : 'Capture & Verify'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}