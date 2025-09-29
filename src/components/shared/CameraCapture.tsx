// src/components/shared/CameraCapture.tsx
import React, { useRef, useState } from 'react';
import { Button } from '../ui/button';

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  isLoading?: boolean;
}

export function CameraCapture({ onCapture, isLoading = false }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera access denied', err);
      setHasCamera(false);
    }
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      alert('Unable to access 2D context');
      return;
    }

    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    const imageData = canvas.toDataURL('image/jpeg');
    onCapture(imageData.split(',')[1]); // Send base64 without prefix
  };

  return (
    <div className="space-y-4">
      {!isStreaming ? (
        <Button onClick={startCamera} disabled={!hasCamera}>
          {hasCamera ? 'Start Face Scan' : 'No Camera Access'}
        </Button>
      ) : null}

      {isStreaming && (
        <>
          <div className="relative w-full max-w-sm mx-auto rounded-lg overflow-hidden border-2 border-purple-300 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
            />
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex justify-center">
            <Button
              onClick={capture}
              disabled={isLoading}
              className="bg-green-700 hover:bg-green-800 px-8 py-6 text-lg"
            >
              {isLoading ? 'Scanning...' : 'Capture & Verify'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}