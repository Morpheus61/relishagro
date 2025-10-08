import * as faceapi from 'face-api.js';
import api from './api';

let modelsLoaded = false;

// Load face-api models
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;

  try {
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    console.log('Face-api models loaded successfully');
  } catch (error) {
    console.error('Failed to load face-api models:', error);
    throw new Error('Failed to load face recognition models');
  }
}

// Detect face and get descriptor
export async function detectFaceDescriptor(imageElement: HTMLImageElement | HTMLVideoElement): Promise<Float32Array | null> {
  try {
    await loadFaceModels();

    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      console.log('No face detected');
      return null;
    }

    return detection.descriptor;
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
}

// Convert descriptor to array for storage
export function descriptorToArray(descriptor: Float32Array): number[] {
  return Array.from(descriptor);
}

// Convert array back to Float32Array
export function arrayToDescriptor(array: number[]): Float32Array {
  return new Float32Array(array);
}

// Calculate similarity between two descriptors (0-1, higher is more similar)
export function calculateSimilarity(descriptor1: Float32Array, descriptor2: Float32Array): number {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  // Convert distance to similarity (lower distance = higher similarity)
  return 1 - Math.min(distance, 1);
}

// Register face for a user
export async function registerFace(
  staffId: string,
  imageElement: HTMLImageElement | HTMLVideoElement,
  capturedImageData?: string
): Promise<boolean> {
  try {
    const descriptor = await detectFaceDescriptor(imageElement);
    
    if (!descriptor) {
      throw new Error('No face detected in image');
    }

    const descriptorArray = descriptorToArray(descriptor);

    // Send to backend
    await api.registerFace({
      user_id: staffId,
      face_descriptor: descriptorArray,
      image_data: capturedImageData
    });

    console.log('Face registered successfully for user:', staffId);
    return true;
  } catch (error) {
    console.error('Face registration error:', error);
    throw error;
  }
}

// Authenticate user by face
export async function authenticateFace(
  imageElement: HTMLImageElement | HTMLVideoElement
): Promise<{ success: boolean; userId?: string; confidence?: number }> {
  try {
    const descriptor = await detectFaceDescriptor(imageElement);
    
    if (!descriptor) {
      return { success: false };
    }

    const descriptorArray = descriptorToArray(descriptor);

    // Send to backend for matching
    const result = await api.authenticateFace(descriptorArray);

    if (result.success) {
      console.log('Face authentication successful:', result.user_id);
      return {
        success: true,
        userId: result.user_id,
        confidence: result.confidence
      };
    }

    return { success: false };
  } catch (error) {
    console.error('Face authentication error:', error);
    return { success: false };
  }
}

// Capture image from video stream
export function captureImageFromVideo(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(video, 0, 0);
  }
  
  return canvas.toDataURL('image/jpeg', 0.8);
}

// Start camera stream
export async function startCameraStream(videoElement: HTMLVideoElement): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      }
    });

    videoElement.srcObject = stream;
    await videoElement.play();

    return stream;
  } catch (error) {
    console.error('Camera access error:', error);
    throw new Error('Failed to access camera');
  }
}

// Stop camera stream
export function stopCameraStream(videoElement: HTMLVideoElement): void {
  const stream = videoElement.srcObject as MediaStream;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
  }
}

// Submit complete onboarding data
export async function submitOnboardingWithBiometrics(data: {
  staffId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  designation: string;
  personType: string;
  faceDescriptor?: number[];
  fingerprintTemplate?: string;
  profileImage?: string;
}): Promise<boolean> {
  try {
    await api.submitOnboarding({
      staff_id: data.staffId,
      first_name: data.firstName,
      last_name: data.lastName,
      full_name: data.fullName,
      designation: data.designation,
      person_type: data.personType,
      face_descriptor: data.faceDescriptor,
      fingerprint_template: data.fingerprintTemplate,
      profile_image: data.profileImage
    });

    console.log('Onboarding submitted successfully for:', data.staffId);
    return true;
  } catch (error) {
    console.error('Onboarding submission error:', error);
    throw error;
  }
}