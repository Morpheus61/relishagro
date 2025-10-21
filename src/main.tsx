import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './lib/registerSW';
import { initOfflineDB } from './lib/offlineSync';

// Render React app IMMEDIATELY - don't wait for anything
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize features AFTER rendering (non-blocking)
async function initializeApp() {
  try {
    // Initialize offline database (non-blocking)
    initOfflineDB()
      .then(() => {
        console.log('✅ Offline database initialized');
      })
      .catch((error) => {
        console.error('❌ Offline database failed:', error);
        // App continues without offline DB
      });

    // Register service worker (non-blocking)
    registerServiceWorker()
      .then(() => {
        console.log('✅ Service worker registered');
      })
      .catch((error) => {
        console.error('❌ Service worker registration failed:', error);
        // App continues without service worker
      });

    // Setup online/offline detection
    setupNetworkDetection();

  } catch (error) {
    console.error('Initialization error:', error);
    // App continues even if initialization fails
  }
}

// Setup network status detection
function setupNetworkDetection(): void {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      console.log('🌐 Back online');
      document.body.classList.remove('offline');
    } else {
      console.log('📡 Gone offline');
      document.body.classList.add('offline');
    }
  };

  // Listen for online/offline events
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Set initial status
  updateOnlineStatus();
}

// Start initialization AFTER app renders
initializeApp();

// Add offline indicator styles
const style = document.createElement('style');
style.textContent = `
  body.offline::before {
    content: '📡 Offline Mode';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #f59e0b;
    color: white;
    text-align: center;
    padding: 8px;
    font-weight: 600;
    z-index: 9999;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  body.offline {
    padding-top: 40px;
  }
`;
document.head.appendChild(style);