// src/lib/pushNotifications.ts
import api from './api';

let swRegistration: ServiceWorkerRegistration | null = null;

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('⚠️ This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  return false;
}

// Initialize push notifications (NON-BLOCKING)
export async function initializePushNotifications(
  registration: ServiceWorkerRegistration
): Promise<void> {
  swRegistration = registration;

  try {
    const hasPermission = await requestNotificationPermission();
    
    if (!hasPermission) {
      console.log('🔕 Notification permission not granted');
      return;
    }

    // Subscribe to push notifications
    const subscription = await subscribeToPush();
    console.log('✅ Push subscription successful:', subscription);
    
    // Send subscription to backend (only if online)
    if (navigator.onLine) {
      sendSubscriptionToBackend(subscription).catch((error) => {
        console.error('Failed to send subscription to backend:', error);
      });
    }
  } catch (error) {
    console.error('❌ Failed to initialize push notifications:', error);
    // Don't throw - app should continue without push notifications
  }
}

// Subscribe to push notifications
async function subscribeToPush(): Promise<PushSubscription> {
  if (!swRegistration) {
    throw new Error('Service Worker not registered');
  }

  try {
    // Check if already subscribed
    const existingSubscription = await swRegistration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Already subscribed to push notifications');
      return existingSubscription;
    }

    // VAPID public key - Get from environment or use default
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xYxmvGPPh8CZL6MZfwUe8cBAyC1Rm3VXxRQQjYO8VQD5aHM9J6Y2k';

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    throw error;
  }
}

// Send subscription to backend (NON-BLOCKING)
async function sendSubscriptionToBackend(
  subscription: PushSubscription
): Promise<void> {
  try {
    const subscriptionJSON = subscription.toJSON();
    
    // Store in localStorage (wrapped in try-catch)
    try {
      localStorage.setItem('push_subscription', JSON.stringify(subscriptionJSON));
    } catch (storageError) {
      console.warn('Failed to store subscription in localStorage:', storageError);
      // Continue even if localStorage fails
    }
    
    // TODO: Send to backend API when endpoint is ready
    // await api.registerPushSubscription(subscriptionJSON);
    
  } catch (error) {
    console.error('Failed to send subscription to backend:', error);
    throw error;
  }
}

// Show local notification
export function showLocalNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    const notificationOptions: NotificationOptions = {
      icon: '/flavorcore-logo.png',
      badge: '/flavorcore-logo.png',
      ...options,
    };

    if (swRegistration) {
      swRegistration.showNotification(title, notificationOptions);
    } else {
      new Notification(title, notificationOptions);
    }
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

// Notification types
export const NotificationTypes = {
  ONBOARDING_APPROVAL_REQUIRED: 'onboarding_approval_required',
  ONBOARDING_APPROVED: 'onboarding_approved',
  ONBOARDING_REJECTED: 'onboarding_rejected',
  ATTENDANCE_OVERRIDE_REQUIRED: 'attendance_override_required',
  ATTENDANCE_OVERRIDE_APPROVED: 'attendance_override_approved',
  PROVISION_APPROVAL_REQUIRED: 'provision_approval_required',
  PROVISION_APPROVED: 'provision_approved',
  LOT_COMPLETION_REVIEW: 'lot_completion_review',
  GPS_GEOFENCE_ALERT: 'gps_geofence_alert',
  SYNC_COMPLETE: 'sync_complete',
} as const;

// Send notification for different events
export function notifyOnboardingApprovalRequired(workerName: string): void {
  showLocalNotification('New Onboarding Request', {
    body: `${workerName} requires approval`,
    tag: NotificationTypes.ONBOARDING_APPROVAL_REQUIRED,
    data: { type: NotificationTypes.ONBOARDING_APPROVAL_REQUIRED },
  });
}

export function notifyAttendanceOverrideRequired(
  workerName: string,
  managerName: string
): void {
  showLocalNotification('Attendance Override Request', {
    body: `${managerName} requests override for ${workerName}`,
    tag: NotificationTypes.ATTENDANCE_OVERRIDE_REQUIRED,
    data: { type: NotificationTypes.ATTENDANCE_OVERRIDE_REQUIRED },
    requireInteraction: true,
  });
}

export function notifyProvisionApprovalRequired(
  requesterName: string,
  itemCount: number
): void {
  showLocalNotification('Provision Request', {
    body: `${requesterName} requests ${itemCount} items`,
    tag: NotificationTypes.PROVISION_APPROVAL_REQUIRED,
    data: { type: NotificationTypes.PROVISION_APPROVAL_REQUIRED },
  });
}

export function notifyLotCompletionReview(lotId: string): void {
  showLocalNotification('Lot Completion Review', {
    body: `${lotId} is ready for final approval`,
    tag: NotificationTypes.LOT_COMPLETION_REVIEW,
    data: { type: NotificationTypes.LOT_COMPLETION_REVIEW },
  });
}

export function notifyGeofenceAlert(vehicleId: string, location: string): void {
  showLocalNotification('⚠️ Geofence Alert', {
    body: `Vehicle ${vehicleId} has deviated from route near ${location}`,
    tag: NotificationTypes.GPS_GEOFENCE_ALERT,
    data: { type: NotificationTypes.GPS_GEOFENCE_ALERT },
    requireInteraction: true,
  });
}

export function notifySyncComplete(syncedCount: number): void {
  if (syncedCount === 0) return;
  
  showLocalNotification('Data Synced', {
    body: `${syncedCount} records synced successfully`,
    tag: NotificationTypes.SYNC_COMPLETE,
    data: { type: NotificationTypes.SYNC_COMPLETE },
  });
}

// Utility function
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    if (!swRegistration) {
      return false;
    }

    const subscription = await swRegistration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return false;
  }
}