import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './lib/registerSW';
import { initOfflineDB } from './lib/offlineSync';

// Initialize app
async function initializeApp() {
  try {
    // Initialize offline database
    await initOfflineDB();
    console.log('✅ Offline database initialized');

    // Register service worker for PWA
    await registerServiceWorker();
    console.log('✅ Service worker registered');

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('🌐 Back online');
      document.body.classList.remove('offline');
    });

    window.addEventListener('offline', () => {
      console.log('📡 Gone offline');
      document.body.classList.add('offline');
    });

  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

// Start initialization
initializeApp();

// Render React app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

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
  }
  
  body.offline {
    padding-top: 40px;
  }
`;
document.head.appendChild(style);