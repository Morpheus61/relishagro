import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import flavorCoreLogo from '../../assets/flavorcore-logo.png';
import { useAuth } from '../../contexts/AuthContext';

// Enhanced debug logging
const debugLog = (message: string, data?: any) => {
  console.log(`[LoginScreen DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

interface LoginScreenProps {
  onLogin: (userId: string, role: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [staffId, setStaffId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!staffId.trim()) {
      setError('Please enter your Staff ID');
      return;
    }

    debugLog('Starting login process', { staffId: staffId.trim() });
    setIsLoading(true);
    setError('');

    try {
      debugLog('Calling AuthContext login...');
      await login(staffId.trim());
      debugLog('Login successful - AuthContext will handle user state update');
      
      // The AuthContext will update the user state, which will trigger
      // the App component to re-render and show the appropriate dashboard
      
    } catch (err: any) {
      debugLog('Login error caught', err);
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

  return (
    <div className="min-h-screen bg-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="text-center mb-6">
          <img 
            src={flavorCoreLogo}
            alt="FlavorCore" 
            className="w-32 h-32 mx-auto mb-3 object-contain"
          />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Relish Agro</h2>
          <p className="text-sm text-gray-600">Agricultural Management System</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Staff ID</label>
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

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secure Access • Contact Admin for Staff ID
          </p>
        </div>

        {/* Debug Info (only in development) */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <p className="font-semibold mb-1">Debug Info:</p>
            <p>API URL: {import.meta.env.VITE_API_URL || 'https://relishagro-production.up.railway.app'}</p>
            <p>Staff ID: {staffId}</p>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  );
}