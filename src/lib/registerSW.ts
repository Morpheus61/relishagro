// src/lib/registerSW.ts
import { initializePushNotifications } from './pushNotifications';
import { setupAutoSync } from './offlineSync';

export async function registerServiceWorker(): Promise<void> {
  // Check environment
  const isDev = import.meta.env.DEV;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Workers not supported');
    return;
  }

  // In development, unregister service workers to avoid caching issues
  if (isDev || isLocalhost) {
    console.log('🔧 Development mode - unregistering service workers');
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    } catch (error) {
      console.error('Failed to unregister service workers:', error);
    }
    return;
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    console.log('✅ Service Worker registered:', registration.scope);

    // Initialize features WITHOUT blocking (fire and forget)
    initializeFeaturesAsync(registration);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateNotification();
          }
        });
      }
    });

  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    // Don't throw - app should continue without service worker
  }
}

// Initialize features asynchronously without blocking
async function initializeFeaturesAsync(registration: ServiceWorkerRegistration): Promise<void> {
  try {
    // Initialize push notifications (non-blocking)
    initializePushNotifications(registration).catch((error) => {
      console.error('Push notifications failed to initialize:', error);
    });

    // Setup automatic offline sync (non-blocking)
    setupAutoSync();

    console.log('✅ Service worker features initialized');
  } catch (error) {
    console.error('Failed to initialize service worker features:', error);
  }
}

function showUpdateNotification(): void {
  console.log('🔄 New version available');
  
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification('Update Available', {
      body: 'A new version of RelishAgro is available. Tap to update.',
      icon: '/flavorcore-logo.png',
      tag: 'app-update',
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.location.reload();
    };
  } else {
    // Fallback: Show in-app banner
    showUpdateBanner();
  }
}

function showUpdateBanner(): void {
  const banner = document.createElement('div');
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #7C3AED;
    color: white;
    padding: 16px;
    text-align: center;
    z-index: 9999;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  banner.innerHTML = '🔄 Update available! Tap to refresh.';
  banner.onclick = () => window.location.reload();
  document.body.appendChild(banner);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    banner.style.transition = 'opacity 0.3s';
    banner.style.opacity = '0';
    setTimeout(() => banner.remove(), 300);
  }, 10000);
}

// Unregister service worker (for debugging)
export async function unregisterServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      await registration.unregister();
      console.log('🗑️ Service Worker unregistered');
    }
  } catch (error) {
    console.error('Failed to unregister service worker:', error);
  }
}