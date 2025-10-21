import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initOfflineDB } from './lib/offlineSync';

console.log('🚀 App starting...');

// Render React app IMMEDIATELY
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// COMPLETELY REMOVE ALL SERVICE WORKERS - NO MORE CACHING ISSUES
async function removeAllServiceWorkers() {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length > 0) {
        console.log(`🗑️ Removing ${registrations.length} service worker(s)...`);
        
        for (const registration of registrations) {
          await registration.unregister();
          console.log('✅ Service worker removed');
        }
        
        // Clear all caches
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log('✅ Cache cleared:', cacheName);
        }
        
        console.log('✅ All service workers removed successfully');
      }
    } catch (error) {
      console.error('Error removing service workers:', error);
    }
  }
}

// Initialize app without service worker
async function initializeApp() {
  try {
    // Remove any existing service workers first
    await removeAllServiceWorkers();
    
    // Initialize offline database (optional)
    initOfflineDB()
      .then(() => {
        console.log('✅ Offline database initialized');
      })
      .catch((error) => {
        console.warn('⚠️ Offline database not available:', error);
      });

    console.log('✅ App initialized successfully');
  } catch (error) {
    console.error('App initialization error:', error);
  }
}

// Start app
initializeApp();