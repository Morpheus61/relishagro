import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// import { registerServiceWorker } from './lib/registerSW'; // TEMPORARILY DISABLED
// import { initOfflineDB } from './lib/offlineSync'; // TEMPORARILY DISABLED

// Render React app IMMEDIATELY
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// FORCE KILL OLD SERVICE WORKER - TEMPORARY FIX
async function forceKillOldServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      console.log('🗑️ Attempting to clear old service workers...');
      
      // Get all existing registrations
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length > 0) {
        console.log(`🗑️ Found ${registrations.length} service worker(s) to unregister`);
        
        // Unregister all existing service workers
        for (const registration of registrations) {
          await registration.unregister();
          console.log('✅ Unregistered service worker:', registration.scope);
        }
        
        // Clear all caches
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log('✅ Deleted cache:', cacheName);
        }
        
        console.log('✅ All service workers and caches cleared!');
        console.log('🔄 Please refresh the page to load the new version');
        
        // Show notification to user
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
        `;
        banner.innerHTML = '✅ Cache cleared! Click here to reload with the latest version';
        banner.style.cursor = 'pointer';
        banner.onclick = () => window.location.reload();
        document.body.appendChild(banner);
        
        // Auto reload after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.log('✅ No service workers found - starting fresh');
      }
      
    } catch (error) {
      console.error('❌ Error clearing service workers:', error);
    }
  }
}

// Run the killer immediately
forceKillOldServiceWorker();

// Initialize features AFTER killing old SW (but don't register new SW yet)
// async function initializeApp() {
//   try {
//     // Initialize offline database (non-blocking)
//     initOfflineDB()
//       .then(() => {
//         console.log('✅ Offline database initialized');
//       })
//       .catch((error) => {
//         console.error('❌ Offline database failed:', error);
//       });

//     // DON'T register service worker yet - wait until old one is cleared
//     // registerServiceWorker()
//     //   .then(() => {
//     //     console.log('✅ Service worker registered');
//     //   })
//     //   .catch((error) => {
//     //     console.error('❌ Service worker registration failed:', error);
//     //   });

//   } catch (error) {
//     console.error('Initialization error:', error);
//   }
// }

// initializeApp();