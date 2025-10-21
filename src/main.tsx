import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './lib/registerSW';
import { initOfflineDB } from './lib/offlineSync';

// Render React app IMMEDIATELY
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// FORCE KILL OLD SERVICE WORKER - ONE TIME ONLY
async function forceKillOldServiceWorkerOnce() {
  // Check if we already cleared the cache in this session
  const cacheCleared = sessionStorage.getItem('cache_cleared');
  
  if (cacheCleared === 'true') {
    console.log('✅ Cache already cleared in this session, skipping...');
    // Now initialize app normally
    initializeApp();
    return;
  }

  if ('serviceWorker' in navigator) {
    try {
      console.log('🗑️ First visit - clearing old service workers...');
      
      // Get all existing registrations
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length > 0) {
        console.log(`🗑️ Found ${registrations.length} service worker(s) to unregister`);
        
        // Unregister all existing service workers
        for (const registration of registrations) {
          await registration.unregister();
          console.log('✅ Unregistered service worker');
        }
        
        // Clear all caches
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log('✅ Deleted cache:', cacheName);
        }
        
        console.log('✅ All service workers and caches cleared!');
        
        // Mark as cleared in sessionStorage (persists until tab close)
        sessionStorage.setItem('cache_cleared', 'true');
        
        // Show notification to user (but DON'T auto-reload)
        const banner = document.createElement('div');
        banner.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #10b981;
          color: white;
          padding: 12px 16px;
          text-align: center;
          z-index: 99999;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
        `;
        banner.innerHTML = '✅ Cache cleared! Click here to reload (or wait 5 seconds)';
        banner.onclick = () => {
          sessionStorage.setItem('cache_cleared', 'true');
          window.location.reload();
        };
        document.body.appendChild(banner);
        
        // Auto reload after 5 seconds (only ONCE)
        setTimeout(() => {
          sessionStorage.setItem('cache_cleared', 'true');
          window.location.reload();
        }, 5000);
      } else {
        console.log('✅ No service workers found - starting fresh');
        sessionStorage.setItem('cache_cleared', 'true');
        initializeApp();
      }
      
    } catch (error) {
      console.error('❌ Error clearing service workers:', error);
      sessionStorage.setItem('cache_cleared', 'true');
      initializeApp();
    }
  } else {
    sessionStorage.setItem('cache_cleared', 'true');
    initializeApp();
  }
}

// Initialize features after clearing
async function initializeApp() {
  try {
    console.log('🚀 Initializing app features...');
    
    // Initialize offline database (non-blocking)
    initOfflineDB()
      .then(() => {
        console.log('✅ Offline database initialized');
      })
      .catch((error) => {
        console.error('❌ Offline database failed:', error);
      });

    // Register service worker (non-blocking)
    registerServiceWorker()
      .then(() => {
        console.log('✅ Service worker registered');
      })
      .catch((error) => {
        console.error('❌ Service worker registration failed:', error);
      });

  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Run the killer once on first load
forceKillOldServiceWorkerOnce();