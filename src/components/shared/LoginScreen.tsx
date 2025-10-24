import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import flavorCoreLogo from '../../assets/flavorcore-logo.png';
import { useAuth } from '../../contexts/AuthContext';

const debugLog = (message: string, data?: any) => {
  console.log(`[LoginScreen] ${message}`, data || '');
};

// Get API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://relishagrobackend-production.up.railway.app';

export function LoginScreen() {
  const [staffId, setStaffId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCacheClear, setShowCacheClear] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      debugLog('User authenticated, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Mobile diagnostics function
  const runDiagnostics = async () => {
    debugLog('🔍 Running diagnostics...');
    setIsLoading(true);
    
    const info: any = {
      timestamp: new Date().toISOString(),
      device: {
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        isMobile: window.innerWidth <= 768,
        platform: navigator.platform,
        isAndroid: /android/i.test(navigator.userAgent),
        isWindows: /windows/i.test(navigator.userAgent),
      },
      config: {
        apiUrl: API_URL,
        hasToken: !!localStorage.getItem('auth_token'),
        hasUserData: !!localStorage.getItem('user_data'),
        localStorageKeys: Object.keys(localStorage),
      },
      tests: {}
    };

    // Test 1: Health endpoint
    try {
      const healthStart = Date.now();
      const healthRes = await fetch(`${API_URL}/health`, { 
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });
      const healthTime = Date.now() - healthStart;
      
      info.tests.health = {
        success: healthRes.ok,
        status: healthRes.status,
        statusText: healthRes.statusText,
        responseTime: `${healthTime}ms`,
        headers: Object.fromEntries(healthRes.headers.entries())
      };
      
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        info.tests.health.data = healthData;
      }
    } catch (err: any) {
      info.tests.health = { 
        success: false,
        error: err.message,
        type: err.name 
      };
    }

    // Test 2: CORS preflight
    try {
      const corsStart = Date.now();
      const corsRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type'
        }
      });
      const corsTime = Date.now() - corsStart;
      
      info.tests.cors = {
        success: corsRes.ok,
        status: corsRes.status,
        responseTime: `${corsTime}ms`,
        headers: Object.fromEntries(corsRes.headers.entries())
      };
    } catch (err: any) {
      info.tests.cors = { 
        success: false,
        error: err.message,
        type: err.name 
      };
    }

    // Test 3: Auth endpoint reachability
    try {
      const authStart = Date.now();
      const authRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ staff_id: 'TEST' })
      });
      const authTime = Date.now() - authStart;
      
      info.tests.authEndpoint = {
        success: true,
        reachable: true,
        status: authRes.status,
        statusText: authRes.statusText,
        responseTime: `${authTime}ms`
      };
    } catch (err: any) {
      info.tests.authEndpoint = { 
        success: false,
        reachable: false,
        error: err.message,
        type: err.name 
      };
    }

    setDebugInfo(info);
    setShowDebugInfo(true);
    setIsLoading(false);
    
    console.log('📊 Full Diagnostics:', info);
  };

  const handleLogin = async () => {
    if (!staffId.trim()) {
      setError('Please enter your Staff ID');
      return;
    }

    debugLog('Starting login', { staffId: staffId.trim() });
    setIsLoading(true);
    setError('');

    try {
      // ✅ REMOVED THE PROBLEMATIC MOBILE CONNECTIVITY PRE-CHECK
      // Just proceed directly to login - if there's a real connectivity issue,
      // the actual login call will fail anyway
      
      debugLog('📱 Attempting login for staff_id:', staffId.trim());
      
      // Proceed with actual login
      await login(staffId.trim());
      debugLog('✅ Login successful');
      
    } catch (err: any) {
      debugLog('❌ Login error', err);
      
      // Enhanced error messages
      let errorMessage = 'Login failed. ';
      
      if (!navigator.onLine) {
        errorMessage = '🔴 You are offline. Please check your internet connection.';
      } else if (err.message.includes('fetch') || err.message.includes('Network')) {
        errorMessage = '🔴 Network error - Cannot connect to server. Please check your internet connection.';
      } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        errorMessage = '🔴 Invalid Staff ID. Please check and try again.';
      } else if (err.message.includes('CORS') || err.message.includes('blocked')) {
        errorMessage = '🔴 Security error. Please contact your administrator.';
      } else if (err.message.includes('timeout')) {
        errorMessage = '🔴 Connection timeout. The server is taking too long to respond.';
      } else {
        errorMessage += err.message || 'Please check your Staff ID and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  // Emergency cache clear function
  const clearCacheAndReload = async () => {
    try {
      debugLog('Clearing all caches and service workers...');
      
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          debugLog('Unregistered service worker');
        }
      }
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          debugLog('Deleted cache:', cacheName);
        }
      }
      
      // Clear localStorage (but keep important data)
      const authToken = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      localStorage.clear();
      if (authToken) localStorage.setItem('auth_token', authToken);
      if (userData) localStorage.setItem('user_data', userData);
      
      debugLog('Cache cleared successfully, reloading...');
      alert('✅ Cache cleared! The page will now reload.');
      window.location.reload();
    } catch (error) {
      debugLog('Error clearing cache', error);
      alert('❌ Error clearing cache. Please try manually: DevTools → Application → Clear Storage');
    }
  };

  // Copy diagnostics to clipboard
  const copyDiagnostics = () => {
    if (debugInfo) {
      const diagnosticsText = JSON.stringify(debugInfo, null, 2);
      navigator.clipboard.writeText(diagnosticsText)
        .then(() => alert('✅ Diagnostics copied to clipboard!'))
        .catch(() => alert('❌ Failed to copy. Please screenshot instead.'));
    }
  };

  return (
    <div className="min-h-screen bg-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Logo */}
        <div className="text-center mb-6">
          <img 
            src={flavorCoreLogo}
            alt="FlavorCore" 
            className="w-32 h-32 mx-auto mb-3 object-contain"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Relish Agro</h2>
          <p className="text-sm text-gray-600">Agricultural Management System</p>
        </div>

        {/* Login Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff ID
            </label>
            <Input
              type="text"
              placeholder="Enter your assigned Staff ID (e.g., HF-Regu, Admin-001)"
              value={staffId}
              onChange={(e) => {
                setStaffId(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              className={`w-full ${error ? 'border-red-500' : ''}`}
              disabled={isLoading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              inputMode="text"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your assigned Staff ID
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}
          </div>

          <Button 
            onClick={handleLogin}
            disabled={!staffId.trim() || isLoading}
            className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secure Access • Contact Admin for Staff ID
          </p>
          
          {/* Emergency Tools Button */}
          <button
            onClick={() => setShowCacheClear(!showCacheClear)}
            className="text-xs text-gray-400 hover:text-gray-600 mt-2 underline"
          >
            Having issues? Click here
          </button>
          
          {/* Tools Panel */}
          {showCacheClear && (
            <div className="mt-3 space-y-2">
              {/* Cache Clear */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800 mb-2">
                  🧹 Clear cached content:
                </p>
                <button
                  onClick={clearCacheAndReload}
                  className="text-xs bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 w-full"
                >
                  Clear Cache & Reload
                </button>
              </div>

              {/* Diagnostics */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-800 mb-2">
                  🔍 Test connection to server:
                </p>
                <button
                  onClick={runDiagnostics}
                  disabled={isLoading}
                  className="text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 w-full disabled:bg-gray-400"
                >
                  {isLoading ? 'Testing...' : 'Run Diagnostics'}
                </button>
              </div>

              {/* Diagnostics Results */}
              {showDebugInfo && debugInfo && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-700">
                      📊 Diagnostics Results:
                    </p>
                    <button
                      onClick={() => setShowDebugInfo(false)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* Device Info */}
                  {debugInfo.device.isAndroid && (
                    <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs text-green-700">
                        📱 Android Device Detected
                      </p>
                    </div>
                  )}
                  
                  {/* Summary */}
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Backend Health:</span>
                      <span className={debugInfo.tests.health?.success ? 'text-green-600' : 'text-red-600'}>
                        {debugInfo.tests.health?.success ? '✅ OK' : '❌ Failed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>CORS Setup:</span>
                      <span className={debugInfo.tests.cors?.success ? 'text-green-600' : 'text-red-600'}>
                        {debugInfo.tests.cors?.success ? '✅ OK' : '❌ Failed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Auth Endpoint:</span>
                      <span className={debugInfo.tests.authEndpoint?.reachable ? 'text-green-600' : 'text-red-600'}>
                        {debugInfo.tests.authEndpoint?.reachable ? '✅ Reachable' : '❌ Unreachable'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Internet:</span>
                      <span className={debugInfo.device.online ? 'text-green-600' : 'text-red-600'}>
                        {debugInfo.device.online ? '✅ Online' : '❌ Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Full Details */}
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800 mb-1">
                      Show full details
                    </summary>
                    <pre className="bg-white p-2 rounded overflow-auto max-h-40 text-xs">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </details>

                  {/* Copy Button */}
                  <button
                    onClick={copyDiagnostics}
                    className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 w-full mt-2"
                  >
                    📋 Copy Full Diagnostics
                  </button>
                </div>
              )}

              {/* API URL Display */}
              <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">API:</span> {API_URL}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}