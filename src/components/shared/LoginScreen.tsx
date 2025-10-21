import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import flavorCoreLogo from '../../assets/flavorcore-logo.png';
import { useAuth } from '../../contexts/AuthContext';

const debugLog = (message: string, data?: any) => {
  console.log(`[LoginScreen] ${message}`, data || '');
};

export function LoginScreen() {
  const [staffId, setStaffId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCacheClear, setShowCacheClear] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      debugLog('User authenticated, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    if (!staffId.trim()) {
      setError('Please enter your Staff ID');
      return;
    }

    debugLog('Starting login', { staffId: staffId.trim() });
    setIsLoading(true);
    setError('');

    try {
      await login(staffId.trim());
      debugLog('Login successful');
    } catch (err: any) {
      debugLog('Login error', err);
      setError(err.message || 'Login failed. Please check your Staff ID.');
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
      alert('Cache cleared! The page will now reload.');
      window.location.reload();
    } catch (error) {
      debugLog('Error clearing cache', error);
      alert('Error clearing cache. Please try manually: DevTools → Application → Clear Storage');
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
              placeholder="Enter your Staff ID"
              value={staffId}
              onChange={(e) => {
                setStaffId(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              className={`w-full ${error ? 'border-red-500' : ''}`}
              disabled={isLoading}
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your assigned Staff ID (e.g., HF-Regu, Admin-001)
            </p>
            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
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
          
          {/* Emergency Cache Clear Button - Hidden by default */}
          <button
            onClick={() => setShowCacheClear(!showCacheClear)}
            className="text-xs text-gray-400 hover:text-gray-600 mt-2"
          >
            Having issues? Click here
          </button>
          
          {showCacheClear && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800 mb-2">
                If you're seeing old cached content:
              </p>
              <button
                onClick={clearCacheAndReload}
                className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
              >
                Clear Cache & Reload
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}